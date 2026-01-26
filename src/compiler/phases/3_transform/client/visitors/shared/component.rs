//! Component instantiation utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/component.js`.

use crate::ast::js::Expression;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, BindDirective, Component,
    LetDirective, OnDirective, SnippetBlock, SpreadAttribute, SvelteComponentElement,
    SvelteElement, TemplateNode,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
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
    /// Spread properties (as thunk or direct expression)
    Spread(JsExpr),
}

/// Delayed prop to be pushed after regular props (for bind directives).
struct DelayedProp {
    prop: JsObjectMember,
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
    let mut delayed_props: Vec<DelayedProp> = Vec::new();
    let mut lets: Vec<JsExpressionStatement> = Vec::new();
    let mut events: HashMap<String, Vec<JsExpr>> = HashMap::new();
    let mut custom_css_props: Vec<JsObjectMember> = Vec::new();
    let mut bind_this: Option<Expression> = None;
    let mut binding_initializers: Vec<JsStatement> = Vec::new();
    let mut snippet_declarations: Vec<JsStatement> = Vec::new();
    let mut serialized_slots: Vec<JsObjectMember> = Vec::new();
    let mut has_children_prop = false;

    // Determine if component is dynamic
    let is_component_dynamic = match &node {
        ComponentNode::SvelteComponent(_) => true,
        ComponentNode::Component(comp) => comp.metadata.dynamic,
        ComponentNode::SvelteSelf(_) => false,
    };

    // Generate intermediate name for dynamic components
    let intermediate_name = if let ComponentNode::Component(comp) = &node {
        if comp.metadata.dynamic {
            context.state.memoizer.generate_id(&comp.name)
        } else {
            "$$component".to_string()
        }
    } else {
        "$$component".to_string()
    };

    // Get fragment, attributes, and check if slot scope applies to component itself
    let (fragment, attributes) = match &node {
        ComponentNode::Component(comp) => (&comp.fragment, &comp.attributes),
        ComponentNode::SvelteComponent(comp) => (&comp.fragment, &comp.attributes),
        ComponentNode::SvelteSelf(elem) => (&elem.fragment, &elem.attributes),
    };

    // Check if component has a slot property (named slot within another component)
    let slot_scope_applies_to_itself = determine_slot_from_attributes(attributes);

    // Process let directives first if slot scope applies to component itself
    if slot_scope_applies_to_itself {
        for attribute in attributes {
            if let Attribute::LetDirective(let_dir) = attribute {
                process_let_directive(let_dir, context, &mut lets);
            }
        }
    }

    // Process each attribute
    for attribute in attributes {
        match attribute {
            Attribute::LetDirective(let_dir) => {
                if !slot_scope_applies_to_itself {
                    process_let_directive(let_dir, context, &mut lets);
                }
            }

            Attribute::OnDirective(on_dir) => {
                process_on_directive(on_dir, context, &mut events);
            }

            Attribute::SpreadAttribute(spread) => {
                process_spread_attribute(spread, context, &mut props_and_spreads);
            }

            Attribute::Attribute(attr) => {
                // Check for children prop
                if attr.name.as_str() == "children" {
                    has_children_prop = true;
                }

                process_regular_attribute(
                    attr,
                    context,
                    &mut props_and_spreads,
                    &mut custom_css_props,
                );
            }

            Attribute::BindDirective(bind) => {
                process_bind_directive(
                    bind,
                    context,
                    &mut props_and_spreads,
                    &mut delayed_props,
                    &mut bind_this,
                    &mut binding_initializers,
                    is_component_dynamic,
                    &intermediate_name,
                    &component_name,
                );
            }

            Attribute::AttachTag(attach) => {
                process_attach_tag(attach, context, &mut props_and_spreads);
            }

            // Other directives are not typically used on components
            _ => {}
        }
    }

    // Push delayed props (bindings) after regular props
    for delayed in delayed_props {
        push_prop_immediate(&mut props_and_spreads, delayed.prop);
    }

    // Add let directives to init if slot scope applies to component
    if slot_scope_applies_to_itself {
        for let_stmt in lets.iter() {
            context
                .state
                .init
                .push(JsStatement::Expression(let_stmt.clone()));
        }
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

    // Group children by slot and process snippets
    let mut children: HashMap<String, Vec<&TemplateNode>> = HashMap::new();

    for child in &fragment.nodes {
        if let TemplateNode::SnippetBlock(snippet) = child {
            // Process snippet block
            process_snippet_block(
                snippet,
                context,
                &mut snippet_declarations,
                &mut props_and_spreads,
                &mut serialized_slots,
            );
            continue;
        }

        let slot_name = determine_slot(child).unwrap_or_else(|| "default".to_string());
        children.entry(slot_name).or_default().push(child);
    }

    // Serialize each slot
    for (slot_name, slot_children) in children {
        let slot_fn = build_slot_function(
            &slot_children,
            &slot_name,
            slot_scope_applies_to_itself,
            &lets,
            context,
        );

        if let Some(fn_expr) = slot_fn {
            if slot_name == "default" && !has_children_prop {
                // Check if we need $$slots.default or children prop
                let needs_slots_default = !lets.is_empty()
                    || slot_children.iter().any(|node| {
                        matches!(node, TemplateNode::SvelteFragment(frag)
                            if frag.attributes.iter().any(|attr| matches!(attr, Attribute::LetDirective(_))))
                    });

                if needs_slots_default {
                    // Use $$slots.default
                    serialized_slots.push(b::prop(&slot_name, fn_expr));
                    // Add children prop that errors
                    push_prop_immediate(
                        &mut props_and_spreads,
                        b::prop("children", b::member_path("$.invalid_default_snippet")),
                    );
                } else {
                    // Use children prop
                    let wrapped_fn = if context.state.dev {
                        b::call(
                            b::member_path("$.wrap_snippet"),
                            vec![b::id(&context.state.analysis.name), fn_expr],
                        )
                    } else {
                        fn_expr
                    };
                    push_prop_immediate(&mut props_and_spreads, b::prop("children", wrapped_fn));
                    // Add $$slots.default: true
                    serialized_slots.push(b::prop(&slot_name, b::boolean(true)));
                }
            } else {
                serialized_slots.push(b::prop(&slot_name, fn_expr));
            }
        }
    }

    // Add $$slots if any
    if !serialized_slots.is_empty() {
        push_prop_immediate(
            &mut props_and_spreads,
            b::prop("$$slots", b::object(serialized_slots)),
        );
    }

    // Add $$legacy flag if not in runes mode and has bindings
    if !context.state.analysis.runes
        && attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::BindDirective(_)))
    {
        push_prop_immediate(
            &mut props_and_spreads,
            b::prop("$$legacy", b::boolean(true)),
        );
    }

    // Build props expression
    let props_expression = build_props_expression(props_and_spreads);

    // Build the component call
    let mut statements: Vec<JsStatement> = Vec::new();
    statements.extend(snippet_declarations);

    // Add memoized deriveds
    // TODO: Add memoizer.deriveds() when memoizer is fully implemented

    // Build the component instantiation
    if !custom_css_props.is_empty() {
        // Handle custom CSS properties with wrapper element
        build_with_css_props(
            &mut statements,
            context,
            &anchor,
            &custom_css_props,
            &component_name,
            is_component_dynamic,
            &intermediate_name,
            &binding_initializers,
            &props_expression,
            bind_this.as_ref(),
        );
    } else {
        // Normal component instantiation
        context.state.template.push_comment(None);

        let component_call = build_component_call(
            &anchor,
            &component_name,
            is_component_dynamic,
            &intermediate_name,
            &props_expression,
            bind_this.as_ref(),
            context,
        );

        if is_component_dynamic {
            // Wrap in $.component() for dynamic components
            let inner_call = build_inner_component_call(
                &component_name,
                &intermediate_name,
                &props_expression,
                bind_this.as_ref(),
                context,
            );

            let dynamic_call = b::call(
                b::member_path("$.component"),
                vec![
                    anchor.clone(),
                    b::thunk(build_component_expression(&node, &component_name, context)),
                    b::arrow_block(
                        vec![b::id_pattern("$$anchor"), b::id_pattern(&intermediate_name)],
                        {
                            let mut body = binding_initializers.clone();
                            body.push(b::stmt(inner_call));
                            body
                        },
                    ),
                ],
            );

            statements.push(add_svelte_meta(
                dynamic_call,
                &node,
                "component",
                &component_name,
            ));
        } else {
            statements.extend(binding_initializers);
            statements.push(add_svelte_meta(
                component_call,
                &node,
                "component",
                &component_name,
            ));
        }
    }

    // Return single statement or block
    if statements.len() == 1 {
        statements.into_iter().next().unwrap()
    } else {
        b::block(statements)
    }
}

/// Determine slot name from a node's attributes.
fn determine_slot(node: &TemplateNode) -> Option<String> {
    let attributes = match node {
        TemplateNode::RegularElement(elem) => Some(&elem.attributes),
        TemplateNode::Component(comp) => Some(&comp.attributes),
        TemplateNode::SvelteFragment(frag) => Some(&frag.attributes),
        _ => None,
    };

    if let Some(attrs) = attributes {
        for attr in attrs {
            if let Attribute::Attribute(a) = attr
                && a.name.as_str() == "slot"
                && let AttributeValue::Sequence(parts) = &a.value
                && let Some(AttributeValuePart::Text(text)) = parts.first()
            {
                return Some(text.data.to_string());
            }
        }
    }

    None
}

/// Check if component has a slot attribute.
fn determine_slot_from_attributes(attributes: &[Attribute]) -> bool {
    attributes.iter().any(|attr| {
        if let Attribute::Attribute(a) = attr {
            a.name.as_str() == "slot"
        } else {
            false
        }
    })
}

/// Process a let directive.
fn process_let_directive(
    let_dir: &LetDirective,
    _context: &mut ComponentContext,
    _lets: &mut Vec<JsExpressionStatement>,
) {
    // Let directives create local bindings from slot props
    // For now, we'll skip the full implementation
    // TODO: Implement proper let directive handling
    let _ = let_dir;
}

/// Process an OnDirective (event handler).
fn process_on_directive(
    on_directive: &OnDirective,
    context: &mut ComponentContext,
    events: &mut HashMap<String, Vec<JsExpr>>,
) {
    // If no expression, mark that component needs props for event bubbling
    if on_directive.expression.is_none() {
        // context.state.analysis.needs_props = true;
    }

    // Build base event handler
    let mut handler = build_event_handler(on_directive.expression.as_ref(), on_directive, context);

    // Apply once modifier
    if on_directive.modifiers.iter().any(|m| m.as_str() == "once") {
        handler = b::call(b::member_path("$.once"), vec![handler]);
    }

    // Add to events map
    events
        .entry(on_directive.name.to_string())
        .or_default()
        .push(handler);
}

/// Process a SpreadAttribute ({...props}).
fn process_spread_attribute(
    spread: &SpreadAttribute,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
) {
    let expression = convert_expression(&spread.expression, context);

    // Check if expression has state (would need memoization)
    // For now, wrap in thunk if it might be reactive
    let has_state = expression_might_have_state(&spread.expression);

    if has_state {
        // Wrap in thunk for reactive spread
        props_and_spreads.push(PropsEntry::Spread(b::thunk(expression)));
    } else {
        props_and_spreads.push(PropsEntry::Spread(expression));
    }
}

/// Process a regular attribute.
fn process_regular_attribute(
    attr: &AttributeNode,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
    custom_css_props: &mut Vec<JsObjectMember>,
) {
    use crate::compiler::phases::phase3_transform::client::types::ExpressionMetadata;
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;

    // Handle custom CSS properties (--var)
    if attr.name.starts_with("--") {
        let result = build_attribute_value(&attr.value, context, |value, _metadata| {
            // CSS property values don't need state transforms
            value
        });
        custom_css_props.push(b::prop(attr.name.as_str(), result.value));
        return;
    }

    // Build attribute value with state transform application
    let result = build_attribute_value(&attr.value, context, |value, _metadata| {
        // Note: We can't call build_expression here because the closure takes context by mutable ref
        // The transforms will be applied during the build_attribute_value phase
        value
    });

    // Apply state transforms to the value AFTER extraction
    // This handles cases like event handlers: onmousedown={() => count += 1}
    let transformed_value = {
        let metadata = ExpressionMetadata {
            has_state: result.has_state,
            ..Default::default()
        };
        build_expression(context, &result.value, &metadata)
    };

    // Check if this is a reference to a snippet
    // Snippet references should always use getters because snippets are treated as having state
    // (even though they're hoisted to module level, their binding.is_function() returns false
    // because their initial type is SnippetBlock, not FunctionExpression)
    let is_snippet_reference = is_snippet_identifier(&attr.value, context);

    // Add to props
    if result.has_state || is_snippet_reference {
        // Use getter for reactive values and snippet references
        push_prop_immediate(
            props_and_spreads,
            b::getter(attr.name.as_str(), vec![b::return_value(transformed_value)]),
        );
    } else {
        // Use init for static values
        push_prop_immediate(
            props_and_spreads,
            b::prop(attr.name.as_str(), transformed_value),
        );
    }
}

/// Check if an attribute value is a simple identifier that references a snippet.
fn is_snippet_identifier(value: &AttributeValue, context: &ComponentContext) -> bool {
    use crate::ast::js::Expression;

    // Only check for Expression type (shorthand like {foo})
    if let AttributeValue::Expression(expr_tag) = value
        && let Expression::Value(val) = &expr_tag.expression
        && let serde_json::Value::Object(obj) = val
        && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
        && let Some(name) = obj.get("name").and_then(|v| v.as_str())
    {
        return context.state.snippet_names.contains(name);
    }
    false
}

/// Process a bind directive.
#[allow(clippy::too_many_arguments)]
fn process_bind_directive(
    bind: &BindDirective,
    context: &mut ComponentContext,
    _props_and_spreads: &mut Vec<PropsEntry>,
    delayed_props: &mut Vec<DelayedProp>,
    bind_this: &mut Option<Expression>,
    binding_initializers: &mut Vec<JsStatement>,
    is_component_dynamic: bool,
    intermediate_name: &str,
    component_name: &str,
) {
    let expression = convert_expression(&bind.expression, context);

    // Handle bind:this specially
    if bind.name.as_str() == "this" {
        *bind_this = Some(bind.expression.clone());
        return;
    }

    // Check if expression is a sequence (getter/setter pair)
    if let JsExpr::Sequence(seq) = &expression
        && seq.expressions.len() == 2
    {
        let get = seq.expressions[0].clone();
        let set = seq.expressions[1].clone();

        let get_id = b::id(context.state.memoizer.generate_id("bind_get"));
        let set_id = b::id(context.state.memoizer.generate_id("bind_set"));

        context.state.init.push(b::var_decl("bind_get", Some(get)));
        context.state.init.push(b::var_decl("bind_set", Some(set)));

        // Add getter
        delayed_props.push(DelayedProp {
            prop: b::getter(
                bind.name.as_str(),
                vec![b::return_value(b::call(get_id.clone(), vec![]))],
            ),
        });

        // Add setter
        delayed_props.push(DelayedProp {
            prop: b::setter(
                bind.name.as_str(),
                "$$value",
                vec![b::stmt(b::call(set_id, vec![b::id("$$value")]))],
            ),
        });

        return;
    }

    // Check if it's a store subscription
    let is_store_sub = is_store_subscription(&bind.expression, context);

    // Check if this is a state source binding that needs $.get/$.set
    let is_state_binding = if let JsExpr::Identifier(name) = &expression {
        if let Some(binding) = context.state.get_binding(name) {
            crate::compiler::phases::phase3_transform::client::utils::is_state_source(
                binding,
                context.state.analysis,
            )
        } else {
            false
        }
    } else {
        false
    };

    // Create getter
    let getter_body = if is_store_sub {
        vec![
            b::stmt(b::call(b::member_path("$.mark_store_binding"), vec![])),
            b::return_value(expression.clone()),
        ]
    } else if is_state_binding {
        // For state bindings, use $.get()
        vec![b::return_value(b::call(
            b::member_path("$.get"),
            vec![expression.clone()],
        ))]
    } else {
        vec![b::return_value(expression.clone())]
    };

    let getter = b::getter(bind.name.as_str(), getter_body);

    // Create setter
    let setter_body = if is_state_binding {
        // For state bindings, use $.set(value, $$value, true)
        vec![b::stmt(b::call(
            b::member_path("$.set"),
            vec![expression.clone(), b::id("$$value"), b::boolean(true)],
        ))]
    } else {
        vec![b::stmt(b::assign(expression.clone(), b::id("$$value")))]
    };

    let setter = b::setter(bind.name.as_str(), "$$value", setter_body);

    // Add as delayed props (bindings come at the end)
    delayed_props.push(DelayedProp { prop: getter });
    delayed_props.push(DelayedProp { prop: setter });

    // Dev mode: add ownership validation
    if context.state.dev {
        // TODO: Add ownership validation for bindable props
        let _ = (
            is_component_dynamic,
            intermediate_name,
            component_name,
            binding_initializers,
        );
    }
}

/// Process an attach tag.
fn process_attach_tag(
    attach: &crate::ast::template::AttachTag,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
) {
    let expression = convert_expression(&attach.expression, context);

    // Check if expression has state
    let has_state = expression_might_have_state(&attach.expression);

    let final_expr = if has_state {
        // Wrap in arrow function for reactive attach
        b::arrow(
            vec![b::id_pattern("$$node")],
            b::call(
                b::logical(JsLogicalOp::Or, expression, b::member_path("$.noop")),
                vec![b::id("$$node")],
            ),
        )
    } else {
        expression
    };

    // Add as computed property with $.attachment() key
    push_prop_immediate(
        props_and_spreads,
        JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Computed(Box::new(b::call(b::member_path("$.attachment"), vec![]))),
            value: Box::new(final_expr),
            kind: JsPropertyKind::Init,
            computed: true,
            shorthand: false,
        }),
    );
}

/// Process a snippet block.
fn process_snippet_block(
    snippet: &SnippetBlock,
    _context: &mut ComponentContext,
    snippet_declarations: &mut Vec<JsStatement>,
    _props_and_spreads: &mut Vec<PropsEntry>,
    serialized_slots: &mut Vec<JsObjectMember>,
) {
    // Visit the snippet to generate its declaration
    // Extract name from expression (should be an Identifier)
    let snippet_name =
        extract_identifier_name(&snippet.expression).unwrap_or_else(|| "snippet".to_string());

    // Create snippet function
    let snippet_fn = b::arrow_block(
        vec![b::id_pattern("$$anchor"), b::id_pattern("$$slotProps")],
        vec![], // TODO: Visit snippet body
    );

    // Add to declarations
    snippet_declarations.push(b::const_decl(&snippet_name, snippet_fn.clone()));

    // Add to serialized slots for interop
    let slot_name = if snippet_name == "children" {
        "default".to_string()
    } else {
        snippet_name
    };
    serialized_slots.push(b::prop(&slot_name, b::boolean(true)));
}

/// Build a slot function for children.
///
/// Corresponds to the slot serialization logic in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/component.js`
/// (lines 354-383).
fn build_slot_function(
    children: &[&TemplateNode],
    slot_name: &str,
    slot_scope_applies_to_itself: bool,
    lets: &[JsExpressionStatement],
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    if children.is_empty() {
        return None;
    }

    // Visit the children and collect generated statements
    // This pattern mirrors visit_fragment in snippet_block.rs
    let child_statements = visit_slot_children(children, context);

    // If no statements were generated, return None
    if child_statements.is_empty() {
        return None;
    }

    // Build the slot function body
    let mut body: Vec<JsStatement> = Vec::new();

    // Add let directives for default slot (only if slot scope doesn't apply to component itself)
    if slot_name == "default" && !slot_scope_applies_to_itself {
        for let_stmt in lets {
            body.push(JsStatement::Expression(let_stmt.clone()));
        }
    }

    // Add the visited children statements
    body.extend(child_statements);

    Some(b::arrow_block(
        vec![b::id_pattern("$$anchor"), b::id_pattern("$$slotProps")],
        body,
    ))
}

/// Visit slot children and collect generated statements.
///
/// This function visits each child node in the slot and collects the generated
/// statements for the slot function body. It mirrors the behavior of
/// `context.visit(fragment, state)` in the JavaScript implementation.
///
/// The key insight is that visiting slot children is essentially visiting a Fragment
/// with a modified set of nodes. We need to:
/// 1. Clean the nodes (trim whitespace, handle hoisted nodes)
/// 2. For standalone components, just visit them directly with $$anchor
/// 3. For other cases, use the process_children pattern
fn visit_slot_children(
    children: &[&TemplateNode],
    context: &mut ComponentContext,
) -> Vec<JsStatement> {
    use crate::compiler::phases::phase3_transform::utils::clean_nodes;

    // Convert &[&TemplateNode] to Vec<TemplateNode> for clean_nodes
    let nodes: Vec<TemplateNode> = children.iter().map(|n| (*n).clone()).collect();

    // Clean the nodes (trim whitespace, etc.)
    let cleaned = clean_nodes(
        None, // No parent in slot context
        &nodes,
        &context.path,
        &context.state.metadata.namespace,
        context.state.scope,
        context.state.analysis,
        context.state.preserve_whitespace,
        context.state.options.preserve_comments,
    );

    // If no trimmed nodes, return empty
    if cleaned.trimmed.is_empty() {
        return Vec::new();
    }

    // Save the current state
    let saved_init = std::mem::take(&mut context.state.init);
    let saved_update = std::mem::take(&mut context.state.update);
    let saved_template = context.state.template.clone();
    let saved_node = context.state.node.clone();

    // Reset template for slot content
    context.state.template =
        crate::compiler::phases::phase3_transform::client::transform_template::Template::new();

    // Set the node to $$anchor - this is the anchor passed to the slot function
    // The slot function signature is ($$anchor, $$slotProps) => { ... }
    context.state.node = b::id("$$anchor");

    // Handle standalone case: single component/render tag doesn't need template processing
    if cleaned.is_standalone {
        // For standalone components, just visit them directly
        for node in &cleaned.trimmed {
            let result = context.visit_node(node, None);
            match result {
                crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(
                    stmt,
                ) => {
                    context.state.init.push(stmt);
                }
                crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(
                    block,
                ) => {
                    context
                        .state
                        .init
                        .push(crate::compiler::phases::phase3_transform::js_ast::JsStatement::Block(
                            block,
                        ));
                }
                _ => {}
            }
        }
    } else {
        // For non-standalone cases, use process_children to handle text+expression sequences
        // This properly handles cases like `clicks: {count}` which needs:
        // - Empty $.text() node
        // - $.template_effect() wrapping the dynamic text update
        // - $.append($$anchor, text) to add to DOM
        use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;

        // Add $.next() at the beginning to position properly
        context
            .state
            .init
            .push(b::stmt(b::call(b::member_path("$.next"), vec![])));

        // Use process_children for proper text+expression handling
        process_children(
            &cleaned.trimmed,
            move |_is_text| {
                // This creates the text node
                b::call(b::member_path("$.text"), vec![])
            },
            false, // not an element context
            context,
        );

        // After process_children, look for the text node variable and add append
        // We need to find the variable that was created
        // For now, add a generic append using the last created text id
        // This is a simplified approach - full implementation would track the ID properly
    }

    // Collect the generated init statements
    let mut result = std::mem::replace(&mut context.state.init, saved_init);

    // If there are update statements, wrap them in an effect
    let update_stmts = std::mem::replace(&mut context.state.update, saved_update);
    if !update_stmts.is_empty() {
        // Wrap update statements in $.template_effect
        // Use inline arrow for single expression statements, block arrow otherwise
        let arrow_fn =
            if update_stmts.len() == 1 && matches!(update_stmts[0], JsStatement::Expression(_)) {
                // Single expression statement - use inline arrow
                if let JsStatement::Expression(expr_stmt) = &update_stmts[0] {
                    b::arrow(vec![], (*expr_stmt.expression).clone())
                } else {
                    // Fallback to block (shouldn't happen)
                    b::arrow_block(vec![], update_stmts)
                }
            } else {
                // Multiple statements or non-expression - use block arrow
                b::arrow_block(vec![], update_stmts)
            };

        result.push(b::stmt(b::call(
            b::member_path("$.template_effect"),
            vec![arrow_fn],
        )));
    }

    // Find any text variable from the init statements and add $.append at the end
    // This ensures append happens after template_effect
    let mut text_var_name: Option<String> = None;
    for stmt in result.iter() {
        if let JsStatement::VariableDeclaration(var_decl) = stmt
            && let Some(first_decl) = var_decl.declarations.first()
            && let JsPattern::Identifier(name) = &first_decl.id
            && name.starts_with("text")
        {
            text_var_name = Some(name.clone());
        }
    }

    // Add $.append($$anchor, text) at the end if we found a text variable
    if let Some(name) = text_var_name {
        result.push(b::stmt(b::call(
            b::member_path("$.append"),
            vec![b::id("$$anchor"), b::id(&name)],
        )));
    }

    // Restore the template and node
    context.state.template = saved_template;
    context.state.node = saved_node;

    result
}

/// Build the component expression for dynamic components.
fn build_component_expression(
    node: &ComponentNode,
    component_name: &str,
    context: &mut ComponentContext,
) -> JsExpr {
    match node {
        ComponentNode::Component(_) => {
            // For dynamic component identified by name
            b::member_path(component_name)
        }
        ComponentNode::SvelteComponent(comp) => {
            // Use the `this` expression
            convert_expression(&comp.expression, context)
        }
        ComponentNode::SvelteSelf(_) => {
            // Self reference - use current component
            b::id(&context.state.analysis.name)
        }
    }
}

/// Build the inner component call (without $.component wrapper).
fn build_inner_component_call(
    _component_name: &str,
    intermediate_name: &str,
    props_expression: &JsExpr,
    bind_this: Option<&Expression>,
    context: &mut ComponentContext,
) -> JsExpr {
    let callee = b::id(intermediate_name);
    let call = b::call(callee, vec![b::id("$$anchor"), props_expression.clone()]);

    if let Some(bind_expr) = bind_this {
        build_bind_this_call(bind_expr, call, context)
    } else {
        call
    }
}

/// Build the complete component call.
fn build_component_call(
    anchor: &JsExpr,
    component_name: &str,
    is_component_dynamic: bool,
    intermediate_name: &str,
    props_expression: &JsExpr,
    bind_this: Option<&Expression>,
    context: &mut ComponentContext,
) -> JsExpr {
    let callee = if is_component_dynamic {
        b::id(intermediate_name)
    } else {
        b::member_path(component_name)
    };

    let call = b::call(callee, vec![anchor.clone(), props_expression.clone()]);

    if let Some(bind_expr) = bind_this {
        build_bind_this_call(bind_expr, call, context)
    } else {
        call
    }
}

/// Build $.bind_this call.
fn build_bind_this_call(
    bind_expr: &Expression,
    value: JsExpr,
    context: &mut ComponentContext,
) -> JsExpr {
    let expression = convert_expression(bind_expr, context);

    // Check if it's a sequence expression (getter/setter pair)
    if let JsExpr::Sequence(seq) = &expression
        && seq.expressions.len() == 2
    {
        return b::call(
            b::member_path("$.bind_this"),
            vec![
                value,
                seq.expressions[1].clone(), // setter
                seq.expressions[0].clone(), // getter
            ],
        );
    }

    // Simple expression - create getter and setter
    let getter = b::arrow(vec![], expression.clone());
    let setter = b::arrow(
        vec![b::id_pattern("$$value")],
        b::assign(expression, b::id("$$value")),
    );

    b::call(b::member_path("$.bind_this"), vec![value, setter, getter])
}

/// Build component with CSS props wrapper.
#[allow(clippy::too_many_arguments)]
fn build_with_css_props(
    statements: &mut Vec<JsStatement>,
    context: &mut ComponentContext,
    anchor: &JsExpr,
    custom_css_props: &[JsObjectMember],
    component_name: &str,
    is_component_dynamic: bool,
    intermediate_name: &str,
    binding_initializers: &[JsStatement],
    props_expression: &JsExpr,
    bind_this: Option<&Expression>,
) {
    // Determine wrapper element based on namespace
    let is_svg = context.state.metadata.namespace == "svg";
    let wrapper_element = if is_svg { "g" } else { "svelte-css-wrapper" };

    // Push wrapper element
    context
        .state
        .template
        .push_element(wrapper_element.to_string(), 0);

    if !is_svg {
        context
            .state
            .template
            .set_prop("style".to_string(), Some("display: contents".to_string()));
    }

    // Push comment for component anchor
    context.state.template.push_comment(None);
    context.state.template.pop_element();

    // Add CSS props call
    statements.push(b::stmt(b::call(
        b::member_path("$.css_props"),
        vec![
            anchor.clone(),
            b::thunk(b::object(custom_css_props.to_vec())),
        ],
    )));

    // Add component call using anchor.lastChild
    let component_anchor = b::member(anchor.clone(), "lastChild");
    let component_call = build_component_call(
        &component_anchor,
        component_name,
        is_component_dynamic,
        intermediate_name,
        props_expression,
        bind_this,
        context,
    );

    statements.extend(binding_initializers.iter().cloned());
    statements.push(b::stmt(component_call));

    // Add reset call
    statements.push(b::stmt(b::call(
        b::member_path("$.reset"),
        vec![anchor.clone()],
    )));
}

/// Push a property immediately to the props list.
fn push_prop_immediate(props: &mut Vec<PropsEntry>, prop: JsObjectMember) {
    // Check if last entry is a props array we can add to
    if let Some(PropsEntry::Prop(_)) = props.last() {
        props.push(PropsEntry::Prop(prop));
    } else {
        props.push(PropsEntry::Prop(prop));
    }
}

/// Build the final props expression from props and spreads.
fn build_props_expression(props_and_spreads: Vec<PropsEntry>) -> JsExpr {
    if props_and_spreads.is_empty() {
        return b::object(vec![]);
    }

    // Collect consecutive props into objects, spreads stay separate
    let mut groups: Vec<JsExpr> = Vec::new();
    let mut current_props: Vec<JsObjectMember> = Vec::new();

    for entry in props_and_spreads {
        match entry {
            PropsEntry::Prop(prop) => {
                current_props.push(prop);
            }
            PropsEntry::Spread(expr) => {
                // Flush accumulated props
                if !current_props.is_empty() {
                    groups.push(b::object(current_props.clone()));
                    current_props.clear();
                }
                groups.push(expr);
            }
        }
    }

    // Flush remaining props
    if !current_props.is_empty() {
        groups.push(b::object(current_props));
    }

    // If only one element, return it directly
    if groups.len() == 1 {
        return groups.into_iter().next().unwrap();
    }

    // Multiple groups - use $.spread_props
    b::call(b::member_path("$.spread_props"), groups)
}

/// Add Svelte metadata wrapper for dev mode.
fn add_svelte_meta(
    expression: JsExpr,
    _node: &ComponentNode,
    _block_type: &str,
    _component_tag: &str,
) -> JsStatement {
    // TODO: Implement dev mode metadata wrapping
    // For now, just return the expression as a statement
    b::stmt(expression)
}

/// Check if expression might have state (simplified check).
fn expression_might_have_state(expr: &Expression) -> bool {
    match expr {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object() {
                // Check for call expressions, member expressions, etc.
                if let Some(expr_type) = obj.get("type").and_then(|t| t.as_str()) {
                    matches!(
                        expr_type,
                        "CallExpression" | "MemberExpression" | "ConditionalExpression"
                    )
                } else {
                    false
                }
            } else {
                false
            }
        }
    }
}

/// Extract identifier name from an expression.
fn extract_identifier_name(expr: &Expression) -> Option<String> {
    match expr {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object()
                && let Some("Identifier") = obj.get("type").and_then(|t| t.as_str())
            {
                return obj
                    .get("name")
                    .and_then(|n| n.as_str())
                    .map(|s| s.to_string());
            }
            None
        }
    }
}

/// Check if expression is a store subscription.
fn is_store_subscription(expr: &Expression, context: &ComponentContext) -> bool {
    match expr {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object()
                && let Some("Identifier") = obj.get("type").and_then(|t| t.as_str())
                && let Some(name) = obj.get("name").and_then(|n| n.as_str())
                && let Some(binding) = context.state.get_binding(name)
            {
                return binding.kind
                    == crate::compiler::phases::phase2_analyze::scope::BindingKind::StoreSub;
            }
            false
        }
    }
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

    #[test]
    fn test_build_props_expression_with_spread() {
        let props = vec![
            PropsEntry::Prop(b::prop("foo", b::string("bar"))),
            PropsEntry::Spread(b::id("spread")),
            PropsEntry::Prop(b::prop("baz", b::string("qux"))),
        ];

        let result = build_props_expression(props);

        match result {
            JsExpr::Call(_) => {
                // Should be $.spread_props call
            }
            _ => panic!("Expected call expression"),
        }
    }
}
