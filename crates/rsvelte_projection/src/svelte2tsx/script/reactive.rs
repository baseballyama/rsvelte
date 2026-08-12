//! Reactive statement (`$:`) rewriting.

use std::collections::HashSet;
use std::fmt::Write as _;

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;

use super::ast_utils::extract_names_from_assignment_target;

use super::super::magic_string::MagicString;

/// True if a reactive assignment's LHS qualifies for the
/// `__sveltets_2_invalidate(() => …)` RHS wrap — i.e. it is a plain Identifier,
/// an object destructuring target, or an array destructuring target. Mirrors
/// official `isAssignmentBinaryExpr`'s `isIdentifier(left) ||
/// isObjectLiteralExpression(left) || isArrayLiteralExpression(left)`. A
/// member-expression target (`foo.bar`) does NOT qualify.
const fn is_invalidate_assignment_target(target: &oxc::AssignmentTarget) -> bool {
    matches!(
        target,
        oxc::AssignmentTarget::AssignmentTargetIdentifier(_)
            | oxc::AssignmentTarget::ObjectAssignmentTarget(_)
            | oxc::AssignmentTarget::ArrayAssignmentTarget(_)
    )
}

/// Handle a reactive labeled statement (`$: ...`).
///
/// Transforms reactive declarations and statements according to svelte2tsx conventions:
///
/// - `$: x = expr` (new variable) → `let  x = __sveltets_2_invalidate(() => expr)`
/// - `$: x = expr` (existing var) → `$: x = __sveltets_2_invalidate(() => expr)`
/// - `$: $store = expr` (store) → `$: $store = __sveltets_2_invalidate(() => expr)`
/// - `$: ({ a } = expr)` (destructure, new) → `let  { a } = __sveltets_2_invalidate(() => expr)`
/// - `$: ({ a } = expr)` (destructure, existing) → `$: ({ a } = __sveltets_2_invalidate(() => expr))`
/// - `$: { ... }` (block) → `;() => {$: { ... }}`
/// - `$: expr` (expression) → `;() => {$: expr}`
pub(super) fn handle_reactive_statement(
    labeled: &oxc::LabeledStatement,
    offset: u32,
    str: &mut MagicString<'_>,
    raw_content: &str,
    declared_names: &HashSet<String>,
    reactive_declared_names: &mut HashSet<String>,
) {
    let label_start = labeled.span.start + offset;
    let label_end = labeled.span.end + offset;

    match &labeled.body {
        oxc::Statement::ExpressionStatement(expr_stmt) => {
            // Check for assignment expression
            let expr = match &expr_stmt.expression {
                oxc::Expression::ParenthesizedExpression(paren) => &paren.expression,
                other => other,
            };

            // Official only applies the `__sveltets_2_invalidate(() => …)` RHS
            // wrap when the labeled statement is a plain `=` assignment whose
            // LHS is an Identifier / object pattern / array pattern
            // (`isAssignmentBinaryExpr` in `utils/tsAst.ts`). Member-expression
            // LHS (`$: foo.bar = …`) and compound operators (`$: x *= 2`) do
            // NOT qualify — those are wrapped whole in `;() => {$: …}` like any
            // other reactive statement (`handleReactiveStatement`'s else branch).
            let qualifies_for_invalidate = matches!(
                expr,
                oxc::Expression::AssignmentExpression(assign)
                    if matches!(assign.operator, oxc::AssignmentOperator::Assign)
                        && is_invalidate_assignment_target(&assign.left)
            );

            if let oxc::Expression::AssignmentExpression(assign) = expr
                && qualifies_for_invalidate
            {
                {
                    // Get the LHS names
                    let lhs_names = extract_names_from_assignment_target(&assign.left);

                    // Check if the LHS is a $store reference
                    let is_store_assignment = is_store_assignment(&assign.left);

                    // Mirrors `nodes/ImplicitTopLevelNames.ts::modifyCode`:
                    //   - all LHS names are NEW → replace `$:` with `let `,
                    //     drop the parens.
                    //   - some are declared, some are new → prepend
                    //     `let <new>;\n` BEFORE the `$:` line, keep `$:` form.
                    //   - all already declared → keep `$:` form unchanged.
                    //
                    // The "declared" check uses `rootScope.declared` only
                    // (i.e. real `let`/`const` declarations), NOT names
                    // already declared via earlier reactive statements —
                    // matching the JS reference's `rootVariables` parameter.
                    let new_names: Vec<String> = lhs_names
                        .iter()
                        .filter(|n| !declared_names.contains(*n))
                        .cloned()
                        .collect();
                    let all_new = !lhs_names.is_empty() && new_names.len() == lhs_names.len();

                    let is_new_declaration =
                        !is_store_assignment && all_new && !lhs_names.is_empty();
                    let is_partial_new = !is_store_assignment && !all_new && !new_names.is_empty();

                    // Get the RHS text from the raw content
                    let rhs_start = assign.right.span().start;
                    let rhs_end = assign.right.span().end;
                    let rhs_text = &raw_content[rhs_start as usize..rhs_end as usize];

                    // Check if RHS starts with `{` (object literal needs wrapping in parens)
                    let wrapped_rhs = invalidate_rhs(rhs_text);

                    // Overwrite the RHS
                    let rhs_abs_start = rhs_start + offset;
                    let rhs_abs_end = rhs_end + offset;
                    str.overwrite(rhs_abs_start, rhs_abs_end, &wrapped_rhs);

                    if is_partial_new {
                        // For each new name, declare `let <name>;\n` before the
                        // `$:` line — JS reference uses `prependRight` at
                        // `node.label.getStart()`. The `$:` form is kept so
                        // the assignment still triggers reactivity.
                        let mut decls = String::new();
                        for name in &new_names {
                            let _ = writeln!(decls, "let {name};");
                        }
                        str.prepend_right(label_start, &decls);
                        for name in &new_names {
                            reactive_declared_names.insert(name.clone());
                        }
                    }

                    if is_new_declaration {
                        // Replace `$:` with `let ` (and handle parenthesized expressions)
                        // The extra space in "let " matches the JS svelte2tsx behavior where
                        // `$:` (2 chars) → `let` (3 chars) produces `let  b` in the output
                        // because the space after `:` is preserved.
                        let label_colon_end = labeled.label.span.end + 1; // Skip the ':'
                        let label_colon_abs = label_colon_end + offset;

                        // Check if this is a parenthesized expression like `$: ({ a } = expr)`
                        let is_paren = matches!(
                            &expr_stmt.expression,
                            oxc::Expression::ParenthesizedExpression(_)
                        );

                        str.overwrite(label_start, label_colon_abs, "let ");
                        if is_paren {
                            // `$: ({ a } = expr)` → `let  { a } = __sveltets_2_invalidate(() => expr)`
                            // Replace `$:` with `let ` (extra space so the original space
                            // after `:` produces the double-space matching JS svelte2tsx).
                            // Remove the opening `(` and the closing `)` and `;`
                            let oxc::Expression::ParenthesizedExpression(paren_expr) =
                                &expr_stmt.expression
                            else {
                                unreachable!();
                            };
                            let paren_start = paren_expr.span.start + offset;
                            let paren_end = paren_expr.span.end + offset;
                            // The `(` is at paren_start, the `)` is at paren_end-1
                            str.overwrite(paren_start, paren_start + 1, "");
                            // Remove only `)`, keep any trailing `;`
                            str.overwrite(paren_end - 1, paren_end, "");
                        } else {
                            // `$: x = expr` → `let  x = __sveltets_2_invalidate(() => expr)`
                            // Replace `$:` with `let ` to produce double-space before identifier
                            str.overwrite(label_start, label_colon_abs, "let ");
                        }

                        // Track newly declared names
                        for name in &lhs_names {
                            reactive_declared_names.insert(name.clone());
                        }
                    }
                    // else: keep `$:` as-is, RHS is already wrapped
                }
            } else {
                // Non-qualifying reactive statement — a non-assignment
                // expression (`$: console.log(x)`), a member-LHS assignment
                // (`$: foo.bar = x`), or a compound operator (`$: x *= 2`).
                // All are wrapped whole: `;() => {$: …}`.
                let label_colon_end = labeled.label.span.end + 1;
                let label_colon_abs = label_colon_end + offset;
                str.overwrite(label_start, label_colon_abs, ";() => {$:");
                str.append_left(label_end, "}");
            }
        }
        oxc::Statement::BlockStatement(_) => {
            // Block: `$: { ... }` → `;() => {$: { ... }}`
            let label_colon_end = labeled.label.span.end + 1;
            let label_colon_abs = label_colon_end + offset;
            str.overwrite(label_start, label_colon_abs, ";() => {$:");
            str.append_left(label_end, "}");
        }
        oxc::Statement::IfStatement(_) => {
            // `$: if (...) { ... }` → `;() => {$: if (...) { ... }}`
            let label_colon_end = labeled.label.span.end + 1;
            let label_colon_abs = label_colon_end + offset;
            str.overwrite(label_start, label_colon_abs, ";() => {$:");
            str.append_left(label_end, "}");
        }
        _ => {
            // Other statements: wrap similarly
            let label_colon_end = labeled.label.span.end + 1;
            let label_colon_abs = label_colon_end + offset;
            str.overwrite(label_start, label_colon_abs, ";() => {$:");
            str.append_left(label_end, "}");
        }
    }
}

fn is_store_assignment(target: &oxc::AssignmentTarget) -> bool {
    matches!(target, oxc::AssignmentTarget::AssignmentTargetIdentifier(id) if id.name.starts_with('$'))
}

fn invalidate_rhs(rhs: &str) -> String {
    if rhs.starts_with('{') {
        format!("__sveltets_2_invalidate(() => ({rhs}))")
    } else {
        format!("__sveltets_2_invalidate(() => {rhs})")
    }
}

/// Extract variable names from the body of a labeled statement (`$: name = ...`).
///
/// Handles:
/// - `$: store = value` (simple assignment)
/// - `$: ({ store1, noStore } = value)` (destructuring assignment)
/// - `$: [ store2, noStore ] = value` (array destructuring)
pub(super) fn extract_names_from_labeled_body(body: &oxc::Statement) -> Vec<String> {
    match body {
        oxc::Statement::ExpressionStatement(expr_stmt) => {
            // Check for parenthesized expression: `$: (expr)`
            let expr = match &expr_stmt.expression {
                oxc::Expression::ParenthesizedExpression(paren) => &paren.expression,
                other => other,
            };
            if let oxc::Expression::AssignmentExpression(assign) = expr {
                return extract_names_from_assignment_target(&assign.left);
            }
            Vec::new()
        }
        _ => Vec::new(),
    }
}
