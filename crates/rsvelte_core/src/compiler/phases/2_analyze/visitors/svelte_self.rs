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
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:self.
pub fn visit<'a, 'b: 'a>(
    self_: &mut SvelteElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:self", context)?;

    // `<svelte:self>` is the supported spelling in legacy mode; only runes
    // components have self-imports to be deprecated in favour of.
    if context.analysis.runes {
        // The identifier and the path are independent: the identifier is the
        // component name, the path must stay the real file so the suggestion
        // resolves on a case-sensitive filesystem.
        let filename = &context.analysis.location_filename;
        let (name, basename) = if filename == "(unknown)" {
            ("Self", "Self.svelte")
        } else {
            (
                context.analysis.name.as_str(),
                filename.rsplit(['/', '\\']).next().unwrap_or(filename),
            )
        };
        context.emit_warning(
            warnings::svelte_self_deprecated(name, basename).at(self_.start, self_.end),
        );
    }

    // Analyze attributes — upstream's SvelteSelf.js delegates to the shared
    // `visit_component(node, context)`, which visits every attribute (and
    // the expressions inside it). Walking the expressions here is what flags
    // `uses_props` / `needs_context` for e.g.
    // `<svelte:self count={$$props.count} />`.
    for attr in &mut self_.attributes {
        match attr {
            Attribute::Attribute(a) => {
                super::shared::attribute::warn_attribute_quoted(context, a);
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
