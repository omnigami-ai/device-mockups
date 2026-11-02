// Check the actual render path across looks and sizes, with external requests blocked.
import {createServer} from 'node:http';
import {readFile,writeFile,stat,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import puppeteer from 'puppeteer-core';
import {requireChrome,chromeArgs} from '../scripts/chrome.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const json=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const looks=await json('looks.json');
const opt=process.argv.indexOf('--out'),out=opt<0?path.join(root,'out'):path.resolve(process.argv[opt+1]);
const exported=JSON.parse(await readFile(path.join(out,'exports.json'),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const failures=[],resources=new Set();
const server=createServer(async(req,res)=>{
 try{
  let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(root+path.sep))throw Error('outside root');
  if((await stat(f)).isDirectory())f=path.join(f,'index.html');
  const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'};
  res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}).end(await readFile(f));
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
 browser=await puppeteer.launch({executablePath:requireChrome(),headless:true,args:['--force-color-profile=srgb','--disable-lcd-text','--font-render-hinting=none',...chromeArgs()]});
 const page=await browser.newPage();await page.setRequestInterception(true);
 page.on('request',req=>{if(req.url().startsWith(origin+'/')||req.url().startsWith('data:')||req.url().startsWith('blob:')){resources.add(req.url().replace(origin,''));req.continue();}else{failures.push('External request: '+req.url());req.abort();}});
 page.on('pageerror',e=>failures.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))failures.push('Missing: '+r.url());});
 await page.goto(origin+'/index.html?render=1');
 const draw=async look=>{
  const v={...await page.evaluate(()=>window.template.defaults()),...await json('values/'+look.id+'.json'),...exported.find(r=>r.id===look.id)?.overrides,...look,size:look.size};
  delete v.id;
  await page.evaluate(v=>window.template.prepare(v),v);
  const data=await page.evaluate(v=>{
   const c=window.template.seek(0,v),d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height).data;
   let opaque=true;for(let i=3;i<d.length;i+=4)if(d[i]!==255){opaque=false;break;}
   return {width:c.width,height:c.height,opaque,png:c.toDataURL(),audit:window.template.audit(),fields:window.template.fields};
  },v);
  if(!data.opaque)failures.push(look.id+': transparent pixels');
  if(look.id==='L2' && (data.audit.text.length!==2 || data.audit.text.some(r=>r.at360<12) || data.fields.some(r=>['primary','secondary'].includes(r.id))))
   failures.push('L2: default must have two readable outside lines and no pictured actions');
  return {hash:sha(Buffer.from(data.png.split(',')[1],'base64')),dimensions:[data.width,data.height],text:data.audit.text};
 };
 const hashes={};
 for(const look of looks)hashes[look.id]=await draw(look);
 for(const look of [...looks].reverse())if((await draw(look)).hash!==hashes[look.id].hash)failures.push(look.id+': mixed-order pixels differ');
 if(hashes.L2){
 const defaults=await page.evaluate(async()=>{
  const v={dir:'L2',size:'16:9'};await window.template.prepare(v);
  const png=window.template.seek(0,v).toDataURL(),rejected=[];
  for(const heroHierarchy of ['approved','one-action']){
   try{window.template.seek(0,{...v,heroHierarchy});rejected.push(false);}catch{rejected.push(true);}
  }
  return {png,rejected};
 });
 if(sha(Buffer.from(defaults.png.split(',')[1],'base64'))!==hashes.L2.hash)failures.push('L2: bare defaults differ from packaged values');
 if(defaults.rejected.some(r=>!r))failures.push('L2: obsolete action hierarchy is still supported');
 }
 for(const look of looks){
  const row=exported.find(r=>r.id===look.id);if(!row){failures.push(look.id+': export missing');continue;}
  const bytes=await readFile(path.join(out,row.file));
  if(bytes.toString('hex',0,8)!=='89504e470d0a1a0a')failures.push(look.id+': not PNG');
  if(sha(bytes)!==row.sha256)failures.push(look.id+': export hash mismatch');
  const dimensions=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  if(String(dimensions)!==String(hashes[look.id].dimensions))failures.push(look.id+': wrong dimensions');
  // A fresh page for each comparison: the checks above (and the previous look) leave renderer state behind, which
  // failed every look by thousands of pixels in Larchly run 2 (2026-11-02) though each export matched a fresh render.
  await page.goto(origin+'/index.html?render=1');
  const values={...await page.evaluate(()=>window.template.defaults()),...await json('values/'+look.id+'.json'),...row.overrides,size:look.size};
  const changedPixels=await page.evaluate(async({encoded,values})=>{
   await window.template.prepare(values);
   const canvas=window.template.seek(0,values),ctx=canvas.getContext('2d',{willReadFrequently:true});
   const actual=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   const image=new Image();image.src='data:image/png;base64,'+encoded;await image.decode();
   const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
   const target=copy.getContext('2d',{willReadFrequently:true});target.drawImage(image,0,0);
   const exported=target.getImageData(0,0,copy.width,copy.height).data;let count=0;
   for(let i=0;i<actual.length;i+=4)if([0,1,2,3].some(k=>actual[i+k]!==exported[i+k]))count++;
   return count;
  },{encoded:bytes.toString('base64'),values});
  if(changedPixels)failures.push(look.id+': export differs from current source ('+changedPixels+' pixels)');
  const review=await readFile(path.join(out,row.review));
  if(sha(review)!==row.reviewSha256)failures.push(look.id+': review hash mismatch');
  if(review.readUInt32BE(16)!==360||review.readUInt32BE(20)!==(look.size==='16:9'?203:640))failures.push(look.id+': wrong review dimensions');
 }
 const layout=await page.evaluate(async ids=>{
  const wide=ids.filter(id=>['L1','L2'].includes(id));
  const base={...window.template.defaults(),size:'16:9',dir:wide[0]};
  const audit=v=>{window.template.seek(0,v);return window.template.audit();};
  let unprotected=null,again=null,inspector=null,invalidRejected=null;
  // Both a right inspector and the entire desktop must survive a phone on either side.
  const cases=[];
  if(wide.length){
  await window.template.prepare(base);unprotected=audit(base).desktop;
  for(const dir of wide) for(const phoneSide of ['auto','left','right']) {
   const v={...base,dir,phoneSide,desktopProtection:[{name:'whole desktop',rect:[0,0,2880,1800]}]};
   const result=audit(v);cases.push({dir,phoneSide,...result.desktop});
  }
  inspector=audit({...base,desktopProtection:[{name:'right inspector',rect:[2300,300,580,1450]}]}).desktop;
  invalidRejected=false;
  try{audit({...base,desktopProtection:[{name:'outside capture',rect:[2870,0,100,100]}]});}catch(e){invalidRejected=/Invalid desktopProtection/.test(e.message);}
  again=audit(base).desktop;
  }
  let pair=null;
  if(ids.includes('T2')){const v={...base,dir:'T2',size:'9:16'};await window.template.prepare(v);pair=audit(v).pair;}
  return {unprotected,again,cases,inspector,invalidRejected,pair};
 },looks.map(l=>l.id));
 if(layout.cases.some(c=>c.regions.some(r=>r.occluded)))failures.push('Protected desktop content is occluded');
 if(layout.invalidRejected===false)failures.push('Invalid desktop coordinates were accepted');
 if(JSON.stringify(layout.unprotected)!==JSON.stringify(layout.again))failures.push('Protected placement leaks into a subsequent unprotected look');
 if(layout.pair&&(layout.pair.front!=='ostResult'||layout.pair.rear!=='ostRequest'))failures.push('T2 must put result in front, earlier input behind');
 let hand=null;
 if(looks.some(l=>l.id==='T3-hand')){
  // Compare against the same B lighting, not handless C2's different illumination.
  hand=await page.evaluate(async()=>{
   const values={...window.template.defaults(),size:'9:16',separation:'B'};
   await window.template.prepare(values);
   const read=dir=>{const c=window.template.seek(0,{...values,dir});return c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height).data;};
   const bare=read('T3'),grip=read('T3-hand');let protectedChanges=0,bottomChanges=0;
   const protectedRects=[[332,480,436,940],[370,1420,350,28]];
   for(const [x0,y0,w,h] of protectedRects)for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=(y*1080+x)*4;if([0,1,2].some(k=>bare[i+k]!==grip[i+k]))protectedChanges++;}
   for(let x=0;x<1080;x++){const i=(1919*1080+x)*4;if([0,1,2].some(k=>bare[i+k]!==grip[i+k]))bottomChanges++;}
   return {protectedRects,protectedChanges,bottomChanges};
  });
  if(hand.protectedChanges)failures.push('Hand changes protected app content');
  if(hand.bottomChanges<50)failures.push('Hand does not continue through bottom edge');
 }
 const report={looks:hashes,resources:[...resources].filter(u=>u.startsWith('/')).sort(),layout,hand,failures};
 await mkdir(out,{recursive:true});await writeFile(path.join(out,'package-checks.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 if(failures.length)process.exitCode=1;
}finally{await browser?.close();await new Promise(r=>server.close(r));}
