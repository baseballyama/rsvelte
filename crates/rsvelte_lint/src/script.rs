//! Script-AST rules: rules that inspect the `<script>` (instance / module)
//! JavaScript/TypeScript AST rather than the template tree.
//!
//! Many eslint-plugin-svelte rules are written as plain `ESTree` visitors over the
//! script (import checks, rune-call checks, declaration-nesting, etc.). The
//! rsvelte parser stores each script's program in an arena owned by the parsed
//! [`Root`](rsvelte_core::ast::template::Root); serializing the program node
//! inside [`with_serialize_arena`](rsvelte_core::ast::arena::with_serialize_arena)
//! materialises a full ESTree-compatible `serde_json::Value` with absolute byte
//! offsets in `start`/`end` (so a finding's column matches upstream by reporting
//! at `node["start"]`).
//!
//! A [`ScriptRule`] receives the whole program `Value` for each script and walks
//! it itself (so it can do multi-pass work — e.g. collect imports, then inspect
//! calls — despite the rule being a zero-sized stateless struct). The
//! [`walk_js`] helper provides a depth-first traversal that hands every node its
//! ancestor stack.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::RuleMeta;

fn json_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

fn ancestor_depth(value: usize) -> u32 {
    u32::try_from(value).expect("AST ancestor depth is represented as u32")
}

/// Which `<script>` block a program came from.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ScriptKind {
    /// The instance script (`<script>`).
    Instance,
    /// The module script (`<script context="module">` / `<script module>`).
    Module,
}

/// A rule that inspects a script's `ESTree` JSON program.
#[allow(unused_variables)]
pub trait ScriptRule: Send + Sync {
    fn meta(&self) -> &'static RuleMeta;

    /// Called once per script block with the full `ESTree` program.
    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, kind: ScriptKind);
}

/// A script program plus its depth-first node index.
///
/// Every script rule walks the whole program, so the tree is traversed once
/// here and each rule replays the flat index instead of re-descending the JSON
/// (which costs a `type` probe and a child scan per object, per rule).
/// Derefs to the underlying `Value`, so field access reads as before.
pub struct ProgramView<'a> {
    value: &'a Value,
    /// Nodes in DFS pre-order, with each node's ancestor count. Replaying them
    /// against a truncate-then-push stack reproduces `walk_js` exactly.
    nodes: Vec<&'a Value>,
    depths: Vec<u32>,
}

impl<'a> ProgramView<'a> {
    #[must_use]
    pub fn new(value: &'a Value) -> Self {
        let mut nodes = Vec::new();
        let mut depths = Vec::new();
        let mut stack: Vec<&'a Value> = Vec::new();
        walk_inner(value, &mut stack, &mut |node, ancestors| {
            nodes.push(node);
            depths.push(ancestor_depth(ancestors.len()));
        });
        Self {
            value,
            nodes,
            depths,
        }
    }

    /// The underlying program value.
    #[must_use]
    pub const fn value(&self) -> &'a Value {
        self.value
    }

    /// Walk every node of the program, exactly as [`walk_js`] would.
    pub fn walk<F: FnMut(&'a Value, &[&'a Value])>(&self, mut f: F) {
        let mut stack: Vec<&'a Value> = Vec::with_capacity(16);
        for (i, node) in self.nodes.iter().enumerate() {
            stack.truncate(self.depths[i] as usize);
            f(node, &stack);
            stack.push(node);
        }
    }
}

impl std::ops::Deref for ProgramView<'_> {
    type Target = Value;

    fn deref(&self) -> &Self::Target {
        self.value
    }
}

/// Walk an `ESTree` JSON tree depth-first.
///
/// Depth-first walk over an `ESTree` JSON tree. `f` is called for every node (an
/// object with a string `"type"` field) with its ancestor stack, nearest parent
/// last (empty for the root). The `loc` subtree is skipped (it has no nodes).
pub fn walk_js<'a, F: FnMut(&'a Value, &[&'a Value])>(node: &'a Value, mut f: F) {
    let mut stack: Vec<&'a Value> = Vec::new();
    walk_inner(node, &mut stack, &mut f);
}

fn walk_inner<'a, F: FnMut(&'a Value, &[&'a Value])>(
    node: &'a Value,
    stack: &mut Vec<&'a Value>,
    f: &mut F,
) {
    match node {
        Value::Object(map) => {
            // ESTree nodes always serialize `type` first, so the first entry
            // answers "is this a node?" without hashing the key — this runs on
            // every object of every walk, and every script rule walks the tree.
            let is_node = match map.iter().next() {
                Some((k, v)) if k == "type" => v.is_string(),
                Some(_) => map.get("type").and_then(Value::as_str).is_some(),
                None => false,
            };
            if is_node {
                f(node, stack);
                stack.push(node);
            }
            for (k, v) in map {
                // `loc` holds {start,end} position objects, never AST nodes.
                if k != "loc" {
                    walk_inner(v, stack, f);
                }
            }
            if is_node {
                stack.pop();
            }
        }
        Value::Array(arr) => {
            for v in arr {
                walk_inner(v, stack, f);
            }
        }
        _ => {}
    }
}

/// Convenience accessors for `ESTree` JSON nodes.
pub fn node_type(node: &Value) -> Option<&str> {
    node.get("type").and_then(Value::as_str)
}

/// The `start` byte offset of an `ESTree` node (absolute in the source).
pub fn node_start(node: &Value) -> Option<u32> {
    node.get("start")
        .and_then(Value::as_u64)
        .and_then(json_offset)
}

/// The `end` byte offset of an `ESTree` node (absolute in the source).
pub fn node_end(node: &Value) -> Option<u32> {
    node.get("end")
        .and_then(Value::as_u64)
        .and_then(json_offset)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn walk_visits_every_node_with_ancestors() {
        let program = json!({
            "type": "Program",
            "body": [
                { "type": "VariableDeclaration", "declarations": [
                    { "type": "VariableDeclarator", "id": { "type": "Identifier", "name": "a" } }
                ] }
            ]
        });
        let mut seen: Vec<(String, usize)> = Vec::new();
        walk_js(&program, |node, ancestors| {
            seen.push((node_type(node).unwrap().to_string(), ancestors.len()));
        });
        assert_eq!(
            seen,
            vec![
                ("Program".to_string(), 0),
                ("VariableDeclaration".to_string(), 1),
                ("VariableDeclarator".to_string(), 2),
                ("Identifier".to_string(), 3),
            ]
        );
    }

    #[test]
    fn walk_parent_is_nearest_node() {
        let program = json!({
            "type": "Program",
            "body": [ { "type": "IfStatement", "consequent": {
                "type": "BlockStatement", "body": [ { "type": "FunctionDeclaration" } ]
            } } ]
        });
        let mut fn_parent: Option<String> = None;
        walk_js(&program, |node, ancestors| {
            if node_type(node) == Some("FunctionDeclaration") {
                fn_parent = ancestors
                    .last()
                    .and_then(|p| node_type(p))
                    .map(str::to_string);
            }
        });
        assert_eq!(fn_parent.as_deref(), Some("BlockStatement"));
    }
}
