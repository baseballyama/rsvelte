#!/usr/bin/env node
// Keep the output-preserving job from silently degrading into a head-only or
// same-binary comparison. The controls are deliberately structural: this is a
// workflow contract, not a compiler test.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workflow = readFileSync(join(here, '..', '..', '.github', 'workflows', 'differential-corpus.yml'), 'utf8');

let failures = 0;
function check(name, condition) {
	if (condition) console.log(`  ok   ${name}`);
	else {
		failures++;
		console.error(`  FAIL ${name}`);
	}
}

console.log('differential corpus workflow self-test');
check('uses the explicit opt-in label', /contains\(github\.event\.pull_request\.labels\.\*\.name, 'output-preserving'\)/.test(workflow));
check('reruns when the label changes or the PR synchronizes', /types: \[opened, synchronize, reopened, labeled, unlabeled\]/.test(workflow));
check('checks out the current merge ref', /ref: refs\/pull\/\$\{\{ github\.event\.pull_request\.number \}\}\/merge/.test(workflow));
check('archives only the base core source', /git archive "\$BASE_SHA" crates\/rsvelte_core/.test(workflow));
check('uses isolated base and arm target directories', /--target-dir \.differential\/target\/arm/.test(workflow) && /--target-dir \.differential\/target\/base/.test(workflow));
check('requires distinct binary hashes when core changed', /git diff --quiet "\$BASE_SHA" HEAD -- crates\/rsvelte_core/.test(workflow) && /sha256sum \.differential\/bin\/base-corpus-hash/.test(workflow) && /test "\$base_hash" != "\$arm_hash"/.test(workflow));
check('diffs all four targets', /for target in client server client-dev server-dev/.test(workflow));
check('maps server to the server flag', /server\) args=\(--server\)/.test(workflow));
check('maps client-dev to the dev flag', /client-dev\) args=\(--dev\)/.test(workflow));
check('maps server-dev to both flags', /server-dev\) args=\(--server --dev\)/.test(workflow));
check('uses the labelled differential harness', /node scripts\/dev\/diff-corpus-hash\.mjs/.test(workflow) && /--label base/.test(workflow) && /--label arm/.test(workflow));

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
