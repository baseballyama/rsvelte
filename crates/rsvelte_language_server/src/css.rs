//! Native CSS assistance for Svelte style blocks and static style attributes.

use lsp_types::{
    Color, ColorInformation, ColorPresentation, CompletionItem, CompletionItemKind, CompletionList,
    Documentation, MarkupContent, MarkupKind, Range,
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

/// CSS completions at `offset`, when it is in a declaration name or value.
#[must_use]
pub fn completions(text: &str, offset: usize) -> Option<CompletionList> {
    let prefix = css_prefix(text, offset)?;
    let before = text.get(..offset)?;
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
    let before = &text[..offset.min(text.len())];
    let Some(open) = before.rfind("<style") else {
        return false;
    };
    let Some(end) = before[open..].find('>').map(|index| index + open) else {
        return false;
    };
    end < offset && !before[end + 1..].contains("</style")
}

fn static_style_value(text: &str, offset: usize) -> bool {
    let before = &text[..offset.min(text.len())];
    let quote = before
        .rfind("style=\"")
        .map(|i| (i + 7, '"'))
        .or_else(|| before.rfind("style='").map(|i| (i + 7, '\'')));
    quote.is_some_and(|(start, quote)| !before[start..].contains(quote))
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
}
