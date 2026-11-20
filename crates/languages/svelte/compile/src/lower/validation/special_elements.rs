use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    MetadataTag, NodeKind,
};

use crate::input::CompileInput;
use crate::lower::attributes::{event_attribute, single_expression};
use crate::lower::global_binding_table::GlobalBinding;
use crate::lower::{invalid, unsupported};

mod options;

/// What `<svelte:options>` asks of the output.
#[derive(Default)]
pub(super) struct SvelteOptions {
    pub(super) custom_element: Option<crate::lower::custom_element::CustomElement>,
    /// `css="injected"`: the component adds its stylesheet when it renders.
    pub(super) stylesheet_injected: bool,
}

/// What upstream's parser checks of the special elements: `<svelte:options>`, then each
/// `<svelte:element>`'s `this`.
///
/// # Errors
///
/// The first error, in that order.
pub(super) fn parse_time_checks(input: &CompileInput<'_>) -> Result<SvelteOptions, Diagnostic> {
    let options = read_svelte_options(input)?;
    check_element_tags(input)?;
    Ok(options)
}

fn read_svelte_options(input: &CompileInput<'_>) -> Result<SvelteOptions, Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    // The parser has checked the placement and the options, as upstream's does.
    let mut options = SvelteOptions::default();
    for (_, element) in tree.elements() {
        if element.kind == ElementKind::Metadata(Some(MetadataTag::Options)) {
            options = options::read(input, tree.attributes(element.attributes))?;
        }
    }
    Ok(options)
}

fn check_element_tags(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
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
    Ok(())
}

/// The special elements' errors upstream's analysis raises, the first in document order.
///
/// # Errors
///
/// That error.
pub(super) fn special_element_error(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
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
                    ) || crate::lower::attributes::is_directive(&attribute.value)
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
    attributes: &[Attribute],
) -> Result<(), Diagnostic> {
    let host = match tag {
        MetadataTag::Window => "svelte:window",
        MetadataTag::Document => "svelte:document",
        _ => "svelte:body",
    };
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
            || (plain && event_attribute(source, attribute).is_none())
        {
            if tag == MetadataTag::Body {
                return invalid(
                    "svelte_body_illegal_attribute",
                    "`<svelte:body>` does not support non-event attributes or spread attributes",
                    attribute.span,
                );
            }
            return invalid(
                "illegal_element_attribute",
                format!("`<{host}>` does not support non-event attributes or spread attributes"),
                attribute.span,
            );
        }
    }
    // Upstream checks a binding where it visits the directive, after the element's attributes.
    for attribute in attributes {
        if let AttributeValue::Bind(_) = attribute.value
            && GlobalBinding::of(tag, attribute.name.text(source)).is_none()
        {
            crate::lower::bindings::check_binding(source, host, attributes, attribute)?;
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
            format!("<{name}> cannot have children"),
            Span::new(
                tree.node(first).span.start_offset,
                tree.node(last).span.end_offset,
            ),
        );
    }
    Ok(())
}
