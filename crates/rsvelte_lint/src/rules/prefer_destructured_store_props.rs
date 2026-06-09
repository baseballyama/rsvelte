//! `svelte/prefer-destructured-store-props` — prefer destructuring a store's
//! property (`$: ({ bar } = $foo)`) over reading `$foo.bar` directly in markup,
//! for finer-grained change tracking. Port of the eslint-plugin-svelte rule.
//!
//! A template rule (`check_root`): it serializes the component fragment and
//! flags every `$store.prop` member access in the markup whose object is a
//! single-`$`-prefixed identifier (a store auto-subscription) — skipping `$$`
//! builtins, the Svelte 5 runes (`$state`/`$derived`/…), and any access whose
//! expression identifiers are block-scoped (e.g. an `{#each}` context). The
//! upstream fix is suggestion-only, so the rule reports without an autofix.

use std::collections::HashSet;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-destructured-store-props",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Destructure values from object stores for better change tracking",
    options_schema: None,
};

const SVELTE_RUNES: &[&str] = &[
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// `/^\$[^\$]/` — starts with a single `$` (not `$$`).
fn is_store_object(name: &str) -> bool {
    let b = name.as_bytes();
    b.len() >= 2 && b[0] == b'$' && b[1] != b'$'
}

/// Identifier names bound by an enclosing template block (`{#each}` context /
/// index, `{#await}` value / error, `{#snippet}` params) — block-scoped, so a
/// member access using one is left alone.
fn collect_block_names(ancestors: &[&Value]) -> HashSet<String> {
    let mut out = HashSet::new();
    for a in ancestors {
        match node_type(a) {
            Some("EachBlock") => {
                collect_pattern_idents(a.get("context"), &mut out);
                if let Some(idx) = a.get("index").and_then(Value::as_str) {
                    out.insert(idx.to_string());
                }
            }
            Some("AwaitBlock") => {
                collect_pattern_idents(a.get("value"), &mut out);
                collect_pattern_idents(a.get("error"), &mut out);
            }
            Some("SnippetBlock") => {
                if let Some(params) = a.get("parameters").and_then(Value::as_array) {
                    for p in params {
                        collect_pattern_idents(Some(p), &mut out);
                    }
                }
            }
            _ => {}
        }
    }
    out
}

fn collect_pattern_idents(id: Option<&Value>, out: &mut HashSet<String>) {
    let Some(id) = id.filter(|v| !v.is_null()) else {
        return;
    };
    match node_type(id) {
        Some("Identifier") => {
            if let Some(n) = id.get("name").and_then(Value::as_str) {
                out.insert(n.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = id.get("properties").and_then(Value::as_array) {
                for p in props {
                    match node_type(p) {
                        Some("Property") => collect_pattern_idents(p.get("value"), out),
                        Some("RestElement") => collect_pattern_idents(p.get("argument"), out),
                        _ => {}
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(els) = id.get("elements").and_then(Value::as_array) {
                for e in els.iter().filter(|e| !e.is_null()) {
                    collect_pattern_idents(Some(e), out);
                }
            }
        }
        Some("AssignmentPattern") => collect_pattern_idents(id.get("left"), out),
        Some("RestElement") => collect_pattern_idents(id.get("argument"), out),
        _ => {}
    }
}

/// Whether any expression identifier in the member (its object, plus identifiers
/// in a computed key) is block-scoped.
fn member_uses_block_scoped(member: &Value, computed: bool, block: &HashSet<String>) -> bool {
    if let Some(obj_name) = member
        .get("object")
        .and_then(|o| o.get("name"))
        .and_then(Value::as_str)
        && block.contains(obj_name)
    {
        return true;
    }
    if computed {
        let mut found = false;
        if let Some(prop) = member.get("property") {
            walk_js(prop, |n, _| {
                if !found
                    && node_type(n) == Some("Identifier")
                    && let Some(name) = n.get("name").and_then(Value::as_str)
                    && block.contains(name)
                {
                    found = true;
                }
            });
        }
        if found {
            return true;
        }
    }
    false
}

#[derive(Default)]
pub struct PreferDestructuredStoreProps;

impl Rule for PreferDestructuredStoreProps {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let Some(frag) =
            with_serialize_arena(&root.arena, || serde_json::to_value(&root.fragment).ok())
        else {
            return;
        };
        let mut reports: Vec<(u32, u32, String)> = Vec::new();
        walk_js(&frag, |node, ancestors| {
            if node_type(node) != Some("MemberExpression") {
                return;
            }
            let object = node.get("object");
            if object.map(node_type) != Some(Some("Identifier")) {
                return;
            }
            let Some(store) = object.and_then(|o| o.get("name")).and_then(Value::as_str) else {
                return;
            };
            if !is_store_object(store) || SVELTE_RUNES.contains(&store) {
                return;
            }
            let computed = node.get("computed").and_then(Value::as_bool) == Some(true);
            let block = collect_block_names(ancestors);
            if member_uses_block_scoped(node, computed, &block) {
                return;
            }
            // Property name: identifier name (non-computed) or collapsed source.
            let property = if !computed {
                node.get("property")
                    .and_then(|p| p.get("name"))
                    .and_then(Value::as_str)
                    .map(str::to_string)
            } else {
                match (
                    node.get("property")
                        .and_then(|p| p.get("start"))
                        .and_then(Value::as_u64),
                    node.get("property")
                        .and_then(|p| p.get("end"))
                        .and_then(Value::as_u64),
                ) {
                    (Some(s), Some(e)) => Some(collapse_ws(ctx.slice(s as u32, e as u32))),
                    _ => None,
                }
            };
            let Some(property) = property else { return };
            if let (Some(s), Some(e)) = (
                node.get("start").and_then(Value::as_u64),
                node.get("end").and_then(Value::as_u64),
            ) {
                reports.push((
                    s as u32,
                    e as u32,
                    format!(
                        "Destructure {property} from {store} for better change tracking & fewer redraws"
                    ),
                ));
            }
        });

        for (start, end, msg) in reports {
            ctx.report(start, end, msg);
        }
    }
}

/// Collapse runs of whitespace to a single space (mirrors `replace(/\s+/g, ' ')`).
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for c in s.chars() {
        if c.is_whitespace() {
            if !in_ws {
                out.push(' ');
                in_ws = true;
            }
        } else {
            out.push(c);
            in_ws = false;
        }
    }
    out
}
