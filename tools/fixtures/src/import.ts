// Hard-copies admitted files from local checkouts of the registered sources into fixtures/<family>/.
// The checkouts are only read; after an import the fixture set is self-contained.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadSources, readSourceUnits, writeMeta } from './manifest.ts';
import { languageOf, languageById, FAMILIES } from './languages.ts';
import { unitDir, inputFile, fixtureFile, sourceDir, licensesDir, IMPORT_REPORT_FILE, SOURCES_FILE, rel, decodePath } from './paths.ts';
import { writeIfChanged, stableStringify, pruneEmptyDirs } from './fsutil.ts';

const LICENSE_NAME = /^(licen[cs]e|copying)(\.(md|txt))?$/i;
const ACCEPTED_NESTED: [RegExp, string][] = [
	[/Permission is hereby granted, free of charge/i, 'MIT'],
	[/Apache License[\s\S]*Version 2\.0/i, 'Apache-2.0'],
	[/Permission to use, copy, modify, and\/?or distribute this software for any purpose/i, 'ISC'],
	[/free and unencumbered software released into the public domain/i, 'Unlicense']
];

/** Tracked files only: build outputs, `_output` snapshots and other ignored files never become fixtures. */
function trackedFiles(root: string): string[] {
	return execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 30 })
		.split('\0')
		.filter(Boolean)
		.map((p) => path.join(root, p))
		.filter((f) => fs.lstatSync(f, { throwIfNoEntry: false })?.isFile());
}

/** An uninitialised submodule answers `rev-parse HEAD` with the superproject's commit, so check the toplevel too. */
function checkoutCommit(dir: string): string {
	const top = execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
	if (fs.realpathSync(top) !== fs.realpathSync(dir)) {
		throw new Error(`${dir} is not a populated checkout (git toplevel is ${top})`);
	}
	return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

/** The license governing `file` is the nearest license file between its directory and the source root. */
function nearestLicense(root: string, file: string, cache: Map<string, string | null>): string | null {
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

/** Hand-written units: every directory under fixtures/<family>/<source>/ that holds an `input.*`. */
function refreshLocal(source: string, seen: Map<string, string>): Record<string, number> {
	const counts: Record<string, number> = { admitted: 0 };
	for (const family of FAMILIES) {
		const root = sourceDir(family, source);
		const visit = (dir: string): void => {
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			const input = entries.find((e) => e.isFile() && e.name.startsWith('input.'));
			if (!input) {
				for (const e of entries) if (e.isDirectory()) visit(path.join(dir, e.name));
				return;
			}
			const relPath = decodePath(rel(root, dir));
			const lang = languageOf(relPath);
			const ext = input.name.slice('input'.length);
			if (!lang || lang.family !== family || languageById(lang.id).ext !== ext) {
				throw new Error(`${source}/${relPath}: the path's extension does not match ${input.name}`);
			}
			const src = fs.readFileSync(path.join(dir, input.name), 'utf8');
			const sha256 = crypto.createHash('sha256').update(src).digest('hex');
			const admission = lang.admit(src, relPath);
			if (!admission.include) throw new Error(`${source}/${relPath}: not admitted (${admission.reason})`);
			seen.set(sha256, `${source}/${relPath}`);
			counts.admitted!++;
			writeMeta({ family, source, path: relPath, lang: lang.id, sha256, ...admission.fields });
		};
		if (fs.existsSync(root)) visit(root);
	}
	return counts;
}

export interface ImportOptions {
	from: string;
	only?: string[];
	acceptCommit: boolean;
}

export function runImport({ from, only, acceptCommit }: ImportOptions): { orphans: string[] } {
	const sources = loadSources();
	const report: Record<string, Record<string, number>> = fs.existsSync(IMPORT_REPORT_FILE)
		? JSON.parse(fs.readFileSync(IMPORT_REPORT_FILE, 'utf8'))
		: {};
	const seen = new Map<string, string>();
	const orphans: string[] = [];
	let registryChanged = false;

	for (const source of sources) {
		if (source.excluded || !source.license) continue;
		if (source.local) {
			// Local units come first in the registry, so the same file copied from a repository counts as a duplicate.
			const counts = refreshLocal(source.id, seen);
			report[source.id] = counts;
			console.log(`${source.id}: ${stableStringify(counts, '')}`);
			continue;
		}
		if (only && !only.includes(source.id)) {
			// Earlier sources claim duplicates first, so a partial import dedups exactly like a full one.
			for (const u of readSourceUnits(source.id)) if (!seen.has(u.sha256)) seen.set(u.sha256, `${source.id}/${u.path}`);
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

		const counts: { claimed: number; admitted: number; duplicate: number; [reason: string]: number } = { claimed: 0, admitted: 0, duplicate: 0 };
		const bump = (reason: string) => (counts[reason] = (counts[reason] ?? 0) + 1);
		const kept = new Set<string>();
		const licenseCache = new Map<string, string | null>();
		const rootLicense = path.join(root, source.license.file);
		const nestedLicenses = new Set<string>();
		const previous = readSourceUnits(source.id);

		for (const file of trackedFiles(root).sort()) {
			const relPath = rel(root, file);
			const lang = languageOf(relPath);
			if (!lang) continue;
			counts.claimed++;

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
			const unit = { family: lang.family, source: source.id, path: relPath, lang: lang.id, sha256, ...admission.fields };
			kept.add(`${unit.family}/${unit.path}`);
			writeIfChanged(inputFile(unit, lang.ext), src);
			writeMeta(unit);
		}

		// A unit that left the source loses its directory, unless it carries a hand-written fixture.toml.
		for (const old of previous) {
			if (kept.has(`${old.family}/${old.path}`)) continue;
			if (fs.existsSync(fixtureFile(old))) {
				orphans.push(`${old.family}/${source.id}/${old.path}`);
				continue;
			}
			fs.rmSync(unitDir(old), { recursive: true, force: true });
		}
		for (const family of FAMILIES) pruneEmptyDirs(sourceDir(family, source.id));

		fs.rmSync(licensesDir(source.id), { recursive: true, force: true });
		for (const lic of [rootLicense, ...nestedLicenses]) {
			const dest = path.join(licensesDir(source.id), rel(root, lic));
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.copyFileSync(lic, dest);
		}
		report[source.id] = counts;
		console.log(`${source.id}: ${stableStringify(counts, '')}`);
	}

	if (registryChanged) writeIfChanged(SOURCES_FILE, JSON.stringify(sources, null, '\t') + '\n');
	const ordered: Record<string, Record<string, number>> = {};
	for (const s of sources) {
		const r = report[s.id];
		if (r && !s.excluded) ordered[s.id] = r;
	}
	writeIfChanged(IMPORT_REPORT_FILE, stableStringify(ordered) + '\n');
	if (orphans.length) {
		console.log(`units gone from their source but carrying a fixture.toml (kept; resolve by hand): ${orphans.length}`);
		for (const o of orphans) console.log(`  ${o}`);
	}
	return { orphans };
}
