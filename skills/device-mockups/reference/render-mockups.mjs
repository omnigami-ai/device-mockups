// Export the manifest's stills using only this package and its bundled house scripts.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const option=(key,fallback)=>{const i=args.indexOf('--'+key);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw Error(`--${key} needs a value`);return args[i+1];};
const selected=option('look',null),out=path.resolve(option('out',path.join(here,'out')));
const overrideFile=option('values',null);
if(overrideFile&&!selected)throw Error('--values needs --look so a direction proposal cannot change every default');
const overrides=overrideFile?JSON.parse(readFileSync(path.resolve(overrideFile),'utf8')):{};
const looks=JSON.parse(readFileSync(path.join(here,'looks.json'),'utf8')).filter(l=>!selected||l.id===selected);
if(!looks.length)throw Error('No matching look');
mkdirSync(out,{recursive:true});
function run(command,argv,log){
 const r=spawnSync(command,argv,{encoding:'utf8',maxBuffer:16*1024*1024});
 const text=(r.stdout||'')+(r.stderr||'');if(log)writeFileSync(log,text);
 process.stdout.write(text);
 if(r.error||r.status!==0)throw r.error||Error(`${command} failed (${r.status}); see ${log||'output'}`);
}
const records=[];
for(const look of looks){
 const dir=path.join(out,look.id);mkdirSync(dir,{recursive:true});
 const flags=['check','check-fresh','stress'].filter(f=>args.includes('--'+f)).map(f=>'--'+f);
 const values={...JSON.parse(readFileSync(path.join(here,'values',look.id+'.json'),'utf8')),...overrides,dir:look.id,size:look.size};
 const valuesFile=path.join(dir,'render-values.json');writeFileSync(valuesFile,JSON.stringify(values,null,2)+'\n');
 run(process.execPath,[path.resolve(here,'../scripts/render.mjs'),here,'--size',look.size,'--values',valuesFile,'--out',dir,...flags,'--poster','0'],path.join(dir,'render.log'));
 const stem=look.size.replace(':','x'),png=path.join(dir,look.id+'.png'),small=path.join(dir,'360.png');
 run('ffmpeg',['-loglevel','error','-y','-i',path.join(dir,stem+'-poster.png'),'-frames:v','1','-pix_fmt','rgb24',png]);
 run('ffmpeg',['-loglevel','error','-y','-i',png,'-vf',look.size==='16:9'?'scale=360:203':'scale=360:640','-frames:v','1','-pix_fmt','rgb24',small]);
 const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
 records.push({...look,values,overrides,dimensions:look.size==='16:9'?[1920,1080]:[1080,1920],file:look.id+'/'+look.id+'.png',sha256:sha(png),review:look.id+'/360.png',reviewSha256:sha(small),checks:flags});
}
// Preserve other selected looks when rendering one revision.
let previous=[];try{previous=JSON.parse(readFileSync(path.join(out,'exports.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const all=[...previous.filter(r=>!records.some(n=>n.id===r.id)),...records];
writeFileSync(path.join(out,'exports.json'),JSON.stringify(all,null,2)+'\n');
copyFileSync(path.join(here,'CREDITS.md'),path.join(out,'CREDITS.md'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
writeFileSync(path.join(out,'review.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Mockups review</title><style>body{margin:24px;background:#eee;color:#222;font:16px system-ui}section{margin:40px 0}img{display:block;max-width:100%;height:auto;margin:16px 0}.phone{width:360px}.full{max-width:100%}</style><h1>Mockups review</h1><p>Fictional reference unless replaced with your own product. Review at 360 px, full size and 2×. <a href="CREDITS.md">Asset credits</a>.</p>${all.map(r=>`<section><h2>${esc(r.id)} · ${r.dimensions.join(' × ')}</h2><img class="phone" src="${esc(r.review)}" width="360"><a href="${esc(r.file)}">Full-resolution PNG</a><img class="full" src="${esc(r.file)}"></section>`).join('')}`);
console.log(`Exported ${records.length} look(s); ${path.join(out,'review.html')}`);
