//! A recursive-descent / precedence-climbing parser for the JavaScript subset the pipeline
//! supports, writing into an [`SyntaxTree`] through its builder methods.
//!
//! TypeScript is accepted where Svelte components use it: type annotations on bindings, parameters
//! and return types, `as` / `satisfies` / `!`, `import type`, and `type` / `interface` / `declare`
//! statements. Types are not parsed into nodes; their spans are recorded
//! ([`SyntaxTree::typescript`], [`crate::syntax_tree::Tag::TypeScriptDeclaration`]) so compilation
//! drops them and source-preserving consumers (the type-check projection) copy them verbatim.
//!
//! Anything outside the subset is a [`ParseError`], never a panic.

use rsvelte_kernel::source::positions::Span;

use crate::lexer::{LexedToken, Lexer, LexicalError, T, decode_string};
use crate::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};
use crate::syntax_tree::{
    Kind, NodeIdentifier, SyntaxTree, TypeRef, TypeScriptFeature, TypeScriptKind,
    TypeScriptRuntime, TypeScriptSyntax, flag,
};

#[derive(Debug, Clone)]
pub struct ParseError {
    pub message: String,
    pub span: Span,
}

impl From<LexicalError> for ParseError {
    fn from(e: LexicalError) -> Self {
        Self {
            message: e.message,
            span: e.span,
        }
    }
}

type R<T> = Result<T, ParseError>;

#[derive(Debug)]
pub struct Parser<'a, 'b> {
    source_text: &'a str,
    lex: Lexer<'a>,
    token: LexedToken,
    prev_end: u32,
    /// The token before [`Parser::token`].
    prev: LexedToken,
    /// Inside type syntax: identifiers the parser consumes are noted in
    /// [`SyntaxTree::type_references`].
    in_type: u32,
    syntax_tree: &'b mut SyntaxTree,
    typescript: bool,
    allow_in: bool,
    end: u32,
    /// [`SyntaxTree::scratch`]'s length when this parse began.
    base: usize,
}

/// A failed parse leaves its open lists on the scratch stack; they go with it.
impl Drop for Parser<'_, '_> {
    fn drop(&mut self) {
        self.syntax_tree.scratch.truncate(self.base);
    }
}

/// A list being gathered on [`SyntaxTree::scratch`]. Lists nest, so the one opened last is on top,
/// and gathering one allocates nothing: the items are copied into the tree when the node is built.
#[derive(Clone, Copy)]
struct List(usize);

/// Parses `range` of `source_text` as a module body.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error, or at syntax this parser does not support.
pub fn parse_program(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<NodeIdentifier> {
    // Svelte components average a token per 4.8 bytes (the lossless corpus test prints both).
    syntax_tree.tokens.reserve(range.len() as usize / 4);
    let mut p = Parser::new(syntax_tree, source_text, range, typescript)?;
    let body = p.open();
    while p.token.t != T::Eof {
        let s = p.statement()?;
        p.item(s);
    }
    let program = p.close(body, |syntax_tree, body| syntax_tree.program(body, range));
    p.done();
    Ok(program)
}

/// Parses `range` of `source_text` as exactly one expression.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error, or if a token follows the expression.
pub fn parse_expression(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<NodeIdentifier> {
    let mut p = Parser::new(syntax_tree, source_text, range, typescript)?;
    let e = p.expression()?;
    if p.token.t != T::Eof {
        return p.fail("unexpected token after expression");
    }
    p.done();
    Ok(e)
}

/// Parses `range` of `source_text` as a comma-separated list of parameters without the parentheses
/// (`a, { b }, c = 1`): the names an embedding language's syntax declares, like Vue's `v-for`
/// alias.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error, or if a token follows the list.
pub fn parse_parameters(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<Vec<NodeIdentifier>> {
    let mut p = Parser::new(syntax_tree, source_text, range, typescript)?;
    let mut parameters = Vec::new();
    while p.token.t != T::Eof {
        parameters.push(p.param()?);
        if !p.eat(T::Comma)? {
            break;
        }
    }
    if p.token.t != T::Eof {
        return p.fail("unexpected token after parameters");
    }
    p.done();
    Ok(parameters)
}

/// Parses the longest expression starting at `start` and returns it with the start of the next
/// token.
///
/// Reads no further than `limit`. Embedding languages use this to find where an
/// expression ends: `{count}` ends where the parser stops, not at a brace found by scanning.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error before the expression ends.
pub fn parse_expression_prefix(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    start: u32,
    limit: u32,
    typescript: bool,
) -> R<(NodeIdentifier, u32)> {
    let mut p = Parser::new(
        syntax_tree,
        source_text,
        Span::new(start, limit),
        typescript,
    )?;
    let e = p.expression()?;
    let next = if p.token.t == T::Eof {
        limit
    } else {
        p.token.span.start_offset
    };
    p.done();
    Ok((e, next))
}

/// Parses the `let` or `const` declaration starting at `start` (no `;`) and returns it with the
/// start of the next token, like [`parse_expression_prefix`].
///
/// Svelte's `{let a = 1}` tag ends where the declaration does.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error before the declaration ends.
pub fn parse_declaration_prefix(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    start: u32,
    limit: u32,
    typescript: bool,
) -> R<(NodeIdentifier, u32)> {
    let mut p = Parser::new(
        syntax_tree,
        source_text,
        Span::new(start, limit),
        typescript,
    )?;
    let d = p.var_declaration()?;
    let next = if p.token.t == T::Eof {
        limit
    } else {
        p.token.span.start_offset
    };
    p.done();
    Ok((d, next))
}

/// Identifiers in type syntax that are never a binding's name.
const TYPE_KEYWORDS: &[&str] = &[
    "any",
    "asserts",
    "bigint",
    "boolean",
    "extends",
    "false",
    "infer",
    "is",
    "keyof",
    "never",
    "null",
    "number",
    "object",
    "readonly",
    "string",
    "symbol",
    "this",
    "true",
    "undefined",
    "unique",
    "unknown",
    "void",
];

const RESERVED: &[&str] = &[
    "break", "case", "catch", "class", "continue", "debugger", "default", "do", "else", "enum",
    "export", "extends", "finally", "for", "if", "import", "return", "super", "switch", "throw",
    "try", "while", "with", "yield",
];

impl<'a, 'b> Parser<'a, 'b> {
    fn new(
        syntax_tree: &'b mut SyntaxTree,
        source_text: &'a str,
        range: Span,
        typescript: bool,
    ) -> R<Self> {
        let mut lex = Lexer::new(
            source_text,
            range.start_offset as usize,
            range.end_offset as usize,
        );
        let token = lex.next(&mut syntax_tree.comments)?;
        Ok(Parser {
            source_text,
            lex,
            token,
            prev_end: range.start_offset,
            prev: LexedToken {
                t: T::Eof,
                span: Span::new(range.start_offset, range.start_offset),
                newline_before: false,
            },
            in_type: 0,
            base: syntax_tree.scratch.len(),
            syntax_tree,
            typescript,
            allow_in: true,
            end: range.end_offset,
        })
    }

    fn fail<X>(&self, message: impl Into<String>) -> R<X> {
        Err(ParseError {
            message: message.into(),
            span: self.token.span,
        })
    }

    #[inline]
    fn text(&self, t: LexedToken) -> &'a str {
        t.span.text(self.source_text)
    }

    /// Checks, where a parse succeeds, that it closed every list it opened.
    fn done(&self) {
        debug_assert_eq!(
            self.syntax_tree.scratch.len(),
            self.base,
            "a list was left open"
        );
    }

    const fn open(&self) -> List {
        List(self.syntax_tree.scratch.len())
    }

    fn item(&mut self, identifier: NodeIdentifier) {
        self.syntax_tree.scratch.push(identifier);
    }

    /// `build` makes the node that holds `list`'s items, which are then popped.
    fn close<N>(
        &mut self,
        list: List,
        build: impl FnOnce(&mut SyntaxTree, &[NodeIdentifier]) -> N,
    ) -> N {
        let scratch = std::mem::take(&mut self.syntax_tree.scratch);
        let node = build(self.syntax_tree, &scratch[list.0..]);
        self.syntax_tree.scratch = scratch;
        self.drop_list(list);
        node
    }

    /// Abandons `list` without building anything from it.
    fn drop_list(&mut self, list: List) {
        debug_assert!(
            list.0 <= self.syntax_tree.scratch.len(),
            "lists close innermost first"
        );
        self.syntax_tree.scratch.truncate(list.0);
    }

    /// `...a` or `a`, in an argument list or an array.
    fn assignment_or_spread(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        if self.eat(T::Ellipsis)? {
            let a = self.assignment()?;
            Ok(self.syntax_tree.spread(a, self.span_from(start_offset)))
        } else {
            self.assignment()
        }
    }

    fn bump(&mut self) -> R<LexedToken> {
        let t = self.token;
        self.syntax_tree.tokens.push(t.t, t.span);
        self.prev_end = t.span.end_offset;
        self.token = self.lex.next(&mut self.syntax_tree.comments)?;
        if self.in_type > 0 && t.t == T::Identifier && self.names_a_binding(t) {
            let name = self.syntax_tree.atoms.intern(self.text(t));
            self.syntax_tree
                .type_references
                .push(TypeRef { name, span: t.span });
        }
        self.prev = t;
        Ok(t)
    }

    /// Whether identifier `t`, just consumed inside a type, can refer to a binding: not a keyword,
    /// a qualified name's member (`N.A`), a declared name (`type A`), or a member key (`{ a: T }`,
    /// `(a: T) => U`).
    fn names_a_binding(&self, t: LexedToken) -> bool {
        if TYPE_KEYWORDS.contains(&self.text(t)) {
            return false;
        }
        let prev = self.prev;
        match prev.t {
            T::Dot => return false,
            T::Identifier
                if matches!(
                    self.text(prev),
                    "type" | "interface" | "enum" | "namespace" | "module"
                ) =>
            {
                return false;
            }
            _ => {}
        }
        let key_position = matches!(
            prev.t,
            T::LBrace | T::LParen | T::Comma | T::Semi | T::Ellipsis
        ) || (prev.t == T::Identifier && self.text(prev) == "readonly");
        let before_colon = match self.token.t {
            T::Colon | T::LParen => true,
            T::Question => self.peek().t == T::Colon,
            _ => false,
        };
        !(key_position && before_colon)
    }

    #[inline]
    fn is_op(&self, s: &str) -> bool {
        self.token.t == T::Op && self.text(self.token) == s
    }

    #[inline]
    fn is_kw(&self, s: &str) -> bool {
        self.token.t == T::Identifier && self.text(self.token) == s
    }

    fn eat(&mut self, t: T) -> R<bool> {
        if self.token.t == t {
            self.bump()?;
            return Ok(true);
        }
        Ok(false)
    }

    fn eat_op(&mut self, s: &str) -> R<bool> {
        if self.is_op(s) {
            self.bump()?;
            return Ok(true);
        }
        Ok(false)
    }

    fn expect(&mut self, t: T, what: &str) -> R<LexedToken> {
        if self.token.t != t {
            return self.fail(format!("expected `{what}`"));
        }
        self.bump()
    }

    const fn span_from(&self, start_offset: u32) -> Span {
        Span::new(start_offset, self.prev_end)
    }

    /// A peek at the token after the current one.
    fn peek(&self) -> LexedToken {
        let mut l = self.lex;
        let mut scratch = Vec::new();
        l.next(&mut scratch).unwrap_or_else(|_| LexedToken {
            t: T::Eof,
            span: Span::new(self.end, self.end),
            newline_before: false,
        })
    }

    fn semicolon(&mut self) -> R<()> {
        if self.eat(T::Semi)?
            || self.token.t == T::RBrace
            || self.token.t == T::Eof
            || self.token.newline_before
        {
            return Ok(());
        }
        self.fail("expected `;`")
    }
}

mod classes;
mod control;
mod expressions;
mod literals;
mod lookahead;
mod members;
mod patterns;
mod statements;
mod typescript;
