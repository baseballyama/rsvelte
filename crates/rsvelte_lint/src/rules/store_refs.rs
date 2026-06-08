//! Shared helper for the `svelte/store` rules: resolve which call expressions
//! are store-creator calls (`writable` / `readable` / `derived`), accounting for
//! the import that binds them — direct (`import { writable }`), aliased
//! (`import { writable as w }`), and namespace
//! (`import * as store from 'svelte/store'` → `store.writable(...)`).
//!
//! Mirrors eslint-plugin-svelte's `extractStoreReferences` (ESM reference
//! tracking) for the ECMAScript case.

use serde_json::Value;

use crate::script::{node_type, walk_js};

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

fn canonical(name: &str) -> Option<&'static str> {
    match name {
        "writable" => Some("writable"),
        "readable" => Some("readable"),
        "derived" => Some("derived"),
        _ => None,
    }
}

/// The `svelte/store` creator bindings found in a program.
pub struct StoreCreators {
    /// local name → canonical creator name.
    direct: Vec<(String, &'static str)>,
    /// namespace import local names (`import * as X`).
    namespaces: Vec<String>,
}

impl StoreCreators {
    pub fn is_empty(&self) -> bool {
        self.direct.is_empty() && self.namespaces.is_empty()
    }

    /// The canonical creator name (`writable`/`readable`/`derived`) if `callee`
    /// references a `svelte/store` creator, else `None`.
    pub fn creator_of(&self, callee: &Value) -> Option<&'static str> {
        match node_type(callee) {
            Some("Identifier") => {
                let n = ident_name(callee)?;
                self.direct
                    .iter()
                    .find(|(local, _)| local == n)
                    .map(|(_, c)| *c)
            }
            Some("MemberExpression") => {
                if callee.get("computed").and_then(Value::as_bool) == Some(true) {
                    return None;
                }
                let obj = callee.get("object")?;
                let o = ident_name(obj)?;
                if !self.namespaces.iter().any(|ns| ns == o) {
                    return None;
                }
                canonical(callee.get("property").and_then(ident_name)?)
            }
            _ => None,
        }
    }
}

/// Collect the `svelte/store` creator bindings declared in `program`.
pub fn collect_store_creators(program: &Value) -> StoreCreators {
    let mut direct: Vec<(String, &'static str)> = Vec::new();
    let mut namespaces: Vec<String> = Vec::new();

    walk_js(program, |node, _| {
        if node_type(node) != Some("ImportDeclaration") {
            return;
        }
        if node
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(Value::as_str)
            != Some("svelte/store")
        {
            return;
        }
        let Some(specs) = node.get("specifiers").and_then(Value::as_array) else {
            return;
        };
        for spec in specs {
            match node_type(spec) {
                Some("ImportSpecifier") => {
                    let imported = spec.get("imported").and_then(ident_name).or_else(|| {
                        spec.get("imported")
                            .and_then(|i| i.get("value"))
                            .and_then(Value::as_str)
                    });
                    if let Some(imp) = imported
                        && let Some(c) = canonical(imp)
                        && let Some(local) = spec.get("local").and_then(ident_name)
                    {
                        direct.push((local.to_string(), c));
                    }
                }
                Some("ImportNamespaceSpecifier") => {
                    if let Some(local) = spec.get("local").and_then(ident_name) {
                        namespaces.push(local.to_string());
                    }
                }
                _ => {}
            }
        }
    });

    StoreCreators { direct, namespaces }
}

/// Whether a node is an arrow/function expression.
pub fn is_function_expr(node: &Value) -> bool {
    matches!(
        node_type(node),
        Some("ArrowFunctionExpression") | Some("FunctionExpression")
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn prog_with_import(spec: Value) -> Value {
        json!({ "type": "Program", "body": [
            { "type": "ImportDeclaration",
              "source": { "type": "Literal", "value": "svelte/store" },
              "specifiers": [spec] }
        ] })
    }

    #[test]
    fn resolves_direct_and_aliased() {
        let p = prog_with_import(json!({
            "type": "ImportSpecifier",
            "imported": { "type": "Identifier", "name": "writable" },
            "local": { "type": "Identifier", "name": "w" }
        }));
        let c = collect_store_creators(&p);
        assert_eq!(
            c.creator_of(&json!({ "type": "Identifier", "name": "w" })),
            Some("writable")
        );
        assert_eq!(
            c.creator_of(&json!({ "type": "Identifier", "name": "x" })),
            None
        );
    }

    #[test]
    fn resolves_namespace() {
        let p = prog_with_import(json!({
            "type": "ImportNamespaceSpecifier",
            "local": { "type": "Identifier", "name": "store" }
        }));
        let c = collect_store_creators(&p);
        let callee = json!({ "type": "MemberExpression", "computed": false,
            "object": { "type": "Identifier", "name": "store" },
            "property": { "type": "Identifier", "name": "derived" } });
        assert_eq!(c.creator_of(&callee), Some("derived"));
    }
}
