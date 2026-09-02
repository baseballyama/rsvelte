import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { identity } from "./diff.mjs";
import { createHash } from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);

// The ratchet stores a digest, never the values, so a divergence there cannot be
// read back. Reproducing the digest from each side's declared values recovers the
// preimage: an equality here says WHICH values sit on which side, which running
// the two servers does not — it only says that they differ.
const baseline = JSON.parse(
  fs.readFileSync(path.join(ROOT, "compatibility/lsp-known-failures.json"), "utf8"),
);
const recorded = (pointer, kind) => {
  const prefix = `differential:fixtures/capabilities|initialize|${pointer}:${kind}[`;
  const hit = baseline.filter((key) => key.startsWith(prefix));
  assert.equal(hit.length, 1, `expected exactly one baseline entry for ${pointer}:${kind}`);
  return hit[0].slice(prefix.length, -1);
};

// `walk`'s array branch, reproduced: bucket both sides by `identity`, and the
// excess on each side is what that side alone carries.
function arrayDiff(method, pointer, official, rsvelte) {
  const bucket = (values) => {
    const map = new Map();
    for (const value of values) {
      const key = identity(method, pointer, value);
      map.set(key, [...(map.get(key) ?? []), value]);
    }
    return map;
  };
  const left = bucket(official);
  const right = bucket(rsvelte);
  const missing = [];
  const extra = [];
  for (const key of new Set([...left.keys(), ...right.keys()])) {
    const l = (left.get(key) ?? []).length;
    const r = (right.get(key) ?? []).length;
    for (let i = Math.min(l, r); i < l; i++) missing.push(key);
    for (let i = Math.min(l, r); i < r; i++) extra.push(key);
  }
  const spell = (keys) => `count=${keys.length},hash=${digest(keys.slice().sort())}`;
  return { missing: spell(missing), extra: spell(extra) };
}

// submodules/language-tools/.../server.ts:280-306. `@` is listed TWICE, once in
// the main group and once under Emmet; that duplicate is the whole of the
// `missing-rsvelte` entry, so the list must stay a multiset.
const OFFICIAL_TRIGGERS = [
  ".", '"', "'", "`", "/", "@", "<", ">", "*", "#", "$", "+", "^", "(", "[", "@", "-", ":", "|",
];
// crates/rsvelte_language_server/src/completions.rs:24-26
const RSVELTE_TRIGGERS = [
  "<", " ", "#", "@", ":", "|", "/", ".", '"', "'", "`", ">", "*", "$", "+", "^", "(", "[", "-",
];

// server.ts:315-331 under this gate's client capabilities: `codeActionLiteralSupport`
// is present and `shouldFilterCodeActionKind` is absent, so nothing is filtered out.
const OFFICIAL_CODE_ACTION_KINDS = [
  "quickfix",
  "source.organizeImports",
  "source.sortImports",
  "source.addMissingImports",
  "source.removeUnusedImports",
  "refactor",
];
// crates/rsvelte_language_server/src/server.rs:176-187
const RSVELTE_CODE_ACTION_KINDS = [
  "quickfix",
  "refactor",
  "source.organizeImports",
  "source.sortImports",
  "source.addMissingImports",
  "source.removeUnusedImports",
  "source.fixAll",
  "source.fixAll.rsvelte",
];

// server.ts:334-347
const OFFICIAL_COMMANDS = [
  "function_scope_0",
  "function_scope_1",
  "function_scope_2",
  "function_scope_3",
  "constant_scope_0",
  "constant_scope_1",
  "constant_scope_2",
  "constant_scope_3",
  "extract_to_svelte_component",
  "migrate_to_svelte_5",
  "Infer function return type",
];
// crates/rsvelte_language_server/src/extract.rs:12 is the only command rsvelte serves.
const RSVELTE_COMMANDS = ["extract_to_svelte_component"];

// semanticTokenLegend.ts:42-81 — both legends are dense arrays in enum order.
const OFFICIAL_TOKEN_TYPES = [
  "class", "enum", "interface", "namespace", "typeParameter", "type", "parameter",
  "variable", "enumMember", "property", "function", "method", "event",
];
const OFFICIAL_TOKEN_MODIFIERS = [
  "declaration", "static", "async", "readonly", "defaultLibrary", "local",
];

test("the duplicate `@` and the extra space reproduce the recorded trigger-character digests", () => {
  const { missing, extra } = arrayDiff(
    "initialize",
    "/capabilities/completionProvider/triggerCharacters",
    OFFICIAL_TRIGGERS,
    RSVELTE_TRIGGERS,
  );
  assert.equal(missing, recorded("/capabilities/completionProvider/triggerCharacters", "missing-rsvelte"));
  assert.equal(extra, recorded("/capabilities/completionProvider/triggerCharacters", "extra-rsvelte"));
});

test("the two fix-all kinds reproduce the recorded codeActionKinds digest", () => {
  const { extra } = arrayDiff(
    "initialize",
    "/capabilities/codeActionProvider/codeActionKinds",
    OFFICIAL_CODE_ACTION_KINDS,
    RSVELTE_CODE_ACTION_KINDS,
  );
  assert.equal(extra, recorded("/capabilities/codeActionProvider/codeActionKinds", "extra-rsvelte"));
});

test("the ten unimplemented refactor commands reproduce the recorded digest", () => {
  const { missing } = arrayDiff(
    "initialize",
    "/capabilities/executeCommandProvider/commands",
    OFFICIAL_COMMANDS,
    RSVELTE_COMMANDS,
  );
  assert.equal(missing, recorded("/capabilities/executeCommandProvider/commands", "missing-rsvelte"));
});

// The gate's client advertises no `textDocument.semanticTokens`, so rsvelte's
// legend filter keeps nothing. An empty rsvelte legend is the only way the
// missing set can be official's legend entire — and the ratchet carries no
// `extra-rsvelte` for either pointer, which is what closes it.
test("an empty rsvelte legend reproduces both recorded semanticTokens digests", () => {
  for (const [pointer, official] of [
    ["/capabilities/semanticTokensProvider/legend/tokenTypes", OFFICIAL_TOKEN_TYPES],
    ["/capabilities/semanticTokensProvider/legend/tokenModifiers", OFFICIAL_TOKEN_MODIFIERS],
  ]) {
    const { missing } = arrayDiff("initialize", pointer, official, []);
    assert.equal(missing, recorded(pointer, "missing-rsvelte"));
    assert.equal(
      baseline.filter((key) =>
        key.startsWith(`differential:fixtures/capabilities|initialize|${pointer}:extra-rsvelte[`),
      ).length,
      0,
      `${pointer} must carry no extra-rsvelte, or the legend is not simply empty`,
    );
  }
});
