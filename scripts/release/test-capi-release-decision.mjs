#!/usr/bin/env node

// Controls for the capi auto-tag decision. Two of them are the reason this
// logic is a module and not four lines of bash: the "version goes backwards"
// and "already released" arms only ever run on a tree where they must not
// fire, so nothing else can show they are still able to.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	TAG_PREFIX,
	compareVersions,
	decide,
	readManifestVersion,
} from './capi-release-decision.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const MANIFEST = join(REPO_ROOT, 'crates', 'rsvelte_capi', 'Cargo.toml');
const SCRIPT = join(HERE, 'capi-release-decision.mjs');

let failures = 0;

function check(name, condition, detail = '') {
	if (condition) {
		console.log(`ok   ${name}`);
	} else {
		failures += 1;
		console.error(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
	}
}

const RELEASED = ['capi-v0.1.0', 'capi-v0.1.1'];

// --- the arm that fires on a real bump ------------------------------------
{
	const d = decide({ version: '0.2.0', existingTags: RELEASED });
	check('a bump ahead of every release is tagged', d.action === 'tag', d.reason);
	check('the tag carries the prefix', d.tag === `${TAG_PREFIX}0.2.0`, d.tag);
}

// --- the arms that must NOT fire on that same input ------------------------
{
	const d = decide({ version: '0.1.1', existingTags: RELEASED });
	check('an already-released version is skipped, not re-tagged', d.action === 'skip', d.reason);
}
{
	// Behind AND not itself released — the earlier arm would otherwise absorb it:
	// `0.1.0` against RELEASED is a *skip*, because that tag exists.
	const d = decide({ version: '0.1.0', existingTags: ['capi-v0.1.1', 'capi-v0.2.0'] });
	check('a version behind the newest release aborts', d.action === 'abort', d.reason);
	check(
		'the abort names the release it would undercut',
		d.reason.includes('capi-v0.2.0'),
		d.reason,
	);
}
{
	const d = decide({ version: '0.1.0', existingTags: RELEASED });
	check(
		'an existing tag wins over the backwards check, so a re-merge is quiet',
		d.action === 'skip',
		d.reason,
	);
}
{
	for (const bad of ['0.2', '0.2.0-rc.1', 'v0.2.0', '0.2.0 ', 'nightly']) {
		const d = decide({ version: bad, existingTags: RELEASED });
		check(`\`${bad}\` is refused rather than tagged`, d.action === 'abort', d.reason);
	}
}

// --- first release: an empty tag list is a real state, not a failure -------
{
	const d = decide({ version: '0.1.0', existingTags: [] });
	check('the first tag is cut with no prior release', d.action === 'tag', d.reason);
	check('and says so', d.reason.includes('first'), d.reason);
}

// --- an unorderable existing tag is reported, never silently decisive ------
{
	const d = decide({ version: '0.3.0', existingTags: [...RELEASED, 'capi-v0.4.0-rc.1'] });
	check('a prerelease tag does not block a later release', d.action === 'tag', d.reason);
	check(
		'and is listed as not ordered',
		d.ignoredTags.includes('capi-v0.4.0-rc.1'),
		JSON.stringify(d.ignoredTags),
	);
}
{
	const d = decide({ version: '0.3.0', existingTags: ['v1.2.3', 'capi-v0.1.1'] });
	check('a foreign tag is ignored entirely', d.ignoredTags.length === 0, JSON.stringify(d.ignoredTags));
	check('and does not change the verdict', d.action === 'tag', d.reason);
}

// --- ordering is numeric, not lexicographic -------------------------------
{
	const d = decide({ version: '0.9.0', existingTags: ['capi-v0.10.0'] });
	check('0.9.0 is behind 0.10.0', d.action === 'abort', d.reason);
	check('compareVersions orders 0.10.0 above 0.9.0', compareVersions('0.10.0', '0.9.0') === 1);
	check('compareVersions is reflexive', compareVersions('1.2.3', '1.2.3') === 0);
}

// --- the version read must agree with the one release-capi.yml reads ------
// Two implementations of "what is this crate's version" would otherwise be
// free to disagree, and the workflow's own grep is the one that decides
// whether the tag it is handed matches the crate.
{
	const contents = readFileSync(MANIFEST, 'utf8');
	const fromModule = readManifestVersion(contents);
	const fromWorkflowPipeline = execFileSync(
		'bash',
		[
			'-c',
			`grep -E '^version = ' "${MANIFEST}" | head -1 | sed -E 's/version = "(.+)"/\\1/'`,
		],
		{ encoding: 'utf8' },
	).trim();
	check(
		'the module and the workflow pipeline read the same version',
		fromModule === fromWorkflowPipeline,
		`${fromModule} vs ${fromWorkflowPipeline}`,
	);
	check('and it is a version this script would act on', /^\d+\.\d+\.\d+$/.test(fromModule), fromModule);
}

// --- the CLI: exit code and GITHUB_OUTPUT are what the workflow reads ------
{
	const dir = mkdtempSync(join(tmpdir(), 'capi-decision-'));
	const tags = join(dir, 'tags.txt');
	const output = join(dir, 'github_output');
	writeFileSync(tags, `${RELEASED.join('\n')}\n`);
	writeFileSync(output, '');
	const manifest = join(dir, 'Cargo.toml');
	writeFileSync(manifest, '[package]\nname = "rsvelte_capi"\nversion = "0.2.0"\nedition = "2024"\n');

	const run = (args, env = {}) => {
		try {
			const stdout = execFileSync('node', [SCRIPT, ...args], {
				encoding: 'utf8',
				env: { ...process.env, ...env },
				stdio: ['ignore', 'pipe', 'pipe'],
			});
			return { code: 0, stdout };
		} catch (error) {
			return { code: error.status, stdout: error.stdout ?? '' };
		}
	};

	const ok = run(['--manifest', manifest, '--tags-file', tags], { GITHUB_OUTPUT: output });
	check('the CLI exits 0 on a tag decision', ok.code === 0, String(ok.code));
	const written = readFileSync(output, 'utf8');
	check('it writes action=tag', written.includes('action=tag'), written);
	check('it writes the tag', written.includes(`tag=${TAG_PREFIX}0.2.0`), written);
	check('it prints the tag denominator', /2 tag\(s\)/.test(ok.stdout), ok.stdout);

	writeFileSync(manifest, '[package]\nversion = "0.0.9"\n');
	const behind = run(['--manifest', manifest, '--tags-file', tags]);
	check('the CLI exits non-zero on abort', behind.code === 1, String(behind.code));

	const unknown = run(['--manifest', manifest, '--tags-file', tags, '--force']);
	check('an unknown argument is an error, not an ignored flag', unknown.code === 1, String(unknown.code));

	const missing = run(['--manifest', manifest]);
	check('--tags-file is required', missing.code === 1, String(missing.code));
}

if (failures > 0) {
	console.error(`\n${failures} control(s) failed`);
	process.exit(1);
}
console.log('\nall controls passed');
