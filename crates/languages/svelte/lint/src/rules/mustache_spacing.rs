use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, TemplateNode, TokenType,
};
use rsvelte_typescript_tree::PatternIdentifier;
use serde::Deserialize;

use super::markup::{is_special_this, whitespace_after, whitespace_before};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/mustache-spacing",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum Spacing {
    #[default]
    Never,
    Always,
    /// Only for `tags.closingBrace`.
    AlwaysAfterExpression,
}

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct Options {
    #[serde(default)]
    text_expressions: Spacing,
    #[serde(default)]
    attributes_and_props: Spacing,
    #[serde(default)]
    directive_expressions: Spacing,
    #[serde(default)]
    tags: Tags,
}

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct Tags {
    #[serde(default)]
    opening_brace: Spacing,
    #[serde(default)]
    closing_brace: Spacing,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    let only_tags = [
        options.text_expressions,
        options.attributes_and_props,
        options.directive_expressions,
        options.tags.opening_brace,
    ];
    if only_tags.contains(&Spacing::AlwaysAfterExpression) {
        return Err("`always-after-expression` is only for `tags.closingBrace`".to_owned());
    }
    Ok(Box::new(MustacheSpacing(options)))
}

#[derive(Debug)]
struct MustacheSpacing(Options);

/// The braces of one mustache and how to space them.
struct Braces {
    open: u32,
    /// `None` when only the opening brace is checked.
    close: Option<u32>,
    opening: Spacing,
    closing: Spacing,
}

impl SvelteRule for MustacheSpacing {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let checker = Checker {
            component,
            source: file.source(),
            tokens: &component.tokens,
            options: &self.0,
        };
        let mut braces = Vec::new();
        for node in &component.nodes {
            checker.node(node, &mut braces);
        }
        for brace in braces {
            checker.verify(&brace, reporter);
        }
    }
}

struct Checker<'a> {
    component: &'a Component,
    source: &'a str,
    tokens: &'a Tokens<TokenType>,
    options: &'a Options,
}

impl Checker<'_> {
    /// Same spacing on both braces.
    const fn plain(open: u32, close: u32, spacing: Spacing) -> Braces {
        Braces {
            open,
            close: Some(close),
            opening: spacing,
            closing: spacing,
        }
    }

    /// A block or a tag such as `{@html}`; `expression` says whether an expression ends it.
    const fn tag(&self, open: u32, close: Option<u32>, expression: bool) -> Braces {
        let closing = match self.options.tags.closing_brace {
            Spacing::AlwaysAfterExpression if expression => Spacing::Always,
            Spacing::AlwaysAfterExpression => Spacing::Never,
            spacing => spacing,
        };
        Braces {
            open,
            close,
            opening: self.options.tags.opening_brace,
            closing,
        }
    }

    fn node(&self, node: &TemplateNode, out: &mut Vec<Braces>) {
        let options = self.options;
        match *node {
            TemplateNode::Expression { span, .. } => out.push(Self::plain(
                span.start_offset,
                span.end_offset - 1,
                options.text_expressions,
            )),
            TemplateNode::Html { span, .. }
            | TemplateNode::Debug { span, .. }
            | TemplateNode::Render { span, .. }
            | TemplateNode::Declaration { span, .. } => {
                out.push(self.tag(span.start_offset, Some(span.end_offset - 1), true));
            }
            TemplateNode::Element {
                name, attributes, ..
            } => {
                self.attributes(name.text(self.source), attributes, out);
            }
            TemplateNode::If {
                consequent,
                alternate,
                elseif,
                span,
                ..
            } => {
                let open = if elseif {
                    let keyword = self
                        .tokens
                        .until_offset(span.start_offset)
                        .iter()
                        .rfind(|token| token.kind == TokenType::BlockOpen)
                        .expect("`if` follows `{:else`");
                    self.brace(keyword.span.start_offset)
                } else {
                    span.start_offset
                };
                let header = self.header(span.start_offset);
                out.push(self.tag(open, Some(header), true));
                if let Some(alternate) = alternate {
                    let chained = matches!(
                        self.component.children(alternate),
                        [only] if matches!(self.component.node(*only), TemplateNode::If { elseif: true, .. })
                    );
                    if !chained {
                        out.push(self.branch(self.end_of(consequent, header + 1)));
                    }
                }
                if !elseif {
                    out.push(self.block_end(span));
                }
            }
            TemplateNode::Each {
                body,
                has_fallback,
                span,
                ..
            } => {
                let header = self.header(span.start_offset);
                out.push(self.tag(span.start_offset, Some(header), true));
                if has_fallback {
                    out.push(self.branch(self.end_of(body, header + 1)));
                }
                out.push(self.block_end(span));
            }
            TemplateNode::Key { span, .. } | TemplateNode::Snippet { span, .. } => {
                let header = self.header(span.start_offset);
                out.push(self.tag(span.start_offset, Some(header), true));
                out.push(self.block_end(span));
            }
            TemplateNode::Await {
                value,
                error,
                pending,
                then,
                catch,
                span,
                ..
            } => self.await_block(span, value, error, [pending, then, catch], out),
            TemplateNode::Text { .. }
            | TemplateNode::Comment { .. }
            | TemplateNode::Const { .. } => {}
        }
    }

    fn await_block(
        &self,
        span: Span,
        value: Option<PatternIdentifier>,
        error: Option<PatternIdentifier>,
        [pending, then, catch]: [Range; 3],
        out: &mut Vec<Braces>,
    ) {
        let header = self.header(span.start_offset);
        let mut cursor = header + 1;
        let mut inline = pending.present().is_none();
        if let Some(pending) = pending.present() {
            out.push(self.tag(span.start_offset, Some(header), true));
            cursor = self.end_of(pending, cursor);
        }
        for (branch, pattern) in [(then, value), (catch, error)] {
            let Some(branch) = branch.present() else {
                continue;
            };
            let has_pattern = pattern.is_some();
            if inline {
                out.push(self.tag(span.start_offset, Some(header), has_pattern));
                inline = false;
            } else {
                let open = self.next_block_open(cursor);
                let header = self.header(open);
                out.push(self.tag(self.brace(open), has_pattern.then_some(header), true));
                cursor = header + 1;
            }
            cursor = self.end_of(branch, cursor);
        }
        out.push(self.block_end(span));
    }

    fn attributes(&self, element: &str, attributes: Range, out: &mut Vec<Braces>) {
        let options = self.options;
        for attribute in self.component.attributes(attributes) {
            let spacing = match attribute.kind {
                AttributeKind::Attach => continue,
                AttributeKind::Attribute
                    if is_special_this(self.component, self.source, element, attribute) =>
                {
                    options.directive_expressions
                }
                AttributeKind::Spread | AttributeKind::Attribute => options.attributes_and_props,
                _ if attribute.shorthand => continue,
                _ => options.directive_expressions,
            };
            if attribute.shorthand || attribute.kind == AttributeKind::Spread {
                let span = attribute.span;
                out.push(Self::plain(span.start_offset, span.end_offset - 1, spacing));
                continue;
            }
            let AttributeValue::Parts(parts) = attribute.value else {
                continue;
            };
            for part in self.component.parts(parts) {
                if let Part::Expression { span, .. } = *part {
                    out.push(Self::plain(span.start_offset, span.end_offset - 1, spacing));
                }
            }
        }
    }

    /// The `}` that ends the tag opened at `offset`; a `}` inside its JavaScript is another token.
    fn header(&self, offset: u32) -> u32 {
        self.tokens
            .from_offset(offset)
            .iter()
            .find(|token| token.kind == TokenType::MustacheClose)
            .expect("a tag ends with `}`")
            .span
            .start_offset
    }

    /// The `{` of the block keyword token at `offset`: its own first byte, or a separate `{`.
    fn brace(&self, offset: u32) -> u32 {
        let before = whitespace_before(self.tokens, offset).start_offset;
        match self.tokens.until_offset(before).last() {
            Some(token) if token.kind == TokenType::MustacheOpen => token.span.start_offset,
            _ => offset,
        }
    }

    fn next_block_open(&self, offset: u32) -> u32 {
        self.tokens
            .from_offset(offset)
            .iter()
            .find(|token| token.kind == TokenType::BlockOpen)
            .expect("a branch starts with a block keyword")
            .span
            .start_offset
    }

    /// `{:else}`, found after the branch before it.
    fn branch(&self, cursor: u32) -> Braces {
        let open = self.next_block_open(cursor);
        self.tag(self.brace(open), Some(self.header(open)), false)
    }

    /// `{/if}` and the like, which end the block.
    fn block_end(&self, block: Span) -> Braces {
        let close = block.end_offset - 1;
        let keyword = self
            .tokens
            .until_offset(close)
            .iter()
            .rfind(|token| token.kind == TokenType::BlockOpen)
            .expect("a block ends with its closing tag");
        self.tag(self.brace(keyword.span.start_offset), Some(close), false)
    }

    /// Where the children end, or `cursor` when there are none.
    fn end_of(&self, children: Range, cursor: u32) -> u32 {
        self.component
            .children(children)
            .last()
            .map_or(cursor, |&last| self.component.node(last).span().end_offset)
    }

    fn verify(&self, braces: &Braces, reporter: &mut Reporter<'_>) {
        let open = braces.open;
        // A block keyword token holds its `{`; a lone `{` is followed by what it opens.
        let first = if self
            .tokens
            .from_offset(open)
            .first()
            .is_some_and(|token| token.kind == TokenType::MustacheOpen)
        {
            whitespace_after(self.tokens, open + 1).end_offset
        } else {
            open + 1
        };
        if braces.opening == Spacing::Always {
            if first == open + 1 {
                reporter.report(
                    Report::range(
                        "Expected 1 space after '{', but not found.",
                        Span::new(open, open + 1),
                    )
                    .fix(Fix::insert(open + 1, " ")),
                );
            }
        } else if first != open + 1 {
            reporter.report(
                Report::range(
                    "Expected no space after '{', but found.",
                    Span::new(open, first),
                )
                .fix(Fix::remove(Span::new(open + 1, first))),
            );
        }
        let Some(close) = braces.close else {
            return;
        };
        let last = whitespace_before(self.tokens, close).start_offset;
        if braces.closing == Spacing::Always {
            if last == close {
                reporter.report(
                    Report::range(
                        "Expected 1 space before '}', but not found.",
                        Span::new(close, close + 1),
                    )
                    .fix(Fix::insert(close, " ")),
                );
            }
        } else if last != close {
            reporter.report(
                Report::range(
                    "Expected no space before '}', but found.",
                    Span::new(last, close + 1),
                )
                .fix(Fix::remove(Span::new(last, close))),
            );
        }
    }
}
