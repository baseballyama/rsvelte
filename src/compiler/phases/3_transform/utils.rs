//! Utility functions for the transform phase.
//!
//! Corresponds to utilities in:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`

use crate::ast::js::Expression;
use crate::ast::template::{Attribute, RegularElement, TemplateNode};
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use compact_str::CompactString;
use regex::Regex;
use std::collections::HashMap;
use std::sync::LazyLock;

/// Regex for text that is not whitespace (matches Svelte's definition: only space/tab/CR/LF are whitespace,
/// not &nbsp; which is \u{00A0}). See patterns.js: `Not \S because that also removes explicit whitespace
/// defined through things like &nbsp;`
static REGEX_NOT_WHITESPACE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^ \t\r\n]").unwrap());

/// Regex for leading whitespace (only space/tab/CR/LF, not &nbsp;)
static REGEX_STARTS_WITH_WHITESPACES: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[ \t\r\n]+").unwrap());

/// Regex for trailing whitespace (only space/tab/CR/LF, not &nbsp;)
static REGEX_ENDS_WITH_WHITESPACES: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"[ \t\r\n]+$").unwrap());

/// Check if a string consists entirely of HTML-whitespace characters.
///
/// Svelte defines whitespace as: space, tab, carriage return, newline, and form feed.
/// This deliberately excludes non-breaking space (\u{00A0} from `&nbsp;`), which
/// is treated as content, not whitespace. This matches the official Svelte compiler's
/// `regex_not_whitespace = /[^ \t\r\n]/` pattern.
pub fn is_svelte_whitespace_only(s: &str) -> bool {
    s.chars()
        .all(|c| matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C'))
}

/// Trim Svelte whitespace from both ends of a string.
///
/// Only trims space, tab, carriage return, newline, and form feed.
/// Does NOT trim non-breaking space (\u{00A0}).
pub fn svelte_trim(s: &str) -> &str {
    let is_ws = |c: char| matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C');
    let start = s
        .char_indices()
        .find(|(_, c)| !is_ws(*c))
        .map_or(s.len(), |(i, _)| i);
    let end = s
        .char_indices()
        .rfind(|(_, c)| !is_ws(*c))
        .map_or(0, |(i, c)| i + c.len_utf8());
    if start > end { "" } else { &s[start..end] }
}

/// Trim Svelte whitespace from the start of a string.
pub fn svelte_trim_start(s: &str) -> &str {
    let is_ws = |c: char| matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C');
    let start = s
        .char_indices()
        .find(|(_, c)| !is_ws(*c))
        .map_or(s.len(), |(i, _)| i);
    &s[start..]
}

/// Trim Svelte whitespace from the end of a string.
pub fn svelte_trim_end(s: &str) -> &str {
    let is_ws = |c: char| matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C');
    let end = s
        .char_indices()
        .rfind(|(_, c)| !is_ws(*c))
        .map_or(0, |(i, c)| i + c.len_utf8());
    &s[..end]
}

/// Sort ConstTag nodes in topological order based on their dependencies.
///
/// Corresponds to `sort_const_tags` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// This is only needed in legacy (non-runes) mode to match Svelte 4 behavior
/// where const declarations can reference each other in any order.
fn sort_const_tags(nodes: Vec<TemplateNode>) -> Vec<TemplateNode> {
    // Collect const tags with their indices, declared names, and dependencies
    struct ConstTagInfo {
        index: usize,
        declared_names: Vec<String>,
        deps: Vec<String>,
    }

    let mut const_infos: Vec<ConstTagInfo> = Vec::new();
    let mut other_indices: Vec<usize> = Vec::new();

    for (i, node) in nodes.iter().enumerate() {
        if let TemplateNode::ConstTag(tag) = node {
            let (declared, referenced) = extract_const_tag_names_and_deps(&tag.declaration);
            const_infos.push(ConstTagInfo {
                index: i,
                declared_names: declared,
                deps: referenced,
            });
        } else {
            other_indices.push(i);
        }
    }

    if const_infos.len() <= 1 {
        return nodes;
    }

    // Build a map from declared name to const tag index (within const_infos)
    let mut name_to_tag: HashMap<&str, usize> = HashMap::new();
    for (tag_idx, info) in const_infos.iter().enumerate() {
        for name in &info.declared_names {
            name_to_tag.insert(name.as_str(), tag_idx);
        }
    }

    // Build dependency edges: for each const tag, find which other const tags it depends on
    let n = const_infos.len();
    let mut dep_indices: Vec<Vec<usize>> = vec![Vec::new(); n];

    for (tag_idx, info) in const_infos.iter().enumerate() {
        for dep_name in &info.deps {
            if let Some(&dep_tag_idx) = name_to_tag.get(dep_name.as_str())
                && dep_tag_idx != tag_idx
            {
                dep_indices[tag_idx].push(dep_tag_idx);
            }
        }
    }

    // Topological sort (DFS-based, matching the official implementation's `add` function)
    let mut sorted_tag_indices: Vec<usize> = Vec::with_capacity(n);
    let mut visited = vec![false; n];

    fn visit(
        idx: usize,
        dep_indices: &[Vec<usize>],
        visited: &mut Vec<bool>,
        sorted: &mut Vec<usize>,
    ) {
        if visited[idx] {
            return;
        }
        visited[idx] = true;

        // Visit dependencies first
        for &dep in &dep_indices[idx] {
            visit(dep, dep_indices, visited, sorted);
        }

        sorted.push(idx);
    }

    for i in 0..n {
        visit(i, &dep_indices, &mut visited, &mut sorted_tag_indices);
    }

    // Build result: sorted const tags first, then other nodes in original order
    // This matches the official implementation: [...sorted, ...other]
    let mut result: Vec<TemplateNode> = Vec::with_capacity(nodes.len());

    // We need to consume `nodes` to move elements out
    // Convert to a vec of Option so we can take elements
    let mut nodes_opt: Vec<Option<TemplateNode>> = nodes.into_iter().map(Some).collect();

    // Add sorted const tags first
    for &tag_idx in &sorted_tag_indices {
        let original_index = const_infos[tag_idx].index;
        if let Some(node) = nodes_opt[original_index].take() {
            result.push(node);
        }
    }

    // Add other nodes in original order
    for &other_idx in &other_indices {
        if let Some(node) = nodes_opt[other_idx].take() {
            result.push(node);
        }
    }

    result
}

/// Extract declared names and referenced identifiers from a ConstTag declaration.
///
/// Returns (declared_names, referenced_identifiers).
fn extract_const_tag_names_and_deps(declaration: &Expression) -> (Vec<String>, Vec<String>) {
    match declaration {
        Expression::Value(json_value) => {
            let obj = match json_value.as_object() {
                Some(o) => o,
                None => return (vec![], vec![]),
            };
            let expr_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");

            match expr_type {
                "VariableDeclaration" => {
                    let declarations = match obj.get("declarations").and_then(|v| v.as_array()) {
                        Some(d) => d,
                        None => return (vec![], vec![]),
                    };
                    if declarations.is_empty() {
                        return (vec![], vec![]);
                    }
                    let first_decl = match declarations[0].as_object() {
                        Some(d) => d,
                        None => return (vec![], vec![]),
                    };
                    let id = match first_decl.get("id") {
                        Some(id) => id,
                        None => return (vec![], vec![]),
                    };
                    let init = match first_decl.get("init") {
                        Some(init) => init,
                        None => return (vec![], vec![]),
                    };

                    let mut declared = Vec::new();
                    collect_identifiers_from_json_pattern(id, &mut declared);

                    let mut referenced = Vec::new();
                    collect_identifiers_from_json_expr(init, &mut referenced);

                    (declared, referenced)
                }
                "AssignmentExpression" => {
                    let left = match obj.get("left") {
                        Some(l) => l,
                        None => return (vec![], vec![]),
                    };
                    let right = match obj.get("right") {
                        Some(r) => r,
                        None => return (vec![], vec![]),
                    };

                    let mut declared = Vec::new();
                    collect_identifiers_from_json_pattern(left, &mut declared);

                    let mut referenced = Vec::new();
                    collect_identifiers_from_json_expr(right, &mut referenced);

                    (declared, referenced)
                }
                _ => (vec![], vec![]),
            }
        }
    }
}

/// Collect all identifier names from a JSON pattern (destructuring or simple identifier).
fn collect_identifiers_from_json_pattern(pattern: &serde_json::Value, out: &mut Vec<String>) {
    let pat_type = pattern.get("type").and_then(|v| v.as_str());
    match pat_type {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|v| v.as_str()) {
                out.push(name.to_string());
            }
        }
        Some("ObjectPattern") | Some("ObjectExpression") => {
            if let Some(properties) = pattern.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|v| v.as_str());
                    if prop_type == Some("RestElement") || prop_type == Some("SpreadElement") {
                        if let Some(arg) = prop.get("argument") {
                            collect_identifiers_from_json_pattern(arg, out);
                        }
                    } else if let Some(value) = prop.get("value") {
                        collect_identifiers_from_json_pattern(value, out);
                    }
                }
            }
        }
        Some("ArrayPattern") | Some("ArrayExpression") => {
            if let Some(elements) = pattern.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        collect_identifiers_from_json_pattern(elem, out);
                    }
                }
            }
        }
        Some("RestElement") | Some("SpreadElement") => {
            if let Some(arg) = pattern.get("argument") {
                collect_identifiers_from_json_pattern(arg, out);
            }
        }
        Some("AssignmentPattern") | Some("AssignmentExpression") => {
            if let Some(left) = pattern.get("left") {
                collect_identifiers_from_json_pattern(left, out);
            }
        }
        _ => {}
    }
}

/// Collect all identifier names referenced in a JSON expression (for dependency analysis).
/// This walks the expression AST to find all Identifier nodes that are references.
fn collect_identifiers_from_json_expr(expr: &serde_json::Value, out: &mut Vec<String>) {
    let expr_type = match expr.get("type").and_then(|v| v.as_str()) {
        Some(t) => t,
        None => {
            // Handle arrays (e.g., function arguments)
            if let Some(arr) = expr.as_array() {
                for item in arr {
                    collect_identifiers_from_json_expr(item, out);
                }
            }
            return;
        }
    };

    match expr_type {
        "Identifier" => {
            if let Some(name) = expr.get("name").and_then(|v| v.as_str()) {
                // Skip JS keywords/literals
                if !is_js_keyword_or_literal(name) {
                    out.push(name.to_string());
                }
            }
        }
        "MemberExpression" => {
            // Only walk the object part, not the property (when not computed)
            if let Some(object) = expr.get("object") {
                collect_identifiers_from_json_expr(object, out);
            }
            // For computed properties like a[b], also walk the property
            if expr
                .get("computed")
                .and_then(|v| v.as_bool())
                .unwrap_or(false)
                && let Some(property) = expr.get("property")
            {
                collect_identifiers_from_json_expr(property, out);
            }
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = expr.get("left") {
                collect_identifiers_from_json_expr(left, out);
            }
            if let Some(right) = expr.get("right") {
                collect_identifiers_from_json_expr(right, out);
            }
        }
        "UnaryExpression" | "UpdateExpression" => {
            if let Some(arg) = expr.get("argument") {
                collect_identifiers_from_json_expr(arg, out);
            }
        }
        "ConditionalExpression" => {
            if let Some(test) = expr.get("test") {
                collect_identifiers_from_json_expr(test, out);
            }
            if let Some(consequent) = expr.get("consequent") {
                collect_identifiers_from_json_expr(consequent, out);
            }
            if let Some(alternate) = expr.get("alternate") {
                collect_identifiers_from_json_expr(alternate, out);
            }
        }
        "CallExpression" | "NewExpression" => {
            if let Some(callee) = expr.get("callee") {
                collect_identifiers_from_json_expr(callee, out);
            }
            if let Some(args) = expr.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    collect_identifiers_from_json_expr(arg, out);
                }
            }
        }
        "ArrayExpression" => {
            if let Some(elements) = expr.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        collect_identifiers_from_json_expr(elem, out);
                    }
                }
            }
        }
        "ObjectExpression" => {
            if let Some(properties) = expr.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    // For computed keys, walk the key
                    if prop
                        .get("computed")
                        .and_then(|v| v.as_bool())
                        .unwrap_or(false)
                        && let Some(key) = prop.get("key")
                    {
                        collect_identifiers_from_json_expr(key, out);
                    }
                    if let Some(value) = prop.get("value") {
                        collect_identifiers_from_json_expr(value, out);
                    }
                }
            }
        }
        "SpreadElement" => {
            if let Some(arg) = expr.get("argument") {
                collect_identifiers_from_json_expr(arg, out);
            }
        }
        "TemplateLiteral" => {
            if let Some(expressions) = expr.get("expressions").and_then(|v| v.as_array()) {
                for expression in expressions {
                    collect_identifiers_from_json_expr(expression, out);
                }
            }
        }
        "TaggedTemplateExpression" => {
            if let Some(tag) = expr.get("tag") {
                collect_identifiers_from_json_expr(tag, out);
            }
            if let Some(quasi) = expr.get("quasi") {
                collect_identifiers_from_json_expr(quasi, out);
            }
        }
        "ArrowFunctionExpression" | "FunctionExpression" => {
            // Don't walk into function bodies for dependency analysis
            // The function's own parameters shadow outer bindings
        }
        "SequenceExpression" => {
            if let Some(expressions) = expr.get("expressions").and_then(|v| v.as_array()) {
                for expression in expressions {
                    collect_identifiers_from_json_expr(expression, out);
                }
            }
        }
        "AssignmentExpression" => {
            if let Some(right) = expr.get("right") {
                collect_identifiers_from_json_expr(right, out);
            }
        }
        _ => {
            // For unknown types, try to walk common child fields
        }
    }
}

/// Check if a string is a JavaScript keyword or built-in literal.
fn is_js_keyword_or_literal(s: &str) -> bool {
    matches!(
        s,
        "true"
            | "false"
            | "null"
            | "undefined"
            | "this"
            | "NaN"
            | "Infinity"
            | "arguments"
            | "new"
            | "typeof"
            | "instanceof"
            | "void"
            | "delete"
            | "in"
            | "of"
    )
}

/// Result of cleaning nodes.
#[derive(Debug, Clone)]
pub struct CleanedNodes {
    /// Nodes that should be hoisted (ConstTag, DebugTag, etc.)
    pub hoisted: Vec<TemplateNode>,

    /// Trimmed nodes with whitespace handled
    pub trimmed: Vec<TemplateNode>,

    /// Whether this is a standalone component/render tag
    pub is_standalone: bool,

    /// Whether the first node is text or an expression tag
    pub is_text_first: bool,
}

/// Clean and organize template nodes.
///
/// Extracts nodes that are hoisted and trims whitespace according to the following rules:
/// - trim leading and trailing whitespace, regardless of surroundings
/// - keep leading / trailing whitespace of in-between text nodes,
///   unless it's whitespace-only, in which case collapse to a single whitespace
///
/// Corresponds to `clean_nodes` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// # Arguments
///
/// * `parent` - The parent node
/// * `nodes` - The nodes to clean
/// * `path` - The path of parent nodes
/// * `namespace` - The namespace (html, svg, mathml)
/// * `scope` - The current scope
/// * `analysis` - The component analysis
/// * `preserve_whitespace` - Whether to preserve whitespace
/// * `preserve_comments` - Whether to preserve comments
///
/// # Returns
///
/// Returns a `CleanedNodes` struct containing hoisted and trimmed nodes.
#[allow(clippy::too_many_arguments)]
pub fn clean_nodes(
    parent: Option<&TemplateNode>,
    nodes: &[TemplateNode],
    _path: &[&TemplateNode],
    namespace: &str,
    _scope: &Scope,
    analysis: &ComponentAnalysis,
    preserve_whitespace: bool,
    preserve_comments: bool,
) -> CleanedNodes {
    // Sort const tags topologically in legacy (non-runes) mode
    // This matches the official compiler's behavior in clean_nodes (utils.js line 138-139)
    let sorted_nodes;
    let nodes = if !analysis.runes {
        sorted_nodes = sort_const_tags(nodes.to_vec());
        &sorted_nodes
    } else {
        nodes
    };

    // Pre-allocate based on input size
    let mut hoisted = Vec::with_capacity(nodes.len().min(8));
    let mut regular = Vec::with_capacity(nodes.len());

    // Separate hoisted nodes from regular nodes
    for node in nodes {
        // Skip comments unless preserveComments is true
        if matches!(node, TemplateNode::Comment(_)) && !preserve_comments {
            continue;
        }

        match node {
            TemplateNode::ConstTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::SvelteBody(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::SvelteDocument(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SnippetBlock(_) => {
                hoisted.push(node.clone());
            }
            _ => {
                regular.push(node.clone());
            }
        }
    }

    // Whitespace trimming (unless preserve_whitespace is set)
    let mut trimmed = if preserve_whitespace {
        regular
    } else {
        trim_whitespace(parent, &regular, namespace)
    };

    // If first text node inside a <pre> is a single newline, discard it, because otherwise
    // the browser will do it for us which could break hydration.
    // Corresponds to lines 253-262 of utils.js in the official compiler.
    if let Some(TemplateNode::RegularElement(el)) = parent
        && el.name.as_str() == "pre"
        && let Some(TemplateNode::Text(text)) = trimmed.first()
        && (text.data.as_str() == "\n" || text.data.as_str() == "\r\n")
    {
        trimmed.remove(0);
    }

    // Special case: Add a comment if this is a lone script tag. This ensures that our
    // run_scripts logic in template.js will always be able to call node.replaceWith()
    // on the script tag in order to make it run. If we don't add this and would still
    // call node.replaceWith() on the script tag, it would be a no-op because the script
    // tag has no parent.
    // Corresponds to lines 264-274 of utils.js in the official compiler.
    if trimmed.len() == 1
        && let Some(TemplateNode::RegularElement(el)) = trimmed.first()
        && el.name.as_str() == "script"
    {
        trimmed.push(TemplateNode::Comment(crate::ast::template::Comment {
            start: u32::MAX,
            end: u32::MAX,
            data: CompactString::new(""),
        }));
    }

    // Determine is_standalone
    // In a case like `{#if x}<Foo />{/if}`, we don't need to wrap the child in
    // comments — we can just use the parent block's anchor for the component.
    // But dynamic components/render tags need their own comment anchor because
    // they use $.component()/$.snippet() which requires a stable anchor node.
    let is_standalone = trimmed.len() == 1
        && match &trimmed[0] {
            TemplateNode::RenderTag(render_tag) => !render_tag.metadata.dynamic,
            TemplateNode::Component(comp) => {
                // Not standalone if:
                // - Component is dynamic (uses $derived or similar)
                // - Component has CSS custom properties (--var attributes)
                !comp.metadata.dynamic
                    && !comp.attributes.iter().any(
                        |attr| matches!(attr, Attribute::Attribute(a) if a.name.starts_with("--")),
                    )
            }
            _ => false,
        };

    // Determine is_text_first
    // This is true when the first child is a text or expression tag, for certain parent types.
    // The Fragment visitor will use this in conjunction with is_root_fragment to determine
    // whether to generate $.next() to skip over inserted comment markers.
    let is_text_first = match parent {
        // Root fragment (None parent) or specific parent types that need $.next()
        None
        | Some(TemplateNode::SnippetBlock(_))
        | Some(TemplateNode::EachBlock(_))
        | Some(TemplateNode::SvelteComponent(_))
        | Some(TemplateNode::SvelteBoundary(_))
        | Some(TemplateNode::Component(_))
        | Some(TemplateNode::SvelteSelf(_)) => {
            if let Some(first) = trimmed.first() {
                matches!(
                    first,
                    TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
                )
            } else {
                false
            }
        }
        _ => false,
    };

    CleanedNodes {
        hoisted,
        trimmed,
        is_standalone,
        is_text_first,
    }
}

/// Trim whitespace from template nodes.
///
/// Implements the whitespace trimming logic from the official Svelte compiler:
/// - Remove leading and trailing whitespace-only text nodes
/// - Trim leading whitespace from first text node
/// - Trim trailing whitespace from last text node
/// - Collapse internal whitespace-only text nodes to a single space
///   (or remove entirely for certain elements like select, table, etc.)
fn trim_whitespace(
    parent: Option<&TemplateNode>,
    nodes: &[TemplateNode],
    namespace: &str,
) -> Vec<TemplateNode> {
    if nodes.is_empty() {
        return Vec::new();
    }

    // Find start index (skip leading whitespace-only text nodes)
    let start_idx = nodes
        .iter()
        .position(|node| {
            if let TemplateNode::Text(text) = node {
                REGEX_NOT_WHITESPACE.is_match(&text.data)
            } else {
                true
            }
        })
        .unwrap_or(nodes.len());

    // Find end index (skip trailing whitespace-only text nodes)
    let end_idx = nodes
        .iter()
        .rposition(|node| {
            if let TemplateNode::Text(text) = node {
                REGEX_NOT_WHITESPACE.is_match(&text.data)
            } else {
                true
            }
        })
        .map(|i| i + 1)
        .unwrap_or(0);

    // If nothing remains, return empty
    if start_idx >= end_idx {
        return Vec::new();
    }

    // Work with the trimmed slice
    let trimmed_slice = &nodes[start_idx..end_idx];

    // Pre-allocate result vector
    let mut regular: Vec<TemplateNode> = Vec::with_capacity(trimmed_slice.len());

    // Clone the nodes in range
    for node in trimmed_slice {
        regular.push(node.clone());
    }

    // Trim leading whitespace from first text node
    if let Some(TemplateNode::Text(first)) = regular.first_mut() {
        let new_raw = REGEX_STARTS_WITH_WHITESPACES.replace(&first.raw, "");
        let new_data = REGEX_STARTS_WITH_WHITESPACES.replace(&first.data, "");
        first.raw = CompactString::new(&new_raw);
        first.data = CompactString::new(&new_data);
    }

    // Trim trailing whitespace from last text node
    if let Some(TemplateNode::Text(last)) = regular.last_mut() {
        let new_raw = REGEX_ENDS_WITH_WHITESPACES.replace(&last.raw, "");
        let new_data = REGEX_ENDS_WITH_WHITESPACES.replace(&last.data, "");
        last.raw = CompactString::new(&new_raw);
        last.data = CompactString::new(&new_data);
    }

    // Determine if whitespace-only text nodes can be removed entirely
    // This applies to svg (except text elements) and certain HTML elements
    let can_remove_entirely = (namespace == "svg"
        && !matches!(parent, Some(TemplateNode::RegularElement(elem)) if elem.name == "text"))
        || matches!(parent, Some(TemplateNode::RegularElement(elem)) if matches!(
            elem.name.as_str(),
            "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
        ));

    // Process internal text nodes - collapse whitespace
    let mut trimmed = Vec::new();
    for (i, node) in regular.iter().enumerate() {
        if let TemplateNode::Text(text) = node {
            let mut new_text = text.clone();
            let prev = if i > 0 { regular.get(i - 1) } else { None };
            let next = regular.get(i + 1);

            // Collapse leading whitespace unless previous node is an ExpressionTag
            if !matches!(prev, Some(TemplateNode::ExpressionTag(_))) {
                let prev_is_text_ending_with_whitespace = matches!(
                    prev,
                    Some(TemplateNode::Text(t)) if REGEX_ENDS_WITH_WHITESPACES.is_match(&t.data)
                );
                let replacement = if prev_is_text_ending_with_whitespace {
                    ""
                } else {
                    " "
                };
                new_text.data = CompactString::new(
                    REGEX_STARTS_WITH_WHITESPACES.replace(&new_text.data, replacement),
                );
                new_text.raw = CompactString::new(
                    REGEX_STARTS_WITH_WHITESPACES.replace(&new_text.raw, replacement),
                );
            }

            // Collapse trailing whitespace unless next node is an ExpressionTag
            if !matches!(next, Some(TemplateNode::ExpressionTag(_))) {
                new_text.data =
                    CompactString::new(REGEX_ENDS_WITH_WHITESPACES.replace(&new_text.data, " "));
                new_text.raw =
                    CompactString::new(REGEX_ENDS_WITH_WHITESPACES.replace(&new_text.raw, " "));
            }

            // Only add if there's content or it's a meaningful space
            if !new_text.data.is_empty() && (new_text.data != " " || !can_remove_entirely) {
                trimmed.push(TemplateNode::Text(new_text));
            }
        } else {
            trimmed.push(node.clone());
        }
    }

    trimmed
}

/// Infer the namespace for the children of a node.
///
/// Corresponds to `infer_namespace` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// This function uses the metadata.svg and metadata.mathml fields set during
/// Phase 2 analysis to determine the namespace. These fields correctly handle
/// ambiguous elements like 'title' and 'a' which can be either HTML or SVG
/// depending on their ancestor context.
///
/// # Arguments
///
/// * `namespace` - The current namespace
/// * `parent` - The parent node
/// * `nodes` - The child nodes
/// * `analysis` - The component analysis
///
/// # Returns
///
/// Returns the inferred namespace string ("html", "svg", or "mathml").
pub fn infer_namespace(
    namespace: &str,
    parent: Option<&TemplateNode>,
    nodes: &[TemplateNode],
    _analysis: &ComponentAnalysis,
) -> String {
    // Check for foreignObject which resets to html
    if let Some(TemplateNode::RegularElement(elem)) = parent {
        if elem.name == "foreignObject" {
            return "html".to_string();
        }

        // Use metadata set during analysis phase to determine namespace
        // This correctly handles ambiguous elements like 'title' and 'a'
        if elem.metadata.svg {
            return "svg".to_string();
        }
        if elem.metadata.mathml {
            return "mathml".to_string();
        }
        // If parent is a regular element without svg/mathml metadata, it's html
        return "html".to_string();
    }

    // For <svelte:element>, the namespace is determined at runtime by $.element().
    // Templates for its children are always generated as HTML.
    if let Some(TemplateNode::SvelteElement(elem)) = parent {
        if elem.metadata.svg {
            return "svg".to_string();
        }
        return if elem.metadata.mathml {
            "mathml".to_string()
        } else {
            "html".to_string()
        };
    }

    // Re-evaluate namespace for fragments/snippets based on child content.
    // This matches the JS behavior at lines 326-339 of utils.js:
    // For SnippetBlock, Component, SvelteComponent, etc., the namespace is
    // re-evaluated based on what elements are in the children.
    //
    // Note: In our implementation, parent is always None during the transform
    // phase because the path is not populated. We use the incoming namespace
    // to distinguish context: when namespace is "html", we're likely at a root
    // or re-evaluation boundary where we need to detect SVG/MathML from children.
    // When namespace is already "svg"/"mathml", we're inside a known namespace
    // context (e.g., IfBlock inside SVG) and should trust it rather than
    // re-evaluating, because ambiguous elements like <a> and <title> may not
    // have their metadata.svg set correctly in the analysis phase.
    let should_reevaluate = match parent {
        Some(TemplateNode::SnippetBlock(_)) => true,
        Some(TemplateNode::Component(_)) => true,
        Some(TemplateNode::SvelteComponent(_)) => true,
        None if namespace == "html" => true,
        _ => false,
    };

    if should_reevaluate {
        // Check ALL child elements for consistent namespace.
        // Matches the JS behavior at lines 346-356 of utils.js:
        // If elements are mixed (some SVG, some not), fall back to "html".
        let mut new_namespace: Option<&str> = None;
        for node in nodes {
            if let TemplateNode::RegularElement(elem) = node {
                if elem.metadata.mathml {
                    new_namespace = Some(match new_namespace {
                        None | Some("mathml") => "mathml",
                        _ => "html",
                    });
                } else if elem.metadata.svg {
                    new_namespace = Some(match new_namespace {
                        None | Some("svg") => "svg",
                        _ => "html",
                    });
                } else {
                    return "html".to_string();
                }
            }
        }
        if let Some(ns) = new_namespace {
            return ns.to_string();
        }
    }

    // Fall back to the incoming namespace.
    // This handles cases like IfBlock inside SVG where the namespace is
    // already "svg" and we should preserve it.
    namespace.to_string()
}

/// Determine the namespace for children of a regular element.
///
/// Corresponds to `determine_namespace_for_children` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// This function determines the correct namespace (html, svg, mathml) for child
/// elements based on the parent element's metadata.
///
/// # Arguments
///
/// * `node` - The parent regular element
/// * `namespace` - The current namespace (unused but kept for API compatibility)
///
/// # Returns
///
/// Returns the namespace string ("html", "svg", or "mathml") that children should use.
pub fn determine_namespace_for_children(node: &RegularElement, _namespace: &str) -> String {
    // foreignObject resets to html namespace
    if node.name == "foreignObject" {
        return "html".to_string();
    }

    // Use metadata set during analysis phase
    if node.metadata.svg {
        return "svg".to_string();
    }

    if node.metadata.mathml {
        "mathml".to_string()
    } else {
        "html".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_nodes_empty() {
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        let cleaned = clean_nodes(None, &[], &[], "html", &scope, &analysis, false, false);

        assert!(cleaned.hoisted.is_empty());
        assert!(cleaned.trimmed.is_empty());
        assert!(!cleaned.is_standalone);
        assert!(!cleaned.is_text_first);
    }

    #[test]
    fn test_infer_namespace_default() {
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

        let options = CompileOptions::default();
        let analysis = ComponentAnalysis::new("", &options);
        let namespace = infer_namespace("html", None, &[], &analysis);

        assert_eq!(namespace, "html");
    }

    #[test]
    fn test_clean_nodes_whitespace_only() {
        use crate::ast::template::Text;
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
        use compact_str::CompactString;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        // Create a whitespace-only text node
        let nodes = vec![TemplateNode::Text(Text {
            start: 0,
            end: 5,
            raw: CompactString::new("  \n  "),
            data: CompactString::new("  \n  "),
        })];

        let cleaned = clean_nodes(None, &nodes, &[], "html", &scope, &analysis, false, false);

        // Whitespace-only text node should be removed
        assert!(
            cleaned.trimmed.is_empty(),
            "Whitespace-only text should be trimmed: {:?}",
            cleaned.trimmed
        );
    }

    #[test]
    fn test_clean_nodes_trim_leading_whitespace() {
        use crate::ast::template::Text;
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
        use compact_str::CompactString;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        // Create a text node with leading whitespace
        let nodes = vec![TemplateNode::Text(Text {
            start: 0,
            end: 10,
            raw: CompactString::new("  hello"),
            data: CompactString::new("  hello"),
        })];

        let cleaned = clean_nodes(None, &nodes, &[], "html", &scope, &analysis, false, false);

        assert_eq!(cleaned.trimmed.len(), 1);
        if let TemplateNode::Text(t) = &cleaned.trimmed[0] {
            assert_eq!(
                t.data.as_str(),
                "hello",
                "Leading whitespace should be trimmed"
            );
        } else {
            panic!("Expected Text node");
        }
    }

    #[test]
    fn test_clean_nodes_normalize_text_with_newlines_and_indentation() {
        use crate::ast::template::Text;
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
        use compact_str::CompactString;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        // Create a text node like "\n\t\tButton\n\t" (typical in formatted HTML)
        let nodes = vec![TemplateNode::Text(Text {
            start: 0,
            end: 12,
            raw: CompactString::new("\n\t\tButton\n\t"),
            data: CompactString::new("\n\t\tButton\n\t"),
        })];

        let cleaned = clean_nodes(None, &nodes, &[], "html", &scope, &analysis, false, false);

        assert_eq!(cleaned.trimmed.len(), 1);
        if let TemplateNode::Text(t) = &cleaned.trimmed[0] {
            assert_eq!(
                t.data.as_str(),
                "Button",
                "Whitespace around text should be trimmed: got {:?}",
                t.data.as_str()
            );
            assert_eq!(
                t.raw.as_str(),
                "Button",
                "Raw whitespace should also be trimmed: got {:?}",
                t.raw.as_str()
            );
        } else {
            panic!("Expected Text node");
        }
    }
}
