//! A `>` link is a position, and the ancestor-scoping pass had none. It asked
//! "does this element match some non-subject compound" and "does its subtree
//! hold a matching subject" as two independent questions, so for `div > code`
//! every ancestor `div` was scoped rather than only the subject's parent.
//!
//! Both directions are pinned here: dropping `">"` from the ancestor test would
//! silence the over-marking and stop scoping the real parent, and the
//! descendant rows would still pass.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `<div>` / `<section>` / `<div class="q">` / `<code>`, four levels, so a rule
/// that binds one ancestor has three candidates to choose wrongly from.
fn markup(rule: &str) -> String {
    let src = format!(
        "<div>\n  <section>\n    <div class=\"q\"><code>b</code></div>\n  </section>\n</div>\n\
         \n<style>\n  {rule} {{ color: red; }}\n</style>\n"
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

fn scoped_outer_div(out: &str) -> bool {
    out.contains("<div class=\"svelte-")
}

fn scoped_section(out: &str) -> bool {
    out.contains("<section class=\"svelte-")
}

fn scoped_q(out: &str) -> bool {
    out.contains("<div class=\"q svelte-")
}

fn scoped_code(out: &str) -> bool {
    out.contains("<code class=\"svelte-")
}

#[test]
fn child_combinator_scopes_only_the_subjects_parent() {
    let out = markup("div > code");
    assert!(
        scoped_q(&out),
        "the subject's parent must be scoped:\n{out}"
    );
    assert!(scoped_code(&out), "the subject must be scoped:\n{out}");
    assert!(
        !scoped_outer_div(&out),
        "an outer `div` is not the subject's parent:\n{out}"
    );
}

#[test]
fn child_combinator_through_a_functional_pseudo_class() {
    for rule in [":not(pre) > code", ":is(div) > code"] {
        let out = markup(rule);
        assert!(scoped_q(&out), "{rule}: parent must be scoped:\n{out}");
        assert!(
            !scoped_outer_div(&out) && !scoped_section(&out),
            "{rule}: only the parent may be scoped:\n{out}"
        );
    }
}

/// The opposite direction: a descendant combinator admits more than one
/// binding, and *every* ancestor that can serve is scoped. A fix that answers
/// "does the first binding found use this element" under-marks here.
#[test]
fn descendant_combinator_still_scopes_every_candidate_ancestor() {
    let out = markup("div code");
    assert!(scoped_outer_div(&out), "outer div must be scoped:\n{out}");
    assert!(scoped_q(&out), "inner div must be scoped:\n{out}");

    let out = markup(":not(pre) code");
    assert!(scoped_outer_div(&out), "outer div must be scoped:\n{out}");
    assert!(scoped_section(&out), "section must be scoped:\n{out}");
    assert!(scoped_q(&out), "inner div must be scoped:\n{out}");
}

/// `<section>` sits between the two `div`s, so no chain of two `>` links
/// reaches the `<code>` and nothing is scoped.
#[test]
fn a_child_chain_that_cannot_bind_scopes_nothing() {
    let out = markup("div > div > code");
    assert!(
        !scoped_outer_div(&out) && !scoped_section(&out) && !scoped_q(&out) && !scoped_code(&out),
        "no element may be scoped:\n{out}"
    );
}
