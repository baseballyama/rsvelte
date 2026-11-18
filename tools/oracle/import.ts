// Copies admitted files from local checkouts of the registered sources into each source's
// inputs.pack. The checkouts are only read; after an import the corpus is self-contained.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadSources, readSourceUnits, unitAttributes, unitKey } from './manifest.ts';
import { languageOf, FAMILIES } from './languages.ts';
import {
	inputsPack,
	licensesDir,
	IMPORT_REPORT_FILE,
	SOURCES_FILE,
	UNITS_FILE,
	rel,
	ROOT,
} from './paths.ts';
import { writeIfChanged, stableStringify } from './files.ts';
import { writePack, type Entry } from './pack.ts';
import { parse as parseToml } from 'smol-toml';
import { parseArgs } from 'node:util';

const LICENSE_NAME = /^(licen[cs]e|copying)(\.(md|txt))?$/i;
const sha256 = (text: string): string => crypto.createHash('sha256').update(text).digest('hex');

const ACCEPTED_NESTED: [RegExp, string][] = [
	[/Permission is hereby granted, free of charge/i, 'MIT'],
	[/Apache License[\s\S]*Version 2\.0/i, 'Apache-2.0'],
	[/Permission to use, copy, modify, and\/?or distribute this software for any purpose/i, 'ISC'],
	[/free and unencumbered software released into the public domain/i, 'Unlicense'],
];

/** Tracked files only: build outputs, `_output` snapshots and other ignored files never become fixtures.
 * A source kept in this repository also counts files not yet added, so a new case imports before its commit. */
function trackedFiles(root: string, inRepo: boolean): string[] {
	const untracked = inRepo ? ['--others', '--exclude-standard'] : [];
	return execFileSync('git', ['-C', root, 'ls-files', '-z', '--cached', ...untracked], {
		encoding: 'utf8',
		maxBuffer: 1 << 30,
	})
		.split('\0')
		.filter(Boolean)
		.map((p) => path.join(root, p))
		.filter((f) => fs.lstatSync(f, { throwIfNoEntry: false })?.isFile());
}

/** An uninitialised submodule answers `rev-parse HEAD` with the superproject's commit, so check the toplevel too. */
function checkoutCommit(dir: string): string {
	const top = execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], {
		encoding: 'utf8',
	}).trim();
	if (fs.realpathSync(top) !== fs.realpathSync(dir)) {
		throw new Error(`${dir} is not a populated checkout (git toplevel is ${top})`);
	}
	return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

/** The license governing `file` is the nearest license file between its directory and the source root. */
function nearestLicense(
	root: string,
	file: string,
	cache: Map<string, string | null>,
): string | null {
	let dir = path.dirname(file);
	while (true) {
		if (!cache.has(dir)) {
			const hit = fs
				.readdirSync(dir, { withFileTypes: true })
				.find((e) => e.isFile() && LICENSE_NAME.test(e.name));
			cache.set(dir, hit ? path.join(dir, hit.name) : null);
		}
		const hit = cache.get(dir);
		if (hit) return hit;
		if (dir === root) return null;
		dir = path.dirname(dir);
	}
}

export interface ImportOptions {
	from?: string;
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
	const handWritten = new Set(
		fs.existsSync(UNITS_FILE) ? Object.keys(parseToml(fs.readFileSync(UNITS_FILE, 'utf8'))) : [],
	);
	let registryChanged = false;

	for (const source of sources) {
		if (source.excluded || !source.license) continue;
		if (only && !only.includes(source.id)) {
			// Earlier sources claim duplicates first, so a partial import dedups exactly like a full one.
			for (const u of readSourceUnits(source.id))
				if (!seen.has(sha256(u.src))) seen.set(sha256(u.src), `${source.id}/${u.path}`);
			continue;
		}
		// A source without a URL is kept in this repository and has no commit to pin.
		const inRepo = source.url === null;
		if (!inRepo && !from)
			throw new Error(`${source.id}: --from <dir holding the checkouts> is required`);
		const root = path.resolve(inRepo ? ROOT : from!, source.checkout);
		const commit = inRepo ? null : checkoutCommit(root);
		if (commit !== null && commit !== source.commit) {
			if (!acceptCommit) {
				throw new Error(
					`${source.id}: checkout is at ${commit}, registry pins ${source.commit} (pass --accept-commit to move the pin)`,
				);
			}
			source.commit = commit;
			registryChanged = true;
		}

		const counts: {
			claimed: number;
			admitted: number;
			duplicate: number;
			[reason: string]: number;
		} = { claimed: 0, admitted: 0, duplicate: 0 };
		const bump = (reason: string) => (counts[reason] = (counts[reason] ?? 0) + 1);
		const kept = new Set<string>();
		const packs = new Map<string, Entry[]>(FAMILIES.map((f) => [f, []]));
		const licenseCache = new Map<string, string | null>();
		const rootLicense = path.join(inRepo ? ROOT : root, source.license.file);
		const nestedLicenses = new Set<string>();
		const previous = readSourceUnits(source.id);

		for (const file of trackedFiles(root, inRepo).toSorted()) {
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
			const hash = sha256(src);
			if (seen.has(hash)) {
				counts.duplicate++;
				continue;
			}
			let admission = lang.admit(src, relPath);
			// A case written here may exist to compare a rejection, which is then its expected result.
			if (!admission.include && inRepo) {
				bump(`rejected:${admission.reason}`);
				admission = { include: true, fields: { mode: 'runes', inferredMode: 'rejected' } };
			}
			if (!admission.include) {
				bump(admission.reason);
				continue;
			}
			seen.set(hash, `${source.id}/${relPath}`);
			counts.admitted++;
			const meta = { lang: lang.id, ...admission.fields };
			kept.add(`${lang.family}/${relPath}`);
			packs.get(lang.family)!.push({ path: relPath, attributes: unitAttributes(meta), body: src });
		}

		// A unit that left the source is dropped, unless units.toml has a hand-written table for it.
		for (const old of previous) {
			if (kept.has(`${old.family}/${old.path}`) || !handWritten.has(unitKey(old))) continue;
			orphans.push(unitKey(old));
			packs
				.get(old.family)!
				.push({ path: old.path, attributes: unitAttributes(old), body: old.src });
		}
		for (const [family, entries] of packs) writePack(inputsPack(family, source.id), entries);

		fs.rmSync(licensesDir(source.id), { recursive: true, force: true });
		for (const lic of inRepo ? [] : [rootLicense, ...nestedLicenses]) {
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
		console.log(
			`units gone from their source but named in units.toml (kept; resolve by hand): ${orphans.length}`,
		);
		for (const o of orphans) console.log(`  ${o}`);
	}
	return { orphans };
}

/** `oracle import --from <dir> [--source id,...] [--accept-commit]` */
export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({
		args,
		options: {
			from: { type: 'string' },
			source: { type: 'string' },
			'accept-commit': { type: 'boolean', default: false },
		},
	});
	const { orphans } = runImport({
		from: values.from && path.resolve(values.from),
		only: values.source?.split(','),
		acceptCommit: values['accept-commit'],
	});
	if (orphans.length) process.exitCode = 1;
}
