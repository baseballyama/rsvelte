#!/usr/bin/env node
/**
 * Pins the mapping in `scripts/release/comment-released-versions.mjs` from a
 * released CHANGELOG section back to the pull request that produced it.
 *
 * Every case below is chosen because a plausible implementation gets it wrong
 * and still looks right on the happy path:
 *
 * - A `- Updated dependencies [hash]` entry carries the SAME hash as the
 *   package that actually changed. Any hash scan that does not require the
 *   `<hash>: ` shape reports the PR as released in packages it never touched.
 * - `## 0.1.1` is a prefix of `## 0.1.10`, so a `startsWith` section finder
 *   returns the wrong release's entries — for a release that also happens to
 *   be the newest, that is invisible.
 * - This repo's squash subjects carry TWO `(#N)` groups when the title cites
 *   the issue: `… (#2547) (#2666)`. The first is an issue, the last is the PR;
 *   a non-anchored match comments on the issue as if it were the PR.
 * - `collectReleases` must skip a package whose version did not move. Running
 *   it only on a tree where everything moved cannot show that it can skip, so
 *   the fixture repo below bumps two of four packages and asserts the other
 *   two are absent.
 *
 * Usage: node scripts/dev/test-release-comment.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import {
	MARKER,
	changesetHashesIn,
	collectReleases,
	commentBody,
	packageUrl,
	prNumberFromSubject,
	sectionFor,
} from '../release/comment-released-versions.mjs';

let failed = 0;
const check = (name, got, want) => {
	const ok = JSON.stringify(got) === JSON.stringify(want);
	if (ok) {
		console.log(`ok   ${name}`);
	} else {
		console.error(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`);
		failed++;
	}
};

// ---- sectionFor ---------------------------------------------------------------

const CHANGELOG = [
	'# @rsvelte/compiler',
	'',
	'## 0.1.10',
	'',
	'### Patch Changes',
	'',
	'- aaaaaaa: newest',
	'',
	'## 0.1.1',
	'',
	'### Patch Changes',
	'',
	'- bbbbbbb: older',
	'',
].join('\n');

check('sectionFor picks the requested release', changesetHashesIn(sectionFor(CHANGELOG, '0.1.10')), ['aaaaaaa']);
// The discriminating case: a prefix match would return the 0.1.10 section here.
check('sectionFor is not a prefix match', changesetHashesIn(sectionFor(CHANGELOG, '0.1.1')), ['bbbbbbb']);
check('sectionFor on an unreleased version', sectionFor(CHANGELOG, '9.9.9'), null);

// ---- changesetHashesIn --------------------------------------------------------

const SECTION = [
	'',
	'### Patch Changes',
	'',
	'- c2a8eeb: A real entry.',
	'',
	'  A continuation paragraph of the same entry, which itself contains a list:',
	'',
	'  - deadbee: not a changeset, just prose that looks like one',
	'',
	'- Updated dependencies [c2a8eeb, f2d913c]',
	'  - @rsvelte/compiler@0.10.9',
	'',
].join('\n');

check('changesetHashesIn takes only direct entries', changesetHashesIn(SECTION), ['c2a8eeb']);
// A carry-only section: the hash appears ONLY under `Updated dependencies`, so
// picking it up would credit this package with a change it did not receive.
check(
	'changesetHashesIn ignores a dependency carry',
	changesetHashesIn('\n### Patch Changes\n\n- Updated dependencies [c2a8eeb]\n  - @rsvelte/compiler@0.10.9\n'),
	[],
);
check('changesetHashesIn dedupes', changesetHashesIn('- abc1234: one\n- abc1234: one again'), ['abc1234']);

// ---- prNumberFromSubject ------------------------------------------------------

check('prNumberFromSubject takes the trailing group', prNumberFromSubject('fix(compiler): x (#2547) (#2666)'), 2666);
check('prNumberFromSubject on a single group', prNumberFromSubject('chore: y (#2674)'), 2674);
check('prNumberFromSubject on a direct push', prNumberFromSubject('chore: pushed straight to main'), null);
// An issue cited mid-subject with no PR suffix must not be mistaken for the PR.
check('prNumberFromSubject ignores a mid-subject reference', prNumberFromSubject('fix: repair (#2547) follow-up'), null);

// ---- packageUrl / commentBody -------------------------------------------------

check(
	'packageUrl for a published package',
	packageUrl('@rsvelte/compiler', '0.10.9', false),
	'https://www.npmjs.com/package/@rsvelte/compiler/v/0.10.9',
);
check('packageUrl for a non-npm package', packageUrl('some-private-thing', '1.0.0', true), null);

// The extension is the ONE private package with a URL, and the branch that
// builds it was untested: the two cells above pass whether it returns the
// Marketplace link or null. Its name is also the name the Marketplace publish
// is keyed on, so a rename that misses `packageUrl` reports a dead link.
check(
	'packageUrl for the VS Code extension',
	packageUrl('rsvelte', '0.6.0', true),
	'https://marketplace.visualstudio.com/items?itemName=baseballyama.rsvelte',
);
check('packageUrl still refuses the extension\'s old name', packageUrl('rsvelte-vscode', '0.6.0', true), null);

{
	const body = commentBody([{ name: '@rsvelte/compiler', version: '0.10.9', private: false }], 2666);
	check('commentBody carries the marker', body.includes(MARKER), true);
	check('commentBody names the version', body.includes('@rsvelte/compiler@0.10.9'), true);
	check('commentBody credits the PR on an issue', body.includes('Fixed by #2666'), true);
	const own = commentBody([{ name: '@rsvelte/compiler', version: '0.10.9', private: false }], null);
	check('commentBody on the PR itself omits the credit', own.includes('Fixed by'), false);
}

// ---- collectReleases against a fixture repository -----------------------------

{
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-release-comment-'));
	const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });

	const writePackage = (dir, name, version, changelog) => {
		const abs = path.join(root, 'apps/npm', dir);
		fs.mkdirSync(abs, { recursive: true });
		fs.writeFileSync(path.join(abs, 'package.json'), JSON.stringify({ name, version }, null, 2));
		if (changelog !== null) fs.writeFileSync(path.join(abs, 'CHANGELOG.md'), changelog);
	};

	git('init', '-q', '-b', 'main');
	git('config', 'user.email', 'test@example.com');
	git('config', 'user.name', 'test');

	writePackage('compiler', '@rsvelte/compiler', '0.1.0', '# c\n\n## 0.1.0\n');
	writePackage('lint', '@rsvelte/lint', '0.1.0', '# l\n\n## 0.1.0\n');
	writePackage('fmt', '@rsvelte/fmt', '0.1.0', '# f\n\n## 0.1.0\n');
	writePackage('lint-darwin-arm64', '@rsvelte/lint-darwin-arm64', '0.1.0', '# p\n\n## 0.1.0\n');
	git('add', '-A');
	git('commit', '-qm', 'base');

	// The release: compiler and the platform sidecar bump with entries, lint
	// bumps with an empty section (a `fixed`-group carry), fmt does not move.
	writePackage('compiler', '@rsvelte/compiler', '0.2.0', '# c\n\n## 0.2.0\n\n- c0ffee1: real change\n\n## 0.1.0\n');
	writePackage('lint', '@rsvelte/lint', '0.2.0', '# l\n\n## 0.2.0\n\n## 0.1.0\n');
	writePackage('lint-darwin-arm64', '@rsvelte/lint-darwin-arm64', '0.2.0', '# p\n\n## 0.2.0\n\n- c0ffee1: x\n');

	const releases = collectReleases('HEAD', root).map((r) => [r.name, r.version, r.hashes]);
	check('collectReleases finds the bumped packages', releases, [
		['@rsvelte/compiler', '0.2.0', ['c0ffee1']],
		['@rsvelte/lint', '0.2.0', []],
	]);

	// Control: with nothing bumped the same call must come back empty, so the
	// assertion above is not just "it always returns these two".
	git('add', '-A');
	git('commit', '-qm', 'release');
	check('collectReleases is empty when nothing moved', collectReleases('HEAD', root), []);

	fs.rmSync(root, { recursive: true, force: true });
}

if (failed > 0) {
	console.error(`\n${failed} check(s) failed.`);
	process.exit(1);
}
console.log('\nAll checks passed.');
