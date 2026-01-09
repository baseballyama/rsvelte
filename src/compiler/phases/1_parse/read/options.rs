//! Svelte options parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/options.js`
//!
//! It parses `<svelte:options>` elements and extracts compiler options such as
//! `runes`, `customElement`, `accessors`, `immutable`, etc.

use crate::ast::js::Expression;
use crate::ast::template::{
    AttributeValue, AttributeValuePart, CssOption, CustomElementOptions, Namespace, ShadowMode,
    SvelteOptions, TemplateNode,
};
use crate::error::{ParseError, ParseResult};
use serde_json::Value as JsonValue;

use super::super::parser::Parser;

// Reserved tag names for custom elements (from HTML spec)
const RESERVED_TAG_NAMES: &[&str] = &[
    "annotation-xml",
    "color-profile",
    "font-face",
    "font-face-src",
    "font-face-uri",
    "font-face-format",
    "font-face-name",
    "missing-glyph",
];

impl Parser<'_> {
    /// Parse svelte:options element and extract options.
    ///
    /// Note: This is called after the opening tag name and attributes have been parsed,
    /// and the `>` has already been consumed.
    pub fn parse_svelte_options(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
        self_closing: bool,
    ) -> ParseResult<Option<TemplateNode>> {
        // If self-closing, no need to parse children or closing tag
        if !self_closing {
            // Check for children content before the closing tag
            // Skip whitespace only, then check if we're at a closing tag
            let content_start = self.index;
            self.skip_whitespace();

            // Check if there's content before the closing tag
            if self.match_str("</svelte:options") {
                // No children, just closing tag - consume it
                self.advance_by("</svelte:options".len());
                self.skip_whitespace();
                self.eat(">");
            } else if !self.is_eof() {
                // There's content - this is an error
                // First, find where the content ends
                while !self.is_eof() && !self.match_str("</svelte:options") {
                    self.advance_by(1);
                }
                let content_end = self.index;

                // Check if we found meaningful (non-whitespace) content
                let content = &self.source[content_start..content_end];
                if !content.trim().is_empty() {
                    return Err(ParseError::svelte(
                        "svelte_meta_invalid_content",
                        "<svelte:options> cannot have children",
                        (content_start, content_end),
                    ));
                }

                // Consume the closing tag
                if self.match_str("</svelte:options") {
                    self.advance_by("</svelte:options".len());
                    self.skip_whitespace();
                    self.eat(">");
                }
            }
        }

        let end = self.index as u32;

        // Extract option values from attributes
        let mut runes = None;
        let mut custom_element = None;
        let mut namespace = None;
        let mut css = None;
        let mut immutable = None;
        let mut preserve_whitespace = None;
        let mut accessors = None;

        // Convert Vec<Attribute> to Vec<AttributeNode> for storage
        let mut attr_nodes = Vec::new();

        for attr in &attributes {
            if let crate::ast::Attribute::Attribute(attr_node) = attr {
                let attr_name = attr_node.name.as_str();

                // Check for reserved attributes
                const RESERVED_ATTRIBUTES: &[&str] =
                    &["server", "client", "worker", "test", "default"];
                if RESERVED_ATTRIBUTES.contains(&attr_name) {
                    return Err(ParseError::svelte(
                        "script_reserved_attribute",
                        &format!("`{}` is a reserved attribute and cannot be used", attr_name),
                        (attr_node.start as usize, attr_node.end as usize),
                    ));
                }

                // Warn for unknown attributes
                const ALLOWED_ATTRIBUTES: &[&str] = &[
                    "runes",
                    "customElement",
                    "namespace",
                    "css",
                    "immutable",
                    "preserveWhitespace",
                    "accessors",
                ];
                if !ALLOWED_ATTRIBUTES.contains(&attr_name) {
                    // Unknown attribute - skip validation for now
                    // In production, this would emit a warning
                }

                attr_nodes.push(attr_node.clone());

                match attr_name {
                    "runes" => {
                        // runes (boolean attribute) or runes={true} or runes={false}
                        runes = Some(get_boolean_value(attr_node)?);
                    }
                    "immutable" => {
                        immutable = Some(get_boolean_value(attr_node)?);
                    }
                    "preserveWhitespace" => {
                        preserve_whitespace = Some(get_boolean_value(attr_node)?);
                    }
                    "accessors" => {
                        accessors = Some(get_boolean_value(attr_node)?);
                    }
                    "namespace" => {
                        let value = get_static_value(attr_node)?;
                        namespace = match value.as_deref() {
                            Some("html") => Some(Namespace::Html),
                            Some("svg") => Some(Namespace::Svg),
                            Some("mathml") => Some(Namespace::Mathml),
                            Some("http://www.w3.org/2000/svg") => Some(Namespace::Svg),
                            Some("http://www.w3.org/1998/Math/MathML") => Some(Namespace::Mathml),
                            _ => {
                                return Err(ParseError::svelte(
                                    "svelte_options_invalid_attribute_value",
                                    &format!(
                                        "\"{}\" is not a valid namespace (must be \"html\", \"mathml\" or \"svg\")",
                                        value.as_deref().unwrap_or("")
                                    ),
                                    (attr_node.start as usize, attr_node.end as usize),
                                ));
                            }
                        };
                    }
                    "css" => {
                        let value = get_static_value(attr_node)?;
                        if value.as_deref() != Some("injected") {
                            return Err(ParseError::svelte(
                                "svelte_options_invalid_attribute_value",
                                &format!(
                                    "\"{}\" is not a valid value for the \"css\" option (must be \"injected\")",
                                    value.as_deref().unwrap_or("")
                                ),
                                (attr_node.start as usize, attr_node.end as usize),
                            ));
                        }
                        css = Some(CssOption::Injected);
                    }
                    "customElement" => {
                        custom_element = Some(parse_custom_element_option(attr_node)?);
                    }
                    _ => {}
                }
            }
        }

        // Store the options
        self.svelte_options = Some(SvelteOptions {
            start: start as u32,
            end,
            runes,
            immutable,
            accessors,
            preserve_whitespace,
            namespace,
            css,
            custom_element,
            attributes: attr_nodes,
        });

        // svelte:options doesn't produce a node in the fragment
        Ok(None)
    }
}

/// Get a static value from an attribute.
///
/// Returns None if the value is not static (e.g., contains expressions).
fn get_static_value(attr: &crate::ast::template::AttributeNode) -> ParseResult<Option<String>> {
    match &attr.value {
        AttributeValue::True(_) => Ok(Some("true".to_string())),
        AttributeValue::Sequence(parts) => {
            if parts.len() > 1 {
                // Multiple parts means interpolation - not static
                return Ok(None);
            }
            if parts.is_empty() {
                return Ok(Some("true".to_string()));
            }
            match &parts[0] {
                AttributeValuePart::Text(text) => Ok(Some(text.data.to_string())),
                AttributeValuePart::ExpressionTag(expr) => {
                    // Check if it's a literal expression
                    if let Some(value) = expr.expression.as_json().get("value") {
                        if let Some(s) = value.as_str() {
                            return Ok(Some(s.to_string()));
                        }
                        if let Some(b) = value.as_bool() {
                            return Ok(Some(b.to_string()));
                        }
                    }
                    Ok(None)
                }
            }
        }
        _ => Ok(None),
    }
}

/// Get a boolean value from an attribute.
fn get_boolean_value(attr: &crate::ast::template::AttributeNode) -> ParseResult<bool> {
    match &attr.value {
        AttributeValue::True(_) => Ok(true),
        AttributeValue::Sequence(parts) => {
            if parts.is_empty() {
                return Ok(true);
            }
            if let AttributeValuePart::ExpressionTag(expr) = &parts[0] {
                if let Some(value) = expr.expression.as_json().get("value") {
                    if let Some(b) = value.as_bool() {
                        return Ok(b);
                    }
                }
            }

            Err(ParseError::svelte(
                "svelte_options_invalid_attribute_value",
                &format!(
                    "\"{}\" is not a valid value (expected true or false)",
                    attr.name
                ),
                (attr.start as usize, attr.end as usize),
            ))
        }
        _ => Err(ParseError::svelte(
            "svelte_options_invalid_attribute_value",
            &format!(
                "\"{}\" is not a valid value (expected true or false)",
                attr.name
            ),
            (attr.start as usize, attr.end as usize),
        )),
    }
}

/// Parse the customElement option.
///
/// Supports:
/// - `customElement="tag-name"` - string tag name
/// - `customElement={{tag: "tag-name", ...}}` - object with options
/// - `customElement={null}` - disable custom element (for backwards compat)
fn parse_custom_element_option(
    attr: &crate::ast::template::AttributeNode,
) -> ParseResult<CustomElementOptions> {
    match &attr.value {
        AttributeValue::Sequence(parts) => {
            // Check if this is a text value
            if let Some(AttributeValuePart::Text(text)) = parts.first() {
                let tag = text.data.to_string();
                validate_tag_name(&tag, attr)?;
                return Ok(CustomElementOptions {
                    tag: Some(tag.into()),
                    shadow: None,
                    props: None,
                    extend: None,
                });
            }

            // Expression value
            if let Some(AttributeValuePart::ExpressionTag(expr)) = parts.first() {
                let expr_json = expr.expression.as_json();

                // Check for null value (backwards compat - disable custom element)
                if expr_json.get("type") == Some(&JsonValue::String("Literal".to_string())) {
                    if let Some(JsonValue::Null) = expr_json.get("value") {
                        // customElement={null} - skip
                        return Ok(CustomElementOptions {
                            tag: None,
                            shadow: None,
                            props: None,
                            extend: None,
                        });
                    }
                }

                // Object expression: customElement={{tag: "...", ...}}
                if expr_json.get("type") == Some(&JsonValue::String("ObjectExpression".to_string()))
                {
                    return parse_custom_element_object(&expr_json, attr);
                }
            }
        }
        AttributeValue::True(_) => {
            return Err(ParseError::svelte(
                "svelte_options_invalid_customelement",
                "`customElement` must be a string or object",
                (attr.start as usize, attr.end as usize),
            ));
        }
        _ => {}
    }

    Err(ParseError::svelte(
        "svelte_options_invalid_customelement",
        "`customElement` must be a string or object",
        (attr.start as usize, attr.end as usize),
    ))
}

/// Parse customElement object expression.
fn parse_custom_element_object(
    obj_expr: &JsonValue,
    attr: &crate::ast::template::AttributeNode,
) -> ParseResult<CustomElementOptions> {
    let mut tag = None;
    let mut shadow = None;
    let mut props = None;
    let mut extend = None;

    if let Some(JsonValue::Array(properties)) = obj_expr.get("properties") {
        for prop in properties {
            if prop.get("type") != Some(&JsonValue::String("Property".to_string())) {
                continue;
            }

            if prop.get("computed") == Some(&JsonValue::Bool(true)) {
                continue;
            }

            if let Some(JsonValue::String(key_name)) = prop.get("key").and_then(|k| k.get("name")) {
                match key_name.as_str() {
                    "tag" => {
                        if let Some(tag_value) = prop.get("value").and_then(|v| v.get("value")) {
                            if let Some(tag_str) = tag_value.as_str() {
                                validate_tag_name(tag_str, attr)?;
                                tag = Some(tag_str.to_string().into());
                            }
                        }
                    }
                    "shadow" => {
                        if let Some(shadow_value) = prop.get("value").and_then(|v| v.get("value")) {
                            if let Some(shadow_str) = shadow_value.as_str() {
                                shadow = Some(match shadow_str {
                                    "open" => ShadowMode::Open,
                                    "none" => ShadowMode::None,
                                    _ => {
                                        return Err(ParseError::svelte(
                                            "svelte_options_invalid_customelement_shadow",
                                            "`shadow` must be \"open\" or \"none\"",
                                            (attr.start as usize, attr.end as usize),
                                        ));
                                    }
                                });
                            }
                        }
                    }
                    "props" => {
                        // Parse props object and convert to JsonValue
                        if let Some(props_value) = prop.get("value") {
                            props = Some(props_value.clone());
                        }
                    }
                    "extend" => {
                        // Store the extend expression
                        if let Some(extend_expr) = prop.get("value") {
                            extend = Some(Expression::Value(extend_expr.clone()));
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    Ok(CustomElementOptions {
        tag,
        shadow,
        props,
        extend,
    })
}

/// Validate a custom element tag name.
///
/// Tag names must:
/// - Start with a lowercase letter
/// - Contain a hyphen
/// - Only contain valid characters
/// - Not be a reserved name
fn validate_tag_name(tag: &str, attr: &crate::ast::template::AttributeNode) -> ParseResult<()> {
    if tag.is_empty() {
        return Err(ParseError::svelte(
            "svelte_options_invalid_tagname",
            "Tag name cannot be empty",
            (attr.start as usize, attr.end as usize),
        ));
    }

    // Must start with a lowercase letter
    if !tag.chars().next().unwrap().is_ascii_lowercase() {
        return Err(ParseError::svelte(
            "svelte_options_invalid_tagname",
            "Tag name must start with a lowercase letter",
            (attr.start as usize, attr.end as usize),
        ));
    }

    // Must contain a hyphen
    if !tag.contains('-') {
        return Err(ParseError::svelte(
            "svelte_options_invalid_tagname",
            "Tag name must contain a hyphen",
            (attr.start as usize, attr.end as usize),
        ));
    }

    // Check for reserved names
    if RESERVED_TAG_NAMES.contains(&tag) {
        return Err(ParseError::svelte(
            "svelte_options_reserved_tagname",
            &format!("\"{}\" is a reserved tag name", tag),
            (attr.start as usize, attr.end as usize),
        ));
    }

    // Validate characters (simplified version - full regex would be complex)
    // Valid: lowercase letters, digits, hyphen, dot, underscore, and certain unicode ranges
    for c in tag.chars() {
        if !c.is_alphanumeric() && c != '-' && c != '_' && c != '.' {
            if (c as u32) < 0xB7 {
                return Err(ParseError::svelte(
                    "svelte_options_invalid_tagname",
                    &format!("Tag name contains invalid character '{}'", c),
                    (attr.start as usize, attr.end as usize),
                ));
            }
        }
    }

    Ok(())
}
