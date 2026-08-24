//! BindDirective visitor.
//!
//! Analyzes bind: directives and validates their usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/BindDirective.js`.

use super::VisitorContext;
use super::shared::utils::validate_assignment_node;
use crate::ast::template::{AttributeValue, BindDirective, RegularElement};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::binding_properties::{
    BINDING_PROPERTIES, all_binding_names, get_valid_bindings,
};
use crate::compiler::phases::phase2_analyze::errors;
/// Visit a bind directive with explicit element context.
///
/// This is called from regular_element visitor when we have direct access to the element.
pub fn visit_with_element(
    directive: &BindDirective,
    element: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    validate_binding_for_element(directive, &element.name, &element.attributes)?;

    // Continue with the rest of the validation
    visit_common(directive, context)
}

/// Visit a bind directive on a Svelte special element (svelte:window, svelte:document, etc).
///
/// This is called from special element visitors like svelte_window.
pub fn visit_with_svelte_element(
    directive: &BindDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit_common(directive, context)
}

/// The target half of the check, for callers that hold the attribute list
/// immutably while `visit_with_svelte_element` needs `context` mutably.
pub fn validate_binding_target(
    directive: &BindDirective,
    element_name: &str,
    attributes: &[crate::ast::template::Attribute],
) -> Result<(), AnalysisError> {
    validate_binding_for_element(directive, element_name, attributes)
}
/// Everything upstream's `BindDirective` visitor does below its `parent_type`
/// block — the half that is host-agnostic, so every host that accepts `bind:`
/// runs all of it or none of it.
pub(super) fn validate_expression_shape(
    directive: &BindDirective,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    // Handle getter/setter syntax (SequenceExpression)
    if is_get_set_pair(directive) {
        validate_get_set_pair(directive, context)?;

        // Mark subtree as dynamic
        // In full implementation: mark_subtree_dynamic(context.path)

        // Visit getter and setter expressions to track assignments and dependencies
        // This is important for cases like:
        //   bind:checked={()=>check, (v)=>{ check = v }}
        // where the setter contains an assignment that marks `check` as reassigned
        walk_get_set_pair(directive, context)?;

        return Ok(());
    }

    // Validate the assignment target
    {
        let node = directive.expression.as_node();
        validate_assignment_node((directive.start, directive.end), &node, context, true)?;
    }

    // Get the leftmost identifier (the binding target)
    let binding_name = bind_target_name(directive, context)?;
    let binding = context
        .analysis
        .root
        .get_binding(&binding_name, context.scope)
        .map(|idx| &context.analysis.root.bindings[idx]);

    // For Identifier (not MemberExpression), validate the binding kind
    validate_bind_value_identifier(directive, binding)?;

    // Handle bind:group special logic
    if directive.name == "group"
        && let Some(binding) = binding
        && matches!(
            binding.kind,
            crate::compiler::phases::phase2_analyze::BindingKind::SnippetParam
        )
    {
        return Err(
            errors::bind_group_invalid_snippet_parameter().at(directive.start, directive.end)
        );
    }

    Ok(())
}

/// Common validation logic for bind directives.
fn visit_common(
    directive: &BindDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // On an element the `BindDirective` node stays on upstream's visitor path,
    // so it grants the exemption itself.
    super::shared::attribute::record_assign_exempt_expression(context, &directive.expression, true);

    validate_expression_shape(directive, context)?;

    if directive.expression.node_type() == Some("SequenceExpression") {
        // Visit getter and setter expressions to track assignments and dependencies
        // This is important for cases like:
        //   bind:checked={()=>check, (v)=>{ check = v }}
        // where the setter contains an assignment that marks `check` as reassigned
        let node = directive.expression.as_node();
        let expressions = node.expressions();
        let arena = context.parse_arena;
        for expr in arena.get_js_children(expressions) {
            // Walk the expression to track mutations (e.g., assignments in setters).
            // Use typed dispatch to skip the `to_value()` materialization.
            super::script::walk_js_node_typed(expr, context)?;
        }

        return Ok(());
    }

    let binding_name_owned = bind_target_name(directive, context)?;
    let binding_name: &str = &binding_name_owned;

    // Look up the binding in the scope using proper scope chain traversal
    let binding_idx = context
        .analysis
        .root
        .get_binding(binding_name, context.scope);

    // Mark has_direct_template_read for non_reactive_update warning.
    // Corresponds to Svelte's 2-analyze/index.js L728-768.
    // For bind:this: only mark if the bind:this is inside a conditional block
    // (IfBlock, EachBlock, AwaitBlock, KeyBlock). At the top level, bind:this
    // doesn't need state since the element reference never changes.
    // For other binds: always mark as direct template read.
    //
    // We use block_depth > 0 to detect if we're inside a conditional/iterating block.
    // block_depth is incremented by IfBlock, EachBlock, AwaitBlock, and SnippetBlock visitors.
    if let Some(idx) = binding_idx {
        if directive.name == "this" {
            // bind:this only needs state when inside a conditional/iterating block
            if context.block_depth > 0 {
                context.analysis.root.bindings[idx].has_direct_template_read = true;
            }
        } else {
            // Non-this binds are always direct template reads
            context.analysis.root.bindings[idx].has_direct_template_read = true;
        }
    }

    // Re-borrow binding after mutable operations are done.
    // Binding group name registration (populating analysis.binding_groups) is done in
    // mod.rs's mark_each_block_group_bindings, which runs after template analysis.
    let binding = binding_idx.map(|idx| &context.analysis.root.bindings[idx]);

    // Check for each block binding with rest
    // Corresponds to BindDirective.js L271-273:
    //   if (binding?.kind === 'each' && binding.metadata?.inside_rest) {
    //     w.bind_invalid_each_rest(binding.node, binding.node.name);
    //   }
    let each_rest_name = binding
        .filter(|b| {
            matches!(
                b.kind,
                crate::compiler::phases::phase2_analyze::BindingKind::EachItem
            ) && b.inside_rest
        })
        .map(|b| b.name.clone());
    if let Some(name) = each_rest_name {
        // Upstream attributes this to `binding.node`; rsvelte's `Binding` keeps no
        // declaring-node span for each-item bindings, so recover it from the pattern.
        let mut warning =
            crate::compiler::phases::phase2_analyze::warnings::bind_invalid_each_rest(&name);
        if let Some((start, end)) = find_rest_binding_span(&name, context) {
            warning = warning.at(start, end);
        }
        context.emit_warning(warning);
    }

    // Visit child expressions to add template references
    // This is important for legacy mode state promotion - bindings need template references
    // to be promoted from 'normal' to 'state' kind.
    // Corresponds to: context.next({ ...context.state, expression: node.metadata.expression });
    //
    // For bind:this, set in_bind_this flag so that identifier::visit can skip
    // setting has_direct_template_read (bind:this has special handling).
    let prev_in_bind_this = context.in_bind_this;
    if directive.name == "this" {
        context.in_bind_this = true;
    }
    let result = walk_bind_expression(directive, context);
    context.in_bind_this = prev_in_bind_this;
    result
}

/// Whether the directive uses the `bind:x={get, set}` pair form.
pub(super) fn is_get_set_pair(directive: &BindDirective) -> bool {
    directive.expression.node_type() == Some("SequenceExpression")
}

/// The `SequenceExpression` half of upstream's `BindDirective` visitor, which
/// runs before it branches on the host. Every host must reach it: it is the only
/// place `bind:group={get, set}` is rejected, and a component reached the
/// getter/setter lowering without it.
pub(super) fn validate_get_set_pair(
    directive: &BindDirective,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    if directive.name == "group" {
        return Err(errors::bind_group_invalid_expression().at(directive.start, directive.end));
    }

    // Check for invalid parentheses in the binding expression, ignoring any
    // '(' that sits inside a comment between the opening `{` and the
    // expression. Comment regions are detected directly from the source
    // (scanning `/* … */` and `// …`) rather than from the expression's
    // `leadingComments` JSON — comment capture is off on the compile path,
    // so the typed expression carries no comment metadata here; a source
    // scan is the robust source of truth.
    if let Some(start) = directive.expression.start() {
        let start_usize = start as usize;
        let source_bytes = context.analysis.source.as_bytes();
        let mut i = start_usize;
        while i > 0 && source_bytes.get(i.saturating_sub(1)) != Some(&b'{') {
            i -= 1;
        }

        // Scan from just after `{` to the expression start, tracking comment
        // state so parens inside comments are ignored.
        let mut pos = i;
        let mut found_invalid_paren = false;
        while pos < start_usize {
            match source_bytes.get(pos) {
                Some(&b'/') if source_bytes.get(pos + 1) == Some(&b'*') => {
                    pos += 2;
                    while pos < start_usize
                        && !(source_bytes.get(pos) == Some(&b'*')
                            && source_bytes.get(pos + 1) == Some(&b'/'))
                    {
                        pos += 1;
                    }
                    pos += 2;
                }
                Some(&b'/') if source_bytes.get(pos + 1) == Some(&b'/') => {
                    pos += 2;
                    while pos < start_usize && source_bytes.get(pos) != Some(&b'\n') {
                        pos += 1;
                    }
                }
                Some(&b'(') => {
                    found_invalid_paren = true;
                    break;
                }
                _ => pos += 1,
            }
        }

        if found_invalid_paren {
            return Err(AnalysisError::validation_at(
                "bind_invalid_parens",
                format!(
                    "bind:{} cannot have parentheses around the expression",
                    directive.name
                ),
                directive.start,
                directive.end,
            ));
        }
    }

    // Validate that sequence expression has exactly 2 expressions (getter and setter)
    let node = directive.expression.as_node();
    let expr_slice = context.parse_arena.get_js_children(node.expressions());
    if !expr_slice.is_empty() && expr_slice.len() != 2 {
        return Err(errors::bind_invalid_expression().at(directive.start, directive.end));
    }

    Ok(())
}

/// Walk both halves of a `{get, set}` pair.
///
/// Upstream visits the get/set functions' **bodies** with `state.expression`
/// installed, deliberately jumping across the function so an `await` in the body
/// still suspends (`BindDirective.js` L157-170). `bind_await_depth` reproduces
/// that without re-shaping the walk: a function-like half suspends one depth in.
pub(super) fn walk_get_set_pair(
    directive: &BindDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let node = directive.expression.as_node();
    let expressions = node.expressions();
    let arena = context.parse_arena;
    let saw_await = std::mem::replace(&mut context.bind_has_await, false);
    let saved_depth = context.bind_await_depth;

    let mut result = Ok(());
    for expr in arena.get_js_children(expressions) {
        let depth = if matches!(
            expr,
            JsNode::ArrowFunctionExpression { .. } | JsNode::FunctionExpression { .. }
        ) {
            context.function_depth + 1
        } else {
            context.function_depth
        };
        context.bind_await_depth = Some(depth);
        // Walk the expression to track mutations (e.g., assignments in setters).
        // Use typed dispatch to skip the `to_value()` materialization.
        result = super::script::walk_js_node_typed(expr, context);
        if result.is_err() {
            break;
        }
    }

    context.bind_await_depth = saved_depth;
    let has_await = std::mem::replace(&mut context.bind_has_await, saw_await);
    result?;
    if has_await {
        return Err(errors::illegal_await_expression().at(directive.start, directive.end));
    }
    Ok(())
}

/// Walk a plain (non-pair) `bind:` expression the way upstream does — with
/// `state.expression` installed, so an `await` that is not inside a nested
/// function suspends.
pub(super) fn walk_bind_expression(
    directive: &BindDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let saw_await = std::mem::replace(&mut context.bind_has_await, false);
    let saved_depth = context.bind_await_depth.replace(context.function_depth);
    let result = super::script::walk_expression(&directive.expression, context);
    context.bind_await_depth = saved_depth;
    let has_await = std::mem::replace(&mut context.bind_has_await, saw_await);
    result?;
    if has_await {
        return Err(errors::illegal_await_expression().at(directive.start, directive.end));
    }
    Ok(())
}

/// Locate the declaring identifier of an each-item binding that sits inside a rest
/// element, searching the enclosing `{#each}` context patterns innermost-first.
fn find_rest_binding_span(name: &str, context: &VisitorContext) -> Option<(u32, u32)> {
    for node in context.path.iter().rev() {
        let crate::ast::template::TemplateNode::EachBlock(each) = node else {
            continue;
        };
        let Some(pattern) = each.context.as_ref().map(|c| c.as_node()) else {
            continue;
        };
        if let Some(span) = find_rest_identifier(pattern.as_ref(), name, false, context.parse_arena)
        {
            return Some(span);
        }
    }
    None
}

/// Mirrors `ScopeBuilder::declare_bindings_from_pattern_node_with_kind`'s traversal,
/// returning the span of the identifier it would have declared with `inside_rest`.
fn find_rest_identifier(
    pattern: &JsNode,
    name: &str,
    inside_rest: bool,
    arena: &crate::ast::arena::ParseArena,
) -> Option<(u32, u32)> {
    match pattern {
        JsNode::Identifier {
            name: id,
            start,
            end,
            ..
        } => (inside_rest && id.as_str() == name).then_some((*start, *end)),
        JsNode::ObjectPattern { properties, .. } | JsNode::ObjectExpression { properties, .. } => {
            arena
                .get_js_children(*properties)
                .iter()
                .find_map(|prop| match prop {
                    JsNode::RestElement { argument, .. }
                    | JsNode::SpreadElement { argument, .. } => {
                        find_rest_identifier(arena.get_js_node(*argument), name, true, arena)
                    }
                    JsNode::Property { value, .. } => {
                        find_rest_identifier(arena.get_js_node(*value), name, inside_rest, arena)
                    }
                    _ => None,
                })
        }
        JsNode::ArrayPattern { elements, .. } | JsNode::ArrayExpression { elements, .. } => {
            elements
                .iter()
                .flatten()
                .find_map(|elem| find_rest_identifier(elem, name, inside_rest, arena))
        }
        JsNode::RestElement { argument, .. } | JsNode::SpreadElement { argument, .. } => {
            find_rest_identifier(arena.get_js_node(*argument), name, true, arena)
        }
        JsNode::AssignmentPattern { left, .. } => {
            find_rest_identifier(arena.get_js_node(*left), name, inside_rest, arena)
        }
        _ => None,
    }
}

/// Validate that an Identifier `bind:x={y}` expression targets state or props.
///
/// Corresponds to BindDirective.js L193-207:
/// ```js
/// if (assignee.type === 'Identifier') {
///   if (
///     node.name !== 'this' &&
///     (!binding ||
///       (binding.kind !== 'state' && ... && !binding.updated))
///   ) {
///     e.bind_invalid_value(node.expression);
///   }
/// }
/// ```
///
/// Upstream's scope.js marks every bound identifier as `reassigned` (the bind
/// itself is an update), so with a resolved binding this effectively only
/// fires for kinds that escape that marking; with no binding (undeclared /
/// global identifier) it always fires. This check applies to bindings on
/// elements AND components alike (upstream's BindDirective visitor runs for
/// both).
pub(super) fn validate_bind_value_identifier(
    directive: &BindDirective,
    binding: Option<&crate::compiler::phases::phase2_analyze::Binding>,
) -> Result<(), AnalysisError> {
    if !directive.expression.is_identifier_node() {
        return Ok(());
    }

    // bind:this also works for regular variables, so skip validation for it
    if directive.name == "this" {
        return Ok(());
    }

    // In the official Svelte, if there's no binding, or the binding is not a valid type,
    // it should error with bind_invalid_value
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/BindDirective.js L193-207
    let is_valid = if let Some(binding) = binding {
        // In runes mode, check binding kind strictly
        // In legacy mode, `let` declarations are allowed for bindings
        // (their `updated` flag will be set during template analysis)
        let valid_kind = matches!(
            binding.kind,
            crate::compiler::phases::phase2_analyze::BindingKind::State
                | crate::compiler::phases::phase2_analyze::BindingKind::RawState
                | crate::compiler::phases::phase2_analyze::BindingKind::Prop
                | crate::compiler::phases::phase2_analyze::BindingKind::BindableProp
                | crate::compiler::phases::phase2_analyze::BindingKind::EachItem
                | crate::compiler::phases::phase2_analyze::BindingKind::StoreSub
                // Legacy mode: allow let declarations (Normal kind)
                | crate::compiler::phases::phase2_analyze::BindingKind::Normal
                | crate::compiler::phases::phase2_analyze::BindingKind::Let
        );
        // Also valid if the binding has been updated (reassigned/mutated)
        valid_kind || binding.reassigned || binding.mutated
    } else {
        // No binding found - this is an error (undefined variable)
        false
    };

    if !is_valid {
        return Err(AnalysisError::validation_at(
            "bind_invalid_value",
            "Can only bind to state or props\nhttps://svelte.dev/e/bind_invalid_value",
            directive.expression.start().unwrap_or(0),
            directive.expression.end().unwrap_or(0),
        ));
    }

    Ok(())
}

/// Resolve the binding for an Identifier bind expression and run
/// `validate_bind_value_identifier`. Used by the hosts that do not go through
/// `visit_common` — a component, `<svelte:self>` and `<svelte:element>`.
pub(super) fn validate_bind_value_target(
    directive: &BindDirective,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    // Runs before the shape branch below, or a component binding to an
    // expression that names nothing is lowered into a getter/setter instead of
    // being rejected.
    bind_target_name(directive, context)?;

    if !directive.expression.is_identifier_node() {
        return Ok(());
    }

    let expr_node = directive.expression.as_node();
    let name = expr_node.name().unwrap_or_default();
    if name.is_empty() {
        return Ok(());
    }

    let binding = context
        .analysis
        .root
        .get_binding(name, context.scope)
        .map(|idx| &context.analysis.root.bindings[idx]);

    validate_bind_value_identifier(directive, binding)
}
/// Upstream runs one `BindDirective` check for a `RegularElement`, a `SvelteElement`,
/// and `<svelte:window>` / `<svelte:document>` / `<svelte:body>` alike, keyed on the
/// element's name. Three copies of it drifted: the special-element one reported the
/// `invalid_elements` sentence for a `valid_elements` violation, and the
/// `<svelte:element>` one hard-coded four names and never reached the
/// contenteditable check.
fn validate_binding_for_element(
    directive: &BindDirective,
    element_name: &str,
    attributes: &[crate::ast::template::Attribute],
) -> Result<(), AnalysisError> {
    let binding_name = directive.name.as_str();
    let (start, end) = (directive.start, directive.end);

    let Some(property) = BINDING_PROPERTIES.get(binding_name) else {
        let match_name = fuzzy_match(binding_name, &all_binding_names());
        if let Some(match_name) = match_name
            && let Some(property) = BINDING_PROPERTIES.get(match_name)
            && (property.valid_elements.is_none()
                || property.valid_elements.unwrap().contains(&element_name))
        {
            return Err(errors::bind_invalid_name(
                binding_name,
                Some(&format!("Did you mean '{}'?", match_name)),
            )
            .at(start, end));
        }
        return Err(errors::bind_invalid_name(binding_name, None).at(start, end));
    };

    if let Some(valid_elements) = property.valid_elements
        && !valid_elements.contains(&element_name)
    {
        let valid_list = valid_elements
            .iter()
            .map(|e| format!("`<{e}>`"))
            .collect::<Vec<_>>()
            .join(", ");
        return Err(errors::bind_invalid_target(binding_name, &valid_list).at(start, end));
    }

    if let Some(invalid_elements) = property.invalid_elements
        && invalid_elements.contains(&element_name)
    {
        let message = format!(
            "Possible bindings for <{}> are {}",
            element_name,
            get_valid_bindings(element_name).join(", ")
        );
        return Err(errors::bind_invalid_name(binding_name, Some(&message)).at(start, end));
    }

    if element_name == "input" && binding_name != "this" {
        validate_input_binding(directive, attributes)?;
    }

    if element_name == "select" && binding_name != "this" {
        validate_select_binding(attributes)?;
    }

    if binding_name == "offsetWidth" && is_svg(element_name) {
        return Err(errors::bind_invalid_target(
            binding_name,
            "non-`<svg>` elements. Use `bind:clientWidth` for `<svg>` instead",
        )
        .at(start, end));
    }

    if is_content_editable_binding(binding_name) {
        validate_contenteditable_binding(directive, attributes)?;
    }

    Ok(())
}

/// Validate binding for <input> elements based on their type attribute.
fn validate_input_binding(
    directive: &BindDirective,
    attributes: &[crate::ast::template::Attribute],
) -> Result<(), AnalysisError> {
    let binding_name = directive.name.as_str();
    let (start, end) = (directive.start, directive.end);

    // Find the type attribute
    let type_attr = attributes.iter().find_map(|attr| {
        if let crate::ast::template::Attribute::Attribute(a) = attr
            && a.name == "type"
        {
            return Some(a);
        }
        None
    });

    if let Some(type_attr) = type_attr {
        // Check if type attribute is dynamic
        if !is_text_attribute(type_attr) {
            if binding_name != "value" || matches!(type_attr.value, AttributeValue::True(_)) {
                return Err(errors::attribute_invalid_type().at(type_attr.start, type_attr.end));
            }
        } else {
            // Get the static type value
            if let AttributeValue::Sequence(seq) = &type_attr.value
                && let Some(first) = seq.first()
                && let crate::ast::template::AttributeValuePart::Text(text) = first
            {
                let type_value = &text.data;

                // Validate bind:checked
                if binding_name == "checked" && type_value != "checkbox" {
                    let hint = if type_value == "radio" {
                        " — for `<input type=\"radio\">`, use `bind:group`"
                    } else {
                        ""
                    };
                    return Err(errors::bind_invalid_target(
                        binding_name,
                        &format!("`<input type=\"checkbox\">`{}", hint),
                    )
                    .at(start, end));
                }

                // Validate bind:files
                if binding_name == "files" && type_value != "file" {
                    return Err(errors::bind_invalid_target(
                        binding_name,
                        "`<input type=\"file\">`",
                    )
                    .at(start, end));
                }
            }
        }
    } else {
        // No type attribute (default `text`). Upstream only type-validates
        // `checked` and `files` here — `indeterminate` / `group` are never
        // type-checked, so binding them to a type-less input is accepted
        // (matches `BindDirective.js`). H-036.
        if binding_name == "checked" {
            return Err(
                errors::bind_invalid_target(binding_name, "`<input type=\"checkbox\">`")
                    .at(start, end),
            );
        }

        if binding_name == "files" {
            return Err(
                errors::bind_invalid_target(binding_name, "`<input type=\"file\">`").at(start, end),
            );
        }
    }

    Ok(())
}

/// Validate binding for <select> elements.
fn validate_select_binding(
    attributes: &[crate::ast::template::Attribute],
) -> Result<(), AnalysisError> {
    // Find the multiple attribute that is dynamic (not static text, not boolean true)
    let multiple = attributes.iter().find_map(|attr| {
        let crate::ast::template::Attribute::Attribute(a) = attr else {
            return None;
        };
        if a.name != "multiple" {
            return None;
        }
        // Check if the value is dynamic (not static text and not boolean true)
        let is_dynamic = match &a.value {
            AttributeValue::True(_) => false,      // Static boolean true is OK
            AttributeValue::Expression(_) => true, // Dynamic expression is an error
            AttributeValue::Sequence(seq) => {
                // Check if any part is an expression (dynamic)
                seq.iter().any(|part| {
                    matches!(
                        part,
                        crate::ast::template::AttributeValuePart::ExpressionTag(_)
                    )
                })
            }
        };
        is_dynamic.then_some(a)
    });

    if let Some(multiple) = multiple {
        return Err(errors::attribute_invalid_multiple().at(multiple.start, multiple.end));
    }

    Ok(())
}

/// Validate contenteditable bindings.
fn validate_contenteditable_binding(
    directive: &BindDirective,
    attributes: &[crate::ast::template::Attribute],
) -> Result<(), AnalysisError> {
    // Find contenteditable attribute
    let contenteditable = attributes.iter().find_map(|attr| {
        if let crate::ast::template::Attribute::Attribute(a) = attr
            && a.name == "contenteditable"
        {
            return Some(a);
        }
        None
    });

    let Some(attr) = contenteditable else {
        return Err(errors::attribute_contenteditable_missing().at(directive.start, directive.end));
    };

    if !is_text_attribute(attr) && !matches!(attr.value, AttributeValue::True(_)) {
        return Err(errors::attribute_contenteditable_dynamic().at(attr.start, attr.end));
    }

    Ok(())
}

/// Check if a binding name is a contenteditable binding.
fn is_content_editable_binding(name: &str) -> bool {
    matches!(name, "innerText" | "innerHTML" | "textContent")
}

/// Check if an element name is an SVG element.
fn is_svg(name: &str) -> bool {
    // Simplified check - in full implementation, check against complete SVG element list
    matches!(
        name,
        "svg"
            | "g"
            | "path"
            | "rect"
            | "circle"
            | "ellipse"
            | "line"
            | "polyline"
            | "polygon"
            | "text"
    )
}

/// Check if an attribute has a static text value.
fn is_text_attribute(attr: &crate::ast::template::AttributeNode) -> bool {
    if let AttributeValue::Sequence(seq) = &attr.value {
        seq.iter()
            .all(|item| matches!(item, crate::ast::template::AttributeValuePart::Text(_)))
    } else {
        false
    }
}

/// The binding's target name — upstream's `object(node.expression)`, which is
/// `null` for anything that is not an identifier or a member chain rooted in
/// one, and raises `bind_invalid_expression` there.
///
/// Element and component bindings must share it: upstream runs the check once,
/// before it branches on the shape, and a copy per branch drifts.
pub(super) fn bind_target_name(
    directive: &BindDirective,
    context: &VisitorContext,
) -> Result<String, AnalysisError> {
    let expr_node = directive.expression.as_node();
    let name = match get_object_node(&expr_node, context.parse_arena) {
        Some(left) => left.name().unwrap_or_default().to_string(),
        // Fall back to JSON for MemberExpression chains
        None => get_object_name_via_json(&expr_node).unwrap_or_default(),
    };
    if name.is_empty() {
        return Err(errors::bind_invalid_expression().at(directive.start, directive.end));
    }
    Ok(name)
}

/// Get the object (leftmost identifier) from a JsNode expression.
///
/// Corresponds to `object()` in utils/ast.js.
///
/// Resolves the leftmost identifier of an assignment-target expression by
/// walking `MemberExpression.object` via the arena. Falls back to the
/// JSON-based recursion only for `Raw(Value)` nodes (those that carry
/// `leadingComments`).
fn get_object_node<'a>(
    node: &'a JsNode,
    arena: &'a crate::ast::arena::ParseArena,
) -> Option<&'a JsNode> {
    match node {
        JsNode::Identifier { .. } => Some(node),
        JsNode::MemberExpression { object, .. } => {
            get_object_node(arena.get_js_node(*object), arena)
        }
        // Upstream analyses the AST with the TypeScript nodes already removed,
        // so `x as T` reaches `object()` as the bare `x`.
        JsNode::TSAsExpression { expression, .. }
        | JsNode::TSSatisfiesExpression { expression, .. }
        | JsNode::TSNonNullExpression { expression, .. }
        | JsNode::TSTypeAssertion { expression, .. }
        | JsNode::TSInstantiationExpression { expression, .. } => {
            get_object_node(arena.get_js_node(*expression), arena)
        }
        _ => None,
    }
}

/// JSON fallback used only when `get_object_node` encounters a `Raw(Value)`
/// node (which carries `leadingComments` so it can't be expressed as a typed
/// `JsNode` variant). Recurses through `MemberExpression.object` JSON fields.
fn get_object_name_via_json(node: &JsNode) -> Option<String> {
    let json = node.to_value();
    get_object_name_from_json(&json)
}

fn get_object_name_from_json(v: &serde_json::Value) -> Option<String> {
    let node_type = v.get("type")?.as_str()?;
    match node_type {
        "Identifier" => v.get("name").and_then(|n| n.as_str()).map(String::from),
        "MemberExpression" => {
            let obj = v.get("object")?;
            get_object_name_from_json(obj)
        }
        "TSAsExpression"
        | "TSSatisfiesExpression"
        | "TSNonNullExpression"
        | "TSTypeAssertion"
        | "TSInstantiationExpression" => get_object_name_from_json(v.get("expression")?),
        _ => None,
    }
}

/// Fuzzy match a string against a list of candidates.
///
/// Returns the best match if one is found.
fn fuzzy_match<'a>(input: &str, candidates: &[&'a str]) -> Option<&'a str> {
    let input_lower = input.to_lowercase();

    // Calculate Levenshtein distance for each candidate
    let mut best_match: Option<(&str, usize)> = None;

    for &candidate in candidates {
        let distance = levenshtein_distance(&input_lower, &candidate.to_lowercase());

        // Only consider matches with distance <= 3
        if distance <= 3 {
            if let Some((_, best_distance)) = best_match {
                if distance < best_distance {
                    best_match = Some((candidate, distance));
                }
            } else {
                best_match = Some((candidate, distance));
            }
        }
    }

    best_match.map(|(candidate, _)| candidate)
}

/// Calculate Levenshtein distance between two strings.
fn levenshtein_distance(a: &str, b: &str) -> usize {
    let a_len = a.chars().count();
    let b_len = b.chars().count();

    if a_len == 0 {
        return b_len;
    }
    if b_len == 0 {
        return a_len;
    }

    let mut matrix = vec![vec![0; b_len + 1]; a_len + 1];

    for (i, row) in matrix.iter_mut().enumerate() {
        row[0] = i;
    }
    for (j, cell) in matrix[0].iter_mut().enumerate() {
        *cell = j;
    }

    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();

    for (i, &a_char) in a_chars.iter().enumerate() {
        for (j, &b_char) in b_chars.iter().enumerate() {
            let cost = usize::from(a_char != b_char);

            matrix[i + 1][j + 1] = (matrix[i][j + 1] + 1) // deletion
                .min(matrix[i + 1][j] + 1) // insertion
                .min(matrix[i][j] + cost); // substitution
        }
    }

    matrix[a_len][b_len]
}
