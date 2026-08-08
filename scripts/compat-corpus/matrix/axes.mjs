/**
 * Declarative axes for the generated shape matrix (#2281 Gate 2).
 *
 * The collected corpus samples the MARGINAL distribution of published Svelte
 * code. Every bug in the #2253/#2254/#2255/#2256 batch was an INTERACTION — a
 * binding kind × a syntactic position, or a construct × a comment slot — and a
 * found corpus under-samples interactions exponentially: #2254's shape occurs
 * 0 times in 14,026 real files, #2253's 0 times. Growing the corpus does not
 * move those counts. Generating the product does.
 *
 * Adding a row here is the cheapest way to widen coverage: one line adds
 * |other axis| × |targets| new comparisons.
 */

/**
 * Axis A — the reactive binding being read. `read` is the expression text;
 * `wrap` places the generated statement body in a component.
 *
 * The declaration preamble is identical across bindings on purpose: the axes
 * must differ ONLY in the binding under test, or a divergence cannot be
 * attributed to it.
 */
const PREAMBLE = 'const obj = {}, arr = [], flag = true, other = 1, no = false;\n\tfunction sink(x) { return x; }';

export const BINDINGS = {
	'each-item': {
		read: 'item.value',
		wrap: (body) => `<script>
	const items = $state([{ value: 1 }]);
	${PREAMBLE}
</script>

{#each items as item (item.value)}
	<button onclick={() => { ${body} }}>x</button>
{/each}
`,
	},
	'each-index': {
		read: 'i',
		wrap: (body) => `<script>
	const items = $state([{ value: 1 }]);
	${PREAMBLE}
</script>

{#each items as item, i (item.value)}
	<button onclick={() => { ${body} }}>x</button>
{/each}
`,
	},
	'state-local': {
		read: 'count',
		wrap: (body) => `<script>
	let count = $state(1);
	${PREAMBLE}
	function run() { ${body} }
</script>

<button onclick={run}>x</button>
`,
	},
	'derived-local': {
		read: 'doubled',
		wrap: (body) => `<script>
	let count = $state(1);
	const doubled = $derived(count * 2);
	${PREAMBLE}
	function run() { ${body} }
</script>

<button onclick={run}>x</button>
`,
	},
	'prop-destructured': {
		read: 'p',
		wrap: (body) => `<script>
	const { p } = $props();
	${PREAMBLE}
	function run() { ${body} }
</script>

<button onclick={run}>x</button>
`,
	},
	'store-auto-sub': {
		read: '$s',
		wrap: (body) => `<script>
	import { writable } from 'svelte/store';
	const s = writable(1);
	${PREAMBLE}
	function run() { ${body} }
</script>

<button onclick={run}>x</button>
`,
	},
	'legacy-let-prop': {
		read: 'lp',
		wrap: (body) => `<script>
	export let lp = 1;
	${PREAMBLE}
	function run() { ${body} }
</script>

<button onclick={run}>x</button>
`,
	},
};

/**
 * Axis B — the syntactic position the read sits in. `%s` is the read.
 *
 * Coverage target: every ESTree field that can hold an Expression, plus the
 * statement positions whose traversal is easy to omit. #2254 was
 * `switch.discriminant`; `switch.case-test`, `class.field-init` and
 * `class.computed-method` were found by this axis in the same run.
 */
export const POSITIONS = {
	'if.test': 'if (%s) sink(1);',
	'if.alternate-test': 'if (no) sink(0); else if (%s) sink(1);',
	'while.test': 'while (%s) break;',
	'dowhile.test': 'do { break; } while (%s);',
	'for.init': 'for (let i = %s; false; ) break;',
	'for.test': 'for (;%s;) break;',
	'for.update': 'for (let i = 0; false; %s) break;',
	'forof.right': 'for (const q of [%s]) sink(q);',
	'forin.right': 'for (const q in { k: %s }) sink(q);',
	'switch.discriminant': 'switch (%s) { case 1: sink(1); }',
	'switch.case-test': 'switch (other) { case %s: sink(1); }',
	'return.argument': 'return %s;',
	'throw.argument': 'try { throw %s; } catch {}',
	'array.element': 'sink([%s]);',
	'array.spread': 'sink([...[%s]]);',
	'object.value': 'sink({ k: %s });',
	'object.computed-key': 'sink({ [%s]: 1 });',
	'object.shorthand-spread': 'sink({ ...{ k: %s } });',
	'call.argument': 'sink(%s);',
	'call.callee-object': 'sink(String(%s));',
	'new.argument': 'sink(new Array(%s));',
	'member.object': 'sink((%s).toString);',
	'member.computed': 'sink(obj[%s]);',
	'optional.member': 'sink(obj?.[%s]);',
	'conditional.test': 'sink(%s ? 1 : 2);',
	'conditional.consequent': 'sink(flag ? %s : 2);',
	'logical.left': 'sink(%s || 2);',
	'logical.right': 'sink(flag && %s);',
	'nullish.right': 'sink(flag ?? %s);',
	'binary.left': 'sink(%s + 1);',
	'binary.right': 'sink(1 + %s);',
	'unary.argument': 'sink(-%s);',
	'typeof.argument': 'sink(typeof %s);',
	'assignment.right': 'let z; z = %s; sink(z);',
	sequence: 'sink((0, %s));',
	'template.expression': 'sink(`x${%s}y`);',
	'tagged-template.expression': 'sink(String.raw`x${%s}y`);',
	'await.argument': 'queueMicrotask(async () => { await %s; });',
	'arrow.body': 'sink(() => %s);',
	'arrow.default-param': 'sink((p = %s) => p);',
	'class.field-init': 'sink(class { f = %s; });',
	'class.computed-method': 'sink(class { [%s]() {} });',
	'spread.call-argument': 'sink(...[%s]);',
	'label.body': 'lbl: { if (%s) break lbl; }',
	'try.finally': 'try {} finally { sink(%s); }',
	'destructure.default': 'const { d = %s } = obj; sink(d);',
	'array-destructure.default': 'const [e = %s] = arr; sink(e);',
};

/**
 * Axis C — comment kinds inserted at every line boundary of a seed (#2253's
 * family). A comment is the one token that may appear between ANY two tokens,
 * so any code path that finds a terminator by scanning bytes rather than by
 * lexing breaks here. #2253 was five such scans; `skip_opaque` consolidated
 * them.
 *
 * `block-with-brace` and `block-with-paren` carry the terminator characters
 * that those scans were hunting for — they are the discriminating inputs, not
 * decoration.
 */
export const COMMENT_KINDS = {
	line: '// c',
	'line-with-brace': '// } c',
	'line-with-paren': '// ) c',
	'line-with-semi': '// ; c',
	block: '/* c */',
	'block-with-brace': '/* } c */',
	'block-with-paren': '/* ) c */',
	'svelte-ignore': '// svelte-ignore a11y_no_static_element_interactions',
};

/**
 * Seeds for the comment axis. Kept small and hand-picked: each one is a
 * construct whose codegen is known to do text-level work (class fields,
 * reactive statements, snippets, async bodies). The corpus-seeded generalization
 * of this axis is Gate 3.
 */
export const COMMENT_SEEDS = {
	'class-private-state': `<script>
	class Counter {
		#n = $state(0);
		constructor() {
			this.#n = 1;
		}
		get n() {
			return this.#n;
		}
	}
	const c = new Counter();
</script>

<button onclick={() => c.n}>x</button>
`,
	'class-static-block': `<script>
	class Registry {
		static items = [];
		static {
			Registry.items.push(1);
		}
		#v = $state(0);
		bump() {
			this.#v += 1;
		}
	}
	const r = new Registry();
</script>

<button onclick={() => r.bump()}>x</button>
`,
	'legacy-reactive': `<script>
	export let a = 1;
	let b = 0;
	$: b = a * 2;
	$: if (b > 2) {
		console.log(b);
	}
</script>

<p>{b}</p>
`,
	'snippet-render': `<script>
	let items = $state([1, 2]);
</script>

{#snippet row(v)}
	<li>{v}</li>
{/snippet}

<ul>
	{#each items as item}
		{@render row(item)}
	{/each}
</ul>
`,
	'await-block': `<script>
	let p = $state(Promise.resolve(1));
</script>

{#await p}
	<span>loading</span>
{:then v}
	<span>{v}</span>
{:catch e}
	<span>{e}</span>
{/await}
`,
	'module-script': `<script module>
	export const shared = 1;
	let hidden = 0;
	export function bump() {
		hidden += 1;
	}
</script>

<script>
	let local = $state(shared);
</script>

<button onclick={() => (local += 1)}>{local}</button>
`,
};

/**
 * Axis F — how a string literal spells itself, crossed with axis G, the template
 * slot whose expression holds it.
 *
 * esrap writes a literal's `raw` verbatim, so official's output carries the
 * source's quote style AND its escape spelling. Anything that re-prints the
 * cooked value instead agrees about the string's *value* and disagrees about
 * its text — output that parses, runs correctly, and still diverges. The escapes
 * that expose it are exactly the ones a printer does not re-emit (`\t`, `\v`,
 * `\b`, `\f`, `\x41`, `A`); `\n` and `\\` agree by coincidence and are the
 * negative controls.
 *
 * Both quote styles are present because a fix that only preserved double-quoted
 * literals is what shipped, and a single-quote-only axis would score it green.
 */
export const LITERAL_ESCAPES = {
	tab: "'a\\tb'",
	'tab-double-quoted': '"a\\tb"',
	vtab: "'a\\vb'",
	backspace: "'a\\bb'",
	formfeed: "'a\\fb'",
	newline: "'a\\nb'",
	'carriage-return': "'a\\rb'",
	nul: "'a\\0b'",
	hex: "'a\\x41b'",
	unicode: "'a\\u0041b'",
	'unicode-braced': "'a\\u{1F600}b'",
	'surrogate-pair': "'a\\uD83D\\uDE00b'",
	backslash: "'a\\\\b'",
	'escaped-single-quote': "'a\\'b'",
	'escaped-double-quote': '"a\\"b"',
	'unescaped-other-quote': "'a\"b'",
};

/**
 * Axis G — the template slot the literal sits in. `%s` is the literal.
 *
 * This is the first axis in this file that injects into MARKUP rather than into
 * a JS statement inside `<script>`, which gate-coverage 5c records as the
 * matrix's largest blind spot. Each slot is a different route from the parsed
 * expression to the emitted text — interpolation, an attribute, a directive
 * value, a block head, a handler body — and they do not share one converter.
 */
export const EXPRESSION_SLOTS = {
	interpolation: '<p>{%s}</p>',
	'attribute-value': '<p title={%s}>x</p>',
	'const-tag': '{#if true}{@const t = %s}<p>{t}</p>{/if}',
	'event-handler': '<button onclick={() => console.log(%s)}>x</button>',
	'if-test': '{#if %s}<p>y</p>{/if}',
	'each-expression': '{#each [%s] as v}<p>{v}</p>{/each}',
	'html-tag': '{@html %s}',
	'class-directive': '<p class:on={%s}>x</p>',
	'style-directive': '<p style:color={%s}>x</p>',
	'spread-attribute': '<p {...{ k: %s }}>x</p>',
	'render-argument': '{#snippet row(v)}<li>{v}</li>{/snippet}{@render row(%s)}',
	'key-block': '{#key %s}<p>x</p>{/key}',
	'await-expression': '{#await Promise.resolve(%s) then v}<p>{v}</p>{/await}',
	// The one slot that goes through the instance-script text pipeline rather
	// than the expression converter.
	'instance-declaration': '<script>\n\tconst s = %s;\n</script>\n\n<p>{s}</p>',
};

/**
 * Axis D — expressions that are not a legal `bind:` target, crossed with axis E,
 * the directive slot they sit in.
 *
 * Every other family here generates VALID programs and asks whether the two
 * compilers agree on the output. This one generates programs the official
 * compiler rejects and asks whether rsvelte rejects them with the same code —
 * a question no collected corpus can pose, because published code compiles.
 * The `compiler-errors` fixtures do pose it, but at one input per code, and
 * that is not enough: `<Comp bind:value={o.x = obj} />` compiled into a
 * getter/setter around an assignment while `bind_invalid_expression` had a
 * passing fixture, because upstream runs `object(node.expression)` once for
 * both slots and rsvelte had the check on the element path only.
 *
 * The element and component slots are the axis that finds that: a validation
 * written per slot drifts, and only the product notices.
 */
export const INVALID_BIND_TARGETS = {
	assignment: 'o.x = obj',
	'compound-assignment': 'o.x += 1',
	call: 'o.f()',
	'call-plain': 'fn()',
	binary: 'o.x + 1',
	conditional: 'flag ? o.x : o.y',
	literal: "'lit'",
	number: '1',
	array: '[o.x]',
	unary: '!o.x',
	template: '`t${o.x}`',
	'new-expression': 'new Thing()',
	'await-like': 'o.x ?? o.y',
	'logical-or': 'o.x || o.y',
	'paren-assignment': '(o.x = obj)',
	'optional-member': 'o?.x',
	'optional-call': 'o.f?.()',
	update: 'o.x++',
	'arrow-only': '() => o.x',
	'object-literal': '{ a: o.x }',
};

/**
 * Axis E — the `bind:` slot. `%s` is the target expression.
 *
 * `bind:this` is here because it takes a different code path from a value
 * binding on both compilers, and on components a third one again.
 */
export const BIND_SLOTS = {
	'element-value': '<input bind:value={%s} />',
	'element-group': '<input type="checkbox" bind:group={%s} />',
	'element-this': '<div bind:this={%s}></div>',
	'element-clientwidth': '<div bind:clientWidth={%s}></div>',
	'component-value': '<Comp bind:value={%s} />',
	'component-this': '<Comp bind:this={%s} />',
	'component-named': '<Comp bind:whatever={%s} />',
	'window-scrolly': '<svelte:window bind:scrollY={%s} />',
};

/**
 * Axis D2 — expressions that ARE a legal `bind:` target, crossed with the same
 * slots. The counterpart signal: a validation that rejects too much shows up as
 * "rsvelte rejects, official accepts", which the invalid rows can never report.
 *
 * The TypeScript rows are the discriminating ones. Upstream analyses the AST
 * with the TS nodes already removed, so `o.x as number` reaches its `object()`
 * as the bare member chain; a port that walks the parsed AST sees a
 * `TSAsExpression` and calls the target invalid. `<Radio bind:group={c as T} />`
 * is real shipped code (flowbite-svelte), which is how that over-rejection got
 * caught — by a corpus file, not by this gate, and only for the component slot
 * that file happens to use.
 */
export const VALID_BIND_TARGETS = {
	identifier: { expr: 'obj' },
	member: { expr: 'o.x' },
	'deep-member': { expr: 'o.x.y' },
	'computed-member': { expr: 'o[key]' },
	'string-computed': { expr: "o['k']" },
	'getter-setter-pair': { expr: '() => o.x, (v) => (o.x = v)' },
	'ts-as': { expr: 'o.x as number', ts: true },
	'ts-as-identifier': { expr: 'obj as object', ts: true },
	'ts-non-null': { expr: 'o.x!', ts: true },
	'ts-satisfies': { expr: '(o.x satisfies number)', ts: true },
	'ts-as-then-non-null': { expr: '(o.x as number)!', ts: true },
};

/** The declarations every bind case shares, so only the axes differ. */
export const BIND_PREAMBLE = `<script>
	import Comp from './Comp.svelte';
	let o = $state({ x: 1, y: 2 });
	let obj = $state({});
	let flag = $state(true);
	let key = $state('x');
	function fn() {}
	class Thing {}
</script>
`;

/** Same declarations under `lang="ts"`, for the rows that carry TS syntax. */
export const BIND_PREAMBLE_TS = `<script lang="ts">
	import Comp from './Comp.svelte';
	let o = $state({ x: 1, y: 2 });
	let obj = $state({});
	let flag = $state(true);
	let key = $state('x');
	function fn() {}
	class Thing {}
</script>
`;

/**
 * Seeds for the comment axis on the `.svelte.(js|ts)` MODULE path — the whole-file
 * insertion `mutate.mjs` documents but that nothing fed until now.
 *
 * The module path needs its own seeds because it is a different compiler entry
 * point: `compileModule` rejects component source and `compile` rejects module
 * source, so a `.svelte` case can never reach it. It is also the only place this
 * behaviour is observable at all — the collected corpus TS-strips `.svelte.ts`
 * through esbuild before either compiler runs (see `compile.mjs`'s
 * `prepareSource`), which deletes the comments outright, and it holds 7 module
 * entries with a surviving top-level comment.
 *
 * `source` must parse as plain JS even under `.svelte.ts`: `compileModule` does
 * not strip types, so a seed carrying real TS syntax would be rejected by BOTH
 * compilers and score as `error-parity` — agreement about nothing.
 */
export const COMMENT_MODULE_SEEDS = {
	// `$derived` is deliberately NOT exported: `compileModule` rejects that
	// ("Cannot export derived state from a module"), and a seed both compilers
	// reject scores as `error-parity` — agreement about nothing.
	'module-rune-exports': {
		ext: '.svelte.js',
		source: `export const total = $state(0);
const doubled = $derived(total * 2);
let hidden = 0;
export function bump() {
	hidden += 1;
	return hidden + doubled;
}
`,
	},
	'module-class-state': {
		ext: '.svelte.js',
		source: `export class Counter {
	#n = $state(0);
	get n() {
		return this.#n;
	}
	bump() {
		this.#n += 1;
	}
}
export const shared = new Counter();
`,
	},
	// Same construct under the `.svelte.ts` extension: the corpus can never show
	// this one, because stripping runs before the compiler does.
	'module-ts-extension': {
		ext: '.svelte.ts',
		source: `export const flag = $state(false);
export function toggle() {
	return flag;
}
`,
	},
};
