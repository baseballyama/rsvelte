//! JavaScript/TypeScript expression AST types.
//!
//! This module wraps JavaScript expressions parsed from Svelte templates.
//! We use a JSON value representation to match Svelte's estree-compatible output.

use compact_str::CompactString;
use serde::{Deserialize, Serialize};

use super::span::SourceLocation;

/// A JavaScript expression.
///
/// We use serde_json::Value for flexibility to match Svelte's estree output exactly.
/// This allows us to handle all JavaScript AST node types without defining each one.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Expression {
    /// A parsed JavaScript expression as a JSON value.
    Value(serde_json::Value),
}

impl Expression {
    /// Create a new identifier expression.
    pub fn identifier(
        name: impl Into<CompactString>,
        start: u32,
        end: u32,
        loc: Option<SourceLocation>,
    ) -> Self {
        let mut obj = serde_json::Map::new();
        obj.insert(
            "type".to_string(),
            serde_json::Value::String("Identifier".to_string()),
        );
        obj.insert(
            "name".to_string(),
            serde_json::Value::String(name.into().to_string()),
        );
        obj.insert("start".to_string(), serde_json::Value::Number(start.into()));
        obj.insert("end".to_string(), serde_json::Value::Number(end.into()));

        if let Some(loc) = loc {
            let mut loc_obj = serde_json::Map::new();
            let mut start_obj = serde_json::Map::new();
            start_obj.insert(
                "line".to_string(),
                serde_json::Value::Number(loc.start.line.into()),
            );
            start_obj.insert(
                "column".to_string(),
                serde_json::Value::Number(loc.start.column.into()),
            );
            let mut end_obj = serde_json::Map::new();
            end_obj.insert(
                "line".to_string(),
                serde_json::Value::Number(loc.end.line.into()),
            );
            end_obj.insert(
                "column".to_string(),
                serde_json::Value::Number(loc.end.column.into()),
            );
            loc_obj.insert("start".to_string(), serde_json::Value::Object(start_obj));
            loc_obj.insert("end".to_string(), serde_json::Value::Object(end_obj));
            obj.insert("loc".to_string(), serde_json::Value::Object(loc_obj));
        }

        Expression::Value(serde_json::Value::Object(obj))
    }

    /// Create an expression from a JSON value.
    pub fn from_json(value: serde_json::Value) -> Self {
        Expression::Value(value)
    }

    /// Get the underlying JSON value.
    pub fn as_json(&self) -> &serde_json::Value {
        match self {
            Expression::Value(v) => v,
        }
    }

    /// Get the type of the expression.
    pub fn node_type(&self) -> Option<&str> {
        match self {
            Expression::Value(v) => v.get("type").and_then(|t| t.as_str()),
        }
    }

    /// Get the start position.
    pub fn start(&self) -> Option<u32> {
        match self {
            Expression::Value(v) => v.get("start").and_then(|s| s.as_u64()).map(|n| n as u32),
        }
    }

    /// Get the end position.
    pub fn end(&self) -> Option<u32> {
        match self {
            Expression::Value(v) => v.get("end").and_then(|e| e.as_u64()).map(|n| n as u32),
        }
    }
}

impl Default for Expression {
    fn default() -> Self {
        Expression::Value(serde_json::Value::Null)
    }
}
