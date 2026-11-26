import assert from 'node:assert/strict';
import { test } from 'node:test';
import { admitted } from './test262.ts';

const test262 = (meta: string) => `/*---\n${meta}\n---*/\nlet a = 1;\n`;

test('a test that must fail to parse or runs only in sloppy mode is left out', () => {
	assert.equal(admitted(test262('description: plain')), true);
	assert.equal(admitted(test262('flags: [module, async]')), true);
	assert.equal(admitted(test262('negative:\n  phase: parse\n  type: SyntaxError')), false);
	assert.equal(admitted(test262('flags: [noStrict]')), false);
	assert.equal(admitted('let a = 1;\n'), false);
});
