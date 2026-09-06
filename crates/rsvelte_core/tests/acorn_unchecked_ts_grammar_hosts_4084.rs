//! A TypeScript grammar rule acorn-typescript does not implement is not a parse
//! error (#4084).
//!
//! `ACORN_UNCHECKED_TS_GRAMMAR_RULES` already existed and already listed 17 such
//! codes, so the defect had two halves and fixing either alone reads as done.
//! TS2368 (`Type parameter name cannot be 'string'`) was missing from the table
//! — and the table was read by the two script-side sites only, while the
//! template-expression, attribute, snippet-parameter and statement probes each
//! asked OXC directly. Adding the code alone makes a `<script>` byte-identical
//! to upstream and leaves `{<string>() => a}` emitting `p.textContent = ;`,
//! which no JS parser accepts; routing one probe alone leaves the other three.
//!
//! So the rows below are one host each, walked one at a time and named, because
//! a fix that reaches the reported host and one neighbour looks exactly like a
//! fix that reaches all of them. The reported host is `template`; measured, the
//! shape reaches thirteen, and `snippet_param` was not an over-rejection at all
//! — it emitted `p = <string>() => 1 = $.noop`, two `=` in one parameter.
//!
//! Every expectation is the line `svelte.compile` emits for that source, read
//! out of `submodules/svelte`, not inferred from rsvelte's own output.
//!
//! The `script` and `script_module` rows are the script-side controls, and they
//! live here rather than in the corpus repro: a `<string>() => a` inside a
//! `<script lang="ts">` is copied into the TSX shadow, where rsvelte writes
//! `<string,>` and upstream copies it verbatim. That is a svelte2tsx defect of
//! its own, and a corpus file carrying it would fail a gate this fix has
//! nothing to do with.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn server(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| error.to_string())
}

fn client(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| error.to_string())
}

/// `(host, source, the line upstream emits)`.
const HOSTS: &[(&str, &str, &str)] = &[
    (
        "script",
        "<script lang=\"ts\">let a: any; const x = <string>() => a;</script><p>{x}</p>",
        "const x = () => a;",
    ),
    (
        "script_module",
        "<script module lang=\"ts\">export const m = <string>() => 1;</script><p>{m}</p>",
        "export const m = () => 1;",
    ),
    (
        "template",
        "<script lang=\"ts\">let a: any;</script><p>{<string>() => a}</p>",
        "p.textContent = () => a;",
    ),
    (
        "attribute",
        "<script lang=\"ts\">let a: any;</script><p title={<string>() => a}>x</p>",
        "$.set_attribute(p, 'title', () => a);",
    ),
    (
        "each",
        "<script lang=\"ts\">let a: any;</script>{#each [<string>() => a] as z}{z}{/each}",
        "$.each(node, 0, () => [() => a], $.index, ($$anchor, z) => {",
    ),
    (
        "if",
        "<script lang=\"ts\">let a: any;</script>{#if (<string>() => a)}y{/if}",
        "if (() => a) $$render(consequent);",
    ),
    (
        "await",
        "<script lang=\"ts\">let a: any;</script>{#await (<string>() => a)}y{:then v}{v}{/await}",
        "() => () => a,",
    ),
    (
        "const_tag",
        "<script lang=\"ts\">let a: any;</script>{#if 1}{@const c = <string>() => a}{c}{/if}",
        "const c = $.derived_safe_equal(() => () => a);",
    ),
    (
        "key",
        "<script lang=\"ts\">let a: any;</script>{#key (<string>() => a)}y{/key}",
        "$.key(node, () => () => a, ($$anchor) => {",
    ),
    (
        "snippet_param",
        "<script lang=\"ts\"></script>{#snippet s(p = <string>() => 1)}{p}{/snippet}{@render s()}",
        "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => 1));",
    ),
    (
        "html_tag",
        "<script lang=\"ts\">let a: any;</script>{@html (<string>() => a)}",
        "$.html(node, () => () => a);",
    ),
    (
        "render_arg",
        "<script lang=\"ts\"></script>{#snippet s(q)}{q}{/snippet}{@render s(<string>() => 1)}",
        "s($$anchor, () => () => 1);",
    ),
    (
        "spread",
        "<script lang=\"ts\">let a: any;</script><p {...(<string>() => a)}>x</p>",
        "$.attribute_effect(p, () => ({ ...() => a }));",
    ),
    (
        "event",
        "<script lang=\"ts\">let a: any;</script><button onclick={<string>() => a}>x</button>",
        "$.delegated('click', button, () => a);",
    ),
];

#[test]
fn every_host_erases_the_annotation_upstream_also_erases() {
    for (host, source, expected) in HOSTS {
        let code = client(source).unwrap_or_else(|error| panic!("{host}: rejected: {error}"));
        assert!(
            code.contains(expected),
            "{host}: expected `{expected}`\n--- got ---\n{code}"
        );
    }
}

/// The other direction. Widening the filter to "any diagnostic OXC recovers
/// from" accepts all of these, and a table of accepted hosts alone cannot say
/// so. `ts_in_plain_script` is the one that separates the filter from
/// "TypeScript is always allowed": OXC's JS grammar is not acorn's, so a
/// component that never declared `lang="ts"` has to keep rejecting.
const STILL_REJECTED: &[(&str, &str)] = &[
    (
        "ts_in_plain_script",
        "<script>const y = <string>() => 1;</script><p>{y}</p>",
    ),
    (
        "invalid_template",
        "<script lang=\"ts\"></script><p>{(;}</p>",
    ),
    (
        "invalid_script",
        "<script lang=\"ts\">const q = (;</script><p>x</p>",
    ),
    (
        "invalid_snippet_param",
        "<script lang=\"ts\"></script>{#snippet s(p = (;)}{p}{/snippet}",
    ),
];

#[test]
fn a_real_syntax_error_is_still_a_syntax_error() {
    for (case, source) in STILL_REJECTED {
        assert!(
            client(source).is_err(),
            "{case}: accepted, but both compilers reject it"
        );
    }
}

/// A legal generic arrow reaches the same probes and must be unaffected — the
/// row that fails if the filter is spelled as "drop every TS diagnostic and the
/// program with it".
#[test]
fn a_legal_generic_arrow_is_untouched() {
    for (case, source, expected) in [
        (
            "script",
            "<script lang=\"ts\">const g = <T,>(x: T) => x;</script><p>{g(1)}</p>",
            "const g = (x) => x;",
        ),
        (
            "template",
            "<script lang=\"ts\"></script><p>{(<T,>(x: T) => x)(1)}</p>",
            "((x) => x)(1)",
        ),
    ] {
        let code = client(source).unwrap_or_else(|error| panic!("{case}: rejected: {error}"));
        assert!(
            code.contains(expected),
            "{case}: expected `{expected}`\n--- got ---\n{code}"
        );
    }
}

/// The server has its own port of "may this fragment be re-parsed", and it
/// spells the disagreement as the `undefined` fallback its own doc comment
/// exists to avoid — so removing the over-rejection without it turns a compile
/// error into silently dropped output, which is the worse direction. Measured,
/// the phase-1 change alone leaves `{@const}` at `const c = undefined;` and a
/// `{@render}` argument at `s($$renderer, undefined);` while the client is
/// already correct.
///
/// `{#snippet s(p = <string>() => 1)}` is deliberately absent: its parameter is
/// dropped on the server (`function s($$renderer)`) on this branch AND on
/// `main`. That is a different mechanism, not a ninth port of this rule —
/// `extract_snippet_param` strips TS annotations and not `<T>` casts, so
/// `reparse_params`, which reads plain `mjs` where the cast is a real syntax
/// error, falls back and drops the whole list. The client half is in `HOSTS`.
#[test]
fn the_server_port_reaches_the_same_decision() {
    for (host, source, expected) in [
        (
            "template",
            "<script lang=\"ts\">let a: any;</script><p>{<string>() => a}</p>",
            "$$renderer.push(`<p>${$.escape(() => a)}</p>`);",
        ),
        (
            "const_tag",
            "<script lang=\"ts\">let a: any;</script>{#if 1}{@const c = <string>() => a}{c}{/if}",
            "const c = () => a;",
        ),
        (
            "render_arg",
            "<script lang=\"ts\"></script>{#snippet s(q)}{q}{/snippet}{@render s(<string>() => 1)}",
            "s($$renderer, () => 1);",
        ),
    ] {
        let code = server(source).unwrap_or_else(|error| panic!("{host}: rejected: {error}"));
        assert!(
            code.contains(expected),
            "{host}: expected `{expected}`\n--- got ---\n{code}"
        );
    }
}
