//! Server-specific types for code generation.
//!
//! This module contains types used during server-side code generation (SSR).
//!
//! Corresponds to `ServerTransformState` and `ComponentServerTransformState` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/types.d.ts`

use super::super::types::TransformState;
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use rustc_hash::FxHashMap;

/// Base server-side transformation state.
///
/// This type mirrors the `ServerTransformState` interface from the official Svelte compiler.
/// It extends `TransformState` with server-specific transformation state.
///
/// Corresponds to `ServerTransformState` in `server/types.d.ts`.
#[derive(Debug)]
pub struct ServerTransformState<'a> {
    /// Base transformation state
    pub base: &'a TransformState<'a>,

    /// The $: calls, which will be ordered in the end
    ///
    /// Maps the original labeled statement to its transformed output.
    /// These are reactive statements that need to be topologically sorted
    /// based on their dependencies.
    pub legacy_reactive_statements: FxHashMap<JsLabeledStatement, JsStatement>,
}

impl<'a> ServerTransformState<'a> {
    /// Create a new server transform state.
    pub fn new(base: &'a TransformState<'a>) -> Self {
        Self {
            base,
            legacy_reactive_statements: FxHashMap::default(),
        }
    }
}

/// Component-level server-side transformation state.
///
/// This type extends `ServerTransformState` with component-specific state needed during
/// server-side code generation. It includes all the accumulated statements and metadata
/// that will be assembled into the final SSR output.
///
/// Corresponds to `ComponentServerTransformState` in `server/types.d.ts`.
#[derive(Debug)]
pub struct ComponentServerTransformState<'a> {
    /// Analysis results from phase 2
    pub analysis: &'a ComponentAnalysis,

    /// Compilation options
    pub options: ServerTransformOptions,

    /// Current scope being transformed
    pub scope: &'a Scope,

    /// Initialization statements (run once at component creation)
    pub init: Vec<JsStatement>,

    /// Hoisted statements (declarations that go at the top level)
    pub hoisted: Vec<JsStatement>,

    /// The SSR template
    ///
    /// Array of statements and expressions that build the HTML output.
    /// These will be concatenated to form the final SSR function body.
    pub template: Vec<TemplateItem>,

    /// Namespace (html, svg, mathml, foreign)
    pub namespace: String,

    /// Whether to preserve whitespace in the output
    pub preserve_whitespace: bool,

    /// Skip hydration boundaries optimization
    ///
    /// When true, hydration markers are not inserted for certain static content
    pub skip_hydration_boundaries: bool,

    /// Transformed async {@const} declarations (if any) and those coming after them
    pub async_consts: Option<AsyncConsts>,

    /// The $: calls, which will be ordered in the end
    pub legacy_reactive_statements: FxHashMap<JsLabeledStatement, JsStatement>,

    /// Whether the component uses TypeScript
    pub is_typescript: bool,

    /// Arena allocator for JS AST nodes
    pub arena: crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
}

impl<'a> ComponentServerTransformState<'a> {
    /// Create a new component server transform state.
    pub fn new(
        analysis: &'a ComponentAnalysis,
        scope: &'a Scope,
        options: ServerTransformOptions,
    ) -> Self {
        Self {
            analysis,
            options,
            scope,
            init: Vec::new(),
            hoisted: Vec::new(),
            template: Vec::new(),
            namespace: "html".to_string(),
            preserve_whitespace: false,
            skip_hydration_boundaries: false,
            async_consts: None,
            legacy_reactive_statements: FxHashMap::default(),
            is_typescript: false,
            arena: crate::compiler::phases::phase3_transform::js_ast::arena::JsArena::new(),
        }
    }
}

/// Server-side transformation options.
///
/// Subset of compile options relevant to server-side code generation.
#[derive(Debug, Clone)]
pub struct ServerTransformOptions {
    /// Development mode
    pub dev: bool,

    /// Whether to generate hydration markers
    pub generate_hydration_markers: bool,

    /// Whether to preserve whitespace
    pub preserve_whitespace: bool,

    /// Whether to preserve comments
    pub preserve_comments: bool,
}

impl Default for ServerTransformOptions {
    fn default() -> Self {
        Self {
            dev: false,
            generate_hydration_markers: true,
            preserve_whitespace: false,
            preserve_comments: false,
        }
    }
}

/// A template item - either a statement or an expression.
///
/// The SSR template consists of both statements (for control flow)
/// and expressions (for output).
#[derive(Debug, Clone)]
pub enum TemplateItem {
    /// A statement (e.g., for loop, if statement)
    Statement(JsStatement),

    /// An expression (e.g., string literal, function call)
    Expression(JsExpr),
}

/// Async const declarations.
///
/// Used for {@const} blocks that contain await expressions.
#[derive(Debug, Clone)]
pub struct AsyncConsts {
    /// Identifier for the async const wrapper
    pub id: JsExpr,

    /// Thunk expressions to be evaluated
    pub thunks: Vec<JsExpr>,
}
