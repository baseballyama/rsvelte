//! `svelte/prefer-destructured-store-props`.
//!
//! `svelte/prefer-destructured-store-props` — prefer destructuring a store's
//! property (`$: ({ bar } = $foo)`) over reading `$foo.bar` directly in markup,
//! for finer-grained change tracking. Port of the eslint-plugin-svelte rule.
//!
//! A template rule (`check_root`): it serializes the component fragment and
//! flags every `$store.prop` member access in the markup whose object is a
//! single-`$`-prefixed identifier (a store auto-subscription) — skipping `$$`
//! builtins, the Svelte 5 runes (`$state`/`$derived`/…), and any access whose
//! expression identifiers are block-scoped (e.g. an `{#each}` context).
//!
//! **Suggestions** (never auto-applied):
//! - `fixUseVariable` — for each existing reactive variable that already
//!   destructures `$store.prop`, offer to replace the access with that variable.
//! - `fixUseDestructuring` — insert `$: ({ prop } = $store);` before `</script>`
//!   and replace the access with the new binding.
//!
//! Suggestions are suppressed:
//! - for **computed** accesses (`$foo[bar]`, `$foo['qux']`);
//! - for `fixUseDestructuring` when there is **no main `<script>` block** (no
//!   instance script, or only a `<script context="module">`).

use std::collections::HashSet;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::{
    AttributeValue, AttributeValuePart, Root, Script, ScriptContext,
};
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{handled_by_template_pass, scope_binding_names};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-destructured-store-props",
    category: RuleCategory::Style,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Destructure values from object stores for better change tracking",
    options_schema: None,
};

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

fn json_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

const SVELTE_RUNES: &[&str] = &[
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// JavaScript global identifiers that are NOT reserved words but exist in the
/// global scope (mirrors `ESLint`'s `scopeManager.globalScope.set.has(name)`
/// for the names that commonly appear as store property names). Only
/// identifiers that are NOT already reserved/restricted words are needed here,
/// since those are handled by `is_reserved_or_restricted`.
///
/// This list needs to cover at minimum `undefined`, `NaN`, `Infinity` (the
/// ES "immutable globals") and common browser/Node built-ins to match
/// upstream's `hasTopLevelVariable` behaviour.
const JS_GLOBALS: &[&str] = &[
    "undefined",
    "NaN",
    "Infinity",
    "globalThis",
    "console",
    "Math",
    "Array",
    "ArrayBuffer",
    "Atomics",
    "BigInt",
    "BigInt64Array",
    "BigUint64Array",
    "Boolean",
    "DataView",
    "Date",
    "Error",
    "EvalError",
    "Float32Array",
    "Float64Array",
    "Function",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Intl",
    "JSON",
    "Map",
    "Number",
    "Object",
    "Promise",
    "Proxy",
    "RangeError",
    "ReferenceError",
    "Reflect",
    "RegExp",
    "Set",
    "SharedArrayBuffer",
    "String",
    "Symbol",
    "SyntaxError",
    "TypeError",
    "Uint8Array",
    "Uint8ClampedArray",
    "Uint16Array",
    "Uint32Array",
    "URIError",
    "WeakMap",
    "WeakRef",
    "WeakSet",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
];

/// `/^\$[^\$]/` — starts with a single `$` (not `$$`).
fn is_store_object(name: &str) -> bool {
    let b = name.as_bytes();
    b.len() >= 2 && b[0] == b'$' && b[1] != b'$'
}

/// Whether `name` is a reserved word in ES6 strict mode or a restricted word
/// (`eval` / `arguments`). Mirrors `keyword.isReservedWordES6(name, true) ||
/// keyword.isRestrictedWord(name)` from the upstream esutils dependency.
fn is_reserved_or_restricted(name: &str) -> bool {
    matches!(
        name,
        "arguments"
            | "await"
            | "break"
            | "case"
            | "catch"
            | "class"
            | "const"
            | "continue"
            | "debugger"
            | "default"
            | "delete"
            | "do"
            | "else"
            | "enum"
            | "eval"
            | "export"
            | "extends"
            | "false"
            | "finally"
            | "for"
            | "function"
            | "if"
            | "implements"
            | "import"
            | "in"
            | "instanceof"
            | "interface"
            | "let"
            | "new"
            | "null"
            | "package"
            | "private"
            | "protected"
            | "public"
            | "return"
            | "static"
            | "super"
            | "switch"
            | "this"
            | "throw"
            | "true"
            | "try"
            | "typeof"
            | "var"
            | "void"
            | "while"
            | "with"
            | "yield"
    )
}

/// Compute the variable name to use for a new `fixUseDestructuring` binding,
/// respecting reserved words and top-level variable collisions. Mirrors the
/// upstream fixer's `varName` loop.
///
/// - Strip a leading `$` from `prop_name` (e.g. `$foo` → `foo`).
/// - If the result is a reserved/restricted word, start with suffix 1.
/// - Increment the suffix until the name is not already used at the top level.
fn compute_var_name(prop_name: &str, top_level: &HashSet<String>) -> String {
    // Strip a leading `$` (e.g. `$foo` → `foo`).
    let base = prop_name.strip_prefix('$').unwrap_or(prop_name).to_string();

    let mut suffix = u32::from(is_reserved_or_restricted(&base));

    loop {
        let candidate = if suffix == 0 {
            base.clone()
        } else {
            format!("{base}{suffix}")
        };
        if !top_level.contains(&candidate) {
            return candidate;
        }
        suffix += 1;
    }
}

/// Upstream's `mainScript`: the last `<script>` element in document order that
/// carries no literal `context="module"` attribute. It tests that attribute
/// alone, so the Svelte 5 `<script module>` shorthand reads as the main script.
fn main_script<'a>(root: &'a Root<'a>) -> Option<&'a Script<'a>> {
    let mut scripts: Vec<&Script<'a>> = [root.instance.as_ref(), root.module.as_ref()]
        .into_iter()
        .flatten()
        .map(std::convert::AsRef::as_ref)
        .filter(|s| !has_context_module_attribute(s))
        .collect();
    scripts.sort_by_key(|s| s.start);
    scripts.pop()
}

/// `findAttribute(node, 'context')` with a single `SvelteLiteral` value `module`.
fn has_context_module_attribute(script: &Script<'_>) -> bool {
    script.attributes.iter().any(|attr| {
        attr.name == "context"
            && match &attr.value {
                AttributeValue::Sequence(parts) => matches!(
                    parts.as_slice(),
                    [AttributeValuePart::Text(text)] if text.data == "module"
                ),
                _ => false,
            }
    })
}

/// Names bound by the scopes enclosing a node. Upstream resolves
/// member-expression identifiers with `findVariable`; anything whose scope is
/// not module/global suppresses the report, and svelte-eslint-parser does build
/// scopes for the template blocks. The scope model is shared with the store
/// reference tracker so the two cannot disagree.
fn enclosing_scope_names(ancestors: &[&Value], member_start: u64) -> HashSet<String> {
    let mut out = HashSet::new();
    for a in ancestors {
        // A `let:` directive binds over the element's children, not over its
        // own attributes.
        if a.get("fragment").is_some() && attribute_span_contains(a, member_start) {
            continue;
        }
        if let Some(names) = scope_binding_names(a) {
            out.extend(names);
        }
    }
    out
}

/// Whether `pos` falls inside one of the element's attribute spans.
fn attribute_span_contains(element: &Value, pos: u64) -> bool {
    element
        .get("attributes")
        .and_then(Value::as_array)
        .is_some_and(|attrs| {
            attrs.iter().any(|attr| {
                let (Some(s), Some(e)) = (
                    attr.get("start").and_then(Value::as_u64),
                    attr.get("end").and_then(Value::as_u64),
                ) else {
                    return false;
                };
                pos >= s && pos < e
            })
        })
}

/// Whether any expression identifier inside the member expression resolves to
/// an enclosing non-top-level scope (upstream: `findVariable` resolves it and
/// its scope is not module/global). A `$name` identifier falls back to `name`,
/// mirroring upstream's store-access `findVariable`.
fn member_uses_fn_scoped(member: &Value, shadowed: &HashSet<String>) -> bool {
    if shadowed.is_empty() {
        return false;
    }
    let mut found = false;
    walk_member_expr_idents(member, None, &mut |name| {
        if shadowed.contains(name)
            || name
                .strip_prefix('$')
                .is_some_and(|stripped| shadowed.contains(stripped))
        {
            found = true;
        }
    });
    found
}

fn walk_member_expr_idents<'v>(
    node: &'v Value,
    parent_field: Option<(&str, &'v Value)>,
    f: &mut impl FnMut(&str),
) {
    match node {
        Value::Array(arr) => {
            for v in arr {
                walk_member_expr_idents(v, parent_field, f);
            }
        }
        Value::Object(map) => {
            let ty = map.get("type").and_then(Value::as_str);
            if ty == Some("Identifier") {
                // `isExpressionIdentifier`: a COMPUTED member property / object
                // key is not one (upstream ast-utils.ts:640-649), so `$foo[x]`
                // never consults `x`'s scope while `$foo[`p${x}`]` does.
                let is_expression_ident = parent_field.is_none_or(|(field, parent)| {
                    let computed = parent.get("computed").and_then(Value::as_bool) == Some(true);
                    match (node_type(parent), field) {
                        (Some("MemberExpression"), "property")
                        | (Some("Property" | "MethodDefinition" | "PropertyDefinition"), "key") => {
                            !computed
                        }
                        _ => true,
                    }
                });
                if is_expression_ident && let Some(name) = map.get("name").and_then(Value::as_str) {
                    f(name);
                }
                return;
            }
            for (k, v) in map {
                if k == "loc" {
                    continue;
                }
                walk_member_expr_idents(v, Some((k, node)), f);
            }
        }
        _ => {}
    }
}

fn collect_pattern_idents(id: Option<&Value>, out: &mut HashSet<String>) {
    let Some(id) = id.filter(|v| !v.is_null()) else {
        return;
    };
    match node_type(id) {
        Some("Identifier") => {
            if let Some(n) = id.get("name").and_then(Value::as_str) {
                out.insert(n.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = id.get("properties").and_then(Value::as_array) {
                for p in props {
                    match node_type(p) {
                        Some("Property") => collect_pattern_idents(p.get("value"), out),
                        Some("RestElement") => collect_pattern_idents(p.get("argument"), out),
                        _ => {}
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(els) = id.get("elements").and_then(Value::as_array) {
                for e in els.iter().filter(|e| !e.is_null()) {
                    collect_pattern_idents(Some(e), out);
                }
            }
        }
        Some("AssignmentPattern") => collect_pattern_idents(id.get("left"), out),
        Some("RestElement") => collect_pattern_idents(id.get("argument"), out),
        _ => {}
    }
}

/// Collect all top-level variable names from the instance script program.
///
/// Includes:
/// - import specifier locals
/// - `var`/`let`/`const` declaration LHS identifiers (top-level only)
/// - `function` / `class` declaration names (top-level only)
/// - LHS bindings of top-level `$:` reactive assignment statements
/// - JS globals (e.g. `undefined`, `NaN`, …)
fn collect_top_level_names(script_content: &Value) -> HashSet<String> {
    let mut out: HashSet<String> = JS_GLOBALS
        .iter()
        .map(std::string::ToString::to_string)
        .collect();

    let Some(body) = script_content.get("body").and_then(Value::as_array) else {
        return out;
    };

    for stmt in body {
        match node_type(stmt) {
            Some("ImportDeclaration") => {
                if let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) {
                    for spec in specs {
                        if let Some(name) = spec
                            .get("local")
                            .and_then(|l| l.get("name"))
                            .and_then(Value::as_str)
                        {
                            out.insert(name.to_string());
                        }
                    }
                }
            }
            Some("VariableDeclaration") => {
                if let Some(decls) = stmt.get("declarations").and_then(Value::as_array) {
                    for decl in decls {
                        collect_pattern_idents(decl.get("id"), &mut out);
                    }
                }
            }
            Some("FunctionDeclaration" | "ClassDeclaration") => {
                if let Some(name) = stmt
                    .get("id")
                    .and_then(|i| i.get("name"))
                    .and_then(Value::as_str)
                {
                    out.insert(name.to_string());
                }
            }
            // $: reactive statements — collect LHS bindings.
            Some("LabeledStatement") => {
                if stmt
                    .get("label")
                    .and_then(|l| l.get("name"))
                    .and_then(Value::as_str)
                    != Some("$")
                {
                    continue;
                }
                let Some(body) = stmt.get("body") else {
                    continue;
                };
                if node_type(body) != Some("ExpressionStatement") {
                    continue;
                }
                let Some(expr) = body.get("expression") else {
                    continue;
                };
                if node_type(expr) != Some("AssignmentExpression") {
                    continue;
                }
                // Collect the LHS pattern names (handles `target = ...` and
                // `({ prop } = ...)` destructuring).
                collect_pattern_idents(expr.get("left"), &mut out);
                // Also collect simple identifier on the left of `target = $store.prop`.
                // (already handled by collect_pattern_idents for Identifier nodes)
            }
            _ => {}
        }
    }

    out
}

/// Find reactive variables that alias `$store.prop` in the instance script.
///
/// Returns a `Vec` of variable name strings (without deduplication — the
/// upstream uses `new Set(...)` on the iterator, so we dedup after collecting).
///
/// Looks for two patterns in top-level `$:` reactive statements:
///
/// 1. `$: target = $store.prop` →  `target`
/// 2. `$: ({ prop: target } = $store)` → `target`  (where `getPropertyName(prop) === propName`)
fn find_reactive_variables(script_content: &Value, store: &str, prop_name: &str) -> Vec<String> {
    let mut results = Vec::new();

    let Some(body) = script_content.get("body").and_then(Value::as_array) else {
        return results;
    };

    for stmt in body {
        if node_type(stmt) != Some("LabeledStatement") {
            continue;
        }
        if stmt
            .get("label")
            .and_then(|l| l.get("name"))
            .and_then(Value::as_str)
            != Some("$")
        {
            continue;
        }
        let Some(body_node) = stmt.get("body") else {
            continue;
        };
        if node_type(body_node) != Some("ExpressionStatement") {
            continue;
        }
        let Some(expr) = body_node.get("expression") else {
            continue;
        };
        if node_type(expr) != Some("AssignmentExpression") {
            continue;
        }

        let left = expr.get("left");
        let right = expr.get("right");

        // Pattern 1: `$: target = $store.prop`
        // right is MemberExpression with object=$store, property=prop_name
        // left is Identifier (the target variable)
        if let Some(right_node) = right
            && node_type(right_node) == Some("MemberExpression")
            && right_node.get("computed").and_then(Value::as_bool) != Some(true)
        {
            let obj_name = right_node
                .get("object")
                .and_then(|o| o.get("name"))
                .and_then(Value::as_str);
            let prop = right_node
                .get("property")
                .and_then(|p| p.get("name"))
                .and_then(Value::as_str);
            if obj_name == Some(store)
                && prop == Some(prop_name)
                && let Some(left_node) = left
                && node_type(left_node) == Some("Identifier")
                && let Some(target) = left_node.get("name").and_then(Value::as_str)
            {
                results.push(target.to_string());
            }
        }

        // Pattern 2: `$: ({ prop: target } = $store)` or `$: ({ prop } = $store)`
        // right is Identifier $store, left is ObjectPattern
        if let Some(right_node) = right
            && node_type(right_node) == Some("Identifier")
            && right_node.get("name").and_then(Value::as_str) == Some(store)
            && let Some(left_node) = left
            && node_type(left_node) == Some("ObjectPattern")
            && let Some(props) = left_node.get("properties").and_then(Value::as_array)
        {
            for prop in props {
                if node_type(prop) != Some("Property") {
                    continue;
                }
                // The property key name (getPropertyName equivalent):
                // non-computed key: use `key.name` (Identifier) or `key.value` (Literal)
                let key_name = get_property_name(prop);
                if key_name.as_deref() != Some(prop_name) {
                    continue;
                }
                // The value is the binding identifier.
                if let Some(val) = prop.get("value")
                    && node_type(val) == Some("Identifier")
                    && let Some(target) = val.get("name").and_then(Value::as_str)
                {
                    results.push(target.to_string());
                }
            }
        }
    }

    results
}

/// Get the property name from a Property node (mirrors `getPropertyName` from
/// `@eslint-community/eslint-utils`). Returns `None` for computed properties.
fn get_property_name(prop: &Value) -> Option<String> {
    if prop.get("computed").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    let key = prop.get("key")?;
    match node_type(key) {
        Some("Identifier") => key.get("name").and_then(Value::as_str).map(str::to_string),
        Some("Literal") => key.get("value").and_then(Value::as_str).map(str::to_string),
        _ => None,
    }
}

/// Find the byte offset of the `<` in `</script>` by scanning backward from
/// `script_end` (the exclusive end of the whole `<script>…</script>` span).
///
/// Returns `None` if the source does not contain `</script` before `script_end`.
fn find_close_script_tag(source: &str, script_end: u32) -> Option<u32> {
    let end = (script_end as usize).min(source.len());
    let slice = &source[..end];
    // rfind gives us the byte offset of '<' in '</script'.
    slice.rfind("</script").map(source_offset)
}

/// A pending report: node span, message text, store name, property name
/// (empty for computed), computed flag.
struct PendingReport {
    start: u32,
    end: u32,
    message: String,
    store: String,
    prop_name: String, // empty string means computed
    computed: bool,
}

#[derive(Default)]
pub struct PreferDestructuredStoreProps;

impl ScriptRule for PreferDestructuredStoreProps {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        // Upstream suppresses the rule inside a `<script>` element, so in a
        // component only the template reports (`check_root`); a standalone
        // module has no script element and reports throughout.
        if handled_by_template_pass(ctx.filename()) {
            return;
        }
        let mut reports = Vec::new();
        // Only a standalone `.svelte.(js|ts)` reaches here, and that is runes
        // mode by definition.
        collect_member_reports(ctx, program.value(), true, &mut reports);
        // No script element means upstream's `mainScript` stays null (no
        // destructuring suggestion), and `$:` is a plain labelled statement
        // rather than a `SvelteReactiveStatement` (no reactive-variable one).
        emit_reports(ctx, reports, None, None, &HashSet::new());
    }
}

impl Rule for PreferDestructuredStoreProps {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // The whole-root JSON is serialized once per file by the context and
        // shared with the other rules that walk the template.
        let root_json = ctx.root_json(root);
        let Some(frag) = root_json.get("fragment") else {
            return;
        };

        // Determine whether there is a main (non-module) instance script, and if
        // so, find the insertion point (start of `</script>`) and the script
        // content for reactive-variable / top-level-name analysis.
        //
        // Serialize the script content for analysis (only if we have a script).
        // The script program's own JSON cache — re-serializing it would rebuild
        // a whole ESTree tree the engine already materialised for this file.
        let script_content: Option<&Value> = if root
            .instance
            .as_ref()
            .is_some_and(|s| s.context == ScriptContext::Default)
        {
            with_serialize_arena(&root.arena, || {
                root.instance.as_ref().map(|s| s.content.as_json())
            })
        } else {
            None
        };

        // Find the insertion offset (position of '<' in '</script>').
        let close_tag_offset: Option<u32> =
            main_script(root).and_then(|s| find_close_script_tag(ctx.source(), s.end));

        // Collect top-level variable names (for hasTopLevelVariable).
        let top_level_names: HashSet<String> = script_content
            .map(collect_top_level_names)
            .unwrap_or_default();

        // Walk the fragment and collect reports.
        let runes = crate::runes_mode::component_runes_mode(root, ctx.source());
        let mut reports: Vec<PendingReport> = Vec::new();
        collect_member_reports(ctx, frag, runes, &mut reports);

        emit_reports(
            ctx,
            reports,
            script_content,
            close_tag_offset,
            &top_level_names,
        );
    }
}

/// Collect every `$store.prop` access in `tree` that upstream's
/// `MemberExpression[object.name=/^\$[^\$]/]` handler reports.
fn collect_member_reports(
    ctx: &LintContext,
    tree: &Value,
    runes: bool,
    reports: &mut Vec<PendingReport>,
) {
    walk_js(tree, |node, ancestors| {
        if node_type(node) != Some("MemberExpression") {
            return;
        }
        let object = node.get("object");
        if object.map(node_type) != Some(Some("Identifier")) {
            return;
        }
        let Some(store) = object.and_then(|o| o.get("name")).and_then(Value::as_str) else {
            return;
        };
        // Outside runes mode `$derived` is a store subscription, not a rune, so
        // the skip is conditional upstream too (`runes === true`).
        if !is_store_object(store) || (runes && SVELTE_RUNES.contains(&store)) {
            return;
        }
        let computed = node.get("computed").and_then(Value::as_bool) == Some(true);
        let member_start = node.get("start").and_then(Value::as_u64).unwrap_or(0);
        let shadowed = enclosing_scope_names(ancestors, member_start);
        if member_uses_fn_scoped(node, &shadowed) {
            return;
        }
        // Property name: identifier name (non-computed) or collapsed source.
        let (property_display, prop_name) = if computed {
            let display = match (
                node.get("property")
                    .and_then(|p| p.get("start"))
                    .and_then(Value::as_u64),
                node.get("property")
                    .and_then(|p| p.get("end"))
                    .and_then(Value::as_u64),
            ) {
                (Some(s), Some(e)) => match (json_offset(s), json_offset(e)) {
                    (Some(s), Some(e)) => Some(collapse_ws(ctx.slice(s, e))),
                    _ => None,
                },
                _ => None,
            };
            (display, String::new())
        } else {
            let name = node
                .get("property")
                .and_then(|p| p.get("name"))
                .and_then(Value::as_str)
                .map(str::to_string);
            (name.clone(), name.unwrap_or_default())
        };
        let Some(property_display) = property_display else {
            return;
        };
        if let (Some(s), Some(e)) = (
            node.get("start").and_then(Value::as_u64),
            node.get("end").and_then(Value::as_u64),
        ) {
            reports.push(PendingReport {
                start: json_offset(s).expect("AST source offsets are represented as u32"),
                end: json_offset(e).expect("AST source offsets are represented as u32"),
                message: format!(
                    "Destructure {property_display} from {store} for better change tracking & fewer redraws"
                ),
                store: store.to_string(),
                prop_name,
                computed,
            });
        }
    });
}

fn emit_reports(
    ctx: &mut LintContext,
    reports: Vec<PendingReport>,
    script_content: Option<&Value>,
    close_tag_offset: Option<u32>,
    top_level_names: &HashSet<String>,
) {
    for report in reports {
        if report.computed {
            // Computed accesses: no suggestions.
            ctx.report_with_suggestions(report.start, report.end, report.message, vec![]);
            continue;
        }

        let mut suggestions: Vec<Suggestion> = Vec::new();

        // fixUseVariable: for each existing reactive variable that aliases
        // $store.prop, offer to replace the access with that variable.
        if let Some(content) = script_content {
            let mut seen = HashSet::new();
            let vars = find_reactive_variables(content, &report.store, &report.prop_name);
            for var_name in vars {
                if !seen.insert(var_name.clone()) {
                    continue; // deduplicate (mirrors `new Set(...)`)
                }
                let desc = format!("Using the predefined reactive variable {var_name}");
                suggestions.push(Suggestion {
                    desc: desc.clone(),
                    fix: Fix {
                        message: desc,
                        edits: vec![TextEdit {
                            start: report.start,
                            end: report.end,
                            new_text: var_name,
                        }],
                    },
                });
            }
        }

        // fixUseDestructuring: insert `$: ({ prop } = $store);\n` before
        // </script> and replace the node with the new binding name.
        // Condition: there must be a main <script> block (close_tag_offset is Some).
        if let Some(insert_at) = close_tag_offset {
            let prop_name = &report.prop_name;
            let store = &report.store;

            // Compute the binding variable name, avoiding reserved words and
            // top-level collisions.
            let var_name = compute_var_name(prop_name, top_level_names);

            // Build the destructuring statement text.
            // If prop_name != var_name (alias needed), use `{ prop: var }`.
            let destructure_text = if prop_name == &var_name {
                format!("$: ({{ {prop_name} }} = {store});\n")
            } else {
                format!("$: ({{ {prop_name}: {var_name} }} = {store});\n")
            };

            let desc = format!(
                "Using destructuring like $: ({{ {prop_name} }} = {store}); will run faster"
            );
            suggestions.push(Suggestion {
                desc: desc.clone(),
                fix: Fix {
                    message: desc,
                    edits: vec![
                        // Insert the new reactive statement before </script>.
                        TextEdit {
                            start: insert_at,
                            end: insert_at,
                            new_text: destructure_text,
                        },
                        // Replace the member expression with the new variable.
                        TextEdit {
                            start: report.start,
                            end: report.end,
                            new_text: var_name,
                        },
                    ],
                },
            });
        }

        ctx.report_with_suggestions(report.start, report.end, report.message, suggestions);
    }
}

/// Collapse runs of whitespace to a single space (mirrors `replace(/\s+/g, ' ')`).
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for c in s.chars() {
        if c.is_whitespace() {
            if !in_ws {
                out.push(' ');
                in_ws = true;
            }
        } else {
            out.push(c);
            in_ws = false;
        }
    }
    out
}
