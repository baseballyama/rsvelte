import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  corpusCases,
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
