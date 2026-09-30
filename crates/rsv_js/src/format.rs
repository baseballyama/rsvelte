//! Formats a JS/TS tree the way Prettier's estree printer does (prettier 3.x, `semi: true`,
//! `trailingComma: "all"`, `bracketSpacing: true`, `arrowParens: "always"`,
//! `objectWrap: "preserve"`).
//!
//! Each node builds the document Prettier builds for it, so the kernel's printer lays it out the
//! same way. Two escape hatches keep the output honest where the port is partial:
//!
//! - a layout whose broken form is not ported (member chains, argument hugging, binary operators,
//!   assignment layouts that depend on them) is wrapped in [`Docs::flat_only`]: it prints only when
//!   it fits on its line, and printing refuses otherwise;
//! - a node kind, comment or TypeScript form the port does not handle is an [`Unsupported`] error
//!   before anything is printed.
//!
//! TypeScript types are not parsed into nodes (see [`crate::ast::TsSyntax`]); a type prints as its
//! source text only when that text is a plain type reference (`Props`, `string`, `a.B[]`).

pub use rsv_kernel::diag::Unsupported;
use rsv_kernel::doc::{DocId, Docs};
use rsv_kernel::source::{LineIndex, Span};

use crate::ast::{Ast, Kind, NodeId, TsKind, TsSyntax, flag};
use crate::ops::{BinOp, LogicalOp, UnaryOp};

type R<T> = Result<T, Unsupported>;

#[derive(Clone, Copy, Default, Debug)]
pub struct Options {
    pub single_quote: bool,
    /// Inside an HTML attribute value (Prettier's `__isInHtmlAttribute`): strings always take
    /// single quotes, whatever they contain, so the attribute's double quotes never need escaping.
    pub html_attribute: bool,
}

/// Where an expression sits in its parent; decides parentheses (Prettier's `needsParens`).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Slot {
    Statement,
    Left,
    Right,
    Object,
    Callee,
    Argument,
    Test,
    Branch,
    Operand,
    ArrowBody,
    Init,
    Value,
    Element,
}

/// Where a binding pattern sits; decides grouping of object patterns (Prettier's `printObject`).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum PatCtx {
    Declarator,
    AssignLeft,
    /// A function parameter; `hug` when it is the only one and Prettier hugs it.
    Param {
        hug: bool,
    },
    /// The left side of a default (`a = 1`), where Prettier never forces a break.
    DefaultLeft,
    Nested,
}

#[derive(Debug)]
pub struct Formatter<'a> {
    ast: &'a Ast,
    src: &'a str,
    lines: &'a LineIndex,
    pub docs: &'a mut Docs,
    opts: Options,
    /// `ast.ts` sorted by node, for lookups while printing.
    ts: Vec<TsSyntax>,
    ts_printed: usize,
    /// The leftmost node of an expression statement or arrow body that must be parenthesized.
    paren_leftmost: Option<NodeId>,
    /// The parent and slot of the expression being printed.
    at: Option<(NodeId, Slot)>,
}

impl<'a> Formatter<'a> {
    pub fn new(
        ast: &'a Ast,
        src: &'a str,
        lines: &'a LineIndex,
        docs: &'a mut Docs,
        opts: Options,
    ) -> Self {
        let mut ts = ast.ts.clone();
        ts.sort_by_key(|t| (t.node, t.span.lo));
        Formatter {
            ast,
            src,
            lines,
            docs,
            opts,
            ts,
            ts_printed: 0,
            paren_leftmost: None,
            at: None,
        }
    }

    pub const fn set_options(&mut self, opts: Options) {
        self.opts = opts;
    }

    /// A whole program: statements, ending with a hard line (Prettier's `Program`).
    ///
    /// # Errors
    ///
    /// [`Unsupported`] if the program holds a comment or a construct this printer does not handle.
    pub fn program(&mut self, id: NodeId) -> R<DocId> {
        let Kind::Program(body) = self.ast.kind(id) else {
            unreachable!("a program node")
        };
        let range = self.span(id);
        self.check_comments(range)?;
        let before = self.ts_printed;
        let stmts = self.statements(body)?;
        self.check_ts(range, before)?;
        if stmts.is_empty() {
            return Ok(self.docs.nil());
        }
        let h = self.docs.hardline();
        let body = self.docs.concat(&stmts);
        Ok(self.docs.concat(&[body, h]))
    }

    /// A root expression, as embedded in a template (`{expr}`).
    ///
    /// # Errors
    ///
    /// [`Unsupported`] if the expression holds a comment or a construct this printer does not
    /// handle.
    pub fn expression(&mut self, id: NodeId) -> R<DocId> {
        let range = self.span(id);
        self.check_comments(range)?;
        let before = self.ts_printed;
        let d = self.expr(id, None, Slot::Value)?;
        self.check_ts(range, before)?;
        Ok(d)
    }

    /// One binding pattern on its own, as Prettier prints a parameter of an embedded binding
    /// list (a `v-for` alias).
    ///
    /// # Errors
    ///
    /// [`Unsupported`] if the pattern holds a comment or a construct this printer does not handle.
    pub fn parameter(&mut self, id: NodeId) -> R<DocId> {
        let range = self.span(id);
        self.check_comments(range)?;
        let before = self.ts_printed;
        let d = self.pattern(id, PatCtx::Param { hug: false })?;
        self.check_ts(range, before)?;
        Ok(d)
    }

    fn span(&self, id: NodeId) -> Span {
        self.ast
            .loc(id)
            .span()
            .expect("formatting only reads parsed trees, whose nodes have source spans")
    }

    fn check_comments(&self, range: Span) -> R<()> {
        let c = &self.ast.comments;
        let i = c.partition_point(|s| s.lo < range.lo);
        if let Some(&s) = c.get(i).filter(|s| s.hi <= range.hi) {
            return Err(Unsupported::at("comments", s));
        }
        Ok(())
    }

    /// Every piece of TypeScript syntax inside `range` must have been printed.
    fn check_ts(&self, range: Span, before: usize) -> R<()> {
        let expected = self
            .ts
            .iter()
            .filter(|t| t.span.lo >= range.lo && t.span.hi <= range.hi)
            .count();
        if self.ts_printed - before != expected {
            return Err(Unsupported::at("TypeScript syntax", range));
        }
        Ok(())
    }

    fn ts_of(&self, node: NodeId, kind: TsKind) -> Option<Span> {
        let i = self.ts.partition_point(|t| t.node < node);
        self.ts[i..]
            .iter()
            .take_while(|t| t.node == node)
            .find(|t| t.kind == kind)
            .map(|t| t.span)
    }

    /// `sep` + the type's text (or nothing); counts the type as printed.
    fn type_suffix(&mut self, span: Option<Span>, sep: &'static str) -> R<DocId> {
        let Some(span) = span else {
            return Ok(self.docs.nil());
        };
        let text = span.text(self.src);
        let Some(t) = self.type_doc(text) else {
            return Err(Unsupported::at(
                "TypeScript type other than a plain reference, a union of them or a type literal",
                span,
            ));
        };
        self.ts_printed += 1;
        let s = self.docs.lit(sep);
        Ok(self.docs.concat(&[s, t]))
    }

    /// A plain reference, a union of them, or a type literal whose members have such types
    /// (Prettier's object printing: broken when the source breaks after `{`).
    fn type_doc(&mut self, text: &str) -> Option<DocId> {
        let text = text.trim();
        if let Some(u) = union_of_plain_types(text) {
            return Some(self.docs.text(&u));
        }
        let body = text.strip_prefix('{')?.strip_suffix('}')?;
        if body.contains(['{', '}', '(', '<', '[', '\'', '"']) {
            return None;
        }
        let mut members = Vec::new();
        for m in body
            .split([';', ',', '\n'])
            .map(str::trim)
            .filter(|m| !m.is_empty())
        {
            let (key, ty) = m.split_once(':')?;
            let key = key.trim();
            let (name, optional) = key
                .strip_suffix('?')
                .map_or((key, false), |k| (k.trim_end(), true));
            if !is_plain_type(name) || name.contains('.') {
                return None;
            }
            let ty = union_of_plain_types(ty.trim())?;
            let q = if optional { "?" } else { "" };
            members.push(self.docs.text(&format!("{name}{q}: {ty}")));
        }
        if members.is_empty() {
            return Some(self.docs.lit("{}"));
        }
        let broken = body
            .split_once(|c: char| !c.is_whitespace())
            .is_some_and(|(lead, _)| lead.contains('\n'))
            || body.trim_start().is_empty();
        let semi = self.docs.lit(";");
        let l = self.docs.line();
        let sep = self.docs.concat(&[semi, l]);
        let joined = self.docs.join(sep, &members);
        let l = self.docs.line();
        let mut inner = vec![l];
        inner.extend(joined);
        let inner = self.docs.concat(&inner);
        let inner = self.docs.indent(inner);
        let semi = self.docs.lit(";");
        let nil = self.docs.nil();
        let trailing = self.docs.if_break(semi, nil);
        let open = self.docs.lit("{");
        let l = self.docs.line();
        let close = self.docs.lit("}");
        let parts = [open, inner, trailing, l, close];
        Some(if broken {
            self.docs.group_broken(&parts)
        } else {
            self.docs.group(&parts)
        })
    }

    fn lit(&mut self, s: &'static str) -> DocId {
        self.docs.lit(s)
    }

    fn cat(&mut self, items: &[DocId]) -> DocId {
        self.docs.concat(items)
    }

    /// `[open, indent([sep, ...items]), trailing, sep2, close]`, the shape of every bracketed list.
    fn bracketed(
        &mut self,
        open: &'static str,
        first: DocId,
        items: Vec<DocId>,
        trailing: DocId,
        last: DocId,
        close: &'static str,
    ) -> [DocId; 5] {
        let o = self.lit(open);
        let mut inner = vec![first];
        inner.extend(items);
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let c = self.lit(close);
        [o, inner, trailing, last, c]
    }

    /// `ifBreak(",")`.
    fn trailing_comma(&mut self) -> DocId {
        let c = self.lit(",");
        let e = self.docs.nil();
        self.docs.if_break(c, e)
    }

    /// Prettier's `isNextLineEmpty` between two siblings, from their lines (comments are refused
    /// before printing, so only whitespace can separate them).
    fn blank_line_between(&self, a: NodeId, b: NodeId) -> bool {
        let end = self.lines.line_col(self.span(a).hi).line;
        let start = self.lines.line_col(self.span(b).lo).line;
        start > end + 1
    }

    /// Prettier's `printStatementSequence`.
    fn statements(&mut self, body: &[NodeId]) -> R<Vec<DocId>> {
        let body: Vec<NodeId> = body
            .iter()
            .copied()
            .filter(|&s| !matches!(self.ast.kind(s), Kind::Empty))
            .collect();
        let mut out = Vec::new();
        for (i, &s) in body.iter().enumerate() {
            out.push(self.statement(s)?);
            if let Some(&next) = body.get(i + 1) {
                out.push(self.docs.hardline());
                if self.blank_line_between(s, next) {
                    out.push(self.docs.hardline());
                }
            }
        }
        Ok(out)
    }

    fn statement(&mut self, id: NodeId) -> R<DocId> {
        match self.ast.kind(id) {
            Kind::VarDecl { kind, decls } => self.var_decl(kind, decls),
            Kind::ExprStmt(e) => {
                self.paren_leftmost = self.leftmost_needing_parens(e, false);
                let e = self.expr(e, Some(id), Slot::Statement)?;
                let semi = self.lit(";");
                Ok(self.cat(&[e, semi]))
            }
            Kind::Function { .. } => self.function(id),
            Kind::Return(arg) => self.return_(id, arg),
            Kind::If { test, cons, alt } => self.if_(id, test, cons, alt),
            Kind::Block(_) => self.block(id, false),
            Kind::Import {
                specifiers,
                source,
                type_only,
            } => Ok(self.import(specifiers, source, type_only)),
            Kind::TsInterface { name, members } => self.interface(name, members),
            Kind::ExportNamed(d) => {
                let d = self.statement(d)?;
                let e = self.lit("export ");
                Ok(self.cat(&[e, d]))
            }
            Kind::TsDecl => Err(Unsupported::at("TypeScript declaration", self.ast.loc(id))),
            _ => Err(Unsupported::at("statement kind", self.ast.loc(id))),
        }
    }

    /// Prettier's `printVariableDeclaration`.
    fn var_decl(&mut self, kind: u8, decls: &[NodeId]) -> R<DocId> {
        let kw = match kind {
            flag::LET => "let",
            flag::CONST => "const",
            _ => "var",
        };
        let printed = decls
            .iter()
            .map(|&d| self.declarator(d))
            .collect::<R<Vec<_>>>()?;
        let has_init = decls
            .iter()
            .any(|&d| matches!(self.ast.kind(d), Kind::Declarator { init: Some(_), .. }));
        let first = if printed.len() == 1 {
            printed[0]
        } else {
            self.docs.indent(printed[0])
        };
        let mut rest = Vec::new();
        for &p in &printed[1..] {
            let comma = self.lit(",");
            let sep = if has_init {
                self.docs.hardline()
            } else {
                self.docs.line()
            };
            rest.push(self.cat(&[comma, sep, p]));
        }
        let rest = self.cat(&rest);
        let rest = self.docs.indent(rest);
        let kw = self.lit(kw);
        let sp = self.lit(" ");
        let semi = self.lit(";");
        Ok(self.docs.group(&[kw, sp, first, rest, semi]))
    }

    fn declarator(&mut self, id: NodeId) -> R<DocId> {
        let Kind::Declarator { id: target, init } = self.ast.kind(id) else {
            unreachable!("a declarator")
        };
        let left = self.pattern(target, PatCtx::Declarator)?;
        let Some(init) = init else {
            return Ok(left);
        };
        let right = self.expr(init, Some(id), Slot::Init)?;
        let op = self.lit(" =");
        Ok(self.assignment(left, op, right, target, init))
    }

    /// Prettier's `printAssignment`.
    fn assignment(
        &mut self,
        left: DocId,
        op: DocId,
        right: DocId,
        target: NodeId,
        value: NodeId,
    ) -> DocId {
        match self.assignment_layout(target, value) {
            Layout::BreakAfterOperator => {
                let l = self.docs.group(&[left]);
                let line = self.docs.line();
                let r = self.cat(&[line, right]);
                let r = self.docs.indent(r);
                let r = self.docs.group(&[r]);
                self.docs.group(&[l, op, r])
            }
            Layout::NeverBreakAfterOperator => {
                let l = self.docs.group(&[left]);
                let sp = self.lit(" ");
                self.docs.group(&[l, op, sp, right])
            }
            Layout::BreakLhs => {
                let sp = self.lit(" ");
                let r = self.docs.group(&[right]);
                self.docs.group(&[left, op, sp, r])
            }
            Layout::Fluid => {
                let l = self.docs.group(&[left]);
                let id = self.docs.new_group_id();
                let line = self.docs.line();
                let ind = self.docs.indent(line);
                let g = self.docs.group_with_id(&[ind], id);
                let r = self.docs.indent_if_break(right, id);
                self.docs.group(&[l, op, g, r])
            }
            Layout::Unported => {
                let sp = self.lit(" ");
                let flat = self.cat(&[left, op, sp, right]);
                self.docs.flat_only(flat)
            }
        }
    }

    /// Prettier's `chooseLayout`. Its `canBreakLeftDoc` holds only for a non-empty destructuring
    /// pattern here, since types print as plain text.
    fn assignment_layout(&self, target: NodeId, value: NodeId) -> Layout {
        let left_can_break = match self.ast.kind(target) {
            Kind::ObjectPat(p) | Kind::ArrayPat(p) => !p.is_empty(),
            _ => false,
        };
        let v = self.ast.kind(value);
        if matches!(v, Kind::Assign(..)) {
            return Layout::Unported;
        }
        if self.breaks_after_operator(value) {
            return Layout::BreakAfterOperator;
        }
        if self.complex_destructuring(target) {
            return Layout::BreakLhs;
        }
        match v {
            Kind::Arrow { .. } if left_can_break => Layout::BreakLhs,
            Kind::Str | Kind::Seq(_) => Layout::BreakAfterOperator,
            Kind::Cond { test, .. } if self.breaks_after_operator(test) => {
                Layout::BreakAfterOperator
            }
            Kind::Unary(_, a) | Kind::Await(a) => match self.ast.kind(a) {
                Kind::Str => Layout::BreakAfterOperator,
                Kind::Member { .. } | Kind::Call { .. } | Kind::New { .. } => Layout::Unported,
                _ => Layout::Fluid,
            },
            // `isPoorlyBreakableMemberOrCallChain` decides these.
            Kind::Member { .. } | Kind::Call { .. } | Kind::New { .. } => Layout::Unported,
            Kind::Template { .. } | Kind::Bool(_) | Kind::Num(_) if !left_can_break => {
                Layout::NeverBreakAfterOperator
            }
            _ => Layout::Fluid,
        }
    }

    /// A binary or logical expression Prettier does not inline (`shouldInlineLogicalExpression`).
    fn breaks_after_operator(&self, id: NodeId) -> bool {
        match self.ast.kind(id) {
            Kind::Binary(..) => true,
            Kind::Logical(_, _, r) => match self.ast.kind(r) {
                Kind::Object(p) => p.is_empty(),
                Kind::Array(e) => e.is_empty(),
                _ => true,
            },
            _ => false,
        }
    }

    /// Prettier's `isComplexDestructuringTarget`.
    fn complex_destructuring(&self, target: NodeId) -> bool {
        let Kind::ObjectPat(props) = self.ast.kind(target) else {
            return false;
        };
        props.len() > 2
            && props.iter().any(|&p| match self.ast.kind(p) {
                Kind::Property {
                    shorthand, value, ..
                } => !shorthand || matches!(self.ast.kind(value), Kind::AssignPat(..)),
                _ => false,
            })
    }

    /// Prettier's `printFunction`.
    fn function(&mut self, id: NodeId) -> R<DocId> {
        let Kind::Function {
            name,
            params,
            body,
            is_async,
            ..
        } = self.ast.kind(id)
        else {
            unreachable!("a function")
        };
        if self.ts_of(id, TsKind::TypeParams).is_some() {
            return Err(Unsupported::at("type parameters", self.ast.loc(id)));
        }
        let mut parts = Vec::new();
        if is_async {
            parts.push(self.lit("async "));
        }
        parts.push(self.lit("function "));
        if let Some(n) = name {
            parts.push(self.docs.text(self.ast.name(n)));
        }
        // `shouldGroupFunctionParameters` needs an object-type or breaking return type; a plain
        // type reference is neither.
        let ps = self.params(params)?;
        let ret = self.type_suffix(self.ts_of(id, TsKind::ReturnType), ": ")?;
        parts.push(self.docs.group(&[ps, ret]));
        parts.push(self.lit(" "));
        parts.push(self.block(body, true)?);
        Ok(self.cat(&parts))
    }

    /// Prettier's `printFunctionParameters`.
    fn params(&mut self, params: &[NodeId]) -> R<DocId> {
        if params.is_empty() {
            return Ok(self.lit("()"));
        }
        let hug = self.hug_only_param(params);
        let mut printed = Vec::new();
        for (i, &p) in params.iter().enumerate() {
            printed.push(self.pattern(p, PatCtx::Param { hug })?);
            if i + 1 < params.len() {
                printed.push(self.lit(","));
                printed.push(self.docs.line());
            }
        }
        if hug {
            let open = self.lit("(");
            let close = self.lit(")");
            let mut parts = vec![open];
            parts.extend(printed);
            parts.push(close);
            return Ok(self.cat(&parts));
        }
        let ends_in_rest = matches!(
            self.ast.kind(*params.last().expect("non-empty")),
            Kind::Rest(_)
        );
        let trailing = if ends_in_rest {
            self.docs.nil()
        } else {
            self.trailing_comma()
        };
        let soft = self.docs.softline();
        let soft2 = self.docs.softline();
        let parts = self.bracketed("(", soft, printed, trailing, soft2, ")");
        Ok(self.cat(&parts))
    }

    /// Prettier's `shouldHugTheOnlyFunctionParameter`.
    fn hug_only_param(&self, params: &[NodeId]) -> bool {
        let [p] = params else { return false };
        match self.ast.kind(*p) {
            Kind::ObjectPat(_) | Kind::ArrayPat(_) => true,
            Kind::AssignPat(l, r) => {
                matches!(self.ast.kind(l), Kind::ObjectPat(_) | Kind::ArrayPat(_))
                    && match self.ast.kind(r) {
                        Kind::Ident(_) => true,
                        Kind::Object(p) => p.is_empty(),
                        Kind::Array(e) => e.is_empty(),
                        _ => false,
                    }
            }
            _ => false,
        }
    }

    /// Prettier's `printBlock`; `fn_body` for the bodies that print `{}` when empty.
    fn block(&mut self, id: NodeId, fn_body: bool) -> R<DocId> {
        let Kind::Block(body) = self.ast.kind(id) else {
            return Err(Unsupported::at("non-block body", self.ast.loc(id)));
        };
        let stmts = self.statements(body)?;
        let open = self.lit("{");
        let close = self.lit("}");
        if stmts.is_empty() {
            if fn_body {
                return Ok(self.cat(&[open, close]));
            }
            let h = self.docs.hardline();
            return Ok(self.cat(&[open, h, close]));
        }
        let h = self.docs.hardline();
        let mut inner = vec![h];
        inner.extend(stmts);
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let h = self.docs.hardline();
        Ok(self.cat(&[open, inner, h, close]))
    }

    /// Prettier's `printReturnOrThrowArgument`.
    fn return_(&mut self, id: NodeId, arg: Option<NodeId>) -> R<DocId> {
        let kw = self.lit("return");
        let semi = self.lit(";");
        let Some(a) = arg else {
            return Ok(self.cat(&[kw, semi]));
        };
        let printed = self.expr(a, Some(id), Slot::Argument)?;
        let sp = self.lit(" ");
        let arg = if matches!(
            self.ast.kind(a),
            Kind::Binary(..) | Kind::Logical(..) | Kind::Seq(_)
        ) {
            let lp = self.lit("(");
            let e = self.docs.nil();
            let open = self.docs.if_break(lp, e);
            let soft = self.docs.softline();
            let inner = self.cat(&[soft, printed]);
            let inner = self.docs.indent(inner);
            let soft = self.docs.softline();
            let rp = self.lit(")");
            let e = self.docs.nil();
            let close = self.docs.if_break(rp, e);
            self.docs.group(&[open, inner, soft, close])
        } else {
            printed
        };
        Ok(self.cat(&[kw, sp, arg, semi]))
    }

    /// Prettier's `printIfStatement`.
    fn if_(&mut self, id: NodeId, test: NodeId, cons: NodeId, alt: Option<NodeId>) -> R<DocId> {
        let t = self.expr(test, Some(id), Slot::Test)?;
        let soft = self.docs.softline();
        let inner = self.cat(&[soft, t]);
        let inner = self.docs.indent(inner);
        let soft = self.docs.softline();
        let test_doc = self.docs.group(&[inner, soft]);
        let open = self.lit("if (");
        let close = self.lit(")");
        let c = self.clause(cons, false)?;
        let opening = self.docs.group(&[open, test_doc, close, c]);
        let mut parts = vec![opening];
        if let Some(a) = alt {
            let same_line = matches!(self.ast.kind(cons), Kind::Block(_));
            parts.push(if same_line {
                self.lit(" ")
            } else {
                self.docs.hardline()
            });
            parts.push(self.lit("else"));
            let is_if = matches!(self.ast.kind(a), Kind::If { .. });
            let a = self.clause(a, is_if)?;
            parts.push(self.docs.group(&[a]));
        }
        Ok(self.docs.group(&parts))
    }

    /// Prettier's `adjustClause`.
    fn clause(&mut self, body: NodeId, force_space: bool) -> R<DocId> {
        match self.ast.kind(body) {
            Kind::Empty => Ok(self.lit(";")),
            Kind::Block(_) => {
                let b = self.block(body, false)?;
                let sp = self.lit(" ");
                Ok(self.cat(&[sp, b]))
            }
            _ => {
                let s = self.statement(body)?;
                if force_space {
                    let sp = self.lit(" ");
                    Ok(self.cat(&[sp, s]))
                } else {
                    let line = self.docs.line();
                    let inner = self.cat(&[line, s]);
                    Ok(self.docs.indent(inner))
                }
            }
        }
    }

    /// Prettier's `printImportDeclaration`, without import attributes.
    fn import(&mut self, specifiers: &[NodeId], source: NodeId, type_only: bool) -> DocId {
        let mut parts = vec![self.lit(if type_only { "import type" } else { "import" })];
        if !specifiers.is_empty() {
            parts.push(self.lit(" "));
            let mut standalone = Vec::new();
            let mut named = Vec::new();
            for &s in specifiers {
                match self.ast.kind(s) {
                    Kind::ImportDefault(l) => standalone.push(self.docs.text(self.ast.name(l))),
                    Kind::ImportNamespace(l) => {
                        let text = format!("* as {}", self.ast.name(l));
                        standalone.push(self.docs.text(&text));
                    }
                    Kind::ImportNamed { imported, local } => {
                        let i = self.ast.name(imported);
                        let l = self.ast.name(local);
                        let tk = if self.ast.flags(s) & flag::TYPE_ONLY != 0 {
                            "type "
                        } else {
                            ""
                        };
                        let text = if i == l {
                            format!("{tk}{i}")
                        } else {
                            format!("{tk}{i} as {l}")
                        };
                        named.push(self.docs.text(&text));
                    }
                    _ => unreachable!("import specifier"),
                }
            }
            let sep = self.lit(", ");
            parts.extend(self.docs.join(sep, &standalone));
            if !named.is_empty() {
                if !standalone.is_empty() {
                    parts.push(self.lit(", "));
                }
                if named.len() > 1 || !standalone.is_empty() {
                    let comma = self.lit(",");
                    let l = self.docs.line();
                    let sep = self.cat(&[comma, l]);
                    let items = self.docs.join(sep, &named);
                    let line = self.docs.line();
                    let trailing = self.trailing_comma();
                    let line2 = self.docs.line();
                    let g = self.bracketed("{", line, items, trailing, line2, "}");
                    parts.push(self.docs.group(&g));
                } else {
                    parts.push(self.lit("{ "));
                    parts.push(named[0]);
                    parts.push(self.lit(" }"));
                }
            }
            parts.push(self.lit(" from"));
        }
        parts.push(self.lit(" "));
        parts.push(self.string(source));
        parts.push(self.lit(";"));
        self.cat(&parts)
    }

    /// `interface Name { key?: T; }` as Prettier prints a `TSInterfaceDeclaration` whose body has
    /// only property signatures: one member per line, each ending in `;`.
    fn interface(&mut self, name: NodeId, members: &[NodeId]) -> R<DocId> {
        let head = format!("interface {} ", self.ast.name(name));
        let head = self.docs.text(&head);
        if members.is_empty() {
            let b = self.lit("{}");
            return Ok(self.cat(&[head, b]));
        }
        let mut inner = Vec::new();
        for (i, &m) in members.iter().enumerate() {
            let Kind::TsPropSig { key, optional } = self.ast.kind(m) else {
                unreachable!("interface member")
            };
            inner.push(self.docs.hardline());
            if i > 0 && self.blank_line_between(members[i - 1], m) {
                inner.push(self.docs.hardline());
            }
            inner.push(self.docs.text(self.ast.name(key)));
            if optional {
                inner.push(self.lit("?"));
            }
            let ty = self.type_suffix(self.ts_of(m, TsKind::Annotation), ": ")?;
            inner.push(ty);
            inner.push(self.lit(";"));
        }
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let open = self.lit("{");
        let h = self.docs.hardline();
        let close = self.lit("}");
        Ok(self.cat(&[head, open, inner, h, close]))
    }

    /// A binding target: identifier (with its annotation), pattern, default or rest.
    fn pattern(&mut self, id: NodeId, ctx: PatCtx) -> R<DocId> {
        match self.ast.kind(id) {
            Kind::Ident(_) => {
                let name = self.docs.text(self.ast.name(id));
                let opt = if self.ts_of(id, TsKind::Optional).is_some() {
                    self.ts_printed += 1;
                    self.lit("?")
                } else {
                    self.docs.nil()
                };
                let ty = self.type_suffix(self.ts_of(id, TsKind::Annotation), ": ")?;
                Ok(self.cat(&[name, opt, ty]))
            }
            Kind::ObjectPat(props) => {
                let ty = self.type_suffix(self.ts_of(id, TsKind::Annotation), ": ")?;
                self.object(id, props, Some(ctx), ty)
            }
            Kind::ArrayPat(items) => {
                let ty = self.type_suffix(self.ts_of(id, TsKind::Annotation), ": ")?;
                self.array(items, ty)
            }
            Kind::AssignPat(l, r) => {
                let l = self.pattern(l, PatCtx::DefaultLeft)?;
                let eq = self.lit(" = ");
                let r = self.expr(r, Some(id), Slot::Right)?;
                Ok(self.cat(&[l, eq, r]))
            }
            Kind::Rest(a) => {
                let dots = self.lit("...");
                let a = self.pattern(a, PatCtx::Nested)?;
                Ok(self.cat(&[dots, a]))
            }
            _ => self.expr(id, None, Slot::Left),
        }
    }

    /// Prettier's `printObject` for object expressions (`pattern: None`) and patterns.
    fn object(
        &mut self,
        id: NodeId,
        props: &[NodeId],
        pattern: Option<PatCtx>,
        suffix: DocId,
    ) -> R<DocId> {
        let should_break = match pattern {
            Some(PatCtx::Param { .. } | PatCtx::DefaultLeft) => false,
            Some(_) => props.iter().any(|&p| {
                matches!(self.ast.kind(p), Kind::Property { value, .. }
                    if matches!(self.ast.kind(value), Kind::ObjectPat(_) | Kind::ArrayPat(_)))
            }),
            // `objectWrap: "preserve"`: a line break after `{` in the source keeps it expanded.
            None => props.first().is_some_and(|&p| {
                self.src[self.span(id).lo as usize..self.span(p).lo as usize].contains('\n')
            }),
        };
        if props.is_empty() {
            let o = self.lit("{");
            let c = self.lit("}");
            return Ok(self.docs.group(&[o, c, suffix]));
        }
        let mut items = Vec::new();
        for (i, &p) in props.iter().enumerate() {
            if i > 0 {
                items.push(self.lit(","));
                items.push(self.docs.line());
                if self.blank_line_between(props[i - 1], p) {
                    items.push(self.docs.hardline());
                }
            }
            items.push(self.property(p, pattern.is_some())?);
        }
        let ends_in_rest = matches!(
            self.ast.kind(*props.last().expect("non-empty")),
            Kind::Rest(_)
        );
        let trailing = if ends_in_rest {
            self.docs.nil()
        } else {
            self.trailing_comma()
        };
        let line = self.docs.line();
        let line2 = self.docs.line();
        let [o, inner, t, l, c] = self.bracketed("{", line, items, trailing, line2, "}");
        let body = [o, inner, t, l, c, suffix];
        let ungrouped = match pattern {
            Some(PatCtx::Param { hug }) => hug,
            Some(PatCtx::Declarator | PatCtx::AssignLeft) => !should_break,
            _ => false,
        };
        Ok(if ungrouped {
            self.cat(&body)
        } else if should_break {
            self.docs.group_broken(&body)
        } else {
            self.docs.group(&body)
        })
    }

    fn property(&mut self, p: NodeId, pattern: bool) -> R<DocId> {
        match self.ast.kind(p) {
            Kind::Property {
                key,
                value,
                shorthand,
                computed,
                method,
            } => {
                if method {
                    return Err(Unsupported::at("object method", self.ast.loc(p)));
                }
                let value_doc = |f: &mut Self| {
                    if pattern {
                        f.pattern(value, PatCtx::Nested)
                    } else {
                        f.expr(value, Some(p), Slot::Value)
                    }
                };
                if shorthand {
                    return value_doc(self);
                }
                let k = if computed {
                    let lb = self.lit("[");
                    let k = self.expr(key, Some(p), Slot::Value)?;
                    let rb = self.lit("]");
                    self.cat(&[lb, k, rb])
                } else if matches!(self.ast.kind(key), Kind::Ident(_)) {
                    self.docs.text(self.ast.name(key))
                } else {
                    return Err(Unsupported::at(
                        "quoted or numeric property key",
                        self.ast.loc(key),
                    ));
                };
                let v = value_doc(self)?;
                // A property is an assignment-like layout (`printAssignment` with ":"); not ported.
                let colon = self.lit(": ");
                let flat = self.cat(&[k, colon, v]);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Rest(a) | Kind::Spread(a) => {
                let dots = self.lit("...");
                let a = if pattern {
                    self.pattern(a, PatCtx::Nested)?
                } else {
                    self.expr(a, Some(p), Slot::Argument)?
                };
                Ok(self.cat(&[dots, a]))
            }
            _ => unreachable!("object member"),
        }
    }

    /// Prettier's `printArrayItems` in a group, for arrays that are not concisely printed.
    fn array(&mut self, items: &[NodeId], suffix: DocId) -> R<DocId> {
        if items.is_empty() {
            let o = self.lit("[");
            let c = self.lit("]");
            return Ok(self.docs.group(&[o, c, suffix]));
        }
        if items.len() > 1
            && items.iter().all(|&i| match self.ast.kind(i) {
                Kind::Num(_) => true,
                Kind::Unary(UnaryOp::Neg | UnaryOp::Plus, a) => {
                    matches!(self.ast.kind(a), Kind::Num(_))
                }
                _ => false,
            })
        {
            return self.concise_array(items, suffix);
        }
        let mut parts = Vec::new();
        for (i, &it) in items.iter().enumerate() {
            if i > 0 {
                parts.push(self.lit(","));
                parts.push(self.docs.line());
            }
            parts.push(match self.ast.kind(it) {
                Kind::Hole => return Err(Unsupported::at("array hole", self.ast.loc(it))),
                Kind::Rest(_) | Kind::AssignPat(..) | Kind::ObjectPat(_) | Kind::ArrayPat(_) => {
                    self.pattern(it, PatCtx::Nested)?
                }
                _ => self.expr(it, None, Slot::Element)?,
            });
        }
        let ends_in_rest = matches!(
            self.ast.kind(*items.last().expect("non-empty")),
            Kind::Rest(_)
        );
        let trailing = if ends_in_rest {
            self.docs.nil()
        } else {
            self.trailing_comma()
        };
        let soft = self.docs.softline();
        let soft2 = self.docs.softline();
        let [open, inner, trail, end_soft, close] =
            self.bracketed("[", soft, parts, trailing, soft2, "]");
        let group = self.docs.group(&[open, inner, trail, end_soft, close]);
        Ok(self.cat(&[group, suffix]))
    }

    /// Prettier's `printArrayItemsConcisely`: numbers fill the line, and the trailing comma
    /// follows the array's own group.
    fn concise_array(&mut self, items: &[NodeId], suffix: DocId) -> R<DocId> {
        let id = self.docs.new_group_id();
        let mut parts = Vec::with_capacity(items.len() * 2);
        for (i, &it) in items.iter().enumerate() {
            let e = self.expr(it, None, Slot::Element)?;
            let c = self.lit(",");
            let Some(&next) = items.get(i + 1) else {
                let nil = self.docs.nil();
                let t = self.docs.if_break_of(c, nil, id);
                parts.push(self.cat(&[e, t]));
                break;
            };
            parts.push(self.cat(&[e, c]));
            let sep = if self.blank_line_between(it, next) {
                let h1 = self.docs.hardline();
                let h2 = self.docs.hardline();
                self.cat(&[h1, h2])
            } else {
                self.docs.line()
            };
            parts.push(sep);
        }
        let fill = self.docs.fill(&parts);
        let soft = self.docs.softline();
        let inner = self.cat(&[soft, fill]);
        let inner = self.docs.indent(inner);
        let open = self.lit("[");
        let soft = self.docs.softline();
        let close = self.lit("]");
        let group = self.docs.group_with_id(&[open, inner, soft, close], id);
        Ok(self.cat(&[group, suffix]))
    }

    fn expr(&mut self, id: NodeId, parent: Option<NodeId>, slot: Slot) -> R<DocId> {
        let saved = self.at;
        self.at = parent.map(|p| (p, slot));
        let doc = self
            .expr_inner(id)
            .and_then(|d| self.ts_expression_suffix(id, d));
        self.at = saved;
        let doc = doc?;
        let leftmost = self.paren_leftmost == Some(id);
        if leftmost || parent.is_some_and(|p| self.needs_parens(id, p, slot)) {
            if leftmost {
                self.paren_leftmost = None;
            }
            let lp = self.lit("(");
            let rp = self.lit(")");
            return Ok(self.cat(&[lp, doc, rp]));
        }
        Ok(doc)
    }

    /// `!`, `as T` and `satisfies T` erased from the tree, printed back after the expression in
    /// source order. The erased wrapper would change parenthesization in operator positions, so a
    /// cast is printed only where it needs none.
    fn ts_expression_suffix(&mut self, id: NodeId, doc: DocId) -> R<DocId> {
        let mut entries: Vec<TsSyntax> = {
            let i = self.ts.partition_point(|t| t.node < id);
            self.ts[i..]
                .iter()
                .take_while(|t| t.node == id)
                .filter(|t| matches!(t.kind, TsKind::NonNull | TsKind::As | TsKind::Satisfies))
                .copied()
                .collect()
        };
        if entries.is_empty() {
            return Ok(doc);
        }
        entries.sort_by_key(|t| t.span.lo);
        let simple = matches!(
            self.ast.kind(id),
            Kind::Ident(_) | Kind::Member { .. } | Kind::Call { .. } | Kind::This
        );
        let cast = entries.iter().any(|t| t.kind != TsKind::NonNull);
        let cast_ok = matches!(
            self.at.map(|(_, s)| s),
            None | Some(
                Slot::Init | Slot::Argument | Slot::Value | Slot::Element | Slot::Statement
            )
        );
        if !simple || (cast && !cast_ok) {
            return Err(Unsupported::at(
                "TypeScript cast in this position",
                entries[0].span,
            ));
        }
        let mut parts = vec![doc];
        for t in entries {
            parts.push(match t.kind {
                TsKind::NonNull => {
                    self.ts_printed += 1;
                    self.lit("!")
                }
                TsKind::As => self.type_suffix(Some(t.span), " as ")?,
                _ => self.type_suffix(Some(t.span), " satisfies ")?,
            });
        }
        Ok(self.cat(&parts))
    }

    #[expect(clippy::too_many_lines, reason = "one arm per expression kind")]
    fn expr_inner(&mut self, id: NodeId) -> R<DocId> {
        match self.ast.kind(id) {
            Kind::Ident(_) => Ok(self.docs.text(self.ast.name(id))),
            Kind::Num(_) => {
                let raw = self.span(id).text(self.src);
                Ok(self.docs.text(&print_number(raw)))
            }
            Kind::Str => Ok(self.string(id)),
            Kind::Bool(b) => Ok(self.lit(if b { "true" } else { "false" })),
            Kind::Null => Ok(self.lit("null")),
            Kind::This => Ok(self.lit("this")),
            Kind::Template { quasis, exprs } => self.template(quasis, exprs),
            Kind::Array(items) => {
                let e = self.docs.nil();
                self.array(items, e)
            }
            Kind::Object(props) => {
                let e = self.docs.nil();
                self.object(id, props, None, e)
            }
            Kind::Member {
                object,
                property,
                computed,
                optional,
            } => self.member(id, object, property, computed, optional),
            Kind::Call {
                callee,
                args,
                optional,
                ..
            } => self.call(id, callee, args, optional, false),
            Kind::New { callee, args } => self.call(id, callee, args, false, true),
            Kind::Arrow {
                params,
                body,
                is_async,
                expr_body,
            } => self.arrow(id, params, body, is_async, expr_body),
            Kind::Function { .. } => self.function(id),
            Kind::Unary(op, arg) => {
                let o = self.lit(op.as_str());
                let a = self.expr(arg, Some(id), Slot::Operand)?;
                if op.as_str().ends_with(|c: char| c.is_ascii_lowercase()) {
                    let sp = self.lit(" ");
                    Ok(self.cat(&[o, sp, a]))
                } else {
                    Ok(self.cat(&[o, a]))
                }
            }
            Kind::Update { op, prefix, arg } => {
                let o = self.lit(op.as_str());
                let a = self.expr(arg, Some(id), Slot::Operand)?;
                Ok(if prefix {
                    self.cat(&[o, a])
                } else {
                    self.cat(&[a, o])
                })
            }
            Kind::Binary(..) | Kind::Logical(..) => {
                // `printBinaryishExpression`'s broken layouts depend on the parent; not ported.
                let parts = self.binaryish(id)?;
                let flat = self.cat(&parts);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Cond { test, cons, alt } => {
                let t = self.expr(test, Some(id), Slot::Test)?;
                let q = self.lit(" ? ");
                let c = self.expr(cons, Some(id), Slot::Branch)?;
                let col = self.lit(" : ");
                let a = self.expr(alt, Some(id), Slot::Branch)?;
                let flat = self.cat(&[t, q, c, col, a]);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Assign(op, l, r) => {
                let left = self.pattern(l, PatCtx::AssignLeft)?;
                let right = self.expr(r, Some(id), Slot::Right)?;
                let op = format!(" {}", op.as_str());
                let op = self.docs.text(&op);
                Ok(self.assignment(left, op, right, l, r))
            }
            Kind::Seq(items) => {
                let mut parts = Vec::new();
                for (i, &it) in items.iter().enumerate() {
                    if i > 0 {
                        parts.push(self.lit(", "));
                    }
                    parts.push(self.expr(it, Some(id), Slot::Element)?);
                }
                let flat = self.cat(&parts);
                Ok(self.docs.flat_only(flat))
            }
            Kind::Await(a) => {
                let kw = self.lit("await ");
                let a = self.expr(a, Some(id), Slot::Operand)?;
                Ok(self.cat(&[kw, a]))
            }
            Kind::Spread(a) => {
                let dots = self.lit("...");
                let a = self.expr(a, Some(id), Slot::Argument)?;
                Ok(self.cat(&[dots, a]))
            }
            Kind::ObjectPat(_) | Kind::ArrayPat(_) | Kind::AssignPat(..) | Kind::Rest(_) => {
                self.pattern(id, PatCtx::Nested)
            }
            _ => Err(Unsupported::at("expression kind", self.ast.loc(id))),
        }
    }

    /// Prettier's `printBinaryishExpressions`, flat: same-precedence chains flatten into one list.
    fn binaryish(&mut self, id: NodeId) -> R<Vec<DocId>> {
        let (op, l, r) = match self.ast.kind(id) {
            Kind::Binary(op, l, r) => (op.as_str(), l, r),
            Kind::Logical(op, l, r) => (op.as_str(), l, r),
            _ => unreachable!("binaryish"),
        };
        let flatten = match (op_of(self.ast, id), op_of(self.ast, l)) {
            (Some(p), Some(c)) => should_flatten(p, c) && !self.has_ts(l),
            _ => false,
        };
        let mut parts = if flatten {
            self.binaryish(l)?
        } else {
            vec![self.expr(l, Some(id), Slot::Left)?]
        };
        let op = format!(" {op} ");
        parts.push(self.docs.text(&op));
        parts.push(self.expr(r, Some(id), Slot::Right)?);
        Ok(parts)
    }

    fn has_ts(&self, id: NodeId) -> bool {
        let i = self.ts.partition_point(|t| t.node < id);
        self.ts.get(i).is_some_and(|t| t.node == id)
    }

    /// Prettier's `printMemberExpression`. The lookup is inlined in the cases Prettier always
    /// inlines; otherwise its `group(indent([softline, lookup]))` may break under conditions not
    /// ported, so the expression must fit.
    fn member(
        &mut self,
        id: NodeId,
        object: NodeId,
        property: NodeId,
        computed: bool,
        optional: bool,
    ) -> R<DocId> {
        let parent_is_member = self
            .at
            .is_some_and(|(p, _)| matches!(self.ast.kind(p), Kind::Member { .. }));
        let o = self.expr(object, Some(id), Slot::Object)?;
        let q = if optional {
            self.lit("?.")
        } else {
            self.docs.nil()
        };
        let lookup = if computed {
            let lb = self.lit("[");
            let p = self.expr(property, Some(id), Slot::Value)?;
            let rb = self.lit("]");
            if matches!(self.ast.kind(property), Kind::Num(_)) {
                self.cat(&[q, lb, p, rb])
            } else {
                let soft = self.docs.softline();
                let inner = self.cat(&[soft, p]);
                let inner = self.docs.indent(inner);
                let soft = self.docs.softline();
                self.docs.group(&[q, lb, inner, soft, rb])
            }
        } else {
            let dot = if optional {
                self.docs.nil()
            } else {
                self.lit(".")
            };
            let p = self.docs.text(self.ast.name(property));
            self.cat(&[q, dot, p])
        };
        let inline =
            computed || (matches!(self.ast.kind(object), Kind::Ident(_)) && !parent_is_member);
        let flat = self.cat(&[o, lookup]);
        Ok(if inline {
            flat
        } else {
            self.docs.flat_only(flat)
        })
    }

    /// Prettier's `printCallExpression`. A member callee makes a member chain, which is not
    /// ported, so such a call must fit on its line.
    fn call(
        &mut self,
        id: NodeId,
        callee: NodeId,
        args: &[NodeId],
        optional: bool,
        is_new: bool,
    ) -> R<DocId> {
        let type_args = match self.ts_of(callee, TsKind::TypeArgs) {
            Some(span) => {
                let inner = &span.text(self.src)[1..span.len() as usize - 1];
                let Some(text) = union_of_plain_types(inner) else {
                    return Err(Unsupported::at("type arguments", self.ast.loc(id)));
                };
                self.ts_printed += 1;
                self.docs.text(&format!("<{text}>"))
            }
            None => self.docs.nil(),
        };
        let new = if is_new {
            self.lit("new ")
        } else {
            self.docs.nil()
        };
        let c = self.expr(callee, Some(id), Slot::Callee)?;
        let q = if optional {
            self.lit("?.")
        } else {
            self.docs.nil()
        };
        let a = self.arguments(id, args)?;
        let a = self.cat(&[type_args, a]);
        let parts = [new, c, q, a];
        if !is_new && matches!(self.ast.kind(callee), Kind::Member { .. }) {
            let flat = self.cat(&parts);
            return Ok(self.docs.flat_only(flat));
        }
        Ok(if matches!(self.ast.kind(callee), Kind::Call { .. }) {
            self.docs.group(&parts)
        } else {
            self.cat(&parts)
        })
    }

    /// Prettier's `printCallArguments`, without the first/last-argument hugging layouts: an
    /// argument list that might hug must fit on its line.
    fn arguments(&mut self, id: NodeId, args: &[NodeId]) -> R<DocId> {
        if args.is_empty() {
            let o = self.lit("(");
            let c = self.lit(")");
            return Ok(self.docs.group(&[o, c]));
        }
        let mut printed = Vec::new();
        for &a in args {
            printed.push(self.expr(a, Some(id), Slot::Argument)?);
        }
        let inline = |f: &mut Self, printed: &[DocId]| {
            let o = f.lit("(");
            let sep = f.lit(", ");
            let mut parts = vec![o];
            parts.extend(f.docs.join(sep, printed));
            parts.push(f.lit(")"));
            f.cat(&parts)
        };
        if self.react_hook_with_deps(args) {
            return Ok(inline(self, &printed));
        }
        let mut blank = false;
        let mut items = Vec::new();
        for (i, &p) in printed.iter().enumerate() {
            if i + 1 == printed.len() {
                items.push(p);
                continue;
            }
            let comma = self.lit(",");
            if self.blank_line_between(args[i], args[i + 1]) {
                blank = true;
                let h1 = self.docs.hardline();
                let h2 = self.docs.hardline();
                items.push(self.cat(&[p, comma, h1, h2]));
            } else {
                let line = self.docs.line();
                items.push(self.cat(&[p, comma, line]));
            }
        }
        let trailing = self.trailing_comma();
        if blank || self.function_composition(args) {
            let line = self.docs.line();
            let line2 = self.docs.line();
            let parts = self.bracketed("(", line, items, trailing, line2, ")");
            return Ok(self.docs.group_broken(&parts));
        }
        if self.may_hug_an_argument(args) {
            let flat = inline(self, &printed);
            return Ok(self.docs.flat_only(flat));
        }
        let soft = self.docs.softline();
        let soft2 = self.docs.softline();
        let parts = self.bracketed("(", soft, items, trailing, soft2, ")");
        let curried_callee = self.at.is_some_and(|(p, slot)| {
            slot == Slot::Callee
                && matches!(
                    self.ast.kind(p),
                    Kind::Call { args: pa, .. } if !pa.is_empty() && args.len() > pa.len()
                )
        });
        Ok(if curried_callee {
            self.cat(&parts)
        } else if printed.iter().any(|&p| self.docs.will_break(p)) {
            self.docs.group_broken(&parts)
        } else {
            self.docs.group(&parts)
        })
    }

    /// Prettier's `isReactHookCallWithDepsArray`: `(() => {…}, [deps])`, printed inline.
    fn react_hook_with_deps(&self, args: &[NodeId]) -> bool {
        let at = |i: usize| {
            matches!(
                self.ast.kind(args[i]),
                Kind::Arrow {
                    params: [],
                    expr_body: false,
                    ..
                }
            ) && matches!(self.ast.kind(args[i + 1]), Kind::Array(_))
        };
        match args.len() {
            2 => at(0),
            3 => matches!(self.ast.kind(args[0]), Kind::Ident(_)) && at(1),
            _ => false,
        }
    }

    /// Prettier's `isFunctionCompositionArgs`: more than one function argument (or one inside a
    /// call argument) puts every argument on its own line.
    fn function_composition(&self, args: &[NodeId]) -> bool {
        if args.len() <= 1 {
            return false;
        }
        let is_fn = |a: NodeId| {
            matches!(
                self.ast.kind(a),
                Kind::Function { .. }
                    | Kind::Arrow {
                        expr_body: false,
                        ..
                    }
            )
        };
        let mut count = 0;
        for &a in args {
            if is_fn(a) {
                count += 1;
                if count > 1 {
                    return true;
                }
            } else if let Kind::Call { args: inner, .. } = self.ast.kind(a)
                && inner.iter().any(|&x| is_fn(x))
            {
                return true;
            }
        }
        false
    }

    /// A superset of Prettier's `shouldGroupFirst` / `shouldGroupLast`.
    fn may_hug_an_argument(&self, args: &[NodeId]) -> bool {
        args.iter().any(|&a| match self.ast.kind(a) {
            Kind::Object(p) => !p.is_empty(),
            Kind::Array(e) => !e.is_empty(),
            Kind::Function { .. } | Kind::Arrow { .. } => true,
            _ => false,
        })
    }

    /// Prettier's `printArrowFunction` for a single arrow (chains are not ported).
    fn arrow(
        &mut self,
        id: NodeId,
        params: &[NodeId],
        body: NodeId,
        is_async: bool,
        expr_body: bool,
    ) -> R<DocId> {
        if expr_body && matches!(self.ast.kind(body), Kind::Arrow { .. }) {
            return Err(Unsupported::at("arrow chain", self.ast.loc(body)));
        }
        if expr_body && matches!(self.ast.kind(body), Kind::Cond { .. }) {
            return Err(Unsupported::at(
                "conditional arrow body",
                self.ast.loc(body),
            ));
        }
        let mut sig = Vec::new();
        if is_async {
            sig.push(self.lit("async "));
        }
        let ps = self.params(params)?;
        let ret = self.type_suffix(self.ts_of(id, TsKind::ReturnType), ": ")?;
        sig.push(self.docs.group(&[ps, ret]));
        let sig = self.cat(&sig);
        let sig = self.docs.group(&[sig]);
        let arrow = self.lit(" =>");
        if !expr_body {
            let b = self.block(body, true)?;
            let sp = self.lit(" ");
            let b = self.cat(&[sp, b]);
            let b = self.docs.group(&[b]);
            return Ok(self.docs.group(&[sig, arrow, b]));
        }
        let saved = self.paren_leftmost;
        self.paren_leftmost = self.leftmost_needing_parens(body, true);
        let b = self.expr(body, Some(id), Slot::ArrowBody);
        self.paren_leftmost = saved;
        let b = b?;
        // `shouldPrintBodyOnSameLine` for the bodies ported here (`mayBreakAfterShortPrefix`).
        let same_line = matches!(
            self.ast.kind(body),
            Kind::Array(_) | Kind::Object(_) | Kind::Seq(_)
        );
        let body_doc = if same_line {
            let sp = self.lit(" ");
            self.cat(&[sp, b])
        } else {
            let line = self.docs.line();
            let inner = self.cat(&[line, b]);
            self.docs.indent(inner)
        };
        let body_doc = self.docs.group(&[body_doc]);
        Ok(self.docs.group(&[sig, arrow, body_doc]))
    }

    /// Template literals keep their raw text; each `${…}` must fit on its line.
    fn template(&mut self, quasis: &[NodeId], exprs: &[NodeId]) -> R<DocId> {
        let mut parts = vec![self.lit("`")];
        for (i, &q) in quasis.iter().enumerate() {
            if self.ast.flags(q) & flag::OWNED != 0 {
                return Err(Unsupported::at("synthesized template", self.ast.loc(q)));
            }
            let [lo, hi] = self.ast.raw_data(q);
            parts.push(self.docs.text(Span::new(lo, hi).text(self.src)));
            if let Some(&e) = exprs.get(i) {
                parts.push(self.lit("${"));
                let d = self.expr(e, None, Slot::Value)?;
                parts.push(self.docs.flat_only(d));
                parts.push(self.lit("}"));
            }
        }
        parts.push(self.lit("`"));
        Ok(self.cat(&parts))
    }

    /// Prettier's string printing: the preferred quote unless the other one needs fewer escapes.
    fn string(&mut self, id: NodeId) -> DocId {
        let raw = self.span(id).text(self.src);
        let content = &raw[1..raw.len() - 1];
        let quote = if self.opts.html_attribute {
            '\''
        } else {
            preferred_quote(content, self.opts.single_quote)
        };
        let s = make_string(content, quote);
        self.docs.text(&s)
    }

    /// The node an expression statement (or arrow body) starts with, when it must be wrapped in
    /// parentheses so it does not read as a block, a declaration or a destructuring statement.
    fn leftmost_needing_parens(&self, e: NodeId, arrow_body: bool) -> Option<NodeId> {
        let mut cur = e;
        loop {
            match self.ast.kind(cur) {
                Kind::Object(_) => return Some(cur),
                Kind::Function { .. } if !arrow_body => return Some(cur),
                Kind::Member { object, .. } => cur = object,
                Kind::Call { callee, .. } => cur = callee,
                Kind::Binary(_, l, _) | Kind::Logical(_, l, _) => cur = l,
                Kind::Cond { test, .. } => cur = test,
                Kind::Assign(_, l, _) => {
                    if !arrow_body && matches!(self.ast.kind(l), Kind::ObjectPat(_)) {
                        return Some(cur);
                    }
                    cur = l;
                }
                Kind::Seq(items) => cur = items[0],
                Kind::Update {
                    prefix: false, arg, ..
                } => cur = arg,
                _ => return None,
            }
        }
    }

    /// Prettier's `needsParens` for the node kinds this printer handles.
    fn needs_parens(&self, id: NodeId, parent: NodeId, slot: Slot) -> bool {
        let pk = self.ast.kind(parent);
        let is_callee = slot == Slot::Callee;
        let is_object = slot == Slot::Object;
        let callee_or_object = matches!(pk, Kind::Call { .. } | Kind::New { .. }) && is_callee
            || matches!(pk, Kind::Member { .. }) && is_object;
        match self.ast.kind(id) {
            Kind::Seq(_) => !matches!(pk, Kind::ExprStmt(_) | Kind::Seq(_)),
            Kind::Assign(..) => match pk {
                Kind::ExprStmt(_)
                | Kind::Assign(..)
                | Kind::Seq(_)
                | Kind::Declarator { .. }
                | Kind::Property { .. }
                | Kind::Array(_) => false,
                Kind::Arrow { .. } => slot == Slot::ArrowBody,
                Kind::Call { .. } | Kind::New { .. } => is_callee,
                _ => true,
            },
            Kind::Cond { .. } => match pk {
                Kind::Unary(..)
                | Kind::Spread(_)
                | Kind::Binary(..)
                | Kind::Logical(..)
                | Kind::ExportDefault(_)
                | Kind::Await(_) => true,
                Kind::Cond { .. } => slot == Slot::Test,
                _ => callee_or_object,
            },
            Kind::Arrow { .. } => match pk {
                Kind::Binary(..) | Kind::Logical(..) | Kind::Unary(..) | Kind::Await(_) => true,
                Kind::Cond { .. } => slot == Slot::Test,
                _ => callee_or_object,
            },
            Kind::Function { .. } => callee_or_object,
            Kind::Unary(op, _) => match pk {
                Kind::Unary(pop, _) => op == pop && matches!(op, UnaryOp::Plus | UnaryOp::Neg),
                Kind::Binary(BinOp::Exp, ..) => slot == Slot::Left,
                _ => callee_or_object,
            },
            Kind::Update { prefix, op, .. } => match pk {
                Kind::Unary(pop, _) => {
                    prefix
                        && ((op.as_str() == "++" && pop == UnaryOp::Plus)
                            || (op.as_str() == "--" && pop == UnaryOp::Neg))
                }
                Kind::Binary(BinOp::Exp, ..) => slot == Slot::Left,
                _ => callee_or_object,
            },
            Kind::Await(_) => match pk {
                Kind::Binary(BinOp::Exp, ..) => slot == Slot::Left,
                _ => callee_or_object,
            },
            Kind::Binary(..) | Kind::Logical(..) => {
                let no = op_of(self.ast, id).expect("binaryish");
                match pk {
                    Kind::Unary(..) | Kind::Spread(_) | Kind::Await(_) => true,
                    Kind::Binary(..) | Kind::Logical(..) => {
                        let po = op_of(self.ast, parent).expect("binaryish");
                        if mixes_nullish(po, no) {
                            return true;
                        }
                        let (pp, np) = (po.precedence(), no.precedence());
                        if pp > np || (slot == Slot::Right && pp == np) {
                            return true;
                        }
                        if pp == np && !should_flatten(po, no) {
                            return true;
                        }
                        if pp < np && no == Op::Bin(BinOp::Rem) {
                            return matches!(po, Op::Bin(BinOp::Add | BinOp::Sub));
                        }
                        po.is_bitwise()
                    }
                    _ => callee_or_object,
                }
            }
            _ => false,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Layout {
    BreakAfterOperator,
    NeverBreakAfterOperator,
    BreakLhs,
    Fluid,
    /// A layout whose choice depends on predicates not ported; the assignment must fit flat.
    Unported,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Op {
    Bin(BinOp),
    Log(LogicalOp),
}

impl Op {
    /// Prettier's precedence table (`??` < `||` < `&&` < `|` < … < `**`).
    const fn precedence(self) -> u8 {
        match self {
            Self::Bin(b) => b.precedence(),
            Self::Log(l) => l.precedence(),
        }
    }

    const fn is_bitwise(self) -> bool {
        use BinOp::{BitAnd, BitOr, BitXor, Shl, Shr, UShr};
        matches!(self, Self::Bin(BitOr | BitXor | BitAnd | Shl | Shr | UShr))
    }
}

fn op_of(ast: &Ast, id: NodeId) -> Option<Op> {
    match ast.kind(id) {
        Kind::Binary(op, ..) => Some(Op::Bin(op)),
        Kind::Logical(op, ..) => Some(Op::Log(op)),
        _ => None,
    }
}

fn mixes_nullish(a: Op, b: Op) -> bool {
    let nullish = |o: Op| o == Op::Log(LogicalOp::Nullish);
    let and_or = |o: Op| matches!(o, Op::Log(LogicalOp::And | LogicalOp::Or));
    (nullish(a) && and_or(b)) || (and_or(a) && nullish(b))
}

/// Prettier's `shouldFlatten`.
fn should_flatten(parent: Op, child: Op) -> bool {
    use BinOp::{Div, Eq, Exp, Mul, NotEq, Rem, Shl, Shr, StrictEq, StrictNotEq, UShr};
    if parent.precedence() != child.precedence() {
        return false;
    }
    let (Op::Bin(p), Op::Bin(c)) = (parent, child) else {
        return true;
    };
    if p == Exp {
        return false;
    }
    let equality = |o| matches!(o, Eq | NotEq | StrictEq | StrictNotEq);
    if equality(p) && equality(c) {
        return false;
    }
    let multiplicative = |o| matches!(o, Mul | Div | Rem);
    if (c == Rem && multiplicative(p)) || (p == Rem && multiplicative(c)) {
        return false;
    }
    if c != p && multiplicative(c) && multiplicative(p) {
        return false;
    }
    let shift = |o| matches!(o, Shl | Shr | UShr);
    !(shift(p) && shift(c))
}

/// A type span the printer may copy verbatim: a (qualified) type reference, optionally an array.
/// `A | B.C | D[]` with each member a plain reference, printed with Prettier's spacing.
fn union_of_plain_types(text: &str) -> Option<String> {
    let members: Vec<&str> = text.split('|').map(str::trim).collect();
    members
        .iter()
        .all(|m| is_plain_type(m))
        .then(|| members.join(" | "))
}

fn is_plain_type(text: &str) -> bool {
    let base = text.trim_end_matches("[]");
    !base.is_empty()
        && base.split('.').all(|seg| {
            let mut cs = seg.chars();
            cs.next()
                .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
                && cs.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
        })
}

/// Prettier's `printNumber`.
#[must_use]
pub fn print_number(raw: &str) -> String {
    let s = raw.to_ascii_lowercase();
    if s.starts_with("0x") || s.starts_with("0o") || s.starts_with("0b") || s.ends_with('n') {
        return s;
    }
    let (mantissa, exponent) = match s.split_once('e') {
        Some((m, e)) => (m, Some(e)),
        None => (s.as_str(), None),
    };
    let mut m = if mantissa.starts_with('.') {
        format!("0{mantissa}")
    } else {
        mantissa.to_owned()
    };
    if let Some(dot) = m.find('.') {
        let frac = &m[dot + 1..];
        let kept = frac.trim_end_matches('0').len().max(1).min(frac.len());
        m.truncate(dot + 1 + kept);
        if m.ends_with('.') {
            m.pop();
        }
    }
    match exponent {
        None => m,
        Some(e) => {
            let sign = if e.starts_with('-') { "-" } else { "" };
            let digits = e.trim_start_matches(['+', '-']).trim_start_matches('0');
            if digits.is_empty() {
                m
            } else {
                format!("{m}e{sign}{digits}")
            }
        }
    }
}

/// Prettier's `getPreferredQuote`.
fn preferred_quote(content: &str, single: bool) -> char {
    let (pref, alt) = if single { ('\'', '"') } else { ('"', '\'') };
    if content.matches(pref).count() > content.matches(alt).count() {
        alt
    } else {
        pref
    }
}

/// Prettier's `makeString`: re-quotes raw string content, dropping escapes that are not needed.
fn make_string(raw: &str, quote: char) -> String {
    let other = if quote == '"' { '\'' } else { '"' };
    let mut out = String::with_capacity(raw.len() + 2);
    out.push(quote);
    let mut chars = raw.chars();
    while let Some(c) = chars.next() {
        match c {
            '\\' => match chars.next() {
                Some(e) if e == other => out.push(e),
                Some(e) => {
                    let needed = matches!(
                        e,
                        '\n' | '\r' | '"' | '\'' | '0'
                            ..='7'
                                | '\\'
                                | 'b'
                                | 'f'
                                | 'n'
                                | 'r'
                                | 't'
                                | 'u'
                                | 'v'
                                | 'x'
                                | '\u{2028}'
                                | '\u{2029}'
                    );
                    if needed {
                        out.push('\\');
                    }
                    out.push(e);
                }
                None => out.push('\\'),
            },
            c if c == quote => {
                out.push('\\');
                out.push(c);
            }
            c => out.push(c),
        }
    }
    out.push(quote);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers_print_like_prettier() {
        for (raw, want) in [
            ("1", "1"),
            ("1.0", "1.0"),
            ("1.50", "1.5"),
            ("1.", "1"),
            (".5", "0.5"),
            ("1E+05", "1e5"),
            ("2e-007", "2e-7"),
            ("3e0", "3"),
            ("0XAB", "0xab"),
        ] {
            assert_eq!(print_number(raw), want, "{raw}");
        }
    }

    #[test]
    fn strings_prefer_double_quotes_unless_that_needs_more_escapes() {
        assert_eq!(make_string("a", preferred_quote("a", false)), "\"a\"");
        let q = "say \"hi\"";
        assert_eq!(make_string(q, preferred_quote(q, false)), "'say \"hi\"'");
        assert_eq!(
            make_string("it\\'s", preferred_quote("it\\'s", false)),
            "\"it's\""
        );
        assert_eq!(make_string("\\d", '"'), "\"d\"");
    }
}
