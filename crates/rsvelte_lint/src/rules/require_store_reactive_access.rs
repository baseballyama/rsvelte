//! `svelte/require-store-reactive-access` — disallow using a store itself as an
//! operand; the `$` prefix (or `get`) must be used to read its reactive value.
//! Port of the eslint-plugin-svelte rule (ES / non-type-aware path).
//!
//! A template rule (`check_root`): the whole component is serialized and walked
//! once. A *store* is a variable initialised by `writable`/`readable`/`derived`
//! from `svelte/store`. Each position that consumes a value (operators, control
//! flow, mustaches, directives, blocks, …) is checked; a bare store identifier
//! there is reported, and — where safe — auto-fixed by inserting `$`. Positions
//! marked *consistent* (comparisons, `&&`, `if`/`while`, `!`/`typeof`, `await`,
//! class directives) only flag `const` stores (a `let` store may have been
//! reassigned to a non-store). Type-only store detection (TS) is out of scope,
//! so the `ts/` fixtures are skipped by the oracle.

use std::collections::HashMap;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::collect_store_creators;
use crate::script::{node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-store-reactive-access",
    category: RuleCategory::Correctness,
    fixable: Fixable::Code,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow using a store as an operand without the `$` prefix",
    options_schema: None,
};

const MESSAGE: &str = "Use the $ prefix or the get function to access reactive values instead of accessing the raw store.";

/// A pending finding: the reported node span and an optional `$`-insert offset.
struct Report {
    start: u32,
    end: u32,
    fix_at: Option<u32>,
}

fn is_ident(node: &Value) -> bool {
    node_type(node) == Some("Identifier")
}

fn nstart(node: &Value) -> Option<u32> {
    node.get("start").and_then(Value::as_u64).map(|v| v as u32)
}
fn nend(node: &Value) -> Option<u32> {
    node.get("end").and_then(Value::as_u64).map(|v| v as u32)
}

/// Collect store variables: `const|let NAME = writable()/readable()/derived()`.
fn collect_store_vars(root_json: &Value) -> HashMap<String, bool> {
    let creators = collect_store_creators(root_json);
    let mut out = HashMap::new();
    if creators.is_empty() {
        return out;
    }
    walk_js(root_json, |node, _| {
        if node_type(node) != Some("VariableDeclaration") {
            return;
        }
        let is_const = node.get("kind").and_then(Value::as_str) == Some("const");
        let Some(decls) = node.get("declarations").and_then(Value::as_array) else {
            return;
        };
        for d in decls {
            let id = d.get("id");
            if id.map(|i| node_type(i)) != Some(Some("Identifier")) {
                continue;
            }
            let Some(name) = id.and_then(|i| i.get("name")).and_then(Value::as_str) else {
                continue;
            };
            let Some(init) = d.get("init").filter(|i| !i.is_null()) else {
                continue;
            };
            if node_type(init) == Some("CallExpression")
                && let Some(callee) = init.get("callee")
                && creators.creator_of(callee).is_some()
            {
                out.insert(name.to_string(), is_const);
            }
        }
    });
    out
}

struct Checker<'a> {
    stores: &'a HashMap<String, bool>,
    source: &'a [u8],
    reports: Vec<Report>,
}

impl Checker<'_> {
    /// `true` if `node` is a store identifier usable in this position.
    fn is_store(&self, node: &Value, consistent: bool) -> bool {
        if !is_ident(node) {
            return false;
        }
        let Some(name) = node.get("name").and_then(Value::as_str) else {
            return false;
        };
        if name.starts_with('$') {
            return false;
        }
        match self.stores.get(name) {
            None => false,
            Some(&is_const) => !consistent || is_const,
        }
    }

    fn verify(&mut self, node: Option<&Value>, consistent: bool, fixable: bool) {
        let Some(node) = node.filter(|n| !n.is_null()) else {
            return;
        };
        if !self.is_store(node, consistent) {
            return;
        }
        if let (Some(s), Some(e)) = (nstart(node), nend(node)) {
            self.reports.push(Report {
                start: s,
                end: e,
                fix_at: if fixable { Some(s) } else { None },
            });
        }
    }

    /// Source byte at `offset`, if any.
    fn byte_at(&self, offset: u32) -> Option<u8> {
        self.source.get(offset as usize).copied()
    }

    /// Verify a directive whose *name* is the store reference (`use:store`,
    /// `transition:store`, `style:color` shorthand). The store name occupies the
    /// trailing `name.len()` bytes of `name_loc`.
    fn verify_directive_name(&mut self, node: &Value, consistent: bool, fixable: bool) {
        let Some(name) = node.get("name").and_then(Value::as_str) else {
            return;
        };
        if name.starts_with('$') {
            return;
        }
        let is_store = match self.stores.get(name) {
            None => return,
            Some(&is_const) => !consistent || is_const,
        };
        if !is_store {
            return;
        }
        let Some(end) = node
            .get("name_loc")
            .and_then(|l| l.get("end"))
            .and_then(|e| e.get("character"))
            .and_then(Value::as_u64)
            .map(|v| v as u32)
        else {
            return;
        };
        let start = end.saturating_sub(name.len() as u32);
        self.reports.push(Report {
            start,
            end,
            fix_at: if fixable { Some(start) } else { None },
        });
    }
}

/// The nearest element-like ancestor type, scanning from innermost.
fn nearest_element(ancestors: &[&Value]) -> Option<&'static str> {
    for a in ancestors.iter().rev() {
        match node_type(a) {
            Some("RegularElement") => return Some("RegularElement"),
            Some("SvelteElement") => return Some("SvelteElement"),
            Some("Component") => return Some("Component"),
            Some("SvelteComponent") => return Some("SvelteComponent"),
            _ => {}
        }
    }
    None
}

fn element_accepts_store(el: Option<&'static str>) -> bool {
    matches!(el, Some("Component") | Some("SvelteComponent"))
}

#[derive(Default)]
pub struct RequireStoreReactiveAccess;

impl Rule for RequireStoreReactiveAccess {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let Some(root_json) = with_serialize_arena(&root.arena, || serde_json::to_value(root).ok())
        else {
            return;
        };
        let stores = collect_store_vars(&root_json);
        if stores.is_empty() {
            return;
        }
        let source = ctx.source().as_bytes();
        let mut checker = Checker {
            stores: &stores,
            source,
            reports: Vec::new(),
        };

        // Walk the whole component once; dispatch each position handler.
        let frag = root_json.get("fragment");
        let walk_targets: Vec<&Value> = [
            root_json.get("instance").and_then(|s| s.get("content")),
            root_json.get("module").and_then(|s| s.get("content")),
            frag,
        ]
        .into_iter()
        .flatten()
        .collect();

        for target in walk_targets {
            walk_dispatch(target, &mut checker);
        }

        let mut reports = std::mem::take(&mut checker.reports);
        reports.sort_by_key(|r| r.start);
        reports.dedup_by_key(|r| r.start);
        for r in reports {
            match r.fix_at {
                Some(at) => ctx.report_with_fix(
                    r.start,
                    r.end,
                    MESSAGE,
                    Fix {
                        message: "Add the `$` store-access prefix.".to_string(),
                        edits: vec![TextEdit {
                            start: at,
                            end: at,
                            new_text: "$".to_string(),
                        }],
                    },
                ),
                None => ctx.report(r.start, r.end, MESSAGE),
            }
        }
    }
}

fn is_eq_op(op: Option<&str>) -> bool {
    matches!(op, Some("==") | Some("!=") | Some("===") | Some("!=="))
}

fn walk_dispatch(root: &Value, checker: &mut Checker) {
    walk_js(root, |node, ancestors| {
        match node_type(node) {
            // ---- JS expression positions ----
            Some("UpdateExpression") | Some("SpreadElement") => {
                checker.verify(node.get("argument"), false, true);
            }
            Some("UnaryExpression") => {
                let op = node.get("operator").and_then(Value::as_str);
                let consistent = op == Some("!") || op == Some("typeof");
                checker.verify(node.get("argument"), consistent, true);
            }
            Some("AssignmentExpression")
                if node.get("operator").and_then(Value::as_str) != Some("=") =>
            {
                if let Some(left) = node.get("left") {
                    let lt = node_type(left);
                    if lt != Some("ObjectPattern") && lt != Some("ArrayPattern") {
                        checker.verify(Some(left), false, true);
                    }
                }
                checker.verify(node.get("right"), false, true);
            }
            Some("BinaryExpression") => {
                let consistent = is_eq_op(node.get("operator").and_then(Value::as_str));
                if node.get("left").map(node_type) != Some(Some("PrivateIdentifier")) {
                    checker.verify(node.get("left"), consistent, true);
                }
                checker.verify(node.get("right"), consistent, true);
            }
            Some("LogicalExpression") => {
                checker.verify(node.get("left"), true, true);
            }
            Some("ConditionalExpression")
            | Some("IfStatement")
            | Some("WhileStatement")
            | Some("DoWhileStatement")
            | Some("ForStatement") => {
                checker.verify(node.get("test"), true, true);
            }
            Some("ForInStatement") | Some("ForOfStatement") => {
                checker.verify(node.get("right"), false, true);
            }
            Some("SwitchStatement") => {
                checker.verify(node.get("discriminant"), false, true);
            }
            Some("CallExpression") | Some("NewExpression")
                if node.get("callee").map(node_type) != Some(Some("Super")) =>
            {
                checker.verify(node.get("callee"), false, true);
            }
            Some("TemplateLiteral") => {
                if let Some(exprs) = node.get("expressions").and_then(Value::as_array) {
                    for e in exprs {
                        checker.verify(Some(e), false, true);
                    }
                }
            }
            Some("TaggedTemplateExpression") => {
                checker.verify(node.get("tag"), false, true);
            }
            Some("Property") | Some("PropertyDefinition") | Some("MethodDefinition") => {
                let key_is_private =
                    node.get("key").map(node_type) == Some(Some("PrivateIdentifier"));
                let computed = node.get("computed").and_then(Value::as_bool) == Some(true);
                if !key_is_private && computed {
                    checker.verify(node.get("key"), false, true);
                }
            }
            Some("ImportExpression") => {
                checker.verify(node.get("source"), false, true);
            }
            Some("AwaitExpression") => {
                checker.verify(node.get("argument"), true, true);
            }
            // ---- Template positions ----
            Some("ExpressionTag") => {
                handle_expression_tag(node, ancestors, checker);
            }
            Some("SpreadAttribute") => {
                checker.verify(node.get("expression"), false, true);
            }
            Some("ClassDirective") => {
                let shorthand = directive_is_shorthand(node, checker);
                checker.verify(node.get("expression"), true, !shorthand);
            }
            Some("BindDirective") => {
                handle_bind_directive(node, ancestors, checker);
            }
            Some("OnDirective") => {
                checker.verify(node.get("expression"), false, true);
            }
            // `use:store` / `transition|in|out:store` / `animate:store` — the
            // directive name itself is the store reference (fixable).
            Some("UseDirective") | Some("TransitionDirective") | Some("AnimateDirective") => {
                checker.verify_directive_name(node, false, true);
            }
            // `style:color` shorthand — the name is the store (not fixable).
            Some("StyleDirective") if node.get("value").and_then(Value::as_bool) == Some(true) => {
                checker.verify_directive_name(node, false, false);
            }
            // `<svelte:component this={store}>` / `<svelte:element this={store}>`.
            Some("SvelteComponent") => {
                checker.verify(node.get("expression"), false, true);
            }
            Some("SvelteElement") => {
                checker.verify(node.get("tag"), false, true);
            }
            Some("IfBlock") | Some("AwaitBlock") => {
                // {#if store} / {#await store} — consistent.
                checker.verify(
                    node.get("test").or_else(|| node.get("expression")),
                    true,
                    true,
                );
            }
            Some("EachBlock") => {
                checker.verify(node.get("expression"), false, true);
            }
            _ => {}
        }
    });
}

/// Whether a directive is shorthand (`class:foo` / `bind:value`) — its value
/// span begins at the directive's `:name` rather than an explicit `={…}`.
fn directive_is_shorthand(node: &Value, checker: &Checker) -> bool {
    // Shorthand when the expression identifier coincides with the directive name
    // position (no `={`). Detect by checking there's no `=` before the expression
    // within the directive span.
    let (Some(ds), Some(expr)) = (nstart(node), node.get("expression")) else {
        return false;
    };
    let Some(es) = nstart(expr) else { return false };
    // Scan the directive head for an '=' before the expression.
    for off in ds..es {
        if checker.byte_at(off) == Some(b'=') {
            return false;
        }
    }
    true
}

fn handle_bind_directive(node: &Value, ancestors: &[&Value], checker: &mut Checker) {
    let key = node.get("name").and_then(Value::as_str);
    let el = nearest_element(ancestors);
    if key != Some("this") && element_accepts_store(el) {
        return;
    }
    let shorthand = directive_is_shorthand(node, checker);
    checker.verify(node.get("expression"), false, !shorthand);
}

fn handle_expression_tag(node: &Value, ancestors: &[&Value], checker: &mut Checker) {
    let expr = node.get("expression");
    let parent = ancestors.last().copied();
    let parent_is_attr = parent.map(node_type) == Some(Some("Attribute"));
    if !parent_is_attr {
        // Text interpolation or directive longform value (style:x={store}).
        checker.verify(expr, false, true);
        return;
    }
    let attr = parent.unwrap();
    let attr_name = attr.get("name").and_then(Value::as_str).unwrap_or("");
    let el = nearest_element(ancestors);
    let value_is_array = attr.get("value").map(Value::is_array) == Some(true);
    // shorthand `{store}`: the attribute span starts with `{`.
    let shorthand = nstart(attr).and_then(|s| checker.byte_at(s)) == Some(b'{');
    if shorthand {
        if element_accepts_store(el) {
            return;
        }
        checker.verify(expr, false, false);
        return;
    }
    // full `attr={store}` — accepts a store (so skip) ONLY for a single-value,
    // non-`--style-prop` attribute on a component. Template-attribute values
    // (multiple parts) and `--style-props` always verify, even on a component.
    if !value_is_array && !attr_name.starts_with("--") && element_accepts_store(el) {
        return;
    }
    checker.verify(expr, false, true);
}
