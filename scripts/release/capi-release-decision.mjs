#!/usr/bin/env node

// Decide whether the version in `crates/rsvelte_capi/Cargo.toml` still needs a
// `capi-v<version>` tag cut for it.
//
// The C ABI's release trigger is the tag, not the merge, so a bump that lands
// on main publishes nothing and looks exactly like a released one from main's
// side: `capi-v0.1.1` stayed the newest tag for three months while
// `rsvelte_core` moved to 0.11.1, and it took an external report (#4274) to
// notice. `capi-autotag.yml` closes that gap, and the three questions it has to
// answer — is the version well-formed, is it already released, does it move
// forward — live here rather than in YAML, because a shell snippet inside a
// workflow can only be tested by merging it.

import { appendFileSync, readFileSync } from 'node:fs';

export const TAG_PREFIX = 'capi-v';

// Deliberately no prerelease/build suffix: `release-capi.yml` names archives
// `rsvelte_capi-<version>-<triple>` and orders nothing, so a suffix would order
// by luck. A prerelease is still reachable by pushing the tag by hand.
const VERSION = /^(\d+)\.(\d+)\.(\d+)$/;

/** First `^version = "…"` line, which is `[package].version` in this manifest. */
export function readManifestVersion(contents) {
	const match = /^version = "(.+)"$/m.exec(contents);
	if (!match) throw new Error('no `version = "…"` line in the manifest');
	return match[1];
}

/** -1 / 0 / 1 over `MAJOR.MINOR.PATCH`; both sides must match VERSION. */
export function compareVersions(left, right) {
	const a = VERSION.exec(left);
	const b = VERSION.exec(right);
	if (!a || !b) throw new Error(`not comparable: ${left} vs ${right}`);
	for (let i = 1; i <= 3; i += 1) {
		const difference = Number(a[i]) - Number(b[i]);
		if (difference !== 0) return Math.sign(difference);
	}
	return 0;
}

/**
 * @param {{version: string, existingTags: string[]}} input — `existingTags` are
 *   tag names (`capi-v0.1.1`), not refs; anything without the prefix is ignored
 *   so the caller may pass the repository's whole tag list.
 * @returns {{action: 'tag'|'skip'|'abort', tag: string|null, reason: string,
 *   ignoredTags: string[]}}
 */
export function decide({ version, existingTags }) {
	const tag = `${TAG_PREFIX}${version}`;

	if (!VERSION.test(version)) {
		return {
			action: 'abort',
			tag: null,
			ignoredTags: [],
			reason:
				`\`${version}\` is not MAJOR.MINOR.PATCH. The release workflow names its ` +
				`archives after this string, so it is not cut automatically — push the tag ` +
				`by hand if that version is deliberate.`,
		};
	}

	const released = existingTags.filter((name) => name.startsWith(TAG_PREFIX));
	const versions = released.map((name) => name.slice(TAG_PREFIX.length));
	// A tag whose version this script cannot order (a prerelease pushed by hand)
	// must not silently decide the comparison, so it is reported instead.
	const ignoredTags = released.filter(
		(name) => !VERSION.test(name.slice(TAG_PREFIX.length)),
	);
	const comparable = versions.filter((candidate) => VERSION.test(candidate));

	if (versions.includes(version)) {
		return {
			action: 'skip',
			tag,
			ignoredTags,
			reason: `${tag} already exists — this commit changed the manifest without changing the version.`,
		};
	}

	const newest = comparable.reduce(
		(best, candidate) => (best === null || compareVersions(candidate, best) > 0 ? candidate : best),
		/** @type {string|null} */ (null),
	);

	if (newest !== null && compareVersions(version, newest) < 0) {
		return {
			action: 'abort',
			tag,
			ignoredTags,
			reason:
				`the manifest says ${version} but ${TAG_PREFIX}${newest} is already released. ` +
				`Cutting ${tag} now would publish an older C ABI as the newest release.`,
		};
	}

	return {
		action: 'tag',
		tag,
		ignoredTags,
		reason:
			newest === null
				? `no ${TAG_PREFIX}* tag exists yet; ${tag} is the first.`
				: `${version} is ahead of the newest release ${newest}.`,
	};
}

function parseArgv(argv) {
	const options = { manifest: 'crates/rsvelte_capi/Cargo.toml', tagsFile: null };
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		// An instrument that ignores what it does not understand answers a
		// different question than the one it was asked.
		if (arg === '--manifest') options.manifest = argv[++i];
		else if (arg === '--tags-file') options.tagsFile = argv[++i];
		else throw new Error(`unknown argument: ${arg}`);
	}
	if (options.tagsFile === null) throw new Error('--tags-file <path> is required');
	return options;
}

function main(argv) {
	const options = parseArgv(argv);
	const version = readManifestVersion(readFileSync(options.manifest, 'utf8'));
	const existingTags = readFileSync(options.tagsFile, 'utf8')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	const decision = decide({ version, existingTags });
	// The denominator belongs beside the verdict: "no tag exists yet" and "the
	// tag query returned nothing because it failed" print the same `tag`.
	console.log(
		`manifest ${options.manifest} → ${version}; ${existingTags.length} tag(s) read from ${options.tagsFile}`,
	);
	if (decision.ignoredTags.length > 0) {
		console.log(`not ordered (unparseable version): ${decision.ignoredTags.join(', ')}`);
	}
	console.log(`${decision.action}: ${decision.reason}`);

	if (process.env.GITHUB_OUTPUT) {
		appendFileSync(
			process.env.GITHUB_OUTPUT,
			`action=${decision.action}\ntag=${decision.tag ?? ''}\nversion=${version}\n`,
		);
	}

	if (decision.action === 'abort') {
		console.error(`::error::capi release aborted — ${decision.reason}`);
		return 1;
	}
	return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		process.exit(main(process.argv.slice(2)));
	} catch (error) {
		console.error(`::error::${error.message}`);
		process.exit(1);
	}
}
