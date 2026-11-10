use rsvelte_svelte_syntax::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

#[test]
fn quoted_values_keep_unicode_and_expression_boundaries() {
    let text = "日本語🙂".repeat(40);
    for quote in ['\'', '"'] {
        let source = format!("<div title={quote}{text}{{value}}終わり{quote}></div>");
        let component = parse(&source).expect("quoted value");
        component.tokens.check_lossless(&source).expect("all bytes");
        let AttributeValue::Parts(parts) = component.attributes[0].value else {
            panic!("a quoted attribute has parts");
        };
        let [
            Part::Text(before),
            Part::Expression { span, .. },
            Part::Text(after),
        ] = component.parts(parts)
        else {
            panic!("text, expression, text");
        };
        assert_eq!(before.text(&source), text);
        assert_eq!(span.text(&source), "{value}");
        assert_eq!(after.text(&source), "終わり");
    }
}

#[test]
fn unquoted_values_keep_slashes() {
    for (source, expected) in [
        ("<div title=日本語🙂/path/>", "日本語🙂/path"),
        ("<div title=/></div>", "/"),
    ] {
        let component = parse(source).expect("unquoted value");
        component.tokens.check_lossless(source).expect("all bytes");
        let AttributeValue::Parts(parts) = component.attributes[0].value else {
            panic!("an unquoted attribute has parts");
        };
        let [Part::Text(span)] = component.parts(parts) else {
            panic!("one text part");
        };
        assert_eq!(span.text(source), expected);
    }
}

#[test]
fn empty_and_adjacent_expression_values_keep_their_parts() {
    let source = r#"<div empty="" value="{left}{right}"/>"#;
    let component = parse(source).expect("attributes");
    component.tokens.check_lossless(source).expect("all bytes");
    let AttributeValue::Parts(empty) = component.attributes[0].value else {
        panic!("empty value has parts");
    };
    let [Part::Text(span)] = component.parts(empty) else {
        panic!("one empty text part");
    };
    assert!(span.is_empty());
    let AttributeValue::Parts(expressions) = component.attributes[1].value else {
        panic!("expression value has parts");
    };
    assert!(matches!(
        component.parts(expressions),
        [Part::Expression { .. }, Part::Expression { .. }]
    ));
}

#[test]
fn raw_elements_and_textarea_keep_their_closing_rules() {
    for source in [
        "<script>let text = '</scriptx>';</script \n>",
        "<style>p { color: red }</style\t>",
        "<div><script>日本語</script><style>🙂</style></div>",
        "<textarea>日本語 <tag>🙂{value}</TEXTAREA \n>",
    ] {
        let component = parse(source).expect("raw element");
        component.tokens.check_lossless(source).expect("all bytes");
    }
}

#[test]
fn debug_tags_keep_single_and_multiple_identifiers() {
    for (source, count) in [("{@debug left}", 1), ("{@debug left, right}", 2)] {
        let component = parse(source).expect("debug tag");
        component.tokens.check_lossless(source).expect("all bytes");
        let TemplateNode::Debug { identifiers, .. } = component.nodes[0] else {
            panic!("debug node");
        };
        assert_eq!(component.javascript_list(identifiers).len(), count);
        assert_eq!(component.template_expressions.len(), count);
    }
}

#[test]
fn unterminated_values_report_the_utf8_byte_offset() {
    let source = "<div title=\"日本語🙂";
    let error = parse(source).expect_err("unterminated quote");
    assert_eq!(error.message, "unexpected end of input");
    assert_eq!(error.span.start_offset as usize, source.len());
}

#[test]
fn component_names_keep_their_member_tree_and_source_positions() {
    use rsvelte_typescript_syntax::{Kind, NodeIdentifier};
    let source = "<UI.Button /><item.component /><div />";
    let parsed = parse(source).expect("component tags");
    parsed.tokens.check_lossless(source).expect("all bytes");
    for (index, object_name, property_name) in [(0, "UI", "Button"), (1, "item", "component")] {
        let TemplateNode::Element { component, .. } = parsed.nodes[index] else {
            panic!("an element");
        };
        let Kind::Member {
            object,
            property,
            computed: false,
            ..
        } = parsed.javascript.kind(component)
        else {
            panic!("a member reference");
        };
        for (node, name) in [(object, object_name), (property, property_name)] {
            assert_eq!(parsed.javascript.name(node), name);
            assert_eq!(
                parsed
                    .javascript
                    .source_location(node)
                    .span()
                    .expect("source position")
                    .text(source),
                name
            );
        }
    }
    let TemplateNode::Element { component, .. } = parsed.nodes[2] else {
        panic!("an element");
    };
    assert_eq!(component, NodeIdentifier::NONE);
}

#[test]
fn a_declaration_tag_takes_one_semicolon_and_a_snippet_keeps_its_type_parameters() {
    for source in ["{let a;}", "{let a = 1 ;  }", "{const a = 1;}"] {
        let component = parse(source).expect("one `;` after the declaration");
        component.tokens.check_lossless(source).expect("all bytes");
    }
    assert!(parse("{let a;;}").is_err(), "Svelte takes one `;` only");

    let source = "<script lang=\"ts\"></script>{#snippet f<T, U>(a: T)}x{/snippet}";
    let component = parse(source).expect("a typed snippet");
    let type_parameters = component.nodes.iter().find_map(|n| match n {
        TemplateNode::Snippet {
            type_parameters, ..
        } => Some(*type_parameters),
        _ => None,
    });
    assert_eq!(
        type_parameters.flatten().map(|s| s.text(source)),
        Some("<T, U>")
    );
}

/// Each start offset is the official compiler's.
#[test]
fn a_template_name_is_no_reserved_word() {
    for (source, word, start_offset) in [
        ("{#each [1] as static}{/each}", "static", 14),
        ("{#each [1] as x, let}{/each}", "let", 17),
        ("{#snippet package()}{/snippet}", "package", 10),
        ("<div {this}></div>", "this", 6),
        ("{#if true}{@const eval = 1}{eval}{/if}", "eval", 18),
        ("{#await p then arguments}{/await}", "arguments", 15),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "unexpected_reserved_word", "{source}");
        assert!(
            error
                .message
                .starts_with(&format!("'{word}' is a reserved word")),
            "{source}"
        );
        assert_eq!(error.span.start_offset, start_offset, "{source}");
    }
    for source in ["{#each [1] as statics}{/each}", "<div {lets}></div>"] {
        parse(source).expect(source);
    }
}

/// Upstream's parser skips `/\s/`, JavaScript's whitespace, in tags and blocks alike.
#[test]
fn tags_and_blocks_skip_javascript_whitespace() {
    for source in [
        "<div\u{a0}class=\"a\">x</div>",
        "{#if\u{a0}x}y{/if}",
        "{#each\u{a0}xs\u{a0}as\u{a0}x}{x}{/each}",
        "<p>{@html\u{3000}x}</p>",
        "<div\u{2028}a\u{feff}=1></div>",
    ] {
        let component = parse(source).unwrap_or_else(|error| panic!("{source}: {error:?}"));
        component.tokens.check_lossless(source).expect("all bytes");
    }
}

/// Upstream ends an unquoted value, and the text after an expression value, at `/\s/`.
#[test]
fn attribute_values_end_at_javascript_whitespace() {
    for source in [
        "<div a=x\u{a0}b></div>",
        "<div a=x\u{b}b></div>",
        "<div a=x\u{3000}b></div>",
        "<div a={1}\u{a0}b=2></div>",
        "<Foo a={n}\u{2029}b={1} />",
    ] {
        let component = parse(source).unwrap_or_else(|error| panic!("{source}: {error:?}"));
        component.tokens.check_lossless(source).expect("all bytes");
        assert_eq!(component.attributes.len(), 2, "{source}");
        let AttributeValue::Parts(parts) = component.attributes[0].value else {
            panic!("{source}: the first attribute has a value");
        };
        assert_eq!(component.parts(parts).len(), 1, "{source}");
    }
}

/// Upstream's parser raises `attribute_duplicate` while it reads a start tag, root tags included.
#[test]
fn a_name_given_twice_in_a_start_tag_is_attribute_duplicate() {
    for (source, duplicate) in [
        ("<div a=1 a=2></div>", Some("a=2")),
        ("<div {a} a={b}></div>", Some("a={b}")),
        ("<input value={a} bind:value={b} />", Some("bind:value={b}")),
        ("<div class:a class:a={b}></div>", Some("class:a={b}")),
        (
            "<div style:a=\"1\" style:a=\"2\"></div>",
            Some("style:a=\"2\""),
        ),
        (
            "<script lang=\"ts\" lang=\"ts\"></script>",
            Some("lang=\"ts\""),
        ),
        ("<div class=\"a\" class:a style:a></div>", None),
        (
            "<svelte:element this={a} bind:this={b}></svelte:element>",
            None,
        ),
        ("<div a=1></div><div a=1></div>", None),
    ] {
        match (parse(source), duplicate) {
            (Err(error), Some(text)) => {
                assert_eq!(error.code, "attribute_duplicate", "{source}");
                assert_eq!(error.span.text(source), text, "{source}");
            }
            (Ok(_), None) => {}
            (outcome, _) => panic!("{source}: {:?}", outcome.err()),
        }
    }
}
