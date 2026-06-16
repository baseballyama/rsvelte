//! AST-based rewrite of private-field assignments + updates in
//! class method bodies (with `this.` prefix and proxy detection
//! for `$state` fields).
//!
//! Replaces the assignment / update branches in
//! `class_transforms.rs::transform_class_methods` (lines 1169+).
//!
//! Differs from `private_field_assign_ast` (PR #207, non-this
//! constructor variant) in two ways:
//!
//! 1. `$state` fields get a `, true` flag when the RHS expression
//!    needs proxy wrapping (per `expression_needs_proxy`). Other
//!    rune types and the non-this variant don't apply this.
//! 2. Update expressions (`q++`, `--q`) are also rewritten to
//!    `$.update(q)` / `$.update_pre(q[, -1])`.
//!
//! Mappings (preserved exactly):
//!
//! | Source        | Replacement (proxy-needing $state)         | Replacement (otherwise)             |
//! |---------------|--------------------------------------------|-------------------------------------|
//! | `q = expr`    | `$.set(q, expr, true)`                     | `$.set(q, expr)`                    |
//! | `q += expr`   | `$.set(q, $.get(q) + expr, true)`          | `$.set(q, $.get(q) + expr)`         |
//! | (incl. `-= *= /= %= **=`)                                                                          |
//! | `q++`         | `$.update(q)`                              | `$.update(q)`                       |
//! | `q--`         | `$.update(q, -1)`                          | `$.update(q, -1)`                   |
//! | `++q`         | `$.update_pre(q)`                          | `$.update_pre(q)`                   |
//! | `--q`         | `$.update_pre(q, -1)`                      | `$.update_pre(q, -1)`               |
//!
//! Where `q` matches one of the qualified names. `state_qualified`
//! holds the `$state`-rune-type qualifieds (proxy-aware); other
//! qualifieds (`$state.raw`, `$state.frozen`, `$derived`,
//! `$derived.by`) go in `other_qualified`.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::{AssignmentOperator, UpdateOperator};

use super::ast_rewrite::{self, Edit};
use super::expression_utils::expression_needs_proxy;

thread_local! {
    static MODULE_PRIVATE_CLASS_ASSIGN_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of private-field assignments + updates for
/// class method bodies. `state_qualified` lists `$state` fields
/// (proxy-aware); `other_qualified` lists other rune types
/// (no proxy logic). Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_private_class_assign_ast(
    source: &str,
    state_qualified: &[String],
    other_qualified: &[String],
) -> Option<String> {
    if state_qualified.is_empty() && other_qualified.is_empty() {
        return None;
    }
    if !state_qualified
        .iter()
        .chain(other_qualified.iter())
        .any(|q| memchr::memmem::find(source.as_bytes(), q.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        single_pass(src, state_qualified, other_qualified)
    })
}

fn single_pass(
    source: &str,
    state_qualified: &[String],
    other_qualified: &[String],
) -> Option<String> {
    MODULE_PRIVATE_CLASS_ASSIGN_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());

        // Parse directly.  If that fails (e.g. the content is a block of class
        // method definitions extracted without their enclosing `class` keyword),
        // retry by wrapping in a synthetic class so OXC can recognise the
        // method signatures.  Span offsets are adjusted back to the original
        // source after collection.
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();

        const CLASS_PREFIX: &str = "class _Dummy_ {\n";
        let (parse_str_owned, span_offset): (Option<String>, u32) =
            if !parser_ret.diagnostics.is_empty() {
                let wrapped = format!("{}{}\n}}", CLASS_PREFIX, source);
                (Some(wrapped), CLASS_PREFIX.len() as u32)
            } else {
                (None, 0u32)
            };

        let parse_str: &str = match &parse_str_owned {
            Some(s) => s.as_str(),
            None => source,
        };

        let program_to_visit = if parse_str_owned.is_some() {
            let ret = Parser::new(&allocator, parse_str, SourceType::mjs())
                .with_options(ParseOptions {
                    allow_return_outside_function: true,
                    ..ParseOptions::default()
                })
                .parse();
            if !ret.diagnostics.is_empty() {
                *cell.borrow_mut() = allocator;
                return None;
            }
            Some(ret)
        } else {
            None
        };

        let program_ref = match &program_to_visit {
            Some(ret) => &ret.program,
            None => &parser_ret.program,
        };

        let mut collector = PrivateClassAssignCollector {
            source: parse_str,
            state_qualified,
            other_qualified,
            replacements: Vec::new(),
        };
        collector.visit_program(program_ref);
        let mut replacements = collector.replacements;

        // Adjust span offsets back to the original un-wrapped source.
        if span_offset > 0 {
            for (start, end, _) in &mut replacements {
                *start = start.saturating_sub(span_offset);
                *end = end.saturating_sub(span_offset);
            }
            // Drop any replacement that fell outside the original source range.
            let src_len = source.len() as u32;
            replacements.retain(|(_, e, _)| *e <= src_len);
        }

        *cell.borrow_mut() = allocator;
        ast_rewrite::splice(source, replacements, true)
    })
}

struct PrivateClassAssignCollector<'a> {
    source: &'a str,
    state_qualified: &'a [String],
    other_qualified: &'a [String],
    replacements: Vec<Edit>,
}

#[derive(Clone, Copy)]
enum Match {
    State,
    Other,
}

impl<'a> PrivateClassAssignCollector<'a> {
    fn classify(&self, text: &str) -> Option<Match> {
        if self.state_qualified.iter().any(|q| q.as_str() == text) {
            Some(Match::State)
        } else if self.other_qualified.iter().any(|q| q.as_str() == text) {
            Some(Match::Other)
        } else {
            None
        }
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateClassAssignCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::PrivateFieldExpression(pf) = &expr.left else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        let Some(kind) = self.classify(pf_text) else {
            return;
        };
        let qualified = pf_text;

        let op_str = match expr.operator {
            AssignmentOperator::Assign => None,
            AssignmentOperator::Addition => Some("+"),
            AssignmentOperator::Subtraction => Some("-"),
            AssignmentOperator::Multiplication => Some("*"),
            AssignmentOperator::Division => Some("/"),
            AssignmentOperator::Remainder => Some("%"),
            AssignmentOperator::Exponential => Some("**"),
            _ => return,
        };

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        // Proxy logic applies ONLY for $state with proxy-needing RHS.
        let needs_proxy = matches!(kind, Match::State) && expression_needs_proxy(rhs_text);

        let rewrite = match (op_str, needs_proxy) {
            (None, true) => format!("$.set({}, {}, true)", qualified, rhs_text),
            (None, false) => format!("$.set({}, {})", qualified, rhs_text),
            (Some(op), true) => format!(
                "$.set({}, $.get({}) {} {}, true)",
                qualified, qualified, op, rhs_text
            ),
            (Some(op), false) => format!(
                "$.set({}, $.get({}) {} {})",
                qualified, qualified, op, rhs_text
            ),
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::PrivateFieldExpression(pf) = &expr.argument else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        if self.classify(pf_text).is_none() {
            return;
        }
        let qualified = pf_text;

        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", qualified),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", qualified),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", qualified),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", qualified),
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn state_assign_with_proxy_object_literal() {
        // `{ x: 1 }` needs proxy.
        let out = transform_private_class_assign_ast(
            "this.#data = { x: 1 };",
            &ssv(&["this.#data"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#data, { x: 1 }, true);");
    }

    #[test]
    fn state_assign_without_proxy_primitive() {
        // `5` is primitive — no proxy needed.
        let out =
            transform_private_class_assign_ast("this.#count = 5;", &ssv(&["this.#count"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#count, 5);");
    }

    #[test]
    fn state_assign_with_proxy_array_literal() {
        let out = transform_private_class_assign_ast(
            "this.#list = [1, 2, 3];",
            &ssv(&["this.#list"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#list, [1, 2, 3], true);");
    }

    #[test]
    fn state_assign_with_proxy_new_expression() {
        let out =
            transform_private_class_assign_ast("this.#obj = new Foo();", &ssv(&["this.#obj"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#obj, new Foo(), true);");
    }

    #[test]
    fn derived_assign_no_proxy_even_with_object() {
        // $derived doesn't get proxy logic.
        let out =
            transform_private_class_assign_ast("this.#d = { x: 1 };", &[], &ssv(&["this.#d"]))
                .unwrap();
        assert_eq!(out, "$.set(this.#d, { x: 1 });");
    }

    #[test]
    fn compound_state_with_proxy_obj_rhs() {
        let out = transform_private_class_assign_ast(
            "this.#data += { x: 1 };",
            &ssv(&["this.#data"]),
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "$.set(this.#data, $.get(this.#data) + { x: 1 }, true);"
        );
    }

    #[test]
    fn compound_state_without_proxy_primitive() {
        let out =
            transform_private_class_assign_ast("this.#count += 3;", &ssv(&["this.#count"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) + 3);");
    }

    #[test]
    fn post_increment_state() {
        let out = transform_private_class_assign_ast("this.#count++;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update(this.#count);");
    }

    #[test]
    fn post_decrement_state() {
        let out = transform_private_class_assign_ast("this.#count--;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update(this.#count, -1);");
    }

    #[test]
    fn pre_increment_state() {
        let out = transform_private_class_assign_ast("++this.#count;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update_pre(this.#count);");
    }

    #[test]
    fn pre_decrement_state() {
        let out = transform_private_class_assign_ast("--this.#count;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update_pre(this.#count, -1);");
    }

    #[test]
    fn instance_prefix_state() {
        let out = transform_private_class_assign_ast(
            "instance.#count = 5;",
            &ssv(&["instance.#count"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(instance.#count, 5);");
    }

    #[test]
    fn unknown_field_left_alone() {
        assert!(
            transform_private_class_assign_ast("this.#other = 5;", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count = 5";"#;
        assert!(transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count = 5}`;";
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).unwrap();
        assert_eq!(out, "let s = `${$.set(this.#count, 5)}`;");
    }

    #[test]
    fn multiple_fields_in_one_source() {
        let out = transform_private_class_assign_ast(
            "this.#a = 1; this.#b++;",
            &ssv(&["this.#a"]),
            &ssv(&["this.#b"]),
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#a, 1); $.update(this.#b);");
    }

    #[test]
    fn already_wrapped_no_op() {
        // After wrap, the AssignmentExpression is gone.
        let src = "$.set(this.#count, 5);";
        assert!(transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).is_none());
    }

    #[test]
    fn arrow_function_rhs_no_proxy() {
        // Arrow function isn't proxy-needing.
        let out = transform_private_class_assign_ast(
            "this.#cb = (x) => x + 1;",
            &ssv(&["this.#cb"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#cb, (x) => x + 1);");
    }

    #[test]
    fn member_chain_lhs_left_alone() {
        // `this.#count.foo = 5` — LHS is StaticMember, not bare
        // PrivateField. Different code path.
        assert!(
            transform_private_class_assign_ast("this.#count.foo = 5;", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn empty_qualified_no_op() {
        assert!(transform_private_class_assign_ast("this.#count = 5;", &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_private_class_assign_ast("this.#count = (", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn no_op_without_qualified_in_source() {
        assert!(
            transform_private_class_assign_ast("let x = 1;", &ssv(&["this.#count"]), &[]).is_none()
        );
    }

    #[test]
    fn unsupported_compound_left_alone() {
        // ??=, &&=, ||= not in text version's allowlist
        assert!(
            transform_private_class_assign_ast("this.#count ??= 5;", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn return_at_top_level_works() {
        // Class method bodies often have bare return
        let src = "return this.#count = 5;";
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).unwrap();
        assert_eq!(out, "return $.set(this.#count, 5);");
    }

    #[test]
    fn class_method_body_with_filter_lambda() {
        // Multi-line assignment inside a class method body.
        // The source is NOT valid as a standalone module (it's a method definition),
        // so Fix #2 (class wrapper) must kick in.
        let src = "remove(item) {\n  this.#files = this.#files.filter((f) => {\n    if (f === item) return false;\n    return true;\n  });\n}";
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#files"]), &[]).unwrap();
        // The assignment should be rewritten; no stray ) should appear
        assert!(
            out.contains("$.set(this.#files,"),
            "expected $.set rewrite, got: {}",
            out
        );
        assert!(
            !out.contains("return false);"),
            "stray ) detected in: {}",
            out
        );
    }

    #[test]
    fn multiple_method_bodies_with_filter_lambda() {
        // Multiple method definitions in a single source block, one of which
        // has a multi-line filter lambda.  The entire block fails to parse as a
        // module, so Fix #2 (class wrapper) must kick in.
        let src = concat!(
            "get files() {\n  return this.#files;\n}\n",
            "remove(item) {\n",
            "  this.#files = this.#files.filter((f) => {\n",
            "    if (f === item) return false;\n",
            "    if (f.name.startsWith(item.name + \"/\")) return false;\n",
            "    return true;\n",
            "  });\n",
            "}\n",
            "add(item) {\n  this.#files = this.#files.concat(item);\n}\n",
        );
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#files"]), &[]).unwrap();
        assert!(
            out.contains("$.set(this.#files,"),
            "expected $.set rewrite, got:\n{}",
            out
        );
        assert!(
            !out.contains("return false);"),
            "stray ) detected in:\n{}",
            out
        );
    }
}
