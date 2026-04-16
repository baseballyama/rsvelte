//! Build methods for ServerCodeGenerator.
//!
//! Converts the internal OutputPart representation into the final JavaScript string output.

use std::cell::RefCell;

use super::ServerCodeGenerator;
use super::helpers::*;
use super::transform_script;
use super::transform_store::resolve_binding_exprs;
use super::types::{
    ComponentBinding, ComponentPropItem, OutputPart, collect_all_props, has_spreads,
};
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use memchr::memmem;
use oxc_allocator::Allocator;

// Thread-local OXC allocator for SSR script normalization.
thread_local! {
    static SSR_SCRIPT_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Normalize a script block with OXC parse+codegen.
///
/// Unlike `normalize_js_with_oxc` (which has a fast path that skips OXC),
/// this function ALWAYS runs OXC parse+codegen to normalize:
/// - Trailing commas in destructuring, function calls, and object literals
/// - Whitespace in function arguments
/// - Semicolons and empty statements
/// - Indentation
///
/// Falls back to the original code if OXC parsing fails.
fn normalize_script_with_oxc(js: &str, indent_level: usize) -> String {
    use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    // Preserve `;;` markers ($inspect removal markers) by replacing with a placeholder
    // that OXC won't remove. These are intentional empty statement pairs.
    // Use single-quoted strings since OXC normalizes to single quotes (with single_quote: true).
    const DOUBLE_SEMI_PLACEHOLDER: &str = "void '$$DOUBLE_SEMI$$';void '$$DOUBLE_SEMI$$'";
    let has_double_semi = memmem::find(js.as_bytes(), b";;").is_some();
    let js_normalized = if has_double_semi {
        js.replace(";;", DOUBLE_SEMI_PLACEHOLDER)
    } else {
        js.to_string()
    };

    // Strip existing indentation before OXC parsing (OXC expects unindented input)
    let stripped = strip_indent_for_oxc(&js_normalized, indent_level);

    SSR_SCRIPT_ALLOCATOR.with(|cell| {
        let mut alloc = cell.borrow_mut();
        alloc.reset();

        let source_type = SourceType::mjs();
        let parsed = Parser::new(&alloc, &stripped, source_type).parse();

        if !parsed.errors.is_empty() {
            // OXC parse failed - return original code
            return js.to_string();
        }

        let options = CodegenOptions {
            single_quote: true,
            comments: CommentOptions {
                normal: true,
                jsdoc: true,
                annotation: true,
                legal: LegalComment::Inline,
            },
            ..CodegenOptions::default()
        };

        let result = Codegen::new().with_options(options).build(&parsed.program);
        let mut code = result.code.trim_end().to_string();

        // Restore `;;` markers
        if has_double_semi {
            // OXC may split the two void statements across lines:
            // `void '$$DOUBLE_SEMI$$';\nvoid '$$DOUBLE_SEMI$$';`
            // First try the multiline form, then the single-line form
            code = code.replace("void '$$DOUBLE_SEMI$$';\nvoid '$$DOUBLE_SEMI$$';", ";;");
            code = code.replace(DOUBLE_SEMI_PLACEHOLDER, ";;");
        }

        if indent_level == 0 {
            return code;
        }

        // Apply indentation to all lines, skipping template literal content
        let indent_str = "\t".repeat(indent_level);
        let mut result_str =
            String::with_capacity(code.len() + code.lines().count() * indent_level);
        let mut in_template_literal = false;
        for (i, line) in code.lines().enumerate() {
            if i > 0 {
                result_str.push('\n');
            }
            if line.is_empty() {
                // empty line
            } else if in_template_literal {
                in_template_literal = super::helpers::update_template_literal_state_for_indent(
                    line,
                    in_template_literal,
                );
                result_str.push_str(line);
            } else {
                in_template_literal = super::helpers::update_template_literal_state_for_indent(
                    line,
                    in_template_literal,
                );
                result_str.push_str(&indent_str);
                result_str.push_str(line);
            }
        }
        result_str
    })
}

/// Strip leading indentation from script content for OXC parsing.
/// OXC expects unindented input (top-level statements at column 0).
/// Preserves content inside template literals (backtick strings) as-is.
fn strip_indent_for_oxc(js: &str, indent_level: usize) -> String {
    if indent_level == 0 {
        return js.to_string();
    }
    let prefix = "\t".repeat(indent_level);
    let mut result = String::with_capacity(js.len());
    let mut in_template_literal = false;
    for (i, line) in js.lines().enumerate() {
        if i > 0 {
            result.push('\n');
        }
        if in_template_literal {
            // Inside template literal - preserve content exactly
            in_template_literal =
                super::helpers::update_template_literal_state_for_indent(line, in_template_literal);
            result.push_str(line);
        } else {
            // Strip indentation
            let stripped = if let Some(s) = line.strip_prefix(&prefix) {
                s
            } else {
                line.trim_start_matches('\t')
            };
            in_template_literal = super::helpers::update_template_literal_state_for_indent(
                stripped,
                in_template_literal,
            );
            result.push_str(stripped);
        }
    }
    result
}

/// A segment of an HTML string, either static (no blockers) or blocked.
enum HtmlSegment {
    Static(String),
    Blocked { html: String, blockers: Vec<usize> },
}

/// A segment of an HTML string for await detection, either static or element with await.
enum AwaitHtmlSegment {
    Static(String),
    ElementWithAwait(String),
}

impl<'a> ServerCodeGenerator<'a> {
    /// Split a JS object literal's properties by commas, respecting nesting.
    fn split_object_props(inner: &str) -> Vec<&str> {
        let bytes = inner.as_bytes();
        let len = bytes.len();
        let mut props = Vec::new();
        let mut start = 0;
        let mut depth = 0;
        let mut i = 0;

        while i < len {
            match bytes[i] {
                b'\'' | b'"' | b'`' => {
                    i = super::helpers::skip_string_literal(bytes, i);
                    continue;
                }
                b'(' | b'[' | b'{' => depth += 1,
                b')' | b']' | b'}' => {
                    if depth > 0 {
                        depth -= 1;
                    }
                }
                b',' if depth == 0 => {
                    props.push(&inner[start..i]);
                    start = i + 1;
                }
                _ => {}
            }
            i += 1;
        }
        if start < len {
            props.push(&inner[start..]);
        }
        props
    }
}

impl<'a> ServerCodeGenerator<'a> {
    #[allow(clippy::let_and_return, dead_code)]
    pub(crate) fn build(self) -> String {
        let store_subs = self.get_store_sub_names();
        let store_subs_ref: Vec<(&str, &str)> = store_subs
            .iter()
            .map(|(a, b)| (a.as_str(), b.as_str()))
            .collect();
        let mut each_counter: usize = 0;

        // Pre-compute the blocker_map from the instance script for async wrapping.
        // This determines which variables are "blocked" by async promises ($$promises[N])
        // and which template expressions/blocks need to be wrapped in $$renderer.async()/async_block().
        let blocker_map = if self.use_async {
            if let Some(script) = self.instance_script {
                let start = script.content.start().unwrap_or(0) as usize;
                let end = script.content.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    let raw_script = &self.source[start..end];
                    crate::compiler::phases::phase3_transform::shared::async_body::compute_blocker_map(raw_script)
                } else {
                    rustc_hash::FxHashMap::default()
                }
            } else {
                rustc_hash::FxHashMap::default()
            }
        } else {
            rustc_hash::FxHashMap::default()
        };

        // Hoist <svelte:head> parts to the beginning (official Svelte compiler behavior)
        let hoisted_parts = Self::hoist_svelte_head(&self.output_parts);
        // Apply async wrapping to output parts based on blocker_map
        let hoisted_parts = if !blocker_map.is_empty() {
            Self::apply_async_wrapping(&hoisted_parts, &blocker_map)
        } else {
            hoisted_parts
        };
        // Apply const-tag-level async wrapping based on const_blocker_map
        let const_blocker_map = self.const_blocker_map.borrow();
        let hoisted_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&hoisted_parts, &const_blocker_map)
        } else {
            hoisted_parts
        };
        drop(const_blocker_map);

        let body_code = Self::build_parts_with_store_subs(
            &hoisted_parts,
            1,
            &mut each_counter,
            &store_subs_ref,
        );

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

            // Strip TypeScript syntax if any script uses lang="ts".
            // In Svelte, if the module script has lang="ts", the instance script
            // is also treated as TypeScript (even without its own lang attribute).
            let raw_script = if self.is_typescript && !raw_script.is_empty() {
                crate::compiler::phases::phase2_analyze::types::strip_typescript(&raw_script)
            } else {
                raw_script
            };

            // Extract imports and transform the rest
            // Use extract_imports_module to keep `export { ... }` statements
            let (imports_raw, rest) = extract_imports_module(&raw_script);
            // Normalize import formatting to match esrap behavior
            let imports: Vec<String> = imports_raw
                .into_iter()
                .map(|s| normalize_import(&s))
                .collect();
            // Apply class field transformation for $derived fields in module-level classes
            let rest = transform_class_fields_server(&rest);
            // Remove $effect(), $effect.pre(), $effect.root(), $inspect(), $inspect.trace() blocks
            // These are client-side only and should not appear in SSR output.
            // This must be done for module scripts too (e.g., class constructors using $effect.root).
            let rest_bytes = rest.as_bytes();
            let rest = if memmem::find(rest_bytes, b"$effect(").is_some()
                || memmem::find(rest_bytes, b"$effect.pre(").is_some()
                || memmem::find(rest_bytes, b"$effect.root(").is_some()
                || memmem::find(rest_bytes, b"$inspect(").is_some()
                || memmem::find(rest_bytes, b"$inspect.trace(").is_some()
            {
                super::transform_script::remove_effect_blocks(&rest, false, self.dev)
            } else {
                rest
            };
            let transformed = transform_script_content_module(&rest, self.dev);

            // Normalize the module script code with OXC to fix formatting issues
            let transformed = if !transformed.trim().is_empty() {
                normalize_script_with_oxc(&transformed, 0)
            } else {
                transformed
            };

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
        let analysis_has_slot_names = self
            .analysis
            .map(|a| !a.slot_names.is_empty())
            .unwrap_or(false);
        let analysis_has_exports = self
            .analysis
            .map(|a| !a.exports.is_empty())
            .unwrap_or(false);
        let analysis_has_bindable_props = self
            .analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .any(|b| b.kind == BindingKind::BindableProp && !b.name.starts_with("$$"))
            })
            .unwrap_or(false);
        let uses_component_bindings = self
            .analysis
            .map(|a| a.uses_component_bindings)
            .unwrap_or(false);

        // Process instance script content if present
        let (
            script_code,
            hoisted_imports,
            script_uses_props,
            _has_class_state_fields,
            uses_props_spread,
        ) = if let Some(script) = self.instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // Strip TypeScript syntax if any script uses lang="ts".
            // In Svelte, if the module script has lang="ts", the instance script
            // is also treated as TypeScript (even without its own lang attribute).
            let raw_script = if self.is_typescript && !raw_script.is_empty() {
                crate::compiler::phases::phase2_analyze::types::strip_typescript(&raw_script)
            } else {
                raw_script
            };

            // First, remove $effect, $effect.pre, $effect.root, and $inspect.trace blocks
            // These are client-side only and should not appear in SSR output
            let raw_script = remove_effect_blocks(&raw_script, self.use_async, self.dev);

            // Check if script uses $props() or export let/export { x } (legacy props)
            let has_bindable_props = self.analysis.is_some_and(|a| {
                a.root.bindings.iter().any(|b| {
                    matches!(
                        b.kind,
                        crate::compiler::phases::phase2_analyze::scope::BindingKind::BindableProp
                    )
                })
            });
            let raw_bytes = raw_script.as_bytes();
            let uses_props = memmem::find(raw_bytes, b"$props()").is_some()
                || memmem::find(raw_bytes, b"export let ").is_some()
                || memmem::find(raw_bytes, b"export var ").is_some()
                || has_bindable_props;

            // Check if class fields use $state, $state.raw, or $derived runes
            // This requires $$props and $$renderer.component() wrapper
            let class_state_fields = memmem::find(raw_bytes, b"class ").is_some()
                && (memmem::find(raw_bytes, b"= $state(").is_some()
                    || memmem::find(raw_bytes, b"= $state.raw(").is_some()
                    || memmem::find(raw_bytes, b"= $derived(").is_some());

            // Check if uses spread pattern: let props = $props() or let xxx = $props()
            // This requires $$renderer.component() wrapper with destructuring
            let props_spread = detect_props_spread_pattern(&raw_script);

            // Extract legacy reactive ($:) variable declarations before any transforms
            let legacy_reactive_decl = extract_legacy_reactive_var_declaration(&raw_script);

            // Extract imported names before extracting imports (to detect store subscriptions
            // vs rune calls, e.g., `import { state } from './store'` means $state is a store sub)
            let imported_names =
                crate::compiler::phases::phase2_analyze::types::extract_imported_names(&raw_script);

            // Extract imports and transform the rest
            let (imports_raw, rest) = extract_imports(&raw_script);
            // Normalize import formatting to match esrap behavior:
            // - Single-line if ≤ 83 chars, multi-line with tabs otherwise
            // - No trailing commas, single quotes, semicolons
            let imports: Vec<String> = imports_raw
                .into_iter()
                .map(|s| normalize_import(&s))
                .collect();

            // Apply class field transformation for $derived fields
            let rest = transform_class_fields_server(&rest);

            // Transform special legacy variables ($$props -> $$sanitized_props) in user script code.
            // This must happen BEFORE transform_export_let_declarations which generates $$props['x']
            // patterns for prop access. By applying this first, we only transform user-written
            // $$props references, not the generated ones.
            let rest = self.transform_special_vars(&rest);

            // Split comma-separated variable declarations into individual statements.
            // This must run BEFORE transform_reassigned_destructures so that user-written
            // comma-separated declarations are split, but the combined declarations
            // produced by destructure flattening are preserved.
            let rest = transform_script::split_comma_separated_declarations(&rest);

            // In legacy mode (non-runes), decompose object destructuring patterns
            // when any destructured variable is later reassigned. This matches the
            // official compiler's create_state_declarators behavior.
            let rest = if let Some(analysis) = self.analysis {
                if !analysis.runes {
                    let reassigned_vars: Vec<String> = analysis
                        .root
                        .bindings
                        .iter()
                        .filter(|b| {
                            b.reassigned
                                && matches!(b.kind, BindingKind::Normal | BindingKind::State)
                        })
                        .map(|b| b.name.clone())
                        .collect();
                    if !reassigned_vars.is_empty() {
                        transform_script::transform_reassigned_destructures(&rest, &reassigned_vars)
                    } else {
                        rest
                    }
                } else {
                    rest
                }
            } else {
                rest
            };

            // Collect reexported prop names from `export { x }` patterns only
            // (NOT from `export let x` which is handled by transform_export_let_declarations)
            // Collect (local_name, prop_name) pairs for `export { x as y }` patterns.
            // prop_name is the exported/public name (the alias if any, otherwise same as local).
            let reexported_props: Vec<(String, String)> = if has_bindable_props
                && memmem::find(raw_bytes, b"$props()").is_none()
            {
                self.analysis
                    .map(|a| {
                        a.root
                            .bindings
                            .iter()
                            .filter(|b| {
                                matches!(b.kind, BindingKind::BindableProp) && {
                                    // Only include if NOT declared via `export let` or `export var`
                                    // Check both simple (`export let foo`) and comma-separated
                                    // (`export let foo, bar`) forms.
                                    !is_declared_via_export_let(&raw_script, b.name.as_str())
                                }
                            })
                            .map(|b| {
                                let prop_name = b.prop_alias.as_ref().unwrap_or(&b.name).clone();
                                (b.name.clone(), prop_name)
                            })
                            .collect()
                    })
                    .unwrap_or_default()
            } else {
                Vec::new()
            };

            let transformed = if reexported_props.is_empty() {
                transform_script_content_with_imports(&rest, &imported_names, self.dev)
            } else {
                transform_script_content_with_props_and_imports(
                    &rest,
                    &reexported_props,
                    &imported_names,
                    self.dev,
                )
            };

            // Prepend legacy reactive variable declarations if any
            let transformed = if legacy_reactive_decl.is_empty() {
                transformed
            } else {
                format!("{}\n{}", legacy_reactive_decl, transformed)
            };

            // Transform store subscriptions in script content ($store -> $.store_get())
            let transformed = self.transform_store_refs_in_script(&transformed);

            // Flatten destructure declarations with $.store_get() initializers
            // e.g., `let { a, b } = $.store_get(...)` -> `let tmp = $.store_get(...), a = tmp.a, b = tmp.b`
            let transformed = transform_script::flatten_store_get_destructures(&transformed);

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

        // Apply async body transformation if experimental.async is enabled
        let script_code = if self.use_async && !script_code.trim().is_empty() {
            if let Some(async_result) =
                crate::compiler::phases::phase3_transform::shared::async_body::transform_async_body(
                    script_code.trim(),
                    "$$renderer.run",
                )
            {
                // The async body transform produces unindented output (0-tab).
                // Add 1-tab indentation to match the original script_code level,
                // so transform_props_spread can add another tab for the component wrapper.
                // IMPORTANT: Don't add indentation inside template literals.
                let trimmed = async_result.output.trim();
                let mut indented = String::new();
                let mut in_template_literal = false;
                for line in trimmed.lines() {
                    if line.trim().is_empty() {
                        indented.push('\n');
                    } else if in_template_literal {
                        in_template_literal =
                            super::helpers::update_template_literal_state_for_indent(
                                line,
                                in_template_literal,
                            );
                        indented.push_str(line);
                        indented.push('\n');
                    } else {
                        in_template_literal =
                            super::helpers::update_template_literal_state_for_indent(
                                line,
                                in_template_literal,
                            );
                        indented.push('\t');
                        indented.push_str(line);
                        indented.push('\n');
                    }
                }
                if indented.ends_with('\n') {
                    indented.pop();
                }
                indented
            } else {
                // No top-level await: strip async placeholder markers
                strip_async_placeholders(&script_code)
            }
        } else {
            script_code
        };

        // Normalize the script code with OXC to fix formatting issues:
        // - Trailing commas in function calls and object literals
        // - Whitespace in function arguments
        // - Inconsistent indentation
        // This only applies to the instance script body, not template output.
        let script_code = if !script_code.trim().is_empty() {
            normalize_script_with_oxc(&script_code, 1)
        } else {
            script_code
        };

        // Determine if we need $$renderer.component() wrapper
        // This matches the official compiler's should_inject_context logic (line 259):
        //   should_inject_context = dev || analysis.needs_context
        // Note: uses_props_spread also needs the wrapper for destructuring.
        let should_inject_context = self.dev || needs_context;
        let needs_component_wrapper = should_inject_context;

        // Determine if we need $$props parameter
        // This matches the official compiler's should_inject_props logic (lines 306-313):
        //   should_inject_context || props.length > 0 || analysis.needs_props ||
        //   analysis.uses_props || analysis.uses_rest_props || analysis.uses_slots ||
        //   analysis.slot_names.size > 0
        let should_inject_props = should_inject_context
            || analysis_needs_props
            || analysis_uses_props
            || analysis_uses_rest_props
            || analysis_uses_slots
            || analysis_has_slot_names
            || analysis_has_exports
            || analysis_has_bindable_props
            || script_uses_props;

        let props_param = if should_inject_props { ", $$props" } else { "" };

        // Build hoisted imports section (instance script imports only).
        // In the official compiler, the output body is:
        //   [...state.hoisted, ...module.body]
        // state.hoisted contains instance imports + snippet functions.
        // module.body contains module imports + module code.
        // So the order is: instance_imports → snippets → module_imports → module_code
        let imports_section = if hoisted_imports.is_empty() {
            String::new()
        } else {
            hoisted_imports.join("\n") + "\n"
        };

        // Build snippet functions (hoisted between instance imports and module section)
        let snippets_section = self.build_snippets();

        // Build module section: module imports + module code
        let module_imports_str = if module_imports.is_empty() {
            String::new()
        } else {
            module_imports.join("\n") + "\n"
        };
        let module_section = if module_code.trim().is_empty() {
            module_imports_str
        } else if module_imports_str.is_empty() {
            format!("{}\n", module_code)
        } else {
            format!("{}{}\n", module_imports_str, module_code)
        };

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

        // In dev mode or componentApi v4, the function is not exported inline;
        // instead `export default ComponentName;` is appended at the end of the module.
        let fn_export_keyword = if self.dev || self.component_api_v4 {
            ""
        } else {
            "export default "
        };
        let dev_export_section = if self.component_api_v4 {
            // Legacy componentApi: 4 - generate render method that calls $$_render
            format!(
                "\n\n{name}.render = function ($$props, $$opts) {{\n\treturn $$_render({name}, {{ props: $$props, context: $$opts?.context }});\n}};\n\nexport default {name};",
                name = self.component_name
            )
        } else if self.dev {
            format!(
                "\n\n{name}.render = function () {{\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n}};\n\nexport default {name};",
                name = self.component_name
            )
        } else {
            String::new()
        };

        // For componentApi: 4, add import { render as $$_render } from 'svelte/server'
        let legacy_render_import = if self.component_api_v4 {
            "import { render as $$_render } from 'svelte/server';\n"
        } else {
            ""
        };

        // In dev mode, add FILENAME assignment (placed after async import, before main import)
        let filename_section = if self.dev {
            if let Some(ref fname) = self.filename {
                // Use the full filename (normalized to forward slashes)
                // The official Svelte compiler uses the filename as-is (relative to rootDir if set)
                let display_name = fname.replace('\\', "/");
                let leading = if self.use_async { "\n" } else { "" };
                format!(
                    "{}{}[$.FILENAME] = '{}';\n\n",
                    leading, self.component_name, display_name
                )
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        let raw_output = if has_content {
            if needs_component_wrapper {
                // Build props declarations ($$sanitized_props, $$restProps) - OUTSIDE wrapper
                // The official Svelte compiler places $$sanitized_props before the $$renderer.component()
                // call so it's accessible in the wrapper via closure.
                let props_declarations = self.build_props_declarations(1);

                // In dev mode, use multi-line format with 3-tab indent inside wrapper
                // In non-dev mode, use inline format with 2-tab indent
                let wrapper_indent = if self.dev { 3 } else { 2 };
                let extra_tabs = if self.dev { 2 } else { 1 };

                // Wrap in $$renderer.component() with proper destructuring
                let inner_script =
                    transform_props_spread_ex(&script_code, extra_tabs, analysis_uses_slots);
                let mut each_counter: usize = 0;
                // Hoist <svelte:head> parts to the beginning (official Svelte compiler behavior)
                let hoisted_parts_wrapper = Self::hoist_svelte_head(&self.output_parts);
                // Apply async wrapping to output parts based on blocker_map
                let hoisted_parts_wrapper = if !blocker_map.is_empty() {
                    Self::apply_async_wrapping(&hoisted_parts_wrapper, &blocker_map)
                } else {
                    hoisted_parts_wrapper
                };
                let inner_body = Self::build_parts_with_store_subs(
                    &hoisted_parts_wrapper,
                    wrapper_indent,
                    &mut each_counter,
                    &store_subs_ref,
                );
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(wrapper_indent);
                // Build $.bind_props() call (inside $$renderer.component())
                let bind_props_code = self.build_bind_props(wrapper_indent);

                let indent_str = "\t".repeat(wrapper_indent);

                // Add store subscription variable declaration and cleanup if needed
                let store_subs_decl = if self.uses_store_subs {
                    format!("{}var $$store_subs;\n", indent_str)
                } else {
                    String::new()
                };
                let store_subs_cleanup = if self.uses_store_subs {
                    format!(
                        "\n{}if ($$store_subs) $.unsubscribe_stores($$store_subs);\n",
                        indent_str
                    )
                } else {
                    String::new()
                };

                // If the component uses component bindings, wrap the inner body in $$settled/$$render_inner
                let inner_body = if uses_component_bindings {
                    let bi = &indent_str; // body indent
                    let ii = "\t".repeat(wrapper_indent + 1); // inner indent
                    format!(
                        r#"{bi}let $$settled = true;
{bi}let $$inner_renderer;

{bi}function $$render_inner($$renderer) {{
{body_code}{bi}}}

{bi}do {{
{ii}$$settled = true;
{ii}$$inner_renderer = $$renderer.copy();
{ii}$$render_inner($$inner_renderer);
{bi}}} while (!$$settled);

{bi}$$renderer.subsume($$inner_renderer);
"#,
                        bi = bi,
                        ii = ii,
                        body_code = inner_body.clone()
                    )
                } else {
                    inner_body
                };

                // In dev mode, add component name as 2nd arg to $$renderer.component()
                // and use multi-line format
                let component_second_arg = if self.dev {
                    format!(",\n\t\t{}", self.component_name)
                } else {
                    String::new()
                };

                if self.dev {
                    // Dev mode: multi-line $$renderer.component() format
                    format!(
                        r#"{async_import}{filename_section}{legacy_render_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
{fn_export_keyword}function {component_name}($$renderer{props_param}) {{
{css_add_call}{props_declarations}	$$renderer.component(
		($$renderer) => {{
{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{store_subs_cleanup}{bind_props_code}		}}{component_second_arg}
	);
}}{dev_export_section}"#,
                        fn_export_keyword = fn_export_keyword,
                        async_import = async_import,
                        filename_section = filename_section,
                        legacy_render_import = legacy_render_import,
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
                        store_subs_cleanup = store_subs_cleanup,
                        component_second_arg = component_second_arg,
                        dev_export_section = dev_export_section
                    )
                } else {
                    // Non-dev mode: inline $$renderer.component() format
                    format!(
                        r#"{async_import}{filename_section}{legacy_render_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
{fn_export_keyword}function {component_name}($$renderer{props_param}) {{
{css_add_call}{props_declarations}	$$renderer.component(($$renderer) => {{
{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{store_subs_cleanup}{bind_props_code}	}}{component_second_arg});
}}{dev_export_section}"#,
                        fn_export_keyword = fn_export_keyword,
                        async_import = async_import,
                        filename_section = filename_section,
                        legacy_render_import = legacy_render_import,
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
                        store_subs_cleanup = store_subs_cleanup,
                        component_second_arg = component_second_arg,
                        dev_export_section = dev_export_section
                    )
                }
            } else {
                // Build props declarations ($$sanitized_props, $$restProps)
                let props_declarations = self.build_props_declarations(1);
                // Apply props spread transformation if needed ($$slots/$$events exclusion)
                let script_code = if uses_props_spread {
                    transform_props_spread_ex(&script_code, 0, analysis_uses_slots)
                } else {
                    script_code
                };
                let script_section = if script_code.is_empty() {
                    String::new()
                } else {
                    format!("{}\n", script_code)
                };
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(1);
                // Build $.bind_props() call (at top level of component function)
                let bind_props_code = self.build_bind_props(1);

                // Add store subscription variable declaration and cleanup if needed
                // In the non-wrapper path, these go directly in the function body
                let store_subs_decl = if self.uses_store_subs {
                    "\tvar $$store_subs;\n"
                } else {
                    ""
                };
                let store_subs_cleanup = if self.uses_store_subs {
                    "\n\tif ($$store_subs) $.unsubscribe_stores($$store_subs);\n"
                } else {
                    ""
                };

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
                        body_code = {
                            // Add one tab of indentation to each non-empty line,
                            // but NOT inside template literals (to preserve source indentation).
                            let mut result = String::new();
                            let mut in_template_literal = false;
                            for line in body_code.lines() {
                                if line.trim().is_empty() {
                                    result.push('\n');
                                } else if in_template_literal {
                                    in_template_literal =
                                        super::helpers::update_template_literal_state_for_indent(
                                            line,
                                            in_template_literal,
                                        );
                                    result.push_str(line);
                                    result.push('\n');
                                } else {
                                    in_template_literal =
                                        super::helpers::update_template_literal_state_for_indent(
                                            line,
                                            in_template_literal,
                                        );
                                    result.push('\t');
                                    result.push_str(line);
                                    result.push('\n');
                                }
                            }
                            result
                        }
                    )
                } else {
                    body_code.clone()
                };

                format!(
                    r#"{async_import}{filename_section}{legacy_render_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
{fn_export_keyword}function {component_name}($$renderer{props_param}) {{
{css_add_call}{props_declarations}{store_subs_decl}{script_section}{instance_snippets}{body_section}{store_subs_cleanup}{bind_props_code}}}{dev_export_section}"#,
                    async_import = async_import,
                    filename_section = filename_section,
                    legacy_render_import = legacy_render_import,
                    fn_export_keyword = fn_export_keyword,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    props_declarations = props_declarations,
                    store_subs_decl = store_subs_decl,
                    script_section = script_section,
                    instance_snippets = instance_snippets,
                    body_section = body_section,
                    store_subs_cleanup = store_subs_cleanup,
                    bind_props_code = bind_props_code,
                    dev_export_section = dev_export_section
                )
            }
        } else if needs_component_wrapper {
            // Empty body but needs component wrapper (dev mode or needs_context)
            let component_second_arg = if self.dev {
                format!(", {}", self.component_name)
            } else {
                String::new()
            };
            let bind_props_code = self.build_bind_props(1);
            format!(
                r#"{async_import}{filename_section}{legacy_render_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
{fn_export_keyword}function {component_name}($$renderer{props_param}) {{
{css_add_call}	$$renderer.component(($$renderer) => {{}}{component_second_arg});
{bind_props_code}}}{dev_export_section}"#,
                async_import = async_import,
                filename_section = filename_section,
                legacy_render_import = legacy_render_import,
                fn_export_keyword = fn_export_keyword,
                imports_section = imports_section,
                snippets_section = snippets_section,
                css_const_section = css_const_section,
                module_section = module_section,
                component_name = self.component_name,
                props_param = props_param,
                css_add_call = css_add_call,
                component_second_arg = component_second_arg,
                bind_props_code = bind_props_code,
                dev_export_section = dev_export_section
            )
        } else {
            // Empty body - use single line braces
            let bind_props_code = self.build_bind_props(1);
            if bind_props_code.is_empty() && css_add_call.is_empty() {
                format!(
                    r#"{async_import}{filename_section}{legacy_render_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
{fn_export_keyword}function {component_name}($$renderer{props_param}) {{}}{dev_export_section}"#,
                    async_import = async_import,
                    filename_section = filename_section,
                    legacy_render_import = legacy_render_import,
                    fn_export_keyword = fn_export_keyword,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    dev_export_section = dev_export_section,
                )
            } else {
                format!(
                    r#"{async_import}{filename_section}{legacy_render_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
{fn_export_keyword}function {component_name}($$renderer{props_param}) {{
{css_add_call}{bind_props_code}}}{dev_export_section}"#,
                    async_import = async_import,
                    filename_section = filename_section,
                    legacy_render_import = legacy_render_import,
                    fn_export_keyword = fn_export_keyword,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    bind_props_code = bind_props_code,
                    dev_export_section = dev_export_section
                )
            }
        };

        // Post-process: remove trailing semicolons after function declaration closing braces.
        // The user's source code may have `function foo() { };` but the official Svelte compiler
        // (which parses AST and regenerates) drops the trailing `;` since FunctionDeclarations
        // don't need them. This produces EmptyStatement nodes in the AST that cause mismatches.
        let raw_output = strip_trailing_semicolons_after_functions(&raw_output);

        raw_output
    }

    /// Build a `JsProgram` AST from the generated output parts.
    ///
    /// This produces the same output as `build()` but returns a structured AST
    /// that can be emitted via `js_ast::codegen::generate()`. The codegen handles
    /// blank-line insertion between different statement types, eliminating the need
    /// for `strip_empty_statements()` and `add_esrap_blank_lines()`.
    ///
    /// The function body and script content are wrapped in `JsStatement::Raw` nodes
    /// since they are still text-generated. Structured AST nodes are used for:
    /// - Import declarations (`JsStatement::Import`)
    /// - The component function declaration (`JsFunctionDeclaration`)
    /// - Export default (`JsExportDefault`)
    #[allow(clippy::let_and_return)]
    pub(crate) fn build_program(
        self,
    ) -> (
        crate::compiler::phases::phase3_transform::js_ast::nodes::JsProgram,
        crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    ) {
        use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
        use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
        use compact_str::CompactString;
        use smallvec::smallvec;

        let arena = JsArena::new();
        let mut body: Vec<JsStatement> = Vec::new();

        // ===================================================================
        // Steps 1-5: Same computation as build()
        // ===================================================================

        let store_subs = self.get_store_sub_names();
        let store_subs_ref: Vec<(&str, &str)> = store_subs
            .iter()
            .map(|(a, b)| (a.as_str(), b.as_str()))
            .collect();
        let mut each_counter: usize = 0;

        // Pre-compute the blocker_map from the instance script for async wrapping.
        let blocker_map = if self.use_async {
            if let Some(script) = self.instance_script {
                let start = script.content.start().unwrap_or(0) as usize;
                let end = script.content.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    let raw_script = &self.source[start..end];
                    crate::compiler::phases::phase3_transform::shared::async_body::compute_blocker_map(raw_script)
                } else {
                    rustc_hash::FxHashMap::default()
                }
            } else {
                rustc_hash::FxHashMap::default()
            }
        } else {
            rustc_hash::FxHashMap::default()
        };

        // Hoist <svelte:head> parts to the beginning
        let hoisted_parts = Self::hoist_svelte_head(&self.output_parts);
        let hoisted_parts = if !blocker_map.is_empty() {
            Self::apply_async_wrapping(&hoisted_parts, &blocker_map)
        } else {
            hoisted_parts
        };
        let const_blocker_map = self.const_blocker_map.borrow();
        let hoisted_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&hoisted_parts, &const_blocker_map)
        } else {
            hoisted_parts
        };
        drop(const_blocker_map);

        // Convert OutputParts → TemplateItems → JsStatements → body_code string.
        // This exercises the bridge path while maintaining backward compatibility
        // with the downstream code that expects a body_code String.
        let body_code = {
            let bridge_arena =
                crate::compiler::phases::phase3_transform::js_ast::arena::JsArena::new();
            let template_items = super::bridge::output_parts_to_template_items(
                &hoisted_parts,
                &bridge_arena,
                &store_subs_ref,
                &mut each_counter,
            );
            let template_stmts =
                super::visitors::shared::utils::build_template(&template_items, &bridge_arena);
            // Convert the AST statements back to a string at indent level 1
            // (matching the old build_parts_with_store_subs(indent_level=1) output).
            crate::compiler::phases::phase3_transform::js_ast::codegen::generate_stmts(
                &template_stmts,
                &bridge_arena,
                1,
            )
        };

        // Process module script
        let (module_imports, module_code) = if let Some(script) = self.module_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };
            let raw_script = if self.is_typescript && !raw_script.is_empty() {
                crate::compiler::phases::phase2_analyze::types::strip_typescript(&raw_script)
            } else {
                raw_script
            };
            let (imports_raw, rest) = extract_imports_module(&raw_script);
            let imports: Vec<String> = imports_raw
                .into_iter()
                .map(|s| normalize_import(&s))
                .collect();
            let rest = transform_class_fields_server(&rest);
            let rest_bytes = rest.as_bytes();
            let rest = if memmem::find(rest_bytes, b"$effect(").is_some()
                || memmem::find(rest_bytes, b"$effect.pre(").is_some()
                || memmem::find(rest_bytes, b"$effect.root(").is_some()
                || memmem::find(rest_bytes, b"$inspect(").is_some()
                || memmem::find(rest_bytes, b"$inspect.trace(").is_some()
            {
                super::transform_script::remove_effect_blocks(&rest, false, self.dev)
            } else {
                rest
            };
            let transformed = transform_script_content_module(&rest, self.dev);
            let transformed = if !transformed.trim().is_empty() {
                normalize_script_with_oxc(&transformed, 0)
            } else {
                transformed
            };
            (imports, transformed)
        } else {
            (Vec::new(), String::new())
        };

        // Get analysis flags
        let needs_context = self.analysis.map(|a| a.needs_context).unwrap_or(false);
        let analysis_needs_props = self.analysis.map(|a| a.needs_props).unwrap_or(false);
        let analysis_uses_props = self.analysis.map(|a| a.uses_props).unwrap_or(false);
        let analysis_uses_rest_props = self.analysis.map(|a| a.uses_rest_props).unwrap_or(false);
        let analysis_uses_slots = self.analysis.map(|a| a.uses_slots).unwrap_or(false);
        let analysis_has_slot_names = self
            .analysis
            .map(|a| !a.slot_names.is_empty())
            .unwrap_or(false);
        let analysis_has_exports = self
            .analysis
            .map(|a| !a.exports.is_empty())
            .unwrap_or(false);
        let analysis_has_bindable_props = self
            .analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .any(|b| b.kind == BindingKind::BindableProp && !b.name.starts_with("$$"))
            })
            .unwrap_or(false);
        let uses_component_bindings = self
            .analysis
            .map(|a| a.uses_component_bindings)
            .unwrap_or(false);

        // Process instance script
        let (
            script_code,
            hoisted_imports,
            script_uses_props,
            _has_class_state_fields,
            uses_props_spread,
        ) = if let Some(script) = self.instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };
            let raw_script = if self.is_typescript && !raw_script.is_empty() {
                crate::compiler::phases::phase2_analyze::types::strip_typescript(&raw_script)
            } else {
                raw_script
            };
            let raw_script = remove_effect_blocks(&raw_script, self.use_async, self.dev);
            let has_bindable_props = self.analysis.is_some_and(|a| {
                a.root.bindings.iter().any(|b| {
                    matches!(
                        b.kind,
                        crate::compiler::phases::phase2_analyze::scope::BindingKind::BindableProp
                    )
                })
            });
            let raw_bytes = raw_script.as_bytes();
            let uses_props = memmem::find(raw_bytes, b"$props()").is_some()
                || memmem::find(raw_bytes, b"export let ").is_some()
                || memmem::find(raw_bytes, b"export var ").is_some()
                || has_bindable_props;
            let class_state_fields = memmem::find(raw_bytes, b"class ").is_some()
                && (memmem::find(raw_bytes, b"= $state(").is_some()
                    || memmem::find(raw_bytes, b"= $state.raw(").is_some()
                    || memmem::find(raw_bytes, b"= $derived(").is_some());
            let props_spread = detect_props_spread_pattern(&raw_script);
            let legacy_reactive_decl = extract_legacy_reactive_var_declaration(&raw_script);
            let imported_names =
                crate::compiler::phases::phase2_analyze::types::extract_imported_names(&raw_script);
            let (imports_raw, rest) = extract_imports(&raw_script);
            let imports: Vec<String> = imports_raw
                .into_iter()
                .map(|s| normalize_import(&s))
                .collect();
            let rest = transform_class_fields_server(&rest);
            let rest = self.transform_special_vars(&rest);
            let rest = transform_script::split_comma_separated_declarations(&rest);
            let rest = if let Some(analysis) = self.analysis {
                if !analysis.runes {
                    let reassigned_vars: Vec<String> = analysis
                        .root
                        .bindings
                        .iter()
                        .filter(|b| {
                            b.reassigned
                                && matches!(b.kind, BindingKind::Normal | BindingKind::State)
                        })
                        .map(|b| b.name.clone())
                        .collect();
                    if !reassigned_vars.is_empty() {
                        transform_script::transform_reassigned_destructures(&rest, &reassigned_vars)
                    } else {
                        rest
                    }
                } else {
                    rest
                }
            } else {
                rest
            };
            let reexported_props: Vec<(String, String)> = if has_bindable_props
                && memmem::find(raw_bytes, b"$props()").is_none()
            {
                self.analysis
                    .map(|a| {
                        a.root
                            .bindings
                            .iter()
                            .filter(|b| {
                                matches!(b.kind, BindingKind::BindableProp) && {
                                    !is_declared_via_export_let(&raw_script, b.name.as_str())
                                }
                            })
                            .map(|b| {
                                let prop_name = b.prop_alias.as_ref().unwrap_or(&b.name).clone();
                                (b.name.clone(), prop_name)
                            })
                            .collect()
                    })
                    .unwrap_or_default()
            } else {
                Vec::new()
            };
            let transformed = if reexported_props.is_empty() {
                transform_script_content_with_imports(&rest, &imported_names, self.dev)
            } else {
                transform_script_content_with_props_and_imports(
                    &rest,
                    &reexported_props,
                    &imported_names,
                    self.dev,
                )
            };
            let transformed = if legacy_reactive_decl.is_empty() {
                transformed
            } else {
                format!("{}\n{}", legacy_reactive_decl, transformed)
            };
            let transformed = self.transform_store_refs_in_script(&transformed);
            let transformed = transform_script::flatten_store_get_destructures(&transformed);
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

        // Apply async body transformation
        let script_code = if self.use_async && !script_code.trim().is_empty() {
            if let Some(async_result) =
                crate::compiler::phases::phase3_transform::shared::async_body::transform_async_body(
                    script_code.trim(),
                    "$$renderer.run",
                )
            {
                let trimmed = async_result.output.trim();
                let mut indented = String::new();
                let mut in_template_literal = false;
                for line in trimmed.lines() {
                    if line.trim().is_empty() {
                        indented.push('\n');
                    } else if in_template_literal {
                        in_template_literal =
                            super::helpers::update_template_literal_state_for_indent(
                                line,
                                in_template_literal,
                            );
                        indented.push_str(line);
                        indented.push('\n');
                    } else {
                        in_template_literal =
                            super::helpers::update_template_literal_state_for_indent(
                                line,
                                in_template_literal,
                            );
                        indented.push('\t');
                        indented.push_str(line);
                        indented.push('\n');
                    }
                }
                if indented.ends_with('\n') {
                    indented.pop();
                }
                indented
            } else {
                strip_async_placeholders(&script_code)
            }
        } else {
            script_code
        };

        // Normalize the script code with OXC
        let script_code = if !script_code.trim().is_empty() {
            normalize_script_with_oxc(&script_code, 1)
        } else {
            script_code
        };

        // Determine flags
        let should_inject_context = self.dev || needs_context;
        let needs_component_wrapper = should_inject_context;
        let should_inject_props = should_inject_context
            || analysis_needs_props
            || analysis_uses_props
            || analysis_uses_rest_props
            || analysis_uses_slots
            || analysis_has_slot_names
            || analysis_has_exports
            || analysis_has_bindable_props
            || script_uses_props;

        let has_content = !script_code.is_empty() || !body_code.is_empty();

        // ===================================================================
        // Build JsProgram
        // ===================================================================

        // Helper: strip the leading tab from the first line of raw content.
        // The codegen's emit_statement() adds indent to the first line of every
        // statement, so raw content placed inside a function body should not
        // have its own leading tab on the first line.
        fn strip_first_line_indent(code: &str) -> CompactString {
            CompactString::from(code.strip_prefix('\t').unwrap_or(code))
        }

        // 1. Async flag import
        if self.use_async {
            body.push(JsStatement::Import(JsImportDeclaration {
                source: CompactString::from("svelte/internal/flags/async"),
                specifiers: vec![JsImportSpecifier::SideEffect],
            }));
        }

        // 2. Filename section (dev mode) - placed after async import, before main import
        if self.dev
            && let Some(ref fname) = self.filename
        {
            let display_name = fname.replace('\\', "/");
            body.push(JsStatement::Raw(CompactString::from(format!(
                "{}[$.FILENAME] = '{}';",
                self.component_name, display_name
            ))));
        }

        // 3. Legacy render import (componentApi v4)
        if self.component_api_v4 {
            body.push(JsStatement::Import(JsImportDeclaration {
                source: CompactString::from("svelte/server"),
                specifiers: vec![JsImportSpecifier::Named {
                    imported: CompactString::from("render"),
                    local: CompactString::from("$$_render"),
                }],
            }));
        }

        // 4. Main import: import * as $ from 'svelte/internal/server'
        body.push(JsStatement::Import(JsImportDeclaration {
            source: CompactString::from("svelte/internal/server"),
            specifiers: vec![JsImportSpecifier::Namespace(CompactString::from("$"))],
        }));

        // 5. Instance imports (hoisted)
        for imp in &hoisted_imports {
            body.push(JsStatement::Raw(CompactString::from(imp.as_str())));
        }

        // 6. Snippet functions (hoisted)
        let snippets_section = self.build_snippets();
        if !snippets_section.is_empty() {
            // Snippets may contain multiple function declarations.
            // Emit each non-empty line group as a separate Raw statement.
            let trimmed = snippets_section.trim();
            if !trimmed.is_empty() {
                body.push(JsStatement::Raw(CompactString::from(trimmed)));
            }
        }

        // 7. Module imports + code
        for imp in &module_imports {
            body.push(JsStatement::Raw(CompactString::from(imp.as_str())));
        }
        if !module_code.trim().is_empty() {
            body.push(JsStatement::Raw(CompactString::from(module_code.trim())));
        }

        // 8. CSS const section
        if let Some((ref hash, ref code)) = self.injected_css {
            let escaped_code = code.replace('\'', "\\'");
            body.push(JsStatement::Raw(CompactString::from(format!(
                "const $$css = {{\n\thash: '{}',\n\tcode: '{}'\n}};",
                hash, escaped_code
            ))));
        }

        // 9. Build the component function body
        let mut fn_body: Vec<JsStatement> = Vec::new();

        // CSS add call (inside function body)
        if self.injected_css.is_some() {
            fn_body.push(JsStatement::Raw(CompactString::from(
                "$$renderer.global.css.add($$css);",
            )));
        }

        if has_content {
            if needs_component_wrapper {
                // Build the $$renderer.component() wrapper as a Raw statement.
                // This contains the entire wrapper including inner script and body.
                let props_declarations = self.build_props_declarations(1);
                let wrapper_indent = if self.dev { 3 } else { 2 };
                let extra_tabs = if self.dev { 2 } else { 1 };

                let inner_script =
                    transform_props_spread_ex(&script_code, extra_tabs, analysis_uses_slots);
                let mut each_counter_w: usize = 0;
                let hoisted_parts_wrapper = Self::hoist_svelte_head(&self.output_parts);
                let hoisted_parts_wrapper = if !blocker_map.is_empty() {
                    Self::apply_async_wrapping(&hoisted_parts_wrapper, &blocker_map)
                } else {
                    hoisted_parts_wrapper
                };
                let inner_body = Self::build_parts_with_store_subs(
                    &hoisted_parts_wrapper,
                    wrapper_indent,
                    &mut each_counter_w,
                    &store_subs_ref,
                );
                let instance_snippets = self.build_instance_snippets(wrapper_indent);
                let bind_props_code = self.build_bind_props(wrapper_indent);
                let indent_str = "\t".repeat(wrapper_indent);

                let store_subs_decl = if self.uses_store_subs {
                    format!("{}var $$store_subs;\n", indent_str)
                } else {
                    String::new()
                };
                let store_subs_cleanup = if self.uses_store_subs {
                    format!(
                        "\n{}if ($$store_subs) $.unsubscribe_stores($$store_subs);\n",
                        indent_str
                    )
                } else {
                    String::new()
                };

                let inner_body = if uses_component_bindings {
                    let bi = &indent_str;
                    let ii = "\t".repeat(wrapper_indent + 1);
                    format!(
                        r#"{bi}let $$settled = true;
{bi}let $$inner_renderer;

{bi}function $$render_inner($$renderer) {{
{body_code}{bi}}}

{bi}do {{
{ii}$$settled = true;
{ii}$$inner_renderer = $$renderer.copy();
{ii}$$render_inner($$inner_renderer);
{bi}}} while (!$$settled);

{bi}$$renderer.subsume($$inner_renderer);
"#,
                        bi = bi,
                        ii = ii,
                        body_code = inner_body.clone()
                    )
                } else {
                    inner_body
                };

                let component_second_arg = if self.dev {
                    format!(",\n\t\t{}", self.component_name)
                } else {
                    String::new()
                };

                // Build props_declarations as Raw (if non-empty)
                if !props_declarations.is_empty() {
                    fn_body.push(JsStatement::Raw(strip_first_line_indent(
                        &props_declarations,
                    )));
                }

                // Build the wrapper call as a single Raw statement
                let wrapper_code = if self.dev {
                    format!(
                        r#"$$renderer.component(
		($$renderer) => {{
{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{store_subs_cleanup}{bind_props_code}		}}{component_second_arg}
	);"#,
                        store_subs_decl = store_subs_decl,
                        inner_script = inner_script,
                        instance_snippets = instance_snippets,
                        inner_body = inner_body,
                        store_subs_cleanup = store_subs_cleanup,
                        bind_props_code = bind_props_code,
                        component_second_arg = component_second_arg,
                    )
                } else {
                    format!(
                        r#"$$renderer.component(($$renderer) => {{
{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{store_subs_cleanup}{bind_props_code}	}}{component_second_arg});"#,
                        store_subs_decl = store_subs_decl,
                        inner_script = inner_script,
                        instance_snippets = instance_snippets,
                        inner_body = inner_body,
                        store_subs_cleanup = store_subs_cleanup,
                        bind_props_code = bind_props_code,
                        component_second_arg = component_second_arg,
                    )
                };
                fn_body.push(JsStatement::Raw(CompactString::from(wrapper_code)));
            } else {
                // No component wrapper - direct function body
                let props_declarations = self.build_props_declarations(1);
                let script_code = if uses_props_spread {
                    transform_props_spread_ex(&script_code, 0, analysis_uses_slots)
                } else {
                    script_code
                };
                let instance_snippets = self.build_instance_snippets(1);
                let bind_props_code = self.build_bind_props(1);

                // Store subs
                if self.uses_store_subs {
                    fn_body.push(JsStatement::Raw(CompactString::from("var $$store_subs;")));
                }

                // Props declarations
                if !props_declarations.is_empty() {
                    fn_body.push(JsStatement::Raw(strip_first_line_indent(
                        &props_declarations,
                    )));
                }

                // Script code
                if !script_code.is_empty() {
                    fn_body.push(JsStatement::Raw(strip_first_line_indent(&script_code)));
                }

                // Instance snippets
                if !instance_snippets.is_empty() {
                    fn_body.push(JsStatement::Raw(strip_first_line_indent(
                        &instance_snippets,
                    )));
                }

                // Body code (template output)
                if !body_code.is_empty() {
                    let body_section = if uses_component_bindings {
                        let body_code_extra_indent = {
                            let mut result = String::new();
                            let mut in_template_literal = false;
                            for line in body_code.lines() {
                                if line.trim().is_empty() {
                                    result.push('\n');
                                } else if in_template_literal {
                                    in_template_literal =
                                        super::helpers::update_template_literal_state_for_indent(
                                            line,
                                            in_template_literal,
                                        );
                                    result.push_str(line);
                                    result.push('\n');
                                } else {
                                    in_template_literal =
                                        super::helpers::update_template_literal_state_for_indent(
                                            line,
                                            in_template_literal,
                                        );
                                    result.push('\t');
                                    result.push_str(line);
                                    result.push('\n');
                                }
                            }
                            result
                        };
                        format!(
                            r#"let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {{
{body_code}	}}

	do {{
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	}} while (!$$settled);

	$$renderer.subsume($$inner_renderer);"#,
                            body_code = body_code_extra_indent,
                        )
                    } else {
                        // Strip trailing newline from body_code, strip first line indent
                        let trimmed = body_code.trim_end_matches('\n');
                        trimmed.strip_prefix('\t').unwrap_or(trimmed).to_string()
                    };
                    fn_body.push(JsStatement::Raw(CompactString::from(body_section)));
                }

                // Store subs cleanup
                if self.uses_store_subs {
                    fn_body.push(JsStatement::Raw(CompactString::from(
                        "if ($$store_subs) $.unsubscribe_stores($$store_subs);",
                    )));
                }

                // Bind props
                if !bind_props_code.is_empty() {
                    fn_body.push(JsStatement::Raw(strip_first_line_indent(
                        bind_props_code.trim_end_matches('\n'),
                    )));
                }
            }
        } else if needs_component_wrapper {
            // Empty body but needs component wrapper
            let component_second_arg = if self.dev {
                format!(", {}", self.component_name)
            } else {
                String::new()
            };
            let bind_props_code = self.build_bind_props(1);
            fn_body.push(JsStatement::Raw(CompactString::from(format!(
                "$$renderer.component(($$renderer) => {{}}{});",
                component_second_arg
            ))));
            if !bind_props_code.is_empty() {
                fn_body.push(JsStatement::Raw(strip_first_line_indent(
                    bind_props_code.trim_end_matches('\n'),
                )));
            }
        } else {
            // Empty body
            let bind_props_code = self.build_bind_props(1);
            if !bind_props_code.is_empty() {
                fn_body.push(JsStatement::Raw(strip_first_line_indent(
                    bind_props_code.trim_end_matches('\n'),
                )));
            }
        }

        // 10. Build function params
        let params = if should_inject_props {
            smallvec![
                JsPattern::Identifier(CompactString::from("$$renderer")),
                JsPattern::Identifier(CompactString::from("$$props")),
            ]
        } else {
            smallvec![JsPattern::Identifier(CompactString::from("$$renderer"))]
        };

        let fn_decl = JsFunctionDeclaration {
            id: Some(CompactString::from(self.component_name.as_str())),
            params,
            body: JsBlockStatement { body: fn_body },
            is_async: false,
            is_generator: false,
        };

        // 11. Export strategy
        if self.dev || self.component_api_v4 {
            // Separate declaration + export
            body.push(JsStatement::FunctionDeclaration(fn_decl));

            // Dev/v4 extra methods + export default
            if self.component_api_v4 {
                body.push(JsStatement::Raw(CompactString::from(format!(
                    "{name}.render = function ($$props, $$opts) {{\n\treturn $$_render({name}, {{ props: $$props, context: $$opts?.context }});\n}};",
                    name = self.component_name
                ))));
            } else {
                // Dev mode
                body.push(JsStatement::Raw(CompactString::from(format!(
                    "{name}.render = function () {{\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n}};",
                    name = self.component_name
                ))));
            }

            body.push(JsStatement::ExportDefault(JsExportDefault {
                declaration: JsExportDefaultDeclaration::Expression(arena.alloc_expr(
                    JsExpr::Identifier(CompactString::from(self.component_name.as_str())),
                )),
            }));
        } else {
            // export default function ...
            body.push(JsStatement::ExportDefault(JsExportDefault {
                declaration: JsExportDefaultDeclaration::Function(fn_decl),
            }));
        }

        (JsProgram { body }, arena)
    }

    #[allow(dead_code)]
    /// Hoist ConstDeclaration parts to the front of a parts slice.
    /// This mirrors the official Svelte compiler's behavior where @const declarations
    /// are pushed to state.init (before template) in the EachBlock visitor.
    #[allow(dead_code)]
    fn hoist_const_declarations(parts: &[OutputPart]) -> Vec<OutputPart> {
        let mut consts: Vec<OutputPart> = Vec::new();
        let mut rest: Vec<OutputPart> = Vec::new();
        for part in parts {
            if matches!(part, OutputPart::ConstDeclaration(_)) {
                consts.push(part.clone());
            } else {
                rest.push(part.clone());
            }
        }
        consts.extend(rest);
        consts
    }

    /// Hoist ConstDeclaration parts to the front AND strip whitespace-only Html parts
    /// that appear interspersed among ConstDeclarations. This is needed for if-block bodies
    /// where the official compiler removes whitespace text nodes between @const declarations.
    ///
    /// The approach: scan through parts, collect ConstDeclarations and skip whitespace-only
    /// Html parts that appear in a "const declaration region" (before any non-whitespace Html).
    pub(crate) fn hoist_const_declarations_and_strip_ws(parts: &[OutputPart]) -> Vec<OutputPart> {
        let mut consts: Vec<OutputPart> = Vec::new();
        let mut rest: Vec<OutputPart> = Vec::new();
        let mut in_const_region = true; // Start in const region (beginning of block)

        for part in parts {
            match part {
                OutputPart::ConstDeclaration(_) => {
                    // Always hoist const declarations
                    consts.push(part.clone());
                    in_const_region = true; // After a const, we're still in const region
                }
                OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
                    if in_const_region && html.trim().is_empty() {
                        // Skip whitespace-only Html between/after ConstDeclarations
                        // Don't add to rest - it gets discarded
                    } else {
                        in_const_region = false; // Real HTML content, leave const region
                        rest.push(part.clone());
                    }
                }
                _ => {
                    in_const_region = false;
                    rest.push(part.clone());
                }
            }
        }

        consts.extend(rest);
        consts
    }

    /// Hoist SvelteHead parts to the front of a parts slice.
    /// The official Svelte compiler always renders <svelte:head> content before body content.
    fn hoist_svelte_head(parts: &[OutputPart]) -> Vec<OutputPart> {
        let mut heads: Vec<OutputPart> = Vec::new();
        let mut rest: Vec<OutputPart> = Vec::new();
        for part in parts {
            if matches!(part, OutputPart::SvelteHead { .. }) {
                heads.push(part.clone());
            } else {
                rest.push(part.clone());
            }
        }
        heads.extend(rest);
        heads
    }

    /// Collect all blocker indices from an if-else-if chain's test expressions.
    /// Stops recursion when encountering an else-if with an `await` expression,
    /// since those branches get their own async block wrapper.
    fn collect_if_chain_blockers_recursive(
        test_expr: &str,
        alternate_body: Option<&[OutputPart]>,
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
        all_blockers: &mut std::collections::BTreeSet<usize>,
    ) {
        // Add blockers from this test expression
        for idx in super::helpers::find_expression_blockers(test_expr, blocker_map) {
            all_blockers.insert(idx);
        }
        // If the alternate is a single else-if, recurse into it
        // But don't recurse if the else-if's test has await - it gets its own async block
        if let Some(alt) = alternate_body
            && alt.len() == 1
            && let OutputPart::IfBlock {
                test_expr: alt_test,
                alternate_body: alt_alt,
                is_elseif: true,
                ..
            } = &alt[0]
            && !super::helpers::expr_contains_await(alt_test)
        {
            Self::collect_if_chain_blockers_recursive(
                alt_test,
                alt_alt.as_deref(),
                blocker_map,
                all_blockers,
            );
        }
    }

    /// Collect all blocker indices from output parts (recursively).
    #[allow(dead_code)]
    fn collect_parts_blockers(
        parts: &[OutputPart],
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
        all_blockers: &mut std::collections::BTreeSet<usize>,
    ) {
        for part in parts {
            match part {
                OutputPart::Expression(expr) | OutputPart::RawExpression(expr) => {
                    for idx in super::helpers::find_expression_blockers(expr, blocker_map) {
                        all_blockers.insert(idx);
                    }
                }
                OutputPart::AsyncExpression { expr, .. } => {
                    for idx in super::helpers::find_expression_blockers(expr, blocker_map) {
                        all_blockers.insert(idx);
                    }
                }
                OutputPart::Html(html) => {
                    for idx in super::helpers::find_expression_blockers(html, blocker_map) {
                        all_blockers.insert(idx);
                    }
                }
                OutputPart::HtmlWithExclusions {
                    html,
                    excluded_blocker_vars,
                } => {
                    // Same as Html but exclude certain variable names from blocker detection.
                    // This implements the PromiseOptimiser pattern where shorthand style
                    // directives (style:color) bypass the transform callback and should not
                    // contribute blocker dependencies.
                    for idx in super::helpers::find_expression_blockers(html, blocker_map) {
                        // Check if the variable corresponding to this blocker index is excluded
                        let is_excluded = blocker_map.iter().any(|(var_name, &mapped_idx)| {
                            mapped_idx == idx && excluded_blocker_vars.contains(var_name)
                        });
                        if !is_excluded {
                            all_blockers.insert(idx);
                        }
                    }
                }
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                    ..
                } => {
                    for idx in super::helpers::find_expression_blockers(test_expr, blocker_map) {
                        all_blockers.insert(idx);
                    }
                    Self::collect_parts_blockers(consequent_body, blocker_map, all_blockers);
                    if let Some(alt) = alternate_body {
                        Self::collect_parts_blockers(alt, blocker_map, all_blockers);
                    }
                }
                OutputPart::EachBlock { iterable, body, .. } => {
                    for idx in super::helpers::find_expression_blockers(iterable, blocker_map) {
                        all_blockers.insert(idx);
                    }
                    Self::collect_parts_blockers(body, blocker_map, all_blockers);
                }
                OutputPart::Component {
                    name,
                    props_and_spreads,
                    attach_expressions,
                    ..
                } => {
                    for idx in super::helpers::find_expression_blockers(name, blocker_map) {
                        all_blockers.insert(idx);
                    }
                    for item in props_and_spreads {
                        match item {
                            ComponentPropItem::Props(props) => {
                                for prop in props {
                                    for idx in
                                        super::helpers::find_expression_blockers(prop, blocker_map)
                                    {
                                        all_blockers.insert(idx);
                                    }
                                }
                            }
                            ComponentPropItem::Spread(expr) => {
                                for idx in
                                    super::helpers::find_expression_blockers(expr, blocker_map)
                                {
                                    all_blockers.insert(idx);
                                }
                            }
                        }
                    }
                    for expr in attach_expressions {
                        for idx in super::helpers::find_expression_blockers(expr, blocker_map) {
                            all_blockers.insert(idx);
                        }
                    }
                }
                _ => {}
            }
        }
    }

    /// Like apply_async_wrapping but skips wrapping else-if IfBlocks in AsyncBlock.
    /// The outermost if in the chain handles the wrapping.
    /// Exception: else-if blocks with `await` in their test get their own async wrapping.
    fn apply_async_wrapping_skip_elseif(
        parts: &[OutputPart],
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
    ) -> Vec<OutputPart> {
        let mut result = Vec::with_capacity(parts.len());
        for part in parts {
            match part {
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                    is_elseif,
                } if *is_elseif && !super::helpers::expr_contains_await(test_expr) => {
                    // Don't wrap this else-if in AsyncBlock - the outer chain handles it.
                    let wrapped_consequent =
                        Self::apply_async_wrapping(consequent_body, blocker_map);
                    let wrapped_alternate = alternate_body
                        .as_ref()
                        .map(|alt| Self::apply_async_wrapping_skip_elseif(alt, blocker_map));
                    result.push(OutputPart::IfBlock {
                        test_expr: test_expr.clone(),
                        consequent_body: wrapped_consequent,
                        alternate_body: wrapped_alternate,
                        is_elseif: true,
                    });
                }
                _ => {
                    // For non-elseif parts (or else-if with await), use normal wrapping
                    let mut wrapped =
                        Self::apply_async_wrapping(std::slice::from_ref(part), blocker_map);
                    result.append(&mut wrapped);
                }
            }
        }
        result
    }

    /// Apply async wrapping to output parts based on the blocker_map.
    ///
    /// This transforms top-level IfBlock/EachBlock parts whose test/iterable expressions
    /// reference blocked variables into AsyncBlock parts, and Expression parts that reference
    /// blocked variables into AsyncWrappedExpression parts.
    ///
    /// Corresponds to `create_child_block()` and `PromiseOptimiser.render()` in the official compiler.
    fn apply_async_wrapping(
        parts: &[OutputPart],
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
    ) -> Vec<OutputPart> {
        // Pre-pass: merge Html parts that contain blocked expressions with their
        // immediately following closing tag Html parts.
        // This ensures elements like <div${...}></div> are treated as one unit.
        let parts = Self::merge_html_with_closing_tags(parts, blocker_map);

        let mut result = Vec::with_capacity(parts.len());

        for part in &parts {
            match part {
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                    is_elseif,
                } => {
                    // Collect blockers from all test expressions in the if-else-if chain.
                    // This matches the official compiler's node.metadata.expression.blockers()
                    // which aggregates blockers from test expressions in the chain.
                    let mut all_chain_blockers = std::collections::BTreeSet::new();
                    Self::collect_if_chain_blockers_recursive(
                        test_expr,
                        alternate_body.as_deref(),
                        blocker_map,
                        &mut all_chain_blockers,
                    );

                    // Recursively wrap child bodies, but skip else-if wrapping
                    // since the outermost wrapper handles the entire chain
                    let wrapped_consequent =
                        Self::apply_async_wrapping(consequent_body, blocker_map);
                    let wrapped_alternate = alternate_body
                        .as_ref()
                        .map(|alt| Self::apply_async_wrapping_skip_elseif(alt, blocker_map));

                    let blocker_indices: Vec<usize> = all_chain_blockers.into_iter().collect();
                    if !blocker_indices.is_empty() {
                        result.push(OutputPart::AsyncBlock {
                            blocker_indices,
                            inner: vec![OutputPart::IfBlock {
                                test_expr: test_expr.clone(),
                                consequent_body: wrapped_consequent,
                                alternate_body: wrapped_alternate,
                                is_elseif: *is_elseif,
                            }],
                        });
                    } else {
                        result.push(OutputPart::IfBlock {
                            test_expr: test_expr.clone(),
                            consequent_body: wrapped_consequent,
                            alternate_body: wrapped_alternate,
                            is_elseif: *is_elseif,
                        });
                    }
                }
                OutputPart::EachBlock {
                    iterable,
                    context_name,
                    index_name,
                    index_alias,
                    body,
                    fallback,
                } => {
                    // Recursively wrap child body
                    let wrapped_body = Self::apply_async_wrapping(body, blocker_map);
                    let wrapped_fallback = fallback
                        .as_ref()
                        .map(|fb| Self::apply_async_wrapping(fb, blocker_map));

                    let blockers = super::helpers::find_expression_blockers(iterable, blocker_map);
                    if !blockers.is_empty() {
                        // Wrap the each-block in $$renderer.async_block([blockers], ...)
                        result.push(OutputPart::AsyncBlock {
                            blocker_indices: blockers,
                            inner: vec![OutputPart::EachBlock {
                                iterable: iterable.clone(),
                                context_name: context_name.clone(),
                                index_name: index_name.clone(),
                                index_alias: index_alias.clone(),
                                body: wrapped_body,
                                fallback: wrapped_fallback,
                            }],
                        });
                    } else {
                        result.push(OutputPart::EachBlock {
                            iterable: iterable.clone(),
                            context_name: context_name.clone(),
                            index_name: index_name.clone(),
                            index_alias: index_alias.clone(),
                            body: wrapped_body,
                            fallback: wrapped_fallback,
                        });
                    }
                }
                OutputPart::Expression(expr) => {
                    let blockers = super::helpers::find_expression_blockers(expr, blocker_map);
                    if !blockers.is_empty() {
                        // Wrap the expression in $$renderer.async([blockers], ...)
                        result.push(OutputPart::AsyncWrappedExpression {
                            blocker_indices: blockers,
                            expr: expr.clone(),
                        });
                    } else {
                        result.push(part.clone());
                    }
                }
                OutputPart::Component {
                    name,
                    props_and_spreads,
                    has_prior_content,
                    children,
                    snippets,
                    slot_names,
                    dynamic,
                    let_directives,
                    css_custom_props,
                    css_props_is_html,
                    attach_expressions,
                    dev,
                    ..
                } => {
                    // Find blockers from component name, all prop expressions,
                    // and attach/bind:this expressions
                    let mut all_blockers = std::collections::BTreeSet::new();
                    for idx in super::helpers::find_expression_blockers(name, blocker_map) {
                        all_blockers.insert(idx);
                    }
                    for item in props_and_spreads {
                        match item {
                            ComponentPropItem::Props(props) => {
                                for prop in props {
                                    for idx in
                                        super::helpers::find_expression_blockers(prop, blocker_map)
                                    {
                                        all_blockers.insert(idx);
                                    }
                                }
                            }
                            ComponentPropItem::Spread(expr) => {
                                for idx in
                                    super::helpers::find_expression_blockers(expr, blocker_map)
                                {
                                    all_blockers.insert(idx);
                                }
                            }
                        }
                    }
                    // Check attach/bind:this expressions for blockers
                    for expr in attach_expressions {
                        for idx in super::helpers::find_expression_blockers(expr, blocker_map) {
                            all_blockers.insert(idx);
                        }
                    }
                    // Recursively apply async wrapping to children and snippets
                    let wrapped_children = children
                        .as_ref()
                        .map(|c| Self::apply_async_wrapping(c, blocker_map));
                    let wrapped_snippets: Vec<_> = snippets
                        .iter()
                        .map(|(sname, sparams, sbody, sis_true)| {
                            (
                                sname.clone(),
                                sparams.clone(),
                                Self::apply_async_wrapping(sbody, blocker_map),
                                *sis_true,
                            )
                        })
                        .collect();

                    let blocker_indices: Vec<usize> = all_blockers.into_iter().collect();
                    if !blocker_indices.is_empty() {
                        result.push(OutputPart::AsyncBlock {
                            blocker_indices,
                            inner: vec![OutputPart::Component {
                                name: name.clone(),
                                props_and_spreads: props_and_spreads.clone(),
                                has_prior_content: false,
                                children: wrapped_children,
                                snippets: wrapped_snippets,
                                slot_names: slot_names.clone(),
                                dynamic: *dynamic,
                                let_directives: let_directives.clone(),
                                css_custom_props: css_custom_props.clone(),
                                css_props_is_html: *css_props_is_html,
                                in_async_block: true,
                                attach_expressions: attach_expressions.clone(),
                                dev: *dev,
                            }],
                        });
                    } else if children.is_some() || !snippets.is_empty() {
                        // Reconstruct with wrapped children/snippets
                        result.push(OutputPart::Component {
                            name: name.clone(),
                            props_and_spreads: props_and_spreads.clone(),
                            has_prior_content: *has_prior_content,
                            children: wrapped_children,
                            snippets: wrapped_snippets,
                            slot_names: slot_names.clone(),
                            dynamic: *dynamic,
                            let_directives: let_directives.clone(),
                            css_custom_props: css_custom_props.clone(),
                            css_props_is_html: *css_props_is_html,
                            in_async_block: false,
                            attach_expressions: attach_expressions.clone(),
                            dev: *dev,
                        });
                    } else {
                        // No children to recurse into - just clone the original
                        result.push(part.clone());
                    }
                }
                OutputPart::ComponentWithBindings {
                    name,
                    props_and_spreads,
                    bindings,
                    has_prior_content,
                    children,
                    snippets,
                    slot_names,
                    dynamic,
                    css_custom_props,
                    css_props_is_html,
                    dev,
                    ..
                } => {
                    // Find blockers from component name, props, and bindings
                    let mut all_blockers = std::collections::BTreeSet::new();
                    for idx in super::helpers::find_expression_blockers(name, blocker_map) {
                        all_blockers.insert(idx);
                    }
                    for item in props_and_spreads {
                        match item {
                            ComponentPropItem::Props(props) => {
                                for prop in props {
                                    for idx in
                                        super::helpers::find_expression_blockers(prop, blocker_map)
                                    {
                                        all_blockers.insert(idx);
                                    }
                                }
                            }
                            ComponentPropItem::Spread(expr) => {
                                for idx in
                                    super::helpers::find_expression_blockers(expr, blocker_map)
                                {
                                    all_blockers.insert(idx);
                                }
                            }
                        }
                    }
                    for binding in bindings {
                        match binding {
                            ComponentBinding::Simple { var_name, .. } => {
                                for idx in
                                    super::helpers::find_expression_blockers(var_name, blocker_map)
                                {
                                    all_blockers.insert(idx);
                                }
                            }
                            ComponentBinding::SequenceExpression {
                                getter_expr,
                                setter_expr,
                                ..
                            } => {
                                for idx in super::helpers::find_expression_blockers(
                                    getter_expr,
                                    blocker_map,
                                ) {
                                    all_blockers.insert(idx);
                                }
                                for idx in super::helpers::find_expression_blockers(
                                    setter_expr,
                                    blocker_map,
                                ) {
                                    all_blockers.insert(idx);
                                }
                            }
                        }
                    }
                    // Recursively apply async wrapping to children
                    let wrapped_children = children
                        .as_ref()
                        .map(|c| Self::apply_async_wrapping(c, blocker_map));

                    let blocker_indices: Vec<usize> = all_blockers.into_iter().collect();
                    if !blocker_indices.is_empty() {
                        // bind_get/bind_set VarDeclarations are now emitted by the
                        // component visitor and naturally stay outside the AsyncBlock
                        // (they're separate parts that pass through apply_async_wrapping).
                        result.push(OutputPart::AsyncBlock {
                            blocker_indices,
                            inner: vec![OutputPart::ComponentWithBindings {
                                name: name.clone(),
                                props_and_spreads: props_and_spreads.clone(),
                                bindings: bindings.clone(),
                                has_prior_content: false,
                                children: wrapped_children,
                                snippets: snippets.clone(),
                                slot_names: slot_names.clone(),
                                dynamic: *dynamic,
                                css_custom_props: css_custom_props.clone(),
                                css_props_is_html: *css_props_is_html,
                                seq_bindings_hoisted: true,
                                dev: *dev,
                            }],
                        });
                    } else if children.is_some() {
                        result.push(OutputPart::ComponentWithBindings {
                            name: name.clone(),
                            props_and_spreads: props_and_spreads.clone(),
                            bindings: bindings.clone(),
                            has_prior_content: *has_prior_content,
                            children: wrapped_children,
                            snippets: snippets.clone(),
                            slot_names: slot_names.clone(),
                            dynamic: *dynamic,
                            css_custom_props: css_custom_props.clone(),
                            css_props_is_html: *css_props_is_html,
                            seq_bindings_hoisted: false,
                            dev: *dev,
                        });
                    } else {
                        result.push(part.clone());
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
                    let blockers = super::helpers::find_expression_blockers(promise, blocker_map);
                    if !blockers.is_empty() {
                        result.push(OutputPart::AsyncBlock {
                            blocker_indices: blockers,
                            inner: vec![OutputPart::AwaitBlock {
                                promise: promise.clone(),
                                then_param: then_param.clone(),
                                pending_body: pending_body.clone(),
                                then_body: then_body.clone(),
                                catch_param: catch_param.clone(),
                                catch_body: catch_body.clone(),
                            }],
                        });
                    } else {
                        result.push(part.clone());
                    }
                }
                OutputPart::RenderCall { call_str, .. } => {
                    let blockers = super::helpers::find_expression_blockers(call_str, blocker_map);
                    if !blockers.is_empty() {
                        // When wrapping in AsyncBlock, suppress the hydration boundary marker
                        // (the async wrapping itself acts as the boundary)
                        result.push(OutputPart::AsyncBlock {
                            blocker_indices: blockers,
                            inner: vec![OutputPart::RenderCall {
                                call_str: call_str.clone(),
                                skip_boundary: true,
                            }],
                        });
                    } else {
                        result.push(part.clone());
                    }
                }
                OutputPart::RawStatement(stmt) => {
                    // Don't wrap `let` or `var` declarations in async blocks.
                    // These are variable declarations (e.g., from async const tags)
                    // that declare new variables rather than using blocked values.
                    // Also skip `var ... = $$renderer.run(...)` statements which are
                    // the async const group runner calls that are self-contained.
                    let is_declaration = stmt.starts_with("let ") || stmt.starts_with("var ");
                    if is_declaration {
                        result.push(part.clone());
                    } else {
                        let blockers = super::helpers::find_expression_blockers(stmt, blocker_map);
                        if !blockers.is_empty() {
                            result.push(OutputPart::AsyncBlock {
                                blocker_indices: blockers,
                                inner: vec![part.clone()],
                            });
                        } else {
                            result.push(part.clone());
                        }
                    }
                }
                OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
                    // Get excluded vars if this is HtmlWithExclusions
                    let excluded_vars: &[String] = match part {
                        OutputPart::HtmlWithExclusions {
                            excluded_blocker_vars,
                            ..
                        } => excluded_blocker_vars,
                        _ => &[],
                    };

                    // Build a filtered blocker map that excludes specified variables
                    let effective_blocker_map: rustc_hash::FxHashMap<String, usize> =
                        if excluded_vars.is_empty() {
                            blocker_map.clone()
                        } else {
                            blocker_map
                                .iter()
                                .filter(|(name, _)| !excluded_vars.contains(name))
                                .map(|(k, v)| (k.clone(), *v))
                                .collect()
                        };

                    // Check if the Html part contains references to blocked variables.
                    // IMPORTANT: Only check ${...} expressions for blockers, not static text.
                    let blockers =
                        Self::find_html_expression_blockers(html, &effective_blocker_map);
                    if !blockers.is_empty() {
                        // Split the HTML into segments at element boundaries.
                        let segments = Self::split_html_by_blockers(html, &effective_blocker_map);
                        for seg in segments {
                            match seg {
                                HtmlSegment::Static(s) => {
                                    if !s.is_empty() {
                                        result.push(OutputPart::Html(s));
                                    }
                                }
                                HtmlSegment::Blocked { html, blockers } => {
                                    result.push(OutputPart::AsyncWrappedHtml {
                                        blocker_indices: blockers,
                                        html,
                                    });
                                }
                            }
                        }
                    } else {
                        result.push(part.clone());
                    }
                }
                OutputPart::AsyncExpression { expr, has_save } => {
                    let blockers = super::helpers::find_expression_blockers(expr, blocker_map);
                    if !blockers.is_empty() {
                        result.push(OutputPart::AsyncWrappedExpression {
                            blocker_indices: blockers,
                            expr: expr.clone(),
                        });
                    } else {
                        result.push(OutputPart::AsyncExpression {
                            expr: expr.clone(),
                            has_save: *has_save,
                        });
                    }
                }
                _ => {
                    result.push(part.clone());
                }
            }
        }

        result
    }

    /// Apply const-tag-level async wrapping to output parts.
    ///
    /// This wraps Expression parts (and expressions within Html parts) that reference
    /// const-blocked variables in `$$renderer.async([blockers], ...)` calls.
    /// Unlike `apply_async_wrapping` which uses `$$promises[N]`, this uses custom
    /// blocker expressions like `promises_N[M]` from const tag run groups.
    ///
    /// The blocker map is built incrementally from `ConstBlockerMetadata` parts
    /// found within the parts array. This handles scoping correctly - each scope
    /// level contributes its own blocker entries to the map.
    pub(crate) fn apply_const_async_wrapping(
        parts: &[OutputPart],
        parent_blocker_map: &rustc_hash::FxHashMap<String, String>,
    ) -> Vec<OutputPart> {
        // Build a local blocker map by starting from the parent and adding entries
        // from ConstBlockerMetadata parts in this scope.
        // We do a two-pass approach:
        // 1. First pass: collect all ConstBlockerMetadata entries in this scope
        // 2. Second pass: apply wrapping using the complete map
        let mut local_map = parent_blocker_map.clone();
        for part in parts {
            if let OutputPart::ConstBlockerMetadata { blocker_entries } = part {
                for (name, blocker) in blocker_entries {
                    local_map.insert(name.clone(), blocker.clone());
                }
            }
        }

        let mut result = Vec::with_capacity(parts.len());

        for part in parts {
            match part {
                OutputPart::ConstBlockerMetadata { .. } => {
                    // Don't include metadata parts in output - they're consumed above
                }
                OutputPart::Expression(expr) => {
                    let blockers = super::helpers::find_const_expression_blockers(expr, &local_map);
                    if !blockers.is_empty() {
                        result.push(OutputPart::AsyncWrappedExpressionCustom {
                            blockers,
                            expr: expr.clone(),
                        });
                    } else {
                        result.push(part.clone());
                    }
                }
                OutputPart::Html(html) => {
                    let blockers = super::helpers::find_const_html_blockers(html, &local_map);
                    if !blockers.is_empty() {
                        if let Some((prefix, expr, suffix)) =
                            super::helpers::split_html_expression(html)
                        {
                            if !prefix.is_empty() {
                                result.push(OutputPart::Html(prefix));
                            }
                            result
                                .push(OutputPart::AsyncWrappedExpressionCustom { blockers, expr });
                            if !suffix.is_empty() {
                                result.push(OutputPart::Html(suffix));
                            }
                        } else {
                            result.push(part.clone());
                        }
                    } else {
                        result.push(part.clone());
                    }
                }
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                    is_elseif,
                } => {
                    let test_blockers =
                        super::helpers::find_const_expression_blockers(test_expr, &local_map);
                    if !test_blockers.is_empty() {
                        let wrapped_consequent =
                            Self::apply_const_async_wrapping(consequent_body, &local_map);
                        let wrapped_alternate = alternate_body
                            .as_ref()
                            .map(|alt| Self::apply_const_async_wrapping(alt, &local_map));
                        result.push(OutputPart::AsyncBlockCustom {
                            blockers: test_blockers,
                            inner: vec![OutputPart::IfBlock {
                                test_expr: test_expr.clone(),
                                consequent_body: wrapped_consequent,
                                alternate_body: wrapped_alternate,
                                is_elseif: *is_elseif,
                            }],
                        });
                    } else {
                        let wrapped_consequent =
                            Self::apply_const_async_wrapping(consequent_body, &local_map);
                        let wrapped_alternate = alternate_body
                            .as_ref()
                            .map(|alt| Self::apply_const_async_wrapping(alt, &local_map));
                        result.push(OutputPart::IfBlock {
                            test_expr: test_expr.clone(),
                            consequent_body: wrapped_consequent,
                            alternate_body: wrapped_alternate,
                            is_elseif: *is_elseif,
                        });
                    }
                }
                OutputPart::SvelteBoundary { body, is_pending } => {
                    let wrapped_body = Self::apply_const_async_wrapping(body, &local_map);
                    result.push(OutputPart::SvelteBoundary {
                        body: wrapped_body,
                        is_pending: *is_pending,
                    });
                }
                OutputPart::SvelteBoundaryWithPending {
                    pending_expr,
                    pending_body,
                    main_body,
                } => {
                    let wrapped_pending =
                        Self::apply_const_async_wrapping(pending_body, &local_map);
                    let wrapped_main = Self::apply_const_async_wrapping(main_body, &local_map);
                    result.push(OutputPart::SvelteBoundaryWithPending {
                        pending_expr: pending_expr.clone(),
                        pending_body: wrapped_pending,
                        main_body: wrapped_main,
                    });
                }
                OutputPart::BlockScope { body } => {
                    // BlockScope creates a new scope - recurse with current map as parent
                    let wrapped_body = Self::apply_const_async_wrapping(body, &local_map);
                    result.push(OutputPart::BlockScope { body: wrapped_body });
                }
                OutputPart::SnippetFunction {
                    name,
                    params,
                    body,
                    dev,
                } => {
                    // SnippetFunction creates a new scope - recurse with current map as parent
                    let wrapped_body = Self::apply_const_async_wrapping(body, &local_map);
                    result.push(OutputPart::SnippetFunction {
                        name: name.clone(),
                        params: params.clone(),
                        body: wrapped_body,
                        dev: *dev,
                    });
                }
                OutputPart::EachBlock {
                    iterable,
                    context_name,
                    index_name,
                    index_alias,
                    body,
                    fallback,
                } => {
                    let iterable_blockers =
                        super::helpers::find_const_expression_blockers(iterable, &local_map);
                    if !iterable_blockers.is_empty() {
                        let wrapped_body = Self::apply_const_async_wrapping(body, &local_map);
                        let wrapped_fallback = fallback
                            .as_ref()
                            .map(|fb| Self::apply_const_async_wrapping(fb, &local_map));
                        result.push(OutputPart::AsyncBlockCustom {
                            blockers: iterable_blockers,
                            inner: vec![OutputPart::EachBlock {
                                iterable: iterable.clone(),
                                context_name: context_name.clone(),
                                index_name: index_name.clone(),
                                index_alias: index_alias.clone(),
                                body: wrapped_body,
                                fallback: wrapped_fallback,
                            }],
                        });
                    } else {
                        let wrapped_body = Self::apply_const_async_wrapping(body, &local_map);
                        let wrapped_fallback = fallback
                            .as_ref()
                            .map(|fb| Self::apply_const_async_wrapping(fb, &local_map));
                        result.push(OutputPart::EachBlock {
                            iterable: iterable.clone(),
                            context_name: context_name.clone(),
                            index_name: index_name.clone(),
                            index_alias: index_alias.clone(),
                            body: wrapped_body,
                            fallback: wrapped_fallback,
                        });
                    }
                }
                _ => {
                    result.push(part.clone());
                }
            }
        }

        result
    }

    /// Pre-pass: merge Html parts that contain blocked expressions with their
    /// immediately following closing tag Html parts (e.g., `</div>`).
    /// This ensures elements like `<div${...}>` + `</div>` are treated as one unit `<div${...}></div>`.
    fn merge_html_with_closing_tags(
        parts: &[OutputPart],
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
    ) -> Vec<OutputPart> {
        let mut merged = Vec::with_capacity(parts.len());
        let mut i = 0;

        while i < parts.len() {
            let (html_ref, excluded_vars) = match &parts[i] {
                OutputPart::Html(html) => (Some(html.as_str()), Vec::new()),
                OutputPart::HtmlWithExclusions {
                    html,
                    excluded_blocker_vars,
                } => (Some(html.as_str()), excluded_blocker_vars.clone()),
                _ => (None, Vec::new()),
            };
            if let Some(html) = html_ref {
                let effective_map: rustc_hash::FxHashMap<String, usize> =
                    if excluded_vars.is_empty() {
                        blocker_map.clone()
                    } else {
                        blocker_map
                            .iter()
                            .filter(|(name, _)| !excluded_vars.contains(name))
                            .map(|(k, v)| (k.clone(), *v))
                            .collect()
                    };
                let has_blockers =
                    !Self::find_html_expression_blockers(html, &effective_map).is_empty();
                if has_blockers {
                    let mut full_html = html.to_string();
                    // Look ahead: consume following Html parts that are closing tags
                    while i + 1 < parts.len() {
                        let next_html_ref = match &parts[i + 1] {
                            OutputPart::Html(h) => Some(h.as_str()),
                            OutputPart::HtmlWithExclusions { html: h, .. } => Some(h.as_str()),
                            _ => None,
                        };
                        if let Some(next_html) = next_html_ref {
                            let trimmed = next_html.trim_start();
                            if trimmed.starts_with("</") {
                                full_html.push_str(next_html);
                                i += 1;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    merged.push(OutputPart::Html(full_html));
                } else {
                    merged.push(parts[i].clone());
                }
            } else {
                merged.push(parts[i].clone());
            }
            i += 1;
        }

        merged
    }

    /// Find blocker references in HTML, but ONLY within ${...} interpolations.
    /// Static text is NOT checked (to avoid false positives like "baz: " matching "baz").
    fn find_html_expression_blockers(
        html: &str,
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
    ) -> Vec<usize> {
        let bytes = html.as_bytes();
        let len = bytes.len();
        let mut all_blockers = std::collections::BTreeSet::new();
        let mut i = 0;

        while i < len {
            if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                let interp_start = i + 2;
                i += 2;
                let mut depth = 1;
                while i < len && depth > 0 {
                    match bytes[i] {
                        b'{' => depth += 1,
                        b'}' => depth -= 1,
                        b'\'' | b'"' | b'`' => {
                            i = super::helpers::skip_string_literal(bytes, i);
                            continue;
                        }
                        _ => {}
                    }
                    if depth > 0 {
                        i += 1;
                    }
                }
                let interp_end = if i > 0 { i - 1 } else { i };
                if interp_end > interp_start {
                    let expr = &html[interp_start..interp_end];
                    for b in super::helpers::find_expression_blockers(expr, blocker_map) {
                        all_blockers.insert(b);
                    }
                }
                if i < len {
                    i += 1;
                }
            } else {
                i += 1;
            }
        }

        all_blockers.into_iter().collect()
    }

    /// Split an HTML string into segments based on blocker references.
    /// Returns segments that are either static (no blockers) or blocked (contain blocker references).
    ///
    /// The strategy is to find element boundaries (/>  or > followed by space/< or end)
    /// and check each element-level segment for blockers. This keeps element tags intact.
    fn split_html_by_blockers(
        html: &str,
        blocker_map: &rustc_hash::FxHashMap<String, usize>,
    ) -> Vec<HtmlSegment> {
        // First, find all "element segments" - ranges that contain complete element tags.
        // Split points are after `/>` or `>` (at element boundaries), or before `<`.
        let bytes = html.as_bytes();
        let len = bytes.len();

        // Find natural split points: positions right after `/>` or `>` where the next
        // character is a space or another `<`.
        let mut split_points: Vec<usize> = Vec::new();
        let mut i = 0;
        while i < len {
            // Skip template interpolations
            if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                i += 2;
                let mut depth = 1;
                while i < len && depth > 0 {
                    match bytes[i] {
                        b'{' => depth += 1,
                        b'}' => depth -= 1,
                        b'\'' | b'"' | b'`' => {
                            i = super::helpers::skip_string_literal(bytes, i);
                            continue;
                        }
                        _ => {}
                    }
                    if depth > 0 {
                        i += 1;
                    }
                }
                if i < len {
                    i += 1;
                }
                // After closing }, check if this is at a tag boundary (/>)
                continue;
            }

            // Look for self-closing `/>` followed by separator
            if bytes[i] == b'/' && i + 1 < len && bytes[i + 1] == b'>' {
                let after = i + 2;
                if after < len
                    && (bytes[after] == b' ' || bytes[after] == b'<' || bytes[after] == b'\n')
                {
                    split_points.push(after);
                }
                i += 2;
                continue;
            }

            // Look for closing tag `</...>` followed by separator
            // But only split here if the closing tag's element is NOT part of the
            // same element that has a blocked expression (i.e., we only split between
            // separate elements, not within an opening-closing tag pair)
            if bytes[i] == b'<' && i + 1 < len && bytes[i + 1] == b'/' {
                // Find the closing >
                let mut j = i + 2;
                while j < len && bytes[j] != b'>' {
                    j += 1;
                }
                if j < len {
                    let after = j + 1;
                    // Check: does the content BEFORE this closing tag contain a blocked expression?
                    // If so, the closing tag belongs with the blocked segment, not as a split point.
                    let before_segment = &html[if split_points.is_empty() {
                        0
                    } else {
                        *split_points.last().unwrap()
                    }..i];
                    let before_blockers =
                        Self::find_html_expression_blockers(before_segment, blocker_map);
                    if before_blockers.is_empty()
                        && (after >= len
                            || bytes[after] == b' '
                            || bytes[after] == b'<'
                            || bytes[after] == b'\n')
                    {
                        split_points.push(after);
                    } else if after < len
                        && (bytes[after] == b' ' || bytes[after] == b'<' || bytes[after] == b'\n')
                    {
                        // The closing tag belongs with the blocked segment,
                        // so the split point is AFTER the closing tag
                        split_points.push(after);
                    }
                    i = after;
                    continue;
                }
            }

            i += 1;
        }

        if split_points.is_empty() {
            // No natural split points, return the whole thing as blocked
            let blockers = Self::find_html_expression_blockers(html, blocker_map);
            return vec![HtmlSegment::Blocked {
                html: html.to_string(),
                blockers,
            }];
        }

        // Build segments from split points
        let mut segments: Vec<HtmlSegment> = Vec::new();
        let mut pos = 0;

        for &split_at in &split_points {
            let segment = &html[pos..split_at];
            pos = split_at;

            if segment.is_empty() {
                continue;
            }

            let blockers = Self::find_html_expression_blockers(segment, blocker_map);
            if !blockers.is_empty() {
                segments.push(HtmlSegment::Blocked {
                    html: segment.to_string(),
                    blockers,
                });
            } else {
                segments.push(HtmlSegment::Static(segment.to_string()));
            }
        }

        // Remaining after last split point
        if pos < len {
            let remaining = &html[pos..];
            if !remaining.is_empty() {
                let blockers = Self::find_html_expression_blockers(remaining, blocker_map);
                if !blockers.is_empty() {
                    segments.push(HtmlSegment::Blocked {
                        html: remaining.to_string(),
                        blockers,
                    });
                } else {
                    segments.push(HtmlSegment::Static(remaining.to_string()));
                }
            }
        }

        segments
    }

    /// Hoist SnippetFunction declarations to the front of a parts vector.
    /// This mirrors the official Svelte compiler's behavior where snippet functions
    /// are placed in state.init (before template rendering) via the Fragment visitor.
    #[allow(dead_code)]
    fn hoist_snippet_functions(parts: Vec<OutputPart>) -> Vec<OutputPart> {
        let mut snippets: Vec<OutputPart> = Vec::new();
        let mut rest: Vec<OutputPart> = Vec::new();
        for part in parts {
            if matches!(part, OutputPart::SnippetFunction { .. }) {
                snippets.push(part);
            } else {
                rest.push(part);
            }
        }
        if snippets.is_empty() {
            return rest;
        }
        snippets.extend(rest);
        snippets
    }

    /// Hoist both ConstDeclaration and SnippetFunction parts to the front of a
    /// parts slice, preserving their relative order. Whitespace-only Html parts
    /// interspersed among hoisted declarations are stripped.
    ///
    /// This combines the logic of `hoist_const_declarations_and_strip_ws` and
    /// `hoist_snippet_functions` into a single pass so that both kinds of
    /// declarations end up before template-rendering code while keeping their
    /// original relative ordering (e.g., a const that appears before a snippet
    /// in source stays before it).
    pub(crate) fn hoist_const_and_snippet_declarations(parts: &[OutputPart]) -> Vec<OutputPart> {
        let mut hoisted: Vec<OutputPart> = Vec::new();
        let mut rest: Vec<OutputPart> = Vec::new();
        let mut in_hoisted_region = true;

        for part in parts {
            match part {
                OutputPart::ConstDeclaration(_)
                | OutputPart::VarDeclaration(_)
                | OutputPart::SnippetFunction { .. } => {
                    hoisted.push(part.clone());
                    in_hoisted_region = true;
                }
                OutputPart::RawStatement(s) if s.starts_with("let ") || s.starts_with("var ") => {
                    // Hoist `let` and `var` declarations (from async const tags) alongside
                    // ConstDeclaration and SnippetFunction to match the official
                    // compiler's state.init ordering.
                    hoisted.push(part.clone());
                    in_hoisted_region = true;
                }
                OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. }
                    if in_hoisted_region && html.trim().is_empty() =>
                {
                    // Skip whitespace-only Html between hoisted declarations
                }
                _ => {
                    in_hoisted_region = false;
                    rest.push(part.clone());
                }
            }
        }

        hoisted.extend(rest);
        hoisted
    }

    /// Check if a list of output parts contains any async expressions
    /// (either AsyncExpression variants or expressions with `await`).
    fn parts_contain_async(parts: &[OutputPart]) -> bool {
        for part in parts {
            match part {
                OutputPart::AsyncExpression { .. } => return true,
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                    ..
                } => {
                    if super::helpers::expr_contains_await(test_expr) {
                        return true;
                    }
                    if Self::parts_contain_async(consequent_body) {
                        return true;
                    }
                    if let Some(alt) = alternate_body
                        && Self::parts_contain_async(alt)
                    {
                        return true;
                    }
                }
                OutputPart::EachBlock { iterable, body, .. } => {
                    if super::helpers::expr_contains_await(iterable) {
                        return true;
                    }
                    if Self::parts_contain_async(body) {
                        return true;
                    }
                }
                _ => {}
            }
        }
        false
    }

    pub(crate) fn build_parts_with_store_subs(
        parts: &[OutputPart],
        indent_level: usize,
        each_counter: &mut usize,
        store_subs: &[(&str, &str)],
    ) -> String {
        // Hoist @const declarations and SnippetFunction declarations to the front,
        // preserving their relative source order among each other. This mirrors the
        // official Svelte compiler's behavior where ConstTag nodes and snippet functions
        // are placed in state.init (before template rendering). Whitespace-only Html
        // parts that appear in the "hoisted region" (between const/snippet declarations)
        // are stripped so they don't emit spurious $$renderer.push(` `) calls.
        let hoisted_parts = Self::hoist_const_and_snippet_declarations(parts);
        let parts = &hoisted_parts;

        let mut body_code = String::new();
        let mut current_html = String::new();
        let indent = "\t".repeat(indent_level);
        let mut textarea_body_count: usize = 0;

        let mut i = 0;
        while i < parts.len() {
            let part = &parts[i];
            match part {
                OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
                    // Check if this Html part contains await in a ${...} expression
                    // (e.g., from class={await 'awesome'} generating ${$.attr_class($.clsx(await 'awesome'))})
                    if super::helpers::html_template_contains_await(html)
                        && html.starts_with('<')
                        && !html.starts_with("</")
                        && !html.starts_with("<!")
                    {
                        // Element opening tag with await - need $$renderer.child() wrapping
                        // First flush any accumulated HTML before this element
                        if !current_html.is_empty() {
                            Self::flush_html_with_await_detection(
                                &mut body_code,
                                &mut current_html,
                                &indent,
                            );
                        }

                        // Collect the complete element: opening tag + children + closing tag
                        let mut element_html = html.to_string();
                        let mut j = i + 1;
                        while j < parts.len() {
                            match &parts[j] {
                                OutputPart::Html(h)
                                | OutputPart::HtmlWithExclusions { html: h, .. } => {
                                    element_html.push_str(h);
                                    if memchr::memmem::find(h.as_bytes(), b"</").is_some()
                                        || h.ends_with("/>")
                                    {
                                        j += 1;
                                        break;
                                    }
                                }
                                OutputPart::Expression(e) => {
                                    element_html.push_str(&format!("${{$.escape({})}}", e));
                                }
                                OutputPart::RawExpression(e) => {
                                    element_html.push_str(&format!("${{{}}}", e));
                                }
                                _ => break,
                            }
                            j += 1;
                        }

                        // Extract await expressions and wrap in $$renderer.child()
                        let (transformed_html, declarations) =
                            super::helpers::extract_await_from_html_template(&element_html);

                        if declarations.is_empty() {
                            current_html.push_str(&element_html);
                        } else {
                            body_code.push_str(&format!(
                                "\n{}$$renderer.child(async ($$renderer) => {{\n",
                                indent
                            ));
                            for (var_name, decl_value) in &declarations {
                                body_code.push_str(&format!(
                                    "{}\tconst {} = {};\n",
                                    indent, var_name, decl_value
                                ));
                            }
                            body_code.push('\n');
                            body_code.push_str(&format!(
                                "{}\t$$renderer.push(`{}`);\n",
                                indent, transformed_html
                            ));
                            body_code.push_str(&format!("{}}});\n", indent));
                        }

                        i = j;
                        continue;
                    }

                    // Guard against accidental `${` sequences formed by concatenation
                    // of separate Html parts (e.g., text "$" + expression-folded "{").
                    // This would create a template literal expression in the output.
                    // Insert `\` before the `$` to produce `\${` which is the standard
                    // template literal escape for a literal `${`.
                    if current_html.ends_with('$') && html.starts_with('{') {
                        let len = current_html.len();
                        current_html.insert(len - 1, '\\');
                    }
                    current_html.push_str(html);
                }
                OutputPart::Expression(expr) => {
                    current_html.push_str(&format!("${{$.escape({})}}", expr));
                }
                OutputPart::AsyncExpression { expr, has_save } => {
                    // Async expression: flush current HTML, then emit as separate push
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }
                    // Transform await to use $.save() if needed
                    let transformed_expr = if *has_save {
                        super::helpers::transform_await_to_save(expr)
                    } else {
                        expr.clone()
                    };
                    let async_kw = if super::helpers::expr_contains_await(&transformed_expr) {
                        "async "
                    } else {
                        ""
                    };
                    body_code.push_str(&format!(
                        "{}$$renderer.push({}() => $.escape({}));\n",
                        indent, async_kw, transformed_expr
                    ));
                }
                OutputPart::AsyncBlock {
                    blocker_indices,
                    inner,
                } => {
                    // Async-wrapped block: flush current HTML, then emit
                    // $$renderer.async_block([$$promises[N], ...], ($$renderer) => { ... })
                    //
                    // For IfBlock/AwaitBlock/EachBlock: <!--]--> marker is emitted OUTSIDE the callback.
                    // For Component/ComponentWithBindings: NO <!--]--> marker at all.
                    //
                    // Determine if the inner content needs an `async` callback (when it contains await)
                    let needs_async_callback = Self::parts_contain_async(inner);
                    let async_keyword = if needs_async_callback { "async " } else { "" };

                    // Determine inner type to decide marker behavior
                    let inner_is_block = matches!(
                        inner.first(),
                        Some(
                            OutputPart::IfBlock { .. }
                                | OutputPart::AwaitBlock { .. }
                                | OutputPart::EachBlock { .. }
                        )
                    );
                    let inner_is_each = matches!(inner.first(), Some(OutputPart::EachBlock { .. }));

                    // For EachBlock inside AsyncBlock, the <!--[--> marker goes BEFORE the async_block
                    if inner_is_each {
                        current_html.push_str("<!--[-->");
                    }

                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    let blockers_str = blocker_indices
                        .iter()
                        .map(|idx| format!("$$promises[{}]", idx))
                        .collect::<Vec<_>>()
                        .join(", ");

                    body_code.push_str(&format!(
                        "{}$$renderer.async_block([{}], {}($$renderer) => {{\n",
                        indent, blockers_str, async_keyword
                    ));

                    // Render inner content based on type.
                    // Each type is rendered directly to avoid inner <!--]--> markers
                    // being placed inside the callback.
                    if let Some(OutputPart::IfBlock {
                        test_expr,
                        consequent_body,
                        alternate_body,
                        ..
                    }) = inner.first()
                    {
                        // Apply $.save() to test expression if it contains await
                        let effective_test = if super::helpers::expr_contains_await(test_expr) {
                            super::helpers::transform_await_to_save(test_expr)
                        } else {
                            test_expr.clone()
                        };
                        let if_code = Self::build_if_statement(
                            &effective_test,
                            consequent_body,
                            alternate_body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&if_code);
                    } else if let Some(OutputPart::AwaitBlock {
                        promise,
                        then_param,
                        pending_body,
                        then_body,
                        ..
                    }) = inner.first()
                    {
                        let await_code = Self::build_await_block_inner(
                            promise,
                            then_param,
                            pending_body,
                            then_body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&await_code);
                    } else if let Some(OutputPart::EachBlock {
                        iterable,
                        context_name,
                        index_name,
                        index_alias,
                        body,
                        fallback,
                    }) = inner.first()
                    {
                        let each_code = Self::build_each_block_inner(
                            iterable,
                            context_name,
                            index_name,
                            index_alias,
                            body,
                            fallback,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&each_code);
                    } else {
                        // Component or other types: render inner parts normally
                        let inner_code = Self::build_parts_with_store_subs(
                            inner,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&inner_code);
                    }

                    body_code.push('\n');
                    body_code.push_str(&format!("{}}});\n\n", indent));

                    // Only add <!--]--> outside the callback for block types (IfBlock, AwaitBlock, EachBlock)
                    // Component types do NOT get a <!--]--> marker
                    if inner_is_block {
                        current_html.push_str("<!--]-->");
                    }
                }
                OutputPart::AsyncBlockCustom { blockers, inner } => {
                    // Async-wrapped block with custom blocker expressions (const-tag-level).
                    // Similar to AsyncBlock but uses string blockers instead of $$promises indices.
                    let needs_async_callback = Self::parts_contain_async(inner);
                    let async_keyword = if needs_async_callback { "async " } else { "" };

                    let inner_is_block = matches!(
                        inner.first(),
                        Some(
                            OutputPart::IfBlock { .. }
                                | OutputPart::AwaitBlock { .. }
                                | OutputPart::EachBlock { .. }
                        )
                    );
                    let inner_is_each = matches!(inner.first(), Some(OutputPart::EachBlock { .. }));

                    // For EachBlock inside AsyncBlockCustom, the <!--[--> marker goes BEFORE
                    if inner_is_each {
                        current_html.push_str("<!--[-->");
                    }

                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    let blockers_str = blockers.join(", ");

                    body_code.push_str(&format!(
                        "{}$$renderer.async_block([{}], {}($$renderer) => {{\n",
                        indent, blockers_str, async_keyword
                    ));

                    // Render inner content
                    if let Some(OutputPart::IfBlock {
                        test_expr,
                        consequent_body,
                        alternate_body,
                        ..
                    }) = inner.first()
                    {
                        let effective_test = if super::helpers::expr_contains_await(test_expr) {
                            super::helpers::transform_await_to_save(test_expr)
                        } else {
                            test_expr.clone()
                        };
                        let if_code = Self::build_if_statement(
                            &effective_test,
                            consequent_body,
                            alternate_body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&if_code);
                    } else if let Some(OutputPart::EachBlock {
                        iterable,
                        context_name,
                        index_name,
                        index_alias,
                        body,
                        fallback,
                    }) = inner.first()
                    {
                        let each_code = Self::build_each_block_inner(
                            iterable,
                            context_name,
                            index_name,
                            index_alias,
                            body,
                            fallback,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&each_code);
                    } else {
                        let inner_code = Self::build_parts_with_store_subs(
                            inner,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&inner_code);
                    }

                    body_code.push('\n');
                    body_code.push_str(&format!("{}}});\n\n", indent));

                    if inner_is_block {
                        current_html.push_str("<!--]-->");
                    }
                }
                OutputPart::AsyncWrappedExpression {
                    blocker_indices,
                    expr,
                } => {
                    // Async-wrapped expression: flush current HTML, then emit
                    // $$renderer.async([$$promises[N], ...], ($$renderer) => $$renderer.push(async () => $.escape(expr)))
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    let blockers_str = blocker_indices
                        .iter()
                        .map(|idx| format!("$$promises[{}]", idx))
                        .collect::<Vec<_>>()
                        .join(", ");

                    // Transform the expression with $.save() if it contains await
                    let transformed_expr = if super::helpers::expr_contains_await(expr) {
                        super::helpers::transform_await_to_save(expr)
                    } else {
                        expr.clone()
                    };

                    // Use concise arrow body: ($$renderer) => $$renderer.push([async] () => $.escape(...))
                    let async_kw = if super::helpers::expr_contains_await(&transformed_expr) {
                        "async "
                    } else {
                        ""
                    };
                    body_code.push_str(&format!(
                        "{}$$renderer.async([{}], ($$renderer) => $$renderer.push({}() => $.escape({})));\n",
                        indent, blockers_str, async_kw, transformed_expr
                    ));
                }
                OutputPart::AsyncWrappedExpressionCustom { blockers, expr } => {
                    // Async-wrapped expression with custom blocker expressions
                    // (not $$promises indices but const-tag-level like promises_N[M])
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    let blockers_str = blockers.join(", ");
                    body_code.push_str(&format!(
                        "{}$$renderer.async([{}], ($$renderer) => $$renderer.push(() => $.escape({})));\n",
                        indent, blockers_str, expr
                    ));
                }
                OutputPart::AsyncWrappedHtml {
                    blocker_indices,
                    html,
                } => {
                    // Async-wrapped HTML: flush current HTML, then emit
                    // $$renderer.async([$$promises[N], ...], ($$renderer) => $$renderer.push(`html`))
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    let blockers_str = blocker_indices
                        .iter()
                        .map(|idx| format!("$$promises[{}]", idx))
                        .collect::<Vec<_>>()
                        .join(", ");

                    // Use block arrow body: ($$renderer) => { $$renderer.push(...); }
                    body_code.push_str(&format!(
                        "{}$$renderer.async([{}], ($$renderer) => {{\n",
                        indent, blockers_str
                    ));
                    body_code.push_str(&format!("{}\t$$renderer.push(`{}`);\n", indent, html));
                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::RawExpression(expr) => {
                    if super::helpers::expr_contains_await(expr) {
                        // Element attribute with await - needs $$renderer.child() wrapping.
                        // current_html should end with the opening tag prefix (e.g., "<p").
                        // We need to:
                        // 1. Split current_html to extract the element tag start
                        // 2. Collect remaining element parts (close tag, children, etc.)
                        // 3. Wrap in $$renderer.child() with $.save() for await expressions

                        // Find the element opening tag in current_html
                        let tag_start_pos = current_html.rfind('<').unwrap_or(0);
                        let prefix = current_html[..tag_start_pos].to_string();
                        let tag_start = current_html[tag_start_pos..].to_string();
                        current_html.clear();

                        // Flush prefix (content before this element)
                        if !prefix.is_empty() {
                            body_code
                                .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, prefix));
                        }

                        // Collect the full element HTML
                        let mut element_html = tag_start;
                        element_html.push_str(&format!("${{{}}}", expr));

                        // Look ahead and consume parts until we find the closing tag
                        // for this element or a self-closing tag
                        let mut j = i + 1;
                        let mut found_close = false;
                        while j < parts.len() {
                            match &parts[j] {
                                OutputPart::Html(h)
                                | OutputPart::HtmlWithExclusions { html: h, .. } => {
                                    element_html.push_str(h);
                                    // Check if this html part contains the closing tag
                                    if memchr::memmem::find(h.as_bytes(), b"</").is_some()
                                        || memchr::memmem::find(h.as_bytes(), b"/>").is_some()
                                    {
                                        found_close = true;
                                        j += 1;
                                        break;
                                    }
                                }
                                OutputPart::Expression(e) => {
                                    element_html.push_str(&format!("${{$.escape({})}}", e));
                                }
                                OutputPart::RawExpression(e) => {
                                    element_html.push_str(&format!("${{{}}}", e));
                                }
                                _ => break,
                            }
                            j += 1;
                        }

                        if !found_close {
                            // Self-closing or no closing tag found, just add what we have
                        }

                        // Extract await expressions and wrap in $$renderer.child()
                        let (transformed_html, declarations) =
                            super::helpers::extract_await_from_html_template(&element_html);

                        if declarations.is_empty() {
                            // No await found (shouldn't happen, but fallback)
                            current_html.push_str(&element_html);
                        } else {
                            body_code.push_str(&format!(
                                "{}$$renderer.child(async ($$renderer) => {{\n",
                                indent
                            ));
                            for (var_name, decl_value) in &declarations {
                                body_code.push_str(&format!(
                                    "{}\tconst {} = {};\n",
                                    indent, var_name, decl_value
                                ));
                            }
                            body_code.push('\n');
                            body_code.push_str(&format!(
                                "{}\t$$renderer.push(`{}`);\n",
                                indent, transformed_html
                            ));
                            body_code.push_str(&format!("{}}});\n", indent));
                        }

                        // Skip consumed parts
                        i = j;
                        continue;
                    } else {
                        // Raw expressions don't need escaping (e.g., $.attributes())
                        current_html.push_str(&format!("${{{}}}", expr));
                    }
                }
                OutputPart::HtmlExpression(expr) => {
                    if super::helpers::expr_contains_await(expr) {
                        // Async @html: flush current HTML, then emit child_block
                        if !current_html.is_empty() {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                            current_html.clear();
                        }
                        let transformed = super::helpers::transform_await_to_save(expr);
                        body_code.push_str(&format!(
                            "{}$$renderer.child_block(async ($$renderer) => {{\n",
                            indent
                        ));
                        body_code.push_str(&format!(
                            "{}\t$$renderer.push($.html({}));\n",
                            indent, transformed
                        ));
                        body_code.push_str(&format!("{}}});\n", indent));
                    } else {
                        current_html.push_str(&format!("${{$.html({})}}", expr));
                    }
                }
                OutputPart::Flush => {
                    // Flush the current accumulated HTML buffer as a separate push call.
                    // Used before/after elements like <style> and <script> that need their
                    // own $$renderer.push() call (matching official Svelte compiler behavior).
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }
                }
                OutputPart::ComponentWithBindings {
                    name,
                    props_and_spreads,
                    bindings,
                    has_prior_content,
                    children,
                    snippets,
                    slot_names,
                    dynamic,
                    css_custom_props: _, // TODO: Handle CSS custom props for components with bindings
                    css_props_is_html: _,
                    seq_bindings_hoisted: _,
                    dev: component_dev,
                } => {
                    // Component with bindings - just generate the component call with getter/setters.
                    // The $$settled/$$render_inner loop is handled at the component level in build().

                    // bind_get/bind_set declarations are emitted as VarDeclaration parts
                    // in the component visitor and hoisted by hoist_const_and_snippet_declarations.

                    // Flush any prior HTML content (with dynamic marker if needed, pushed separately)
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                        if *dynamic {
                            body_code.push_str(&format!("{}$$renderer.push('<!---->');\n", indent));
                        }
                    } else if *dynamic {
                        // Even if no prior HTML, dynamic components need a marker
                        body_code.push_str(&format!("{}$$renderer.push('<!---->');\n", indent));
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
                        for (idx, binding) in bindings.iter().enumerate() {
                            let (prop_name, getter_expr, setter_expr) =
                                resolve_binding_exprs(binding, store_subs);
                            let is_seq =
                                matches!(binding, ComponentBinding::SequenceExpression { .. });
                            body_code.push_str(&format!("{}\t\tget {}() {{\n", indent, prop_name));
                            body_code
                                .push_str(&format!("{}\t\t\treturn {};\n", indent, getter_expr));
                            body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                            body_code.push_str(&format!(
                                "{}\t\tset {}($$value) {{\n",
                                indent, prop_name
                            ));
                            body_code.push_str(&format!("{}\t\t\t{};\n", indent, setter_expr));
                            if !is_seq {
                                body_code
                                    .push_str(&format!("{}\t\t\t$$settled = false;\n", indent));
                            }
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

                        // Separate snippets into true snippets (hoisted functions) and slot children
                        #[allow(clippy::type_complexity)]
                        let (true_snippets, slot_children_binding): (
                            Vec<&(String, Vec<String>, Vec<OutputPart>, bool)>,
                            Vec<&(String, Vec<String>, Vec<OutputPart>, bool)>,
                        ) = snippets
                            .iter()
                            .partition(|(_, _, _, is_true_snippet)| *is_true_snippet);

                        let has_true_snippets = !true_snippets.is_empty();
                        let has_children = children.is_some();
                        let has_any_slots = !slot_names.is_empty() || has_children;

                        // Extra indent for true snippets (wrapped in block)
                        let inner_indent = if has_true_snippets {
                            format!("{}\t", indent)
                        } else {
                            indent.to_string()
                        };

                        // Open block if we have true snippets
                        if has_true_snippets {
                            body_code.push_str(&format!("{}{{\n", indent));

                            // Generate snippet function declarations inside the block
                            for (snippet_name, params, body_parts, _) in &true_snippets {
                                let params_str = if params.is_empty() {
                                    "$$renderer".to_string()
                                } else {
                                    format!("$$renderer, {}", params.join(", "))
                                };
                                body_code.push_str(&format!(
                                    "{}\tfunction {}({}) {{\n",
                                    indent, snippet_name, params_str
                                ));
                                let snippet_body = Self::build_parts_with_store_subs(
                                    body_parts,
                                    indent_level + 2,
                                    each_counter,
                                    store_subs,
                                );
                                body_code.push_str(&snippet_body);
                                body_code.push_str(&format!("{}\t}}\n\n", indent));
                            }
                        }

                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, {{\n",
                            inner_indent, name, call_syntax
                        ));

                        // Regular props first
                        for prop in &all_props {
                            body_code.push_str(&format!("{}\t{},\n", inner_indent, prop));
                        }

                        // Generate getter/setter for each binding
                        let binding_count = bindings.len();
                        for (idx, binding) in bindings.iter().enumerate() {
                            let (prop_name, getter_expr, setter_expr) =
                                resolve_binding_exprs(binding, store_subs);
                            let is_seq =
                                matches!(binding, ComponentBinding::SequenceExpression { .. });
                            body_code
                                .push_str(&format!("{}\tget {}() {{\n", inner_indent, prop_name));
                            body_code.push_str(&format!(
                                "{}\t\treturn {};\n",
                                inner_indent, getter_expr
                            ));
                            body_code.push_str(&format!("{}\t}},\n\n", inner_indent));
                            body_code.push_str(&format!(
                                "{}\tset {}($$value) {{\n",
                                inner_indent, prop_name
                            ));
                            body_code.push_str(&format!("{}\t\t{};\n", inner_indent, setter_expr));
                            if !is_seq {
                                body_code
                                    .push_str(&format!("{}\t\t$$settled = false;\n", inner_indent));
                            }
                            if idx < binding_count - 1
                                || has_children
                                || has_true_snippets
                                || has_any_slots
                            {
                                body_code.push_str(&format!("{}\t}},\n\n", inner_indent));
                            } else {
                                body_code.push_str(&format!("{}\t}}\n", inner_indent));
                            }
                        }

                        // Add true snippet names as shorthand props
                        for (snippet_name, _, _, _) in &true_snippets {
                            body_code.push_str(&format!("{}\t{},\n", inner_indent, snippet_name));
                        }

                        // Add children callback if there are children
                        if let Some(children_parts) = children {
                            let children_code = Self::build_parts_with_store_subs(
                                children_parts,
                                indent_level + 2,
                                each_counter,
                                store_subs,
                            );
                            if *component_dev {
                                body_code.push_str(&format!(
                                    "{}\tchildren: $.prevent_snippet_stringification(($$renderer) => {{\n",
                                    inner_indent
                                ));
                            } else {
                                body_code.push_str(&format!(
                                    "{}\tchildren: ($$renderer) => {{\n",
                                    inner_indent
                                ));
                            }
                            body_code.push_str(&children_code);
                            if *component_dev {
                                body_code.push_str(&format!("{}\t}}),\n", inner_indent));
                            } else {
                                body_code.push_str(&format!("{}\t}},\n", inner_indent));
                            }
                        }

                        // Build $$slots object
                        if has_any_slots {
                            let mut slots_entries: Vec<String> = Vec::new();
                            for slot_name in slot_names {
                                let quoted_name = quote_prop_name(slot_name);
                                if let Some((_, params, body_parts, _)) = slot_children_binding
                                    .iter()
                                    .find(|(n, _, _, _)| n == slot_name)
                                {
                                    let fn_body = Self::build_parts_with_store_subs(
                                        body_parts,
                                        0,
                                        each_counter,
                                        store_subs,
                                    );
                                    let fn_body_trimmed = fn_body.trim();
                                    if params.is_empty() {
                                        slots_entries.push(format!(
                                            "{}: ($$renderer) => {{\n{}\t\t\t}}",
                                            quoted_name, fn_body_trimmed
                                        ));
                                    } else {
                                        let params_str = format!("{{ {} }}", params.join(", "));
                                        slots_entries.push(format!(
                                            "{}: ($$renderer, {}) => {{\n{}\t\t\t}}",
                                            quoted_name, params_str, fn_body_trimmed
                                        ));
                                    }
                                } else {
                                    slots_entries.push(format!("{}: true", quoted_name));
                                }
                            }
                            if has_children && !slot_names.contains(&"default".to_string()) {
                                slots_entries.push("default: true".to_string());
                            }
                            let slots_str = slots_entries.join(", ");
                            body_code.push_str(&format!(
                                "{}\t$$slots: {{ {} }}\n",
                                inner_indent, slots_str
                            ));
                        }

                        body_code.push_str(&format!("{}}});\n", inner_indent));

                        // Close block if we had true snippets
                        if has_true_snippets {
                            body_code.push_str(&format!("{}}}\n", indent));
                        }
                    }

                    // Add <!---->  marker for hydration boundary after binding component
                    // Add if there's content before OR content after this component
                    let has_more_content = parts[i + 1..]
                        .iter()
                        .any(|p| !matches!(p, OutputPart::Html(s) | OutputPart::HtmlWithExclusions { html: s, .. } if s.trim().is_empty()));
                    if *has_prior_content || has_more_content {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::Component {
                    name,
                    props_and_spreads,
                    has_prior_content,
                    children,
                    snippets,
                    slot_names,
                    dynamic,
                    let_directives,
                    css_custom_props,
                    css_props_is_html,
                    in_async_block,
                    attach_expressions: _,
                    dev: component_dev,
                } => {
                    // Flush current HTML before the component call
                    // For dynamic components, add <!---->  marker before the call (pushed separately)
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                        if *dynamic {
                            body_code.push_str(&format!("{}$$renderer.push('<!---->');\n", indent));
                        }
                    } else if *dynamic {
                        // Even if no prior HTML, dynamic components need a marker
                        body_code.push_str(&format!("{}$$renderer.push('<!---->');\n", indent));
                    }

                    // Check if we have snippets or children
                    let has_snippets = !snippets.is_empty();
                    let has_children = children.is_some();
                    let component_has_spreads = has_spreads(props_and_spreads);

                    // Use optional chaining for dynamic components
                    let call_syntax = if *dynamic { "?." } else { "" };
                    let has_css_props = !css_custom_props.is_empty();

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
                                // In dev mode, add prevent_snippet_stringification before function
                                if *component_dev {
                                    body_code.push_str(&format!(
                                        "{}\t$.prevent_snippet_stringification({});\n",
                                        indent, snippet_name
                                    ));
                                }

                                let params_str = if params.is_empty() {
                                    "$$renderer".to_string()
                                } else {
                                    format!("$$renderer, {}", params.join(", "))
                                };
                                body_code.push_str(&format!(
                                    "{}\tfunction {}({}) {{\n",
                                    indent, snippet_name, params_str
                                ));

                                // In dev mode, add validate_snippet_args
                                if *component_dev {
                                    body_code.push_str(&format!(
                                        "{}\t\t$.validate_snippet_args($$renderer);\n",
                                        indent
                                    ));
                                }

                                let snippet_body = Self::build_parts_with_store_subs(
                                    body_parts,
                                    indent_level + 2,
                                    each_counter,
                                    store_subs,
                                );
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
                                    let fn_body = Self::build_parts_with_store_subs(
                                        body_parts,
                                        0,
                                        each_counter,
                                        store_subs,
                                    );
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

                            // If we also have default children, add children callback and default: true to $$slots
                            if let Some(children_parts) = children {
                                slots_entries.push("default: true".to_string());
                                let children_body = Self::build_parts_with_store_subs(
                                    children_parts,
                                    indent_level + 2,
                                    each_counter,
                                    store_subs,
                                );
                                all_props.push(format!(
                                    "children: ($$renderer) => {{\n{}{}\t}}",
                                    children_body, indent
                                ));
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
                            // Note: the "default" slot may be among slot_children when it has
                            // fragment-level let directives (e.g., <svelte:fragment let:box>)
                            let all_props = collect_all_props(props_and_spreads);

                            // Check if default slot is among slot_children with let directives
                            let default_has_let_dirs = slot_children
                                .iter()
                                .any(|(n, params, _, _)| n == "default" && !params.is_empty());

                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{\n",
                                indent, name, call_syntax
                            ));

                            // Props
                            for prop in &all_props {
                                body_code.push_str(&format!("{}\t{},\n", indent, prop));
                            }

                            // When default slot has let directives, add children: $.invalid_default_snippet
                            if default_has_let_dirs {
                                body_code.push_str(&format!(
                                    "{}\tchildren: $.invalid_default_snippet,\n",
                                    indent
                                ));
                            }

                            // $$slots with inline functions (with params for let directives)
                            body_code.push_str(&format!("{}\t$$slots: {{\n", indent));
                            for (slot_name, params, body_parts, _) in &slot_children {
                                let quoted_name = quote_prop_name(slot_name);
                                let fn_body = Self::build_parts_with_store_subs(
                                    body_parts,
                                    indent_level + 3,
                                    each_counter,
                                    store_subs,
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
                            body_code.push_str(&format!("{}}});\n", indent));
                        } else if let Some(children_parts) = children {
                            // Component with children (default slot) and possibly named slots
                            let has_let_dirs = !let_directives.is_empty();

                            if component_has_spreads {
                                // Has spread attributes + children - use $.spread_props
                                // Format: Component($$renderer, $.spread_props([
                                //   { prop1: val1 },
                                //   spread_expr,
                                //   { trailing_props, children: ..., $$slots: ... }
                                // ]))
                                // The last Props group (if any) gets merged into the
                                // children/$$slots object instead of being a separate entry.
                                body_code.push_str(&format!(
                                    "{}{}{}($$renderer, $.spread_props([\n",
                                    indent, name, call_syntax
                                ));

                                // Separate trailing props from the rest
                                let trailing_props: Vec<String> =
                                    if let Some(ComponentPropItem::Props(props)) =
                                        props_and_spreads.last()
                                    {
                                        props.clone()
                                    } else {
                                        Vec::new()
                                    };

                                let items_to_emit = if trailing_props.is_empty() {
                                    props_and_spreads.as_slice()
                                } else {
                                    &props_and_spreads[..props_and_spreads.len() - 1]
                                };

                                // Add interleaved props and spreads in order (excluding trailing)
                                for item in items_to_emit.iter() {
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

                                // Add final object with trailing props + children and $$slots
                                body_code.push_str(&format!("{}\t{{\n", indent));

                                // Emit trailing props into this object
                                for prop in &trailing_props {
                                    body_code.push_str(&format!("{}\t\t{},\n", indent, prop));
                                }

                                if has_let_dirs {
                                    body_code.push_str(&format!(
                                        "{}\t\tchildren: $.invalid_default_snippet,\n",
                                        indent
                                    ));

                                    body_code.push_str(&format!("{}\t\t$$slots: {{\n", indent));

                                    let params_str = format!("{{ {} }}", let_directives.join(", "));
                                    body_code.push_str(&format!(
                                        "{}\t\t\tdefault: ($$renderer, {}) => {{\n",
                                        indent, params_str
                                    ));
                                    let children_code = Self::build_parts_with_store_subs(
                                        children_parts,
                                        indent_level + 4,
                                        each_counter,
                                        store_subs,
                                    );
                                    body_code.push_str(&children_code);
                                    body_code.push_str(&format!("{}\t\t\t}},\n", indent));

                                    for (slot_name, params, body_parts, _) in &slot_children {
                                        let quoted_name = quote_prop_name(slot_name);
                                        let fn_body = Self::build_parts_with_store_subs(
                                            body_parts,
                                            indent_level + 4,
                                            each_counter,
                                            store_subs,
                                        );
                                        if params.is_empty() {
                                            body_code.push_str(&format!(
                                                "{}\t\t\t{}: ($$renderer) => {{\n{}",
                                                indent, quoted_name, fn_body
                                            ));
                                        } else {
                                            let params_str = format!("{{ {} }}", params.join(", "));
                                            body_code.push_str(&format!(
                                                "{}\t\t\t{}: ($$renderer, {}) => {{\n{}",
                                                indent, quoted_name, params_str, fn_body
                                            ));
                                        }
                                        body_code.push_str(&format!("{}\t\t\t}},\n", indent));
                                    }

                                    body_code.push_str(&format!("{}\t\t}}\n", indent));
                                } else {
                                    // No let directives - standard children callback
                                    if *component_dev {
                                        body_code.push_str(&format!(
                                            "{}\t\tchildren: $.prevent_snippet_stringification(($$renderer) => {{\n",
                                            indent
                                        ));
                                    } else {
                                        body_code.push_str(&format!(
                                            "{}\t\tchildren: ($$renderer) => {{\n",
                                            indent
                                        ));
                                    }
                                    let children_code = Self::build_parts_with_store_subs(
                                        children_parts,
                                        indent_level + 3,
                                        each_counter,
                                        store_subs,
                                    );
                                    body_code.push_str(&children_code);
                                    if *component_dev {
                                        body_code.push_str(&format!("{}\t\t}}),\n", indent));
                                    } else {
                                        body_code.push_str(&format!("{}\t\t}},\n", indent));
                                    }

                                    if has_slot_children {
                                        body_code.push_str(&format!("{}\t\t$$slots: {{\n", indent));
                                        body_code
                                            .push_str(&format!("{}\t\t\tdefault: true,\n", indent));
                                        for (slot_name, params, body_parts, _) in &slot_children {
                                            let quoted_name = quote_prop_name(slot_name);
                                            let fn_body = Self::build_parts_with_store_subs(
                                                body_parts,
                                                indent_level + 4,
                                                each_counter,
                                                store_subs,
                                            );
                                            if params.is_empty() {
                                                body_code.push_str(&format!(
                                                    "{}\t\t\t{}: ($$renderer) => {{\n{}",
                                                    indent, quoted_name, fn_body
                                                ));
                                            } else {
                                                let params_str =
                                                    format!("{{ {} }}", params.join(", "));
                                                body_code.push_str(&format!(
                                                    "{}\t\t\t{}: ($$renderer, {}) => {{\n{}",
                                                    indent, quoted_name, params_str, fn_body
                                                ));
                                            }
                                            body_code.push_str(&format!("{}\t\t\t}},\n", indent));
                                        }
                                        body_code.push_str(&format!("{}\t\t}}\n", indent));
                                    } else {
                                        body_code.push_str(&format!(
                                            "{}\t\t$$slots: {{ default: true }}\n",
                                            indent
                                        ));
                                    }
                                }

                                body_code.push_str(&format!("{}\t}}\n", indent));
                                body_code.push_str(&format!("{}]));\n", indent));
                            } else {
                                // No spreads - use simple object literal
                                let all_props = collect_all_props(props_and_spreads);

                                body_code.push_str(&format!(
                                    "{}{}{}($$renderer, {{\n",
                                    indent, name, call_syntax
                                ));

                                // Props
                                for prop in &all_props {
                                    body_code.push_str(&format!("{}\t{},\n", indent, prop));
                                }

                                // Check if 'children' is already in all_props (explicit attribute)
                                // If so, slot content should go in $$slots.default, not as children prop
                                let children_already_in_props = all_props.iter().any(|p| {
                                    p == "children"
                                        || p.starts_with("children:")
                                        || p.starts_with("children ")
                                });

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
                                    let children_code = Self::build_parts_with_store_subs(
                                        children_parts,
                                        indent_level + 3,
                                        each_counter,
                                        store_subs,
                                    );
                                    body_code.push_str(&children_code);
                                    body_code.push_str(&format!("{}\t\t}},\n", indent));

                                    // Named slot children
                                    for (slot_name, params, body_parts, _) in &slot_children {
                                        let quoted_name = quote_prop_name(slot_name);
                                        let fn_body = Self::build_parts_with_store_subs(
                                            body_parts,
                                            indent_level + 3,
                                            each_counter,
                                            store_subs,
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
                                } else if children_already_in_props {
                                    // 'children' is already an explicit prop (e.g., children="foo").
                                    // The slot content must go in $$slots.default (not as another 'children' prop).
                                    body_code.push_str(&format!("{}\t$$slots: {{\n", indent));

                                    let children_code = Self::build_parts_with_store_subs(
                                        children_parts,
                                        indent_level + 3,
                                        each_counter,
                                        store_subs,
                                    );
                                    body_code.push_str(&format!(
                                        "{}\t\tdefault: ($$renderer) => {{\n{}",
                                        indent, children_code
                                    ));
                                    body_code.push_str(&format!("{}\t\t}}", indent));

                                    // Named slot children
                                    for (slot_name, params, body_parts, _) in &slot_children {
                                        body_code.push_str(",\n");
                                        let quoted_name = quote_prop_name(slot_name);
                                        let fn_body = Self::build_parts_with_store_subs(
                                            body_parts,
                                            indent_level + 3,
                                            each_counter,
                                            store_subs,
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
                                        body_code.push_str(&format!("{}\t\t}}", indent));
                                    }
                                    body_code.push('\n');
                                    body_code.push_str(&format!("{}\t}}\n", indent));
                                } else {
                                    // No let directives - standard children callback (no-spreads path)
                                    if *component_dev {
                                        body_code.push_str(&format!(
                                            "{}\tchildren: $.prevent_snippet_stringification(($$renderer) => {{\n",
                                            indent
                                        ));
                                    } else {
                                        body_code.push_str(&format!(
                                            "{}\tchildren: ($$renderer) => {{\n",
                                            indent
                                        ));
                                    }
                                    let children_code = Self::build_parts_with_store_subs(
                                        children_parts,
                                        indent_level + 2,
                                        each_counter,
                                        store_subs,
                                    );
                                    body_code.push_str(&children_code);
                                    if *component_dev {
                                        body_code.push_str(&format!("{}\t}}),\n", indent));
                                    } else {
                                        body_code.push_str(&format!("{}\t}},\n", indent));
                                    }

                                    // $$slots with default: true and any named slot children
                                    if has_slot_children {
                                        body_code.push_str(&format!("{}\t$$slots: {{\n", indent));
                                        body_code
                                            .push_str(&format!("{}\t\tdefault: true,\n", indent));
                                        for (slot_name, params, body_parts, _) in &slot_children {
                                            let quoted_name = quote_prop_name(slot_name);
                                            let fn_body = Self::build_parts_with_store_subs(
                                                body_parts,
                                                indent_level + 3,
                                                each_counter,
                                                store_subs,
                                            );
                                            if params.is_empty() {
                                                body_code.push_str(&format!(
                                                    "{}\t\t{}: ($$renderer) => {{\n{}",
                                                    indent, quoted_name, fn_body
                                                ));
                                            } else {
                                                // Destructured params from let directives
                                                let params_str =
                                                    format!("{{ {} }}", params.join(", "));
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

                        // Check if any spread item contains await
                        let has_await_spread = spread_items
                            .iter()
                            .any(|s| super::helpers::expr_contains_await(s));

                        if has_await_spread && !*in_async_block {
                            // PromiseOptimiser pattern for spread props
                            let mut save_decls = Vec::new();
                            let mut transformed_items: Vec<String> = Vec::new();
                            let mut save_counter = 0;

                            for item in &spread_items {
                                if super::helpers::expr_contains_await(item) {
                                    // Check if this is a props object like `{ thing: await expr }`
                                    // In that case, extract just the await expression from each prop
                                    if item.starts_with('{') && item.ends_with('}') {
                                        let inner = item[1..item.len() - 1].trim();
                                        // Parse individual prop: value pairs
                                        let mut new_props = Vec::new();
                                        let mut all_extracted = true;
                                        for prop in Self::split_object_props(inner) {
                                            let prop = prop.trim();
                                            if super::helpers::expr_contains_await(prop) {
                                                if let Some(colon_pos) = prop.find(':') {
                                                    let key = prop[..colon_pos].trim();
                                                    let val = prop[colon_pos + 1..].trim();
                                                    if super::helpers::expr_contains_await(val) {
                                                        // Extract await from the value
                                                        let (transformed_val, decls) =
                                                            super::helpers::extract_await_from_html_template(
                                                                &format!("${{{}}}", val),
                                                            );
                                                        if !decls.is_empty() {
                                                            for (vn, dv) in &decls {
                                                                save_decls.push(format!(
                                                                    "{}\tconst {} = {};\n",
                                                                    indent, vn, dv
                                                                ));
                                                            }
                                                            // The transformed_val is "${$$0}" - extract the inner part
                                                            let inner_val = &transformed_val
                                                                [2..transformed_val.len() - 1];
                                                            new_props.push(format!(
                                                                "{}: {}",
                                                                key, inner_val
                                                            ));
                                                            save_counter = decls.len();
                                                        } else {
                                                            all_extracted = false;
                                                            new_props.push(prop.to_string());
                                                        }
                                                    } else {
                                                        new_props.push(prop.to_string());
                                                    }
                                                } else {
                                                    // Shorthand or no colon - fallback
                                                    all_extracted = false;
                                                    new_props.push(prop.to_string());
                                                }
                                            } else {
                                                new_props.push(prop.to_string());
                                            }
                                        }
                                        if all_extracted && !new_props.is_empty() {
                                            transformed_items
                                                .push(format!("{{ {} }}", new_props.join(", ")));
                                        } else {
                                            // Fallback: save entire object
                                            let var_name = format!("$${}", save_counter);
                                            let transformed =
                                                super::helpers::transform_await_to_save(item);
                                            save_decls.push(format!(
                                                "{}\tconst {} = {};\n",
                                                indent, var_name, transformed
                                            ));
                                            transformed_items.push(var_name);
                                            save_counter += 1;
                                        }
                                    } else {
                                        // Non-object spread item with await (e.g., `await { class: 'cool' }`)
                                        let var_name = format!("$${}", save_counter);
                                        let transformed =
                                            super::helpers::transform_await_to_save(item);
                                        save_decls.push(format!(
                                            "{}\tconst {} = {};\n",
                                            indent, var_name, transformed
                                        ));
                                        transformed_items.push(var_name);
                                        save_counter += 1;
                                    }
                                } else {
                                    transformed_items.push(item.clone());
                                }
                            }

                            body_code.push_str(&format!(
                                "{}$$renderer.child_block(async ($$renderer) => {{\n",
                                indent
                            ));
                            for decl in &save_decls {
                                body_code.push_str(decl);
                            }
                            if !save_decls.is_empty() {
                                body_code.push('\n');
                            }
                            body_code.push_str(&format!(
                                "{}\t{}{}($$renderer, $.spread_props([{}]));\n",
                                indent,
                                name,
                                call_syntax,
                                transformed_items.join(", ")
                            ));
                            body_code.push_str(&format!("{}}});\n", indent));
                        } else {
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, $.spread_props([{}]));\n",
                                indent,
                                name,
                                call_syntax,
                                spread_items.join(", ")
                            ));
                        }
                    } else {
                        // No children, no snippets, no spreads - simple call
                        let all_props = collect_all_props(props_and_spreads);

                        if has_css_props {
                            // Wrap component call in $.css_props()
                            let css_props_str = css_custom_props
                                .iter()
                                .map(|(name, value)| format!("{}: {}", name, value))
                                .collect::<Vec<_>>()
                                .join(", ");
                            let inner_indent = format!("{}\t", indent);
                            body_code.push_str(&format!(
                                "\n{}$.css_props($$renderer, {}, {{ {} }}, () => {{\n",
                                indent, css_props_is_html, css_props_str
                            ));
                            if all_props.is_empty() {
                                body_code.push_str(&format!(
                                    "{}{}{}($$renderer, {{}});\n",
                                    inner_indent, name, call_syntax
                                ));
                            } else {
                                body_code.push_str(&format!(
                                    "{}{}{}($$renderer, {{ {} }});\n",
                                    inner_indent,
                                    name,
                                    call_syntax,
                                    all_props.join(", ")
                                ));
                            }
                            // Dynamic components pass a 5th `true` argument to $.css_props()
                            if *dynamic {
                                body_code.push_str(&format!("{}}}, true);\n", indent));
                            } else {
                                body_code.push_str(&format!("{}}});\n", indent));
                            }
                        } else if all_props.is_empty() {
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{}});\n",
                                indent, name, call_syntax
                            ));
                        } else {
                            // Check if any prop value contains await - if so, use PromiseOptimiser pattern
                            let has_await_props = all_props
                                .iter()
                                .any(|p| super::helpers::expr_contains_await(p));

                            if has_await_props && !*in_async_block {
                                // Extract await expressions from props, wrap in child_block
                                let mut save_decls = Vec::new();
                                let mut transformed_props: Vec<String> = Vec::new();
                                let mut save_counter = 0;

                                for prop in &all_props {
                                    if super::helpers::expr_contains_await(prop) {
                                        // Extract: "key: await expr" -> save the expr, use $$N
                                        if let Some(colon_pos) = prop.find(':') {
                                            let key = prop[..colon_pos].trim();
                                            let value = prop[colon_pos + 1..].trim();
                                            // Strip "await " prefix
                                            let await_expr =
                                                value.strip_prefix("await ").unwrap_or(value);
                                            let var_name = format!("$${}", save_counter);
                                            save_decls.push(format!(
                                                "{}\tconst {} = (await $.save({}))();\n",
                                                indent, var_name, await_expr
                                            ));
                                            transformed_props
                                                .push(format!("{}: {}", key, var_name));
                                            save_counter += 1;
                                        } else {
                                            transformed_props.push(prop.clone());
                                        }
                                    } else {
                                        transformed_props.push(prop.clone());
                                    }
                                }

                                body_code.push_str(&format!(
                                    "{}$$renderer.child_block(async ($$renderer) => {{\n",
                                    indent
                                ));
                                for decl in &save_decls {
                                    body_code.push_str(decl);
                                }
                                if !save_decls.is_empty() {
                                    body_code.push('\n');
                                }
                                body_code.push_str(&format!(
                                    "{}\t{}{}($$renderer, {{ {} }});\n",
                                    indent,
                                    name,
                                    call_syntax,
                                    transformed_props.join(", ")
                                ));
                                body_code.push_str(&format!("{}}});\n", indent));
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
                    }

                    // Check if this component was wrapped in child_block (PromiseOptimiser)
                    // by checking if any props/spreads contain await (same condition we used above)
                    let used_child_block = {
                        let has_await_in_props = props_and_spreads.iter().any(|item| match item {
                            ComponentPropItem::Props(props) => {
                                props.iter().any(|p| super::helpers::expr_contains_await(p))
                            }
                            ComponentPropItem::Spread(expr) => {
                                super::helpers::expr_contains_await(expr)
                            }
                        });
                        has_await_in_props && !*in_async_block
                    };

                    // Add trailing <!----> marker after the component call.
                    // Per the official compiler's clean_nodes logic, dynamic components
                    // are never "standalone" and always get the closing marker, UNLESS
                    // the component is inside an async block (optimiser.is_async() in the
                    // official compiler suppresses the marker).
                    // For static components, add only if there's surrounding content.
                    // When CSS custom props are present, skip the marker
                    // ($.css_props handles its own boundaries).
                    // When child_block wrapping is used, skip the marker (child_block
                    // acts as its own boundary).
                    if !has_css_props && !used_child_block && !*in_async_block {
                        if *dynamic {
                            // Dynamic components always need the closing marker
                            // (they are never "standalone" per clean_nodes)
                            current_html.push_str("<!---->");
                        } else {
                            let has_content_after = parts[i + 1..].iter().any(|p| {
                                matches!(
                                    p,
                                    OutputPart::Html(h) | OutputPart::HtmlWithExclusions { html: h, .. } if !h.trim().is_empty()
                                ) || matches!(
                                    p,
                                    OutputPart::Expression(_)
                                        | OutputPart::AsyncExpression { .. }
                                        | OutputPart::RawExpression(_)
                                        | OutputPart::HtmlExpression(_)
                                        | OutputPart::Component { .. }
                                        | OutputPart::ComponentWithBindings { .. }
                                        | OutputPart::EachBlock { .. }
                                        | OutputPart::IfBlock { .. }
                                        | OutputPart::AwaitBlock { .. }
                                        | OutputPart::SvelteBoundary { .. }
                                        | OutputPart::SvelteBoundaryWithPending { .. }
                                        | OutputPart::SvelteHead { .. }
                                        | OutputPart::TitleElement { .. }
                                        | OutputPart::RenderCall { .. }
                                        | OutputPart::AsyncBlock { .. }
                                        | OutputPart::AsyncWrappedExpression { .. }
                                        | OutputPart::AsyncWrappedHtml { .. }
                                )
                            });

                            if *has_prior_content || has_content_after {
                                current_html.push_str("<!---->");
                            }
                        }
                    }
                }
                OutputPart::Comment => {
                    current_html.push_str("<!---->");
                }
                OutputPart::EachBlock {
                    iterable,
                    context_name,
                    index_name,
                    index_alias,
                    body,
                    fallback,
                } => {
                    // Only wrap in child_block when the iterable expression has await
                    // (matching the official compiler's EachBlock visitor which only checks
                    // node.metadata.expression.has_await, not the body's await status).
                    // Body-level await expressions are handled by AsyncExpression parts.
                    let iterable_has_await = super::helpers::expr_contains_await(iterable);
                    let needs_child_block = iterable_has_await;

                    // Determine indent level and iterable expression
                    let effective_indent_level = if needs_child_block {
                        indent_level + 1
                    } else {
                        indent_level
                    };
                    let effective_indent = "\t".repeat(effective_indent_level);
                    let transformed_iterable = if iterable_has_await {
                        super::helpers::transform_await_to_save(iterable)
                    } else {
                        iterable.clone()
                    };

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

                        if needs_child_block {
                            body_code.push_str(&format!(
                                "{}$$renderer.child_block(async ($$renderer) => {{\n",
                                indent
                            ));
                        }

                        body_code.push_str(&format!(
                            "{}const {} = $.ensure_array_like({});\n\n",
                            effective_indent, array_var, transformed_iterable
                        ));

                        // If there's a fallback, wrap in if-else
                        body_code.push_str(&format!(
                            "{}if ({}.length !== 0) {{\n",
                            effective_indent, array_var
                        ));
                        // Add block marker for non-empty case INSIDE the if
                        body_code.push_str(&format!(
                            "{}\t$$renderer.push('<!--[-->');\n\n",
                            effective_indent
                        ));

                        // For loop (indented)
                        body_code.push_str(&format!(
                            "{}\tfor (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                            effective_indent, index_var, array_var, index_var, index_var
                        ));

                        // Context variable (only if there's a context)
                        if let Some(ctx_name) = context_name {
                            body_code.push_str(&format!(
                                "{}\t\tlet {} = {}[{}];\n",
                                effective_indent, ctx_name, array_var, index_var
                            ));
                        }

                        // Index alias (when contains_group_binding: `let original_name = $$index_N`)
                        if let Some(alias) = index_alias {
                            body_code.push_str(&format!(
                                "{}\t\tlet {} = {};\n",
                                effective_indent, alias, index_var
                            ));
                        }

                        if context_name.is_some() || index_alias.is_some() {
                            body_code.push('\n');
                        }

                        // Body - hoist @const declarations to the top of the loop body
                        let hoisted_body = Self::hoist_const_declarations_and_strip_ws(body);
                        let body_code_inner = Self::build_parts_with_store_subs(
                            &hoisted_body,
                            effective_indent_level + 2,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);

                        // Close for loop
                        body_code.push_str(&format!("{}\t}}\n", effective_indent));

                        // Else branch with fallback
                        body_code.push_str(&format!("{}}} else {{\n", effective_indent));
                        // Add block marker for empty case (note the !)
                        body_code.push_str(&format!(
                            "{}\t$$renderer.push('<!--[!-->');\n",
                            effective_indent
                        ));

                        // Fallback body
                        if let Some(fb) = fallback {
                            let fallback_code = Self::build_parts_with_store_subs(
                                fb,
                                effective_indent_level + 1,
                                each_counter,
                                store_subs,
                            );
                            body_code.push_str(&fallback_code);
                        }

                        body_code.push_str(&format!("{}}}\n", effective_indent));

                        if needs_child_block {
                            body_code.push_str(&format!("{}}});\n\n", indent));
                        } else {
                            body_code.push('\n');
                        }
                    } else {
                        // No fallback - add opening marker to current_html before flushing
                        // This combines with any prior content like: `<ul><!--[-->`
                        current_html.push_str("<!--[-->");

                        // Flush current HTML (including the marker) before each block
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();

                        if needs_child_block {
                            body_code.push_str(&format!(
                                "{}$$renderer.child_block(async ($$renderer) => {{\n",
                                indent
                            ));
                        }

                        body_code.push_str(&format!(
                            "{}const {} = $.ensure_array_like({});\n\n",
                            effective_indent, array_var, transformed_iterable
                        ));

                        // For loop
                        body_code.push_str(&format!(
                            "{}for (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                            effective_indent, index_var, array_var, index_var, index_var
                        ));

                        // Context variable (only if there's a context)
                        if let Some(ctx_name) = context_name {
                            body_code.push_str(&format!(
                                "{}\tlet {} = {}[{}];\n",
                                effective_indent, ctx_name, array_var, index_var
                            ));
                        }

                        // Index alias (when contains_group_binding: `let original_name = $$index_N`)
                        if let Some(alias) = index_alias {
                            body_code.push_str(&format!(
                                "{}\tlet {} = {};\n",
                                effective_indent, alias, index_var
                            ));
                        }

                        if context_name.is_some() || index_alias.is_some() {
                            body_code.push('\n');
                        }

                        // Body - hoist @const declarations to the top of the loop body
                        let hoisted_body = Self::hoist_const_declarations_and_strip_ws(body);
                        let body_code_inner = Self::build_parts_with_store_subs(
                            &hoisted_body,
                            effective_indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);

                        // Close for loop
                        body_code.push_str(&format!("{}}}\n", effective_indent));

                        if needs_child_block {
                            body_code.push_str(&format!("{}}});\n\n", indent));
                        } else {
                            body_code.push('\n');
                        }
                    }

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                    is_elseif: _,
                } => {
                    // Flush current HTML before if block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Check if the test expression contains `await`
                    // If so, wrap the entire if-block in $$renderer.child_block()
                    // Note: async expressions in body are handled by AsyncExpression parts
                    // and don't need child_block wrapping.
                    let test_has_await = super::helpers::expr_contains_await(test_expr);

                    if test_has_await {
                        // Transform the test expression: await expr -> (await $.save(expr))()
                        let transformed_test = if test_has_await {
                            super::helpers::transform_await_to_save(test_expr)
                        } else {
                            test_expr.clone()
                        };

                        // Generate the if-block at one deeper indent level (inside child_block)
                        let if_code = Self::build_if_statement(
                            &transformed_test,
                            consequent_body,
                            alternate_body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );

                        // Wrap in $$renderer.child_block(async ($$renderer) => { ... })
                        body_code.push_str(&format!(
                            "{}$$renderer.child_block(async ($$renderer) => {{\n",
                            indent
                        ));
                        body_code.push_str(&if_code);
                        body_code.push('\n');
                        body_code.push_str(&format!("{}}});\n\n", indent));
                    } else {
                        // Generate the if block with proper markers (no async wrapping)
                        let if_code = Self::build_if_statement(
                            test_expr,
                            consequent_body,
                            alternate_body,
                            indent_level,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&if_code);
                    }

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteElement {
                    tag_expr,
                    attrs_expr,
                    body,
                    dev,
                } => {
                    // Flush current HTML before svelte:element
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // In dev mode, validate the dynamic element tag
                    if *dev {
                        body_code.push_str(&format!(
                            "{}$.validate_dynamic_element_tag(() => {});\n",
                            indent, tag_expr
                        ));
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
                            let body_code_inner = Self::build_parts_with_store_subs(
                                body,
                                indent_level + 1,
                                each_counter,
                                store_subs,
                            );
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
                    let body_code_inner = Self::build_parts_with_store_subs(
                        body,
                        indent_level + 2,
                        each_counter,
                        store_subs,
                    );
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
                    dev_location,
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

                    // Format the attributes object - use `{}` for empty, `{ ... }` for non-empty
                    let attrs_obj = if attrs_str.is_empty() {
                        "{}".to_string()
                    } else {
                        format!("{{ {} }}", attrs_str)
                    };

                    // Helper: emit push_element/pop_element in dev mode
                    let dev_push = if let Some((line, col)) = dev_location {
                        format!("$.push_element($$renderer, 'option', {}, {});\n", line, col)
                    } else {
                        String::new()
                    };

                    // If we have a direct value (from synthetic_value_node), pass it directly
                    if let Some(value_expr) = direct_value {
                        body_code.push_str(&format!(
                            "{}$$renderer.option({}, {});\n",
                            indent, attrs_obj, value_expr
                        ));
                    } else if *is_rich {
                        // Build the $$renderer.option() call
                        // If is_rich, we need to pass 7 arguments: attrs, body, void 0, void 0, void 0, void 0, true
                        body_code.push_str(&format!(
                            "{}$$renderer.option(\n{}\t{},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_obj, indent
                        ));

                        // Dev mode: push_element after callback opening
                        if !dev_push.is_empty() {
                            body_code.push_str(&format!("{}\t\t{}", indent, dev_push));
                        }

                        // Body
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 2,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);

                        // Dev mode: pop_element before callback closing
                        if !dev_push.is_empty() {
                            body_code.push_str(&format!("{}\t\t$.pop_element();\n", indent));
                        }

                        // Close callback with remaining args
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                            indent, indent, indent, indent, indent, indent, indent
                        ));
                    } else if let Some(hash) = css_hash {
                        // Has CSS hash - pass as 3rd argument
                        body_code.push_str(&format!(
                            "{}$$renderer.option(\n{}\t{},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_obj, indent
                        ));

                        // Dev mode: push_element
                        if !dev_push.is_empty() {
                            body_code.push_str(&format!("{}\t\t{}", indent, dev_push));
                        }

                        // Body
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 2,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);

                        // Dev mode: pop_element
                        if !dev_push.is_empty() {
                            body_code.push_str(&format!("{}\t\t$.pop_element();\n", indent));
                        }

                        // Close callback with CSS hash
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\t'{}'\n{});\n",
                            indent, indent, hash, indent
                        ));
                    } else {
                        body_code.push_str(&format!(
                            "{}$$renderer.option({}, ($$renderer) => {{\n",
                            indent, attrs_obj
                        ));

                        // Dev mode: push_element
                        if !dev_push.is_empty() {
                            body_code.push_str(&format!("{}\t{}", indent, dev_push));
                        }

                        // Body
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);

                        // Dev mode: pop_element
                        if !dev_push.is_empty() {
                            body_code.push_str(&format!("{}\t$.pop_element();\n", indent));
                        }

                        // Close callback
                        body_code.push_str(&format!("{}}});\n", indent));
                    }
                }
                OutputPart::AwaitBlock {
                    promise,
                    then_param,
                    pending_body,
                    then_body,
                    catch_param: _,
                    catch_body: _,
                } => {
                    // Flush current HTML before await block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.await call with proper callbacks
                    // The official Svelte compiler only passes 4 args: $$renderer, promise, pending, then
                    // The catch callback is NOT included in server-side output

                    // Check if both callbacks are empty - use single-line format
                    let pending_is_empty = pending_body.is_empty();
                    let then_is_empty = then_body.is_empty();

                    if pending_is_empty && then_is_empty {
                        // Single-line format: $.await($$renderer, promise, () => {}, (param) => {});
                        let then_fn = if then_param.is_empty() {
                            "() => {}".to_string()
                        } else {
                            format!("({}) => {{}}", then_param)
                        };
                        body_code.push_str(&format!(
                            "{}$.await($$renderer, {}, () => {{}}, {});\n",
                            indent, promise, then_fn
                        ));
                    } else {
                        // Multi-line format
                        body_code.push_str(&format!("{}$.await(\n", indent));
                        body_code.push_str(&format!("{}\t$$renderer,\n", indent));
                        body_code.push_str(&format!("{}\t{},\n", indent, promise));

                        // Pending callback
                        if pending_is_empty {
                            body_code.push_str(&format!("{}\t() => {{}},\n", indent));
                        } else {
                            body_code.push_str(&format!("{}\t() => {{\n", indent));
                            let pending_code = Self::build_parts_with_store_subs(
                                pending_body,
                                indent_level + 2,
                                each_counter,
                                store_subs,
                            );
                            body_code.push_str(&pending_code);
                            body_code.push_str(&format!("{}\t}},\n", indent));
                        }

                        // Then callback (last argument - no catch callback on server)
                        if then_is_empty {
                            if then_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{}}", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{}}", indent, then_param));
                            }
                        } else {
                            if then_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{\n", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{\n", indent, then_param));
                            }
                            let then_code = Self::build_parts_with_store_subs(
                                then_body,
                                indent_level + 2,
                                each_counter,
                                store_subs,
                            );
                            body_code.push_str(&then_code);
                            body_code.push_str(&format!("{}\t}}", indent));
                        }

                        body_code.push('\n');
                        body_code.push_str(&format!("{});\n", indent));
                    }

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
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);
                    }
                    body_code.push_str(&format!("{}}}\n\n", indent));

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteBoundaryWithPending {
                    pending_expr,
                    pending_body,
                    main_body,
                } => {
                    // Flush current HTML before conditional
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);\n\n",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // Generate: if (pending_expr) { <!--[!--> pending_body <!--]--> }
                    //           else { <!--[--> main_body <!--]--> }
                    body_code.push_str(&format!("{}if ({}) {{\n", indent, pending_expr));
                    let inner_indent = format!("{}\t", indent);
                    body_code.push_str(&format!("{}$$renderer.push(`<!--[!-->`);\n", inner_indent));
                    if !pending_body.is_empty() {
                        let pending_code = Self::build_parts_with_store_subs(
                            pending_body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&pending_code);
                    }
                    body_code.push_str(&format!("{}$$renderer.push(`<!--]-->`);\n", inner_indent));
                    body_code.push_str(&format!("{}}} else {{\n", indent));
                    body_code.push_str(&format!("{}$$renderer.push(`<!--[-->`);\n", inner_indent));
                    if !main_body.is_empty() {
                        let main_code = Self::build_parts_with_store_subs(
                            main_body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&main_code);
                    }
                    body_code.push_str(&format!("{}$$renderer.push(`<!--]-->`);\n", inner_indent));
                    body_code.push_str(&format!("{}}}\n", indent));
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
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
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
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
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
                OutputPart::ContentEditableBody {
                    value_expr,
                    children_body,
                } => {
                    // Flush current HTML before content-editable body
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);

",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // For complex expressions (e.g. store access), use a variable to avoid
                    // double evaluation. For simple identifiers, use the expression directly.
                    let is_simple_expr = value_expr
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.');
                    let (condition_expr, push_expr) = if is_simple_expr {
                        (value_expr.clone(), value_expr.clone())
                    } else {
                        // Use $$body_N variable
                        let var_name = if textarea_body_count == 0 {
                            "$$body".to_string()
                        } else {
                            format!("$$body_{}", textarea_body_count)
                        };
                        textarea_body_count += 1;
                        body_code.push_str(&format!(
                            "{}const {} = {};\n\n",
                            indent, var_name, value_expr
                        ));
                        (var_name.clone(), var_name)
                    };

                    // Generate:
                    // if (value_or_var) {
                    //     $$renderer.push(`${value_or_var}`);
                    // } else {
                    //     /* children */
                    // }
                    body_code.push_str(&format!(
                        "{}if ({}) {{
",
                        indent, condition_expr
                    ));
                    body_code.push_str(&format!(
                        "{}	$$renderer.push(`${{{}}}`);
",
                        indent, push_expr
                    ));
                    // Generate children in the else branch
                    let children_code = Self::build_parts_with_store_subs(
                        children_body,
                        indent_level + 1,
                        each_counter,
                        store_subs,
                    );
                    if children_code.trim().is_empty() {
                        body_code.push_str(&format!(
                            "{}}} else {{}}

",
                            indent
                        ));
                    } else {
                        body_code.push_str(&format!(
                            "{}}} else {{
",
                            indent
                        ));
                        body_code.push_str(&children_code);
                        body_code.push_str(&format!(
                            "{}}}

",
                            indent
                        ));
                    }
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
                OutputPart::VarDeclaration(declaration) => {
                    // Flush current HTML before var declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the var declaration
                    body_code.push_str(&format!("{}var {};\n", indent, declaration));
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
                        let body_code_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_code_inner);
                    }
                    body_code.push_str(&format!("{}}}\n", indent));
                }
                OutputPart::HydrationAnchor => {
                    // Add <!> marker to current HTML (hydration anchor for Components/RenderTags/HtmlTags in select/optgroup)
                    current_html.push_str("<!>");
                }
                OutputPart::Slot {
                    name,
                    props_expr,
                    fallback,
                } => {
                    // Flush current HTML before slot (+ add <!--[--> marker)
                    current_html.push_str("<!--[-->");
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.slot() call
                    let fallback_arg = if let Some(fallback_parts) = fallback {
                        if fallback_parts.is_empty() {
                            "null".to_string()
                        } else {
                            // Build fallback as a thunk: () => { ... }
                            let fallback_code = Self::build_parts_with_store_subs(
                                fallback_parts,
                                indent_level + 1,
                                each_counter,
                                store_subs,
                            );
                            format!("() => {{\n{}{indent}}}", fallback_code, indent = indent)
                        }
                    } else {
                        "null".to_string()
                    };

                    // Check if slot props contain await expressions.
                    // If so, wrap in $$renderer.child_block(async ...) and extract
                    // await expressions into const variables.
                    // This corresponds to the official compiler's PromiseOptimiser
                    // which wraps async slot props in child_block.
                    if memmem::find(props_expr.as_bytes(), b"await ").is_some() {
                        let inner_indent = format!("{}\t", indent);
                        body_code.push_str(&format!(
                            "{}$$renderer.child_block(async ($$renderer) => {{\n",
                            indent
                        ));

                        // Extract await expressions from props and replace with const vars.
                        // e.g., { message: await 'hello' } -> const $$0 = (await $.save("hello"))();
                        //        then replace with { message: $$0 }
                        let (extracted_consts, modified_props) =
                            extract_await_from_slot_props(props_expr);
                        for (i, await_expr) in extracted_consts.iter().enumerate() {
                            body_code.push_str(&format!(
                                "{}const $${} = (await $.save({}))();\n",
                                inner_indent, i, await_expr
                            ));
                        }

                        body_code.push_str(&format!(
                            "{}$.slot($$renderer, $$props, '{}', {}, {});\n",
                            inner_indent, name, modified_props, fallback_arg
                        ));
                        body_code.push_str(&format!("{}}});\n", indent));
                    } else {
                        body_code.push_str(&format!(
                            "{}$.slot($$renderer, $$props, '{}', {}, {});\n",
                            indent, name, props_expr, fallback_arg
                        ));
                    }

                    // Add closing marker
                    current_html.push_str("<!--]-->");
                }
                OutputPart::AsyncChild {
                    declarations,
                    inner,
                }
                | OutputPart::AsyncChildBlock {
                    declarations,
                    inner,
                } => {
                    let is_child_block = matches!(part, OutputPart::AsyncChildBlock { .. });

                    // Flush current HTML before async child
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    let method = if is_child_block {
                        "child_block"
                    } else {
                        "child"
                    };
                    body_code.push_str(&format!(
                        "{}$$renderer.{}(async ($$renderer) => {{\n",
                        indent, method
                    ));

                    let inner_indent = format!("{}\t", indent);

                    // Emit hoisted declarations
                    for decl in declarations {
                        body_code.push_str(&format!("{}{}\n", inner_indent, decl));
                    }

                    if !declarations.is_empty() {
                        body_code.push('\n');
                    }

                    // Render inner content
                    let inner_code = Self::build_parts_with_store_subs(
                        inner,
                        indent_level + 1,
                        each_counter,
                        store_subs,
                    );
                    body_code.push_str(&inner_code);

                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::RawStatement(stmt) => {
                    // Flush current HTML before raw statement
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Emit the raw statement(s)
                    // IMPORTANT: Don't add indentation inside template literals.
                    let mut in_tl = false;
                    for line in stmt.lines() {
                        if line.trim().is_empty() {
                            body_code.push('\n');
                        } else if in_tl {
                            in_tl = super::helpers::update_template_literal_state_for_indent(
                                line, in_tl,
                            );
                            body_code.push_str(line);
                            body_code.push('\n');
                        } else {
                            in_tl = super::helpers::update_template_literal_state_for_indent(
                                line, in_tl,
                            );
                            body_code.push_str(&format!("{}{}\n", indent, line));
                        }
                    }
                    // Only add a trailing blank line for multi-line statements.
                    // Single-line statements should not have trailing blank lines,
                    // matching the official compiler's output where esrap handles
                    // blank line insertion between different statement types.
                    if stmt.contains('\n') {
                        body_code.push('\n');
                    }
                }
                OutputPart::SnippetFunction {
                    name,
                    params,
                    body,
                    dev: snippet_dev,
                } => {
                    // Flush current HTML before function declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // In dev mode, add prevent_snippet_stringification before the function
                    if *snippet_dev {
                        body_code.push_str(&format!(
                            "{}$.prevent_snippet_stringification({});\n",
                            indent, name
                        ));
                    }

                    // Generate function declaration
                    let param_str = if params.is_empty() {
                        "$$renderer".to_string()
                    } else {
                        format!("$$renderer, {}", params.join(", "))
                    };

                    body_code.push_str(&format!("{}function {}({}) {{\n", indent, name, param_str));

                    // In dev mode, add validate_snippet_args
                    if *snippet_dev {
                        body_code.push_str(&format!(
                            "{}{}$.validate_snippet_args($$renderer);\n",
                            indent, "\t"
                        ));
                    }

                    // Generate body
                    if !body.is_empty() {
                        let body_inner = Self::build_parts_with_store_subs(
                            body,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        body_code.push_str(&body_inner);
                    }

                    body_code.push_str(&format!("{}}}\n\n", indent));
                }
                OutputPart::ConstBlockerMetadata { .. } => {
                    // Metadata-only part, consumed by apply_const_async_wrapping.
                    // Should not appear in output - skip it.
                }
            }
            i += 1;
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            Self::flush_html_with_await_detection(&mut body_code, &mut current_html, &indent);
        }

        body_code
    }

    /// Build an if statement with proper block markers.
    /// Following the official Svelte compiler, else-if chains are flattened into
    /// `else if (test) { <!--[N--> ... }` branches with incrementing indices.
    pub(crate) fn build_if_statement(
        test_expr: &str,
        consequent_body: &[OutputPart],
        alternate_body: &Option<Vec<OutputPart>>,
        indent_level: usize,
        each_counter: &mut usize,
        store_subs: &[(&str, &str)],
    ) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Start the if statement
        code.push_str(&format!("{}if ({}) {{\n", indent, test_expr));

        // Add opening marker for consequent (BLOCK_OPEN = <!--[-->)
        code.push_str(&format!("{}\t$$renderer.push('<!--[-->');\n", indent));

        // Generate consequent body - hoist @const declarations to the top
        let hoisted_consequent = Self::hoist_const_declarations_and_strip_ws(consequent_body);
        let consequent_code = Self::build_parts_with_store_subs(
            &hoisted_consequent,
            indent_level + 1,
            each_counter,
            store_subs,
        );
        code.push_str(&consequent_code);

        // Close consequent block
        code.push_str(&format!("{}}}", indent));

        // Flatten else-if chain: collect all branches
        let mut elseif_index: usize = 1; // next branch index (1, 2, ...)
        let mut current_alt = alternate_body.as_deref();

        loop {
            match current_alt {
                None => {
                    // No alternate at all - add empty else with BLOCK_OPEN_ELSE
                    code.push_str(" else {\n");
                    code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));
                    code.push_str(&format!("{}}}", indent));
                    break;
                }
                Some(alt_body) => {
                    // Check if this alternate is a single else-if IfBlock (is_elseif=true)
                    // Don't flatten else-if blocks whose test contains `await` — they need
                    // their own `child_block` wrapping, which happens when they fall through
                    // to the regular else branch and are processed by `build_parts_with_store_subs`.
                    if alt_body.len() == 1
                        && let OutputPart::IfBlock {
                            test_expr: nested_test,
                            consequent_body: nested_consequent,
                            alternate_body: nested_alternate,
                            is_elseif: true,
                        } = &alt_body[0]
                        && !super::helpers::expr_contains_await(nested_test)
                    {
                        // else-if case: emit `else if (test) { <!--[N--> ... }`
                        let marker = format!("<!--[{}-->", elseif_index);
                        elseif_index += 1;

                        code.push_str(&format!(" else if ({}) {{\n", nested_test));
                        code.push_str(&format!("{}\t$$renderer.push('{}');\n", indent, marker));

                        let hoisted_nested =
                            Self::hoist_const_declarations_and_strip_ws(nested_consequent);
                        let branch_code = Self::build_parts_with_store_subs(
                            &hoisted_nested,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        code.push_str(&branch_code);
                        code.push_str(&format!("{}}}", indent));

                        // Advance to next alternate
                        current_alt = nested_alternate.as_deref();
                    } else {
                        // Regular else (final branch in chain, or non-elseif block inside else)
                        code.push_str(" else {\n");
                        code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));

                        let hoisted_alt = Self::hoist_const_declarations_and_strip_ws(alt_body);
                        let alternate_code = Self::build_parts_with_store_subs(
                            &hoisted_alt,
                            indent_level + 1,
                            each_counter,
                            store_subs,
                        );
                        code.push_str(&alternate_code);

                        code.push_str(&format!("{}}}", indent));
                        break;
                    }
                }
            }
        }

        code
    }

    /// Build an AwaitBlock without trailing `<!--]-->` marker.
    /// Used when rendering an AwaitBlock inside an AsyncBlock callback,
    /// where the `<!--]-->` marker should be placed outside the callback.
    fn build_await_block_inner(
        promise: &str,
        then_param: &str,
        pending_body: &[OutputPart],
        then_body: &[OutputPart],
        indent_level: usize,
        each_counter: &mut usize,
        store_subs: &[(&str, &str)],
    ) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Generate $.await call with proper callbacks
        code.push_str(&format!("{}$.await(\n", indent));
        code.push_str(&format!("{}\t$$renderer,\n", indent));
        code.push_str(&format!("{}\t{},\n", indent, promise));

        // Pending callback
        if pending_body.is_empty() {
            code.push_str(&format!("{}\t() => {{}},\n", indent));
        } else {
            code.push_str(&format!("{}\t() => {{\n", indent));
            let pending_code = Self::build_parts_with_store_subs(
                pending_body,
                indent_level + 2,
                each_counter,
                store_subs,
            );
            code.push_str(&pending_code);
            code.push_str(&format!("{}\t}},\n", indent));
        }

        // Then callback (last argument - no catch callback on server)
        if then_body.is_empty() {
            if then_param.is_empty() {
                code.push_str(&format!("{}\t() => {{}}", indent));
            } else {
                code.push_str(&format!("{}\t({}) => {{}}", indent, then_param));
            }
        } else {
            if then_param.is_empty() {
                code.push_str(&format!("{}\t() => {{\n", indent));
            } else {
                code.push_str(&format!("{}\t({}) => {{\n", indent, then_param));
            }
            let then_code = Self::build_parts_with_store_subs(
                then_body,
                indent_level + 2,
                each_counter,
                store_subs,
            );
            code.push_str(&then_code);
            code.push_str(&format!("{}\t}}", indent));
        }

        code.push('\n');
        code.push_str(&format!("{});\n", indent));

        code
    }

    /// Build an EachBlock without surrounding `<!--[-->` / `<!--]-->` markers.
    /// Used when rendering an EachBlock inside an AsyncBlock callback,
    /// where the markers should be placed outside the callback.
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn build_each_block_inner(
        iterable: &str,
        context_name: &Option<String>,
        index_name: &Option<String>,
        index_alias: &Option<String>,
        body: &[OutputPart],
        fallback: &Option<Vec<OutputPart>>,
        indent_level: usize,
        each_counter: &mut usize,
        store_subs: &[(&str, &str)],
    ) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Only wrap in child_block when iterable has await (matching official compiler)
        let iterable_has_await = super::helpers::expr_contains_await(iterable);
        let needs_child_block = iterable_has_await;

        let effective_indent_level = if needs_child_block {
            indent_level + 1
        } else {
            indent_level
        };
        let effective_indent = "\t".repeat(effective_indent_level);
        let transformed_iterable = if iterable_has_await {
            super::helpers::transform_await_to_save(iterable)
        } else {
            iterable.to_string()
        };

        // Generate unique array variable name
        let array_var = if *each_counter == 0 {
            "each_array".to_string()
        } else {
            format!("each_array_{}", each_counter)
        };

        // Generate unique index variable name if not explicitly provided
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

        *each_counter += 1;

        if needs_child_block {
            code.push_str(&format!(
                "{}$$renderer.child_block(async ($$renderer) => {{\n",
                indent
            ));
        }

        if fallback.is_some() {
            code.push_str(&format!(
                "{}const {} = $.ensure_array_like({});\n\n",
                effective_indent, array_var, transformed_iterable
            ));

            code.push_str(&format!(
                "{}if ({}.length !== 0) {{\n",
                effective_indent, array_var
            ));
            code.push_str(&format!(
                "{}\t$$renderer.push('<!--[-->');\n\n",
                effective_indent
            ));

            code.push_str(&format!(
                "{}\tfor (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                effective_indent, index_var, array_var, index_var, index_var
            ));

            if let Some(ctx_name) = context_name {
                code.push_str(&format!(
                    "{}\t\tlet {} = {}[{}];\n",
                    effective_indent, ctx_name, array_var, index_var
                ));
            }

            if let Some(alias) = index_alias {
                code.push_str(&format!(
                    "{}\t\tlet {} = {};\n",
                    effective_indent, alias, index_var
                ));
            }

            if context_name.is_some() || index_alias.is_some() {
                code.push('\n');
            }

            let hoisted_body = Self::hoist_const_declarations_and_strip_ws(body);
            let body_code_inner = Self::build_parts_with_store_subs(
                &hoisted_body,
                effective_indent_level + 2,
                each_counter,
                store_subs,
            );
            code.push_str(&body_code_inner);

            code.push_str(&format!("{}\t}}\n", effective_indent));

            code.push_str(&format!("{}}} else {{\n", effective_indent));
            code.push_str(&format!(
                "{}\t$$renderer.push('<!--[!-->');\n",
                effective_indent
            ));

            if let Some(fb) = fallback {
                let fallback_code = Self::build_parts_with_store_subs(
                    fb,
                    effective_indent_level + 1,
                    each_counter,
                    store_subs,
                );
                code.push_str(&fallback_code);
            }

            code.push_str(&format!("{}}}\n", effective_indent));
        } else {
            // No fallback
            code.push_str(&format!(
                "{}const {} = $.ensure_array_like({});\n\n",
                effective_indent, array_var, transformed_iterable
            ));

            code.push_str(&format!(
                "{}for (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                effective_indent, index_var, array_var, index_var, index_var
            ));

            if let Some(ctx_name) = context_name {
                code.push_str(&format!(
                    "{}\tlet {} = {}[{}];\n",
                    effective_indent, ctx_name, array_var, index_var
                ));
            }

            if let Some(alias) = index_alias {
                code.push_str(&format!(
                    "{}\tlet {} = {};\n",
                    effective_indent, alias, index_var
                ));
            }

            if context_name.is_some() || index_alias.is_some() {
                code.push('\n');
            }

            let hoisted_body = Self::hoist_const_declarations_and_strip_ws(body);
            let body_code_inner = Self::build_parts_with_store_subs(
                &hoisted_body,
                effective_indent_level + 1,
                each_counter,
                store_subs,
            );
            code.push_str(&body_code_inner);

            code.push_str(&format!("{}}}\n", effective_indent));
        }

        if needs_child_block {
            code.push_str(&format!("{}}});\n\n", indent));
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
            // In dev mode, add prevent_snippet_stringification before the function declaration
            if self.dev {
                result.push_str(&format!(
                    "$.prevent_snippet_stringification({});\n",
                    snippet.name
                ));
            }

            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!("function {}({}) {{\n", snippet.name, params));

            // In dev mode, add snippet argument validation
            if self.dev {
                result.push_str("\t$.validate_snippet_args($$renderer);\n");
            }

            // Generate body - snippets have their own counter scope
            let store_subs = self.get_store_sub_names();
            let store_subs_ref: Vec<(&str, &str)> = store_subs
                .iter()
                .map(|(a, b)| (a.as_str(), b.as_str()))
                .collect();
            let mut snippet_counter: usize = 0;
            let body = Self::build_parts_with_store_subs(
                &snippet.body_parts,
                1,
                &mut snippet_counter,
                &store_subs_ref,
            );
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
            // In dev mode, add prevent_snippet_stringification before the function declaration
            if self.dev {
                result.push_str(&format!(
                    "{}$.prevent_snippet_stringification({});\n",
                    indent, snippet.name
                ));
            }

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

            // In dev mode, add snippet argument validation
            if self.dev {
                let inner_indent = "\t".repeat(indent_level + 1);
                result.push_str(&format!(
                    "{}$.validate_snippet_args($$renderer);\n",
                    inner_indent
                ));
            }

            // Generate body - snippets have their own counter scope
            let store_subs = self.get_store_sub_names();
            let store_subs_ref: Vec<(&str, &str)> = store_subs
                .iter()
                .map(|(a, b)| (a.as_str(), b.as_str()))
                .collect();
            let mut snippet_counter: usize = 0;
            let body = Self::build_parts_with_store_subs(
                &snippet.body_parts,
                indent_level + 1,
                &mut snippet_counter,
                &store_subs_ref,
            );
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

        // If uses_slots, add $$slots = $.sanitize_slots($$props)
        if analysis.uses_slots {
            result.push_str(&format!(
                "{}const $$slots = $.sanitize_slots($$props);\n",
                indent
            ));
        }

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

    /// Flush accumulated HTML to body_code, handling inline `await` expressions.
    ///
    /// When the HTML template contains `await` inside `${...}` expressions (e.g.,
    /// from element attributes like `class={await 'awesome'}`), this method:
    /// 1. Splits the HTML into segments (elements with await vs. static content)
    /// 2. Wraps elements with await in `$$renderer.child(async ($$renderer) => { ... })`
    /// 3. Extracts `await expr` and replaces with `$$N` variables with `$.save()`
    ///
    /// This implements the PromiseOptimiser per-element wrapping from the official compiler.
    fn flush_html_with_await_detection(
        body_code: &mut String,
        current_html: &mut String,
        indent: &str,
    ) {
        if current_html.is_empty() {
            return;
        }

        if !super::helpers::html_template_contains_await(current_html) {
            // No await in template expressions - flush normally
            body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
            current_html.clear();
            return;
        }

        // Split the HTML at element boundaries with await.
        // We need to identify individual elements whose opening tags contain await
        // and wrap each one in $$renderer.child().
        //
        // Strategy: scan through current_html, finding element opening tags that
        // contain await in their attributes. Everything before/after gets flushed
        // as normal push calls.
        let segments = Self::split_html_by_await_elements(current_html);

        for seg in segments {
            match seg {
                AwaitHtmlSegment::Static(s) => {
                    if !s.is_empty() {
                        body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, s));
                    }
                }
                AwaitHtmlSegment::ElementWithAwait(html) => {
                    let (transformed, declarations) =
                        super::helpers::extract_await_from_html_template(&html);
                    if declarations.is_empty() {
                        // Fallback - no await extracted
                        body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, html));
                    } else {
                        body_code.push_str(&format!(
                            "{}$$renderer.child(async ($$renderer) => {{\n",
                            indent
                        ));
                        for (var_name, decl_value) in &declarations {
                            body_code.push_str(&format!(
                                "{}\tconst {} = {};\n",
                                indent, var_name, decl_value
                            ));
                        }
                        body_code.push('\n');
                        body_code.push_str(&format!(
                            "{}\t$$renderer.push(`{}`);\n",
                            indent, transformed
                        ));
                        body_code.push_str(&format!("{}}});\n", indent));
                    }
                }
            }
        }

        current_html.clear();
    }

    /// Split an HTML template string into segments, separating elements whose
    /// opening tags contain `await` from static content.
    fn split_html_by_await_elements(html: &str) -> Vec<AwaitHtmlSegment> {
        let bytes = html.as_bytes();
        let len = bytes.len();
        let mut segments: Vec<AwaitHtmlSegment> = Vec::new();
        let mut i = 0;
        let mut current_static = String::new();

        while i < len {
            // Look for an element opening tag that contains await
            if bytes[i] == b'<' && i + 1 < len && bytes[i + 1] != b'/' && bytes[i + 1] != b'!' {
                // Found potential element start
                let tag_start = i;
                // Scan forward to find the end of the opening tag (>)
                // Also check if any ${...} expression in the tag contains await
                let mut j = i + 1;
                let mut has_await = false;
                let mut tag_end_exclusive = 0; // position after >
                let mut is_void = false;

                // First pass: find end of opening tag
                while j < len {
                    if bytes[j] == b'$' && j + 1 < len && bytes[j + 1] == b'{' {
                        // Template expression - scan to end and check for await
                        j += 2;
                        let expr_start = j;
                        let mut depth = 1;
                        while j < len && depth > 0 {
                            match bytes[j] {
                                b'{' => depth += 1,
                                b'}' => depth -= 1,
                                b'\'' | b'"' | b'`' => {
                                    j = super::helpers::skip_string_literal(bytes, j);
                                    continue;
                                }
                                _ => {}
                            }
                            if depth > 0 {
                                j += 1;
                            }
                        }
                        let expr = &html[expr_start..j];
                        if super::helpers::expr_contains_await(expr) {
                            has_await = true;
                        }
                        if j < len {
                            j += 1; // skip }
                        }
                    } else if bytes[j] == b'/' && j + 1 < len && bytes[j + 1] == b'>' {
                        // Self-closing tag
                        is_void = true;
                        tag_end_exclusive = j + 2;
                        break;
                    } else if bytes[j] == b'>' {
                        tag_end_exclusive = j + 1;
                        break;
                    } else {
                        j += 1;
                    }
                }

                if has_await && tag_end_exclusive > 0 {
                    // Flush static content before this element
                    if !current_static.is_empty() {
                        segments.push(AwaitHtmlSegment::Static(std::mem::take(
                            &mut current_static,
                        )));
                    }

                    // Find the complete element (including children and closing tag)
                    let element_html = if is_void {
                        html[tag_start..tag_end_exclusive].to_string()
                    } else {
                        // Find closing tag - extract tag name
                        let tag_name_start = tag_start + 1;
                        let mut tag_name_end = tag_name_start;
                        while tag_name_end < len
                            && !matches!(
                                bytes[tag_name_end],
                                b' ' | b'\t' | b'\n' | b'>' | b'/' | b'$'
                            )
                        {
                            tag_name_end += 1;
                        }
                        let tag_name = &html[tag_name_start..tag_name_end];

                        // Find the matching closing tag
                        let close_tag = format!("</{}>", tag_name);
                        if let Some(close_pos) = html[tag_end_exclusive..].find(&close_tag) {
                            let element_end = tag_end_exclusive + close_pos + close_tag.len();
                            html[tag_start..element_end].to_string()
                        } else {
                            // No closing tag found - just use the opening tag
                            html[tag_start..tag_end_exclusive].to_string()
                        }
                    };

                    let element_len = element_html.len();
                    segments.push(AwaitHtmlSegment::ElementWithAwait(element_html));
                    i = tag_start + element_len;
                    continue;
                } else {
                    // Not an element with await - add to static content
                    if tag_end_exclusive > 0 {
                        current_static.push_str(&html[i..tag_end_exclusive]);
                        i = tag_end_exclusive;
                    } else {
                        current_static.push(bytes[i] as char);
                        i += 1;
                    }
                    continue;
                }
            }

            current_static.push(bytes[i] as char);
            i += 1;
        }

        if !current_static.is_empty() {
            segments.push(AwaitHtmlSegment::Static(current_static));
        }

        segments
    }
}

/// Check if a name is declared via `export let` or `export var` in the script.
/// This handles both simple form (`export let foo;`) and comma-separated form
/// (`export let foo, bar;`).
fn is_declared_via_export_let(script: &str, name: &str) -> bool {
    for line in script.lines() {
        let trimmed = line.trim();
        let rest = if let Some(s) = trimmed.strip_prefix("export let ") {
            s
        } else if let Some(s) = trimmed.strip_prefix("export var ") {
            s
        } else {
            continue;
        };

        // Strip trailing semicolon
        let decl = rest.trim_end_matches(';').trim();

        // Split by comma and check each declarator
        // This handles: `foo`, `foo = default`, etc.
        for declarator in decl.split(',') {
            let declarator = declarator.trim();
            // Take the name part (before `=` if present)
            let decl_name = if let Some(eq_pos) = declarator.find('=') {
                declarator[..eq_pos].trim()
            } else {
                declarator
            };
            if decl_name == name {
                return true;
            }
        }
    }
    false
}

/// Extract `await expr` patterns from a slot props expression.
///
/// Given `{ message: await 'hello' }`, returns:
///   - extracted_exprs: `["hello"]` (the expressions after await)
///   - modified_props: `{ message: $$0 }` (with await replaced by const names)
fn extract_await_from_slot_props(props_expr: &str) -> (Vec<String>, String) {
    let mut extracted = Vec::new();
    let mut modified = String::new();
    let bytes = props_expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        // Skip string literals
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            let quote = bytes[i];
            modified.push(bytes[i] as char);
            i += 1;
            while i < len && bytes[i] != quote {
                if bytes[i] == b'\\' {
                    modified.push(bytes[i] as char);
                    i += 1;
                    if i < len {
                        modified.push(bytes[i] as char);
                        i += 1;
                    }
                } else {
                    modified.push(bytes[i] as char);
                    i += 1;
                }
            }
            if i < len {
                modified.push(bytes[i] as char);
                i += 1;
            }
            continue;
        }

        // Check for `await` keyword
        if i + 5 <= len
            && &props_expr[i..i + 5] == "await"
            && (i == 0 || !bytes[i - 1].is_ascii_alphanumeric() && bytes[i - 1] != b'_')
            && (i + 5 >= len || !bytes[i + 5].is_ascii_alphanumeric() && bytes[i + 5] != b'_')
        {
            // Skip whitespace after await
            let mut j = i + 5;
            while j < len && (bytes[j] == b' ' || bytes[j] == b'\t' || bytes[j] == b'\n') {
                j += 1;
            }

            // Find end of await argument (until comma or closing brace at depth 0)
            let arg_start = j;
            let mut paren_depth = 0i32;
            let mut bracket_depth = 0i32;
            let mut brace_depth = 0i32;

            while j < len {
                match bytes[j] {
                    b'(' => paren_depth += 1,
                    b')' => {
                        if paren_depth == 0 {
                            break;
                        }
                        paren_depth -= 1;
                    }
                    b'[' => bracket_depth += 1,
                    b']' => {
                        if bracket_depth == 0 {
                            break;
                        }
                        bracket_depth -= 1;
                    }
                    b'{' => brace_depth += 1,
                    b'}' => {
                        if brace_depth == 0 {
                            break;
                        }
                        brace_depth -= 1;
                    }
                    b',' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                    b'\'' | b'"' | b'`' => {
                        let quote = bytes[j];
                        j += 1;
                        while j < len && bytes[j] != quote {
                            if bytes[j] == b'\\' {
                                j += 1;
                            }
                            j += 1;
                        }
                    }
                    _ => {}
                }
                j += 1;
            }

            let await_arg = props_expr[arg_start..j].trim().to_string();
            let idx = extracted.len();
            extracted.push(await_arg);
            modified.push_str(&format!("$${}", idx));
            i = j;
            continue;
        }

        modified.push(bytes[i] as char);
        i += 1;
    }

    (extracted, modified)
}

/// Strip async placeholder markers from script output.
/// Used when `use_async` is true but `transform_async_body` returns None
/// (no top-level await), so the markers were never consumed.
///
/// Removes lines containing:
/// - `/* $$async_void_noop */` (placeholder for removed $effect statements)
/// - `/* $$async_hole:` (placeholder for removed $inspect statements in async mode)
fn strip_async_placeholders(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut first = true;
    for line in s.lines() {
        let trimmed = line.trim();
        if memmem::find(trimmed.as_bytes(), b"/* $$async_void_noop */").is_some() {
            continue;
        }
        if !first {
            result.push('\n');
        }
        first = false;
        if memmem::find(trimmed.as_bytes(), b"/* $$async_hole:").is_some() {
            // $inspect() calls should emit ;; (two empty statements) to match
            // the official Svelte compiler's server-side output
            result.push_str(";;");
        } else {
            result.push_str(line);
        }
    }
    result
}

/// Strip trailing semicolons after function declaration closing braces.
/// In JavaScript, `function foo() { };` has a trailing `;` that creates an EmptyStatement.
/// The official Svelte compiler parses AST and regenerates without it.
/// Only strips `};` that closes a function declaration body (not object literals, etc.).
#[allow(dead_code)]
fn strip_trailing_semicolons_after_functions(code: &str) -> String {
    // Use regex-like approach: find `};\n` patterns that look like function declaration ends.
    // A function declaration looks like:
    //   function name(...) {
    //     ...
    //   };    <-- strip the ;
    // But we need to avoid stripping `;` from:
    //   let obj = { ... };   <-- keep the ;
    //   return { ... };      <-- keep the ;
    //
    // Strategy: Track brace nesting. When we see a `};` at a line that's the same indent
    // level as a `function ...() {` line, strip the `;`.
    //
    // Simpler approach: just look for lines that are just `};` (with only whitespace before)
    // and check if the matching `{` line starts with `function ` or is an arrow function etc.
    // For now, use a targeted regex-like approach.

    let mut result = String::with_capacity(code.len());
    let lines: Vec<&str> = code.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let trimmed = lines[i].trim();

        // Check for standalone `};` that closes a function declaration
        if trimmed == "};" {
            let indent = &lines[i][..lines[i].len() - lines[i].trim_start().len()];
            let indent_len = indent.len();

            // Scan backward to find the matching opening brace at the same indent level
            let mut brace_depth = 1;
            let mut is_function = false;
            let mut j = i as isize - 1;
            while j >= 0 && brace_depth > 0 {
                let prev = lines[j as usize].trim();
                // Count braces
                for c in prev.chars().rev() {
                    if c == '}' {
                        brace_depth += 1;
                    } else if c == '{' {
                        brace_depth -= 1;
                        if brace_depth == 0 {
                            break;
                        }
                    }
                }
                if brace_depth == 0 {
                    // Found the matching opening line
                    let open_line = lines[j as usize];
                    let open_indent = open_line.len() - open_line.trim_start().len();
                    let open_trimmed = open_line.trim();
                    // Check if it's a function declaration or method
                    if open_indent == indent_len
                        && (open_trimmed.starts_with("function ")
                            || open_trimmed.starts_with("async function "))
                    {
                        is_function = true;
                    }
                }
                j -= 1;
            }

            if is_function {
                // Strip the `;` - output just `}`
                result.push_str(indent);
                result.push_str("}\n");
                i += 1;
                continue;
            }
        }

        result.push_str(lines[i]);
        result.push('\n');
        i += 1;
    }

    // Remove trailing newline if original didn't have one
    if !code.ends_with('\n') && result.ends_with('\n') {
        result.pop();
    }

    result
}
