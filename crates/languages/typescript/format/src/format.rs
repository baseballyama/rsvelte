//! Formats a JS/TS tree the way Prettier's estree printer does (prettier 3.x, `semi: true`,
//! `trailingComma: "all"`, `bracketSpacing: true`, `arrowParens: "always"`,
//! `objectWrap: "preserve"`).
//!
//! Each node builds the document Prettier builds for it, so the kernel's printer lays it out the
//! same way. Two escape hatches keep the output honest where the port is partial:
//!
//! - a layout whose broken form is not ported (member chains, argument hugging, binary operators,
//!   assignment layouts that depend on them) is wrapped in [`LayoutInstructions::flat_only`]: it
//!   prints only when it fits on its line, and printing refuses otherwise;
//! - a node kind, comment or TypeScript form the port does not handle is an [`Unsupported`] error
//!   before anything is printed.
//!
//! TypeScript types are not parsed into nodes (see
//! [`rsvelte_typescript::syntax_tree::TypeScriptSyntax`]); a type prints as its source text only
//! when that text is a plain type reference (`Props`, `string`, `a.B[]`).

pub use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::output::document::{LayoutInstructionIdentifier, LayoutInstructions};
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_typescript::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use rsvelte_typescript::syntax_tree::{
    Kind, NodeIdentifier, SyntaxTree, TypeScriptKind, TypeScriptSyntax, flag,
};

type R<T> = Result<T, Unsupported>;

#[derive(Clone, Copy, Default, Debug)]
pub struct Options {
    pub single_quote: bool,
    /// Inside an HTML attribute value (Prettier's `__isInMarkupAttribute`): strings always take
    /// single quotes, whatever they contain, so the attribute's double quotes never need escaping.
    pub markup_attribute: bool,
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
enum PatternContext {
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
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    lines: &'a LineIndex,
    pub docs: &'a mut LayoutInstructions,
    options: Options,
    /// `syntax_tree.ts` sorted by node, for lookups while printing.
    typescript: Vec<TypeScriptSyntax>,
    typescript_printed: usize,
    /// The leftmost node of an expression statement or arrow body that must be parenthesized.
    paren_leftmost: Option<NodeIdentifier>,
    /// The parent and slot of the expression being printed.
    at: Option<(NodeIdentifier, Slot)>,
}

impl<'a> Formatter<'a> {
    pub fn new(
        syntax_tree: &'a SyntaxTree,
        source_text: &'a str,
        lines: &'a LineIndex,
        docs: &'a mut LayoutInstructions,
        options: Options,
    ) -> Self {
        let mut typescript = syntax_tree.typescript.clone();
        typescript.sort_by_key(|t| (t.node, t.span.start_offset));
        Formatter {
            syntax_tree,
            source_text,
            lines,
            docs,
            options,
            typescript,
            typescript_printed: 0,
            paren_leftmost: None,
            at: None,
        }
    }

    pub const fn set_options(&mut self, options: Options) {
        self.options = options;
    }

    /// A whole program: statements, ending with a hard line (Prettier's `Program`).
    ///
    /// # Errors
    ///
    /// [`Unsupported`] if the program holds a comment or a construct this printer does not handle.
    pub fn program(&mut self, identifier: NodeIdentifier) -> R<LayoutInstructionIdentifier> {
        let Kind::Program(body) = self.syntax_tree.kind(identifier) else {
            unreachable!("a program node")
        };
        let range = self.span(identifier);
        self.check_comments(range)?;
        let before = self.typescript_printed;
        let statements = self.statements(body)?;
        self.check_typescript(range, before)?;
        if statements.is_empty() {
            return Ok(self.docs.nil());
        }
        let h = self.docs.hardline();
        let body = self.docs.concat(&statements);
        Ok(self.docs.concat(&[body, h]))
    }

    /// A root expression, as embedded in a template (`{expression}`).
    ///
    /// # Errors
    ///
    /// [`Unsupported`] if the expression holds a comment or a construct this printer does not
    /// handle.
    pub fn format_expression(
        &mut self,
        identifier: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let range = self.span(identifier);
        self.check_comments(range)?;
        let before = self.typescript_printed;
        let d = self.expression(identifier, None, Slot::Value)?;
        self.check_typescript(range, before)?;
        Ok(d)
    }

    /// One binding pattern on its own, as Prettier prints a parameter of an embedded binding
    /// list (a `v-for` alias).
    ///
    /// # Errors
    ///
    /// [`Unsupported`] if the pattern holds a comment or a construct this printer does not handle.
    pub fn parameter(&mut self, identifier: NodeIdentifier) -> R<LayoutInstructionIdentifier> {
        let range = self.span(identifier);
        self.check_comments(range)?;
        let before = self.typescript_printed;
        let d = self.pattern(identifier, PatternContext::Param { hug: false })?;
        self.check_typescript(range, before)?;
        Ok(d)
    }

    fn span(&self, identifier: NodeIdentifier) -> Span {
        self.syntax_tree
            .source_location(identifier)
            .span()
            .expect("formatting only reads parsed trees, whose nodes have source spans")
    }

    fn check_comments(&self, range: Span) -> R<()> {
        let c = &self.syntax_tree.comments;
        let i = c.partition_point(|s| s.start_offset < range.start_offset);
        if let Some(&s) = c.get(i).filter(|s| s.end_offset <= range.end_offset) {
            return Err(Unsupported::at("comments", s));
        }
        Ok(())
    }

    /// Every piece of TypeScript syntax inside `range` must have been printed.
    fn check_typescript(&self, range: Span, before: usize) -> R<()> {
        let expected = self
            .typescript
            .iter()
            .filter(|t| {
                t.span.start_offset >= range.start_offset && t.span.end_offset <= range.end_offset
            })
            .count();
        if self.typescript_printed - before != expected {
            return Err(Unsupported::at("TypeScript syntax", range));
        }
        Ok(())
    }

    fn typescript_of(&self, node: NodeIdentifier, kind: TypeScriptKind) -> Option<Span> {
        let i = self.typescript.partition_point(|t| t.node < node);
        self.typescript[i..]
            .iter()
            .take_while(|t| t.node == node)
            .find(|t| t.kind == kind)
            .map(|t| t.span)
    }

    /// `sep` + the type's text (or nothing); counts the type as printed.
    fn type_suffix(
        &mut self,
        span: Option<Span>,
        sep: &'static str,
    ) -> R<LayoutInstructionIdentifier> {
        let Some(span) = span else {
            return Ok(self.docs.nil());
        };
        let text = span.text(self.source_text);
        let Some(t) = self.type_doc(text) else {
            return Err(Unsupported::at(
                "TypeScript type other than a plain reference, a union of them or a type literal",
                span,
            ));
        };
        self.typescript_printed += 1;
        let s = self.docs.lit(sep);
        Ok(self.docs.concat(&[s, t]))
    }

    /// A plain reference, a union of them, or a type literal whose members have such types
    /// (Prettier's object printing: broken when the source breaks after `{`).
    fn type_doc(&mut self, text: &str) -> Option<LayoutInstructionIdentifier> {
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

    fn lit(&mut self, s: &'static str) -> LayoutInstructionIdentifier {
        self.docs.lit(s)
    }

    fn cat(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
        self.docs.concat(items)
    }

    /// `[open, indent([sep, ...items]), trailing, sep2, close]`, the shape of every bracketed list.
    fn bracketed(
        &mut self,
        open: &'static str,
        first: LayoutInstructionIdentifier,
        items: Vec<LayoutInstructionIdentifier>,
        trailing: LayoutInstructionIdentifier,
        last: LayoutInstructionIdentifier,
        close: &'static str,
    ) -> [LayoutInstructionIdentifier; 5] {
        let o = self.lit(open);
        let mut inner = vec![first];
        inner.extend(items);
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let c = self.lit(close);
        [o, inner, trailing, last, c]
    }

    /// `ifBreak(",")`.
    fn trailing_comma(&mut self) -> LayoutInstructionIdentifier {
        let c = self.lit(",");
        let e = self.docs.nil();
        self.docs.if_break(c, e)
    }

    /// Prettier's `isNextLineEmpty` between two siblings, from their lines (comments are refused
    /// before printing, so only whitespace can separate them).
    fn blank_line_between(&self, a: NodeIdentifier, b: NodeIdentifier) -> bool {
        let end = self.lines.line_column(self.span(a).end_offset).line;
        let start = self.lines.line_column(self.span(b).start_offset).line;
        start > end + 1
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
    Bin(BinaryOperator),
    Log(LogicalOperator),
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
        use BinaryOperator::{BitAnd, BitOr, BitXor, Shl, Shr, UShr};
        matches!(self, Self::Bin(BitOr | BitXor | BitAnd | Shl | Shr | UShr))
    }
}

fn op_of(syntax_tree: &SyntaxTree, identifier: NodeIdentifier) -> Option<Op> {
    match syntax_tree.kind(identifier) {
        Kind::Binary(op, ..) => Some(Op::Bin(op)),
        Kind::Logical(op, ..) => Some(Op::Log(op)),
        _ => None,
    }
}

fn mixes_nullish(a: Op, b: Op) -> bool {
    let nullish = |o: Op| o == Op::Log(LogicalOperator::Nullish);
    let and_or = |o: Op| matches!(o, Op::Log(LogicalOperator::And | LogicalOperator::Or));
    (nullish(a) && and_or(b)) || (and_or(a) && nullish(b))
}

/// Prettier's `shouldFlatten`.
fn should_flatten(parent: Op, child: Op) -> bool {
    use BinaryOperator::{
        Div, Eq, Exp, Mul, NotEq, Remainder, Shl, Shr, StrictEq, StrictNotEq, UShr,
    };
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
    let multiplicative = |o| matches!(o, Mul | Div | Remainder);
    if (c == Remainder && multiplicative(p)) || (p == Remainder && multiplicative(c)) {
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

mod strings;
use strings::{make_string, preferred_quote};

mod assignment;
mod calls;
mod expressions;
mod functions;
mod literals;
mod parentheses;
mod patterns;
mod statements;
#[cfg(test)]
mod tests;
