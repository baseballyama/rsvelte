import type { Behaviour } from './behaviour/runtime.ts';

export interface Source {
	id: string;
	url: string | null;
	commit: string | null;
	checkout: string;
	license?: { spdx: string; file: string };
	excluded?: string;
}

/** The generated part of a unit, stored as the attributes of its entry in inputs.pack. */
export interface UnitMeta {
	lang: string;
	mode: string;
	inferredMode?: string;
}

export interface UnitKey {
	family: string;
	source: string;
	/** The file's path in its source repository; also the `filename` passed to oracles. */
	path: string;
}

/** The hand-written part of a unit, its table in corpus/_registry/units.toml. */
export interface FixtureToml {
	skip?: Record<string, string>;
	/** Root props and user steps for the behaviour tasks (behaviour/runtime.ts). */
	behaviour?: Behaviour;
}

export interface Unit extends UnitKey, UnitMeta {
	src: string;
	sourceFile?: string;
	ext: string;
	fixture: FixtureToml;
}

type Admission =
	| { include: true; fields: Omit<UnitMeta, 'lang'> }
	| { include: false; reason: string };

export interface Language {
	id: string;
	/** Top-level corpus/<family>/ directory; languages that belong together share one. */
	family: string;
	/** Extension of the copied input, `input<ext>`. */
	ext: string;
	matches(path: string): boolean;
	admit(src: string, path: string): Admission;
}

type Compare = 'js-ast' | 'text' | 'json' | 'lint';

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
	/** npm packages whose version the output depends on. */
	oracles: string[];
	variants: Variant[];
	appliesTo(unit: Unit): boolean;
	run(
		unit: Unit,
		src: string,
		variant: Variant,
	): Record<string, Artifact> | Promise<Record<string, Artifact>>;
	/** For a task that sees a source as one project (a type check): given every unit of the source,
	 * the artifacts of those it applies to. */
	runSource?(units: Unit[], variant: Variant): Promise<Map<string, Record<string, Artifact>>>;
	/** What else the comparison needs from the oracle, recorded in oracles.json (the lint rules). */
	lock?: Record<string, unknown>;
	/**
	 * For a task whose actual output is not the artifact itself: derives the artifact `ext` from the
	 * implementation's `actual/<task>/<variant>.js`, given as a path (a behaviour trace of emitted code).
	 */
	observe?: { ext: string; derive(unit: Unit, variant: Variant, file: string): Promise<Observed> };
}

/** An observed artifact, or why the emitted code could not be observed. */
type Observed = { text: string; diff(expected: string): string | null };
