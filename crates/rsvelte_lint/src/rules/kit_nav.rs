//! Scope-aware resolution shared by the `$app/navigation` / `$app/paths` rules
//! (`no-goto-without-base`, `no-navigation-without-base`).
//!
//! Upstream resolves `goto` / `base` through `ReferenceTracker` + `findVariable`,
//! so both rules ask "does THIS identifier occurrence refer to the import?".
//! A name-keyed set answers a different question and is wrong in both
//! directions: a parameter named `goto` reports, and a parameter named `base`
//! suppresses. This module rebuilds the lexical scope tree from the serialized
//! `ESTree` JSON so the occurrence-level question can be answered.

use std::collections::{HashMap, HashSet};

use serde_json::Value;

use crate::script::{node_type, walk_js};

fn ptr(v: &Value) -> usize {
    std::ptr::from_ref(v) as usize
}

fn arr<'a>(node: &'a Value, key: &str) -> &'a [Value] {
    node.get(key).and_then(Value::as_array).map_or(&[], |a| a)
}

fn ident_name(node: &Value) -> Option<&str> {
    node.get("name").and_then(Value::as_str)
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ScopeKind {
    /// A function / arrow body scope (the `var` target).
    Function,
    /// A block-ish scope (block, `for`, `catch`, `switch`, class).
    Block,
    /// A `<script>` program — also a `var` target, and the fallback scope a
    /// template expression or the sibling `<script>` resolves against.
    Program,
}

struct Scope {
    parent: Option<usize>,
    kind: ScopeKind,
    bindings: HashMap<String, usize>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ImportKind {
    Named,
    Namespace,
    Default,
}

pub struct ImportInfo {
    pub source: String,
    pub kind: ImportKind,
    pub imported: String,
}

pub struct Binding<'a> {
    /// How many declaration sites the binding has — upstream bails out of
    /// initializer chasing unless `variable.identifiers.length === 1`.
    decls: usize,
    /// The initializer, when the single declaration is a `VariableDeclarator`
    /// that has one.
    init: Option<&'a Value>,
    import: Option<ImportInfo>,
}

impl Binding<'_> {
    #[must_use]
    pub fn is_named_import(&self, source: &str, imported: &str) -> bool {
        self.import.as_ref().is_some_and(|i| {
            i.kind == ImportKind::Named && i.source == source && i.imported == imported
        })
    }

    #[must_use]
    pub fn is_namespace_import(&self, source: &str) -> bool {
        self.import
            .as_ref()
            .is_some_and(|i| i.kind == ImportKind::Namespace && i.source == source)
    }
}

/// A lexical scope tree over one serialized tree (a component root, or a single
/// program for a standalone module).
pub struct ScopeIndex<'a> {
    scopes: Vec<Scope>,
    bindings: Vec<Binding<'a>>,
    node_scope: HashMap<usize, usize>,
    programs: Vec<usize>,
}

impl<'a> ScopeIndex<'a> {
    #[must_use]
    pub fn build(root: &'a Value) -> Self {
        let mut this = Self {
            scopes: vec![Scope {
                parent: None,
                kind: ScopeKind::Program,
                bindings: HashMap::new(),
            }],
            bindings: Vec::new(),
            node_scope: HashMap::new(),
            programs: Vec::new(),
        };
        // Scope-creating node -> the scope it opens. Filled in DFS pre-order, so
        // every ancestor's scope exists by the time a child is visited.
        let mut created: HashMap<usize, usize> = HashMap::new();
        walk_js(root, |node, ancestors| {
            let enclosing = ancestors
                .iter()
                .rev()
                .find_map(|a| created.get(&ptr(a)).copied())
                .unwrap_or(0);
            this.node_scope.insert(ptr(node), enclosing);
            if let Some(kind) = scope_kind(node) {
                let id = this.scopes.len();
                this.scopes.push(Scope {
                    parent: Some(enclosing),
                    kind,
                    bindings: HashMap::new(),
                });
                created.insert(ptr(node), id);
                if kind == ScopeKind::Program {
                    this.programs.push(id);
                }
                this.declare_own(node, id);
            }
            this.declare_outer(node, enclosing, ancestors);
        });
        this
    }

    /// Bindings that belong to the scope the node itself opens (parameters, a
    /// named function expression's own name, a `catch` binding).
    fn declare_own(&mut self, node: &'a Value, scope: usize) {
        let mut idents: Vec<&'a Value> = Vec::new();
        match node_type(node) {
            Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression") => {
                for p in arr(node, "params") {
                    pattern_idents(p, &mut idents);
                }
                if node_type(node) == Some("FunctionExpression")
                    && let Some(id) = node.get("id").filter(|i| !i.is_null())
                {
                    idents.push(id);
                }
            }
            Some("ClassExpression") => {
                if let Some(id) = node.get("id").filter(|i| !i.is_null()) {
                    idents.push(id);
                }
            }
            Some("CatchClause") => {
                if let Some(p) = node.get("param").filter(|p| !p.is_null()) {
                    pattern_idents(p, &mut idents);
                }
            }
            _ => {}
        }
        for id in idents {
            self.bind(scope, id, None, None);
        }
    }

    /// Bindings the node contributes to an enclosing scope.
    fn declare_outer(&mut self, node: &'a Value, enclosing: usize, ancestors: &[&'a Value]) {
        match node_type(node) {
            Some("VariableDeclarator") => {
                let kind = ancestors
                    .last()
                    .and_then(|d| d.get("kind"))
                    .and_then(Value::as_str)
                    .unwrap_or("let");
                let target = if kind == "var" {
                    self.nearest(enclosing, |k| k != ScopeKind::Block)
                } else {
                    enclosing
                };
                let init = node.get("init").filter(|i| !i.is_null());
                let mut idents = Vec::new();
                if let Some(id) = node.get("id") {
                    pattern_idents(id, &mut idents);
                }
                // Only a plain `NAME = init` declarator feeds upstream's
                // initializer chasing; a destructuring pattern does not.
                let single = idents.len() == 1
                    && node_type(node.get("id").unwrap_or(&Value::Null)) == Some("Identifier");
                for id in idents {
                    self.bind(target, id, if single { init } else { None }, None);
                }
            }
            Some("FunctionDeclaration" | "ClassDeclaration") => {
                if let Some(id) = node.get("id").filter(|i| !i.is_null()) {
                    self.bind(enclosing, id, None, None);
                }
            }
            Some("ImportDeclaration") => {
                let source = node
                    .get("source")
                    .and_then(|s| s.get("value"))
                    .and_then(Value::as_str)
                    .unwrap_or_default()
                    .to_string();
                let target = self.nearest(enclosing, |k| k == ScopeKind::Program);
                for spec in arr(node, "specifiers") {
                    let Some(local) = spec.get("local") else {
                        continue;
                    };
                    let kind = match node_type(spec) {
                        Some("ImportNamespaceSpecifier") => ImportKind::Namespace,
                        Some("ImportDefaultSpecifier") => ImportKind::Default,
                        Some("ImportSpecifier") => ImportKind::Named,
                        _ => continue,
                    };
                    let imported = spec
                        .get("imported")
                        // `import { 'goto' as g }` spells the imported name as a
                        // string literal.
                        .and_then(|i| i.get("name").or_else(|| i.get("value")))
                        .and_then(Value::as_str)
                        .unwrap_or_else(|| ident_name(local).unwrap_or_default())
                        .to_string();
                    self.bind(
                        target,
                        local,
                        None,
                        Some(ImportInfo {
                            source: source.clone(),
                            kind,
                            imported,
                        }),
                    );
                }
            }
            _ => {}
        }
    }

    fn bind(
        &mut self,
        scope: usize,
        ident: &'a Value,
        init: Option<&'a Value>,
        import: Option<ImportInfo>,
    ) {
        let Some(name) = ident_name(ident) else {
            return;
        };
        if let Some(&existing) = self.scopes[scope].bindings.get(name) {
            self.bindings[existing].decls += 1;
            return;
        }
        let id = self.bindings.len();
        self.bindings.push(Binding {
            decls: 1,
            init,
            import,
        });
        self.scopes[scope].bindings.insert(name.to_string(), id);
    }

    fn nearest(&self, mut scope: usize, pred: impl Fn(ScopeKind) -> bool) -> usize {
        loop {
            if pred(self.scopes[scope].kind) {
                return scope;
            }
            match self.scopes[scope].parent {
                Some(p) => scope = p,
                None => return scope,
            }
        }
    }

    /// The binding an identifier occurrence resolves to, mirroring
    /// `findVariable` (including its `$store` → `store` retry).
    #[must_use]
    pub fn resolve(&self, ident: &Value) -> Option<&Binding<'a>> {
        let name = ident_name(ident)?;
        let scope = self.node_scope.get(&ptr(ident)).copied().unwrap_or(0);
        let id = self.lookup(name, scope).or_else(|| {
            name.strip_prefix('$')
                .and_then(|stripped| self.lookup(stripped, scope))
        })?;
        Some(&self.bindings[id])
    }

    fn lookup(&self, name: &str, mut scope: usize) -> Option<usize> {
        loop {
            if let Some(&id) = self.scopes[scope].bindings.get(name) {
                return Some(id);
            }
            match self.scopes[scope].parent {
                Some(p) => scope = p,
                None => break,
            }
        }
        // A template expression and the sibling `<script>` share the component's
        // module scope upstream; here they are separate subtrees, so every
        // program's top level is the fallback.
        self.programs
            .iter()
            .find_map(|&p| self.scopes[p].bindings.get(name).copied())
    }
}

fn scope_kind(node: &Value) -> Option<ScopeKind> {
    match node_type(node)? {
        "Program" => Some(ScopeKind::Program),
        "FunctionDeclaration"
        | "FunctionExpression"
        | "ArrowFunctionExpression"
        | "StaticBlock" => Some(ScopeKind::Function),
        "BlockStatement" | "ForStatement" | "ForInStatement" | "ForOfStatement" | "CatchClause"
        | "SwitchStatement" | "ClassDeclaration" | "ClassExpression" => Some(ScopeKind::Block),
        _ => None,
    }
}

fn pattern_idents<'a>(pattern: &'a Value, out: &mut Vec<&'a Value>) {
    match node_type(pattern) {
        Some("Identifier") => out.push(pattern),
        Some("ObjectPattern") => {
            for p in arr(pattern, "properties") {
                match node_type(p) {
                    Some("Property") => {
                        if let Some(v) = p.get("value") {
                            pattern_idents(v, out);
                        }
                    }
                    Some("RestElement") => {
                        if let Some(a) = p.get("argument") {
                            pattern_idents(a, out);
                        }
                    }
                    _ => {}
                }
            }
        }
        Some("ArrayPattern") => {
            for e in arr(pattern, "elements") {
                if !e.is_null() {
                    pattern_idents(e, out);
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(l) = pattern.get("left") {
                pattern_idents(l, out);
            }
        }
        Some("RestElement") => {
            if let Some(a) = pattern.get("argument") {
                pattern_idents(a, out);
            }
        }
        Some("TSParameterProperty") => {
            if let Some(p) = pattern.get("parameter") {
                pattern_idents(p, out);
            }
        }
        _ => {}
    }
}

/// Which `$app/navigation` entry point a call resolves to.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum NavKind {
    Goto,
    Push,
    Replace,
}

fn nav_kind_of(name: &str) -> Option<NavKind> {
    match name {
        "goto" => Some(NavKind::Goto),
        "pushState" => Some(NavKind::Push),
        "replaceState" => Some(NavKind::Replace),
        _ => None,
    }
}

/// The `$app/navigation` entry point a `CallExpression` invokes, if any.
///
/// Mirrors `ReferenceTracker.iterateEsmReferences`, which resolves a namespace
/// member through a literal computed key as well as a dotted one.
#[must_use]
pub fn nav_call_kind(idx: &ScopeIndex<'_>, call: &Value) -> Option<NavKind> {
    nav_expr_kind(idx, call.get("callee")?, &mut HashSet::new())
}

/// A value the `ReferenceTracker` would have propagated into: it unwraps the
/// same pass-through parents (`isPassThrough`) and follows a copy through a
/// declarator initializer, so `const alias = goto; alias('/x')` is a `goto` call
/// while `[goto][0]('/x')` — an array element, which the tracker does not
/// follow — is not.
fn nav_expr_kind(
    idx: &ScopeIndex<'_>,
    expr: &Value,
    visited: &mut HashSet<usize>,
) -> Option<NavKind> {
    match node_type(expr)? {
        "Identifier" => {
            if !visited.insert(ptr(expr)) {
                return None;
            }
            let binding = idx.resolve(expr)?;
            if let Some(import) = binding.import.as_ref() {
                if import.kind != ImportKind::Named || import.source != "$app/navigation" {
                    return None;
                }
                return nav_kind_of(&import.imported);
            }
            nav_expr_kind(idx, binding.init?, visited)
        }
        "MemberExpression" => {
            let object = expr.get("object")?;
            if !is_navigation_namespace(idx, object, visited) {
                return None;
            }
            nav_kind_of(member_key(expr)?)
        }
        "TSAsExpression"
        | "TSSatisfiesExpression"
        | "TSNonNullExpression"
        | "TSTypeAssertion"
        | "TSInstantiationExpression"
        | "ChainExpression" => nav_expr_kind(idx, expr.get("expression")?, visited),
        "SequenceExpression" => nav_expr_kind(
            idx,
            expr.get("expressions").and_then(Value::as_array)?.last()?,
            visited,
        ),
        "LogicalExpression" => nav_expr_kind(idx, expr.get("left")?, visited)
            .or_else(|| nav_expr_kind(idx, expr.get("right")?, visited)),
        "ConditionalExpression" => nav_expr_kind(idx, expr.get("consequent")?, visited)
            .or_else(|| nav_expr_kind(idx, expr.get("alternate")?, visited)),
        _ => None,
    }
}

/// Whether an expression is the `$app/navigation` namespace object — directly,
/// or through the copies the tracker follows.
fn is_navigation_namespace(
    idx: &ScopeIndex<'_>,
    expr: &Value,
    visited: &mut HashSet<usize>,
) -> bool {
    if node_type(expr) != Some("Identifier") {
        return false;
    }
    if !visited.insert(ptr(expr)) {
        return false;
    }
    let Some(binding) = idx.resolve(expr) else {
        return false;
    };
    if binding.import.is_some() {
        return binding.is_namespace_import("$app/navigation");
    }
    binding
        .init
        .is_some_and(|init| is_navigation_namespace(idx, init, visited))
}

/// The static property name a member expression reads (`ns.goto`, `ns['goto']`).
fn member_key(member: &Value) -> Option<&str> {
    let property = member.get("property")?;
    if member.get("computed").and_then(Value::as_bool) == Some(true) {
        if node_type(property) != Some("Literal") {
            return None;
        }
        property.get("value").and_then(Value::as_str)
    } else {
        ident_name(property)
    }
}

/// The identifier a URL expression is prefixed with, per upstream's
/// `extractExpressionPrefixVariable`.
pub enum PrefixVar<'a> {
    Ident(&'a Value),
    /// The member expression plus the property identifier it yielded.
    MemberProp(&'a Value, &'a Value),
}

#[must_use]
pub fn prefix_var<'a>(idx: &ScopeIndex<'a>, expr: &'a Value) -> Option<PrefixVar<'a>> {
    prefix_var_inner(idx, expr, &mut HashSet::new())
}

fn prefix_var_inner<'a>(
    idx: &ScopeIndex<'a>,
    expr: &'a Value,
    visited: &mut HashSet<usize>,
) -> Option<PrefixVar<'a>> {
    match node_type(expr) {
        Some("BinaryExpression") => {
            let left = expr
                .get("left")
                .filter(|l| node_type(l) != Some("PrivateIdentifier"))?;
            prefix_var_inner(idx, left, visited)
        }
        Some("Identifier") => {
            // `FindVariableContext` resolves each identifier at most once, so a
            // cyclic initializer chain stops at the identifier itself.
            let binding = visited
                .insert(ptr(expr))
                .then(|| idx.resolve(expr))
                .flatten();
            let init = binding.filter(|b| b.decls == 1).and_then(|b| b.init);
            match init {
                Some(init) => {
                    Some(prefix_var_inner(idx, init, visited).unwrap_or(PrefixVar::Ident(expr)))
                }
                None => Some(PrefixVar::Ident(expr)),
            }
        }
        Some("MemberExpression") => {
            let property = expr
                .get("property")
                .filter(|p| node_type(p) == Some("Identifier"))?;
            Some(PrefixVar::MemberProp(expr, property))
        }
        Some("TemplateLiteral") => {
            let first = template_first_part(expr)?;
            prefix_var_inner(idx, first, visited)
        }
        _ => None,
    }
}

/// The first non-empty part of a template literal, or `None` when that part is a
/// (non-empty) quasi. Mirrors `extractTemplateLiteralPrefixVariable`.
#[must_use]
pub fn template_first_part(tpl: &Value) -> Option<&Value> {
    let mut parts: Vec<(u64, bool, &Value)> = Vec::new();
    for q in arr(tpl, "quasis") {
        let raw_empty = q
            .get("value")
            .and_then(|v| v.get("raw"))
            .and_then(Value::as_str)
            .is_some_and(str::is_empty);
        parts.push((
            q.get("start").and_then(Value::as_u64).unwrap_or(0),
            raw_empty,
            q,
        ));
    }
    for e in arr(tpl, "expressions") {
        parts.push((
            e.get("start").and_then(Value::as_u64).unwrap_or(0),
            false,
            e,
        ));
    }
    parts.sort_by_key(|p| p.0);
    for (_, raw_empty, node) in parts {
        if node_type(node) == Some("TemplateElement") {
            if raw_empty {
                continue;
            }
            return None;
        }
        return Some(node);
    }
    None
}

/// Whether an identifier occurrence belongs to upstream's `basePathNames` set.
///
/// `namespace_member` enables the `import * as paths` + `paths.base` half of the
/// set, which only `no-navigation-without-base` builds — `no-goto-without-base`
/// crashes on that shape upstream (it casts the `MemberExpression` to an
/// `ImportSpecifier`), so it never has those nodes in its set.
#[must_use]
pub fn is_base_reference(
    idx: &ScopeIndex<'_>,
    prefix: &PrefixVar<'_>,
    namespace_member: bool,
) -> bool {
    match prefix {
        PrefixVar::Ident(node) => idx
            .resolve(node)
            .is_some_and(|b| b.is_named_import("$app/paths", "base")),
        PrefixVar::MemberProp(member, property) => {
            if member.get("computed").and_then(Value::as_bool) == Some(true) {
                // `obj[base]` yields a real reference to `base` as the prefix.
                return idx
                    .resolve(property)
                    .is_some_and(|b| b.is_named_import("$app/paths", "base"));
            }
            namespace_member
                && ident_name(property) == Some("base")
                && member
                    .get("object")
                    .filter(|o| node_type(o) == Some("Identifier"))
                    .and_then(|o| idx.resolve(o))
                    .is_some_and(|b| b.is_namespace_import("$app/paths"))
        }
    }
}

/// `expressionStartsWithBase`.
#[must_use]
pub fn starts_with_base(idx: &ScopeIndex<'_>, url: &Value, namespace_member: bool) -> bool {
    prefix_var(idx, url).is_some_and(|p| is_base_reference(idx, &p, namespace_member))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn program(body: Value) -> Value {
        json!({ "type": "Program", "body": body })
    }

    #[test]
    fn param_shadows_the_import() {
        // import { goto } from '$app/navigation'; function f(goto) { goto('/x'); }
        let root = program(json!([
            {
                "type": "ImportDeclaration",
                "source": { "type": "Literal", "value": "$app/navigation" },
                "specifiers": [{
                    "type": "ImportSpecifier",
                    "imported": { "type": "Identifier", "name": "goto" },
                    "local": { "type": "Identifier", "name": "goto" }
                }]
            },
            {
                "type": "FunctionDeclaration",
                "id": { "type": "Identifier", "name": "f" },
                "params": [{ "type": "Identifier", "name": "goto" }],
                "body": { "type": "BlockStatement", "body": [{
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": { "type": "Identifier", "name": "goto" },
                        "arguments": []
                    }
                }] }
            }
        ]));
        let idx = ScopeIndex::build(&root);
        let call = &root["body"][1]["body"]["body"][0]["expression"];
        assert!(nav_call_kind(&idx, call).is_none());
    }

    /// `ReferenceTracker` follows the import through a declarator initializer
    /// (`const alias = goto`) but not through an array element (`[goto][0]`).
    #[test]
    fn alias_copy_is_a_goto_call_but_an_array_element_is_not() {
        let root = program(json!([
            {
                "type": "ImportDeclaration",
                "source": { "type": "Literal", "value": "$app/navigation" },
                "specifiers": [{
                    "type": "ImportSpecifier",
                    "imported": { "type": "Identifier", "name": "goto" },
                    "local": { "type": "Identifier", "name": "goto" }
                }]
            },
            {
                "type": "VariableDeclaration", "kind": "const",
                "declarations": [{
                    "type": "VariableDeclarator",
                    "id": { "type": "Identifier", "name": "alias" },
                    "init": { "type": "Identifier", "name": "goto" }
                }]
            },
            {
                "type": "VariableDeclaration", "kind": "const",
                "declarations": [{
                    "type": "VariableDeclarator",
                    "id": { "type": "Identifier", "name": "list" },
                    "init": {
                        "type": "ArrayExpression",
                        "elements": [{ "type": "Identifier", "name": "goto" }]
                    }
                }]
            },
            { "type": "ExpressionStatement", "expression": {
                "type": "CallExpression",
                "callee": { "type": "Identifier", "name": "alias" },
                "arguments": [{ "type": "Literal", "value": "/via-copy" }]
            } },
            { "type": "ExpressionStatement", "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression", "computed": true,
                    "object": { "type": "Identifier", "name": "list" },
                    "property": { "type": "Literal", "value": 0 }
                },
                "arguments": [{ "type": "Literal", "value": "/via-array" }]
            } }
        ]));
        let idx = ScopeIndex::build(&root);
        assert!(nav_call_kind(&idx, &root["body"][3]["expression"]).is_some());
        assert!(nav_call_kind(&idx, &root["body"][4]["expression"]).is_none());
    }

    #[test]
    fn initializer_chasing_is_scope_local() {
        // const u = base + '/ok'; function f() { const u = '/plain'; /* u */ }
        let root = program(json!([
            {
                "type": "ImportDeclaration",
                "source": { "type": "Literal", "value": "$app/paths" },
                "specifiers": [{
                    "type": "ImportSpecifier",
                    "imported": { "type": "Identifier", "name": "base" },
                    "local": { "type": "Identifier", "name": "base" }
                }]
            },
            {
                "type": "VariableDeclaration", "kind": "const",
                "declarations": [{
                    "type": "VariableDeclarator",
                    "id": { "type": "Identifier", "name": "u" },
                    "init": {
                        "type": "BinaryExpression",
                        "left": { "type": "Identifier", "name": "base" },
                        "right": { "type": "Literal", "value": "/ok" }
                    }
                }]
            },
            {
                "type": "FunctionDeclaration",
                "id": { "type": "Identifier", "name": "f" },
                "params": [],
                "body": { "type": "BlockStatement", "body": [
                    {
                        "type": "VariableDeclaration", "kind": "const",
                        "declarations": [{
                            "type": "VariableDeclarator",
                            "id": { "type": "Identifier", "name": "u" },
                            "init": { "type": "Literal", "value": "/plain" }
                        }]
                    },
                    { "type": "ExpressionStatement", "expression": { "type": "Identifier", "name": "u" } }
                ] }
            },
            { "type": "ExpressionStatement", "expression": { "type": "Identifier", "name": "u" } }
        ]));
        let idx = ScopeIndex::build(&root);
        let inner = &root["body"][2]["body"]["body"][1]["expression"];
        let outer = &root["body"][3]["expression"];
        assert!(
            !starts_with_base(&idx, inner, true),
            "inner `u` is '/plain'"
        );
        assert!(
            starts_with_base(&idx, outer, true),
            "outer `u` is base-prefixed"
        );
    }
}
