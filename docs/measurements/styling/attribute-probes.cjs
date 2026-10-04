const fs = require('node:fs'); const path=require('node:path');
const {compile}=require('../../../tools/fixtures/node_modules/svelte/compiler/index.js');
const forms=['false','0','null','[false,0,null]','true && "x"','true ? "x" : "y"','"x" + "y"','`x`', '["x", {y:false}]', 'undefined', 'false || "x"', 'x && "y"', 'x ?? "y"', 'x ? "x y" : "z"'];
const names=['.false','.null','.x','.y','.xy','[class="false"]','[class="null"]','[class="x"]','[class="x y"]','[class~="y"]','[class^="x"]'];
let i=0;
for(const expression of forms) for(const form of ['class={EXPR}', 'class="pre-{EXPR}"', 'class=" {EXPR} "']) {
 const markup='<script>let x = $state(true)</script><p '+form.replace('EXPR',expression.replaceAll('"',"'"))+'></p>';
 const filename='probe-'+String(i++).padStart(3,'0')+'.svelte'; const dir=path.join('/tmp/rsvelte-style-probes',filename); const src=markup+'<style>'+names.join(',')+'{color:red}</style>';
 try {const output=compile(src,{filename,runes:true});fs.mkdirSync(path.join(dir,'expected/svelte.compile'),{recursive:true});fs.writeFileSync(path.join(dir,'input.svelte'),src);fs.writeFileSync(path.join(dir,'expected/svelte.compile/client.css'),output.css.code);}catch(error){console.log(error.message);process.exitCode=1;}
}
