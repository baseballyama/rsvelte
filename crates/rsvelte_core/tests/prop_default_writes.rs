//! A prop's default value is not a special host upstream: one
//! `AssignmentExpression` visitor and one `UpdateExpression` visitor serve every
//! expression the walk reaches. rsvelte reaches a default through passes that
//! skip any line containing `$.prop(`, and only the READ halves had a
//! default-scoped counterpart — so a prop write lost its invalidation and a
//! store write emitted `() => ($store() = 1)`, which no JS parser accepts.
//!
//! One cell per binding kind × operation, because a fix that reaches the
//! reported shape and one neighbour looks exactly like a fix that reaches all of
//! them. Every expectation is the official compiler's own output for the same
//! source.
//!
//! The store row additionally pins an ORDER. `transform_store_assignments_client`
//! matches the bare `$store`, so it has to run before the read pass rewrites the
//! name to `$store()` — reversing just those two takes this file's store rows
//! back to the unparseable output above while leaving the prop and state rows
//! green.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn prop_line(declaration: &str, default: &str) -> String {
    prop_line_body(declaration, &format!("({default})"))
}

/// The parenthesised arrow body above is what the first grid held fixed, and the
/// parentheses are what hid a second defect: the update rewriter parses its input
/// as a PROGRAM, so an unparenthesised `() => prop++` came back as
/// `() => $.update_prop(prop);` — a statement terminator inside an argument list.
fn prop_line_unwrapped(declaration: &str, body: &str) -> String {
    prop_line_body(declaration, body)
}

fn prop_line_body(declaration: &str, body: &str) -> String {
    let source =
        format!("<script>\n\t{declaration}\n\texport let f = () => {body};\n</script>\n{{f}}\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .js
    .code
    .lines()
    .find(|line| line.contains("'f', "))
    .map(|line| line.trim().to_string())
    .unwrap_or_else(|| "(none)".to_string())
}

const PROP: &str = "export let subject = {};";
const STATE: &str = "let subject = {};";
const STORE: &str = "import { writable } from 'svelte/store';\n\tconst store = writable({});";

#[test]
fn a_prop_write_in_a_default_value_invalidates() {
    for (default, expected) in [
        (
            "subject",
            "let f = $.prop($$props, 'f', 8, () => subject());",
        ),
        (
            "subject = 1",
            "let f = $.prop($$props, 'f', 8, () => subject(1));",
        ),
        (
            "subject++",
            "let f = $.prop($$props, 'f', 8, () => $.update_prop(subject));",
        ),
        (
            "subject += 1",
            "let f = $.prop($$props, 'f', 8, () => subject(subject() + 1));",
        ),
        (
            "subject.x",
            "let f = $.prop($$props, 'f', 8, () => subject().x);",
        ),
        (
            "subject.x = 1",
            "let f = $.prop($$props, 'f', 8, () => subject(subject().x = 1, true));",
        ),
    ] {
        assert_eq!(prop_line(PROP, default), expected, "prop: {default}");
    }
}

/// The control row: state already reached its pipeline, so every cell here is
/// unchanged by the fix. It is what says the repair is scoped to the two passes
/// that were missing rather than to "default values" as a category.
#[test]
fn a_state_write_in_a_default_value_is_untouched() {
    for (default, expected) in [
        ("subject", "let f = $.prop($$props, 'f', 8, () => subject);"),
        (
            "subject = 1",
            "let f = $.prop($$props, 'f', 8, () => subject = 1);",
        ),
        (
            "subject++",
            "let f = $.prop($$props, 'f', 8, () => subject++);",
        ),
        (
            "subject += 1",
            "let f = $.prop($$props, 'f', 8, () => subject += 1);",
        ),
        (
            "subject.x",
            "let f = $.prop($$props, 'f', 8, () => subject.x);",
        ),
        (
            "subject.x = 1",
            "let f = $.prop($$props, 'f', 8, () => subject.x = 1);",
        ),
    ] {
        assert_eq!(prop_line(STATE, default), expected, "state: {default}");
    }
}

#[test]
fn a_store_write_in_a_default_value_goes_through_the_store_helpers() {
    for (default, expected) in [
        ("$store", "let f = $.prop($$props, 'f', 8, () => $store());"),
        (
            "$store = 1",
            "let f = $.prop($$props, 'f', 8, () => $.store_set(store, 1));",
        ),
        (
            "$store++",
            "let f = $.prop($$props, 'f', 8, () => $.update_store(store, $store()));",
        ),
        (
            "$store += 1",
            "let f = $.prop($$props, 'f', 8, () => $.store_set(store, $store() + 1));",
        ),
        (
            "$store.x",
            "let f = $.prop($$props, 'f', 8, () => $store().x);",
        ),
        (
            "$store.x = 1",
            "let f = $.prop($$props, 'f', 8, () => $.store_mutate(store, $.untrack($store).x = 1, $.untrack($store)));",
        ),
    ] {
        assert_eq!(prop_line(STORE, default), expected, "store: {default}");
    }
}

/// A bare identifier default is passed as a getter reference and must stay
/// untransformed — the guard the write passes need is "not a bare identifier",
/// not "an arrow", because upstream wraps every other shape in `() =>` itself.
#[test]
fn a_bare_identifier_default_is_still_passed_as_a_reference() {
    let source = "<script>\n\timport { writable } from 'svelte/store';\n\tconst store = writable({});\n\texport let f = $store;\n</script>\n{f}\n";
    let code = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code;
    let line = code
        .lines()
        .find(|line| line.contains("'f', "))
        .unwrap()
        .trim();
    assert_eq!(line, "let f = $.prop($$props, 'f', 24, $store);");
}

/// The same six operations with no parentheses around the arrow body. Every cell
/// of the original grid wrapped the body, so the whole set passed while two of
/// these emitted text no JS parser accepts.
#[test]
fn an_unparenthesised_arrow_body_is_still_an_expression() {
    for (declaration, body, expected) in [
        (
            PROP,
            "subject++",
            "let f = $.prop($$props, 'f', 8, () => $.update_prop(subject));",
        ),
        (
            PROP,
            "subject = 1",
            "let f = $.prop($$props, 'f', 8, () => subject(1));",
        ),
        (
            STORE,
            "$store++",
            "let f = $.prop($$props, 'f', 8, () => $.update_store(store, $store()));",
        ),
        (
            STORE,
            "$store = 1",
            "let f = $.prop($$props, 'f', 8, () => $.store_set(store, 1));",
        ),
        (
            STATE,
            "subject++",
            "let f = $.prop($$props, 'f', 8, () => subject++);",
        ),
        (
            STATE,
            "subject = 1",
            "let f = $.prop($$props, 'f', 8, () => subject = 1);",
        ),
    ] {
        assert_eq!(
            prop_line_unwrapped(declaration, body),
            expected,
            "unwrapped: {body}"
        );
    }
}
