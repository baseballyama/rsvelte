//! A `//` comment on the last line of a rune call's argument swallowed the
//! closing paren the emitter appends after it.
//!
//! `emit_rune_replacement` splices the argument verbatim and then pushes `)`.
//! `inner.trim_end()` removes the newline that closed the comment, so the `)`
//! landed inside it and the call was never closed.
//!
//! The variant that carries a delimiter is the one that already worked: with
//! `// ) c` in the same slot the field bails to the AST path and comes out
//! right. It is the *plain* comment that is unguarded here — the inverse of the
//! usual "delimiter-carrying comments are the dangerous ones" rule, which is why
//! a triage pass over the `-with-` mutation kinds would have walked past this.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn server(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            generate: GenerateMode::Server,
            filename: Some("m.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[track_caller]
fn assert_parses(code: &str, what: &str) {
    assert!(!code.contains("COMPILE_ERROR"), "{what}: {code}");
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "{what}: emitted JS does not parse: {:?}\n--- output ---\n{code}",
        ret.diagnostics
    );
}

/// The reduction of `layerchart/…/Circle.shared__m0__line-with-paren.svelte.ts`.
const CLASS_FIELD: &str = "export class C {\n  #p = () => ({});\n  a = $derived(\n    this.#p().x != null ||\n      f(this.#p().y, this.#p().z)\n// c\n  );\n  b = 1;\n}\n";

#[test]
fn a_trailing_line_comment_does_not_swallow_the_derived_closing_paren() {
    assert_parses(&server(CLASS_FIELD), "class field $derived");
}

/// The same slot with a `)` in the comment. This already passed — it is the
/// control that makes the test above discriminating rather than merely green.
#[test]
fn the_delimiter_carrying_variant_still_works() {
    assert_parses(
        &server(&CLASS_FIELD.replace("// c", "// ) c")),
        "class field $derived with a paren in the comment",
    );
}

#[test]
fn a_trailing_line_comment_survives_a_plain_derived_declaration() {
    let src = "export function make() {\n  let n = $state(1);\n  let d = $derived(\n    n + 1\n// c\n  );\n  return () => d;\n}\n";
    assert_parses(&server(src), "plain $derived declaration");
}

#[test]
fn a_trailing_line_comment_survives_derived_by() {
    let src = "export function make() {\n  let n = $state(1);\n  let d = $derived.by(\n    () => n + 1\n// c\n  );\n  return () => d;\n}\n";
    assert_parses(&server(src), "$derived.by");
}

/// An object-literal argument takes the wrapping-paren branch, so the comment
/// has to be closed before *that* paren too, not only the outer one.
#[test]
fn a_trailing_line_comment_survives_an_object_literal_argument() {
    let src = "export class C {\n  a = $derived(\n    { x: 1 }\n// c\n  );\n  b = 1;\n}\n";
    assert_parses(&server(src), "object-literal $derived argument");
}

/// Control: no comment at all. Guards the direction this fix could overshoot in
/// — a stray newline before every closing paren would change output everywhere.
#[test]
fn a_derived_without_a_trailing_comment_is_byte_for_byte_unchanged() {
    let src = "export function make() {\n  let n = $state(1);\n  let d = $derived(n + 1);\n  return () => d;\n}\n";
    let out = server(src);
    assert_parses(&out, "no comment");
    assert!(
        out.contains("$.derived(() => n + 1)"),
        "a newline was inserted where no comment was open: {out}"
    );
}
