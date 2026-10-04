import fs from 'node:fs';
import compiler from '../../tools/fixtures/node_modules/svelte/compiler/index.js';
const cases=fs.readdirSync('/cases').sort().map(name=>({filename:`/cases/${name}/input.svelte`,source:fs.readFileSync(`/cases/${name}/input.svelte`,'utf8')}));
let bytes=0,outputs=0;
for(let round=0;round<Number(process.argv[2]);round++) {
 for(const {filename,source} of cases) {
  for(const generate of ['client','server']) {
   const result=compiler.compile(source,{filename,generate,runes:true});
   if (typeof result.js.code !== "string") throw new TypeError("compiler output must be text");
   bytes+=Buffer.byteLength(result.js.code, "utf8"); outputs++;
  }
 }
}
console.log(JSON.stringify({oracle:compiler.VERSION,documents:cases.length,outputs,bytes}));
