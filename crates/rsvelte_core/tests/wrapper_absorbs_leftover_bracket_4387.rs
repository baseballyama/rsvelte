//! #3350's rule — acorn parses ONE maximal expression and whatever is left over
//! is `expected_token` at that token, everything else `js_parse_error` at
//! `err.pos` — held for every leftover token except a **closing bracket the
//! probe's own wrapper can consume**. `trailing_token_offset` wrapped the body
//! in `(…)`, so `{a)}` read as the complete `(a)` followed by the probe's own
//! `)`: the leftover moved past the end of the content and the classification
//! fell through to `js_parse_error`, at a column that exists only in the
//! wrapper. `a]` was already right, and that is the discriminating control —
//! the axis is not "a leftover bracket" but "a leftover bracket THIS wrapper
//! closes", so the probe now runs with both bracket pairs and each covers the
//! other's blind spot.
//!
//! The second half is the message. An expression that runs out of input has no
//! offending token for acorn to name, so `parseExpressionAt` reports
//! `Unexpected token` at the end; OXC names the delimiter it wanted
//! (``Expected `)` but found `EOF` ``). The position already agreed.
//!
//! Every expectation is `svelte.compile`'s own answer at `VERSION === '5.57.0'`,
//! read out of the pinned submodule — code, first message line, and 1-based
//! line / 0-based column — not written by hand.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `(body, code, message, line, column)`; `code == ""` means the source compiles.
#[rustfmt::skip]
const CELLS: &[(&str, &str, &str, usize, usize)] = &[
    // Leftover input after a complete expression: `expected_token` at the leftover.
    ("a b",       "expected_token", "Expected token }", 2, 6),
    ("a;",        "expected_token", "Expected token }", 2, 5),
    ("a]",        "expected_token", "Expected token }", 2, 5),
    ("a)",        "expected_token", "Expected token }", 2, 5),
    ("a))",       "expected_token", "Expected token }", 2, 5),
    ("a)]",       "expected_token", "Expected token }", 2, 5),
    // The expression itself is broken: `js_parse_error` where acorn stopped.
    ("a +",       "js_parse_error", "Unexpected token", 2, 7),
    (")",         "js_parse_error", "Unexpected token", 2, 4),
    ("a,",        "js_parse_error", "Unexpected token", 2, 6),
    ("a=>",       "js_parse_error", "Unexpected token", 2, 7),
    ("a.",        "js_parse_error", "Unexpected token", 2, 6),
    ("a??",       "js_parse_error", "Unexpected token", 2, 7),
    // The wrapper's own `)` consumed by an unbalanced opener in the body: OXC
    // names the delimiter it wanted, acorn has no token to name.
    ("(a",        "js_parse_error", "Unexpected token", 2, 6),
    ("((a",       "js_parse_error", "Unexpected token", 2, 7),
    ("f(a",       "js_parse_error", "Unexpected token", 2, 7),
    ("f(a,",      "js_parse_error", "Unexpected token", 2, 8),
    ("new Map(",  "js_parse_error", "Unexpected token", 2, 12),
    ("a.b(",      "js_parse_error", "Unexpected token", 2, 8),
    ("function(", "js_parse_error", "Unexpected token", 2, 13),
    // The one body that is not an error at all.
    ("a}",        "",               "",                0, 0),
];

fn source(body: &str) -> String {
    format!("<script>let a;</script>\n<p>{{{body}}}</p>")
}

/// `(code, message, line, column)` for a body, or `None` when it compiles.
fn diagnose(body: &str) -> Option<(String, String, usize, usize)> {
    let src = source(body);
    let error = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()?;
    // `compile` hands back an opaque error; its Debug repr is the only place the
    // code, the message and the byte span are all available together.
    let debug = format!("{error:?}");
    let field = |name: &str| -> String {
        debug
            .split(&format!("{name}: \""))
            .nth(1)
            .and_then(|rest| rest.split('"').next())
            .unwrap_or_default()
            .to_string()
    };
    let offset: usize = debug
        .split("span: (")
        .nth(1)
        .and_then(|rest| rest.split(',').next())
        .and_then(|n| n.trim().parse().ok())
        .unwrap_or_else(|| panic!("no span in {debug}"));
    let before = &src[..offset.min(src.len())];
    let line = before.matches('\n').count() + 1;
    let column = before.len() - before.rfind('\n').map_or(0, |i| i + 1);
    Some((field("code"), field("message"), line, column))
}

#[test]
fn every_cell_matches_the_official_compiler() {
    for (body, code, message, line, column) in CELLS {
        match diagnose(body) {
            None => assert_eq!(*code, "", "{body:?} compiled; expected `{code}`"),
            Some(actual) => assert_eq!(
                (actual.0.as_str(), actual.1.as_str(), actual.2, actual.3),
                (*code, *message, *line, *column),
                "{body:?}"
            ),
        }
    }
}

/// The grid is only evidence about the classification if it holds every verdict:
/// a build that answered `js_parse_error` for everything, or `expected_token`
/// for everything, or rejected everything, must each fail here.
#[test]
fn the_grid_holds_all_three_verdicts() {
    let count = |code: &str| CELLS.iter().filter(|c| c.1 == code).count();
    assert!(count("expected_token") >= 2, "no leftover-token rows");
    assert!(count("js_parse_error") >= 2, "no broken-expression rows");
    assert_eq!(count(""), 1, "the compiling control is missing");
}

/// `a]` and `a)` are the same rule and differ only in which bracket the probe's
/// own wrapper closes, so a wrapper that is blind to one of them still passes a
/// grid holding only the other.
#[test]
fn both_bracket_shapes_are_present_in_the_leftover_rows() {
    let leftover = |b: &str| CELLS.iter().any(|c| c.0 == b && c.1 == "expected_token");
    assert!(leftover("a]"), "the square-bracket leftover row is missing");
    assert!(leftover("a)"), "the round-bracket leftover row is missing");
}

/// The boundary of this fix, measured rather than assumed. A leftover `)` the
/// wrapper cannot reach — because an opener in the body claims it first — is
/// still OXC's diagnostic. That is a different mechanism (the message comes from
/// inside an unfinished array or object, not from the wrapper), so it is pinned
/// here rather than fixed: the pin is two-sided, and a later fix has to come
/// through this file.
///
/// `(body, rsvelte code, rsvelte message, rsvelte line, rsvelte column)` — the
/// official answer for each is in the doc comment on the row.
#[rustfmt::skip]
const RESIDUE: &[(&str, &str, &str, usize, usize)] = &[
    // official: `js_parse_error` / `Unexpected token` / 2:6
    ("[a)",    "js_parse_error", "Expected `,` or `]` but found `)`", 2, 6),
    // official: `js_parse_error` / `Unexpected token` / 2:9
    ("{a: 1)", "js_parse_error", "Unexpected token", 2, 13),
    // A LEXICAL run-out, and the negative control for the rewrite above: both
    // arms answer these identically, so the remap does not reach them. The
    // message and the position are both wrong and neither is this fix's — OXC's
    // own wording never surfaces here, so there is nothing for `check_js_parse_
    // error_with_pos` to rewrite.
    // official: `js_parse_error` / `Unterminated template` / 2:5
    ("`a",     "js_parse_error", "Unexpected token", 2, 9),
    // official: `js_parse_error` / `Unterminated string constant` / 2:4
    ("'a",     "js_parse_error", "Unexpected token", 2, 9),
];

#[test]
fn the_residue_is_still_the_residue() {
    for (body, code, message, line, column) in RESIDUE {
        let actual = diagnose(body).unwrap_or_else(|| panic!("{body:?} compiled"));
        assert_eq!(
            (actual.0.as_str(), actual.1.as_str(), actual.2, actual.3),
            (*code, *message, *line, *column),
            "{body:?} moved; if this is a fix, move the row into CELLS with the official answer"
        );
    }
}
