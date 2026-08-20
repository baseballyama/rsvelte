import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { VSCODE_TARGETS } from "../../../../scripts/release/vscode-targets.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const extensionSource = readFileSync(join(root, "src", "extension.ts"), "utf8");

// The packaging table names the directory `platformTriple()` looks in, so the
// two drift silently: a VSIX would ship a binary the extension never resolves.
test("every packaged triple is one the extension resolves at runtime", () => {
  for (const { triple } of VSCODE_TARGETS) {
    assert.equal(
      extensionSource.includes(`"${triple}"`),
      true,
      `${triple} is packaged but never returned by platformTriple()`,
    );
  }
});

test("names each platform's binary the way the extension spawns it", () => {
  for (const { target, binary } of VSCODE_TARGETS) {
    assert.equal(
      binary,
      target.startsWith("win32-")
        ? "rsvelte-language-server.exe"
        : "rsvelte-language-server",
      target,
    );
  }
});

test("packages one VSIX per target, with unique targets and triples", () => {
  assert.equal(new Set(VSCODE_TARGETS.map(({ target }) => target)).size, VSCODE_TARGETS.length);
  assert.equal(new Set(VSCODE_TARGETS.map(({ triple }) => triple)).size, VSCODE_TARGETS.length);
});
