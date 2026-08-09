//! Upstream calls the shared a11y checker from **both** element visitors
//! (`RegularElement.js` and `SvelteElement.js`); rsvelte had a call site only on
//! the regular one, so every element a11y rule was silently absent whenever the
//! element was written as `<svelte:element this={…}>`.
//!
//! `<svelte:element>` reaches `check_element` under the literal name
//! `svelte:element` with `is_dynamic_element` set, which is what decides the
//! second half of this file: the rules that need a statically known tag are
//! skipped there, and asserting only "the dynamic element warns" would score a
//! port that forwards with `is_dynamic_element = false` as correct.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

fn codes(src: &str) -> Vec<String> {
    warnings(src).into_iter().map(|w| w.code).collect()
}

const PREAMBLE: &str = "<script>\n\tlet tag = 'div';\n\tlet n = 0;\n\tfunction f() {}\n</script>\n";

fn dynamic(attrs: &str, children: &str) -> String {
    format!("{PREAMBLE}<svelte:element this={{tag}} {attrs}>{children}</svelte:element>\n")
}

/// The reported shape: an interactive handler on a dynamic element.
#[test]
fn dynamic_element_raises_static_element_interactions() {
    let src = dynamic("onclick={f}", "x");
    assert!(
        codes(&src).contains(&"a11y_no_static_element_interactions".to_string()),
        "got {:?}",
        codes(&src)
    );
}

/// The warning spans the element, as upstream's `w.a11y_…(node, …)` does.
#[test]
fn dynamic_element_warning_spans_the_element() {
    let src = dynamic("onclick={f}", "x");
    let ws = warnings(&src);
    let w = ws
        .iter()
        .find(|w| w.code == "a11y_no_static_element_interactions")
        .expect("warning");
    let pos = w.start.as_ref().expect("start");
    let line = src.lines().nth(pos.line - 1).unwrap();
    assert!(
        line[pos.column..].starts_with("<svelte:element"),
        "got {:?}",
        &line[pos.column..]
    );
}

/// One case per rule that upstream still reaches with a dynamic tag. A rule that
/// silently stops firing here is a regression the corpus cannot see — published
/// code writes `<svelte:element>` with an a11y-relevant shape almost never.
#[test]
fn dynamic_element_reaches_every_tag_independent_rule() {
    for (attrs, code) in [
        ("accesskey=\"z\"", "a11y_accesskey"),
        ("autofocus", "a11y_autofocus"),
        ("tabindex=\"5\"", "a11y_positive_tabindex"),
        ("aria-labeledby=\"x\"", "a11y_unknown_aria_attribute"),
        (
            "aria-hidden=\"yes\"",
            "a11y_incorrect_aria_attribute_type_boolean",
        ),
        ("role=\"noteworthy\"", "a11y_unknown_role"),
        ("role=\"widget\"", "a11y_no_abstract_role"),
        (
            "role=\"link\" aria-checked=\"true\"",
            "a11y_role_supports_aria_props",
        ),
        (
            "role=\"button\" onclick={f} onkeydown={f}",
            "a11y_interactive_supports_focus",
        ),
        (
            "role=\"article\" onclick={f} onkeydown={f}",
            "a11y_no_noninteractive_element_interactions",
        ),
        ("onmouseover={f}", "a11y_mouse_events_have_key_events"),
    ] {
        let src = dynamic(attrs, "x");
        assert!(
            codes(&src).contains(&code.to_string()),
            "`{attrs}` should raise `{code}`, got {:?}",
            codes(&src)
        );
    }
}

/// The control. Every row is a rule upstream guards with `!is_dynamic_element`,
/// paired with the static element that *does* raise it — so the assertion cannot
/// pass by the rule being unreachable altogether.
#[test]
fn rules_needing_a_static_tag_are_skipped_on_the_dynamic_one() {
    for (attrs, children, static_tag, code) in [
        ("scope=\"col\"", "x", "div", "a11y_misplaced_scope"),
        (
            "aria-activedescendant=\"x\"",
            "x",
            "div",
            "a11y_aria_activedescendant_has_tabindex",
        ),
        (
            "onclick={f}",
            "x",
            "div",
            "a11y_click_events_have_key_events",
        ),
        (
            "tabindex=\"0\"",
            "x",
            "div",
            "a11y_no_noninteractive_tabindex",
        ),
        (
            "role=\"checkbox\"",
            "x",
            "div",
            "a11y_role_has_required_aria_props",
        ),
    ] {
        let dyn_src = dynamic(attrs, children);
        assert!(
            !codes(&dyn_src).contains(&code.to_string()),
            "`{attrs}` must NOT raise `{code}` on a dynamic tag, got {:?}",
            codes(&dyn_src)
        );
        let static_src = format!("{PREAMBLE}<{static_tag} {attrs}>{children}</{static_tag}>\n");
        assert!(
            codes(&static_src).contains(&code.to_string()),
            "`{attrs}` should raise `{code}` on `<{static_tag}>` — the control is inert otherwise, got {:?}",
            codes(&static_src)
        );
    }
}

/// `is_parent` stops at a dynamic ancestor and answers "unknown", so an
/// ancestor-dependent rule is suppressed rather than guessed. The regular-element
/// row is the control.
#[test]
fn a_dynamic_ancestor_suppresses_ancestor_dependent_rules() {
    for (child, code) in [
        ("<input autofocus />", "a11y_autofocus"),
        ("<figcaption>x</figcaption>", "a11y_figcaption_parent"),
    ] {
        let dyn_src = format!("{PREAMBLE}<svelte:element this={{tag}}>{child}</svelte:element>\n");
        assert!(
            !codes(&dyn_src).contains(&code.to_string()),
            "`{child}` under a dynamic ancestor must NOT raise `{code}`, got {:?}",
            codes(&dyn_src)
        );
        let static_src = format!("{PREAMBLE}<div>{child}</div>\n");
        assert!(
            codes(&static_src).contains(&code.to_string()),
            "`{child}` under `<div>` should raise `{code}`, got {:?}",
            codes(&static_src)
        );
    }
}

/// `has_content` shares one arm for both element types upstream, so an EMPTY
/// `<svelte:element>` child does not count as content.
#[test]
fn an_empty_dynamic_child_is_not_content() {
    let empty = format!("{PREAMBLE}<button><svelte:element this={{tag}} /></button>\n");
    assert!(
        codes(&empty).contains(&"a11y_consider_explicit_label".to_string()),
        "got {:?}",
        codes(&empty)
    );
    let filled =
        format!("{PREAMBLE}<button><svelte:element this={{tag}}>x</svelte:element></button>\n");
    assert!(
        !codes(&filled).contains(&"a11y_consider_explicit_label".to_string()),
        "got {:?}",
        codes(&filled)
    );
}

/// The warnings go through `emit_warning`, so `svelte-ignore` suppresses them.
/// The un-ignored row is not decoration: without it this test is satisfied by the
/// warning never being raised at all, which is the very defect being fixed.
#[test]
fn svelte_ignore_suppresses_a_dynamic_element_warning() {
    let element = "<svelte:element this={tag} onclick={f}>x</svelte:element>\n";
    let ignored =
        format!("{PREAMBLE}<!-- svelte-ignore a11y_no_static_element_interactions -->\n{element}");
    assert!(
        !codes(&ignored).contains(&"a11y_no_static_element_interactions".to_string()),
        "got {:?}",
        codes(&ignored)
    );
    let bare = format!("{PREAMBLE}{element}");
    assert!(
        codes(&bare).contains(&"a11y_no_static_element_interactions".to_string()),
        "without the comment the warning must fire — the suppression check is inert otherwise, got {:?}",
        codes(&bare)
    );
}
