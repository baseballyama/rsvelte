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
	// `<script module>` is the one entry point whose `Program` upstream builds
	// itself, so its comment cursor starts dead and only a located body revives
	// it. Every slot in this seed's first three lines is therefore dropped by
	// both compilers — which is why the seed also carries a rune class (whose
	// accessors kill the cursor again), a static block and a bare block, each
	// followed by a slot OUTSIDE the body it revived from. Those slots are what
	// separate the real cursor from "keep a comment iff it is inside a body
	// span", which scores green on the three leading ones.
	'module-script': `<script module>
	export const shared = 1;
	let hidden = 0;
	export class Counter {
		n = $state(0);
		static registry = [];
		static {
			Counter.registry.push(1);
		}
	}
	{
		Counter.registry.push(2);
	}
	export function bump() {
		hidden += 1;
	}
	export const counted = Counter.registry.length;
</script>

<script>
	let local = $state(shared);
</script>

<button onclick={() => (local += counted)}>{local}</button>
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
 * Axis F — expression kinds that sit on the boundary of upstream's
 * `scope.evaluate`, crossed with axis C (`EXPRESSION_SLOTS`).
 *
 * Constant folding is the one decision where BOTH directions are silent
 * failures: folding too little leaves a divergence nobody notices (the value is
 * right), and folding too much removes the placeholder a dynamic text node
 * needs, so the runtime has nothing to fill. Neither shows up as an error, and
 * `scope.evaluate` is a single switch — so the kinds that fold and the kinds
 * that stop are neighbours in the source, one `case` apart, and a port that gets
 * one right can get the one below it wrong.
 *
 * The rows are chosen to straddle every boundary in that switch rather than to
 * sample what people write: a member read whose object is a literal ARRAY stops
 * (`is_pure` walks to the leftmost object and gives up), while the same read on
 * a literal STRING is pure and does not; a `Math.PI` member folds where
 * `[1, 2].length` does not; a template literal folds exactly when every
 * interpolation does, and `null` / `undefined` interpolate as their names rather
 * than as the empty string a chunk-level nullish fold produces.
 */
export const FOLDABLE_EXPRESSIONS = {
	'array-literal-length': '[1, 2].length',
	'array-literal-index': '[1, 2][0]',
	'object-literal-property': '({ a: 1 }).a',
	'arrow-literal-name': '(async (p = 1) => p).name',
	'string-literal-length': "'ab'.length",
	'string-literal-call': "'ab'.at(0)",
	'number-literal-call': '(1).toFixed(2)',
	'global-constant': 'Math.PI',
	'global-call': 'Math.max(1, 2)',
	'call-then-member': 'Math.max(1, 2).toFixed(0)',
	'template-constant': "`p${'ab'}q`",
	'template-null': '`p${null}q`',
	'template-undefined': '`p${undefined}q`',
	'template-global-constant': '`p${Math.PI}q`',
	'template-nested-template': "`p${`m${'ab'}n`}q`",
	'binary-constant': "'a' + 'b'",
	'conditional-constant': "true ? 'a' : 'b'",
};

/**
 * Axis F2 — how the expression reaches the slot. Inline is the direct read;
 * the `const` rows put one and two levels of declaration between the expression
 * and the read, which is the half of the same evaluator that resolves a binding
 * initializer instead of the expression in front of it. A fold that works inline
 * can stop at the first indirection (the initializer is stored separately from a
 * plain literal), and one that survives one level can stop at two.
 */
export const FOLD_INDIRECTIONS = {
	'via-const': (expression) => `const f0 = ${expression};`,
	'via-const-chain': (expression) => `const f0 = ${expression};\n\tconst f1 = \`[\${f0}]\`;`,
};

/** The read each indirection puts in the slot. */
export const FOLD_INDIRECTION_READS = {
	'via-const': 'f0',
	'via-const-chain': 'f1',
};

/**
 * Slots the indirection rows are crossed with. A subset on purpose: the slot
 * axis is already walked in full by the inline rows, and what the indirection
 * rows add is the binding resolution, which does not vary per slot beyond these.
 * `instance-declaration` is absent because it brings its own `<script>`.
 */
export const FOLD_INDIRECTION_SLOTS = [
	'interpolation',
	'attribute-value',
	'const-tag',
	'if-test',
	'event-handler',
];

/**
 * Axis F3 — the JS TYPE of a folded operand, crossed with F4 (the operator) and
 * F5 (the ternary host).
 *
 * The rows of `FOLDABLE_EXPRESSIONS` above pick expression KINDS, and every one
 * of them is single-typed: `'a' + 'b'` is two strings, `Math.max(1, 2)` two
 * numbers, `true ? 'a' : 'b'` a test that is itself known. So the family reached
 * the fold on every run and could not tell two rules for it apart — the client
 * fold carried a folded value as `Option<Option<String>>`, in which `null` and
 * `undefined` are one value and `0` and `'0'` are one value, and the family was
 * green while `typeof '0'` printed `number`, `'1' + 1` printed `2` and
 * `$derived(n ? undefined : null)` was judged constant and emitted
 * non-reactively (#3027). The discriminating axis is not which expression, it is
 * which TYPE — so these values are chosen so that each pair collides under
 * stringification while differing as JS values.
 *
 * `''` and `0` also separate a falsy value from a nullish one, which is the
 * other half of the same representation: `truthy()` and `is_nullish()` are two
 * questions a single `Option<String>` answers with one bit.
 */
export const FOLD_OPERAND_VALUES = {
	undefined: 'undefined',
	null: 'null',
	true: 'true',
	'number-zero': '0',
	'number-one': '1',
	'string-zero': "'0'",
	'string-true': "'true'",
	'string-empty': "''",
};

/**
 * Axis F4 — the operator applied to the operand pair. `+` is the one that
 * branches on "is either side a string"; `-` stands for the pure ToNumber
 * operators; the four equalities separate strict from loose; `<` / `>=` are the
 * relational pair, where two strings compare lexicographically and anything else
 * numerically (`'10' < '9'`); `??` reads nullish rather than falsy, which `||`
 * and `&&` next to it read as truthy — `'' || 'x'` and `null ?? 2` are the pair
 * that separates the two questions.
 */
export const FOLD_BINARY_OPERATORS = [
	'+',
	'-',
	'===',
	'!==',
	'==',
	'!=',
	'<',
	'>=',
	'??',
	'||',
	'&&',
];

/** Axis F4' — the unary operators whose result depends on the argument's type. */
export const FOLD_UNARY_OPERATORS = {
	typeof: 'typeof %s',
	not: '!%s',
	negate: '-%s',
	plus: '+%s',
	void: 'void %s',
};

/**
 * Axis F5 — where a ternary whose test is NOT known is read from.
 *
 * `FOLDABLE_EXPRESSIONS`'s `conditional-constant` row has a known test, so it
 * only exercises the branch-selection path. With an unknown test the fold has to
 * decide whether both branches carry the SAME value — upstream's
 * `values.size === 1` — and that comparison is what #3027 got wrong. The two
 * hosts are the two shapes the report names: an element attribute (hoisted out
 * of `$.template_effect`) and a component prop (emitted as a plain value instead
 * of a getter).
 */
export const FOLD_TERNARY_HOSTS = {
	'derived-attribute': (expression) => `<script>
	const { n } = $props();
	const c = $derived(${expression});
</script>

<div title={c}></div>
`,
	'derived-component-prop': (expression) => `<script>
	import Child from './Child.svelte';
	const { n } = $props();
	const c = $derived(${expression});
</script>

<Child to={c} />
`,
	'inline-attribute': (expression) => `<script>
	const { n } = $props();
</script>

<div title={${expression}}></div>
`,
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

/**
 * Async `$derived` × the dev arguments `$.async_derived` carries — the axis
 * family that varies a COMPILE OPTION rather than a source shape.
 *
 * `experimental.async` is what makes the shape legal at all, and no other gate
 * sets it: `compile.mjs` passes exactly `{ generate, dev, filename }`, so
 * `$derived(await …)` is a population the collected corpus cannot hold at any
 * size. That is how #2540 shipped — `$.async_derived(thunk)` with both dev
 * arguments missing, which disarms the `await_waterfall` runtime warning (it is
 * gated on `location !== undefined`) and makes its `svelte-ignore` a no-op.
 *
 * The `ignore` axis is the discriminating half: upstream drops the LOCATION and
 * keeps the LABEL when `svelte-ignore await_waterfall` covers the declaration,
 * so "both", "neither" and "label only" are three distinguishable outputs.
 * `unrelated` carries a `svelte-ignore` for a different code — a check that
 * looks for any ignore comment rather than for this one passes every other row
 * and fails that one.
 */
export const ASYNC_DERIVED_DECLARATIONS = {
	identifier: 'const a = $derived(await p);',
	'object-pattern': 'const { a, b } = $derived(await p);',
	'array-pattern': 'const [a, b] = $derived(await p);',
	'renamed-object': 'const { x: a } = $derived(await p);',
	'nested-await': 'const a = $derived((await p) + (await q));',
	'multi-declarator': 'const a = $derived(await p), b = $derived(await q);',
	'derived-by-async': 'const a = $derived.by(async () => await p);',
	'not-async': 'const a = $derived(p);',
};

/** Where the `svelte-ignore` comment sits relative to the declaration. */
export const ASYNC_DERIVED_IGNORES = {
	none: '%s',
	'line-before': '// svelte-ignore await_waterfall\n\t%s',
	'block-before': '/* svelte-ignore await_waterfall */\n\t%s',
	'block-inline': '/* svelte-ignore await_waterfall */ %s',
	unrelated: '// svelte-ignore state_referenced_locally\n\t%s',
};

/**
 * The three entry points the declaration is reached through. They are separate
 * code paths in rsvelte — the instance script goes through the AST state
 * transform, `<script module>` and `compileModule` through the module text
 * pipeline — so a fix applied to one leaves the others emitting the old shape.
 */
export const ASYNC_DERIVED_ENTRIES = {
	instance: {
		wrap: (body) => `<script>
	let { p, q } = $props();
	${body}
</script>

<p>{typeof a}</p>
`,
	},
	'script-module': {
		wrap: (body) => `<script module>
	const p = Promise.resolve(1);
	const q = Promise.resolve(2);
	${body}
</script>

<p>ok</p>
`,
	},
	module: {
		ext: '.svelte.js',
		kind: 'module',
		wrap: (body) => `const p = Promise.resolve(1);
const q = Promise.resolve(2);
${body.replace(/^\t/gm, '')}
export function read() {
	return a;
}
`,
	},
};

/**
 * Statements the SERVER transform REMOVES, × the comment slot the comment sits
 * in — the fifth axis family, and the first whose subject is what a removal
 * takes with it rather than what it emits.
 *
 * Upstream removes the statement NODE and lets esrap's comment cursor flush the
 * orphaned comments from the enclosing (located) body. rsvelte removed a source
 * RANGE on the `.svelte.js` module path and left the comment region of a dropped
 * statement unreferenced on the component path, so both took the comments with
 * the statement (#2567).
 *
 * The product is what finds it, because the two paths are different code and
 * they failed differently: the module path kept the LEADING comment and ate only
 * the INTERIOR one, the component path ate both. A single case in either slot,
 * on either host, reads as a complete repro of a defect that is half fixed.
 *
 * `%I` marks the interior slot; a removal with no callback body has none.
 */
export const REMOVED_STATEMENTS = {
	effect: '$effect(() => {\n%I\n\tconsole.log(a);\n});',
	'effect-pre': '$effect.pre(() => {\n%I\n\tconsole.log(a);\n});',
	'effect-root': '$effect.root(() => {\n%I\n\tconsole.log(a);\n});',
	inspect: '$inspect(a);',
};

/** Where the comment sits relative to the removed statement. */
export const REMOVAL_COMMENT_SLOTS = ['leading', 'interior', 'trailing'];

/**
 * The [`COMMENT_KINDS`] subset this family carries. The delimiter-bearing rows
 * are not decoration: the module path finds the removed statement's end with a
 * paren/brace scanner, so a `)` or `}` inside the comment is what tells a
 * comment-blind scan apart from a comment-aware one — and the whole family
 * exists because that scan deleted a range.
 */
export const REMOVAL_COMMENT_KINDS = [
	'line',
	'block',
	'line-with-brace',
	'line-with-paren',
	'block-with-paren',
	'svelte-ignore',
];

/**
 * What encloses the removed statement. `module` is `compileModule` — a different
 * entry point AND a different pipeline (text rewriting, not the AST comment
 * carry-over); `instance-top` is the component instance script's top level, the
 * only host whose region bookkeeping a removal can strand; `instance-fn` nests
 * it one function deep, where the statement is not a top-level region at all.
 */
export const REMOVAL_HOSTS = {
	module: {
		ext: '.svelte.js',
		wrap: (stmt, succ) => `export function f(a) {\n${stmt}\n${succ}}\n`,
	},
	'instance-top': {
		ext: '.svelte',
		wrap: (stmt, succ) => `<script>\n\tlet a = 1;\n${stmt}\n${succ}</script>\n\n<p>{a}</p>\n`,
	},
	'instance-fn': {
		ext: '.svelte',
		wrap: (stmt, succ) =>
			`<script>\n\tlet a = 1;\n\tfunction f() {\n${stmt}\n${succ}\t}\n\tf();\n</script>\n\n<p>{a}</p>\n`,
	},
};

/**
 * Whether a statement survives AFTER the removed one. With no successor the
 * orphaned comments have nothing to re-home onto, and upstream and rsvelte
 * resolve that differently from the successor case — so scoring only one of the
 * two cannot tell "re-homed correctly" from "dropped, and nothing followed".
 */
export const REMOVAL_SUCCESSORS = ['succ-none', 'succ-stmt'];

/**
 * A `#private` class field declared by a rune — the fifth axis family, and the
 * only one whose product is the constructor rewrite.
 *
 * Upstream decides the lowering from four things at once: which rune declared
 * the field (`AssignmentExpression.js:86-91` proxies only a plain `$state`,
 * `MemberExpression.js:15-18` reads `$state` / `$state.raw` as `.v` and a
 * `$derived` through `$.get`), whether the statement is inside a constructor
 * but outside any nested function (`shared/function.js:9-13`), the receiver,
 * and the operator. rsvelte reached the same four decisions from three
 * different code paths, so every fix so far has covered a rectangle of the
 * product and left its neighbours: #2395 was `this` × `$state` compounds,
 * #2467 the same operators through a non-`this` receiver, #2573 `$derived`
 * updates at a constructor root. None of the three is visible to the collected
 * corpus — `client` sat at 0 known failures throughout — and the sole private
 * field seed in `COMMENT_SEEDS` writes `this.#n = 1`, one cell that was always
 * right.
 *
 * The update operators are declared apart because the non-`this` half of that
 * row is a recorded deliberate divergence (`compatibility/deliberate-divergences.md`),
 * and an output-equality gate has no way to say "expected to differ".
 */
export const PRIVATE_FIELD_KINDS = {
	state: '$state(0)',
	'state-raw': '$state.raw({})',
	derived: '$derived(this.#s * 2)',
	'derived-by': '$derived.by(() => this.#s * 2)',
};

/**
 * Upstream keys the private-field path off `PrivateIdentifier` and never off
 * the receiver, so all three must compile alike; `alias` and `param` differ in
 * that only one of them can be the object under construction.
 */
export const PRIVATE_FIELD_RECEIVERS = {
	this: 'this.#f',
	alias: 'inst.#f',
	param: 'o.#f',
};

/** Where the statement sits — the axis that decides `in_constructor`. */
export const PRIVATE_FIELD_POSITIONS = {
	'ctor-root': `	constructor(o) {
		const inst = this;
		%s
	}`,
	'ctor-block': `	constructor(o) {
		const inst = this;
		if (o) {
			%s
		}
	}`,
	'ctor-nested-fn': `	constructor(o) {
		const inst = this;
		setTimeout(() => {
			%s
		});
	}`,
	method: `	m(o) {
		const inst = this;
		%s
	}`,
};

/**
 * Operators every receiver shares. The arithmetic rows are not interchangeable
 * for a text scanner: `-=` neighbours `--`, and `/=` opens what also closes a
 * block comment.
 */
export const PRIVATE_FIELD_OPERATORS = {
	'assign-object': '%r = { a: 1 };',
	'assign-primitive': '%r = 5;',
	'add-assign': '%r += 1;',
	'sub-assign': '%r -= 1;',
	'div-assign': '%r /= 2;',
	'exp-assign': '%r **= 2;',
	'and-assign': '%r &= 5;',
	'ushr-assign': '%r >>>= 5;',
	'logical-or-assign': '%r ||= 5;',
	'logical-and-assign': '%r &&= 5;',
	'nullish-assign': '%r ??= 5;',
	'read-call': 'log(%r);',
	'read-declaration': 'const a = %r;',
	'read-member': 'const b = %r.foo;',
	'read-optional': 'const c = %r?.bar;',
};

/** `this` only — see the note above `PRIVATE_FIELD_KINDS`. */
export const PRIVATE_FIELD_UPDATE_OPERATORS = {
	'post-increment': '%r++;',
	'post-decrement': '%r--;',
	'pre-increment': '++%r;',
	'pre-decrement': '--%r;',
};

/** The declarations every private-field case shares, so only the axes differ. */
export const PRIVATE_FIELD_PREAMBLE = `export class R {
	#s = $state(1);
	#f = %f;

%s
}
`;

/**
 * A token the transforms scan for RAW, carried inside a region where it is text
 * rather than code — and the only family whose subject is where a construct is
 * judged to BEGIN.
 *
 * `find_matching_bracket` and `code_bracket_depth` have been comment/string
 * aware since #2253, but the scans that decide *where to start counting from*
 * stayed plain byte searches. `transform_class_fields_server` took the first
 * `class ` in the file and the first `{` after it, so a doc comment reading
 * "we avoid class here" made the following factory function a class body and
 * lowered its locals to `#private` fields in statement position — output no JS
 * parser accepts (#2986). The defect is not one missing guard: an entry-point
 * scan and a body scan are different code, and hardening the second says
 * nothing about the first.
 *
 * The keyword axis is derived from the transforms rather than invented: these
 * are source-level tokens `memmem::find` is called with under
 * `phases/3_transform/{server,client,shared}`. A scan that only bails out early
 * is sound on any of them and a scan that returns an offset is not — but the
 * two are the same grep, so the family carries the token set and lets the
 * comparison decide which is which.
 *
 * Regex bodies are spelled so the LITERAL bytes of the keyword survive
 * (`/$derived(x)/` is a valid regex containing `$derived(`); escaping them would
 * test the escape rather than the scanner.
 */
export const OPAQUE_KEYWORDS = {
	class: { text: 'class ', regex: 'class ' },
	constructor: { text: 'constructor(', regex: 'constructor(x)' },
	derived: { text: '$derived(', regex: '$derived(x)' },
	state: { text: '$state(', regex: '$state(x)' },
	arrow: { text: '=>', regex: '=>' },
};

/**
 * The opaque region the keyword is carried in. `skip_opaque` handles `'`, `"`
 * and `` ` `` in one arm, so a double-quoted row could not move independently of
 * the single-quoted one and is left out; `/** … *\/` likewise reaches every
 * scanner as the `/* … *\/` row does, and `comment-slot` already crosses jsdoc
 * against its own axis. The template row stays because its `${…}` holes are
 * skipped by a different branch, and the regex row because telling a regex from
 * a division is the branch with a heuristic in it.
 *
 * Each carrier has a statement form and a class-member form: the same text is
 * not valid in both positions, and a family that only emitted statements would
 * never place a carrier where a class-body scan can see it.
 */
export const OPAQUE_CARRIERS = {
	'line-comment': { stmt: '// %k', member: '// %k' },
	'block-comment': { stmt: '/* %k */', member: '/* %k */' },
	string: { stmt: "const _c = '%k';", member: "_c = '%k';" },
	template: { stmt: 'const _c = `%k`;', member: '_c = `%k`;' },
	regex: { stmt: 'const _c = /%r/;', member: '_c = /%r/;' },
};

/**
 * Where the carrier sits relative to the construct whose boundaries a scan has
 * to find. `slot` selects the carrier's statement or class-member form.
 *
 * `before-factory` is the reported repro and `inside-factory` the same defect
 * one nesting level in. The four class hosts exist because a class is what the
 * scan is looking for: with a real class present the keyword no longer decides
 * whether a header is found but WHICH one — a different failure that a
 * class-free host cannot express, and the one `between-classes` isolates.
 */
export const OPAQUE_HOSTS = {
	'before-factory': {
		slot: 'stmt',
		wrap: (carrier) => `let a = 1;
let b = 2;

${carrier}
export function make() {
	const flag = $derived(a !== b);
	return { read: () => flag };
}
`,
	},
	'inside-factory': {
		slot: 'stmt',
		wrap: (carrier) => `let a = 1;
let b = 2;

export function make() {
	${carrier}
	const flag = $derived(a !== b);
	return { read: () => flag };
}
`,
	},
	'before-class': {
		slot: 'stmt',
		wrap: (carrier) => `${carrier}
export class Store {
	value = $state(0);
	double = $derived(this.value * 2);
}
`,
	},
	'class-member': {
		slot: 'member',
		wrap: (carrier) => `export class Store {
	${carrier}
	value = $state(0);
	double = $derived(this.value * 2);
}
`,
	},
	'method-body': {
		slot: 'stmt',
		wrap: (carrier) => `export class Store {
	value = $state(0);

	read() {
		${carrier}
		const local = $derived(this.value + 1);
		return local;
	}
}
`,
	},
	'between-classes': {
		slot: 'stmt',
		wrap: (carrier) => `export class First {
	value = $state(0);
}

${carrier}
export class Second {
	value = $state(1);
	double = $derived(this.value * 2);
}
`,
	},
};

/**
 * The two entry points this family crosses. `compileModule` is where #2986 was
 * reported; the instance script is a different parse function and a different
 * transform, and `param-default` is the recorded precedent for a fix that was
 * complete on one of them and absent on the other (#2547).
 */
export const OPAQUE_ENTRIES = {
	module: { ext: '.svelte.js', kind: 'module', wrap: (body) => body },
	instance: {
		ext: '.svelte',
		wrap: (body) =>
			`<script>\n${body
				.trimEnd()
				.split('\n')
				.map((line) => (line ? `\t${line}` : line))
				.join('\n')}\n</script>\n\n<p>ok</p>\n`,
	},
};

/**
 * Axis W1 — the reactive binding that is written to and read back.
 *
 * `binding-position` (axis A) already varies the binding kind, but each of its
 * rows bakes ONE host into `wrap`: `prop-destructured`, `state-local`,
 * `derived-local`, `store-auto-sub` and `legacy-let-prop` all put the body in a
 * named function inside `<script>`, and only the two each-block rows use an
 * inline template arrow. Binding kind and host are therefore confounded there —
 * the product is unenumerable, and #3026 lived in a cell it cannot express
 * (a destructured prop written from an inline template arrow). Declaring the
 * binding independently of the host is the whole point of this family.
 */
export const WRITE_BINDINGS = {
	'prop-destructured': {
		read: 'p',
		crossRead: 'q',
		declaration: 'const { p } = $props();',
		crossDeclaration: 'const { p, q } = $props();',
	},
	'prop-bindable': {
		read: 'p',
		crossRead: 'q',
		declaration: 'let { p = $bindable() } = $props();',
		crossDeclaration: 'let { p = $bindable(), q = $bindable() } = $props();',
	},
	'state-local': {
		read: 'p',
		crossRead: 'q',
		declaration: 'let p = $state({ a: 1, b: 2, c: 3 });',
		crossDeclaration: 'let p = $state({ a: 1, b: 2, c: 3 });\n\tlet q = $state({ a: 1, b: 2, c: 3 });',
	},
	'store-auto-sub': {
		read: '$s',
		crossRead: '$t',
		declaration: "import { writable } from 'svelte/store';\n\tconst s = writable({ a: 1, b: 2, c: 3 });",
		crossDeclaration:
			"import { writable } from 'svelte/store';\n\tconst s = writable({ a: 1, b: 2, c: 3 });\n\tconst t = writable({ a: 1, b: 2, c: 3 });",
	},
	'legacy-let-prop': {
		read: 'p',
		crossRead: 'q',
		declaration: 'export let p = { a: 1, b: 2, c: 3 };',
		crossDeclaration: 'export let p = { a: 1, b: 2, c: 3 };\n\texport let q = { a: 1, b: 2, c: 3 };',
	},
};

/**
 * Axis W2 — where the statement lives. `%s` is the write.
 *
 * rsvelte converts a template expression with a different function than a script
 * body and then applies the identifier transforms a second time over the result,
 * so "the same statement, moved" is a different code path and not merely a
 * different position. #3026 was correct in every `script-*` host and wrong in
 * every `template-*` one — a family that fixes the host cannot see it, however
 * many binding kinds and syntactic positions it crosses.
 */
export const WRITE_HOSTS = {
	'script-fn': {
		script: 'function run() {\n\t\t%s;\n\t}',
		markup: '<button onclick={run}>x</button>',
	},
	'script-arrow': {
		script: 'const run = () => {\n\t\t%s;\n\t};',
		markup: '<button onclick={run}>x</button>',
	},
	'template-arrow-block': {
		markup: '<button\n\tonclick={() => {\n\t\t%s;\n\t}}>x</button\n>',
	},
	'template-arrow-expr': {
		markup: '<button onclick={() => (%s)}>x</button>',
	},
	'template-snippet-arrow': {
		markup:
			'{#snippet row()}\n\t<button\n\t\tonclick={() => {\n\t\t\t%s;\n\t\t}}>x</button\n\t>\n{/snippet}\n\n{@render row()}',
	},
	'component-prop-arrow': {
		script: "import Comp from './Comp.svelte';",
		markup: '<Comp\n\tcb={() => {\n\t\t%s;\n\t}} />',
	},
};

/**
 * Axis W3 — the write itself, as an expression. `%s` is the binding read.
 *
 * The discriminating rows are the ones whose right-hand side reads the SAME
 * binding the left-hand side writes: that is the only shape where rsvelte
 * pre-transforms a subtree and then walks it again, and #3026 doubled every such
 * read into `p()().b`. `member-assign-const` and `read-only` are the controls —
 * the first has a transformed left and nothing to double, the second has no
 * assignment at all — so a fix that simply stops transforming right-hand sides
 * fails them instead of passing everything.
 *
 * `member-assign-cross` reads a SECOND binding of the same kind, declared only
 * for this row so the other rows keep an unused-export warning out of the legacy
 * mode cases. It separates "the read that doubles is the one the left writes"
 * from "any read on the right doubles" — #3026 was the second, and a family
 * carrying only the self rows would have pinned the wrong rule.
 */
export const WRITE_SHAPES = {
	'member-assign-self': '%s.a = %s.b',
	'member-compound-self': '%s.a += %s.b',
	'member-index-self': '%s[0] = %s.b',
	'deep-member-self': '%s.a.b = %s.c',
	'member-assign-nested-arrow': '%s.a = [1].map(() => %s.b)[0]',
	'member-assign-conditional': '%s.a = %s.b ? %s.c : %s.b',
	'member-assign-sequence': '%s.a = (0, %s.b)',
	'member-update-self': '%s.a++',
	'member-assign-cross': '%s.a = %q.b',
	'member-assign-const': '%s.a = 1',
	'read-only': 'sink(%s.b)',
};

/**
 * The declarations every write-host case shares. `sink` is what the `read-only`
 * control reads into; keeping it a function declaration (not a `$state`) leaves
 * the binding axis the only reactive name in the file.
 */
export const WRITE_PREAMBLE = `<script>
	%d
	function sink(x) {
		return x;
	}
%h</script>

%m
`;
