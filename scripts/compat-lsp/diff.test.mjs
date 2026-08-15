import assert from "node:assert/strict";
import test from "node:test";
import { diffJson } from "./diff.mjs";

test("a second mismatch in one known response creates a new ratchet entry", () => {
  const official = {
    contents: { kind: "markdown", value: "upstream" },
    range: null,
  };
  const first = {
    contents: { kind: "plaintext", value: "upstream" },
    range: null,
  };
  const second = {
    contents: { kind: "plaintext", value: "rsvelte" },
    range: null,
  };
  const known = new Set(diffJson("textDocument/hover", official, first));
  const current = diffJson("textDocument/hover", official, second);
  assert.equal(current.filter((entry) => !known.has(entry)).length, 1);
  assert.match(
    current.find((entry) => entry.startsWith("/contents/value:value-mismatch")),
    /official=.*rsvelte=/,
  );
});

test("changing a wrong scalar value at a known pointer creates a new key", () => {
  const official = { detail: "official" };
  const first = new Set(
    diffJson("textDocument/hover", official, { detail: "wrong-a" }),
  );
  const second = diffJson("textDocument/hover", official, {
    detail: "wrong-b",
  });
  assert.equal(second.filter((entry) => !first.has(entry)).length, 1);
});

test("changing a present value for a missing field creates a new key", () => {
  const official = {};
  const first = new Set(
    diffJson("textDocument/hover", official, { extra: "wrong-a" }),
  );
  const second = diffJson("textDocument/hover", official, { extra: "wrong-b" });
  assert.equal(second.filter((entry) => !first.has(entry)).length, 1);
});

test("completion arrays match by semantic identity instead of index", () => {
  const alpha = { label: "alpha", kind: 6, detail: "number" };
  const beta = { label: "beta", kind: 6, detail: "string" };
  assert.deepEqual(
    diffJson(
      "textDocument/completion",
      { items: [alpha, beta] },
      { items: [beta, alpha] },
    ),
    [],
  );
});
