export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export interface Source {
	id: string;
	url: string | null;
	commit: string | null;
	checkout: string;
	license?: { spdx: string; file: string };
	excluded?: string;
	/** Units written by hand in fixtures/<family>/<id>/; `import` only refreshes their meta.json. */
	local?: true;
}

/** The generated part of a unit, stored in its meta.json. */
export interface UnitMeta {
	lang: string;
	sha256: string;
	mode: string;
	inferredMode?: string;
}

export interface UnitKey {
	family: string;
	source: string;
	/** The file's path in its source repository; also the `filename` passed to oracles. */
	path: string;
}

export interface Adjustment {
	task: string;
	variant?: string;
	artifact?: string;
	at: string;
	expect: string;
	replace: string;
	reason?: string;
}

/** The hand-written part of a unit, stored in its fixture.toml. */
export interface FixtureToml {
	skip?: Record<string, string>;
	adjust?: Adjustment[];
}

export interface Unit extends UnitKey, UnitMeta {
	ext: string;
	fixture: FixtureToml;
}

export type Admission = { include: true; fields: Omit<UnitMeta, 'lang' | 'sha256'> } | { include: false; reason: string };

export interface Language {
	id: string;
	/** Top-level fixtures/<family>/ directory; languages that belong together share one. */
	family: string;
	/** Extension of the copied input, `input<ext>`. */
	ext: string;
	matches(path: string): boolean;
	admit(src: string, path: string): Admission;
}

export type Compare = 'js-ast' | 'text' | 'json' | 'lint';

export interface Artifact {
	text: string;
	ext: string;
	compare: Compare;
}

export interface Variant {
	id: string;
	options: Record<string, unknown>;
}

export interface Task {
	id: string;
	/** `committed` snapshots go to expected/ and git; `cached` ones to the git-ignored cache/. */
	storage: 'committed' | 'cached';
	/** npm packages whose version the output depends on. */
	oracles: string[];
	variants: Variant[];
	appliesTo(unit: Unit): boolean;
	run(unit: Unit, src: string, variant: Variant): Record<string, Artifact> | Promise<Record<string, Artifact>>;
}
