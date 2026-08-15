//! Native HTML/Svelte tag pairing for editor features.
//!
//! This deliberately works on incomplete documents: linked editing is queried
//! while a closing tag is being typed, when the component parser often cannot
//! produce an AST yet.

use std::ops::Range as ByteRange;

use lsp_types::{DocumentHighlight, DocumentHighlightKind, LinkedEditingRanges, Range};

use crate::text::LineIndex;

#[derive(Debug, Clone, PartialEq, Eq)]
struct TagPair {
    open: ByteRange<usize>,
    close: ByteRange<usize>,
}

/// Linked ranges for the opening and closing name under `offset`.
#[must_use]
pub fn linked_ranges(text: &str, offset: usize) -> Option<LinkedEditingRanges> {
    let pair = pair_at(text, offset)?;
    let index = LineIndex::new(text);
    Some(LinkedEditingRanges {
        ranges: vec![
            range(&index, text, pair.open),
            range(&index, text, pair.close),
        ],
        // Dots intentionally do not belong here: VS Code uses this pattern to
        // select the editable word, while `<Foo.Bar>` needs the whole member tag.
        word_pattern: Some("[-_:A-Za-z0-9$]+".to_string()),
    })
}

/// Text highlights for the matched opening and closing tag names.
#[must_use]
pub fn highlights(text: &str, offset: usize) -> Vec<DocumentHighlight> {
    let Some(pair) = pair_at(text, offset) else {
        return Vec::new();
    };
    let index = LineIndex::new(text);
    [pair.open, pair.close]
        .into_iter()
        .map(|span| DocumentHighlight {
            range: range(&index, text, span),
            kind: Some(DocumentHighlightKind::TEXT),
        })
        .collect()
}

/// Completion text for the `html/tag` compatibility request.
#[must_use]
pub fn close_tag(text: &str, offset: usize) -> Option<String> {
    let before = text.get(..offset)?;
    let end = before.strip_suffix('>')?;
    let open = end.rfind('<')?;
    let name = end[open + 1..]
        .split(|character: char| character.is_ascii_whitespace() || character == '/')
        .next()?;
    (!name.is_empty() && !name.starts_with(['/', '!', '?']) && !is_void(name))
        .then(|| format!("</{name}>"))
}

fn range(index: &LineIndex, text: &str, span: ByteRange<usize>) -> Range {
    Range::new(
        index.position(text, span.start),
        index.position(text, span.end),
    )
}

fn pair_at(text: &str, offset: usize) -> Option<TagPair> {
    let mut stack: Vec<(String, ByteRange<usize>)> = Vec::new();
    let bytes = text.as_bytes();
    let mut cursor = 0;

    while cursor < bytes.len() {
        let Some(relative) = text[cursor..].find('<') else {
            break;
        };
        let start = cursor + relative;
        if text[start..].starts_with("<!--") {
            cursor = text[start + 4..]
                .find("-->")
                .map_or(bytes.len(), |end| start + 7 + end);
            continue;
        }
        let mut name_start = start + 1;
        let closing = bytes.get(name_start) == Some(&b'/');
        if closing {
            name_start += 1;
        }
        while bytes.get(name_start).is_some_and(u8::is_ascii_whitespace) {
            name_start += 1;
        }
        let mut name_end = name_start;
        while bytes
            .get(name_end)
            .is_some_and(|byte| is_tag_name_byte(*byte))
        {
            name_end += 1;
        }
        if name_end == name_start {
            cursor = start + 1;
            continue;
        }
        let Some(end) = text[name_end..].find('>').map(|end| name_end + end) else {
            break;
        };
        let span = name_start..name_end;
        let name = &text[span.clone()];
        if closing {
            if let Some(index) = stack.iter().rposition(|(open, _)| open == name) {
                let (_, open) = stack.remove(index);
                if open.contains(&offset) || span.contains(&offset) || offset == span.end {
                    return Some(TagPair { open, close: span });
                }
            }
        } else if !is_void(name) && !text[name_end..end].trim_end().ends_with('/') {
            stack.push((name.to_string(), span));
        }
        cursor = end + 1;
    }
    None
}

const fn is_tag_name_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b':' | b'$')
}

fn is_void(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pairs_component_member_tags_without_including_the_dot_in_word_pattern() {
        let text = "<Foo.Bar><span /></Foo.Bar>";
        let ranges = linked_ranges(text, 3).unwrap();
        assert_eq!(ranges.ranges.len(), 2);
        assert_eq!(ranges.word_pattern.as_deref(), Some("[-_:A-Za-z0-9$]+"));
        assert_eq!(ranges.ranges[0].end.character, 8);
    }

    #[test]
    fn ignores_void_and_comment_tags() {
        assert!(linked_ranges("<!-- <div></div> --><br>", 7).is_none());
        assert!(linked_ranges("<img><div></div>", 2).is_none());
    }

    #[test]
    fn highlights_both_names() {
        assert_eq!(highlights("<section>x</section>", 3).len(), 2);
    }

    #[test]
    fn completes_a_just_opened_tag() {
        assert_eq!(close_tag("<section>", 9).as_deref(), Some("</section>"));
        assert_eq!(close_tag("<img>", 5), None);
    }
}
