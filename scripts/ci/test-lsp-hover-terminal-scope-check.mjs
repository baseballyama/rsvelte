#!/usr/bin/env node
// Each control names the shape it pins, and the name is checked against the
// mutation it applies: a control whose name does not describe its own input is
// read later as coverage it does not have.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "./lsp-hover-terminal-scope-check.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT =
  "upstream_issues/tsgo-lsp-hover-renders-declarations-differently-from-tsc.md";
const real = JSON.parse(
  fs.readFileSync(path.join(ROOT, "compatibility/lsp-mechanisms.json"), "utf8"),
).mechanisms;
const clone = () => JSON.parse(JSON.stringify(real));

let failures = 0;
const expect = (name, problems, wanted) => {
  const got = problems.length > 0;
  if (got !== wanted) {
    console.error(
      `FAIL ${name}: expected ${wanted ? "problems" : "none"}, got ${problems.length ? problems.join(" / ") : "none"}`,
    );
    failures += 1;
  } else console.log(`ok   ${name}`);
};

expect("the tree as committed", check(clone()), false);

// A rendering rule added later inherits the attribution by name only if someone
// writes it; with no terminal it must be reported rather than assumed.
const added = clone();
added["ts-render-tuple-order"] = { terminal: null };
const withAdded = check(added);
// The label is not in MECHANISMS, so the checker cannot see it: this control
// records that limit rather than pretending it is covered.
expect("a label absent from MECHANISMS is invisible here", withAdded, false);

const dropped = clone();
dropped["ts-render-union-order"].terminal = null;
expect("a rendering rule losing its terminal", check(dropped), true);

const widened = clone();
widened["ts-type-any"].terminal = REPORT;
expect("a non-rendering label pointed at the report", check(widened), true);

const residue = clone();
residue["ts-render"].terminal = REPORT;
expect("the residue given the report as a terminal", check(residue), true);

const degenerate = clone();
degenerate["rsvelte-empty-import-only"].terminal = null;
expect("the degenerate case losing its terminal", check(degenerate), true);

if (failures) {
  console.error(`\n[test-lsp-hover-terminal-scope-check] ${failures} control(s) failed.`);
  process.exit(1);
}
console.log("all lsp-hover-terminal-scope-check controls pass");
