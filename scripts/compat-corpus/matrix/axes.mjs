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
	// The SSR constant fold rebuilds logical lines by scanning bytes, so the
	// slot BETWEEN `=` and its value is a distinct hazard from the slot above
	// the declaration — a `//` there swallows the value once the lines join.
	'const-fold-line-continuation': `<script>
	let n = $state(0);
	const cont =
		"a\\
\t\tb";
</script>

<p>{cont}{n}</p>
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
 * Axis H — the token a `/` follows, crossed with axis I, the host that holds the
 * expression.
 *
 * Whether a `/` opens a regex literal or divides is decided by the PRECEDING
 * TOKEN, and every hand-written scanner in the client instance-script text
 * pipeline decided it from the preceding BYTE. An identifier-looking byte reads
 * as "an operand ended here", so the `n` of `return` turned `return /re/` into a
 * division and the rest of the line was misparsed.
 *
 * The keyword rows are every ECMA-262 §12.7.2 reserved word that CANNOT end an
 * expression and can be followed by a regex literal in expression position, plus
 * the contextual `of` of a `for…of` head. The five reserved words that CAN end
 * an expression — `this`, `super`, `true`, `false`, `null` — are excluded by
 * construction: a `/` after them is a division, and they belong with the
 * controls below.
 *
 * `%s` is the regex literal. Every row reads `v` AFTER the literal, for two
 * reasons: a scan that mis-read the literal drops or fails to rewrite the reads
 * behind it, which is the observable damage; and a bare literal operand is
 * constant-folded by one compiler and not the other, which would make the row
 * diverge for a reason that has nothing to do with the slash.
 */
export const SLASH_REGEX_PREFIXES = {
	return: '(() => { return %s.test(String(v)); })()',
	typeof: 'typeof %s.exec(String(v))',
	void: '(void %s.test(String(v)), String(v))',
	delete: '(delete %s.lastIndex ? v : 0)',
	instanceof: '(%s instanceof RegExp ? v : 0)',
	in: "('0' in %s.exec(String(v)) ? 1 : 0)",
	new: 'new RegExp(%s).test(String(v))',
	case: '(() => { switch (String(v)) { case %s.source: return 1; default: return 2; } })()',
	of: '(() => { for (const q of [%s]) return q.test(String(v)); })()',
	do: '(() => { do { return %s.test(String(v)); } while (false); })()',
	else: '(() => { if (v) return 0; else return %s.test(String(v)); })()',
	throw: '(() => { try { throw %s; } catch (e) { return e.test(String(v)); } })()',
	yield: '(function* () { yield %s.test(String(v)); })()',
	await: '(async () => await %s.test(String(v)))()',
	extends: '(() => { class T extends %s.constructor { m() { return v; } } return new T().m(); })()',
};

/**
 * The regex literal itself. `delimiters` is the discriminating body — a scanner
 * that read the literal as a division goes on to count the `;{}()` inside it as
 * code, which is what every terminator hunt in these passes is looking for.
 * `plain` is the negative control (nothing inside it can move a scan), and
 * `escaped-slash` is #2618's adjacency, which a division reading re-exposes.
 */
export const REGEX_BODIES = {
	delimiters: '/[;{})(]/',
	plain: '/ab/',
	'escaped-slash': '/a\\/\\/b/',
	'slash-in-class': '/[//]/',
	flags: '/ab/gi',
};

/**
 * The counterpart polarity: a `/` that IS a division and must stay one. A fix
 * that widened the regex reading would score green on every row above and
 * silently swallow the rest of these lines.
 *
 * `ident-ending-in-keyword` and `property-named-like-keyword` are the two a
 * keyword allow-list gets wrong when it matches a suffix instead of a whole
 * token; `comment-ending-in-keyword` is the one a scan that looks BACKWARDS from
 * the slash gets wrong, because the run it finds is inside a comment the scan
 * had already stepped over.
 */
export const SLASH_DIVISION_CONTROLS = {
	chain: 'v / 2 / 4',
	update: '(() => { let n = Number(v); return n++ / 2 / 4; })()',
	'ident-ending-in-keyword': '(() => { const preturn = Number(v); return preturn / 2 / 4; })()',
	'property-named-like-keyword': '(() => { const o = { in: Number(v), return: 4 }; return o.in / o.return / 2; })()',
	'string-ending-in-keyword': "('return'.length / 2 / Number(v))",
	'regex-flag-then-division': '(/ab/gi.lastIndex / 2 / Number(v))',
	'comment-ending-in-keyword': '(v /* return */ / 2 / 4)',
	'this-then-division': '(function () { return this / 2 / Number(v); }).call(4)',
	'true-then-division': '(() => { return true / 2 / Number(v); })()',
	'null-then-division': '(() => { return null / 2 / Number(v); })()',
};

/**
 * Axis I — the host that holds the expression. `%s` is the expression.
 *
 * The point of this axis is that the scanners are per-pass: the legacy `$:`
 * accumulator, the prop-read rewriter, the class-body splitter and the template
 * expression converter each have their own scan, and a fix applied to the shared
 * helper has to reach all of them. The runes and module hosts are the negative
 * controls — they take different routes and were never expected to break.
 */
export const SLASH_HOSTS = {
	'legacy-reactive': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	export let v;
	let k;
	$: k = ${expr};
</script>

<p>{k}{v}</p>
`,
	},
	'legacy-reactive-block': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	export let v;
	let k;
	$: {
		k = ${expr};
	}
</script>

<p>{k}{v}</p>
`,
	},
	'legacy-prop-default': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	export let v = 1;
	export let p = ${expr};
	let k;
	$: k = p;
</script>

<p>{k}{v}</p>
`,
	},
	'legacy-function': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	export let v;
	let k;
	function f() {
		return ${expr};
	}
	$: k = f();
</script>

<p>{k}{v}</p>
`,
	},
	'runes-derived': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	let v = $state(1);
	const k = $derived(${expr});
</script>

<p>{k}{v}</p>
`,
	},
	'runes-class-method': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	let v = $state(1);
	class C {
		#n = $state(0);
		m() {
			return [this.#n, ${expr}];
		}
	}
	const c = new C();
</script>

<p>{c.m()}{v}</p>
`,
	},
	'template-expression': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	let v = $state(1);
</script>

<p>{${expr}}</p>
`,
	},
	'event-handler': {
		ext: '.svelte',
		wrap: (expr) => `<script>
	let v = $state(1);
</script>

<button onclick={() => ${expr}}>x</button>
`,
	},
	module: {
		ext: '.svelte.js',
		kind: 'module',
		wrap: (expr) => `let v = $state(1);
export const k = ${expr};
`,
	},
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

/**
 * Axis H — the `{#each}` collection expression, crossed with axis I, how the
 * loop item is used.
 *
 * In legacy mode a REASSIGNED each item is read back as `collection[$$index]`,
 * which puts the collection in a member-OBJECT slot — the one place where an
 * expression's own precedence decides whether it needs parentheses. rsvelte
 * spliced it there as opaque text, which carries no precedence at all, so
 * `list ?? []` printed as `list ?? [][$$index]`: a different expression, and on
 * the left of `=` not even parseable.
 *
 * Both polarities are here on purpose. The loose rows must gain parentheses;
 * the tight rows (`identifier`, `member`, `call`, …) must not, or a fix that
 * parenthesises unconditionally scores green while changing output for every
 * collection that was already right. `optional-member` is the sharpest of the
 * tight rows: `o?.list` DOES need them, because a bare member would otherwise
 * join the optional chain.
 */
export const EACH_COLLECTIONS = {
	nullish: 'list ?? []',
	'logical-or': 'list || []',
	'logical-and': 'flag && list',
	conditional: 'flag ? list : other',
	'unary-not': '!list',
	'typeof-operand': 'typeof list',
	'binary-plus': 'list + other',
	sequence: '(other, list)',
	assignment: '(list = other)',
	arrow: '(() => list)',
	await: 'await list',
	// Tight-binding controls: these must print exactly as they do today.
	identifier: 'list',
	member: 'o.list',
	'computed-member': "o['list']",
	call: 'getList()',
	'new-expression': 'new Array(1)',
	'optional-member': 'o?.list',
	'array-literal': '[1, 2]',
	'template-literal': '`ab`',
	parenthesized: '(list)',
};

/**
 * Axis I — what the loop item does, which is what decides whether the item is
 * `reassigned` and therefore whether the collection reaches a member-object slot
 * at all. These are four different builders in rsvelte (the identifier read
 * transform, the assignment path, the update-expression path, and the `bind:`
 * accessor pair), and only the last one built its setter as text.
 *
 * `plain-read` and `mutate-property` are the negative controls: the item is
 * never reassigned, so no `collection[$$index]` is emitted and the collection
 * must not appear in a member slot.
 */
export const EACH_ITEM_SLOTS = {
	'bind-value': '{#each %s as item}\n\t<input bind:value={item} />\n{/each}',
	'bind-value-indexed': '{#each %s as item, i}\n\t<input bind:value={item} />\n\t<p>{i}</p>\n{/each}',
	'bind-value-keyed-index': '{#each %s as item, i (i)}\n\t<input bind:value={item} />\n{/each}',
	'bind-group': '{#each %s as item}\n\t<input type="checkbox" bind:group={item} />\n{/each}',
	'assign-handler': '{#each %s as item}\n\t<button onclick={() => (item = 1)}>x</button>\n{/each}',
	'compound-assign-handler': '{#each %s as item}\n\t<button onclick={() => (item += 1)}>x</button>\n{/each}',
	'update-handler': '{#each %s as item}\n\t<button onclick={() => item++}>x</button>\n{/each}',
	'read-and-assign': '{#each %s as item}\n\t<button onclick={() => (item = 1)}>{item}</button>\n{/each}',
	'plain-read': '{#each %s as item}\n\t<p>{item}</p>\n{/each}',
	'mutate-property': '{#each %s as item}\n\t<button onclick={() => (item.v = 1)}>x</button>\n{/each}',
};

/**
 * The declarations every each case shares. Deliberately rune-free: the
 * reassigned-item read only exists in legacy mode, so a `$state` preamble would
 * make every row measure nothing.
 */
export const EACH_PREAMBLE = `<script>
	let list = [1];
	let other = [2];
	let flag = true;
	let o = { list: [3] };
	function getList() {
		return [4];
	}
</script>

`;

/**
 * Every declaration is reassigned here so that none of them is "unused" in the
 * rows that do not name it. A legacy `let` only becomes a `$.mutable_source`
 * when something writes to it, so without this the preamble itself would differ
 * between rows and the divergence would not be attributable to the axis.
 */
export const EACH_EPILOGUE = `<button onclick={() => ((list = list), (other = other), (flag = flag), (o = o))}>y</button>
`;

/**
 * `await` / `yield` inside a function's formal parameters — the fourth axis
 * family, and the second whose inputs the official compiler REJECTS.
 *
 * Acorn raises `js_parse_error` for every illegal cell here
 * (`checkYieldAwaitInDefaultParams`); OXC implements no such rule, so rsvelte
 * compiled all of them. That is the direction that matters for a drop-in
 * replacement — a file official refuses builds here and ships.
 *
 * The product is what finds it. A check written for one function form does not
 * see the others (an async method is not an arrow), a check written for the
 * first parameter does not see the second, and a check that walks the whole
 * subtree over-rejects the legal rows, where the offending keyword sits in a
 * NESTED function's body rather than in the parameter list itself.
 */
export const PARAM_FUNCTION_FORMS = {
	'async-arrow': 'const f = async (%s) => p;',
	'sync-arrow': 'const f = (%s) => p;',
	'async-fn-decl': 'async function f(%s) {\n\treturn p;\n}',
	'async-fn-expr': 'const f = async function (%s) {\n\treturn p;\n};',
	'async-method': 'const o = {\n\tasync m(%s) {\n\t\treturn p;\n\t}\n};',
	'async-class-method': 'class C {\n\tasync m(%s) {\n\t\treturn p;\n\t}\n}',
	'async-generator-method': 'const o = {\n\tasync *m(%s) {\n\t\treturn p;\n\t}\n};',
	'generator-fn-decl': 'function* g(%s) {\n\treturn p;\n}',
	'generator-method': 'const o = {\n\t*g(%s) {\n\t\treturn p;\n\t}\n};',
};

/**
 * The same parameter lists reached through a template expression instead of a
 * script. rsvelte parses those with a different function, so a fix applied to
 * the script path alone leaves this one accepting.
 */
export const PARAM_TEMPLATE_FORMS = {
	'attr-async-arrow': '<button onclick={async (%s) => p}>go</button>',
	'attr-sync-arrow': '<button onclick={(%s) => p}>go</button>',
	'expr-async-arrow': '<p>{typeof (async (%s) => p)}</p>',
};

/** Where inside the parameter list the initializer sits. */
export const PARAM_DEFAULT_SLOTS = {
	simple: 'p = %s',
	'object-pattern': '{ p = %s } = {}',
	'array-pattern': '[p = %s] = []',
	'second-param': 'a, p = %s',
	'nested-arrow-param': 'p = ((q = %s) => q)',
};

/** Initializers acorn rejects in a parameter list, whatever encloses it. */
export const PARAM_ILLEGAL_INITIALIZERS = {
	await: 'await load()',
	yield: 'yield 1',
};

/**
 * Initializers that must keep compiling. The nested rows are the discriminating
 * ones: the keyword is present, and lexically inside the parameter list, but it
 * belongs to a function of its own — which is exactly what a subtree scan
 * cannot tell apart from the illegal rows.
 */
export const PARAM_LEGAL_INITIALIZERS = {
	call: 'load()',
	'nested-async-body': '(async () => await load())',
	'nested-method-body': '{ async m() { return await load(); } }',
	'nested-generator-body': 'function* () { yield 1; }',
	'keyword-lookalike': 'awaitable + yielded',
};

/** The declarations every parameter case shares, so only the axes differ. */
export const PARAM_PREAMBLE = `<script>
	function load() {}
	let awaitable = 1;
	let yielded = 1;
%s
</script>

<p>ok</p>
`;

/** Same declarations, with the parameter list in the markup instead. */
export const PARAM_TEMPLATE_PREAMBLE = `<script>
	function load() {}
	let awaitable = 1;
	let yielded = 1;
</script>

%s
`;

/** Same declarations on the `.svelte.js` module path. */
export const PARAM_MODULE_PREAMBLE = `function load() {}
let awaitable = 1;
let yielded = 1;
%s
`;

/**
 * Axis H — where a reactive name sits inside a function's binding PATTERN,
 * crossed with axis I, the statement context the pattern is reached through.
 *
 * A name in a pattern slot is a DECLARATION, not a read, so nothing may wrap it:
 * `({ id: id() }) =>` is not a binding pattern and no parser accepts it. The
 * `read-` rows are the opposite signal — there the name IS a read (a default
 * value, a computed key, an object literal defaulting a parameter, the body),
 * and a guard written as "anything lexically inside a parameter list" silently
 * drops its reactivity instead of emitting invalid syntax.
 *
 * The context axis is what makes the family discriminating rather than a list of
 * shapes. Only the legacy `$:` statement routes the expression through the
 * client text rewriter; a function body, a declaration initializer and every
 * template slot reach the AST path, which was already correct. A shape axis
 * alone would have measured a path that never had the defect — which is the same
 * reason the collected corpus scored 0 while the shape was shipping.
 */
export const PARAM_PATTERN_SHAPES = {
	'object-shorthand': '({ id }) => id',
	'object-alias': '({ k: id }) => id',
	'object-nested': '({ a: { id } }) => id',
	'object-rest': '({ ...id }) => id',
	'object-second-prop': '({ a, id }) => a + id',
	'array-element': '([id]) => id',
	'array-second-element': '([a, id]) => a + id',
	'array-nested': '([[id]]) => id',
	'array-rest': '([...id]) => id',
	'object-in-array': '([{ id }]) => id',
	'array-in-object': '({ a: [id] }) => id',
	'second-param': '(a, { id }) => a + id',
	'fn-expression': 'function ({ id }) { return id; }',
	'named-fn-expression': 'function pick({ id }) { return id; }',
	'read-object-default': '({ k = id }) => k',
	'read-array-default': '([k = id]) => k',
	'read-computed-key': '({ [id]: k }) => k',
	'read-param-default-object': '(o = { id }) => o',
	'read-param-default-array': '(o = [id]) => o',
	'read-body': '(k) => k + id',
};

/** Script statements holding the callback. `%s` is the shape. */
export const PARAM_PATTERN_SCRIPT_CONTEXTS = {
	'reactive-assignment': '\t$: out = rows.map(%s);',
	'reactive-object-value': '\t$: out = { list: rows.map(%s) };',
	'reactive-block': '\t$: {\n\t\tout = rows.map(%s);\n\t}',
	'reactive-if': '\t$: if (rows.length) {\n\t\tout = rows.map(%s);\n\t}',
	'function-body': '\tfunction run() {\n\t\tout = rows.map(%s);\n\t}\n\trun();',
	'declaration-init': '\tconst init = rows.map(%s);\n\t$: out = init;',
};

/** Template slots holding the same callback. `%s` is the shape. */
export const PARAM_PATTERN_MARKUP_CONTEXTS = {
	interpolation: '<p>{rows.map(%s)}</p>',
	'event-handler': '<button on:click={() => rows.map(%s)}>x</button>',
	'each-expression': '{#each rows.map(%s) as v}<p>{v}</p>{/each}',
};

/** The declarations every script case shares, so only the axes differ. */
export const PARAM_PATTERN_PREAMBLE = `<script>
	export let id = 1;
	export let rows = [];
	let out;
%s
</script>

<p>{out}{id}</p>
`;

/** Same declarations, with the callback in the markup instead. */
export const PARAM_PATTERN_MARKUP_PREAMBLE = `<script>
	export let id = 1;
	export let rows = [];
</script>

%s
<p>{id}</p>
`;

/**
 * Axis H — the directive kind, crossed with axis I, the element kind hosting it,
 * crossed with the component's mode.
 *
 * Which parents a per-directive rule applies to is written once upstream (a
 * `parent_type` test inside the directive's own visitor) and per-parent in
 * rsvelte (each element visitor handles its own attribute list), so the rule
 * drifts exactly where the product is not enumerated. #2497 is that shape:
 * `event_directive_deprecated` fired on `RegularElement` and not on
 * `SvelteElement`, though upstream's single predicate names both.
 *
 * Mode is an axis rather than a constant because the deprecation warnings are
 * gated on `analysis.runes` — a runes-only family cannot report an over-warn in
 * legacy mode, and a legacy-only one cannot report the miss that motivated this.
 *
 * There is deliberately no skip list. Cells the official compiler rejects are
 * not dropped: `run.mjs` compares the two error **codes**, so an illegal
 * combination is a comparison rather than a hole, and skipping it would report
 * coverage the family does not have.
 */
export const DIRECTIVE_KINDS = {
	on: 'on:click={handler}',
	'on-once': 'on:click|once={handler}',
	// Legal on an element, rejected on a component (only `once` is allowed there).
	'on-preventdefault': 'on:click|preventDefault={handler}',
	// The modern spelling: the negative control for every `on:` row, since no
	// deprecation rule may fire for it on any parent.
	'onclick-attribute': 'onclick={handler}',
	'bind-value': 'bind:value={text}',
	'bind-this': 'bind:this={ref}',
	'bind-getter-setter': 'bind:value={() => text, (v) => (text = v)}',
	use: 'use:action',
	'use-argument': 'use:action={1}',
	transition: 'transition:fade',
	'transition-argument': 'transition:fade={{ duration: 1 }}',
	in: 'in:fade',
	out: 'out:fade',
	animate: 'animate:flip',
	class: 'class:on={flag}',
	style: 'style:color={color}',
	let: 'let:x',
	attach: '{@attach attachment}',
	spread: '{...props}',
};

/**
 * Axis I — the element kind. `%s` is the directive.
 *
 * `regular-input` sits next to `regular-element` because `bind:value` is legal
 * on one and not the other, so the pair separates "this parent rejects the
 * directive kind" from "this parent rejects this binding name".
 * `each-keyed-element` is the only host where `animate:` is legal, which is a
 * property of the ANCESTRY rather than of the element.
 */
export const DIRECTIVE_HOSTS = {
	'regular-element': '<div %s>x</div>',
	'regular-input': '<input %s />',
	'svelte-element': '<svelte:element this={tag} %s>x</svelte:element>',
	component: '<Comp %s />',
	'svelte-component': '<svelte:component this={Comp} %s />',
	'svelte-self': '{#if flag}<svelte:self %s />{/if}',
	'svelte-window': '<svelte:window %s />',
	'svelte-body': '<svelte:body %s />',
	'svelte-document': '<svelte:document %s />',
	'svelte-head': '<svelte:head %s>x</svelte:head>',
	'svelte-boundary': '<svelte:boundary %s>x</svelte:boundary>',
	'svelte-fragment': '<Comp><svelte:fragment %s>x</svelte:fragment></Comp>',
	'each-keyed-element': '{#each items as item (item.id)}<div %s>x</div>{/each}',
};

/**
 * The declarations every directive case shares. The two modes declare the same
 * names so only the mode differs: runes mode is detected from rune usage, so a
 * preamble with no rune in it IS the legacy arm.
 */
export const DIRECTIVE_MODES = {
	runes: `<script>
	import Comp from './Comp.svelte';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	let text = $state('a');
	let ref = $state(null);
	let flag = $state(true);
	let color = $state('red');
	let tag = $state('div');
	let items = $state([{ id: 1 }]);
	let props = $state({});
	function handler() {}
	function action() {}
	function attachment() {
		return () => {};
	}
</script>

%s
`,
	legacy: `<script>
	import Comp from './Comp.svelte';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	export let text = 'a';
	let ref = null;
	let flag = true;
	let color = 'red';
	let tag = 'div';
	let items = [{ id: 1 }];
	let props = {};
	function handler() {}
	function action() {}
	function attachment() {
		return () => {};
	}
</script>

%s
`,
};

/**
 * Axis J — the shape of a `bind:` expression, crossed with axis K, the element
 * kind it is bound on.
 *
 * A different product from axis H × I: that one asks which parents a rule
 * applies to, this one asks how the setter half of a two-way binding ROUTES.
 * Upstream exempts an assignment from the dev `$.assign` wrap by testing the
 * assignment's own ancestor chain; an implementation that instead exempts the
 * setter's whole subtree agrees on every simple row and disagrees on the nested
 * ones. #2484 was wrong in both directions at once and the matrix stayed at 162
 * cases throughout, because `binding-position` varies binding kind inside script
 * bodies and never emits a `bind:` expression at all.
 *
 * `sequence-bodied-setter` is the discriminating row: the arrow's body is a
 * `SequenceExpression`, so NEITHER assignment's parent is the arrow and upstream
 * wraps both. A subtree-scoped exemption reports zero there and looks correct
 * everywhere else.
 */
export const BIND_SETTER_SHAPES = {
	plain: 's.x',
	'getter-setter': '() => s.x, (v) => (s.y = o)',
	'setter-through-call': '() => s.x, wrap((v) => (s.y = o))',
	'nested-arrow-in-setter': '() => s.x, (v) => (s.y = wrap(() => (d.e = o)))',
	'sequence-bodied-setter': '() => s.x, (v) => (s.y = o, d.e = o)',
	'block-bodied-setter': '() => s.x, (v) => { s.y = o; }',
	'block-bodied-setter-two-assignments': '() => s.x, (v) => { s.y = o; d.e = o; }',
};

/**
 * Axis K — the element the binding sits on. `%s` is the expression.
 *
 * Naming the element in the case id is the point: #2484 was reported against
 * `<svelte:component>` and the failing site was `<svelte:window>`, because the
 * reporter had no cell that separated them.
 */
export const BIND_SETTER_HOSTS = {
	element: '<input bind:value={%s} />',
	'element-this': '<div bind:this={%s}></div>',
	component: '<Comp bind:value={%s} />',
	'component-this': '<Comp bind:this={%s} />',
	'svelte-component': '<svelte:component this={Comp} bind:value={%s} />',
	'svelte-self': '{#if flag}<svelte:self bind:value={%s} />{/if}',
	'svelte-window': '<svelte:window bind:scrollY={%s} />',
	'svelte-document': '<svelte:document bind:activeElement={%s} />',
	'svelte-body': '<svelte:body bind:clientWidth={%s} />',
};

/**
 * The declarations every setter-shape case shares. The bound values must be
 * non-primitive: a primitive right-hand side silences the dev wrap on both
 * compilers, which would make every row agree about nothing.
 */
export const BIND_SETTER_PREAMBLE = `<script>
	import Comp from './Comp.svelte';
	let s = $state({ x: {}, y: {} });
	let d = $state({ e: {} });
	let o = $state({ k: 1 });
	let flag = $state(true);
	function wrap(f) {
		return f;
	}
</script>

%s
`;
