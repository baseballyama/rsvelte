import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs'; import path from 'node:path';
const css = fs.readFileSync('default.css','utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => { let p = id==='tailwindcss'?path.join(twRoot,'index.css'): id.startsWith('tailwindcss/')?path.join(twRoot,id.slice(12)):path.resolve(base,id); if(!p.endsWith('.css'))p+='.css'; return {base:path.dirname(p),content:fs.readFileSync(p,'utf8')}; };
const ds = await __unstable__loadDesignSystem(css, { base: process.cwd(), loadStylesheet, loadModule: ()=>{throw new Error('x')} });
const reals = fs.readFileSync('default_order.txt','utf8').split('\n').filter(Boolean);
const realSet = new Set(reals);
const rootOf = n => { const b=n.startsWith('-')?n.slice(1):n; return b.split('-')[0]; };
// roots that take arbitrary values (have at least one functional utility): use all roots present
const roots = [...new Set(reals.map(rootOf))];
// representative value pairs per type (two distinct, to detect interleave)
const TYPES = {
  color: ['#123456', '#abcdef'],
  length: ['10px', '37px'],
  percentage: ['33%', '66%'],
  number: ['3', '7'],
  image: ['linear-gradient(red,blue)', 'linear-gradient(blue,red)'],
  url: ['url(a.png)', 'url(b.png)'],
  position: ['top', 'bottom'],
  angle: ['30deg', '60deg'],
  ratio: ['16/9', '4/3'],
};
// helper: anchor of a candidate = number of reals sorting before it (or null if unknown)
function anchorsOf(cands){
  const order = ds.getClassOrder([...reals, ...cands]);
  const rank = new Map(order.map(([n,o])=>[n,o===null?null:Number(o)]));
  const sorted = order.filter(([,o])=>o!==null).sort((a,b)=>Number(a[1])-Number(b[1]));
  let counter=0; const res=new Map();
  for(const [n] of sorted){ if(realSet.has(n)) counter++; else res.set(n, counter); }
  return {res, rank};
}
const out=[];
for(const type of Object.keys(TYPES)){
  const [v1,v2]=TYPES[type];
  const c1=roots.map(r=>`${r}-[${v1}]`), c2=roots.map(r=>`${r}-[${v2}]`);
  const A=anchorsOf(c1), B=anchorsOf(c2);
  for(let i=0;i<roots.length;i++){
    const r=roots[i];
    const k1=`${r}-[${v1}]`, k2=`${r}-[${v2}]`;
    const a1=A.res.get(k1), a2=B.res.get(k2);
    const known = A.rank.get(k1)!==null && A.rank.get(k1)!==undefined;
    if(!known || a1===undefined) continue;      // root-[type] not resolvable
    if(a1===a2) out.push(`${r}\t${type}\t${a1}`); // non-interleave => stable anchor
  }
}
fs.writeFileSync('type_anchor.txt', out.join('\n')+'\n');
console.log('non-interleave (root,type) anchors:', out.length);
console.log(out.filter(l=>l.startsWith('text\t')).join(' | '));
