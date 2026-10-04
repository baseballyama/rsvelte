use rsvelte_svelte::compilation::compiler_syntax_tree::{ElementKind, MetadataTag};

use super::template::single_expression;
use super::{AttributeValue, CompileInput, Diagnostic, NodeKind, Span, unsupported};

pub(super) fn validate(
    input: &CompileInput<'_>,
) -> Result<Option<super::custom_element::CustomElement>, Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    validate_snippet_parameters(input)?;
    let mut seen = 0_u8;
    let mut custom_element = None;
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
                custom_element = validate_options(input, attributes)?;
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
                    tag.value,
                    AttributeValue::Static(_)
                        | AttributeValue::Expression { .. }
                        | AttributeValue::Shorthand(_)
                ) {
                    return unsupported("this dynamic tag value", tag.span);
                }
            }
            _ => {}
        }
    }
    Ok(custom_element)
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
        } else if !matches!(attribute.value, AttributeValue::On { .. })
            && super::event_attribute(source, attribute).is_none()
        {
            return unsupported("this global attribute", attribute.span);
        }
    }
    Ok(())
}

fn validate_snippet_parameters(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    let component = input.component;
    let tree = component.compiler_syntax_tree;
    for node in &tree.nodes {
        let NodeKind::Snippet(snippet) = &node.kind else {
            continue;
        };
        for &parameter in tree.javascript_list(snippet.parameters) {
            if matches!(component.javascript.kind(parameter), super::Kind::Rest(_)) {
                return invalid(
                    "snippet_invalid_rest_parameter",
                    "Snippets do not support rest parameters; use an array instead",
                    component
                        .javascript
                        .source_location(parameter)
                        .span()
                        .expect("a parsed parameter"),
                );
            }
        }
    }
    Ok(())
}

fn validate_placement(
    tree: &super::CompilerSyntaxTree,
    source: &str,
    identifier: super::CompilerNodeIdentifier,
    element: &super::Element,
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
) -> Result<Option<super::custom_element::CustomElement>, Diagnostic> {
    let source = input.component.source_text;
    let mut custom_element = None;
    for attribute in attributes {
        let name = attribute.name.text(source);
        if name == "customElement" {
            custom_element = super::custom_element::parse(input, attribute)?;
            continue;
        }
        if name == "namespace"
            && let Some(value) = crate::input::static_string(input, &attribute.value)
            && matches!(
                value,
                "html"
                    | "svg"
                    | "mathml"
                    | "http://www.w3.org/2000/svg"
                    | "http://www.w3.org/1998/Math/MathML"
            )
        {
            continue;
        }
        let value = match attribute.value {
            AttributeValue::Boolean => Some(true),
            _ => single_expression(&attribute.value).and_then(|e| {
                match input.component.javascript.kind(e) {
                    super::Kind::Boolean(value) => Some(value),
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
    Ok(custom_element)
}

pub(super) fn invalid<T>(code: &'static str, message: &str, span: Span) -> Result<T, Diagnostic> {
    Err(Diagnostic::error(
        code,
        format!("{message}\nhttps://svelte.dev/e/{code}"),
        span,
    ))
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
