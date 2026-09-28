// Hard-copies admitted files from local checkouts of the registered sources into fixtures/inputs.
// The checkouts are only read; after an import the fixture set is self-contained.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadSources, readManifest, writeManifest } from './manifest.mjs';
import { languageOf } from './languages.mjs';
import { inputsDir, licensesDir, IMPORT_REPORT_FILE, SOURCES_FILE, rel } from './paths.mjs';
import { writeIfChanged, stableStringify } from './fsutil.mjs';

const LICENSE_NAME = /^(licen[cs]e|copying)(\.(md|txt))?$/i;
const ACCEPTED_NESTED = [
	[/Permission is hereby granted, free of charge/i, 'MIT'],
	[/Apache License[\s\S]*Version 2\.0/i, 'Apache-2.0'],
	[/Permission to use, copy, modify, and\/?or distribute this software for any purpose/i, 'ISC'],
	[/free and unencumbered software released into the public domain/i, 'Unlicense']
];

/** Tracked files only: build outputs, `_output` snapshots and other ignored files never become fixtures. */
function trackedFiles(root) {
	return execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 30 })
		.split('\0')
		.filter(Boolean)
		.map((p) => path.join(root, p))
		.filter((f) => fs.lstatSync(f, { throwIfNoEntry: false })?.isFile());
}

/** An uninitialised submodule answers `rev-parse HEAD` with the superproject's commit, so check the toplevel too. */
function checkoutCommit(dir) {
	const top = execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
	if (fs.realpathSync(top) !== fs.realpathSync(dir)) {
		throw new Error(`${dir} is not a populated checkout (git toplevel is ${top})`);
	}
	return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

/** The license governing `file` is the nearest license file between its directory and the source root. */
function nearestLicense(root, file, cache) {
	let dir = path.dirname(file);
	while (true) {
		if (!cache.has(dir)) {
			const hit = fs.readdirSync(dir, { withFileTypes: true }).find((e) => e.isFile() && LICENSE_NAME.test(e.name));
			cache.set(dir, hit ? path.join(dir, hit.name) : null);
		}
		const hit = cache.get(dir);
		if (hit) return hit;
		if (dir === root) return null;
		dir = path.dirname(dir);
	}
}

export function runImport({ from, only, acceptCommit }) {
	const sources = loadSources();
	const report = fs.existsSync(IMPORT_REPORT_FILE) ? JSON.parse(fs.readFileSync(IMPORT_REPORT_FILE, 'utf8')) : {};
	const seen = new Map();
	let registryChanged = false;

	for (const source of sources) {
		if (source.excluded) continue;
		const selected = !only || only.includes(source.id);
		if (!selected) {
			// Earlier sources claim duplicates first, so a partial import dedups exactly like a full one.
			for (const u of readManifest(source.id)) if (!seen.has(u.sha256)) seen.set(u.sha256, `${source.id}/${u.path}`);
			continue;
		}
		const root = path.resolve(from, source.checkout);
		const commit = checkoutCommit(root);
		if (commit !== source.commit) {
			if (!acceptCommit) {
				throw new Error(`${source.id}: checkout is at ${commit}, registry pins ${source.commit} (pass --accept-commit to move the pin)`);
			}
			source.commit = commit;
			registryChanged = true;
		}

		const counts = { claimed: 0, admitted: 0, duplicate: 0 };
		const units = [];
		const licenseCache = new Map();
		const rootLicense = path.join(root, source.license.file);
		const nestedLicenses = new Set();
		fs.rmSync(inputsDir(source.id), { recursive: true, force: true });

		for (const file of trackedFiles(root).sort()) {
			const relPath = rel(root, file);
			const lang = languageOf(relPath);
			if (!lang) continue;
			counts.claimed++;
			const bump = (reason) => (counts[reason] = (counts[reason] ?? 0) + 1);

			const lic = nearestLicense(root, file, licenseCache);
			if (lic && lic !== rootLicense) {
				const text = fs.readFileSync(lic, 'utf8');
				if (!ACCEPTED_NESTED.some(([re]) => re.test(text))) {
					bump('nested-license-not-accepted');
					continue;
				}
				nestedLicenses.add(lic);
			}

			const src = fs.readFileSync(file, 'utf8');
			const sha256 = crypto.createHash('sha256').update(src).digest('hex');
			if (seen.has(sha256)) {
				counts.duplicate++;
				continue;
			}
			const admission = lang.admit(src, relPath);
			if (!admission.include) {
				bump(admission.reason);
				continue;
			}
			seen.set(sha256, `${source.id}/${relPath}`);
			counts.admitted++;
			units.push({ source: source.id, path: relPath, sha256, lang: lang.id, ...admission.fields });
			const dest = path.join(inputsDir(source.id), relPath);
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.writeFileSync(dest, src);
		}

		fs.rmSync(licensesDir(source.id), { recursive: true, force: true });
		for (const lic of [rootLicense, ...nestedLicenses]) {
			const dest = path.join(licensesDir(source.id), rel(root, lic));
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.copyFileSync(lic, dest);
		}
		writeManifest(source.id, units);
		report[source.id] = counts;
		console.log(`${source.id}: ${stableStringify(counts, '')}`);
	}

	if (registryChanged) writeIfChanged(SOURCES_FILE, JSON.stringify(sources, null, '\t') + '\n');
	const ordered = {};
	for (const s of sources) if (report[s.id] && !s.excluded) ordered[s.id] = report[s.id];
	writeIfChanged(IMPORT_REPORT_FILE, stableStringify(ordered) + '\n');
	return { sources, registryChanged };
}
