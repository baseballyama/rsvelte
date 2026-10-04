//! The template parser: upstream's `1-parse` for Svelte 5 markup, blocks, tags and directives,
//! one instance `<script>`, one `<script module>` and one `<style>`.
//!
//! Expressions are parsed by `rsvelte_typescript` in place, and the parser, not a brace scan,
//! decides where each one ends.

mod attribute;
mod block;
mod directive;
mod element;
mod fragment;
mod html;
mod identifier;
mod javascript;
mod pattern;
mod script;
mod sequence;
mod snippet;
mod tag;
mod token;
mod whitespace;

pub use html::is_void;
use identifier::is_identifier_continue;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_svelte_syntax::syntax_tree::{
    Component, Range, TemplateNode, TemplateNodeIdentifier, TokenType,
};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

type ParseResult<T> = Result<T, Diagnostic>;

const ESTIMATED_BYTES_PER_TOKEN: usize = 4;
const INITIAL_TOKEN_CAPACITY_LIMIT: usize = 8192;

/// # Errors
///
/// A `parse_error` [`Diagnostic`] at the first syntax error in the markup, the scripts or the
/// style sheet, or at syntax this parser does not support.
pub fn parse(source_text: &str) -> ParseResult<Component> {
    let mut parser = Parser {
        source_text,
        position: 0,
        component: Component {
            javascript: SyntaxTree::new(),
            nodes: buffer_pool::take_keyed::<Component, _>(),
            children: buffer_pool::take_keyed::<Component, _>(),
            attributes: buffer_pool::take_keyed::<Component, _>(),
            parts: buffer_pool::take_keyed::<Component, _>(),
            modifiers: buffer_pool::take_keyed::<Component, _>(),
            javascript_lists: buffer_pool::take_keyed::<Component, _>(),
            root: Range::default(),
            instance: None,
            module: None,
            program: NodeIdentifier::NONE,
            style: None,
            template_expressions: buffer_pool::take_keyed::<Component, _>(),
            // Long text regions need few tokens even when the source is large.
            tokens: Tokens::with_capacity(
                (source_text.len() / ESTIMATED_BYTES_PER_TOKEN).min(INITIAL_TOKEN_CAPACITY_LIMIT),
            ),
        },
        typescript: false,
        pending_children: buffer_pool::take_keyed::<Parser<'static>, _>(),
    };
    // The script's language decides how template expressions parse, so read it first.
    parser.typescript = script::script_is_typescript(source_text);
    let root = parser.fragment(End::Eof);
    buffer_pool::give_keyed::<Parser<'static>, _>(std::mem::take(&mut parser.pending_children));
    parser.component.root = root?;
    parser.component.program = match &parser.component.instance {
        Some(s) => s.program,
        None => parser.component.javascript.program(&[], Span::new(0, 0)),
    };
    Ok(parser.component)
}

#[cold]
fn javascript_error(e: rsvelte_typescript::parser::ParseError) -> Diagnostic {
    Diagnostic::error("js_parse_error", e.message, e.span)
}

/// What closes the fragment being read.
#[derive(Clone, Copy)]
enum End<'a> {
    Eof,
    Tag { name: &'a str, regular: bool },
    Block,
}

struct Parser<'a> {
    source_text: &'a str,
    position: usize,
    component: Component,
    typescript: bool,
    pending_children: Vec<TemplateNodeIdentifier>,
}

impl<'a> Parser<'a> {
    #[cold]
    fn err<T>(&self, message: impl Into<String>) -> ParseResult<T> {
        Self::err_at(
            Span::new(self.position as u32, self.position as u32),
            message,
        )
    }

    #[cold]
    fn err_at<T>(span: Span, message: impl Into<String>) -> ParseResult<T> {
        Err(Diagnostic::error("parse_error", message.into(), span))
    }

    fn rest(&self) -> &'a str {
        &self.source_text[self.position..]
    }

    fn peek(&self) -> Option<u8> {
        self.source_text.as_bytes().get(self.position).copied()
    }

    fn skip_ws(&mut self) {
        let start_offset = self.position;
        self.position += whitespace::whitespace_len(self.rest().as_bytes());
        self.token(TokenType::Whitespace, start_offset);
    }

    fn require_ws(&mut self) -> ParseResult<()> {
        if !self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            return self.err("expected whitespace");
        }
        self.skip_ws();
        Ok(())
    }

    fn push_node(&mut self, node: TemplateNode) -> TemplateNodeIdentifier {
        self.component.nodes.push(node);
        (self.component.nodes.len() - 1) as TemplateNodeIdentifier
    }

    fn finish_children(&mut self, children_start: usize) -> Range {
        let start = self.component.children.len() as u32;
        self.component
            .children
            .extend_from_slice(&self.pending_children[children_start..]);
        self.pending_children.truncate(children_start);
        Range {
            start,
            len: self.component.children.len() as u32 - start,
        }
    }

    const fn empty_range(&self) -> Range {
        Range {
            start: self.component.children.len() as u32,
            len: 0,
        }
    }

    fn at_word(&self, word: &str) -> bool {
        self.rest().starts_with(word)
            && !self
                .rest()
                .get(word.len()..)
                .and_then(|r| r.chars().next())
                .is_some_and(is_identifier_continue)
    }
}
