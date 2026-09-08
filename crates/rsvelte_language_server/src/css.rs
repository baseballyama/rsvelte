//! Native CSS assistance for Svelte style blocks and static style attributes.

use lsp_types::{
    Color, ColorInformation, ColorPresentation, CompletionItem, CompletionItemKind, CompletionList,
    Diagnostic, DiagnosticSeverity, Documentation, MarkupContent, MarkupKind, NumberOrString,
    Range,
};

use rsvelte_lint::rules::data::known_css_properties::KNOWN_CSS_PROPERTIES;

use crate::css_data::{documentation, web};
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
        for (property_start, property) in unknown_properties(&text[start..end]) {
            let property_start = start + property_start;
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

/// Every unknown property name in a `<style>` body, as `(offset, name)`.
///
/// `vscode-css-languageservice` asks a parsed stylesheet (`lint.js:355,369`
/// consult `decl.getProperty()`), so a declaration is what sits between two
/// declaration boundaries *inside a block* — never a selector, and never only
/// the first one on a line.
fn unknown_properties(body: &str) -> Vec<(usize, &str)> {
    let mut found = Vec::new();
    for_each_declaration_chunk(body, |start, end, depth| {
        push_declaration(body, start, end, depth, &mut found);
    });
    found
}

/// Every `;`/`{`/`}`-delimited chunk of a style body, with its brace depth and
/// with comments and quoted strings skipped. The selector text before a `{` is
/// never a chunk, so nothing here reports one.
fn for_each_declaration_chunk(body: &str, mut visit: impl FnMut(usize, usize, usize)) {
    let bytes = body.as_bytes();
    let mut depth = 0usize;
    let mut chunk_start = 0usize;
    let mut i = 0usize;
    while i < bytes.len() {
        match bytes[i] {
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i = body[i + 2..]
                    .find("*/")
                    .map_or(bytes.len(), |at| i + 2 + at + 2);
                continue;
            }
            quote @ (b'"' | b'\'') => {
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    i += if bytes[i] == b'\\' { 2 } else { 1 };
                }
                i += 1;
                continue;
            }
            b'{' => {
                depth += 1;
                chunk_start = i + 1;
            }
            b'}' => {
                if depth > 0 {
                    visit(chunk_start, i, depth);
                }
                depth = depth.saturating_sub(1);
                chunk_start = i + 1;
            }
            b';' => {
                visit(chunk_start, i, depth);
                chunk_start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    // An unterminated final declaration is still one the user is typing.
    visit(chunk_start, bytes.len(), depth);
}

/// The declaration containing `offset`: its property name, and the span
/// `CSSHover.doHover` reports as the hover range.
///
/// That range is the whole `Declaration` node, so the colon, the value and a
/// trailing `!important` all answer with the property's own description, and a
/// value spanning lines keeps its last line inside the range. `getNodeAtOffset`
/// is inclusive at both ends.
fn declaration_at(
    body: &str,
    offset: usize,
    base_depth: usize,
) -> Option<(&str, std::ops::Range<usize>)> {
    let mut hit = None;
    for_each_declaration_chunk(body, |start, end, depth| {
        if depth + base_depth == 0 || start >= end || hit.is_some() {
            return;
        }
        let chunk = &body[start..end];
        let span = start + (chunk.len() - chunk.trim_start().len())..start + chunk.trim_end().len();
        if !(span.start..=span.end).contains(&offset) {
            return;
        }
        // `Property.getName` trims a trailing `_` or `+` (a less merge), and
        // `CSSDataManager.getProperty` is an exact, case-sensitive lookup.
        let Some(colon) = chunk.find(':') else {
            return;
        };
        let name = chunk[..colon].trim().trim_end_matches(['_', '+']);
        if !name.is_empty() {
            hit = Some((name, span));
        }
    });
    hit
}

fn push_declaration<'a>(
    body: &'a str,
    start: usize,
    end: usize,
    depth: usize,
    found: &mut Vec<(usize, &'a str)>,
) {
    if depth == 0 || start >= end {
        return;
    }
    let chunk = &body[start..end];
    let Some(colon) = chunk.find(':') else {
        return;
    };
    let name = chunk[..colon].trim();
    if name.is_empty()
        || name.starts_with("--")
        || !name
            .bytes()
            .all(|byte| byte.is_ascii_alphabetic() || byte == b'-')
        || KNOWN_CSS_PROPERTIES.contains(&name)
    {
        return;
    }
    let offset = start + (name.as_ptr() as usize - chunk.as_ptr() as usize);
    found.push((offset, name));
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

/// The hovered text and the span it covers, in `text`'s own byte offsets.
///
/// A port of the `Declaration` arm of `CSSHover.doHover`
/// (`services/cssHover.js`), which looks the property up with
/// `CSSDataManager.getProperty` and renders it with `getEntryDescription`.
/// The `Selector` and `SimpleSelector` arms — which is where a pseudo-class, a
/// pseudo-element and `:global()` are answered, since `Selector` breaks the
/// top-down walk before those arms are reached — are not ported.
/// What a CSS hover answers with. Official sends a selector as a
/// `MarkedString[]` and a declaration as a `MarkupContent`
/// (`CSSPlugin.doHoverInternal` passes the `Hover` through untouched), so the
/// two cannot share one string.
pub enum Answer {
    /// A declaration's documentation, rendered by the caller's `markdown` flag.
    Markup(String),
    /// A selector's element tree and its specificity line.
    Marked { tree: String, specificity: String },
}

#[must_use]
pub fn hover(
    text: &str,
    offset: usize,
    markdown: bool,
) -> Option<(Answer, std::ops::Range<usize>)> {
    // `doHover` walks the node path outermost-first and breaks at `Selector`,
    // so a pseudo-class, a pseudo-element and `:global()` are all answered
    // here rather than by the declaration arm below.
    if let Some((tree, specificity, span)) = selector_answer(text, offset) {
        return Some((Answer::Marked { tree, specificity }, span));
    }
    let (body, base_depth) = hovered_css_region(text, offset)?;
    let (name, span) = declaration_at(&text[body.clone()], offset - body.start, base_depth)?;
    let property = web::PROPERTIES.iter().find(|entry| entry.name == name)?;
    let value = documentation::documentation(&property.into(), markdown)?;
    Some((
        Answer::Markup(value),
        body.start + span.start..body.start + span.end,
    ))
}

/// The `<style …>…</style>` element and the offset it starts at, so a node span
/// parsed out of the slice can be reported against the document.
fn style_element_at(text: &str) -> Option<(&str, usize)> {
    let open = text.find("<style")?;
    let end = text[open..].find("</style").and_then(|at| {
        text[open + at..]
            .find('>')
            .map(|close| open + at + close + 1)
    })?;
    Some((&text[open..end], open))
}

/// The innermost `ComplexSelector` covering `offset`, as an element tree and a
/// specificity line.
fn selector_answer(text: &str, offset: usize) -> Option<(String, String, std::ops::Range<usize>)> {
    let (style, base) = style_element_at(text)?;
    let local = offset.checked_sub(base)?;
    let allocator = rsvelte_core::Allocator::default();
    let options = rsvelte_core::ParseOptions {
        skip_expression_loc: true,
        lenient_script: true,
        ..rsvelte_core::ParseOptions::default()
    };
    let root = rsvelte_core::parse(style, &allocator, options).ok()?;
    let css = root.css.as_deref()?;
    let mut found: Option<(&serde_json::Value, u64, u64)> = None;
    for child in &css.children {
        collect_complex_selectors(child, local, &mut found);
    }
    let (node, start, end) = found?;
    let (tree, specificity) = crate::css_selector::selector_marked_strings(node);
    Some((
        tree,
        specificity,
        base + usize::try_from(start).ok()?..base + usize::try_from(end).ok()?,
    ))
}

/// Keeps the tightest covering selector, which is the one a nested rule wants.
fn collect_complex_selectors<'a>(
    node: &'a serde_json::Value,
    offset: usize,
    found: &mut Option<(&'a serde_json::Value, u64, u64)>,
) {
    if node.get("type").and_then(serde_json::Value::as_str) == Some("ComplexSelector")
        && let Some(start) = node.get("start").and_then(serde_json::Value::as_u64)
        && let Some(end) = node.get("end").and_then(serde_json::Value::as_u64)
        && (start..=end).contains(&(offset as u64))
        && found.is_none_or(|(_, s, e)| end - start < e - s)
    {
        *found = Some((node, start, end));
    }
    match node {
        serde_json::Value::Array(children) => {
            for child in children {
                collect_complex_selectors(child, offset, found);
            }
        }
        serde_json::Value::Object(fields) => {
            for value in fields.values() {
                collect_complex_selectors(value, offset, found);
            }
        }
        _ => {}
    }
}

/// The CSS region `offset` sits in, and the brace depth its declarations
/// start at — a `style="…"` value is a declaration list with no enclosing
/// braces, where a `<style>` body's declarations sit one level in.
fn hovered_css_region(text: &str, offset: usize) -> Option<(std::ops::Range<usize>, usize)> {
    if let Some(body) = style_body_range(text, offset) {
        return Some((body, 0));
    }
    let before = text.get(..offset.min(text.len()))?;
    let (start, quote) = ["style=\"", "style='"]
        .iter()
        .filter_map(|needle| before.rfind(needle).map(|at| (at + needle.len(), needle)))
        .max_by_key(|(at, _)| *at)
        .map(|(at, needle)| (at, needle.as_bytes()[needle.len() - 1] as char))?;
    if before[start..].contains(quote) {
        return None;
    }
    let end = text[start..]
        .find(quote)
        .map_or(text.len(), |at| start + at);
    // `inStyleAttributeWithoutInterpolation` (`CSSPlugin.ts:256-265`) drops the
    // WHOLE attribute when its value holds a `{`, not just the interpolation.
    // The chunk scanner would already decline a declaration that a `{` follows,
    // but not one written before it.
    if text[start..end].contains('{') {
        return None;
    }
    Some((start..end, 1))
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

/// `getIdClassCompletion.ts`: a `class=` / `id=` value, and the name after
/// `class:`, are completed from the selectors the component's own `<style>`
/// declares. Upstream neither deduplicates nor filters by what has been typed,
/// and labels the selector without its `.` or `#`.
#[must_use]
pub fn id_class_completions(text: &str, node_type: &str) -> CompletionList {
    // Upstream reads `document.stylesheet`, which is parsed from the extracted
    // style region alone — a completion is asked for while the markup around it
    // is half-typed, so parsing the whole component would answer nothing.
    let style = style_element(text).unwrap_or("");
    let allocator = rsvelte_core::Allocator::default();
    // `defer_script_parse` would also defer the CSS rules, and the rules are
    // exactly what is being collected here.
    let options = rsvelte_core::ParseOptions {
        skip_expression_loc: true,
        lenient_script: true,
        ..rsvelte_core::ParseOptions::default()
    };
    let mut items = Vec::new();
    if let Ok(root) = rsvelte_core::parse(style, &allocator, options)
        && let Some(css) = root.css.as_deref()
    {
        for child in &css.children {
            collect_selectors(child, node_type, &mut items);
        }
    }
    CompletionList {
        is_incomplete: false,
        items,
    }
}

/// The whole `<style …>…</style>` element, which on its own is a valid
/// component however broken the markup it was lifted out of is.
fn style_element(text: &str) -> Option<&str> {
    let open = text.find("<style")?;
    let end = text[open..].find("</style").and_then(|at| {
        text[open + at..]
            .find('>')
            .map(|close| open + at + close + 1)
    })?;
    Some(&text[open..end])
}

fn collect_selectors(node: &serde_json::Value, node_type: &str, items: &mut Vec<CompletionItem>) {
    if node.get("type").and_then(serde_json::Value::as_str) == Some(node_type)
        && let Some(name) = node.get("name").and_then(serde_json::Value::as_str)
    {
        items.push(CompletionItem {
            label: name.to_string(),
            kind: Some(CompletionItemKind::KEYWORD),
            ..CompletionItem::default()
        });
    }
    match node {
        serde_json::Value::Array(children) => {
            for child in children {
                collect_selectors(child, node_type, items);
            }
        }
        serde_json::Value::Object(fields) => {
            for value in fields.values() {
                collect_selectors(value, node_type, items);
            }
        }
        _ => {}
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
    use lsp_types::Position;

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

    /// The markup a declaration hover answers with. A selector answers with
    /// marked strings instead, so unwrapping here is the assertion that this
    /// offset took the declaration arm.
    fn markup_of(answer: Answer) -> String {
        match answer {
            Answer::Markup(value) => value,
            Answer::Marked { tree, .. } => {
                panic!("expected a declaration hover, got a selector tree: {tree}")
            }
        }
    }

    #[test]
    fn completes_common_values_and_hovers_properties() {
        assert!(labels("<style>a { display: fl").contains(&"flex".to_string()));
        let source = "<style>a { color: red }</style>";
        let (answer, span) = hover(source, 13, true).expect("a known property hovers");
        let value = markup_of(answer);
        assert!(
            value.starts_with("Sets the color of an element's text"),
            "{value}"
        );
        assert!(
            value.contains("[MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color)"),
            "{value}"
        );
        assert_eq!(&source[span], "color: red");
    }

    /// `CSSHover.doHover` ranges a property hover over the whole `Declaration`,
    /// so every offset inside one answers, with one range. Measured against the
    /// official server on `\t\topacity: 0.5;`, which reports `4:2-4:14`.
    #[test]
    fn a_declaration_answers_from_its_name_its_colon_and_its_value() {
        let source = "<style>a { opacity: 0.5 }</style>";
        for offset in [11, 18, 21] {
            let (_, span) = hover(source, offset, true).expect("inside the declaration");
            assert_eq!(&source[span], "opacity: 0.5", "at {offset}");
        }
    }

    /// `!important` is inside the `Declaration` node, and a value spanning
    /// lines keeps its last line in the range.
    #[test]
    fn a_declaration_range_covers_important_and_a_multi_line_value() {
        let source = "<style>a { color: red !important; margin:\n\t1px\n\t2px; }</style>";
        let (_, span) = hover(source, 13, true).expect("the important declaration");
        assert_eq!(&source[span], "color: red !important");
        let at = source.find("margin").unwrap();
        let (_, span) = hover(source, at + 1, true).expect("the multi-line declaration");
        assert_eq!(&source[span], "margin:\n\t1px\n\t2px");
    }

    /// `CSSDataManager.getProperty` is an exact map lookup, so a case that does
    /// not match and a property the data does not carry both answer nothing.
    /// Each was measured against the official server, which returns `null`;
    /// `-webkit-box-align` is the live control that the miss is the name and
    /// not the vendor prefix.
    #[test]
    fn an_unknown_or_miscased_property_answers_nothing() {
        for source in [
            "<style>a { notaproperty: 1px }</style>",
            "<style>a { --custom-thing: 2px }</style>",
            "<style>a { OPACITY: 0.5 }</style>",
            "<style>a { -webkit-box-shadow: 0 0 0 red }</style>",
        ] {
            let offset = source.find("{ ").unwrap() + 3;
            assert!(hover(source, offset, true).is_none(), "{source}");
        }
        let source = "<style>a { -webkit-box-align: end }</style>";
        assert!(hover(source, 14, true).is_some(), "{source}");
    }

    /// `Property.getName` trims a trailing `_` or `+` (a less merge) before the
    /// lookup, and the range still covers the name the source wrote. Official
    /// answers `color` for `color_: red` over `23:2-23:13`.
    #[test]
    fn a_less_merge_suffix_is_trimmed_from_the_name_and_kept_in_the_range() {
        let source = "<style>a { color_: red }</style>";
        let (answer, span) = hover(source, 13, true).expect("the merged property");
        let value = markup_of(answer);
        assert!(
            value.starts_with("Sets the color of an element's text"),
            "{value}"
        );
        assert_eq!(&source[span], "color_: red");
    }

    /// A `style="…"` value is a declaration list with no braces around it, so
    /// its declarations sit at depth 0 and would otherwise be skipped. Official
    /// hovers it and ranges the declaration.
    #[test]
    fn a_static_style_attribute_hovers_its_declaration() {
        let source = "<div style=\"opacity: 0.5\"></div>";
        let (_, span) = hover(source, 14, true).expect("inside the attribute value");
        assert_eq!(&source[span], "opacity: 0.5");
    }

    /// A `{` anywhere in the value drops the whole attribute, so a declaration
    /// written before the interpolation answers nothing either — which is what
    /// separates the ported rule from a scanner that merely declines to emit a
    /// chunk the brace opens a block in.
    #[test]
    fn a_style_attribute_holding_an_interpolation_answers_nothing() {
        for source in [
            "<div style=\"height: {}\"></div>",
            "<div style=\"height: auto; color: {x}\"></div>",
        ] {
            let offset = source.find("style=\"").unwrap() + 8;
            assert!(hover(source, offset, true).is_none(), "{source}");
        }
    }

    /// The `Selector` arm of `CSSHover.doHover`, which is what official uses for
    /// a plain selector, a pseudo-class and a pseudo-element. Every expected
    /// value was generated by driving `vscode-css-languageservice@6.3.5` and
    /// printing the raw `contents` — the `language: "html"` field of a
    /// MarkedString is metadata, and reads as an `<html>` element if the value
    /// is taken through a stringification instead.
    #[test]
    fn a_selector_answers_with_its_element_tree_and_specificity() {
        for (source, offset, tree, spec, range) in [
            (
                "<style>.box span { color: red }</style>",
                9,
                "<element class=\"box\">\n  \u{2026}\n    <span>",
                "(0, 1, 1)",
                ".box span",
            ),
            (
                "<style>a:hover { color: red }</style>",
                10,
                "<a :hover>",
                "(0, 1, 1)",
                "a:hover",
            ),
            (
                "<style>p::before { content: \"\" }</style>",
                11,
                "<p ::before>",
                "(0, 0, 2)",
                "p::before",
            ),
        ] {
            let (answer, span) = hover(source, offset, true).expect("a selector answers");
            let Answer::Marked {
                tree: got,
                specificity,
            } = answer
            else {
                panic!("a selector answers with marked strings: {source} @{offset}");
            };
            assert_eq!(got, tree, "{source} @{offset}");
            assert!(specificity.ends_with(&format!(": {spec}")), "{specificity}");
            assert_eq!(&source[span], range, "{source} @{offset}");
        }
    }

    /// An at-rule prelude is not a selector, and official answers nothing there
    /// — the negative half of the arm above, which a suite of answering cells
    /// alone cannot show.
    #[test]
    fn an_at_rule_prelude_answers_nothing() {
        let source = "<style>@media (min-width: 1px) { i { color: red } }</style>";
        assert!(hover(source, 10, true).is_none(), "{source}");
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
    fn completes_a_class_and_an_id_attribute_from_the_stylesheet() {
        // Upstream returns every matching selector, unfiltered and undeduplicated,
        // labelled without its `.` or `#` — so each half is asserted on its own.
        let source = "<div></div><style>.a{} .b{} .a{} #c{}</style>";
        assert_eq!(
            id_class_completions(source, "ClassSelector")
                .items
                .iter()
                .map(|item| item.label.clone())
                .collect::<Vec<_>>(),
            vec!["a", "b", "a"],
        );
        assert_eq!(
            id_class_completions(source, "IdSelector")
                .items
                .iter()
                .map(|item| item.label.clone())
                .collect::<Vec<_>>(),
            vec!["c"],
        );
    }

    #[test]
    fn completes_a_stylesheet_the_broken_markup_around_it_cannot_be_parsed_with() {
        // The position a completion is asked from — `id=` with no value yet —
        // is itself what stops the component parsing, so a whole-document parse
        // answers nothing here.
        assert_eq!(
            id_class_completions("<div id=></div><style>#abc{}</style>", "IdSelector")
                .items
                .iter()
                .map(|item| item.label.clone())
                .collect::<Vec<_>>(),
            vec!["abc"],
        );
    }

    #[test]
    fn completes_and_documents_global_selectors() {
        let items = labels("<style>:glo");
        assert!(items.contains(&":global".to_string()));
        // Two branches reach this: the cursor at the end of the token, and the
        // cursor inside the word. A cell for only the first passes while the
        // second returns nothing.
        // Official has no `:global` special case in hover at all — it answers
        // like any other pseudo-class, ranged over the whole selector. Values
        // generated by driving `vscode-css-languageservice@6.3.5`, which
        // returns the identical answer at every offset inside the selector,
        // including inside the argument.
        let source = "<style>:global(.external) {}</style>";
        for offset in [14, 11, 8, 7, 25] {
            let (answer, span) = hover(source, offset, true).expect(":global is a selector");
            let Answer::Marked { tree, specificity } = answer else {
                panic!("a selector answers with marked strings, at {offset}");
            };
            assert_eq!(tree, "<element :global>", "at {offset}");
            assert!(
                specificity.ends_with(": (0, 1, 0)"),
                "{specificity} at {offset}"
            );
            assert_eq!(&source[span], ":global(.external)", "at {offset}");
        }
    }

    fn messages(text: &str) -> Vec<String> {
        diagnostics(text)
            .into_iter()
            .map(|diagnostic| diagnostic.message)
            .collect()
    }

    #[test]
    fn reports_unknown_css_properties() {
        let typo = diagnostics("<style>a { colro: red; --theme: blue }</style>");
        assert_eq!(typo.len(), 1);
        assert_eq!(
            typo[0].code,
            Some(NumberOrString::String("css_unknown_property".to_string()))
        );
        assert!(diagnostics("<style>a {\n  --theme: blue;\n}</style>").is_empty());
    }

    #[test]
    fn a_selector_colon_is_not_a_declaration() {
        for selector in [
            "a:hover",
            "input:focus",
            "li:nth-child(2)",
            "::selection",
            "a:hover, b:focus",
        ] {
            assert!(
                messages(&format!("<style>\n{selector} {{ color: red }}\n</style>")).is_empty(),
                "{selector}"
            );
        }
        assert!(
            messages("<style>\n@media (min-width: 700px) {\n  a { color: red }\n}\n</style>")
                .is_empty()
        );
    }

    #[test]
    fn every_declaration_on_a_line_is_read() {
        assert_eq!(
            messages("<style>\na { colro: red; badprop: blue }\n</style>"),
            [
                "Unknown CSS property `colro`.".to_string(),
                "Unknown CSS property `badprop`.".to_string(),
            ]
        );
    }

    #[test]
    fn declaration_range_covers_the_property_name() {
        let text = "<style>\na { colro: red }\n</style>";
        let range = diagnostics(text)[0].range;
        assert_eq!(range.start, Position::new(1, 4));
        assert_eq!(range.end, Position::new(1, 9));
    }

    #[test]
    fn comments_and_strings_are_not_declarations() {
        assert!(messages("<style>\na { /* colro: red */ color: blue }\n</style>").is_empty());
        assert!(messages("<style>\na::before { content: \"badprop: x\" }\n</style>").is_empty());
    }
}
