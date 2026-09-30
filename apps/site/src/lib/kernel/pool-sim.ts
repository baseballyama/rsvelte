// A model of `pool::take_keyed` / `pool::give_keyed` for one key (one column type of `rsv_js::Ast`)
// on one worker, driven by the order in which rsv_svelte creates and drops `Ast`s for a document:
// the parsed tree lives until the document ends; each compile target lowers into a fresh tree that
// is dropped after printing. Growth follows Rust's `Vec` (amortised doubling, first allocation of 4
// for small elements). The byte budget is counted in elements here; the real one is `MAX_BYTES`,
// over every key of the thread.

export const MAX_PER_KEY = 16;

export type Event =
	| { kind: 'take'; ast: string; got: number | null; need: number; allocs: number; cap: number }
	| { kind: 'give'; ast: string; cap: number; kept: boolean; why: 'kept' | 'disabled' | 'full' | 'budget' };

export interface Step {
	doc: number;
	event: Event;
	pool: number[];
	allocs: number;
}

function growths(from: number, need: number): { allocs: number; cap: number } {
	let cap = from;
	let allocs = 0;
	while (cap < need) {
		cap = cap === 0 ? 4 : cap * 2;
		allocs++;
	}
	return { allocs, cap };
}

/**
 * `sizes[d]` is the parsed tree's node count for document d; lowered trees are larger. `budget` is
 * what the pool may hold, in elements.
 */
export function simulate(sizes: number[], enabled: boolean, budget = Infinity): Step[] {
	const pool: number[] = [];
	const steps: Step[] = [];
	let total = 0;
	sizes.forEach((n, doc) => {
		const live = new Map<string, number>();
		const take = (ast: string, need: number) => {
			const got = enabled ? (pool.pop() ?? null) : null;
			const g = growths(got ?? 0, need);
			total += g.allocs;
			live.set(ast, g.cap);
			steps.push({ doc, event: { kind: 'take', ast, got, need, ...g }, pool: [...pool], allocs: total });
		};
		const give = (ast: string) => {
			const cap = live.get(ast)!;
			live.delete(ast);
			const held = pool.reduce((a, b) => a + b, 0);
			const why = !enabled ? 'disabled' : held + cap > budget ? 'budget' : pool.length >= MAX_PER_KEY ? 'full' : 'kept';
			const kept = why === 'kept';
			if (kept) pool.push(cap);
			steps.push({ doc, event: { kind: 'give', ast, cap, kept, why }, pool: [...pool], allocs: total });
		};
		take('parse', n);
		take('lower.client', Math.round(n * 1.6));
		give('lower.client');
		take('lower.server', Math.round(n * 1.3));
		give('lower.server');
		give('parse');
	});
	return steps;
}
