//! Function analysis utilities.
//!
//! Functions for analyzing JavaScript functions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/function.js`.

use super::super::VisitorContext;

/// Check if we're inside a function context.
pub fn is_inside_function(context: &VisitorContext) -> bool {
    context.function_depth > 0
}

/// Get the current function depth.
pub fn get_function_depth(context: &VisitorContext) -> usize {
    context.function_depth
}

/// Enter a function context.
pub fn enter_function(context: &mut VisitorContext) {
    context.function_depth += 1;
}

/// Exit a function context.
pub fn exit_function(context: &mut VisitorContext) {
    if context.function_depth > 0 {
        context.function_depth -= 1;
    }
}

/// Check if an identifier is a rune.
pub fn is_rune(name: &str) -> bool {
    matches!(
        name,
        "$state"
            | "$state.raw"
            | "$derived"
            | "$derived.by"
            | "$effect"
            | "$effect.pre"
            | "$effect.tracking"
            | "$effect.root"
            | "$props"
            | "$bindable"
            | "$inspect"
            | "$host"
    )
}

/// Get the rune type from a name.
pub fn get_rune_type(name: &str) -> Option<RuneType> {
    match name {
        "$state" => Some(RuneType::State),
        "$state.raw" => Some(RuneType::StateRaw),
        "$derived" => Some(RuneType::Derived),
        "$derived.by" => Some(RuneType::DerivedBy),
        "$effect" => Some(RuneType::Effect),
        "$effect.pre" => Some(RuneType::EffectPre),
        "$effect.tracking" => Some(RuneType::EffectTracking),
        "$effect.root" => Some(RuneType::EffectRoot),
        "$props" => Some(RuneType::Props),
        "$bindable" => Some(RuneType::Bindable),
        "$inspect" => Some(RuneType::Inspect),
        "$host" => Some(RuneType::Host),
        _ => None,
    }
}

/// Types of runes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuneType {
    State,
    StateRaw,
    Derived,
    DerivedBy,
    Effect,
    EffectPre,
    EffectTracking,
    EffectRoot,
    Props,
    Bindable,
    Inspect,
    Host,
}

impl RuneType {
    /// Check if this rune creates reactive state.
    pub fn is_reactive_state(&self) -> bool {
        matches!(
            self,
            RuneType::State | RuneType::StateRaw | RuneType::Derived | RuneType::DerivedBy
        )
    }

    /// Check if this rune is an effect.
    pub fn is_effect(&self) -> bool {
        matches!(
            self,
            RuneType::Effect | RuneType::EffectPre | RuneType::EffectRoot
        )
    }
}
