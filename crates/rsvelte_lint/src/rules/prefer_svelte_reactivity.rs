//! `svelte/prefer-svelte-reactivity` — flag a mutated instance of a built-in
//! `Date` / `Map` / `Set` / `URL` / `URLSearchParams` where `svelte/reactivity`
//! offers a reactive alternative (`SvelteDate`, …). Port of the eslint-plugin-svelte
//! rule, over the `<script>` ESTree program via the [`ScriptRule`] hook.
//!
//! A `new <Class>(…)` is flagged only when the constructed instance is later
//! *mutated*:
//!   - `Date` — a `setX` method call (`setDate`, `setFullYear`, …);
//!   - `Map` — `clear` / `delete` / `set`;
//!   - `Set` — `add` / `clear` / `delete`;
//!   - `URLSearchParams` — `append` / `delete` / `set` / `sort`;
//!   - `URL` — an assignment to a mutable property (`hash`, `host`, …).
//!
//! The constructor identifier must resolve to the global built-in: if a binding
//! of that name exists in the script (e.g. `import { SvelteMap as Map }` or
//! `import { Date } from "pkg"`), it is shadowed and never flagged. Read-only
//! usage (`date.getTime()`, `map.get(k)`) is fine.
//!
//! The plugin additionally flags exported instances in `*.svelte.js` /
//! `*.svelte.ts` modules; those fixtures are `.svelte.js` files (not collected
//! by the component oracle) and that path is intentionally not ported here.

use serde_json::Value;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

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

/// Method names that mutate an instance of `class`. `URL` mutates via property
/// assignment, not methods, so it has no method mutators.
fn method_mutators(class: &str) -> &'static [&'static str] {
    match class {
        "Date" => DATE_MUT,
        "Map" => MAP_MUT,
        "Set" => SET_MUT,
        "URLSearchParams" => USP_MUT,
        _ => &[],
    }
}

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

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// The constructor class name of a `NewExpression` with a plain `Identifier`
/// callee, when that name is one we care about.
fn new_class(node: &Value) -> Option<&str> {
    if node_type(node) != Some("NewExpression") {
        return None;
    }
    let name = ident_name(node.get("callee")?)?;
    matches!(name, "Date" | "Map" | "Set" | "URL" | "URLSearchParams").then_some(name)
}

/// Collect names that shadow built-ins in `program` (imports, function/class
/// declarations, variable declarators).
fn collect_shadowed(program: &Value) -> Vec<String> {
    let mut shadowed: Vec<String> = Vec::new();
    walk_js(program, |node, _| match node_type(node) {
        Some("ImportSpecifier")
        | Some("ImportDefaultSpecifier")
        | Some("ImportNamespaceSpecifier") => {
            if let Some(n) = node.get("local").and_then(ident_name) {
                shadowed.push(n.to_string());
            }
        }
        Some("FunctionDeclaration") | Some("ClassDeclaration") => {
            if let Some(n) = node.get("id").and_then(ident_name) {
                shadowed.push(n.to_string());
            }
        }
        Some("VariableDeclarator") => {
            if let Some(n) = node.get("id").and_then(ident_name) {
                shadowed.push(n.to_string());
            }
        }
        _ => {}
    });
    shadowed
}

/// Collect `(var_name, class, new_expr_start)` for every `new <Class>(…)`
/// assigned to a plain identifier in `program`, excluding classes shadowed by
/// `shadowed`.
fn collect_instances(program: &Value, shadowed: &[String]) -> Vec<(String, &'static str, u32)> {
    let is_shadowed = |class: &str| shadowed.iter().any(|s| s == class);
    let mut instances: Vec<(String, &'static str, u32)> = Vec::new();
    walk_js(program, |node, _| {
        if node_type(node) != Some("VariableDeclarator") {
            return;
        }
        if let Some(n) = node.get("id").and_then(ident_name)
            && let Some(init) = node.get("init")
            && let Some(class) = new_class(init)
            && !is_shadowed(class)
            && let Some(start) = node_start(init)
        {
            instances.push((n.to_string(), class_static(class), start));
        }
    });
    instances
}

/// Walk `program` and check whether any of the `live` instances are mutated.
/// Returns the set of `(new_expr_start, class)` pairs that are mutated.
fn collect_mutations(
    program: &Value,
    live: &[(String, &'static str, u32)],
    shadowed: &[String],
) -> Vec<(u32, &'static str)> {
    let is_shadowed = |class: &str| shadowed.iter().any(|s| s == class);
    let mut mutated: Vec<(u32, &'static str)> = Vec::new();
    let mut mark = |class: &'static str, start: u32| {
        if !mutated.iter().any(|(s, _)| *s == start) {
            mutated.push((start, class));
        }
    };
    walk_js(program, |node, _| {
        match node_type(node) {
            // Method-call mutation: `obj.<mutator>(...)`.
            Some("CallExpression") => {
                let Some(callee) = node.get("callee") else {
                    return;
                };
                if node_type(callee) != Some("MemberExpression") {
                    return;
                }
                let Some(prop) = member_prop(callee) else {
                    return;
                };
                let obj = callee.get("object").unwrap_or(&Value::Null);
                // Instance variable.
                if let Some(name) = ident_name(obj) {
                    for (var, class, start) in live {
                        if var == name && method_mutators(class).contains(&prop) {
                            mark(class, *start);
                        }
                    }
                }
                // Inline `new X().<mutator>()`.
                if let Some(class) = new_class(obj)
                    && !is_shadowed(class)
                    && method_mutators(class).contains(&prop)
                    && let Some(start) = node_start(obj)
                {
                    mark(class_static(class), start);
                }
            }
            // URL property assignment: `url.<prop> = ...`.
            Some("AssignmentExpression") => {
                let Some(left) = node.get("left") else {
                    return;
                };
                if node_type(left) != Some("MemberExpression") {
                    return;
                }
                let Some(prop) = member_prop(left) else {
                    return;
                };
                if !URL_PROPS.contains(&prop) {
                    return;
                }
                let obj = left.get("object").unwrap_or(&Value::Null);
                if let Some(name) = ident_name(obj) {
                    for (var, class, start) in live {
                        if var == name && *class == "URL" {
                            mark(class, *start);
                        }
                    }
                }
                if new_class(obj) == Some("URL")
                    && !is_shadowed("URL")
                    && let Some(start) = node_start(obj)
                {
                    mark("URL", start);
                }
            }
            _ => {}
        }
    });
    mutated
}

#[derive(Default)]
pub struct PreferSvelteReactivity;

impl ScriptRule for PreferSvelteReactivity {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let shadowed = collect_shadowed(program);
        let instances = collect_instances(program, &shadowed);
        // Live instances are already filtered for shadowing inside
        // `collect_instances`.
        let live = instances;

        let mutated = collect_mutations(program, &live, &shadowed);

        let mut mutated_sorted = mutated;
        mutated_sorted.sort_by_key(|(s, _)| *s);
        for (start, class) in mutated_sorted {
            if let Some(msg) = class_message(class) {
                ctx.report(start, start, msg);
            }
        }
    }
}

/// `Rule` implementation for `PreferSvelteReactivity` — handles the
/// CROSS-SCRIPT case where `new <Class>(…)` is declared in one script
/// (`<script context="module">`) but mutated in the OTHER script (the instance
/// `<script>`). The per-script `check_program` hook can only see one script at
/// a time, so it misses this pattern. `check_root` has access to both programs.
///
/// To avoid double-reporting same-script cases (already caught by
/// `check_program`), this hook reports ONLY when the declaration and the
/// mutation live in DIFFERENT scripts.
impl Rule for PreferSvelteReactivity {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // Need both scripts to check cross-script mutation.
        let (Some(module_script), Some(instance_script)) =
            (root.module.as_ref(), root.instance.as_ref())
        else {
            return; // Nothing to cross-check.
        };

        // Serialize both programs inside the arena scope (already active because
        // `check_root` is called from `run_native_rules` → `with_serialize_arena`).
        let module_program =
            with_serialize_arena(&root.arena, || module_script.content.as_json().clone());
        let instance_program =
            with_serialize_arena(&root.arena, || instance_script.content.as_json().clone());

        // Collect shadowed names and instances from BOTH scripts.
        let module_shadowed = collect_shadowed(&module_program);
        let instance_shadowed = collect_shadowed(&instance_program);

        // Instances declared in the module script.
        let module_instances = collect_instances(&module_program, &module_shadowed);
        // Instances declared in the instance script.
        let instance_instances = collect_instances(&instance_program, &instance_shadowed);

        // Case A: declared in module, mutated in instance.
        // The same-script check (module declares + module mutates) is handled by
        // `check_program` for the module program; we only emit when the mutation
        // is in the instance script.
        let all_shadowed_for_a: Vec<String> = module_shadowed
            .iter()
            .chain(instance_shadowed.iter())
            .cloned()
            .collect();
        {
            let mutated_in_instance =
                collect_mutations(&instance_program, &module_instances, &all_shadowed_for_a);
            // Only keep instances that are NOT ALSO mutated in the module script
            // (to avoid double-reporting when both scripts mutate them — the
            // module check_program call would already fire).
            let mutated_in_module =
                collect_mutations(&module_program, &module_instances, &module_shadowed);
            let mutated_in_module_starts: std::collections::HashSet<u32> =
                mutated_in_module.iter().map(|(s, _)| *s).collect();
            for (start, class) in &mutated_in_instance {
                if mutated_in_module_starts.contains(start) {
                    continue; // already reported by check_program on the module
                }
                if let Some(msg) = class_message(class) {
                    ctx.report(*start, *start, msg);
                }
            }
        }

        // Case B: declared in instance, mutated in module.
        {
            let mutated_in_module =
                collect_mutations(&module_program, &instance_instances, &all_shadowed_for_a);
            // Exclude those already mutated in the instance script itself (to
            // avoid double-reporting).
            let mutated_in_instance_self =
                collect_mutations(&instance_program, &instance_instances, &instance_shadowed);
            let mutated_in_instance_starts: std::collections::HashSet<u32> =
                mutated_in_instance_self.iter().map(|(s, _)| *s).collect();
            for (start, class) in &mutated_in_module {
                if mutated_in_instance_starts.contains(start) {
                    continue;
                }
                if let Some(msg) = class_message(class) {
                    ctx.report(*start, *start, msg);
                }
            }
        }
    }
}

/// The non-computed property name of a `MemberExpression`, or `None` when the
/// access is computed (`obj[expr]`).
fn member_prop(member: &Value) -> Option<&str> {
    if member.get("computed").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    ident_name(member.get("property")?)
}

/// Map a class name to its `&'static str` (the set is closed, so this is total
/// for any value returned by [`new_class`]).
fn class_static(class: &str) -> &'static str {
    match class {
        "Date" => "Date",
        "Map" => "Map",
        "Set" => "Set",
        "URL" => "URL",
        "URLSearchParams" => "URLSearchParams",
        _ => "",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn new_class_recognises_builtins() {
        let n =
            json!({ "type": "NewExpression", "callee": { "type": "Identifier", "name": "Map" } });
        assert_eq!(new_class(&n), Some("Map"));
        let other =
            json!({ "type": "NewExpression", "callee": { "type": "Identifier", "name": "Foo" } });
        assert_eq!(new_class(&other), None);
    }

    #[test]
    fn method_mutator_sets() {
        assert!(method_mutators("Map").contains(&"set"));
        assert!(!method_mutators("Map").contains(&"get"));
        assert!(method_mutators("Date").contains(&"setFullYear"));
        assert!(method_mutators("URL").is_empty());
    }

    #[test]
    fn member_prop_skips_computed() {
        let m = json!({ "type": "MemberExpression", "computed": false, "property": { "type": "Identifier", "name": "set" } });
        assert_eq!(member_prop(&m), Some("set"));
        let c = json!({ "type": "MemberExpression", "computed": true, "property": { "type": "Identifier", "name": "set" } });
        assert_eq!(member_prop(&c), None);
    }
}
