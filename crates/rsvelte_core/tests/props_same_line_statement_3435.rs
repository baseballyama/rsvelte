//! A `$props()`-family declaration followed by another statement on the same
//! source line produced client output no JS parser accepts. Two independent
//! sites: the AST rewrite dropped the `;` from its replacement text (correct only
//! when a line break follows), and the per-line loop dropped the whole physical
//! line for a `$props.id()` declaration, which emitted the hoisted `const` twice.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn component(body: &str) -> String {
    format!("<script>\n\t{body}\n</script>\n\n<b>x</b>\n")
}

/// `oxc` is the parser the pipeline itself uses, so "does this output parse" is
/// asked of the artifact rather than of the scanner that produced it.
fn parses(code: &str) -> bool {
    let allocator = oxc_allocator::Allocator::default();
    let source_type = oxc_span::SourceType::mjs();
    let parsed = oxc_parser::Parser::new(&allocator, code, source_type).parse();
    !parsed.panicked && parsed.diagnostics.is_empty()
}

const SAME_LINE_FORMS: &[(&str, &str)] = &[
    ("identifier", "let p = $props(); void p;"),
    (
        "rest",
        "let { a = 1, ...rest } = $props(); void a; void rest;",
    ),
    ("props-id", "const id = $props.id(); void id;"),
    ("bindable", "let { v = $bindable(0) } = $props(); void v;"),
    ("plain-default", "let { a = 1 } = $props(); void a;"),
    ("plain-destructure", "let { a } = $props(); void a;"),
    ("two-spaces", "let p = $props();  void p;"),
    ("comment-between", "let p = $props(); /* c */ void p;"),
    (
        "three-statements",
        "let p = $props(); const q = 1; void p; void q;",
    ),
];

#[test]
fn every_same_line_props_declaration_emits_parseable_client_output() {
    for (name, body) in SAME_LINE_FORMS {
        for dev in [false, true] {
            let out = compile_client(&component(body), dev);
            assert!(!out.contains("COMPILE_ERROR"), "{name} dev={dev}: {out}");
            assert!(parses(&out), "{name} dev={dev}: {out}");
        }
    }
}

/// Parseable is not enough: the statement that shares the line has to survive,
/// and the hoisted `$props.id()` `const` must appear exactly once.
#[test]
fn the_statement_sharing_the_line_survives() {
    let out = compile_client(&component("let p = $props(); void p;"), false);
    assert!(out.contains("void p;"), "{out}");

    let out = compile_client(&component("const id = $props.id(); void id;"), false);
    assert!(out.contains("void id;"), "{out}");
    assert_eq!(out.matches("$.props_id()").count(), 1, "{out}");

    let out = compile_client(
        &component("let p = $props(); const q = 1; void p; void q;"),
        false,
    );
    assert!(out.contains("void p;"), "{out}");
    assert!(out.contains("void q;"), "{out}");
}

/// A read-only destructure produces an empty replacement, so it is the one shape
/// that must NOT gain a `;` — a stray empty statement is a divergence of its own.
#[test]
fn a_read_only_destructure_still_leaves_no_statement_behind() {
    let out = compile_client(&component("let { a } = $props(); void a;"), false);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(parses(&out), "{out}");
    assert!(!out.contains("$$props;;"), "{out}");
}

/// The same declarations one per line already worked; they are the control that
/// says the fix did not buy the same-line case by breaking the ordinary one.
#[test]
fn one_declaration_per_line_is_unchanged() {
    for (name, body) in SAME_LINE_FORMS {
        let per_line = body.replace("; ", ";\n\t");
        for dev in [false, true] {
            let out = compile_client(&component(&per_line), dev);
            assert!(!out.contains("COMPILE_ERROR"), "{name} dev={dev}: {out}");
            assert!(parses(&out), "{name} dev={dev}: {out}");
        }
    }
}

/// A `$props.id()` declaration alone on its line is still dropped from the body
/// and re-emitted as the hoisted `const` — the tail branch must not resurrect it.
#[test]
fn a_lone_props_id_declaration_is_still_hoisted_once() {
    let out = compile_client(&component("const id = $props.id();"), false);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert_eq!(out.matches("$.props_id()").count(), 1, "{out}");

    let out = compile_client(&component("const id = $props.id()"), false);
    assert_eq!(out.matches("$.props_id()").count(), 1, "{out}");

    let out = compile_client(&component("export const id = $props.id();"), false);
    assert_eq!(out.matches("$.props_id()").count(), 1, "{out}");

    // A run of empty statements is still the declaration's own line.
    let out = compile_client(&component("const id = $props.id();;"), false);
    assert_eq!(out.matches("$.props_id()").count(), 1, "{out}");
    assert!(parses(&out), "{out}");
}
