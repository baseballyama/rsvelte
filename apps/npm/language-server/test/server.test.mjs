// Headless LSP smoke test: drives the bundled server over stdio and asserts
// that formatting matches the native rsvelte-fmt and diagnostics match the
// lint wasm. Run `pnpm run build` (repo root: `build:language-server`) first.

import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const repoRoot = resolve(pkgRoot, "..", "..", "..");
const serverPath = join(pkgRoot, "dist", "server.mjs");
const require = createRequire(import.meta.url);

/** Locate a runnable native rsvelte-fmt binary, or null. */
function resolveFmtBin() {
  const candidates = [
    process.env.RSVELTE_FMT_BIN,
    join(repoRoot, "target", "debug", "rsvelte-fmt"),
    join(repoRoot, "target", "release", "rsvelte-fmt"),
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

const FMT_BIN = resolveFmtBin();

// ── Minimal LSP JSON-RPC client over a child process's stdio ─────────────────

class LspClient {
  constructor(child, settings) {
    this.child = child;
    this.settings = settings;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.notifyHandlers = new Map();
    child.stdout.on("data", (chunk) => this.#onData(chunk));
  }

  #onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      const headerEnd = this.buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;
      const header = this.buffer.subarray(0, headerEnd).toString("utf8");
      const m = /Content-Length: (\d+)/i.exec(header);
      if (!m) return;
      const len = Number(m[1]);
      const start = headerEnd + 4;
      if (this.buffer.length < start + len) return;
      const body = this.buffer.subarray(start, start + len).toString("utf8");
      this.buffer = this.buffer.subarray(start + len);
      this.#dispatch(JSON.parse(body));
    }
  }

  #dispatch(msg) {
    // Server → client request (e.g. workspace/configuration).
    if (msg.method && msg.id !== undefined) {
      if (msg.method === "workspace/configuration") {
        const result = msg.params.items.map(() => this.settings);
        this.#send({ jsonrpc: "2.0", id: msg.id, result });
      } else {
        this.#send({ jsonrpc: "2.0", id: msg.id, result: null });
      }
      return;
    }
    // Notification from server.
    if (msg.method && msg.id === undefined) {
      const h = this.notifyHandlers.get(msg.method);
      if (h) h(msg.params);
      return;
    }
    // Response to a client request.
    if (msg.id !== undefined && this.pending.has(msg.id)) {
      const { resolve: res } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      res(msg.result);
    }
  }

  #send(msg) {
    const json = JSON.stringify(msg);
    const payload = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
    this.child.stdin.write(payload);
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((res) => {
      this.pending.set(id, { resolve: res });
      this.#send({ jsonrpc: "2.0", id, method, params });
    });
  }

  notify(method, params) {
    this.#send({ jsonrpc: "2.0", method, params });
  }

  onNotification(method, handler) {
    this.notifyHandlers.set(method, handler);
  }
}

let child;
let client;

before(async () => {
  assert.ok(existsSync(serverPath), `server bundle missing at ${serverPath}`);
  child = spawn(process.execPath, [serverPath, "--stdio"], {
    stdio: ["pipe", "pipe", "inherit"],
  });
  client = new LspClient(child, {
    format: { enable: true },
    lint: { enable: true },
    rsvelteFmtPath: FMT_BIN ?? "",
  });
  await client.request("initialize", {
    processId: process.pid,
    rootUri: null,
    capabilities: { workspace: { configuration: true } },
  });
  client.notify("initialized", {});
});

after(() => {
  child?.kill();
});

function openDoc(uri, languageId, text) {
  client.notify("textDocument/didOpen", {
    textDocument: { uri, languageId, version: 1, text },
  });
}

/** Wait for the next publishDiagnostics for `uri`. */
function waitDiagnostics(uri, timeoutMs = 5000) {
  return new Promise((res, rej) => {
    const timer = setTimeout(
      () => rej(new Error(`timeout waiting for diagnostics: ${uri}`)),
      timeoutMs,
    );
    client.onNotification("textDocument/publishDiagnostics", (params) => {
      if (params.uri === uri) {
        clearTimeout(timer);
        res(params.diagnostics);
      }
    });
  });
}

test("diagnostics match the lint wasm output", async () => {
  const lintMod = require(join(pkgRoot, "dist", "vendor", "rsvelte_lint.cjs"));
  const source = `<script>\n  let x = 1;\n</script>\n<div onclick={() => x++}>{x}</div>\n`;
  const uri = "file:///tmp/Diag.svelte";

  const expected = JSON.parse(lintMod.lint(source, fileURLToPath(uri)));
  assert.ok(expected.length > 0, "fixture should produce lint warnings");

  const diagsP = waitDiagnostics(uri);
  openDoc(uri, "svelte", source);
  const diags = await diagsP;

  assert.equal(diags.length, expected.length);
  for (let i = 0; i < expected.length; i++) {
    const e = expected[i];
    const d = diags[i];
    assert.equal(d.code, e.code, `code[${i}]`);
    assert.equal(d.range.start.line, e.line - 1, `start.line[${i}]`);
    assert.equal(d.range.start.character, e.column, `start.char[${i}]`);
    assert.equal(d.range.end.line, e.endLine - 1, `end.line[${i}]`);
    assert.equal(d.range.end.character, e.endColumn, `end.char[${i}]`);
  }
});

test("formatting matches native rsvelte-fmt", { skip: !FMT_BIN }, async () => {
  const source = `<script>\nlet x=1\n</script>\n\n<div   >{x}</div>\n`;
  const uri = "file:///tmp/Fmt.svelte";
  openDoc(uri, "svelte", source);

  const edits = await client.request("textDocument/formatting", {
    textDocument: { uri },
    options: { tabSize: 2, insertSpaces: true },
  });
  assert.ok(Array.isArray(edits) && edits.length === 1, "one full-doc edit");

  const expected = spawnSync(
    FMT_BIN,
    ["--stdin", "--stdin-filepath", fileURLToPath(uri)],
    { input: source, encoding: "utf8" },
  ).stdout;
  assert.equal(edits[0].newText, expected);
  // Whole-document replacement range.
  assert.deepEqual(edits[0].range.start, { line: 0, character: 0 });
});
