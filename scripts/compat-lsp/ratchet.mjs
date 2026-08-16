import { createHash } from "node:crypto";

const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

export function compactCorpusObservation(method, position, differences) {
  return {
    method,
    position,
    diffDigest: digest([...differences].sort()),
    fieldCount: differences.length,
  };
}

export function aggregateCorpusDifferences(fileId, observations) {
  const byMethod = new Map();
  for (const observation of observations) {
    byMethod.set(observation.method, [
      ...(byMethod.get(observation.method) ?? []),
      observation,
    ]);
  }
  const entries = [];
  for (const [method, values] of [...byMethod].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const normalized = values
      .map((value) =>
        value.diffDigest
          ? {
              position: value.position,
              diffDigest: value.diffDigest,
              fieldCount: value.fieldCount,
            }
          : compactCorpusObservation(
              value.method,
              value.position,
              value.differences,
            ),
      )
      .sort((left, right) => left.position.localeCompare(right.position));
    // Neither the field count nor a digest of the per-request diffs reproduces:
    // two full sweeps of one revision moved 664 of 16,348 keys on those two
    // components alone, and none on the request count.
    entries.push(
      `aggregate:${fileId}|${method}|divergentRequestCount=${normalized.length}`,
    );
  }
  return entries;
}

export function baselineRewriteReasons(
  selectedSuites,
  allSuites,
  selectedRepos,
  allRepos,
  narrowed = [],
) {
  return [
    selectedSuites.length !== allSuites.length ||
    allSuites.some((suite) => !selectedSuites.includes(suite))
      ? `--suites measured [${selectedSuites.join(", ")}], not all [${allSuites.join(", ")}] (FALSE-SHRINK)`
      : false,
    selectedRepos.length !== allRepos.length ||
    allRepos.some((repo) => !selectedRepos.includes(repo))
      ? `--corpus-repos measured [${selectedRepos.join(", ")}], not all [${allRepos.join(", ")}] (FALSE-SHRINK)`
      : false,
    ...narrowed,
  ];
}

export function assertNonemptySuites(cases, selectedSuites) {
  for (const suite of selectedSuites) {
    if (!cases.some((entry) => entry.suite === suite))
      throw new Error(`${suite} selected but discovered zero cases`);
  }
}

export function shardCorpusCases(cases, shard) {
  if (!shard) return cases;
  return cases.filter((entry) => {
    if (entry.suite !== "corpus") return true;
    return corpusShardIndex(entry.id, shard.count) === shard.index;
  });
}

export function corpusShardIndex(id, count) {
  return createHash("sha256").update(id).digest().readUInt32BE(0) % count;
}

export function selectKnownForScope(
  known,
  selectedSuites,
  selectedRepos,
  shard,
) {
  const scopes = selectedSuites.map((suite) => `${suite}/`);
  return known.filter((entry) => {
    const rest = entry.slice(entry.indexOf(":") + 1);
    if (!scopes.some((scope) => rest.startsWith(scope))) return false;
    if (!rest.startsWith("corpus/")) return true;
    if (!selectedRepos.some((repo) => rest.startsWith(`corpus/${repo}/`)))
      return false;
    if (!shard) return true;
    return (
      corpusShardIndex(rest.slice(0, rest.indexOf("|")), shard.count) ===
      shard.index
    );
  });
}
