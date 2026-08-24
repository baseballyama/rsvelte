//! `:global(...)` inside `:is()` / `:where()` must scope the element (#3403).
//!
//! The emitted `css.code` is byte-identical on both sides for every row here, so
//! **no text comparison can see this defect** — what differs is which elements
//! carry the scoping class, and therefore whether the emitted rule can ever
//! match. The expectations are the official compiler's own output, read off
//! `submodules/svelte` (the pinned oracle) by compiling each row.
//!
//! What this test cannot see: it fixes one markup shape and one target
//! (`client`, non-dev, external CSS), so a scoping decision that reaches only
//! the server or only dev output is invisible here.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const MARKUP: &str = r#"<div class="card wide"><p class="a">x</p><span class="b">y</span></div>"#;

/// Every `class="..."` in the emitted template, with the scope hash normalised
/// so the two compilers' different hashes cannot make equal sets look different.
fn scoped_set(code: &str) -> String {
    let mut normalized = String::with_capacity(code.len());
    let bytes = code.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if code[i..].starts_with("svelte-") {
            let mut j = i + "svelte-".len();
            while j < bytes.len() && bytes[j].is_ascii_alphanumeric() {
                j += 1;
            }
            if j > i + "svelte-".len() {
                normalized.push_str("svelte-X");
                i = j;
                continue;
            }
        }
        let ch = code[i..].chars().next().unwrap();
        normalized.push(ch);
        i += ch.len_utf8();
    }

    let mut out: Vec<String> = Vec::new();
    let mut rest = normalized.as_str();
    while let Some(p) = rest.find("class=\"") {
        rest = &rest[p + 7..];
        if let Some(e) = rest.find('"') {
            out.push(rest[..e].to_string());
            rest = &rest[e + 1..];
        } else {
            break;
        }
    }
    out.join(" | ")
}

fn scoped_for(selector: &str) -> String {
    let src = format!("{MARKUP}\n\n<style>\n\t{selector} {{ color: red }}\n</style>\n");
    let result = compile(
        &src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("`{selector}` should compile, got {:?}", e.diagnostic().code));
    scoped_set(&result.js.code)
}

/// `(name, selector, the official compiler's scoped set)`
const CASES: &[(&str, &str, &str)] = &[
    (
        "where-global",
        r#":where(:global(.x))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "is-global",
        r#":is(:global(.x))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "is-global-or-class",
        r#":is(:global(.x), .a)"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "not-global",
        r#":not(:global(.x))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "has-global",
        r#".card:has(:global(.x))"#,
        "card wide svelte-X | a | b",
    ),
    ("global-alone", r#":global(.x)"#, "card wide | a | b"),
    (
        "global-descendant",
        r#":global(.x) .a"#,
        "card wide | a svelte-X | b",
    ),
    (
        "descendant-global",
        r#".a :global(.x)"#,
        "card wide | a svelte-X | b",
    ),
    (
        "is-plain",
        r#":is(.a, .b)"#,
        "card wide | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-is-descendant",
        r#":is(.card .a)"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-where-descendant",
        r#":where(.card .a)"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-is-global-descendant",
        r#":is(:global(.x) .a)"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-is-trailing-global",
        r#":is(.a :global(.x))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-is-nested-is-global",
        r#":is(:is(:global(.x)))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-has-is-global",
        r#".card:has(:is(:global(.x)))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
    (
        "EXTRA-is-global-and-class-compound",
        r#":is(:global(.x).a)"#,
        "card wide | a svelte-X | b",
    ),
    (
        "EXTRA-where-two-globals",
        r#":where(:global(.x), :global(.y))"#,
        "card wide svelte-X | a svelte-X | b svelte-X",
    ),
];

#[test]
fn matches_the_official_scoped_set() {
    let mut wrong = Vec::new();
    for (name, selector, expected) in CASES {
        let actual = scoped_for(selector);
        if actual != *expected {
            wrong.push(format!(
                "{name}\n  selector: {selector}\n  official: {expected}\n  rsvelte : {actual}"
            ));
        }
    }
    assert!(
        wrong.is_empty(),
        "{} of {} selectors scope a different set than the official compiler:\n{}",
        wrong.len(),
        CASES.len(),
        wrong.join("\n")
    );
}

/// A fixture-driven comparison scores "nothing compared" as a pass, and a table
/// where every row expects the same set cannot see a rule that scopes
/// everything or nothing.
#[test]
fn the_population_is_not_degenerate() {
    assert_eq!(CASES.len(), 17, "row count");

    let all_scoped = CASES
        .iter()
        .filter(|(_, _, e)| !e.contains("card wide |") && e.matches("svelte-X").count() == 3)
        .count();
    let partly_scoped = CASES
        .iter()
        .filter(|(_, _, e)| {
            let n = e.matches("svelte-X").count();
            n > 0 && n < 3
        })
        .count();
    let none_scoped = CASES
        .iter()
        .filter(|(_, _, e)| !e.contains("svelte-X"))
        .count();

    assert!(all_scoped > 0, "no row scopes every element");
    assert!(partly_scoped > 0, "no row scopes only some elements");
    assert!(none_scoped > 0, "no row scopes nothing");

    // The three rows the issue reports, by name, so a future edit cannot drop
    // the cases the fix exists for and still pass.
    for required in [
        ":where(:global(.x))",
        ":is(:global(.x))",
        ":is(:global(.x), .a)",
    ] {
        assert!(
            CASES.iter().any(|(_, s, _)| *s == required),
            "missing the discriminating case `{required}`"
        );
    }
}
