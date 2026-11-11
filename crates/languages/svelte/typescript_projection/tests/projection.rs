use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::parse::parse;
use rsvelte_svelte_typescript_projection::syntax_tree::{Node, NodeIdentifier, SyntaxTree};

fn project(source: &str) -> (SyntaxTree, rsvelte_kernel::output::emitter::Emitter) {
    let component = parse(source).expect("valid Svelte source");
    let before = format!("{component:?}");
    let tree = rsvelte_svelte_typescript_projection::lower_alone(&component, source)
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
    let source = "<p on:click={handler}></p>";
    let component = parse(source).expect("valid Svelte source");
    let error = rsvelte_svelte_typescript_projection::lower_alone(&component, source)
        .expect_err("event directives need their own type semantics");
    assert_eq!(error.span().text(source), "on:click={handler}");
}

#[test]
fn props_beside_a_binding_called_props_subscribes_to_a_store() {
    let rune = "<script>let { a } = $props();</script>{a}";
    assert!(project(rune).1.out.contains("__rsvelte_props"));
    let store = "<script>import { props } from './p.js'; let { a } = $props();</script>{a}";
    assert!(!project(store).1.out.contains("__rsvelte_props"));
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
            "        \"title\": text,\n",
            "        \"data-label\": `café\n  🚀`,\n",
            "      });\n",
            "      (text);\n",
            "    }\n",
            "  }\n",
            "};\n",
            "const $$Component = __rsvelte_export_component<__rsvelte_no_props, {}, \"\">();\n",
            "type $$Component = ReturnType<typeof $$Component>;\n",
            "export default $$Component;\n",
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

#[test]
fn a_style_sheet_error_does_not_stop_the_content_mapper() {
    let mut output = rsvelte_kernel::output::structured_data::StructuredDataWriter::new(false);
    rsvelte_svelte_typescript_projection::content_mapper::write_transform(
        "<script>let a = 1;</script><style>a { b: c; </style>",
        &mut output,
    );
    let output = output.finish();
    assert!(!output.contains("\"diagnostics\""), "{output}");
    assert!(output.contains("let a = 1;"), "{output}");
}

#[test]
fn a_typed_each_context_drops_its_annotation_as_svelte2tsx_does() {
    let source = "<script lang=\"ts\">let letters = ['a'];</script>\
                  {#each letters as letter: string, i}<span>{i}{letter}</span>{/each}";
    let (_, output) = project(source);
    assert!(
        output
            .out
            .contains("for (let [i, letter] of __rsvelte_each(letters))"),
        "{}",
        output.out
    );
    assert!(!output.out.contains(": string"), "{}", output.out);
}

#[test]
fn a_prop_default_that_reads_a_sibling_infers_no_cycle() {
    let source =
        "<script lang=\"ts\">let { a, b = 5, c = b, d = a, e = a.length } = $props();</script>";
    let (_, output) = project(source);
    let props = &output.out[output
        .out
        .find("const __rsvelte_public_props0")
        .expect("the props are inferred")..];
    // From svelte2tsx: `c?: typeof b`, and `any` for a default that reads a prop another way.
    for expected in [
        "b: 5,",
        "c: 5,",
        "d: __rsvelte_untyped_prop(),",
        "e: __rsvelte_untyped_prop(),",
    ] {
        assert!(props.contains(expected), "{expected}\n{}", output.out);
    }
}

#[test]
fn a_store_subscription_is_declared_where_svelte2tsx_declares_it() {
    let source = "<script lang=\"ts\" module>let m = 1;</script>\
                  <script lang=\"ts\">let a = 1; import { i } from \"./i\";\
                  const w = i; function f() {} let { p } = $props();</script>\
                  {$m}{$i}{$w}{$f}{$p}{$a}";
    let (_, output) = project(source);
    let out = &output.out;
    let declaration = |name: &str| {
        out.find(&format!(
            ";let ${name}!: __rsvelte_store_value<typeof {name}>;"
        ))
    };
    let declared = |name: &str| declaration(name).unwrap_or_else(|| panic!("${name}\n{out}"));
    let at = |text: &str| out.find(text).unwrap_or_else(|| panic!("{text}\n{out}"));
    // After the statement that binds the store, and an import's first in the instance.
    assert!(declared("m") > at("let m = 1;"), "{out}");
    assert!(declared("w") > at("const w = i;"), "{out}");
    assert!(declared("p") > at("$props();"), "{out}");
    assert!(declared("a") > at("let a = 1;"), "{out}");
    assert!(
        at("let m = 1;") < declared("i") && declared("i") < at("let a = 1;"),
        "{out}"
    );
    // svelte2tsx declares none for a function.
    assert_eq!(declaration("f"), None, "{out}");
}

#[test]
fn component_content_passes_children_where_svelte2tsx_maps_them() {
    // The offsets svelte2tsx 0.7.63's source map gives its `children` key, in the template.
    let cases: &[(&str, Option<usize>)] = &[
        ("<Foo>hi</Foo>", Some(3)),
        ("<Foo a={1}>hi</Foo>", Some(7)),
        ("<Foo\n  a={1}>hi</Foo>", Some(5)),
        ("<Foo a={1}\n>hi</Foo>", Some(7)),
        ("<Foo {...x}>hi</Foo>", Some(5)),
        ("<Foo a=\"s\">hi</Foo>", Some(7)),
        ("<Foo a>hi</Foo>", Some(3)),
        ("<Foo {x}>hi</Foo>", Some(5)),
        ("<Foo  a={1}>hi</Foo>", Some(5)),
        ("<Foo\n>hi</Foo>", Some(3)),
        ("<Foo a={1} b={2}>hi</Foo>", Some(13)),
        ("<p><Foo>hi</Foo></p>", Some(6)),
        ("<Foo> \n<!-- c --> </Foo>", None),
        ("<Foo><p slot=\"x\"></p><slot /></Foo>", None),
        ("<Foo><p slot=\"default\"></p></Foo>", Some(3)),
    ];
    for &(template, expected) in cases {
        let script = "<script lang=\"ts\">import Foo from \"./Foo.svelte\"; let x = {};</script>\n";
        let source = format!("{script}{template}");
        let (_, output) = project(&source);
        let key = output.out.find("children: __rsvelte_children").map(|at| {
            let at = at as u32;
            let mapped = output.lookup_span(Span::new(at, at + 8)).expect("mapped");
            assert_eq!(mapped.start_offset, mapped.end_offset, "{template}");
            mapped.start_offset as usize - script.len()
        });
        assert_eq!(key, expected, "{template}\n{}", output.out);
    }
}

#[test]
fn a_default_slot_lets_the_component_take_children_as_svelte2tsx_does() {
    let widened = "__rsvelte_props_with_children<__rsvelte_no_props>";
    for (source, expected) in [
        ("<div><slot /></div>", true),
        ("<slot name=\"default\" />", true),
        ("<slot name=\"x\" />", false),
        ("<div></div>", false),
    ] {
        let (_, output) = project(source);
        assert_eq!(
            output.out.contains(widened),
            expected,
            "{source}\n{}",
            output.out
        );
    }
}

#[test]
fn a_component_s_snippets_are_props_after_its_attributes_as_svelte2tsx_passes_them() {
    let source = "<script lang=\"ts\">import Foo from \"./Foo.svelte\"; let n = 1;</script>\
                  <Foo a={n}>{#snippet head(x: number)}<b>{x}</b>{/snippet}text\
                  {#snippet foot}{n}{/snippet}</Foo>";
    let (_, output) = project(source);
    let out = &output.out;
    let at = |text: &str| out.find(text).unwrap_or_else(|| panic!("{text}\n{out}"));
    // The implicit children, the attributes, then the snippets in source order.
    assert!(at("children: __rsvelte_children") < at("\"a\": n"), "{out}");
    assert!(at("\"a\": n") < at("head: (x: number) => {"), "{out}");
    assert!(at("head: (x: number) => {") < at("foot: () => {"), "{out}");
    assert!(
        at("foot: () => {") < at("const { head, foot } = __rsvelte_component_props("),
        "{out}"
    );
    let head = at("head: (") as u32;
    let mapped = output
        .lookup_span(Span::new(head, head + 4))
        .expect("mapped");
    assert_eq!(mapped.text(source), "head");
    // Snippets that are not a component's children still refuse.
    let error = rsvelte_svelte_typescript_projection::lower_alone(
        &parse("{#snippet s()}{/snippet}").expect("valid"),
        "{#snippet s()}{/snippet}",
    )
    .expect_err("a template snippet is not projected yet");
    assert_eq!(
        error.span().text("{#snippet s()}{/snippet}"),
        "{#snippet s()}{/snippet}"
    );
}

#[test]
fn an_element_s_number_only_attribute_is_a_number_as_svelte2tsx_writes_it() {
    let source = "<div tabindex=\"-1\" aria-valuemin=\"0\" title=\"1\" rows=\"x\"></div>";
    let (_, output) = project(source);
    for text in [
        "\"tabindex\": -1,",
        "\"aria-valuemin\": 0,",
        "\"title\": \"1\",",
        "\"rows\": \"x\",",
    ] {
        assert!(output.out.contains(text), "{text}\n{}", output.out);
    }
}

#[test]
fn a_slot_s_attributes_are_its_props_and_not_an_element_s() {
    let source = "<slot name=\"row\" {a} tabIndex=\"1\" /><slot b={1} />";
    let (_, output) = project(source);
    for text in [
        "__rsvelte_slots()(\"row\", {\n",
        "\"tabIndex\": \"1\",",
        "__rsvelte_slots()(\"default\", {\n",
        "\"b\": 1,",
    ] {
        assert!(output.out.contains(text), "{text}\n{}", output.out);
    }
    assert!(!output.out.contains("\"name\""), "{}", output.out);
}

#[test]
fn a_component_s_slots_type_check_against_its_slots_interface() {
    let source = "<script lang=\"ts\">interface $$Slots { row: { a: number } }</script><slot name=\"row\" a={1} />";
    let (_, output) = project(source);
    assert!(
        output
            .out
            .contains("__rsvelte_slots<$$Slots>()(\"row\", {\n"),
        "{}",
        output.out
    );
}

#[test]
fn a_component_is_named_from_its_file_as_svelte2tsx_names_it() {
    use rsvelte_svelte_typescript_projection::component_name;
    assert_eq!(
        component_name("src/lib/CitationTooltip.svelte"),
        "CitationTooltip__SvelteComponent_"
    );
    assert_eq!(
        component_name("src/routes/+page.svelte"),
        "Page__SvelteComponent_"
    );
    assert_eq!(
        component_name("src/lib/my-button_group.svelte"),
        "MyButtonGroup__SvelteComponent_"
    );
    assert_eq!(
        component_name("src/routes/[id].svelte"),
        "Id__SvelteComponent_"
    );
    assert_eq!(
        component_name("src/lib/Button.stories.svelte"),
        "Button__SvelteComponent_"
    );
    assert_eq!(component_name("src/lib/404.svelte"), "A4__SvelteComponent_");
}
