/* Additional CMS fields shared by SQLite development and Supabase APIs. */
const fail=message=>Object.assign(Error(message),{status:400});
module.exports=function(out,v){
 const text=(obj,key,max)=>{const value=obj[key]??'';if(typeof value!=='string'||value.length>max)throw fail('Isian tidak valid: '+key);return value.trim()};
 for(const [key,max]of [['variant',200],['mediaCredit',1000],['mediaLicense',1000],['rights',3000],['audioTranscript',12000],['videoTranscript',12000]])out[key]=text(v,key,max);
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
