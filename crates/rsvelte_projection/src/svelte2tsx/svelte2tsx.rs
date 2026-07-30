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
use super::nodes::runes_detection::detect_runes_mode;
use super::nodes::scripts::find_script_close_tag_start;
use super::nodes::snippet_hoisting::hoist_top_level_snippets;
use super::nodes::svelte_options::emit_svelte_options_element;
use super::process_instance_script_tag::process_instance_script_tag;
use super::script::{ComponentEvents, ExportedNames, StoreScanContext};
use super::template;
use super::utils::htmlxparser::{blank_style_content, blank_style_tags, remove_orphan_scripts};
use super::utils::source_features::scan_source_features;
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

fn generated_offset(text: &str, offset: u32) -> Result<usize, String> {
    let offset = offset as usize;
    if offset > text.len() || !text.is_char_boundary(offset) {
        return Err(format!(
            "external-import rewrite offset {offset} is not a generated-text boundary"
        ));
    }
    Ok(offset)
}

fn advance_generated_location(text: &str, line: &mut u32, column: &mut u32) {
    for character in text.chars() {
        if character == '\n' {
            *line += 1;
            *column = 0;
        } else {
            *column += character.len_utf16() as u32;
        }
    }
}

fn position_text_edits(code: &str, edits: &[TextEdit]) -> Result<Vec<PositionedTextEdit>, String> {
    let mut positioned = Vec::with_capacity(edits.len());
    let mut cursor = 0;
    let mut line = 0;
    let mut column = 0;

    for &raw in edits {
        let start = generated_offset(code, raw.start)?;
        let end = generated_offset(code, raw.end)?;
        if start < cursor || end < start {
            return Err(
                "external-import rewrite edits are not ordered and non-overlapping".to_string(),
            );
        }

        advance_generated_location(&code[cursor..start], &mut line, &mut column);
        let edit_line = line;
        let start_col = column;
        advance_generated_location(&code[start..end], &mut line, &mut column);
        if line != edit_line {
            return Err("external-import rewrite unexpectedly spans lines".to_string());
        }
        positioned.push(PositionedTextEdit {
            raw,
            line: edit_line,
            start_col,
            end_col: column,
        });
        cursor = end;
    }

    Ok(positioned)
}

#[cfg(test)]
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

struct GeneratedColumnRemapper<'a> {
    edits: &'a [PositionedTextEdit],
    next_edit: usize,
    line: Option<u32>,
    delta: i64,
}

impl<'a> GeneratedColumnRemapper<'a> {
    fn new(edits: &'a [PositionedTextEdit]) -> Self {
        Self {
            edits,
            next_edit: 0,
            line: None,
            delta: 0,
        }
    }

    fn remap(&mut self, line: u32, column: u32) -> Option<u32> {
        if self.line != Some(line) {
            self.line = Some(line);
            self.delta = 0;
            while self
                .edits
                .get(self.next_edit)
                .is_some_and(|edit| edit.line < line)
            {
                self.next_edit += 1;
            }
        }

        while let Some(edit) = self.edits.get(self.next_edit) {
            if edit.line != line || edit.end_col > column {
                break;
            }
            self.delta += i64::from(edit.raw.replacement_utf16_len)
                - i64::from(edit.end_col - edit.start_col);
            self.next_edit += 1;
        }

        if self.edits.get(self.next_edit).is_some_and(|edit| {
            edit.line == line && column >= edit.start_col && column < edit.end_col
        }) {
            return None;
        }

        u32::try_from(i64::from(column) + self.delta).ok()
    }
}

struct GeneratedAnchorRemapper<'a> {
    columns: GeneratedColumnRemapper<'a>,
}

impl<'a> GeneratedAnchorRemapper<'a> {
    fn new(edits: &'a [PositionedTextEdit]) -> Self {
        Self {
            columns: GeneratedColumnRemapper::new(edits),
        }
    }

    fn remap(&mut self, edit: &PositionedTextEdit) -> Option<u32> {
        self.columns
            .remap(edit.line, edit.end_col)
            .and_then(|end| end.checked_sub(edit.raw.replacement_utf16_len))
    }
}

fn remap_source_map(source_map: &str, code: &str, edits: &[TextEdit]) -> Result<String, String> {
    if edits.is_empty() {
        return Ok(source_map.to_string());
    }
    let positioned = position_text_edits(code, edits)?;
    debug_assert!(
        positioned
            .windows(2)
            .all(|pair| (pair[0].line, pair[0].end_col) <= (pair[1].line, pair[1].start_col))
    );
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

    let mut remapper = GeneratedColumnRemapper::new(&positioned);
    for token in original.tokens() {
        let Some(dst_col) = remapper.remap(token.get_dst_line(), token.get_dst_col()) else {
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
    let mut anchor_remapper = GeneratedAnchorRemapper::new(&positioned);
    for edit in &positioned {
        let Some(dst_col) = anchor_remapper.remap(edit) else {
            continue;
        };
        let Some(source_token) = original.lookup_token(edit.line, edit.start_col) else {
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

fn remap_generated_boundary(offset: u32, byte_delta: i64) -> Option<u32> {
    u32::try_from(i64::from(offset) + byte_delta).ok()
}

fn edit_byte_delta(edit: &TextEdit) -> i64 {
    i64::from(edit.replacement_len) - i64::from(edit.end - edit.start)
}

fn remap_forward_segments(
    segments: Vec<(u32, u32, u32)>,
    edits: &[TextEdit],
) -> Vec<(u32, u32, u32)> {
    if edits.is_empty() {
        return segments;
    }
    let mut remapped = Vec::with_capacity(segments.len());
    let mut edit_cursor = 0;
    let mut byte_delta = 0;

    for (source_start, source_end, generated_start) in segments {
        let generated_end = generated_start + source_end - source_start;
        let mut cursor = generated_start;

        while let Some(edit) = edits.get(edit_cursor) {
            if edit.end > cursor {
                break;
            }
            byte_delta += edit_byte_delta(edit);
            edit_cursor += 1;
        }

        while let Some(edit) = edits.get(edit_cursor) {
            if edit.start >= generated_end {
                break;
            }

            let unchanged_end = edit.start.min(generated_end);
            if cursor < unchanged_end {
                let source_part_start = source_start + cursor - generated_start;
                let source_part_end = source_start + unchanged_end - generated_start;
                if let Some(post_start) = remap_generated_boundary(cursor, byte_delta) {
                    remapped.push((source_part_start, source_part_end, post_start));
                }
            }

            cursor = cursor.max(edit.end.min(generated_end));
            if edit.end > generated_end {
                break;
            }
            byte_delta += edit_byte_delta(edit);
            edit_cursor += 1;
        }

        if cursor < generated_end {
            let source_part_start = source_start + cursor - generated_start;
            if let Some(post_start) = remap_generated_boundary(cursor, byte_delta) {
                remapped.push((source_part_start, source_end, post_start));
            }
        }
    }
    remapped
}

#[cfg(test)]
fn remap_generated_boundary_oracle(offset: u32, edits: &[TextEdit]) -> Option<u32> {
    let mut remapped = i64::from(offset);
    for edit in edits {
        if edit.end <= offset {
            remapped += i64::from(edit.replacement_len) - i64::from(edit.end - edit.start);
        }
    }
    u32::try_from(remapped).ok()
}

#[cfg(test)]
fn remap_forward_segments_oracle(
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
                if let Some(post_start) = remap_generated_boundary_oracle(cursor, edits) {
                    remapped.push((source_part_start, source_part_end, post_start));
                }
            }
            cursor = cursor.max(edit.end.min(generated_end));
        }
        if cursor < generated_end {
            let source_part_start = source_start + cursor - generated_start;
            if let Some(post_start) = remap_generated_boundary_oracle(cursor, edits) {
                remapped.push((source_part_start, source_end, post_start));
            }
        }
    }
    remapped
}

fn contains_exact_script_close_tag(script: &str) -> bool {
    let bytes = script.as_bytes();
    let exact = b"</script>";
    if bytes.len() >= exact.len() && bytes[bytes.len() - exact.len()..].eq_ignore_ascii_case(exact)
    {
        return true;
    }

    // Keep the full scan for malformed parser spans that official svelte2tsx still accepts.
    bytes
        .windows(exact.len())
        .any(|window| window.eq_ignore_ascii_case(exact))
}

#[cfg(test)]
mod script_close_tag_tests {
    use super::contains_exact_script_close_tag;

    fn oracle(script: &str) -> bool {
        script
            .as_bytes()
            .windows(9)
            .any(|window| window.eq_ignore_ascii_case(b"</script>"))
    }

    #[test]
    fn exact_close_tag_fast_path_matches_the_full_scan() {
        for prefix_len in [0, 1, 8, 64, 4096] {
            let mut script = "x".repeat(prefix_len);
            script.push_str("</ScRiPt>");
            assert!(contains_exact_script_close_tag(&script));
            assert_eq!(contains_exact_script_close_tag(&script), oracle(&script));
        }
    }

    #[test]
    fn malformed_and_nonterminal_close_tags_match_the_full_scan() {
        for script in [
            "",
            "</script",
            "</script   >",
            "before</SCRIPT>after",
            "before</script>\n",
            "before<\\/script>after",
        ] {
            assert_eq!(contains_exact_script_close_tag(script), oracle(script));
        }
    }
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
        skip_expression_loc: true,
        defer_script_parse: true,
        force_typescript: false,
        lenient_script: false,
        skip_non_css_lang_style: false,
        capture_comments: false,
    };
    let mut ast = phase1_parse::parse_script_ts(&parse_source, parse_options)?;
    let parsed_scripts = super::script::ParsedScripts::new(&mut ast);
    let source_features = scan_source_features(source);

    // svelte rejects `{@debug expr}` whose arguments are not plain identifiers
    // (`{@debug user.firstname}` / `{@debug a[0]}`) at PARSE time. rsvelte does
    // this in the analyze DebugTag visitor, which svelte2tsx never runs — so
    // replicate it here to preserve error-parity with official svelte2tsx.
    if source_features.has_debug_marker {
        validate_debug_tag_arguments(&ast, source)?;
    }
    if source_features.has_meta_marker {
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
    let mut instance_imports = Vec::new();
    if let (Some(instance), Some(parsed)) = (&ast.instance, &parsed_scripts.instance) {
        instance_imports = super::script::process_instance_script(
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

    // Step 7.6: Process <svelte:options> tag as a createElement call
    // The parser stores svelte:options in ast.options (not in fragment.nodes),
    // so we need to handle it separately.
    emit_svelte_options_element(&ast, source, &mut str);

    // Step 8: Blank out <style> tag (CSS is not relevant for TSX type checking)
    blank_style_tags(&ast, source, &mut str);

    // Step 8.5: Detect $$props, $$restProps, $$slots usage in source (before wrapping)
    let uses_dollar_props = source_features.uses_dollar_props;
    let uses_dollar_rest_props = source_features.uses_dollar_rest_props;
    let uses_dollar_slots = source_features.uses_dollar_slots;

    // Step 9: Process template nodes in-place via MagicString.
    template::process_template_inplace(
        &ast.fragment,
        source,
        &options,
        &mut str,
        ast.comments
            .iter()
            .map(|comment| (comment.start, comment.end)),
    );

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
    let template_info = template::collect_template_info_if_needed(
        &ast,
        source,
        uses_dollar_slots,
        source_features.may_need_template_info,
        source_features.has_await_word,
        source_features.may_have_template_rune_global,
        &exported_names.instance_value_names,
    );
    let has_slot_elements = !template_info.slots.is_empty();
    if template_info.uses_runes {
        exported_names.set_uses_runes(true);
    }

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
        contains_exact_script_close_tag(slice)
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
        uses_dollar_props,
        uses_dollar_rest_props,
        uses_dollar_slots,
        template_info.dollar_slot_names.as_deref(),
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
            &instance_imports,
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

    str.append_str_owned(closing);

    let generated = str.generate_bundle(GenerateMapOptions {
        file: None,
        source: Some(options.filename.clone()),
        include_content: false,
    });
    let code = generated.code;
    let source_map = generated.source_map;
    let forward_map = generated.forward_segments;

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
            if let Some(rewritten_code) = rewrite.replacement {
                let remapped_source_map = remap_source_map(&source_map, &code, &rewrite.edits)
                    .map_err(Svelte2TsxError::Other)?;
                let remapped_forward_map = remap_forward_segments(forward_map, &rewrite.edits);
                (rewritten_code, remapped_source_map, remapped_forward_map)
            } else {
                (code, source_map, forward_map)
            }
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

#[cfg(test)]
mod source_map_remap_tests {
    use super::*;

    fn positioned_edit(
        line: u32,
        start_col: u32,
        end_col: u32,
        replacement_utf16_len: u32,
    ) -> PositionedTextEdit {
        PositionedTextEdit {
            raw: TextEdit {
                start: 0,
                end: 0,
                replacement_len: replacement_utf16_len,
                replacement_utf16_len,
            },
            line,
            start_col,
            end_col,
        }
    }

    fn assert_sweep_matches_oracle(edits: &[PositionedTextEdit]) {
        let mut remapper = GeneratedColumnRemapper::new(edits);
        for line in 0..=3 {
            for column in 0..=9 {
                assert_eq!(
                    remapper.remap(line, column),
                    remap_generated_column(line, column, edits),
                    "line {line}, column {column}, edits {edits:?}"
                );
            }
        }

        let mut anchor_remapper = GeneratedAnchorRemapper::new(edits);
        for edit in edits {
            assert_eq!(
                anchor_remapper.remap(edit),
                remap_generated_column(edit.line, edit.end_col, edits)
                    .and_then(|end| end.checked_sub(edit.raw.replacement_utf16_len)),
                "anchor edit {edit:?}, edits {edits:?}"
            );
        }
    }

    fn edit(start: usize, end: usize) -> TextEdit {
        TextEdit {
            start: start as u32,
            end: end as u32,
            replacement_len: 0,
            replacement_utf16_len: 0,
        }
    }

    #[test]
    fn positions_edits_in_utf16_columns() {
        let code = "a😀𐐷e\u{301}z";
        let start = code.find('😀').unwrap();
        let end = code.find('z').unwrap();
        let positioned = position_text_edits(code, &[edit(start, end)]).unwrap();

        assert_eq!(positioned.len(), 1);
        assert_eq!(positioned[0].line, 0);
        assert_eq!(positioned[0].start_col, 1);
        assert_eq!(positioned[0].end_col, 7);
    }

    #[test]
    fn positions_multiple_edits_on_the_same_line() {
        let positioned = position_text_edits("0123456789", &[edit(1, 3), edit(5, 8)]).unwrap();

        assert_eq!(
            positioned
                .iter()
                .map(|edit| (edit.line, edit.start_col, edit.end_col))
                .collect::<Vec<_>>(),
            vec![(0, 1, 3), (0, 5, 8)]
        );
    }

    #[test]
    fn only_line_feeds_advance_the_line() {
        let positioned = position_text_edits("a\rb\r\nc", &[edit(2, 4), edit(5, 6)]).unwrap();

        assert_eq!(
            positioned
                .iter()
                .map(|edit| (edit.line, edit.start_col, edit.end_col))
                .collect::<Vec<_>>(),
            vec![(0, 2, 4), (1, 0, 1)]
        );
    }

    #[test]
    fn rejects_edits_that_cross_line_feeds() {
        assert_eq!(
            position_text_edits("a\nb", &[edit(1, 3)]).unwrap_err(),
            "external-import rewrite unexpectedly spans lines"
        );
    }

    #[test]
    fn rejects_non_utf8_boundaries() {
        assert_eq!(
            position_text_edits("a😀b", &[edit(2, 5)]).unwrap_err(),
            "external-import rewrite offset 2 is not a generated-text boundary"
        );
        assert_eq!(
            position_text_edits("a😀b", &[edit(1, 4)]).unwrap_err(),
            "external-import rewrite offset 4 is not a generated-text boundary"
        );
    }

    #[test]
    fn rejects_out_of_range_offsets() {
        assert_eq!(
            position_text_edits("abc", &[edit(1, 4)]).unwrap_err(),
            "external-import rewrite offset 4 is not a generated-text boundary"
        );
    }

    #[test]
    fn rejects_edits_that_violate_scanner_ordering() {
        let expected = "external-import rewrite edits are not ordered and non-overlapping";
        assert_eq!(
            position_text_edits("abcdef", &[edit(4, 5), edit(2, 3)]).unwrap_err(),
            expected
        );
        assert_eq!(
            position_text_edits("abcdef", &[edit(1, 4), edit(3, 5)]).unwrap_err(),
            expected
        );
        assert_eq!(
            position_text_edits("abcdef", &[edit(4, 2)]).unwrap_err(),
            expected
        );
    }

    #[test]
    fn generated_column_sweep_matches_oracle_exhaustively() {
        assert_sweep_matches_oracle(&[]);

        for line in 0..=2 {
            for start in 0..=5 {
                for end in start + 1..=7 {
                    for replacement in 0..=5 {
                        assert_sweep_matches_oracle(&[positioned_edit(
                            line,
                            start,
                            end,
                            replacement,
                        )]);
                    }
                }
            }
        }

        for first_start in 0..=3 {
            for first_end in first_start + 1..=5 {
                for second_start in first_end..=6 {
                    for second_end in second_start + 1..=7 {
                        for first_replacement in 0..=3 {
                            for second_replacement in 0..=3 {
                                assert_sweep_matches_oracle(&[
                                    positioned_edit(1, first_start, first_end, first_replacement),
                                    positioned_edit(
                                        1,
                                        second_start,
                                        second_end,
                                        second_replacement,
                                    ),
                                ]);
                            }
                        }
                    }
                }
            }
        }

        for replacement in 0..=5 {
            assert_sweep_matches_oracle(&[
                positioned_edit(0, 1, 4, replacement),
                positioned_edit(0, 5, 7, 5 - replacement),
                positioned_edit(2, 0, 2, replacement),
            ]);
        }
    }

    #[test]
    fn generated_column_sweep_preserves_edit_start_and_end() {
        let edits = [positioned_edit(0, 2, 5, 1)];
        let mut remapper = GeneratedColumnRemapper::new(&edits);

        let start = remapper.remap(0, 2);
        assert_eq!(start, remap_generated_column(0, 2, &edits));
        assert_eq!(start, None);

        let end = remapper.remap(0, 5);
        assert_eq!(end, remap_generated_column(0, 5, &edits));
        assert_eq!(end, Some(3));
    }

    #[test]
    fn generated_column_sweep_preserves_u32_boundaries() {
        let edits = [positioned_edit(0, 0, 1, u32::MAX)];
        let mut remapper = GeneratedColumnRemapper::new(&edits);

        assert_eq!(remapper.remap(0, 0), None);
        assert_eq!(remapper.remap(0, 1), Some(u32::MAX));
        assert_eq!(remapper.remap(0, 2), None);

        let edits = [positioned_edit(0, 0, u32::MAX, 0)];
        let mut remapper = GeneratedColumnRemapper::new(&edits);

        assert_eq!(remapper.remap(0, 0), None);
        assert_eq!(remapper.remap(0, u32::MAX), Some(0));

        let edits = [positioned_edit(0, 1, 2, u32::MAX)];
        let mut anchor_remapper = GeneratedAnchorRemapper::new(&edits);
        let anchor = anchor_remapper.remap(&edits[0]);
        assert_eq!(
            anchor,
            remap_generated_column(0, 2, &edits).and_then(|end| end.checked_sub(u32::MAX))
        );
        assert_eq!(anchor, None);
    }

    fn encoded_source_map(builder: SourceMapBuilder) -> String {
        let mut encoded = Vec::new();
        builder.into_sourcemap().to_writer(&mut encoded).unwrap();
        String::from_utf8(encoded).unwrap()
    }

    #[test]
    fn source_map_anchor_preserves_intermediate_overflow() {
        let mut original = SourceMapBuilder::new(None);
        original.add(0, 1, 0, 1, Some("component.svelte"), Some("anchor"), false);
        let edits = [TextEdit {
            start: 1,
            end: 2,
            replacement_len: u32::MAX,
            replacement_utf16_len: u32::MAX,
        }];

        let remapped = remap_source_map(&encoded_source_map(original), "ab", &edits).unwrap();
        let remapped = sourcemap::SourceMap::from_slice(remapped.as_bytes()).unwrap();

        assert_eq!(remapped.get_token_count(), 0);
    }

    #[test]
    fn source_map_sweep_preserves_tokens_anchors_and_metadata() {
        let code = "a😀bcdef\nuvwxyz";
        let edits = [
            TextEdit {
                start: 1,
                end: 6,
                replacement_len: 1,
                replacement_utf16_len: 1,
            },
            TextEdit {
                start: 7,
                end: 9,
                replacement_len: 4,
                replacement_utf16_len: 4,
            },
            TextEdit {
                start: 12,
                end: 14,
                replacement_len: 0,
                replacement_utf16_len: 0,
            },
        ];

        let mut original = SourceMapBuilder::new(Some("generated.tsx"));
        let source_id = original.add_source("component.svelte");
        original.set_source_contents(source_id, Some("<p>source</p>"));
        let ignored_id = original.add_source("ignored.js");
        original.set_source_contents(ignored_id, Some("ignored"));
        original.add_to_ignore_list(ignored_id);

        original.add(0, 0, 0, 0, Some("component.svelte"), Some("before"), false);
        original.add(
            0,
            1,
            10,
            20,
            Some("component.svelte"),
            Some("first_anchor"),
            true,
        );
        original.add(
            0,
            2,
            11,
            21,
            Some("component.svelte"),
            Some("deleted"),
            false,
        );
        original.add(
            0,
            4,
            12,
            22,
            Some("component.svelte"),
            Some("after_first"),
            false,
        );
        original.add(
            0,
            5,
            13,
            23,
            Some("ignored.js"),
            Some("second_anchor"),
            false,
        );
        original.add(
            0,
            7,
            14,
            24,
            Some("component.svelte"),
            Some("after_second"),
            true,
        );
        original.add(
            1,
            0,
            20,
            30,
            Some("component.svelte"),
            Some("next_line"),
            false,
        );
        original.add(
            1,
            1,
            21,
            31,
            Some("component.svelte"),
            Some("empty_anchor"),
            false,
        );
        original.add(
            1,
            3,
            22,
            32,
            Some("component.svelte"),
            Some("after_empty"),
            false,
        );
        original.add(2, 0, 0, 0, None, None, false);

        let remapped = remap_source_map(&encoded_source_map(original), code, &edits).unwrap();
        let remapped = sourcemap::SourceMap::from_slice(remapped.as_bytes()).unwrap();

        assert_eq!(remapped.get_file(), Some("generated.tsx"));
        assert_eq!(remapped.get_source_count(), 2);
        assert_eq!(remapped.get_source(0), Some("component.svelte"));
        assert_eq!(remapped.get_source_contents(0), Some("<p>source</p>"));
        assert_eq!(remapped.get_source(1), Some("ignored.js"));
        assert_eq!(remapped.get_source_contents(1), Some("ignored"));
        assert_eq!(remapped.ignore_list().copied().collect::<Vec<_>>(), [1]);

        let tokens = remapped.tokens().collect::<Vec<_>>();
        let find = |name: &str| {
            tokens
                .iter()
                .find(|token| token.get_name() == Some(name))
                .copied()
                .unwrap()
        };

        let first_anchor = find("first_anchor");
        assert_eq!(
            (first_anchor.get_dst_line(), first_anchor.get_dst_col()),
            (0, 1)
        );
        assert_eq!(first_anchor.get_source(), Some("component.svelte"));
        assert_eq!(
            (first_anchor.get_src_line(), first_anchor.get_src_col()),
            (10, 20)
        );
        assert!(first_anchor.is_range());
        assert!(
            !tokens
                .iter()
                .any(|token| token.get_name() == Some("deleted"))
        );

        let after_first = find("after_first");
        assert_eq!(
            (after_first.get_dst_line(), after_first.get_dst_col()),
            (0, 2)
        );

        let second_anchor = find("second_anchor");
        assert_eq!(
            (second_anchor.get_dst_line(), second_anchor.get_dst_col()),
            (0, 3)
        );
        assert_eq!(second_anchor.get_source(), Some("ignored.js"));

        let after_second = find("after_second");
        assert_eq!(
            (after_second.get_dst_line(), after_second.get_dst_col()),
            (0, 7)
        );
        assert!(after_second.is_range());

        let empty_anchor = find("empty_anchor");
        assert_eq!(
            (empty_anchor.get_dst_line(), empty_anchor.get_dst_col()),
            (1, 1)
        );
        let after_empty = find("after_empty");
        assert_eq!(
            (after_empty.get_dst_line(), after_empty.get_dst_col()),
            (1, 1)
        );

        assert!(tokens.iter().any(|token| {
            token.get_dst_line() == 2
                && token.get_dst_col() == 0
                && token.get_source().is_none()
                && token.get_name().is_none()
        }));
    }
}

#[cfg(test)]
mod forward_map_rewrite_tests {
    use super::*;

    fn edit(start: u32, end: u32, replacement_len: u32) -> TextEdit {
        TextEdit {
            start,
            end,
            replacement_len,
            replacement_utf16_len: replacement_len,
        }
    }

    fn interval_layouts(limit: u32) -> Vec<Vec<(u32, u32)>> {
        fn extend(
            minimum_start: u32,
            limit: u32,
            current: &mut Vec<(u32, u32)>,
            layouts: &mut Vec<Vec<(u32, u32)>>,
        ) {
            layouts.push(current.clone());
            for start in minimum_start..limit {
                for end in start + 1..=limit {
                    current.push((start, end));
                    extend(end, limit, current, layouts);
                    current.pop();
                }
            }
        }

        let mut layouts = Vec::new();
        extend(0, limit, &mut Vec::new(), &mut layouts);
        layouts
    }

    fn forward_segments(layout: &[(u32, u32)]) -> Vec<(u32, u32, u32)> {
        layout
            .iter()
            .enumerate()
            .map(|(index, &(generated_start, generated_end))| {
                let source_start = 500 + (layout.len() - index) as u32 * 20;
                (
                    source_start,
                    source_start + generated_end - generated_start,
                    generated_start,
                )
            })
            .collect()
    }

    fn edit_variants(layout: &[(u32, u32)]) -> Vec<Vec<TextEdit>> {
        fn extend(
            layout: &[(u32, u32)],
            index: usize,
            current: &mut Vec<TextEdit>,
            variants: &mut Vec<Vec<TextEdit>>,
        ) {
            let Some(&(start, end)) = layout.get(index) else {
                variants.push(current.clone());
                return;
            };
            let old_len = end - start;
            let mut replacement_lengths = Vec::with_capacity(4);
            for replacement_len in [0, 1, old_len, old_len + 2] {
                if !replacement_lengths.contains(&replacement_len) {
                    replacement_lengths.push(replacement_len);
                }
            }
            for replacement_len in replacement_lengths {
                current.push(edit(start, end, replacement_len));
                extend(layout, index + 1, current, variants);
                current.pop();
            }
        }

        let mut variants = Vec::new();
        extend(layout, 0, &mut Vec::new(), &mut variants);
        variants
    }

    fn next_random(state: &mut u64) -> u32 {
        *state = state
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1_442_695_040_888_963_407);
        (*state >> 32) as u32
    }

    fn random_intervals(state: &mut u64, limit: u32) -> Vec<(u32, u32)> {
        let mut intervals = Vec::new();
        let mut cursor = next_random(state) % 5;
        while cursor < limit && intervals.len() < 24 {
            let remaining = limit - cursor;
            let len = 1 + next_random(state) % remaining.min(12);
            let end = cursor + len;
            intervals.push((cursor, end));
            cursor = end.saturating_add(next_random(state) % 5);
        }
        intervals
    }

    #[test]
    fn preserves_boundaries_when_an_edit_crosses_segments_and_gaps() {
        let segments = vec![(100, 104, 0), (200, 204, 6), (300, 304, 12)];
        let edits = vec![edit(2, 14, 3)];

        assert_eq!(
            remap_forward_segments(segments, &edits),
            vec![(100, 102, 0), (302, 304, 5)]
        );
    }

    #[test]
    fn handles_zero_length_edits_at_equal_boundaries() {
        let segments = vec![(10, 15, 5), (20, 22, 10)];
        let edits = vec![edit(5, 5, 3), edit(7, 7, 0), edit(10, 10, 2)];

        assert_eq!(
            remap_forward_segments(segments, &edits),
            vec![(10, 12, 8), (12, 15, 10), (20, 22, 15)]
        );
    }

    #[test]
    fn zero_length_segments_and_edits_match_the_oracle() {
        let segments = vec![(10, 10, 5), (20, 22, 5), (30, 30, 7)];
        let edits = vec![edit(5, 5, 3), edit(7, 7, 2)];

        assert_eq!(
            remap_forward_segments(segments.clone(), &edits),
            vec![(20, 22, 8)]
        );
        assert_eq!(
            remap_forward_segments(segments.clone(), &edits),
            remap_forward_segments_oracle(segments, &edits)
        );
    }

    #[test]
    fn exhaustive_small_interval_layouts_match_the_oracle() {
        let layouts = interval_layouts(5);
        for segment_layout in &layouts {
            let segments = forward_segments(segment_layout);
            for edit_layout in &layouts {
                for edits in edit_variants(edit_layout) {
                    assert_eq!(
                        remap_forward_segments(segments.clone(), &edits),
                        remap_forward_segments_oracle(segments.clone(), &edits),
                        "segments={segments:?}, edits={edits:?}"
                    );
                }
            }
        }
    }

    #[test]
    fn deterministic_generated_order_cases_match_the_oracle() {
        let mut state = 0x5eed_f04d_cafe_babe;
        for _ in 0..8_192 {
            let limit = 10 + next_random(&mut state) % 240;
            let segment_layout = random_intervals(&mut state, limit);
            let segments = forward_segments(&segment_layout);
            let edit_layout = random_intervals(&mut state, limit);
            let edits: Vec<_> = edit_layout
                .into_iter()
                .map(|(start, end)| edit(start, end, next_random(&mut state) % 32))
                .collect();

            assert_eq!(
                remap_forward_segments(segments.clone(), &edits),
                remap_forward_segments_oracle(segments.clone(), &edits),
                "segments={segments:?}, edits={edits:?}"
            );
        }
    }
}
