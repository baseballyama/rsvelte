//! RegularElement visitor.
//!
//! Analyzes regular HTML elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RegularElement.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::a11y::check_element as a11y_check;
use super::shared::element::validate_element;
use super::shared::fragment::{analyze, mark_subtree_dynamic};
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement, TemplateNode};
use regex::Regex;
use std::sync::LazyLock;

/// Regex for matching a leading newline character.
/// Corresponds to `regex_starts_with_newline` in patterns.js.
static REGEX_STARTS_WITH_NEWLINE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^\r?\n").unwrap());

/// Check if an element name is an SVG element.
pub fn is_svg(name: &str) -> bool {
    matches!(
        name,
        "altGlyph"
            | "altGlyphDef"
            | "altGlyphItem"
            | "animate"
            | "animateColor"
            | "animateMotion"
            | "animateTransform"
            | "circle"
            | "clipPath"
            | "color-profile"
            | "cursor"
            | "defs"
            | "desc"
            | "discard"
            | "ellipse"
            | "feBlend"
            | "feColorMatrix"
            | "feComponentTransfer"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feDistantLight"
            | "feDropShadow"
            | "feFlood"
            | "feFuncA"
            | "feFuncB"
            | "feFuncG"
            | "feFuncR"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "fePointLight"
            | "feSpecularLighting"
            | "feSpotLight"
            | "feTile"
            | "feTurbulence"
            | "filter"
            | "font"
            | "font-face"
            | "font-face-format"
            | "font-face-name"
            | "font-face-src"
            | "font-face-uri"
            | "foreignObject"
            | "g"
            | "glyph"
            | "glyphRef"
            | "hatch"
            | "hatchpath"
            | "hkern"
            | "image"
            | "line"
            | "linearGradient"
            | "marker"
            | "mask"
            | "mesh"
            | "meshgradient"
            | "meshpatch"
            | "meshrow"
            | "metadata"
            | "missing-glyph"
            | "mpath"
            | "path"
            | "pattern"
            | "polygon"
            | "polyline"
            | "radialGradient"
            | "rect"
            | "set"
            | "solidcolor"
            | "stop"
            | "svg"
            | "switch"
            | "symbol"
            | "text"
            | "textPath"
            | "tref"
            | "tspan"
            | "unknown"
            | "use"
            | "view"
            | "vkern"
    )
}

/// Check if an element name is a MathML element.
pub fn is_mathml(name: &str) -> bool {
    matches!(
        name,
        "annotation"
            | "annotation-xml"
            | "maction"
            | "math"
            | "merror"
            | "mfrac"
            | "mi"
            | "mmultiscripts"
            | "mn"
            | "mo"
            | "mover"
            | "mpadded"
            | "mphantom"
            | "mprescripts"
            | "mroot"
            | "mrow"
            | "ms"
            | "mspace"
            | "msqrt"
            | "mstyle"
            | "msub"
            | "msubsup"
            | "msup"
            | "mtable"
            | "mtd"
            | "mtext"
            | "mtr"
            | "munder"
            | "munderover"
            | "semantics"
    )
}

/// Check if an element is a custom element.
/// Custom elements have a hyphen in their name or an `is` attribute.
pub fn is_custom_element_node(element: &RegularElement) -> bool {
    element.name.contains('-')
        || element.attributes.iter().any(|attr| {
            matches!(attr, Attribute::Attribute(a) if a.name == "is")
        })
}

/// Check if an element is void (self-closing).
pub fn is_void(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "command"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "keygen"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Check if a tag is valid with its parent.
/// Returns an error message if invalid, or None if valid.
fn is_tag_valid_with_parent(child_tag: &str, parent_tag: &str) -> Option<String> {
    // Custom elements can be anything
    if child_tag.contains('-') || parent_tag.contains('-') {
        return None;
    }

    // No errors or warning should be thrown in immediate children of template tags
    if parent_tag == "template" {
        return None;
    }

    // Check specific parent-child rules
    // This is a simplified version - the full implementation would check the
    // complete disallowed_children map from html-tree-validation.js
    match (parent_tag, child_tag) {
        ("optgroup", "option" | "#text") => None,
        ("optgroup", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<option>`, `#text`",
            child_tag, parent_tag, parent_tag
        )),
        ("option", "#text") => None,
        ("option", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `#text`",
            child_tag, parent_tag, parent_tag
        )),
        ("tr", "th" | "td" | "style" | "script" | "template") => None,
        ("tr", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<th>`, `<td>`, `<style>`, `<script>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        ("tbody" | "thead" | "tfoot", "tr" | "style" | "script" | "template") => None,
        ("tbody" | "thead" | "tfoot", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<tr>`, `<style>`, `<script>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        ("colgroup", "col" | "template") => None,
        ("colgroup", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<col>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        ("table", "caption" | "colgroup" | "tbody" | "thead" | "tfoot" | "style" | "script" | "template") => None,
        ("table", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<caption>`, `<colgroup>`, `<tbody>`, `<thead>`, `<tfoot>`, `<style>`, `<script>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        ("select", "option" | "optgroup" | "#text" | "hr" | "script" | "template") => None,
        ("select", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<option>`, `<optgroup>`, `#text`, `<hr>`, `<script>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        _ => {
            // Check special child tags that require specific parents
            match child_tag {
                "body" | "caption" | "col" | "colgroup" | "frameset" | "frame" | "head" | "html" => {
                    Some(format!("`<{}>` cannot be a child of `<{}>", child_tag, parent_tag))
                }
                "thead" | "tbody" | "tfoot" => Some(format!(
                    "`<{}>` must be the child of a `<table>`, not a `<{}>",
                    child_tag, parent_tag
                )),
                "td" | "th" => Some(format!(
                    "`<{}>` must be the child of a `<tr>`, not a `<{}>",
                    child_tag, parent_tag
                )),
                "tr" => Some(format!(
                    "`<tr>` must be the child of a `<thead>`, `<tbody>`, or `<tfoot>`, not a `<{}>",
                    parent_tag
                )),
                _ => None,
            }
        }
    }
}

/// Check if a tag is valid with an ancestor.
/// Returns an error message if invalid, or None if valid.
fn is_tag_valid_with_ancestor(child_tag: &str, ancestors: &[String]) -> Option<String> {
    // Custom elements can be anything
    if child_tag.contains('-') {
        return None;
    }

    let ancestor_tag = ancestors.last()?;

    // Check descendant rules
    // Simplified version of the disallowed_children map
    match ancestor_tag.as_str() {
        "form" if child_tag == "form" => Some(format!(
            "`<{}>` cannot be a descendant of `<{}>",
            child_tag, ancestor_tag
        )),
        "a" if child_tag == "a" => Some(format!(
            "`<{}>` cannot be a descendant of `<{}>",
            child_tag, ancestor_tag
        )),
        "button" if child_tag == "button" => Some(format!(
            "`<{}>` cannot be a descendant of `<{}>",
            child_tag, ancestor_tag
        )),
        "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
            if matches!(child_tag, "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
        {
            Some(format!(
                "`<{}>` cannot be a descendant of `<{}>",
                child_tag, ancestor_tag
            ))
        }
        _ => None,
    }
}

/// Create a synthetic attribute for the textarea value.
///
/// Corresponds to `create_attribute` in nodes.js.
fn create_textarea_value_attribute(nodes: Vec<TemplateNode>) -> Attribute {
    // Get start/end from first and last node
    let start = nodes.first().map(|n| match n {
        TemplateNode::Text(t) => t.start,
        TemplateNode::ExpressionTag(e) => e.start,
        _ => 0,
    }).unwrap_or(0);

    let end = nodes.last().map(|n| match n {
        TemplateNode::Text(t) => t.end,
        TemplateNode::ExpressionTag(e) => e.end,
        _ => 0,
    }).unwrap_or(0);

    // Convert nodes to AttributeValuePart
    let parts: Vec<AttributeValuePart> = nodes
        .into_iter()
        .filter_map(|node| match node {
            TemplateNode::Text(text) => Some(AttributeValuePart::Text(text)),
            TemplateNode::ExpressionTag(expr) => Some(AttributeValuePart::ExpressionTag(expr)),
            _ => None,
        })
        .collect();

    Attribute::Attribute(crate::ast::template::AttributeNode {
        start,
        end,
        name: "value".into(),
        name_loc: None,
        value: AttributeValue::Sequence(parts),
    })
}

/// Visit a regular element.
pub fn visit(
    element: &mut RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate the element
    validate_element(element, context)?;

    // Check accessibility
    let path_refs: Vec<&_> = context.path.iter().copied().collect();
    a11y_check(element, &path_refs);

    // Track element in analysis
    // Note: In the JS version, this sets node.metadata.path = [...context.path]
    // and pushes to context.state.analysis.elements
    // We'll track this in context.analysis directly for now

    // Special case: Move the children of <textarea> into a value attribute if they are dynamic
    if element.name == "textarea" && !element.fragment.nodes.is_empty() {
        // Check that there's no existing value attribute
        for attr in &element.attributes {
            if let Attribute::Attribute(attr_node) = attr {
                if attr_node.name == "value" {
                    return Err(AnalysisError::Validation(
                        "<textarea> cannot have both a value attribute and content. For binding use `bind:value`, for unidirectional data flow, use an `on*` event handler".to_string()
                    ));
                }
            }
        }

        if element.fragment.nodes.len() > 1
            || !matches!(element.fragment.nodes[0], TemplateNode::Text(_))
        {
            let first = &element.fragment.nodes[0];

            // Strip leading newline from first text node if present
            if let TemplateNode::Text(text) = first {
                // Clone the text node and modify it
                let mut modified_text = text.clone();
                modified_text.data = REGEX_STARTS_WITH_NEWLINE
                    .replace(&modified_text.data, "")
                    .to_string()
                    .into();
                modified_text.raw = REGEX_STARTS_WITH_NEWLINE
                    .replace(&modified_text.raw, "")
                    .to_string()
                    .into();
                element.fragment.nodes[0] = TemplateNode::Text(modified_text);
            }

            // Create value attribute from fragment nodes
            let value_attr = create_textarea_value_attribute(element.fragment.nodes.clone());
            element.attributes.push(value_attr);

            // Clear fragment nodes
            element.fragment.nodes.clear();
        }
    }

    // Special case: single expression tag child of option element -> add "fake" attribute
    // to ensure that value types are the same (else for example numbers would be strings)
    if element.name == "option"
        && element.fragment.nodes.len() == 1
        && matches!(element.fragment.nodes[0], TemplateNode::ExpressionTag(_))
        && !element.attributes.iter().any(|attr| {
            matches!(attr, Attribute::Attribute(a) if a.name == "value")
        })
    {
        // Note: In JS, this sets node.metadata.synthetic_value_node = child
        // We would need to add this to the RegularElement metadata structure
        // For now, we'll skip this as it requires AST changes
    }

    // Check if component name binding exists and warn if unused
    let binding = context
        .analysis
        .root
        .scope
        .declarations
        .get(element.name.as_str());

    if let Some(&binding_idx) = binding {
        let binding = &context.analysis.root.bindings[binding_idx];
        if binding.declaration_kind == super::super::DeclarationKind::Import
            && binding.references.is_empty()
        {
            // Would generate warning here:
            // w.component_name_lowercase(node, node.name);
        }
    }

    // Check for spread attributes
    let _has_spread = element
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

    // Determine if element is SVG
    let _is_svg_element = if is_svg(&element.name) {
        true
    } else if element.name == "a" || element.name == "title" {
        // Check ancestors for SVG context
        let mut i = context.path.len();
        while i > 0 {
            i -= 1;
            if let Some(ancestor) = context.path.get(i) {
                if let TemplateNode::RegularElement(ancestor_el) = ancestor {
                    // Note: This would check ancestor_el.metadata.svg in JS
                    // For now, we check if it's an SVG element directly
                    if is_svg(&ancestor_el.name) {
                        return Ok(());
                    }
                }
            }
        }
        false
    } else {
        false
    };

    // Note: In JS, this sets node.metadata.svg and node.metadata.mathml
    // We would need metadata structure on RegularElement

    // If custom element with attributes, mark subtree as dynamic
    if is_custom_element_node(element) && !element.attributes.is_empty() {
        mark_subtree_dynamic(&context.path);
    }

    // Validate parent/ancestor relationships
    if let Some(parent_element) = &context.parent_element {
        let mut past_parent = false;
        let mut only_warn = false;
        let mut ancestors = vec![parent_element.clone()];

        for i in (0..context.path.len()).rev() {
            if let Some(ancestor) = context.path.get(i) {
                // Check if we're in a control flow block (separate template string)
                if matches!(
                    ancestor,
                    TemplateNode::IfBlock(_)
                        | TemplateNode::EachBlock(_)
                        | TemplateNode::AwaitBlock(_)
                        | TemplateNode::KeyBlock(_)
                ) {
                    only_warn = true;
                }

                if !past_parent {
                    if let TemplateNode::RegularElement(ancestor_el) = ancestor {
                        if &ancestor_el.name == parent_element {
                            if let Some(message) =
                                is_tag_valid_with_parent(&element.name, parent_element)
                            {
                                if only_warn {
                                    // Would generate warning: w.node_invalid_placement_ssr(node, message)
                                } else {
                                    return Err(AnalysisError::Validation(message));
                                }
                            }
                            past_parent = true;
                        }
                    }
                } else if let TemplateNode::RegularElement(ancestor_el) = ancestor {
                    ancestors.push(ancestor_el.name.to_string());

                    if let Some(message) = is_tag_valid_with_ancestor(&element.name, &ancestors) {
                        if only_warn {
                            // Would generate warning: w.node_invalid_placement_ssr(node, message)
                        } else {
                            return Err(AnalysisError::Validation(message));
                        }
                    }
                } else if matches!(
                    ancestor,
                    TemplateNode::Component(_)
                        | TemplateNode::SvelteComponent(_)
                        | TemplateNode::SvelteElement(_)
                        | TemplateNode::SvelteSelf(_)
                        | TemplateNode::SnippetBlock(_)
                ) {
                    break;
                }
            }
        }
    }

    // Strip off any namespace from the beginning of the node name
    let node_name = element
        .name
        .split(':')
        .last()
        .unwrap_or(&element.name);

    // Check for invalid self-closing tag
    if element.end >= 2 {
        let end_idx = element.end as usize;
        if end_idx <= context.analysis.source.len() {
            let char_at_end_minus_2 = context
                .analysis
                .source
                .chars()
                .nth(end_idx - 2);

            if char_at_end_minus_2 == Some('/')
                && !is_void(node_name)
                && !is_svg(node_name)
                && !is_mathml(node_name)
            {
                // Would generate warning: w.element_invalid_self_closing_tag(node, node.name)
            }
        }
    }

    // Save parent element and set new one
    let old_parent = context.parent_element.clone();
    let is_root_a_tag = element.name == "a" && old_parent.is_none();
    context.parent_element = Some(element.name.to_string());

    // Increment element depth for child analysis
    context.element_depth += 1;

    // Analyze children
    analyze(&mut element.fragment, context)?;

    // Decrement element depth
    context.element_depth -= 1;

    // Restore parent element
    context.parent_element = old_parent;

    // Special case: <a> tags are valid in both SVG and HTML namespace.
    // If there's no parent, look downwards to see if it's the parent of a SVG or HTML element.
    if is_root_a_tag {
        for child in &element.fragment.nodes {
            if let TemplateNode::RegularElement(child_el) = child {
                // Check if child is SVG (not the svg element itself)
                if is_svg(&child_el.name) && child_el.name != "svg" {
                    // In JS: node.metadata.svg = true;
                    break;
                }
            }
        }
    }

    Ok(())
}

/// Alias for visit function.
pub fn visit_regular_element(
    element: &mut RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(element, context)
}
