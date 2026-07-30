// Unit tests for `rsvelte-lint.json` discovery.
// Imports the esbuild-emitted ESM lib (run `pnpm run build` first).

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import {
  clearLintConfigCache,
  isLintConfigPath,
  resolveLintConfig,
} from "../dist/lib/lintConfig.mjs";

const RULES_OFF = '{ "rules": { "svelte/no-at-html-tags": "off" } }';

let root;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rsvelte-ls-lint-config-"));
  clearLintConfigCache();
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Resolve while collecting the messages passed to `onError`. */
function resolve(dir) {
  const errors = [];
  const config = resolveLintConfig(dir, (message) => errors.push(message));
  return { ...config, errors };
}

test("no config anywhere above the directory resolves to the recommended preset", () => {
  const resolved = resolve(root);
  assert.equal(resolved.text, "");
  assert.equal(resolved.path, null);
  assert.deepEqual(resolved.errors, []);
});

test("finds a config in an ancestor directory", () => {
  writeFileSync(join(root, "rsvelte-lint.json"), RULES_OFF);
  const nested = join(root, "src", "lib");
  mkdirSync(nested, { recursive: true });

  const resolved = resolve(nested);
  assert.equal(resolved.text, RULES_OFF);
  assert.equal(resolved.path, join(root, "rsvelte-lint.json"));
  assert.deepEqual(resolved.errors, []);
});

test("the nearest config wins", () => {
  writeFileSync(join(root, "rsvelte-lint.json"), RULES_OFF);
  const nested = join(root, "src");
  mkdirSync(nested);
  writeFileSync(join(nested, "rsvelte-lint.json"), '{ "extends": ["none"] }');

  assert.equal(resolve(nested).path, join(nested, "rsvelte-lint.json"));
});

test("rsvelte-lint.json wins over .rsvelte-lintrc.json in one directory", () => {
  writeFileSync(join(root, "rsvelte-lint.json"), RULES_OFF);
  writeFileSync(join(root, ".rsvelte-lintrc.json"), '{ "extends": ["none"] }');

  assert.equal(resolve(root).path, join(root, "rsvelte-lint.json"));
});

test(".rsvelte-lintrc.json is discovered too", () => {
  writeFileSync(join(root, ".rsvelte-lintrc.json"), RULES_OFF);

  assert.equal(resolve(root).text, RULES_OFF);
});

test("a malformed config is reported and falls back to the recommended preset", () => {
  const path = join(root, "rsvelte-lint.json");
  writeFileSync(path, "{ not json");

  const resolved = resolve(root);
  assert.equal(resolved.text, "");
  assert.equal(resolved.path, path);
  assert.equal(resolved.errors.length, 1);
  assert.ok(resolved.errors[0].startsWith(`${path}: `));
  assert.match(resolved.errors[0], /JSON/);
});

test("a non-object config is reported", () => {
  writeFileSync(join(root, "rsvelte-lint.json"), "[]");

  assert.match(resolve(root).errors[0], /JSON object$/);
});

test("a resolved config is cached, and its error reported only once", () => {
  writeFileSync(join(root, "rsvelte-lint.json"), "{ not json");
  assert.equal(resolve(root).errors.length, 1);
  assert.deepEqual(resolve(root).errors, []);

  writeFileSync(join(root, "rsvelte-lint.json"), RULES_OFF);
  assert.equal(resolve(root).text, "");

  clearLintConfigCache();
  assert.equal(resolve(root).text, RULES_OFF);
});

test("recognises the config file names", () => {
  assert.ok(isLintConfigPath(join(root, "rsvelte-lint.json")));
  assert.ok(isLintConfigPath(join(root, ".rsvelte-lintrc.json")));
  assert.ok(!isLintConfigPath(join(root, "App.svelte")));
  assert.ok(!isLintConfigPath(join(root, "rsvelte-lint.jsonc")));
});
