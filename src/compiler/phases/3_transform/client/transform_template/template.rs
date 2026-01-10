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

    /// Stack of node arrays for nesting
    stack: Vec<*mut Vec<Node>>,

    /// Current element being built
    element: Option<Element>,

    /// Current fragment (reference to current nodes array)
    fragment: *mut Vec<Node>,
}

impl Template {
    /// Create a new template builder.
    pub fn new() -> Self {
        let mut template = Template {
            contains_script_tag: false,
            needs_import_node: false,
            nodes: Vec::new(),
            stack: Vec::new(),
            element: None,
            fragment: std::ptr::null_mut(),
        };

        // Initialize fragment pointer to nodes
        template.fragment = &mut template.nodes as *mut Vec<Node>;
        template.stack.push(template.fragment);

        template
    }

    /// Push a new element onto the template.
    pub fn push_element(&mut self, name: String, start: u32) {
        let element = Element {
            node_type: "element",
            name,
            attributes: std::collections::HashMap::new(),
            children: Vec::new(),
            start,
        };

        // Push element to current fragment
        unsafe {
            (*self.fragment).push(Node::Element(element.clone()));
        }

        self.element = Some(element);

        // Update fragment to point to the element's children
        if let Some(Node::Element(elem)) = unsafe { (*self.fragment).last_mut() } {
            self.fragment = &mut elem.children as *mut Vec<Node>;
            self.stack.push(self.fragment);
        }
    }

    /// Push a comment node.
    pub fn push_comment(&mut self, data: Option<String>) {
        let comment = Comment {
            node_type: "comment",
            data,
        };

        unsafe {
            (*self.fragment).push(Node::Comment(comment));
        }
    }

    /// Push text nodes.
    pub fn push_text(&mut self, nodes: Vec<Text>) {
        let text = TextNode {
            node_type: "text",
            nodes,
        };

        unsafe {
            (*self.fragment).push(Node::Text(text));
        }
    }

    /// Pop the current element from the stack.
    pub fn pop_element(&mut self) {
        self.stack.pop();
        if let Some(&last) = self.stack.last() {
            self.fragment = last;
        }
    }

    /// Set a property on the current element.
    pub fn set_prop(&mut self, key: String, value: Option<String>) {
        if let Some(ref mut element) = self.element {
            element.attributes.insert(key, value);
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

/// Convert a node to HTML string.
fn stringify(item: &Node) -> String {
    match item {
        Node::Text(text) => text.nodes.iter().map(|node| &node.raw).cloned().collect(),
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
                for child in &element.children {
                    str.push_str(&stringify(child));
                }
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
                                let regex = Regex::new(r"^\r?\n").unwrap();
                                let new_value = regex.replace(s, "").to_string();
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
