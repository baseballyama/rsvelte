//! Template building for client-side code generation.
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-template/template.js`

use super::fix_attribute_casing::fix_attribute_casing;
use super::types::{Comment, Element, Node, TextNode};
use crate::ast::template::Text;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;
use crate::compiler::phases::phase3_transform::shared::template::{escape_attr, is_void_element};
use regex::Regex;
use std::sync::LazyLock;

// Cached regex for stripping leading newline from pre/textarea content
static REGEX_LEADING_NEWLINE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^\r?\n").unwrap());

/// Path to a node in the tree, represented as indices at each level.
/// An empty path means the root nodes vector.
/// [0] means the first child of root.
/// [0, 2] means the third child of the first element in root.
type NodePath = Vec<usize>;

/// `true` if HTML template contains a `<script>` tag. In this case we need to invoke a special
/// template instantiation function
#[derive(Debug, Clone)]
pub struct Template {
    /// `true` if HTML template contains a `<script>` tag
    pub contains_script_tag: bool,

    /// `true` if the HTML template needs to be instantiated with `importNode`
    pub needs_import_node: bool,

    /// Template nodes
    pub nodes: Vec<Node>,

    /// Stack of paths for nesting - each path points to the parent element's children
    path_stack: Vec<NodePath>,

    /// Current element being built (stored separately for set_prop access)
    current_element: Option<Element>,
}

impl Template {
    /// Create a new template builder.
    pub fn new() -> Self {
        Template {
            contains_script_tag: false,
            needs_import_node: false,
            nodes: Vec::new(),
            path_stack: vec![vec![]], // Start with root path (empty)
            current_element: None,
        }
    }

    /// Get a mutable reference to the current fragment (nodes at current path).
    fn current_fragment_mut(&mut self) -> &mut Vec<Node> {
        let path = self.path_stack.last().cloned().unwrap_or_default();
        self.get_nodes_at_path_mut(&path)
    }

    /// Get nodes at a given path.
    fn get_nodes_at_path_mut(&mut self, path: &[usize]) -> &mut Vec<Node> {
        if path.is_empty() {
            return &mut self.nodes;
        }

        let mut current = &mut self.nodes;
        for &idx in &path[..path.len() - 1] {
            if let Some(Node::Element(elem)) = current.get_mut(idx) {
                current = &mut elem.children;
            } else {
                // Shouldn't happen if paths are managed correctly
                panic!("Invalid path: expected element at index {}", idx);
            }
        }

        // Return the children of the last element in the path
        let last_idx = path[path.len() - 1];
        if let Some(Node::Element(elem)) = current.get_mut(last_idx) {
            &mut elem.children
        } else {
            // Shouldn't happen
            panic!("Invalid path: expected element at last index {}", last_idx);
        }
    }

    /// Push a new element onto the template.
    pub fn push_element(&mut self, name: String, start: u32) {
        let element = Element {
            node_type: "element",
            name,
            attributes: indexmap::IndexMap::new(),
            children: Vec::new(),
            start,
        };

        // Get current path
        let current_path = self.path_stack.last().cloned().unwrap_or_default();

        // Add element to current fragment
        let fragment = self.get_nodes_at_path_mut(&current_path);
        fragment.push(Node::Element(element.clone()));
        let new_idx = fragment.len() - 1;

        // Store current element for set_prop
        self.current_element = Some(element);

        // Create new path pointing to this element
        let mut new_path = current_path;
        new_path.push(new_idx);
        self.path_stack.push(new_path);
    }

    /// Push a comment node.
    pub fn push_comment(&mut self, data: Option<String>) {
        let comment = Comment {
            node_type: "comment",
            data,
        };

        let fragment = self.current_fragment_mut();
        fragment.push(Node::Comment(comment));
    }

    /// Push text nodes.
    pub fn push_text(&mut self, nodes: Vec<Text>) {
        let text = TextNode {
            node_type: "text",
            nodes,
        };

        let fragment = self.current_fragment_mut();
        fragment.push(Node::Text(text));
    }

    /// Pop the current element from the stack.
    pub fn pop_element(&mut self) {
        self.path_stack.pop();
        // Update current_element to the parent element (or None if at root)
        self.current_element = self.get_current_element();
    }

    /// Get the current element (the one at the top of the path stack).
    fn get_current_element(&self) -> Option<Element> {
        if self.path_stack.len() <= 1 {
            return None;
        }

        let path = &self.path_stack[self.path_stack.len() - 1];
        if path.is_empty() {
            return None;
        }

        // Navigate to the element
        let mut current: &Vec<Node> = &self.nodes;
        for &idx in &path[..path.len() - 1] {
            if let Some(Node::Element(elem)) = current.get(idx) {
                current = &elem.children;
            } else {
                return None;
            }
        }

        let last_idx = path[path.len() - 1];
        if let Some(Node::Element(elem)) = current.get(last_idx) {
            Some(elem.clone())
        } else {
            None
        }
    }

    /// Set a property on the current element.
    pub fn set_prop(&mut self, key: String, value: Option<String>) {
        // We need to set the property on the actual element in the tree,
        // not just on current_element (which is a copy)
        if self.path_stack.len() <= 1 {
            return;
        }

        let path = self.path_stack.last().cloned().unwrap_or_default();
        if path.is_empty() {
            return;
        }

        // Navigate to the parent of the current element
        let parent_path = &path[..path.len() - 1];
        let last_idx = path[path.len() - 1];

        let parent_fragment = self.get_nodes_at_path_mut(parent_path);
        if let Some(Node::Element(elem)) = parent_fragment.get_mut(last_idx) {
            elem.attributes.insert(key.clone(), value.clone());
            // Also update current_element
            if let Some(ref mut ce) = self.current_element {
                ce.attributes.insert(key, value);
            }
        }
    }

    /// Convert template to HTML string expression.
    pub fn as_html(&self) -> JsExpr {
        let html = self
            .nodes
            .iter()
            .map(stringify)
            .collect::<Vec<_>>()
            .join("");
        b::template(vec![b::quasi(html, true)], vec![])
    }

    /// Convert template to tree array expression.
    pub fn as_tree(&mut self) -> JsExpr {
        // If the first item is a comment we need to add another comment for effect.start
        if let Some(Node::Comment(_)) = self.nodes.first() {
            self.nodes.insert(
                0,
                Node::Comment(Comment {
                    node_type: "comment",
                    data: None,
                }),
            );
        }

        let elements: Vec<JsExpr> = self.nodes.iter().filter_map(objectify).collect();

        b::array(elements)
    }
}

impl Default for Template {
    fn default() -> Self {
        Self::new()
    }
}

/// Normalize whitespace in text content for template strings.
/// Collapses sequences of whitespace (including newlines and tabs) into single spaces.
fn normalize_template_whitespace(text: &str) -> String {
    // Replace newlines and tabs with spaces, then collapse multiple spaces
    let mut result = String::with_capacity(text.len());
    let mut last_was_whitespace = false;

    for c in text.chars() {
        if c == '\n' || c == '\r' || c == '\t' || c == ' ' {
            if !last_was_whitespace {
                result.push(' ');
                last_was_whitespace = true;
            }
            // Skip additional whitespace characters
        } else {
            result.push(c);
            last_was_whitespace = false;
        }
    }

    result
}

/// Stringify element children with proper whitespace handling.
/// - Trims leading whitespace from the first child (if text)
/// - Trims trailing whitespace from the last child (if text)
/// - Normalizes internal whitespace
/// - Preserves single-space placeholders for dynamic text nodes
fn stringify_children(children: &[Node]) -> String {
    let mut result = String::new();

    for (i, child) in children.iter().enumerate() {
        let is_first = i == 0;
        let is_last = i == children.len() - 1;

        match child {
            Node::Text(text) => {
                let raw_text: String = text.nodes.iter().map(|node| &node.raw).cloned().collect();
                let normalized = normalize_template_whitespace(&raw_text);

                // Special case: preserve single-space placeholder for dynamic text nodes
                // This is used when there's an expression tag that will be replaced at runtime
                if normalized == " " && children.len() == 1 {
                    result.push(' ');
                    continue;
                }

                // Trim leading whitespace if this is the first child
                let trimmed = if is_first {
                    normalized.trim_start()
                } else {
                    &normalized
                };

                // Trim trailing whitespace if this is the last child
                let final_text = if is_last { trimmed.trim_end() } else { trimmed };

                result.push_str(final_text);
            }
            _ => {
                result.push_str(&stringify(child));
            }
        }
    }

    result
}

/// Convert a node to HTML string.
fn stringify(item: &Node) -> String {
    match item {
        Node::Text(text) => {
            let raw_text: String = text.nodes.iter().map(|node| &node.raw).cloned().collect();
            normalize_template_whitespace(&raw_text)
        }
        Node::Comment(comment) => {
            if let Some(ref data) = comment.data {
                format!("<!--{}-->", data)
            } else {
                "<!>".to_string()
            }
        }
        Node::Element(element) => {
            let mut str = format!("<{}", element.name);

            for (key, value) in &element.attributes {
                str.push(' ');
                str.push_str(key);
                if let Some(val) = value {
                    str.push_str(&format!("=\"{}\"", escape_attr(val)));
                }
            }

            if is_void_element(&element.name) {
                str.push_str("/>");
            } else {
                str.push('>');
                // Use stringify_children to properly handle whitespace at element boundaries
                str.push_str(&stringify_children(&element.children));
                str.push_str(&format!("</{}>", element.name));
            }

            str
        }
    }
}

/// Convert a node to a JavaScript expression for tree building.
fn objectify(item: &Node) -> Option<JsExpr> {
    match item {
        Node::Text(text) => {
            let data = text
                .nodes
                .iter()
                .map(|node| &node.data)
                .cloned()
                .collect::<Vec<_>>()
                .join("");
            Some(b::string(data))
        }
        Node::Comment(comment) => comment
            .data
            .as_ref()
            .map(|data| b::array(vec![b::string(format!("// {}", data))])),
        Node::Element(element) => {
            let mut element_array = vec![b::string(element.name.clone())];

            let mut attributes_props = Vec::new();
            for (key, value) in &element.attributes {
                let fixed_key = fix_attribute_casing(key);
                let prop_value = match value {
                    Some(v) => b::string(v.clone()),
                    None => b::undefined(),
                };

                attributes_props.push(b::prop(fixed_key, prop_value));
            }

            let has_attributes = !attributes_props.is_empty();
            let attributes = b::object(attributes_props);

            if has_attributes || !element.children.is_empty() {
                element_array.push(if has_attributes {
                    attributes
                } else {
                    b::null()
                });
            }

            if !element.children.is_empty() {
                let children: Vec<JsExpr> = element.children.iter().filter_map(objectify).collect();

                // Special case — strip leading newline from `<pre>` and `<textarea>`
                if (element.name == "pre" || element.name == "textarea") && !children.is_empty()
                    && let Some(first) = children.first()
                        && let JsExpr::Literal(lit) = first
                            && let crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral::String(s) = lit {
                                let new_value = REGEX_LEADING_NEWLINE.replace(s, "").to_string();
                                let mut modified_children = children.clone();
                                modified_children[0] = b::string(new_value);
                                element_array.extend(modified_children);
                                return Some(b::array(element_array));
                            }

                element_array.extend(children);
            }

            Some(b::array(element_array))
        }
    }
}
