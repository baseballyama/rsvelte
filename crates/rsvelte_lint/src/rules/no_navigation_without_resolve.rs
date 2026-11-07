//! `svelte/no-navigation-without-resolve`.
//!
//! `svelte/no-navigation-without-resolve` — disallow `SvelteKit` navigation
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
use rsvelte_diagnostics::Diagnostic;
use serde_json::Value;

use crate::context::LintContext;
use crate::engine::{SourceKind, classify_source};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::kit_nav::{NavKind, ScopeIndex, nav_call_kind};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-navigation-without-resolve",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
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

/// Script-level `NAME = init` declarators (name → init node), for value
/// resolution, plus the names `getStaticValue` treats as constant (`const`, or
/// never written after the initializer).
struct VarInits<'a> {
    inits: HashMap<String, &'a Value>,
    consts: HashSet<String>,
}

fn collect_var_inits(json: &Value) -> VarInits<'_> {
    let mut inits = HashMap::new();
    let mut decls: HashMap<String, (usize, bool)> = HashMap::new();
    let mut written: HashSet<String> = HashSet::new();
    walk_js(json, |node, _| match node_type(node) {
        Some("VariableDeclaration") => {
            let is_const = node.get("kind").and_then(Value::as_str) == Some("const");
            for declarator in node
                .get("declarations")
                .and_then(Value::as_array)
                .map_or(&[] as &[Value], Vec::as_slice)
            {
                let name = declarator
                    .get("id")
                    .filter(|i| node_type(i) == Some("Identifier"))
                    .and_then(|i| i.get("name"))
                    .and_then(Value::as_str);
                let Some(name) = name else { continue };
                let entry = decls.entry(name.to_string()).or_insert((0, is_const));
                entry.0 += 1;
                if let Some(init) = declarator.get("init").filter(|i| !i.is_null()) {
                    inits.entry(name.to_string()).or_insert(init);
                }
            }
        }
        Some("AssignmentExpression") => {
            if let Some(name) = node
                .get("left")
                .filter(|l| node_type(l) == Some("Identifier"))
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
            {
                written.insert(name.to_string());
            }
        }
        Some("UpdateExpression") => {
            if let Some(name) = node
                .get("argument")
                .filter(|l| node_type(l) == Some("Identifier"))
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
            {
                written.insert(name.to_string());
            }
        }
        _ => {}
    });
    let consts = decls
        .into_iter()
        .filter(|(name, (count, is_const))| {
            *count == 1 && inits.contains_key(name) && (*is_const || !written.contains(name))
        })
        .map(|(name, _)| name)
        .collect();
    VarInits { inits, consts }
}

/// Everything the value checks read besides the node itself.
struct Cx<'a, 'f> {
    im: &'f Imports,
    vars: &'f VarInits<'a>,
    allowed_type: &'f AllowedTypeFn<'f>,
}

/// A value `getStaticValue` can compute.
enum StaticValue {
    Str(String),
    Num(f64),
    Bool(bool),
    Null,
    Undefined,
}

/// `String(value)` for a JS number.
fn js_number_string(n: f64) -> String {
    if n.is_finite() && n.fract() == 0.0 && n.abs() < 1e21 {
        #[allow(clippy::cast_possible_truncation)]
        let int = n as i64;
        return int.to_string();
    }
    if n.is_nan() {
        return "NaN".to_string();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.to_string();
    }
    n.to_string()
}

impl StaticValue {
    fn to_js_string(&self) -> String {
        match self {
            Self::Str(s) => s.clone(),
            Self::Num(n) => js_number_string(*n),
            Self::Bool(b) => b.to_string(),
            Self::Null => "null".to_string(),
            Self::Undefined => "undefined".to_string(),
        }
    }
}

fn template_quasi_cooked(quasi: &Value) -> Option<&str> {
    let value = quasi.get("value")?;
    value
        .get("cooked")
        .and_then(Value::as_str)
        .or_else(|| value.get("raw").and_then(Value::as_str))
}

/// The subset of `getStaticValue` the navigation checks reach.
fn static_value(cx: &Cx<'_, '_>, expr: &Value, depth: u32) -> Option<StaticValue> {
    if depth > 64 {
        return None;
    }
    match node_type(expr)? {
        "Literal" => {
            if expr.get("regex").is_some() || expr.get("bigint").is_some() {
                return None;
            }
            match expr.get("value")? {
                Value::String(s) => Some(StaticValue::Str(s.clone())),
                Value::Number(n) => n.as_f64().map(StaticValue::Num),
                Value::Bool(b) => Some(StaticValue::Bool(*b)),
                Value::Null => Some(StaticValue::Null),
                _ => None,
            }
        }
        "TemplateLiteral" => {
            let quasis = expr.get("quasis").and_then(Value::as_array)?;
            let expressions = expr
                .get("expressions")
                .and_then(Value::as_array)
                .map_or(&[] as &[Value], Vec::as_slice);
            let mut out = String::new();
            for (i, quasi) in quasis.iter().enumerate() {
                out.push_str(template_quasi_cooked(quasi)?);
                if let Some(embedded) = expressions.get(i) {
                    out.push_str(&static_value(cx, embedded, depth + 1)?.to_js_string());
                }
            }
            Some(StaticValue::Str(out))
        }
        "BinaryExpression" if expr.get("operator").and_then(Value::as_str) == Some("+") => {
            let left = static_value(cx, expr.get("left")?, depth + 1)?;
            let right = static_value(cx, expr.get("right")?, depth + 1)?;
            match (&left, &right) {
                (StaticValue::Num(a), StaticValue::Num(b)) => Some(StaticValue::Num(a + b)),
                (StaticValue::Str(_), _) | (_, StaticValue::Str(_)) => Some(StaticValue::Str(
                    left.to_js_string() + &right.to_js_string(),
                )),
                _ => None,
            }
        }
        "Identifier" => {
            let name = expr.get("name").and_then(Value::as_str)?;
            if cx.vars.consts.contains(name) {
                return static_value(cx, cx.vars.inits.get(name)?, depth + 1);
            }
            (name == "undefined" && !cx.vars.inits.contains_key(name))
                .then_some(StaticValue::Undefined)
        }
        _ => None,
    }
}

/// `getStringIfConstant`.
fn string_if_constant(cx: &Cx<'_, '_>, node: &Value) -> Option<String> {
    static_value(cx, node, 0).map(|v| v.to_js_string())
}

/// `getPropertyName` for a `MemberExpression`.
fn member_property_name(cx: &Cx<'_, '_>, member: &Value) -> Option<String> {
    let property = member.get("property")?;
    if member.get("computed").and_then(Value::as_bool) == Some(true) {
        return string_if_constant(cx, property);
    }
    if node_type(property) != Some("Identifier") {
        return None;
    }
    property
        .get("name")
        .and_then(Value::as_str)
        .map(str::to_string)
}

/// `getPropertyName` for a `Property`.
fn property_key_name(cx: &Cx<'_, '_>, property: &Value) -> Option<String> {
    let key = property.get("key")?;
    if property.get("computed").and_then(Value::as_bool) == Some(true) {
        return string_if_constant(cx, key);
    }
    match node_type(key)? {
        "Literal" => match key.get("value")? {
            Value::String(s) => Some(s.clone()),
            Value::Number(n) => n.as_f64().map(js_number_string),
            Value::Bool(b) => Some(b.to_string()),
            Value::Null => Some("null".to_string()),
            _ => None,
        },
        "Identifier" => key.get("name").and_then(Value::as_str).map(str::to_string),
        _ => None,
    }
}

/// The array index a property name refers to, if it is a canonical
/// non-negative integer.
fn array_index(key: &str) -> Option<usize> {
    let index: usize = key.parse().ok()?;
    (index.to_string() == key).then_some(index)
}

fn resolve_variable_init<'a>(cx: &Cx<'a, '_>, ident: &Value) -> Option<&'a Value> {
    let name = ident.get("name").and_then(Value::as_str)?;
    cx.vars.inits.get(name).copied()
}

fn resolve_to_literal_source<'a>(
    cx: &Cx<'a, '_>,
    node: &'a Value,
    depth: u32,
) -> Option<&'a Value> {
    match node_type(node)? {
        "Identifier" => resolve_variable_init(cx, node),
        "MemberExpression" => {
            let key = member_property_name(cx, node)?;
            access_key(cx, node.get("object")?, &key, depth + 1)
        }
        _ => None,
    }
}

fn resolve_to_array<'a>(cx: &Cx<'a, '_>, node: &'a Value, depth: u32) -> Option<&'a Value> {
    if depth > 64 {
        return None;
    }
    if node_type(node) == Some("ArrayExpression") {
        return Some(node);
    }
    resolve_to_array(cx, resolve_to_literal_source(cx, node, depth)?, depth + 1)
}

fn resolve_to_object<'a>(cx: &Cx<'a, '_>, node: &'a Value, depth: u32) -> Option<&'a Value> {
    if depth > 64 {
        return None;
    }
    if node_type(node) == Some("ObjectExpression") {
        return Some(node);
    }
    resolve_to_object(cx, resolve_to_literal_source(cx, node, depth)?, depth + 1)
}

fn access_key<'a>(cx: &Cx<'a, '_>, expr: &'a Value, key: &str, depth: u32) -> Option<&'a Value> {
    match array_index(key) {
        Some(index) => resolve_element(cx, expr, index, depth),
        None => resolve_property(cx, expr, key, depth),
    }
}

fn resolve_element<'a>(
    cx: &Cx<'a, '_>,
    array_expr: &'a Value,
    index: usize,
    depth: u32,
) -> Option<&'a Value> {
    let array = resolve_to_array(cx, array_expr, depth + 1)?;
    flatten_elements(cx, array, index, depth + 1)?
        .get(index)
        .copied()
        .flatten()
}

/// Flatten an array literal's elements, expanding statically resolvable
/// spreads, until `index + 1` entries are known.
fn flatten_elements<'a>(
    cx: &Cx<'a, '_>,
    array: &'a Value,
    index: usize,
    depth: u32,
) -> Option<Vec<Option<&'a Value>>> {
    if depth > 64 {
        return None;
    }
    let mut flattened: Vec<Option<&'a Value>> = Vec::new();
    for element in array
        .get("elements")
        .and_then(Value::as_array)
        .map_or(&[] as &[Value], Vec::as_slice)
    {
        if flattened.len() > index {
            break;
        }
        if element.is_null() {
            flattened.push(None);
        } else if node_type(element) == Some("SpreadElement") {
            let spread = resolve_to_array(cx, element.get("argument")?, depth + 1)?;
            let nested = flatten_elements(cx, spread, index - flattened.len(), depth + 1)?;
            flattened.extend(nested);
        } else {
            flattened.push(Some(element));
        }
    }
    Some(flattened)
}

enum PropertyLookup<'a> {
    Found(&'a Value),
    Absent,
    Unknown,
}

fn resolve_property<'a>(
    cx: &Cx<'a, '_>,
    object_expr: &'a Value,
    key: &str,
    depth: u32,
) -> Option<&'a Value> {
    match lookup_property(cx, object_expr, key, depth + 1) {
        PropertyLookup::Found(value) => Some(value),
        _ => None,
    }
}

/// Last-write-wins property lookup; an unresolvable spread or computed key
/// discards an earlier match, an absent one keeps it.
fn lookup_property<'a>(
    cx: &Cx<'a, '_>,
    object_expr: &'a Value,
    key: &str,
    depth: u32,
) -> PropertyLookup<'a> {
    if depth > 64 {
        return PropertyLookup::Unknown;
    }
    let Some(object) = resolve_to_object(cx, object_expr, depth + 1) else {
        return PropertyLookup::Unknown;
    };
    let mut result = PropertyLookup::Absent;
    for property in object
        .get("properties")
        .and_then(Value::as_array)
        .map_or(&[] as &[Value], Vec::as_slice)
    {
        if node_type(property) == Some("SpreadElement") {
            let spread = match property.get("argument") {
                Some(argument) => lookup_property(cx, argument, key, depth + 1),
                None => PropertyLookup::Unknown,
            };
            if !matches!(spread, PropertyLookup::Absent) {
                result = spread;
            }
        } else {
            match property_key_name(cx, property) {
                None => result = PropertyLookup::Unknown,
                Some(name) if name == key => {
                    if let Some(value) = property.get("value") {
                        result = PropertyLookup::Found(value);
                    }
                }
                Some(_) => {}
            }
        }
    }
    result
}

/// How an `{#each}` block binds `name`: through its `as` pattern along
/// properties / array elements only (`Some(true)`), some other way such as a
/// default, rest or the index (`Some(false)`), or not at all (`None`).
fn each_binds(each: &Value, name: &str) -> Option<bool> {
    fn pattern_binds(pattern: &Value, name: &str) -> Option<bool> {
        match node_type(pattern)? {
            "Identifier" => {
                (pattern.get("name").and_then(Value::as_str) == Some(name)).then_some(true)
            }
            "ObjectPattern" => pattern
                .get("properties")
                .and_then(Value::as_array)?
                .iter()
                .find_map(|property| match node_type(property) {
                    Some("Property") => pattern_binds(property.get("value")?, name),
                    _ => pattern_binds(property.get("argument")?, name).map(|_| false),
                }),
            "ArrayPattern" => pattern
                .get("elements")
                .and_then(Value::as_array)?
                .iter()
                .filter(|element| !element.is_null())
                .find_map(|element| match node_type(element) {
                    Some("RestElement") => {
                        pattern_binds(element.get("argument")?, name).map(|_| false)
                    }
                    _ => pattern_binds(element, name),
                }),
            "AssignmentPattern" => pattern_binds(pattern.get("left")?, name).map(|_| false),
            "RestElement" => pattern_binds(pattern.get("argument")?, name).map(|_| false),
            _ => None,
        }
    }
    if let Some(found) = each.get("context").and_then(|c| pattern_binds(c, name)) {
        return Some(found);
    }
    (each.get("index").and_then(Value::as_str) == Some(name)).then_some(false)
}

/// The innermost enclosing `{#each}` (index into `eaches`) binding `name`.
fn each_binding(eaches: &[&Value], name: &str) -> Option<(usize, bool)> {
    eaches
        .iter()
        .enumerate()
        .rev()
        .find_map(|(i, each)| each_binds(each, name).map(|eligible| (i, eligible)))
}

/// The value `name` receives when the `pattern` destructures `element`.
fn destructured_value<'a>(
    cx: &Cx<'a, '_>,
    pattern: &'a Value,
    element: &'a Value,
    name: &str,
    depth: u32,
) -> Option<&'a Value> {
    if depth > 64 {
        return None;
    }
    match node_type(pattern)? {
        "Identifier" => {
            (pattern.get("name").and_then(Value::as_str) == Some(name)).then_some(element)
        }
        "ObjectPattern" => pattern
            .get("properties")
            .and_then(Value::as_array)?
            .iter()
            .filter(|property| node_type(property) == Some("Property"))
            .find_map(|property| {
                let key = property_key_name(cx, property)?;
                let value = resolve_property(cx, element, &key, depth + 1)?;
                destructured_value(cx, property.get("value")?, value, name, depth + 1)
            }),
        "ArrayPattern" => pattern
            .get("elements")
            .and_then(Value::as_array)?
            .iter()
            .enumerate()
            .find_map(|(index, sub)| {
                if sub.is_null() {
                    return None;
                }
                let value = resolve_element(cx, element, index, depth + 1)?;
                destructured_value(cx, sub, value, name, depth + 1)
            }),
        _ => None,
    }
}

fn each_item_value_allowed<'a>(
    cx: &Cx<'a, '_>,
    eaches: &[&'a Value],
    each_index: usize,
    name: &str,
    key: Option<&str>,
    config: AllowConfig,
    depth: u32,
) -> bool {
    let each = eaches[each_index];
    let outer = &eaches[..each_index];
    let (Some(context), Some(expression)) = (each.get("context"), each.get("expression")) else {
        return false;
    };
    let Some(array) = resolve_to_array(cx, expression, depth + 1) else {
        return false;
    };
    for element in array
        .get("elements")
        .and_then(Value::as_array)
        .map_or(&[] as &[Value], Vec::as_slice)
    {
        if element.is_null() || node_type(element) == Some("SpreadElement") {
            return false;
        }
        let mut bound = destructured_value(cx, context, element, name, depth + 1);
        if let (Some(value), Some(key)) = (bound, key) {
            bound = access_key(cx, value, key, depth + 1);
        }
        match bound {
            Some(value) if is_value_allowed(cx, value, config, outer, depth + 1) => {}
            _ => return false,
        }
    }
    true
}

fn member_value_allowed<'a>(
    cx: &Cx<'a, '_>,
    member: &'a Value,
    config: AllowConfig,
    eaches: &[&'a Value],
    depth: u32,
) -> bool {
    let Some(key) = member_property_name(cx, member) else {
        return false;
    };
    let Some(object) = member.get("object") else {
        return false;
    };
    if node_type(object) != Some("Identifier") {
        return access_key(cx, object, &key, depth + 1)
            .is_some_and(|target| is_value_allowed(cx, target, config, eaches, depth + 1));
    }
    let name = object.get("name").and_then(Value::as_str).unwrap_or("");
    if let Some((each_index, eligible)) = each_binding(eaches, name) {
        return eligible
            && each_item_value_allowed(cx, eaches, each_index, name, Some(&key), config, depth);
    }
    resolve_variable_init(cx, object)
        .and_then(|init| access_key(cx, init, &key, depth + 1))
        .is_some_and(|target| is_value_allowed(cx, target, config, &[], depth + 1))
}

/// Whether a call expression node (JSON) is a `resolve()` or `asset()` call
/// from `$app/paths` (named or namespace import).
fn expression_is_resolve_call(cx: &Cx<'_, '_>, expr: &Value, depth: u32) -> bool {
    if depth > 64 {
        return false;
    }
    let im = cx.im;
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
                        && matches!(prop_name, Some("resolve" | "asset"))
                }
                _ => false,
            }
        }
        Some("Identifier") => resolve_variable_init(cx, expr)
            .is_some_and(|init| expression_is_resolve_call(cx, init, depth + 1)),
        _ => false,
    }
}

/// Config controlling what URLs are allowed beyond the resolve/asset check.
#[derive(Clone, Copy, Default)]
struct AllowConfig {
    urls: AllowedUrls,
    allow_nullish: bool,
}

#[derive(Clone, Copy, Default)]
struct AllowedUrls {
    absolute: bool,
    empty: bool,
    fragment: bool,
}

/// `pushState` / `replaceState` also accept an empty URL.
const SHALLOW_CONFIG: AllowConfig = AllowConfig {
    urls: AllowedUrls {
        absolute: false,
        empty: true,
        fragment: false,
    },
    allow_nullish: false,
};

#[derive(Clone, Copy, Default)]
struct NavigationIgnores(u8);

impl NavigationIgnores {
    const GOTO: u8 = 1;
    const LINKS: u8 = 1 << 1;
    const PUSH_STATE: u8 = 1 << 2;
    const REPLACE_STATE: u8 = 1 << 3;

    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }

    fn from_option(read_option: impl Fn(&str) -> bool) -> Self {
        let mut flags = 0;
        if read_option("ignoreGoto") {
            flags |= Self::GOTO;
        }
        if read_option("ignoreLinks") {
            flags |= Self::LINKS;
        }
        if read_option("ignorePushState") {
            flags |= Self::PUSH_STATE;
        }
        if read_option("ignoreReplaceState") {
            flags |= Self::REPLACE_STATE;
        }
        Self(flags)
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
                .is_none_or(std::vec::Vec::is_empty);
            let one_empty_quasi = expr
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
            no_exprs && one_empty_quasi
        }
        _ => false,
    }
}

/// Whether a node is a nullish value: `undefined` Identifier or `null` Literal.
fn expression_is_nullish(expr: &Value) -> bool {
    match node_type(expr) {
        Some("Identifier") => expr.get("name").and_then(Value::as_str) == Some("undefined"),
        Some("Literal") => expr.get("value").is_some_and(serde_json::Value::is_null),
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
/// For `BinaryExpression`, only the LEFT side is checked (start-position).
/// For `TemplateLiteral`, checks first expression OR first quasi.
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

fn is_value_allowed<'a>(
    cx: &Cx<'a, '_>,
    expr: &'a Value,
    config: AllowConfig,
    eaches: &[&'a Value],
    depth: u32,
) -> bool {
    if depth > 64 {
        return false;
    }

    // The expression's own resolved TYPE (checker-backed; stubbed in the native
    // path) is checked first, so an identifier/member typed as `ResolvedPathname`
    // (or nullish) is recognized before any syntactic var-init resolution
    // rewrites it to its initializer.
    if (cx.allowed_type)(expr, config) {
        return true;
    }

    if node_type(expr) == Some("Identifier") {
        let name = expr.get("name").and_then(Value::as_str).unwrap_or("");
        if let Some((each_index, eligible)) = each_binding(eaches, name) {
            if eligible
                && each_item_value_allowed(cx, eaches, each_index, name, None, config, depth)
            {
                return true;
            }
        } else if let Some(init) = cx.vars.inits.get(name) {
            return is_value_allowed(cx, init, config, &[], depth + 1);
        }
    }

    if node_type(expr) == Some("MemberExpression")
        && member_value_allowed(cx, expr, config, eaches, depth)
    {
        return true;
    }

    // ConditionalExpression: BOTH branches must be allowed.
    if node_type(expr) == Some("ConditionalExpression") {
        let cons = expr.get("consequent");
        let alt = expr.get("alternate");
        return cons.is_some_and(|c| is_value_allowed(cx, c, config, eaches, depth + 1))
            && alt.is_some_and(|a| is_value_allowed(cx, a, config, eaches, depth + 1));
    }

    (config.urls.absolute && expression_is_absolute(expr))
        || (config.urls.empty && expression_is_empty(expr))
        || (config.urls.fragment && expression_starts_with_fragment(expr))
        || (config.allow_nullish && expression_is_nullish(expr))
        || expression_is_resolve_call(cx, expr, 0)
}

fn span(node: &Value) -> Option<(u32, u32)> {
    Some((
        u32::try_from(node.get("start").and_then(Value::as_u64)?).ok()?,
        u32::try_from(node.get("end").and_then(Value::as_u64)?).ok()?,
    ))
}

/// `expressionValue` in upstream `hasRelExternal`: a static string, a template
/// literal assembled from its parts, or a NUL that cannot be a token boundary.
fn rel_expression_value(cx: &Cx<'_, '_>, expr: &Value) -> String {
    if let Some(StaticValue::Str(s)) = static_value(cx, expr, 0) {
        return s;
    }
    if node_type(expr) == Some("TemplateLiteral") {
        let expressions = expr
            .get("expressions")
            .and_then(Value::as_array)
            .map_or(&[] as &[Value], Vec::as_slice);
        return expr
            .get("quasis")
            .and_then(Value::as_array)
            .map_or(&[] as &[Value], Vec::as_slice)
            .iter()
            .enumerate()
            .map(|(i, quasi)| {
                let mut part = template_quasi_cooked(quasi).unwrap_or("").to_string();
                if let Some(embedded) = expressions.get(i) {
                    part.push_str(&rel_expression_value(cx, embedded));
                }
                part
            })
            .collect();
    }
    "\0".to_string()
}

/// Whether the first `rel` attribute's assembled value has an `external` token.
fn has_rel_external(attrs: &[Value], cx: &Cx<'_, '_>) -> bool {
    let Some(rel) = attrs.iter().find(|attr| {
        node_type(attr) == Some("Attribute")
            && attr.get("name").and_then(Value::as_str) == Some("rel")
    }) else {
        return false;
    };
    let part_value = |part: &Value| -> String {
        match node_type(part) {
            Some("Text") => part
                .get("data")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
            Some("ExpressionTag") => part
                .get("expression")
                .map_or_else(|| "\0".to_string(), |e| rel_expression_value(cx, e)),
            _ => "\0".to_string(),
        }
    };
    let value = match rel.get("value") {
        Some(Value::Array(parts)) => parts.iter().map(part_value).collect(),
        Some(part @ Value::Object(_)) => part_value(part),
        _ => String::new(),
    };
    value.split_whitespace().any(|token| token == "external")
}

/// Check an href attribute node. Returns true if the URL is not allowed.
fn check_href<'a>(
    attr: &'a Value,
    config: AllowConfig,
    cx: &Cx<'a, '_>,
    eaches: &[&'a Value],
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
            let text_allowed = (config.urls.absolute && url_is_absolute(data))
                || (config.urls.fragment && url_is_fragment(data));
            return !text_allowed;
        }
        if node_type(first) == Some("ExpressionTag") {
            return check_href_expr_tag(first, config, cx, eaches);
        }
        return false;
    }

    // Value is a single ExpressionTag → `href={...}`.
    if node_type(value) == Some("ExpressionTag") {
        return check_href_expr_tag(value, config, cx, eaches);
    }

    false
}

fn check_href_expr_tag<'a>(
    expr_tag: &'a Value,
    config: AllowConfig,
    cx: &Cx<'a, '_>,
    eaches: &[&'a Value],
) -> bool {
    let Some(expr) = expr_tag.get("expression") else {
        return false;
    };
    !is_value_allowed(cx, expr, config, eaches, 0)
}

/// The `{#each}` blocks whose body encloses `node`, outermost first.
fn enclosing_eaches<'a>(node: &Value, ancestors: &[&'a Value]) -> Vec<&'a Value> {
    let start = span(node).map_or(0, |(s, _)| s);
    ancestors
        .iter()
        .copied()
        .filter(|ancestor| {
            node_type(ancestor) == Some("EachBlock")
                && ancestor
                    .get("expression")
                    .and_then(span)
                    .is_some_and(|(_, expression_end)| start >= expression_end)
        })
        .collect()
}

/// Collect navigation findings from the serialized component JSON. Shared by the
/// native rule ([`NoNavigationWithoutResolve::check_root`], `allowed_type` =
/// stub) and the type-aware path ([`diagnostics_typed`], `allowed_type` =
/// checker-backed).
fn collect_nav_reports(
    json: &Value,
    ignores: NavigationIgnores,
    allowed_type: &AllowedTypeFn,
) -> Vec<(u32, u32, &'static str)> {
    let im = collect_imports(json);
    let vars = collect_var_inits(json);
    let cx = Cx {
        im: &im,
        vars: &vars,
        allowed_type,
    };
    // Upstream reaches the callee through `ReferenceTracker`, which follows a
    // binding copied out of the import; the name-keyed `im` sets cannot.
    let idx = ScopeIndex::build(json);
    let mut reports: Vec<(u32, u32, &'static str)> = Vec::new();

    walk_js(json, |node, ancestors| match node_type(node) {
        Some("CallExpression") => {
            let kind = nav_call_kind(&idx, node);
            let Some(kind) = kind else { return };
            let arguments = node.get("arguments").and_then(Value::as_array);
            let Some(first_argument) = arguments.and_then(|arguments| arguments.first()) else {
                return;
            };
            let eaches = enclosing_eaches(node, ancestors);
            let (msg, config) = match kind {
                NavKind::Goto if !ignores.contains(NavigationIgnores::GOTO) => {
                    (GOTO_MSG, AllowConfig::default())
                }
                NavKind::Push if !ignores.contains(NavigationIgnores::PUSH_STATE) => {
                    (PUSH_MSG, SHALLOW_CONFIG)
                }
                NavKind::Replace if !ignores.contains(NavigationIgnores::REPLACE_STATE) => {
                    (REPLACE_MSG, SHALLOW_CONFIG)
                }
                _ => return,
            };
            if !is_value_allowed(&cx, first_argument, config, &eaches, 0)
                && let Some((s, e)) = span(first_argument)
            {
                reports.push((s, e, msg));
            }
        }
        Some("RegularElement") if !ignores.contains(NavigationIgnores::LINKS) => {
            if node.get("name").and_then(Value::as_str) != Some("a") {
                return;
            }
            let attrs = node
                .get("attributes")
                .and_then(Value::as_array)
                .map_or(&[] as &[Value], std::vec::Vec::as_slice);
            if has_rel_external(attrs, &cx) {
                return;
            }
            let link_config = AllowConfig {
                urls: AllowedUrls {
                    absolute: true,
                    empty: false,
                    fragment: true,
                },
                allow_nullish: true,
            };
            let eaches = enclosing_eaches(node, ancestors);
            for attr in attrs {
                if node_type(attr) == Some("Attribute")
                    && attr.get("name").and_then(Value::as_str) == Some("href")
                    && check_href(attr, link_config, &cx, &eaches)
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

/// Type-aware navigation variant.
///
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
    let Ok(root) = rsvelte_core::parse(
        source,
        &rsvelte_core::Allocator::default(),
        rsvelte_core::ParseOptions::default(),
    ) else {
        return Vec::new();
    };
    let li = crate::line_index::LineIndex::new(source);

    let options = config.options_for(META.name);
    // The options are a variadic array; the conventional single options object
    // is `options[0]`.
    let first_option = options.and_then(|value| match value {
        Value::Array(a) => a.first(),
        other => Some(other),
    });
    let ignore = |key: &str| -> bool {
        first_option
            .and_then(|option| option.get(key))
            .and_then(Value::as_bool)
            == Some(true)
    };
    let ignores = NavigationIgnores::from_option(ignore);

    let backend = std::cell::RefCell::new(backend);
    let reports = with_serialize_arena(&root.arena, || {
        let Some(json) = serde_json::to_value(&root).ok() else {
            return Vec::new();
        };
        // Probe only identifier / member expressions (where a branded/nullish
        // type can live), and only the syntactic checks already failed.
        let allowed_type = |expr: &Value, cfg: AllowConfig| -> bool {
            if !matches!(node_type(expr), Some("Identifier" | "MemberExpression")) {
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
        collect_nav_reports(&json, ignores, &allowed_type)
    });

    reports
        .into_iter()
        .map(|(s, e, msg)| Diagnostic {
            file: file.to_path_buf(),
            severity: crate::validator::to_dsev(severity),
            range: Some(crate::validator::range_from_byte(&li, s, e)),
            message: msg.to_string(),
            code: Some(META.name.to_string()),
            source: "svelte",
        })
        .collect()
}

#[derive(Default)]
pub struct NoNavigationWithoutResolve;

impl NoNavigationWithoutResolve {
    fn run(ctx: &mut LintContext, json: &Value) {
        let opts = ctx.option0();
        let ignore = |key: &str| -> bool {
            opts.and_then(|o| o.get(key)).and_then(Value::as_bool) == Some(true)
        };

        // No type backend in the native walk: `expressionIsAllowedType` is a
        // stub. The type-aware path is `diagnostics_typed`.
        let no_types = |_: &Value, _: AllowConfig| false;
        let reports = collect_nav_reports(json, NavigationIgnores::from_option(ignore), &no_types);

        for (s, e, msg) in reports {
            ctx.report(s, e, msg);
        }
    }
}

impl Rule for NoNavigationWithoutResolve {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let Some(json) = with_serialize_arena(&root.arena, || serde_json::to_value(root).ok())
        else {
            return;
        };
        Self::run(ctx, &json);
    }
}

impl ScriptRule for NoNavigationWithoutResolve {
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
