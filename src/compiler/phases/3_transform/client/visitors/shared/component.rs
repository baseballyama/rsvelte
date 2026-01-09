//! Component instantiation utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/component.js`.

use crate::ast::template::{Attribute, Component, SvelteComponentElement, SvelteElement};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use std::collections::HashMap;

/// Component node types.
#[derive(Debug, Clone)]
pub enum ComponentNode {
    /// Regular component (<MyComponent>)
    Component(Component),
    /// Dynamic component (<svelte:component this={...}>)
    SvelteComponent(SvelteComponentElement),
    /// Self-reference (<svelte:self>)
    SvelteSelf(SvelteElement),
}

/// Props entry in the props object.
#[derive(Debug, Clone)]
pub enum PropsEntry {
    /// Regular property
    Prop(JsObjectMember),
    /// Spread properties
    Spread(JsExpr),
}

/// Build a component instantiation statement.
///
/// Corresponds to `build_component` in Svelte's component.js.
///
/// # Arguments
///
/// * `node` - The component node (Component, SvelteComponent, or SvelteSelf)
/// * `component_name` - The name of the component function
/// * `context` - The component context
///
/// # Returns
///
/// Returns a statement that instantiates the component.
pub fn build_component(
    node: ComponentNode,
    component_name: String,
    context: &mut ComponentContext,
) -> JsStatement {
    let anchor = context.state.node.clone();

    let mut props_and_spreads: Vec<PropsEntry> = Vec::new();
    let mut events: HashMap<String, Vec<JsExpr>> = HashMap::new();
    let mut custom_css_props: Vec<JsObjectMember> = Vec::new();

    // Determine if component is dynamic
    let _is_component_dynamic = matches!(&node, ComponentNode::SvelteComponent(_));

    // Get attributes
    let attributes = match &node {
        ComponentNode::Component(comp) => &comp.attributes,
        ComponentNode::SvelteComponent(comp) => &comp.attributes,
        ComponentNode::SvelteSelf(elem) => &elem.attributes,
    };

    // Process each attribute
    for attribute in attributes {
        process_attribute(
            attribute,
            context,
            &mut props_and_spreads,
            &mut events,
            &mut custom_css_props,
        );
    }

    // Add events prop if any
    if !events.is_empty() {
        let events_obj = b::object(
            events
                .into_iter()
                .map(|(name, handlers)| {
                    let value = if handlers.len() > 1 {
                        b::array(handlers)
                    } else {
                        handlers.into_iter().next().unwrap()
                    };
                    b::prop(name, value)
                })
                .collect(),
        );
        push_prop_immediate(&mut props_and_spreads, b::prop("$$events", events_obj));
    }

    // Add custom CSS props if any
    if !custom_css_props.is_empty() {
        let css_props_obj = b::object(custom_css_props);
        push_prop_immediate(&mut props_and_spreads, b::prop("$$cssProps", css_props_obj));
    }

    // Build props expression
    let props_expression = build_props_expression(props_and_spreads);

    // Build component call
    let component_call = b::call(b::id(component_name), vec![anchor, props_expression]);

    b::stmt(component_call)
}

/// Process a single attribute.
fn process_attribute(
    attribute: &Attribute,
    _context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
    _events: &mut HashMap<String, Vec<JsExpr>>,
    _custom_css_props: &mut Vec<JsObjectMember>,
) {
    // TODO: Implement attribute processing
    // For now, just add a placeholder
    let _ = attribute; // Suppress unused variable warning
    // Placeholder - will be implemented in Phase 5.2
    push_prop_immediate(props_and_spreads, b::prop("placeholder", b::boolean(true)));
}

/// Push a property immediately to the props list.
fn push_prop_immediate(props: &mut Vec<PropsEntry>, prop: JsObjectMember) {
    props.push(PropsEntry::Prop(prop));
}

/// Build the final props expression from props and spreads.
fn build_props_expression(props_and_spreads: Vec<PropsEntry>) -> JsExpr {
    if props_and_spreads.is_empty() {
        // No props - return empty object
        return b::object(vec![]);
    }

    // Check if we have any spreads
    let has_spreads = props_and_spreads
        .iter()
        .any(|entry| matches!(entry, PropsEntry::Spread(_)));

    if !has_spreads {
        // No spreads - simple object
        let props: Vec<JsObjectMember> = props_and_spreads
            .into_iter()
            .filter_map(|entry| match entry {
                PropsEntry::Prop(prop) => Some(prop),
                _ => None,
            })
            .collect();
        return b::object(props);
    }

    // Has spreads - need to use Object.assign or spread syntax
    // For now, just return an object with the regular props
    // TODO: Implement proper spread handling
    let props: Vec<JsObjectMember> = props_and_spreads
        .into_iter()
        .filter_map(|entry| match entry {
            PropsEntry::Prop(prop) => Some(prop),
            _ => None,
        })
        .collect();
    b::object(props)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_props_expression_empty() {
        let props = build_props_expression(vec![]);

        match props {
            JsExpr::Object(obj) => {
                assert_eq!(obj.properties.len(), 0);
            }
            _ => panic!("Expected object expression"),
        }
    }

    #[test]
    fn test_build_props_expression_single_prop() {
        let props = vec![PropsEntry::Prop(b::prop("foo", b::string("bar")))];

        let result = build_props_expression(props);

        match result {
            JsExpr::Object(obj) => {
                assert_eq!(obj.properties.len(), 1);
            }
            _ => panic!("Expected object expression"),
        }
    }
}
