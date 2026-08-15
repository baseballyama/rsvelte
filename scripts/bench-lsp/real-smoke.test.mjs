import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { main } from "./run.mjs";

test("real servers provide TypeScript features and benchmark metrics", async () => {
  const directory = mkdtempSync(join(tmpdir(), "rsvelte-lsp-real-smoke-"));
  try {
    const report = await main([
      "--smoke",
      "--output",
      join(directory, "report.json"),
    ]);
    assert.equal(typeof report.config.tsgoBin, "string");
    for (const result of Object.values(report.servers)) {
      assert.equal(result.status, "ok");
      assert.deepEqual(result.typescriptPositiveControl, {
        hover: true,
        completion: true,
      });
      assert.equal(result.hover.count, 3);
      assert.equal(result.completion.count, 3);
      assert.ok(Number.isFinite(result.firstDiagnosticsMs));
      assert.equal(result.hover.errors, 0);
      assert.equal(result.completion.errors, 0);
      assert.ok(result.memory.peakRssKb >= result.memory.rssKb);
      assert.equal(result.exit.code, 0);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
