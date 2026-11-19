import assert from 'node:assert/strict';
import { test } from 'node:test';
import { changelogEntry } from './notes.ts';

test('the release notes are the changelog entry of the version alone', () => {
	const changelog = [
		'# @rsvelte/cli',
		'',
		'## 0.2.0',
		'',
		'### Minor Changes',
		'',
		'- abc123: Format with the project options',
		'',
		'## 0.1.1',
		'',
		'- def456: Older',
		'',
	].join('\n');
	assert.equal(
		changelogEntry(changelog, '0.2.0'),
		'### Minor Changes\n\n- abc123: Format with the project options',
	);
	assert.equal(changelogEntry(changelog, '0.1.1'), '- def456: Older');
	assert.throws(() => changelogEntry(changelog, '0.3.0'));
});
