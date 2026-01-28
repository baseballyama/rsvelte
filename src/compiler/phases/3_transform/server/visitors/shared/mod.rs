//! Shared utilities for server visitors.
//!
//! This module contains helper functions and utilities that are used
//! by multiple server-side visitors.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/`
//! in the official Svelte compiler.

pub mod component;
pub mod element;
pub mod utils;

use super::super::types::OutputPart;

/// Build output code from a list of output parts.
pub fn build_parts(parts: &[OutputPart], indent_level: usize) -> String {
    let mut body_code = String::new();
    let mut current_html = String::new();
    let indent = "\t".repeat(indent_level);

    let mut i = 0;
    while i < parts.len() {
        let part = &parts[i];
        match part {
            OutputPart::Html(html) => {
                current_html.push_str(html);
            }
            OutputPart::Expression(expr) => {
                current_html.push_str(&format!("${{$.escape({})}}", expr));
            }
            OutputPart::HtmlExpression(expr) => {
                current_html.push_str(&format!("${{$.html({})}}", expr));
            }
            OutputPart::Comment => {
                current_html.push_str("<!---->");
            }
            OutputPart::Component {
                name,
                props,
                has_prior_content,
                children,
            } => {
                // Flush current HTML
                if !current_html.is_empty() {
                    body_code
                        .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                    current_html.clear();
                }

                // Generate component call
                if let Some(children_parts) = children {
                    body_code.push_str(&format!("{}{}($$renderer, {{\n", indent, name));
                    for prop in props {
                        body_code.push_str(&format!("{}\t{},\n", indent, prop));
                    }
                    body_code.push_str(&format!("{}\tchildren: ($$renderer) => {{\n", indent));
                    let children_code = build_parts(children_parts, indent_level + 2);
                    body_code.push_str(&children_code);
                    body_code.push_str(&format!("{}\t}},\n", indent));
                    body_code.push_str(&format!("{}\t$$slots: {{ default: true }}\n", indent));
                    body_code.push_str(&format!("{}}});\n", indent));
                } else if props.is_empty() {
                    body_code.push_str(&format!("{}{}($$renderer, {{}});\n", indent, name));
                } else {
                    body_code.push_str(&format!(
                        "{}{}($$renderer, {{ {} }});\n",
                        indent,
                        name,
                        props.join(", ")
                    ));
                }

                // Check if there's content after this component
                let has_content_after = parts[i + 1..].iter().any(|p| {
                    matches!(
                        p,
                        OutputPart::Html(h) if !h.trim().is_empty()
                    ) || matches!(
                        p,
                        OutputPart::Expression(_)
                            | OutputPart::HtmlExpression(_)
                            | OutputPart::Component { .. }
                            | OutputPart::EachBlock { .. }
                            | OutputPart::AwaitBlock { .. }
                    )
                });

                // Add marker if there's content either before or after the component
                if *has_prior_content || has_content_after {
                    current_html.push_str("<!---->");
                }
            }
            OutputPart::EachBlock {
                iterable,
                context_name,
                index_name,
                body,
            } => {
                // Add block marker to current HTML and flush together
                current_html.push_str("<!--[-->");
                body_code.push_str(&format!(
                    "{}$$renderer.push(`{}`);\n\n",
                    indent, current_html
                ));
                current_html.clear();

                let index_var = index_name.as_deref().unwrap_or("$$index");
                body_code.push_str(&format!(
                    "{}const each_array = $.ensure_array_like({});\n\n",
                    indent, iterable
                ));

                body_code.push_str(&format!(
                    "{}for (let {} = 0, $$length = each_array.length; {} < $$length; {}++) {{\n",
                    indent, index_var, index_var, index_var
                ));

                if let Some(ctx_name) = context_name {
                    body_code.push_str(&format!(
                        "{}\tlet {} = each_array[{}];\n\n",
                        indent, ctx_name, index_var
                    ));
                }

                let body_code_inner = build_parts(body, indent_level + 1);
                body_code.push_str(&body_code_inner);
                body_code.push_str(&format!("{}}}\n\n", indent));
                // Add closing marker to current_html to combine with subsequent content
                current_html.push_str("<!--]-->");
            }
            OutputPart::SvelteElement { tag_expr } => {
                if !current_html.is_empty() {
                    body_code
                        .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                    current_html.clear();
                }
                body_code.push_str(&format!("{}$.element($$renderer, {});\n", indent, tag_expr));
            }
            OutputPart::OptionElement { attrs, body } => {
                if !current_html.is_empty() {
                    body_code.push_str(&format!(
                        "{}$$renderer.push(`{}`);\n\n",
                        indent, current_html
                    ));
                    current_html.clear();
                }

                let attrs_str = attrs
                    .iter()
                    .map(|(k, v)| format!("{}: {}", k, v))
                    .collect::<Vec<_>>()
                    .join(", ");

                body_code.push_str(&format!(
                    "{}$$renderer.option({{ {} }}, ($$renderer) => {{\n",
                    indent, attrs_str
                ));

                let body_code_inner = build_parts(body, indent_level + 1);
                body_code.push_str(&body_code_inner);
                body_code.push_str(&format!("{}}});\n", indent));
            }
            OutputPart::AwaitBlock {
                promise,
                then_param,
            } => {
                if !current_html.is_empty() {
                    body_code
                        .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                    current_html.clear();
                }

                let pending_callback = "() => {}";
                let then_callback = if then_param.is_empty() {
                    "() => {}".to_string()
                } else {
                    format!("({}) => {{}}", then_param)
                };

                body_code.push_str(&format!(
                    "{}$.await($$renderer, {}, {}, {});\n",
                    indent, promise, pending_callback, then_callback
                ));
                current_html.push_str("<!--]-->");
            }
            OutputPart::ComponentWithBindings {
                name,
                props,
                bindings,
                has_prior_content: _,
                children: _,
            } => {
                current_html.clear();

                body_code.push_str(&format!("{}let $$settled = true;\n", indent));
                body_code.push_str(&format!("{}let $$inner_renderer;\n\n", indent));
                body_code.push_str(&format!(
                    "{}function $$render_inner($$renderer) {{\n",
                    indent
                ));

                body_code.push_str(&format!("{}\t{}($$renderer, {{\n", indent, name));

                for prop in props {
                    body_code.push_str(&format!("{}\t\t{},\n", indent, prop));
                }

                for (prop_name, var_name) in bindings {
                    body_code.push_str(&format!("{}\t\tget {}() {{\n", indent, prop_name));
                    body_code.push_str(&format!("{}\t\t\treturn {};\n", indent, var_name));
                    body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                    body_code.push_str(&format!("{}\t\tset {}($$value) {{\n", indent, prop_name));
                    body_code.push_str(&format!("{}\t\t\t{} = $$value;\n", indent, var_name));
                    body_code.push_str(&format!("{}\t\t\t$$settled = false;\n", indent));
                    body_code.push_str(&format!("{}\t\t}}\n", indent));
                }

                body_code.push_str(&format!("{}\t}});\n", indent));

                let remaining_parts = &parts[i + 1..];
                if !remaining_parts.is_empty() {
                    let inner_code =
                        build_parts_with_prefix(remaining_parts, indent_level + 1, "<!---->");
                    body_code.push_str(&inner_code);
                }

                body_code.push_str(&format!("{}}}\n\n", indent));
                body_code.push_str(&format!("{}do {{\n", indent));
                body_code.push_str(&format!("{}\t$$settled = true;\n", indent));
                body_code.push_str(&format!(
                    "{}\t$$inner_renderer = $$renderer.copy();\n",
                    indent
                ));
                body_code.push_str(&format!("{}\t$$render_inner($$inner_renderer);\n", indent));
                body_code.push_str(&format!("{}}} while (!$$settled);\n\n", indent));
                body_code.push_str(&format!(
                    "{}$$renderer.subsume($$inner_renderer);\n",
                    indent
                ));

                i = parts.len();
                continue;
            }
        }
        i += 1;
    }

    if !current_html.is_empty() {
        body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
    }

    body_code
}

/// Build output parts with an HTML prefix (for comment markers inside $$render_inner).
pub fn build_parts_with_prefix(parts: &[OutputPart], indent_level: usize, prefix: &str) -> String {
    let mut body_code = String::new();
    let mut current_html = String::from(prefix);
    let indent = "\t".repeat(indent_level);

    let mut i = 0;
    while i < parts.len() {
        let part = &parts[i];
        match part {
            OutputPart::Html(html) => {
                current_html.push_str(html);
            }
            OutputPart::Expression(expr) => {
                current_html.push_str(&format!("${{$.escape({})}}", expr));
            }
            _ => {
                if !current_html.is_empty() {
                    body_code
                        .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                    current_html.clear();
                }
                let remaining = &parts[i..];
                let remaining_code = build_parts(remaining, indent_level);
                body_code.push_str(&remaining_code);
                return body_code;
            }
        }
        i += 1;
    }

    if !current_html.is_empty() {
        body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
    }

    body_code
}
