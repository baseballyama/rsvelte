//! acorn-typescript writes `optional` on a call carrying type arguments only
//! when the subscript chain was already optional at that point
//! (`_optionalChained` in `parseSubscript`), so whether the key is present is a
//! fact about where the `?.` sits, not about whether the node is inside a
//! `ChainExpression`. A `?.` that comes after the call, or one cut off by
//! parentheses, leaves the key absent.
//!
//! The omit and keep halves are both here on purpose: an implementation that
//! never writes `optional` passes every omit case, and one that always writes
//! it passes every keep case. Only the two halves together pin the rule.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::Value;

fn ts_expression(expr: &str) -> Value {
    let source = format!("<script lang=\"ts\">\nconst r = {expr};\n</script>\n<div></div>\n");
    let _capture = CommentCaptureGuard::new();
    let ast = parse(
        &source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            skip_expression_loc: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    convert_to_legacy(&source, ast)["instance"]["content"]["body"].clone()
}

/// Every `CallExpression` in the expression, outermost first, as
/// `(has the `optional` key, carries type arguments)`.
fn calls(expr: &str) -> Vec<(bool, bool)> {
    fn walk(node: &Value, out: &mut Vec<(bool, bool)>) {
        match node {
            Value::Array(items) => {
                for item in items {
                    walk(item, out);
                }
            }
            Value::Object(map) => {
                if map.get("type").and_then(Value::as_str) == Some("CallExpression") {
                    out.push((
                        map.contains_key("optional"),
                        map.contains_key("typeArguments"),
                    ));
                }
                for (key, value) in map {
                    if key != "loc" {
                        walk(value, out);
                    }
                }
            }
            _ => {}
        }
    }
    let mut out = Vec::new();
    walk(&ts_expression(expr), &mut out);
    out
}

fn only_call(expr: &str) -> (bool, bool) {
    let found = calls(expr);
    assert_eq!(
        found.len(),
        1,
        "{expr} should hold exactly one call: {found:?}"
    );
    found[0]
}

#[test]
fn a_plain_type_argument_call_omits_optional() {
    assert_eq!(only_call("f<T>(x)"), (false, true));
}

#[test]
fn a_type_argument_call_on_a_member_omits_optional() {
    assert_eq!(only_call("o.m<T>(x)"), (false, true));
    assert_eq!(only_call("a.b.c<T>(x)"), (false, true));
}

#[test]
fn a_non_null_link_does_not_make_the_chain_optional() {
    assert_eq!(only_call("f!<T>(x)"), (false, true));
}

#[test]
fn parentheses_cut_the_subscript_chain_so_optional_is_omitted() {
    assert_eq!(only_call("(a?.b)<T>(x)"), (false, true));
}

#[test]
fn an_optional_link_after_the_call_does_not_reach_it() {
    // Both calls sit inside one `ChainExpression`, and only the outer one — the
    // one with no type arguments — carries `optional`. This is the case that
    // separates "inside a ChainExpression" from the real rule.
    assert_eq!(calls("f<T>(x)?.g(y)"), vec![(true, false), (false, true)]);
    assert_eq!(calls("f<T>(x).g?.(y)"), vec![(true, false), (false, true)]);
}

#[test]
fn an_optional_link_before_the_call_keeps_optional() {
    assert_eq!(only_call("o?.m<T>(x)"), (true, true));
    assert_eq!(only_call("a?.b.c<T>(x)"), (true, true));
}

#[test]
fn an_optional_link_deeper_in_the_callee_chain_keeps_optional() {
    assert_eq!(calls("o?.m(x).n<T>(y)"), vec![(true, true), (true, false)]);
    assert_eq!(
        calls("o?.m<T>(x).n<U>(y)"),
        vec![(true, true), (true, true)]
    );
}

#[test]
fn an_optional_call_with_type_arguments_keeps_optional() {
    assert_eq!(only_call("f?.<T>(x)"), (true, true));
}

#[test]
fn a_call_with_no_type_arguments_always_keeps_optional() {
    for expr in ["f(x)", "o.m(x)"] {
        assert_eq!(only_call(expr), (true, false), "{expr}");
    }
    assert_eq!(only_call("f?.(x)"), (true, false));
    assert_eq!(only_call("o?.m(x)"), (true, false));
}
