//! Rewrite the instance `<script>` tag into the `$$render()` body and lift its
//! import declarations to module scope — mirrors
//! `svelte2tsx/processInstanceScriptContent.ts`.

use crate::ast::template::Root;

use super::interfaces::{Svelte2TsxMode, Svelte2TsxOptions};
use super::magic_string::MagicString;
use super::nodes::generics::{
    extract_generics_from_script_tag, split_generic_param_names, type_text_references_any,
    type_text_typeof_references_local_value,
};
use super::nodes::scripts::{LiftedImport, detect_top_level_await, find_script_close_tag_start};
use super::script::ExportedNames;
use super::svelte2tsx::slice_src;

/// Overwrite the instance script tags and lift its imports. Import declarations
/// inside the instance script are lifted above the `$$render()` function so they
/// appear at module scope in the output, matching the JS reference.
///
/// Runs before Phase 3's `move_range` calls — see the ordering note in
/// `svelte2tsx()`. Returns whether the instance script contains a top-level
/// `await`.
#[allow(
    clippy::too_many_arguments,
    reason = "mirrors the JS reference's processInstanceScriptContent(params) inputs"
)]
pub fn process_instance_script_tag(
    ast: &Root,
    instance_program: &oxc_ast::ast::Program,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    exported_names: &mut ExportedNames,
    dollar_decls: &str,
    has_module_script: bool,
    has_slot_elements: bool,
    hoistable_snippet_ranges: &[(u32, u32)],
    imports: &[LiftedImport],
) -> bool {
    let instance = ast.instance.as_ref().unwrap();
    let script_start = instance.start;
    let script_end = instance.end;
    let content_start = instance.content_offset;
    let content_end = find_script_close_tag_start(source, script_end);

    // Detect top-level `await` in the script content.
    // Top-level await in the instance script forces runes mode — async
    // components are Svelte 5 runes-only.
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
    //   `isRunes = true when component has TOP-LEVEL AWAIT in the instance script`
    let raw_content = slice_src(source, content_start as usize, content_end as usize);
    // When the instance script failed to parse (lenient svelte2tsx fallback —
    // `instance.raw_content` is non-empty), the script is spliced raw and
    // official does NOT detect its top-level `await` / wrap `$$render` in
    // `async`; mirror that (the awaits stay in the raw, oxfmt-skipped output).
    let script_parse_failed = !instance.raw_content.is_empty();
    let has_top_level_await =
        !script_parse_failed && detect_top_level_await(raw_content, instance_program);
    if has_top_level_await {
        exported_names.set_uses_runes(true);
    }
    // The lenient fallback's empty-body placeholder loses rune detection, but
    // official's acorn recovers the valid parts and still sees `$state` /
    // `$derived` etc. → runes mode. Byte-scan the raw script for a rune call
    // so the component export / bindings keep their runes shape.
    if script_parse_failed
        && [
            "$state",
            "$derived",
            "$props",
            "$effect",
            "$bindable",
            "$host",
        ]
        .iter()
        .any(|rune| raw_content.contains(rune))
    {
        exported_names.set_uses_runes(true);
    }
    let async_prefix = if has_top_level_await { "async " } else { "" };

    // Detect `generics` attribute on the script tag
    let script_tag_text = slice_src(source, script_start as usize, content_start as usize);
    let generics_param = extract_generics_from_script_tag(script_tag_text);
    let use_jsdoc_generics = options.emit_jsdoc && !options.is_ts_file;
    // For JS files emitting JSDoc, the generics live on a `/** @template T */`
    // line *before* `function $$render()`, not as `<T>` on the function.
    let template_comment = if use_jsdoc_generics {
        generics_param
            .as_ref()
            .filter(|g| !g.is_empty())
            .map(|g| format!("\n/** @template {g} */\n"))
            .unwrap_or_default()
    } else {
        String::new()
    };
    let render_generics = if !exported_names.dollar_generics.is_empty() {
        // Use $$Generic declarations (wrapped in ignore markers)
        exported_names.build_dollar_generics_str()
    } else if use_jsdoc_generics {
        // JSDoc-emit branch: keep render_generics empty; the `@template`
        // comment is emitted before the function declaration via
        // `template_comment`.
        String::new()
    } else {
        generics_param
            .as_ref()
            .map(|g| {
                if options.is_ts_file {
                    // TS files: no ignore markers around generics
                    format!("<{g}>")
                } else {
                    // JS files (non-JSDoc): wrap content in ignore markers
                    format!("</*\u{03A9}ignore_start\u{03A9}*/{g}>/*\u{03A9}ignore_end\u{03A9}*/")
                }
            })
            .unwrap_or_default()
    };

    let has_imports = !imports.is_empty();
    // With imports the `\n` separating the type alias from what precedes it
    // already comes from the last hoisted import; without them the alias has to
    // carry it.
    let type_decl_prefix = if has_imports { "" } else { "\n" };

    // Build $$ComponentProps type declaration for TS files
    //
    // Determine if the $$ComponentProps type must go INSIDE $$render
    // rather than before it. This is needed when the type references:
    // - `typeof x` (runtime value dependency on instance variables)
    // - generic type parameters from the `generics` attribute on <script>
    // - types that shadow module-level types
    let force_inside_render = exported_names.has_component_props_typedef()
        && exported_names.props_type_text.is_some()
        && !exported_names.type_already_inserted()
        && {
            let type_text = exported_names.props_type_text.as_ref().unwrap();
            // Check if type references an instance-local value via
            // `typeof` (an imported `typeof` stays hoistable).
            let has_typeof = type_text_typeof_references_local_value(
                type_text,
                &exported_names.instance_value_names,
                &exported_names.instance_import_names,
                &exported_names.module_import_names,
                &exported_names.module_value_names,
            );
            // Check if type references generics from $$render
            let has_generic_dep = !render_generics.is_empty()
                && generics_param.as_ref().is_some_and(|g| {
                    // Extract generic param names and check if any appear in the type
                    split_generic_param_names(g)
                        .iter()
                        .any(|name| type_text.contains(name.as_str()))
                });
            // Check if type references a type/interface name that is
            // declared at the top level of the instance script AND
            // *isn't* also slated for hoisting. References to a
            // hoisted type are fine — the hoisted declaration sits
            // above `function $$render()`, so referring to it from
            // a hoisted `$$ComponentProps` resolves correctly.
            let non_hoistable_instance_types: std::collections::HashSet<String> = exported_names
                .instance_type_names
                .difference(&exported_names.hoistable_instance_type_names)
                .cloned()
                .collect();
            let has_shadowed_type =
                type_text_references_any(type_text, &non_hoistable_instance_types);
            has_typeof || has_generic_dep || has_shadowed_type
        };

    let ts_component_props_before_render = if exported_names.has_component_props_typedef()
        && !exported_names.type_already_inserted()
        && !force_inside_render
        && let Some(type_text) = exported_names.props_type_text.as_ref()
    {
        format!("{type_decl_prefix};type $$ComponentProps =  {type_text};")
    } else {
        String::new()
    };

    // For best-effort auto-generated types, insert INSIDE $$render.
    //
    // If we have an explicit `props_let_abs_pos`, defer the insertion to
    // a `str.append_left` after the overwrite so the
    // `;type $$ComponentProps = ...;` lands right before the
    // `let { ... } = $props()` statement, matching the JS reference's
    // `preprendStr(node.parent.pos + astOffset, ...)` /
    // `move(generic_arg.pos, generic_arg.end, node.parent.pos)`.
    let inline_type_at_let = (force_inside_render || exported_names.type_already_inserted())
        && exported_names.props_let_abs_pos.is_some()
        && exported_names.props_type_text.is_some();
    let ts_component_props_inside_render = if (exported_names.type_already_inserted()
        || force_inside_render)
        && !inline_type_at_let
        && let Some(type_text) = exported_names.props_type_text.as_ref()
    {
        if force_inside_render {
            format!("\n;type $$ComponentProps =  {type_text};")
        } else {
            format!(
                "\n/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {type_text};/*\u{03A9}ignore_end\u{03A9}*/"
            )
        }
    } else {
        String::new()
    };

    // Build the <script> replacement, split into two parts so that
    // module-hoistable snippets and types can be moved into the gap:
    //   Part A: `;\n[\n if module]<imports>`
    //   Part B: `<before_render_type><async_prefix>function $$render(){...`
    //
    // The synthesised `;type $$ComponentProps = ...;` lives in part_b
    // (not part_a) so it lands AFTER any hoisted type/interface
    // declarations — `$$ComponentProps` may reference them, so it has
    // to appear after them in the output.
    // The hoisted imports are relocated chunks (see `lift_imports`), so
    // `part_a` only carries the `;` that replaces the `<` of `<script>`.
    let mut part_a = String::from(";");
    // When there are hoistable snippets and a $$ComponentProps typedef to
    // emit before $$render, the typedef must appear BEFORE the snippets in
    // the output (snippets are moved to `sp`, and `part_b` follows them) but
    // AFTER the hoisted imports — which are relocated chunks, so with imports
    // present the typedef has to ride along in the last one's outro instead of
    // sitting in `part_a`. A `\n` separator matches the blank line the JS
    // reference produces.
    let ts_component_props_in_part_a =
        !hoistable_snippet_ranges.is_empty() && !ts_component_props_before_render.is_empty();
    if ts_component_props_in_part_a && !has_imports {
        part_a.push('\n');
        part_a.push_str(&ts_component_props_before_render);
    }
    let trailing_newline = if ts_component_props_inside_render.is_empty() {
        "\n"
    } else {
        ""
    };
    // A hoisted type declaration is moved after the imports, so the `\n` that
    // `type_decl_prefix` leaves to the last import no longer sits next to the
    // alias — put it back here.
    let part_b_prefix = if has_imports
        && !exported_names.hoistable_type_ranges.is_empty()
        && !ts_component_props_before_render.is_empty()
        && !ts_component_props_in_part_a
    {
        "\n"
    } else {
        ""
    };
    let part_b_component_props = if ts_component_props_in_part_a {
        ""
    } else {
        &ts_component_props_before_render
    };
    let part_b = format!(
        "{part_b_prefix}{part_b_component_props}{template_comment}{async_prefix}function $$render{render_generics}() {{{dollar_decls}{ts_component_props_inside_render}{trailing_newline}"
    );

    // Split position: right after the `<` of `<script>`. This matches
    // the JS reference's `scriptTag.start + 1`, so moved chunks land
    // between the `;` (from the `<` overwrite) and the function
    // declaration that replaces the rest of the script tag. The JS
    // reference always splits there (`overwrite(start, start + 1, ';')`
    // then `overwrite(start + 1, scriptTagEnd, …)`).
    let split_pos = if content_start > script_start + 1 {
        Some(script_start + 1)
    } else {
        None
    };
    if let Some(sp) = split_pos {
        if script_start < sp {
            str.overwrite(script_start, sp, &part_a);
        }
        // Imports move first: the JS reference relocates them during the
        // instance-script walk, before the type/interface hoists, and each
        // `move` lands before the chunk that still starts at `sp` — so the
        // relocation order is the output order.
        lift_imports(imports, source, content_start, sp, has_module_script, str);
        if ts_component_props_in_part_a && let Some(last) = imports.last() {
            str.append_left_fmt(
                content_start + last.end,
                format_args!("\n{ts_component_props_before_render}"),
            );
        }
        // Move hoistable type/interface declarations first so they
        // sit BEFORE the snippets in the chunk list, matching the JS
        // reference's `scriptTag.start + 1` ordering.
        //
        // The chunk starts one line break into its leading trivia (see
        // `resolve_hoistable_type_decls`), so the `;\n` intro restores the
        // break the chunk gave up; the trailing `;` mirrors
        // `appendLeft(node.end, ';')` from the JS reference so the
        // declaration is statement-terminated.
        // Preserve the promotion (topological) order produced by
        // `resolve_hoistable_type_decls`, which mirrors the JS
        // reference's `Map` insertion order: a dependency is moved
        // BEFORE the interface that depends on it, even when it appears
        // later in source. Sorting by start position would wrongly
        // restore source order.
        for &(s, e) in &exported_names.hoistable_type_ranges {
            if s < e && (e as usize) <= source.len() {
                // `prepend_right` / `append_left` add to the moved
                // chunk itself (intro / outro of the [s..e] chunk),
                // so the `;` markers travel with the chunk to its
                // hoist target — `prepend_left` would leave the
                // semicolon stranded at the original location.
                str.prepend_right(s, ";\n");
                str.append_left(e, ";");
                str.move_range(s, e, sp);
            }
        }
        // Move the inline type arg from `$props<{ ... }>()` to the hoist target.
        // `\ntype $$ComponentProps = ` and `;` were already added via
        // `prepend_right`/`append_left` in `apply_props_typedef`.
        // Mirrors upstream's `moveHoistableInterfaces` for `$$ComponentProps`.
        if let Some((s, e)) = exported_names.props_type_arg_hoist
            && s < e
            && (e as usize) <= source.len()
        {
            str.move_range(s, e, sp);
        }
        // Move `$$Generic<X>`-referenced types. Mirrors the JS
        // reference's `nodesToMove` path (`moveNode`) — uses
        // `node.getStart()` (no leading trivia) and ends the chunk
        // with `\n` so the following text in `part_b` (`function
        // $$render`) starts on its own line.
        // `hoist_dollar_generic_referenced_types` filters the source-ordered
        // candidate list, matching upstream `InterfacesAndTypes.all.filter`.
        for &(s, e) in &exported_names.dollar_generic_referenced_ranges {
            if s < e && (e as usize) <= source.len() {
                str.prepend_right(s, "\n");
                str.append_left(e, "\n");
                str.move_range(s, e, sp);
            }
        }
        for (s, e) in hoistable_snippet_ranges {
            str.move_range(*s, *e, sp);
        }
        str.overwrite(sp, content_start, &part_b);
    } else if script_start < content_start {
        str.overwrite_fmt(
            script_start,
            content_start,
            format_args!("{part_a}{part_b}"),
        );
    }

    if inline_type_at_let
        && let (Some(let_pos), Some(type_text)) = (
            exported_names.props_let_abs_pos,
            exported_names.props_type_text.as_ref(),
        )
    {
        let decl = if force_inside_render {
            format!(";type $$ComponentProps =  {type_text};")
        } else {
            // type_already_inserted (auto-generated SvelteKit / fallback type).
            // JS reference wraps in surroundWithIgnoreComments.
            format!(
                "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {type_text};/*\u{03A9}ignore_end\u{03A9}*/"
            )
        };
        // The JS reference relocates the annotation itself, so the alias is a
        // moved chunk that lands before the snippets moved to the same index
        // later. Only a props declaration that opens the script shares an index
        // with them; there `append_left` reproduces that order by riding the
        // `function $$render() {` chunk's outro. Anywhere else `append_right` is
        // required, so the alias stays behind when the import ending at
        // `let_pos` is hoisted away.
        if let_pos == content_start {
            str.append_left(let_pos, &decl);
        } else {
            str.append_right(let_pos, &decl);
        }
    }

    // Overwrite `</script>` with slot declaration + `async () => {`.
    //
    // In DTS mode the JS reference skips `slotsDeclaration` entirely
    // (`slots.size > 0 && mode !== 'dts' ? ... : ''`) — the .d.ts output
    // doesn't need runtime slot helpers, so the createSlot binding would
    // just be dead code.
    if content_end < script_end {
        let emit_slot_decl = has_slot_elements && !matches!(options.mode, Svelte2TsxMode::Dts);
        if emit_slot_decl {
            let slot_generic = if exported_names.has_slots_type() {
                "<$$Slots>"
            } else {
                ""
            };
            str.overwrite_fmt(
                content_end,
                script_end,
                format_args!(
                    "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot{slot_generic}();/*\u{03A9}ignore_end\u{03A9}*/;\nasync () => {{"
                ),
            );
        } else {
            str.overwrite(content_end, script_end, ";\nasync () => {");
        }
    }

    // NOTE: the trailing whitespace after `</script>` is intentionally
    // left in place. Official svelte2tsx's `createRenderFunction` overwrites
    // only `</script>` itself and then `str.append('};')` + the return
    // string at the very end, leaving the source's trailing newline between
    // `async () => {` and the closing `};`. For a template-less component
    // that yields `async () => {\n};`; blanking the newline here produced
    // `async () => {};`, which diverged for the await-error fixtures whose
    // output oxfmt cannot reformat (so only blank-line stripping applies).

    has_top_level_await
}

/// Hoist the instance script's top-level imports above `$$render()` by
/// *relocating* their source ranges — mirrors `moveNode` +
/// `handleFirstInstanceImport`. Moving (rather than copying the text and
/// blanking the original) is what keeps a source-map segment on every hoisted
/// character, so a diagnostic on an import resolves back to its real line.
fn lift_imports(
    imports: &[LiftedImport],
    source: &str,
    content_start: u32,
    hoist_target: u32,
    has_module_script: bool,
    str: &mut MagicString<'_>,
) {
    let (Some(first), Some(last)) = (imports.first(), imports.last()) else {
        return;
    };

    for import in imports {
        let start = content_start + import.start;
        let end = content_start + import.end;

        if import.new_group
            && !import
                .comments
                .iter()
                .any(|comment| comment.has_trailing_newline)
        {
            str.append_right(start, "\n");
        }
        for comment in &import.comments {
            let comment_end = content_start + comment.end;
            str.move_range(content_start + comment.start, comment_end, hoist_target);
            if comment.has_trailing_newline {
                append_newline_to_last_char(str, source, comment_end);
            }
        }
        str.move_range(start, end, hoist_target);
        append_newline_to_last_char(str, source, end);
    }

    // Separate the hoisted block from the `;` that replaced `<`, and from a
    // preceding module script.
    let anchor = match first.comments.first() {
        Some(comment) if comment.block => comment.start,
        _ => first.start,
    };
    str.append_right(
        content_start + anchor,
        if has_module_script {
            "\n\n"
        } else if first.nested {
            ""
        } else {
            "\n"
        },
    );

    // Terminate the last import so auto-imports and completions don't attach to
    // the generated code that follows it.
    let last_end = content_start + last.end;
    let (last_char_start, last_char) = last_char_of(source, last_end);
    if last_char != ";" {
        str.overwrite_fmt(last_char_start, last_end, format_args!("{last_char};\n"));
    }
}

/// `moveNode`'s `overwrite(end - 1, end, original[end - 1] + '\n')`: the
/// newline has to sit inside the moved chunk so it travels with it.
fn append_newline_to_last_char(str: &mut MagicString<'_>, source: &str, end: u32) {
    let (last_char_start, last_char) = last_char_of(source, end);
    str.overwrite_fmt(last_char_start, end, format_args!("{last_char}\n"));
}

fn last_char_of(source: &str, end: u32) -> (u32, &str) {
    let mut start = end as usize - 1;
    while !source.is_char_boundary(start) {
        start -= 1;
    }
    (
        u32::try_from(start).expect("script offset fits in u32"),
        &source[start..end as usize],
    )
}
