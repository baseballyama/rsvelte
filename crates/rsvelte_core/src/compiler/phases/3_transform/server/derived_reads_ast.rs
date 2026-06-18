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
//! - assignment targets (`foo = x`), update args (`foo++`), member bases
//!   (`foo.x`), ternary arms, and spread (`...foo`) all surface as
//!   `IdentifierReference` and are wrapped — matching the scanner, which wraps
//!   them too (the `foo() = x` / `foo()++` intermediates are fixed by the
//!   downstream `rewrite_derived_assignments` / `rewrite_derived_update_expressions`
//!   text passes, left unchanged by this PR).
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
use oxc_span::SourceType;
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
    fn wraps_assignment_lhs() {
        // Matches the scanner: produces the `count() = 1` intermediate that
        // `rewrite_derived_assignments` later fixes to `count(1)`.
        assert_eq!(wrap("count = 1;", &["count"]).unwrap(), "count() = 1;");
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
    fn wraps_inside_template_interpolation() {
        assert_eq!(
            wrap("let s = `a${count}b`;", &["count"]).unwrap(),
            "let s = `a${count()}b`;"
        );
    }
}
