//! Server-side component visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::{
    get_let_directive_params, get_let_directives, get_slot_name, is_valid_js_identifier,
    quote_prop_name, strip_ts_type_annotation,
};
use super::super::types::{ComponentBinding, ComponentPropItem, OutputPart};
use crate::ast::template::{Attribute, AttributeValue, Component, Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::template::escape_js_string;
use rustc_hash::FxHashMap;

fn push_component_prop(items: &mut Vec<ComponentPropItem>, prop: String) {
    if let Some(ComponentPropItem::Props(props)) = items.last_mut() {
        props.push(prop);
    } else {
        items.push(ComponentPropItem::Props(vec![prop]));
    }
}

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_component_usage(
        &mut self,
        component: &Component,
    ) -> Result<(), TransformError> {
        let comp_name = component.name.to_string();

        // Check if there's any prior content (HTML, expressions, or other components)
        let has_prior_content = self.output_parts.iter().any(|part| {
            matches!(part, OutputPart::Html(s) if !s.trim().is_empty())
                || matches!(part, OutputPart::Expression(_))
                || matches!(part, OutputPart::AsyncExpression { .. })
                || matches!(part, OutputPart::RawExpression(_))
                || matches!(part, OutputPart::HtmlExpression(_))
                || matches!(part, OutputPart::Component { .. })
                || matches!(part, OutputPart::ComponentWithBindings { .. })
                || matches!(part, OutputPart::IfBlock { .. })
                || matches!(part, OutputPart::EachBlock { .. })
                || matches!(part, OutputPart::AwaitBlock { .. })
                || matches!(part, OutputPart::SvelteBoundary { .. })
                || matches!(part, OutputPart::SvelteBoundaryWithPending { .. })
                || matches!(part, OutputPart::RenderCall { .. })
        });

        // Extract interleaved props/spreads and bindings
        let mut props_and_spreads: Vec<ComponentPropItem> =
            Vec::with_capacity(component.attributes.len());
        let mut bindings = Vec::with_capacity(2);
        // CSS custom properties (attributes starting with `--`) are extracted and
        // used to wrap the component call in $.css_props()
        let mut css_custom_props: Vec<(String, String)> = Vec::new();

        // Collect expressions from @attach and bind:this directives for blocker tracking.
        // These don't generate props on the server, but their dependencies may have
        // blockers that require async_block wrapping for hydration marker consistency.
        let mut attach_expressions: Vec<String> = Vec::new();

        for attr in &component.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    // CSS custom properties (e.g., --color="red") are handled separately
                    if name.starts_with("--") {
                        let value = match &node.value {
                            AttributeValue::Expression(expr_tag) => {
                                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if expr_end > expr_start && expr_end <= self.source.len() {
                                    self.source[expr_start..expr_end].trim().to_string()
                                } else {
                                    "''".to_string()
                                }
                            }
                            AttributeValue::Sequence(parts) => {
                                // Handle text values like --color="red"
                                let mut value_str = String::new();
                                let mut has_expression = false;
                                for part in parts {
                                    match part {
                                        crate::ast::template::AttributeValuePart::Text(text) => {
                                            value_str.push_str(&text.data);
                                        }
                                        crate::ast::template::AttributeValuePart::ExpressionTag(
                                            expr_tag,
                                        ) => {
                                            has_expression = true;
                                            let expr_start =
                                                expr_tag.expression.start().unwrap_or(0) as usize;
                                            let expr_end =
                                                expr_tag.expression.end().unwrap_or(0) as usize;
                                            if expr_end > expr_start
                                                && expr_end <= self.source.len()
                                            {
                                                value_str.push_str("${$.stringify(");
                                                value_str.push_str(
                                                    self.source[expr_start..expr_end].trim(),
                                                );
                                                value_str.push_str(")}");
                                            }
                                        }
                                    }
                                }
                                if has_expression {
                                    format!("`{}`", value_str)
                                } else {
                                    format!("'{}'", value_str)
                                }
                            }
                            AttributeValue::True(_) => "true".to_string(),
                        };
                        css_custom_props.push((format!("'{}'", name), value));
                        continue;
                    }
                    match &node.value {
                        AttributeValue::Expression(expr_tag) => {
                            // Get expression from ExpressionTag's expression field
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr_source =
                                    self.source[expr_start..expr_end].trim().to_string();
                                let expr_source = self.transform_store_refs(&expr_source);
                                // Check if it's a shorthand property (name equals expression)
                                if expr_source == name && is_valid_js_identifier(name) {
                                    push_component_prop(&mut props_and_spreads, name.to_string());
                                } else {
                                    push_component_prop(
                                        &mut props_and_spreads,
                                        format!("{}: {}", quote_prop_name(name), expr_source),
                                    );
                                }
                            }
                        }
                        AttributeValue::Sequence(parts) => {
                            // Check for special case: sequence with only a single expression
                            // This happens when attribute is like foo='{bar}' - treat as direct expression
                            if parts.len() == 1
                                && let crate::ast::template::AttributeValuePart::ExpressionTag(
                                    expr_tag,
                                ) = &parts[0]
                            {
                                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if expr_end > expr_start && expr_end <= self.source.len() {
                                    let expr_source =
                                        self.source[expr_start..expr_end].trim().to_string();
                                    let expr_source = self.transform_store_refs(&expr_source);
                                    // Check if it's a shorthand property (name equals expression)
                                    if expr_source == name && is_valid_js_identifier(name) {
                                        push_component_prop(
                                            &mut props_and_spreads,
                                            name.to_string(),
                                        );
                                    } else {
                                        push_component_prop(
                                            &mut props_and_spreads,
                                            format!("{}: {}", quote_prop_name(name), expr_source),
                                        );
                                    }
                                    continue;
                                }
                            }

                            // Handle text or mixed values like name="world"
                            let mut value_str = String::new();
                            let mut has_expression = false;
                            for part in parts {
                                match part {
                                    crate::ast::template::AttributeValuePart::Text(text) => {
                                        value_str.push_str(&text.data);
                                    }
                                    crate::ast::template::AttributeValuePart::ExpressionTag(
                                        expr_tag,
                                    ) => {
                                        has_expression = true;
                                        // For mixed values with expressions, extract from source
                                        // and wrap in $.stringify() for proper string conversion
                                        let expr_start =
                                            expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end =
                                            expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            let expr_src = self.source[expr_start..expr_end].trim();
                                            let transformed = self.transform_store_refs(expr_src);
                                            value_str.push_str("${$.stringify(");
                                            value_str.push_str(&transformed);
                                            value_str.push_str(")}");
                                        }
                                    }
                                }
                            }
                            // Always add the prop (even for empty strings like foo='')
                            // Check if the value contains expressions
                            if has_expression {
                                push_component_prop(
                                    &mut props_and_spreads,
                                    format!("{}: `{}`", quote_prop_name(name), value_str),
                                );
                            } else {
                                // Simple string value (including empty strings)
                                // Escape special characters for JS single-quoted string
                                let escaped_value = escape_js_string(&value_str);
                                push_component_prop(
                                    &mut props_and_spreads,
                                    format!("{}: '{}'", quote_prop_name(name), escaped_value),
                                );
                            }
                        }
                        AttributeValue::True(_) => {
                            // Boolean attribute (e.g., disabled)
                            push_component_prop(
                                &mut props_and_spreads,
                                format!("{}: true", quote_prop_name(name)),
                            );
                        }
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        let expr = self.transform_store_refs(&expr);
                        // Transform $$props -> $$sanitized_props in spread expressions
                        let expr = self.transform_special_vars(&expr);
                        props_and_spreads.push(ComponentPropItem::Spread(expr));
                    }
                }
                Attribute::BindDirective(bind) => {
                    let prop_name = bind.name.as_str();
                    // bind:this is client-only, but we still need to check for blockers
                    // to ensure the server generates matching hydration markers if the
                    // client wraps in $.async
                    if prop_name == "this" {
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr_source = self.source[expr_start..expr_end].trim().to_string();
                            attach_expressions.push(expr_source);
                        }
                        continue;
                    }

                    // Check if the expression is a SequenceExpression (getter/setter pair)
                    let expr_json = bind.expression.as_json();
                    let expr_type = expr_json.get("type").and_then(|t| t.as_str()).unwrap_or("");

                    if expr_type == "SequenceExpression" {
                        // Extract getter and setter from the SequenceExpression
                        if let Some(expressions) = expr_json
                            .get("expressions")
                            .and_then(|e| e.as_array())
                            .filter(|e| e.len() >= 2)
                        {
                            let getter_start = expressions[0]
                                .get("start")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0)
                                as usize;
                            let getter_end = expressions[0]
                                .get("end")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0) as usize;
                            let setter_start = expressions[1]
                                .get("start")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0)
                                as usize;
                            let setter_end = expressions[1]
                                .get("end")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0) as usize;

                            if getter_end > getter_start
                                && getter_end <= self.source.len()
                                && setter_end > setter_start
                                && setter_end <= self.source.len()
                            {
                                let getter_expr =
                                    self.source[getter_start..getter_end].trim().to_string();
                                let setter_expr =
                                    self.source[setter_start..setter_end].trim().to_string();
                                bindings.push(ComponentBinding::SequenceExpression {
                                    prop_name: prop_name.to_string(),
                                    getter_expr,
                                    setter_expr,
                                });
                            }
                        }
                    } else {
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                            // Handle shorthand bindings where span might include "bind:"
                            if let Some(stripped) = var_name.strip_prefix("bind:") {
                                var_name = stripped.to_string();
                            }
                            bindings.push(ComponentBinding::Simple {
                                prop_name: prop_name.to_string(),
                                var_name,
                            });
                        }
                    }
                }
                Attribute::AttachTag(attach) => {
                    // While we don't run attachments on the server, on the client
                    // they might generate a surrounding blocker function which generates
                    // extra comments. To prevent hydration mismatches we need to account
                    // for them here to generate similar comments on the server.
                    let expr_start = attach.expression.start().unwrap_or(0) as usize;
                    let expr_end = attach.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr_source = self.source[expr_start..expr_end].trim().to_string();
                        attach_expressions.push(expr_source);
                    }
                }
                _ => {}
            }
        }

        // Collect component-level let directive params including aliases (e.g., <Counter let:count={n}> -> "count: n")
        // BUT: if the component has a slot= attribute (e.g., <Child slot="item" let:item>),
        // the let: directives belong to the PARENT's slot interface, not this component's
        // own children. In that case, don't pass them to children processing.
        let has_slot_attr = component
            .attributes
            .iter()
            .any(|a| matches!(a, Attribute::Attribute(attr) if attr.name.as_str() == "slot"));
        let component_let_directives: Vec<String> = if has_slot_attr {
            Vec::new()
        } else {
            get_let_directive_params(&component.attributes, &self.source)
        };

        // Extract snippets from the component's fragment and process children
        // Pass component-level let directives so constant folding is suppressed for shadowed vars
        let (children, snippets, slot_names) = self.generate_component_children_with_snippets(
            &component.fragment,
            &component_let_directives,
        )?;

        // Check if the component is dynamic (could be undefined/null)
        // A component is dynamic if it's marked as such in metadata
        let is_dynamic = component.metadata.dynamic;

        let css_props_is_html = self.namespace != "svg";

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props_and_spreads,
                has_prior_content,
                children,
                snippets,
                slot_names,
                dynamic: is_dynamic,
                let_directives: component_let_directives,
                css_custom_props,
                css_props_is_html,
                in_async_block: false,
                attach_expressions,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props_and_spreads,
                bindings,
                has_prior_content,
                children,
                dynamic: is_dynamic,
                css_custom_props,
                css_props_is_html,
                seq_bindings_hoisted: false,
            });
        }

        Ok(())
    }

    /// Generate component children, extracting snippets as props.
    /// Returns (children_parts, snippets, slot_names)
    /// Snippets are tuples of (name, params, body_parts, is_true_snippet)
    /// - is_true_snippet=true means it's a SnippetBlock (needs hoisting)
    /// - is_true_snippet=false means it's a slot child (inline in $$slots with destructured params)
    #[allow(clippy::type_complexity)]
    pub(crate) fn generate_component_children_with_snippets(
        &mut self,
        fragment: &Fragment,
        component_let_directives: &[String],
    ) -> Result<
        (
            Option<Vec<OutputPart>>,
            Vec<(String, Vec<String>, Vec<OutputPart>, bool)>,
            Vec<String>,
        ),
        TransformError,
    > {
        // Pre-allocate based on typical usage patterns
        // (name, params, body_parts, is_true_snippet)
        let mut snippets: Vec<(String, Vec<String>, Vec<OutputPart>, bool)> = Vec::with_capacity(4);
        let mut slot_names: Vec<String> = Vec::with_capacity(4);

        // Group children by slot name
        // Key: slot name, Value: (nodes, let_directive_names)
        let mut slot_children: FxHashMap<String, (Vec<&TemplateNode>, Vec<String>)> =
            FxHashMap::default();
        // Track slot order for deterministic output
        let mut slot_order: Vec<String> = Vec::new();

        // Separate snippets from other children, and group by slot
        for node in &fragment.nodes {
            if let TemplateNode::SnippetBlock(snippet_block) = node {
                // Extract snippet name
                let name_start = snippet_block.expression.start().unwrap_or(0) as usize;
                let name_end = snippet_block.expression.end().unwrap_or(0) as usize;
                let snippet_name = if name_end > name_start && name_end <= self.source.len() {
                    self.source[name_start..name_end].trim().to_string()
                } else {
                    "snippet".to_string()
                };

                // Extract parameters (strip TypeScript type annotations)
                let params: Vec<String> = snippet_block
                    .parameters
                    .iter()
                    .map(|p| {
                        let start = p.start().unwrap_or(0) as usize;
                        let end = p.end().unwrap_or(0) as usize;
                        if end > start && end <= self.source.len() {
                            strip_ts_type_annotation(&self.source[start..end])
                        } else {
                            String::new()
                        }
                    })
                    .filter(|s| !s.is_empty())
                    .collect();

                // Generate snippet body
                let body_parts = self.generate_snippet_body(&snippet_block.body)?;

                // Add to slot names
                let slot_name = if snippet_name == "children" {
                    "default".to_string()
                } else {
                    snippet_name.clone()
                };
                slot_names.push(slot_name);

                snippets.push((snippet_name, params, body_parts, true)); // true = is_true_snippet
            } else {
                // Get the slot name and let directive params (with aliases) from the node's attributes
                let slot_name = get_slot_name(node);
                let let_directive_params = match node {
                    TemplateNode::RegularElement(elem) => {
                        get_let_directive_params(&elem.attributes, &self.source)
                    }
                    TemplateNode::SvelteFragment(frag) => {
                        get_let_directive_params(&frag.attributes, &self.source)
                    }
                    TemplateNode::Component(comp) => {
                        get_let_directive_params(&comp.attributes, &self.source)
                    }
                    TemplateNode::SvelteElement(elem) => {
                        get_let_directive_params(&elem.attributes, &self.source)
                    }
                    TemplateNode::SvelteSelf(elem) => {
                        get_let_directive_params(&elem.attributes, &self.source)
                    }
                    TemplateNode::SvelteComponent(elem) => {
                        get_let_directive_params(&elem.attributes, &self.source)
                    }
                    TemplateNode::SlotElement(slot) => {
                        get_let_directive_params(&slot.attributes, &self.source)
                    }
                    _ => get_let_directives(node),
                };
                let entry = slot_children.entry(slot_name.clone()).or_insert_with(|| {
                    slot_order.push(slot_name.clone());
                    (Vec::new(), Vec::new())
                });
                entry.0.push(node);
                // Merge let directive params (usually there's one element with let directives per slot)
                for let_dir in let_directive_params {
                    if !entry.1.contains(&let_dir) {
                        entry.1.push(let_dir);
                    }
                }
            }
        }

        // Process default slot children
        // When component has let directives (e.g., <Counter let:count>), the destructured
        // parameter shadows any outer constant variable. We need to temporarily remove
        // those names from constant_vars so they're not constant-folded.
        //
        // There are two cases for let directives on the default slot:
        // 1. Component-level: <Component let:box> ... </Component>
        //    - component_let_directives is non-empty
        // 2. Fragment-level: <svelte:fragment let:box={{width, height}}> ... </svelte:fragment>
        //    - The fragment_let_dirs from the default slot entry are non-empty
        //
        // In both cases, the default slot needs to go into $$slots.default with params,
        // and children should be $.invalid_default_snippet.
        let children = if let Some((default_nodes, fragment_let_dirs)) =
            slot_children.remove("default")
        {
            if !fragment_let_dirs.is_empty() && component_let_directives.is_empty() {
                // Fragment-level let directives (e.g., <svelte:fragment let:box={{width, height}}>)
                // Treat as a $$slots.default snippet instead of plain children.
                let mut saved_constants: Vec<(String, String)> = Vec::new();
                for param in &fragment_let_dirs {
                    let local_name = if let Some(colon_pos) = param.find(':') {
                        param[colon_pos + 1..].trim().to_string()
                    } else {
                        param.clone()
                    };
                    if let Some(value) = self.constant_vars.remove(&local_name) {
                        saved_constants.push((local_name.clone(), value));
                    }
                }

                let result = self.generate_children_from_nodes(&default_nodes)?;

                // Restore removed constants
                for (name, value) in saved_constants {
                    self.constant_vars.insert(name, value);
                }

                if let Some(slot_parts) = result {
                    slot_names.push("default".to_string());
                    snippets.push(("default".to_string(), fragment_let_dirs, slot_parts, false));
                }
                None // No plain children - content is in $$slots.default
            } else {
                // Component-level let directives or no let directives
                let mut saved_constants: Vec<(String, String)> = Vec::new();
                for param in component_let_directives {
                    let local_name = if let Some(colon_pos) = param.find(':') {
                        param[colon_pos + 1..].trim().to_string()
                    } else {
                        param.clone()
                    };
                    if let Some(value) = self.constant_vars.remove(&local_name) {
                        saved_constants.push((local_name.clone(), value));
                    }
                }

                let result = self.generate_children_from_nodes(&default_nodes)?;

                // Restore removed constants
                for (name, value) in saved_constants {
                    self.constant_vars.insert(name, value);
                }

                result
            }
        } else {
            None
        };

        // Process named slot children (non-default) as snippets with let directive params
        // Use slot_order to maintain source order (slot_children is a HashMap with non-deterministic order)
        for slot_name in slot_order {
            if let Some((nodes, let_dirs)) = slot_children.remove(&slot_name) {
                // Temporarily remove let directive params from constant_vars
                // so that slot parameters shadow outer constant variables.
                // For example, if <p slot="foo" let:count> and outer `count = 42` is a constant,
                // the `count` inside this slot should use the slot-provided value, not 42.
                let mut saved_constants: Vec<(String, String)> = Vec::new();
                for param in &let_dirs {
                    // For aliased params like "thing: x", the local variable is "x"
                    // For non-aliased params like "thing", the local variable is "thing"
                    let local_name = if let Some(colon_pos) = param.find(':') {
                        param[colon_pos + 1..].trim().to_string()
                    } else {
                        param.clone()
                    };
                    if let Some(value) = self.constant_vars.remove(&local_name) {
                        saved_constants.push((local_name.clone(), value));
                    }
                }

                // Generate children content for this named slot
                let result = self.generate_children_from_nodes(&nodes)?;

                // Restore removed constants
                for (name, value) in saved_constants {
                    self.constant_vars.insert(name, value);
                }

                if let Some(slot_parts) = result {
                    // Add as a snippet with the slot name and let directive names as params
                    slot_names.push(slot_name.clone());
                    snippets.push((slot_name, let_dirs, slot_parts, false)); // false = not a true snippet
                }
            }
        }

        Ok((children, snippets, slot_names))
    }
}
