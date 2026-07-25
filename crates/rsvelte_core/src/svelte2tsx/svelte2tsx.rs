//! Main entry point for svelte2tsx conversion.
//!
//! Converts Svelte component source files into TypeScript/TSX for type checking.
//! This is a Rust port of the `svelte2tsx` package used by the Svelte language server.

use std::fmt::Write as _;

use crate::ast::template::Root;
use crate::compiler::phases::phase1_parse::{self, ParseOptions};

use super::helpers::rewrite_external_imports::rewrite_external_specifiers_in_text;
use super::magic_string::{GenerateMapOptions, MagicString};
use super::nodes::component_documentation::extract_component_documentation;
use super::nodes::component_events::build_events_str;
use super::nodes::component_name::derive_component_name;
use super::nodes::generics::{
    compact_generic_params, extract_generics_from_script_tag, split_generic_param_names,
    type_text_references_any, type_text_typeof_references_local_value,
};
use super::nodes::runes_detection::{
    detect_await_in_template, detect_rune_global_in_template, detect_runes_mode,
};
use super::nodes::scripts::{
    detect_top_level_await, find_instance_imports, find_script_close_tag_start,
};
use super::nodes::slot::{
    build_slots_str, collect_slot_names_from_ast, escape_js_single_quoted,
    fragment_has_slot_element,
};
use super::nodes::snippet_hoisting::hoist_top_level_snippets;
use super::nodes::svelte_options::emit_svelte_options_element;
use super::script::{ComponentEvents, ExportedNames};
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
/// use rsvelte_core::svelte2tsx::{svelte2tsx, Svelte2TsxOptions};
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
        defer_script_parse: false,
        force_typescript: false,
        lenient_script: false,
        skip_non_css_lang_style: false,
        capture_comments: false,
    };
    let ast = phase1_parse::parse_script_ts(&parse_source, parse_options)?;

    // svelte rejects `{@debug expr}` whose arguments are not plain identifiers
    // (`{@debug user.firstname}` / `{@debug a[0]}`) at PARSE time. rsvelte does
    // this in the analyze DebugTag visitor, which svelte2tsx never runs — so
    // replicate it here to preserve error-parity with official svelte2tsx.
    validate_debug_tag_arguments(&ast, source)?;
    validate_meta_element_placement(&ast, source)?;

    // Step 2: Determine component name from filename
    let component_name = derive_component_name(&options.filename);

    // Step 3: Detect runes mode (preliminary check from svelte:options)
    let explicit_runes = options.runes.unwrap_or_else(|| detect_runes_mode(&ast));

    // Step 4: Create the MagicString for in-place source manipulation
    let mut str = MagicString::new(source);

    // Step 5: Initialize tracking structures
    let mut exported_names = ExportedNames::new();
    let mut events = ComponentEvents::new();

    if explicit_runes {
        exported_names.set_uses_runes(true);
    }

    // Step 6: Process module script (<script context="module">)
    if let Some(ref module) = ast.module {
        super::script::process_module_script(module, source, &mut str, &mut exported_names);
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
    if let Some(ref instance) = ast.instance {
        super::script::process_instance_script(
            instance,
            source,
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

    // Phase 2: Overwrite instance script tags and lift imports (before any moves)
    //
    // Import declarations inside the instance script are lifted above the
    // $$render() function so they appear at module scope in the output.
    // This matches the JS svelte2tsx behavior.
    if has_instance_script {
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
        has_top_level_await = !script_parse_failed && detect_top_level_await(raw_content);
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
        let imports = find_instance_imports(instance, source);

        if !imports.is_empty() {
            // Lift imports above $$render(). Each import is collected
            // individually (without leading whitespace), then inserted
            // into the <script> tag replacement. The original import
            // positions are blanked with whitespace-preserving content.

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

                let first_comment_is_block =
                    comment_lines.first().is_some_and(|c| c.starts_with("/*"));
                let needs_leading_newline =
                    i == 0 && (comment_lines.is_empty() || first_comment_is_block);

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
                    let non_hoistable_instance_types: std::collections::HashSet<String> =
                        exported_names
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
                format!(";type $$ComponentProps =  {};", type_text)
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
            if has_module_script {
                part_a.push('\n');
            }
            part_a.push_str(&import_text);
            // When there are hoistable snippets and a $$ComponentProps typedef to
            // emit before $$render, the typedef must appear BEFORE the snippets in
            // the output. Because snippets are moved to `sp` (after `part_a`) and
            // `part_b` is placed after them, we append the typedef to `part_a` so
            // it lands between the imports and the snippets. A `\n` separator is
            // also added to match the blank line the JS reference produces.
            let ts_component_props_in_part_a = !hoistable_snippet_ranges.is_empty()
                && !ts_component_props_before_render.is_empty();
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
                let type_ranges = exported_names.hoistable_type_ranges.clone();
                for (s, e) in type_ranges {
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
                let mut nodes_to_move = exported_names.dollar_generic_referenced_ranges.clone();
                nodes_to_move.sort_by_key(|(s, _)| *s);
                for (s, e) in nodes_to_move {
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
        } else {
            // No imports: overwrite the entire <script> tag at once
            let force_inside_render_no_imports = exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
                && !exported_names.type_already_inserted
                && {
                    let type_text = exported_names.props_type_text.as_ref().unwrap();
                    let has_typeof = type_text_typeof_references_local_value(
                        type_text,
                        &exported_names.instance_value_names,
                        &exported_names.instance_import_names,
                        &exported_names.module_import_names,
                    );
                    let has_generic_dep = !render_generics.is_empty()
                        && generics_param
                            .as_ref()
                            .map(|g| {
                                split_generic_param_names(g)
                                    .iter()
                                    .any(|name| type_text.contains(name.as_str()))
                            })
                            .unwrap_or(false);
                    // Match the imports branch: skip names that are
                    // themselves slated for hoisting — referencing them
                    // from `$$ComponentProps` is fine when the hoisted
                    // declaration sits above `$$render`.
                    let non_hoistable_instance_types: std::collections::HashSet<String> =
                        exported_names
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
                && !force_inside_render_no_imports
                && let Some(type_text) = exported_names.props_type_text.as_ref()
            {
                format!("\n;type $$ComponentProps =  {};", type_text)
            } else {
                String::new()
            };

            // For best-effort auto-generated types, insert INSIDE $$render.
            // See the imports branch above for the `inline_type_at_let` rationale.
            let inline_type_at_let = (force_inside_render_no_imports
                || exported_names.type_already_inserted)
                && exported_names.props_let_abs_pos.is_some()
                && exported_names.props_type_text.is_some();
            let ts_component_props_inside_render = if (exported_names.type_already_inserted
                || force_inside_render_no_imports)
                && !inline_type_at_let
                && let Some(type_text) = exported_names.props_type_text.as_ref()
            {
                if force_inside_render_no_imports {
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

            let trailing_newline = if ts_component_props_inside_render.is_empty() {
                "\n"
            } else {
                ""
            };
            // No-imports branch: same split rationale as the imports branch
            // above — keep the synthesised `;type $$ComponentProps = ...;` in
            // part_b so it follows any hoisted type/interface declarations.
            // When there are hoistable snippets, move it to part_a so it
            // appears before them (mirrors the imports-branch behaviour).
            let ts_component_props_in_part_a = !hoistable_snippet_ranges.is_empty()
                && !ts_component_props_before_render.is_empty();
            let mut part_a = String::from(";");
            if ts_component_props_in_part_a {
                part_a.push('\n');
                part_a.push_str(&ts_component_props_before_render);
            }
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
                let type_ranges = exported_names.hoistable_type_ranges.clone();
                for (s, e) in type_ranges {
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
                let mut nodes_to_move = exported_names.dollar_generic_referenced_ranges.clone();
                nodes_to_move.sort_by_key(|(s, _)| *s);
                for (s, e) in nodes_to_move {
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
                let snippet = if force_inside_render_no_imports {
                    format!(";type $$ComponentProps =  {};", type_text)
                } else {
                    format!(
                        "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                        type_text
                    )
                };
                str.append_left(let_pos, &snippet);
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

    // Phase 4: Add reference types and component wrapper
    let is_dts_mode = matches!(options.mode, Svelte2TsxMode::Dts);
    let header_str = if is_dts_mode {
        "import { SvelteComponentTyped } from \"svelte\"\n\n"
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
            let module_imports = find_instance_imports(module, source);
            let module_hoist_target = match module_imports.last() {
                Some(&(_, _, last_end)) => mod_content_start + last_end,
                None => mod_content_start,
            };
            // JS reference: `str.appendLeft(snippetHoistTargetForModule, '\n')`
            // for both the imports-present and no-imports branches.
            str.append_left(module_hoist_target, "\n");
            for (s, e) in hoistable_snippet_ranges.iter() {
                str.move_range(*s, *e, module_hoist_target);
            }
        }

        // For module-script-only components, inject store subscriptions for
        // module-level imports at the start of the $$render async wrapper.
        let store_decls = super::script::collect_module_import_store_declarations(source);
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
            ";function $$render() {{{}{}\nasync () => {{{}",
            dollar_decls, slot_decl_mod, store_decls
        );
        str.append_left(mod_end, &render_open);

        // Blank out trailing whitespace after the module script ONLY when
        // there's no template content following. This ensures the async
        // wrapper closes immediately for module-script-only components.
        let has_non_whitespace_template = ast.fragment.nodes.iter().any(|node| {
            !matches!(node, crate::ast::template::TemplateNode::Text(t)
                if slice_src(source, t.start as usize, t.end as usize).chars().all(|c| c.is_whitespace()))
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
        let embedded_injection = if !embedded_script_content.is_empty() {
            format!("\n{}", embedded_script_content)
        } else {
            String::new()
        };
        let wrapper = format!(
            "{};function $$render() {{{}{}{}\nasync () => {{",
            header_str, dollar_decls, embedded_injection, slot_decl_tmpl
        );
        str.prepend_str(&wrapper);
    }

    // Append the closing of async wrapper, return statement, and component export
    // `uses$$propsOr$$restProps` (ungated) flattens the props type to `{}` when
    // there are NO explicitly-declared props — mirrors official
    // `createPropsStr(uses$$propsOr$$restProps)`.
    let uses_props_or_rest = uses_dollar_props || uses_dollar_rest_props;
    // `canHaveAnyProp = !uses$$Props && (uses$$props || uses$$restProps)`: a
    // `$$Props` type/interface SUPPRESSES the `__sveltets_2_with_any` widening
    // (official addComponentExport.ts), so the two values diverge.
    let can_have_any_prop = !exported_names.uses_dollar_props_type && uses_props_or_rest;
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
    let safe_name = format!("{}__SvelteComponent_", component_name);

    // Extract @component documentation from HTML comments
    let component_doc = extract_component_documentation(&ast.fragment);

    // Build slots string from template info
    let slots_str = build_slots_str(&template_info);

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
    if exported_names.has_events_type {
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
    let events_str = build_events_str(&exported_names, &template_info, &events);

    let mut closing = String::new();
    closing.push_str("};\n");
    let _ = writeln!(
        closing,
        "return {{ props: {}{}{}, slots: {}, events: {} }}}}",
        props_str, exports_str, bindings_str, slots_str, events_str,
    );

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

    // Helper: build the prop_def string for the component export. Mirrors the
    // official `props(isTsFile, canHaveAnyProp, …)` in addComponentExport.ts:
    //   - runes mode:        renderStr (no partial)
    //   - TS file:           canHaveAnyProp ? __sveltets_2_with_any(renderStr) : renderStr
    //   - JS file (legacy):  __sveltets_2_partial[_with_any]([optional], renderStr)
    // where renderStr = `__sveltets_2_with_any_event($$render())` (non-async) or
    //                   `__sveltets_2_with_any_event($$$render)` (async) and
    // canHaveAnyProp = `!uses$$Props && (uses$$props || uses$$restProps)`.
    // `__sveltets_2_partial` is therefore ONLY emitted for legacy JS components.
    let build_prop_def = |exported_names: &ExportedNames| -> String {
        // Official `_events(hasStrictEvents, renderCall)`: a `$$Events` interface
        // (or `<svelte:options strictEvents>`) makes events strict, so the render
        // call is NOT wrapped in `__sveltets_2_with_any_event`.
        let render_str = if exported_names.has_events_type {
            render_call.to_string()
        } else {
            format!("__sveltets_2_with_any_event({render_call})")
        };
        if exported_names.is_runes_mode() {
            render_str
        } else if options.is_ts_file {
            if can_have_any_prop {
                format!("__sveltets_2_with_any({render_str})")
            } else {
                render_str
            }
        } else {
            let optional_props = exported_names.create_optional_props_array(options.is_ts_file);
            let partial = if can_have_any_prop {
                "__sveltets_2_partial_with_any"
            } else {
                "__sveltets_2_partial"
            };
            if optional_props.is_empty() {
                format!("{partial}({render_str})")
            } else {
                format!("{partial}([{}], {render_str})", optional_props.join(","))
            }
        }
    };

    // Determine if this component has generics (either from generics= attribute or $$Generic)
    let has_generics = !exported_names.dollar_generics.is_empty() || generics_attribute.is_some();

    // Build generics strings for component export
    let (generics_params, generics_names) = if !exported_names.dollar_generics.is_empty() {
        let params: Vec<String> = exported_names
            .dollar_generics
            .iter()
            .map(|(name, constraint)| {
                if let Some(c) = constraint {
                    format!("{} extends {}", name, c)
                } else {
                    name.clone()
                }
            })
            .collect();
        let names: Vec<String> = exported_names
            .dollar_generics
            .iter()
            .map(|(name, _)| name.clone())
            .collect();
        (params.join(","), names.join(","))
    } else if let Some(ref g) = generics_attribute {
        // Create compact params string (strip leading spaces from each param)
        let params_str = compact_generic_params(g);
        // Split generic params at top-level commas (not inside angle brackets)
        let names = split_generic_param_names(g);
        (params_str, names.join(","))
    } else {
        (String::new(), String::new())
    };

    match options.version {
        SvelteVersion::V4 => {
            let prop_def = build_prop_def(&exported_names);
            if let Some(ref doc) = component_doc {
                closing.push_str(doc);
                closing.push('\n');
            }
            let _ = write!(
                closing,
                "\nexport default class {} extends __sveltets_2_createSvelte2TsxComponent({}) {{\n}}",
                safe_name, prop_def
            );
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
                    let _ = writeln!(
                        closing,
                        "export const {} = __sveltets_2_fn_component({});",
                        safe_name, render_call
                    );
                    let _ = writeln!(
                        closing,
                        "/*\u{03A9}ignore_start\u{03A9}*//** @typedef {{ReturnType<typeof {}>}} {} */",
                        safe_name, safe_name
                    );
                    let _ = write!(
                        closing,
                        "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                        safe_name
                    );
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
                        raw_exports.clone()
                    };
                    // Mirror official `canHaveAnyProp`: only `$$props`/`$$restProps`
                    // (legacy magic vars) without an explicit `$$Props` type force
                    // the call-signature `props` to fall back to the full
                    // `ReturnType<…['props']>` shape. A runes generic with no props
                    // (e.g. empty `<script generics>`) emits `props: {<events/slots>}`.
                    let can_have_any_prop = !exported_names.uses_dollar_props_type
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
                    let _ = writeln!(
                        closing,
                        "const {} = __sveltets_2_fn_component({});",
                        safe_name, render_call
                    );
                    let _ = writeln!(
                        closing,
                        "/*\u{03A9}ignore_start\u{03A9}*/type {} = ReturnType<typeof {}>;",
                        safe_name, safe_name
                    );
                    let _ = write!(
                        closing,
                        "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                        safe_name
                    );
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
                let _ = writeln!(closing, "class __sveltets_Render<{}> {{", gp);
                // Mirror official `props(isTsFile=true, canHaveAnyProp, …, '$$render<…>()')`:
                // a legacy (non-runes) generic component widens its `props` with
                // `__sveltets_2_with_any` exactly when `canHaveAnyProp`.
                let props_render = if can_have_any_prop {
                    format!("__sveltets_2_with_any($$render<{}>())", gn)
                } else {
                    format!("$$render<{}>()", gn)
                };
                let _ = writeln!(
                    closing,
                    "    props() {{\n        return {}.props;\n    }}",
                    props_render
                );
                // Mirror official `_events(hasStrictEvents || isRunesMode, …)`:
                // a `$$Events` interface (strict events) — or runes mode — drops
                // the `__sveltets_2_with_any_event` fallback wrapper.
                let events_render =
                    if exported_names.has_events_type || exported_names.is_runes_mode() {
                        format!("$$render<{}>()", gn)
                    } else {
                        format!("__sveltets_2_with_any_event($$render<{}>())", gn)
                    };
                let _ = writeln!(
                    closing,
                    "    events() {{\n        return {}.events;\n    }}",
                    events_render
                );
                let _ = writeln!(
                    closing,
                    "    slots() {{\n        return $$render<{}>().slots;\n    }}",
                    gn
                );
                let _ = writeln!(closing, "    bindings() {{ return {}; }}", raw_bindings);
                // exports() returns $$render().exports if there are real exports, {} otherwise
                let exports_return = if has_real_exports {
                    format!("$$render<{}>().exports", gn)
                } else {
                    raw_exports.clone()
                };
                let _ = writeln!(closing, "    exports() {{ return {}; }}", exports_return);
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
                    "    new <{}>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<{}>['props']>{}>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<{}>['props']>, ReturnType<__sveltets_Render<{}>['events']>, ReturnType<__sveltets_Render<{}>['slots']>> & {{ $$bindings?: ReturnType<__sveltets_Render<{}>['bindings']> }} & ReturnType<__sveltets_Render<{}>['exports']>;",
                    gp, gn, children_type_suffix, gn, gn, gn, gn, gn
                );
                // Functional call signature: add $$slots and children only when component has slots
                let slots_children_suffix = if has_slot_elements {
                    format!(
                        ", $$slots?: ReturnType<__sveltets_Render<{}>['slots']>, children?: any",
                        gn
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
                    format!("ReturnType<__sveltets_Render<{}>['props']> & ", gn)
                };
                let _ = writeln!(
                    closing,
                    "    <{}>(internal: unknown, props: {}{{$$events?: ReturnType<__sveltets_Render<{}>['events']>{}}}): ReturnType<__sveltets_Render<{}>['exports']>;",
                    gp, props_prefix, gn, slots_children_suffix, gn
                );
                let _ = writeln!(
                    closing,
                    "    z_$$bindings?: ReturnType<__sveltets_Render<{}>['bindings']>;",
                    any_params
                );
                closing.push_str("}\n");

                // Component export
                if let Some(ref doc) = component_doc {
                    closing.push_str(doc);
                    closing.push('\n');
                }
                let _ = writeln!(
                    closing,
                    "const {}: $$IsomorphicComponent = null as any;",
                    safe_name
                );
                let _ = writeln!(
                    closing,
                    "/*\u{03A9}ignore_start\u{03A9}*/type {}<{}> = InstanceType<typeof {}<{}>>;",
                    safe_name, gp, safe_name, gn
                );
                let _ = write!(
                    closing,
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                    safe_name
                );
            } else {
                // Legacy V5 non-runes non-generics: isomorphic_component path.
                // Reference: addComponentExport.ts `addSimpleComponentExport`,
                // isSvelte5 + !isRunesMode + !has_generics branch.
                // `awaitDeclaration` is emitted first; `render_call` is threaded
                // through `build_prop_def` → `__sveltets_2_with_any_event(renderCall)`.
                closing.push_str(await_declaration);
                let prop_def = build_prop_def(&exported_names);
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
                let _ = writeln!(
                    closing,
                    "const {} = {}({});",
                    safe_name, component_fn, prop_def
                );
                let _ = writeln!(
                    closing,
                    "/*\u{03A9}ignore_start\u{03A9}*/type {} = InstanceType<typeof {}>;",
                    safe_name, safe_name
                );
                let _ = write!(
                    closing,
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                    safe_name
                );
            }
        }
    }

    str.append_str(&closing);

    // Generate the source map *before* the final import-rewrite post-pass.
    // The rewrite only swaps the contents of relative-import string
    // literals; for the type-error positions svelte-check actually
    // surfaces (identifiers, expressions, etc.), the small column drift
    // on those lines is acceptable. Doing it before keeps the map in
    // sync with the MagicString chunk graph.
    let source_map = str
        .generate_map(GenerateMapOptions {
            file: None,
            source: Some(options.filename.clone()),
            include_content: false,
        })
        .to_json();

    // Forward-mapping segments for verbatim regions, captured from the chunk
    // graph (consistent with the source-map generation above).
    let forward_map = str.forward_segments();

    let mut code = str.to_string();

    // Final post-pass: rewrite `../`-relative import specifiers in the
    // assembled output. We apply this here (rather than as a pre-pass on
    // the source) because earlier overwrites — e.g. opening-tag rewrites
    // for `<button onclick={() => import('...')}>` — replace whole ranges
    // wholesale and would otherwise mask any source-level rewrite.
    // Mirrors `helpers/rewriteExternalImports.ts` semantically; the AST
    // walk is unnecessary because we only target specifiers adjacent to
    // `from`/`import(` tokens.
    if let Some(ref rewrite_opts) = options.rewrite_external_imports {
        code = rewrite_external_specifiers_in_text(&code, rewrite_opts);
    }

    Ok(Svelte2TsxResult {
        code,
        map: Some(source_map),
        exported_names,
        events,
        forward_map,
    })
}

/// Build the `$$props`/`$$restProps`/`$$slots` declaration text injected into
/// the `$$render()` header for a component that references those legacy magic
/// variables.
fn build_dollar_declarations(
    ast: &Root,
    uses_dollar_props: bool,
    uses_dollar_rest_props: bool,
    uses_dollar_slots: bool,
) -> String {
    let mut dollar_decls = String::new();
    if uses_dollar_props {
        dollar_decls.push_str(" let $$props = __sveltets_2_allPropsType();");
    }
    if uses_dollar_rest_props {
        dollar_decls.push_str(" let $$restProps = __sveltets_2_restPropsType();");
    }
    if uses_dollar_slots {
        // Collect slot names from the template AST for $$slots declaration
        let slot_names = collect_slot_names_from_ast(&ast.fragment);
        let slots_obj: Vec<String> = slot_names
            .iter()
            .map(|name| format!("'{}': ''", escape_js_single_quoted(name)))
            .collect();
        let _ = write!(
            dollar_decls,
            " let $$slots = __sveltets_2_slotsType({{{}}});",
            slots_obj.join(", ")
        );
    }
    dollar_decls
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
