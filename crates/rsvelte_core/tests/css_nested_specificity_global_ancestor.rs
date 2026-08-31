//! Upstream bumps a nested rule's specificity by walking `metadata.parent_rule`
//! and stopping at the first ancestor with `has_local_selectors`
//! (`3-transform/css/index.js:265-279`); whether that ancestor also carries a
//! `:global(...)` is not part of the test. rsvelte additionally required the
//! ancestor chain to be free of `:global`, so `:global(.theme-dark) .phone`
//! — whose `.phone` is local — left the nested rule at `.card.svelte-x` where
//! official emits `.card:where(.svelte-x)`, silently raising its specificity.
//!
//! Every expectation is the official compiler's own output (5.56.10). The two
//! ancestors that carry NO local selector are the controls: they must stay
//! unbumped, so "drop the `:global` test" cannot be read as "always bump".

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

/// The stylesheet with the component hash replaced by `HASH`.
fn scoped(source: &str) -> String {
    let out = css(source);
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
fn a_global_ancestor_with_a_local_selector_still_bumps() {
    let source = "<div class=\"theme-dark\"><div class=\"phone\"><div class=\"card\">x</div></div></div>\n\n<style>\n\t:global(.theme-dark) .phone {\n\t\tcolor: red;\n\n\t\t.card {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n</style>\n";
    assert!(
        scoped(source).contains(".card:where(.HASH)"),
        "{}",
        scoped(source)
    );

    // `:global` on both sides of the local compound answers the same way.
    let both = "<div class=\"a\"><div class=\"card\">x</div></div>\n\n<style>\n\t:global(.x) .a :global(.y) {\n\t\tcolor: red;\n\n\t\t.card {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n</style>\n";
    assert!(
        scoped(both).contains(".card:where(.HASH)"),
        "{}",
        scoped(both)
    );
}

#[test]
fn an_ancestor_with_no_local_selector_does_not_bump() {
    // The controls. `:global(.theme-dark)` and `:root` are each a whole parent
    // selector with nothing scoped in it, so the nested rule takes the direct
    // class — which is also what the plain-local case does at the FIRST level.
    for source in [
        "<div class=\"card\">x</div>\n\n<style>\n\t:global(.theme-dark) {\n\t\t.card {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n</style>\n",
        "<div class=\"card\">x</div>\n\n<style>\n\t:root {\n\t\t.card {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n</style>\n",
    ] {
        let out = scoped(source);
        assert!(out.contains(".card.HASH"), "{out}");
        assert!(!out.contains(":where("), "{out}");
    }
}

#[test]
fn a_plain_local_ancestor_bumps_the_nested_rule() {
    // The positive control for the pair above: no `:global` anywhere, and the
    // nested rule is bumped — which is the behaviour the `:global` test was
    // wrongly suppressing.
    let source = "<div class=\"phone\"><div class=\"card\">x</div></div>\n\n<style>\n\t.phone {\n\t\tcolor: red;\n\n\t\t.card {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n</style>\n";
    let out = scoped(source);
    assert!(out.contains(".phone.HASH"), "{out}");
    assert!(out.contains(".card:where(.HASH)"), "{out}");
}
