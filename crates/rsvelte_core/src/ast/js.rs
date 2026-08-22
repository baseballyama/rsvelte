//! JavaScript/TypeScript expression AST types.
//!
//! This module wraps JavaScript expressions parsed from Svelte templates.
//! We use a typed `JsNode` representation for performance, with backward-compatible
//! `serde_json::Value` access via lazy conversion.

use std::marker::PhantomData;

use compact_str::CompactString;
use serde::{Deserialize, Serialize};

use super::arena::{IdRange, JsNodeId};
use super::span::SourceLocation;
use super::typed_expr::{JsNode, Loc, SourcePosition};

/// Wrapper for a typed `JsNode` with lazy JSON cache.
/// The cache is only populated when `as_json()` is first called (during Phase 2/3),
/// not during parsing.
///
/// This saves 40 bytes per expression during parse, while still avoiding repeated
/// serialization during analysis/transform.
pub struct TypedExpr<'a> {
    pub node: JsNode,
    /// Boxed so an unpopulated cache costs one null pointer (8 B) rather than
    /// an inline `serde_json::Value` (72 B) in every expression.
    json_cache: std::cell::OnceCell<Box<serde_json::Value>>,
    /// Reserves the borrowed-AST lifetime `'a` ahead of M5-B, when the typed
    /// node's verbatim strings (operators, `Literal.raw`) borrow from source.
    _marker: PhantomData<&'a ()>,
}

impl TypedExpr<'_> {
    #[inline(always)]
    #[must_use]
    pub const fn new(node: JsNode) -> Self {
        TypedExpr {
            node,
            json_cache: std::cell::OnceCell::new(),
            _marker: PhantomData,
        }
    }

    /// Get JSON value, caching for subsequent calls.
    /// First call is expensive (serde serialization), subsequent calls are O(1).
    #[inline]
    pub fn as_json(&self) -> &serde_json::Value {
        self.json_cache.get_or_init(|| {
            let value = Box::new(self.node.to_value());
            #[cfg(feature = "measure-json")]
            measure_json::record(&value);
            value
        })
    }

    /// Whether `as_json()` has already materialized this expression, so a test
    /// can assert that a typed reader never reached for the JSON.
    #[cfg(test)]
    pub fn json_is_materialized(&self) -> bool {
        self.json_cache.get().is_some()
    }
}

/// Deterministic counters for how much `serde_json::Value` the lazy JSON cache
/// materializes.
///
/// They quantify JSON-backed reader costs without a sampling profiler or a quiet machine.
#[cfg(feature = "measure-json")]
pub mod measure_json {
    use std::cell::Cell;

    thread_local! {
        static MATERIALIZATIONS: Cell<u64> = const { Cell::new(0) };
        static NODES: Cell<u64> = const { Cell::new(0) };
        static MAP_ENTRIES: Cell<u64> = const { Cell::new(0) };
        static STRINGS: Cell<u64> = const { Cell::new(0) };
    }

    fn walk(value: &serde_json::Value, nodes: &mut u64, entries: &mut u64, strings: &mut u64) {
        match value {
            serde_json::Value::Object(map) => {
                *nodes += 1;
                *entries += map.len() as u64;
                // Each entry owns a heap `String` key; string values own one more.
                *strings += map.len() as u64;
                for (_, v) in map {
                    walk(v, nodes, entries, strings);
                }
            }
            serde_json::Value::Array(items) => {
                for v in items {
                    walk(v, nodes, entries, strings);
                }
            }
            serde_json::Value::String(_) => *strings += 1,
            _ => {}
        }
    }

    pub(super) fn record(value: &serde_json::Value) {
        let (mut nodes, mut entries, mut strings) = (0, 0, 0);
        walk(value, &mut nodes, &mut entries, &mut strings);
        MATERIALIZATIONS.with(|c| c.set(c.get() + 1));
        NODES.with(|c| c.set(c.get() + nodes));
        MAP_ENTRIES.with(|c| c.set(c.get() + entries));
        STRINGS.with(|c| c.set(c.get() + strings));
    }

    /// `(materializations, objects, map_entries, strings)` since the last reset.
    pub fn snapshot() -> (u64, u64, u64, u64) {
        (
            MATERIALIZATIONS.with(std::cell::Cell::get),
            NODES.with(std::cell::Cell::get),
            MAP_ENTRIES.with(std::cell::Cell::get),
            STRINGS.with(std::cell::Cell::get),
        )
    }

    pub fn reset() {
        MATERIALIZATIONS.with(|c| c.set(0));
        NODES.with(|c| c.set(0));
        MAP_ENTRIES.with(|c| c.set(0));
        STRINGS.with(|c| c.set(0));
    }
}

impl Clone for TypedExpr<'_> {
    #[inline]
    fn clone(&self) -> Self {
        TypedExpr {
            node: self.node.clone(),
            json_cache: std::cell::OnceCell::new(), // Cache not shared on clone
            _marker: PhantomData,
        }
    }
}

impl PartialEq for TypedExpr<'_> {
    fn eq(&self, other: &Self) -> bool {
        self.node == other.node
    }
}

impl std::fmt::Debug for TypedExpr<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_tuple("TypedExpr").field(&self.node).finish()
    }
}

/// How a deferred expression's parse failure must be reported, and whether the
/// eager parser it replaces built `loc` objects.
///
/// Each variant mirrors one parse-time entry point so `resolve_lazy_expressions`
/// reproduces diagnostics byte-for-byte.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum LazyKind {
    /// `{expr}` mustache: leftover input after a complete expression is an
    /// `expected_token`, anything else a `js_parse_error` spanning the body.
    Mustache,
    /// Attribute value / quoted-value chunk: always a point `js_parse_error`.
    Attribute,
    /// Block or directive head terminated by `}`.
    HeadBrace,
    /// `{#each … (key)}` head terminated by `)`.
    HeadParen,
    /// `{#await …}` head: classified against the whole head, because acorn can
    /// consume the `then` / `catch` keyword the template scan stopped at.
    AwaitHead,
    /// Error-swallowing head: a parse failure recovers with an empty identifier
    /// and raises nothing.
    Lenient,
}

/// A JavaScript expression.
///
/// Backed by a typed `JsNode`. The parser produces `Typed` (or `Lazy`, which is
/// resolved before analysis); consumers access via `as_json()` (lazy JSON
/// conversion) or `as_node()` (direct).
pub enum Expression<'a> {
    /// A typed JavaScript expression (performance-optimized).
    // Boxed: an inline `TypedExpr` made `Expression` 152 B, which the template
    // AST then embeds up to three times per node — the resulting `Vec` growth
    // memcpy and struct moves cost more than the one allocation per expression
    // that boxing adds (A/B: parse −3% fixtures / −6% real-world).
    Typed(Box<TypedExpr<'a>>),
    /// A deferred expression — stores source byte offsets (zero allocation).
    /// Resolved by `resolve_lazy_expressions()` before analysis.
    Lazy {
        /// Byte offset of expression start in source.
        start: u32,
        /// Byte offset of expression end in source.
        end: u32,
        /// Whether source is TypeScript.
        ts: bool,
        /// Which parse-time entry point deferred this expression.
        kind: LazyKind,
    },
}

// `Expression` is embedded by value in every expression-bearing template node
// (`ExpressionTag`, `Attribute`, `EachBlock`, `AwaitBlock`, …), so its width
// multiplies into `Vec` growth memcpy and struct moves on the parse hot path.
#[cfg(target_pointer_width = "64")]
const _: () = assert!(std::mem::size_of::<Expression<'static>>() == 16);

impl Expression<'_> {
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
        Expression::Typed(Box::new(TypedExpr::new(JsNode::Identifier {
            start,
            end,
            loc: typed_loc,
            name: name.into(),
            optional: false,
            type_annotation: None,
        })))
    }

    /// Create an expression from a JSON value (types it eagerly via `from_value`).
    #[must_use]
    pub fn from_json(value: serde_json::Value) -> Self {
        Expression::from_node(JsNode::from_value(value))
    }

    /// Create an expression from a typed `JsNode`.
    #[must_use]
    pub fn from_node(node: JsNode) -> Self {
        Expression::Typed(Box::new(TypedExpr::new(node)))
    }

    /// Get the underlying JSON value. Cached for Typed variant.
    ///
    /// # Panics
    ///
    /// Panics when called before a lazy expression has been resolved.
    #[must_use]
    pub fn as_json(&self) -> &serde_json::Value {
        match self {
            Expression::Typed(te) => te.as_json(),
            Expression::Lazy { .. } => panic!(
                "Expression::Lazy must be resolved before access. Call ensure_expressions_parsed() first."
            ),
        }
    }

    /// See `TypedExpr::json_is_materialized`.
    #[cfg(test)]
    pub fn json_is_materialized(&self) -> bool {
        match self {
            Expression::Typed(te) => te.json_is_materialized(),
            Expression::Lazy { .. } => false,
        }
    }

    /// Always returns `None` (no variant carries a borrowable JSON value);
    /// callers should use `as_json()` or `as_node()` instead. Retained as a
    /// stable accessor for call sites that still probe for a borrowable value.
    #[must_use]
    pub const fn as_json_ref(&self) -> Option<&serde_json::Value> {
        match self {
            Expression::Typed(_) | Expression::Lazy { .. } => None,
        }
    }

    /// Get the typed `JsNode`.
    ///
    /// # Panics
    ///
    /// Panics when called before a lazy expression has been resolved.
    #[must_use]
    pub fn as_node(&self) -> std::borrow::Cow<'_, JsNode> {
        match self {
            Expression::Typed(te) => std::borrow::Cow::Borrowed(&te.node),
            Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before access"),
        }
    }

    /// Get the type of the expression.
    #[must_use]
    pub fn node_type(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => te.node.node_type(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get the start position.
    #[must_use]
    pub fn start(&self) -> Option<u32> {
        match self {
            Expression::Typed(te) => te.node.start(),
            Expression::Lazy { start, .. } => Some(*start),
        }
    }

    /// Get the end position.
    #[must_use]
    pub fn end(&self) -> Option<u32> {
        match self {
            Expression::Typed(te) => te.node.end(),
            Expression::Lazy { end, .. } => Some(*end),
        }
    }

    /// Check if this is an Identifier with the given name.
    #[inline]
    #[must_use]
    pub fn is_identifier(&self, name: &str) -> bool {
        match self {
            Expression::Typed(te) => {
                matches!(&te.node, JsNode::Identifier { name: n, .. } if n.as_str() == name)
            }
            Expression::Lazy { .. } => false,
        }
    }

    /// Check if this is an Identifier (any name).
    #[inline]
    #[must_use]
    pub fn is_identifier_node(&self) -> bool {
        self.node_type() == Some("Identifier")
    }

    /// Get the identifier name if this is an Identifier node.
    #[inline]
    #[must_use]
    pub fn identifier_name(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => match &te.node {
                JsNode::Identifier { name, .. } => Some(name.as_str()),
                _ => None,
            },
            Expression::Lazy { .. } => None,
        }
    }

    /// Check if this expression is a `MemberExpression`.
    #[inline]
    #[must_use]
    pub fn is_member_expression(&self) -> bool {
        self.node_type() == Some("MemberExpression")
    }

    /// Check if this is a computed `MemberExpression`.
    #[inline]
    #[must_use]
    pub fn is_computed(&self) -> bool {
        match self {
            Expression::Typed(te) => match &te.node {
                JsNode::MemberExpression { computed, .. } | JsNode::Property { computed, .. } => {
                    *computed
                }
                _ => false,
            },
            Expression::Lazy { .. } => false,
        }
    }

    /// Get a direct reference to the typed `JsNode`.
    /// For `Expression::Typed`, returns a direct reference (zero cost).
    ///
    /// # Panics
    ///
    /// Panics on `Expression::Lazy`; resolve it before access.
    #[inline]
    #[must_use]
    pub fn as_node_ref(&self) -> &JsNode {
        match self {
            Expression::Typed(te) => &te.node,
            _ => panic!("as_node_ref() requires Expression::Typed"),
        }
    }

    /// Try to get a direct reference to the typed `JsNode`.
    /// Returns None for `Expression::Lazy`.
    #[inline]
    #[must_use]
    pub fn try_as_node_ref(&self) -> Option<&JsNode> {
        match self {
            Expression::Typed(te) => Some(&te.node),
            _ => None,
        }
    }

    /// Check if this expression is a Typed variant (not legacy Value or Lazy).
    #[inline]
    #[must_use]
    pub const fn is_typed(&self) -> bool {
        matches!(self, Expression::Typed(_))
    }

    /// Check if this expression is a Lazy variant that needs resolution.
    #[inline]
    #[must_use]
    pub const fn is_lazy(&self) -> bool {
        matches!(self, Expression::Lazy { .. })
    }

    // ── Delegating accessors to JsNode ─────────────────────────────

    /// Get "name" field (delegates to `JsNode::name()`).
    #[inline]
    #[must_use]
    pub fn name(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => te.node.name(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "callee" for CallExpression/NewExpression (delegates to `JsNode::callee()`).
    #[inline]
    #[must_use]
    pub fn callee(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.callee(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "arguments" for CallExpression/NewExpression.
    #[inline]
    #[must_use]
    pub fn call_arguments(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.call_arguments(),
            Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "object" for `MemberExpression`.
    #[inline]
    #[must_use]
    pub fn object(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.object(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "property" for `MemberExpression`.
    #[inline]
    #[must_use]
    pub fn property(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.property(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "left" for `BinaryExpression`, etc.
    #[inline]
    #[must_use]
    pub fn left(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.left(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "right" for `BinaryExpression`, etc.
    #[inline]
    #[must_use]
    pub fn right(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.right(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "operator" for binary/logical/assignment/update expressions.
    #[inline]
    #[must_use]
    pub fn operator(&self) -> Option<&str> {
        match self {
            Expression::Typed(te) => te.node.operator(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "argument" for `UnaryExpression`, etc.
    #[inline]
    #[must_use]
    pub fn argument(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.argument(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "properties" for ObjectExpression/ObjectPattern.
    #[inline]
    #[must_use]
    pub fn properties(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.properties(),
            Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "elements" for ArrayExpression/ArrayPattern.
    #[inline]
    #[must_use]
    pub fn elements(&self) -> &[Option<JsNode>] {
        match self {
            Expression::Typed(te) => te.node.elements(),
            Expression::Lazy { .. } => &[],
        }
    }

    /// Get "expressions" for SequenceExpression/TemplateLiteral.
    #[inline]
    #[must_use]
    pub fn expressions(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.expressions(),
            Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "params" for function-like nodes.
    #[inline]
    #[must_use]
    pub fn params(&self) -> IdRange {
        match self {
            Expression::Typed(te) => te.node.params(),
            Expression::Lazy { .. } => IdRange::empty(),
        }
    }

    /// Get "test" for `ConditionalExpression`, `IfStatement`, etc.
    #[inline]
    #[must_use]
    pub fn test(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.test(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "consequent" for `ConditionalExpression`, `IfStatement`.
    #[inline]
    #[must_use]
    pub fn consequent(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.consequent(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Get "alternate" for `ConditionalExpression`, `IfStatement`.
    #[inline]
    #[must_use]
    pub fn alternate(&self) -> Option<JsNodeId> {
        match self {
            Expression::Typed(te) => te.node.alternate(),
            Expression::Lazy { .. } => None,
        }
    }

    /// Check if the node is a function-like type.
    #[inline]
    #[must_use]
    pub fn is_function(&self) -> bool {
        match self {
            Expression::Typed(te) => te.node.is_function(),
            Expression::Lazy { .. } => false,
        }
    }
}

impl Clone for Expression<'_> {
    fn clone(&self) -> Self {
        match self {
            Expression::Typed(te) => Expression::Typed(Box::new((**te).clone())),
            Expression::Lazy {
                start,
                end,
                ts,
                kind,
            } => Expression::Lazy {
                start: *start,
                end: *end,
                ts: *ts,
                kind: *kind,
            },
        }
    }
}

impl PartialEq for Expression<'_> {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Expression::Typed(a), Expression::Typed(b)) => a == b,
            (
                Expression::Lazy {
                    start: s1,
                    end: e1,
                    ts: t1,
                    kind: k1,
                },
                Expression::Lazy {
                    start: s2,
                    end: e2,
                    ts: t2,
                    kind: k2,
                },
            ) => s1 == s2 && e1 == e2 && t1 == t2 && k1 == k2,
            // Cross-variant comparison: convert to JSON
            (a, b) => a.as_json() == b.as_json(),
        }
    }
}

impl std::fmt::Debug for Expression<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Expression::Typed(te) => f.debug_tuple("Expression::Typed").field(&te.node).finish(),
            Expression::Lazy {
                start,
                end,
                ts,
                kind,
            } => f
                .debug_tuple("Expression::Lazy")
                .field(start)
                .field(end)
                .field(ts)
                .field(kind)
                .finish(),
        }
    }
}

impl Serialize for Expression<'_> {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Expression::Typed(te) => te.node.serialize(serializer),
            Expression::Lazy { .. } => {
                panic!("Expression::Lazy must be resolved before serialization")
            }
        }
    }
}

impl<'de> Deserialize<'de> for Expression<'_> {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = serde_json::Value::deserialize(deserializer)?;
        // Only a real ESTree node (a JSON object with a non-empty `type`) can
        // become an Expression. Callers like
        // `serde_json::from_value::<Expression>(sub_value).ok()` deliberately
        // probe arbitrary sub-values (including synthetic non-node carriers such
        // as `{ "name": "x" }`) and expect a graceful `None` on failure — so we
        // must return a deserialize Error here rather than letting
        // `JsNode::from_value` degrade a typeless object to `Null`.
        let is_node = value
            .get("type")
            .and_then(|t| t.as_str())
            .is_some_and(|t| !t.is_empty());
        if !is_node {
            return Err(serde::de::Error::custom(
                "Expression JSON is not an ESTree node (missing `type`)",
            ));
        }
        Ok(Expression::from_node(JsNode::from_value(value)))
    }
}

impl Default for Expression<'_> {
    fn default() -> Self {
        Expression::from_node(JsNode::Null)
    }
}
