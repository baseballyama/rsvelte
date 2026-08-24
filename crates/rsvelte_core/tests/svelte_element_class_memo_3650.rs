//! Regression tests for #3650 — a `class:` directive on `<svelte:element>` emitted
//! an unbound `$0`.
//!
//! Upstream's `SvelteElement` visitor builds its inner context with
//! `memoizer: new Memoizer()` and closes it with `build_render_statement`, which
//! reads that memoizer's parameters. rsvelte assembled the same `template_effect`
//! by hand with a hard-coded empty parameter list, so the memoized `$0` that
//! `build_set_class` had just produced was bound nowhere. The output parses, so
//! the parse oracle is blind to it; it throws `ReferenceError` on first render.
//!
//! Two properties are tested, not one. The parameter list has to be *present*,
//! and the memoizer has to be the element's *own* — `sibling_memo_numbering`
//! and `nested_elements_each_start_at_zero` are the rows that separate a fresh
//! memoizer from a shared one, because a shared one numbers the second slot `$1`.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str = "<script>\n\tlet n = $state(0);\n\tfunction f(a) { return 'v'; }\n</script>\n";

fn client(template: &str, dev: bool) -> String {
    compile(
        &format!("{HEAD}{template}\n"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The defect itself: the effect binds the parameter its body reads.
#[test]
fn the_class_directive_effect_binds_its_memo_parameter() {
    const CASES: [(&str, &str); 3] = [
        (
            "<svelte:element this={'span'} class:x={f()}></svelte:element>",
            "$.template_effect(($0) => classes = $.set_class($$element, 0, '', null, classes, $0), [() => ({ x: f() })]);",
        ),
        (
            "<svelte:element this={'span'} class:x={f()} class:y={f()}></svelte:element>",
            "$.template_effect(($0) => classes = $.set_class($$element, 0, '', null, classes, $0), [() => ({ x: f(), y: f() })]);",
        ),
        (
            "<svelte:element this={'span'} class=\"base\" class:x={f()}></svelte:element>",
            "$.template_effect(($0) => classes = $.set_class($$element, 0, 'base', null, classes, $0), [() => ({ x: f() })]);",
        ),
    ];
    for (template, expected) in CASES {
        for dev in [false, true] {
            let out = client(template, dev);
            assert!(
                out.contains(expected),
                "dev={dev} {template:?}\nexpected: {expected}\nin:\n{out}"
            );
        }
    }
}

/// Two directives share ONE memo slot — the memoized value is the whole object,
/// so a fix that emitted one parameter per directive would print `($0, $1)`.
#[test]
fn two_directives_share_one_slot() {
    let out = client(
        "<svelte:element this={'span'} class:x={f()} class:y={f()}></svelte:element>",
        false,
    );
    assert!(!out.contains("($0, $1)"), "in:\n{out}");
}

/// The element's memoizer is its own: a memoized expression on an enclosing
/// element occupies `$0` in the enclosing effect and the inner one restarts at
/// `$0` too. A shared memoizer numbers the second slot `$1`, which is the
/// failure this row exists to catch.
#[test]
fn sibling_memo_numbering_is_independent() {
    let out = client(
        "<div title={f(1)}><svelte:element this={'span'} class:x={f(2)}></svelte:element></div>",
        false,
    );
    assert!(
        out.contains(
            "$.template_effect(($0) => classes = $.set_class($$element, 0, '', null, classes, $0), [() => ({ x: f(2) })]);"
        ),
        "inner:\n{out}"
    );
    assert!(
        out.contains("$.template_effect(($0) => $.set_attribute(div, 'title', $0), [() => f(1)]);"),
        "outer:\n{out}"
    );
}

/// Nested dynamic elements: each callback numbers from zero.
#[test]
fn nested_elements_each_start_at_zero() {
    let out = client(
        "<svelte:element this={'i'} class:a={f(1)}><svelte:element this={'b'} class:x={f(2)}></svelte:element></svelte:element>",
        false,
    );
    for expected in [
        "$.template_effect(($0) => classes = $.set_class($$element, 0, '', null, classes, $0), [() => ({ a: f(1) })]);",
        "$.template_effect(($0) => classes_1 = $.set_class($$element_1, 0, '', null, classes_1, $0), [() => ({ x: f(2) })]);",
    ] {
        assert!(out.contains(expected), "expected: {expected}\nin:\n{out}");
    }
}

/// Nothing memoized, nothing bound: a plain state read stays a direct
/// `$.set_class` call, so the fix must not manufacture a parameter list.
#[test]
fn an_unmemoized_directive_gains_no_parameter() {
    let out = client(
        "<svelte:element this={'span'} class:x={n}></svelte:element>",
        false,
    );
    assert!(
        out.contains("$.set_class($$element, 0, '', null, {}, { x: n });"),
        "in:\n{out}"
    );
    assert!(!out.contains("$.template_effect"), "in:\n{out}");
}

/// Negative controls for the two slots that were already correct. `style:` and a
/// plain attribute reach `$.attribute_effect`, which builds its own parameter
/// list, and a regular element goes through `RegularElement`'s memoizer drain —
/// none of them touch the code this fix changes.
#[test]
fn the_already_correct_slots_are_unchanged() {
    const CASES: [(&str, &str); 3] = [
        (
            "<svelte:element this={'span'} style:color={f()}></svelte:element>",
            "$.attribute_effect($$element, ($0) => ({ style: '', [$.STYLE]: $0 }), [() => ({ color: f() })]);",
        ),
        (
            "<svelte:element this={'span'} title={f()}></svelte:element>",
            "$.attribute_effect($$element, ($0) => ({ title: $0 }), [() => f()]);",
        ),
        (
            "<div class:x={f()}></div>",
            "$.template_effect(($0) => classes = $.set_class(div, 1, '', null, classes, $0), [() => ({ x: f() })]);",
        ),
    ];
    for (template, expected) in CASES {
        let out = client(template, false);
        assert!(
            out.contains(expected),
            "{template:?}\nexpected: {expected}\nin:\n{out}"
        );
    }
}
