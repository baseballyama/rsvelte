use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, MetadataTag};

use super::template::single_expression;
use super::{
    AttributeValue, CompileInput, CompilerNodeIdentifier, CompilerSyntaxTree, Diagnostic, Element,
    NodeKind, Span, unsupported,
};

mod options;

/// What `<svelte:options>` asks of the output.
#[derive(Default)]
pub(super) struct SvelteOptions {
    pub(super) custom_element: Option<super::custom_element::CustomElement>,
    /// `css="injected"`: the component adds its stylesheet when it renders.
    pub(super) stylesheet_injected: bool,
}

pub(super) fn validate(input: &CompileInput<'_>) -> Result<SvelteOptions, Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    // The parser has checked the placement and the options, as upstream's does.
    let mut options = SvelteOptions::default();
    for (_, element) in tree.elements() {
        if element.kind == ElementKind::Metadata(Some(MetadataTag::Options)) {
            options = options::read(input, tree.attributes(element.attributes))?;
        }
    }
    for (_, element) in tree.elements() {
        if element.kind != ElementKind::Metadata(Some(MetadataTag::Element)) {
            continue;
        }
        let Some(tag) = element.this else {
            return invalid(
                "svelte_element_missing_this",
                "`<svelte:element>` must have a 'this' attribute with a value",
                element.name,
            );
        };
        let tag = &tree.attributes[tag];
        // Upstream keeps only the first chunk of `this="h{n}"`, which drops the rest of the tag.
        if matches!(&tag.value, AttributeValue::Interpolated(parts) if parts.len() > 1) {
            return unsupported(
                "a `this` of text and expressions, which upstream cuts to its first chunk",
                tag.span,
            );
        }
        if !matches!(
            &tag.value,
            AttributeValue::Static(_)
                | AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
        ) {
            return unsupported("this dynamic tag value", tag.span);
        }
    }
    Ok(options)
}

/// The special elements' errors upstream's analysis raises, the first in document order.
///
/// # Errors
///
/// That error.
pub(super) fn analysis(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    for (identifier, element) in tree.elements() {
        let attributes = tree.attributes(element.attributes);
        match element.kind {
            ElementKind::Metadata(Some(MetadataTag::Head)) | ElementKind::Title => {
                if let Some(attribute) = attributes.first() {
                    let (code, message) = if element.kind == ElementKind::Title {
                        (
                            "title_illegal_attribute",
                            "`<title>` cannot have attributes nor directives",
                        )
                    } else {
                        (
                            "svelte_head_illegal_attribute",
                            "`<svelte:head>` cannot have attributes nor directives",
                        )
                    };
                    return invalid(code, message, attribute.span);
                }
                if element.kind == ElementKind::Title {
                    for &child in tree.children(element.children) {
                        if !matches!(
                            tree.node(child).kind,
                            NodeKind::Text { .. } | NodeKind::Expression { .. }
                        ) {
                            return invalid(
                                "title_invalid_content",
                                "`<title>` can only contain text and {tags}",
                                tree.node(child).span,
                            );
                        }
                    }
                }
            }
            ElementKind::Metadata(Some(MetadataTag::Boundary)) => {
                for attribute in attributes {
                    if !matches!(
                        attribute.name.text(source),
                        "onerror" | "failed" | "pending"
                    ) || super::template::is_directive(&attribute.value)
                    {
                        return invalid(
                            "svelte_boundary_invalid_attribute",
                            "Valid attributes on `<svelte:boundary>` are `onerror` and `failed`",
                            attribute.span,
                        );
                    }
                    if single_expression(&attribute.value).is_none() {
                        return invalid(
                            "svelte_boundary_invalid_attribute_value",
                            "Attribute value must be a non-string expression",
                            attribute.span,
                        );
                    }
                }
            }
            ElementKind::Metadata(Some(
                tag @ (MetadataTag::Window | MetadataTag::Document | MetadataTag::Body),
            )) => {
                no_children(tree, source, element)?;
                validate_globals(source, tag, attributes)?;
            }
            ElementKind::Metadata(Some(MetadataTag::Component | MetadataTag::SelfRef)) => {
                validate_dynamic_component(tree, identifier, element)?;
            }
            _ => {}
        }
    }
    Ok(())
}

/// Upstream's parser checks `<svelte:component>`'s `this`, and its analysis where
/// `<svelte:self>` may be.
fn validate_dynamic_component(
    tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
    element: &Element,
) -> Result<(), Diagnostic> {
    if element.kind == ElementKind::Metadata(Some(MetadataTag::Component)) {
        let this = element.this.map(|this| &tree.attributes[this]);
        if this.is_none_or(|this| single_expression(&this.value).is_none()) {
            return unsupported(
                "`<svelte:component>` without a `this` expression",
                element.name,
            );
        }
        return Ok(());
    }
    let placed =
        std::iter::successors(tree.node(identifier).parent, |&p| tree.node(p).parent).any(|p| {
            match &tree.node(p).kind {
                NodeKind::If { .. } | NodeKind::Each(_) | NodeKind::Snippet(_) => true,
                NodeKind::Element(owner) => owner.kind == ElementKind::Component,
                _ => false,
            }
        });
    if placed {
        return Ok(());
    }
    invalid(
        "svelte_self_invalid_placement",
        "`<svelte:self>` components can only exist inside `{#if}` blocks, `{#each}` blocks, \
         `{#snippet}` blocks or slots passed to components",
        tree.node(identifier).span,
    )
}

fn validate_globals(
    source: &str,
    tag: MetadataTag,
    attributes: &[super::Attribute],
) -> Result<(), Diagnostic> {
    for attribute in attributes {
        let plain = matches!(
            attribute.value,
            AttributeValue::Boolean
                | AttributeValue::Static(_)
                | AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_)
        );
        if matches!(attribute.value, AttributeValue::Spread(_))
            || (plain && super::event_attribute(source, attribute).is_none())
        {
            if tag == MetadataTag::Body {
                return invalid(
                    "svelte_body_illegal_attribute",
                    "`<svelte:body>` does not support non-event attributes or spread attributes",
                    attribute.span,
                );
            }
            let name = if tag == MetadataTag::Window {
                "svelte:window"
            } else {
                "svelte:document"
            };
            return invalid(
                "illegal_element_attribute",
                &format!("`<{name}>` does not support non-event attributes or spread attributes"),
                attribute.span,
            );
        }
    }
    // Upstream checks a binding where it visits the directive, after the element's attributes.
    for attribute in attributes {
        if let AttributeValue::Bind(_) = attribute.value
            && global_binding(tag, attribute.name.text(source)).is_none()
        {
            return unsupported("this global binding", attribute.span);
        }
    }
    Ok(())
}

/// Upstream's `disallow_children`, which spans the children.
fn no_children(
    tree: &CompilerSyntaxTree,
    source: &str,
    element: &Element,
) -> Result<(), Diagnostic> {
    let children = tree.children(element.children);
    if let (Some(&first), Some(&last)) = (children.first(), children.last()) {
        let name = element.name.text(source);
        return invalid(
            "svelte_meta_invalid_content",
            &format!("<{name}> cannot have children"),
            Span::new(
                tree.node(first).span.start_offset,
                tree.node(last).span.end_offset,
            ),
        );
    }
    Ok(())
}

pub(super) fn invalid<T>(code: &'static str, message: &str, span: Span) -> Result<T, Diagnostic> {
    Err(error(code, message, span))
}

pub(super) fn error(code: &'static str, message: &str, span: Span) -> Diagnostic {
    Diagnostic::error(
        code,
        format!("{message}\nhttps://svelte.dev/e/{code}"),
        span,
    )
}

#[derive(Clone, Copy)]
pub(super) enum GlobalBinding {
    This,
    Size,
    Scroll(&'static str),
    Online,
    ActiveElement,
    Property(&'static str),
    /// A binding `<svelte:body>` shares with an element.
    Element,
}

pub(super) fn global_binding(tag: MetadataTag, property: &str) -> Option<GlobalBinding> {
    match (tag, property) {
        (_, "this") => Some(GlobalBinding::This),
        (MetadataTag::Window, "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight") => {
            Some(GlobalBinding::Size)
        }
        (MetadataTag::Window, "scrollX") => Some(GlobalBinding::Scroll("x")),
        (MetadataTag::Window, "scrollY") => Some(GlobalBinding::Scroll("y")),
        (MetadataTag::Window, "online") => Some(GlobalBinding::Online),
        (MetadataTag::Window, "devicePixelRatio") => Some(GlobalBinding::Property("resize")),
        (MetadataTag::Document, "activeElement") => Some(GlobalBinding::ActiveElement),
        (
            MetadataTag::Body,
            "focused"
            | "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "contentRect"
            | "contentBoxSize"
            | "borderBoxSize"
            | "devicePixelContentBoxSize",
        ) => Some(GlobalBinding::Element),
        (MetadataTag::Document, "fullscreenElement") => {
            Some(GlobalBinding::Property("fullscreenchange"))
        }
        (MetadataTag::Document, "pointerLockElement") => {
            Some(GlobalBinding::Property("pointerlockchange"))
        }
        (MetadataTag::Document, "visibilityState") => {
            Some(GlobalBinding::Property("visibilitychange"))
        }
        _ => None,
    }
}
