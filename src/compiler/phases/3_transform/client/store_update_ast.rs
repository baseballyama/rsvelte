//! AST-based rewrite of store-subscription `UpdateExpression`s.
//!
//! Covers the four shapes:
//!
//! | Source        | Replacement                                  |
//! |---------------|----------------------------------------------|
//! | `++$count`    | `$.update_pre_store(<access>, $count())`     |
//! | `--$count`    | `$.update_pre_store(<access>, $count(), -1)` |
//! | `$count++`    | `$.update_store(<access>, $count())`         |
//! | `$count--`    | `$.update_store(<access>, $count(), -1)`     |
//!
//! `<access>` is computed from the underlying (non-`$`-prefixed)
//! store binding's classification (passed in by the caller):
//!
//! * In `prop_vars` → `<name>()` (prop getter)
//! * In `state_vars` and **not** in `non_reactive_state_vars` →
//!   `$.get(<name>)` (reactive state read)
//! * Otherwise → `<name>` (regular variable)
//!
//! Compound assignments (`$count += expr`, `$count = expr`,
//! `$store.prop++`, etc.) are intentionally **not** in this PR —
//! they have their own per-operator logic and depend on more
//! pipeline state (the expression-end finder). They stay on the
//! text path until a follow-up nibble.
//!
//! Replaces the bare `String::replace` loop in
//! `store_transforms.rs::transform_store_assignments_client` lines
//! 51–76. Same fragility class: `result.replace("++$count", ...)`
//! would have rewritten `++$count` patterns inside string / template
//! literals too. The AST visitor descends only into expression
//! positions.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_syntax::operator::UpdateOperator;

thread_local! {
    static MODULE_STORE_UPDATE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$count++` / `$count--` / `++$count` /
/// `--$count` for the bindings listed in `store_sub_vars`. The
/// underlying store-binding classification (prop / reactive state /
/// regular) comes from the three other slices, matching the text
/// version in `transform_store_assignments_client`.
///
/// Returns `None` if there's nothing to rewrite (no `$<store>` in
/// source, no UpdateExpression matched, or parse failure).
pub fn transform_store_update_ast(
    source: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> Option<String> {
    if store_sub_vars.is_empty() {
        return None;
    }
    // Fast probe — if none of the $-prefixed names appear at all, bail.
    if !store_sub_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    MODULE_STORE_UPDATE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = StoreUpdateCollector {
            store_sub_vars,
            prop_vars,
            state_vars,
            non_reactive_state_vars,
            replacements: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        // Spans don't overlap (each is a distinct UpdateExpression).
        replacements.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end, rewrite) in &replacements {
            out.replace_range(*start as usize..*end as usize, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct StoreUpdateCollector<'a> {
    store_sub_vars: &'a [String],
    prop_vars: &'a [String],
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'ast> Visit<'ast> for StoreUpdateCollector<'a> {
    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        // SimpleAssignmentTarget::AssignmentTargetIdentifier carries
        // the bare-identifier case (`$count++`, `++$count`). Anything
        // else (member, computed) isn't this pass's concern.
        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        if !self.store_sub_vars.iter().any(|s| s == name) {
            return;
        }

        // Strip the leading `$` to get the underlying store name.
        let store_sub = name; // `"$count"`
        let store_name = &name[1..]; // `"count"`

        let store_access = if self.prop_vars.iter().any(|p| p == store_name) {
            format!("{}()", store_name)
        } else if self.state_vars.iter().any(|s| s == store_name)
            && !self.non_reactive_state_vars.iter().any(|s| s == store_name)
        {
            format!("$.get({})", store_name)
        } else {
            store_name.to_string()
        };

        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, true) => {
                format!("$.update_pre_store({}, {}())", store_access, store_sub)
            }
            (UpdateOperator::Decrement, true) => {
                format!("$.update_pre_store({}, {}(), -1)", store_access, store_sub)
            }
            (UpdateOperator::Increment, false) => {
                format!("$.update_store({}, {}())", store_access, store_sub)
            }
            (UpdateOperator::Decrement, false) => {
                format!("$.update_store({}, {}(), -1)", store_access, store_sub)
            }
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
    fn prefix_inc_regular() {
        let out =
            transform_store_update_ast("++$count;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.update_pre_store(count, $count());");
    }

    #[test]
    fn prefix_dec_regular() {
        let out =
            transform_store_update_ast("--$count;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.update_pre_store(count, $count(), -1);");
    }

    #[test]
    fn postfix_inc_regular() {
        let out =
            transform_store_update_ast("$count++;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.update_store(count, $count());");
    }

    #[test]
    fn postfix_dec_regular() {
        let out =
            transform_store_update_ast("$count--;", &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.update_store(count, $count(), -1);");
    }

    #[test]
    fn prop_access_pattern() {
        let out =
            transform_store_update_ast("++$count;", &ssv(&["$count"]), &ssv(&["count"]), &[], &[])
                .unwrap();
        assert_eq!(out, "$.update_pre_store(count(), $count());");
    }

    #[test]
    fn state_access_pattern() {
        let out =
            transform_store_update_ast("++$count;", &ssv(&["$count"]), &[], &ssv(&["count"]), &[])
                .unwrap();
        assert_eq!(out, "$.update_pre_store($.get(count), $count());");
    }

    #[test]
    fn non_reactive_state_falls_back_to_regular() {
        // state but flagged non-reactive → regular access pattern
        let out = transform_store_update_ast(
            "++$count;",
            &ssv(&["$count"]),
            &[],
            &ssv(&["count"]),
            &ssv(&["count"]),
        )
        .unwrap();
        assert_eq!(out, "$.update_pre_store(count, $count());");
    }

    #[test]
    fn leaves_non_store_update_alone() {
        // `count++` where count is not in store_sub_vars
        assert!(transform_store_update_ast("count++;", &ssv(&["$count"]), &[], &[], &[]).is_none());
    }

    #[test]
    fn leaves_member_update_alone() {
        // `$store.prop++` is a separate pass (`$.store_mutate`),
        // not handled here.
        assert!(
            transform_store_update_ast("$count.prop++;", &ssv(&["$count"]), &[], &[], &[])
                .is_none()
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "++$count";"#;
        assert!(transform_store_update_ast(src, &ssv(&["$count"]), &[], &[], &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$count++}`;";
        let out = transform_store_update_ast(src, &ssv(&["$count"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "let s = `${$.update_store(count, $count())}`;");
    }

    #[test]
    fn multiple_stores_in_one_source() {
        let out =
            transform_store_update_ast("$a++; $b--;", &ssv(&["$a", "$b"]), &[], &[], &[]).unwrap();
        assert_eq!(out, "$.update_store(a, $a()); $.update_store(b, $b(), -1);");
    }

    #[test]
    fn empty_store_subs_is_no_op() {
        assert!(transform_store_update_ast("$count++;", &[], &[], &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_store_update_ast("$count++ + (", &ssv(&["$count"]), &[], &[], &[]).is_none()
        );
    }

    #[test]
    fn no_op_without_prefix_dollar() {
        assert!(
            transform_store_update_ast("let x = 1;", &ssv(&["$count"]), &[], &[], &[]).is_none()
        );
    }
}
