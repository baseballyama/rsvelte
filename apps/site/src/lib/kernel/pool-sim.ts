// A model of `pool::take` / `pool::give` for one vector type on one worker, driven by the order in
// which rsv_svelte creates and drops `Ast`s for a document: the parsed tree lives until the document
// ends; each compile target lowers into a fresh tree that is dropped after printing. Growth follows
// Rust's `Vec` (amortised doubling, first allocation of 4 for small elements).

export const MAX_PER_TYPE = 16;

export type Event =
	| { kind: 'take'; ast: string; got: number | null; need: number; allocs: number; cap: number }
	| { kind: 'give'; ast: string; cap: number; kept: boolean };

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

/** `sizes[d]` is the parsed tree's node count for document d; lowered trees are larger. */
export function simulate(sizes: number[], enabled: boolean): Step[] {
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
			const kept = enabled && pool.length < MAX_PER_TYPE;
			if (kept) pool.push(cap);
			steps.push({ doc, event: { kind: 'give', ast, cap, kept }, pool: [...pool], allocs: total });
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
