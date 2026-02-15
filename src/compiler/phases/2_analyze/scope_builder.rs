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
    /// Validation errors collected during scope building
    validation_errors: Vec<crate::compiler::phases::phase2_analyze::AnalysisError>,
}

impl<'a> ScopeBuilder<'a> {
    /// Create a new scope builder with runes mode.
    pub fn new(source: &'a str, runes_mode: bool) -> Self {
        Self {
            scopes: vec![Scope::new(None)],
            bindings: Vec::new(),
            current_scope: 0,
            source,
            updates: Vec::new(),
            function_depth: 0,
            runes_mode,
            validation_errors: Vec::new(),
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
            self.visit_script(script);
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
            let declarations: Vec<(String, usize)> = self.scopes[i]
                .declarations
                .iter()
                .map(|(k, v)| (k.clone(), *v))
                .collect();
            for (name, binding_idx) in declarations {
                // Only add if not already in root scope (outer scope takes precedence)
                self.scopes[0]
                    .declarations
                    .entry(name)
                    .or_insert(binding_idx);
            }
        }

        // Return the root scope with all scopes preserved for proper lookup
        let all_scopes = std::mem::take(&mut self.scopes);
        let root_scope = all_scopes.first().cloned().unwrap_or_default();
        (
            ScopeRoot {
                bindings: self.bindings,
                scope: root_scope,
                all_scopes,
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
        // In runes mode, we don't pass function_depth (validation always runs)
        // In legacy mode, we pass function_depth so validation skips in nested functions
        let function_depth = if self.runes_mode {
            None
        } else {
            Some(self.function_depth)
        };
        if let Err(e) = validate_identifier_name(&binding, function_depth) {
            self.validation_errors.push(e);
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

        let content = &self.source[start..end];

        // Determine if this is TypeScript
        let is_ts = script.attributes.iter().any(|attr| {
            if attr.name == "lang"
                && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
                && let Some(crate::ast::template::AttributeValuePart::Text(text)) = parts.first()
            {
                return text.data == "ts" || text.data == "typescript";
            }
            false
        });

        // Parse with OXC
        let source_type = if is_ts {
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
                                // If this scope is neither module (0) nor instance (1),
                                // and we're inside that scope (not just above it),
                                // it's a shadowing error
                                if scope_idx > 1 {
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
                                if scope_idx > 1 {
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
                for prop in &obj.properties {
                    self.process_binding_pattern(&prop.value, &None, decl_kind);
                }
                if let Some(rest) = &obj.rest {
                    self.process_binding_pattern(&rest.argument, &None, decl_kind);
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
                match ident.name.as_str() {
                    "$state" => return BindingKind::State,
                    "$derived" => return BindingKind::Derived,
                    "$props" => return BindingKind::Prop,
                    _ => {}
                }
            } else if let Expression::StaticMemberExpression(member) = &call.callee {
                // Handle $state.raw() and $derived.by()
                if let Expression::Identifier(obj) = &member.object {
                    match (obj.name.as_str(), member.property.name.as_str()) {
                        ("$state", "raw") => return BindingKind::RawState,
                        ("$derived", "by") => return BindingKind::Derived,
                        _ => {}
                    }
                }
            }
        }
        BindingKind::Normal
    }

    /// Process an import declaration.
    fn process_import_declaration(&mut self, import_decl: &oxc_ast::ast::ImportDeclaration) {
        if let Some(specifiers) = &import_decl.specifiers {
            for specifier in specifiers {
                let name = match specifier {
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) => {
                        spec.local.name.to_string()
                    }
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(spec) => {
                        spec.local.name.to_string()
                    }
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(spec) => {
                        spec.local.name.to_string()
                    }
                };
                self.declare_binding(name, BindingKind::Normal, DeclarationKind::Import);
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
                // This is necessary because each component instance should have
                // its own scope for snippets. For example, two <Child> instances
                // can each have a {#snippet children()} without conflicting.
                let old_scope = self.push_scope();
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
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            // Handle special Svelte elements that have attributes and fragments
            TemplateNode::SvelteBody(elem)
            | TemplateNode::SvelteDocument(elem)
            | TemplateNode::SvelteFragment(elem)
            | TemplateNode::SvelteHead(elem)
            | TemplateNode::SvelteOptions(elem)
            | TemplateNode::SvelteWindow(elem) => {
                self.process_attributes(&elem.attributes);
                self.visit_fragment(&elem.fragment);
            }
            TemplateNode::SvelteSelf(elem) => {
                self.process_attributes(&elem.attributes);
                // Create a new scope for component children (same as Component)
                let old_scope = self.push_scope();
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::SvelteComponent(elem) => {
                self.process_attributes(&elem.attributes);
                // Create a new scope for component children (same as Component)
                let old_scope = self.push_scope();
                self.visit_fragment(&elem.fragment);
                self.pop_scope(old_scope);
            }
            TemplateNode::SvelteElement(elem) => {
                self.process_attributes(&elem.attributes);
                self.visit_fragment(&elem.fragment);
            }
            TemplateNode::TitleElement(elem) => {
                self.process_attributes(&elem.attributes);
                self.visit_fragment(&elem.fragment);
            }
            TemplateNode::SlotElement(elem) => {
                self.process_attributes(&elem.attributes);
                self.visit_fragment(&elem.fragment);
            }
            // Other nodes don't create scopes
            _ => {}
        }
    }

    /// Visit a regular element.
    fn visit_element(&mut self, element: &RegularElement) {
        // Process expressions in attributes (for tracking updates)
        self.process_attributes(&element.attributes);

        // Create a new scope for element children (matching the official Svelte compiler
        // where each Fragment creates a child scope). This allows snippets inside elements
        // to have the same name as snippets at the parent level.
        let old_scope = self.push_scope();
        self.visit_fragment(&element.fragment);
        self.pop_scope(old_scope);
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
        // Extract the source range and parse the expression
        if let Some(start) = expr.start()
            && let Some(end) = expr.end()
        {
            let start = start as usize;
            let end = end as usize;
            if end <= self.source.len() && start < end {
                let expr_source = &self.source[start..end];
                self.parse_and_track_expression(expr_source);
            }
        }
    }

    /// Process a bind expression - the target is marked as reassigned.
    fn process_template_expression_for_bind(&mut self, expr: &crate::ast::js::Expression) {
        // For bind directives, get the identifier name and mark as reassigned
        if let Some(serde_json::Value::String(name)) = expr.as_json().get("name") {
            self.updates.push(Update {
                name: name.clone(),
                is_direct_assignment: true,
                scope_idx: self.current_scope,
            });
        }
    }

    /// Parse an expression string and track updates within it.
    fn parse_and_track_expression(&mut self, expr_source: &str) {
        // Wrap in a statement to make it valid JavaScript
        let code = format!("({})", expr_source);

        let allocator = Allocator::default();
        let ret = OxcParser::new(&allocator, &code, SourceType::default()).parse();

        if ret.errors.is_empty() && !ret.program.body.is_empty() {
            // Get the expression from the parsed program
            if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                ret.program.body.first()
            {
                // Strip the outer parentheses
                if let oxc_ast::ast::Expression::ParenthesizedExpression(paren) =
                    &expr_stmt.expression
                {
                    self.track_expression_updates(&paren.expression);
                } else {
                    self.track_expression_updates(&expr_stmt.expression);
                }
            }
        }
    }

    /// Visit an each block.
    fn visit_each_block(&mut self, block: &EachBlock) {
        // Each blocks create a new scope for the item and index
        let old_scope = self.push_scope();

        // Declare the item binding(s) - handle destructuring patterns
        if let Some(context) = block.context.as_ref() {
            let context_json = context.as_json();
            self.declare_bindings_from_pattern(context_json, BindingKind::EachItem);
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

        self.pop_scope(old_scope);
    }

    /// Declare bindings from a pattern (handles destructuring).
    ///
    /// This is used for EachBlock context, AwaitBlock value/error, and SnippetBlock parameters.
    fn declare_bindings_from_pattern(&mut self, pattern: &serde_json::Value, kind: BindingKind) {
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
                    self.declare_binding(name.to_string(), kind, DeclarationKind::Const);
                }
            }
            Some("ObjectPattern") => {
                if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        let prop_type = prop.get("type").and_then(|t| t.as_str());
                        if prop_type == Some("RestElement") {
                            if let Some(argument) = prop.get("argument") {
                                self.declare_bindings_from_pattern(argument, kind);
                            }
                        } else if let Some(value) = prop.get("value") {
                            self.declare_bindings_from_pattern(value, kind);
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            self.declare_bindings_from_pattern(elem, kind);
                        }
                    }
                }
            }
            Some("RestElement") => {
                if let Some(argument) = pattern.get("argument") {
                    self.declare_bindings_from_pattern(argument, kind);
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = pattern.get("left") {
                    self.declare_bindings_from_pattern(left, kind);
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

            // Declare the then value binding(s) - handle destructuring patterns
            if let Some(ref value) = block.value {
                self.declare_bindings_from_pattern(value.as_json(), BindingKind::AwaitThen);
            }

            self.visit_fragment(then);
            self.pop_scope(old_scope);
        }

        // Catch creates a scope for the error
        if let Some(ref catch) = block.catch {
            let old_scope = self.push_scope();

            // Declare the error binding(s) - handle destructuring patterns
            if let Some(ref error) = block.error {
                self.declare_bindings_from_pattern(error.as_json(), BindingKind::AwaitCatch);
            }

            self.visit_fragment(catch);
            self.pop_scope(old_scope);
        }
    }

    /// Visit a key block.
    fn visit_key_block(&mut self, block: &KeyBlock) {
        // Key blocks don't create a new scope
        self.visit_fragment(&block.fragment);
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

        // Declare snippet parameters - handle destructuring patterns
        for param in &block.parameters {
            self.declare_bindings_from_pattern(param.as_json(), BindingKind::SnippetParam);
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
            }
        }
        // Check if it's a VariableDeclaration
        else if let Some(declarations) = value.get("declarations").and_then(|d| d.as_array())
            && let Some(declaration) = declarations.first()
        {
            // Extract identifier names from the pattern
            if let Some(id) = declaration.get("id") {
                self.process_binding_pattern_from_json(id);
            }
        }
    }

    /// Process a binding pattern from a JSON value.
    fn process_binding_pattern_from_json(&mut self, pattern: &serde_json::Value) {
        match pattern.get("type").and_then(|t| t.as_str()) {
            Some("Identifier") => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    self.declare_binding(
                        name.to_string(),
                        BindingKind::Normal,
                        DeclarationKind::Const,
                    );
                }
            }
            Some("ObjectPattern") => {
                if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        if let Some(value) = prop.get("value") {
                            self.process_binding_pattern_from_json(value);
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
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

/// Build scopes for a component AST.
///
/// Returns a tuple of (ScopeRoot, Vec<AnalysisError>) where the errors
/// are validation errors collected during scope building.
pub fn build_scopes(
    ast: &Root,
    source: &str,
    runes_mode: bool,
) -> (
    ScopeRoot,
    Vec<crate::compiler::phases::phase2_analyze::AnalysisError>,
) {
    let builder = ScopeBuilder::new(source, runes_mode);
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
