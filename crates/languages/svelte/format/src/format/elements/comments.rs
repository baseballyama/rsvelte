//! The JavaScript comments between a tag's attributes. The plugin attaches each to the attribute
//! after it, or to the last one when none follows (`attachAttributeComments`), and Prettier prints
//! them around that attribute (`printComments`).

use rsvelte_kernel::source::tokens::TokenKind;
use rsvelte_svelte_syntax::syntax_tree::Component;

use super::super::{
    Attribute, LayoutInstructionIdentifier, Printer, R, Span, TokenType, Unsupported,
};

/// The comments the plugin attaches to one attribute.
#[derive(Default)]
pub(super) struct Attached {
    leading: Vec<Span>,
    trailing: Vec<Span>,
}

/// What Prettier's `printTrailingComment` returned for the comment before.
#[derive(Clone, Copy)]
struct Previous {
    line_suffix: bool,
    block: bool,
}

fn is_block(text: &str) -> bool {
    text.starts_with("/*")
}

fn without_spaces(s: &str) -> &str {
    s.trim_start_matches([' ', '\t'])
}

/// Prettier's `skipNewline` on the start of `s`.
fn without_newline(s: &str) -> &str {
    ["\r\n", "\n", "\r", "\u{2028}", "\u{2029}"]
        .iter()
        .find_map(|n| s.strip_prefix(n))
        .unwrap_or(s)
}

fn starts_with_newline(s: &str) -> bool {
    without_newline(s).len() != s.len()
}

impl Printer<'_, '_, '_> {
    /// The comments between `attributes` (`this` left out, as Svelte takes it out) of the tag that
    /// starts at `tag`. The comments of a tag without attributes, and those after the last one from
    /// the first that holds a `>` on (the plugin looks for the tag's end with `indexOf('>')`), are
    /// in no attribute: the plugin deletes them, so they are refused.
    pub(super) fn attribute_comments(
        &mut self,
        tag: u32,
        attributes: &[&Attribute],
    ) -> R<Vec<Attached>> {
        let mut attached: Vec<Attached> = attributes.iter().map(|_| Attached::default()).collect();
        let c = self.c;
        let tokens = &c.tokens;
        let comments_from = |offset: u32| {
            tokens
                .from_offset(offset)
                .iter()
                .take_while(|t| {
                    t.kind.is_trivia() || matches!(t.kind, TokenType::TagOpen | TokenType::TagName)
                })
                .filter(|t| t.kind == TokenType::JavaScriptComment)
                .map(|t| t.span)
        };
        let Some(last) = attributes.last() else {
            self.embedder.dropped.extend(comments_from(tag).map(|c| {
                (
                    c,
                    "a comment in a tag without attributes, which the plugin deletes",
                )
            }));
            return Ok(attached);
        };
        let mut start = tag;
        for (i, a) in attributes.iter().enumerate() {
            let before: Vec<Span> = comments_from(start)
                .take_while(|c| c.end_offset <= a.span.start_offset)
                .collect();
            self.embedder.kept.extend(&before);
            attached[i].leading = before;
            start = a.span.end_offset;
        }
        let mut closed = false;
        for comment in comments_from(last.span.end_offset) {
            closed = closed || comment.text(self.source_text).contains('>');
            if closed {
                self.embedder.dropped.push((
                    comment,
                    "a comment after the `>` the plugin takes for the tag's end, which it deletes",
                ));
            } else {
                self.embedder.kept.push(comment);
                attached[attributes.len() - 1].trailing.push(comment);
            }
        }
        let all = || {
            attached
                .iter()
                .flat_map(|a| a.leading.iter().chain(&a.trailing))
        };
        // Prettier measures a comment's line break as no width; oxc's printer breaks the group.
        if !all().any(|c| !is_block(c.text(self.source_text)))
            && let Some(&comment) = all().find(|c| c.text(self.source_text).contains(['\n', '\r']))
        {
            return Err(Unsupported::at(
                "a comment on more than one line among attributes that may stay on one line",
                comment,
            ));
        }
        Ok(attached)
    }

    /// `document` with its comments, as Prettier's `printComments` prints them. `ends_line` says a
    /// line break follows the last attribute, where Prettier writes a `lineSuffix` out.
    pub(super) fn commented(
        &mut self,
        attached: &Attached,
        document: LayoutInstructionIdentifier,
        ends_line: bool,
    ) -> R<LayoutInstructionIdentifier> {
        if attached.leading.is_empty() && attached.trailing.is_empty() {
            return Ok(document);
        }
        let (c, source_text) = (self.c, self.source_text);
        let mut parts = Vec::new();
        for &comment in &attached.leading {
            let text = comment_text(source_text, comment);
            parts.push(self.d().text(text));
            let after = whitespace_after(c, source_text, comment);
            let separator = if !is_block(text) {
                self.d().hardline()
            } else if !starts_with_newline(without_spaces(after)) {
                self.d().text(" ")
            } else if whitespace_before(c, source_text, comment)
                .trim_end_matches([' ', '\t'])
                .ends_with(['\n', '\r', '\u{2028}', '\u{2029}'])
            {
                self.d().hardline()
            } else {
                self.d().line()
            };
            parts.push(separator);
            if starts_with_newline(without_spaces(without_newline(without_spaces(after)))) {
                parts.push(self.d().hardline());
            }
        }
        parts.push(document);
        let mut previous: Option<Previous> = None;
        for &comment in &attached.trailing {
            let text = comment_text(source_text, comment);
            let block = is_block(text);
            let before = whitespace_before(c, source_text, comment);
            let newline_before = before
                .trim_end_matches([' ', '\t'])
                .ends_with(['\n', '\r', '\u{2028}', '\u{2029}']);
            let after_line = previous.is_some_and(|p| p.line_suffix && !p.block);
            let line_suffix =
                after_line || newline_before || !block || previous.is_some_and(|p| p.line_suffix);
            // Prettier writes a `lineSuffix` out at the next line break, which here is not certain.
            if line_suffix && !ends_line {
                return Err(Unsupported::at(
                    "a comment after the last attribute where no line break follows",
                    comment,
                ));
            }
            if after_line || newline_before {
                parts.push(self.d().hardline());
                if previous_line_empty(before) {
                    parts.push(self.d().hardline());
                }
                parts.push(self.d().text(text));
            } else {
                parts.push(self.d().text(" "));
                parts.push(self.d().text(text));
                if !block {
                    parts.push(self.d().break_parent());
                }
            }
            previous = Some(Previous { line_suffix, block });
        }
        Ok(self.cat(&parts))
    }
}

/// The plugin's `printComment`: a line comment without a trailing `\r`.
fn comment_text(source_text: &str, comment: Span) -> &str {
    let text = comment.text(source_text);
    if is_block(text) {
        text
    } else {
        text.trim_end_matches('\r')
    }
}

/// The whitespace right after `comment`, which Prettier's `hasNewline` reads.
fn whitespace_after<'s>(c: &Component, source_text: &'s str, comment: Span) -> &'s str {
    (c.tokens.from_offset(comment.end_offset).first())
        .filter(|t| t.kind == TokenType::Whitespace)
        .map_or("", |t| t.span.text(source_text))
}

/// The whitespace right before `comment`.
fn whitespace_before<'s>(c: &Component, source_text: &'s str, comment: Span) -> &'s str {
    (c.tokens.until_offset(comment.start_offset).last())
        .filter(|t| t.kind == TokenType::Whitespace)
        .map_or("", |t| t.span.text(source_text))
}

/// Prettier's `isPreviousLineEmpty` on the whitespace before a comment.
fn previous_line_empty(before: &str) -> bool {
    let newline = |s: &str| {
        ["\r\n", "\n", "\r", "\u{2028}", "\u{2029}"]
            .iter()
            .find_map(|n| s.strip_suffix(n))
            .unwrap_or(s)
            .len()
    };
    let s = before.trim_end_matches([' ', '\t']);
    let s = &s[..newline(s)];
    let s = s.trim_end_matches([' ', '\t']);
    newline(s) != s.len()
}
