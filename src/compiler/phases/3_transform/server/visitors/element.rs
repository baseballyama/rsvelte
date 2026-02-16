//! Server-side element visitor.
//!
//! Contains generate_element() and all element-related methods including
//! attribute generation, class/style directive handling, and spread attributes.

use super::super::ServerCodeGenerator;
use super::super::helpers::{collapse_whitespace, needs_clsx, quote_prop_name};
use super::super::types::OutputPart;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, BindDirective, ClassDirective,
    RegularElement, StyleDirective, TemplateNode,
};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{
    escape_attr, escape_html, is_void_element,
};

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_element(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Handle <option> element specially
        if name == "option" {
            return self.generate_option_element(element);
        }

        // Handle <select> with value specially - use $$renderer.select()
        if name == "select" && self.select_has_value_attribute(element) {
            return self.generate_select_element(element);
        }

        // Check if we have spread attributes
        let has_spread = element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        // If we have spread attributes, use $.attributes() for the whole thing
        // This must come before textarea handling since textarea with spreads
        // needs $.attributes() (e.g., <textarea {...value}></textarea>)
        if has_spread {
            return self.generate_element_with_spread(element);
        }

        // Handle <textarea> with value/bind:value specially - output value as content
        if name == "textarea" {
            return self.generate_textarea_element(element);
        }

        // Collect directives and base attributes
        let mut class_directives: Vec<&ClassDirective> = Vec::new();
        let mut style_directives: Vec<&StyleDirective> = Vec::new();
        let mut base_class: Option<String> = None;
        let mut base_style: Option<String> = None;

        // Get CSS hash for scoped elements
        let css_hash = if element.metadata.scoped {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        for attr in &element.attributes {
            match attr {
                Attribute::ClassDirective(dir) => {
                    class_directives.push(dir);
                }
                Attribute::StyleDirective(dir) => {
                    style_directives.push(dir);
                }
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    base_class = self.extract_attribute_text_value(node);
                    // Also extract dynamic expression for class={expr} with class directives
                    if base_class.is_none()
                        && let AttributeValue::Expression(expr_tag) = &node.value
                    {
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                            base_class = Some(format!("__EXPR__:{}", raw_expr));
                        }
                    }
                }
                Attribute::Attribute(node) if node.name.as_str() == "style" => {
                    base_style = self.extract_attribute_text_value(node);
                }
                _ => {}
            }
        }

        // Start tag
        let mut tag = format!("<{}", name);

        // Attributes - handle class and style specially if directives exist
        for attr in &element.attributes {
            match attr {
                // Skip class/style directives - handled separately
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => continue,
                // Skip class attribute if we have class directives
                Attribute::Attribute(node)
                    if node.name.as_str() == "class" && !class_directives.is_empty() =>
                {
                    continue;
                }
                // Skip style attribute if we have style directives
                Attribute::Attribute(node)
                    if node.name.as_str() == "style" && !style_directives.is_empty() =>
                {
                    continue;
                }
                // Handle class attribute specially - add CSS hash if scoped
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    if let Some(attr_str) =
                        self.generate_attribute_node_with_css_hash(node, css_hash.as_deref())?
                    {
                        tag.push_str(&attr_str);
                    }
                }
                _ => {
                    if let Some(attr_str) =
                        self.generate_attribute_for_element(attr, Some(element))?
                    {
                        tag.push_str(&attr_str);
                    }
                }
            }
        }

        // If element is scoped but has no class attribute, add one with just the hash
        if let Some(ref hash) = css_hash
            && base_class.is_none()
            && class_directives.is_empty()
        {
            tag.push_str(&format!(" class=\"{}\"", hash));
        }

        // Generate $.attr_class() if we have class directives
        if !class_directives.is_empty() {
            let attr_class_call =
                self.generate_attr_class_call(&class_directives, base_class.as_deref())?;
            tag.push_str(&attr_class_call);
        }

        // Generate $.attr_style() if we have style directives
        if !style_directives.is_empty() {
            let attr_style_call =
                self.generate_attr_style_call(&style_directives, base_style.as_deref())?;
            tag.push_str(&attr_style_call);
        }

        if is_void_element(name) {
            tag.push_str("/>");
            self.output_parts.push(OutputPart::Html(tag));
        } else {
            tag.push('>');
            self.output_parts.push(OutputPart::Html(tag));

            // Children - filter and process with position awareness
            // First, filter out comments and find meaningful content boundaries
            let children: Vec<_> = element.fragment.nodes.iter().collect();

            // Find first and last non-whitespace, non-comment, non-snippet children
            // Snippet blocks are hoisted and don't produce inline output
            let _first_content = children.iter().position(|c| {
                !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                    && !matches!(c, TemplateNode::Comment(_))
                    && !matches!(c, TemplateNode::SnippetBlock(_))
            });
            let last_content = children.iter().rposition(|c| {
                !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                    && !matches!(c, TemplateNode::Comment(_))
                    && !matches!(c, TemplateNode::SnippetBlock(_))
            });

            let mut has_output_content = false;
            let mut is_first_content = true;

            for (i, child) in children.iter().enumerate() {
                // Skip comments
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }

                // For text nodes, check if it should become a space
                if let TemplateNode::Text(text) = child {
                    let data = &text.data;
                    if data.trim().is_empty() {
                        // For certain elements, skip all whitespace-only text nodes entirely
                        // This matches the clean_nodes behavior in the official compiler:
                        // - SVG elements (except <text>) strip internal whitespace
                        // - Table-related elements strip internal whitespace
                        // - select/optgroup strip internal whitespace
                        let is_svg_parent = matches!(
                            name,
                            "svg"
                                | "g"
                                | "defs"
                                | "symbol"
                                | "marker"
                                | "clipPath"
                                | "mask"
                                | "pattern"
                                | "linearGradient"
                                | "radialGradient"
                                | "filter"
                                | "feBlend"
                                | "feColorMatrix"
                                | "feComponentTransfer"
                                | "feComposite"
                                | "feConvolveMatrix"
                                | "feDiffuseLighting"
                                | "feDisplacementMap"
                                | "feFlood"
                                | "feGaussianBlur"
                                | "feImage"
                                | "feMerge"
                                | "feMorphology"
                                | "feOffset"
                                | "feSpecularLighting"
                                | "feTile"
                                | "feTurbulence"
                        );
                        let can_remove_whitespace = is_svg_parent
                            || matches!(
                                name,
                                "select"
                                    | "optgroup"
                                    | "tr"
                                    | "table"
                                    | "tbody"
                                    | "thead"
                                    | "tfoot"
                                    | "colgroup"
                                    | "datalist"
                            );
                        if can_remove_whitespace {
                            continue;
                        }
                        // Whitespace-only text: add space only if between content elements
                        if has_output_content
                            && last_content.is_some()
                            && i < last_content.unwrap()
                            && !data.is_empty()
                        {
                            self.output_parts.push(OutputPart::Html(" ".to_string()));
                        }
                        continue;
                    }

                    // For text nodes, strip leading/trailing whitespace and collapse internal whitespace
                    if is_first_content {
                        // First content: trim leading whitespace
                        // If this is also the last content, trim trailing too
                        let is_last = last_content.is_some() && i == last_content.unwrap();
                        let trimmed = if is_last {
                            // Both first and last - trim both sides
                            data.trim()
                        } else {
                            data.trim_start()
                        };
                        if !trimmed.is_empty() {
                            // Collapse internal whitespace
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    // Check if this is the last content - trim trailing
                    if last_content.is_some() && i == last_content.unwrap() {
                        let trimmed = data.trim_end();
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        continue;
                    }
                }

                self.generate_node(child, false)?;
                // Snippet blocks are hoisted and don't produce inline output
                if !matches!(child, TemplateNode::SnippetBlock(_)) {
                    has_output_content = true;
                    is_first_content = false;
                }
            }

            // For select/optgroup with Component/RenderTag/HtmlTag, add <!> marker before closing tag
            if (name == "select" || name == "optgroup")
                && Self::is_customizable_select_element(element)
            {
                self.output_parts.push(OutputPart::HydrationAnchor);
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    /// Generate an element with spread attributes using $.attributes().
    fn generate_element_with_spread(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Build the object literal for $.attributes()
        let mut object_parts: Vec<String> = Vec::new();
        // Collect class directives: { className: expression }
        let mut class_directive_parts: Vec<String> = Vec::new();
        // Collect style directives: { styleName: expression }
        let mut style_directive_parts: Vec<String> = Vec::new();

        for attr in &element.attributes {
            match attr {
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        // Transform rune calls in spread expressions
                        let expr = Self::transform_rune_in_template_expr(&expr);
                        object_parts.push(format!("...{}", expr));
                    }
                }
                Attribute::Attribute(node) => {
                    // Skip event handlers
                    if node.name.starts_with("on") {
                        continue;
                    }
                    let attr_name = node.name.as_str();
                    let value = self.extract_attribute_value_as_string(node)?;
                    // Wrap class attribute dynamic expressions in $.clsx()
                    let value = if attr_name == "class" && needs_clsx(&node.value) {
                        format!("$.clsx({})", value)
                    } else {
                        value
                    };
                    object_parts.push(format!("{}: {}", quote_prop_name(attr_name), value));
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    // Skip bind:this on server - it's a DOM reference only needed client-side
                    if bind_name == "this" {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(format!("{}: {}", quote_prop_name(bind_name), expr));
                    }
                }
                Attribute::ClassDirective(class_dir) => {
                    // Build class directive: { className: expression }
                    let class_name = class_dir.name.as_str();
                    let expr_start = class_dir.expression.start().unwrap_or(0) as usize;
                    let expr_end = class_dir.expression.end().unwrap_or(0) as usize;
                    let value = if expr_end > expr_start && expr_end <= self.source.len() {
                        self.source[expr_start..expr_end].trim().to_string()
                    } else {
                        "true".to_string()
                    };
                    class_directive_parts.push(format!("{}: {}", class_name, value));
                }
                Attribute::StyleDirective(style_dir) => {
                    // Build style directive: { styleName: expression }
                    let style_name = style_dir.name.as_str();
                    let value = match &style_dir.value {
                        AttributeValue::True(_) => "true".to_string(),
                        AttributeValue::Expression(expr) => {
                            let expr_start = expr.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                self.source[expr_start..expr_end].trim().to_string()
                            } else {
                                "true".to_string()
                            }
                        }
                        AttributeValue::Sequence(parts) => {
                            // For sequences, build a template literal or concatenation
                            let mut expr_parts: Vec<String> = Vec::new();
                            for part in parts {
                                match part {
                                    AttributeValuePart::Text(text) => {
                                        let text_start = text.start as usize;
                                        let text_end = text.end as usize;
                                        if text_end > text_start && text_end <= self.source.len() {
                                            expr_parts.push(format!(
                                                "'{}'",
                                                &self.source[text_start..text_end]
                                            ));
                                        }
                                    }
                                    AttributeValuePart::ExpressionTag(expr) => {
                                        let expr_start =
                                            expr.expression.start().unwrap_or(0) as usize;
                                        let expr_end = expr.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            expr_parts.push(
                                                self.source[expr_start..expr_end]
                                                    .trim()
                                                    .to_string(),
                                            );
                                        }
                                    }
                                }
                            }
                            if expr_parts.len() == 1 {
                                expr_parts.remove(0)
                            } else {
                                expr_parts.join(" + ")
                            }
                        }
                    };
                    style_directive_parts.push(format!("{}: {}", style_name, value));
                }
                Attribute::OnDirective(_) => {}
                _ => {}
            }
        }

        let object_literal = format!("{{ {} }}", object_parts.join(", "));

        // Build class directives object or "void 0"
        let classes_arg = if class_directive_parts.is_empty() {
            "void 0".to_string()
        } else {
            format!("{{ {} }}", class_directive_parts.join(", "))
        };

        // Build style directives object or "void 0"
        let styles_arg = if style_directive_parts.is_empty() {
            "void 0".to_string()
        } else {
            format!("{{ {} }}", style_directive_parts.join(", "))
        };

        // Determine flags for $.attributes() call
        // ELEMENT_IS_NAMESPACED = 1, ELEMENT_PRESERVE_ATTRIBUTE_CASE = 2, ELEMENT_IS_INPUT = 4
        let is_custom_element = self.is_custom_element(element);
        let is_svg_or_mathml = element.metadata.svg || element.metadata.mathml;
        let flags = if is_svg_or_mathml {
            3 // ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE
        } else if is_custom_element {
            2 // ELEMENT_PRESERVE_ATTRIBUTE_CASE
        } else if name == "input" {
            4 // ELEMENT_IS_INPUT
        } else {
            0
        };

        // Start tag with $.attributes() call
        let tag = format!("<{}", name);
        self.output_parts.push(OutputPart::Html(tag));

        // Determine CSS hash for scoped elements
        let css_hash = if element.metadata.scoped {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        // Add $.attributes() expression with full arguments
        // $.attributes(object, css_hash, classes, styles, flags)
        // Only include trailing arguments if they are non-default values
        // Defaults: css_hash=void 0, classes=void 0, styles=void 0, flags=0
        let attributes_call = {
            let mut args = vec![object_literal.clone()];
            let css_hash_arg = if let Some(ref hash) = css_hash {
                format!("'{}'", hash)
            } else {
                "void 0".to_string()
            };
            // Build args from right to left, omitting trailing defaults
            let has_flags = flags != 0;
            let has_styles = styles_arg != "void 0";
            let has_classes = classes_arg != "void 0";
            let has_css_hash = css_hash.is_some();

            if has_flags || has_styles || has_classes || has_css_hash {
                args.push(css_hash_arg);
                if has_flags || has_styles || has_classes {
                    args.push(classes_arg.clone());
                    if has_flags || has_styles {
                        args.push(styles_arg.clone());
                        if has_flags {
                            args.push(flags.to_string());
                        }
                    }
                }
            }
            format!("$.attributes({})", args.join(", "))
        };
        self.output_parts
            .push(OutputPart::RawExpression(attributes_call));

        if is_void_element(name) {
            self.output_parts.push(OutputPart::Html("/>".to_string()));
        } else {
            self.output_parts.push(OutputPart::Html(">".to_string()));

            // Generate children with proper whitespace handling
            let children: Vec<_> = element
                .fragment
                .nodes
                .iter()
                .filter(|c| !matches!(c, TemplateNode::Comment(_)))
                .collect();

            // Find first and last non-whitespace content children
            let _first_content = children
                .iter()
                .position(|c| !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty()));
            let last_content = children
                .iter()
                .rposition(|c| !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty()));

            let mut has_output_content = false;
            let mut is_first_content = true;

            // Determine if whitespace-only text nodes can be removed entirely
            let is_svg_parent = matches!(
                name,
                "svg" | "g" | "defs" | "symbol" | "marker" | "clipPath" | "mask" | "pattern"
            );
            let can_remove_whitespace = is_svg_parent
                || matches!(
                    name,
                    "select"
                        | "optgroup"
                        | "tr"
                        | "table"
                        | "tbody"
                        | "thead"
                        | "tfoot"
                        | "colgroup"
                        | "datalist"
                );

            for (i, child) in children.iter().enumerate() {
                if let TemplateNode::Text(text) = *child {
                    let data = &text.data;
                    if data.trim().is_empty() {
                        if can_remove_whitespace {
                            continue;
                        }
                        // Whitespace-only text: add space only if between content elements
                        if has_output_content
                            && last_content.is_some()
                            && i < last_content.unwrap()
                            && !data.is_empty()
                        {
                            self.output_parts.push(OutputPart::Html(" ".to_string()));
                        }
                        continue;
                    }

                    // Handle first content text node - trim leading whitespace
                    if is_first_content {
                        let is_last = last_content.is_some() && i == last_content.unwrap();
                        let trimmed = if is_last {
                            data.trim()
                        } else {
                            data.trim_start()
                        };
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    // Handle last content text node - trim trailing whitespace
                    if last_content.is_some() && i == last_content.unwrap() {
                        let trimmed = data.trim_end();
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        continue;
                    }

                    // Middle text - collapse whitespace
                    let collapsed = collapse_whitespace(data);
                    self.output_parts
                        .push(OutputPart::Html(escape_html(&collapsed)));
                    has_output_content = true;
                    is_first_content = false;
                } else {
                    self.generate_node(child, false)?;
                    has_output_content = true;
                    is_first_content = false;
                }
            }

            // For select/optgroup with Component/RenderTag/HtmlTag, add <!> marker before closing tag
            if (name == "select" || name == "optgroup")
                && Self::is_customizable_select_element(element)
            {
                self.output_parts.push(OutputPart::HydrationAnchor);
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    /// Check if an element is a custom element.
    /// Custom elements have a hyphen in their name or have an `is` attribute.
    fn is_custom_element(&self, element: &RegularElement) -> bool {
        let name = element.name.as_str();
        // Check if name contains hyphen
        if name.contains('-') {
            return true;
        }
        // Check if element has an `is` attribute
        element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(node) if node.name.as_str() == "is"))
    }

    /// Extract attribute value as a string representation for code generation.
    pub(crate) fn extract_attribute_value_as_string(
        &self,
        node: &AttributeNode,
    ) -> Result<String, TransformError> {
        // Check if this is a class attribute - needs whitespace normalization
        let is_class_attr = node.name.eq_ignore_ascii_case("class");

        match &node.value {
            AttributeValue::True(_) => Ok("true".to_string()),
            AttributeValue::Sequence(parts) => {
                // Optimization: if the sequence is a single expression with no text,
                // return the expression directly without template literal wrapping
                if parts.len() == 1
                    && let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0]
                {
                    let start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if end > start && end <= self.source.len() {
                        return Ok(self.source[start..end].trim().to_string());
                    }
                }

                let mut value = String::new();
                let mut has_expression = false;
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            // Normalize whitespace for class attributes
                            if is_class_attr {
                                let normalized: String =
                                    text.data.split_whitespace().collect::<Vec<_>>().join(" ");
                                value.push_str(&normalized);
                            } else {
                                value.push_str(&text.data);
                            }
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            has_expression = true;
                            // Extract expression from source
                            let start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if end > start && end <= self.source.len() {
                                let expr = self.source[start..end].trim();
                                // Wrap expressions in $.stringify() when mixed with text
                                // This matches the official Svelte build_attribute_value behavior
                                value.push_str(&format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                }
                // If it looks like it needs to be a template literal (has ${...})
                if has_expression {
                    Ok(format!("`{}`", value))
                } else {
                    Ok(format!("'{}'", value))
                }
            }
            AttributeValue::Expression(expr_tag) => {
                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    Ok(self.source[start..end].trim().to_string())
                } else {
                    Ok("undefined".to_string())
                }
            }
        }
    }

    /// Check if select element has a value attribute or bind:value.
    fn select_has_value_attribute(&self, element: &RegularElement) -> bool {
        element.attributes.iter().any(|attr| {
            matches!(attr, Attribute::Attribute(node) if node.name.as_str() == "value")
                || matches!(attr, Attribute::BindDirective(bind) if bind.name.as_str() == "value")
                || matches!(attr, Attribute::SpreadAttribute(_))
        })
    }

    /// Check if a select or optgroup element contains Components, RenderTags, or HtmlTags
    /// that require hydration anchor markers (<!>) before the closing tag.
    /// This does NOT include option elements with rich content - those are handled separately.
    fn is_customizable_select_element(element: &RegularElement) -> bool {
        let element_name = element.name.as_str();
        if element_name == "select" || element_name == "optgroup" {
            // Check for Components, RenderTags, HtmlTags directly in select/optgroup
            // or within control flow blocks (if, each, key, boundary)
            return Self::has_component_or_render_tag(&element.fragment.nodes);
        }
        false
    }

    /// Check if nodes contain Component, RenderTag, or HtmlTag (recursively through control flow).
    /// Does NOT recurse into option/optgroup children - only control flow blocks.
    pub(crate) fn has_component_or_render_tag(nodes: &[TemplateNode]) -> bool {
        for node in nodes {
            match node {
                // These require <!> marker
                TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::RenderTag(_)
                | TemplateNode::HtmlTag(_) => return true,

                // Control flow blocks: check their contents
                TemplateNode::IfBlock(block) => {
                    if Self::has_component_or_render_tag(&block.consequent.nodes) {
                        return true;
                    }
                    if let Some(alt) = &block.alternate
                        && Self::has_component_or_render_tag(&alt.nodes)
                    {
                        return true;
                    }
                }
                TemplateNode::EachBlock(block) => {
                    if Self::has_component_or_render_tag(&block.body.nodes) {
                        return true;
                    }
                }
                TemplateNode::KeyBlock(block) => {
                    if Self::has_component_or_render_tag(&block.fragment.nodes) {
                        return true;
                    }
                }
                TemplateNode::SvelteBoundary(boundary) => {
                    if Self::has_component_or_render_tag(&boundary.fragment.nodes) {
                        return true;
                    }
                }

                // option/optgroup: do NOT recurse - their content doesn't affect the parent's <!> marker
                TemplateNode::RegularElement(_) => {}

                // Text, ExpressionTag, etc. don't require <!> marker
                _ => {}
            }
        }
        false
    }

    pub(crate) fn generate_attribute_for_element(
        &mut self,
        attr: &Attribute,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        match attr {
            Attribute::Attribute(node) => self.generate_attribute_node(node, element),
            Attribute::BindDirective(bind) => {
                Self::generate_bind_directive_for_element(bind, &self.source, element)
            }
            // Event handlers are not rendered on server
            Attribute::OnDirective(_) => Ok(None),
            _ => Ok(None),
        }
    }

    /// Generate bind directive, optionally with element context for group bindings.
    fn generate_bind_directive_for_element(
        bind: &BindDirective,
        source: &str,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        let name = bind.name.as_str();

        // Skip bindings that should be omitted in SSR
        // Reference: svelte/packages/svelte/src/compiler/phases/bindings.js
        if Self::should_omit_binding_in_ssr(name) {
            return Ok(None);
        }

        // Skip bind:value on file input elements
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js
        if name == "value"
            && let Some(el) = element
        {
            // Check if this is a file input
            let is_file_input = el.attributes.iter().any(|attr| {
                if let Attribute::Attribute(node) = attr
                    && node.name.as_str() == "type"
                {
                    if let AttributeValue::Sequence(parts) = &node.value {
                        parts
                            .iter()
                            .any(|p| matches!(p, AttributeValuePart::Text(t) if t.data == "file"))
                    } else {
                        false
                    }
                } else {
                    false
                }
            });
            if is_file_input {
                return Ok(None);
            }
        }

        let expr_start = bind.expression.start().unwrap_or(0) as usize;
        let expr_end = bind.expression.end().unwrap_or(0) as usize;

        if expr_end > expr_start && expr_end <= source.len() {
            let expr = source[expr_start..expr_end].trim().to_string();

            // Handle bind:group specially - convert to checked attribute
            if name == "group" {
                return Self::generate_group_binding(element, source, &expr);
            }

            // For bind directives on server, output as $.attr() call
            // Use third true argument for boolean attributes like checked, open, etc.
            {
                use crate::compiler::phases::phase3_transform::shared::template::is_boolean_attribute;
                if is_boolean_attribute(name) {
                    Ok(Some(format!("${{$.attr('{}', {}, true)}}", name, expr)))
                } else {
                    Ok(Some(format!("${{$.attr('{}', {})}}", name, expr)))
                }
            }
        } else {
            Ok(None)
        }
    }

    /// Check if a binding should be omitted in SSR.
    /// Reference: svelte/packages/svelte/src/compiler/phases/bindings.js
    fn should_omit_binding_in_ssr(name: &str) -> bool {
        matches!(
            name,
            // bind:this
            "this"
            // media bindings
            | "currentTime"
            | "duration"
            | "paused"
            | "buffered"
            | "seekable"
            | "played"
            | "volume"
            | "muted"
            | "playbackRate"
            | "seeking"
            | "ended"
            | "readyState"
            // video specific
            | "videoHeight"
            | "videoWidth"
            // img specific
            | "naturalWidth"
            | "naturalHeight"
            // document
            | "activeElement"
            | "fullscreenElement"
            | "pointerLockElement"
            | "visibilityState"
            // window
            | "innerWidth"
            | "innerHeight"
            | "outerWidth"
            | "outerHeight"
            | "scrollX"
            | "scrollY"
            | "online"
            | "devicePixelRatio"
            // dimension bindings
            | "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "contentRect"
            | "contentBoxSize"
            | "borderBoxSize"
            | "devicePixelContentBoxSize"
            // checkbox
            | "indeterminate"
            // file input
            | "files"
        )
    }

    /// Generate bind:group as checked attribute for radio/checkbox inputs.
    fn generate_group_binding(
        element: Option<&RegularElement>,
        source: &str,
        group_expr: &str,
    ) -> Result<Option<String>, TransformError> {
        // We need the value attribute to generate the checked expression
        let value_expr = element.and_then(|el| {
            el.attributes.iter().find_map(|attr| {
                if let Attribute::Attribute(node) = attr
                    && node.name.as_str() == "value"
                {
                    match &node.value {
                        AttributeValue::Sequence(parts) => {
                            // Check if this is a single expression tag like value="{expr}"
                            let expr_parts: Vec<&AttributeValuePart> = parts
                                .iter()
                                .filter(|p| !matches!(p, AttributeValuePart::Text(t) if t.data.is_empty()))
                                .collect();
                            if expr_parts.len() == 1 {
                                match expr_parts[0] {
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= source.len() {
                                            Some(source[expr_start..expr_end].trim().to_string())
                                        } else {
                                            None
                                        }
                                    }
                                    AttributeValuePart::Text(text) => {
                                        Some(format!("'{}'", text.data))
                                    }
                                }
                            } else {
                                // Static text value (multiple parts)
                                let mut text_val = String::new();
                                for part in parts {
                                    if let AttributeValuePart::Text(text) = part {
                                        text_val.push_str(&text.data);
                                    }
                                }
                                Some(format!("'{}'", text_val))
                            }
                        }
                        AttributeValue::Expression(expr_tag) => {
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= source.len() {
                                Some(source[expr_start..expr_end].trim().to_string())
                            } else {
                                None
                            }
                        }
                        AttributeValue::True(_) => Some("true".to_string()),
                    }
                } else {
                    None
                }
            })
        });

        // Check if this is a checkbox (type="checkbox")
        let is_checkbox = element
            .map(|el| {
                el.attributes.iter().any(|attr| {
                    if let Attribute::Attribute(node) = attr
                        && node.name.as_str() == "type"
                    {
                        if let AttributeValue::Sequence(parts) = &node.value {
                            parts.iter().any(|p| {
                                matches!(p, AttributeValuePart::Text(t) if t.data == "checkbox")
                            })
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                })
            })
            .unwrap_or(false);

        if let Some(value) = value_expr {
            // Generate: checked={group.includes(value)} for checkbox
            // Generate: checked={group === value} for radio
            let checked_expr = if is_checkbox {
                format!("{}.includes({})", group_expr, value)
            } else {
                format!("{} === {}", group_expr, value)
            };
            Ok(Some(format!(
                "${{$.attr('checked', {}, true)}}",
                checked_expr
            )))
        } else {
            // If no value attribute, skip the binding
            Ok(None)
        }
    }

    fn generate_attribute_node(
        &mut self,
        node: &AttributeNode,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        use crate::compiler::phases::phase3_transform::shared::template::is_boolean_attribute;

        let raw_name = node.name.as_str();

        // Skip defaultValue and defaultChecked - these are not real HTML attributes
        // They are pseudo-properties used for form element initialization
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js L78-79
        if raw_name == "defaultValue" || raw_name == "defaultChecked" {
            return Ok(None);
        }

        // Normalize attribute name: lowercase for HTML elements, preserve case for SVG/MathML
        let is_html = element
            .map(|el| !el.metadata.svg && !el.metadata.mathml)
            .unwrap_or(true);
        let name = if is_html {
            raw_name.to_lowercase()
        } else {
            raw_name.to_string()
        };
        let name = name.as_str();

        // Helper to generate $.attr() call with optional boolean flag
        // For style attribute, use $.attr_style() instead
        let make_attr_call = |attr_name: &str, expr: &str| -> String {
            if attr_name == "style" {
                format!("${{$.attr_style({})}}", expr)
            } else if is_boolean_attribute(attr_name) {
                format!("${{$.attr('{}', {}, true)}}", attr_name, expr)
            } else {
                format!("${{$.attr('{}', {})}}", attr_name, expr)
            }
        };

        match &node.value {
            AttributeValue::True(_) => {
                // Boolean attributes like `disabled`, `checked` render without a value: ` disabled`
                // Non-boolean attributes render with empty string value: ` data-potato=""`
                if is_boolean_attribute(name) {
                    Ok(Some(format!(" {}", name)))
                } else {
                    Ok(Some(format!(" {}=\"\"", name)))
                }
            }
            AttributeValue::Sequence(parts) => {
                // Check if it's a single expression (like x='{x}')
                // In this case, treat it the same as AttributeValue::Expression
                if parts.len() == 1
                    && let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0]
                {
                    // Skip event handler attributes (onclick, onmousedown, etc.)
                    if name.starts_with("on") {
                        return Ok(None);
                    }

                    // Check if the expression is a string literal - if so, inline it directly.
                    // Numeric and boolean literals use $.attr() to match official compiler.
                    if let Some(literal_value) = self.extract_literal_value(&expr_tag.expression) {
                        return Ok(Some(format!(
                            " {}=\"{}\"",
                            name,
                            escape_attr(&literal_value)
                        )));
                    }

                    // Generate $.attr() call for non-string-literal expression attributes
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        return Ok(Some(make_attr_call(name, &expr)));
                    } else {
                        return Ok(None);
                    }
                }

                // Mixed content (text + expressions) - build template string
                let mut has_expressions = false;
                let mut template_parts = Vec::new();
                let mut current_text = String::new();

                // For style attribute, use $.stringify for expressions
                let is_style_attr = name == "style";

                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            current_text.push_str(&escape_attr(&text.data));
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            has_expressions = true;
                            // Push current text as template part
                            template_parts.push(current_text.clone());
                            current_text.clear();

                            // Get the expression
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr = self.source[expr_start..expr_end].trim().to_string();
                                // All attributes with expressions need $.stringify() for proper value coercion
                                template_parts.push(format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                }
                // Push any remaining text
                if !current_text.is_empty() || template_parts.is_empty() {
                    template_parts.push(current_text);
                }

                if has_expressions {
                    let value = template_parts.join("");
                    if is_style_attr {
                        // For style attribute with expressions, use $.attr_style()
                        Ok(Some(format!("${{$.attr_style(`{}`)}}", value)))
                    } else {
                        // For other attributes with expressions, use $.attr()
                        // This ensures proper escaping and handling of special values
                        Ok(Some(format!("${{$.attr('{}', `{}`)}}", name, value)))
                    }
                } else {
                    // Pure text - no expressions
                    let value = template_parts.join("");
                    // Skip empty class attributes (matches official compiler behavior)
                    if name == "class" && value.is_empty() {
                        Ok(None)
                    } else {
                        Ok(Some(format!(" {}=\"{}\"", name, value)))
                    }
                }
            }
            AttributeValue::Expression(expr_tag) => {
                // Skip event handler attributes (onclick, onmousedown, etc.)
                if name.starts_with("on") {
                    return Ok(None);
                }

                // Check if the expression is a string literal - if so, inline it directly.
                // Numeric and boolean literals use $.attr() to match official compiler.
                if let Some(literal_value) = self.extract_literal_value(&expr_tag.expression) {
                    return Ok(Some(format!(
                        " {}=\"{}\"",
                        name,
                        escape_attr(&literal_value)
                    )));
                }

                // Generate $.attr() call for non-string-literal expression attributes
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr = self.source[expr_start..expr_end].trim().to_string();
                    Ok(Some(make_attr_call(name, &expr)))
                } else {
                    Ok(None)
                }
            }
        }
    }

    /// Generate class attribute with CSS hash appended if provided.
    fn generate_attribute_node_with_css_hash(
        &mut self,
        node: &AttributeNode,
        css_hash: Option<&str>,
    ) -> Result<Option<String>, TransformError> {
        let name = node.name.as_str();

        match &node.value {
            AttributeValue::True(_) => {
                // class with no value - just add the hash
                if let Some(hash) = css_hash {
                    Ok(Some(format!(" {}=\"{}\"", name, hash)))
                } else {
                    Ok(Some(format!(" {}", name)))
                }
            }
            AttributeValue::Sequence(parts) => {
                // Check if we have any dynamic expressions
                let has_expression = parts
                    .iter()
                    .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));

                if !has_expression {
                    // All static text - inline as string attribute
                    let mut value = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            value.push_str(&escape_attr(&text.data));
                        }
                    }
                    // Normalize whitespace for class attribute
                    let normalized: String = value.split_whitespace().collect::<Vec<_>>().join(" ");
                    // Append CSS hash
                    let final_value = if let Some(hash) = css_hash {
                        if normalized.is_empty() {
                            hash.to_string()
                        } else {
                            format!("{} {}", normalized, hash)
                        }
                    } else {
                        normalized
                    };
                    // Skip empty class attributes (class='' with no CSS hash should be omitted)
                    if final_value.is_empty() {
                        return Ok(None);
                    }
                    return Ok(Some(format!(" {}=\"{}\"", name, final_value)));
                }

                // Has dynamic expressions - need to use $.attr_class()
                // Special case: if the sequence is just whitespace + single expression + whitespace,
                // pass the expression directly to $.attr_class() without template literal wrapping
                {
                    let expr_count = parts
                        .iter()
                        .filter(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                        .count();
                    let all_text_is_whitespace = parts.iter().all(|p| match p {
                        AttributeValuePart::Text(t) => t.data.trim().is_empty(),
                        _ => true,
                    });
                    if expr_count == 1
                        && all_text_is_whitespace
                        && let Some(AttributeValuePart::ExpressionTag(expr_tag)) = parts
                            .iter()
                            .find(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                    {
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim().to_string();
                            if let Some(hash) = css_hash {
                                return Ok(Some(format!(
                                    "${{$.attr_class({}, '{}')}}",
                                    expr, hash
                                )));
                            } else {
                                return Ok(Some(format!("${{$.attr_class({})}}", expr)));
                            }
                        }
                    }
                }

                // Build template literal with $.stringify() for expressions
                let mut template_parts = Vec::new();
                let mut current_text = String::new();
                let mut is_first_part = true;

                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            // Normalize whitespace for class attributes while preserving
                            // leading/trailing spaces that separate parts
                            let trimmed: String =
                                text.data.split_whitespace().collect::<Vec<_>>().join(" ");

                            // Check if original text had leading whitespace (important for parts after expressions)
                            let has_leading_ws = text.data.starts_with(char::is_whitespace);
                            // Check if original text had trailing whitespace (important for parts before expressions)
                            let has_trailing_ws = text.data.ends_with(char::is_whitespace);

                            // Add space prefix if needed (for parts that come after expressions)
                            if has_leading_ws && !is_first_part && !current_text.is_empty() {
                                current_text.push(' ');
                            } else if has_leading_ws && !is_first_part && current_text.is_empty() {
                                // If this is right after an expression, add leading space
                                current_text.push(' ');
                            }

                            current_text.push_str(&trimmed);

                            // Add space suffix if needed (for parts before expressions)
                            if has_trailing_ws && !trimmed.is_empty() {
                                current_text.push(' ');
                            }
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            // Add accumulated text
                            template_parts.push(current_text.clone());
                            current_text.clear();

                            // Add expression wrapped in $.stringify()
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr = self.source[expr_start..expr_end].trim().to_string();
                                template_parts.push(format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                    is_first_part = false;
                }
                // Add any remaining text
                if !current_text.is_empty() {
                    template_parts.push(current_text);
                }

                let template_content = template_parts.join("");

                // Build $.attr_class() call
                if let Some(hash) = css_hash {
                    Ok(Some(format!(
                        "${{$.attr_class(`{}`, '{}')}}",
                        template_content, hash
                    )))
                } else {
                    Ok(Some(format!("${{$.attr_class(`{}`)}}", template_content)))
                }
            }
            AttributeValue::Expression(expr_tag) => {
                // Dynamic class expression - use $.attr_class()
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr = self.source[expr_start..expr_end].trim().to_string();

                    // Check if we need to wrap in $.clsx() for dynamic class expressions
                    let should_clsx = needs_clsx(&node.value);
                    let value_expr = if should_clsx {
                        format!("$.clsx({})", expr)
                    } else {
                        // Pass simple expressions directly to $.attr_class()
                        // The runtime handles coercion, no need for $.stringify()
                        expr.clone()
                    };

                    if let Some(hash) = css_hash {
                        Ok(Some(format!(
                            "${{$.attr_class({}, '{}')}}",
                            value_expr, hash
                        )))
                    } else {
                        Ok(Some(format!("${{$.attr_class({})}}", value_expr)))
                    }
                } else {
                    Ok(None)
                }
            }
        }
    }

    /// Extract a literal string or number value from an Expression.
    /// Returns Some(string_value) if the expression is a Literal, None otherwise.
    /// Extract a string literal value from an expression.
    /// Only returns string literals - numeric and boolean literals should use $.attr() calls
    /// because the official Svelte compiler uses $.attr() for non-string expression attributes.
    fn extract_literal_value(&self, expr: &crate::ast::js::Expression) -> Option<String> {
        let json = expr.as_json();
        let expr_type = json.get("type").and_then(|t| t.as_str())?;

        if expr_type == "Literal" {
            // Only inline string literals. Numeric and boolean literals should
            // use $.attr() calls to match the official compiler behavior.
            if let Some(serde_json::Value::String(s)) = json.get("value") {
                return Some(s.clone());
            }
        }

        None
    }

    /// Extract a plain text value from an attribute.
    fn extract_attribute_text_value(&self, node: &AttributeNode) -> Option<String> {
        match &node.value {
            AttributeValue::Sequence(parts) => {
                let mut value = String::new();
                for part in parts {
                    if let AttributeValuePart::Text(text) = part {
                        value.push_str(&text.data);
                    }
                }
                Some(value)
            }
            AttributeValue::True(_) => None,
            AttributeValue::Expression(_) => None,
        }
    }

    /// Generate a $.attr_class() call for class directives.
    fn generate_attr_class_call(
        &self,
        directives: &[&ClassDirective],
        base_class: Option<&str>,
    ) -> Result<String, TransformError> {
        // Build the directives object
        let mut directive_props = Vec::new();
        for dir in directives {
            // Get the expression - if it's an Identifier with the same name, use shorthand
            let expr_start = dir.expression.start().unwrap_or(0) as usize;
            let expr_end = dir.expression.end().unwrap_or(0) as usize;

            let expr_value = if expr_end > expr_start && expr_end <= self.source.len() {
                self.source[expr_start..expr_end].trim().to_string()
            } else {
                dir.name.to_string()
            };

            directive_props.push(format!("'{}': {}", dir.name, expr_value));
        }

        let directives_obj = format!("{{ {} }}", directive_props.join(", "));

        // Check if base_class is a dynamic expression (marked with __EXPR__: prefix)
        let base_arg = match base_class {
            Some(s) if s.starts_with("__EXPR__:") => {
                // Dynamic expression - use $.clsx(expr) or expr directly
                let expr = &s["__EXPR__:".len()..];
                format!("$.clsx({})", expr)
            }
            Some(s) if !s.is_empty() => {
                // Static text value - quote it
                format!("'{}'", s)
            }
            _ => {
                // No base class
                "''".to_string()
            }
        };

        // Output: ${$.attr_class(base, void 0, { 'foo': foo })}
        Ok(format!(
            "${{$.attr_class({}, void 0, {})}}",
            base_arg, directives_obj
        ))
    }

    /// Generate a $.attr_style() call for style directives.
    fn generate_attr_style_call(
        &self,
        directives: &[&StyleDirective],
        base_style: Option<&str>,
    ) -> Result<String, TransformError> {
        // Separate normal and important properties
        let mut normal_props = Vec::new();
        let mut important_props = Vec::new();

        for dir in directives {
            let value = match &dir.value {
                AttributeValue::True(_) => {
                    // Shorthand: style:color means style:color={color}
                    dir.name.to_string()
                }
                AttributeValue::Sequence(parts) => {
                    // Static text value
                    let mut text_val = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            text_val.push_str(&text.data);
                        }
                    }
                    format!("'{}'", text_val)
                }
                AttributeValue::Expression(expr_tag) => {
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        self.source[expr_start..expr_end].trim().to_string()
                    } else {
                        "undefined".to_string()
                    }
                }
            };

            // CSS custom properties (--var) keep their case, others get lowercased
            let prop_name = if dir.name.starts_with("--") {
                dir.name.to_string()
            } else {
                dir.name.to_lowercase().replace("_", "-")
            };

            // Only quote property names that contain special characters like hyphens
            let prop_str = if prop_name.contains('-') {
                format!("'{}': {}", prop_name, value)
            } else {
                format!("{}: {}", prop_name, value)
            };

            // Check for !important modifier
            if dir.modifiers.iter().any(|m| m.as_str() == "important") {
                important_props.push(prop_str);
            } else {
                normal_props.push(prop_str);
            }
        }

        // Build the directives argument
        let directives_arg = if !important_props.is_empty() {
            // Array form: [{ normal }, { important }]
            format!(
                "[{{ {} }}, {{ {} }}]",
                normal_props.join(", "),
                important_props.join(", ")
            )
        } else {
            // Object form: { normal }
            format!("{{ {} }}", normal_props.join(", "))
        };

        // Output: ${$.attr_style('base', { color: 'red' })}
        let base = base_style.unwrap_or("");
        Ok(format!("${{$.attr_style('{}', {})}}", base, directives_arg))
    }
}
