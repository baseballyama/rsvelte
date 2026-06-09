//! `svelte/prefer-const` — suggest `const` for a `let` binding that is never
//! reassigned. Port of the core ESLint `prefer-const` rule's behaviour exercised
//! by the eslint-plugin-svelte fixtures, plus the plugin's `excludedRunes`
//! option (a `let` initialised by an excluded rune call — `$props()` /
//! `$derived(...)` by default — is left alone, since those require `let`).
//!
//! Implemented as a script-AST rule: the `<script>` ESTree program gives the
//! real initializer (so `excludedRunes` is detected from the actual `$props` /
//! `$derived` callee, not the rune-stripped binding value) and the declaration
//! identifier positions; reassignment comes from the analyzed scope
//! ([`analyze_scope`](crate::scope::analyze_scope)).

use std::collections::HashSet;

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-const",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Suggest `const` for never-reassigned `let` bindings",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "destructuring": { "enum": ["any", "all"] },
            "ignoreReadBeforeAssign": { "type": "boolean" },
            "excludedRunes": { "type": "array", "items": { "type": "string" } }
        }, "additionalProperties": true }"#,
    ),
};

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// The callee identifier name of an init expression that is a rune call:
/// `$props()` → `$props`, `$derived.by(...)` → `$derived` (member object).
fn init_rune_callee(init: &Value) -> Option<&str> {
    if node_type(init) != Some("CallExpression") {
        return None;
    }
    let callee = init.get("callee")?;
    match node_type(callee) {
        Some("Identifier") => ident_name(callee),
        Some("MemberExpression") => callee.get("object").and_then(ident_name),
        _ => None,
    }
}

/// Collect the bound Identifier leaves of a declarator `id` pattern.
fn collect_pattern_idents<'a>(id: &'a Value, out: &mut Vec<&'a Value>) {
    match node_type(id) {
        Some("Identifier") => out.push(id),
        Some("ObjectPattern") => {
            if let Some(props) = id.get("properties").and_then(Value::as_array) {
                for p in props {
                    match node_type(p) {
                        // `{ a }` / `{ a: b }` → the value is the binding.
                        Some("Property") => {
                            if let Some(v) = p.get("value") {
                                collect_pattern_idents(v, out);
                            }
                        }
                        // `{ ...rest }`
                        Some("RestElement") => {
                            if let Some(arg) = p.get("argument") {
                                collect_pattern_idents(arg, out);
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(els) = id.get("elements").and_then(Value::as_array) {
                for e in els.iter().filter(|e| !e.is_null()) {
                    collect_pattern_idents(e, out);
                }
            }
        }
        // `let a = 1` default in a pattern: `{ a = 1 }` → left is the binding.
        Some("AssignmentPattern") => {
            if let Some(left) = id.get("left") {
                collect_pattern_idents(left, out);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = id.get("argument") {
                collect_pattern_idents(arg, out);
            }
        }
        _ => {}
    }
}

#[derive(Default)]
pub struct PreferConst;

impl ScriptRule for PreferConst {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        // Reassignment info from the analyzed scope (reliable per the R9 audit).
        let Some(analysis) = crate::scope::analyze_scope(ctx.source()) else {
            return;
        };
        let reassigned: HashSet<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| b.reassigned)
            .map(|b| b.name.as_str())
            .collect();

        let opts = ctx.option0();
        let excluded: Vec<String> = opts
            .and_then(|o| o.get("excludedRunes"))
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_else(|| vec!["$props".to_string(), "$derived".to_string()]);
        let destructuring_all = opts
            .and_then(|o| o.get("destructuring"))
            .and_then(Value::as_str)
            == Some("all");

        let mut reports: Vec<(u32, u32, String, Option<u32>)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("VariableDeclaration")
                || node.get("kind").and_then(Value::as_str) != Some("let")
            {
                return;
            }
            let Some(declarators) = node.get("declarations").and_then(Value::as_array) else {
                return;
            };

            // `excludedRunes`: skip the whole declaration if any declarator's
            // init is a call to an excluded rune.
            let skip = declarators.iter().any(|d| {
                d.get("init")
                    .filter(|i| !i.is_null())
                    .and_then(init_rune_callee)
                    .is_some_and(|c| excluded.iter().any(|e| e == c))
            });
            if skip {
                return;
            }

            // Per-declarator bound identifiers that are const-able (init present,
            // never reassigned).
            let mut decl_idents: Vec<&Value> = Vec::new(); // const-able to report
            let mut all_const_able = true; // every bound id (with init) is const-able
            let mut every_declarator_has_init = true;
            for d in declarators {
                let has_init = d.get("init").is_some_and(|i| !i.is_null());
                if !has_init {
                    every_declarator_has_init = false;
                }
                let mut ids = Vec::new();
                if let Some(id) = d.get("id") {
                    collect_pattern_idents(id, &mut ids);
                }
                for id in ids {
                    let name = ident_name(id).unwrap_or("");
                    let is_reassigned = reassigned.contains(name);
                    if has_init && !is_reassigned {
                        decl_idents.push(id);
                    } else {
                        all_const_able = false;
                    }
                }
            }
            if decl_idents.is_empty() {
                return;
            }

            // The whole declaration can be auto-fixed to `const` only when every
            // declarator has an init and every bound id is const-able.
            let fixable = every_declarator_has_init && all_const_able;
            // `destructuring: "all"` only reports when the whole declaration is
            // const-able (default "any" reports each const-able id).
            if destructuring_all && !all_const_able {
                return;
            }
            let fix_start = if fixable { node_start(node) } else { None };

            for id in decl_idents {
                if let (Some(s), Some(e)) = (node_start(id), id.get("end").and_then(Value::as_u64))
                {
                    let name = ident_name(id).unwrap_or("");
                    reports.push((
                        s,
                        e as u32,
                        format!("'{name}' is never reassigned. Use 'const' instead."),
                        fix_start,
                    ));
                }
            }
        });

        for (start, end, msg, fix_start) in reports {
            match fix_start {
                Some(decl_start) => ctx.report_with_fix(
                    start,
                    end,
                    msg,
                    Fix {
                        message: "Use `const` instead.".to_string(),
                        edits: vec![TextEdit {
                            start: decl_start,
                            end: decl_start + 3, // the `let` keyword
                            new_text: "const".to_string(),
                        }],
                    },
                ),
                None => ctx.report(start, end, msg),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn rune_callee_detection() {
        let props = json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "$props" } });
        assert_eq!(init_rune_callee(&props), Some("$props"));
        let derived_by = json!({ "type": "CallExpression", "callee": { "type": "MemberExpression", "object": { "type": "Identifier", "name": "$derived" }, "property": { "type": "Identifier", "name": "by" } } });
        assert_eq!(init_rune_callee(&derived_by), Some("$derived"));
        let plain =
            json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "calc" } });
        assert_eq!(init_rune_callee(&plain), Some("calc"));
    }

    #[test]
    fn pattern_idents() {
        let obj = json!({ "type": "ObjectPattern", "properties": [
            { "type": "Property", "value": { "type": "Identifier", "name": "a" } },
            { "type": "Property", "value": { "type": "Identifier", "name": "b" } }
        ] });
        let mut out = Vec::new();
        collect_pattern_idents(&obj, &mut out);
        let names: Vec<_> = out.iter().filter_map(|n| ident_name(n)).collect();
        assert_eq!(names, vec!["a", "b"]);
    }
}
