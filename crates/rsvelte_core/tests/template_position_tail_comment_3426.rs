//! A comment left pending at the end of an instance script is flushed by esrap
//! at the next node upstream keeps a `loc` on, and in the server's output that
//! node is the template's first PRINTED expression — whichever kind it is
//! (`#3426`). A reordered `$:` body additionally sends the cursor backwards over
//! a comment a script successor already printed, so that copy is pending again
//! and lands in the same expression rather than at the component's end
//! (`#3428`).
//!
//! Every expectation below is the pinned oracle's own output —
//! `submodules/svelte/packages/svelte/src/compiler/index.js` at `20b341f10048`,
//! which reports `VERSION === '5.56.9'` — not a transcription.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(source: &str, filename: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some(format!("{filename}.svelte")),
            generate: GenerateMode::Server,
            css: rsvelte_core::compiler::CssMode::External,
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

/// The script-tail run lands in an attribute value.
#[test]
fn tail_comment_lands_in_attr() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<div title={b}>x</div>
"#,
            "plain-tail__line-own__attr"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__attr($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<div${$.attr(
		'title',
		// tail
		b
	)}>x</div>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a quoted attribute value.
#[test]
fn tail_comment_lands_in_attr_quoted() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<div title="{b}">x</div>
"#,
            "plain-tail__line-own__attr-quoted"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__attr_quoted($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<div${$.attr(
		'title',
		// tail
		b
	)}>x</div>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a concatenated attribute value.
#[test]
fn tail_comment_lands_in_attr_concat() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<div title="a{b}">x</div>
"#,
            "plain-tail__line-own__attr-concat"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__attr_concat($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<div${$.attr('title', `a${$.stringify(
		// tail
		b
	)}`)}>x</div>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in an attribute spread.
#[test]
fn tail_comment_lands_in_attr_spread() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<div {...b}>x</div>
"#,
            "plain-tail__line-own__attr-spread"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__attr_spread($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<div${$.attributes({
		...// tail
		b
	})}>x</div>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a class: directive.
#[test]
fn tail_comment_lands_in_class_directive() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<div class:x={b}>y</div>
"#,
            "plain-tail__line-own__class-directive"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__class_directive($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<div${$.attr_class('', void 0, {
		'x': // tail
		b
	})}>y</div>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a style: directive.
#[test]
fn tail_comment_lands_in_style_directive() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<div style:color={b}>y</div>
"#,
            "plain-tail__line-own__style-directive"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__style_directive($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<div${$.attr_style('', {
		color: // tail
		b
	})}>y</div>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in an {#if} test.
#[test]
fn tail_comment_lands_in_if_block() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#if b}x{/if}
"#,
            "plain-tail__line-own__if-block"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__if_block($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	if (// tail
	b) {
		$$renderer.push('<!--[0-->');
		$$renderer.push(`x`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in an {#each} collection.
#[test]
fn tail_comment_lands_in_each_block() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#each [b] as v}{v}{/each}
"#,
            "plain-tail__line-own__each-block"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__each_block($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(
		// tail
		[b]
	);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let v = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(v)}`);
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in an {#await} expression.
#[test]
fn tail_comment_lands_in_await_block() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#await b}x{:then v}{v}{/await}
"#,
            "plain-tail__line-own__await-block"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__await_block($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$.await(
		$$renderer,
		// tail
		b,
		() => {
			$$renderer.push(`x`);
		},
		(v) => {
			$$renderer.push(`${$.escape(v)}`);
		}
	);

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a {@html} argument.
#[test]
fn tail_comment_lands_in_html_tag() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{@html b}
"#,
            "plain-tail__line-own__html-tag"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__html_tag($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`${$.html(
		// tail
		b
	)}`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a {@render} callee.
#[test]
fn tail_comment_lands_in_render_tag() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#snippet sn(v)}{v}{/snippet}{@render sn(b)}
"#,
            "plain-tail__line-own__render-tag"
        ),
        r#"import * as $ from 'svelte/internal/server';

function sn($$renderer, v) {
	$$renderer.push(`<!---->${$.escape(v)}`);
}

export default function Plain_tail__line_own__render_tag($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	// tail
	sn($$renderer, b);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a {@const} initializer.
#[test]
fn tail_comment_lands_in_const_tag() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#each [1] as v}{@const c = b}{c}{/each}
"#,
            "plain-tail__line-own__const-tag"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__const_tag($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(
		// tail
		[1]
	);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let v = each_array[$$index];
		const c = b;

		$$renderer.push(`<!---->${$.escape(c)}`);
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a component prop.
#[test]
fn tail_comment_lands_in_component() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<Comp p={b} />
"#,
            "plain-tail__line-own__component"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__component($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	Comp($$renderer, {
		p: // tail
		b
	});

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a component spread.
#[test]
fn tail_comment_lands_in_component_spread() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<Comp {...b} />
"#,
            "plain-tail__line-own__component-spread"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__component_spread($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	Comp($$renderer, $.spread_props([
		// tail
		b
	]));

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a <svelte:element> this.
#[test]
fn tail_comment_lands_in_svelte_element() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<svelte:element this={b ? 'p' : 'span'}>x</svelte:element>
"#,
            "plain-tail__line-own__svelte-element"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__svelte_element($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$.element(
		$$renderer,
		// tail
		b ? 'p' : 'span',
		void 0,
		() => {
			$$renderer.push(`x`);
		}
	);

	$.bind_props($$props, { a });
}"#
    );
}

/// The script-tail run lands in a <slot> prop.
#[test]
fn tail_comment_lands_in_slot_element() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<slot p={b} />
"#,
            "plain-tail__line-own__slot-element"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Plain_tail__line_own__slot_element($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b = a;

	$$renderer.push(`<!--[-->`);

	$.slot(
		$$renderer,
		$$props,
		'default',
		{
			p: // tail
			b
		},
		null
	);

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { a });
}"#
    );
}

/// A same-line trailer on a block-bodied `$:` with a surviving successor is printed
/// by that successor AND flushed again in the template — the cursor reset.
#[test]
fn reordered_reactive_block_same_line_trailer_lands_in_the_template() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b;
	$: { b = a * 2; } // tail
	let z = 1;
</script>
<p>{b}</p>
"#,
            "reactive-block-mid__line-sameline__text-expr"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Reactive_block_mid__line_sameline__text_expr($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b;

	// tail
	let z = 1;

	$: {
		b = a * 2;
	}

	$$renderer.push(`<p>${$.escape(
		// tail
		b
	)}</p>`);

	$.bind_props($$props, { a });
}"#
    );
}

/// The own-line form of the same shape, which defers nothing at all.
#[test]
fn reordered_reactive_block_own_line_trailer_lands_in_the_template() {
    assert_eq!(
        server(
            r#"<script>
	export let a = 1;
	let b;
	$: { b = a * 2; }
	// tail
	let z = 1;
</script>
<p>{b}</p>
"#,
            "reactive-block-mid__line-own__text-expr"
        ),
        r#"import * as $ from 'svelte/internal/server';

export default function Reactive_block_mid__line_own__text_expr($$renderer, $$props) {
	let a = $.fallback($$props['a'], 1);
	let b;

	// tail
	let z = 1;

	$: {
		b = a * 2;
	}

	$$renderer.push(`<p>${$.escape(
		// tail
		b
	)}</p>`);

	$.bind_props($$props, { a });
}"#
    );
}
