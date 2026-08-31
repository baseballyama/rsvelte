//! Upstream's `ComplexSelector` visitor runs at every depth, and it calls
//! `remove_global_pseudo_class` on each `:global` it walks past
//! (`3-transform/css/index.js:283-318`) BEFORE deciding whether to add a
//! scoping modifier. Inside a bare `:global { … }` block the modifier is
//! skipped, but the removal still happens — rsvelte copied the whole block from
//! source and left the `:global(...)` in the output.
//!
//! Every expectation is the official compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn scoped(body: &str) -> String {
    let source = format!("<p class=\"a\">x</p>\n\n<style>{body}</style>\n");
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
fn a_nested_global_inside_a_bare_global_block_is_unwrapped() {
    // Argument form: `:global(` and its `)` go, the argument stays.
    let args = scoped(
        "\n\t:global {\n\t\t.tabs {\n\t\t\t& :global(a) {\n\t\t\t\tcolor: blue;\n\t\t\t}\n\t\t}\n\t}\n",
    );
    assert!(args.contains("& a {"), "{args}");
    assert!(!args.contains(":global(a)"), "{args}");

    // Bare form: the keyword goes with the descendant space before it, so
    // `& :global.x` becomes `&.x` rather than `& .x`.
    let bare = scoped(
        "\n\t:global {\n\t\t.tabs {\n\t\t\t& :global.x {\n\t\t\t\tcolor: blue;\n\t\t\t}\n\t\t}\n\t}\n",
    );
    assert!(bare.contains("&.x {"), "{bare}");
    // The block wrapper itself is emitted as `/* :global {*/`, so only the
    // nested keyword must be gone.
    assert!(!bare.contains(":global."), "{bare}");
}

#[test]
fn a_block_with_no_nested_global_is_copied_unchanged() {
    // The control for the removal: nothing else in a bare `:global {}` block is
    // rewritten, and in particular no scoping class appears.
    let out = scoped("\n\t:global {\n\t\t.tabs a {\n\t\t\tcolor: red;\n\t\t}\n\t}\n");
    assert!(out.contains(".tabs a {"), "{out}");
    assert!(!out.contains("HASH"), "{out}");
}

#[test]
fn a_global_outside_a_bare_block_still_scopes_its_ancestor() {
    // The control for the skip: outside the block the same removal runs AND the
    // modifier is added, so "remove it here too" cannot be read as "stop
    // scoping".
    let out = scoped("\n\t.a :global(b) {\n\t\tcolor: red;\n\t}\n");
    assert!(out.contains(".a.HASH b {"), "{out}");
}
