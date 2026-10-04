use std::borrow::Cow;

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_markup::button_type::{Allowed, Problem, check_static};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode,
};

pub(super) fn check(
    component: &Component,
    source: &str,
    allowed: Allowed,
    out: &mut Vec<Diagnostic>,
) {
    for node in &component.nodes {
        let TemplateNode::Element {
            name,
            attributes,
            start_tag,
            ..
        } = node
        else {
            continue;
        };
        if name.text(source) != "button" {
            continue;
        }
        let mut ordinary = None;
        let mut bound = None;
        let mut shorthand = false;
        let mut spread = false;
        for attribute in component.attributes(*attributes) {
            if attribute.kind == AttributeKind::Spread {
                spread = true;
            }
            if attribute.name.text(source) == "type" && attribute.kind == AttributeKind::Attribute {
                if attribute.shorthand {
                    shorthand = true;
                } else {
                    ordinary = Some(attribute);
                    break;
                }
            } else if attribute.kind == AttributeKind::Bind
                && attribute
                    .directive_name(&component.modifiers)
                    .is_some_and(|name| name.text(source) == "type")
                && bound.is_none()
            {
                bound = Some(attribute);
            }
        }
        let (message, span) = match ordinary {
            Some(attribute) => (
                static_problem(component, source, attribute, allowed),
                attribute.span,
            ),
            None => match bound {
                Some(attribute) => (
                    matches!(attribute.value, AttributeValue::True)
                        .then(|| Problem::Empty.message()),
                    attribute.span,
                ),
                None if !shorthand && !spread => (Some(Problem::Missing.message()), *start_tag),
                None => continue,
            },
        };
        if let Some(message) = message {
            out.push(Diagnostic::error("svelte/button-has-type", message, span));
        }
    }
}

fn static_problem(
    component: &Component,
    source: &str,
    attribute: &Attribute,
    allowed: Allowed,
) -> Option<String> {
    let AttributeValue::Parts(parts) = attribute.value else {
        return Some(Problem::Empty.message());
    };
    let parts = component.parts(parts);
    let value = match parts {
        [] => return Some(Problem::Empty.message()),
        [Part::Text(span)] => rsvelte_markup::decode_text(span.text(source)),
        _ => {
            let mut text = String::new();
            for part in parts {
                let Part::Text(span) = part else {
                    return None;
                };
                text.push_str(&rsvelte_markup::decode_text(span.text(source)));
            }
            Cow::Owned(text)
        }
    };
    check_static(&value, allowed).map(Problem::message)
}
