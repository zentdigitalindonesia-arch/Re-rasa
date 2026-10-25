/* Additional CMS fields shared by SQLite development and Supabase APIs. */
const fail=message=>Object.assign(Error(message),{status:400});
module.exports=function(out,v){
 const text=(obj,key,max)=>{const value=obj[key]??'';if(typeof value!=='string'||value.length>max)throw fail('Isian tidak valid: '+key);return value.trim()};
 for(const [key,max]of [['variant',200],['mediaCredit',1000],['mediaLicense',1000],['rights',3000],['audioTranscript',12000],['videoTranscript',12000]])out[key]=text(v,key,max);
 if(typeof v.sourceImportVersion==='string'&&/^aset-web-[a-z0-9-]+$/.test(v.sourceImportVersion))out.sourceImportVersion=v.sourceImportVersion;
 out.identity={};for(const [key,value]of Object.entries(v.identity||{}).slice(0,24)){if(key.length>100||typeof value!=='string'||value.length>2000)throw fail('Identitas instrumen tidak valid.');out.identity[key]=value;}
 out.sections=(Array.isArray(v.sections)?v.sections:[]).slice(0,100).map(s=>{if(typeof s.heading!=='string'||s.heading.length>500||!Array.isArray(s.paragraphs)||s.paragraphs.some(p=>typeof p!=='string'||p.length>10000))throw fail('Bagian penjelasan tidak valid.');return {heading:s.heading,level:[2,3,4].includes(s.level)?s.level:2,paragraphs:s.paragraphs}});
 out.identityEn={};for(const [key,value]of Object.entries(v.identityEn||{}).slice(0,24)){if(key.length>100||typeof value!=='string'||value.length>2000)throw fail('English identity is invalid.');out.identityEn[key]=value;}
 out.sectionsEn=(Array.isArray(v.sectionsEn)?v.sectionsEn:[]).slice(0,100).map(s=>{if(typeof s.heading!=='string'||s.heading.length>500||!Array.isArray(s.paragraphs)||s.paragraphs.some(p=>typeof p!=='string'||p.length>10000))throw fail('English section is invalid.');return {heading:s.heading,level:[2,3,4].includes(s.level)?s.level:2,paragraphs:s.paragraphs}});out.rightsEn=text(v,'rightsEn',3000);if(typeof v.sourceEnglishFingerprint==='string'&&/^[a-f0-9]{1,8}$/.test(v.sourceEnglishFingerprint))out.sourceEnglishFingerprint=v.sourceEnglishFingerprint;
 out.editorVersion=v.editorVersion===2?2:1;out.mediaApproved=v.mediaApproved===true;out.useDemoAssets=v.useDemoAssets!==false;out.explodable=v.explodable===true&&out.modelType!=='gong';
 out.modelKind=v.modelKind==='simulation'?'simulation':'uploaded';
 if(out.editorVersion===2&&out.published&&(!out.mediaApproved||!out.mediaCredit||!out.mediaLicense))throw fail('Untuk menerbitkan, isi kredit dan izin media lalu konfirmasi hak penggunaan. Draf tetap dapat disimpan.');
 for(let i=0;i<out.parts.length;i++){
  const p=out.parts[i],raw=v.parts[i];p.material=text(raw,'material',500);p.meshName=text(raw,'meshName',160)||null;
  p.verificationStatus=raw.verificationStatus==='reviewed'?'reviewed':'draft';
  p.sourceIndexes=Array.isArray(raw.sourceIndexes)?[...new Set(raw.sourceIndexes)]:[];
  if(p.sourceIndexes.some(n=>!Number.isInteger(n)||n<0||n>=out.sources.length))throw fail('Nomor sumber hotspot tidak valid. Nomor harus merujuk daftar sumber instrumen.');
  const offset=raw.explodeOffset;if(offset!=null&&(!Array.isArray(offset)||offset.length!==3||offset.some(n=>!Number.isFinite(n)||Math.abs(n)>10)))throw fail('Offset bongkar-rakit tidak valid.');p.explodeOffset=offset||null;
  if(p.verificationStatus==='reviewed'&&(!p.sourceIndexes.length||!p.material||!p.position))throw fail('Hotspot terverifikasi memerlukan sumber, bahan, dan posisi yang sudah ditentukan.');
 }
 return out;
};
