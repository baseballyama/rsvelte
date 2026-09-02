//! A destructured `export let` reads each property through its key, and a rest
//! element reads what the siblings did not take.
//!
//! Upstream's `_extract_paths` (`utils/ast.js`) builds the rest as
//! `$.exclude_from_object(expression, [keys])` and each property as
//! `b.member(expression, prop.key, prop.computed || key.type !== 'Identifier')`.
//! rsvelte's text port re-destructured for the rest, and spelled every key as a
//! dot access — so a string, numeric or computed key emitted `tmp.'a-b'`,
//! `tmp.0`, `tmp.[k]`: text no JS parser accepts.
//!
//! One cell per key kind, crossed with whether the pattern has a rest element,
//! because the two mechanisms are reached by different branches of the same
//! loop. Every expectation is the official compiler's output for the same
//! source (`submodules/svelte`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("p.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn component(pattern: &str) -> String {
    format!("<script>\n  const k = 'kk';\n  export let {pattern} = $$props;\n</script>\n\n{{x}}\n")
}

/// `x = $.prop($$props, 'x', 24, () => <access>)` for the cell's key.
fn access_line(pattern: &str) -> String {
    let out = code(&component(pattern));
    out.lines()
        .map(str::trim)
        .find(|l| l.starts_with("x = $.prop($$props, 'x'"))
        .unwrap_or_else(|| panic!("no `x` prop declarator in:\n{out}"))
        .trim_end_matches([',', ';'])
        .to_string()
}

#[test]
fn a_non_identifier_key_reads_through_a_bracket() {
    let cells: &[(&str, &str)] = &[
        ("{ ab: x, c }", "x = $.prop($$props, 'x', 24, () => tmp.ab)"),
        (
            "{ 'a-b': x, c }",
            "x = $.prop($$props, 'x', 24, () => tmp['a-b'])",
        ),
        (
            "{ \"a b\": x, c }",
            "x = $.prop($$props, 'x', 24, () => tmp[\"a b\"])",
        ),
        ("{ 0: x, c }", "x = $.prop($$props, 'x', 24, () => tmp[0])"),
        (
            "{ [k]: x, c }",
            "x = $.prop($$props, 'x', 24, () => tmp[k])",
        ),
    ];
    let mut bad = Vec::new();
    for (pattern, expected) in cells {
        let got = access_line(pattern);
        if got != *expected {
            bad.push(format!(
                "{pattern}\n  expected {expected}\n  got      {got}"
            ));
        }
    }
    assert!(bad.is_empty(), "{}", bad.join("\n"));
}

/// The same five keys with a rest element: the access must not change, and the
/// key must reach the exclusion list in the spelling upstream gives it — a
/// literal for an identifier, string or numeric key, `String(...)` for a
/// computed one.
#[test]
fn a_rest_element_excludes_its_siblings_by_key() {
    let cells: &[(&str, &str)] = &[
        ("{ ab: x, c, ...rest }", "['ab', 'c']"),
        ("{ 'a-b': x, c, ...rest }", "['a-b', 'c']"),
        ("{ \"a b\": x, c, ...rest }", "['a b', 'c']"),
        ("{ 0: x, c, ...rest }", "['0', 'c']"),
        ("{ [k]: x, c, ...rest }", "[String(k), 'c']"),
        ("{ ...rest }", "[]"),
        ("{ a = 1, b, ...rest }", "['a', 'b']"),
        ("{ a: { b }, c, ...rest }", "['a', 'c']"),
    ];
    let mut bad = Vec::new();
    for (pattern, keys) in cells {
        let expected =
            format!("rest = $.prop($$props, 'rest', 24, () => $.exclude_from_object(tmp, {keys}))");
        let out = code(&component(pattern));
        let got = out
            .lines()
            .map(str::trim)
            .find(|l| l.starts_with("rest = $.prop($$props, 'rest'"))
            .unwrap_or_else(|| panic!("no `rest` prop declarator for {pattern} in:\n{out}"))
            .trim_end_matches([',', ';'])
            .to_string();
        if got != expected {
            bad.push(format!(
                "{pattern}\n  expected {expected}\n  got      {got}"
            ));
        }
    }
    assert!(bad.is_empty(), "{}", bad.join("\n"));
}

/// The shape the corpus carries (`huly/…/TrainingRequestDueDateEditor.svelte`):
/// three shorthand siblings and a rest, which is the cell that was reported.
#[test]
fn the_reported_shape_matches_official() {
    let out = code(&component(
        "{ value, onChange, shouldIgnoreOverdue, ...rest }",
    ));
    assert!(
        out.contains(
            "rest = $.prop($$props, 'rest', 24, () => $.exclude_from_object(tmp, ['value', 'onChange', 'shouldIgnoreOverdue']))"
        ),
        "{out}"
    );
}

/// An array pattern's rest is `.slice(n)` and was already right — the arm that
/// reports the object fix reaching a branch it does not own.
#[test]
fn an_array_rest_still_slices() {
    let out = code(&component("[x, ...rest]"));
    assert!(
        out.contains(".slice(1)") && !out.contains("exclude_from_object"),
        "{out}"
    );
}
