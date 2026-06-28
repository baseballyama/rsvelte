//! RegularElement visitor.
//!
//! Analyzes regular HTML elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RegularElement.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::super::warnings;
use super::VisitorContext;
use super::attribute;
use super::bind_directive;
use super::on_directive;
use super::shared::a11y::check_element as a11y_check;
use super::shared::element::validate_element;
use super::shared::fragment::{analyze, mark_subtree_dynamic};
use super::spread_attribute;
use super::use_directive;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, RegularElement, TemplateNode,
};
use regex::Regex;
use rustc_hash::FxHashSet;
use std::sync::LazyLock;

/// Regex for matching a leading newline character.
/// Corresponds to `regex_starts_with_newline` in patterns.js.
static REGEX_STARTS_WITH_NEWLINE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\r?\n").unwrap());

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
        || element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "is"))
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
pub(super) fn is_tag_valid_with_parent(child_tag: &str, parent_tag: &str) -> Option<String> {
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
        // Note: option and optgroup do NOT have "only" restrictions because newer browsers
        // support rich HTML content inside option elements (customizable select elements).
        // For older browsers, hydration will handle the mismatch.
        // See: https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element
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
        (
            "table",
            "caption" | "colgroup" | "tbody" | "thead" | "tfoot" | "style" | "script" | "template",
        ) => None,
        ("table", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<caption>`, `<colgroup>`, `<tbody>`, `<thead>`, `<tfoot>`, `<style>`, `<script>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
        (
            "head",
            "base" | "basefont" | "bgsound" | "link" | "meta" | "title" | "noscript" | "noframes"
            | "style" | "script" | "template",
        ) => None,
        ("head", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<base>`, `<basefont>`, `<bgsound>`, `<link>`, `<meta>`, `<title>`, `<noscript>`, `<noframes>`, `<style>`, `<script>`, `<template>`",
            child_tag, parent_tag, parent_tag
        )),
        // https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
        ("html", "head" | "body" | "frameset") => None,
        ("html", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<head>`, `<body>`, `<frameset>`",
            child_tag, parent_tag, parent_tag
        )),
        ("frameset", "frame") => None,
        ("frameset", _) => Some(format!(
            "`<{}>` cannot be a child of `<{}>`. `<{}>` only allows these children: `<frame>`",
            child_tag, parent_tag, parent_tag
        )),
        // Note: <select> is not restricted here because HTML5 customizable select elements
        // allow <button> and other elements inside <select>. The official Svelte compiler
        // does not have <select> in the disallowed_children map.
        _ => {
            // Check special child tags that require specific parents
            match child_tag {
                "body" | "caption" | "col" | "colgroup" | "frameset" | "frame" | "head"
                | "html" => Some(format!(
                    "`<{}>` cannot be a child of `<{}>",
                    child_tag, parent_tag
                )),
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

/// Elements that cannot contain certain descendants.
/// Based on the disallowed_children map from html-tree-validation.js.
fn get_disallowed_descendant(
    ancestor_tag: &str,
    _child_tag: &str,
) -> Option<&'static [&'static str]> {
    match ancestor_tag {
        "p" => Some(&[
            "address",
            "article",
            "aside",
            "blockquote",
            "div",
            "dl",
            "fieldset",
            "footer",
            "form",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "header",
            "hgroup",
            "hr",
            "main",
            "menu",
            "nav",
            "ol",
            "p",
            "pre",
            "section",
            "table",
            "ul",
        ]),
        "form" => Some(&["form"]),
        "a" => Some(&["a"]),
        "button" => Some(&["button"]),
        "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => Some(&["h1", "h2", "h3", "h4", "h5", "h6"]),
        "li" => Some(&["li"]),
        "dt" | "dd" => Some(&["dt", "dd"]),
        "rt" | "rp" => Some(&["rt", "rp"]),
        "optgroup" => Some(&["optgroup"]),
        "option" => Some(&["option", "optgroup"]),
        _ => None,
    }
}

/// Whether a disallowed-children rule is `direct` (the child auto-closes its
/// *immediate* parent) rather than `descendant` in the official
/// `autoclosing_children` table. `direct` rules must only be checked against the
/// direct parent — not every ancestor — otherwise a valid nested list like
/// `<ul><li><ul><li>` falsely reports `<li>` as a descendant of `<li>` (H-082).
fn is_direct_only_disallowed(ancestor_tag: &str) -> bool {
    matches!(
        ancestor_tag,
        "li" | "thead" | "tbody" | "tfoot" | "tr" | "td" | "th"
    )
}

/// Tags that "reset" a disallowed-descendant rule for `ancestor_tag`, mirroring
/// upstream `autoclosing_children[tag].reset_by` in `html-tree-validation.js`.
///
/// `<dt>`/`<dd>` may not be descendants of `<dt>`/`<dd>`, *but* a nested `<dl>`
/// between them resets the rule (a `<dl>` re-opens a valid description-list
/// context). So a valid nested `<dl>` inside a `<dd>` must not error (#721).
fn get_descendant_reset_by(ancestor_tag: &str) -> Option<&'static [&'static str]> {
    match ancestor_tag {
        "dt" | "dd" => Some(&["dl"]),
        _ => None,
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

    // Custom elements can be anything
    if ancestor_tag.contains('-') {
        return None;
    }

    // Check descendant rules
    if let Some(disallowed) = get_disallowed_descendant(ancestor_tag, child_tag)
        && disallowed.contains(&child_tag)
    {
        return Some(format!(
            "`<{}>` cannot be a descendant of `<{}>`",
            child_tag, ancestor_tag
        ));
    }

    None
}

/// Create a synthetic attribute for the textarea value.
///
/// Corresponds to `create_attribute` in nodes.js.
fn create_textarea_value_attribute(nodes: Vec<TemplateNode>) -> Attribute {
    // Get start/end from first and last node
    let start = nodes
        .first()
        .map(|n| match n {
            TemplateNode::Text(t) => t.start,
            TemplateNode::ExpressionTag(e) => e.start,
            _ => 0,
        })
        .unwrap_or(0);

    let end = nodes
        .last()
        .map(|n| match n {
            TemplateNode::Text(t) => t.end,
            TemplateNode::ExpressionTag(e) => e.end,
            _ => 0,
        })
        .unwrap_or(0);

    // Convert nodes to AttributeValuePart
    let parts: Vec<AttributeValuePart> = nodes
        .into_iter()
        .filter_map(|node| match node {
            TemplateNode::Text(text) => Some(AttributeValuePart::Text(text)),
            TemplateNode::ExpressionTag(expr) => Some(AttributeValuePart::ExpressionTag(*expr)),
            _ => None,
        })
        .collect();

    Attribute::Attribute(crate::ast::template::AttributeNode {
        start,
        end,
        name: "value".into(),
        name_loc: None,
        value: AttributeValue::Sequence(parts),
        metadata: Default::default(),
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
    let a11y_warnings = a11y_check(element, &context.element_ancestors);
    for mut warning in a11y_warnings {
        if warning.start.is_none() {
            warning.start = Some(element.start);
        }
        if warning.end.is_none() {
            warning.end = Some(element.end);
        }
        context.emit_warning(warning);
    }

    // Track element in analysis
    // Note: In the JS version, this sets node.metadata.path = [...context.path]
    // and pushes to context.state.analysis.elements
    // We'll track this in context.analysis directly for now

    // Track element name for CSS unused selector detection
    context
        .analysis
        .css
        .used_elements
        .insert(element.name.to_string());

    // Build DOM structure for CSS sibling combinator detection
    let parent_idx = context.current_parent_idx();
    let is_root_child = parent_idx.is_none();

    // Extract classes and ID from attributes
    let mut element_classes = FxHashSet::default();
    let mut element_id: Option<String> = None;
    let mut static_attributes: Vec<(String, Option<String>)> = Vec::new();
    let mut dynamic_attribute_names: FxHashSet<String> = FxHashSet::default();
    let mut has_spread = false;
    let mut has_class_directive = false;
    let mut class_directive_names: FxHashSet<String> = FxHashSet::default();
    let mut has_style_directive = false;

    // Track class names and IDs from attributes
    for attr in &element.attributes {
        if let Attribute::Attribute(attr_node) = attr {
            // Track static attribute name/value for CSS attribute selector matching
            match &attr_node.value {
                AttributeValue::True(_) => {
                    // Boolean attribute like `<details open>`
                    static_attributes.push((attr_node.name.to_string(), None));
                }
                AttributeValue::Sequence(parts) => {
                    // Check if all parts are static text
                    let mut all_static = true;
                    let mut value = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            value.push_str(&text.data);
                        } else {
                            all_static = false;
                            break;
                        }
                    }
                    if all_static {
                        static_attributes.push((attr_node.name.to_string(), Some(value)));
                    } else {
                        // Has dynamic parts - try to determine possible values
                        // for CSS attribute selector matching
                        let mut all_resolved = true;
                        let mut computed_values: Vec<String> = vec![String::new()];
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(text) => {
                                    for v in &mut computed_values {
                                        v.push_str(&text.data);
                                    }
                                }
                                AttributeValuePart::ExpressionTag(expr_tag) => {
                                    let expr_json = expr_tag.expression.as_json();
                                    use super::super::css::get_possible_values;
                                    if let Some(possible_vals) =
                                        get_possible_values(expr_json, false)
                                    {
                                        if possible_vals.len() > 20 {
                                            // Too many combinations, bail out
                                            all_resolved = false;
                                            break;
                                        }
                                        let prev = computed_values.clone();
                                        computed_values.clear();
                                        for pv in &prev {
                                            for ev in &possible_vals {
                                                computed_values.push(format!("{}{}", pv, ev));
                                            }
                                        }
                                        if computed_values.len() > 100 {
                                            all_resolved = false;
                                            break;
                                        }
                                    } else {
                                        all_resolved = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if all_resolved && !computed_values.is_empty() {
                            for value in &computed_values {
                                static_attributes
                                    .push((attr_node.name.to_string(), Some(value.clone())));
                            }
                        } else {
                            dynamic_attribute_names.insert(attr_node.name.to_string());
                        }
                    }
                }
                _ => {
                    // Expression or other dynamic value
                    // Try to statically determine the value for CSS attribute selector matching
                    if let AttributeValue::Expression(expr_tag) = &attr_node.value {
                        let expr_json = expr_tag.expression.as_json();
                        use super::super::css::get_possible_values;
                        if let Some(possible_values) = get_possible_values(expr_json, false) {
                            // We can determine the possible values statically
                            for value in &possible_values {
                                static_attributes
                                    .push((attr_node.name.to_string(), Some(value.to_string())));
                            }
                        } else {
                            dynamic_attribute_names.insert(attr_node.name.to_string());
                        }
                    } else {
                        dynamic_attribute_names.insert(attr_node.name.to_string());
                    }
                }
            }

            match attr_node.name.as_str() {
                "class" => {
                    // Extract class names from attribute value using combinatorial expansion
                    // to correctly handle string concatenation like class="foo{expr}bar"
                    match &attr_node.value {
                        AttributeValue::Sequence(parts) => {
                            // Combinatorial expansion matching the official Svelte compiler.
                            // We maintain partial strings and combine them with each chunk's
                            // possible values, tracking whitespace boundaries.
                            let mut possible_values: FxHashSet<String> = FxHashSet::default();
                            let mut prev_values: Vec<String> = Vec::new();
                            let mut bail_out = false;

                            for part in parts {
                                let current_possible: Option<Vec<String>> = match part {
                                    AttributeValuePart::Text(text) => {
                                        Some(vec![text.data.to_string()])
                                    }
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        let expr_json = expr_tag.expression.as_json();
                                        use super::super::css::get_possible_values;
                                        get_possible_values(expr_json, true)
                                    }
                                };

                                if current_possible.is_none() {
                                    bail_out = true;
                                    break;
                                }
                                let current_vals = current_possible.unwrap();

                                if prev_values.is_empty() {
                                    // First chunk
                                    for cv in &current_vals {
                                        if cv.ends_with(char::is_whitespace) {
                                            possible_values.insert(cv.clone());
                                        } else {
                                            prev_values.push(cv.clone());
                                        }
                                    }
                                    if prev_values.len() < current_vals.len() {
                                        prev_values.push(" ".to_string());
                                    }
                                } else {
                                    // Categorize new values by whitespace boundaries
                                    let mut starts_with_space = Vec::new();
                                    let mut remaining = Vec::new();
                                    for cv in &current_vals {
                                        if cv.starts_with(char::is_whitespace) {
                                            starts_with_space.push(cv.clone());
                                        } else {
                                            remaining.push(cv.clone());
                                        }
                                    }

                                    if !remaining.is_empty() {
                                        if !starts_with_space.is_empty() {
                                            // Some values start with space - previous values are complete
                                            for pv in &prev_values {
                                                possible_values.insert(pv.clone());
                                            }
                                        }
                                        // Combine prev_values with remaining (no-space) values
                                        let mut combined = Vec::new();
                                        for pv in &prev_values {
                                            for rv in &remaining {
                                                combined.push(format!("{}{}", pv, rv));
                                            }
                                        }
                                        prev_values = combined;
                                        for sv in &starts_with_space {
                                            if sv.ends_with(char::is_whitespace) {
                                                possible_values.insert(sv.clone());
                                            } else {
                                                prev_values.push(sv.clone());
                                            }
                                        }
                                    } else {
                                        // All values start with space
                                        for pv in &prev_values {
                                            possible_values.insert(pv.clone());
                                        }
                                        prev_values.clear();
                                        for sv in &starts_with_space {
                                            if sv.ends_with(char::is_whitespace) {
                                                possible_values.insert(sv.clone());
                                            } else {
                                                prev_values.push(sv.clone());
                                            }
                                        }
                                    }
                                    if prev_values.len() < current_vals.len() {
                                        prev_values.push(" ".to_string());
                                    }
                                    if prev_values.len() > 20 {
                                        // Exponential growth, bail out
                                        bail_out = true;
                                        break;
                                    }
                                }
                            }

                            if bail_out {
                                context.analysis.css.has_dynamic_classes = true;
                            } else {
                                // Add remaining prev_values
                                for pv in &prev_values {
                                    possible_values.insert(pv.clone());
                                }
                                // Extract class names from all possible values
                                for value in &possible_values {
                                    for class_name in value.split_whitespace() {
                                        if !class_name.is_empty() {
                                            context
                                                .analysis
                                                .css
                                                .used_classes
                                                .insert(class_name.to_string());
                                            element_classes.insert(class_name.to_string());
                                        }
                                    }
                                }
                            }
                        }
                        AttributeValue::Expression(expr_tag) => {
                            // Expression as attribute value: class={{ ... }}
                            // Use the cached JSON view of the expression to analyze it
                            let expr_json = expr_tag.expression.as_json();
                            use super::super::css::get_possible_values;
                            if let Some(possible_values) = get_possible_values(expr_json, true) {
                                // We can statically determine the classes
                                for value in &possible_values {
                                    for class_name in value.split_whitespace() {
                                        context
                                            .analysis
                                            .css
                                            .used_classes
                                            .insert(class_name.to_string());
                                        element_classes.insert(class_name.to_string());
                                    }
                                }
                            } else {
                                // Unknown expression - mark as dynamic
                                context.analysis.css.has_dynamic_classes = true;
                            }
                        }
                        _ => {}
                    }
                }
                "id" => {
                    match &attr_node.value {
                        AttributeValue::Sequence(parts) => {
                            // An interpolated id (`id="a{x}"`) has an unknown runtime
                            // value, so it could match any #id selector.
                            let has_dynamic_part = parts
                                .iter()
                                .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                            if has_dynamic_part {
                                context.analysis.css.has_dynamic_ids = true;
                            } else {
                                for part in parts {
                                    if let AttributeValuePart::Text(text) = part {
                                        let id = text.data.trim();
                                        if !id.is_empty() {
                                            context.analysis.css.used_ids.insert(id.to_string());
                                            element_id = Some(id.to_string());
                                        }
                                    }
                                }
                            }
                        }
                        // `id={expr}` or the `{id}` shorthand: dynamic, unknown value.
                        AttributeValue::Expression(_) => {
                            context.analysis.css.has_dynamic_ids = true;
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        } else if let Attribute::SpreadAttribute(spread) = attr {
            // Visit spread attribute to set has_dynamic_classes
            has_spread = true;
            spread_attribute::visit(spread, context)?;
        } else if let Attribute::BindDirective(bind) = attr {
            // bind:name is a dynamic attribute
            dynamic_attribute_names.insert(bind.name.to_string());
        } else if let Attribute::ClassDirective(class_dir) = attr {
            has_class_directive = true;
            class_directive_names.insert(class_dir.name.to_string());
            // `class:name` matches a `.name` class selector exactly (the official
            // `attribute_matches` returns true for ClassDirective with `~=`), so
            // track the directive name as a class on this element.
            element_classes.insert(class_dir.name.to_string());
        } else if let Attribute::StyleDirective(_) = attr {
            has_style_directive = true;
        }
    }

    // Special case: Move the children of <textarea> into a value attribute if they are dynamic
    if element.name == "textarea" && !element.fragment.nodes.is_empty() {
        // Check that there's no existing value attribute
        for attr in &element.attributes {
            if let Attribute::Attribute(attr_node) = attr
                && attr_node.name == "value"
            {
                return Err(errors::textarea_invalid_content());
            }
        }

        // Check for logic blocks inside textarea (not allowed)
        for node in &element.fragment.nodes {
            match node {
                TemplateNode::IfBlock(_) => {
                    return Err(errors::block_invalid_placement("{#if ...}"));
                }
                TemplateNode::EachBlock(_) => {
                    return Err(errors::block_invalid_placement("{#each ...}"));
                }
                TemplateNode::AwaitBlock(_) => {
                    return Err(errors::block_invalid_placement("{#await ...}"));
                }
                TemplateNode::KeyBlock(_) => {
                    return Err(errors::block_invalid_placement("{#key ...}"));
                }
                _ => {}
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
        && !element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "value"))
    {
        // Set metadata.synthetic_value_node to the expression tag child
        if let TemplateNode::ExpressionTag(expr_tag) = &element.fragment.nodes[0] {
            element.metadata.synthetic_value_node = Some(expr_tag.clone());
        }
    }

    // Check if component name binding exists and warn if unused
    // This warns when someone imports a component but uses a lowercase name,
    // which makes it look like an HTML element
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
            context.emit_warning(warnings::component_name_lowercase(&element.name));
        }
    }

    // Check for spread attributes
    let _has_spread = element
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

    // Determine if element is SVG
    // Following the official Svelte compiler logic:
    // 1. Elements that are inherently SVG (like 'svg', 'path', 'circle', etc.) are always SVG
    // 2. Ambiguous elements like 'a' and 'title' are SVG only if they have an SVG ancestor
    let is_svg_element = if is_svg(&element.name) {
        true
    } else if element.name == "a" || element.name == "title" {
        // Check ancestors for SVG context
        let mut found_svg_ancestor = false;
        let mut i = context.path.len();
        while i > 0 {
            i -= 1;
            if let Some(ancestor) = context.path.get(i)
                && let TemplateNode::RegularElement(ancestor_el) = ancestor
            {
                // Check if ancestor has svg metadata set, or is an SVG element
                if ancestor_el.metadata.svg || is_svg(&ancestor_el.name) {
                    found_svg_ancestor = true;
                    break;
                }
            }
        }
        found_svg_ancestor
    } else {
        false
    };

    // Set the SVG and MathML metadata on the element
    element.metadata.svg = is_svg_element;
    element.metadata.mathml = is_mathml(&element.name);

    // If custom element with attributes, mark subtree as dynamic
    if is_custom_element_node(element) && !element.attributes.is_empty() {
        mark_subtree_dynamic(&context.path);
    }

    // Validate parent/ancestor relationships using element_ancestors stack
    // Follows the official Svelte implementation logic:
    // - If there's a block (IfBlock, EachBlock, AwaitBlock, KeyBlock) between the element
    //   and its ancestors, issue a warning (only_warn) instead of an error
    // - This is because blocks create separate template strings on the client side
    if let Some(parent_element) = &context.parent_element {
        // Determine if there's a block between this element and any ancestor
        // We compare current block_depth with the block_depth when each ancestor was entered
        let current_block_depth = context.block_depth;

        // Check direct parent first
        if let Some(message) = is_tag_valid_with_parent(&element.name, parent_element) {
            // Check if there's a block between us and the parent
            let parent_block_depth = context.block_depth_at_element.last().copied().unwrap_or(0);
            let only_warn = current_block_depth > parent_block_depth;

            if only_warn {
                context.emit_warning(warnings::node_invalid_placement_ssr(&message));
            } else {
                return Err(errors::node_invalid_placement(&message));
            }
        }

        // Check all ancestors for descendant restrictions
        // We need to check each ancestor individually
        // Collect warnings first to avoid borrow conflicts
        let mut ancestor_warnings: Vec<(String, bool)> = Vec::new();

        for (i, ancestor_name) in context.element_ancestors.iter().enumerate() {
            if let Some(disallowed) = get_disallowed_descendant(ancestor_name, &element.name)
                && disallowed.contains(&element.name.as_str())
            {
                // `direct`-only rules (e.g. `li`) apply only to the immediate
                // parent, not every ancestor — `element_ancestors` is ordered
                // outermost-first, so the direct parent is the last entry (H-082).
                let is_direct_parent = i + 1 == context.element_ancestors.len();
                if is_direct_only_disallowed(ancestor_name) && !is_direct_parent {
                    continue;
                }

                // `reset_by` rules: if any element between this ancestor and the
                // current element re-opens the context (e.g. a nested `<dl>`
                // between an outer `<dd>` and an inner `<dt>`), the descendant
                // restriction no longer applies. Mirrors upstream's `reset_by`
                // walk in `is_tag_valid_with_ancestor` (#721).
                if let Some(reset_by) = get_descendant_reset_by(ancestor_name)
                    && context.element_ancestors[i + 1..]
                        .iter()
                        .any(|a| reset_by.contains(&a.as_str()))
                {
                    continue;
                }

                let message = format!(
                    "`<{}>` cannot be a descendant of `<{}>`",
                    element.name, ancestor_name
                );

                // Check if there's a block between us and this ancestor
                let ancestor_block_depth =
                    context.block_depth_at_element.get(i).copied().unwrap_or(0);
                let only_warn = current_block_depth > ancestor_block_depth;

                ancestor_warnings.push((message, only_warn));
            }
        }

        // Now emit warnings or return errors
        for (message, only_warn) in ancestor_warnings {
            if only_warn {
                context.emit_warning(warnings::node_invalid_placement_ssr(&message));
            } else {
                return Err(errors::node_invalid_placement(&message));
            }
        }
    }

    // Strip off any namespace from the beginning of the node name
    let node_name = element.name.split(':').next_back().unwrap_or(&element.name);

    // Check for invalid self-closing tag
    if element.end >= 2 {
        let end_idx = element.end as usize;
        if end_idx <= context.analysis.source.len() {
            let byte_at_end_minus_2 = context.analysis.source.as_bytes().get(end_idx - 2);

            if byte_at_end_minus_2 == Some(&b'/')
                && !is_void(node_name)
                && !is_svg(node_name)
                && !is_mathml(node_name)
            {
                context.emit_warning(warnings::element_invalid_self_closing_tag(node_name));
            }
        }
    }

    // Check if the element's fragment contains opaque content (render tags, slots, components)
    // that can inject unknown element children at runtime
    let has_opaque_content = element.fragment.nodes.iter().any(|node| {
        use crate::ast::template::TemplateNode;
        matches!(
            node,
            TemplateNode::RenderTag(_)
                | TemplateNode::Component(_)
                | TemplateNode::SlotElement(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteSelf(_)
                | TemplateNode::HtmlTag(_)
        )
    });

    // Create and track DOM element for CSS sibling combinator detection
    let dom_element = super::super::types::CssDomElement {
        tag_name: element.name.to_string(),
        classes: element_classes,
        id: element_id,
        static_attributes,
        dynamic_attribute_names,
        has_spread,
        has_class_directive,
        class_directive_names,
        has_style_directive,
        parent_idx,
        children_idx: Vec::new(),
        is_root_child,
        possible_prev_adjacent: Vec::new(),
        possible_next_adjacent: Vec::new(),
        possible_prev_general: Vec::new(),
        possible_next_general: Vec::new(),
        has_content: !element.fragment.nodes.is_empty(),
        has_opaque_content,
        is_dynamic_tag: false,
        prev_is_opaque_boundary: false,
        prev_has_opaque_boundary: false,
    };

    let element_idx = context.add_dom_element(dom_element);

    // Update parent's children list
    if let Some(parent_idx) = parent_idx
        && parent_idx < context.analysis.css.dom_structure.elements.len()
    {
        context.analysis.css.dom_structure.elements[parent_idx]
            .children_idx
            .push(element_idx);
    }

    // Visit attributes and directives
    // We need to validate bind directives with the element context
    // Using index-based iteration to avoid borrow issues
    let attr_count = element.attributes.len();
    for i in 0..attr_count {
        match &element.attributes[i] {
            Attribute::Attribute(_) => {
                // Re-borrow the attribute for the visit call
                if let Attribute::Attribute(attr_node) = &element.attributes[i] {
                    // Check if this is an event attribute (onclick, etc.)
                    // and track it for mixed_event_handler_syntaxes check
                    if super::shared::attribute::is_event_attribute(attr_node) {
                        context.uses_event_attributes = true;
                        context.analysis.uses_event_attributes = true;
                    }
                    // attribute_quoted check for custom elements
                    if is_custom_element_node(element)
                        && let crate::ast::template::AttributeValue::Sequence(parts) =
                            &attr_node.value
                        && parts.len() == 1
                        && matches!(
                            &parts[0],
                            crate::ast::template::AttributeValuePart::ExpressionTag(_)
                        )
                    {
                        context.emit_warning(warnings::attribute_quoted());
                    }
                }
                // Mutable re-borrow so the visitor can populate
                // `attr_node.metadata` (needs_clsx / delegated).
                if let Attribute::Attribute(attr_node) = &mut element.attributes[i] {
                    attribute::visit(attr_node, context)?;
                }
            }
            Attribute::BindDirective(_) => {
                // Re-borrow the bind directive for the visit call
                if let Attribute::BindDirective(bind) = &element.attributes[i] {
                    bind_directive::visit_with_element(bind, element, context)?;
                }
            }
            Attribute::OnDirective(_) => {
                // Visit on: directive to track event_directive_node for mixed syntax detection
                // Need mutable borrow so use a different approach
            }
            Attribute::UseDirective(_) => {
                // Re-borrow the use directive for the visit call
                if let Attribute::UseDirective(use_dir) = &element.attributes[i] {
                    use_directive::visit(use_dir, context)?;
                }
            }
            Attribute::ClassDirective(_) => {
                // Visit happens in a second mutable pass below so that
                // `class_directive::visit` can populate `directive.metadata`.
            }
            Attribute::StyleDirective(_) => {
                // Re-borrow the style directive for the visit call
                if let Attribute::StyleDirective(style_dir) = &element.attributes[i] {
                    super::style_directive::visit(style_dir, context)?;
                }
            }
            Attribute::AttachTag(_) => {
                // Re-borrow the attach tag mutably for the visit call
                if let Attribute::AttachTag(attach) = &mut element.attributes[i] {
                    super::attach_tag::visit(attach, context)?;
                }
            }
            Attribute::TransitionDirective(_) => {
                if let Attribute::TransitionDirective(directive) = &element.attributes[i] {
                    super::transition_directive::visit(directive, context)?;
                }
            }
            Attribute::AnimateDirective(_) => {
                if let Attribute::AnimateDirective(directive) = &element.attributes[i] {
                    super::animate_directive::visit(directive, context)?;
                }
            }
            _ => {}
        }
    }

    // Second pass for OnDirective / ClassDirective which require mutable borrow
    // (they need to populate `metadata.expression`).
    for attr in &mut element.attributes {
        match attr {
            Attribute::OnDirective(on) => {
                // In runes mode, warn about deprecated event directive usage
                // on RegularElement (not components). This is done here because
                // on_directive::visit doesn't have access to the parent type.
                // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/OnDirective.js
                if context.analysis.runes {
                    context.emit_warning(warnings::event_directive_deprecated(&on.name));
                }

                // Track event directive for mixed_event_handler_syntaxes check
                // This is a RegularElement, so we track it
                if context.event_directive_node.is_none() {
                    context.event_directive_node = Some(on.name.to_string());
                }
                on_directive::visit(on, context)?;
            }
            Attribute::ClassDirective(class_dir) => {
                super::class_directive::visit(class_dir, context)?;
            }
            _ => {}
        }
    }

    // Save parent element and set new one (use Option::replace to avoid clone)
    let old_parent = context.parent_element.replace(element.name.to_string());
    let is_root_a_tag = element.name == "a" && old_parent.is_none();

    // Increment element depth for child analysis
    context.element_depth += 1;

    // The current `TemplateNode::RegularElement` is already on `context.path`
    // (pushed by `visit_node` before dispatching here), so we don't push
    // again — doing so would double-count the element for ancestor checks.

    // Push this element to element_ancestors for node_invalid_placement validation
    context.element_ancestors.push(element.name.to_string());
    // Track the block depth when entering this element
    context.block_depth_at_element.push(context.block_depth);

    // Track custom elements as slot owners
    let is_custom_element = element.name.contains('-');
    if is_custom_element {
        context
            .slot_owner_ancestors
            .push(super::SlotOwnerType::CustomElement);
    }

    // Push this element index to DOM element stack for tracking children
    context.dom_element_stack.push(element_idx);

    // Push None to each_block_stack to indicate we're no longer directly in an EachBlock
    context.each_block_stack.push(None);

    // Clear is_direct_child_of_component since we're now inside an element
    let was_direct_child = context.is_direct_child_of_component;
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.is_direct_child_of_component = false;
    context.is_direct_child_of_snippet = false;

    // Push fragment owner type for const_tag placement validation
    // Elements with a slot attribute allow {@const} tags (like components)
    let has_slot_attr = element.attributes.iter().any(
        |attr| matches!(attr, crate::ast::template::Attribute::Attribute(a) if a.name == "slot"),
    );
    context.fragment_owner_stack.push(if has_slot_attr {
        super::FragmentOwnerType::RegularElementWithSlot
    } else {
        super::FragmentOwnerType::RegularElement
    });

    // Set context.scope to the scope created by scope_builder for this element
    let old_scope = context.scope;
    if let Some(&elem_scope) = context.analysis.root.template_scope_map.get(&element.start) {
        context.scope = elem_scope;
    }

    // Analyze children
    analyze(&mut element.fragment, context)?;

    // Restore scope
    context.scope = old_scope;

    // Special case: `<select bind:value={foo}><option>{bar}</option>`
    // means we need to invalidate `bar` whenever `foo` is mutated.
    // Corresponds to Svelte's RegularElement.js lines 69-95.
    //
    // This must run AFTER children are analyzed so that template references
    // from within the select's subtree have been collected on bindings.
    // The official compiler runs this check when scope.references already
    // contains all references (built by create_scopes before analysis walk),
    // but since our references are collected during the walk, we need to
    // check after children to ensure references from {#each} collections etc.
    // are available.
    if element.name == "select" && !context.analysis.runes {
        for attr in &element.attributes {
            if let Attribute::BindDirective(bind) = attr
                && bind.name == "value"
            {
                // Extract root identifier from the bind expression
                let root_id =
                    extract_binding_root_identifier(&bind.expression, context.parse_arena);
                if let Some(ref root_name) = root_id {
                    // Get the binding for this identifier using the instance scope
                    let scope_idx = context.analysis.root.instance_scope_index;
                    let binding_idx = context.analysis.root.get_binding(root_name, scope_idx);

                    if let Some(binding_idx) = binding_idx {
                        // Collect scope references that have template references.
                        // The official compiler uses context.state.scope.references.keys()
                        // which are identifiers referenced at the current scope level.
                        // We approximate this by finding all bindings that have template
                        // references (used in the template), excluding the binding itself.
                        // This correctly excludes bindings only referenced inside nested
                        // function bodies (which have is_template_reference = false).
                        //
                        // We collect indirect_names first (read-only access to declarations
                        // and bindings), then mutate the target binding separately to avoid
                        // cloning the entire declarations HashMap.
                        let mut indirect_names: Vec<String> = Vec::new();
                        {
                            let scope_declarations =
                                if context.analysis.root.all_scopes.len() > scope_idx {
                                    &context.analysis.root.all_scopes[scope_idx].declarations
                                } else {
                                    &context.analysis.root.scope.declarations
                                };

                            for (name, &other_idx) in scope_declarations {
                                if name == root_name {
                                    continue;
                                }
                                if let Some(other_binding) =
                                    context.analysis.root.bindings.get(other_idx)
                                {
                                    let has_template_ref = other_binding
                                        .references
                                        .iter()
                                        .any(|r| r.is_template_reference);
                                    if has_template_ref {
                                        indirect_names.push(name.clone());
                                    }
                                }
                            }
                        }

                        let binding = &mut context.analysis.root.bindings[binding_idx];
                        for name in indirect_names {
                            if !binding.legacy_indirect_bindings.contains(&name) {
                                binding.legacy_indirect_bindings.push(name);
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Restore is_direct_child_of_component
    context.is_direct_child_of_component = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;

    // Pop from each_block_stack
    context.each_block_stack.pop();

    // Pop this element from DOM element stack
    context.dom_element_stack.pop();

    // Pop slot owner if this was a custom element
    if is_custom_element {
        context.slot_owner_ancestors.pop();
    }

    // Pop this element from element_ancestors and block depth tracking
    context.element_ancestors.pop();
    context.block_depth_at_element.pop();

    // Note: `context.path` is popped by `visit_node` after dispatch.

    // Decrement element depth
    context.element_depth -= 1;

    // Restore parent element
    context.parent_element = old_parent;

    // Special case: <a> tags are valid in both SVG and HTML namespace.
    // If there's no parent, look downwards to see if it's the parent of a SVG or HTML element.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/RegularElement.js L230-238
    if is_root_a_tag {
        for child in &element.fragment.nodes {
            if let TemplateNode::RegularElement(child_el) = child {
                // Check if child is SVG (not the svg element itself)
                if (child_el.metadata.svg || is_svg(&child_el.name)) && child_el.name != "svg" {
                    element.metadata.svg = true;
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

/// Extract the root identifier name from a binding expression.
/// For `selected` -> "selected", for `selected.done` -> "selected",
/// for `items[0]` -> "items".
/// Corresponds to the `object()` function call in the official compiler.
fn extract_binding_root_identifier(
    expr: &crate::ast::js::Expression,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    let node = expr.as_node();
    extract_binding_root_identifier_node(&node, arena)
}

fn extract_binding_root_identifier_node(
    node: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    use crate::ast::typed_expr::JsNode;
    match node {
        JsNode::Identifier { name, .. } => Some(name.to_string()),
        JsNode::MemberExpression { object, .. } => {
            // Recurse through the typed arena instead of materializing the
            // whole MemberExpression chain into a Value.
            extract_binding_root_identifier_node(arena.get_js_node(*object), arena)
        }
        _ => None,
    }
}

fn extract_binding_root_identifier_json(value: &serde_json::Value) -> Option<String> {
    match value.get("type").and_then(|t| t.as_str())? {
        "Identifier" => value.get("name").and_then(|n| n.as_str()).map(String::from),
        "MemberExpression" => {
            let object = value.get("object")?;
            extract_binding_root_identifier_json(object)
        }
        _ => None,
    }
}
