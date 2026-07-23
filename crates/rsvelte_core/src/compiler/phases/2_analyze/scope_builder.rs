//! Scope builder for the analyzer.
//!
//! Walks the AST and creates a scope tree with bindings.

use super::errors;
use super::pattern_ids::{base_identifier_name, collect_pattern_identifiers};
use super::scope::{Binding, BindingKind, DeclarationKind, Scope, ScopeRoot};
use super::visitors::shared::utils::validate_identifier_name;
use crate::ast::arena::{JsNodeId, ParseArena};
use crate::ast::template::{
    AwaitBlock, ConstTag, EachBlock, Fragment, IfBlock, KeyBlock, RegularElement, Root, Script,
    SnippetBlock, TemplateNode,
};
use crate::ast::typed_expr::{JsNode, LiteralValue};
use rustc_hash::FxHashMap;

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, Statement, VariableDeclaration,
    VariableDeclarationKind,
};
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

/// An update/assignment to track for marking bindings as reassigned/mutated.
#[derive(Debug)]
struct Update {
    /// The binding name being updated
    name: String,
    /// Whether this is a direct assignment (true) or member mutation (false)
    is_direct_assignment: bool,
    /// The scope index where the update occurred
    scope_idx: usize,
}

/// Builds a scope tree from an AST.
pub struct ScopeBuilder<'a> {
    /// All scopes (arena-style storage)
    scopes: Vec<Scope>,
    /// All bindings (arena-style storage)
    bindings: Vec<Binding>,
    /// Current scope index
    current_scope: usize,
    /// Source code for extracting script content
    source: &'a str,
    /// Parse arena for resolving JsNodeId and IdRange references
    arena: &'a ParseArena,
    /// Tracked updates (assignments and update expressions) to process after declarations
    updates: Vec<Update>,
    /// Current function depth (for validating $ prefixes)
    function_depth: usize,
    /// Whether we are in runes mode
    runes_mode: bool,
    /// Whether any script in the component uses TypeScript (lang="ts").
    /// When true, template expressions are parsed as TypeScript so that
    /// TypeScript syntax in event handlers (e.g., type annotations, `as`, `!`)
    /// doesn't cause parse failures that would prevent tracking assignments.
    is_typescript: bool,
    /// Validation errors collected during scope building
    validation_errors: Vec<crate::compiler::phases::phase2_analyze::AnalysisError>,
    /// Possible implicit declarations from `$: x = expr` statements.
    /// These become `legacy_reactive` bindings if no existing binding is found.
    /// Reference: scope.js lines 1021, 1323-1328
    possible_implicit_declarations: Vec<String>,
    /// The scope index of the instance script scope.
    instance_scope_index: usize,
    /// Maps function body start position (from OXC span) to the scope index
    /// created for that function body. Used to resolve context.scope during visitor phase.
    function_scope_map: FxHashMap<u32, usize>,
    /// The start offset of the current script content in the full source.
    /// Used to convert OXC span positions to full-source positions for function_scope_map.
    /// This is set to `script.content.start()` at the beginning of each script visit.
    current_script_offset: usize,
    /// Information about each blocks whose collection variables may need State promotion.
    /// Collected during template visit and processed after all updates are applied.
    /// Each entry: (parent_scope_idx, each_scope_idx, collection_identifier_names)
    each_block_collection_infos: Vec<(usize, usize, Vec<String>)>,
    /// Maps template node start positions to scope indices.
    /// Used by Phase 2 visitors to properly track context.scope when entering
    /// scope-creating template nodes (EachBlock, AwaitBlock, SnippetBlock, etc.).
    template_scope_map: FxHashMap<u32, usize>,
    /// Scope indices created for `{#snippet …}` bodies (see
    /// `ScopeRoot::snippet_scope_indices`).
    snippet_scope_indices: rustc_hash::FxHashSet<usize>,
    /// Identifier names found in template expression arrow function parameters.
    /// These need to be in the conflicts set so that generated variable names
    /// (like `node`, `$$array`, etc.) don't collide with them.
    template_expression_params: Vec<String>,
    /// Names declared inside nested function bodies that need to participate in
    /// root.conflicts (so generated template variables like `node_N` avoid them),
    /// but that aren't otherwise tracked as scope declarations.
    nested_declared_names: rustc_hash::FxHashSet<String>,
    /// Maps binding name -> indices into `bindings`, in push order. Carried over
    /// verbatim into `ScopeRoot::bindings_by_name` (see `build()`), since
    /// `self.bindings` also moves verbatim and indices stay 1:1.
    bindings_by_name: FxHashMap<String, smallvec::SmallVec<[u32; 1]>>,
}

impl<'a> ScopeBuilder<'a> {
    /// Create a new scope builder with runes mode and TypeScript flag.
    pub fn new(
        source: &'a str,
        runes_mode: bool,
        is_typescript: bool,
        arena: &'a ParseArena,
    ) -> Self {
        // Pre-allocate with reasonable capacities based on typical Svelte components.
        // Most components have a modest number of scopes, bindings, and updates.
        Self {
            scopes: { vec![Scope::new(None)] },
            bindings: Vec::new(),
            current_scope: 0,
            source,
            arena,
            updates: Vec::new(),
            // Initialize function_depth to 1 to match the official Svelte compiler's scope structure:
            // In the official compiler, scope.function_depth = parent.function_depth + 1 for non-porous
            // scopes. The root scope has depth 0, the instance scope has depth 1. This means:
            // - Variables at the top level of the instance script have function_depth = 1 (→ error)
            // - Variables inside a function body have function_depth = 2 (→ OK)
            // The validate_identifier_name check is `(!function_depth || function_depth <= 1)`.
            function_depth: 1,
            runes_mode,
            is_typescript,
            validation_errors: Vec::new(),
            possible_implicit_declarations: Vec::new(),
            instance_scope_index: 0,
            function_scope_map: FxHashMap::default(),
            current_script_offset: 0,
            each_block_collection_infos: Vec::new(),
            template_scope_map: FxHashMap::default(),
            snippet_scope_indices: rustc_hash::FxHashSet::default(),
            template_expression_params: Vec::new(),
            nested_declared_names: rustc_hash::FxHashSet::default(),
            bindings_by_name: FxHashMap::default(),
        }
    }

    /// Build scopes from the AST.
    ///
    /// Returns a tuple of (ScopeRoot, Vec<AnalysisError>) where the errors
    /// are validation errors collected during scope building.
    pub fn build(
        mut self,
        ast: &Root,
    ) -> (
        ScopeRoot,
        Vec<crate::compiler::phases::phase2_analyze::AnalysisError>,
    ) {
        // Visit module script first (module scope is parent of instance scope)
        // In Svelte, module and instance scripts are separate scopes, with instance
        // having module as its parent. This allows the same name to be declared in both.
        if let Some(ref script) = ast.module {
            self.visit_script(script);
        }

        // Visit instance script in a child scope of module
        // This matches Svelte's scope hierarchy where instance scope has module scope as parent
        // IMPORTANT: We keep the script scope active during template processing so that
        // template expressions can find bindings declared in the script.
        let script_scope = if let Some(ref script) = ast.instance {
            // Create a new scope for instance script with module (scope 0) as parent
            // Instance scope is non-porous (function_depth = parent + 1 = 1)
            let old_scope = self.push_function_scope();
            self.instance_scope_index = self.current_scope;
            self.visit_script(script);

            // Process possible implicit declarations from `$: x = expr` statements.
            // If `x` doesn't have an existing binding, declare it as `legacy_reactive`.
            // This must happen AFTER visiting the script so all normal declarations are known.
            // Reference: scope.js lines 1323-1328
            if !self.runes_mode {
                let implicit_decls = std::mem::take(&mut self.possible_implicit_declarations);
                for name in implicit_decls {
                    // Check if binding already exists in any scope (scope chain lookup)
                    let has_binding = self.find_binding_in_scope_chain(&name).is_some();
                    if !has_binding {
                        self.declare_binding(
                            name,
                            BindingKind::LegacyReactive,
                            DeclarationKind::Let,
                        );
                    }
                }
            }

            Some(old_scope)
        } else {
            None
        };

        // Visit template - still within the script scope so bindings are accessible
        self.visit_fragment(&ast.fragment);

        // Now pop the script scope after template processing is done
        if let Some(old_scope) = script_scope {
            self.pop_scope(old_scope);
        }

        // Process all tracked updates to mark bindings as reassigned/mutated
        // Use scope chain lookup to find the correct binding
        for update in &self.updates {
            // Look up the binding starting from the scope where the update occurred
            // and traverse up the parent chain (closure semantics)
            let mut scope_idx = update.scope_idx;
            loop {
                let scope = &self.scopes[scope_idx];
                if let Some(&binding_idx) = scope.declarations.get(&update.name) {
                    if update.is_direct_assignment {
                        self.bindings[binding_idx].reassigned = true;
                    } else {
                        self.bindings[binding_idx].mutated = true;
                    }
                    break;
                }
                if let Some(parent) = scope.parent {
                    scope_idx = parent;
                } else {
                    break;
                }
            }
        }

        // Collect all declarations from all scopes into the root scope for backward
        // compatibility with code that uses root.scope.declarations.
        // Process from outermost to innermost and use or_insert so OUTER scope
        // bindings take precedence. This ensures that template expressions find
        // the correct top-level bindings, not shadowed bindings inside functions.
        //
        // Example: let { foo } = (() => { const foo = ...; return { foo }; })();
        // The outer `let foo` should be found, not the inner `const foo`.
        //
        // Scope creation order is not depth order: module-script inner-function
        // scopes are created before the instance scope, so the instance scope's
        // top-level declarations must be inserted first or a same-named function
        // parameter in the module script would shadow them.
        let instance_idx = self.instance_scope_index;
        let instance_first = std::iter::once(instance_idx)
            .filter(|&i| i != 0)
            .chain((1..self.scopes.len()).filter(move |&i| i != instance_idx));
        for i in instance_first {
            // Split to get simultaneous mutable access to scopes[0] and scopes[i]
            let (first, rest) = self.scopes.split_at_mut(1);
            let root = &mut first[0];
            let scope = &rest[i - 1];
            for (name, &binding_idx) in &scope.declarations {
                // Only add if not already in root scope (outer scope takes precedence)
                if !root.declarations.contains_key(name) {
                    root.declarations.insert(name.clone(), binding_idx);
                }
            }
        }

        // Filter each_block_collection_infos to only include entries where at least
        // one EachItem binding in the each scope is updated. This allows mod.rs to
        // process them after runes detection without re-checking binding update status.
        // We filter here because the update status is now finalized (all updates applied).
        let each_block_collection_infos: Vec<(usize, usize, Vec<String>)> =
            std::mem::take(&mut self.each_block_collection_infos)
                .into_iter()
                .filter(|(_, each_scope, _)| {
                    self.scopes[*each_scope].declarations.values().any(|&idx| {
                        self.bindings
                            .get(idx)
                            .map(|b| b.kind == BindingKind::EachItem && b.is_updated())
                            .unwrap_or(false)
                    })
                })
                .collect();

        // Return the root scope with all scopes preserved for proper lookup
        let all_scopes = std::mem::take(&mut self.scopes);

        // Build the conflicts set from all declarations in all scopes.
        // This mirrors the official Svelte compiler where every scope.declare()
        // adds the name to scope.root.conflicts.
        //
        // Since the root scope (all_scopes[0]) already has all declarations merged from
        // all child scopes (done above), we can use its keys directly as the base set.
        // We only need to add binding names and template expression params on top.
        //
        // Pre-calculate capacity: root scope declarations + bindings + template params.
        // The root scope declarations already include all child scope declarations,
        // so we don't need to iterate child scopes separately.
        let root_decl_count = all_scopes
            .first()
            .map(|s| s.declarations.len())
            .unwrap_or(0);
        let capacity =
            root_decl_count + self.bindings.len() + self.template_expression_params.len();
        let mut conflicts =
            rustc_hash::FxHashSet::with_capacity_and_hasher(capacity, Default::default());
        // Add all declaration names from the merged root scope
        if let Some(root) = all_scopes.first() {
            for name in root.declarations.keys() {
                conflicts.insert(name.clone());
            }
        }
        // Also add binding names (may include names not in any scope's declarations)
        for binding in &self.bindings {
            conflicts.insert(binding.name.clone());
        }
        // Also collect arrow function parameter names from template expressions.
        // Template expressions (event handlers, attach directives, etc.) may contain
        // arrow functions whose parameters need to be in the conflicts set to avoid
        // naming collisions with generated variables.
        // Use into_iter to take ownership and avoid cloning.
        for name in std::mem::take(&mut self.template_expression_params) {
            conflicts.insert(name);
        }
        // Also collect names declared inside nested function/arrow bodies. These are
        // not reflected in any scope's declarations (since the tracking-only paths
        // don't declare bindings), but the official Svelte compiler adds all such
        // inner declarations to root.conflicts so that generated variables like
        // `node_N` avoid colliding with them.
        for name in std::mem::take(&mut self.nested_declared_names) {
            conflicts.insert(name);
        }

        // Clone the root scope (with all merged declarations) for backward compatibility.
        // The ScopeRoot.scope field needs its own copy since it's accessed
        // separately from all_scopes.
        let root_scope = if all_scopes.is_empty() {
            Scope::default()
        } else {
            all_scopes[0].clone()
        };

        (
            ScopeRoot {
                bindings: self.bindings,
                scope: root_scope,
                all_scopes,
                instance_scope_index: self.instance_scope_index,
                function_scope_map: self.function_scope_map,
                each_block_collection_infos,
                template_scope_map: self.template_scope_map,
                snippet_scope_indices: self.snippet_scope_indices,
                conflicts: std::rc::Rc::new(std::cell::RefCell::new(conflicts)),
                bindings_by_name: self.bindings_by_name,
            },
            self.validation_errors,
        )
    }

    /// Push a new porous (block-level) child scope and return the old scope index.
    /// Porous scopes inherit the parent's function_depth.
    fn push_scope(&mut self) -> usize {
        let parent_depth = self.scopes[self.current_scope].function_depth;
        let new_scope = Scope::new_with_depth(Some(self.current_scope), parent_depth);
        let idx = self.scopes.len();
        self.scopes[self.current_scope].children.push(idx);
        self.scopes.push(new_scope);
        let old_scope = self.current_scope;
        self.current_scope = idx;
        old_scope
    }

    /// Push a new non-porous (function-level) child scope and return the old scope index.
    /// Non-porous scopes have function_depth = parent.function_depth + 1.
    fn push_function_scope(&mut self) -> usize {
        let parent_depth = self.scopes[self.current_scope].function_depth;
        let new_scope = Scope::new_with_depth(Some(self.current_scope), parent_depth + 1);
        let idx = self.scopes.len();
        self.scopes[self.current_scope].children.push(idx);
        self.scopes.push(new_scope);
        let old_scope = self.current_scope;
        self.current_scope = idx;
        old_scope
    }

    /// Pop back to the parent scope.
    fn pop_scope(&mut self, old_scope: usize) {
        self.current_scope = old_scope;
    }

    /// The scope a `var` declaration hoists to: the nearest enclosing
    /// function or script scope. `var` is function-scoped, not block-scoped, so
    /// it bubbles up through porous (block) scopes — those whose `function_depth`
    /// matches their parent's — until it reaches a non-porous boundary (a
    /// function body) or the root. Mirrors the official compiler's
    /// `declare(..., 'var')` delegating through porous scopes.
    fn nearest_var_scope(&self) -> usize {
        let mut idx = self.current_scope;
        while let Some(parent) = self.scopes[idx].parent {
            if self.scopes[idx].function_depth != self.scopes[parent].function_depth {
                // Non-porous boundary (function body) — `var` stops here.
                break;
            }
            idx = parent;
        }
        idx
    }

    /// Find a binding by name in the current scope chain.
    /// Returns the binding index if found.
    fn find_binding_in_scope_chain(&self, name: &str) -> Option<usize> {
        let mut scope_idx = self.current_scope;
        loop {
            let scope = &self.scopes[scope_idx];
            if let Some(&binding_idx) = scope.declarations.get(name) {
                return Some(binding_idx);
            }
            if let Some(parent) = scope.parent {
                scope_idx = parent;
            } else {
                break;
            }
        }
        None
    }

    /// Walk the scope chain looking for `store_name` (the identifier without the
    /// leading `$`). If it is declared in any scope other than module-root or the
    /// instance script scope, that is a `store_invalid_scoped_subscription`
    /// error per the official Svelte compiler.
    fn check_store_scoped_subscription(&mut self, store_name: &str) {
        let mut scope_idx = self.current_scope;
        loop {
            let scope = &self.scopes[scope_idx];
            if scope.declarations.contains_key(store_name) {
                if scope_idx != 0 && scope_idx != self.instance_scope_index {
                    self.validation_errors
                        .push(errors::store_invalid_scoped_subscription());
                }
                break;
            }
            if let Some(parent) = scope.parent {
                scope_idx = parent;
            } else {
                break;
            }
        }
    }

    /// Collect identifiers from the LHS of an assignment expression.
    /// Used to find possible implicit `legacy_reactive` declarations from `$: x = expr`.
    /// Reference: scope.js lines 1019-1023
    fn collect_assignment_lhs_identifiers(&mut self, left: &oxc_ast::ast::AssignmentTarget) {
        match left {
            oxc_ast::ast::AssignmentTarget::AssignmentTargetIdentifier(id) => {
                let name = id.name.to_string();
                if !name.starts_with('$') {
                    self.possible_implicit_declarations.push(name);
                }
            }
            oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(arr) => {
                for elem in arr.elements.iter().flatten() {
                    match elem {
                        oxc_ast::ast::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(
                            with_default,
                        ) => {
                            self.collect_assignment_target_identifiers(&with_default.binding);
                        }
                        _ => {
                            if let Some(target) = elem.as_assignment_target() {
                                self.collect_assignment_target_identifiers(target);
                            }
                        }
                    }
                }
            }
            oxc_ast::ast::AssignmentTarget::ObjectAssignmentTarget(obj) => {
                for prop in &obj.properties {
                    match prop {
                        oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                            id_prop,
                        ) => {
                            let name = id_prop.binding.name.to_string();
                            if !name.starts_with('$') {
                                self.possible_implicit_declarations.push(name);
                            }
                        }
                        oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(
                            prop_prop,
                        ) => {
                            if let Some(target) = prop_prop.binding.as_assignment_target() {
                                self.collect_assignment_target_identifiers(target);
                            }
                        }
                    }
                }
            }
            _ => {
                // MemberExpression, etc. - not implicit declarations
            }
        }
    }

    /// Helper to collect identifiers from an AssignmentTarget.
    fn collect_assignment_target_identifiers(&mut self, target: &oxc_ast::ast::AssignmentTarget) {
        if let oxc_ast::ast::AssignmentTarget::AssignmentTargetIdentifier(id) = target {
            let name = id.name.to_string();
            if !name.starts_with('$') {
                self.possible_implicit_declarations.push(name);
            }
        }
    }

    /// Declare a binding in the current scope.
    fn declare_binding(
        &mut self,
        name: String,
        kind: BindingKind,
        declaration_kind: DeclarationKind,
    ) -> usize {
        // `var` is function-scoped: hoist its declaration to the nearest
        // function/script scope rather than the current block scope.
        let target_scope = if declaration_kind == DeclarationKind::Var {
            self.nearest_var_scope()
        } else {
            self.current_scope
        };

        // Check for duplicate declaration in the target scope
        // Note: var redeclarations are allowed in JavaScript, so we only error
        // if neither the existing nor new declaration is a var.
        // Also allow function redeclarations (TypeScript overloads declare the same
        // function name multiple times).
        if let Some(&existing_idx) = self.scopes[target_scope].declarations.get(&name) {
            let existing_kind = self.bindings[existing_idx].declaration_kind;
            // Original rule: error when neither side is hoistable (`var`) or a
            // function — function redeclarations stay valid for TS overloads.
            let both_non_hoistable = existing_kind != DeclarationKind::Var
                && declaration_kind != DeclarationKind::Var
                && existing_kind != DeclarationKind::Function
                && declaration_kind != DeclarationKind::Function;
            // A block-lexical binding (`let` / `const` / `using`) cannot share
            // its name with anything else in the same scope — including a
            // function declaration (`let x; function x() {}`), which the
            // function-redeclaration allowance above previously suppressed. L-002.
            let is_block_lexical = |k: DeclarationKind| {
                matches!(
                    k,
                    DeclarationKind::Let
                        | DeclarationKind::Const
                        | DeclarationKind::Using
                        | DeclarationKind::AwaitUsing
                )
            };
            let lexical_vs_function = (is_block_lexical(existing_kind)
                && declaration_kind == DeclarationKind::Function)
                || (existing_kind == DeclarationKind::Function
                    && is_block_lexical(declaration_kind));
            if both_non_hoistable || lexical_vs_function {
                self.validation_errors
                    .push(errors::declaration_duplicate(&name));
            }
        }

        let idx = self.bindings.len();
        let binding =
            Binding::with_declaration_kind(name.clone(), kind, declaration_kind, target_scope);

        // Validate identifier name (check for invalid $ prefixes)
        // In runes mode: validate without function_depth (all levels validated)
        // In legacy mode: validate with function_depth so bindings inside function bodies
        //   (function_depth >= 2) are allowed. This matches the official Svelte compiler's
        //   scope.js behavior where `function_depth <= 1` means instance scope level only.
        //
        // Official Svelte scope.js:
        //   this.function_depth = parent ? parent.function_depth + (porous ? 0 : 1) : 0;
        //   validate_identifier_name(binding, this.function_depth);
        //   validate_identifier_name checks: (!function_depth || function_depth <= 1)
        //   So function_depth >= 2 (inside a function body) allows $ prefixed names.
        {
            let function_depth = if self.runes_mode {
                None
            } else {
                Some(self.function_depth)
            };
            if let Err(e) = validate_identifier_name(&binding, function_depth) {
                self.validation_errors.push(e);
            }
        }

        self.bindings_by_name
            .entry(binding.name.clone())
            .or_default()
            .push(idx as u32);
        self.bindings.push(binding);
        self.scopes[target_scope].declare(name, idx);
        idx
    }

    /// Visit a script block and extract variable declarations.
    ///
    /// Tries the typed path first (using the JsNode from the parse arena),
    /// falling back to OXC re-parse if the content is not in typed form.
    fn visit_script(&mut self, script: &Script) {
        let start = script.content.start().unwrap_or(0) as usize;
        let end = script.content.end().unwrap_or(0) as usize;

        if end <= start || end > self.source.len() {
            return;
        }

        // Store the script content offset so process_statement can use it
        // to record correct full-source positions in function_scope_map
        self.current_script_offset = start;

        // Fast path: if the script content is already a typed JsNode::Program,
        // process it directly without re-parsing with OXC.
        if let crate::ast::js::Expression::Typed(te) = &script.content {
            self.process_program_typed(&te.node);
            return;
        }

        let content = &self.source[start..end];

        // Use the component-level TypeScript flag instead of checking per-script attributes.
        // In Svelte, if any script in the component has lang="ts", ALL scripts (including
        // the instance script without lang="ts") are treated as TypeScript. This is because
        // the instance script may use TypeScript syntax like `import type`, `satisfies`, etc.
        // even without explicitly declaring lang="ts".
        let source_type = if self.is_typescript {
            SourceType::ts()
        } else {
            SourceType::default()
        };

        // Reuse thread-local OXC allocator (same pattern as Phase 1 expression parsing)
        use std::cell::RefCell;
        thread_local! {
            static SCOPE_OXC_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
        }
        SCOPE_OXC_ALLOC.with(|cell| {
            let mut alloc = cell.borrow_mut();
            alloc.reset();
            let ret = OxcParser::new(&alloc, content, source_type).parse();
            if ret.diagnostics.is_empty() {
                self.process_program(&ret.program);
            }
        });
    }

    /// Process a typed JsNode::Program AST.
    fn process_program_typed(&mut self, node: &JsNode) {
        if let JsNode::Program { body, .. } = node {
            for stmt in self.arena.get_js_children(*body) {
                self.process_statement_typed(stmt);
            }
        }
    }

    /// Process a statement from a typed JsNode.
    /// Mirrors the logic of `process_statement` but using JsNode pattern matching.
    fn process_statement_typed(&mut self, node: &JsNode) {
        match node {
            JsNode::VariableDeclaration {
                declarations, kind, ..
            } => {
                let decl_kind = match kind.as_str() {
                    "const" => DeclarationKind::Const,
                    "let" => DeclarationKind::Let,
                    "var" => DeclarationKind::Var,
                    // using/await using treated as const
                    _ => DeclarationKind::Const,
                };
                let declarations = *declarations;
                for decl_node in self.arena.get_js_children(declarations) {
                    if let JsNode::VariableDeclarator { id, init, .. } = decl_node {
                        let id_node = self.arena.get_js_node(*id);
                        self.process_binding_pattern_typed(id_node, *init, decl_kind);
                        // Also track updates in the initializer expression
                        if let Some(init_id) = init {
                            let init_node = self.arena.get_js_node(*init_id);
                            self.track_node_expression_updates(init_node);
                        }
                    }
                }
            }
            JsNode::ImportDeclaration {
                specifiers,
                source,
                import_kind,
                ..
            } => {
                // Skip type-only imports
                if import_kind.as_deref() == Some("type") {
                    return;
                }
                let source_val = {
                    let src = self.arena.get_js_node(*source);
                    match src {
                        JsNode::Literal {
                            value: LiteralValue::String(s),
                            ..
                        } => s.to_string(),
                        _ => String::new(),
                    }
                };
                let specifiers = *specifiers;
                for spec_node in self.arena.get_js_children(specifiers) {
                    self.process_import_specifier_typed(spec_node, &source_val);
                }
            }
            JsNode::FunctionDeclaration {
                id, params, body, ..
            } => {
                if let Some(id_ref) = id {
                    let id_node = self.arena.get_js_node(*id_ref);
                    if let JsNode::Identifier { name, start, .. } = id_node {
                        let idx = self.declare_binding(
                            name.to_string(),
                            BindingKind::Normal,
                            DeclarationKind::Function,
                        );
                        self.bindings[idx].initial_is_function = true;
                        self.bindings[idx].declaration_start = Some(*start);
                    }
                }
                let params = *params;
                let body = *body;
                // Create a new scope for the function body (non-porous: function_depth + 1)
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                // Record function body start -> scope index mapping for visitor phase
                // JsNode positions are already full-source positions (offset-adjusted during
                // parsing), so we use them directly without adding current_script_offset.
                if let Some(body_id) = body {
                    let body_node = self.arena.get_js_node(body_id);
                    if let Some(start) = body_node.start() {
                        self.function_scope_map.insert(start, self.current_scope);
                    }
                }
                // Declare function parameters in the new scope
                for param in self.arena.get_js_children(params) {
                    self.declare_bindings_from_pattern_node_with_kind(
                        param,
                        BindingKind::Normal,
                        false,
                        DeclarationKind::Param,
                    );
                }
                // Process function body for assignments
                if let Some(body_id) = body {
                    self.process_body_typed(self.arena.get_js_node(body_id));
                }
                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            JsNode::ClassDeclaration { id, body, .. } => {
                if let Some(id_ref) = id {
                    let id_node = self.arena.get_js_node(*id_ref);
                    if let JsNode::Identifier { name, start, .. } = id_node {
                        let idx = self.declare_binding(
                            name.to_string(),
                            BindingKind::Normal,
                            DeclarationKind::Let,
                        );
                        self.bindings[idx].declaration_start = Some(*start);
                    }
                }
                // Process class body to find assignments in methods, getters, setters, etc.
                let body_id = *body;
                self.process_class_body_typed(self.arena.get_js_node(body_id));
            }
            JsNode::ExportNamedDeclaration {
                declaration,
                export_kind,
                ..
            } => {
                // Skip type-only exports
                if export_kind.as_deref() == Some("type") {
                    return;
                }
                if let Some(decl_id) = declaration {
                    let decl_node = self.arena.get_js_node(*decl_id);
                    self.process_statement_typed(decl_node);
                }
            }
            JsNode::ExportDefaultDeclaration { .. } => {
                // Export default doesn't create a named binding in the module scope
            }
            JsNode::ExpressionStatement { expression, .. } => {
                let expr = self.arena.get_js_node(*expression);
                self.track_node_expression_updates(expr);
            }
            JsNode::BlockStatement { body, .. } => {
                let body = *body;
                let old_scope = self.push_scope();
                // Register this (non-function) block's scope so the Phase-2 visitor
                // can enter it too — otherwise block-local `let`s (e.g. a `let css`
                // inside a `for` body that shadows a `css` prop) are invisible to the
                // visitor's mutation/reference resolution, which then mis-attributes
                // the mutation to the outer (prop) binding. Keyed by block start.
                if let Some(bstart) = node.start() {
                    self.function_scope_map.insert(bstart, self.current_scope);
                }
                for stmt in self.arena.get_js_children(body) {
                    self.process_statement_typed(stmt);
                }
                self.pop_scope(old_scope);
            }
            JsNode::IfStatement {
                test,
                consequent,
                alternate,
                ..
            } => {
                let test_node = self.arena.get_js_node(*test);
                self.track_node_expression_updates(test_node);
                let cons_node = self.arena.get_js_node(*consequent);
                self.process_statement_typed(cons_node);
                if let Some(alt_id) = alternate {
                    let alt_node = self.arena.get_js_node(*alt_id);
                    self.process_statement_typed(alt_node);
                }
            }
            JsNode::ReturnStatement {
                argument: Some(arg_id),
                ..
            } => {
                let arg_node = self.arena.get_js_node(*arg_id);
                self.track_node_expression_updates(arg_node);
            }
            JsNode::ReturnStatement { .. } => {}
            JsNode::WhileStatement { test, body, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*test));
                self.process_statement_typed(self.arena.get_js_node(*body));
            }
            JsNode::DoWhileStatement { test, body, .. } => {
                self.process_statement_typed(self.arena.get_js_node(*body));
                self.track_node_expression_updates(self.arena.get_js_node(*test));
            }
            JsNode::ForStatement {
                init,
                test,
                update,
                body,
                ..
            } => {
                // Check if init is a let/const VariableDeclaration that needs its own scope
                let needs_scope = if let Some(init_id) = init {
                    let init_node = self.arena.get_js_node(*init_id);
                    matches!(
                        init_node,
                        JsNode::VariableDeclaration { kind, .. }
                            if kind.as_str() == "let" || kind.as_str() == "const"
                    )
                } else {
                    false
                };
                let old_scope = if needs_scope {
                    let old = self.push_scope();
                    // Register the for-loop's lexical scope (holding the `let`/`const`
                    // declared in the init) so the Phase-2 visitor can enter it when it
                    // walks the init/test/update/body — otherwise the loop variable is
                    // invisible to mutation/reference resolution and an `i++` in the
                    // update clause mis-resolves to a same-named binding in a sibling
                    // scope (e.g. a `const i` in a neighbouring arrow), falsely tripping
                    // `constant_assignment`. Keyed by the for-statement start.
                    if let Some(fstart) = node.start() {
                        self.function_scope_map.insert(fstart, self.current_scope);
                    }
                    Some(old)
                } else {
                    None
                };
                if let Some(init_id) = init {
                    let init_node = self.arena.get_js_node(*init_id);
                    if matches!(init_node, JsNode::VariableDeclaration { .. }) {
                        self.process_statement_typed(init_node);
                    } else {
                        self.track_node_expression_updates(init_node);
                    }
                }
                if let Some(test_id) = test {
                    self.track_node_expression_updates(self.arena.get_js_node(*test_id));
                }
                if let Some(update_id) = update {
                    self.track_node_expression_updates(self.arena.get_js_node(*update_id));
                }
                self.process_statement_typed(self.arena.get_js_node(*body));
                if let Some(old) = old_scope {
                    self.pop_scope(old);
                }
            }
            JsNode::ForInStatement {
                left, right, body, ..
            } => {
                // Process left: if it's a VariableDeclaration, declare the binding
                // in a new scope so subsequent `node_N` generation sees it as a conflict.
                let left_node = self.arena.get_js_node(*left);
                let needs_scope = matches!(
                    left_node,
                    JsNode::VariableDeclaration { kind, .. }
                        if kind.as_str() == "let" || kind.as_str() == "const"
                );
                let old_scope = if needs_scope {
                    let old = self.push_scope();
                    if let Some(fstart) = node.start() {
                        self.function_scope_map.insert(fstart, self.current_scope);
                    }
                    Some(old)
                } else {
                    None
                };
                if matches!(left_node, JsNode::VariableDeclaration { .. }) {
                    self.process_statement_typed(left_node);
                }
                self.track_node_expression_updates(self.arena.get_js_node(*right));
                self.process_statement_typed(self.arena.get_js_node(*body));
                if let Some(old) = old_scope {
                    self.pop_scope(old);
                }
            }
            JsNode::ForOfStatement {
                left, right, body, ..
            } => {
                let left_node = self.arena.get_js_node(*left);
                let needs_scope = matches!(
                    left_node,
                    JsNode::VariableDeclaration { kind, .. }
                        if kind.as_str() == "let" || kind.as_str() == "const"
                );
                let old_scope = if needs_scope {
                    let old = self.push_scope();
                    if let Some(fstart) = node.start() {
                        self.function_scope_map.insert(fstart, self.current_scope);
                    }
                    Some(old)
                } else {
                    None
                };
                if matches!(left_node, JsNode::VariableDeclaration { .. }) {
                    self.process_statement_typed(left_node);
                }
                self.track_node_expression_updates(self.arena.get_js_node(*right));
                self.process_statement_typed(self.arena.get_js_node(*body));
                if let Some(old) = old_scope {
                    self.pop_scope(old);
                }
            }
            JsNode::TryStatement {
                block,
                handler,
                finalizer,
                ..
            } => {
                // Process try block in its own lexical scope so `let`/`const`
                // inside it don't leak to the enclosing scope.
                let block_node = self.arena.get_js_node(*block);
                if let JsNode::BlockStatement { body, .. } = block_node {
                    let body = *body;
                    let old_scope = self.push_scope();
                    for stmt in self.arena.get_js_children(body) {
                        self.process_statement_typed(stmt);
                    }
                    self.pop_scope(old_scope);
                }
                // Process catch clause if present
                if let Some(handler_id) = handler {
                    let handler_node = self.arena.get_js_node(*handler_id);
                    if let JsNode::CatchClause { param, body, .. } = handler_node {
                        let param = *param;
                        let body = *body;
                        let old_scope = self.push_scope();
                        // Declare catch parameter if present
                        if let Some(param_id) = param {
                            let param_node = self.arena.get_js_node(param_id);
                            self.declare_bindings_from_pattern_node(
                                param_node,
                                BindingKind::Normal,
                                false,
                            );
                        }
                        let body_node = self.arena.get_js_node(body);
                        if let JsNode::BlockStatement {
                            body: stmts_range, ..
                        } = body_node
                        {
                            let stmts_range = *stmts_range;
                            for stmt in self.arena.get_js_children(stmts_range) {
                                self.process_statement_typed(stmt);
                            }
                        }
                        self.pop_scope(old_scope);
                    }
                }
                // Process finally block in its own lexical scope.
                if let Some(finalizer_id) = finalizer {
                    let finalizer_node = self.arena.get_js_node(*finalizer_id);
                    if let JsNode::BlockStatement { body, .. } = finalizer_node {
                        let body = *body;
                        let old_scope = self.push_scope();
                        for stmt in self.arena.get_js_children(body) {
                            self.process_statement_typed(stmt);
                        }
                        self.pop_scope(old_scope);
                    }
                }
            }
            JsNode::ThrowStatement { argument, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*argument));
            }
            JsNode::SwitchStatement {
                discriminant,
                cases,
                ..
            } => {
                self.track_node_expression_updates(self.arena.get_js_node(*discriminant));
                let cases = *cases;
                // The switch block is a single lexical scope shared by all cases
                // (mirrors the official compiler's `create_block_scope`), so
                // `let`/`const` in a case body doesn't leak to the enclosing scope.
                let old_scope = self.push_scope();
                for case in self.arena.get_js_children(cases) {
                    if let JsNode::SwitchCase {
                        test, consequent, ..
                    } = case
                    {
                        if let Some(test_id) = test {
                            self.track_node_expression_updates(self.arena.get_js_node(*test_id));
                        }
                        let consequent = *consequent;
                        for stmt in self.arena.get_js_children(consequent) {
                            self.process_statement_typed(stmt);
                        }
                    }
                }
                self.pop_scope(old_scope);
            }
            JsNode::LabeledStatement { label, body, .. } => {
                let label_id = *label;
                let body_id = *body;
                // Check for `$:` reactive declarations in legacy mode
                let label_node = self.arena.get_js_node(label_id);
                if let JsNode::Identifier { name, .. } = label_node
                    && name.as_str() == "$"
                    && !self.runes_mode
                {
                    let body_node = self.arena.get_js_node(body_id);
                    if let JsNode::ExpressionStatement { expression, .. } = body_node {
                        let expr = self.arena.get_js_node(*expression);
                        // Handle AssignmentExpression directly. Only a top-level
                        // `$:` (function_depth == 1) declares an implicit
                        // reactive binding; a function-nested one is plain.
                        if let JsNode::AssignmentExpression { left, .. } = expr
                            && self.function_depth == 1
                        {
                            let left_node = self.arena.get_js_node(*left);
                            self.collect_assignment_lhs_identifiers_typed(left_node);
                        }
                    }
                }
                let body_node = self.arena.get_js_node(body_id);
                self.process_statement_typed(body_node);
            }
            // Empty, debugger, break, continue — no bindings or updates
            JsNode::EmptyStatement { .. }
            | JsNode::DebuggerStatement { .. }
            | JsNode::BreakStatement { .. }
            | JsNode::ContinueStatement { .. } => {}
            _ => {}
        }
    }

    /// Process a binding pattern from a JSON Value (Raw fallback for declarations
    /// inside ExportNamedDeclaration).
    /// Collect all identifier names from a typed JsNode binding pattern into the
    /// `nested_declared_names` set (used to seed root.conflicts with inner-scope names).
    fn collect_names_from_pattern_into_nested(&mut self, node: &JsNode) {
        match node {
            JsNode::Identifier { name, .. } => {
                self.nested_declared_names.insert(name.to_string());
            }
            JsNode::ObjectPattern { properties, .. } => {
                for prop in self.arena.get_js_children(*properties) {
                    match prop {
                        JsNode::Property { value, .. } => {
                            let v = self.arena.get_js_node(*value);
                            self.collect_names_from_pattern_into_nested(v);
                        }
                        JsNode::RestElement { argument, .. } => {
                            let a = self.arena.get_js_node(*argument);
                            self.collect_names_from_pattern_into_nested(a);
                        }
                        _ => {}
                    }
                }
            }
            JsNode::ArrayPattern { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.collect_names_from_pattern_into_nested(elem);
                }
            }
            JsNode::AssignmentPattern { left, .. } => {
                let l = self.arena.get_js_node(*left);
                self.collect_names_from_pattern_into_nested(l);
            }
            JsNode::RestElement { argument, .. } => {
                let a = self.arena.get_js_node(*argument);
                self.collect_names_from_pattern_into_nested(a);
            }
            _ => {}
        }
    }

    /// Process a binding pattern from a typed JsNode (for variable declarations).
    /// This mirrors `process_binding_pattern` but works with JsNode.
    fn process_binding_pattern_typed(
        &mut self,
        pattern: &JsNode,
        init: Option<JsNodeId>,
        decl_kind: DeclarationKind,
    ) {
        match pattern {
            JsNode::Identifier { name, start, .. } => {
                let kind = if let Some(init_id) = init {
                    let init_node = self.arena.get_js_node(init_id);
                    self.detect_binding_kind_from_node(init_node)
                } else {
                    BindingKind::Normal
                };
                let idx = self.declare_binding(name.to_string(), kind, decl_kind);
                // Store declaration position for var hoisting analysis.
                // Typed JsNode positions are already relative to the full component.
                self.bindings[idx].declaration_start = Some(*start);
                // Check if initializer is a function expression
                if let Some(init_id) = init {
                    let init_node = self.arena.get_js_node(init_id);
                    if matches!(
                        init_node,
                        JsNode::ArrowFunctionExpression { .. } | JsNode::FunctionExpression { .. }
                    ) {
                        self.bindings[idx].initial_is_function = true;
                    }
                }
            }
            JsNode::ObjectPattern { properties, .. } => {
                // Detect if this ObjectPattern is initialized from $props()
                let is_props_init = init
                    .map(|init_id| {
                        let init_node = self.arena.get_js_node(init_id);
                        matches!(
                            self.detect_binding_kind_from_node(init_node),
                            BindingKind::Prop
                        )
                    })
                    .unwrap_or(false);
                let properties = *properties;
                for prop in self.arena.get_js_children(properties) {
                    match prop {
                        JsNode::Property { value, .. } => {
                            let value_node = self.arena.get_js_node(*value);
                            self.process_binding_pattern_typed(value_node, None, decl_kind);
                        }
                        JsNode::RestElement { argument, .. }
                        | JsNode::SpreadElement { argument, .. } => {
                            if is_props_init {
                                // For `let { ...rest } = $props()`, the rest binding must be RestProp
                                let arg_node = self.arena.get_js_node(*argument);
                                if let JsNode::Identifier { name, start, .. } = arg_node {
                                    let idx = self.declare_binding(
                                        name.to_string(),
                                        BindingKind::RestProp,
                                        decl_kind,
                                    );
                                    self.bindings[idx].declaration_start = Some(*start);
                                } else {
                                    self.process_binding_pattern_typed(arg_node, None, decl_kind);
                                }
                            } else {
                                let arg_node = self.arena.get_js_node(*argument);
                                self.process_binding_pattern_typed(arg_node, None, decl_kind);
                            }
                        }
                        _ => {}
                    }
                }
            }
            JsNode::ArrayPattern { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.process_binding_pattern_typed(elem, None, decl_kind);
                }
            }
            JsNode::AssignmentPattern { left, .. } => {
                let left_node = self.arena.get_js_node(*left);
                self.process_binding_pattern_typed(left_node, init, decl_kind);
            }
            JsNode::RestElement { argument, .. } => {
                let arg_node = self.arena.get_js_node(*argument);
                self.process_binding_pattern_typed(arg_node, None, decl_kind);
            }
            _ => {}
        }
    }

    /// Process an import specifier from a typed JsNode.
    fn process_import_specifier_typed(&mut self, node: &JsNode, source_val: &str) {
        let (name, start, specifier_type) = match node {
            JsNode::ImportSpecifier {
                local, import_kind, ..
            } => {
                // Skip type-only specifiers
                if import_kind.as_deref() == Some("type") {
                    return;
                }
                let local_node = self.arena.get_js_node(*local);
                if let JsNode::Identifier { name, start, .. } = local_node {
                    (name.to_string(), *start, "ImportSpecifier")
                } else {
                    return;
                }
            }
            JsNode::ImportDefaultSpecifier { local, .. } => {
                let local_node = self.arena.get_js_node(*local);
                if let JsNode::Identifier { name, start, .. } = local_node {
                    (name.to_string(), *start, "ImportDefaultSpecifier")
                } else {
                    return;
                }
            }
            JsNode::ImportNamespaceSpecifier { local, .. } => {
                let local_node = self.arena.get_js_node(*local);
                if let JsNode::Identifier { name, start, .. } = local_node {
                    (name.to_string(), *start, "ImportNamespaceSpecifier")
                } else {
                    return;
                }
            }
            _ => return,
        };
        let binding_idx =
            self.declare_binding(name.clone(), BindingKind::Normal, DeclarationKind::Import);
        self.bindings[binding_idx].declaration_start = Some(start);
        // Store the ImportDeclaration as a JSON string on binding.initial,
        // matching the official Svelte compiler where binding.initial is the
        // ImportDeclaration AST node.
        let import_json = serde_json::json!({
            "type": "ImportDeclaration",
            "source": { "value": source_val },
            "specifiers": [{
                "type": specifier_type,
                "local": { "name": name }
            }]
        });
        self.bindings[binding_idx].initial = Some(import_json.to_string());
        self.bindings[binding_idx].initial_node_type = Some("ImportDeclaration".to_string());
        self.bindings[binding_idx].import_source = Some(source_val.to_string());
    }

    /// Process a function body (BlockStatement) from a typed JsNode.
    fn process_body_typed(&mut self, node: &JsNode) {
        if let JsNode::BlockStatement { body, .. } = node {
            let body = *body;
            for stmt in self.arena.get_js_children(body) {
                self.process_statement_typed(stmt);
            }
        }
    }

    /// Process a class body from a typed JsNode.
    fn process_class_body_typed(&mut self, node: &JsNode) {
        if let JsNode::ClassBody { body, .. } = node {
            let body = *body;
            for elem in self.arena.get_js_children(body) {
                match elem {
                    JsNode::MethodDefinition { value, .. } => {
                        let value_node = self.arena.get_js_node(*value);
                        if let JsNode::FunctionExpression { body, params, .. } = value_node {
                            let body = *body;
                            let params = *params;
                            let old_scope = self.push_function_scope();
                            self.function_depth += 1;
                            // Record method body start -> scope index so the visitor
                            // phase (`function_expression::visit_typed`) resolves
                            // identifiers inside the method against the method's own
                            // scope. Without this the body inherited the class/module
                            // scope, so a method-local `let x` shadowing a top-level
                            // function param `x` was misresolved to the outer
                            // (constant) binding and mis-reported as
                            // `constant_assignment` (issue #907 follow-up: runed
                            // `persisted-state`, `use-search-params`). Mirrors the
                            // typed `FunctionDeclaration` / `FunctionExpression`
                            // registration above.
                            if let Some(body_id) = body
                                && let Some(start) = self.arena.get_js_node(body_id).start()
                            {
                                self.function_scope_map.insert(start, self.current_scope);
                            }
                            // Declare function parameters
                            for param in self.arena.get_js_children(params) {
                                self.declare_bindings_from_pattern_node_with_kind(
                                    param,
                                    BindingKind::Normal,
                                    false,
                                    DeclarationKind::Param,
                                );
                            }
                            // Process method body
                            if let Some(body_id) = body {
                                self.process_body_typed(self.arena.get_js_node(body_id));
                            }
                            self.function_depth -= 1;
                            self.pop_scope(old_scope);
                        }
                    }
                    JsNode::PropertyDefinition {
                        value: Some(value), ..
                    } => {
                        self.track_node_expression_updates(self.arena.get_js_node(*value));
                    }
                    JsNode::StaticBlock { body, .. } => {
                        let body = *body;
                        let old_scope = self.push_scope();
                        for stmt in self.arena.get_js_children(body) {
                            self.process_statement_typed(stmt);
                        }
                        self.pop_scope(old_scope);
                    }
                    _ => {}
                }
            }
        }
    }

    /// Collect identifiers from the LHS of an assignment expression (typed path).
    /// Used to find possible implicit `legacy_reactive` declarations from `$: x = expr`.
    fn collect_assignment_lhs_identifiers_typed(&mut self, node: &JsNode) {
        match node {
            JsNode::Identifier { name, .. } if !name.starts_with('$') => {
                self.possible_implicit_declarations.push(name.to_string());
            }
            JsNode::ArrayPattern { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.collect_assignment_lhs_identifiers_typed(elem);
                }
            }
            JsNode::ObjectPattern { properties, .. } => {
                let properties = *properties;
                for prop in self.arena.get_js_children(properties) {
                    match prop {
                        JsNode::Property {
                            value, shorthand, ..
                        } => {
                            if *shorthand {
                                // Shorthand property: { x } means x is both key and value
                                let value_node = self.arena.get_js_node(*value);
                                self.collect_assignment_lhs_identifiers_typed(value_node);
                            } else {
                                let value_node = self.arena.get_js_node(*value);
                                self.collect_assignment_lhs_identifiers_typed(value_node);
                            }
                        }
                        JsNode::RestElement { argument, .. }
                        | JsNode::SpreadElement { argument, .. } => {
                            let arg_node = self.arena.get_js_node(*argument);
                            self.collect_assignment_lhs_identifiers_typed(arg_node);
                        }
                        _ => {}
                    }
                }
            }
            JsNode::AssignmentPattern { left, .. } => {
                let left_node = self.arena.get_js_node(*left);
                self.collect_assignment_lhs_identifiers_typed(left_node);
            }
            // MemberExpression, etc. - not implicit declarations
            _ => {}
        }
    }

    /// Detect the binding kind from a JsNode expression (e.g., $state(), $derived()).
    fn detect_binding_kind_from_node(&self, expr: &JsNode) -> BindingKind {
        if let JsNode::CallExpression { callee, .. } = expr {
            let callee_node = self.arena.get_js_node(*callee);
            // Handle direct calls like $state(), $derived(), $props()
            if let JsNode::Identifier { name, .. } = callee_node {
                let callee_name = name.as_str();
                let unprefixed = callee_name.strip_prefix('$').unwrap_or(callee_name);
                let has_unprefixed_binding = self.find_binding_in_scope_chain(unprefixed).is_some();
                let has_prefixed_binding = self.find_binding_in_scope_chain(callee_name).is_some();
                if !has_unprefixed_binding && !has_prefixed_binding {
                    match callee_name {
                        "$state" => return BindingKind::State,
                        "$derived" => return BindingKind::Derived,
                        "$props" => return BindingKind::Prop,
                        _ => {}
                    }
                }
            } else if let JsNode::MemberExpression {
                object, property, ..
            } = callee_node
            {
                // Handle $state.raw() and $derived.by()
                let obj_node = self.arena.get_js_node(*object);
                if let JsNode::Identifier { name: obj_name, .. } = obj_node {
                    let unprefixed = obj_name
                        .as_str()
                        .strip_prefix('$')
                        .unwrap_or(obj_name.as_str());
                    let has_unprefixed_binding =
                        self.find_binding_in_scope_chain(unprefixed).is_some();
                    let has_prefixed_binding = self
                        .find_binding_in_scope_chain(obj_name.as_str())
                        .is_some();
                    if !has_unprefixed_binding && !has_prefixed_binding {
                        let prop_node = self.arena.get_js_node(*property);
                        if let JsNode::Identifier {
                            name: prop_name, ..
                        } = prop_node
                        {
                            match (obj_name.as_str(), prop_name.as_str()) {
                                ("$state", "raw") => return BindingKind::RawState,
                                ("$derived", "by") => return BindingKind::Derived,
                                _ => {}
                            }
                        }
                    }
                }
            }
        }
        BindingKind::Normal
    }

    /// Process an OXC program AST.
    fn process_program(&mut self, program: &oxc_ast::ast::Program) {
        for stmt in &program.body {
            self.process_statement(stmt);
        }
    }

    /// Process a statement.
    fn process_statement(&mut self, stmt: &Statement) {
        match stmt {
            Statement::VariableDeclaration(var_decl) => {
                self.process_variable_declaration(var_decl);
            }
            Statement::ImportDeclaration(import_decl) => {
                self.process_import_declaration(import_decl);
            }
            Statement::FunctionDeclaration(func_decl) => {
                if let Some(id) = &func_decl.id {
                    let name = id.name.to_string();
                    let idx =
                        self.declare_binding(name, BindingKind::Normal, DeclarationKind::Function);
                    // Mark as a true JS function (not a snippet block)
                    self.bindings[idx].initial_is_function = true;
                    self.bindings[idx].declaration_start =
                        Some(id.span.start + self.current_script_offset as u32);
                }
                // Create a new scope for the function body (non-porous: function_depth + 1)
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                // Record function body start → scope index mapping for visitor phase
                // Use current_script_offset + body.span.start - 1 to match JSON AST positions
                // (expression.rs uses: offset + body.span.start - 1 for body.start in JSON AST)
                if let Some(ref body) = func_decl.body {
                    let key = (self.current_script_offset + body.span.start as usize) as u32;
                    self.function_scope_map.insert(key, self.current_scope);
                }

                // Declare function parameters in the new scope
                for param in &func_decl.params.items {
                    self.process_binding_pattern(&param.pattern, &None, DeclarationKind::Param);
                }

                // Process function body for assignments
                self.process_function_body(&func_decl.body);

                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            Statement::ClassDeclaration(class_decl) => {
                if let Some(id) = &class_decl.id {
                    let name = id.name.to_string();
                    // Class declarations use 'let' (not 'const') because class names
                    // are mutable bindings. This matches the official Svelte compiler:
                    // scope.declare(node.id, 'normal', 'let', node)
                    let idx = self.declare_binding(name, BindingKind::Normal, DeclarationKind::Let);
                    self.bindings[idx].declaration_start =
                        Some(id.span.start + self.current_script_offset as u32);
                }
                // Process class body to find assignments in methods, getters, setters, etc.
                self.process_class_body(&class_decl.body);
            }
            Statement::ExportNamedDeclaration(export_decl) => {
                if let Some(ref declaration) = export_decl.declaration {
                    self.process_declaration(declaration);
                }
            }
            Statement::ExportDefaultDeclaration(_) => {
                // Export default doesn't create a named binding in the module scope
            }
            Statement::ExpressionStatement(expr_stmt) => {
                // Process expressions to find assignments
                self.track_expression_updates(&expr_stmt.expression);
            }
            Statement::IfStatement(if_stmt) => {
                self.track_expression_updates(&if_stmt.test);
                self.process_statement(&if_stmt.consequent);
                if let Some(ref alternate) = if_stmt.alternate {
                    self.process_statement(alternate);
                }
            }
            Statement::WhileStatement(while_stmt) => {
                self.track_expression_updates(&while_stmt.test);
                self.process_statement(&while_stmt.body);
            }
            Statement::DoWhileStatement(do_while_stmt) => {
                self.process_statement(&do_while_stmt.body);
                self.track_expression_updates(&do_while_stmt.test);
            }
            Statement::ForStatement(for_stmt) => {
                // Create a new block scope for `let`/`const` declarations in the
                // for-loop initializer, so that `for (let x = 0; ...)` doesn't
                // leak `x` into the parent scope.
                let needs_scope = matches!(
                    &for_stmt.init,
                    Some(oxc_ast::ast::ForStatementInit::VariableDeclaration(var_decl))
                        if matches!(var_decl.kind,
                            oxc_ast::ast::VariableDeclarationKind::Let
                            | oxc_ast::ast::VariableDeclarationKind::Const)
                );
                let old_scope = if needs_scope {
                    Some(self.push_scope())
                } else {
                    None
                };
                if let Some(oxc_ast::ast::ForStatementInit::VariableDeclaration(var_decl)) =
                    &for_stmt.init
                {
                    self.process_variable_declaration(var_decl);
                }
                if let Some(ref test) = for_stmt.test {
                    self.track_expression_updates(test);
                }
                if let Some(ref update) = for_stmt.update {
                    self.track_expression_updates(update);
                }
                self.process_statement(&for_stmt.body);
                if let Some(old) = old_scope {
                    self.pop_scope(old);
                }
            }
            Statement::ForInStatement(for_in_stmt) => {
                // Declare the loop variable in a new scope if it's a let/const
                // VariableDeclaration. This ensures the name ends up in root.conflicts
                // so generated variables like `node_N` correctly avoid it.
                let needs_scope = matches!(
                    &for_in_stmt.left,
                    oxc_ast::ast::ForStatementLeft::VariableDeclaration(d)
                        if matches!(d.kind, oxc_ast::ast::VariableDeclarationKind::Let
                            | oxc_ast::ast::VariableDeclarationKind::Const)
                );
                let old_scope = if needs_scope {
                    Some(self.push_scope())
                } else {
                    None
                };
                if let oxc_ast::ast::ForStatementLeft::VariableDeclaration(var_decl) =
                    &for_in_stmt.left
                {
                    self.process_variable_declaration(var_decl);
                }
                self.track_expression_updates(&for_in_stmt.right);
                self.process_statement(&for_in_stmt.body);
                if let Some(old) = old_scope {
                    self.pop_scope(old);
                }
            }
            Statement::ForOfStatement(for_of_stmt) => {
                let needs_scope = matches!(
                    &for_of_stmt.left,
                    oxc_ast::ast::ForStatementLeft::VariableDeclaration(d)
                        if matches!(d.kind, oxc_ast::ast::VariableDeclarationKind::Let
                            | oxc_ast::ast::VariableDeclarationKind::Const)
                );
                let old_scope = if needs_scope {
                    Some(self.push_scope())
                } else {
                    None
                };
                if let oxc_ast::ast::ForStatementLeft::VariableDeclaration(var_decl) =
                    &for_of_stmt.left
                {
                    self.process_variable_declaration(var_decl);
                }
                self.track_expression_updates(&for_of_stmt.right);
                self.process_statement(&for_of_stmt.body);
                if let Some(old) = old_scope {
                    self.pop_scope(old);
                }
            }
            Statement::BlockStatement(block_stmt) => {
                // Block statements create a new scope for `let` and `const` declarations
                // This is important for correctly handling scoping in blocks like:
                // $: { let d = 'dd'; } where d should not conflict with outer d
                let old_scope = self.push_scope();
                for stmt in &block_stmt.body {
                    self.process_statement(stmt);
                }
                self.pop_scope(old_scope);
            }
            Statement::ReturnStatement(return_stmt) => {
                if let Some(ref argument) = return_stmt.argument {
                    self.track_expression_updates(argument);
                }
            }
            Statement::TryStatement(try_stmt) => {
                // The try block is its own lexical scope; `let`/`const` inside it
                // must not leak to the enclosing scope.
                let old_scope = self.push_scope();
                for stmt in &try_stmt.block.body {
                    self.process_statement(stmt);
                }
                self.pop_scope(old_scope);
                // Process catch clause if present
                if let Some(ref handler) = try_stmt.handler {
                    // Create a new scope for catch block (to handle catch parameter)
                    let old_scope = self.push_scope();
                    // Declare catch parameter if present
                    if let Some(ref param) = handler.param {
                        self.process_binding_pattern(&param.pattern, &None, DeclarationKind::Param);
                    }
                    for stmt in &handler.body.body {
                        self.process_statement(stmt);
                    }
                    self.pop_scope(old_scope);
                }
                // The finally block is also its own lexical scope.
                if let Some(ref finalizer) = try_stmt.finalizer {
                    let old_scope = self.push_scope();
                    for stmt in &finalizer.body {
                        self.process_statement(stmt);
                    }
                    self.pop_scope(old_scope);
                }
            }
            Statement::ThrowStatement(throw_stmt) => {
                self.track_expression_updates(&throw_stmt.argument);
            }
            Statement::SwitchStatement(switch_stmt) => {
                self.track_expression_updates(&switch_stmt.discriminant);
                // The switch block is a single lexical scope shared by all cases
                // (mirrors the official compiler's `create_block_scope`), so
                // `let`/`const` in a case body doesn't leak to the enclosing scope.
                let old_scope = self.push_scope();
                for case in &switch_stmt.cases {
                    if let Some(ref test) = case.test {
                        self.track_expression_updates(test);
                    }
                    for stmt in &case.consequent {
                        self.process_statement(stmt);
                    }
                }
                self.pop_scope(old_scope);
            }
            Statement::LabeledStatement(labeled_stmt) => {
                // Check for `$:` reactive declarations in legacy mode
                // Collect LHS identifiers as possible implicit declarations
                // Reference: scope.js lines 1015-1024
                if labeled_stmt.label.name == "$"
                    && !self.runes_mode
                    && let Statement::ExpressionStatement(expr_stmt) = &labeled_stmt.body
                {
                    // Extract identifiers from the LHS of the assignment.
                    // Handle both direct AssignmentExpression and ParenthesizedExpression
                    // wrapping (e.g., `$: ({ foo } = expr)` has a ParenthesizedExpression).
                    let expr = &expr_stmt.expression;
                    let inner_expr =
                        if let oxc_ast::ast::Expression::ParenthesizedExpression(paren) = expr {
                            &paren.expression
                        } else {
                            expr
                        };
                    // Only a top-level `$:` (direct child of the instance
                    // Program, `function_depth == 1`) declares an implicit
                    // reactive binding. A `$:` inside a function body is a plain
                    // labeled statement (upstream scope.js LabeledStatement guard
                    // `path.length > 1`).
                    if let oxc_ast::ast::Expression::AssignmentExpression(assign) = inner_expr
                        && self.function_depth == 1
                    {
                        self.collect_assignment_lhs_identifiers(&assign.left);
                    }
                }
                self.process_statement(&labeled_stmt.body);
            }
            Statement::WithStatement(with_stmt) => {
                self.track_expression_updates(&with_stmt.object);
                self.process_statement(&with_stmt.body);
            }
            _ => {}
        }
    }

    /// Process a function body to look for assignments.
    fn process_function_body(
        &mut self,
        body: &Option<oxc_allocator::Box<oxc_ast::ast::FunctionBody>>,
    ) {
        if let Some(body) = body {
            for stmt in &body.statements {
                self.process_statement(stmt);
            }
        }
    }

    /// Process a class body to look for assignments in methods, getters, setters, etc.
    fn process_class_body(&mut self, body: &oxc_ast::ast::ClassBody) {
        for element in &body.body {
            match element {
                oxc_ast::ast::ClassElement::MethodDefinition(method_def) => {
                    // Create a new scope for the method (non-porous)
                    let old_scope = self.push_function_scope();
                    self.function_depth += 1;

                    // Record method body start → scope index so the visitor phase
                    // (`function_expression::visit`) resolves identifiers against
                    // the method's own scope. Without this the method body inherited
                    // the class/module scope, so a method-local `let x` that shadows
                    // a top-level function param `x` was misresolved to the outer
                    // (constant) binding and mis-reported as `constant_assignment`
                    // (issue #907 follow-up: runed `persisted-state`). Mirrors the
                    // `FunctionDeclaration` / `FunctionExpression` registration.
                    if let Some(ref body) = method_def.value.body {
                        let key = (self.current_script_offset + body.span.start as usize) as u32;
                        self.function_scope_map.insert(key, self.current_scope);
                    }

                    // Declare function parameters in the new scope
                    for param in &method_def.value.params.items {
                        self.process_binding_pattern(&param.pattern, &None, DeclarationKind::Param);
                    }

                    // Process method body for assignments
                    self.process_function_body(&method_def.value.body);

                    self.function_depth -= 1;
                    self.pop_scope(old_scope);
                }
                oxc_ast::ast::ClassElement::PropertyDefinition(prop_def) => {
                    // Process property initializer if it exists
                    if let Some(ref value) = prop_def.value {
                        self.track_expression_updates(value);
                    }
                }
                oxc_ast::ast::ClassElement::AccessorProperty(accessor_prop) => {
                    // Process accessor property value if it exists
                    if let Some(ref value) = accessor_prop.value {
                        self.track_expression_updates(value);
                    }
                }
                oxc_ast::ast::ClassElement::StaticBlock(static_block) => {
                    // Process static block statements
                    let old_scope = self.push_scope();
                    for stmt in &static_block.body {
                        self.process_statement(stmt);
                    }
                    self.pop_scope(old_scope);
                }
                oxc_ast::ast::ClassElement::TSIndexSignature(_) => {
                    // TypeScript index signatures don't have assignments
                }
            }
        }
    }

    /// Track updates (assignments, update expressions) in an expression.
    fn track_expression_updates(&mut self, expr: &Expression) {
        match expr {
            Expression::AssignmentExpression(assign_expr) => {
                // Track the assignment
                self.track_assignment_target(&assign_expr.left);
                // Also track updates in the right-hand side
                self.track_expression_updates(&assign_expr.right);
            }
            Expression::UpdateExpression(update_expr) => {
                // Track the update
                self.track_simple_assignment_target(&update_expr.argument);
            }
            Expression::CallExpression(call_expr) => {
                // Track updates in callee and arguments
                self.track_expression_updates(&call_expr.callee);
                for arg in &call_expr.arguments {
                    match arg {
                        oxc_ast::ast::Argument::SpreadElement(spread) => {
                            self.track_expression_updates(&spread.argument);
                        }
                        _ => {
                            if let Some(expr) = arg.as_expression() {
                                self.track_expression_updates(expr);
                            }
                        }
                    }
                }
            }
            Expression::ArrowFunctionExpression(arrow_func) => {
                // Create a new scope for the arrow function body (non-porous)
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                // Record function body start → scope index mapping for visitor phase
                // For arrow functions with block body, use offset + span.start - 1
                {
                    let key =
                        (self.current_script_offset + arrow_func.body.span.start as usize) as u32;
                    self.function_scope_map.insert(key, self.current_scope);
                }

                // Declare function parameters in the new scope
                for param in &arrow_func.params.items {
                    self.process_binding_pattern(&param.pattern, &None, DeclarationKind::Param);
                }

                // Track updates in arrow function body
                for stmt in &arrow_func.body.statements {
                    self.process_statement(stmt);
                }

                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            Expression::FunctionExpression(func_expr) => {
                // Create a new scope for the function body (non-porous)
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                // Record function body start → scope index mapping for visitor phase
                if let Some(ref body) = func_expr.body {
                    let key = (self.current_script_offset + body.span.start as usize) as u32;
                    self.function_scope_map.insert(key, self.current_scope);
                }

                // Declare function parameters in the new scope
                for param in &func_expr.params.items {
                    self.process_binding_pattern(&param.pattern, &None, DeclarationKind::Param);
                }

                // Track updates in function body
                self.process_function_body(&func_expr.body);

                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            Expression::ConditionalExpression(cond_expr) => {
                self.track_expression_updates(&cond_expr.test);
                self.track_expression_updates(&cond_expr.consequent);
                self.track_expression_updates(&cond_expr.alternate);
            }
            Expression::LogicalExpression(logical_expr) => {
                self.track_expression_updates(&logical_expr.left);
                self.track_expression_updates(&logical_expr.right);
            }
            Expression::BinaryExpression(binary_expr) => {
                self.track_expression_updates(&binary_expr.left);
                self.track_expression_updates(&binary_expr.right);
            }
            Expression::UnaryExpression(unary_expr) => {
                self.track_expression_updates(&unary_expr.argument);
            }
            Expression::SequenceExpression(seq_expr) => {
                for expr in &seq_expr.expressions {
                    self.track_expression_updates(expr);
                }
            }
            Expression::ArrayExpression(array_expr) => {
                for elem in &array_expr.elements {
                    match elem {
                        oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                            self.track_expression_updates(&spread.argument);
                        }
                        _ => {
                            if let Some(expr) = elem.as_expression() {
                                self.track_expression_updates(expr);
                            }
                        }
                    }
                }
            }
            Expression::ObjectExpression(obj_expr) => {
                for prop in &obj_expr.properties {
                    match prop {
                        oxc_ast::ast::ObjectPropertyKind::ObjectProperty(obj_prop) => {
                            self.track_expression_updates(&obj_prop.value);
                        }
                        oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                            self.track_expression_updates(&spread.argument);
                        }
                    }
                }
            }
            Expression::StaticMemberExpression(member_expr) => {
                self.track_expression_updates(&member_expr.object);
            }
            Expression::ComputedMemberExpression(member_expr) => {
                self.track_expression_updates(&member_expr.object);
            }
            Expression::PrivateFieldExpression(member_expr) => {
                self.track_expression_updates(&member_expr.object);
            }
            Expression::TemplateLiteral(template_literal) => {
                for expr in &template_literal.expressions {
                    self.track_expression_updates(expr);
                }
            }
            Expression::TaggedTemplateExpression(tagged_template) => {
                self.track_expression_updates(&tagged_template.tag);
                for expr in &tagged_template.quasi.expressions {
                    self.track_expression_updates(expr);
                }
            }
            Expression::NewExpression(new_expr) => {
                self.track_expression_updates(&new_expr.callee);
                for arg in &new_expr.arguments {
                    match arg {
                        oxc_ast::ast::Argument::SpreadElement(spread) => {
                            self.track_expression_updates(&spread.argument);
                        }
                        _ => {
                            if let Some(expr) = arg.as_expression() {
                                self.track_expression_updates(expr);
                            }
                        }
                    }
                }
            }
            Expression::AwaitExpression(await_expr) => {
                self.track_expression_updates(&await_expr.argument);
            }
            Expression::YieldExpression(yield_expr) => {
                if let Some(ref argument) = yield_expr.argument {
                    self.track_expression_updates(argument);
                }
            }
            Expression::ParenthesizedExpression(paren_expr) => {
                self.track_expression_updates(&paren_expr.expression);
            }
            Expression::ChainExpression(chain_expr) => {
                // Convert ChainElement back to Expression-like tracking.
                // A ChainElement is either a CallExpression or a MemberExpression.
                match &chain_expr.expression {
                    oxc_ast::ast::ChainElement::CallExpression(call_expr) => {
                        self.track_expression_updates(&call_expr.callee);
                        for arg in &call_expr.arguments {
                            match arg {
                                oxc_ast::ast::Argument::SpreadElement(spread) => {
                                    self.track_expression_updates(&spread.argument);
                                }
                                _ => {
                                    if let Some(expr) = arg.as_expression() {
                                        self.track_expression_updates(expr);
                                    }
                                }
                            }
                        }
                    }
                    oxc_ast::ast::ChainElement::ComputedMemberExpression(member_expr) => {
                        self.track_expression_updates(&member_expr.object);
                        self.track_expression_updates(&member_expr.expression);
                    }
                    oxc_ast::ast::ChainElement::StaticMemberExpression(member_expr) => {
                        self.track_expression_updates(&member_expr.object);
                    }
                    oxc_ast::ast::ChainElement::PrivateFieldExpression(member_expr) => {
                        self.track_expression_updates(&member_expr.object);
                    }
                    _ => {}
                }
            }
            Expression::ClassExpression(class_expr) => {
                // Process class body to find assignments in methods, getters, setters, etc.
                self.process_class_body(&class_expr.body);
            }
            // Handle identifiers - check for store subscription scoping errors
            Expression::Identifier(ident) => {
                // Check for $xxx references inside nested scopes where xxx is locally declared
                let name = ident.name.as_str();
                if name.starts_with('$')
                    && !name.starts_with("$$")
                    && name.len() > 1
                    && self.function_depth > 0
                {
                    // Skip rune names - they are never store subscriptions.
                    // This is especially important because the scope builder runs before
                    // runes mode is auto-detected, so we can't rely on self.runes_mode.
                    // Code like `const state = $state(value)` inside a function should
                    // NOT trigger store_invalid_scoped_subscription.
                    let is_rune_name = matches!(
                        name,
                        "$state"
                            | "$derived"
                            | "$props"
                            | "$bindable"
                            | "$effect"
                            | "$inspect"
                            | "$host"
                    );

                    if !is_rune_name {
                        self.check_store_scoped_subscription(&name[1..]);
                    }
                }
            }
            // TypeScript expression wrappers - unwrap and recurse into the inner expression.
            // These are produced when parsing with SourceType::ts() and wrap JS expressions
            // with type information (e.g., `x as number`, `x!`, `x satisfies T`, `<T>x`).
            Expression::TSAsExpression(ts_expr) => {
                self.track_expression_updates(&ts_expr.expression);
            }
            Expression::TSNonNullExpression(ts_expr) => {
                self.track_expression_updates(&ts_expr.expression);
            }
            Expression::TSSatisfiesExpression(ts_expr) => {
                self.track_expression_updates(&ts_expr.expression);
            }
            Expression::TSTypeAssertion(ts_expr) => {
                self.track_expression_updates(&ts_expr.expression);
            }
            Expression::TSInstantiationExpression(ts_expr) => {
                self.track_expression_updates(&ts_expr.expression);
            }
            Expression::BooleanLiteral(_)
            | Expression::NullLiteral(_)
            | Expression::NumericLiteral(_)
            | Expression::StringLiteral(_)
            | Expression::BigIntLiteral(_)
            | Expression::RegExpLiteral(_)
            | Expression::ThisExpression(_)
            | Expression::Super(_)
            | Expression::ImportMeta(_)
            | Expression::NewTarget(_) => {}
            // Skip other complex expressions for now
            _ => {}
        }
    }

    /// Track an assignment target (left-hand side of assignment).
    fn track_assignment_target(&mut self, target: &oxc_ast::ast::AssignmentTarget) {
        match target {
            oxc_ast::ast::AssignmentTarget::AssignmentTargetIdentifier(ident) => {
                let name = ident.name.as_str();

                // Check for $xxx assignments inside nested scopes where xxx is locally declared
                if name.starts_with('$')
                    && !name.starts_with("$$")
                    && name.len() > 1
                    && self.function_depth > 0
                {
                    // Skip rune names - they are never store subscriptions
                    let is_rune_name = matches!(
                        name,
                        "$state"
                            | "$derived"
                            | "$props"
                            | "$bindable"
                            | "$effect"
                            | "$inspect"
                            | "$host"
                    );

                    if !is_rune_name {
                        self.check_store_scoped_subscription(&name[1..]);
                    }
                }

                self.updates.push(Update {
                    name: name.to_string(),
                    is_direct_assignment: true,
                    scope_idx: self.current_scope,
                });
            }
            oxc_ast::ast::AssignmentTarget::StaticMemberExpression(member) => {
                // For member expressions like obj.prop = value, track the base object as mutated
                if let Some(name) = self.get_base_identifier_name(&member.object) {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            oxc_ast::ast::AssignmentTarget::ComputedMemberExpression(member) => {
                // For computed member expressions like obj[prop] = value
                if let Some(name) = self.get_base_identifier_name(&member.object) {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(array_target) => {
                // For destructuring assignment [a, b] = [1, 2]
                for target in array_target.elements.iter().flatten() {
                    match target {
                        oxc_ast::ast::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(
                            with_default,
                        ) => {
                            self.track_assignment_target(&with_default.binding);
                        }
                        _ => {
                            if let Some(target) = target.as_assignment_target() {
                                self.track_assignment_target(target);
                            }
                        }
                    }
                }
            }
            oxc_ast::ast::AssignmentTarget::ObjectAssignmentTarget(obj_target) => {
                // For destructuring assignment { a, b } = obj
                for prop in &obj_target.properties {
                    match prop {
                        oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(ident_prop) => {
                            self.updates.push(Update {
                                name: ident_prop.binding.name.to_string(),
                                is_direct_assignment: true,
                                scope_idx: self.current_scope,
                            });
                        }
                        oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop_prop) => {
                            match &prop_prop.binding {
                                oxc_ast::ast::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(with_default) => {
                                    self.track_assignment_target(&with_default.binding);
                                }
                                _ => {
                                    if let Some(target) = prop_prop.binding.as_assignment_target() {
                                        self.track_assignment_target(target);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }

    /// Track a simple assignment target (argument of update expression).
    fn track_simple_assignment_target(&mut self, target: &oxc_ast::ast::SimpleAssignmentTarget) {
        match target {
            oxc_ast::ast::SimpleAssignmentTarget::AssignmentTargetIdentifier(ident) => {
                self.updates.push(Update {
                    name: ident.name.to_string(),
                    is_direct_assignment: true,
                    scope_idx: self.current_scope,
                });
            }
            oxc_ast::ast::SimpleAssignmentTarget::StaticMemberExpression(member) => {
                if let Some(name) = self.get_base_identifier_name(&member.object) {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            oxc_ast::ast::SimpleAssignmentTarget::ComputedMemberExpression(member) => {
                if let Some(name) = self.get_base_identifier_name(&member.object) {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            _ => {}
        }
    }

    /// Get the base identifier name from an expression (walking through member expressions).
    #[allow(clippy::only_used_in_recursion)]
    fn get_base_identifier_name(&self, expr: &Expression) -> Option<String> {
        match expr {
            Expression::Identifier(ident) => Some(ident.name.to_string()),
            Expression::StaticMemberExpression(member) => {
                self.get_base_identifier_name(&member.object)
            }
            Expression::ComputedMemberExpression(member) => {
                self.get_base_identifier_name(&member.object)
            }
            Expression::ParenthesizedExpression(paren) => {
                self.get_base_identifier_name(&paren.expression)
            }
            _ => None,
        }
    }

    /// Process a declaration (from export statements).
    fn process_declaration(&mut self, decl: &Declaration) {
        match decl {
            Declaration::VariableDeclaration(var_decl) => {
                self.process_variable_declaration(var_decl);
            }
            Declaration::FunctionDeclaration(func_decl) => {
                if let Some(id) = &func_decl.id {
                    let name = id.name.to_string();
                    let idx =
                        self.declare_binding(name, BindingKind::Normal, DeclarationKind::Function);
                    self.bindings[idx].initial_is_function = true;
                }
                // Process function body to track assignments inside exported functions.
                // Without this, reassignments like `export function update() { x = 'new'; }`
                // would not mark `x` as reassigned, causing state_invalid_export to be missed.
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                // Record function body start → scope index mapping for visitor phase
                // Use current_script_offset + body.span.start - 1 to match JSON AST positions
                // (expression.rs uses: offset + body.span.start - 1 for body.start in JSON AST)
                if let Some(ref body) = func_decl.body {
                    let key = (self.current_script_offset + body.span.start as usize) as u32;
                    self.function_scope_map.insert(key, self.current_scope);
                }
                for param in &func_decl.params.items {
                    self.process_binding_pattern(&param.pattern, &None, DeclarationKind::Param);
                }
                self.process_function_body(&func_decl.body);
                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            Declaration::ClassDeclaration(class_decl) => {
                if let Some(id) = &class_decl.id {
                    let name = id.name.to_string();
                    // Class declarations use 'let' (not 'const') because class names
                    // are mutable bindings. This matches the official Svelte compiler.
                    self.declare_binding(name, BindingKind::Normal, DeclarationKind::Let);
                }
                // Process class body to find assignments in methods, getters, setters, etc.
                self.process_class_body(&class_decl.body);
            }
            _ => {}
        }
    }

    /// Process a variable declaration.
    fn process_variable_declaration(&mut self, var_decl: &VariableDeclaration) {
        let decl_kind = match var_decl.kind {
            VariableDeclarationKind::Const => DeclarationKind::Const,
            VariableDeclarationKind::Let => DeclarationKind::Let,
            VariableDeclarationKind::Var => DeclarationKind::Var,
            VariableDeclarationKind::Using | VariableDeclarationKind::AwaitUsing => {
                DeclarationKind::Const // Treat using/await using as const
            }
        };

        for declarator in &var_decl.declarations {
            self.process_binding_pattern(&declarator.id, &declarator.init, decl_kind);
            // Also track updates in the initializer expression (e.g., assignments in callbacks)
            if let Some(ref init) = declarator.init {
                self.track_expression_updates(init);
            }
        }
    }

    /// Process a binding pattern (identifier, destructuring, etc.).
    fn process_binding_pattern(
        &mut self,
        pattern: &BindingPattern,
        init: &Option<Expression>,
        decl_kind: DeclarationKind,
    ) {
        match pattern {
            BindingPattern::BindingIdentifier(ident) => {
                let name = ident.name.to_string();
                let kind = if let Some(init_expr) = init {
                    self.detect_binding_kind_from_expr(init_expr)
                } else {
                    BindingKind::Normal
                };
                let idx = self.declare_binding(name, kind, decl_kind);
                // Store the declaration position for var hoisting analysis.
                // Used by the state_referenced_locally warning to skip references
                // that appear before the var declaration in source order.
                // Add current_script_offset so positions align with the JSON AST
                // positions used by the visitor phase.
                self.bindings[idx].declaration_start =
                    Some(ident.span.start + self.current_script_offset as u32);
                // Check if the initializer is a function expression
                if let Some(init_expr) = init
                    && matches!(
                        init_expr,
                        oxc_ast::ast::Expression::ArrowFunctionExpression(_)
                            | oxc_ast::ast::Expression::FunctionExpression(_)
                    )
                {
                    self.bindings[idx].initial_is_function = true;
                }
            }
            BindingPattern::ObjectPattern(obj) => {
                // Detect if this ObjectPattern is initialized from $props().
                // We need to detect this here (before update_binding_kinds runs in Phase 2
                // variable_declarator.rs) because detect_store_subscriptions runs before
                // the variable_declarator visitor and needs the correct kind for rest props.
                let is_props_init = init
                    .as_ref()
                    .map(|i| matches!(self.detect_binding_kind_from_expr(i), BindingKind::Prop))
                    .unwrap_or(false);

                for prop in &obj.properties {
                    self.process_binding_pattern(&prop.value, &None, decl_kind);
                }
                if let Some(rest) = &obj.rest {
                    if is_props_init {
                        // For `let { ...rest } = $props()`, the rest binding must be RestProp
                        // so that detect_store_subscriptions correctly identifies $props as
                        // a rune (not a store subscription).
                        if let BindingPattern::BindingIdentifier(ident) = &rest.argument {
                            let idx = self.declare_binding(
                                ident.name.to_string(),
                                BindingKind::RestProp,
                                decl_kind,
                            );
                            self.bindings[idx].declaration_start =
                                Some(ident.span.start + self.current_script_offset as u32);
                        } else {
                            self.process_binding_pattern(&rest.argument, &None, decl_kind);
                        }
                    } else {
                        self.process_binding_pattern(&rest.argument, &None, decl_kind);
                    }
                }
            }
            BindingPattern::ArrayPattern(arr) => {
                for elem_pattern in (&arr.elements).into_iter().flatten() {
                    self.process_binding_pattern(elem_pattern, &None, decl_kind);
                }
                if let Some(rest) = &arr.rest {
                    self.process_binding_pattern(&rest.argument, &None, decl_kind);
                }
            }
            BindingPattern::AssignmentPattern(assign) => {
                self.process_binding_pattern(&assign.left, init, decl_kind);
            }
        }
    }

    /// Detect the binding kind from an expression (e.g., $state(), $derived()).
    fn detect_binding_kind_from_expr(&self, expr: &Expression) -> BindingKind {
        if let Expression::CallExpression(call) = expr {
            // Handle direct calls like $state(), $derived(), $props()
            if let Expression::Identifier(ident) = &call.callee {
                // Check if the callee name (without $) has a binding in the scope chain.
                // If it does, this is a store call (e.g., $state imported from a store),
                // not a rune invocation. For example:
                //   import { state } from './store.js';
                //   let foo = $state(0); // store call, NOT $state rune
                //
                // Also check if the full callee name (with $) has a binding in the scope chain.
                // If it does, the rune name is shadowed by a parameter or local variable.
                // For example:
                //   function bar($derived, $effect) {
                //     const x = $derived(foo + 1); // NOT a $derived rune, it's a function param
                //   }
                let callee_name = ident.name.as_str();
                let unprefixed = callee_name.strip_prefix('$').unwrap_or(callee_name);
                let has_unprefixed_binding = self.find_binding_in_scope_chain(unprefixed).is_some();
                let has_prefixed_binding = self.find_binding_in_scope_chain(callee_name).is_some();

                if !has_unprefixed_binding && !has_prefixed_binding {
                    match callee_name {
                        "$state" => return BindingKind::State,
                        "$derived" => return BindingKind::Derived,
                        "$props" => return BindingKind::Prop,
                        _ => {}
                    }
                }
            } else if let Expression::StaticMemberExpression(member) = &call.callee {
                // Handle $state.raw() and $derived.by()
                if let Expression::Identifier(obj) = &member.object {
                    let obj_name = obj.name.as_str();
                    let unprefixed = obj_name.strip_prefix('$').unwrap_or(obj_name);
                    let has_unprefixed_binding =
                        self.find_binding_in_scope_chain(unprefixed).is_some();
                    let has_prefixed_binding = self.find_binding_in_scope_chain(obj_name).is_some();

                    if !has_unprefixed_binding && !has_prefixed_binding {
                        match (obj_name, member.property.name.as_str()) {
                            ("$state", "raw") => return BindingKind::RawState,
                            ("$derived", "by") => return BindingKind::Derived,
                            _ => {}
                        }
                    }
                }
            }
        }
        BindingKind::Normal
    }

    /// Process an import declaration.
    fn process_import_declaration(&mut self, import_decl: &oxc_ast::ast::ImportDeclaration) {
        // Skip type-only imports: `import type { ... } from '...'`
        if import_decl.import_kind == oxc_ast::ast::ImportOrExportKind::Type {
            return;
        }
        let source_val = import_decl.source.value.as_str();
        if let Some(specifiers) = &import_decl.specifiers {
            for specifier in specifiers {
                let (name, start, specifier_type) = match specifier {
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) => {
                        // Skip per-specifier type imports: `import { type Foo, Bar }`
                        if spec.import_kind == oxc_ast::ast::ImportOrExportKind::Type {
                            continue;
                        }
                        (
                            spec.local.name.to_string(),
                            spec.local.span.start,
                            "ImportSpecifier",
                        )
                    }
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(spec) => (
                        spec.local.name.to_string(),
                        spec.local.span.start,
                        "ImportDefaultSpecifier",
                    ),
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(spec) => (
                        spec.local.name.to_string(),
                        spec.local.span.start,
                        "ImportNamespaceSpecifier",
                    ),
                };
                let binding_idx = self.declare_binding(
                    name.clone(),
                    BindingKind::Normal,
                    DeclarationKind::Import,
                );
                self.bindings[binding_idx].declaration_start =
                    Some(start + self.current_script_offset as u32);
                // Store the ImportDeclaration as a JSON string on binding.initial,
                // matching the official Svelte compiler where binding.initial is the
                // ImportDeclaration AST node. This allows ExpressionStatement visitor
                // to check the import source for legacy_component_creation warning.
                let import_json = serde_json::json!({
                    "type": "ImportDeclaration",
                    "source": { "value": source_val },
                    "specifiers": [{
                        "type": specifier_type,
                        "local": { "name": name }
                    }]
                });
                self.bindings[binding_idx].initial = Some(import_json.to_string());
            }
        }
    }

    /// Visit a template fragment.
    fn visit_fragment(&mut self, fragment: &Fragment) {
        for node in &fragment.nodes {
            self.visit_node(node);
        }
    }

    /// Visit a template node.
    fn visit_node(&mut self, node: &TemplateNode) {
        match node {
            TemplateNode::RegularElement(element) => self.visit_element(element),
            TemplateNode::EachBlock(block) => self.visit_each_block(block),
            TemplateNode::IfBlock(block) => self.visit_if_block(block),
            TemplateNode::AwaitBlock(block) => self.visit_await_block(block),
            TemplateNode::KeyBlock(block) => self.visit_key_block(block),
            TemplateNode::SnippetBlock(block) => self.visit_snippet_block(block),
            TemplateNode::Component(component) => {
                // Process expressions in component attributes
                self.process_attributes(&component.attributes);
                // Create a new scope for component children
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(component.start, self.current_scope);
                // Declare let: directive bindings in the child scope
                self.declare_let_directive_bindings(&component.attributes);
                // Visit component children
                self.visit_fragment(&component.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::ConstTag(tag) => self.visit_const_tag(tag),
            TemplateNode::DeclarationTag(tag) => self.visit_declaration_tag(tag),
            // SvelteBoundary gets its own scope so that {@const} declarations
            // inside separate <svelte:boundary> blocks don't conflict.
            TemplateNode::SvelteBoundary(elem) => {
                self.process_attributes(&elem.attributes);
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(elem.start, self.current_scope);
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            // Handle special Svelte elements that have attributes and fragments
            TemplateNode::SvelteBody(elem)
            | TemplateNode::SvelteDocument(elem)
            | TemplateNode::SvelteHead(elem)
            | TemplateNode::SvelteOptions(elem)
            | TemplateNode::SvelteWindow(elem) => {
                self.process_attributes(&elem.attributes);
                self.visit_fragment(&elem.fragment);
            }
            // SvelteFragment, SlotElement, SvelteElement each get their own scope
            // (matching the official Svelte compiler where these all use the SvelteFragment handler)
            TemplateNode::SvelteFragment(elem) => {
                self.process_attributes(&elem.attributes);
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(elem.start, self.current_scope);
                self.declare_let_directive_bindings(&elem.attributes);
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::SvelteSelf(elem) => {
                self.process_attributes(&elem.attributes);
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(elem.start, self.current_scope);
                self.declare_let_directive_bindings(&elem.attributes);
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::SvelteComponent(elem) => {
                self.process_attributes(&elem.attributes);
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(elem.start, self.current_scope);
                self.declare_let_directive_bindings(&elem.attributes);
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::SvelteElement(elem) => {
                self.process_attributes(&elem.attributes);
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(elem.start, self.current_scope);
                self.declare_let_directive_bindings(&elem.attributes);
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::TitleElement(elem) => {
                self.process_attributes(&elem.attributes);
                self.visit_fragment(&elem.fragment);
            }
            TemplateNode::SlotElement(elem) => {
                self.process_attributes(&elem.attributes);
                let old_scope = self.push_scope();
                self.template_scope_map
                    .insert(elem.start, self.current_scope);
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            // Other nodes don't create scopes
            _ => {}
        }
    }

    /// Visit a regular element.
    fn visit_element(&mut self, element: &RegularElement) {
        // Process expressions in attributes (for tracking updates)
        self.process_attributes(&element.attributes);

        // Create a new scope for element children
        let old_scope = self.push_scope();
        self.template_scope_map
            .insert(element.start, self.current_scope);
        // Declare let: directive bindings in the child scope
        self.declare_let_directive_bindings(&element.attributes);
        self.visit_fragment(&element.fragment);
        self.pop_scope(old_scope);
    }

    /// Declare bindings from let: directives in the current scope.
    ///
    /// Corresponds to the LetDirective handler in Svelte's scope.js (lines 1048-1072).
    /// let: directive bindings are declared with kind='template' (BindingKind::Let)
    /// and declaration_kind='const' (DeclarationKind::Const).
    fn declare_let_directive_bindings(&mut self, attributes: &[crate::ast::template::Attribute]) {
        use crate::ast::template::Attribute;

        for attr in attributes {
            if let Attribute::LetDirective(let_dir) = attr {
                if let Some(ref expression) = let_dir.expression {
                    // Destructured let directive: let:x={{ a, b }}
                    // Extract identifiers from the destructuring pattern
                    let node = expression.as_node();
                    self.declare_bindings_from_pattern_node(&node, BindingKind::Let, false);
                } else {
                    // Simple let directive: let:bar
                    self.declare_binding(
                        let_dir.name.to_string(),
                        BindingKind::Let,
                        DeclarationKind::Const,
                    );
                }
            }
        }
    }

    /// Process attributes to find expressions containing updates.
    fn process_attributes(&mut self, attributes: &[crate::ast::template::Attribute]) {
        use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart};

        for attr in attributes {
            match attr {
                Attribute::Attribute(attr_node) => {
                    // Process expression values
                    match &attr_node.value {
                        AttributeValue::Expression(expr_tag) => {
                            self.process_template_expression(&expr_tag.expression);
                        }
                        AttributeValue::Sequence(parts) => {
                            for part in parts {
                                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                                    self.process_template_expression(&expr_tag.expression);
                                }
                            }
                        }
                        _ => {}
                    }
                }
                Attribute::OnDirective(on_dir) => {
                    // Process onclick, onchange, etc.
                    if let Some(ref expression) = on_dir.expression {
                        self.process_template_expression(expression);
                    }
                }
                Attribute::BindDirective(bind_dir) => {
                    // bind:value - marks the variable as reassigned
                    // For bind directives, the expression target is reassigned
                    self.process_template_expression_for_bind(&bind_dir.expression);
                }
                Attribute::AttachTag(attach_tag) => {
                    // Process attach directive expression for updates and parameter names
                    self.process_template_expression(&attach_tag.expression);
                }
                Attribute::UseDirective(use_dir) => {
                    // "use:".len() == 4
                    self.reference_directive_name(
                        &use_dir.name,
                        use_dir.name_loc,
                        4,
                        use_dir.start,
                        use_dir.end,
                    );
                    // Process use: directive expression
                    if let Some(ref expression) = use_dir.expression {
                        self.process_template_expression(expression);
                    }
                }
                Attribute::TransitionDirective(transition_dir) => {
                    // The written keyword ("transition:" / "in:" / "out:") isn't kept
                    // verbatim on the node, but intro/outro uniquely identify it:
                    // transition: => (true, true), in: => (true, false), out: => (false, true).
                    let prefix_len = match (transition_dir.intro, transition_dir.outro) {
                        (true, true) => 11, // "transition:"
                        (true, false) => 3, // "in:"
                        _ => 4,             // "out:"
                    };
                    self.reference_directive_name(
                        &transition_dir.name,
                        transition_dir.name_loc,
                        prefix_len,
                        transition_dir.start,
                        transition_dir.end,
                    );
                }
                Attribute::AnimateDirective(animate_dir) => {
                    // "animate:".len() == 8
                    self.reference_directive_name(
                        &animate_dir.name,
                        animate_dir.name_loc,
                        8,
                        animate_dir.start,
                        animate_dir.end,
                    );
                }
                Attribute::SpreadAttribute(spread) => {
                    // Process spread attribute expression
                    self.process_template_expression(&spread.expression);
                }
                _ => {}
            }
        }
    }

    /// Register a `use:` / `transition:` / `in:` / `out:` / `animate:` directive
    /// name as a template reference of the binding it resolves to.
    ///
    /// Corresponds to the `SvelteDirective` visitor in Svelte's `scope.js`
    /// (`state.scope.reference(b.id(node.name.split('.')[0]), path)`), which
    /// runs unconditionally — the reference must be recorded even when we
    /// can't compute an exact source span for it (`name_loc` is `None` under
    /// `skip_expression_loc`, the mode the real `compile()` entry point always
    /// uses), otherwise `non_reactive_update` / unused-`export let` detection
    /// silently stop seeing directive-only usages in production compiles.
    ///
    /// `prefix_len` is the byte length of the directive keyword the parser
    /// stripped before `name` (`"use:"` / `"in:"` / `"out:"` / `"transition:"` /
    /// `"animate:"`) — `name_loc` spans the *whole* raw attribute token
    /// (keyword + name + any `|modifier`s), so the name's own start is
    /// `name_loc.start + prefix_len`, not something derived from
    /// `name_loc.end` (which would land inside a trailing modifier).
    fn reference_directive_name(
        &mut self,
        name: &str,
        name_loc: Option<crate::ast::span::SourceLocation>,
        prefix_len: u32,
        fallback_start: u32,
        fallback_end: u32,
    ) {
        let root_name = name.split('.').next().unwrap_or(name);
        let Some(binding_idx) = self.find_binding_in_scope_chain(root_name) else {
            return;
        };
        let (start, end) = match name_loc {
            Some(name_loc) => {
                let start = name_loc.start.character + prefix_len;
                (start, start + root_name.len() as u32)
            }
            // No location info available (e.g. `skip_expression_loc`): fall back
            // to the directive's own span rather than dropping the reference —
            // the exact position only matters for diagnostics/tooling, but the
            // reference's mere existence drives warning suppression.
            None => (fallback_start, fallback_end),
        };
        let binding = &mut self.bindings[binding_idx];
        binding.add_reference(start, end, true, false, false);
        binding.has_direct_template_read = true;
    }

    /// Process a template expression (from attributes, event handlers, etc.) to track updates.
    fn process_template_expression(&mut self, expr: &crate::ast::js::Expression) {
        use crate::ast::js::Expression;
        match expr {
            Expression::Typed(te) => {
                // Walk the typed JsNode directly - avoids JSON conversion entirely.
                self.track_node_expression_updates(&te.node);
                collect_arrow_param_names_node(
                    &te.node,
                    &mut self.template_expression_params,
                    self.arena,
                );
            }
            Expression::Lazy { .. } => {
                panic!("Expression::Lazy must be resolved before analysis");
            }
        }
    }

    /// Process a bind expression - the target is marked as reassigned or mutated.
    ///
    /// Matches the official Svelte compiler's scope.js BindDirective handler:
    /// - For Identifier expressions (bind:value={x}), marks as reassigned (direct assignment)
    /// - For MemberExpression (bind:this={foo[i]}), extracts the base object and marks as mutated
    /// - SequenceExpression (getter/setter syntax) is skipped (handled separately)
    fn process_template_expression_for_bind(&mut self, expr: &crate::ast::js::Expression) {
        let node = expr.as_node();

        match &*node {
            // Skip SequenceExpression (getter/setter syntax) - handled separately
            JsNode::SequenceExpression { .. } => {}

            // For direct Identifier (bind:value={x}), mark as reassigned
            JsNode::Identifier { name, .. } => {
                self.updates.push(Update {
                    name: name.to_string(),
                    is_direct_assignment: true,
                    scope_idx: self.current_scope,
                });
            }

            // For MemberExpression (bind:this={foo[i]}), traverse to base object
            // and mark as mutated (not reassigned, since only a property is being set)
            JsNode::MemberExpression { object, .. } => {
                let mut current_id = *object;
                loop {
                    let current = self.arena.get_js_node(current_id);
                    match current {
                        JsNode::MemberExpression { object, .. } => {
                            current_id = *object;
                        }
                        JsNode::Identifier { name, .. } => {
                            self.updates.push(Update {
                                name: name.to_string(),
                                is_direct_assignment: false, // mutation, not reassignment
                                scope_idx: self.current_scope,
                            });
                            break;
                        }
                        _ => break,
                    }
                }
            }

            _ => {}
        }
    }

    /// Track expression updates by walking a JsNode tree directly.
    /// This is the typed equivalent of `track_json_expression_updates` and avoids
    /// the overhead of JSON conversion for template expressions.
    fn track_node_expression_updates(&mut self, node: &JsNode) {
        match node {
            JsNode::AssignmentExpression { left, right, .. } => {
                self.track_node_assignment_target(self.arena.get_js_node(*left));
                self.track_node_expression_updates(self.arena.get_js_node(*right));
            }
            JsNode::UpdateExpression { argument, .. } => {
                self.track_node_simple_assignment_target(self.arena.get_js_node(*argument));
            }
            JsNode::CallExpression {
                callee, arguments, ..
            }
            | JsNode::NewExpression {
                callee, arguments, ..
            } => {
                self.track_node_expression_updates(self.arena.get_js_node(*callee));
                for arg in self.arena.get_js_children(*arguments) {
                    if let JsNode::SpreadElement { argument, .. } = arg {
                        self.track_node_expression_updates(self.arena.get_js_node(*argument));
                    } else {
                        self.track_node_expression_updates(arg);
                    }
                }
            }
            JsNode::ArrowFunctionExpression { body, params, .. } => {
                let body_id = *body;
                let params_range = *params;
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                // Record function scope mapping
                let body_node = self.arena.get_js_node(body_id);
                if let Some(start) = node_start(body_node) {
                    self.function_scope_map.insert(start, self.current_scope);
                }
                // Declare parameters
                for param in self.arena.get_js_children(params_range) {
                    self.declare_bindings_from_pattern_node_with_kind(
                        param,
                        BindingKind::Normal,
                        false,
                        DeclarationKind::Param,
                    );
                }
                // Process body for declarations AND updates.
                // This mirrors the official Svelte scope builder, which declares inner
                // function bindings into the scope tree so they end up in root.conflicts
                // and participate in generated-variable name collision avoidance.
                let body_node = self.arena.get_js_node(body_id);
                if let JsNode::BlockStatement { body: stmts, .. } = body_node {
                    let stmts = *stmts;
                    for stmt in self.arena.get_js_children(stmts) {
                        self.process_statement_typed(stmt);
                    }
                } else {
                    self.track_node_expression_updates(body_node);
                }
                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            JsNode::FunctionExpression { body, params, .. } => {
                let body_id = *body;
                let params_range = *params;
                let old_scope = self.push_function_scope();
                self.function_depth += 1;
                if let Some(body_id) = body_id {
                    let body_node = self.arena.get_js_node(body_id);
                    if let Some(start) = node_start(body_node) {
                        self.function_scope_map.insert(start, self.current_scope);
                    }
                }
                for param in self.arena.get_js_children(params_range) {
                    self.declare_bindings_from_pattern_node_with_kind(
                        param,
                        BindingKind::Normal,
                        false,
                        DeclarationKind::Param,
                    );
                }
                if let Some(body_id) = body_id {
                    let body_node = self.arena.get_js_node(body_id);
                    if let JsNode::BlockStatement { body: stmts, .. } = body_node {
                        let stmts = *stmts;
                        for stmt in self.arena.get_js_children(stmts) {
                            self.process_statement_typed(stmt);
                        }
                    }
                }
                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            JsNode::ConditionalExpression {
                test,
                consequent,
                alternate,
                ..
            } => {
                self.track_node_expression_updates(self.arena.get_js_node(*test));
                self.track_node_expression_updates(self.arena.get_js_node(*consequent));
                self.track_node_expression_updates(self.arena.get_js_node(*alternate));
            }
            JsNode::LogicalExpression { left, right, .. }
            | JsNode::BinaryExpression { left, right, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*left));
                self.track_node_expression_updates(self.arena.get_js_node(*right));
            }
            JsNode::UnaryExpression { argument, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*argument));
            }
            JsNode::SequenceExpression { expressions, .. } => {
                for expr in self.arena.get_js_children(*expressions) {
                    self.track_node_expression_updates(expr);
                }
            }
            JsNode::ArrayExpression { elements, .. } => {
                for elem in elements.iter().flatten() {
                    if let JsNode::SpreadElement { argument, .. } = elem {
                        self.track_node_expression_updates(self.arena.get_js_node(*argument));
                    } else {
                        self.track_node_expression_updates(elem);
                    }
                }
            }
            JsNode::ObjectExpression { properties, .. } => {
                for prop in self.arena.get_js_children(*properties) {
                    if let JsNode::SpreadElement { argument, .. } = prop {
                        self.track_node_expression_updates(self.arena.get_js_node(*argument));
                    } else if let JsNode::Property { value, .. } = prop {
                        self.track_node_expression_updates(self.arena.get_js_node(*value));
                    }
                }
            }
            JsNode::MemberExpression { object, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*object));
            }
            JsNode::TemplateLiteral { expressions, .. } => {
                for expr in self.arena.get_js_children(*expressions) {
                    self.track_node_expression_updates(expr);
                }
            }
            JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*tag));
                let quasi_node = self.arena.get_js_node(*quasi);
                if let JsNode::TemplateLiteral { expressions, .. } = quasi_node {
                    for expr in self.arena.get_js_children(*expressions) {
                        self.track_node_expression_updates(expr);
                    }
                }
            }
            JsNode::AwaitExpression { argument, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*argument));
            }
            JsNode::YieldExpression {
                argument: Some(argument),
                ..
            } => {
                self.track_node_expression_updates(self.arena.get_js_node(*argument));
            }
            JsNode::ChainExpression { expression, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*expression));
            }
            JsNode::Identifier { name, .. }
                // Check for store subscription scoping errors
                if name.starts_with('$')
                    && !name.starts_with("$$")
                    && name.len() > 1
                    && self.function_depth > 0
                => {
                    let is_rune_name = matches!(
                        name.as_str(),
                        "$state"
                            | "$derived"
                            | "$props"
                            | "$bindable"
                            | "$effect"
                            | "$inspect"
                            | "$host"
                    );
                    if !is_rune_name {
                        self.check_store_scoped_subscription(&name.as_str()[1..]);
                    }
                }
            JsNode::ClassExpression { body, .. } => {
                let body_id = *body;
                // Walk class body looking for method/property updates
                let body_node = self.arena.get_js_node(body_id);
                if let JsNode::ClassBody { body: elements, .. } = body_node {
                    let elements_range = *elements;
                    for elem in self.arena.get_js_children(elements_range) {
                        if let JsNode::MethodDefinition { value, .. } = elem {
                            let value_node = self.arena.get_js_node(*value);
                            if let JsNode::FunctionExpression { body, params, .. } = value_node {
                                let body_id = *body;
                                let params_range = *params;
                                let old_scope = self.push_function_scope();
                                self.function_depth += 1;
                                for param in self.arena.get_js_children(params_range) {
                                    self.declare_bindings_from_pattern_node_with_kind(
                                        param,
                                        BindingKind::Normal,
                                        false,
                                        DeclarationKind::Param,
                                    );
                                }
                                if let Some(body_id) = body_id {
                                    let body_node = self.arena.get_js_node(body_id);
                                    if let JsNode::BlockStatement { body: stmts, .. } = body_node {
                                        let stmts = *stmts;
                                        for stmt in self.arena.get_js_children(stmts) {
                                            self.track_node_statement_updates(stmt);
                                        }
                                    }
                                }
                                self.function_depth -= 1;
                                self.pop_scope(old_scope);
                            }
                        } else if let JsNode::PropertyDefinition {
                            value: Some(value), ..
                        } = elem
                        {
                            self.track_node_expression_updates(self.arena.get_js_node(*value));
                        }
                    }
                }
            }
            // Literals and other leaf nodes - no updates to track
            _ => {}
        }
    }

    /// Track an assignment target from JsNode.
    fn track_node_assignment_target(&mut self, node: &JsNode) {
        match node {
            JsNode::Identifier { name, .. } => {
                // Check for store subscription errors in assignment targets
                if name.starts_with('$')
                    && !name.starts_with("$$")
                    && name.len() > 1
                    && self.function_depth > 0
                {
                    let is_rune_name = matches!(
                        name.as_str(),
                        "$state"
                            | "$derived"
                            | "$props"
                            | "$bindable"
                            | "$effect"
                            | "$inspect"
                            | "$host"
                    );
                    if !is_rune_name {
                        self.check_store_scoped_subscription(&name.as_str()[1..]);
                    }
                }
                self.updates.push(Update {
                    name: name.to_string(),
                    is_direct_assignment: true,
                    scope_idx: self.current_scope,
                });
            }
            JsNode::MemberExpression { object, .. } => {
                if let Some(name) =
                    base_identifier_name(self.arena.get_js_node(*object), self.arena)
                {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            JsNode::ArrayPattern { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.track_node_assignment_target(elem);
                }
            }
            JsNode::ObjectPattern { properties, .. } => {
                for prop in self.arena.get_js_children(*properties) {
                    if let JsNode::RestElement { argument, .. }
                    | JsNode::SpreadElement { argument, .. } = prop
                    {
                        self.track_node_assignment_target(self.arena.get_js_node(*argument));
                    } else if let JsNode::Property { value, .. } = prop {
                        self.track_node_assignment_target(self.arena.get_js_node(*value));
                    }
                }
            }
            JsNode::AssignmentPattern { left, .. } => {
                self.track_node_assignment_target(self.arena.get_js_node(*left));
            }
            JsNode::RestElement { argument, .. } => {
                self.track_node_assignment_target(self.arena.get_js_node(*argument));
            }
            _ => {}
        }
    }

    /// Track a simple assignment target (update expression argument) from JsNode.
    fn track_node_simple_assignment_target(&mut self, node: &JsNode) {
        match node {
            JsNode::Identifier { name, .. } => {
                self.updates.push(Update {
                    name: name.to_string(),
                    is_direct_assignment: true,
                    scope_idx: self.current_scope,
                });
            }
            JsNode::MemberExpression { object, .. } => {
                if let Some(name) =
                    base_identifier_name(self.arena.get_js_node(*object), self.arena)
                {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            _ => {}
        }
    }

    /// Track statement updates from JsNode (for arrow/function bodies).
    fn track_node_statement_updates(&mut self, node: &JsNode) {
        match node {
            JsNode::ExpressionStatement { expression, .. } => {
                self.track_node_expression_updates(self.arena.get_js_node(*expression));
            }
            JsNode::ReturnStatement {
                argument: Some(argument),
                ..
            } => {
                self.track_node_expression_updates(self.arena.get_js_node(*argument));
            }
            JsNode::VariableDeclaration { declarations, .. } => {
                for decl in self.arena.get_js_children(*declarations) {
                    if let JsNode::VariableDeclarator { id, init, .. } = decl {
                        // Collect binding names into nested_declared_names so they
                        // participate in root.conflicts for generated-var collision avoidance.
                        let id_node = self.arena.get_js_node(*id);
                        self.collect_names_from_pattern_into_nested(id_node);
                        if let Some(init_id) = init {
                            self.track_node_expression_updates(self.arena.get_js_node(*init_id));
                        }
                    }
                }
            }
            JsNode::ForInStatement { left, body, .. }
            | JsNode::ForOfStatement { left, body, .. } => {
                // Collect loop variable declarations
                let left_node = self.arena.get_js_node(*left);
                if let JsNode::VariableDeclaration { declarations, .. } = left_node {
                    for decl in self.arena.get_js_children(*declarations) {
                        if let JsNode::VariableDeclarator { id, .. } = decl {
                            let id_node = self.arena.get_js_node(*id);
                            self.collect_names_from_pattern_into_nested(id_node);
                        }
                    }
                }
                self.track_node_statement_updates(self.arena.get_js_node(*body));
            }
            JsNode::IfStatement {
                test,
                consequent,
                alternate,
                ..
            } => {
                self.track_node_expression_updates(self.arena.get_js_node(*test));
                self.track_node_statement_updates(self.arena.get_js_node(*consequent));
                if let Some(alternate) = alternate {
                    self.track_node_statement_updates(self.arena.get_js_node(*alternate));
                }
            }
            JsNode::BlockStatement { body, .. } => {
                for stmt in self.arena.get_js_children(*body) {
                    self.track_node_statement_updates(stmt);
                }
            }
            JsNode::ForStatement { body, .. }
            | JsNode::WhileStatement { body, .. }
            | JsNode::DoWhileStatement { body, .. } => {
                self.track_node_statement_updates(self.arena.get_js_node(*body));
            }
            JsNode::SwitchStatement { cases, .. } => {
                for case in self.arena.get_js_children(*cases) {
                    if let JsNode::SwitchCase { consequent, .. } = case {
                        for stmt in self.arena.get_js_children(*consequent) {
                            self.track_node_statement_updates(stmt);
                        }
                    }
                }
            }
            JsNode::TryStatement {
                block,
                handler,
                finalizer,
                ..
            } => {
                self.track_node_statement_updates(self.arena.get_js_node(*block));
                if let Some(handler_id) = handler {
                    let handler_node = self.arena.get_js_node(*handler_id);
                    if let JsNode::CatchClause { body, .. } = handler_node {
                        self.track_node_statement_updates(self.arena.get_js_node(*body));
                    }
                }
                if let Some(finalizer) = finalizer {
                    self.track_node_statement_updates(self.arena.get_js_node(*finalizer));
                }
            }
            _ => {}
        }
    }

    /// Visit an each block.
    fn visit_each_block(&mut self, block: &EachBlock) {
        // Each blocks create a new scope for the item and index
        let old_scope = self.push_scope();

        // Map the each block's start position to its scope index
        // This allows Phase 2 visitors to set context.scope when entering the each block body
        self.template_scope_map
            .insert(block.start, self.current_scope);

        // Declare the item binding(s) - handle destructuring patterns
        if let Some(context) = block.context.as_ref() {
            let context_node = context.as_node();
            self.declare_bindings_from_pattern_node(&context_node, BindingKind::EachItem, false);
        }

        // Declare the index binding if present
        if let Some(ref index) = block.index {
            self.declare_binding(
                index.to_string(),
                BindingKind::EachIndex,
                DeclarationKind::Const,
            );
        }

        // Visit body
        self.visit_fragment(&block.body);

        // Visit fallback if present
        if let Some(ref fallback) = block.fallback {
            self.visit_fragment(fallback);
        }

        // Official Svelte compiler logic (index.js lines 638-674):
        // "if an `each` binding is reassigned/mutated, treat the expression as being mutated as well"
        // Store info about this each block for post-update processing.
        // We can't check is_updated() yet because updates are processed after the template visit.
        let each_scope = self.current_scope;
        let collection_names = {
            let node = block.expression.as_node();
            let mut ids = Vec::new();
            collect_identifiers_from_node(&node, &mut ids, self.arena);
            ids
        };
        self.each_block_collection_infos
            .push((old_scope, each_scope, collection_names));

        self.pop_scope(old_scope);
    }

    /// Declare bindings from a JsNode pattern (handles destructuring).
    ///
    /// JsNode version of `declare_bindings_from_pattern` that uses typed pattern matching
    /// instead of JSON field access. Falls back to JSON version for `JsNode::Raw`.
    fn declare_bindings_from_pattern_node(
        &mut self,
        pattern: &JsNode,
        kind: BindingKind,
        inside_rest: bool,
    ) {
        self.declare_bindings_from_pattern_node_with_kind(
            pattern,
            kind,
            inside_rest,
            DeclarationKind::Const,
        );
    }

    /// Like `declare_bindings_from_pattern_node`, but with an explicit
    /// `DeclarationKind`. Function parameters must be declared as
    /// `DeclarationKind::Param` (upstream `scope.declare(…, 'param')`), which
    /// — unlike `const`/`let` — is exempt from `validate_identifier_name`'s
    /// `$`-prefix check (`function bar($derived, $effect) {}` is legal).
    fn declare_bindings_from_pattern_node_with_kind(
        &mut self,
        pattern: &JsNode,
        kind: BindingKind,
        inside_rest: bool,
        decl_kind: DeclarationKind,
    ) {
        match pattern {
            JsNode::Identifier { name, .. } => {
                // Check for invalid $state/$derived usage in each context
                if kind == BindingKind::EachItem
                    && (name.as_str() == "$state" || name.as_str() == "$derived")
                {
                    self.validation_errors
                        .push(super::errors::state_invalid_placement(name));
                    return;
                }
                // A rest element in a parameter list is a `rest_param` upstream.
                let decl_kind = if inside_rest && decl_kind == DeclarationKind::Param {
                    DeclarationKind::RestParam
                } else {
                    decl_kind
                };
                let binding_idx = self.declare_binding(name.to_string(), kind, decl_kind);
                if inside_rest {
                    self.bindings[binding_idx].inside_rest = true;
                }
            }
            // Handle both ObjectPattern (official AST) and ObjectExpression (our parser's AST
            // for destructured let directive patterns like let:box={{width, height}})
            JsNode::ObjectPattern { properties, .. }
            | JsNode::ObjectExpression { properties, .. } => {
                for prop in self.arena.get_js_children(*properties) {
                    match prop {
                        JsNode::RestElement { argument, .. }
                        | JsNode::SpreadElement { argument, .. } => {
                            self.declare_bindings_from_pattern_node_with_kind(
                                self.arena.get_js_node(*argument),
                                kind,
                                true,
                                decl_kind,
                            );
                        }
                        JsNode::Property { value, .. } => {
                            self.declare_bindings_from_pattern_node_with_kind(
                                self.arena.get_js_node(*value),
                                kind,
                                inside_rest,
                                decl_kind,
                            );
                        }
                        _ => {}
                    }
                }
            }
            // Handle both ArrayPattern (official AST) and ArrayExpression (our parser's AST)
            JsNode::ArrayPattern { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.declare_bindings_from_pattern_node_with_kind(
                        elem,
                        kind,
                        inside_rest,
                        decl_kind,
                    );
                }
            }
            JsNode::ArrayExpression { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.declare_bindings_from_pattern_node_with_kind(
                        elem,
                        kind,
                        inside_rest,
                        decl_kind,
                    );
                }
            }
            // Handle both RestElement (official AST) and SpreadElement (our parser's AST)
            JsNode::RestElement { argument, .. } | JsNode::SpreadElement { argument, .. } => {
                self.declare_bindings_from_pattern_node_with_kind(
                    self.arena.get_js_node(*argument),
                    kind,
                    true,
                    decl_kind,
                );
            }
            JsNode::AssignmentPattern { left, .. } => {
                self.declare_bindings_from_pattern_node_with_kind(
                    self.arena.get_js_node(*left),
                    kind,
                    inside_rest,
                    decl_kind,
                );
            }
            _ => {}
        }
    }

    /// Visit an if block.
    fn visit_if_block(&mut self, block: &IfBlock) {
        // Each branch of an if/else block gets its own scope.
        // This is necessary because {@const} declarations in different branches
        // should NOT conflict with each other. For example:
        //   {#if x > 10}
        //     {@const width = x * 2}
        //   {:else}
        //     {@const width = x * 5}
        //   {/if}
        // Both `width` declarations are valid - they're in separate scopes.

        // Visit the consequent in its own scope
        let old_scope = self.push_scope();
        // Register this scope in template_scope_map so that declaration-tag
        // bindings inside the consequent are visible to the server evaluator.
        self.template_scope_map
            .insert(block.start, self.current_scope);
        self.visit_fragment(&block.consequent);
        self.pop_scope(old_scope);

        // Visit alternate if present, also in its own scope
        if let Some(ref alternate) = block.alternate {
            let old_scope = self.push_scope();
            // Use block.end as a unique key for the alternate scope.
            self.template_scope_map
                .insert(block.end, self.current_scope);
            self.visit_fragment(alternate);
            self.pop_scope(old_scope);
        }
    }

    /// Visit an await block.
    fn visit_await_block(&mut self, block: &AwaitBlock) {
        // Pending creates a child scope (mirrors upstream: Fragment visitor always creates child scope)
        if let Some(ref pending) = block.pending {
            let old_scope = self.push_scope();
            // Map block.start to the pending scope so Phase 2 analysis can switch to it
            self.template_scope_map
                .insert(block.start, self.current_scope);
            self.visit_fragment(pending);
            self.pop_scope(old_scope);
        }

        // Then creates a scope for the value
        if let Some(ref then) = block.then {
            let old_scope = self.push_scope();

            // Map the await block's start to the then scope for Phase 2 scope lookup
            // We use the then fragment's node positions if available
            self.template_scope_map
                .insert(block.start + 1, self.current_scope); // +1 to differentiate from pending

            // Declare the then value binding(s) - handle destructuring patterns
            if let Some(ref value) = block.value {
                let node = value.as_node();
                self.declare_bindings_from_pattern_node(&node, BindingKind::AwaitThen, false);
            }

            self.visit_fragment(then);
            self.pop_scope(old_scope);
        }

        // Catch creates a scope for the error
        if let Some(ref catch) = block.catch {
            let old_scope = self.push_scope();

            // Map the await block's start to the catch scope
            self.template_scope_map
                .insert(block.start + 2, self.current_scope); // +2 to differentiate from then

            // Declare the error binding(s) - handle destructuring patterns
            if let Some(ref error) = block.error {
                let node = error.as_node();
                self.declare_bindings_from_pattern_node(&node, BindingKind::AwaitCatch, false);
            }

            self.visit_fragment(catch);
            self.pop_scope(old_scope);
        }
    }

    /// Visit a key block.
    fn visit_key_block(&mut self, block: &KeyBlock) {
        // Key blocks create a child scope for their fragment, matching the official compiler
        // where every Fragment node creates a child scope (scope.js line 1304-1308).
        // This ensures that {@const} declarations inside {#key} blocks are isolated
        // from sibling scopes (e.g., {#each} blocks at the same level).
        let old_scope = self.push_scope();
        // Register this scope so declaration-tag bindings inside {#key} blocks
        // are visible to the server evaluator's template-scope lookup.
        self.template_scope_map
            .insert(block.start, self.current_scope);
        self.visit_fragment(&block.fragment);
        self.pop_scope(old_scope);
    }

    /// Visit a snippet block.
    fn visit_snippet_block(&mut self, block: &SnippetBlock) {
        // Declare the snippet name in the CURRENT (parent) scope BEFORE creating child scope
        // This matches the official Svelte compiler: scope.declare(node.expression, 'normal', 'function', node)
        // The snippet name must be available in the enclosing scope so that {@render snippet()}
        // can find it and know that it's a local (non-dynamic) snippet
        if let Some(name) = block.expression.name() {
            let idx = self.declare_binding(
                name.to_string(),
                BindingKind::Normal,
                DeclarationKind::Function,
            );
            // Track that the binding's initial value is a SnippetBlock so that
            // render-tag resolution (`is_resolved_snippet`) can recognise local
            // snippets. The official compiler checks
            // `binding.initial.type === 'SnippetBlock'`; tracking the kind on
            // the binding lets us answer the same question without keeping the
            // entire AST node around.
            self.bindings[idx].initial_node_type = Some("SnippetBlock".to_string());
        }

        let old_scope = self.push_scope();

        // Map the snippet block's start position to its scope index
        self.template_scope_map
            .insert(block.start, self.current_scope);
        // Record that this scope is a snippet-body scope: template declarations
        // made inside it must not be constant-folded from sibling scopes.
        self.snippet_scope_indices.insert(self.current_scope);

        // Declare snippet parameters - handle destructuring patterns
        for param in &block.parameters {
            let node = param.as_node();
            self.declare_bindings_from_pattern_node(&node, BindingKind::SnippetParam, false);
        }

        // Visit body
        self.visit_fragment(&block.body);

        self.pop_scope(old_scope);
    }

    /// Visit a const tag.
    ///
    /// {@const} tags declare a constant binding in the current scope.
    /// Register bindings from a `{let x = …}` / `{const x = …}` declaration
    /// tag (Svelte 5.56.0 #18282). Mirrors how `{@const}` registers the
    /// declarator's identifiers; the binding kind upgrade for `$state` /
    /// `$derived` initializers is performed by a separate pass that walks
    /// instance-script-style declarators (the rune call already triggers
    /// `analysis.runes = true` via `fragment_check_features`, and the
    /// `process_binding_pattern_from_node` default of `Template` is what the
    /// rest of the compiler treats reactive const-tag-like bindings as).
    fn visit_declaration_tag(&mut self, tag: &crate::ast::template::DeclarationTag) {
        use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};

        let node = tag.declaration.as_node();
        let (declarators_typed, decl_kind) = match &*node {
            JsNode::VariableDeclaration {
                declarations, kind, ..
            } => {
                let dk = match kind.as_str() {
                    "const" => DeclarationKind::Const,
                    "var" => DeclarationKind::Var,
                    _ => DeclarationKind::Let,
                };
                (Some(self.arena.get_js_children(*declarations)), dk)
            }
            _ => return,
        };

        if let Some(declarators) = declarators_typed {
            for decl in declarators {
                let Some(id_id) = decl.id() else { continue };
                let id_node = self.arena.get_js_node(id_id);
                let init_node = decl.init().map(|i| self.arena.get_js_node(i));
                let binding_kind = init_node
                    .map(|n| binding_kind_from_init_node(n, self.arena))
                    .unwrap_or(BindingKind::Template);
                self.declare_decl_tag_bindings_node(id_node, decl_kind, binding_kind);
                if let Some(init) = init_node {
                    self.set_const_tag_initial_typed(id_node, init);
                }
            }
        }
    }

    /// Declare DeclarationTag pattern bindings with `BindingKind::Template`
    /// (so the rest of the template-scope analysis treats them like
    /// `{@const}` bindings) but carry the user-supplied `let` / `const` /
    /// `var` keyword through as the `DeclarationKind`. The default
    /// `process_binding_pattern_from_node` always emits `DeclarationKind::Const`,
    /// which rejects subsequent `count += 1` assignments via the
    /// `constant_assignment` validator.
    fn declare_decl_tag_bindings_node(
        &mut self,
        pattern: &JsNode,
        decl_kind: crate::compiler::phases::phase2_analyze::scope::DeclarationKind,
        binding_kind: crate::compiler::phases::phase2_analyze::scope::BindingKind,
    ) {
        match pattern {
            JsNode::Identifier { name, .. } => {
                self.declare_binding(name.to_string(), binding_kind, decl_kind);
            }
            JsNode::ObjectPattern { properties, .. }
            | JsNode::ObjectExpression { properties, .. } => {
                for prop in self.arena.get_js_children(*properties) {
                    if let Some(value_id) = prop.value_node() {
                        self.declare_decl_tag_bindings_node(
                            self.arena.get_js_node(value_id),
                            decl_kind,
                            binding_kind,
                        );
                    }
                }
            }
            JsNode::ArrayPattern { elements, .. } | JsNode::ArrayExpression { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.declare_decl_tag_bindings_node(elem, decl_kind, binding_kind);
                }
            }
            JsNode::AssignmentPattern { left, .. } => {
                self.declare_decl_tag_bindings_node(
                    self.arena.get_js_node(*left),
                    decl_kind,
                    binding_kind,
                );
            }
            JsNode::RestElement { argument, .. } => {
                self.declare_decl_tag_bindings_node(
                    self.arena.get_js_node(*argument),
                    decl_kind,
                    binding_kind,
                );
            }
            _ => {}
        }
    }

    fn visit_const_tag(&mut self, tag: &ConstTag) {
        // Get the declaration from the const tag
        // The declaration can be either:
        // - AssignmentExpression: @const b = a + 1 (left is Identifier)
        // - VariableDeclaration: @const {x, y} = obj (declarations array)
        let node = tag.declaration.as_node();

        match &*node {
            JsNode::AssignmentExpression { left, right, .. } => {
                let left_node = self.arena.get_js_node(*left);
                let right_node = self.arena.get_js_node(*right);
                self.process_binding_pattern_from_node(left_node);
                // Typed dispatch: skip the to_value() materialization on both
                // sides of the assignment. The init JSON string is produced
                // via `to_json_string()` (compact JSON) inside the helper.
                self.set_const_tag_initial_typed(left_node, right_node);
            }
            JsNode::VariableDeclaration { declarations, .. } => {
                let children = self.arena.get_js_children(*declarations);
                if let Some(decl) = children.first()
                    && let Some(id_id) = decl.id()
                {
                    let id_node = self.arena.get_js_node(id_id);
                    self.process_binding_pattern_from_node(id_node);
                    if let Some(init_id) = decl.init() {
                        let init_node = self.arena.get_js_node(init_id);
                        self.set_const_tag_initial_typed(id_node, init_node);
                    }
                }
            }
            _ => {}
        }
    }

    /// Typed-AST equivalent of `set_const_tag_initial`. Avoids materializing
    /// the LHS pattern and the RHS init expression into intermediate
    /// `Value`s — pattern matching reads the Identifier name directly from
    /// the typed JsNode, and the init is serialized to compact JSON via
    /// `to_json_string()` (the byte-equivalent of `to_value().to_string()`
    /// without the intermediate allocation).
    fn set_const_tag_initial_typed(&mut self, pattern: &JsNode, init: &JsNode) {
        let pattern_name = match pattern {
            JsNode::Identifier { name, .. } => Some(name.as_str()),
            _ => None,
        };
        let Some(name) = pattern_name else {
            return;
        };
        let Some(&idx) = self.scopes[self.current_scope].declarations.get(name) else {
            return;
        };
        self.bindings[idx].initial = Some(init.to_json_string());
        self.bindings[idx].initial_is_defined = true;
        // Mark function-valued `{@const}` bindings so `is_function()` returns
        // true (mirrors the VariableDeclarator init check). Upstream's
        // Identifier.js `has_state` computation excludes function bindings, so a
        // `{@const fn = (e) => …}` passed as a component prop is emitted as a
        // plain `name: value` init rather than a `get name()` getter.
        if matches!(
            init,
            JsNode::ArrowFunctionExpression { .. } | JsNode::FunctionExpression { .. }
        ) {
            self.bindings[idx].initial_is_function = true;
        }
        // Record the init node type so downstream transforms (e.g. should_proxy)
        // can check whether the initial value is a primitive expression.
        let init_type = Some(init.type_str().to_string());
        if let Some(ty) = init_type {
            self.bindings[idx].initial_node_type = Some(ty.clone());
            if ty == "Identifier" {
                let init_name = match init {
                    JsNode::Identifier { name, .. } => Some(name.to_string()),
                    _ => None,
                };
                if let Some(n) = init_name {
                    self.bindings[idx].initial_identifier_name = Some(n);
                }
            }
        }
    }

    /// Process a binding pattern from a JsNode.
    /// Const-tag bindings get `BindingKind::Template` to match the official Svelte compiler.
    /// JsNode version of `process_binding_pattern_from_json`.
    fn process_binding_pattern_from_node(&mut self, pattern: &JsNode) {
        match pattern {
            JsNode::Identifier { name, .. } => {
                self.declare_binding(
                    name.to_string(),
                    BindingKind::Template,
                    DeclarationKind::Const,
                );
            }
            JsNode::ObjectPattern { properties, .. }
            | JsNode::ObjectExpression { properties, .. } => {
                for prop in self.arena.get_js_children(*properties) {
                    if let Some(value_id) = prop.value_node() {
                        self.process_binding_pattern_from_node(self.arena.get_js_node(value_id));
                    }
                }
            }
            JsNode::ArrayPattern { elements, .. } | JsNode::ArrayExpression { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.process_binding_pattern_from_node(elem);
                }
            }
            JsNode::AssignmentPattern { left, .. } => {
                self.process_binding_pattern_from_node(self.arena.get_js_node(*left));
            }
            JsNode::RestElement { argument, .. } => {
                self.process_binding_pattern_from_node(self.arena.get_js_node(*argument));
            }
            _ => {}
        }
    }
}

/// Recursively collect all Identifier names from a JSON AST value.
///
/// Used by `promote_each_collection_bindings_if_updated` to extract identifiers
/// from a collection expression so their bindings can be promoted to State kind.
/// Decide the binding kind for a `{let x = <init>}` / `{const x = <init>}`
/// declaration tag from its typed init AST. Mirrors the OXC-side
/// `detect_binding_kind_from_expr` for the rune-call recognition path: a
/// bare `$state(...)` / `$state.raw(...)` / `$derived(...)` /
/// `$derived.by(...)` call upgrades the binding kind to State / RawState /
/// Derived so the rest of the analyze + transform pipeline knows to wrap
/// reads with `$.get(...)` and writes with `$.set(...)`.
fn binding_kind_from_init_node(
    node: &JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> crate::compiler::phases::phase2_analyze::scope::BindingKind {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;
    if let JsNode::CallExpression { callee, .. } = node {
        let callee_node = arena.get_js_node(*callee);
        match callee_node {
            JsNode::Identifier { name, .. } => match name.as_str() {
                "$state" => return BindingKind::State,
                "$derived" => return BindingKind::Derived,
                _ => {}
            },
            JsNode::MemberExpression {
                object,
                property,
                computed: false,
                ..
            } => {
                let obj_node = arena.get_js_node(*object);
                let prop_node = arena.get_js_node(*property);
                if let (
                    JsNode::Identifier { name: obj_name, .. },
                    JsNode::Identifier {
                        name: prop_name, ..
                    },
                ) = (obj_node, prop_node)
                {
                    match (obj_name.as_str(), prop_name.as_str()) {
                        ("$state", "raw") => return BindingKind::RawState,
                        ("$derived", "by") => return BindingKind::Derived,
                        _ => {}
                    }
                }
            }
            _ => {}
        }
    }
    BindingKind::Template
}

/// Recursively collect all Identifier names from a JsNode AST.
///
/// JsNode version of `collect_identifiers_from_json`. Used to extract identifiers
/// from a collection expression so their bindings can be promoted to State kind.
fn collect_identifiers_from_node(node: &JsNode, result: &mut Vec<String>, arena: &ParseArena) {
    match node {
        JsNode::Identifier { name, .. } => {
            result.push(name.to_string());
        }
        // For other node types, recurse into children
        JsNode::MemberExpression {
            object, property, ..
        } => {
            collect_identifiers_from_node(arena.get_js_node(*object), result, arena);
            collect_identifiers_from_node(arena.get_js_node(*property), result, arena);
        }
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            collect_identifiers_from_node(arena.get_js_node(*callee), result, arena);
            for arg in arena.get_js_children(*arguments) {
                collect_identifiers_from_node(arg, result, arena);
            }
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. }
        | JsNode::AssignmentExpression { left, right, .. }
        | JsNode::AssignmentPattern { left, right, .. } => {
            collect_identifiers_from_node(arena.get_js_node(*left), result, arena);
            collect_identifiers_from_node(arena.get_js_node(*right), result, arena);
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            collect_identifiers_from_node(arena.get_js_node(*test), result, arena);
            collect_identifiers_from_node(arena.get_js_node(*consequent), result, arena);
            collect_identifiers_from_node(arena.get_js_node(*alternate), result, arena);
        }
        JsNode::UnaryExpression { argument, .. }
        | JsNode::UpdateExpression { argument, .. }
        | JsNode::SpreadElement { argument, .. }
        | JsNode::RestElement { argument, .. }
        | JsNode::AwaitExpression { argument, .. } => {
            collect_identifiers_from_node(arena.get_js_node(*argument), result, arena);
        }
        JsNode::ArrayExpression { elements, .. } | JsNode::ArrayPattern { elements, .. } => {
            for e in elements.iter().flatten() {
                collect_identifiers_from_node(e, result, arena);
            }
        }
        JsNode::ObjectExpression { properties, .. } | JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                collect_identifiers_from_node(prop, result, arena);
            }
        }
        JsNode::Property { key, value, .. } => {
            collect_identifiers_from_node(arena.get_js_node(*key), result, arena);
            collect_identifiers_from_node(arena.get_js_node(*value), result, arena);
        }
        JsNode::SequenceExpression { expressions, .. }
        | JsNode::TemplateLiteral { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                collect_identifiers_from_node(expr, result, arena);
            }
        }
        JsNode::ArrowFunctionExpression { body, params, .. } => {
            for p in arena.get_js_children(*params) {
                collect_identifiers_from_node(p, result, arena);
            }
            collect_identifiers_from_node(arena.get_js_node(*body), result, arena);
        }
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            collect_identifiers_from_node(arena.get_js_node(*tag), result, arena);
            collect_identifiers_from_node(arena.get_js_node(*quasi), result, arena);
        }
        JsNode::NewExpression {
            callee, arguments, ..
        } => {
            collect_identifiers_from_node(arena.get_js_node(*callee), result, arena);
            for arg in arena.get_js_children(*arguments) {
                collect_identifiers_from_node(arg, result, arena);
            }
        }
        // Leaf nodes (Literal, ThisExpression, etc.) - no identifiers
        _ => {}
    }
}

/// Build scopes for a component AST.
///
/// Returns a tuple of (ScopeRoot, Vec<AnalysisError>) where the errors
/// are validation errors collected during scope building.
pub fn build_scopes(
    ast: &Root,
    source: &str,
    runes_mode: bool,
    is_typescript: bool,
    arena: &ParseArena,
) -> (
    ScopeRoot,
    Vec<crate::compiler::phases::phase2_analyze::AnalysisError>,
) {
    let builder = ScopeBuilder::new(source, runes_mode, is_typescript, arena);
    builder.build(ast)
}

/// JsNode version of `collect_arrow_param_names`. Walks the typed JsNode tree
/// looking for ArrowFunctionExpression and FunctionExpression nodes, then
/// extracts parameter identifier names. Avoids JSON conversion entirely.
fn collect_arrow_param_names_node(node: &JsNode, names: &mut Vec<String>, arena: &ParseArena) {
    match node {
        JsNode::ArrowFunctionExpression { params, body, .. } => {
            for param in arena.get_js_children(*params) {
                collect_pattern_identifiers(param, arena, names);
            }
            collect_arrow_param_names_node(arena.get_js_node(*body), names, arena);
        }
        JsNode::FunctionExpression { params, body, .. } => {
            for param in arena.get_js_children(*params) {
                collect_pattern_identifiers(param, arena, names);
            }
            if let Some(body) = body {
                collect_arrow_param_names_node(arena.get_js_node(*body), names, arena);
            }
        }
        // Recurse into all child nodes
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*callee), names, arena);
            for arg in arena.get_js_children(*arguments) {
                collect_arrow_param_names_node(arg, names, arena);
            }
        }
        JsNode::NewExpression {
            callee, arguments, ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*callee), names, arena);
            for arg in arena.get_js_children(*arguments) {
                collect_arrow_param_names_node(arg, names, arena);
            }
        }
        JsNode::MemberExpression {
            object, property, ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*object), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*property), names, arena);
        }
        JsNode::AssignmentExpression { left, right, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*left), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*right), names, arena);
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*left), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*right), names, arena);
        }
        JsNode::UnaryExpression { argument, .. }
        | JsNode::UpdateExpression { argument, .. }
        | JsNode::SpreadElement { argument, .. }
        | JsNode::AwaitExpression { argument, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*argument), names, arena);
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*test), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*consequent), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*alternate), names, arena);
        }
        JsNode::SequenceExpression { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                collect_arrow_param_names_node(expr, names, arena);
            }
        }
        JsNode::ArrayExpression { elements, .. } => {
            for elem in elements.iter().flatten() {
                collect_arrow_param_names_node(elem, names, arena);
            }
        }
        JsNode::ObjectExpression { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                collect_arrow_param_names_node(prop, names, arena);
            }
        }
        JsNode::Property { value, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*value), names, arena);
        }
        JsNode::TemplateLiteral { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                collect_arrow_param_names_node(expr, names, arena);
            }
        }
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*tag), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*quasi), names, arena);
        }
        JsNode::YieldExpression {
            argument: Some(argument),
            ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*argument), names, arena);
        }
        JsNode::ChainExpression { expression, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*expression), names, arena);
        }
        JsNode::BlockStatement { body, .. } => {
            for stmt in arena.get_js_children(*body) {
                collect_arrow_param_names_node(stmt, names, arena);
            }
        }
        JsNode::ExpressionStatement { expression, .. } => {
            collect_arrow_param_names_node(arena.get_js_node(*expression), names, arena);
        }
        JsNode::ReturnStatement {
            argument: Some(argument),
            ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*argument), names, arena);
        }
        JsNode::VariableDeclaration { declarations, .. } => {
            for decl in arena.get_js_children(*declarations) {
                collect_arrow_param_names_node(decl, names, arena);
            }
        }
        JsNode::VariableDeclarator {
            init: Some(init), ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*init), names, arena);
        }
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            collect_arrow_param_names_node(arena.get_js_node(*test), names, arena);
            collect_arrow_param_names_node(arena.get_js_node(*consequent), names, arena);
            if let Some(alternate) = alternate {
                collect_arrow_param_names_node(arena.get_js_node(*alternate), names, arena);
            }
        }
        // Leaf nodes or nodes without interesting children
        _ => {}
    }
}

/// Get the start position of a JsNode (helper for function_scope_map).
fn node_start(node: &JsNode) -> Option<u32> {
    match node {
        JsNode::BlockStatement { start, .. }
        | JsNode::ExpressionStatement { start, .. }
        | JsNode::Identifier { start, .. }
        | JsNode::CallExpression { start, .. }
        | JsNode::ArrowFunctionExpression { start, .. }
        | JsNode::FunctionExpression { start, .. }
        | JsNode::ObjectExpression { start, .. }
        | JsNode::ArrayExpression { start, .. }
        | JsNode::BinaryExpression { start, .. }
        | JsNode::AssignmentExpression { start, .. }
        | JsNode::MemberExpression { start, .. }
        | JsNode::ConditionalExpression { start, .. }
        | JsNode::Literal { start, .. }
        | JsNode::SequenceExpression { start, .. }
        | JsNode::UnaryExpression { start, .. }
        | JsNode::UpdateExpression { start, .. }
        | JsNode::LogicalExpression { start, .. }
        | JsNode::NewExpression { start, .. }
        | JsNode::TemplateLiteral { start, .. } => Some(*start),
        _ => None,
    }
}
