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
mod options;
pub use javascript::javascript_failure;
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

/// The TypeScript grammar rules oxc checks and acorn-typescript, upstream's parser, does not.
///
/// Upstream compiles each one, or rejects it later as `typescript_invalid_feature` (1147, 1194).
/// An optional rest parameter (1047) is not one: acorn rejects it in a function with a body.
pub const ACORN_UNCHECKED_TYPESCRIPT_RULES: &[&str] = &[
    "1015", "1016", "1021", "1038", "1051", "1093", "1094", "1095", "1147", "1194", "1221", "1222",
    "1263", "1264", "2368", "2681", "5085",
];

/// # Errors
///
/// A [`Diagnostic`] at the first syntax error in the markup or the scripts, with upstream's
/// code, message and position, or `parse_error` at syntax this parser does not support. A style
/// sheet's error alone is kept on [`Style::sheet`](crate::syntax_tree::Style::sheet);
/// [`crate::fully_parsed`] reports it.
pub fn parse(source_text: &str) -> ParseResult<Component> {
    parse_with(source_text, true)
}

/// The component as svelte2tsx parses it: with each script's content left out, so a script's
/// syntax is TypeScript's to report. Each script's program is empty.
///
/// # Errors
///
/// As [`parse`], for the markup.
pub fn parse_without_scripts(source_text: &str) -> ParseResult<Component> {
    parse_with(source_text, false)
}

fn parse_with(source_text: &str, scripts: bool) -> ParseResult<Component> {
    let (javascript, template) = Tree::build(source_text, |builder| {
        builder.leave_unchecked(ACORN_UNCHECKED_TYPESCRIPT_RULES);
        let mut parser = Parser {
            source_text: builder.source_text(),
            position: 0,
            builder,
            component: Template::new(source_text.len()),
            // The script's language decides how template expressions parse, so read it first.
            typescript: script::script_is_typescript(source_text),
            pending_children: buffer_pool::take_keyed::<Parser<'static, 'static>, _>(),
            unique_names: FxHashSet::default(),
            meta_tags: 0,
            depth: 0,
            scripts,
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
                .unwrap_or_else(|| acorn_position(e))
        })?;
        Ok(parser.component)
    })?;
    let component = template.into_component(javascript);
    // Upstream reads the options once the template is parsed; a style sheet's error comes first.
    if component.style_error().is_none() {
        options::read_options(&component, source_text)?;
    }
    Ok(component)
}

/// Whether `offset` is in the content of a `<script>` element, which svelte-eslint-parser
/// parses itself.
#[must_use]
pub fn in_script_content(source_text: &str, offset: u32) -> bool {
    script::in_script_content(source_text, offset as usize)
}

/// oxc's error, under the code and in the words upstream gives a JavaScript syntax error. It
/// keeps oxc's range, which the parser reads; [`parse`] reports Acorn's position.
#[cold]
fn javascript_error(e: Diagnostic) -> Diagnostic {
    let Diagnostic { message, span, .. } = e;
    svelte_error("js_parse_error", acorn_message(&message), span)
}

/// Acorn reports a JavaScript syntax error at a position, not a range.
#[cold]
fn acorn_position(mut e: Diagnostic) -> Diagnostic {
    if e.code == "js_parse_error" {
        e.span = Span::new(e.span.start_offset, e.span.start_offset);
    }
    e
}

/// Acorn's wording of the oxc errors that mean the same thing.
fn acorn_message(message: &str) -> std::borrow::Cow<'_, str> {
    if let Some(character) = message
        .strip_prefix("Invalid Character `")
        .and_then(|rest| rest.strip_suffix('`'))
    {
        return format!("Unexpected character '{character}'").into();
    }
    let unexpected = message == "Unexpected JSX expression"
        || message.starts_with("Expected `") && message.contains("` but found `");
    match message {
        _ if unexpected => "Unexpected token".into(),
        "Cannot assign to this expression" => "Assigning to rvalue".into(),
        "Unterminated string" => "Unterminated string constant".into(),
        _ => message.into(),
    }
}

/// Upstream's error `code`, whose message ends with the link to its docs; an error of this
/// parser's own, `parse_error`, has no docs page.
#[cold]
fn svelte_error(code: &'static str, message: impl std::fmt::Display, span: Span) -> Diagnostic {
    let message = if code == "parse_error" {
        message.to_string()
    } else {
        format!("{message}\nhttps://svelte.dev/e/{code}")
    };
    Diagnostic::error(code, message, span)
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

    fn into_component(mut self, javascript: Tree) -> Component {
        Component {
            javascript,
            nodes: std::mem::take(&mut self.nodes),
            children: std::mem::take(&mut self.children),
            attributes: std::mem::take(&mut self.attributes),
            parts: std::mem::take(&mut self.parts),
            modifiers: std::mem::take(&mut self.modifiers),
            debug_identifiers: std::mem::take(&mut self.debug_identifiers),
            root: self.root,
            module: self.module.take(),
            instance: self.instance.take(),
            style: self.style.take(),
            tokens: std::mem::take(&mut self.tokens),
        }
    }
}

/// A component that does not parse gives its buffers back, as a parsed one does when dropped.
impl Drop for Template {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Component, _>(std::mem::take(&mut self.nodes));
        buffer_pool::give_keyed::<Component, _>(std::mem::take(&mut self.children));
        buffer_pool::give_keyed::<Component, _>(std::mem::take(&mut self.attributes));
        buffer_pool::give_keyed::<Component, _>(std::mem::take(&mut self.parts));
        buffer_pool::give_keyed::<Component, _>(std::mem::take(&mut self.modifiers));
        buffer_pool::give_keyed::<Component, _>(std::mem::take(&mut self.debug_identifiers));
    }
}

/// What closes the fragment being read.
#[derive(Clone, Copy)]
enum End<'a> {
    Eof,
    /// The children of the element or block that starts at `start`.
    Tag {
        name: &'a str,
        regular: bool,
        start: u32,
    },
    Block {
        start: u32,
    },
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
    /// The root-only meta tags read so far, one bit each; upstream allows each once.
    meta_tags: u8,
    /// How many fragments are open.
    depth: u32,
    /// Whether each script's content is parsed.
    scripts: bool,
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

    /// Upstream's error `code` at the current position. Upstream trims the component's trailing
    /// whitespace before it parses, so no position is past that end.
    #[cold]
    fn err<T>(&self, code: &'static str, message: impl std::fmt::Display) -> ParseResult<T> {
        let at = self.position.min(self.trimmed_end()) as u32;
        Self::err_at(Span::new(at, at), code, message)
    }

    /// The end of the component without its trailing whitespace.
    fn trimmed_end(&self) -> usize {
        self.source_text
            .trim_end_matches(is_ecmascript_whitespace)
            .len()
    }

    #[cold]
    fn err_at<T>(
        span: Span,
        code: &'static str,
        message: impl std::fmt::Display,
    ) -> ParseResult<T> {
        Err(svelte_error(code, message, span))
    }

    /// Upstream's `expected_token`, which its `eat(token, true)` raises.
    #[cold]
    fn expected_token<T>(&self, token: &str) -> ParseResult<T> {
        self.err("expected_token", format_args!("Expected token {token}"))
    }

    /// Upstream's `unexpected_eof`, at the end of the component without its trailing whitespace,
    /// which upstream trims before it parses.
    /// Upstream `match_bracket`'s error for the brackets that start here.
    #[cold]
    fn unmatched<T>(&self, why: identifier::Unmatched) -> ParseResult<T> {
        let at = |offset: usize| {
            let at = (self.position + offset) as u32;
            Span::new(at, at)
        };
        match why {
            identifier::Unmatched::End => self.unexpected_eof(),
            identifier::Unmatched::Quote(offset) => Self::err_at(
                at(offset),
                "unterminated_string_constant",
                "Unterminated string constant",
            ),
            identifier::Unmatched::Bracket {
                at: offset,
                expected,
            } => Self::err_at(
                at(offset),
                "expected_token",
                format_args!("Expected token {}", char::from(expected)),
            ),
        }
    }

    #[cold]
    fn unexpected_eof<T>(&self) -> ParseResult<T> {
        let end = self.trimmed_end() as u32;
        Self::err_at(
            Span::new(end, end),
            "unexpected_eof",
            "Unexpected end of input",
        )
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

    /// Upstream's `require_whitespace`, over the input without its trailing whitespace.
    fn require_ws(&mut self) -> ParseResult<()> {
        if self.position >= self.trimmed_end() || !self.rest().starts_with(is_ecmascript_whitespace)
        {
            return self.err("expected_whitespace", "Expected whitespace");
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
