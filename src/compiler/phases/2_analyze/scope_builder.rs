//! Scope builder for the analyzer.
//!
//! Walks the AST and creates a scope tree with bindings.

use super::errors;
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
    /// Identifier names found in template expression arrow function parameters.
    /// These need to be in the conflicts set so that generated variable names
    /// (like `node`, `$$array`, etc.) don't collide with them.
    template_expression_params: Vec<String>,
    /// Names declared inside nested function bodies that need to participate in
    /// root.conflicts (so generated template variables like `node_N` avoid them),
    /// but that aren't otherwise tracked as scope declarations.
    nested_declared_names: rustc_hash::FxHashSet<String>,
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
            template_expression_params: Vec::new(),
            nested_declared_names: rustc_hash::FxHashSet::default(),
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
        for i in 1..self.scopes.len() {
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
        // We use swap to take ownership of all_scopes[0] and replace it with a clone,
        // avoiding an extra clone. The ScopeRoot.scope field needs its own copy since
        // it's accessed separately from all_scopes.
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
                conflicts: std::rc::Rc::new(std::cell::RefCell::new(conflicts)),
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
        // Check for duplicate declaration in the current scope
        // Note: var redeclarations are allowed in JavaScript, so we only error
        // if neither the existing nor new declaration is a var.
        // Also allow function redeclarations (TypeScript overloads declare the same
        // function name multiple times).
        if let Some(&existing_idx) = self.scopes[self.current_scope].declarations.get(&name) {
            let existing_binding = &self.bindings[existing_idx];
            // Only error if neither declaration is a var and neither is a function
            // (function redeclarations are valid in JS/TS for overloads)
            if existing_binding.declaration_kind != DeclarationKind::Var
                && declaration_kind != DeclarationKind::Var
                && existing_binding.declaration_kind != DeclarationKind::Function
                && declaration_kind != DeclarationKind::Function
            {
                self.validation_errors
                    .push(errors::declaration_duplicate(&name));
            }
        }

        let idx = self.bindings.len();
        let binding = Binding::with_declaration_kind(
            name.clone(),
            kind,
            declaration_kind,
            self.current_scope,
        );

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

        self.bindings.push(binding);
        self.scopes[self.current_scope].declare(name, idx);
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
            if ret.errors.is_empty() {
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
                    if let JsNode::Identifier { name, .. } = id_node {
                        let idx = self.declare_binding(
                            name.to_string(),
                            BindingKind::Normal,
                            DeclarationKind::Function,
                        );
                        self.bindings[idx].initial_is_function = true;
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
                    self.declare_bindings_from_pattern_node(param, BindingKind::Normal, false);
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
                    if let JsNode::Identifier { name, .. } = id_node {
                        self.declare_binding(
                            name.to_string(),
                            BindingKind::Normal,
                            DeclarationKind::Let,
                        );
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
                    Some(self.push_scope())
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
                    Some(self.push_scope())
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
                    Some(self.push_scope())
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
                // Process try block
                let block_node = self.arena.get_js_node(*block);
                if let JsNode::BlockStatement { body, .. } = block_node {
                    let body = *body;
                    for stmt in self.arena.get_js_children(body) {
                        self.process_statement_typed(stmt);
                    }
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
                // Process finally block if present
                if let Some(finalizer_id) = finalizer {
                    let finalizer_node = self.arena.get_js_node(*finalizer_id);
                    if let JsNode::BlockStatement { body, .. } = finalizer_node {
                        let body = *body;
                        for stmt in self.arena.get_js_children(body) {
                            self.process_statement_typed(stmt);
                        }
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
                        // Handle AssignmentExpression directly
                        if let JsNode::AssignmentExpression { left, .. } = expr {
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
            // Handle JsNode::Raw for statements stored as JSON values.
            // This is needed because ExportNamedDeclaration wraps its declaration
            // as JsNode::Raw(Value) in the parser, so the scope builder must be
            // able to process it.
            JsNode::Raw(json) => {
                self.process_raw_statement(json);
            }
            _ => {}
        }
    }

    /// Process a statement stored as a JSON Value (Raw fallback).
    ///
    /// This handles cases where the parser wraps declarations as JsNode::Raw(Value),
    /// such as the declaration inside ExportNamedDeclaration.
    fn process_raw_statement(&mut self, json: &serde_json::Value) {
        let json_type = json.get("type").and_then(|t| t.as_str());
        match json_type {
            Some("VariableDeclaration") => {
                let decl_kind = match json.get("kind").and_then(|k| k.as_str()) {
                    Some("const") => DeclarationKind::Const,
                    Some("let") => DeclarationKind::Let,
                    Some("var") => DeclarationKind::Var,
                    _ => DeclarationKind::Const,
                };
                if let Some(declarators) = json.get("declarations").and_then(|d| d.as_array()) {
                    for declarator in declarators {
                        let id = declarator.get("id");
                        let init = declarator.get("init");
                        self.process_raw_binding_pattern(id, init, decl_kind);
                        // Track updates in the initializer expression
                        if let Some(init_val) = init {
                            self.track_json_expression_updates(init_val);
                        }
                    }
                }
            }
            Some("FunctionDeclaration") => {
                if let Some(id) = json.get("id")
                    && let Some(name) = id.get("name").and_then(|n| n.as_str())
                {
                    let idx = self.declare_binding(
                        name.to_string(),
                        BindingKind::Normal,
                        DeclarationKind::Function,
                    );
                    self.bindings[idx].initial_is_function = true;
                }
                // Process function body for updates
                if let Some(body) = json.get("body")
                    && let Some(body_stmts) = body.get("body").and_then(|b| b.as_array())
                {
                    let old_scope = self.push_function_scope();
                    self.function_depth += 1;
                    // Register function scope for visitor phase scope lookup
                    if let Some(start) = body.get("start").and_then(|s| s.as_u64()) {
                        let key = start as u32;
                        self.function_scope_map.insert(key, self.current_scope);
                    }
                    // Declare function parameters
                    if let Some(params) = json.get("params").and_then(|p| p.as_array()) {
                        for param in params {
                            self.declare_raw_binding_names(param, BindingKind::Normal);
                        }
                    }
                    for stmt in body_stmts {
                        self.process_raw_statement(stmt);
                    }
                    self.function_depth -= 1;
                    self.pop_scope(old_scope);
                }
            }
            Some("ClassDeclaration") => {
                if let Some(id) = json.get("id")
                    && let Some(name) = id.get("name").and_then(|n| n.as_str())
                {
                    self.declare_binding(
                        name.to_string(),
                        BindingKind::Normal,
                        DeclarationKind::Let,
                    );
                }
                // Process class body to find declarations in methods, getters, setters, etc.
                // This ensures that identifiers like constructor parameters are added to the
                // conflicts set, preventing naming collisions with generated variables.
                if let Some(body) = json.get("body") {
                    self.process_raw_class_body(body);
                }
            }
            Some("ExpressionStatement") => {
                if let Some(expression) = json.get("expression") {
                    self.track_json_expression_updates(expression);
                }
            }
            Some("BlockStatement") => {
                if let Some(body) = json.get("body").and_then(|b| b.as_array()) {
                    let old_scope = self.push_scope();
                    for stmt in body {
                        self.process_raw_statement(stmt);
                    }
                    self.pop_scope(old_scope);
                }
            }
            Some("ExportNamedDeclaration") => {
                // Skip type-only exports
                if json.get("exportKind").and_then(|k| k.as_str()) == Some("type") {
                    return;
                }
                // Process the inner declaration (e.g., VariableDeclaration, FunctionDeclaration)
                if let Some(declaration) = json.get("declaration")
                    && !declaration.is_null()
                {
                    self.process_raw_statement(declaration);
                }
                // Also handle export specifiers to find re-exports:
                // export { name as alias }
                // These don't create new bindings but we handle them for completeness
            }
            Some("LabeledStatement") => {
                // Check for `$:` reactive declarations in legacy mode
                let label_name = json
                    .get("label")
                    .and_then(|l| l.get("name"))
                    .and_then(|n| n.as_str());
                if label_name == Some("$")
                    && !self.runes_mode
                    && let Some(body) = json.get("body")
                    && body.get("type").and_then(|t| t.as_str()) == Some("ExpressionStatement")
                    && let Some(expr) = body.get("expression")
                {
                    // Handle both direct AssignmentExpression and ParenthesizedExpression
                    let inner_expr = if expr.get("type").and_then(|t| t.as_str())
                        == Some("ParenthesizedExpression")
                    {
                        expr.get("expression").unwrap_or(expr)
                    } else {
                        expr
                    };
                    if inner_expr.get("type").and_then(|t| t.as_str())
                        == Some("AssignmentExpression")
                        && let Some(left) = inner_expr.get("left")
                    {
                        self.collect_raw_assignment_lhs_identifiers(left);
                    }
                }
                // Process the body
                if let Some(body) = json.get("body")
                    && !body.is_null()
                {
                    self.process_raw_statement(body);
                }
            }
            Some("IfStatement") => {
                // Process consequent and alternate
                if let Some(test) = json.get("test") {
                    self.track_json_expression_updates(test);
                }
                if let Some(consequent) = json.get("consequent") {
                    self.process_raw_statement(consequent);
                }
                if let Some(alternate) = json.get("alternate")
                    && !alternate.is_null()
                {
                    self.process_raw_statement(alternate);
                }
            }
            Some("ForStatement") => {
                if let Some(init) = json.get("init")
                    && !init.is_null()
                {
                    self.process_raw_statement(init);
                }
                if let Some(test) = json.get("test") {
                    self.track_json_expression_updates(test);
                }
                if let Some(update) = json.get("update") {
                    self.track_json_expression_updates(update);
                }
                if let Some(body) = json.get("body") {
                    self.process_raw_statement(body);
                }
            }
            Some("ForInStatement") | Some("ForOfStatement") => {
                if let Some(right) = json.get("right") {
                    self.track_json_expression_updates(right);
                }
                if let Some(body) = json.get("body") {
                    self.process_raw_statement(body);
                }
            }
            Some("WhileStatement") | Some("DoWhileStatement") => {
                if let Some(test) = json.get("test") {
                    self.track_json_expression_updates(test);
                }
                if let Some(body) = json.get("body") {
                    self.process_raw_statement(body);
                }
            }
            Some("ReturnStatement") | Some("ThrowStatement") => {
                if let Some(argument) = json.get("argument")
                    && !argument.is_null()
                {
                    self.track_json_expression_updates(argument);
                }
            }
            Some("TryStatement") => {
                if let Some(block) = json.get("block") {
                    self.process_raw_statement(block);
                }
                if let Some(handler) = json.get("handler")
                    && !handler.is_null()
                {
                    self.process_raw_statement(handler);
                }
                if let Some(finalizer) = json.get("finalizer")
                    && !finalizer.is_null()
                {
                    self.process_raw_statement(finalizer);
                }
            }
            Some("CatchClause") => {
                if let Some(body) = json.get("body") {
                    let old_scope = self.push_scope();
                    // Declare catch parameter
                    if let Some(param) = json.get("param")
                        && !param.is_null()
                    {
                        self.declare_raw_binding_names(param, BindingKind::Normal);
                    }
                    self.process_raw_statement(body);
                    self.pop_scope(old_scope);
                }
            }
            Some("SwitchStatement") => {
                if let Some(discriminant) = json.get("discriminant") {
                    self.track_json_expression_updates(discriminant);
                }
                if let Some(cases) = json.get("cases").and_then(|c| c.as_array()) {
                    for case in cases {
                        if let Some(test) = case.get("test")
                            && !test.is_null()
                        {
                            self.track_json_expression_updates(test);
                        }
                        if let Some(consequent) = case.get("consequent").and_then(|c| c.as_array())
                        {
                            for stmt in consequent {
                                self.process_raw_statement(stmt);
                            }
                        }
                    }
                }
            }
            Some("ExportDefaultDeclaration") => {
                // Export default doesn't create a named binding in the module scope
            }
            Some("ImportDeclaration") => {
                // Process import specifiers for the Raw path
                if json.get("importKind").and_then(|k| k.as_str()) == Some("type") {
                    return;
                }
                let source_val = json
                    .get("source")
                    .and_then(|s| s.get("value"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                if let Some(specifiers) = json.get("specifiers").and_then(|s| s.as_array()) {
                    for spec in specifiers {
                        // Skip per-specifier type imports: `import { type Foo, Bar }`
                        if spec.get("importKind").and_then(|k| k.as_str()) == Some("type") {
                            continue;
                        }
                        let spec_type = spec.get("type").and_then(|t| t.as_str());
                        let local_name = spec
                            .get("local")
                            .and_then(|l| l.get("name"))
                            .and_then(|n| n.as_str());
                        if let Some(name) = local_name {
                            match spec_type {
                                Some("ImportDefaultSpecifier")
                                | Some("ImportSpecifier")
                                | Some("ImportNamespaceSpecifier") => {
                                    let specifier_type = spec_type.unwrap_or("ImportSpecifier");
                                    let idx = self.declare_binding(
                                        name.to_string(),
                                        BindingKind::Normal,
                                        DeclarationKind::Import,
                                    );
                                    self.bindings[idx].import_source = Some(source_val.clone());
                                    // Store initial as ImportDeclaration JSON for
                                    // legacy_component_creation warning detection
                                    let import_json = serde_json::json!({
                                        "type": "ImportDeclaration",
                                        "source": { "value": source_val },
                                        "specifiers": [{
                                            "type": specifier_type,
                                            "local": { "name": name }
                                        }]
                                    });
                                    self.bindings[idx].initial = Some(import_json.to_string());
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }

    /// Process a class body stored as a JSON Value.
    /// This handles ClassDeclaration stored as JsNode::Raw(Value) by iterating
    /// method definitions and declaring their parameters in inner scopes.
    /// This ensures that identifiers like constructor parameters are added to the
    /// conflicts set, preventing naming collisions with generated variables.
    fn process_raw_class_body(&mut self, body: &serde_json::Value) {
        let elements = match body.get("body").and_then(|b| b.as_array()) {
            Some(elems) => elems,
            None => return,
        };
        for element in elements {
            let elem_type = element.get("type").and_then(|t| t.as_str());
            match elem_type {
                Some("MethodDefinition") => {
                    if let Some(value) = element.get("value") {
                        let old_scope = self.push_function_scope();
                        self.function_depth += 1;
                        // Declare function parameters
                        if let Some(params) = value.get("params").and_then(|p| p.as_array()) {
                            for param in params {
                                self.declare_raw_binding_names(param, BindingKind::Normal);
                            }
                        }
                        // Process method body for declarations and updates
                        if let Some(fn_body) = value.get("body")
                            && let Some(body_stmts) = fn_body.get("body").and_then(|b| b.as_array())
                        {
                            for stmt in body_stmts {
                                self.process_raw_statement(stmt);
                            }
                        }
                        self.function_depth -= 1;
                        self.pop_scope(old_scope);
                    }
                }
                Some("PropertyDefinition") => {
                    if let Some(value) = element.get("value")
                        && !value.is_null()
                    {
                        self.track_json_expression_updates(value);
                    }
                }
                Some("StaticBlock") => {
                    if let Some(body_stmts) = element.get("body").and_then(|b| b.as_array()) {
                        let old_scope = self.push_scope();
                        for stmt in body_stmts {
                            self.process_raw_statement(stmt);
                        }
                        self.pop_scope(old_scope);
                    }
                }
                _ => {}
            }
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
            JsNode::Raw(v) => {
                self.collect_names_from_raw_pattern_into_nested(v);
            }
            _ => {}
        }
    }

    /// Collect all identifier names from a raw JSON binding pattern into the
    /// `nested_declared_names` set (used to seed root.conflicts with inner-scope names).
    fn collect_names_from_raw_pattern_into_nested(&mut self, pattern: &serde_json::Value) {
        let pattern_type = pattern.get("type").and_then(|t| t.as_str());
        match pattern_type {
            Some("Identifier") => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    self.nested_declared_names.insert(name.to_string());
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        match prop.get("type").and_then(|t| t.as_str()) {
                            Some("Property") => {
                                if let Some(value) = prop.get("value") {
                                    self.collect_names_from_raw_pattern_into_nested(value);
                                }
                            }
                            Some("RestElement") | Some("SpreadElement") => {
                                if let Some(arg) = prop.get("argument") {
                                    self.collect_names_from_raw_pattern_into_nested(arg);
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.collect_names_from_raw_pattern_into_nested(elem);
                        }
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = pattern.get("left") {
                    self.collect_names_from_raw_pattern_into_nested(left);
                }
            }
            Some("RestElement") => {
                if let Some(arg) = pattern.get("argument") {
                    self.collect_names_from_raw_pattern_into_nested(arg);
                }
            }
            _ => {}
        }
    }

    fn process_raw_binding_pattern(
        &mut self,
        pattern: Option<&serde_json::Value>,
        init: Option<&serde_json::Value>,
        decl_kind: DeclarationKind,
    ) {
        let pattern = match pattern {
            Some(p) => p,
            None => return,
        };
        let pattern_type = pattern.get("type").and_then(|t| t.as_str());
        match pattern_type {
            Some("Identifier") => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    let kind = init
                        .map(Self::detect_binding_kind_from_json)
                        .unwrap_or(BindingKind::Normal);
                    let start_val =
                        pattern.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;
                    let idx = self.declare_binding(name.to_string(), kind, decl_kind);
                    self.bindings[idx].declaration_start = Some(start_val);
                    if let Some(init_val) = init {
                        let init_type = init_val.get("type").and_then(|t| t.as_str());
                        if init_type == Some("ArrowFunctionExpression")
                            || init_type == Some("FunctionExpression")
                        {
                            self.bindings[idx].initial_is_function = true;
                        }
                    }
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        let prop_type = prop.get("type").and_then(|t| t.as_str());
                        match prop_type {
                            Some("Property") => {
                                self.process_raw_binding_pattern(
                                    prop.get("value"),
                                    None,
                                    decl_kind,
                                );
                            }
                            Some("RestElement") | Some("SpreadElement") => {
                                self.process_raw_binding_pattern(
                                    prop.get("argument"),
                                    None,
                                    decl_kind,
                                );
                            }
                            _ => {}
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.process_raw_binding_pattern(Some(elem), None, decl_kind);
                        }
                    }
                }
            }
            Some("AssignmentPattern") => {
                self.process_raw_binding_pattern(pattern.get("left"), init, decl_kind);
            }
            _ => {}
        }
    }

    /// Declare binding names from a JSON pattern (for function parameters in Raw paths).
    fn declare_raw_binding_names(&mut self, pattern: &serde_json::Value, kind: BindingKind) {
        let pattern_type = pattern.get("type").and_then(|t| t.as_str());
        match pattern_type {
            Some("Identifier") => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    self.declare_binding(name.to_string(), kind, DeclarationKind::Const);
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        let prop_type = prop.get("type").and_then(|t| t.as_str());
                        if prop_type == Some("Property") {
                            if let Some(value) = prop.get("value") {
                                self.declare_raw_binding_names(value, kind);
                            }
                        } else if (prop_type == Some("RestElement")
                            || prop_type == Some("SpreadElement"))
                            && let Some(arg) = prop.get("argument")
                        {
                            self.declare_raw_binding_names(arg, kind);
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.declare_raw_binding_names(elem, kind);
                        }
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = pattern.get("left") {
                    self.declare_raw_binding_names(left, kind);
                }
            }
            Some("RestElement") => {
                if let Some(arg) = pattern.get("argument") {
                    self.declare_raw_binding_names(arg, kind);
                }
            }
            _ => {}
        }
    }

    /// Detect binding kind from a JSON expression value.
    /// This is the JSON equivalent of `detect_binding_kind_from_node`.
    fn detect_binding_kind_from_json(init: &serde_json::Value) -> BindingKind {
        if init.get("type").and_then(|t| t.as_str()) == Some("CallExpression") {
            let callee = match init.get("callee") {
                Some(c) => c,
                None => return BindingKind::Normal,
            };
            let callee_type = callee.get("type").and_then(|t| t.as_str());
            if callee_type == Some("Identifier") {
                if let Some(name) = callee.get("name").and_then(|n| n.as_str()) {
                    match name {
                        "$state" => return BindingKind::State,
                        "$derived" => return BindingKind::Derived,
                        "$props" => return BindingKind::Prop,
                        _ => {}
                    }
                }
            } else if callee_type == Some("MemberExpression") {
                let obj = callee.get("object");
                let prop = callee.get("property");
                if let (Some(obj), Some(prop)) = (obj, prop) {
                    let obj_name = obj.get("name").and_then(|n| n.as_str());
                    let prop_name = prop.get("name").and_then(|n| n.as_str());
                    match (obj_name, prop_name) {
                        (Some("$state"), Some("raw")) => return BindingKind::RawState,
                        (Some("$derived"), Some("by")) => return BindingKind::Derived,
                        _ => {}
                    }
                }
            }
        }
        BindingKind::Normal
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
                // Add current_script_offset so positions align with the JSON AST
                // positions used by the visitor phase.
                self.bindings[idx].declaration_start =
                    Some(*start + self.current_script_offset as u32);
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
                                if let JsNode::Identifier { name, .. } = arg_node {
                                    self.declare_binding(
                                        name.to_string(),
                                        BindingKind::RestProp,
                                        decl_kind,
                                    );
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
            JsNode::Raw(json) => {
                // Fallback for patterns stored as JSON (e.g., with TypeScript annotations).
                let json_type = json.get("type").and_then(|t| t.as_str());
                match json_type {
                    Some("Identifier") => {
                        if let Some(name) = json.get("name").and_then(|n| n.as_str()) {
                            let kind = if let Some(init_id) = init {
                                let init_node = self.arena.get_js_node(init_id);
                                self.detect_binding_kind_from_node(init_node)
                            } else {
                                BindingKind::Normal
                            };
                            let start_val =
                                json.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;
                            let idx = self.declare_binding(name.to_string(), kind, decl_kind);
                            self.bindings[idx].declaration_start = Some(start_val);
                            if let Some(init_id) = init {
                                let init_node = self.arena.get_js_node(init_id);
                                if matches!(
                                    init_node,
                                    JsNode::ArrowFunctionExpression { .. }
                                        | JsNode::FunctionExpression { .. }
                                ) {
                                    self.bindings[idx].initial_is_function = true;
                                }
                            }
                        }
                    }
                    Some("ObjectPattern") => {
                        let is_props_init = init
                            .map(|init_id| {
                                let init_node = self.arena.get_js_node(init_id);
                                matches!(
                                    self.detect_binding_kind_from_node(init_node),
                                    BindingKind::Prop
                                )
                            })
                            .unwrap_or(false);
                        if let Some(props) = json.get("properties").and_then(|p| p.as_array()) {
                            for prop in props {
                                let prop_type = prop.get("type").and_then(|t| t.as_str());
                                match prop_type {
                                    Some("Property") => {
                                        if let Some(value) = prop.get("value") {
                                            let node = JsNode::Raw(value.clone());
                                            let node_id = self.arena.alloc_js_node(node);
                                            let node_ref = self.arena.get_js_node(node_id);
                                            self.process_binding_pattern_typed(
                                                node_ref, None, decl_kind,
                                            );
                                        }
                                    }
                                    Some("RestElement") | Some("SpreadElement") => {
                                        if is_props_init {
                                            if let Some(arg) = prop.get("argument")
                                                && arg.get("type").and_then(|t| t.as_str())
                                                    == Some("Identifier")
                                                && let Some(name) =
                                                    arg.get("name").and_then(|n| n.as_str())
                                            {
                                                self.declare_binding(
                                                    name.to_string(),
                                                    BindingKind::RestProp,
                                                    decl_kind,
                                                );
                                            }
                                        } else if let Some(arg) = prop.get("argument") {
                                            let node = JsNode::Raw(arg.clone());
                                            let node_id = self.arena.alloc_js_node(node);
                                            let node_ref = self.arena.get_js_node(node_id);
                                            self.process_binding_pattern_typed(
                                                node_ref, None, decl_kind,
                                            );
                                        }
                                    }
                                    _ => {}
                                }
                            }
                        }
                    }
                    Some("ArrayPattern") => {
                        if let Some(elements) = json.get("elements").and_then(|e| e.as_array()) {
                            for elem in elements {
                                if !elem.is_null() {
                                    let node = JsNode::Raw(elem.clone());
                                    let node_id = self.arena.alloc_js_node(node);
                                    let node_ref = self.arena.get_js_node(node_id);
                                    self.process_binding_pattern_typed(node_ref, None, decl_kind);
                                }
                            }
                        }
                    }
                    Some("AssignmentPattern") => {
                        if let Some(left) = json.get("left") {
                            let node = JsNode::Raw(left.clone());
                            let node_id = self.arena.alloc_js_node(node);
                            let node_ref = self.arena.get_js_node(node_id);
                            self.process_binding_pattern_typed(node_ref, init, decl_kind);
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }

    /// Process an import specifier from a typed JsNode.
    fn process_import_specifier_typed(&mut self, node: &JsNode, source_val: &str) {
        let (name, specifier_type) = match node {
            JsNode::ImportSpecifier {
                local, import_kind, ..
            } => {
                // Skip type-only specifiers
                if import_kind.as_deref() == Some("type") {
                    return;
                }
                let local_node = self.arena.get_js_node(*local);
                if let JsNode::Identifier { name, .. } = local_node {
                    (name.to_string(), "ImportSpecifier")
                } else {
                    return;
                }
            }
            JsNode::ImportDefaultSpecifier { local, .. } => {
                let local_node = self.arena.get_js_node(*local);
                if let JsNode::Identifier { name, .. } = local_node {
                    (name.to_string(), "ImportDefaultSpecifier")
                } else {
                    return;
                }
            }
            JsNode::ImportNamespaceSpecifier { local, .. } => {
                let local_node = self.arena.get_js_node(*local);
                if let JsNode::Identifier { name, .. } = local_node {
                    (name.to_string(), "ImportNamespaceSpecifier")
                } else {
                    return;
                }
            }
            _ => return,
        };
        let binding_idx =
            self.declare_binding(name.clone(), BindingKind::Normal, DeclarationKind::Import);
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
                            // Declare function parameters
                            for param in self.arena.get_js_children(params) {
                                self.declare_bindings_from_pattern_node(
                                    param,
                                    BindingKind::Normal,
                                    false,
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
            // Raw fallback - delegate to the JSON-based collector
            JsNode::Raw(json) => {
                self.collect_raw_assignment_lhs_identifiers(json);
            }
            // MemberExpression, etc. - not implicit declarations
            _ => {}
        }
    }

    /// Collect identifiers from the LHS of an assignment expression (JSON path).
    /// Used to find possible implicit `legacy_reactive` declarations from `$: x = expr`.
    fn collect_raw_assignment_lhs_identifiers(&mut self, node: &serde_json::Value) {
        let node_type = node.get("type").and_then(|t| t.as_str());
        match node_type {
            Some("Identifier") => {
                if let Some(name) = node.get("name").and_then(|n| n.as_str())
                    && !name.starts_with('$')
                {
                    self.possible_implicit_declarations.push(name.to_string());
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.collect_raw_assignment_lhs_identifiers(elem);
                        }
                    }
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = node.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        let prop_type = prop.get("type").and_then(|t| t.as_str());
                        match prop_type {
                            Some("Property") => {
                                if let Some(value) = prop.get("value") {
                                    self.collect_raw_assignment_lhs_identifiers(value);
                                }
                            }
                            Some("RestElement") | Some("SpreadElement") => {
                                if let Some(arg) = prop.get("argument") {
                                    self.collect_raw_assignment_lhs_identifiers(arg);
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = node.get("left") {
                    self.collect_raw_assignment_lhs_identifiers(left);
                }
            }
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
                    self.declare_binding(name, BindingKind::Normal, DeclarationKind::Let);
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
                // Process try block
                for stmt in &try_stmt.block.body {
                    self.process_statement(stmt);
                }
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
                // Process finally block if present
                if let Some(ref finalizer) = try_stmt.finalizer {
                    for stmt in &finalizer.body {
                        self.process_statement(stmt);
                    }
                }
            }
            Statement::ThrowStatement(throw_stmt) => {
                self.track_expression_updates(&throw_stmt.argument);
            }
            Statement::SwitchStatement(switch_stmt) => {
                self.track_expression_updates(&switch_stmt.discriminant);
                for case in &switch_stmt.cases {
                    if let Some(ref test) = case.test {
                        self.track_expression_updates(test);
                    }
                    for stmt in &case.consequent {
                        self.process_statement(stmt);
                    }
                }
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
                    if let oxc_ast::ast::Expression::AssignmentExpression(assign) = inner_expr {
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
            | Expression::MetaProperty(_) => {}
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
                            self.declare_binding(
                                ident.name.to_string(),
                                BindingKind::RestProp,
                                decl_kind,
                            );
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
                let (name, specifier_type) = match specifier {
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) => {
                        // Skip per-specifier type imports: `import { type Foo, Bar }`
                        if spec.import_kind == oxc_ast::ast::ImportOrExportKind::Type {
                            continue;
                        }
                        (spec.local.name.to_string(), "ImportSpecifier")
                    }
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(spec) => {
                        (spec.local.name.to_string(), "ImportDefaultSpecifier")
                    }
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(spec) => {
                        (spec.local.name.to_string(), "ImportNamespaceSpecifier")
                    }
                };
                let binding_idx = self.declare_binding(
                    name.clone(),
                    BindingKind::Normal,
                    DeclarationKind::Import,
                );
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
                    // Process use: directive expression
                    if let Some(ref expression) = use_dir.expression {
                        self.process_template_expression(expression);
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Process spread attribute expression
                    self.process_template_expression(&spread.expression);
                }
                _ => {}
            }
        }
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
            Expression::Value(json) => {
                // Legacy fallback: walk JSON AST directly.
                self.track_json_expression_updates(json);
                collect_arrow_param_names(json, &mut self.template_expression_params);
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

            // Raw fallback: use JSON version
            JsNode::Raw(json) => {
                let expr_type = json.get("type").and_then(|t| t.as_str());
                if expr_type == Some("SequenceExpression") {
                    return;
                }
                if expr_type == Some("Identifier") {
                    if let Some(serde_json::Value::String(name)) = json.get("name") {
                        self.updates.push(Update {
                            name: name.clone(),
                            is_direct_assignment: true,
                            scope_idx: self.current_scope,
                        });
                    }
                    return;
                }
                if expr_type == Some("MemberExpression") {
                    let mut current = json;
                    while current.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
                        if let Some(obj) = current.get("object") {
                            current = obj;
                        } else {
                            return;
                        }
                    }
                    if current.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                        && let Some(serde_json::Value::String(name)) = current.get("name")
                    {
                        self.updates.push(Update {
                            name: name.clone(),
                            is_direct_assignment: false,
                            scope_idx: self.current_scope,
                        });
                    }
                }
            }

            _ => {}
        }
    }

    /// Track expression updates by walking the JSON AST directly.
    /// This avoids the expensive OXC parse call for every template expression.
    #[allow(clippy::collapsible_if)]
    fn track_json_expression_updates(&mut self, value: &serde_json::Value) {
        let obj = match value.as_object() {
            Some(obj) => obj,
            None => return,
        };
        let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match node_type {
            "AssignmentExpression" => {
                // Track the left side as an update
                if let Some(left) = obj.get("left") {
                    self.track_json_assignment_target(left);
                }
                // Recurse into right side
                if let Some(right) = obj.get("right") {
                    self.track_json_expression_updates(right);
                }
            }
            "UpdateExpression" => {
                // Track the argument as an update (e.g., count++)
                if let Some(argument) = obj.get("argument") {
                    self.track_json_simple_assignment_target(argument);
                }
            }
            "CallExpression" | "NewExpression" => {
                if let Some(callee) = obj.get("callee") {
                    self.track_json_expression_updates(callee);
                }
                if let Some(args) = obj.get("arguments").and_then(|a| a.as_array()) {
                    for arg in args {
                        let arg_type = arg.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if arg_type == "SpreadElement" {
                            if let Some(argument) = arg.get("argument") {
                                self.track_json_expression_updates(argument);
                            }
                        } else {
                            self.track_json_expression_updates(arg);
                        }
                    }
                }
            }
            "ArrowFunctionExpression" => {
                // Create scope for arrow function (non-porous)
                let old_scope = self.push_function_scope();
                self.function_depth += 1;

                // Record function scope mapping
                if let Some(body) = obj.get("body") {
                    if let Some(start) = body.get("start").and_then(|s| s.as_u64()) {
                        let key = start as u32;
                        self.function_scope_map.insert(key, self.current_scope);
                    }
                }

                // Declare parameters
                if let Some(params) = obj.get("params").and_then(|p| p.as_array()) {
                    for param in params {
                        self.declare_bindings_from_pattern(param, BindingKind::Normal, true);
                    }
                }

                // Track body updates
                if let Some(body) = obj.get("body") {
                    let body_type = body.get("type").and_then(|t| t.as_str()).unwrap_or("");
                    if body_type == "BlockStatement" {
                        if let Some(stmts) = body.get("body").and_then(|b| b.as_array()) {
                            for stmt in stmts {
                                self.track_json_statement_updates(stmt);
                            }
                        }
                    } else {
                        // Expression body
                        self.track_json_expression_updates(body);
                    }
                }

                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            "FunctionExpression" => {
                let old_scope = self.push_function_scope();
                self.function_depth += 1;

                if let Some(body) = obj.get("body") {
                    if let Some(start) = body.get("start").and_then(|s| s.as_u64()) {
                        let key = start as u32;
                        self.function_scope_map.insert(key, self.current_scope);
                    }
                }

                if let Some(params) = obj.get("params").and_then(|p| p.as_array()) {
                    for param in params {
                        self.declare_bindings_from_pattern(param, BindingKind::Normal, true);
                    }
                }

                if let Some(body) = obj.get("body") {
                    if let Some(stmts) = body.get("body").and_then(|b| b.as_array()) {
                        for stmt in stmts {
                            self.track_json_statement_updates(stmt);
                        }
                    }
                }

                self.function_depth -= 1;
                self.pop_scope(old_scope);
            }
            "ConditionalExpression" => {
                if let Some(test) = obj.get("test") {
                    self.track_json_expression_updates(test);
                }
                if let Some(consequent) = obj.get("consequent") {
                    self.track_json_expression_updates(consequent);
                }
                if let Some(alternate) = obj.get("alternate") {
                    self.track_json_expression_updates(alternate);
                }
            }
            "LogicalExpression" | "BinaryExpression" => {
                if let Some(left) = obj.get("left") {
                    self.track_json_expression_updates(left);
                }
                if let Some(right) = obj.get("right") {
                    self.track_json_expression_updates(right);
                }
            }
            "UnaryExpression" => {
                if let Some(argument) = obj.get("argument") {
                    self.track_json_expression_updates(argument);
                }
            }
            "SequenceExpression" => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for expr in exprs {
                        self.track_json_expression_updates(expr);
                    }
                }
            }
            "ArrayExpression" => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if elem.is_null() {
                            continue;
                        }
                        let elem_type = elem.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if elem_type == "SpreadElement" {
                            if let Some(argument) = elem.get("argument") {
                                self.track_json_expression_updates(argument);
                            }
                        } else {
                            self.track_json_expression_updates(elem);
                        }
                    }
                }
            }
            "ObjectExpression" => {
                if let Some(properties) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        let prop_type = prop.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if prop_type == "SpreadElement" {
                            if let Some(argument) = prop.get("argument") {
                                self.track_json_expression_updates(argument);
                            }
                        } else {
                            // Property - track value
                            if let Some(value) = prop.get("value") {
                                self.track_json_expression_updates(value);
                            }
                        }
                    }
                }
            }
            "MemberExpression" => {
                if let Some(object) = obj.get("object") {
                    self.track_json_expression_updates(object);
                }
            }
            "TemplateLiteral" => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for expr in exprs {
                        self.track_json_expression_updates(expr);
                    }
                }
            }
            "TaggedTemplateExpression" => {
                if let Some(tag) = obj.get("tag") {
                    self.track_json_expression_updates(tag);
                }
                if let Some(quasi) = obj.get("quasi") {
                    if let Some(exprs) = quasi.get("expressions").and_then(|e| e.as_array()) {
                        for expr in exprs {
                            self.track_json_expression_updates(expr);
                        }
                    }
                }
            }
            "AwaitExpression" => {
                if let Some(argument) = obj.get("argument") {
                    self.track_json_expression_updates(argument);
                }
            }
            "YieldExpression" => {
                if let Some(argument) = obj.get("argument") {
                    if !argument.is_null() {
                        self.track_json_expression_updates(argument);
                    }
                }
            }
            "ParenthesizedExpression" => {
                if let Some(expression) = obj.get("expression") {
                    self.track_json_expression_updates(expression);
                }
            }
            "Identifier" => {
                // Check for store subscription scoping errors
                if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                    if name.starts_with('$')
                        && !name.starts_with("$$")
                        && name.len() > 1
                        && self.function_depth > 0
                    {
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
            }
            // TypeScript wrappers
            "TSAsExpression"
            | "TSNonNullExpression"
            | "TSSatisfiesExpression"
            | "TSTypeAssertion"
            | "TSInstantiationExpression" => {
                if let Some(expression) = obj.get("expression") {
                    self.track_json_expression_updates(expression);
                }
            }
            // Literals and other leaf nodes - no updates to track
            _ => {}
        }
    }

    /// Track an assignment target from JSON AST.
    fn track_json_assignment_target(&mut self, value: &serde_json::Value) {
        let obj = match value.as_object() {
            Some(obj) => obj,
            None => return,
        };
        let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match node_type {
            "Identifier" => {
                if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                    // Check for store subscription errors
                    if name.starts_with('$')
                        && !name.starts_with("$$")
                        && name.len() > 1
                        && self.function_depth > 0
                    {
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
            }
            "MemberExpression" => {
                // Walk to base identifier
                if let Some(name) = self.get_json_base_identifier_name(value) {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            "ArrayPattern" => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.track_json_assignment_target(elem);
                        }
                    }
                }
            }
            "ObjectPattern" => {
                if let Some(properties) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        let prop_type = prop.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if prop_type == "RestElement" {
                            if let Some(argument) = prop.get("argument") {
                                self.track_json_assignment_target(argument);
                            }
                        } else if let Some(value) = prop.get("value") {
                            self.track_json_assignment_target(value);
                        }
                    }
                }
            }
            "AssignmentPattern" => {
                // { x = default } in destructuring
                if let Some(left) = obj.get("left") {
                    self.track_json_assignment_target(left);
                }
            }
            "RestElement" => {
                if let Some(argument) = obj.get("argument") {
                    self.track_json_assignment_target(argument);
                }
            }
            _ => {}
        }
    }

    /// Track a simple assignment target (update expression argument) from JSON AST.
    fn track_json_simple_assignment_target(&mut self, value: &serde_json::Value) {
        let obj = match value.as_object() {
            Some(obj) => obj,
            None => return,
        };
        let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match node_type {
            "Identifier" => {
                if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                    self.updates.push(Update {
                        name: name.to_string(),
                        is_direct_assignment: true,
                        scope_idx: self.current_scope,
                    });
                }
            }
            "MemberExpression" => {
                if let Some(name) = self.get_json_base_identifier_name(value) {
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

    /// Get the base identifier name from a JSON member expression.
    #[allow(clippy::only_used_in_recursion)]
    fn get_json_base_identifier_name(&self, value: &serde_json::Value) -> Option<String> {
        let obj = value.as_object()?;
        let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match node_type {
            "Identifier" => obj
                .get("name")
                .and_then(|n| n.as_str())
                .map(|s| s.to_string()),
            "MemberExpression" => {
                let object = obj.get("object")?;
                self.get_json_base_identifier_name(object)
            }
            "ParenthesizedExpression" => {
                let expression = obj.get("expression")?;
                self.get_json_base_identifier_name(expression)
            }
            _ => None,
        }
    }

    /// Track statement updates from JSON AST (for arrow/function bodies).
    #[allow(clippy::collapsible_if)]
    fn track_json_statement_updates(&mut self, value: &serde_json::Value) {
        let obj = match value.as_object() {
            Some(obj) => obj,
            None => return,
        };
        let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match node_type {
            "ExpressionStatement" => {
                if let Some(expression) = obj.get("expression") {
                    self.track_json_expression_updates(expression);
                }
            }
            "ReturnStatement" => {
                if let Some(argument) = obj.get("argument") {
                    if !argument.is_null() {
                        self.track_json_expression_updates(argument);
                    }
                }
            }
            "VariableDeclaration" => {
                let decl_kind = match obj.get("kind").and_then(|k| k.as_str()) {
                    Some("const") => DeclarationKind::Const,
                    Some("let") => DeclarationKind::Let,
                    Some("var") => DeclarationKind::Var,
                    _ => DeclarationKind::Const,
                };
                if let Some(declarations) = obj.get("declarations").and_then(|d| d.as_array()) {
                    for decl in declarations {
                        // Declare the variable binding so it's in the conflicts set
                        self.process_raw_binding_pattern(
                            decl.get("id"),
                            decl.get("init"),
                            decl_kind,
                        );
                        if let Some(init) = decl.get("init") {
                            if !init.is_null() {
                                self.track_json_expression_updates(init);
                            }
                        }
                    }
                }
            }
            "IfStatement" => {
                if let Some(test) = obj.get("test") {
                    self.track_json_expression_updates(test);
                }
                if let Some(consequent) = obj.get("consequent") {
                    self.track_json_statement_updates(consequent);
                }
                if let Some(alternate) = obj.get("alternate") {
                    if !alternate.is_null() {
                        self.track_json_statement_updates(alternate);
                    }
                }
            }
            "BlockStatement" => {
                // Push a new lexical scope. Without this, `let`/`const`
                // inside if/else branches and other free blocks collapse
                // into the parent function scope and trigger spurious
                // `declaration_duplicate` validation errors when two
                // branches each declare a same-named local (real-world
                // case: svelte-sonner's toast-state.svelte.js — three
                // `const message` declarations in if/else if branches of
                // a `.then()` callback). Function-body BlockStatements
                // are iterated directly by their owning function handler,
                // so this only affects inner blocks where lexical
                // block-scoping actually applies.
                if let Some(body) = obj.get("body").and_then(|b| b.as_array()) {
                    let old_scope = self.push_scope();
                    for stmt in body {
                        self.track_json_statement_updates(stmt);
                    }
                    self.pop_scope(old_scope);
                }
            }
            "ForStatement" | "WhileStatement" | "DoWhileStatement" => {
                if let Some(body) = obj.get("body") {
                    self.track_json_statement_updates(body);
                }
            }
            "ForInStatement" | "ForOfStatement" => {
                // Also collect loop variable declarations (e.g. `for (const node of ...)`)
                // so their names enter root.conflicts and avoid collision with generated vars.
                if let Some(left) = obj.get("left")
                    && left.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
                    && let Some(decls) = left.get("declarations").and_then(|d| d.as_array())
                {
                    for decl in decls {
                        if let Some(id) = decl.get("id") {
                            self.collect_names_from_raw_pattern_into_nested(id);
                        }
                    }
                }
                if let Some(body) = obj.get("body") {
                    self.track_json_statement_updates(body);
                }
            }
            "SwitchStatement" => {
                if let Some(cases) = obj.get("cases").and_then(|c| c.as_array()) {
                    for case in cases {
                        if let Some(consequent) = case.get("consequent").and_then(|c| c.as_array())
                        {
                            for stmt in consequent {
                                self.track_json_statement_updates(stmt);
                            }
                        }
                    }
                }
            }
            "TryStatement" => {
                if let Some(block) = obj.get("block") {
                    self.track_json_statement_updates(block);
                }
                if let Some(handler) = obj.get("handler") {
                    if !handler.is_null() {
                        if let Some(body) = handler.get("body") {
                            self.track_json_statement_updates(body);
                        }
                    }
                }
                if let Some(finalizer) = obj.get("finalizer") {
                    if !finalizer.is_null() {
                        self.track_json_statement_updates(finalizer);
                    }
                }
            }
            _ => {}
        }
    }

    /// Track expression updates by walking a JsNode tree directly.
    /// This is the typed equivalent of `track_json_expression_updates` and avoids
    /// the overhead of JSON conversion for template expressions.
    #[allow(clippy::collapsible_if)]
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
                    self.declare_bindings_from_pattern_node(param, BindingKind::Normal, false);
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
                } else if let JsNode::Raw(json) = body_node {
                    // The parser wraps arrow function bodies as JsNode::Raw(Value).
                    // Handle both BlockStatement and expression bodies from JSON.
                    let body_type = json.get("type").and_then(|t| t.as_str());
                    if body_type == Some("BlockStatement") {
                        if let Some(stmts) = json.get("body").and_then(|b| b.as_array()) {
                            for stmt in stmts {
                                self.track_json_statement_updates(stmt);
                            }
                        }
                    } else {
                        self.track_json_expression_updates(json);
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
                    self.declare_bindings_from_pattern_node(param, BindingKind::Normal, false);
                }
                if let Some(body_id) = body_id {
                    let body_node = self.arena.get_js_node(body_id);
                    if let JsNode::BlockStatement { body: stmts, .. } = body_node {
                        let stmts = *stmts;
                        for stmt in self.arena.get_js_children(stmts) {
                            self.process_statement_typed(stmt);
                        }
                    } else if let JsNode::Raw(json) = body_node {
                        // Handle Raw BlockStatement body (from convert_function_body_for_program)
                        if json.get("type").and_then(|t| t.as_str()) == Some("BlockStatement") {
                            if let Some(stmts) = json.get("body").and_then(|b| b.as_array()) {
                                for stmt in stmts {
                                    self.track_json_statement_updates(stmt);
                                }
                            }
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
                                    self.declare_bindings_from_pattern_node(
                                        param,
                                        BindingKind::Normal,
                                        false,
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
            // JsNode::Raw fallback: convert to JSON and use the JSON walker
            JsNode::Raw(json) => {
                self.track_json_expression_updates(json);
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
                    get_node_base_identifier_name(self.arena.get_js_node(*object), self.arena)
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
            JsNode::Raw(json) => {
                self.track_json_assignment_target(json);
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
                    get_node_base_identifier_name(self.arena.get_js_node(*object), self.arena)
                {
                    self.updates.push(Update {
                        name,
                        is_direct_assignment: false,
                        scope_idx: self.current_scope,
                    });
                }
            }
            JsNode::Raw(json) => {
                self.track_json_simple_assignment_target(json);
            }
            _ => {}
        }
    }

    /// Track statement updates from JsNode (for arrow/function bodies).
    #[allow(clippy::collapsible_match)]
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
            JsNode::Raw(json) => {
                self.track_json_statement_updates(json);
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

    /// Declare bindings from a pattern (handles destructuring).
    ///
    /// This is used for EachBlock context, AwaitBlock value/error, and SnippetBlock parameters.
    ///
    /// The `inside_rest` parameter tracks whether we're inside a RestElement in the pattern.
    /// This is used for the `bind_invalid_each_rest` warning - bindings inside rest elements
    /// create new objects, so binding to them won't work as expected.
    /// Corresponds to Svelte's scope.js L1201-1217.
    fn declare_bindings_from_pattern(
        &mut self,
        pattern: &serde_json::Value,
        kind: BindingKind,
        inside_rest: bool,
    ) {
        let pattern_type = pattern.get("type").and_then(|t| t.as_str());

        match pattern_type {
            Some("Identifier") => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    // Check for invalid $state/$derived usage in each context
                    // This matches Svelte's check in EachBlock.js:
                    // if (id?.type === 'Identifier' && (id.name === '$state' || id.name === '$derived'))
                    if kind == BindingKind::EachItem && (name == "$state" || name == "$derived") {
                        self.validation_errors
                            .push(super::errors::state_invalid_placement(name));
                        return;
                    }
                    let binding_idx =
                        self.declare_binding(name.to_string(), kind, DeclarationKind::Const);
                    // Mark if this binding is inside a rest element
                    if inside_rest {
                        self.bindings[binding_idx].inside_rest = true;
                    }
                }
            }
            // Handle both ObjectPattern (official AST) and ObjectExpression (our parser's AST
            // for destructured let directive patterns like let:box={{width, height}})
            Some("ObjectPattern") | Some("ObjectExpression") => {
                if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        let prop_type = prop.get("type").and_then(|t| t.as_str());
                        if prop_type == Some("RestElement") || prop_type == Some("SpreadElement") {
                            if let Some(argument) = prop.get("argument") {
                                self.declare_bindings_from_pattern(argument, kind, true);
                            }
                        } else if let Some(value) = prop.get("value") {
                            self.declare_bindings_from_pattern(value, kind, inside_rest);
                        }
                    }
                }
            }
            // Handle both ArrayPattern (official AST) and ArrayExpression (our parser's AST)
            Some("ArrayPattern") | Some("ArrayExpression") => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.declare_bindings_from_pattern(elem, kind, inside_rest);
                        }
                    }
                }
            }
            // Handle both RestElement (official AST) and SpreadElement (our parser's AST)
            Some("RestElement") | Some("SpreadElement") => {
                if let Some(argument) = pattern.get("argument") {
                    self.declare_bindings_from_pattern(argument, kind, true);
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = pattern.get("left") {
                    self.declare_bindings_from_pattern(left, kind, inside_rest);
                }
            }
            _ => {}
        }
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
                let binding_idx =
                    self.declare_binding(name.to_string(), kind, DeclarationKind::Const);
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
                            self.declare_bindings_from_pattern_node(
                                self.arena.get_js_node(*argument),
                                kind,
                                true,
                            );
                        }
                        JsNode::Property { value, .. } => {
                            self.declare_bindings_from_pattern_node(
                                self.arena.get_js_node(*value),
                                kind,
                                inside_rest,
                            );
                        }
                        _ => {}
                    }
                }
            }
            // Handle both ArrayPattern (official AST) and ArrayExpression (our parser's AST)
            JsNode::ArrayPattern { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.declare_bindings_from_pattern_node(elem, kind, inside_rest);
                }
            }
            JsNode::ArrayExpression { elements, .. } => {
                for elem in elements.iter().flatten() {
                    self.declare_bindings_from_pattern_node(elem, kind, inside_rest);
                }
            }
            // Handle both RestElement (official AST) and SpreadElement (our parser's AST)
            JsNode::RestElement { argument, .. } | JsNode::SpreadElement { argument, .. } => {
                self.declare_bindings_from_pattern_node(
                    self.arena.get_js_node(*argument),
                    kind,
                    true,
                );
            }
            JsNode::AssignmentPattern { left, .. } => {
                self.declare_bindings_from_pattern_node(
                    self.arena.get_js_node(*left),
                    kind,
                    inside_rest,
                );
            }
            // Raw fallback: use JSON version
            JsNode::Raw(v) => {
                self.declare_bindings_from_pattern(v, kind, inside_rest);
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
        self.visit_fragment(&block.consequent);
        self.pop_scope(old_scope);

        // Visit alternate if present, also in its own scope
        if let Some(ref alternate) = block.alternate {
            let old_scope = self.push_scope();
            self.visit_fragment(alternate);
            self.pop_scope(old_scope);
        }
    }

    /// Visit an await block.
    fn visit_await_block(&mut self, block: &AwaitBlock) {
        // Pending doesn't create a scope
        if let Some(ref pending) = block.pending {
            self.visit_fragment(pending);
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
            // Raw fallback: use JSON version
            JsNode::Raw(v) => {
                if v.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression") {
                    if let Some(left) = v.get("left") {
                        self.process_binding_pattern_from_json(left);
                        if let Some(right) = v.get("right") {
                            self.set_const_tag_initial(left, right);
                        }
                    }
                } else if let Some(declarations) = v.get("declarations").and_then(|d| d.as_array())
                    && let Some(declaration) = declarations.first()
                    && let Some(id) = declaration.get("id")
                {
                    self.process_binding_pattern_from_json(id);
                    if let Some(init) = declaration.get("init") {
                        self.set_const_tag_initial(id, init);
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
            JsNode::Raw(v) => {
                if v.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                    v.get("name").and_then(|n| n.as_str())
                } else {
                    None
                }
            }
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
        // Record the init node type so downstream transforms (e.g. should_proxy)
        // can check whether the initial value is a primitive expression.
        let init_type = match init {
            JsNode::Raw(v) => v.get("type").and_then(|t| t.as_str()).map(String::from),
            _ => Some(init.type_str().to_string()),
        };
        if let Some(ty) = init_type {
            self.bindings[idx].initial_node_type = Some(ty.clone());
            if ty == "Identifier" {
                let init_name = match init {
                    JsNode::Identifier { name, .. } => Some(name.to_string()),
                    JsNode::Raw(v) => v.get("name").and_then(|n| n.as_str()).map(String::from),
                    _ => None,
                };
                if let Some(n) = init_name {
                    self.bindings[idx].initial_identifier_name = Some(n);
                }
            }
        }
    }

    /// Set the initial value on @const bindings for scope.evaluate() support.
    /// This stores the init expression as a JSON string on binding.initial,
    /// enabling is_expression_known_json to recursively evaluate const values.
    fn set_const_tag_initial(&mut self, pattern: &serde_json::Value, init: &serde_json::Value) {
        if let Some("Identifier") = pattern.get("type").and_then(|t| t.as_str())
            && let Some(name) = pattern.get("name").and_then(|n| n.as_str())
            && let Some(&idx) = self.scopes[self.current_scope].declarations.get(name)
        {
            self.bindings[idx].initial = Some(init.to_string());
            self.bindings[idx].initial_is_defined = true;
            // Record the init node type so downstream transforms (e.g. should_proxy)
            // can check whether the initial value is a primitive expression.
            if let Some(ty) = init.get("type").and_then(|t| t.as_str()) {
                self.bindings[idx].initial_node_type = Some(ty.to_string());
                if ty == "Identifier"
                    && let Some(n) = init.get("name").and_then(|n| n.as_str())
                {
                    self.bindings[idx].initial_identifier_name = Some(n.to_string());
                }
            }
        }
        // For destructuring patterns, we don't store initial per-binding
        // (the whole expression is too complex to decompose per-identifier)
    }

    /// Process a binding pattern from a JSON value.
    /// Const-tag bindings get `BindingKind::Template` to match the official Svelte compiler
    /// (scope.js line 1057: `scope.declare(id, 'template', 'const')`).
    fn process_binding_pattern_from_json(&mut self, pattern: &serde_json::Value) {
        match pattern.get("type").and_then(|t| t.as_str()) {
            Some("Identifier") => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    self.declare_binding(
                        name.to_string(),
                        BindingKind::Template,
                        DeclarationKind::Const,
                    );
                }
            }
            Some("ObjectPattern") | Some("ObjectExpression") => {
                if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        if let Some(value) = prop.get("value") {
                            self.process_binding_pattern_from_json(value);
                        }
                    }
                }
            }
            Some("ArrayPattern") | Some("ArrayExpression") => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for element in elements {
                        if !element.is_null() {
                            self.process_binding_pattern_from_json(element);
                        }
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = pattern.get("left") {
                    self.process_binding_pattern_from_json(left);
                }
            }
            Some("RestElement") => {
                if let Some(argument) = pattern.get("argument") {
                    self.process_binding_pattern_from_json(argument);
                }
            }
            _ => {}
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
            // Raw fallback: use JSON version
            JsNode::Raw(v) => {
                self.process_binding_pattern_from_json(v);
            }
            _ => {}
        }
    }
}

/// Recursively collect all Identifier names from a JSON AST value.
///
/// Used by `promote_each_collection_bindings_if_updated` to extract identifiers
/// from a collection expression so their bindings can be promoted to State kind.
fn collect_identifiers_from_json(val: &serde_json::Value, result: &mut Vec<String>) {
    match val {
        serde_json::Value::Object(obj) => {
            if obj.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                    result.push(name.to_string());
                }
                // Don't recurse into Identifier children (start/end/loc are not sub-expressions)
            } else {
                for (key, v) in obj {
                    // Skip position fields and type field to avoid false matches
                    if key != "start" && key != "end" && key != "loc" && key != "type" {
                        collect_identifiers_from_json(v, result);
                    }
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr {
                collect_identifiers_from_json(v, result);
            }
        }
        _ => {}
    }
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
        // Raw fallback
        JsNode::Raw(v) => {
            collect_identifiers_from_json(v, result);
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

// TODO: Re-enable tests after fixing Expression clone issue with OXC 0.107
// #[cfg(test)]
// mod tests {
//     use super::*;
//
//     #[test]
//     fn test_detect_binding_kind_from_expr() {
//         use oxc_allocator::Allocator;
//         use oxc_parser::Parser;
//
//         let builder = ScopeBuilder::new("");
//
//         // Helper to parse an expression
//         let parse_expr = |code: &str| -> Expression {
//             let allocator = Allocator::default();
//             let source_type = SourceType::default();
//             let ret = Parser::new(&allocator, code, source_type).parse();
//             if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
//                 ret.program.body.first()
//             {
//                 expr_stmt.expression.clone() // clone() doesn't exist in OXC 0.107
//             } else {
//                 panic!("Failed to parse expression: {}", code);
//             }
//         };
//
//         // Test $state()
//         let expr = parse_expr("$state(0)");
//         assert_eq!(
//             builder.detect_binding_kind_from_expr(&expr),
//             BindingKind::State
//         );
//
//         // Test $state.raw()
//         let expr = parse_expr("$state.raw({})");
//         assert_eq!(
//             builder.detect_binding_kind_from_expr(&expr),
//             BindingKind::RawState
//         );
//
//         // Test $derived()
//         let expr = parse_expr("$derived(count * 2)");
//         assert_eq!(
//             builder.detect_binding_kind_from_expr(&expr),
//             BindingKind::Derived
//         );
//
//         // Test $props()
//         let expr = parse_expr("$props()");
//         assert_eq!(
//             builder.detect_binding_kind_from_expr(&expr),
//             BindingKind::Prop
//         );
//
//         // Test normal expression
//         let expr = parse_expr("42");
//         assert_eq!(
//             builder.detect_binding_kind_from_expr(&expr),
//             BindingKind::Normal
//         );
//     }
// }

/// Recursively collect identifier names from arrow function parameters in a JSON AST.
/// This walks the entire expression tree looking for ArrowFunctionExpression and
/// FunctionExpression nodes, then extracts parameter identifier names.
fn collect_arrow_param_names(json: &serde_json::Value, names: &mut Vec<String>) {
    match json {
        serde_json::Value::Object(obj) => {
            let node_type = obj.get("type").and_then(|t| t.as_str());
            if node_type == Some("ArrowFunctionExpression")
                || node_type == Some("FunctionExpression")
            {
                // Extract parameter names
                if let Some(serde_json::Value::Array(params)) = obj.get("params") {
                    for param in params {
                        collect_pattern_names(param, names);
                    }
                }
            }
            // Recurse into all values
            for value in obj.values() {
                collect_arrow_param_names(value, names);
            }
        }
        serde_json::Value::Array(arr) => {
            for item in arr {
                collect_arrow_param_names(item, names);
            }
        }
        _ => {}
    }
}

/// Extract identifier names from a binding pattern (Identifier, ObjectPattern, ArrayPattern, etc.)
fn collect_pattern_names(pattern: &serde_json::Value, names: &mut Vec<String>) {
    if let Some(obj) = pattern.as_object() {
        match obj.get("type").and_then(|t| t.as_str()) {
            Some("Identifier") => {
                if let Some(serde_json::Value::String(name)) = obj.get("name") {
                    names.push(name.clone());
                }
            }
            Some("ObjectPattern") => {
                if let Some(serde_json::Value::Array(props)) = obj.get("properties") {
                    for prop in props {
                        if let Some(value) = prop.get("value") {
                            collect_pattern_names(value, names);
                        } else if prop.get("type").and_then(|t| t.as_str()) == Some("RestElement")
                            && let Some(arg) = prop.get("argument")
                        {
                            collect_pattern_names(arg, names);
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(serde_json::Value::Array(elements)) = obj.get("elements") {
                    for elem in elements {
                        if !elem.is_null() {
                            collect_pattern_names(elem, names);
                        }
                    }
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    collect_pattern_names(arg, names);
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = obj.get("left") {
                    collect_pattern_names(left, names);
                }
            }
            _ => {}
        }
    }
}

/// JsNode version of `collect_arrow_param_names`. Walks the typed JsNode tree
/// looking for ArrowFunctionExpression and FunctionExpression nodes, then
/// extracts parameter identifier names. Avoids JSON conversion entirely.
fn collect_arrow_param_names_node(node: &JsNode, names: &mut Vec<String>, arena: &ParseArena) {
    match node {
        JsNode::ArrowFunctionExpression { params, body, .. } => {
            for param in arena.get_js_children(*params) {
                collect_pattern_names_node(param, names, arena);
            }
            collect_arrow_param_names_node(arena.get_js_node(*body), names, arena);
        }
        JsNode::FunctionExpression { params, body, .. } => {
            for param in arena.get_js_children(*params) {
                collect_pattern_names_node(param, names, arena);
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
        JsNode::Raw(json) => {
            collect_arrow_param_names(json, names);
        }
        // Leaf nodes or nodes without interesting children
        _ => {}
    }
}

/// JsNode version of `collect_pattern_names`.
fn collect_pattern_names_node(node: &JsNode, names: &mut Vec<String>, arena: &ParseArena) {
    match node {
        JsNode::Identifier { name, .. } => {
            names.push(name.to_string());
        }
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                if let JsNode::Property { value, .. } = prop {
                    collect_pattern_names_node(arena.get_js_node(*value), names, arena);
                } else if let JsNode::RestElement { argument, .. } = prop {
                    collect_pattern_names_node(arena.get_js_node(*argument), names, arena);
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                collect_pattern_names_node(elem, names, arena);
            }
        }
        JsNode::RestElement { argument, .. } => {
            collect_pattern_names_node(arena.get_js_node(*argument), names, arena);
        }
        JsNode::AssignmentPattern { left, .. } => {
            collect_pattern_names_node(arena.get_js_node(*left), names, arena);
        }
        JsNode::Raw(json) => {
            collect_pattern_names(json, names);
        }
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
        JsNode::Raw(json) => json.get("start").and_then(|s| s.as_u64()).map(|s| s as u32),
        _ => None,
    }
}

/// Get the base identifier name from a JsNode (walking through member expressions).
fn get_node_base_identifier_name(node: &JsNode, arena: &ParseArena) -> Option<String> {
    match node {
        JsNode::Identifier { name, .. } => Some(name.to_string()),
        JsNode::MemberExpression { object, .. } => {
            get_node_base_identifier_name(arena.get_js_node(*object), arena)
        }
        JsNode::Raw(json) => {
            // Fallback to JSON-based extraction
            let obj = json.as_object()?;
            match obj.get("type").and_then(|t| t.as_str())? {
                "Identifier" => obj
                    .get("name")
                    .and_then(|n| n.as_str())
                    .map(|s| s.to_string()),
                "MemberExpression" => {
                    let object = obj.get("object")?;
                    get_node_base_identifier_name_json(object)
                }
                _ => None,
            }
        }
        _ => None,
    }
}

/// JSON-only fallback for get_node_base_identifier_name (no arena needed).
fn get_node_base_identifier_name_json(json: &serde_json::Value) -> Option<String> {
    let obj = json.as_object()?;
    match obj.get("type").and_then(|t| t.as_str())? {
        "Identifier" => obj
            .get("name")
            .and_then(|n| n.as_str())
            .map(|s| s.to_string()),
        "MemberExpression" => {
            let object = obj.get("object")?;
            get_node_base_identifier_name_json(object)
        }
        _ => None,
    }
}
