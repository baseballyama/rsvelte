import fs from 'node:fs';
import { parse as parseToml } from 'smol-toml';
import { SOURCES_FILE, UNITS_FILE, inputsPack } from './paths.ts';
import { languageById, FAMILIES } from './languages.ts';
import { readPack, type Entry } from './pack.ts';
import type { FixtureToml, Source, Task, Unit, UnitKey, UnitMeta } from './types.ts';

export function loadSources(): Source[] {
	return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
}

export function includedSources(): Source[] {
	return loadSources().filter((s) => !s.excluded);
}

export type StoredUnit = UnitKey & UnitMeta & { src: string };

/** An inputs.pack entry's attributes, in order: language, mode, and the inferred mode or `-`. */
export const unitAttributes = (u: UnitMeta): string[] => [u.lang, u.mode, u.inferredMode ?? '-'];

/** The units of a source across the given families, in path order. */
export function readSourceUnits(source: string, families: string[] = FAMILIES): StoredUnit[] {
	return families.flatMap((family) => {
		const file = inputsPack(family, source);
		if (!fs.existsSync(file)) return [];
		return readPack(file).map((e: Entry) => {
			const [lang = '', mode = '', inferred = '-'] = e.attributes;
			const unit: StoredUnit = { family, source, path: e.path, lang, mode, src: e.body };
			if (inferred !== '-') unit.inferredMode = inferred;
			return unit;
		});
	});
}

/** The `"<family>/<source>/<path>"` key a unit has in units.toml and the parity ledger. */
export const unitKey = (u: UnitKey): string => `${u.family}/${u.source}/${u.path}`;

/**
 * units.toml: the hand-written part of units, never touched by the importer.
 *   ["<family>/<source>/<path>".skip]   "<task>" or "<task>/<variant>" = "reason"
 */
function readFixtures(): Record<string, FixtureToml> {
	if (!fs.existsSync(UNITS_FILE)) return {};
	return parseToml(fs.readFileSync(UNITS_FILE, 'utf8')) as Record<string, FixtureToml>;
}

export function allUnits(sourceIds?: string[], families?: string[]): Unit[] {
	const ids = sourceIds ?? includedSources().map((s) => s.id);
	const fixtures = readFixtures();
	return ids
		.flatMap((id) => readSourceUnits(id, families))
		.map((u) =>
			Object.assign(u, { fixture: fixtures[unitKey(u)] ?? {}, ext: languageById(u.lang).ext }),
		);
}

export function applies(task: Task, variantId: string, unit: Unit): boolean {
	const skip = unit.fixture.skip ?? {};
	return task.appliesTo(unit) && !skip[task.id] && !skip[`${task.id}/${variantId}`];
}
