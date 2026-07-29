use oxc_allocator::Allocator;
use rsvelte_core::ast::{Attribute, SourceLocation, TemplateNode};
use rsvelte_core::error::ParseError;
use rsvelte_core::{ParseOptions, parse};

fn location_text<'a>(source: &'a str, loc: Option<&SourceLocation>) -> &'a str {
    let loc = loc.expect("name location");
    &source[loc.start.character as usize..loc.end.character as usize]
}

#[test]
fn directive_locations_cover_the_full_unicode_attribute_names() {
    let source = concat!(
        "<div // line α\n",
        "  bind:value|group={value}\n",
        "  /* block β */ use:動作={action}\n",
        "  class:有効={active}\n",
        "  style:色|important=\"red\"\n",
        "  transition:遷移|global={params}\n",
        "  animate:反転={params}\n",
        "  let:項目={item}\n",
        "></div>"
    );
    let root = parse(source, &Allocator::default(), ParseOptions::default()).expect("parse");

    assert_eq!(root.comments.len(), 2);
    assert_eq!(root.comments[0].value, " line α");
    assert_eq!(root.comments[1].value, " block β ");

    let TemplateNode::RegularElement(element) = &root.fragment.nodes[0] else {
        panic!("expected regular element");
    };
    assert_eq!(element.attributes.len(), 7);

    let Attribute::BindDirective(bind) = &element.attributes[0] else {
        panic!("expected bind directive");
    };
    assert_eq!(bind.name, "value");
    assert_eq!(bind.modifiers[0], "group");
    assert_eq!(
        location_text(source, bind.name_loc.as_ref()),
        "bind:value|group"
    );

    let Attribute::UseDirective(action) = &element.attributes[1] else {
        panic!("expected use directive");
    };
    assert_eq!(action.name, "動作");
    assert_eq!(location_text(source, action.name_loc.as_ref()), "use:動作");

    let Attribute::ClassDirective(class) = &element.attributes[2] else {
        panic!("expected class directive");
    };
    assert_eq!(class.name, "有効");
    assert_eq!(location_text(source, class.name_loc.as_ref()), "class:有効");

    let Attribute::StyleDirective(style) = &element.attributes[3] else {
        panic!("expected style directive");
    };
    assert_eq!(style.name, "色");
    assert_eq!(style.modifiers[0], "important");
    assert_eq!(
        location_text(source, style.name_loc.as_ref()),
        "style:色|important"
    );

    let Attribute::TransitionDirective(transition) = &element.attributes[4] else {
        panic!("expected transition directive");
    };
    assert_eq!(transition.name, "遷移");
    assert_eq!(transition.modifiers[0], "global");
    assert_eq!(
        location_text(source, transition.name_loc.as_ref()),
        "transition:遷移|global"
    );

    let Attribute::AnimateDirective(animate) = &element.attributes[5] else {
        panic!("expected animate directive");
    };
    assert_eq!(animate.name, "反転");
    assert_eq!(
        location_text(source, animate.name_loc.as_ref()),
        "animate:反転"
    );

    let Attribute::LetDirective(let_directive) = &element.attributes[6] else {
        panic!("expected let directive");
    };
    assert_eq!(let_directive.name, "項目");
    assert_eq!(
        location_text(source, let_directive.name_loc.as_ref()),
        "let:項目"
    );
}

#[test]
fn missing_directive_names_remain_errors() {
    for source in ["<div use:></div>", "<div transition:|global></div>"] {
        let error = parse(source, &Allocator::default(), ParseOptions::default())
            .expect_err("missing directive name must fail");

        assert!(
            matches!(
                error,
                ParseError::SvelteError { ref code, .. } if code == "directive_missing_name"
            ),
            "unexpected error for {source:?}: {error:?}"
        );
    }
}
