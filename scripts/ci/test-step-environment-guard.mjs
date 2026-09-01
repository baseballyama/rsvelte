#!/usr/bin/env node
// Self-test for scripts/ci/step-environment-guard.mjs.
//
// The guard passing on the current tree proves nothing — the tree is what it
// was written against, and the fix landed in the same commit. Every case below
// is a control: the shape the guard must reject, paired with the near-miss it
// must accept, so a rule that flags everything and a rule that flags nothing
// both fail here.

import { parseJobs, violations } from './step-environment-guard.mjs';

let failures = 0;

function check(name, fn) {
	try {
		fn();
		console.log(`  ok   ${name}`);
	} catch (err) {
		failures++;
		console.error(`  FAIL ${name}\n       ${err.message}`);
	}
}

const assert = (cond, message) => {
	if (!cond) throw new Error(message);
};

const found = (yaml) => violations(parseJobs(yaml), 'x.yml');

const CHECKOUT = '      - uses: actions/checkout@abc # v7.0.1';

// The #4140 shape: a doc check at the head of the job, setup after it, and the
// comparison guarded by `!cancelled()`. The comparison runs with no
// `node_modules` and reports the environment failure under its own name.
const REGRESSION = `
jobs:
  shape-matrix:
    steps:
${CHECKOUT}
      - name: Verify docs
        run: node scripts/check.mjs
      - name: Install deps
        run: pnpm install --frozen-lockfile
      - name: Shape matrix parity
        if: \${{ !cancelled() }}
        run: node scripts/matrix.mjs
`;

const FIXED = REGRESSION.replace(
	'      - name: Install deps\n        run: pnpm install --frozen-lockfile',
	'      - name: Install deps\n        id: env\n        run: pnpm install --frozen-lockfile',
).replace("if: ${{ !cancelled() }}", "if: ${{ !cancelled() && steps.env.outcome == 'success' }}");

check('flags a guarded comparison with unguarded setup before it', () => {
	const v = found(REGRESSION);
	assert(v.length === 1, `expected 1 violation, got ${v.length}`);
	assert(/Shape matrix parity/.test(v[0]), `violation names the wrong step: ${v[0]}`);
});

check('accepts the same job once the guard requires the setup outcome', () => {
	const v = found(FIXED);
	assert(v.length === 0, `expected 0 violations, got ${v.length}: ${v[0]}`);
});

// The case `!cancelled()` was WRITTEN for. Requiring a sibling check's outcome
// would restore the bug it fixed, so a rule that flags this is wrong — this is
// the near-miss that separates "the environment is missing" from "an earlier
// check found something".
check('does not flag sibling checks that install nothing', () => {
	const v = found(`
jobs:
  guards:
    steps:
${CHECKOUT}
      - name: Check triggers
        run: node scripts/ci/a.mjs
      - name: Check pins
        if: \${{ !cancelled() }}
        run: node scripts/ci/b.mjs
`);
	assert(v.length === 0, `expected 0 violations, got ${v.length}: ${v[0]}`);
});

// An artifact upload guarded by `!cancelled()` is the intended shape: its whole
// purpose is to run while the job is red.
check('does not flag an artifact upload', () => {
	const v = found(`
jobs:
  corpus:
    steps:
${CHECKOUT}
      - name: Install deps
        run: pnpm install
      - name: Upload report
        if: \${{ !cancelled() }}
        uses: actions/upload-artifact@abc
`);
	assert(v.length === 0, `expected 0 violations, got ${v.length}: ${v[0]}`);
});

// A checkout cannot leave a partial environment: if it fails there is no tree.
check('does not treat checkout alone as fragile setup', () => {
	const v = found(`
jobs:
  guards:
    steps:
${CHECKOUT}
      - name: Check something
        if: \${{ !cancelled() }}
        run: node scripts/ci/a.mjs
`);
	assert(v.length === 0, `expected 0 violations, got ${v.length}: ${v[0]}`);
});

// `always()` carries the same hazard as `!cancelled()` and must be covered by
// the same rule; a guard that only knew the one spelling would miss
// lsp-benchmark.yml's report validation.
check('covers always() as well as !cancelled()', () => {
	const v = found(`
jobs:
  benchmark:
    steps:
${CHECKOUT}
      - name: Build server
        run: cargo build --release -p x
      - name: Validate report
        if: always()
        run: node -e ''
`);
	assert(v.length === 1, `expected 1 violation, got ${v.length}`);
});

// A `uses:` action other than checkout is setup by definition — setup-rust,
// setup-node-pnpm and the caches all leave state a later step reads.
check('treats a non-checkout action as setup', () => {
	const v = found(`
jobs:
  corpus:
    steps:
${CHECKOUT}
      - uses: ./.github/actions/setup-node-pnpm
      - name: Compare
        if: \${{ !cancelled() }}
        run: node scripts/compare.mjs
`);
	assert(v.length === 1, `expected 1 violation, got ${v.length}`);
});

// A guarded step BEFORE the setup cannot be affected by it, so requiring the
// outcome of a step that has not run yet would be meaningless.
check('ignores a guarded step that precedes the setup', () => {
	const v = found(`
jobs:
  corpus:
    steps:
${CHECKOUT}
      - name: Early check
        if: \${{ !cancelled() }}
        run: node scripts/ci/a.mjs
      - name: Install deps
        run: pnpm install
`);
	assert(v.length === 0, `expected 0 violations, got ${v.length}: ${v[0]}`);
});

console.log(failures ? `\n${failures} failure(s)` : '\nall step-environment-guard controls pass');
process.exit(failures ? 1 : 0);
