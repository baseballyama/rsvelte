//! Thin wrapper around `oxc_semantic` for scope / shadowing queries.
//!
//! Future migrations of text helpers that currently scan for "is this
//! identifier shadowed by a local declaration" (e.g.
//! `state_transforms::is_in_function_param_or_shadowed`,
//! `wrap_prop_source_reads`, `transform_state_assignments`) build on
//! the primitives here. Keeping this module focused — it owns only
//! the parse + `SemanticBuilder` plumbing and one query helper. The
//! callers walk the AST themselves with their own `Visit`
//! implementations and ask `is_locally_shadowed(...)` per
//! `IdentifierReference` they care about.
//!
//! ## API shape
//!
//! Callers pass a closure to [`with_semantic`]. The semantic info is
//! built and dropped within the call — the `Program` and `Semantic`
//! are loaned via lifetime-erased borrowed references, so callers
//! can't accidentally hold onto either past the call.
//!
//! ```text
//! with_semantic(source, is_ts, |program, semantic| {
//!     // walk `program` with your own visitor, query `semantic`
//!     // for shadowing as you go.
//! })
//! ```

use oxc_allocator::Allocator;
use oxc_ast::ast::{IdentifierReference, Program};
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_syntax::symbol::SymbolId;
use rustc_hash::FxHashSet;

/// Run `f` with a fully-built `Semantic` over `source`. Returns
/// `None` if the source fails to parse; semantic errors do *not*
/// block the call (a partially-resolved semantic is still useful
/// for shadowing queries).
///
/// Set `is_ts` for `.ts` / `.svelte.ts` inputs.
///
/// `allow_return_outside_function` is enabled so class-method body
/// fragments and other partial-statement inputs parse cleanly —
/// matches the existing AST helpers in this crate.
#[allow(dead_code)] // wired by upcoming scope-aware migration PRs
pub fn with_semantic<F, R>(source: &str, is_ts: bool, f: F) -> Option<R>
where
    F: for<'a> FnOnce(&'a Program<'a>, &Semantic<'a>) -> R,
{
    let allocator = Allocator::default();
    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    let parser_ret = Parser::new(&allocator, source, source_type)
        .with_options(ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        })
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return None;
    }
    // Move the program into the arena so both it and the Semantic
    // can be borrowed for the closure lifetime.
    let program: &Program = allocator.alloc(parser_ret.program);
    let semantic_ret = SemanticBuilder::new().with_build_nodes(true).build(program);
    Some(f(program, &semantic_ret.semantic))
}

/// Returns true if `ident` resolves to a symbol declared in a scope
/// strictly inside the program (root) scope.
///
/// Returns false if:
/// - The reference is unresolved (free name — usually a global or
///   module-level import), or
/// - The reference resolves to a symbol declared in the root scope
///   itself (top-level `let`/`const`/`var`/`function`/`class`/import).
///
/// This is the primitive that prop-source-reads and state-assignment
/// migrations need: a reference is "safe to rewrite as a prop access"
/// iff it is *not* locally shadowed in this sense.
#[allow(dead_code)] // wired by upcoming scope-aware migration PRs
pub fn is_locally_shadowed(semantic: &Semantic, ident: &IdentifierReference) -> bool {
    let Some(reference_id) = ident.reference_id.get() else {
        return false;
    };
    let reference = semantic.scoping().get_reference(reference_id);
    let Some(symbol_id) = reference.symbol_id() else {
        return false;
    };
    let symbol_scope = semantic.scoping().symbol_scope_id(symbol_id);
    let root_scope = semantic.scoping().root_scope_id();
    symbol_scope != root_scope
}

/// For each name in `names`, find the SymbolId of the OUTERMOST
/// declaration. Returns the set of all such "canonical" symbol ids.
///
/// This is the precise answer to "which symbol is the state var?"
/// — when multiple bindings share a name (e.g., outer `let count`
/// plus a nested `function f(count)` parameter), the outermost
/// declaration is the state var, and the others are shadows.
///
/// A reference is to the state var iff its resolved
/// `Reference.symbol_id()` is in this set. See
/// [`is_state_var_reference`].
pub fn find_state_var_symbols(semantic: &Semantic, names: &[String]) -> FxHashSet<SymbolId> {
    if names.is_empty() {
        return FxHashSet::default();
    }
    let scoping = semantic.scoping();
    let root_scope = scoping.root_scope_id();
    let mut out = FxHashSet::default();
    for symbol_id in scoping.symbol_ids() {
        let name = scoping.symbol_name(symbol_id);
        if !names.iter().any(|n| n == name) {
            continue;
        }
        let scope = scoping.symbol_scope_id(symbol_id);
        // Rule 1: root-scope bindings (top-level `let`/`const`/
        // `var`/`function`/`class`/import). Legacy bare `let foo;`
        // declarations are caught here.
        if scope == root_scope {
            out.insert(symbol_id);
            continue;
        }
        // Rule 2: state-var-shaped initializer. Catches function-
        // local rune declarations like
        // `function createCounter() { let count = $state(0); ... }`.
        let decl_id = scoping.symbol_declaration(symbol_id);
        if declaration_has_state_var_init(semantic, decl_id) {
            out.insert(symbol_id);
        }
    }
    out
}

/// Returns `true` if the declaration node identified by `decl_id`
/// (a `BindingIdentifier` inside a `VariableDeclarator`) is
/// initialized with a call to one of the state-creating runtime/
/// runes functions: `$state`/`$derived`/`$state.*`/`$derived.*`/
/// `$.state`/`$.derived`/`$.mutable_source`/`$.proxy`/
/// `$.source`/`$.snapshot`.
fn declaration_has_state_var_init(semantic: &Semantic, decl_id: oxc_syntax::node::NodeId) -> bool {
    use oxc_ast::AstKind;
    let nodes = semantic.nodes();
    // `Scoping::symbol_declaration` returns the `VariableDeclarator`
    // NodeId directly for variable bindings (verified via debug
    // traces). Check that kind first, then walk a few parents as
    // a safety net in case other binding shapes report a deeper
    // descendant (e.g. a BindingIdentifier inside a
    // BindingPattern).
    let kind = nodes.get_node(decl_id).kind();
    if let AstKind::VariableDeclarator(decl) = kind {
        let Some(init) = &decl.init else {
            return false;
        };
        return is_state_var_init_expression(init);
    }
    let mut cur = decl_id;
    for _ in 0..4 {
        if let AstKind::VariableDeclarator(decl) = nodes.parent_kind(cur) {
            let Some(init) = &decl.init else {
                return false;
            };
            return is_state_var_init_expression(init);
        }
        let parent = nodes.parent_id(cur);
        if parent == cur {
            return false;
        }
        cur = parent;
    }
    false
}

fn is_state_var_init_expression(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::Expression;
    let Expression::CallExpression(call) = expr else {
        return false;
    };
    match &call.callee {
        // Raw rune forms: `$state(...)` / `$derived(...)`.
        Expression::Identifier(id) => matches!(id.name.as_str(), "$state" | "$derived"),
        // `$.state(...)` / `$.mutable_source(...)` / etc. and
        // `$state.raw(...)` / `$derived.by(...)` etc.
        Expression::StaticMemberExpression(member) => {
            let Expression::Identifier(obj) = &member.object else {
                return false;
            };
            if obj.name == "$" {
                return matches!(
                    member.property.name.as_str(),
                    "state" | "derived" | "mutable_source" | "proxy" | "source" | "snapshot"
                );
            }
            matches!(obj.name.as_str(), "$state" | "$derived")
        }
        _ => false,
    }
}

/// Returns true if the identifier reference should be treated as
/// referring to a state var with the given name. Combines two
/// signals:
///
/// 1. **Symbol-identity match** (precise): if the reference
///    resolves to a symbol in `state_var_symbols`, it's the state
///    var.
/// 2. **Unresolved name fallback** (line-by-line transformers):
///    when the helper runs on a script fragment, the state var's
///    declaration may live on a different line, so the reference
///    here is *unresolved*. If the name is in `names` and the
///    reference is unresolved, treat it as the state var.
///
/// Shadowing case: the reference resolves to a non-state-var
/// symbol (e.g. function parameter) → returns `false`.
pub fn is_state_var_reference_or_unresolved(
    semantic: &Semantic,
    ident: &IdentifierReference,
    state_var_symbols: &FxHashSet<SymbolId>,
    names: &[String],
) -> bool {
    let Some(reference_id) = ident.reference_id.get() else {
        return false;
    };
    let reference = semantic.scoping().get_reference(reference_id);
    match reference.symbol_id() {
        Some(symbol_id) => state_var_symbols.contains(&symbol_id),
        None => names.iter().any(|n| n.as_str() == ident.name.as_str()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_ast_visit::Visit;

    /// Walk every `IdentifierReference` in `source` whose `.name` matches
    /// `target`, and return whether each is locally shadowed.
    fn shadow_status(source: &str, target: &str) -> Vec<bool> {
        with_semantic(source, false, |program, semantic| {
            let mut c = Collector {
                target,
                semantic,
                out: Vec::new(),
            };
            c.visit_program(program);
            c.out
        })
        .unwrap()
    }

    fn shadow_status_ts(source: &str, target: &str) -> Vec<bool> {
        with_semantic(source, true, |program, semantic| {
            let mut c = Collector {
                target,
                semantic,
                out: Vec::new(),
            };
            c.visit_program(program);
            c.out
        })
        .unwrap()
    }

    struct Collector<'a, 'sem> {
        target: &'a str,
        semantic: &'sem Semantic<'sem>,
        out: Vec<bool>,
    }
    impl<'a, 'sem> Visit<'a> for Collector<'_, 'sem> {
        fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'a>) {
            if ident.name == self.target {
                self.out.push(is_locally_shadowed(self.semantic, ident));
            }
        }
    }

    #[test]
    fn top_level_assignment_not_shadowed() {
        // `count = 5;` at top level — bare assignment, `count` is
        // a free reference (no declaration). Not shadowed.
        let r = shadow_status("count = 5;", "count");
        assert_eq!(r, vec![false]);
    }

    #[test]
    fn top_level_let_then_reference_not_shadowed() {
        // `let count = 0; count = 5;` — `count` resolves to a
        // root-scope binding. Not "locally" shadowed (the let is
        // root, not inner).
        let r = shadow_status("let count = 0; count = 5;", "count");
        // The `let` declarator's id is a BindingIdentifier, not an
        // IdentifierReference, so the visitor only fires on the
        // assignment LHS.
        assert!(r.iter().all(|x| !*x), "got {:?}", r);
    }

    #[test]
    fn function_param_shadows() {
        // `function f(count) { count = 5; }` — the inner `count` on
        // LHS is a param-shadowed identifier. Should be shadowed.
        let r = shadow_status("function f(count) { count = 5; }", "count");
        assert_eq!(r, vec![true]);
    }

    #[test]
    fn nested_block_let_shadows() {
        // `let count = 0; { let count = 1; count = 2; }` — the
        // innermost `count = 2;` resolves to the block-scope let,
        // which is NOT root scope → shadowed.
        let r = shadow_status("let count = 0; { let count = 1; count = 2; }", "count");
        assert!(r.contains(&true), "expected a shadowed ref, got {:?}", r);
    }

    #[test]
    fn unrelated_function_param_does_not_shadow() {
        // `function f(other) { count = 5; }` — `count` is free,
        // not shadowed. The `other` param is irrelevant.
        let r = shadow_status("function f(other) { count = 5; }", "count");
        assert_eq!(r, vec![false]);
    }

    #[test]
    fn parse_error_returns_none() {
        // Unbalanced parens — parser fails, with_semantic returns
        // None.
        let r: Option<()> = with_semantic("function f( {", false, |_, _| ());
        assert!(r.is_none());
    }

    #[test]
    fn ts_source_works() {
        // TypeScript syntax (type annotation on the param) should
        // parse cleanly under is_ts=true.
        let r = shadow_status_ts("function f(count: number) { count = 5; }", "count");
        assert_eq!(r, vec![true]);
    }

    #[test]
    fn destructuring_param_shadows() {
        // `function f({ count }) { count = 5; }` — destructured
        // param still binds `count` in the function scope.
        let r = shadow_status("function f({ count }) { count = 5; }", "count");
        assert_eq!(r, vec![true]);
    }

    #[test]
    fn arrow_param_shadows() {
        // `const f = (count) => { count = 5; };` — arrow param
        // shadows.
        let r = shadow_status("const f = (count) => { count = 5; };", "count");
        assert_eq!(r, vec![true]);
    }

    #[test]
    fn catch_param_shadows() {
        // `try {} catch (count) { count; }` — catch param shadows.
        let r = shadow_status("try {} catch (count) { count; }", "count");
        assert_eq!(r, vec![true]);
    }

    /// Smoke test: doesn't crash on a non-trivial real-world-ish
    /// snippet exercising prop access patterns the migration will
    /// later use.
    #[test]
    fn smoke_prop_like_snippet() {
        let src = r#"
            function $$pre(props) {
                let count = props.count;
                function inner(count) {
                    return count + 1;
                }
                return count + inner(count);
            }
        "#;
        // Just ensure it parses and we can run the analysis.
        let r: Option<()> = with_semantic(src, false, |_, _| ());
        assert!(r.is_some());
    }

    /// Reads `count` resolves to outer let in root scope, but inner
    /// uses are shadowed by function param.
    #[test]
    fn mixed_shadow_pattern() {
        let src = "let count = 0; function f(count) { count = 1; } count = 2;";
        let r = shadow_status(src, "count");
        // We should have at least one shadowed and one not.
        assert!(r.contains(&true), "want at least one shadowed: {:?}", r);
        assert!(
            r.contains(&false),
            "want at least one not-shadowed: {:?}",
            r
        );
    }

    /// Import binding is root-scope → references to it are NOT
    /// shadowed by themselves.
    #[test]
    fn import_binding_not_shadowed() {
        let src = "import { count } from './foo'; count;";
        let r = shadow_status(src, "count");
        assert_eq!(r, vec![false]);
    }
}
