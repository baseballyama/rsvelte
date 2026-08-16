import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateCorpusDifferences,
  assertNonemptySuites,
  baselineRewriteReasons,
  corpusShardIndex,
  selectKnownForScope,
  shardCorpusCases,
} from "./ratchet.mjs";

const suites = [
  "fixtures",
  "upstream-features",
  "upstream-testfiles",
  "corpus",
];
const repos = ["bits-ui", "flowbite-svelte", "melt-ui", "shadcn-svelte"];

test("partial suite and repo runs cannot rewrite the baseline", () => {
  assert.equal(
    baselineRewriteReasons(["fixtures"], suites, repos, repos).filter(Boolean)
      .length,
    1,
  );
  assert.equal(
    baselineRewriteReasons(suites, suites, ["bits-ui"], repos).filter(Boolean)
      .length,
    1,
  );
  assert.deepEqual(baselineRewriteReasons(suites, suites, repos, repos), [
    false,
    false,
  ]);
  assert.equal(
    baselineRewriteReasons(suites, suites, repos, repos, [
      "--shard measured only part of the files",
    ]).filter(Boolean).length,
    1,
  );
});

test("corpus file shards are disjoint and cover the full population", () => {
  const cases = Array.from({ length: 11 }, (_, index) => ({
    suite: "corpus",
    id: `corpus/repo/${index}`,
  }));
  const shards = Array.from({ length: 4 }, (_, index) =>
    shardCorpusCases(cases, { index, count: 4 }),
  );
  assert.deepEqual(
    new Set(shards.flat().map((entry) => entry.id)),
    new Set(cases.map((entry) => entry.id)),
  );
  assert.equal(shards.flat().length, cases.length);
});

test("corpus aggregation is blind to which position diverged", () => {
  const first = aggregateCorpusDifferences("corpus/repo/a.svelte", [
    { method: "textDocument/hover", position: "1:1", differences: ["/a"] },
  ]);
  const second = aggregateCorpusDifferences("corpus/repo/a.svelte", [
    { method: "textDocument/hover", position: "1:2", differences: ["/a"] },
  ]);
  assert.deepEqual(second, first);
});

test("corpus aggregation is blind to a second field in a known response", () => {
  const first = aggregateCorpusDifferences("corpus/repo/a.svelte", [
    { method: "textDocument/hover", position: "1:1", differences: ["/a"] },
  ]);
  const second = aggregateCorpusDifferences("corpus/repo/a.svelte", [
    {
      method: "textDocument/hover",
      position: "1:1",
      differences: ["/a", "/b"],
    },
  ]);
  assert.deepEqual(second, first);
});

test("corpus aggregation detects divergent-request count shrink and growth", () => {
  const one = [
    { method: "textDocument/hover", position: "1:1", differences: ["/a"] },
  ];
  const two = [
    ...one,
    { method: "textDocument/hover", position: "2:1", differences: ["/a"] },
  ];
  assert.notDeepEqual(
    aggregateCorpusDifferences("corpus/repo/a.svelte", one),
    aggregateCorpusDifferences("corpus/repo/a.svelte", two),
  );
});

test("a selected suite with zero cases is rejected", () => {
  assert.throws(() => assertNonemptySuites([], ["fixtures"]), /zero cases/);
});

test("stale checks select only the measured suite and corpus repo", () => {
  const known = [
    "differential:fixtures/a|textDocument/hover|/contents:value-mismatch",
    "differential:upstream-features/a|textDocument/diagnostic|/items:value-mismatch",
    "differential:corpus/bits-ui/a|textDocument/hover|/:value-mismatch",
    "differential:corpus/melt-ui/a|textDocument/hover|/:value-mismatch",
  ];
  assert.deepEqual(selectKnownForScope(known, ["corpus"], ["bits-ui"]), [
    known[2],
  ]);
  assert.deepEqual(selectKnownForScope(known, ["fixtures"], repos), [known[0]]);
  assert.deepEqual(selectKnownForScope(known, ["corpus"], ["melt-ui"]), [
    known[3],
  ]);
  assert.deepEqual(
    selectKnownForScope(known, ["corpus"], ["bits-ui"], {
      index: corpusShardIndex("corpus/bits-ui/a", 4),
      count: 4,
    }),
    [known[2]],
  );
});

test("a baseline-only deleted corpus file is stale in exactly one stable shard", () => {
  const deleted =
    "aggregate:corpus/bits-ui/deleted.svelte|textDocument/hover|divergentRequestCount=1";
  const selections = Array.from({ length: 8 }, (_, index) =>
    selectKnownForScope([deleted], ["corpus"], ["bits-ui"], {
      index,
      count: 8,
    }),
  );
  assert.equal(
    selections.filter((entries) => entries.includes(deleted)).length,
    1,
  );
});
