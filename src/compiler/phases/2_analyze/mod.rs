//! Phase 2: Analyze
//!
//! Semantic analysis of the parsed AST.
//!
//! This phase is responsible for:
//! - Creating scopes and tracking variable bindings
//! - Validating identifiers and imports
//! - Analyzing reactive declarations and dependencies
//! - Checking directives and their usage
//! - Pruning unused CSS
//! - Generating scope maps for code generation
//!
//! The analyzer produces a `ComponentAnalysis` structure that contains
//! all the semantic information needed for code generation.
//!
//! Corresponds to Svelte's `2-analyze/` directory.

pub mod binding_properties;
pub mod blockers;
pub mod control_flow;
pub mod css;
pub mod errors;
pub mod scope;
mod scope_builder;
mod store_subscriptions;
pub mod types;
pub mod utils;
pub mod visitors;
pub mod warnings;

pub use scope::{
    Binding, BindingKind, BindingReference, BlockerExpression, DeclarationKind, Mutation,
    MutationKind, Scope, ScopeRoot,
};
pub use types::{
    AsyncStatement, AwaitedDeclaration, ComponentAnalysis, CssAnalysis, InstanceBody, JsAnalysis,
    ReactiveStatement, ScriptContent, TemplateAnalysis,
};
pub use visitors::AstType;

use crate::ast::template::Root;
use crate::compiler::CompileOptions;

/// Analyze a parsed Svelte component.
///
/// This is the entry point for Phase 2 of the compiler.
///
/// Corresponds to `analyze_component` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `ast` - The parsed AST from Phase 1
/// * `source` - The original source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `ComponentAnalysis` containing all semantic information.
pub fn analyze_component(
    ast: &mut Root,
    source: &str,
    options: &CompileOptions,
) -> Result<ComponentAnalysis, AnalysisError> {
    let mut analysis = ComponentAnalysis::new(source, options);

    // Extract script content for Phase 3 (avoids re-parsing)
    analysis.extract_scripts(ast);

    // Create scopes for the component
    analysis.create_scopes(ast)?;

    // Detect store subscriptions and create synthetic bindings
    // This must happen after scopes are created but before template analysis
    // Corresponds to Svelte's store subscription logic in 2-analyze/index.js L348-444
    store_subscriptions::detect_store_subscriptions(ast, &mut analysis);

    // Analyze scripts (JavaScript AST)
    if let Some(ref instance) = ast.instance {
        let script_ast = instance.content.as_json();
        let mut context = visitors::VisitorContext::new(&mut analysis);
        visitors::visit_script(script_ast, &mut context)?;
    }

    if let Some(ref module) = ast.module {
        let script_ast = module.content.as_json();
        let mut context = visitors::VisitorContext::new(&mut analysis);
        visitors::visit_script(script_ast, &mut context)?;
    }

    // Analyze the template using visitors
    visitors::analyze_template(ast, &mut analysis)?;

    // Build sibling relationships for CSS analysis
    // This must happen after template analysis builds the DOM structure
    control_flow::build_sibling_relationships(&mut analysis.css.dom_structure, &ast.fragment);

    // Analyze CSS if present
    if let Some(ref stylesheet) = ast.css {
        analysis.analyze_css(stylesheet, options)?;

        // Run CSS analysis and validation
        css::analyze_css(stylesheet, &mut analysis)?;

        // Prune unused selectors
        css::prune_css(stylesheet, &analysis);
    }

    Ok(analysis)
}

/// Analyze a Svelte module (context="module" script).
///
/// Corresponds to `analyze_module` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `source` - The module source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `ModuleAnalysis` containing semantic information.
pub fn analyze_module(
    _source: &str,
    options: &CompileOptions,
) -> Result<ModuleAnalysis, AnalysisError> {
    let analysis = ModuleAnalysis {
        name: options.filename.clone(),
        runes: true,
        immutable: true,
    };

    Ok(analysis)
}

/// Module analysis result.
#[derive(Debug)]
pub struct ModuleAnalysis {
    /// Module name
    pub name: Option<String>,
    /// Whether the module uses runes
    pub runes: bool,
    /// Whether the module uses immutable mode
    pub immutable: bool,
}

/// Error type for analysis failures.
#[derive(Debug)]
pub enum AnalysisError {
    /// Scope-related error
    Scope(String),
    /// Validation error (generic, legacy)
    Validation(String),
    /// CSS analysis error
    Css(String),
    /// Validation error with error code (Svelte-compatible format)
    /// The code is the Svelte error code (e.g., "attribute_duplicate")
    ValidationWithCode { code: String, message: String },
}

impl AnalysisError {
    /// Create a validation error with code
    pub fn validation(code: &str, message: impl Into<String>) -> Self {
        AnalysisError::ValidationWithCode {
            code: code.to_string(),
            message: message.into(),
        }
    }
}

impl std::fmt::Display for AnalysisError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AnalysisError::Scope(msg) => write!(f, "Scope error: {}", msg),
            AnalysisError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AnalysisError::Css(msg) => write!(f, "CSS error: {}", msg),
            AnalysisError::ValidationWithCode { code, message } => {
                write!(f, "{}: {}", code, message)
            }
        }
    }
}

impl std::error::Error for AnalysisError {}

/// Reserved identifiers that cannot be declared.
pub const RESERVED: &[&str] = &["$$props", "$$restProps", "$$slots"];

/// Get the component name from a filename.
///
/// Matches Svelte's `get_component_name()` in `2-analyze/index.js`.
pub fn get_component_name(filename: &str) -> String {
    let parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.last().unwrap_or(&"Component");
    let last_dir = if parts.len() > 1 {
        parts.get(parts.len() - 2).copied()
    } else {
        None
    };

    let mut name = basename.replace(".svelte", "");

    // If name is "index" and there's a parent dir (not "src"), use the parent dir name
    if name == "index"
        && let Some(dir) = last_dir
        && dir != "src"
        && !dir.is_empty()
    {
        name = dir.to_string();
    }

    // Capitalize first letter
    let mut chars = name.chars();
    match chars.next() {
        None => "Component".to_string(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}

/// Order reactive statements ($: statements) based on their dependencies.
///
/// This performs a topological sort of reactive statements to ensure they execute
/// in the correct order. It also detects circular dependencies.
///
/// Corresponds to `order_reactive_statements()` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `unsorted_reactive_declarations` - Unordered map of reactive statements
///
/// # Returns
///
/// Returns an ordered vector of (statement_key, ReactiveStatement) tuples sorted by dependencies.
/// The order is preserved using insertion order.
///
/// # Errors
///
/// Returns an error if a circular dependency is detected.
pub fn order_reactive_statements(
    unsorted_reactive_declarations: rustc_hash::FxHashMap<String, ReactiveStatement>,
) -> Result<Vec<(String, ReactiveStatement)>, AnalysisError> {
    use rustc_hash::{FxHashMap, FxHashSet};

    // Build a lookup map: binding_index -> list of (statement_key, ReactiveStatement)
    let mut lookup: FxHashMap<usize, Vec<(String, ReactiveStatement)>> = FxHashMap::default();

    for (key, declaration) in &unsorted_reactive_declarations {
        for &assignment_idx in &declaration.assignments {
            lookup
                .entry(assignment_idx)
                .or_default()
                .push((key.clone(), declaration.clone()));
        }
    }

    // Build dependency edges for cycle detection
    // Edge: (assignment_binding_index, dependency_binding_index)
    let mut edges: Vec<(usize, usize)> = Vec::new();

    for declaration in unsorted_reactive_declarations.values() {
        for &assignment in &declaration.assignments {
            for &dependency in &declaration.dependencies {
                // Only add edge if dependency is not also an assignment
                // (self-assignments are allowed)
                if !declaration.assignments.contains(&dependency) {
                    edges.push((assignment, dependency));
                }
            }
        }
    }

    // Check for cycles using depth-first search
    if let Some(cycle) = utils::check_graph_for_cycles(&edges) {
        // The cycle contains binding indices
        // Format them as "idx1 → idx2 → idx3 → idx1"
        let cycle_str = cycle
            .iter()
            .map(|idx| idx.to_string())
            .collect::<Vec<_>>()
            .join(" → ");
        return Err(errors::reactive_declaration_cycle(&cycle_str));
    }

    // Build the ordered list using dependency ordering
    let mut reactive_declarations: Vec<(String, ReactiveStatement)> = Vec::new();
    let mut added_declarations: FxHashSet<String> = FxHashSet::default();

    // Recursive function to add a declaration and its dependencies
    fn add_declaration(
        key: &str,
        declaration: &ReactiveStatement,
        reactive_declarations: &mut Vec<(String, ReactiveStatement)>,
        added_declarations: &mut FxHashSet<String>,
        lookup: &FxHashMap<usize, Vec<(String, ReactiveStatement)>>,
    ) {
        // If already added, skip
        if added_declarations.contains(key) {
            return;
        }

        // First, add all dependencies (that are not also assignments in this declaration)
        for &dependency_idx in &declaration.dependencies {
            if declaration.assignments.contains(&dependency_idx) {
                continue;
            }

            // Find all statements that assign to this dependency and add them first
            if let Some(earlier_statements) = lookup.get(&dependency_idx) {
                for (earlier_key, earlier_decl) in earlier_statements {
                    add_declaration(
                        earlier_key,
                        earlier_decl,
                        reactive_declarations,
                        added_declarations,
                        lookup,
                    );
                }
            }
        }

        // Now add this declaration
        reactive_declarations.push((key.to_string(), declaration.clone()));
        added_declarations.insert(key.to_string());
    }

    // Add all declarations in dependency order
    for (key, declaration) in &unsorted_reactive_declarations {
        add_declaration(
            key,
            declaration,
            &mut reactive_declarations,
            &mut added_declarations,
            &lookup,
        );
    }

    Ok(reactive_declarations)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rustc_hash::{FxHashMap, FxHashSet};

    #[test]
    fn test_order_reactive_statements_simple() {
        // Test case: $: b = a + 1; $: a = 1;
        // Expected order: a first, then b
        let mut statements = FxHashMap::default();

        // Statement 1: assigns to binding 1 (b), depends on binding 0 (a)
        statements.insert(
            "stmt_1".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([1usize]),
                dependencies: vec![0],
            },
        );

        // Statement 2: assigns to binding 0 (a), no dependencies
        statements.insert(
            "stmt_2".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![],
            },
        );

        let ordered = order_reactive_statements(statements).unwrap();
        assert_eq!(ordered.len(), 2);

        // stmt_2 (a) should come before stmt_1 (b)
        assert_eq!(ordered[0].0, "stmt_2");
        assert_eq!(ordered[1].0, "stmt_1");
    }

    #[test]
    fn test_order_reactive_statements_chain() {
        // Test case: $: c = b + 1; $: b = a + 1; $: a = 1;
        // Expected order: a, b, c
        let mut statements = FxHashMap::default();

        statements.insert(
            "stmt_c".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([2usize]),
                dependencies: vec![1],
            },
        );

        statements.insert(
            "stmt_b".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([1usize]),
                dependencies: vec![0],
            },
        );

        statements.insert(
            "stmt_a".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![],
            },
        );

        let ordered = order_reactive_statements(statements).unwrap();
        assert_eq!(ordered.len(), 3);

        assert_eq!(ordered[0].0, "stmt_a");
        assert_eq!(ordered[1].0, "stmt_b");
        assert_eq!(ordered[2].0, "stmt_c");
    }

    #[test]
    fn test_order_reactive_statements_cycle() {
        // Test case: $: a = b + 1; $: b = a + 1;
        // This creates a circular dependency
        let mut statements = FxHashMap::default();

        statements.insert(
            "stmt_a".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![1],
            },
        );

        statements.insert(
            "stmt_b".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([1usize]),
                dependencies: vec![0],
            },
        );

        let result = order_reactive_statements(statements);
        assert!(result.is_err());
    }

    #[test]
    fn test_order_reactive_statements_self_assignment() {
        // Test case: $: a = a + 1;
        // Self-assignment should not create a cycle
        let mut statements = FxHashMap::default();

        statements.insert(
            "stmt_a".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![0],
            },
        );

        let ordered = order_reactive_statements(statements).unwrap();
        assert_eq!(ordered.len(), 1);
        assert_eq!(ordered[0].0, "stmt_a");
    }
}
