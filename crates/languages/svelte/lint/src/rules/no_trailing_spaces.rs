use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{TemplateNode, TokenType};
use rsvelte_typescript::lexer::T;
use serde::Deserialize;

use super::tags::is_javascript_whitespace;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-trailing-spaces",
    files: Files::Components,
    configure,
};

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct Options {
    #[serde(default)]
    skip_blank_lines: bool,
    #[serde(default)]
    ignore_comments: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoTrailingSpaces(options)))
}

#[derive(Debug)]
struct NoTrailingSpaces(Options);

impl SvelteRule for NoTrailingSpaces {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let lines = lines(source);
        let line_of = |offset: u32| lines.partition_point(|line| line.start_offset <= offset) - 1;
        let mut ignored = vec![false; lines.len()];
        // Lines a token spans, the last one included or not.
        let mut ignore = |span: Span, last: bool| {
            let (start, end) = (line_of(span.start_offset), line_of(span.end_offset));
            let end = if last { end + 1 } else { end };
            for line in &mut ignored[start..end.max(start)] {
                *line = true;
            }
        };
        for token in component.tokens.iter() {
            match token.kind {
                TokenType::JavaScript(T::Template { .. }) => ignore(token.span, false),
                TokenType::JavaScriptComment if self.0.ignore_comments => {
                    let block = token.span.text(source).starts_with("/*");
                    ignore(token.span, !block);
                }
                _ => {}
            }
        }
        if self.0.ignore_comments {
            for node in &component.nodes {
                if let TemplateNode::Comment { span, .. } = node {
                    ignore(*span, false);
                }
            }
        }
        for (line, span) in lines.iter().enumerate() {
            let text = span.text(source);
            if ignored[line]
                || (self.0.skip_blank_lines && text.chars().all(is_javascript_whitespace))
            {
                continue;
            }
            let trimmed = text.trim_end_matches(is_javascript_whitespace);
            if trimmed.len() == text.len() {
                continue;
            }
            let trailing = Span::new(span.start_offset + trimmed.len() as u32, span.end_offset);
            reporter.report(
                Report::range("Trailing spaces not allowed.", trailing).fix(Fix::remove(trailing)),
            );
        }
    }
}

/// `sourceCode.lines`: split at `\r\n`, `\r`, `\n`, U+2028 and U+2029, terminators excluded.
fn lines(source: &str) -> Vec<Span> {
    let mut lines = Vec::new();
    let mut start = 0;
    let mut chars = source.char_indices().peekable();
    while let Some((i, c)) = chars.next() {
        if !matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}') {
            continue;
        }
        lines.push(Span::new(start as u32, i as u32));
        let mut next = i + c.len_utf8();
        if c == '\r' && chars.peek().is_some_and(|&(_, n)| n == '\n') {
            chars.next();
            next += 1;
        }
        start = next;
    }
    lines.push(Span::new(start as u32, source.len() as u32));
    lines
}
