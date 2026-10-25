const fs=require('node:fs'),path=require('node:path');const root=__dirname,out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
// A deterministic allowlist keeps secrets, databases, SQL and server code out of the static output.
const files=fs.readdirSync(root).filter(n=>/\.(html|css|js)$/.test(n)&&n!=='admin.html');
for(const name of files)fs.copyFileSync(path.join(root,name),path.join(out,name));
function copy(from,to){fs.mkdirSync(to,{recursive:true});for(const e of fs.readdirSync(from,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Symlinks are not allowed in the public build');if(e.name.startsWith('.')||e.name==='uploads'||e.name.startsWith('cadangan'))continue;const a=path.join(from,e.name),b=path.join(to,e.name);if(e.isDirectory())copy(a,b);else if(/\.(js|svg|png|jpg|jpeg|webp|glb|mp3|wav|ogg|mp4|webm|vtt|txt)$/.test(e.name)&&!['guests.json','ASET.txt'].includes(e.name))fs.copyFileSync(a,b)}}
for(const dir of ['assets','public'])if(fs.existsSync(path.join(root,dir)))copy(path.join(root,dir),path.join(out,dir));
for(const p of ['admin.html','catalog-seed.json','.env','store.cjs','supabase'])if(fs.existsSync(path.join(out,p)))throw Error('Unexpected private/server file in static output: '+p);
console.log('Static build ready in dist; admin.html is served only by the authenticated API.');

if(process.env.VERCEL_ENV==='production'){require('node:child_process').execFileSync(process.execPath,[path.join(root,'import-supabase.cjs')],{stdio:'inherit'});}
