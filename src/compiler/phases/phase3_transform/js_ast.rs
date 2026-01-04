//! JavaScript AST building utilities using oxc.
//!
//! This module provides helpers for parsing JavaScript snippets
//! and generating code from them.

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_codegen::Codegen;
use oxc_parser::Parser;
use oxc_span::SourceType;

/// Parse JavaScript code and return the generated code (normalized).
pub fn parse_and_generate(source: &str) -> Result<String, String> {
    let allocator = Allocator::default();
    let source_type = SourceType::mjs();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        return Err(format!("Parse errors: {:?}", result.errors));
    }

    Ok(Codegen::new().build(&result.program).code)
}

/// Generate JavaScript code from an oxc Program AST.
pub fn generate_code(program: &Program<'_>) -> String {
    Codegen::new().build(program).code
}

/// A builder for constructing JavaScript programs as strings,
/// then parsing and generating normalized code.
pub struct JsCodeBuilder {
    imports: Vec<String>,
    statements: Vec<String>,
}

impl JsCodeBuilder {
    /// Create a new JavaScript code builder.
    pub fn new() -> Self {
        Self {
            imports: Vec::new(),
            statements: Vec::new(),
        }
    }

    /// Add a side-effect import.
    pub fn import_side_effect(&mut self, source: &str) -> &mut Self {
        self.imports.push(format!("import '{}';", source));
        self
    }

    /// Add a namespace import (import * as name from source).
    pub fn import_namespace(&mut self, name: &str, source: &str) -> &mut Self {
        self.imports
            .push(format!("import * as {} from '{}';", name, source));
        self
    }

    /// Add a default import.
    pub fn import_default(&mut self, name: &str, source: &str) -> &mut Self {
        self.imports
            .push(format!("import {} from '{}';", name, source));
        self
    }

    /// Add a raw statement.
    pub fn statement(&mut self, stmt: &str) -> &mut Self {
        self.statements.push(stmt.to_string());
        self
    }

    /// Add a const declaration.
    pub fn const_decl(&mut self, name: &str, init: &str) -> &mut Self {
        self.statements.push(format!("const {} = {};", name, init));
        self
    }

    /// Add a let declaration.
    pub fn let_decl(&mut self, name: &str, init: Option<&str>) -> &mut Self {
        if let Some(init_val) = init {
            self.statements
                .push(format!("let {} = {};", name, init_val));
        } else {
            self.statements.push(format!("let {};", name));
        }
        self
    }

    /// Add an export default function.
    pub fn export_default_function(
        &mut self,
        name: &str,
        params: &[&str],
        body: &str,
    ) -> &mut Self {
        let params_str = params.join(", ");
        self.statements.push(format!(
            "export default function {}({}) {{\n{}\n}}",
            name, params_str, body
        ));
        self
    }

    /// Build and generate the final code.
    pub fn build(&self) -> Result<String, String> {
        let mut source = String::new();

        for import in &self.imports {
            source.push_str(import);
            source.push('\n');
        }

        if !self.imports.is_empty() && !self.statements.is_empty() {
            source.push('\n');
        }

        for stmt in &self.statements {
            source.push_str(stmt);
            source.push('\n');
        }

        parse_and_generate(&source)
    }

    /// Get the raw source code without parsing.
    pub fn to_raw_source(&self) -> String {
        let mut source = String::new();

        for import in &self.imports {
            source.push_str(import);
            source.push('\n');
        }

        if !self.imports.is_empty() && !self.statements.is_empty() {
            source.push('\n');
        }

        for stmt in &self.statements {
            source.push_str(stmt);
            source.push('\n');
        }

        source
    }
}

impl Default for JsCodeBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_and_generate() {
        let source = r#"
            import * as $ from 'svelte/internal/server';
            const name = 'world';
            export default function Test($$renderer) {
                $$renderer.push(`hello`);
            }
        "#;

        let result = parse_and_generate(source).unwrap();
        println!("Generated code:\n{}", result);

        assert!(result.contains("import * as $ from \"svelte/internal/server\""));
        assert!(result.contains("const name = \"world\""));
        assert!(result.contains("export default function Test"));
    }

    #[test]
    fn test_js_code_builder() {
        let mut builder = JsCodeBuilder::new();
        builder
            .import_namespace("$", "svelte/internal/server")
            .const_decl("name", "'world'")
            .export_default_function(
                "Test",
                &["$$renderer"],
                "\t$$renderer.push(`hello ${name}`);",
            );

        let result = builder.build().unwrap();
        println!("Generated code:\n{}", result);

        assert!(result.contains("import * as $ from \"svelte/internal/server\""));
        assert!(result.contains("const name = \"world\""));
        assert!(result.contains("export default function Test"));
        assert!(result.contains("$$renderer.push"));
    }
}
