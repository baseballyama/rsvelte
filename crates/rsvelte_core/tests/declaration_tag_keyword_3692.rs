//! Regression tests for #3692 — which leading word routes a `{…}` to the
//! DECLARATION reader.
//!
//! Upstream keys on three literal sticky regexes
//! (`phases/1-parse/state/tag.js:14-17`):
//!
//! ```js
//! const regex_supported_declaration = /(?:let|const)\b/y;
//! const regex_unsupported_declaration = /(?:var|interface|enum)\b/y;
//! const regex_maybe_type_declaration = /type\b/y;
//! ```
//!
//! rsvelte had the same three sets but required **whitespace** after the
//! keyword instead of a word boundary, with a comment claiming the two
//! "reach the same result for every real-world tag". They do not: `{var}`,
//! `{var.x}`, `{var(1)}` and `{var;}` all missed the reader and compiled.
//!
//! The keyword sets need TWO boundary rules rather than one, and which rule
//! applies is decided by where upstream stops. The unsupported set throws from
//! the regex match itself, so its boundary is the regex word class
//! `[A-Za-z0-9_]` — `$` is outside it, and `{var$x}` is therefore rejected
//! although `var$x` is a legal identifier
//! (`upstream_issues/svelte-declaration-tag-dollar-identifier.md`). The other
//! two are confirmed by `parse_statement_at`, which reads `let$x` as one
//! identifier and hands the `ExpressionStatement` back to the expression-tag
//! reader — so their boundary is the identifier class.
//!
//! The `type` row went the other way: rsvelte reached
//! `declaration_tag_invalid_type` from a structural shape test, where upstream
//! reaches it only through the parse — so in a plain `<script>`, where a type
//! alias is not JavaScript, the error is `js_parse_error`.

use rsvelte_core::compiler::CompileError;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code_of(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

fn verdict(src: &str) -> Result<(), String> {
    code_of(src).map(|_| ())
}

const HEAD: &str = "<script>\n\tconst obj = { a: 1, x: 2 };\n</script>\n";

/// The three unsupported keywords reach the reader after ANY word boundary, not
/// only whitespace. The tail axis is what separates `\b` from "a space".
#[test]
fn an_unsupported_keyword_is_rejected_after_any_word_boundary() {
    for word in ["var", "interface", "enum"] {
        for tail in ["", ".x", "(1)", ";", " a = 1"] {
            let src = format!("{HEAD}{{{word}{tail}}}\n");
            let err = verdict(&src).expect_err("must be rejected");
            assert!(
                err.contains("declaration_tag_invalid_type"),
                "{word}{tail}: {err}"
            );
        }
    }
}

/// The control that makes the boundary rule falsifiable: an identifier that
/// merely STARTS with one of the keywords is not a declaration. Change one
/// character and the verdict has to flip.
#[test]
fn an_identifier_that_starts_with_a_keyword_is_not_a_declaration() {
    const NAMES: [&str; 6] = [
        "variable",
        "constant",
        "letter",
        "enumerate",
        "typed",
        "interfaces",
    ];
    for name in NAMES {
        let src = format!("<script>\n\tconst {name} = 1;\n</script>\n{{{name}}}\n");
        verdict(&src).unwrap_or_else(|e| panic!("{name} rejected: {e}"));
    }
}

/// `_` is a JS word character and `$` is not, so `{var_x}` is an expression and
/// `{var$x}` is read as a declaration — even though both are legal identifiers.
/// The second row reproduces an upstream defect on purpose; byte parity is the
/// gate, and the report is in `upstream_issues/`.
#[test]
fn the_word_class_is_the_regex_one_not_the_identifier_one() {
    let underscore = "<script>\n\tconst var_x = 1;\n</script>\n{var_x}\n";
    verdict(underscore).expect("`_` is a word char, so `\\b` does not match");

    let dollar = "<script>\n\tconst var$x = 1;\n</script>\n{var$x}\n";
    let err = verdict(dollar).expect_err("upstream reads this as a `var` declaration");
    assert!(err.contains("declaration_tag_invalid_type"), "{err}");

    // Only the UNSUPPORTED keywords are affected: upstream consults the
    // supported and `type` regexes after that throw, so these still compile.
    for name in ["let$x", "const$x", "type$x"] {
        let src = format!("<script>\n\tconst {name} = 1;\n</script>\n{{{name}}}\n");
        verdict(&src).unwrap_or_else(|e| panic!("{name} rejected: {e}"));
    }
}

/// This one guards the fix against its own first version rather than against
/// the old behaviour. Spelling both boundaries as the regex word class — the
/// obvious single rule — leaves `{let$x = 1}` accepted by both compilers and
/// meaning two different things: official assigns to a global named `let$x`,
/// rsvelte declares a template variable `$x`. No verdict comparison can see
/// that, only the emitted code, and a build of that version reproduces it.
#[test]
fn a_dollar_after_the_keyword_is_an_assignment_not_a_declaration() {
    let code = code_of("<script>\n\tlet q = 1;\n</script>\n{let$x = 1}\n")
        .expect("official reads this as an expression tag");
    assert!(
        code.contains("let$x"),
        "the identifier must survive whole:\n{code}"
    );
}

/// A type alias only exists in TypeScript. The same source in the two script
/// languages is the whole test — one input, two verdicts.
#[test]
fn a_type_alias_is_a_declaration_only_in_typescript() {
    let ts = "<script lang=\"ts\">\n\tlet q = 1;\n</script>\n{type a = 1}\n";
    let err = verdict(ts).expect_err("a TS type alias is not a declaration tag");
    assert!(err.contains("declaration_tag_invalid_type"), "{err}");

    let js = "<script>\n\tlet q = 1;\n</script>\n{type a = 1}\n";
    let err = verdict(js).expect_err("`type a = 1` is not JavaScript");
    assert!(
        err.contains("js_parse_error"),
        "expected the JS parse error, got: {err}"
    );
}

/// Routing `{let}` and `{const}` into the reader made their `js_parse_error`
/// positions observable, and the two keywords disagree — `let` is not reserved
/// in sloppy mode, so acorn rejects a bare one for being a declaration it cannot
/// finish and reports AT the keyword, while `const` is reserved, consumed, and
/// fails at the `}` after it. Both expectations are the official compiler's
/// byte-exact `start` (v5.56.9); a single rule for the pair cannot satisfy both.
#[test]
fn a_keyword_only_declaration_reports_where_acorn_stops() {
    let head = "<script>\n\tlet q = 1;\n</script>\n";
    let brace = head.len();
    for (word, expected) in [("let", brace + 1), ("const", brace + 1 + 5)] {
        let src = format!("{head}{{{word}}}\n");
        let err = compile(
            &src,
            CompileOptions {
                filename: Some("X.svelte".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .expect_err("must be rejected");
        let CompileError::Parse(parse) = &err else {
            panic!("{word}: expected a parse error: {err:?}")
        };
        assert!(format!("{parse:?}").contains("js_parse_error"), "{word}");
        assert_eq!(parse.span().0, expected, "{word}");
    }
}

/// The supported keywords must still open a declaration tag, and `{type}` as a
/// bare identifier must still be an expression — the two directions a boundary
/// change is most likely to break.
#[test]
fn the_supported_declarations_are_unchanged() {
    for body in ["{const c = 1}", "{let v = 2}"] {
        let src = format!("{HEAD}{{#if true}}{body}<span>ok</span>{{/if}}\n");
        verdict(&src).unwrap_or_else(|e| panic!("{body} rejected: {e}"));
    }
    verdict("<script>\n\tconst type = 1;\n</script>\n{type}\n")
        .expect("a bare `type` is an ordinary identifier");
}
