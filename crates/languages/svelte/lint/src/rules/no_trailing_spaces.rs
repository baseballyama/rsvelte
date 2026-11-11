use oxc_parser::Kind;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace as is_javascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{TemplateNode, TokenType};
use serde::Deserialize;

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
        // `sourceCode.lines`.
        let lines = file.context.ecmascript_line_index();
        let line_of = |offset: u32| lines.line(offset) as usize - 1;
        let mut ignored = vec![false; lines.line_count()];
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
                TokenType::JavaScript(
                    Kind::NoSubstitutionTemplate
                    | Kind::TemplateHead
                    | Kind::TemplateMiddle
                    | Kind::TemplateTail,
                ) => ignore(token.span, false),
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
        for (line, ignored) in (1..).zip(ignored) {
            let span = lines.line_span(line).expect("a line of the document");
            let text = span.text(source);
            if ignored || (self.0.skip_blank_lines && text.chars().all(is_javascript_whitespace)) {
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
