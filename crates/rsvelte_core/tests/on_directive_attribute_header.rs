use oxc_allocator::Allocator;
use rsvelte_core::ast::{Attribute, TemplateNode};
use rsvelte_core::error::ParseError;
use rsvelte_core::{ParseOptions, parse};

#[test]
fn unicode_name_comments_and_modifiers_preserve_attribute_header() {
    let source =
        "<button // line α\n\t/* block β */ on:東京|once|capture|trusted={handler}></button>";
    let root = parse(source, &Allocator::default(), ParseOptions::default()).expect("parse");

    assert_eq!(root.comments.len(), 2);
    assert_eq!(root.comments[0].value, " line α");
    assert_eq!(root.comments[1].value, " block β ");

    let TemplateNode::RegularElement(element) = &root.fragment.nodes[0] else {
        panic!("expected regular element");
    };
    let Attribute::OnDirective(directive) = &element.attributes[0] else {
        panic!("expected on directive");
    };

    assert_eq!(directive.name, "東京");
    assert_eq!(
        directive
            .modifiers
            .iter()
            .map(|modifier| modifier.as_str())
            .collect::<Vec<_>>(),
        ["once", "capture", "trusted"]
    );

    let loc = directive.name_loc.as_ref().expect("name location");
    assert_eq!(loc.start.line, 2);
    assert_eq!(loc.end.line, 2);
    assert_eq!(
        &source[loc.start.character as usize..loc.end.character as usize],
        "on:東京|once|capture|trusted"
    );
}

#[test]
fn plain_string_event_handler_remains_invalid() {
    let error = parse(
        r#"<button on:click="handler"></button>"#,
        &Allocator::default(),
        ParseOptions::default(),
    )
    .expect_err("plain directive value must fail");

    assert!(matches!(
        error,
        ParseError::SvelteError { ref code, .. } if code == "directive_invalid_value"
    ));
}
