//! Scope builder for the analyzer.
//!
//! Walks the AST and creates a scope tree with bindings.

use super::scope::{Binding, BindingKind, DeclarationKind, Scope, ScopeRoot};
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
}

impl<'a> ScopeBuilder<'a> {
    /// Create a new scope builder.
    pub fn new(source: &'a str) -> Self {
        Self {
            scopes: vec![Scope::new(None)],
            bindings: Vec::new(),
            current_scope: 0,
            source,
        }
    }

    /// Build scopes from the AST.
    pub fn build(mut self, ast: &Root) -> ScopeRoot {
        // Visit instance script
        if let Some(ref script) = ast.instance {
            self.visit_script(script);
        }

        // Visit module script
        if let Some(ref script) = ast.module {
            self.visit_script(script);
        }

        // Visit template
        self.visit_fragment(&ast.fragment);

        // Collect all declarations from all scopes into the root scope
        // This allows name lookup from any scope level to find bindings
        // Note: This is a temporary solution until proper scope chain lookup is implemented
        for i in 1..self.scopes.len() {
            let declarations: Vec<(String, usize)> = self.scopes[i]
                .declarations
                .iter()
                .map(|(k, v)| (k.clone(), *v))
                .collect();
            for (name, binding_idx) in declarations {
                // Only add if not already in root scope (child scope takes precedence)
                self.scopes[0]
                    .declarations
                    .entry(name)
                    .or_insert(binding_idx);
            }
        }

        // Return the root scope
        let root_scope = self.scopes.remove(0);
        ScopeRoot {
            bindings: self.bindings,
            scope: root_scope,
        }
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
        let idx = self.bindings.len();
        let binding = Binding::with_declaration_kind(
            name.clone(),
            kind,
            declaration_kind,
            self.current_scope,
        );
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
                    self.declare_binding(name, BindingKind::Normal, DeclarationKind::Const);
                }
            }
            Statement::ClassDeclaration(class_decl) => {
                if let Some(id) = &class_decl.id {
                    let name = id.name.to_string();
                    self.declare_binding(name, BindingKind::Normal, DeclarationKind::Const);
                }
            }
            Statement::ExportNamedDeclaration(export_decl) => {
                if let Some(ref declaration) = export_decl.declaration {
                    self.process_declaration(declaration);
                }
            }
            Statement::ExportDefaultDeclaration(_) => {
                // Export default doesn't create a named binding in the module scope
            }
            _ => {}
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
                    self.declare_binding(name, BindingKind::Normal, DeclarationKind::Const);
                }
            }
            Declaration::ClassDeclaration(class_decl) => {
                if let Some(id) = &class_decl.id {
                    let name = id.name.to_string();
                    self.declare_binding(name, BindingKind::Normal, DeclarationKind::Const);
                }
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
                self.declare_binding(name, kind, decl_kind);
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
                // Handle $state.raw()
                if let Expression::Identifier(obj) = &member.object
                    && obj.name.as_str() == "$state"
                    && member.property.name.as_str() == "raw"
                {
                    return BindingKind::RawState;
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
                // Visit component children
                self.visit_fragment(&component.fragment);
            }
            TemplateNode::ConstTag(tag) => self.visit_const_tag(tag),
            // Other nodes don't create scopes
            _ => {}
        }
    }

    /// Visit a regular element.
    fn visit_element(&mut self, element: &RegularElement) {
        // Elements don't create new scopes, but we visit their children
        self.visit_fragment(&element.fragment);
    }

    /// Visit an each block.
    fn visit_each_block(&mut self, block: &EachBlock) {
        // Each blocks create a new scope for the item and index
        let old_scope = self.push_scope();

        // Declare the item binding
        if let Some(context) = block.context.as_ref()
            && let Some(name) = context.as_json().get("name").and_then(|n| n.as_str())
        {
            self.declare_binding(
                name.to_string(),
                BindingKind::EachItem,
                DeclarationKind::Const,
            );
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

    /// Visit an if block.
    fn visit_if_block(&mut self, block: &IfBlock) {
        // Visit the consequent
        self.visit_fragment(&block.consequent);

        // Visit alternate if present
        if let Some(ref alternate) = block.alternate {
            self.visit_fragment(alternate);
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

            // Declare the then value binding
            if let Some(ref value) = block.value
                && let Some(name) = value.as_json().get("name").and_then(|n| n.as_str())
            {
                self.declare_binding(
                    name.to_string(),
                    BindingKind::AwaitThen,
                    DeclarationKind::Const,
                );
            }

            self.visit_fragment(then);
            self.pop_scope(old_scope);
        }

        // Catch creates a scope for the error
        if let Some(ref catch) = block.catch {
            let old_scope = self.push_scope();

            // Declare the error binding
            if let Some(ref error) = block.error
                && let Some(name) = error.as_json().get("name").and_then(|n| n.as_str())
            {
                self.declare_binding(
                    name.to_string(),
                    BindingKind::AwaitCatch,
                    DeclarationKind::Const,
                );
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
        let old_scope = self.push_scope();

        // Declare snippet parameters
        for param in &block.parameters {
            if let Some(name) = param.as_json().get("name").and_then(|n| n.as_str()) {
                self.declare_binding(
                    name.to_string(),
                    BindingKind::SnippetParam,
                    DeclarationKind::Param,
                );
            }
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
pub fn build_scopes(ast: &Root, source: &str) -> ScopeRoot {
    let builder = ScopeBuilder::new(source);
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
