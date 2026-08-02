//! Regression tests for issue #2139 — a legacy (non-runes) declaration whose
//! destructuring pattern is *nested*.
//!
//! Upstream's `create_state_declarators` (`client/visitors/VariableDeclaration.js`)
//! builds the expansion from `extract_paths`, whose `_extract_paths`
//! (`utils/ast.js`) recurses through every nested `ObjectPattern` /
//! `ArrayPattern` / `AssignmentPattern`, feeding each level's member access to
//! the next as its base expression. rsvelte's expansion was single-level, so
//! `let { a: { b } } = obj` was left verbatim and the nested state leaf never
//! got its `$.mutable_source` (nor the dev `$.tag` label).
//!
//! Each array pattern — at any depth — also contributes a `$$array` insert, and
//! upstream emits every insert *before* every path, so a nested array helper is
//! declared before the leaves that read it.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Collapse the declaration the printer spreads over several lines so a single
/// `assert!` can pin the whole expansion.
fn flat(code: &str) -> String {
    code.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn component(decl: &str, body: &str, template: &str) -> String {
    format!(
        "<script>\n\t{decl}\n\tfunction f() {{\n\t\t{body}\n\t}}\n</script>\n<button onclick={{f}}>{template}</button>"
    )
}

const OBJECT_IN_OBJECT: &str = "let { a: { b } } = { a: { b: 1 } };";

#[test]
fn nested_object_leaf_gets_a_mutable_source() {
    let src = component(OBJECT_IN_OBJECT, "b++;", "{b}");
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("let tmp = { a: { b: 1 } }, b = $.mutable_source(tmp.a.b);"),
        "in:\n{out}"
    );
}

#[test]
fn nested_object_leaf_is_labelled_in_dev() {
    let src = component(OBJECT_IN_OBJECT, "b++;", "{b}");
    let out = flat(&compile_client(&src, true));
    assert!(
        out.contains("b = $.tag($.mutable_source(tmp.a.b), 'b')"),
        "in:\n{out}"
    );
}

#[test]
fn nesting_recurses_to_any_depth() {
    let src = component(
        "let { a: { b: { c } } } = { a: { b: { c: 1 } } };",
        "c++;",
        "{c}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("c = $.mutable_source(tmp.a.b.c)"),
        "in:\n{out}"
    );
}

/// A non-state sibling keeps the same full path, just without the wrapper.
#[test]
fn non_state_siblings_keep_the_full_path() {
    let src = component(
        "let { a: { b, c } } = { a: { b: 1, c: 2 } };",
        "b++;",
        "{b}{c}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("b = $.mutable_source(tmp.a.b), c = tmp.a.c"),
        "in:\n{out}"
    );
}

/// Every array pattern contributes one `$$array` insert, and upstream emits all
/// inserts before all paths — so a nested helper reads the outer one through
/// `$.get(...)`, exactly like a top-level one.
#[test]
fn nested_array_patterns_each_get_their_own_helper() {
    let src = component("let [[a, b]] = [[1, 2]];", "a++;", "{a}{b}");
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains(
            "let tmp = [[1, 2]], $$array = $.derived(() => $.to_array(tmp, 1)), \
             $$array_1 = $.derived(() => $.to_array($.get($$array)[0], 2)), \
             a = $.mutable_source($.get($$array_1)[0]), b = $.get($$array_1)[1];"
        ),
        "in:\n{out}"
    );
}

#[test]
fn an_array_pattern_nested_in_an_object_pattern_reads_the_member() {
    let src = component("let { a: [b, c] } = { a: [1, 2] };", "b++;", "{b}{c}");
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains(
            "$$array = $.derived(() => $.to_array(tmp.a, 2)), \
             b = $.mutable_source($.get($$array)[0]), c = $.get($$array)[1];"
        ),
        "in:\n{out}"
    );
}

/// A default *inside* a nested pattern wraps only that leaf; a default *on* a
/// nested pattern wraps the base the whole sub-pattern reads from.
#[test]
fn defaults_nest_on_both_sides() {
    let leaf = component("let { a: { b = 5 } } = { a: {} };", "b++;", "{b}");
    let out = flat(&compile_client(&leaf, false));
    assert!(
        out.contains("b = $.mutable_source($.fallback(tmp.a.b, 5))"),
        "in:\n{out}"
    );

    let pattern = component("let { a: { b } = { b: 3 } } = {};", "b++;", "{b}");
    let out = flat(&compile_client(&pattern, false));
    assert!(
        out.contains("b = $.mutable_source($.fallback(tmp.a, () => ({ b: 3 }), true).b)"),
        "in:\n{out}"
    );
}

/// A rest inside a nested object subtracts only that level's keys, from that
/// level's base.
#[test]
fn a_nested_rest_excludes_from_the_nested_base() {
    let src = component(
        "let { a: { b, ...r } } = { a: { b: 1, c: 2 } };",
        "b++;",
        "{b}{JSON.stringify(r)}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("b = $.mutable_source(tmp.a.b), r = $.exclude_from_object(tmp.a, ['b'])"),
        "in:\n{out}"
    );
}

/// An array rest whose target is itself a pattern recurses instead of binding a
/// name — upstream's `element.argument.type !== 'Identifier'` branch.
#[test]
fn an_array_rest_target_can_be_a_pattern() {
    let src = component("let [...[a, b]] = [1, 2];", "a++;", "{a}{b}");
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains(
            "$$array = $.derived(() => $.to_array(tmp)), \
             $$array_1 = $.derived(() => $.to_array($.get($$array).slice(0), 2)), \
             a = $.mutable_source($.get($$array_1)[0])"
        ),
        "in:\n{out}"
    );
}

/// Computed and literal keys keep bracket notation at every depth.
#[test]
fn nested_computed_and_literal_keys_use_bracket_access() {
    let src = component(
        "const k = 'x';\n\tlet { a: { [k]: v, 'q-r': qr, 3: three } } = { a: {} };",
        "v++;",
        "{v}{qr}{three}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("v = $.mutable_source(tmp.a[k])"), "in:\n{out}");
    assert!(out.contains("qr = tmp.a['q-r']"), "in:\n{out}");
    assert!(out.contains("three = tmp.a[3]"), "in:\n{out}");
}

/// A trailing comma is not an elision, so it must not inflate the `$.to_array`
/// arity — while a real elision still advances the index.
#[test]
fn elisions_and_trailing_commas_keep_upstream_arity() {
    let src = component("let [{ a }, ] = [{ a: 1 }];", "a++;", "{a}");
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("$.to_array(tmp, 1)"), "in:\n{out}");

    let src = component(
        "let [, { a }, , [b]] = [0, { a: 1 }, 0, [2]];",
        "a++;",
        "{a}{b}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("$.to_array(tmp, 4)"), "in:\n{out}");
    assert!(
        out.contains("a = $.mutable_source($.get($$array)[1].a)"),
        "in:\n{out}"
    );
    assert!(
        out.contains("$$array_1 = $.derived(() => $.to_array($.get($$array)[3], 1))"),
        "in:\n{out}"
    );
}
