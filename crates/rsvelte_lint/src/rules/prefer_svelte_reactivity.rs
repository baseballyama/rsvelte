//! `svelte/prefer-svelte-reactivity`.
//!
//! `svelte/prefer-svelte-reactivity` — flag a mutable instance of a built-in
//! `Date` / `Map` / `Set` / `URL` / `URLSearchParams` where `svelte/reactivity`
//! offers a reactive alternative (`SvelteDate`, …). Port of the
//! eslint-plugin-svelte rule.
//!
//! Construction sites are found with the shared reference tracker's
//! global-reference iteration (upstream `ReferenceTracker.iterateGlobalReferences`):
//! a scoped shadow (`class Map {}` inside a function) hides only its own scope,
//! `new globalThis.Map()` / `new window.Set()` resolve through the
//! global-object names, and cross-script use joins the two `<script>` top
//! levels. An instance is reported when it is *mutated* (mutator method call or
//! `URL` property assignment — followed through const aliases, later
//! assignments and literal computed keys) or, in `.svelte.(js|ts)` modules,
//! when it is exported.

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{
    Access, RefTracker, Trace, component_tracker, handled_by_template_pass, module_is_ts,
    module_tracker,
};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-svelte-reactivity",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Prefer svelte/reactivity built-ins for mutated Date/Map/Set/URL/URLSearchParams",
    options_schema: None,
};

const DATE_MUT: &[&str] = &[
    "setDate",
    "setFullYear",
    "setHours",
    "setMilliseconds",
    "setMinutes",
    "setMonth",
    "setSeconds",
    "setTime",
    "setUTCDate",
    "setUTCFullYear",
    "setUTCHours",
    "setUTCMilliseconds",
    "setUTCMinutes",
    "setUTCMonth",
    "setUTCSeconds",
    "setYear",
];
const MAP_MUT: &[&str] = &["clear", "delete", "set"];
const SET_MUT: &[&str] = &["add", "clear", "delete"];
const USP_MUT: &[&str] = &["append", "delete", "set", "sort"];
const URL_PROPS: &[&str] = &[
    "hash", "host", "hostname", "href", "password", "pathname", "port", "protocol", "search",
    "username",
];

const CLASSES: &[&str] = &["Date", "Map", "Set", "URL", "URLSearchParams"];

fn class_message(class: &str) -> Option<String> {
    let alt = match class {
        "Date" => "SvelteDate",
        "Map" => "SvelteMap",
        "Set" => "SvelteSet",
        "URL" => "SvelteURL",
        "URLSearchParams" => "SvelteURLSearchParams",
        _ => return None,
    };
    Some(format!(
        "Found a mutable instance of the built-in {class} class. Use {alt} instead."
    ))
}

fn mutator_trace(class: &str) -> Trace {
    let methods = match class {
        "Date" => DATE_MUT,
        "Map" => MAP_MUT,
        "Set" => SET_MUT,
        "URLSearchParams" => USP_MUT,
        _ => &[],
    };
    Trace::parent(methods.iter().map(|m| (*m, Trace::call())).collect())
}

fn url_mutable(tracker: &RefTracker<'_>, ctor: &Value) -> bool {
    let trace = Trace::parent(URL_PROPS.iter().map(|p| (*p, Trace::read())).collect());
    for tracked in tracker.property_refs(ctor, &trace) {
        if tracked.access != Access::Read {
            continue;
        }
        let member = tracked.node;
        if tracker.parent_of(member).is_some_and(|p| {
            node_type(p) == Some("AssignmentExpression")
                && p.get("left")
                    .and_then(node_start)
                    .zip(node_start(member))
                    .is_some_and(|(a, b)| a == b)
        }) {
            return true;
        }
    }
    false
}

fn ptr(v: &Value) -> usize {
    std::ptr::from_ref(v) as usize
}

fn run(ctx: &mut LintContext, tracker: &RefTracker<'_>, exported_spans: &[(u32, u32)]) {
    let trace = Trace::parent(CLASSES.iter().map(|c| (*c, Trace::construct())).collect());
    let mut constructs = tracker.global_refs(&trace);
    constructs.retain(|t| t.access == Access::Construct);
    constructs.sort_by_key(|t| node_start(t.node).unwrap_or(0));
    constructs.dedup_by_key(|t| ptr(t.node));

    let mut reports: Vec<(u32, u32, String)> = Vec::new();
    for tracked in &constructs {
        let class = tracked.key;
        let Some(msg) = class_message(class) else {
            continue;
        };
        let (Some(start), Some(end)) = (node_start(tracked.node), node_end(tracked.node)) else {
            continue;
        };
        // Exported instances (`.svelte.(js|ts)` module surface): one report per
        // containing exported declaration, mirroring upstream's `isIn` loop.
        for (es, ee) in exported_spans {
            if start >= *es && end <= *ee {
                reports.push((start, end, msg.clone()));
            }
        }
        let mutable = if class == "URL" {
            url_mutable(tracker, tracked.node)
        } else {
            tracker
                .property_refs(tracked.node, &mutator_trace(class))
                .iter()
                .any(|t| t.access == Access::Call)
        };
        if mutable {
            reports.push((start, end, msg));
        }
    }
    reports.sort_by_key(|a| a.0);
    // Upstream reports the construction node itself (`context.report({ node })`
    // on the `NewExpression`), so the range spans the whole `new Map()`.
    for (start, end, msg) in reports {
        ctx.report(start, end, msg);
    }
}

/// Spans of exported declarations in a `.svelte.(js|ts)` module program —
/// upstream's `exportedVars` (declaration nodes and the defs of exported /
/// default-exported identifiers).
fn exported_spans(tracker: &RefTracker<'_>, program: &Value) -> Vec<(u32, u32)> {
    let mut out = Vec::new();
    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return out;
    };
    let push_node = |n: &Value, out: &mut Vec<(u32, u32)>| {
        if let (Some(s), Some(e)) = (node_start(n), node_end(n)) {
            out.push((s, e));
        }
    };
    for stmt in body {
        match node_type(stmt) {
            Some("ExportNamedDeclaration") => {
                if let Some(decl) = stmt.get("declaration").filter(|d| !d.is_null()) {
                    push_node(decl, &mut out);
                }
                if let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) {
                    for spec in specs {
                        let Some(local) = spec.get("local") else {
                            continue;
                        };
                        if node_type(local) != Some("Identifier") {
                            continue;
                        }
                        if let Some(var) = tracker.find_variable(local) {
                            out.push(tracker.decl_node_span(var));
                        }
                    }
                }
            }
            Some("ExportDefaultDeclaration") => {
                let Some(decl) = stmt.get("declaration") else {
                    continue;
                };
                if node_type(decl) == Some("Identifier") {
                    if let Some(var) = tracker.find_variable(decl) {
                        out.push(tracker.decl_node_span(var));
                    }
                } else {
                    push_node(decl, &mut out);
                }
            }
            _ => {}
        }
    }
    out
}

fn is_svelte_module_file(filename: &str) -> bool {
    filename.ends_with(".svelte.js") || filename.ends_with(".svelte.ts")
}

#[derive(Default)]
pub struct PreferSvelteReactivity;

impl ScriptRule for PreferSvelteReactivity {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        if handled_by_template_pass(ctx.filename()) {
            return;
        }
        let tracker = module_tracker(ctx.source(), program.value(), module_is_ts(ctx.filename()));
        let exported = if is_svelte_module_file(ctx.filename()) {
            exported_spans(&tracker, program.value())
        } else {
            Vec::new()
        };
        run(ctx, &tracker, &exported);
    }
}

impl Rule for PreferSvelteReactivity {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let tracker = component_tracker(ctx.source(), root, &root_json);
        run(ctx, &tracker, &[]);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn method_mutator_sets() {
        assert!(MAP_MUT.contains(&"set"));
        assert!(!MAP_MUT.contains(&"get"));
        assert!(DATE_MUT.contains(&"setFullYear"));
    }

    #[test]
    fn messages_name_the_reactive_alternative() {
        assert_eq!(
            class_message("Map").as_deref(),
            Some("Found a mutable instance of the built-in Map class. Use SvelteMap instead.")
        );
        assert_eq!(class_message("Foo"), None);
    }
}
