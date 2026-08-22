//! `svelte/no-unnecessary-state-wrap`.
//!
//! `svelte/no-unnecessary-state-wrap` — disallow wrapping an already-reactive
//! class instance in `$state(...)`. The reactive classes from `svelte/reactivity`
//! (`SvelteSet`, `SvelteMap`, `SvelteURL`, `SvelteURLSearchParams`, `SvelteDate`,
//! `MediaQuery`) are deeply reactive on their own, so `$state(new SvelteSet())`
//! is redundant. Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` `ESTree` program via the [`ScriptRule`] hook. Built-in
//! reactive classes are matched through the `svelte/reactivity` import (alias
//! aware — `import { SvelteSet as S }` then `$state(new S())` reports
//! `SvelteSet`); the `additionalReactiveClasses` option matches by callee name
//! directly. With `allowReassign`, a wrapped binding that is later reassigned
//! (including via a two-way `bind:`) is left alone. The upstream fix is
//! suggestion-only, so the rule reports without an autofix.

use std::collections::HashSet;

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::reactive_stmt::source_is_ts;
use crate::rules::store_refs::{RefTracker, Trace, module_tracker};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-unnecessary-state-wrap",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unnecessary `$state` wrapping of reactive classes",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "additionalReactiveClasses": { "type": "array", "items": { "type": "string" }, "uniqueItems": true },
            "allowReassign": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

const REACTIVE_CLASSES: &[&str] = &[
    "SvelteSet",
    "SvelteMap",
    "SvelteURL",
    "SvelteURLSearchParams",
    "SvelteDate",
    "MediaQuery",
];

/// The callee Identifier name of a `new X()` / `X()` argument, if any.
fn ctor_callee_name(arg: &Value) -> Option<&str> {
    match node_type(arg) {
        Some("NewExpression" | "CallExpression") => arg
            .get("callee")
            .filter(|c| node_type(c) == Some("Identifier"))
            .and_then(|c| c.get("name"))
            .and_then(Value::as_str),
        _ => None,
    }
}

/// Whether `node` is a `$state(...)` call.
fn is_state_call(node: &Value) -> bool {
    node_type(node) == Some("CallExpression")
        && node
            .get("callee")
            .filter(|c| node_type(c) == Some("Identifier"))
            .and_then(|c| c.get("name"))
            .and_then(Value::as_str)
            == Some("$state")
}

#[derive(Default)]
pub struct NoUnnecessaryStateWrap;

impl ScriptRule for NoUnnecessaryStateWrap {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let options = StateWrapOptions::from_value(ctx.option0());
        let tracker = module_tracker(
            ctx.source(),
            program.value(),
            source_is_ts(ctx.source(), ctx.filename()),
        );
        let reassigned = reassigned_bindings(ctx, program, options.allow_reassign);

        report_unnecessary_wraps(ctx, program, &options, &tracker, &reassigned);
    }
}

#[derive(Default)]
struct StateWrapOptions {
    additional: HashSet<String>,
    allow_reassign: bool,
}

impl StateWrapOptions {
    fn from_value(value: Option<&Value>) -> Self {
        Self {
            additional: value
                .and_then(|option| option.get("additionalReactiveClasses"))
                .and_then(Value::as_array)
                .map_or_else(HashSet::new, |classes| {
                    classes
                        .iter()
                        .filter_map(|class| class.as_str().map(str::to_string))
                        .collect()
                }),
            allow_reassign: value
                .and_then(|option| option.get("allowReassign"))
                .and_then(Value::as_bool)
                .unwrap_or(false),
        }
    }
}

/// Every `new X()` / `X()` on a `svelte/reactivity` reactive class reachable
/// from the module's imports, as `(constructor node, canonical class name)`.
/// Upstream tracks these with `iterateEsmReferences`, which follows aliases
/// (`import { SvelteSet as S }`) *and* namespace imports
/// (`import * as r` then `new r.SvelteSet()`) — the latter has no local name to
/// key an import map on.
fn reactive_class_constructions<'a>(tracker: &RefTracker<'a>) -> Vec<(&'a Value, &'static str)> {
    let trace = Trace::parent(
        REACTIVE_CLASSES
            .iter()
            .map(|class| {
                (
                    *class,
                    Trace {
                        call: true,
                        construct: true,
                        ..Trace::default()
                    },
                )
            })
            .collect(),
    );
    tracker
        .esm_refs("svelte/reactivity", &trace)
        .into_iter()
        .map(|tracked| (tracked.node, tracked.key))
        .collect()
}

fn reassigned_bindings(
    ctx: &LintContext,
    program: &ProgramView<'_>,
    allow_reassign: bool,
) -> HashSet<String> {
    // Upstream asks the scope manager whether the declared variable has any
    // write reference other than its own declaration, so both halves have to be
    // read off the tree: script assignments (the analyzed scope's `reassigned`)
    // and two-way `bind:` targets in the template.
    if !allow_reassign {
        return HashSet::new();
    }
    // A standalone module is not a component: the analysis and the template are
    // both a reading of its JS text as markup, so the program is the only source.
    if matches!(
        crate::engine::classify_source(ctx.filename()),
        crate::engine::SourceKind::Module { .. }
    ) {
        let mut set = HashSet::new();
        collect_program_writes(program.value(), &mut set);
        return set;
    }
    let mut set: HashSet<String> = ctx
        .scope_analysis()
        .map(|a| {
            a.root
                .bindings
                .iter()
                .filter(|b| b.reassigned)
                .map(|b| b.name.clone())
                .collect()
        })
        .unwrap_or_default();
    collect_bind_directive_names(&ctx.template_fragment_json(), &mut set);
    set
}

/// Names written by an `x = …` / `x++` whose target is the variable itself
/// (`x.y = …` writes the object, not the binding).
fn collect_program_writes(program: &Value, set: &mut HashSet<String>) {
    walk_js(program, |node, _| {
        let target = match node_type(node) {
            Some("AssignmentExpression") => node.get("left"),
            Some("UpdateExpression") => node.get("argument"),
            _ => return,
        };
        if let Some(name) = target
            .filter(|t| node_type(t) == Some("Identifier"))
            .and_then(|t| t.get("name"))
            .and_then(Value::as_str)
        {
            set.insert(name.to_string());
        }
    });
}

/// Add the base variable of every two-way `bind:` in the template to `set`
/// (`bind:x`, `bind:x={y}`, `bind:x={() => …, (v) => …}` alike).
fn collect_bind_directive_names(fragment: &Value, set: &mut HashSet<String>) {
    walk_js(fragment, |node, _| {
        if node_type(node) != Some("BindDirective") {
            return;
        }
        if let Some(name) = binding_base_name(node.get("expression")) {
            set.insert(name.to_string());
        }
    });
}

/// The base identifier of a `bind:` expression: `x` → `x`, `x.y[0]` → `x`.
fn binding_base_name(expression: Option<&Value>) -> Option<&str> {
    let expression = expression?;
    match node_type(expression) {
        Some("Identifier") => expression.get("name").and_then(Value::as_str),
        Some("MemberExpression") => binding_base_name(expression.get("object")),
        _ => None,
    }
}

/// The `let x = $state(<arg>)` declarator a wrapped constructor sits in, as
/// `(binding name, $state call node)`. `None` when the `$state(…)` is not the
/// whole initializer of an identifier declarator.
fn state_wrap_declarator<'a>(
    tracker: &RefTracker<'a>,
    constructor: &'a Value,
) -> Option<(&'a str, &'a Value)> {
    let state_call = tracker.parent_of(constructor)?;
    if !is_state_call(state_call) {
        return None;
    }
    let declarator = tracker.parent_of(state_call)?;
    if node_type(declarator) != Some("VariableDeclarator") {
        return None;
    }
    let id = declarator.get("id")?;
    if node_type(id) != Some("Identifier") {
        return None;
    }
    Some((id.get("name").and_then(Value::as_str)?, state_call))
}

fn report_unnecessary_wraps(
    ctx: &mut LintContext,
    program: &ProgramView<'_>,
    options: &StateWrapOptions,
    tracker: &RefTracker<'_>,
    reassigned: &HashSet<String>,
) {
    // (class name, `$state(…)` span, reported constructor span). The suggestion
    // replaces the whole `$state(...)` call with the constructor's source text.
    let mut found: Vec<(String, u32, u32, u32, u32)> = Vec::new();

    for (constructor, class_name) in reactive_class_constructions(tracker) {
        let Some((binding, state_call)) = state_wrap_declarator(tracker, constructor) else {
            continue;
        };
        if reassigned.contains(binding) {
            continue;
        }
        let (Some(state_start), Some(state_end), Some(arg_start), Some(arg_end)) = (
            node_start(state_call),
            node_end(state_call),
            node_start(constructor),
            node_end(constructor),
        ) else {
            continue;
        };
        found.push((
            class_name.to_string(),
            state_start,
            state_end,
            arg_start,
            arg_end,
        ));
    }

    // `additionalReactiveClasses` is matched by callee name alone upstream (it
    // has no module to trace from), so it stays a plain AST scan.
    if !options.additional.is_empty() {
        program.walk(|node, _| {
            if node_type(node) != Some("CallExpression") || !is_state_call(node) {
                return;
            }
            let Some(args) = node.get("arguments").and_then(Value::as_array) else {
                return;
            };
            for arg in args {
                let Some(name) = ctor_callee_name(arg) else {
                    continue;
                };
                if !options.additional.contains(name) {
                    continue;
                }
                let Some((binding, state_call)) = state_wrap_declarator(tracker, arg) else {
                    continue;
                };
                if reassigned.contains(binding) {
                    continue;
                }
                let (Some(state_start), Some(state_end), Some(arg_start), Some(arg_end)) = (
                    node_start(state_call),
                    node_end(state_call),
                    node_start(arg),
                    node_end(arg),
                ) else {
                    continue;
                };
                found.push((name.to_string(), state_start, state_end, arg_start, arg_end));
            }
        });
    }

    found.sort_by_key(|(_, _, _, arg_start, _)| *arg_start);
    found.dedup_by_key(|(_, _, _, arg_start, _)| *arg_start);

    for (class_name, state_start, state_end, arg_start, arg_end) in found {
        let arg_text = ctx.slice(arg_start, arg_end).to_string();
        ctx.report_with_suggestions(
            arg_start,
            arg_end,
            format!("{class_name} is already reactive, $state wrapping is unnecessary."),
            vec![Suggestion {
                desc: "Remove unnecessary $state wrapping".to_string(),
                fix: Fix {
                    message: "Remove unnecessary $state wrapping".to_string(),
                    edits: vec![TextEdit {
                        start: state_start,
                        end: state_end,
                        new_text: arg_text,
                    }],
                },
            }],
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn ctor_name_detection() {
        assert_eq!(
            ctor_callee_name(
                &json!({ "type": "NewExpression", "callee": { "type": "Identifier", "name": "SvelteSet" } })
            ),
            Some("SvelteSet")
        );
        assert_eq!(
            ctor_callee_name(
                &json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "foo" } })
            ),
            Some("foo")
        );
        assert_eq!(
            ctor_callee_name(&json!({ "type": "Literal", "value": 42 })),
            None
        );
    }

    #[test]
    fn bind_directive_names_come_from_the_template_tree() {
        let fragment = json!({ "type": "Fragment", "nodes": [
            { "type": "BindDirective", "expression": { "type": "Identifier", "name": "shorthand" } },
            { "type": "BindDirective", "expression": { "type": "MemberExpression",
                "object": { "type": "Identifier", "name": "nested" } } }
        ] });
        let mut set = HashSet::new();
        collect_bind_directive_names(&fragment, &mut set);
        assert!(set.contains("shorthand"));
        assert!(set.contains("nested"));

        // The same text inside a script template literal is not a binding.
        let mut none = HashSet::new();
        collect_bind_directive_names(
            &json!({ "type": "Literal", "value": "bind:filters" }),
            &mut none,
        );
        assert!(none.is_empty());
    }
}
