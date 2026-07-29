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
use super::nodes::scripts::{
    detect_top_level_await, find_instance_imports, find_script_close_tag_start,
};
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
pub(crate) fn process_instance_script_tag(
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
            .map(|g| format!("\n/** @template {} */\n", g))
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
                    format!("<{}>", g)
                } else {
                    // JS files (non-JSDoc): wrap content in ignore markers
                    format!(
                        "</*\u{03A9}ignore_start\u{03A9}*/{}>/*\u{03A9}ignore_end\u{03A9}*/",
                        g
                    )
                }
            })
            .unwrap_or_default()
    };

    // Find import declarations in the instance script content
    let imports = find_instance_imports(instance, source, instance_program);

    let has_imports = !imports.is_empty();
    // Lift imports above $$render(): each import is collected individually
    // (without leading whitespace) and inserted into the <script> tag
    // replacement, with the original positions blanked out.
    let import_text = if has_imports {
        collect_lifted_imports(&imports, source, content_start, str)
    } else {
        String::new()
    };
    // With imports the `\n` separating the type alias from what precedes it
    // already comes from `import_text`; without them the alias has to carry it.
    let type_decl_prefix = if has_imports { "" } else { "\n" };

    // Build $$ComponentProps type declaration for TS files
    //
    // Determine if the $$ComponentProps type must go INSIDE $$render
    // rather than before it. This is needed when the type references:
    // - `typeof x` (runtime value dependency on instance variables)
    // - generic type parameters from the `generics` attribute on <script>
    // - types that shadow module-level types
    let force_inside_render = exported_names.has_component_props_typedef
        && exported_names.props_type_text.is_some()
        && !exported_names.type_already_inserted
        && {
            let type_text = exported_names.props_type_text.as_ref().unwrap();
            // Check if type references an instance-local value via
            // `typeof` (an imported `typeof` stays hoistable).
            let has_typeof = type_text_typeof_references_local_value(
                type_text,
                &exported_names.instance_value_names,
                &exported_names.instance_import_names,
                &exported_names.module_import_names,
            );
            // Check if type references generics from $$render
            let has_generic_dep = !render_generics.is_empty()
                && generics_param
                    .as_ref()
                    .map(|g| {
                        // Extract generic param names and check if any appear in the type
                        split_generic_param_names(g)
                            .iter()
                            .any(|name| type_text.contains(name.as_str()))
                    })
                    .unwrap_or(false);
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

    let ts_component_props_before_render = if exported_names.has_component_props_typedef
        && !exported_names.type_already_inserted
        && !force_inside_render
        && let Some(type_text) = exported_names.props_type_text.as_ref()
    {
        format!(
            "{};type $$ComponentProps =  {};",
            type_decl_prefix, type_text
        )
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
    let inline_type_at_let = (force_inside_render || exported_names.type_already_inserted)
        && exported_names.props_let_abs_pos.is_some()
        && exported_names.props_type_text.is_some();
    let ts_component_props_inside_render = if (exported_names.type_already_inserted
        || force_inside_render)
        && !inline_type_at_let
        && let Some(type_text) = exported_names.props_type_text.as_ref()
    {
        if force_inside_render {
            format!("\n;type $$ComponentProps =  {};", type_text)
        } else {
            format!(
                "\n/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                type_text
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
    // `import_text` provides its own leading `\n` (or absorbs it
    // into a leading-line-comment) — see the new-line accounting
    // above. `part_a` only carries the `;` (which replaces the `<`)
    // plus an extra `\n` when there is also a module script (mirrors
    // `'\n' + (hasModuleScript ? '\n' : '')` in
    // `handleFirstInstanceImport`).
    let mut part_a = String::from(";");
    if has_imports {
        if has_module_script {
            part_a.push('\n');
        }
        part_a.push_str(&import_text);
    }
    // When there are hoistable snippets and a $$ComponentProps typedef to
    // emit before $$render, the typedef must appear BEFORE the snippets in
    // the output. Because snippets are moved to `sp` (after `part_a`) and
    // `part_b` is placed after them, we append the typedef to `part_a` so
    // it lands between the imports and the snippets. A `\n` separator is
    // also added to match the blank line the JS reference produces.
    let ts_component_props_in_part_a =
        !hoistable_snippet_ranges.is_empty() && !ts_component_props_before_render.is_empty();
    if ts_component_props_in_part_a {
        part_a.push('\n');
        part_a.push_str(&ts_component_props_before_render);
    }
    let trailing_newline = if ts_component_props_inside_render.is_empty() {
        "\n"
    } else {
        ""
    };
    // When there's a hoistable type/interface, JS reference puts a
    // newline between the moved declaration and the synthesised
    // `;type $$ComponentProps = ...;function $$render() {` (which
    // sits in `ts_component_props_before_render`). Mirror that with
    // a `\n` prefix on part_b in that case.
    let part_b_prefix = if !exported_names.hoistable_type_ranges.is_empty()
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
        "{}{}{}{}function $$render{}() {{{}{}{}",
        part_b_prefix,
        part_b_component_props,
        template_comment,
        async_prefix,
        render_generics,
        dollar_decls,
        ts_component_props_inside_render,
        trailing_newline
    );

    let has_hoistable_chunks = !hoistable_snippet_ranges.is_empty()
        || !exported_names.hoistable_type_ranges.is_empty()
        || !exported_names.dollar_generic_referenced_ranges.is_empty()
        || exported_names.props_type_arg_hoist.is_some();
    // Split position: right after the `<` of `<script>`. This matches
    // the JS reference's `scriptTag.start + 1`, so moved chunks land
    // between the `;` (from the `<` overwrite) and the function
    // declaration that replaces the rest of the script tag.
    let split_pos = if has_hoistable_chunks && content_start > script_start + 1 {
        Some(script_start + 1)
    } else {
        None
    };
    if let Some(sp) = split_pos {
        if script_start < sp {
            str.overwrite(script_start, sp, &part_a);
        }
        // Move hoistable type/interface declarations first so they
        // sit BEFORE the snippets in the chunk list, matching the JS
        // reference's `scriptTag.start + 1` ordering.
        //
        // Each chunk already extends backward through the original
        // leading whitespace (see `resolve_hoistable_type_decls`),
        // so a single `;` prepend is enough — the chunk supplies
        // its own newline + indent, and the trailing `;` mirrors
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
                str.prepend_right(s, ";");
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
        for (s, e) in hoistable_snippet_ranges.iter() {
            str.move_range(*s, *e, sp);
        }
        str.overwrite(sp, content_start, &part_b);
    } else if script_start < content_start {
        str.overwrite(
            script_start,
            content_start,
            &format!("{}{}", part_a, part_b),
        );
    }

    if inline_type_at_let
        && let (Some(let_pos), Some(type_text)) = (
            exported_names.props_let_abs_pos,
            exported_names.props_type_text.as_ref(),
        )
    {
        let snippet = if force_inside_render {
            format!(";type $$ComponentProps =  {};", type_text)
        } else {
            // type_already_inserted (auto-generated SvelteKit / fallback type).
            // JS reference wraps in surroundWithIgnoreComments.
            format!(
                "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                type_text
            )
        };
        str.append_left(let_pos, &snippet);
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
            let slot_generic = if exported_names.has_slots_type {
                "<$$Slots>"
            } else {
                ""
            };
            let slot_decl = format!(
                "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot{}();/*\u{03A9}ignore_end\u{03A9}*/;",
                slot_generic
            );
            str.overwrite(
                content_end,
                script_end,
                &format!("{}\nasync () => {{", slot_decl),
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

/// Collect the instance script's top-level imports into the text that will be
/// spliced above `$$render()`, blanking each original `[leading comments .. import]`
/// span in `str`.
fn collect_lifted_imports(
    imports: &[(u32, u32, u32)],
    source: &str,
    content_start: u32,
    str: &mut MagicString<'_>,
) -> String {
    let mut import_text = String::new();
    for (i, &(comments_start, import_start_rel, import_end)) in imports.iter().enumerate() {
        let abs_comments_start = comments_start + content_start;
        let abs_import_start = import_start_rel + content_start;
        let abs_end = import_end + content_start;

        // Split into the leading comment region and the import
        // statement itself so they can be processed independently.
        // The JS reference (`utils/tsAst.ts::moveNode`) moves each
        // leading comment as its own chunk and drops the trivia
        // between them; for the first import,
        // `handleFirstInstanceImport` inserts an extra `\n` either
        // before a leading multiline comment or before the `import`
        // keyword.
        let comments_raw = slice_src(
            source,
            abs_comments_start as usize,
            abs_import_start as usize,
        );
        let import_raw = slice_src(source, abs_import_start as usize, abs_end as usize);

        // Collect leading comment lines while preserving block-comment
        // interior indentation verbatim.  The JS reference (`moveNode`)
        // uses `str.move()` which copies source text byte-for-byte, so
        // `/* … */` inner lines must retain their original leading spaces.
        // Only the opener line (`/*...`) is fully trimmed (leading indent
        // is dropped; trailing spaces after `/*` are stripped); all other
        // block-comment lines are preserved as-is.  Lines that are purely
        // whitespace outside a block comment are filtered out.
        let comment_lines: Vec<String> = {
            let mut lines: Vec<String> = Vec::new();
            let mut in_block = false;
            for line in comments_raw.lines() {
                if in_block {
                    // Preserve interior indentation verbatim.
                    if line.contains("*/") {
                        in_block = false;
                    }
                    lines.push(line.to_string());
                } else {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue; // skip whitespace-only lines
                    }
                    if trimmed.starts_with("/*") {
                        // Block-comment opener: trim fully so the
                        // leading indent and any trailing spaces after
                        // `/*` are dropped (e.g. `  /*  ` → `/*`).
                        in_block = !trimmed.contains("*/");
                        lines.push(trimmed.to_string());
                    } else {
                        // Line comment (`//`) or other: fully trim.
                        lines.push(trimmed.to_string());
                    }
                }
            }
            lines
        };

        // Was the last comment on the same line as the `import`
        // keyword? True when `comments_raw`'s final line is not
        // whitespace-only — e.g. `/*hi*/import X` keeps the comment
        // and the import on a single line.
        let last_comment_inline = !comments_raw.is_empty()
            && comments_raw
                .lines()
                .last()
                .is_some_and(|l| !l.trim().is_empty());

        let import_text_clean: String = import_raw
            .lines()
            .map(|line| line.trim_start())
            .collect::<Vec<_>>()
            .join("\n");

        // Preserve gap when this import is part of a separate group
        // (a blank line in the source between this import and the
        // previous one).
        if i > 0 {
            let prev_end = imports[i - 1].2 + content_start;
            let between = slice_src(source, prev_end as usize, abs_comments_start as usize);
            let newline_count = between.chars().filter(|&c| c == '\n').count();
            if newline_count >= 2 {
                import_text.push('\n');
            }
        }

        let first_comment_is_block = comment_lines.first().is_some_and(|c| c.starts_with("/*"));
        let needs_leading_newline = i == 0 && (comment_lines.is_empty() || first_comment_is_block);

        if needs_leading_newline {
            import_text.push('\n');
        }
        for (idx, line) in comment_lines.iter().enumerate() {
            import_text.push_str(line);
            let is_last = idx + 1 == comment_lines.len();
            if !(is_last && last_comment_inline) {
                import_text.push('\n');
            }
        }
        if i == 0 && !first_comment_is_block && !comment_lines.is_empty() {
            // `appendRight(firstImport.getStart(), '\n')` —
            // separating the trailing leading-line-comment from the
            // import keyword with an explicit blank line.
            import_text.push('\n');
        }

        import_text.push_str(&import_text_clean);

        // Add semicolon to the last import if it doesn't have one
        if i == imports.len() - 1 {
            // `.last()` avoids a `len() - 1` underflow when the cleaned
            // import text is empty (zero-length span edge case).
            if import_text_clean.as_bytes().last() != Some(&b';') {
                import_text.push_str(";\n");
            } else {
                import_text.push('\n');
            }
        } else {
            import_text.push('\n');
        }

        // Blank out the original [leading comments .. import] span.
        // The indentation before the comments stays because it's
        // outside the captured span.
        str.overwrite(abs_comments_start, abs_end, "");
    }

    import_text
}
