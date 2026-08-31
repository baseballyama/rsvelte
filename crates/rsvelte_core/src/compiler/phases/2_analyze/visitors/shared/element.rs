//! Element validation utilities.
//!
//! Functions for validating elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/element.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use super::attribute::{
    get_attribute_expression, is_expression_attribute, validate_attribute, validate_attribute_name,
    validate_slot_attribute,
};
use crate::ast::template::Attribute;
use crate::compiler::phases::phase2_analyze::{errors, warnings};
use regex::Regex;
use std::sync::LazyLock;

/// Event modifiers that are valid for on: directives.
pub const EVENT_MODIFIERS: &[&str] = &[
    "preventDefault",
    "stopPropagation",
    "stopImmediatePropagation",
    "capture",
    "once",
    "passive",
    "nonpassive",
    "self",
    "trusted",
];

/// Regex for illegal attribute characters.
/// Corresponds to `regex_illegal_attribute_character` in patterns.js.
static REGEX_ILLEGAL_ATTRIBUTE_CHARACTER: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[0-9-.])|[\^$@%&#?!|()\[\]{}^*+~;]").unwrap());

/// React attributes that should be corrected to Svelte equivalents.
fn get_react_attribute_correction(name: &str) -> Option<&'static str> {
    match name {
        "className" => Some("class"),
        "htmlFor" => Some("for"),
        _ => None,
    }
}

/// Validate an element and its attributes.
///
/// Corresponds to `validate_element` in the JavaScript implementation.
/// Takes the attribute list rather than the element, because upstream runs this
/// from both `RegularElement` and `SvelteElement` and the body reads nothing else.
pub fn validate_element(
    attributes: &[Attribute],
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let mut has_animate_directive = false;
    let mut in_transition: Option<usize> = None;
    let mut out_transition: Option<usize> = None;

    for (idx, attribute) in attributes.iter().enumerate() {
        let (attr_start, attr_end) = attribute.span();
        match attribute {
            Attribute::Attribute(attr) => {
                let is_expression = is_expression_attribute(attr);

                if context.analysis.runes {
                    validate_attribute(attr)?;

                    if is_expression && let Some(expression_tag) = get_attribute_expression(attr) {
                        // Check for SequenceExpression
                        if let Some(expr_type) = expression_tag.expression.node_type()
                            && expr_type == "SequenceExpression"
                        {
                            // Check if it's parenthesized
                            if let Some(start) = expression_tag.expression.start() {
                                let mut i = start as usize;
                                let mut is_parenthesized = false;

                                while i > 0 {
                                    i -= 1;
                                    if i >= context.analysis.source.len() {
                                        break;
                                    }
                                    let byte = context.analysis.source.as_bytes().get(i).copied();
                                    match byte {
                                        Some(b'(') => {
                                            is_parenthesized = true;
                                            break;
                                        }
                                        Some(b'{') => {
                                            break;
                                        }
                                        _ => {}
                                    }
                                }

                                if !is_parenthesized {
                                    let error = errors::attribute_invalid_sequence_expression();
                                    let error = match expression_tag
                                        .expression
                                        .start()
                                        .zip(expression_tag.expression.end())
                                    {
                                        Some((start, end)) => error.at(start, end),
                                        None => error,
                                    };
                                    return Err(error);
                                }
                            }
                        }
                    }
                }

                // Check for illegal characters in attribute name
                if REGEX_ILLEGAL_ATTRIBUTE_CHARACTER.is_match(&attr.name) {
                    return Err(errors::attribute_invalid_name(&attr.name).at(attr_start, attr_end));
                }

                // Check for event handlers
                if attr.name.starts_with("on") && attr.name.len() > 2 && !is_expression {
                    return Err(errors::attribute_invalid_event_handler().at(attr_start, attr_end));
                }

                // Check for global event reference
                // When an event attribute's value is an Identifier with the same name as the attribute
                // and that identifier is not in scope, it references globalThis.onXXX
                if attr.name.starts_with("on")
                    && attr.name.len() > 2
                    && let Some(expression_tag) = get_attribute_expression(attr)
                    && let Some(expr_type) = expression_tag.expression.node_type()
                    && expr_type == "Identifier"
                    && let Some(name) = expression_tag.expression.identifier_name()
                    && name == attr.name
                    && context.analysis.root.find_binding_any_scope(name).is_none()
                {
                    context.emit_warning(
                        warnings::attribute_global_event_reference(&attr.name)
                            .at(attr_start, attr_end),
                    );
                }

                // Validate slot attribute
                if attr.name == "slot" {
                    validate_slot_attribute(context, attr)?;
                }

                // Warn about 'is' attribute
                if attr.name == "is" {
                    context.emit_warning(warnings::attribute_avoid_is().at(attr_start, attr_end));
                }

                // Check for React-style attributes
                if let Some(correct_name) = get_react_attribute_correction(&attr.name) {
                    context.emit_warning(
                        super::super::super::warnings::attribute_invalid_property_name(
                            &attr.name,
                            correct_name,
                        )
                        .at(attr_start, attr_end),
                    );
                }

                validate_attribute_name(attr)?;
            }
            Attribute::AnimateDirective(_directive) => {
                // Check that we're directly inside an EachBlock using the each_block_stack
                // The top of the stack should be Some(EachBlockContext) if we're a direct child
                // Reference: shared/element.js L93 — the test is on the element's
                // immediate parent, so a block between it and the `{#each}` counts
                // (`each_block_stack` is only cleared by an intervening element).
                let parent_is_each = matches!(
                    context.fragment_owner_stack.last(),
                    Some(super::super::FragmentOwnerType::EachBlock)
                );
                match context.each_block_stack.last().filter(|_| parent_is_each) {
                    Some(Some(each_ctx)) => {
                        if !each_ctx.has_key {
                            return Err(errors::animation_missing_key().at(attr_start, attr_end));
                        }

                        if each_ctx.child_count > 1 {
                            return Err(
                                errors::animation_invalid_placement().at(attr_start, attr_end)
                            );
                        }
                    }
                    _ => {
                        // Not directly inside an EachBlock (either outside or nested in another element)
                        return Err(errors::animation_invalid_placement().at(attr_start, attr_end));
                    }
                }

                if has_animate_directive {
                    return Err(errors::animation_duplicate().at(attr_start, attr_end));
                } else {
                    has_animate_directive = true;
                }
            }
            Attribute::TransitionDirective(directive) => {
                // Check for duplicate transitions
                let existing = if directive.intro && in_transition.is_some() {
                    in_transition
                } else if directive.outro && out_transition.is_some() {
                    out_transition
                } else {
                    None
                };

                if let Some(existing_idx) = existing {
                    // Get the existing directive to determine conflict type
                    if let Some(Attribute::TransitionDirective(existing_dir)) =
                        attributes.get(existing_idx)
                    {
                        let a = if existing_dir.intro {
                            if existing_dir.outro {
                                "transition"
                            } else {
                                "in"
                            }
                        } else {
                            "out"
                        };

                        let b = if directive.intro {
                            if directive.outro { "transition" } else { "in" }
                        } else {
                            "out"
                        };

                        if a == b {
                            return Err(errors::transition_duplicate(a).at(attr_start, attr_end));
                        } else {
                            return Err(errors::transition_conflict(a, b).at(attr_start, attr_end));
                        }
                    }
                }

                if directive.intro {
                    in_transition = Some(idx);
                }
                if directive.outro {
                    out_transition = Some(idx);
                }
            }
            Attribute::OnDirective(directive) => {
                // Validate event modifiers
                let mut has_passive_modifier = false;
                let mut conflicting_passive_modifier = "";

                for modifier in &directive.modifiers {
                    if !EVENT_MODIFIERS.contains(&modifier.as_str()) {
                        let list = format!(
                            "{} or {}",
                            EVENT_MODIFIERS[..EVENT_MODIFIERS.len() - 1].join(", "),
                            EVENT_MODIFIERS.last().unwrap()
                        );
                        return Err(AnalysisError::validation_at(
                            "event_handler_invalid_modifier",
                            format!("Valid event modifiers are {}", list),
                            attr_start,
                            attr_end,
                        ));
                    }

                    if modifier == "passive" {
                        has_passive_modifier = true;
                    } else if modifier == "nonpassive" || modifier == "preventDefault" {
                        conflicting_passive_modifier = modifier;
                    }

                    if has_passive_modifier && !conflicting_passive_modifier.is_empty() {
                        return Err(AnalysisError::validation_at(
                            "event_handler_invalid_modifier_combination",
                            format!(
                                "The 'passive' and '{}' modifiers cannot be used together",
                                conflicting_passive_modifier
                            ),
                            attr_start,
                            attr_end,
                        ));
                    }
                }
            }
            _ => {
                // Other directives don't need validation here
            }
        }
    }

    Ok(())
}

/// What the CSS matcher needs to know about one element's attribute list.
#[derive(Default)]
pub struct CssAttributeFacts {
    pub classes: rustc_hash::FxHashSet<String>,
    pub id: Option<String>,
    pub static_attributes: Vec<(String, Option<String>)>,
    pub dynamic_attribute_names: rustc_hash::FxHashSet<String>,
    pub has_spread: bool,
    pub has_class_directive: bool,
    pub class_directive_names: rustc_hash::FxHashSet<String>,
    pub has_style_directive: bool,
}

/// Upstream's `attribute_matches` reads `node.attributes` for a `RegularElement` and a
/// `SvelteElement` alike, so both must contribute the same facts — a dynamic element that
/// records only its classes is invisible to every other attribute selector.
pub fn collect_css_attribute_facts(
    attributes: &[Attribute],
    context: &mut VisitorContext,
) -> CssAttributeFacts {
    use crate::ast::template::{AttributeValue, AttributeValuePart};
    use crate::compiler::phases::phase2_analyze::css;

    let mut facts = CssAttributeFacts::default();

    for attr in attributes {
        match attr {
            Attribute::Attribute(attr_node) => {
                match &attr_node.value {
                    AttributeValue::True(_) => {
                        facts
                            .static_attributes
                            .push((attr_node.name.to_string(), None));
                    }
                    AttributeValue::Sequence(parts) => {
                        let mut all_static = true;
                        let mut value = String::new();
                        for part in parts {
                            if let AttributeValuePart::Text(text) = part {
                                value.push_str(&text.data);
                            } else {
                                all_static = false;
                                break;
                            }
                        }
                        if all_static {
                            facts
                                .static_attributes
                                .push((attr_node.name.to_string(), Some(value)));
                        } else {
                            let mut all_resolved = true;
                            let mut computed_values: Vec<String> = vec![String::new()];
                            for part in parts {
                                match part {
                                    AttributeValuePart::Text(text) => {
                                        for v in &mut computed_values {
                                            v.push_str(&text.data);
                                        }
                                    }
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        if let Some(possible_vals) = css::get_possible_values_expr(
                                            &expr_tag.expression,
                                            false,
                                        ) {
                                            if possible_vals.len() > 20 {
                                                all_resolved = false;
                                                break;
                                            }
                                            let prev = std::mem::take(&mut computed_values);
                                            for pv in &prev {
                                                for ev in &possible_vals {
                                                    computed_values.push(format!("{pv}{ev}"));
                                                }
                                            }
                                            if computed_values.len() > 100 {
                                                all_resolved = false;
                                                break;
                                            }
                                        } else {
                                            all_resolved = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if all_resolved && !computed_values.is_empty() {
                                for value in &computed_values {
                                    facts
                                        .static_attributes
                                        .push((attr_node.name.to_string(), Some(value.clone())));
                                }
                            } else {
                                facts
                                    .dynamic_attribute_names
                                    .insert(attr_node.name.to_string());
                            }
                        }
                    }
                    AttributeValue::Expression(expr_tag) => {
                        if let Some(possible_values) =
                            css::get_possible_values_expr(&expr_tag.expression, false)
                        {
                            for value in &possible_values {
                                facts
                                    .static_attributes
                                    .push((attr_node.name.to_string(), Some(value.to_string())));
                            }
                        } else {
                            facts
                                .dynamic_attribute_names
                                .insert(attr_node.name.to_string());
                        }
                    }
                }

                match attr_node.name.as_str() {
                    "class" => match css::possible_class_names(&attr_node.value) {
                        Some(class_names) => {
                            for class_name in class_names {
                                context.analysis.css.used_classes.insert(class_name.clone());
                                facts.classes.insert(class_name);
                            }
                        }
                        None => context.analysis.css.has_dynamic_classes = true,
                    },
                    // Upstream runs one chunk expansion for every attribute; `id` used to
                    // call any expression indeterminate, so `id={c ? 'a' : 'b'}` kept every
                    // `#id` rule official prunes.
                    "id" => match css::possible_attribute_values(&attr_node.value, false) {
                        Some(ids) => {
                            let ids: Vec<String> = ids
                                .iter()
                                .map(|id| id.trim().to_string())
                                .filter(|id| !id.is_empty())
                                .collect();
                            // Only one candidate can name THIS element; picking one of
                            // several would prune the rules naming the others.
                            if let [only] = ids.as_slice() {
                                facts.id = Some(only.clone());
                            }
                            for id in ids {
                                context.analysis.css.used_ids.insert(id);
                            }
                        }
                        None => context.analysis.css.has_dynamic_ids = true,
                    },
                    _ => {}
                }
            }
            Attribute::SpreadAttribute(_) => {
                facts.has_spread = true;
            }
            Attribute::BindDirective(bind) => {
                facts.dynamic_attribute_names.insert(bind.name.to_string());
            }
            Attribute::ClassDirective(class_dir) => {
                facts.has_class_directive = true;
                facts
                    .class_directive_names
                    .insert(class_dir.name.to_string());
                context
                    .analysis
                    .css
                    .used_classes
                    .insert(class_dir.name.to_string());
                // `class:name` matches `.name` exactly under upstream's `~=` rule, so the
                // directive name is a class this element can carry.
                facts.classes.insert(class_dir.name.to_string());
            }
            Attribute::StyleDirective(_) => {
                facts.has_style_directive = true;
            }
            _ => {}
        }
    }

    facts
}
