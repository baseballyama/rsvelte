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

/// Collect svelte-ignore codes from preceding comments in a fragment.
///
/// This looks back through the nodes before the current index to find
/// comments that precede the node (possibly separated by text nodes).
fn collect_preceding_ignores(nodes: &[TemplateNode], idx: usize, runes: bool) -> PrecedingIgnores {
    let mut ignores = Vec::new();
    let mut all_warnings = Vec::new();

    // Look backwards through preceding nodes
    for i in (0..idx).rev() {
        match &nodes[i] {
            TemplateNode::Comment(comment) => {
                // Extract svelte-ignore codes from this comment
                let result = extract_svelte_ignore_with_warnings(&comment.data, runes);
                ignores.extend(result.ignores);
                all_warnings.extend(result.warnings);
            }
            TemplateNode::Text(text) => {
                // Only whitespace-only text nodes are OK, continue looking back
                if text.data.trim().is_empty() {
                    continue;
                } else {
                    break;
                }
            }
            _ => {
                // Any other node type stops the search
                break;
            }
        }
    }

    PrecedingIgnores {
        ignores,
        warnings: all_warnings,
    }
}

/// Analyze a fragment.
pub fn analyze(fragment: &mut Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for cyclical dependencies between ConstTag nodes
    check_const_tag_cycles(&fragment.nodes)?;

    let runes = context.analysis.runes;

    // Pre-compute ignore info for each node (requires immutable borrow of fragment.nodes).
    // For non-Comment nodes (including Text), collect preceding svelte-ignore comments.
    // The official Svelte (2-analyze/index.js L99) only applies the general ignore mechanism
    // to non-Comment, non-Text nodes. However, Text nodes need ignore info too because
    // the Text visitor checks for bidirectional_control_characters and needs to know if
    // a preceding svelte-ignore comment suppresses it (see Text.js L33-45).
    let ignore_info: Vec<Option<PrecedingIgnores>> = (0..fragment.nodes.len())
        .map(|idx| {
            let is_ignorable = !matches!(&fragment.nodes[idx], TemplateNode::Comment(_));
            if is_ignorable {
                Some(collect_preceding_ignores(&fragment.nodes, idx, runes))
            } else {
                None
            }
        })
        .collect();

    // Emit warnings from svelte-ignore comment validation (legacy_code, unknown_code).
    // These are emitted only once per comment because only the first
    // non-Comment/non-Text node collects from preceding comments.
    for preceding in ignore_info.iter().flatten() {
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

    for (idx, node) in fragment.nodes.iter_mut().enumerate() {
        // Push ignores for this node
        let has_ignores = ignore_info[idx]
            .as_ref()
            .is_some_and(|p| !p.ignores.is_empty());
        if has_ignores {
            context.push_ignore(ignore_info[idx].as_ref().unwrap().ignores.clone());
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
            let crate::ast::js::Expression::Value(value) = &tag.declaration;

            // The declaration can be either:
            // 1. A VariableDeclaration (official Svelte structure):
            //    { type: "VariableDeclaration", declarations: [{ type: "VariableDeclarator", id, init }] }
            // 2. An AssignmentExpression (what the Rust parser currently produces):
            //    { type: "AssignmentExpression", left, right }

            let (bindings, deps) = if let Some(declarations) =
                value.get("declarations").and_then(|d| d.as_array())
            {
                // VariableDeclaration structure
                if let Some(declaration) = declarations.first() {
                    let bindings = if let Some(id) = declaration.get("id") {
                        extract_pattern_identifiers(id)
                    } else {
                        Vec::new()
                    };
                    let deps = if let Some(init) = declaration.get("init") {
                        extract_expression_identifiers(init)
                    } else {
                        FxHashSet::default()
                    };
                    (bindings, deps)
                } else {
                    (Vec::new(), FxHashSet::default())
                }
            } else if value.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression") {
                // AssignmentExpression structure
                let bindings = if let Some(left) = value.get("left") {
                    extract_pattern_identifiers(left)
                } else {
                    Vec::new()
                };
                let deps = if let Some(right) = value.get("right") {
                    extract_expression_identifiers(right)
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
