//! SvelteSelf visitor.
//!
//! Analyzes <svelte:self> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteSelf.js`.

use super::super::AnalysisError;
use super::super::warnings;
use super::VisitorContext;
use super::shared::fragment;
use super::shared::special_element::validate_special_element_placement;
use crate::ast::template::SvelteElement;

/// Visit a svelte:self.
pub fn visit(self_: &mut SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:self", context)?;

    // Emit deprecation warning
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/SvelteSelf.js
    // w.svelte_self_deprecated(node, state.analysis.name, filename.replace('./', ''));
    //
    // The component name is derived from the filename in ComponentAnalysis::new()
    // If no filename was provided, it defaults to "Component"
    let component_name = &context.analysis.name;

    // Construct the basename (filename.svelte format)
    // The official compiler uses the actual filename's basename, but since
    // we only have the component name, we construct it as "{name}.svelte"
    let basename = format!("{}.svelte", component_name);

    context.emit_warning(warnings::svelte_self_deprecated(component_name, &basename));

    // Analyze children
    fragment::analyze(&mut self_.fragment, context)?;

    Ok(())
}
