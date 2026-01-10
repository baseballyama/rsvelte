//! Types for Phase 3: Transform
//!
//! This module defines types used throughout the code generation phase.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/types.d.ts`

use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::{ComponentAnalysis, Scope};
use std::collections::HashMap;

/// Base state for all transformations in phase 3.
///
/// This type mirrors the `TransformState` interface from the official Svelte compiler.
/// It provides access to analysis results, options, and scope information needed
/// during code generation.
///
/// Corresponds to `TransformState` in `types.d.ts`.
#[derive(Debug)]
pub struct TransformState<'a> {
    /// Analysis results from phase 2
    pub analysis: &'a ComponentAnalysis,

    /// Compilation options
    pub options: &'a CompileOptions,

    /// Current scope being transformed
    pub scope: &'a Scope,

    /// Map of all scopes in the component (keyed by AST node position)
    pub scopes: &'a HashMap<u32, Scope>,

    /// Whether we're transforming instance script content
    pub is_instance: bool,

    /// State fields tracked during transformation
    /// Maps field name to its metadata
    pub state_fields: HashMap<String, StateField>,
}

impl<'a> TransformState<'a> {
    /// Create a new transform state for a component.
    pub fn new(
        analysis: &'a ComponentAnalysis,
        options: &'a CompileOptions,
        scope: &'a Scope,
        scopes: &'a HashMap<u32, Scope>,
    ) -> Self {
        Self {
            analysis,
            options,
            scope,
            scopes,
            is_instance: false,
            state_fields: HashMap::new(),
        }
    }

    /// Create a transform state for instance script transformation.
    pub fn for_instance(
        analysis: &'a ComponentAnalysis,
        options: &'a CompileOptions,
        scope: &'a Scope,
        scopes: &'a HashMap<u32, Scope>,
    ) -> Self {
        Self {
            analysis,
            options,
            scope,
            scopes,
            is_instance: true,
            state_fields: HashMap::new(),
        }
    }
}

/// Metadata about a state field in the component.
///
/// This tracks reactive state fields created with runes like `$state` and `$derived`.
#[derive(Debug, Clone)]
pub struct StateField {
    /// The name of the state field
    pub name: String,

    /// Whether this is a derived field (`$derived`)
    pub is_derived: bool,

    /// Whether this field is immutable
    pub is_readonly: bool,

    /// The initial value expression (if any)
    pub init: Option<String>,
}

impl StateField {
    /// Create a new state field.
    pub fn new(name: String) -> Self {
        Self {
            name,
            is_derived: false,
            is_readonly: false,
            init: None,
        }
    }

    /// Create a derived state field.
    pub fn derived(name: String, init: Option<String>) -> Self {
        Self {
            name,
            is_derived: true,
            is_readonly: true,
            init,
        }
    }
}
