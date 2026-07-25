//! Regression tests for #1794: deeply nested input must produce a parse error
//! instead of overflowing the stack.
//!
//! A stack overflow aborts the process (SIGABRT) and is not a panic, so no
//! embedder — the lint CLI, the NAPI/wasm bindings, the language server — can
//! contain it with `catch_unwind`. The parser therefore bounds its own
//! recursion at `MAX_NESTING_DEPTH` and reports a normal diagnostic.
//!
//! Every case runs on an explicitly sized 8 MiB thread — the size of a default
//! main thread — so the assertions hold regardless of `RUST_MIN_STACK`, which
//! the repo's test scripts raise. Raising the stack must never be what makes
//! these pass.

use rsvelte_core::compiler::phases::phase1_parse::MAX_NESTING_DEPTH;
use rsvelte_core::error::ParseError;
use rsvelte_core::{CompileError, CompileOptions, GenerateMode, ParseOptions, compile, parse};

const DEFAULT_STACK: usize = 8 * 1024 * 1024;

/// Run `f` on a thread with a default-sized (8 MiB) stack.
fn on_default_stack<T: Send + 'static>(f: impl FnOnce() -> T + Send + 'static) -> T {
    std::thread::Builder::new()
        .stack_size(DEFAULT_STACK)
        .spawn(f)
        .expect("spawn test thread")
        .join()
        .expect("test thread did not panic")
}

fn nested(open: &str, inner: &str, close: &str, depth: usize) -> String {
    let mut source = String::with_capacity((open.len() + close.len()) * depth + inner.len());
    for _ in 0..depth {
        source.push_str(open);
    }
    source.push_str(inner);
    for _ in 0..depth {
        source.push_str(close);
    }
    source
}

fn parse_error_code(source: String) -> String {
    on_default_stack(move || {
        match parse(
            &source,
            &oxc_allocator::Allocator::default(),
            ParseOptions::default(),
        ) {
            Ok(_) => panic!("expected a parse error"),
            Err(ParseError::SvelteError { code, .. }) => code,
            Err(other) => panic!("expected a SvelteError, got {other:?}"),
        }
    })
}

fn compile_error_code(source: String, generate: GenerateMode) -> String {
    on_default_stack(move || {
        let options = CompileOptions {
            generate,
            ..Default::default()
        };
        match compile(&source, options) {
            Ok(_) => panic!("expected a compile error"),
            Err(CompileError::Parse(ParseError::SvelteError { code, .. })) => code,
            Err(other) => panic!("expected a parse error, got {other}"),
        }
    })
}

/// The depth used for "far past the limit" cases — the level at which #1794
/// reported the language server's 256 MiB worker aborting.
const WAY_TOO_DEEP: usize = 30_000;

#[test]
fn deeply_nested_elements_error_instead_of_aborting() {
    assert_eq!(
        parse_error_code(nested("<div>", "hi", "</div>", WAY_TOO_DEEP)),
        "template_nesting_too_deep"
    );
}

#[test]
fn deeply_nested_blocks_error_instead_of_aborting() {
    assert_eq!(
        parse_error_code(nested("{#if x}", "hi", "{/if}", WAY_TOO_DEEP)),
        "template_nesting_too_deep"
    );
    assert_eq!(
        parse_error_code(nested(
            "{#each items as item}",
            "hi",
            "{/each}",
            WAY_TOO_DEEP
        )),
        "template_nesting_too_deep"
    );
}

#[test]
fn deeply_nested_elements_error_from_compile() {
    // Phase 2/3 walk the same tree, so the whole compile path — not just
    // `parse()` — has to stay within the stack, for both output modes.
    let source = nested("<div>", "hi", "</div>", WAY_TOO_DEEP);
    assert_eq!(
        compile_error_code(source.clone(), GenerateMode::Client),
        "template_nesting_too_deep"
    );
    assert_eq!(
        compile_error_code(source, GenerateMode::Server),
        "template_nesting_too_deep"
    );
}

#[test]
fn deeply_nested_css_rules_error_instead_of_aborting() {
    let css = nested("a{", "color:red;", "}", WAY_TOO_DEEP);
    assert_eq!(
        parse_error_code(format!("<div>hi</div><style>{css}</style>")),
        "css_nesting_too_deep"
    );
}

#[test]
fn deeply_nested_css_selectors_error_instead_of_aborting() {
    let selector = nested(":is(", "a", ")", WAY_TOO_DEEP);
    assert_eq!(
        parse_error_code(format!(
            "<div>hi</div><style>{selector}{{color:red;}}</style>"
        )),
        "css_nesting_too_deep"
    );
}

#[test]
fn nesting_just_below_the_limit_still_compiles() {
    // The root fragment occupies one level, so `MAX_NESTING_DEPTH - 1` nested
    // elements is the deepest accepted markup.
    let depth = MAX_NESTING_DEPTH as usize - 1;
    let source = nested("<div>", "hi", "</div>", depth);
    let compiled = on_default_stack(move || compile(&source, CompileOptions::default()));
    assert!(
        compiled.is_ok(),
        "{:?}",
        compiled.err().map(|e| e.to_string())
    );

    let source = nested("<div>", "hi", "</div>", depth);
    let compiled = on_default_stack(move || {
        compile(
            &source,
            CompileOptions {
                generate: GenerateMode::Server,
                ..Default::default()
            },
        )
    });
    assert!(
        compiled.is_ok(),
        "{:?}",
        compiled.err().map(|e| e.to_string())
    );
}

#[test]
fn realistic_nesting_is_unaffected() {
    // The deepest component in the Svelte repo nests 21 levels; anything in
    // that range must compile exactly as before.
    let source = nested("<div>", "hi", "</div>", 32);
    let compiled = on_default_stack(move || compile(&source, CompileOptions::default()));
    assert!(compiled.is_ok());

    let css = nested("a{", "color:red;", "}", 8);
    let source = format!("<a href=\"/\">hi</a><style>{css}</style>");
    let compiled = on_default_stack(move || compile(&source, CompileOptions::default()));
    assert!(compiled.is_ok());
}
