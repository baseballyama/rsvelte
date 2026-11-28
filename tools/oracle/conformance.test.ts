import assert from 'node:assert/strict';
import { test } from 'node:test';
import { admittedByTest262, admittedByTypescript } from './conformance.ts';

const test262 = (meta: string) => `/*---\n${meta}\n---*/\nlet a = 1;\n`;

test('a test262 test that must fail to parse or runs only in sloppy mode is left out', () => {
	assert.equal(admittedByTest262(test262('description: plain'), 'a.js'), true);
	assert.equal(admittedByTest262(test262('flags: [module, async]'), 'a.js'), true);
	assert.equal(
		admittedByTest262(test262('negative:\n  phase: parse\n  type: SyntaxError'), 'a.js'),
		false,
	);
	assert.equal(admittedByTest262(test262('flags: [noStrict]'), 'a.js'), false);
	assert.equal(admittedByTest262('let a = 1;\n', 'a.js'), false);
});

test('a TypeScript test of several files, or one TypeScript cannot parse, is left out', () => {
	assert.equal(admittedByTypescript('let a: number = 1;\n', 'a.ts'), true);
	assert.equal(admittedByTypescript('// @filename: b.ts\nexport {};\n', 'a.ts'), false);
	assert.equal(admittedByTypescript('let a: = 1;\n', 'a.ts'), false);
	assert.equal(admittedByTypescript('declare let a: number;\n', 'a.d.ts'), false);
});
