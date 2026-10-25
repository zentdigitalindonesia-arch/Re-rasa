/* Public catalog only: never store guest contacts or admin responses. */
window.CMS_CONTENT={};
(()=>{
 const key='rerasa-public-catalog-v3',maxAge=24*60*60*1000;
 function apply(rows){
  if(!Array.isArray(rows)||rows.length>200||rows.some(x=>!x||typeof x.id!=='string'||typeof x.name!=='string'||typeof x.narrative!=='string'||!Array.isArray(x.parts)||!Array.isArray(x.sources)))throw Error('Katalog tidak valid.');
  window.INSTRUMENTS.splice(0,window.INSTRUMENTS.length,...rows);window.CMS_CONTENT={};
  for(const x of rows){window.CMS_CONTENT[x.id]=x;const ids=x.sources.map((source,i)=>{const id='cms-'+x.id+'-'+i;window.EXHIBITION.sources[id]=source;return id});window.EXHIBITION.stories[x.id]={paragraphs:x.narrative.split(/\n\s*\n/),prompt:x.description,parts:x.parts.map(p=>[p.title,p.description]),sources:ids}}
 }
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&Date.now()-saved.savedAt<maxAge)apply(saved.rows)}catch{}
 window.CATALOG_READY=Promise.resolve(window.INSTRUMENTS);
 window.CATALOG_SYNC=fetch('/api/catalog',{signal:AbortSignal.timeout(6000)}).then(r=>{if(!r.ok)throw Error('Katalog server belum tersedia.');return r.json()}).then(rows=>{apply(rows);try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),rows}))}catch{}window.dispatchEvent(new Event('rerasa:catalogupdated'));return rows}).catch(e=>{window.CATALOG_ERROR=e.message;window.dispatchEvent(new Event('rerasa:catalogerror'));return window.INSTRUMENTS});
})();
