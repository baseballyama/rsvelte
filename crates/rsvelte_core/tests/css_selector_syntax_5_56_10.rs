//! Three CSS selector behaviours ported from Svelte 5.56.10.
//!
//! The upstream fixtures under `submodules/svelte` already cover all three, but
//! they only exist while the submodule sits on a version that ships them. These
//! assertions are crate-local, so a regression is caught on any submodule.
//!
//! - #18678 preserve namespaces in CSS type selectors
//! - #18667 preserve CSS escape sequences when printing selectors
//! - #18611 parse nth-child `of` syntax without whitespace after `of`

use rsvelte_core::compiler::CssMode;
use rsvelte_core::compiler::print::print_with_source;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};

fn css(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

fn printed(src: &str) -> String {
    let alloc = oxc_allocator::Allocator::default();
    let ast = parse(
        src,
        &alloc,
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse");
    print_with_source(&ast, None, Some(src))
        .expect("print")
        .code
}

fn css_ast(src: &str) -> serde_json::Value {
    let alloc = oxc_allocator::Allocator::default();
    let ast = parse(
        src,
        &alloc,
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse");
    serde_json::to_value(&ast.css).expect("serialize css")
}

/// Every `value` of a node of `kind`, in document order.
fn collect(node: &serde_json::Value, kind: &str, field: &str, out: &mut Vec<String>) {
    match node {
        serde_json::Value::Object(map) => {
            if map.get("type").and_then(serde_json::Value::as_str) == Some(kind)
                && let Some(v) = map.get(field).and_then(serde_json::Value::as_str)
            {
                out.push(v.to_string());
            }
            for v in map.values() {
                collect(v, kind, field, out);
            }
        }
        serde_json::Value::Array(items) => {
            for v in items {
                collect(v, kind, field, out);
            }
        }
        _ => {}
    }
}

fn nth_values(ast: &serde_json::Value) -> Vec<String> {
    let mut out = Vec::new();
    collect(ast, "Nth", "value", &mut out);
    out
}

fn class_names(ast: &serde_json::Value) -> Vec<String> {
    let mut out = Vec::new();
    collect(ast, "ClassSelector", "name", &mut out);
    out
}

/// The scoping class replaces a bare `*`, but a namespaced universal has to
/// keep its prefix — `svg|*` scoped as `.svelte-xyz` would match every element.
#[test]
fn a_namespaced_universal_selector_keeps_its_prefix_when_scoped() {
    let out = css("<svg><circle /></svg>\n\
         <style>\n\
         \t@namespace svg url(http://www.w3.org/2000/svg);\n\
         \tsvg|* { color: green; }\n\
         \t*|* { opacity: 0.5; }\n\
         </style>");

    assert!(
        out.contains("svg|*.svelte-"),
        "`svg|*` must survive scoping, got:\n{out}"
    );
    assert!(
        out.contains("*|*.svelte-"),
        "`*|*` must survive scoping, got:\n{out}"
    );
}

/// Control for the test above: a bare `*` is still *replaced* by the scoping
/// class rather than having it appended.
#[test]
fn a_bare_universal_selector_is_still_replaced_by_the_scoping_class() {
    let out = css("<p>x</p>\n<style>\n\t* { color: green; }\n</style>");
    assert!(
        !out.contains("*.svelte-"),
        "a bare `*` must be replaced, not appended to, got:\n{out}"
    );
    assert!(
        out.contains(".svelte-"),
        "expected a scoped rule in:\n{out}"
    );
}

/// `parse` decodes escape sequences into the name, and `print` re-escapes them
/// canonically — so the two spellings of the same identifier print alike.
#[test]
fn escape_sequences_print_canonically() {
    let out = printed(
        "<div></div>\n\n<style>\n\t#\\31\\32\\33 { color: green; }\n\t#\\31 23 { color: green; }\n</style>",
    );

    assert_eq!(
        out.matches("#\\31 23 {").count(),
        2,
        "both spellings of `123` must print as `#\\31 23`, got:\n{out}"
    );
    assert!(
        !out.contains("\\32"),
        "the decoded name must not be re-escaped digit by digit, got:\n{out}"
    );
}

/// A decoded backslash stays escaped, or the printed name would start a fresh
/// escape sequence instead of standing for one literal backslash.
#[test]
fn a_literal_backslash_in_a_name_stays_escaped() {
    let out = printed("<div></div>\n\n<style>\n\t.a\\5c b { color: red; }\n</style>");
    assert!(out.contains(".a\\\\b {"), "expected `.a\\\\b`, got:\n{out}");
}

/// Minifiers drop the space after `of`, since `.`, `#`, `[`, `*`, `:` and `&`
/// already end the identifier.
///
/// Asserted on the AST, not on printed output: the printer copies unescaped CSS
/// straight from the source, so a printed round-trip would pass even when the
/// whole argument was swallowed into the `Nth` value.
#[test]
fn nth_of_parses_without_whitespace_after_of() {
    let minified = css_ast("<style>\n\tli:nth-child(2n of.important) { color: red; }\n</style>");
    let spaced = css_ast("<style>\n\tli:nth-child(2n of .important) { color: red; }\n</style>");

    assert_eq!(nth_values(&minified), vec!["2n of".to_string()]);
    assert_eq!(class_names(&minified), vec!["important".to_string()]);

    // The spaced form keeps working, with the whitespace inside the Nth value.
    assert_eq!(nth_values(&spaced), vec!["2n of ".to_string()]);
    assert_eq!(class_names(&spaced), vec!["important".to_string()]);
}

/// What follows `of` is a selector *list*: only the first complex selector
/// carries the `Nth`.
#[test]
fn nth_of_accepts_a_selector_list() {
    let ast = css_ast("<style>\n\tli:nth-child(2n of.a, .b) { color: red; }\n</style>");

    assert_eq!(nth_values(&ast), vec!["2n of".to_string()]);
    assert_eq!(
        class_names(&ast),
        vec!["a".to_string(), "b".to_string()],
        "both complex selectors must survive"
    );
}

/// The three above assert on the AST, because the printer copies unscoped CSS
/// straight out of the source. The compiled stylesheet is a different path: it
/// rebuilds every selector it scopes, and each of these was lost in that rebuild
/// while the AST stayed correct — so they need their own assertions.
///
/// Every expectation here is the official 5.56.10 compiler's output for the same
/// input, not a transcription of what rsvelte happens to emit.
#[test]
fn a_scoped_pseudo_class_keeps_its_source_spelling() {
    // A selector list after `of` — rebuilding it from the AST concatenated the
    // children and produced `of.a.b`, because only the source carries the comma.
    let out =
        css("<style>\n\tli:nth-child(2n of.a, .b) { color: red; }\n</style><li class=\"a\"></li>");
    assert!(
        out.contains(":nth-child(2n of.a, .b)"),
        "the selector list after `of` must survive scoping, got:\n{out}"
    );
    assert!(
        !out.contains("of.a.b"),
        "the separator must not be dropped, got:\n{out}"
    );

    // An escape in the name — the parser decodes `\31 st-child` to `1st-child`,
    // which is a different selector when printed back undecorated.
    let out = css("<style>\n\t:\\31 st-child { color: red; }\n</style><div></div>");
    assert!(
        out.contains(":\\31 st-child"),
        "the escape must survive scoping, got:\n{out}"
    );
}

/// The scoping hash is a contract, not an internal detail: it is written into
/// both the stylesheet and the markup, so any drift from upstream's digest makes
/// every scoped rule miss. Upstream hashes UTF-16 code units (`charCodeAt`), so
/// an astral character contributes two surrogates — iterating Rust `char`s
/// diverges on exactly those inputs and nowhere else.
#[test]
fn the_scope_hash_counts_utf16_code_units() {
    use rsvelte_core::compiler::phases::phase3_transform::css::generate_raw_hash;

    // Values taken from the official compiler.
    assert_eq!(generate_raw_hash(".a🙂b { color: green; }"), "5fvur2");

    // The control: a BMP-only string hashes the same either way, so a test that
    // used one could not tell the two implementations apart.
    assert_eq!(generate_raw_hash(".ab { color: green; }"), "u92ct");
}
