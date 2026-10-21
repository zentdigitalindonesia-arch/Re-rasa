/* Keep the entrance free of Three.js. Existing model callers retain their controller API. */
(()=>{
 const create=window.RerasaModel;let ready;
 function load(){return ready??=new Promise((resolve,reject)=>{if(window.THREE)return resolve();const script=document.createElement('script');script.src='assets/three.min.js';script.onload=resolve;script.onerror=()=>{ready=null;reject(Error('Pustaka 3D gagal dimuat.'))};document.head.appendChild(script)})}
 window.RerasaModel=function(host,item,parts,options={}){
  let instance=null,disposed=false;const queued=new Map();
  host.innerHTML='<p class="model-loading" role="status">Menyiapkan tampilan 3D…</p>';
  const promise=load().then(async()=>{if(item.modelUrl){window.MODEL_LOADER_READY??=import('./assets/vendor/loaders/GLTFLoader.js').then(m=>{window.RerasaGLTFLoader=m.GLTFLoader});await window.MODEL_LOADER_READY}if(disposed)return;host.replaceChildren();instance=create(host,item,parts,options);for(const [key,args]of queued)instance[key]?.(...args);queued.clear();return instance}).catch(error=>{if(!disposed){host.innerHTML='<p role="status">Tampilan 3D belum dapat dibuka. Gunakan ilustrasi dan informasi bagian yang tersedia.</p>';options.onError?.(error.message)}return null});
  const controller={dispose(){disposed=true;queued.clear();instance?.dispose()},getHotspots(){return instance?.getHotspots?.()||[]},snapshot(){if(!instance)throw Error('Model masih dimuat. Coba lagi sebentar.');return instance.snapshot?.()},async record(){const model=await promise;if(!model||disposed)throw Error('Model belum tersedia');return model.record?.()}};
  for(const key of ['select','setSpread','setRotation','setAuto','reset','resetHotspot'])controller[key]=(...args)=>{if(disposed)return;if(instance)return instance[key]?.(...args);if(key==='reset')queued.clear();queued.set(key,args)};
  return controller;
 };
})();
