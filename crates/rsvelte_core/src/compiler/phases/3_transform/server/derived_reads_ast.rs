//! AST-based rewrite of bare derived-binding references to getter calls
//! (`name` → `name()`, or `name?.()` for `var`-declared deriveds) for the
//! server target.
//!
//! Replaces the byte scanner `wrap_derived_reads_in_script` (and its
//! `compute_shadow_ranges` / `is_derived_read_position` /
//! `is_object_shorthand_position` helpers, plus the hand-rolled template-
//! literal recursion). The scanner reconstructed, from raw bytes, which
//! identifier occurrences are *reads* of a derived binding — rejecting member
//! properties, declaration names, object keys, shadowed inner scopes, and the
//! `foo()` double-wrap — using a stack of positional heuristics. oxc gives all
//! of that structurally:
//!
//! - member property `obj.foo` / object key `{ foo: … }` / declaration name
//!   `let foo` are `IdentifierName` / `BindingIdentifier`, never visited by
//!   `visit_identifier_reference`.
//! - member bases (`foo.x`), ternary arms, and spread (`...foo`) all surface as
//!   `IdentifierReference` and are wrapped — matching the scanner, which wraps
//!   them too.
//! - update expressions (`foo++` / `--foo`) on a plain derived are lowered to
//!   the server helper directly here (`$.update_derived(foo)` /
//!   `$.update_derived_pre(foo)`); see `visit_update_expression`.
//! - assignments to a derived (`foo = x` → `foo(x)`, `foo += 1` →
//!   `foo(foo() + 1)`) are lowered to setter calls here; see
//!   `visit_assignment_expression`.
//!   Both update and assignment lowering happen in this same pass and over the
//!   *original valid* script. The previous textual passes
//!   (`rewrite_derived_update_expressions` / `rewrite_derived_assignments`)
//!   scanned the post-wrap intermediates `foo()++` / `foo() = x` — which are not
//!   valid JS (a call is not an assignment target) and so cannot be re-parsed —
//!   and now run only on the byte-scanner fallback path.
//! - shadowing is resolved by scope: a reference binding to an inner scope is
//!   left alone.
//! - template-literal interpolations are ordinary sub-expressions in the AST,
//!   so they're covered without bespoke recursion.
//!
//! Output is byte-identical to the scanner, so the existing fixture + corpus
//! gates verify the swap. Returns `None` (caller falls back to the scanner)
//! when the script doesn't parse as a standalone module — a malformed
//! intermediate is the scanner's problem, not this pass's.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};
use rustc_hash::FxHashSet;

use super::super::shared::ast_rewrite;

thread_local! {
    static DERIVED_READ_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Wrap reads of derived bindings to getter calls. `derived_names` is the set
/// of derived binding names in this script, `derived_var_names` the subset
/// declared with `var` (→ `name?.()`), and `extra_derived` cross-context
/// deriveds read here but declared elsewhere (unresolved references).
///
/// Returns `Some(rewritten)` when at least one read was wrapped, `None` on a
/// parse failure or when nothing matched (caller falls back to the byte
/// scanner).
pub(crate) fn wrap_derived_reads_ast(
    script: &str,
    derived_names: &FxHashSet<String>,
    derived_var_names: &FxHashSet<String>,
    extra_derived: &FxHashSet<String>,
) -> Option<String> {
    if derived_names.is_empty() && extra_derived.is_empty() {
        return None;
    }

    ast_rewrite::with_program(
        &DERIVED_READ_ALLOC,
        script,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| {
            let semantic_ret = SemanticBuilder::new().build(program);
            let semantic = &semantic_ret.semantic;

            let mut collector = DerivedReadCollector {
                semantic,
                derived_names,
                derived_var_names,
                extra_derived,
                edits: Vec::new(),
                skip_spans: FxHashSet::default(),
            };
            collector.visit_program(program);

            if collector.edits.is_empty() {
                return None;
            }

            // Apply right-to-left so earlier offsets stay valid.
            let mut edits = collector.edits;
            edits.sort_by_key(|&(start, ..)| std::cmp::Reverse(start));
            let mut out = script.to_string();
            for (start, end, replacement) in &edits {
                out.replace_range(*start as usize..*end as usize, replacement);
            }
            Some(out)
        },
    )
}

struct DerivedReadCollector<'a, 'sem> {
    semantic: &'sem Semantic<'sem>,
    derived_names: &'a FxHashSet<String>,
    derived_var_names: &'a FxHashSet<String>,
    extra_derived: &'a FxHashSet<String>,
    /// `(start, end, replacement)` edits applied right-to-left. Most are
    /// zero-width inserts (`end == start`) of the `()` / `?.()` suffix; the
    /// shorthand case replaces the whole property span.
    edits: Vec<(u32, u32, String)>,
    /// Identifier-reference span starts a parent handler has already claimed
    /// (a 0-arg call callee, or a shorthand value) so the bare-reference
    /// branch leaves them alone.
    skip_spans: FxHashSet<u32>,
}

impl<'a, 'sem> DerivedReadCollector<'a, 'sem> {
    /// The getter suffix for a derived name: `?.()` for `var`-declared
    /// deriveds (upstream `b.maybe_call`), `()` otherwise (`b.call`).
    fn suffix(&self, name: &str) -> &'static str {
        if self.derived_var_names.contains(name) {
            "?.()"
        } else {
            "()"
        }
    }

    /// True when `name` is a derived binding this pass should wrap.
    fn is_derived(&self, name: &str) -> bool {
        self.derived_names.contains(name) || self.extra_derived.contains(name)
    }

    /// True when this reference binds to a symbol in an inner (non-root) scope
    /// — i.e. a local declaration / parameter shadowing the derived. An
    /// unresolved reference (a cross-context derived from `extra_derived`) is
    /// not shadowed.
    fn is_shadowed(&self, ident: &IdentifierReference) -> bool {
        let Some(reference_id) = ident.reference_id.get() else {
            return false;
        };
        let reference = self.semantic.scoping().get_reference(reference_id);
        let Some(symbol_id) = reference.symbol_id() else {
            return false;
        };
        let symbol_scope = self.semantic.scoping().symbol_scope_id(symbol_id);
        symbol_scope != self.semantic.scoping().root_scope_id()
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for DerivedReadCollector<'a, 'sem> {
    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        if self.skip_spans.contains(&ident.span.start) {
            return;
        }
        if !self.is_derived(&ident.name) || self.is_shadowed(ident) {
            return;
        }
        let suffix = self.suffix(&ident.name);
        // Zero-width insert of the suffix immediately after the identifier.
        self.edits
            .push((ident.span.end, ident.span.end, suffix.to_string()));
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'ast>) {
        // Shorthand `{ foo }` desugars to `{ foo: foo() }` — emitting
        // `{ foo() }` would be invalid method shorthand. Replace the whole
        // property and skip its value identifier.
        if prop.shorthand
            && let PropertyKey::StaticIdentifier(key) = &prop.key
            && self.is_derived(&key.name)
            && let Expression::Identifier(value) = &prop.value
            && !self.is_shadowed(value)
        {
            let name = key.name.as_str();
            self.edits.push((
                prop.span.start,
                prop.span.end,
                format!("{}: {}{}", name, name, self.suffix(name)),
            ));
            self.skip_spans.insert(value.span.start);
        }
        walk::walk_object_property(self, prop);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Every read of a derived identifier is wrapped to its getter call,
        // INCLUDING when the derived is itself the callee — `foo()` → `foo()()`,
        // `foo(x)` → `foo()(x)`, `foo?.()` → `foo()?.()`. On the server a derived
        // is a callable getter, so a source-level call of a derived (`{ scale()(t) }`,
        // `{ inactive() }`) is calling the derived's *value*: the getter read
        // (`foo()`) must still be inserted, yielding `foo()()`. Upstream applies
        // `b.call` to every derived reference uniformly — there is no
        // call-position exception. (A source `foo()` only occurs when the
        // derived's value is itself a function, i.e. the currying case; a plain
        // derived read is written `foo`, never `foo()`.) The bare reference is
        // wrapped by `visit_identifier_reference` during the walk below.
        walk::walk_call_expression(self, call);
    }

    fn visit_update_expression(&mut self, update: &UpdateExpression<'ast>) {
        // Svelte 5.53.2 (upstream `6aa7b9c64` "fix: update expressions on server
        // deriveds"): `count++` / `--count` on a derived must lower to the
        // `$.update_derived(count)` / `$.update_derived_pre(count)` helpers.
        //
        // This is done here, in the read-wrapping pass over the *original valid*
        // script, rather than in the old downstream `rewrite_derived_update_expressions`
        // text scan: that scan ran on the post-wrap intermediate `count()++`,
        // which is not valid JS (the operand of `++` must be a reference, not a
        // call), so it could never be re-parsed into an AST. Over the raw script
        // a bare derived update is `UpdateExpression { argument:
        // AssignmentTargetIdentifier }`.
        //
        // We mirror the text scan's match set exactly so the swap is byte-identical:
        // only a plain derived declared in *this* script (`derived_names`, never
        // `extra_derived`) and not `var`-declared (those read as `count?.()`,
        // which the scanner required to be plain `()` and so left untouched) is
        // lowered; a shadowed inner binding is left to the normal walk.
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &update.argument {
            let name = id.name.as_str();
            if self.derived_names.contains(name)
                && !self.derived_var_names.contains(name)
                && !self.is_shadowed(id)
            {
                let helper = if update.prefix {
                    "$.update_derived_pre"
                } else {
                    "$.update_derived"
                };
                // `--` decrements via a `, -1` second argument (upstream
                // `b.call(helper, node, op === '--' && b.literal(-1))`).
                let neg = if update.operator == UpdateOperator::Decrement {
                    ", -1"
                } else {
                    ""
                };
                self.edits.push((
                    update.span.start,
                    update.span.end,
                    format!("{helper}({name}{neg})"),
                ));
                // The argument identifier becomes the bare helper arg — do not
                // also wrap it as a read. Returning without walking leaves it
                // unvisited; the skip-span is belt-and-suspenders for any future
                // re-walk.
                self.skip_spans.insert(id.span.start);
                return;
            }
        }
        walk::walk_update_expression(self, update);
    }

    fn visit_assignment_expression(&mut self, assign: &AssignmentExpression<'ast>) {
        // Assignments to a derived become setter calls on the server (upstream
        // `AssignmentExpression.js` server visitor): `likes = x` → `likes(x)`,
        // compound operators expand via `build_assignment_value` —
        // `likes += 1` → `likes(likes() + 1)`, `flag &&= x` → `flag(flag() && x)`.
        //
        // Done here, in the read-wrapping pass over the *original valid* script,
        // rather than in the old downstream `rewrite_derived_assignments` text
        // scan: that scan ran on the post-wrap intermediate `likes() = x`, which
        // is not valid JS (a call is not an assignment target) and so could never
        // be re-parsed. Over the raw script a bare derived assignment is
        // `AssignmentExpression { left: AssignmentTargetIdentifier }`.
        //
        // Expressed as non-overlapping edits so the RHS keeps its own read-wrap
        // edits: skip the LHS identifier (it stays the bare setter callee),
        // replace the `op=` gap (`left.end .. right.start`) with `(` (plain `=`)
        // or `(likes() <binop> ` (compound), and append `)` after the RHS. Nested
        // `a = b = 1` resolves because the inner assignment is rewritten on the
        // walk, its inserts coexisting with the outer's. Whitespace around the
        // operator is collapsed exactly as the text pass did.
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &assign.left {
            let name = id.name.as_str();
            // Mirror the text pass: only a plain derived declared in this script
            // (`derived_names`, never `extra_derived`), not shadowed. Unlike the
            // update scan, `var`-declared deriveds ARE handled (the text scan's
            // `maybe_call` branch matched `name?.()` too) — `suffix()` picks the
            // right read form.
            if self.derived_names.contains(name) && !self.is_shadowed(id) {
                // The LHS becomes the bare setter callee — do not wrap it as a read.
                self.skip_spans.insert(id.span.start);
                let gap = if assign.operator == AssignmentOperator::Assign {
                    "(".to_string()
                } else {
                    // `op=` → `(name<read> <op-without-`=`> ` (build_assignment_value).
                    let op = assign.operator.as_str();
                    let binop = &op[..op.len() - 1];
                    format!("({}{} {} ", name, self.suffix(name), binop)
                };
                let rhs_span = assign.right.span();
                self.edits.push((id.span.end, rhs_span.start, gap));
                self.edits
                    .push((rhs_span.end, rhs_span.end, ")".to_string()));
            }
        }
        // Walk so RHS reads / nested derived assignments are rewritten; the LHS
        // identifier (if claimed above) is left alone via `skip_spans`.
        walk::walk_assignment_expression(self, assign);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn names(v: &[&str]) -> FxHashSet<String> {
        v.iter().map(|s| s.to_string()).collect()
    }

    fn wrap(script: &str, derived: &[&str]) -> Option<String> {
        wrap_derived_reads_ast(
            script,
            &names(derived),
            &FxHashSet::default(),
            &FxHashSet::default(),
        )
    }

    #[test]
    fn wraps_bare_read() {
        assert_eq!(
            wrap("let x = count + 1;", &["count"]).unwrap(),
            "let x = count() + 1;"
        );
    }

    #[test]
    fn skips_member_property() {
        // `obj.count` — count is a property name, not a reference.
        assert!(wrap("let x = obj.count;", &["count"]).is_none());
    }

    #[test]
    fn wraps_member_base() {
        assert_eq!(
            wrap("let x = count.foo;", &["count"]).unwrap(),
            "let x = count().foo;"
        );
    }

    #[test]
    fn skips_declaration_name() {
        // The derived's own declarator is a BindingIdentifier, never visited.
        assert!(wrap("let count = 1;", &["count"]).is_none());
    }

    #[test]
    fn skips_object_key() {
        assert!(wrap("let o = { count: 1 };", &["count"]).is_none());
    }

    #[test]
    fn expands_shorthand() {
        assert_eq!(
            wrap("let o = { count };", &["count"]).unwrap(),
            "let o = { count: count() };"
        );
    }

    #[test]
    fn wraps_ternary_arms() {
        assert_eq!(
            wrap("let x = cond ? count : other;", &["count"]).unwrap(),
            "let x = cond ? count() : other;"
        );
    }

    #[test]
    fn lowers_simple_assignment() {
        // The whole assignment lowers to a setter call directly (previously the
        // pass produced `count() = 1` and a downstream text pass fixed it).
        assert_eq!(wrap("count = 1;", &["count"]).unwrap(), "count(1);");
    }

    #[test]
    fn lowers_compound_assignment() {
        assert_eq!(
            wrap("count += 1;", &["count"]).unwrap(),
            "count(count() + 1);"
        );
        assert_eq!(
            wrap("count -= other;", &["count", "other"]).unwrap(),
            "count(count() - other());"
        );
    }

    #[test]
    fn lowers_logical_assignment() {
        assert_eq!(
            wrap("flag &&= x;", &["flag"]).unwrap(),
            "flag(flag() && x);"
        );
        assert_eq!(
            wrap("flag ??= x;", &["flag"]).unwrap(),
            "flag(flag() ?? x);"
        );
    }

    #[test]
    fn lowers_nested_assignment() {
        assert_eq!(wrap("a = b = 1;", &["a", "b"]).unwrap(), "a(b(1));");
    }

    #[test]
    fn assignment_wraps_rhs_reads() {
        // `count = other` — the RHS read of another derived is still wrapped.
        assert_eq!(
            wrap("count = other;", &["count", "other"]).unwrap(),
            "count(other());"
        );
    }

    #[test]
    fn assignment_on_var_derived_uses_maybe_call_read() {
        let out = wrap_derived_reads_ast(
            "count += 1;",
            &names(&["count"]),
            &names(&["count"]),
            &FxHashSet::default(),
        )
        .unwrap();
        // Setter callee is bare; the compound read uses `?.()`.
        assert_eq!(out, "count(count?.() + 1);");
    }

    #[test]
    fn assignment_member_target_left_to_read_wrap() {
        // `obj.count = 1` — member target, not a bare derived; the derived `obj`
        // base is wrapped as a read but the assignment is not lowered.
        assert_eq!(
            wrap("obj.count = 1;", &["obj"]).unwrap(),
            "obj().count = 1;"
        );
    }

    #[test]
    fn assignment_on_shadowed_binding_left_alone() {
        assert!(wrap("function f(count) { count = 1; }", &["count"]).is_none());
    }

    #[test]
    fn wraps_derived_callee_uniformly() {
        // A derived used as a callee is wrapped uniformly: the source call is of
        // the derived's (function) value, so the getter read is still inserted.
        // `count(x)` → `count()(x)`; `count()` → `count()()` (the currying case).
        assert_eq!(wrap("count(x);", &["count"]).unwrap(), "count()(x);");
        assert_eq!(wrap("count();", &["count"]).unwrap(), "count()();");
    }

    #[test]
    fn var_derived_uses_maybe_call() {
        let out = wrap_derived_reads_ast(
            "let x = count;",
            &names(&["count"]),
            &names(&["count"]),
            &FxHashSet::default(),
        )
        .unwrap();
        assert_eq!(out, "let x = count?.();");
    }

    #[test]
    fn shadowed_inner_binding_left_alone() {
        // The inner `count` parameter shadows the derived.
        assert!(wrap("function f(count) { return count + 1; }", &["count"]).is_none());
    }

    #[test]
    fn extra_derived_unresolved_is_wrapped() {
        let out = wrap_derived_reads_ast(
            "let x = d + 1;",
            &FxHashSet::default(),
            &FxHashSet::default(),
            &names(&["d"]),
        )
        .unwrap();
        assert_eq!(out, "let x = d() + 1;");
    }

    #[test]
    fn lowers_postfix_update() {
        assert_eq!(
            wrap("count++;", &["count"]).unwrap(),
            "$.update_derived(count);"
        );
        assert_eq!(
            wrap("count--;", &["count"]).unwrap(),
            "$.update_derived(count, -1);"
        );
    }

    #[test]
    fn lowers_prefix_update() {
        assert_eq!(
            wrap("++count;", &["count"]).unwrap(),
            "$.update_derived_pre(count);"
        );
        assert_eq!(
            wrap("--count;", &["count"]).unwrap(),
            "$.update_derived_pre(count, -1);"
        );
    }

    #[test]
    fn update_in_expression_context() {
        // The derived update lowers; the surrounding `let x =` read context is
        // untouched (an UpdateExpression is not itself a derived read).
        assert_eq!(
            wrap("let x = count++;", &["count"]).unwrap(),
            "let x = $.update_derived(count);"
        );
    }

    #[test]
    fn update_on_var_derived_left_to_read_wrap() {
        // `var`-declared deriveds read as `count?.()`; the old text scanner only
        // matched plain `()` and left the update untouched — reproduce that by
        // falling through to the read wrap (`count?.()++`).
        let out = wrap_derived_reads_ast(
            "count++;",
            &names(&["count"]),
            &names(&["count"]),
            &FxHashSet::default(),
        )
        .unwrap();
        assert_eq!(out, "count?.()++;");
    }

    #[test]
    fn update_on_shadowed_binding_left_alone() {
        assert!(wrap("function f(count) { count++; }", &["count"]).is_none());
    }

    #[test]
    fn update_on_member_target_wraps_base_only() {
        // `obj.count++` — `count` is a property, but a derived `obj` base is
        // still wrapped as a read via the normal walk.
        assert_eq!(wrap("obj.count++;", &["obj"]).unwrap(), "obj().count++;");
    }

    #[test]
    fn wraps_inside_template_interpolation() {
        assert_eq!(
            wrap("let s = `a${count}b`;", &["count"]).unwrap(),
            "let s = `a${count()}b`;"
        );
    }
}
