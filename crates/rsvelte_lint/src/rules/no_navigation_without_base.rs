//! `svelte/no-navigation-without-base`.
//!
//! `svelte/no-navigation-without-base` — disallow `SvelteKit` navigation (links,
//! `goto`, `pushState`, `replaceState`) with a URL that isn't prefixed with the
//! configured `base` path. Port of the eslint-plugin-svelte rule (deprecated
//! upstream in favour of `no-navigation-without-resolve`).
//!
//! A template rule (`check_root`): the whole component is serialized once, so
//! one scope index covers both scripts and the template. `check_program` adds
//! standalone `.svelte.js` / `.svelte.ts` modules, which have no root.
//! `goto` / `pushState` / `replaceState` are matched through their
//! `$app/navigation` import (named alias or `* as ns`), `base` through
//! `$app/paths`. A URL "starts with base" when its prefix variable — resolved
//! through `+` / template-literal / member / declaration-init chains — is a base
//! reference. Links also accept absolute (`scheme:`) and fragment (`#…`) URLs.
//! Each `goto`/`pushState`/`replaceState`/link can be turned off via options.

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::engine::{SourceKind, classify_source};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::kit_nav::{NavKind, ScopeIndex, nav_call_kind, starts_with_base};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_type, walk_js};

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
                .is_none_or(std::vec::Vec::is_empty);
            let one_empty_quasi = node
                .get("quasis")
                .and_then(Value::as_array)
                .is_some_and(|a| {
                    a.len() == 1
                        && a[0]
                            .get("value")
                            .and_then(|v| v.get("raw"))
                            .and_then(Value::as_str)
                            == Some("")
                });
            no_expr && one_empty_quasi
        }
        _ => false,
    }
}

fn span(node: &Value) -> Option<(u32, u32)> {
    Some((
        u32::try_from(node.get("start").and_then(Value::as_u64)?).ok()?,
        u32::try_from(node.get("end").and_then(Value::as_u64)?).ok()?,
    ))
}

#[derive(Default)]
pub struct NoNavigationWithoutBase;

impl Rule for NoNavigationWithoutBase {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let json = ctx.root_json(root);
        if json.is_null() {
            return;
        }
        Self::run(ctx, &json);
    }
}

impl ScriptRule for NoNavigationWithoutBase {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        // A component is covered by `check_root`, which sees both scripts and
        // the template at once; only a standalone module needs this pass.
        if !matches!(classify_source(ctx.filename()), SourceKind::Module { .. }) {
            return;
        }
        Self::run(ctx, program.value());
    }
}

impl NoNavigationWithoutBase {
    fn run(ctx: &mut LintContext, json: &Value) {
        let idx = ScopeIndex::build(json);

        let opts = ctx.option0();
        let ignore = |key: &str| -> bool {
            opts.and_then(|o| o.get(key)).and_then(Value::as_bool) == Some(true)
        };
        let ignore_goto = ignore("ignoreGoto");
        let ignore_links = ignore("ignoreLinks");
        let ignore_push = ignore("ignorePushState");
        let ignore_replace = ignore("ignoreReplaceState");

        let mut reports: Vec<(u32, u32, &'static str)> = Vec::new();

        walk_js(json, |node, _| match node_type(node) {
            Some("CallExpression") => {
                let Some(kind) = nav_call_kind(&idx, node) else {
                    return;
                };
                let arguments = node.get("arguments").and_then(Value::as_array);
                let Some(first_argument) = arguments.and_then(|arguments| arguments.first()) else {
                    return;
                };
                let is_spread = node_type(first_argument) == Some("SpreadElement");
                let bad_goto = is_spread || !starts_with_base(&idx, first_argument, true);
                let bad_shallow = is_spread
                    || (!is_empty_url(first_argument)
                        && !starts_with_base(&idx, first_argument, true));
                let hit = match kind {
                    NavKind::Goto if !ignore_goto => bad_goto.then_some(GOTO_MSG),
                    NavKind::Push if !ignore_push => bad_shallow.then_some(PUSH_MSG),
                    NavKind::Replace if !ignore_replace => bad_shallow.then_some(REPLACE_MSG),
                    _ => None,
                };
                if let Some(msg) = hit
                    && let Some((s, e)) = span(first_argument)
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
                            && let Some(r) = Self::check_href(&idx, attr)
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

    fn check_href(idx: &ScopeIndex<'_>, attr: &Value) -> Option<(u32, u32)> {
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
                return Self::check_href_expr(idx, first);
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
            return Self::check_href_expr(idx, value);
        }
        None
    }

    fn check_href_expr(idx: &ScopeIndex<'_>, expr_tag: &Value) -> Option<(u32, u32)> {
        let expr = expr_tag.get("expression")?;
        if !starts_with_base(idx, expr, true)
            && !url_value_is_absolute(expr)
            && !url_value_is_fragment(expr)
        {
            return span(expr_tag);
        }
        None
    }
}
