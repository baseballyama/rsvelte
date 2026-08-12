#!/usr/bin/env node

import assert from 'node:assert/strict';
import { TARGETS, TARGET_KEYS } from '../compat-corpus/targets.mjs';

assert.equal(
	new Set(TARGET_KEYS).size,
	TARGET_KEYS.length,
	`duplicate corpus targets: ${TARGET_KEYS.join(', ')}`,
);
assert.equal(
	TARGETS.length,
	TARGET_KEYS.length,
	'mutation accounting must run each configured target exactly once',
);
assert.deepEqual(TARGET_KEYS, ['client', 'server', 'server-dev', 'client-dev']);

console.log(`[test-corpus-targets] ✅ ${TARGET_KEYS.length} unique targets: ${TARGET_KEYS.join(', ')}`);
