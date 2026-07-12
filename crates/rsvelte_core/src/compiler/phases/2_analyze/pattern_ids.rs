//! Shared walkers for destructuring-pattern identifier collection.
//!
//! Consolidates several byte-identical copies that previously lived across
//! `mod.rs`, `scope_builder.rs`, `visitors/each_block.rs`, and
//! `visitors/regular_element.rs`. Each walker collects the bound identifier
//! names from a binding pattern in source order, descending into
//! `ObjectPattern` / `ArrayPattern` / `AssignmentPattern` / `RestElement`.

use serde_json::Value;

use crate::ast::arena::ParseArena;
use crate::ast::typed_expr::JsNode;

/// Collect bound identifier names from a destructuring pattern (typed).
///
/// For `ObjectPattern`, a `RestElement` property contributes its `argument`
/// while a `Property` contributes its `value`; array holes are skipped.
pub(crate) fn collect_pattern_identifiers(
    node: &JsNode,
    arena: &ParseArena,
    out: &mut Vec<String>,
) {
    match node {
        JsNode::Identifier { name, .. } => out.push(name.to_string()),
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::Property { value, .. } => {
                        collect_pattern_identifiers(arena.get_js_node(*value), arena, out);
                    }
                    JsNode::RestElement { argument, .. } => {
                        collect_pattern_identifiers(arena.get_js_node(*argument), arena, out);
                    }
                    _ => {}
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                collect_pattern_identifiers(elem, arena, out);
            }
        }
        JsNode::RestElement { argument, .. } => {
            collect_pattern_identifiers(arena.get_js_node(*argument), arena, out);
        }
        JsNode::AssignmentPattern { left, .. } => {
            collect_pattern_identifiers(arena.get_js_node(*left), arena, out);
        }
        _ => {}
    }
}

/// Collect bound identifier names from a destructuring pattern (JSON).
///
/// JSON twin of [`collect_pattern_identifiers`] for call sites that only have
/// a `serde_json::Value` (template expressions where no `ParseArena` is
/// threaded). Enumeration order and duplicate handling match the typed walker.
pub(crate) fn collect_pattern_identifiers_json(node: &Value, names: &mut Vec<String>) {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = node.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if prop.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                        if let Some(arg) = prop.get("argument") {
                            collect_pattern_identifiers_json(arg, names);
                        }
                    } else if let Some(value) = prop.get("value") {
                        collect_pattern_identifiers_json(value, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        collect_pattern_identifiers_json(elem, names);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = node.get("left") {
                collect_pattern_identifiers_json(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = node.get("argument") {
                collect_pattern_identifiers_json(arg, names);
            }
        }
        _ => {}
    }
}

/// Resolve the root identifier name of a binding expression (typed).
///
/// For `selected` → `"selected"`, `selected.done` → `"selected"`,
/// `items[0]` → `"items"`. Corresponds to the official compiler's `object()`.
pub(crate) fn base_identifier_name(node: &JsNode, arena: &ParseArena) -> Option<String> {
    match node {
        JsNode::Identifier { name, .. } => Some(name.to_string()),
        JsNode::MemberExpression { object, .. } => {
            base_identifier_name(arena.get_js_node(*object), arena)
        }
        _ => None,
    }
}
