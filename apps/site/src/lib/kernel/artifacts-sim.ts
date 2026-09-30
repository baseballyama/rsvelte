// A model of `Ctx::get` with the Svelte plugin's artifacts and the `ts.view` facet. The call order
// inside each task and each artifact's `compute` is transcribed from rsv_svelte (tasks.rs, lib.rs:
// `compile_input` asks for the parse and the HIR) and rsv_js/check.rs; the kernel rule it models is
// db.rs: the first `get` (or `facet`) computes, later ones return the cached value.

export type ArtifactName =
	| 'svelte.parse'
	| 'svelte.resolve'
	| 'svelte.hir'
	| 'svelte.analyze'
	| 'svelte.css'
	| 'ts.view';

export const ARTIFACTS: ArtifactName[] = ['svelte.parse', 'svelte.resolve', 'svelte.hir', 'svelte.analyze', 'svelte.css', 'ts.view'];
export type TaskId = 'svelte.compile/client' | 'svelte.compile/server' | 'svelte.format/default' | 'svelte.lint/default' | 'svelte.check/default';

export const TASKS: TaskId[] = [
	'svelte.compile/client',
	'svelte.compile/server',
	'svelte.format/default',
	'svelte.lint/default',
	'svelte.check/default'
];

export interface Doc {
	parses: boolean;
}

export interface GetEvent {
	artifact: ArtifactName;
	computed: boolean;
	/** Nesting depth: a `get` made from inside another artifact's `compute`. */
	depth: number;
}

export interface TaskTrace {
	task: TaskId;
	gets: GetEvent[];
	/** Ctx::computed() after the task, for the Ctx the task used. */
	computed: ArtifactName[];
}

class SimCtx {
	cache = new Set<ArtifactName>();
	computed: ArtifactName[] = [];
	constructor(
		private doc: Doc,
		private log: GetEvent[]
	) {}

	setLog(log: GetEvent[]) {
		this.log = log;
	}

	get(a: ArtifactName, depth = 0): void {
		if (this.cache.has(a)) {
			this.log.push({ artifact: a, computed: false, depth });
			return;
		}
		this.log.push({ artifact: a, computed: true, depth });
		this.computed.push(a);
		// `compute` bodies, in the order they call `get` (lib.rs).
		if (a === 'svelte.resolve' || a === 'svelte.hir' || a === 'ts.view') this.get('svelte.parse', depth + 1);
		if (a === 'svelte.analyze') {
			this.compileInput(depth + 1);
			if (this.doc.parses) this.get('svelte.resolve', depth + 1);
		}
		if (a === 'svelte.css') {
			this.get('svelte.analyze', depth + 1);
			if (this.doc.parses) this.compileInput(depth + 1);
		}
		this.cache.add(a);
	}

	/** `rsv_svelte::compile_input`: the parse, then the HIR when it parsed. */
	compileInput(depth = 0): void {
		this.get('svelte.parse', depth);
		if (this.doc.parses) this.get('svelte.hir', depth);
	}
}

function runTask(task: TaskId, ctx: SimCtx, doc: Doc) {
	switch (task) {
		case 'svelte.compile/client':
		case 'svelte.compile/server':
			ctx.get('svelte.parse');
			if (!doc.parses) return;
			ctx.compileInput();
			ctx.get('svelte.resolve');
			ctx.get('svelte.analyze');
			ctx.get('svelte.css');
			return;
		case 'svelte.format/default':
			ctx.get('svelte.parse');
			return;
		case 'svelte.lint/default':
			ctx.get('svelte.parse');
			if (!doc.parses) return;
			ctx.get('svelte.resolve');
			ctx.get('svelte.hir');
			return;
		case 'svelte.check/default':
			ctx.get('ts.view');
	}
}

export function simulate(tasks: TaskId[], doc: Doc, sharing: 'shared' | 'isolated'): TaskTrace[] {
	const shared = new SimCtx(doc, []);
	return TASKS.filter((t) => tasks.includes(t)).map((task) => {
		const gets: GetEvent[] = [];
		const ctx = sharing === 'shared' ? shared : new SimCtx(doc, gets);
		ctx.setLog(gets);
		runTask(task, ctx, doc);
		return { task, gets, computed: [...ctx.computed] };
	});
}

export function computeCounts(traces: TaskTrace[]): Record<ArtifactName, number> {
	const n = Object.fromEntries(ARTIFACTS.map((a) => [a, 0])) as Record<ArtifactName, number>;
	for (const t of traces) for (const g of t.gets) if (g.computed) n[g.artifact]++;
	return n;
}
