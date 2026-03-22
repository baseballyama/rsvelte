//! Fragment utilities.
//!
//! Functions for working with template fragments.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/fragment.js`.

use rustc_hash::FxHashSet;

use super::super::super::AnalysisError;
use super::super::super::errors;
use super::super::super::utils::{check_graph_for_cycles, extract_svelte_ignore_with_warnings};
use super::super::super::warnings;
use super::super::VisitorContext;
use crate::ast::template::{ConstTag, Fragment, TemplateNode};

/// Result of collecting preceding ignores.
struct PrecedingIgnores {
    /// Codes to ignore.
    ignores: Vec<String>,
    /// Warnings generated during extraction (legacy_code, unknown_code).
    warnings: Vec<warnings::AnalysisWarning>,
}

/// Compute preceding ignores for all nodes in a single O(n) forward pass.
///
/// Returns a vector of Option<(PrecedingIgnores, bool)> for each node.
/// Comments get None. Other nodes get Some((ignores, is_text)).
/// The ignores are collected from consecutive comment/whitespace-text runs
/// that immediately precede each node.
fn compute_all_preceding_ignores(
    nodes: &[TemplateNode],
    runes: bool,
) -> Vec<Option<(PrecedingIgnores, bool)>> {
    let mut result: Vec<Option<(PrecedingIgnores, bool)>> = Vec::with_capacity(nodes.len());

    // Track accumulated ignores from the current run of comments/whitespace
    let mut pending_ignores: Vec<String> = Vec::new();
    let mut pending_warnings: Vec<warnings::AnalysisWarning> = Vec::new();

    for node in nodes {
        match node {
            TemplateNode::Comment(comment) => {
                // Extract svelte-ignore codes and accumulate them
                let extracted = extract_svelte_ignore_with_warnings(&comment.data, runes);
                pending_ignores.extend(extracted.ignores);
                pending_warnings.extend(extracted.warnings);
                // Comments themselves get None
                result.push(None);
            }
            TemplateNode::Text(text) => {
                if text.data.trim().is_empty() {
                    // Whitespace-only text: keep accumulating, but still assign ignores to it
                    result.push(Some((
                        PrecedingIgnores {
                            ignores: pending_ignores.clone(),
                            warnings: pending_warnings.clone(),
                        },
                        true, // is_text
                    )));
                } else {
                    // Non-whitespace text: assign accumulated ignores, then reset
                    result.push(Some((
                        PrecedingIgnores {
                            ignores: std::mem::take(&mut pending_ignores),
                            warnings: std::mem::take(&mut pending_warnings),
                        },
                        true, // is_text
                    )));
                }
            }
            _ => {
                // Non-comment, non-text node: assign accumulated ignores and reset
                result.push(Some((
                    PrecedingIgnores {
                        ignores: std::mem::take(&mut pending_ignores),
                        warnings: std::mem::take(&mut pending_warnings),
                    },
                    false, // not text
                )));
            }
        }
    }

    result
}

/// Analyze a fragment.
pub fn analyze(fragment: &mut Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for cyclical dependencies between ConstTag nodes
    check_const_tag_cycles(&fragment.nodes)?;

    let runes = context.analysis.runes;

    // Pre-compute ignore info for each node in a single O(n) forward pass.
    //
    // The official Svelte (2-analyze/index.js L99) only applies the general ignore mechanism
    // to non-Comment, non-Text nodes. However, Text nodes also need ignore info because
    // the Text visitor checks for bidirectional_control_characters and needs to know if
    // a preceding svelte-ignore comment suppresses it (see Text.js L33-45).
    //
    // We collect preceding ignores for both non-Comment/non-Text nodes AND Text nodes,
    // but only emit legacy_code/unknown_code warnings for non-Comment/non-Text nodes.
    let mut ignore_info = compute_all_preceding_ignores(&fragment.nodes, runes);

    // Emit warnings from svelte-ignore comment validation (legacy_code, unknown_code).
    // These are emitted only once per comment because only the first
    // non-Comment/non-Text node collects from preceding comments.
    for entry in ignore_info.iter().flatten() {
        let (preceding, is_text) = entry;
        // Only emit legacy_code/unknown_code warnings for non-Text nodes
        if !is_text {
            for warning in &preceding.warnings {
                context
                    .analysis
                    .warnings
                    .push(warnings::AnalysisWarning::new(
                        warning.code.clone(),
                        warning.message.clone(),
                    ));
            }
        }
    }

    for (idx, node) in fragment.nodes.iter_mut().enumerate() {
        // Take ownership of ignore codes to avoid cloning
        let ignore_codes = ignore_info[idx]
            .take()
            .map(|(p, _)| p.ignores)
            .unwrap_or_default();
        let has_ignores = !ignore_codes.is_empty();
        if has_ignores {
            // Store ignored codes on element metadata for use during code generation
            match node {
                TemplateNode::RegularElement(elem) => {
                    elem.metadata.ignored_codes = ignore_codes.clone();
                }
                TemplateNode::HtmlTag(tag) => {
                    tag.metadata.ignored_codes = ignore_codes.clone();
                }
                TemplateNode::Component(comp) => {
                    comp.metadata.ignored_codes = ignore_codes.clone();
                }
                TemplateNode::SvelteComponent(comp) => {
                    comp.ignored_codes = ignore_codes.clone();
                }
                _ => {}
            }
            context.push_ignore(ignore_codes);
        }

        // Visit the node
        super::super::visit_node(node, context)?;

        // Pop ignores for this node
        if has_ignores {
            context.pop_ignore();
        }
    }
    Ok(())
}

/// Check for cyclical dependencies between ConstTag nodes.
///
/// This detects when {@const} declarations form a cycle, e.g.:
/// {@const a = b}
/// {@const b = a}
///
/// Corresponds to `sort_const_tags` in `3-transform/utils.js`.
fn check_const_tag_cycles(nodes: &[TemplateNode]) -> Result<(), AnalysisError> {
    // Collect all ConstTag nodes with their bindings and dependencies
    let mut const_tags: Vec<(&ConstTag, Vec<String>, FxHashSet<String>)> = Vec::new();

    for node in nodes {
        if let TemplateNode::ConstTag(tag) = node {
            let decl_node = tag.declaration.as_node();

            // The declaration can be either:
            // 1. A VariableDeclaration (official Svelte structure):
            //    { type: "VariableDeclaration", declarations: [{ type: "VariableDeclarator", id, init }] }
            // 2. An AssignmentExpression (what the Rust parser currently produces):
            //    { type: "AssignmentExpression", left, right }

            let declarations = decl_node.declarations();
            let (bindings, deps) = if !declarations.is_empty() {
                // VariableDeclaration structure
                if let Some(declaration) = declarations.first() {
                    let bindings = if let Some(id) = declaration.id() {
                        let id_value = id.to_value();
                        extract_pattern_identifiers(&id_value)
                    } else {
                        Vec::new()
                    };
                    let deps = if let Some(init) = declaration.init() {
                        let init_value = init.to_value();
                        extract_expression_identifiers(&init_value)
                    } else {
                        FxHashSet::default()
                    };
                    (bindings, deps)
                } else {
                    (Vec::new(), FxHashSet::default())
                }
            } else if decl_node.node_type() == Some("AssignmentExpression") {
                // AssignmentExpression structure
                let bindings = if let Some(left) = decl_node.left() {
                    let left_value = left.to_value();
                    extract_pattern_identifiers(&left_value)
                } else {
                    Vec::new()
                };
                let deps = if let Some(right) = decl_node.right() {
                    let right_value = right.to_value();
                    extract_expression_identifiers(&right_value)
                } else {
                    FxHashSet::default()
                };
                (bindings, deps)
            } else {
                (Vec::new(), FxHashSet::default())
            };

            if !bindings.is_empty() {
                const_tags.push((tag, bindings, deps));
            }
        }
    }

    if const_tags.is_empty() {
        return Ok(());
    }

    // Build a map of binding name -> ConstTag index
    let mut binding_to_tag: std::collections::HashMap<String, usize> =
        std::collections::HashMap::new();
    for (idx, (_, bindings, _)) in const_tags.iter().enumerate() {
        for binding in bindings {
            binding_to_tag.insert(binding.clone(), idx);
        }
    }

    // Build edges: for each tag, create edges from its bindings to its dependencies
    // that are also ConstTag bindings
    let mut edges: Vec<(String, String)> = Vec::new();
    for (_, bindings, deps) in &const_tags {
        for binding in bindings {
            for dep in deps {
                if binding_to_tag.contains_key(dep) {
                    edges.push((binding.clone(), dep.clone()));
                }
            }
        }
    }

    // Check for cycles
    if let Some(cycle) = check_graph_for_cycles::<String>(&edges) {
        // Format the cycle as "a → b → a"
        let cycle_str = cycle.join(" → ");
        return Err(errors::const_tag_cycle(&cycle_str));
    }

    Ok(())
}

/// Extract identifier names from a pattern (id of VariableDeclarator).
fn extract_pattern_identifiers(pattern: &serde_json::Value) -> Vec<String> {
    let mut names = Vec::new();

    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        names.extend(extract_pattern_identifiers(element));
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        names.extend(extract_pattern_identifiers(value));
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                names.extend(extract_pattern_identifiers(left));
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                names.extend(extract_pattern_identifiers(argument));
            }
        }
        _ => {}
    }

    names
}

/// Extract all identifier references from an expression.
fn extract_expression_identifiers(expression: &serde_json::Value) -> FxHashSet<String> {
    let mut identifiers = FxHashSet::default();
    collect_expression_identifiers(expression, &mut identifiers);
    identifiers
}

/// Recursively collect identifier references from an expression.
/// Respects scoping boundaries: does not recurse into function bodies
/// (ArrowFunctionExpression, FunctionExpression, FunctionDeclaration)
/// because those create new scopes where local declarations shadow outer names.
fn collect_expression_identifiers(
    expression: &serde_json::Value,
    identifiers: &mut FxHashSet<String>,
) {
    if let Some(expr_type) = expression.get("type").and_then(|t| t.as_str()) {
        match expr_type {
            "Identifier" => {
                if let Some(name) = expression.get("name").and_then(|n| n.as_str()) {
                    identifiers.insert(name.to_string());
                }
            }
            "MemberExpression" => {
                // Only collect from the object, not the property (unless computed)
                if let Some(object) = expression.get("object") {
                    collect_expression_identifiers(object, identifiers);
                }
                // If computed, also collect from property
                if expression
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && let Some(property) = expression.get("property")
                {
                    collect_expression_identifiers(property, identifiers);
                }
            }
            // Do not recurse into function bodies - they create new scopes
            // where local declarations can shadow outer names without creating cycles.
            "ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration" => {
                // Only collect identifiers from parameter defaults, not the body.
                // Parameters themselves are declarations and shouldn't be collected.
                // We skip the entire function to avoid false cycle detection.
            }
            // Handle Property nodes: only collect from value (and computed key),
            // not from non-computed key identifiers (which are just property names,
            // not variable references).
            "Property" => {
                // For computed keys like `[expr]`, collect from the key expression
                if expression
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && let Some(key) = expression.get("key")
                {
                    collect_expression_identifiers(key, identifiers);
                }
                // Always collect from value
                if let Some(value) = expression.get("value") {
                    collect_expression_identifiers(value, identifiers);
                }
            }
            // Handle AssignmentPattern: collect from both left (pattern) and right (default value)
            "AssignmentPattern" => {
                if let Some(left) = expression.get("left") {
                    collect_expression_identifiers(left, identifiers);
                }
                if let Some(right) = expression.get("right") {
                    collect_expression_identifiers(right, identifiers);
                }
            }
            _ => {
                // Recursively walk all object properties and array elements
                if let Some(obj) = expression.as_object() {
                    for (key, value) in obj {
                        // Skip "type" to avoid confusion
                        if key == "type" {
                            continue;
                        }
                        if value.is_object() {
                            collect_expression_identifiers(value, identifiers);
                        } else if let Some(arr) = value.as_array() {
                            for item in arr {
                                if item.is_object() {
                                    collect_expression_identifiers(item, identifiers);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Mark a subtree as dynamic.
///
/// This is used when an element has attributes that require runtime evaluation,
/// such as custom element attributes or spreads.
pub fn mark_subtree_dynamic(path: &[&TemplateNode]) {
    // In a full implementation, this would mark nodes in the path
    // as requiring dynamic handling during code generation
    for _node in path {
        // Mark each node as dynamic
        // This information is used during the transform phase
    }
}

/// Check if a fragment contains only static content.
pub fn is_static_fragment(fragment: &Fragment) -> bool {
    fragment.nodes.iter().all(is_static_node)
}

/// Check if a node is static (doesn't require runtime evaluation).
pub fn is_static_node(node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(_) => true,
        TemplateNode::Comment(_) => true,
        TemplateNode::RegularElement(element) => {
            // Element is static if all attributes are static and children are static
            let attrs_static = element.attributes.iter().all(|attr| {
                matches!(attr, crate::ast::template::Attribute::Attribute(a)
                    if matches!(&a.value, crate::ast::template::AttributeValue::True(_)
                        | crate::ast::template::AttributeValue::Sequence(_)))
            });

            attrs_static && is_static_fragment(&element.fragment)
        }
        // All other nodes require runtime evaluation
        _ => false,
    }
}

/// Get the first non-whitespace node in a fragment.
pub fn first_significant_node(fragment: &Fragment) -> Option<&TemplateNode> {
    fragment.nodes.iter().find(|node| match node {
        TemplateNode::Text(text) => !text.data.trim().is_empty(),
        TemplateNode::Comment(_) => false,
        _ => true,
    })
}

/// Get the last non-whitespace node in a fragment.
pub fn last_significant_node(fragment: &Fragment) -> Option<&TemplateNode> {
    fragment.nodes.iter().rev().find(|node| match node {
        TemplateNode::Text(text) => !text.data.trim().is_empty(),
        TemplateNode::Comment(_) => false,
        _ => true,
    })
}
