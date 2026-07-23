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
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SvelteElement};

/// Visit a svelte:self.
pub fn visit<'a, 'b: 'a>(
    self_: &mut SvelteElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
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

    // Analyze attributes — upstream's SvelteSelf.js delegates to the shared
    // `visit_component(node, context)`, which visits every attribute (and
    // the expressions inside it). Walking the expressions here is what flags
    // `uses_props` / `needs_context` for e.g.
    // `<svelte:self count={$$props.count} />`.
    for attr in &mut self_.attributes {
        match attr {
            Attribute::Attribute(a) => {
                // Check attribute_quoted for svelte:self
                if let AttributeValue::Sequence(parts) = &a.value
                    && parts.len() == 1
                    && matches!(&parts[0], AttributeValuePart::ExpressionTag(_))
                {
                    context.emit_warning(warnings::attribute_quoted());
                }
                // Walk attribute value expressions
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            Attribute::BindDirective(bind) => {
                // Track component bindings (skip bind:this)
                if bind.name != "this" {
                    context.analysis.uses_component_bindings = true;
                }
                // Walk the bind expression to add template references.
                super::script::walk_expression(&bind.expression, context)?;
            }
            Attribute::OnDirective(on) => {
                // Walk event handler expression if present. Event forwarding
                // (on:foo without handler) sets needs_props in the CLIENT
                // transform phase, not here. See OnDirective.js line 21.
                if let Some(ref expr) = on.expression {
                    super::script::walk_expression(expr, context)?;
                }
            }
            Attribute::SpreadAttribute(spread) => {
                super::script::walk_expression(&spread.expression, context)?;
            }
            Attribute::AttachTag(attach) => {
                super::script::walk_expression(&attach.expression, context)?;
            }
            _ => {}
        }
    }

    // Analyze children
    fragment::analyze(&mut self_.fragment, context)?;

    Ok(())
}
