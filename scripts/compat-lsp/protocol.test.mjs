import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { LspProcess } from "./protocol.mjs";

test("didOpen is observed before a bounded concurrent request burst", async () => {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const server = new LspProcess(
    "fake LSP",
    ["node", path.join(directory, "fake-server.mjs")],
    {
      cwd: directory,
      timeoutMs: 2_000,
    },
  );
  server.setClientRequestHandler(() => null);
  const uri = "file:///fixture.svelte";
  server.send({
    jsonrpc: "2.0",
    method: "textDocument/didOpen",
    params: {
      textDocument: { uri, languageId: "svelte", version: 1, text: "<h1 />" },
    },
  });
  const responses = [];
  for (let id = 1; id <= 64; id++) {
    server.send({
      jsonrpc: "2.0",
      id,
      method: "textDocument/hover",
      params: { textDocument: { uri }, sequence: id },
    });
    responses.push(server.response(id));
  }
  const results = await Promise.all(responses);
  assert.equal(
    results.every((message) => message.result.opened),
    true,
  );
  assert.deepEqual(
    results.map((message) => message.result.sequence),
    Array.from({ length: 64 }, (_, index) => index + 1),
  );
  await server.shutdown(65, () => null);
});

test("shutdown kills an unresponsive child process tree", async () => {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const server = new LspProcess(
    "unresponsive fake LSP",
    ["node", path.join(directory, "fake-server.mjs"), "--unresponsive"],
    { cwd: directory, timeoutMs: 50 },
  );
  const pid = server.child.pid;
  for (
    let attempt = 0;
    !server.stderr.includes("grandchild:") && attempt < 20;
    attempt++
  )
    await new Promise((resolve) => setTimeout(resolve, 10));
  const grandchildPid = Number(/grandchild:(\d+)/.exec(server.stderr)?.[1]);
  assert.equal(Number.isInteger(grandchildPid), true);
  await server.shutdown(1, () => null);
  assert.equal(
    server.child.exitCode !== null || server.child.signalCode !== null,
    true,
  );
  assert.throws(() => process.kill(pid, 0), /ESRCH/);
  assert.throws(() => process.kill(grandchildPid, 0), /ESRCH/);
});
