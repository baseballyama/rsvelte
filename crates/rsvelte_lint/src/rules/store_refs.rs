//! Shared helpers for `svelte/store` rules.
//!
//! Resolve which call expressions are store-creator calls (`writable` /
//! `readable` / `derived`) by following the binding that names them: direct
//! (`import { writable }`), aliased (`import { writable as w }`), const-aliased
//! (`const w = writable`), destructured, and namespace members including
//! constant-folded computed keys (`ns['writ' + 'able']`).
//!
//! Mirrors eslint-plugin-svelte's `extractStoreReferences` — the
//! `@eslint-community/eslint-utils` `ReferenceTracker` — for the ECMAScript case.

use std::collections::{HashMap, HashSet};

use serde_json::Value;

use crate::script::{node_end, node_start, node_type, walk_js};

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

/// Script index marking a template-local binding — `{#each … as x}`,
/// `{@const}`, a snippet parameter, `let:x`, or a declaration inside a template
/// expression. These have no oxc symbol table, so the tracker keeps its own.
const TEMPLATE_SCOPE: usize = usize::MAX;

/// A template-local binding and the identifiers that read it.
struct TemplateVar<'a> {
    decl_span: (u32, u32),
    reads: Vec<&'a Value>,
}

/// Scan state for the template walk: a lexical scope stack over the bindings
/// declared by the Svelte block binders and by JS inside template expressions.
struct TemplateScan<'a> {
    scopes: Vec<HashMap<String, u32>>,
    vars: Vec<TemplateVar<'a>>,
    /// Binding identifier node → its template variable.
    decl_of: Vec<(&'a Value, u32)>,
    /// Value reference and the template variable it resolves to, `None` when no
    /// template scope binds the name.
    refs: Vec<(&'a Value, Option<u32>)>,
}

impl<'a> TemplateScan<'a> {
    fn new() -> Self {
        Self {
            scopes: Vec::new(),
            vars: Vec::new(),
            decl_of: Vec::new(),
            refs: Vec::new(),
        }
    }

    fn open(&mut self, binders: &Binders<'a>) {
        let mut scope: HashMap<String, u32> = HashMap::new();
        let mut idents: Vec<&'a Value> = Vec::new();
        for pattern in &binders.patterns {
            collect_binding_idents(pattern, &mut idents);
        }
        for ident in idents {
            let Some(name) = ident.get("name").and_then(Value::as_str) else {
                continue;
            };
            let span = (node_start(ident).unwrap_or(0), node_end(ident).unwrap_or(0));
            let idx = self.declare(&mut scope, name, span);
            self.decl_of.push((ident, idx));
        }
        for (name, span) in &binders.bare {
            self.declare(&mut scope, name, *span);
        }
        self.scopes.push(scope);
    }

    fn declare(&mut self, scope: &mut HashMap<String, u32>, name: &str, span: (u32, u32)) -> u32 {
        if let Some(&idx) = scope.get(name) {
            return idx;
        }
        let idx = u32::try_from(self.vars.len()).unwrap_or(u32::MAX);
        self.vars.push(TemplateVar {
            decl_span: span,
            reads: Vec::new(),
        });
        scope.insert(name.to_string(), idx);
        idx
    }

    fn close(&mut self) {
        self.scopes.pop();
    }

    fn resolve(&self, name: &str) -> Option<u32> {
        self.scopes.iter().rev().find_map(|s| s.get(name).copied())
    }
}

/// The bindings a scope-opening node introduces: binding-pattern subtrees plus
/// names that exist only as strings (`{#each … as x, i}`, `let:x`).
struct Binders<'n> {
    patterns: Vec<&'n Value>,
    bare: Vec<(String, (u32, u32))>,
}

impl Binders<'_> {
    fn names(&self) -> HashSet<String> {
        let mut idents = Vec::new();
        for pattern in &self.patterns {
            collect_binding_idents(pattern, &mut idents);
        }
        let mut out: HashSet<String> = idents
            .into_iter()
            .filter_map(|i| i.get("name").and_then(Value::as_str).map(str::to_string))
            .collect();
        out.extend(self.bare.iter().map(|(n, _)| n.clone()));
        out
    }
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
    /// Template-local bindings and the identifier nodes that resolve to them.
    template_vars: Vec<TemplateVar<'a>>,
    template_local: HashMap<usize, Var>,
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
            template_vars: Vec::new(),
            template_local: HashMap::new(),
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
        self.template_local
            .get(&ptr(ident))
            .or_else(|| self.template_rooted.get(&ptr(ident)))
            .copied()
    }

    /// Whether the variable is a top-level (root scope) binding.
    #[must_use]
    pub fn is_root(&self, var: Var) -> bool {
        var.0 != TEMPLATE_SCOPE && self.tables[var.0].sym_is_root[var.1 as usize]
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
        if var.0 == TEMPLATE_SCOPE {
            return self.template_vars[var.1 as usize].decl_span;
        }
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
        if var.0 == TEMPLATE_SCOPE {
            let mut nodes = self.template_vars[var.1 as usize].reads.clone();
            nodes.sort_by_key(|n| node_start(n).unwrap_or(0));
            nodes.dedup_by_key(|n| ptr(n));
            return nodes;
        }
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
        let mut scan = TemplateScan::new();
        Self::template_walk(fragment, None, false, &mut scan);
        self.template_vars = scan.vars;
        for (ident, idx) in scan.decl_of {
            self.template_local
                .insert(ptr(ident), Var(TEMPLATE_SCOPE, idx));
        }
        for (node, local) in scan.refs {
            if let Some(idx) = local {
                self.template_local
                    .insert(ptr(node), Var(TEMPLATE_SCOPE, idx));
                self.template_vars[idx as usize].reads.push(node);
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

    /// Walk a template subtree collecting identifier value references under a
    /// lexical scope stack: Svelte block binders (`{#each … as x}`, `{#await …
    /// then x}`, `{#snippet f(x)}`, `{@const x = …}`, `let:x`) scope their own
    /// region, and JS expressions inside them get real block scoping.
    fn template_walk(
        node: &'a Value,
        parent_field: Option<(&str, &'a Value)>,
        in_binding: bool,
        scan: &mut TemplateScan<'a>,
    ) {
        match node {
            Value::Array(arr) => {
                for v in arr {
                    Self::template_walk(v, parent_field, in_binding, scan);
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
                    let local = scan.resolve(name);
                    scan.refs.push((node, local));
                    return;
                }
                if Self::walk_svelte_binder(node, map, ty, scan) {
                    return;
                }
                let pushed = js_scope_binders(map, ty)
                    .inspect(|b| scan.open(b))
                    .is_some();
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
                    Self::template_walk(v, Some((k, node)), child_binding, scan);
                }
                if pushed {
                    scan.close();
                }
            }
            _ => {}
        }
    }

    /// Handle the Svelte nodes that bind names over part of their own subtree.
    /// Returns `true` when the node was walked here (the generic walk must not
    /// repeat it).
    fn walk_svelte_binder(
        node: &'a Value,
        map: &'a serde_json::Map<String, Value>,
        ty: Option<&str>,
        scan: &mut TemplateScan<'a>,
    ) -> bool {
        let walk = |field: &'static str, scan: &mut TemplateScan<'a>| {
            if let Some(v) = map.get(field) {
                Self::template_walk(v, Some((field, node)), false, scan);
            }
        };
        match ty {
            // `{@const}` declares for the whole enclosing fragment.
            Some("Fragment") => {
                scan.open(&const_tag_binders(map));
                walk("nodes", scan);
                scan.close();
            }
            Some("EachBlock") => {
                walk("expression", scan);
                scan.open(&each_binders(map));
                walk("body", scan);
                walk("key", scan);
                scan.close();
                walk("fallback", scan);
            }
            Some("AwaitBlock") => {
                walk("expression", scan);
                walk("pending", scan);
                for (binder, branch) in [("value", "then"), ("error", "catch")] {
                    scan.open(&await_binders(map, binder));
                    walk(branch, scan);
                    scan.close();
                }
            }
            // `expression` is the snippet's own name — a declaration.
            Some("SnippetBlock") => {
                scan.open(&snippet_binders(map));
                walk("body", scan);
                scan.close();
            }
            // An element whose `let:` directives bind over its children.
            _ if map.contains_key("fragment") && map.contains_key("attributes") => {
                for (k, v) in map {
                    if k == "loc" || k == "fragment" {
                        continue;
                    }
                    Self::template_walk(v, Some((k, node)), false, scan);
                }
                scan.open(&let_binders(map));
                walk("fragment", scan);
                scan.close();
            }
            _ => return false,
        }
        true
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
            Some("Literal") => literal_static_value(key).map(|v| v.to_js_string()),
            _ => None,
        }
    }
}

/// `getStringIfConstant`: the folded value of a constant expression, stringified.
/// Scope resolution is deliberately absent — `getPropertyName` is called from the
/// reference tracker without an `initialScope`, so an Identifier never folds.
fn static_string_value(node: &Value) -> Option<String> {
    if node_type(node) == Some("Literal") {
        if let Some(regex) = node.get("regex") {
            let pattern = regex.get("pattern").and_then(Value::as_str)?;
            let flags = regex.get("flags").and_then(Value::as_str).unwrap_or("");
            return Some(format!("/{pattern}/{flags}"));
        }
        if let Some(bigint) = node.get("bigint").and_then(Value::as_str) {
            return Some(bigint.to_string());
        }
    }
    static_value(node).map(|v| v.to_js_string())
}

/// A folded value (`getStaticValue`'s `{ value }`). `Obj` carries no properties
/// because the only thing a folded object is ever asked for here is `String(v)`.
#[derive(Debug, Clone, PartialEq)]
enum StaticValue {
    Str(String),
    Num(f64),
    Bool(bool),
    Null,
    Undefined,
    Arr(Vec<StaticValue>),
    Obj,
}

impl StaticValue {
    fn to_js_string(&self) -> String {
        match self {
            Self::Str(s) => s.clone(),
            Self::Num(n) => js_number_to_string(*n),
            Self::Bool(b) => b.to_string(),
            Self::Null => "null".to_string(),
            Self::Undefined => "undefined".to_string(),
            Self::Arr(items) => items
                .iter()
                .map(|v| match v {
                    Self::Null | Self::Undefined => String::new(),
                    other => other.to_js_string(),
                })
                .collect::<Vec<_>>()
                .join(","),
            Self::Obj => "[object Object]".to_string(),
        }
    }

    fn to_number(&self) -> f64 {
        match self {
            Self::Str(_) | Self::Arr(_) => {
                let s = self.to_js_string();
                let t = s.trim();
                if t.is_empty() {
                    0.0
                } else {
                    t.parse::<f64>().unwrap_or(f64::NAN)
                }
            }
            Self::Num(n) => *n,
            Self::Bool(b) => f64::from(u8::from(*b)),
            Self::Null => 0.0,
            Self::Undefined | Self::Obj => f64::NAN,
        }
    }

    fn to_boolean(&self) -> bool {
        match self {
            Self::Str(s) => !s.is_empty(),
            Self::Num(n) => *n != 0.0 && !n.is_nan(),
            Self::Bool(b) => *b,
            Self::Null | Self::Undefined => false,
            Self::Arr(_) | Self::Obj => true,
        }
    }

    fn type_of(&self) -> &'static str {
        match self {
            Self::Str(_) => "string",
            Self::Num(_) => "number",
            Self::Bool(_) => "boolean",
            Self::Null | Self::Arr(_) | Self::Obj => "object",
            Self::Undefined => "undefined",
        }
    }
}

fn js_number_to_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".to_string();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.to_string();
    }
    if n == 0.0 {
        return "0".to_string();
    }
    if n.fract() == 0.0 && n.abs() < 1e21 {
        return format!("{n:.0}");
    }
    format!("{n}")
}

#[expect(clippy::cast_possible_truncation, reason = "ToInt32 truncates by spec")]
fn to_int32(v: &StaticValue) -> i32 {
    let n = v.to_number();
    if !n.is_finite() {
        return 0;
    }
    (n.trunc() as i64 & 0xffff_ffff) as u32 as i32
}

fn literal_static_value(node: &Value) -> Option<StaticValue> {
    match node.get("value")? {
        Value::String(s) => Some(StaticValue::Str(s.clone())),
        Value::Number(n) => n.as_f64().map(StaticValue::Num),
        Value::Bool(b) => Some(StaticValue::Bool(*b)),
        Value::Null => Some(StaticValue::Null),
        _ => None,
    }
}

/// `getStaticValue(node, null)`. `Identifier`, `CallExpression`, `NewExpression`
/// and `MemberExpression` fold to nothing precisely because they need a scope.
fn static_value(node: &Value) -> Option<StaticValue> {
    match node_type(node)? {
        "Literal" => literal_static_value(node),
        "TemplateLiteral" => {
            let quasis = node.get("quasis").and_then(Value::as_array)?;
            let exprs = node.get("expressions").and_then(Value::as_array)?;
            let cooked = |q: &Value| -> Option<String> {
                q.get("value")
                    .and_then(|v| v.get("cooked"))
                    .and_then(Value::as_str)
                    .map(str::to_string)
            };
            let mut out = cooked(quasis.first()?)?;
            for (i, expr) in exprs.iter().enumerate() {
                out.push_str(&static_value(expr)?.to_js_string());
                out.push_str(&cooked(quasis.get(i + 1)?)?);
            }
            Some(StaticValue::Str(out))
        }
        "BinaryExpression" => {
            let op = node.get("operator").and_then(Value::as_str)?;
            let left = static_value(node.get("left")?)?;
            let right = static_value(node.get("right")?)?;
            static_binary(op, &left, &right)
        }
        "UnaryExpression" => {
            let op = node.get("operator").and_then(Value::as_str)?;
            if op == "void" {
                return Some(StaticValue::Undefined);
            }
            let arg = static_value(node.get("argument")?)?;
            match op {
                "-" => Some(StaticValue::Num(-arg.to_number())),
                "+" => Some(StaticValue::Num(arg.to_number())),
                "!" => Some(StaticValue::Bool(!arg.to_boolean())),
                "~" => Some(StaticValue::Num(f64::from(!to_int32(&arg)))),
                "typeof" => Some(StaticValue::Str(arg.type_of().to_string())),
                _ => None,
            }
        }
        "LogicalExpression" => {
            let op = node.get("operator").and_then(Value::as_str)?;
            let left = static_value(node.get("left")?)?;
            let short = match op {
                "||" => left.to_boolean(),
                "&&" => !left.to_boolean(),
                "??" => !matches!(left, StaticValue::Null | StaticValue::Undefined),
                _ => return None,
            };
            if short {
                return Some(left);
            }
            static_value(node.get("right")?)
        }
        "ConditionalExpression" => {
            let test = static_value(node.get("test")?)?;
            if test.to_boolean() {
                static_value(node.get("consequent")?)
            } else {
                static_value(node.get("alternate")?)
            }
        }
        "SequenceExpression" => {
            static_value(node.get("expressions").and_then(Value::as_array)?.last()?)
        }
        "ArrayExpression" => {
            let mut items = Vec::new();
            for el in node.get("elements").and_then(Value::as_array)? {
                if el.is_null() {
                    items.push(StaticValue::Undefined);
                } else if node_type(el) == Some("SpreadElement") {
                    match static_value(el.get("argument")?)? {
                        StaticValue::Arr(inner) => items.extend(inner),
                        _ => return None,
                    }
                } else {
                    items.push(static_value(el)?);
                }
            }
            Some(StaticValue::Arr(items))
        }
        "ObjectExpression" => {
            // `String(obj)` is "[object Object]" unless the literal overrides
            // `toString`/`valueOf`, which upstream would have to call.
            for prop in node.get("properties").and_then(Value::as_array)? {
                match node_type(prop) {
                    Some("Property") => {
                        if prop.get("kind").and_then(Value::as_str) != Some("init") {
                            return None;
                        }
                        let key = property_key_name(prop)?;
                        if key == "toString" || key == "valueOf" {
                            return None;
                        }
                        static_value(prop.get("value")?)?;
                    }
                    Some("SpreadElement") => {
                        static_value(prop.get("argument")?)?;
                    }
                    _ => return None,
                }
            }
            Some(StaticValue::Obj)
        }
        "ChainExpression" => static_value(node.get("expression")?),
        "ExpressionStatement" => static_value(node.get("expression")?),
        "AssignmentExpression" if node.get("operator").and_then(Value::as_str) == Some("=") => {
            static_value(node.get("right")?)
        }
        _ => None,
    }
}

fn static_binary(op: &str, l: &StaticValue, r: &StaticValue) -> Option<StaticValue> {
    let num = |f: fn(f64, f64) -> f64| StaticValue::Num(f(l.to_number(), r.to_number()));
    Some(match op {
        "+" => {
            if matches!(l, StaticValue::Str(_)) || matches!(r, StaticValue::Str(_)) {
                StaticValue::Str(format!("{}{}", l.to_js_string(), r.to_js_string()))
            } else {
                StaticValue::Num(l.to_number() + r.to_number())
            }
        }
        "-" => num(|a, b| a - b),
        "*" => num(|a, b| a * b),
        "/" => num(|a, b| a / b),
        "%" => num(|a, b| a % b),
        "**" => num(f64::powf),
        "===" => StaticValue::Bool(strict_eq(l, r)),
        "!==" => StaticValue::Bool(!strict_eq(l, r)),
        "==" => StaticValue::Bool(loose_eq(l, r)),
        "!=" => StaticValue::Bool(!loose_eq(l, r)),
        "<" | "<=" | ">" | ">=" => StaticValue::Bool(static_compare(op, l, r)),
        "&" => StaticValue::Num(f64::from(to_int32(l) & to_int32(r))),
        "|" => StaticValue::Num(f64::from(to_int32(l) | to_int32(r))),
        "^" => StaticValue::Num(f64::from(to_int32(l) ^ to_int32(r))),
        "<<" => StaticValue::Num(f64::from(to_int32(l) << (to_int32(r) & 31))),
        ">>" => StaticValue::Num(f64::from(to_int32(l) >> (to_int32(r) & 31))),
        ">>>" => StaticValue::Num(f64::from(
            #[expect(clippy::cast_sign_loss, reason = "ToUint32 reinterprets the bits")]
            {
                (to_int32(l) as u32) >> (to_int32(r) & 31)
            },
        )),
        _ => return None,
    })
}

fn strict_eq(l: &StaticValue, r: &StaticValue) -> bool {
    match (l, r) {
        (StaticValue::Str(a), StaticValue::Str(b)) => a == b,
        (StaticValue::Num(a), StaticValue::Num(b)) => a == b,
        (StaticValue::Bool(a), StaticValue::Bool(b)) => a == b,
        (StaticValue::Null, StaticValue::Null)
        | (StaticValue::Undefined, StaticValue::Undefined) => true,
        _ => false,
    }
}

fn loose_eq(l: &StaticValue, r: &StaticValue) -> bool {
    match (l, r) {
        (
            StaticValue::Null | StaticValue::Undefined,
            StaticValue::Null | StaticValue::Undefined,
        ) => true,
        (StaticValue::Null | StaticValue::Undefined, _)
        | (_, StaticValue::Null | StaticValue::Undefined) => false,
        (StaticValue::Str(a), StaticValue::Str(b)) => a == b,
        _ => {
            let (a, b) = (l.to_number(), r.to_number());
            a == b
        }
    }
}

fn static_compare(op: &str, l: &StaticValue, r: &StaticValue) -> bool {
    if let (StaticValue::Str(a), StaticValue::Str(b)) = (l, r) {
        return match op {
            "<" => a < b,
            "<=" => a <= b,
            ">" => a > b,
            _ => a >= b,
        };
    }
    let (a, b) = (l.to_number(), r.to_number());
    match op {
        "<" => a < b,
        "<=" => a <= b,
        ">" => a > b,
        _ => a >= b,
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
        (Some("VariableDeclarator"), "id")
        | (Some("ClassDeclaration" | "ClassExpression"), "id") => false,
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

/// Template-node fields that hold binding patterns, not references. The other
/// binders (`EachBlock`, `AwaitBlock`, `SnippetBlock`) are walked field by field
/// by `walk_svelte_binder`, which never descends into their patterns.
fn skip_template_field(node_ty: Option<&str>, field: &str) -> bool {
    matches!(
        (node_ty, field),
        (Some("LetDirective"), "expression" | "name")
    )
}

/// The bindings a JS scope-opening node introduces. Function scopes hold params
/// plus `var` hoists; blocks, catch clauses, loop heads and switch bodies hold
/// only their own `let`/`const`/`class`/`function` declarations.
fn js_scope_binders<'n>(
    map: &'n serde_json::Map<String, Value>,
    ty: Option<&str>,
) -> Option<Binders<'n>> {
    let mut patterns: Vec<&'n Value> = Vec::new();
    match ty? {
        "FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration" => {
            patterns.extend(map.get("params"));
            patterns.extend(map.get("id"));
            if let Some(body) = map.get("body") {
                collect_var_decl_ids(body, &mut patterns);
            }
        }
        "BlockStatement" | "StaticBlock" => {
            if let Some(stmts) = map.get("body").and_then(Value::as_array) {
                collect_lexical_decl_ids(stmts, &mut patterns);
            }
        }
        "CatchClause" => patterns.extend(map.get("param")),
        "ForStatement" => {
            if let Some(init) = map.get("init") {
                collect_lexical_declarator_ids(init, &mut patterns);
            }
        }
        "ForInStatement" | "ForOfStatement" => {
            if let Some(left) = map.get("left") {
                collect_lexical_declarator_ids(left, &mut patterns);
            }
        }
        "SwitchStatement" => {
            for case in map
                .get("cases")
                .and_then(Value::as_array)
                .map_or(&[] as &[Value], Vec::as_slice)
            {
                if let Some(stmts) = case.get("consequent").and_then(Value::as_array) {
                    collect_lexical_decl_ids(stmts, &mut patterns);
                }
            }
        }
        "ClassDeclaration" | "ClassExpression" => patterns.extend(map.get("id")),
        _ => return None,
    }
    Some(Binders {
        patterns,
        bare: Vec::new(),
    })
}

/// `{#each expr as context, index}` — bound over the body and the key.
fn each_binders<'n>(map: &'n serde_json::Map<String, Value>) -> Binders<'n> {
    let mut bare = Vec::new();
    if let Some(index) = map.get("index").and_then(Value::as_str) {
        bare.push((index.to_string(), node_span(map)));
    }
    Binders {
        patterns: map.get("context").into_iter().collect(),
        bare,
    }
}

/// `{#await … then value}` / `{:catch error}` — one binder per branch.
fn await_binders<'n>(map: &'n serde_json::Map<String, Value>, field: &str) -> Binders<'n> {
    Binders {
        patterns: map.get(field).into_iter().collect(),
        bare: Vec::new(),
    }
}

fn snippet_binders<'n>(map: &'n serde_json::Map<String, Value>) -> Binders<'n> {
    Binders {
        patterns: map.get("parameters").into_iter().collect(),
        bare: Vec::new(),
    }
}

/// `{@const}` declares for the whole enclosing fragment.
fn const_tag_binders<'n>(map: &'n serde_json::Map<String, Value>) -> Binders<'n> {
    let mut patterns = Vec::new();
    for child in map
        .get("nodes")
        .and_then(Value::as_array)
        .map_or(&[] as &[Value], Vec::as_slice)
    {
        if node_type(child) == Some("ConstTag")
            && let Some(decl) = child.get("declaration")
        {
            collect_lexical_declarator_ids(decl, &mut patterns);
        }
    }
    Binders {
        patterns,
        bare: Vec::new(),
    }
}

/// An element's `let:` directives, bound over its children.
fn let_binders<'n>(map: &'n serde_json::Map<String, Value>) -> Binders<'n> {
    let mut patterns = Vec::new();
    let mut bare = Vec::new();
    for attr in map
        .get("attributes")
        .and_then(Value::as_array)
        .map_or(&[] as &[Value], Vec::as_slice)
    {
        if node_type(attr) != Some("LetDirective") {
            continue;
        }
        match attr.get("expression").filter(|e| !e.is_null()) {
            Some(pattern) => patterns.push(pattern),
            None => {
                if let Some(name) = attr.get("name").and_then(Value::as_str) {
                    bare.push((
                        name.to_string(),
                        (node_start(attr).unwrap_or(0), node_end(attr).unwrap_or(0)),
                    ));
                }
            }
        }
    }
    Binders { patterns, bare }
}

fn node_span(map: &serde_json::Map<String, Value>) -> (u32, u32) {
    let get = |k: &str| {
        map.get(k)
            .and_then(Value::as_u64)
            .and_then(|v| u32::try_from(v).ok())
            .unwrap_or(0)
    };
    (get("start"), get("end"))
}

/// The names `node`'s own scope binds — JS lexical scopes plus the Svelte block
/// binders. `None` when the node opens no scope. One model, so an
/// ancestor-walking rule and the reference tracker cannot disagree.
#[must_use]
pub fn scope_binding_names(node: &Value) -> Option<HashSet<String>> {
    let map = node.as_object()?;
    let ty = map.get("type").and_then(Value::as_str);
    if let Some(binders) = js_scope_binders(map, ty) {
        return Some(binders.names());
    }
    let binders = match ty {
        Some("EachBlock") => each_binders(map),
        Some("AwaitBlock") => {
            let mut b = await_binders(map, "value");
            b.patterns.extend(map.get("error"));
            b
        }
        Some("SnippetBlock") => snippet_binders(map),
        Some("Fragment") => const_tag_binders(map),
        _ if map.contains_key("fragment") && map.contains_key("attributes") => let_binders(map),
        _ => return None,
    };
    Some(binders.names())
}

/// The declarator ids of a `let`/`const` `VariableDeclaration` (nothing for `var`).
fn collect_lexical_declarator_ids<'n>(node: &'n Value, out: &mut Vec<&'n Value>) {
    if node_type(node) != Some("VariableDeclaration")
        || node.get("kind").and_then(Value::as_str) == Some("var")
    {
        return;
    }
    for decl in node
        .get("declarations")
        .and_then(Value::as_array)
        .map_or(&[] as &[Value], Vec::as_slice)
    {
        out.extend(decl.get("id"));
    }
}

/// Block-scoped declarations of a statement list, direct children only.
fn collect_lexical_decl_ids<'n>(stmts: &'n [Value], out: &mut Vec<&'n Value>) {
    for stmt in stmts {
        match node_type(stmt) {
            Some("VariableDeclaration") => collect_lexical_declarator_ids(stmt, out),
            Some("FunctionDeclaration" | "ClassDeclaration") => out.extend(stmt.get("id")),
            _ => {}
        }
    }
}

/// `var` declarator ids hoisted to the enclosing function, not entering nested
/// functions.
fn collect_var_decl_ids<'n>(node: &'n Value, out: &mut Vec<&'n Value>) {
    match node {
        Value::Array(arr) => {
            for v in arr {
                collect_var_decl_ids(v, out);
            }
        }
        Value::Object(map) => {
            match map.get("type").and_then(Value::as_str) {
                Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration") => {
                    return;
                }
                Some("VariableDeclaration")
                    if map.get("kind").and_then(Value::as_str) == Some("var") =>
                {
                    for decl in map
                        .get("declarations")
                        .and_then(Value::as_array)
                        .map_or(&[] as &[Value], Vec::as_slice)
                    {
                        out.extend(decl.get("id"));
                    }
                }
                _ => {}
            }
            for (k, v) in map {
                if k != "loc" {
                    collect_var_decl_ids(v, out);
                }
            }
        }
        _ => {}
    }
}

/// Collect the binding identifier nodes of a pattern subtree (params, ids).
fn collect_binding_idents<'n>(node: &'n Value, out: &mut Vec<&'n Value>) {
    match node {
        Value::Array(arr) => {
            for v in arr {
                collect_binding_idents(v, out);
            }
        }
        Value::Object(map) => match map.get("type").and_then(Value::as_str) {
            Some("Identifier") => out.push(node),
            Some("ObjectPattern") => {
                for p in map
                    .get("properties")
                    .and_then(Value::as_array)
                    .map_or(&[] as &[Value], Vec::as_slice)
                {
                    match node_type(p) {
                        Some("Property") => {
                            if let Some(v) = p.get("value") {
                                collect_binding_idents(v, out);
                            }
                        }
                        Some("RestElement") => {
                            if let Some(a) = p.get("argument") {
                                collect_binding_idents(a, out);
                            }
                        }
                        _ => {}
                    }
                }
            }
            Some("ArrayPattern") => {
                for e in map
                    .get("elements")
                    .and_then(Value::as_array)
                    .map_or(&[] as &[Value], Vec::as_slice)
                {
                    collect_binding_idents(e, out);
                }
            }
            Some("AssignmentPattern") => {
                if let Some(l) = map.get("left") {
                    collect_binding_idents(l, out);
                }
            }
            Some("RestElement") => {
                if let Some(a) = map.get("argument") {
                    collect_binding_idents(a, out);
                }
            }
            _ => {}
        },
        _ => {}
    }
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

    fn member(computed: bool, property: Value) -> Value {
        json!({ "type": "MemberExpression", "computed": computed,
                "object": { "type": "Identifier", "name": "ns" },
                "property": property })
    }

    fn tpl(raw: &str) -> Value {
        json!({ "type": "TemplateLiteral", "expressions": [],
                "quasis": [{ "type": "TemplateElement", "value": { "cooked": raw, "raw": raw } }] })
    }

    #[test]
    fn folds_constant_computed_keys() {
        let plain = member(false, json!({ "type": "Identifier", "name": "derived" }));
        assert_eq!(member_property_name(&plain).as_deref(), Some("derived"));

        let literal = member(true, json!({ "type": "Literal", "value": "derived" }));
        assert_eq!(member_property_name(&literal).as_deref(), Some("derived"));

        let concat = member(
            true,
            json!({ "type": "BinaryExpression", "operator": "+",
                    "left": { "type": "Literal", "value": "der" },
                    "right": { "type": "Literal", "value": "ived" } }),
        );
        assert_eq!(member_property_name(&concat).as_deref(), Some("derived"));

        let tpl_concat = member(
            true,
            json!({ "type": "BinaryExpression", "operator": "+",
                    "left": tpl("der"), "right": tpl("ived") }),
        );
        assert_eq!(
            member_property_name(&tpl_concat).as_deref(),
            Some("derived")
        );

        let dynamic = member(true, json!({ "type": "Identifier", "name": "k" }));
        assert_eq!(member_property_name(&dynamic), None);
    }

    #[test]
    fn stringifies_folded_values_like_js() {
        assert_eq!(StaticValue::Num(1.0).to_js_string(), "1");
        assert_eq!(StaticValue::Num(1.5).to_js_string(), "1.5");
        assert_eq!(StaticValue::Null.to_js_string(), "null");
        assert_eq!(StaticValue::Undefined.to_js_string(), "undefined");
        assert_eq!(StaticValue::Bool(true).to_js_string(), "true");
    }
}
