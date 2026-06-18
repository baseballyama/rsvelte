//! `svelte/no-navigation-without-base` — disallow SvelteKit navigation (links,
//! `goto`, `pushState`, `replaceState`) with a URL that isn't prefixed with the
//! configured `base` path. Port of the eslint-plugin-svelte rule (deprecated
//! upstream in favour of `no-navigation-without-resolve`).
//!
//! A template rule (`check_root`): the whole component is serialized once.
//! `goto` / `pushState` / `replaceState` are matched through their
//! `$app/navigation` import (named alias or `* as ns`), `base` through
//! `$app/paths`. A URL "starts with base" when its prefix variable — resolved
//! through `+` / template-literal / member / declaration-init chains — is a base
//! reference. Links also accept absolute (`scheme:`) and fragment (`#…`) URLs.
//! Each `goto`/`pushState`/`replaceState`/link can be turned off via options.

use std::collections::{HashMap, HashSet};

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-navigation-without-base",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow navigation without the base path",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "ignoreGoto": { "type": "boolean" },
            "ignoreLinks": { "type": "boolean" },
            "ignorePushState": { "type": "boolean" },
            "ignoreReplaceState": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

const GOTO_MSG: &str = "Found a goto() call with a url that isn't prefixed with the base path.";
const LINK_MSG: &str = "Found a link with a url that isn't prefixed with the base path.";
const PUSH_MSG: &str =
    "Found a pushState() call with a url that isn't prefixed with the base path.";
const REPLACE_MSG: &str =
    "Found a replaceState() call with a url that isn't prefixed with the base path.";

/// `/^[+a-z]*:/i` — an absolute URL (optional scheme chars then `:`).
fn url_is_absolute(s: &str) -> bool {
    let b = s.as_bytes();
    let mut i = 0;
    while i < b.len() && (b[i] == b'+' || b[i].is_ascii_alphabetic()) {
        i += 1;
    }
    b.get(i) == Some(&b':')
}

fn url_is_fragment(s: &str) -> bool {
    s.starts_with('#')
}

#[derive(Default)]
struct Imports {
    goto: HashSet<String>,
    push_state: HashSet<String>,
    replace_state: HashSet<String>,
    nav_ns: HashSet<String>,
    base: HashSet<String>,
    paths_ns: HashSet<String>,
}

fn collect_imports(json: &Value) -> Imports {
    let mut im = Imports::default();
    walk_js(json, |node, _| {
        if node_type(node) != Some("ImportDeclaration") {
            return;
        }
        let source = node
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(Value::as_str);
        let nav = source == Some("$app/navigation");
        let paths = source == Some("$app/paths");
        if !nav && !paths {
            return;
        }
        let Some(specs) = node.get("specifiers").and_then(Value::as_array) else {
            return;
        };
        for spec in specs {
            let local = spec
                .get("local")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str);
            let Some(local) = local else { continue };
            match node_type(spec) {
                Some("ImportNamespaceSpecifier") => {
                    if nav {
                        im.nav_ns.insert(local.to_string());
                    } else {
                        im.paths_ns.insert(local.to_string());
                    }
                }
                Some("ImportSpecifier") => {
                    let imported = spec
                        .get("imported")
                        .and_then(|i| i.get("name").or_else(|| i.get("value")))
                        .and_then(Value::as_str)
                        .unwrap_or(local);
                    if nav {
                        match imported {
                            "goto" => im.goto.insert(local.to_string()),
                            "pushState" => im.push_state.insert(local.to_string()),
                            "replaceState" => im.replace_state.insert(local.to_string()),
                            _ => false,
                        };
                    } else if imported == "base" {
                        im.base.insert(local.to_string());
                    }
                }
                _ => {}
            }
        }
    });
    im
}

/// Top-level `NAME = init` declarators (name → init node), for prefix resolution.
fn collect_var_inits(json: &Value) -> HashMap<String, Value> {
    let mut out = HashMap::new();
    walk_js(json, |node, _| {
        if node_type(node) != Some("VariableDeclarator") {
            return;
        }
        let name = node
            .get("id")
            .filter(|i| node_type(i) == Some("Identifier"))
            .and_then(|i| i.get("name"))
            .and_then(Value::as_str);
        let Some(name) = name else { return };
        if let Some(init) = node.get("init").filter(|i| !i.is_null()) {
            out.entry(name.to_string()).or_insert_with(|| init.clone());
        }
    });
    out
}

struct Ctx<'a> {
    im: &'a Imports,
    var_inits: &'a HashMap<String, Value>,
}

impl Ctx<'_> {
    /// Mirrors `expressionStartsWithBase` — the expression's prefix variable is a
    /// base reference.
    fn starts_with_base(&self, expr: &Value, depth: u32) -> bool {
        if depth > 64 {
            return false;
        }
        match node_type(expr) {
            Some("BinaryExpression") => expr
                .get("left")
                .filter(|l| node_type(l) != Some("PrivateIdentifier"))
                .is_some_and(|l| self.starts_with_base(l, depth + 1)),
            Some("Identifier") => {
                let name = expr.get("name").and_then(Value::as_str).unwrap_or("");
                if self.im.base.contains(name) {
                    return true;
                }
                if let Some(init) = self.var_inits.get(name) {
                    return self.starts_with_base(init, depth + 1);
                }
                false
            }
            Some("MemberExpression") => {
                let prop_is_base = expr
                    .get("property")
                    .filter(|p| node_type(p) == Some("Identifier"))
                    .and_then(|p| p.get("name"))
                    .and_then(Value::as_str)
                    == Some("base");
                let obj_is_paths_ns = expr
                    .get("object")
                    .filter(|o| node_type(o) == Some("Identifier"))
                    .and_then(|o| o.get("name"))
                    .and_then(Value::as_str)
                    .is_some_and(|n| self.im.paths_ns.contains(n));
                prop_is_base && obj_is_paths_ns
            }
            Some("TemplateLiteral") => match template_first_expr(expr) {
                Some(part) => self.starts_with_base(&part, depth + 1),
                None => false,
            },
            _ => false,
        }
    }
}

/// The first non-empty part of a template literal, if it is an interpolated
/// expression (else `None` — a leading non-empty quasi).
fn template_first_expr(tpl: &Value) -> Option<Value> {
    let quasis = tpl.get("quasis").and_then(Value::as_array)?;
    let exprs = tpl.get("expressions").and_then(Value::as_array)?;
    let mut parts: Vec<(u64, bool, Value)> = Vec::new();
    for q in quasis {
        let start = q.get("start").and_then(Value::as_u64).unwrap_or(0);
        let raw_empty = q
            .get("value")
            .and_then(|v| v.get("raw"))
            .and_then(Value::as_str)
            .map(|r| r.is_empty())
            .unwrap_or(false);
        parts.push((start, raw_empty, Value::Null));
    }
    for e in exprs {
        let start = e.get("start").and_then(Value::as_u64).unwrap_or(0);
        parts.push((start, false, e.clone()));
    }
    parts.sort_by_key(|p| p.0);
    for (_s, is_empty_quasi, node) in parts {
        if node.is_null() {
            if is_empty_quasi {
                continue; // skip leading empty quasi
            }
            return None; // non-empty quasi first
        }
        return Some(node);
    }
    None
}

fn url_value_is_absolute(node: &Value) -> bool {
    match node_type(node) {
        Some("Literal") => node
            .get("value")
            .and_then(Value::as_str)
            .is_some_and(url_is_absolute),
        Some("BinaryExpression") => {
            node.get("left")
                .filter(|l| node_type(l) != Some("PrivateIdentifier"))
                .is_some_and(url_value_is_absolute)
                || node.get("right").is_some_and(url_value_is_absolute)
        }
        Some("TemplateLiteral") => {
            let exprs = node.get("expressions").and_then(Value::as_array);
            let quasis = node.get("quasis").and_then(Value::as_array);
            exprs.is_some_and(|a| a.iter().any(url_value_is_absolute))
                || quasis.is_some_and(|a| {
                    a.iter().any(|q| {
                        q.get("value")
                            .and_then(|v| v.get("raw"))
                            .and_then(Value::as_str)
                            .is_some_and(url_is_absolute)
                    })
                })
        }
        _ => false,
    }
}

fn url_value_is_fragment(node: &Value) -> bool {
    match node_type(node) {
        Some("Literal") => node
            .get("value")
            .and_then(Value::as_str)
            .is_some_and(url_is_fragment),
        Some("BinaryExpression") => node
            .get("left")
            .filter(|l| node_type(l) != Some("PrivateIdentifier"))
            .is_some_and(url_value_is_fragment),
        Some("TemplateLiteral") => match template_first_expr_or_quasi(node) {
            FirstPart::Expr(e) => url_value_is_fragment(&e),
            FirstPart::Quasi(raw) => url_is_fragment(&raw),
            FirstPart::None => false,
        },
        _ => false,
    }
}

enum FirstPart {
    Expr(Value),
    Quasi(String),
    None,
}

/// First positional part of a template literal (expr or quasi), unfiltered —
/// matches upstream's `templateLiteralIsFragment` which looks at `expressions[0]`
/// / `quasis[0]`.
fn template_first_expr_or_quasi(tpl: &Value) -> FirstPart {
    let first_expr = tpl
        .get("expressions")
        .and_then(Value::as_array)
        .and_then(|a| a.first());
    let first_quasi = tpl
        .get("quasis")
        .and_then(Value::as_array)
        .and_then(|a| a.first());
    // Upstream: `(expressions.length>=1 && fragment(expressions[0])) || (quasis.length>=1 && fragment(quasis[0].raw))`.
    if let Some(e) = first_expr
        && url_value_is_fragment(e)
    {
        return FirstPart::Expr(e.clone());
    }
    if let Some(q) = first_quasi
        && let Some(raw) = q
            .get("value")
            .and_then(|v| v.get("raw"))
            .and_then(Value::as_str)
    {
        return FirstPart::Quasi(raw.to_string());
    }
    FirstPart::None
}

fn is_empty_url(node: &Value) -> bool {
    match node_type(node) {
        Some("Literal") => node.get("value").and_then(Value::as_str) == Some(""),
        Some("TemplateLiteral") => {
            let no_expr = node
                .get("expressions")
                .and_then(Value::as_array)
                .map(|a| a.is_empty())
                .unwrap_or(true);
            let one_empty_quasi = node
                .get("quasis")
                .and_then(Value::as_array)
                .map(|a| {
                    a.len() == 1
                        && a[0]
                            .get("value")
                            .and_then(|v| v.get("raw"))
                            .and_then(Value::as_str)
                            == Some("")
                })
                .unwrap_or(false);
            no_expr && one_empty_quasi
        }
        _ => false,
    }
}

fn span(node: &Value) -> Option<(u32, u32)> {
    Some((
        node.get("start").and_then(Value::as_u64)? as u32,
        node.get("end").and_then(Value::as_u64)? as u32,
    ))
}

#[derive(Default)]
pub struct NoNavigationWithoutBase;

impl Rule for NoNavigationWithoutBase {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let Some(json) = with_serialize_arena(&root.arena, || serde_json::to_value(root).ok())
        else {
            return;
        };
        let im = collect_imports(&json);
        let var_inits = collect_var_inits(&json);
        let cx = Ctx {
            im: &im,
            var_inits: &var_inits,
        };

        let opts = ctx.option0();
        let ignore = |key: &str| -> bool {
            opts.and_then(|o| o.get(key)).and_then(Value::as_bool) == Some(true)
        };
        let ignore_goto = ignore("ignoreGoto");
        let ignore_links = ignore("ignoreLinks");
        let ignore_push = ignore("ignorePushState");
        let ignore_replace = ignore("ignoreReplaceState");

        let mut reports: Vec<(u32, u32, &'static str)> = Vec::new();

        walk_js(&json, |node, _| match node_type(node) {
            Some("CallExpression") => {
                let kind = call_kind(node, &im);
                let Some(kind) = kind else { return };
                let args = node.get("arguments").and_then(Value::as_array);
                let Some(arg0) = args.and_then(|a| a.first()) else {
                    return;
                };
                let is_spread = node_type(arg0) == Some("SpreadElement");
                let bad_goto = is_spread || !cx.starts_with_base(arg0, 0);
                let bad_shallow =
                    is_spread || (!is_empty_url(arg0) && !cx.starts_with_base(arg0, 0));
                let hit = match kind {
                    NavKind::Goto if !ignore_goto => bad_goto.then_some(GOTO_MSG),
                    NavKind::Push if !ignore_push => bad_shallow.then_some(PUSH_MSG),
                    NavKind::Replace if !ignore_replace => bad_shallow.then_some(REPLACE_MSG),
                    _ => None,
                };
                if let Some(msg) = hit
                    && let Some((s, e)) = span(arg0)
                {
                    reports.push((s, e, msg));
                }
            }
            Some("RegularElement") if !ignore_links => {
                if node.get("name").and_then(Value::as_str) != Some("a") {
                    return;
                }
                if let Some(attrs) = node.get("attributes").and_then(Value::as_array) {
                    for attr in attrs {
                        if node_type(attr) == Some("Attribute")
                            && attr.get("name").and_then(Value::as_str) == Some("href")
                            && let Some(r) = self.check_href(&cx, attr)
                        {
                            reports.push((r.0, r.1, LINK_MSG));
                        }
                    }
                }
            }
            _ => {}
        });

        for (s, e, msg) in reports {
            ctx.report(s, e, msg);
        }
    }
}

enum NavKind {
    Goto,
    Push,
    Replace,
}

fn call_kind(node: &Value, im: &Imports) -> Option<NavKind> {
    let callee = node.get("callee")?;
    match node_type(callee) {
        Some("Identifier") => {
            let n = callee.get("name").and_then(Value::as_str)?;
            if im.goto.contains(n) {
                Some(NavKind::Goto)
            } else if im.push_state.contains(n) {
                Some(NavKind::Push)
            } else if im.replace_state.contains(n) {
                Some(NavKind::Replace)
            } else {
                None
            }
        }
        Some("MemberExpression") => {
            if callee.get("computed").and_then(Value::as_bool) == Some(true) {
                return None;
            }
            let obj = callee
                .get("object")
                .filter(|o| node_type(o) == Some("Identifier"))
                .and_then(|o| o.get("name"))
                .and_then(Value::as_str)?;
            if !im.nav_ns.contains(obj) {
                return None;
            }
            match callee
                .get("property")
                .and_then(|p| p.get("name"))
                .and_then(Value::as_str)?
            {
                "goto" => Some(NavKind::Goto),
                "pushState" => Some(NavKind::Push),
                "replaceState" => Some(NavKind::Replace),
                _ => None,
            }
        }
        _ => None,
    }
}

impl NoNavigationWithoutBase {
    fn check_href(&self, cx: &Ctx, attr: &Value) -> Option<(u32, u32)> {
        let value = attr.get("value")?;
        // Static string value: `href="..."` → value is `[Text]`.
        if let Some(arr) = value.as_array() {
            let first = arr.first()?;
            if node_type(first) == Some("Text") {
                let data = first
                    .get("data")
                    .or_else(|| first.get("raw"))
                    .and_then(Value::as_str)
                    .unwrap_or("");
                if !url_is_absolute(data) && !url_is_fragment(data) {
                    return span(first);
                }
                return None;
            }
            // First part is an expression tag.
            if node_type(first) == Some("ExpressionTag") {
                return self.check_href_expr(cx, first);
            }
            return None;
        }
        // Single expression value: `href={...}` → value is an ExpressionTag.
        if node_type(value) == Some("ExpressionTag") {
            // Skip shorthand `{href}` attributes: the attribute starts at `{`,
            // so `attr["start"] + 1 == value["start"]`. Upstream treats these
            // as `SvelteShorthandAttribute` (a distinct AST node type) which the
            // `SvelteAttribute` hook never sees — so they are never flagged.
            let attr_start = attr
                .get("start")
                .and_then(Value::as_u64)
                .unwrap_or(u64::MAX);
            let val_start = value.get("start").and_then(Value::as_u64).unwrap_or(0);
            if attr_start + 1 == val_start {
                return None;
            }
            return self.check_href_expr(cx, value);
        }
        None
    }

    fn check_href_expr(&self, cx: &Ctx, expr_tag: &Value) -> Option<(u32, u32)> {
        let expr = expr_tag.get("expression")?;
        if !cx.starts_with_base(expr, 0)
            && !url_value_is_absolute(expr)
            && !url_value_is_fragment(expr)
        {
            return span(expr_tag);
        }
        None
    }
}
