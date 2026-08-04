// Caller attribution for a samply/Firefox-Profiler JSON profile.
//
// For every sample, walks the stack leaf -> root, classifies the sample into a
// cost category (string allocation, hashing, ...) by the innermost matching
// frame, then keeps walking outward to the first rsvelte frames. Those frames
// are the site that *asked* for the work, which is what a "is this allocation
// structurally necessary?" inventory needs -- the leaf itself is always some
// shared malloc / hashbrown helper and tells us nothing.
//
// Usage:
//   node .measure/samply_callers.mjs <profile.json[.gz]> [--category string] [--top N] [--depth N] [--leaves]

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const args = process.argv.slice(2);
const path = args.find((a) => !a.startsWith("--"));
if (!path) {
  console.error("usage: node samply_callers.mjs <profile.json[.gz]> [--category X] [--top N] [--depth N] [--leaves]");
  process.exit(2);
}
const flag = (name, dflt) => {
  const i = args.indexOf("--" + name);
  return i === -1 ? dflt : args[i + 1];
};
const wantCategory = flag("category", null);
const top = Number(flag("top", 40));
const chainDepth = Number(flag("depth", 1));

let raw = readFileSync(path);
if (raw[0] === 0x1f && raw[1] === 0x8b) raw = gunzipSync(raw);
const profile = JSON.parse(raw.toString("utf8"));

// Category regexes, checked leaf -> root; first match wins. Order matters: a
// malloc under String::push_str must be attributed to the string, so the
// generic allocator category is last.
const CATEGORIES = [
  ["hash", /hashbrown|indexmap|SipHash|siphash|::hash::|DefaultHasher|RandomState|HashMap|HashSet|FxHasher|rustc_hash/],
  ["string", /alloc::string|alloc::str::|::to_string|to_owned|ToOwned|push_str|core::fmt|alloc::fmt|::format\b|str::replace/],
  ["vec", /alloc::vec|RawVec|::extend_from|::reserve\b/],
  ["memcpy", /memcpy|memmove|memset|__bzero/],
  ["alloc", /\bmalloc\b|mi_malloc|mi_free|mi_heap|\bfree\b|realloc|__rust_alloc|__rust_dealloc|_szone|nanov2|tiny_malloc|small_malloc/],
];

const RSVELTE = /^(rsvelte_|<rsvelte_)/;
const SEP = "|@|";

function categorize(name) {
  for (const [cat, re] of CATEGORIES) if (re.test(name)) return cat;
  return null;
}

const sharedStrings = (profile.shared && profile.shared.stringArray) || profile.stringArray || null;

let totalSamples = 0;
const byCategory = new Map();
const byCaller = new Map();
const leafByCaller = new Map();

for (const thread of profile.threads) {
  const strTab = thread.stringArray || thread.stringTable || sharedStrings;
  const { funcTable, frameTable, stackTable, samples } = thread;
  if (!samples || !stackTable) continue;

  // Resolve every frame's display name once.
  const frameName = new Array(frameTable.length);
  for (let f = 0; f < frameTable.length; f++) {
    const s = funcTable.name[frameTable.func[f]];
    frameName[f] = typeof s === "number" ? strTab[s] : String(s);
  }
  const frameCat = frameName.map(categorize);
  const frameIsRs = frameName.map((n) => RSVELTE.test(n));

  const stacks = samples.stack;
  const weights = samples.weight;
  for (let i = 0; i < stacks.length; i++) {
    const s0 = stacks[i];
    if (s0 === null || s0 === undefined) continue;
    const w = weights ? weights[i] ?? 1 : 1;
    totalSamples += w;

    let cat = null;
    const chain = [];
    for (let s = s0; s !== null && s !== undefined; s = stackTable.prefix[s]) {
      const f = stackTable.frame[s];
      if (cat === null) {
        if (frameCat[f] !== null) cat = frameCat[f];
        continue;
      }
      // Past the category frame: collect the rsvelte frames going outward.
      if (frameIsRs[f]) chain.push(frameName[f]);
      if (chain.length >= chainDepth) break;
    }
    if (cat === null) continue;
    byCategory.set(cat, (byCategory.get(cat) || 0) + w);
    if (wantCategory && cat !== wantCategory) continue;
    const key = cat + SEP + (chain.length ? chain.join(" <- ") : "(no rsvelte frame)");
    byCaller.set(key, (byCaller.get(key) || 0) + w);
    const leafName = frameName[stackTable.frame[s0]];
    let m = leafByCaller.get(key);
    if (!m) leafByCaller.set(key, (m = new Map()));
    m.set(leafName, (m.get(leafName) || 0) + w);
  }
}

const pct = (n) => ((100 * n) / totalSamples).toFixed(2);
console.log("total samples: " + totalSamples);
console.log("\n== category totals (leaf-classified) ==");
for (const [cat, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
  console.log("  " + pct(n).padStart(6) + "%  " + String(n).padStart(7) + "  " + cat);
}

console.log("\n== callers" + (wantCategory ? " for category=" + wantCategory : "") + " (depth=" + chainDepth + ") ==");
const rows = [...byCaller].sort((a, b) => b[1] - a[1]).slice(0, top);
for (const [key, n] of rows) {
  const cut = key.indexOf(SEP);
  const cat = key.slice(0, cut);
  const chain = key.slice(cut + SEP.length);
  console.log("  " + pct(n).padStart(6) + "%  " + String(n).padStart(7) + "  [" + cat + "] " + chain);
  if (args.includes("--leaves")) {
    const leaves = [...(leafByCaller.get(key) || new Map())].sort((a, b) => b[1] - a[1]).slice(0, 3);
    for (const [leaf, ln] of leaves) console.log("            " + pct(ln).padStart(6) + "%  | " + leaf);
  }
}
