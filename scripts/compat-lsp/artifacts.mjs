import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { corpusShardIndex } from "./ratchet.mjs";
import { CORPUS_REPOS } from "./suites.mjs";

// 2 adds `mechanisms`: an artifact that predates it cannot populate the sidecar,
// and a merge that silently accepted one would write a short map rather than fail.
export const ARTIFACT_SCHEMA = 2;
export const CORPUS_SHARDS = 16;
export const FIXTURE_SUITES = [
  "fixtures",
  "upstream-features",
  "upstream-testfiles",
];
export const CONFIGURATION_ID = "lsp-diff-v12";

export const recordsFixtureControls = (suites) => suites.includes("fixtures");

export const hashValues = (values) =>
  createHash("sha256")
    .update([...values].sort().join("\n"))
    .digest("hex");

function revision(directory) {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: directory,
    encoding: "utf8",
  }).trim();
}

export function createCurrentArtifact({
  root,
  suites,
  repos,
  shard,
  universeIds,
  measuredIds,
  population,
  current,
  counts,
  mechanisms = {},
  diagnosticDetails = {},
}) {
  const sourceRevisions = {
    "language-tools": revision(path.join(root, "submodules/language-tools")),
  };
  for (const repo of repos)
    sourceRevisions[repo] = revision(path.join(root, "submodules", repo));
  return {
    schemaVersion: ARTIFACT_SCHEMA,
    projectRevision: revision(root),
    configurationId: CONFIGURATION_ID,
    suites,
    repos,
    shard,
    sourceRevisions,
    universeHash: hashValues(universeIds),
    measuredIds: [...measuredIds].sort(),
    population,
    counts,
    current: [...current].sort(),
    // Always written, even when empty: an absent map and an unclassified run
    // are different facts, and only one of them is a wiring failure.
    mechanisms: Object.fromEntries(
      Object.entries(mechanisms)
        .map(([id, labels]) => [id, [...new Set(labels)].sort()])
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
    ...(Object.keys(diagnosticDetails).length ? { diagnosticDetails } : {}),
  };
}

function sameArray(left, right) {
  return (
    left.length === right.length && left.every((value, i) => value === right[i])
  );
}

function requireArtifact(value, label) {
  if (value?.schemaVersion !== ARTIFACT_SCHEMA)
    throw new Error(`${label} has an unsupported artifact schema`);
  for (const field of ["projectRevision", "configurationId", "universeHash"])
    if (typeof value[field] !== "string" || !value[field])
      throw new Error(`${label} lacks ${field}`);
  for (const field of ["suites", "repos", "measuredIds", "current"])
    if (!Array.isArray(value[field]))
      throw new Error(`${label} lacks ${field}`);
  if (!value.mechanisms || typeof value.mechanisms !== "object")
    throw new Error(`${label} lacks mechanisms`);
  // Coverage is asserted per artifact rather than on the union: a shard that
  // classified nothing is otherwise invisible once sixteen maps are merged.
  for (const id of value.current)
    if (!Array.isArray(value.mechanisms[id]) || !value.mechanisms[id].length)
      throw new Error(`${label} carries no mechanism for ${id}`);
  for (const id of Object.keys(value.mechanisms))
    if (!value.current.includes(id))
      throw new Error(`${label} carries a mechanism for unlisted ${id}`);
}

export function mergeCurrentArtifacts(artifacts, populationFloor) {
  if (!artifacts.length) throw new Error("zero current artifacts supplied");
  if (artifacts.length !== CORPUS_SHARDS + 1)
    throw new Error(`expected exactly ${CORPUS_SHARDS + 1} current artifacts`);
  artifacts.forEach((artifact, index) =>
    requireArtifact(artifact, `artifact ${index}`),
  );
  const reference = artifacts[0];
  for (const artifact of artifacts) {
    if (artifact.projectRevision !== reference.projectRevision)
      throw new Error("artifacts were measured at different project revisions");
    if (artifact.configurationId !== reference.configurationId)
      throw new Error("artifacts used different comparison configurations");
    if (
      artifact.sourceRevisions["language-tools"] !==
      reference.sourceRevisions["language-tools"]
    )
      throw new Error("artifacts used different language-tools revisions");
  }

  const fixtureArtifacts = artifacts.filter((artifact) =>
    sameArray(artifact.suites, FIXTURE_SUITES),
  );
  if (
    fixtureArtifacts.length !== 1 ||
    fixtureArtifacts[0].repos.length ||
    fixtureArtifacts[0].shard
  )
    throw new Error("expected exactly one unsharded fixture/upstream artifact");
  if (
    fixtureArtifacts[0].current.some(
      (entry) =>
        !/^(?:differential|expected):(?:fixtures|upstream-features|upstream-testfiles)\//.test(
          entry,
        ),
    )
  )
    throw new Error("fixture artifact contains an out-of-scope ratchet key");

  const corpusArtifacts = artifacts.filter((artifact) =>
    sameArray(artifact.suites, ["corpus"]),
  );
  if (corpusArtifacts.length !== CORPUS_SHARDS)
    throw new Error(`expected exactly ${CORPUS_SHARDS} corpus shard artifacts`);
  if (fixtureArtifacts.length + corpusArtifacts.length !== artifacts.length)
    throw new Error("artifact set contains an unknown suite combination");
  const seenShards = new Set();
  const seenIds = new Set();
  const population = Object.fromEntries(
    CORPUS_REPOS.map((repo) => [
      repo,
      { files: 0, identifiers: 0, requests: 0 },
    ]),
  );
  let corpusUniverseHash;
  for (const artifact of corpusArtifacts) {
    if (
      artifact.current.some((entry) => !entry.startsWith("aggregate:corpus/"))
    )
      throw new Error("corpus artifact contains an out-of-scope ratchet key");
    if (!sameArray(artifact.repos, CORPUS_REPOS))
      throw new Error(
        "each corpus artifact must measure all corpus repositories",
      );
    if (!artifact.shard || artifact.shard.count !== CORPUS_SHARDS)
      throw new Error(
        `each corpus artifact must be one of ${CORPUS_SHARDS} shards`,
      );
    if (seenShards.has(artifact.shard.index))
      throw new Error(
        `duplicate corpus shard ${artifact.shard.index}/${CORPUS_SHARDS}`,
      );
    seenShards.add(artifact.shard.index);
    if (corpusUniverseHash && artifact.universeHash !== corpusUniverseHash)
      throw new Error("corpus shard universe hashes differ");
    corpusUniverseHash = artifact.universeHash;
    for (const repo of CORPUS_REPOS) {
      if (
        artifact.sourceRevisions[repo] !==
        corpusArtifacts[0].sourceRevisions[repo]
      )
        throw new Error(`${repo} source revision differs between shards`);
      for (const field of ["files", "identifiers", "requests"])
        population[repo][field] += artifact.population?.[repo]?.[field] ?? 0;
    }
    for (const id of artifact.measuredIds) {
      if (corpusShardIndex(id, CORPUS_SHARDS) !== artifact.shard.index)
        throw new Error(`${id} is in the wrong stable-hash shard`);
      if (seenIds.has(id))
        throw new Error(`duplicate measured corpus file ${id}`);
      seenIds.add(id);
    }
  }
  if (seenShards.size !== CORPUS_SHARDS)
    throw new Error("the corpus shard set is incomplete");
  if (hashValues(seenIds) !== corpusUniverseHash)
    throw new Error(
      "corpus shard union does not equal the declared file universe",
    );
  for (const repo of CORPUS_REPOS) {
    for (const field of ["files", "identifiers", "requests"]) {
      if (population[repo][field] !== populationFloor[repo]?.[field])
        throw new Error(
          `${repo} ${field} population is ${population[repo][field]}, expected ${populationFloor[repo]?.[field]}`,
        );
    }
  }
  const current = artifacts.flatMap((artifact) => artifact.current).sort();
  if (new Set(current).size !== current.length)
    throw new Error("current artifacts contain duplicate ratchet keys");
  const mechanisms = {};
  for (const artifact of artifacts)
    for (const [id, labels] of Object.entries(artifact.mechanisms))
      mechanisms[id] = [
        ...new Set([...(mechanisms[id] ?? []), ...labels]),
      ].sort();
  return {
    current,
    mechanisms,
    population,
    projectRevision: reference.projectRevision,
  };
}

export function readArtifacts(directory) {
  const files = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.name.endsWith(".json")) files.push(child);
    }
  }
  visit(directory);
  return files.sort().map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
}
