use crate::ast::template::Text;
use std::collections::HashMap;

/// Element node in the template
#[derive(Debug, Clone)]
pub struct Element {
    pub node_type: &'static str, // Always "element"
    pub name: String,
    pub attributes: HashMap<String, Option<String>>,
    pub children: Vec<Node>,
    /// Used for populating __svelte_meta
    pub start: u32,
}

/// Text node in the template
#[derive(Debug, Clone)]
pub struct TextNode {
    pub node_type: &'static str, // Always "text"
    pub nodes: Vec<Text>,
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
