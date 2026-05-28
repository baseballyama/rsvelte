//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).
//!
//! This module is organized to match the Svelte compiler structure.

pub mod bridge;
pub mod build;
pub mod helpers;
mod template_rune_ast;
pub mod transform_legacy;
pub mod transform_script;
pub mod transform_store;
pub mod types;
pub mod visitors;

use super::TransformError;
use super::css::render_stylesheet_minified;
use crate::ast::template::{Fragment, Root, Script, TemplateNode};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;
use helpers::*;
use memchr::memmem;
use rustc_hash::FxHashSet;
use types::{OutputPart, SnippetDef};

use rustc_hash::FxHashMap;

/// Transform a component analysis into server-side JavaScript.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `_source` - The original source code (for backward compatibility)
/// * `_options` - Compile options
pub fn transform_server(
    analysis: &ComponentAnalysis,
    ast: &Root,
    _source: &str,
    options: &CompileOptions,
) -> Result<String, TransformError> {
    let component_name = &analysis.name;

    // Use the AST's instance script directly (no re-parsing needed)
    let instance_script = ast.instance.as_ref().map(|s| s.as_ref());
    // Use the AST's module script (context="module")
    let module_script = ast.module.as_ref().map(|s| s.as_ref());

    let mut generator = ServerCodeGenerator::new(
        component_name.clone(),
        analysis.source.clone(),
        instance_script,
        module_script,
        Some(analysis),
        options.experimental.r#async,
    );
    generator.preserve_whitespace = options.preserve_whitespace;
    generator.preserve_comments = options.preserve_comments;
    generator.dev = options.dev;
    generator.hmr = options.hmr;
    generator.component_api_v4 = matches!(
        options.compatibility.component_api,
        crate::compiler::ComponentApi::V4
    );
    // Make filename relative to rootDir if specified (matches official Svelte compiler behavior)
    generator.filename = options.filename.as_ref().map(|fname| {
        let fname = fname.replace('\\', "/");
        if let Some(ref root_dir) = options.root_dir {
            let rd = root_dir.replace('\\', "/");
            let rd = rd.trim_end_matches('/');
            if let Some(stripped) = fname.strip_prefix(rd) {
                stripped.trim_start_matches('/').to_string()
            } else {
                fname
            }
        } else {
            fname
        }
    });

    // Handle CSS injection for options.css === 'injected'
    // Reference: transform-server.js line 303: options.css === 'injected' && !options.customElement
    // Note: analysis.inject_styles is also true for custom elements, but custom elements
    // handle styles client-side (in shadow DOM), so we check the compile option directly.
    if options.css == crate::compiler::CssMode::Injected
        && analysis.css.has_css
        && !analysis.css.hash.is_empty()
        && !options.custom_element
    {
        // Render the CSS stylesheet with scoping and minification for SSR
        if let Ok(css_output) = render_stylesheet_minified(analysis, &analysis.source, options)
            && !css_output.code.is_empty()
        {
            generator.set_injected_css(analysis.css.hash.clone(), css_output.code);
        }
    }

    // Use the AST fragment directly (no re-parsing needed)
    generator.generate_component(&ast.fragment)?;

    let (program, arena) = generator.build_program();
    let code =
        crate::compiler::phases::phase3_transform::js_ast::codegen::generate(&program, &arena)
            .unwrap_or_default();
    // Post-process: strip empty statements and add esrap-style blank lines.
    // This is still needed because the function body content is wrapped in Raw
    // statements that the codegen emits verbatim (no internal blank line insertion).
    let code = strip_empty_statements(&code);
    Ok(code)
}

/// Transform a module (.svelte.js/.svelte.ts) into server-side JavaScript.
///
/// Unlike `transform_server`, this does NOT generate a component function.
/// It only transforms the module source (rune replacements) and prepends
/// the `import * as $ from 'svelte/internal/server'` import.
///
/// Corresponds to `server_module()` in the official Svelte compiler.
pub fn transform_server_module(
    analysis: &ComponentAnalysis,
    source: &str,
    _options: &CompileOptions,
) -> Result<String, TransformError> {
    // For server modules, perform the same rune transformations as client modules
    // but use 'svelte/internal/server' import instead.
    let basename = _options
        .filename
        .as_ref()
        .and_then(|f| f.rsplit('/').next().or_else(|| f.rsplit('\\').next()))
        .unwrap_or("input.svelte.js");

    let mut parts: Vec<String> = Vec::new();

    // Leading comment
    parts.push(format!(
        "/* {} generated by Svelte v{} */",
        basename,
        option_env!("SVELTE_VERSION").unwrap_or("VERSION")
    ));

    // Import
    parts.push("import * as $ from 'svelte/internal/server';".to_string());

    // For server modules, strip $effect and $effect.root blocks from the source
    // before applying transforms, since effects don't run on the server.
    let source_without_effects = strip_effects_from_source(source);

    // Transform rune calls using the same infrastructure as client modules.
    // The client transform handles class fields ($state, $derived in classes).
    let transformed =
        super::client::transform_module_source_for_module(&source_without_effects, analysis, false);

    // Post-process: replace client-specific runtime calls with server equivalents
    // $.get(x) -> x() for server (derived signals are callable on server)
    // $.set(x, v) -> x(v)
    // $.proxy(x) -> x (no proxying on server)
    // $.state(x) -> x (no signals on server)
    // $.effect_root(...) and $.user_effect(...) -> noop (should already be stripped)
    let transformed = post_process_for_server(&transformed);

    // Split imports from body
    let (script_imports, script_rest) = super::client::extract_imports_str(&transformed);

    for import_line in &script_imports {
        let trimmed = import_line.trim();
        if memmem::find(trimmed.as_bytes(), b"svelte/internal/").is_none() {
            // Ensure import statements end with semicolons, matching esrap behavior.
            if !trimmed.ends_with(';') {
                let mut with_semi = String::with_capacity(trimmed.len() + 1);
                with_semi.push_str(trimmed);
                with_semi.push(';');
                parts.push(with_semi);
            } else {
                parts.push(trimmed.to_string());
            };
        }
    }

    if let Some(rest) = script_rest {
        let rest_trimmed = rest.trim();
        if !rest_trimmed.is_empty() {
            parts.push(String::new()); // blank line
            parts.push(rest_trimmed.to_string());
        }
    }

    Ok(parts.join("\n"))
}

/// Add esrap-style blank lines between statements of different types.
/// Strip standalone empty statements (`;` on its own line) from server code.
///
/// The server code generator sometimes emits standalone semicolons that the
/// official Svelte compiler doesn't produce. This removes lines that consist
/// only of whitespace followed by `;`.
fn strip_empty_statements(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    for line in lines {
        let trimmed = line.trim();
        if trimmed == ";" {
            continue;
        }
        // Clean stray semicolons at start of block: `{;` -> `{`
        if trimmed.ends_with("{;") {
            let indent = &line[..line.len() - trimmed.len()];
            result.push(format!("{}{}", indent, &trimmed[..trimmed.len() - 1]));
        } else {
            result.push(line.to_string());
        }
    }
    result.join("\n")
}

/// Strip $effect and $effect.root blocks from source code.
/// In SSR, effects don't run, so they should be removed or replaced with no-ops.
/// - `$effect.root(() => { ... })` -> `() => {}` (returns a no-op cleanup function)
/// - `$effect(() => { ... })` -> removed entirely (statement-level only)
/// - `$effect.pre(() => { ... })` -> removed entirely (statement-level only)
fn strip_effects_from_source(source: &str) -> String {
    use super::client::find_matching_paren;
    let mut result = source.to_string();

    let finder_root = memmem::Finder::new(b"$effect.root(");
    let finder_pre = memmem::Finder::new(b"$effect.pre(");
    let finder_effect = memmem::Finder::new(b"$effect(");

    // Replace $effect.root(() => { ... }) with () => {} (a no-op cleanup function)
    // $effect.root returns a cleanup function, so we need to provide one.
    while let Some(pos) = finder_root.find(result.as_bytes()) {
        let call_start = pos + 13; // after "$effect.root("
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let expr_end = call_start + content_end + 1; // after closing paren
            let mut new_result = String::with_capacity(pos + 7 + result.len() - expr_end);
            new_result.push_str(&result[..pos]);
            new_result.push_str("() => {}");
            new_result.push_str(&result[expr_end..]);
            result = new_result;
        } else {
            break;
        }
    }

    // Strip $effect.pre(() => { ... }) blocks
    while let Some(pos) = finder_pre.find(result.as_bytes()) {
        let call_start = pos + 12;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let expr_end = call_start + content_end + 1;
            let mut end = expr_end;
            while end < result.len() && result.as_bytes()[end].is_ascii_whitespace() {
                end += 1;
            }
            if end < result.len() && result.as_bytes()[end] == b';' {
                end += 1;
            }
            let mut new_result = String::with_capacity(pos + result.len() - end);
            new_result.push_str(&result[..pos]);
            new_result.push_str(&result[end..]);
            result = new_result;
        } else {
            break;
        }
    }

    // Strip $effect(() => { ... }) blocks (but not $effect.root/$effect.pre which were already handled)
    while let Some(pos) = finder_effect.find(result.as_bytes()) {
        // Make sure this is not $effect.something (should already be handled above)
        if pos + 8 < result.len() && result.as_bytes()[pos + 7] == b'.' {
            break; // shouldn't happen since $effect.root and $effect.pre are already handled
        }
        let call_start = pos + 8; // after "$effect("
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let expr_end = call_start + content_end + 1;
            let mut end = expr_end;
            while end < result.len() && result.as_bytes()[end].is_ascii_whitespace() {
                end += 1;
            }
            if end < result.len() && result.as_bytes()[end] == b';' {
                end += 1;
            }
            let mut new_result = String::with_capacity(pos + result.len() - end);
            new_result.push_str(&result[..pos]);
            new_result.push_str(&result[end..]);
            result = new_result;
        } else {
            break;
        }
    }

    result
}

/// Post-process client module transform output for server context.
/// Replaces client-specific runtime calls with server equivalents.
fn post_process_for_server(source: &str) -> String {
    use super::client::find_matching_paren;
    let mut result = source.to_string();

    // Collect names declared as `let|const|var X = $.derived(...)` /
    // `$.derived_safe_equal(...)`. On the server, `$.derived(fn)` returns a
    // *callable* (upstream svelte `src/internal/server/index.js#derived`),
    // so reads via `$.get(X)` must rewrite to `X()` for derived names and to
    // `X` for plain state names. Without this distinction, derived values
    // become stale snapshots and downstream code (`get isValid()` etc.)
    // breaks when the underlying state mutates between calls.
    let derived_names = collect_derived_names(&result);

    let finder_effect_root = memmem::Finder::new(b"$.effect_root(");
    let finder_user_effect = memmem::Finder::new(b"$.user_effect(");
    let finder_proxy = memmem::Finder::new(b"$.proxy(");
    let finder_get = memmem::Finder::new(b"$.get(");
    let finder_set = memmem::Finder::new(b"$.set(");
    let finder_update = memmem::Finder::new(b"$.update(");
    let finder_update_pre = memmem::Finder::new(b"$.update_pre(");
    let finder_state = memmem::Finder::new(b"$.state(");

    // Helper: splice result string efficiently without format!
    macro_rules! splice {
        ($result:expr, $before_end:expr, $middle:expr, $after_start:expr) => {{
            let before = &$result[..$before_end];
            let after = &$result[$after_start..];
            let mut new = String::with_capacity(before.len() + $middle.len() + after.len());
            new.push_str(before);
            new.push_str($middle);
            new.push_str(after);
            new
        }};
    }

    // Replace $.effect_root(...) with () => {} (no-op cleanup)
    while let Some(pos) = finder_effect_root.find(result.as_bytes()) {
        let call_start = pos + 14;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let expr_end = call_start + content_end + 1;
            result = splice!(result, pos, "() => {}", expr_end);
        } else {
            break;
        }
    }

    // Remove $.user_effect(...) calls
    while let Some(pos) = finder_user_effect.find(result.as_bytes()) {
        let call_start = pos + 14;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let expr_end = call_start + content_end + 1;
            let mut end = expr_end;
            while end < result.len() && result.as_bytes()[end].is_ascii_whitespace() {
                end += 1;
            }
            if end < result.len() && result.as_bytes()[end] == b';' {
                end += 1;
            }
            result = splice!(result, pos, "", end);
        } else {
            break;
        }
    }

    // Replace $.proxy(x) with just x (no proxying on server)
    while let Some(pos) = finder_proxy.find(result.as_bytes()) {
        let call_start = pos + 8;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let content = result[call_start..call_start + content_end].to_string();
            result = splice!(result, pos, &content, call_start + content_end + 1);
        } else {
            break;
        }
    }

    // Replace $.get(x) for server modules:
    // - Simple identifiers naming a derived: $.get(x) -> x() (callable signal)
    // - Simple identifiers naming state:     $.get(x) -> x
    // - Member expressions (this.#x):        $.get(this.#x) -> this.#x() (callable in class)
    while let Some(pos) = finder_get.find(result.as_bytes()) {
        let call_start = pos + 6;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let content = result[call_start..call_start + content_end]
                .trim()
                .to_string();
            // Check if it's a member expression (contains '.')
            if memchr::memchr(b'.', content.as_bytes()).is_some() {
                // Member expression: keep as function call
                let mut replacement = String::with_capacity(content.len() + 2);
                replacement.push_str(&content);
                replacement.push_str("()");
                result = splice!(result, pos, &replacement, call_start + content_end + 1);
            } else if derived_names.contains(content.as_str()) {
                // Derived simple ident: callable on the server
                let mut replacement = String::with_capacity(content.len() + 2);
                replacement.push_str(&content);
                replacement.push_str("()");
                result = splice!(result, pos, &replacement, call_start + content_end + 1);
            } else {
                // Simple identifier (state): just the variable name
                result = splice!(result, pos, &content, call_start + content_end + 1);
            }
        } else {
            break;
        }
    }

    // Replace $.set(x, v[, flag]) for server modules:
    // - Simple identifiers: $.set(x, v) -> x = v
    // - Member expressions: $.set(this.#x, v) -> this.#x(v)
    while let Some(pos) = finder_set.find(result.as_bytes()) {
        let call_start = pos + 6;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let content = result[call_start..call_start + content_end].to_string();
            if let Some(comma_pos) = find_first_comma(&content) {
                let signal = content[..comma_pos].trim();
                let rest = content[comma_pos + 1..].trim();
                // Rest might be "value, flag" - take only the value (up to second comma)
                let value = if let Some(comma2_pos) = find_first_comma(rest) {
                    rest[..comma2_pos].trim()
                } else {
                    rest
                };
                if memchr::memchr(b'.', signal.as_bytes()).is_some() {
                    // Member expression: function call form
                    let mut replacement = String::with_capacity(signal.len() + 1 + value.len() + 1);
                    replacement.push_str(signal);
                    replacement.push('(');
                    replacement.push_str(value);
                    replacement.push(')');
                    result = splice!(result, pos, &replacement, call_start + content_end + 1);
                } else {
                    // Simple identifier: assignment form
                    let mut replacement = String::with_capacity(signal.len() + 3 + value.len());
                    replacement.push_str(signal);
                    replacement.push_str(" = ");
                    replacement.push_str(value);
                    result = splice!(result, pos, &replacement, call_start + content_end + 1);
                }
            } else {
                break;
            }
        } else {
            break;
        }
    }

    // Replace $.update_pre(x) with ++x for server modules.
    // IMPORTANT: Process $.update_pre BEFORE $.update to avoid prefix matching issues.
    // A second argument (`$.update_pre(x, -1)`) is the decrement form (`--x`); any
    // other delta `d` maps to `x += d` (H-031 — previously the raw `x, -1` content
    // was prefixed with `++`, producing invalid `++x, -1`).
    while let Some(pos) = finder_update_pre.find(result.as_bytes()) {
        let call_start = pos + 13;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let content = result[call_start..call_start + content_end].trim();
            let replacement = build_update_replacement(content, true);
            result = splice!(result, pos, &replacement, call_start + content_end + 1);
        } else {
            break;
        }
    }

    // Replace $.update(x) with x++ for server modules (and $.update(x, -1) with x--).
    while let Some(pos) = finder_update.find(result.as_bytes()) {
        let call_start = pos + 9;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let content = result[call_start..call_start + content_end].trim();
            let replacement = build_update_replacement(content, false);
            result = splice!(result, pos, &replacement, call_start + content_end + 1);
        } else {
            break;
        }
    }

    // NOTE: We intentionally do NOT strip `$.derived(...)` on the server.
    // Upstream svelte's server runtime exposes `$.derived(fn)` as a callable
    // that re-evaluates on each call (memoized only inside an SSR render
    // context), and `$.get(x)` reads above translate to `x()` for derived
    // names. Stripping the wrapper here would turn the derived into an
    // eagerly-evaluated snapshot, which silently freezes computed values
    // when their underlying state mutates — e.g. `isValid` in a form model
    // stays `false` even after the form is filled in.

    // Replace $.state(x) with just x (no signals on server)
    while let Some(pos) = finder_state.find(result.as_bytes()) {
        let call_start = pos + 8;
        if let Some(content_end) = find_matching_paren(&result[call_start..]) {
            let content = result[call_start..call_start + content_end].to_string();
            let trimmed = content.trim();
            let value = if trimmed.is_empty() {
                "void 0"
            } else {
                trimmed
            };
            result = splice!(result, pos, value, call_start + content_end + 1);
        } else {
            break;
        }
    }

    result
}

/// Scan a client-style module body and return the set of variable names
/// declared as `let|const|var X = $.derived(...)` / `$.derived_safe_equal(...)`.
///
/// Used by `post_process_for_server` so reads via `$.get(X)` can be lowered
/// to `X()` (the server runtime treats a derived as a callable) while plain
/// state reads stay as `X`.
fn collect_derived_names(source: &str) -> std::collections::HashSet<String> {
    use std::collections::HashSet;
    let mut names: HashSet<String> = HashSet::new();
    let patterns: &[&[u8]] = &[b"$.derived(", b"$.derived_safe_equal("];
    let bytes = source.as_bytes();
    for pat in patterns {
        let finder = memmem::Finder::new(*pat);
        for pos in finder.find_iter(bytes) {
            // Walk left from `pos` to find a `let|const|var <name> = ` shape.
            // We accept an optional `$.tag(` wrap directly before the
            // `$.derived(` — in dev-mode-disabled SSR rsvelte never emits
            // `$.tag`, but be permissive in case future builds do.
            let mut left = pos;
            // Skip back through `$.tag(` if present.
            // (Not currently emitted in SSR; left in for future-proofing.)
            const TAG: &[u8] = b"$.tag(";
            if left >= TAG.len() && &bytes[left - TAG.len()..left] == TAG {
                left -= TAG.len();
            }
            // Skip whitespace + `=`.
            while left > 0 && bytes[left - 1].is_ascii_whitespace() {
                left -= 1;
            }
            if left == 0 || bytes[left - 1] != b'=' {
                continue;
            }
            left -= 1;
            while left > 0 && bytes[left - 1].is_ascii_whitespace() {
                left -= 1;
            }
            // Read identifier backwards.
            let id_end = left;
            while left > 0 {
                let b = bytes[left - 1];
                if b.is_ascii_alphanumeric() || b == b'_' || b == b'$' {
                    left -= 1;
                } else {
                    break;
                }
            }
            if left == id_end {
                continue;
            }
            // Require a preceding `let`, `const`, or `var` keyword (with
            // whitespace separator). Otherwise this is a reassignment or
            // a class field, which we don't track here.
            let mut kw_end = left;
            while kw_end > 0 && bytes[kw_end - 1].is_ascii_whitespace() {
                kw_end -= 1;
            }
            let is_decl = (kw_end >= 3
                && (&bytes[kw_end - 3..kw_end] == b"let" || &bytes[kw_end - 3..kw_end] == b"var"))
                || (kw_end >= 5 && &bytes[kw_end - 5..kw_end] == b"const");
            if !is_decl {
                continue;
            }
            // Word-boundary check on the left side of the keyword.
            let kw_len =
                if &bytes[kw_end - 3..kw_end] == b"let" || &bytes[kw_end - 3..kw_end] == b"var" {
                    3
                } else {
                    5
                };
            let kw_start = kw_end - kw_len;
            if kw_start > 0 {
                let prev = bytes[kw_start - 1];
                if prev.is_ascii_alphanumeric() || prev == b'_' || prev == b'$' {
                    continue;
                }
            }
            if let Ok(name) = std::str::from_utf8(&bytes[left..id_end]) {
                names.insert(name.to_string());
            }
        }
    }
    names
}

/// Find the byte position of the first comma at bracket-depth 0, skipping
/// commas inside string / template literals and `//` / `/*` comments (H-032).
/// Without this, `$.set(name, 'Ada, Lovelace')` splits the value at the comma
/// inside the string literal.
fn find_first_comma(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' | b'"' | b'`' => {
                i = skip_string_literal(bytes, i);
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
                continue;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' if depth == 0 => return Some(i),
            _ => {}
        }
        i += 1;
    }
    None
}

/// Build the server replacement for a `$.update(...)` / `$.update_pre(...)` call
/// body. `prefix` selects `++x`/`--x` (update_pre) vs `x++`/`x--` (update).
///
/// - `signal`            -> `signal++` / `++signal`
/// - `signal, -1`        -> `signal--` / `--signal`
/// - `signal, d`         -> `signal += d` (return value is unused in SSR)
///
/// The args are split on a string/comment-aware comma so the signal expression
/// is never truncated (H-031).
fn build_update_replacement(content: &str, prefix: bool) -> String {
    let (signal, delta) = match find_first_comma(content) {
        Some(comma) => (content[..comma].trim(), Some(content[comma + 1..].trim())),
        None => (content, None),
    };
    match delta {
        None => {
            if prefix {
                format!("++{signal}")
            } else {
                format!("{signal}++")
            }
        }
        Some("-1") => {
            if prefix {
                format!("--{signal}")
            } else {
                format!("{signal}--")
            }
        }
        Some(d) => format!("{signal} += {d}"),
    }
}

/// Skip a string / template literal whose opening quote byte is at
/// `bytes[start]`. Returns the index just past the closing quote, handling
/// backslash escapes and (for template literals) balanced `${ … }`
/// interpolations.
fn skip_string_literal(bytes: &[u8], start: usize) -> usize {
    let quote = bytes[start];
    let mut i = start + 1;
    while i < bytes.len() {
        let c = bytes[i];
        if c == b'\\' {
            i += 2;
            continue;
        }
        if quote == b'`' && c == b'$' && bytes.get(i + 1) == Some(&b'{') {
            i += 2;
            let mut brace_depth = 1u32;
            while i < bytes.len() && brace_depth > 0 {
                match bytes[i] {
                    b'{' => brace_depth += 1,
                    b'}' => brace_depth -= 1,
                    _ => {}
                }
                i += 1;
            }
            continue;
        }
        i += 1;
        if c == quote {
            break;
        }
    }
    i
}

/// Server-side code generator.
pub(crate) struct ServerCodeGenerator<'a> {
    pub(crate) component_name: String,
    pub(crate) source: String,
    pub(crate) output_parts: Vec<OutputPart>,
    pub(crate) instance_script: Option<&'a Script>,
    /// Module script (context="module") - executed at module level outside component
    pub(crate) module_script: Option<&'a Script>,
    /// Map of constant variable names to their values
    pub(crate) constant_vars: FxHashMap<String, String>,
    /// Snippet definitions to be generated at module level
    pub(crate) snippets: Vec<SnippetDef>,
    /// Component analysis from Phase 2
    pub(crate) analysis: Option<&'a ComponentAnalysis>,
    /// Whether the component uses store subscriptions (requires $$store_subs variable)
    pub(crate) uses_store_subs: bool,
    /// Whether experimental.async is enabled
    pub(crate) use_async: bool,
    /// CSS injection info (hash, code) if css="injected"
    pub(crate) injected_css: Option<(String, String)>,
    /// Whether to skip hydration boundaries (empty comment markers after RenderTags/Components)
    /// This is true when the current fragment is "standalone" (contains only a single RenderTag/Component)
    pub(crate) skip_hydration_boundaries: bool,
    /// Whether the component uses TypeScript (lang="ts")
    pub(crate) is_typescript: bool,
    /// Current namespace context (html, svg, mathml).
    /// In SVG namespace, whitespace-only text nodes between elements are entirely removed.
    pub(crate) namespace: String,
    /// Whether to preserve whitespace (from <svelte:options preserveWhitespace /> or compile option).
    pub(crate) preserve_whitespace: bool,
    /// Whether to preserve HTML comments in server output (from preserveComments option).
    pub(crate) preserve_comments: bool,
    /// Whether dev mode is enabled (for $.validate_snippet_args etc.)
    pub(crate) dev: bool,
    /// Whether HMR is enabled. When true, the standalone-fragment optimization
    /// is disabled for components (matching official utils.js:288), which keeps
    /// the closing `<!---->` boundary so HMR can swap components reliably.
    pub(crate) hmr: bool,
    /// Whether compatibility.componentApi === 4 (legacy class API)
    pub(crate) component_api_v4: bool,
    /// Filename for dev mode (used for FILENAME assignment)
    pub(crate) filename: Option<String>,
    /// Whether we're inside a control-flow block body (if/each block body).
    /// When true, async expressions use plain `await expr` instead of `(await $.save(expr))()`.
    pub(crate) in_block_body: bool,
    /// Whether we're inside an if block body specifically.
    /// When true, async expressions use plain `await expr` instead of `(await $.save(expr))()`.
    /// Each block bodies still use $.save().
    pub(crate) in_if_body: bool,
    /// Counter for generating unique promise group names (promises, promises_1, promises_2, ...)
    /// Shared across nested generators via Rc<Cell> to ensure unique names across the component.
    pub(crate) const_promises_counter: std::rc::Rc<std::cell::Cell<usize>>,
    /// Mapping from variable names to their const-level blocker expressions.
    /// When a const tag declares an async variable in a `$$renderer.run()` group,
    /// the blocker (e.g., "promises[0]") is recorded here for subsequent const tags
    /// and expression tags to use for `$$renderer.async()` wrapping.
    /// Shared across nested generators via Rc<RefCell> so blockers from outer boundaries
    /// are visible in inner boundaries.
    pub(crate) const_blocker_map:
        std::rc::Rc<std::cell::RefCell<rustc_hash::FxHashMap<String, String>>>,
    /// Top-level `$$promises` blocker map computed from the instance script.
    /// Maps each identifier declared in (or reassigned by) an async-grouped
    /// thunk to its `$$promises` index. The const-tag visitor reads this so
    /// that `{@const}` declarations whose init references an async instance
    /// binding get an `$$renderer.run()` wait thunk (Svelte 5.55.3 cluster).
    pub(crate) top_level_blocker_map: rustc_hash::FxHashMap<String, usize>,
    /// Accumulator for async const tag grouping.
    /// When an async const tag is encountered, subsequent const tags in the same fragment
    /// are accumulated into this group. Flushed by the fragment visitor after processing all nodes.
    /// Format: (group_name, thunks, declared_variable_names_with_thunk_indices)
    pub(crate) async_consts: Option<AsyncConstsGroup>,
    /// Names of `$derived` / `$derived.by` bindings. On the server (Svelte 5.52+)
    /// every bare read of these names is rewritten to a call `name()`, so we
    /// need a quick lookup at template-emit sites that interpolate raw source
    /// expressions. Populated from the Phase 2 analysis.
    pub(crate) derived_names: FxHashSet<String>,
    /// Subset of `derived_names` declared with `var` — reads of these are
    /// rewritten to `name?.()` (matching upstream `build_getter`'s
    /// `declaration_kind === 'var' ? b.maybe_call : b.call`).
    pub(crate) derived_var_names: FxHashSet<String>,
}

/// Accumulator for grouping multiple const tags into a single `$$renderer.run()` call.
pub(crate) struct AsyncConstsGroup {
    /// The promise group name (e.g., "promises", "promises_1")
    pub name: String,
    /// The accumulated thunks (each is a string like "async () => { ... }" or "() => { ... }")
    pub thunks: Vec<(String, bool)>, // (thunk_code, is_async)
    /// Variable names declared in this group, with their thunk index for blocker registration
    pub declared_vars: Vec<(String, usize)>,
}

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn new(
        component_name: String,
        source: String,
        instance_script: Option<&'a Script>,
        module_script: Option<&'a Script>,
        analysis: Option<&'a ComponentAnalysis>,
        use_async: bool,
    ) -> Self {
        // Extract constant variables from script
        let mut constant_vars = FxHashMap::default();

        // Extract constants from module script first (only const declarations)
        if let Some(script) = module_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                for (k, v) in extract_constant_vars(&source[start..end], &source) {
                    constant_vars.insert(k, v);
                }
            }
        }

        // Then from instance script (both let and const)
        if let Some(script) = instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                for (k, v) in extract_constant_vars(&source[start..end], &source) {
                    constant_vars.insert(k, v);
                }
            }
        }

        // Add scope-based constants for $state variables that are not updated.
        // The text-based extraction skips $state lines, but if scope analysis shows
        // a $state binding is never reassigned/mutated, we can fold its initial value.
        if let Some(analysis) = analysis {
            for binding in &analysis.root.bindings {
                if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                    && !binding.is_updated()
                    && !constant_vars.contains_key(&binding.name)
                    && let Some(ref init) = binding.initial
                {
                    let trimmed = init.trim();
                    // Parse the initial value as a constant
                    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
                        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
                    {
                        if trimmed.len() >= 2 {
                            constant_vars.insert(
                                binding.name.clone(),
                                trimmed[1..trimmed.len() - 1].to_string(),
                            );
                        }
                    } else if let Ok(n) = trimmed.parse::<i64>() {
                        constant_vars.insert(binding.name.clone(), n.to_string());
                    } else if let Ok(n) = trimmed.parse::<f64>() {
                        if n.is_finite() {
                            constant_vars.insert(binding.name.clone(), n.to_string());
                        }
                    } else {
                        match trimmed {
                            "true" | "false" | "null" | "undefined" => {
                                constant_vars.insert(binding.name.clone(), trimmed.to_string());
                            }
                            _ => {}
                        }
                    }
                }
            }
        }

        // Check if any script uses TypeScript (needed for $derived expression stripping)
        let is_ts = instance_script.is_some_and(script_is_typescript)
            || module_script.is_some_and(script_is_typescript);

        // After we have both text-based and scope-based constants, try to fold
        // $derived() expressions whose inner value can be evaluated with known constants.
        // $derived values are readonly by definition, so they're safe to fold.
        if let Some(script) = instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                let script_content = &source[start..end];
                for line in script_content.lines() {
                    let trimmed = line.trim();
                    let tb = trimmed.as_bytes();
                    if memmem::find(tb, b"$derived(").is_none()
                        || memmem::find(tb, b"$derived.by(").is_some()
                    {
                        continue;
                    }
                    let decl_trimmed = if let Some(rest) = trimmed.strip_prefix("export ") {
                        rest.trim_start()
                    } else {
                        trimmed
                    };
                    let decl_start = if decl_trimmed.starts_with("const ") {
                        Some(6)
                    } else if decl_trimmed.starts_with("let ") {
                        Some(4)
                    } else {
                        None
                    };
                    if let Some(s) = decl_start {
                        let rest = &decl_trimmed[s..];
                        if let Some(eq_idx) = rest.find('=') {
                            let name = rest[..eq_idx].trim();
                            if name.contains('{')
                                || name.contains('[')
                                || constant_vars.contains_key(name)
                            {
                                continue;
                            }
                            let value = rest[eq_idx + 1..].trim().trim_end_matches(';');
                            if let Some(inner) = extract_rune_inner(value, "$derived(") {
                                // Strip TypeScript syntax (as T, !, etc.) from inner expression
                                let inner = strip_ts_from_derived_inner(&inner, is_ts);
                                if let Some(folded) =
                                    try_evaluate_with_constants(&inner, &constant_vars)
                                {
                                    constant_vars.insert(name.to_string(), folded);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Remove BindableProp variables from constant_vars.
        // Variables exported via `export { x }` are props and can receive values from parents,
        // so they should NOT be treated as constants even if they have literal initial values.
        // Also remove any binding that the scope analysis marks as updated (reassigned or mutated),
        // to handle cases that the text-based reassignment check misses (e.g. destructuring
        // assignments like `({ x } = { x: 1 })`).
        if let Some(analysis) = analysis {
            for binding in &analysis.root.bindings {
                if matches!(binding.kind, BindingKind::BindableProp) || binding.is_updated() {
                    constant_vars.remove(&binding.name);
                }
            }
        }

        // When experimental.async is enabled, remove variables that are in the
        // blocker_map from constant_vars. These variables are assigned asynchronously
        // in $$promises thunks and should NOT be constant-folded, because they need to
        // be rendered via $$renderer.async() wrappers.
        let mut top_level_blocker_map: rustc_hash::FxHashMap<String, usize> =
            rustc_hash::FxHashMap::default();
        if use_async && let Some(script) = instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                let raw_script = &source[start..end];
                let blocker_map = crate::compiler::phases::phase3_transform::shared::async_body::compute_blocker_map(raw_script);
                for name in blocker_map.keys() {
                    constant_vars.remove(name);
                }
                top_level_blocker_map = blocker_map;
            }
        }

        // Collect derived binding names from the analysis. We rewrite reads
        // of these to `name()` at template-emit sites (Svelte 5.52+).
        use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
        let derived_names: FxHashSet<String> = analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .filter(|b| matches!(b.kind, BindingKind::Derived))
                    .map(|b| b.name.clone())
                    .collect()
            })
            .unwrap_or_default();
        let derived_var_names: FxHashSet<String> = analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .filter(|b| {
                        matches!(b.kind, BindingKind::Derived)
                            && matches!(b.declaration_kind, DeclarationKind::Var)
                    })
                    .map(|b| b.name.clone())
                    .collect()
            })
            .unwrap_or_default();

        // Check if the analysis has any StoreSub bindings
        let uses_store_subs = analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .any(|b| matches!(b.kind, BindingKind::StoreSub))
            })
            .unwrap_or(false);

        // Check if any script uses TypeScript
        let is_typescript = instance_script.is_some_and(script_is_typescript)
            || module_script.is_some_and(script_is_typescript);

        // Determine namespace from component analysis
        let namespace = if analysis.is_some_and(|a| a.component_namespace_is_svg) {
            "svg".to_string()
        } else if analysis.is_some_and(|a| a.component_namespace_is_mathml) {
            "mathml".to_string()
        } else {
            "html".to_string()
        };

        Self {
            component_name,
            source,
            // Pre-allocate capacity based on typical component sizes
            // Average component has ~50-100 output parts
            output_parts: Vec::new(),
            instance_script,
            module_script,
            constant_vars,
            // Most components have 0-5 snippets
            snippets: Vec::new(),
            analysis,
            uses_store_subs,
            use_async,
            injected_css: None,
            skip_hydration_boundaries: false,
            is_typescript,
            namespace,
            preserve_whitespace: false,
            preserve_comments: false,
            dev: false,
            hmr: false,
            component_api_v4: false,
            filename: None,
            in_block_body: false,
            in_if_body: false,
            const_promises_counter: std::rc::Rc::new(std::cell::Cell::new(0)),
            const_blocker_map: std::rc::Rc::new(std::cell::RefCell::new(
                rustc_hash::FxHashMap::default(),
            )),
            top_level_blocker_map,
            async_consts: None,
            derived_names,
            derived_var_names,
        }
    }

    /// Create a generator for a child fragment with the given skip_hydration_boundaries flag
    pub(crate) fn new_child_generator(&self, skip_hydration_boundaries: bool) -> Self {
        Self {
            component_name: self.component_name.clone(),
            source: self.source.clone(),
            output_parts: Vec::new(),
            instance_script: None,
            module_script: None,
            constant_vars: self.constant_vars.clone(),
            snippets: Vec::new(),
            analysis: self.analysis,
            uses_store_subs: self.uses_store_subs,
            use_async: self.use_async,
            injected_css: None,
            skip_hydration_boundaries,
            is_typescript: self.is_typescript,
            namespace: self.namespace.clone(),
            preserve_whitespace: self.preserve_whitespace,
            preserve_comments: self.preserve_comments,
            dev: self.dev,
            hmr: self.hmr,
            component_api_v4: self.component_api_v4,
            filename: self.filename.clone(),
            in_block_body: self.in_block_body,
            in_if_body: self.in_if_body,
            const_promises_counter: self.const_promises_counter.clone(),
            const_blocker_map: self.const_blocker_map.clone(),
            top_level_blocker_map: self.top_level_blocker_map.clone(),
            async_consts: None,
            derived_names: self.derived_names.clone(),
            derived_var_names: self.derived_var_names.clone(),
        }
    }

    /// Set the injected CSS info (for css="injected" mode)
    pub(crate) fn set_injected_css(&mut self, hash: String, code: String) {
        self.injected_css = Some((hash, code));
    }

    /// Transform store subscriptions in an expression.
    /// Converts `$store` to `$.store_get($$store_subs ??= {}, '$store', store)`.
    /// Also handles `$store.prop = value` -> `$.store_mutate(...)` and
    /// `$store = value` -> `$.store_set(...)`.
    ///
    /// In Svelte 5.52+ this also rewrites bare reads of `$derived` bindings
    /// to calls (`foo` -> `foo()`). The wrap is gated on the binding set
    /// extracted from analysis, so static (non-derived) components pay
    /// nothing.
    pub(crate) fn transform_store_refs(&self, expr: &str) -> String {
        if !self.uses_store_subs {
            return self.wrap_derived_reads(expr);
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return expr.to_string(),
        };

        // Collect store subscription names from the analysis
        let store_sub_names: Vec<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect();

        if store_sub_names.is_empty() {
            return expr.to_string();
        }

        // First, transform store property mutations ($store.prop = value -> $.store_mutate)
        // BEFORE replacing references. This must happen first because
        // transform_store_property_mutations looks for the raw `$store` prefix.
        // Only call if the expression contains a potential store mutation pattern
        // ($identifier followed by . and later =).
        let has_store_mutation =
            store_sub_names.iter().any(|name| expr.contains(*name)) && expr.contains('=');
        let mut result = if has_store_mutation {
            transform_store::transform_store_property_mutations_public(expr)
        } else {
            expr.to_string()
        };

        // Transform each store subscription
        for name in &store_sub_names {
            // Skip if it doesn't start with $
            if !name.starts_with('$') {
                continue;
            }

            // Get the store variable name (without $)
            let store_name = &name[1..];

            // Replace $store with $.store_get($$store_subs ??= {}, '$store', store)
            // We need to be careful to only replace complete identifiers, not substrings
            result = replace_store_identifier(&result, name, store_name);
        }

        self.wrap_derived_reads(&result)
    }

    /// Transform special legacy variables in template expressions.
    /// In server-side legacy mode, `$$props` should be replaced with `$$sanitized_props`
    /// (as the official Svelte compiler does in its Identifier.js server visitor).
    pub(crate) fn transform_special_vars(&self, expr: &str) -> String {
        let analysis = match self.analysis {
            Some(a) => a,
            None => return expr.to_string(),
        };

        if analysis.runes {
            return expr.to_string();
        }

        // Replace $$props with $$sanitized_props if uses_props is set
        if analysis.uses_props && memmem::find(expr.as_bytes(), b"$$props").is_some() {
            return replace_identifier_in_expr(expr, "$$props", "$$sanitized_props");
        }

        expr.to_string()
    }

    /// Rewrite bare reads of `$derived` bindings to calls.
    ///
    /// On the server (Svelte 5.52+), every reference to a `derived` binding
    /// gets emitted as `name()` (or `name?.()` for `var`-kind declarations).
    /// Template-side expressions are pulled as raw source slices, so we run a
    /// string-level pass here using the names collected from analysis.
    pub(crate) fn wrap_derived_reads(&self, expr: &str) -> String {
        if self.derived_names.is_empty() {
            return expr.to_string();
        }
        crate::compiler::phases::phase3_transform::server::transform_script::wrap_derived_reads_for_template(
            expr,
            &self.derived_names,
            &self.derived_var_names,
        )
    }

    /// Transform rune calls in template expressions for server-side rendering.
    /// Handles: $state.eager(x) -> x, $state.snapshot(x) -> $.snapshot(x),
    ///          $effect.tracking() -> false, $effect.pending() -> false
    pub(crate) fn transform_rune_in_template_expr(expr: &str) -> String {
        use crate::compiler::phases::phase3_transform::server::transform_script::remove_effect_blocks;

        // AST-based pass: handles `$state.snapshot(x)` → `$.snapshot(x)`,
        // `$state.eager(x)` → `x` (whole-call unwrap), `$effect.tracking()` →
        // `false`, `$effect.pending()` → `0` in one parse. Replaces the
        // text-based byte scanners (`String::replace` + a custom
        // brace/quote tracker) that could be tripped by the same byte
        // patterns inside string literals. The AST visitor descends only
        // into expression positions. Returns `None` on parse failure, in
        // which case we leave the source untouched — the legacy text
        // helpers below covered cases that were already malformed
        // anyway.
        let mut result = expr.to_string();
        if let Some(rewritten) =
            crate::compiler::phases::phase3_transform::server::template_rune_ast::transform_template_rune_ast(
                &result,
            )
        {
            result = rewritten;
        }
        // Remove $effect(), $effect.pre(), $effect.root(), $inspect(), $inspect.trace() blocks
        // These are client-side only and should be stripped in SSR template expressions too
        if memmem::find(result.as_bytes(), b"$effect(").is_some()
            || memmem::find(result.as_bytes(), b"$effect.pre(").is_some()
            || memmem::find(result.as_bytes(), b"$effect.root(").is_some()
            || memmem::find(result.as_bytes(), b"$inspect(").is_some()
            || memmem::find(result.as_bytes(), b"$inspect.trace(").is_some()
        {
            result = remove_effect_blocks(&result, false, false);
        }
        result
    }

    /// Strip TypeScript syntax from a template expression string.
    ///
    /// This wraps the expression in a parseable JavaScript statement (`var _ = EXPR;`),
    /// runs `strip_typescript()` to remove TS-specific syntax (like non-null assertions `!`,
    /// type assertions `as T`, etc.), then extracts the cleaned expression back.
    pub(crate) fn strip_ts_from_expr(&self, expr: &str) -> String {
        if !self.is_typescript {
            return expr.to_string();
        }
        use crate::compiler::phases::phase2_analyze::types::strip_typescript;
        let wrapper = format!("var _ = {};", expr);
        let stripped = strip_typescript(&wrapper);
        // Extract the expression back: "var _ = EXPR;"
        if let Some(rest) = stripped.strip_prefix("var _ = ") {
            let result = rest.trim_end_matches(';').trim();
            result.to_string()
        } else {
            // Fallback if stripping changed the structure
            expr.to_string()
        }
    }

    /// Strip TypeScript from a component prop string (e.g., `key: (arg: Type) => expr`).
    pub(crate) fn strip_ts_from_prop(&self, prop: &str) -> String {
        if !self.is_typescript {
            return prop.to_string();
        }
        use crate::compiler::phases::phase2_analyze::types::strip_typescript;
        let wrapper = format!("var _ = {{ {} }};", prop);
        let stripped = strip_typescript(&wrapper);
        // Extract back: "var _ = { PROP };"
        if let Some(rest) = stripped.strip_prefix("var _ = {") {
            let rest = rest.trim();
            if let Some(inner) = rest.strip_suffix("};") {
                let result = inner.trim();
                return result.to_string();
            }
        }
        prop.to_string()
    }

    /// Transform store subscriptions in script content.
    /// This is used for the instance script where store references like `$page`
    /// need to be transformed to `$.store_get($$store_subs ??= {}, '$page', page)`.
    pub(crate) fn transform_store_refs_in_script(&self, script: &str) -> String {
        if !self.uses_store_subs {
            return script.to_string();
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return script.to_string(),
        };

        // Collect store subscription names from the analysis
        let store_sub_names: Vec<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect();

        if store_sub_names.is_empty() {
            return script.to_string();
        }

        let mut result = script.to_string();

        // Transform each store subscription
        for name in store_sub_names {
            // Skip if it doesn't start with $
            if !name.starts_with('$') {
                continue;
            }

            // Get the store variable name (without $)
            let store_name = &name[1..];

            // Replace $store with $.store_get($$store_subs ??= {}, '$store', store)
            // We need to be careful to only replace complete identifiers, not substrings
            // Also need to skip store assignments which are handled separately
            result = replace_store_identifier_in_script(&result, name, store_name);
        }

        result
    }

    /// Collect store subscription names from the analysis.
    /// Returns a list of (store_ref, store_name) pairs like ("$a", "a").
    pub(crate) fn get_store_sub_names(&self) -> Vec<(String, String)> {
        if !self.uses_store_subs {
            return Vec::new();
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return Vec::new(),
        };

        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .filter(|b| b.name.starts_with('$'))
            .map(|b| (b.name.clone(), b.name[1..].to_string()))
            .collect()
    }

    /// Check if a fragment is "standalone" (contains only a single RenderTag or Component).
    /// When standalone, hydration boundaries can be skipped because the parent's anchors are sufficient.
    pub(crate) fn is_standalone_fragment(&self, nodes: &[TemplateNode]) -> bool {
        // Filter out whitespace-only text, comments, and hoisted nodes
        // (matching clean_nodes behavior in the official compiler)
        let meaningful_nodes: Vec<_> = nodes
            .iter()
            .filter(|n| match n {
                TemplateNode::Text(text) => !is_svelte_whitespace_only(&text.data),
                TemplateNode::Comment(_) => false,
                // These node types are hoisted out by clean_nodes in the official compiler
                TemplateNode::SnippetBlock(_) => false,
                TemplateNode::ConstTag(_) => false,
                TemplateNode::SvelteBody(_) => false,
                TemplateNode::SvelteWindow(_) => false,
                TemplateNode::SvelteDocument(_) => false,
                TemplateNode::SvelteHead(_) => false,
                TemplateNode::TitleElement(_) => false,
                _ => true,
            })
            .collect();

        // Standalone if there's exactly one node and it's a non-dynamic RenderTag or Component
        // (matching official compiler's clean_nodes logic)
        if meaningful_nodes.len() != 1 {
            return false;
        }
        match meaningful_nodes[0] {
            TemplateNode::RenderTag(tag) => !tag.metadata.dynamic,
            TemplateNode::Component(comp) => {
                // Mirrors official utils.js:288 — when HMR is enabled, components
                // must keep their boundary comments so the runtime can swap them.
                !self.hmr
                    && !comp.metadata.dynamic
                    && !comp.attributes.iter().any(|attr| {
                        matches!(attr, crate::ast::template::Attribute::Attribute(a) if a.name.starts_with("--"))
                    })
            }
            _ => false,
        }
    }

    /// Infer namespace from fragment children nodes.
    /// If all RegularElement children are SVG, returns "svg".
    /// If all are MathML, returns "mathml".
    /// Otherwise returns the parent namespace.
    fn infer_namespace_from_nodes_static(
        nodes: &[&TemplateNode],
        parent_namespace: &str,
    ) -> String {
        let mut found_namespace: Option<&str> = None;

        for node in nodes {
            if let TemplateNode::RegularElement(el) = node {
                if el.metadata.svg {
                    match found_namespace {
                        None => found_namespace = Some("svg"),
                        Some("svg") => {}
                        _ => return "html".to_string(),
                    }
                } else if el.metadata.mathml {
                    match found_namespace {
                        None => found_namespace = Some("mathml"),
                        Some("mathml") => {}
                        _ => return "html".to_string(),
                    }
                } else {
                    return "html".to_string();
                }
            }
        }

        found_namespace
            .map(|s| s.to_string())
            .unwrap_or_else(|| parent_namespace.to_string())
    }

    pub(crate) fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Infer namespace from fragment children for SVG whitespace stripping
        let inferred_ns = Self::infer_namespace_from_nodes_static(&nodes, &self.namespace);
        if inferred_ns != self.namespace {
            self.namespace = inferred_ns.clone();
        }
        let can_remove_whitespace_entirely = inferred_ns == "svg";

        // Helper to check if a node is "meaningful" for SSR output purposes
        // SvelteWindow, SvelteDocument, SvelteBody don't render anything in SSR
        // When preserveWhitespace is true, whitespace-only text IS meaningful
        let preserve_ws = self.preserve_whitespace;
        let preserve_cmts = self.preserve_comments;
        let is_ssr_meaningful = |n: &&TemplateNode| {
            (!matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                || preserve_ws)
                && (!matches!(n, TemplateNode::Comment(_)) || preserve_cmts)
                && !matches!(n, TemplateNode::SvelteWindow(_))
                && !matches!(n, TemplateNode::SvelteDocument(_))
                && !matches!(n, TemplateNode::SvelteBody(_))
        };

        // Find indices of first and last non-whitespace nodes (excluding SSR-invisible elements)
        let first_meaningful_idx = nodes.iter().position(is_ssr_meaningful);
        let last_meaningful_idx = nodes.iter().rposition(is_ssr_meaningful);

        // Check if the root fragment is standalone (only a single RenderTag/Component)
        // to determine if we should skip hydration boundaries
        self.skip_hydration_boundaries = self.is_standalone_fragment(&fragment.nodes);

        // If the first meaningful node is a Text or ExpressionTag, add <!---->
        // to prevent text fusion during hydration.
        // Skip SvelteOptions nodes since they don't produce output.
        let first_visible_idx = first_meaningful_idx.and_then(|start| {
            nodes[start..].iter().position(|n| {
                !matches!(n, TemplateNode::SvelteOptions(_))
                    && (preserve_ws || !matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data)))
            }).map(|offset| start + offset)
        });
        let first_visible_node = first_visible_idx.map(|i| &nodes[i]);
        let needs_anchor = matches!(
            first_visible_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        if needs_anchor {
            self.output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        // Track whether we need to trim leading whitespace from the first text node
        // When an anchor comment is added, the next text should not have a leading space
        let mut trim_leading_ws = needs_anchor;
        // Track whether the previous visible text ended with whitespace.
        // Used to collapse whitespace across hoisted nodes (SnippetBlock, ConstTag).
        // When text before a hoisted node ends with whitespace and text after starts with
        // whitespace, the leading whitespace of the text-after is trimmed to avoid double space.
        let mut prev_text_ends_with_ws = false;

        for (i, node) in nodes.iter().enumerate() {
            // Skip whitespace-only text at root level (unless preserveWhitespace is set)
            if !self.preserve_whitespace
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                // In SVG namespace, skip whitespace-only text nodes entirely
                // (matching official compiler's can_remove_entirely in clean_nodes)
                if can_remove_whitespace_entirely {
                    continue;
                }
                // Skip if there is no meaningful content at all (e.g. component with only
                // <script> blocks and no template nodes - whitespace between/after scripts
                // should not be emitted as $$renderer.push(` `)).
                if last_meaningful_idx.is_none() {
                    continue;
                }
                // Skip if before first meaningful content
                if first_meaningful_idx.is_some() && i < first_meaningful_idx.unwrap() {
                    continue;
                }
                // Skip if after last meaningful content
                if last_meaningful_idx.is_some() && i > last_meaningful_idx.unwrap() {
                    continue;
                }
                // Skip whitespace adjacent to snippets at root level, but only
                // when the snippet is at the edge (no non-hoisted content on the other side).
                // When snippets are between content nodes, we need to preserve one space
                // (matching clean_nodes which merges text around hoisted nodes).
                //
                // Check if previous node is a snippet at the leading edge.
                // Only skip whitespace after snippet when there's no real content
                // before the snippet (i.e., snippet is at the start of the fragment).
                // When the snippet is between content nodes, the whitespace should be
                // handled by prev_text_ends_with_ws collapsing, not skipped entirely.
                if i > 0
                    && let TemplateNode::SnippetBlock(_) = nodes[i - 1]
                {
                    let has_content_before_snippet = nodes[..i - 1].iter().any(|n| {
                        !matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                            && (!matches!(n, TemplateNode::Comment(_)) || self.preserve_comments)
                            && !matches!(n, TemplateNode::SnippetBlock(_))
                            && !matches!(n, TemplateNode::ConstTag(_))
                    });
                    if !has_content_before_snippet {
                        continue;
                    }
                    // When there IS content before, let the whitespace go through
                    // normal processing with prev_text_ends_with_ws collapsing
                }
                // Check if next node is a snippet
                if i + 1 < len
                    && let TemplateNode::SnippetBlock(_) = nodes[i + 1]
                {
                    // Check if there's meaningful content after the snippet
                    // If so, keep this whitespace to produce the space between the
                    // pre-snippet content and the post-snippet content
                    let has_content_after_snippet = nodes[i + 2..].iter().any(|n| {
                        !matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                            && (!matches!(n, TemplateNode::Comment(_)) || self.preserve_comments)
                            && !matches!(n, TemplateNode::SnippetBlock(_))
                    });
                    if !has_content_after_snippet {
                        continue;
                    }
                    // Keep this whitespace - it will produce a space
                }
                // Skip whitespace after SvelteHead (head elements are hoisted in official compiler)
                if i > 0 && matches!(nodes[i - 1], TemplateNode::SvelteHead(_)) {
                    continue;
                }
                // Skip whitespace before SvelteHead
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::SvelteHead(_)) {
                    continue;
                }
                // Skip whitespace around SvelteWindow/SvelteDocument/SvelteBody
                // (these don't render in SSR). But only skip if there's no visible
                // content on the other side - if both sides have visible content,
                // ONE whitespace node should be preserved to produce a space between them.
                // We always skip whitespace AFTER non-rendering nodes, and conditionally
                // keep whitespace BEFORE non-rendering nodes (to avoid double spaces).
                {
                    let is_non_rendering = |n: &TemplateNode| {
                        matches!(n, TemplateNode::SvelteWindow(_))
                            || matches!(n, TemplateNode::SvelteDocument(_))
                            || matches!(n, TemplateNode::SvelteBody(_))
                    };
                    let prev_is_non_rendering = i > 0 && is_non_rendering(nodes[i - 1]);
                    let next_is_non_rendering = i + 1 < len && is_non_rendering(nodes[i + 1]);

                    if prev_is_non_rendering {
                        // Always skip whitespace after a non-rendering node.
                        // The whitespace before the non-rendering node (if any) provides the space.
                        continue;
                    }
                    if next_is_non_rendering {
                        // Whitespace before a non-rendering node: keep only if there's
                        // visible content on both sides of the non-rendering group.
                        let has_visible_before = nodes[..i].iter().any(|n| {
                            !matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                                && !is_non_rendering(n)
                                && !matches!(n, TemplateNode::SvelteHead(_))
                                && !matches!(n, TemplateNode::SnippetBlock(_))
                                && !matches!(n, TemplateNode::ConstTag(_))
                                && !matches!(n, TemplateNode::DebugTag(_))
                                && (!matches!(n, TemplateNode::Comment(_)) || self.preserve_comments)
                        });
                        // Look past all consecutive non-rendering nodes + whitespace for visible content
                        let has_visible_after = {
                            let mut found = false;
                            let mut j = i + 1;
                            while j < len {
                                let n = nodes[j];
                                if is_non_rendering(n)
                                    || matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                                {
                                    j += 1;
                                    continue;
                                }
                                found = true;
                                break;
                            }
                            found
                        };

                        if !has_visible_before || !has_visible_after {
                            continue;
                        }
                        // Both sides have visible content - keep this whitespace
                    }
                }
                // Skip whitespace around DebugTag ({@debug} generates JS code but no HTML)
                if i > 0 && matches!(nodes[i - 1], TemplateNode::DebugTag(_)) {
                    continue;
                }
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::DebugTag(_)) {
                    continue;
                }
                // Comments are transparent during rendering (stripped in clean_nodes).
                // Whitespace before/after comments is handled naturally by the
                // prev_text_ends_with_ws collapsing mechanism, which also handles
                // whitespace around SnippetBlocks and ConstTags.
                // Whitespace AFTER a comment doesn't need special handling because
                // the Comment node doesn't reset prev_text_ends_with_ws.
            }
            // Handle text node modifications:
            // 1. Trim leading whitespace from the first text after anchor comment
            // 2. Trim trailing whitespace from the last meaningful text node
            // 3. Collapse leading whitespace when previous text ended with whitespace
            //    (across hoisted nodes like SnippetBlock)
            // Skip these modifications when preserveWhitespace is set
            if !self.preserve_whitespace
                && let TemplateNode::Text(text) = node
            {
                let mut modified_data = text.data.to_string();
                let mut needs_modification = false;

                // Trim leading whitespace if this is the first text after an anchor comment
                if trim_leading_ws {
                    let trimmed = modified_data.trim_start().to_string();
                    if trimmed != modified_data {
                        modified_data = trimmed;
                        needs_modification = true;
                    }
                    trim_leading_ws = false;
                }

                // Collapse leading whitespace when previous visible text ended with whitespace.
                // This handles the case where a hoisted node (SnippetBlock) was between
                // two text nodes: "A\n" + SnippetBlock + "\nB" → "A B" (not "A  B")
                if prev_text_ends_with_ws {
                    let trimmed = modified_data
                        .trim_start_matches(|c: char| {
                            matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C')
                        })
                        .to_string();
                    if trimmed != modified_data {
                        modified_data = trimmed;
                        needs_modification = true;
                    }
                }

                // Trim trailing whitespace from the last meaningful text node
                if last_meaningful_idx.is_some() && i == last_meaningful_idx.unwrap() {
                    let trimmed = modified_data.trim_end().to_string();
                    if trimmed != modified_data {
                        modified_data = trimmed;
                        needs_modification = true;
                    }
                }

                // Track whether this text ends with whitespace (for collapsing across hoisted nodes)
                prev_text_ends_with_ws = modified_data.ends_with([' ', '\t', '\r', '\n']);

                // Determine whether prev/next non-hoisted sibling is an ExpressionTag.
                let prev_is_expression = {
                    let mut pi = i;
                    loop {
                        if pi == 0 {
                            break false;
                        }
                        pi -= 1;
                        let pn = &nodes[pi];
                        let pn_hoisted = matches!(pn, TemplateNode::ConstTag(_))
                            || matches!(pn, TemplateNode::SnippetBlock(_))
                            || (matches!(pn, TemplateNode::Comment(_)) && !self.preserve_comments);
                        if !pn_hoisted {
                            break matches!(pn, TemplateNode::ExpressionTag(_));
                        }
                    }
                };
                let next_is_expression = {
                    let mut ni = i + 1;
                    loop {
                        if ni >= nodes.len() {
                            break false;
                        }
                        let nn = &nodes[ni];
                        let nn_hoisted = matches!(nn, TemplateNode::ConstTag(_))
                            || matches!(nn, TemplateNode::SnippetBlock(_))
                            || (matches!(nn, TemplateNode::Comment(_)) && !self.preserve_comments);
                        if !nn_hoisted {
                            break matches!(nn, TemplateNode::ExpressionTag(_));
                        }
                        ni += 1;
                    }
                };

                // For whitespace-only text between ExpressionTags, preserve as-is
                if is_svelte_whitespace_only(&modified_data)
                    && prev_is_expression
                    && next_is_expression
                {
                    use crate::compiler::phases::phase3_transform::shared::sanitize_template_string;
                    self.output_parts
                        .push(OutputPart::Html(sanitize_template_string(&modified_data)));
                    continue;
                }

                // Use generate_text_with_expr_context for proper ExpressionTag-adjacent
                // whitespace preservation
                if needs_modification {
                    let mut modified_text = text.clone();
                    modified_text.data = modified_data.into();
                    self.generate_text_with_expr_context(
                        &modified_text,
                        prev_is_expression,
                        next_is_expression,
                    )?;
                    continue;
                } else {
                    self.generate_text_with_expr_context(
                        text,
                        prev_is_expression,
                        next_is_expression,
                    )?;
                    continue;
                }
            } else {
                // Reset trim flag when we hit a non-text, non-whitespace node
                if trim_leading_ws
                    && first_meaningful_idx.is_some()
                    && i >= first_meaningful_idx.unwrap()
                {
                    trim_leading_ws = false;
                }
                // Reset prev_text_ends_with_ws for non-hoisted/non-transparent nodes.
                // SnippetBlock, ConstTag, and Comment (when !preserveComments) are
                // transparent: they don't affect whitespace collapsing between text nodes.
                let is_transparent = matches!(node, TemplateNode::SnippetBlock(_))
                    || matches!(node, TemplateNode::ConstTag(_))
                    || (matches!(node, TemplateNode::Comment(_)) && !self.preserve_comments);
                if !is_transparent {
                    prev_text_ends_with_ws = false;
                }
            }

            self.generate_node(node, true)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::{build_update_replacement, find_first_comma};

    #[test]
    fn find_first_comma_skips_string_literals() {
        // H-032: a comma inside a string/template literal is not a separator.
        assert_eq!(find_first_comma("name, 'Ada, Lovelace'"), Some(4));
        assert_eq!(find_first_comma("'Ada, Lovelace'"), None);
        assert_eq!(find_first_comma("`a, ${b}`, c"), Some(9));
        assert_eq!(find_first_comma("f(a, b), c"), Some(7));
        // Comment commas are ignored too.
        assert_eq!(find_first_comma("x /* a, b */, y"), Some(12));
    }

    #[test]
    fn update_replacement_handles_increment_decrement_and_delta() {
        // H-031: `$.update(count, -1)` must not become `count, -1++`.
        assert_eq!(build_update_replacement("count", false), "count++");
        assert_eq!(build_update_replacement("count", true), "++count");
        assert_eq!(build_update_replacement("count, -1", false), "count--");
        assert_eq!(build_update_replacement("count, -1", true), "--count");
        // A non-(-1) delta falls back to compound assignment.
        assert_eq!(build_update_replacement("count, 2", false), "count += 2");
    }
}
