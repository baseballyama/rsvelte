//! Component instantiation utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/component.js`.

use crate::ast::template::{
    Attribute, AttributeNode, Component, SvelteComponentElement, SvelteElement,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::element::build_attribute_value;
use crate::compiler::phases::phase3_transform::client::visitors::shared::events::build_event_handler;
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

/// Extract a JsExpr from an Expression.
///
/// TODO: This is a simplified implementation. For complete support,
/// we need to properly convert serde_json::Value to JsExpr.
fn extract_js_expression(expression: &crate::ast::js::Expression) -> JsExpr {
    use crate::ast::js::Expression;

    match expression {
        Expression::Value(val) => match val {
            serde_json::Value::Object(obj) => {
                // Try to extract the identifier name
                if let Some(serde_json::Value::String(name)) = obj.get("name") {
                    b::id(name)
                } else {
                    // For more complex expressions, we'd need full conversion
                    b::id("expr")
                }
            }
            serde_json::Value::String(s) => b::id(s),
            _ => b::id("expr"),
        },
    }
}

/// Extract metadata from an Expression.
///
/// TODO: Implement proper metadata extraction from AST analysis.
fn extract_expression_metadata(_expression: &crate::ast::js::Expression) -> ExpressionMetadata {
    // For now, return a default metadata
    // In full implementation, analyze the expression for:
    // - has_call, has_state, has_await, etc.
    ExpressionMetadata::new()
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

    // TODO: Process children and slots
    // In Svelte's implementation, this section (lines 309-414) handles:
    // 1. Iterating through child nodes in node.fragment
    // 2. Determining if children are default slot content
    // 3. Creating slot functions for named slots
    // 4. Processing snippet declarations
    // 5. Adding $$slots metadata
    //
    // Example structure:
    // if (!node.fragment.nodes.is_empty()) {
    //     // Visit child nodes
    //     // Determine slot assignments
    //     // Create slot functions: () => { /* child content */ }
    //     // Add to props: { default: slot_fn, named_slot: slot_fn }
    // }

    // Build props expression
    let props_expression = build_props_expression(props_and_spreads);

    // Build component call
    // TODO: For dynamic components (<svelte:component>), wrap in $.component()
    // if is_component_dynamic {
    //     component_call = b::call(
    //         b::member_path("$.component"),
    //         vec![component_expr, anchor, props_expression]
    //     );
    // }
    let component_call = b::call(b::id(component_name), vec![anchor, props_expression]);

    b::stmt(component_call)
}

/// Process a single attribute.
fn process_attribute(
    attribute: &Attribute,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
    events: &mut HashMap<String, Vec<JsExpr>>,
    custom_css_props: &mut Vec<JsObjectMember>,
) {
    match attribute {
        // LetDirective - let: bindings
        Attribute::LetDirective(_let_dir) => {
            // LetDirective creates local bindings in the component scope
            // These are processed separately and added to the lets[] array
            // in the component context. For components, let directives are
            // typically used to destructure slot props.
            // TODO: Full implementation requires:
            // 1. Visiting the expression and creating a binding
            // 2. Adding to context.state.let_directives
            // 3. Handling in the parent visitor when processing children
        }

        // OnDirective - Event handlers
        Attribute::OnDirective(on_directive) => {
            process_on_directive(on_directive, context, events);
        }

        // SpreadAttribute - {...props}
        Attribute::SpreadAttribute(spread) => {
            process_spread_attribute(spread, context, props_and_spreads);
        }

        // Regular Attribute
        Attribute::Attribute(attr) => {
            process_regular_attribute(attr, context, props_and_spreads, custom_css_props);
        }

        // BindDirective - bind:prop
        Attribute::BindDirective(bind) => {
            process_bind_directive(bind, context, props_and_spreads);
        }

        // AttachTag - {@attach}
        Attribute::AttachTag(_attach) => {
            // AttachTag is used to attach event listeners to parent elements
            // This is a specialized feature used primarily internally by Svelte
            // TODO: Implement attachment point processing
            // This requires tracking the parent element and adding the
            // attachment metadata to the component context
        }

        // ClassDirective - class:name={value}
        Attribute::ClassDirective(_class_dir) => {
            // ClassDirective is typically used on DOM elements, not components
            // For components, class directives are passed as regular props
            // and the component decides how to apply them
            // In most cases, this is handled by the component's internal logic
        }

        // StyleDirective - style:property={value}
        Attribute::StyleDirective(_style_dir) => {
            // StyleDirective is typically used on DOM elements, not components
            // Similar to ClassDirective, components receive style directives
            // as props and handle them internally
        }

        // TransitionDirective - transition:name={params}
        Attribute::TransitionDirective(_transition_dir) => {
            // TransitionDirective applies animations to DOM elements
            // This is not applicable to component elements as transitions
            // are applied to the component's root elements internally
        }

        // AnimateDirective - animate:name={params}
        Attribute::AnimateDirective(_animate_dir) => {
            // AnimateDirective is used for FLIP animations in {#each} blocks
            // This is not applicable to component elements
        }

        // UseDirective - use:action={params}
        Attribute::UseDirective(_use_dir) => {
            // UseDirective applies actions to DOM elements
            // Actions cannot be applied to component elements as they
            // require direct access to the DOM node
        }
    }
}

/// Process a BindDirective (bind:prop).
fn process_bind_directive(
    bind: &crate::ast::template::BindDirective,
    _context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
) {
    // Special handling for bind:this
    if bind.name.as_str() == "this" {
        // bind:this is handled separately in Svelte
        // For now, we'll skip it as it requires special handling in the parent context
        // TODO: Implement bind:this processing
        return;
    }

    // Extract expression
    let expression = extract_js_expression(&bind.expression);

    // For bind directives, we need to create both getter and setter
    // Getter: () => value
    let getter = b::arrow(vec![], expression.clone());

    // Setter: ($$value) => { expression = $$value }
    let setter = b::arrow_block(
        vec![b::id_pattern("$$value")],
        vec![b::stmt(b::assign(expression, b::id("$$value")))],
    );

    // Create bind_get and bind_set properties
    let bind_name = format!("bind_{}", bind.name);

    // Add getter as a property with name "bind_{name}_get"
    push_prop_immediate(
        props_and_spreads,
        b::prop(format!("{}_get", bind_name), getter),
    );

    // Add setter as a property with name "bind_{name}_set"
    push_prop_immediate(
        props_and_spreads,
        b::prop(format!("{}_set", bind_name), setter),
    );
}

/// Process a SpreadAttribute ({...props}).
fn process_spread_attribute(
    spread: &crate::ast::template::SpreadAttribute,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
) {
    // Extract expression
    let expression = extract_js_expression(&spread.expression);
    let metadata = extract_expression_metadata(&spread.expression);

    // Apply memoization if the expression has state or calls
    let final_expression = if metadata.has_state || metadata.has_call {
        // Use memoizer to cache the expression
        context.state.memoizer.add(
            expression,
            metadata.has_call,
            metadata.has_await,
            metadata.has_state,
            false, // force_wrap
        )
    } else {
        expression
    };

    // Add as spread entry
    props_and_spreads.push(PropsEntry::Spread(final_expression));
}

/// Process an OnDirective (event handler).
fn process_on_directive(
    on_directive: &crate::ast::template::OnDirective,
    context: &mut ComponentContext,
    events: &mut HashMap<String, Vec<JsExpr>>,
) {
    // Build base event handler using the new signature
    let mut handler = build_event_handler(on_directive.expression.as_ref(), on_directive, context);

    // Apply modifiers
    // Check for stopPropagation modifier
    let has_stop_propagation = on_directive
        .modifiers
        .iter()
        .any(|m| m.as_str() == "stopPropagation");

    // Check for preventDefault modifier
    let has_prevent_default = on_directive
        .modifiers
        .iter()
        .any(|m| m.as_str() == "preventDefault");

    // Check for self modifier (only trigger if event.target === event.currentTarget)
    let has_self = on_directive.modifiers.iter().any(|m| m.as_str() == "self");

    // Check for trusted modifier (only trigger for trusted events)
    let has_trusted = on_directive
        .modifiers
        .iter()
        .any(|m| m.as_str() == "trusted");

    // If we have stopPropagation, preventDefault, self, or trusted modifiers,
    // we need to wrap the handler
    if has_stop_propagation || has_prevent_default || has_self || has_trusted {
        let original_handler = handler;
        let mut statements = Vec::new();

        // Add self check
        if has_self {
            // if (event.target !== event.currentTarget) return;
            let condition = b::binary(
                JsBinaryOp::StrictNe,
                b::member(b::id("$$event"), "target"),
                b::member(b::id("$$event"), "currentTarget"),
            );
            let then_branch = JsStatement::Block(JsBlockStatement {
                body: vec![b::return_stmt(None)],
            });
            statements.push(b::if_stmt(condition, then_branch, None));
        }

        // Add trusted check
        if has_trusted {
            // if (!event.isTrusted) return;
            let condition = b::unary(JsUnaryOp::Not, b::member(b::id("$$event"), "isTrusted"));
            let then_branch = JsStatement::Block(JsBlockStatement {
                body: vec![b::return_stmt(None)],
            });
            statements.push(b::if_stmt(condition, then_branch, None));
        }

        // Add stopPropagation call
        if has_stop_propagation {
            statements.push(b::stmt(b::call(
                b::member(b::id("$$event"), "stopPropagation"),
                vec![],
            )));
        }

        // Add preventDefault call
        if has_prevent_default {
            statements.push(b::stmt(b::call(
                b::member(b::id("$$event"), "preventDefault"),
                vec![],
            )));
        }

        // Call the original handler
        statements.push(b::return_stmt(Some(b::call(
            b::member(original_handler, "call"),
            vec![b::this(), b::id("$$event")],
        ))));

        // Wrap in arrow function
        handler = b::arrow_block(vec![b::id_pattern("$$event")], statements);
    }

    // Apply once modifier (wraps the handler in $.once())
    if on_directive.modifiers.iter().any(|m| m.as_str() == "once") {
        handler = b::call(b::member_path("$.once"), vec![handler]);
    }

    // Add to events map
    events
        .entry(on_directive.name.to_string())
        .or_default()
        .push(handler);
}

/// Process a regular attribute.
fn process_regular_attribute(
    attr: &AttributeNode,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
    custom_css_props: &mut Vec<JsObjectMember>,
) {
    // Handle custom CSS properties (--var)
    if attr.name.starts_with("--") {
        let result = build_attribute_value(&attr.value, context, |value, metadata| {
            // TODO: Implement proper memoization
            let _ = metadata;
            value
        });

        custom_css_props.push(b::prop(attr.name.as_str(), result.value));
        return;
    }

    // Build attribute value
    let result = build_attribute_value(&attr.value, context, |value, metadata| {
        // TODO: Implement proper memoization with should_wrap_in_derived logic
        let _ = metadata;
        value
    });

    // Add to props
    if result.has_state {
        // Use getter for reactive values
        push_prop_immediate(
            props_and_spreads,
            b::getter(attr.name.as_str(), vec![b::return_value(result.value)]),
        );
    } else {
        // Use init for static values
        push_prop_immediate(props_and_spreads, b::prop(attr.name.as_str(), result.value));
    }
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

    // Has spreads - use $.spread_props() helper
    // Build array of props and spreads
    let mut elements = Vec::new();
    let mut current_props = Vec::new();

    for entry in props_and_spreads {
        match entry {
            PropsEntry::Prop(prop) => {
                current_props.push(prop);
            }
            PropsEntry::Spread(expr) => {
                // Flush accumulated props
                if !current_props.is_empty() {
                    elements.push(b::object(current_props.clone()));
                    current_props.clear();
                }
                // Add spread expression
                elements.push(expr);
            }
        }
    }

    // Flush remaining props
    if !current_props.is_empty() {
        elements.push(b::object(current_props));
    }

    // If only one element, return it directly
    if elements.len() == 1 {
        return elements.into_iter().next().unwrap();
    }

    // Use $.spread_props([obj1, ...spread1, obj2, ...spread2])
    b::call(b::member_path("$.spread_props"), vec![b::array(elements)])
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
