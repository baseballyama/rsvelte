use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, MetadataTag};

use super::template::single_expression;
use super::{
    AttributeValue, CompileInput, CompilerNodeIdentifier, CompilerSyntaxTree, Diagnostic, Element,
    NodeKind, Span, unsupported,
};

/// What `<svelte:options>` asks of the output.
#[derive(Default)]
pub(super) struct SvelteOptions {
    pub(super) custom_element: Option<super::custom_element::CustomElement>,
    /// `css="injected"`: the component adds its stylesheet when it renders.
    pub(super) css_injected: bool,
}

pub(super) fn validate(input: &CompileInput<'_>) -> Result<SvelteOptions, Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let mut seen = 0_u8;
    let mut options = SvelteOptions::default();
    for (identifier, element) in tree.elements() {
        validate_placement(tree, source, identifier, element, &mut seen)?;
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
                            "`<svelte:head>` cannot have attributes",
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
                validate_globals(source, tag, attributes)?;
            }
            ElementKind::Metadata(Some(MetadataTag::Options)) => {
                options = validate_options(input, attributes)?;
            }
            ElementKind::Metadata(Some(MetadataTag::Component | MetadataTag::SelfRef)) => {
                validate_dynamic_component(tree, identifier, element)?;
            }
            ElementKind::Metadata(Some(MetadataTag::Element)) => {
                let Some(tag) = element.this else {
                    return invalid(
                        "svelte_element_missing_this",
                        "`<svelte:element>` must have a 'this' attribute with a value",
                        element.name,
                    );
                };
                let tag = &tree.attributes[tag];
                if !matches!(
                    &tag.value,
                    AttributeValue::Static(_)
                        | AttributeValue::Expression { .. }
                        | AttributeValue::Shorthand(_)
                ) && !matches!(&tag.value, AttributeValue::Interpolated(parts) if !parts.is_empty())
                {
                    return unsupported("this dynamic tag value", tag.span);
                }
            }
            _ => {}
        }
    }
    Ok(options)
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
        if let AttributeValue::Bind(_) = attribute.value {
            if global_binding(tag, attribute.name.text(source)).is_none() {
                return unsupported("this global binding", attribute.span);
            }
        } else if !matches!(
            attribute.value,
            AttributeValue::On { .. } | AttributeValue::Use { .. } | AttributeValue::Attach(_)
        ) && super::event_attribute(source, attribute).is_none()
        {
            return unsupported("this global attribute", attribute.span);
        }
    }
    Ok(())
}

fn validate_placement(
    tree: &CompilerSyntaxTree,
    source: &str,
    identifier: CompilerNodeIdentifier,
    element: &Element,
    seen: &mut u8,
) -> Result<(), Diagnostic> {
    if let ElementKind::Metadata(Some(
        tag @ (MetadataTag::Head
        | MetadataTag::Window
        | MetadataTag::Document
        | MetadataTag::Body
        | MetadataTag::Options),
    )) = element.kind
    {
        let bit = match tag {
            MetadataTag::Head => 1,
            MetadataTag::Window => 2,
            MetadataTag::Document => 4,
            MetadataTag::Body => 8,
            _ => 16,
        };
        let name = element.name.text(source);
        let start = tree.node(identifier).span.start_offset;
        let position = Span::new(start, start);
        if *seen & bit != 0 {
            return invalid(
                "svelte_meta_duplicate",
                &format!("A component can only have one `<{name}>` element"),
                position,
            );
        }
        *seen |= bit;
        if tree.node(identifier).parent.is_some() {
            return invalid(
                "svelte_meta_invalid_placement",
                &format!("`<{name}>` tags cannot be inside elements or blocks"),
                position,
            );
        }
        if tag != MetadataTag::Head && !tree.children(element.children).is_empty() {
            return invalid(
                "svelte_meta_invalid_content",
                &format!("<{name}> cannot have children"),
                position,
            );
        }
    }
    Ok(())
}

fn validate_options(
    input: &CompileInput<'_>,
    attributes: &[super::Attribute],
) -> Result<SvelteOptions, Diagnostic> {
    let source = input.component.source_text;
    let mut options = SvelteOptions::default();
    for attribute in attributes {
        let name = attribute.name.text(source);
        if name == "customElement" {
            options.custom_element = super::custom_element::parse(input, attribute)?;
            continue;
        }
        if name == "css" && crate::input::static_string(input, &attribute.value) == Some("injected")
        {
            options.css_injected = true;
            continue;
        }
        if name == "namespace"
            && let Some(value) = crate::input::static_string(input, &attribute.value)
            && (matches!(value, "html" | "svg" | "mathml")
                || crate::render_plan::Namespace::from_url(value).is_some())
        {
            continue;
        }
        let value = match attribute.value {
            AttributeValue::Boolean => Some(true),
            _ => single_expression(&attribute.value).and_then(|e| {
                match input
                    .component
                    .javascript
                    .get_expression(e)
                    .get_inner_expression()
                {
                    oxc_ast::ast::Expression::BooleanLiteral(literal) => Some(literal.value),
                    _ => None,
                }
            }),
        };
        if !matches!(
            (name, value),
            ("runes", Some(true)) | ("immutable" | "accessors" | "preserveWhitespace", Some(_))
        ) {
            return unsupported("this compiler option", attribute.span);
        }
    }
    Ok(options)
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
