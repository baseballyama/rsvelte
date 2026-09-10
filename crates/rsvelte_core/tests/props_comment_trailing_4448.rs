//! A `$props()` declaration's comment belongs on the declaration that lowering
//! produced, printed after its `;`. rsvelte printed it as a statement of its own
//! ahead of the script (the whole-object form, where the transform drops it) or
//! on a line of its own after the statement (the rest form, where it survives),
//! and both are a different line from upstream's (#4448).
//!
//! Every expected string below is official Svelte 5.57.0's own output for the
//! same source (`submodules/svelte`, pin `7bc0a70fe`), read off the oracle
//! rather than from a neighbouring cell.
//!
//! No corpus gate observes any of this: `ast_equiv_batch` runs with
//! `CommentPolicy::Ignore`, so a comment-only divergence scores `match` on both
//! arms.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str, name: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some(format!("{name}.svelte")),
            generate: GenerateMode::Client,
            name: Some(name.to_string()),
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const TRAILING: &str = "let p = $.rest_props($$props, rest_excludes); /* c */";

/// The whole-object form: the transform drops the comment, so it is re-emitted.
#[test]
fn a_whole_object_props_comment_trails_the_lowered_declaration() {
    let out = client(
        "<script>let p = /* c */ $props();</script><b>{p.a}</b>\n",
        "Pa",
    );
    assert!(out.contains(TRAILING), "{out}");
}

/// The rest form: the comment survives the transform on a line of its own after
/// the statement, so this cell is a move rather than a re-emission — the two
/// reach the same place by different routes, and a fix for one is not evidence
/// about the other.
#[test]
fn a_rest_element_props_comment_moves_onto_the_declaration() {
    let out = client(
        "<script>let { a, ...z } = /* c */ $props();</script><b>{a}{z}</b>\n",
        "Pb",
    );
    assert!(
        out.contains("let z = $.rest_props($$props, rest_excludes); /* c */"),
        "{out}"
    );
    // The line it used to occupy must be gone, not merely duplicated onto the
    // declaration.
    assert_eq!(out.matches("/* c */").count(), 1, "{out}");
}

/// A statement after the declaration, and one before it: the comment goes on the
/// declaration's own line either way, which is what says the rule is not "the
/// end of the script".
#[test]
fn a_surviving_statement_does_not_take_the_comment() {
    let after = client(
        "<script>let p = /* c */ $props();\nconst k = 1;</script><b>{p.a}{k}</b>\n",
        "Pe",
    );
    assert!(after.contains(TRAILING), "{after}");
    assert!(
        after.contains(&format!("{TRAILING}\n\tconst k = 1;")),
        "{after}"
    );

    let before = client(
        "<script>const k = 1;\nlet p = /* c */ $props();</script><b>{p.a}{k}</b>\n",
        "Pf",
    );
    assert!(
        before.contains(&format!("const k = 1;\n\t{TRAILING}")),
        "{before}"
    );
}

/// The axis is the comment's distance from the `$props(` call, not from the
/// `let`. Read off the oracle in both directions, because the obvious reading —
/// "a comment on the declaration's first line trails it" — is the one these two
/// cells kill: with the call moved to the next line upstream floats the comment
/// forward, and with the comment moved to the call's line upstream trails it.
#[test]
fn a_newline_between_the_comment_and_the_call_floats_it_forward() {
    // Upstream floats this one onto `var /* c */ b = root();` and rsvelte still
    // prints it ahead of the declaration, which is the re-emission position
    // #4501 left in place; what this cell holds is that it is NOT trailed.
    let floated = client(
        "<script>let p = /* c */\n\t$props();</script><b>{p.a}</b>\n",
        "Bx",
    );
    assert!(!floated.contains(TRAILING), "{floated}");
    assert!(floated.contains("/* c */"), "{floated}");

    let trailed = client(
        "<script>let p =\n\t/* c */ $props();</script><b>{p.a}</b>\n",
        "By",
    );
    assert!(trailed.contains(TRAILING), "{trailed}");
}

/// A line comment reaches the call only across a newline, so it is always the
/// floating case — the cell `props_initializer_comment_3515.rs` already pins,
/// held here too because it is what a rule keyed on the comment's kind rather
/// than its position would move.
#[test]
fn a_line_comment_before_the_call_is_left_where_it_was() {
    let out = client(
        "<script>let { a, ...z } = // c\n\t$props();</script><b>{a}{z}</b>\n",
        "Lrs",
    );
    assert!(
        !out.contains("$.rest_props($$props, rest_excludes); // c"),
        "{out}"
    );
}

/// With a default the comment belongs *inside* the `$.prop(…)` call, which the
/// lowering already does. This is the control the `$.prop(` guard exists for: a
/// rule that moved every props comment to the statement end would break it.
#[test]
fn a_default_keeps_its_comment_inside_the_prop_call() {
    let out = client(
        "<script>let { a = 1 } = /* c */ $props();</script><b>{a}</b>\n",
        "Pc",
    );
    assert!(
        out.contains("let a = $.prop($$props, 'a', 3, 1 /* c */);"),
        "{out}"
    );
}

/// A default *and* a rest element: upstream still writes the comment inside the
/// `$.prop(…)` call and rsvelte does not, which is not this issue. The guard
/// keeps that cell where it is rather than moving it to a second wrong place.
#[test]
fn a_default_beside_a_rest_element_is_left_alone() {
    let out = client(
        "<script>let { a = 1, ...z } = /* c */ $props();</script><b>{a}{z}</b>\n",
        "Pg",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        !out.contains("$.rest_props($$props, rest_excludes); /* c */"),
        "{out}"
    );
}

/// A comment inside the destructuring *pattern* is on the call's line too, so a
/// predicate keyed on "no newline before the call" catches it and duplicates it.
/// Upstream leaves it where the pattern put it — this is the cell that says the
/// text between the comment and the call has to be whitespace, not merely
/// newline-free. `props_pattern_comment_4453.rs` pins the count; this pins the
/// position.
#[test]
fn a_comment_inside_the_pattern_stays_in_the_pattern() {
    let out = client(
        "<script>\n\tlet { a, /* c */ ...rest } = $props();\n</script>\n<i>{a}{rest.b}</i>\n",
        "Ph",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("let /* c */ rest = $.rest_props($$props, rest_excludes);"),
        "{out}"
    );
    assert_eq!(out.matches("/* c */").count(), 1, "{out}");
}
