const {fail}=require('./cloud-config.cjs');
module.exports=function(c,fetcher=fetch){
 async function call(route,{method='GET',body,headers={}}={}){
  const response=await fetcher(c.base+route,{method,headers:{apikey:c.key,Authorization:'Bearer '+c.key,...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  const text=await response.text();let data;try{data=text?JSON.parse(text):null}catch{data=null}
  if(!response.ok){if(data?.code==='40001')throw fail(409,'Konten berubah di tab lain. Muat ulang sebelum menyimpan.');throw fail(503,'Supabase belum dapat memproses permintaan. Periksa konfigurasi, skema, dan koneksi.');}
  return {data,response};
 }
 const rest=(name,q)=>'/rest/v1/'+name+'?'+new URLSearchParams(q).toString();
 const guest=g=>({code:g.code,name:g.name,contact:g.contact,city:g.city,type:g.type,affiliation:g.affiliation,createdAt:g.created_at});
 return {
  async catalog(admin=false){const {data}=await call(rest('rerasa_instruments',{select:'*',order:'id.asc',...(!admin?{'content->>published':'eq.true'}:{})}));return data.map(r=>({...r.content,version:r.version,updatedAt:r.updated_at}));},
  async saveInstrument(id,content,version){const {data}=await call('/rest/v1/rpc/rerasa_save_instrument',{method:'POST',body:{p_id:id,p_content:content,p_expected_version:version??null}});const r=Array.isArray(data)?data[0]:data;return {...r.content,version:r.version,updatedAt:r.updated_at};},
  async register(g){const {data}=await call('/rest/v1/rpc/rerasa_register_guest',{method:'POST',body:{p_code:g.code,p_name:g.name,p_contact:g.contact,p_city:g.city,p_type:g.type,p_affiliation:g.affiliation,p_request_id:g.requestId}});const r=Array.isArray(data)?data[0]:data;return {code:r.code,name:r.name,city:r.city,createdAt:r.created_at};},
  async guests(url,exportAll=false){const page=Math.max(1,Math.min(100000,parseInt(url.searchParams.get('page'))||1)),q={select:'code,name,contact,city,type,affiliation,created_at',order:'created_at.desc',limit:exportAll?'2000':'50',offset:exportAll?'0':String((page-1)*50)};
   const term=(url.searchParams.get('q')||'').slice(0,120).replace(/[^\p{L}\p{N}\s@._-]/gu,'').trim();if(term)q.or='(name.ilike.*'+term+'*,city.ilike.*'+term+'*,affiliation.ilike.*'+term+'*,code.ilike.*'+term+'*)';
   const type=url.searchParams.get('type');if(type)q.type='eq.'+type;
   const conditions=[];for(const [key,op,time]of [['from','gte','00:00:00'],['to','lte','23:59:59.999']]){const v=url.searchParams.get(key);if(v&&/^\d{4}-\d{2}-\d{2}$/.test(v))conditions.push('created_at.'+op+'.'+v+'T'+time+'+08:00')};if(conditions.length)q.and='('+conditions.join(',')+')';
   const [{data,response},totalResponse]=await Promise.all([call(rest('rerasa_guests',q),{headers:{Prefer:'count=exact'}}),call(rest('rerasa_guests',{select:'code',limit:'0'}),{headers:{Prefer:'count=exact'}})]);
   const total=Number(response.headers.get('content-range')?.split('/')[1]||0),allTotal=Number(totalResponse.response.headers.get('content-range')?.split('/')[1]||0);
   if(exportAll&&total>2000)throw fail(413,'Ekspor dibatasi 2.000 baris per permintaan. Persempit rentang tanggal atau gunakan ekspor privat di Supabase.');
   let all=data;if(exportAll&&all.length<total){let offset=all.length;while(offset<total){const next=await call(rest('rerasa_guests',{...q,offset:String(offset),limit:'500'}));if(!next.data.length)throw fail(503,'Ekspor belum lengkap. Coba lagi.');all=all.concat(next.data);offset=all.length;}}
   return {rows:all.map(guest),total,allTotal,page,pages:Math.max(1,Math.ceil(total/50))};
  },
  async getTranslation(hash){const {data}=await call(rest('rerasa_translations',{select:'translated',hash:'eq.'+hash,limit:'1'}));return data[0];},
  async putTranslation(hash,source,translated){await call('/rest/v1/rerasa_translations?on_conflict=hash',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:{hash,source,translated}});},
  async signUpload(name){const {data}=await call('/storage/v1/object/upload/sign/'+c.bucket+'/'+name,{method:'POST',body:{}});const signed=new URL(c.base+'/storage/v1'+data.url);if(signed.origin!==c.base||!signed.searchParams.get('token'))throw fail(503,'Tautan unggah tidak valid.');return signed.href;},
  async objectExists(name){const response=await fetcher(c.base+'/storage/v1/object/info/'+c.bucket+'/'+name,{headers:{apikey:c.key,Authorization:'Bearer '+c.key},signal:AbortSignal.timeout(10000)});return response.ok;},
  publicURL(name){return c.base+'/storage/v1/object/public/'+c.bucket+'/'+name;}
 };
};
