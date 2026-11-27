//! The official `parse(source, { modern: true })`: the component's modern AST, as JSON.

mod comments;
mod element;
mod estree;
mod options;
mod parentheses;
mod shape;
mod stylesheet;
mod template;

use comments::Comment;
use estree::Writer;
use oxc_estree::ESTree;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::{LineBreaks, LineColumn, LineIndex, Span};
use rsvelte_svelte_syntax::syntax_tree::{
    Component, Range, Script, TemplateNode, decode_attribute,
};

/// The modern AST of `source`, as JSON.
///
/// # Errors
///
/// What the official parser rejects.
pub fn parse(source: &str) -> Result<String, Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source).map_err(Diagnostic::from)?;
    Ok(print(source, &component))
}

/// The modern AST of `component`, parsed from `source`, as JSON.
pub(crate) fn print(source: &str, component: &Component) -> String {
    let svelte_lines = Lines::new(source, LineBreaks::Newline);
    let acorn_lines = Lines::new(source, LineBreaks::Ecmascript);
    let comments = javascript_comments(source, component);
    let typescript = component.checked_as_typescript(source);
    let mut printer = Printer {
        source,
        component,
        lines: &svelte_lines,
        comments: &comments,
        out: Writer::new(source, &comments, &acorn_lines, &svelte_lines, typescript),
    };
    printer.root();
    printer.out.finish()
}

/// The lines of a component, counted after its byte order mark, which svelte removes before it
/// parses.
struct Lines {
    index: LineIndex,
    /// Where the text svelte reads starts, in bytes.
    start: u32,
}

impl Lines {
    fn new(source: &str, breaks: LineBreaks) -> Self {
        let text = source.strip_prefix('\u{feff}').unwrap_or(source);
        Self {
            index: LineIndex::with_breaks(text, breaks),
            start: (source.len() - text.len()) as u32,
        }
    }

    fn line_column(&self, byte: u32) -> LineColumn {
        self.index.line_column(byte.saturating_sub(self.start))
    }
}

/// Every JavaScript comment of the component, in document order.
fn javascript_comments(source: &str, component: &Component) -> Vec<Comment> {
    let mut comments = Vec::new();
    for script in [&component.instance, &component.module]
        .into_iter()
        .flatten()
    {
        let program = component.javascript.get_program(script.program);
        let padded = script.content.start_offset;
        comments.extend(program.comments.iter().map(|comment| {
            let span = Span::new(comment.span.start, comment.span.end);
            Comment::new(source, span, comment.is_block(), padded)
        }));
    }
    comments.extend(component.javascript.comments().iter().map(|comment| {
        let span = Span::new(comment.span.start, comment.span.end);
        Comment::new(source, span, comment.is_block(), 0)
    }));
    let in_tags = component.tag_comments.iter();
    comments.extend(in_tags.map(|&span| Comment::in_tag(source, span)));
    comments.sort_by_key(|comment| comment.span.start_offset);
    comments
}

struct Printer<'a> {
    source: &'a str,
    component: &'a Component,
    comments: &'a [Comment],
    /// Lines as svelte's locator counts them, at `\n` only.
    lines: &'a Lines,
    out: Writer<'a>,
}

/// Where an element is, for the type its name gives it.
#[derive(Clone, Copy, Default)]
struct Place {
    in_head: bool,
    in_shadow_root: bool,
}

impl<'a> Printer<'a> {
    fn text(&self, span: Span) -> &'a str {
        span.text(self.source)
    }

    fn character(&self, byte: u32) -> u32 {
        self.lines.line_column(byte).character
    }

    fn span(&mut self, span: Span) {
        let (start, end) = (
            self.character(span.start_offset),
            self.character(span.end_offset),
        );
        self.out.key("start").number(start);
        self.out.key("end").number(end);
    }

    fn root(&mut self) {
        let component = self.component;
        let nodes: Vec<_> = component
            .children(component.root)
            .iter()
            .copied()
            .filter(|&node| !self.is_options(node))
            .collect();
        self.out.object();
        self.out.key("css");
        match &component.style {
            Some(style) => self.stylesheet(style),
            None => self.out.null(),
        }
        self.out.key("js").raw("[]");
        // The official parser places the root over the whole source.
        self.out.key("start").number(0);
        let end = self.character(self.source.len() as u32);
        self.out.key("end").number(end);
        self.out.key("type").string("Root");
        self.out.key("fragment");
        self.fragment(&nodes, Place::default());
        self.out.key("options");
        self.options();
        self.out.key("comments");
        self.out.comments();
        if let Some(script) = &component.instance {
            self.out.key("instance");
            self.script(script, "default");
        }
        if let Some(script) = &component.module {
            self.out.key("module");
            self.script(script, "module");
        }
        self.out.end();
    }

    fn is_options(&self, node: u32) -> bool {
        matches!(
            self.component.node(node),
            TemplateNode::Element { name, .. } if self.text(*name) == "svelte:options"
        )
    }

    fn script(&mut self, script: &Script, context: &str) {
        self.out.object();
        self.out.key("type").string("Script");
        self.span(script.span);
        self.out.key("context").string(context);
        self.out.key("content");
        let program = self.component.javascript.get_program(script.program);
        let content_end = script.content.end_offset;
        // svelte attaches every comment read so far, the earlier parts' too.
        let candidates = 0..self
            .comments
            .partition_point(|comment| comment.span.start_offset < content_end);
        let markup_comment = self
            .comment_before(script.span.start_offset)
            .map(|(_, data)| data.text(self.source));
        self.out.program(
            program,
            script.typescript,
            self.character(script.content.start_offset),
            self.character(content_end),
            script.span,
            content_end,
            candidates,
            markup_comment,
            self.component.javascript.get_program_tokens(script.program),
        );
        self.out.key("attributes");
        self.tag_attributes(&script.attributes);
        self.out.end();
    }

    /// The attributes of a `<script>` or `<style>` tag, each a name and its text.
    fn tag_attributes(&mut self, attributes: &[(Span, Option<Span>)]) {
        self.out.array();
        for &(name, value) in attributes {
            self.out.element().object();
            self.out.key("type").string("Attribute");
            let end = value.map_or(name.end_offset, |value| {
                let after = value.end_offset as usize;
                let quoted = matches!(self.source.as_bytes().get(after), Some(b'"' | b'\''));
                value.end_offset + u32::from(quoted)
            });
            self.span(Span::new(name.start_offset, end));
            self.out.key("name").string(name.text(self.source));
            self.name_location(name);
            self.out.key("value");
            match value {
                None => self.out.boolean(true),
                Some(value) => {
                    self.out.array().element().object();
                    self.span(value);
                    self.out.key("type").string("Text");
                    let raw = self.text(value);
                    self.out.key("raw").string(raw);
                    self.out.key("data").string(&decode_attribute(raw));
                    self.out.end().end_array();
                }
            }
            self.out.end();
        }
        self.out.end_array();
    }

    fn name_location(&mut self, name: Span) {
        self.out.key("name_loc").object();
        for (key, byte) in [("start", name.start_offset), ("end", name.end_offset)] {
            let at = self.lines.line_column(byte);
            self.out.key(key).object();
            self.out.key("line").number(at.line);
            self.out.key("column").number(at.column);
            self.out.key("character").number(at.character);
            self.out.end();
        }
        self.out.end();
    }

    fn fragment(&mut self, nodes: &[u32], place: Place) {
        self.out.object();
        self.out.key("type").string("Fragment");
        self.out.key("nodes").array();
        for &node in nodes {
            self.out.element();
            self.node(node, place);
        }
        self.out.end_array().end();
    }

    fn range(&mut self, range: Range, place: Place) {
        let nodes = self.component.children(range).to_vec();
        self.fragment(&nodes, place);
    }

    fn optional_range(&mut self, range: Range, place: Place) {
        match range.present() {
            Some(range) => self.range(range, place),
            None => self.out.null(),
        }
    }

    fn expression(&mut self, expression: rsvelte_typescript_tree::ExpressionIdentifier) {
        let expression = self.component.javascript.get_expression(expression);
        self.javascript(expression);
    }

    /// A JavaScript part of the template, with the comments acorn reads around it: those
    /// inside it and those only whitespace apart from it.
    fn javascript(&mut self, node: &(impl ESTree + oxc_span::GetSpan)) {
        let span = node.span();
        let comments = self.comments;
        let blank = |text: &str| text.chars().all(char::is_whitespace);
        let mut start = comments.partition_point(|comment| comment.span.start_offset < span.start);
        let mut edge = span.start;
        while start > 0
            && blank(&self.source[comments[start - 1].span.end_offset as usize..edge as usize])
        {
            start -= 1;
            edge = comments[start].span.start_offset;
        }
        let mut end = comments.partition_point(|comment| comment.span.start_offset < span.end);
        let mut edge = span.end;
        while end < comments.len()
            && blank(&self.source[edge as usize..comments[end].span.start_offset as usize])
        {
            edge = comments[end].span.end_offset;
            end += 1;
        }
        self.out.javascript(node, start..end);
    }

    /// The HTML comment just before the `<script>` or `<style>` at `start`, with only
    /// whitespace between: its span and its text.
    fn comment_before(&self, start: u32) -> Option<(Span, Span)> {
        let component = self.component;
        let before = component
            .children(component.root)
            .iter()
            .map(|&node| component.node(node))
            .filter(|node| node.span().end_offset <= start);
        for (at, node) in before.rev().enumerate() {
            if at == 0 && node.span().end_offset != start {
                return None;
            }
            match *node {
                TemplateNode::Comment { span, data } => return Some((span, data)),
                TemplateNode::Text { span } if self.text(span).trim().is_empty() => {}
                _ => return None,
            }
        }
        None
    }
}

#[cfg(test)]
mod tests;
