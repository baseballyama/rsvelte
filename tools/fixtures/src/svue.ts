// `.svue`: Vue's template syntax with Svelte's semantics, the input of rsvelte's syntax-swap demo.
//
// The script is a Svelte instance script (runes), written as `<script setup>`; the template uses
// `{{ }}`, `:attr`, `@event`, `v-if` / `v-else-if` / `v-else`; a style is a Svelte style (scoped
// by Svelte, whatever its attributes say). The meaning is Svelte's, so the oracle is the Svelte
// compiler on the same component written in Svelte's syntax. `toSvelte` is that rewrite, done on
// the source text so everything it does not rewrite stays byte for byte:
//
//   {{ e }}        → { e }
//   :x="e"         → x={e}
//   @x="e"         → onx={e}
//   v-if="e"       → {#if e}…      v-else-if="e" → {:else if e}…      v-else → {:else}…{/if}
//
// The whitespace between the elements of one `v-if` chain is dropped, as Vue drops it. Anything
// else (other directives, braces in text or in a static value, a comment inside a chain) throws:
// it has no rewrite that keeps the same text.
import { parse } from '@vue/compiler-sfc';

const ELEMENT = 1;
const TEXT = 2;
const COMMENT = 3;
const INTERPOLATION = 5;
const ATTRIBUTE = 6;
const DIRECTIVE = 7;

interface Loc {
	start: { offset: number };
	end: { offset: number };
	source: string;
}
interface Exp {
	content: string;
	loc: Loc;
}
interface Prop {
	type: number;
	name: string;
	loc: Loc;
	arg?: Exp;
	exp?: Exp;
	value?: { content: string; loc: Loc };
	rawName?: string;
}
interface TNode {
	type: number;
	loc: Loc;
	props?: Prop[];
	children?: TNode[];
	content?: Exp;
}

interface Edit {
	lo: number;
	hi: number;
	text: string;
}

export function toSvelte(src: string, filename: string): string {
	const { descriptor, errors } = parse(src, { filename });
	if (errors.length) throw new Error(`${filename}: ${errors[0]}`);
	const { template, scriptSetup, script, styles } = descriptor;
	if (script) throw new Error(`${filename}: only <script setup> holds the instance script`);
	if (styles.length > 1) throw new Error(`${filename}: one <style> at most`);
	const edits: Edit[] = [];
	const unsupported = (what: string, loc: Loc) => {
		throw new Error(`${filename}: ${what} at ${loc.start.offset}: ${loc.source.slice(0, 40)}`);
	};
	const noBraces = (text: string, loc: Loc) => {
		if (/[{}]/.test(text)) unsupported('braces in text', loc);
	};

	const children = (nodes: TNode[]) => {
		let chainEnd: number | null = null;
		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i]!;
			if (n.type === TEXT) {
				noBraces(n.loc.source, n.loc);
				continue;
			}
			if (n.type === COMMENT) continue;
			if (n.type === INTERPOLATION) {
				const raw = n.loc.source;
				edits.push({ lo: n.loc.start.offset, hi: n.loc.end.offset, text: `{${raw.slice(2, -2)}}` });
				chainEnd = closeChain(chainEnd);
				continue;
			}
			if (n.type !== ELEMENT) unsupported('this node', n.loc);
			const cond = (n.props ?? []).find((p) => p.type === DIRECTIVE && ['if', 'else-if', 'else'].includes(p.name));
			if (cond?.name === 'if' || !cond) chainEnd = closeChain(chainEnd);
			if (cond) {
				const test = cond.exp ? cond.exp.loc.source : '';
				const open = cond.name === 'if' ? `{#if ${test}}` : cond.name === 'else-if' ? `{:else if ${test}}` : '{:else}';
				if (cond.name === 'if') {
					edits.push({ lo: n.loc.start.offset, hi: n.loc.start.offset, text: open });
				} else {
					if (chainEnd === null) unsupported('v-else without v-if', cond.loc);
					const between = src.slice(chainEnd!, n.loc.start.offset);
					if (between.trim() !== '') unsupported('a node inside a v-if chain', n.loc);
					edits.push({ lo: chainEnd!, hi: n.loc.start.offset, text: open });
				}
				chainEnd = cond.name === 'else' ? null : n.loc.end.offset;
				if (cond.name === 'else') edits.push({ lo: n.loc.end.offset, hi: n.loc.end.offset, text: '{/if}' });
			}
			element(n);
		}
		closeChain(chainEnd);
	};

	/** A chain without `v-else` ends after its last branch. */
	const closeChain = (end: number | null): null => {
		if (end !== null) edits.push({ lo: end, hi: end, text: '{/if}' });
		return null;
	};

	const element = (n: TNode) => {
		for (const p of n.props ?? []) {
			// The attribute and the whitespace before it.
			let lo = p.loc.start.offset;
			while (/\s/.test(src[lo - 1]!)) lo--;
			const hi = p.loc.end.offset;
			if (p.type === ATTRIBUTE) {
				if (p.value) noBraces(p.value.content, p.loc);
				continue;
			}
			if (p.type !== DIRECTIVE) unsupported('this attribute', p.loc);
			if (['if', 'else-if', 'else'].includes(p.name)) {
				edits.push({ lo, hi, text: '' });
				continue;
			}
			if (!p.arg || !p.exp || !/^[\w-]+$/.test(p.arg.content) || !['bind', 'on'].includes(p.name)) {
				unsupported('this directive', p.loc);
			}
			const name = p.name === 'on' ? `on${p.arg!.content}` : p.arg!.content;
			edits.push({ lo: p.loc.start.offset, hi, text: `${name}={${p.exp!.loc.source}}` });
		}
		children(n.children ?? []);
	};

	if (template) children((template.ast as unknown as TNode).children ?? []);

	const blocks: string[] = [];
	if (scriptSetup) {
		const lang = scriptSetup.lang ? ` lang="${scriptSetup.lang}"` : '';
		blocks.push(`<script${lang}>${scriptSetup.content}</script>`);
	}
	if (template) {
		const inner = template.loc;
		let text = '';
		let at = inner.start.offset;
		for (const e of edits.sort((a, b) => a.lo - b.lo || a.hi - b.hi)) {
			text += src.slice(at, e.lo) + e.text;
			at = e.hi;
		}
		blocks.push(text + src.slice(at, inner.end.offset));
	}
	if (styles[0]) blocks.push(`<style>${styles[0].content}</style>`);
	return blocks.join('\n') + '\n';
}
