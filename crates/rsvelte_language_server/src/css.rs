//! Native CSS assistance for Svelte style blocks and static style attributes.

use lsp_types::{
    Color, ColorInformation, ColorPresentation, CompletionItem, CompletionItemKind, CompletionList,
    Diagnostic, DiagnosticSeverity, Documentation, MarkupContent, MarkupKind, NumberOrString,
    Range,
};

use rsvelte_lint::rules::data::known_css_properties::KNOWN_CSS_PROPERTIES;

use crate::text::LineIndex;

#[must_use]
pub fn colors(text: &str) -> Vec<ColorInformation> {
    let index = LineIndex::new(text);
    text.match_indices('#')
        .filter_map(|(start, _)| {
            let end = start + 7;
            let hex = text.get(start + 1..end)?;
            if !(style_body(text, start) || static_style_value(text, start))
                || !hex.as_bytes().iter().all(u8::is_ascii_hexdigit)
            {
                return None;
            }
            Some(ColorInformation {
                range: Range::new(index.position(text, start), index.position(text, end)),
                color: Color {
                    red: u8::from_str_radix(&hex[..2], 16).ok()? as f32 / 255.0,
                    green: u8::from_str_radix(&hex[2..4], 16).ok()? as f32 / 255.0,
                    blue: u8::from_str_radix(&hex[4..], 16).ok()? as f32 / 255.0,
                    alpha: 1.0,
                },
            })
        })
        .collect()
}

#[must_use]
pub fn diagnostics(text: &str) -> Vec<Diagnostic> {
    let index = LineIndex::new(text);
    let mut diagnostics = Vec::new();
    let mut from = 0;
    while let Some(open) = text[from..].find("<style") {
        let open = from + open;
        let Some(start) = text[open..].find('>').map(|at| open + at + 1) else {
            break;
        };
        let end = text[start..]
            .find("</style")
            .map_or(text.len(), |at| start + at);
        let body = &text[start..end];
        let mut line_offset = 0;
        for line in body.split_inclusive('\n') {
            let current_line_offset = line_offset;
            line_offset += line.len();
            let Some(colon) = line.find(':') else {
                continue;
            };
            let property = line[..colon]
                .rsplit(['{', '}', ';'])
                .next()
                .unwrap_or("")
                .trim();
            if property.is_empty()
                || property.starts_with("--")
                || !property
                    .bytes()
                    .all(|byte| byte.is_ascii_alphabetic() || byte == b'-')
                || KNOWN_CSS_PROPERTIES.contains(&property)
            {
                continue;
            }
            let property_start = start + current_line_offset + line.find(property).unwrap_or(0);
            diagnostics.push(Diagnostic {
                range: Range::new(
                    index.position(text, property_start),
                    index.position(text, property_start + property.len()),
                ),
                severity: Some(DiagnosticSeverity::WARNING),
                code: Some(NumberOrString::String("css_unknown_property".to_string())),
                source: Some("rsvelte-css".to_string()),
                message: format!("Unknown CSS property `{property}`."),
                ..Diagnostic::default()
            });
        }
        from = end.saturating_add(8);
    }
    diagnostics
}

#[must_use]
pub fn color_presentations(color: Color) -> Vec<ColorPresentation> {
    let channel = |value: f32| (value.clamp(0.0, 1.0) * 255.0).round() as u8;
    vec![ColorPresentation {
        label: format!(
            "#{:02x}{:02x}{:02x}",
            channel(color.red),
            channel(color.green),
            channel(color.blue)
        ),
        ..ColorPresentation::default()
    }]
}

/// Selection expansion spans, innermost first, for a CSS declaration.
#[must_use]
pub fn selection_spans(text: &str, offset: usize) -> Vec<(u32, u32)> {
    let Some(body) = style_body_range(text, offset) else {
        return Vec::new();
    };
    let before = &text[body.start..offset.min(body.end)];
    let declaration_start = before
        .rfind([';', '{', '}'])
        .map_or(body.start, |i| body.start + i + 1);
    let declaration_end = text[offset.min(body.end)..body.end]
        .find([';', '}'])
        .map_or(body.end, |i| offset + i);
    let word = word_at(text, offset).and_then(|word| {
        let start = word.as_ptr() as usize - text.as_ptr() as usize;
        u32::try_from(start)
            .ok()
            .zip(u32::try_from(start + word.len()).ok())
    });
    word.into_iter()
        .chain(std::iter::once((
            declaration_start as u32,
            declaration_end as u32,
        )))
        .chain(std::iter::once((body.start as u32, body.end as u32)))
        .collect()
}

/// CSS completions at `offset`, when it is in a declaration name or value.
#[must_use]
pub fn completions(text: &str, offset: usize) -> Option<CompletionList> {
    let prefix = css_prefix(text, offset)?;
    let before = text.get(..offset)?;
    let prefix_start = prefix.as_ptr() as usize - before.as_ptr() as usize;
    if let Some(marker) = prefix_start
        .checked_sub(1)
        .and_then(|index| before.as_bytes().get(index))
        && matches!(marker, b'.' | b'#')
    {
        return Some(selector_completions(text, *marker as char, prefix));
    }
    if prefix_start
        .checked_sub(1)
        .and_then(|index| before.as_bytes().get(index))
        == Some(&b':')
        && "global".starts_with(prefix)
    {
        return Some(CompletionList {
            is_incomplete: false,
            items: vec![CompletionItem {
                label: ":global".to_string(),
                insert_text: Some("global($0)".to_string()),
                kind: Some(CompletionItemKind::FUNCTION),
                documentation: Some(Documentation::MarkupContent(MarkupContent {
                    kind: MarkupKind::Markdown,
                    value: "`:global(...)` prevents Svelte CSS scoping for a selector.".to_string(),
                })),
                ..CompletionItem::default()
            }],
        });
    }
    let value = before
        .rfind(':')
        .is_some_and(|colon| before[colon + 1..].find([';', '{', '}']).is_none());
    let items = if value {
        values(prefix)
    } else {
        KNOWN_CSS_PROPERTIES
            .iter()
            .copied()
            .filter(|property| property.starts_with(prefix))
            .map(property_item)
            .collect()
    };
    Some(CompletionList {
        is_incomplete: false,
        items,
    })
}

/// The CSS property under `offset`, including a compact native description.
#[must_use]
pub fn hover(text: &str, offset: usize) -> Option<String> {
    if text.get(..offset)?.ends_with(":global") || word_at(text, offset) == Some("global") {
        return Some("`:global(...)` prevents Svelte CSS scoping for a selector.".to_string());
    }
    let property = word_at(text, offset)?;
    KNOWN_CSS_PROPERTIES
        .contains(&property)
        .then(|| format!("`{property}` CSS property"))
}

fn css_prefix(text: &str, offset: usize) -> Option<&str> {
    let before = text.get(..offset)?;
    let in_style = style_body(text, offset) || static_style_value(text, offset);
    if !in_style {
        return None;
    }
    let start = before
        .char_indices()
        .rev()
        .find(|(_, c)| !matches!(c, 'a'..='z' | 'A'..='Z' | '-' | '_'))
        .map_or(0, |(index, c)| index + c.len_utf8());
    Some(&before[start..])
}

fn style_body(text: &str, offset: usize) -> bool {
    style_body_range(text, offset).is_some()
}

fn style_body_range(text: &str, offset: usize) -> Option<std::ops::Range<usize>> {
    let before = text.get(..offset.min(text.len()))?;
    let open = before.rfind("<style")?;
    let start = before[open..].find('>')? + open + 1;
    let end = text[start..]
        .find("</style")
        .map_or(text.len(), |index| start + index);
    (start <= offset && offset <= end).then_some(start..end)
}

fn static_style_value(text: &str, offset: usize) -> bool {
    let Some(before) = text.get(..offset.min(text.len())) else {
        return false;
    };
    let quote = before
        .rfind("style=\"")
        .map(|i| (i + 7, '"'))
        .or_else(|| before.rfind("style='").map(|i| (i + 7, '\'')));
    quote.is_some_and(|(start, quote)| !before[start..].contains(quote))
}

fn selector_completions(text: &str, marker: char, prefix: &str) -> CompletionList {
    let attribute = if marker == '.' { "class" } else { "id" };
    let mut names = std::collections::BTreeSet::new();
    for quote in ['\'', '"'] {
        let needle = format!("{attribute}={quote}");
        for (start, _) in text.match_indices(&needle) {
            if let Some(value) = text[start + needle.len()..].split(quote).next() {
                for name in value.split_ascii_whitespace() {
                    if name.starts_with(prefix) {
                        names.insert(name);
                    }
                }
            }
        }
    }
    CompletionList {
        is_incomplete: false,
        items: names
            .into_iter()
            .map(|name| CompletionItem {
                label: format!("{marker}{name}"),
                kind: Some(CompletionItemKind::REFERENCE),
                ..CompletionItem::default()
            })
            .collect(),
    }
}

fn word_at(text: &str, offset: usize) -> Option<&str> {
    let start = text[..offset.min(text.len())]
        .char_indices()
        .rev()
        .find(|(_, c)| !matches!(c, 'a'..='z' | 'A'..='Z' | '-'))
        .map_or(0, |(index, c)| index + c.len_utf8());
    let end = text[offset.min(text.len())..]
        .find(|c: char| !matches!(c, 'a'..='z' | 'A'..='Z' | '-'))
        .map_or(text.len(), |index| offset + index);
    text.get(start..end).filter(|word| !word.is_empty())
}

fn property_item(property: &str) -> CompletionItem {
    CompletionItem {
        label: property.to_string(),
        kind: Some(CompletionItemKind::PROPERTY),
        documentation: Some(Documentation::MarkupContent(MarkupContent {
            kind: MarkupKind::Markdown,
            value: format!("`{property}` CSS property"),
        })),
        ..CompletionItem::default()
    }
}

fn values(prefix: &str) -> Vec<CompletionItem> {
    [
        "auto",
        "block",
        "contents",
        "flex",
        "grid",
        "inherit",
        "initial",
        "none",
        "revert",
        "transparent",
        "unset",
    ]
    .into_iter()
    .filter(|value| value.starts_with(prefix))
    .map(|value| CompletionItem {
        label: value.to_string(),
        kind: Some(CompletionItemKind::VALUE),
        ..CompletionItem::default()
    })
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn labels(text: &str) -> Vec<String> {
        completions(text, text.len())
            .unwrap()
            .items
            .into_iter()
            .map(|item| item.label)
            .collect()
    }

    #[test]
    fn completes_properties_in_style_blocks_and_static_attributes() {
        assert!(labels("<style>a { colo").contains(&"color".to_string()));
        assert!(labels("<div style=\"colo").contains(&"color".to_string()));
    }

    #[test]
    fn completes_common_values_and_hovers_properties() {
        assert!(labels("<style>a { display: fl").contains(&"flex".to_string()));
        assert_eq!(
            hover("<style>a { color: red }</style>", 13).as_deref(),
            Some("`color` CSS property")
        );
    }

    #[test]
    fn reports_hex_colours_only_in_css() {
        let colors =
            colors("<script>const x = '#ffffff'</script><style>a { color: #123456 }</style>");
        assert_eq!(colors.len(), 1);
        assert_eq!(color_presentations(colors[0].color)[0].label, "#123456");
    }

    #[test]
    fn completes_template_classes_and_ids_in_selectors() {
        assert!(
            labels("<div class=\"button primary\" id=\"main\"></div><style>.but")
                .contains(&".button".to_string())
        );
        assert!(
            labels("<div class=\"button\" id=\"main\"></div><style>#ma")
                .contains(&"#main".to_string())
        );
    }

    #[test]
    fn completes_and_documents_global_selectors() {
        let items = labels("<style>:glo");
        assert!(items.contains(&":global".to_string()));
        assert!(
            hover("<style>:global(.external) {}</style>", 14)
                .unwrap()
                .contains("prevents")
        );
    }

    #[test]
    fn reports_unknown_css_properties() {
        let diagnostics = diagnostics("<style>a { colro: red; --theme: blue }</style>");
        assert_eq!(diagnostics.len(), 1);
        assert_eq!(
            diagnostics[0].code,
            Some(NumberOrString::String("css_unknown_property".to_string()))
        );
    }
}
