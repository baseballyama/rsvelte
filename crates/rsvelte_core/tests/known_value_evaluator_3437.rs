//! "Is this expression's value known at compile time" had four implementations
//! in the client on top of the server's port of upstream `scope.evaluate`
//! (issues #3437 / #3439). Every expectation here is the official compiler's
//! output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    client_with_dev(src, false)
}

fn client_with_dev(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

/// Dev converts equality expressions in the template itself to runtime helper
/// calls. A binding initializer reached through `scope.evaluate`, however, is
/// still source AST and must fold just as it does in prod (#3570).
#[test]
fn equality_in_a_binding_initializer_folds_in_dev() {
    for operator in ["===", "!==", "==", "!="] {
        let out = client_with_dev(
            &format!(
                "<script>\n\tconst v = 'a' {operator} 'a' ? 1 : 2;\n</script>\n<b>{{v}}</b>\n"
            ),
            true,
        );
        assert!(
            out.contains("b.textContent = '") && !out.contains("template_effect"),
            "an equality initializer must fold in dev for `{operator}`; got:\n{out}"
        );
    }
}

/// Phase 2 used to mark a derived read as state from its binding kind alone,
/// omitting upstream's `!scope.evaluate(node).is_known` term (#3437). Pin the
/// complete measured grid: two known derived declarations times six read
/// shapes.
#[test]
fn known_derived_reads_are_not_reactive() {
    let declarations = ["let v = $derived(1);", "let v = $derived.by(() => 1);"];
    let references = [
        "<b>{v}</b>",
        "<b>{typeof v}</b>",
        "<b>{void v}</b>",
        "<b>{!v}</b>",
        "<b>x{v}</b>",
        "<b title={typeof v}></b>",
    ];

    for declaration in declarations {
        for reference in references {
            let out = client(&format!(
                "<script>\n\t{declaration}\n</script>\n{reference}\n"
            ));
            assert!(
                !out.contains("template_effect"),
                "a known derived read must be written once for `{declaration}` / `{reference}`; got:\n{out}"
            );
        }
    }
}

/// Evaluation recurses through unchanged rune bindings, while a block-bodied
/// `$derived.by` deliberately stays unknown upstream.
#[test]
fn known_derived_reactivity_uses_the_value_not_the_rune_kind() {
    let known = client(
        "<script>\n\tlet base = $state(0);\n\tlet v = $derived(base + 1);\n</script>\n<b>{v}</b>\n",
    );
    assert!(
        !known.contains("template_effect"),
        "an unchanged known state can make a derived value known; got:\n{known}"
    );

    let unknown =
        client("<script>\n\tlet v = $derived.by(() => { return 1; });\n</script>\n<b>{v}</b>\n");
    assert!(
        unknown.contains("template_effect"),
        "a block-bodied derived.by is UNKNOWN upstream; got:\n{unknown}"
    );
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

/// The template-fold path used to have its own recursive evaluator after the
/// `{@const}` path had moved to the shared one. A direct read therefore pins
/// the second caller: `void p` has one result even though `p` is unknown.
#[test]
fn a_direct_void_of_an_unknown_operand_folds_to_undefined() {
    let out = client("<script>\n\tlet { p } = $props();\n</script>\n<b>x{void p}</b>\n");
    assert!(
        out.contains("b.textContent = 'x';"),
        "the undefined chunk is omitted from the static text; got:\n{out}"
    );
    assert!(
        !out.contains("template_effect"),
        "`void p` is not reactive merely because `p` is unknown; got:\n{out}"
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
