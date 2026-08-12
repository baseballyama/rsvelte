#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const workflow = readFileSync(
  join(HERE, "..", "..", ".github", "workflows", "ci.yml"),
  "utf8",
);
let failures = 0;

function check(name, condition) {
  if (condition) console.log(`  ok   ${name}`);
  else {
    failures++;
    console.error(`  FAIL ${name}`);
  }
}

console.log("compatibility report workflow self-test");
check(
  "retrieves the PR base SHA artifact",
  /github\.event\.pull_request\.base\.sha/.test(workflow) &&
    /gh run download/.test(workflow),
);
check(
  "passes the downloaded report to the comparator",
  /--base-report "\$base_report"/.test(workflow),
);
check(
  "fails closed when comparison cannot run",
  !/comparison unavailable/.test(workflow) &&
    !/Compare with main \(PR only\)[\s\S]{0,500}continue-on-error/.test(
      workflow,
    ),
);
check(
  "validates and requires the newly generated report",
  /name: Validate compatibility report/.test(workflow) &&
    /--validate/.test(workflow) &&
    /if-no-files-found: error/.test(workflow),
);

process.exitCode = failures === 0 ? 0 : 1;
