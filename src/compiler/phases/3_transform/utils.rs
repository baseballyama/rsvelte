//! Utility functions for the transform phase.
//!
//! Corresponds to utilities in:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`

use crate::ast::js::Expression;
use crate::ast::template::{Attribute, RegularElement, TemplateNode};
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use compact_str::CompactString;
use rustc_hash::FxHashMap;
use std::borrow::Cow;

/// A borrowed reference to a parent node, avoiding expensive clones of TemplateNode.
///
/// This enum replaces `Option<&TemplateNode>` in functions like `clean_nodes`,
/// `trim_whitespace`, `infer_namespace`, and `bind_directive` to avoid needing
/// to construct a `TemplateNode::RegularElement(node.clone())` just to pass as parent.
#[derive(Debug, Clone, Copy)]
pub enum ParentRef<'a> {
    RegularElement(&'a crate::ast::template::RegularElement),
    SvelteElement(&'a crate::ast::template::SvelteDynamicElement),
    TemplateNode(&'a crate::ast::template::TemplateNode),
    None,
}

impl<'a> ParentRef<'a> {
    /// Convert from Option<&TemplateNode> for backward compatibility.
    pub fn from_option(opt: Option<&'a TemplateNode>) -> Self {
        match opt {
            Some(node) => ParentRef::TemplateNode(node),
            None => ParentRef::None,
        }
    }

    /// Check if this is a RegularElement (from either variant).
    pub fn as_regular_element(&self) -> Option<&'a crate::ast::template::RegularElement> {
        match self {
            ParentRef::RegularElement(el) => Some(el),
            ParentRef::TemplateNode(TemplateNode::RegularElement(el)) => Some(el),
            _ => None,
        }
    }

    /// Check if this is a SvelteElement (from either variant).
    pub fn as_svelte_element(&self) -> Option<&'a crate::ast::template::SvelteDynamicElement> {
        match self {
            ParentRef::SvelteElement(el) => Some(el),
            ParentRef::TemplateNode(TemplateNode::SvelteElement(el)) => Some(el),
            _ => None,
        }
    }

    /// Check if this is a SnippetBlock.
    pub fn is_snippet_block(&self) -> bool {
        matches!(self, ParentRef::TemplateNode(TemplateNode::SnippetBlock(_)))
    }

    /// Check if this is a Component.
    pub fn is_component(&self) -> bool {
        matches!(self, ParentRef::TemplateNode(TemplateNode::Component(_)))
    }

    /// Check if this is a SvelteComponent.
    pub fn is_svelte_component(&self) -> bool {
        matches!(
            self,
            ParentRef::TemplateNode(TemplateNode::SvelteComponent(_))
        )
    }

    /// Check if this is None.
    pub fn is_none(&self) -> bool {
        matches!(self, ParentRef::None)
    }
}

/// Check if string contains any non-whitespace character (replaces REGEX_NOT_WHITESPACE)
#[inline]
fn has_non_whitespace(s: &str) -> bool {
    s.bytes()
        .any(|b| !matches!(b, b' ' | b'\t' | b'\r' | b'\n'))
}

/// Trim leading whitespace chars (space/tab/CR/LF only), returns trimmed string
#[inline]
fn trim_leading_whitespace(s: &str) -> &str {
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() && matches!(bytes[i], b' ' | b'\t' | b'\r' | b'\n') {
        i += 1;
    }
    &s[i..]
}

/// Trim trailing whitespace chars (space/tab/CR/LF only), returns trimmed string
#[inline]
fn trim_trailing_whitespace(s: &str) -> &str {
    let bytes = s.as_bytes();
    let mut i = bytes.len();
    while i > 0 && matches!(bytes[i - 1], b' ' | b'\t' | b'\r' | b'\n') {
        i -= 1;
    }
    &s[..i]
}

/// Check if string ends with whitespace
#[inline]
fn ends_with_whitespace(s: &str) -> bool {
    s.as_bytes()
        .last()
        .is_some_and(|b| matches!(b, b' ' | b'\t' | b'\r' | b'\n'))
}

/// Replace leading whitespace with a replacement string
#[inline]
pub(crate) fn replace_leading_whitespace(s: &str, replacement: &str) -> String {
    let trimmed = trim_leading_whitespace(s);
    if trimmed.len() == s.len() {
        return s.to_string();
    }
    let mut result = String::with_capacity(replacement.len() + trimmed.len());
    result.push_str(replacement);
    result.push_str(trimmed);
    result
}

/// Replace trailing whitespace with a replacement string
#[inline]
pub(crate) fn replace_trailing_whitespace(s: &str, replacement: &str) -> String {
    let trimmed = trim_trailing_whitespace(s);
    if trimmed.len() == s.len() {
        return s.to_string();
    }
    let mut result = String::with_capacity(trimmed.len() + replacement.len());
    result.push_str(trimmed);
    result.push_str(replacement);
    result
}

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
    let mut name_to_tag: FxHashMap<&str, usize> = FxHashMap::default();
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
    {
        let json_value = declaration.as_json();
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
#[derive(Debug)]
pub struct CleanedNodes<'a> {
    /// Nodes that should be hoisted (ConstTag, DebugTag, etc.)
    pub hoisted: Vec<Cow<'a, TemplateNode>>,

    /// Trimmed nodes with whitespace handled
    pub trimmed: Vec<Cow<'a, TemplateNode>>,

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
pub fn clean_nodes<'a>(
    parent: ParentRef<'_>,
    nodes: &'a [TemplateNode],
    _path: &[&TemplateNode],
    namespace: &str,
    _scope: &Scope,
    analysis: &ComponentAnalysis,
    preserve_whitespace: bool,
    preserve_comments: bool,
) -> CleanedNodes<'a> {
    // Sort const tags topologically in legacy (non-runes) mode
    // This matches the official compiler's behavior in clean_nodes (utils.js line 138-139)
    let is_legacy = !analysis.runes;
    let sorted_nodes = if is_legacy {
        Some(sort_const_tags(nodes.to_vec()))
    } else {
        None
    };

    // Pre-allocate based on input size
    let mut hoisted: Vec<Cow<'a, TemplateNode>> = Vec::with_capacity(nodes.len().min(8));
    let mut regular: Vec<Cow<'a, TemplateNode>> = Vec::with_capacity(nodes.len());

    // Helper: process a single node into hoisted or regular
    let mut process_node = |node: Cow<'a, TemplateNode>| {
        // Skip comments unless preserveComments is true
        if matches!(node.as_ref(), TemplateNode::Comment(_)) && !preserve_comments {
            return;
        }

        match node.as_ref() {
            TemplateNode::ConstTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::SvelteBody(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::SvelteDocument(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SnippetBlock(_) => {
                hoisted.push(node);
            }
            _ => {
                regular.push(node);
            }
        }
    };

    // Separate hoisted nodes from regular nodes
    if let Some(sorted) = sorted_nodes {
        // Legacy mode: sorted nodes are owned
        for node in sorted {
            process_node(Cow::Owned(node));
        }
    } else {
        // Runes mode: borrow from input
        for node in nodes {
            process_node(Cow::Borrowed(node));
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
    if let Some(el) = parent.as_regular_element()
        && el.name.as_str() == "pre"
        && let Some(TemplateNode::Text(text)) = trimmed.first().map(|c| c.as_ref())
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
        && let Some(TemplateNode::RegularElement(el)) = trimmed.first().map(|c| c.as_ref())
        && el.name.as_str() == "script"
    {
        trimmed.push(Cow::Owned(TemplateNode::Comment(
            crate::ast::template::Comment {
                start: u32::MAX,
                end: u32::MAX,
                data: CompactString::new(""),
            },
        )));
    }

    // Determine is_standalone
    // In a case like `{#if x}<Foo />{/if}`, we don't need to wrap the child in
    // comments — we can just use the parent block's anchor for the component.
    // But dynamic components/render tags need their own comment anchor because
    // they use $.component()/$.snippet() which requires a stable anchor node.
    let is_standalone = trimmed.len() == 1
        && match trimmed[0].as_ref() {
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
        ParentRef::None => true,
        ParentRef::TemplateNode(
            TemplateNode::SnippetBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::SvelteComponent(_)
            | TemplateNode::SvelteBoundary(_)
            | TemplateNode::Component(_)
            | TemplateNode::SvelteSelf(_),
        ) => true,
        _ => false,
    } && {
        if let Some(first) = trimmed.first() {
            matches!(
                first.as_ref(),
                TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
            )
        } else {
            false
        }
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
fn trim_whitespace<'a>(
    parent: ParentRef<'_>,
    nodes: &[Cow<'a, TemplateNode>],
    namespace: &str,
) -> Vec<Cow<'a, TemplateNode>> {
    if nodes.is_empty() {
        return Vec::new();
    }

    // Find start index (skip leading whitespace-only text nodes)
    let start_idx = nodes
        .iter()
        .position(|node| {
            if let TemplateNode::Text(text) = node.as_ref() {
                has_non_whitespace(&text.data)
            } else {
                true
            }
        })
        .unwrap_or(nodes.len());

    // Find end index (skip trailing whitespace-only text nodes)
    let end_idx = nodes
        .iter()
        .rposition(|node| {
            if let TemplateNode::Text(text) = node.as_ref() {
                has_non_whitespace(&text.data)
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

    if trimmed_slice.is_empty() {
        return Vec::new();
    }

    let slice_len = trimmed_slice.len();

    // Determine if whitespace-only text nodes can be removed entirely
    // This applies to svg (except text elements) and certain HTML elements
    let can_remove_entirely = (namespace == "svg"
        && !matches!(parent.as_regular_element(), Some(elem) if elem.name == "text"))
        || matches!(parent.as_regular_element(), Some(elem) if matches!(
            elem.name.as_str(),
            "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
        ));

    // Single-pass processing: trim first/last text nodes and collapse internal whitespace
    // in one pass, avoiding intermediate Vec allocation and double-cloning of text nodes.
    let last_slice_idx = slice_len - 1;
    let mut trimmed: Vec<Cow<'a, TemplateNode>> = Vec::with_capacity(slice_len);
    let mut prev_ends_with_whitespace = false;
    let mut prev_is_expression_tag = false;

    for (i, cow_node) in trimmed_slice.iter().enumerate() {
        let is_first = i == 0;
        let is_last = i == last_slice_idx;

        if let TemplateNode::Text(text) = cow_node.as_ref() {
            let mut data_str = text.data.as_str();
            let mut raw_str = text.raw.as_str();

            // Trim leading whitespace from first text node
            if is_first {
                data_str = trim_leading_whitespace(data_str);
                raw_str = trim_leading_whitespace(raw_str);
            }

            // Trim trailing whitespace from last text node
            if is_last {
                data_str = trim_trailing_whitespace(data_str);
                raw_str = trim_trailing_whitespace(raw_str);
            }

            // Collapse leading whitespace unless previous node is an ExpressionTag
            let data_owned;
            let raw_owned;
            if !prev_is_expression_tag {
                let replacement = if prev_ends_with_whitespace { "" } else { " " };
                data_owned = replace_leading_whitespace(data_str, replacement);
                raw_owned = replace_leading_whitespace(raw_str, replacement);
            } else {
                data_owned = data_str.to_string();
                raw_owned = raw_str.to_string();
            }

            // Peek ahead to check if next node is an ExpressionTag
            let next_is_expression_tag = trimmed_slice
                .get(i + 1)
                .is_some_and(|c| matches!(c.as_ref(), TemplateNode::ExpressionTag(_)));

            // Collapse trailing whitespace unless next node is an ExpressionTag
            let final_data;
            let final_raw;
            if !next_is_expression_tag {
                final_data = replace_trailing_whitespace(&data_owned, " ");
                final_raw = replace_trailing_whitespace(&raw_owned, " ");
            } else {
                final_data = data_owned;
                final_raw = raw_owned;
            }

            // Track state for next iteration
            prev_ends_with_whitespace = ends_with_whitespace(&final_data);
            prev_is_expression_tag = false;

            // Only add if there's content or it's a meaningful space
            if !final_data.is_empty() && (final_data != " " || !can_remove_entirely) {
                let mut new_text = text.clone();
                new_text.data = CompactString::new(&final_data);
                new_text.raw = CompactString::new(&final_raw);
                trimmed.push(Cow::Owned(TemplateNode::Text(new_text)));
            }
        } else {
            // Non-text nodes: borrow directly
            prev_ends_with_whitespace = false;
            prev_is_expression_tag = matches!(cow_node.as_ref(), TemplateNode::ExpressionTag(_));
            trimmed.push(cow_node.clone());
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
pub fn infer_namespace<N: AsRef<TemplateNode>>(
    namespace: &str,
    parent: ParentRef<'_>,
    nodes: &[N],
    _analysis: &ComponentAnalysis,
) -> &'static str {
    // Check for foreignObject which resets to html
    if let Some(elem) = parent.as_regular_element() {
        if elem.name == "foreignObject" {
            return "html";
        }

        // Use metadata set during analysis phase to determine namespace
        // This correctly handles ambiguous elements like 'title' and 'a'
        if elem.metadata.svg {
            return "svg";
        }
        if elem.metadata.mathml {
            return "mathml";
        }
        // If parent is a regular element without svg/mathml metadata, it's html
        return "html";
    }

    // For <svelte:element>, the namespace is determined at runtime by $.element().
    // Templates for its children are always generated as HTML.
    if let Some(elem) = parent.as_svelte_element() {
        if elem.metadata.svg {
            return "svg";
        }
        return if elem.metadata.mathml {
            "mathml"
        } else {
            "html"
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
    let should_reevaluate = parent.is_snippet_block()
        || parent.is_component()
        || parent.is_svelte_component()
        || (parent.is_none() && namespace == "html");

    if should_reevaluate {
        // Check ALL child elements for consistent namespace.
        // Matches the JS behavior at lines 346-356 of utils.js:
        // If elements are mixed (some SVG, some not), fall back to "html".
        let mut new_namespace: Option<&str> = None;
        for node in nodes {
            if let TemplateNode::RegularElement(elem) = node.as_ref() {
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
                    return "html";
                }
            }
        }
        if let Some(ns) = new_namespace {
            return ns;
        }
    }

    // Fall back to the incoming namespace.
    // This handles cases like IfBlock inside SVG where the namespace is
    // already "svg" and we should preserve it.
    // The input is always one of "html", "svg", or "mathml"
    match namespace {
        "svg" => "svg",
        "mathml" => "mathml",
        _ => "html",
    }
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

        let cleaned = clean_nodes(
            ParentRef::None,
            &[],
            &[],
            "html",
            &scope,
            &analysis,
            false,
            false,
        );

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
        let namespace = infer_namespace("html", ParentRef::None, &[] as &[TemplateNode], &analysis);

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

        let cleaned = clean_nodes(
            ParentRef::None,
            &nodes,
            &[],
            "html",
            &scope,
            &analysis,
            false,
            false,
        );

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

        let cleaned = clean_nodes(
            ParentRef::None,
            &nodes,
            &[],
            "html",
            &scope,
            &analysis,
            false,
            false,
        );

        assert_eq!(cleaned.trimmed.len(), 1);
        if let TemplateNode::Text(t) = &*cleaned.trimmed[0] {
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

        let cleaned = clean_nodes(
            ParentRef::None,
            &nodes,
            &[],
            "html",
            &scope,
            &analysis,
            false,
            false,
        );

        assert_eq!(cleaned.trimmed.len(), 1);
        if let TemplateNode::Text(t) = &*cleaned.trimmed[0] {
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
