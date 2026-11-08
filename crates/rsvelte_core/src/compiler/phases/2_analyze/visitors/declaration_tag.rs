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
use super::shared::utils::walk_js_expression_node;
use super::{FragmentOwnerType, VisitorContext};
use crate::ast::template::DeclarationTag;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase3_transform::shared::json_field::Field;

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
        return Err(errors::declaration_tag_no_legacy_mode().at(tag.start, tag.end));
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
                | FragmentOwnerType::SnippetBlock(_, _, _)
                | FragmentOwnerType::SvelteFragment
                | FragmentOwnerType::SvelteBoundary
                | FragmentOwnerType::Component
                | FragmentOwnerType::SvelteSelf
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
        return Err(errors::const_tag_invalid_placement().at(tag.start, tag.end));
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

    // Any other declaration shape carries no init to walk; the JSON fallback
    // this replaced re-tested the same type and so was already a no-op.
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
    }

    // The initializer goes through `walk_js_expression_node`, not the
    // Identifier visitor, so its share of the warning is checked here.
    if context.analysis.runes && !context.is_ignored("state_referenced_locally") {
        let decl_json = tag.declaration.as_json();
        if let Some(decls) = decl_json.field("declarations").and_then(|d| d.as_array()) {
            for (name, arg_type, ident) in decls.iter().filter_map(state_initial) {
                if let Some(idx) = context.analysis.root.get_binding(&name, context.scope) {
                    context
                        .analysis
                        .declaration_tag_state_args
                        .insert(idx, (arg_type, ident));
                }
            }
            let inits: Vec<serde_json::Value> = decls
                .iter()
                .filter_map(|d| d.field("init"))
                .filter(|i| !i.is_null())
                .cloned()
                .collect();
            for init in &inits {
                warn_local_state_reads(init, "closure", context);
            }
        }
    }

    Ok(())
}

/// Upstream visits the declaration with `function_depth` set to the fragment
/// scope's, so a read warns when its binding lives at that depth: closures and
/// `$derived` / `$inspect` arguments are one level deeper and never do, and a
/// read nested inside a `$state(…)` argument warns as `derived`. Upstream's template
/// scopes are non-porous children, so "same depth" is "same scope" here; this
/// scope tree does not count template nesting in `function_depth`.
fn warn_local_state_reads(node: &serde_json::Value, kind: &str, context: &mut VisitorContext) {
    use serde_json::Value;
    match node.field("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            let Some(name) = node.field("name").and_then(|n| n.as_str()) else {
                return;
            };
            let root = &context.analysis.root;
            let warns = root.get_binding(name, context.scope).is_some_and(|idx| {
                let binding = &root.bindings[idx];
                binding.scope_index == context.scope
                    && match context.analysis.declaration_tag_state_args.get(&idx) {
                        Some((arg_type, ident)) => super::identifier::state_read_can_warn_with(
                            binding,
                            Some(arg_type),
                            ident.as_deref(),
                        ),
                        None => super::identifier::state_read_can_warn(binding),
                    }
            });
            if warns {
                let start = node
                    .field("start")
                    .and_then(|v| v.as_u64())
                    .map(|v| v as u32);
                let end = node.field("end").and_then(|v| v.as_u64()).map(|v| v as u32);
                context
                    .analysis
                    .warnings
                    .push(warnings::state_referenced_locally(name, kind, start, end));
            }
        }
        Some("ArrowFunctionExpression")
        | Some("FunctionExpression")
        | Some("FunctionDeclaration") => {}
        Some("CallExpression") => {
            if let Some(callee) = node.field("callee") {
                warn_local_state_reads(callee, kind, context);
            }
            let in_state = match callee_rune(node) {
                Some("$derived" | "$inspect") => return,
                Some("$state" | "$state.raw") => true,
                _ => false,
            };
            if let Some(args) = node.field("arguments").and_then(|a| a.as_array()) {
                for arg in args {
                    // Upstream tests `arguments.includes(path[i + 1])`: a read
                    // that IS the argument is not inside one.
                    let is_direct =
                        arg.field("type").and_then(|t| t.as_str()) == Some("Identifier");
                    let arg_kind = if in_state && !is_direct {
                        "derived"
                    } else {
                        kind
                    };
                    warn_local_state_reads(arg, arg_kind, context);
                }
            }
        }
        // A non-computed property name is not a read.
        Some("MemberExpression") => {
            if let Some(object) = node.field("object") {
                warn_local_state_reads(object, kind, context);
            }
            if node.field("computed").and_then(|c| c.as_bool()) == Some(true)
                && let Some(property) = node.field("property")
            {
                warn_local_state_reads(property, kind, context);
            }
        }
        Some("Property") => {
            if node.field("computed").and_then(|c| c.as_bool()) == Some(true)
                && let Some(key) = node.field("key")
            {
                warn_local_state_reads(key, kind, context);
            }
            if let Some(value) = node.field("value") {
                warn_local_state_reads(value, kind, context);
            }
        }
        Some("AssignmentExpression") => {
            if let Some(right) = node.field("right") {
                warn_local_state_reads(right, kind, context);
            }
        }
        Some("UpdateExpression") => {}
        _ => match node {
            Value::Object(map) => {
                for (k, v) in map {
                    if matches!(k.as_str(), "type" | "start" | "end" | "loc") {
                        continue;
                    }
                    warn_local_state_reads(v, kind, context);
                }
            }
            Value::Array(arr) => {
                for v in arr {
                    warn_local_state_reads(v, kind, context);
                }
            }
            _ => {}
        },
    }
}

/// `(name, argument type, argument identifier)` for a `{let x = $state(arg)}`
/// declarator: the `should_proxy` half of the warning reads the argument,
/// where this binding's `initial_node_type` records the whole call.
fn state_initial(declarator: &serde_json::Value) -> Option<(String, String, Option<String>)> {
    let id = declarator.field("id")?;
    if id.field("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }
    let name = id.field("name")?.as_str()?.to_string();
    let init = declarator.field("init")?;
    if !matches!(callee_rune(init), Some("$state" | "$state.raw")) {
        return None;
    }
    let [arg] = init.field("arguments")?.as_array()?.as_slice() else {
        return None;
    };
    let arg_type = arg.field("type")?.as_str()?;
    if arg_type == "SpreadElement" {
        return None;
    }
    let ident = arg
        .field("name")
        .and_then(|n| n.as_str())
        .map(str::to_string);
    Some((name, arg_type.to_string(), ident))
}

/// The rune a `CallExpression` JSON node calls (`$state`, `$state.raw`,
/// `$derived`, `$inspect`, …), or `None`.
fn callee_rune(call: &serde_json::Value) -> Option<&'static str> {
    let callee = call.field("callee")?;
    let name = match callee.field("type").and_then(|t| t.as_str())? {
        "Identifier" => callee.field("name")?.as_str()?.to_string(),
        "MemberExpression" => format!(
            "{}.{}",
            callee.field("object")?.field("name")?.as_str()?,
            callee.field("property")?.field("name")?.as_str()?
        ),
        _ => return None,
    };
    [
        "$state",
        "$state.raw",
        "$derived",
        "$derived.by",
        "$inspect",
    ]
    .into_iter()
    .find(|rune| *rune == name)
}
