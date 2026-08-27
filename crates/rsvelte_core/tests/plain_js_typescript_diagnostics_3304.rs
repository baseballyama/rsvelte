//! Plain JavaScript rejects TypeScript syntax through acorn upstream, while
//! OXC understands the same grammar and reports TypeScript-aware diagnostics.
//! The code was already `js_parse_error`, but its message diverged in 28 of the
//! 46 measured rejections and its position diverged in ten (#3304).
//!
//! These are the 14 message-divergent constructs, in both hosts from the issue
//! matrix. Every value is measured against `svelte@5.56.9`. The component adds
//! exactly ten bytes (`<script>\n\t`) before the same program, so asserting the
//! absolute positions also proves that the parser applies its caller offset
//! only after locating acorn's stopping token.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module,
    compiler::CompileError,
};

const UNEXPECTED: &str = "Unexpected token";

const CASES: [(&str, &str, u32); 14] = [
    ("let v = 1 as number;", UNEXPECTED, 10),
    ("let v = [1] as const;", UNEXPECTED, 12),
    ("let v = 1 satisfies number;", UNEXPECTED, 10),
    ("let v = <number>1;", UNEXPECTED, 8),
    ("function f(a: number) { return a; }", UNEXPECTED, 12),
    ("function f(a?) { return a; }", UNEXPECTED, 12),
    ("function f(): number { return 1; }", UNEXPECTED, 12),
    ("function f<T>(a) { return a; }", UNEXPECTED, 10),
    (
        "interface I { a: number }",
        "The keyword 'interface' is reserved",
        0,
    ),
    ("enum E { A }", "The keyword 'enum' is reserved", 0),
    ("class C implements I {}", UNEXPECTED, 8),
    (
        "class C { constructor(private a) {} }",
        "The keyword 'private' is reserved",
        22,
    ),
    (
        "function f(a: number): void; function f(a) {}",
        UNEXPECTED,
        12,
    ),
    ("import type { A } from './a';", UNEXPECTED, 12),
];

fn diagnostic(error: CompileError) -> (String, String, u32, u32) {
    let diagnostic = error.diagnostic();
    let (start, end) = diagnostic.span.unwrap_or((u32::MAX, u32::MAX));
    (
        diagnostic.code.unwrap_or_default(),
        diagnostic
            .message
            .lines()
            .next()
            .unwrap_or_default()
            .to_string(),
        start,
        end,
    )
}

fn expected(message: &str, at: u32) -> (String, String, u32, u32) {
    ("js_parse_error".to_string(), message.to_string(), at, at)
}

#[test]
fn compile_module_uses_plain_acorn_diagnostics_for_a_svelte_js_module() {
    for (source, message, at) in CASES {
        let error = compile_module(
            source,
            ModuleCompileOptions {
                filename: Some("Test.svelte.js".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .unwrap_err();
        assert_eq!(diagnostic(error), expected(message, at), "for {source:?}");
    }
}

#[test]
fn a_plain_component_script_uses_the_same_diagnostic_after_its_offset() {
    for (source, message, at) in CASES {
        let component = format!("<script>\n\t{source}\n</script>\n");
        let error = compile(
            &component,
            CompileOptions {
                filename: Some("Test.svelte".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .unwrap_err();
        assert_eq!(
            diagnostic(error),
            expected(message, at + 10),
            "for {source:?}"
        );
    }
}

#[test]
fn component_typescript_mode_still_accepts_the_grammar_plain_javascript_rejects() {
    // `compileModule` is deliberately absent: upstream always parses that API
    // as JavaScript, regardless of a `.svelte.ts` filename, because callers
    // strip TypeScript before invoking it.
    let source = "let v = 1 as number;\nfunction f(): number { return v; }";
    let component = format!("<script lang=\"ts\">\n{source}\n</script>\n");
    compile(
        &component,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("the diagnostic realignment must be disabled for lang=ts scripts");
}
