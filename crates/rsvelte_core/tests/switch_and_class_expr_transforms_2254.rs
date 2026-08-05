//! Regression tests for issue #2254 — the client transform's recursive
//! "apply transforms" walk over the generated JS tree had two holes, so every
//! expression sitting in one of them escaped the read/store rewrites entirely.
//!
//! `apply_transforms_to_statement_with_shadowed` had no `JsStatement::Switch`
//! arm (the catch-all cloned the statement verbatim), and
//! `apply_transforms_to_expression_with_shadowed` listed `JsExpr::Class`
//! among the terminal "nothing to transform" variants. The four affected
//! positions are the switch discriminant, a `case` test, a class-expression
//! field initializer and a class-expression computed method key.
//!
//! Because the each-index `used` flag and the store-getter registration are
//! both set from inside that same walk, the omission also dropped the `i`
//! parameter from the `$.each` callback and skipped the `$.store_get` getter —
//! not just the `$.get(...)` unwrap.
//!
//! A third, independent cause sat in the store-subscription pre-scan: a
//! `$store` reference followed by `:` was classified as an object property key,
//! which misfires on `case $store:`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Wrap `body` in an each block whose item is read from inside a click handler.
fn each_item_handler(body: &str) -> String {
    format!(
        "<script>\n\tconst items = $state([{{ value: 'a' }}]);\n\
         \tconst {{ sink, other }} = $props();\n</script>\n\n\
         {{#each items as item (item.value)}}\n\
         \t<button onclick={{() => {{\n{body}\n\t}}}}>x</button>\n\
         {{/each}}\n"
    )
}

/// Same, but with an index binding that is referenced only from `body`.
fn each_index_handler(body: &str) -> String {
    format!(
        "<script>\n\tconst items = $state([{{ value: 'a' }}]);\n\
         \tconst {{ sink, other }} = $props();\n</script>\n\n\
         {{#each items as item, i (item.value)}}\n\
         \t<button onclick={{() => {{\n{body}\n\t}}}}>x</button>\n\
         {{/each}}\n"
    )
}

fn store_handler(body: &str) -> String {
    format!(
        "<script>\n\timport {{ writable }} from 'svelte/store';\n\
         \tconst s = writable(1);\n\
         \tconst {{ sink, other }} = $props();\n</script>\n\n\
         <button onclick={{() => {{\n{body}\n}}}}>x</button>\n"
    )
}

fn assert_contains(out: &str, needle: &str) {
    assert!(out.contains(needle), "expected `{needle}` in:\n{out}");
}

fn assert_missing(out: &str, needle: &str) {
    assert!(!out.contains(needle), "unexpected `{needle}` in:\n{out}");
}

// ---------------------------------------------------------------------------
// Cluster A — the each-item read must be unwrapped with `$.get(...)`.
// ---------------------------------------------------------------------------

#[test]
fn switch_discriminant_unwraps_each_item() {
    let src = each_item_handler("switch (item.value) { case 'a': sink(1); }");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "switch ($.get(item).value)");
        assert_missing(&out, "switch (item.value)");
    }
}

#[test]
fn switch_case_test_unwraps_each_item() {
    let src = each_item_handler("switch (other) { case item.value: sink(1); }");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "case $.get(item).value:");
        assert_missing(&out, "case item.value:");
    }
}

#[test]
fn class_expression_field_initializer_unwraps_each_item() {
    let src = each_item_handler("sink(class { f = item.value; });");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "f = $.get(item).value");
        assert_missing(&out, "f = item.value");
    }
}

#[test]
fn class_expression_computed_method_key_unwraps_each_item() {
    let src = each_item_handler("sink(class { [item.value]() {} });");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "[$.get(item).value]()");
        assert_missing(&out, "[item.value]()");
    }
}

/// A class *method body* is a plain function body; its reads must be unwrapped
/// too, and a parameter of the same name must still shadow the each item.
#[test]
fn class_expression_method_body_unwraps_and_shadows() {
    let src = each_item_handler("sink(class { m() { sink(item.value); } });");
    let out = client(&src, false);
    assert_contains(&out, "sink($.get(item).value)");

    let shadowed = each_item_handler("sink(class { m(item) { sink(item.value); } });");
    let out = client(&shadowed, false);
    assert_missing(&out, "$.get(item).value");
}

/// A `let` declared in a case consequent shadows the each item for the whole
/// switch body (all cases share one lexical scope).
#[test]
fn switch_case_local_declaration_shadows_each_item() {
    let src = each_item_handler("switch (other) { case 1: { let item = 1; sink(item); } }");
    let out = client(&src, false);
    assert_missing(&out, "sink($.get(item))");
}

// ---------------------------------------------------------------------------
// Cluster B — the each-index binding must survive as a callback parameter when
// it is referenced only from one of the four positions.
// ---------------------------------------------------------------------------

#[test]
fn each_index_survives_switch_discriminant() {
    let src = each_index_handler("switch (i) { case 0: sink(1); }");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "$$anchor, item, i");
        assert_contains(&out, "switch ($.get(i))");
    }
}

#[test]
fn each_index_survives_switch_case_test() {
    let src = each_index_handler("switch (other) { case i: sink(1); }");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "$$anchor, item, i");
        assert_contains(&out, "case $.get(i):");
    }
}

#[test]
fn each_index_survives_class_expression_field() {
    let src = each_index_handler("sink(class { f = i; });");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "$$anchor, item, i");
        assert_contains(&out, "f = $.get(i)");
    }
}

#[test]
fn each_index_survives_class_expression_computed_key() {
    let src = each_index_handler("sink(class { [i]() {} });");
    for dev in [false, true] {
        let out = client(&src, dev);
        assert_contains(&out, "$$anchor, item, i");
        assert_contains(&out, "[$.get(i)]()");
    }
}

// ---------------------------------------------------------------------------
// Cluster C — store auto-subscription must be created for a `$store` read in
// these positions (a missing getter is a hard `ReferenceError` at runtime).
// ---------------------------------------------------------------------------

#[test]
fn store_subscription_created_for_switch_discriminant() {
    let src = store_handler("switch ($s) { case 1: sink(1); }");
    assert_contains(&client(&src, false), "$.store_get(s, '$s', $$stores)");
    assert_contains(&client(&src, true), "$.store_get(s, '$s', $$stores)");
    assert_contains(&server(&src), "$$store_subs");
}

#[test]
fn store_subscription_created_for_switch_case_test() {
    let src = store_handler("switch (other) { case $s: sink(1); }");
    let out = client(&src, false);
    assert_contains(&out, "$.store_get(s, '$s', $$stores)");
    assert_contains(&out, "case $s():");

    let dev = client(&src, true);
    assert_contains(&dev, "$.validate_store(s, 's')");
    assert_contains(&server(&src), "$$store_subs");
}

/// The `case $x:` carve-out must not resurrect a genuine object property key.
#[test]
fn object_property_key_is_still_not_a_store_reference() {
    let src = store_handler("sink({ $s: 1 });");
    assert_missing(&client(&src, false), "$.store_get");
}

// ---------------------------------------------------------------------------
// Anchors: positions the matrix found already correct must stay correct.
// ---------------------------------------------------------------------------

#[test]
fn if_and_while_tests_still_unwrap_each_item() {
    let src = each_item_handler(
        "if (item.value === 'a') sink(1);\n\t\twhile (item.value === 'never') break;",
    );
    let out = client(&src, false);
    assert_contains(&out, "if ($.get(item).value === 'a')");
    assert_contains(&out, "while ($.get(item).value === 'never')");
}

#[test]
fn throw_and_return_still_unwrap_each_item() {
    let src = each_item_handler("if (other) throw item.value;\n\t\treturn item.value;");
    let out = client(&src, false);
    assert_contains(&out, "throw $.get(item).value");
    assert_contains(&out, "return $.get(item).value");
}
