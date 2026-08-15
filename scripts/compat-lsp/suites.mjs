import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const SUITES = [
  "fixtures",
  "upstream-features",
  "upstream-testfiles",
  "corpus",
];
export const CORPUS_REPOS = [
  "bits-ui",
  "flowbite-svelte",
  "melt-ui",
  "shadcn-svelte",
];

function fixtureManifest(root) {
  return JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/compat-lsp/upstream-fixture-manifest.json"),
      "utf8",
    ),
  );
}

export function walkFiles(directory, predicate) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".rsvelte-language-server"
    )
      continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(file, predicate));
    else if (predicate(file)) files.push(file);
  }
  return files.sort();
}

export function findServerCaches(roots) {
  const found = new Set();
  function visit(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (
        !entry.isDirectory() ||
        entry.name === "node_modules" ||
        entry.name === ".git"
      )
        continue;
      const child = path.join(directory, entry.name);
      if (entry.name === ".rsvelte-language-server") found.add(child);
      else visit(child);
    }
  }
  for (const root of roots) visit(root);
  return found;
}

export function removeNewServerCaches(before, after) {
  const removed = [];
  for (const directory of after) {
    if (before.has(directory)) continue;
    fs.rmSync(directory, { recursive: true, force: true });
    removed.push(directory);
  }
  return removed;
}

function endPosition(text) {
  const lines = text.split("\n");
  return { line: lines.length - 1, character: lines.at(-1).length };
}

export function identifierPositions(text) {
  return [...identifierPositionIterator(text)];
}

export function* identifierPositionIterator(text) {
  const lines = text.split("\n");
  for (let line = 0; line < lines.length; line++) {
    const regex = /[$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*/gu;
    for (const match of lines[line].matchAll(regex)) {
      yield { line, character: match.index + Math.min(1, match[0].length - 1) };
    }
  }
}

function request(method, params, suffix = "") {
  return { method, params, suffix };
}

function* identifierRequests(uri, text) {
  for (const position of identifierPositionIterator(text)) {
    const params = { textDocument: { uri }, position };
    const suffix = `${position.line}:${position.character}`;
    for (const method of [
      "textDocument/hover",
      "textDocument/definition",
      "textDocument/completion",
    ]) {
      yield request(method, params, suffix);
    }
  }
}

function basicRequests(uri, text) {
  return [
    request("textDocument/diagnostic", { textDocument: { uri } }),
    request("textDocument/foldingRange", { textDocument: { uri } }),
    request("textDocument/documentSymbol", { textDocument: { uri } }),
    request("textDocument/inlayHint", {
      textDocument: { uri },
      range: { start: { line: 0, character: 0 }, end: endPosition(text) },
    }),
  ];
}

function fileCase(suite, root, file, requests, expected) {
  return {
    suite,
    root,
    file,
    loadText: () => fs.readFileSync(file, "utf8"),
    uri: pathToFileURL(file).href,
    id: `${suite}/${path.relative(root, file).split(path.sep).join("/")}`,
    requests,
    expected,
  };
}

function positionAt(text, offset) {
  const before = text.slice(0, offset).split("\n");
  return { line: before.length - 1, character: before.at(-1).length };
}

function fixtureCases(root) {
  const manifest = fixtureManifest(root);
  const directory = path.join(root, "compatibility/lsp-fixtures");
  return manifest.behavior_cases
    .filter((entry) => entry.method.startsWith("textDocument/"))
    .map((entry) => {
      const marker = entry.source.indexOf("¦");
      const text = entry.source.replace("¦", "");
      const file = path.join(directory, `${entry.id}.svelte`);
      const uri = pathToFileURL(file).href;
      const position =
        marker >= 0 ? positionAt(text, marker) : { line: 0, character: 0 };
      let params = { textDocument: { uri } };
      if (
        [
          "textDocument/completion",
          "textDocument/hover",
          "textDocument/linkedEditingRange",
        ].includes(entry.method)
      ) {
        params = { ...params, position };
      } else if (entry.method === "textDocument/selectionRange") {
        params = { ...params, positions: [position] };
      } else if (entry.method === "textDocument/codeAction") {
        params = {
          ...params,
          range: entry.params.range,
          context: {
            diagnostics: [
              {
                range: entry.params.range,
                code: entry.params.diagnostic_code,
                message: "",
                source: "svelte",
              },
            ],
          },
        };
      }
      return {
        suite: "fixtures",
        root: directory,
        file,
        text,
        uri,
        id: `fixtures/${entry.id}`,
        requests: [
          request(
            entry.method,
            params,
            marker >= 0 ? `${position.line}:${position.character}` : "",
          ),
        ],
      };
    });
}

function upstreamFeatureCases(root) {
  const manifest = fixtureManifest(root);
  const pluginsRoot = path.join(root, manifest.upstream_root);
  const cases = [];
  const skipped = [];
  for (const spec of manifest.snapshot_suites) {
    const fixtures = path.join(pluginsRoot, spec.root);
    const exclusions = new Map(
      manifest.exclusions
        .filter((entry) => entry.suite === spec.id)
        .map((entry) => [entry.fixture, entry]),
    );
    const fixtureDirectories = walkFiles(fixtures, (file) =>
      spec.expected_priority.includes(path.basename(file)),
    )
      .map(path.dirname)
      .filter((directory, index, all) => all.indexOf(directory) === index);
    if (fixtureDirectories.length !== spec.fixture_count) {
      throw new Error(
        `${spec.id} manifest says ${spec.fixture_count} fixtures, discovered ${fixtureDirectories.length}`,
      );
    }
    for (const directory of fixtureDirectories) {
      const fixture = path
        .relative(fixtures, directory)
        .split(path.sep)
        .join("/");
      if (exclusions.has(fixture)) {
        skipped.push({
          suite: "upstream-features",
          id: `${spec.id}/${fixture}`,
          reason: exclusions.get(fixture).reason,
        });
        continue;
      }
      const input = path.join(directory, spec.input);
      if (!fs.existsSync(input)) continue;
      const expectedFile = spec.expected_priority
        .map((name) => path.join(directory, name))
        .find(fs.existsSync);
      if (!expectedFile)
        throw new Error(
          `${spec.id}/${fixture} has no expected snapshot from expected_priority`,
        );
      const expected = JSON.parse(fs.readFileSync(expectedFile, "utf8"));
      cases.push(
        fileCase(
          "upstream-features",
          fixtures,
          input,
          (uri, text) => {
            if (spec.request === "textDocument/inlayHint") {
              return [
                request(spec.request, {
                  textDocument: { uri },
                  range: {
                    start: { line: 0, character: 0 },
                    end: endPosition(text),
                  },
                }),
              ];
            }
            return [request(spec.request, { textDocument: { uri } })];
          },
          { method: spec.request, value: expected },
        ),
      );
    }
  }
  return { cases, skipped };
}

function upstreamTestfileCases(root) {
  const manifest = fixtureManifest(root);
  const directory = path.join(
    root,
    "submodules/language-tools/packages/language-server/test/plugins/typescript/testfiles",
  );
  const allFiles = walkFiles(directory, () => true);
  const svelteFiles = allFiles.filter((file) => file.endsWith(".svelte"));
  if (
    allFiles.length !== manifest.testfiles.file_count ||
    svelteFiles.length !== manifest.testfiles.svelte_count
  ) {
    throw new Error(
      `upstream testfiles manifest says ${manifest.testfiles.file_count}/${manifest.testfiles.svelte_count} total/Svelte files, discovered ${allFiles.length}/${svelteFiles.length}`,
    );
  }
  return svelteFiles.map((file) =>
    fileCase("upstream-testfiles", directory, file, basicRequests),
  );
}

export function corpusCases(root, repos) {
  const cases = [];
  for (const repo of repos) {
    const directory = path.join(root, "submodules", repo);
    for (const file of walkFiles(directory, (candidate) =>
      candidate.endsWith(".svelte"),
    )) {
      const entry = fileCase("corpus", directory, file, identifierRequests);
      entry.id = `corpus/${repo}/${path.relative(directory, file).split(path.sep).join("/")}`;
      cases.push(entry);
    }
  }
  return cases;
}

export function corpusPopulation(cases) {
  const population = {};
  for (const entry of cases.filter((entry) => entry.suite === "corpus")) {
    const repo = entry.id.split("/")[1];
    const value = (population[repo] ??= {
      files: 0,
      identifiers: 0,
      requests: 0,
    });
    value.files++;
    const text = entry.text ?? entry.loadText();
    let identifiers = 0;
    for (const _position of identifierPositionIterator(text)) identifiers++;
    value.identifiers += identifiers;
    value.requests += identifiers * 3;
  }
  return population;
}

export function loadCases(root, suites, corpusRepos) {
  const manifest = fixtureManifest(root);
  const cases = [];
  const skipped = [];
  if (suites.includes("fixtures")) cases.push(...fixtureCases(root));
  if (suites.includes("upstream-features")) {
    const upstream = upstreamFeatureCases(root);
    cases.push(...upstream.cases);
    skipped.push(...upstream.skipped);
  }
  if (suites.includes("upstream-testfiles"))
    cases.push(...upstreamTestfileCases(root));
  if (suites.includes("corpus")) cases.push(...corpusCases(root, corpusRepos));
  if (suites.includes("fixtures")) {
    for (const entry of fixtureManifest(root).behavior_cases.filter(
      (entry) => !entry.method.startsWith("textDocument/"),
    )) {
      skipped.push({
        suite: "fixtures",
        id: entry.id,
        reason: `${entry.method} is a native unit contract, not an LSP method`,
      });
    }
  }
  return {
    cases,
    skipped,
    metadata: {
      expectedMethods: [
        ...(suites.includes("fixtures")
          ? manifest.behavior_cases
              .map((entry) => entry.method)
              .filter((method) => method.startsWith("textDocument/"))
          : []),
        ...(suites.includes("upstream-features")
          ? manifest.snapshot_suites.map((entry) => entry.request)
          : []),
        ...(suites.includes("upstream-testfiles")
          ? [
              "textDocument/diagnostic",
              "textDocument/foldingRange",
              "textDocument/documentSymbol",
              "textDocument/inlayHint",
            ]
          : []),
        ...(suites.includes("corpus")
          ? [
              "textDocument/hover",
              "textDocument/definition",
              "textDocument/completion",
            ]
          : []),
      ].filter((method, index, all) => all.indexOf(method) === index),
      upstreamTestfiles: suites.includes("upstream-testfiles")
        ? {
            projectFiles: manifest.testfiles.file_count,
            svelteInputs: manifest.testfiles.svelte_count,
            companionFiles:
              manifest.testfiles.file_count - manifest.testfiles.svelte_count,
          }
        : null,
    },
  };
}
