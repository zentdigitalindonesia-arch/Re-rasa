const path=require('node:path'),crypto=require('node:crypto');
module.exports=function(root){
 const production=process.env.NODE_ENV==='production';
 const dataDir=path.resolve(process.env.DATA_DIR||path.join(root,'.rerasa-private'));
 const uploadDir=process.env.DATA_DIR?path.join(dataDir,'uploads'):path.join(root,'assets','uploads');
 let origin='';const username=process.env.ADMIN_USERNAME||'',password=process.env.ADMIN_PASSWORD||'';
 if(production){
  if(!process.env.DATA_DIR||dataDir===root||dataDir.startsWith(root+path.sep))throw Error('Production requires DATA_DIR outside the application directory.');
  const parsed=new URL(process.env.PUBLIC_ORIGIN||process.env.RENDER_EXTERNAL_URL||'invalid');
  if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash)throw Error('PUBLIC_ORIGIN must be an HTTPS origin without a path.');
  origin=parsed.origin;
  if(!/^[A-Za-z0-9_.-]{3,80}$/.test(username)||password.length<16)throw Error('Configure ADMIN_USERNAME and ADMIN_PASSWORD (at least 16 characters).');
 }
 const hash=s=>crypto.createHash('sha256').update(s).digest();
 function authenticated(req){const header=req.headers.authorization||'';if(!header.startsWith('Basic ')||header.length>4096)return false;const raw=Buffer.from(header.slice(6),'base64').toString('utf8'),colon=raw.indexOf(':');if(colon<0)return false;const userOK=crypto.timingSafeEqual(hash(raw.slice(0,colon)),hash(username)),passOK=crypto.timingSafeEqual(hash(raw.slice(colon+1)),hash(password));return userOK&&passOK}
 function adminPath(pathname,method){return pathname==='/admin.html'||pathname.startsWith('/api/admin/')||(pathname==='/api/guests'&&method==='GET')}
 function guard(req,res,pathname){
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');
  if(!production)return true;
  res.setHeader('Strict-Transport-Security','max-age=31536000');
  if(adminPath(pathname,req.method)){
   res.setHeader('Cache-Control','no-store');
   if(!authenticated(req)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="RE RASA Admin", charset="UTF-8"','Content-Type':'text/plain; charset=utf-8'});res.end('Masuk dengan akun pengelola.');return false}
   if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin){res.writeHead(403);res.end('Origin rejected');return false}
  }
  return true;
 }
 function assetFile(relative){if(relative.startsWith('assets/uploads/')){const name=relative.slice('assets/uploads/'.length);if(!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|mp3|wav|ogg|mp4|webm|glb)$/.test(name))throw Object.assign(Error('Jalur unggahan tidak valid'),{status:400});return path.join(uploadDir,name)}return path.join(root,relative)}
 return {production,dataDir,uploadDir,origin,guard,assetFile};
};
