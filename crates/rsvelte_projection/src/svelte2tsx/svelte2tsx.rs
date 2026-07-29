//! Main entry point for svelte2tsx conversion.
//!
//! Converts Svelte component source files into TypeScript/TSX for type checking.
//! This is a Rust port of the `svelte2tsx` package used by the Svelte language server.

use crate::compiler::phases::phase1_parse::{self, ParseOptions};
use sourcemap::SourceMapBuilder;

use super::add_component_export::{ComponentExportParams, add_component_export};
use super::create_render_function::{build_dollar_declarations, create_render_function};
use super::helpers::rewrite_external_imports::{TextEdit, rewrite_external_specifiers_in_text};
use super::magic_string::{GenerateMapOptions, MagicString};
use super::nodes::component_name::derive_component_name;
use super::nodes::generics::{extract_generics_from_script_tag, split_generic_param_names};
use super::nodes::runes_detection::{
    detect_await_in_template, detect_rune_global_in_template, detect_runes_mode,
};
use super::nodes::scripts::find_script_close_tag_start;
use super::nodes::slot::fragment_has_slot_element;
use super::nodes::snippet_hoisting::hoist_top_level_snippets;
use super::nodes::svelte_options::emit_svelte_options_element;
use super::process_instance_script_tag::process_instance_script_tag;
use super::script::{ComponentEvents, ExportedNames, StoreScanContext};
use super::template;
use super::utils::htmlxparser::{blank_style_content, blank_style_tags, remove_orphan_scripts};
use super::validation::{validate_debug_tag_arguments, validate_meta_element_placement};

pub use super::interfaces::{
    RewriteExternalImportsOptions, Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions,
    Svelte2TsxResult, SvelteVersion,
};
pub use super::utils::error::Svelte2TsxError;

/// Slice `source` by AST byte offsets, returning `""` when the range is absent,
/// inverted (`start > end`), out of bounds (`end > source.len()`), or not on a
/// UTF-8 char boundary — instead of panicking. For any valid range this is
/// exactly `&source[start..end]`, so it is byte-parity-preserving.
#[inline]
pub(crate) fn slice_src(source: &str, start: usize, end: usize) -> &str {
    source.get(start..end).unwrap_or("")
}

#[derive(Debug, Clone, Copy)]
struct PositionedTextEdit {
    raw: TextEdit,
    line: u32,
    start_col: u32,
    end_col: u32,
}

fn generated_location(text: &str, offset: u32) -> Result<(u32, u32), String> {
    let offset = offset as usize;
    if offset > text.len() || !text.is_char_boundary(offset) {
        return Err(format!(
            "external-import rewrite offset {offset} is not a generated-text boundary"
        ));
    }
    let prefix = &text[..offset];
    let line = prefix.bytes().filter(|byte| *byte == b'\n').count() as u32;
    let line_start = prefix.rfind('\n').map_or(0, |index| index + 1);
    let column = text[line_start..offset].encode_utf16().count() as u32;
    Ok((line, column))
}

fn position_text_edits(code: &str, edits: &[TextEdit]) -> Result<Vec<PositionedTextEdit>, String> {
    edits
        .iter()
        .map(|&raw| {
            let (line, start_col) = generated_location(code, raw.start)?;
            let (end_line, end_col) = generated_location(code, raw.end)?;
            if line != end_line {
                return Err("external-import rewrite unexpectedly spans lines".to_string());
            }
            Ok(PositionedTextEdit {
                raw,
                line,
                start_col,
                end_col,
            })
        })
        .collect()
}

fn remap_generated_column(line: u32, column: u32, edits: &[PositionedTextEdit]) -> Option<u32> {
    let mut remapped = i64::from(column);
    for edit in edits.iter().filter(|edit| edit.line == line) {
        if column >= edit.start_col && column < edit.end_col {
            return None;
        }
        if column >= edit.end_col {
            remapped += i64::from(edit.raw.replacement_utf16_len)
                - i64::from(edit.end_col - edit.start_col);
        }
    }
    u32::try_from(remapped).ok()
}

fn remap_source_map(source_map: &str, code: &str, edits: &[TextEdit]) -> Result<String, String> {
    if edits.is_empty() {
        return Ok(source_map.to_string());
    }
    let positioned = position_text_edits(code, edits)?;
    let original = sourcemap::SourceMap::from_slice(source_map.as_bytes())
        .map_err(|error| format!("failed to decode generated source map: {error}"))?;
    let mut builder = SourceMapBuilder::new(original.get_file());

    let ignored_sources: Vec<u32> = original.ignore_list().copied().collect();
    for source_id in 0..original.get_source_count() {
        let Some(source) = original.get_source(source_id) else {
            continue;
        };
        let remapped_id = builder.add_source(source);
        builder.set_source_contents(remapped_id, original.get_source_contents(source_id));
        if ignored_sources.contains(&source_id) {
            builder.add_to_ignore_list(remapped_id);
        }
    }

    for token in original.tokens() {
        let Some(dst_col) =
            remap_generated_column(token.get_dst_line(), token.get_dst_col(), &positioned)
        else {
            continue;
        };
        builder.add(
            token.get_dst_line(),
            dst_col,
            token.get_src_line(),
            token.get_src_col(),
            token.get_source(),
            token.get_name(),
            token.is_range(),
        );
    }

    // Replacement text is not byte-exact source, but diagnostics inside a
    // rewritten specifier still belong to the original specifier. Anchor each
    // replacement start to the source token that covered the old start.
    for edit in &positioned {
        let Some(source_token) = original.lookup_token(edit.line, edit.start_col) else {
            continue;
        };
        let Some(dst_col) = remap_generated_column(edit.line, edit.end_col, &positioned)
            .and_then(|end| end.checked_sub(edit.raw.replacement_utf16_len))
        else {
            continue;
        };
        builder.add(
            edit.line,
            dst_col,
            source_token.get_src_line(),
            source_token.get_src_col(),
            source_token.get_source(),
            source_token.get_name(),
            source_token.is_range(),
        );
    }

    let mut encoded = Vec::new();
    builder
        .into_sourcemap()
        .to_writer(&mut encoded)
        .map_err(|error| format!("failed to encode rewritten source map: {error}"))?;
    String::from_utf8(encoded)
        .map_err(|error| format!("rewritten source map was not UTF-8: {error}"))
}

fn remap_generated_boundary(offset: u32, edits: &[TextEdit]) -> Option<u32> {
    let mut remapped = i64::from(offset);
    for edit in edits {
        if edit.end <= offset {
            remapped += i64::from(edit.replacement_len) - i64::from(edit.end - edit.start);
        }
    }
    u32::try_from(remapped).ok()
}

fn remap_forward_segments(
    segments: Vec<(u32, u32, u32)>,
    edits: &[TextEdit],
) -> Vec<(u32, u32, u32)> {
    if edits.is_empty() {
        return segments;
    }
    let mut remapped = Vec::with_capacity(segments.len());
    for (source_start, source_end, generated_start) in segments {
        let generated_end = generated_start + source_end - source_start;
        let mut cursor = generated_start;
        for edit in edits {
            if edit.end <= cursor || edit.start >= generated_end {
                continue;
            }
            let unchanged_end = edit.start.min(generated_end);
            if cursor < unchanged_end {
                let source_part_start = source_start + cursor - generated_start;
                let source_part_end = source_start + unchanged_end - generated_start;
                if let Some(post_start) = remap_generated_boundary(cursor, edits) {
                    remapped.push((source_part_start, source_part_end, post_start));
                }
            }
            cursor = cursor.max(edit.end.min(generated_end));
        }
        if cursor < generated_end {
            let source_part_start = source_start + cursor - generated_start;
            if let Some(post_start) = remap_generated_boundary(cursor, edits) {
                remapped.push((source_part_start, source_end, post_start));
            }
        }
    }
    remapped
}

/// Convert a Svelte component source to TypeScript/TSX for type checking.
///
/// This is the main entry point for the svelte2tsx module. It:
/// 1. Parses the Svelte source using the existing parser
/// 2. Processes the template nodes to generate TSX element expressions
/// 3. Processes script blocks to extract exports, props, and events
/// 4. Wraps everything in a `$$render()` function and component class/const export
///
/// # Arguments
///
/// * `source` - The Svelte component source code
/// * `options` - Conversion options (filename, mode, version, etc.)
///
/// # Returns
///
/// A `Svelte2TsxResult` containing the generated TypeScript code and metadata.
///
/// # Example
///
/// ```rust,ignore
/// use rsvelte_projection::svelte2tsx::{svelte2tsx, Svelte2TsxOptions};
///
/// let source = "<h1>Hello</h1>";
/// let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
/// println!("{}", result.code);
/// ```
pub fn svelte2tsx(
    source: &str,
    options: Svelte2TsxOptions,
) -> Result<Svelte2TsxResult, Svelte2TsxError> {
    // Step 1: Parse the Svelte source using the existing parser.
    //
    // Blank out `<style>` CONTENT before parsing (equal-length, newlines kept,
    // so every AST offset still lines up with the original `source`). svelte2tsx
    // does the same (utils/htmlxparser.ts: "Svelte tries to parse style/script
    // tags which doesn't play well with typescript, so we blank them out") — the
    // CSS is irrelevant to the TSX output (it's dropped anyway), and parsing it
    // would surface CSS-only errors (e.g. doc placeholders like `div { ... }`)
    // that the official tool never sees, breaking error-parity. The `<script>`
    // is NOT blanked — rsvelte needs it (it processes the instance script from
    // the parsed AST, unlike svelte2tsx which re-parses scripts separately).
    let parse_source = blank_style_content(source);
    // svelte2tsx parses SCRIPT content TS-aware regardless of `lang="ts"` (like
    // official svelte2tsx on acorn-typescript) — so TS-only script syntax such as
    // `let x: typeof C<any>` doesn't fail the parse, while genuine script syntax
    // errors are still reported. Template expressions (snippet params, mustaches)
    // stay lang-respecting, so a TS-typed snippet param without `lang="ts"` still
    // errors like official.
    let parse_options = ParseOptions {
        modern: true,
        loose: false,
        skip_expression_loc: false,
        defer_script_parse: true,
        force_typescript: false,
        lenient_script: false,
        skip_non_css_lang_style: false,
        capture_comments: false,
    };
    let mut ast = phase1_parse::parse_script_ts(&parse_source, parse_options)?;
    let parsed_scripts = super::script::ParsedScripts::new(&mut ast);

    // svelte rejects `{@debug expr}` whose arguments are not plain identifiers
    // (`{@debug user.firstname}` / `{@debug a[0]}`) at PARSE time. rsvelte does
    // this in the analyze DebugTag visitor, which svelte2tsx never runs — so
    // replicate it here to preserve error-parity with official svelte2tsx.
    let (has_debug_marker, has_meta_marker) = validation_markers(source);
    if has_debug_marker {
        validate_debug_tag_arguments(&ast, source)?;
    }
    if has_meta_marker {
        validate_meta_element_placement(&ast, source)?;
    }

    // Step 2: Determine component name from filename
    let component_name = derive_component_name(&options.filename);

    // Step 3: Detect runes mode (preliminary check from svelte:options)
    let explicit_runes = options.runes.unwrap_or_else(|| detect_runes_mode(&ast));

    // Step 4: Create the MagicString for in-place source manipulation
    let mut str = MagicString::new(source);

    // Step 5: Initialize tracking structures
    let mut exported_names = ExportedNames::new();
    let mut events = ComponentEvents::new();
    let mut store_scan = StoreScanContext::new(source, ast.module.is_some());

    if explicit_runes {
        exported_names.set_uses_runes(true);
    }

    // Step 6: Process module script (<script context="module">)
    if let (Some(module), Some(parsed)) = (&ast.module, &parsed_scripts.module) {
        super::script::process_module_script(
            module,
            parsed,
            &mut store_scan,
            &mut str,
            &mut exported_names,
        );
    }

    // Step 7: Process instance script (<script>)
    let basename = std::path::Path::new(&options.filename)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_string();
    let script_generic_names: std::collections::HashSet<String> = ast
        .instance
        .as_ref()
        .map(|instance| {
            let tag_text = slice_src(
                source,
                instance.start as usize,
                instance.content_offset as usize,
            );
            extract_generics_from_script_tag(tag_text)
        })
        .unwrap_or_default()
        .map(|raw| {
            split_generic_param_names(&raw)
                .into_iter()
                .collect::<std::collections::HashSet<String>>()
        })
        .unwrap_or_default();
    if let (Some(instance), Some(parsed)) = (&ast.instance, &parsed_scripts.instance) {
        super::script::process_instance_script(
            instance,
            parsed,
            parsed_scripts
                .module
                .as_ref()
                .map(|script| script.program()),
            source,
            &mut store_scan,
            &mut str,
            &mut exported_names,
            &mut events,
            options.is_ts_file,
            &basename,
            options.emit_jsdoc,
            matches!(options.mode, Svelte2TsxMode::Dts),
            &script_generic_names,
        );
    }

    // Step 7.4: Detect `{await expr}` in template expression tags.
    // Await-in-template forces runes mode (async template expressions are
    // Svelte 5 runes-only).
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
    //   `isRunes` doc: "True if uses runes or top level await or await in template expressions"
    if detect_await_in_template(&ast, source) {
        exported_names.set_uses_runes(true);
    }

    // Step 7.45: Detect `$state`/`$derived`/`$effect` rune-globals in TEMPLATE expressions.
    //
    // Official rule: `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
    // (svelte2tsx/index.ts) — `implicitStoreValues` collects ALL accessed undeclared
    // globals across the entire component INCLUDING template expressions.
    // `checkGlobalsForRunes` (svelte2tsx/nodes/ExportedNames.ts ~line 878–881) sets
    // `hasRunesGlobals = isSvelte5Plus && globals.some(g =>
    // ['$state','$derived','$effect'].includes(g))`.
    //
    // A component with NO `<script>` but with e.g. `aria-current={$state.eager(pathname) === '/'
    // ? 'page' : null}` is therefore RUNES (because `$state` is an undeclared global
    // referenced in the template).  rsvelte's instance-script scanner never runs for
    // template-only components, so we need to walk the template AST here.
    if detect_rune_global_in_template(&ast, source, &exported_names.instance_value_names) {
        exported_names.set_uses_runes(true);
    }

    // Step 7.48: Find and remove embedded `<script>` tags (those NOT matching
    // the top-level instance / module script). Mirrors official svelte2tsx's
    // `blankOtherScriptTags` / `str.move` approach.
    //
    // Background: official svelte2tsx extracts ALL `<script>…</script>` from
    // the source (including those inside attribute values such as
    // `<noscript><a href="</noscript><script>…</script>">`) using a regex. It
    // then treats the first top-level one as the instance script and *moves* it
    // to the top. Non-top-level scripts are *removed* from the MagicString via
    // `blankOtherScriptTags`. The move / remove of the original range causes
    // any attribute value whose source span covers that range to be truncated
    // when emitted from the MagicString — giving `href: \`</noscript>\`` instead
    // of the full `href: \`</noscript><script>…</script>\``.
    //
    // For rsvelte: when the embedded script is the ONLY script in the file
    // (i.e. no top-level instance / module scripts), we replicate the
    // `processInstanceScriptContent` effect by:
    //  1. Removing the script tag from the MagicString so attribute values that
    //     overlap its range are automatically truncated in the output.
    //  2. Prepending the raw content to the render function body.
    // When a top-level instance script already exists, the embedded script's
    // content is simply dropped (it's an anomalous/malformed template that the
    // official tool also handles inconsistently).
    //
    // Narrow-scan approach: scan the source for `<script>…</script>` that
    // - is NOT the top-level instance/module script position, and
    // - is NOT a RegularElement "script" node anywhere in the fragment AST, and
    // - is NOT inside a HtmlTag (@html) node range.
    // Such "orphan" scripts sit inside attribute values or template-literal
    // expressions that the Svelte parser did not turn into element/script nodes.
    // Overwriting their range with "" in the MagicString causes any attribute
    // whose source span covers that range to be automatically truncated.
    let embedded_script_content = remove_orphan_scripts(&ast, source, &mut str);

    // Step 7.5: Slot detection from the AST (NOT a source substring scan — a
    // naive `source.contains("<slot")` matches `<slot>` inside string literals
    // such as a custom element's `shadowRoot.innerHTML = '…<slot>…'`, which are
    // not real template slots). Official emits the `__sveltets_createSlot`
    // helper / treats the component as slotted only for real `<slot>` elements.
    let has_slot_elements = fragment_has_slot_element(&ast.fragment);

    // Step 7.6: Process <svelte:options> tag as a createElement call
    // The parser stores svelte:options in ast.options (not in fragment.nodes),
    // so we need to handle it separately.
    emit_svelte_options_element(&ast, source, &mut str);

    // Step 8: Blank out <style> tag (CSS is not relevant for TSX type checking)
    blank_style_tags(&ast, source, &mut str);

    // Step 8.5: Detect $$props, $$restProps, $$slots usage in source (before wrapping)
    let uses_dollar_props = source.contains("$$props");
    let uses_dollar_rest_props = source.contains("$$restProps");
    let uses_dollar_slots = source.contains("$$slots");

    // Step 9: Process template nodes in-place via MagicString. Publish the
    // element-opener comment ranges first so attribute emission can re-attach
    // them as leading comments (mirrors official `attr.leadingComments`).
    template::set_element_opener_comments(ast.comments.iter().map(|c| (c.start, c.end)).collect());
    template::process_template_inplace(&ast.fragment, source, &options, &mut str);
    template::clear_element_opener_comments();

    // Step 9.1: Hoist top-level `{#snippet}` blocks.
    //
    // Two destinations:
    // - **Outside `$$render` (module-level)** — when the source has a
    //   `<script context="module">` AND the snippet body's free variables only
    //   reference module-script bindings, imports, params, or globals. Matches
    //   the JS reference's `hoist_to_module` branch in `index.ts`.
    // - **Inside `$$render` (top of body)** — the default for snippets that
    //   close over instance-script values, or when there's no module script.
    //
    // The "outside" target is `script_tag_close_pos = instance.content_offset - 1`,
    // i.e. the byte position of the `>` of `<script>`. The script-tag overwrite
    // in Step 10 is split there so the moved snippet chunks land between the
    // imports / `;type` block and the `function $$render() {` declaration.
    let hoistable_snippet_ranges =
        hoist_top_level_snippets(&ast, source, &exported_names, &mut str);

    // Step 9.5: Collect slot and event information from the template
    let template_info = template::collect_template_info(&ast.fragment, source);

    // Step 10: Wrap in $$render() and add component export
    //
    // The JS svelte2tsx moves the script tag to position 0 (or after module script),
    // then overwrites <script> and </script> with the function wrapper.
    // We replicate this by:
    //   - Moving the script to position 0 if needed
    //   - Overwriting the <script> opening tag with `;function $$render() {\n`
    //   - Overwriting </script> with `;\nasync () => {`
    //   - For template-only components, prepending the wrapper

    // Detect malformed script close tag (e.g. `</script   >` with whitespace
    // before `>`). The official svelte2tsx uses a regex that requires an exact
    // `</script>` close tag; when the close tag has whitespace the regex does
    // not match, so official treats the whole component as having no instance
    // script and includes the raw `<script>…</script   >` text inside the async
    // template body. Mirror that by clearing `ast.instance` for this case so
    // the no-script path is used. The detection criterion is: the script range
    // does NOT contain the exact ASCII string `</script>` (case-insensitive).
    let has_instance_script = ast.instance.as_ref().is_some_and(|inst| {
        let slice = slice_src(source, inst.start as usize, inst.end as usize);
        slice
            .as_bytes()
            .windows(9)
            .any(|w| w.eq_ignore_ascii_case(b"</script>"))
    });
    let has_module_script = ast.module.is_some();

    // Tracks whether the instance script contains a top-level `await`
    // (i.e. an await expression that is not inside any function or arrow body).
    // Set inside the `if has_instance_script` block below; consulted by the
    // export-assembly section further down.
    // Reference: createRenderFunction.ts (async keyword on $$render) and
    //            addComponentExport.ts (`renderCall` / `awaitDeclaration`).
    let mut has_top_level_await = false;

    // Determine the target position for the instance script.
    // If there's a module script, the instance script goes after it.
    let mut instance_script_target: u32 = 0;

    // IMPORTANT: All overwrites on script tag chunks must happen BEFORE any
    // move_range calls. MagicString.overwrite walks the linked list and after
    // a move, chunks from other parts of the source can appear between the
    // start and end positions, causing them to be blanked out.

    // Phase 1: Overwrite module script tags with `;` (before any moves)
    if has_module_script {
        let module = ast.module.as_ref().unwrap();
        let mod_start = module.start;
        let mod_end = module.end;
        let mod_content_start = module.content_offset;
        let mod_content_end = find_script_close_tag_start(source, mod_end);

        // Overwrite <script context="module"> with `;`
        if mod_start < mod_content_start {
            str.overwrite(mod_start, mod_content_start, ";");
        }

        // Overwrite </script> with `;`
        if mod_content_end < mod_end {
            str.overwrite(mod_content_end, mod_end, ";");
        }

        // When module is already at 0, instance goes right after it.
        // When module will be moved to 0, instance also goes to 0 (module
        // will be moved after instance, ending up before it).
        if mod_start == 0 {
            instance_script_target = mod_end;
        }
    }

    // Build $$props/$$restProps/$$slots declaration text for injection into $$render() header
    let dollar_decls = build_dollar_declarations(
        &ast,
        uses_dollar_props,
        uses_dollar_rest_props,
        uses_dollar_slots,
    );

    // Detect generics attribute from the script tag (available for component export)
    let mut generics_attribute: Option<String> = None;
    if has_instance_script {
        let instance = ast.instance.as_ref().unwrap();
        let script_tag_text = slice_src(
            source,
            instance.start as usize,
            instance.content_offset as usize,
        );
        generics_attribute = extract_generics_from_script_tag(script_tag_text);
    }

    // Phase 2: Overwrite instance script tags and lift imports. Split into its
    // own module, but it must still run before Phase 3's moves — see the
    // ordering note above Phase 1.
    if has_instance_script {
        has_top_level_await = process_instance_script_tag(
            &ast,
            parsed_scripts
                .instance
                .as_ref()
                .expect("instance script")
                .program(),
            source,
            &options,
            &mut str,
            &mut exported_names,
            &dollar_decls,
            has_module_script,
            has_slot_elements,
            &hoistable_snippet_ranges,
        );
    }

    // Phase 3: Move scripts to their target positions (after all overwrites)
    //
    // The target layout is: module script → instance script → template
    //
    // We must move instance FIRST, then module. When both move to position 0,
    // the second move (module) goes before the first (instance), giving the
    // correct ordering: module → instance → rest.
    if has_instance_script {
        let instance = ast.instance.as_ref().unwrap();
        let script_start = instance.start;
        let script_end = instance.end;

        if script_start != instance_script_target {
            str.move_range(script_start, script_end, instance_script_target);
        }
    }

    if has_module_script {
        let module = ast.module.as_ref().unwrap();
        let mod_start = module.start;
        let mod_end = module.end;

        if mod_start > 0 {
            str.move_range(mod_start, mod_end, 0);
        }
    }

    create_render_function(
        &ast,
        parsed_scripts
            .module
            .as_ref()
            .map(|script| script.program()),
        source,
        &mut store_scan,
        &options,
        &mut str,
        &dollar_decls,
        has_instance_script,
        has_module_script,
        has_slot_elements,
        &hoistable_snippet_ranges,
        &embedded_script_content,
    );
    drop(parsed_scripts);

    let closing = add_component_export(
        ComponentExportParams {
            ast: &ast,
            source,
            options: &options,
            component_name: &component_name,
            template_info: &template_info,
            exported_names: &exported_names,
            events: &mut events,
            generics_attribute: generics_attribute.as_deref(),
            has_slot_elements,
            has_top_level_await,
            uses_dollar_props,
            uses_dollar_rest_props,
        },
        &mut str,
    );

    str.append_str(&closing);

    let source_map = str
        .generate_map(GenerateMapOptions {
            file: None,
            source: Some(options.filename.clone()),
            include_content: false,
        })
        .to_json();
    let forward_map = str.forward_segments();
    let code = str.to_string();

    // Final post-pass: rewrite `../`-relative import specifiers in the
    // assembled output. We apply this here (rather than as a pre-pass on
    // the source) because earlier overwrites — e.g. opening-tag rewrites
    // for `<button onclick={() => import('...')}>` — replace whole ranges
    // wholesale and would otherwise mask any source-level rewrite.
    // Mirrors `helpers/rewriteExternalImports.ts` semantically; the AST
    // walk is unnecessary because we only target specifiers adjacent to
    // `from`/`import(` tokens.
    let (code, source_map, forward_map) =
        if let Some(ref rewrite_opts) = options.rewrite_external_imports {
            let rewrite = rewrite_external_specifiers_in_text(&code, rewrite_opts);
            let remapped_source_map = remap_source_map(&source_map, &code, &rewrite.edits)
                .map_err(Svelte2TsxError::Other)?;
            let remapped_forward_map = remap_forward_segments(forward_map, &rewrite.edits);
            (rewrite.code, remapped_source_map, remapped_forward_map)
        } else {
            (code, source_map, forward_map)
        };

    Ok(Svelte2TsxResult {
        code,
        map: Some(source_map),
        exported_names,
        events,
        forward_map,
    })
}

fn validation_markers(source: &str) -> (bool, bool) {
    let bytes = source.as_bytes();
    let mut has_debug = false;
    let mut has_meta = false;

    for index in memchr::memchr2_iter(b'@', b':', bytes) {
        match bytes[index] {
            b'@' => {
                if !has_debug {
                    has_debug =
                        index > 0 && bytes.get(index - 1..index + 6) == Some(b"{@debug".as_slice());
                }
            }
            b':' => {
                if !has_meta {
                    has_meta = (index >= 7
                        && bytes.get(index - 7..=index) == Some(b"<svelte:".as_slice()))
                        || (index >= 3 && bytes.get(index - 3..=index) == Some(b"use:".as_slice()));
                }
            }
            _ => unreachable!(),
        }
        if has_debug && has_meta {
            break;
        }
    }

    (has_debug, has_meta)
}

#[cfg(test)]
mod tests {
    use super::validation_markers;

    #[test]
    fn validation_markers_remain_set_after_unrelated_candidates() {
        assert_eq!(validation_markers("{@debug user.name} @"), (true, false));
        assert_eq!(
            validation_markers("<div><svelte:window /></div>:"),
            (false, true)
        );
    }
}
