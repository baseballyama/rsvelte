// Pins the tsgo capability gap that `compatibility/GATES.md#deliberate-divergences`
// records: `tsgo --lsp` carries no `ScriptElementKind`/`kindModifiers`, so a
// `const` is indistinguishable from a `let` and rsvelte cannot reproduce
// official's `CompletionItemKind.Constant`. When tsgo starts distinguishing
// them this test fails, which is the signal to delete that entry.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LspProcess } from "./protocol.mjs";
import { resolveTsgo } from "./tsgo.mjs";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const VARIABLE = 6;

const SOURCE = [
  "const aConst = 1;",
  "let aLet = 2;",
  "var aVar = 3;",
  "function aFunction() {}",
  "class AClass {}",
  "enum AnEnum { X }",
  "a",
  "",
].join("\n");

async function completionItems() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tsgo-kind-"));
  const file = path.join(dir, "input.ts");
  fs.writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { strict: true, target: "esnext" },
      include: ["**/*.ts"],
    }),
  );
  fs.writeFileSync(file, SOURCE);
  const server = new LspProcess(
    "tsgo",
    [resolveTsgo(ROOT), "--lsp", "--stdio"],
    {
      cwd: dir,
      timeoutMs: 60_000,
    },
  );
  let id = 0;
  const request = async (method, params) => {
    const current = ++id;
    server.send({ jsonrpc: "2.0", id: current, method, params });
    return (await server.response(current, () => null)).result;
  };
  try {
    await request("initialize", {
      processId: process.pid,
      rootUri: pathToFileURL(dir).href,
      workspaceFolders: [{ uri: pathToFileURL(dir).href, name: "w" }],
      capabilities: { textDocument: { completion: {} } },
    });
    server.send({ jsonrpc: "2.0", method: "initialized", params: {} });
    server.send({
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: pathToFileURL(file).href,
          languageId: "typescript",
          version: 1,
          text: SOURCE,
        },
      },
    });
    const result = await request("textDocument/completion", {
      textDocument: { uri: pathToFileURL(file).href },
      position: { line: SOURCE.split("\n").indexOf("a"), character: 1 },
    });
    return Array.isArray(result) ? result : (result?.items ?? []);
  } finally {
    await server.shutdown(++id, () => null);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("tsgo's LSP collapses const, let and var into one completion kind", async () => {
  const items = await completionItems();
  const byLabel = new Map(items.map((item) => [item.label, item]));
  const kinds = {};
  for (const label of [
    "aConst",
    "aLet",
    "aVar",
    "aFunction",
    "AClass",
    "AnEnum",
  ]) {
    const item = byLabel.get(label);
    assert.ok(item, `tsgo offered no completion for ${label}`);
    kinds[label] = item.kind;
  }

  // Positive control: without it every assertion below is satisfied by an
  // empty or kind-less response, which is a degraded tsgo rather than the gap.
  assert.equal(kinds.aFunction, 3, "expected Function");
  assert.equal(kinds.AClass, 7, "expected Class");
  assert.equal(kinds.AnEnum, 13, "expected Enum");

  assert.deepEqual(
    [kinds.aConst, kinds.aLet, kinds.aVar],
    [VARIABLE, VARIABLE, VARIABLE],
    "tsgo now distinguishes const/let/var: remove the deliberate divergence",
  );
  assert.equal(
    items.filter((item) => "kindModifiers" in item).length,
    0,
    "tsgo now carries kindModifiers: remove the deliberate divergence",
  );
});
