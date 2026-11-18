// A model of `buffer_pool::take_keyed` / `buffer_pool::give_keyed` for one key (one column type of
// `rsvelte_svelte_syntax::syntax_tree::Component`) on one worker: each document parses one tree,
// which lives until the document ends. Growth follows Rust's `Vec` (amortised doubling, first allocation of 4
// for small elements). The byte budget is counted in elements here; the real one is `MAXIMUM_BYTES`,
// over every key of the thread.

const MAX_PER_KEY = 16;

type Event =
	| {
			kind: 'take';
			syntax_tree: string;
			got: number | null;
			need: number;
			allocations: number;
			cap: number;
	  }
	| {
			kind: 'give';
			syntax_tree: string;
			cap: number;
			kept: boolean;
			why: 'kept' | 'disabled' | 'full' | 'budget';
	  };

export interface Step {
	doc: number;
	event: Event;
	pool: number[];
	allocations: number;
}

function growths(from: number, need: number): { allocations: number; cap: number } {
	let cap = from;
	let allocations = 0;
	while (cap < need) {
		cap = cap === 0 ? 4 : cap * 2;
		allocations++;
	}
	return { allocations, cap };
}

/**
 * `sizes[d]` is the parsed tree's node count for document d. `budget` is
 * what the pool may hold, in elements.
 */
export function simulate(sizes: number[], enabled: boolean, budget = Infinity): Step[] {
	const pool: number[] = [];
	const steps: Step[] = [];
	let total = 0;
	sizes.forEach((n, doc) => {
		const live = new Map<string, number>();
		const take = (syntax_tree: string, need: number) => {
			const got = enabled ? (pool.pop() ?? null) : null;
			const g = growths(got ?? 0, need);
			total += g.allocations;
			live.set(syntax_tree, g.cap);
			steps.push({
				doc,
				event: { kind: 'take', syntax_tree, got, need, ...g },
				pool: [...pool],
				allocations: total,
			});
		};
		const give = (syntax_tree: string) => {
			const cap = live.get(syntax_tree)!;
			live.delete(syntax_tree);
			const held = pool.reduce((a, b) => a + b, 0);
			const why = !enabled
				? 'disabled'
				: held + cap > budget
					? 'budget'
					: pool.length >= MAX_PER_KEY
						? 'full'
						: 'kept';
			const kept = why === 'kept';
			if (kept) pool.push(cap);
			steps.push({
				doc,
				event: { kind: 'give', syntax_tree, cap, kept, why },
				pool: [...pool],
				allocations: total,
			});
		};
		take('Component', n);
		give('Component');
	});
	return steps;
}
