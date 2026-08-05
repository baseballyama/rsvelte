/**
 * Turns a samply profile of `corpus_share_profile` into self / inclusive time
 * shares, expressed as a fraction of one run rather than absolute time.
 *
 * How to reproduce a profile end to end:
 *
 *   cargo build --profile profiling -p rsvelte_devtools \
 *     --bin corpus_share_profile --features mimalloc-alloc
 *   samply record --save-only --unstable-presymbolicate \
 *     -o prof.json.gz -r 1000 -- \
 *     target/profiling/corpus_share_profile --iters 4
 *   node scripts/bench/profile-shares.mjs prof.json.gz 30
 *
 * `--unstable-presymbolicate` is required: it writes the `.syms.json` sidecar
 * this script reads. Without it every frame is a bare address.
 *
 * Two traps this script exists to avoid:
 *
 *  - Symbol lookup must honour each symbol's `size`. The binary's symbol table
 *    covers only a fraction of its code, so "largest rva <= addr" silently
 *    attributes unlisted code to whatever symbol precedes it.
 *  - Even with sizes honoured, per-symbol SELF time is not trustworthy under
 *    fat LTO, because inlined callees land inside the caller's address range.
 *    Only the inclusive roll-ups below are safe to threshold on; verify any
 *    single-symbol claim against an independent physical quantity first.
 */
import zlib from "node:zlib";
import fs from "node:fs";

const file = process.argv[2];
const top = Number(process.argv[3] ?? 40);
const p = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)));
const syms = JSON.parse(
  fs.readFileSync(file.replace(/\.json\.gz$/, ".json.syms.json"), "utf8"),
);

// lib index -> sorted [rva, name] table
const tables = new Map();
for (const [k, v] of Object.entries(syms.data)) {
  const rows = v.symbol_table
    .map((s) => [s.rva, syms.string_table[s.symbol], s.size ?? 0])
    .sort((a, b) => a[0] - b[0]);
  tables.set(Number(k), rows);
}
let outOfRange = 0;
// An address past a symbol's `size` belongs to code that is not in the symbol
// table; attributing it to the preceding symbol invents self time for that
// symbol, so it is reported as unknown instead.
const resolve = (libIdx, addr) => {
  const rows = tables.get(libIdx);
  if (!rows) return null;
  let lo = 0,
    hi = rows.length - 1,
    best = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid][0] <= addr) {
      best = rows[mid];
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (!best) return null;
  if (best[2] > 0 && addr >= best[0] + best[2]) {
    outOfRange++;
    return `<unattributed after ${best[1]}>`;
  }
  return best[1];
};

const t = p.threads[0];
const str = t.stringArray;
const frameFunc = t.frameTable.func;
const frameAddr = t.frameTable.address;
const funcRes = t.funcTable.resource;
const resLib = t.resourceTable.lib;
const stackPrefix = t.stackTable.prefix;
const stackFrame = t.stackTable.frame;

const nameOfStack = new Array(t.stackTable.length);
for (let s = 0; s < t.stackTable.length; s++) {
  const fr = stackFrame[s];
  const fn = frameFunc[fr];
  const res = funcRes[fn];
  const lib = res >= 0 ? resLib[res] : -1;
  nameOfStack[s] = resolve(lib, frameAddr[fr]) ?? str[t.funcTable.name[fn]];
}

// Samples inside the harness's own corpus read are not compile work; they are
// dropped so the shares have the compile workload as their denominator.
const EXCLUDE = /corpus_share_profile::collect/;
const excluded = new Set();
for (let s = 0; s < t.stackTable.length; s++) {
  for (let n = s; n !== null && n !== undefined; n = stackPrefix[n]) {
    if (EXCLUDE.test(nameOfStack[n])) {
      excluded.add(s);
      break;
    }
  }
}

const self = new Map();
const incl = new Map();
let total = 0;
let dropped = 0;
for (let i = 0; i < t.samples.length; i++) {
  const s = t.samples.stack[i];
  if (s === null || s === undefined) continue;
  const w = t.samples.weight ? t.samples.weight[i] : 1;
  if (excluded.has(s)) {
    dropped += w;
    continue;
  }
  total += w;
  self.set(nameOfStack[s], (self.get(nameOfStack[s]) ?? 0) + w);
  const seen = new Set();
  for (let n = s; n !== null && n !== undefined; n = stackPrefix[n]) {
    const nm = nameOfStack[n];
    if (!seen.has(nm)) {
      seen.add(nm);
      incl.set(nm, (incl.get(nm) ?? 0) + w);
    }
  }
}

const pct = (c) => ((100 * c) / total).toFixed(2);
const sorted = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);

console.log(`compile samples (denominator): ${total}`);
console.log(
  `dropped harness-I/O samples: ${dropped} (${((100 * dropped) / (total + dropped)).toFixed(2)}% of the raw ${total + dropped})`,
);
const esrapKeys = [...incl.keys()].filter((k) => /esrap/i.test(k));
const esrapMax = Math.max(0, ...esrapKeys.map((k) => incl.get(k)));
console.log(
  `CALIBRATION esrap max inclusive: ${pct(esrapMax)}% (expected 12.3-12.4%)`,
);
for (const k of esrapKeys
  .sort((a, b) => incl.get(b) - incl.get(a))
  .slice(0, 8)) {
  console.log(`   esrap ${pct(incl.get(k)).padStart(6)}%  ${k}`);
}

// Phase-level roll-up by module path.
const buckets = [
  ["phase1_parse", /phase1_parse|oxc_parser|oxc_lexer/],
  ["phase2_analyze", /phase2_analyze/],
  ["phase3_transform", /phase3_transform/],
  ["esrap_print", /esrap/i],
  ["allocator", /^_?mi_|malloc|free|realloc/],
  ["serde_json", /serde_json/],
  ["hashing", /sip::|FxHash|hashbrown|indexmap/],
];
console.log(`\nPHASE ROLL-UP (inclusive, share of ${total}):`);
for (const [name, re] of buckets) {
  let c = 0;
  for (let i = 0; i < t.samples.length; i++) {
    const s = t.samples.stack[i];
    if (s === null || s === undefined || excluded.has(s)) continue;
    const w = t.samples.weight ? t.samples.weight[i] : 1;
    for (let n = s; n !== null && n !== undefined; n = stackPrefix[n]) {
      if (re.test(nameOfStack[n])) {
        c += w;
        break;
      }
    }
  }
  console.log(`  ${pct(c).padStart(6)}%  ${String(c).padStart(7)}  ${name}`);
}

console.log(`\nTOP SELF:`);
for (const [n, c] of sorted(self).slice(0, top))
  console.log(`  ${pct(c).padStart(6)}%  ${String(c).padStart(7)}  ${n}`);
console.log(`\nTOP INCLUSIVE:`);
for (const [n, c] of sorted(incl).slice(0, top))
  console.log(`  ${pct(c).padStart(6)}%  ${String(c).padStart(7)}  ${n}`);
