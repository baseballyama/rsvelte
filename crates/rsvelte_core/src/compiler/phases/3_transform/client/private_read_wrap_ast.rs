//! AST-based rewrite of standalone class private-field reads:
//! `this.#count` → `$.get(this.#count)`.
//!
//! Replaces `class_transforms.rs::wrap_standalone_private_reads`
//! (lines 1261+). The text version uses `line.find(qualified)`
//! and hand-checks the surrounding bytes to distinguish reads
//! from assignments / member chains / increments / equality.
//! The AST visitor walks `PrivateFieldExpression`s directly and
//! consults parent-position info to decide whether the field is
//! in a read position.
//!
//! Skip cases (preserved from the text version):
//!
//! - Already inside `$.get(`, `$.set(`, `$.update(`,
//!   `$.update_pre(` — detected by a `visit_call_expression`
//!   check on the callee + arg position.
//! - LHS of an `AssignmentExpression` — `expr.left` is a
//!   `SimpleAssignmentTarget::PrivateFieldExpression`.
//! - Argument of an `UpdateExpression` (`this.#count++`,
//!   `--this.#count`).
//! - `.object` of an enclosing `StaticMemberExpression` /
//!   `ComputedMemberExpression` (i.e. `this.#count.foo` —
//!   the read is the deeper chain, not the bare field).
//!
//! `==` / `===` are NOT skipped — they are reads.
//!
//! The `qualified` argument (e.g. `"this.#count"` or
//! `"instance.#count"`) is matched against the source text at the
//! `PrivateFieldExpression` span. Matching by source text covers
//! both `this`-prefixed and arbitrary-identifier-prefixed forms
//! the same way the text version's literal `.find` does.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_PRIVATE_READ_WRAP_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of `qualified` reads (where `qualified` is
/// the source-text of a private-field access like `this.#count`)
/// to `$.get(qualified)`. Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_private_read_wrap_ast(source: &str, qualified: &str) -> Option<String> {
    if qualified.is_empty() {
        return None;
    }
    // Fast probe — bail if `qualified` doesn't appear at all.
    memchr::memmem::find(source.as_bytes(), qualified.as_bytes())?;

    let mut parsed = false;
    let plain = ast_rewrite::fixed_point(source, |src| run_once(src, qualified, &mut parsed));
    if plain.is_some() || parsed {
        return plain;
    }

    // Callers also hand this a single class MEMBER, where a private field
    // outside a class body is a parse error — re-host it so the walk runs
    // instead of the source falling through to the text scan.
    let (open, close) = ast_rewrite::class_host(source)?;
    let hosted = format!("{open}{source}{close}");
    let out = ast_rewrite::fixed_point(&hosted, |src| run_once(src, qualified, &mut parsed))?;
    Some(out.strip_prefix(&open)?.strip_suffix(&close)?.to_string())
}

fn run_once(src: &str, qualified: &str, parsed: &mut bool) -> Option<String> {
    let attempt = ast_rewrite::rewrite_once_attempt(
        &MODULE_PRIVATE_READ_WRAP_ALLOC,
        src,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        true,
        |program| {
            let mut collector = PrivateReadWrapCollector {
                source: src,
                qualified,
                comments: &program.comments,
                replacements: Vec::new(),
                wrapped_by_paren: Vec::new(),
                object_parens: Vec::new(),
                skip_spans: Vec::new(),
            };
            collector.visit_program(program);
            let skip = collector.skip_spans;
            let mut replacements = collector.replacements;
            replacements.retain(|(field, _)| !skip.contains(field));
            replacements.into_iter().map(|(_, edit)| edit).collect()
        },
    );
    match attempt {
        ast_rewrite::ParseAttempt::Parsed(out) => {
            *parsed = true;
            out
        }
        ast_rewrite::ParseAttempt::NotParsed => None,
    }
}

struct PrivateReadWrapCollector<'a> {
    source: &'a str,
    qualified: &'a str,
    comments: &'a [oxc_ast::Comment],
    /// Keyed by the field's own span so `skip_spans` still matches after the
    /// edit has been widened over a leading comment.
    replacements: Vec<((u32, u32), Edit)>,
    /// Field spans an enclosing parenthesised group has already emitted an
    /// edit for.
    wrapped_by_paren: Vec<(u32, u32)>,
    /// Parenthesised groups that are the object of a deeper chain, where the
    /// comment leads that chain rather than the field.
    object_parens: Vec<(u32, u32)>,
    /// Spans of `PrivateFieldExpression`s that should NOT be
    /// rewritten (assignment LHS, update target, deeper-member
    /// object, $.get/$.set/$.update/$.update_pre argument).
    skip_spans: Vec<(u32, u32)>,
}

impl<'a> PrivateReadWrapCollector<'a> {
    fn callee_is_dollar_member(callee: &Expression<'_>) -> Option<&'static str> {
        let Expression::StaticMemberExpression(m) = callee else {
            return None;
        };
        let Expression::Identifier(id) = &m.object else {
            return None;
        };
        if id.name.as_str() != "$" {
            return None;
        }
        match m.property.name.as_str() {
            "get" => Some("get"),
            "set" => Some("set"),
            "update" => Some("update"),
            "update_pre" => Some("update_pre"),
            _ => None,
        }
    }

    /// The `qualified` private field `expr` is, through any number of source
    /// parentheses.
    fn qualified_field<'x, 'ast>(
        &self,
        expr: &'x Expression<'ast>,
    ) -> Option<&'x PrivateFieldExpression<'ast>> {
        let mut e = expr;
        while let Expression::ParenthesizedExpression(p) = e {
            e = &p.expression;
        }
        let Expression::PrivateFieldExpression(field) = e else {
            return None;
        };
        (&self.source[field.span.start as usize..field.span.end as usize] == self.qualified)
            .then(|| field.as_ref())
    }

    /// Start of the comment run immediately leading `at`, or `at` itself.
    fn comment_run_start(&self, at: u32) -> u32 {
        let bytes = self.source.as_bytes();
        let mut pos = at as usize;
        loop {
            let mut i = pos;
            while i > 0 && bytes[i - 1].is_ascii_whitespace() {
                i -= 1;
            }
            match self
                .comments
                .iter()
                .find(|c| c.span.end as usize == i && (c.span.start as usize) < i)
            {
                Some(c) => pos = c.span.start as usize,
                None => return pos as u32,
            }
        }
    }

    fn note_object_paren(&mut self, expr: &Expression<'_>) {
        if let Expression::ParenthesizedExpression(p) = expr {
            self.object_parens.push((p.span.start, p.span.end));
        }
    }

    fn push_skip<S: oxc_span::GetSpan>(&mut self, node: &S) {
        let s = node.span();
        self.skip_spans.push((s.start, s.end));
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateReadWrapCollector<'a> {
    fn visit_private_field_expression(&mut self, expr: &PrivateFieldExpression<'ast>) {
        self.note_object_paren(&expr.object);
        walk::walk_private_field_expression(self, expr);
        let span_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        if span_text == self.qualified
            && !self
                .wrapped_by_paren
                .contains(&(expr.span.start, expr.span.end))
        {
            // Upstream wraps the NODE, so a comment leading it ends up inside
            // the generated call; a wrap that starts at the field would leave
            // it outside, where esrap then parenthesizes the whole statement.
            let start = self.comment_run_start(expr.span.start);
            let text = &self.source[start as usize..expr.span.end as usize];
            self.replacements.push((
                (expr.span.start, expr.span.end),
                (start, expr.span.end, format!("$.get({text})")),
            ));
        }
    }

    fn visit_parenthesized_expression(&mut self, paren: &ParenthesizedExpression<'ast>) {
        // Source parens are gone from upstream's acorn AST, so a comment before
        // them leads the FIELD there. Widening the edit over the whole group
        // puts it inside the call; the printer then drops the parens as it
        // already does without a comment.
        if let Some(field) = self.qualified_field(&paren.expression)
            && !self
                .object_parens
                .contains(&(paren.span.start, paren.span.end))
        {
            let start = self.comment_run_start(paren.span.start);
            if start != paren.span.start {
                let key = (field.span.start, field.span.end);
                self.wrapped_by_paren.push(key);
                let text = &self.source[start as usize..paren.span.end as usize];
                self.replacements
                    .push((key, (start, paren.span.end, format!("$.get({text})"))));
            }
        }
        walk::walk_parenthesized_expression(self, paren);
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        if let AssignmentTarget::PrivateFieldExpression(pf) = &expr.left {
            self.push_skip(pf.as_ref());
        }
        walk::walk_assignment_expression(self, expr);
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        if let SimpleAssignmentTarget::PrivateFieldExpression(pf) = &expr.argument {
            self.push_skip(pf.as_ref());
        }
        walk::walk_update_expression(self, expr);
    }

    fn visit_static_member_expression(&mut self, member: &StaticMemberExpression<'ast>) {
        if let Expression::PrivateFieldExpression(pf) = &member.object {
            self.push_skip(pf.as_ref());
        }
        self.note_object_paren(&member.object);
        walk::walk_static_member_expression(self, member);
    }

    fn visit_computed_member_expression(&mut self, member: &ComputedMemberExpression<'ast>) {
        if let Expression::PrivateFieldExpression(pf) = &member.object {
            self.push_skip(pf.as_ref());
        }
        self.note_object_paren(&member.object);
        walk::walk_computed_member_expression(self, member);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // `$.get(<pf>)` / `$.set(<pf>, ...)` / `$.update(<pf>, ...)` /
        // `$.update_pre(<pf>, ...)` — skip the FIRST arg's PrivateField.
        if Self::callee_is_dollar_member(&call.callee).is_some()
            && let Some(first) = call.arguments.first().and_then(Argument::as_expression)
            && let Some(pf) = self.qualified_field(first)
        {
            self.push_skip(pf);
        }
        self.note_object_paren(&call.callee);
        walk::walk_call_expression(self, call);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn standalone_read_wrapped() {
        let src = "let x = this.#count;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "let x = $.get(this.#count);");
    }

    #[test]
    fn read_in_expression_wrapped() {
        let src = "return this.#count + 1;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "return $.get(this.#count) + 1;");
    }

    #[test]
    fn read_in_call_arg_wrapped() {
        let src = "foo(this.#count, other);";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "foo($.get(this.#count), other);");
    }

    #[test]
    fn read_in_arrow_body_wrapped() {
        let src = "() => this.#count + 1;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "() => $.get(this.#count) + 1;");
    }

    #[test]
    fn equality_check_wrapped() {
        // `==` / `===` are reads — text version explicitly wraps.
        let src = "if (this.#count == 5) {}";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "if ($.get(this.#count) == 5) {}");
    }

    #[test]
    fn strict_equality_wrapped() {
        let src = "if (this.#count === 5) {}";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "if ($.get(this.#count) === 5) {}");
    }

    #[test]
    fn assignment_lhs_left_alone() {
        let src = "this.#count = 5;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn compound_assignment_lhs_left_alone() {
        let src = "this.#count += 5;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn update_postfix_left_alone() {
        let src = "this.#count++;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn update_prefix_left_alone() {
        let src = "++this.#count;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn deeper_member_chain_left_alone() {
        // `this.#count.foo` — the bare `this.#count` is the .object
        // of the outer member; the read is `this.#count.foo`.
        let src = "let x = this.#count.foo;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn deeper_computed_chain_left_alone() {
        let src = "let x = this.#count[0];";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn already_inside_get_left_alone() {
        let src = "$.get(this.#count);";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn already_inside_set_left_alone() {
        let src = "$.set(this.#count, 5);";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn already_inside_update_left_alone() {
        let src = "$.update(this.#count);";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn instance_prefix_works() {
        let src = "return instance.#count;";
        let out = transform_private_read_wrap_ast(src, "instance.#count").unwrap();
        assert_eq!(out, "return $.get(instance.#count);");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count";"#;
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count}`;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "let s = `${$.get(this.#count)}`;");
    }

    #[test]
    fn read_inside_function_arg_call_pattern() {
        // `someFunc(this.#count)` — read inside a non-$.get call
        // should still be wrapped.
        let src = "foo(this.#count);";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "foo($.get(this.#count));");
    }

    #[test]
    fn different_field_left_alone() {
        // qualified = `this.#count`, source has `this.#other`.
        assert!(transform_private_read_wrap_ast("let x = this.#other;", "this.#count").is_none());
    }

    #[test]
    fn empty_qualified_no_op() {
        assert!(transform_private_read_wrap_ast("this.#count;", "").is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_private_read_wrap_ast("this.#count = (", "this.#count").is_none());
    }

    #[test]
    fn no_op_without_qualified_in_source() {
        assert!(transform_private_read_wrap_ast("let x = 1;", "this.#count").is_none());
    }

    #[test]
    fn multiple_reads_all_wrapped() {
        let src = "return this.#count + this.#count;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "return $.get(this.#count) + $.get(this.#count);");
    }

    #[test]
    fn mixed_read_and_write_only_read_wrapped() {
        let src = "this.#count = this.#count + 1;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        // LHS untouched; RHS read wrapped.
        assert_eq!(out, "this.#count = $.get(this.#count) + 1;");
    }

    #[test]
    fn ternary_test_wrapped() {
        let src = "let x = this.#count > 0 ? a : b;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "let x = $.get(this.#count) > 0 ? a : b;");
    }

    /// The text a class-method caller hands this: a bare member, which is not a
    /// parseable program because a private field needs an enclosing class.
    /// Before the re-host the walk never ran and the text scan did every wrap.
    #[test]
    fn a_bare_class_member_is_rewritten_by_the_ast_walk() {
        let out =
            transform_private_read_wrap_ast("\tm() {\n\t\treturn this.#raw;\n\t}", "this.#raw");
        assert_eq!(
            out.as_deref(),
            Some("\tm() {\n\t\treturn $.get(this.#raw);\n\t}")
        );
    }

    /// The re-host must not leak into the output when the member declares more
    /// than one private name.
    #[test]
    fn a_bare_class_member_mentioning_two_private_names_round_trips() {
        let out = transform_private_read_wrap_ast(
            "\tm() {\n\t\treturn this.#a + this.#b;\n\t}",
            "this.#a",
        );
        assert_eq!(
            out.as_deref(),
            Some("\tm() {\n\t\treturn $.get(this.#a) + this.#b;\n\t}")
        );
    }

    /// A whole module still takes the direct path — the control that the
    /// re-host is reached only by the shape that needs it.
    #[test]
    fn a_whole_class_declaration_is_rewritten_without_the_host() {
        let out = transform_private_read_wrap_ast(
            "class C {\n\t#raw;\n\tm() {\n\t\treturn this.#raw;\n\t}\n}",
            "this.#raw",
        );
        assert_eq!(
            out.as_deref(),
            Some("class C {\n\t#raw;\n\tm() {\n\t\treturn $.get(this.#raw);\n\t}\n}")
        );
    }

    /// An assignment target is not a read on the re-hosted path either. The
    /// read in the same member is what makes this fail rather than return
    /// `None` when the re-host is ablated.
    #[test]
    fn a_bare_class_member_write_is_not_wrapped() {
        let out = transform_private_read_wrap_ast(
            "\tm() {\n\t\tthis.#raw = 1;\n\t\treturn this.#raw;\n\t}",
            "this.#raw",
        );
        assert_eq!(
            out.as_deref(),
            Some("\tm() {\n\t\tthis.#raw = 1;\n\t\treturn $.get(this.#raw);\n\t}")
        );
    }
}
