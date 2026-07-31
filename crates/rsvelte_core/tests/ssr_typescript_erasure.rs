//! SSR output of a TypeScript component must be plain JavaScript.
//!
//! Phase 3 used to re-parse the whole generated SSR program as TypeScript and
//! strip it, as a catch-all for TS syntax leaking out of template expressions.
//! Erasure now happens upstream — `remove_typescript_from_ast` clears the typed
//! fragment before analyze, and the server's source-slice fallback re-parses via
//! `reparse_expression`, which strips the TS wrappers itself. These tests pin
//! that invariant so the whole-output pass stays unnecessary.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// Assert the SSR output parses as plain ECMAScript — the property the removed
/// whole-output strip existed to guarantee, and what rolldown enforces when it
/// rejects `Type assertion expressions can only be used in TypeScript files`.
#[track_caller]
fn assert_ssr_is_plain_js(source: &str) {
    let result = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            dev: false,
            enable_sourcemap: true,
            ..Default::default()
        },
    )
    .expect("component should compile");

    let allocator = oxc_allocator::Allocator::default();
    let ret =
        oxc_parser::Parser::new(&allocator, &result.js.code, oxc_span::SourceType::mjs()).parse();

    assert!(
        ret.diagnostics.is_empty(),
        "SSR output is not plain JS: {:?}\n--- output ---\n{}",
        ret.diagnostics,
        result.js.code
    );
}

#[test]
fn as_cast_in_template_expression_is_erased() {
    // The real-world case that originally motivated the whole-output strip:
    // shadcn-svelte's base-color-picker.svelte.
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { vars }: { vars: Record<string, Record<string, string>> } = $props();
	let mode = { current: 'light' };
</script>

<div style="--color: {vars?.[mode.current as 'light' | 'dark']?.['muted-foreground']}"></div>
<p>{vars as unknown as string}</p>
"#,
    );
}

#[test]
fn non_null_assertion_in_template_expression_is_erased() {
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { obj }: { obj?: { field: string } } = $props();
</script>

<p>{obj!.field}</p>
<div title={obj!.field}></div>
{#if obj!.field}<span>{obj!.field}</span>{/if}
"#,
    );
}

#[test]
fn satisfies_and_generic_call_in_template_expression_are_erased() {
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { items }: { items: string[] } = $props();
	function pick<T>(xs: T[]): T { return xs[0]; }
</script>

<p>{pick<string>(items)}</p>
<p>{({ a: 1 }) satisfies Record<string, number>}</p>
{#each items as item}<span>{item as string}</span>{/each}
"#,
    );
}

#[test]
fn type_annotations_in_const_and_snippet_are_erased() {
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { n }: { n: number } = $props();
</script>

{#snippet row(label: string, value: number)}
	<td>{label}</td><td>{value}</td>
{/snippet}

{#if n}
	{@const doubled: number = n * 2}
	<table><tbody><tr>{@render row('n', doubled)}</tr></tbody></table>
{/if}
"#,
    );
}

/// `{@const}` is the one visitor that always decomposes by SOURCE SLICE rather
/// than by the (already TS-stripped) typed AST, so its initializer is the path
/// where non-wrapper TypeScript actually reaches the output. Real-world
/// regressions: layerchart's `Dodge/duration-bars-dense-lanes.svelte` and
/// `Waffle/Waffle.svelte`.
#[test]
fn const_tag_initializer_erases_non_wrapper_typescript() {
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { n, xs }: { n: number; xs: number[] } = $props();
</script>

{#if n}
	{@const startX = (d: { at: Date }) => d.at.getTime()}
	{@const scale = <T,>(x: T): T => x}
	{@const onEnter = (e: PointerEvent) => { const t = e.target as HTMLElement; return t; }}
	{@const inner = (() => { type Row = number; const r: Row = n; return r; })()}
	{@const arr = xs.map<number>((v) => v)}
	<span>{startX({ at: new Date() })}{scale(n)}{onEnter}{inner}{arr.length}</span>
{/if}
"#,
    );
}

/// The same source-slice decomposition drives `{#each}` context patterns and
/// `{#await}` value bindings.
#[test]
fn each_and_await_bindings_erase_typescript() {
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { xs, p }: { xs: number[]; p: Promise<number[]> } = $props();
</script>

{#each xs as x, i}
	{@const label = ((v: number) => `${v}`)(x)}
	<span>{label}{i}</span>
{/each}

{#await p then values}
	{#each values as v}<span>{((n: number) => n + 1)(v)}</span>{/each}
{/await}
"#,
    );
}

#[test]
fn await_and_key_blocks_erase_typescript() {
    assert_ssr_is_plain_js(
        r#"<script lang="ts">
	let { p, k }: { p: Promise<string>; k: number } = $props();
</script>

{#await p}
	<span>loading</span>
{:then value}
	<span>{(value as string).length}</span>
{:catch e}
	<span>{(e as Error).message}</span>
{/await}

{#key k}<span>{(k as number).toFixed(2)}</span>{/key}
"#,
    );
}
