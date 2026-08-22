use std::collections::{HashMap, HashSet};

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::reactive_stmt::{is_reactive_statement, source_is_ts};
use crate::rules::store_refs::{RefTracker, Trace, module_tracker};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/infinite-reactive-loop",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
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

/// Is `ident` the callee of a direct `CallExpression` (`foo(...)`)?
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

fn collect_pattern_names(pat: &Value, names: &mut HashSet<String>) {
    match node_type(pat) {
        Some("Identifier") => {
            if let Some(n) = ident_name(pat) {
                names.insert(n.to_string());
            }
        }
        Some("AssignmentPattern") => {
            if let Some(l) = pat.get("left") {
                collect_pattern_names(l, names);
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = pat.get("properties").and_then(Value::as_array) {
                for p in props {
                    if let Some(v) = p.get("value") {
                        collect_pattern_names(v, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(els) = pat.get("elements").and_then(Value::as_array) {
                for e in els.iter().filter(|e| !e.is_null()) {
                    collect_pattern_names(e, names);
                }
            }
        }
        Some("RestElement") => {
            if let Some(a) = pat.get("argument") {
                collect_pattern_names(a, names);
            }
        }
        _ => {}
    }
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
                    // Every name a declarator binds is a top-level variable —
                    // `let { retries } = config` included, not just `let x = …`.
                    if let Some(id) = decl.get("id") {
                        collect_pattern_names(id, all_names);
                    }
                    if let Some(name) = decl.get("id").and_then(|id| ident_name(id))
                        && let Some(init) = decl.get("init")
                        && matches!(
                            node_type(init),
                            Some("ArrowFunctionExpression" | "FunctionExpression")
                        )
                        && let Some(b) = init.get("body")
                    {
                        func_map.insert(name.to_string(), b);
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

/// The spans of every microtask-scheduling call in the program: `setTimeout` /
/// `setInterval` / `queueMicrotask` (upstream's `iterateGlobalReferences`, which
/// also reaches them through the global object — `window.setTimeout`) and
/// `tick` imported from `svelte` (`iterateEsmReferences`, alias- and
/// namespace-aware).
fn collect_task_call_spans(tracker: &RefTracker<'_>) -> HashSet<(u32, u32)> {
    let globals = Trace::parent(
        ["setTimeout", "setInterval", "queueMicrotask"]
            .into_iter()
            .map(|name| (name, Trace::call()))
            .collect(),
    );
    let tick = Trace::parent(vec![("tick", Trace::call())]);
    tracker
        .global_refs(&globals)
        .into_iter()
        .chain(tracker.esm_refs("svelte", &tick))
        .filter_map(|tracked| Some((node_start(tracked.node)?, node_end(tracked.node)?)))
        .collect()
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
    // Upstream reaches this through `getDeclarationBody`, whose only
    // non-declaration arm is `ArrowFunctionExpression` — an inline
    // `function () {}` returns null and the call is never treated as a
    // then-callback.
    if node_type(fn_node) != Some("ArrowFunctionExpression") {
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

/// Is `node` strictly inside one of the tracked task-scheduler calls?
/// Mirrors upstream's `isChildNode(callExpression, node)`, which starts from
/// `node.parent` and so never matches the call expression itself.
fn is_inside_task_call(
    node: &Value,
    ancestors: &[&Value],
    task_calls: &HashSet<(u32, u32)>,
) -> bool {
    let Some(ns) = node_start(node) else {
        return false;
    };
    let Some(ne) = node_end(node) else {
        return false;
    };
    ancestors.iter().any(|anc| {
        let (Some(as_), Some(ae)) = (node_start(anc), node_end(anc)) else {
            return false;
        };
        task_calls.contains(&(as_, ae)) && ns >= as_ && ne <= ae
    })
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
                        Some("FunctionExpression" | "ArrowFunctionExpression")
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

/// Whether `ident` is a reference to a **top-level** variable — upstream's
/// `reactiveVariableReferences.includes(node)`, which is built from
/// `toplevelScope.variables[].references` and therefore excludes a same-named
/// parameter, block `let`, or catch binding. Names the resolver cannot see
/// (a `$store` subscription, a `$: x = …` reactive value, a binding declared in
/// the other `<script>`) fall back to the collected top-level name set.
fn is_top_level_reference(
    tracker: &RefTracker<'_>,
    ident: &Value,
    name: &str,
    top_level_names: &HashSet<String>,
) -> bool {
    match tracker.find_variable(ident) {
        Some(var) => tracker.is_root(var),
        None => {
            top_level_names.contains(name)
                || name
                    .strip_prefix('$')
                    .is_some_and(|base| top_level_names.contains(base))
        }
    }
}

/// A pending diagnostic.
type Rep = (u32, u32, String);

/// The core DFS.  We pass `is_same` as mutable state and a `boundary_stack`
/// to restore it on leave.  The ancestor stack is `&[&Value]` (by reference
/// from the call stack).
fn verify_node<'a>(
    node: &'a Value,
    func_map: &'a HashMap<String, &'a Value>,
    tracker: &RefTracker<'_>,
    task_calls: &HashSet<(u32, u32)>,
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
            if let Some((ty_str, ns, ne)) = node_metadata(map) {
                let is_boundary_node =
                    enter_microtask_boundary(node, ancestors, task_calls, ns, is_same, boundary);

                let mut recursion = FunctionRecursion {
                    func_map,
                    tracker,
                    task_calls,
                    reactive_names,
                    top_level_names,
                    processed,
                    reports,
                };
                recursion.visit_call(node, map, ty_str, ancestors, call_chain, *is_same, ns, ne);

                recursion
                    .report_assignment(node, map, ty_str, ancestors, call_chain, *is_same, ns, ne);

                // Push self to ancestor stack before recursing into children.
                ancestors.push(node);

                for (k, v) in map {
                    if k != "loc" {
                        verify_node(
                            v,
                            func_map,
                            tracker,
                            task_calls,
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
                // Upstream's `leaveNode` sets `isSameMicroTask = true` for any
                // node it recorded on entry — it does NOT restore what the flag
                // was, so a task call after an `await` puts the statement back
                // in "same microtask". Parity requires reproducing that.
                if is_boundary_node && let Some(pos) = boundary.iter().rposition(|(s, _)| *s == ns)
                {
                    boundary.remove(pos);
                    *is_same = true;
                }
            } else {
                for (k, v) in map {
                    if k != "loc" {
                        verify_node(
                            v,
                            func_map,
                            tracker,
                            task_calls,
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
                    tracker,
                    task_calls,
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

fn node_metadata(map: &serde_json::Map<String, Value>) -> Option<(&str, u32, u32)> {
    Some((
        map.get("type")?.as_str()?,
        map.get("start")
            .and_then(Value::as_u64)
            .and_then(|value| u32::try_from(value).ok())
            .unwrap_or(u32::MAX),
        map.get("end")
            .and_then(Value::as_u64)
            .and_then(|value| u32::try_from(value).ok())
            .unwrap_or(0),
    ))
}

struct FunctionRecursion<'a, 'b> {
    func_map: &'a HashMap<String, &'a Value>,
    tracker: &'b RefTracker<'b>,
    task_calls: &'a HashSet<(u32, u32)>,
    reactive_names: &'a HashSet<String>,
    top_level_names: &'a HashSet<String>,
    processed: &'a mut HashSet<u32>,
    reports: &'a mut Vec<Rep>,
}

impl FunctionRecursion<'_, '_> {
    fn visit_call(
        &mut self,
        node: &Value,
        map: &serde_json::Map<String, Value>,
        node_type: &str,
        ancestors: &[&Value],
        call_chain: &[(u32, u32, String)],
        is_same: bool,
        start: u32,
        end: u32,
    ) {
        if node_type != "Identifier" {
            return;
        }
        let Some(function_name) = map.get("name").and_then(Value::as_str) else {
            return;
        };
        if !is_direct_call_callee(node, ancestors.last().copied())
            || !is_top_level_reference(self.tracker, node, function_name, self.top_level_names)
        {
            return;
        }
        let Some(body) = self.func_map.get(function_name) else {
            return;
        };
        if self
            .processed
            .contains(&node_start(body).unwrap_or(u32::MAX))
        {
            return;
        }
        let mut chain = call_chain.to_vec();
        chain.push((start, end, function_name.to_string()));
        verify_root(
            body,
            self.func_map,
            self.tracker,
            self.task_calls,
            self.reactive_names,
            self.top_level_names,
            &chain,
            is_same,
            false,
            self.processed,
            self.reports,
        );
    }

    fn report_assignment(
        &mut self,
        node: &Value,
        map: &serde_json::Map<String, Value>,
        node_type: &str,
        ancestors: &[&Value],
        call_chain: &[(u32, u32, String)],
        is_same: bool,
        start: u32,
        end: u32,
    ) {
        if is_same || node_type != "Identifier" {
            return;
        }
        let Some(name) = map.get("name").and_then(Value::as_str) else {
            return;
        };
        if !self.reactive_names.contains(name)
            || is_direct_call_callee(node, ancestors.last().copied())
            || !is_assign_target(node, ancestors)
            || !is_top_level_reference(self.tracker, node, name, self.top_level_names)
        {
            return;
        }
        self.reports.push((start, end, MSG_UNEXPECTED.to_string()));
        for (call_start, call_end, _) in call_chain {
            self.reports
                .push((*call_start, *call_end, unexpected_call_msg(name)));
        }
    }
}

fn enter_microtask_boundary(
    node: &Value,
    ancestors: &[&Value],
    task_calls: &HashSet<(u32, u32)>,
    node_start: u32,
    is_same: &mut bool,
    boundaries: &mut Vec<(u32, bool)>,
) -> bool {
    let enters_boundary = is_promise_then_catch_arg(node, ancestors)
        || is_inside_task_call(node, ancestors, task_calls)
        || is_left_of_await_assign(node, ancestors);
    if enters_boundary {
        boundaries.push((node_start, *is_same));
        *is_same = false;
    }
    enters_boundary
}

/// Entry point for verifying a single body node (reactive stmt body or function body).
fn verify_root<'a>(
    body: &'a Value,
    func_map: &'a HashMap<String, &'a Value>,
    tracker: &RefTracker<'_>,
    task_calls: &HashSet<(u32, u32)>,
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
        tracker,
        task_calls,
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

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let (func_map, top_level_names) = collect_top_level(program);
        let tracker = module_tracker(
            ctx.source(),
            program.value(),
            source_is_ts(ctx.source(), ctx.filename()),
        );
        let task_calls = collect_task_call_spans(&tracker);

        let mut all_reports: Vec<Rep> = Vec::new();

        program.walk(|node, ancestors| {
            if !is_reactive_statement(node, ancestors) {
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
                &tracker,
                &task_calls,
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
