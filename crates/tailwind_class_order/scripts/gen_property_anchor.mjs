import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs'; import path from 'node:path';
const css = fs.readFileSync('default.css','utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => { let p = id==='tailwindcss'?path.join(twRoot,'index.css'): id.startsWith('tailwindcss/')?path.join(twRoot,id.slice(12)):path.resolve(base,id); if(!p.endsWith('.css'))p+='.css'; return {base:path.dirname(p),content:fs.readFileSync(p,'utf8')}; };
const ds = await __unstable__loadDesignSystem(css, { base: process.cwd(), loadStylesheet, loadModule: ()=>{throw new Error('x')} });
const reals = fs.readFileSync('default_order.txt','utf8').split('\n').filter(Boolean);
const realSet = new Set(reals);
const gpo = JSON.parse(fs.readFileSync('property_order_names.json','utf8'));
const corpus = JSON.parse(fs.readFileSync('corpus_props.json','utf8')).filter(p=>!p.startsWith('--'));
const props = Array.from(new Set([...gpo, ...corpus]));
// synthetic arbitrary properties + one custom-prop marker
const synth = props.map(p=>`[${p}:inherit]`);
synth.push('[--tw-anchor-marker:inherit]');
const universe = [...reals, ...synth];
const order = ds.getClassOrder(universe); // dense ranks over the union
const rankOf = new Map(order.map(([n,o])=>[n, o===null?null:Number(o)]));
// walk in rank order; count reals seen before each synth => anchor (line index in default_order.txt)
const sorted = order.filter(([,o])=>o!==null).sort((a,b)=>Number(a[1])-Number(b[1]));
let counter=0; const anchor=new Map();
for (const [n] of sorted){
  if (realSet.has(n)) counter++;
  else anchor.set(n, counter); // reals before this synth
}
const lines=[];
for (const p of props){ const a=anchor.get(`[${p}:inherit]`); if(a!==undefined) lines.push(`${p}\t${a}`); }
const custom = anchor.get('[--tw-anchor-marker:inherit]');
lines.push(`--\t${custom}`);
fs.writeFileSync('property_anchor.txt', lines.join('\n')+'\n');
console.log('properties:', props.length, 'reals:', reals.length, 'custom anchor:', custom);
console.log('sample:', lines.slice(0,3).join(' | '), '... content-visibility=', anchor.get('[content-visibility:inherit]'));
