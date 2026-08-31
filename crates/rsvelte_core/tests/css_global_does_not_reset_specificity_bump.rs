//! Upstream's `ComplexSelector` skips a `:global` relative selector with
//! `continue` (`3-transform/css/index.js:283-311`), so it neither adds a
//! modifier nor touches `state.specificity.bumped`. rsvelte tracked a
//! `seen_global` flag and forced the NEXT scoped selector back to a direct
//! class, which upstream has no notion of: inside a rule whose parent carries a
//! local selector the bump is already on, so `:global(html) & .title` must be
//! `:where(...)`.
//!
//! Every expectation is the official compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn scoped(markup: &str, body: &str) -> String {
    let source = format!("{markup}\n\n<style>{body}</style>\n");
    let out = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let Some(start) = out.find("svelte-") else {
        return out;
    };
    let len = out[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(out.len() - start, |(i, _)| i);
    out.replace(&out[start..start + len], "HASH")
}

#[test]
fn a_global_ancestor_does_not_undo_an_inherited_bump() {
    let out = scoped(
        "<div class=\"card\"><div class=\"title\">x</div></div>",
        "\n\t.card {\n\t\tcolor: red;\n\n\t\t:global(html) & .title {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n",
    );
    assert!(out.contains("html & .title:where(.HASH)"), "{out}");
}

#[test]
fn a_top_level_global_ancestor_still_starts_unbumped() {
    // The control. At the top level the selector list starts `{bumped: false}`,
    // so the same shape takes a direct class — which is why "a `:global` forces
    // a direct class" looked right on this input and was wrong on the other.
    let out = scoped(
        "<div class=\"title\">x</div>",
        "\n\t:global(html) .title {\n\t\tcolor: blue;\n\t}\n",
    );
    assert!(out.contains("html .title.HASH"), "{out}");
    assert!(!out.contains(":where("), "{out}");
}

#[test]
fn a_second_scoped_compound_is_bumped_with_no_global_involved() {
    // The positive control for the bump itself.
    let out = scoped(
        "<div class=\"a\"><div class=\"c\">x</div></div>",
        "\n\t.a .c {\n\t\tcolor: red;\n\t}\n",
    );
    assert!(out.contains(".a.HASH .c:where(.HASH)"), "{out}");
}
