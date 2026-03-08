//! JavaScript/TypeScript expression AST types.
//!
//! This module wraps JavaScript expressions parsed from Svelte templates.
//! We use a typed JsNode representation for performance, with backward-compatible
//! serde_json::Value access via lazy conversion.

use compact_str::CompactString;
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

use super::span::SourceLocation;
use super::typed_expr::{JsNode, Loc, SourcePosition};

/// Wrapper for a typed JsNode with a lazily-initialized JSON cache.
pub struct TypedExpr {
    pub node: JsNode,
    json_cache: OnceLock<serde_json::Value>,
}

impl TypedExpr {
    pub fn new(node: JsNode) -> Self {
        TypedExpr {
            node,
            json_cache: OnceLock::new(),
        }
    }

    pub fn as_json(&self) -> &serde_json::Value {
        self.json_cache.get_or_init(|| self.node.to_value())
    }
}

impl Clone for TypedExpr {
    fn clone(&self) -> Self {
        TypedExpr {
            node: self.node.clone(),
            json_cache: OnceLock::new(),
        }
    }
}

impl PartialEq for TypedExpr {
    fn eq(&self, other: &Self) -> bool {
        self.node == other.node
    }
}

impl std::fmt::Debug for TypedExpr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_tuple("TypedExpr").field(&self.node).finish()
    }
}

/// A JavaScript expression.
///
/// Supports both legacy serde_json::Value and new typed JsNode representations.
/// During migration, both variants coexist. The parser produces Typed variants,
/// and consumers can access via as_json() (lazy conversion) or as_node() (direct).
pub enum Expression {
    /// A parsed JavaScript expression as a JSON value (legacy).
    Value(serde_json::Value),
    /// A typed JavaScript expression (new, performance-optimized).
    Typed(TypedExpr),
}

impl Expression {
    /// Create a new identifier expression.
    pub fn identifier(
        name: impl Into<CompactString>,
        start: u32,
        end: u32,
        loc: Option<SourceLocation>,
    ) -> Self {
        let typed_loc = loc.map(|l| Loc {
            start: SourcePosition {
                line: l.start.line,
                column: l.start.column,
                character: None,
            },
            end: SourcePosition {
                line: l.end.line,
                column: l.end.column,
                character: None,
            },
        });
        Expression::Typed(TypedExpr::new(JsNode::Identifier {
            start,
            end,
            loc: typed_loc,
            name: name.into(),
        }))
    }

    /// Create an expression from a JSON value.
    pub fn from_json(value: serde_json::Value) -> Self {
        Expression::Value(value)
    }

    /// Create an expression from a typed JsNode.
    pub fn from_node(node: JsNode) -> Self {
        Expression::Typed(TypedExpr::new(node))
    }

    /// Get the underlying JSON value (lazy conversion for Typed variant).
    pub fn as_json(&self) -> &serde_json::Value {
        match self {
            Expression::Value(v) => v,
            Expression::Typed(te) => te.as_json(),
        }
    }

    /// Get the typed JsNode (converts from Value on demand).
    pub fn as_node(&self) -> std::borrow::Cow<'_, JsNode> {
        match self {
            Expression::Typed(te) => std::borrow::Cow::Borrowed(&te.node),
            Expression::Value(v) => std::borrow::Cow::Owned(JsNode::from_value(v.clone())),
        }
    }

    /// Get the type of the expression.
    pub fn node_type(&self) -> Option<&str> {
        match self {
            Expression::Value(v) => v.get("type").and_then(|t| t.as_str()),
            Expression::Typed(te) => te.node.node_type(),
        }
    }

    /// Get the start position.
    pub fn start(&self) -> Option<u32> {
        match self {
            Expression::Value(v) => v.get("start").and_then(|s| s.as_u64()).map(|n| n as u32),
            Expression::Typed(te) => te.node.start(),
        }
    }

    /// Get the end position.
    pub fn end(&self) -> Option<u32> {
        match self {
            Expression::Value(v) => v.get("end").and_then(|e| e.as_u64()).map(|n| n as u32),
            Expression::Typed(te) => te.node.end(),
        }
    }

    /// Check if this is an Identifier with the given name.
    #[inline]
    pub fn is_identifier(&self, name: &str) -> bool {
        match self {
            Expression::Typed(te) => {
                matches!(&te.node, JsNode::Identifier { name: n, .. } if n.as_str() == name)
            }
            Expression::Value(v) => {
                v.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && v.get("name").and_then(|n| n.as_str()) == Some(name)
            }
        }
    }

    /// Check if this is an Identifier (any name).
    #[inline]
    pub fn is_identifier_node(&self) -> bool {
        self.node_type() == Some("Identifier")
    }

    /// Get the identifier name if this is an Identifier node.
    #[inline]
    pub fn identifier_name(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => match &te.node {
                JsNode::Identifier { name, .. } => Some(name.as_str()),
                JsNode::Raw(v) => {
                    if v.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                        v.get("name").and_then(|n| n.as_str())
                    } else {
                        None
                    }
                }
                _ => None,
            },
            Expression::Value(v) => {
                if v.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                    v.get("name").and_then(|n| n.as_str())
                } else {
                    None
                }
            }
        }
    }

    /// Check if this expression is a MemberExpression.
    #[inline]
    pub fn is_member_expression(&self) -> bool {
        self.node_type() == Some("MemberExpression")
    }

    /// Check if this is a computed MemberExpression.
    #[inline]
    pub fn is_computed(&self) -> bool {
        match self {
            Expression::Typed(te) => match &te.node {
                JsNode::MemberExpression { computed, .. } | JsNode::Property { computed, .. } => {
                    *computed
                }
                _ => false,
            },
            Expression::Value(v) => v.get("computed").and_then(|c| c.as_bool()).unwrap_or(false),
        }
    }
}

impl Clone for Expression {
    fn clone(&self) -> Self {
        match self {
            Expression::Value(v) => Expression::Value(v.clone()),
            Expression::Typed(te) => Expression::Typed(te.clone()),
        }
    }
}

impl PartialEq for Expression {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Expression::Value(a), Expression::Value(b)) => a == b,
            (Expression::Typed(a), Expression::Typed(b)) => a == b,
            // Cross-variant comparison: convert to JSON
            (a, b) => a.as_json() == b.as_json(),
        }
    }
}

impl std::fmt::Debug for Expression {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Expression::Value(v) => f.debug_tuple("Expression::Value").field(v).finish(),
            Expression::Typed(te) => f.debug_tuple("Expression::Typed").field(&te.node).finish(),
        }
    }
}

impl Serialize for Expression {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Expression::Value(v) => v.serialize(serializer),
            Expression::Typed(te) => te.node.serialize(serializer),
        }
    }
}

impl<'de> Deserialize<'de> for Expression {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = serde_json::Value::deserialize(deserializer)?;
        Ok(Expression::Value(value))
    }
}

impl Default for Expression {
    fn default() -> Self {
        Expression::Value(serde_json::Value::Null)
    }
}
