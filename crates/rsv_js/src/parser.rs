//! A recursive-descent / precedence-climbing parser for the JavaScript subset the pipeline
//! supports, writing into an [`Ast`] through its builder methods.
//!
//! TypeScript is accepted where Svelte components use it: type annotations on bindings, parameters
//! and return types, `as` / `satisfies` / `!`, `import type`, and `type` / `interface` / `declare`
//! statements. Types are not parsed into nodes; their spans are recorded
//! ([`Ast::ts`], [`crate::ast::Tag::TsDecl`]) so compilation drops them and
//! source-preserving consumers (the type-check projection) copy them verbatim.
//!
//! Anything outside the subset is a [`ParseError`], never a panic.

use rsv_kernel::source::Span;

use crate::ast::{Ast, Kind, NodeId, TsFeature, TsKind, TsRuntime, TsSyntax, TypeRef, flag};
use crate::lexer::{LexError, Lexer, T, Tok, decode_string};
use crate::ops::{AssignOp, BinOp, LogicalOp, UnaryOp, UpdateOp};

#[derive(Debug, Clone)]
pub struct ParseError {
    pub message: String,
    pub span: Span,
}

impl From<LexError> for ParseError {
    fn from(e: LexError) -> Self {
        Self {
            message: e.message,
            span: e.span,
        }
    }
}

type R<T> = Result<T, ParseError>;

#[derive(Debug)]
pub struct Parser<'a, 'b> {
    src: &'a str,
    lex: Lexer<'a>,
    tok: Tok,
    prev_end: u32,
    /// The token before [`Parser::tok`].
    prev: Tok,
    /// Inside type syntax: identifiers the parser consumes are noted in [`Ast::type_refs`].
    in_type: u32,
    ast: &'b mut Ast,
    ts: bool,
    end: u32,
    /// [`Ast::scratch`]'s length when this parse began.
    base: usize,
}

/// A failed parse leaves its open lists on the scratch stack; they go with it.
impl Drop for Parser<'_, '_> {
    fn drop(&mut self) {
        self.ast.scratch.truncate(self.base);
    }
}

/// A list being gathered on [`Ast::scratch`]. Lists nest, so the one opened last is on top, and
/// gathering one allocates nothing: the items are copied into the tree when the node is built.
#[derive(Clone, Copy)]
struct List(usize);

/// Parses `range` of `src` as a module body.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error, or at syntax this parser does not support.
pub fn parse_program(ast: &mut Ast, src: &str, range: Span, ts: bool) -> R<NodeId> {
    // Svelte components average a token per 4.8 bytes (the lossless corpus test prints both).
    ast.tokens.reserve(range.len() as usize / 4);
    let mut p = Parser::new(ast, src, range, ts)?;
    let body = p.open();
    while p.tok.t != T::Eof {
        let s = p.statement()?;
        p.item(s);
    }
    let program = p.close(body, |ast, body| ast.program(body, range));
    p.done();
    Ok(program)
}

/// Parses `range` of `src` as exactly one expression.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error, or if a token follows the expression.
pub fn parse_expression(ast: &mut Ast, src: &str, range: Span, ts: bool) -> R<NodeId> {
    let mut p = Parser::new(ast, src, range, ts)?;
    let e = p.expression()?;
    if p.tok.t != T::Eof {
        return p.fail("unexpected token after expression");
    }
    p.done();
    Ok(e)
}

/// Parses `range` of `src` as a comma-separated list of parameters without the parentheses (`a,
/// { b }, c = 1`): the names an embedding language's syntax declares, like Vue's `v-for` alias.
///
/// # Errors
///
/// [`ParseError`] at the first lexical or syntax error, or if a token follows the list.
pub fn parse_params(ast: &mut Ast, src: &str, range: Span, ts: bool) -> R<Vec<NodeId>> {
    let mut p = Parser::new(ast, src, range, ts)?;
    let mut params = Vec::new();
    while p.tok.t != T::Eof {
        params.push(p.param()?);
        if !p.eat(T::Comma)? {
            break;
        }
    }
    if p.tok.t != T::Eof {
        return p.fail("unexpected token after parameters");
    }
    p.done();
    Ok(params)
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
    ast: &mut Ast,
    src: &str,
    start: u32,
    limit: u32,
    ts: bool,
) -> R<(NodeId, u32)> {
    let mut p = Parser::new(ast, src, Span::new(start, limit), ts)?;
    let e = p.expression()?;
    let next = if p.tok.t == T::Eof {
        limit
    } else {
        p.tok.span.lo
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
    fn new(ast: &'b mut Ast, src: &'a str, range: Span, ts: bool) -> R<Self> {
        let mut lex = Lexer::new(src, range.lo as usize, range.hi as usize);
        let tok = lex.next(&mut ast.comments)?;
        Ok(Parser {
            src,
            lex,
            tok,
            prev_end: range.lo,
            prev: Tok {
                t: T::Eof,
                span: Span::new(range.lo, range.lo),
                nl_before: false,
            },
            in_type: 0,
            base: ast.scratch.len(),
            ast,
            ts,
            end: range.hi,
        })
    }

    fn fail<X>(&self, message: impl Into<String>) -> R<X> {
        Err(ParseError {
            message: message.into(),
            span: self.tok.span,
        })
    }

    #[inline]
    fn text(&self, t: Tok) -> &'a str {
        t.span.text(self.src)
    }

    /// Checks, where a parse succeeds, that it closed every list it opened.
    fn done(&self) {
        debug_assert_eq!(self.ast.scratch.len(), self.base, "a list was left open");
    }

    const fn open(&self) -> List {
        List(self.ast.scratch.len())
    }

    fn item(&mut self, id: NodeId) {
        self.ast.scratch.push(id);
    }

    /// `build` makes the node that holds `list`'s items, which are then popped.
    fn close<N>(&mut self, list: List, build: impl FnOnce(&mut Ast, &[NodeId]) -> N) -> N {
        let scratch = std::mem::take(&mut self.ast.scratch);
        let node = build(self.ast, &scratch[list.0..]);
        self.ast.scratch = scratch;
        self.drop_list(list);
        node
    }

    /// Abandons `list` without building anything from it.
    fn drop_list(&mut self, list: List) {
        debug_assert!(
            list.0 <= self.ast.scratch.len(),
            "lists close innermost first"
        );
        self.ast.scratch.truncate(list.0);
    }

    /// `...a` or `a`, in an argument list or an array.
    fn assignment_or_spread(&mut self, lo: u32) -> R<NodeId> {
        if self.eat(T::Ellipsis)? {
            let a = self.assignment()?;
            Ok(self.ast.spread(a, self.span_from(lo)))
        } else {
            self.assignment()
        }
    }

    fn bump(&mut self) -> R<Tok> {
        let t = self.tok;
        self.ast.tokens.push(t.t, t.span);
        self.prev_end = t.span.hi;
        self.tok = self.lex.next(&mut self.ast.comments)?;
        if self.in_type > 0 && t.t == T::Ident && self.names_a_binding(t) {
            let name = self.ast.atoms.intern(self.text(t));
            self.ast.type_refs.push(TypeRef { name, span: t.span });
        }
        self.prev = t;
        Ok(t)
    }

    /// Whether identifier `t`, just consumed inside a type, can refer to a binding: not a keyword,
    /// a qualified name's member (`N.A`), a declared name (`type A`), or a member key (`{ a: T }`,
    /// `(a: T) => U`).
    fn names_a_binding(&self, t: Tok) -> bool {
        if TYPE_KEYWORDS.contains(&self.text(t)) {
            return false;
        }
        let prev = self.prev;
        match prev.t {
            T::Dot => return false,
            T::Ident
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
        ) || (prev.t == T::Ident && self.text(prev) == "readonly");
        let before_colon = match self.tok.t {
            T::Colon | T::LParen => true,
            T::Question => self.peek().t == T::Colon,
            _ => false,
        };
        !(key_position && before_colon)
    }

    #[inline]
    fn is_op(&self, s: &str) -> bool {
        self.tok.t == T::Op && self.text(self.tok) == s
    }

    #[inline]
    fn is_kw(&self, s: &str) -> bool {
        self.tok.t == T::Ident && self.text(self.tok) == s
    }

    fn eat(&mut self, t: T) -> R<bool> {
        if self.tok.t == t {
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

    fn expect(&mut self, t: T, what: &str) -> R<Tok> {
        if self.tok.t != t {
            return self.fail(format!("expected `{what}`"));
        }
        self.bump()
    }

    const fn span_from(&self, lo: u32) -> Span {
        Span::new(lo, self.prev_end)
    }

    /// A peek at the token after the current one.
    fn peek(&self) -> Tok {
        let mut l = self.lex;
        let mut scratch = Vec::new();
        l.next(&mut scratch).unwrap_or_else(|_| Tok {
            t: T::Eof,
            span: Span::new(self.end, self.end),
            nl_before: false,
        })
    }

    fn semicolon(&mut self) -> R<()> {
        if self.eat(T::Semi)?
            || self.tok.t == T::RBrace
            || self.tok.t == T::Eof
            || self.tok.nl_before
        {
            return Ok(());
        }
        self.fail("expected `;`")
    }

    // ---- statements
    // ------------------------------------------------------------------------------

    fn statement(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        match self.tok.t {
            T::LBrace => return self.block(),
            T::Semi => {
                self.bump()?;
                return Ok(self.ast.empty(self.span_from(lo)));
            }
            T::Ident => {}
            _ => return self.expression_statement(),
        }
        let kw = self.text(self.tok);
        match kw {
            "import" if !matches!(self.peek().t, T::LParen | T::Dot) => self.import(),
            "export" => self.export(),
            "let" | "const" | "var" => {
                let d = self.var_decl()?;
                self.semicolon()?;
                Ok(d)
            }
            "function" => self.function(true, lo, false),
            "async"
                if self.peek().t == T::Ident
                    && self.text(self.peek()) == "function"
                    && !self.peek().nl_before =>
            {
                self.bump()?;
                self.function(true, lo, true)
            }
            "return" => {
                self.bump()?;
                let arg =
                    if matches!(self.tok.t, T::Semi | T::RBrace | T::Eof) || self.tok.nl_before {
                        None
                    } else {
                        Some(self.expression()?)
                    };
                self.semicolon()?;
                Ok(self.ast.return_(arg, self.span_from(lo)))
            }
            "if" => {
                self.bump()?;
                self.expect(T::LParen, "(")?;
                let test = self.expression()?;
                self.expect(T::RParen, ")")?;
                let cons = self.statement()?;
                let alt = if self.is_kw("else") {
                    self.bump()?;
                    Some(self.statement()?)
                } else {
                    None
                };
                Ok(self.ast.if_(test, cons, alt, self.span_from(lo)))
            }
            "type" | "interface" | "declare" | "abstract" | "enum" | "namespace" | "module"
                if self.ts && self.peek().t == T::Ident && !self.peek().nl_before =>
            {
                self.ts_declaration(lo)
            }
            _ if RESERVED.contains(&kw) => self.fail(format!("unsupported statement `{kw}`")),
            _ => self.expression_statement(),
        }
    }

    fn expression_statement(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let e = self.expression()?;
        self.semicolon()?;
        Ok(self.ast.expr_stmt_at(e, self.span_from(lo)))
    }

    fn block(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        self.expect(T::LBrace, "{")?;
        let body = self.open();
        while self.tok.t != T::RBrace {
            if self.tok.t == T::Eof {
                return self.fail("unterminated block");
            }
            let s = self.statement()?;
            self.item(s);
        }
        self.bump()?;
        let span = self.span_from(lo);
        Ok(self.close(body, |ast, body| ast.block(body, span)))
    }

    fn var_decl(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let kw = self.bump()?;
        let kind = match self.text(kw) {
            "let" => flag::LET,
            "const" => flag::CONST,
            _ => flag::VAR,
        };
        let decls = self.open();
        loop {
            let dlo = self.tok.span.lo;
            let id = self.binding_target()?;
            self.maybe_type_annotation(id)?;
            let init = if self.eat_op("=")? {
                Some(self.assignment()?)
            } else {
                None
            };
            let d = self.ast.declarator(id, init, self.span_from(dlo));
            self.item(d);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        let span = self.span_from(lo);
        Ok(self.close(decls, |ast, decls| ast.var_decl(kind, decls, span)))
    }

    fn function(&mut self, decl: bool, lo: u32, is_async: bool) -> R<NodeId> {
        self.bump()?; // `function`
        if self.is_op("*") {
            return self.fail("generator functions are not supported");
        }
        let name = if self.tok.t == T::Ident {
            let t = self.bump()?;
            Some(self.ast.ident(self.text(t), t.span))
        } else if decl {
            return self.fail("expected function name");
        } else {
            None
        };
        let type_params = self.maybe_type_params()?;
        let params = self.params()?;
        let ret = self.maybe_return_type(false)?;
        let body = self.block()?;
        let span = self.span_from(lo);
        let f = self.close(params, |ast, params| {
            ast.function(decl, name, params, body, is_async, span)
        });
        self.signature_ts(f, type_params, ret);
        Ok(f)
    }

    fn params(&mut self) -> R<List> {
        self.expect(T::LParen, "(")?;
        let params = self.open();
        while self.tok.t != T::RParen {
            let p = self.param()?;
            self.item(p);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RParen, ")")?;
        Ok(params)
    }

    fn param(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        if self.eat(T::Ellipsis)? {
            let arg = self.binding_target()?;
            self.maybe_type_annotation(arg)?;
            return Ok(self.ast.rest(arg, self.span_from(lo)));
        }
        let target = self.binding_target()?;
        if self.ts && self.tok.t == T::Question {
            let q = self.bump()?;
            self.ts(target, TsKind::Optional, q.span);
        }
        self.maybe_type_annotation(target)?;
        if self.eat_op("=")? {
            let d = self.assignment()?;
            return Ok(self.ast.assign_pat(target, d, self.span_from(lo)));
        }
        Ok(target)
    }

    fn import(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        self.bump()?;
        let type_only = if self.ts
            && self.is_kw("type")
            && !matches!(self.peek().t, T::Comma)
            && !(self.peek().t == T::Ident && self.text(self.peek()) == "from")
        {
            self.bump()?;
            true
        } else {
            false
        };
        let specs = self.open();
        if self.tok.t != T::Str {
            if self.tok.t == T::Ident {
                let t = self.bump()?;
                let local = self.ast.ident(self.text(t), t.span);
                let spec = self.ast.import_default(local, t.span);
                self.item(spec);
                self.eat(T::Comma)?;
            }
            if self.is_op("*") {
                let slo = self.tok.span.lo;
                self.bump()?;
                if !self.is_kw("as") {
                    return self.fail("expected `as`");
                }
                self.bump()?;
                let t = self.expect(T::Ident, "identifier")?;
                let local = self.ast.ident(self.text(t), t.span);
                let spec = self.ast.import_namespace(local, self.span_from(slo));
                self.item(spec);
            } else if self.tok.t == T::LBrace {
                self.bump()?;
                while self.tok.t != T::RBrace {
                    let slo = self.tok.span.lo;
                    let spec_type = if self.ts
                        && self.is_kw("type")
                        && self.peek().t == T::Ident
                        && self.text(self.peek()) != "as"
                    {
                        self.bump()?;
                        true
                    } else {
                        false
                    };
                    let t = self.bump()?;
                    let imported = match t.t {
                        T::Ident => self.ast.ident(self.text(t), t.span),
                        T::Str => self.string_node(t),
                        _ => return self.fail("expected import name"),
                    };
                    let local = if self.is_kw("as") {
                        self.bump()?;
                        let l = self.expect(T::Ident, "identifier")?;
                        self.ast.ident(self.text(l), l.span)
                    } else if t.t == T::Ident {
                        self.ast.ident(self.text(t), t.span)
                    } else {
                        return self.fail("string import names need `as`");
                    };
                    let spec =
                        self.ast
                            .import_named(imported, local, spec_type, self.span_from(slo));
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
        let s = self.expect(T::Str, "module specifier")?;
        let source = self.string_node(s);
        self.semicolon()?;
        let span = self.span_from(lo);
        Ok(self.close(specs, |ast, specs| {
            ast.import(specs, source, type_only, span)
        }))
    }

    fn export(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        self.bump()?;
        if self.is_kw("default") {
            self.bump()?;
            let e = if self.is_kw("function") {
                let flo = self.tok.span.lo;
                self.function(false, flo, false)?
            } else {
                let e = self.assignment()?;
                self.semicolon()?;
                e
            };
            return Ok(self.ast.export_default(e, self.span_from(lo)));
        }
        if self.ts
            && (self.is_kw("type") || self.is_kw("interface") || self.is_kw("enum"))
            && self.peek().t == T::Ident
        {
            let d = self.ts_declaration(self.tok.span.lo)?;
            return Ok(self.ast.export_named(d, self.span_from(lo)));
        }
        let decl = match self.tok.t {
            T::Ident if matches!(self.text(self.tok), "let" | "const" | "var") => {
                let d = self.var_decl()?;
                self.semicolon()?;
                d
            }
            T::Ident if self.text(self.tok) == "function" => {
                let flo = self.tok.span.lo;
                self.function(true, flo, false)?
            }
            _ => return self.fail("unsupported export form"),
        };
        Ok(self.ast.export_named(decl, self.span_from(lo)))
    }

    /// `type X = …`, `interface X {…}`, `declare …`, `enum …`, `namespace …`: skipped as one
    /// opaque statement. An enum, or a namespace holding values, also goes to [`Ast::ts_runtime`].
    fn ts_declaration(&mut self, lo: u32) -> R<NodeId> {
        let kw = self.text(self.tok);
        if kw == "abstract" {
            return self.fail("unsupported statement `abstract class`");
        }
        let is_interface = kw == "interface";
        let is_namespace = matches!(kw, "namespace" | "module");
        self.bump()?;
        let is_enum = kw == "enum" || (kw == "declare" && self.is_kw("enum"));
        let mut body: Option<(u32, u32)> = None;
        if is_interface {
            if let Some(i) = self.ts_interface(lo)? {
                return Ok(i);
            }
            self.in_type += 1;
            while self.tok.t != T::LBrace {
                if self.tok.t == T::Eof {
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
                match self.tok.t {
                    T::Eof => break,
                    T::LBrace if depth == 0 && body.is_none() => {
                        body = Some((self.tok.span.hi, self.tok.span.hi));
                        depth += 1;
                    }
                    T::LParen | T::LBrace | T::LBracket => depth += 1,
                    T::RParen | T::RBrace | T::RBracket => {
                        if depth == 0 {
                            break;
                        }
                        depth -= 1;
                        if let (0, Some((open, _))) = (depth, body) {
                            body = Some((open, self.tok.span.lo));
                        }
                        if depth == 0 && self.peek().nl_before && self.peek().t != T::Op {
                            self.bump()?;
                            break;
                        }
                    }
                    T::Semi if depth == 0 => break,
                    _ if depth == 0
                        && self.tok.nl_before
                        && self.prev_end > lo
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
        let span = self.span_from(lo);
        if is_enum {
            self.ast.ts_runtime.push(TsRuntime {
                feature: TsFeature::Enum,
                span,
            });
        } else if let (true, Some((open, close))) = (is_namespace, body) {
            self.namespace_runtime(Span::new(open, close), span)?;
        }
        Ok(self.ast.ts_decl(span))
    }

    /// Records the first construct in a namespace body that erasing types cannot remove: an enum
    /// anywhere inside it, else the namespace itself when any statement is not a type declaration.
    /// The body is parsed into a scratch tree, so none of its nodes join this one.
    fn namespace_runtime(&mut self, body: Span, span: Span) -> R<()> {
        let mut scratch = Ast::new();
        let root = parse_program(&mut scratch, self.src, body, true)?;
        if let Some(&inner) = scratch.ts_runtime.first() {
            self.ast.ts_runtime.push(inner);
            return Ok(());
        }
        let Kind::Program(stmts) = scratch.kind(root) else {
            unreachable!("parse_program returns a program")
        };
        let type_only =
            |n: NodeId| matches!(scratch.kind(n), Kind::TsDecl | Kind::TsInterface { .. });
        let values = stmts.iter().any(|&s| match scratch.kind(s) {
            Kind::ExportNamed(d) => !type_only(d),
            _ => !type_only(s),
        });
        if values {
            self.ast.ts_runtime.push(TsRuntime {
                feature: TsFeature::NamespaceWithValues,
                span,
            });
        }
        Ok(())
    }

    /// `interface Name { key?: T; … }` with only property members, positioned after `interface`.
    /// `None` (having consumed up to the point of doubt) when the interface has any other shape;
    /// the caller then skips the rest as an opaque declaration.
    fn ts_interface(&mut self, lo: u32) -> R<Option<NodeId>> {
        if self.tok.t != T::Ident || self.peek().t != T::LBrace {
            return Ok(None);
        }
        let t = self.bump()?;
        let name = self.ast.ident(self.text(t), t.span);
        self.bump()?; // `{`
        let members = self.open();
        while self.tok.t != T::RBrace {
            let Some(m) = self.ts_prop_sig()? else {
                self.drop_list(members);
                return self.opaque_body_rest(lo).map(Some);
            };
            self.item(m);
        }
        self.bump()?; // `}`
        let span = self.span_from(lo);
        Ok(Some(self.close(members, |ast, members| {
            ast.ts_interface(name, members, span)
        })))
    }

    /// `key?: T;` inside an interface body; `None` at the first token of any other member shape.
    fn ts_prop_sig(&mut self) -> R<Option<NodeId>> {
        let k = self.tok;
        if k.t != T::Ident
            || self.is_kw("readonly")
            || !matches!(self.peek().t, T::Colon | T::Question)
        {
            return Ok(None);
        }
        self.bump()?;
        let key = self.ast.ident(self.text(k), k.span);
        let optional = self.eat(T::Question)?;
        if self.tok.t != T::Colon {
            return Ok(None);
        }
        let m = self.ast.ts_prop_sig(key, optional, k.span);
        self.maybe_type_annotation(m)?;
        let terminated = self.eat(T::Semi)?
            || self.eat(T::Comma)?
            || self.tok.nl_before
            || self.tok.t == T::RBrace;
        Ok(terminated.then_some(m))
    }

    /// Skips to the `}` closing a body whose `{` is already consumed; the declaration is opaque.
    fn opaque_body_rest(&mut self, lo: u32) -> R<NodeId> {
        let mut depth = 1i32;
        self.in_type += 1;
        loop {
            match self.tok.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Eof => return self.fail("unbalanced brackets"),
                _ => {}
            }
            self.bump()?;
            if depth == 0 {
                self.in_type -= 1;
                return Ok(self.ast.ts_decl(self.span_from(lo)));
            }
        }
    }

    /// A token at the start of a line that still belongs to a type (`| B`, `& C`, `= …`).
    fn continues_type(&self) -> bool {
        self.tok.t == T::Op && matches!(self.text(self.tok), "|" | "&" | "=")
    }

    fn skip_balanced(&mut self) -> R<()> {
        let mut depth = 0i32;
        self.in_type += 1;
        loop {
            match self.tok.t {
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

    fn maybe_type_annotation(&mut self, target: NodeId) -> R<()> {
        if self.ts && self.tok.t == T::Colon {
            self.bump()?;
            let lo = self.tok.span.lo;
            self.skip_type(false)?;
            self.ts(target, TsKind::Annotation, Span::new(lo, self.prev_end));
        }
        Ok(())
    }

    fn ts(&mut self, node: NodeId, kind: TsKind, span: Span) {
        self.ast.ts.push(TsSyntax { node, kind, span });
    }

    /// `: T` after a parameter list; the span is recorded once the function node exists.
    fn maybe_return_type(&mut self, stop_at_arrow: bool) -> R<Option<Span>> {
        if !(self.ts && self.tok.t == T::Colon) {
            return Ok(None);
        }
        self.bump()?;
        let lo = self.tok.span.lo;
        self.skip_type(stop_at_arrow)?;
        Ok(Some(Span::new(lo, self.prev_end)))
    }

    fn maybe_type_params(&mut self) -> R<Option<Span>> {
        if !(self.ts && self.is_op("<")) {
            return Ok(None);
        }
        let lo = self.tok.span.lo;
        self.skip_type_params()?;
        Ok(Some(Span::new(lo, self.prev_end)))
    }

    fn signature_ts(&mut self, f: NodeId, type_params: Option<Span>, ret: Option<Span>) {
        if let Some(s) = type_params {
            self.ts(f, TsKind::TypeParams, s);
        }
        if let Some(s) = ret {
            self.ts(f, TsKind::ReturnType, s);
        }
    }

    /// `<T>` between a callee and its arguments, recorded on the callee. `false`, consuming
    /// nothing, when the `<` is a comparison.
    fn maybe_type_args(&mut self, callee: NodeId) -> R<bool> {
        if !(self.ts && self.is_op("<") && self.type_args_before_call()) {
            return Ok(false);
        }
        let lo = self.tok.span.lo;
        self.skip_type_params()?;
        self.ts(callee, TsKind::TypeArgs, Span::new(lo, self.prev_end));
        Ok(true)
    }

    /// Whether the `<` here opens a type argument list that a `(` follows. TypeScript reads
    /// `f<T>(x)` as a call with type arguments where JavaScript reads two comparisons; outside
    /// brackets, a token no type can contain means a comparison.
    fn type_args_before_call(&self) -> bool {
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
                T::Ident
                | T::Str
                | T::Num
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

    fn skip_type_params(&mut self) -> R<()> {
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
            } else if self.tok.t == T::Eof {
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
        let start = self.tok.span.lo;
        self.in_type += 1;
        loop {
            let t = self.tok;
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
                    T::LBrace if t.span.lo != start && !self.after_type_operator() => true,
                    _ => t.nl_before && t.span.lo != start && !self.continues_type(),
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
        let prev = self.src[..self.prev_end as usize].trim_end();
        prev.ends_with(['|', '&', '<', ',', ':', '(', '[', '='])
    }

    // ---- expressions
    // -----------------------------------------------------------------------------

    /// # Errors
    ///
    /// [`ParseError`] at the first lexical or syntax error.
    pub fn expression(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let first = self.assignment()?;
        if self.tok.t != T::Comma {
            return Ok(first);
        }
        let mut items = vec![first];
        while self.eat(T::Comma)? {
            items.push(self.assignment()?);
        }
        Ok(self.ast.seq(&items, self.span_from(lo)))
    }

    fn assignment(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        if let Some(arrow) = self.try_arrow()? {
            return Ok(arrow);
        }
        let left = self.conditional()?;
        if self.tok.t == T::Op
            && let Some(op) = AssignOp::parse(self.text(self.tok))
        {
            let target = self.check_assign_target(left, op)?;
            self.bump()?;
            let value = self.assignment()?;
            return Ok(self.ast.assign(op, target, value, self.span_from(lo)));
        }
        Ok(left)
    }

    fn check_assign_target(&self, e: NodeId, op: AssignOp) -> R<NodeId> {
        match self.ast.kind(e) {
            Kind::Ident(_) | Kind::Member { .. } => Ok(e),
            Kind::Object(_) | Kind::Array(_) if op == AssignOp::Assign => {
                self.fail("destructuring assignment is not supported")
            }
            _ => self.fail("invalid assignment target"),
        }
    }

    /// Parses an arrow function if one starts here.
    fn try_arrow(&mut self) -> R<Option<NodeId>> {
        let lo = self.tok.span.lo;
        let is_async = if self.is_kw("async")
            && !self.peek().nl_before
            && matches!(self.peek().t, T::LParen | T::Ident)
        {
            let mut l = self.lex;
            let mut scratch = Vec::new();
            let after = l.next(&mut scratch)?;
            let arrow_follows = if after.t == T::Ident {
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
        let params =
            if self.tok.t == T::Ident && self.peek().t == T::Arrow && !self.peek().nl_before {
                let t = self.bump()?;
                let params = self.open();
                let p = self.ast.ident(self.text(t), t.span);
                self.item(p);
                params
            } else if self.tok.t == T::LParen && Self::paren_arrow_ahead(self.lex, &mut Vec::new())?
            {
                let p = self.params()?;
                ret = self.maybe_return_type(true)?;
                p
            } else {
                return Ok(None);
            };
        if self.tok.t != T::Arrow || self.tok.nl_before {
            return self.fail("expected `=>`");
        }
        self.bump()?;
        let (body, expr_body) = if self.tok.t == T::LBrace {
            (self.block()?, false)
        } else {
            (self.assignment()?, true)
        };
        let span = self.span_from(lo);
        let f = self.close(params, |ast, params| {
            ast.arrow(params, body, expr_body, is_async, span)
        });
        self.signature_ts(f, None, ret);
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
            T::Arrow => Ok(!t.nl_before),
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

    fn conditional(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let test = self.binary(1)?;
        if self.tok.t != T::Question {
            return Ok(test);
        }
        self.bump()?;
        let cons = self.assignment()?;
        self.expect(T::Colon, ":")?;
        let alt = self.assignment()?;
        Ok(self.ast.cond(test, cons, alt, self.span_from(lo)))
    }

    fn binary_op(&self) -> Option<(u8, Result<BinOp, LogicalOp>)> {
        let text = match self.tok.t {
            T::Op => self.text(self.tok),
            T::Ident if matches!(self.text(self.tok), "in" | "instanceof") => self.text(self.tok),
            _ => return None,
        };
        if let Some(op) = LogicalOp::parse(text) {
            return Some((op.precedence(), Err(op)));
        }
        BinOp::parse(text).map(|op| (op.precedence(), Ok(op)))
    }

    fn binary(&mut self, min: u8) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let mut left = self.unary()?;
        loop {
            if self.ts
                && self.tok.t == T::Ident
                && matches!(self.text(self.tok), "as" | "satisfies")
                && !self.tok.nl_before
            {
                let kind = if self.text(self.tok) == "as" {
                    TsKind::As
                } else {
                    TsKind::Satisfies
                };
                self.bump()?;
                let tlo = self.tok.span.lo;
                self.skip_type(true)?;
                self.ts(left, kind, Span::new(tlo, self.prev_end));
                continue;
            }
            let Some((prec, op)) = self.binary_op() else {
                break;
            };
            // `min` is the lowest precedence this call may consume; `**` is right-associative.
            let right_assoc = op == Ok(BinOp::Exp);
            if prec < min {
                break;
            }
            self.bump()?;
            let right = self.binary(if right_assoc { prec } else { prec + 1 })?;
            let span = self.span_from(lo);
            left = match op {
                Ok(b) => self.ast.binary(b, left, right, span),
                Err(l) => self.ast.logical(l, left, right, span),
            };
        }
        Ok(left)
    }

    fn unary(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let text = self.text(self.tok);
        let op = match self.tok.t {
            T::Op => UnaryOp::parse(text).filter(|_| !matches!(text, "++" | "--")),
            T::Ident if matches!(text, "typeof" | "void" | "delete") => UnaryOp::parse(text),
            _ => None,
        };
        if let Some(op) = op {
            self.bump()?;
            let arg = self.unary()?;
            return Ok(self.ast.unary(op, arg, self.span_from(lo)));
        }
        if self.tok.t == T::Op && matches!(text, "++" | "--") {
            self.bump()?;
            let arg = self.unary()?;
            let op = if text == "++" {
                UpdateOp::Inc
            } else {
                UpdateOp::Dec
            };
            return Ok(self.ast.update(op, true, arg, self.span_from(lo)));
        }
        if self.is_kw("await")
            && !matches!(
                self.peek().t,
                T::Arrow | T::Op | T::RParen | T::Comma | T::Semi | T::Eof
            )
        {
            self.bump()?;
            let arg = self.unary()?;
            return Ok(self.ast.await_(arg, self.span_from(lo)));
        }
        let e = self.lhs()?;
        if self.tok.t == T::Op && !self.tok.nl_before && matches!(self.text(self.tok), "++" | "--")
        {
            let op = if self.text(self.tok) == "++" {
                UpdateOp::Inc
            } else {
                UpdateOp::Dec
            };
            self.bump()?;
            return Ok(self.ast.update(op, false, e, self.span_from(lo)));
        }
        Ok(e)
    }

    fn lhs(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let mut e = if self.is_kw("new") {
            self.bump()?;
            let callee = self.primary()?;
            let callee = self.member_suffixes(callee, lo, false)?;
            self.maybe_type_args(callee)?;
            let args = if self.tok.t == T::LParen {
                self.arguments()?
            } else {
                self.open()
            };
            let span = self.span_from(lo);
            self.close(args, |ast, args| ast.new_(callee, args, span))
        } else {
            self.primary()?
        };
        e = self.member_suffixes(e, lo, true)?;
        Ok(e)
    }

    fn member_suffixes(&mut self, mut e: NodeId, lo: u32, calls: bool) -> R<NodeId> {
        loop {
            match self.tok.t {
                T::Dot => {
                    self.bump()?;
                    let prop = self.property_name_ident()?;
                    e = self.ast.member(e, prop, false, false, self.span_from(lo));
                }
                T::QuestionDot => {
                    self.bump()?;
                    match self.tok.t {
                        T::LParen if calls => {
                            let args = self.arguments()?;
                            let span = self.span_from(lo);
                            e = self.close(args, |ast, args| ast.call(e, args, true, span));
                        }
                        T::LBracket => {
                            self.bump()?;
                            let p = self.expression()?;
                            self.expect(T::RBracket, "]")?;
                            e = self.ast.member(e, p, true, true, self.span_from(lo));
                        }
                        _ => {
                            let prop = self.property_name_ident()?;
                            e = self.ast.member(e, prop, false, true, self.span_from(lo));
                        }
                    }
                }
                T::LBracket => {
                    self.bump()?;
                    let p = self.expression()?;
                    self.expect(T::RBracket, "]")?;
                    e = self.ast.member(e, p, true, false, self.span_from(lo));
                }
                T::LParen if calls => {
                    let args = self.arguments()?;
                    let span = self.span_from(lo);
                    e = self.close(args, |ast, args| ast.call(e, args, false, span));
                }
                T::Template { .. } => return self.fail("tagged templates are not supported"),
                T::Op if self.ts && self.text(self.tok) == "!" && !self.tok.nl_before => {
                    let bang = self.bump()?;
                    self.ts(e, TsKind::NonNull, bang.span);
                }
                T::Op if calls && self.ts && self.is_op("<") && self.type_args_before_call() => {
                    self.maybe_type_args(e)?;
                }
                _ => return Ok(e),
            }
        }
    }

    fn property_name_ident(&mut self) -> R<NodeId> {
        match self.tok.t {
            T::Ident => {
                let t = self.bump()?;
                Ok(self.ast.ident(self.text(t), t.span))
            }
            T::PrivateName => self.fail("private names are not supported"),
            _ => self.fail("expected property name"),
        }
    }

    fn arguments(&mut self) -> R<List> {
        self.expect(T::LParen, "(")?;
        let args = self.open();
        while self.tok.t != T::RParen {
            let lo = self.tok.span.lo;
            let a = self.assignment_or_spread(lo)?;
            self.item(a);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RParen, ")")?;
        Ok(args)
    }

    fn string_node(&mut self, t: Tok) -> NodeId {
        let body = Span::new(t.span.lo + 1, t.span.hi - 1);
        match decode_string(body.text(self.src)) {
            Some(v) => self.ast.str_owned(&v, t.span),
            None => self.ast.str_in_source(body, t.span),
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

    fn primary(&mut self) -> R<NodeId> {
        let t = self.tok;
        let lo = t.span.lo;
        match t.t {
            T::Ident => {
                let text = self.text(t);
                match text {
                    "true" | "false" => {
                        self.bump()?;
                        Ok(self.ast.bool(text == "true", t.span))
                    }
                    "null" => {
                        self.bump()?;
                        Ok(self.ast.null(t.span))
                    }
                    "this" => {
                        self.bump()?;
                        Ok(self.ast.this(t.span))
                    }
                    "function" => self.function(false, lo, false),
                    "async"
                        if self.peek().t == T::Ident && self.text(self.peek()) == "function" =>
                    {
                        self.bump()?;
                        self.function(false, lo, true)
                    }
                    "class" | "super" | "import" | "yield" => {
                        self.fail(format!("unsupported expression `{text}`"))
                    }
                    _ if RESERVED.contains(&text) => {
                        self.fail(format!("unexpected keyword `{text}`"))
                    }
                    _ => {
                        self.bump()?;
                        Ok(self.ast.ident(text, t.span))
                    }
                }
            }
            T::Num => {
                self.bump()?;
                match Self::number_value(self.text(t)) {
                    Some(v) => Ok(self.ast.num(v, t.span)),
                    None => self.fail("invalid number"),
                }
            }
            T::Str => {
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
                while self.tok.t != T::RBracket {
                    let ilo = self.tok.span.lo;
                    if self.tok.t == T::Comma {
                        self.bump()?;
                        let hole = self.ast.hole(Span::new(ilo, ilo));
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
                let span = self.span_from(lo);
                Ok(self.close(items, |ast, items| ast.array(items, span)))
            }
            T::LBrace => self.object(),
            T::Op if matches!(self.text(t), "/" | "/=") => {
                self.fail("regular expression literals are not supported")
            }
            T::Op if self.ts && self.text(t) == "<" => {
                self.fail("TypeScript type assertions / generic arrows are not supported")
            }
            T::Eof => self.fail("unexpected end of input"),
            _ => self.fail(format!("unexpected token `{}`", self.text(t))),
        }
    }

    fn template(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let mut quasis = Vec::new();
        let mut exprs = Vec::new();
        loop {
            let T::Template { tail } = self.tok.t else {
                return self.fail("expected template continuation");
            };
            let s = self.tok.span;
            let raw = Span::new(s.lo + 1, if tail { s.hi - 1 } else { s.hi - 2 });
            quasis.push(self.ast.template_elem_in_source(raw, tail, raw));
            if tail {
                self.bump()?;
                break;
            }
            self.bump()?;
            exprs.push(self.expression()?);
            if self.tok.t != T::RBrace {
                return self.fail("expected `}` in template literal");
            }
            self.tok = self.lex.template_continue(self.tok.span)?;
        }
        Ok(self.ast.template(&quasis, &exprs, self.span_from(lo)))
    }

    fn object(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        self.bump()?;
        let props = self.open();
        while self.tok.t != T::RBrace {
            let plo = self.tok.span.lo;
            if self.eat(T::Ellipsis)? {
                let a = self.assignment()?;
                let spread = self.ast.spread(a, self.span_from(plo));
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
                let (key, computed, key_tok) = self.property_key()?;
                if self.tok.t == T::LParen {
                    let params = self.params()?;
                    let ret = self.maybe_return_type(false)?;
                    let body = self.block()?;
                    let span = Span::new(key_tok.lo, self.prev_end);
                    let f = self.close(params, |ast, params| {
                        ast.function(false, None, params, body, is_async, span)
                    });
                    self.signature_ts(f, None, ret);
                    let flags = flag::METHOD | if computed { flag::COMPUTED } else { 0 };
                    let prop = self.ast.property(key, f, flags, self.span_from(plo));
                    self.item(prop);
                } else if self.eat(T::Colon)? {
                    let v = self.assignment()?;
                    let flags = if computed { flag::COMPUTED } else { 0 };
                    let prop = self.ast.property(key, v, flags, self.span_from(plo));
                    self.item(prop);
                } else if let Some(name) = self.ast.atom(key).filter(|_| !computed) {
                    let value = self.ast.ident_atom(name, key_tok);
                    let prop = self
                        .ast
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
        let span = self.span_from(lo);
        Ok(self.close(props, |ast, props| ast.object(props, span)))
    }

    fn property_key(&mut self) -> R<(NodeId, bool, Span)> {
        let t = self.tok;
        match t.t {
            T::Ident => {
                self.bump()?;
                Ok((self.ast.ident(self.text(t), t.span), false, t.span))
            }
            T::Str => {
                self.bump()?;
                Ok((self.string_node(t), false, t.span))
            }
            T::Num => {
                self.bump()?;
                let v = Self::number_value(self.text(t)).unwrap_or(0.0);
                Ok((self.ast.num(v, t.span), false, t.span))
            }
            T::LBracket => {
                self.bump()?;
                let e = self.assignment()?;
                self.expect(T::RBracket, "]")?;
                Ok((e, true, Span::new(t.span.lo, self.prev_end)))
            }
            _ => self.fail("expected property key"),
        }
    }

    // ---- binding patterns
    // ------------------------------------------------------------------------

    fn binding_target(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        match self.tok.t {
            T::Ident => {
                let t = self.bump()?;
                if RESERVED.contains(&self.text(t)) {
                    return Err(ParseError {
                        message: format!("unexpected keyword `{}`", self.text(t)),
                        span: t.span,
                    });
                }
                Ok(self.ast.ident(self.text(t), t.span))
            }
            T::LBrace => {
                self.bump()?;
                let props = self.open();
                while self.tok.t != T::RBrace {
                    let plo = self.tok.span.lo;
                    let prop = if self.eat(T::Ellipsis)? {
                        let arg = self.binding_target()?;
                        self.ast.rest(arg, self.span_from(plo))
                    } else {
                        let (key, computed, key_span) = self.property_key()?;
                        if self.eat(T::Colon)? {
                            let value = self.binding_element()?;
                            let flags = if computed { flag::COMPUTED } else { 0 };
                            self.ast.property(key, value, flags, self.span_from(plo))
                        } else {
                            let Some(name) = self.ast.atom(key).filter(|_| !computed) else {
                                return self.fail("expected `:`");
                            };
                            let mut value = self.ast.ident_atom(name, key_span);
                            if self.eat_op("=")? {
                                let d = self.assignment()?;
                                value = self.ast.assign_pat(value, d, self.span_from(plo));
                            }
                            self.ast
                                .property(key, value, flag::SHORTHAND, self.span_from(plo))
                        }
                    };
                    self.item(prop);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBrace, "}")?;
                let span = self.span_from(lo);
                Ok(self.close(props, |ast, props| ast.object_pat(props, span)))
            }
            T::LBracket => {
                self.bump()?;
                let items = self.open();
                while self.tok.t != T::RBracket {
                    let ilo = self.tok.span.lo;
                    if self.tok.t == T::Comma {
                        self.bump()?;
                        let hole = self.ast.hole(Span::new(ilo, ilo));
                        self.item(hole);
                        continue;
                    }
                    let item = if self.eat(T::Ellipsis)? {
                        let arg = self.binding_target()?;
                        self.ast.rest(arg, self.span_from(ilo))
                    } else {
                        self.binding_element()?
                    };
                    self.item(item);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBracket, "]")?;
                let span = self.span_from(lo);
                Ok(self.close(items, |ast, items| ast.array_pat(items, span)))
            }
            _ => self.fail("expected a binding name or pattern"),
        }
    }

    fn binding_element(&mut self) -> R<NodeId> {
        let lo = self.tok.span.lo;
        let target = self.binding_target()?;
        if self.eat_op("=")? {
            let d = self.assignment()?;
            return Ok(self.ast.assign_pat(target, d, self.span_from(lo)));
        }
        Ok(target)
    }
}
