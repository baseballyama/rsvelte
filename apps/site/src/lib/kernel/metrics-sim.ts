// The accounting of `measurement::phase` guards: on drop, a frame's total is added to its parent's child
// totals, and the row records total minus children. Ported from `impl Drop for PhaseGuard`.

export interface PhaseRow {
	name: string;
	calls: number;
	selfNs: number;
	totalNs: number;
	selfAllocations: number;
}

export interface Span {
	name: string;
	start: number;
	end: number;
	allocations: number;
	children: Span[];
}

interface Frame {
	name: string;
	start: number;
	allocs0: number;
	childNs: number;
	childAllocations: number;
}

/** Replays a tree of phases as enter/exit events on one thread and returns the phase table. */
export function account(roots: Span[]): PhaseRow[] {
	const rows: PhaseRow[] = [];
	const stack: Frame[] = [];
	let allocations = 0;
	const enter = (s: Span) => stack.push({ name: s.name, start: s.start, allocs0: allocations, childNs: 0, childAllocations: 0 });
	const exit = (s: Span) => {
		const f = stack.pop()!;
		const total = s.end - f.start;
		const ta = allocations - f.allocs0;
		const parent = stack.at(-1);
		if (parent) {
			parent.childNs += total;
			parent.childAllocations += ta;
		}
		// A linear search by name, as the Rust table does.
		let row = rows.find((r) => r.name === f.name);
		if (!row) rows.push((row = { name: f.name, calls: 0, selfNs: 0, totalNs: 0, selfAllocations: 0 }));
		row.calls++;
		row.totalNs += total;
		row.selfNs += Math.max(0, total - f.childNs);
		row.selfAllocations += Math.max(0, ta - f.childAllocations);
	};
	const walk = (s: Span) => {
		enter(s);
		// A span's own allocations happen before its children in this model.
		allocations += s.allocations;
		for (const c of s.children) walk(c);
		exit(s);
	};
	for (const r of roots) walk(r);
	return rows;
}
