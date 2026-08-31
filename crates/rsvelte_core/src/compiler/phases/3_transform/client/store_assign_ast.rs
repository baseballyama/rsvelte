//! AST-based rewrite of store-subscription `AssignmentExpression`s.
//!
//! Covers:
//!
//! | Source           | Replacement                                  |
//! |------------------|----------------------------------------------|
//! | `$count = expr`  | `$.store_set(<access>, expr)`                |
//! | `$count += expr` | `$.store_set(<access>, $count() + expr)`     |
//! | `$count -= expr` | `$.store_set(<access>, $count() - expr)`     |
//! | `$count *= expr` | `$.store_set(<access>, $count() * expr)`     |
//! | `$count /= expr` | `$.store_set(<access>, $count() / expr)`     |
//! | `$count %= expr` | `$.store_set(<access>, $count() % expr)`     |
//! | `$count ??= expr`| `$.store_set(<access>, $count() ?? expr)`    |
//! | `$count &&= expr`| `$.store_set(<access>, $count() && expr)`    |
//! | `$count \|\|= expr`| `$.store_set(<access>, $count() \|\| expr)` |
//!
//! The bitwise / shift compound operators (`**= <<= >>= >>>= &= \|= ^=`) lower
//! the same way and were previously dropped (H-026).
//!
//! `<access>` follows the same three-way classification used by
//! `store_update_ast` (prop getter / reactive-state read / plain
//! identifier).
//!
//! Member-expression mutations (`$store.prop = expr`,
//! `$store[0]++` etc.) and member updates remain on the text path
//! in `transform_store_member_mutations` — they have a different
//! call shape (`$.store_mutate` with `$.untrack`).
//!
//! Replaces the text loops in
//! `store_transforms.rs::transform_store_assignments_client` at
//! lines 78–147 (compound + simple assignment). The text version
//! had to hand-roll boundary checks (`==` vs `=`, `obj.$x =` member
//! access, identifier neighbours) and an expression-end finder; the
//! AST drops all of that.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::AssignmentOperator;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_STORE_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Map a compound assignment operator to the binary operator it expands to for
/// `$.store_set(access, $sub() <op> rhs)` lowering. Returns `None` only for the
/// plain `=` operator, which the caller handles separately. Covers the full set
/// (`+ - * / % ** << >> >>> | ^ & || && ??`) so bitwise / shift store
/// compound-assignments are no longer dropped (matches upstream).
fn compound_store_op(op: AssignmentOperator) -> Option<&'static str> {
    use AssignmentOperator::*;
    Some(match op {
        Addition => "+",
        Subtraction => "-",
        Multiplication => "*",
        Division => "/",
        Remainder => "%",
        Exponential => "**",
        ShiftLeft => "<<",
        ShiftRight => ">>",
        ShiftRightZeroFill => ">>>",
        BitwiseOR => "|",
        BitwiseXOR => "^",
        BitwiseAnd => "&",
        LogicalOr => "||",
        LogicalAnd => "&&",
        LogicalNullish => "??",
        Assign => return None,
    })
}

/// AST-based rewrite of `$count = expr` / `$count <op>= expr` for
/// the bindings listed in `store_sub_vars`. The underlying
/// store-binding classification (prop / reactive state / regular)
/// comes from the three other slices, matching the text version in
/// `transform_store_assignments_client`.
///
/// Returns `None` if there's nothing to rewrite (no `$<store>` in
/// source, no matching `AssignmentExpression`, or parse failure).
pub fn transform_store_assign_ast(
    source: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> Option<String> {
    let spliced = || {
        transform_store_assign_spliced(
            source,
            store_sub_vars,
            prop_vars,
            state_vars,
            non_reactive_state_vars,
        )
    };
    ast_rewrite::dual_run::resolve("store_assign_ast:inplace", source, spliced, || {
        transform_store_assign_in_place(
            source,
            store_sub_vars,
            prop_vars,
            state_vars,
            non_reactive_state_vars,
        )
    })
}

fn transform_store_assign_spliced(
    source: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> Option<String> {
    if store_sub_vars.is_empty() {
        return None;
    }
    if !store_sub_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_STORE_ASSIGN_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let mut collector = StoreAssignCollector {
                    source: src,
                    store_sub_vars,
                    prop_vars,
                    state_vars,
                    non_reactive_state_vars,
                    replacements: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct StoreAssignCollector<'a> {
    source: &'a str,
    store_sub_vars: &'a [String],
    prop_vars: &'a [String],
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    replacements: Vec<Edit>,
}

impl<'a, 'ast> Visit<'ast> for StoreAssignCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        // LHS must be a bare `$name` identifier — member, array, or
        // object targets go through the member-mutation path.
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.store_sub_vars.iter().any(|s| s == name) {
            return;
        }

        let store_sub = name;
        let store_name = &name[1..];

        let store_access = match super::store_transforms::store_source_read(
            store_name,
            self.prop_vars,
            self.state_vars,
            self.non_reactive_state_vars,
        ) {
            super::store_transforms::StoreSourceRead::Getter => format!("{}()", store_name),
            super::store_transforms::StoreSourceRead::Signal => format!("$.get({})", store_name),
            super::store_transforms::StoreSourceRead::Bare => store_name.to_string(),
        };

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        let rewrite = if expr.operator == AssignmentOperator::Assign {
            format!("$.store_set({}, {})", store_access, rhs_text)
        } else {
            // Every compound operator lowers to `$.store_set(access, $sub() <op> rhs)`.
            // (RHS grouping for lower-precedence expressions is a separate, broader
            // fix — the shared parens helper is precedence-incomplete and also
            // affects the state path; see H-025 deferral.)
            let Some(op_str) = compound_store_op(expr.operator) else {
                return;
            };
            format!(
                "$.store_set({}, {}() {} {})",
                store_access, store_sub, op_str, rhs_text
            )
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
    fn simple_assignment_regular() {
        let out =
            transform_store_assign_ast("$count = 5;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, 5);");
    }

    #[test]
    fn simple_assignment_prop() {
        let out = transform_store_assign_ast(
            "$count = 5;",
            &ssv(&["$count"]),
            &ssv(&["count"]),
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.store_set(count(), 5);");
    }

    #[test]
    fn simple_assignment_state() {
        let out = transform_store_assign_ast(
            "$count = 5;",
            &ssv(&["$count"]),
            &[],
            &ssv(&["count"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.store_set($.get(count), 5);");
    }

    #[test]
    fn compound_addition() {
        let out =
            transform_store_assign_ast("$count += 3;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() + 3);");
    }

    #[test]
    fn compound_subtraction() {
        let out =
            transform_store_assign_ast("$count -= 3;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() - 3);");
    }

    #[test]
    fn compound_multiplication() {
        let out =
            transform_store_assign_ast("$count *= 2;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() * 2);");
    }

    #[test]
    fn compound_division() {
        let out =
            transform_store_assign_ast("$count /= 2;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() / 2);");
    }

    #[test]
    fn compound_remainder() {
        let out =
            transform_store_assign_ast("$count %= 2;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() % 2);");
    }

    #[test]
    fn compound_nullish() {
        let out =
            transform_store_assign_ast("$count ??= 5;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() ?? 5);");
    }

    #[test]
    fn compound_logical_and() {
        let out =
            transform_store_assign_ast("$count &&= 5;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() && 5);");
    }

    #[test]
    fn compound_logical_or() {
        let out =
            transform_store_assign_ast("$count ||= 5;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(count, $count() || 5);");
    }

    #[test]
    fn compound_bitwise_and_shift_ops() {
        // H-026: bitwise / shift compound operators were previously dropped.
        for (src, expected) in [
            ("$count &= 3;", "$.store_set(count, $count() & 3);"),
            ("$count |= 3;", "$.store_set(count, $count() | 3);"),
            ("$count ^= 3;", "$.store_set(count, $count() ^ 3);"),
            ("$count <<= 2;", "$.store_set(count, $count() << 2);"),
            ("$count >>= 2;", "$.store_set(count, $count() >> 2);"),
            ("$count >>>= 2;", "$.store_set(count, $count() >>> 2);"),
            ("$count **= 2;", "$.store_set(count, $count() ** 2);"),
        ] {
            let out = transform_store_assign_ast(src, &ssv(&["$count"]), &[], &[], &[]).unwrap();
            assert_eq!(out, expected, "for {src}");
        }
    }

    #[test]
    fn leaves_equality_alone() {
        // `==` and `===` are BinaryExpression, not AssignmentExpression
        assert!(
            transform_store_assign_ast("if ($count == 5) {}", &ssv(&["$count"]), &[], &[], &[])
                .is_none()
        );
        assert!(
            transform_store_assign_ast("if ($count === 5) {}", &ssv(&["$count"]), &[], &[], &[])
                .is_none()
        );
    }

    #[test]
    fn leaves_member_assignment_alone() {
        // `obj.$count = 5` and `$store.prop = 5` go through the
        // member-mutation path.
        assert!(
            transform_store_assign_ast("obj.$count = 5;", &ssv(&["$count"]), &[], &[], &[])
                .is_none()
        );
        assert!(
            transform_store_assign_ast("$store.prop = 5;", &ssv(&["$store"]), &[], &[], &[])
                .is_none()
        );
    }

    #[test]
    fn leaves_declaration_alone() {
        // `let $count = expr` is a VariableDeclarator, not an
        // AssignmentExpression.
        assert!(
            transform_store_assign_ast("let $count = 5;", &ssv(&["$count"]), &[], &[], &[])
                .is_none()
        );
    }

    #[test]
    fn leaves_destructuring_alone() {
        // Array/object destructuring targets go through different
        // assignment-target variants.
        assert!(
            transform_store_assign_ast("[$count] = arr;", &ssv(&["$count"]), &[], &[], &[])
                .is_none()
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "$count = 5";"#;
        assert!(transform_store_assign_ast(src, &ssv(&["$count"]), &[], &[], &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$count = 5}`;";
        let out = transform_store_assign_ast(src, &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "let s = `${$.store_set(count, 5)}`;");
    }

    #[test]
    fn rewrites_for_loop_init() {
        let src = "for ($count = 0; cond; step()) {}";
        let out = transform_store_assign_ast(src, &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "for ($.store_set(count, 0); cond; step()) {}");
    }

    #[test]
    fn multiple_assignments_in_one_source() {
        let out =
            transform_store_assign_ast("$a = 1; $b += 2;", &ssv(&["$a", "$b"]), &[], &[], &[])
                .unwrap();
        assert_eq!(out, "$.store_set(a, 1);\n$.store_set(b, $b() + 2);");
    }

    #[test]
    fn nested_assignment_chain() {
        // `$a = $b = 5` — inner picked up first, outer on next pass.
        let out =
            transform_store_assign_ast("$a = $b = 5;", &ssv(&["$a", "$b"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.store_set(a, $.store_set(b, 5));");
    }

    #[test]
    fn rhs_with_complex_expression() {
        let out = transform_store_assign_ast(
            "$count = foo(1, 2) + bar.baz;",
            &ssv(&["$count"]),
            &[],
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.store_set(count, foo(1, 2) + bar.baz);");
    }

    #[test]
    fn rhs_with_arrow_function() {
        let out = transform_store_assign_ast("$cb = (x) => x + 1;", &ssv(&["$cb"]), &[], &[], &[])
            .unwrap();
        assert_eq!(out, "$.store_set(cb, (x) => x + 1);");
    }

    #[test]
    fn non_reactive_state_falls_back_to_regular() {
        let out = transform_store_assign_ast(
            "$count = 5;",
            &ssv(&["$count"]),
            &[],
            &ssv(&["count"]),
            &ssv(&["count"]),
        )
        .unwrap();
        assert_eq!(out, "$.store_set(count, 5);");
    }

    #[test]
    fn empty_store_subs_is_no_op() {
        assert!(transform_store_assign_ast("$count = 5;", &[], &[], &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_store_assign_ast("$count = (", &ssv(&["$count"]), &[], &[], &[]).is_none()
        );
    }

    #[test]
    fn no_op_without_prefix_dollar() {
        assert!(
            transform_store_assign_ast("let x = 1;", &ssv(&["$count"]), &[], &[], &[]).is_none()
        );
    }
}

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_STORE_ASSIGN_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// The compound operators above, as nodes. Logical assignment lowers to a
/// `LogicalExpression`, everything else to a `BinaryExpression`.
enum StoreCompoundOp {
    Binary(oxc_syntax::operator::BinaryOperator),
    Logical(oxc_syntax::operator::LogicalOperator),
}

fn compound_store_op_node(op: AssignmentOperator) -> Option<StoreCompoundOp> {
    use AssignmentOperator::*;
    use oxc_syntax::operator::{BinaryOperator as B, LogicalOperator as L};
    Some(match op {
        Addition => StoreCompoundOp::Binary(B::Addition),
        Subtraction => StoreCompoundOp::Binary(B::Subtraction),
        Multiplication => StoreCompoundOp::Binary(B::Multiplication),
        Division => StoreCompoundOp::Binary(B::Division),
        Remainder => StoreCompoundOp::Binary(B::Remainder),
        Exponential => StoreCompoundOp::Binary(B::Exponential),
        ShiftLeft => StoreCompoundOp::Binary(B::ShiftLeft),
        ShiftRight => StoreCompoundOp::Binary(B::ShiftRight),
        ShiftRightZeroFill => StoreCompoundOp::Binary(B::ShiftRightZeroFill),
        BitwiseOR => StoreCompoundOp::Binary(B::BitwiseOR),
        BitwiseXOR => StoreCompoundOp::Binary(B::BitwiseXOR),
        BitwiseAnd => StoreCompoundOp::Binary(B::BitwiseAnd),
        LogicalOr => StoreCompoundOp::Logical(L::Or),
        LogicalAnd => StoreCompoundOp::Logical(L::And),
        LogicalNullish => StoreCompoundOp::Logical(L::Coalesce),
        _ => return None,
    })
}

/// In-place equivalent of [`transform_store_assign_ast`].
pub(crate) fn transform_store_assign_in_place(
    source: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> ast_rewrite::Rewrite {
    if store_sub_vars.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !store_sub_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return ast_rewrite::Rewrite::Unchanged;
    }

    ast_rewrite::with_program_mut(
        &MODULE_STORE_ASSIGN_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            let mut rewriter = StoreAssignRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                store_sub_vars,
                prop_vars,
                state_vars,
                non_reactive_state_vars,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct StoreAssignRewriter<'a, 'b> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    store_sub_vars: &'b [String],
    prop_vars: &'b [String],
    state_vars: &'b [String],
    non_reactive_state_vars: &'b [String],
    changed: bool,
}

impl<'a, 'b> StoreAssignRewriter<'a, 'b> {
    /// How the store itself is read: a prop is a getter call, reactive state
    /// goes through `$.get`, anything else is the bare binding.
    fn store_access(&self, store_name: &str) -> Expression<'a> {
        match super::store_transforms::store_source_read(
            store_name,
            self.prop_vars,
            self.state_vars,
            self.non_reactive_state_vars,
        ) {
            super::store_transforms::StoreSourceRead::Getter => self.b.call(store_name, vec![]),
            super::store_transforms::StoreSourceRead::Signal => {
                self.b.call("$.get", vec![self.b.id(store_name)])
            }
            super::store_transforms::StoreSourceRead::Bare => self.b.id(store_name),
        }
    }
}

impl<'a, 'b> oxc_ast_visit::VisitMut<'a> for StoreAssignRewriter<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let Expression::AssignmentExpression(assign) = &*expr else {
            return;
        };
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &assign.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.store_sub_vars.iter().any(|s| s == name) {
            return;
        }
        let operator = assign.operator;
        if operator != AssignmentOperator::Assign && compound_store_op_node(operator).is_none() {
            return;
        }
        let store_sub = name.to_string();
        let store_name = store_sub[1..].to_string();

        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::AssignmentExpression(assign) = taken else {
            unreachable!("checked above")
        };
        let rhs = assign.unbox().right;
        let access = self.store_access(&store_name);
        let value = match compound_store_op_node(operator) {
            None => rhs,
            Some(StoreCompoundOp::Binary(op)) => {
                self.b
                    .binary(op, self.b.call(store_sub.as_str(), vec![]), rhs)
            }
            Some(StoreCompoundOp::Logical(op)) => {
                self.b
                    .logical(op, self.b.call(store_sub.as_str(), vec![]), rhs)
            }
        };
        *expr = self.b.call("$.store_set", vec![access, value]);
        self.changed = true;
    }
}
