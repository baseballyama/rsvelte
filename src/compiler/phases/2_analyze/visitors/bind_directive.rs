//! BindDirective visitor.
//!
//! Analyzes bind: directives and validates their usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/BindDirective.js`.

use super::VisitorContext;
use super::shared::utils::validate_assignment_node;
use crate::ast::template::{AttributeValue, BindDirective, RegularElement, TemplateNode};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::binding_properties::BINDING_PROPERTIES;
use crate::compiler::phases::phase2_analyze::errors;
/// Visit a bind directive with explicit element context.
///
/// This is called from regular_element visitor when we have direct access to the element.
pub fn visit_with_element(
    directive: &BindDirective,
    element: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate binding for the element
    validate_binding_for_regular_element(&directive.name, element, context)?;

    // Continue with the rest of the validation
    visit_common(directive, context)
}

/// Visit a bind directive on a Svelte special element (svelte:window, svelte:document, etc).
///
/// This is called from special element visitors like svelte_window.
pub fn visit_with_svelte_element(
    directive: &BindDirective,
    element_name: &str,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate binding for the svelte element
    validate_binding_for_svelte_element(&directive.name, element_name)?;

    // Continue with the rest of the validation
    visit_common(directive, context)
}

/// Visit a bind directive.
///
/// Corresponds to the `BindDirective` function in BindDirective.js.
///
/// This function validates bind: directives by checking:
/// - The binding is valid for the parent element type
/// - Input types are correctly matched with bind:checked/files/group
/// - Select elements have static `multiple` attributes
/// - SVG elements don't use bind:offsetWidth
/// - contenteditable elements have appropriate bindings
///
/// # Arguments
///
/// * `directive` - The bind directive to analyze
/// * `context` - The visitor context
pub fn visit(directive: &BindDirective, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let parent = context.path.last();

    // Check if parent is a valid element type for bindings
    if let Some(parent_node) = parent {
        let parent_name = match parent_node {
            TemplateNode::RegularElement(el) => Some(el.name.as_str()),
            TemplateNode::SvelteElement(_) => Some("svelte:element"),
            TemplateNode::SvelteWindow(_) => Some("svelte:window"),
            TemplateNode::SvelteDocument(_) => Some("svelte:document"),
            TemplateNode::SvelteBody(_) => Some("svelte:body"),
            _ => None,
        };

        if let Some(parent_name) = parent_name {
            validate_binding_for_element(&directive.name, parent_name, parent_node, context)?;
        }
    }

    visit_common(directive, context)
}

/// Common validation logic for bind directives.
fn visit_common(
    directive: &BindDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Handle getter/setter syntax (SequenceExpression)
    if directive.expression.node_type() == Some("SequenceExpression") {
        if directive.name == "group" {
            return Err(AnalysisError::ValidationWithCode {
                code: "bind_group_invalid_expression".to_string(),
                message: "bind:group cannot use getter/setter syntax".to_string(),
            });
        }

        // Check for invalid parentheses in the binding expression
        // But ignore parentheses that are inside comments (leading comments before the expression)
        if let Some(start) = directive.expression.start() {
            // Get leading comments from the expression if available
            let expr_json = directive.expression.as_json();
            let leading_comments = expr_json.get("leadingComments").and_then(|c| c.as_array());

            // Calculate comment range if we have leading comments
            let comment_range: Option<(usize, usize)> = leading_comments.and_then(|comments| {
                let first_comment = comments.first()?;
                let last_comment = comments.last()?;
                let comment_start = first_comment.get("start")?.as_u64()? as usize;
                let comment_end = last_comment.get("end")?.as_u64()? as usize;
                Some((comment_start, comment_end))
            });

            let start_usize = start as usize;
            let mut i = start_usize;
            while i > 0
                && context.analysis.source.as_bytes().get(i.saturating_sub(1)) != Some(&b'{')
            {
                i -= 1;
            }

            // Check for '(' between '{' and the expression, but skip if inside a comment
            let source_bytes = context.analysis.source.as_bytes();
            let mut pos = i;
            let mut found_invalid_paren = false;

            while pos < start_usize {
                if source_bytes.get(pos) == Some(&b'(') {
                    // Check if this position is inside a comment
                    let inside_comment = comment_range
                        .is_some_and(|(c_start, c_end)| pos >= c_start && pos <= c_end);

                    if !inside_comment {
                        found_invalid_paren = true;
                        break;
                    }
                }
                pos += 1;
            }

            if found_invalid_paren {
                return Err(AnalysisError::ValidationWithCode {
                    code: "bind_invalid_parens".to_string(),
                    message: format!(
                        "bind:{} cannot have parentheses around the expression",
                        directive.name
                    ),
                });
            }
        }

        // Validate that sequence expression has exactly 2 expressions (getter and setter)
        {
            let node = directive.expression.as_node();
            let expressions = node.expressions();
            let arena = context.parse_arena;
            let expr_slice = arena.get_js_children(expressions);
            if !expr_slice.is_empty() && expr_slice.len() != 2 {
                return Err(AnalysisError::ValidationWithCode {
                    code: "bind_invalid_expression".to_string(),
                    message: "Binding with getter/setter requires exactly two functions"
                        .to_string(),
                });
            }
        }

        // Mark subtree as dynamic
        // In full implementation: mark_subtree_dynamic(context.path)

        // Visit getter and setter expressions to track assignments and dependencies
        // This is important for cases like:
        //   bind:checked={()=>check, (v)=>{ check = v }}
        // where the setter contains an assignment that marks `check` as reassigned
        {
            let node = directive.expression.as_node();
            let expressions = node.expressions();
            let arena = context.parse_arena;
            for expr in arena.get_js_children(expressions) {
                // Walk the expression to track mutations (e.g., assignments in setters).
                // Use typed dispatch to skip the `to_value()` materialization.
                super::script::walk_js_node_typed(expr, context)?;
            }
        }

        // Check for await in the expression
        // TODO: Check node.metadata.expression.has_await
        // if has_await { return Err(errors::illegal_await_expression()); }

        return Ok(());
    }

    // Validate the assignment target
    {
        let node = directive.expression.as_node();
        validate_assignment_node(&node, context, true)?;
    }

    // Get the leftmost identifier (the binding target)
    let expr_node = directive.expression.as_node();
    let binding_name_owned: String;
    let binding_name: &str = if let Some(left) = get_object_node(&expr_node, context.parse_arena) {
        left.name().unwrap_or_default()
    } else {
        // Fall back to JSON for MemberExpression chains
        binding_name_owned = get_object_name_via_json(&expr_node).unwrap_or_default();
        if binding_name_owned.is_empty() {
            return Err(AnalysisError::ValidationWithCode {
                code: "bind_invalid_expression".to_string(),
                message: "Invalid binding expression".to_string(),
            });
        }
        &binding_name_owned
    };

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

    // Re-borrow binding after mutable operations are done
    let binding = binding_idx.map(|idx| &context.analysis.root.bindings[idx]);

    // TODO: Set node.metadata.binding = binding

    // For Identifier (not MemberExpression), validate the binding kind
    if directive.expression.is_identifier_node() {
        // bind:this also works for regular variables, so skip validation for it
        if directive.name != "this" {
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
                return Err(AnalysisError::ValidationWithCode {
                    code: "bind_invalid_value".to_string(),
                    message:
                        "Can only bind to state or props\nhttps://svelte.dev/e/bind_invalid_value"
                            .to_string(),
                });
            }
        }
    }

    // Handle bind:group special logic
    if directive.name == "group"
        && let Some(binding) = binding
    {
        // Check if binding is a snippet parameter
        if matches!(
            binding.kind,
            crate::compiler::phases::phase2_analyze::BindingKind::SnippetParam
        ) {
            return Err(AnalysisError::ValidationWithCode {
                code: "bind_group_invalid_snippet_parameter".to_string(),
                message: "Cannot use bind:group with snippet parameters".to_string(),
            });
        }

        // Note: Binding group name registration (populating analysis.binding_groups) is done
        // in mod.rs's mark_each_block_group_bindings, which runs after template analysis.
        // That function uses the full keypath + EachBlock position as keys to correctly
        // differentiate between multiple bind:group directives that happen to share the
        // same variable name (e.g., two {#each x as selected} blocks with bind:group={selected}).
    }

    // Check for each block binding with rest
    // Corresponds to BindDirective.js L271-273:
    //   if (binding?.kind === 'each' && binding.metadata?.inside_rest) {
    //     w.bind_invalid_each_rest(binding.node, binding.node.name);
    //   }
    if let Some(binding) = binding
        && matches!(
            binding.kind,
            crate::compiler::phases::phase2_analyze::BindingKind::EachItem
        )
        && binding.inside_rest
    {
        context.emit_warning(
            crate::compiler::phases::phase2_analyze::warnings::bind_invalid_each_rest(
                &binding.name,
            ),
        );
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
    super::script::walk_expression(&directive.expression, context)?;
    context.in_bind_this = prev_in_bind_this;

    // TODO: Check for await in expression
    // if node.metadata.expression.has_await { return Err(errors::illegal_await_expression()); }

    Ok(())
}

/// Validate a binding for a specific element type.
fn validate_binding_for_element(
    binding_name: &str,
    parent_name: &str,
    parent_node: &TemplateNode,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    // Check if binding exists in binding_properties
    if let Some(property) = BINDING_PROPERTIES.get(binding_name) {
        // Check valid_elements
        if let Some(valid_elements) = property.valid_elements
            && !valid_elements.contains(&parent_name)
        {
            let valid_list = valid_elements
                .iter()
                .map(|e| format!("`<{e}>`"))
                .collect::<Vec<_>>()
                .join(", ");

            return Err(errors::bind_invalid_target(binding_name, &valid_list));
        }

        // Check invalid_elements
        if let Some(invalid_elements) = property.invalid_elements
            && invalid_elements.contains(&parent_name)
        {
            let valid_bindings = get_valid_bindings_for_element(parent_name);
            let message = format!(
                "Possible bindings for <{}> are {}",
                parent_name,
                valid_bindings.join(", ")
            );

            return Err(errors::bind_invalid_name(binding_name, Some(&message)));
        }

        // Special validation for <input> elements
        if parent_name == "input"
            && binding_name != "this"
            && let TemplateNode::RegularElement(element) = parent_node
        {
            validate_input_binding(binding_name, element, context)?;
        }

        // Special validation for <select> elements
        if parent_name == "select"
            && binding_name != "this"
            && let TemplateNode::RegularElement(element) = parent_node
        {
            validate_select_binding(element)?;
        }

        // Special validation for SVG elements
        if binding_name == "offsetWidth" && is_svg(parent_name) {
            return Err(errors::bind_invalid_target(
                binding_name,
                "non-`<svg>` elements. Use `bind:clientWidth` for `<svg>` instead",
            ));
        }

        // Validate contenteditable bindings
        if is_content_editable_binding(binding_name)
            && let TemplateNode::RegularElement(element) = parent_node
        {
            validate_contenteditable_binding(element)?;
        }
    } else {
        // Binding not found - try fuzzy match
        let match_name = fuzzy_match(binding_name, &get_all_binding_names());

        if let Some(match_name) = match_name
            && let Some(property) = BINDING_PROPERTIES.get(match_name)
            && (property.valid_elements.is_none()
                || property.valid_elements.unwrap().contains(&parent_name))
        {
            return Err(errors::bind_invalid_name(
                binding_name,
                Some(&format!("Did you mean '{}'?", match_name)),
            ));
        }

        return Err(errors::bind_invalid_name(binding_name, None));
    }

    Ok(())
}

/// Validate binding for a Svelte special element (svelte:window, svelte:document, svelte:body).
fn validate_binding_for_svelte_element(
    binding_name: &str,
    element_name: &str,
) -> Result<(), AnalysisError> {
    // Check if binding exists in binding_properties
    if let Some(property) = BINDING_PROPERTIES.get(binding_name) {
        // Check valid_elements
        if let Some(valid_elements) = property.valid_elements
            && !valid_elements.contains(&element_name)
        {
            // For svelte: elements, provide a list of possible bindings
            let valid_bindings = get_valid_bindings_for_element(element_name);
            let message = format!(
                "Possible bindings for <{}> are {}",
                element_name,
                valid_bindings.join(", ")
            );

            return Err(errors::bind_invalid_name(binding_name, Some(&message)));
        }

        // Check invalid_elements
        if let Some(invalid_elements) = property.invalid_elements
            && invalid_elements.contains(&element_name)
        {
            let valid_bindings = get_valid_bindings_for_element(element_name);
            let message = format!(
                "Possible bindings for <{}> are {}",
                element_name,
                valid_bindings.join(", ")
            );

            return Err(errors::bind_invalid_name(binding_name, Some(&message)));
        }
    } else {
        // Binding not found - try fuzzy match
        let match_name = fuzzy_match(binding_name, &get_all_binding_names());

        if let Some(match_name) = match_name
            && let Some(property) = BINDING_PROPERTIES.get(match_name)
            && (property.valid_elements.is_none()
                || property.valid_elements.unwrap().contains(&element_name))
        {
            return Err(errors::bind_invalid_name(
                binding_name,
                Some(&format!("Did you mean '{}'?", match_name)),
            ));
        }

        return Err(errors::bind_invalid_name(binding_name, None));
    }

    Ok(())
}

/// Validate binding for a regular element directly (without going through path).
fn validate_binding_for_regular_element(
    binding_name: &str,
    element: &RegularElement,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    let parent_name = element.name.as_str();

    // Check if binding exists in binding_properties
    if let Some(property) = BINDING_PROPERTIES.get(binding_name) {
        // Check valid_elements
        if let Some(valid_elements) = property.valid_elements
            && !valid_elements.contains(&parent_name)
        {
            let valid_list = valid_elements
                .iter()
                .map(|e| format!("`<{e}>`"))
                .collect::<Vec<_>>()
                .join(", ");

            return Err(errors::bind_invalid_target(binding_name, &valid_list));
        }

        // Check invalid_elements
        if let Some(invalid_elements) = property.invalid_elements
            && invalid_elements.contains(&parent_name)
        {
            let valid_bindings = get_valid_bindings_for_element(parent_name);
            let message = format!(
                "Possible bindings for <{}> are {}",
                parent_name,
                valid_bindings.join(", ")
            );

            return Err(errors::bind_invalid_name(binding_name, Some(&message)));
        }

        // Special validation for <input> elements
        if parent_name == "input" && binding_name != "this" {
            validate_input_binding(binding_name, element, context)?;
        }

        // Special validation for <select> elements
        if parent_name == "select" && binding_name != "this" {
            validate_select_binding(element)?;
        }

        // Special validation for SVG elements
        if binding_name == "offsetWidth" && is_svg(parent_name) {
            return Err(errors::bind_invalid_target(
                binding_name,
                "non-`<svg>` elements. Use `bind:clientWidth` for `<svg>` instead",
            ));
        }

        // Validate contenteditable bindings
        if is_content_editable_binding(binding_name) {
            validate_contenteditable_binding(element)?;
        }
    } else {
        // Binding not found - try fuzzy match
        let match_name = fuzzy_match(binding_name, &get_all_binding_names());

        if let Some(match_name) = match_name
            && let Some(property) = BINDING_PROPERTIES.get(match_name)
            && (property.valid_elements.is_none()
                || property.valid_elements.unwrap().contains(&parent_name))
        {
            return Err(errors::bind_invalid_name(
                binding_name,
                Some(&format!("Did you mean '{}'?", match_name)),
            ));
        }

        return Err(errors::bind_invalid_name(binding_name, None));
    }

    Ok(())
}

/// Validate binding for <input> elements based on their type attribute.
fn validate_input_binding(
    binding_name: &str,
    element: &crate::ast::template::RegularElement,
    _context: &VisitorContext,
) -> Result<(), AnalysisError> {
    // Find the type attribute
    let type_attr = element.attributes.iter().find_map(|attr| {
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
                return Err(AnalysisError::ValidationWithCode {
                    code: "attribute_invalid_type".to_string(),
                    message: "The 'type' attribute cannot be dynamic".to_string(),
                });
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
                    ));
                }

                // Validate bind:files
                if binding_name == "files" && type_value != "file" {
                    return Err(errors::bind_invalid_target(
                        binding_name,
                        "`<input type=\"file\">`",
                    ));
                }
            }
        }
    } else {
        // No type attribute - validate bindings that require specific types
        // Default input type is "text", so checked, files, and indeterminate are invalid
        if binding_name == "checked" {
            return Err(errors::bind_invalid_target(
                binding_name,
                "`<input type=\"checkbox\">`",
            ));
        }

        if binding_name == "files" {
            return Err(errors::bind_invalid_target(
                binding_name,
                "`<input type=\"file\">`",
            ));
        }

        if binding_name == "indeterminate" {
            return Err(errors::bind_invalid_target(
                binding_name,
                "`<input type=\"checkbox\">`",
            ));
        }
    }

    Ok(())
}

/// Validate binding for <select> elements.
fn validate_select_binding(
    element: &crate::ast::template::RegularElement,
) -> Result<(), AnalysisError> {
    // Find the multiple attribute that is dynamic (not static text, not boolean true)
    let multiple = element.attributes.iter().find(|attr| {
        if let crate::ast::template::Attribute::Attribute(a) = attr {
            if a.name == "multiple" {
                // Check if the value is dynamic (not static text and not boolean true)
                match &a.value {
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
                }
            } else {
                false
            }
        } else {
            false
        }
    });

    if multiple.is_some() {
        return Err(errors::attribute_invalid_multiple());
    }

    Ok(())
}

/// Validate contenteditable bindings.
fn validate_contenteditable_binding(
    element: &crate::ast::template::RegularElement,
) -> Result<(), AnalysisError> {
    // Find contenteditable attribute
    let contenteditable = element.attributes.iter().find_map(|attr| {
        if let crate::ast::template::Attribute::Attribute(a) = attr
            && a.name == "contenteditable"
        {
            return Some(a);
        }
        None
    });

    if contenteditable.is_none() {
        return Err(errors::attribute_contenteditable_missing());
    }

    if let Some(attr) = contenteditable
        && !is_text_attribute(attr)
        && !matches!(attr.value, AttributeValue::True(_))
    {
        return Err(errors::attribute_contenteditable_dynamic());
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
        JsNode::Raw(_) => None,
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
        _ => None,
    }
}

/// Get all valid binding names for an element.
fn get_valid_bindings_for_element(element_name: &str) -> Vec<String> {
    BINDING_PROPERTIES
        .iter()
        .filter(|(_, property)| {
            if let Some(valid) = property.valid_elements {
                valid.contains(&element_name)
            } else if let Some(invalid) = property.invalid_elements {
                !invalid.contains(&element_name)
            } else {
                true
            }
        })
        .map(|(name, _)| name.to_string())
        .collect()
}

/// Get all binding names.
fn get_all_binding_names() -> Vec<&'static str> {
    BINDING_PROPERTIES.keys().copied().collect()
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
#[allow(clippy::needless_range_loop)]
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

    for i in 0..=a_len {
        matrix[i][0] = i;
    }
    for j in 0..=b_len {
        matrix[0][j] = j;
    }

    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();

    for i in 1..=a_len {
        for j in 1..=b_len {
            let cost = if a_chars[i - 1] == b_chars[j - 1] {
                0
            } else {
                1
            };

            matrix[i][j] = (matrix[i - 1][j] + 1) // deletion
                .min(matrix[i][j - 1] + 1) // insertion
                .min(matrix[i - 1][j - 1] + cost); // substitution
        }
    }

    matrix[a_len][b_len]
}
