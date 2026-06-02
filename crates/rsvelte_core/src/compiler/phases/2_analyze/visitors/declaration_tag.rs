//! DeclarationTag visitor.
//!
//! Analyzes the new `{let x = …}` / `{const x = …}` declaration-tag template
//! syntax introduced by Svelte 5.56.0 (#18282).
//!
//! Mirrors `2-analyze/visitors/DeclarationTag.js` in the upstream Svelte
//! compiler. Functionally very close to `ConstTag`: the tag declares a
//! template-scoped binding, the init expression is walked for state/await/
//! reactive references, and async @const blockers are tracked. The two main
//! differences are:
//!   1. `let` declarations produce mutable template-scope bindings (whereas
//!      `{@const}` is always immutable).
//!   2. Declaration tags are NOT allowed in legacy mode — the upstream emits
//!      `declaration_tag_no_legacy_mode` in that case.

use super::super::AnalysisError;
use super::super::errors;
use super::shared::utils::{walk_js_expression, walk_js_expression_node};
use super::{FragmentOwnerType, VisitorContext};
use crate::ast::template::DeclarationTag;
use crate::ast::typed_expr::JsNode;

/// Visit a declaration tag.
///
/// Corresponds to `DeclarationTag(node, context)` in upstream
/// `DeclarationTag.js`.
pub fn visit(tag: &mut DeclarationTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Unlike `{@const}`, declaration tags tolerate leading whitespace inside the
    // curly braces (`{ let x = 1 }`), so there is no `validate_opening_tag`
    // check here — upstream removed it in Svelte 5.56.1 #18348.

    // Disallow in pure legacy mode. `maybe_runes` is the final flag set
    // AFTER the template walk by `analyze_component` (it reconciles
    // `uses_props` / `uses_rest_props` from script + template visits with the
    // pre-walk `instance_has_legacy_patterns` snapshot). Because this visitor
    // runs DURING the template walk, we re-compute the same predicate inline
    // from the pieces available at this point — script-driven
    // `uses_props` / `uses_rest_props` flags are already set, and
    // `instance_has_legacy_patterns` was pre-computed before the template
    // walk began.
    if !context.analysis.runes
        && (context.analysis.uses_props
            || context.analysis.uses_rest_props
            || context.analysis.instance_has_legacy_patterns)
    {
        return Err(errors::declaration_tag_no_legacy_mode());
    }

    // Validate placement: same set of fragment owners as `{@const}`.
    let fragment_owner = context.fragment_owner_stack.last().cloned();
    let is_valid_placement = matches!(
        fragment_owner,
        Some(
            FragmentOwnerType::IfBlock
                | FragmentOwnerType::EachBlock
                | FragmentOwnerType::AwaitBlock
                | FragmentOwnerType::KeyBlock
                | FragmentOwnerType::SnippetBlock(_, _)
                | FragmentOwnerType::SvelteFragment
                | FragmentOwnerType::SvelteBoundary
                | FragmentOwnerType::Component
                | FragmentOwnerType::RegularElementWithSlot
                | FragmentOwnerType::SvelteElementWithSlot
        )
    );
    // Declaration tags additionally allow placement at the component root,
    // inside any element fragment, and anywhere `{@const}` is allowed —
    // `{let x = $state(1)}` at the top of the template is the headline use
    // case. Mirrors the upstream visitor which has no placement check at all
    // (the parser accepts the tag in any fragment position).
    let is_valid_placement = is_valid_placement
        || matches!(
            fragment_owner,
            Some(
                FragmentOwnerType::RegularElement
                    | FragmentOwnerType::SvelteElement
                    | FragmentOwnerType::Root
            )
        )
        || fragment_owner.is_none();

    if !is_valid_placement {
        return Err(errors::const_tag_invalid_placement());
    }

    // Walk init expressions for state/await/blocker discovery. The declaration
    // is a VariableDeclaration whose declarators may each have an init.
    //
    // DO NOT set `context.in_const_tag = true` here — that flag is checked by
    // `walk_js_expression_node` (and the JS call_expression visitor) to
    // reject `$state(...)` / `$derived(...)` inside `{@const}`. DeclarationTag
    // (`{let x = $state(...)}` / `{const x = $derived(...)}`) is the
    // canonical template-side place to USE these runes, so the flag must
    // stay false here.

    let decl_node = tag.declaration.as_node();
    let arena = context.parse_arena;

    if let JsNode::VariableDeclaration { declarations, .. } = &*decl_node {
        let decls = arena.get_js_children(*declarations);
        for d in decls {
            if let JsNode::VariableDeclarator {
                init: Some(init), ..
            } = d
            {
                let init_node = arena.get_js_node(*init);
                walk_js_expression_node(init_node, context, &mut tag.metadata.expression)?;
                super::await_block::collect_pickled_awaits_node(
                    init_node,
                    &mut context.analysis.pickled_awaits,
                    arena,
                );
            }
        }
    } else {
        // Fallback: walk via JSON shape.
        let value = tag.declaration.as_json();
        if value.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
            && let Some(declarations) = value.get("declarations").and_then(|d| d.as_array())
        {
            for declaration in declarations {
                if let Some(init) = declaration.get("init")
                    && !init.is_null()
                {
                    walk_js_expression(init, context, &mut tag.metadata.expression)?;
                    super::await_block::collect_pickled_awaits(
                        init,
                        &mut context.analysis.pickled_awaits,
                    );
                }
            }
        }
    }

    Ok(())
}
