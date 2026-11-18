use rsvelte_kernel::source::characters::trim_ecmascript;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode, TokenType};
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/max-lines-per-block",
    files: Files::Components,
    configure,
};

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    script: Option<u32>,
    template: Option<u32>,
    style: Option<u32>,
    #[serde(default)]
    skip_blank_lines: bool,
    #[serde(default)]
    skip_comments: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    if [options.script, options.template, options.style].contains(&Some(0)) {
        return Err("a maximum must be at least 1".to_owned());
    }
    Ok(Box::new(MaxLinesPerBlock(options)))
}

#[derive(Debug)]
struct MaxLinesPerBlock(Options);

impl SvelteRule for MaxLinesPerBlock {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let lines = Lines {
            source: file.source(),
            index: file.context.lines(LineBreaks::Ecmascript),
        };
        check(component, &lines, &self.0, reporter);
    }
}

/// `ESLint`'s `sourceCode.lines`, 1-based, split at ECMAScript line terminators.
struct Lines<'a> {
    source: &'a str,
    index: &'a LineIndex,
}

impl Lines<'_> {
    const fn count(&self) -> u32 {
        self.index.line_count() as u32
    }

    fn line(&self, offset: u32) -> u32 {
        self.index.line(offset)
    }

    fn span(&self, line: u32) -> Span {
        self.index.line_span(line).expect("an existing line")
    }

    fn start(&self, line: u32) -> u32 {
        self.span(line).start_offset
    }

    /// The line's text without its terminator.
    fn text(&self, line: u32) -> &str {
        self.span(line).text(self.source)
    }

    /// Whether `line` counts when blank lines are skipped or not.
    fn counts(&self, line: u32, skip_blank_lines: bool) -> bool {
        !skip_blank_lines || !trim_ecmascript(self.text(line)).is_empty()
    }

    /// `isFullLineComment`: nothing but whitespace beside `comment` on `line`.
    fn comment_fills(&self, line: u32, comment: Span) -> bool {
        let start = self.start(line);
        let end = start + self.text(line).len() as u32;
        let before = Span::new(start, comment.start_offset.max(start));
        let after = Span::new(comment.end_offset.min(end), end);
        (self.line(comment.start_offset) < line
            || trim_ecmascript(before.text(self.source)).is_empty())
            && (self.line(comment.end_offset) > line
                || trim_ecmascript(after.text(self.source)).is_empty())
    }
}

/// The JavaScript comments, and with `markup` the HTML comments, in document order.
fn comments(component: &Component, markup: bool) -> impl Iterator<Item = Span> + '_ {
    component.tokens.iter().filter_map(move |token| {
        (token.kind == TokenType::JavaScriptComment
            || (markup && token.kind == TokenType::MarkupComment))
            .then_some(token.span)
    })
}

/// By line number, whether one of `comments` fills a line that `within` accepts.
fn full_comment_lines(
    lines: &Lines<'_>,
    comments: impl Iterator<Item = Span>,
    within: impl Fn(u32) -> bool,
) -> Vec<bool> {
    let mut out = vec![false; lines.count() as usize + 1];
    for comment in comments {
        for line in lines.line(comment.start_offset)..=lines.line(comment.end_offset) {
            if within(line) && lines.comment_fills(line, comment) {
                out[line as usize] = true;
            }
        }
    }
    out
}

/// Lines strictly between the block's first and last that count.
fn count_inner(
    lines: &Lines<'_>,
    block: Span,
    skip_blank_lines: bool,
    comment_line: impl Fn(u32) -> bool,
) -> u32 {
    let (first, last) = (lines.line(block.start_offset), lines.line(block.end_offset));
    (first + 1..last)
        .filter(|&line| lines.counts(line, skip_blank_lines) && !comment_line(line))
        .count() as u32
}

fn check(component: &Component, lines: &Lines<'_>, options: &Options, reporter: &mut Reporter<'_>) {
    let report = |reporter: &mut Reporter<'_>, block: &str, count: u32, max: u32, span: Span| {
        if count > max {
            reporter.range(
                format!("{block} block has too many lines ({count}). Maximum allowed is {max}."),
                span,
            );
        }
    };
    if let Some(max) = options.script {
        for script in [&component.module, &component.instance]
            .into_iter()
            .flatten()
        {
            let (first, last) = (
                lines.line(script.span.start_offset) + 1,
                lines.line(script.span.end_offset) - 1,
            );
            let comment_lines = if options.skip_comments {
                full_comment_lines(lines, comments(component, false), |line| {
                    (first..=last).contains(&line)
                })
            } else {
                Vec::new()
            };
            let count = count_inner(lines, script.span, options.skip_blank_lines, |line| {
                comment_lines.get(line as usize) == Some(&true)
            });
            report(reporter, "<script>", count, max, script.span);
        }
    }
    if let (Some(max), Some(style)) = (options.style, &component.style) {
        // A sheet the CSS parser rejects has no comments to skip.
        let comments = style
            .sheet
            .as_ref()
            .map_or(&[][..], |sheet| &*sheet.comments);
        let count = count_inner(lines, style.span, options.skip_blank_lines, |line| {
            options.skip_comments && stylesheet_comment_only(lines, comments, line)
        });
        report(reporter, "<style>", count, max, style.span);
    }
    if let Some(max) = options.template {
        check_template(component, lines, options, max, reporter, report);
    }
}

/// A line inside a style sheet that a comment covers and no other token starts on.
fn stylesheet_comment_only(lines: &Lines<'_>, comments: &[Span], line: u32) -> bool {
    let start = lines.start(line);
    let end = start + lines.text(line).len() as u32;
    let mut covered = false;
    let mut at = start;
    let overlapping = comments
        .iter()
        .skip(comments.partition_point(|c| c.end_offset <= start))
        .take_while(|c| c.start_offset < end);
    for comment in overlapping {
        covered = true;
        if !trim_ecmascript(Span::new(at, comment.start_offset.max(at)).text(lines.source))
            .is_empty()
        {
            return false;
        }
        at = comment.end_offset.min(end);
    }
    covered && trim_ecmascript(Span::new(at, end).text(lines.source)).is_empty()
}

fn check_template(
    component: &Component,
    lines: &Lines<'_>,
    options: &Options,
    max: u32,
    reporter: &mut Reporter<'_>,
    report: impl Fn(&mut Reporter<'_>, &str, u32, u32, Span),
) {
    let source = lines.source;
    let is_options = |node: &TemplateNode| matches!(node, TemplateNode::Element { name, .. } if name.text(source) == "svelte:options");
    let root = component.children(component.root);
    // By first and last line.
    let excluded: Vec<(u32, u32)> = [&component.module, &component.instance]
        .into_iter()
        .flatten()
        .map(|script| script.span)
        .chain(component.style.as_ref().map(|style| style.span))
        .chain(
            root.iter()
                .map(|&n| component.node(n))
                .filter(|n| is_options(n))
                .map(TemplateNode::span),
        )
        .map(|span| (lines.line(span.start_offset), lines.line(span.end_offset)))
        .collect();
    let is_excluded = |line: u32| {
        excluded
            .iter()
            .any(|&(first, last)| first <= line && line <= last)
    };
    let comment_lines = if options.skip_comments {
        full_comment_lines(lines, comments(component, true), |line| !is_excluded(line))
    } else {
        Vec::new()
    };
    let count = (1..=lines.count())
        .filter(|&line| {
            !is_excluded(line)
                && lines.counts(line, options.skip_blank_lines)
                && comment_lines.get(line as usize) != Some(&true)
        })
        .count() as u32;
    // svelte-eslint-parser leaves out the blank text that ends the file.
    let trailing_blank = |node: &TemplateNode| {
        matches!(node, TemplateNode::Text { span } if span.end_offset as usize == source.len()
            && trim_ecmascript(span.text(source)).is_empty())
    };
    let first = root
        .iter()
        .map(|&n| component.node(n))
        .find(|n| !is_options(n) && !trailing_blank(n));
    if let Some(first) = first {
        report(reporter, "template", count, max, first.span());
    }
}

#[cfg(test)]
mod tests;
