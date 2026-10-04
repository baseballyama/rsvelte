#!/usr/bin/env node
import fs from 'node:fs';
import {parse} from '../../../../../tools/fixtures/node_modules/svelte/src/compiler/phases/1-parse/index.js';
import {remove_typescript_nodes} from '../../../../../tools/fixtures/node_modules/svelte/src/compiler/phases/1-parse/remove_typescript_nodes.js';
import {analyze_component} from '../../../../../tools/fixtures/node_modules/svelte/src/compiler/phases/2-analyze/index.js';
import {render_stylesheet} from '../../../../../tools/fixtures/node_modules/svelte/src/compiler/phases/3-transform/css/index.js';
import {validate_component_options} from '../../../../../tools/fixtures/node_modules/svelte/src/compiler/validate-options.js';
import * as state from '../../../../../tools/fixtures/node_modules/svelte/src/compiler/state.js';
const [, , manifest, phase, rawRounds] = process.argv;
if(phase!=='total') throw new Error('the official arm measures total CSS only');
const rounds=Number(rawRounds);
const inputs=fs.readFileSync(manifest,'utf8').trimEnd().split('\n').map(line=>{
 const fields=line.split('\t'); if(fields.length!==3) throw new Error('manifest rows need three fields');
 return {filename:fields[0],source:fs.readFileSync(fields[1],'utf8'),expected:fs.readFileSync(fields[2],'utf8')};
});
function compile(input) {
 const source=input.source.replace(/^\uFEFF/, '');
 state.reset({filename:input.filename});
 const validated=validate_component_options({filename:input.filename,runes:true,generate:'client'},'');
 let parsed=parse(source);
 const {customElement:customElementOptions,...parsedOptions}=parsed.options || {};
 const options={...validated,...parsedOptions,customElementOptions,
  css:'css' in parsedOptions?()=>parsedOptions.css??'external':validated.css,
  runes:'runes' in parsedOptions?()=>parsedOptions.runes:validated.runes};
 if(parsed.metadata.ts) {
  parsed={...parsed,fragment:parsed.fragment&&remove_typescript_nodes(parsed.fragment),instance:parsed.instance&&remove_typescript_nodes(parsed.instance),module:parsed.module&&remove_typescript_nodes(parsed.module)};
  if(options.customElementOptions?.extend)options.customElementOptions.extend=remove_typescript_nodes(options.customElementOptions.extend);
 }
 const analysis=analyze_component(parsed,source,options);
 return render_stylesheet(source,analysis,options).code;
}
for(const input of inputs){if(compile(input)!==input.expected) throw new Error(input.filename+': CSS differs');}
for(let round=0;round<20;round++)for(const input of inputs)compile(input);
for(let trial=0;trial<5;trial++) {
 const trialRounds=trial===0?0:rounds;
 gate();const start=process.hrtime.bigint();let checksum=0;
 for(let round=0;round<trialRounds;round++)for(const input of inputs)checksum+=Buffer.byteLength(compile(input));
 const elapsed=process.hrtime.bigint()-start;gate();
 fs.writeSync(1,JSON.stringify({documents:inputs.length,rounds:trialRounds,phase,elapsed_ns:Number(elapsed),checksum})+'\n');
}
function gate(){fs.writeSync(1,'RSVELTE_CYCLE_GATE\n');if(fs.readSync(0,Buffer.alloc(1),0,1,null)!==1)throw new Error('missing gate response');}
