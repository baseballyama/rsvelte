import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latestRelease, pinnedRevision, report } from './rebase.ts';

const rev = (c: string) => c.repeat(40);
const crate = (name: string, r: string) =>
	`${name} = { git = "https://github.com/baseballyama/oxc", rev = "${r}" }\n`;

test('the pin is the one revision of every oxc crate', () => {
	assert.equal(pinnedRevision(crate('oxc_ast', rev('a')) + crate('oxc_span', rev('a'))), rev('a'));
	assert.throws(() => pinnedRevision(crate('oxc_ast', rev('a')) + crate('oxc_span', rev('b'))));
	assert.throws(() => pinnedRevision('serde = "1"\n'));
});

test('the latest release is the highest version, not the last in text order', () => {
	assert.equal(
		latestRelease(['oxlint_v1.9.0', 'oxlint_v1.10.0', 'oxfmt_v9.0.0', 'oxlint_v1.10.0-rc', '']),
		'oxlint_v1.10.0',
	);
	assert.equal(latestRelease(['oxfmt_v1.0.0']), undefined);
});

test('a conflict names the commit and its files', () => {
	const text = report(
		{ kind: 'conflict', release: 'oxlint_v1.94.0', commit: 'abc feat: x', files: ['a.rs'] },
		rev('c'),
		3,
	);
	assert.match(text, /3 patches on top of `cccccccccc` do not rebase onto oxlint_v1\.94\.0/);
	assert.match(text, /`abc feat: x` conflicts in:\n\n- `a\.rs`/);
});
