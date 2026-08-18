//! Shared helpers for `svelte/store` rules.
//!
//! Shared helper for the `svelte/store` rules: resolve which call expressions
//! are store-creator calls (`writable` / `readable` / `derived`), accounting for
//! the import that binds them — direct (`import { writable }`), aliased
//! (`import { writable as w }`), and namespace
//! (`import * as store from 'svelte/store'` → `store.writable(...)`).
//!
//! Mirrors eslint-plugin-svelte's `extractStoreReferences` (ESM reference
//! tracking) for the ECMAScript case.

use std::collections::{HashMap, HashSet};

use serde_json::Value;

use crate::script::{node_end, node_start, node_type, walk_js};

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

fn canonical(name: &str) -> Option<&'static str> {
    match name {
        "writable" => Some("writable"),
        "readable" => Some("readable"),
        "derived" => Some("derived"),
        _ => None,
    }
}

/// The `svelte/store` creator bindings found in a program.
pub struct StoreCreators {
    /// local name → canonical creator name.
    direct: Vec<(String, &'static str)>,
    /// namespace import local names (`import * as X`).
    namespaces: Vec<String>,
}

impl StoreCreators {
    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.direct.is_empty() && self.namespaces.is_empty()
    }

    /// The canonical creator name (`writable`/`readable`/`derived`) if `callee`
    /// references a `svelte/store` creator, else `None`.
    pub fn creator_of(&self, callee: &Value) -> Option<&'static str> {
        match node_type(callee) {
            Some("Identifier") => {
                let n = ident_name(callee)?;
                self.direct
                    .iter()
                    .find(|(local, _)| local == n)
                    .map(|(_, c)| *c)
            }
            Some("MemberExpression") => {
                if callee.get("computed").and_then(Value::as_bool) == Some(true) {
                    return None;
                }
                let obj = callee.get("object")?;
                let o = ident_name(obj)?;
                if !self.namespaces.iter().any(|ns| ns == o) {
                    return None;
                }
                canonical(callee.get("property").and_then(ident_name)?)
            }
            _ => None,
        }
    }
}

/// Collect the `svelte/store` creator bindings declared in `program`.
#[must_use]
pub fn collect_store_creators(program: &Value) -> StoreCreators {
    let mut direct: Vec<(String, &'static str)> = Vec::new();
    let mut namespaces: Vec<String> = Vec::new();

    walk_js(program, |node, _| {
        if node_type(node) != Some("ImportDeclaration") {
            return;
        }
        if node
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(Value::as_str)
            != Some("svelte/store")
        {
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
                    if let Some(imp) = imported
                        && let Some(c) = canonical(imp)
                        && let Some(local) = spec.get("local").and_then(ident_name)
                    {
                        direct.push((local.to_string(), c));
                    }
                }
                Some("ImportNamespaceSpecifier") => {
                    if let Some(local) = spec.get("local").and_then(ident_name) {
                        namespaces.push(local.to_string());
                    }
                }
                _ => {}
            }
        }
    });

    StoreCreators { direct, namespaces }
}

/// Whether a node is an arrow/function expression.
#[must_use]
pub fn is_function_expr(node: &Value) -> bool {
    matches!(
        node_type(node),
        Some("ArrowFunctionExpression" | "FunctionExpression")
    )
}

// ---------------------------------------------------------------------------
// Reference tracker (port of `@eslint-community/eslint-utils` ReferenceTracker
// over the serialized ESTree JSON + an oxc-semantic symbol table per script).
//
// Upstream rules resolve names through the scope manager: an import binding is
// followed through const aliases (`const w = writable`), later assignments
// (`let m; m = writable`), namespace members with literal computed keys
// (`stores['writable']`), and template-expression references — while a local
// shadow (`function f(writable) { … }`) does NOT resolve to the import. The
// name-based scans this file used to offer cannot express any of that, so the
// tracker below mirrors the eslint-utils algorithm node for node.
// ---------------------------------------------------------------------------

fn ptr(v: &Value) -> usize {
    std::ptr::from_ref(v) as usize
}

/// A resolved variable: `(script index, dense symbol index)`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Var(usize, u32);

/// How a tracked reference is used (mirrors `ReferenceTracker.CALL` /
/// `CONSTRUCT` / `READ`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Access {
    Call,
    Construct,
    Read,
}

/// One node of a trace map (`{ [CALL]: …, key: {…} }` upstream).
#[derive(Debug, Default, Clone)]
pub struct Trace {
    pub call: bool,
    pub construct: bool,
    pub read: bool,
    pub children: Vec<(&'static str, Trace)>,
}

impl Trace {
    #[must_use]
    pub fn call() -> Self {
        Self {
            call: true,
            ..Self::default()
        }
    }
    #[must_use]
    pub fn construct() -> Self {
        Self {
            construct: true,
            ..Self::default()
        }
    }
    #[must_use]
    pub fn read() -> Self {
        Self {
            read: true,
            ..Self::default()
        }
    }
    #[must_use]
    pub fn parent(children: Vec<(&'static str, Trace)>) -> Self {
        Self {
            children,
            ..Self::default()
        }
    }
}

/// A tracked reference result.
pub struct Tracked<'a> {
    pub node: &'a Value,
    pub access: Access,
    /// The last trace-map key on the path (creator / class name).
    pub key: &'static str,
}

/// Per-script symbol table resolved by oxc-semantic. All spans are absolute
/// byte offsets into the component source.
struct ScriptTable {
    start: u32,
    end: u32,
    sym_names: Vec<String>,
    sym_is_root: Vec<bool>,
    /// Span of the whole declaration node (declarator / function / class /
    /// import specifier) — upstream's `variable.defs[].node` range.
    sym_decl_node_span: Vec<(u32, u32)>,
    sym_read_refs: Vec<Vec<u32>>,
    ref_sym: HashMap<u32, u32>,
    decl_sym: HashMap<u32, u32>,
    root_by_name: HashMap<String, u32>,
    unresolved_reads: HashMap<String, Vec<u32>>,
    unresolved_writes: HashSet<String>,
}

fn build_script_table(source: &str, program: &Value, is_ts: bool) -> Option<ScriptTable> {
    use oxc_allocator::Allocator;
    use oxc_ast::AstKind;
    use oxc_parser::{ParseOptions, Parser};
    use oxc_semantic::SemanticBuilder;
    use oxc_span::{GetSpan, SourceType};

    let start = node_start(program)?;
    let end = node_end(program)?;
    if start > end || end as usize > source.len() {
        return None;
    }
    let src = &source[start as usize..end as usize];

    let allocator = Allocator::default();
    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    let parser_ret = Parser::new(&allocator, src, source_type)
        .with_options(ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        })
        .parse();
    let oxc_program = allocator.alloc(parser_ret.program);
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(oxc_program)
        .semantic;
    let scoping = semantic.scoping();

    let mut table = ScriptTable {
        start,
        end,
        sym_names: Vec::new(),
        sym_is_root: Vec::new(),
        sym_decl_node_span: Vec::new(),
        sym_read_refs: Vec::new(),
        ref_sym: HashMap::new(),
        decl_sym: HashMap::new(),
        root_by_name: HashMap::new(),
        unresolved_reads: HashMap::new(),
        unresolved_writes: HashSet::new(),
    };

    let mut sym_index: HashMap<oxc_semantic::SymbolId, u32> = HashMap::new();
    let root_scope = scoping.root_scope_id();
    for symbol_id in scoping.symbol_ids() {
        let idx = u32::try_from(table.sym_names.len()).ok()?;
        sym_index.insert(symbol_id, idx);
        table
            .sym_names
            .push(scoping.symbol_name(symbol_id).to_string());
        let is_root = scoping.symbol_scope_id(symbol_id) == root_scope;
        table.sym_is_root.push(is_root);
        let decl_span = semantic
            .nodes()
            .get_node(scoping.symbol_declaration(symbol_id))
            .kind()
            .span();
        table
            .sym_decl_node_span
            .push((decl_span.start + start, decl_span.end + start));
        table.sym_read_refs.push(Vec::new());
        if is_root {
            table
                .root_by_name
                .entry(scoping.symbol_name(symbol_id).to_string())
                .or_insert(idx);
        }
    }

    for node in semantic.nodes().iter() {
        match node.kind() {
            AstKind::BindingIdentifier(ident) => {
                if let Some(symbol_id) = ident.symbol_id.get()
                    && let Some(&idx) = sym_index.get(&symbol_id)
                {
                    table.decl_sym.insert(ident.span.start + start, idx);
                }
            }
            AstKind::IdentifierReference(ident) => {
                let Some(reference_id) = ident.reference_id.get() else {
                    continue;
                };
                let reference = scoping.get_reference(reference_id);
                if reference.is_type() {
                    continue;
                }
                let abs = ident.span.start + start;
                if let Some(symbol_id) = reference.symbol_id() {
                    let Some(&idx) = sym_index.get(&symbol_id) else {
                        continue;
                    };
                    table.ref_sym.insert(abs, idx);
                    if reference.is_read() {
                        table.sym_read_refs[idx as usize].push(abs);
                    }
                } else {
                    if reference.is_read() {
                        table
                            .unresolved_reads
                            .entry(ident.name.to_string())
                            .or_default()
                            .push(abs);
                    }
                    if reference.is_write() {
                        table.unresolved_writes.insert(ident.name.to_string());
                    }
                }
            }
            _ => {}
        }
    }
    Some(table)
}

/// A script program to analyze.
pub struct ScriptInput<'a> {
    pub program: &'a Value,
    pub is_ts: bool,
}

/// The whole-file reference tracker: per-script symbol tables joined with
/// cross-script root-binding resolution and template-expression references.
pub struct RefTracker<'a> {
    programs: Vec<&'a Value>,
    tables: Vec<ScriptTable>,
    parents: HashMap<usize, &'a Value>,
    ident_at: HashMap<u32, &'a Value>,
    /// Template value references that resolve to a script root binding.
    template_rooted: HashMap<usize, Var>,
    template_refs_of_var: HashMap<Var, Vec<&'a Value>>,
    /// Unshadowed template value references that resolve to no script binding.
    template_unresolved: HashMap<String, Vec<&'a Value>>,
    /// Names shadowed anywhere in a template function scope — used only to keep
    /// `template_unresolved` honest; per-node suppression happened at build.
    template_unresolved_writes: HashSet<String>,
}

impl<'a> RefTracker<'a> {
    #[must_use]
    pub fn new(source: &str, scripts: &[ScriptInput<'a>], fragment: Option<&'a Value>) -> Self {
        let mut tracker = Self {
            programs: Vec::new(),
            tables: Vec::new(),
            parents: HashMap::new(),
            ident_at: HashMap::new(),
            template_rooted: HashMap::new(),
            template_refs_of_var: HashMap::new(),
            template_unresolved: HashMap::new(),
            template_unresolved_writes: HashSet::new(),
        };
        for input in scripts {
            let Some(table) = build_script_table(source, input.program, input.is_ts) else {
                continue;
            };
            tracker.programs.push(input.program);
            tracker.tables.push(table);
            tracker.index_tree(input.program);
        }
        if let Some(fragment) = fragment {
            tracker.index_tree(fragment);
            tracker.collect_template_refs(fragment);
        }
        tracker
    }

    fn index_tree(&mut self, tree: &'a Value) {
        let parents = &mut self.parents;
        let ident_at = &mut self.ident_at;
        walk_js(tree, |node, ancestors| {
            if let Some(&parent) = ancestors.last() {
                parents.insert(ptr(node), parent);
            }
            if node_type(node) == Some("Identifier")
                && let Some(start) = node_start(node)
            {
                ident_at.entry(start).or_insert(node);
            }
        });
    }

    /// The nearest enclosing AST node.
    #[must_use]
    pub fn parent_of(&self, node: &Value) -> Option<&'a Value> {
        self.parents.get(&ptr(node)).copied()
    }

    /// Resolve an identifier node to its variable, mirroring upstream
    /// `findVariable`: script identifiers resolve through oxc scopes (with
    /// cross-script joining of the two `<script>` top levels), template
    /// identifiers resolve to a script root binding unless a template function
    /// scope shadows the name.
    #[must_use]
    pub fn find_variable(&self, ident: &Value) -> Option<Var> {
        self.find_variable_at(ident, node_start(ident)?)
    }

    /// `find_variable` with an explicit reference offset, for nodes whose
    /// serialized `start` is not the identifier's own start — a computed
    /// property key carries the `[` position, which matches no oxc reference.
    #[must_use]
    pub fn find_variable_at(&self, ident: &Value, start: u32) -> Option<Var> {
        for (i, table) in self.tables.iter().enumerate() {
            if start < table.start || start >= table.end {
                continue;
            }
            if let Some(&sym) = table.ref_sym.get(&start) {
                return Some(Var(i, sym));
            }
            if let Some(&sym) = table.decl_sym.get(&start) {
                return Some(Var(i, sym));
            }
            let name = ident.get("name").and_then(Value::as_str)?;
            return self.cross_root(i, name);
        }
        self.template_rooted.get(&ptr(ident)).copied()
    }

    /// Whether the variable is a top-level (root scope) binding.
    #[must_use]
    pub fn is_root(&self, var: Var) -> bool {
        self.tables[var.0].sym_is_root[var.1 as usize]
    }

    /// The root binding named `name`, preferring the earlier script (instance
    /// before module) — how an unshadowed template name resolves.
    #[must_use]
    pub fn root_var_by_name(&self, name: &str) -> Option<Var> {
        for (i, table) in self.tables.iter().enumerate() {
            if let Some(&sym) = table.root_by_name.get(name) {
                return Some(Var(i, sym));
            }
        }
        None
    }

    /// The `[start, end)` span of the variable's declaration node.
    #[must_use]
    pub fn decl_node_span(&self, var: Var) -> (u32, u32) {
        self.tables[var.0].sym_decl_node_span[var.1 as usize]
    }

    fn cross_root(&self, from: usize, name: &str) -> Option<Var> {
        for (j, other) in self.tables.iter().enumerate() {
            if j != from
                && let Some(&sym) = other.root_by_name.get(name)
            {
                return Some(Var(j, sym));
            }
        }
        None
    }

    /// Every read-reference identifier node of `var`, in source order:
    /// same-script resolved reads, the other script's unresolved reads of a
    /// root binding's name, and unshadowed template references.
    #[must_use]
    pub fn read_references(&self, var: Var) -> Vec<&'a Value> {
        let table = &self.tables[var.0];
        let name = &table.sym_names[var.1 as usize];
        let mut starts: Vec<u32> = table.sym_read_refs[var.1 as usize].clone();
        if self.is_root(var) {
            for (j, other) in self.tables.iter().enumerate() {
                if j != var.0
                    && let Some(reads) = other.unresolved_reads.get(name)
                {
                    starts.extend(reads.iter().copied());
                }
            }
        }
        let mut nodes: Vec<&'a Value> = starts
            .into_iter()
            .filter_map(|s| self.ident_at.get(&s).copied())
            .collect();
        if let Some(template) = self.template_refs_of_var.get(&var) {
            nodes.extend(template.iter().copied());
        }
        nodes.sort_by_key(|n| node_start(n).unwrap_or(0));
        nodes.dedup_by_key(|n| ptr(n));
        nodes
    }

    /// Unresolved ("global") read-reference nodes of `name` across scripts and
    /// template — the references of an eslint global variable. `None` when the
    /// global is modified (assigned anywhere), mirroring `isModifiedGlobal`.
    fn global_read_nodes(&self, name: &str) -> Option<Vec<&'a Value>> {
        for table in &self.tables {
            if table.unresolved_writes.contains(name) {
                return None;
            }
        }
        if self.template_unresolved_writes.contains(name) {
            return None;
        }
        let mut nodes: Vec<&'a Value> = Vec::new();
        for (i, table) in self.tables.iter().enumerate() {
            if let Some(reads) = table.unresolved_reads.get(name) {
                for &s in reads {
                    // A read that joins the other script's top level is not a
                    // global reference.
                    if self.cross_root(i, name).is_some() {
                        continue;
                    }
                    if let Some(&node) = self.ident_at.get(&s) {
                        nodes.push(node);
                    }
                }
            }
        }
        if let Some(template) = self.template_unresolved.get(name) {
            nodes.extend(template.iter().copied());
        }
        nodes.sort_by_key(|n| node_start(n).unwrap_or(0));
        Some(nodes)
    }

    // --- template reference collection -----------------------------------

    fn collect_template_refs(&mut self, fragment: &'a Value) {
        let mut scopes: Vec<HashSet<String>> = Vec::new();
        let mut refs: Vec<(&'a Value, bool)> = Vec::new(); // (ident, shadowed)
        Self::template_walk(fragment, None, false, &mut scopes, &mut refs);
        for (node, shadowed) in refs {
            if shadowed {
                continue;
            }
            let Some(name) = node.get("name").and_then(Value::as_str) else {
                continue;
            };
            let mut resolved = None;
            for (i, table) in self.tables.iter().enumerate() {
                if let Some(&sym) = table.root_by_name.get(name) {
                    resolved = Some(Var(i, sym));
                    break;
                }
            }
            if let Some(var) = resolved {
                self.template_rooted.insert(ptr(node), var);
                self.template_refs_of_var.entry(var).or_default().push(node);
            } else {
                let is_write = self.parent_of(node).is_some_and(|p| {
                    node_type(p) == Some("AssignmentExpression")
                        && p.get("left").is_some_and(|l| ptr(l) == ptr(node))
                });
                if is_write {
                    self.template_unresolved_writes.insert(name.to_string());
                } else {
                    self.template_unresolved
                        .entry(name.to_string())
                        .or_default()
                        .push(node);
                }
            }
        }
    }

    /// Walk a template subtree collecting identifier value references, tracking
    /// function scopes (template block bindings — `{#each … as x}` etc. — are
    /// deliberately NOT scopes: the upstream scope manager cannot resolve them,
    /// so references to their names resolve to the script bindings).
    fn template_walk(
        node: &'a Value,
        parent_field: Option<(&str, &'a Value)>,
        in_binding: bool,
        scopes: &mut Vec<HashSet<String>>,
        refs: &mut Vec<(&'a Value, bool)>,
    ) {
        match node {
            Value::Array(arr) => {
                for v in arr {
                    Self::template_walk(v, parent_field, in_binding, scopes, refs);
                }
            }
            Value::Object(map) => {
                let ty = map.get("type").and_then(Value::as_str);
                if ty == Some("Identifier") {
                    if in_binding {
                        return;
                    }
                    if let Some((field, parent)) = parent_field
                        && !is_value_ref_position(field, parent)
                    {
                        return;
                    }
                    let name = map.get("name").and_then(Value::as_str).unwrap_or("");
                    let shadowed = scopes.iter().any(|s| s.contains(name));
                    refs.push((node, shadowed));
                    return;
                }
                let is_function = matches!(
                    ty,
                    Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration")
                );
                if is_function {
                    let mut declared = HashSet::new();
                    if let Some(params) = map.get("params") {
                        collect_binding_names(params, &mut declared);
                    }
                    if let Some(id) = map.get("id") {
                        collect_binding_names(id, &mut declared);
                    }
                    if let Some(body) = map.get("body") {
                        collect_declared_names(body, &mut declared);
                    }
                    scopes.push(declared);
                }
                for (k, v) in map {
                    if k == "loc" || skip_template_field(ty, k) {
                        continue;
                    }
                    // A binding-pattern subtree declares names instead of
                    // referencing them; default values (`AssignmentPattern`
                    // right) and computed keys flip back to reference mode.
                    let child_binding = if enters_binding_field(ty, k) {
                        true
                    } else if in_binding {
                        !(ty == Some("AssignmentPattern") && k == "right"
                            || ty == Some("Property")
                                && k == "key"
                                && map.get("computed").and_then(Value::as_bool) == Some(true))
                    } else {
                        false
                    };
                    Self::template_walk(v, Some((k, node)), child_binding, scopes, refs);
                }
                if is_function {
                    scopes.pop();
                }
            }
            _ => {}
        }
    }

    // --- the eslint-utils tracking algorithm ------------------------------

    /// `iterateEsmReferences` restricted to what the store rules need: the
    /// tracked results for `import … from '<module_id>'` under `trace`
    /// (whose children are the importable names).
    #[must_use]
    pub fn esm_refs(&self, module_id: &str, trace: &Trace) -> Vec<Tracked<'a>> {
        let mut out = Vec::new();
        let mut stack = Vec::new();
        for program in &self.programs {
            let Some(body) = program.get("body").and_then(Value::as_array) else {
                continue;
            };
            for stmt in body {
                if node_type(stmt) != Some("ImportDeclaration") {
                    continue;
                }
                if stmt
                    .get("source")
                    .and_then(|s| s.get("value"))
                    .and_then(Value::as_str)
                    != Some(module_id)
                {
                    continue;
                }
                let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) else {
                    continue;
                };
                for spec in specs {
                    match node_type(spec) {
                        Some("ImportSpecifier" | "ImportDefaultSpecifier") => {
                            let key = if node_type(spec) == Some("ImportDefaultSpecifier") {
                                Some("default")
                            } else {
                                spec.get("imported").and_then(|i| {
                                    i.get("name")
                                        .and_then(Value::as_str)
                                        .or_else(|| i.get("value").and_then(Value::as_str))
                                })
                            };
                            let Some((child_key, child)) = key.and_then(|k| {
                                trace
                                    .children
                                    .iter()
                                    .find(|(ck, _)| *ck == k)
                                    .map(|(ck, t)| (*ck, t))
                            }) else {
                                continue;
                            };
                            let Some(var) = spec.get("local").and_then(|l| self.find_variable(l))
                            else {
                                continue;
                            };
                            self.variable_refs(var, child, child_key, false, &mut out, &mut stack);
                        }
                        Some("ImportNamespaceSpecifier") => {
                            let Some(local) = spec.get("local") else {
                                continue;
                            };
                            let Some(var) = self.find_variable(local) else {
                                continue;
                            };
                            self.variable_refs(var, trace, "", false, &mut out, &mut stack);
                        }
                        _ => {}
                    }
                }
            }
        }
        out
    }

    /// `iterateGlobalReferences`: references of the global variables named by
    /// `trace.children`, plus the same names reached through the global-object
    /// members (`globalThis.Map`, `window.Map`, …).
    #[must_use]
    pub fn global_refs(&self, trace: &Trace) -> Vec<Tracked<'a>> {
        let mut out = Vec::new();
        let mut stack = Vec::new();
        for (key, child) in &trace.children {
            let Some(nodes) = self.global_read_nodes(key) else {
                continue;
            };
            for node in nodes {
                if child.read {
                    out.push(Tracked {
                        node,
                        access: Access::Read,
                        key,
                    });
                }
                self.prop_refs(node, child, key, &mut out, &mut stack);
            }
        }
        for global_object in ["global", "globalThis", "self", "window"] {
            let Some(nodes) = self.global_read_nodes(global_object) else {
                continue;
            };
            for node in nodes {
                self.prop_refs(node, trace, "", &mut out, &mut stack);
            }
        }
        out
    }

    /// `iteratePropertyReferences(node, trace)` — property uses reached from an
    /// expression node (e.g. mutations of a constructed instance).
    #[must_use]
    pub fn property_refs(&self, node: &'a Value, trace: &Trace) -> Vec<Tracked<'a>> {
        let mut out = Vec::new();
        let mut stack = Vec::new();
        self.prop_refs(node, trace, "", &mut out, &mut stack);
        out
    }

    fn variable_refs(
        &self,
        var: Var,
        trace: &Trace,
        key: &'static str,
        should_report: bool,
        out: &mut Vec<Tracked<'a>>,
        stack: &mut Vec<Var>,
    ) {
        if stack.contains(&var) {
            return;
        }
        stack.push(var);
        for node in self.read_references(var) {
            if should_report && trace.read {
                out.push(Tracked {
                    node,
                    access: Access::Read,
                    key,
                });
            }
            self.prop_refs(node, trace, key, out, stack);
        }
        stack.pop();
    }

    fn prop_refs(
        &self,
        root_node: &'a Value,
        trace: &Trace,
        key: &'static str,
        out: &mut Vec<Tracked<'a>>,
        stack: &mut Vec<Var>,
    ) {
        let mut node = root_node;
        loop {
            let Some(parent) = self.parent_of(node) else {
                return;
            };
            if is_pass_through(parent, node) {
                node = parent;
                continue;
            }
            match node_type(parent) {
                Some("MemberExpression") => {
                    if parent.get("object").is_some_and(|o| ptr(o) == ptr(node))
                        && let Some(prop_key) = member_property_name(parent)
                        && let Some((child_key, child)) = trace
                            .children
                            .iter()
                            .find(|(k, _)| *k == prop_key)
                            .map(|(k, t)| (*k, t))
                    {
                        if child.read {
                            out.push(Tracked {
                                node: parent,
                                access: Access::Read,
                                key: child_key,
                            });
                        }
                        self.prop_refs(parent, child, child_key, out, stack);
                    }
                }
                Some("CallExpression")
                    if trace.call && parent.get("callee").is_some_and(|c| ptr(c) == ptr(node)) =>
                {
                    out.push(Tracked {
                        node: parent,
                        access: Access::Call,
                        key,
                    });
                }
                Some("NewExpression")
                    if trace.construct
                        && parent.get("callee").is_some_and(|c| ptr(c) == ptr(node)) =>
                {
                    out.push(Tracked {
                        node: parent,
                        access: Access::Construct,
                        key,
                    });
                }
                Some("AssignmentExpression")
                    if parent.get("right").is_some_and(|r| ptr(r) == ptr(node)) =>
                {
                    if let Some(left) = parent.get("left") {
                        self.lhs_refs(left, trace, key, out, stack);
                    }
                    self.prop_refs(parent, trace, key, out, stack);
                }
                Some("AssignmentPattern") => {
                    if parent.get("right").is_some_and(|r| ptr(r) == ptr(node))
                        && let Some(left) = parent.get("left")
                    {
                        self.lhs_refs(left, trace, key, out, stack);
                    }
                }
                Some("VariableDeclarator") => {
                    if parent.get("init").is_some_and(|i| ptr(i) == ptr(node))
                        && let Some(id) = parent.get("id")
                    {
                        self.lhs_refs(id, trace, key, out, stack);
                    }
                }
                _ => {}
            }
            return;
        }
    }

    fn lhs_refs(
        &self,
        pattern: &'a Value,
        trace: &Trace,
        key: &'static str,
        out: &mut Vec<Tracked<'a>>,
        stack: &mut Vec<Var>,
    ) {
        match node_type(pattern) {
            Some("Identifier") => {
                if let Some(var) = self.find_variable(pattern) {
                    self.variable_refs(var, trace, key, false, out, stack);
                }
            }
            Some("ObjectPattern") => {
                let Some(props) = pattern.get("properties").and_then(Value::as_array) else {
                    return;
                };
                for prop in props {
                    if node_type(prop) != Some("Property") {
                        continue;
                    }
                    let Some(prop_key) = property_key_name(prop) else {
                        continue;
                    };
                    let Some((child_key, child)) = trace
                        .children
                        .iter()
                        .find(|(k, _)| *k == prop_key)
                        .map(|(k, t)| (*k, t))
                    else {
                        continue;
                    };
                    if child.read {
                        out.push(Tracked {
                            node: prop,
                            access: Access::Read,
                            key: child_key,
                        });
                    }
                    if let Some(value) = prop.get("value") {
                        self.lhs_refs(value, child, child_key, out, stack);
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = pattern.get("left") {
                    self.lhs_refs(left, trace, key, out, stack);
                }
            }
            _ => {}
        }
    }
}

/// `getPropertyName` for a MemberExpression: the identifier name when
/// non-computed, the static string value when computed.
#[must_use]
pub fn member_property_name(member: &Value) -> Option<String> {
    let prop = member.get("property")?;
    if member.get("computed").and_then(Value::as_bool) == Some(true) {
        static_string_value(prop)
    } else {
        match node_type(prop) {
            Some("Identifier") => prop.get("name").and_then(Value::as_str).map(str::to_string),
            _ => None,
        }
    }
}

/// `getPropertyName` for a Property node.
fn property_key_name(prop: &Value) -> Option<String> {
    let key = prop.get("key")?;
    if prop.get("computed").and_then(Value::as_bool) == Some(true) {
        static_string_value(key)
    } else {
        match node_type(key) {
            Some("Identifier") => key.get("name").and_then(Value::as_str).map(str::to_string),
            Some("Literal") => key.get("value").map(literal_to_string),
            _ => None,
        }
    }
}

/// `getStringIfConstant` limited to literal shapes (no scope resolution).
fn static_string_value(node: &Value) -> Option<String> {
    match node_type(node) {
        Some("Literal") => node.get("value").map(literal_to_string),
        Some("TemplateLiteral") => {
            let exprs = node.get("expressions").and_then(Value::as_array)?;
            if !exprs.is_empty() {
                return None;
            }
            let quasis = node.get("quasis").and_then(Value::as_array)?;
            quasis
                .first()
                .and_then(|q| q.get("value"))
                .and_then(|v| v.get("cooked"))
                .and_then(Value::as_str)
                .map(str::to_string)
        }
        _ => None,
    }
}

fn literal_to_string(value: &Value) -> String {
    match value {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => "null".to_string(),
        other => other.to_string(),
    }
}

/// `isPassThrough` from eslint-utils: the value of `node` flows to `parent`.
fn is_pass_through(parent: &Value, node: &Value) -> bool {
    match node_type(parent) {
        Some("ConditionalExpression") => {
            parent
                .get("consequent")
                .is_some_and(|c| ptr(c) == ptr(node))
                || parent.get("alternate").is_some_and(|a| ptr(a) == ptr(node))
        }
        Some("LogicalExpression") => true,
        Some("SequenceExpression") => parent
            .get("expressions")
            .and_then(Value::as_array)
            .and_then(|e| e.last())
            .is_some_and(|last| ptr(last) == ptr(node)),
        Some(
            "ChainExpression"
            | "TSAsExpression"
            | "TSSatisfiesExpression"
            | "TSTypeAssertion"
            | "TSNonNullExpression"
            | "TSInstantiationExpression"
            | "ParenthesizedExpression",
        ) => true,
        _ => false,
    }
}

/// Whether an Identifier at `field` of `parent` is a value reference (not a
/// non-computed member property, a non-computed object key, a label, or a
/// binding-pattern position).
fn is_value_ref_position(field: &str, parent: &Value) -> bool {
    let computed = parent.get("computed").and_then(Value::as_bool) == Some(true);
    match (node_type(parent), field) {
        (Some("MemberExpression"), "property") => computed,
        (Some("Property" | "PropertyDefinition" | "MethodDefinition"), "key") => computed,
        (Some("Property"), "value") => {
            // Destructuring-pattern values are bindings, but plain object
            // literal values are references — decided by the pattern walk
            // (binding subtrees are skipped before reaching here).
            true
        }
        (Some("VariableDeclarator"), "id") => false,
        (
            Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration"),
            "params" | "id",
        ) => false,
        (Some("CatchClause"), "param") => false,
        (Some("LabeledStatement" | "BreakStatement" | "ContinueStatement"), "label") => false,
        (Some("MetaProperty"), _) => false,
        (
            Some(
                "ImportSpecifier"
                | "ImportDefaultSpecifier"
                | "ImportNamespaceSpecifier"
                | "ExportSpecifier",
            ),
            _,
        ) => false,
        (Some("ArrayPattern" | "ObjectPattern" | "RestElement"), _) => false,
        (Some("AssignmentPattern"), "left") => false,
        _ => true,
    }
}

/// ESTree fields whose subtree is a binding pattern (declaration positions).
fn enters_binding_field(node_ty: Option<&str>, field: &str) -> bool {
    matches!(
        (node_ty, field),
        (Some("VariableDeclarator"), "id")
            | (Some("CatchClause"), "param")
            | (
                Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration"),
                "params" | "id"
            )
    )
}

/// Template-node fields that hold binding patterns, not references.
fn skip_template_field(node_ty: Option<&str>, field: &str) -> bool {
    matches!(
        (node_ty, field),
        (Some("EachBlock"), "context" | "index")
            | (Some("AwaitBlock"), "value" | "error")
            | (Some("SnippetBlock"), "parameters")
            | (Some("LetDirective"), "expression" | "name")
    )
}

/// Collect binding identifier names from a pattern subtree (params, ids).
fn collect_binding_names(node: &Value, out: &mut HashSet<String>) {
    match node {
        Value::Array(arr) => {
            for v in arr {
                collect_binding_names(v, out);
            }
        }
        Value::Object(map) => match map.get("type").and_then(Value::as_str) {
            Some("Identifier") => {
                if let Some(n) = map.get("name").and_then(Value::as_str) {
                    out.insert(n.to_string());
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = map.get("properties").and_then(Value::as_array) {
                    for p in props {
                        match node_type(p) {
                            Some("Property") => {
                                if let Some(v) = p.get("value") {
                                    collect_binding_names(v, out);
                                }
                            }
                            Some("RestElement") => {
                                if let Some(a) = p.get("argument") {
                                    collect_binding_names(a, out);
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(els) = map.get("elements").and_then(Value::as_array) {
                    for e in els {
                        collect_binding_names(e, out);
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(l) = map.get("left") {
                    collect_binding_names(l, out);
                }
            }
            Some("RestElement") => {
                if let Some(a) = map.get("argument") {
                    collect_binding_names(a, out);
                }
            }
            _ => {}
        },
        _ => {}
    }
}

/// Collect names declared by `var`/`let`/`const`/`function`/`class` anywhere in
/// a function body subtree (over-approximates block scoping to the function).
fn collect_declared_names(node: &Value, out: &mut HashSet<String>) {
    walk_js(node, |n, _| match node_type(n) {
        Some("VariableDeclarator") => {
            if let Some(id) = n.get("id") {
                collect_binding_names(id, out);
            }
        }
        Some("FunctionDeclaration" | "ClassDeclaration") => {
            if let Some(id) = n.get("id") {
                collect_binding_names(id, out);
            }
        }
        _ => {}
    });
}

/// Build the tracker for a component from the shared root JSON (both scripts +
/// the template fragment).
#[must_use]
pub fn component_tracker<'a>(
    source: &str,
    root: &rsvelte_core::ast::template::Root,
    root_json: &'a Value,
) -> RefTracker<'a> {
    let mut scripts = Vec::new();
    if let Some(s) = root.instance.as_ref()
        && let Some(program) = root_json.get("instance").and_then(|i| i.get("content"))
    {
        scripts.push(ScriptInput {
            program,
            is_ts: s.is_typescript,
        });
    }
    if let Some(s) = root.module.as_ref()
        && let Some(program) = root_json.get("module").and_then(|m| m.get("content"))
    {
        scripts.push(ScriptInput {
            program,
            is_ts: s.is_typescript,
        });
    }
    RefTracker::new(source, &scripts, root_json.get("fragment"))
}

/// Build the tracker for a standalone `.svelte.(js|ts)` / `.js` / `.ts`
/// module program (no template).
#[must_use]
pub fn module_tracker<'a>(source: &str, program: &'a Value, is_ts: bool) -> RefTracker<'a> {
    RefTracker::new(source, &[ScriptInput { program, is_ts }], None)
}

/// Whether a standalone module file is TypeScript.
#[must_use]
pub fn module_is_ts(filename: &str) -> bool {
    matches!(
        crate::engine::classify_source(filename),
        crate::engine::SourceKind::Module { ts: true }
    )
}

/// Whether this file's whole-component pass (`check_root`) owns the analysis —
/// a dual-registered rule's `check_program` must then skip, leaving only
/// standalone JS/TS modules to the script pass.
#[must_use]
pub fn handled_by_template_pass(filename: &str) -> bool {
    matches!(
        crate::engine::classify_source(filename),
        crate::engine::SourceKind::Svelte
    )
}

/// The `svelte/store` creator trace: `writable` / `readable` / `derived` as
/// CALL entries, filtered to `names`.
#[must_use]
pub fn store_creator_trace(names: &[&str]) -> Trace {
    Trace::parent(
        ["writable", "readable", "derived"]
            .into_iter()
            .filter(|n| names.contains(n))
            .map(|n| (n, Trace::call()))
            .collect(),
    )
}

/// All `svelte/store` creator calls (with the canonical creator name) reachable
/// through the tracker.
#[must_use]
pub fn store_creator_calls<'a>(
    tracker: &RefTracker<'a>,
    names: &[&str],
) -> Vec<(&'a Value, &'static str)> {
    let trace = store_creator_trace(names);
    let mut calls: Vec<(&'a Value, &'static str)> = tracker
        .esm_refs("svelte/store", &trace)
        .into_iter()
        .filter(|t| t.access == Access::Call)
        .map(|t| (t.node, t.key))
        .collect();
    calls.sort_by_key(|(n, _)| node_start(n).unwrap_or(0));
    calls.dedup_by_key(|(n, _)| ptr(n));
    calls
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn prog_with_import(spec: Value) -> Value {
        json!({ "type": "Program", "body": [
            { "type": "ImportDeclaration",
              "source": { "type": "Literal", "value": "svelte/store" },
              "specifiers": [spec] }
        ] })
    }

    #[test]
    fn resolves_direct_and_aliased() {
        let p = prog_with_import(json!({
            "type": "ImportSpecifier",
            "imported": { "type": "Identifier", "name": "writable" },
            "local": { "type": "Identifier", "name": "w" }
        }));
        let c = collect_store_creators(&p);
        assert_eq!(
            c.creator_of(&json!({ "type": "Identifier", "name": "w" })),
            Some("writable")
        );
        assert_eq!(
            c.creator_of(&json!({ "type": "Identifier", "name": "x" })),
            None
        );
    }

    #[test]
    fn resolves_namespace() {
        let p = prog_with_import(json!({
            "type": "ImportNamespaceSpecifier",
            "local": { "type": "Identifier", "name": "store" }
        }));
        let c = collect_store_creators(&p);
        let callee = json!({ "type": "MemberExpression", "computed": false,
            "object": { "type": "Identifier", "name": "store" },
            "property": { "type": "Identifier", "name": "derived" } });
        assert_eq!(c.creator_of(&callee), Some("derived"));
    }
}
