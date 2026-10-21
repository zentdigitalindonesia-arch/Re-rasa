import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {instruments,validateInstrument} from './instruments-data.js';
const root=path.dirname(fileURLToPath(import.meta.url));let errors=[];
for(const x of instruments){errors.push(...validateInstrument(x).map(e=>x.name+': '+e));for(const kind of ['thumbnail','model','audio','video']){const a=x[kind];if(!a)continue;for(const key of ['src','poster','captions'])if(a[key]&&!fs.existsSync(path.join(root,a[key])))errors.push(`${x.name}: file ${a[key]} tidak ditemukan`);if(kind==='model'&&fs.existsSync(path.join(root,a.src))){try{const b=fs.readFileSync(path.join(root,a.src));if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length||b.toString('ascii',16,20)!=='JSON')throw Error('Header GLB tidak valid');const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)).trim());for(const p of (x.model?.kind==='simulation'?x.simulationParts:x.parts.filter(p=>p.verificationStatus==='reviewed'))){const count=(json.nodes||[]).filter(n=>n.name===p.meshName).length;if(count!==1)errors.push(`${x.name}: node ${p.meshName} ditemukan ${count} kali`)} }catch(e){errors.push(`${x.name}: ${e.message}`)}}}}
if(new Set(instruments.map(x=>x.id)).size!==instruments.length)errors.push('ID instrumen ganda');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Valid: ${instruments.length} instrumen. Konfigurasi, aset lokal, dan node GLB valid; aset demo bukan dokumentasi final.`);

