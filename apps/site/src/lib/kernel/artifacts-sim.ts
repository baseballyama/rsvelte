// A model of `DocumentContext::get` with the Svelte plugin's artifacts and the `ts.view` facet. The call order
// inside each task and each artifact's `compute` is transcribed from rsvelte_svelte (tasks.rs, lib.rs:
// `compile_input` asks for the parse and the HIR) and rsvelte_javascript/check.rs; the kernel rule it models is
// computation/database.rs: the first request computes; later requests reuse the cached value.

export type ArtifactName =
	| 'svelte.parse'
	| 'svelte.resolve'
	| 'svelte.compiler_syntax_tree'
	| 'svelte.analyze'
	| 'svelte.css'
	| 'ts.view';

export const ARTIFACTS: ArtifactName[] = ['svelte.parse', 'svelte.resolve', 'svelte.compiler_syntax_tree', 'svelte.analyze', 'svelte.css', 'ts.view'];
export type TaskId = 'svelte.compile/client' | 'svelte.compile/server' | 'svelte.format/default' | 'svelte.lint/default' | 'svelte.check/default';

export const TASKS: TaskId[] = [
	'svelte.compile/client',
	'svelte.compile/server',
	'svelte.format/default',
	'svelte.lint/default',
	'svelte.check/default'
];

export interface LayoutInstruction {
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
	/** DocumentContext::computed() after the task, for the DocumentContext the task used. */
	computed: ArtifactName[];
}

class SimulationContext {
	cache = new Set<ArtifactName>();
	computed: ArtifactName[] = [];
	constructor(
		private doc: LayoutInstruction,
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
		if (a === 'svelte.resolve' || a === 'svelte.compiler_syntax_tree' || a === 'ts.view') this.get('svelte.parse', depth + 1);
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

	/** `rsvelte_svelte::compile_input`: the parse, then the HIR when it parsed. */
	compileInput(depth = 0): void {
		this.get('svelte.parse', depth);
		if (this.doc.parses) this.get('svelte.compiler_syntax_tree', depth);
	}
}

function runTask(task: TaskId, context: SimulationContext, doc: LayoutInstruction) {
	switch (task) {
		case 'svelte.compile/client':
		case 'svelte.compile/server':
			context.get('svelte.parse');
			if (!doc.parses) return;
			context.compileInput();
			context.get('svelte.resolve');
			context.get('svelte.analyze');
			context.get('svelte.css');
			return;
		case 'svelte.format/default':
			context.get('svelte.parse');
			return;
		case 'svelte.lint/default':
			context.get('svelte.parse');
			if (!doc.parses) return;
			context.get('svelte.resolve');
			context.get('svelte.compiler_syntax_tree');
			return;
		case 'svelte.check/default':
			context.get('ts.view');
	}
}

export function simulate(tasks: TaskId[], doc: LayoutInstruction, sharing: 'shared' | 'isolated'): TaskTrace[] {
	const shared = new SimulationContext(doc, []);
	return TASKS.filter((t) => tasks.includes(t)).map((task) => {
		const gets: GetEvent[] = [];
		const context = sharing === 'shared' ? shared : new SimulationContext(doc, gets);
		context.setLog(gets);
		runTask(task, context, doc);
		return { task, gets, computed: [...context.computed] };
	});
}

export function computeCounts(traces: TaskTrace[]): Record<ArtifactName, number> {
	const n = Object.fromEntries(ARTIFACTS.map((a) => [a, 0])) as Record<ArtifactName, number>;
	for (const t of traces) for (const g of t.gets) if (g.computed) n[g.artifact]++;
	return n;
}
