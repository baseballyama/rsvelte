//! Assemble the component export appended after the `$$render()` body —
//! mirrors `svelte2tsx/addComponentExport.ts`.

use std::fmt::Write as _;

use crate::ast::template::Root;

use super::interfaces::{Svelte2TsxOptions, SvelteVersion};
use super::magic_string::MagicString;
use super::nodes::component_documentation::extract_component_documentation;
use super::nodes::component_events::build_events_str;
use super::nodes::generics::parse_generics_attr;
use super::nodes::slot::build_slots_str;
use super::script::{ComponentEvents, ExportedNames};
use super::template;

/// Inputs for [`add_component_export`] — mirrors the JS reference's
/// `addComponentExport(params)` object.
pub struct ComponentExportParams<'a> {
    pub ast: &'a Root<'a>,
    pub source: &'a str,
    pub options: &'a Svelte2TsxOptions,
    pub component_name: &'a str,
    pub template_info: &'a template::TemplateInfo<'a>,
    pub exported_names: &'a ExportedNames,
    pub events: &'a mut ComponentEvents,
    pub generics_attribute: Option<&'a str>,
    pub features: ComponentExportFeatures,
}

#[derive(Clone, Copy, Default)]
pub struct ComponentExportFeatures(u8);

impl ComponentExportFeatures {
    const SLOT_ELEMENTS: u8 = 1;
    const TOP_LEVEL_AWAIT: u8 = 1 << 1;
    const DOLLAR_PROPS: u8 = 1 << 2;
    const DOLLAR_REST_PROPS: u8 = 1 << 3;

    pub const fn with_slot_elements_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::SLOT_ELEMENTS;
        }
        self
    }
    pub const fn with_top_level_await_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::TOP_LEVEL_AWAIT;
        }
        self
    }
    pub const fn with_dollar_props_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::DOLLAR_PROPS;
        }
        self
    }
    pub const fn with_dollar_rest_props_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::DOLLAR_REST_PROPS;
        }
        self
    }
    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }
}

/// Build the text appended after the `$$render()` body: the async-wrapper
/// close, the `return { props, slots, events }` statement and the component
/// export itself. The caller appends the returned string to `str`.
pub fn add_component_export(
    params: ComponentExportParams<'_>,
    str: &mut MagicString<'_>,
) -> String {
    let ComponentExportParams {
        ast,
        source,
        options,
        component_name,
        template_info,
        exported_names,
        events,
        generics_attribute,
        features,
    } = params;

    // Append the closing of async wrapper, return statement, and component export
    // `uses$$propsOr$$restProps` (ungated) flattens the props type to `{}` when
    // there are NO explicitly-declared props — mirrors official
    // `createPropsStr(uses$$propsOr$$restProps)`.
    let has_slot_elements = features.contains(ComponentExportFeatures::SLOT_ELEMENTS);
    let has_top_level_await = features.contains(ComponentExportFeatures::TOP_LEVEL_AWAIT);
    let uses_dollar_props = features.contains(ComponentExportFeatures::DOLLAR_PROPS);
    let uses_dollar_rest_props = features.contains(ComponentExportFeatures::DOLLAR_REST_PROPS);
    let uses_props_or_rest = uses_dollar_props || uses_dollar_rest_props;
    // `canHaveAnyProp = !uses$$Props && (uses$$props || uses$$restProps)`: a
    // `$$Props` type/interface SUPPRESSES the `__sveltets_2_with_any` widening
    // (official addComponentExport.ts), so the two values diverge.
    let can_have_any_prop = !exported_names.uses_dollar_props_type() && uses_props_or_rest;
    let props_str = exported_names.create_props_str(options.is_ts_file, uses_props_or_rest);
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);
    // Determine effective accessors setting: from options OR <svelte:options accessors>
    let effective_accessors = options.accessors
        || ast
            .options
            .as_ref()
            .and_then(|o| o.accessors)
            .unwrap_or(false);
    let exports_str = exported_names.create_exports_str_with_accessors(
        is_svelte5,
        effective_accessors,
        options.is_ts_file,
    );
    let bindings_str = exported_names.create_bindings_str(is_svelte5);
    let mut safe_name = String::with_capacity(component_name.len() + "__SvelteComponent_".len());
    safe_name.push_str(component_name);
    safe_name.push_str("__SvelteComponent_");

    // Extract @component documentation from HTML comments
    let component_doc = extract_component_documentation(&ast.fragment);

    // Build slots string from template info
    let slots_str = build_slots_str(template_info, exported_names.has_slots_type());

    // Scan the component for `dispatch("name", …)` call sites of any untyped
    // `createEventDispatcher()` so they surface in the events return. Template
    // calls (outside the script regions) are collected first, then instance-
    // script calls that appear after the dispatcher declaration; module-script
    // calls are excluded. See `collect_dispatched_events`.
    let inst_range = ast.instance.as_ref().map(|s| (s.content_offset, s.end));
    let mod_range = ast.module.as_ref().map(|s| (s.content_offset, s.end));
    events.collect_dispatched_events(source, inst_range, mod_range);

    // A `$$Events` interface (official `ComponentEventsFromInterface`) overrides
    // the inferred event map: the events def becomes `{} as unknown as $$Events`
    // and every UNTYPED `createEventDispatcher()` gets a
    // `<__sveltets_2_CustomEvents<$$Events>>` type argument so its dispatches are
    // checked against the interface.
    if exported_names.has_events_type() {
        // Official gates the injection on `ComponentEventsFromInterface.isPresent()`,
        // which only becomes true once the `$$Events` declaration is reached in the
        // single source-order walk. So only an untyped dispatcher declared AFTER the
        // `$$Events` declaration gets the typing — earlier ones stay bare.
        let events_decl_pos = exported_names.events_type_decl_pos.unwrap_or(0);
        for pos in &events.dispatcher_typing_inject_pos {
            if *pos > events_decl_pos {
                str.prepend_left(*pos, "<__sveltets_2_CustomEvents<$$Events>>");
            }
        }
    }

    // Build events string from template info and component events
    let events_str = build_events_str(exported_names, template_info, events);

    let component_doc_len = component_doc.as_deref().map_or(0, str::len);
    let common_capacity = props_str.len()
        + exports_str.len()
        + bindings_str.len()
        + slots_str.len()
        + events_str.len()
        + safe_name.len() * 4
        + component_doc_len
        + 256;
    let mut closing = String::with_capacity(common_capacity);
    closing.push_str("};\n");
    closing.push_str("return { props: ");
    closing.push_str(&props_str);
    closing.push_str(&exports_str);
    closing.push_str(&bindings_str);
    closing.push_str(", slots: ");
    closing.push_str(&slots_str);
    closing.push_str(", events: ");
    closing.push_str(&events_str);
    closing.push_str(" }}\n");

    // component_doc is emitted immediately before each component const/class
    // declaration below (mirroring upstream addComponentExport.ts which places
    // `${doc}` adjacent to the component declaration in every branch).

    // Build the renderCall / awaitDeclaration pair used throughout the
    // component export section below.
    //
    // Reference: `addComponentExport.ts` – `addSimpleComponentExport`:
    //   const renderCall = hasTopLevelAwait ? `$${renderName}` : `${renderName}()`;
    //   const awaitDeclaration = hasTopLevelAwait
    //       ? surroundWithIgnoreComments(`const $${renderName} = await ${renderName}();`) + '\n'
    //       : '';
    //
    // The rsvelte equivalent uses the same ignore markers (Ω = U+03A9).
    let render_call: &str = if has_top_level_await {
        "$$$render"
    } else {
        "$$render()"
    };
    let await_declaration: &str = if has_top_level_await {
        "/*\u{03A9}ignore_start\u{03A9}*/ const $$$render = await $$render(); /*\u{03A9}ignore_end\u{03A9}*/\n"
    } else {
        ""
    };

    // Upstream keys the component export on `Generics.has()`, i.e. the attribute
    // parsed as a type parameter list — not on the attribute merely being there.
    let attribute_generics = generics_attribute
        .map(parse_generics_attr)
        .unwrap_or_default();
    let has_generics = !exported_names.dollar_generics.is_empty() || attribute_generics.has();

    // Build generics strings for component export
    let (generics_params, generics_names) = if !exported_names.dollar_generics.is_empty() {
        let params: Vec<String> = exported_names
            .dollar_generics
            .iter()
            .map(|(name, constraint)| {
                constraint.as_ref().map_or_else(
                    || name.clone(),
                    |constraint| format!("{name} extends {constraint}"),
                )
            })
            .collect();
        let names: Vec<String> = exported_names
            .dollar_generics
            .iter()
            .map(|(name, _)| name.clone())
            .collect();
        (params.join(","), names.join(","))
    } else if attribute_generics.has() {
        (
            attribute_generics.definitions_str(),
            attribute_generics.references_str(),
        )
    } else {
        (String::new(), String::new())
    };

    match options.version {
        SvelteVersion::V4 => {
            if let Some(ref doc) = component_doc {
                closing.push_str(doc);
                closing.push('\n');
            }
            let _ = write!(
                closing,
                "\nexport default class {safe_name} extends __sveltets_2_createSvelte2TsxComponent("
            );
            write_prop_def(
                &mut closing,
                exported_names,
                options.is_ts_file,
                can_have_any_prop,
                render_call,
            );
            closing.push_str(") {\n}");
        }
        SvelteVersion::V5 => {
            let use_ts_syntax = options.is_ts_file || !options.emit_jsdoc;
            // `__sveltets_2_fn_component` is only used for a runes component with
            // NO slots and NO events; a runes component that forwards events
            // (`on:click`) or has slots falls through to the isomorphic-component
            // path, exactly like a legacy component (mirrors official
            // addComponentExport: `isRunesMode() && !usesSlots && !hasEvents`).
            // "No events" must also account for forwarded element/component
            // events (`<div on:click>` / `<Inner on:bar/>`), which live in
            // `template_info.element_events`, not `events`.
            let has_any_events = !events.is_empty() || !template_info.element_events.is_empty();
            if exported_names.is_runes_mode() && !has_any_events && !has_slot_elements {
                if !use_ts_syntax {
                    // JS files with emitJsDoc: use `export const` and JSDoc typedef.
                    // Reference: addComponentExport.ts `addSimpleComponentExport`,
                    // isSvelte5 + isRunesMode + useTypeScriptSyntax=false branch.
                    // `awaitDeclaration` is emitted first when the component has a
                    // top-level await (hasTopLevelAwait); `render_call` is `$$$render`
                    // in that case, `$$render()` otherwise.
                    closing.push_str(await_declaration);
                    if let Some(ref doc) = component_doc {
                        closing.push_str(doc);
                        closing.push('\n');
                    }
                    closing.push_str("export const ");
                    closing.push_str(&safe_name);
                    closing.push_str(" = __sveltets_2_fn_component(");
                    closing.push_str(render_call);
                    closing.push_str(");\n");
                    closing.push_str(
                        "/*\u{03A9}ignore_start\u{03A9}*//** @typedef {ReturnType<typeof ",
                    );
                    closing.push_str(&safe_name);
                    closing.push_str(">} ");
                    closing.push_str(&safe_name);
                    closing.push_str(" */\n");
                    closing.push_str("/*\u{03A9}ignore_end\u{03A9}*/export default ");
                    closing.push_str(&safe_name);
                    closing.push(';');
                } else if has_generics {
                    // Runes + generics: `__sveltets_2_fn_component($$render())`
                    // discards `T` ($$render is called without `<T>` and the
                    // component type alias never consumes its own `<T>`), so a
                    // generic component's `T` could not be inferred at the call
                    // site and `T`-dependent sibling props (callbacks, snippet
                    // params) collapsed to `unknown` (#923). The #801 fix only
                    // made `Foo<X>` a valid *reference*. Emit the upstream
                    // `__sveltets_Render<T>` + `$$IsomorphicComponent` shape
                    // instead, which threads `T` through generic constructor /
                    // call signatures so TypeScript infers it from the props.
                    let gn = &generics_names;
                    let raw_bindings = exported_names.create_raw_bindings_str(is_svelte5);
                    let raw_exports = exported_names.create_raw_exports_str(
                        is_svelte5,
                        effective_accessors,
                        options.is_ts_file,
                    );
                    let exports_return = if raw_exports == "$$HAS_EXPORTS$$" {
                        format!("$$render<{gn}>().exports")
                    } else {
                        raw_exports
                    };
                    // Mirror official `canHaveAnyProp`: only `$$props`/`$$restProps`
                    // (legacy magic vars) without an explicit `$$Props` type force
                    // the call-signature `props` to fall back to the full
                    // `ReturnType<…['props']>` shape. A runes generic with no props
                    // (e.g. empty `<script generics>`) emits `props: {<events/slots>}`.
                    let can_have_any_prop = !exported_names.uses_dollar_props_type()
                        && (uses_dollar_props || uses_dollar_rest_props);
                    let props_has_no_props = exported_names.has_no_props();
                    emit_runes_generics_component(
                        &mut closing,
                        &safe_name,
                        &generics_params,
                        gn,
                        &raw_bindings,
                        &exports_return,
                        has_slot_elements,
                        !events.is_empty(),
                        !can_have_any_prop && props_has_no_props,
                        component_doc.as_deref(),
                    );
                } else {
                    // Runes mode, TS syntax, no generics — the most common path.
                    // Reference: addComponentExport.ts `addSimpleComponentExport`,
                    // isSvelte5 + isRunesMode + useTypeScriptSyntax=true branch.
                    // `awaitDeclaration` is emitted first when the component has a
                    // top-level await (hasTopLevelAwait); `render_call` is `$$$render`
                    // in that case, `$$render()` otherwise.
                    closing.push_str(await_declaration);
                    if let Some(ref doc) = component_doc {
                        closing.push_str(doc);
                        closing.push('\n');
                    }
                    closing.push_str("const ");
                    closing.push_str(&safe_name);
                    closing.push_str(" = __sveltets_2_fn_component(");
                    closing.push_str(render_call);
                    closing.push_str(");\n");
                    closing.push_str("/*\u{03A9}ignore_start\u{03A9}*/type ");
                    closing.push_str(&safe_name);
                    closing.push_str(" = ReturnType<typeof ");
                    closing.push_str(&safe_name);
                    closing.push_str(">;\n");
                    closing.push_str("/*\u{03A9}ignore_end\u{03A9}*/export default ");
                    closing.push_str(&safe_name);
                    closing.push(';');
                }
            } else if has_generics {
                // Generics component export: __sveltets_Render + $$IsomorphicComponent
                let gp = &generics_params;
                let gn = &generics_names;
                let raw_bindings = exported_names.create_raw_bindings_str(is_svelte5);
                let raw_exports = exported_names.create_raw_exports_str(
                    is_svelte5,
                    effective_accessors,
                    options.is_ts_file,
                );

                // Determine if the component has exports (exported functions/consts)
                let has_real_exports = raw_exports == "$$HAS_EXPORTS$$";

                // Build __sveltets_Render class
                let _ = writeln!(closing, "class __sveltets_Render<{gp}> {{");
                // Mirror official `props(isTsFile=true, canHaveAnyProp, …, '$$render<…>()')`:
                // a legacy (non-runes) generic component widens its `props` with
                // `__sveltets_2_with_any` exactly when `canHaveAnyProp`.
                let props_render = if can_have_any_prop {
                    format!("__sveltets_2_with_any($$render<{gn}>())")
                } else {
                    format!("$$render<{gn}>()")
                };
                let _ = writeln!(
                    closing,
                    "    props() {{\n        return {props_render}.props;\n    }}"
                );
                // Mirror official `_events(hasStrictEvents || isRunesMode, …)`:
                // a `$$Events` interface (strict events) — or runes mode — drops
                // the `__sveltets_2_with_any_event` fallback wrapper.
                let events_render =
                    if exported_names.has_events_type() || exported_names.is_runes_mode() {
                        format!("$$render<{gn}>()")
                    } else {
                        format!("__sveltets_2_with_any_event($$render<{gn}>())")
                    };
                let _ = writeln!(
                    closing,
                    "    events() {{\n        return {events_render}.events;\n    }}"
                );
                let _ = writeln!(
                    closing,
                    "    slots() {{\n        return $$render<{gn}>().slots;\n    }}"
                );
                let _ = writeln!(closing, "    bindings() {{ return {raw_bindings}; }}");
                // exports() returns $$render().exports if there are real exports, {} otherwise
                let exports_return = if has_real_exports {
                    format!("$$render<{gn}>().exports")
                } else {
                    raw_exports
                };
                let _ = writeln!(closing, "    exports() {{ return {exports_return}; }}");
                closing.push_str("}\n\n");

                // Build `any` type params string: one `any` per generic param
                let any_params = generics_names
                    .split(',')
                    .map(|_| "any")
                    .collect::<Vec<_>>()
                    .join(",");

                // Determine if component has slot elements (for {children?: any} in constructor)
                let children_type_suffix = if has_slot_elements {
                    "& {children?: any}"
                } else {
                    ""
                };

                // Build $$IsomorphicComponent interface
                closing.push_str("interface $$IsomorphicComponent {\n");
                let _ = writeln!(
                    closing,
                    "    new <{gp}>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<{gn}>['props']>{children_type_suffix}>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<{gn}>['props']>, ReturnType<__sveltets_Render<{gn}>['events']>, ReturnType<__sveltets_Render<{gn}>['slots']>> & {{ $$bindings?: ReturnType<__sveltets_Render<{gn}>['bindings']> }} & ReturnType<__sveltets_Render<{gn}>['exports']>;"
                );
                // Functional call signature: add $$slots and children only when component has slots
                let slots_children_suffix = if has_slot_elements {
                    format!(
                        ", $$slots?: ReturnType<__sveltets_Render<{gn}>['slots']>, children?: any"
                    )
                } else {
                    String::new()
                };
                // When the component has no props (and can't take arbitrary
                // props via $$props/$$restProps), official drops the
                // `ReturnType<…['props']> &` prefix, leaving just the
                // events/slots members. Mirrors `createPropsStr`'s
                // `!canHaveAnyProp && hasNoProps()` branch.
                let props_prefix = if exported_names.has_no_props() && !uses_dollar_props {
                    String::new()
                } else {
                    format!("ReturnType<__sveltets_Render<{gn}>['props']> & ")
                };
                let _ = writeln!(
                    closing,
                    "    <{gp}>(internal: unknown, props: {props_prefix}{{$$events?: ReturnType<__sveltets_Render<{gn}>['events']>{slots_children_suffix}}}): ReturnType<__sveltets_Render<{gn}>['exports']>;"
                );
                let _ = writeln!(
                    closing,
                    "    z_$$bindings?: ReturnType<__sveltets_Render<{any_params}>['bindings']>;"
                );
                closing.push_str("}\n");

                // Component export
                if let Some(ref doc) = component_doc {
                    closing.push_str(doc);
                    closing.push('\n');
                }
                let _ = writeln!(
                    closing,
                    "const {safe_name}: $$IsomorphicComponent = null as any;"
                );
                let _ = writeln!(
                    closing,
                    "/*\u{03A9}ignore_start\u{03A9}*/type {safe_name}<{gp}> = InstanceType<typeof {safe_name}<{gn}>>;"
                );
                let _ = write!(
                    closing,
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {safe_name};"
                );
            } else {
                // Legacy V5 non-runes non-generics: isomorphic_component path.
                // Reference: addComponentExport.ts `addSimpleComponentExport`,
                // isSvelte5 + !isRunesMode + !has_generics branch.
                // `awaitDeclaration` is emitted first; `render_call` is threaded
                // through `write_prop_def` → `__sveltets_2_with_any_event(renderCall)`.
                closing.push_str(await_declaration);
                let has_non_empty_slots = !template_info.slots.is_empty();
                let component_fn = if has_non_empty_slots {
                    "__sveltets_2_isomorphic_component_slots"
                } else {
                    "__sveltets_2_isomorphic_component"
                };
                if let Some(ref doc) = component_doc {
                    closing.push_str(doc);
                    closing.push('\n');
                }
                if !use_ts_syntax {
                    closing.push_str("export ");
                }
                closing.push_str("const ");
                closing.push_str(&safe_name);
                closing.push_str(" = ");
                closing.push_str(component_fn);
                closing.push('(');
                write_prop_def(
                    &mut closing,
                    exported_names,
                    options.is_ts_file,
                    can_have_any_prop,
                    render_call,
                );
                closing.push_str(");\n");
                closing.push_str("/*\u{03A9}ignore_start\u{03A9}*/");
                if use_ts_syntax {
                    closing.push_str("type ");
                    closing.push_str(&safe_name);
                    closing.push_str(" = InstanceType<typeof ");
                    closing.push_str(&safe_name);
                    closing.push_str(">;\n");
                } else {
                    closing.push_str("/** @typedef {InstanceType<typeof ");
                    closing.push_str(&safe_name);
                    closing.push_str(">} ");
                    closing.push_str(&safe_name);
                    closing.push_str(" */\n");
                }
                closing.push_str("/*\u{03A9}ignore_end\u{03A9}*/export default ");
                closing.push_str(&safe_name);
                closing.push(';');
            }
        }
    }

    closing
}

fn write_prop_def(
    output: &mut String,
    exported_names: &ExportedNames,
    is_ts_file: bool,
    can_have_any_prop: bool,
    render_call: &str,
) {
    if !exported_names.is_runes_mode() {
        if is_ts_file {
            if can_have_any_prop {
                output.push_str("__sveltets_2_with_any(");
            }
        } else {
            output.push_str(if can_have_any_prop {
                "__sveltets_2_partial_with_any("
            } else {
                "__sveltets_2_partial("
            });
            let optional_start = output.len();
            output.push('[');
            if exported_names.write_optional_props(output) {
                output.push_str("], ");
            } else {
                output.truncate(optional_start);
            }
        }
    }

    if exported_names.has_events_type() {
        output.push_str(render_call);
    } else {
        output.push_str("__sveltets_2_with_any_event(");
        output.push_str(render_call);
        output.push(')');
    }

    if !exported_names.is_runes_mode() && (!is_ts_file || can_have_any_prop) {
        output.push(')');
    }
}

/// Emit the `__sveltets_Render<T>` + `$$IsomorphicComponent` component export
/// for a **runes-mode generic** component (`<script generics="T">` + runes).
///
/// Unlike a non-generic runes component (which uses
/// `__sveltets_2_fn_component($$render())`), this threads the generic params
/// through a generic constructor / call signature so TypeScript can *infer* `T`
/// from the props supplied at the call site and flow it into sibling
/// `T`-dependent prop types (callback params, `Snippet<[…T…]>` params). The
/// `fn_component` form discards `T` (`$$render()` is called without `<T>` and
/// the component type alias never uses its own `<T>`), so those prop params
/// collapsed to `unknown` (#923). The shape mirrors upstream svelte2tsx's
/// `addComponentExport` for Svelte 5 runes generics — the render-class methods
/// carry explicit `ReturnType<typeof $$render<T>>[…]` annotations.
#[allow(clippy::too_many_arguments)]
fn emit_runes_generics_component(
    closing: &mut String,
    safe_name: &str,
    gp: &str,
    gn: &str,
    raw_bindings: &str,
    exports_return: &str,
    has_slot_elements: bool,
    has_events: bool,
    props_is_empty: bool,
    component_doc: Option<&str>,
) {
    let _ = writeln!(closing, "class __sveltets_Render<{gp}> {{");
    let _ = writeln!(
        closing,
        "    props(): ReturnType<typeof $$render<{gn}>>['props'] {{ return null as any; }}"
    );
    let _ = writeln!(
        closing,
        "    events(): ReturnType<typeof $$render<{gn}>>['events'] {{ return null as any; }}"
    );
    let _ = writeln!(
        closing,
        "    slots(): ReturnType<typeof $$render<{gn}>>['slots'] {{ return null as any; }}"
    );
    let _ = writeln!(closing, "    bindings() {{ return {raw_bindings}; }}");
    let _ = writeln!(closing, "    exports() {{ return {exports_return}; }}");
    closing.push_str("}\n\n");

    let any_params = gn.split(',').map(|_| "any").collect::<Vec<_>>().join(",");
    let children_type_suffix = if has_slot_elements {
        "& {children?: any}"
    } else {
        ""
    };

    closing.push_str("interface $$IsomorphicComponent {\n");
    let _ = writeln!(
        closing,
        "    new <{gp}>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<{gn}>['props']>{children_type_suffix}>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<{gn}>['props']>, ReturnType<__sveltets_Render<{gn}>['events']>, ReturnType<__sveltets_Render<{gn}>['slots']>> & {{ $$bindings?: ReturnType<__sveltets_Render<{gn}>['bindings']> }} & ReturnType<__sveltets_Render<{gn}>['exports']>;"
    );
    // Mirror official addComponentExport: `$$events?` is only included when the
    // component has events (or, in legacy mode, always — but this is the runes
    // path, so just `has_events`). `$$slots?`/`children?` only when slotted.
    let mut events_slots_parts: Vec<String> = Vec::new();
    if has_events {
        events_slots_parts.push(format!(
            "$$events?: ReturnType<__sveltets_Render<{gn}>['events']>"
        ));
    }
    if has_slot_elements {
        events_slots_parts.push(format!(
            "$$slots?: ReturnType<__sveltets_Render<{gn}>['slots']>"
        ));
        events_slots_parts.push("children?: any".to_string());
    }
    let events_slots_inner = events_slots_parts.join(", ");
    let props_type = if props_is_empty {
        format!("{{{events_slots_inner}}}")
    } else {
        format!("ReturnType<__sveltets_Render<{gn}>['props']> & {{{events_slots_inner}}}")
    };
    let _ = writeln!(
        closing,
        "    <{gp}>(internal: unknown, props: {props_type}): ReturnType<__sveltets_Render<{gn}>['exports']>;"
    );
    let _ = writeln!(
        closing,
        "    z_$$bindings?: ReturnType<__sveltets_Render<{any_params}>['bindings']>;"
    );
    closing.push_str("}\n");

    if let Some(doc) = component_doc {
        closing.push_str(doc);
        closing.push('\n');
    }
    let _ = writeln!(
        closing,
        "const {safe_name}: $$IsomorphicComponent = null as any;"
    );
    let _ = writeln!(
        closing,
        "/*\u{03A9}ignore_start\u{03A9}*/type {safe_name}<{gp}> = InstanceType<typeof {safe_name}<{gn}>>;"
    );
    let _ = write!(
        closing,
        "/*\u{03A9}ignore_end\u{03A9}*/export default {safe_name};"
    );
}
