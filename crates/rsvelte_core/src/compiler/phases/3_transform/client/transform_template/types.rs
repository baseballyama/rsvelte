use crate::ast::template::Text;
use indexmap::IndexMap;

/// Element node in the template
#[derive(Debug, Clone)]
pub struct Element {
    pub node_type: &'static str, // Always "element"
    pub name: String,
    /// Using IndexMap to preserve insertion order of attributes
    pub attributes: IndexMap<String, Option<String>>,
    pub children: Vec<Node>,
    /// Used for populating __svelte_meta
    pub start: u32,
    /// True if this is an HTML element (not SVG/MathML) - used for attribute name lowercasing
    pub is_html: bool,
}

/// Text node in the template.
///
/// The stored `Text` is owned (`'static`): this codegen IR outlives the borrow
/// of the parse source, so text pushed here is converted to owned at the
/// boundary (see `Template::push_text`).
#[derive(Debug, Clone)]
pub struct TextNode {
    pub node_type: &'static str, // Always "text"
    pub nodes: Vec<Text<'static>>,
}

/// Comment node in the template
#[derive(Debug, Clone)]
pub struct Comment {
    pub node_type: &'static str, // Always "comment"
    pub data: Option<String>,
}

/// Template node (Element, Text, or Comment)
#[derive(Debug, Clone)]
pub enum Node {
    Element(Element),
    Text(TextNode),
    Comment(Comment),
}

impl Node {
    pub fn node_type(&self) -> &'static str {
        match self {
            Node::Element(_) => "element",
            Node::Text(_) => "text",
            Node::Comment(_) => "comment",
        }
    }
}
