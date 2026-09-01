//! `compile()` builds `result.ast` on the first read rather than on every call.
//! The deferred conversion re-prepares the component, so it has to reproduce
//! every step the eager path ran between parse and conversion — the TypeScript
//! strip above all, since upstream's `result.ast` is the *stripped* tree.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_both};
use serde_json::Value;

fn options() -> CompileOptions {
    CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    }
}

fn ast_of(source: &str, options: CompileOptions) -> Value {
    let result = compile(source, options).expect("compiles");
    serde_json::from_str(result.ast.get().expect("compile() fills `ast`")).expect("`ast` is JSON")
}

/// Upstream converts `result.ast` from the post-`remove_typescript_nodes` tree,
/// so a type annotation must not survive into it.
#[test]
fn the_deferred_ast_is_typescript_stripped() {
    let source = "<script lang=\"ts\">\n\tlet count: number = 0;\n</script>\n<b>{count}</b>\n";
    let ast = ast_of(source, options());
    let text = ast.to_string();
    assert!(
        text.contains("\"count\""),
        "the declaration is missing: {text}"
    );
    assert!(
        !text.contains("TSTypeAnnotation"),
        "the deferred AST kept a TypeScript node: {text}"
    );
}

/// Reading one target's handle must not change what the other reports, and both
/// share a single materialization.
#[test]
fn both_targets_share_one_materialization() {
    let source = "<script lang=\"ts\">\n\tconst a: string = 'x';\n</script>\n<i>{a}</i>\n<style>i { color: red }</style>\n";
    let (client, server) = compile_both(source, options()).expect("compiles");
    let first = client.ast.get().expect("client fills `ast`").to_string();
    assert_eq!(server.ast.get(), Some(first.as_str()));
    // A second read is served from the cache and must be identical.
    assert_eq!(client.ast.get(), Some(first.as_str()));
}

/// The handle survives being read after every other field has been consumed —
/// it owns its own source, rather than borrowing the caller's.
#[test]
fn the_handle_outlives_its_source() {
    let ast = {
        let source = String::from("<script>\n\tlet a = 1;\n</script>\n<b>{a}</b>\n");
        let result = compile(&source, options()).expect("compiles");
        drop(source);
        result.ast
    };
    let json: Value = serde_json::from_str(ast.get().expect("fills `ast`")).expect("JSON");
    // The default shape is the legacy tree, whose root carries `html` rather
    // than a `type`.
    assert!(json.get("html").is_some(), "not the legacy root: {json}");
}

/// `modernAst` still selects the modern tree through the deferred path.
#[test]
fn modern_ast_reaches_the_deferred_path() {
    let source = "<script>\n\tlet a = 1;\n</script>\n<b>{a}</b>\n";
    let ast = ast_of(
        source,
        CompileOptions {
            modern_ast: true,
            ..options()
        },
    );
    assert_eq!(ast["type"], "Root");
    assert!(ast.get("html").is_none(), "legacy key on the modern tree");
}
