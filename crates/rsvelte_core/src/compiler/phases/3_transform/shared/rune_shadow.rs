//! Which rune-spelled identifiers in a script are BOUND rather than runes.
//!
//! Upstream's `get_rune` resolves the callee before it decides
//! (`phases/scope.js`: "rune name, but references a variable or store" →
//! `null`), so `export function f($derived) { return $derived(1); }` calls the
//! parameter. The module lowering finds its rune calls by scanning text, which
//! has no scope of its own; this pass supplies one, from oxc's own resolution.
//!
//! A module that binds no rune-spelled name at all never parses here — the
//! caller gates on the scope table phase 2 already built.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use rustc_hash::FxHashSet;

use super::ast_rewrite;

thread_local! {
    static RUNE_SHADOW_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Every rune name upstream's `is_rune` accepts, by its base identifier.
pub(crate) fn is_rune_name(name: &str) -> bool {
    matches!(
        name,
        "$state" | "$derived" | "$props" | "$bindable" | "$effect" | "$inspect" | "$host"
    )
}

/// Byte offsets of the rune-spelled identifiers in `script` that resolve to a
/// declaration. An unparseable intermediate yields an empty set, which leaves
/// the caller's scans exactly as they were.
pub(crate) fn shadowed_rune_positions(script: &str, is_ts: bool) -> FxHashSet<usize> {
    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    ast_rewrite::with_program(
        &RUNE_SHADOW_ALLOC,
        script,
        source_type,
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| Some(shadowed_positions_in(program)),
    )
    .unwrap_or_default()
}

/// [`shadowed_rune_positions`] against a program the caller already parsed.
pub(crate) fn shadowed_positions_in(program: &Program<'_>) -> FxHashSet<usize> {
    let semantic_ret = SemanticBuilder::new().build(program);
    let mut collector = ShadowCollector {
        semantic: &semantic_ret.semantic,
        positions: FxHashSet::default(),
    };
    collector.visit_program(program);
    collector.positions
}

/// Content-keyed cache of [`shadowed_rune_positions`], for the text scans that
/// rewrite their own input as they go: the offsets move under them, so the
/// answer is keyed by the text rather than invalidated at every rewrite site.
pub(crate) struct RuneShadows {
    enabled: bool,
    is_ts: bool,
    cached: Option<(String, FxHashSet<usize>)>,
}

impl RuneShadows {
    /// `enabled` is the caller's cheap precondition — a script that declares no
    /// rune-spelled name has nothing to resolve, and is never parsed here.
    pub(crate) fn new(enabled: bool, is_ts: bool) -> Self {
        Self {
            enabled,
            is_ts,
            cached: None,
        }
    }

    pub(crate) fn enabled(&self) -> bool {
        self.enabled
    }

    pub(crate) fn is_bound(&mut self, script: &str, pos: usize) -> bool {
        if !self.enabled {
            return false;
        }
        if self.cached.as_ref().is_none_or(|(text, _)| text != script) {
            let positions = shadowed_rune_positions(script, self.is_ts);
            self.cached = Some((script.to_string(), positions));
        }
        self.cached
            .as_ref()
            .is_some_and(|(_, positions)| positions.contains(&pos))
    }
}

struct ShadowCollector<'sem> {
    semantic: &'sem Semantic<'sem>,
    positions: FxHashSet<usize>,
}

impl<'ast> Visit<'ast> for ShadowCollector<'_> {
    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        if is_rune_name(ident.name.as_str())
            && let Some(reference_id) = ident.reference_id.get()
            && self
                .semantic
                .scoping()
                .get_reference(reference_id)
                .symbol_id()
                .is_some()
        {
            self.positions.insert(ident.span.start as usize);
        }
        walk::walk_identifier_reference(self, ident);
    }
}

#[cfg(test)]
mod tests {
    use super::shadowed_rune_positions;

    #[test]
    fn a_parameter_named_after_a_rune_is_shadowed() {
        let src = "export function f($derived) {\n\treturn $derived(1);\n}\n";
        let positions = shadowed_rune_positions(src, false);
        let call = src.rfind("$derived(").unwrap();
        assert!(positions.contains(&call), "{positions:?}");
    }

    #[test]
    fn a_real_rune_call_is_not_shadowed() {
        let src = "export let v = $state(1);\n";
        assert!(shadowed_rune_positions(src, false).is_empty());
    }

    #[test]
    fn only_the_shadowed_scope_is_covered() {
        let src =
            "export let v = $state(1);\nexport function f($state) {\n\treturn $state(2);\n}\n";
        let positions = shadowed_rune_positions(src, false);
        assert_eq!(positions.len(), 1);
        assert!(positions.contains(&src.rfind("$state(2)").unwrap()));
    }

    #[test]
    fn an_unparseable_intermediate_reports_nothing() {
        assert!(shadowed_rune_positions("export function f($state {", false).is_empty());
    }
}
