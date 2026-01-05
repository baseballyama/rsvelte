//! Scope builder for the analyzer.
//!
//! Walks the AST and creates a scope tree with bindings.

use super::scope::{Binding, BindingKind, DeclarationKind, Scope, ScopeRoot};
use crate::ast::template::{
    AwaitBlock, EachBlock, Fragment, IfBlock, KeyBlock, RegularElement, Root, Script, SnippetBlock,
    TemplateNode,
};

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

    /// Visit a script block and extract variable declarations.
    fn visit_script(&mut self, script: &Script) {
        let start = script.content.start().unwrap_or(0) as usize;
        let end = script.content.end().unwrap_or(0) as usize;

        if end <= start || end > self.source.len() {
            return;
        }

        let content = &self.source[start..end];

        // Parse variable declarations from script content
        // This is a simplified parser - in a full implementation, we would use oxc to parse the JS
        self.parse_declarations(content);
    }

    /// Parse variable declarations from script content.
    fn parse_declarations(&mut self, content: &str) {
        // Split by lines and look for declaration patterns
        for line in content.lines() {
            let trimmed = line.trim();

            // Skip empty lines and comments
            if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with("/*") {
                continue;
            }

            // Handle let/const/var declarations
            if let Some(decl) = self.parse_variable_declaration(trimmed) {
                let (name, kind, decl_kind) = decl;
                self.declare_binding(name, kind, decl_kind);
            }
        }
    }

    /// Parse a variable declaration line.
    /// Returns (name, BindingKind, DeclarationKind) if found.
    fn parse_variable_declaration(
        &self,
        line: &str,
    ) -> Option<(String, BindingKind, DeclarationKind)> {
        // Handle let declarations
        if let Some(rest) = line.strip_prefix("let ") {
            return self.parse_declaration_rhs(rest, DeclarationKind::Let);
        }

        // Handle const declarations
        if let Some(rest) = line.strip_prefix("const ") {
            return self.parse_declaration_rhs(rest, DeclarationKind::Const);
        }

        // Handle var declarations
        if let Some(rest) = line.strip_prefix("var ") {
            return self.parse_declaration_rhs(rest, DeclarationKind::Var);
        }

        None
    }

    /// Parse the right-hand side of a declaration.
    fn parse_declaration_rhs(
        &self,
        rhs: &str,
        decl_kind: DeclarationKind,
    ) -> Option<(String, BindingKind, DeclarationKind)> {
        // Find the variable name (before = or destructuring)
        let rhs = rhs.trim();

        // Handle destructuring patterns
        if rhs.starts_with('{') || rhs.starts_with('[') {
            // Skip destructuring for now - would need proper parsing
            return None;
        }

        // Find the name (ends at =, ;, whitespace, or end)
        let name_end = rhs
            .find(|c: char| c == '=' || c == ';' || c.is_whitespace())
            .unwrap_or(rhs.len());

        let name = rhs[..name_end].trim().to_string();
        if name.is_empty() {
            return None;
        }

        // Determine binding kind based on the value
        let kind = if let Some(eq_pos) = rhs.find('=') {
            let value = rhs[eq_pos + 1..].trim();
            self.detect_binding_kind(value)
        } else {
            BindingKind::Normal
        };

        Some((name, kind, decl_kind))
    }

    /// Detect the binding kind based on the initializer value.
    fn detect_binding_kind(&self, value: &str) -> BindingKind {
        if value.starts_with("$state(") {
            BindingKind::State
        } else if value.starts_with("$state.raw(") {
            BindingKind::RawState
        } else if value.starts_with("$derived(") {
            BindingKind::Derived
        } else if value.starts_with("$props(") {
            BindingKind::Prop
        } else {
            BindingKind::Normal
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
        if let Some(context) = block.context.as_ref() {
            if let Some(name) = context.as_json().get("name").and_then(|n| n.as_str()) {
                self.declare_binding(
                    name.to_string(),
                    BindingKind::EachItem,
                    DeclarationKind::Const,
                );
            }
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
            if let Some(ref value) = block.value {
                if let Some(name) = value.as_json().get("name").and_then(|n| n.as_str()) {
                    self.declare_binding(
                        name.to_string(),
                        BindingKind::AwaitThen,
                        DeclarationKind::Const,
                    );
                }
            }

            self.visit_fragment(then);
            self.pop_scope(old_scope);
        }

        // Catch creates a scope for the error
        if let Some(ref catch) = block.catch {
            let old_scope = self.push_scope();

            // Declare the error binding
            if let Some(ref error) = block.error {
                if let Some(name) = error.as_json().get("name").and_then(|n| n.as_str()) {
                    self.declare_binding(
                        name.to_string(),
                        BindingKind::AwaitCatch,
                        DeclarationKind::Const,
                    );
                }
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
}

/// Build scopes for a component AST.
pub fn build_scopes(ast: &Root, source: &str) -> ScopeRoot {
    let builder = ScopeBuilder::new(source);
    builder.build(ast)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_binding_kind() {
        let builder = ScopeBuilder::new("");

        assert_eq!(builder.detect_binding_kind("$state(0)"), BindingKind::State);
        assert_eq!(
            builder.detect_binding_kind("$state.raw({})"),
            BindingKind::RawState
        );
        assert_eq!(
            builder.detect_binding_kind("$derived(count * 2)"),
            BindingKind::Derived
        );
        assert_eq!(builder.detect_binding_kind("$props()"), BindingKind::Prop);
        assert_eq!(builder.detect_binding_kind("42"), BindingKind::Normal);
    }
}
