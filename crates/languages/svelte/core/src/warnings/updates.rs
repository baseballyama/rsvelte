//! `non_reactive_update`: a top-level variable that is reassigned and that the template reads,
//! though it is not state.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript::scope::{BindingIdentifier, ScopeIdentifier};
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rustc_hash::FxHashMap;

use super::found::{Found, Stage};
use super::warning;

/// Upstream's loop over the module's then the instance's declarations, after the walks.
/// `bind_this` holds each `bind:this` expression and whether a block encloses it.
pub(super) fn non_reactive_updates(
    component: &Component,
    resolution: &Resolution,
    bind_this: &[(Span, bool)],
    exported: &FxHashMap<BindingIdentifier, u32>,
    found: &mut Found,
) {
    let javascript = &component.javascript;
    let sem = &resolution.sem;
    let scripts: Vec<Span> = [&component.module, &component.instance]
        .into_iter()
        .flatten()
        .map(|s| s.span)
        .collect();
    // The module's scope, then the instance's: the template's expressions resolve in the latter.
    let tops: Vec<ScopeIdentifier> = component
        .module
        .iter()
        .map(|s| s.program)
        .chain([component.program])
        .filter_map(|program| sem.scope_of(program))
        .collect();
    let in_script = |at: u32| {
        scripts
            .iter()
            .any(|s| s.start_offset <= at && at < s.end_offset)
    };
    // Upstream's identifier ends after its type annotation.
    let annotations: FxHashMap<_, u32> = javascript
        .typescript
        .iter()
        .filter(|t| t.kind == TypeScriptKind::Annotation)
        .map(|t| (t.node, t.span.end_offset))
        .collect();
    for &top in &tops {
        for (id, binding) in sem.bindings.iter_enumerated() {
            if binding.scope != top
                || resolution.bindings[id].kind != BindingKind::Normal
                || (binding.writes == 0 && !exported.contains_key(&id))
            {
                continue;
            }
            let read = sem.references_to(id).any(|reference| {
                let Some(at) = javascript.source_location(reference.node).span() else {
                    return false;
                };
                if in_script(at.start_offset) || in_function(resolution, reference.scope, &tops) {
                    return false;
                }
                // `bind:this` need not be state unless a block can re-run it.
                bind_this
                    .iter()
                    .find(|(s, _)| {
                        s.start_offset <= at.start_offset && at.end_offset <= s.end_offset
                    })
                    .is_none_or(|(_, in_block)| *in_block)
            });
            if read && let Some(mut span) = javascript.source_location(binding.node).span() {
                if let Some(&end) = annotations.get(&binding.node) {
                    span.end_offset = end;
                }
                let name = javascript.name(binding.node);
                let message = format!(
                    "`{name}` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates"
                );
                found.push(
                    Stage::Bindings,
                    0,
                    warning("non_reactive_update", &message, span),
                );
            }
        }
    }
}

/// Whether a JavaScript function lies between `scope` and the scripts' top-level scopes.
fn in_function(
    resolution: &Resolution,
    mut scope: ScopeIdentifier,
    tops: &[ScopeIdentifier],
) -> bool {
    let scopes = &resolution.sem.scopes;
    while !tops.contains(&scope) {
        if scopes[scope].function {
            return true;
        }
        let Some(parent) = scopes[scope].parent else {
            return false;
        };
        scope = parent;
    }
    false
}
