//! Function analysis utilities.
//!
//! Functions for analyzing JavaScript functions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/function.js`.

use super::super::VisitorContext;

/// Visit a function node (ArrowFunctionExpression, FunctionExpression, or FunctionDeclaration).
///
/// Corresponds to `visit_function` in function.js.
///
/// This function handles the analysis of function scopes and captures references
/// to variables from outer scopes. When inside an expression context, it tracks
/// which bindings from parent scopes are referenced within the function.
///
/// # Arguments
///
/// * `context` - The visitor context
/// * `visit_children` - A callback to visit the function's children with updated context
pub fn visit_function<F>(context: &mut VisitorContext, mut visit_children: F)
where
    F: FnMut(&mut VisitorContext),
{
    // TODO: Implement expression tracking
    // if (context.state.expression) {
    //     for (const [name] of context.state.scope.references) {
    //         const binding = context.state.scope.get(name);
    //
    //         if (binding && binding.scope.function_depth < context.state.scope.function_depth) {
    //             context.state.expression.references.add(binding);
    //         }
    //     }
    // }

    // Increment function depth for the child context
    let original_depth = context.function_depth;
    context.function_depth += 1;

    // Visit children with updated context
    // In JavaScript this is done with context.next({ ...context.state, function_depth: +1, expression: null })
    visit_children(context);

    // Restore function depth
    context.function_depth = original_depth;
}

/// Check if we're inside a function context.
pub fn is_inside_function(context: &VisitorContext) -> bool {
    context.function_depth > 0
}

/// Get the current function depth.
pub fn get_function_depth(context: &VisitorContext) -> usize {
    context.function_depth
}

/// Enter a function context (increment depth).
pub fn enter_function(context: &mut VisitorContext) {
    context.function_depth += 1;
}

/// Exit a function context (decrement depth).
pub fn exit_function(context: &mut VisitorContext) {
    if context.function_depth > 0 {
        context.function_depth -= 1;
    }
}

/// Check if an identifier is a rune.
/// Uses first-byte dispatch after '$' for fast rejection.
#[inline]
pub fn is_rune(name: &str) -> bool {
    let bytes = name.as_bytes();
    if bytes.first() != Some(&b'$') || bytes.len() < 5 {
        return false;
    }
    // Dispatch on second byte for fast rejection
    match bytes[1] {
        b's' => matches!(
            name,
            "$state" | "$state.raw" | "$state.eager" | "$state.snapshot"
        ),
        b'd' => matches!(name, "$derived" | "$derived.by"),
        b'p' => matches!(name, "$props" | "$props.id"),
        b'b' => name == "$bindable",
        b'e' => matches!(
            name,
            "$effect" | "$effect.pre" | "$effect.tracking" | "$effect.root" | "$effect.pending"
        ),
        b'i' => matches!(name, "$inspect" | "$inspect().with" | "$inspect.trace"),
        b'h' => name == "$host",
        _ => false,
    }
}

/// Get the rune type from a name.
pub fn get_rune_type(name: &str) -> Option<RuneType> {
    match name {
        "$state" => Some(RuneType::State),
        "$state.raw" => Some(RuneType::StateRaw),
        "$state.eager" => Some(RuneType::StateEager),
        "$state.snapshot" => Some(RuneType::StateSnapshot),
        "$derived" => Some(RuneType::Derived),
        "$derived.by" => Some(RuneType::DerivedBy),
        "$props" => Some(RuneType::Props),
        "$props.id" => Some(RuneType::PropsId),
        "$bindable" => Some(RuneType::Bindable),
        "$effect" => Some(RuneType::Effect),
        "$effect.pre" => Some(RuneType::EffectPre),
        "$effect.tracking" => Some(RuneType::EffectTracking),
        "$effect.root" => Some(RuneType::EffectRoot),
        "$effect.pending" => Some(RuneType::EffectPending),
        "$inspect" => Some(RuneType::Inspect),
        "$inspect().with" => Some(RuneType::InspectWith),
        "$inspect.trace" => Some(RuneType::InspectTrace),
        "$host" => Some(RuneType::Host),
        _ => None,
    }
}

/// Types of runes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuneType {
    State,
    StateRaw,
    StateEager,
    StateSnapshot,
    Derived,
    DerivedBy,
    Props,
    PropsId,
    Bindable,
    Effect,
    EffectPre,
    EffectTracking,
    EffectRoot,
    EffectPending,
    Inspect,
    InspectWith,
    InspectTrace,
    Host,
}

impl RuneType {
    /// Check if this rune creates reactive state.
    pub fn is_reactive_state(&self) -> bool {
        matches!(
            self,
            RuneType::State
                | RuneType::StateRaw
                | RuneType::StateEager
                | RuneType::Derived
                | RuneType::DerivedBy
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
