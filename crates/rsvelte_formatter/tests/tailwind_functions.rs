//! `sortTailwindcss.functions` traversal scope in the native `.svelte` path.
//!
//! These use a deterministic *fake* class sorter (lexicographic) so they assert
//! exactly **which** literals are routed to the sorter — independent of the real
//! Tailwind order. The byte-for-byte match against the oxfmt +
//! prettier-plugin-tailwindcss oracle lives in `rsvelte_fmt`'s CLI tests.

use std::sync::Arc;

use rsvelte_formatter::{ClassSorter, FormatOptions, format};

/// Sort whitespace-separated tokens lexicographically — a stand-in for the
/// Tailwind sorter, so `"b a"` → `"a b"` deterministically.
fn fake_sorter() -> ClassSorter {
    Arc::new(|s: &str| {
        let mut tokens: Vec<&str> = s.split_whitespace().collect();
        tokens.sort_unstable();
        tokens.join(" ")
    })
}

fn opts(functions: &[&str]) -> FormatOptions {
    FormatOptions {
        class_sorter: Some(fake_sorter()),
        class_attributes: vec!["class".to_string()],
        tailwind_functions: functions.iter().map(|s| s.to_string()).collect(),
        ..FormatOptions::default()
    }
}

fn fmt(src: &str, functions: &[&str]) -> String {
    format(src, &opts(functions)).expect("format ok")
}

// ─── Script `functions` calls ────────────────────────────────────────────

#[test]
fn script_matched_call_sorts_string_arg() {
    let out = fmt("<script>\n  const a = cn(\"b a\");\n</script>\n", &["cn"]);
    assert!(out.contains("cn(\"a b\")"), "{out}");
}

#[test]
fn script_unmatched_call_is_untouched() {
    let out = fmt(
        "<script>\n  const a = notcn(\"b a\");\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("notcn(\"b a\")"), "{out}");
}

#[test]
fn script_nested_unmatched_call_is_not_sorted() {
    // The outer `cn` matches, but the descent stops at the nested `notcn`.
    let out = fmt(
        "<script>\n  const a = cn(\"b a\", notcn(\"d c\"));\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("cn(\"a b\", notcn(\"d c\"))"), "{out}");
}

#[test]
fn script_nested_matched_call_is_sorted() {
    let out = fmt(
        "<script>\n  const a = cn(\"b a\", clsx(\"d c\"));\n</script>\n",
        &["cn", "clsx"],
    );
    assert!(out.contains("cn(\"a b\", clsx(\"c d\"))"), "{out}");
}

#[test]
fn script_sorts_object_keys_and_nested_containers() {
    let out = fmt(
        "<script>\n  const a = cn({ \"b a\": x }, [\"d c\"]);\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("\"a b\": x"), "key not sorted:\n{out}");
    assert!(out.contains("[\"c d\"]"), "array elem not sorted:\n{out}");
}

#[test]
fn script_sorts_plain_template_literal() {
    let out = fmt("<script>\n  const a = cn(`b a`);\n</script>\n", &["cn"]);
    assert!(out.contains("cn(`a b`)"), "{out}");
}

#[test]
fn script_sorts_substitution_template_quasi() {
    let out = fmt(
        "<script>\n  const a = cn(`b a ${x}`);\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("cn(`a b ${x}`)"), "{out}");
}

#[test]
fn script_pins_token_abutting_interpolation() {
    // No whitespace at the `${…}` boundary pins the abutting token: `b` stays
    // last in quasi 0 (`c a b` → `a c b`) and `f` stays first in quasi 1
    // (`f e d` → `f d e`).
    let out = fmt(
        "<script>\n  const a = cn(`c a b${x}f e d`);\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("cn(`a c b${x}f d e`)"), "{out}");
}

#[test]
fn script_sorts_each_quasi_with_boundary_whitespace() {
    let out = fmt(
        "<script>\n  const a = cn(`c a b ${x} f e d`);\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("cn(`a b c ${x} d e f`)"), "{out}");
}

#[test]
fn script_sorts_multi_substitution_template() {
    let out = fmt(
        "<script>\n  const a = cn(`c a ${x} f e ${y} i g`);\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("cn(`a c ${x} e f ${y} g i`)"), "{out}");
}

#[test]
fn script_unmatched_substitution_template_is_untouched() {
    let out = fmt(
        "<script>\n  const a = notcn(`b a ${x}`);\n</script>\n",
        &["cn"],
    );
    assert!(out.contains("notcn(`b a ${x}`)"), "{out}");
}

#[test]
fn class_mustache_sorts_substitution_template() {
    let out = fmt("<div class={`c a b ${x}`}></div>\n", &[]);
    assert!(out.contains("class={`a b c ${x}`}"), "{out}");
}

#[test]
fn script_member_callee_is_not_matched() {
    // oxfmt matches only a bare identifier callee, not `tw.foo(...)`.
    let out = fmt(
        "<script>\n  const a = tw.foo(\"b a\");\n</script>\n",
        &["tw"],
    );
    assert!(out.contains("tw.foo(\"b a\")"), "{out}");
}

#[test]
fn script_without_functions_config_is_untouched() {
    let out = fmt("<script>\n  const a = cn(\"b a\");\n</script>\n", &[]);
    assert!(out.contains("cn(\"b a\")"), "{out}");
}

// ─── `class` mustache values (not function-gated) ─────────────────────────

#[test]
fn class_mustache_sorts_call_arg() {
    let out = fmt("<div class={cn(\"b a\")}></div>\n", &["cn"]);
    assert!(out.contains("class={cn(\"a b\")}"), "{out}");
}

#[test]
fn class_mustache_sorts_regardless_of_function_name() {
    // The class mustache sorts every literal, matched function or not.
    let out = fmt("<div class={notcn(\"b a\")}></div>\n", &[]);
    assert!(out.contains("class={notcn(\"a b\")}"), "{out}");
}

#[test]
fn class_mustache_sorts_deeply_nested_calls() {
    let out = fmt("<div class={foo(bar(\"b a\"))}></div>\n", &[]);
    assert!(out.contains("class={foo(bar(\"a b\"))}"), "{out}");
}

#[test]
fn class_mustache_sorts_ternary_branches() {
    let out = fmt("<div class={cond ? \"b a\" : x}></div>\n", &[]);
    assert!(out.contains("class={cond ? \"a b\" : x}"), "{out}");
}

#[test]
fn class_directive_is_not_a_class_attribute() {
    // `class:foo={...}` is a directive, not the `class` attribute — untouched.
    let out = fmt("<div class:foo={cn(\"b a\")}></div>\n", &["cn"]);
    assert!(out.contains("class:foo={cn(\"b a\")}"), "{out}");
}

#[test]
fn standalone_mustache_is_untouched() {
    let out = fmt("<p>{cn(\"b a\")}</p>\n", &["cn"]);
    assert!(out.contains("{cn(\"b a\")}"), "{out}");
}

#[test]
fn non_class_attribute_expression_is_untouched() {
    let out = fmt("<div data-x={cn(\"b a\")}></div>\n", &["cn"]);
    assert!(out.contains("data-x={cn(\"b a\")}"), "{out}");
}

#[test]
fn sorting_off_without_class_sorter() {
    let out = format(
        "<script>\n  const a = cn(\"b a\");\n</script>\n<div class={cn(\"b a\")}></div>\n",
        &FormatOptions::default(),
    )
    .expect("format ok");
    assert!(
        out.contains("cn(\"b a\")"),
        "no sorting without a sorter:\n{out}"
    );
}
