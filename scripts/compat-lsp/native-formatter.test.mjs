import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "crates/rsvelte_language_server/src");

const sources = fs
  .readdirSync(SRC, { recursive: true })
  .filter((entry) => typeof entry === "string" && entry.endsWith(".rs"))
  .map((entry) => [entry, fs.readFileSync(path.join(SRC, entry), "utf8")]);

// A prose mention is not a reach path: `server.rs` explains in a doc comment why
// only `FormatSession` may be used, and that must not count as a second caller.
const stripComments = (text) =>
  text
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join("\n");

test("the formatter is reachable from exactly one module", () => {
  const callers = sources
    .filter(([, text]) => /\brsvelte_(?:formatter|fmt)\s*::/.test(stripComments(text)))
    .map(([file]) => file)
    .sort();
  assert.deepEqual(callers, ["format.rs"]);
});

test("the one module that formats does not shell out", () => {
  const text = stripComments(fs.readFileSync(path.join(SRC, "format.rs"), "utf8"));
  // Loading a user Prettier runtime, resolving a Prettier plugin or falling back
  // between Prettier versions all require leaving the process, which is the axis
  // upstream's `SveltePlugin.test.ts` measures.
  for (const spawn of ["Command::new", "process::Command", "std::process"]) {
    assert.equal(text.includes(spawn), false, `format.rs must not use ${spawn}`);
  }
});

test("a Prettier project config is detected, never executed", () => {
  const text = fs.readFileSync(path.join(SRC, "format.rs"), "utf8");
  // `.prettierrc` and friends decide whether project config exists; the format
  // call underneath is still `rsvelte_formatter::format`.
  assert.match(text, /\.prettierrc/);
  assert.match(text, /rsvelte_formatter::format\(/);
});
