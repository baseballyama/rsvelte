//! Upstream's `get_relative_selectors` unshifts a `nesting_selector` when a
//! nested rule writes no explicit `&`, and the `NestingSelector` case then
//! short-circuits on `complex_selector.children.every(is_global)` — so under a
//! fully-global parent that implicit `&` matches every element, and
//! `apply_combinator`'s parents loop marks every ancestor of a match scoped.
//! rsvelte scoped only the child's own subject, so a wrapper carrying no
//! selector of its own lost its scope class (#4059).
//!
//! The CSS text was already correct on every row measured; the divergence is in
//! the template alone, which is why this file reads the generated markup.
//!
//! Every expectation is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `<svg>` carries `p q` and matches no selector any test below writes, so it is
/// scoped only by the ancestor rule. `<i class="b">` is one level below the
/// subject and must stay unscoped unless a rule reaches it.
fn markup(style: &str) -> String {
    let src = format!(
        "<svg class=\"p q\"><path class=\"a\"><i class=\"b\"></i></path></svg>\n\
         \n<style>\n\t{style}\n</style>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn svg_scoped(out: &str) -> bool {
    out.contains("<svg class=\"p q svelte-")
}

fn path_scoped(out: &str) -> bool {
    out.contains("<path class=\"a svelte-")
}

fn i_scoped(out: &str) -> bool {
    out.contains("<i class=\"b svelte-")
}

#[test]
fn a_fully_global_parent_scopes_the_ancestors_of_an_implicitly_nested_child() {
    for style in [
        ":global(.x) {\n\t\t.a { opacity: 1; }\n\t}",
        ":global(.x),\n\t:global(button:active) {\n\t\t.a { opacity: 1; }\n\t}",
        ":global(.x) :global(.y) {\n\t\t.a { opacity: 1; }\n\t}",
    ] {
        let out = markup(style);
        assert!(svg_scoped(&out), "the wrapper lost its scope class:\n{out}");
        assert!(
            path_scoped(&out),
            "the subject lost its scope class:\n{out}"
        );
        assert!(
            !i_scoped(&out),
            "a descendant of the subject was scoped:\n{out}"
        );
    }
}

#[test]
fn the_implicit_nesting_applies_at_every_depth() {
    let out = markup(":global(.x) {\n\t\t.a { .b { opacity: 1; } }\n\t}");
    assert!(svg_scoped(&out), "{out}");
    assert!(path_scoped(&out), "{out}");
    assert!(i_scoped(&out), "{out}");
}

/// An explicit `&` reaches the same upstream branch and was already correct, so
/// these rows stay green with the fix removed: they are a regression guard, not
/// evidence about the implicit case.
///
/// They are also what separates the two spellings. The implicit `&` upstream
/// unshifts carries a DESCENDANT combinator, so it is an ancestor of the
/// subject and gets scoped; `&.a` puts both in one compound, so there is no
/// ancestor to mark and `<svg>` stays bare. A fix that prepends the `&` without
/// the combinator passes the descendant row and fails this one.
#[test]
fn an_explicit_descendant_nesting_selector_scopes_the_ancestor() {
    let out = markup(":global(.x) {\n\t\t& .a { opacity: 1; }\n\t}");
    assert!(svg_scoped(&out), "{out}");
    assert!(path_scoped(&out), "{out}");
}

#[test]
fn an_explicit_self_nesting_selector_leaves_the_ancestor_bare() {
    let out = markup(":global(.x) {\n\t\t&.a { opacity: 1; }\n\t}");
    assert!(
        !svg_scoped(&out),
        "`&.a` is one compound, so there is no ancestor to scope:\n{out}"
    );
    assert!(path_scoped(&out), "{out}");
}

/// The controls the fix must not move. A flat rule scopes only what it matches,
/// and a parent that is not fully global leaves the implicit `&` bound to that
/// parent — so `<svg>` is scoped there by `.p`, never by the child.
#[test]
fn a_rule_that_does_not_reach_the_wrapper_leaves_it_alone() {
    let out = markup(".a { opacity: 1; }");
    assert!(
        !svg_scoped(&out),
        "a flat rule started scoping an ancestor:\n{out}"
    );
    assert!(path_scoped(&out), "{out}");

    let out = markup(".b { opacity: 1; }");
    assert!(!svg_scoped(&out), "{out}");
    assert!(!path_scoped(&out), "{out}");
    assert!(i_scoped(&out), "{out}");
}

#[test]
fn a_partially_global_parent_binds_the_implicit_nesting_to_that_parent() {
    // `:global(.x) .p` is not fully global, so upstream's short-circuit does not
    // fire: `<svg>` is scoped because `.p` matches it, and `<i>` stays bare.
    let out = markup(":global(.x) .p {\n\t\t.a { opacity: 1; }\n\t}");
    assert!(svg_scoped(&out), "{out}");
    assert!(path_scoped(&out), "{out}");
    assert!(!i_scoped(&out), "{out}");
}

/// A bare `:global` opens a global BLOCK: everything inside is emitted unscoped,
/// so the fully-global short-circuit must not fire for it. Without this guard the
/// first version of the fix scoped every ancestor here — measured as 8 of 8
/// `bare-global` grid cells regressing, and as three real-world components.
#[test]
fn a_bare_global_block_scopes_nothing_at_any_depth() {
    for style in [
        ":global {\n\t\t.a { opacity: 1; }\n\t}",
        ":global {\n\t\t.a { .b { opacity: 1; } }\n\t}",
        ":global {\n\t\t> .a { opacity: 1; }\n\t}",
    ] {
        let out = markup(style);
        assert!(
            !svg_scoped(&out),
            "a global block scoped an ancestor:\n{style}\n{out}"
        );
        assert!(
            !path_scoped(&out),
            "a global block scoped its own subject:\n{style}\n{out}"
        );
    }
}

/// The block's own prefix is still a real selector, so `.p` scopes `<svg>` while
/// nothing inside the block is scoped. This row is what separates "skip the
/// short-circuit for a global block" from "skip the rule entirely".
#[test]
fn a_prefixed_global_block_still_scopes_its_own_prefix() {
    let out = markup(".p :global {\n\t\t.a { opacity: 1; }\n\t}");
    assert!(svg_scoped(&out), "`.p` stopped scoping its element:\n{out}");
    assert!(
        !path_scoped(&out),
        "a global block scoped its contents:\n{out}"
    );
}

/// The same rules with the subject at the ROOT of the template, so there is no
/// ancestor for the implicit `&` to match. Upstream still matches, because
/// `apply_combinator` falls through to `every_is_global` on the remaining
/// prefix and `is_global` resolves a `NestingSelector` through the parent
/// prelude. Modelling the `&` only as "matches every element" satisfies every
/// row of the wrapped tests above and none of these.
fn rootless(style: &str) -> String {
    let src = format!(
        "<div class=\"a\"><i class=\"b\"></i></div>\n\
         \n<style>\n\t{style}\n</style>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn div_a_scoped(out: &str) -> bool {
    out.contains("<div class=\"a svelte-")
}

fn i_b_scoped(out: &str) -> bool {
    out.contains("<i class=\"b svelte-")
}

#[test]
fn a_subject_with_no_ancestor_at_all_is_still_scoped() {
    for style in [
        ":global(.x) {\n\t\t.a { opacity: 1; }\n\t}",
        ":global(.x),\n\t:global(button:active) {\n\t\t.a { opacity: 1; }\n\t}",
        ":global(.x) :global(.y) {\n\t\t.a { opacity: 1; }\n\t}",
        ":global(.x) {\n\t\t& .a { opacity: 1; }\n\t}",
        ":global(.x) {\n\t\t&.a { opacity: 1; }\n\t}",
    ] {
        let out = rootless(style);
        assert!(
            div_a_scoped(&out),
            "the root subject lost its scope class:\n{style}\n{out}"
        );
        assert!(
            !i_b_scoped(&out),
            "a descendant of the subject was scoped:\n{style}\n{out}"
        );
    }
}

#[test]
fn a_rootless_grandchild_scopes_the_element_between_it_and_the_root() {
    let out = rootless(":global(.x) {\n\t\t.a { .b { opacity: 1; } }\n\t}");
    assert!(
        div_a_scoped(&out),
        "the middle element lost its scope class:\n{out}"
    );
    assert!(i_b_scoped(&out), "the subject lost its scope class:\n{out}");
}

#[test]
fn a_rootless_subject_under_a_scopeable_parent_stays_bare() {
    for style in [
        // The parent is not global, so nothing matches `.x` and the rule prunes.
        ".x {\n\t\t.a { opacity: 1; }\n\t}",
        // A bare `:global` is a global BLOCK: its contents are unscoped.
        ":global {\n\t\t.a { opacity: 1; }\n\t}",
        // An explicitly global child scopes nothing, ancestors included.
        ":global(.x) {\n\t\t:global(.a) { opacity: 1; }\n\t}",
    ] {
        let out = rootless(style);
        assert!(
            !div_a_scoped(&out),
            "an element was scoped by a rule that does not reach it:\n{style}\n{out}"
        );
        assert!(
            !i_b_scoped(&out),
            "a descendant was scoped:\n{style}\n{out}"
        );
    }
}
