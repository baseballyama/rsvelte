//! JavaScript/TypeScript expression AST types.
//!
//! This module wraps JavaScript expressions parsed from Svelte templates.
//! We use a typed JsNode representation for performance, with backward-compatible
//! serde_json::Value access via lazy conversion.

use compact_str::CompactString;
use serde::{Deserialize, Serialize};

use super::arena::{IdRange, JsNodeId};
use super::span::SourceLocation;
use super::typed_expr::{JsNode, Loc, SourcePosition};

/// Wrapper for a typed JsNode. JSON conversion is done on-demand without caching.
/// This eliminates the 40-byte OnceCell overhead per expression.
pub struct TypedExpr {
    pub node: JsNode,
}

impl TypedExpr {
    #[inline(always)]
    pub fn new(node: JsNode) -> Self {
        TypedExpr { node }
    }

    #[inline]
    pub fn as_json(&self) -> serde_json::Value {
        self.node.to_value()
    }
}

impl Clone for TypedExpr {
    #[inline]
    fn clone(&self) -> Self {
        TypedExpr {
            node: self.node.clone(),
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
    /// A deferred expression — stores source byte offsets (zero allocation).
    /// Resolved by `resolve_lazy_expressions()` before analysis.
    Lazy {
        /// Byte offset of expression start in source.
        start: u32,
        /// Byte offset of expression end in source.
        end: u32,
        /// Whether source is TypeScript.
        ts: bool,
    },
}

impl Expression {
    /// Create a new identifier expression.
    pub fn identifier(
        name: impl Into<CompactString>,
        start: u32,
        end: u32,
        loc: Option<SourceLocation>,
    ) -> Self {
        let typed_loc = loc.map(|l| {
            Box::new(Loc {
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
            })
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

    /// Get the underlying JSON value. For Typed variant, creates a new Value each time.
    /// For performance-critical paths, prefer working with JsNode directly via as_node().
    pub fn as_json(&self) -> serde_json::Value {
        match self {
            Expression::Value(v) => v.clone(),
            Expression::Typed(te) => te.as_json(),
            Expression::Lazy { .. } => panic!(
                "Expression::Lazy must be resolved before access. Call ensure_expressions_parsed() first."
            ),
        }
    }

    /// Get a reference to the JSON value (only available for Value variant).
    /// For Typed variant, returns None - caller should use as_json() or to_json() instead.
    pub fn as_json_ref(&self) -> Option<&serde_json::Value> {
        match self {
            Expression::Value(v) => Some(v),
            Expression::Typed(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get the typed JsNode (converts from Value on demand).
    pub fn as_node(&self) -> std::borrow::Cow<'_, JsNode> {
        match self {
            Expression::Typed(te) => std::borrow::Cow::Borrowed(&te.node),
            Expression::Value(v) => std::borrow::Cow::Owned(JsNode::from_value(v.clone())),
            Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before access"),
        }
    }

    /// Get the type of the expression.
    pub fn node_type(&self) -> Option<&str> {
        match self {
            Expression::Value(v) => v.get("type").and_then(|t| t.as_str()),
            Expression::Typed(te) => te.node.node_type(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get the start position.
    pub fn start(&self) -> Option<u32> {
        match self {
            Expression::Value(v) => v.get("start").and_then(|s| s.as_u64()).map(|n| n as u32),
            Expression::Typed(te) => te.node.start(),
            Expression::Lazy { start, .. } => Some(*start),
        }
    }

    /// Get the end position.
    pub fn end(&self) -> Option<u32> {
        match self {
            Expression::Value(v) => v.get("end").and_then(|e| e.as_u64()).map(|n| n as u32),
            Expression::Typed(te) => te.node.end(),
            Expression::Lazy { end, .. } => Some(*end),
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
            Expression::Lazy { .. } => false,
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
            Expression::Lazy { .. } => None,
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
            Expression::Lazy { .. } => false,
        }
    }

    /// Get a direct reference to the typed JsNode.
    /// For Expression::Typed, returns a direct reference (zero cost).
    /// For Expression::Value, converts lazily and caches.
    /// Panics if called on Expression::Value (legacy path - should not happen in normal flow).
    #[inline]
    pub fn as_node_ref(&self) -> &JsNode {
        match self {
            Expression::Typed(te) => &te.node,
            _ => panic!("as_node_ref() requires Expression::Typed"),
        }
    }

    /// Try to get a direct reference to the typed JsNode.
    /// Returns None for Expression::Value and Expression::Lazy.
    #[inline]
    pub fn try_as_node_ref(&self) -> Option<&JsNode> {
        match self {
            Expression::Typed(te) => Some(&te.node),
            _ => None,
        }
    }

    /// Check if this expression is a Typed variant (not legacy Value or Lazy).
    #[inline]
    pub fn is_typed(&self) -> bool {
        matches!(self, Expression::Typed(_))
    }

    /// Check if this expression is a Lazy variant that needs resolution.
    #[inline]
    pub fn is_lazy(&self) -> bool {
        matches!(self, Expression::Lazy { .. })
    }

    // ── Delegating accessors to JsNode ─────────────────────────────

    /// Get "name" field (delegates to JsNode::name()).
    #[inline]
    pub fn name(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => te.node.name(),
            Expression::Value(v) => v.get("name").and_then(|n| n.as_str()),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "callee" for CallExpression/NewExpression (delegates to JsNode::callee()).
    #[inline]
    pub fn callee(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.callee(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "arguments" for CallExpression/NewExpression.
    #[inline]
    pub fn call_arguments(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.call_arguments(),
            Expression::Value(_) | Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "object" for MemberExpression.
    #[inline]
    pub fn object(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.object(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "property" for MemberExpression.
    #[inline]
    pub fn property(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.property(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "left" for BinaryExpression, etc.
    #[inline]
    pub fn left(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.left(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "right" for BinaryExpression, etc.
    #[inline]
    pub fn right(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.right(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "operator" for binary/logical/assignment/update expressions.
    #[inline]
    pub fn operator(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => te.node.operator(),
            Expression::Value(v) => v.get("operator").and_then(|o| o.as_str()),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "argument" for UnaryExpression, etc.
    #[inline]
    pub fn argument(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.argument(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "properties" for ObjectExpression/ObjectPattern.
    #[inline]
    pub fn properties(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.properties(),
            Expression::Value(_) | Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "elements" for ArrayExpression/ArrayPattern.
    #[inline]
    pub fn elements(&self) -> &[Option<JsNode>] {
        match self {
            Expression::Typed(te) => te.node.elements(),
            Expression::Value(_) | Expression::Lazy { .. } => &[],
        }
    }

    /// Get "expressions" for SequenceExpression/TemplateLiteral.
    #[inline]
    pub fn expressions(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.expressions(),
            Expression::Value(_) | Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "params" for function-like nodes.
    #[inline]
    pub fn params(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.params(),
            Expression::Value(_) | Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "test" for ConditionalExpression, IfStatement, etc.
    #[inline]
    pub fn test(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.test(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "consequent" for ConditionalExpression, IfStatement.
    #[inline]
    pub fn consequent(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.consequent(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get "alternate" for ConditionalExpression, IfStatement.
    #[inline]
    pub fn alternate(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.alternate(),
            Expression::Value(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Check if the node is a function-like type.
    #[inline]
    pub fn is_function(&self) -> bool {
        match self {
            Expression::Typed(te) => te.node.is_function(),
            Expression::Value(v) => matches!(
                v.get("type").and_then(|t| t.as_str()),
                Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration")
            ),
            Expression::Lazy { .. } => false,
        }
    }
}

impl Clone for Expression {
    fn clone(&self) -> Self {
        match self {
            Expression::Value(v) => Expression::Value(v.clone()),
            Expression::Typed(te) => Expression::Typed(te.clone()),
            Expression::Lazy { start, end, ts } => Expression::Lazy {
                start: *start,
                end: *end,
                ts: *ts,
            },
        }
    }
}

impl PartialEq for Expression {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Expression::Value(a), Expression::Value(b)) => a == b,
            (Expression::Typed(a), Expression::Typed(b)) => a == b,
            (
                Expression::Lazy {
                    start: s1,
                    end: e1,
                    ts: t1,
                },
                Expression::Lazy {
                    start: s2,
                    end: e2,
                    ts: t2,
                },
            ) => s1 == s2 && e1 == e2 && t1 == t2,
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
            Expression::Lazy { start, end, ts } => f
                .debug_tuple("Expression::Lazy")
                .field(start)
                .field(end)
                .field(ts)
                .finish(),
        }
    }
}

impl Serialize for Expression {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Expression::Value(v) => v.serialize(serializer),
            Expression::Typed(te) => te.node.serialize(serializer),
            Expression::Lazy { .. } => {
                panic!("Expression::Lazy must be resolved before serialization")
            }
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
