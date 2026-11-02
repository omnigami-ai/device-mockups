// Run from the skill/work root. Keep this skill-specific gate outside synced scripts/.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function readPlanningNotes(folder) {
  return Object.fromEntries(['PRODUCT.md','STORY.md'].map(name=>{
    const contents=readFileSync(path.join(folder,name));
    if(!contents.toString().trim())throw Error(`${name} is empty; write the plan before production capture.`);
    return [name,{sha256:createHash('sha256').update(contents).digest('hex')}];
  }));
}

export function centringDecision(result, accepted, plan) {
  const log=(result.stdout||'')+(result.stderr||'');
  const sha256=createHash('sha256').update(log).digest('hex');
  if(result.error || result.signal || ![0,1].includes(result.status)) throw Error('Centring execution failed; production capture stopped.');
  const clean=/^centred: all \d+ within 0\.25 px(?:;.*)?$/m.test(log);
  const finding=/^\d+ of \d+ off centre by more than 0\.25 px(?:;.*)?$/m.test(log);
  if(result.status===0 && clean && !result.stderr?.trim()) return {status:'pass',sha256};
  if(result.status!==1 || !finding || result.stderr?.trim()) throw Error('Unexpected centring output; production capture stopped.');
  if(!accepted || path.resolve(accepted.plan||'.')!==path.resolve(plan) || accepted.logSha256!==sha256 || !accepted.reason?.trim() || !Array.isArray(accepted.findings) || !accepted.findings.length || accepted.findings.some(f=>typeof f!=='string'||!f.trim())) {
    throw Error('Review the centring findings first. To retain native UI, supply --known-centring with the exact plan, logSha256, reason and findings. No blanket error suppression.');
  }
  return {status:'known-native-findings',sha256,reason:accepted.reason,findings:accepted.findings};
}

function main() {
  const args=process.argv.slice(2),plan=args[0],destination=args[1];
  if(!plan||!destination) throw Error('Usage: node mockups-work/capture-plan.mjs <plan.json> <screens-folder> [--known-centring reviewed.json]');
  const i=args.indexOf('--known-centring');
  if(i>=0&&!args[i+1])throw Error('--known-centring needs a reviewed JSON file');
  const here=path.dirname(fileURLToPath(import.meta.url)),scripts=path.resolve(here,'../scripts');
  // Refuse capture until both planning notes exist; hash the exact notes read before any tool runs.
  const notes=readPlanningNotes(here);
  const evidence=path.resolve(path.dirname(plan),'checks');mkdirSync(evidence,{recursive:true});
  const stem=path.basename(plan,'.json'),result=spawnSync(process.execPath,[path.join(scripts,'centring.mjs'),plan,'--no-crawl'],{encoding:'utf8',maxBuffer:16*1024*1024});
  const log=(result.stdout||'')+(result.stderr||'');process.stdout.write(log);
  writeFileSync(path.join(evidence,stem+'-centring.log'),log);
  const record={plan:path.resolve(plan),notes,exit:result.status,logSha256:createHash('sha256').update(log).digest('hex')};
  // Save failures too: a missing report must never be mistaken for a completed review.
  writeFileSync(path.join(evidence,stem+'-capture.json'),JSON.stringify({...record,status:'stopped'},null,2)+'\n');
  const accepted=i>=0?JSON.parse(readFileSync(args[i+1],'utf8')):null;
  const decision=centringDecision(result,accepted,plan);
  const capture=spawnSync(process.execPath,[path.join(scripts,'screens.mjs'),plan,destination],{encoding:'utf8',maxBuffer:16*1024*1024});
  const captureLog=(capture.stdout||'')+(capture.stderr||'');process.stdout.write(captureLog);
  writeFileSync(path.join(evidence,stem+'-capture.log'),captureLog);
  if(capture.error||capture.signal||capture.status!==0) throw Error('Production capture failed; see '+evidence);
  writeFileSync(path.join(evidence,stem+'-capture.json'),JSON.stringify({...record,centring:decision,status:'captured'},null,2)+'\n');
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url))main();
