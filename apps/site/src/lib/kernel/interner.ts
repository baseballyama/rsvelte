// Port of `rsv_kernel::intern` for the visualisation. The table layout, load factor, growth and probe
// sequence are the Rust ones; the hash is FNV-1a rather than rustc-hash's FxHasher, so slot numbers
// shown on the site differ from what the Rust interner would pick for the same names.

export interface Probe {
	slot: number;
	/** The atom id + 1 stored there, 0 when empty. */
	stored: number;
}

export interface InternResult {
	atom: number;
	fresh: boolean;
	grew: boolean;
	probes: Probe[];
}

export function fnv1a(s: string): number {
	let h = 0x811c9dc5;
	for (const b of new TextEncoder().encode(s)) {
		h ^= b;
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}

export class Interner {
	buf = '';
	ends: number[] = [];
	table: number[] = [];

	constructor(private readonly minCapacity = 64) {}

	get(atom: number): string {
		const start = atom === 0 ? 0 : this.ends[atom - 1];
		return this.buf.slice(start, this.ends[atom]);
	}

	lookup(s: string): number | null {
		if (this.table.length === 0) return null;
		const mask = this.table.length - 1;
		let i = fnv1a(s) & mask;
		for (;;) {
			const id = this.table[i];
			if (id === 0) return null;
			if (this.get(id - 1) === s) return id - 1;
			i = (i + 1) & mask;
		}
	}

	intern(s: string): InternResult {
		let grew = false;
		if (this.table.length === 0) {
			this.grow();
			grew = true;
		}
		let { hit, slot, probes } = this.probe(s);
		if (hit !== null) return { atom: hit, fresh: false, grew, probes };
		if ((this.ends.length + 1) * 2 > this.table.length) {
			this.grow();
			grew = true;
			({ slot, probes } = this.probe(s));
		}
		const i = slot;
		this.buf += s;
		this.ends.push(this.buf.length);
		const atom = this.ends.length - 1;
		this.table[i] = atom + 1;
		return { atom, fresh: true, grew, probes };
	}

	/** The atom for `s`, or the empty slot where it would go, with every slot visited. */
	private probe(s: string): { hit: number | null; slot: number; probes: Probe[] } {
		const mask = this.table.length - 1;
		let i = fnv1a(s) & mask;
		const probes: Probe[] = [];
		for (;;) {
			const id = this.table[i];
			probes.push({ slot: i, stored: id });
			if (id === 0) return { hit: null, slot: i, probes };
			if (this.get(id - 1) === s) return { hit: id - 1, slot: i, probes };
			i = (i + 1) & mask;
		}
	}

	private grow() {
		const cap = Math.max(this.table.length * 2, this.minCapacity);
		this.table = new Array(cap).fill(0);
		const mask = cap - 1;
		for (let id = 0; id < this.ends.length; id++) {
			let i = fnv1a(this.get(id)) & mask;
			while (this.table[i] !== 0) i = (i + 1) & mask;
			this.table[i] = id + 1;
		}
	}
}
