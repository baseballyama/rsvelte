//! `svelte/no-shorthand-style-property-overrides` — flag a CSS shorthand
//! property that overrides a related longhand declared earlier on the same
//! element (across the static `style="…"` attribute and `style:` directives, in
//! source order). Port of the eslint-plugin-svelte rule.
//!
//! The static `style="…"` value is parsed by splitting on `;` and reading the
//! property name before each `:` (interpolation `{expr}` segments are handled
//! by extracting CSS property names from string/template literals within
//! conditional/logical expressions, mirroring upstream's `getAllInlineStyles`).

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-shorthand-style-property-overrides",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow shorthand style properties that override related longhand properties",
    options_schema: None,
};

/// shorthand → related longhand properties. Mirrors upstream `SHORTHAND_PROPERTIES`.
#[rustfmt::skip]
const SHORTHAND_PROPERTIES: &[(&str, &[&str])] = &[
    ("margin", &["margin-top", "margin-bottom", "margin-left", "margin-right"]),
    ("padding", &["padding-top", "padding-bottom", "padding-left", "padding-right"]),
    ("background", &["background-image", "background-size", "background-position", "background-repeat", "background-origin", "background-clip", "background-attachment", "background-color"]),
    ("font", &["font-style", "font-variant", "font-weight", "font-stretch", "font-size", "font-family", "line-height"]),
    ("border", &["border-top-width", "border-bottom-width", "border-left-width", "border-right-width", "border-top-style", "border-bottom-style", "border-left-style", "border-right-style", "border-top-color", "border-bottom-color", "border-left-color", "border-right-color"]),
    ("border-top", &["border-top-width", "border-top-style", "border-top-color"]),
    ("border-bottom", &["border-bottom-width", "border-bottom-style", "border-bottom-color"]),
    ("border-left", &["border-left-width", "border-left-style", "border-left-color"]),
    ("border-right", &["border-right-width", "border-right-style", "border-right-color"]),
    ("border-width", &["border-top-width", "border-bottom-width", "border-left-width", "border-right-width"]),
    ("border-style", &["border-top-style", "border-bottom-style", "border-left-style", "border-right-style"]),
    ("border-color", &["border-top-color", "border-bottom-color", "border-left-color", "border-right-color"]),
    ("list-style", &["list-style-type", "list-style-position", "list-style-image"]),
    ("border-radius", &["border-top-right-radius", "border-top-left-radius", "border-bottom-right-radius", "border-bottom-left-radius"]),
    ("transition", &["transition-delay", "transition-duration", "transition-property", "transition-timing-function"]),
    ("animation", &["animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"]),
    ("border-block-end", &["border-block-end-width", "border-block-end-style", "border-block-end-color"]),
    ("border-block-start", &["border-block-start-width", "border-block-start-style", "border-block-start-color"]),
    ("border-image", &["border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat"]),
    ("border-inline-end", &["border-inline-end-width", "border-inline-end-style", "border-inline-end-color"]),
    ("border-inline-start", &["border-inline-start-width", "border-inline-start-style", "border-inline-start-color"]),
    ("column-rule", &["column-rule-width", "column-rule-style", "column-rule-color"]),
    ("columns", &["column-width", "column-count"]),
    ("flex", &["flex-grow", "flex-shrink", "flex-basis"]),
    ("flex-flow", &["flex-direction", "flex-wrap"]),
    ("grid", &["grid-template-rows", "grid-template-columns", "grid-template-areas", "grid-auto-rows", "grid-auto-columns", "grid-auto-flow", "grid-column-gap", "grid-row-gap"]),
    ("grid-area", &["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"]),
    ("grid-column", &["grid-column-start", "grid-column-end"]),
    ("grid-gap", &["grid-row-gap", "grid-column-gap"]),
    ("grid-row", &["grid-row-start", "grid-row-end"]),
    ("grid-template", &["grid-template-columns", "grid-template-rows", "grid-template-areas"]),
    ("outline", &["outline-color", "outline-style", "outline-width"]),
    ("text-decoration", &["text-decoration-color", "text-decoration-style", "text-decoration-line"]),
    ("text-emphasis", &["text-emphasis-style", "text-emphasis-color"]),
    ("mask", &["mask-image", "mask-mode", "mask-position", "mask-size", "mask-repeat", "mask-origin", "mask-clip", "mask-composite"]),
];

fn longhands_of(normalized: &str) -> Option<&'static [&'static str]> {
    SHORTHAND_PROPERTIES
        .iter()
        .find(|(k, _)| *k == normalized)
        .map(|(_, v)| *v)
}

/// The `-vendor-` prefix of `prop` (matching `/^-\w+-/`), or "".
fn vendor_prefix(prop: &str) -> &str {
    let b = prop.as_bytes();
    if b.first() != Some(&b'-') {
        return "";
    }
    let mut i = 1;
    while i < b.len() && (b[i].is_ascii_alphanumeric() || b[i] == b'_') {
        i += 1;
    }
    if i < b.len() && i > 1 && b[i] == b'-' {
        &prop[..=i]
    } else {
        ""
    }
}

#[derive(Default)]
pub struct NoShorthandStylePropertyOverrides;

impl Rule for NoShorthandStylePropertyOverrides {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        // Ordered (property, report-start) declarations across `style:` directives
        // and the static `style="…"` attribute, in source order.
        let mut decls: Vec<(String, u32)> = Vec::new();
        for attr in &el.attributes {
            match attr {
                Attribute::StyleDirective(d) => {
                    let name_start = d.start + "style:".len() as u32;
                    decls.push((d.name.to_string(), name_start));
                }
                Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("style") => {
                    if let AttributeValue::Sequence(parts) = &node.value {
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(t) => {
                                    parse_style_decls(&t.raw, t.start, &mut decls);
                                }
                                AttributeValuePart::ExpressionTag(tag) => {
                                    let src = ctx.slice(tag.start, tag.end);
                                    let inline = extract_inline_style_decls(src, tag.start);
                                    decls.extend(inline.into_iter().map(|(n, s, _)| (n, s)));
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        let mut seen: Vec<String> = Vec::new();
        let mut reports: Vec<(u32, String)> = Vec::new();
        for (prop, start) in &decls {
            let prefix = vendor_prefix(prop);
            let normalized = &prop[prefix.len()..];
            if let Some(longhands) = longhands_of(normalized) {
                for lh in longhands {
                    let with_prefix = format!("{prefix}{lh}");
                    if seen.iter().any(|s| s == &with_prefix) {
                        reports.push((
                            *start,
                            format!("Unexpected shorthand '{prop}' after '{with_prefix}'."),
                        ));
                    }
                }
            }
            seen.push(prop.clone());
        }
        for (start, msg) in reports {
            ctx.report(start, start, msg);
        }
    }
}

/// Parse `prop: value; prop2: value2` declaration *names* from a raw style
/// string, pushing `(name, absolute-start)` for each. Mirrors the seed
/// `no-dupe-style-properties` parser.
fn parse_style_decls(raw: &str, base: u32, out: &mut Vec<(String, u32)>) {
    let bytes = raw.as_bytes();
    let mut decl_begin = 0usize;
    for i in 0..=bytes.len() {
        if i == bytes.len() || bytes[i] == b';' {
            if decl_begin < i
                && let Some(colon) = raw[decl_begin..i].find(':')
            {
                let name_raw = &raw[decl_begin..decl_begin + colon];
                let trimmed = name_raw.trim();
                if !trimmed.is_empty() && !trimmed.contains('{') {
                    let lead = name_raw.len() - name_raw.trim_start().len();
                    out.push((trimmed.to_string(), base + (decl_begin + lead) as u32));
                }
            }
            decl_begin = i + 1;
        }
    }
}

/// Extract CSS property declaration names from string/template literals
/// inside an expression-tag source text (the whole `{...}` including braces).
/// Returns `(name, abs_start, abs_end)` triples. Mirrors upstream's
/// `extractExpressions` + `getInlineStyle` for ternary/logical branches.
fn extract_inline_style_decls(src: &str, tag_start: u32) -> Vec<(String, u32, u32)> {
    let mut out = Vec::new();
    extract_from_expr(src.as_bytes(), tag_start, &mut out);
    out
}

fn extract_from_expr(bytes: &[u8], base: u32, out: &mut Vec<(String, u32, u32)>) {
    let mut i = 0usize;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' => {
                let start = i;
                i += 1;
                while i < bytes.len() && bytes[i] != b'\'' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1;
                }
                let content = &bytes[start + 1..i.saturating_sub(1)];
                extract_css_decl_names_from_literal(content, base + start as u32 + 1, out);
            }
            b'"' => {
                let start = i;
                i += 1;
                while i < bytes.len() && bytes[i] != b'"' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1;
                }
                let content = &bytes[start + 1..i.saturating_sub(1)];
                extract_css_decl_names_from_literal(content, base + start as u32 + 1, out);
            }
            b'`' => {
                let start = i;
                i += 1;
                while i < bytes.len() && bytes[i] != b'`' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && bytes.get(i + 1) == Some(&b'{') {
                        i += 2;
                        let mut depth = 1usize;
                        while i < bytes.len() && depth > 0 {
                            match bytes[i] {
                                b'{' => depth += 1,
                                b'}' => depth -= 1,
                                _ => {}
                            }
                            i += 1;
                        }
                        continue;
                    }
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1;
                }
                let content_start = start + 1;
                let content_end = i.saturating_sub(1);
                extract_css_decl_names_from_template(
                    bytes,
                    content_start,
                    content_end,
                    base + content_start as u32,
                    out,
                );
            }
            _ => {
                i += 1;
            }
        }
    }
}

fn push_decl_name(seg: &str, seg_base: u32, out: &mut Vec<(String, u32, u32)>) {
    let Some(colon) = seg.find(':') else {
        return;
    };
    let name_raw = &seg[..colon];
    let trimmed = name_raw.trim();
    if trimmed.is_empty() || trimmed.contains('{') {
        return;
    }
    let lead = name_raw.len() - name_raw.trim_start().len();
    let start = seg_base + lead as u32;
    let end = start + trimmed.len() as u32;
    out.push((trimmed.to_string(), start, end));
}

fn extract_css_decl_names_from_literal(
    content: &[u8],
    base: u32,
    out: &mut Vec<(String, u32, u32)>,
) {
    let mut decl_begin = 0usize;
    for i in 0..=content.len() {
        if i == content.len() || content[i] == b';' {
            if decl_begin < i
                && let Ok(seg) = std::str::from_utf8(&content[decl_begin..i])
            {
                push_decl_name(seg, base + decl_begin as u32, out);
            }
            decl_begin = i + 1;
        }
    }
}

fn extract_css_decl_names_from_template(
    bytes: &[u8],
    content_start: usize,
    content_end: usize,
    base: u32,
    out: &mut Vec<(String, u32, u32)>,
) {
    let content = &bytes[content_start..content_end];
    let mut decl_begin = 0usize;
    let mut i = 0usize;
    while i <= content.len() {
        let at_end = i == content.len();
        let is_sep = !at_end
            && (content[i] == b';' || (content[i] == b'$' && content.get(i + 1) == Some(&b'{')));
        if at_end || is_sep {
            if decl_begin < i
                && let Ok(seg) = std::str::from_utf8(&content[decl_begin..i])
            {
                push_decl_name(seg, base + decl_begin as u32, out);
            }
            if !at_end && content[i] == b'$' {
                i += 2;
                let mut depth = 1usize;
                while i < content.len() && depth > 0 {
                    match content[i] {
                        b'{' => depth += 1,
                        b'}' => depth -= 1,
                        _ => {}
                    }
                    i += 1;
                }
                decl_begin = i;
                continue;
            }
            decl_begin = i + 1;
        }
        if at_end {
            break;
        }
        i += 1;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vendor_prefix_detection() {
        assert_eq!(vendor_prefix("-webkit-mask"), "-webkit-");
        assert_eq!(vendor_prefix("background"), "");
        assert_eq!(vendor_prefix("-x"), "");
    }

    #[test]
    fn longhand_lookup() {
        assert!(
            longhands_of("background")
                .unwrap()
                .contains(&"background-repeat")
        );
        assert!(longhands_of("color").is_none());
    }

    #[test]
    fn parses_decl_names() {
        let mut out = Vec::new();
        parse_style_decls("background-repeat: repeat; background: green", 0, &mut out);
        assert_eq!(out[0].0, "background-repeat");
        assert_eq!(out[1].0, "background");
    }
}
