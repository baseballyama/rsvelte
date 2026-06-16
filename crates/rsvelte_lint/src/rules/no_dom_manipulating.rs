//! `svelte/no-dom-manipulating` — disallow directly manipulating a DOM element
//! that Svelte owns (one captured via `bind:this`). Mutating it behind Svelte's
//! back desyncs the runtime's view of the DOM. Port of the eslint-plugin-svelte
//! rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook, but also
//! re-parses the template to find the DOM variables: an identifier captured by
//! `bind:this` on an HTML element (`RegularElement`) or `<svelte:element>`
//! (`SvelteElement`) — not on components — that resolves to a module/instance
//! binding. The script is then scanned for `domVar.method(...)` (a DOM-mutating
//! method) or `domVar.prop = …` (a DOM-mutating property), reported at the
//! member expression. Optional chaining (`el?.remove()`, `(el?.remove)()`) is
//! unwrapped via `ChainExpression`, mirroring upstream.

use std::collections::HashSet;

use rsvelte_core::ParseOptions;
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::phases::parse;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dom-manipulating",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow DOM manipulating",
    options_schema: None,
};

const MESSAGE: &str = "Don't manipulate the DOM directly. The Svelte runtime can get confused if there is a difference between the actual DOM and the DOM expected by the Svelte runtime.";

const DOM_METHODS: &[&str] = &[
    "appendChild",
    "insertBefore",
    "normalize",
    "removeChild",
    "replaceChild",
    "after",
    "append",
    "before",
    "insertAdjacentElement",
    "insertAdjacentHTML",
    "insertAdjacentText",
    "prepend",
    "remove",
    "replaceChildren",
    "replaceWith",
];

const DOM_PROPERTIES: &[&str] = &[
    "textContent",
    "innerHTML",
    "outerHTML",
    "innerText",
    "outerText",
];

/// Names declared at the top level of the script program — `let`/`const`/`var`,
/// functions, classes, imports, and their `export`ed forms. Used to ensure a
/// `bind:this` target is a module/instance variable, not a block-scoped one
/// (e.g. an `{#each}` context or a `for` loop variable).
fn collect_toplevel_decls(program: &Value, out: &mut HashSet<String>) {
    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return;
    };
    for stmt in body {
        let decl = if node_type(stmt) == Some("ExportNamedDeclaration") {
            stmt.get("declaration").unwrap_or(&Value::Null)
        } else {
            stmt
        };
        match node_type(decl) {
            Some("VariableDeclaration") => {
                if let Some(declarators) = decl.get("declarations").and_then(Value::as_array) {
                    for d in declarators {
                        collect_pattern_idents(d.get("id"), out);
                    }
                }
            }
            Some("FunctionDeclaration") | Some("ClassDeclaration") => {
                if let Some(n) = decl
                    .get("id")
                    .and_then(|i| i.get("name"))
                    .and_then(Value::as_str)
                {
                    out.insert(n.to_string());
                }
            }
            Some("ImportDeclaration") => {
                if let Some(specs) = decl.get("specifiers").and_then(Value::as_array) {
                    for s in specs {
                        if let Some(n) = s
                            .get("local")
                            .and_then(|l| l.get("name"))
                            .and_then(Value::as_str)
                        {
                            out.insert(n.to_string());
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

/// Collect bound identifier names from a declarator `id` pattern.
fn collect_pattern_idents(id: Option<&Value>, out: &mut HashSet<String>) {
    let Some(id) = id else { return };
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

/// Identifiers captured by `bind:this` on an HTML element / `<svelte:element>`
/// that resolve to a top-level binding.
fn collect_dom_vars(source: &str, binding_names: &HashSet<String>) -> HashSet<String> {
    let mut out = HashSet::new();
    let Ok(root) = parse(source, ParseOptions::default()) else {
        return out;
    };
    let Some(frag) =
        with_serialize_arena(&root.arena, || serde_json::to_value(&root.fragment).ok())
    else {
        return out;
    };
    walk_js(&frag, |node, ancestors| {
        if node_type(node) != Some("BindDirective")
            || node.get("name").and_then(Value::as_str) != Some("this")
        {
            return;
        }
        let expr = node.get("expression");
        if expr.and_then(|e| e.get("type")).and_then(Value::as_str) != Some("Identifier") {
            return;
        }
        let Some(name) = expr.and_then(|e| e.get("name")).and_then(Value::as_str) else {
            return;
        };
        if !binding_names.contains(name) {
            return;
        }
        // The owning element is the nearest typed ancestor.
        let owner = ancestors.last().and_then(|p| node_type(p));
        if owner == Some("RegularElement") || owner == Some("SvelteElement") {
            out.insert(name.to_string());
        }
    });
    out
}

fn pos(node: &Value) -> Option<(u64, u64)> {
    Some((
        node.get("start").and_then(Value::as_u64)?,
        node.get("end").and_then(Value::as_u64)?,
    ))
}

#[derive(Default)]
pub struct NoDomManipulating;

impl ScriptRule for NoDomManipulating {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut toplevel: HashSet<String> = HashSet::new();
        collect_toplevel_decls(program, &mut toplevel);
        let dom_vars = collect_dom_vars(ctx.source(), &toplevel);
        if dom_vars.is_empty() {
            return;
        }
        let methods: HashSet<&str> = DOM_METHODS.iter().copied().collect();
        let properties: HashSet<&str> = DOM_PROPERTIES.iter().copied().collect();

        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, ancestors| {
            if node_type(node) != Some("MemberExpression") {
                return;
            }
            // `domVar.<name>` with a non-computed identifier property.
            if node.get("computed").and_then(Value::as_bool) == Some(true) {
                return;
            }
            let object_is_dom = node
                .get("object")
                .filter(|o| node_type(o) == Some("Identifier"))
                .and_then(|o| o.get("name"))
                .and_then(Value::as_str)
                .is_some_and(|n| dom_vars.contains(n));
            if !object_is_dom {
                return;
            }
            let Some(name) = node
                .get("property")
                .filter(|p| node_type(p) == Some("Identifier"))
                .and_then(|p| p.get("name"))
                .and_then(Value::as_str)
            else {
                return;
            };

            // Walk up past ChainExpression wrappers to the call / assignment.
            let mut target_pos = pos(node);
            let mut idx = ancestors.len();
            while idx > 0 && node_type(ancestors[idx - 1]) == Some("ChainExpression") {
                target_pos = pos(ancestors[idx - 1]);
                idx -= 1;
            }
            if idx == 0 {
                return;
            }
            let parent = ancestors[idx - 1];
            let manipulates = match node_type(parent) {
                Some("CallExpression") => {
                    pos(parent.get("callee").unwrap_or(&Value::Null)) == target_pos
                        && methods.contains(name)
                }
                Some("AssignmentExpression") => {
                    pos(parent.get("left").unwrap_or(&Value::Null)) == target_pos
                        && properties.contains(name)
                }
                _ => false,
            };
            if manipulates && let Some((s, e)) = pos(node) {
                reports.push((s as u32, e as u32));
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
