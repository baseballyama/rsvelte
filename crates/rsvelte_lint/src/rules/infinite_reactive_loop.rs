use std::collections::{HashMap, HashSet};

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/infinite-reactive-loop",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent.",
    options_schema: None,
};

const MSG_UNEXPECTED: &str = "Possibly it may occur an infinite reactive loop.";

fn unexpected_call_msg(variable_name: &str) -> String {
    format!(
        "Possibly it may occur an infinite reactive loop because this function may update `{variable_name}`."
    )
}

fn same_pos(a: &Value, b: &Value) -> bool {
    node_start(a) == node_start(b)
}

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// Is `ident` the callee of a direct CallExpression (`foo(...)`)?
fn is_direct_call_callee(ident: &Value, parent: Option<&Value>) -> bool {
    let Some(p) = parent else {
        return false;
    };
    if node_type(p) != Some("CallExpression") {
        return false;
    }
    p.get("callee").is_some_and(|c| same_pos(c, ident))
}

/// Collect top-level bound names and function bodies from the program.
fn collect_top_level<'a>(program: &'a Value) -> (HashMap<String, &'a Value>, HashSet<String>) {
    let mut func_map: HashMap<String, &'a Value> = HashMap::new();
    let mut all_names: HashSet<String> = HashSet::new();

    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return (func_map, all_names);
    };

    for stmt in body {
        collect_stmt_names(stmt, &mut func_map, &mut all_names);
    }

    (func_map, all_names)
}

fn collect_stmt_names<'a>(
    stmt: &'a Value,
    func_map: &mut HashMap<String, &'a Value>,
    all_names: &mut HashSet<String>,
) {
    match node_type(stmt) {
        Some("FunctionDeclaration") => {
            if let Some(name) = stmt.get("id").and_then(|id| ident_name(id)) {
                all_names.insert(name.to_string());
                if let Some(b) = stmt.get("body") {
                    func_map.insert(name.to_string(), b);
                }
            }
        }
        Some("VariableDeclaration") => {
            if let Some(decls) = stmt.get("declarations").and_then(Value::as_array) {
                for decl in decls {
                    if let Some(name) = decl.get("id").and_then(|id| ident_name(id)) {
                        all_names.insert(name.to_string());
                        if let Some(init) = decl.get("init") {
                            let init_ty = node_type(init);
                            if (init_ty == Some("ArrowFunctionExpression")
                                || init_ty == Some("FunctionExpression"))
                                && let Some(b) = init.get("body")
                            {
                                func_map.insert(name.to_string(), b);
                            }
                        }
                    }
                }
            }
        }
        Some("ImportDeclaration") => {
            if let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) {
                for spec in specs {
                    if let Some(local) = spec.get("local").and_then(|l| ident_name(l)) {
                        all_names.insert(local.to_string());
                    }
                }
            }
        }
        Some("ExportNamedDeclaration") => {
            if let Some(decl) = stmt.get("declaration") {
                collect_stmt_names(decl, func_map, all_names);
            }
        }
        _ => {}
    }
}

/// Collect the set of names that are "microtask scheduler" functions:
/// - Global builtins: `setTimeout`, `setInterval`, `queueMicrotask`
/// - `tick` from `'svelte'`
/// - Top-level const aliases of the above
fn collect_task_names(program: &Value, top_level_names: &HashSet<String>) -> HashSet<String> {
    let mut tasks: HashSet<String> = HashSet::new();

    // Builtins (only if not re-declared at top level).
    for b in &["setTimeout", "setInterval", "queueMicrotask"] {
        if !top_level_names.contains(*b) {
            tasks.insert(b.to_string());
        }
    }

    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return tasks;
    };

    // Import `{ tick [as X] } from 'svelte'`.
    for stmt in body {
        if node_type(stmt) != Some("ImportDeclaration") {
            continue;
        }
        let source = stmt
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(Value::as_str);
        if source != Some("svelte") {
            continue;
        }
        if let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) {
            for spec in specs {
                let imported = spec.get("imported").and_then(|i| ident_name(i));
                if imported != Some("tick") {
                    continue;
                }
                if let Some(local) = spec.get("local").and_then(|l| ident_name(l)) {
                    tasks.insert(local.to_string());
                }
            }
        }
    }

    // Alias chains: `const X = knownTask` at top level.
    loop {
        let mut added = false;
        for stmt in body {
            if node_type(stmt) != Some("VariableDeclaration") {
                continue;
            }
            if let Some(decls) = stmt.get("declarations").and_then(Value::as_array) {
                for decl in decls {
                    let alias = decl.get("id").and_then(|id| ident_name(id));
                    let init_name = decl.get("init").and_then(|init| {
                        if node_type(init) == Some("Identifier") {
                            ident_name(init)
                        } else {
                            None
                        }
                    });
                    if let (Some(a), Some(i)) = (alias, init_name)
                        && tasks.contains(i)
                        && !tasks.contains(a)
                    {
                        tasks.insert(a.to_string());
                        added = true;
                    }
                }
            }
        }
        if !added {
            break;
        }
    }

    tasks
}

/// Collect all top-level identifier names referenced (not in call position)
/// within `node`. These are the "reactive variable names" for this `$:` statement.
///
/// Also includes `$name` store subscriptions when the base `name` is top-level.
fn collect_tracked_names(node: &Value, top_level_names: &HashSet<String>) -> HashSet<String> {
    let mut tracked = HashSet::new();
    walk_js(node, |n, ancestors| {
        if node_type(n) != Some("Identifier") {
            return;
        }
        let Some(name) = n.get("name").and_then(Value::as_str) else {
            return;
        };
        // A name is "tracked" if:
        // - it is directly in top_level_names, OR
        // - it starts with `$` and the base name (without `$`) is in top_level_names
        //   (Svelte store subscription).
        let is_top_level = top_level_names.contains(name)
            || name
                .strip_prefix('$')
                .is_some_and(|base| top_level_names.contains(base));
        if !is_top_level {
            return;
        }
        if is_direct_call_callee(n, ancestors.last().copied()) {
            return;
        }
        tracked.insert(name.to_string());
    });
    tracked
}

/// Is `ident` the left-hand side of an assignment?
/// - `ident = expr` (direct)
/// - `ident.prop = expr` (member assignment)
fn is_assign_target(ident: &Value, ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return false;
    };

    if node_type(parent) == Some("AssignmentExpression")
        && let Some(left) = parent.get("left")
        && node_type(left) == Some("Identifier")
        && same_pos(left, ident)
    {
        return true;
    }

    if node_type(parent) == Some("MemberExpression") {
        if !parent.get("object").is_some_and(|o| same_pos(o, ident)) {
            return false;
        }
        if ancestors.len() < 2 {
            return false;
        }
        let gp = ancestors[ancestors.len() - 2];
        if node_type(gp) != Some("AssignmentExpression") {
            return false;
        }
        if let Some(left) = gp.get("left")
            && node_type(left) == Some("MemberExpression")
            && let Some(obj) = left.get("object")
            && node_type(obj) == Some("Identifier")
            && same_pos(obj, ident)
        {
            return true;
        }
    }

    false
}

/// Is `fn_node` a function argument to a `.then()` or `.catch()` call?
fn is_promise_then_catch_arg(fn_node: &Value, ancestors: &[&Value]) -> bool {
    if !matches!(
        node_type(fn_node),
        Some("ArrowFunctionExpression") | Some("FunctionExpression")
    ) {
        return false;
    }
    let Some(parent) = ancestors.last() else {
        return false;
    };
    if node_type(parent) != Some("CallExpression") {
        return false;
    }
    let Some(callee) = parent.get("callee") else {
        return false;
    };
    if node_type(callee) != Some("MemberExpression") {
        return false;
    }
    callee
        .get("property")
        .and_then(|p| ident_name(p))
        .is_some_and(|n| n == "then" || n == "catch")
}

/// Is `node` the left side of `left = await rhs`?
fn is_left_of_await_assign(node: &Value, ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return false;
    };
    if node_type(parent) != Some("AssignmentExpression") {
        return false;
    }
    if !parent.get("left").is_some_and(|l| same_pos(l, node)) {
        return false;
    }
    parent
        .get("right")
        .is_some_and(|r| node_type(r) == Some("AwaitExpression"))
}

/// Is `node` inside a call to a task scheduler function?
/// We check if any ancestor is a CallExpression whose callee is a task-named Identifier.
fn is_inside_task_call(node: &Value, ancestors: &[&Value], task_names: &HashSet<String>) -> bool {
    let Some(ns) = node_start(node) else {
        return false;
    };
    let Some(ne) = node_end(node) else {
        return false;
    };
    for anc in ancestors {
        if node_type(anc) != Some("CallExpression") {
            continue;
        }
        let callee_name = anc.get("callee").and_then(|c| {
            if node_type(c) == Some("Identifier") {
                ident_name(c)
            } else {
                None
            }
        });
        let Some(cn) = callee_name else {
            continue;
        };
        if !task_names.contains(cn) {
            continue;
        }
        let Some(as_) = node_start(anc) else {
            continue;
        };
        let Some(ae) = node_end(anc) else {
            continue;
        };
        if ns >= as_ && ne <= ae {
            return true;
        }
    }
    false
}

/// Is `node` inside an async function declaration/expression? (Not the outermost.)
fn is_inside_async_fn(ancestors: &[&Value]) -> bool {
    for anc in ancestors.iter().rev() {
        match node_type(anc) {
            Some("FunctionDeclaration")
                if anc.get("async").and_then(Value::as_bool) == Some(true) =>
            {
                return true;
            }
            Some("VariableDeclarator") => {
                if let Some(init) = anc.get("init")
                    && matches!(
                        node_type(init),
                        Some("FunctionExpression") | Some("ArrowFunctionExpression")
                    )
                    && init.get("async").and_then(Value::as_bool) == Some(true)
                {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Is `name` locally declared (shadowing top-level) at the call site?
fn is_shadowed_locally(name: &str, ancestors: &[&Value]) -> bool {
    for anc in ancestors.iter().rev() {
        match node_type(anc) {
            Some("BlockStatement") => {
                if let Some(stmts) = anc.get("body").and_then(Value::as_array) {
                    for stmt in stmts {
                        if node_type(stmt) != Some("VariableDeclaration") {
                            continue;
                        }
                        if let Some(decls) = stmt.get("declarations").and_then(Value::as_array) {
                            for d in decls {
                                if d.get("id").and_then(|id| ident_name(id)) == Some(name) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            Some("ArrowFunctionExpression")
            | Some("FunctionExpression")
            | Some("FunctionDeclaration") => {
                if let Some(params) = anc.get("params")
                    && params_contain(params, name)
                {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

fn params_contain(params: &Value, name: &str) -> bool {
    if let Some(arr) = params.as_array() {
        for p in arr {
            if pattern_contains(p, name) {
                return true;
            }
        }
    }
    false
}

fn pattern_contains(pat: &Value, name: &str) -> bool {
    match node_type(pat) {
        Some("Identifier") => ident_name(pat) == Some(name),
        Some("AssignmentPattern") => pat.get("left").is_some_and(|l| pattern_contains(l, name)),
        Some("ObjectPattern") => {
            pat.get("properties")
                .and_then(Value::as_array)
                .is_some_and(|ps| {
                    ps.iter().any(|p| {
                        p.get("value").is_some_and(|v| pattern_contains(v, name))
                            || p.get("key").is_some_and(|k| pattern_contains(k, name))
                    })
                })
        }
        Some("ArrayPattern") => pat
            .get("elements")
            .and_then(Value::as_array)
            .is_some_and(|es| {
                es.iter()
                    .filter(|e| !e.is_null())
                    .any(|e| pattern_contains(e, name))
            }),
        Some("RestElement") => pat
            .get("argument")
            .is_some_and(|a| pattern_contains(a, name)),
        _ => false,
    }
}

/// A pending diagnostic.
type Rep = (u32, u32, String);

/// The core DFS.  We pass `is_same` as mutable state and a `boundary_stack`
/// to restore it on leave.  The ancestor stack is `&[&Value]` (by reference
/// from the call stack).
#[allow(clippy::too_many_arguments)]
fn verify_node<'a>(
    node: &'a Value,
    func_map: &'a HashMap<String, &'a Value>,
    task_names: &HashSet<String>,
    reactive_names: &HashSet<String>,
    top_level_names: &HashSet<String>,
    call_chain: &[(u32, u32, String)], // (ident_start, ident_end, fn_name) of the callers
    is_same: &mut bool,
    is_top_reactive: bool, // true when this body IS the reactive statement body
    processed: &mut HashSet<u32>,
    reports: &mut Vec<Rep>,
    // mutable ancestor stack for the current call frame
    ancestors: &mut Vec<&'a Value>,
    // boundary stack: (node_start, saved_is_same) for boundary nodes we enter
    boundary: &mut Vec<(u32, bool)>,
) {
    match node {
        Value::Object(map) => {
            let ty = map.get("type").and_then(Value::as_str);
            if let Some(ty_str) = ty {
                let ns = map.get("start").and_then(Value::as_u64).unwrap_or(u64::MAX) as u32;
                let ne = map.get("end").and_then(Value::as_u64).unwrap_or(0) as u32;

                // ---- ENTER ----
                let mut is_boundary_node = false;
                let saved = *is_same;

                // 1. Promise .then/.catch function argument → enters new microtask.
                if *is_same && is_promise_then_catch_arg(node, ancestors) {
                    *is_same = false;
                    boundary.push((ns, saved));
                    is_boundary_node = true;
                }

                // 2. Node is inside a task-call (setTimeout etc.) → new microtask.
                if *is_same && !is_boundary_node && is_inside_task_call(node, ancestors, task_names)
                {
                    *is_same = false;
                    boundary.push((ns, saved));
                    is_boundary_node = true;
                }

                // 3. Node is the left of `left = await rhs` → new microtask.
                if *is_same && !is_boundary_node && is_left_of_await_assign(node, ancestors) {
                    *is_same = false;
                    boundary.push((ns, saved));
                    is_boundary_node = true;
                }

                // Function call → recurse into the top-level function body.
                if ty_str == "Identifier"
                    && let Some(fn_name) = map.get("name").and_then(Value::as_str)
                    && is_direct_call_callee(node, ancestors.last().copied())
                    && !is_shadowed_locally(fn_name, ancestors)
                    && let Some(&fn_body) = func_map.get(fn_name)
                {
                    let body_key = node_start(fn_body).unwrap_or(u32::MAX);
                    if !processed.contains(&body_key) {
                        let mut new_chain = call_chain.to_vec();
                        new_chain.push((ns, ne, fn_name.to_string()));
                        let cur_is_same = *is_same;
                        verify_root(
                            fn_body,
                            func_map,
                            task_names,
                            reactive_names,
                            top_level_names,
                            &new_chain,
                            cur_is_same,
                            false,
                            processed,
                            reports,
                        );
                    }
                }

                // Check for reactive variable assignment when not in same microtask.
                if !*is_same
                    && ty_str == "Identifier"
                    && let Some(name) = map.get("name").and_then(Value::as_str)
                    && reactive_names.contains(name)
                    && !is_direct_call_callee(node, ancestors.last().copied())
                    && is_assign_target(node, ancestors)
                    && !is_shadowed_locally(name, ancestors)
                {
                    reports.push((ns, ne, MSG_UNEXPECTED.to_string()));
                    // `variableName` in the message is the assigned variable's
                    // name, not the function name (mirrors upstream `node.name`).
                    for (cs, ce, _cn) in call_chain {
                        reports.push((*cs, *ce, unexpected_call_msg(name)));
                    }
                }

                // Push self to ancestor stack before recursing into children.
                ancestors.push(node);

                for (k, v) in map {
                    if k != "loc" {
                        verify_node(
                            v,
                            func_map,
                            task_names,
                            reactive_names,
                            top_level_names,
                            call_chain,
                            is_same,
                            is_top_reactive,
                            processed,
                            reports,
                            ancestors,
                            boundary,
                        );
                    }
                }

                ancestors.pop();

                // ---- LEAVE ----

                // AwaitExpression: on leave, may set is_same = false.
                if ty_str == "AwaitExpression" {
                    if is_top_reactive {
                        // Only affects state if NOT inside an inner async function.
                        if !is_inside_async_fn(ancestors) {
                            *is_same = false;
                        }
                    } else {
                        *is_same = false;
                    }
                }

                // Restore is_same on leave of a boundary node.
                if is_boundary_node && let Some(pos) = boundary.iter().rposition(|(s, _)| *s == ns)
                {
                    let (_, old) = boundary.remove(pos);
                    *is_same = old;
                }
            } else {
                for (k, v) in map {
                    if k != "loc" {
                        verify_node(
                            v,
                            func_map,
                            task_names,
                            reactive_names,
                            top_level_names,
                            call_chain,
                            is_same,
                            is_top_reactive,
                            processed,
                            reports,
                            ancestors,
                            boundary,
                        );
                    }
                }
            }
        }
        Value::Array(arr) => {
            for v in arr {
                verify_node(
                    v,
                    func_map,
                    task_names,
                    reactive_names,
                    top_level_names,
                    call_chain,
                    is_same,
                    is_top_reactive,
                    processed,
                    reports,
                    ancestors,
                    boundary,
                );
            }
        }
        _ => {}
    }
}

/// Entry point for verifying a single body node (reactive stmt body or function body).
#[allow(clippy::too_many_arguments)]
fn verify_root<'a>(
    body: &'a Value,
    func_map: &'a HashMap<String, &'a Value>,
    task_names: &HashSet<String>,
    reactive_names: &HashSet<String>,
    top_level_names: &HashSet<String>,
    call_chain: &[(u32, u32, String)],
    initial_is_same: bool,
    is_top_reactive: bool,
    processed: &mut HashSet<u32>,
    reports: &mut Vec<Rep>,
) {
    let key = node_start(body).unwrap_or(u32::MAX);
    if !processed.insert(key) {
        return;
    }

    let mut is_same = initial_is_same;
    let mut ancestors: Vec<&Value> = Vec::new();
    let mut boundary: Vec<(u32, bool)> = Vec::new();

    verify_node(
        body,
        func_map,
        task_names,
        reactive_names,
        top_level_names,
        call_chain,
        &mut is_same,
        is_top_reactive,
        processed,
        reports,
        &mut ancestors,
        &mut boundary,
    );
}

pub struct InfiniteReactiveLoop;

impl ScriptRule for InfiniteReactiveLoop {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let (func_map, top_level_names) = collect_top_level(program);
        let task_names = collect_task_names(program, &top_level_names);

        let mut all_reports: Vec<Rep> = Vec::new();

        walk_js(program, |node, _| {
            if node_type(node) != Some("LabeledStatement") {
                return;
            }
            let label_name = node
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str);
            if label_name != Some("$") {
                return;
            }
            let Some(body) = node.get("body") else {
                return;
            };

            let reactive_names = collect_tracked_names(body, &top_level_names);
            if reactive_names.is_empty() {
                return;
            }

            let mut processed: HashSet<u32> = HashSet::new();
            let mut reports: Vec<Rep> = Vec::new();

            verify_root(
                body,
                &func_map,
                &task_names,
                &reactive_names,
                &top_level_names,
                &[],
                true,
                true,
                &mut processed,
                &mut reports,
            );

            all_reports.extend(reports);
        });

        // Sort by start offset to match upstream's traversal order.
        all_reports.sort_by_key(|(s, _, _)| *s);

        for (start, end, message) in all_reports {
            ctx.report(start, end, message);
        }
    }
}
