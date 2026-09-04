#!/usr/bin/env node
// The hover report's terminal covers a SET of labels, and the set is a claim.
//
// `lsp-mechanisms.json` points nine labels at
// `tsgo-lsp-hover-renders-declarations-differently-from-tsc.md`, and the reason
// is that `mechanism.mjs`'s `TS_RENDER_RULES` implements that report's
// renderings one rewrite each. Nothing enforces the correspondence: a tenth
// rendering rule added later inherits the attribution by name, and a report
// whose scope someone narrows leaves the extra labels pointing at it.
//
// So the invariant is stated as a set equality rather than as a count -- a
// count in a comment is the thing that goes stale, and this file would be
// where it went stale.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MECHANISMS } from "../compat-lsp/mechanism.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT =
  "upstream_issues/tsgo-lsp-hover-renders-declarations-differently-from-tsc.md";
// The one label answered by that report whose name is not a rendering rule:
// `classifyHover` returns it when official's whole hover is the origin line the
// report says tsgo drops, so it is that rendering with nothing left behind it.
const DEGENERATE = "rsvelte-empty-import-only";
// The residue of the same rewrites. `mechanism.mjs` states in the source that it
// is NOT attributed to tsgo, so a terminal here would be the misclassification
// nothing corrects.
const RESIDUE = "ts-render";

export function check(declared) {
  const problems = [];
  const terminalOf = (label) => declared[label]?.terminal ?? null;
  const renderingRules = MECHANISMS.filter(
    (label) => label.startsWith("ts-render-"),
  );
  const pointedAtReport = MECHANISMS.filter(
    (label) => terminalOf(label) === REPORT,
  );
  const expected = new Set([...renderingRules, DEGENERATE]);
  const actual = new Set(pointedAtReport);
  for (const label of expected)
    if (!actual.has(label))
      problems.push(
        `${label} is a rendering rule and does not name ${REPORT} (terminal ${JSON.stringify(terminalOf(label))})`,
      );
  for (const label of actual)
    if (!expected.has(label))
      problems.push(
        `${label} names ${REPORT} and is neither a \`ts-render-*\` rule nor ${DEGENERATE}`,
      );
  if (terminalOf(RESIDUE) !== null)
    problems.push(
      `${RESIDUE} has terminal ${JSON.stringify(terminalOf(RESIDUE))}; mechanism.mjs states it is the residue the report does not explain, so which side is wrong is unmeasured`,
    );
  return problems;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const sidecar = JSON.parse(
    fs.readFileSync(path.join(ROOT, "compatibility/lsp-mechanisms.json"), "utf8"),
  );
  const declared = sidecar.mechanisms ?? {};
  const problems = check(declared);
  const covered = Object.keys(declared).filter(
    (label) => declared[label]?.terminal === REPORT,
  ).length;
  console.log(
    `[lsp-hover-terminal-scope] ${covered} labels answered by ${path.basename(REPORT)}; ${RESIDUE} unattributed`,
  );
  if (problems.length) {
    for (const problem of problems) console.error(problem);
    process.exit(1);
  }
}
