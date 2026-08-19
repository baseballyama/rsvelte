//! `svelte/require-store-reactive-access`.
//!
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

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{RefTracker, Var, component_tracker, store_creator_calls};
use crate::script::{node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-store-reactive-access",
    category: RuleCategory::Correctness,
    fixable: Fixable::Code,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow using a store as an operand without the `$` prefix",
    options_schema: None,
};

const MESSAGE: &str = "Use the $ prefix or the get function to access reactive values instead of accessing the raw store.";

fn json_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

fn source_width(value: usize) -> u32 {
    u32::try_from(value).expect("identifier widths are represented as u32")
}

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
    node.get("start")
        .and_then(Value::as_u64)
        .and_then(json_offset)
}
fn nend(node: &Value) -> Option<u32> {
    node.get("end")
        .and_then(Value::as_u64)
        .and_then(json_offset)
}

/// Collect store variables — upstream's `createStoreCheckerForES`: every
/// variable whose declarator is initialised by a `svelte/store` creator call
/// (aliases / namespace members / template resolved by the shared tracker),
/// with its `const`-ness.
fn collect_store_vars(tracker: &RefTracker<'_>) -> HashMap<Var, bool> {
    let mut out = HashMap::new();
    for (call, _name) in store_creator_calls(tracker, &["writable", "readable", "derived"]) {
        let Some(declarator) = tracker.parent_of(call) else {
            continue;
        };
        if node_type(declarator) != Some("VariableDeclarator") {
            continue;
        }
        let Some(id) = declarator.get("id") else {
            continue;
        };
        if node_type(id) != Some("Identifier") {
            continue;
        }
        let Some(decl) = tracker.parent_of(declarator) else {
            continue;
        };
        if node_type(decl) != Some("VariableDeclaration") {
            continue;
        }
        let is_const = decl.get("kind").and_then(Value::as_str) == Some("const");
        if let Some(var) = tracker.find_variable(id) {
            out.insert(var, is_const);
        }
    }
    out
}

struct Checker<'a, 't> {
    stores: &'a HashMap<Var, bool>,
    tracker: &'a RefTracker<'t>,
    source: &'a [u8],
    reports: Vec<Report>,
}

impl Checker<'_, '_> {
    /// `true` if `node` is a store identifier usable in this position, resolved
    /// as a reference starting at `start`.
    fn is_store_at(&self, node: &Value, consistent: bool, start: u32) -> bool {
        if !is_ident(node) {
            return false;
        }
        let Some(name) = node.get("name").and_then(Value::as_str) else {
            return false;
        };
        if name.starts_with('$') {
            return false;
        }
        let Some(var) = self.tracker.find_variable_at(node, start) else {
            return false;
        };
        match self.stores.get(&var) {
            None => false,
            Some(&is_const) => !consistent || is_const,
        }
    }

    fn verify(&mut self, node: Option<&Value>, consistent: bool, fixable: bool) {
        self.verify_offset(node, consistent, fixable, 0);
    }

    /// Like `verify` but for a node whose serialized start may sit before the
    /// identifier text. A computed property key starts at its `[`, which is
    /// neither the position upstream reports nor one the scope tables can
    /// resolve, so the identifier's own start is recovered first.
    fn verify_offset(
        &mut self,
        node: Option<&Value>,
        consistent: bool,
        fixable: bool,
        start_offset: u32,
    ) {
        let Some(node) = node.filter(|n| !n.is_null()) else {
            return;
        };
        let Some(raw_start) = nstart(node) else {
            return;
        };
        let s = self.identifier_start(raw_start + start_offset);
        if !self.is_store_at(node, consistent, s) {
            return;
        }
        if let Some(e) = nend(node) {
            self.reports.push(Report {
                start: s,
                end: e,
                fix_at: if fixable { Some(s) } else { None },
            });
        }
    }

    /// Skip a leading `[` and any whitespace after it.
    fn identifier_start(&self, start: u32) -> u32 {
        if self.byte_at(start) != Some(b'[') {
            return start;
        }
        let mut at = start + 1;
        while matches!(self.byte_at(at), Some(b) if b.is_ascii_whitespace()) {
            at += 1;
        }
        at
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
        let is_store = match self
            .tracker
            .root_var_by_name(name)
            .and_then(|v| self.stores.get(&v))
        {
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
            .and_then(json_offset)
        else {
            return;
        };
        let start = end.saturating_sub(source_width(name.len()));
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
    matches!(el, Some("Component" | "SvelteComponent"))
}

#[derive(Default)]
pub struct RequireStoreReactiveAccess;

impl Rule for RequireStoreReactiveAccess {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let tracker = component_tracker(ctx.source(), root, &root_json);
        let stores = collect_store_vars(&tracker);
        if stores.is_empty() {
            return;
        }
        let source = ctx.source().as_bytes();
        let mut checker = Checker {
            stores: &stores,
            tracker: &tracker,
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
    matches!(op, Some("==" | "!=" | "===" | "!=="))
}

fn walk_dispatch(root: &Value, checker: &mut Checker<'_, '_>) {
    walk_js(root, |node, ancestors| {
        match node_type(node) {
            // ---- JS expression positions ----
            Some("UpdateExpression" | "SpreadElement") => {
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
            Some(
                "ConditionalExpression"
                | "IfStatement"
                | "WhileStatement"
                | "DoWhileStatement"
                | "ForStatement",
            ) => {
                checker.verify(node.get("test"), true, true);
            }
            Some("ForInStatement" | "ForOfStatement") => {
                checker.verify(node.get("right"), false, true);
            }
            Some("SwitchStatement") => {
                checker.verify(node.get("discriminant"), false, true);
            }
            Some("CallExpression" | "NewExpression")
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
            Some("TaggedTemplateExpression" | "SpreadAttribute" | "OnDirective") => {
                let field = if node_type(node) == Some("TaggedTemplateExpression") {
                    "tag"
                } else {
                    "expression"
                };
                checker.verify(node.get(field), false, true);
            }
            Some("Property" | "PropertyDefinition" | "MethodDefinition") => {
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
            Some("HtmlTag") => {
                checker.verify(node.get("expression"), false, true);
            }
            node_type if dispatch_template_node(node_type, node, ancestors, checker) => {}
            _ => {}
        }
    });
}

fn dispatch_template_node(
    node_kind: Option<&str>,
    node: &Value,
    ancestors: &[&Value],
    checker: &mut Checker<'_, '_>,
) -> bool {
    match node_kind {
        Some("ExpressionTag") => handle_expression_tag(node, ancestors, checker),
        Some("ClassDirective") => {
            let shorthand = directive_is_shorthand(node, checker);
            checker.verify(node.get("expression"), true, !shorthand);
        }
        Some("BindDirective") => handle_bind_directive(node, ancestors, checker),
        Some("UseDirective" | "TransitionDirective" | "AnimateDirective") => {
            checker.verify_directive_name(node, false, true);
        }
        Some("StyleDirective") if node.get("value").and_then(Value::as_bool) == Some(true) => {
            checker.verify_directive_name(node, false, false);
        }
        Some("SvelteComponent" | "SvelteElement") => {
            let field = if node_kind == Some("SvelteComponent") {
                "expression"
            } else {
                "tag"
            };
            checker.verify(node.get(field), false, true);
        }
        Some("IfBlock" | "AwaitBlock") => checker.verify(
            node.get("test").or_else(|| node.get("expression")),
            true,
            true,
        ),
        Some("EachBlock") => checker.verify(node.get("expression"), false, true),
        _ => return false,
    }
    true
}

/// Whether a directive is shorthand (`class:foo` / `bind:value`) — its value
/// span begins at the directive's `:name` rather than an explicit `={…}`.
fn directive_is_shorthand(node: &Value, checker: &Checker<'_, '_>) -> bool {
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

fn handle_bind_directive(node: &Value, ancestors: &[&Value], checker: &mut Checker<'_, '_>) {
    let key = node.get("name").and_then(Value::as_str);
    let el = nearest_element(ancestors);
    if key != Some("this") && element_accepts_store(el) {
        return;
    }
    let shorthand = directive_is_shorthand(node, checker);
    checker.verify(node.get("expression"), false, !shorthand);
}

fn handle_expression_tag(node: &Value, ancestors: &[&Value], checker: &mut Checker<'_, '_>) {
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
    let value_is_array = attr.get("value").is_some_and(Value::is_array);
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
