const crypto=require('node:crypto');
module.exports=function(secret){
 if(!secret)throw Error('Kunci tanda tangan konser belum tersedia.');
 const seed=crypto.createHash('sha256').update('rerasa/fmti-2026/offline-ticket/v1\0').update(secret).digest();
 const privateKey=crypto.createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),seed]),format:'der',type:'pkcs8'});
 const publicKey=crypto.createPublicKey(privateKey).export({format:'der',type:'spki'}).subarray(-32);
 const id=crypto.createHash('sha256').update(publicKey).digest('hex').slice(0,16);
 return {verificationKey:{id,key:publicKey.toString('base64url')},sign(g,dates){const payload=Buffer.from(JSON.stringify({v:1,k:id,c:g.code,n:g.name,h:g.token_hash,d:dates})).toString('base64url');return payload+'.'+crypto.sign(null,Buffer.from(payload),privateKey).toString('base64url')}};
};
