//! Wrap the component in `function $$render() { … }` and prepend the
//! `///<reference types="svelte" />` header — mirrors
//! `svelte2tsx/createRenderFunction.ts`.

use std::fmt::Write as _;

use indexmap::IndexSet;

use crate::ast::template::Root;

use super::interfaces::{Svelte2TsxMode, Svelte2TsxOptions};
use super::magic_string::MagicString;
use super::nodes::scripts::find_instance_imports;
use super::nodes::slot::escape_js_single_quoted;
use super::script::StoreScanContext;
use super::svelte2tsx::slice_src;

/// Prepend the reference-types header and open the `$$render()` wrapper.
/// Which of the three shapes is emitted depends on whether the component has an
/// instance script, only a module script, or no script at all.
#[allow(
    clippy::too_many_arguments,
    reason = "mirrors the JS reference's createRenderFunction(params) inputs"
)]
pub fn create_render_function(
    ast: &Root,
    module_program: Option<&oxc_ast::ast::Program>,
    source: &str,
    store_scan: &mut StoreScanContext<'_>,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    dollar_decls: &str,
    has_instance_script: bool,
    has_module_script: bool,
    has_slot_elements: bool,
    hoistable_snippet_ranges: &[(u32, u32)],
    embedded_script_content: &str,
) {
    let is_dts_mode = matches!(options.mode, Svelte2TsxMode::Dts);
    let header_str = if is_dts_mode {
        if options.no_svelte_component_typed {
            "import { SvelteComponent } from \"svelte\"\n\n"
        } else {
            "import { SvelteComponentTyped } from \"svelte\"\n\n"
        }
    } else {
        "///<reference types=\"svelte\" />\n"
    };
    if has_instance_script {
        // Prepend the reference types
        str.prepend_str(header_str);
    } else if has_module_script {
        // Module script but no instance script
        let module = ast.module.as_ref().unwrap();
        let mod_content_start = module.content_offset;
        let mod_end = module.end;

        // Module-hoistable snippets land either:
        // - right after the last top-level import in the module script, or
        // - at `mod_content_start` (right after `<script module ...>`'s `>`)
        //   if the module has no imports.
        //
        // Mirrors the JS reference's `snippetHoistTargetForModule = lastImport
        // ? lastImport.end + moduleAst.astOffset : moduleAst.astOffset` and the
        // accompanying `appendLeft(target, '\n')` for the no-imports case.
        if !hoistable_snippet_ranges.is_empty() {
            let module_imports =
                find_instance_imports(module, source, module_program.expect("module script"));
            let module_hoist_target = module_imports
                .last()
                .map_or(mod_content_start, |last| mod_content_start + last.end);
            // JS reference: `str.appendLeft(snippetHoistTargetForModule, '\n')`
            // for both the imports-present and no-imports branches.
            str.append_left(module_hoist_target, "\n");
            for (s, e) in hoistable_snippet_ranges {
                str.move_range(*s, *e, module_hoist_target);
            }
        }

        // For module-script-only components, inject store subscriptions for
        // module-level imports at the start of the $$render async wrapper.
        let store_decls =
            super::script::collect_module_import_store_declarations(store_scan, module_program);
        // Suppress the `__sveltets_createSlot` binding in dts mode; matches
        // `createRenderFunction.ts`'s `slots.size > 0 && mode !== 'dts'` gate.
        let slot_decl_mod = if has_slot_elements && !is_dts_mode {
            "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot();/*\u{03A9}ignore_end\u{03A9}*/"
        } else {
            ""
        };
        // Official `createRenderFunction.ts` emits the `slotsDeclaration`
        // (`const __sveltets_createSlot = …`) in the $$render body BEFORE the
        // `async () => {` wrapper, not inside it. Keep module-import store
        // subscriptions inside the async wrapper.
        let render_open = format!(
            ";function $$render() {{{dollar_decls}{slot_decl_mod}\nasync () => {{{store_decls}"
        );
        str.append_left(mod_end, &render_open);

        // Blank out trailing whitespace after the module script ONLY when
        // there's no template content following. This ensures the async
        // wrapper closes immediately for module-script-only components.
        let has_non_whitespace_template = ast.fragment.nodes.iter().any(|node| {
            !matches!(node, crate::ast::template::TemplateNode::Text(t)
                if slice_src(source, t.start as usize, t.end as usize).chars().all(char::is_whitespace))
        });
        if !has_non_whitespace_template && (mod_end as usize) < source.len() {
            let bytes = source.as_bytes();
            let mut trailing_end = mod_end;
            while (trailing_end as usize) < bytes.len() {
                let b = bytes[trailing_end as usize];
                if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                    trailing_end += 1;
                } else {
                    break;
                }
            }
            if trailing_end > mod_end {
                str.overwrite(mod_end, trailing_end, "");
            }
        }

        str.prepend_str(header_str);
    } else {
        // No script tags at all: prepend the full wrapper.
        // When embedded scripts were found and removed (step 7.48), their content
        // is injected here right after `function $$render() {` — mirroring how
        // the official tool processes an embedded script as an instance script and
        // moves its content to the render-function body start.
        let slot_decl_tmpl = if has_slot_elements && !is_dts_mode {
            "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot();/*\u{03A9}ignore_end\u{03A9}*/"
        } else {
            ""
        };
        let embedded_injection = if embedded_script_content.is_empty() {
            String::new()
        } else {
            format!("\n{embedded_script_content}")
        };
        let wrapper = format!(
            "{header_str};function $$render() {{{dollar_decls}{embedded_injection}{slot_decl_tmpl}\nasync () => {{"
        );
        str.prepend_str(&wrapper);
    }
}
/// Build the `$$props`/`$$restProps`/`$$slots` declaration text injected into
/// the `$$render()` header for a component that references those legacy magic
/// variables.
pub fn build_dollar_declarations(
    uses_dollar_props: bool,
    uses_dollar_rest_props: bool,
    uses_dollar_slots: bool,
    dollar_slot_names: Option<&IndexSet<String>>,
) -> String {
    let mut dollar_decls = String::new();
    if uses_dollar_props {
        dollar_decls.push_str(" let $$props = __sveltets_2_allPropsType();");
    }
    if uses_dollar_rest_props {
        dollar_decls.push_str(" let $$restProps = __sveltets_2_restPropsType();");
    }
    if uses_dollar_slots {
        dollar_decls.push_str(" let $$slots = __sveltets_2_slotsType({");
        for (index, name) in dollar_slot_names.into_iter().flatten().enumerate() {
            if index > 0 {
                dollar_decls.push_str(", ");
            }
            let _ = write!(dollar_decls, "'{}': ''", escape_js_single_quoted(name));
        }
        dollar_decls.push_str("});");
    }
    dollar_decls
}
