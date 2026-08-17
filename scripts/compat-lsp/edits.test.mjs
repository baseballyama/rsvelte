import assert from "node:assert/strict";
import test from "node:test";
import { applyChange, editChanges, insertionPoints } from "./edits.mjs";

const COMPONENT = `<script lang="ts">
  let name: string = "world";
</script>

<h1>hello {name}</h1>

<style>
  h1 { color: red; }
</style>
`;

function replay(text) {
  const states = [];
  let current = text;
  for (const change of editChanges(text)) {
    current = applyChange(current, change);
    states.push(current);
  }
  return states;
}

test("the edit script restores the opened document byte for byte", () => {
  for (const source of [
    COMPONENT,
    "<h1>markup only</h1>\n",
    "<script>let a = 1;</script>\n",
    "<style>a{}</style>\n",
    "",
  ]) {
    const states = replay(source);
    assert.equal(states.at(-1), source);
    assert.ok(states.length >= 2);
  }
});

test("one intermediate state is a document neither compiler accepts", () => {
  const states = replay(COMPONENT);
  assert.ok(
    states.some((state) => state.includes("{#if __rsvelte_lsp_probe}")),
  );
  assert.ok(!states.at(-1).includes("__rsvelte_lsp_probe"));
});

test("every insertion point is derived from the source, in source order", () => {
  const points = insertionPoints(COMPONENT);
  assert.deepEqual(
    points.map((point) => point.offset),
    [...points.map((point) => point.offset)].sort((a, b) => a - b),
  );
  assert.equal(points.length, 3);
  assert.equal(insertionPoints("<h1>x</h1>").length, 1);
});
