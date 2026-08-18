//! `svelte/no-at-const-tags` prefers `{const …}` over `{@const …}`.
//!
//! It ports the eslint-plugin-svelte rule and only fires in
//! runes mode (the upstream rule's `runes === true` gate), since preserving
//! reactivity outside runes mode would require `$derived(...)`, unavailable
//! there.
//!
//! Runes mode is resolved the way svelte-eslint-parser resolves it
//! (`svelte-parse-context.ts`): `<svelte:options runes={…}>` decides when
//! present, otherwise the component is in runes mode iff a rune symbol appears
//! as an `Identifier` anywhere in the scripts or template expressions. Reading
//! it off the AST is what keeps a rune name inside a comment, a string, or as
//! the prefix of a longer name (`$stateStore`) from deciding the gate.
//!
//! Detection-parity port: the finding (message + position) matches upstream; the
//! autofix (`{@const x = e}` → `{const x = $derived(e)}`) is not yet ported, so
//! the rule advertises `Fixable::No`.

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-at-const-tags",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Prefer `{const ...}` over legacy `{@const ...}`",
    options_schema: None,
};

const MESSAGE: &str = "Use `{const ...}` declaration tag instead of legacy `{@const ...}`.";

/// The rune symbols svelte-eslint-parser's `hasRunesSymbol` looks for.
const RUNE_SYMBOLS: &[&str] = &[
    "$state",
    "$derived",
    "$props",
    "$effect",
    "$bindable",
    "$inspect",
    "$host",
];

fn has_rune_symbol(json: &Value) -> bool {
    let mut found = false;
    walk_js(json, |node, _| {
        if found || node_type(node) != Some("Identifier") {
            return;
        }
        if node
            .get("name")
            .and_then(Value::as_str)
            .is_some_and(|n| RUNE_SYMBOLS.contains(&n))
        {
            found = true;
        }
    });
    found
}

#[derive(Default)]
pub struct NoAtConstTags;

impl Rule for NoAtConstTags {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let json = ctx.root_json(root);
        if json.is_null() {
            return;
        }
        // `tag.start` points at the `{` of `{@const …}`.
        let mut starts: Vec<u32> = Vec::new();
        walk_js(&json, |node, _| {
            if node_type(node) == Some("ConstTag")
                && let Some(start) = node_start(node)
            {
                starts.push(start);
            }
        });
        if starts.is_empty() {
            return;
        }
        let runes = root
            .options
            .as_ref()
            .and_then(|o| o.runes)
            .unwrap_or_else(|| has_rune_symbol(&json));
        if !runes {
            return;
        }
        starts.sort_unstable();
        for start in starts {
            ctx.report(start, start, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn rune_symbol_detection_is_whole_identifier() {
        assert!(has_rune_symbol(
            &json!({ "type": "Identifier", "name": "$state" })
        ));
        // A longer name that merely starts with a rune name is not a rune.
        assert!(!has_rune_symbol(
            &json!({ "type": "Identifier", "name": "$stateStore" })
        ));
        // A rune name appearing only as string data is not a rune symbol.
        assert!(!has_rune_symbol(
            &json!({ "type": "Literal", "value": "$derived(x)" })
        ));
    }

    #[test]
    fn rune_symbol_is_found_in_nested_nodes() {
        let program = json!({
            "type": "Program",
            "body": [{
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": { "type": "Identifier", "name": "$derived" },
                    "arguments": []
                }
            }]
        });
        assert!(has_rune_symbol(&program));
    }
}
