const fs=require('node:fs'),path=require('node:path');
async function migrate({base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,fetcher=fetch,rows=require('./content-import.json')}={}){
 if(!base||!key)throw Error('Content import needs configured Supabase environment');
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 const request=async(route,options={})=>{const r=await fetcher(base+route,{headers,...options,signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Content import failed: HTTP '+r.status);const text=await r.text();return text?JSON.parse(text):null};
 const current=await request('/rest/v1/rerasa_instruments?select=id,content,version');let updated=0;
 for(const row of rows){const prev=current.find(r=>r.id===row.id);if(prev?.content?.sourceImportVersion===row.sourceImportVersion)continue;
  // Preserve curator models and placed hotspots; only replace source content and media supplied for this import.
  const content={...prev?.content,...row,...(prev?.content?.modelUrl?{modelUrl:prev.content.modelUrl,modelType:prev.content.modelType,modelKind:prev.content.modelKind,explodable:prev.content.explodable,parts:prev.content.parts}: {})};
  if(prev)await request('/rest/v1/rpc/rerasa_save_instrument',{method:'POST',body:JSON.stringify({p_id:row.id,p_content:content,p_expected_version:prev.version})});
  else await request('/rest/v1/rerasa_instruments?on_conflict=id',{method:'POST',headers:{...headers,Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({id:row.id,content,version:1})});updated++;
 }
 for(const id of ['alosu','popondi','suling-lembang','rebana']){const prev=current.find(r=>r.id===id);if(prev&&!rows.some(r=>r.id===id))await request('/rest/v1/rerasa_instruments?id=eq.'+id+'&version=eq.'+prev.version,{method:'DELETE'});}
 const {sourceFingerprint}=await import('./translation-fingerprint.js');const english=require('./catalog-english.json'),latest=await request('/rest/v1/rerasa_instruments?select=id,content,version');for(const item of latest){const en=english[item.id];if(!en||sourceFingerprint(item.content)!==en.sourceFingerprint||item.content.sourceEnglishFingerprint===en.sourceFingerprint)continue;const content={...item.content,descriptionEn:en.description,narrativeEn:en.narrative,identityEn:en.identity,sectionsEn:en.sections,rightsEn:en.rights,sourceEnglishFingerprint:en.sourceFingerprint};await request('/rest/v1/rpc/rerasa_save_instrument',{method:'POST',body:JSON.stringify({p_id:item.id,p_content:content,p_expected_version:item.version})});}
 const mediaRows=await request('/rest/v1/rerasa_instruments?select=id,content,version');for(const patch of require('./additional-media.json')){const item=mediaRows.find(x=>x.id===patch.id);if(!item||item.content.sourceAdditionalMediaVersion===patch.version)continue;const hasVideo=Boolean(item.content.video)||item.content.videos?.some(v=>v.src);if(hasVideo)continue;const content={...item.content,video:patch.media.src,poster:patch.media.poster,videos:[patch.media],videoKind:'recording',sourceAdditionalMediaVersion:patch.version};await request('/rest/v1/rpc/rerasa_save_instrument',{method:'POST',body:JSON.stringify({p_id:item.id,p_content:content,p_expected_version:item.version})});updated++;}
 return updated;
}
module.exports=migrate;
if(require.main===module)migrate().then(n=>console.log('Source catalog imported: '+n+' records.')).catch(()=>{console.error('Source catalog import failed. Check Supabase permissions and schema; no secrets are logged.');process.exitCode=1});
