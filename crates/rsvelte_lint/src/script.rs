//! Script-AST rules: rules that inspect the `<script>` (instance / module)
//! JavaScript/TypeScript AST rather than the template tree.
//!
//! Many eslint-plugin-svelte rules are written as plain ESTree visitors over the
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

/// Which `<script>` block a program came from.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ScriptKind {
    /// The instance script (`<script>`).
    Instance,
    /// The module script (`<script context="module">` / `<script module>`).
    Module,
}

/// A rule that inspects a script's ESTree JSON program.
#[allow(unused_variables)]
pub trait ScriptRule: Send + Sync {
    fn meta(&self) -> &'static RuleMeta;

    /// Called once per script block with the full ESTree program `Value`.
    fn check_program(&self, ctx: &mut LintContext, program: &Value, kind: ScriptKind);
}

/// Depth-first walk over an ESTree JSON tree. `f` is called for every node (an
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
            let is_node = map.get("type").and_then(Value::as_str).is_some();
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

/// Convenience accessors for ESTree JSON nodes.
pub fn node_type(node: &Value) -> Option<&str> {
    node.get("type").and_then(Value::as_str)
}

/// The `start` byte offset of an ESTree node (absolute in the source).
pub fn node_start(node: &Value) -> Option<u32> {
    node.get("start").and_then(Value::as_u64).map(|n| n as u32)
}

/// The `end` byte offset of an ESTree node (absolute in the source).
pub fn node_end(node: &Value) -> Option<u32> {
    node.get("end").and_then(Value::as_u64).map(|n| n as u32)
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
