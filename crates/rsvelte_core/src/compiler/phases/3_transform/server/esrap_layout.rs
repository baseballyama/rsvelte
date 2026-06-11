//! esrap line-break parity for expressions embedded in SSR template literals.
//!
//! The corpus verifier normalizes both compilers' output with oxfmt. oxfmt
//! preserves a template-literal interpolation byte-for-byte structure-wise
//! when it contains no newline, but fully reformats the template when any
//! interpolation does contain one. The official compiler prints through esrap,
//! so byte-parity (post-oxfmt) reduces to *newline-presence parity* with
//! esrap inside every `${...}`.
//!
//! esrap (v2, `src/languages/ts/index.js`) forces a line break exactly when
//! one of these holds anywhere in the printed subtree:
//! - `sequence(...)` (ObjectExpression / ObjectPattern / ArrayExpression /
//!   ArrayPattern / SequenceExpression children): total measured width > 60
//!   (`multiline ||= length > 60`, where `length = Σ(child + separator) + 1`)
//! - ConditionalExpression: `consequent.measure() + alternate.measure() > 50`
//! - TemplateLiteral: a quasi's raw text contains `\n`
//! - non-empty BlockStatement (function/arrow bodies, etc.)
//! - attached comments (excluded here — inputs with comments are left as-is)
//!
//! `context.multiline` propagates unconditionally to ancestors via
//! `append()`, so "the printed root contains a newline" ⇔ "some descendant
//! forces a break".
//!
//! [`reflow_template_expr`] therefore:
//! - parses the (post-transform) expression text with OXC,
//! - walks it computing the forced-break predicate,
//! - if esrap would print flat: collapses whitespace runs (outside string /
//!   template-quasi content) to single spaces,
//! - if esrap would break but the text is single-line: prepends a `\n`
//!   (the exact break position is irrelevant — oxfmt re-canonicalizes).

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType, Span};

thread_local! {
    static LAYOUT_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Reflow an expression destined for a `${...}` slot in a server template
/// literal so its newline-presence matches esrap's printing.
pub(crate) fn reflow_template_expr(expr: &str) -> String {
    let has_newline = expr.contains('\n');

    // Fast path: short single-line expressions without a `{` can never go
    // multiline (the sequence rule needs > 60 chars, the ternary rule > 50,
    // and block bodies / object literals require a brace).
    if !has_newline && expr.len() <= 50 && !expr.contains('{') {
        return expr.to_string();
    }

    // Comments are real printed content in esrap (and force breaks via the
    // comment machinery) — leave such expressions untouched.
    if expr.contains("//") || expr.contains("/*") {
        return expr.to_string();
    }

    let wrapped = format!("({})", expr);

    let multiline = LAYOUT_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let ret = Parser::new(&allocator, &wrapped, SourceType::mjs()).parse();
        let result = if ret.errors.is_empty() {
            let mut walker = Walker {
                src: &wrapped,
                forced: false,
            };
            use oxc_ast_visit::Visit;
            walker.visit_program(&ret.program);
            Some(walker.forced)
        } else {
            None
        };
        *cell.borrow_mut() = allocator;
        result
    });

    let Some(multiline) = multiline else {
        // Parse failure — leave as-is.
        return expr.to_string();
    };

    match (multiline, has_newline) {
        (false, false) | (true, true) => expr.to_string(),
        (false, true) => collapse_whitespace_outside_strings(expr),
        (true, false) => format!("\n{}", expr),
    }
}

struct Walker<'s> {
    src: &'s str,
    forced: bool,
}

impl<'s> Walker<'s> {
    /// Width of a span's text with whitespace runs collapsed — approximates
    /// esrap's `measure()` of the flat-printed child.
    fn width(&self, span: Span) -> usize {
        let text = &self.src[span.start as usize..span.end as usize];
        let mut len = 0usize;
        let mut in_ws = false;
        for c in text.chars() {
            if c.is_whitespace() {
                if !in_ws {
                    len += 1;
                    in_ws = true;
                }
            } else {
                len += c.len_utf8();
                in_ws = false;
            }
        }
        len
    }

    /// esrap `sequence()` length rule: `length = Σ(measure(child) + 1)`,
    /// where each non-last child's context includes its `,` separator.
    fn sequence_exceeds(&self, spans: &[Span]) -> bool {
        if spans.is_empty() {
            return false;
        }
        let n = spans.len();
        let mut length = 0usize;
        for (i, span) in spans.iter().enumerate() {
            length += self.width(*span) + 1;
            if i < n - 1 {
                length += 1; // the `,` separator written into the child context
            }
        }
        length > 60
    }
}

impl<'a, 's> oxc_ast_visit::Visit<'a> for Walker<'s> {
    fn visit_object_expression(&mut self, obj: &ObjectExpression<'a>) {
        let spans: Vec<Span> = obj.properties.iter().map(|p| p.span()).collect();
        if self.sequence_exceeds(&spans) {
            self.forced = true;
        }
        oxc_ast_visit::walk::walk_object_expression(self, obj);
    }

    fn visit_array_expression(&mut self, arr: &ArrayExpression<'a>) {
        let spans: Vec<Span> = arr.elements.iter().map(|e| e.span()).collect();
        if self.sequence_exceeds(&spans) {
            self.forced = true;
        }
        oxc_ast_visit::walk::walk_array_expression(self, arr);
    }

    fn visit_sequence_expression(&mut self, seq: &SequenceExpression<'a>) {
        let spans: Vec<Span> = seq.expressions.iter().map(|e| e.span()).collect();
        if self.sequence_exceeds(&spans) {
            self.forced = true;
        }
        oxc_ast_visit::walk::walk_sequence_expression(self, seq);
    }

    fn visit_conditional_expression(&mut self, cond: &ConditionalExpression<'a>) {
        if self.width(cond.consequent.span()) + self.width(cond.alternate.span()) > 50 {
            self.forced = true;
        }
        oxc_ast_visit::walk::walk_conditional_expression(self, cond);
    }

    fn visit_template_literal(&mut self, tpl: &TemplateLiteral<'a>) {
        if tpl.quasis.iter().any(|q| q.value.raw.contains('\n')) {
            self.forced = true;
        }
        oxc_ast_visit::walk::walk_template_literal(self, tpl);
    }

    fn visit_block_statement(&mut self, block: &BlockStatement<'a>) {
        if !block.body.is_empty() {
            self.forced = true;
        }
        oxc_ast_visit::walk::walk_block_statement(self, block);
    }

    fn visit_function_body(&mut self, body: &FunctionBody<'a>) {
        // Arrow `=> expr` bodies are flat; block bodies with statements break.
        if !body.statements.is_empty() {
            // An arrow with a concise expression body also reaches here in
            // oxc's AST (single expression statement, same span as the body).
            // Only count real block bodies: those start with `{`.
            let start = body.span.start as usize;
            if self.src.as_bytes().get(start) == Some(&b'{') {
                self.forced = true;
            }
        }
        oxc_ast_visit::walk::walk_function_body(self, body);
    }
}

/// Collapse whitespace runs to a single space, preserving the content of
/// string literals and template-literal quasis (interpolation interiors are
/// still collapsed). Comments are guaranteed absent by the caller.
fn collapse_whitespace_outside_strings(expr: &str) -> String {
    #[derive(Clone, Copy, PartialEq)]
    enum Mode {
        Normal,
        Single,
        Double,
        Template,
    }

    let mut out = String::with_capacity(expr.len());
    // Stack of modes; template interpolations push Normal with a brace depth.
    let mut stack: Vec<(Mode, i32)> = vec![(Mode::Normal, 0)];
    let mut chars = expr.chars().peekable();
    let mut pending_ws = false;

    while let Some(c) = chars.next() {
        let (mode, _) = *stack.last().unwrap();
        match mode {
            Mode::Normal => {
                if c.is_whitespace() {
                    pending_ws = true;
                    continue;
                }
                if pending_ws {
                    out.push(' ');
                    pending_ws = false;
                }
                match c {
                    '\'' => stack.push((Mode::Single, 0)),
                    '"' => stack.push((Mode::Double, 0)),
                    '`' => stack.push((Mode::Template, 0)),
                    '{' => stack.last_mut().unwrap().1 += 1,
                    '}' => {
                        let top = stack.last_mut().unwrap();
                        top.1 -= 1;
                        if top.1 < 0 && stack.len() > 1 {
                            // closing a template interpolation
                            stack.pop();
                        }
                    }
                    _ => {}
                }
                out.push(c);
            }
            Mode::Single | Mode::Double => {
                out.push(c);
                if c == '\\' {
                    if let Some(n) = chars.next() {
                        out.push(n);
                    }
                } else if (mode == Mode::Single && c == '\'') || (mode == Mode::Double && c == '"')
                {
                    stack.pop();
                }
            }
            Mode::Template => {
                out.push(c);
                if c == '\\' {
                    if let Some(n) = chars.next() {
                        out.push(n);
                    }
                } else if c == '`' {
                    stack.pop();
                } else if c == '$' && chars.peek() == Some(&'{') {
                    out.push(chars.next().unwrap());
                    stack.push((Mode::Normal, 0));
                }
            }
        }
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flat_short_untouched() {
        assert_eq!(reflow_template_expr("$.escape(a)"), "$.escape(a)");
    }

    #[test]
    fn collapses_multiline_when_esrap_flat() {
        let src = "$.escape(new Intl.DateTimeFormat([], {\n\t\ttimeStyle: 'full',\n\t\ttimeZone: data.timezone\n\t}).format(new Date(data.now)))";
        let out = reflow_template_expr(src);
        assert!(!out.contains('\n'), "{out}");
    }

    #[test]
    fn breaks_wide_object() {
        let src = "$.attr_style('', { color, width: '12rem', 'background-color': darkMode ? 'black' : 'white' })";
        let out = reflow_template_expr(src);
        assert!(out.contains('\n'), "{out}");
    }

    #[test]
    fn keeps_narrow_object_flat() {
        let src = "$.attr_style('', { color, width: '12rem' })";
        let out = reflow_template_expr(src);
        assert!(!out.contains('\n'), "{out}");
    }

    #[test]
    fn ternary_over_50_breaks() {
        let src = "$.escape(condition ? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' : 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')";
        let out = reflow_template_expr(src);
        assert!(out.contains('\n'), "{out}");
    }
}
