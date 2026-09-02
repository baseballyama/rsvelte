//! A `$:` statement's body is lowered by branching on the shape of its
//! left-hand side, and `transform_state_member_mutations` — the pass that wraps
//! a state member write in `$.mutate` — was wired into two of the branches. A
//! mutation nested in the right-hand side (inside an arrow, say) therefore lost
//! its wrap on every other branch, and the read pass then rewrote its root to
//! `$.get(o)`, producing a write that never invalidates.
//!
//! The comment on the branch that already had the pass called them "both
//! sibling branches"; there are eight, and five were missing it. The two that
//! had it are the controls below.
//!
//! Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const EXPECTED: &str = "$.mutate(o, $.get(o).sel = k() || 1);";

fn mutation_line(statement: &str) -> String {
    let src = format!(
        "<script>\n\texport let k;\n\tlet o = {{ sel: 0 }};\n\tlet arr = [0];\n\
         \tlet pobj = {{ sel: 0 }};\n\t{statement}\n</script>\n\
         <p>{{o.sel}}{{arr[0]}}{{pobj.sel}}{{k}}</p>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .find(|l| l.contains(".sel = k()"))
        .unwrap_or_else(|| panic!("no nested mutation in:\n{js}"))
        .trim()
        .to_string()
}

#[test]
fn a_prop_left_hand_side_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: k = (() => { o.sel = k || 1; });"),
        EXPECTED
    );
}

#[test]
fn a_state_left_hand_side_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: rx = { f: () => { o.sel = k || 1; } };"),
        EXPECTED
    );
}

#[test]
fn a_member_left_hand_side_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: pobj.sel = (() => { o.sel = k || 1; }, 1);"),
        EXPECTED
    );
}

#[test]
fn a_computed_member_left_hand_side_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: arr[0] = (() => { o.sel = k || 1; }, 1);"),
        EXPECTED
    );
}

#[test]
fn a_non_reactive_left_hand_side_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: plainv = (() => { o.sel = k || 1; });"),
        EXPECTED
    );
}

/// The pass parses its input as a program, so the right-hand side only reached
/// it while it happened to be a statement too: `{ f: () => { … } }` is a block
/// with one labelled statement, and a SECOND property makes it a parse error and
/// the pass a no-op. Every real carrier has more than one property.
#[test]
fn an_object_right_hand_side_with_two_properties_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: rx = { zzz: 1, f: () => { o.sel = k || 1; } };"),
        EXPECTED
    );
}

/// The one-property spelling that worked by accident. It has to keep working:
/// the parenthesised form parses it as an object literal rather than a block.
#[test]
fn an_object_right_hand_side_with_one_property_still_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: rx = { f: () => { o.sel = k || 1; } };"),
        EXPECTED
    );
}

/// The two branches that already had the pass, kept as controls: if these move,
/// the change reached more than the five branches it was measured on.
#[test]
fn the_keyword_branch_still_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: if (k) { const f = () => { o.sel = k || 1; }; f; }"),
        EXPECTED
    );
}

#[test]
fn the_destructuring_branch_still_wraps_a_nested_mutation() {
    assert_eq!(
        mutation_line("$: [a1] = [() => { o.sel = k || 1; }];"),
        EXPECTED
    );
}
