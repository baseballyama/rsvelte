import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs'; import path from 'node:path';
const css = fs.readFileSync('default.css','utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => { let p = id==='tailwindcss'?path.join(twRoot,'index.css'): id.startsWith('tailwindcss/')?path.join(twRoot,id.slice(12)):path.resolve(base,id); if(!p.endsWith('.css'))p+='.css'; return {base:path.dirname(p),content:fs.readFileSync(p,'utf8')}; };
const ds = await __unstable__loadDesignSystem(css, { base: process.cwd(), loadStylesheet, loadModule: ()=>{throw new Error('x')} });
const list = ds.getClassList().map(([n])=>n);
// bare roots
const roots = new Set();
for (const n of list) { const neg=n.startsWith('-'); const nn=neg?n.slice(1):n; const i=nn.indexOf('-'); if(i>0) roots.add((neg?'-':'')+nn.slice(0,i)); }
// curated omissions that getClassList drops but the default engine still knows
const sides=['t','r','b','l','tl','tr','br','bl','s','e','ss','se','ee','es'];
const dirs=['t','tr','r','br','b','bl','l','tl'];
const bps=['sm','md','lg','xl','2xl'];
const curated=[
  ...dirs.map(d=>`bg-gradient-to-${d}`),
  'backdrop-blur','filter','backdrop-filter',
  ...bps.map(b=>`max-w-screen-${b}`),
  ...sides.map(s=>`rounded-${s}`),
  'flex-grow','flex-shrink','order-none',
];
const probe=[...roots, ...curated];
const known = ds.getClassOrder(probe).filter(([,o])=>o!==null).map(([n])=>n);
const union = Array.from(new Set([...list, ...known]));
const order = ds.getClassOrder(union);
const sorted = order.filter(([,o])=>o!==null).sort((a,b)=> a[1]<b[1]?-1:a[1]>b[1]?1:0).map(([n])=>n);
fs.writeFileSync('default_order.txt', sorted.join('\n')+'\n');
const added = known.filter(n=>!list.includes(n));
console.log('union:', sorted.length, 'curated/bare added:', added.length);
console.log('added:', added.join(' '));
