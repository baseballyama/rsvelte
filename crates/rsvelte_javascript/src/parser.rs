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

    // ---- statements
    // ------------------------------------------------------------------------------

    fn statement(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        match self.token.t {
            T::LBrace => return self.block(),
            T::Semi => {
                self.bump()?;
                return Ok(self.syntax_tree.empty(self.span_from(start_offset)));
            }
            T::Identifier => {}
            _ => return self.expression_statement(),
        }
        let kw = self.text(self.token);
        match kw {
            "import" if !matches!(self.peek().t, T::LParen | T::Dot) => self.import(),
            "export" => self.export(),
            "let" | "const" | "var" => {
                let d = self.var_declaration()?;
                self.semicolon()?;
                Ok(d)
            }
            "function" => self.function(true, start_offset, false),
            "async"
                if self.peek().t == T::Identifier
                    && self.text(self.peek()) == "function"
                    && !self.peek().newline_before =>
            {
                self.bump()?;
                self.function(true, start_offset, true)
            }
            "return" => {
                self.bump()?;
                let arg = if matches!(self.token.t, T::Semi | T::RBrace | T::Eof)
                    || self.token.newline_before
                {
                    None
                } else {
                    Some(self.expression()?)
                };
                self.semicolon()?;
                Ok(self.syntax_tree.return_(arg, self.span_from(start_offset)))
            }
            "if" => {
                self.bump()?;
                self.expect(T::LParen, "(")?;
                let test = self.expression()?;
                self.expect(T::RParen, ")")?;
                let consequent = self.statement()?;
                let alternate = if self.is_kw("else") {
                    self.bump()?;
                    Some(self.statement()?)
                } else {
                    None
                };
                Ok(self
                    .syntax_tree
                    .if_(test, consequent, alternate, self.span_from(start_offset)))
            }
            "type" | "interface" | "declare" | "abstract" | "enum" | "namespace" | "module"
                if self.typescript
                    && self.peek().t == T::Identifier
                    && !self.peek().newline_before =>
            {
                self.typescript_declaration(start_offset)
            }
            _ if RESERVED.contains(&kw) => self.fail(format!("unsupported statement `{kw}`")),
            _ => self.expression_statement(),
        }
    }

    fn expression_statement(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let e = self.expression()?;
        self.semicolon()?;
        Ok(self
            .syntax_tree
            .expression_statement_at(e, self.span_from(start_offset)))
    }

    fn block(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.expect(T::LBrace, "{")?;
        let body = self.open();
        while self.token.t != T::RBrace {
            if self.token.t == T::Eof {
                return self.fail("unterminated block");
            }
            let s = self.statement()?;
            self.item(s);
        }
        self.bump()?;
        let span = self.span_from(start_offset);
        Ok(self.close(body, |syntax_tree, body| syntax_tree.block(body, span)))
    }

    fn var_declaration(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let kw = self.bump()?;
        let kind = match self.text(kw) {
            "let" => flag::LET,
            "const" => flag::CONST,
            _ => flag::VAR,
        };
        let declarations = self.open();
        loop {
            let dlo = self.token.span.start_offset;
            let identifier = self.binding_target()?;
            self.maybe_type_annotation(identifier)?;
            let initializer = if self.eat_op("=")? {
                Some(self.assignment()?)
            } else {
                None
            };
            let d = self
                .syntax_tree
                .declarator(identifier, initializer, self.span_from(dlo));
            self.item(d);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        let span = self.span_from(start_offset);
        Ok(self.close(declarations, |syntax_tree, declarations| {
            syntax_tree.var_declaration(kind, declarations, span)
        }))
    }

    fn function(
        &mut self,
        declaration: bool,
        start_offset: u32,
        is_async: bool,
    ) -> R<NodeIdentifier> {
        self.bump()?; // `function`
        if self.is_op("*") {
            return self.fail("generator functions are not supported");
        }
        let name = if self.token.t == T::Identifier {
            let t = self.bump()?;
            Some(self.syntax_tree.ident(self.text(t), t.span))
        } else if declaration {
            return self.fail("expected function name");
        } else {
            None
        };
        let type_parameters = self.maybe_type_parameters()?;
        let parameters = self.parameters()?;
        let ret = self.maybe_return_type(false)?;
        let body = self.block()?;
        let span = self.span_from(start_offset);
        let f = self.close(parameters, |syntax_tree, parameters| {
            syntax_tree.function(declaration, name, parameters, body, is_async, span)
        });
        self.signature_typescript(f, type_parameters, ret);
        Ok(f)
    }

    fn parameters(&mut self) -> R<List> {
        self.expect(T::LParen, "(")?;
        let parameters = self.open();
        while self.token.t != T::RParen {
            let p = self.param()?;
            self.item(p);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RParen, ")")?;
        Ok(parameters)
    }

    fn param(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        if self.eat(T::Ellipsis)? {
            let arg = self.binding_target()?;
            self.maybe_type_annotation(arg)?;
            return Ok(self.syntax_tree.rest(arg, self.span_from(start_offset)));
        }
        let target = self.binding_target()?;
        if self.typescript && self.token.t == T::Question {
            let q = self.bump()?;
            self.typescript(target, TypeScriptKind::Optional, q.span);
        }
        self.maybe_type_annotation(target)?;
        if self.eat_op("=")? {
            let d = self.assignment()?;
            return Ok(self
                .syntax_tree
                .assign_pat(target, d, self.span_from(start_offset)));
        }
        Ok(target)
    }

    fn import(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.bump()?;
        let type_only = if self.typescript
            && self.is_kw("type")
            && !matches!(self.peek().t, T::Comma)
            && !(self.peek().t == T::Identifier && self.text(self.peek()) == "from")
        {
            self.bump()?;
            true
        } else {
            false
        };
        let specs = self.open();
        if self.token.t != T::String {
            if self.token.t == T::Identifier {
                let t = self.bump()?;
                let local = self.syntax_tree.ident(self.text(t), t.span);
                let spec = self.syntax_tree.import_default(local, t.span);
                self.item(spec);
                self.eat(T::Comma)?;
            }
            if self.is_op("*") {
                let slo = self.token.span.start_offset;
                self.bump()?;
                if !self.is_kw("as") {
                    return self.fail("expected `as`");
                }
                self.bump()?;
                let t = self.expect(T::Identifier, "identifier")?;
                let local = self.syntax_tree.ident(self.text(t), t.span);
                let spec = self
                    .syntax_tree
                    .import_namespace(local, self.span_from(slo));
                self.item(spec);
            } else if self.token.t == T::LBrace {
                self.bump()?;
                while self.token.t != T::RBrace {
                    let slo = self.token.span.start_offset;
                    let spec_type = if self.typescript
                        && self.is_kw("type")
                        && self.peek().t == T::Identifier
                        && self.text(self.peek()) != "as"
                    {
                        self.bump()?;
                        true
                    } else {
                        false
                    };
                    let t = self.bump()?;
                    let imported = match t.t {
                        T::Identifier => self.syntax_tree.ident(self.text(t), t.span),
                        T::String => self.string_node(t),
                        _ => return self.fail("expected import name"),
                    };
                    let local = if self.is_kw("as") {
                        self.bump()?;
                        let l = self.expect(T::Identifier, "identifier")?;
                        self.syntax_tree.ident(self.text(l), l.span)
                    } else if t.t == T::Identifier {
                        self.syntax_tree.ident(self.text(t), t.span)
                    } else {
                        return self.fail("string import names need `as`");
                    };
                    let spec = self.syntax_tree.import_named(
                        imported,
                        local,
                        spec_type,
                        self.span_from(slo),
                    );
                    self.item(spec);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBrace, "}")?;
            }
            if !self.is_kw("from") {
                return self.fail("expected `from`");
            }
            self.bump()?;
        }
        let s = self.expect(T::String, "module specifier")?;
        let source = self.string_node(s);
        self.semicolon()?;
        let span = self.span_from(start_offset);
        Ok(self.close(specs, |syntax_tree, specs| {
            syntax_tree.import(specs, source, type_only, span)
        }))
    }

    fn export(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.bump()?;
        if self.is_kw("default") {
            self.bump()?;
            let e = if self.is_kw("function") {
                let flo = self.token.span.start_offset;
                self.function(false, flo, false)?
            } else {
                let e = self.assignment()?;
                self.semicolon()?;
                e
            };
            return Ok(self
                .syntax_tree
                .export_default(e, self.span_from(start_offset)));
        }
        if self.typescript
            && (self.is_kw("type") || self.is_kw("interface") || self.is_kw("enum"))
            && self.peek().t == T::Identifier
        {
            let d = self.typescript_declaration(self.token.span.start_offset)?;
            return Ok(self
                .syntax_tree
                .export_named(d, self.span_from(start_offset)));
        }
        let declaration = match self.token.t {
            T::Identifier if matches!(self.text(self.token), "let" | "const" | "var") => {
                let d = self.var_declaration()?;
                self.semicolon()?;
                d
            }
            T::Identifier if self.text(self.token) == "function" => {
                let flo = self.token.span.start_offset;
                self.function(true, flo, false)?
            }
            _ => return self.fail("unsupported export form"),
        };
        Ok(self
            .syntax_tree
            .export_named(declaration, self.span_from(start_offset)))
    }

    /// `type X = …`, `interface X {…}`, `declare …`, `enum …`, `namespace …`: skipped as one
    /// opaque statement. An enum, or a namespace holding values, also goes to
    /// [`SyntaxTree::ts_runtime`].
    fn typescript_declaration(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let kw = self.text(self.token);
        if kw == "abstract" {
            return self.fail("unsupported statement `abstract class`");
        }
        let is_interface = kw == "interface";
        let is_namespace = matches!(kw, "namespace" | "module");
        self.bump()?;
        let is_enum = kw == "enum" || (kw == "declare" && self.is_kw("enum"));
        let mut body: Option<(u32, u32)> = None;
        if is_interface {
            if let Some(i) = self.typescript_interface(start_offset)? {
                return Ok(i);
            }
            self.in_type += 1;
            while self.token.t != T::LBrace {
                if self.token.t == T::Eof {
                    return self.fail("unterminated interface");
                }
                self.bump()?;
            }
            self.in_type -= 1;
            self.skip_balanced()?;
        } else {
            let mut depth = 0i32;
            self.in_type += 1;
            loop {
                match self.token.t {
                    T::Eof => break,
                    T::LBrace if depth == 0 && body.is_none() => {
                        body = Some((self.token.span.end_offset, self.token.span.end_offset));
                        depth += 1;
                    }
                    T::LParen | T::LBrace | T::LBracket => depth += 1,
                    T::RParen | T::RBrace | T::RBracket => {
                        if depth == 0 {
                            break;
                        }
                        depth -= 1;
                        if let (0, Some((open, _))) = (depth, body) {
                            body = Some((open, self.token.span.start_offset));
                        }
                        if depth == 0 && self.peek().newline_before && self.peek().t != T::Op {
                            self.bump()?;
                            break;
                        }
                    }
                    T::Semi if depth == 0 => break,
                    _ if depth == 0
                        && self.token.newline_before
                        && self.prev_end > start_offset
                        && !self.continues_type() =>
                    {
                        break;
                    }
                    _ => {}
                }
                self.bump()?;
            }
            self.in_type -= 1;
            self.eat(T::Semi)?;
        }
        let span = self.span_from(start_offset);
        if is_enum {
            self.syntax_tree.typescript_runtime.push(TypeScriptRuntime {
                feature: TypeScriptFeature::Enum,
                span,
            });
        } else if let (true, Some((open, close))) = (is_namespace, body) {
            self.namespace_runtime(Span::new(open, close), span)?;
        }
        Ok(self.syntax_tree.typescript_declaration(span))
    }

    /// Records the first construct in a namespace body that erasing types cannot remove: an enum
    /// anywhere inside it, else the namespace itself when any statement is not a type declaration.
    /// The body is parsed into a scratch tree, so none of its nodes join this one.
    fn namespace_runtime(&mut self, body: Span, span: Span) -> R<()> {
        let mut scratch = SyntaxTree::new();
        let root = parse_program(&mut scratch, self.source_text, body, true)?;
        if let Some(&inner) = scratch.typescript_runtime.first() {
            self.syntax_tree.typescript_runtime.push(inner);
            return Ok(());
        }
        let Kind::Program(statements) = scratch.kind(root) else {
            unreachable!("parse_program returns a program")
        };
        let type_only = |n: NodeIdentifier| {
            matches!(
                scratch.kind(n),
                Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. }
            )
        };
        let values = statements.iter().any(|&s| match scratch.kind(s) {
            Kind::ExportNamed(d) => !type_only(d),
            _ => !type_only(s),
        });
        if values {
            self.syntax_tree.typescript_runtime.push(TypeScriptRuntime {
                feature: TypeScriptFeature::NamespaceWithValues,
                span,
            });
        }
        Ok(())
    }

    /// `interface Name { key?: T; … }` with only property members, positioned after `interface`.
    /// `None` (having consumed up to the point of doubt) when the interface has any other shape;
    /// the caller then skips the rest as an opaque declaration.
    fn typescript_interface(&mut self, start_offset: u32) -> R<Option<NodeIdentifier>> {
        if self.token.t != T::Identifier || self.peek().t != T::LBrace {
            return Ok(None);
        }
        let t = self.bump()?;
        let name = self.syntax_tree.ident(self.text(t), t.span);
        self.bump()?; // `{`
        let members = self.open();
        while self.token.t != T::RBrace {
            let Some(m) = self.typescript_prop_sig()? else {
                self.drop_list(members);
                return self.opaque_body_rest(start_offset).map(Some);
            };
            self.item(m);
        }
        self.bump()?; // `}`
        let span = self.span_from(start_offset);
        Ok(Some(self.close(members, |syntax_tree, members| {
            syntax_tree.typescript_interface(name, members, span)
        })))
    }

    /// `key?: T;` inside an interface body; `None` at the first token of any other member shape.
    fn typescript_prop_sig(&mut self) -> R<Option<NodeIdentifier>> {
        let k = self.token;
        if k.t != T::Identifier
            || self.is_kw("readonly")
            || !matches!(self.peek().t, T::Colon | T::Question)
        {
            return Ok(None);
        }
        self.bump()?;
        let key = self.syntax_tree.ident(self.text(k), k.span);
        let optional = self.eat(T::Question)?;
        if self.token.t != T::Colon {
            return Ok(None);
        }
        let m = self.syntax_tree.typescript_prop_sig(key, optional, k.span);
        self.maybe_type_annotation(m)?;
        let terminated = self.eat(T::Semi)?
            || self.eat(T::Comma)?
            || self.token.newline_before
            || self.token.t == T::RBrace;
        Ok(terminated.then_some(m))
    }

    /// Skips to the `}` closing a body whose `{` is already consumed; the declaration is opaque.
    fn opaque_body_rest(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let mut depth = 1i32;
        self.in_type += 1;
        loop {
            match self.token.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Eof => return self.fail("unbalanced brackets"),
                _ => {}
            }
            self.bump()?;
            if depth == 0 {
                self.in_type -= 1;
                return Ok(self
                    .syntax_tree
                    .typescript_declaration(self.span_from(start_offset)));
            }
        }
    }

    /// A token at the start of a line that still belongs to a type (`| B`, `& C`, `= …`).
    fn continues_type(&self) -> bool {
        self.token.t == T::Op && matches!(self.text(self.token), "|" | "&" | "=")
    }

    fn skip_balanced(&mut self) -> R<()> {
        let mut depth = 0i32;
        self.in_type += 1;
        loop {
            match self.token.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Eof => return self.fail("unbalanced brackets"),
                _ => {}
            }
            self.bump()?;
            if depth == 0 {
                self.in_type -= 1;
                return Ok(());
            }
        }
    }

    fn maybe_type_annotation(&mut self, target: NodeIdentifier) -> R<()> {
        if self.typescript && self.token.t == T::Colon {
            self.bump()?;
            let start_offset = self.token.span.start_offset;
            self.skip_type(false)?;
            self.typescript(
                target,
                TypeScriptKind::Annotation,
                Span::new(start_offset, self.prev_end),
            );
        }
        Ok(())
    }

    fn typescript(&mut self, node: NodeIdentifier, kind: TypeScriptKind, span: Span) {
        self.syntax_tree
            .typescript
            .push(TypeScriptSyntax { node, kind, span });
    }

    /// `: T` after a parameter list; the span is recorded once the function node exists.
    fn maybe_return_type(&mut self, stop_at_arrow: bool) -> R<Option<Span>> {
        if !(self.typescript && self.token.t == T::Colon) {
            return Ok(None);
        }
        self.bump()?;
        let start_offset = self.token.span.start_offset;
        self.skip_type(stop_at_arrow)?;
        Ok(Some(Span::new(start_offset, self.prev_end)))
    }

    fn maybe_type_parameters(&mut self) -> R<Option<Span>> {
        if !(self.typescript && self.is_op("<")) {
            return Ok(None);
        }
        let start_offset = self.token.span.start_offset;
        self.skip_type_parameters()?;
        Ok(Some(Span::new(start_offset, self.prev_end)))
    }

    fn signature_typescript(
        &mut self,
        f: NodeIdentifier,
        type_parameters: Option<Span>,
        ret: Option<Span>,
    ) {
        if let Some(s) = type_parameters {
            self.typescript(f, TypeScriptKind::TypeParameters, s);
        }
        if let Some(s) = ret {
            self.typescript(f, TypeScriptKind::ReturnType, s);
        }
    }

    /// `<T>` between a callee and its arguments, recorded on the callee. `false`, consuming
    /// nothing, when the `<` is a comparison.
    fn maybe_type_arguments(&mut self, callee: NodeIdentifier) -> R<bool> {
        if !(self.typescript && self.is_op("<") && self.type_arguments_before_call()) {
            return Ok(false);
        }
        let start_offset = self.token.span.start_offset;
        self.skip_type_parameters()?;
        self.typescript(
            callee,
            TypeScriptKind::TypeArgs,
            Span::new(start_offset, self.prev_end),
        );
        Ok(true)
    }

    /// Whether the `<` here opens a type argument list that a `(` follows. TypeScript reads
    /// `f<T>(x)` as a call with type arguments where JavaScript reads two comparisons; outside
    /// brackets, a token no type can contain means a comparison.
    fn type_arguments_before_call(&self) -> bool {
        let mut l = self.lex;
        let mut scratch = Vec::new();
        let (mut angle, mut nest) = (1i32, 0i32);
        loop {
            let Ok(t) = l.next(&mut scratch) else {
                return false;
            };
            match t.t {
                T::Eof => return false,
                T::LParen | T::LBracket | T::LBrace => nest += 1,
                T::RParen | T::RBracket | T::RBrace => {
                    nest -= 1;
                    if nest < 0 {
                        return false;
                    }
                }
                T::Op => {
                    angle -= match self.text(t) {
                        "<" => -1,
                        ">" => 1,
                        ">>" => 2,
                        ">>>" => 3,
                        "|" | "&" | "-" => 0,
                        _ if nest > 0 => 0,
                        _ => return false,
                    };
                    if angle < 0 || (angle == 0 && nest != 0) {
                        return false;
                    }
                    if angle == 0 {
                        return l.next(&mut scratch).is_ok_and(|n| n.t == T::LParen);
                    }
                }
                T::Identifier
                | T::String
                | T::Number
                | T::Dot
                | T::Comma
                | T::Question
                | T::Colon
                | T::Arrow
                | T::Ellipsis => {}
                _ if nest > 0 => {}
                _ => return false,
            }
        }
    }

    fn skip_type_parameters(&mut self) -> R<()> {
        let mut depth = 0i32;
        self.in_type += 1;
        loop {
            if self.is_op("<") {
                depth += 1;
            } else if self.is_op(">") {
                depth -= 1;
            } else if self.is_op(">>") {
                depth -= 2;
            } else if self.is_op(">>>") {
                depth -= 3;
            } else if self.token.t == T::Eof {
                return self.fail("unterminated type parameters");
            }
            self.bump()?;
            if depth <= 0 {
                self.in_type -= 1;
                return Ok(());
            }
        }
    }

    /// Skips a type. Stops (without consuming) at a depth-0 `,` `)` `]` `}` `;` `=` `?` or EOF, at
    /// a depth-0 `=>` when `stop_at_arrow`, and at a line break that cannot continue the type.
    fn skip_type(&mut self, stop_at_arrow: bool) -> R<()> {
        let mut depth = 0i32;
        let start = self.token.span.start_offset;
        self.in_type += 1;
        loop {
            let t = self.token;
            if depth == 0 {
                let stop = match t.t {
                    T::Comma
                    | T::RParen
                    | T::RBracket
                    | T::RBrace
                    | T::Semi
                    | T::Eof
                    | T::Question => true,
                    T::Arrow => stop_at_arrow,
                    T::Op => matches!(self.text(t), "=" | "+=" | "-="),
                    T::LBrace if t.span.start_offset != start && !self.after_type_operator() => {
                        true
                    }
                    _ => t.newline_before && t.span.start_offset != start && !self.continues_type(),
                };
                if stop {
                    self.in_type -= 1;
                    return Ok(());
                }
            }
            match t.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Op => match self.text(t) {
                    "<" => depth += 1,
                    ">" => depth -= 1,
                    ">>" => depth -= 2,
                    ">>>" => depth -= 3,
                    _ => {}
                },
                _ => {}
            }
            self.bump()?;
        }
    }

    /// Whether the previous token makes a following `{` part of the type (`: {`, `| {`, `& {`,
    /// `<{`, `,{`).
    fn after_type_operator(&self) -> bool {
        let prev = self.source_text[..self.prev_end as usize].trim_end();
        prev.ends_with(['|', '&', '<', ',', ':', '(', '[', '='])
    }

    // ---- expressions
    // -----------------------------------------------------------------------------

    /// # Errors
    ///
    /// [`ParseError`] at the first lexical or syntax error.
    pub fn expression(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let first = self.assignment()?;
        if self.token.t != T::Comma {
            return Ok(first);
        }
        let mut items = vec![first];
        while self.eat(T::Comma)? {
            items.push(self.assignment()?);
        }
        Ok(self.syntax_tree.seq(&items, self.span_from(start_offset)))
    }

    fn assignment(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        if let Some(arrow) = self.try_arrow()? {
            return Ok(arrow);
        }
        let left = self.conditional()?;
        if self.token.t == T::Op
            && let Some(op) = AssignmentOperator::parse(self.text(self.token))
        {
            let target = self.check_assign_target(left, op)?;
            self.bump()?;
            let value = self.assignment()?;
            return Ok(self
                .syntax_tree
                .assign(op, target, value, self.span_from(start_offset)));
        }
        Ok(left)
    }

    fn check_assign_target(&self, e: NodeIdentifier, op: AssignmentOperator) -> R<NodeIdentifier> {
        match self.syntax_tree.kind(e) {
            Kind::Identifier(_) | Kind::Member { .. } => Ok(e),
            Kind::Object(_) | Kind::Array(_) if op == AssignmentOperator::Assign => {
                self.fail("destructuring assignment is not supported")
            }
            _ => self.fail("invalid assignment target"),
        }
    }

    /// Parses an arrow function if one starts here.
    fn try_arrow(&mut self) -> R<Option<NodeIdentifier>> {
        let start_offset = self.token.span.start_offset;
        let is_async = if self.is_kw("async")
            && !self.peek().newline_before
            && matches!(self.peek().t, T::LParen | T::Identifier)
        {
            let mut l = self.lex;
            let mut scratch = Vec::new();
            let after = l.next(&mut scratch)?;
            let arrow_follows = if after.t == T::Identifier {
                l.next(&mut scratch)?.t == T::Arrow
            } else {
                Self::paren_arrow_ahead(l, &mut scratch)?
            };
            if !arrow_follows {
                return Ok(None);
            }
            self.bump()?;
            true
        } else {
            false
        };
        let mut ret = None;
        let parameters = if self.token.t == T::Identifier
            && self.peek().t == T::Arrow
            && !self.peek().newline_before
        {
            let t = self.bump()?;
            let parameters = self.open();
            let p = self.syntax_tree.ident(self.text(t), t.span);
            self.item(p);
            parameters
        } else if self.token.t == T::LParen && Self::paren_arrow_ahead(self.lex, &mut Vec::new())? {
            let p = self.parameters()?;
            ret = self.maybe_return_type(true)?;
            p
        } else {
            return Ok(None);
        };
        if self.token.t != T::Arrow || self.token.newline_before {
            return self.fail("expected `=>`");
        }
        self.bump()?;
        let (body, expression_body) = if self.token.t == T::LBrace {
            (self.block()?, false)
        } else {
            (self.assignment()?, true)
        };
        let span = self.span_from(start_offset);
        let f = self.close(parameters, |syntax_tree, parameters| {
            syntax_tree.arrow(parameters, body, expression_body, is_async, span)
        });
        self.signature_typescript(f, None, ret);
        Ok(Some(f))
    }

    /// With the lexer positioned just after a `(`, whether the matching `)` is followed by `=>`
    /// (or, in TypeScript, by a return type and then `=>`).
    fn paren_arrow_ahead(mut l: Lexer<'_>, scratch: &mut Vec<Span>) -> R<bool> {
        let mut depth = 1i32;
        loop {
            let t = l.next(scratch)?;
            match t.t {
                T::LParen | T::LBracket | T::LBrace => depth += 1,
                T::RParen | T::RBracket | T::RBrace => {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                T::Eof => return Ok(false),
                _ => {}
            }
        }
        let t = l.next(scratch)?;
        match t.t {
            T::Arrow => Ok(!t.newline_before),
            T::Colon => {
                let mut depth = 0i32;
                loop {
                    let t = l.next(scratch)?;
                    match t.t {
                        T::Arrow if depth == 0 => return Ok(true),
                        T::LParen | T::LBracket | T::LBrace => depth += 1,
                        T::RParen | T::RBracket | T::RBrace => {
                            if depth == 0 {
                                return Ok(false);
                            }
                            depth -= 1;
                        }
                        T::Comma | T::Semi | T::Question | T::Eof if depth == 0 => {
                            return Ok(false);
                        }
                        _ => {}
                    }
                }
            }
            _ => Ok(false),
        }
    }

    fn conditional(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let test = self.binary(1)?;
        if self.token.t != T::Question {
            return Ok(test);
        }
        self.bump()?;
        let consequent = self.assignment()?;
        self.expect(T::Colon, ":")?;
        let alternate = self.assignment()?;
        Ok(self
            .syntax_tree
            .cond(test, consequent, alternate, self.span_from(start_offset)))
    }

    fn binary_op(&self) -> Option<(u8, Result<BinaryOperator, LogicalOperator>)> {
        let text = match self.token.t {
            T::Op => self.text(self.token),
            T::Identifier if matches!(self.text(self.token), "in" | "instanceof") => {
                self.text(self.token)
            }
            _ => return None,
        };
        if let Some(op) = LogicalOperator::parse(text) {
            return Some((op.precedence(), Err(op)));
        }
        BinaryOperator::parse(text).map(|op| (op.precedence(), Ok(op)))
    }

    fn binary(&mut self, min: u8) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let mut left = self.unary()?;
        loop {
            if self.typescript
                && self.token.t == T::Identifier
                && matches!(self.text(self.token), "as" | "satisfies")
                && !self.token.newline_before
            {
                let kind = if self.text(self.token) == "as" {
                    TypeScriptKind::As
                } else {
                    TypeScriptKind::Satisfies
                };
                self.bump()?;
                let tlo = self.token.span.start_offset;
                self.skip_type(true)?;
                self.typescript(left, kind, Span::new(tlo, self.prev_end));
                continue;
            }
            let Some((prec, op)) = self.binary_op() else {
                break;
            };
            // `min` is the lowest precedence this call may consume; `**` is right-associative.
            let right_assoc = op == Ok(BinaryOperator::Exp);
            if prec < min {
                break;
            }
            self.bump()?;
            let right = self.binary(if right_assoc { prec } else { prec + 1 })?;
            let span = self.span_from(start_offset);
            left = match op {
                Ok(b) => self.syntax_tree.binary(b, left, right, span),
                Err(l) => self.syntax_tree.logical(l, left, right, span),
            };
        }
        Ok(left)
    }

    fn unary(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let text = self.text(self.token);
        let op = match self.token.t {
            T::Op => UnaryOperator::parse(text).filter(|_| !matches!(text, "++" | "--")),
            T::Identifier if matches!(text, "typeof" | "void" | "delete") => {
                UnaryOperator::parse(text)
            }
            _ => None,
        };
        if let Some(op) = op {
            self.bump()?;
            let arg = self.unary()?;
            return Ok(self
                .syntax_tree
                .unary(op, arg, self.span_from(start_offset)));
        }
        if self.token.t == T::Op && matches!(text, "++" | "--") {
            self.bump()?;
            let arg = self.unary()?;
            let op = if text == "++" {
                UpdateOperator::Inc
            } else {
                UpdateOperator::Dec
            };
            return Ok(self
                .syntax_tree
                .update(op, true, arg, self.span_from(start_offset)));
        }
        if self.is_kw("await")
            && !matches!(
                self.peek().t,
                T::Arrow | T::Op | T::RParen | T::Comma | T::Semi | T::Eof
            )
        {
            self.bump()?;
            let arg = self.unary()?;
            return Ok(self.syntax_tree.await_(arg, self.span_from(start_offset)));
        }
        let e = self.lhs()?;
        if self.token.t == T::Op
            && !self.token.newline_before
            && matches!(self.text(self.token), "++" | "--")
        {
            let op = if self.text(self.token) == "++" {
                UpdateOperator::Inc
            } else {
                UpdateOperator::Dec
            };
            self.bump()?;
            return Ok(self
                .syntax_tree
                .update(op, false, e, self.span_from(start_offset)));
        }
        Ok(e)
    }

    fn lhs(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let mut e = if self.is_kw("new") {
            self.bump()?;
            let callee = self.primary()?;
            let callee = self.member_suffixes(callee, start_offset, false)?;
            self.maybe_type_arguments(callee)?;
            let arguments = if self.token.t == T::LParen {
                self.arguments()?
            } else {
                self.open()
            };
            let span = self.span_from(start_offset);
            self.close(arguments, |syntax_tree, arguments| {
                syntax_tree.new_(callee, arguments, span)
            })
        } else {
            self.primary()?
        };
        e = self.member_suffixes(e, start_offset, true)?;
        Ok(e)
    }

    fn member_suffixes(
        &mut self,
        mut e: NodeIdentifier,
        start_offset: u32,
        calls: bool,
    ) -> R<NodeIdentifier> {
        loop {
            match self.token.t {
                T::Dot => {
                    self.bump()?;
                    let prop = self.property_name_ident()?;
                    e = self.syntax_tree.member(
                        e,
                        prop,
                        false,
                        false,
                        self.span_from(start_offset),
                    );
                }
                T::QuestionDot => {
                    self.bump()?;
                    match self.token.t {
                        T::LParen if calls => {
                            let arguments = self.arguments()?;
                            let span = self.span_from(start_offset);
                            e = self.close(arguments, |syntax_tree, arguments| {
                                syntax_tree.call(e, arguments, true, span)
                            });
                        }
                        T::LBracket => {
                            self.bump()?;
                            let p = self.expression()?;
                            self.expect(T::RBracket, "]")?;
                            e = self.syntax_tree.member(
                                e,
                                p,
                                true,
                                true,
                                self.span_from(start_offset),
                            );
                        }
                        _ => {
                            let prop = self.property_name_ident()?;
                            e = self.syntax_tree.member(
                                e,
                                prop,
                                false,
                                true,
                                self.span_from(start_offset),
                            );
                        }
                    }
                }
                T::LBracket => {
                    self.bump()?;
                    let p = self.expression()?;
                    self.expect(T::RBracket, "]")?;
                    e = self
                        .syntax_tree
                        .member(e, p, true, false, self.span_from(start_offset));
                }
                T::LParen if calls => {
                    let arguments = self.arguments()?;
                    let span = self.span_from(start_offset);
                    e = self.close(arguments, |syntax_tree, arguments| {
                        syntax_tree.call(e, arguments, false, span)
                    });
                }
                T::Template { .. } => return self.fail("tagged templates are not supported"),
                T::Op
                    if self.typescript
                        && self.text(self.token) == "!"
                        && !self.token.newline_before =>
                {
                    let bang = self.bump()?;
                    self.typescript(e, TypeScriptKind::NonNull, bang.span);
                }
                T::Op
                    if calls
                        && self.typescript
                        && self.is_op("<")
                        && self.type_arguments_before_call() =>
                {
                    self.maybe_type_arguments(e)?;
                }
                _ => return Ok(e),
            }
        }
    }

    fn property_name_ident(&mut self) -> R<NodeIdentifier> {
        match self.token.t {
            T::Identifier => {
                let t = self.bump()?;
                Ok(self.syntax_tree.ident(self.text(t), t.span))
            }
            T::PrivateName => self.fail("private names are not supported"),
            _ => self.fail("expected property name"),
        }
    }

    fn arguments(&mut self) -> R<List> {
        self.expect(T::LParen, "(")?;
        let arguments = self.open();
        while self.token.t != T::RParen {
            let start_offset = self.token.span.start_offset;
            let a = self.assignment_or_spread(start_offset)?;
            self.item(a);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RParen, ")")?;
        Ok(arguments)
    }

    fn string_node(&mut self, t: LexedToken) -> NodeIdentifier {
        let body = Span::new(t.span.start_offset + 1, t.span.end_offset - 1);
        match decode_string(body.text(self.source_text)) {
            Some(v) => self.syntax_tree.str_owned(&v, t.span),
            None => self.syntax_tree.str_in_source(body, t.span),
        }
    }

    #[expect(
        clippy::cast_precision_loss,
        reason = "a JavaScript number is an f64 and rounds the same way"
    )]
    fn number_value(text: &str) -> Option<f64> {
        let clean: String = text.chars().filter(|&c| c != '_').collect();
        let lower = clean.to_ascii_lowercase();
        let radix = |r| u64::from_str_radix(&lower[2..], r).ok().map(|v| v as f64);
        match lower.get(..2) {
            Some("0x") => radix(16),
            Some("0o") => radix(8),
            Some("0b") => radix(2),
            _ => lower.parse().ok(),
        }
    }

    fn primary(&mut self) -> R<NodeIdentifier> {
        let t = self.token;
        let start_offset = t.span.start_offset;
        match t.t {
            T::Identifier => {
                let text = self.text(t);
                match text {
                    "true" | "false" => {
                        self.bump()?;
                        Ok(self.syntax_tree.write_boolean(text == "true", t.span))
                    }
                    "null" => {
                        self.bump()?;
                        Ok(self.syntax_tree.null(t.span))
                    }
                    "this" => {
                        self.bump()?;
                        Ok(self.syntax_tree.this(t.span))
                    }
                    "function" => self.function(false, start_offset, false),
                    "async"
                        if self.peek().t == T::Identifier
                            && self.text(self.peek()) == "function" =>
                    {
                        self.bump()?;
                        self.function(false, start_offset, true)
                    }
                    "class" | "super" | "import" | "yield" => {
                        self.fail(format!("unsupported expression `{text}`"))
                    }
                    _ if RESERVED.contains(&text) => {
                        self.fail(format!("unexpected keyword `{text}`"))
                    }
                    _ => {
                        self.bump()?;
                        Ok(self.syntax_tree.ident(text, t.span))
                    }
                }
            }
            T::Number => {
                self.bump()?;
                match Self::number_value(self.text(t)) {
                    Some(v) => Ok(self.syntax_tree.write_number(v, t.span)),
                    None => self.fail("invalid number"),
                }
            }
            T::String => {
                self.bump()?;
                Ok(self.string_node(t))
            }
            T::Template { .. } => self.template(),
            T::LParen => {
                self.bump()?;
                let e = self.expression()?;
                self.expect(T::RParen, ")")?;
                Ok(e)
            }
            T::LBracket => {
                self.bump()?;
                let items = self.open();
                while self.token.t != T::RBracket {
                    let ilo = self.token.span.start_offset;
                    if self.token.t == T::Comma {
                        self.bump()?;
                        let hole = self.syntax_tree.hole(Span::new(ilo, ilo));
                        self.item(hole);
                        continue;
                    }
                    let a = self.assignment_or_spread(ilo)?;
                    self.item(a);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBracket, "]")?;
                let span = self.span_from(start_offset);
                Ok(self.close(items, |syntax_tree, items| syntax_tree.array(items, span)))
            }
            T::LBrace => self.object(),
            T::Op if matches!(self.text(t), "/" | "/=") => {
                self.fail("regular expression literals are not supported")
            }
            T::Op if self.typescript && self.text(t) == "<" => {
                self.fail("TypeScript type assertions / generic arrows are not supported")
            }
            T::Eof => self.fail("unexpected end of input"),
            _ => self.fail(format!("unexpected token `{}`", self.text(t))),
        }
    }

    fn template(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let mut quasis = Vec::new();
        let mut expressions = Vec::new();
        loop {
            let T::Template { tail } = self.token.t else {
                return self.fail("expected template continuation");
            };
            let s = self.token.span;
            let raw = Span::new(
                s.start_offset + 1,
                if tail {
                    s.end_offset - 1
                } else {
                    s.end_offset - 2
                },
            );
            quasis.push(self.syntax_tree.template_element_in_source(raw, tail, raw));
            if tail {
                self.bump()?;
                break;
            }
            self.bump()?;
            expressions.push(self.expression()?);
            if self.token.t != T::RBrace {
                return self.fail("expected `}` in template literal");
            }
            self.token = self.lex.template_continue(self.token.span)?;
        }
        Ok(self
            .syntax_tree
            .template(&quasis, &expressions, self.span_from(start_offset)))
    }

    fn object(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.bump()?;
        let props = self.open();
        while self.token.t != T::RBrace {
            let plo = self.token.span.start_offset;
            if self.eat(T::Ellipsis)? {
                let a = self.assignment()?;
                let spread = self.syntax_tree.spread(a, self.span_from(plo));
                self.item(spread);
            } else {
                let is_async = self.is_kw("async")
                    && !matches!(self.peek().t, T::Colon | T::Comma | T::RBrace | T::LParen);
                if is_async {
                    self.bump()?;
                }
                if (self.is_kw("get") || self.is_kw("set"))
                    && !matches!(self.peek().t, T::Colon | T::Comma | T::RBrace | T::LParen)
                {
                    return self.fail("getters and setters are not supported");
                }
                let (key, computed, key_token) = self.property_key()?;
                if self.token.t == T::LParen {
                    let parameters = self.parameters()?;
                    let ret = self.maybe_return_type(false)?;
                    let body = self.block()?;
                    let span = Span::new(key_token.start_offset, self.prev_end);
                    let f = self.close(parameters, |syntax_tree, parameters| {
                        syntax_tree.function(false, None, parameters, body, is_async, span)
                    });
                    self.signature_typescript(f, None, ret);
                    let flags = flag::METHOD | if computed { flag::COMPUTED } else { 0 };
                    let prop = self
                        .syntax_tree
                        .property(key, f, flags, self.span_from(plo));
                    self.item(prop);
                } else if self.eat(T::Colon)? {
                    let v = self.assignment()?;
                    let flags = if computed { flag::COMPUTED } else { 0 };
                    let prop = self
                        .syntax_tree
                        .property(key, v, flags, self.span_from(plo));
                    self.item(prop);
                } else if let Some(name) = self.syntax_tree.atom(key).filter(|_| !computed) {
                    let value = self.syntax_tree.ident_atom(name, key_token);
                    let prop =
                        self.syntax_tree
                            .property(key, value, flag::SHORTHAND, self.span_from(plo));
                    self.item(prop);
                } else {
                    return self.fail("expected `:`");
                }
            }
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RBrace, "}")?;
        let span = self.span_from(start_offset);
        Ok(self.close(props, |syntax_tree, props| syntax_tree.object(props, span)))
    }

    fn property_key(&mut self) -> R<(NodeIdentifier, bool, Span)> {
        let t = self.token;
        match t.t {
            T::Identifier => {
                self.bump()?;
                Ok((self.syntax_tree.ident(self.text(t), t.span), false, t.span))
            }
            T::String => {
                self.bump()?;
                Ok((self.string_node(t), false, t.span))
            }
            T::Number => {
                self.bump()?;
                let v = Self::number_value(self.text(t)).unwrap_or(0.0);
                Ok((self.syntax_tree.write_number(v, t.span), false, t.span))
            }
            T::LBracket => {
                self.bump()?;
                let e = self.assignment()?;
                self.expect(T::RBracket, "]")?;
                Ok((e, true, Span::new(t.span.start_offset, self.prev_end)))
            }
            _ => self.fail("expected property key"),
        }
    }

    // ---- binding patterns
    // ------------------------------------------------------------------------

    fn binding_target(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        match self.token.t {
            T::Identifier => {
                let t = self.bump()?;
                if RESERVED.contains(&self.text(t)) {
                    return Err(ParseError {
                        message: format!("unexpected keyword `{}`", self.text(t)),
                        span: t.span,
                    });
                }
                Ok(self.syntax_tree.ident(self.text(t), t.span))
            }
            T::LBrace => {
                self.bump()?;
                let props = self.open();
                while self.token.t != T::RBrace {
                    let plo = self.token.span.start_offset;
                    let prop = if self.eat(T::Ellipsis)? {
                        let arg = self.binding_target()?;
                        self.syntax_tree.rest(arg, self.span_from(plo))
                    } else {
                        let (key, computed, key_span) = self.property_key()?;
                        if self.eat(T::Colon)? {
                            let value = self.binding_element()?;
                            let flags = if computed { flag::COMPUTED } else { 0 };
                            self.syntax_tree
                                .property(key, value, flags, self.span_from(plo))
                        } else {
                            let Some(name) = self.syntax_tree.atom(key).filter(|_| !computed)
                            else {
                                return self.fail("expected `:`");
                            };
                            let mut value = self.syntax_tree.ident_atom(name, key_span);
                            if self.eat_op("=")? {
                                let d = self.assignment()?;
                                value = self.syntax_tree.assign_pat(value, d, self.span_from(plo));
                            }
                            self.syntax_tree.property(
                                key,
                                value,
                                flag::SHORTHAND,
                                self.span_from(plo),
                            )
                        }
                    };
                    self.item(prop);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBrace, "}")?;
                let span = self.span_from(start_offset);
                Ok(self.close(props, |syntax_tree, props| {
                    syntax_tree.object_pat(props, span)
                }))
            }
            T::LBracket => {
                self.bump()?;
                let items = self.open();
                while self.token.t != T::RBracket {
                    let ilo = self.token.span.start_offset;
                    if self.token.t == T::Comma {
                        self.bump()?;
                        let hole = self.syntax_tree.hole(Span::new(ilo, ilo));
                        self.item(hole);
                        continue;
                    }
                    let item = if self.eat(T::Ellipsis)? {
                        let arg = self.binding_target()?;
                        self.syntax_tree.rest(arg, self.span_from(ilo))
                    } else {
                        self.binding_element()?
                    };
                    self.item(item);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBracket, "]")?;
                let span = self.span_from(start_offset);
                Ok(self.close(items, |syntax_tree, items| {
                    syntax_tree.array_pat(items, span)
                }))
            }
            _ => self.fail("expected a binding name or pattern"),
        }
    }

    fn binding_element(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let target = self.binding_target()?;
        if self.eat_op("=")? {
            let d = self.assignment()?;
            return Ok(self
                .syntax_tree
                .assign_pat(target, d, self.span_from(start_offset)));
        }
        Ok(target)
    }
}
