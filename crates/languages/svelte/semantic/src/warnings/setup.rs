//! The warnings before any walk: a script's attributes, and `<svelte:options>`.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, Component, TagAttributes, TemplateNode, TokenType,
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
