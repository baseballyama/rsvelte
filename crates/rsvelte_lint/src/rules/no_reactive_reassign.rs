//! `svelte/no-reactive-reassign` — disallow reassigning a *reactive value* (a
//! variable declared by a `$: x = …` reactive statement) anywhere else. Mutating
//! it outside its reactive statement fights the reactivity system. Port of the
//! eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook, and also
//! re-parses the template (reactive values can be reassigned via a two-way
//! `bind:` in markup). For each reference to a reactive value the rule walks up
//! the parent chain — the `getReassignData` state machine — to decide whether
//! that reference is a write: a direct assignment / update / delete, a
//! `for (x in/of …)` target, a mutating array method (`push`/`pop`/`sort`/…),
//! a `bind:`, or an assignment to a member/destructure path of it. Property
//! paths report `assignmentToReactiveValueProp`; the rest report
//! `assignmentToReactiveValue`. The `props` option (default `true`) toggles
//! whether property-path writes are reported.

use std::collections::HashSet;

use rsvelte_core::ParseOptions;
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::phases::parse;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-reactive-reassign",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Disallow reassigning reactive values",
    options_schema: Some(
        r#"{ "type": "object", "properties": { "props": { "type": "boolean" } }, "additionalProperties": false }"#,
    ),
};

const ARRAY_MUTATORS: &[&str] = &[
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "splice",
    "sort",
    "copyWithin",
    "fill",
];

fn pos(node: &Value) -> Option<(u64, u64)> {
    Some((
        node.get("start").and_then(Value::as_u64)?,
        node.get("end").and_then(Value::as_u64)?,
    ))
}

fn same_pos(a: Option<&Value>, node: &Value) -> bool {
    matches!((a.and_then(pos), pos(node)), (Some(x), Some(y)) if x == y)
}

/// The (non-computed identifier / computed string-literal) property name of a
/// member expression.
fn property_name(member: &Value) -> Option<String> {
    let prop = member.get("property")?;
    let computed = member.get("computed").and_then(Value::as_bool) == Some(true);
    if !computed && node_type(prop) == Some("Identifier") {
        prop.get("name").and_then(Value::as_str).map(str::to_string)
    } else if computed && node_type(prop) == Some("Literal") {
        prop.get("value")
            .and_then(Value::as_str)
            .map(str::to_string)
    } else {
        None
    }
}

/// Walk up the parent chain from a reactive-value reference. Returns
/// `(report_start, report_end, property_path_len)` when the reference is a write.
fn get_reassign<'a>(id: &'a Value, ancestors: &[&'a Value]) -> Option<(u32, u32, usize)> {
    let mut path: Vec<&Value> = Vec::new();
    let mut node: &Value = id;
    let mut pi = ancestors.len(); // current node's parent is ancestors[pi - 1]
    loop {
        if pi == 0 {
            return None;
        }
        let parent = ancestors[pi - 1];
        let reassign_here = |p: &Value, len: usize| -> Option<(u32, u32, usize)> {
            pos(p).map(|(s, e)| (s as u32, e as u32, len))
        };
        match node_type(parent) {
            Some("UpdateExpression") => return reassign_here(parent, path.len()),
            Some("UnaryExpression") => {
                return if parent.get("operator").and_then(Value::as_str) == Some("delete") {
                    reassign_here(parent, path.len())
                } else {
                    None
                };
            }
            Some("AssignmentExpression") | Some("ForInStatement") | Some("ForOfStatement") => {
                return if same_pos(parent.get("left"), node) {
                    reassign_here(parent, path.len())
                } else {
                    None
                };
            }
            Some("CallExpression") => {
                if !path.is_empty() && same_pos(parent.get("callee"), node) {
                    let mem = *path.last().unwrap();
                    if let Some(name) = property_name(mem)
                        && ARRAY_MUTATORS.contains(&name.as_str())
                    {
                        path.pop();
                        return reassign_here(parent, path.len());
                    }
                }
                return None;
            }
            Some("MemberExpression") => {
                if same_pos(parent.get("object"), node) {
                    path.push(parent);
                    node = parent;
                    pi -= 1;
                    continue;
                }
                return None;
            }
            Some("ChainExpression") => {
                node = parent;
                pi -= 1;
                continue;
            }
            Some("ConditionalExpression") => {
                if same_pos(parent.get("test"), node) {
                    return None;
                }
                node = parent;
                pi -= 1;
                continue;
            }
            Some("Property") => {
                if same_pos(parent.get("value"), node)
                    && pi >= 2
                    && node_type(ancestors[pi - 2]) == Some("ObjectPattern")
                {
                    node = ancestors[pi - 2];
                    pi -= 2;
                    continue;
                }
                return None;
            }
            Some("ArrayPattern") => {
                let in_elements = parent
                    .get("elements")
                    .and_then(Value::as_array)
                    .is_some_and(|els| els.iter().any(|e| same_pos(Some(e), node)));
                if in_elements {
                    node = parent;
                    pi -= 1;
                    continue;
                }
                return None;
            }
            Some("RestElement") => {
                if same_pos(parent.get("argument"), node) && pi >= 2 {
                    node = ancestors[pi - 2];
                    pi -= 2;
                    continue;
                }
                return None;
            }
            Some("BindDirective") => {
                return if same_pos(parent.get("expression"), node) {
                    reassign_here(parent, path.len())
                } else {
                    None
                };
            }
            _ => return None,
        }
    }
}

/// Collect names declared at the top level of the script (explicit declarations
/// that make a `$: x = …` target *not* a pure reactive value).
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
                if let Some(ds) = decl.get("declarations").and_then(Value::as_array) {
                    for d in ds {
                        if let Some(n) = d
                            .get("id")
                            .filter(|i| node_type(i) == Some("Identifier"))
                            .and_then(|i| i.get("name"))
                            .and_then(Value::as_str)
                        {
                            out.insert(n.to_string());
                        }
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

/// Reactive value names (`$: name = …`, `name` not explicitly declared) and the
/// positions of those defining-LHS identifiers (skipped when scanning refs).
fn collect_reactive_values(
    program: &Value,
    toplevel: &HashSet<String>,
) -> (HashSet<String>, HashSet<(u64, u64)>) {
    let mut names = HashSet::new();
    let mut def_lhs = HashSet::new();
    walk_js(program, |node, _| {
        if node_type(node) != Some("LabeledStatement")
            || node
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
                != Some("$")
        {
            return;
        }
        let Some(body) = node.get("body") else { return };
        if node_type(body) != Some("ExpressionStatement") {
            return;
        }
        let Some(expr) = body.get("expression") else {
            return;
        };
        if node_type(expr) != Some("AssignmentExpression")
            || expr.get("operator").and_then(Value::as_str) != Some("=")
        {
            return;
        }
        let Some(left) = expr.get("left") else { return };
        if node_type(left) != Some("Identifier") {
            return;
        }
        if let Some(name) = left.get("name").and_then(Value::as_str)
            && !toplevel.contains(name)
            // A `$`-prefixed target (`$: $store = …`) is a *store* write, not a
            // reactive-variable declaration, so reassigning it elsewhere
            // (`$store++`) is a normal store update and must not be flagged.
            && !name.starts_with('$')
        {
            // Only the FIRST `$: name = …` statement *defines* the reactive
            // value; its LHS is the definition and is skipped. A LATER
            // `$: name = …` re-assigns the already-defined reactive value, so
            // its LHS must NOT go in `def_lhs` — upstream reports it (it iterates
            // the variable's references and excludes only the defining
            // assignment's own `.left`). `HashSet::insert` returns `true` only on
            // first insertion, so we record the def LHS exactly once per name.
            let is_first = names.insert(name.to_string());
            if is_first && let Some(p) = pos(left) {
                def_lhs.insert(p);
            }
        }
    });
    (names, def_lhs)
}

fn scan_refs(
    tree: &Value,
    reactive: &HashSet<String>,
    def_lhs: &HashSet<(u64, u64)>,
    props: bool,
    reports: &mut Vec<(u32, u32, String)>,
) {
    walk_js(tree, |node, ancestors| {
        if node_type(node) != Some("Identifier") {
            return;
        }
        let Some(name) = node.get("name").and_then(Value::as_str) else {
            return;
        };
        if !reactive.contains(name) {
            return;
        }
        if pos(node).is_some_and(|p| def_lhs.contains(&p)) {
            return;
        }
        if let Some((s, e, path_len)) = get_reassign(node, ancestors) {
            if !props && path_len > 0 {
                return;
            }
            let msg = if path_len == 0 {
                format!("Assignment to reactive value '{name}'.")
            } else {
                format!("Assignment to property of reactive value '{name}'.")
            };
            reports.push((s, e, msg));
        }
    });
}

#[derive(Default)]
pub struct NoReactiveReassign;

impl ScriptRule for NoReactiveReassign {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut toplevel = HashSet::new();
        collect_toplevel_decls(program, &mut toplevel);
        let (reactive, def_lhs) = collect_reactive_values(program, &toplevel);
        if reactive.is_empty() {
            return;
        }
        let props = ctx
            .option0()
            .and_then(|o| o.get("props"))
            .and_then(Value::as_bool)
            != Some(false);

        let mut reports: Vec<(u32, u32, String)> = Vec::new();
        scan_refs(program, &reactive, &def_lhs, props, &mut reports);
        // Reassignments via a two-way `bind:` live in the template.
        if let Ok(root) = parse(
            ctx.source(),
            &rsvelte_core::Allocator::default(),
            ParseOptions::default(),
        ) && let Some(frag) =
            with_serialize_arena(&root.arena, || serde_json::to_value(&root.fragment).ok())
        {
            scan_refs(&frag, &reactive, &def_lhs, props, &mut reports);
        }

        for (start, end, msg) in reports {
            ctx.report(start, end, msg);
        }
    }
}
