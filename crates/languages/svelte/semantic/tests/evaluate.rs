use oxc_allocator::Allocator;
use oxc_ast::ast::Statement;
use rsvelte_svelte_semantic::compiler_syntax_tree::lower;
use rsvelte_svelte_semantic::evaluate::{Evaluation, Evaluator, Value};
use rsvelte_svelte_semantic::resolve::{Resolution, resolve};

/// The resolution of a component whose instance script is `script`.
fn resolution(script: &str) -> Resolution {
    // TypeScript parses every script these tests write.
    let source = format!("<script lang=\"ts\">{script}</script>");
    let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
    let lowered = lower(&component, &source);
    resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        None,
        &lowered,
    )
}

/// The value of the last statement of `script`, an expression.
fn evaluate(script: &str) -> Evaluation {
    let resolution = resolution(script);
    let program = resolution
        .semantic()
        .nodes()
        .iter()
        .find_map(|node| match node.kind() {
            oxc_ast::AstKind::Program(program) => Some(program),
            _ => None,
        })
        .expect("a program");
    let Some(Statement::ExpressionStatement(statement)) = program.body.last() else {
        unreachable!("the last statement is an expression")
    };
    Evaluator::new(&resolution).evaluate(&statement.expression)
}

#[test]
fn global_folding_preserves_known_and_unknown_results() {
    for (source, expected) in [
        ("Math.max(1, Math.floor(3.5));", Value::Number(3.0)),
        ("Math.max(1, 7, 3, 2);", Value::Number(7.0)),
        ("Math.max(1, 2, 3n);", Value::Unknown),
        ("Math.max(1, missing, 3);", Value::AnyNumber),
        ("String();", Value::String(String::new())),
        ("Number.isFinite(2);", Value::Boolean(true)),
        ("Math.PI;", Value::Number(std::f64::consts::PI)),
        ("String(12);", Value::String("12".into())),
        ("Math.max(1n, 2);", Value::Unknown),
        ("Math.max(x, 2);", Value::AnyNumber),
        ("Math.random();", Value::AnyNumber),
        ("Math.PI.extra;", Value::Unknown),
        ("Math['PI'];", Value::Unknown),
        ("const Math = 0; Math.PI;", Value::Unknown),
        ("const Number = 0; Number.isFinite(2);", Value::Unknown),
    ] {
        assert_eq!(evaluate(source).value, expected, "{source}");
    }
}

#[test]
fn binding_cycles_terminate_and_do_not_leak_between_expressions() {
    for source in ["const a = a; a;", "const a = b; const b = a; a;"] {
        assert!(evaluate(source).has_unknown, "{source}");
    }
    assert_eq!(evaluate("const a = 2; a + a;").value, Value::Number(4.0));
    let mut source = String::from("const v0 = 1;");
    for index in 1..160 {
        use std::fmt::Write;
        write!(source, "const v{index} = v{};", index - 1).expect("a string");
    }
    source.push_str("v159 + v159;");
    assert_eq!(evaluate(&source).value, Value::Number(2.0));
}

#[test]
fn alternatives_keep_value_order_and_flags() {
    let result = evaluate("flag ? 'first' : 'last';");
    assert_eq!(
        result.values,
        [Value::String("first".into()), Value::String("last".into())]
    );
    assert_eq!(result.value, Value::String("last".into()));
    assert!(!result.is_known);
    assert!(result.is_string && result.is_defined);
    let result = evaluate("flag ? 'same' : 'same';");
    assert!(result.is_known);
    assert_eq!(result.values.len(), 1);
    let result = evaluate("flag ? null : missing;");
    assert!(!result.is_defined);
    assert!(result.has_unknown);

    let result = evaluate("flag ? 1 : 2;");
    assert!(!result.is_known);
    assert!(result.is_number && result.is_defined);
    assert!(!result.is_string);
    let result = evaluate("flag ? 1 : '2';");
    assert!(!result.is_known && !result.has_unknown);
    assert!(!result.is_string && !result.is_number && !result.is_function);
    let result = evaluate("flag ? (() => 1) : (() => 2);");
    assert!(!result.is_known);
    assert!(result.is_function && result.is_defined);
}

#[test]
fn output_identifiers_use_the_source_scope() {
    let resolution = resolution("const value = 3;");
    let allocator = Allocator::default();
    // Parsed apart from the component, so the analysis never resolved it.
    let output = oxc_parser::Parser::new(&allocator, "value", oxc_span::SourceType::mjs())
        .parse_expression()
        .expect("an expression");
    let mut evaluator = Evaluator::in_scope(&resolution, resolution.instance_scope());
    for _ in 0..2 {
        assert_eq!(evaluator.evaluate(&output).value, Value::Number(3.0));
    }
}

#[test]
fn an_output_identifier_folds_through_its_bindings_rune() {
    let resolution = resolution("let text = $state('Hello');");
    let allocator = Allocator::default();
    let output = oxc_parser::Parser::new(&allocator, "text", oxc_span::SourceType::mjs())
        .parse_expression()
        .expect("an expression");
    let mut evaluator = Evaluator::in_scope(&resolution, resolution.instance_scope());
    assert_eq!(
        evaluator.evaluate(&output).value,
        Value::String("Hello".into())
    );
}

#[test]
fn a_string_converts_to_a_number_or_a_bigint_after_javascript_trims_it() {
    for (source, number) in [
        (r#""﻿ 2 " * 1;"#, Some(2.0)),
        (r#""　 2" * 1;"#, Some(2.0)),
        (r#""\u0085" * 1;"#, None),
        (r#""2\u0085" * 1;"#, None),
    ] {
        match (evaluate(source).value, number) {
            (Value::Number(value), Some(number)) => assert_eq!(value, number, "{source}"),
            (Value::Number(value), None) => assert!(value.is_nan(), "{source}"),
            (value, _) => panic!("{source} is {value:?}"),
        }
    }
    for (source, expected) in [(r#"1n < "\uFEFF2";"#, true), (r#"1n < "\u00852";"#, false)] {
        assert_eq!(evaluate(source).value, Value::Boolean(expected), "{source}");
    }
}

#[test]
fn types_around_a_binding_and_its_initial_fold_away() {
    let folded =
        evaluate("let count = $state(1)!; let double = $derived(count! * 2)!; double! as number;");
    assert_eq!(folded.value, Value::Number(2.0));
}

#[test]
fn a_regular_expression_is_one_known_object_per_literal() {
    let string = |s: &str| Value::String(s.into());
    // From the official compiler's server output.
    for (source, expected) in [
        ("const re = /a[/]b/ig; String(re);", string("/a[/]b/gi")),
        ("const re = /a[/]b/ig; re + 1;", string("/a[/]b/gi1")),
        (
            "const re = /a[/]b/ig; re == '/a[/]b/gi';",
            Value::Boolean(true),
        ),
        ("const re = /a[/]b/ig; re === re;", Value::Boolean(true)),
        (
            "const re = /x/; const other = /x/; re === other;",
            Value::Boolean(false),
        ),
        (
            "const re = /x/; const other = /x/; re == other;",
            Value::Boolean(false),
        ),
        ("const re = /x/; typeof re;", string("object")),
        ("const re = /x/; !re;", Value::Boolean(false)),
        ("const re = /x/; re < 'b';", Value::Boolean(true)),
    ] {
        assert_eq!(evaluate(source).value, expected, "{source}");
    }
    assert!(evaluate("/x/;").is_known);
    assert_eq!(
        evaluate("const re = /x/; -re;")
            .value
            .to_javascript_string(),
        "NaN"
    );
}

#[test]
fn props_id_is_some_string_and_effect_tracking_either_boolean() {
    let id = evaluate("const uid = $props.id(); uid;");
    assert_eq!(id.values, [Value::AnyString]);
    assert!(id.is_string && id.is_defined && !id.is_known);
    assert_eq!(
        evaluate("$effect.tracking();").values,
        [Value::Boolean(false), Value::Boolean(true)]
    );
}

#[test]
fn an_exported_binding_is_not_constant() {
    assert!(evaluate("let klass = ''; klass;").is_known);
    assert!(!evaluate("let klass = ''; export { klass }; klass;").is_known);
}
