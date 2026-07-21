//! TS assertion expression wrappers (`x as T`, `x satisfies T`, `x!`) must be
//! preserved in the public `parse()` AST (mirroring svelte/compiler, which keeps
//! them), and erased at compile time so codegen is unaffected.
//!
//! There is no upstream Svelte fixture that exercises these in `parse()` output,
//! so these are direct shape/span assertions rather than fixture comparisons.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};
use serde_json::Value;

fn parse_to_value(source: &str) -> Value {
    let ast = parse(source, ParseOptions::default()).expect("parse should succeed");
    with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap())
}

/// Depth-first search for the first node whose `type` equals `ty`.
fn find_node<'a>(v: &'a Value, ty: &str) -> Option<&'a Value> {
    match v {
        Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some(ty) {
                return Some(v);
            }
            for (_, child) in map {
                if let Some(found) = find_node(child, ty) {
                    return Some(found);
                }
            }
            None
        }
        Value::Array(arr) => arr.iter().find_map(|c| find_node(c, ty)),
        _ => None,
    }
}

fn span_text<'a>(source: &'a str, node: &Value) -> &'a str {
    let start = node.get("start").and_then(|s| s.as_u64()).unwrap() as usize;
    let end = node.get("end").and_then(|e| e.as_u64()).unwrap() as usize;
    &source[start..end]
}

// ── parse-shape: script declarator init ────────────────────────────────────

#[test]
fn as_const_in_script_declarator_init_preserves_wrapper() {
    let source = "<script lang=\"ts\">const x = 'chips' as const;</script>";
    let value = parse_to_value(source);

    let as_expr = find_node(&value, "TSAsExpression").expect("TSAsExpression preserved in script");
    // The inner `expression` is the string literal.
    let inner = as_expr.get("expression").expect("expression child");
    assert_eq!(inner.get("type").and_then(|t| t.as_str()), Some("Literal"));
    assert_eq!(inner.get("value").and_then(|v| v.as_str()), Some("chips"));
    // Wrapper span covers the whole `'chips' as const`.
    assert_eq!(span_text(source, as_expr), "'chips' as const");
    // typeAnnotation is the type node directly (not wrapped in TSTypeAnnotation).
    let ta = as_expr
        .get("typeAnnotation")
        .expect("typeAnnotation present");
    assert_eq!(
        ta.get("type").and_then(|t| t.as_str()),
        Some("TSTypeReference")
    );
    assert_eq!(span_text(source, ta), "const");
}

// ── parse-shape: template expression tag ───────────────────────────────────

#[test]
fn as_const_in_template_expression_tag_preserves_wrapper() {
    let source = "<script lang=\"ts\"></script>{'chips' as const}";
    let value = parse_to_value(source);

    let as_expr =
        find_node(&value, "TSAsExpression").expect("TSAsExpression preserved in template");
    assert_eq!(span_text(source, as_expr), "'chips' as const");
    let inner = as_expr.get("expression").expect("expression child");
    assert_eq!(inner.get("value").and_then(|v| v.as_str()), Some("chips"));
    // Inner literal span is correct within the template (no synthetic-paren drift).
    assert_eq!(span_text(source, inner), "'chips'");
}

// ── parse-shape: attribute value ───────────────────────────────────────────

#[test]
fn as_const_in_attribute_value_preserves_wrapper() {
    let source = "<script lang=\"ts\"></script><input value={'chips' as const} />";
    let value = parse_to_value(source);

    let as_expr =
        find_node(&value, "TSAsExpression").expect("TSAsExpression preserved in attribute");
    assert_eq!(span_text(source, as_expr), "'chips' as const");
}

// ── parse-shape: satisfies + non-null ──────────────────────────────────────

#[test]
fn satisfies_expression_preserves_wrapper() {
    let source = "<script lang=\"ts\">const x = foo satisfies Bar;</script>";
    let value = parse_to_value(source);

    let node = find_node(&value, "TSSatisfiesExpression").expect("TSSatisfiesExpression preserved");
    assert_eq!(span_text(source, node), "foo satisfies Bar");
    let inner = node.get("expression").expect("expression child");
    assert_eq!(
        inner.get("type").and_then(|t| t.as_str()),
        Some("Identifier")
    );
    assert_eq!(inner.get("name").and_then(|n| n.as_str()), Some("foo"));
    let ta = node.get("typeAnnotation").expect("typeAnnotation present");
    assert_eq!(span_text(source, ta), "Bar");
}

#[test]
fn non_null_expression_preserves_wrapper_without_type_annotation() {
    let source = "<script lang=\"ts\">const x = foo!;</script>";
    let value = parse_to_value(source);

    let node = find_node(&value, "TSNonNullExpression").expect("TSNonNullExpression preserved");
    assert_eq!(span_text(source, node), "foo!");
    let inner = node.get("expression").expect("expression child");
    assert_eq!(inner.get("name").and_then(|n| n.as_str()), Some("foo"));
    // NonNull has no typeAnnotation.
    assert!(node.get("typeAnnotation").is_none());
}

// ── codegen erasure: SSR + client output must compile and erase the assertion ─

fn ssr_code(source: &str) -> String {
    let opts = CompileOptions {
        generate: GenerateMode::Server,
        ..CompileOptions::default()
    };
    compile(source, opts)
        .expect("SSR compile should succeed")
        .js
        .code
}

fn client_code(source: &str) -> String {
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        ..CompileOptions::default()
    };
    compile(source, opts)
        .expect("client compile should succeed")
        .js
        .code
}

#[test]
fn as_const_is_erased_at_codegen() {
    let source = "<script lang=\"ts\">const x = 'chips' as const;</script>{x} {'fish' as const}";

    for code in [ssr_code(source), client_code(source)] {
        // The assertion keyword must not survive into generated JS.
        assert!(
            !code.contains(" as const"),
            "`as const` leaked into codegen output:\n{code}"
        );
        // The runtime values still appear.
        assert!(
            code.contains("chips"),
            "value 'chips' missing from output:\n{code}"
        );
        assert!(
            code.contains("fish"),
            "value 'fish' missing from output:\n{code}"
        );
    }
}

#[test]
fn satisfies_and_non_null_are_erased_at_codegen() {
    let source = "<script lang=\"ts\">let a = 1; const b = (a satisfies number) + a!;</script>{b}";

    for code in [ssr_code(source), client_code(source)] {
        assert!(
            !code.contains("satisfies"),
            "`satisfies` leaked into codegen output:\n{code}"
        );
    }
}
