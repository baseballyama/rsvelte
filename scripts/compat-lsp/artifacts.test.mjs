import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTIFACT_SCHEMA,
  CONFIGURATION_ID,
  CORPUS_SHARDS,
  FIXTURE_SUITES,
  hashValues,
  mergeCurrentArtifacts,
  recordsFixtureControls,
} from "./artifacts.mjs";
import { corpusShardIndex } from "./ratchet.mjs";
import { CORPUS_REPOS } from "./suites.mjs";

function idFor(repo, shard) {
  for (let index = 0; ; index++) {
    const id = `corpus/${repo}/file-${shard}-${index}.svelte`;
    if (corpusShardIndex(id, CORPUS_SHARDS) === shard) return id;
  }
}

function artifacts() {
  const ids = Array.from({ length: CORPUS_SHARDS }, (_, shard) =>
    CORPUS_REPOS.map((repo) => idFor(repo, shard)),
  );
  const universe = ids.flat();
  const common = {
    schemaVersion: ARTIFACT_SCHEMA,
    projectRevision: "project",
    configurationId: CONFIGURATION_ID,
    sourceRevisions: {
      "language-tools": "language-tools",
      ...Object.fromEntries(CORPUS_REPOS.map((repo) => [repo, `${repo}-sha`])),
    },
  };
  return [
    {
      ...common,
      suites: FIXTURE_SUITES,
      repos: [],
      shard: null,
      universeHash: hashValues(["fixtures/a"]),
      measuredIds: ["fixtures/a"],
      population: {},
      counts: { compared: 1 },
      current: ["differential:fixtures/a|initialize|/capabilities:value"],
      mechanisms: {
        "differential:fixtures/a|initialize|/capabilities:value": [
          "unclassified",
        ],
      },
    },
    ...ids.map((measuredIds, index) => ({
      ...common,
      suites: ["corpus"],
      repos: CORPUS_REPOS,
      shard: { index, count: CORPUS_SHARDS },
      universeHash: hashValues(universe),
      measuredIds,
      population: Object.fromEntries(
        CORPUS_REPOS.map((repo) => [
          repo,
          { files: 1, identifiers: 1, requests: 3 },
        ]),
      ),
      counts: { compared: 12 },
      current: [`aggregate:corpus/repo/${index}|hover|digest=${index}`],
      mechanisms: {
        [`aggregate:corpus/repo/${index}|hover|digest=${index}`]: ["ts-render"],
      },
    })),
  ];
}

const floor = Object.fromEntries(
  CORPUS_REPOS.map((repo) => [
    repo,
    {
      files: CORPUS_SHARDS,
      identifiers: CORPUS_SHARDS,
      requests: CORPUS_SHARDS * 3,
    },
  ]),
);

test("the full stable-shard matrix merges exactly once", () => {
  const result = mergeCurrentArtifacts(artifacts(), floor);
  assert.equal(result.current.length, CORPUS_SHARDS + 1);
});

test("missing, duplicate, and partial corpus shard sets are rejected", () => {
  const values = artifacts();
  assert.throws(
    () => mergeCurrentArtifacts(values.slice(0, -1), floor),
    new RegExp(`exactly ${CORPUS_SHARDS + 1}`),
  );
  const duplicate = structuredClone(values);
  duplicate.at(-1).shard.index = 0;
  assert.throws(
    () => mergeCurrentArtifacts(duplicate, floor),
    /duplicate corpus shard/,
  );
  const partial = structuredClone(values);
  partial[1].repos = ["bits-ui"];
  assert.throws(
    () => mergeCurrentArtifacts(partial, floor),
    /all corpus repositories/,
  );
});

test("unknown artifacts and control keys in corpus artifacts are rejected", () => {
  assert.equal(recordsFixtureControls(["corpus"]), false);
  assert.equal(recordsFixtureControls(FIXTURE_SUITES), true);
  const unknown = artifacts();
  unknown.push({ ...structuredClone(unknown[0]), suites: ["unknown"] });
  assert.throws(
    () => mergeCurrentArtifacts(unknown, floor),
    new RegExp(`exactly ${CORPUS_SHARDS + 1}`),
  );
  const contaminated = artifacts();
  const foreign =
    "differential:fixtures/ts-backend-positive|textDocument/hover|/contents:value";
  contaminated[1].current.push(foreign);
  // Classified too, so the artifact is well-formed and the scope check is the
  // only thing left that can reject it.
  contaminated[1].mechanisms[foreign] = ["unclassified"];
  assert.throws(
    () => mergeCurrentArtifacts(contaminated, floor),
    /out-of-scope ratchet key/,
  );
});

test("revision, universe, and population drift cannot false-shrink", () => {
  const revision = artifacts();
  revision[2].projectRevision = "other";
  assert.throws(
    () => mergeCurrentArtifacts(revision, floor),
    /different project revisions/,
  );
  const universe = artifacts();
  universe[2].universeHash = "other";
  assert.throws(
    () => mergeCurrentArtifacts(universe, floor),
    /universe hashes differ/,
  );
  const population = structuredClone(floor);
  population["bits-ui"].requests++;
  assert.throws(
    () => mergeCurrentArtifacts(artifacts(), population),
    /population is/,
  );
});

test("a re-baseline may rewrite the population, and still not a partial run", () => {
  // The declaration refuses a grown corpus as loudly as a shrunken one, which is
  // right for a verdict and blocks the very command that could refresh it
  // (#4465). Relaxing it must move exactly one guard: completeness is enforced
  // by the shard set and the universe hash, neither of which reads the file.
  const drifted = structuredClone(floor);
  drifted["bits-ui"].files += 7;
  const merged = mergeCurrentArtifacts(artifacts(), drifted, {
    allowPopulationChange: true,
  });
  assert.equal(merged.populationChanges.length, 1);
  assert.match(merged.populationChanges[0], /bits-ui files population is/);
  assert.equal(merged.population["bits-ui"].files, CORPUS_SHARDS);

  // Same call, unrelaxed: the default still refuses.
  assert.throws(
    () => mergeCurrentArtifacts(artifacts(), drifted),
    /population is/,
  );

  // …and the relaxation buys a partial run nothing: drop a shard, corrupt the
  // universe hash, and each still throws with the flag set.
  assert.throws(
    () =>
      mergeCurrentArtifacts(artifacts().slice(0, -1), drifted, {
        allowPopulationChange: true,
      }),
    /expected exactly/,
  );
  const universe = artifacts();
  universe[2].universeHash = "other";
  assert.throws(
    () =>
      mergeCurrentArtifacts(universe, drifted, { allowPopulationChange: true }),
    /universe hashes differ/,
  );
  // An unchanged population reports nothing, so the writer stays quiet.
  assert.deepEqual(
    mergeCurrentArtifacts(artifacts(), floor, { allowPopulationChange: true })
      .populationChanges,
    [],
  );
});

test("a deleted baseline file remains owned by one stable shard", () => {
  const id = "corpus/bits-ui/deleted.svelte";
  assert.equal(
    Array.from(
      { length: CORPUS_SHARDS },
      (_, index) => corpusShardIndex(id, CORPUS_SHARDS) === index,
    ).filter(Boolean).length,
    1,
  );
});

test("an artifact whose mechanism map does not cover its keys is rejected", () => {
  const short = artifacts();
  short[0].mechanisms = {};
  assert.throws(
    () => mergeCurrentArtifacts(short, floor),
    /carries no mechanism for/,
  );
  const extra = artifacts();
  extra[0].mechanisms["differential:fixtures/b|initialize|/x:value"] = ["ts-render"];
  assert.throws(
    () => mergeCurrentArtifacts(extra, floor),
    /carries a mechanism for unlisted/,
  );
  const absent = artifacts();
  delete absent[0].mechanisms;
  assert.throws(() => mergeCurrentArtifacts(absent, floor), /lacks mechanisms/);
});

test("the merged mechanism map is the union over the artifact set", () => {
  const values = artifacts();
  const merged = mergeCurrentArtifacts(values, floor);
  assert.equal(
    Object.keys(merged.mechanisms).length,
    merged.current.length,
    "every merged key carries a mechanism set",
  );
  assert.deepEqual(
    merged.mechanisms["differential:fixtures/a|initialize|/capabilities:value"],
    ["unclassified"],
  );
});
