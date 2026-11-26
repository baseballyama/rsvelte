import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recorded, uncovered } from './error-coverage.ts';

test('the codes no corpus unit raises are the recorded ones', () => {
	const found = uncovered();
	const listed = recorded();
	const lost = found.filter((code) => !listed.includes(code));
	const gained = listed.filter((code) => !found.includes(code));
	// A code that leaves the list gained a unit, and one that joins it lost its last unit.
	assert.deepEqual(
		{ lost, gained },
		{ lost: [], gained: [] },
		'record the change with `node error-coverage.ts --update` in tools/oracle',
	);
});
