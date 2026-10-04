use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_hir::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};
use rsvelte_svelte_semantic::semantic::evaluate::{Evaluation, Evaluator, Tree, Value};
use rsvelte_svelte_semantic::semantic::resolve;
use rsvelte_typescript::{Kind, SyntaxTree, parser};

fn evaluate(source: &str) -> Evaluation {
    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("valid JavaScript");
    let Kind::Program(body) = tree.kind(program) else {
        unreachable!("a program")
    };
    let Kind::ExpressionStatement(expression) = tree.kind(*body.last().expect("a statement"))
    else {
        unreachable!("the last statement is an expression")
    };
    let compiler_syntax_tree =
        CompilerSyntaxTreeBuilder::new(source, 0, 0).finish(Children::default());
    let resolution = resolve::resolve(&tree, program, &compiler_syntax_tree);
    resolution.evaluate(&tree, source, expression)
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
    let source = "const value = 3;";
    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("a program");
    let compiler_syntax_tree =
        CompilerSyntaxTreeBuilder::new(source, 0, 0).finish(Children::default());
    let resolution = resolve::resolve(&tree, program, &compiler_syntax_tree);
    let mut output = SyntaxTree::new();
    let expression = output.identifier("value");
    let scope = resolution.sem.scope_of(program).expect("a program scope");
    let mut evaluator = Evaluator::new(&tree, source, &resolution);
    for _ in 0..2 {
        assert_eq!(
            evaluator
                .evaluate(Tree::Output(&output, scope), expression)
                .value,
            Value::Number(3.0)
        );
    }
}
