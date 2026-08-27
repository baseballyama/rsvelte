use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn parse_to_value(source: &str) -> Value {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            capture_comments: true,
            ..ParseOptions::default()
        },
    )
    .expect("parse should succeed");

    with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap())
}

fn collect_nodes<'a>(value: &'a Value, node_type: &str, nodes: &mut Vec<&'a Value>) {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(node_type) {
                nodes.push(value);
            }
            for child in map.values() {
                collect_nodes(child, node_type, nodes);
            }
        }
        Value::Array(items) => {
            for item in items {
                collect_nodes(item, node_type, nodes);
            }
        }
        _ => {}
    }
}

#[test]
fn comment_before_template_expression_attaches_to_expression_before_quasi() {
    let source = r#"<script>
const value = `before ${
    // belongs to the arrow
    () => 1
} after`;
</script>"#;
    let value = parse_to_value(source);

    let mut arrows = Vec::new();
    collect_nodes(&value, "ArrowFunctionExpression", &mut arrows);
    let arrow = arrows.first().expect("arrow function");
    assert_eq!(
        arrow["leadingComments"][0]["value"],
        " belongs to the arrow"
    );

    let mut quasis = Vec::new();
    collect_nodes(&value, "TemplateElement", &mut quasis);
    assert_eq!(quasis.len(), 2);
    assert!(
        quasis
            .iter()
            .all(|quasi| quasi.get("leadingComments").is_none()),
        "a later quasi must not claim the expression's leading comment"
    );
}

#[test]
fn same_line_comment_after_statement_stays_trailing_in_attribute_expression() {
    let source = r#"<button onclick={() => {
    first = 1; // belongs to the first statement
    second = 2;
}}>click</button>"#;
    let value = parse_to_value(source);

    let mut statements = Vec::new();
    collect_nodes(&value, "ExpressionStatement", &mut statements);
    assert_eq!(statements.len(), 2);
    assert_eq!(
        statements[0]["trailingComments"][0]["value"],
        " belongs to the first statement"
    );
    assert!(
        statements[1].get("leadingComments").is_none(),
        "the next statement must not claim the preceding same-line comment"
    );
}

#[test]
fn comment_between_reactive_label_and_colon_attaches_to_body() {
    let source = r#"<script>
$ /* belongs to the body */ : value = 1;
</script>"#;
    let value = parse_to_value(source);

    let mut statements = Vec::new();
    collect_nodes(&value, "ExpressionStatement", &mut statements);
    let statement = statements.first().expect("reactive body statement");
    assert_eq!(
        statement["leadingComments"][0]["value"],
        " belongs to the body "
    );

    let mut identifiers = Vec::new();
    collect_nodes(&value, "Identifier", &mut identifiers);
    let label = identifiers
        .iter()
        .find(|identifier| identifier["name"] == "$")
        .expect("reactive label");
    assert!(
        label.get("trailingComments").is_none(),
        "the label must not claim a comment that precedes the body"
    );
}
