const crypto=require('node:crypto');
const fail=(status,message)=>Object.assign(Error(message),{status});
function config(){
 const base=new URL(process.env.SUPABASE_URL||'invalid');
 if(base.protocol!=='https:'||base.pathname!=='/')throw Error('SUPABASE_URL harus berupa URL HTTPS proyek.');
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key||key.length<20)throw Error('Kunci server Supabase belum diatur.');
 const origin=new URL(process.env.PUBLIC_ORIGIN||'invalid');
 const local=!process.env.VERCEL&&process.env.NODE_ENV!=='production'&&['localhost','127.0.0.1'].includes(origin.hostname);
 if((origin.protocol!=='https:'&&!(local&&origin.protocol==='http:'))||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw Error('PUBLIC_ORIGIN harus berupa alamat HTTPS deployment tanpa path.');
 const username=process.env.ADMIN_USERNAME||'',password=process.env.ADMIN_PASSWORD||'';
 if(!/^[A-Za-z0-9_.-]{3,80}$/.test(username)||password.length<16)throw Error('Kredensial admin belum diatur (password minimal 16 karakter).');
 const bucket=process.env.SUPABASE_STORAGE_BUCKET||'rerasa-media';
 if(!/^[a-z0-9-]{3,63}$/.test(bucket))throw Error('Nama bucket tidak valid.');
 return {base:base.origin,key,origin:origin.origin,bucket,username,password};
}
const digest=s=>crypto.createHash('sha256').update(s).digest();
function authorize(req,res,c){const raw=req.headers.authorization||'';let valid=false;if(raw.startsWith('Basic ')&&raw.length<4096){const value=Buffer.from(raw.slice(6),'base64').toString(),i=value.indexOf(':');if(i>=0){const u=crypto.timingSafeEqual(digest(value.slice(0,i)),digest(c.username)),p=crypto.timingSafeEqual(digest(value.slice(i+1)),digest(c.password));valid=u&&p}}if(!valid){res.setHeader('WWW-Authenticate','Basic realm="RE RASA Admin", charset="UTF-8"');throw fail(401,'Masuk dengan akun pengelola.')}if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==c.origin)throw fail(403,'Origin rejected');}
module.exports={config,authorize,fail};
