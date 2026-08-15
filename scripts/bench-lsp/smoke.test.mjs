import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { LspProcess } from "./lsp-client.mjs";
import { main } from "./run.mjs";

test("benchmark emits the stable comparison schema and reaps both servers", async () => {
  const directory = mkdtempSync(join(tmpdir(), "rsvelte-lsp-bench-smoke-"));
  const output = join(directory, "report.json");
  const fake = resolve(
    fileURLToPath(new URL("fake-server.mjs", import.meta.url)),
  );
  const command = JSON.stringify([process.execPath, fake, "--stdio"]);
  try {
    const report = await main([
      "--smoke",
      "--allow-missing-tsgo",
      "--official-command-json",
      command,
      "--rsvelte-command-json",
      command,
      "--output",
      output,
    ]);
    assert.equal(report.schemaVersion, 1);
    assert.equal(report.servers.official.status, "ok");
    assert.equal(report.servers.rsvelte.status, "ok");
    assert.match(report.revision.harness.head, /^[0-9a-f]{40}$/);
    assert.equal(typeof report.revision.harness.dirty, "boolean");
    assert.match(report.sources[0].sha256, /^[0-9a-f]{64}$/);
    assert.deepEqual(report.servers.rsvelte.typescriptPositiveControl, {
      hover: true,
      completion: true,
    });
    for (const result of Object.values(report.servers)) {
      assert.ok(Number.isFinite(result.firstDiagnosticsMs));
      assert.equal(result.hover.errors, 0);
      assert.equal(result.completion.errors, 0);
    }
    assert.equal(report.servers.official.hover.count, 3);
    assert.equal(report.servers.rsvelte.completion.count, 3);
    assert.equal(report.servers.official.exit.code, 0);
    assert.equal(report.servers.rsvelte.exit.code, 0);
    assert.equal(JSON.parse(readFileSync(output, "utf8")).schemaVersion, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("missing first diagnostics fails the server benchmark", async () => {
  const directory = mkdtempSync(join(tmpdir(), "rsvelte-lsp-bench-diag-"));
  const output = join(directory, "report.json");
  const previousExitCode = process.exitCode;
  const fake = resolve(
    fileURLToPath(new URL("fake-server.mjs", import.meta.url)),
  );
  const command = JSON.stringify([
    process.execPath,
    fake,
    "--stdio",
    "--no-diagnostics",
  ]);
  try {
    process.exitCode = undefined;
    const report = await main([
      "--smoke",
      "--timeout-ms",
      "100",
      "--allow-missing-tsgo",
      "--official-command-json",
      command,
      "--rsvelte-command-json",
      command,
      "--output",
      output,
    ]);
    assert.equal(report.servers.official.status, "failed");
    assert.equal(report.servers.official.firstDiagnosticsMs, null);
    assert.match(report.servers.official.error, /first diagnostics failed/);
    assert.equal(process.exitCode, 1);
  } finally {
    process.exitCode = previousExitCode;
    rmSync(directory, { recursive: true, force: true });
  }
});

test("request deadlines reap an unresponsive process", async () => {
  const directory = mkdtempSync(join(tmpdir(), "rsvelte-lsp-bench-timeout-"));
  const fake = resolve(
    fileURLToPath(new URL("fake-server.mjs", import.meta.url)),
  );
  const client = new LspProcess([process.execPath, fake, "--hang-all"], {
    cwd: directory,
    timeoutMs: 100,
  });
  try {
    await client.started();
    await assert.rejects(
      client.request("textDocument/hover", {}),
      /timed out after 100ms/,
    );
    const exit = await client.close();
    assert.ok(exit.signal !== null || exit.code !== 0, JSON.stringify(exit));
  } finally {
    await client.kill();
    rmSync(directory, { recursive: true, force: true });
  }
});
