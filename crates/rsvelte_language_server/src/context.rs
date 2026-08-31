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
///
/// The two are kept apart because only a `<style>` body is CSS: a script offset
/// that reaches the CSS provider is answered from the CSS property table.
pub struct EmbeddedRegions {
    scripts: Vec<Range<usize>>,
    styles: Vec<StyleRegion>,
}

/// A `<style>` body and the language it declares.
pub struct StyleRegion {
    pub body: Range<usize>,
    /// `getLangAttribute` (`lib/documents/utils.ts:464-476`): the `lang`
    /// attribute, else `type`, with any `text/` prefix removed.
    pub language: Option<Box<str>>,
}

impl EmbeddedRegions {
    #[must_use]
    pub fn new(text: &str) -> Self {
        parsed(text).unwrap_or_else(|| scanned(text))
    }

    #[must_use]
    pub fn contains(&self, offset: usize) -> bool {
        self.scripts.iter().any(|body| body.contains(&offset))
            || self.styles.iter().any(|style| style.body.contains(&offset))
    }

    #[must_use]
    pub fn in_script(&self, offset: usize) -> bool {
        self.scripts.iter().any(|body| body.contains(&offset))
    }

    #[must_use]
    pub fn in_style(&self, offset: usize) -> bool {
        self.style_at(offset).is_some()
    }

    /// The `<style>` whose body holds `offset`, for the callers that need the
    /// language as well as the position.
    #[must_use]
    pub fn style_at(&self, offset: usize) -> Option<&StyleRegion> {
        self.styles
            .iter()
            .find(|style| style.body.contains(&offset))
    }
}

/// The language a `<style …>` open tag declares, as `getLangAttribute` reads it.
fn style_language(open_tag: &str) -> Option<Box<str>> {
    for name in ["lang", "type"] {
        if let Some(value) = attribute_value(open_tag, name) {
            let value = value.trim().to_ascii_lowercase();
            let value = value.strip_prefix("text/").unwrap_or(&value).to_string();
            if !value.is_empty() {
                return Some(value.into_boxed_str());
            }
        }
    }
    None
}

fn attribute_value<'a>(open_tag: &'a str, name: &str) -> Option<&'a str> {
    let mut rest = open_tag;
    while let Some(index) = rest.find(name) {
        let before = rest[..index].chars().next_back();
        let after = &rest[index + name.len()..];
        rest = after;
        if before.is_some_and(|character| !character.is_whitespace()) {
            continue;
        }
        let after = after.trim_start();
        let Some(after) = after.strip_prefix('=') else {
            continue;
        };
        let after = after.trim_start();
        let quote = after.chars().next()?;
        if quote == '"' || quote == '\'' {
            return after[1..].split(quote).next();
        }
        return Some(
            after
                .split([' ', '\t', '\n', '>', '/'])
                .next()
                .unwrap_or(after),
        );
    }
    None
}

/// The bodies as the compiler sees them, or `None` when it rejects the source.
fn parsed(text: &str) -> Option<EmbeddedRegions> {
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
    let styles = root.css.as_deref().map_or_else(Vec::new, |css| {
        let body = css.content.start as usize..css.content.end as usize;
        let open_tag = text.get(css.start as usize..body.start).unwrap_or("");
        vec![StyleRegion {
            language: style_language(open_tag),
            body,
        }]
    });
    Some(EmbeddedRegions {
        scripts: scripts.collect(),
        styles,
    })
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
fn scanned(text: &str) -> EmbeddedRegions {
    let mut regions = EmbeddedRegions {
        scripts: Vec::new(),
        styles: Vec::new(),
    };
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
        if tag == "style" {
            regions.styles.push(StyleRegion {
                language: style_language(&text[start..open]),
                body: open..close,
            });
        } else {
            regions.scripts.push(open..close);
        }
        offset = close.max(open);
    }
    regions
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

/// The unfinished attribute word at a cursor in an opening tag.
pub struct AttributePrefixContext<'a> {
    pub prefix: &'a str,
    pub element_tag: &'a str,
}

#[must_use]
pub fn attribute_prefix_context(text: &str, offset: usize) -> Option<AttributePrefixContext<'_>> {
    let before = text.get(..offset)?;
    let open = before.rfind('<')?;
    let start = before.get(open + 1..)?;
    if start.starts_with(['/', '!', '?']) || start.contains('>') {
        return None;
    }
    let tag_end = start
        .find(|c: char| c.is_ascii_whitespace() || c == '/')
        .unwrap_or(start.len());
    let element_tag = &start[..tag_end];
    if element_tag.is_empty() || !element_tag.as_bytes().first()?.is_ascii_alphabetic() {
        return None;
    }
    let tail = &start[tag_end..];
    if tail.contains('=') || tail.ends_with(['"', '\'', '}']) {
        return None;
    }
    let prefix = tail.rsplit(char::is_whitespace).next().unwrap_or("");
    (!prefix.contains(['<', '>', '/', '|'])).then_some(AttributePrefixContext {
        prefix,
        element_tag,
    })
}

impl AttributeContext<'_> {
    /// Whether the tag carrying this attribute is a component rather than an
    /// element.
    #[must_use]
    pub fn on_a_component(&self) -> bool {
        possibly_component(self.element_tag)
    }

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

/// `possiblyComponent` (`lib/documents/utils.ts:317-322`): ASCII `A`-`Z` only.
/// Deliberately not [`is_component_tag`] — upstream asks this question with two
/// different rules and the two callers must keep answering it their own way.
#[must_use]
pub fn possibly_component(tag: &str) -> bool {
    tag.starts_with(|c: char| c.is_ascii_uppercase())
}

enum Step<'a> {
    Found(AttributeContext<'a>),
    /// The start tag ended before the offset; resume the outer scan here.
    Resume(usize),
    /// The offset is inside this start tag but not inside an attribute.
    Bare,
}

/// Where in a start tag an offset sits.
pub enum StartTag<'a> {
    /// Inside one of the tag's attributes.
    Attribute(AttributeContext<'a>),
    /// Inside the tag's own name.
    TagName { element_tag: &'a str },
    /// Inside the tag but between its parts — whitespace, or a `{…}` spread.
    Bare { element_tag: &'a str },
    /// Not inside any start tag.
    None,
}

/// `getNodeIfIsInComponentStartTag` (`lib/documents/utils.ts:342-356`): a first
/// character with no lowercase form, or — this server is always Svelte 5 — a
/// dotted name. Wider than `possibly_component`, which upstream spells with a
/// separate helper.
#[must_use]
pub fn is_component_tag(tag: &str) -> bool {
    tag.chars()
        .next()
        .is_some_and(|character| !character.is_lowercase())
        || tag.contains('.')
}

/// The attribute at `offset`, if the offset is inside an element's start tag.
#[must_use]
pub fn attribute_context(text: &str, offset: usize) -> Option<AttributeContext<'_>> {
    match start_tag_context(text, offset) {
        StartTag::Attribute(context) => Some(context),
        StartTag::TagName { .. } | StartTag::Bare { .. } | StartTag::None => None,
    }
}

/// The start tag holding `offset`, and where inside it the offset sits.
#[must_use]
pub fn start_tag_context(text: &str, offset: usize) -> StartTag<'_> {
    let bytes = text.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] != b'<' {
            i += 1;
            continue;
        }
        if i > offset {
            return StartTag::None;
        }
        if text[i..].starts_with("<!--") {
            i = text[i + 4..]
                .find("-->")
                .map_or(bytes.len(), |e| i + 4 + e + 3);
            continue;
        }
        let Some(&next) = bytes.get(i + 1) else {
            return StartTag::None;
        };
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
        let element_tag = &text[name_start..name_end];
        if offset <= name_end {
            return StartTag::TagName { element_tag };
        }
        match scan_start_tag(text, name_end, offset, element_tag) {
            Step::Found(context) => return StartTag::Attribute(context),
            Step::Resume(next) => i = next,
            Step::Bare => return StartTag::Bare { element_tag },
        }
    }
    StartTag::None
}

/// Walk the attributes of a start tag whose name ends at `from`.
fn scan_start_tag<'a>(text: &'a str, from: usize, offset: usize, tag: &'a str) -> Step<'a> {
    let bytes = text.as_bytes();
    let mut i = from;
    loop {
        while bytes.get(i).is_some_and(u8::is_ascii_whitespace) {
            i += 1;
        }
        if i >= bytes.len() || i > offset {
            return Step::Bare;
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

/// The `<script>` body upstream falls back to when svelte2tsx rejects a
/// document: `Document.scriptInfo || Document.moduleScriptInfo`
/// (`DocumentSnapshot.ts:289-291`), where the instance script is the one whose
/// open tag declares neither `context="module"` nor a bare `module`
/// (`lib/documents/utils.ts:156-160`).
#[must_use]
pub fn fallback_script_body(text: &str) -> Option<Range<usize>> {
    let mut module = None;
    let mut offset = 0;
    while offset < text.len() {
        let Some(start) = find_opening_tag(&text[offset..], "script").map(|idx| offset + idx)
        else {
            break;
        };
        let Some(open) = text[start..].find('>').map(|idx| start + idx + 1) else {
            break;
        };
        let close = text[open..]
            .find("</script")
            .map_or(text.len(), |idx| open + idx);
        let open_tag = &text[start..open];
        let is_module = attribute_value(open_tag, "context").map(str::trim) == Some("module")
            || has_attribute(open_tag, "module");
        if is_module {
            module.get_or_insert(open..close);
        } else {
            return Some(open..close);
        }
        offset = close.max(open);
    }
    module
}

/// Whether an open tag carries `name` at all, valued or bare — `'module' in
/// s.attributes` is true for `<script module>`.
fn has_attribute(open_tag: &str, name: &str) -> bool {
    let mut rest = open_tag;
    let mut base = 0;
    while let Some(index) = rest.find(name) {
        let start = base + index;
        let before = open_tag[..start].chars().next_back();
        let after = open_tag[start + name.len()..].chars().next();
        if before.is_some_and(char::is_whitespace)
            && !after.is_some_and(|c| c.is_alphanumeric() || c == '-')
        {
            return true;
        }
        base = start + name.len();
        rest = &open_tag[base..];
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    fn regions(text: &str) -> EmbeddedRegions {
        EmbeddedRegions::new(text)
    }

    fn located(text: &str, needle: &str) -> String {
        let offset = text.find(needle).unwrap() + needle.len();
        match start_tag_context(text, offset) {
            StartTag::Attribute(attribute) => format!(
                "{}/{}{}",
                attribute.element_tag,
                attribute.name,
                if attribute.in_value { "=value" } else { "" }
            ),
            StartTag::TagName { element_tag } => format!("{element_tag}/name"),
            StartTag::Bare { element_tag } => format!("{element_tag}/bare"),
            StartTag::None => "none".to_string(),
        }
    }

    #[test]
    fn a_start_tag_locates_its_parts() {
        let text = "<div class=\"a b\" hidden>text</div>";
        assert_eq!(located(text, "<di"), "div/name");
        assert_eq!(located(text, "cla"), "div/class");
        assert_eq!(located(text, "\"a "), "div/class=value");
        assert_eq!(located(text, "hid"), "div/hidden");
        assert_eq!(located(text, ">te"), "none");
    }

    #[test]
    fn a_dotted_component_name_is_one_name_and_whitespace_is_not_part_of_it() {
        // A `.` is a tag-name byte, so the cursor inside `Root` is still in
        // the name and not in an attribute of a tag called `RadioGroup`.
        let text = "<RadioGroup.Root class=\"a\"  disabled>x</RadioGroup.Root>";
        assert_eq!(located(text, "<RadioGroup.Ro"), "RadioGroup.Root/name");
        // Whitespace with the next attribute still ahead of the cursor.
        assert_eq!(located(text, "class=\"a\" "), "RadioGroup.Root/bare");
        // An attribute name that follows a value — the position that used to
        // fall through to raw template text once the tag carried an `=`.
        assert_eq!(located(text, "disab"), "RadioGroup.Root/disabled");
    }

    #[test]
    fn an_embedded_block_is_located_by_its_own_tag_name() {
        let text = "<script lang=\"ts\">\n  let a = 1;\n</script>";
        assert_eq!(located(text, "<scr"), "script/name");
        assert_eq!(located(text, "lan"), "script/lang");
        assert_eq!(located(text, "\"t"), "script/lang=value");
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
        assert!(!scanned(text).contains(11));
    }

    #[test]
    fn only_a_style_body_is_css() {
        let text = "<script>const types = 1</script>\n<style>h1{color:blue}</style>";
        let regions = regions(text);
        assert!(parsed(text).is_some(), "the fixture should parse");
        let script = text.find("types").unwrap();
        let style = text.find("color").unwrap();
        assert!(regions.in_script(script) && !regions.in_style(script));
        assert!(regions.in_style(style) && !regions.in_script(style));
    }

    #[test]
    fn only_a_style_body_is_css_without_the_parser() {
        let text = "<script lang=\"ts\">let types: {</script><style>h1{color:blue}</style><p>{#";
        assert!(parsed(text).is_none(), "the fixture should not parse");
        let regions = regions(text);
        let script = text.find("types").unwrap();
        let style = text.find("color").unwrap();
        assert!(regions.in_script(script) && !regions.in_style(script));
        assert!(regions.in_style(style) && !regions.in_script(style));
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
    fn a_style_tag_reports_its_language() {
        let language = |text: &str| {
            EmbeddedRegions::new(text)
                .styles
                .first()
                .and_then(|style| style.language.clone())
                .map(String::from)
        };
        assert_eq!(language("<style></style>"), None);
        assert_eq!(
            language("<style lang=\"scss\"></style>"),
            Some("scss".into())
        );
        assert_eq!(language("<style lang='less'></style>"), Some("less".into()));
        assert_eq!(
            language("<style type=\"text/stylus\"></style>"),
            Some("stylus".into())
        );
        // `lang` wins over `type`, and a name a longer one merely contains does
        // not answer for it.
        assert_eq!(
            language("<style data-lang=\"x\" lang=\"sass\"></style>"),
            Some("sass".into())
        );
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
