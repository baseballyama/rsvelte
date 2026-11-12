//! `non_reactive_update`: a top-level variable that is reassigned and that the template reads,
//! though it is not state.

use oxc_ast::AstKind;
use oxc_ast::ast::BindingPattern;
use oxc_semantic::{ScopeId, SymbolId};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rustc_hash::FxHashMap;

use super::found::{Found, Stage};
use super::{span, warning};
use crate::resolve::{BindingKind, Resolution};

/// Upstream's loop over the module's then the instance's declarations, after the walks.
/// `bind_this` holds each `bind:this` expression and whether a block encloses it.
pub(super) fn non_reactive_updates(
    component: &Component,
    resolution: &Resolution,
    bind_this: &[(Span, bool)],
    exported: &FxHashMap<SymbolId, u32>,
    found: &mut Found,
) {
    let scoping = resolution.scoping();
    let scripts: Vec<Span> = [&component.module, &component.instance]
        .into_iter()
        .flatten()
        .map(|s| s.span)
        .collect();
    // The module's scope, then the instance's: the template's expressions resolve in the latter.
    let mut tops: Vec<ScopeId> = vec![scoping.root_scope_id(), resolution.instance_scope()];
    tops.dedup();
    let in_script = |at: u32| {
        scripts
            .iter()
            .any(|s| s.start_offset <= at && at < s.end_offset)
    };
    for &top in &tops {
        for symbol in scoping.symbol_ids() {
            if scoping.symbol_scope_id(symbol) != top
                || resolution.binding(symbol).kind != BindingKind::Normal
                || (resolution.writes(symbol) == 0 && !exported.contains_key(&symbol))
            {
                continue;
            }
            let read = scoping.get_resolved_reference_ids(symbol).iter().any(|&r| {
                let at = resolution.reference_span(r);
                if in_script(at.start)
                    || in_function(resolution, resolution.reference_scope(r), &tops)
                {
                    return false;
                }
                // `bind:this` need not be state unless a block can re-run it.
                bind_this
                    .iter()
                    .find(|(s, _)| s.start_offset <= at.start && at.end <= s.end_offset)
                    .is_none_or(|(_, in_block)| *in_block)
            });
            if read {
                let mut at = span(scoping.symbol_span(symbol));
                // Upstream's identifier ends after its type annotation.
                if let AstKind::VariableDeclarator(d) = resolution.declaration(symbol)
                    && matches!(d.id, BindingPattern::BindingIdentifier(_))
                    && let Some(annotation) = &d.type_annotation
                {
                    at.end_offset = annotation.span.end;
                }
                let name = scoping.symbol_name(symbol);
                let message = format!(
                    "`{name}` is updated, but is not declared with `$state(...)`. Changing its \
                        value will not correctly trigger updates"
                );
                found.push(
                    Stage::Bindings,
                    0,
                    warning("non_reactive_update", &message, at),
                );
            }
        }
    }
}

/// Whether a JavaScript function lies between `scope` and the scripts' top-level scopes.
fn in_function(resolution: &Resolution, mut scope: ScopeId, tops: &[ScopeId]) -> bool {
    let scoping = resolution.scoping();
    while !tops.contains(&scope) {
        if resolution.is_function_scope(scope) {
            return true;
        }
        let Some(parent) = scoping.scope_parent_id(scope) else {
            return false;
        };
        scope = parent;
    }
    false
}
