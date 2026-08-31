//! A legacy template chunk is graded on the value `build_expression` BUILT.
//!
//! Upstream's `build_template_chunk` evaluates `memoize(build_expression(...))`,
//! and in legacy mode `build_expression` wraps a chunk carrying a call, a member
//! expression or an assignment in `(deps…, $.untrack(() => value))`. Upstream's
//! `scope.evaluate` has no `SequenceExpression` case, so such a chunk is never
//! known — while its *source* may read as a constant, which is what rsvelte was
//! grading. Folding it hoists the write out of `$.template_effect` and freezes
//! the value at its first render.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/legacy-chunk-fold-grades-the-built-value.svelte"
);

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("Probe.svelte".to_string()),
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// The three chunks upstream keeps reactive: a style attribute, a class
/// attribute and a text hole. Each is its own assertion — one combined check
/// would pass on two of the three.
#[test]
fn a_legacy_member_chunk_is_not_folded_in_any_of_the_three_builders() {
    let out = client(SRC);
    for (what, needle) in [
        ("style attribute", "$.set_style(div,"),
        ("class attribute", "$.set_class(p, 1,"),
        ("text hole", "$.set_text(text,"),
    ] {
        assert!(
            out.contains(needle),
            "the {what} chunk was folded away; got:\n{out}"
        );
    }
    assert!(
        !out.contains("margin-bottom:0px"),
        "the style chunk folded to a constant; got:\n{out}"
    );
    assert!(
        !out.contains(r#""base on""#),
        "the class chunk folded to a constant; got:\n{out}"
    );
}

/// The control: with no call, member or assignment, `build_expression` returns
/// the value untouched and upstream really does fold. A guard that declined
/// every legacy chunk would pass the test above and fail this one.
#[test]
fn a_legacy_chunk_with_no_member_or_call_still_folds() {
    let out = client(SRC);
    assert!(
        out.contains("i.textContent = 'lit';"),
        "the identifier-only chunk must still fold; got:\n{out}"
    );
}

/// Runes mode takes `build_expression`'s early return, so the same shape folds
/// there. Without this the guard could be written without its mode test.
#[test]
fn a_runes_member_chunk_still_folds() {
    let out = client(
        "<script>\n\tlet { item, activeId } = $props();\n</script>\n<b>{item.id === activeId ? 'same' : 'same'}</b>\n",
    );
    assert!(
        out.contains("text.nodeValue = 'same';"),
        "runes mode has no legacy wrapper, so this folds; got:\n{out}"
    );
}
