//! Ports of the static-evaluation helpers the plugin rules share:
//! `@eslint-community/eslint-utils`' `getStaticValue` and the plugin's own
//! `getStringIfConstant`, plus the script-variable lookup `getStaticValue`
//! needs to resolve an identifier to its initializer.

use std::collections::{HashMap, HashSet};

use serde_json::Value;

/// A JS value a statically-evaluable expression can produce.
#[derive(Debug, Clone, PartialEq)]
pub enum JsValue {
    Str(String),
    Num(f64),
    Bool(bool),
    Null,
    Undefined,
    /// An object literal's own enumerable entries, in insertion order.
    Object(Vec<(String, JsValue)>),
    /// An array literal's elements, with holes materialized as `undefined`.
    Array(Vec<JsValue>),
}

impl JsValue {
    /// The value as a string, or `None` when it is not a string — mirrors
    /// upstream's `typeof staticValue?.value !== 'string'` guard.
    #[must_use]
    pub fn as_str(&self) -> Option<&str> {
        match self {
            Self::Str(s) => Some(s),
            _ => None,
        }
    }

    /// `ToBoolean`.
    fn truthy(&self) -> bool {
        match self {
            Self::Str(s) => !s.is_empty(),
            Self::Num(n) => *n != 0.0 && !n.is_nan(),
            Self::Bool(b) => *b,
            Self::Null | Self::Undefined => false,
            Self::Object(_) | Self::Array(_) => true,
        }
    }

    /// `ToString`.
    fn to_js_string(&self) -> String {
        match self {
            Self::Str(s) => s.clone(),
            Self::Num(n) => number_to_string(*n),
            Self::Bool(b) => b.to_string(),
            Self::Null => "null".to_string(),
            Self::Undefined => "undefined".to_string(),
            Self::Object(_) => "[object Object]".to_string(),
            // `Array.prototype.join` renders a nullish element as the empty
            // string rather than as `null` / `undefined`.
            Self::Array(items) => items
                .iter()
                .map(|item| match item {
                    Self::Null | Self::Undefined => String::new(),
                    other => other.to_js_string(),
                })
                .collect::<Vec<_>>()
                .join(","),
        }
    }

    /// `ToNumber`.
    fn to_number(&self) -> f64 {
        match self {
            Self::Str(s) => string_to_number(s),
            Self::Num(n) => *n,
            Self::Bool(b) => f64::from(u8::from(*b)),
            Self::Null => 0.0,
            Self::Undefined => f64::NAN,
            // `ToPrimitive` on a plain object/array is its string form.
            Self::Object(_) | Self::Array(_) => string_to_number(&self.to_js_string()),
        }
    }

    /// `typeof`.
    fn type_of(&self) -> &'static str {
        match self {
            Self::Str(_) => "string",
            Self::Num(_) => "number",
            Self::Bool(_) => "boolean",
            Self::Null | Self::Object(_) | Self::Array(_) => "object",
            Self::Undefined => "undefined",
        }
    }
}

fn string_to_number(s: &str) -> f64 {
    let t = s.trim();
    if t.is_empty() {
        0.0
    } else {
        t.parse::<f64>().unwrap_or(f64::NAN)
    }
}

/// JS `Number::toString`, which prints integral values without a fraction and
/// spells the non-finite values differently from Rust.
fn number_to_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".to_string();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.to_string();
    }
    let s = format!("{n}");
    // Rust prints `-0` for negative zero; JS prints `0`.
    if s == "-0" { "0".to_string() } else { s }
}

fn node_type(node: &Value) -> Option<&str> {
    node.get("type").and_then(Value::as_str)
}

/// The top-level bindings of a component's `<script>` block(s), plus the names
/// written to anywhere in the component — everything `getStaticValue`'s
/// identifier case and the affix extractors need in order to resolve a name to
/// its initializer.
#[derive(Debug, Default)]
pub struct ScriptVars {
    /// name → (declaration kind, initializer) for a name bound exactly once, at
    /// a script's top level, by a `VariableDeclarator` over a plain identifier.
    decls: HashMap<String, (String, Option<Value>)>,
    /// Names bound by more than one top-level declaration — upstream's
    /// `variable.identifiers.length !== 1` bail-out.
    duplicated: HashSet<String>,
    /// Names assigned to after their initializer, so they fail
    /// `isEffectivelyConst`.
    written: HashSet<String>,
    /// Names whose *property* is assigned to (`o.k = v`, `o[k]++`) — upstream's
    /// `hasMutationInProperty`, which rejects an object-valued binding outright.
    property_mutated: HashSet<String>,
}

impl ScriptVars {
    /// Collect from the serialized `Root`: both scripts' programs for the
    /// declarations, the whole tree for the writes.
    #[must_use]
    pub fn from_root_json(root_json: &Value) -> Self {
        let mut out = Self::default();
        for program in [
            root_json.get("instance").and_then(|s| s.get("content")),
            root_json.get("module").and_then(|s| s.get("content")),
        ]
        .into_iter()
        .flatten()
        {
            out.collect_program(program);
        }
        let mut written = HashSet::new();
        let mut property_mutated = HashSet::new();
        collect_writes(root_json, &mut written, &mut property_mutated);
        out.written = written;
        out.property_mutated = property_mutated;
        out
    }

    fn record(&mut self, name: &str, kind: &str, init: Option<&Value>) {
        if self.decls.contains_key(name) {
            self.duplicated.insert(name.to_string());
            return;
        }
        self.decls
            .insert(name.to_string(), (kind.to_string(), init.cloned()));
    }

    fn collect_program(&mut self, program: &Value) {
        let Some(body) = program.get("body").and_then(Value::as_array) else {
            return;
        };
        for stmt in body {
            self.collect_statement(stmt);
        }
    }

    fn collect_statement(&mut self, stmt: &Value) {
        match node_type(stmt) {
            Some("VariableDeclaration") => {
                let kind = stmt.get("kind").and_then(Value::as_str).unwrap_or("let");
                let Some(decls) = stmt.get("declarations").and_then(Value::as_array) else {
                    return;
                };
                for decl in decls {
                    let Some(id) = decl.get("id") else { continue };
                    let init = decl.get("init").filter(|v| !v.is_null());
                    if node_type(id) == Some("Identifier") {
                        if let Some(name) = id.get("name").and_then(Value::as_str) {
                            self.record(name, kind, init);
                        }
                    } else {
                        // A destructuring pattern binds names whose initializer
                        // is not the declarator's — unresolvable, but still a
                        // declaration for the duplicate check.
                        let mut names = Vec::new();
                        collect_pattern_names(id, &mut names);
                        for name in names {
                            self.record(&name, kind, None);
                        }
                    }
                }
            }
            Some("FunctionDeclaration" | "ClassDeclaration") => {
                if let Some(name) = stmt
                    .get("id")
                    .and_then(|i| i.get("name"))
                    .and_then(Value::as_str)
                {
                    self.record(name, "", None);
                }
            }
            Some("ImportDeclaration") => {
                if let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) {
                    for spec in specs {
                        if let Some(name) = spec
                            .get("local")
                            .and_then(|l| l.get("name"))
                            .and_then(Value::as_str)
                        {
                            self.record(name, "", None);
                        }
                    }
                }
            }
            Some("ExportNamedDeclaration" | "ExportDefaultDeclaration") => {
                if let Some(decl) = stmt.get("declaration").filter(|v| !v.is_null()) {
                    self.collect_statement(decl);
                }
            }
            _ => {}
        }
    }

    /// The initializer of a name bound exactly once by a `VariableDeclarator` —
    /// upstream's `extractVariable{Prefix,Suffix}Literal` gate, which does not
    /// care whether the binding is constant.
    #[must_use]
    pub fn declarator_init(&self, name: &str) -> Option<&Value> {
        if self.duplicated.contains(name) {
            return None;
        }
        self.decls.get(name)?.1.as_ref()
    }

    /// The initializer of a name bound by a literal `const` declarator —
    /// upstream's `findRootExpression`, which tests `def.parent.kind === 'const'`
    /// rather than whether the binding is only *effectively* constant.
    #[must_use]
    pub fn const_decl_init(&self, name: &str) -> Option<&Value> {
        if self.decls.get(name)?.0 != "const" {
            return None;
        }
        self.declarator_init(name)
    }

    /// The initializer of a name `canBeConsideredConst` accepts: bound once by
    /// a `const` declarator, or by a declarator that is never written to again.
    #[must_use]
    pub fn const_init(&self, name: &str) -> Option<&Value> {
        if self.decls.get(name)?.0 != "const" && self.written.contains(name) {
            return None;
        }
        self.declarator_init(name)
    }
}

fn collect_pattern_names(pattern: &Value, out: &mut Vec<String>) {
    match node_type(pattern) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(Value::as_str) {
                out.push(name.to_string());
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(Value::as_array) {
                for element in elements.iter().filter(|e| !e.is_null()) {
                    collect_pattern_names(element, out);
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = pattern.get("properties").and_then(Value::as_array) {
                for prop in props {
                    if let Some(value) = prop.get("value").or_else(|| prop.get("argument")) {
                        collect_pattern_names(value, out);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                collect_pattern_names(left, out);
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                collect_pattern_names(argument, out);
            }
        }
        _ => {}
    }
}

/// Every name written to after its declaration: an assignment or update target
/// in either script or template, or a `bind:` directive's target. `mutated`
/// collects the same for a *member* target, whose base name keeps its binding
/// but loses its object value.
fn collect_writes(node: &Value, out: &mut HashSet<String>, mutated: &mut HashSet<String>) {
    match node {
        Value::Array(items) => {
            for item in items {
                collect_writes(item, out, mutated);
            }
        }
        Value::Object(_) => {
            match node_type(node) {
                Some("AssignmentExpression") => {
                    if let Some(left) = node.get("left") {
                        let mut names = Vec::new();
                        collect_pattern_names(left, &mut names);
                        out.extend(names);
                        if let Some(base) = member_base_name(left) {
                            mutated.insert(base);
                        }
                    }
                }
                Some("UpdateExpression") => {
                    if let Some(argument) = node.get("argument") {
                        if node_type(argument) == Some("Identifier") {
                            if let Some(name) = argument.get("name").and_then(Value::as_str) {
                                out.insert(name.to_string());
                            }
                        } else if let Some(base) = member_base_name(argument) {
                            mutated.insert(base);
                        }
                    }
                }
                Some("BindDirective") => {
                    if let Some(expr) = node.get("expression") {
                        let mut names = Vec::new();
                        collect_pattern_names(expr, &mut names);
                        out.extend(names);
                        if let Some(base) = member_base_name(expr) {
                            mutated.insert(base);
                        }
                    }
                }
                _ => {}
            }
            for (_, child) in node.as_object().into_iter().flatten() {
                collect_writes(child, out, mutated);
            }
        }
        _ => {}
    }
}

/// The identifier a chain of member accesses is rooted at, for a node that is
/// itself a `MemberExpression`.
fn member_base_name(node: &Value) -> Option<String> {
    if node_type(node) != Some("MemberExpression") {
        return None;
    }
    let mut current = node;
    while node_type(current) == Some("MemberExpression") {
        current = current.get("object")?;
    }
    if node_type(current) == Some("Identifier") {
        return current
            .get("name")
            .and_then(Value::as_str)
            .map(str::to_string);
    }
    None
}

/// Port of `@eslint-community/eslint-utils`' `getStaticValue`, restricted to the
/// primitive values the plugin rules inspect. Objects, arrays and calls are not
/// evaluated, so they answer "unknown" the way an unresolvable identifier does.
#[must_use]
pub fn get_static_value(node: &Value, vars: &ScriptVars) -> Option<JsValue> {
    get_static_value_inner(node, vars, &mut Vec::new())
}

fn get_static_value_inner(
    node: &Value,
    vars: &ScriptVars,
    visited: &mut Vec<String>,
) -> Option<JsValue> {
    match node_type(node)? {
        "Literal" => literal_value(node),
        "TemplateLiteral" => {
            let quasis = node.get("quasis").and_then(Value::as_array)?;
            let exprs = node
                .get("expressions")
                .and_then(Value::as_array)
                .map_or(&[][..], Vec::as_slice);
            let mut out = String::new();
            for (i, quasi) in quasis.iter().enumerate() {
                out.push_str(&cooked(quasi));
                if let Some(expr) = exprs.get(i) {
                    out.push_str(&get_static_value_inner(expr, vars, visited)?.to_js_string());
                }
            }
            Some(JsValue::Str(out))
        }
        "BinaryExpression" => {
            let op = node.get("operator").and_then(Value::as_str)?;
            let left = get_static_value_inner(node.get("left")?, vars, visited)?;
            let right = get_static_value_inner(node.get("right")?, vars, visited)?;
            binary(op, &left, &right)
        }
        "LogicalExpression" => {
            let op = node.get("operator").and_then(Value::as_str)?;
            let left = get_static_value_inner(node.get("left")?, vars, visited)?;
            let take_right = match op {
                "&&" => left.truthy(),
                "||" => !left.truthy(),
                "??" => matches!(left, JsValue::Null | JsValue::Undefined),
                _ => return None,
            };
            if take_right {
                get_static_value_inner(node.get("right")?, vars, visited)
            } else {
                Some(left)
            }
        }
        "ConditionalExpression" => {
            let test = get_static_value_inner(node.get("test")?, vars, visited)?;
            let branch = if test.truthy() {
                "consequent"
            } else {
                "alternate"
            };
            get_static_value_inner(node.get(branch)?, vars, visited)
        }
        "UnaryExpression" => {
            let op = node.get("operator").and_then(Value::as_str)?;
            let arg = get_static_value_inner(node.get("argument")?, vars, visited)?;
            match op {
                "!" => Some(JsValue::Bool(!arg.truthy())),
                "-" => Some(JsValue::Num(-arg.to_number())),
                "+" => Some(JsValue::Num(arg.to_number())),
                "~" => Some(JsValue::Num(f64::from(!to_int32(arg.to_number())))),
                "typeof" => Some(JsValue::Str(arg.type_of().to_string())),
                "void" => Some(JsValue::Undefined),
                _ => None,
            }
        }
        "SequenceExpression" => {
            let exprs = node.get("expressions").and_then(Value::as_array)?;
            get_static_value_inner(exprs.last()?, vars, visited)
        }
        // TS-only wrappers evaluate to their operand.
        "TSAsExpression"
        | "TSSatisfiesExpression"
        | "TSTypeAssertion"
        | "TSNonNullExpression"
        | "TSInstantiationExpression" => {
            get_static_value_inner(node.get("expression")?, vars, visited)
        }
        "ObjectExpression" => {
            let mut entries: Vec<(String, JsValue)> = Vec::new();
            for property in node.get("properties").and_then(Value::as_array)? {
                match node_type(property)? {
                    "Property" => {
                        if property.get("kind").and_then(Value::as_str) != Some("init") {
                            return None;
                        }
                        let key = static_property_name(property, vars, visited)?;
                        let value = get_static_value_inner(property.get("value")?, vars, visited)?;
                        set_entry(&mut entries, key, value);
                    }
                    "SpreadElement" => {
                        match get_static_value_inner(property.get("argument")?, vars, visited)? {
                            JsValue::Object(spread) => {
                                for (key, value) in spread {
                                    set_entry(&mut entries, key, value);
                                }
                            }
                            _ => return None,
                        }
                    }
                    _ => return None,
                }
            }
            Some(JsValue::Object(entries))
        }
        "ArrayExpression" => {
            let mut items = Vec::new();
            for element in node.get("elements").and_then(Value::as_array)? {
                if element.is_null() {
                    items.push(JsValue::Undefined);
                } else if node_type(element) == Some("SpreadElement") {
                    match get_static_value_inner(element.get("argument")?, vars, visited)? {
                        JsValue::Array(spread) => items.extend(spread),
                        _ => return None,
                    }
                } else {
                    items.push(get_static_value_inner(element, vars, visited)?);
                }
            }
            Some(JsValue::Array(items))
        }
        "MemberExpression" => {
            let object = get_static_value_inner(node.get("object")?, vars, visited)?;
            let key = static_property_name(node, vars, visited)?;
            property_of(&object, &key)
        }
        "Identifier" => {
            let name = node.get("name").and_then(Value::as_str)?;
            match name {
                "undefined" => return Some(JsValue::Undefined),
                "NaN" => return Some(JsValue::Num(f64::NAN)),
                "Infinity" => return Some(JsValue::Num(f64::INFINITY)),
                _ => {}
            }
            if visited.iter().any(|seen| seen == name) {
                return None;
            }
            let init = vars.const_init(name)?.clone();
            visited.push(name.to_string());
            let out = get_static_value_inner(&init, vars, visited);
            visited.pop();
            // `hasMutationInProperty`: an object-valued binding whose property is
            // written to anywhere no longer describes the value at this point.
            if matches!(out, Some(JsValue::Object(_) | JsValue::Array(_)))
                && vars.property_mutated.contains(name)
            {
                return None;
            }
            out
        }
        _ => None,
    }
}

fn set_entry(entries: &mut Vec<(String, JsValue)>, key: String, value: JsValue) {
    if let Some(slot) = entries.iter_mut().find(|(k, _)| *k == key) {
        slot.1 = value;
    } else {
        entries.push((key, value));
    }
}

/// `getStaticPropertyNameValue`, stringified — a `Property`'s `key` or a
/// `MemberExpression`'s `property`, which JS coerces to a string either way.
fn static_property_name(
    node: &Value,
    vars: &ScriptVars,
    visited: &mut Vec<String>,
) -> Option<String> {
    let name_node = if node_type(node) == Some("Property") {
        node.get("key")?
    } else {
        node.get("property")?
    };
    if node.get("computed").and_then(Value::as_bool) == Some(true) {
        return Some(get_static_value_inner(name_node, vars, visited)?.to_js_string());
    }
    match node_type(name_node)? {
        "Identifier" => name_node
            .get("name")
            .and_then(Value::as_str)
            .map(str::to_string),
        "Literal" => {
            if let Some(bigint) = name_node.get("bigint").and_then(Value::as_str) {
                return Some(bigint.to_string());
            }
            Some(literal_value(name_node)?.to_js_string())
        }
        _ => None,
    }
}

/// Property access on an already-evaluated value. A primitive receiver is not
/// modelled, so it answers "unknown" rather than reaching a built-in.
fn property_of(object: &JsValue, key: &str) -> Option<JsValue> {
    match object {
        JsValue::Object(entries) => Some(
            entries
                .iter()
                .find(|(k, _)| k == key)
                .map_or(JsValue::Undefined, |(_, v)| v.clone()),
        ),
        JsValue::Array(items) => {
            if key == "length" {
                #[allow(clippy::cast_precision_loss)]
                return Some(JsValue::Num(items.len() as f64));
            }
            let index = key.parse::<usize>().ok()?;
            Some(items.get(index).cloned().unwrap_or(JsValue::Undefined))
        }
        _ => None,
    }
}

fn literal_value(node: &Value) -> Option<JsValue> {
    // A regex or bigint literal carries its payload in a sibling field and a
    // `value` that does not describe it.
    if node.get("regex").is_some() || node.get("bigint").is_some() {
        return None;
    }
    match node.get("value")? {
        Value::String(s) => Some(JsValue::Str(s.clone())),
        Value::Bool(b) => Some(JsValue::Bool(*b)),
        Value::Number(n) => Some(JsValue::Num(n.as_f64()?)),
        Value::Null => Some(JsValue::Null),
        _ => None,
    }
}

fn cooked(quasi: &Value) -> String {
    quasi
        .get("value")
        .and_then(|v| v.get("cooked").or_else(|| v.get("raw")))
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_string()
}

#[allow(clippy::cast_possible_truncation)]
fn to_int32(n: f64) -> i32 {
    if n.is_finite() { n as i32 } else { 0 }
}

fn binary(op: &str, left: &JsValue, right: &JsValue) -> Option<JsValue> {
    match op {
        "+" => {
            // `ToPrimitive` of a plain object/array is a string, so `+` concatenates.
            let stringy =
                |v: &JsValue| matches!(v, JsValue::Str(_) | JsValue::Object(_) | JsValue::Array(_));
            if stringy(left) || stringy(right) {
                Some(JsValue::Str(format!(
                    "{}{}",
                    left.to_js_string(),
                    right.to_js_string()
                )))
            } else {
                Some(JsValue::Num(left.to_number() + right.to_number()))
            }
        }
        "-" => Some(JsValue::Num(left.to_number() - right.to_number())),
        "*" => Some(JsValue::Num(left.to_number() * right.to_number())),
        "/" => Some(JsValue::Num(left.to_number() / right.to_number())),
        "%" => Some(JsValue::Num(left.to_number() % right.to_number())),
        "**" => Some(JsValue::Num(left.to_number().powf(right.to_number()))),
        "===" => Some(JsValue::Bool(strict_equals(left, right))),
        "!==" => Some(JsValue::Bool(!strict_equals(left, right))),
        "==" => Some(JsValue::Bool(loose_equals(left, right))),
        "!=" => Some(JsValue::Bool(!loose_equals(left, right))),
        "<" | "<=" | ">" | ">=" => {
            if let (JsValue::Str(l), JsValue::Str(r)) = (left, right) {
                let (l, r) = (utf16_units(l), utf16_units(r));
                return Some(JsValue::Bool(match op {
                    "<" => l < r,
                    "<=" => l <= r,
                    ">" => l > r,
                    _ => l >= r,
                }));
            }
            let (l, r) = (left.to_number(), right.to_number());
            Some(JsValue::Bool(match op {
                "<" => l < r,
                "<=" => l <= r,
                ">" => l > r,
                _ => l >= r,
            }))
        }
        _ => None,
    }
}

/// JS compares strings by UTF-16 code unit, which orders astral characters
/// below some BMP ones — the opposite of Rust's `str` ordering.
fn utf16_units(s: &str) -> Vec<u16> {
    s.encode_utf16().collect()
}

fn strict_equals(left: &JsValue, right: &JsValue) -> bool {
    match (left, right) {
        (JsValue::Str(l), JsValue::Str(r)) => l == r,
        (JsValue::Num(l), JsValue::Num(r)) => l == r,
        (JsValue::Bool(l), JsValue::Bool(r)) => l == r,
        (JsValue::Null, JsValue::Null) | (JsValue::Undefined, JsValue::Undefined) => true,
        _ => false,
    }
}

fn loose_equals(left: &JsValue, right: &JsValue) -> bool {
    match (left, right) {
        (JsValue::Null | JsValue::Undefined, JsValue::Null | JsValue::Undefined) => true,
        (JsValue::Null | JsValue::Undefined, _) | (_, JsValue::Null | JsValue::Undefined) => false,
        (JsValue::Str(l), JsValue::Str(r)) => l == r,
        _ => left.to_number() == right.to_number(),
    }
}

/// Port of the plugin's own `getStringIfConstant` (`utils/ast-utils.ts`), which
/// is narrower than `getStaticValue`: only a string literal, a template literal
/// whose expressions are themselves constant strings, and `+` concatenation.
#[must_use]
pub fn get_string_if_constant(node: &Value) -> Option<String> {
    match node_type(node)? {
        "Literal" => node
            .get("value")
            .and_then(Value::as_str)
            .map(str::to_string),
        "TemplateLiteral" => {
            let quasis = node.get("quasis").and_then(Value::as_array)?;
            let exprs = node
                .get("expressions")
                .and_then(Value::as_array)
                .map_or(&[][..], Vec::as_slice);
            let mut out = String::new();
            for (i, quasi) in quasis.iter().enumerate() {
                out.push_str(&cooked(quasi));
                if let Some(expr) = exprs.get(i) {
                    out.push_str(&get_string_if_constant(expr)?);
                }
            }
            Some(out)
        }
        "BinaryExpression" if node.get("operator").and_then(Value::as_str) == Some("+") => {
            let left = get_string_if_constant(node.get("left")?)?;
            let right = get_string_if_constant(node.get("right")?)?;
            Some(format!("{left}{right}"))
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{JsValue, ScriptVars, get_static_value, get_string_if_constant};

    fn lit(value: serde_json::Value) -> serde_json::Value {
        json!({"type": "Literal", "value": value})
    }

    #[test]
    fn string_if_constant_folds_concat_and_templates() {
        let vars = json!({"type":"BinaryExpression","operator":"+",
            "left": lit("a".into()), "right": lit("".into())});
        assert_eq!(get_string_if_constant(&vars).as_deref(), Some("a"));

        let tpl = json!({"type":"TemplateLiteral",
            "quasis":[{"value":{"cooked":"a","raw":"a"}},{"value":{"cooked":"","raw":""}}],
            "expressions":[lit("b".into())]});
        assert_eq!(get_string_if_constant(&tpl).as_deref(), Some("ab"));

        let unknown = json!({"type":"Identifier","name":"x"});
        assert!(get_string_if_constant(&unknown).is_none());
    }

    #[test]
    fn static_value_resolves_effectively_const_identifiers() {
        let root = json!({
            "instance": {"content": {"body": [
                {"type":"VariableDeclaration","kind":"const","declarations":[
                    {"id":{"type":"Identifier","name":"kind"},"init": lit("checkbox".into())}]},
                {"type":"VariableDeclaration","kind":"let","declarations":[
                    {"id":{"type":"Identifier","name":"cond"},"init": lit(true.into())}]},
                {"type":"VariableDeclaration","kind":"let","declarations":[
                    {"id":{"type":"Identifier","name":"moved"},"init": lit("a".into())}]}
            ]}},
            "fragment": {"nodes": [
                {"type":"AssignmentExpression","left":{"type":"Identifier","name":"moved"},
                 "right": lit("b".into())}
            ]}
        });
        let vars = ScriptVars::from_root_json(&root);

        let ident = |name: &str| json!({"type":"Identifier","name":name});
        assert_eq!(
            get_static_value(&ident("kind"), &vars),
            Some(JsValue::Str("checkbox".into()))
        );
        assert_eq!(
            get_static_value(&ident("cond"), &vars),
            Some(JsValue::Bool(true))
        );
        // Written after initialization → not effectively const.
        assert_eq!(get_static_value(&ident("moved"), &vars), None);

        let ternary = json!({"type":"ConditionalExpression","test": ident("cond"),
            "consequent": lit("checkbox".into()), "alternate": lit("radio".into())});
        assert_eq!(
            get_static_value(&ternary, &vars)
                .as_ref()
                .and_then(JsValue::as_str),
            Some("checkbox")
        );
    }

    #[test]
    fn static_value_stops_on_a_self_referential_binding() {
        let root = json!({"instance": {"content": {"body": [
            {"type":"VariableDeclaration","kind":"const","declarations":[
                {"id":{"type":"Identifier","name":"a"},"init":{"type":"Identifier","name":"b"}}]},
            {"type":"VariableDeclaration","kind":"const","declarations":[
                {"id":{"type":"Identifier","name":"b"},"init":{"type":"Identifier","name":"a"}}]}
        ]}}});
        let vars = ScriptVars::from_root_json(&root);
        assert_eq!(
            get_static_value(&json!({"type":"Identifier","name":"a"}), &vars),
            None
        );
    }

    fn types_object() -> serde_json::Value {
        json!({"type":"ObjectExpression","properties":[
            {"type":"Property","kind":"init","computed":false,
             "key":{"type":"Identifier","name":"CHECK"},"value": lit("checkbox".into())},
            {"type":"Property","kind":"init","computed":false,
             "key":{"type":"Identifier","name":"RADIO"},"value": lit("radio".into())}]})
    }

    fn member(computed: bool, property: serde_json::Value) -> serde_json::Value {
        json!({"type":"MemberExpression","computed":computed,
            "object":{"type":"Identifier","name":"TYPES"},"property":property})
    }

    #[test]
    fn static_value_reads_object_members_and_unwraps_ts() {
        let root = json!({"instance": {"content": {"body": [
            {"type":"VariableDeclaration","kind":"const","declarations":[
                {"id":{"type":"Identifier","name":"TYPES"},"init": types_object()}]},
            {"type":"VariableDeclaration","kind":"const","declarations":[
                {"id":{"type":"Identifier","name":"kind"},
                 "init":{"type":"TSAsExpression","expression": lit("checkbox".into())}}]}
        ]}}});
        let vars = ScriptVars::from_root_json(&root);
        let as_str = |node: &serde_json::Value| {
            get_static_value(node, &vars)
                .as_ref()
                .and_then(JsValue::as_str)
                .map(str::to_string)
        };
        assert_eq!(
            as_str(&member(false, json!({"type":"Identifier","name":"CHECK"}))).as_deref(),
            Some("checkbox")
        );
        assert_eq!(
            as_str(&member(true, lit("RADIO".into()))).as_deref(),
            Some("radio")
        );
        assert_eq!(
            as_str(&json!({"type":"Identifier","name":"kind"})).as_deref(),
            Some("checkbox")
        );
    }

    #[test]
    fn a_mutated_property_makes_an_object_binding_unresolvable() {
        let root = json!({"instance": {"content": {"body": [
            {"type":"VariableDeclaration","kind":"const","declarations":[
                {"id":{"type":"Identifier","name":"TYPES"},"init": types_object()}]},
            {"type":"ExpressionStatement","expression":{"type":"AssignmentExpression",
                "left": member(false, json!({"type":"Identifier","name":"CHECK"})),
                "right": lit("text".into())}}
        ]}}});
        let vars = ScriptVars::from_root_json(&root);
        assert_eq!(
            get_static_value(
                &member(false, json!({"type":"Identifier","name":"CHECK"})),
                &vars
            ),
            None
        );
    }

    #[test]
    fn a_redeclared_name_is_not_resolvable() {
        let root = json!({"instance": {"content": {"body": [
            {"type":"VariableDeclaration","kind":"const","declarations":[
                {"id":{"type":"Identifier","name":"x"},"init": lit("a".into())}]},
            {"type":"FunctionDeclaration","id":{"type":"Identifier","name":"x"}}
        ]}}});
        let vars = ScriptVars::from_root_json(&root);
        assert!(vars.declarator_init("x").is_none());
        assert!(vars.const_init("x").is_none());
    }
}
