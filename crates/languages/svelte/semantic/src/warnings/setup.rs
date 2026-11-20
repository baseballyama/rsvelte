//! The warnings before any walk: the elements the parser closed implicitly, a script's
//! attributes, and `<svelte:options>`.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, ClosingTag, Component, ImplicitlyClosed, TagAttributes, TemplateNode, TokenType,
};

use super::found::{Found, Stage};
use super::{Options, warning};

/// What a script tag may carry.
const SCRIPT_ATTRIBUTES: &[&str] = &["context", "generics", "lang", "module"];

pub(super) fn warnings(
    component: &Component,
    source: &str,
    runes: bool,
    options: Options,
    found: &mut Found,
) {
    for &closed in &component.implicitly_closed {
        implicitly_closed(component, source, closed, found);
    }
    for script in [&component.module, &component.instance]
        .into_iter()
        .flatten()
    {
        for attribute in &script.attributes {
            if !SCRIPT_ATTRIBUTES.contains(&attribute.0.text(source)) {
                let span = tag_attribute(component, attribute);
                found.push(Stage::Parse, span.start_offset, warning(
                    "script_unknown_attribute",
                    "Unrecognised attribute — should be one of `generics`, `lang` or `module`. If \
                        this exists for a preprocessor, ensure that the preprocessor removes it",
                    span,
                ));
            }
        }
    }
    if runes
        && let Some(module) = &component.module
        && let Some(context) = module
            .attributes
            .iter()
            .find(|a| a.0.text(source) == "context")
    {
        found.push(
            Stage::Setup,
            1,
            warning(
                "script_context_deprecated",
                "`context=\"module\"` is deprecated, use the `module` attribute instead",
                tag_attribute(component, context),
            ),
        );
    }
    for &child in component.children(component.root) {
        let TemplateNode::Element {
            name, attributes, ..
        } = *component.node(child)
        else {
            continue;
        };
        if name.text(source) != "svelte:options" {
            continue;
        }
        for attribute in component.attributes(attributes) {
            if attribute.kind != AttributeKind::Attribute {
                continue;
            }
            let found_one = match attribute.name.text(source) {
                "accessors" if runes => warning(
                    "options_deprecated_accessors",
                    "The `accessors` option has been deprecated. It will have no effect in runes \
                        mode",
                    attribute.span,
                ),
                "customElement" if !options.custom_element => warning(
                    "options_missing_custom_element",
                    "The `customElement` option is used when generating a custom element. Did you \
                        forget the `customElement: true` compile option?",
                    attribute.span,
                ),
                "immutable" if runes => warning(
                    "options_deprecated_immutable",
                    "The `immutable` option has been deprecated. It will have no effect in runes \
                        mode",
                    attribute.span,
                ),
                _ => continue,
            };
            found.push(Stage::Setup, 2, found_one);
        }
    }
}

/// `element_implicitly_closed`, which upstream's parser emits as it closes the element.
fn implicitly_closed(
    component: &Component,
    source: &str,
    ImplicitlyClosed { element, by }: ImplicitlyClosed,
    found: &mut Found,
) {
    let TemplateNode::Element {
        name,
        children,
        span,
        ..
    } = *component.node(element)
    else {
        unreachable!("the parser records only elements as closed implicitly");
    };
    let tag = match by {
        ClosingTag::Start(by) => format!("<{}>", by.text(source)),
        ClosingTag::End(by) => format!("</{}>", by.text(source)),
    };
    let name = name.text(source);
    // The element ends where the tag that closed it starts.
    let closed_at = span.end_offset;
    let end = component
        .children(children)
        .first()
        .map_or(closed_at, |&c| component.node(c).span().start_offset);
    let message = format!(
        "This element is implicitly closed by the following `{tag}`, which can cause an \
            unexpected DOM structure. Add an explicit `</{name}>` to avoid surprises."
    );
    found.push(
        Stage::Parse,
        closed_at,
        warning(
            "element_implicitly_closed",
            &message,
            Span::new(span.start_offset, end),
        ),
    );
}

/// A script tag attribute from its name to the end of its value, the closing quote included.
fn tag_attribute(component: &Component, (name, value): &TagAttributes) -> Span {
    let Some(value) = value else {
        return *name;
    };
    let quoted = component
        .tokens
        .from_offset(value.end_offset)
        .first()
        .is_some_and(|t| {
            t.span.start_offset == value.end_offset
                && matches!(t.kind, TokenType::DoubleQuote | TokenType::SingleQuote)
        });
    Span::new(name.start_offset, value.end_offset + u32::from(quoted))
}
