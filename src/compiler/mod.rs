//! Svelte compiler module.
//!
//! This module handles the compilation of Svelte components into JavaScript.

use serde::{Deserialize, Serialize};

/// Compilation target mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GenerateMode {
    /// Generate client-side code (default).
    #[default]
    Client,
    /// Generate server-side code for SSR.
    Server,
}

/// Options for the Svelte compiler.
#[derive(Debug, Clone, Default)]
pub struct CompileOptions {
    /// The target generation mode (client or server).
    pub generate: GenerateMode,
    /// The name of the component (derived from filename if not provided).
    pub name: Option<String>,
    /// The filename of the component being compiled.
    pub filename: Option<String>,
    /// Enable development mode (additional runtime checks).
    pub dev: bool,
    /// Enable HMR (Hot Module Replacement) support.
    pub hmr: bool,
    /// CSS handling mode.
    pub css: CssMode,
}

/// CSS handling mode for the compiler.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CssMode {
    /// Inject CSS into the component.
    #[default]
    Injected,
    /// Extract CSS to a separate file.
    External,
    /// Don't process CSS at all.
    None,
}

/// Result of compiling a Svelte component.
#[derive(Debug, Clone)]
pub struct CompileResult {
    /// The generated JavaScript code.
    pub js: CompileOutput,
    /// The generated CSS (if any).
    pub css: Option<CompileOutput>,
    /// Compiler warnings.
    pub warnings: Vec<Warning>,
}

/// Output code with optional source map.
#[derive(Debug, Clone)]
pub struct CompileOutput {
    /// The generated code.
    pub code: String,
    /// Optional source map.
    pub map: Option<String>,
}

/// Compiler warning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warning {
    /// Warning code.
    pub code: String,
    /// Warning message.
    pub message: String,
    /// Start position in the source.
    pub start: Option<Position>,
    /// End position in the source.
    pub end: Option<Position>,
}

/// Position in the source code.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    /// Line number (1-indexed).
    pub line: usize,
    /// Column number (0-indexed).
    pub column: usize,
    /// Character offset.
    pub character: usize,
}

/// Compile a Svelte component.
///
/// This function takes Svelte source code and compiles it into JavaScript.
///
/// # Arguments
///
/// * `source` - The Svelte component source code
/// * `options` - Compilation options
///
/// # Returns
///
/// Returns a `CompileResult` containing the generated JavaScript and CSS.
pub fn compile(source: &str, options: CompileOptions) -> Result<CompileResult, CompileError> {
    // Parse the source first
    let parse_options = crate::ParseOptions {
        modern: true,
        loose: false,
        filename: options.filename.clone(),
    };

    let ast = crate::parse(source, parse_options)?;

    // Convert AST to JSON Value for code generation
    let ast_json = serde_json::to_value(&ast)
        .map_err(|e| CompileError::CodeGen(format!("Failed to serialize AST: {}", e)))?;

    // For now, generate a placeholder output
    // TODO: Implement actual code generation
    let js_code = generate_js(&ast_json, &options)?;

    Ok(CompileResult {
        js: CompileOutput {
            code: js_code,
            map: None,
        },
        css: None,
        warnings: Vec::new(),
    })
}

/// Error type for compilation failures.
#[derive(Debug)]
pub enum CompileError {
    /// Parse error.
    Parse(crate::error::ParseError),
    /// Code generation error.
    CodeGen(String),
}

impl From<crate::error::ParseError> for CompileError {
    fn from(err: crate::error::ParseError) -> Self {
        CompileError::Parse(err)
    }
}

impl std::fmt::Display for CompileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CompileError::Parse(e) => write!(f, "Parse error: {:?}", e),
            CompileError::CodeGen(msg) => write!(f, "Code generation error: {}", msg),
        }
    }
}

impl std::error::Error for CompileError {}

/// Generate JavaScript code from the AST.
fn generate_js(ast: &serde_json::Value, options: &CompileOptions) -> Result<String, CompileError> {
    let component_name = derive_component_name(options);

    match options.generate {
        GenerateMode::Client => generate_client_js(ast, &component_name, options),
        GenerateMode::Server => generate_server_js(ast, &component_name, options),
    }
}

/// Derive component name from options or filename.
fn derive_component_name(options: &CompileOptions) -> String {
    if let Some(name) = &options.name {
        return name.clone();
    }

    if let Some(filename) = &options.filename {
        // Try to get the directory name (for fixtures like "hello-world/index.svelte")
        let path = std::path::Path::new(filename);

        // If the file is named "index.svelte", use the parent directory name
        let stem = if path.file_stem().and_then(|s| s.to_str()) == Some("index") {
            path.parent()
                .and_then(|p| p.file_name())
                .and_then(|s| s.to_str())
                .unwrap_or("Component")
        } else {
            path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("Component")
        };

        return to_component_name(stem);
    }

    "Component".to_string()
}

/// Convert a string to component name format (First_word_lowercase).
/// E.g., "hello-world" -> "Hello_world"
fn to_component_name(s: &str) -> String {
    let parts: Vec<&str> = s
        .split(['-', '_', '.'])
        .filter(|part| !part.is_empty())
        .collect();

    if parts.is_empty() {
        return "Component".to_string();
    }

    // First part is capitalized, rest are lowercase
    let mut result = String::new();
    for (i, part) in parts.iter().enumerate() {
        if i > 0 {
            result.push('_');
        }

        if i == 0 {
            // Capitalize first part
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.extend(first.to_uppercase());
                result.push_str(chars.as_str());
            }
        } else {
            // Keep rest lowercase
            result.push_str(part);
        }
    }

    result
}

/// Generate client-side JavaScript.
fn generate_client_js(
    ast: &serde_json::Value,
    component_name: &str,
    _options: &CompileOptions,
) -> Result<String, CompileError> {
    // TODO: Implement actual client-side code generation
    // For now, generate a minimal placeholder

    let fragment = ast
        .get("fragment")
        .ok_or_else(|| CompileError::CodeGen("Missing fragment in AST".to_string()))?;

    let html = extract_html_from_fragment(fragment);
    let root_var_name = get_root_element_name(fragment);

    Ok(format!(
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`{html}`);

export default function {component_name}($$anchor) {{
	var {root_var_name} = root();

	$.append($$anchor, {root_var_name});
}}"#,
        html = html,
        component_name = component_name,
        root_var_name = root_var_name
    ))
}

/// Get the root element name for variable naming.
fn get_root_element_name(fragment: &serde_json::Value) -> String {
    let nodes = match fragment.get("nodes") {
        Some(serde_json::Value::Array(nodes)) => nodes,
        _ => return "node".to_string(),
    };

    // Find the first element node
    for node in nodes {
        let node_type = node.get("type").and_then(|t| t.as_str()).unwrap_or("");
        if node_type == "RegularElement" {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                return name.to_string();
            }
        }
    }

    "node".to_string()
}

/// Generate server-side JavaScript.
fn generate_server_js(
    ast: &serde_json::Value,
    component_name: &str,
    _options: &CompileOptions,
) -> Result<String, CompileError> {
    // TODO: Implement actual server-side code generation
    // For now, generate a minimal placeholder

    let fragment = ast
        .get("fragment")
        .ok_or_else(|| CompileError::CodeGen("Missing fragment in AST".to_string()))?;

    let html = extract_html_from_fragment(fragment);

    Ok(format!(
        r#"import * as $ from 'svelte/internal/server';

export default function {component_name}($$renderer) {{
	$$renderer.push(`{html}`);
}}"#,
        html = html,
        component_name = component_name
    ))
}

/// Extract HTML content from a fragment AST node.
fn extract_html_from_fragment(fragment: &serde_json::Value) -> String {
    let nodes = match fragment.get("nodes") {
        Some(serde_json::Value::Array(nodes)) => nodes,
        _ => return String::new(),
    };

    nodes
        .iter()
        .map(extract_html_from_node)
        .collect::<Vec<_>>()
        .join("")
}

/// Extract HTML from an AST node.
fn extract_html_from_node(node: &serde_json::Value) -> String {
    let node_type = node.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match node_type {
        "Text" => node
            .get("data")
            .and_then(|d| d.as_str())
            .unwrap_or("")
            .to_string(),
        "RegularElement" => {
            let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("div");
            let children = node
                .get("fragment")
                .map(extract_html_from_fragment)
                .unwrap_or_default();

            let attrs = extract_attributes(node);

            if children.is_empty() && is_void_element(name) {
                format!("<{}{}>", name, attrs)
            } else {
                format!("<{}{}>{}</{}>", name, attrs, children, name)
            }
        }
        _ => String::new(),
    }
}

/// Extract attributes from an element node.
fn extract_attributes(node: &serde_json::Value) -> String {
    let attributes = match node.get("attributes") {
        Some(serde_json::Value::Array(attrs)) => attrs,
        _ => return String::new(),
    };

    attributes
        .iter()
        .filter_map(|attr| {
            let attr_type = attr.get("type").and_then(|t| t.as_str())?;
            if attr_type != "Attribute" {
                return None;
            }

            let name = attr.get("name").and_then(|n| n.as_str())?;

            // Check for value
            if let Some(value) = attr.get("value") {
                if value.is_boolean() && value.as_bool() == Some(true) {
                    return Some(format!(" {}", name));
                }
                // TODO: Handle more value types
            }

            Some(format!(" {}", name))
        })
        .collect()
}

/// Check if an element is a void element (self-closing).
fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_component_name() {
        assert_eq!(to_component_name("hello-world"), "Hello_world");
        assert_eq!(to_component_name("my_component"), "My_component");
        assert_eq!(to_component_name("index"), "Index");
        assert_eq!(
            to_component_name("async-each-hoisting"),
            "Async_each_hoisting"
        );
    }

    #[test]
    fn test_compile_simple() {
        let source = "<h1>Hello World</h1>";
        let options = CompileOptions::default();
        let result = compile(source, options);
        assert!(result.is_ok());
    }
}
