//! AST-based rewrite of prop-variable member-expression
//! assignments.
//!
//! Replaces the member-mutation branch in
//! `state_transforms.rs::transform_prop_assignments`
//! (lines 2501+ — `if !non_bindable_prop_vars.contains(var) { ... }`).
//!
//! Only **bindable** props get this wrap — non-bindable props
//! (kind === 'prop') just get read transforms applied elsewhere.
//! The text version's `if !non_bindable_prop_vars.contains(var)`
//! guard becomes a single early-return in the visitor.
//!
//! Mappings (preserved exactly):
//!
//! | Source                | Replacement                                |
//! |-----------------------|--------------------------------------------|
//! | `prop.foo = x`        | `prop(prop().foo = x, true)`               |
//! | `prop().foo = x`      | `prop(prop().foo = x, true)` (idempotent)  |
//! | `prop.a.b = x`        | `prop(prop().a.b = x, true)`               |
//! | `prop[i] = x`         | `prop(prop()[i] = x, true)`                |
//! | `prop.foo += x`       | `prop(prop().foo += x, true)`              |
//! | `prop.foo ??= x`      | `prop(prop().foo ??= x, true)`             |
//!
//! Both `prop.foo` (bare Identifier root) and `prop().foo`
//! (CallExpression root with no args) collapse to the same output.
//!
//! What the AST drops on the floor:
//!
//! - The text version's hand-rolled string-literal / template
//!   state tracker, depth scanner, and operator detector
//!   (~250 lines).
//! - The `!= == != => <= >=` exclusions — `AssignmentExpression`
//!   only matches `=`-family operators.
//! - The `prop({rest}().` already-wrapped check — once wrapped,
//!   the LHS root is the outer CallExpression call's first arg,
//!   not a bare `prop` identifier or `prop()` call — wait, it
//!   actually IS still a CallExpression with callee=prop. The
//!   "Skip if already wrapped" comes via fixed-point exhaustion:
//!   after wrap, the outer `prop(...)` is a CallExpression, not
//!   an AssignmentExpression — its inner argument IS still an
//!   AssignmentExpression that matches, but the LHS member's
//!   root is `prop()` (the inner `prop()` we just generated).
//!   That `prop()` is still recognized as a prop-rooted root, so
//!   it WOULD re-wrap. We avoid that by checking whether the
//!   AssignmentExpression's parent is `prop(<assignment>, true)`
//!   — i.e. the immediate enclosing CallExpression has callee
//!   = same prop identifier and the assignment is the first arg
//!   with `true` as the second arg.
//!
//! Fixed-point still applies for genuinely nested assignments
//! across different props.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_span::Span;

thread_local! {
    static MODULE_PROP_MEMBER_MUTATE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `prop.foo = x` / `prop().foo = x` etc. for
/// bindable prop variables (skipping `non_bindable_prop_vars`).
/// Returns `None` when there's nothing to rewrite or the source
/// fails to parse.
pub fn transform_prop_member_mutate_ast(
    source: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
) -> Option<String> {
    if prop_vars.is_empty() {
        return None;
    }
    memchr::memchr(b'=', source.as_bytes())?;
    if !prop_vars
        .iter()
        .filter(|p| !non_bindable_prop_vars.iter().any(|nb| nb == *p))
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, prop_vars, non_bindable_prop_vars) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }

    if any_changed { Some(current) } else { None }
}

fn single_pass(
    source: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
) -> Option<String> {
    MODULE_PROP_MEMBER_MUTATE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = PropMemberMutateCollector {
            source,
            prop_vars,
            non_bindable_prop_vars,
            replacements: Vec::new(),
            skip_assignment_spans: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let spans: Vec<(u32, u32)> = replacements.iter().map(|r| (r.0, r.1)).collect();
        replacements.retain(|(s, e, _)| {
            !spans
                .iter()
                .any(|(s2, e2)| (*s2 > *s && *e2 <= *e) || (*s2 >= *s && *e2 < *e))
        });

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        replacements.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end, rewrite) in &replacements {
            out.replace_range(*start as usize..*end as usize, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

#[derive(Clone, Copy)]
enum Root {
    /// `prop.x = ...` — root is bare Identifier `prop`
    Direct(Span),
    /// `prop().x = ...` — root is CallExpression `prop()` with the
    /// callee Identifier. The `Span` is the full `prop()` span so
    /// we can replace it cleanly with the regenerated `prop()`.
    Call(Span),
}

impl Root {
    fn span(self) -> Span {
        match self {
            Root::Direct(s) | Root::Call(s) => s,
        }
    }
}

struct PropMemberMutateCollector<'a> {
    source: &'a str,
    prop_vars: &'a [String],
    non_bindable_prop_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
    /// Spans of `AssignmentExpression`s that are the first arg of a
    /// `prop(<assignment>, true)` wrap call. Skipping these is what
    /// makes the rewrite idempotent for the `prop().foo = x` case,
    /// where the inner assignment's LHS is already `prop()`-rooted.
    skip_assignment_spans: Vec<(u32, u32)>,
}

impl<'a> PropMemberMutateCollector<'a> {
    /// Find the leftmost root of a member chain. Returns the
    /// identifier name and a [`Root`] tagged with the appropriate
    /// span. `None` if the root isn't a bare identifier or
    /// `name()`-style call on a bare identifier.
    fn walk_object_chain_to_root<'e>(expr: &'e Expression<'_>) -> Option<(&'e str, Root)> {
        let mut cur = expr;
        loop {
            match cur {
                Expression::Identifier(id) => {
                    return Some((id.name.as_str(), Root::Direct(id.span)));
                }
                Expression::CallExpression(call) => {
                    if !call.arguments.is_empty() {
                        return None;
                    }
                    let Expression::Identifier(id) = &call.callee else {
                        return None;
                    };
                    return Some((id.name.as_str(), Root::Call(call.span)));
                }
                Expression::StaticMemberExpression(m) => cur = &m.object,
                Expression::ComputedMemberExpression(m) => cur = &m.object,
                _ => return None,
            }
        }
    }

    fn root_of_assignment_target<'e>(target: &'e AssignmentTarget<'_>) -> Option<(&'e str, Root)> {
        let object = match target {
            AssignmentTarget::StaticMemberExpression(m) => &m.object,
            AssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }
}

impl<'a, 'ast> Visit<'ast> for PropMemberMutateCollector<'a> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Detect the wrap shape `prop(<assignment>, true)` we emit
        // for prop member mutations. If callee is a bare Identifier
        // matching one of our prop_vars (and bindable), arg[0] is an
        // AssignmentExpression, and arg[1] is `true`, mark arg[0] as
        // already-wrapped so visit_assignment_expression skips it.
        if call.arguments.len() == 2
            && let Expression::Identifier(callee_id) = &call.callee
            && self.prop_vars.iter().any(|p| p == callee_id.name.as_str())
            && !self
                .non_bindable_prop_vars
                .iter()
                .any(|nb| nb == callee_id.name.as_str())
            && let Argument::BooleanLiteral(b) = &call.arguments[1]
            && b.value
            && let Argument::AssignmentExpression(inner) = &call.arguments[0]
        {
            self.skip_assignment_spans
                .push((inner.span.start, inner.span.end));
        }

        walk::walk_call_expression(self, call);
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        if self
            .skip_assignment_spans
            .iter()
            .any(|(s, e)| *s == expr.span.start && *e == expr.span.end)
        {
            return;
        }

        let Some((root_name, root)) = Self::root_of_assignment_target(&expr.left) else {
            return;
        };
        if !self.prop_vars.iter().any(|p| p == root_name) {
            return;
        }
        if self.non_bindable_prop_vars.iter().any(|nb| nb == root_name) {
            return;
        }

        let root_span = root.span();
        let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];

        // Extract "rest" — the member chain after the root, plus
        // the operator and RHS, all in source order. We slice from
        // the root's end through the assignment's end. That gives
        // `<rest_chain> <op> <rhs>` where `<rest_chain>` is the
        // post-root LHS member chain (`.foo[0].bar`, etc.) plus
        // whitespace, all as it appears in the source.
        let local_rest_start = (root_span.end - expr.span.start) as usize;
        let rest_and_assignment = &outer_text[local_rest_start..];

        // Build the wrapped mutation: `prop(prop()<rest_and_assignment>, true)`
        let rewrite = format!(
            "{}({}(){}, true)",
            root_name, root_name, rest_and_assignment
        );

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
    fn static_member_assignment() {
        let out = transform_prop_member_mutate_ast("prop.foo = 5;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop().foo = 5, true);");
    }

    #[test]
    fn call_then_static_member_assignment_is_idempotent_shape() {
        let out =
            transform_prop_member_mutate_ast("prop().foo = 5;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop().foo = 5, true);");
    }

    #[test]
    fn computed_member_assignment() {
        let out = transform_prop_member_mutate_ast("prop[0] = 5;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop()[0] = 5, true);");
    }

    #[test]
    fn compound_addition() {
        let out = transform_prop_member_mutate_ast("prop.foo += 3;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop().foo += 3, true);");
    }

    #[test]
    fn compound_nullish() {
        let out =
            transform_prop_member_mutate_ast("prop.foo ??= 5;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop().foo ??= 5, true);");
    }

    #[test]
    fn chained_member_chain() {
        let out =
            transform_prop_member_mutate_ast("prop.a.b.c = 5;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop().a.b.c = 5, true);");
    }

    #[test]
    fn mixed_static_and_computed() {
        let out =
            transform_prop_member_mutate_ast("prop.items[0] = x;", &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "prop(prop().items[0] = x, true);");
    }

    #[test]
    fn non_bindable_prop_left_alone() {
        // prop is in prop_vars but flagged non-bindable → no rewrite
        assert!(
            transform_prop_member_mutate_ast("prop.foo = 5;", &ssv(&["prop"]), &ssv(&["prop"]))
                .is_none()
        );
    }

    #[test]
    fn non_prop_member_left_alone() {
        assert!(transform_prop_member_mutate_ast("obj.foo = 5;", &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn bare_prop_assignment_left_alone() {
        // `prop = 5` is handled by prop_assign_ast (PR #198)
        assert!(transform_prop_member_mutate_ast("prop = 5;", &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn update_expression_left_alone() {
        // `prop.x++` is NOT this pass's concern.
        assert!(transform_prop_member_mutate_ast("prop.x++;", &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "prop.foo = 5";"#;
        assert!(transform_prop_member_mutate_ast(src, &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${prop.foo = 5}`;";
        let out = transform_prop_member_mutate_ast(src, &ssv(&["prop"]), &[]).unwrap();
        assert_eq!(out, "let s = `${prop(prop().foo = 5, true)}`;");
    }

    #[test]
    fn multiple_props_in_one_source() {
        let out =
            transform_prop_member_mutate_ast("a.x = 1; b.y = 2;", &ssv(&["a", "b"]), &[]).unwrap();
        assert_eq!(out, "a(a().x = 1, true); b(b().y = 2, true);");
    }

    #[test]
    fn arrow_function_rhs_not_misclassified_as_eq() {
        // The text version had to specifically skip `=>` (arrow). The
        // AST naturally separates `=` (AssignmentExpression) from `=>`
        // (ArrowFunctionExpression).
        let out = transform_prop_member_mutate_ast("prop.cb = (x) => x + 1;", &ssv(&["prop"]), &[])
            .unwrap();
        assert_eq!(out, "prop(prop().cb = (x) => x + 1, true);");
    }

    #[test]
    fn function_call_on_member_is_not_a_mutation() {
        // `prop.foo()` is a CallExpression, not a mutation.
        assert!(transform_prop_member_mutate_ast("prop.foo();", &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn empty_prop_vars_is_no_op() {
        assert!(transform_prop_member_mutate_ast("prop.foo = 5;", &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_prop_member_mutate_ast("prop.foo = (", &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn no_op_without_equals() {
        assert!(transform_prop_member_mutate_ast("foo(prop);", &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn already_wrapped_is_idempotent() {
        // Once wrapped, the visitor's CallExpression detection
        // recognises the `prop(<assignment>, true)` shape and skips
        // the inner AssignmentExpression — fixed-point exits cleanly.
        let already = "prop(prop().foo = 5, true);";
        assert!(transform_prop_member_mutate_ast(already, &ssv(&["prop"]), &[]).is_none());
    }

    #[test]
    fn double_application_is_stable() {
        // Apply to the same source twice; the second call should
        // be a no-op (returns None).
        let first =
            transform_prop_member_mutate_ast("prop.foo = 5;", &ssv(&["prop"]), &[]).unwrap();
        let second = transform_prop_member_mutate_ast(&first, &ssv(&["prop"]), &[]);
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn parenthesized_assignment_in_call_arg() {
        // mutation-correct-return-value fixture: `console.log((a.b = true));`
        // The inner assignment is wrapped in parens. Verify output
        // matches the text version exactly.
        let src = "console.log((a.b = true));";
        let out = transform_prop_member_mutate_ast(src, &ssv(&["a"]), &[]).unwrap();
        assert_eq!(out, "console.log((a(a().b = true, true)));");
    }

    #[test]
    fn fast_path_all_props_non_bindable() {
        // If every prop_var is in non_bindable_prop_vars, the
        // fast-path probe bails before parsing.
        assert!(
            transform_prop_member_mutate_ast(
                "prop.foo = 5;",
                &ssv(&["prop", "other"]),
                &ssv(&["prop", "other"])
            )
            .is_none()
        );
    }
}
