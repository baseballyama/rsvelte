// A line-for-line port of `rsv_kernel::doc` so the site can run the printer in the browser. The
// structure (arena, node kinds, the printer's command stack, `fits` with rest commands) follows the
// Rust file; `doc.test.ts` ports its tests. The one addition is `trace`, which records every
// decision the printer makes so the playground can show why a layout came out as it did.

export type DocId = number & { readonly __doc: unique symbol };
export type GroupId = number & { readonly __group: unique symbol };

type LineKind = 'normal' | 'soft' | 'hard' | 'literal';

export type Node =
	| { t: 'text'; s: string }
	| { t: 'line'; kind: LineKind }
	| { t: 'concat'; kids: DocId[] }
	| { t: 'group'; kids: DocId[]; brk: boolean; id: GroupId | null }
	| { t: 'fill'; kids: DocId[] }
	| { t: 'indent'; d: DocId }
	| { t: 'dedent'; d: DocId }
	| { t: 'ifBreak'; broken: DocId; flat: DocId; group: GroupId | null }
	| { t: 'indentIfBreak'; doc: DocId; group: GroupId }
	| { t: 'breakParent' }
	| { t: 'flatOnly'; d: DocId };

export interface PrintOptions {
	width: number;
	/** `null` for tabs. */
	indentSpaces: number | null;
	tabWidth: number;
}

export const defaultOptions: PrintOptions = { width: 80, indentSpaces: 2, tabWidth: 2 };

type Mode = 'flat' | 'break';

export type TraceEvent =
	| { kind: 'group'; doc: DocId; pos: number; rem: number; mode: Mode; why: 'fits' | 'does-not-fit' | 'broken' | 'parent-flat' }
	| { kind: 'fill'; doc: DocId; pos: number; contentFits: boolean; separatorFits: boolean | null }
	| { kind: 'refused'; doc: DocId; pos: number }
	| { kind: 'remeasure'; pos: number };

export class Refused extends Error {
	constructor() {
		super('a flat-only layout did not fit on its line');
	}
}

export class Docs {
	nodes: Node[] = [];
	private groups = 0;

	private push(n: Node): DocId {
		this.nodes.push(n);
		return (this.nodes.length - 1) as DocId;
	}

	nil(): DocId {
		return this.push({ t: 'text', s: '' });
	}
	text(s: string): DocId {
		return this.push({ t: 'text', s });
	}
	line(): DocId {
		return this.push({ t: 'line', kind: 'normal' });
	}
	softline(): DocId {
		return this.push({ t: 'line', kind: 'soft' });
	}
	hardline(): DocId {
		return this.push({ t: 'line', kind: 'hard' });
	}
	literalline(): DocId {
		return this.push({ t: 'line', kind: 'literal' });
	}
	breakParent(): DocId {
		return this.push({ t: 'breakParent' });
	}
	concat(kids: DocId[]): DocId {
		return this.push({ t: 'concat', kids: [...kids] });
	}
	group(kids: DocId[]): DocId {
		return this.push({ t: 'group', kids: [...kids], brk: false, id: null });
	}
	groupBroken(kids: DocId[]): DocId {
		return this.push({ t: 'group', kids: [...kids], brk: true, id: null });
	}
	newGroupId(): GroupId {
		return ++this.groups as GroupId;
	}
	groupWithId(kids: DocId[], id: GroupId): DocId {
		return this.push({ t: 'group', kids: [...kids], brk: false, id });
	}
	/** Alternating content and separators: `[c0, sep0, c1, sep1, c2, …]`. */
	fill(kids: DocId[]): DocId {
		return this.push({ t: 'fill', kids: [...kids] });
	}
	indent(d: DocId): DocId {
		return this.push({ t: 'indent', d });
	}
	dedent(d: DocId): DocId {
		return this.push({ t: 'dedent', d });
	}
	ifBreak(broken: DocId, flat: DocId): DocId {
		return this.push({ t: 'ifBreak', broken, flat, group: null });
	}
	ifBreakOf(broken: DocId, flat: DocId, group: GroupId): DocId {
		return this.push({ t: 'ifBreak', broken, flat, group });
	}
	indentIfBreak(doc: DocId, group: GroupId): DocId {
		return this.push({ t: 'indentIfBreak', doc, group });
	}
	flatOnly(d: DocId): DocId {
		return this.push({ t: 'flatOnly', d });
	}
	join(sep: DocId, items: DocId[]): DocId[] {
		return items.flatMap((d, i) => (i > 0 ? [sep, d] : [d]));
	}

	isEmpty(d: DocId): boolean {
		const n = this.nodes[d];
		switch (n.t) {
			case 'text':
				return n.s === '';
			case 'line':
				return true;
			case 'concat':
			case 'group':
				return n.kids.length === 0;
			case 'indent':
			case 'dedent':
			case 'flatOnly':
				return this.isEmpty(n.d);
			case 'indentIfBreak':
				return this.isEmpty(n.doc);
			case 'fill':
				return n.kids.every((k) => this.isEmpty(k));
			case 'ifBreak':
			case 'breakParent':
				return false;
		}
	}

	isLine(d: DocId): boolean {
		const n = this.nodes[d];
		if (n.t === 'line') return true;
		return n.t === 'concat' && n.kids.every((k) => this.isLine(k));
	}

	private parts(d: DocId): DocId[] | null {
		const n = this.nodes[d];
		return n.t === 'concat' || n.t === 'fill' || n.t === 'group' ? n.kids : null;
	}

	trimRight(docs: DocId[], ws: (d: Docs, x: DocId) => boolean): void {
		let keep = 0;
		for (let i = docs.length - 1; i >= 0; i--) {
			if (!this.isEmpty(docs[i]) && !ws(this, docs[i])) {
				keep = i + 1;
				break;
			}
		}
		if (keep < docs.length) {
			const removed = docs.splice(keep);
			if (removed.every((d) => this.isEmpty(d))) this.trimRight(docs, ws);
		} else if (docs.length > 0) {
			const last = docs[docs.length - 1];
			const inner = this.parts(last);
			if (inner) {
				const copy = [...inner];
				this.trimRight(copy, ws);
				(this.nodes[last] as { kids: DocId[] }).kids = copy;
			}
		}
	}

	private propagateBreaks(root: DocId): void {
		const memo = new Map<DocId, boolean>();
		const breaks = (id: DocId): boolean => {
			const known = memo.get(id);
			if (known !== undefined) return known;
			const n = this.nodes[id];
			let b: boolean;
			switch (n.t) {
				case 'line':
					b = n.kind === 'hard' || n.kind === 'literal';
					break;
				case 'breakParent':
					b = true;
					break;
				case 'text':
					b = false;
					break;
				case 'indent':
				case 'dedent':
				case 'flatOnly':
					b = breaks(n.d);
					break;
				case 'indentIfBreak':
					b = breaks(n.doc);
					break;
				case 'ifBreak': {
					const a = breaks(n.broken);
					b = breaks(n.flat) || a;
					break;
				}
				case 'concat':
				case 'fill':
				case 'group': {
					let any = false;
					for (const k of n.kids) any = breaks(k) || any;
					if (n.t === 'group') n.brk ||= any;
					b = any;
					break;
				}
			}
			memo.set(id, b);
			return b;
		};
		breaks(root);
	}

	print(root: DocId, opts: PrintOptions = defaultOptions, trace?: TraceEvent[]): string {
		this.propagateBreaks(root);
		const p = new Printer(this, opts, this.groups, trace);
		p.run(root);
		if (p.refused) throw new Refused();
		return p.out;
	}
}

type Item =
	| { k: 'doc'; id: DocId }
	| { k: 'fill'; kids: DocId[] }
	| { k: 'triple'; ds: [DocId, DocId, DocId] };

type Cmd = [ind: number, mode: Mode, item: Item];

const doc = (id: DocId): Item => ({ k: 'doc', id });

/** Prettier's `getStringWidth`, with the same wide ranges as the Rust port. */
export function stringWidth(s: string): number {
	let w = 0;
	for (const ch of s) {
		const u = ch.codePointAt(0)!;
		if ((u >= 0x300 && u <= 0x36f) || (u >= 0x200b && u <= 0x200f)) continue;
		w += isWide(u) ? 2 : 1;
	}
	return w;
}

const WIDE: [number, number][] = [
	[0x1100, 0x115f], [0x2e80, 0x303e], [0x3041, 0x33ff], [0x3400, 0x4dbf], [0x4e00, 0x9fff],
	[0xa000, 0xa4cf], [0xac00, 0xd7a3], [0xf900, 0xfaff], [0xfe30, 0xfe4f], [0xff00, 0xff60],
	[0xffe0, 0xffe6], [0x1f300, 0x1f64f], [0x1f900, 0x1f9ff], [0x20000, 0x3fffd]
];

function isWide(u: number): boolean {
	return WIDE.some(([lo, hi]) => u >= lo && u <= hi);
}

class Printer {
	out = '';
	pos = 0;
	groupModes: (Mode | null)[];
	remeasure = false;
	refused = false;

	constructor(
		private docs: Docs,
		private opts: PrintOptions,
		groups: number,
		private trace?: TraceEvent[]
	) {
		this.groupModes = new Array(groups + 1).fill(null);
	}

	private newline(ind: number) {
		this.out = this.out.replace(/[ \t]+$/, '');
		this.out += '\n' + (this.opts.indentSpaces === null ? '\t'.repeat(ind) : ' '.repeat(this.opts.indentSpaces * ind));
		this.pos = ind * (this.opts.indentSpaces ?? this.opts.tabWidth);
	}

	private ifBreakBranch(mode: Mode, broken: DocId, flat: DocId, g: GroupId | null): DocId {
		const m = g === null ? mode : (this.groupModes[g] ?? 'flat');
		return m === 'break' ? broken : flat;
	}

	private rem(): number {
		return this.opts.width - this.pos;
	}

	run(root: DocId) {
		const stack: Cmd[] = [[0, 'break', doc(root)]];
		let cmd: Cmd | undefined;
		while ((cmd = stack.pop())) {
			const [ind, mode, item] = cmd;
			if (item.k === 'fill') {
				this.fill(ind, mode, item.kids, stack);
				continue;
			}
			if (item.k === 'triple') {
				for (const d of [...item.ds].reverse()) stack.push([ind, mode, doc(d)]);
				continue;
			}
			const id = item.id;
			const n = this.docs.nodes[id];
			switch (n.t) {
				case 'text':
					this.pos += stringWidth(n.s);
					this.out += n.s;
					break;
				case 'line':
					if (mode === 'flat') {
						if (n.kind === 'normal') {
							this.out += ' ';
							this.pos += 1;
							break;
						}
						if (n.kind === 'soft') break;
						this.remeasure = true;
						this.trace?.push({ kind: 'remeasure', pos: this.pos });
					}
					if (n.kind === 'literal') {
						this.out += '\n';
						this.pos = 0;
					} else {
						this.newline(ind);
					}
					break;
				case 'breakParent':
					break;
				case 'concat':
					for (let i = n.kids.length - 1; i >= 0; i--) stack.push([ind, mode, doc(n.kids[i])]);
					break;
				case 'indent':
					stack.push([ind + 1, mode, doc(n.d)]);
					break;
				case 'dedent':
					stack.push([Math.max(0, ind - 1), mode, doc(n.d)]);
					break;
				case 'ifBreak':
					stack.push([ind, mode, doc(this.ifBreakBranch(mode, n.broken, n.flat, n.group))]);
					break;
				case 'indentIfBreak':
					stack.push([ind + (this.groupModes[n.group] === 'break' ? 1 : 0), mode, doc(n.doc)]);
					break;
				case 'flatOnly':
					if (mode === 'break' && !this.fits([[ind, 'flat', doc(n.d)]], stack, this.rem(), false)) {
						this.refused = true;
						this.trace?.push({ kind: 'refused', doc: id, pos: this.pos });
					}
					stack.push([ind, 'flat', doc(n.d)]);
					break;
				case 'group': {
					let next: Mode;
					let why: 'fits' | 'does-not-fit' | 'broken' | 'parent-flat';
					if (mode === 'flat' && !this.remeasure) {
						next = n.brk ? 'break' : 'flat';
						why = n.brk ? 'broken' : 'parent-flat';
					} else {
						this.remeasure = false;
						if (n.brk) {
							next = 'break';
							why = 'broken';
						} else if (this.fits([[ind, 'flat', doc(id)]], stack, this.rem(), false)) {
							next = 'flat';
							why = 'fits';
						} else {
							next = 'break';
							why = 'does-not-fit';
						}
					}
					this.trace?.push({ kind: 'group', doc: id, pos: this.pos, rem: this.rem(), mode: next, why });
					if (n.id !== null) this.groupModes[n.id] = next;
					for (let i = n.kids.length - 1; i >= 0; i--) stack.push([ind, next, doc(n.kids[i])]);
					break;
				}
				case 'fill':
					stack.push([ind, mode, { k: 'fill', kids: n.kids }]);
					break;
			}
		}
	}

	private fill(ind: number, mode: Mode, kids: DocId[], stack: Cmd[]) {
		if (kids.length === 0) return;
		const content = kids[0];
		const contentFits = this.fits([[ind, 'flat', doc(content)]], [], this.rem(), true);
		const contentMode: Mode = contentFits ? 'flat' : 'break';
		if (kids.length === 1) {
			this.trace?.push({ kind: 'fill', doc: content, pos: this.pos, contentFits, separatorFits: null });
			stack.push([ind, contentMode, doc(content)]);
			return;
		}
		const ws = kids[1];
		if (kids.length === 2) {
			this.trace?.push({ kind: 'fill', doc: content, pos: this.pos, contentFits, separatorFits: null });
			stack.push([ind, contentMode, doc(ws)]);
			stack.push([ind, contentMode, doc(content)]);
			return;
		}
		const pair: Cmd[] = [[ind, 'flat', { k: 'triple', ds: [content, ws, kids[2]] }]];
		const separatorFits = this.fits(pair, [], this.rem(), true);
		this.trace?.push({ kind: 'fill', doc: content, pos: this.pos, contentFits, separatorFits });
		stack.push([ind, mode, { k: 'fill', kids: kids.slice(2) }]);
		stack.push([ind, separatorFits ? 'flat' : 'break', doc(ws)]);
		stack.push([ind, contentMode, doc(content)]);
	}

	/** Prettier's `fits`: whether `next` fits in `rem` columns, continuing into `rest` until the first line break. */
	private fits(next: Cmd[], rest: Cmd[], rem: number, mustBeFlat: boolean): boolean {
		const work: Cmd[] = [...next].reverse();
		let restI = rest.length;
		while (rem >= 0) {
			const cmd = work.pop();
			if (!cmd) {
				if (restI === 0) return true;
				work.push(rest[--restI]);
				continue;
			}
			const [ind, mode, item] = cmd;
			if (item.k === 'fill') {
				for (let i = item.kids.length - 1; i >= 0; i--) work.push([ind, mode, doc(item.kids[i])]);
				continue;
			}
			if (item.k === 'triple') {
				for (const d of [...item.ds].reverse()) work.push([ind, mode, doc(d)]);
				continue;
			}
			const n = this.docs.nodes[item.id];
			switch (n.t) {
				case 'text':
					rem -= stringWidth(n.s);
					break;
				case 'line':
					if (mode === 'break' || n.kind === 'hard' || n.kind === 'literal') return true;
					if (n.kind === 'normal') rem -= 1;
					break;
				case 'breakParent':
					break;
				case 'concat':
				case 'fill':
					for (let i = n.kids.length - 1; i >= 0; i--) work.push([ind, mode, doc(n.kids[i])]);
					break;
				case 'group': {
					if (mustBeFlat && n.brk) return false;
					const m: Mode = n.brk ? 'break' : mode;
					for (let i = n.kids.length - 1; i >= 0; i--) work.push([ind, m, doc(n.kids[i])]);
					break;
				}
				case 'indent':
				case 'dedent':
					work.push([ind, mode, doc(n.d)]);
					break;
				case 'indentIfBreak':
					work.push([ind, mode, doc(n.doc)]);
					break;
				case 'flatOnly':
					work.push([ind, 'flat', doc(n.d)]);
					break;
				case 'ifBreak':
					work.push([ind, mode, doc(this.ifBreakBranch(mode, n.broken, n.flat, n.group))]);
					break;
			}
		}
		return false;
	}
}
