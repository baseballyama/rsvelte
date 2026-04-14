//! Server-side element visitor.
//!
//! Contains generate_element() and all element-related methods including
//! attribute generation, class/style directive handling, and spread attributes.

use super::super::ServerCodeGenerator;
use super::super::helpers::{collapse_whitespace, needs_clsx, prop_string, quote_prop_name};
use super::super::types::OutputPart;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, BindDirective, ClassDirective,
    RegularElement, StyleDirective, TemplateNode,
};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{
    escape_attr, escape_html, is_void_element, sanitize_template_string,
};
use crate::compiler::phases::phase3_transform::utils::{
    is_svelte_whitespace_only, svelte_trim, svelte_trim_end, svelte_trim_start,
};

/// Compute 1-based line number and 0-based column for a byte offset in source.
pub(crate) fn locate_in_source(source: &str, offset: usize) -> (usize, usize) {
    let offset = offset.min(source.len());
    let mut line = 1usize;
    let mut col = 0usize;
    for (i, ch) in source.char_indices() {
        if i >= offset {
            break;
        }
        if ch == '\n' {
            line += 1;
            col = 0;
        } else {
            col += 1;
        }
    }
    (line, col)
}

/// Descendant type for customizable select element checking.
enum SelectDescendant {
    RegularElement(String),
    Text,
    Other,
}

/// Check if an element emits `load` and `error` events.
/// Reference: svelte/src/utils.js - LOAD_ERROR_ELEMENTS
fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
    )
}

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_element(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        // Lowercase element names in HTML namespace for XHTML compatibility
        // Reference: RegularElement.js L18: `const name = context.state.namespace === 'html' ? node.name.toLowerCase() : node.name;`
        let name_owned: String = if !element.metadata.svg && !element.metadata.mathml {
            element.name.to_lowercase().to_string()
        } else {
            element.name.to_string()
        };
        let name = name_owned.as_str();

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
        let mut shorthand_style_vars: Vec<String> = Vec::new();
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

        // Detect content-editable binding (bind:innerHTML, bind:textContent, bind:innerText)
        let content_editable_expr: Option<String> = element.attributes.iter().find_map(|attr| {
            if let Attribute::BindDirective(bind) = attr {
                let bind_name = bind.name.as_str();
                if matches!(bind_name, "innerHTML" | "textContent" | "innerText") {
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let raw = self.source[expr_start..expr_end].trim().to_string();
                        let raw = self.transform_store_refs(&raw);
                        return Some(raw);
                    }
                }
            }
            None
        });

        for attr in &element.attributes {
            match attr {
                Attribute::ClassDirective(dir) => {
                    class_directives.push(dir);
                }
                Attribute::StyleDirective(dir) => {
                    style_directives.push(dir);
                    // Track shorthand style directives (style:color without explicit value)
                    // These bypass the PromiseOptimiser transform in the official compiler
                    if matches!(&dir.value, AttributeValue::True(_)) {
                        shorthand_style_vars.push(dir.name.to_string());
                    }
                }
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    // Check for mixed text+expression sequence FIRST (before extract_attribute_text_value
                    // which would only extract the text parts)
                    if let AttributeValue::Sequence(parts) = &node.value {
                        let has_expr = parts
                            .iter()
                            .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                        if has_expr {
                            // Mixed text + expression: class="block {expr}"
                            let mut tmpl = String::new();
                            for part in parts {
                                match part {
                                    AttributeValuePart::Text(text) => {
                                        tmpl.push_str(&text.data);
                                    }
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        let es = expr_tag.expression.start().unwrap_or(0) as usize;
                                        let ee = expr_tag.expression.end().unwrap_or(0) as usize;
                                        if ee > es && ee <= self.source.len() {
                                            let expr = self.source[es..ee].trim().to_string();
                                            let expr = self.transform_store_refs(&expr);
                                            tmpl.push_str(&format!("${{$.stringify({})}}", expr));
                                        }
                                    }
                                }
                            }
                            base_class = Some(format!("__TMPL__:{}", tmpl));
                        } else {
                            base_class = self.extract_attribute_text_value(node);
                        }
                    } else if let AttributeValue::Expression(expr_tag) = &node.value {
                        // Single expression: class={expr}
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                            let raw_expr = self.transform_store_refs(&raw_expr);
                            base_class = Some(format!("__EXPR__:{}", raw_expr));
                        }
                    } else {
                        base_class = self.extract_attribute_text_value(node);
                    }
                }
                Attribute::Attribute(node) if node.name.as_str() == "style" => {
                    // Use extract_style_attribute_base which handles dynamic expressions
                    // (e.g., style="background-color: {settings.bg}") as template literals.
                    base_style = self.extract_style_attribute_base(node);
                    // Also extract dynamic expression for style={expr} with style directives
                    if base_style.is_none()
                        && let AttributeValue::Expression(expr_tag) = &node.value
                    {
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                            base_style = Some(format!("__EXPR__:{}", raw_expr));
                        }
                    }
                }
                _ => {}
            }
        }

        // For <style> and <script> elements (non-top-level, inside other elements),
        // emit a Flush marker before the element. The official Svelte compiler outputs
        // these as separate $$renderer.push() calls.
        let is_style_or_script = name == "style" || name == "script";
        if is_style_or_script {
            self.output_parts.push(OutputPart::Flush);
        }

        // Start tag
        let mut tag = format!("<{}", name);

        // Track whether we've already emitted the attr_class and attr_style calls
        let mut emitted_class = false;
        let mut emitted_style = false;

        // Attributes - handle class and style specially if directives exist
        // When there's an explicit class/style attribute with corresponding directives,
        // emit attr_class/attr_style at the position of that attribute.
        // When there's NO explicit class/style attribute (only directives), emit after
        // all other attributes.
        for attr in &element.attributes {
            // Only trigger emission at an explicit class/style ATTRIBUTE position, not directives
            let is_class_attr_with_directives = matches!(attr, Attribute::Attribute(node) if node.name.as_str() == "class" && !class_directives.is_empty());
            let is_style_attr_with_directives = matches!(attr, Attribute::Attribute(node) if node.name.as_str() == "style" && !style_directives.is_empty());

            if is_class_attr_with_directives && !emitted_class {
                emitted_class = true;
                // Emit attr_class at the class attribute position
                let attr_class_call = self.generate_attr_class_call(
                    &class_directives,
                    base_class.as_deref(),
                    css_hash.as_deref(),
                )?;
                tag.push_str(&attr_class_call);
                continue;
            }
            if is_style_attr_with_directives && !emitted_style {
                emitted_style = true;
                // Emit attr_style at the style attribute position
                let attr_style_call =
                    self.generate_attr_style_call(&style_directives, base_style.as_deref())?;
                tag.push_str(&attr_style_call);
                continue;
            }

            // Skip class/style directives and class/style attributes when directives exist
            let is_class_related =
                matches!(attr, Attribute::ClassDirective(_)) || is_class_attr_with_directives;
            let is_style_related =
                matches!(attr, Attribute::StyleDirective(_)) || is_style_attr_with_directives;
            if is_class_related || is_style_related {
                continue;
            }

            match attr {
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => continue,
                // Handle class attribute specially - add CSS hash if scoped (no directives case)
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    if let Some(attr_str) =
                        self.generate_attribute_node_with_css_hash(node, css_hash.as_deref())?
                    {
                        tag.push_str(&attr_str);
                    }
                }
                Attribute::BindDirective(bind)
                    if matches!(
                        bind.name.as_str(),
                        "innerHTML" | "textContent" | "innerText"
                    ) =>
                {
                    // Skip content-editable bindings in the tag - they're handled as body content
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

        // If element is scoped but has no class attribute and no class directives,
        // add a class attribute with just the hash
        if let Some(ref hash) = css_hash
            && base_class.is_none()
            && class_directives.is_empty()
        {
            tag.push_str(&format!(" class=\"{}\"", hash));
        }

        // Emit any remaining class/style directives that weren't handled in the loop
        if !class_directives.is_empty() && !emitted_class {
            let attr_class_call = self.generate_attr_class_call(
                &class_directives,
                base_class.as_deref(),
                css_hash.as_deref(),
            )?;
            tag.push_str(&attr_class_call);
        }
        if !style_directives.is_empty() && !emitted_style {
            let attr_style_call =
                self.generate_attr_style_call(&style_directives, base_style.as_deref())?;
            tag.push_str(&attr_style_call);
        }

        // For load/error elements (img, video, etc.), add event capture attributes
        // when the element has onerror/onload event handlers.
        // Reference: element.js lines 272-276
        if is_load_error_element(name) {
            let has_onerror = element
                .attributes
                .iter()
                .any(|a| matches!(a, Attribute::Attribute(n) if n.name == "onerror"));
            let has_onload = element
                .attributes
                .iter()
                .any(|a| matches!(a, Attribute::Attribute(n) if n.name == "onload"));
            if has_onerror {
                tag.push_str(" onerror=\"this.__e=event\"");
            }
            if has_onload {
                tag.push_str(" onload=\"this.__e=event\"");
            }
        }

        if is_void_element(name) {
            tag.push_str("/>");
            if shorthand_style_vars.is_empty() {
                self.output_parts.push(OutputPart::Html(tag));
            } else {
                self.output_parts.push(OutputPart::HtmlWithExclusions {
                    html: tag,
                    excluded_blocker_vars: shorthand_style_vars.clone(),
                });
            }
            // In dev mode, add $.push_element()/$.pop_element() for void elements
            if self.dev {
                let (line, col) = locate_in_source(&self.source, element.start as usize);
                self.output_parts.push(OutputPart::Flush);
                self.output_parts.push(OutputPart::RawStatement(format!(
                    "$.push_element($$renderer, '{}', {}, {});",
                    name, line, col
                )));
                self.output_parts
                    .push(OutputPart::RawStatement("$.pop_element();".to_string()));
            }
        } else {
            tag.push('>');
            if shorthand_style_vars.is_empty() {
                self.output_parts.push(OutputPart::Html(tag));
            } else {
                self.output_parts.push(OutputPart::HtmlWithExclusions {
                    html: tag,
                    excluded_blocker_vars: shorthand_style_vars,
                });
            }
            // In dev mode, add $.push_element() after opening tag
            if self.dev {
                let (line, col) = locate_in_source(&self.source, element.start as usize);
                self.output_parts.push(OutputPart::Flush);
                self.output_parts.push(OutputPart::RawStatement(format!(
                    "$.push_element($$renderer, '{}', {}, {});",
                    name, line, col
                )));
            }

            // If we have a content-editable binding, generate children into a sub-generator
            // and emit ContentEditableBody which will generate the if/else pattern
            if let Some(ref body_expr) = content_editable_expr {
                // Generate children using fragment processing for proper whitespace trimming
                let children_body =
                    self.generate_fragment_body_parts_inner(&element.fragment, true)?;
                self.output_parts.push(OutputPart::ContentEditableBody {
                    value_expr: body_expr.clone(),
                    children_body,
                });
                self.output_parts
                    .push(OutputPart::Html(format!("</{}>", name)));
                if self.dev {
                    self.output_parts
                        .push(OutputPart::RawStatement("$.pop_element();".to_string()));
                }
                return Ok(());
            }

            // For <script> and <style> elements (which are non-top-level raw text elements),
            // output their content as-is without HTML escaping or whitespace processing.
            // This matches the official Svelte compiler behavior where these elements
            // preserve their raw text content.
            if name == "script" || name == "style" {
                for child in &element.fragment.nodes {
                    if let TemplateNode::Text(text) = child {
                        self.output_parts
                            .push(OutputPart::Html(sanitize_template_string(&text.data)));
                    }
                }
                self.output_parts
                    .push(OutputPart::Html(format!("</{}>", name)));
                if self.dev {
                    self.output_parts
                        .push(OutputPart::RawStatement("$.pop_element();".to_string()));
                }
                // Flush after closing tag to ensure subsequent content starts a new push call
                self.output_parts.push(OutputPart::Flush);
                return Ok(());
            }

            // Children - filter and process with position awareness
            // First, filter out comments and find meaningful content boundaries
            let children: Vec<_> = element.fragment.nodes.iter().collect();

            // For <pre> and <textarea>, preserve whitespace in children
            // This matches the official compiler behavior
            let preserve_children_whitespace =
                self.preserve_whitespace || name == "pre" || name == "textarea";

            if preserve_children_whitespace {
                // Preserve whitespace: output children as-is (no trimming/collapsing)
                let saved_preserve = self.preserve_whitespace;
                self.preserve_whitespace = true;

                // If the first text node inside a <pre> is a single newline, discard it.
                // This matches the official compiler's clean_nodes behavior (utils.js lines 253-262):
                // browsers would strip it anyway, and keeping it would break hydration.
                let skip_first_newline = name == "pre"
                    && matches!(
                        children.first(),
                        Some(TemplateNode::Text(t)) if t.data.as_str() == "\n" || t.data.as_str() == "\r\n"
                    );

                for (idx, child) in children.iter().enumerate() {
                    if skip_first_newline && idx == 0 {
                        continue; // Skip the first newline text node
                    }
                    if matches!(child, TemplateNode::Comment(_)) {
                        continue;
                    }
                    self.generate_node(child, false)?;
                }
                self.preserve_whitespace = saved_preserve;
                self.output_parts
                    .push(OutputPart::Html(format!("</{}>", name)));
                if self.dev {
                    self.output_parts
                        .push(OutputPart::RawStatement("$.pop_element();".to_string()));
                }
                return Ok(());
            }

            // Find first and last non-whitespace, non-comment, non-snippet children
            // Snippet blocks are hoisted and don't produce inline output
            let _first_content = children.iter().position(|c| {
                !matches!(c, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                    && !matches!(c, TemplateNode::Comment(_))
                    && !matches!(c, TemplateNode::SnippetBlock(_))
            });
            let last_content = children.iter().rposition(|c| {
                !matches!(c, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                    && !matches!(c, TemplateNode::Comment(_))
                    && !matches!(c, TemplateNode::SnippetBlock(_))
            });

            // Special case: if the only meaningful child is a <script> element,
            // add a comment anchor after it. This matches the official compiler's
            // clean_nodes behavior to ensure run_scripts logic can work correctly.
            let meaningful: Vec<_> = children
                .iter()
                .filter(|c| {
                    !matches!(c, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                        && !matches!(c, TemplateNode::Comment(_))
                        && !matches!(c, TemplateNode::SnippetBlock(_))
                })
                .collect();
            let lone_script = meaningful.len() == 1
                && matches!(meaningful[0], TemplateNode::RegularElement(el) if el.name.as_str() == "script");

            let mut has_output_content = false;
            let mut is_first_content = true;
            // Track whether the last output was a whitespace-only space.
            // This prevents double spaces when comments are stripped between
            // two whitespace-only text nodes (matching clean_nodes which strips
            // comments before whitespace collapsing).
            let mut last_output_was_space = false;

            for (i, child) in children.iter().enumerate() {
                // Skip comments
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }

                // For text nodes, check if it should become a space
                if let TemplateNode::Text(text) = child {
                    let data = &text.data;

                    // Determine whether prev/next non-comment sibling is an ExpressionTag.
                    // The official compiler's clean_nodes skips whitespace collapsing
                    // when the neighbor is an ExpressionTag (they form one text node).
                    let prev_is_expr = {
                        let mut found = false;
                        let mut pi = i;
                        while pi > 0 {
                            pi -= 1;
                            if !matches!(children[pi], TemplateNode::Comment(_)) {
                                found = matches!(children[pi], TemplateNode::ExpressionTag(_));
                                break;
                            }
                        }
                        found
                    };
                    let next_is_expr = {
                        let mut found = false;
                        let mut ni = i + 1;
                        while ni < children.len() {
                            if !matches!(children[ni], TemplateNode::Comment(_)) {
                                found = matches!(children[ni], TemplateNode::ExpressionTag(_));
                                break;
                            }
                            ni += 1;
                        }
                        found
                    };

                    if is_svelte_whitespace_only(data) {
                        // For certain elements, skip all whitespace-only text nodes entirely
                        let is_svg_parent = element.metadata.svg && name != "text";
                        let can_remove_whitespace = is_svg_parent
                            || matches!(
                                name,
                                "select"
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
                        // Whitespace-only text between ExpressionTags: preserve as-is
                        if prev_is_expr && next_is_expr {
                            self.output_parts
                                .push(OutputPart::Html(sanitize_template_string(data)));
                            last_output_was_space = false;
                            has_output_content = true;
                            continue;
                        }
                        // Whitespace-only text: matching clean_nodes behavior.
                        // In clean_nodes, text nodes are modified in-place: if the previous
                        // text ends with whitespace, leading whitespace is stripped (→ empty).
                        // The next text then checks this empty text (which doesn't end with ws)
                        // and replaces its leading whitespace with " ".
                        if has_output_content
                            && last_content.is_some()
                            && i < last_content.unwrap()
                            && !data.is_empty()
                        {
                            if !last_output_was_space {
                                self.output_parts.push(OutputPart::Html(" ".to_string()));
                                last_output_was_space = true;
                            } else {
                                // Text stripped (like clean_nodes setting data to "").
                                // Reset flag so the next text can produce a space.
                                last_output_was_space = false;
                            }
                        }
                        continue;
                    }
                    last_output_was_space = false;

                    // For text nodes, only collapse leading/trailing whitespace
                    // matching the official compiler's clean_nodes behavior:
                    // - Leading whitespace: trimmed (first) or collapsed to ' ' (others)
                    //   unless prev is ExpressionTag (preserve whitespace)
                    // - Trailing whitespace: trimmed (last) or collapsed to ' ' (others)
                    //   unless next is ExpressionTag (preserve whitespace)
                    // - Internal whitespace is preserved as-is
                    let is_last = last_content.is_some() && i == last_content.unwrap();
                    if is_first_content {
                        let mut result = svelte_trim_start(data).to_string();
                        if is_last {
                            result = svelte_trim_end(&result).to_string();
                        } else if !next_is_expr {
                            // Collapse trailing whitespace to single space
                            let rtrimmed = result.trim_end();
                            if rtrimmed.len() < result.len() && !rtrimmed.is_empty() {
                                result = format!("{} ", rtrimmed);
                            }
                        }
                        if !result.is_empty() {
                            // Track if this text ends with whitespace to prevent double spaces
                            last_output_was_space = result.ends_with([' ', '\t', '\r', '\n']);
                            self.output_parts.push(OutputPart::Html(escape_html(
                                &sanitize_template_string(&result),
                            )));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    if is_last {
                        // Collapse leading whitespace unless prev is ExpressionTag
                        let result = if !prev_is_expr {
                            let ltrimmed = data.trim_start();
                            if ltrimmed.len() < data.len() && !ltrimmed.is_empty() {
                                format!(" {}", ltrimmed)
                            } else {
                                data.to_string()
                            }
                        } else {
                            data.to_string()
                        };
                        let result = svelte_trim_end(&result).to_string();
                        if !result.is_empty() {
                            self.output_parts.push(OutputPart::Html(escape_html(
                                &sanitize_template_string(&result),
                            )));
                        }
                        has_output_content = true;
                        continue;
                    }

                    // Middle text: collapse leading/trailing whitespace unless adjacent
                    // to ExpressionTag
                    let result = if !prev_is_expr {
                        let ltrimmed = data.trim_start();
                        if ltrimmed.len() < data.len() && !ltrimmed.is_empty() {
                            format!(" {}", ltrimmed)
                        } else {
                            data.to_string()
                        }
                    } else {
                        data.to_string()
                    };
                    let result = if !next_is_expr {
                        let rtrimmed = result.trim_end();
                        if rtrimmed.len() < result.len() && !rtrimmed.is_empty() {
                            format!("{} ", rtrimmed)
                        } else {
                            result
                        }
                    } else {
                        result
                    };
                    if !result.is_empty() {
                        // Track if this text ends with whitespace to prevent double spaces
                        last_output_was_space = result.ends_with([' ', '\t', '\r', '\n']);
                        self.output_parts.push(OutputPart::Html(escape_html(
                            &sanitize_template_string(&result),
                        )));
                    }
                    has_output_content = true;
                    is_first_content = false;
                    continue;
                }

                self.generate_node(child, false)?;
                // Snippet blocks and debug tags are hoisted/transparent and don't produce inline output
                if !matches!(
                    child,
                    TemplateNode::SnippetBlock(_) | TemplateNode::DebugTag(_)
                ) {
                    has_output_content = true;
                    is_first_content = false;
                    last_output_was_space = false;
                }
            }

            // For select/optgroup with Component/RenderTag/HtmlTag, add <!> marker before closing tag
            if (name == "select" || name == "optgroup")
                && Self::is_customizable_select_element(element)
            {
                self.output_parts.push(OutputPart::HydrationAnchor);
            }

            // Special case: lone script tag needs a comment anchor
            // This matches the official compiler's clean_nodes behavior to ensure
            // run_scripts logic can work correctly (node.replaceWith on a script tag)
            if lone_script {
                self.output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));

            // In dev mode, add $.pop_element() after closing tag
            if self.dev {
                self.output_parts
                    .push(OutputPart::RawStatement("$.pop_element();".to_string()));
            }
        }

        Ok(())
    }

    /// Generate an element with spread attributes using $.attributes().
    fn generate_element_with_spread(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        // Lowercase element names in HTML namespace for XHTML compatibility
        let name_owned: String = if !element.metadata.svg && !element.metadata.mathml {
            element.name.to_lowercase().to_string()
        } else {
            element.name.to_string()
        };
        let name = name_owned.as_str();
        let is_textarea = name == "textarea";
        let is_select = name == "select";

        // Build the object literal for $.attributes()
        let mut object_parts: Vec<String> = Vec::new();
        // Collect class directives: { className: expression }
        let mut class_directive_parts: Vec<String> = Vec::new();
        // Collect style directives: { styleName: expression }
        let mut style_directive_parts: Vec<String> = Vec::new();
        // For textarea: value expression to be rendered as body content
        let mut textarea_content: Option<String> = None;

        for attr in &element.attributes {
            match attr {
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        // Transform rune calls in spread expressions
                        let mut expr = Self::transform_rune_in_template_expr(&expr);
                        // In dev mode, if the parent element has a svelte-ignore
                        // state_snapshot_uncloneable comment, add `true` arg to $.snapshot()
                        if self.dev
                            && memchr::memmem::find(expr.as_bytes(), b"$.snapshot(").is_some()
                        {
                            let elem_start = element.start as usize;
                            if elem_start <= self.source.len() {
                                let before = &self.source[..elem_start];
                                if crate::compiler::phases::phase3_transform::server::transform_script::has_svelte_ignore_before_pub(before, "state_snapshot_uncloneable") {
                                    // Add `, true` before closing paren of $.snapshot()
                                    if let Some(idx) = memchr::memmem::find(expr.as_bytes(), b"$.snapshot(") {
                                        let call_start = idx + "$.snapshot(".len();
                                        if let Some(paren_end) = find_matching_paren_simple(&expr[call_start..]) {
                                            let content = &expr[call_start..call_start + paren_end];
                                            let new_call = format!("$.snapshot({}, true)", content);
                                            expr = format!("{}{}{}", &expr[..idx], new_call, &expr[call_start + paren_end + 1..]);
                                        }
                                    }
                                }
                            }
                        }
                        object_parts.push(format!("...{}", expr));
                    }
                }
                Attribute::Attribute(node) => {
                    // Skip event handlers
                    if node.name.starts_with("on") {
                        continue;
                    }
                    let raw_attr_name = node.name.as_str();
                    // Skip defaultValue and defaultChecked - these are pseudo-properties,
                    // not real HTML attributes.
                    // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js L78-79
                    if raw_attr_name == "defaultValue" || raw_attr_name == "defaultChecked" {
                        continue;
                    }
                    // For textarea, value becomes body content, not an attribute
                    // For select, value is omitted entirely (it has no effect on HTML output)
                    // Reference: element.js lines 48-68
                    if raw_attr_name == "value" {
                        if is_textarea {
                            let value = self.extract_attribute_value_as_string(node)?;
                            // Don't wrap in $.escape() here - TextareaBody output part handles that
                            textarea_content = Some(value);
                            continue;
                        } else if is_select {
                            continue;
                        }
                    }
                    // Lowercase attribute names for HTML elements (not SVG/MathML)
                    // in $.attributes() spread objects
                    let attr_name_owned: String =
                        if !element.metadata.svg && !element.metadata.mathml {
                            raw_attr_name.to_lowercase()
                        } else {
                            raw_attr_name.to_string()
                        };
                    let attr_name = attr_name_owned.as_str();
                    let value = self.extract_attribute_value_as_string(node)?;
                    // Wrap class attribute dynamic expressions in $.clsx()
                    let value = if attr_name == "class" && needs_clsx(&node.value) {
                        format!("$.clsx({})", value)
                    } else {
                        value
                    };
                    object_parts.push(prop_string(attr_name, &value));
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    // Skip bind:this on server - it's a DOM reference only needed client-side
                    if bind_name == "this" {
                        continue;
                    }
                    // Handle bind:group specially: convert to checked: groupValue === inputValue
                    if bind_name == "group" {
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let group_expr = self.source[expr_start..expr_end].trim().to_string();
                            // Find the value attribute for this element
                            let value_expr = element.attributes.iter().find_map(|a| {
                                if let Attribute::Attribute(node) = a
                                    && node.name.as_str() == "value"
                                {
                                    match &node.value {
                                        AttributeValue::Sequence(parts) => {
                                            let expr_parts: Vec<&AttributeValuePart> = parts
                                                .iter()
                                                .filter(|p| {
                                                    !matches!(p, AttributeValuePart::Text(t) if t.data.is_empty())
                                                })
                                                .collect();
                                            if expr_parts.len() == 1 {
                                                match expr_parts[0] {
                                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                                        let s = expr_tag.expression.start().unwrap_or(0) as usize;
                                                        let e = expr_tag.expression.end().unwrap_or(0) as usize;
                                                        if e > s && e <= self.source.len() {
                                                            Some(self.source[s..e].trim().to_string())
                                                        } else {
                                                            None
                                                        }
                                                    }
                                                    AttributeValuePart::Text(text) => {
                                                        Some(format!("'{}'", text.data))
                                                    }
                                                }
                                            } else {
                                                let mut text_val = String::new();
                                                for p in parts {
                                                    if let AttributeValuePart::Text(t) = p {
                                                        text_val.push_str(&t.data);
                                                    }
                                                }
                                                Some(format!("'{}'", text_val))
                                            }
                                        }
                                        AttributeValue::Expression(expr_tag) => {
                                            let s = expr_tag.expression.start().unwrap_or(0) as usize;
                                            let e = expr_tag.expression.end().unwrap_or(0) as usize;
                                            if e > s && e <= self.source.len() {
                                                Some(self.source[s..e].trim().to_string())
                                            } else {
                                                None
                                            }
                                        }
                                        AttributeValue::True(_) => Some("true".to_string()),
                                    }
                                } else {
                                    None
                                }
                            });
                            // Determine if checkbox
                            let is_checkbox = element.attributes.iter().any(|a| {
                                if let Attribute::Attribute(node) = a
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
                            });
                            if let Some(value) = value_expr {
                                let checked_expr = if is_checkbox {
                                    format!("{}.includes({})", group_expr, value)
                                } else {
                                    format!("{} === {}", group_expr, value)
                                };
                                object_parts.push(format!("checked: {}", checked_expr));
                            }
                        }
                        continue;
                    }
                    // For textarea, bind:value becomes body content
                    // For select, bind:value is skipped (handled via $$renderer.select)
                    if bind_name == "value" && is_textarea {
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim().to_string();
                            // Don't wrap in $.escape() here - TextareaBody output part handles that
                            textarea_content = Some(expr);
                        }
                        continue;
                    }
                    if bind_name == "value" && is_select {
                        continue;
                    }
                    // Skip other omitted SSR bindings
                    if Self::should_omit_binding_in_ssr(bind_name) {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(prop_string(bind_name, &expr));
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
                    if class_name == value {
                        class_directive_parts.push(class_name.to_string());
                    } else {
                        class_directive_parts.push(format!("{}: {}", class_name, value));
                    }
                }
                Attribute::StyleDirective(style_dir) => {
                    // Build style directive: { styleName: expression }
                    let style_name = style_dir.name.as_str();
                    let value = match &style_dir.value {
                        // Shorthand: style:color means the value is the variable `color`
                        AttributeValue::True(_) => style_name.to_string(),
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
                    // Use shorthand syntax when key == value (e.g. { color } instead of { color: color })
                    // Quote property names with special characters like hyphens (e.g. 'background-color')
                    if value == style_name {
                        style_directive_parts.push(style_name.to_string());
                    } else {
                        style_directive_parts.push(format!(
                            "{}: {}",
                            quote_prop_name(style_name),
                            value
                        ));
                    }
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

        // Add event capture attributes for load/error elements with spreads
        // Reference: element.js lines 272-276
        if is_load_error_element(name) {
            self.output_parts.push(OutputPart::Html(
                " onload=\"this.__e=event\" onerror=\"this.__e=event\"".to_string(),
            ));
        }

        if is_void_element(name) {
            self.output_parts.push(OutputPart::Html("/>".to_string()));
            // In dev mode, add $.push_element()/$.pop_element() for void elements with spreads
            if self.dev {
                let (line, col) = locate_in_source(&self.source, element.start as usize);
                self.output_parts.push(OutputPart::Flush);
                self.output_parts.push(OutputPart::RawStatement(format!(
                    "$.push_element($$renderer, '{}', {}, {});",
                    name, line, col
                )));
                self.output_parts
                    .push(OutputPart::RawStatement("$.pop_element();".to_string()));
            }
        } else if is_textarea && textarea_content.is_some() {
            // For textarea with value/bind:value and spread, output body as content
            // Reference: element.js lines 48-63
            let content_expr = textarea_content.unwrap();
            self.output_parts.push(OutputPart::Html(">".to_string()));
            // In dev mode, add $.push_element() after opening tag
            if self.dev {
                let (line, col) = locate_in_source(&self.source, element.start as usize);
                self.output_parts.push(OutputPart::Flush);
                self.output_parts.push(OutputPart::RawStatement(format!(
                    "$.push_element($$renderer, '{}', {}, {});",
                    name, line, col
                )));
            }
            self.output_parts.push(OutputPart::TextareaBody {
                value_expr: content_expr,
            });
            self.output_parts
                .push(OutputPart::Html("</textarea>".to_string()));
            if self.dev {
                self.output_parts
                    .push(OutputPart::RawStatement("$.pop_element();".to_string()));
            }
        } else {
            self.output_parts.push(OutputPart::Html(">".to_string()));

            // In dev mode, add $.push_element() after opening tag for non-void spread elements
            if self.dev {
                let (line, col) = locate_in_source(&self.source, element.start as usize);
                self.output_parts.push(OutputPart::Flush);
                self.output_parts.push(OutputPart::RawStatement(format!(
                    "$.push_element($$renderer, '{}', {}, {});",
                    name, line, col
                )));
            }

            // For <pre> and <textarea>, preserve whitespace in children
            let preserve_children_whitespace =
                self.preserve_whitespace || name == "pre" || name == "textarea";

            if preserve_children_whitespace {
                let saved_preserve = self.preserve_whitespace;
                self.preserve_whitespace = true;

                // Strip first newline in <pre> (same logic as above)
                let skip_first_newline = name == "pre"
                    && matches!(
                        element.fragment.nodes.first(),
                        Some(TemplateNode::Text(t)) if t.data.as_str() == "\n" || t.data.as_str() == "\r\n"
                    );

                for (idx, child) in element.fragment.nodes.iter().enumerate() {
                    if skip_first_newline && idx == 0 {
                        continue;
                    }
                    if matches!(child, TemplateNode::Comment(_)) {
                        continue;
                    }
                    self.generate_node(child, false)?;
                }
                self.preserve_whitespace = saved_preserve;
                self.output_parts
                    .push(OutputPart::Html(format!("</{}>", name)));
                if self.dev {
                    self.output_parts
                        .push(OutputPart::RawStatement("$.pop_element();".to_string()));
                }
                return Ok(());
            }

            // Generate children with proper whitespace handling
            let children: Vec<_> = element
                .fragment
                .nodes
                .iter()
                .filter(|c| !matches!(c, TemplateNode::Comment(_)))
                .collect();

            // Find first and last non-whitespace content children
            let _first_content = children.iter().position(
                |c| !matches!(c, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data)),
            );
            let last_content = children.iter().rposition(
                |c| !matches!(c, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data)),
            );

            let mut has_output_content = false;
            let mut is_first_content = true;

            // Determine if whitespace-only text nodes can be removed entirely
            // In SVG namespace, whitespace can be removed entirely
            // except inside <text> elements (matching official compiler)
            let is_svg_parent = element.metadata.svg && name != "text";
            let can_remove_whitespace = is_svg_parent
                || matches!(
                    name,
                    "select"
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
                    if is_svelte_whitespace_only(data) {
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
                            svelte_trim(data)
                        } else {
                            svelte_trim_start(data)
                        };
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts.push(OutputPart::Html(escape_html(
                                &sanitize_template_string(&collapsed),
                            )));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    // Handle last content text node - trim trailing whitespace
                    if last_content.is_some() && i == last_content.unwrap() {
                        let trimmed = svelte_trim_end(data);
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts.push(OutputPart::Html(escape_html(
                                &sanitize_template_string(&collapsed),
                            )));
                        }
                        has_output_content = true;
                        continue;
                    }

                    // Middle text - collapse whitespace
                    let collapsed = collapse_whitespace(data);
                    self.output_parts.push(OutputPart::Html(escape_html(
                        &sanitize_template_string(&collapsed),
                    )));
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
            // In dev mode, add $.pop_element() after closing tag
            if self.dev {
                self.output_parts
                    .push(OutputPart::RawStatement("$.pop_element();".to_string()));
            }
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
                        let raw = self.source[start..end].trim().to_string();
                        return Ok(self.transform_store_refs(&raw));
                    }
                }

                let mut value = String::new();
                let mut has_expression = false;
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            // Normalize whitespace for class attributes:
                            // Collapse runs of whitespace to single space, but preserve
                            // leading/trailing spaces so they appear between interpolations.
                            if is_class_attr {
                                let mut normalized = String::new();
                                let mut prev_was_ws = false;
                                for ch in text.data.chars() {
                                    if ch.is_whitespace() {
                                        if !prev_was_ws {
                                            normalized.push(' ');
                                        }
                                        prev_was_ws = true;
                                    } else {
                                        normalized.push(ch);
                                        prev_was_ws = false;
                                    }
                                }
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
                                // Transform store refs ($store -> $.store_get())
                                let expr = self.transform_store_refs(expr);
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
                    let raw = self.source[start..end].trim().to_string();
                    Ok(self.transform_store_refs(&raw))
                } else {
                    Ok("undefined".to_string())
                }
            }
        }
    }

    /// Extract attribute value as a literal string if it's static text.
    /// Returns Some(value) for text-only attributes, None for dynamic/expression attributes.
    pub(crate) fn extract_attribute_value_as_literal(
        &self,
        node: &AttributeNode,
    ) -> Result<Option<String>, TransformError> {
        match &node.value {
            AttributeValue::True(_) => Ok(None), // Boolean attributes need special handling
            AttributeValue::Sequence(parts) => {
                // Only return literal if all parts are text
                let mut result = String::new();
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            result.push_str(&text.data);
                        }
                        AttributeValuePart::ExpressionTag(_) => {
                            return Ok(None); // Has dynamic parts
                        }
                    }
                }
                Ok(Some(result))
            }
            AttributeValue::Expression(_) => Ok(None), // Dynamic expression
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

    /// Check if a select, optgroup, or option element has rich content that requires
    /// special hydration handling. Matches the official compiler's `is_customizable_select_element`
    /// in `svelte/packages/svelte/src/compiler/phases/nodes.js`.
    ///
    /// Rich content is:
    /// - For `option`: any RegularElement child
    /// - For `optgroup`: any RegularElement child that isn't `option`, or any Text child
    /// - For `select`: any RegularElement child that isn't `option`/`optgroup`, or any Text child
    /// - For all: any Component, RenderTag, HtmlTag, etc.
    fn is_customizable_select_element(element: &RegularElement) -> bool {
        let element_name = element.name.as_str();
        if element_name == "select" || element_name == "optgroup" || element_name == "option" {
            for descendant in Self::find_descendants(&element.fragment.nodes) {
                match &descendant {
                    SelectDescendant::RegularElement(name) => {
                        if element_name == "select" && name != "option" && name != "optgroup" {
                            return true;
                        }
                        if element_name == "optgroup" && name != "option" {
                            return true;
                        }
                        if element_name == "option" {
                            return true;
                        }
                    }
                    SelectDescendant::Text => {
                        if element_name == "select" || element_name == "optgroup" {
                            return true;
                        }
                    }
                    SelectDescendant::Other => {
                        return true;
                    }
                }
            }
        }
        false
    }

    /// Yields descendant nodes for customizable select element checking.
    /// Mirrors `find_descendants` in the official compiler's `nodes.js`.
    /// Skips SnippetBlock, DebugTag, ConstTag, Comment, ExpressionTag.
    /// Recurses into control flow blocks (if, each, key, boundary).
    /// Yields RegularElement (with name), non-empty Text, and Other for everything else.
    fn find_descendants(nodes: &[TemplateNode]) -> Vec<SelectDescendant> {
        let mut result = Vec::new();
        for node in nodes {
            match node {
                // Skip these
                TemplateNode::SnippetBlock(_)
                | TemplateNode::ConstTag(_)
                | TemplateNode::Comment(_)
                | TemplateNode::ExpressionTag(_) => {}

                // Text: yield if non-empty after trim
                TemplateNode::Text(text) => {
                    if !text.data.trim().is_empty() {
                        result.push(SelectDescendant::Text);
                    }
                }

                // Control flow: recurse into children
                TemplateNode::IfBlock(block) => {
                    result.extend(Self::find_descendants(&block.consequent.nodes));
                    if let Some(alt) = &block.alternate {
                        result.extend(Self::find_descendants(&alt.nodes));
                    }
                }
                TemplateNode::EachBlock(block) => {
                    result.extend(Self::find_descendants(&block.body.nodes));
                    if let Some(fallback) = &block.fallback {
                        result.extend(Self::find_descendants(&fallback.nodes));
                    }
                }
                TemplateNode::KeyBlock(block) => {
                    result.extend(Self::find_descendants(&block.fragment.nodes));
                }
                TemplateNode::SvelteBoundary(boundary) => {
                    result.extend(Self::find_descendants(&boundary.fragment.nodes));
                }

                // RegularElement: yield with name
                TemplateNode::RegularElement(elem) => {
                    result.push(SelectDescendant::RegularElement(elem.name.to_string()));
                }

                // Everything else (Component, RenderTag, HtmlTag, etc.)
                _ => {
                    result.push(SelectDescendant::Other);
                }
            }
        }
        result
    }

    /// Check if nodes contain Component, RenderTag, or HtmlTag (recursively through control flow).
    /// Used by the `<!>` anchor logic. This is a simpler check than `is_customizable_select_element`.
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
                self.generate_bind_directive_for_element_instance(bind, element)
            }
            // Event handlers are not rendered on server
            Attribute::OnDirective(_) => Ok(None),
            _ => Ok(None),
        }
    }

    /// Instance method wrapper for bind directive generation that applies
    /// TypeScript stripping and store reference transforms.
    fn generate_bind_directive_for_element_instance(
        &self,
        bind: &BindDirective,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        let name = bind.name.as_str();

        // Skip bindings that should be omitted in SSR
        if Self::should_omit_binding_in_ssr(name) {
            return Ok(None);
        }

        // Skip bind:value on file input elements
        if name == "value"
            && let Some(el) = element
        {
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

        if expr_end > expr_start && expr_end <= self.source.len() {
            // Check if the expression is a getter/setter pair (SequenceExpression).
            // In Svelte 5, bind:value={() => val, (v) => val = v} is a getter/setter pair.
            // For SSR, we only need the getter's value (invoke the getter immediately).
            let expr_type = bind.expression.node_type().unwrap_or("");

            let expr = if expr_type == "SequenceExpression" {
                let json = bind.expression.as_json();
                // Extract just the getter (first expression in the sequence)
                // and wrap it in an IIFE: (() => val)()
                if let Some(expressions) = json.get("expressions").and_then(|e| e.as_array()) {
                    if let Some(getter) = expressions.first() {
                        let getter_expr = crate::ast::js::Expression::Value(getter.clone());
                        let getter_start = getter_expr.start().unwrap_or(0) as usize;
                        let getter_end = getter_expr.end().unwrap_or(0) as usize;
                        if getter_end > getter_start && getter_end <= self.source.len() {
                            let getter_src =
                                self.source[getter_start..getter_end].trim().to_string();
                            let getter_src = self.strip_ts_from_expr(&getter_src);
                            let getter_src = self.transform_store_refs(&getter_src);
                            // Invoke the getter: (() => val)()
                            format!("({})() ", getter_src).trim().to_string()
                        } else {
                            // Fallback to full expression
                            let raw = self.source[expr_start..expr_end].trim().to_string();
                            let raw = self.strip_ts_from_expr(&raw);
                            self.transform_store_refs(&raw)
                        }
                    } else {
                        let raw = self.source[expr_start..expr_end].trim().to_string();
                        let raw = self.strip_ts_from_expr(&raw);
                        self.transform_store_refs(&raw)
                    }
                } else {
                    let raw = self.source[expr_start..expr_end].trim().to_string();
                    let raw = self.strip_ts_from_expr(&raw);
                    self.transform_store_refs(&raw)
                }
            } else {
                let raw = self.source[expr_start..expr_end].trim().to_string();
                let raw = self.strip_ts_from_expr(&raw);
                self.transform_store_refs(&raw)
            };

            // Handle bind:group specially - convert to checked attribute
            if name == "group" {
                return Self::generate_group_binding(element, &self.source, &expr);
            }

            // For bind directives on server, output as $.attr() call
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
                // Both boolean and non-boolean attributes render with empty value for XHTML compatibility: ` disabled=""`
                // Reference: official Svelte compiler uses `name="${literal_value === true ? '' : String(literal_value)}"`
                Ok(Some(format!(" {}=\"\"", name)))
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
                            escape_attr(&sanitize_template_string(&literal_value))
                        )));
                    }

                    // Generate $.attr() call for non-string-literal expression attributes
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        let expr = self.transform_store_refs(&expr);
                        let expr = self.strip_ts_from_expr(&expr);
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
                            // When embedding text in a template literal (as arg to $.attr()),
                            // sanitize for template literal context: escape \, `, and ${.
                            // This matches the official Svelte compiler's sanitize_template_string
                            // applied to quasi.value.cooked (build_attribute_value in utils.js).
                            // For style attributes, collapse whitespace (newlines/tabs to spaces)
                            // to match the official compiler's single-line output.
                            let text_data = if is_style_attr {
                                super::super::helpers::collapse_whitespace(&text.data)
                            } else {
                                text.data.to_string()
                            };
                            current_text.push_str(&sanitize_template_string(&text_data));
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
                                let expr = self.transform_store_refs(&expr);
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
                    // Apply HTML attribute escaping: " -> &quot;, & -> &amp;, < -> &lt;
                    let raw_value = template_parts.join("");
                    let value = escape_attr(&raw_value);
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
                        escape_attr(&sanitize_template_string(&literal_value))
                    )));
                }

                // Generate $.attr() call for non-string-literal expression attributes
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr = self.source[expr_start..expr_end].trim().to_string();
                    let expr = self.transform_store_refs(&expr);
                    let expr = self.strip_ts_from_expr(&expr);
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
                            value.push_str(&escape_attr(&sanitize_template_string(&text.data)));
                        }
                    }
                    // Normalize whitespace for class attribute
                    let normalized: String =
                        value
                            .split_whitespace()
                            .fold(String::new(), |mut acc, word| {
                                if !acc.is_empty() {
                                    acc.push(' ');
                                }
                                acc.push_str(word);
                                acc
                            });
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
                        AttributeValuePart::Text(t) => is_svelte_whitespace_only(&t.data),
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
                            let expr = self.transform_store_refs(&expr);
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
                            let trimmed: String = text.data.split_whitespace().fold(
                                String::new(),
                                |mut acc, word| {
                                    if !acc.is_empty() {
                                        acc.push(' ');
                                    }
                                    acc.push_str(word);
                                    acc
                                },
                            );

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
                    let expr = self.transform_store_refs(&expr);

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
        if expr.node_type()? != "Literal" {
            return None;
        }
        // Only inline string literals. Numeric and boolean literals should
        // use $.attr() calls to match the official compiler behavior.
        let node = expr.as_node();
        match &*node {
            crate::ast::typed_expr::JsNode::Literal { value, .. } => {
                if let crate::ast::typed_expr::LiteralValue::String(s) = value {
                    Some(s.to_string())
                } else {
                    None
                }
            }
            crate::ast::typed_expr::JsNode::Raw(val) => {
                if let Some(serde_json::Value::String(s)) = val.get("value") {
                    Some(s.clone())
                } else {
                    None
                }
            }
            _ => None,
        }
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

    /// Extract the full value of a style attribute, handling dynamic expressions.
    /// For a purely static style attribute like `style="color: red"`, returns `Some("'color: red'")`.
    /// For a dynamic style like `style="background-color: {settings.bg}"`, returns a template
    /// literal like `Some("` + "`background-color: ${$.stringify(settings.bg)}`" + `")`.
    /// For `style={expr}`, returns `Some("__EXPR__:{expr}")`.
    /// Returns `None` if there is no value.
    fn extract_style_attribute_base(&self, node: &AttributeNode) -> Option<String> {
        match &node.value {
            AttributeValue::Sequence(parts) => {
                // Check if any part is a dynamic expression
                let has_expr = parts
                    .iter()
                    .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));

                if has_expr {
                    // Generate a template literal with $.stringify() for dynamic parts
                    // Collapse whitespace (newlines/tabs/spaces) in text parts to single spaces,
                    // matching the official Svelte compiler's behavior for style attributes.
                    let mut template = String::from("`");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => {
                                // Collapse runs of whitespace (including newlines/tabs)
                                // to single spaces, matching official compiler behavior
                                let collapsed =
                                    super::super::helpers::collapse_whitespace(&text.data);
                                template.push_str(
                                    &collapsed
                                        .replace('\\', "\\\\")
                                        .replace('`', "\\`")
                                        .replace("${", "\\${"),
                                );
                            }
                            AttributeValuePart::ExpressionTag(expr_tag) => {
                                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if expr_end > expr_start && expr_end <= self.source.len() {
                                    let expr_src = self.source[expr_start..expr_end].trim();
                                    let transformed = self.transform_store_refs(expr_src);
                                    template
                                        .push_str(&format!("${{$.stringify({})}}", transformed));
                                }
                            }
                        }
                    }
                    template.push('`');
                    // Use __TEMPL__: prefix so generate_attr_style_call knows it's a raw expression
                    Some(format!("__EXPR__:{}", template))
                } else {
                    // All static text
                    let mut value = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            value.push_str(&text.data);
                        }
                    }
                    Some(value)
                }
            }
            AttributeValue::True(_) => None,
            AttributeValue::Expression(_) => None,
        }
    }

    /// Generate a $.attr_class() call for class directives.
    pub(crate) fn generate_attr_class_call(
        &self,
        directives: &[&ClassDirective],
        base_class: Option<&str>,
        css_hash: Option<&str>,
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

            let expr_value = self.transform_store_refs(&expr_value);
            directive_props.push(format!("'{}': {}", dir.name, expr_value));
        }

        let directives_obj = format!("{{ {} }}", directive_props.join(", "));

        // Check if base_class is a dynamic expression or template literal
        let is_dynamic = base_class
            .map(|s| s.starts_with("__EXPR__:"))
            .unwrap_or(false);
        let is_template = base_class
            .map(|s| s.starts_with("__TMPL__:"))
            .unwrap_or(false);

        let (base_arg, hash_arg) = if is_template {
            // Template literal - hash goes as separate second argument
            let tmpl = &base_class.unwrap()["__TMPL__:".len()..];
            let base = format!("`{}`", tmpl);
            let hash = if let Some(hash) = css_hash {
                format!("'{}'", hash)
            } else {
                "void 0".to_string()
            };
            (base, hash)
        } else if is_dynamic {
            // Dynamic expression - hash goes as separate second argument
            let expr = &base_class.unwrap()["__EXPR__:".len()..];
            // Transform store refs in class expression
            let expr = self.transform_store_refs(expr);
            let base = format!("$.clsx({})", expr);
            let hash = if let Some(hash) = css_hash {
                format!("'{}'", hash)
            } else {
                "void 0".to_string()
            };
            (base, hash)
        } else {
            // Static or empty base class - bake hash into first argument
            let base_str = base_class.unwrap_or("");
            let base = if let Some(hash) = css_hash {
                if base_str.is_empty() {
                    format!("'{}'", hash)
                } else {
                    format!("'{} {}'", base_str, hash)
                }
            } else if base_str.is_empty() {
                "''".to_string()
            } else {
                format!("'{}'", base_str)
            };
            (base, "void 0".to_string())
        };

        // Output: ${$.attr_class(base, hash, { 'foo': foo })}
        Ok(format!(
            "${{$.attr_class({}, {}, {})}}",
            base_arg, hash_arg, directives_obj
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
                    // Check if any part is an expression (dynamic value)
                    let has_expr = parts
                        .iter()
                        .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                    if has_expr {
                        // Generate a template literal: `text${$.stringify(expr)}text`
                        let mut template = String::from("`");
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(text) => {
                                    template.push_str(
                                        &text
                                            .data
                                            .replace('\\', "\\\\")
                                            .replace('`', "\\`")
                                            .replace("${", "\\${"),
                                    );
                                }
                                AttributeValuePart::ExpressionTag(expr_tag) => {
                                    let expr_start =
                                        expr_tag.expression.start().unwrap_or(0) as usize;
                                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                    if expr_end > expr_start && expr_end <= self.source.len() {
                                        let expr_src = self.source[expr_start..expr_end].trim();
                                        let transformed = self.transform_store_refs(expr_src);
                                        template.push_str(&format!(
                                            "${{$.stringify({})}}",
                                            transformed
                                        ));
                                    }
                                }
                            }
                        }
                        template.push('`');
                        template
                    } else {
                        // Static text value only
                        let mut text_val = String::new();
                        for part in parts {
                            if let AttributeValuePart::Text(text) = part {
                                text_val.push_str(&text.data);
                            }
                        }
                        format!("'{}'", text_val)
                    }
                }
                AttributeValue::Expression(expr_tag) => {
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let raw = self.source[expr_start..expr_end].trim().to_string();
                        self.transform_store_refs(&raw)
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
            // Use shorthand notation when property name equals value (e.g., { color } instead of { color: color })
            let prop_str = if prop_name.contains('-') {
                format!("'{}': {}", prop_name, value)
            } else if prop_name == value {
                prop_name.clone()
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

        // Output: ${$.attr_style('base', { color: 'red' })} or ${$.attr_style(expr, { color: 'red' })}
        let base_arg = match base_style {
            Some(s) if s.starts_with("__EXPR__:") => {
                // Dynamic expression - pass directly without quotes
                s["__EXPR__:".len()..].to_string()
            }
            Some(s) if !s.is_empty() => {
                // Static text value - quote it
                format!("'{}'", s)
            }
            _ => {
                // No base style
                "''".to_string()
            }
        };
        Ok(format!(
            "${{$.attr_style({}, {})}}",
            base_arg, directives_arg
        ))
    }
}

/// Find the matching closing paren for an expression starting after the opening paren.
/// Returns the offset of the closing paren relative to the start of `s`.
fn find_matching_paren_simple(s: &str) -> Option<usize> {
    let mut depth = 1;
    let mut i = 0;
    let bytes = s.as_bytes();
    while i < bytes.len() && depth > 0 {
        match bytes[i] {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}
