import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs'; import path from 'node:path';
const css = fs.readFileSync('default.css','utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => { let p = id==='tailwindcss'?path.join(twRoot,'index.css'): id.startsWith('tailwindcss/')?path.join(twRoot,id.slice(12)):path.resolve(base,id); if(!p.endsWith('.css'))p+='.css'; return {base:path.dirname(p),content:fs.readFileSync(p,'utf8')}; };
const ds = await __unstable__loadDesignSystem(css, { base: process.cwd(), loadStylesheet, loadModule: ()=>{throw new Error('x')} });
const vs = ds.getVariants();
// static variants (no values, not arbitrary-only) -> probe `name:flex`
const statics = vs.filter(v => !v.isArbitrary && (!v.values || v.values.length===0)).map(v=>v.name);
// responsive/container from theme: sm md lg xl 2xl (values on a functional? they appear as separate). add breakpoints & dark & motion & print etc as statics probe anyway
const probe = [...new Set([...statics,'sm','md','lg','xl','2xl','dark','print','portrait','landscape','motion-safe','motion-reduce','contrast-more','contrast-less','rtl','ltr','forced-colors'])];
const ord = ds.getClassOrder(probe.map(n=>`${n}:flex`)).map(([n,o])=>[n.slice(0,-5), o===null?null:Number(o)]).filter(r=>r[1]!==null);
ord.sort((a,b)=>a[1]-b[1]);
fs.writeFileSync('default_variants.txt', ord.map(r=>r[0]).join('\n')+'\n');
console.log("static default variants:", ord.length);
console.log(ord.map(r=>r[0]).join(' '));
