//! `svelte/no-navigation-without-resolve` — disallow SvelteKit navigation
//! (links, `goto`, `pushState`, `replaceState`) with a URL that isn't wrapped
//! in a `resolve()` or `asset()` call from `$app/paths`. Port of the
//! eslint-plugin-svelte rule.
//!
//! A template rule (`check_root`): the whole component is serialized once.
//! `goto` / `pushState` / `replaceState` are matched through their
//! `$app/navigation` import (named alias or `* as ns`), `resolve`/`asset`
//! through `$app/paths`. A URL is "allowed" when it is wrapped in a
//! `resolve()`/`asset()` call (directly or via a variable holding the call
//! result), or conditionally when the config permits absolute URLs, fragment
//! URLs, empty URLs, or nullish values. Links also accept absolute, fragment,
//! or nullish href values. `<a rel="external">` is exempt.
//! Each `goto`/`pushState`/`replaceState`/link can be turned off via options.

use std::collections::{HashMap, HashSet};
// `Path` + the `svelte_check` `Diagnostic` are only used by the native-only
// `diagnostics_typed` (the type-aware path); the syntactic `Rule` below is wasm-safe.
#[cfg(feature = "native")]
use std::path::Path;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;
#[cfg(feature = "native")]
use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-navigation-without-resolve",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: true,
    docs: "Disallow navigation without resolve()",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "ignoreGoto": { "type": "boolean" },
            "ignoreLinks": { "type": "boolean" },
            "ignorePushState": { "type": "boolean" },
            "ignoreReplaceState": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

const GOTO_MSG: &str = "Unexpected goto() call without resolve().";
const LINK_MSG: &str = "Unexpected href link without resolve().";
const PUSH_MSG: &str = "Unexpected pushState() call without resolve().";
const REPLACE_MSG: &str = "Unexpected replaceState() call without resolve().";

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
    /// Named imports of `resolve` or `asset` from `$app/paths` (incl. aliases).
    resolve_set: HashSet<String>,
    /// Namespace imports: `* as ns` from `$app/paths`.
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
                    } else if imported == "resolve" || imported == "asset" {
                        im.resolve_set.insert(local.to_string());
                    }
                }
                _ => {}
            }
        }
    });
    im
}

/// Top-level `NAME = init` declarators (name → init node), for value resolution.
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

/// Config controlling what URLs are allowed beyond the resolve/asset check.
#[derive(Clone, Copy, Default)]
struct AllowConfig {
    allow_absolute: bool,
    allow_empty: bool,
    allow_fragment: bool,
    allow_nullish: bool,
}

/// Whether a call expression node (JSON) is a `resolve()` or `asset()` call
/// from `$app/paths` (named or namespace import).
fn expression_is_resolve_call(
    expr: &Value,
    im: &Imports,
    var_inits: &HashMap<String, Value>,
    depth: u32,
) -> bool {
    if depth > 64 {
        return false;
    }
    match node_type(expr) {
        Some("CallExpression") => {
            let Some(callee) = expr.get("callee") else {
                return false;
            };
            match node_type(callee) {
                Some("Identifier") => {
                    let name = callee.get("name").and_then(Value::as_str).unwrap_or("");
                    im.resolve_set.contains(name)
                }
                Some("MemberExpression") => {
                    if callee.get("computed").and_then(Value::as_bool) == Some(true) {
                        return false;
                    }
                    let obj_name = callee
                        .get("object")
                        .filter(|o| node_type(o) == Some("Identifier"))
                        .and_then(|o| o.get("name"))
                        .and_then(Value::as_str);
                    let prop_name = callee
                        .get("property")
                        .filter(|p| node_type(p) == Some("Identifier"))
                        .and_then(|p| p.get("name"))
                        .and_then(Value::as_str);
                    obj_name.is_some_and(|n| im.paths_ns.contains(n))
                        && matches!(prop_name, Some("resolve") | Some("asset"))
                }
                _ => false,
            }
        }
        Some("Identifier") => {
            let name = expr.get("name").and_then(Value::as_str).unwrap_or("");
            if let Some(init) = var_inits.get(name) {
                expression_is_resolve_call(init, im, var_inits, depth + 1)
            } else {
                false
            }
        }
        _ => false,
    }
}

/// Whether an expression node is an empty URL: `""` or ` `` `.
fn expression_is_empty(expr: &Value) -> bool {
    match node_type(expr) {
        Some("Literal") => expr.get("value").and_then(Value::as_str) == Some(""),
        Some("TemplateLiteral") => {
            let no_exprs = expr
                .get("expressions")
                .and_then(Value::as_array)
                .map(|a| a.is_empty())
                .unwrap_or(true);
            let one_empty_quasi = expr
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
            no_exprs && one_empty_quasi
        }
        _ => false,
    }
}

/// Whether a node is a nullish value: `undefined` Identifier or `null` Literal.
fn expression_is_nullish(expr: &Value) -> bool {
    match node_type(expr) {
        Some("Identifier") => expr.get("name").and_then(Value::as_str) == Some("undefined"),
        Some("Literal") => expr.get("value").is_some_and(|v| v.is_null()),
        _ => false,
    }
}

/// Whether a node represents an absolute URL (any branch for BinaryExpression/TemplateLiteral).
fn expression_is_absolute(expr: &Value) -> bool {
    match node_type(expr) {
        Some("Literal") => expr
            .get("value")
            .and_then(Value::as_str)
            .is_some_and(url_is_absolute),
        Some("BinaryExpression") => {
            if expr.get("operator").and_then(Value::as_str) != Some("+") {
                return false;
            }
            expr.get("left")
                .filter(|l| node_type(l) != Some("PrivateIdentifier"))
                .is_some_and(expression_is_absolute)
                || expr.get("right").is_some_and(expression_is_absolute)
        }
        Some("TemplateLiteral") => {
            let exprs = expr.get("expressions").and_then(Value::as_array);
            let quasis = expr.get("quasis").and_then(Value::as_array);
            exprs.is_some_and(|a| a.iter().any(expression_is_absolute))
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

/// Whether a node's start represents a fragment URL (`#…`).
/// For BinaryExpression, only the LEFT side is checked (start-position).
/// For TemplateLiteral, checks first expression OR first quasi.
fn expression_starts_with_fragment(expr: &Value) -> bool {
    match node_type(expr) {
        Some("Literal") => expr
            .get("value")
            .and_then(Value::as_str)
            .is_some_and(url_is_fragment),
        Some("BinaryExpression") => {
            if expr.get("operator").and_then(Value::as_str) != Some("+") {
                return false;
            }
            expr.get("left")
                .filter(|l| node_type(l) != Some("PrivateIdentifier"))
                .is_some_and(expression_starts_with_fragment)
        }
        Some("TemplateLiteral") => {
            // Check first expression or first quasi (position order).
            // Upstream: `(expressions.length>=1 && fragment(expressions[0]))
            //            || (quasis.length>=1 && fragment(quasis[0].raw))`
            let first_expr = expr
                .get("expressions")
                .and_then(Value::as_array)
                .and_then(|a| a.first());
            let first_quasi_raw = expr
                .get("quasis")
                .and_then(Value::as_array)
                .and_then(|a| a.first())
                .and_then(|q| q.get("value"))
                .and_then(|v| v.get("raw"))
                .and_then(Value::as_str);
            first_expr.is_some_and(expression_starts_with_fragment)
                || first_quasi_raw.is_some_and(url_is_fragment)
        }
        _ => false,
    }
}

/// Core allow-check, mirroring upstream `isValueAllowed`.
/// Predicate answering whether an expression's resolved TYPE makes it an
/// allowed navigation target (a `$app/types` `ResolvedPathname`, or — when the
/// position permits nullish — a `null`/`undefined` type). The native rule passes
/// a `|_, _| false` stub (no type info); the type-aware path
/// ([`diagnostics_typed`]) backs it with a checker probe. This is upstream's
/// `expressionIsAllowedType`.
type AllowedTypeFn<'a> = dyn Fn(&Value, AllowConfig) -> bool + 'a;

fn is_value_allowed(
    expr: &Value,
    config: AllowConfig,
    im: &Imports,
    var_inits: &HashMap<String, Value>,
    allowed_type: &AllowedTypeFn,
    depth: u32,
) -> bool {
    if depth > 64 {
        return false;
    }

    // The expression's own resolved TYPE (checker-backed; stubbed in the native
    // path) is checked first, so an identifier/member typed as `ResolvedPathname`
    // (or nullish) is recognized before any syntactic var-init resolution
    // rewrites it to its initializer. Mirrors upstream calling
    // `expressionIsAllowedType` on the original node.
    if allowed_type(expr, config) {
        return true;
    }

    // Identifier: try resolving variable init, then fall through to other checks.
    if node_type(expr) == Some("Identifier") {
        let name = expr.get("name").and_then(Value::as_str).unwrap_or("");
        // `undefined` is handled below via expressionIsNullish, but resolve it
        // here via var_inits first if there's a shadowing declaration.
        if let Some(init) = var_inits.get(name) {
            return is_value_allowed(init, config, im, var_inits, allowed_type, depth + 1);
        }
        // No known init — fall through to the nullish / resolve / type checks.
    }

    // ConditionalExpression: BOTH branches must be allowed.
    if node_type(expr) == Some("ConditionalExpression") {
        let cons = expr.get("consequent");
        let alt = expr.get("alternate");
        return cons
            .is_some_and(|c| is_value_allowed(c, config, im, var_inits, allowed_type, depth + 1))
            && alt.is_some_and(|a| {
                is_value_allowed(a, config, im, var_inits, allowed_type, depth + 1)
            });
    }

    // Remaining checks (mirrors the big `if` in upstream):
    if config.allow_absolute && expression_is_absolute(expr) {
        return true;
    }
    if config.allow_empty && expression_is_empty(expr) {
        return true;
    }
    if config.allow_fragment && expression_starts_with_fragment(expr) {
        return true;
    }
    if config.allow_nullish && expression_is_nullish(expr) {
        return true;
    }
    if expression_is_resolve_call(expr, im, var_inits, 0) {
        return true;
    }

    false
}

fn span(node: &Value) -> Option<(u32, u32)> {
    Some((
        node.get("start").and_then(Value::as_u64)? as u32,
        node.get("end").and_then(Value::as_u64)? as u32,
    ))
}

/// Check whether an `<a>` start-tag (attributes array) has `rel="external"`.
/// Matches upstream `hasRelExternal`: looks for an `Attribute` named `rel`
/// whose value contains "external" (space-split), or a shorthand `{rel}`
/// where the variable's init is the literal string "external".
fn has_rel_external(attrs: &[Value], var_inits: &HashMap<String, Value>) -> bool {
    for attr in attrs {
        if node_type(attr) != Some("Attribute") {
            continue;
        }
        let attr_name = attr.get("name").and_then(Value::as_str);
        if attr_name != Some("rel") {
            continue;
        }
        let value = attr.get("value");
        // Shorthand `{rel}` → value is ExpressionTag with Identifier.
        if let Some(val) = value
            && node_type(val) == Some("ExpressionTag")
        {
            let expr = val.get("expression");
            if let Some(e) = expr {
                if node_type(e) == Some("Identifier") {
                    let name = e.get("name").and_then(Value::as_str).unwrap_or("");
                    // Check via var_inits: `const external = 'external'` or shorthand
                    // `{rel}` where `const rel = 'external'`.
                    if let Some(init) = var_inits.get(name)
                        && node_type(init) == Some("Literal")
                        && init.get("value").and_then(Value::as_str) == Some("external")
                    {
                        return true;
                    }
                }
                // `rel={'external'}` or `rel={"noopener external noreferrer"}` as a Literal
                if node_type(e) == Some("Literal") {
                    let s = e.get("value").and_then(Value::as_str).unwrap_or("");
                    if s.split_ascii_whitespace().any(|t| t == "external") {
                        return true;
                    }
                }
            }
        }
        // Static `rel="external"` → value is an array with a Text node.
        if let Some(arr) = value.and_then(Value::as_array)
            && let Some(first) = arr.first()
            && node_type(first) == Some("Text")
        {
            let s = first.get("data").and_then(Value::as_str).unwrap_or("");
            if s.split_ascii_whitespace().any(|t| t == "external") {
                return true;
            }
        }
    }
    false
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

/// Check an href attribute node. Returns true if the URL is not allowed.
fn check_href(
    attr: &Value,
    config: AllowConfig,
    im: &Imports,
    var_inits: &HashMap<String, Value>,
    allowed_type: &AllowedTypeFn,
) -> bool {
    let value = attr.get("value");
    let Some(value) = value else { return false };

    // Value is an array → `href="..."` (Text) or `href={...}` (ExpressionTag in array).
    if let Some(arr) = value.as_array() {
        let Some(first) = arr.first() else {
            return false;
        };
        if node_type(first) == Some("Text") {
            let data = first
                .get("data")
                .or_else(|| first.get("raw"))
                .and_then(Value::as_str)
                .unwrap_or("");
            // Static text: not allowed if not absolute and not fragment.
            let text_allowed = (config.allow_absolute && url_is_absolute(data))
                || (config.allow_fragment && url_is_fragment(data));
            return !text_allowed;
        }
        if node_type(first) == Some("ExpressionTag") {
            return check_href_expr_tag(first, config, im, var_inits, allowed_type);
        }
        return false;
    }

    // Value is a single ExpressionTag → `href={...}`.
    if node_type(value) == Some("ExpressionTag") {
        return check_href_expr_tag(value, config, im, var_inits, allowed_type);
    }

    false
}

fn check_href_expr_tag(
    expr_tag: &Value,
    config: AllowConfig,
    im: &Imports,
    var_inits: &HashMap<String, Value>,
    allowed_type: &AllowedTypeFn,
) -> bool {
    let Some(expr) = expr_tag.get("expression") else {
        return false;
    };
    !is_value_allowed(expr, config, im, var_inits, allowed_type, 0)
}

/// Collect navigation findings from the serialized component JSON. Shared by the
/// native rule ([`NoNavigationWithoutResolve::check_root`], `allowed_type` =
/// stub) and the type-aware path ([`diagnostics_typed`], `allowed_type` =
/// checker-backed).
fn collect_nav_reports(
    json: &Value,
    ignore_goto: bool,
    ignore_links: bool,
    ignore_push: bool,
    ignore_replace: bool,
    allowed_type: &AllowedTypeFn,
) -> Vec<(u32, u32, &'static str)> {
    let im = collect_imports(json);
    let var_inits = collect_var_inits(json);
    let mut reports: Vec<(u32, u32, &'static str)> = Vec::new();

    walk_js(json, |node, _| match node_type(node) {
        Some("CallExpression") => {
            let kind = call_kind(node, &im);
            let Some(kind) = kind else { return };
            let args = node.get("arguments").and_then(Value::as_array);
            let Some(arg0) = args.and_then(|a| a.first()) else {
                return;
            };
            let is_spread = node_type(arg0) == Some("SpreadElement");
            // goto: no allowEmpty; pushState/replaceState: allowEmpty.
            let (not_allowed_goto, not_allowed_shallow) = if is_spread {
                (true, true)
            } else {
                let basic = !is_value_allowed(
                    arg0,
                    AllowConfig::default(),
                    &im,
                    &var_inits,
                    allowed_type,
                    0,
                );
                let shallow = !is_value_allowed(
                    arg0,
                    AllowConfig {
                        allow_empty: true,
                        ..AllowConfig::default()
                    },
                    &im,
                    &var_inits,
                    allowed_type,
                    0,
                );
                (basic, shallow)
            };
            let hit = match kind {
                NavKind::Goto if !ignore_goto => not_allowed_goto.then_some(GOTO_MSG),
                NavKind::Push if !ignore_push => not_allowed_shallow.then_some(PUSH_MSG),
                NavKind::Replace if !ignore_replace => not_allowed_shallow.then_some(REPLACE_MSG),
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
            let attrs = node
                .get("attributes")
                .and_then(Value::as_array)
                .map(|a| a.as_slice())
                .unwrap_or(&[]);
            if has_rel_external(attrs, &var_inits) {
                return;
            }
            let link_config = AllowConfig {
                allow_absolute: true,
                allow_fragment: true,
                allow_nullish: true,
                allow_empty: false,
            };
            for attr in attrs {
                if node_type(attr) == Some("Attribute")
                    && attr.get("name").and_then(Value::as_str) == Some("href")
                    && check_href(attr, link_config, &im, &var_inits, allowed_type)
                    && let Some((s, e)) = span(attr)
                {
                    reports.push((s, e, LINK_MSG));
                }
            }
        }
        _ => {}
    });

    reports
}

/// Type-aware variant of the navigation rule: identical detection, but the
/// `expressionIsAllowedType` predicate is backed by checker probes via
/// `backend`, so a `goto`/`pushState`/`replaceState` argument or `<a href>`
/// value typed as `$app/types` `ResolvedPathname` (or nullish, for links) is
/// recognized as allowed. Unblocks the `*-resolved-pathname` / nullish fixtures.
#[cfg(feature = "native")]
pub fn diagnostics_typed(
    source: &str,
    file: &Path,
    config: &crate::config::LintConfig,
    backend: &mut dyn crate::type_backend::TypeBackend,
) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }
    let Ok(root) = rsvelte_core::parse(source, rsvelte_core::ParseOptions::default()) else {
        return Vec::new();
    };
    let li = crate::line_index::LineIndex::new(source);

    let opts = config.options_for(META.name);
    // The options are a variadic array; the conventional single options object
    // is `options[0]`.
    let opt0 = opts.and_then(|v| match v {
        Value::Array(a) => a.first(),
        other => Some(other),
    });
    let ignore = |key: &str| -> bool {
        opt0.and_then(|o| o.get(key)).and_then(Value::as_bool) == Some(true)
    };
    let ignore_goto = ignore("ignoreGoto");
    let ignore_links = ignore("ignoreLinks");
    let ignore_push = ignore("ignorePushState");
    let ignore_replace = ignore("ignoreReplaceState");

    let backend = std::cell::RefCell::new(backend);
    let reports = with_serialize_arena(&root.arena, || {
        let Some(json) = serde_json::to_value(&root).ok() else {
            return Vec::new();
        };
        // Probe only identifier / member expressions (where a branded/nullish
        // type can live), and only the syntactic checks already failed.
        let allowed_type = |expr: &Value, cfg: AllowConfig| -> bool {
            if !matches!(
                node_type(expr),
                Some("Identifier") | Some("MemberExpression")
            ) {
                return false;
            }
            let Some((s, _)) = span(expr) else {
                return false;
            };
            let Some(facts) = backend.borrow_mut().probe_expr(s) else {
                return false;
            };
            if facts.type_text_contains("ResolvedPathname") {
                return true;
            }
            cfg.allow_nullish && facts.is_nullish()
        };
        collect_nav_reports(
            &json,
            ignore_goto,
            ignore_links,
            ignore_push,
            ignore_replace,
            &allowed_type,
        )
    });

    reports
        .into_iter()
        .map(|(s, e, msg)| Diagnostic {
            file: file.to_path_buf(),
            severity: crate::validator::to_dsev(severity),
            range: crate::validator::range_from_byte(&li, s, e),
            message: msg.to_string(),
            code: Some(META.name.to_string()),
            source: "svelte",
        })
        .collect()
}

#[derive(Default)]
pub struct NoNavigationWithoutResolve;

impl Rule for NoNavigationWithoutResolve {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let Some(json) = with_serialize_arena(&root.arena, || serde_json::to_value(root).ok())
        else {
            return;
        };

        let opts = ctx.option0();
        let ignore = |key: &str| -> bool {
            opts.and_then(|o| o.get(key)).and_then(Value::as_bool) == Some(true)
        };

        // No type backend in the native walk: `expressionIsAllowedType` is a
        // stub. The type-aware path is `diagnostics_typed`.
        let no_types = |_: &Value, _: AllowConfig| false;
        let reports = collect_nav_reports(
            &json,
            ignore("ignoreGoto"),
            ignore("ignoreLinks"),
            ignore("ignorePushState"),
            ignore("ignoreReplaceState"),
            &no_types,
        );

        for (s, e, msg) in reports {
            ctx.report(s, e, msg);
        }
    }
}
