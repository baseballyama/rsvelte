//! Regression tests for issue #2186 — a destructuring *assignment* whose
//! pattern is nested.
//!
//! Upstream's `visit_assignment_expression` (`shared/assignments.js`) builds the
//! lowering from `extract_paths`, whose `_extract_paths` (`utils/ast.js`)
//! recurses through every nested `ObjectPattern` / `ArrayPattern` /
//! `AssignmentPattern`, feeding each level's member access to the next as its
//! base expression. rsvelte expanded one level and left the sub-pattern as a
//! nested assignment, which the same transform then rewrote into a second
//! `(($$value) => …)($$value.a)` IIFE.
//!
//! The other half of the same upstream rule is the shape decision: the IIFE
//! exists only when there is an `$$array` helper or the right-hand side needs
//! caching (`should_cache = value.type !== 'Identifier'`, evaluated *after* the
//! RHS is visited, so a state / store / prop read counts as a call), and every
//! helper is emitted before every assignment.

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

/// Collapse the statement the printer spreads over several lines so a single
/// `assert!` can pin the whole lowering.
fn flat(code: &str) -> String {
    code.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn legacy(decls: &str, assignment: &str, template: &str) -> String {
    format!(
        "<script>\n\t{decls}\n\t$: {assignment}\n</script>\n<button onclick={{() => src++}}>{template}</button>"
    )
}

fn runes(decls: &str, body: &str, template: &str) -> String {
    format!(
        "<script>\n\t{decls}\n\tfunction go() {{\n\t\t{body}\n\t}}\n</script>\n<button onclick={{go}}>{template}</button>"
    )
}

/// The issue's shape: a state right-hand side is `$.get(src)` by the time
/// upstream decides on caching, so the value goes into `$$value` — and the leaf
/// reads its whole path off it, in *one* IIFE.
#[test]
fn nested_object_assignment_is_flat() {
    let src = legacy(
        "let src = { a: { b: 1 } };\n\tlet b = 0;",
        "({ a: { b } } = src);",
        "{b}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("(($$value) => { $.set(b, $$value.a.b); })($.get(src));"),
        "in:\n{out}"
    );
}

#[test]
fn nesting_recurses_to_any_depth() {
    let src = legacy(
        "let src = { a: { b: { c: 1 } } };\n\tlet c = 0;",
        "({ a: { b: { c } } } = src);",
        "{c}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("$.set(c, $$value.a.b.c);"), "in:\n{out}");
}

/// An identifier right-hand side needs no caching and an object pattern
/// contributes no helper, so upstream emits a plain sequence expression — the
/// leaf still carries its full path.
#[test]
fn an_identifier_rhs_lowers_to_a_sequence() {
    let src = runes(
        "let b = $state(0);\n\tconst src = { a: { b: 1 } };",
        "({ a: { b } } = src);",
        "{b}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("$.set(b, src.a.b, true);"), "in:\n{out}");
    assert!(!out.contains("$$value"), "in:\n{out}");
}

/// Every array pattern — at any depth — contributes one `$$array` helper, and
/// upstream emits all of them before any assignment, so a nested helper is
/// declared before the paths that read it.
#[test]
fn nested_array_helpers_are_hoisted_before_the_assignments() {
    let src = runes(
        "let a = $state(0);\n\tlet b = $state(0);\n\tlet c = $state(0);\n\tconst src = { x: [1, [2, 3]] };",
        "({ x: [a, [b, c]] } = src);",
        "{a}{b}{c}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains(
            "((src) => { var $$array = $.to_array(src.x, 2); \
             var $$array_1 = $.to_array($$array[1], 2); \
             $.set(a, $$array[0], true); \
             $.set(b, $$array_1[0], true); \
             $.set(c, $$array_1[1], true); })(src);"
        ),
        "in:\n{out}"
    );
}

/// A helper forces the IIFE form even for an identifier right-hand side, and
/// then the parameter is the identifier itself — upstream only caches in
/// `$$value` when the visited value is not an `Identifier`.
#[test]
fn an_identifier_rhs_stays_the_iife_parameter() {
    let src = runes(
        "let x = $state(0);\n\tlet y = $state(0);\n\tconst src = { a: [1, 2] };",
        "({ a: [x, y] } = src);",
        "{x}{y}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("((src) => { var $$array = $.to_array(src.a, 2);"),
        "in:\n{out}"
    );
}

/// A rest inside a nested object subtracts only that level's keys, from that
/// level's base.
#[test]
fn a_nested_rest_excludes_from_the_nested_base() {
    let src = runes(
        "let b = $state(0);\n\tlet r = $state({});\n\tconst src = { a: { b: 1, c: 2 } };",
        "({ a: { b, ...r } } = src);",
        "{b}{JSON.stringify(r)}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains(
            "$.set(b, src.a.b, true), \
             $.set(r, $.exclude_from_object(src.a, ['b']), true);"
        ),
        "in:\n{out}"
    );
}

/// A default *inside* a nested pattern wraps only that leaf; a default *on* a
/// nested pattern becomes the base the whole sub-pattern reads from — which is
/// also the shape whose inner `} = …` used to be mistaken for an assignment of
/// its own.
#[test]
fn defaults_nest_on_both_sides() {
    let leaf = runes(
        "let b = $state(0);\n\tconst src = { a: {} };",
        "({ a: { b = 5 } } = src);",
        "{b}",
    );
    let out = flat(&compile_client(&leaf, false));
    assert!(
        out.contains("$.set(b, $.fallback(src.a.b, 5), true);"),
        "in:\n{out}"
    );

    let pattern = runes(
        "let b = $state(0);\n\tconst src = {};",
        "({ a: { b } = { b: 3 } } = src);",
        "{b}",
    );
    let out = flat(&compile_client(&pattern, false));
    assert!(
        out.contains("$.set(b, $.fallback(src.a, () => ({ b: 3 }), true).b, true);"),
        "in:\n{out}"
    );
}

/// An array rest whose target is itself a pattern recurses instead of binding a
/// name — upstream's `element.argument.type !== 'Identifier'` branch.
#[test]
fn an_array_rest_target_can_be_a_pattern() {
    let src = runes(
        "let a = $state(0);\n\tlet b = $state(0);\n\tconst src = [1, 2];",
        "[...[a, b]] = src;",
        "{a}{b}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains(
            "var $$array = $.to_array(src); \
             var $$array_1 = $.to_array($$array.slice(0), 2);"
        ),
        "in:\n{out}"
    );
}

/// A trailing comma is not an elision, so it must not inflate the `$.to_array`
/// arity — while a real elision still advances the index.
#[test]
fn elisions_and_trailing_commas_keep_upstream_arity() {
    let src = runes(
        "let a = $state(0);\n\tconst src = [{ a: 1 }];",
        "[{ a }, ] = src;",
        "{a}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("$.to_array(src, 1);"), "in:\n{out}");

    let src = runes(
        "let a = $state(0);\n\tlet b = $state(0);\n\tconst src = [0, { a: 1 }, 0, [2]];",
        "[, { a }, , [b]] = src;",
        "{a}{b}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(out.contains("$.to_array(src, 4);"), "in:\n{out}");
    assert!(out.contains("$.set(a, $$array[1].a, true);"), "in:\n{out}");
}

/// Part of a larger expression: the lowering still has to evaluate to the
/// right-hand side.
#[test]
fn a_non_standalone_nested_assignment_still_yields_the_value() {
    let src = runes(
        "let a = $state(0);\n\tlet out = $state(null);\n\tconst src = { x: { a: 1 } };",
        "out = ({ x: { a } } = src);",
        "{a}{out}",
    );
    let out = flat(&compile_client(&src, false));
    assert!(
        out.contains("$.set(out, ($.set(a, src.x.a, true), src), true);"),
        "in:\n{out}"
    );
}

/// A store target is written with `$.store_set` in the sequence form, where no
/// later statement-level transform could reach it.
#[test]
fn a_nested_store_target_is_lowered_in_the_sequence() {
    let src = r#"<script>
	import { writable } from 'svelte/store';
	const a = writable(0);
	const src = { o: { a: 1 } };
	function go() {
		({ o: { a: $a } } = src);
	}
</script>
<button onclick={go}>{$a}</button>"#;
    let out = flat(&compile_client(src, false));
    assert!(out.contains("$.store_set(a, src.o.a);"), "in:\n{out}");
}

/// The nested leaf is labelled in dev exactly like a flat one.
#[test]
fn the_dev_lowering_is_the_same_shape() {
    let src = legacy(
        "let src = { a: { b: 1 } };\n\tlet b = 0;",
        "({ a: { b } } = src);",
        "{b}",
    );
    let out = flat(&compile_client(&src, true));
    assert!(
        out.contains("(($$value) => { $.set(b, $$value.a.b); })($.get(src));"),
        "in:\n{out}"
    );
}
