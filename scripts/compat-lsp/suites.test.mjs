import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  corpusCases,
  fixtureCases,
  findServerCaches,
  removeNewServerCaches,
  walkFiles,
} from "./suites.mjs";

test("server cache files cannot contaminate a later population discovery", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-lsp-walk-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "input.svelte"), "<h1 />");
  fs.mkdirSync(path.join(root, ".rsvelte-language-server/tsgo"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, ".rsvelte-language-server/tsgo/input.svelte.ts"),
    "export {};",
  );
  assert.deepEqual(
    walkFiles(root, () => true).map((file) => path.relative(root, file)),
    ["input.svelte"],
  );
});

test("the same relative component path in two corpus repos has distinct ids", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-lsp-corpus-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const repo of ["bits-ui", "melt-ui"]) {
    const directory = path.join(root, "submodules", repo, "src");
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "Button.svelte"), "<button />");
  }
  assert.deepEqual(
    corpusCases(root, ["bits-ui", "melt-ui"]).map((entry) => entry.id),
    ["corpus/bits-ui/src/Button.svelte", "corpus/melt-ui/src/Button.svelte"],
  );
});

test("cleanup removes only caches created by the current run", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-lsp-clean-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const existing = path.join(root, "existing/.rsvelte-language-server");
  fs.mkdirSync(existing, { recursive: true });
  const before = findServerCaches([root]);
  const created = path.join(root, "created/.rsvelte-language-server");
  fs.mkdirSync(created, { recursive: true });
  const removed = removeNewServerCaches(before, findServerCaches([root]));
  assert.deepEqual(removed, [created]);
  assert.equal(fs.existsSync(existing), true);
  assert.equal(fs.existsSync(created), false);
});

// A required member the harness omits is not a smaller request: the server
// fails to deserialize and answers a spelling of "nothing", identically for
// every source, so the ratchet records the harness. Three methods lost 30
// entries to that (#4331, #4209) before this test existed.
const REQUIRED_PARAMS = {
  "textDocument/hover": ["position"],
  "textDocument/completion": ["position"],
  "textDocument/linkedEditingRange": ["position"],
  "textDocument/documentHighlight": ["position"],
  "textDocument/prepareRename": ["position"],
  "textDocument/selectionRange": ["positions"],
  "textDocument/formatting": ["options"],
  "textDocument/codeAction": ["range", "context"],
};

test("every fixture request carries the members its method's params declare", () => {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const cases = fixtureCases(root);
  assert.ok(cases.length > 100, `only ${cases.length} fixture cases discovered`);
  const seen = new Set();
  for (const entry of cases) {
    for (const request of entry.requests) {
      seen.add(request.method);
      for (const member of REQUIRED_PARAMS[request.method] ?? []) {
        assert.ok(
          request.params[member] !== undefined,
          `${entry.id}: ${request.method} params lack \`${member}\``,
        );
      }
    }
  }
  // Negative control: the table is only evidence for the methods the manifest
  // actually issues, so an entry that stops being reached must be visible.
  for (const method of Object.keys(REQUIRED_PARAMS))
    assert.ok(seen.has(method), `no fixture issues ${method}`);
  // Spelled rather than absent: `colorPresentation` also declares `color` and
  // `range`, and the manifest carries neither, so its three cases are still
  // driven malformed. Both servers answer identically there, so it enrols no
  // ratchet entry — which is why it is recorded here and not fixed blind.
  assert.ok(seen.has("textDocument/colorPresentation"));
  assert.ok(!("textDocument/colorPresentation" in REQUIRED_PARAMS));
});

test("the fixtures suite reads both case lists, not only the upstream one", () => {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/compat-lsp/upstream-fixture-manifest.json"),
      "utf8",
    ),
  );
  const ids = new Set(fixtureCases(root).map((entry) => entry.id));

  // Positive control on each list separately: a `fixtureCases` that dropped
  // either one would still satisfy an assertion written over the union.
  const upstream = manifest.behavior_cases.filter((entry) =>
    entry.method.startsWith("textDocument/"),
  );
  const authored = (manifest.rsvelte_cases ?? []).filter((entry) =>
    entry.method.startsWith("textDocument/"),
  );
  assert.ok(upstream.length > 0, "no upstream textDocument case to check");
  assert.ok(
    authored.length > 0,
    "rsvelte_cases holds no textDocument case, so this assertion is vacuous",
  );
  for (const entry of [...upstream, ...authored])
    assert.ok(ids.has(`fixtures/${entry.id}`), `fixtures/${entry.id} is not run`);

  // The two lists exist to keep provenance readable, so an id in both would
  // make a divergence attributable to neither.
  const upstreamIds = new Set(manifest.behavior_cases.map((e) => e.id));
  for (const entry of manifest.rsvelte_cases ?? [])
    assert.ok(
      !upstreamIds.has(entry.id),
      `${entry.id} is in both lists`,
    );
});
