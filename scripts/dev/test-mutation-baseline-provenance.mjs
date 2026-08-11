#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  classifyBaseline,
  seedHash,
} from "../compat-corpus/mutation-baseline.mjs";

const sources = fs.mkdtempSync(path.join(os.tmpdir(), "mutation-baseline-"));
const entry = "seed__m0__line-with-semi.svelte [code-mismatch] (client)";
const source = path.join(sources, "seed.svelte");

try {
  fs.writeFileSync(source, "<script>let x = 1;</script>");
  const provenance = { "seed.svelte": seedHash(sources, entry) };
  let result = classifyBaseline({
    baseline: new Set([entry]),
    ids: new Set(),
    provenance,
    sources,
  });
  assert.deepEqual(result, { rekeyed: [], unmeasured: [], stale: [entry] });

  fs.writeFileSync(source, "<script>let x = 2;</script>");
  result = classifyBaseline({
    baseline: new Set([entry]),
    ids: new Set([entry]),
    provenance,
    sources,
  });
  assert.deepEqual(result, { rekeyed: [entry], unmeasured: [], stale: [] });

  fs.unlinkSync(source);
  result = classifyBaseline({
    baseline: new Set([entry]),
    ids: new Set(),
    provenance,
    sources,
  });
  assert.deepEqual(result, { rekeyed: [], unmeasured: [entry], stale: [] });
  console.log(
    "[test-mutation-baseline-provenance] ✅ stale, re-keyed, and missing seeds remain distinct",
  );
} finally {
  fs.rmSync(sources, { recursive: true, force: true });
}
