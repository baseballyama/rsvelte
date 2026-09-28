// A small expression language for building `Docs` in the playground, mirroring the builder methods:
//   group("f(", indent([softline, join([",", line], ["a", "b"])]), softline, ")")
// Arrays are concats; `groupId("name", …)` names a group for `ifBreakOf("name", …)` and
// `indentIfBreak("name", …)`.

import { Docs, type DocId, type GroupId } from './doc.ts';

export class DslError extends Error {
	constructor(
		message: string,
		readonly at: number
	) {
		super(message);
	}
}

type Tok = { t: 'str'; v: string; at: number } | { t: 'id'; v: string; at: number } | { t: 'p'; v: string; at: number };

function lex(src: string): Tok[] {
	const out: Tok[] = [];
	let i = 0;
	while (i < src.length) {
		const c = src[i];
		if (/\s/.test(c)) {
			i++;
		} else if (c === '/' && src[i + 1] === '/') {
			while (i < src.length && src[i] !== '\n') i++;
		} else if (c === '"') {
			const at = i;
			let v = '';
			i++;
			while (i < src.length && src[i] !== '"') {
				if (src[i] === '\\') {
					const e = src[i + 1];
					v += e === 'n' ? '\n' : e === 't' ? '\t' : e;
					i += 2;
				} else v += src[i++];
			}
			if (src[i] !== '"') throw new DslError('文字列が閉じていません', at);
			i++;
			out.push({ t: 'str', v, at });
		} else if (/[A-Za-z_]/.test(c)) {
			const at = i;
			while (i < src.length && /\w/.test(src[i])) i++;
			out.push({ t: 'id', v: src.slice(at, i), at });
		} else if ('()[],'.includes(c)) {
			out.push({ t: 'p', v: c, at: i++ });
		} else {
			throw new DslError(`使えない文字 ${JSON.stringify(c)}`, i);
		}
	}
	return out;
}

type Value = { k: 'doc'; id: DocId } | { k: 'list'; items: DocId[] } | { k: 'str'; v: string };

const ATOMS = ['line', 'softline', 'hardline', 'literalline', 'breakParent', 'nil'] as const;

export interface Parsed {
	docs: Docs;
	root: DocId;
	/** Where each node came from in the source, for pointing at trace entries. */
	origin: Map<DocId, number>;
}

export function parseDoc(src: string): Parsed {
	const toks = lex(src);
	let p = 0;
	const docs = new Docs();
	const groups = new Map<string, GroupId>();
	const origin = new Map<DocId, number>();
	const peek = () => toks[p];
	const expect = (v: string) => {
		const t = toks[p];
		if (!t || t.t !== 'p' || t.v !== v) throw new DslError(`${v} が必要です`, t?.at ?? src.length);
		p++;
	};
	const gid = (name: string) => {
		let g = groups.get(name);
		if (!g) groups.set(name, (g = docs.newGroupId()));
		return g;
	};
	const asDoc = (v: Value, at: number): DocId => {
		if (v.k === 'doc') return v.id;
		if (v.k === 'str') return docs.text(v.v);
		const id = docs.concat(v.items);
		origin.set(id, at);
		return id;
	};
	const asStr = (v: Value, at: number): string => {
		if (v.k !== 'str') throw new DslError('ここには文字列（グループ名）が必要です', at);
		return v.v;
	};

	function args(): { v: Value; at: number }[] {
		expect('(');
		const out: { v: Value; at: number }[] = [];
		while (peek() && !(peek().t === 'p' && peek().v === ')')) {
			const at = peek().at;
			out.push({ v: value(), at });
			if (peek()?.t === 'p' && peek().v === ',') p++;
			else break;
		}
		expect(')');
		return out;
	}

	function value(): Value {
		const t = toks[p++];
		if (!t) throw new DslError('式が途中で終わっています', src.length);
		if (t.t === 'str') return { k: 'str', v: t.v };
		if (t.t === 'p' && t.v === '[') {
			const items: DocId[] = [];
			while (peek() && !(peek().t === 'p' && peek().v === ']')) {
				const at = peek().at;
				const v = value();
				if (v.k === 'list') items.push(...v.items);
				else items.push(asDoc(v, at));
				if (peek()?.t === 'p' && peek().v === ',') p++;
				else break;
			}
			expect(']');
			return { k: 'list', items };
		}
		if (t.t !== 'id') throw new DslError(`予期しない ${t.v}`, t.at);
		const name = t.v;
		let id: DocId;
		if ((ATOMS as readonly string[]).includes(name)) {
			id =
				name === 'line'
					? docs.line()
					: name === 'softline'
						? docs.softline()
						: name === 'hardline'
							? docs.hardline()
							: name === 'literalline'
								? docs.literalline()
								: name === 'breakParent'
									? docs.breakParent()
									: docs.nil();
		} else {
			const a = args();
			const d = (i: number) => {
				if (!a[i]) throw new DslError(`${name} の引数が足りません`, t.at);
				return asDoc(a[i].v, a[i].at);
			};
			const all = (from = 0) => a.slice(from).flatMap((x) => (x.v.k === 'list' ? x.v.items : [asDoc(x.v, x.at)]));
			const need = (n: number) => {
				if (a.length !== n) throw new DslError(`${name} は引数を ${n} 個とります`, t.at);
			};
			switch (name) {
				case 'concat':
					id = docs.concat(all());
					break;
				case 'group':
					id = docs.group(all());
					break;
				case 'groupBroken':
					id = docs.groupBroken(all());
					break;
				case 'groupId':
					id = docs.groupWithId(all(1), gid(asStr(a[0]?.v ?? { k: 'list', items: [] }, t.at)));
					break;
				case 'fill':
					id = docs.fill(all());
					break;
				case 'indent':
					need(1);
					id = docs.indent(d(0));
					break;
				case 'dedent':
					need(1);
					id = docs.dedent(d(0));
					break;
				case 'flatOnly':
					need(1);
					id = docs.flatOnly(d(0));
					break;
				case 'ifBreak':
					need(2);
					id = docs.ifBreak(d(0), d(1));
					break;
				case 'ifBreakOf':
					need(3);
					id = docs.ifBreakOf(d(1), d(2), gid(asStr(a[0].v, a[0].at)));
					break;
				case 'indentIfBreak':
					need(2);
					id = docs.indentIfBreak(d(1), gid(asStr(a[0].v, a[0].at)));
					break;
				case 'join': {
					need(2);
					const items = a[1].v.k === 'list' ? a[1].v.items : [d(1)];
					return { k: 'list', items: docs.join(d(0), items) };
				}
				default:
					throw new DslError(`知らない関数 ${name}`, t.at);
			}
		}
		origin.set(id, t.at);
		return { k: 'doc', id };
	}

	const at = peek()?.at ?? 0;
	const root = asDoc(value(), at);
	if (p < toks.length) throw new DslError('式のあとに余分なものがあります', toks[p].at);
	return { docs, root, origin };
}
