//! Build methods for ServerCodeGenerator.
//!
//! Converts the internal OutputPart representation into the final JavaScript string output.

use super::super::js_ast::normalize_js;
use super::ServerCodeGenerator;
use super::helpers::*;
use super::types::{ComponentPropItem, OutputPart, collect_all_props, has_spreads};
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn build(self) -> String {
        let mut each_counter: usize = 0;
        let body_code = Self::build_parts(&self.output_parts, 1, &mut each_counter);

        // Process module script content (context="module") if present
        // Module script runs at module level, outside the component function
        let (module_imports, module_code) = if let Some(script) = self.module_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // Strip TypeScript syntax if the script uses lang="ts"
            let raw_script = maybe_strip_typescript(raw_script, script);

            // Extract imports and transform the rest
            // Use extract_imports_module to keep `export { ... }` statements
            let (imports, rest) = extract_imports_module(&raw_script);
            // Apply class field transformation for $derived fields in module-level classes
            let rest = transform_class_fields_server(&rest);
            let transformed = transform_script_content_module(&rest);

            (imports, transformed)
        } else {
            (Vec::new(), String::new())
        };

        // Get analysis flags for determining component wrapper and props injection
        // These are independent of whether there's an instance script
        let needs_context = self.analysis.map(|a| a.needs_context).unwrap_or(false);
        let analysis_needs_props = self.analysis.map(|a| a.needs_props).unwrap_or(false);
        let analysis_uses_props = self.analysis.map(|a| a.uses_props).unwrap_or(false);
        let analysis_uses_rest_props = self.analysis.map(|a| a.uses_rest_props).unwrap_or(false);
        let analysis_uses_slots = self.analysis.map(|a| a.uses_slots).unwrap_or(false);
        let uses_component_bindings = self
            .analysis
            .map(|a| a.uses_component_bindings)
            .unwrap_or(false);

        // Process instance script content if present
        let (
            script_code,
            hoisted_imports,
            script_uses_props,
            has_class_state_fields,
            uses_props_spread,
        ) = if let Some(script) = self.instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // Strip TypeScript syntax if the script uses lang="ts"
            let raw_script = maybe_strip_typescript(raw_script, script);

            // First, remove $effect, $effect.pre, $effect.root, and $inspect.trace blocks
            // These are client-side only and should not appear in SSR output
            let raw_script = remove_effect_blocks(&raw_script);

            // Check if script uses $props() or export let (legacy props)
            let uses_props = raw_script.contains("$props()")
                || raw_script.contains("export let ")
                || raw_script.contains("export var ");

            // Check if class fields use $state, $state.raw, or $derived runes
            // This requires $$props and $$renderer.component() wrapper
            let class_state_fields = raw_script.contains("class ")
                && (raw_script.contains("= $state(")
                    || raw_script.contains("= $state.raw(")
                    || raw_script.contains("= $derived("));

            // Check if uses spread pattern: let props = $props() or let xxx = $props()
            // This requires $$renderer.component() wrapper with destructuring
            let props_spread = detect_props_spread_pattern(&raw_script);

            // Extract legacy reactive ($:) variable declarations before any transforms
            let legacy_reactive_decl = extract_legacy_reactive_var_declaration(&raw_script);

            // Extract imports and transform the rest
            let (imports, rest) = extract_imports(&raw_script);

            // Apply class field transformation for $derived fields
            let rest = transform_class_fields_server(&rest);

            let transformed = transform_script_content(&rest);

            // Prepend legacy reactive variable declarations if any
            let transformed = if legacy_reactive_decl.is_empty() {
                transformed
            } else {
                format!("{}\n{}", legacy_reactive_decl, transformed)
            };

            // Transform store subscriptions in script content ($store -> $.store_get())
            let transformed = self.transform_store_refs_in_script(&transformed);

            (
                transformed,
                imports,
                uses_props,
                class_state_fields,
                props_spread,
            )
        } else {
            (String::new(), Vec::new(), false, false, false)
        };

        // Determine if we need $$renderer.component() wrapper
        // This matches the official compiler's should_inject_context logic
        let should_inject_context = needs_context;
        let needs_component_wrapper = should_inject_context
            || uses_props_spread
            || has_class_state_fields
            || self.uses_store_subs;

        // Determine if we need $$props parameter
        // This matches the official compiler's should_inject_props logic
        let should_inject_props = should_inject_context
            || analysis_needs_props
            || analysis_uses_props
            || analysis_uses_rest_props
            || analysis_uses_slots
            || script_uses_props
            || has_class_state_fields
            || self.uses_store_subs;

        let props_param = if should_inject_props { ", $$props" } else { "" };

        // Combine module imports and instance imports (module imports first)
        let all_imports: Vec<String> = module_imports.into_iter().chain(hoisted_imports).collect();

        // Build hoisted imports section
        let imports_section = if all_imports.is_empty() {
            String::new()
        } else {
            all_imports.join("\n") + "\n"
        };

        // Build module script section (placed after imports, before component function)
        let module_section = if module_code.trim().is_empty() {
            String::new()
        } else {
            format!("{}\n", module_code)
        };

        // Build snippet functions
        let snippets_section = self.build_snippets();

        // Build async flag import if experimental.async is enabled
        let async_import = if self.use_async {
            "import 'svelte/internal/flags/async';\n"
        } else {
            ""
        };

        // Build CSS injection section if needed
        let (css_const_section, css_add_call) =
            if let Some((ref hash, ref code)) = self.injected_css {
                // Escape single quotes in CSS code for JS string
                let escaped_code = code.replace('\'', "\\'");
                let css_const = format!(
                    "const $$css = {{\n\thash: '{}',\n\tcode: '{}'\n}};\n\n",
                    hash, escaped_code
                );
                let css_add = "\t$$renderer.global.css.add($$css);\n".to_string();
                (css_const, css_add)
            } else {
                (String::new(), String::new())
            };

        // Build the final output - handle empty body case
        let has_content = !script_code.is_empty() || !body_code.is_empty();

        let raw_output = if has_content {
            if needs_component_wrapper {
                // Build props declarations ($$sanitized_props, $$restProps) - inside wrapper
                let props_declarations = self.build_props_declarations(2);
                // Wrap in $$renderer.component() with proper destructuring
                let inner_script = transform_props_spread(&script_code);
                let mut each_counter: usize = 0;
                let inner_body = Self::build_parts(&self.output_parts, 2, &mut each_counter);
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(2);
                // Build $.bind_props() call (inside $$renderer.component())
                let bind_props_code = self.build_bind_props(2);

                // Add store subscription variable declaration and cleanup if needed
                let store_subs_decl = if self.uses_store_subs {
                    "\t\tvar $$store_subs;\n"
                } else {
                    ""
                };
                let store_subs_cleanup = if self.uses_store_subs {
                    "\n\t\tif ($$store_subs) $.unsubscribe_stores($$store_subs);\n"
                } else {
                    ""
                };

                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{
{css_add_call}	$$renderer.component(($$renderer) => {{
{props_declarations}{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{store_subs_cleanup}{bind_props_code}	}});
}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    props_declarations = props_declarations,
                    store_subs_decl = store_subs_decl,
                    inner_script = inner_script,
                    instance_snippets = instance_snippets,
                    inner_body = inner_body,
                    bind_props_code = bind_props_code,
                    store_subs_cleanup = store_subs_cleanup
                )
            } else {
                // Build props declarations ($$sanitized_props, $$restProps)
                let props_declarations = self.build_props_declarations(1);
                let script_section = if script_code.is_empty() {
                    String::new()
                } else {
                    format!("{}\n", script_code)
                };
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(1);
                // Build $.bind_props() call (at top level of component function)
                let bind_props_code = self.build_bind_props(1);

                // If the component uses component bindings, wrap the body in $$render_inner loop
                let body_section = if uses_component_bindings {
                    // Wrap body_code in $$settled/$$render_inner pattern
                    format!(
                        r#"	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {{
{body_code}	}}

	do {{
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	}} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
"#,
                        body_code = body_code.replace("\t", "\t\t") // Increase indentation
                    )
                } else {
                    body_code.clone()
                };

                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{
{css_add_call}{props_declarations}{script_section}{instance_snippets}{body_section}{bind_props_code}}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    props_declarations = props_declarations,
                    script_section = script_section,
                    instance_snippets = instance_snippets,
                    body_section = body_section,
                    bind_props_code = bind_props_code
                )
            }
        } else {
            // Empty body - use single line braces
            // Build $.bind_props() call even for empty body
            let bind_props_code = self.build_bind_props(1);
            if bind_props_code.is_empty() && css_add_call.is_empty() {
                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                )
            } else {
                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{
{css_add_call}{bind_props_code}}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    bind_props_code = bind_props_code
                )
            }
        };

        // Normalize the output through oxc parser/codegen
        match normalize_js(&raw_output) {
            Ok(normalized) => normalized,
            Err(_) => raw_output, // Fall back to raw output if parsing fails
        }
    }

    pub(crate) fn build_parts(
        parts: &[OutputPart],
        indent_level: usize,
        each_counter: &mut usize,
    ) -> String {
        let mut body_code = String::new();
        let mut current_html = String::new();
        let indent = "\t".repeat(indent_level);
        let mut textarea_body_count: usize = 0;

        let mut i = 0;
        while i < parts.len() {
            let part = &parts[i];
            match part {
                OutputPart::Html(html) => {
                    // Collapse consecutive spaces: if current_html ends with space and html is just a space
                    if !(current_html.ends_with(' ') && html == " ") {
                        current_html.push_str(html);
                    }
                }
                OutputPart::Expression(expr) => {
                    current_html.push_str(&format!("${{$.escape({})}}", expr));
                }
                OutputPart::RawExpression(expr) => {
                    // Raw expressions don't need escaping (e.g., $.attributes())
                    current_html.push_str(&format!("${{{}}}", expr));
                }
                OutputPart::HtmlExpression(expr) => {
                    current_html.push_str(&format!("${{$.html({})}}", expr));
                }
                OutputPart::ComponentWithBindings {
                    name,
                    props_and_spreads,
                    bindings,
                    children: _, // TODO: Handle children for components with bindings
                    dynamic,
                    skip_boundary,
                } => {
                    // Component with bindings - just generate the component call with getter/setters.
                    // The $$settled/$$render_inner loop is handled at the component level in build().

                    // Flush any prior HTML content (with dynamic marker if needed)
                    if !current_html.is_empty() {
                        if *dynamic {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}<!---->`);\n",
                                indent, current_html
                            ));
                        } else {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                        }
                        current_html.clear();
                    } else if *dynamic {
                        // Even if no prior HTML, dynamic components need a marker
                        body_code.push_str(&format!("{}$$renderer.push(`<!---->`);\n", indent));
                    }

                    // Use optional chaining for dynamic components
                    let call_syntax = if *dynamic { "?." } else { "" };

                    // Generate component call - use $.spread_props if spreads exist
                    if has_spreads(props_and_spreads) {
                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, $.spread_props([\n",
                            indent, name, call_syntax
                        ));

                        // Add interleaved props and spreads in order
                        for item in props_and_spreads {
                            match item {
                                ComponentPropItem::Props(props) => {
                                    body_code.push_str(&format!(
                                        "{}\t{{ {} }},\n",
                                        indent,
                                        props.join(", ")
                                    ));
                                }
                                ComponentPropItem::Spread(expr) => {
                                    body_code.push_str(&format!("{}\t{},\n", indent, expr));
                                }
                            }
                        }

                        // Add bindings as a final object
                        body_code.push_str(&format!("{}\t{{\n", indent));

                        let binding_count = bindings.len();
                        for (idx, (prop_name, var_name)) in bindings.iter().enumerate() {
                            body_code.push_str(&format!("{}\t\tget {}() {{\n", indent, prop_name));
                            body_code.push_str(&format!("{}\t\t\treturn {};\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                            body_code.push_str(&format!(
                                "{}\t\tset {}($$value) {{\n",
                                indent, prop_name
                            ));
                            body_code
                                .push_str(&format!("{}\t\t\t{} = $$value;\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t\t$$settled = false;\n", indent));
                            if idx < binding_count - 1 {
                                body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                            } else {
                                body_code.push_str(&format!("{}\t\t}}\n", indent));
                            }
                        }

                        body_code.push_str(&format!("{}\t}}\n", indent));
                        body_code.push_str(&format!("{}]));\n", indent));
                    } else {
                        // No spreads, use simple object literal
                        let all_props = collect_all_props(props_and_spreads);
                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, {{\n",
                            indent, name, call_syntax
                        ));

                        // Regular props first
                        for prop in &all_props {
                            body_code.push_str(&format!("{}\t{},\n", indent, prop));
                        }

                        // Generate getter/setter for each binding
                        let binding_count = bindings.len();
                        for (idx, (prop_name, var_name)) in bindings.iter().enumerate() {
                            body_code.push_str(&format!("{}\tget {}() {{\n", indent, prop_name));
                            body_code.push_str(&format!("{}\t\treturn {};\n", indent, var_name));
                            body_code.push_str(&format!("{}\t}},\n\n", indent));
                            body_code
                                .push_str(&format!("{}\tset {}($$value) {{\n", indent, prop_name));
                            body_code.push_str(&format!("{}\t\t{} = $$value;\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t$$settled = false;\n", indent));
                            if idx < binding_count - 1 {
                                // Trailing comma + blank line between binding pairs
                                body_code.push_str(&format!("{}\t}},\n\n", indent));
                            } else {
                                // Last binding - no trailing comma
                                body_code.push_str(&format!("{}\t}}\n", indent));
                            }
                        }

                        body_code.push_str(&format!("{}}});\n", indent));
                    }

                    // Add <!---->  marker for hydration boundary after binding component
                    // Skip only if skip_hydration_boundaries is true (standalone fragment)
                    if !skip_boundary {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::Component {
                    name,
                    props_and_spreads,
                    children,
                    snippets,
                    slot_names,
                    dynamic,
                    let_directives,
                    skip_boundary,
                } => {
                    // Flush current HTML before the component call
                    // For dynamic components, add <!---->  marker before the call
                    if !current_html.is_empty() {
                        if *dynamic {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}<!---->`);\n",
                                indent, current_html
                            ));
                        } else {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                        }
                        current_html.clear();
                    } else if *dynamic {
                        // Even if no prior HTML, dynamic components need a marker
                        body_code.push_str(&format!("{}$$renderer.push(`<!---->`);\n", indent));
                    }

                    // Check if we have snippets or children
                    let has_snippets = !snippets.is_empty();
                    let has_children = children.is_some();
                    let component_has_spreads = has_spreads(props_and_spreads);

                    // Use optional chaining for dynamic components
                    let call_syntax = if *dynamic { "?." } else { "" };

                    if has_snippets || has_children {
                        // Separate snippets into:
                        // 1. True snippets (SnippetBlocks - need hoisting, passed as props)
                        // 2. Slot children (inline in $$slots, may have destructured params from let directives)
                        #[allow(clippy::type_complexity)]
                        let (true_snippets, slot_children): (
                            Vec<&(String, Vec<String>, Vec<OutputPart>, bool)>,
                            Vec<&(String, Vec<String>, Vec<OutputPart>, bool)>,
                        ) = snippets
                            .iter()
                            .partition(|(_, _, _, is_true_snippet)| *is_true_snippet);

                        let has_true_snippets = !true_snippets.is_empty();
                        let has_slot_children = !slot_children.is_empty();

                        // Wrap in a block if we have true snippets (need hoisting)
                        if has_true_snippets {
                            body_code.push_str(&format!("{}{{\n", indent));

                            // Generate snippet function declarations inside the block
                            for (snippet_name, params, body_parts, _) in &true_snippets {
                                let params_str = format!("$$renderer, {}", params.join(", "));
                                body_code.push_str(&format!(
                                    "{}\tfunction {}({}) {{\n",
                                    indent, snippet_name, params_str
                                ));
                                let snippet_body =
                                    Self::build_parts(body_parts, indent_level + 2, each_counter);
                                body_code.push_str(&snippet_body);
                                body_code.push_str(&format!("{}\t}}\n\n", indent));
                            }

                            // Component call with true snippets as props
                            body_code.push_str(&format!(
                                "{}\t{}{}($$renderer, {{ ",
                                indent, name, call_syntax
                            ));

                            // Collect all props including true snippet names
                            let mut all_props: Vec<String> = collect_all_props(props_and_spreads);
                            for (snippet_name, _, _, _) in &true_snippets {
                                all_props.push(snippet_name.to_string());
                            }

                            // Build $$slots object with:
                            // - true snippets as `name: true`
                            // - slot children as inline functions (with destructured params if they have let directives)
                            let mut slots_entries: Vec<String> = Vec::new();
                            for slot_name in slot_names {
                                let quoted_name = quote_prop_name(slot_name);
                                // Check if this slot is a slot child
                                if let Some((_, params, body_parts, _)) =
                                    slot_children.iter().find(|(n, _, _, _)| n == slot_name)
                                {
                                    // Inline function with optional destructured params
                                    let fn_body = Self::build_parts(body_parts, 0, each_counter);
                                    let fn_body_trimmed = fn_body.trim();
                                    if params.is_empty() {
                                        slots_entries.push(format!(
                                            "{}: ($$renderer) => {{\n{}\t\t\t}}",
                                            quoted_name, fn_body_trimmed
                                        ));
                                    } else {
                                        // Destructured params from let directives
                                        let params_str = format!("{{ {} }}", params.join(", "));
                                        slots_entries.push(format!(
                                            "{}: ($$renderer, {}) => {{\n{}\t\t\t}}",
                                            quoted_name, params_str, fn_body_trimmed
                                        ));
                                    }
                                } else {
                                    // True snippet marker
                                    slots_entries.push(format!("{}: true", quoted_name));
                                }
                            }

                            let slots_str = slots_entries.join(", ");

                            if all_props.is_empty() {
                                body_code.push_str(&format!("$$slots: {{ {} }} }});\n", slots_str));
                            } else {
                                body_code.push_str(&format!(
                                    "{}, $$slots: {{ {} }} }});\n",
                                    all_props.join(", "),
                                    slots_str
                                ));
                            }

                            // Close the block
                            body_code.push_str(&format!("{}}}\n", indent));
                        } else if has_slot_children && !has_children {
                            // Only named slot children (no default children, no true snippets)
                            let all_props = collect_all_props(props_and_spreads);
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{\n",
                                indent, name, call_syntax
                            ));

                            // Props
                            for prop in &all_props {
                                body_code.push_str(&format!("{}\t{},\n", indent, prop));
                            }

                            // $$slots with inline functions (with params for let directives)
                            body_code.push_str(&format!("{}\t$$slots: {{\n", indent));
                            for (slot_name, params, body_parts, _) in &slot_children {
                                let quoted_name = quote_prop_name(slot_name);
                                let fn_body =
                                    Self::build_parts(body_parts, indent_level + 3, each_counter);
                                if params.is_empty() {
                                    body_code.push_str(&format!(
                                        "{}\t\t{}: ($$renderer) => {{\n{}",
                                        indent, quoted_name, fn_body
                                    ));
                                } else {
                                    // Destructured params from let directives
                                    let params_str = format!("{{ {} }}", params.join(", "));
                                    body_code.push_str(&format!(
                                        "{}\t\t{}: ($$renderer, {}) => {{\n{}",
                                        indent, quoted_name, params_str, fn_body
                                    ));
                                }
                                body_code.push_str(&format!("{}\t\t}},\n", indent));
                            }
                            body_code.push_str(&format!("{}\t}}\n", indent));
                            body_code.push_str(&format!("{}}});\n", indent));
                        } else if let Some(children_parts) = children {
                            // Component with children (default slot) and possibly named slots
                            let all_props = collect_all_props(props_and_spreads);
                            let has_let_dirs = !let_directives.is_empty();

                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{\n",
                                indent, name, call_syntax
                            ));

                            // Props
                            for prop in &all_props {
                                body_code.push_str(&format!("{}\t{},\n", indent, prop));
                            }

                            if has_let_dirs {
                                // Has let directives on the component:
                                // children: $.invalid_default_snippet,
                                // $$slots: { default: ($$renderer, { name }) => { ... }, ... }
                                body_code.push_str(&format!(
                                    "{}\tchildren: $.invalid_default_snippet,\n",
                                    indent
                                ));

                                // Build $$slots with default slot function having destructured params
                                body_code.push_str(&format!("{}\t$$slots: {{\n", indent));

                                // Default slot with destructured let directive params
                                let params_str = format!("{{ {} }}", let_directives.join(", "));
                                body_code.push_str(&format!(
                                    "{}\t\tdefault: ($$renderer, {}) => {{\n",
                                    indent, params_str
                                ));
                                let children_code = Self::build_parts(
                                    children_parts,
                                    indent_level + 3,
                                    each_counter,
                                );
                                body_code.push_str(&children_code);
                                body_code.push_str(&format!("{}\t\t}},\n", indent));

                                // Named slot children
                                for (slot_name, params, body_parts, _) in &slot_children {
                                    let quoted_name = quote_prop_name(slot_name);
                                    let fn_body = Self::build_parts(
                                        body_parts,
                                        indent_level + 3,
                                        each_counter,
                                    );
                                    if params.is_empty() {
                                        body_code.push_str(&format!(
                                            "{}\t\t{}: ($$renderer) => {{\n{}",
                                            indent, quoted_name, fn_body
                                        ));
                                    } else {
                                        let params_str = format!("{{ {} }}", params.join(", "));
                                        body_code.push_str(&format!(
                                            "{}\t\t{}: ($$renderer, {}) => {{\n{}",
                                            indent, quoted_name, params_str, fn_body
                                        ));
                                    }
                                    body_code.push_str(&format!("{}\t\t}},\n", indent));
                                }

                                body_code.push_str(&format!("{}\t}}\n", indent));
                            } else {
                                // No let directives - standard children callback
                                body_code.push_str(&format!(
                                    "{}\tchildren: ($$renderer) => {{\n",
                                    indent
                                ));
                                let children_code = Self::build_parts(
                                    children_parts,
                                    indent_level + 2,
                                    each_counter,
                                );
                                body_code.push_str(&children_code);
                                body_code.push_str(&format!("{}\t}},\n", indent));

                                // $$slots with default: true and any named slot children
                                if has_slot_children {
                                    body_code.push_str(&format!("{}\t$$slots: {{\n", indent));
                                    body_code.push_str(&format!("{}\t\tdefault: true,\n", indent));
                                    for (slot_name, params, body_parts, _) in &slot_children {
                                        let quoted_name = quote_prop_name(slot_name);
                                        let fn_body = Self::build_parts(
                                            body_parts,
                                            indent_level + 3,
                                            each_counter,
                                        );
                                        if params.is_empty() {
                                            body_code.push_str(&format!(
                                                "{}\t\t{}: ($$renderer) => {{\n{}",
                                                indent, quoted_name, fn_body
                                            ));
                                        } else {
                                            // Destructured params from let directives
                                            let params_str = format!("{{ {} }}", params.join(", "));
                                            body_code.push_str(&format!(
                                                "{}\t\t{}: ($$renderer, {}) => {{\n{}",
                                                indent, quoted_name, params_str, fn_body
                                            ));
                                        }
                                        body_code.push_str(&format!("{}\t\t}},\n", indent));
                                    }
                                    body_code.push_str(&format!("{}\t}}\n", indent));
                                } else {
                                    // Only default slot
                                    body_code.push_str(&format!(
                                        "{}\t$$slots: {{ default: true }}\n",
                                        indent
                                    ));
                                }
                            }
                            body_code.push_str(&format!("{}}});\n", indent));
                        }
                    } else if component_has_spreads {
                        // Has spread attributes - use $.spread_props with interleaved items
                        let spread_items: Vec<String> = props_and_spreads
                            .iter()
                            .map(|item| match item {
                                ComponentPropItem::Props(props) => {
                                    format!("{{ {} }}", props.join(", "))
                                }
                                ComponentPropItem::Spread(expr) => expr.clone(),
                            })
                            .collect();
                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, $.spread_props([{}]));\n",
                            indent,
                            name,
                            call_syntax,
                            spread_items.join(", ")
                        ));
                    } else {
                        // No children, no snippets, no spreads - simple call
                        let all_props = collect_all_props(props_and_spreads);
                        if all_props.is_empty() {
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{}});\n",
                                indent, name, call_syntax
                            ));
                        } else {
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{ {} }});\n",
                                indent,
                                name,
                                call_syntax,
                                all_props.join(", ")
                            ));
                        }
                    }

                    // Add marker after component unless skip_hydration_boundaries is true.
                    // The official Svelte compiler adds empty_comment after components
                    // unless context.state.skip_hydration_boundaries is true.
                    if !skip_boundary {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::Comment => {
                    current_html.push_str("<!---->");
                }
                OutputPart::EachBlock {
                    iterable,
                    context_name,
                    index_name,
                    body,
                    fallback,
                } => {
                    // Generate unique array variable name: each_array, each_array_1, each_array_2, ...
                    let array_var = if *each_counter == 0 {
                        "each_array".to_string()
                    } else {
                        format!("each_array_{}", each_counter)
                    };

                    // Generate unique index variable name if not explicitly provided
                    // $$index, $$index_1, $$index_2, ...
                    let index_var = match index_name {
                        Some(name) => name.clone(),
                        None => {
                            if *each_counter == 0 {
                                "$$index".to_string()
                            } else {
                                format!("$$index_{}", each_counter)
                            }
                        }
                    };

                    // Increment counter for the next each block
                    *each_counter += 1;

                    if fallback.is_some() {
                        // For fallback case, flush current HTML WITHOUT marker first
                        if !current_html.is_empty() {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                            current_html.clear();
                        }

                        body_code.push_str(&format!(
                            "{}const {} = $.ensure_array_like({});\n\n",
                            indent, array_var, iterable
                        ));

                        // If there's a fallback, wrap in if-else
                        body_code
                            .push_str(&format!("{}if ({}.length !== 0) {{\n", indent, array_var));
                        // Add block marker for non-empty case INSIDE the if
                        body_code
                            .push_str(&format!("{}\t$$renderer.push('<!--[-->');\n\n", indent));

                        // For loop (indented)
                        body_code.push_str(&format!(
                            "{}\tfor (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                            indent, index_var, array_var, index_var, index_var
                        ));

                        // Context variable (only if there's a context)
                        if let Some(ctx_name) = context_name {
                            body_code.push_str(&format!(
                                "{}\t\tlet {} = {}[{}];\n\n",
                                indent, ctx_name, array_var, index_var
                            ));
                        }

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 2, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close for loop
                        body_code.push_str(&format!("{}\t}}\n", indent));

                        // Else branch with fallback
                        body_code.push_str(&format!("{}}} else {{\n", indent));
                        // Add block marker for empty case (note the !)
                        body_code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));

                        // Fallback body
                        if let Some(fb) = fallback {
                            let fallback_code =
                                Self::build_parts(fb, indent_level + 1, each_counter);
                            body_code.push_str(&fallback_code);
                        }

                        body_code.push_str(&format!("{}}}\n\n", indent));
                    } else {
                        // No fallback - add opening marker to current_html before flushing
                        // This combines with any prior content like: `<ul><!--[-->`
                        current_html.push_str("<!--[-->");

                        // Flush current HTML (including the marker) before each block
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();

                        body_code.push_str(&format!(
                            "{}const {} = $.ensure_array_like({});\n\n",
                            indent, array_var, iterable
                        ));

                        // For loop
                        body_code.push_str(&format!(
                            "{}for (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                            indent, index_var, array_var, index_var, index_var
                        ));

                        // Context variable (only if there's a context)
                        if let Some(ctx_name) = context_name {
                            body_code.push_str(&format!(
                                "{}\tlet {} = {}[{}];\n\n",
                                indent, ctx_name, array_var, index_var
                            ));
                        }

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close for loop
                        body_code.push_str(&format!("{}}}\n\n", indent));
                    }

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                } => {
                    // Flush current HTML before if block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the if block with proper markers
                    let if_code = Self::build_if_statement(
                        test_expr,
                        consequent_body,
                        alternate_body,
                        indent_level,
                        each_counter,
                    );
                    body_code.push_str(&if_code);

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteElement {
                    tag_expr,
                    attrs_expr,
                    body,
                } => {
                    // Flush current HTML before svelte:element
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.element call with attributes and body callback
                    if body.is_empty() && attrs_expr.is_none() {
                        // No body and no attributes - simple form
                        body_code
                            .push_str(&format!("{}$.element($$renderer, {});\n", indent, tag_expr));
                    } else {
                        // Build $.element($$renderer, tag, attrs, () => { ... })
                        let attrs_arg = attrs_expr.as_deref().unwrap_or("void 0");

                        if body.is_empty() {
                            // No body, just attributes
                            body_code.push_str(&format!(
                                "{}$.element($$renderer, {}, {});\n",
                                indent, tag_expr, attrs_arg
                            ));
                        } else {
                            // Has body - use callback form
                            body_code.push_str(&format!(
                                "{}$.element($$renderer, {}, {}, () => {{\n",
                                indent, tag_expr, attrs_arg
                            ));

                            // Generate body content
                            let body_code_inner =
                                Self::build_parts(body, indent_level + 1, each_counter);
                            body_code.push_str(&body_code_inner);

                            body_code.push_str(&format!("{}}});\n", indent));
                        }
                    }
                }
                OutputPart::SelectElement {
                    attrs_obj,
                    body,
                    is_rich,
                    css_hash,
                } => {
                    // Flush current HTML before select element
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $$renderer.select() call with multiline formatting when css_hash is present
                    if css_hash.is_some() || *is_rich {
                        body_code.push_str(&format!(
                            "{}$$renderer.select(\n{}\t{},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_obj, indent
                        ));
                    } else {
                        body_code.push_str(&format!(
                            "{}$$renderer.select({}, ($$renderer) => {{\n",
                            indent, attrs_obj
                        ));
                    }

                    // Body
                    let body_code_inner = Self::build_parts(body, indent_level + 2, each_counter);
                    body_code.push_str(&body_code_inner);

                    // Close callback with optional css_hash, classes, styles, flags and is_rich arguments
                    // The full signature is: $$renderer.select(attrs, fn, css_hash, classes, styles, flags, is_rich)
                    // When intermediate arguments are undefined, they must be `void 0`
                    if *is_rich {
                        if let Some(hash) = css_hash {
                            // With css_hash: select(attrs, fn, 'hash', void 0, void 0, void 0, true)
                            body_code.push_str(&format!(
                                "{}\t}},\n{}\t'{}',\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                                indent, indent, hash, indent, indent, indent, indent, indent
                            ));
                        } else {
                            // Without css_hash: select(attrs, fn, void 0, void 0, void 0, void 0, true)
                            body_code.push_str(&format!(
                                "{}\t}},\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                                indent, indent, indent, indent, indent, indent, indent
                            ));
                        }
                    } else if let Some(hash) = css_hash {
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\t'{}'\n{});\n",
                            indent, indent, hash, indent
                        ));
                    } else {
                        body_code.push_str(&format!("{}}});\n", indent));
                    }
                }
                OutputPart::OptionElement {
                    attr_entries,
                    body,
                    is_rich,
                    direct_value,
                    css_hash,
                } => {
                    // Flush current HTML before option element
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);\n\n",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // Generate $$renderer.option() call
                    let attrs_str = attr_entries.join(", ");

                    // If we have a direct value (from synthetic_value_node), pass it directly
                    if let Some(value_expr) = direct_value {
                        body_code.push_str(&format!(
                            "{}$$renderer.option({{ {} }}, {});\n",
                            indent, attrs_str, value_expr
                        ));
                    } else if *is_rich {
                        // Build the $$renderer.option() call
                        // If is_rich, we need to pass 7 arguments: attrs, body, void 0, void 0, void 0, void 0, true
                        body_code.push_str(&format!(
                            "{}$$renderer.option(\n{}\t{{ {} }},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_str, indent
                        ));

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 2, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close callback with remaining args
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                            indent, indent, indent, indent, indent, indent, indent
                        ));
                    } else if let Some(hash) = css_hash {
                        // Has CSS hash - pass as 3rd argument
                        body_code.push_str(&format!(
                            "{}$$renderer.option(\n{}\t{{ {} }},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_str, indent
                        ));

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 2, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close callback with CSS hash
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\t'{}'\n{});\n",
                            indent, indent, hash, indent
                        ));
                    } else {
                        body_code.push_str(&format!(
                            "{}$$renderer.option({{ {} }}, ($$renderer) => {{\n",
                            indent, attrs_str
                        ));

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close callback
                        body_code.push_str(&format!("{}}});\n", indent));
                    }
                }
                OutputPart::AwaitBlock {
                    promise,
                    then_param,
                    pending_body,
                    then_body,
                    catch_param,
                    catch_body,
                } => {
                    // Flush current HTML before await block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.await call with proper callbacks
                    body_code.push_str(&format!("{}$.await(\n", indent));
                    body_code.push_str(&format!("{}\t$$renderer,\n", indent));
                    body_code.push_str(&format!("{}\t{},\n", indent, promise));

                    // Pending callback
                    if pending_body.is_empty() {
                        body_code.push_str(&format!("{}\t() => {{}},\n", indent));
                    } else {
                        body_code.push_str(&format!("{}\t() => {{\n", indent));
                        let pending_code =
                            Self::build_parts(pending_body, indent_level + 2, each_counter);
                        body_code.push_str(&pending_code);
                        body_code.push_str(&format!("{}\t}},\n", indent));
                    }

                    // Then callback
                    if then_body.is_empty() {
                        if then_param.is_empty() {
                            body_code.push_str(&format!("{}\t() => {{}}", indent));
                        } else {
                            body_code.push_str(&format!("{}\t({}) => {{}}", indent, then_param));
                        }
                    } else {
                        if then_param.is_empty() {
                            body_code.push_str(&format!("{}\t() => {{\n", indent));
                        } else {
                            body_code.push_str(&format!("{}\t({}) => {{\n", indent, then_param));
                        }
                        let then_code =
                            Self::build_parts(then_body, indent_level + 2, each_counter);
                        body_code.push_str(&then_code);
                        body_code.push_str(&format!("{}\t}}", indent));
                    }

                    // Catch callback (only if catch block exists)
                    if !catch_body.is_empty() || !catch_param.is_empty() {
                        body_code.push_str(",\n");
                        if catch_body.is_empty() {
                            if catch_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{}}", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{}}", indent, catch_param));
                            }
                        } else {
                            if catch_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{\n", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{\n", indent, catch_param));
                            }
                            let catch_code =
                                Self::build_parts(catch_body, indent_level + 2, each_counter);
                            body_code.push_str(&catch_code);
                            body_code.push_str(&format!("{}\t}}", indent));
                        }
                    }

                    body_code.push('\n');
                    body_code.push_str(&format!("{});\n", indent));

                    // Add closing marker to the next push
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteBoundary { body, is_pending } => {
                    // Add boundary marker to current HTML and flush together
                    // Use <!--[!--> for pending state, <!--[--> for main content
                    // block_open = <!--[-->
                    // block_open_else = <!--[!-->
                    // block_close = <!--]-->
                    if *is_pending {
                        current_html.push_str("<!--[!-->");
                    } else {
                        current_html.push_str("<!--[-->");
                    }
                    body_code.push_str(&format!(
                        "{}$$renderer.push(`{}`);\n\n",
                        indent, current_html
                    ));
                    current_html.clear();

                    // Render the body in a block (always add block even if empty)
                    body_code.push_str(&format!("{}{{\n", indent));
                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }
                    body_code.push_str(&format!("{}}}\n\n", indent));

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteHead { hash, body } => {
                    // Flush current HTML before head call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.head('hash', $$renderer, ($$renderer) => { ... });
                    body_code.push_str(&format!(
                        "{}$.head('{}', $$renderer, ($$renderer) => {{\n",
                        indent, hash
                    ));

                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }

                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::TitleElement { body } => {
                    // Flush current HTML before title call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $$renderer.title(($$renderer) => { ... });
                    body_code.push_str(&format!("{}$$renderer.title(($$renderer) => {{\n", indent));

                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }

                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::TextareaBody { value_expr } => {
                    // Flush current HTML before textarea body
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);\n\n",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // Generate unique variable name for each textarea body
                    // First one: $$body, subsequent: $$body_1, $$body_2, etc.
                    let var_name = if textarea_body_count == 0 {
                        "$$body".to_string()
                    } else {
                        format!("$$body_{}", textarea_body_count)
                    };
                    textarea_body_count += 1;

                    // Generate:
                    // const $$body = $.escape(expr);
                    //
                    // if ($$body) {
                    //     $$renderer.push(`${$$body}`);
                    // } else {}
                    body_code.push_str(&format!(
                        "{}const {} = $.escape({});\n\n",
                        indent, var_name, value_expr
                    ));
                    body_code.push_str(&format!(
                        "{}if ({}) {{\n{}\t$$renderer.push(`${{{}}}`);\n{}}} else {{}}\n\n",
                        indent, var_name, indent, var_name, indent
                    ));
                }
                OutputPart::RenderCall {
                    call_str,
                    skip_boundary,
                } => {
                    // Flush current HTML before render call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the snippet function call
                    body_code.push_str(&format!("{}{};\n", indent, call_str));

                    // Add hydration boundary marker after render call only if not in a standalone context
                    // Official Svelte adds empty_comment after RenderTag unless skip_hydration_boundaries is true
                    if !skip_boundary {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::ConstDeclaration(declaration) => {
                    // Flush current HTML before const declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the const declaration
                    body_code.push_str(&format!("{}const {};\n", indent, declaration));
                }
                OutputPart::BlockScope { body } => {
                    // Flush current HTML before block scope
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the block scope
                    body_code.push_str(&format!("{}{{\n", indent));
                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }
                    body_code.push_str(&format!("{}}}\n", indent));
                }
                OutputPart::HydrationAnchor => {
                    // Add <!> marker to current HTML (hydration anchor for Components/RenderTags/HtmlTags in select/optgroup)
                    current_html.push_str("<!>");
                }
                OutputPart::SnippetFunction { name, params, body } => {
                    // Flush current HTML before function declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate function declaration
                    let param_str = if params.is_empty() {
                        "$$renderer".to_string()
                    } else {
                        format!("$$renderer, {}", params.join(", "))
                    };

                    body_code.push_str(&format!("{}function {}({}) {{\n", indent, name, param_str));

                    // Generate body
                    if !body.is_empty() {
                        let body_inner = Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_inner);
                    }

                    body_code.push_str(&format!("{}}}\n\n", indent));
                }
            }
            i += 1;
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
        }

        body_code
    }

    /// Build an if statement with proper block markers.
    /// Following the official Svelte compiler, else-if chains are generated as nested if statements
    /// inside the else branch, each with their own block markers.
    pub(crate) fn build_if_statement(
        test_expr: &str,
        consequent_body: &[OutputPart],
        alternate_body: &Option<Vec<OutputPart>>,
        indent_level: usize,
        each_counter: &mut usize,
    ) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Start the if statement
        code.push_str(&format!("{}if ({}) {{\n", indent, test_expr));

        // Add opening marker for consequent (BLOCK_OPEN = <!--[-->)
        code.push_str(&format!("{}\t$$renderer.push('<!--[-->');\n", indent));

        // Generate consequent body
        let consequent_code = Self::build_parts(consequent_body, indent_level + 1, each_counter);
        code.push_str(&consequent_code);

        // Close consequent block
        code.push_str(&format!("{}}}", indent));

        // Handle alternate (else/else-if)
        if let Some(alt_body) = alternate_body {
            // Check if the alternate is another IfBlock (else-if chain)
            if alt_body.len() == 1
                && let OutputPart::IfBlock {
                    test_expr: nested_test,
                    consequent_body: nested_consequent,
                    alternate_body: nested_alternate,
                } = &alt_body[0]
            {
                // else-if case: wrap in else block with block_open_else marker and nested if
                code.push_str(" else {\n");

                // Add opening marker for else (BLOCK_OPEN_ELSE = <!--[!-->)
                code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n\n", indent));

                // Generate nested if statement with increased indentation
                let nested_if_code = Self::build_if_statement(
                    nested_test,
                    nested_consequent,
                    nested_alternate,
                    indent_level + 1,
                    each_counter,
                );
                code.push_str(&nested_if_code);
                code.push('\n');

                // Add closing marker for nested if
                code.push_str(&format!("\n{}\t$$renderer.push(`<!--]-->`);\n", indent));

                // Close else block
                code.push_str(&format!("{}}}", indent));

                return code;
            }

            // Regular else case (not else-if)
            code.push_str(" else {\n");

            // Add opening marker for else (BLOCK_OPEN_ELSE = <!--[!-->)
            code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));

            // Generate alternate body
            let alternate_code = Self::build_parts(alt_body, indent_level + 1, each_counter);
            code.push_str(&alternate_code);

            // Close else block
            code.push_str(&format!("{}}}", indent));
        } else {
            // No alternate - add empty else with BLOCK_OPEN_ELSE
            code.push_str(" else {\n");
            code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));
            code.push_str(&format!("{}}}", indent));
        }

        code
    }

    /// Build snippet function definitions that can be hoisted to module level.
    pub(crate) fn build_snippets(&self) -> String {
        let hoisted: Vec<_> = self.snippets.iter().filter(|s| s.can_hoist).collect();
        if hoisted.is_empty() {
            return String::new();
        }

        let mut result = String::new();

        for snippet in hoisted {
            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!("function {}({}) {{\n", snippet.name, params));

            // Generate body - snippets have their own counter scope
            let mut snippet_counter: usize = 0;
            let body = Self::build_parts(&snippet.body_parts, 1, &mut snippet_counter);
            result.push_str(&body);

            result.push_str("}\n\n");
        }

        result
    }

    /// Build snippet function definitions that cannot be hoisted (instance-level).
    pub(crate) fn build_instance_snippets(&self, indent_level: usize) -> String {
        let instance: Vec<_> = self.snippets.iter().filter(|s| !s.can_hoist).collect();
        if instance.is_empty() {
            return String::new();
        }

        let indent = "\t".repeat(indent_level);
        let mut result = String::new();

        for snippet in instance {
            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!(
                "{}function {}({}) {{\n",
                indent, snippet.name, params
            ));

            // Generate body - snippets have their own counter scope
            let mut snippet_counter: usize = 0;
            let body =
                Self::build_parts(&snippet.body_parts, indent_level + 1, &mut snippet_counter);
            result.push_str(&body);

            result.push_str(&format!("{}}}\n\n", indent));
        }

        result
    }

    /// Build props declarations ($$sanitized_props, $$restProps) if needed.
    /// This is called at the start of the component body.
    pub(crate) fn build_props_declarations(&self, indent_level: usize) -> String {
        let analysis = match self.analysis {
            Some(a) => a,
            None => return String::new(),
        };

        let indent = "\t".repeat(indent_level);
        let mut result = String::new();

        // If uses_props or uses_rest_props, add $$sanitized_props
        if analysis.uses_props || analysis.uses_rest_props {
            result.push_str(&format!(
                "{}const $$sanitized_props = $.sanitize_props($$props);\n",
                indent
            ));
        }

        // If uses_rest_props, add $$restProps
        if analysis.uses_rest_props {
            // Collect named props to exclude from rest props
            let mut named_props: Vec<String> = Vec::new();

            // Add exports (using alias if available)
            for export in &analysis.exports {
                let name = export.alias.as_ref().unwrap_or(&export.name);
                named_props.push(name.clone());
            }

            // Add bindable props from bindings
            for binding in &analysis.root.bindings {
                if binding.kind == BindingKind::BindableProp {
                    let name = binding.prop_alias.as_ref().unwrap_or(&binding.name);
                    if !named_props.contains(name) {
                        named_props.push(name.clone());
                    }
                }
            }

            // Generate: const $$restProps = $.rest_props($$sanitized_props, ['prop1', 'prop2']);
            let props_array = named_props
                .iter()
                .map(|p| format!("'{}'", p))
                .collect::<Vec<_>>()
                .join(", ");
            result.push_str(&format!(
                "{}const $$restProps = $.rest_props($$sanitized_props, [{}]);\n",
                indent, props_array
            ));
        }

        result
    }

    /// Build the $.bind_props() call if there are bindable props or exports.
    /// This propagates values of bound props upwards if they're undefined in the parent and have a value.
    pub(crate) fn build_bind_props(&self, indent_level: usize) -> String {
        let analysis = match self.analysis {
            Some(a) => a,
            None => return String::new(),
        };

        let indent = "\t".repeat(indent_level);
        let mut props: Vec<String> = Vec::new();

        // Collect bindable props from the instance scope
        // binding.kind === 'bindable_prop' && !name.startsWith('$$')
        for binding in &analysis.root.bindings {
            if binding.kind == BindingKind::BindableProp && !binding.name.starts_with("$$") {
                // Use prop_alias if available, otherwise use name
                // b.init(binding.prop_alias ?? name, b.id(name))
                let prop_entry = if let Some(ref alias) = binding.prop_alias {
                    if alias != &binding.name {
                        format!("{}: {}", alias, binding.name)
                    } else {
                        binding.name.clone()
                    }
                } else {
                    binding.name.clone()
                };
                props.push(prop_entry);
            }
        }

        // Collect exports
        // for (const { name, alias } of analysis.exports)
        for export in &analysis.exports {
            let prop_entry = if let Some(ref alias) = export.alias {
                if alias != &export.name {
                    format!("{}: {}", alias, export.name)
                } else {
                    export.name.clone()
                }
            } else {
                export.name.clone()
            };
            props.push(prop_entry);
        }

        if props.is_empty() {
            return String::new();
        }

        // Generate: $.bind_props($$props, { name1, name2, ... });
        format!(
            "{}$.bind_props($$props, {{ {} }});\n",
            indent,
            props.join(", ")
        )
    }
}
