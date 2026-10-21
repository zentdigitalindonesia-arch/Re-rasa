import * as T from 'three';
import {GLTFLoader} from './assets/vendor/loaders/GLTFLoader.js';

export async function createViewer(host,item,{onSelect,onStatus,signal}){
 const scene=new T.Scene();scene.background=new T.Color('#e4e5d9');
 const camera=new T.PerspectiveCamera(40,1,.01,200),renderer=new T.WebGLRenderer({antialias:devicePixelRatio<2});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label',item.name+'; panah untuk putar, Shift panah untuk pan, plus minus untuk zoom, R untuk reset');canvas.setAttribute('role','img');
 scene.add(new T.HemisphereLight(0xffffff,0x665c45,2));const light=new T.DirectionalLight(0xfff4db,3);light.position.set(3,5,7);scene.add(light);
 const wrapper=new T.Group();scene.add(wrapper);let root=null,dead=false,raf=0,auto=false,visible=true,spread=0,targetSpread=0,yaw=.2,pitch=1.3,distance=7,last=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),target=new T.Vector3(),goal=new T.Vector3(),nodes=[],buttons=[],materials=new Set(),pointers=new Map();
 const disposeTree=o=>o?.traverse(n=>{n.geometry?.dispose();for(const m of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()}});
 function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);signal?.removeEventListener('abort',dispose);buttons.forEach(b=>b.el.remove());disposeTree(root);materials.forEach(m=>m.dispose());canvas.removeEventListener('webglcontextlost',lost);renderer.dispose();renderer.forceContextLoss();canvas.remove();}
 function lost(e){e.preventDefault();onStatus('Konteks WebGL terputus. Tekan Buka model 3D untuk mencoba kembali.');dispose();const b=document.querySelector('#load');if(b)b.disabled=false;['reset','auto','explode','apart','assemble'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=true})}
 canvas.addEventListener('webglcontextlost',lost);
 const resize=()=>{if(dead)return;const w=host.clientWidth||640,h=host.clientHeight||420;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);
 function visibility(){last=0}document.addEventListener('visibilitychange',visibility);signal?.addEventListener('abort',dispose,{once:true});
 try{
 if(signal?.aborted)throw Error('Dibatalkan');
 const loader=new GLTFLoader();loader.manager.setURLModifier(url=>{if(/^(blob:|data:)/.test(url))return url;const parsed=new URL(url,location.href);if(parsed.origin!==location.origin&&parsed.origin!==new URL(item.model.src,location.href).origin)throw Error('Model harus memakai origin media sendiri atau tekstur tertanam.');return parsed.href});
 const gltf=await loader.loadAsync(item.model.src,e=>{if(!dead)onStatus(e.total?`Memuat model: ${Math.round(e.loaded/e.total*100)}%`:`Memuat model: ${Math.round(e.loaded/1024)} KB`)});
 if(dead||signal?.aborted){disposeTree(gltf.scene);throw Error('Dibatalkan')}
 root=gltf.scene;
 const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),extent=Math.max(size.x,size.y,size.z);if(!Number.isFinite(extent)||extent<=0)throw Error('Model tidak memiliki geometri yang dapat ditampilkan.');
 // Normalize a wrapper; all authored node transforms and local anchors remain intact.
 wrapper.add(root);wrapper.scale.setScalar(4/extent);wrapper.position.copy(box.getCenter(new T.Vector3())).multiplyScalar(-4/extent);
 root.traverse(n=>{if(n.isMesh){n.material=Array.isArray(n.material)?n.material.map(m=>m.clone()):n.material.clone();for(const m of Array.isArray(n.material)?n.material:[n.material])materials.add(m)}});
 const displayedParts=item.model?.kind==='simulation'?item.simulationParts:item.parts.filter(p=>p.verificationStatus==='reviewed');
 const partNodes=displayedParts.map(p=>{const matches=[];root.traverse(n=>{if(n.name===p.meshName)matches.push(n)});return {p,node:matches.length===1?matches[0]:null,display:p.anchorSpace==='display'}});
 const valid=partNodes.filter(({p,node,display})=>(node||display)&&p.anchor);const invalid=partNodes.filter(({node,display})=>!node&&!display);
 const isAncestor=(a,b)=>{for(let p=b.parent;p;p=p.parent)if(p===a)return true;return false};
 const canExplode=item.id!=='gong'&&item.explodable&&partNodes.length>1&&partNodes.every(({p,node})=>node&&p.explodeOffset)&&new Set(partNodes.map(v=>v.node)).size===partNodes.length&&!partNodes.some((a,i)=>partNodes.some((b,j)=>i!==j&&isAncestor(a.node,b.node)));
 if(canExplode)partNodes.forEach(({p,node})=>nodes.push({node,base:node.position.clone(),offset:new T.Vector3(...p.explodeOffset)}));
 host.replaceChildren(canvas);observer.observe(host);resize();
 for(const {p,node,display}of valid){const el=document.createElement('button');el.className='hotspot';el.textContent=String(buttons.length+1);el.setAttribute('aria-label',p.title);el.onclick=()=>onSelect(p.id);host.appendChild(el);buttons.push({p,node,display,el})}
 function reset(){yaw=.2;pitch=1.3;distance=camera.aspect<1?9:7;target.set(0,0,0);goal.set(0,0,0);auto=false;spread=targetSpread=0;nodes.forEach(n=>n.node.position.copy(n.base));materials.forEach(m=>m.emissive?.setHex(0));buttons.forEach(b=>b.el.setAttribute('aria-pressed','false'));}
 const pan=(dx,dy)=>{goal.x=T.MathUtils.clamp(goal.x-dx*distance*.0015,-2,2);goal.y=T.MathUtils.clamp(goal.y+dy*distance*.0015,-2,2)};
 canvas.onpointerdown=e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);canvas.focus()};
 canvas.onpointermove=e=>{const prev=pointers.get(e.pointerId);if(!prev)return;const next={x:e.clientX,y:e.clientY};if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1];const old=Math.hypot(prev.x-other.x,prev.y-other.y),now=Math.hypot(next.x-other.x,next.y-other.y);distance=T.MathUtils.clamp(distance*old/Math.max(now,1),3,15);pan((next.x-prev.x)/2,(next.y-prev.y)/2)}else if(e.shiftKey||e.buttons===2)pan(next.x-prev.x,next.y-prev.y);else{yaw-=(next.x-prev.x)*.008;pitch=T.MathUtils.clamp(pitch+(next.y-prev.y)*.008,.15,Math.PI-.15)}pointers.set(e.pointerId,next)};
 canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=e=>pointers.delete(e.pointerId);canvas.oncontextmenu=e=>e.preventDefault();canvas.addEventListener('wheel',e=>{e.preventDefault();distance=T.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),3,15)},{passive:false});
 canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'].includes(e.key))return;e.preventDefault();if(e.key.toLowerCase()==='r')reset();else if(e.key==='+'||e.key==='=')distance=Math.max(3,distance-.5);else if(e.key==='-')distance=Math.min(15,distance+.5);else if(e.shiftKey)pan(e.key==='ArrowRight'?30:e.key==='ArrowLeft'?-30:0,e.key==='ArrowDown'?30:e.key==='ArrowUp'?-30:0);else{yaw+=e.key==='ArrowRight'?.15:e.key==='ArrowLeft'?-.15:0;pitch=T.MathUtils.clamp(pitch+(e.key==='ArrowDown'?.15:e.key==='ArrowUp'?-.15:0),.15,Math.PI-.15)}};
 function frame(time){if(dead)return;raf=requestAnimationFrame(frame);const dt=last?Math.min((time-last)/1000,.05):0;last=time;if(!visible||document.hidden)return;const ease=reduced.matches?1:1-Math.exp(-dt*10);if(auto&&!reduced.matches)yaw+=dt*.25;target.lerp(goal,ease);spread=T.MathUtils.lerp(spread,targetSpread,ease);nodes.forEach(n=>n.node.position.copy(n.base).addScaledVector(n.offset,spread));camera.position.setFromSphericalCoords(distance,pitch,yaw).add(target);camera.lookAt(target);scene.updateMatrixWorld(true);camera.updateMatrixWorld();for(const b of buttons){const v=(b.display?new T.Vector3(...b.p.anchor):b.node.localToWorld(new T.Vector3(...b.p.anchor))).project(camera);b.el.hidden=v.z< -1||v.z>1;b.el.style.left=T.MathUtils.clamp((v.x*.5+.5)*host.clientWidth-22,4,host.clientWidth-48)+'px';b.el.style.top=T.MathUtils.clamp((-v.y*.5+.5)*host.clientHeight-22,4,host.clientHeight-48)+'px'}renderer.render(scene,camera)}
 reset();raf=requestAnimationFrame(frame);onStatus(invalid.length?'Model siap. Sebagian hotspot dinonaktifkan karena nama node tidak cocok.':'Model siap.');
 return {explodable:canExplode,explodeReason:canExplode?'Bongkar-rakit menggunakan offset node dalam koordinat induk; reset mengembalikan transform asli.':item.id==='gong'?'Badan dan pencu tidak dipisah. Lihat diagram penampang generik pada tab Organologi.':'Bongkar-rakit nonaktif: perlu persetujuan konfigurasi, sedikitnya dua node unik tanpa hubungan induk-anak, serta offset terverifikasi.',setVisible(v){visible=v;last=0;resize()},setAuto(v){auto=v;if(v&&reduced.matches)onStatus('Preferensi kurangi gerakan aktif; putar otomatis dinonaktifkan.')},setSpread(v){targetSpread=canExplode?T.MathUtils.clamp(v,0,1):0},reset,select(id){const b=buttons.find(b=>b.p.id===id);if(!b)return;materials.forEach(m=>m.emissive?.setHex(0));b.node?.traverse(n=>{for(const m of Array.isArray(n.material)?n.material:n.material?[n.material]:[])m.emissive?.setHex(0x33451c)});buttons.forEach(v=>v.el.setAttribute('aria-pressed',String(v===b)));goal.copy(b.display?new T.Vector3(...b.p.anchor):b.node.localToWorld(new T.Vector3(...b.p.anchor)));goal.clampScalar(-2,2)},dispose};
 }catch(e){dispose();throw e}
}

