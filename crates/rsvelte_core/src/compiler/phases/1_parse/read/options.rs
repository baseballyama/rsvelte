//! Svelte options parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/options.js`
//!
//! It parses `<svelte:options>` elements and extracts compiler options such as
//! `runes`, `customElement`, `accessors`, `immutable`, etc.
//!
//! Upstream runs `read_options` from `1-parse/index.js` L164 — after the whole
//! template has been parsed and immediately before `disallow_children` — so the
//! order the three checks fire in is observable: a `svelte_meta_duplicate`
//! anywhere later in the file outranks an attribute-value error, and an
//! attribute-value error outranks this element's own children. The element is
//! therefore only *collected* while parsing; validation happens in
//! [`Parser::read_svelte_options`].

use crate::ast::js::Expression;
use crate::ast::template::{
    AttributeValue, AttributeValuePart, CssOption, CustomElementOptions, Namespace, ShadowMode,
    SvelteOptions, TemplateNode,
};
use crate::error::{ParseError, ParseResult};
use serde_json::Value as JsonValue;

use super::super::parser::Parser;
use crate::compiler::phases::phase3_transform::shared::json_field::Field;

// Upstream emits one message per code regardless of which check failed.
const INVALID_TAGNAME: &str = "Tag name must be lowercase and hyphenated";
const CUSTOM_ELEMENT_INVALID: &str = "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }";
const CUSTOM_ELEMENT_PROPS_INVALID: &str = "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"";
const CUSTOM_ELEMENT_SHADOW_INVALID: &str =
    "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.";

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

const PROP_TYPES: &[&str] = &["String", "Number", "Boolean", "Array", "Object"];

/// A `<svelte:options>` element as collected during the parse, before any of its
/// attributes have been validated.
pub(crate) struct SvelteOptionsRaw<'a> {
    pub start: u32,
    pub end: u32,
    pub attributes: Vec<crate::ast::Attribute<'a>>,
    /// Source span of the element's children, when it has any. Upstream's
    /// `disallow_children` fires on any node at all, whitespace included.
    pub children: Option<(usize, usize)>,
}

impl<'a> Parser<'a> {
    /// Collect a `<svelte:options>` element.
    ///
    /// Note: This is called after the opening tag name and attributes have been parsed,
    /// and the `>` has already been consumed.
    pub fn parse_svelte_options(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute<'a>>,
        self_closing: bool,
    ) -> ParseResult<Option<TemplateNode<'a>>> {
        let mut children = None;

        if !self_closing {
            let content_start = self.index;
            while !self.is_eof() && !self.match_str("</svelte:options") {
                self.advance();
            }
            if self.index > content_start {
                children = Some((content_start, self.index));
            }
            if self.match_str("</svelte:options") {
                self.advance_by("</svelte:options".len());
                self.skip_whitespace();
                self.eat_optional(">");
            }
        }

        self.svelte_options_raw = Some(SvelteOptionsRaw {
            start: start as u32,
            end: self.index as u32,
            attributes,
            children,
        });

        // svelte:options doesn't produce a node in the fragment
        Ok(None)
    }

    /// Validate the collected `<svelte:options>` element and store the result.
    ///
    /// Mirrors `1-parse/index.js` L164-166: `read_options` first, then
    /// `disallow_children`.
    pub(crate) fn read_svelte_options(&mut self) -> ParseResult<()> {
        let Some(raw) = self.svelte_options_raw.take() else {
            return Ok(());
        };

        let options = read_options(&raw)?;

        if let Some((start, end)) = raw.children {
            return Err(ParseError::svelte(
                "svelte_meta_invalid_content",
                "<svelte:options> cannot have children",
                (start, end),
            ));
        }

        self.svelte_options = Some(options);
        Ok(())
    }
}

/// The body of upstream's `read_options`.
fn read_options<'a>(raw: &SvelteOptionsRaw<'a>) -> ParseResult<SvelteOptions<'a>> {
    let mut options = SvelteOptions {
        start: raw.start,
        end: raw.end,
        ..Default::default()
    };

    for attr in &raw.attributes {
        let crate::ast::Attribute::Attribute(attr_node) = attr else {
            // Spreads / directives are not allowed on `<svelte:options>` —
            // upstream: `if (attribute.type !== 'Attribute')
            // e.svelte_options_invalid_attribute(attribute)`.
            use crate::ast::Attribute as A;
            let (a_start, a_end) = match attr {
                A::Attribute(_) => unreachable!(),
                A::SpreadAttribute(a) => (a.start, a.end),
                A::AttachTag(a) => (a.start, a.end),
                A::BindDirective(a) => (a.start, a.end),
                A::OnDirective(a) => (a.start, a.end),
                A::ClassDirective(a) => (a.start, a.end),
                A::StyleDirective(a) => (a.start, a.end),
                A::TransitionDirective(a) => (a.start, a.end),
                A::AnimateDirective(a) => (a.start, a.end),
                A::UseDirective(a) => (a.start, a.end),
                A::LetDirective(a) => (a.start, a.end),
            };
            return Err(ParseError::svelte(
                "svelte_options_invalid_attribute",
                "`<svelte:options>` can only receive static attributes",
                (a_start as usize, a_end as usize),
            ));
        };

        let span = (attr_node.start as usize, attr_node.end as usize);
        options.attributes.push(attr_node.clone());

        match attr_node.name.as_str() {
            "runes" => options.runes = Some(get_boolean_value(attr_node)?),
            "tag" => {
                return Err(ParseError::svelte(
                    "svelte_options_deprecated_tag",
                    "\"tag\" option is deprecated — use \"customElement\" instead",
                    span,
                ));
            }
            "customElement" => options.custom_element = parse_custom_element_option(attr_node)?,
            "namespace" => {
                options.namespace = match get_static_value(attr_node).as_deref() {
                    Some("http://www.w3.org/2000/svg") | Some("svg") => Some(Namespace::Svg),
                    Some("http://www.w3.org/1998/Math/MathML") | Some("mathml") => {
                        Some(Namespace::Mathml)
                    }
                    Some("html") => Some(Namespace::Html),
                    _ => {
                        return Err(ParseError::svelte(
                            "svelte_options_invalid_attribute_value",
                            "Value must be \"html\", \"mathml\" or \"svg\", if specified",
                            span,
                        ));
                    }
                };
            }
            "css" => {
                if get_static_value(attr_node).as_deref() != Some("injected") {
                    return Err(ParseError::svelte(
                        "svelte_options_invalid_attribute_value",
                        "Value must be \"injected\", if specified",
                        span,
                    ));
                }
                options.css = Some(CssOption::Injected);
            }
            "immutable" => options.immutable = Some(get_boolean_value(attr_node)?),
            "preserveWhitespace" => {
                options.preserve_whitespace = Some(get_boolean_value(attr_node)?)
            }
            "accessors" => options.accessors = Some(get_boolean_value(attr_node)?),
            name => {
                return Err(ParseError::svelte(
                    "svelte_options_unknown_attribute",
                    format!("`<svelte:options>` unknown attribute '{name}'"),
                    span,
                ));
            }
        }
    }

    Ok(options)
}

/// Upstream's `get_static_value`, narrowed to the string values its two callers
/// compare against: a non-string JS value can never equal `"html"`/`"injected"`,
/// so folding it into `None` is observationally identical.
fn get_static_value(attr: &crate::ast::template::AttributeNode<'_>) -> Option<String> {
    match &attr.value {
        // A valueless attribute is `true`, which is not a string.
        AttributeValue::True(_) => None,
        AttributeValue::Expression(expr) => literal_string(&expr.expression),
        AttributeValue::Sequence(parts) => match parts.split_first() {
            None => None,
            // More than one chunk is interpolation, never a static value.
            Some((_, rest)) if !rest.is_empty() => None,
            Some((AttributeValuePart::Text(text), _)) => Some(text.data.to_string()),
            Some((AttributeValuePart::ExpressionTag(tag), _)) => literal_string(&tag.expression),
        },
    }
}

/// The value of a string `Literal`, which is the only expression form upstream's
/// `get_static_value` reads through (a template literal deliberately is not one).
fn literal_string(expression: &Expression<'_>) -> Option<String> {
    let json = expression.as_json();
    if json.field("type") != Some(&JsonValue::String("Literal".to_string())) {
        return None;
    }
    json.field("value")?.as_str().map(str::to_string)
}

/// Upstream's `get_boolean_value`.
fn get_boolean_value(attr: &crate::ast::template::AttributeNode<'_>) -> ParseResult<bool> {
    let value = match &attr.value {
        AttributeValue::True(_) => Some(true),
        AttributeValue::Expression(expr) => literal_bool(&expr.expression),
        AttributeValue::Sequence(parts) => match parts.split_first() {
            None => Some(true),
            Some((_, rest)) if !rest.is_empty() => None,
            Some((AttributeValuePart::Text(_), _)) => None,
            Some((AttributeValuePart::ExpressionTag(tag), _)) => literal_bool(&tag.expression),
        },
    };

    value.ok_or_else(|| {
        ParseError::svelte(
            "svelte_options_invalid_attribute_value",
            "Value must be true or false, if specified",
            (attr.start as usize, attr.end as usize),
        )
    })
}

fn literal_bool(expression: &Expression<'_>) -> Option<bool> {
    let json = expression.as_json();
    if json.field("type") != Some(&JsonValue::String("Literal".to_string())) {
        return None;
    }
    json.field("value")?.as_bool()
}

/// Parse the customElement option.
///
/// Supports:
/// - `customElement="tag-name"` - string tag name
/// - `customElement={{tag: "tag-name", ...}}` - object with options
/// - `customElement={null}` - disable custom element (for backwards compat)
fn parse_custom_element_option<'a>(
    attr: &crate::ast::template::AttributeNode,
) -> ParseResult<Option<CustomElementOptions<'a>>> {
    let invalid = || {
        ParseError::svelte(
            "svelte_options_invalid_customelement",
            CUSTOM_ELEMENT_INVALID,
            (attr.start as usize, attr.end as usize),
        )
    };

    let expression = match &attr.value {
        AttributeValue::True(_) => return Err(invalid()),
        AttributeValue::Expression(expr) => &expr.expression,
        AttributeValue::Sequence(parts) => match parts.first() {
            Some(AttributeValuePart::Text(text)) => {
                let tag = text.data.to_string();
                validate_tag_name(Some(tag.as_str()), attr)?;
                return Ok(Some(CustomElementOptions {
                    tag: Some(tag.into()),
                    shadow: None,
                    shadow_object: None,
                    props: None,
                    extend: None,
                }));
            }
            Some(AttributeValuePart::ExpressionTag(tag)) => &tag.expression,
            None => return Err(invalid()),
        },
    };

    let json = expression.as_json();
    let ty = json.field("type").and_then(|t| t.as_str()).unwrap_or("");

    if ty != "ObjectExpression" {
        // Before Svelte 4 it was necessary to explicitly set customElement to
        // null or else you'd get a warning; upstream still accepts it, and
        // returning `None` keeps the custom-element pipeline off (H-115).
        if ty == "Literal" && json.field("value") == Some(&JsonValue::Null) {
            return Ok(None);
        }
        return Err(invalid());
    }

    parse_custom_element_object(json, attr).map(Some)
}

/// Parse customElement object expression.
fn parse_custom_element_object<'a>(
    obj_expr: &JsonValue,
    attr: &crate::ast::template::AttributeNode,
) -> ParseResult<CustomElementOptions<'a>> {
    let mut tag = None;
    let mut shadow = None;
    let mut shadow_object = None;
    let mut props = None;
    let mut extend = None;

    let empty = Vec::new();
    let properties = match obj_expr.field("properties") {
        Some(JsonValue::Array(properties)) => properties,
        _ => &empty,
    };

    for prop in properties {
        if !is_plain_property(prop) {
            return Err(ParseError::svelte(
                "svelte_options_invalid_customelement",
                CUSTOM_ELEMENT_INVALID,
                (attr.start as usize, attr.end as usize),
            ));
        }
        let key = property_key(prop).unwrap_or_default();
        let value = prop.field("value");

        match key {
            "tag" => {
                // Upstream reads `tag[1]?.value`, so anything that is not a
                // string literal reaches `validate_tag` as a non-string.
                let tag_value = value
                    .and_then(|v| v.field("value"))
                    .and_then(|v| v.as_str());
                validate_tag_name(tag_value, attr)?;
                tag = tag_value.map(|t| t.to_string().into());
            }
            "shadow" => {
                // Mirrors 1-parse/read/options.js L134-143: a string literal must
                // be "open"/"none"; an ObjectExpression (ShadowRootInit) is
                // passed through verbatim.
                let value_type = value
                    .and_then(|v| v.field("type"))
                    .and_then(|t| t.as_str())
                    .unwrap_or("");
                if value_type == "ObjectExpression" {
                    shadow_object = value.cloned();
                } else {
                    match value
                        .and_then(|v| v.field("value"))
                        .and_then(|v| v.as_str())
                    {
                        Some("open") if value_type == "Literal" => shadow = Some(ShadowMode::Open),
                        Some("none") if value_type == "Literal" => shadow = Some(ShadowMode::None),
                        _ => {
                            return Err(ParseError::svelte(
                                "svelte_options_invalid_customelement_shadow",
                                CUSTOM_ELEMENT_SHADOW_INVALID,
                                (attr.start as usize, attr.end as usize),
                            ));
                        }
                    }
                }
            }
            "props" => {
                let value = value.cloned().unwrap_or(JsonValue::Null);
                validate_custom_element_props(&value, attr)?;
                props = Some(value);
            }
            "extend" => {
                if let Some(extend_expr) = value {
                    extend = Some(Expression::from_json(extend_expr.clone()));
                }
            }
            _ => {}
        }
    }

    Ok(CustomElementOptions {
        tag,
        shadow,
        shadow_object,
        props,
        extend,
    })
}

/// Upstream's `props` walk (1-parse/read/options.js L83-132): every entry must be
/// a statically analyzable `{ attribute?, reflect?, type? }` object literal.
fn validate_custom_element_props(
    props: &JsonValue,
    attr: &crate::ast::template::AttributeNode,
) -> ParseResult<()> {
    let invalid = || {
        ParseError::svelte(
            "svelte_options_invalid_customelement_props",
            CUSTOM_ELEMENT_PROPS_INVALID,
            (attr.start as usize, attr.end as usize),
        )
    };

    let Some(JsonValue::Array(entries)) = object_properties(props) else {
        return Err(invalid());
    };

    for entry in entries {
        if !is_plain_property(entry) {
            return Err(invalid());
        }
        let Some(JsonValue::Array(fields)) = entry.field("value").and_then(object_properties)
        else {
            return Err(invalid());
        };

        for field in fields {
            if !is_plain_property(field) {
                return Err(invalid());
            }
            let value = field.field("value");
            if value.and_then(|v| v.field("type")).and_then(|t| t.as_str()) != Some("Literal") {
                return Err(invalid());
            }
            let value = value
                .and_then(|v| v.field("value"))
                .unwrap_or(&JsonValue::Null);

            let ok = match property_key(field).unwrap_or_default() {
                "type" => value.as_str().is_some_and(|t| PROP_TYPES.contains(&t)),
                "reflect" => value.is_boolean(),
                "attribute" => value.is_string(),
                _ => false,
            };
            if !ok {
                return Err(invalid());
            }
        }
    }

    Ok(())
}

/// The `properties` array of an `ObjectExpression`, or `None` for anything else.
fn object_properties(node: &JsonValue) -> Option<&JsonValue> {
    if node.field("type")?.as_str()? != "ObjectExpression" {
        return None;
    }
    node.field("properties")
}

/// Upstream's repeated `property.type !== 'Property' || property.computed ||
/// property.key.type !== 'Identifier'` guard.
fn is_plain_property(node: &JsonValue) -> bool {
    node.field("type").and_then(|t| t.as_str()) == Some("Property")
        && node.field("computed") != Some(&JsonValue::Bool(true))
        && node
            .field("key")
            .and_then(|k| k.field("type"))
            .and_then(|t| t.as_str())
            == Some("Identifier")
}

fn property_key(node: &JsonValue) -> Option<&str> {
    node.field("key")?.field("name")?.as_str()
}

/// Upstream's `validate_tag`: a non-string is always invalid, and a falsy tag
/// (the empty string) is deliberately left alone.
fn validate_tag_name(
    tag: Option<&str>,
    attr: &crate::ast::template::AttributeNode<'_>,
) -> ParseResult<()> {
    let span = (attr.start as usize, attr.end as usize);
    let invalid = || ParseError::svelte("svelte_options_invalid_tagname", INVALID_TAGNAME, span);

    let Some(tag) = tag else {
        return Err(invalid());
    };
    if tag.is_empty() {
        return Ok(());
    }

    if !is_valid_custom_element_tag(tag) {
        return Err(invalid());
    }
    if RESERVED_TAG_NAMES.contains(&tag) {
        return Err(ParseError::svelte(
            "svelte_options_reserved_tagname",
            "Tag name is reserved",
            span,
        ));
    }
    Ok(())
}

/// Upstream's `regex_valid_tag_name`: `^[a-z]<char>*-<char>*$`.
fn is_valid_custom_element_tag(tag: &str) -> bool {
    let mut chars = tag.chars();
    match chars.next() {
        Some(c) if c.is_ascii_lowercase() => {}
        _ => return false,
    }
    let mut has_hyphen = false;
    for c in chars {
        if c == '-' {
            has_hyphen = true;
        } else if !is_tag_name_char(c) {
            return false;
        }
    }
    has_hyphen
}

/// `[a-z0-9_.\xB7\xC0-\xD6\xD8-\xF6\xF8-ͽͿ-῿‌-‍‿-⁀
/// ⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�\u{10000}-\u{EFFFF}-]`
fn is_tag_name_char(c: char) -> bool {
    matches!(c,
        'a'..='z' | '0'..='9' | '_' | '.' | '-'
        | '\u{B7}'
        | '\u{C0}'..='\u{D6}'
        | '\u{D8}'..='\u{F6}'
        | '\u{F8}'..='\u{37D}'
        | '\u{37F}'..='\u{1FFF}'
        | '\u{200C}'..='\u{200D}'
        | '\u{203F}'..='\u{2040}'
        | '\u{2070}'..='\u{218F}'
        | '\u{2C00}'..='\u{2FEF}'
        | '\u{3001}'..='\u{D7FF}'
        | '\u{F900}'..='\u{FDCF}'
        | '\u{FDF0}'..='\u{FFFD}'
        | '\u{10000}'..='\u{EFFFF}'
    )
}
