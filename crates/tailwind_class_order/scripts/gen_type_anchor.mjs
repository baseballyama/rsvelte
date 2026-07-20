import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs'; import path from 'node:path';
const css = fs.readFileSync('default.css','utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => { let p = id==='tailwindcss'?path.join(twRoot,'index.css'): id.startsWith('tailwindcss/')?path.join(twRoot,id.slice(12)):path.resolve(base,id); if(!p.endsWith('.css'))p+='.css'; return {base:path.dirname(p),content:fs.readFileSync(p,'utf8')}; };
const ds = await __unstable__loadDesignSystem(css, { base: process.cwd(), loadStylesheet, loadModule: ()=>{throw new Error('x')} });
const reals = fs.readFileSync('default_order.txt','utf8').split('\n').filter(Boolean);
const realSet = new Set(reals);
// compound-root-aware rootOf (mirror the Rust utility_root)
const compound = new Set(fs.readFileSync('functional_roots.txt','utf8').split('\n').filter(Boolean));
function rootOf(n){
  const body = n.startsWith('-')?n.slice(1):n;
  if(compound.has(body)) return body;
  const idx=[]; for(let i=0;i<body.length;i++) if(body[i]==='-') idx.push(i);
  for(let k=idx.length-1;k>=1;k--){ const c=body.slice(0,idx[k]); if(compound.has(c)) return c; }
  return idx.length? body.slice(0,idx[0]) : body;
}
const roots = [...new Set(reals.map(rootOf))];
const TYPES = {
  color: ['#123456', '#abcdef'], length: ['10px', '37px'], percentage: ['33%', '66%'],
  number: ['3', '7'], image: ['linear-gradient(red,blue)', 'linear-gradient(blue,red)'],
  url: ['url(a.png)', 'url(b.png)'], position: ['top', 'bottom'], angle: ['30deg', '60deg'],
  ratio: ['16/9', '4/3'], string: ["'a'", "'b'"],
};
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
  const A=anchorsOf(roots.map(r=>`${r}-[${v1}]`)), B=anchorsOf(roots.map(r=>`${r}-[${v2}]`));
  for(const r of roots){
    const k1=`${r}-[${v1}]`, k2=`${r}-[${v2}]`;
    const a1=A.res.get(k1), a2=B.res.get(k2);
    const known = A.rank.get(k1)!==null && A.rank.get(k1)!==undefined;
    if(known && a1!==undefined && a1===a2) out.push(`${r}\t${type}\t${a1}`);
  }
}
fs.writeFileSync('type_anchor.txt', out.join('\n')+'\n');
console.log('non-interleave (root,type) anchors:', out.length);
