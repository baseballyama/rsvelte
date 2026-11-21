import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { revision, revisionOrNull } from './revision.ts';

const root = path.resolve(import.meta.dirname, '../../..');

test('the top of a checkout gives its HEAD', () => {
	assert.match(revision(root), /^[a-f0-9]{40}$/);
});

test('a directory inside a checkout or outside every checkout throws', () => {
	assert.throws(() => revision(path.join(root, 'tools')), /not a checkout of its own/);
	const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-revision-'));
	try {
		assert.throws(() => revision(outside), /git rev-parse/);
	} finally {
		fs.rmSync(outside, { recursive: true });
	}
});

test('revisionOrNull gives null where revision throws', () => {
	assert.equal(revisionOrNull(root), revision(root));
	assert.equal(revisionOrNull(path.join(root, 'tools')), null);
});
