//! Combined AST pass for state-var assignments — simple
//! (`x = expr`), compound (`x += expr` / `x ||= expr` / …), and
//! update (`x++`, `--x`). Replaces three previously-separate
//! helpers with a single visitor + a single fixed-point loop.
//!
//! Previously, each operator family had its own helper:
//! `state_simple_assigns_ast`, `state_compound_assigns_ast`,
//! `state_update_assigns_ast`. Each one did its own
//! parse + `SemanticBuilder::build` + visitor walk + fixed-point
//! (up to 16 iterations). For state-var-heavy scripts that
//! amounted to up to ~48 parse cycles per script just for these
//! three concerns.
//!
//! This module merges all three into one visitor sharing a single
//! Semantic per fixed-point iteration. The original three helpers
//! are kept as thin wrappers so their unit-test coverage stays
//! intact.
//!
//! ## Mapping (preserved exactly)
//!
//! | Source              | Replacement                                |
//! |---------------------|--------------------------------------------|
//! | `x = expr`          | `$.set(x, expr)` (or `…, true)` in runes + proxy) |
//! | `x += expr`         | `$.set(x, $.get(x) + expr)`                |
//! | `x -= expr`         | `$.set(x, $.get(x) - expr)`                |
//! | `x *= expr`         | `$.set(x, $.get(x) * expr)`                |
//! | `x /= expr`         | `$.set(x, $.get(x) / expr)`                |
//! | `x %= expr`         | `$.set(x, $.get(x) % expr)`                |
//! | `x **= expr`        | `$.set(x, $.get(x) ** expr)`               |
//! | `x ??= expr`        | `$.set(x, $.get(x) ?? expr)`               |
//! | `x &&= expr`        | `$.set(x, $.get(x) && expr)`               |
//! | `x \|\|= expr`        | `$.set(x, $.get(x) \|\| expr)`               |
//! | `x++`               | `$.update(x)`                              |
//! | `x--`               | `$.update(x, -1)`                          |
//! | `++x`               | `$.update_pre(x)`                          |
//! | `--x`               | `$.update_pre(x, -1)`                      |
//!
//! Shadow detection uses `find_state_var_symbols` +
//! `is_state_var_reference_or_unresolved` from `scope_analysis` —
//! function params / for-loop vars / nested-let shadows resolve
//! to different SymbolIds and are skipped.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::{GetSpan, SourceType, Span};
use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};
use oxc_syntax::symbol::SymbolId;

use crate::compiler::phases::phase3_transform::shared::js_scan::contains_identifier;
use rustc_hash::FxHashSet;

use super::ast_rewrite::{self, Edit};
use super::expression_utils::{
    expression_needs_proxy_with_scope, needs_compound_assignment_parens,
};
use super::scope_analysis::{find_state_var_symbols, is_state_var_reference_or_unresolved};

thread_local! {
    static STATE_ASSIGNS_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Run the combined simple + compound + update assignment pass on
/// `source`. Returns `Some(rewritten)` if anything changed, `None`
/// otherwise. Internal fixed-point handles nested assignments
/// (e.g. `outer = (inner = 1)`).
pub fn transform_state_assigns_ast(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> Option<String> {
    let spliced = || {
        transform_state_assigns_spliced(
            source,
            state_vars,
            raw_state_vars,
            is_runes,
            non_proxy_vars,
        )
    };
    ast_rewrite::dual_run::resolve(
        "state_assigns_combined_ast:inplace",
        source,
        spliced,
        || {
            transform_state_assigns_in_place(
                source,
                state_vars,
                raw_state_vars,
                is_runes,
                non_proxy_vars,
            )
        },
    )
}

/// The three probes are pure cost avoidance: no state variable named in
/// `state_vars` can be assigned without its name appearing in `source` as a
/// whole identifier token and an assignment token appearing too.
fn has_candidate(source: &str, state_vars: &[String]) -> bool {
    if state_vars.is_empty() {
        return false;
    }
    if !state_vars.iter().any(|v| contains_identifier(source, v)) {
        return false;
    }
    // Cheapest probe — at least one `=` or `++`/`--` token.
    memchr::memchr(b'=', source.as_bytes()).is_some()
        || memchr::memmem::find(source.as_bytes(), b"++").is_some()
        || memchr::memmem::find(source.as_bytes(), b"--").is_some()
}

fn transform_state_assigns_spliced(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> Option<String> {
    if !has_candidate(source, state_vars) {
        return None;
    }

    ast_rewrite::fixed_point_while_deferred(source, |src| {
        single_pass(src, state_vars, raw_state_vars, is_runes, non_proxy_vars)
    })
}

fn single_pass(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> Option<(String, bool)> {
    ast_rewrite::with_program(
        &STATE_ASSIGNS_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| {
            let semantic_ret = super::super::profile::semantic_build(
                super::super::profile::SEM_STATE_ASSIGNS,
                program.source_text.len(),
                || SemanticBuilder::new().with_build_nodes(true).build(program),
            );
            let semantic = &semantic_ret.semantic;
            let state_var_symbols = find_state_var_symbols(semantic, state_vars);

            let mut collector = CombinedCollector {
                source,
                semantic,
                state_vars,
                raw_state_vars,
                is_runes,
                non_proxy_vars,
                state_var_symbols,
                replacements: Vec::new(),
            };
            collector.visit_program(program);

            ast_rewrite::splice_with_deferred(source, collector.replacements, true)
        },
    )
}

/// The compound operators this pass rewrites, paired with the exact spelling
/// the text form emits. Bitwise and shift compounds (`&=`, `<<=`, …) are
/// deliberately absent — the text predecessor's allowlist stops here.
fn compound_operator(op: AssignmentOperator) -> Option<(&'static str, CompoundOp)> {
    Some(match op {
        AssignmentOperator::Addition => ("+", CompoundOp::Binary(BinaryOperator::Addition)),
        AssignmentOperator::Subtraction => ("-", CompoundOp::Binary(BinaryOperator::Subtraction)),
        AssignmentOperator::Multiplication => {
            ("*", CompoundOp::Binary(BinaryOperator::Multiplication))
        }
        AssignmentOperator::Division => ("/", CompoundOp::Binary(BinaryOperator::Division)),
        AssignmentOperator::Remainder => ("%", CompoundOp::Binary(BinaryOperator::Remainder)),
        AssignmentOperator::Exponential => ("**", CompoundOp::Binary(BinaryOperator::Exponential)),
        AssignmentOperator::LogicalNullish => {
            ("??", CompoundOp::Logical(LogicalOperator::Coalesce))
        }
        AssignmentOperator::LogicalAnd => ("&&", CompoundOp::Logical(LogicalOperator::And)),
        AssignmentOperator::LogicalOr => ("||", CompoundOp::Logical(LogicalOperator::Or)),
        _ => return None,
    })
}

#[derive(Clone, Copy)]
enum CompoundOp {
    Binary(BinaryOperator),
    Logical(LogicalOperator),
}

/// Shared eligibility test, so the in-place finder can never disagree with the
/// splice collector about which targets belong to this pass.
fn is_rewritable_target(
    semantic: &Semantic,
    id: &IdentifierReference,
    state_vars: &[String],
    state_var_symbols: &FxHashSet<SymbolId>,
) -> bool {
    state_vars.iter().any(|s| s.as_str() == id.name.as_str())
        && is_state_var_reference_or_unresolved(semantic, id, state_var_symbols, state_vars)
}

struct CombinedCollector<'a, 'sem> {
    source: &'a str,
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    raw_state_vars: &'a [String],
    is_runes: bool,
    non_proxy_vars: &'a [String],
    state_var_symbols: FxHashSet<SymbolId>,
    replacements: Vec<Edit>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for CombinedCollector<'a, 'sem> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !is_rewritable_target(self.semantic, id, self.state_vars, &self.state_var_symbols) {
            return;
        }

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        match expr.operator {
            AssignmentOperator::Assign => {
                // Simple assignment.
                let is_raw_state = self.raw_state_vars.iter().any(|s| s.as_str() == name);
                // A bare-identifier RHS declared inside this statement resolves
                // per-site (upstream should_proxy consults the scope at the
                // assignment); the name-list fallback cannot distinguish two
                // same-named inner bindings with different proxy-ness.
                let site_decision = match expr.right.get_inner_expression() {
                    Expression::Identifier(rhs_id) => ident_rhs_needs_proxy(self.semantic, rhs_id),
                    _ => None,
                };
                let needs_proxy = self.is_runes
                    && !is_raw_state
                    && site_decision.unwrap_or_else(|| {
                        expression_needs_proxy_with_scope(rhs_text.trim(), self.non_proxy_vars)
                    });
                let rewrite = if needs_proxy {
                    format!("$.set({}, {}, true)", name, rhs_text)
                } else {
                    format!("$.set({}, {})", name, rhs_text)
                };
                self.replacements
                    .push((expr.span.start, expr.span.end, rewrite));
            }
            op => {
                let Some((op_str, _)) = compound_operator(op) else {
                    return;
                };
                let rhs_trimmed = rhs_text.trim();
                let rhs_for_output = if needs_compound_assignment_parens(rhs_trimmed, op_str) {
                    format!("({})", rhs_trimmed)
                } else {
                    rhs_trimmed.to_string()
                };
                let rewrite = format!(
                    "$.set({}, $.get({}) {} {})",
                    name, name, op_str, rhs_for_output
                );
                self.replacements
                    .push((expr.span.start, expr.span.end, rewrite));
            }
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        if !is_rewritable_target(self.semantic, id, self.state_vars, &self.state_var_symbols) {
            return;
        }

        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", name),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", name),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", name),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", name),
        };
        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }
}

/// Mirror upstream `should_proxy(Identifier, scope)` for a bare-identifier
/// RHS that resolves to a declaration inside the parsed statement: a
/// non-reassigned `VariableDeclarator` whose init is one of the non-proxy
/// node types is not proxied; a parameter, reassigned binding, or
/// initializer-less/other declaration falls through to proxy (upstream's
/// `return true`). Returns `None` when the identifier does not resolve
/// within this statement (declared at script level) so the caller can use
/// the name-list fallback.
pub(super) fn ident_rhs_needs_proxy(
    semantic: &Semantic,
    ident: &IdentifierReference,
) -> Option<bool> {
    use oxc_ast::AstKind;

    if ident.name == "undefined" {
        return Some(false);
    }
    let reference_id = ident.reference_id.get()?;
    let scoping = semantic.scoping();
    let symbol_id = scoping.get_reference(reference_id).symbol_id()?;

    // Only decide for function-local declarations — the gap the name list
    // cannot express. Root-scope (script top-level) bindings keep the
    // name-list decision, which already accounts for binding kinds and
    // partially-transformed prop declarations.
    if scoping.symbol_scope_id(symbol_id) == scoping.root_scope_id() {
        return None;
    }

    let decl_id = scoping.symbol_declaration(symbol_id);
    let AstKind::VariableDeclarator(decl) = semantic.nodes().get_node(decl_id).kind() else {
        return Some(true);
    };
    let reassigned = scoping
        .get_resolved_references(symbol_id)
        .any(|r| r.is_write());
    if reassigned {
        return Some(true);
    }
    let Some(init) = &decl.init else {
        return Some(true);
    };
    let non_proxy = match init.get_inner_expression() {
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::TemplateLiteral(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_) => true,
        Expression::Identifier(id) => id.name == "undefined",
        _ => false,
    };
    Some(!non_proxy)
}

thread_local! {
    static STATE_ASSIGNS_IN_PLACE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_state_assigns_ast`].
///
/// The splice form needs a fixed point because `splice_with_deferred` drops
/// any edit whose span strictly contains another, so `outer = (inner = 1)`
/// takes one iteration per nesting level and each iteration re-parses the
/// already-rewritten text. Mutating the tree post-order collapses that to a
/// single parse: a nested assignment is replaced before the one enclosing it.
///
/// What the extra iterations also did, though, was feed each enclosing site
/// the *rewritten* text of its right-hand side, and two decisions here are
/// taken from that text — `expression_needs_proxy_with_scope` and
/// `needs_compound_assignment_parens`. So the finder keeps a ledger of what
/// each rewritten site would have printed and reconstructs the enclosing
/// site's right-hand side from it, rather than reading the untouched source.
///
/// One accepted divergence: the splice form gives up after
/// [`ast_rewrite::MAX_FIXED_POINT_ITERS`] nesting levels, this one does not.
fn transform_state_assigns_in_place(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> ast_rewrite::Rewrite {
    if !has_candidate(source, state_vars) {
        return ast_rewrite::Rewrite::Unchanged;
    }

    ast_rewrite::with_program_mut(
        &STATE_ASSIGNS_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |allocator, program| {
            let targets = {
                let semantic_ret = super::super::profile::semantic_build(
                    super::super::profile::SEM_STATE_ASSIGNS_IN_PLACE,
                    program.source_text.len(),
                    || SemanticBuilder::new().with_build_nodes(true).build(program),
                );
                let semantic = &semantic_ret.semantic;
                let state_var_symbols = find_state_var_symbols(semantic, state_vars);

                let mut finder = StateAssignsFinder {
                    source,
                    semantic,
                    state_vars,
                    raw_state_vars,
                    is_runes,
                    non_proxy_vars,
                    state_var_symbols,
                    ledger: Vec::new(),
                    targets: Vec::new(),
                };
                finder.visit_program(program);
                finder.targets
            };
            if targets.is_empty() {
                return false;
            }

            let mut rewriter = StateAssignsRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                targets,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

#[derive(Clone, Copy)]
enum Rewrite {
    Assign { needs_proxy: bool },
    Compound(CompoundOp),
    Update { prefix: bool, decrement: bool },
}

struct StateAssignsFinder<'a, 'sem> {
    source: &'a str,
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    raw_state_vars: &'a [String],
    is_runes: bool,
    non_proxy_vars: &'a [String],
    state_var_symbols: FxHashSet<SymbolId>,
    /// Disjoint and source-ordered `(span, text the splice form would emit)`,
    /// which post-order visiting maintains for free.
    ledger: Vec<(Span, String)>,
    targets: Vec<(Span, Rewrite)>,
}

impl<'a, 'sem> StateAssignsFinder<'a, 'sem> {
    /// `source[span]` with every already-rewritten site inside it substituted —
    /// what the next fixed-point iteration would have read.
    fn shadow_text(&self, span: Span) -> String {
        let mut out = String::new();
        let mut cursor = span.start;
        for (inner, text) in &self.ledger {
            if inner.start < span.start || inner.end > span.end {
                continue;
            }
            out.push_str(&self.source[cursor as usize..inner.start as usize]);
            out.push_str(text);
            cursor = inner.end;
        }
        out.push_str(&self.source[cursor as usize..span.end as usize]);
        out
    }

    fn record(&mut self, span: Span, rewrite: Rewrite, text: String) {
        // Everything this site encloses is already folded into `text`, so the
        // ledger stays disjoint; keeping it sorted by start makes `shadow_text`
        // independent of the order the visitor happens to reach siblings in.
        self.ledger
            .retain(|(inner, _)| !(span.start <= inner.start && inner.end <= span.end));
        let at = self
            .ledger
            .partition_point(|(inner, _)| inner.start < span.start);
        self.ledger.insert(at, (span, text));
        self.targets.push((span, rewrite));
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for StateAssignsFinder<'a, 'sem> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !is_rewritable_target(self.semantic, id, self.state_vars, &self.state_var_symbols) {
            return;
        }

        let rhs_text = self.shadow_text(expr.right.span());

        match expr.operator {
            AssignmentOperator::Assign => {
                let is_raw_state = self.raw_state_vars.iter().any(|s| s.as_str() == name);
                let site_decision = match expr.right.get_inner_expression() {
                    Expression::Identifier(rhs_id) => ident_rhs_needs_proxy(self.semantic, rhs_id),
                    _ => None,
                };
                let needs_proxy = self.is_runes
                    && !is_raw_state
                    && site_decision.unwrap_or_else(|| {
                        expression_needs_proxy_with_scope(rhs_text.trim(), self.non_proxy_vars)
                    });
                let text = if needs_proxy {
                    format!("$.set({}, {}, true)", name, rhs_text)
                } else {
                    format!("$.set({}, {})", name, rhs_text)
                };
                self.record(expr.span, Rewrite::Assign { needs_proxy }, text);
            }
            op => {
                let Some((op_str, compound)) = compound_operator(op) else {
                    return;
                };
                let rhs_trimmed = rhs_text.trim();
                let rhs_for_output = if needs_compound_assignment_parens(rhs_trimmed, op_str) {
                    format!("({})", rhs_trimmed)
                } else {
                    rhs_trimmed.to_string()
                };
                let text = format!(
                    "$.set({}, $.get({}) {} {})",
                    name, name, op_str, rhs_for_output
                );
                self.record(expr.span, Rewrite::Compound(compound), text);
            }
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        if !is_rewritable_target(self.semantic, id, self.state_vars, &self.state_var_symbols) {
            return;
        }

        let text = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", name),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", name),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", name),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", name),
        };
        let rewrite = Rewrite::Update {
            prefix: expr.prefix,
            decrement: expr.operator == UpdateOperator::Decrement,
        };
        self.record(expr.span, rewrite, text);
    }
}

struct StateAssignsRewriter<'a> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    targets: Vec<(Span, Rewrite)>,
    changed: bool,
}

impl<'a> StateAssignsRewriter<'a> {
    /// Ends the immutable borrow of `*expr` before the caller replaces it, and
    /// copies the name into the arena so it outlives the node it came from.
    fn plan(&self, expr: &Expression<'a>) -> Option<(Rewrite, &'a str)> {
        let (span, name) = match expr {
            Expression::AssignmentExpression(assign) => {
                let AssignmentTarget::AssignmentTargetIdentifier(id) = &assign.left else {
                    return None;
                };
                (assign.span, id.name.as_str())
            }
            Expression::UpdateExpression(update) => {
                let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &update.argument
                else {
                    return None;
                };
                (update.span, id.name.as_str())
            }
            _ => return None,
        };
        let rewrite = self
            .targets
            .iter()
            .find(|(target, _)| *target == span)
            .map(|(_, rewrite)| *rewrite)?;
        Some((rewrite, self.b.str(name)))
    }

    fn take_assignment_rhs(&self, expr: &mut Expression<'a>) -> Expression<'a> {
        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::AssignmentExpression(assign) = taken else {
            unreachable!("planned as an assignment")
        };
        assign.unbox().right
    }
}

impl<'a> oxc_ast_visit::VisitMut<'a> for StateAssignsRewriter<'a> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let Some((rewrite, name)) = self.plan(expr) else {
            return;
        };
        match rewrite {
            Rewrite::Assign { needs_proxy } => {
                let rhs = self.take_assignment_rhs(expr);
                let mut args = vec![self.b.id(name), rhs];
                if needs_proxy {
                    args.push(self.b.bool(true));
                }
                *expr = self.b.call("$.set", args);
            }
            Rewrite::Compound(op) => {
                let rhs = self.take_assignment_rhs(expr);
                // The text form parenthesises the right operand by scanning it;
                // here esrap re-derives every paren from precedence, so an
                // explicit node would be dropped before printing anyway.
                let get = self.b.call("$.get", vec![self.b.id(name)]);
                let value = match op {
                    CompoundOp::Binary(op) => self.b.binary(op, get, rhs),
                    CompoundOp::Logical(op) => self.b.logical(op, get, rhs),
                };
                *expr = self.b.call("$.set", vec![self.b.id(name), value]);
            }
            Rewrite::Update { prefix, decrement } => {
                let callee = if prefix { "$.update_pre" } else { "$.update" };
                let mut args = vec![self.b.id(name)];
                if decrement {
                    args.push(
                        self.b
                            .unary(UnaryOperator::UnaryNegation, self.b.number(1.0)),
                    );
                }
                *expr = self.b.call(callee, args);
            }
        }
        self.changed = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn simple_assignment() {
        let out =
            transform_state_assigns_ast("let x; x = 5;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let x;\n\n$.set(x, 5);");
    }

    #[test]
    fn compound_addition() {
        let out =
            transform_state_assigns_ast("let x; x += 5;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let x;\n\n$.set(x, $.get(x) + 5);");
    }

    #[test]
    fn update_post_increment() {
        let out =
            transform_state_assigns_ast("let x; x++;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let x;\n\n$.update(x);");
    }

    #[test]
    fn all_three_kinds_in_one_body() {
        // Combined pass handles all three operator families
        // without re-parsing between them.
        let out = transform_state_assigns_ast(
            "let x; let y; let z; x = 1; y += 2; z++;",
            &ssv(&["x", "y", "z"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "let x;\nlet y;\nlet z;\n\n$.set(x, 1);\n$.set(y, $.get(y) + 2);\n$.update(z);"
        );
    }

    #[test]
    fn nested_assignment_wraps_both() {
        // `outer = (inner = 1)` — fixed-point iteration handles
        // the outer wrap after the inner is rewritten.
        let out = transform_state_assigns_ast(
            "let outer; let inner; outer = (inner = 1);",
            &ssv(&["outer", "inner"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "let outer;\nlet inner;\n\n$.set(outer, $.set(inner, 1));"
        );
    }

    #[test]
    fn deeply_nested_assignments_wrap_inside_out() {
        let out = transform_state_assigns_ast(
            "let outer; let middle; let inner; outer = (middle = (inner += 1));",
            &ssv(&["outer", "middle", "inner"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "let outer;\nlet middle;\nlet inner;\n\n$.set(outer, $.set(middle, $.set(inner, $.get(inner) + 1)));"
        );
    }

    #[test]
    fn proxy_flag_in_runes() {
        let out = transform_state_assigns_ast("let x; x = { a: 1 };", &ssv(&["x"]), &[], true, &[])
            .unwrap();
        assert_eq!(out, "let x;\n\n$.set(x, { a: 1 }, true);");
    }

    #[test]
    fn raw_state_no_proxy() {
        let out = transform_state_assigns_ast(
            "let x; x = { a: 1 };",
            &ssv(&["x"]),
            &ssv(&["x"]),
            true,
            &[],
        )
        .unwrap();
        assert_eq!(out, "let x;\n\n$.set(x, { a: 1 });");
    }

    #[test]
    fn skips_function_param_shadow() {
        assert!(
            transform_state_assigns_ast(
                "let x; function f(x) { x = 1; x += 2; x++; }",
                &ssv(&["x"]),
                &[],
                false,
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn skips_member_target() {
        assert!(
            transform_state_assigns_ast("let x; obj.x = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_assigns_ast("let x; x.prop += 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn skips_declaration() {
        assert!(transform_state_assigns_ast("let x = 5;", &ssv(&["x"]), &[], false, &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_state_assigns_ast("function f( {", &ssv(&["x"]), &[], false, &[]).is_none()
        );
    }

    #[test]
    fn empty_state_vars_returns_none() {
        assert!(transform_state_assigns_ast("x = 5;", &[], &[], false, &[]).is_none());
    }
}

#[cfg(test)]
mod site_proxy_tests {
    use super::*;

    #[test]
    fn inner_template_literal_const_rhs_is_not_proxied() {
        let src = r#"initial.forEach((row, rowIndex) => {
	const cols = row.split(" ");
	cols.forEach((col, colIndex) => {
		const id = `${rowIndex}-${colIndex}`;
		if (col === "h") {
			highlighted = id;
		}
	});
});"#;
        let out =
            transform_state_assigns_ast(src, &["highlighted".to_string()], &[], true, &[]).unwrap();
        assert!(out.contains("$.set(highlighted, id)"));
        assert!(!out.contains("$.set(highlighted, id, true)"));
    }

    #[test]
    fn param_rhs_stays_proxied() {
        let src = "const menu = { onHighlightChange: (id) => { highlighted = id; } };";
        let out =
            transform_state_assigns_ast(src, &["highlighted".to_string()], &[], true, &[]).unwrap();
        assert!(out.contains("$.set(highlighted, id, true)"));
    }
}
