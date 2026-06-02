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
use super::super::warnings;
use super::shared::utils::{walk_js_expression, walk_js_expression_node};
use super::{FragmentOwnerType, VisitorContext};
use crate::ast::template::DeclarationTag;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

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

    // `state_referenced_locally` warning (Svelte 5.56.1 #18348). A declaration
    // tag that reads a `$state` / `$derived` binding *synchronously* — outside a
    // closure or a `$state(…)` / `$derived(…)` call argument — only captures the
    // initial value (e.g. `{let e = $state(0), f = e}`). rsvelte's main
    // Identifier visitor, which normally emits this warning, does not run on
    // declaration tags (they use the specialized `walk_js_expression` walker for
    // metadata discovery), so we replicate the structural check here: any
    // reactive binding referenced at the "top level" of an initializer warns.
    if context.analysis.runes && !context.is_ignored("state_referenced_locally") {
        let decl_json = tag.declaration.as_json();
        if let Some(decls) = decl_json.get("declarations").and_then(|d| d.as_array()) {
            // Collect first to drop the borrow on `tag` before mutating `context`.
            let inits: Vec<serde_json::Value> = decls
                .iter()
                .filter_map(|d| d.get("init"))
                .filter(|i| !i.is_null())
                .cloned()
                .collect();
            for init in &inits {
                warn_local_state_reads(init, context);
            }
        }
    }

    Ok(())
}

/// Walk a declaration-tag initializer and emit `state_referenced_locally` for
/// every reactive binding read at the top level — i.e. not inside a nested
/// function/arrow (a closure) and not inside a `$state` / `$derived` rune call
/// argument (which becomes a closure during transform). Mirrors the relevant
/// branch of the main `Identifier` visitor.
fn warn_local_state_reads(node: &serde_json::Value, context: &mut VisitorContext) {
    use serde_json::Value;
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            let Some(name) = node.get("name").and_then(|n| n.as_str()) else {
                return;
            };
            let eligible = context
                .analysis
                .root
                .scope
                .declarations
                .get(name)
                .copied()
                .is_some_and(|idx| {
                    matches!(
                        context.analysis.root.bindings[idx].kind,
                        BindingKind::State | BindingKind::RawState | BindingKind::Derived
                    )
                });
            if eligible {
                let start = node.get("start").and_then(|v| v.as_u64()).map(|v| v as u32);
                let end = node.get("end").and_then(|v| v.as_u64()).map(|v| v as u32);
                context
                    .analysis
                    .warnings
                    .push(warnings::state_referenced_locally(
                        name, "closure", start, end,
                    ));
            }
        }
        // Reads inside a nested function are reactive — do not descend.
        Some("ArrowFunctionExpression")
        | Some("FunctionExpression")
        | Some("FunctionDeclaration") => {}
        Some("CallExpression") => {
            if let Some(callee) = node.get("callee") {
                warn_local_state_reads(callee, context);
            }
            // `$state(…)` / `$derived(…)` arguments become closures, so reads
            // there are reactive — skip them.
            if !callee_is_state_rune(node)
                && let Some(args) = node.get("arguments").and_then(|a| a.as_array())
            {
                for arg in args {
                    warn_local_state_reads(arg, context);
                }
            }
        }
        // The assignment target is a write, not a read; only walk the value.
        Some("AssignmentExpression") => {
            if let Some(right) = node.get("right") {
                warn_local_state_reads(right, context);
            }
        }
        Some("UpdateExpression") => {}
        _ => match node {
            Value::Object(map) => {
                for (k, v) in map {
                    if matches!(k.as_str(), "type" | "start" | "end" | "loc") {
                        continue;
                    }
                    warn_local_state_reads(v, context);
                }
            }
            Value::Array(arr) => {
                for v in arr {
                    warn_local_state_reads(v, context);
                }
            }
            _ => {}
        },
    }
}

/// Whether a `CallExpression` JSON node's callee is a `$state` / `$derived`
/// (or `.raw` / `.frozen` / `.by`) rune — whose arguments are treated as
/// closures for the purposes of `state_referenced_locally`.
fn callee_is_state_rune(call: &serde_json::Value) -> bool {
    let Some(callee) = call.get("callee") else {
        return false;
    };
    match callee.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => matches!(
            callee.get("name").and_then(|n| n.as_str()),
            Some("$state" | "$derived")
        ),
        Some("MemberExpression") => matches!(
            callee
                .get("object")
                .and_then(|o| o.get("name"))
                .and_then(|n| n.as_str()),
            Some("$state" | "$derived")
        ),
        _ => false,
    }
}
