//! The component body always hoists a `const` for `$props.id()`, so the
//! source's own declaration has to be dropped. The instance-script line loop
//! decided that by matching raw text, which any trivia around the call — or a
//! line break before it — defeated: the name was then declared twice in one
//! scope and no JS parser accepts the output.
//!
//! Every trivia row is paired with the identical source minus the trivia, so a
//! failure attributes to the trivia rather than to the declaration keyword.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(decl: &str, generate: GenerateMode, dev: bool) -> String {
    let source = format!("<script>\n\t{decl}\n</script>\n<p>{{id}}</p>\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("Id.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn declarations_of_id(code: &str) -> usize {
    let boundary = |c: Option<char>| c.is_none_or(|c| !c.is_alphanumeric() && c != '_' && c != '$');
    let mut count = 0;
    for keyword in ["const", "let", "var"] {
        let mut rest = code;
        while let Some(at) = rest.find(keyword) {
            let (head, tail) = rest.split_at(at + keyword.len());
            if boundary(head[..at].chars().next_back()) {
                let name = tail.trim_start();
                if name.len() < tail.len()
                    && name
                        .strip_prefix("id")
                        .is_some_and(|t| boundary(t.chars().next()))
                {
                    count += 1;
                }
            }
            rest = tail;
        }
    }
    count
}

fn parses(code: &str) -> bool {
    let allocator = oxc_allocator::Allocator::default();
    oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs())
        .parse()
        .diagnostics
        .is_empty()
}

/// The declaration keyword, the trivia and the line layout are the three things
/// the raw-text match was sensitive to, so vary all three. Each entry is
/// `(label, with-trivia, the same declaration without it)`.
const ROWS: &[(&str, &str, &str)] = &[
    (
        "block-before",
        "const id = /*c*/ $props.id();",
        "const id = $props.id();",
    ),
    (
        "block-before-tight",
        "const id = /*c*/$props.id();",
        "const id = $props.id();",
    ),
    (
        "two-blocks",
        "const id = /*a*/ /*b*/ $props.id();",
        "const id = $props.id();",
    ),
    (
        "block-after",
        "const id = $props.id() /*c*/;",
        "const id = $props.id();",
    ),
    (
        "block-after-semi",
        "const id = $props.id(); /*c*/",
        "const id = $props.id();",
    ),
    (
        "line-after",
        "const id = $props.id(); // c",
        "const id = $props.id();",
    ),
    (
        "line-before",
        "// c\n\tconst id = $props.id();",
        "const id = $props.id();",
    ),
    (
        "let",
        "let id = /*c*/ $props.id();",
        "let id = $props.id();",
    ),
    (
        "var",
        "var id = /*c*/ $props.id();",
        "var id = $props.id();",
    ),
    (
        "export-const",
        "export const id = /*c*/ $props.id();",
        "export const id = $props.id();",
    ),
    (
        "block-in-name",
        "const /*c*/ id = $props.id();",
        "const id = $props.id();",
    ),
    // The initializer on its own line: the per-line test cannot see it at all,
    // so this row is what forces the second call site once the whole statement
    // has been accumulated.
    (
        "newline-rhs",
        "const id =\n\t\t$props.id();",
        "const id = $props.id();",
    ),
];

#[test]
fn trivia_around_props_id_never_duplicates_the_declaration() {
    let mut checked = 0;
    for (label, with_trivia, without) in ROWS {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            for dev in [false, true] {
                for (arm, decl) in [("with trivia", with_trivia), ("control", without)] {
                    let out = code(decl, generate, dev);
                    assert_eq!(
                        declarations_of_id(&out),
                        1,
                        "{label} / {arm} / {generate:?} / dev={dev}: `id` must be declared \
                         exactly once\n{out}"
                    );
                    assert!(
                        parses(&out),
                        "{label} / {arm} / {generate:?} / dev={dev}: output must parse\n{out}"
                    );
                }
            }
        }
        checked += 1;
    }
    assert!(
        checked >= 12,
        "only {checked} rows were reached — the table moved"
    );
}

/// The drop must survive the comma split that runs ahead of it: official keeps
/// `other`, and `id` is still declared once. Moving the predicate ahead of the
/// split makes this row emit `id` twice, which is the whole defect again.
#[test]
fn a_second_declarator_in_the_same_declaration_survives() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code("const id = $props.id(), other = 1;", generate, false);
        assert_eq!(
            declarations_of_id(&out),
            1,
            "{generate:?}: `id` must still be declared exactly once\n{out}"
        );
        assert!(
            out.contains("other"),
            "{generate:?}: the second declarator must survive\n{out}"
        );
        assert!(parses(&out), "{generate:?}: output must parse\n{out}");
    }
}

/// A `$props.id()` that is not the whole initializer never reaches the drop:
/// the validator rejects it first, exactly as official does. Without this the
/// predicate looks like the thing admitting the shape.
#[test]
fn a_call_that_is_not_the_whole_initializer_is_rejected() {
    for decl in [
        "const wrapped = [$props.id()];",
        "const id = $props.id() + \'\';",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let source = format!("<script>\n\t{decl}\n</script>\n<p>{{id}}</p>\n");
            let err = compile(
                &source,
                CompileOptions {
                    filename: Some("Id.svelte".to_string()),
                    generate,
                    dev: false,
                    ..Default::default()
                },
            )
            .expect_err("official rejects this too");
            assert!(
                format!("{err:?}").contains("props_id_invalid_placement"),
                "{decl} / {generate:?}: expected props_id_invalid_placement, got {err:?}"
            );
        }
    }
}
