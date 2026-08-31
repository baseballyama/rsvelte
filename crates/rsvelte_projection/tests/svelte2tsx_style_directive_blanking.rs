//! What a static `style:` value is left as in `__sveltets_2_ensureType(…)`.
//!
//! svelte2tsx moves the value out of the element's start tag, so the reference
//! the ensureType call keeps is the *blanked* value: its whitespace characters
//! survive and everything else is removed, with a non-empty run that has no
//! whitespace collapsing to one space. The wrapping quote is the source's own.
//!
//! Every expectation below is the official svelte2tsx's measured output for
//! that exact input (`submodules/language-tools`, svelte2tsx 092af3826), taken
//! with `{ filename, isTsFile: false, mode: 'ts', namespace: 'html', version: '5' }`.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The argument of the first `__sveltets_2_ensureType(String, Number, …)` call.
fn ensure_type_arg(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "p.svelte".to_string(),
        ..Default::default()
    };
    let code = svelte2tsx(src, opts).expect("svelte2tsx").code;
    let needle = "__sveltets_2_ensureType(String, Number, ";
    let start = code
        .find(needle)
        .unwrap_or_else(|| panic!("no ensureType call in:\n{code}"))
        + needle.len();
    let end = code[start..]
        .find(");")
        .unwrap_or_else(|| panic!("unterminated ensureType call in:\n{code}"))
        + start;
    code[start..end].to_string()
}

/// One row per input so a single wrong answer does not hide the others.
fn check(rows: &[(&str, &str)]) {
    let mut failures = Vec::new();
    for (src, expected) in rows {
        let got = ensure_type_arg(src);
        if got != *expected {
            failures.push(format!(
                "  {src}\n    official {expected:?}\n    rsvelte  {got:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} inputs diverge from official svelte2tsx:\n{}",
        failures.len(),
        rows.len(),
        failures.join("\n")
    );
}

#[test]
fn a_static_value_keeps_its_whitespace_and_nothing_else() {
    check(&[
        (r#"<div style:color="red"></div>"#, r#"" ""#),
        (r#"<div style:color="a b"></div>"#, r#"" ""#),
        (r#"<div style:color="a  b"></div>"#, r#""  ""#),
        (r#"<div style:color="a b c"></div>"#, r#""  ""#),
        (r#"<div style:color=" a "></div>"#, r#""  ""#),
        (r#"<div style:color="a b  c   d"></div>"#, "\"      \""),
        (r#"<div style:--ring="234 89% 74%"></div>"#, r#""  ""#),
        ("<div style:color=\"a\tb\"></div>", "\"\t\""),
    ]);
}

#[test]
fn the_quote_comes_from_the_source() {
    check(&[
        (r#"<div style:color='red'></div>"#, r#"' '"#),
        (r#"<div style:color='a  b'></div>"#, r#"'  '"#),
        (r#"<div style:color='say "hi"'></div>"#, r#"' '"#),
        // An empty run stays empty — this is what separates `""` from `" "`.
        (r#"<div style:color=""></div>"#, r#""""#),
        (r#"<div style:color=''></div>"#, r#"''"#),
        // Unquoted: the character after `=` is not a quote, so `"` is used.
        (r#"<div style:color=red></div>"#, r#"" ""#),
    ]);
}

#[test]
fn the_preserved_class_is_javascripts_whitespace_not_rusts() {
    // U+FEFF is JS `\s` and not `char::is_whitespace`; U+0085 is the reverse.
    // Both directions were measured against official.
    check(&[
        ("<div style:color=\"a\u{feff}b\"></div>", "\"\u{feff}\""),
        ("<div style:color=\"a\u{85}b\"></div>", "\" \""),
        ("<div style:color=\"a\u{a0}b\"></div>", "\"\u{a0}\""),
        ("<div style:color=\"a\u{3000}b\"></div>", "\"\u{3000}\""),
        ("<div style:color=\"a\u{200a}b\"></div>", "\"\u{200a}\""),
        ("<div style:color=\"a\u{200b}b\"></div>", "\" \""),
        ("<div style:color=\"a\u{180e}b\"></div>", "\" \""),
        // The same class governs a multi-part value's text runs.
        (
            "<div style:color=\"a\u{feff}b{c}\"></div>",
            "`\u{feff}${c}`",
        ),
        ("<div style:color=\"a\u{85}b{c}\"></div>", "` ${c}`"),
    ]);
}

#[test]
fn the_blanked_run_is_the_decoded_value_not_the_raw_source() {
    // `&nbsp;` has no whitespace as source text but decodes to U+00A0, and
    // official keeps the decoded character.
    check(&[
        (r#"<div style:color="a&nbsp;b"></div>"#, "\"\u{a0}\""),
        (r#"<div style:color="a&nbsp;b{c}"></div>"#, "`\u{a0}${c}`"),
        (r#"<div style:color="a&#32;b"></div>"#, r#"" ""#),
        (r#"<div style:color="a&amp;b"></div>"#, r#"" ""#),
    ]);
}

#[test]
fn the_shapes_that_do_not_go_through_blanking_are_unchanged() {
    // Controls: these already matched official before the blanking rule was
    // shared, so they are what a regression would show up in.
    check(&[
        (r#"<div style:color></div>"#, "color"),
        (r#"<div style:color={c}></div>"#, "c"),
        (r#"<div style:color="a{b}"></div>"#, "` ${b}`"),
        (r#"<div style:color="rgb({c}, 0, 0)"></div>"#, "` ${c}  `"),
        (r#"<div style:color='rgb({c}, 0, 0)'></div>"#, "` ${c}  `"),
    ]);
}
