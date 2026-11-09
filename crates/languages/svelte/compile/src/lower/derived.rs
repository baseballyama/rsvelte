//! `$.derived`'s callback, for `$derived(…)` in the script and for a component's memoized props.

use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_semantic::scope::DeclarationKind;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

use super::javascript::unthunk;

#[derive(Clone, Copy)]
pub(super) enum Created {
    /// At this declarator in the script.
    Script(Span),
    /// In the template, which runs after the script.
    Template,
}

/// Upstream's `b.thunk(value)`, except that `() => f()` stays an arrow unless `source`, the
/// expression `value` was built from, calls a function `$.derived(f)` may keep.
pub(super) fn callback(
    syntax_tree: &SyntaxTree,
    res: &Resolution,
    out: &mut SyntaxTree,
    source: Option<NodeIdentifier>,
    value: NodeIdentifier,
    created: Created,
) -> NodeIdentifier {
    let arrow = out.arrow(&[], value, true, false, SourceLocation::SYNTHETIC);
    if source.is_none_or(|source| final_callee(syntax_tree, res, source, created)) {
        unthunk(out, arrow)
    } else {
        arrow
    }
}

/// Whether the callee of the call `source` already holds the function it keeps when the derived
/// is created: one never reassigned, and a function, an import or declared before the derived.
/// A global counts as final, as upstream treats it, although the component cannot see its writes.
fn final_callee(
    syntax_tree: &SyntaxTree,
    res: &Resolution,
    source: NodeIdentifier,
    created: Created,
) -> bool {
    let Kind::Call { callee, .. } = syntax_tree.kind(source) else {
        return true;
    };
    res.sem.binding_of(callee).is_none_or(|b| {
        let binding = &res.sem.bindings[b];
        binding.writes == 0
            && match created {
                Created::Template => true,
                Created::Script(at) => {
                    matches!(
                        binding.kind,
                        DeclarationKind::Function | DeclarationKind::Import
                    ) || syntax_tree
                        .source_location(binding.node)
                        .span()
                        .is_some_and(|span| span.start_offset < at.start_offset)
                }
            }
    })
}
