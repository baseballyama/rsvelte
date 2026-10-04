use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_typescript_projection::syntax_tree::{Node, NodeIdentifier, SyntaxTree};

fn project(source: &str) -> (SyntaxTree, rsvelte_kernel::output::emitter::Emitter) {
    let component = parse(source).expect("valid Svelte source");
    let before = format!("{component:?}");
    let tree = rsvelte_svelte_typescript_projection::lower(&component, source)
        .expect("supported template");
    assert_eq!(
        format!("{component:?}"),
        before,
        "lowering must leave the source AST unchanged"
    );
    let output = rsvelte_svelte_typescript_projection::emit(&tree, source);
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output.out, SourceType::ts()).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "invalid generated TypeScript: {:?}\n{}",
        parsed.diagnostics,
        output.out
    );
    (tree, output)
}

#[test]
fn javascript_and_scriptless_templates_can_be_projected() {
    for source in ["<p>{missing}</p>", "<script>let n = 1;</script><p>{n}</p>"] {
        let (tree, output) = project(source);
        assert!(
            !tree.children(tree.root()).is_empty(),
            "the template must have a lowered AST"
        );
        assert!(
            output.out.contains("svelteHTML.createElement"),
            "element checking must be emitted"
        );
    }
}

#[test]
fn types_and_source_positions_survive_lowering() {
    let source = r#"<script lang="ts">let x: number | null = 1;</script><p>{x! as number}</p>"#;
    let (_, output) = project(source);
    let expression = "x! as number";
    let start = output
        .out
        .find(expression)
        .expect("the TypeScript suffix is preserved") as u32;
    let span = output
        .lookup_span(Span::new(start, start + expression.len() as u32))
        .expect("the user expression has a source map");
    assert_eq!(
        span.text(source),
        expression,
        "the whole type assertion must map back"
    );
    assert!(
        output.out.contains("x: number | null"),
        "script annotations must be preserved"
    );
}

#[test]
fn expressions_cannot_change_statement_structure() {
    project(
        r#"<script lang="ts">let a = 1, b = 2; let props = {};</script>
        <p {...props} data-value={(a, b)} title="a`\\${a}">{({ a })}{(a, b)}</p>"#,
    );
}

#[test]
fn control_flow_is_represented_in_the_output_tree() {
    let (tree, _) = project("{#if value}<p>{value}</p>{:else}<span>empty</span>{/if}");
    let root = template_nodes(&tree);
    assert!(
        matches!(
            tree.node(root[0]),
            Node::If {
                alternate: Some(_),
                ..
            }
        ),
        "if branches must remain AST nodes"
    );
}

#[test]
fn element_and_attachment_semantics_are_lowered_before_printing() {
    let source = "<p {@attach attach} />";
    let (tree, output) = project(source);
    let Node::Block { body } = tree.node(template_nodes(&tree)[0]) else {
        panic!("an element introduces a block");
    };
    let Node::Statement(call) = tree.node(tree.children(body)[0]) else {
        panic!("the element helper is an expression statement");
    };
    let Node::Call { callee, arguments } = tree.node(call) else {
        panic!("the helper call exists before printing");
    };
    let Node::Member { object, property } = tree.node(callee) else {
        panic!("the element helper is a member access");
    };
    assert!(matches!(tree.node(object), Node::Identifier("svelteHTML")));
    assert!(matches!(
        tree.node(property),
        Node::Identifier("createElement")
    ));
    let Node::Object { properties } = tree.node(tree.children(arguments)[1]) else {
        panic!("element attributes form an object expression");
    };
    let Node::ComputedProperty { key, value } = tree.node(tree.children(properties)[0]) else {
        panic!("an attachment has a computed property key");
    };
    let Node::Call { callee, arguments } = tree.node(key) else {
        panic!("the attachment key is a call expression");
    };
    assert!(matches!(tree.node(callee), Node::Identifier("Symbol")));
    assert!(matches!(
        tree.node(tree.children(arguments)[0]),
        Node::StringLiteral("@attach")
    ));
    let Node::Source(expression) = tree.node(value) else {
        panic!("the attachment value refers to the source AST");
    };
    assert_eq!(expression.span.text(source), "attach");
    let start = output.out.rfind("attach").unwrap() as u32;
    assert_eq!(
        output
            .lookup_span(Span::new(start, start + 6))
            .unwrap()
            .text(source),
        "attach"
    );
}

#[test]
fn unsupported_semantics_are_reported_at_the_original_construct() {
    let source = "<input bind:value={value}>";
    let component = parse(source).expect("valid Svelte source");
    let error = rsvelte_svelte_typescript_projection::lower(&component, source)
        .expect_err("bindings need their own type semantics");
    assert_eq!(error.span().text(source), "bind:value={value}");
}

#[test]
fn projection_trees_are_send_and_sync() {
    fn check<T: Send + Sync>() {}
    check::<SyntaxTree>();
}

#[test]
fn the_independent_parser_detects_a_broken_generated_call() {
    let (_, output) = project("<p>{value}</p>");
    let defect = output.out.replacen("});", "};", 1);
    assert_ne!(defect, output.out, "the control must introduce a defect");
    let allocator = Allocator::default();
    let result = Parser::new(&allocator, &defect, SourceType::ts()).parse();
    assert!(
        !result.diagnostics.is_empty(),
        "the syntax verifier must reject the defect"
    );
}

#[test]
fn nested_output_is_readable_and_copied_literals_keep_their_bytes() {
    let source = "{#if ready}<p title={text} data-label={`café\n  🚀`}>{text}</p>{/if}";
    let (_, output) = project(source);
    assert_eq!(
        output.out,
        concat!(
            ";\n() => {\n",
            "  if (ready) {\n",
            "    {\n",
            "      svelteHTML.createElement(\"p\", {\n",
            "        title: text,\n",
            "        \"data-label\": `café\n  🚀`,\n",
            "      });\n",
            "      (text);\n",
            "    }\n",
            "  }\n",
            "};\n",
            "export default __rsvelte_export_component<Record<string, never>, {}, \"\">();\n",
        )
    );
    for mapping in output.mappings.iter().filter(|mapping| mapping.len > 0) {
        let generated = Span::new(mapping.generated, mapping.generated + mapping.len);
        let original = Span::new(mapping.source_text, mapping.source_text + mapping.len);
        assert_eq!(generated.text(&output.out), original.text(source));
    }
}

fn template_nodes(tree: &SyntaxTree) -> &[NodeIdentifier] {
    for &identifier in tree.children(tree.root()) {
        if let Node::Statement(value) = tree.node(identifier)
            && let Node::Arrow { body } = tree.node(value)
        {
            return tree.children(body);
        }
    }
    panic!("the template has a deferred function");
}
