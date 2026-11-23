import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { outermost } from './folders.ts';

const at = (...parts: string[]) => path.join(path.sep, 'w', ...parts);

test('a folder inside another is left to the outer one', () => {
	const folders = [at('repo', 'app'), at('repo'), at('other'), at('repo-app')];
	assert.deepEqual(
		outermost(folders, (f) => f),
		[at('repo'), at('other'), at('repo-app')],
	);
});

test('only the folders that are served compete, so an inner served folder stays', () => {
	// The outer folder installs no @rsvelte/cli, so the caller passes only the inner one.
	assert.deepEqual(
		outermost([at('repo', 'app')], (f) => f),
		[at('repo', 'app')],
	);
});
