//! Scope builder for the analyzer.
//!
//! Walks the AST and creates a scope tree with bindings.

use super::errors;
use super::scope::{Binding, BindingKind, DeclarationKind, Scope, ScopeRoot};
use super::visitors::shared::utils::validate_identifier_name;
use crate::ast::template::{
    AwaitBlock, ConstTag, EachBlock, Fragment, IfBlock, KeyBlock, RegularElement, Root, Script,
    SnippetBlock, TemplateNode,
};
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
}

impl<'a> ScopeBuilder<'a> {
    /// Create a new scope builder with runes mode and TypeScript flag.
    pub fn new(source: &'a str, runes_mode: bool, is_typescript: bool) -> Self {
        Self {
            scopes: vec![Scope::new(None)],
            bindings: Vec::new(),
            current_scope: 0,
            source,
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
            let old_scope = self.push_scope();
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
        let root_scope = all_scopes.first().cloned().unwrap_or_default();
        (
            ScopeRoot {
                bindings: self.bindings,
                scope: root_scope,
                all_scopes,
                instance_scope_index: self.instance_scope_index,
                function_scope_map: self.function_scope_map,
                each_block_collection_infos,
                template_scope_map: self.template_scope_map,
            },
            self.validation_errors,
        )
    }

    /// Push a new child scope and return its index.
    fn push_scope(&mut self) -> usize {
        let new_scope = Scope::new(Some(self.current_scope));
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

    /// Visit a script block and extract variable declarations using OXC.
    fn visit_script(&mut self, script: &Script) {
        let start = script.content.start().unwrap_or(0) as usize;
        let end = script.content.end().unwrap_or(0) as usize;

        if end <= start || end > self.source.len() {
            return;
        }

        // Store the script content offset so process_statement can use it
        // to record correct full-source positions in function_scope_map
        self.current_script_offset = start;

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

        let allocator = Allocator::default();
        let ret = OxcParser::new(&allocator, content, source_type).parse();

        if ret.errors.is_empty() {
            self.process_program(&ret.program);
        }
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
                // Create a new scope for the function body
                let old_scope = self.push_scope();
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
                self.track_expression_updates(&for_in_stmt.right);
                self.process_statement(&for_in_stmt.body);
            }
            Statement::ForOfStatement(for_of_stmt) => {
                self.track_expression_updates(&for_of_stmt.right);
                self.process_statement(&for_of_stmt.body);
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
                    // Create a new scope for the method
                    let old_scope = self.push_scope();
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
                // Create a new scope for the arrow function body
                let old_scope = self.push_scope();
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
                // Create a new scope for the function body
                let old_scope = self.push_scope();
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
                        let store_name = &name[1..];

                        // Look up the store name in the current scope chain
                        // Start from current scope and traverse up
                        let mut scope_idx = self.current_scope;
                        loop {
                            let scope = &self.scopes[scope_idx];
                            if scope.declarations.contains_key(store_name) {
                                // Found a binding for the store name
                                // If this scope is neither module (0) nor instance scope,
                                // and we're inside that scope (not just above it),
                                // it's a scoped subscription error.
                                // Use instance_scope_index instead of hardcoded 1 because
                                // when a module script creates child scopes (e.g. functions),
                                // the instance scope index shifts.
                                if scope_idx != 0 && scope_idx != self.instance_scope_index {
                                    // The store name is declared in a nested scope
                                    // This means the $store reference would refer to this
                                    // local variable, not the outer store - that's an error
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
                        let store_name = &name[1..];

                        // Look up the store name in the current scope chain
                        let mut scope_idx = self.current_scope;
                        loop {
                            let scope = &self.scopes[scope_idx];
                            if scope.declarations.contains_key(store_name) {
                                // Found a binding for the store name in a nested scope
                                // Use instance_scope_index instead of hardcoded 1
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
                let old_scope = self.push_scope();
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
        let source_val = import_decl.source.value.as_str();
        if let Some(specifiers) = &import_decl.specifiers {
            for specifier in specifiers {
                let (name, specifier_type) = match specifier {
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) => {
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
                    self.declare_bindings_from_pattern(
                        expression.as_json(),
                        BindingKind::Let,
                        false,
                    );
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
                _ => {}
            }
        }
    }

    /// Process a template expression (from attributes, event handlers, etc.) to track updates.
    fn process_template_expression(&mut self, expr: &crate::ast::js::Expression) {
        // Walk the JSON AST directly instead of re-parsing with OXC.
        // This avoids expensive OXC parse calls for every template expression.
        let json = expr.as_json();
        self.track_json_expression_updates(json);
    }

    /// Process a bind expression - the target is marked as reassigned or mutated.
    ///
    /// Matches the official Svelte compiler's scope.js BindDirective handler:
    /// - For Identifier expressions (bind:value={x}), marks as reassigned (direct assignment)
    /// - For MemberExpression (bind:this={foo[i]}), extracts the base object and marks as mutated
    /// - SequenceExpression (getter/setter syntax) is skipped (handled separately)
    fn process_template_expression_for_bind(&mut self, expr: &crate::ast::js::Expression) {
        let json = expr.as_json();
        let expr_type = json.get("type").and_then(|t| t.as_str());

        // Skip SequenceExpression (getter/setter syntax) - handled separately
        if expr_type == Some("SequenceExpression") {
            return;
        }

        // For direct Identifier (bind:value={x}), mark as reassigned
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

        // For MemberExpression (bind:this={foo[i]}), traverse to base object
        // and mark as mutated (not reassigned, since only a property is being set)
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
                    is_direct_assignment: false, // mutation, not reassignment
                    scope_idx: self.current_scope,
                });
            }
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
                // Create scope for arrow function
                let old_scope = self.push_scope();
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
                let old_scope = self.push_scope();
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
                            let store_name = &name[1..];
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
                            let store_name = &name[1..];
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
                if let Some(declarations) = obj.get("declarations").and_then(|d| d.as_array()) {
                    for decl in declarations {
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
                if let Some(body) = obj.get("body").and_then(|b| b.as_array()) {
                    for stmt in body {
                        self.track_json_statement_updates(stmt);
                    }
                }
            }
            "ForStatement" | "WhileStatement" | "DoWhileStatement" => {
                if let Some(body) = obj.get("body") {
                    self.track_json_statement_updates(body);
                }
            }
            "ForInStatement" | "ForOfStatement" => {
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
            let context_json = context.as_json();
            self.declare_bindings_from_pattern(context_json, BindingKind::EachItem, false);
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
            let json = block.expression.as_json();
            let mut ids = Vec::new();
            collect_identifiers_from_json(json, &mut ids);
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
                self.declare_bindings_from_pattern(value.as_json(), BindingKind::AwaitThen, false);
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
                self.declare_bindings_from_pattern(error.as_json(), BindingKind::AwaitCatch, false);
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
        if let Some(name) = block
            .expression
            .as_json()
            .get("name")
            .and_then(|n| n.as_str())
        {
            self.declare_binding(
                name.to_string(),
                BindingKind::Normal,
                DeclarationKind::Function,
            );
        }

        let old_scope = self.push_scope();

        // Map the snippet block's start position to its scope index
        self.template_scope_map
            .insert(block.start, self.current_scope);

        // Declare snippet parameters - handle destructuring patterns
        for param in &block.parameters {
            self.declare_bindings_from_pattern(param.as_json(), BindingKind::SnippetParam, false);
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
        let crate::ast::js::Expression::Value(value) = &tag.declaration;

        // Check if it's an AssignmentExpression
        if value.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression") {
            // Extract binding from left side
            if let Some(left) = value.get("left") {
                self.process_binding_pattern_from_json(left);
                // Store the initial value (right side) on the binding for scope.evaluate()
                if let Some(right) = value.get("right") {
                    self.set_const_tag_initial(left, right);
                }
            }
        }
        // Check if it's a VariableDeclaration
        else if let Some(declarations) = value.get("declarations").and_then(|d| d.as_array())
            && let Some(declaration) = declarations.first()
        {
            // Extract identifier names from the pattern
            if let Some(id) = declaration.get("id") {
                self.process_binding_pattern_from_json(id);
                // Store the initial value on the binding for scope.evaluate()
                if let Some(init) = declaration.get("init") {
                    self.set_const_tag_initial(id, init);
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

/// Build scopes for a component AST.
///
/// Returns a tuple of (ScopeRoot, Vec<AnalysisError>) where the errors
/// are validation errors collected during scope building.
pub fn build_scopes(
    ast: &Root,
    source: &str,
    runes_mode: bool,
    is_typescript: bool,
) -> (
    ScopeRoot,
    Vec<crate::compiler::phases::phase2_analyze::AnalysisError>,
) {
    let builder = ScopeBuilder::new(source, runes_mode, is_typescript);
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
