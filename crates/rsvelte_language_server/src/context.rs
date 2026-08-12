//! Where a position sits in a Svelte document.
//!
//! A document is asked for completions while it is being typed, when it very
//! often does not parse at all, so every answer here has to be reachable from
//! the raw text. The parser is consulted where it can be trusted — it locates
//! `<script>` and `<style>` without being fooled by the same words appearing in
//! a string or a moustache — and a scan takes over the moment it declines.

use std::ops::Range;

use rsvelte_core::{Allocator, ParseOptions, parse};

/// The `<script>` and `<style>` bodies of a document, which Svelte template
/// completions and hovers must stay out of.
pub struct EmbeddedRegions {
    bodies: Vec<Range<usize>>,
}

impl EmbeddedRegions {
    #[must_use]
    pub fn new(text: &str) -> Self {
        let bodies = parsed(text).unwrap_or_else(|| scanned(text));
        Self { bodies }
    }

    #[must_use]
    pub fn contains(&self, offset: usize) -> bool {
        self.bodies.iter().any(|body| body.contains(&offset))
    }
}

/// The bodies as the compiler sees them, or `None` when it rejects the source.
fn parsed(text: &str) -> Option<Vec<Range<usize>>> {
    let allocator = Allocator::default();
    // A document is only ever parsed here to be located, so the script bodies
    // and non-CSS `<style lang>` blocks that would otherwise abort the parse
    // are waved through.
    let options = ParseOptions {
        defer_script_parse: true,
        skip_expression_loc: true,
        lenient_script: true,
        skip_non_css_lang_style: true,
        ..ParseOptions::default()
    };
    let root = parse(text, &allocator, options).ok()?;
    let scripts = [root.instance.as_deref(), root.module.as_deref()]
        .into_iter()
        .flatten()
        .filter_map(|script| body_of(text, script.start as usize, script.end as usize));
    let style = root
        .css
        .as_deref()
        .map(|css| css.content.start as usize..css.content.end as usize);
    Some(scripts.chain(style).collect())
}

/// The content of a `<tag …>…</tag>` spanning `start..end`.
#[must_use]
pub fn body_of(text: &str, start: usize, end: usize) -> Option<Range<usize>> {
    let outer = text.get(start..end)?;
    let open = outer.find('>')? + 1;
    let close = outer.rfind("</").unwrap_or(outer.len());
    (open <= close).then(|| start + open..start + close)
}

/// The bodies located by scanning, for a document the compiler rejected.
fn scanned(text: &str) -> Vec<Range<usize>> {
    let mut bodies = Vec::new();
    let mut offset = 0;
    while offset < text.len() {
        let Some((start, tag)) = ["script", "style"]
            .iter()
            .filter_map(|tag| find_opening_tag(&text[offset..], tag).map(|start| (start, *tag)))
            .min_by_key(|&(start, _)| start)
        else {
            break;
        };
        let start = offset + start;
        let Some(open) = text[start..].find('>').map(|idx| start + idx + 1) else {
            break;
        };
        let close = text[open..]
            .find(&format!("</{tag}"))
            .map_or(text.len(), |idx| open + idx);
        bodies.push(open..close);
        offset = close.max(open);
    }
    bodies
}

/// The offset of the next `<tag` that is followed by a tag-name boundary.
fn find_opening_tag(text: &str, tag: &str) -> Option<usize> {
    let needle = format!("<{tag}");
    let mut offset = 0;
    while let Some(idx) = text[offset..].find(&needle) {
        let start = offset + idx;
        let after = text[start + needle.len()..].chars().next();
        if !after.is_some_and(|c| c.is_alphanumeric() || c == '-') {
            return Some(start);
        }
        offset = start + needle.len();
    }
    None
}

/// The attribute the cursor is in, and the element carrying it.
pub struct AttributeContext<'a> {
    pub name: &'a str,
    /// Offset of `name` in the document.
    pub name_start: usize,
    /// Whether the cursor is in the attribute's value rather than its name.
    pub in_value: bool,
    pub element_tag: &'a str,
}

impl AttributeContext<'_> {
    /// Event modifiers exist on elements only, and only after the `|` that
    /// starts the modifier list.
    #[must_use]
    pub fn can_have_event_modifier(&self) -> bool {
        !self.in_value
            && !possibly_component(self.element_tag)
            && self.name.starts_with("on:")
            && self.name.contains('|')
    }
}

/// A capitalised tag name is a component, not an element.
fn possibly_component(tag: &str) -> bool {
    tag.starts_with(|c: char| c.is_ascii_uppercase())
}

enum Step<'a> {
    Found(AttributeContext<'a>),
    /// The start tag ended before the offset; resume the outer scan here.
    Resume(usize),
    /// The offset is behind us — no attribute holds it.
    Stop,
}

/// The attribute at `offset`, if the offset is inside an element's start tag.
#[must_use]
pub fn attribute_context(text: &str, offset: usize) -> Option<AttributeContext<'_>> {
    let bytes = text.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] != b'<' {
            i += 1;
            continue;
        }
        if i > offset {
            return None;
        }
        if text[i..].starts_with("<!--") {
            i = text[i + 4..]
                .find("-->")
                .map_or(bytes.len(), |e| i + 4 + e + 3);
            continue;
        }
        let &next = bytes.get(i + 1)?;
        if next == b'!' || next == b'/' {
            i = text[i..].find('>').map_or(bytes.len(), |e| i + e + 1);
            continue;
        }
        if !next.is_ascii_alphabetic() {
            i += 1;
            continue;
        }
        let name_start = i + 1;
        let mut name_end = name_start;
        while bytes.get(name_end).is_some_and(|&b| is_tag_name_byte(b)) {
            name_end += 1;
        }
        match scan_start_tag(text, name_end, offset, &text[name_start..name_end]) {
            Step::Found(context) => return Some(context),
            Step::Resume(next) => i = next,
            Step::Stop => return None,
        }
    }
    None
}

/// Walk the attributes of a start tag whose name ends at `from`.
fn scan_start_tag<'a>(text: &'a str, from: usize, offset: usize, tag: &'a str) -> Step<'a> {
    let bytes = text.as_bytes();
    let mut i = from;
    loop {
        while bytes.get(i).is_some_and(u8::is_ascii_whitespace) {
            i += 1;
        }
        if i >= bytes.len() {
            return Step::Stop;
        }
        if i > offset {
            return Step::Stop;
        }
        match bytes[i] {
            b'>' => return Step::Resume(i + 1),
            b'/' if bytes.get(i + 1) == Some(&b'>') => return Step::Resume(i + 2),
            // A spread, a shorthand attribute or an attachment.
            b'{' => {
                i = skip_braces(text, i);
                continue;
            }
            _ => {}
        }
        let start = i;
        while bytes.get(i).is_some_and(|&b| is_attribute_name_byte(b)) {
            i += 1;
        }
        if i == start {
            i += 1;
            continue;
        }
        let name = &text[start..i];
        if (start..=i).contains(&offset) {
            return Step::Found(AttributeContext {
                name,
                name_start: start,
                in_value: false,
                element_tag: tag,
            });
        }
        let mut after = i;
        while bytes.get(after).is_some_and(u8::is_ascii_whitespace) {
            after += 1;
        }
        if bytes.get(after) != Some(&b'=') {
            continue;
        }
        i = after + 1;
        while bytes.get(i).is_some_and(u8::is_ascii_whitespace) {
            i += 1;
        }
        let value = match bytes.get(i) {
            Some(&quote @ (b'"' | b'\'')) => {
                let end = text[i + 1..]
                    .find(quote as char)
                    .map_or(bytes.len(), |e| i + 1 + e);
                let value = i + 1..end;
                i = (end + 1).min(bytes.len());
                value
            }
            Some(b'{') => {
                let end = skip_braces(text, i);
                let value = i..end;
                i = end;
                value
            }
            _ => {
                let start = i;
                while bytes
                    .get(i)
                    .is_some_and(|&b| !b.is_ascii_whitespace() && b != b'>')
                {
                    i += 1;
                }
                start..i
            }
        };
        if value.contains(&offset) || value.end == offset {
            return Step::Found(AttributeContext {
                name,
                name_start: start,
                in_value: true,
                element_tag: tag,
            });
        }
    }
}

/// The offset just past the `{…}` starting at `from`, strings included.
#[must_use]
pub fn skip_braces(text: &str, from: usize) -> usize {
    let bytes = text.as_bytes();
    let mut depth = 0u32;
    let mut i = from;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => depth += 1,
            b'}' => {
                depth = depth.saturating_sub(1);
                if depth == 0 {
                    return i + 1;
                }
            }
            quote @ (b'"' | b'\'' | b'`') => {
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    i += if bytes[i] == b'\\' { 2 } else { 1 };
                }
            }
            _ => {}
        }
        i += 1;
    }
    bytes.len()
}

const fn is_tag_name_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b':' | b'$')
}

/// Everything the HTML spec allows in an attribute name, which is what the
/// official plugin's scanner accepts too.
const fn is_attribute_name_byte(byte: u8) -> bool {
    !byte.is_ascii_whitespace() && !matches!(byte, b'"' | b'\'' | b'<' | b'>' | b'/' | b'=')
}

#[cfg(test)]
mod tests {
    use super::*;

    fn regions(text: &str) -> EmbeddedRegions {
        EmbeddedRegions::new(text)
    }

    #[test]
    fn script_and_style_bodies_are_found_in_a_valid_document() {
        let text = "<script>const a = true</script>\n<style>h1{color:blue}</style>\n<p>x</p>";
        let regions = regions(text);
        assert!(parsed(text).is_some(), "the fixture should parse");
        assert!(regions.contains(text.find("const").unwrap()));
        assert!(regions.contains(text.find("color").unwrap()));
        assert!(!regions.contains(text.find("<p>").unwrap()));
    }

    #[test]
    fn script_and_style_bodies_are_found_without_the_parser() {
        // An unterminated moustache the compiler refuses.
        let text = "<script lang=\"ts\">let a: {</script><style>h1{}</style><p>{#";
        assert!(parsed(text).is_none(), "the fixture should not parse");
        let regions = regions(text);
        assert!(regions.contains(text.find("let a").unwrap()));
        assert!(regions.contains(text.find("h1{}").unwrap()));
        assert!(!regions.contains(text.find("{#").unwrap()));
    }

    #[test]
    fn an_unclosed_script_swallows_the_rest_of_the_document() {
        let text = "<p>a</p><script>const a =";
        let regions = regions(text);
        assert!(!regions.contains(1));
        assert!(regions.contains(text.len() - 1));
    }

    #[test]
    fn a_tag_whose_name_merely_starts_with_script_is_not_one() {
        let text = "<scriptish>{#</scriptish>";
        assert!(!scanned(text).iter().any(|b| b.contains(&11)));
    }

    fn attribute(text: &str, offset: usize) -> Option<AttributeContext<'_>> {
        attribute_context(text, offset)
    }

    #[test]
    fn the_attribute_under_the_cursor_is_reported() {
        let text = "<div on:click| />";
        let context = attribute(text, 14).unwrap();
        assert_eq!(context.name, "on:click|");
        assert_eq!(context.name_start, 5);
        assert_eq!(context.element_tag, "div");
        assert!(!context.in_value);
        assert!(context.can_have_event_modifier());
    }

    #[test]
    fn a_cursor_in_text_content_is_not_in_an_attribute() {
        let text = "<div class=\"a\">hello</div>";
        assert!(attribute(text, 17).is_none());
    }

    #[test]
    fn a_cursor_in_a_value_is_reported_as_such() {
        let text = "<div on:click|preventDefault=\"x\" />";
        let context = attribute(text, 30).unwrap();
        assert!(context.in_value);
        assert!(!context.can_have_event_modifier());
    }

    #[test]
    fn components_cannot_have_event_modifiers() {
        let text = "<Widget on:click| />";
        assert!(!attribute(text, 17).unwrap().can_have_event_modifier());
    }

    #[test]
    fn attributes_of_a_later_element_are_still_found() {
        let text = "<span class=\"a\">t</span><div on:click| />";
        let context = attribute(text, 37).unwrap();
        assert_eq!(context.name, "on:click|");
        assert_eq!(context.element_tag, "div");
    }

    #[test]
    fn a_brace_value_does_not_end_the_tag() {
        let text = "<div style={`a>b`} on:click| />";
        let context = attribute(text, 27).unwrap();
        assert_eq!(context.name, "on:click|");
    }

    #[test]
    fn a_spread_attribute_is_skipped() {
        let text = "<div {...rest} on:click| />";
        assert_eq!(attribute(text, 23).unwrap().name, "on:click|");
    }

    #[test]
    fn a_comment_is_not_an_element() {
        let text = "<!-- <div on:click| --><p>x</p>";
        assert!(attribute(text, 18).is_none());
    }

    #[test]
    fn an_attribute_name_only_needs_a_plain_event_directive_to_be_rejected() {
        let text = "<div on:click />";
        assert!(!attribute(text, 13).unwrap().can_have_event_modifier());
    }
}
