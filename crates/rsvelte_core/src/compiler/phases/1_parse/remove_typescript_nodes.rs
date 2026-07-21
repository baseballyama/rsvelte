//! TypeScript node removal.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/remove_typescript_nodes.js`
//!
//! It provides functionality to remove TypeScript-specific AST nodes from JavaScript code.
//! This is necessary because Svelte needs to work with pure JavaScript, and TypeScript
//! annotations need to be stripped out during parsing.

use serde_json::{Map, Value as JsonValue};

use crate::error::ParseError;

/// Empty statement node (equivalent to `b.empty` in JavaScript)
fn empty_statement() -> JsonValue {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        JsonValue::String("EmptyStatement".to_string()),
    );
    JsonValue::Object(obj)
}

/// Get the start position from a node
fn get_start(node: &JsonValue) -> usize {
    node.get("start")
        .and_then(|v| v.as_u64())
        .map(|n| n as usize)
        .unwrap_or(0)
}

/// Get the end position from a node
fn get_end(node: &JsonValue) -> usize {
    node.get("end")
        .and_then(|v| v.as_u64())
        .map(|n| n as usize)
        .unwrap_or(0)
}

/// Get the node type
fn get_type(node: &JsonValue) -> Option<&str> {
    node.get("type").and_then(|v| v.as_str())
}

/// Remove the first 'this' parameter from function parameters
fn remove_this_param(node: &mut JsonValue) {
    if let Some(params) = node.get_mut("params").and_then(|v| v.as_array_mut())
        && let Some(first) = params.first()
        && get_type(first) == Some("Identifier")
        && let Some(name) = first.get("name").and_then(|v| v.as_str())
        && name == "this"
    {
        params.remove(0);
    }
}

/// Remove TypeScript-specific fields from a node
fn remove_typescript_fields(node: &mut JsonValue) {
    // `optional` is reused by JS optional chaining (`a?.b`, `a?.()`), so only the
    // TypeScript optional marker (`x?: T`, `m?(): T`, optional fields) is stripped —
    // never the `optional` flag on a MemberExpression / CallExpression. Mirrors the
    // upstream `_` visitor guard in `remove_typescript_nodes.js` (Svelte 5.56.4).
    let strip_optional = !matches!(
        get_type(node),
        Some("MemberExpression") | Some("CallExpression")
    );
    if let Some(obj) = node.as_object_mut() {
        obj.remove("typeAnnotation");
        obj.remove("typeParameters");
        obj.remove("typeArguments");
        obj.remove("returnType");
        obj.remove("accessibility");
        obj.remove("readonly");
        obj.remove("definite");
        obj.remove("override");
        if strip_optional {
            obj.remove("optional");
        }
    }
}

/// Walk and transform an AST node, removing TypeScript nodes
///
/// # Arguments
/// * `node` - The AST node to transform
/// * `path` - The path to the current node (for context in error reporting)
///
/// # Returns
/// The transformed node, or an empty statement if the node should be removed
pub fn remove_typescript_nodes(node: &mut JsonValue, path: &[&str]) -> Result<(), ParseError> {
    let node_type = get_type(node).unwrap_or("");

    match node_type {
        // Decorators are not supported
        "Decorator" => {
            let start = get_start(node);
            let end = get_end(node);
            return Err(ParseError::typescript_invalid_feature(
                "decorators (related TSC proposal is not stage 4 yet)",
                (start, end),
            ));
        }

        // Filter out type-only imports
        "ImportDeclaration" => {
            if let Some(import_kind) = node.get("importKind").and_then(|v| v.as_str())
                && import_kind == "type"
            {
                *node = empty_statement();
                return Ok(());
            }

            // Filter type-only specifiers
            if let Some(specifiers) = node.get_mut("specifiers").and_then(|v| v.as_array_mut())
                && !specifiers.is_empty()
            {
                specifiers.retain(|s| s.get("importKind").and_then(|v| v.as_str()) != Some("type"));

                if specifiers.is_empty() {
                    *node = empty_statement();
                    return Ok(());
                }
            }
        }

        // Filter out type-only exports
        "ExportNamedDeclaration" => {
            if let Some(export_kind) = node.get("exportKind").and_then(|v| v.as_str())
                && export_kind == "type"
            {
                *node = empty_statement();
                return Ok(());
            }

            // Check if declaration became empty after visiting
            if let Some(declaration) = node.get("declaration")
                && get_type(declaration) == Some("EmptyStatement")
            {
                *node = empty_statement();
                return Ok(());
            }

            // Filter type-only specifiers
            if let Some(specifiers) = node.get_mut("specifiers").and_then(|v| v.as_array_mut())
                && !specifiers.is_empty()
            {
                specifiers.retain(|s| s.get("exportKind").and_then(|v| v.as_str()) != Some("type"));

                if specifiers.is_empty() {
                    *node = empty_statement();
                    return Ok(());
                }
            }
        }

        "ExportDefaultDeclaration" => {
            if let Some(export_kind) = node.get("exportKind").and_then(|v| v.as_str())
                && export_kind == "type"
            {
                *node = empty_statement();
                return Ok(());
            }
        }

        "ExportAllDeclaration" => {
            if let Some(export_kind) = node.get("exportKind").and_then(|v| v.as_str())
                && export_kind == "type"
            {
                *node = empty_statement();
                return Ok(());
            }
        }

        // Check for accessor fields (not stage 4)
        "PropertyDefinition" => {
            if let Some(accessor) = node.get("accessor").and_then(|v| v.as_bool())
                && accessor
            {
                let start = get_start(node);
                let end = get_end(node);
                return Err(ParseError::typescript_invalid_feature(
                    "accessor fields (related TSC proposal is not stage 4 yet)",
                    (start, end),
                ));
            }
        }

        // Unwrap TypeScript type assertion expressions
        "TSAsExpression"
        | "TSSatisfiesExpression"
        | "TSNonNullExpression"
        | "TSTypeAssertion"
        | "TSInstantiationExpression" => {
            if let Some(expression) = node.get("expression").cloned() {
                *node = expression;
            }
        }

        // Remove type-only declarations
        "TSInterfaceDeclaration" | "TSTypeAliasDeclaration" | "TSDeclareFunction" => {
            *node = empty_statement();
            return Ok(());
        }

        // Enums are not supported
        "TSEnumDeclaration" => {
            let start = get_start(node);
            let end = get_end(node);
            return Err(ParseError::typescript_invalid_feature(
                "enums",
                (start, end),
            ));
        }

        // Handle parameter properties
        "TSParameterProperty" => {
            let has_modifiers = node
                .get("readonly")
                .and_then(|v| v.as_bool())
                .unwrap_or(false)
                || node.get("accessibility").is_some();

            if has_modifiers {
                let start = get_start(node);
                let end = get_end(node);
                return Err(ParseError::typescript_invalid_feature(
                    "accessibility modifiers on constructor parameters",
                    (start, end),
                ));
            }

            if let Some(parameter) = node.get("parameter").cloned() {
                *node = parameter;
            }
        }

        // Remove 'this' parameter from functions
        "FunctionExpression" | "FunctionDeclaration" => {
            remove_this_param(node);
        }

        // Filter out declared properties from class bodies
        "ClassBody" => {
            if let Some(body) = node.get_mut("body").and_then(|v| v.as_array_mut()) {
                body.retain(|child| {
                    if get_type(child) == Some("PropertyDefinition") {
                        !child
                            .get("declare")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                    } else {
                        true
                    }
                });
            }
        }

        // Handle class declarations
        "ClassDeclaration" => {
            if let Some(declare) = node.get("declare").and_then(|v| v.as_bool())
                && declare
            {
                *node = empty_statement();
                return Ok(());
            }

            if let Some(obj) = node.as_object_mut() {
                obj.remove("abstract");
                obj.remove("implements");
                obj.remove("superTypeArguments");
            }
        }

        // Handle class expressions
        "ClassExpression" => {
            if let Some(obj) = node.as_object_mut() {
                obj.remove("implements");
                obj.remove("superTypeArguments");
            }
        }

        // Remove abstract methods
        "MethodDefinition" => {
            if let Some(is_abstract) = node.get("abstract").and_then(|v| v.as_bool())
                && is_abstract
            {
                *node = empty_statement();
                return Ok(());
            }
        }

        // Remove declared variables
        "VariableDeclaration" => {
            if let Some(declare) = node.get("declare").and_then(|v| v.as_bool())
                && declare
            {
                *node = empty_statement();
                return Ok(());
            }
        }

        // Handle TypeScript namespaces/modules
        "TSModuleDeclaration" => {
            if node.get("body").is_none() {
                *node = empty_statement();
                return Ok(());
            }

            // Check if namespace contains non-type nodes
            if let Some(body) = node
                .get("body")
                .and_then(|b| b.get("body"))
                .and_then(|b| b.as_array())
            {
                let has_non_type_nodes = body.iter().any(|entry| {
                    let t = get_type(entry).unwrap_or("");
                    // Type-only nodes that are always safe to strip
                    if t == "EmptyStatement"
                        || t == "TSInterfaceDeclaration"
                        || t == "TSTypeAliasDeclaration"
                        || t == "TSEnumDeclaration"
                    {
                        return false;
                    }
                    // ExportNamedDeclaration wrapping a type-only declaration is also safe
                    if t == "ExportNamedDeclaration" {
                        // Check if it's `export type ...` (exportKind == "type")
                        if entry
                            .get("exportKind")
                            .and_then(|k| k.as_str())
                            .is_some_and(|k| k == "type")
                        {
                            return false;
                        }
                        // Check if the declaration is type-only
                        if let Some(decl) = entry.get("declaration") {
                            let decl_type = get_type(decl).unwrap_or("");
                            if decl_type == "TSInterfaceDeclaration"
                                || decl_type == "TSTypeAliasDeclaration"
                                || decl_type == "TSEnumDeclaration"
                            {
                                return false;
                            }
                        }
                    }
                    true
                });

                if has_non_type_nodes {
                    let start = get_start(node);
                    let end = get_end(node);
                    return Err(ParseError::typescript_invalid_feature(
                        "namespaces with non-type nodes",
                        (start, end),
                    ));
                }
            }

            *node = empty_statement();
            return Ok(());
        }

        _ => {}
    }

    // Remove TypeScript-specific fields from all nodes
    remove_typescript_fields(node);

    // Recursively process child nodes
    visit_children(node, path)?;

    Ok(())
}

/// Visit all children of a node recursively
fn visit_children(node: &mut JsonValue, path: &[&str]) -> Result<(), ParseError> {
    if let Some(obj) = node.as_object_mut() {
        for (key, value) in obj.iter_mut() {
            let mut new_path = path.to_vec();
            new_path.push(key.as_str());

            match value {
                JsonValue::Object(_) => {
                    remove_typescript_nodes(value, &new_path)?;
                }
                JsonValue::Array(arr) => {
                    for item in arr.iter_mut() {
                        if item.is_object() {
                            remove_typescript_nodes(item, &new_path)?;
                        }
                    }
                }
                _ => {}
            }
        }
    }

    Ok(())
}

// ───────────────────────────────────────────────────────────────────────────
// Typed transform (arena-based, no serde_json::Value round-trip)
// ───────────────────────────────────────────────────────────────────────────
//
// `remove_typescript_nodes_typed` is the typed sibling of `remove_typescript_nodes`.
// It mutates the arena-backed `JsNode` tree in place so that a TS `<script>` can
// stay `Expression::Typed` through Phase-2 analyze without ever building a
// `serde_json::Value` for the whole program (the expensive `as_json()` round
// trip the old Value path required).
//
// Design notes (see also the parser conversion in `read/expression.rs`):
//   * The typed conversion is taken ONLY for clean plain-JS shapes. Every
//     TS-messy construct — `declare`/`abstract`/`accessor`/decorators classes &
//     members, interfaces, type aliases, declare functions, TS-modifier params,
//     etc. — falls back to `JsNode::Raw(Value)`. So for any `JsNode::Raw` we
//     simply delegate to the existing Value mutator, which handles that whole
//     subtree with the exact same semantics (including errors).
//   * TS expression wrappers (`as`/`satisfies`/`!`/`<T>`/instantiation) are
//     already unwrapped at parse time, and the typed enum has no
//     `returnType`/`accessibility`/`readonly`/… fields, so there is nothing to
//     strip there.
//   * The only TS cases that CAN reach a typed node are: type-only
//     import/export (whole or per-specifier), `declare` variable declarations,
//     `TSEnumDeclaration`, and `TSModuleDeclaration` (namespace) — handled
//     structurally below.
//   * The opaque `type_annotation` blobs on Identifier/ObjectPattern/ArrayPattern
//     are intentionally NOT cleared: analyze never walks into them and the
//     stripped program is never serialized as compile output, so leaving them is
//     byte-identical for the only consumer (analyze).
//   * The `Program.ignore_comment_map` is preserved automatically: we never
//     rebuild the `Program` node, only mutate its body entries in place.

use crate::ast::arena::{IdRange, JsNodeId, ParseArena};
use crate::ast::typed_expr::JsNode;

/// Recurse the typed TS strip into the arena node addressed by `id`.
///
/// Centralizes the single documented `unsafe` access used by the recursion.
#[inline]
fn recurse_node_id(id: JsNodeId, arena: &ParseArena) -> Result<(), ParseError> {
    // SAFETY: the parse arena is single-threaded (`!Sync`) and the typed AST is
    // an acyclic tree, so no two recursion frames address the same node; the
    // `&mut JsNode` returned here is the only live mutable borrow of that node.
    // The transform only ever appends to the arena (`alloc_js_*`), and the arena
    // stores each node in its own `Box` / each child range in its own boxed
    // slice, so those appends never move data behind references held by
    // outer recursion frames.
    let node = unsafe { arena.get_js_node_mut(id) };
    remove_typescript_nodes_typed(node, arena)
}

/// Recurse the typed TS strip into every child of `range`.
#[inline]
fn recurse_range(range: IdRange, arena: &ParseArena) -> Result<(), ParseError> {
    if range.is_empty() {
        return Ok(());
    }
    // SAFETY: see `recurse_node_id` — single-threaded, acyclic, append-only.
    // The returned `&mut [JsNode]` points into a stable boxed slice that the
    // append-only `alloc_js_*` calls performed during recursion never move.
    let children = unsafe { arena.get_js_children_mut(range) };
    for child in children {
        remove_typescript_nodes_typed(child, arena)?;
    }
    Ok(())
}

/// Build a typed `EmptyStatement` carrying `node`'s span (the span is irrelevant
/// to analyze, which treats every `EmptyStatement` as a no-op, but we keep it for
/// faithfulness).
#[inline]
fn typed_empty_statement(node: &JsNode) -> JsNode {
    JsNode::EmptyStatement {
        start: node.start().unwrap_or(0),
        end: node.end().unwrap_or(0),
        loc: None,
    }
}

/// Inner `expression` child id of a TS assertion wrapper node.
#[inline]
fn ts_wrapper_expression_id(node: &JsNode) -> Option<JsNodeId> {
    match node {
        JsNode::TSAsExpression { expression, .. }
        | JsNode::TSSatisfiesExpression { expression, .. }
        | JsNode::TSNonNullExpression { expression, .. }
        | JsNode::TSTypeAssertion { expression, .. }
        | JsNode::TSInstantiationExpression { expression, .. } => Some(*expression),
        _ => None,
    }
}

/// Typed entry point. Mirrors [`remove_typescript_nodes`] but operates directly
/// on the arena-backed typed tree.
pub fn remove_typescript_nodes_typed(
    node: &mut JsNode,
    arena: &ParseArena,
) -> Result<(), ParseError> {
    match node.node_type() {
        // Decorators are not supported.
        Some("Decorator") => {
            return Err(ParseError::typescript_invalid_feature(
                "decorators (related TSC proposal is not stage 4 yet)",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }

        // Enums are not supported.
        Some("TSEnumDeclaration") => {
            return Err(ParseError::typescript_invalid_feature(
                "enums",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }

        // TS parameter properties (`constructor(private x)` / `readonly x`) are
        // not supported. The typed `TSParameterProperty` node is only ever built
        // when a modifier is present, so its presence is always an error
        // (mirrors the Value mutator's `has_modifiers` check).
        Some("TSParameterProperty") => {
            return Err(ParseError::typescript_invalid_feature(
                "accessibility modifiers on constructor parameters",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }

        // `accessor` class fields are not supported (mirrors the Value mutator).
        Some("PropertyDefinition") => {
            if let JsNode::PropertyDefinition {
                accessor: true,
                start,
                end,
                ..
            } = node
            {
                return Err(ParseError::typescript_invalid_feature(
                    "accessor fields (related TSC proposal is not stage 4 yet)",
                    (*start as usize, *end as usize),
                ));
            }
        }

        // Namespaces / modules: error if they contain non-type nodes, else strip.
        Some("TSModuleDeclaration") => {
            return strip_ts_module_declaration_typed(node, arena);
        }

        // Filter out type-only imports.
        Some("ImportDeclaration") => {
            return strip_import_declaration_typed(node, arena);
        }

        // Filter out type-only exports.
        Some("ExportNamedDeclaration") => {
            return strip_export_named_declaration_typed(node, arena);
        }

        // Remove declared variables (`declare const x`).
        Some("VariableDeclaration") => {
            if let JsNode::VariableDeclaration { declare: true, .. } = node {
                *node = typed_empty_statement(node);
                return Ok(());
            }
        }

        // Remove declared classes (`declare class C`). The typed class path is
        // only taken for non-declare classes, so this is defensive.
        Some("ClassDeclaration") => {
            if let JsNode::ClassDeclaration { declare: true, .. } = node {
                *node = typed_empty_statement(node);
                return Ok(());
            }
        }

        // Remove the leading `this` parameter from functions. (The typed function
        // path emits only `params.items`, so this is effectively defensive — a
        // typed function never actually carries a `this` param.)
        Some("FunctionExpression") | Some("FunctionDeclaration") => {
            remove_this_param_typed(node, arena);
        }

        // TS assertion wrappers (`as`/`satisfies`/`!`/`<T>`/instantiation): the
        // parser keeps them for `parse()` fidelity; here we unwrap to the inner
        // expression (mirrors upstream `remove_typescript_nodes`), then re-run the
        // strip on the replacement (it may itself be another TS wrapper, e.g.
        // `x! as const`).
        Some("TSAsExpression")
        | Some("TSSatisfiesExpression")
        | Some("TSNonNullExpression")
        | Some("TSTypeAssertion")
        | Some("TSInstantiationExpression") => {
            let inner_id = ts_wrapper_expression_id(node);
            if let Some(inner_id) = inner_id {
                *node = arena.get_js_node(inner_id).clone();
                return remove_typescript_nodes_typed(node, arena);
            }
        }

        _ => {}
    }

    // Recurse into children.
    visit_typed_children(node, arena)
}

/// Strip a `TSModuleDeclaration` (typed). Mirrors the Value-mutator namespace
/// logic: error when the body contains non-type nodes, otherwise replace with an
/// empty statement.
fn strip_ts_module_declaration_typed(
    node: &mut JsNode,
    arena: &ParseArena,
) -> Result<(), ParseError> {
    let body_id = match node {
        JsNode::TSModuleDeclaration { body, .. } => *body,
        _ => None,
    };

    if let Some(body_id) = body_id {
        // Typed module body is a `BlockStatement { body: [...] }` wrapper.
        let block = arena.get_js_node(body_id);
        let stmts_range = match block {
            JsNode::BlockStatement { body, .. } => *body,
            _ => IdRange::empty(),
        };
        let stmts = arena.get_js_children(stmts_range);
        let has_non_type_nodes = stmts
            .iter()
            .any(|entry| !is_type_only_namespace_member(entry));
        if has_non_type_nodes {
            return Err(ParseError::typescript_invalid_feature(
                "namespaces with non-type nodes",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }
    }

    *node = typed_empty_statement(node);
    Ok(())
}

/// Classify a single namespace-body member as "safe to strip" (type-only).
/// Mirrors the Value mutator's per-entry predicate (lines for `TSModuleDeclaration`).
fn is_type_only_namespace_member(entry: &JsNode) -> bool {
    match entry.node_type() {
        Some("EmptyStatement")
        | Some("TSInterfaceDeclaration")
        | Some("TSTypeAliasDeclaration")
        | Some("TSEnumDeclaration") => true,
        Some("ExportNamedDeclaration") => {
            // `export type ...`
            if let JsNode::ExportNamedDeclaration { export_kind, .. } = entry
                && export_kind.as_deref() == Some("type")
            {
                return true;
            }
            false
        }
        _ => false,
    }
}

/// Strip type-only imports (typed). Whole `import type {...}` → empty; otherwise
/// drop `import { type X }` specifiers, emptying the import if none remain.
fn strip_import_declaration_typed(node: &mut JsNode, arena: &ParseArena) -> Result<(), ParseError> {
    let (is_type, spec_range) = match node {
        JsNode::ImportDeclaration {
            import_kind,
            specifiers,
            ..
        } => (import_kind.as_deref() == Some("type"), *specifiers),
        _ => (false, IdRange::empty()),
    };

    if is_type {
        *node = typed_empty_statement(node);
        return Ok(());
    }

    if !spec_range.is_empty() {
        let specs = arena.get_js_children(spec_range);
        let any_type = specs.iter().any(specifier_import_kind_is_type);
        if any_type {
            let kept: Vec<JsNode> = specs
                .iter()
                .filter(|s| !specifier_import_kind_is_type(s))
                .cloned()
                .collect();
            if kept.is_empty() {
                *node = typed_empty_statement(node);
                return Ok(());
            }
            let new_range = arena.alloc_js_children(kept);
            if let JsNode::ImportDeclaration { specifiers, .. } = node {
                *specifiers = new_range;
            }
        }
    }
    Ok(())
}

/// Strip type-only named exports (typed).
fn strip_export_named_declaration_typed(
    node: &mut JsNode,
    arena: &ParseArena,
) -> Result<(), ParseError> {
    let (is_type, declaration, spec_range) = match node {
        JsNode::ExportNamedDeclaration {
            export_kind,
            declaration,
            specifiers,
            ..
        } => (
            export_kind.as_deref() == Some("type"),
            *declaration,
            *specifiers,
        ),
        _ => (false, None, IdRange::empty()),
    };

    if is_type {
        *node = typed_empty_statement(node);
        return Ok(());
    }

    // If the declaration is already an EmptyStatement, the whole export is empty.
    if let Some(decl_id) = declaration
        && arena.get_js_node(decl_id).node_type() == Some("EmptyStatement")
    {
        *node = typed_empty_statement(node);
        return Ok(());
    }

    // Filter type-only specifiers.
    if !spec_range.is_empty() {
        let specs = arena.get_js_children(spec_range);
        let any_type = specs.iter().any(specifier_export_kind_is_type);
        if any_type {
            let kept: Vec<JsNode> = specs
                .iter()
                .filter(|s| !specifier_export_kind_is_type(s))
                .cloned()
                .collect();
            if kept.is_empty() {
                *node = typed_empty_statement(node);
                return Ok(());
            }
            let new_range = arena.alloc_js_children(kept);
            if let JsNode::ExportNamedDeclaration { specifiers, .. } = node {
                *specifiers = new_range;
            }
        }
    }

    // Recurse into the declaration (e.g. `export interface Foo` → declaration is a
    // Raw TSInterfaceDeclaration that the Value mutator turns into EmptyStatement).
    if let Some(decl_id) = declaration {
        recurse_node_id(decl_id, arena)?;
    }
    Ok(())
}

#[inline]
fn specifier_import_kind_is_type(spec: &JsNode) -> bool {
    match spec {
        JsNode::ImportSpecifier { import_kind, .. } => import_kind.as_deref() == Some("type"),
        _ => false,
    }
}

#[inline]
fn specifier_export_kind_is_type(spec: &JsNode) -> bool {
    match spec {
        JsNode::ExportSpecifier { export_kind, .. } => export_kind.as_deref() == Some("type"),
        _ => false,
    }
}

/// Remove a leading `this` parameter from a typed function node, if present.
fn remove_this_param_typed(node: &mut JsNode, arena: &ParseArena) {
    let params = match node {
        JsNode::FunctionExpression { params, .. } | JsNode::FunctionDeclaration { params, .. } => {
            *params
        }
        _ => return,
    };
    if params.is_empty() {
        return;
    }
    let items = arena.get_js_children(params);
    let first_is_this =
        matches!(items.first(), Some(JsNode::Identifier { name, .. }) if name == "this");
    if !first_is_this {
        return;
    }
    let kept: Vec<JsNode> = items.iter().skip(1).cloned().collect();
    let new_range = arena.alloc_js_children(kept);
    match node {
        JsNode::FunctionExpression { params, .. } | JsNode::FunctionDeclaration { params, .. } => {
            *params = new_range;
        }
        _ => {}
    }
}

/// Recurse into every JS child of a typed node.
fn visit_typed_children(node: &mut JsNode, arena: &ParseArena) -> Result<(), ParseError> {
    // Recurse into a single child by id.
    macro_rules! rec_id {
        ($id:expr) => {{
            recurse_node_id($id, arena)?;
        }};
    }
    macro_rules! rec_opt {
        ($opt:expr) => {{
            if let Some(id) = $opt {
                rec_id!(id);
            }
        }};
    }
    // Recurse into every child of a range.
    macro_rules! rec_range {
        ($range:expr) => {{
            recurse_range($range, arena)?;
        }};
    }

    match node {
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. }
        | JsNode::AssignmentExpression { left, right, .. }
        | JsNode::AssignmentPattern { left, right, .. }
        | JsNode::ForOfStatement { left, right, .. }
        | JsNode::ForInStatement { left, right, .. } => {
            let (l, r) = (*left, *right);
            rec_id!(l);
            rec_id!(r);
        }
        JsNode::UnaryExpression { argument, .. }
        | JsNode::UpdateExpression { argument, .. }
        | JsNode::AwaitExpression { argument, .. }
        | JsNode::ThrowStatement { argument, .. }
        | JsNode::SpreadElement { argument, .. }
        | JsNode::RestElement { argument, .. } => {
            rec_id!(*argument);
        }
        JsNode::YieldExpression { argument, .. } | JsNode::ReturnStatement { argument, .. } => {
            rec_opt!(*argument);
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            let (t, c, a) = (*test, *consequent, *alternate);
            rec_id!(t);
            rec_id!(c);
            rec_id!(a);
        }
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            let (t, c, a) = (*test, *consequent, *alternate);
            rec_id!(t);
            rec_id!(c);
            rec_opt!(a);
        }
        JsNode::CallExpression {
            callee, arguments, ..
        }
        | JsNode::NewExpression {
            callee, arguments, ..
        } => {
            let (c, args) = (*callee, *arguments);
            rec_id!(c);
            rec_range!(args);
        }
        JsNode::MemberExpression {
            object, property, ..
        } => {
            let (o, p) = (*object, *property);
            rec_id!(o);
            rec_id!(p);
        }
        JsNode::MetaProperty { meta, property, .. } => {
            let (m, p) = (*meta, *property);
            rec_id!(m);
            rec_id!(p);
        }
        JsNode::FunctionExpression {
            id, params, body, ..
        }
        | JsNode::FunctionDeclaration {
            id, params, body, ..
        } => {
            let (i, p, b) = (*id, *params, *body);
            rec_opt!(i);
            rec_range!(p);
            rec_opt!(b);
        }
        JsNode::ArrowFunctionExpression {
            id, params, body, ..
        } => {
            let (i, p, b) = (*id, *params, *body);
            rec_opt!(i);
            rec_range!(p);
            rec_id!(b);
        }
        JsNode::ClassExpression {
            id,
            super_class,
            body,
            ..
        } => {
            let (i, s, b) = (*id, *super_class, *body);
            rec_opt!(i);
            rec_opt!(s);
            rec_id!(b);
        }
        JsNode::ClassDeclaration {
            id,
            super_class,
            body,
            decorators,
            ..
        } => {
            // `decorators` carries `JsNode::Decorator` entries that must raise the
            // "decorators not supported" error when present.
            let (i, s, b, d) = (*id, *super_class, *body, *decorators);
            rec_opt!(i);
            rec_opt!(s);
            rec_id!(b);
            rec_range!(d);
        }
        JsNode::SequenceExpression { expressions, .. } => {
            rec_range!(*expressions);
        }
        JsNode::TemplateLiteral {
            quasis,
            expressions,
            ..
        } => {
            let (q, e) = (*quasis, *expressions);
            rec_range!(q);
            rec_range!(e);
        }
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            let (t, q) = (*tag, *quasi);
            rec_id!(t);
            rec_id!(q);
        }
        JsNode::ArrayExpression { elements, .. } | JsNode::ArrayPattern { elements, .. } => {
            for el in elements.iter_mut().flatten() {
                remove_typescript_nodes_typed(el, arena)?;
            }
        }
        JsNode::ObjectExpression { properties, .. } | JsNode::ObjectPattern { properties, .. } => {
            rec_range!(*properties);
        }
        JsNode::ImportExpression { source, .. } => {
            rec_id!(*source);
        }
        JsNode::ChainExpression { expression, .. }
        | JsNode::ExpressionStatement { expression, .. } => {
            rec_id!(*expression);
        }
        JsNode::Property { key, value, .. } | JsNode::MethodDefinition { key, value, .. } => {
            let (k, v) = (*key, *value);
            rec_id!(k);
            rec_id!(v);
        }
        JsNode::PropertyDefinition { key, value, .. } => {
            let (k, v) = (*key, *value);
            rec_id!(k);
            rec_opt!(v);
        }
        JsNode::Program { body, .. }
        | JsNode::BlockStatement { body, .. }
        | JsNode::ClassBody { body, .. }
        | JsNode::StaticBlock { body, .. } => {
            rec_range!(*body);
        }
        JsNode::VariableDeclaration { declarations, .. } => {
            rec_range!(*declarations);
        }
        JsNode::VariableDeclarator { id, init, .. } => {
            let (i, n) = (*id, *init);
            rec_id!(i);
            rec_opt!(n);
        }
        JsNode::ForStatement {
            init,
            test,
            update,
            body,
            ..
        } => {
            let (i, t, u, b) = (*init, *test, *update, *body);
            rec_opt!(i);
            rec_opt!(t);
            rec_opt!(u);
            rec_id!(b);
        }
        JsNode::WhileStatement { test, body, .. } | JsNode::DoWhileStatement { test, body, .. } => {
            let (t, b) = (*test, *body);
            rec_id!(t);
            rec_id!(b);
        }
        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            let (bl, h, f) = (*block, *handler, *finalizer);
            rec_id!(bl);
            rec_opt!(h);
            rec_opt!(f);
        }
        JsNode::CatchClause { param, body, .. } => {
            let (p, b) = (*param, *body);
            rec_opt!(p);
            rec_id!(b);
        }
        JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } => {
            let (d, c) = (*discriminant, *cases);
            rec_id!(d);
            rec_range!(c);
        }
        JsNode::SwitchCase {
            test, consequent, ..
        } => {
            let (t, c) = (*test, *consequent);
            rec_opt!(t);
            rec_range!(c);
        }
        JsNode::LabeledStatement { label, body, .. } => {
            let (l, b) = (*label, *body);
            rec_id!(l);
            rec_id!(b);
        }
        JsNode::ExportDefaultDeclaration { declaration, .. } => {
            rec_id!(*declaration);
        }
        // Childless / type-only / handled-elsewhere variants: nothing to recurse.
        _ => {}
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_remove_type_import() {
        let mut node = json!({
            "type": "ImportDeclaration",
            "importKind": "type",
            "start": 0,
            "end": 10
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();
        assert_eq!(get_type(&node), Some("EmptyStatement"));
    }

    #[test]
    fn test_remove_typescript_fields() {
        let mut node = json!({
            "type": "Identifier",
            "name": "foo",
            "typeAnnotation": {"type": "TSTypeAnnotation"},
            "start": 0,
            "end": 3
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();
        assert!(node.get("typeAnnotation").is_none());
        assert_eq!(node.get("name").and_then(|v| v.as_str()), Some("foo"));
    }

    #[test]
    fn test_unwrap_as_expression() {
        let mut node = json!({
            "type": "TSAsExpression",
            "expression": {
                "type": "Identifier",
                "name": "x"
            },
            "start": 0,
            "end": 10
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();
        assert_eq!(get_type(&node), Some("Identifier"));
        assert_eq!(node.get("name").and_then(|v| v.as_str()), Some("x"));
    }

    #[test]
    fn test_decorator_error() {
        let mut node = json!({
            "type": "Decorator",
            "start": 0,
            "end": 10
        });

        let result = remove_typescript_nodes(&mut node, &[]);
        assert!(result.is_err());
        match result {
            Err(ParseError::SvelteError { code, message, .. }) => {
                assert_eq!(code, "typescript_invalid_feature");
                assert!(message.contains("decorators"));
            }
            _ => panic!("Expected typescript_invalid_feature error"),
        }
    }

    #[test]
    fn test_remove_this_parameter() {
        let mut node = json!({
            "type": "FunctionExpression",
            "params": [
                {"type": "Identifier", "name": "this"},
                {"type": "Identifier", "name": "x"}
            ],
            "start": 0,
            "end": 20
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();

        let params = node.get("params").and_then(|v| v.as_array()).unwrap();
        assert_eq!(params.len(), 1);
        assert_eq!(params[0].get("name").and_then(|v| v.as_str()), Some("x"));
    }
}
