//! TS assertion wrappers in **assignment-target** position (`x!++`, `x! += 1`,
//! `[x!] = …`). oxc models these as `AssignmentTarget` / `SimpleAssignmentTarget`
//! variants rather than `Expression`s, so they need their own conversion arms;
//! without them the whole target serialized as `null` and a consumer reading the
//! AST lost the write.
//!
//! svelte/compiler's shape comes from acorn-typescript's `toAssignable`, which
//! unwraps the wrapper but whose return value is only used by `parseMaybeAssign`.
//! The observable consequence is an asymmetry that these tests pin: a plain `=`
//! LHS is unwrapped, while a compound assignment, an update expression and every
//! nested destructuring position keep the wrapper.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};
use serde_json::Value;

fn parse_to_value(source: &str) -> Value {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse should succeed");
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
    let start = node.get("start").and_then(Value::as_u64).unwrap() as usize;
    let end = node.get("end").and_then(Value::as_u64).unwrap() as usize;
    &source[start..end]
}

/// `<script lang="ts">` wrapping `stmt` in a function body (the program path).
fn script(stmt: &str) -> String {
    format!(
        "<script lang=\"ts\">\n\
         \tlet count = 0;\n\
         \tlet obj: any = {{}};\n\
         \tfunction f() {{ {stmt} }}\n\
         </script>"
    )
}

// ── UpdateExpression: the wrapper is kept ──────────────────────────────────

#[test]
fn non_null_update_argument_preserves_wrapper() {
    let source = script("count!++;");
    let ast = parse_to_value(&source);
    let update = find_node(&ast, "UpdateExpression").expect("UpdateExpression");

    let arg = update.get("argument").expect("argument present");
    assert_eq!(
        arg.get("type").and_then(Value::as_str),
        Some("TSNonNullExpression"),
        "`count!++` must keep the non-null wrapper on its argument"
    );
    assert_eq!(
        arg.pointer("/expression/name").and_then(Value::as_str),
        Some("count")
    );
    assert_eq!(span_text(&source, arg), "count!");
}

#[test]
fn non_null_prefix_update_argument_preserves_wrapper() {
    let source = script("--count!;");
    let ast = parse_to_value(&source);
    let update = find_node(&ast, "UpdateExpression").expect("UpdateExpression");

    assert_eq!(update.get("prefix").and_then(Value::as_bool), Some(true));
    assert_eq!(
        update.pointer("/argument/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
}

#[test]
fn as_cast_update_argument_preserves_wrapper() {
    let source = script("(count as number)++;");
    let ast = parse_to_value(&source);
    let update = find_node(&ast, "UpdateExpression").expect("UpdateExpression");

    let arg = update.get("argument").expect("argument present");
    assert_eq!(
        arg.get("type").and_then(Value::as_str),
        Some("TSAsExpression")
    );
    assert_eq!(
        arg.pointer("/expression/name").and_then(Value::as_str),
        Some("count")
    );
    assert_eq!(
        arg.pointer("/typeAnnotation/type").and_then(Value::as_str),
        Some("TSNumberKeyword")
    );
}

#[test]
fn non_null_update_in_template_expression_preserves_wrapper() {
    // The template path converts expressions through its own (`-1` paren-shifted)
    // converters, so it needs the same arm as the `<script>` path.
    let source = "<script lang=\"ts\">\n\tlet count = 0;\n</script>\n<button onclick={() => count!++}>x</button>";
    let ast = parse_to_value(source);
    let update = find_node(&ast, "UpdateExpression").expect("UpdateExpression");

    let arg = update.get("argument").expect("argument present");
    assert_eq!(
        arg.get("type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
    assert_eq!(span_text(source, arg), "count!");
}

// ── AssignmentExpression: `=` unwraps, compound keeps ──────────────────────

#[test]
fn compound_assignment_lhs_preserves_wrapper() {
    let source = script("count! += 1;");
    let ast = parse_to_value(&source);
    let assign = find_node(&ast, "AssignmentExpression").expect("AssignmentExpression");

    assert_eq!(assign.get("operator").and_then(Value::as_str), Some("+="));
    let left = assign.get("left").expect("left present");
    assert_eq!(
        left.get("type").and_then(Value::as_str),
        Some("TSNonNullExpression"),
        "a compound assignment keeps the wrapper on its LHS"
    );
    assert_eq!(span_text(&source, left), "count!");
}

#[test]
fn logical_assignment_lhs_preserves_wrapper() {
    let source = script("count! ??= 1;");
    let ast = parse_to_value(&source);
    let assign = find_node(&ast, "AssignmentExpression").expect("AssignmentExpression");

    assert_eq!(assign.get("operator").and_then(Value::as_str), Some("??="));
    assert_eq!(
        assign.pointer("/left/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
}

#[test]
fn simple_assignment_lhs_unwraps_the_assertion() {
    // acorn-typescript's `toAssignable` returns the unwrapped node and
    // `parseMaybeAssign` keeps that return value, so `x! = 1` loses the wrapper
    // in svelte/compiler's AST. Nested wrappers are stripped all the way down.
    for stmt in [
        "count! = 1;",
        "count!! = 1;",
        "(count as number) = 1;",
        "(count satisfies number) = 1;",
    ] {
        let source = script(stmt);
        let ast = parse_to_value(&source);
        let assign = find_node(&ast, "AssignmentExpression").expect("AssignmentExpression");

        assert_eq!(
            assign.pointer("/left/type").and_then(Value::as_str),
            Some("Identifier"),
            "`{stmt}` must unwrap to a bare Identifier"
        );
        assert_eq!(
            assign.pointer("/left/name").and_then(Value::as_str),
            Some("count"),
            "`{stmt}` must unwrap to `count`"
        );
    }
}

#[test]
fn simple_assignment_lhs_unwrap_stops_at_the_member_expression() {
    // `obj!.p! = 1`: only the OUTER wrapper is an assignment target, so it is
    // stripped; the `obj!` inside the member object is a value position and stays.
    let source = script("obj!.p! = 1;");
    let ast = parse_to_value(&source);
    let assign = find_node(&ast, "AssignmentExpression").expect("AssignmentExpression");

    let left = assign.get("left").expect("left present");
    assert_eq!(
        left.get("type").and_then(Value::as_str),
        Some("MemberExpression")
    );
    assert_eq!(
        left.pointer("/object/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
    assert_eq!(span_text(&source, left), "obj!.p");
}

// ── destructuring targets: nested positions keep the wrapper ───────────────

#[test]
fn array_destructuring_element_preserves_wrapper() {
    let source = script("[count!] = [1];");
    let ast = parse_to_value(&source);
    let pattern = find_node(&ast, "ArrayPattern").expect("ArrayPattern");

    assert_eq!(
        pattern.pointer("/elements/0/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
    assert_eq!(
        pattern
            .pointer("/elements/0/expression/name")
            .and_then(Value::as_str),
        Some("count")
    );
}

#[test]
fn object_destructuring_value_preserves_wrapper() {
    let source = script("({ p: count! } = { p: 1 });");
    let ast = parse_to_value(&source);
    let pattern = find_node(&ast, "ObjectPattern").expect("ObjectPattern");

    assert_eq!(
        pattern
            .pointer("/properties/0/value/type")
            .and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
}

#[test]
fn rest_element_target_preserves_wrapper() {
    let source = script("[...count!] = [1];");
    let ast = parse_to_value(&source);
    let rest = find_node(&ast, "RestElement").expect("RestElement");

    assert_eq!(
        rest.pointer("/argument/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
}

// ── codegen erasure: the newly preserved wrapper must still strip cleanly ──

#[test]
fn assertion_targets_are_erased_from_codegen() {
    let source = "<script lang=\"ts\">\n\
        \tlet count = $state(0);\n\
        \tfunction f() { count!++; --count!; count! += 1; count! = 3; }\n\
        </script>\n\
        <button onclick={f}>{count}</button>";

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect("compile should succeed")
        .js
        .code;

        assert!(
            !code.contains("Unknown:"),
            "TS wrapper leaked into codegen:\n{code}"
        );
        assert!(
            !code.contains("count!"),
            "non-null assertion leaked into codegen (invalid JS):\n{code}"
        );
    }
}

#[test]
fn state_writes_through_an_assertion_target_still_reach_the_runtime() {
    // The write must survive as a `$state` write, not just as syntactically valid
    // JS: `count!++` is the reported shape, and dropping the target silently
    // turned it into a plain, non-reactive `count++`.
    let source = "<script lang=\"ts\">\n\
        \tlet count = $state(0);\n\
        \tfunction f() { count!++; }\n\
        </script>\n\
        <button onclick={f}>{count}</button>";

    let code = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile should succeed")
    .js
    .code;

    assert!(
        code.contains("$.update(count)"),
        "`count!++` must lower to the same `$.update` as `count++`:\n{code}"
    );
}
