import assert from 'node:assert/strict';
import { test } from 'node:test';
import { view } from './playground.ts';

test('shows lint findings and diagnostics as problems, and other files as files', () => {
	const lint = JSON.stringify({
		rules: ['no-unused-vars'],
		findings: [
			{
				rule: 'no-unused-vars',
				message: "'unused' is assigned a value but never used.",
				start: { line: 3, column: 7 },
				end: { line: 3, column: 13 },
			},
		],
	});
	const shown = view({
		id: 'svelte.lint/default',
		files: [
			{ name: 'lint.json', text: lint },
			{ name: 'js', text: 'export {}' },
		],
		diagnostics: [
			{
				code: 'parse_error',
				message: 'oops',
				severity: 'error',
				start: { line: 1, column: 2 },
				end: { line: 1, column: 3 },
			},
		],
	});
	assert.deepEqual(shown.files, [{ name: 'js', text: 'export {}' }]);
	assert.deepEqual(shown.problems, [
		{
			start: { line: 1, column: 2 },
			end: { line: 1, column: 3 },
			rule: 'parse_error',
			message: 'oops',
			severity: 'error',
		},
		{
			start: { line: 3, column: 7 },
			end: { line: 3, column: 13 },
			rule: 'no-unused-vars',
			message: "'unused' is assigned a value but never used.",
			severity: 'warning',
		},
	]);
});
