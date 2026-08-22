//! "Is this expression's value known at compile time" had four implementations
//! in the client on top of the server's port of upstream `scope.evaluate`
//! (issues #3437 / #3439). Every expectation here is the official compiler's
//! output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
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
    .expect("must compile")
    .js
    .code
}

/// `void <anything>` is `undefined` — one value, so `is_known` holds whatever
/// the operand is. The client's own recursion answered `is_known` for a unary
/// by asking whether its ARGUMENT was known, so a `{@const}` over `void <prop>`
/// stayed reactive and the element got a text node where official writes
/// `textContent` once.
#[test]
fn a_const_tag_over_void_of_an_unknown_operand_is_known() {
    let out = client(
        "<script>\n\tlet { p } = $props();\n</script>\n{#if true}\n\t{@const c = void p}\n\t<b>{c}</b>\n{/if}\n",
    );
    assert!(
        out.contains("b.textContent = $.get(c);"),
        "official writes the text once; got:\n{out}"
    );
    assert!(
        out.contains("$.from_html(`<b></b>`)"),
        "a folded read needs no text node in the template; got:\n{out}"
    );
}

/// The negative control for the same slot: an operand-dependent unary really is
/// unknown when the operator is not `void`, so the read must stay reactive.
#[test]
fn a_const_tag_over_a_truly_unknown_unary_stays_reactive() {
    for expression in ["!p", "-p"] {
        let out = client(&format!(
            "<script>\n\tlet {{ p }} = $props();\n</script>\n{{#if true}}\n\t{{@const c = {expression}}}\n\t<b>{{c}}</b>\n{{/if}}\n"
        ));
        assert!(
            out.contains("template_effect"),
            "`{expression}` over a prop has no single value; got:\n{out}"
        );
    }
}

/// Upstream's `scope.evaluate` has NO `SequenceExpression` case — it falls to
/// `default` and adds UNKNOWN. The shared walk must not grow one.
#[test]
fn a_sequence_expression_is_never_known() {
    let out = client(
        "<script>\n\tlet n = 1;\n\tlet s = 'x';\n\tvoid n;\n\tvoid s;\n</script>\n{#if true}\n\t{@const c = (n, s)}\n\t<b>{c}</b>\n{/if}\n",
    );
    assert!(
        !out.contains("b.textContent = 'x'"),
        "a sequence has no known value, so nothing may be inlined; got:\n{out}"
    );
}
