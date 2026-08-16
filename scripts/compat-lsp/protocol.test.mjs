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
  await assertReaped(pid);
  await assertReaped(grandchildPid);
});

// A killed process stays visible to kill(pid, 0) until its parent reaps it, and a
// re-parented grandchild waits on init — so poll instead of sampling once.
async function assertReaped(pid, timeoutMs = 5_000) {
  for (let waited = 0; waited < timeoutMs; waited += 10) {
    try {
      process.kill(pid, 0);
    } catch (error) {
      assert.equal(error.code, "ESRCH");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.throws(() => process.kill(pid, 0), /ESRCH/);
}
