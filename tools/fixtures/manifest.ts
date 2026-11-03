import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml } from 'smol-toml';
import { SOURCES_FILE, sourceDir, metaFile, fixtureFile, rel, decodePath } from './paths.ts';
import { writeIfChanged, stableStringify } from './fsutil.ts';
import { languageById, FAMILIES } from './languages.ts';
import type { FixtureToml, Source, Task, Unit, UnitKey, UnitMeta } from './types.ts';

export function loadSources(): Source[] {
	return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
}

export function includedSources(): Source[] {
	return loadSources().filter((s) => !s.excluded);
}

type StoredUnit = UnitKey & UnitMeta;

/** Unit directories of a source across the given families: every directory holding a meta.json. */
export function readSourceUnits(source: string, families: string[] = FAMILIES): StoredUnit[] {
	const out = families.flatMap((family) => readFamilySource(family, source));
	const key = (u: StoredUnit) => `${u.family}\0${u.path}`;
	return out.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}

function readFamilySource(family: string, source: string): StoredUnit[] {
	const root = sourceDir(family, source);
	const out: StoredUnit[] = [];
	const visit = (dir: string): void => {
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		if (entries.some((e) => e.isFile() && e.name === 'meta.json')) {
			const meta: UnitMeta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
			out.push({ family, source, path: decodePath(rel(root, dir)), ...meta });
			return;
		}
		for (const e of entries) if (e.isDirectory()) visit(path.join(dir, e.name));
	};
	visit(root);
	return out;
}

export function writeMeta(unit: StoredUnit): boolean {
	const { family: _f, source: _s, path: _p, ...meta } = unit;
	return writeIfChanged(metaFile(unit), stableStringify(meta) + '\n');
}

/**
 * fixture.toml: the hand-written part of a unit, never touched by the importer.
 *   [skip]            "<task>" or "<task>/<variant>" = "reason"
 *   [[adjust]]        see adjust.ts
 */
export function readFixture(unit: UnitKey): FixtureToml {
	const file = fixtureFile(unit);
	if (!fs.existsSync(file)) return {};
	return parseToml(fs.readFileSync(file, 'utf8')) as FixtureToml;
}

export function allUnits(sourceIds?: string[], families?: string[]): Unit[] {
	const ids = sourceIds ?? includedSources().map((s) => s.id);
	return ids
		.flatMap((id) => readSourceUnits(id, families))
		.map((u) => ({ ...u, fixture: readFixture(u), ext: languageById(u.lang).ext }));
}

export function applies(task: Task, variantId: string, unit: Unit): boolean {
	const skip = unit.fixture.skip ?? {};
	return task.appliesTo(unit) && !skip[task.id] && !skip[`${task.id}/${variantId}`];
}
