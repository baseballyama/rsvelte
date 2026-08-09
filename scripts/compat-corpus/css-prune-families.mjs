/**
 * Selector-shape families for the unused-CSS prune sweep (issue #2535).
 *
 * `css-prune-sweep.mjs`'s own grids (A/B/C/C3) vary the *markup* around a fixed
 * handful of sibling selectors, because the bug they were built for was in the
 * per-sibling traversal. These families vary the *selector* instead — explicit
 * `&`, `:is()`/`:where()`/`:not()`/`:has()` arguments, `:root`, trailing
 * `:global(...)`, and attributes whose value the compiler must reason about —
 * against a fixed set of arrangements. Kept in their own module so the two
 * products stay separately readable; the sweep concatenates both.
 *
 * Each entry is `{ id, source }`; ids are `<family>/<selector>/<arrangement>`.
 */

const SCRIPT_STATIC = `<script>
	let cond = true;
</script>
`;

const SCRIPT_DYNAMIC = `<script>
	let cls = 'q';
	let cond = true;
	let dyn = 'v';
	let tag = 'div';
	let props = { class: 'q' };
</script>
`;

// Arrangements shared by the four selector-shape families. Every one is static
// markup: a dynamic attribute anywhere would deopt the whole stylesheet, which
// is family H's subject and would mask the others.
const ARRANGE = {
	nested_ab: '<div class="a"><div class="b"></div></div>',
	sibling_ab: '<div class="a"></div><div class="b"></div>',
	nested_ba: '<div class="b"><div class="a"></div></div>',
	only_a: '<div class="a"></div>',
	only_b: '<div class="b"></div>',
	compound_ab: '<div class="a b"></div>',
	neither: '<p>x</p>'
};

// Family D — a nested rule with an EXPLICIT `&`. Upstream resolves `&` through
// `parent.prelude` compound-wise; a shape where the parent matches some element
// that is not an ancestor is the case #2474's fix deliberately left out.
const SELECTORS_D = [
	{ id: '&_.b', css: '.a {\n\t\t& .b { color: red; }\n\t}' },
	{ id: '&>.b', css: '.a {\n\t\t& > .b { color: red; }\n\t}' },
	{ id: '.b_&', css: '.a {\n\t\t.b & { color: red; }\n\t}' },
	{ id: '&.b', css: '.a {\n\t\t&.b { color: red; }\n\t}' },
	{ id: '&+.b', css: '.a {\n\t\t& + .b { color: red; }\n\t}' },
	{ id: 'is(&)_.b', css: '.a {\n\t\t:is(&) .b { color: red; }\n\t}' },
	{ id: 'comma-parent', css: '.a, .c {\n\t\t& .b { color: red; }\n\t}' },
	{ id: '&_&', css: '.a {\n\t\t& & { color: red; }\n\t}' },
	// A subject `&` under a TWO-compound parent. The `&` constrains the subject
	// itself, so one `.a` can satisfy both the parent's ancestor link and the
	// prefix — splicing the parent into the chain would demand two nested `.a`.
	{ id: 'deep_.a:hover_&', css: '.a {\n\t\t.b {\n\t\t\t.a:hover & { color: red; }\n\t\t}\n\t}' },
	{ id: 'deep_.miss_&', css: '.a {\n\t\t.b {\n\t\t\t.miss & { color: red; }\n\t\t}\n\t}' }
];

// Family E — selector-list arguments of functional pseudo-classes. Upstream
// checks each argument branch against the element and marks it used
// individually, so both the outer selector AND each branch can be reported.
const SELECTORS_E = [
	{ id: 'is(.a,.b)', css: ':is(.a, .b) { color: red; }' },
	{ id: 'is(.a,.miss)', css: ':is(.a, .miss) { color: red; }' },
	{ id: 'where(.a,.miss)', css: ':where(.a, .miss) { color: red; }' },
	{ id: '.a:is(.b)', css: '.a:is(.b) { color: red; }' },
	{ id: 'not(.a)_.b', css: ':not(.a) .b { color: red; }' },
	{ id: '.b:not(.miss)', css: '.b:not(.miss) { color: red; }' },
	{ id: 'is(.a_.b)', css: ':is(.a .b) { color: red; }' },
	{ id: 'is(.a)>.b', css: ':is(.a) > .b { color: red; }' },
	{ id: 'is(.a,.miss)+.b', css: ':is(.a, .miss) + .b { color: red; }' },
	{ id: 'not(.a,.miss)', css: ':not(.a, .miss) { color: red; }' },
	{ id: 'has(.a)', css: ':has(.a) { color: red; }' },
	{ id: '.a:has(>.b)', css: '.a:has(> .b) { color: red; }' },
	{ id: 'nested-is', css: '.a {\n\t\t:is(.b, .miss) { color: red; }\n\t}' },
	// A compound has to be satisfied by ONE element, so these are unused
	// whenever `.a` and `.b` live on different elements.
	{ id: '.a.b', css: '.a.b { color: red; }' },
	{ id: 'is(.a):is(.b)', css: ':is(.a):is(.b) { color: red; }' },
	{ id: '.a:where(.b)', css: '.a:where(.b) { color: red; }' },
	{ id: 'p.a', css: 'p.a { color: red; }' },
	{ id: 'div.a:is(.b)', css: 'div.a:is(.b) { color: red; }' }
];

// Family F — `:root`. `relative_selector_might_apply_to_node` returns false for
// it outright, so a `:root`-headed selector is kept alive only through the
// `every_is_global` escape hatch or through a `:has(...)` argument that matches.
const SELECTORS_F = [
	{ id: ':root', css: ':root { color: red; }' },
	{ id: ':root_.a', css: ':root .a { color: red; }' },
	{ id: ':root_.miss', css: ':root .miss { color: red; }' },
	{ id: ':root:has(.a)', css: ':root:has(.a) { color: red; }' },
	{ id: ':root:has(.miss)', css: ':root:has(.miss) { color: red; }' },
	{ id: ':root{.a}', css: ':root {\n\t\t.a { color: red; }\n\t}' },
	{ id: ':root{.miss}', css: ':root {\n\t\t.miss { color: red; }\n\t}' },
	{ id: '.a:root', css: '.a:root { color: red; }' },
	{ id: ':root>.a', css: ':root > .a { color: red; }' },
	{ id: ':root.x:has(.a)', css: ':root.x:has(.a) { color: red; }' }
];

// Family G — trailing `:global(...)`. `truncate` drops every trailing global
// relative selector before matching, so what is left decides the verdict.
const SELECTORS_G = [
	{ id: '.a_global(.g)', css: '.a :global(.g) { color: red; }' },
	{ id: '.a>global(.g)', css: '.a > :global(.g) { color: red; }' },
	{ id: '.miss_global(.g)', css: '.miss :global(.g) { color: red; }' },
	{ id: 'global(.g)', css: ':global(.g) { color: red; }' },
	{ id: '.a_global(.g)_.b', css: '.a :global(.g) .b { color: red; }' },
	{ id: '.a:global(.g)', css: '.a:global(.g) { color: red; }' },
	{ id: '.a+global(.g)', css: '.a + :global(.g) { color: red; }' },
	{ id: '.a_global(.g):hover', css: '.a :global(.g):hover { color: red; }' },
	{ id: 'global(.g)_.a', css: ':global(.g) .a { color: red; }' },
	{ id: '.miss_global(.g)_deep', css: '.miss :global(.g) :global(.h) { color: red; }' },
	{ id: '.a~global(.g)', css: '.a ~ :global(.g) { color: red; }' },
	{ id: '.miss>global(.g)', css: '.miss > :global(.g) { color: red; }' },
	{ id: '.a:has(global(.g))', css: '.a:has(:global(.g)) { color: red; }' },
	{ id: 'nested_&_global', css: '.a {\n\t\t& :global(.g) { color: red; }\n\t}' },
	{ id: 'nested_miss_global', css: '.miss {\n\t\t& :global(.g) { color: red; }\n\t}' },
	{ id: 'global-parent_.b', css: ':global(.g) {\n\t\t.b { color: red; }\n\t}' },
	{ id: '.a_global(.g){.b}', css: '.a :global(.g) {\n\t\t.b { color: red; }\n\t}' },
	{ id: 'global(.g):hover', css: ':global(.g):hover { color: red; }' }
];

// Family H — attributes whose value is not a literal. Upstream enumerates the
// possible values of the expression (`get_possible_values`) and only deopts
// when that set is unknowable; a per-component "has dynamic classes" flag
// cannot express that, so every literal-valued expression is a divergence
// candidate.
const MARKUP_H = {
	class_expr: '<div class={cls}></div>',
	class_mixed: '<div class="x {cls}"></div>',
	class_literal: "<div class={'a'}></div>",
	class_ternary: "<div class={cond ? 'a' : 'b'}></div>",
	class_logical: "<div class={cond && 'a'}></div>",
	class_array: "<div class={['a', cond && 'b']}></div>",
	class_object: '<div class={{ a: cond }}></div>',
	spread: '<div {...props}></div>',
	class_directive: '<div class:a={cond}></div>',
	class_directive_short: '<div class:b></div>',
	id_expr: '<div id={dyn}></div>',
	id_literal: "<div id={'i'}></div>",
	attr_expr: '<div data-x={dyn}></div>',
	style_directive: '<div style:color="red"></div>',
	dynamic_element: "<svelte:element this={tag} class='a'></svelte:element>",
	class_prefix: '<div class="a {cls}"></div>',
	class_suffix: '<div class="{cls} a"></div>',
	class_concat: "<div class={'a' + cls}></div>",
	class_nested_ternary: "<div class={cond ? 'a' : cond ? 'b' : 'c'}></div>",
	class_directive_plus_attr: '<div class="a" class:b={cond}></div>',
	bind_directive: '<input bind:value={dyn} />'
};

const SELECTORS_H = ['.a', '.b', '.c', '#i', '[data-x]', 'div.a', '[style]'];

const style = (body) => `<style>\n\t${body}\n</style>\n`;

export function* generateSelectorFamilies() {
	for (const [family, selectors] of [
		['D', SELECTORS_D],
		['E', SELECTORS_E],
		['F', SELECTORS_F],
		['G', SELECTORS_G]
	]) {
		for (const sel of selectors) {
			for (const [arrName, markup] of Object.entries(ARRANGE)) {
				yield {
					id: `${family}/${sel.id}/${arrName}`,
					source: `${SCRIPT_STATIC}\n${markup}\n${style(sel.css)}`
				};
			}
		}
	}

	for (const [markupName, markup] of Object.entries(MARKUP_H)) {
		for (const sel of SELECTORS_H) {
			yield {
				id: `H/${markupName}/${sel}`,
				source: `${SCRIPT_DYNAMIC}\n${markup}\n${style(`${sel} { color: red; }`)}`
			};
		}
	}
}
