// A model of `run_each` for the timeline figure: documents go to whichever worker is free, a result
// is sunk (and freed) when its document finishes, and documents with a project-task part are held
// until the project pass after the parallel pass. Durations and sizes are illustrative, not measured.

export interface SimDoc {
	id: number;
	cost: number;
	/** Bytes of outputs the result holds until it is sunk. */
	size: number;
	hasPart: boolean;
}

export interface Block {
	doc: number;
	worker: number;
	start: number;
	end: number;
	held: boolean;
}

export interface SimResult {
	blocks: Block[];
	parallelEnd: number;
	projectEnd: number;
	/** [time, live result bytes] steps for both ways of collecting. */
	streaming: [number, number][];
	collected: [number, number][];
	peakStreaming: number;
	peakCollected: number;
}

/** Deterministic, so the figure is the same on the server and after hydration. */
function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0;
		return s / 2 ** 32;
	};
}

export function makeDocs(n: number, partShare: number, seed = 7): SimDoc[] {
	const r = rng(seed);
	return Array.from({ length: n }, (_, id) => ({
		id,
		cost: 2 + Math.floor(r() * 9),
		size: 1 + Math.floor(r() * 4),
		hasPart: r() < partShare
	}));
}

export function simulate(docs: SimDoc[], workers: number, projectCost: number): SimResult {
	const free = new Array(workers).fill(0);
	const blocks: Block[] = [];
	for (const d of docs) {
		const w = free.indexOf(Math.min(...free));
		const start = free[w];
		free[w] = start + d.cost;
		blocks.push({ doc: d.id, worker: w, start, end: free[w], held: d.hasPart });
	}
	const parallelEnd = Math.max(...free, 0);
	const anyPart = docs.some((d) => d.hasPart);
	const projectEnd = parallelEnd + (anyPart ? projectCost : 0);

	const events: [number, number, number][] = [];
	for (const b of blocks) {
		const d = docs[b.doc];
		// A result exists from the moment its document finishes; streaming frees it at once unless held.
		events.push([b.end, d.size, d.hasPart ? projectEnd : b.end]);
	}
	const curve = (stream: boolean): [number, number][] => {
		const deltas = new Map<number, number>();
		const bump = (t: number, v: number) => deltas.set(t, (deltas.get(t) ?? 0) + v);
		for (const [t, size, freedAt] of events) {
			bump(t, size);
			// `run` drops its collected results only after it returns, strictly after the last one arrives.
			bump(stream ? freedAt : projectEnd + 1e-6, -size);
		}
		let live = 0;
		const out: [number, number][] = [[0, 0]];
		for (const t of [...deltas.keys()].sort((a, b) => a - b)) {
			live += deltas.get(t)!;
			out.push([t, live]);
		}
		return out;
	};
	const streaming = curve(true);
	const collected = curve(false);
	// A result sunk at the instant it is made still exists for that instant.
	const peakStreaming = Math.max(
		...streaming.map((p) => p[1]),
		...docs.filter((d) => !d.hasPart).map((d) => d.size),
		0
	);
	return {
		blocks,
		parallelEnd,
		projectEnd,
		streaming,
		collected,
		peakStreaming,
		peakCollected: Math.max(...collected.map((p) => p[1]), 0)
	};
}
