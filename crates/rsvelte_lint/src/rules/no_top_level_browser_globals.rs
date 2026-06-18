//! `svelte/no-top-level-browser-globals` — disallow using browser global
//! variables (`window`, `document`, `location`, `localStorage`, …) at the
//! top level of a `<script>` / `*.svelte.[js|ts]` module, where the code also
//! runs during SSR. Port of the eslint-plugin-svelte rule.
//!
//! ## Scope of this port
//!
//! This rule has two check paths:
//! - `ScriptRule::check_program` — checks `<script>` blocks via the ESTree program.
//! - `Rule::check_root` — checks template `{expr}` tags, respecting `{#if browser}`
//!   / `{#if !browser}` guards.
//!
//! ## Algorithm (faithful to upstream)
//!
//! Upstream resolves real scopes via `ReferenceTracker`; we approximate by
//! walking the ESTree JSON:
//!
//! 1. Collect *guards* — expressions that prove the browser environment is
//!    available for a sub-region of the program:
//!    - `esm-env` `BROWSER` / `$app/environment` `browser` reads (direct or via
//!      a namespace import), and `import.meta.env.SSR` (inverted).
//!    - browser-global references that themselves appear in a guard position
//!      (`typeof window !== 'undefined'`, `if (globalThis.window)`,
//!      `globalThis.location?.href`, `globalThis.window instanceof X`,
//!      `globalThis.window !== undefined`, `… && …`, …).
//! 2. Every *other* top-level browser-global reference that is not covered by a
//!    guard region (and is not inside a TS type annotation) is reported at the
//!    reference's start offset with the global's name.
//!
//! The browser-globals set below is fixture-derived (the upstream rule uses the
//! `globals` npm package's `browser` minus `node` keys, which we cannot import);
//! it covers every global named in the invalid fixtures (`window`, `document`,
//! `location`, `localStorage`) plus the obvious browser DOM/Web globals.

use serde_json::Value;

use rsvelte_core::ast::template::{Fragment, Root, TemplateNode};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-top-level-browser-globals",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow using top-level browser global variables",
    options_schema: None,
};

/// Fixture-derived browser-global set. Upstream derives this from
/// `globals.browser` minus `globals.node`; the names below cover every global
/// referenced in the invalid fixtures (`window`, `document`, `location`,
/// `localStorage`) plus the obvious browser-only globals so the rule behaves
/// sensibly outside the fixtures too.
const BROWSER_GLOBALS: &[&str] = &[
    "window",
    "document",
    "location",
    "navigator",
    "history",
    "localStorage",
    "sessionStorage",
    "screen",
    "frames",
    "parent",
    "top",
    "self",
    "alert",
    "confirm",
    "prompt",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "matchMedia",
    "getComputedStyle",
    "scrollTo",
    "scrollBy",
    "open",
    "indexedDB",
];

fn is_browser_global(name: &str) -> bool {
    BROWSER_GLOBALS.contains(&name)
}

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// A region of the source in which a guard makes the browser environment (or a
/// specific global) available.
#[derive(Clone)]
enum Region {
    /// `[start, end)` byte span.
    Range(u32, u32),
    /// Only the exact node at `start` is available (optional-chain self guard).
    Just(u32),
    /// Union of two regions (logical `&&` left guard + parent guard).
    Or(Box<Region>, Box<Region>),
}

impl Region {
    fn covers(&self, start: u32, end: u32) -> bool {
        match self {
            Region::Range(s, e) => *s <= start && end <= *e,
            Region::Just(s) => *s == start,
            Region::Or(a, b) => a.covers(start, end) || b.covers(start, end),
        }
    }
}

struct Guard {
    region: Region,
    /// `true` if the guard establishes the whole browser environment (protects
    /// any global). `false` if it only protects the matching `name`.
    browser_environment: bool,
    /// The global name this guard protects when `browser_environment` is false.
    name: Option<String>,
}

/// Static value of an operand, restricted to the forms the guard logic needs.
#[derive(Debug, PartialEq)]
enum StaticVal {
    Str(String),
    Undefined,
    Null,
}

fn static_value(node: &Value) -> Option<StaticVal> {
    match node_type(node)? {
        "Identifier" => {
            if node.get("name").and_then(Value::as_str) == Some("undefined") {
                Some(StaticVal::Undefined)
            } else {
                None
            }
        }
        "Literal" => {
            let raw = node.get("raw").and_then(Value::as_str);
            if raw == Some("null") {
                return Some(StaticVal::Null);
            }
            match node.get("value") {
                Some(Value::String(s)) => Some(StaticVal::Str(s.clone())),
                // A JSON-null `value` with no `regex` is the `null` literal
                // (covers serializers that omit/normalise `raw`).
                Some(Value::Null) if node.get("regex").is_none() => Some(StaticVal::Null),
                _ => None,
            }
        }
        _ => None,
    }
}

fn is_member(node: &Value) -> bool {
    node_type(node) == Some("MemberExpression")
}

/// Non-computed property name of a `MemberExpression`, if any.
fn member_prop_name(node: &Value) -> Option<&str> {
    if node.get("computed").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    node.get("property").and_then(ident_name)
}

/// Whether `node` is `globalThis.<global>` (non-computed). Returns the global.
fn global_this_member(node: &Value) -> Option<&str> {
    if !is_member(node) {
        return None;
    }
    let obj = node.get("object")?;
    if ident_name(obj) != Some("globalThis") {
        return None;
    }
    let prop = member_prop_name(node)?;
    if is_browser_global(prop) {
        Some(prop)
    } else {
        None
    }
}

/// Whether the ancestor chain places the node inside a function/arrow body.
fn in_function(ancestors: &[&Value]) -> bool {
    ancestors.iter().any(|n| {
        matches!(
            node_type(n),
            Some("FunctionDeclaration")
                | Some("FunctionExpression")
                | Some("ArrowFunctionExpression")
        )
    })
}

/// Whether the ancestor chain places the node inside a TS type annotation.
fn in_type_annotation(ancestors: &[&Value]) -> bool {
    ancestors
        .iter()
        .any(|n| node_type(n).is_some_and(|t| t.starts_with("TS")))
}

/// Whether all execution paths of a statement end in a jump
/// (`return`/`continue`/`break`). Mirrors upstream's `hasJumpStatementInAllPath`.
fn has_jump_in_all_paths(stmt: &Value) -> bool {
    match node_type(stmt) {
        Some("ReturnStatement") | Some("ContinueStatement") | Some("BreakStatement") => true,
        Some("BlockStatement") => stmt
            .get("body")
            .and_then(Value::as_array)
            .is_some_and(|b| b.iter().any(has_jump_in_all_paths)),
        Some("IfStatement") => {
            let Some(alt) = stmt.get("alternate") else {
                return false;
            };
            if alt.is_null() {
                return false;
            }
            has_jump_in_all_paths(alt) && stmt.get("consequent").is_some_and(has_jump_in_all_paths)
        }
        _ => false,
    }
}

fn range(node: &Value) -> Option<(u32, u32)> {
    Some((
        node.get("start").and_then(Value::as_u64)? as u32,
        node.get("end").and_then(Value::as_u64)? as u32,
    ))
}

fn region_of(node: &Value) -> Option<Region> {
    let (s, e) = range(node)?;
    Some(Region::Range(s, e))
}

/// Pointer-identity comparison of two ESTree node references (they come from
/// the same arena, so identity is reliable).
fn same(a: &Value, b: &Value) -> bool {
    std::ptr::eq(a, b)
}

/// Whether `node` is the (non-computed) `.property` of its parent member access
/// (e.g. the `browser` in `env.browser`, or the `window` in `x.window`).
fn is_member_property(node: &Value, ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return false;
    };
    node_type(parent) == Some("MemberExpression")
        && parent.get("property").is_some_and(|p| same(p, node))
        && parent.get("computed").and_then(Value::as_bool) != Some(true)
}

/// Port of upstream `getGuardChecker`. `path` is the ancestor chain with the
/// "guard node" as the LAST element; recursion drops the last element to move
/// up to the parent. `not` inverts the guard sense.
fn get_guard_checker(path: &[&Value], not: bool) -> Option<Region> {
    if path.len() < 2 {
        return None;
    }
    let node = path[path.len() - 1];
    let parent = path[path.len() - 2];
    match node_type(parent) {
        Some("ConditionalExpression") => {
            let branch = if not { "alternate" } else { "consequent" };
            region_of(parent.get(branch)?)
        }
        Some("UnaryExpression") if parent.get("operator").and_then(Value::as_str) == Some("!") => {
            get_guard_checker(&path[..path.len() - 1], !not)
        }
        Some("IfStatement") if parent.get("test").is_some_and(|t| same(t, node)) => {
            if !not {
                return region_of(parent.get("consequent")?);
            }
            // not: prefer the `else` branch.
            if let Some(alt) = parent.get("alternate")
                && !alt.is_null()
            {
                return region_of(alt);
            }
            // No else: if the consequent always jumps, the region after the if
            // (to the end of the enclosing block) is guarded.
            let consequent = parent.get("consequent")?;
            if !has_jump_in_all_paths(consequent) {
                return None;
            }
            // parent's parent must be a Block/Program (it is path[len-3]).
            if path.len() < 3 {
                return None;
            }
            let pp = path[path.len() - 3];
            if !matches!(node_type(pp), Some("BlockStatement") | Some("Program")) {
                return None;
            }
            let start = range(parent)?.1;
            let end = range(pp)?.1;
            Some(Region::Range(start, end))
        }
        Some("LogicalExpression") => {
            let op = parent.get("operator").and_then(Value::as_str);
            if !not && op == Some("&&") {
                let parent_checker = get_guard_checker(&path[..path.len() - 1], not);
                let left = parent.get("left");
                if left.is_some_and(|l| same(l, node)) {
                    let right_region = region_of(parent.get("right")?)?;
                    let combined = match parent_checker {
                        Some(pc) => Region::Or(Box::new(right_region), Box::new(pc)),
                        None => right_region,
                    };
                    return Some(combined);
                }
                return parent_checker;
            }
            if not && op == Some("||") {
                return get_guard_checker(&path[..path.len() - 1], not);
            }
            None
        }
        _ => None,
    }
}

/// Port of upstream `getGuardCheckerFromReference`. Given a browser-global
/// reference (`path` last element is the reference node), decide whether the
/// reference is in a guard position and, if so, return the guarded region.
fn guard_checker_from_reference(path: &[&Value]) -> Option<Region> {
    let node = path[path.len() - 1];
    if path.len() < 2 {
        return None;
    }
    let parent = path[path.len() - 2];

    match node_type(parent) {
        Some("BinaryExpression") => {
            let op = parent.get("operator").and_then(Value::as_str)?;
            let left = parent.get("left");
            let right = parent.get("right");
            let node_is_left = left.is_some_and(|l| same(l, node));
            let node_is_right = right.is_some_and(|r| same(r, node));

            if op == "instanceof" && node_is_left && is_member(node) {
                // e.g. if (globalThis.window instanceof X)
                return get_guard_checker(&path[..path.len() - 1], false);
            }

            let operand = if node_is_left {
                right
            } else if node_is_right {
                left
            } else {
                None
            }?;
            let sv = static_value(operand)?;

            if sv == StaticVal::Undefined && is_member(node) {
                return match op {
                    "!==" | "!=" => get_guard_checker(&path[..path.len() - 1], false),
                    "===" | "==" => get_guard_checker(&path[..path.len() - 1], true),
                    _ => None,
                };
            }
            if sv == StaticVal::Null && is_member(node) {
                return match op {
                    "!=" => get_guard_checker(&path[..path.len() - 1], false),
                    "==" => get_guard_checker(&path[..path.len() - 1], true),
                    _ => None,
                };
            }
            None
        }
        Some("UnaryExpression")
            if parent.get("operator").and_then(Value::as_str) == Some("typeof")
                && parent.get("argument").is_some_and(|a| same(a, node)) =>
        {
            if path.len() < 3 {
                return None;
            }
            let pp = path[path.len() - 3];
            if node_type(pp) != Some("BinaryExpression") {
                return None;
            }
            let op = pp.get("operator").and_then(Value::as_str)?;
            let left = pp.get("left");
            let other = if left.is_some_and(|l| same(l, parent)) {
                pp.get("right")
            } else {
                left
            }?;
            let sv = static_value(other)?;
            let sv_str = match &sv {
                StaticVal::Str(s) => s.as_str(),
                _ => return None,
            };
            if sv_str != "undefined" && sv_str != "object" {
                return None;
            }
            // pp is at path[len-3]; the guard node for getGuardChecker is pp.
            let pp_path = &path[..path.len() - 2];
            match op {
                "!==" | "!=" => {
                    if sv_str == "undefined" {
                        get_guard_checker(pp_path, false)
                    } else {
                        get_guard_checker(pp_path, true)
                    }
                }
                "===" | "==" => {
                    if sv_str == "undefined" {
                        get_guard_checker(pp_path, true)
                    } else {
                        get_guard_checker(pp_path, false)
                    }
                }
                _ => None,
            }
        }
        _ => {
            // node is `globalThis.<global>` member.
            if !is_member(node) {
                return None;
            }
            let parent_is_optional_use = (node_type(parent) == Some("CallExpression")
                && parent.get("callee").is_some_and(|c| same(c, node)))
                || (node_type(parent) == Some("MemberExpression")
                    && parent.get("object").is_some_and(|o| same(o, node)));
            if parent_is_optional_use
                && parent.get("optional").and_then(Value::as_bool) == Some(true)
            {
                // e.g. globalThis.location?.href — only the node itself.
                return Some(Region::Just(range(node)?.0));
            }
            // e.g. if (globalThis.window) — the node itself is the guard.
            get_guard_checker(path, false)
        }
    }
}

/// Is `node` the full `import.meta.env.SSR` member chain?
///
/// rsvelte's parser does not emit a `MetaProperty` node for `import.meta`; it
/// represents it as a placeholder `Identifier` spanning the text `import.meta`.
/// So the innermost object is matched by its source slice rather than by type.
fn is_import_meta_env_ssr(node: &Value, source: &str) -> bool {
    if !is_member(node) || member_prop_name(node) != Some("SSR") {
        return false;
    }
    let Some(env_member) = node.get("object") else {
        return false;
    };
    if !is_member(env_member) || member_prop_name(env_member) != Some("env") {
        return false;
    }
    let Some(meta) = env_member.get("object") else {
        return false;
    };
    range(meta)
        .and_then(|(s, e)| source.get(s as usize..e as usize))
        .map(|slice| slice == "import.meta")
        .unwrap_or(false)
}

/// Scan an ESTree `program` for `import { browser } from "$app/environment"` /
/// `import * as env from "esm-env"` declarations and collect the local names.
///
/// - `browser_locals`: local names bound to `browser`/`BROWSER` (e.g. `browser`,
///   or `BROWSER` when the import uses the `esm-env` name).
/// - `env_namespaces`: local names for namespace imports (e.g. `env` when
///   `import * as env from "$app/environment"`).
fn collect_browser_checker_imports(
    program: &Value,
    browser_locals: &mut Vec<String>,
    env_namespaces: &mut Vec<String>,
) {
    walk_js(program, |node, _| {
        if node_type(node) != Some("ImportDeclaration") {
            return;
        }
        let source_val = node
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(Value::as_str);
        let is_env_module = matches!(source_val, Some("$app/environment") | Some("esm-env"));
        if !is_env_module {
            return;
        }
        let Some(specs) = node.get("specifiers").and_then(Value::as_array) else {
            return;
        };
        for spec in specs {
            match node_type(spec) {
                Some("ImportSpecifier") => {
                    let imported = spec.get("imported").and_then(ident_name).or_else(|| {
                        spec.get("imported")
                            .and_then(|i| i.get("value"))
                            .and_then(Value::as_str)
                    });
                    if matches!(imported, Some("browser") | Some("BROWSER"))
                        && let Some(local) = spec.get("local").and_then(ident_name)
                    {
                        browser_locals.push(local.to_string());
                    }
                }
                Some("ImportNamespaceSpecifier") => {
                    if let Some(local) = spec.get("local").and_then(ident_name) {
                        env_namespaces.push(local.to_string());
                    }
                }
                _ => {}
            }
        }
    });
}

#[derive(Default)]
pub struct NoTopLevelBrowserGlobals;

impl ScriptRule for NoTopLevelBrowserGlobals {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let source = ctx.source();
        // --- 1. Resolve browser-checker module imports. ---
        // local names bound to `browser`/`BROWSER` reads, and namespace imports.
        let mut browser_locals: Vec<String> = Vec::new();
        let mut env_namespaces: Vec<String> = Vec::new();
        collect_browser_checker_imports(program, &mut browser_locals, &mut env_namespaces);

        let mut guards: Vec<Guard> = Vec::new();

        // --- 2. import.meta.env.SSR guards (inverted: SSR true == server). ---
        walk_js(program, |node, ancestors| {
            if !is_import_meta_env_ssr(node, source) || in_function(ancestors) {
                return;
            }
            let mut path: Vec<&Value> = ancestors.to_vec();
            path.push(node);
            if let Some(region) = get_guard_checker(&path, true) {
                guards.push(Guard {
                    region,
                    browser_environment: true,
                    name: None,
                });
            }
        });

        // --- 3. esm-env / $app/environment browser-read guards. ---
        if !browser_locals.is_empty() || !env_namespaces.is_empty() {
            walk_js(program, |node, ancestors| {
                if in_function(ancestors) {
                    return;
                }
                let is_browser_ref = match node_type(node) {
                    Some("Identifier") => {
                        let name = node.get("name").and_then(Value::as_str);
                        // A bare read of an imported `browser`/`BROWSER` local,
                        // not itself a member property or import binding.
                        name.is_some_and(|n| browser_locals.iter().any(|l| l == n))
                            && is_value_reference(node, ancestors)
                            && !is_member_property(node, ancestors)
                    }
                    Some("MemberExpression") => {
                        // `env.browser` / `env.BROWSER` namespace access.
                        let obj_is_ns = node
                            .get("object")
                            .and_then(ident_name)
                            .is_some_and(|o| env_namespaces.iter().any(|n| n == o));
                        let prop = member_prop_name(node);
                        obj_is_ns && matches!(prop, Some("browser") | Some("BROWSER"))
                    }
                    _ => false,
                };
                if !is_browser_ref {
                    return;
                }
                let mut path: Vec<&Value> = ancestors.to_vec();
                path.push(node);
                if let Some(region) = get_guard_checker(&path, false) {
                    guards.push(Guard {
                        region,
                        browser_environment: true,
                        name: None,
                    });
                }
            });
        }

        // --- 4. Collect browser-global references. ---
        // Each is either a bare global identifier or `globalThis.<global>`.
        // We record its node, name, and full ancestor path for guard analysis.
        let mut report_candidates: Vec<(u32, u32, String)> = Vec::new();

        walk_js(program, |node, ancestors| {
            let name: String = match node_type(node) {
                Some("Identifier") => {
                    let Some(n) = node.get("name").and_then(Value::as_str) else {
                        return;
                    };
                    if !is_browser_global(n) || !is_value_reference(node, ancestors) {
                        return;
                    }
                    // Skip the property side of `globalThis.<global>` (handled by
                    // the MemberExpression branch) and `x.<global>` accesses.
                    if is_member_property(node, ancestors) {
                        return;
                    }
                    n.to_string()
                }
                Some("MemberExpression") => {
                    let Some(n) = global_this_member(node) else {
                        return;
                    };
                    n.to_string()
                }
                _ => return,
            };
            if in_function(ancestors) || in_type_annotation(ancestors) {
                return;
            }
            let Some((start, end)) = range(node) else {
                return;
            };

            let mut path: Vec<&Value> = ancestors.to_vec();
            path.push(node);

            if let Some(region) = guard_checker_from_reference(&path) {
                // This reference is itself a guard.
                let browser_environment = name == "window" || name == "document";
                guards.push(Guard {
                    region,
                    browser_environment,
                    name: Some(name),
                });
            } else {
                report_candidates.push((start, end, name));
            }
        });

        // --- 5. Report candidates not covered by any guard. ---
        for (start, end, name) in report_candidates {
            if is_available(&guards, start, end, &name) {
                continue;
            }
            ctx.report(
                start,
                end,
                format!("Unexpected top-level browser global variable \"{name}\"."),
            );
        }
    }
}

/// Whether a reference at `[start, end)` named `name` is covered by a guard.
/// Mirrors upstream `isAvailableLocation` (reverse iteration order).
fn is_available(guards: &[Guard], start: u32, end: u32, name: &str) -> bool {
    for guard in guards.iter().rev() {
        if guard.region.covers(start, end)
            && (guard.browser_environment || guard.name.as_deref() == Some(name))
        {
            return true;
        }
    }
    false
}

/// Whether an Identifier node is a *value reference* (vs. a declaration id,
/// property key, label, import/export binding, etc.). Used to avoid treating
/// declarations or member-property names as global references.
fn is_value_reference(node: &Value, ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return true;
    };
    match node_type(parent) {
        // Declaration ids and binding positions.
        Some("VariableDeclarator") => !parent.get("id").is_some_and(|i| same(i, node)),
        Some("FunctionDeclaration")
        | Some("FunctionExpression")
        | Some("ClassDeclaration")
        | Some("ClassExpression") => !parent.get("id").is_some_and(|i| same(i, node)),
        // Import/export bindings.
        Some("ImportSpecifier")
        | Some("ImportDefaultSpecifier")
        | Some("ImportNamespaceSpecifier")
        | Some("ExportSpecifier") => false,
        // Object/class property keys (non-computed).
        Some("Property") | Some("PropertyDefinition") | Some("MethodDefinition") => {
            !(parent.get("key").is_some_and(|k| same(k, node))
                && parent.get("computed").and_then(Value::as_bool) != Some(true))
        }
        // Labels.
        Some("LabeledStatement") | Some("BreakStatement") | Some("ContinueStatement") => false,
        // Member property handled separately by the caller.
        _ => true,
    }
}

// ---------------------------------------------------------------------------
// Template rule implementation
// ---------------------------------------------------------------------------

/// Whether `expr_json` (an ESTree Identifier node) is a bare read of one of
/// the browser-local names (not a declaration, member property, etc.).
fn is_bare_browser_ref(
    node: &Value,
    ancestors: &[&Value],
    browser_locals: &[String],
    env_namespaces: &[String],
) -> bool {
    match node_type(node) {
        Some("Identifier") => {
            let name = match node.get("name").and_then(Value::as_str) {
                Some(n) => n,
                None => return false,
            };
            browser_locals.iter().any(|l| l == name)
                && is_value_reference(node, ancestors)
                && !is_member_property(node, ancestors)
        }
        Some("MemberExpression") => {
            // `env.browser` / `env.BROWSER` namespace access.
            let obj_is_ns = node
                .get("object")
                .and_then(ident_name)
                .is_some_and(|o| env_namespaces.iter().any(|n| n == o));
            let prop = member_prop_name(node);
            obj_is_ns && matches!(prop, Some("browser") | Some("BROWSER"))
        }
        _ => false,
    }
}

/// Returns `true` when `expr` is a "positive browser signal" — a sub-expression
/// that, if truthy, implies the browser environment is available:
/// - a bare browser ref (`browser`, `env.browser`)
/// - `expr1 && expr2` where at least one operand is a positive browser signal
fn expr_implies_browser(
    expr: &Value,
    browser_locals: &[String],
    env_namespaces: &[String],
) -> bool {
    let empty: &[&Value] = &[];
    if is_bare_browser_ref(expr, empty, browser_locals, env_namespaces) {
        return true;
    }
    if node_type(expr) == Some("LogicalExpression")
        && expr.get("operator").and_then(Value::as_str) == Some("&&")
    {
        let left_ok = expr
            .get("left")
            .is_some_and(|l| expr_implies_browser(l, browser_locals, env_namespaces));
        let right_ok = expr
            .get("right")
            .is_some_and(|r| expr_implies_browser(r, browser_locals, env_namespaces));
        return left_ok || right_ok;
    }
    false
}

/// Returns `true` when `expr` is a "negative browser signal" — a sub-expression
/// that, if truthy, implies we are NOT in the browser environment:
/// - `!browserRef`
/// - `expr1 || expr2` where at least one operand is a negative browser signal
fn expr_implies_no_browser(
    expr: &Value,
    browser_locals: &[String],
    env_namespaces: &[String],
) -> bool {
    let empty: &[&Value] = &[];
    if node_type(expr) == Some("UnaryExpression")
        && expr.get("operator").and_then(Value::as_str) == Some("!")
        && let Some(arg) = expr.get("argument")
        && is_bare_browser_ref(arg, empty, browser_locals, env_namespaces)
    {
        return true;
    }
    if node_type(expr) == Some("LogicalExpression")
        && expr.get("operator").and_then(Value::as_str) == Some("||")
    {
        let left_ok = expr
            .get("left")
            .is_some_and(|l| expr_implies_no_browser(l, browser_locals, env_namespaces));
        let right_ok = expr
            .get("right")
            .is_some_and(|r| expr_implies_no_browser(r, browser_locals, env_namespaces));
        return left_ok || right_ok;
    }
    false
}

/// Determine whether the `{#if <test>}` block's test expression constitutes a
/// browser guard and return `(consequent_is_client_guaranteed,
/// alternate_is_client_guaranteed)`.
///
/// - Bare browser ref (or `&&` chain containing one) → consequent is client-guaranteed.
/// - `!browserRef` (or `||` chain containing one) → alternate is client-guaranteed.
/// - Neither → both inherit the parent's `client_guaranteed`.
fn classify_if_test(
    test_json: &Value,
    parent_guaranteed: bool,
    browser_locals: &[String],
    env_namespaces: &[String],
) -> (bool, bool) {
    let consequent_guaranteed =
        parent_guaranteed || expr_implies_browser(test_json, browser_locals, env_namespaces);
    let alternate_guaranteed =
        parent_guaranteed || expr_implies_no_browser(test_json, browser_locals, env_namespaces);
    (consequent_guaranteed, alternate_guaranteed)
}

/// Scan a JS expression JSON for browser globals and report any that are found.
fn check_expr_for_browser_globals(expr_json: &Value, ctx: &mut LintContext) {
    walk_js(expr_json, |node, ancestors| {
        let name = match node_type(node) {
            Some("Identifier") => {
                let n = match node.get("name").and_then(Value::as_str) {
                    Some(n) => n,
                    None => return,
                };
                if !is_browser_global(n) {
                    return;
                }
                if !is_value_reference(node, ancestors) {
                    return;
                }
                if is_member_property(node, ancestors) {
                    return;
                }
                n
            }
            _ => return,
        };
        if in_function(ancestors) || in_type_annotation(ancestors) {
            return;
        }
        let Some((start, end)) = range(node) else {
            return;
        };
        ctx.report(
            start,
            end,
            format!("Unexpected top-level browser global variable \"{name}\"."),
        );
    });
}

/// Walk a template `Fragment`, tracking `client_guaranteed` state through
/// `{#if browser}` / `{#if !browser}` blocks.
fn walk_fragment_for_browser_globals(
    fragment: &Fragment,
    client_guaranteed: bool,
    browser_locals: &[String],
    env_namespaces: &[String],
    ctx: &mut LintContext,
) {
    for node in &fragment.nodes {
        walk_template_node_for_browser_globals(
            node,
            client_guaranteed,
            browser_locals,
            env_namespaces,
            ctx,
        );
    }
}

fn walk_template_node_for_browser_globals(
    node: &TemplateNode,
    client_guaranteed: bool,
    browser_locals: &[String],
    env_namespaces: &[String],
    ctx: &mut LintContext,
) {
    match node {
        TemplateNode::IfBlock(b) => {
            let test_json = b.test.as_json();
            let (consequent_guaranteed, alternate_guaranteed) =
                classify_if_test(test_json, client_guaranteed, browser_locals, env_namespaces);
            walk_fragment_for_browser_globals(
                &b.consequent,
                consequent_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
            if let Some(alt) = &b.alternate {
                walk_fragment_for_browser_globals(
                    alt,
                    alternate_guaranteed,
                    browser_locals,
                    env_namespaces,
                    ctx,
                );
            }
        }
        TemplateNode::ExpressionTag(tag) if !client_guaranteed => {
            let expr_json = tag.expression.as_json();
            check_expr_for_browser_globals(expr_json, ctx);
        }
        TemplateNode::RegularElement(el) => {
            walk_fragment_for_browser_globals(
                &el.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        TemplateNode::Component(c) => {
            walk_fragment_for_browser_globals(
                &c.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        TemplateNode::EachBlock(b) => {
            walk_fragment_for_browser_globals(
                &b.body,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
            if let Some(fb) = &b.fallback {
                walk_fragment_for_browser_globals(
                    fb,
                    client_guaranteed,
                    browser_locals,
                    env_namespaces,
                    ctx,
                );
            }
        }
        TemplateNode::AwaitBlock(b) => {
            for frag in [b.pending.as_ref(), b.then.as_ref(), b.catch.as_ref()]
                .into_iter()
                .flatten()
            {
                walk_fragment_for_browser_globals(
                    frag,
                    client_guaranteed,
                    browser_locals,
                    env_namespaces,
                    ctx,
                );
            }
        }
        TemplateNode::KeyBlock(b) => {
            walk_fragment_for_browser_globals(
                &b.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        TemplateNode::SnippetBlock(_) => {
            // Snippets can be called from any context (client or server), so
            // browser globals inside them cannot be reliably flagged. Skip them
            // entirely — mirrors the `valid/in-template02` fixture behaviour.
        }
        TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            walk_fragment_for_browser_globals(
                &el.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        TemplateNode::SvelteComponent(c) => {
            walk_fragment_for_browser_globals(
                &c.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        TemplateNode::SvelteElement(e) => {
            walk_fragment_for_browser_globals(
                &e.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        TemplateNode::TitleElement(t) => {
            walk_fragment_for_browser_globals(
                &t.fragment,
                client_guaranteed,
                browser_locals,
                env_namespaces,
                ctx,
            );
        }
        _ => {}
    }
}

impl Rule for NoTopLevelBrowserGlobals {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // Collect browser-checker imports from both instance and module scripts.
        // This hook runs inside `with_serialize_arena`, so `as_json()` resolves.
        let mut browser_locals: Vec<String> = Vec::new();
        let mut env_namespaces: Vec<String> = Vec::new();

        for script in [root.instance.as_deref(), root.module.as_deref()]
            .into_iter()
            .flatten()
        {
            let prog = script.content.as_json();
            collect_browser_checker_imports(prog, &mut browser_locals, &mut env_namespaces);
        }

        // Walk the template fragment, checking expression tags.
        walk_fragment_for_browser_globals(
            &root.fragment,
            false, // top-level is not client-guaranteed
            &browser_locals,
            &env_namespaces,
            ctx,
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn globals_set_covers_fixtures() {
        for g in ["window", "document", "location", "localStorage"] {
            assert!(is_browser_global(g), "missing {g}");
        }
        assert!(!is_browser_global("foo"));
    }

    #[test]
    fn region_covers_range() {
        let r = Region::Range(10, 20);
        assert!(r.covers(12, 15));
        assert!(r.covers(10, 20));
        assert!(!r.covers(9, 15));
        assert!(!r.covers(12, 21));
    }

    #[test]
    fn region_just_matches_start_only() {
        let r = Region::Just(5);
        assert!(r.covers(5, 9));
        assert!(!r.covers(6, 9));
    }

    #[test]
    fn region_or_unions() {
        let r = Region::Or(
            Box::new(Region::Range(0, 5)),
            Box::new(Region::Range(10, 15)),
        );
        assert!(r.covers(1, 4));
        assert!(r.covers(11, 14));
        assert!(!r.covers(6, 8));
    }

    #[test]
    fn static_value_forms() {
        assert_eq!(
            static_value(&json!({"type":"Identifier","name":"undefined"})),
            Some(StaticVal::Undefined)
        );
        assert_eq!(
            static_value(&json!({"type":"Literal","value":null,"raw":"null"})),
            Some(StaticVal::Null)
        );
        assert_eq!(
            static_value(&json!({"type":"Literal","value":"undefined","raw":"'undefined'"})),
            Some(StaticVal::Str("undefined".to_string()))
        );
        assert!(static_value(&json!({"type":"Identifier","name":"x"})).is_none());
    }

    #[test]
    fn global_this_member_detection() {
        let m = json!({
            "type":"MemberExpression","computed":false,
            "object":{"type":"Identifier","name":"globalThis"},
            "property":{"type":"Identifier","name":"window"}
        });
        assert_eq!(global_this_member(&m), Some("window"));
        let not_global = json!({
            "type":"MemberExpression","computed":false,
            "object":{"type":"Identifier","name":"foo"},
            "property":{"type":"Identifier","name":"window"}
        });
        assert_eq!(global_this_member(&not_global), None);
    }

    #[test]
    fn jump_in_all_paths() {
        // { continue; } -> true
        let block = json!({
            "type":"BlockStatement",
            "body":[{"type":"ContinueStatement"}]
        });
        assert!(has_jump_in_all_paths(&block));
        // if/else both jump -> true
        let if_both = json!({
            "type":"IfStatement",
            "consequent":{"type":"ContinueStatement"},
            "alternate":{"type":"BreakStatement"}
        });
        assert!(has_jump_in_all_paths(&if_both));
        // if without else -> false
        let if_no_else = json!({
            "type":"IfStatement",
            "consequent":{"type":"ContinueStatement"},
            "alternate":null
        });
        assert!(!has_jump_in_all_paths(&if_no_else));
        // plain block, no jump -> false
        let plain = json!({
            "type":"BlockStatement",
            "body":[{"type":"ExpressionStatement"}]
        });
        assert!(!has_jump_in_all_paths(&plain));
    }

    #[test]
    fn import_meta_env_ssr_detection() {
        // rsvelte emits `import.meta` as a placeholder Identifier; matched by slice.
        let source = "import.meta.env.SSR";
        let node = json!({
            "type":"MemberExpression","computed":false,"start":0,"end":19,
            "property":{"type":"Identifier","name":"SSR","start":16,"end":19},
            "object":{
                "type":"MemberExpression","computed":false,"start":0,"end":15,
                "property":{"type":"Identifier","name":"env","start":12,"end":15},
                "object":{"type":"Identifier","name":"unknown","start":0,"end":11}
            }
        });
        assert!(is_import_meta_env_ssr(&node, source));
        let other = json!({
            "type":"MemberExpression","computed":false,"start":0,"end":5,
            "property":{"type":"Identifier","name":"foo","start":2,"end":5},
            "object":{"type":"Identifier","name":"x","start":0,"end":1}
        });
        assert!(!is_import_meta_env_ssr(&other, "x.foo"));
    }
}
