import {simulationParts} from './simulation-parts.js';
/** @typedef {{src:string,credit:string,license:string,approved:boolean,transcript?:string,poster?:string,captions?:string,kind?:'simulation'}} MediaAsset */
/** @typedef {{id:string,title:string,url:string,note:string}} ReferenceSource */
/** @typedef {{id:string,meshName:string|null,anchor:number[]|null,explodeOffset:number[]|null,title:string,material:string,function:string,verificationStatus:'draft'|'reviewed',sourceIds:string[]}} InstrumentPart */
/** @typedef {{id:string,slug:string,name:string,category:string,region:string,variant:string|null,description:string,thumbnail:MediaAsset|null,model:MediaAsset|null,audio:MediaAsset|null,video:MediaAsset|null,parts:InstrumentPart[],sources:ReferenceSource[],rights:string,status:string,explodable:boolean}} Instrument */
const part=(id,title,sourceIds)=>({id,meshName:null,anchor:null,explodeOffset:null,title,material:'Belum didokumentasikan pada objek rujukan.',function:'Catatan fungsi menunggu pemeriksaan objek dan narasumber.',verificationStatus:'draft',sourceIds});
const source=(id,title,url,note='Rujukan riset dari paket pengelola; isi, kesesuaian objek, dan hak penggunaan belum diperiksa.')=>({id,title,url,note});
/** @type {Instrument[]} */
export const instruments=[
{id:'gandrang',slug:'gandrang',name:'Gandrang',category:'Membranofon',description:'Ruang kajian instrumen dengan membran sebagai sumber getaran. Pemilihan varian dan dokumentasi objek sedang disiapkan.',sources:[source('g-kemdikbud','Gandrang — Kemdikbud','https://kebudayaan.kemdikbud.go.id/bpnbsulsel/gandrang-alat-musik-tradisional-makassar/')],parts:[part('badan','Badan',['g-kemdikbud']),part('membran','Membran',['g-kemdikbud']),part('pengikat','Pengikat / pengencang',['g-kemdikbud'])]},
{id:'kacaping',slug:'kacaping',name:'Kacaping',category:'Kordofon',description:'Ruang kajian instrumen dengan dawai sebagai sumber getaran. Bentuk dan bagian akan mengikuti spesimen Bugis atau Makassar yang terdokumentasi.',sources:[source('k-garuda','Kajian Kacaping Makassar — Garuda','https://download.garuda.kemdikbud.go.id/article.php?article=1683065&title=Komponen+Belo-Belo+dalam+Kacaping+Makassar+Hasil+penalaran+induktif+sebuah+pengalaman+empirik+untuk+menemukan+unsur+pembentuk+Belo-Belo&val=14001'),source('k-koleksi','Spesimen kacapi — Universität Würzburg','https://www.musikwissenschaft.uni-wuerzburg.de/musikinstrumente/bestand/inventarliste/fos34-kacapi/')],parts:[part('badan','Badan / ruang resonansi',['k-garuda']),part('dawai','Dawai',['k-garuda']),part('penyangga','Penyangga dawai',['k-garuda'])]},
{id:'puik-puik',slug:'puik-puik',name:'Puik-puik',category:'Aerofon',description:'Ruang kajian instrumen tiup. Sumber getar, orientasi badan, dan bagian lainnya akan dicocokkan dengan dokumentasi objek Makassar.',sources:[source('p-ik','Terompet tradisional asli Makassar — Indonesia Kaya','https://indonesiakaya.com/pustaka-indonesia/terompet-tradisional-asli-makassar/')],parts:[part('reed','Reed / sumber getar',['p-ik']),part('badan','Badan dan lubang nada',['p-ik']),part('corong','Corong',['p-ik'])]},
{id:'gong',slug:'gong',name:'Gong',category:'Idiofon',description:'Ruang kajian instrumen dengan tubuh benda sebagai sumber getaran. Varian dan objek dari Sulawesi Selatan masih perlu ditentukan.',sources:[source('o-isi','Telaah gong — repositori ISI','https://digilib.isi.ac.id/3610/')],parts:[part('badan','Badan logam dan tepi',['o-isi']),part('pencu','Pencu, bila terdapat pada objek',['o-isi']),part('penggantung','Tali penggantung, bila terdokumentasi',['o-isi'])]}
].map(x=>({...x,region:'Sulawesi Selatan — konteks koleksi; asal spesimen belum ditetapkan',variant:null,thumbnail:null,model:null,audio:null,video:null,rights:'Belum ada aset yang disetujui untuk publikasi pada modul ini.',status:'draft',explodable:false}));

// All demo assets are authored for this project. They are not collection documentation.
for(const x of instruments){
 const base='public/instruments/'+x.slug+'/';
 const asset=(src)=>({src:base+src,credit:'RE’RASA · aset demo prosedural',license:'Dibuat untuk proyek RE’RASA; tanpa aset pihak ketiga',approved:true,kind:'simulation'});
 x.thumbnail=asset('references/demo.svg');
 x.model=asset('model/demo.glb');
 x.audio={...asset('media/demo.wav'),transcript:'SIMULASI: rangkaian nada sintetis untuk memperagakan getaran. Bukan rekaman '+x.name+' atau permainan musisi.'};
 x.video={...asset('media/demo.webm'),poster:base+'references/demo.svg',transcript:'SIMULASI: animasi ilustrasi geometris generik '+x.name+' tanpa suara. Tidak memperlihatkan artefak atau pemain asli.'};
 x.simulationParts=simulationParts[x.slug];x.explodable=x.id!=='gong';
 x.rights='Ilustrasi vektor, model geometris, nada sintetis, dan animasi lokal dibuat untuk proyek RE’RASA. Semua berlabel SIMULASI. Dokumentasi dan izin spesimen asli belum tersedia.';
}

export function validateInstrument(x){
 const errors=[],vector=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
 if(!/^[a-z0-9-]+$/.test(x.slug)||x.id!==x.slug)errors.push('ID/slug tidak valid');
 if(!x.name||!['Membranofon','Kordofon','Aerofon','Idiofon'].includes(x.category))errors.push('Nama/kategori tidak valid');
 const sources=new Set(x.sources.map(s=>s.id)),ids=new Set();
 if(x.model?.kind==='simulation')for(const p of x.simulationParts||[]){if(p.verificationStatus!=='simulation'||(!p.meshName&&p.anchorSpace!=='display')||!vector(p.anchor)||!vector(p.explodeOffset))errors.push('Konfigurasi simulasi tidak valid');}
 for(const s of x.sources)if(!/^https?:\/\//.test(s.url))errors.push('URL sumber tidak valid');
 for(const p of x.parts){if(ids.has(p.id))errors.push('ID bagian ganda');ids.add(p.id);if(!['draft','reviewed'].includes(p.verificationStatus))errors.push('Status bagian tidak valid');if(p.anchor!==null&&!vector(p.anchor)||p.explodeOffset!==null&&!vector(p.explodeOffset))errors.push('Koordinat tidak valid');if(p.sourceIds.some(id=>!sources.has(id)))errors.push('Sumber bagian tidak ditemukan');if(p.verificationStatus==='reviewed'&&!p.sourceIds.length)errors.push('Bagian terverifikasi memerlukan sumber');}
 for(const [kind,a]of Object.entries({thumbnail:x.thumbnail,model:x.model,audio:x.audio,video:x.video}))if(a){const base=`public/instruments/${x.slug}/${kind==='thumbnail'?'references':kind==='model'?'model':'media'}/`;if((!x.catalogManaged&&!a.src.startsWith(base))||a.src.includes('..')||/[?#\\]/.test(a.src)||!a.approved||!a.credit||!a.license)errors.push('Aset/izin tidak valid: '+kind);if(['audio','video'].includes(kind)&&!a.transcript)errors.push('Transkrip belum tersedia: '+kind);for(const key of ['poster','captions'])if(a[key]&&((!x.catalogManaged&&!a[key].startsWith(`public/instruments/${x.slug}/`))||a[key].includes('..')||/[?#\\]/.test(a[key])))errors.push('Jalur media tidak valid');}
 return errors;
}

