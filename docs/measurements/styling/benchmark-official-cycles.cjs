const fs = require('node:fs');
const path = require('node:path');
const {compile} = require('../../../tools/fixtures/node_modules/svelte/compiler/index.js');
const rounds = Number(process.argv[3]);
const inputs = fs.readdirSync(process.argv[2]).sort().map(filename => [filename, fs.readFileSync(path.join(process.argv[2],filename,'input.svelte'),'utf8')]);
for(let round=0;round<20;round++) for(const [filename,source] of inputs) compile(source,{filename,runes:true,generate:"client"});
let bytes=0;
cycleGate();
const start=process.hrtime.bigint();
for(let round=0;round<rounds;round++) for(const [filename,source] of inputs) {
 const output=compile(source,{filename,runes:true,generate:'client'});
 bytes += Buffer.byteLength(output.js.code) + (output.css ? Buffer.byteLength(output.css.code) : 0);
}
const elapsed=process.hrtime.bigint()-start;
cycleGate();
process.stdout.write(JSON.stringify({documents:inputs.length,rounds,elapsed_ns:Number(elapsed),output_bytes:bytes})+'\n');

function cycleGate() { fs.writeSync(1,"RSVELTE_CYCLE_GATE\n"); const input=Buffer.alloc(1); if(fs.readSync(0,input,0,1,null)!==1) throw new Error("missing cycle gate response"); }
