import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs'; import path from 'node:path';
const css = fs.readFileSync('default.css','utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => { let p = id==='tailwindcss'?path.join(twRoot,'index.css'): id.startsWith('tailwindcss/')?path.join(twRoot,id.slice(12)):path.resolve(base,id); if(!p.endsWith('.css'))p+='.css'; return {base:path.dirname(p),content:fs.readFileSync(p,'utf8')}; };
const ds = await __unstable__loadDesignSystem(css, { base: process.cwd(), loadStylesheet, loadModule: ()=>{throw new Error('x')} });
const statics = fs.readFileSync('default_variants.txt','utf8').trim().split('\n');
// representative parametric forms -> map probe token to a family label
const fam = {
 'group-hover':'group-*','peer-hover':'peer-*','not-hover':'not-*','in-hover':'in-*',
 'has-[a]':'has-*','group-has-[a]':'group-has-*','peer-has-[a]':'peer-has-*',
 'aria-[x=y]':'aria-*','group-aria-[x=y]':'group-aria-*','data-[x=y]':'data-*','group-data-[x=y]':'group-data-*','peer-data-[x=y]':'peer-data-*',
 'supports-[x]':'supports-*','nth-[2]':'nth-*','nth-last-[2]':'nth-last-*',
 'min-[100px]':'min-*','max-[100px]':'max-*','@md':'@container-named','@[100px]':'@container-arb',
};
const probeNames = [...statics, ...Object.keys(fam)];
const ord = ds.getClassOrder(probeNames.map(n=>`${n}:flex`)).map(([n,o])=>[n.slice(0,-5), o===null?null:Number(o)]).filter(r=>r[1]!==null);
ord.sort((a,b)=>a[1]-b[1]);
const rows = ord.map(r=> fam[r[0]] ? [fam[r[0]], r[0]] : [r[0], r[0]]);
fs.writeFileSync('variant_roots_order.txt', rows.map(r=>r[0]).join('\n')+'\n');
console.log("total ranked:", rows.length);
console.log(rows.map(r=>r[0]).join(' '));
