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
use indexmap::IndexMap;

/// Component node types.
#[derive(Debug, Clone)]
pub enum ComponentNode {
    /// Regular component (`<MyComponent>`)
    Component(Component),
    /// Dynamic component (`<svelte:component this={...}>`)
    SvelteComponent(SvelteComponentElement),
    /// Self-reference (`<svelte:self>`)
    SvelteSelf(SvelteElement),
}

impl ComponentNode {
    /// Get the start position of the component node.
    pub fn start(&self) -> u32 {
        match self {
            ComponentNode::Component(c) => c.start,
            ComponentNode::SvelteComponent(c) => c.start,
            ComponentNode::SvelteSelf(c) => c.start,
        }
    }
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
    use crate::compiler::phases::phase3_transform::client::types::Memoizer;

    // SAFETY: Extract arena reference that can coexist with mutable context borrows.
    // The arena uses UnsafeCell internally and is append-only, so this is safe.
    let arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena =
        unsafe { &*(&context.arena as *const _) };
    let anchor = context.state.node.clone();

    let mut props_and_spreads: Vec<PropsEntry> = Vec::new();
    let mut delayed_props: Vec<DelayedProp> = Vec::new();
    let mut lets: Vec<JsStatement> = Vec::new();
    // Each entry is (name, read_source) where read_source is Some(derived_name) for
    // destructured bindings like let:thing={{num}} -> ("num", Some("thing"))
    let mut let_names: Vec<(String, Option<String>)> = Vec::new();
    let mut events: IndexMap<String, Vec<JsExpr>> = IndexMap::new();
    let mut custom_css_props: Vec<JsObjectMember> = Vec::new();
    let mut bind_this: Option<Expression> = None;
    let mut binding_initializers: Vec<JsStatement> = Vec::new();
    let mut snippet_declarations: Vec<JsStatement> = Vec::new();
    let mut serialized_slots: Vec<JsObjectMember> = Vec::new();
    let mut has_children_prop = false;

    // Create a local memoizer for this component's props
    // This stores expressions that need to be wrapped in $.derived()
    let mut memoizer = Memoizer::new();

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

    // Get ignored_codes from component node metadata (for suppressing dev warnings)
    let ignored_codes: Vec<String> = match &node {
        ComponentNode::Component(comp) => comp.metadata.ignored_codes.clone(),
        ComponentNode::SvelteComponent(comp) => comp.ignored_codes.clone(),
        _ => Vec::new(),
    };

    // Check if component has a slot property (named slot within another component)
    let slot_scope_applies_to_itself = determine_slot_from_attributes(attributes);

    // Save transforms that will be shadowed by let directives when slot_scope_applies_to_itself.
    // This allows us to restore them after the component is processed.
    let mut saved_self_slot_transforms: Vec<(String, Option<IdentifierTransform>)> = Vec::new();
    let saved_self_slot_deep_read = context.state.transform_deep_read.clone();

    // Process let directives first if slot scope applies to component itself
    // This must happen before attribute processing so transforms are available
    // for attribute expressions like `thing={data}` where `data` comes from `let:thing={data}`
    if slot_scope_applies_to_itself {
        for attribute in attributes {
            if let Attribute::LetDirective(let_dir) = attribute {
                process_let_directive(let_dir, context, &mut lets, &mut let_names);
            }
        }
        // Register transforms immediately so they're available for attribute processing
        for (name, read_source) in &let_names {
            // Save existing transform before overwriting
            saved_self_slot_transforms
                .push((name.clone(), context.state.transform.get(name).cloned()));

            context.state.transform.insert(
                name.clone(),
                crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                    read: Some(|arena, node| {
                        b::call(arena, b::member_path(arena, "$.get"), vec![node])
                    }),
                    read_source: read_source.clone(),
                    assign: None,
                    mutate: None,
                    update: None,
                    skip_proxy: false,
                    is_defined: false,
                    is_reactive: true,
                    replacement_id: None,
                },
            );
            // Let directive bindings are template-kind.
            context.state.transform_deep_read.insert(name.clone(), ());
        }
    }

    // Process each attribute
    for attribute in attributes {
        match attribute {
            Attribute::LetDirective(let_dir) if !slot_scope_applies_to_itself => {
                process_let_directive(let_dir, context, &mut lets, &mut let_names);
            }

            Attribute::OnDirective(on_dir) => {
                process_on_directive(on_dir, context, &mut events);
            }

            Attribute::SpreadAttribute(spread) => {
                process_spread_attribute(spread, context, &mut props_and_spreads, &mut memoizer);
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
                    &mut memoizer,
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
                    &ignored_codes,
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
            context.state.init.push(let_stmt.clone());
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
                    // Use method shorthand for function expression handlers
                    // e.g., `foo($$arg) { ... }` instead of `foo: function($$arg) { ... }`
                    if let JsExpr::Function(ref func) = value {
                        b::prop_method(arena, name, func.params.to_vec(), func.body.body.clone())
                    } else {
                        b::prop(arena, name, value)
                    }
                })
                .collect(),
        );
        push_prop_immediate(
            &mut props_and_spreads,
            b::prop(arena, "$$events", events_obj),
        );
    }

    // Group children by slot and process snippets
    // Use IndexMap to preserve insertion order (matches JavaScript object key order)
    let mut children: IndexMap<String, Vec<&TemplateNode>> = IndexMap::new();

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
            arena,
            &slot_children,
            &slot_name,
            slot_scope_applies_to_itself,
            &lets,
            &let_names,
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
                    serialized_slots.push(b::prop(arena, &slot_name, fn_expr));
                    // Add children prop that errors
                    push_prop_immediate(
                        &mut props_and_spreads,
                        b::prop(
                            arena,
                            "children",
                            b::member_path(arena, "$.invalid_default_snippet"),
                        ),
                    );
                } else {
                    // Use children prop
                    let wrapped_fn = if context.state.dev {
                        b::call(
                            arena,
                            b::member_path(arena, "$.wrap_snippet"),
                            vec![b::id(&context.state.analysis.name), fn_expr],
                        )
                    } else {
                        fn_expr
                    };
                    push_prop_immediate(
                        &mut props_and_spreads,
                        b::prop(arena, "children", wrapped_fn),
                    );
                    // Add $$slots.default: true
                    serialized_slots.push(b::prop(arena, &slot_name, b::boolean(true)));
                }
            } else {
                serialized_slots.push(b::prop(arena, &slot_name, fn_expr));
            }
        }
    }

    // Add $$slots if any
    if !serialized_slots.is_empty() {
        push_prop_immediate(
            &mut props_and_spreads,
            b::prop(arena, "$$slots", b::object(serialized_slots)),
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
            b::prop(arena, "$$legacy", b::boolean(true)),
        );
    }

    // Build props expression
    let props_expression = build_props_expression(arena, props_and_spreads);

    // Build the component call
    let mut statements: Vec<JsStatement> = Vec::new();
    statements.extend(snippet_declarations);

    // Add memoized deriveds (let $0 = $.derived(() => ...) statements)
    statements.extend(memoizer.deriveds(arena, context.state.analysis.runes));

    // Create the component call function
    // This follows the official Svelte pattern where a closure `fn` is progressively wrapped
    let build_call_for_anchor = |anchor_expr: JsExpr,
                                 props: &JsExpr,
                                 component_name: &str,
                                 is_dynamic: bool,
                                 intermediate: &str,
                                 bind: Option<&Expression>,
                                 ctx: &mut ComponentContext|
     -> JsExpr {
        let callee = if is_dynamic {
            b::id(intermediate)
        } else {
            // For dotted component names like "LazyWidget.Tooltip", check if the
            // first part has a read transform registered (e.g., each block items
            // need $.get() wrapping). If so, apply the transform to the base
            // and build the member expression from the transformed base.
            let parts: Vec<&str> = component_name.split('.').collect();
            if parts.len() > 1 {
                let base_name = parts[0];
                if let Some(transform) = ctx.state.transform.get(base_name) {
                    if let Some(read_fn) = transform.read {
                        // Apply the read transform to the base identifier
                        let base_expr = read_fn(arena, b::id(base_name));
                        // Build member chain: $.get(LazyWidget).Tooltip
                        let mut expr = base_expr;
                        for part in &parts[1..] {
                            expr = b::member(arena, expr, part.to_string());
                        }
                        expr
                    } else {
                        b::member_path(arena, component_name)
                    }
                } else {
                    b::member_path(arena, component_name)
                }
            } else {
                // For single-name components (like `Icon`), also apply read transforms
                // so that e.g. legacy prop getters produce `Icon()(anchor, props)`
                // instead of `Icon(anchor, props)`.
                if let Some(transform) = ctx.state.transform.get(component_name) {
                    if let Some(read_fn) = transform.read {
                        read_fn(arena, b::id(component_name))
                    } else {
                        b::member_path(arena, component_name)
                    }
                } else {
                    b::member_path(arena, component_name)
                }
            }
        };

        let call = b::call(arena, callee, vec![anchor_expr, props.clone()]);

        if let Some(bind_expr) = bind {
            build_bind_this_call(bind_expr, call, ctx)
        } else {
            call
        }
    };

    // If component is dynamic, wrap the call in $.component()
    // This wrapping happens BEFORE the CSS props check, matching the official behavior
    if is_component_dynamic {
        statements.extend(binding_initializers.clone());

        if !custom_css_props.is_empty() {
            // Handle custom CSS properties with wrapper element for dynamic component
            let is_svg = context.state.metadata.namespace == "svg";
            let wrapper_element = if is_svg { "g" } else { "svelte-css-wrapper" };

            context
                .state
                .template
                .push_element(wrapper_element.to_string(), node.start(), false);

            if !is_svg {
                context
                    .state
                    .template
                    .set_prop("style".to_string(), Some("display: contents".to_string()));
            }

            context.state.template.push_comment(None);
            context.state.template.pop_element();

            // Add CSS props call
            statements.push(b::stmt(
                arena,
                b::call(
                    arena,
                    b::member_path(arena, "$.css_props"),
                    vec![
                        anchor.clone(),
                        b::thunk(arena, b::object(custom_css_props.clone())),
                    ],
                ),
            ));

            // Build the inner component call that will be inside $.component()
            let component_anchor = b::member(arena, anchor.clone(), "lastChild");
            let inner_call = build_call_for_anchor(
                b::id("$$anchor"),
                &props_expression,
                &component_name,
                true,
                &intermediate_name,
                bind_this.as_ref(),
                context,
            );

            let dynamic_call = b::call(
                arena,
                b::member_path(arena, "$.component"),
                vec![
                    component_anchor,
                    b::thunk(
                        arena,
                        build_component_expression(&node, &component_name, context),
                    ),
                    b::arrow_block(
                        vec![b::id_pattern("$$anchor"), b::id_pattern(&intermediate_name)],
                        vec![b::stmt(arena, inner_call)],
                    ),
                ],
            );

            statements.push(b::stmt(arena, dynamic_call));

            // Add reset call
            statements.push(b::stmt(
                arena,
                b::call(
                    arena,
                    b::member_path(arena, "$.reset"),
                    vec![anchor.clone()],
                ),
            ));
        } else {
            // Normal dynamic component without CSS props
            context.state.template.push_comment(None);

            let inner_call = build_call_for_anchor(
                b::id("$$anchor"),
                &props_expression,
                &component_name,
                true,
                &intermediate_name,
                bind_this.as_ref(),
                context,
            );

            let dynamic_call = b::call(
                arena,
                b::member_path(arena, "$.component"),
                vec![
                    anchor.clone(),
                    b::thunk(
                        arena,
                        build_component_expression(&node, &component_name, context),
                    ),
                    b::arrow_block(
                        vec![b::id_pattern("$$anchor"), b::id_pattern(&intermediate_name)],
                        vec![b::stmt(arena, inner_call)],
                    ),
                ],
            );

            let meta_stmt = build_component_meta_stmt(
                arena,
                dynamic_call,
                &node,
                &context.state.analysis.name,
                context.state.dev,
                &context.state.analysis.source,
            );
            statements.push(meta_stmt);
        }
    } else {
        // Static component
        statements.extend(binding_initializers.clone());

        if !custom_css_props.is_empty() {
            // Handle custom CSS properties with wrapper element for static component
            build_with_css_props(
                &mut statements,
                context,
                &anchor,
                &custom_css_props,
                &component_name,
                false,
                &intermediate_name,
                &[],
                &props_expression,
                bind_this.as_ref(),
                node.start(),
            );
        } else {
            // Normal static component instantiation
            context.state.template.push_comment(None);

            let component_call = build_call_for_anchor(
                anchor.clone(),
                &props_expression,
                &component_name,
                false,
                &intermediate_name,
                bind_this.as_ref(),
                context,
            );

            let meta_stmt = build_component_meta_stmt(
                arena,
                component_call,
                &node,
                &context.state.analysis.name,
                context.state.dev,
                &context.state.analysis.source,
            );
            statements.push(meta_stmt);
        }
    }

    // Restore original transforms after slot_scope_applies_to_itself processing
    if slot_scope_applies_to_itself {
        for (name, saved) in &saved_self_slot_transforms {
            if let Some(original_transform) = saved {
                context
                    .state
                    .transform
                    .insert(name.clone(), original_transform.clone());
            } else {
                context.state.transform.remove(name);
            }
        }
        context.state.transform_deep_read = saved_self_slot_deep_read;
    }

    // Wrap in $.async() if there are async memoized expressions or blockers
    // This corresponds to the official Svelte compiler's async wrapping in component.js lines 514-533
    let async_values = memoizer.async_values(arena);
    let component_blockers = {
        let blocker_map = context.state.blocker_map.borrow();
        if blocker_map.is_empty() {
            None
        } else {
            // Check if any of the component's DIRECT prop expressions reference blocked variables.
            // Uses props-aware scanning that enters arrow function bodies generally but
            // skips children/$$slots callbacks (which handle their own async wrapping).
            // This mirrors the official Svelte compiler's memoizer.blockers() behavior.
            let mut component_names: Vec<compact_str::CompactString> = Vec::new();
            for stmt in &statements {
                super::super::fragment::collect_identifiers_from_statement_props(
                    stmt,
                    arena,
                    &mut component_names,
                );
            }
            // If component references bind_get/bind_set variables, trace through their
            // initializers to find blocked variables. These declarations are in init,
            // not in statements, because they need to remain in the outer scope.
            let bind_vars: Vec<compact_str::CompactString> = component_names
                .iter()
                .filter(|n| n.starts_with("bind_get") || n.starts_with("bind_set"))
                .cloned()
                .collect();
            if !bind_vars.is_empty() {
                for init_stmt in &context.state.init {
                    if let JsStatement::VariableDeclaration(decl) = init_stmt {
                        for declarator in &decl.declarations {
                            if let JsPattern::Identifier(name) = &declarator.id
                                && bind_vars.contains(name)
                                && let Some(init_expr) = declarator.init
                            {
                                super::super::fragment::collect_identifiers_from_statement_deep(
                                    &JsStatement::Expression(JsExpressionStatement {
                                        expression: init_expr,
                                    }),
                                    arena,
                                    &mut component_names,
                                );
                            }
                        }
                    }
                }
            }
            let mut blocker_indices: Vec<usize> = Vec::new();
            for name in &component_names {
                if let Some(&idx) = blocker_map.get(name.as_str())
                    && !blocker_indices.contains(&idx)
                {
                    blocker_indices.push(idx);
                }
            }
            blocker_indices.sort();
            if blocker_indices.is_empty() {
                None
            } else {
                Some(b::array(
                    blocker_indices
                        .into_iter()
                        .map(|idx| {
                            b::member_computed(arena, b::id("$$promises"), b::number(idx as f64))
                        })
                        .collect(),
                ))
            }
        }
    };

    if async_values.is_some() || component_blockers.is_some() {
        let blockers_expr = component_blockers.unwrap_or_else(|| b::undefined(arena));
        let async_values_expr = async_values.unwrap_or_else(|| b::undefined(arena));

        // Build the arrow function parameters: [$$anchor, ...async_ids]
        let mut arrow_params = vec![b::id_pattern("$$anchor")];
        for async_id in memoizer.async_ids() {
            if let JsExpr::Identifier(name) = async_id {
                arrow_params.push(b::id_pattern(name.clone()));
            }
        }

        let async_call = b::call(
            arena,
            b::member_path(arena, "$.async"),
            vec![
                anchor.clone(),
                blockers_expr,
                async_values_expr,
                b::arrow_block(arrow_params, statements),
            ],
        );

        // Replace statements with the $.async() wrapped version
        statements = vec![b::stmt(arena, async_call)];

        // When the fragment is standalone (single component without template wrapper),
        // add $.next() after $.async() to advance the cursor past the async block.
        // Corresponds to official compiler component.js lines 530-532.
        if context.state.is_standalone {
            statements.push(b::stmt(
                arena,
                b::call(arena, b::member_path(arena, "$.next"), vec![]),
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
/// Matches the official `determine_slot()` in `svelte/src/compiler/utils/slot.js`.
/// This checks for `slot="name"` attribute on element-like nodes:
/// SvelteElement, RegularElement, SvelteFragment, Component, SvelteComponent, SvelteSelf, SlotElement
fn determine_slot(node: &TemplateNode) -> Option<String> {
    let attributes = match node {
        TemplateNode::RegularElement(elem) => Some(&elem.attributes),
        TemplateNode::Component(comp) => Some(&comp.attributes),
        TemplateNode::SvelteFragment(frag) => Some(&frag.attributes),
        TemplateNode::SvelteElement(elem) => Some(&elem.attributes),
        TemplateNode::SvelteComponent(comp) => Some(&comp.attributes),
        TemplateNode::SvelteSelf(elem) => Some(&elem.attributes),
        TemplateNode::SlotElement(slot) => Some(&slot.attributes),
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
///
/// This corresponds to the `LetDirective` visitor in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/LetDirective.js`.
///
/// For simple `let:x`:
///   const x = $.derived_safe_equal(() => $$slotProps.x);  // legacy mode
///   const x = $.derived(() => $$slotProps.x);              // runes mode
///
/// For `let:x={{y, z}}` (destructured):
///   const derived_x = $.derived(() => { const { y, z } = $$slotProps.x; return { y, z }; });
///   (with transforms to read y, z from derived_x)
///
/// NOTE: This function does NOT register transforms. Transforms are registered
/// inside `build_slot_function` so they only apply to the correct slot scope.
fn process_let_directive(
    let_dir: &LetDirective,
    context: &mut ComponentContext,
    lets: &mut Vec<JsStatement>,
    let_names: &mut Vec<(String, Option<String>)>,
) {
    let prop_name = &let_dir.name;

    // Check if expression is an Identifier or null (simple case)
    let is_simple = match &let_dir.expression {
        None => true,
        Some(expr) => expr.is_identifier_node(),
    };

    if is_simple {
        // Simple case: let:x or let:x={y}
        // Get the binding name - either the expression identifier name or the directive name
        let name = match &let_dir.expression {
            Some(expr) => expr.identifier_name().unwrap_or(prop_name).to_string(),
            None => prop_name.to_string(),
        };

        // Track the name for transform registration (done in build_slot_function)
        // Simple let directives have no read_source
        let_names.push((name.clone(), None));

        // Generate: const name = $.derived_safe_equal(() => $$slotProps.prop_name)
        // or: const name = $.derived(() => $$slotProps.prop_name) in runes mode
        let derived_fn = if context.state.analysis.runes {
            "$.derived"
        } else {
            "$.derived_safe_equal"
        };

        lets.push(b::const_decl(
            &context.arena,
            &name,
            b::call(
                &context.arena,
                b::member_path(&context.arena, derived_fn),
                vec![b::thunk(
                    &context.arena,
                    b::member(&context.arena, b::id("$$slotProps"), prop_name.to_string()),
                )],
            ),
        ));
    } else {
        // Destructured case: let:x={{y, z}} or let:x={[a, b]}
        // Generates: const derived_name = $.derived(() => { let {y, z} = $$slotProps.x; return {y, z}; })
        // And tracks binding names for transform registration
        if let Some(expr) = &let_dir.expression {
            {
                let expr_type = expr.node_type().unwrap_or("");

                // Extract binding names from the expression
                let mut binding_names: Vec<compact_str::CompactString> = Vec::new();
                let node = expr.as_node();
                match &*node {
                    crate::ast::typed_expr::JsNode::ObjectExpression { properties, .. } => {
                        for prop in context.state.parse_arena.get_js_children(*properties) {
                            if let Some(key_id) = prop.key() {
                                let key = context.state.parse_arena.get_js_node(key_id);
                                if let Some(name) = key.name() {
                                    binding_names.push(name.into());
                                }
                            }
                        }
                    }
                    crate::ast::typed_expr::JsNode::ArrayExpression { elements, .. } => {
                        for elem in elements.iter().flatten() {
                            if let Some(name) = elem.name() {
                                binding_names.push(name.into());
                            }
                        }
                    }
                    _ => {
                        // Raw/other fallback
                        let val = expr.as_json();
                        if let serde_json::Value::Object(obj) = val {
                            if expr_type == "ObjectExpression"
                                && let Some(serde_json::Value::Array(props)) = obj.get("properties")
                            {
                                for prop in props {
                                    if let Some(name) = prop
                                        .get("key")
                                        .and_then(|k| k.get("name"))
                                        .and_then(|n| n.as_str())
                                    {
                                        binding_names.push(name.into());
                                    }
                                }
                            } else if expr_type == "ArrayExpression"
                                && let Some(serde_json::Value::Array(elements)) =
                                    obj.get("elements")
                            {
                                for elem in elements {
                                    if let Some(name) = elem.get("name").and_then(|n| n.as_str()) {
                                        binding_names.push(name.into());
                                    }
                                }
                            }
                        }
                    }
                }

                if !binding_names.is_empty() {
                    // Generate unique name for the derived variable
                    let derived_name = context.state.memoizer.generate_id(prop_name);

                    // Track derived_name (no read_source, it's the source itself)
                    let_names.push((derived_name.clone(), None));
                    // Track each binding name with read_source pointing to the derived variable
                    for binding_name in &binding_names {
                        let_names.push((binding_name.to_string(), Some(derived_name.to_string())));
                    }

                    // Build the destructuring pattern
                    let destructuring_pat = if expr_type == "ObjectExpression" {
                        b::object_pattern(
                            binding_names
                                .iter()
                                .map(|n| JsObjectPatternProperty::Property {
                                    key: JsPropertyKey::Identifier(n.clone()),
                                    value: b::id_pattern(n.clone()),
                                    computed: false,
                                    shorthand: true,
                                })
                                .collect(),
                        )
                    } else {
                        b::array_pattern(
                            binding_names
                                .iter()
                                .map(|n| Some(b::id_pattern(n.clone())))
                                .collect(),
                        )
                    };

                    // Build the return object: { a, b }
                    let return_obj_expr = b::object(
                        binding_names
                            .iter()
                            .map(|n| b::prop(&context.arena, n.clone(), b::id(n.clone())))
                            .collect(),
                    );

                    // Note: destructured case always uses $.derived (not $.derived_safe_equal)
                    let inner_let = b::var_decl_pattern(
                        &context.arena,
                        JsVariableKind::Let,
                        destructuring_pat,
                        Some(b::member(
                            &context.arena,
                            b::id("$$slotProps"),
                            prop_name.to_string(),
                        )),
                    );
                    let inner_return = b::return_value(&context.arena, return_obj_expr);
                    lets.push(b::const_decl(
                        &context.arena,
                        &derived_name,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.derived"),
                            vec![b::arrow_block(vec![], vec![inner_let, inner_return])],
                        ),
                    ));
                }
            }
        }
    }
}

/// Process an OnDirective (event handler).
fn process_on_directive(
    on_directive: &OnDirective,
    context: &mut ComponentContext,
    events: &mut IndexMap<String, Vec<JsExpr>>,
) {
    // If no expression, mark that component needs props for event bubbling
    // This is handled via build_event_handler which sets needs_props_from_events

    // Build base event handler
    // SAFETY: `JsArena` allocates via interior mutability (`UnsafeCell`) with
    // nodes behind stable `Box`es, so a shared `&JsArena` stays valid while
    // `context` is reborrowed mutably by `build_event_handler`. The arena
    // outlives this borrow and traversal is single-threaded (no aliasing).
    let arena_local = unsafe { &*(&context.arena as *const _) };
    let mut handler = build_event_handler(
        arena_local,
        on_directive.expression.as_ref(),
        on_directive,
        context,
    );

    // Apply once modifier
    if on_directive.modifiers.iter().any(|m| m.as_str() == "once") {
        handler = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.once"),
            vec![handler],
        );
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
    memoizer: &mut crate::compiler::phases::phase3_transform::client::types::Memoizer,
) {
    let expression = convert_expression(&spread.expression, context);

    // Check if the expression has reactive state and function calls.
    // This mirrors the official Svelte compiler behavior in component.js lines 131-146:
    //   const memoized_expression = memoizer.add(expression, attribute.metadata.expression);
    //   const is_memoized = expression !== memoized_expression;
    //   if (is_memoized || attribute.metadata.expression.has_state || attribute.metadata.expression.has_await) {
    //       props_and_spreads.push(b.thunk(is_memoized ? b.call('$.get', memoized_expression) : expression));
    //   } else {
    //       props_and_spreads.push(expression);
    //   }
    let has_state = super::utils::expression_has_reactive_state(&spread.expression, context);
    let has_call = super::utils::expression_has_call(&spread.expression, context);
    let has_await = crate::compiler::phases::phase3_transform::js_ast::builders::js_expr_has_await(
        &context.arena,
        &expression,
    );

    if has_state {
        // Apply transforms to get the proper reactive expression (e.g., state -> $.get(state))
        let transformed = super::utils::apply_transforms_to_expression(&expression, context);

        // Use memoizer to potentially wrap in $.derived_safe_equal
        let memo_id = memoizer.add(
            transformed.clone(),
            has_call,
            has_await,
            false, // memoize_if_state
            has_state,
        );

        // Check if memoization happened (memo_id is $N)
        let is_memoized = if let JsExpr::Identifier(name) = &memo_id {
            name.starts_with('$') && name.chars().skip(1).all(|c| c.is_ascii_digit())
        } else {
            false
        };

        if is_memoized {
            // Wrap in thunk with $.get()
            props_and_spreads.push(PropsEntry::Spread(b::thunk(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.get"),
                    vec![memo_id],
                ),
            )));
        } else {
            // Wrap in thunk for reactivity tracking
            props_and_spreads.push(PropsEntry::Spread(b::thunk(&context.arena, transformed)));
        }
    } else {
        // No reactive state - push the expression directly without thunk wrapping
        props_and_spreads.push(PropsEntry::Spread(expression));
    }
}

/// Process a regular attribute.
fn process_regular_attribute(
    attr: &AttributeNode,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
    custom_css_props: &mut Vec<JsObjectMember>,
    memoizer: &mut crate::compiler::phases::phase3_transform::client::types::Memoizer,
) {
    // Handle custom CSS properties (--var)
    if attr.name.starts_with("--") {
        // Build the attribute value with potential memoization
        // This matches the official Svelte behavior where CSS prop values
        // can be memoized if they contain function calls with state
        let result = build_attribute_value(&attr.value, context, |value, _metadata| value);

        // Check if this value needs memoization
        let has_call =
            super::utils::expression_has_call(&get_original_expression(&attr.value), context);
        let _has_await = false; // TODO: detect await

        // For CSS props, memoization happens when there's a call with state
        let final_value = if has_call && result.has_state {
            // Add to memoizer - this creates a derived variable
            let memo_id = memoizer.add(
                result.value.clone(),
                true,  // has_call
                false, // has_await
                false, // memoize_if_state
                true,  // has_state
            );

            // If memoization happened (memo_id is $N), wrap in $.get()
            if let JsExpr::Identifier(name) = &memo_id {
                if name.starts_with('$') && name.chars().skip(1).all(|c| c.is_ascii_digit()) {
                    b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.get"),
                        vec![memo_id],
                    )
                } else {
                    result.value
                }
            } else {
                result.value
            }
        } else {
            result.value
        };

        custom_css_props.push(b::prop(&context.arena, attr.name.as_str(), final_value));
        return;
    }

    // Per Svelte JS:
    //   const should_wrap_in_derived = metadata.has_await || get_attribute_chunks(...).some(n =>
    //     n.type === 'ExpressionTag' && n.expression.type !== 'Identifier' && n.expression.type !== 'MemberExpression');
    //   const memoized = memoizer.add(value, metadata, should_wrap_in_derived);
    //   return value !== memoized ? b.call('$.get', memoized) : value;
    //
    // We compute should_wrap_in_derived once per attribute (covers all chunks).
    let should_wrap_in_derived = attribute_has_complex_chunk(&attr.value);

    // Build attribute value with per-chunk memoization (matches JS compiler).
    // The closure is invoked for each chunk's transformed expression.
    let arena_ptr = (&context.arena) as *const _;
    let result = build_attribute_value(&attr.value, context, |value, metadata| {
        let has_await = metadata.has_await();
        let has_state = metadata.has_state();
        let has_call = metadata.has_call();
        // Use memoizer.add to determine if this chunk should become a derived
        let memo_id = memoizer.add(
            value.clone(),
            has_call,
            has_await,
            should_wrap_in_derived,
            has_state,
        );
        if let JsExpr::Identifier(name) = &memo_id {
            if name.starts_with('$') && name.chars().skip(1).all(|c| c.is_ascii_digit()) {
                // SAFETY: arena reference is valid for the duration of this call
                let arena = unsafe { &*arena_ptr };
                b::call(arena, b::member_path(arena, "$.get"), vec![memo_id])
            } else {
                value
            }
        } else {
            memo_id
        }
    });

    let final_value = result.value.clone();

    // Check if this is a reference to a snippet
    // Snippet references should always use getters because snippets are treated as having state
    // (even though they're hoisted to module level, their binding.is_function() returns false
    // because their initial type is SnippetBlock, not FunctionExpression)
    let is_snippet_reference = is_snippet_identifier(&attr.value, context);

    // A prop whose value reads an async-blocked binding (e.g.
    // `onclick={() => foo}` where `const foo = $derived(await …)`) must be
    // emitted as a getter so the child re-reads it once the promise resolves
    // (Svelte 5.56.1 #18352). Collect the value's identifiers — descending into
    // closures, since the read is inside the `() => foo` arrow — and check them
    // against the instance/`{@const}` blocker maps.
    let prop_references_blocked_binding = {
        let blocker_map = context.state.blocker_map.borrow();
        let const_blocker_map = context.state.const_blocker_map.borrow();
        if blocker_map.is_empty() && const_blocker_map.is_empty() {
            false
        } else {
            let mut names: Vec<compact_str::CompactString> = Vec::new();
            super::super::fragment::collect_ids_from_expr_props(
                &final_value,
                &context.arena,
                &mut names,
            );
            names.iter().any(|n| {
                blocker_map.contains_key(n.as_str()) || const_blocker_map.contains_key(n.as_str())
            })
        }
    };

    // Add to props
    if result.has_state || is_snippet_reference || prop_references_blocked_binding {
        // Use getter for reactive values and snippet references
        push_prop_immediate(
            props_and_spreads,
            b::getter(
                &context.arena,
                attr.name.as_str(),
                vec![b::return_value(&context.arena, final_value)],
            ),
        );
    } else {
        // Use init for static values
        push_prop_immediate(
            props_and_spreads,
            b::prop(&context.arena, attr.name.as_str(), final_value),
        );
    }
}

/// Extract the original AST expression from an AttributeValue.
fn get_original_expression(value: &AttributeValue) -> crate::ast::js::Expression {
    match value {
        AttributeValue::Expression(expr_tag) => expr_tag.expression.clone(),
        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            if let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0] {
                expr_tag.expression.clone()
            } else {
                // Text - create a dummy literal expression
                crate::ast::js::Expression::Value(serde_json::json!({
                    "type": "Literal",
                    "value": ""
                }))
            }
        }
        _ => {
            // Other cases - create a dummy literal expression
            crate::ast::js::Expression::Value(serde_json::json!({
                "type": "Literal",
                "value": ""
            }))
        }
    }
}

/// Mirrors Svelte JS `should_wrap_in_derived` for component attribute values.
/// Returns true if any chunk's expression is not a simple Identifier or MemberExpression.
fn attribute_has_complex_chunk(value: &AttributeValue) -> bool {
    match value {
        AttributeValue::Expression(expr_tag) => is_complex_expression(&expr_tag.expression),
        AttributeValue::Sequence(parts) => parts.iter().any(|p| {
            if let AttributeValuePart::ExpressionTag(expr_tag) = p {
                is_complex_expression(&expr_tag.expression)
            } else {
                false
            }
        }),
        _ => false,
    }
}

/// Check if an expression is complex (not just Identifier or MemberExpression).
///
/// Complex expressions that need memoization include:
/// - ConditionalExpression (ternary): `a ? b : c`
/// - BinaryExpression: `a + b`, `a === b`
/// - CallExpression: `foo()`
/// - LogicalExpression: `a && b`, `a || b`
/// - etc.
///
/// Simple expressions that don't need memoization include:
/// - Identifier: `foo`
/// - MemberExpression: `foo.bar`
/// - Literal: `5`, `"hello"`, `true`
/// - ArrowFunctionExpression: `() => ...`
/// - FunctionExpression: `function() { ... }`
fn is_complex_expression(expression: &crate::ast::js::Expression) -> bool {
    if let Some(expr_type) = expression.node_type() {
        // Simple expressions that don't need memoization
        !matches!(
            expr_type,
            "Identifier"
                | "MemberExpression"
                | "Literal"
                | "ArrowFunctionExpression"
                | "FunctionExpression"
        )
    } else {
        false
    }
}

/// Check if an attribute value is a simple identifier that references a snippet.
fn is_snippet_identifier(value: &AttributeValue, context: &ComponentContext) -> bool {
    // Only check for Expression type (shorthand like {foo})
    if let AttributeValue::Expression(expr_tag) = value
        && let Some(name) = expr_tag.expression.identifier_name()
    {
        return context.state.snippet_names.contains(name);
    }
    false
}

/// Process a bind directive.
fn process_bind_directive(
    bind: &BindDirective,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
    delayed_props: &mut Vec<DelayedProp>,
    bind_this: &mut Option<Expression>,
    binding_initializers: &mut Vec<JsStatement>,
    is_component_dynamic: bool,
    intermediate_name: &str,
    component_name: &str,
    ignored_codes: &[String],
) {
    // Convert the expression without transforms first
    let saved_in_bind = context.state.in_bind_directive;
    context.state.in_bind_directive = true;
    let raw_expression = convert_expression(&bind.expression, context);
    context.state.in_bind_directive = saved_in_bind;

    // Apply transforms to get the proper getter expression (e.g., $store.value -> $store().value)
    let transformed_expression =
        super::utils::apply_transforms_to_expression(&raw_expression, context);

    // In dev mode with runes, validate binding to non-reactive properties.
    // Reference: component.js lines 247-254
    if context.state.dev
        && context.state.analysis.runes
        && bind.expression.is_member_expression()
        && !ignored_codes.contains(&"binding_property_non_reactive".to_string())
    {
        super::super::bind_directive::emit_validate_binding(bind, &transformed_expression, context);
    }

    // Handle bind:this specially
    if bind.name.as_str() == "this" {
        *bind_this = Some(bind.expression.clone());
        return;
    }

    // In runes mode, when a bind directive's expression is rooted at an each block
    // item (e.g., bind:checked={partner.inTimeline}), flag the each block so it
    // emits the $$index parameter. This mirrors the official compiler's `mutate`
    // transform on each items which sets `uses_index = true`.
    if context.state.analysis.runes && !context.state.each_binding_context.is_empty() {
        use crate::compiler::phases::phase3_transform::client::visitors::bind_directive::get_expression_root_identifier;
        let expr_root = get_expression_root_identifier(&raw_expression, &context.arena);
        if let Some(ref root_name) = expr_root
            && context
                .state
                .each_item_names
                .iter()
                .any(|n| n.as_str() == root_name.as_str())
        {
            context.state.each_item_assign_or_mutate.set(true);
        }
    }

    // In legacy mode, check if we're inside an each block and use the each-block-aware getter/setter.
    // This handles patterns like `bind:value={x}` inside `{#each a as x}` on components.
    // The getter/setter needs to use `a()[$$index] = $$value` instead of a simple `x = $$value`.
    // The returned get/set are arrow functions `() => expr` and `($$value) => (body)`.
    // We extract their bodies to embed directly in the object literal getter/setter methods.
    if !context.state.analysis.runes
        && !context.state.each_binding_context.is_empty()
        && let Some((get_expr, set_expr)) =
            crate::compiler::phases::phase3_transform::client::visitors::bind_directive::build_each_block_getter_setter(
                &bind.expression,
                &raw_expression,
                context,
            )
        {
            // get_expr is a thunk arrow `() => body`. Extract the body by stripping `() => ` prefix.
            // This gives us just the expression to use in `return <expr>`.
            let get_body_str = if let JsExpr::Raw(s) = &get_expr {
                if let Some(stripped) = s.strip_prefix("() => ") {
                    stripped.to_string()
                } else {
                    s.to_string()
                }
            } else if let JsExpr::Arrow(arrow) = &get_expr
                && arrow.params.is_empty()
            {
                // For structured Arrow expressions (thunks), extract the body
                use crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr;
                match &arrow.body {
                    crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowBody::Expression(body) => {
                        generate_expr(context.arena.get_expr(*body), &context.arena)
                    }
                    crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowBody::Block(_) => {
                        generate_expr(&get_expr, &context.arena)
                    }
                }
            } else {
                // For non-raw exprs, just use them directly
                use crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr;
                generate_expr(&get_expr, &context.arena)
            };
            let getter = b::getter(&context.arena,
                bind.name.as_str(),
                vec![b::return_value(&context.arena, JsExpr::Raw(get_body_str.into()))],
            );

            if let Some(set_fn) = set_expr {
                // set_fn is a Raw `($$value) => (body)`. Extract the body by stripping
                // the `($$value) => ` prefix and outer parens, then re-wrap in parens
                // with proper formatting to match the official Svelte output.
                let set_body_str = if let JsExpr::Raw(s) = &set_fn {
                    let prefix = "($$value) => (";
                    if s.starts_with(prefix) && s.ends_with(')') {
                        // Strip the outer `($$value) => (` prefix and trailing `)`
                        let inner = &s[prefix.len()..s.len() - 1];
                        format!("(
					{}
				)", inner)
                    } else if let Some(stripped) = s.strip_prefix("($$value) => ") {
                        stripped.to_string()
                    } else {
                        s.to_string()
                    }
                } else {
                    use crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr;
                    format!("({})($$value)", generate_expr(&set_fn, &context.arena))
                };
                let setter = b::setter(&context.arena,
                    bind.name.as_str(),
                    "$$value",
                    vec![b::stmt(&context.arena, JsExpr::Raw(set_body_str.into()))],
                );
                delayed_props.push(DelayedProp { prop: getter });
                delayed_props.push(DelayedProp { prop: setter });
            } else {
                delayed_props.push(DelayedProp { prop: getter });
            }
            return;
        }

    // Check if expression is a sequence (getter/setter pair)
    if let JsExpr::Sequence(seq) = &transformed_expression
        && seq.expressions.len() == 2
    {
        let get = seq.expressions[0].clone();
        let set = seq.expressions[1].clone();

        // The getter/setter helpers are declared AND called by the same
        // conflict-resolved name. Previously the declarations hard-coded
        // `bind_get`/`bind_set` while the calls used the unique generated id
        // (`bind_get_1`, …), so a second getter/setter binding produced a call
        // to an undeclared variable. H-044.
        let get_name = context.state.memoizer.generate_id("bind_get");
        let set_name = context.state.memoizer.generate_id("bind_set");

        context
            .state
            .init
            .push(b::var_decl(&context.arena, get_name.clone(), Some(get)));
        context
            .state
            .init
            .push(b::var_decl(&context.arena, set_name.clone(), Some(set)));

        // An explicit get/set bind (`bind:x={() => a, b => …}` — a SequenceExpression)
        // is pushed in SOURCE position, NOT delayed. Upstream only delays the
        // simple `bind:x={var}` form so a later spread can't overwrite it; the
        // explicit-accessor form keeps its place so e.g.
        // `<C bind:checked={…} {...rest} />` emits `spread_props({ get/set }, () => rest)`
        // in attribute order (component.js lines 232-245 push WITHOUT delay).
        push_prop_immediate(
            props_and_spreads,
            b::getter(
                &context.arena,
                bind.name.as_str(),
                vec![b::return_value(
                    &context.arena,
                    b::call(&context.arena, b::id(get_name), vec![]),
                )],
            ),
        );
        push_prop_immediate(
            props_and_spreads,
            b::setter(
                &context.arena,
                bind.name.as_str(),
                "$$value",
                vec![b::stmt(
                    &context.arena,
                    b::call(&context.arena, b::id(set_name), vec![b::id("$$value")]),
                )],
            ),
        );

        return;
    }

    // Check if it's a direct store subscription (identifier like $store)
    let is_store_sub = is_store_subscription(&bind.expression, context);

    // Check if this is a store member expression (e.g., $store.value)
    let is_store_member = is_store_member_expression(&bind.expression, context);

    // Check if this is a state source or derived binding that needs $.get/$.set.
    // In the official compiler, the transform.assign for state, derived AND legacy
    // reactive (`$:`-declared) bindings all generate $.set(node, value) — this is
    // exactly the set `add_state_transformers` registers a `$.set` assign for
    // (is_state_source || Derived || LegacyReactive). Without LegacyReactive here,
    // a plain `bind:x={path}` whose `path` comes from `$: path = …` falls through
    // to a plain `path = $$value` assignment and loses reactivity (issue #1228).
    let is_state_binding = if let JsExpr::Identifier(name) = &raw_expression {
        if let Some(binding) = context.state.get_binding(name) {
            use crate::compiler::phases::phase2_analyze::scope::BindingKind;
            crate::compiler::phases::phase3_transform::client::utils::is_state_source(
                binding,
                context.state.analysis,
            ) || matches!(
                binding.kind,
                BindingKind::Derived | BindingKind::LegacyReactive
            )
        } else {
            false
        }
    } else {
        false
    };

    // Check if this is a prop binding that needs function call syntax
    // Props wrapped in $.prop() return a getter/setter function
    // So setting a prop should be `prop(value)` not `prop = value`
    // This applies in both legacy mode and runes mode
    let is_prop_binding = if let JsExpr::Identifier(name) = &raw_expression {
        if let Some(binding) = context.state.get_binding(name) {
            crate::compiler::phases::phase3_transform::client::utils::is_prop_source(
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
    // For store subscriptions and store member expressions, use the transformed expression
    // which already has $store -> $store() applied
    let getter_body = if is_store_sub {
        vec![
            b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.mark_store_binding"),
                    vec![],
                ),
            ),
            b::return_value(&context.arena, transformed_expression.clone()),
        ]
    } else if is_state_binding {
        // For state bindings, use $.get()
        vec![b::return_value(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.get"),
                vec![raw_expression.clone()],
            ),
        )]
    } else {
        // Use transformed expression for other cases (includes store member expressions)
        vec![b::return_value(
            &context.arena,
            transformed_expression.clone(),
        )]
    };

    let getter = b::getter(&context.arena, bind.name.as_str(), getter_body);

    // Create setter
    // For store member expressions, we need to use $.store_mutate
    let setter_body = if is_state_binding {
        // For state bindings, use $.set(value, $$value[, true])
        // The third argument (proxy flag) should only be added when:
        // 1. We're in runes mode
        // 2. The binding is NOT raw_state (which opts out of deep reactivity)
        // 3. The binding is NOT derived
        // 4. The binding is NOT a prop or bindable_prop
        // This matches the official Svelte compiler's AssignmentExpression visitor logic
        let needs_proxy = if let JsExpr::Identifier(name) = &raw_expression {
            if let Some(binding) = context.state.get_binding(name) {
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                context.state.analysis.runes
                    && !matches!(
                        binding.kind,
                        BindingKind::RawState
                            | BindingKind::Derived
                            | BindingKind::Prop
                            | BindingKind::BindableProp
                    )
            } else {
                // If we can't find the binding, default to using proxy in runes mode
                context.state.analysis.runes
            }
        } else {
            context.state.analysis.runes
        };
        let mut set_args = vec![raw_expression.clone(), b::id("$$value")];
        if needs_proxy {
            set_args.push(b::boolean(true));
        }
        let set_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.set"),
            set_args,
        );
        // If the bound state variable is ALSO store-subscribed (`$store` is
        // referenced elsewhere), writing a new value to it must unsubscribe the
        // old store so subsequent `$store` reads re-subscribe. Upstream gets
        // this for free because its setter visits the `store = $$value`
        // assignment, whose AssignmentExpression visitor wraps it in
        // `$.store_unsub($.set(...), '$store', $$stores)`. We build the `$.set`
        // directly, so apply the same wrap here.
        let setter_expr = match &raw_expression {
            JsExpr::Identifier(name) if is_var_store_subscribed(name, context) => b::call(
                &context.arena,
                b::member_path(&context.arena, "$.store_unsub"),
                vec![set_call, b::string(format!("${}", name)), b::id("$$stores")],
            ),
            _ => set_call,
        };
        vec![b::stmt(&context.arena, setter_expr)]
    } else if is_store_sub {
        // For direct store subscriptions, use $.store_set(store, $$value)
        // $store = value -> $.store_set(store, value)
        let store_name = if let JsExpr::Identifier(name) = &raw_expression {
            name.strip_prefix('$').unwrap_or(name).to_string()
        } else {
            "unknown".to_string()
        };
        vec![b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.store_set"),
                vec![b::id(&store_name), b::id("$$value")],
            ),
        )]
    } else if is_prop_binding {
        // For prop source bindings, call the prop function with the value
        // prop($$value) instead of prop = $$value
        vec![b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                raw_expression.clone(),
                vec![b::id("$$value")],
            ),
        )]
    } else if is_store_member {
        // For store member expressions like $store.value, we need:
        // $.store_mutate(store, $.untrack($store).value = $$value, $.untrack($store))
        let store_info = get_store_info_from_member(&bind.expression);
        if let Some((store_name, store_prefix)) = store_info {
            let untrack_call = b::call(
                &context.arena,
                b::member_path(&context.arena, "$.untrack"),
                vec![b::id(&store_prefix)],
            );
            // Build the assignment with $.untrack($store) as the base
            let assignment_expr = build_store_member_assignment(
                &context.arena,
                &raw_expression,
                &store_prefix,
                b::id("$$value"),
            );
            // The store *source* (first arg) is read like any other reference to
            // its binding: a prop reads as the getter call `store()`, a state /
            // mutable_source reads as `$.get(store)`, and a plain store keeps the
            // bare name. Apply the registered read transform (mirrors upstream's
            // `context.state.transform[name].read`).
            let store_source = match context.state.transform.get(&store_name) {
                Some(transform) => match transform.read {
                    Some(read_fn) => read_fn(&context.arena, b::id(&store_name)),
                    None => b::id(&store_name),
                },
                None => b::id(&store_name),
            };
            vec![b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.store_mutate"),
                    vec![store_source, assignment_expr, untrack_call],
                ),
            )]
        } else {
            // Fallback to simple assignment
            vec![b::stmt(
                &context.arena,
                b::assign(&context.arena, raw_expression.clone(), b::id("$$value")),
            )]
        }
    } else {
        // Check if this is a member expression binding where the root is a prop or state
        let member_root_info = if let JsExpr::Member(_) = &raw_expression {
            // Extract the root identifier from the member expression
            let mut root = &raw_expression;
            while let JsExpr::Member(m) = root {
                root = context.arena.get_expr(m.object);
            }
            if let JsExpr::Identifier(name) = root {
                context.state.get_binding(name).map(|binding| {
                    let is_state =
                        crate::compiler::phases::phase3_transform::client::utils::is_state_source(
                            binding,
                            context.state.analysis,
                        );
                    // In legacy mode: all prop sources wrap their mutation.
                    // In runes mode: only bindable_prop wraps its mutation (to interop with legacy parent bindings).
                    // See svelte Program.js Line 109 `mutate: (node, value) => { if (binding.kind === 'bindable_prop') ... }`
                    let is_prop_source_flag =
                        crate::compiler::phases::phase3_transform::client::utils::is_prop_source(
                            binding,
                            context.state.analysis,
                        );
                    let is_prop = is_prop_source_flag
                        && (!context.state.analysis.runes
                            || matches!(
                                binding.kind,
                                crate::compiler::phases::phase2_analyze::scope::BindingKind::BindableProp
                            ));
                    (name.clone(), is_state, is_prop)
                })
            } else {
                None
            }
        } else {
            None
        };

        if let Some((root_name, is_state, is_prop)) = member_root_info {
            // Check for reactive import first - these take priority over state/prop
            // because import bindings can be promoted to State by legacy analysis,
            // but they still need the reactive_import mutation pattern.
            let transform = context.state.transform.get(root_name.as_str());
            let is_reactive_import = transform.is_some_and(|t| t.replacement_id.is_some());

            if is_reactive_import {
                let assignment = b::assign(
                    &context.arena,
                    transformed_expression.clone(),
                    b::id("$$value"),
                );
                if let Some(t) = transform
                    && let Some(mutate_fn) = t.mutate
                    && let Some(ref replacement) = t.replacement_id
                {
                    vec![b::stmt(
                        &context.arena,
                        mutate_fn(&context.arena, b::id(replacement), assignment),
                    )]
                } else {
                    vec![b::stmt(&context.arena, assignment)]
                }
            } else if is_prop {
                // For prop member bindings in legacy mode (e.g., bind:value={values[field]}),
                // we need to call the prop function with the mutation expression and true flag:
                // values(values()[field] = $$value, true)
                // This notifies the parent component that the prop was mutated.
                // Reference: Program.js mutate handler and AssignmentExpression visitor
                let assignment = b::assign(
                    &context.arena,
                    transformed_expression.clone(),
                    b::id("$$value"),
                );
                vec![b::stmt(
                    &context.arena,
                    b::call(
                        &context.arena,
                        b::id(root_name.clone()),
                        vec![assignment, b::boolean(true)],
                    ),
                )]
            } else if is_state {
                if context.state.analysis.runes {
                    // In runes mode, replace the root with $.get(root) in the assignment:
                    // $.get(value).a = $$value
                    let assignment = b::assign(
                        &context.arena,
                        transformed_expression.clone(),
                        b::id("$$value"),
                    );
                    vec![b::stmt(&context.arena, assignment)]
                } else {
                    // In legacy mode, wrap in $.mutate():
                    // $.mutate(value, $.get(value).a = $$value)
                    let assignment = b::assign(
                        &context.arena,
                        transformed_expression.clone(),
                        b::id("$$value"),
                    );
                    vec![b::stmt(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.mutate"),
                            vec![b::id(root_name.clone()), assignment],
                        ),
                    )]
                }
            } else {
                // Root is not state or prop - check if it has a transform
                let has_transform = transform.is_some_and(|t| t.read.is_some());
                if has_transform {
                    let assignment = b::assign(
                        &context.arena,
                        transformed_expression.clone(),
                        b::id("$$value"),
                    );
                    vec![b::stmt(&context.arena, assignment)]
                } else {
                    vec![b::stmt(
                        &context.arena,
                        b::assign(&context.arena, raw_expression.clone(), b::id("$$value")),
                    )]
                }
            }
        } else {
            vec![b::stmt(
                &context.arena,
                b::assign(&context.arena, raw_expression.clone(), b::id("$$value")),
            )]
        }
    };

    let setter = b::setter(&context.arena, bind.name.as_str(), "$$value", setter_body);

    // Add as delayed props (bindings come at the end)
    delayed_props.push(DelayedProp { prop: getter });
    delayed_props.push(DelayedProp { prop: setter });

    // Dev mode: add ownership validation for bindable props
    // Reference: component.js lines 207-230
    let is_sequence_expression = bind.expression.node_type() == Some("SequenceExpression");
    let binding_ignored = ignored_codes
        .iter()
        .any(|c| c == "ownership_invalid_binding");
    if context.state.dev
        && bind.name.as_str() != "this"
        && !is_sequence_expression
        && !binding_ignored
    {
        // Get the root identifier of the binding expression
        let root_name = get_binding_root_name(&bind.expression);
        if let Some(ref root) = root_name {
            let binding = context.state.get_binding(root);
            if let Some(binding) = binding {
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                if matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp) {
                    context.state.needs_mutation_validation.set(true);
                    let comp_name = if is_component_dynamic {
                        intermediate_name
                    } else {
                        component_name
                    };
                    binding_initializers.push(b::stmt(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$$ownership_validator.binding"),
                            vec![
                                b::string(&binding.name),
                                b::id(comp_name),
                                b::thunk(&context.arena, transformed_expression.clone()),
                            ],
                        ),
                    ));
                }
            }
        }
    }
}

/// Check if expression is a member expression where the object is a store subscription.
/// E.g., $store.value or $store.nested.value
fn is_store_member_expression(expr: &Expression, context: &ComponentContext) -> bool {
    let val = expr.as_json();
    if let Some(obj) = val.as_object()
        && let Some("MemberExpression") = obj.get("type").and_then(|t| t.as_str())
    {
        // Get the root object of the member expression chain
        let root = get_member_expression_root(obj);
        if let Some(root_obj) = root
            && let Some("Identifier") = root_obj.get("type").and_then(|t| t.as_str())
            && let Some(name) = root_obj.get("name").and_then(|n| n.as_str())
            && let Some(binding) = context.state.get_binding(name)
        {
            return binding.kind
                == crate::compiler::phases::phase2_analyze::scope::BindingKind::StoreSub;
        }
    }
    false
}

/// Get the root object of a member expression chain.
fn get_member_expression_root(
    obj: &serde_json::Map<String, serde_json::Value>,
) -> Option<&serde_json::Map<String, serde_json::Value>> {
    let object = obj.get("object")?;
    if let Some(inner_obj) = object.as_object() {
        if inner_obj.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
            return get_member_expression_root(inner_obj);
        }
        return Some(inner_obj);
    }
    None
}

/// Get the store name and store prefix ($store) from a member expression.
/// Returns (store_name, $store_name) e.g., ("a", "$a")
fn get_store_info_from_member(expr: &Expression) -> Option<(String, String)> {
    let val = expr.as_json();
    if let Some(obj) = val.as_object()
        && let Some("MemberExpression") = obj.get("type").and_then(|t| t.as_str())
    {
        let root = get_member_expression_root(obj)?;
        if let Some("Identifier") = root.get("type").and_then(|t| t.as_str())
            && let Some(name) = root.get("name").and_then(|n| n.as_str())
            && name.starts_with('$')
        {
            // $store -> store
            let store_name = name[1..].to_string();
            return Some((store_name, name.to_string()));
        }
    }
    None
}

/// Build an assignment expression for store member mutation.
/// Replaces the store prefix ($store) with $.untrack($store) in the member expression.
fn build_store_member_assignment(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    expr: &JsExpr,
    store_prefix: &str,
    value: JsExpr,
) -> JsExpr {
    // Build the left side by replacing $store with $.untrack($store)
    let left = replace_store_with_untrack(arena, expr, store_prefix);
    b::assign(arena, left, value)
}

/// Replace the store identifier in an expression with $.untrack($store).
fn replace_store_with_untrack(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    expr: &JsExpr,
    store_prefix: &str,
) -> JsExpr {
    match expr {
        JsExpr::Identifier(name) if name == store_prefix => b::call(
            arena,
            b::member_path(arena, "$.untrack"),
            vec![b::id(store_prefix)],
        ),
        JsExpr::Member(member) => {
            let new_object =
                replace_store_with_untrack(arena, arena.get_expr(member.object), store_prefix);
            JsExpr::Member(JsMemberExpression {
                object: arena.alloc_expr(new_object),
                property: member.property.clone(),
                computed: member.computed,
                optional: member.optional,
            })
        }
        _ => expr.clone(),
    }
}

/// Process an attach tag.
fn process_attach_tag(
    attach: &crate::ast::template::AttachTag,
    context: &mut ComponentContext,
    props_and_spreads: &mut Vec<PropsEntry>,
) {
    let expression = convert_expression(&attach.expression, context);

    // Check if expression has reactive state using the proper check.
    // In the official Svelte compiler's phase 2 analysis (CallExpression.js lines 269-272),
    // non-pure call expressions also set has_state=true. So we need to check both
    // expression_has_reactive_state AND expression_has_call to match the official behavior.
    let has_state = super::utils::expression_has_reactive_state(&attach.expression, context);
    let has_call = super::utils::expression_has_call(&attach.expression, context);

    let final_expr = if has_state || has_call {
        // Apply transforms to the expression to convert state references to $.get() calls
        // e.g., attachment(message) -> attachment($.get(message))
        let transformed = super::utils::apply_transforms_to_expression(&expression, context);

        // Wrap in arrow function for reactive attach
        // The structure is: ($$node) => (expression || $.noop)($$node)
        // The logical OR wraps the expression, and the result is called with $$node
        b::arrow(
            &context.arena,
            vec![b::id_pattern("$$node")],
            b::call(
                &context.arena,
                b::logical(
                    &context.arena,
                    JsLogicalOp::Or,
                    transformed,
                    b::member_path(&context.arena, "$.noop"),
                ),
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
            key: JsPropertyKey::Computed(context.arena.alloc_expr(b::call(
                &context.arena,
                b::member_path(&context.arena, "$.attachment"),
                vec![],
            ))),
            value: context.arena.alloc_expr(final_expr),
            kind: JsPropertyKind::Init,
            computed: true,
            shorthand: false,
            method: false,
        }),
    );
}

/// Process a snippet block.
fn process_snippet_block(
    snippet: &SnippetBlock,
    context: &mut ComponentContext,
    snippet_declarations: &mut Vec<JsStatement>,
    props_and_spreads: &mut Vec<PropsEntry>,
    serialized_slots: &mut Vec<JsObjectMember>,
) {
    // Use the snippet_block visitor to generate the full snippet function
    // This properly handles the snippet body, parameters, and placement
    use crate::compiler::phases::phase3_transform::client::visitors::snippet_block::snippet_block;

    // Visit the snippet - this will add the snippet declaration to the appropriate
    // collection (module_level_snippets, instance_level_snippets, or init)
    snippet_block(snippet, context);

    // Extract name from expression (should be an Identifier)
    let snippet_name =
        extract_identifier_name(&snippet.expression).unwrap_or_else(|| "snippet".to_string());

    // The snippet_block visitor has already added the declaration to the context.
    // For component children snippets, we need to:
    // 1. Pop the declaration from wherever it was placed (since we're inside a component)
    // 2. Add it to our snippet_declarations instead
    // 3. Add the snippet as a prop to the component

    // Pop the declaration from the appropriate collection.
    // When snippets are inside a component (template_nesting_level > 0),
    // they go to `snippets` rather than module/instance level collections.
    let declaration = if snippet.metadata.can_hoist {
        context.state.module_level_snippets.pop()
    } else {
        // Try snippets first (for non-root snippets inside components),
        // then instance_level_snippets, then init
        context
            .state
            .snippets
            .pop()
            .or_else(|| context.state.instance_level_snippets.pop())
            .or_else(|| context.state.init.pop())
    };

    if let Some(decl) = declaration {
        snippet_declarations.push(decl);
    }

    // Add the snippet as a prop to the component
    push_prop_immediate(
        props_and_spreads,
        b::prop(&context.arena, &snippet_name, b::id(&snippet_name)),
    );

    // Add to serialized slots for $$slots object
    let slot_name = if snippet_name == "children" {
        "default".to_string()
    } else {
        snippet_name
    };
    serialized_slots.push(b::prop(&context.arena, &slot_name, b::boolean(true)));
}

/// Build a slot function for children.
///
/// Corresponds to the slot serialization logic in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/component.js`
/// (lines 354-383).
fn build_slot_function(
    _arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    children: &[&TemplateNode],
    slot_name: &str,
    slot_scope_applies_to_itself: bool,
    lets: &[JsStatement],
    let_names: &[(String, Option<String>)],
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    if children.is_empty() {
        return None;
    }

    // Determine if let directive transforms should be active for this slot.
    // Let directives on a component apply to:
    // - The default slot (when slot_scope_applies_to_itself is false)
    // - The component itself (when slot_scope_applies_to_itself is true, handled elsewhere)
    // Named slots do NOT receive let directive transforms from the component.
    let should_apply_let_transforms =
        !let_names.is_empty() && (slot_name == "default" || slot_scope_applies_to_itself);

    // Save existing transforms that will be shadowed by let directives,
    // so we can restore them after visiting children.
    // This is critical because let directives may shadow outer bindings
    // (e.g., `let:box` shadows the outer `box` prop), and we must restore
    // the original transform after the slot scope ends.
    let mut saved_transforms: Vec<(
        String,
        Option<crate::compiler::phases::phase3_transform::client::types::IdentifierTransform>,
    )> = Vec::new();
    let saved_deep_read = context.state.transform_deep_read.clone();

    // Register let directive transforms if this is the appropriate slot
    if should_apply_let_transforms {
        for (name, read_source) in let_names {
            // Save the existing transform (if any) before overwriting
            let existing = context.state.transform.get(name).cloned();
            saved_transforms.push((name.clone(), existing));

            context.state.transform.insert(
                name.clone(),
                crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                    read: Some(|arena, node| {
                        b::call(arena, b::member_path(arena, "$.get"), vec![node])
                    }),
                    read_source: read_source.clone(),
                    assign: None,
                    mutate: None,
                    update: None,
                    skip_proxy: false,
                    is_defined: false,
                    is_reactive: true,
                    replacement_id: None,
                },
            );
            // Let directive bindings are template-kind.
            context.state.transform_deep_read.insert(name.clone(), ());
        }
    }

    // Visit the children and collect generated statements
    // This pattern mirrors visit_fragment in snippet_block.rs
    let child_statements = visit_slot_children(children, context);

    // Restore original transforms after visiting children
    if should_apply_let_transforms {
        for (name, saved) in &saved_transforms {
            if let Some(original_transform) = saved {
                context
                    .state
                    .transform
                    .insert(name.clone(), original_transform.clone());
            } else {
                context.state.transform.remove(name);
            }
        }
        context.state.transform_deep_read = saved_deep_read;
    }

    // If no statements were generated, return None
    if child_statements.is_empty() {
        return None;
    }

    // Build the slot function body
    let mut body: Vec<JsStatement> = Vec::new();

    // Add let directives for default slot (only if slot scope doesn't apply to component itself)
    if slot_name == "default" && !slot_scope_applies_to_itself {
        for let_stmt in lets {
            body.push(let_stmt.clone());
        }
    }

    // Add the visited children statements
    body.extend(child_statements);

    Some(b::arrow_block(
        vec![b::id_pattern("$$anchor"), b::id_pattern("$$slotProps")],
        body,
    ))
}

/// Public wrapper for visit_slot_children, used by SlotElement visitor.
pub fn visit_slot_children_pub(
    children: &[&TemplateNode],
    context: &mut ComponentContext,
) -> Vec<JsStatement> {
    visit_slot_children(children, context)
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
/// 3. For single element case, create template and append
/// 4. For other cases, use the process_children pattern
fn visit_slot_children(
    children: &[&TemplateNode],
    context: &mut ComponentContext,
) -> Vec<JsStatement> {
    use crate::compiler::phases::phase3_transform::client::transform_template::Namespace;
    use crate::compiler::phases::phase3_transform::utils::clean_nodes;

    // SAFETY: `JsArena` allocates via interior mutability (`UnsafeCell`) with
    // nodes behind stable `Box`es, so a shared `&JsArena` stays valid while
    // `context` is reborrowed mutably below. The arena outlives this borrow
    // and traversal is single-threaded (no aliasing).
    let arena_local2: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena =
        unsafe { &*(&context.arena as *const _) };

    // Convert &[&TemplateNode] to Vec<TemplateNode> for clean_nodes
    let nodes: Vec<TemplateNode> = children.iter().map(|n| (*n).clone()).collect();

    // Slot content is its own fragment, so its namespace is RE-INFERRED from the
    // children (a component is a namespace-reset boundary), NOT inherited from
    // the component's position. e.g. `<Svg><Group><circle/><Text/></Group></Svg>`
    // — `Svg`/`Group` are components, so the inherited namespace is still `html`,
    // but the `<circle>` makes the slot fragment `svg`. `clean_nodes` needs this
    // namespace so the SVG `can_remove_entirely` whitespace rule fires (drop the
    // whitespace between `<circle/>` and `<Text/>` rather than collapsing it to a
    // space) — matching the `$.from_svg` template built below from the same
    // inferred namespace.
    let inferred_ns = crate::compiler::phases::phase3_transform::utils::infer_namespace(
        &context.state.metadata.namespace,
        crate::compiler::phases::phase3_transform::utils::ParentRef::None,
        &nodes,
        context.state.analysis,
        true,
    );

    // Clean the nodes (trim whitespace, etc.)
    let cleaned = clean_nodes(
        crate::compiler::phases::phase3_transform::utils::ParentRef::None, // No parent in slot context
        &nodes,
        &context.path,
        inferred_ns,
        context.state.scope,
        context.state.analysis,
        context.state.preserve_whitespace,
        context.state.options.preserve_comments,
    );

    // If no trimmed nodes and no hoisted nodes, return empty
    if cleaned.trimmed.is_empty() && cleaned.hoisted.is_empty() {
        return Vec::new();
    }

    // Save the current state
    // This mirrors Fragment.js which creates a new state with fresh consts, init, update, etc.
    let saved_init = std::mem::take(&mut context.state.init);
    let saved_update = std::mem::take(&mut context.state.update);
    let saved_after_update = std::mem::take(&mut context.state.after_update);
    // The slot content is its own fragment: upstream's Fragment visitor clones
    // the transform map (`transform: { ...state.transform }`), so transforms
    // registered while visiting slot content (e.g. a slot-level `{@const}`)
    // must not leak to sibling slots / later components.
    let saved_transform = context.state.transform.clone();
    let saved_transform_deep_read = context.state.transform_deep_read.clone();
    let saved_template = context.state.template.clone();
    let saved_node = context.state.node.clone();
    let saved_hoisted = std::mem::take(&mut context.state.hoisted);
    let saved_consts = std::mem::take(&mut context.state.consts);
    let saved_let_directives = std::mem::take(&mut context.state.let_directives);
    let saved_async_consts = context.state.async_consts.take();
    let saved_is_standalone = context.state.is_standalone;
    context.state.is_standalone = false;
    let new_memoizer =
        crate::compiler::phases::phase3_transform::client::types::Memoizer::with_parent_conflicts(
            &context.state.memoizer,
        );
    let saved_memoizer = std::mem::replace(&mut context.state.memoizer, new_memoizer);

    // Reset template for slot content
    context.state.template =
        crate::compiler::phases::phase3_transform::client::transform_template::Template::new();

    // Set the node to $$anchor - this is the anchor passed to the slot function
    // The slot function signature is ($$anchor, $$slotProps) => { ... }
    context.state.node = b::id("$$anchor");

    // Process hoisted nodes (ConstTag, DebugTag, etc.)
    // This mirrors Fragment.js which visits hoisted nodes before processing trimmed nodes.
    for hoisted_node in &cleaned.hoisted {
        context.visit_node(hoisted_node.as_ref(), None);
    }

    // Track close statement ($.append) - this should come AFTER after_update
    // per Fragment.js order: init -> update -> after_update -> close
    let mut close_statement: Option<JsStatement> = None;

    // Post-Svelte 5.56.0 (#18320): the hoisted template identifier is now
    // allocated lazily inside `transform_template`, so we don't reserve a
    // "root" slot speculatively here. Slots that need no template don't burn a
    // name, and identical templates across siblings share one hoisted factory.

    // Check if single element (mirrors Fragment.js line 47)
    let is_single_element = cleaned.trimmed.len() == 1
        && matches!(*cleaned.trimmed[0], TemplateNode::RegularElement(_));

    // Handle single element case (mirrors Fragment.js lines 82-98)
    if is_single_element {
        if let TemplateNode::RegularElement(element) = &*cleaned.trimmed[0] {
            // Generate unique id for the element
            let id_name = context.state.memoizer.generate_id(&element.name);
            let id = b::id(&id_name);

            // Set node to the element id and visit
            context.state.node = id.clone();
            let _result = context.visit_node(cleaned.trimmed[0].as_ref(), None);

            // Transform template using the state's template
            // This creates the hoisted template expression like: var root_1 = $.from_html(`<input slot="slot1"/>`);
            // Uses the template_name that was reserved at the start of this function.
            // Determine namespace from the element itself, not the parent context.
            // For example, a <line> element inside a component slot is SVG even if
            // the parent context is HTML.
            let namespace = if element.metadata.svg {
                Namespace::Svg
            } else if element.metadata.mathml {
                Namespace::Mathml
            } else {
                match context.state.metadata.namespace.as_str() {
                    "svg" => Namespace::Svg,
                    "mathml" => Namespace::Mathml,
                    _ => Namespace::Html,
                }
            };

            // A single-element slot whose root is a custom element / `<video>`
            // (visited just above) sets `needs_import_node`; the template must
            // carry the `USE_IMPORT_NODE` flag (`2`) so cloning upgrades the
            // custom element — mirrors the top-level single-element fragment
            // path. This branch previously hardcoded `flags = None`.
            let flags = if context.state.template.needs_import_node {
                Some(2u32) // TEMPLATE_USE_IMPORT_NODE
            } else {
                None
            };

            // Build the template expression using transform_template
            // which handles dev mode $.add_locations wrapping, lazy id naming
            // and template dedup (Svelte 5.56.0 #18320).
            let template_id_expr = crate::compiler::phases::phase3_transform::client::transform_template::transform_template(
                &context.arena,
                &mut context.state,
                "root",
                namespace,
                flags,
                None,
            );

            // Add: var <id_name> = root();
            context.state.init.insert(
                0,
                b::var_decl(
                    &context.arena,
                    &id_name,
                    Some(b::call(&context.arena, template_id_expr, vec![])),
                ),
            );

            // Track $.append as close statement (added after after_update)
            close_statement = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), b::id(&id_name)],
                ),
            ));
        }
    } else if cleaned.trimmed.len() == 1
        && matches!(
            *cleaned.trimmed[0],
            TemplateNode::SvelteFragment(_) | TemplateNode::TitleElement(_)
        )
    {
        // Single child not needing template (SvelteFragment or TitleElement).
        // Mirrors Fragment.js `is_single_child_not_needing_template` check.
        // SvelteFragment is a transparent wrapper - just visit it directly
        // and let it handle its own template/init/close.
        context.visit_node(cleaned.trimmed[0].as_ref(), None);
    } else if cleaned.trimmed.len() == 1 && matches!(*cleaned.trimmed[0], TemplateNode::Text(_)) {
        // Special case: single text node
        // This mirrors the official Fragment.js behavior (lines 100-103):
        // const id = b.id(context.state.scope.generate('text'));
        // state.init.unshift(b.var(id, b.call('$.text', b.literal(trimmed[0].data))));
        // close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
        if let TemplateNode::Text(text) = &*cleaned.trimmed[0] {
            // Add $.next() to skip the comment marker
            // This is because is_text_first is true for single text nodes in slot context
            context.state.init.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.next"),
                    vec![],
                ),
            ));

            // Generate unique id for the text node
            let id_name = context.state.memoizer.generate_id("text");

            // Create: var text = $.text('data')
            context.state.init.push(b::var_decl(
                &context.arena,
                &id_name,
                Some(b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.text"),
                    vec![b::string(text.data.to_string())],
                )),
            ));

            // Create: $.append($$anchor, text)
            context.state.init.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), b::id(&id_name)],
                ),
            ));
        }
    } else if !cleaned.trimmed.is_empty() {
        // For non-standalone cases, follow Fragment.js pattern (upstream gates
        // this branch on `trimmed.length > 0` — a slot whose content is ONLY
        // hoisted nodes like `{@const}` emits no template / fragment / append):
        // 1. Create fragment variable
        // 2. Use process_children with $.first_child(fragment) as initial expression
        // 3. Check if template is single comment -> use $.comment()
        // 4. Otherwise create unique template
        // 5. Add $.append($$anchor, fragment) at end
        use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;

        // Generate fragment id
        let fragment_id_name = context.state.memoizer.generate_id("fragment");
        let fragment_id = b::id(&fragment_id_name);

        // Check for use_space_template pattern: text + expression tags only
        let use_space_template = cleaned
            .trimmed
            .iter()
            .any(|node| matches!(node.as_ref(), TemplateNode::ExpressionTag(_)))
            && cleaned.trimmed.iter().all(|node| {
                matches!(
                    node.as_ref(),
                    TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
                )
            });

        if use_space_template {
            // Special case — we can use `$.text` instead of creating a unique template
            let text_id_name = context.state.memoizer.generate_id("text");
            let text_id = b::id(&text_id_name);

            let text_id_clone = text_id.clone();
            process_children(
                &cleaned.trimmed,
                move |_is_text| text_id_clone.clone(),
                false,
                context,
            );

            // Add $.next() before var text = $.text() when is_text_first is true
            // This skips over the comment marker inserted during SSR for hydration
            if cleaned.is_text_first {
                context.state.init.insert(
                    0,
                    b::stmt(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.next"),
                            vec![],
                        ),
                    ),
                );
            }

            context.state.init.insert(
                if cleaned.is_text_first { 1 } else { 0 },
                b::var_decl(
                    &context.arena,
                    &text_id_name,
                    Some(b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.text"),
                        vec![],
                    )),
                ),
            );

            close_statement = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), text_id],
                ),
            ));
        } else if cleaned.is_standalone {
            // Standalone case: single component/render tag doesn't need template processing.
            // Mirrors Fragment.js line 127-131: `process_children(trimmed, () => b.id('$$anchor'), ...)`
            // The fragment_id generated above is intentionally discarded (matches official compiler
            // which also discards the id in this branch, consuming a conflict slot).
            context.state.is_standalone = true;
            let _ = fragment_id; // Explicitly discard generated fragment id
            for node in &cleaned.trimmed {
                let result = context.visit_node(node.as_ref(), None);
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
            // Standard case: use fragment with $.first_child pattern
            //
            // Uses the template_name that was reserved at the start of this function.
            // This ensures outer templates get lower numbers than inner templates.
            let fragment_id_for_closure = fragment_id.clone();
            process_children(
                &cleaned.trimmed,
                move |is_text: bool| {
                    if is_text {
                        b::call(
                            arena_local2,
                            b::member_path(arena_local2, "$.first_child"),
                            vec![
                                fragment_id_for_closure.clone(),
                                b::literal(JsLiteral::Boolean(true)),
                            ],
                        )
                    } else {
                        b::call(
                            arena_local2,
                            b::member_path(arena_local2, "$.first_child"),
                            vec![fragment_id_for_closure.clone()],
                        )
                    }
                },
                false,
                context,
            );

            // Check if template is single comment node
            // This is common for slot content that only contains blocks like {#if}
            use crate::compiler::phases::phase3_transform::client::transform_template::types::Node;

            if context.state.template.nodes.len() == 1
                && matches!(context.state.template.nodes.first(), Some(Node::Comment(_)))
            {
                // Special case — we can use `$.comment` instead of creating a unique template
                context.state.init.insert(
                    0,
                    b::var_decl(
                        &context.arena,
                        &fragment_id_name,
                        Some(b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.comment"),
                            vec![],
                        )),
                    ),
                );
            } else {
                // Standard template case (template_name was reserved at the start of this function)

                // Reuse the namespace inferred from the raw slot children above
                // (the same value `clean_nodes` was given), so the emitted
                // `$.from_svg` / `$.from_html` template and the whitespace
                // trimming agree.
                let namespace = match inferred_ns {
                    "svg" => Namespace::Svg,
                    "mathml" => Namespace::Mathml,
                    _ => Namespace::Html,
                };

                // Build the template expression using transform_template
                // which handles dev mode $.add_locations wrapping
                let mut flags = 1u32; // TEMPLATE_FRAGMENT
                if context.state.template.needs_import_node {
                    flags |= 2; // TEMPLATE_USE_IMPORT_NODE
                }

                let template_id_expr = crate::compiler::phases::phase3_transform::client::transform_template::transform_template(
                    &context.arena,
                    &mut context.state,
                    "root",
                    namespace,
                    Some(flags),
                    None,
                );

                context.state.init.insert(
                    0,
                    b::var_decl(
                        &context.arena,
                        &fragment_id_name,
                        Some(b::call(&context.arena, template_id_expr, vec![])),
                    ),
                );
            }

            // Add $.next() to skip inserted comment when text-first
            // This mirrors Fragment.js: if (is_text_first) body.push(b.stmt(b.call('$.next')));
            // $.next() must come BEFORE the fragment declaration so we insert at position 0.
            if cleaned.is_text_first {
                context.state.init.insert(
                    0,
                    b::stmt(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.next"),
                            vec![],
                        ),
                    ),
                );
            }

            close_statement = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), fragment_id],
                ),
            ));
        }
    }

    // Collect results following Fragment.js ordering:
    // body.push(...state.snippets, ...state.let_directives, ...state.consts);
    // body.push(...state.init);
    // if (state.update.length > 0) body.push(build_render_statement(&context.arena, state));
    // body.push(...state.after_update);
    // body.push(close);

    let mut result: Vec<JsStatement> = Vec::new();

    // Emit `let:` directive declarations BEFORE `{@const}` declarations so
    // `{@const}` bodies can reference let: bindings on slotted elements.
    // Mirrors Svelte 5.55.10 / 5.56.0 #18271 fix (Fragment.js ordering:
    // `body.push(...state.snippets, ...state.let_directives, ...state.consts)`).
    let slot_let_directives =
        std::mem::replace(&mut context.state.let_directives, saved_let_directives);
    result.extend(slot_let_directives);

    // Add consts (from ConstTag declarations) before init
    // This mirrors Fragment.js line 159: body.push(...state.consts)
    let slot_consts = std::mem::replace(&mut context.state.consts, saved_consts);
    result.extend(slot_consts);

    // Handle async_consts
    let slot_async_consts = std::mem::replace(&mut context.state.async_consts, saved_async_consts);
    if let Some(async_consts) = slot_async_consts
        && !async_consts.thunks.is_empty()
    {
        result.push(b::var_decl(
            &context.arena,
            "__async_consts",
            Some(b::call(
                &context.arena,
                b::member_path(&context.arena, "$.run"),
                vec![b::array(async_consts.thunks)],
            )),
        ));
    }

    // Restore the transform maps (slot-local transforms end here)
    context.state.transform = saved_transform;
    context.state.transform_deep_read = saved_transform_deep_read;

    // Add init statements
    let init_stmts = std::mem::replace(&mut context.state.init, saved_init);
    result.extend(init_stmts);

    // If there are update statements, wrap them in a template_effect
    // Use memoizer to extract dependencies when available (template_effect hoisting)
    let update_stmts = std::mem::replace(&mut context.state.update, saved_update);
    let slot_memoizer = std::mem::replace(&mut context.state.memoizer, saved_memoizer);
    // Merge conflicts from the slot memoizer back to the parent memoizer so that
    // subsequent slots (e.g., named slots) don't reuse identifiers like $$element
    // that were generated inside a previous slot.
    context.state.memoizer.merge_conflicts(&slot_memoizer);
    if !update_stmts.is_empty() {
        if slot_memoizer.has_memoized() {
            // Use memoized dependency hoisting:
            // $.template_effect(($0, $1) => { ... }, [() => expr1, () => expr2])
            let params = slot_memoizer.get_params();
            let sync_values = slot_memoizer.sync_values(&context.arena);
            let async_values = slot_memoizer.async_values(&context.arena);
            result.push(b::stmt(&context.arena,
                crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_render_statement_with_memoizer(&context.arena, update_stmts,
                    params,
                    sync_values,
                    async_values,
                    None, // blockers
                ),
            ));
        } else {
            // Simple case: $.template_effect(() => { ... })
            let arrow_fn = if update_stmts.len() == 1
                && matches!(update_stmts[0], JsStatement::Expression(_))
            {
                if let JsStatement::Expression(expr_stmt) = &update_stmts[0] {
                    b::arrow(
                        &context.arena,
                        vec![],
                        context.arena.get_expr(expr_stmt.expression).clone(),
                    )
                } else {
                    b::arrow_block(vec![], update_stmts)
                }
            } else {
                b::arrow_block(vec![], update_stmts)
            };

            result.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.template_effect"),
                    vec![arrow_fn],
                ),
            ));
        }
    }

    // Add after_update statements (transitions, animations, etc.)
    // These come after init and update, but before close ($.append)
    let after_update_stmts = std::mem::replace(&mut context.state.after_update, saved_after_update);
    result.extend(after_update_stmts);

    // Add close statement ($.append) at the very end
    // This follows Fragment.js order: consts -> init -> update -> after_update -> close
    if let Some(close) = close_statement {
        result.push(close);
    }

    // Merge hoisted (slot template declarations) into global hoisted
    // These need to be at module level, not inside the slot function
    let slot_hoisted = std::mem::replace(&mut context.state.hoisted, saved_hoisted);
    context.state.hoisted.extend(slot_hoisted);

    // Restore the template, node, and is_standalone
    context.state.template = saved_template;
    context.state.node = saved_node;
    context.state.is_standalone = saved_is_standalone;

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
            // Check if the identifier is a non-source prop that should be accessed via $$props.name
            // This handles cases like `const { component: Test } = $props()` where
            // <Test> should resolve to $$props.component (using prop_alias)
            if let Some(binding) = context.state.get_binding(component_name) {
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                if matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp) {
                    let is_source =
                        crate::compiler::phases::phase3_transform::client::utils::is_prop_source(
                            binding,
                            context.state.analysis,
                        );
                    if !is_source {
                        let prop_name = binding.prop_alias.as_deref().unwrap_or(component_name);
                        return JsExpr::Member(JsMemberExpression {
                            object: context
                                .arena
                                .alloc_expr(JsExpr::Identifier("$$props".into())),
                            property: JsMemberProperty::Identifier(prop_name.into()),
                            computed: false,
                            optional: false,
                        });
                    }
                }
            }
            // Apply transforms to handle derived values (const B = $derived(A) -> $.get(B))
            //
            // Svelte 5.55.6 (upstream commit `e00944ffd` "fix: correctly compile
            // component member expressions for SSR") + the matching client
            // change in `b.member_id(component_name)`: when the component name
            // is a dotted path like `state.x.Y`, build the equivalent
            // `MemberExpression` chain so transforms only apply to the root
            // identifier (e.g. `$.get(state).x.Y`).
            let parts: Vec<&str> = component_name.split('.').collect();
            if parts.len() > 1 {
                let base_expr = b::id(parts[0]);
                let mut expr = super::utils::apply_transforms_to_expression(&base_expr, context);
                for part in &parts[1..] {
                    expr = b::member(&context.arena, expr, part.to_string());
                }
                expr
            } else {
                let id_expr = b::id(component_name);
                super::utils::apply_transforms_to_expression(&id_expr, context)
            }
        }
        ComponentNode::SvelteComponent(comp) => {
            // Use the `this` expression
            // First convert to JsExpr, then apply transforms to handle props and state
            let expr = convert_expression(&comp.expression, context);
            super::utils::apply_transforms_to_expression(&expr, context)
        }
        ComponentNode::SvelteSelf(_) => {
            // Self reference - use current component
            b::id(&context.state.analysis.name)
        }
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
        // Apply read transforms for single-name components (e.g. legacy prop getters)
        let parts: Vec<&str> = component_name.split('.').collect();
        if parts.len() > 1 {
            let base_name = parts[0];
            if let Some(transform) = context.state.transform.get(base_name) {
                if let Some(read_fn) = transform.read {
                    let base_expr = read_fn(&context.arena, b::id(base_name));
                    let mut expr = base_expr;
                    for part in &parts[1..] {
                        expr = b::member(&context.arena, expr, part.to_string());
                    }
                    expr
                } else {
                    b::member_path(&context.arena, component_name)
                }
            } else {
                b::member_path(&context.arena, component_name)
            }
        } else if let Some(transform) = context.state.transform.get(component_name) {
            if let Some(read_fn) = transform.read {
                read_fn(&context.arena, b::id(component_name))
            } else {
                b::member_path(&context.arena, component_name)
            }
        } else {
            b::member_path(&context.arena, component_name)
        }
    };

    let call = b::call(
        &context.arena,
        callee,
        vec![anchor.clone(), props_expression.clone()],
    );

    if let Some(bind_expr) = bind_this {
        build_bind_this_call(bind_expr, call, context)
    } else {
        call
    }
}

/// Build $.bind_this call for components.
/// Delegates to the unified bind_this implementation which properly handles
/// each-block context variables, sequence expressions, and all binding kinds.
fn build_bind_this_call(
    bind_expr: &Expression,
    value: JsExpr,
    context: &mut ComponentContext,
) -> JsExpr {
    crate::compiler::phases::phase3_transform::client::visitors::bind_directive::unified_build_bind_this(
        bind_expr, value, context, false, // Components are not element bindings
    )
}

/// Build component with CSS props wrapper.
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
    component_start: u32,
) {
    // Determine wrapper element based on namespace
    let is_svg = context.state.metadata.namespace == "svg";
    let wrapper_element = if is_svg { "g" } else { "svelte-css-wrapper" };

    // Push wrapper element - use the component's start position for location tracking
    context
        .state
        .template
        .push_element(wrapper_element.to_string(), component_start, false);

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
    statements.push(b::stmt(
        &context.arena,
        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.css_props"),
            vec![
                anchor.clone(),
                b::thunk(&context.arena, b::object(custom_css_props.to_vec())),
            ],
        ),
    ));

    // Add component call using anchor.lastChild
    let component_anchor = b::member(&context.arena, anchor.clone(), "lastChild");
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
    statements.push(b::stmt(&context.arena, component_call));

    // Add reset call
    statements.push(b::stmt(
        &context.arena,
        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.reset"),
            vec![anchor.clone()],
        ),
    ));
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
fn build_props_expression(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    props_and_spreads: Vec<PropsEntry>,
) -> JsExpr {
    if props_and_spreads.is_empty() {
        return b::object(vec![]);
    }

    // Check if we only have props (no spreads)
    let all_props = props_and_spreads
        .iter()
        .all(|entry| matches!(entry, PropsEntry::Prop(_)));

    if all_props {
        // All entries are props, just build an object
        let props: Vec<JsObjectMember> = props_and_spreads
            .into_iter()
            .filter_map(|entry| match entry {
                PropsEntry::Prop(prop) => Some(prop),
                PropsEntry::Spread(_) => None,
            })
            .collect();
        return b::object(props);
    }

    // We have spreads, need to use $.spread_props
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

    // Always use $.spread_props when spreads are involved
    b::call(arena, b::member_path(arena, "$.spread_props"), groups)
}

/// Add Svelte metadata wrapper for dev mode.
///
/// Note: Parameters removed to avoid unnecessary cloning.
/// Build a component instantiation statement with dev-mode metadata.
/// In dev mode, wraps with $.add_svelte_meta() for ownership tracking.
fn build_component_meta_stmt(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    expression: JsExpr,
    node: &ComponentNode,
    analysis_name: &str,
    dev: bool,
    source: &str,
) -> JsStatement {
    if !dev {
        return b::stmt(arena, expression);
    }

    let (start, tag_name) = match node {
        ComponentNode::Component(comp) => (comp.start, comp.name.to_string()),
        ComponentNode::SvelteComponent(comp) => (comp.start, "svelte:component".to_string()),
        ComponentNode::SvelteSelf(_) => (0, "svelte:self".to_string()),
    };

    let (line, col) = super::super::attribute::locate_in_source(source, start as usize);

    super::utils::add_svelte_meta_dev(
        arena,
        expression,
        "component",
        analysis_name,
        line,
        col,
        Some(vec![("componentTag".to_string(), b::string(&tag_name))]),
        dev,
    )
}

// NOTE: expression_might_have_state was removed in favor of
// super::utils::expression_has_reactive_state which properly checks bindings.

/// Extract identifier name from an expression.
fn extract_identifier_name(expr: &Expression) -> Option<String> {
    expr.identifier_name().map(|s| s.to_string())
}

/// Get the root identifier name from an expression, traversing through member expressions.
/// E.g., `obj.foo.bar` returns `"obj"`, `obj` returns `"obj"`, other types return None.
fn get_binding_root_name(expr: &Expression) -> Option<String> {
    // Fast path for common identifier case
    if let Some(name) = expr.identifier_name() {
        return Some(name.to_string());
    }
    // Fall back to JSON for member expression chain traversal
    get_root_identifier_from_json(expr.as_json())
}

fn get_root_identifier_from_json(val: &serde_json::Value) -> Option<String> {
    let obj = val.as_object()?;
    match obj.get("type")?.as_str()? {
        "Identifier" => obj.get("name")?.as_str().map(|s| s.to_string()),
        "MemberExpression" => {
            let object = obj.get("object")?;
            get_root_identifier_from_json(object)
        }
        _ => None,
    }
}

/// Check if expression is a store subscription.
fn is_store_subscription(expr: &Expression, context: &ComponentContext) -> bool {
    if let Some(name) = expr.identifier_name()
        && let Some(binding) = context.state.get_binding(name)
    {
        return binding.kind
            == crate::compiler::phases::phase2_analyze::scope::BindingKind::StoreSub;
    }
    false
}

/// Whether the local variable `name` is also auto-subscribed as a store — i.e.
/// `$<name>` is referenced somewhere, creating a `StoreSub` binding named
/// `$<name>`. Used to decide whether a `bind:` write to a store-holding state
/// variable needs a `$.store_unsub(...)` wrap.
fn is_var_store_subscribed(name: &str, context: &ComponentContext) -> bool {
    context
        .state
        .get_binding(&format!("${}", name))
        .is_some_and(|b| {
            b.kind == crate::compiler::phases::phase2_analyze::scope::BindingKind::StoreSub
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;

    #[test]
    fn test_build_props_expression_empty() {
        let arena = JsArena::new();
        let props = build_props_expression(&arena, vec![]);

        match props {
            JsExpr::Object(obj) => {
                assert_eq!(obj.properties.len(), 0);
            }
            _ => panic!("Expected object expression"),
        }
    }

    #[test]
    fn test_build_props_expression_single_prop() {
        let arena = JsArena::new();
        let props = vec![PropsEntry::Prop(b::prop(&arena, "foo", b::string("bar")))];

        let result = build_props_expression(&arena, props);

        match result {
            JsExpr::Object(obj) => {
                assert_eq!(obj.properties.len(), 1);
            }
            _ => panic!("Expected object expression"),
        }
    }

    #[test]
    fn test_build_props_expression_with_spread() {
        let arena = JsArena::new();
        let props = vec![
            PropsEntry::Prop(b::prop(&arena, "foo", b::string("bar"))),
            PropsEntry::Spread(b::id("spread")),
            PropsEntry::Prop(b::prop(&arena, "baz", b::string("qux"))),
        ];

        let result = build_props_expression(&arena, props);

        match result {
            JsExpr::Call(_) => {
                // Should be $.spread_props call
            }
            _ => panic!("Expected call expression"),
        }
    }
}
