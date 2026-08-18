//! `svelte/no-inspect` — warn against use of the `$inspect` rune.
//!
//! Upstream visits every `Identifier` node named `$inspect` and reports it —
//! including member properties (`$inspect.trace`, `holder.$inspect`) and
//! non-computed property keys (`{ $inspect: 1 }`), because they are all
//! `Identifier` nodes in the ESTree.
//!
//! Port of the eslint-plugin-svelte rule. The Svelte-5 / runes version gate is
//! handled by the test oracle (`_requirements.json`); the rule itself always
//! fires when it sees `$inspect`.
//!
//! Dual-registered: the [`ScriptRule`] pass covers `<script>` programs and
//! standalone `.svelte.(js|ts)` modules; the template [`Rule`] pass covers
//! `$inspect` in template expressions (event handlers, mustache tags).

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-inspect",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Warns against the use of `$inspect` directive",
    options_schema: None,
};

const MESSAGE: &str = "Do not use $inspect directive";

fn is_inspect_ident(node: &Value) -> bool {
    node_type(node) == Some("Identifier")
        && node.get("name").and_then(Value::as_str) == Some("$inspect")
}

#[derive(Default)]
pub struct NoInspect;

impl ScriptRule for NoInspect {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        program.walk(|node, _| {
            if is_inspect_ident(node)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                reports.push((s, e));
            }
        });
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

/// Template pass: `$inspect` identifiers inside template expressions. Script
/// programs are covered by `check_program`, so this walks only the fragment.
impl Rule for NoInspect {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, _root: &rsvelte_core::ast::template::Root) {
        let fragment = ctx.template_fragment_json();
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(&fragment, |node, _| {
            if is_inspect_ident(node)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                reports.push((s, e));
            }
        });
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn matches_only_inspect_identifiers() {
        assert!(is_inspect_ident(
            &json!({ "type": "Identifier", "name": "$inspect" })
        ));
        assert!(!is_inspect_ident(
            &json!({ "type": "Identifier", "name": "$state" })
        ));
        assert!(!is_inspect_ident(
            &json!({ "type": "Literal", "value": "$inspect" })
        ));
    }
}
