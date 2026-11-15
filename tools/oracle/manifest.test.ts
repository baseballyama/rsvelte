import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writes } from './manifest.ts';
import type { Task, Unit } from './types.ts';

const compile = {
	id: 'svelte.compile',
	oracles: [],
	variants: [{ id: 'client' }, { id: 'server' }],
	appliesTo: () => true,
	run: () => ({}),
} as unknown as Task;
const unit = (skip: Record<string, string>) => ({ fixture: { skip } }) as unknown as Unit;

test("a pack keeps a skipped unit's entries while a reader of it applies", () => {
	// readers.toml: svelte.compile.warnings reads the client pack.
	const skipped = unit({ 'svelte.compile': 'wrong code' });
	assert.equal(writes(compile, 'client', skipped), true);
	assert.equal(writes(compile, 'server', skipped), false);
	const both = unit({ 'svelte.compile': 'wrong code', 'svelte.compile.warnings': 'wrong text' });
	assert.equal(writes(compile, 'client', both), false);
	assert.equal(writes(compile, 'client', unit({})), true);
});
