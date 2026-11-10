//! The template parser: upstream's `1-parse` for Svelte 5 markup, blocks, tags and directives,
//! one instance `<script>`, one `<script module>` and one `<style>`.
//!
//! JavaScript is parsed by oxc in place, into the component's one arena, and the parser, not a
//! brace scan, decides where each expression ends.

mod attribute;
mod block;
mod directive;
mod element;
mod element_rules;
mod fragment;
mod identifier;
mod javascript;
mod pattern;
mod script;
mod sequence;
mod snippet;
mod tag;
mod token;
mod whitespace;

pub use element_rules::{AUTOCLOSING_CHILDREN, Autoclosing, is_void};
use identifier::is_identifier_continue;
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_typescript_tree::{Builder, Tree};
use rustc_hash::FxHashSet;

use crate::syntax_tree::{
    Attribute, Component, Part, Range, Script, Style, TemplateNode, TemplateNodeIdentifier,
    TokenType,
};

type ParseResult<T> = Result<T, Diagnostic>;

/// How deeply elements and blocks may nest. The official parser stops below 1,000 under Node's
/// default stack.
pub const MAX_NESTING: u32 = 1 << 16;

const ESTIMATED_BYTES_PER_TOKEN: usize = 4;
const INITIAL_TOKEN_CAPACITY_LIMIT: usize = 8192;

/// # Errors
///
/// A `parse_error` [`Diagnostic`] at the first syntax error in the markup or the scripts, or at
/// syntax this parser does not support. A style sheet's error alone is kept on
/// [`Style::sheet`](rsvelte_svelte_syntax::syntax_tree::Style::sheet); [`crate::fully_parsed`]
/// reports it.
pub fn parse(source_text: &str) -> ParseResult<Component> {
    let (javascript, template) = Tree::build(source_text, |builder| {
        let mut parser = Parser {
            source_text: builder.source_text(),
            position: 0,
            builder,
            component: Template::new(source_text.len()),
            // The script's language decides how template expressions parse, so read it first.
            typescript: script::script_is_typescript(source_text),
            pending_children: buffer_pool::take_keyed::<Parser<'static, 'static>, _>(),
            unique_names: FxHashSet::default(),
            depth: 0,
        };
        // Upstream removes a leading byte order mark before parsing, so no node covers it.
        if source_text.starts_with('\u{feff}') {
            parser.eat_token(TokenType::ByteOrderMark, '\u{feff}'.len_utf8());
        }
        let root = parser.fragment(End::Eof);
        buffer_pool::give_keyed::<Parser<'static, 'static>, _>(std::mem::take(
            &mut parser.pending_children,
        ));
        // The style sheet's error came first in the document, so it is the one upstream reports.
        parser.component.root = root.map_err(|e| {
            parser
                .component
                .style
                .as_ref()
                .and_then(|style| style.sheet.as_ref().err())
                .cloned()
                .unwrap_or(e)
        })?;
        Ok(parser.component)
    })?;
    Ok(template.into_component(javascript))
}

/// oxc's error, under the code upstream gives a JavaScript syntax error.
#[cold]
fn javascript_error(mut e: Diagnostic) -> Diagnostic {
    e.code = "js_parse_error".into();
    e
}

/// The component without its JavaScript, while the parser fills the arena.
struct Template {
    nodes: Vec<TemplateNode>,
    children: Vec<TemplateNodeIdentifier>,
    attributes: Vec<Attribute>,
    parts: Vec<Part>,
    modifiers: Vec<Span>,
    debug_identifiers: Vec<rsvelte_typescript_tree::ExpressionIdentifier>,
    root: Range,
    module: Option<Script>,
    instance: Option<Script>,
    style: Option<Style>,
    tokens: Tokens<TokenType>,
}

impl Template {
    fn new(source_len: usize) -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Component, _>(),
            children: buffer_pool::take_keyed::<Component, _>(),
            attributes: buffer_pool::take_keyed::<Component, _>(),
            parts: buffer_pool::take_keyed::<Component, _>(),
            modifiers: buffer_pool::take_keyed::<Component, _>(),
            debug_identifiers: buffer_pool::take_keyed::<Component, _>(),
            root: Range::default(),
            module: None,
            instance: None,
            style: None,
            // Long text regions need few tokens even when the source is large.
            tokens: Tokens::with_capacity(
                (source_len / ESTIMATED_BYTES_PER_TOKEN).min(INITIAL_TOKEN_CAPACITY_LIMIT),
            ),
        }
    }

    fn into_component(self, javascript: Tree) -> Component {
        Component {
            javascript,
            nodes: self.nodes,
            children: self.children,
            attributes: self.attributes,
            parts: self.parts,
            modifiers: self.modifiers,
            debug_identifiers: self.debug_identifiers,
            root: self.root,
            module: self.module,
            instance: self.instance,
            style: self.style,
            tokens: self.tokens,
        }
    }
}

/// What closes the fragment being read.
#[derive(Clone, Copy)]
enum End<'a> {
    Eof,
    Tag { name: &'a str, regular: bool },
    Block,
}

struct Parser<'a, 'b> {
    /// The component's text, in the arena.
    source_text: &'a str,
    position: usize,
    builder: &'b mut Builder<'a>,
    component: Template,
    typescript: bool,
    pending_children: Vec<TemplateNodeIdentifier>,
    /// Upstream's `unique_names` for the start tag being read.
    unique_names: FxHashSet<(attribute::Unique, &'a str)>,
    /// How many fragments are open.
    depth: u32,
}

impl<'a> Parser<'a, '_> {
    /// How the component's JavaScript parses.
    const fn source_type(&self) -> SourceType {
        if self.typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        }
    }

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
        self.position += whitespace::whitespace_len(self.rest());
        self.token(TokenType::Whitespace, start_offset);
    }

    fn require_ws(&mut self) -> ParseResult<()> {
        if !self.rest().starts_with(is_ecmascript_whitespace) {
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
