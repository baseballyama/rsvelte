//! Script content transformation functions for server-side rendering.
//!
//! This module contains functions that transform script content (instance and module scripts)
//! for server-side code generation, including rune transformations, class field transforms,
//! and effect block removal.

use super::helpers::sanitize_identifier;
use super::transform_legacy::transform_export_let_declarations;
use super::transform_store::{
    transform_store_assignments, transform_store_destructure_assignments,
};
use memchr::memmem;
use rustc_hash::FxHashSet;
use std::fmt::Write as _;

pub(crate) fn transform_script_content_module(script: &str, dev: bool) -> String {
    transform_script_content_inner(
        script,
        true,
        &[],
        &FxHashSet::default(),
        &FxHashSet::default(),
        &FxHashSet::default(),
        dev,
    )
}

/// Transform script content for server-side rendering, with pre-extracted
/// imported names and store-subscription base names (e.g. `state` when a
/// destructured prop `state` shadows the `$state` rune).
pub(crate) fn transform_script_content_with_imports(
    script: &str,
    imported_names: &FxHashSet<String>,
    store_sub_bases: &FxHashSet<String>,
    dev: bool,
) -> String {
    transform_script_content_inner(
        script,
        false,
        &[],
        imported_names,
        &FxHashSet::default(),
        store_sub_bases,
        dev,
    )
}

/// Transform script content with additional bindable prop names and pre-extracted imported names.
pub(crate) fn transform_script_content_with_props_and_imports(
    script: &str,
    reexported_props: &[(String, String)],
    imported_names: &FxHashSet<String>,
    store_sub_bases: &FxHashSet<String>,
    dev: bool,
) -> String {
    transform_script_content_inner(
        script,
        false,
        reexported_props,
        imported_names,
        &FxHashSet::default(),
        store_sub_bases,
        dev,
    )
}

/// Like `transform_script_content_with_imports`, but seeds extra derived
/// binding names (e.g. the component's full set of `$derived` bindings) so a
/// cross-declaration-tag derived read is wrapped to `name()`.
pub(crate) fn transform_script_content_with_imports_and_derived(
    script: &str,
    imported_names: &FxHashSet<String>,
    extra_derived: &FxHashSet<String>,
    dev: bool,
) -> String {
    transform_script_content_inner(
        script,
        false,
        &[],
        imported_names,
        extra_derived,
        &FxHashSet::default(),
        dev,
    )
}

fn transform_script_content_inner(
    script: &str,
    is_module: bool,
    reexported_props: &[(String, String)],
    imported_names: &FxHashSet<String>,
    extra_derived: &FxHashSet<String>,
    store_sub_bases: &FxHashSet<String>,
    dev: bool,
) -> String {
    // Check if rune base names are imported OR are store-subscription bases
    // (making `$state(...)` a store subscription, not a rune). Upstream
    // `get_global_keypath` returns null for any `$x` whose base `x` resolves to
    // a binding — import vs prop is irrelevant (scope.js:1467). So a destructured
    // prop `let { state } = $props()` also shadows the `$state` rune.
    let state_imported = imported_names.contains("state") || store_sub_bases.contains("state");
    let derived_imported =
        imported_names.contains("derived") || store_sub_bases.contains("derived");

    // NOTE: split_comma_separated_declarations has been moved to build.rs to run
    // BEFORE transform_reassigned_destructures. This ensures user-written comma-separated
    // declarations are split, but generated comma patterns (from destructure flattening)
    // are preserved.

    let script = if memmem::find(script.as_bytes(), b"$props()").is_some() {
        script.replace("$props()", "$$props")
    } else {
        script.to_string()
    };
    let script = transform_rune_call_multiline(&script, "$state.eager(");
    let script = if memmem::find(script.as_bytes(), b"$effect.pending()").is_some() {
        script.replace("$effect.pending()", "0")
    } else {
        script
    };
    let script = if memmem::find(script.as_bytes(), b"$effect.tracking()").is_some() {
        script.replace("$effect.tracking()", "false")
    } else {
        script
    };
    // Replace $props.id() with $.props_id($$renderer) and upgrade let to const
    // (matches official compiler behavior)
    let script = if memmem::find(script.as_bytes(), b"$props.id()").is_some() {
        let s = script.replace("$props.id()", "$.props_id($$renderer)");
        // Convert "let id = $.props_id($$renderer)" to "const id = ..."
        s.replace(
            "let id = $.props_id($$renderer)",
            "const id = $.props_id($$renderer)",
        )
    } else {
        script
    };
    // Replace $host() with `(void 0)` — upstream's server CallExpression
    // visitor returns `b.void0` for the $host rune (custom elements have no
    // host on the server).
    let script = if memmem::find(script.as_bytes(), b"$host()").is_some() {
        script.replace("$host()", "(void 0)")
    } else {
        script
    };
    let script = transform_state_snapshot_server(&script, dev);
    let script = if !state_imported {
        transform_object_destructure_state(&script)
    } else {
        script
    };
    let script = if !state_imported {
        transform_rune_call_multiline(&script, "$state.raw(")
    } else {
        script
    };
    let script = if !state_imported {
        transform_array_destructure_state(&script)
    } else {
        script
    };
    let script = if !state_imported {
        transform_rune_call_multiline(&script, "$state(")
    } else {
        script
    };
    // Svelte 5.52+: destructured `$derived(...)` / `$derived.by(...)` expands
    // into per-leaf `$.derived(...)` declarators (extract_paths semantics).
    // This must run BEFORE the plain `$derived[.by](` rewrites below so the
    // expanded form can use the standard pipeline.
    let script = if !derived_imported {
        expand_destructured_derived(&script)
    } else {
        script
    };
    let script = if !derived_imported {
        transform_rune_call_multiline(&script, "$derived.by(")
    } else {
        script
    };
    let script = if !derived_imported {
        transform_rune_call_multiline(&script, "$derived(")
    } else {
        script
    };
    // Svelte 5.52+: derived bindings now stay callable on the server, so any
    // bare read of a derived name must be rewritten to `name()`. Collect names
    // from the `$.derived(...)` declarators we just emitted, then wrap reads.
    let script = wrap_derived_reads_in_script(&script, extra_derived);
    // Svelte 5.53.2 (upstream `6aa7b9c64` "fix: update expressions on server
    // deriveds"): `name++` / `--name` etc. on a derived must use
    // `$.update_derived(name)` / `$.update_derived_pre(name)` helpers. After
    // `wrap_derived_reads_in_script` the source looks like `name()++`; this
    // pass rewrites those wrappers to the proper helpers.
    let script = rewrite_derived_update_expressions(&script);
    // Assignments to deriveds become setter calls on the server (upstream
    // `AssignmentExpression.js` server visitor): `likes = x` → `likes(x)`,
    // and compound operators expand via `build_assignment_value` —
    // `likes += 1` → `likes(likes() + 1)`, `flag &&= x` → `flag(flag() && x)`.
    // After `wrap_derived_reads_in_script` the LHS read is already `likes()`,
    // so we rewrite the `likes() <op>= rhs` shape here.
    let script = rewrite_derived_assignments(&script);
    // Svelte 5.55.5 (upstream `b771df3`): `$derived(<bare_derived>)` should
    // emit `$.derived(<bare_derived>)` directly (no thunk), because the
    // server runtime treats a derived passed in this slot as a re-callable
    // dependency. After `wrap_derived_reads_in_script` the bare ident gets
    // wrapped to `<name>()`, leaving us with `$.derived(() => <name>())` —
    // collapse that pattern back to `$.derived(<name>)`.
    let script = unthunk_bare_derived_arg(&script);
    let script = transform_rune_call_multiline(&script, "$bindable(");
    let script = transform_store_destructure_assignments(&script);
    let script = transform_store_assignments(&script);
    let script = if is_module {
        script
    } else {
        transform_export_let_declarations(&script)
    };
    let script = if is_module {
        script
    } else {
        strip_export_from_declarations(&script)
    };
    // Transform `let x = value` declarations for variables exported via `export { x }`
    let script = if !reexported_props.is_empty() {
        transform_reexported_prop_declarations(&script, reexported_props)
    } else {
        script
    };

    let mut result = String::with_capacity(script.len());
    // Track whether we're inside a multi-line template literal.
    // When inside, lines should be passed through as-is without formatting.
    let mut in_template_literal = false;

    let all_lines: Vec<&str> = script.lines().collect();
    for (line_idx, line) in all_lines.iter().enumerate() {
        let line = *line;
        let trimmed = line.trim();

        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        // If we're inside a multi-line template literal, pass through as-is
        if in_template_literal {
            // Check if this line closes the template literal
            in_template_literal = !line_closes_template_literal(line);
            if line.starts_with('\t') {
                result.push_str(line);
            } else if trimmed.is_empty() {
                // skip empty lines
            } else {
                result.push('\t');
                result.push_str(trimmed);
            }
            result.push('\n');
            continue;
        }

        let line = format_js_line(line);
        // Check next non-empty line to determine if current line is a continuation
        let next_trimmed = all_lines[(line_idx + 1)..]
            .iter()
            .find(|l| !l.trim().is_empty())
            .map(|l| l.trim())
            .unwrap_or("");
        let line = add_statement_semicolon(&line, next_trimmed);

        // Check if this line opens a template literal that doesn't close on this line
        in_template_literal = line_opens_unclosed_template_literal(&line);

        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line
        } else {
            result.push('\t');
            result.push_str(trimmed);
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    // Collapse multi-line template literals to single lines, matching esrap behavior.
    // This is safe for script content (user code only, not template renderer pushes).
    result = collapse_multiline_template_literals(&result);

    // Post-processing: add missing semicolons to multi-line let/const/var declarations.
    // When a declaration spans multiple lines (e.g., `let b = (() => {\n...\n})()`),
    // the last line may lack a semicolon because `add_statement_semicolon` only checks
    // individual lines. We detect this by tracking bracket depth across lines.
    result = fix_multiline_declaration_semicolons(&result);

    // Normalize IIFE patterns: (function(a){...}(args)) → (function(a){...})(args)
    // The official Svelte compiler's AST printer (esrap) normalizes these automatically.
    result = normalize_iife_parens(&result);

    // Strip unnecessary parens around arrow functions: (() => { ... }) → () => { ... }
    // when they're not part of an IIFE call.
    result = strip_arrow_function_parens(result);

    // In legacy mode (non-module, non-runes), reorder $: reactive statements
    // to appear after function declarations (to match official Svelte SSR behavior)
    if !is_module {
        super::transform_legacy::reorder_reactive_statements_after_functions(&result)
    } else {
        // In a `<script module>` body, a top-level `$:` labeled reactive
        // statement is dropped on the server: upstream's server
        // LabeledStatement visitor returns `b.empty` and collects it into the
        // (instance) reactive-statement set, which a module has no component
        // body to emit, so it vanishes. The client keeps it as a plain label.
        strip_top_level_reactive_labels(&result)
    }
}

/// Remove top-level (brace-depth 0) `$:` labeled statements from a module body.
/// String / template / comment contents are skipped so a `$:` inside them is
/// never matched. A `$: { … }` block and a `$: expr;` single statement are both
/// consumed in full.
fn strip_top_level_reactive_labels(script: &str) -> String {
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(len);
    let mut i = 0;
    let mut depth: i32 = 0;
    // Whether the next significant token begins a statement at depth 0.
    let mut at_stmt_start = true;
    while i < len {
        let b = bytes[i];
        // Line comment.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            let s = i;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        // Block comment.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            let s = i;
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i = (i + 2).min(len);
            out.push_str(&script[s..i]);
            continue;
        }
        // String / template literal.
        if b == b'"' || b == b'\'' || b == b'`' {
            let q = b;
            let s = i;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == q {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[s..i]);
            at_stmt_start = false;
            continue;
        }
        // A top-level `$:` label at the start of a statement (not `$::`).
        if depth == 0
            && at_stmt_start
            && b == b'$'
            && i + 1 < len
            && bytes[i + 1] == b':'
            && bytes.get(i + 2) != Some(&b':')
        {
            i += 2; // skip `$:`
            while i < len && bytes[i].is_ascii_whitespace() {
                i += 1;
            }
            if i < len && bytes[i] == b'{' {
                // Block statement — consume to the matching `}`.
                let mut d = 0i32;
                while i < len {
                    match bytes[i] {
                        b'{' => d += 1,
                        b'}' => {
                            d -= 1;
                            i += 1;
                            if d == 0 {
                                break;
                            }
                            continue;
                        }
                        _ => {}
                    }
                    i += 1;
                }
            } else {
                // Single statement — consume to the terminating `;` at depth 0.
                let mut d = 0i32;
                while i < len {
                    match bytes[i] {
                        b'(' | b'[' | b'{' => d += 1,
                        b')' | b']' | b'}' => d -= 1,
                        b';' if d == 0 => {
                            i += 1;
                            break;
                        }
                        _ => {}
                    }
                    i += 1;
                }
            }
            // Drop any leftover blank line the removed statement occupied.
            while i < len && (bytes[i] == b' ' || bytes[i] == b'\t') {
                i += 1;
            }
            if i < len && bytes[i] == b'\n' {
                i += 1;
            }
            continue;
        }
        match b {
            b'{' | b'(' | b'[' => depth += 1,
            b'}' | b')' | b']' => depth -= 1,
            _ => {}
        }
        if b == b';' || b == b'\n' || b == b'{' || b == b'}' {
            at_stmt_start = true;
        } else if !b.is_ascii_whitespace() {
            at_stmt_start = false;
        }
        // UTF-8 safe copy of the current code byte / multibyte char.
        let mut next = i + 1;
        while next < len && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

/// Collapse multi-line `${}` interpolation expressions within template literals.
/// Only collapses lines that are inside `${...}` (brace_depth > 0), NOT raw template
/// text lines. This matches esrap behavior: expressions within interpolations are
/// normalized to single lines, but the template structure (including multiline HTML
/// in createRawSnippet) is preserved.
fn collapse_multiline_template_literals(script: &str) -> String {
    let mut result = String::with_capacity(script.len());
    let mut in_template = false;
    let mut template_brace_depth: i32 = 0;

    for line in script.lines() {
        if template_brace_depth > 0 {
            // Inside a ${...} interpolation that spans multiple lines - collapse
            result.push(' ');
            result.push_str(line.trim());
            let (new_in_template, new_brace_depth) =
                super::helpers::update_template_literal_state_full(
                    line,
                    in_template,
                    template_brace_depth,
                );
            in_template = new_in_template;
            template_brace_depth = new_brace_depth;
            if template_brace_depth == 0 && !in_template {
                result.push('\n');
            }
        } else if in_template {
            // Inside template literal text (not in ${}) - preserve as-is
            result.push_str(line);
            let (new_in_template, new_brace_depth) =
                super::helpers::update_template_literal_state_full(
                    line,
                    in_template,
                    template_brace_depth,
                );
            in_template = new_in_template;
            template_brace_depth = new_brace_depth;
            result.push('\n');
        } else {
            // Normal line - check if it opens a template literal
            result.push_str(line);
            let (new_in_template, new_brace_depth) =
                super::helpers::update_template_literal_state_full(
                    line,
                    in_template,
                    template_brace_depth,
                );
            in_template = new_in_template;
            template_brace_depth = new_brace_depth;
            if !in_template && template_brace_depth == 0 {
                result.push('\n');
            } else if template_brace_depth > 0 {
                // Opened a ${} that doesn't close on this line - don't add newline
                // (will be collapsed with the next line)
            } else {
                // Inside template text - add newline
                result.push('\n');
            }
        }
    }
    if result.ends_with('\n') {
        result.pop();
    }
    result
}

/// Check if a line opens a template literal that doesn't close on the same line.
/// Counts backticks while respecting string literals and escaped backticks.
fn line_opens_unclosed_template_literal(line: &str) -> bool {
    let mut backtick_count = 0;
    let mut in_str = false;
    let mut str_ch = ' ';
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        let ch = chars[i];
        if in_str {
            if ch == str_ch && (i == 0 || chars[i - 1] != '\\') {
                in_str = false;
            }
            i += 1;
            continue;
        }
        if ch == '\'' || ch == '"' {
            in_str = true;
            str_ch = ch;
        } else if ch == '`' && (i == 0 || chars[i - 1] != '\\') {
            backtick_count += 1;
        }
        i += 1;
    }
    // Odd number of backticks means the template literal is still open
    backtick_count % 2 != 0
}

/// Check if a line closes an open template literal.
/// Returns true if the line contains a closing backtick.
fn line_closes_template_literal(line: &str) -> bool {
    // Simple check: does the line contain a backtick?
    // This is an approximation - a more accurate check would track
    // nested template expressions, but this handles common cases.
    let mut in_str = false;
    let mut str_ch = ' ';
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        let ch = chars[i];
        if in_str {
            if ch == str_ch && (i == 0 || chars[i - 1] != '\\') {
                in_str = false;
            }
            i += 1;
            continue;
        }
        if ch == '\'' || ch == '"' {
            in_str = true;
            str_ch = ch;
        } else if ch == '`' && (i == 0 || chars[i - 1] != '\\') {
            return true;
        }
        i += 1;
    }
    false
}

fn format_js_line(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        // Copy comments verbatim — `name=1` inside a `// ...` or `/* ... */`
        // comment must not get assignment spacing.
        if c == '/' && matches!(chars.get(i + 1), Some('/')) {
            result.extend(&chars[i..]);
            break;
        }
        if c == '/' && matches!(chars.get(i + 1), Some('*')) {
            let mut j = i + 2;
            while j + 1 < chars.len() && !(chars[j] == '*' && chars[j + 1] == '/') {
                j += 1;
            }
            let end = if j + 1 < chars.len() {
                j + 2
            } else {
                chars.len()
            };
            result.extend(&chars[i..end]);
            i = end;
            continue;
        }

        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            if next == Some('=')
                || next == Some('>')
                || prev == Some('=')
                || prev == Some('!')
                || prev == Some('<')
                || prev == Some('>')
                || prev == Some('+')
                || prev == Some('-')
                || prev == Some('*')
                || prev == Some('/')
                || prev == Some('%')
                || prev == Some('&')
                || prev == Some('|')
                || prev == Some('^')
                || prev == Some('?')
            {
                result.push(c);
            } else {
                if prev != Some(' ') {
                    result.push(' ');
                }
                result.push(c);
                if next != Some(' ') && next.is_some() {
                    result.push(' ');
                }
            }
            i += 1;
            continue;
        }

        if c == '{' {
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };
            if prev == Some(')') {
                result.push(' ');
            }
            result.push(c);
            i += 1;
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Transform object destructuring for variables that are later reassigned (legacy mode).
/// When any variable in an object destructuring pattern is later reassigned,
/// the destructuring must be decomposed into individual assignments via a temp variable.
/// e.g., `let { foo, toggleFoo } = expr;` -> `let tmp = expr, foo = tmp.foo, toggleFoo = tmp.toggleFoo;`
/// This matches the official Svelte compiler's `create_state_declarators` behavior.
pub(crate) fn transform_reassigned_destructures(
    script: &str,
    reassigned_vars: &[String],
) -> String {
    if reassigned_vars.is_empty() {
        return script.to_string();
    }

    use regex::Regex;
    use std::sync::LazyLock;

    // Match patterns like: let { ... } = expr
    // But NOT: let { ... } = $state( or let { ... } = $state.raw( (already handled)
    static OBJ_DESTRUCT_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"(?m)^(\s*)(let|var)\s+\{([^}]+)\}\s*=\s*").unwrap());

    let mut result = script.to_string();
    let mut offset: i64 = 0;
    let mut tmp_counter: usize = 0;

    for cap in OBJ_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();

        // Skip if this is a $state() or $state.raw() destructuring (already handled elsewhere)
        let after_eq = &script[full_match.end()..];
        if after_eq.starts_with("$state(") || after_eq.starts_with("$state.raw(") {
            continue;
        }

        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let obj_pattern = cap.get(3).unwrap().as_str();

        // Parse properties and check if any are in the reassigned set
        let props = parse_object_pattern_properties(obj_pattern);
        let has_reassigned = props.iter().any(|p| {
            let name = match p {
                ObjectPatternProp::Simple(n) => n.as_str(),
                ObjectPatternProp::Renamed { value, .. } => value.as_str(),
                ObjectPatternProp::WithDefault { name, .. } => name.as_str(),
                ObjectPatternProp::RenamedWithDefault { value, .. } => value.as_str(),
                ObjectPatternProp::Rest(n) => n.as_str(),
            };
            reassigned_vars.iter().any(|rv| rv == name)
        });

        if !has_reassigned {
            continue;
        }

        // Find the end of the initializer expression (up to the semicolon or end of line)
        let init_start = full_match.end();
        let remaining = &script[init_start..];
        // Find the end of the expression - need to handle nested parens, brackets, braces
        let init_end = find_expression_end(remaining);
        let init_expr = remaining[..init_end].trim_end_matches(';').trim();

        // Generate tmp variable name
        let tmp_name = if tmp_counter == 0 {
            "tmp".to_string()
        } else {
            format!("tmp_{}", tmp_counter)
        };
        tmp_counter += 1;

        let mut transformed = format!("{}let {} = {}", indent, tmp_name, init_expr);

        for prop in &props {
            match prop {
                ObjectPatternProp::Simple(name) => {
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = {}.{}",
                        indent, name, tmp_name, name
                    );
                }
                ObjectPatternProp::Renamed { key, value } => {
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = {}.{}",
                        indent, value, tmp_name, key
                    );
                }
                ObjectPatternProp::WithDefault { name, default } => {
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = {}.{} ?? {}",
                        indent, name, tmp_name, name, default
                    );
                }
                ObjectPatternProp::RenamedWithDefault {
                    key,
                    value,
                    default,
                } => {
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = {}.{} ?? {}",
                        indent, value, tmp_name, key, default
                    );
                }
                ObjectPatternProp::Rest(name) => {
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = {}.{}",
                        indent, name, tmp_name, name
                    );
                }
            }
        }

        transformed.push(';');

        let match_start = (full_match.start() as i64 + offset) as usize;
        let match_end = (init_start as i64 + init_end as i64 + offset) as usize;

        // If the match_end char is a semicolon, include it
        let match_end = if match_end < result.len() && result.as_bytes()[match_end] == b';' {
            match_end + 1
        } else {
            match_end
        };

        result = format!(
            "{}{}{}",
            &result[..match_start],
            transformed,
            &result[match_end..]
        );

        let old_len = match_end as i64 - match_start as i64;
        let new_len = transformed.len() as i64;
        offset += new_len - old_len;
    }

    result
}

/// Find the end of a JavaScript expression (handles nested parens, brackets, braces).
/// Returns the index after the expression (at the semicolon or newline).
fn find_expression_end(s: &str) -> usize {
    let mut depth_paren = 0i32;
    let mut depth_bracket = 0i32;
    let mut depth_brace = 0i32;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut i = 0;
    let bytes = s.as_bytes();

    while i < bytes.len() {
        let c = bytes[i] as char;

        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = true;
                string_char = c;
            }
            '(' => depth_paren += 1,
            ')' => {
                depth_paren -= 1;
                if depth_paren < 0 {
                    return i;
                }
            }
            '[' => depth_bracket += 1,
            ']' => {
                depth_bracket -= 1;
                if depth_bracket < 0 {
                    return i;
                }
            }
            '{' => depth_brace += 1,
            '}' => {
                depth_brace -= 1;
                if depth_brace < 0 {
                    return i;
                }
            }
            ';' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                return i;
            }
            '\n' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                // Check if the next non-whitespace is not a continuation
                let rest = &s[i + 1..];
                let trimmed = rest.trim_start();
                if trimmed.is_empty()
                    || trimmed.starts_with("let ")
                    || trimmed.starts_with("const ")
                    || trimmed.starts_with("var ")
                    || trimmed.starts_with("export ")
                    || trimmed.starts_with("function ")
                    || trimmed.starts_with("class ")
                    || trimmed.starts_with("import ")
                    || trimmed.starts_with("//")
                    || trimmed.starts_with("/*")
                {
                    return i;
                }
            }
            _ => {}
        }

        i += 1;
    }

    s.len()
}

/// Transform object destructuring with $state() or $state.raw() in server-side rendering.
/// e.g., `let { num } = $state(setup())` -> `let tmp = setup(), num = tmp.num`
/// e.g., `let { num: x } = $state(setup())` -> `let tmp = setup(), x = tmp.num`
fn transform_object_destructure_state(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    // Match patterns like: let { ... } = $state( or let { ... } = $state.raw(
    static OBJ_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\{([^}]+)\}\s*=\s*\$state(?:\.raw)?\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset: i64 = 0;
    let mut tmp_counter: usize = 0;

    for cap in OBJ_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let obj_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let value = remaining[..paren_end].trim();

            // Generate tmp variable name
            let tmp_name = if tmp_counter == 0 {
                "tmp".to_string()
            } else {
                format!("tmp_{}", tmp_counter)
            };
            tmp_counter += 1;

            // Parse the object pattern properties
            let props = parse_object_pattern_properties(obj_pattern);

            let mut transformed = format!("{}let {} = {}", indent, tmp_name, value);

            for prop in &props {
                match prop {
                    ObjectPatternProp::Simple(name) => {
                        // { a } -> a = tmp.a
                        let _ = write!(transformed, ", {} = {}.{}", name, tmp_name, name);
                    }
                    ObjectPatternProp::Renamed { key, value } => {
                        // { a: x } -> x = tmp.a
                        let _ = write!(transformed, ", {} = {}.{}", value, tmp_name, key);
                    }
                    ObjectPatternProp::WithDefault { name, default } => {
                        // { a = 5 } -> a = tmp.a ?? 5
                        let _ = write!(
                            transformed,
                            ", {} = {}.{} ?? {}",
                            name, tmp_name, name, default
                        );
                    }
                    ObjectPatternProp::RenamedWithDefault {
                        key,
                        value,
                        default,
                    } => {
                        // { a: x = 5 } -> x = tmp.a ?? 5
                        let _ = write!(
                            transformed,
                            ", {} = {}.{} ?? {}",
                            value, tmp_name, key, default
                        );
                    }
                    ObjectPatternProp::Rest(name) => {
                        // TODO: Handle rest pattern if needed
                        let _ = write!(transformed, ", {} = {}.{}", name, tmp_name, name);
                    }
                }
            }

            let match_start = (full_match.start() as i64 + offset) as usize;
            // +1 to skip the closing paren of $state()
            let match_end = (start_pos as i64 + paren_end as i64 + offset + 1) as usize;

            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end..]
            );

            let old_len = (full_match.len() + paren_end + 1) as i64;
            let new_len = transformed.len() as i64;
            offset += new_len - old_len;
        }
    }

    result
}

#[derive(Debug)]
enum ObjectPatternProp {
    Simple(String),
    Renamed {
        key: String,
        value: String,
    },
    WithDefault {
        name: String,
        default: String,
    },
    RenamedWithDefault {
        key: String,
        value: String,
        default: String,
    },
    Rest(String),
}

/// Parse object pattern properties from a string like "a, b: c, d = 5"
fn parse_object_pattern_properties(pattern: &str) -> Vec<ObjectPatternProp> {
    let mut props = Vec::new();
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in pattern.char_indices() {
        match c {
            '[' | '(' | '{' => depth += 1,
            ']' | ')' | '}' => depth -= 1,
            ',' if depth == 0 => {
                let prop = pattern[start..i].trim();
                if !prop.is_empty() {
                    props.push(parse_single_object_prop(prop));
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    let prop = pattern[start..].trim();
    if !prop.is_empty() {
        props.push(parse_single_object_prop(prop));
    }

    props
}

fn parse_single_object_prop(prop: &str) -> ObjectPatternProp {
    let prop = prop.trim();

    if prop.starts_with("...") {
        return ObjectPatternProp::Rest(prop.trim_start_matches("...").trim().to_string());
    }

    // Check for colon (rename pattern): "key: value" or "key: value = default"
    if let Some(colon_idx) = prop.find(':') {
        let key = prop[..colon_idx].trim().to_string();
        let rest = prop[colon_idx + 1..].trim();

        // Check for default value in the renamed part
        if let Some(eq_idx) = rest.find('=') {
            let value = rest[..eq_idx].trim().to_string();
            let default = rest[eq_idx + 1..].trim().to_string();
            return ObjectPatternProp::RenamedWithDefault {
                key,
                value,
                default,
            };
        }

        return ObjectPatternProp::Renamed {
            key,
            value: rest.to_string(),
        };
    }

    // Check for default value: "name = default"
    if let Some(eq_idx) = prop.find('=') {
        let name = prop[..eq_idx].trim().to_string();
        let default = prop[eq_idx + 1..].trim().to_string();
        return ObjectPatternProp::WithDefault { name, default };
    }

    // Simple property: "name"
    ObjectPatternProp::Simple(prop.to_string())
}

/// Transform array destructuring with $state() in server-side rendering.
fn transform_array_destructure_state(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    static ARRAY_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\[([^\]]+)\]\s*=\s*\$state\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset = 0;

    for cap in ARRAY_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let array_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let value = &remaining[..paren_end].trim();

            let (vars, has_rest) = parse_array_pattern(array_pattern);

            let mut transformed = format!("{}let tmp = {},\n", indent, value);

            if has_rest {
                let _ = write!(transformed, "{}\t$$array = $.to_array(tmp)", indent);
            } else {
                let _ = write!(
                    transformed,
                    "{}\t$$array = $.to_array(tmp, {})",
                    indent,
                    vars.len()
                );
            }

            for (i, var) in vars.iter().enumerate() {
                let var = var.trim();
                if var.starts_with("...") {
                    let rest_name = var.trim_start_matches("...");
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = $$array.slice({})",
                        indent, rest_name, i
                    );
                } else if var.contains('=') {
                    let parts: Vec<&str> = var.splitn(2, '=').collect();
                    let name = parts[0].trim();
                    let default = parts.get(1).map(|s| s.trim()).unwrap_or("void 0");
                    let _ = write!(
                        transformed,
                        ",\n{}\t{} = $$array[{}] ?? {}",
                        indent, name, i, default
                    );
                } else {
                    let _ = write!(transformed, ",\n{}\t{} = $$array[{}]", indent, var, i);
                }
            }

            let match_start = full_match.start() + offset;
            let match_end = start_pos + paren_end + offset;
            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end + 1..] // +1 to skip the closing paren
            );

            let old_len = full_match.len() + paren_end + 1;
            let new_len = transformed.len();
            offset = offset + new_len - old_len;
        }
    }

    result
}

fn parse_array_pattern(pattern: &str) -> (Vec<&str>, bool) {
    let mut vars = Vec::new();
    let mut has_rest = false;
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in pattern.char_indices() {
        match c {
            '[' | '(' | '{' => depth += 1,
            ']' | ')' | '}' => depth -= 1,
            ',' if depth == 0 => {
                let var = pattern[start..i].trim();
                if !var.is_empty() {
                    if var.starts_with("...") {
                        has_rest = true;
                    }
                    vars.push(var);
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    let var = pattern[start..].trim();
    if !var.is_empty() {
        if var.starts_with("...") {
            has_rest = true;
        }
        vars.push(var);
    }

    (vars, has_rest)
}

fn find_matching_paren_for_state(s: &str) -> Option<usize> {
    let mut depth = 1;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, c) in s.char_indices() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || s.as_bytes()[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Transform $state.snapshot() in server script content.
fn transform_state_snapshot_server(script: &str, dev: bool) -> String {
    let prefix = "$state.snapshot(";
    let mut result = script.to_string();
    let mut search_from = 0;

    while let Some(pos) = result[search_from..].find(prefix) {
        let abs_pos = search_from + pos;
        let after_prefix = abs_pos + prefix.len();

        if let Some(content_end) = find_matching_paren_for_state(&result[after_prefix..]) {
            let content = result[after_prefix..after_prefix + content_end].to_string();

            let before = result[..abs_pos].trim_end();
            let is_assignment = before.ends_with('=') && !before.ends_with("==");

            if is_assignment {
                let end = after_prefix + content_end + 1;
                result = format!("{}{}{}", &result[..abs_pos], content, &result[end..]);
                search_from = abs_pos + content.len();
            } else {
                // In dev mode, check if there's a svelte-ignore state_snapshot_uncloneable
                // comment before this call. If so, add `true` as the second argument.
                let has_ignore = dev
                    && has_svelte_ignore_before(&result[..abs_pos], "state_snapshot_uncloneable");

                if has_ignore {
                    // Insert `, true` before the closing paren
                    let call_end = after_prefix + content_end;
                    let replacement = format!(
                        "{}$.snapshot({}, true){}",
                        &result[..abs_pos],
                        content,
                        &result[call_end + 1..]
                    );
                    let new_len = abs_pos + "$.snapshot(".len() + content.len() + ", true)".len();
                    result = replacement;
                    search_from = new_len;
                } else {
                    result = format!(
                        "{}$.snapshot({}",
                        &result[..abs_pos],
                        &result[after_prefix..]
                    );
                    search_from = abs_pos + "$.snapshot(".len();
                }
            }
        } else {
            search_from = abs_pos + prefix.len();
        }
    }

    result
}

/// Check if there's a `svelte-ignore <code>` comment before a position in the source.
/// Public alias for use in other modules.
pub(crate) fn has_svelte_ignore_before_pub(before: &str, code: &str) -> bool {
    has_svelte_ignore_before(before, code)
}

/// Check if there's a `svelte-ignore <code>` comment before a position in the source.
fn has_svelte_ignore_before(before: &str, code: &str) -> bool {
    // Look for the pattern in the lines above
    let lines: Vec<&str> = before.lines().collect();
    for line in lines.iter().rev().take(3) {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if memmem::find(trimmed.as_bytes(), b"svelte-ignore").is_some() && trimmed.contains(code) {
            return true;
        }
        // Stop at the first non-empty, non-comment line
        if !trimmed.starts_with("//") && !trimmed.starts_with("/*") {
            break;
        }
    }
    false
}

/// Flatten object destructure declarations with `$.store_get()` initializers.
///
/// Transforms:
///   `let { firstNonStore, secondNonStore, firstStore } = $.store_get(...)`
/// Into:
///   `let tmp = $.store_get(...), firstNonStore = tmp.firstNonStore, secondNonStore = tmp.secondNonStore, firstStore = tmp.firstStore`
///
/// This matches the official Svelte compiler's `create_state_declarators()` behavior.
pub(crate) fn flatten_store_get_destructures(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    // Match: let { ... } = $.store_get(
    static STORE_GET_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\{([^}]+)\}\s*=\s*\$\.store_get\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset: i64 = 0;

    for cap in STORE_GET_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let obj_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];

        // Find the matching closing paren of $.store_get(...)
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let store_get_args = &remaining[..paren_end];

            // Parse the object pattern properties
            let props = parse_object_pattern_properties(obj_pattern);

            // Build: let tmp = $.store_get(...), prop1 = tmp.prop1, prop2 = tmp.prop2, ...
            let mut transformed = format!("{}let tmp = $.store_get({})", indent, store_get_args);

            for prop in &props {
                match prop {
                    ObjectPatternProp::Simple(name) => {
                        let _ = write!(transformed, ",\n{}\t{} = tmp.{}", indent, name, name);
                    }
                    ObjectPatternProp::Renamed { key, value } => {
                        let _ = write!(transformed, ",\n{}\t{} = tmp.{}", indent, value, key);
                    }
                    ObjectPatternProp::WithDefault { name, default } => {
                        let _ = write!(
                            transformed,
                            ",\n{}\t{} = tmp.{} ?? {}",
                            indent, name, name, default
                        );
                    }
                    ObjectPatternProp::RenamedWithDefault {
                        key,
                        value,
                        default,
                    } => {
                        let _ = write!(
                            transformed,
                            ",\n{}\t{} = tmp.{} ?? {}",
                            indent, value, key, default
                        );
                    }
                    ObjectPatternProp::Rest(name) => {
                        let _ = write!(transformed, ",\n{}\t{} = tmp.{}", indent, name, name);
                    }
                }
            }

            let match_start = (full_match.start() as i64 + offset) as usize;
            // +1 to skip the closing paren of $.store_get()
            let match_end = (start_pos as i64 + paren_end as i64 + offset + 1) as usize;

            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end..]
            );

            let old_len = (full_match.len() + paren_end + 1) as i64;
            let new_len = transformed.len() as i64;
            offset += new_len - old_len;
        }
    }

    result
}

/// Scan `script` for `let|const|var NAME = $.derived(...)` declarators and
/// return the set of derived binding names declared at any scope.
///
/// This is a string-level scan over the already-transformed source where
/// `$derived(...)` / `$derived.by(...)` have been rewritten to
/// `$.derived(...)` (Svelte 5.52+). It mirrors the upstream behaviour where
/// any `Identifier` reference resolving to a `derived` binding is emitted as
/// a call.
type DerivedNameCollection = (
    rustc_hash::FxHashSet<String>,
    rustc_hash::FxHashSet<String>,
    // Byte ranges of derived declarators (covering just the identifier),
    // used to suppress false-positive "shadow" matches for the derived's
    // own declaration.
    Vec<(usize, usize, String)>,
);

fn collect_derived_names_from_script(script: &str) -> DerivedNameCollection {
    let mut names: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
    let mut var_names: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
    let mut declarators: Vec<(usize, usize, String)> = Vec::new();
    let bytes = script.as_bytes();
    let patterns: &[&[u8]] = &[b"$.derived(", b"$.derived_safe_equal(", b"$.async_derived("];
    for pat in patterns {
        let finder = memmem::Finder::new(*pat);
        for pos in finder.find_iter(bytes) {
            // Walk left from `pos` to find the `let|const|var <name> = ` shape
            // (or the prior identifier in a comma-separated declarator list).
            let mut left = pos;
            // Skip whitespace + `=`.
            while left > 0 && bytes[left - 1].is_ascii_whitespace() {
                left -= 1;
            }
            // Async derived case: `bar = await $.async_derived(...)` — the
            // initializer expression itself begins with `await`, so when the
            // pattern is `$.async_derived(` we may need to step over an
            // `await` keyword before locating the `=`.
            if *pat == b"$.async_derived("
                && left >= 5
                && &bytes[left - 5..left] == b"await"
                && (left == 5
                    || !{
                        let pc = bytes[left - 6];
                        pc.is_ascii_alphanumeric() || pc == b'_' || pc == b'$'
                    })
            {
                left -= 5;
                while left > 0 && bytes[left - 1].is_ascii_whitespace() {
                    left -= 1;
                }
            }
            if left == 0 || bytes[left - 1] != b'=' {
                continue;
            }
            left -= 1;
            while left > 0 && bytes[left - 1].is_ascii_whitespace() {
                left -= 1;
            }
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
            // Skip private class fields like `#foo = $.derived(...)` — those
            // are handled by the `$.get(this.#foo)` → `this.#foo()` rewrite
            // in `post_process_for_server` and shouldn't appear as bare
            // identifiers we'd wrap.
            if left > 0 && bytes[left - 1] == b'#' {
                continue;
            }
            // Walk further back to find the declaration keyword (`let` / `const`
            // / `var`) — if there's a `,` separator the kind belongs to the
            // outer declarator. We treat anything but `var` as the default
            // (call without optional chaining); only `var` triggers `?.()`.
            let mut kw_search = left;
            // Skip whitespace.
            while kw_search > 0 && bytes[kw_search - 1].is_ascii_whitespace() {
                kw_search -= 1;
            }
            // Walk back over alternating ident/comma/whitespace until we hit
            // `let` / `const` / `var` (or anything else, in which case we
            // default to non-`var`).
            let is_var = loop {
                let kw_end = kw_search;
                if kw_end == 0 {
                    break false;
                }
                let c = bytes[kw_end - 1];
                if c == b',' {
                    // Comma-separated declarator: keep walking.
                    kw_search -= 1;
                    // Skip whitespace, identifier, optional `=`, expression.
                    while kw_search > 0 && bytes[kw_search - 1].is_ascii_whitespace() {
                        kw_search -= 1;
                    }
                    let ident_end = kw_search;
                    while kw_search > 0 {
                        let cc = bytes[kw_search - 1];
                        if cc.is_ascii_alphanumeric() || cc == b'_' || cc == b'$' {
                            kw_search -= 1;
                        } else {
                            break;
                        }
                    }
                    if kw_search == ident_end {
                        break false;
                    }
                    while kw_search > 0 && bytes[kw_search - 1].is_ascii_whitespace() {
                        kw_search -= 1;
                    }
                    continue;
                }
                // Try to read backwards a keyword.
                if kw_end >= 3 && &bytes[kw_end - 3..kw_end] == b"let" {
                    let boundary_ok = kw_end == 3
                        || !{
                            let pc = bytes[kw_end - 4];
                            pc.is_ascii_alphanumeric() || pc == b'_' || pc == b'$'
                        };
                    if boundary_ok {
                        break false;
                    }
                }
                if kw_end >= 5 && &bytes[kw_end - 5..kw_end] == b"const" {
                    let boundary_ok = kw_end == 5
                        || !{
                            let pc = bytes[kw_end - 6];
                            pc.is_ascii_alphanumeric() || pc == b'_' || pc == b'$'
                        };
                    if boundary_ok {
                        break false;
                    }
                }
                if kw_end >= 3 && &bytes[kw_end - 3..kw_end] == b"var" {
                    let boundary_ok = kw_end == 3
                        || !{
                            let pc = bytes[kw_end - 4];
                            pc.is_ascii_alphanumeric() || pc == b'_' || pc == b'$'
                        };
                    if boundary_ok {
                        break true;
                    }
                }
                break false;
            };
            // The thing before the identifier may be `let`/`const`/`var`
            // (start of a declarator) OR a `,` (comma-separated declarator).
            // Either way, we found a fresh declarator.
            if let Ok(name) = std::str::from_utf8(&bytes[left..id_end]) {
                // Filter out invalid identifier-starting chars just to be safe.
                if name
                    .chars()
                    .next()
                    .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
                {
                    if is_var {
                        var_names.insert(name.to_string());
                    }
                    names.insert(name.to_string());
                    declarators.push((left, id_end, name.to_string()));
                }
            }
        }
    }
    (names, var_names, declarators)
}

/// Rewrite bare reads of derived bindings (e.g. `foo`) to calls (`foo()`).
///
/// Skips identifiers in these positions:
/// - Member access: `obj.foo` — preceded by `.`.
/// - Identifier joins: `_foo`, `barfoo` — preceded by an identifier char.
/// - Property keys: `{ foo: ... }` — followed by `:` and the identifier is
///   not preceded by an open paren / comma / brace that would make it an
///   expression position.
/// - Declaration targets / property shorthand: `let foo`, `const foo`,
///   `var foo`, `function foo`, `class foo`.
/// - Inside strings / template literal text / line / block comments.
///
/// Notes:
/// - For Svelte 5.52, assignments `foo = X` to a derived become `foo(X)`
///   upstream. Implementing that here properly requires distinguishing
///   `foo = X` from `foo == X` / `foo === X`, plus deciding what to do with
///   compound assignments. We do **not** rewrite assignments in this pass —
///   the upstream tests we care about exercise read paths, and the upstream
///   AssignmentExpression diff acknowledges that assignment to a derived
///   on the server is intentionally broken.
fn wrap_derived_reads_in_script(script: &str, extra_derived: &FxHashSet<String>) -> String {
    let (mut derived_names, derived_var_names, derived_declarators) =
        collect_derived_names_from_script(script);
    // Prefer the AST-based pass: it resolves reads / shadowing / member-vs-key
    // / object-shorthand structurally instead of via byte heuristics, removing
    // the "forgot a position" bug class (mirrors the await→save migration in
    // #1039). Falls back to the byte scanner below when the script doesn't
    // parse as a standalone module. Note `derived_names` here excludes
    // `extra_derived` — those are passed separately (they're unresolved refs in
    // this slice).
    if let Some(out) = super::derived_reads_ast::wrap_derived_reads_ast(
        script,
        &derived_names,
        &derived_var_names,
        extra_derived,
    ) {
        return out;
    }
    // Cross-context deriveds — e.g. a `{let d = $derived(…)}` declaration tag
    // whose `d` is read from a *different* declaration tag — are not declared
    // in this script slice, so seed them in from the component's known derived
    // bindings so the read is still wrapped to `d()` (Svelte 5.56.1 #18348).
    for name in extra_derived {
        derived_names.insert(name.clone());
    }
    if derived_names.is_empty() {
        return script.to_string();
    }
    // Pre-pass: find byte ranges (start, end) where derived names are
    // shadowed by inner `let|const|var|function|class IDENT` declarations or
    // by parameter lists. References to a derived name inside such a range
    // bind to the inner declaration, not the derived, so we must not wrap.
    let shadow_ranges = compute_shadow_ranges(script, &derived_names, &derived_declarators);
    // Byte positions where a derived's LHS appears in its own declarator —
    // these must NOT be wrapped to `name()`.
    let declarator_lhs_positions: rustc_hash::FxHashSet<usize> =
        derived_declarators.iter().map(|(s, _, _)| *s).collect();
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(script.len() + derived_names.len() * 8);
    let mut i = 0;

    while i < len {
        let b = bytes[i];

        // Skip line comments.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            let start = i;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[start..i]);
            continue;
        }
        // Skip block comments.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            let start = i;
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            out.push_str(&script[start..i]);
            continue;
        }
        // Skip string literals.
        if b == b'"' || b == b'\'' {
            let quote = b;
            let start = i;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[start..i]);
            continue;
        }
        // Skip template literals, but recurse into `${...}` placeholders so
        // identifier refs inside interpolations still get rewritten.
        if b == b'`' {
            let start = i;
            out.push(b as char);
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    // Push backslash + the escaped codepoint. The escaped
                    // character may be multi-byte UTF-8, so step by its full
                    // UTF-8 length rather than a fixed 2 bytes.
                    out.push('\\');
                    let escaped_start = i + 1;
                    let mut escaped_end = escaped_start + 1;
                    while escaped_end < len && !script.is_char_boundary(escaped_end) {
                        escaped_end += 1;
                    }
                    out.push_str(&script[escaped_start..escaped_end]);
                    i = escaped_end;
                    continue;
                }
                if bytes[i] == b'`' {
                    out.push('`');
                    i += 1;
                    break;
                }
                if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    out.push_str("${");
                    i += 2;
                    let mut depth: i32 = 1;
                    let placeholder_start = i;
                    // Find matching `}` respecting nested braces / strings.
                    while i < len && depth > 0 {
                        let c = bytes[i];
                        if c == b'\\' && i + 1 < len {
                            i += 2;
                            continue;
                        }
                        if c == b'"' || c == b'\'' {
                            let q = c;
                            i += 1;
                            while i < len {
                                if bytes[i] == b'\\' && i + 1 < len {
                                    i += 2;
                                    continue;
                                }
                                if bytes[i] == q {
                                    i += 1;
                                    break;
                                }
                                i += 1;
                            }
                            continue;
                        }
                        if c == b'`' {
                            // Nested template literal — copy verbatim by
                            // recursing through this loop on the slice.
                            i += 1;
                            let mut inner_depth: i32 = 0;
                            while i < len {
                                if bytes[i] == b'\\' && i + 1 < len {
                                    i += 2;
                                    continue;
                                }
                                if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                                    inner_depth += 1;
                                    i += 2;
                                    continue;
                                }
                                if bytes[i] == b'}' && inner_depth > 0 {
                                    inner_depth -= 1;
                                    i += 1;
                                    continue;
                                }
                                if bytes[i] == b'`' && inner_depth == 0 {
                                    i += 1;
                                    break;
                                }
                                i += 1;
                            }
                            continue;
                        }
                        if c == b'{' {
                            depth += 1;
                        } else if c == b'}' {
                            depth -= 1;
                            if depth == 0 {
                                break;
                            }
                        }
                        i += 1;
                    }
                    let placeholder_end = i;
                    let inner = &script[placeholder_start..placeholder_end];
                    out.push_str(&wrap_derived_reads_in_script_inner_with_shadow(
                        inner,
                        &derived_names,
                        &derived_var_names,
                        &shadow_ranges,
                        &declarator_lhs_positions,
                        placeholder_start,
                    ));
                    if i < len && bytes[i] == b'}' {
                        out.push('}');
                        i += 1;
                    }
                    continue;
                }
                // Multi-byte UTF-8 safe step: byte-level `as char` would
                // corrupt non-ASCII chars (e.g. 'é' bytes → "Ã©"). Slice the
                // codepoint instead.
                let mut next = i + 1;
                while next < len && !script.is_char_boundary(next) {
                    next += 1;
                }
                out.push_str(&script[i..next]);
                i = next;
            }
            let _ = start;
            continue;
        }
        // Identifier?
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !is_after_ident_char(bytes, i) {
            let start = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let name = &script[start..i];
            let is_shadowed = shadow_ranges
                .get(name)
                .map(|ranges| ranges.iter().any(|&(s, e)| start >= s && start < e))
                .unwrap_or(false);
            let is_own_declarator_lhs = declarator_lhs_positions.contains(&start);
            if !is_shadowed
                && !is_own_declarator_lhs
                && derived_names.contains(name)
                && is_derived_read_position(bytes, start, i)
            {
                if is_object_shorthand_position(bytes, start, i) {
                    // `{ foo }` — must expand to `{ foo: foo() }` not
                    // `{ foo() }` (which would be invalid method shorthand).
                    out.push_str(name);
                    out.push_str(": ");
                    out.push_str(name);
                    if derived_var_names.contains(name) {
                        out.push_str("?.()");
                    } else {
                        out.push_str("()");
                    }
                } else {
                    out.push_str(name);
                    if derived_var_names.contains(name) {
                        out.push_str("?.()");
                    } else {
                        out.push_str("()");
                    }
                }
            } else {
                out.push_str(name);
            }
            continue;
        }
        // Step by UTF-8 codepoint so non-ASCII chars (string literals,
        // comments) survive the round-trip. `b as char` would Latin-1-encode
        // a continuation byte and double-encode the source.
        let mut next = i + 1;
        while next < len && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

/// True when an identifier at byte range `[start, end)` is in object-literal
/// shorthand position: preceded by `{` or `,` within an object literal, AND
/// followed (after whitespace) by `,` or `}`.
fn is_object_shorthand_position(bytes: &[u8], start: usize, end: usize) -> bool {
    let len = bytes.len();
    // Look forward: next non-whitespace must be `,` or `}`.
    let mut k = end;
    while k < len && bytes[k].is_ascii_whitespace() {
        k += 1;
    }
    let next = bytes.get(k).copied();
    if !matches!(next, Some(b',') | Some(b'}')) {
        return false;
    }
    // Look backward: the immediately preceding non-whitespace must be `{`
    // or `,` (a property separator within an object).
    let mut j = start;
    while j > 0 && bytes[j - 1].is_ascii_whitespace() {
        j -= 1;
    }
    if j == 0 {
        return false;
    }
    let prev = bytes[j - 1];
    if prev != b'{' && prev != b',' {
        return false;
    }
    // If preceded by `,`, walk further back to find the enclosing `{` and
    // ensure we're inside an object literal context (not arg list, array, or
    // block). We walk back over commas/identifiers/property-pairs at depth 0.
    //
    // Note: the depth-0 `{` check has to run BEFORE the `p == 0` short-circuit
    // so that an enclosing `{` sitting at byte 0 is still recognised — without
    // this, `{ doubled }` at the start of an expression slice (e.g. inside a
    // snippet-arg call) was wrongly classified as not-shorthand.
    let mut p = j - 1;
    let mut depth_paren = 0i32;
    let mut depth_brace = 0i32;
    let mut depth_bracket = 0i32;
    loop {
        let c = bytes[p];
        if c == b'}' {
            depth_brace += 1;
        } else if c == b'{' {
            if depth_brace == 0 && depth_paren == 0 && depth_bracket == 0 {
                break;
            }
            depth_brace -= 1;
        } else if c == b')' {
            depth_paren += 1;
        } else if c == b'(' {
            // Unbalanced ( — we walked too far; not an object literal.
            if depth_paren == 0 {
                return false;
            }
            depth_paren -= 1;
        } else if c == b']' {
            depth_bracket += 1;
        } else if c == b'[' {
            if depth_bracket == 0 {
                return false;
            }
            depth_bracket -= 1;
        }
        if p == 0 {
            return false;
        }
        p -= 1;
    }
    // `p` now points to the opening `{`. Look at what precedes — that
    // determines whether it's an object literal vs a block.
    let mut q = p;
    while q > 0 && bytes[q - 1].is_ascii_whitespace() {
        q -= 1;
    }
    if q == 0 {
        // Bare `{` at start of input — treat as expression / object literal.
        return true;
    }
    let pc = bytes[q - 1];
    // Object literal contexts: `(`, `[`, `,`, `=`, `?`, `:`, `<`, `>`,
    // operators (`+`, `-`, `*`, `/`, `%`, `!`, `&`, `|`, `^`, `~`), or
    // after `return`, `await`, `yield`, `throw`, `in`, `of`, `new`,
    // `typeof`, `void`, `delete`.
    if matches!(
        pc,
        b'(' | b'['
            | b','
            | b'='
            | b'?'
            | b':'
            | b'<'
            | b'>'
            | b'+'
            | b'-'
            | b'*'
            | b'/'
            | b'%'
            | b'!'
            | b'&'
            | b'|'
            | b'^'
            | b'~'
            | b'.'
            | b';'
    ) {
        return true;
    }
    // Spread `...` precedes object literal: `f(...{a: 1})`. Detect three
    // dots immediately preceding.
    if pc == b'.' {
        return true;
    }
    // After an identifier — could be `return obj` or `await obj`. Check
    // for object-literal-introducing keywords.
    if pc.is_ascii_alphabetic() || pc == b'_' || pc == b'$' {
        // Walk back to read the keyword.
        let mut r = q;
        while r > 0 {
            let cc = bytes[r - 1];
            if cc.is_ascii_alphanumeric() || cc == b'_' || cc == b'$' {
                r -= 1;
            } else {
                break;
            }
        }
        let kw = std::str::from_utf8(&bytes[r..q]).unwrap_or("");
        return matches!(
            kw,
            "return"
                | "await"
                | "yield"
                | "throw"
                | "in"
                | "of"
                | "new"
                | "typeof"
                | "void"
                | "delete"
        );
    }
    false
}

/// Wrap derived reads in a template-source expression using a pre-collected
/// name set (from the Phase 2 analysis).
pub(crate) fn wrap_derived_reads_for_template(
    expr: &str,
    derived_names: &rustc_hash::FxHashSet<String>,
    derived_var_names: &rustc_hash::FxHashSet<String>,
) -> String {
    if derived_names.is_empty() {
        return expr.to_string();
    }
    let out = wrap_derived_reads_in_script_inner(expr, derived_names, derived_var_names);
    if std::env::var("DEBUG_WRAP").is_ok() {
        eprintln!(
            "DEBUG_WRAP: in={:?} names={:?} out={:?}",
            expr, derived_names, out
        );
    }
    out
}

/// Rewrite postfix/prefix update expressions on derived bindings.
///
/// Svelte 5.53.2 (upstream commit `6aa7b9c64` "fix: update expressions on
/// server deriveds") routes `name++`/`name--`/`++name`/`--name` through new
/// `$.update_derived(name)` / `$.update_derived_pre(name)` helpers when
/// `name` resolves to a derived binding. By the time this pass runs,
/// `wrap_derived_reads_in_script` has already rewritten reads of `count` to
/// `count()`, so the input we see is `count()++`. We scan for that exact
/// shape (any name in `derived_names` immediately followed by `()` and a
/// `++`/`--`, or preceded by `++`/`--`) and substitute the helper call.
///
/// We deliberately do NOT walk strings / comments / regex literals here:
/// the input has already been transformed by `wrap_derived_reads_in_script`
/// which never inserts `name()` inside those regions, so the additional
/// patterns can only appear in real code.
fn rewrite_derived_update_expressions(script: &str) -> String {
    let (derived_names, _, _) = collect_derived_names_from_script(script);
    if derived_names.is_empty() {
        return script.to_string();
    }
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(script.len());
    let mut i = 0;
    while i < len {
        let b = bytes[i];
        // Skip line / block comments and string / template literals — we
        // only need to track them to avoid splicing inside them. The
        // wrapping pass already left these untouched, but a derived
        // declarator that happens to appear inside a template-string body
        // would still hit our scan otherwise.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            let s = i;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            let s = i;
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'"' || b == b'\'' || b == b'`' {
            let quote = b;
            let s = i;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        // Prefix `++name()` / `--name()` — check before consuming the
        // operator. The trailing `()` is what `wrap_derived_reads_in_script`
        // inserts; we strip it back off when emitting the helper call.
        if (b == b'+' || b == b'-')
            && i + 1 < len
            && bytes[i + 1] == b
            && i + 2 < len
            && (bytes[i + 2].is_ascii_alphabetic() || bytes[i + 2] == b'_' || bytes[i + 2] == b'$')
        {
            let op = b;
            let name_start = i + 2;
            let mut name_end = name_start;
            while name_end < len {
                let c = bytes[name_end];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    name_end += 1;
                } else {
                    break;
                }
            }
            let name = &script[name_start..name_end];
            if derived_names.contains(name)
                && name_end + 1 < len
                && bytes[name_end] == b'('
                && bytes[name_end + 1] == b')'
            {
                out.push_str("$.update_derived_pre(");
                out.push_str(name);
                if op == b'-' {
                    out.push_str(", -1");
                }
                out.push(')');
                i = name_end + 2;
                continue;
            }
        }
        // Identifier — look for postfix `name()++` / `name()--`.
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !is_after_ident_char(bytes, i) {
            let name_start = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let name = &script[name_start..i];
            if derived_names.contains(name)
                && i + 3 < len
                && bytes[i] == b'('
                && bytes[i + 1] == b')'
                && (bytes[i + 2] == b'+' || bytes[i + 2] == b'-')
                && bytes[i + 3] == bytes[i + 2]
            {
                let op = bytes[i + 2];
                out.push_str("$.update_derived(");
                out.push_str(name);
                if op == b'-' {
                    out.push_str(", -1");
                }
                out.push(')');
                i += 4;
                continue;
            }
            out.push_str(name);
            continue;
        }
        // UTF-8 safe step.
        let mut next = i + 1;
        while next < len && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

/// Rewrite assignments to derived bindings into setter calls.
///
/// Mirrors the upstream server `AssignmentExpression.js` visitor: when the
/// assignment target is a bare identifier whose binding is a derived
/// (`binding?.kind === 'derived' && object === left`), the assignment is
/// lowered to `b.call(binding.node, build_assignment_value(operator, left, right))`:
///
/// - `likes = x`    → `likes(x)`
/// - `likes += 1`   → `likes(likes() + 1)`   (binary expansion)
/// - `flag &&= x`   → `flag(flag() && x)`    (logical expansion)
///
/// By the time this pass runs, `wrap_derived_reads_in_script` has already
/// rewritten the LHS read to `likes()` (or `likes?.()` for `var`-declared
/// deriveds), so the shape we scan for is `NAME() <op>= rhs` /
/// `NAME?.() <op>= rhs`. Member-expression targets (`likes.foo = 1`) are
/// left alone — upstream also keeps those as plain assignments (the object
/// read is what gets wrapped).
fn rewrite_derived_assignments(script: &str) -> String {
    let (derived_names, derived_var_names, _) = collect_derived_names_from_script(script);
    if derived_names.is_empty() {
        return script.to_string();
    }
    rewrite_derived_assignments_inner(script, &derived_names, &derived_var_names)
}

/// Assignment operators, longest-first so e.g. `>>>=` wins over `>>=` and
/// `&&=` over `&=`. Plain `=` is handled separately (must not match `==`).
const COMPOUND_ASSIGN_OPS: &[&str] = &[
    ">>>=", "**=", "<<=", ">>=", "&&=", "||=", "??=", "+=", "-=", "*=", "/=", "%=", "&=", "|=",
    "^=",
];

// `derived_var_names` is currently only threaded through the nested-RHS
// recursion; keep it in the signature so the inner rewrite stays in sync with
// `wrap_derived_reads_in_script_inner`'s parameter shape.
#[allow(clippy::only_used_in_recursion)]
fn rewrite_derived_assignments_inner(
    script: &str,
    derived_names: &rustc_hash::FxHashSet<String>,
    derived_var_names: &rustc_hash::FxHashSet<String>,
) -> String {
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(script.len());
    let mut i = 0;
    // Last significant (non-whitespace, non-comment) character seen so far.
    // Used for the member-access guard below; a backward raw-byte scan would
    // mistake the trailing `.` of a preceding `// ...` comment for a member
    // access.
    let mut prev_sig: Option<u8> = None;
    while i < len {
        let b = bytes[i];
        // Skip line / block comments and string / template literals so a
        // `name() +=` shape inside them is never touched.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            let s = i;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            let s = i;
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'"' || b == b'\'' || b == b'`' {
            let quote = b;
            let s = i;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[s..i]);
            prev_sig = Some(quote);
            continue;
        }
        // Identifier — look for `NAME()` / `NAME?.()` followed by an
        // assignment operator.
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !is_after_ident_char(bytes, i) {
            let name_start = i;
            let mut j = i;
            while j < len {
                let c = bytes[j];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    j += 1;
                } else {
                    break;
                }
            }
            let name = &script[name_start..j];
            // Member access (`obj.name()`) is not a bare-identifier target.
            if derived_names.contains(name) && prev_sig != Some(b'.') {
                // Match the call wrapper inserted by wrap_derived_reads.
                let (call_end, maybe_call) =
                    if j + 1 < len && bytes[j] == b'(' && bytes[j + 1] == b')' {
                        (j + 2, false)
                    } else if j + 3 < len
                        && bytes[j] == b'?'
                        && bytes[j + 1] == b'.'
                        && bytes[j + 2] == b'('
                        && bytes[j + 3] == b')'
                    {
                        (j + 4, true)
                    } else {
                        out.push_str(name);
                        prev_sig = name.as_bytes().last().copied();
                        i = j;
                        continue;
                    };
                // Skip horizontal whitespace after the call (an operator on
                // the next line would be a different statement under ASI).
                let mut k = call_end;
                while k < len && (bytes[k] == b' ' || bytes[k] == b'\t') {
                    k += 1;
                }
                if let Some((op, op_len)) = match_assignment_operator(&script[k..]) {
                    let rhs_start = {
                        let mut r = k + op_len;
                        while r < len && bytes[r].is_ascii_whitespace() {
                            r += 1;
                        }
                        r
                    };
                    let rhs_end = scan_assignment_rhs_end(script, rhs_start);
                    if rhs_end > rhs_start {
                        let rhs = script[rhs_start..rhs_end].trim_end();
                        // Nested assignments inside the RHS (e.g. `a = b = 1`
                        // with both derived) get the same lowering.
                        let rhs = rewrite_derived_assignments_inner(
                            rhs,
                            derived_names,
                            derived_var_names,
                        );
                        out.push_str(name);
                        out.push('(');
                        if op != "=" {
                            // build_assignment_value: `x op= y` → `x op y`.
                            out.push_str(name);
                            if maybe_call {
                                out.push_str("?.()");
                            } else {
                                out.push_str("()");
                            }
                            out.push(' ');
                            out.push_str(&op[..op.len() - 1]);
                            out.push(' ');
                        }
                        out.push_str(&rhs);
                        out.push(')');
                        prev_sig = Some(b')');
                        // Resume after the RHS, re-emitting any trailing
                        // whitespace we trimmed verbatim.
                        i = rhs_start + script[rhs_start..rhs_end].trim_end().len();
                        continue;
                    }
                }
                // No assignment — emit the call wrapper untouched.
                out.push_str(&script[name_start..call_end]);
                prev_sig = Some(b')');
                i = call_end;
                continue;
            }
            out.push_str(name);
            prev_sig = name.as_bytes().last().copied();
            i = j;
            continue;
        }
        // UTF-8 safe step.
        let mut next = i + 1;
        while next < len && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        if !b.is_ascii_whitespace() {
            prev_sig = Some(b);
        }
        i = next;
    }
    out
}

/// Match an assignment operator at the start of `s`. Returns the operator
/// text and its byte length, or `None` for comparison / non-assignment
/// operators (`==`, `===`, `<=`, `>=`, `&&` without `=`, ...).
fn match_assignment_operator(s: &str) -> Option<(&'static str, usize)> {
    for op in COMPOUND_ASSIGN_OPS {
        if s.starts_with(op) {
            // `*=`/`**=` ordering is handled by longest-first matching, but a
            // compound operator followed by `=` would be a parse error anyway.
            return Some((op, op.len()));
        }
    }
    if s.starts_with('=') && !s.starts_with("==") && !s.starts_with("=>") {
        return Some(("=", 1));
    }
    None
}

/// Find the end of an assignment RHS starting at `from`: the first `;` or
/// `,` at bracket depth 0, an unbalanced closing bracket, or a newline at
/// depth 0 where the expression looks complete (does not end with an
/// operator / opening bracket / comma, i.e. ASI would terminate it).
fn scan_assignment_rhs_end(script: &str, from: usize) -> usize {
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut depth_paren: i32 = 0;
    let mut depth_brace: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut last_non_ws: Option<u8> = None;
    let mut i = from;
    while i < len {
        let b = bytes[i];
        // Strings / template literals.
        if b == b'"' || b == b'\'' || b == b'`' {
            let quote = b;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            last_non_ws = Some(quote);
            continue;
        }
        // Comments.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            continue;
        }
        match b {
            b'(' => depth_paren += 1,
            b'[' => depth_bracket += 1,
            b'{' => depth_brace += 1,
            b')' => {
                if depth_paren == 0 {
                    return i;
                }
                depth_paren -= 1;
            }
            b']' => {
                if depth_bracket == 0 {
                    return i;
                }
                depth_bracket -= 1;
            }
            b'}' => {
                if depth_brace == 0 {
                    return i;
                }
                depth_brace -= 1;
            }
            b';' | b',' if depth_paren == 0 && depth_brace == 0 && depth_bracket == 0 => {
                return i;
            }
            b'\n' => {
                if depth_paren == 0
                    && depth_brace == 0
                    && depth_bracket == 0
                    && let Some(last) = last_non_ws
                    && !matches!(
                        last,
                        b'+' | b'-'
                            | b'*'
                            | b'/'
                            | b'%'
                            | b'<'
                            | b'>'
                            | b'='
                            | b'&'
                            | b'|'
                            | b'^'
                            | b'!'
                            | b'~'
                            | b'?'
                            | b':'
                            | b','
                            | b'('
                            | b'['
                            | b'{'
                            | b'.'
                    )
                {
                    return i;
                }
            }
            _ => {}
        }
        if !b.is_ascii_whitespace() {
            last_non_ws = Some(b);
        }
        i += 1;
    }
    len
}

/// Collapse `$.derived(() => NAME())` to `$.derived(NAME)` when `NAME` is a
/// derived binding. Mirrors Svelte 5.55.5 upstream `b771df3` "correctly
/// calculate `@const` blockers" — the bare-identifier argument is passed
/// directly so the runtime can wire up the dependency without an extra
/// thunk hop.
pub(crate) fn unthunk_bare_derived_arg(script: &str) -> String {
    let (derived_names, _, _) = collect_derived_names_from_script(script);
    if derived_names.is_empty() {
        return script.to_string();
    }
    let bytes = script.as_bytes();
    let needle = b"$.derived(() => ";
    let mut out = String::with_capacity(script.len());
    let mut i = 0;
    while i < bytes.len() {
        if i + needle.len() <= bytes.len() && &bytes[i..i + needle.len()] == needle {
            // After the prefix `$.derived(() => ` we expect `NAME()` followed
            // by `)`. Read an identifier.
            let start = i + needle.len();
            let mut j = start;
            if j < bytes.len()
                && (bytes[j].is_ascii_alphabetic() || bytes[j] == b'_' || bytes[j] == b'$')
            {
                while j < bytes.len() {
                    let c = bytes[j];
                    if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                        j += 1;
                    } else {
                        break;
                    }
                }
                let name = &script[start..j];
                // Match the exact tail `()` then `)` — anything else is a
                // genuine thunk body and must be left alone.
                if derived_names.contains(name)
                    && j + 2 < bytes.len()
                    && bytes[j] == b'('
                    && bytes[j + 1] == b')'
                    && bytes[j + 2] == b')'
                {
                    out.push_str("$.derived(");
                    out.push_str(name);
                    out.push(')');
                    i = j + 3;
                    continue;
                }
            }
        }
        let mut next = i + 1;
        while next < bytes.len() && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

/// Recursive helper for placeholder bodies that doesn't re-collect names.
/// Same as `wrap_derived_reads_in_script_inner` but with the outer
/// `shadow_ranges` / declarator-LHS positions threaded through, so we don't
/// re-wrap names that are shadowed by inner parameters / declarations.
/// The `outer_offset` is the byte offset of `script` within the full source
/// — every byte position we compare against `shadow_ranges` and
/// `declarator_lhs_positions` gets translated by adding this offset.
fn wrap_derived_reads_in_script_inner_with_shadow(
    script: &str,
    derived_names: &rustc_hash::FxHashSet<String>,
    derived_var_names: &rustc_hash::FxHashSet<String>,
    shadow_ranges: &rustc_hash::FxHashMap<String, Vec<(usize, usize)>>,
    declarator_lhs_positions: &rustc_hash::FxHashSet<usize>,
    outer_offset: usize,
) -> String {
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(script.len() + 4);
    let mut i = 0;
    while i < len {
        let b = bytes[i];
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            let s = i;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            let s = i;
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'"' || b == b'\'' {
            let quote = b;
            let s = i;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !is_after_ident_char(bytes, i) {
            let start = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let name = &script[start..i];
            let absolute_start = start + outer_offset;
            let is_shadowed = shadow_ranges
                .get(name)
                .map(|ranges| {
                    ranges
                        .iter()
                        .any(|&(s, e)| absolute_start >= s && absolute_start < e)
                })
                .unwrap_or(false);
            let is_own_declarator_lhs = declarator_lhs_positions.contains(&absolute_start);
            if !is_shadowed
                && !is_own_declarator_lhs
                && derived_names.contains(name)
                && is_derived_read_position(bytes, start, i)
            {
                if is_object_shorthand_position(bytes, start, i) {
                    out.push_str(name);
                    out.push_str(": ");
                    out.push_str(name);
                    if derived_var_names.contains(name) {
                        out.push_str("?.()");
                    } else {
                        out.push_str("()");
                    }
                } else {
                    out.push_str(name);
                    if derived_var_names.contains(name) {
                        out.push_str("?.()");
                    } else {
                        out.push_str("()");
                    }
                }
            } else {
                out.push_str(name);
            }
            continue;
        }
        // UTF-8 safe step. See `wrap_derived_reads_in_script`.
        let mut next = i + 1;
        while next < len && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

fn wrap_derived_reads_in_script_inner(
    script: &str,
    derived_names: &rustc_hash::FxHashSet<String>,
    derived_var_names: &rustc_hash::FxHashSet<String>,
) -> String {
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(script.len() + 4);
    let mut i = 0;
    while i < len {
        let b = bytes[i];
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            let start = i;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[start..i]);
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            let start = i;
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            out.push_str(&script[start..i]);
            continue;
        }
        if b == b'"' || b == b'\'' {
            let quote = b;
            let start = i;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[start..i]);
            continue;
        }
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !is_after_ident_char(bytes, i) {
            let start = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let name = &script[start..i];
            // Special-case `$state.eager(<arg>)`: upstream's server visitor
            // for CallExpression returns `node.arguments[0]` WITHOUT visiting
            // it, so identifiers inside the eager call don't go through
            // `build_getter` and therefore don't get the `()` derived-read
            // wrap. We mirror that here by emitting the entire
            // `$state.eager(...)` text unchanged so the later
            // `transform_template_rune_ast` unwrap pass can strip the
            // wrapper, leaving the bare identifier intact.
            //
            // Without this, `$state.eager(derivedCount) !== derivedCount`
            // would emit `derivedCount() !== derivedCount()` (both wrapped)
            // instead of upstream's `derivedCount !== derivedCount()` (only
            // the bare read wrapped). Mirrors the SSR side of the
            // `runtime-runes/async-eager-derived` fixture.
            if name == "$state" && script[i..].starts_with(".eager(") {
                let eager_start = start;
                let body_start = i + ".eager(".len();
                let mut depth: i32 = 1;
                let mut j = body_start;
                while j < len && depth > 0 {
                    let c = bytes[j];
                    if c == b'"' || c == b'\'' || c == b'`' {
                        let quote = c;
                        j += 1;
                        while j < len {
                            if bytes[j] == b'\\' && j + 1 < len {
                                j += 2;
                                continue;
                            }
                            if bytes[j] == quote {
                                j += 1;
                                break;
                            }
                            j += 1;
                        }
                        continue;
                    }
                    if c == b'(' {
                        depth += 1;
                    } else if c == b')' {
                        depth -= 1;
                        if depth == 0 {
                            j += 1;
                            break;
                        }
                    }
                    j += 1;
                }
                out.push_str(&script[eager_start..j]);
                i = j;
                continue;
            }
            if derived_names.contains(name) && is_derived_read_position(bytes, start, i) {
                if is_object_shorthand_position(bytes, start, i) {
                    out.push_str(name);
                    out.push_str(": ");
                    out.push_str(name);
                    if derived_var_names.contains(name) {
                        out.push_str("?.()");
                    } else {
                        out.push_str("()");
                    }
                } else {
                    out.push_str(name);
                    if derived_var_names.contains(name) {
                        out.push_str("?.()");
                    } else {
                        out.push_str("()");
                    }
                }
            } else {
                out.push_str(name);
            }
            continue;
        }
        // UTF-8 safe step. See `wrap_derived_reads_in_script`.
        let mut next = i + 1;
        while next < len && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

fn is_after_ident_char(bytes: &[u8], i: usize) -> bool {
    if i == 0 {
        return false;
    }
    let c = bytes[i - 1];
    // `#` starts a class private name (`#y`), a distinct token from the
    // plain identifier `y` — never treat it as a bare identifier start.
    c.is_ascii_alphanumeric() || c == b'_' || c == b'$' || c == b'#'
}

/// Given the index of an opening `(` in `bytes`, return the index of its
/// matching `)`. Skips `'…'` / `"…"` string literals so a `)` inside a string
/// argument doesn't break depth tracking. Returns `None` if unbalanced.
fn matching_paren_close(bytes: &[u8], open: usize) -> Option<usize> {
    let mut depth = 0i32;
    let mut i = open;
    let mut string: Option<u8> = None;
    while i < bytes.len() {
        let c = bytes[i];
        if let Some(q) = string {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q {
                string = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'\'' | b'"' | b'`' => string = Some(c),
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Decide whether the identifier at `bytes[start..end]` is a *read* of a
/// derived binding (so it should be rewritten to `name()`).
fn is_derived_read_position(bytes: &[u8], start: usize, end: usize) -> bool {
    // The identifier already passes `!is_after_ident_char`, but we still
    // need to reject `obj.foo` (member access) and a number of declaration
    // / shorthand-property positions.
    let prev_non_ws_idx = (0..start).rev().find(|&i| !bytes[i].is_ascii_whitespace());
    let prev_non_ws = prev_non_ws_idx.map(|i| bytes[i]);
    if matches!(prev_non_ws, Some(b'.')) {
        // `obj.foo` / `obj?.foo` is member access — skip. But `...foo` is
        // a spread / rest operator, and `foo` *is* a read in that case.
        // Detect spread by looking at the two bytes before `.`.
        if let Some(dot_idx) = prev_non_ws_idx
            && dot_idx >= 2
            && bytes[dot_idx - 1] == b'.'
            && bytes[dot_idx - 2] == b'.'
        {
            // `...foo` — fall through to wrap.
        } else {
            return false;
        }
    }
    // Declaration / function name positions: `let foo`, `const foo`,
    // `var foo`, `function foo`, `class foo`. Look back for the keyword.
    if let Some(b) = prev_non_ws {
        // Skip if previous token is one of these keywords.
        let kw_end = (0..start)
            .rev()
            .find(|&i| !bytes[i].is_ascii_whitespace())
            .map(|i| i + 1)
            .unwrap_or(0);
        let _ = b;
        for kw in [
            &b"let"[..],
            &b"const"[..],
            &b"var"[..],
            &b"function"[..],
            &b"class"[..],
        ] {
            if kw_end >= kw.len() && bytes[kw_end - kw.len()..kw_end] == *kw {
                // Word boundary check on the left side.
                if kw_end == kw.len()
                    || !{
                        let pc = bytes[kw_end - kw.len() - 1];
                        pc.is_ascii_alphanumeric() || pc == b'_' || pc == b'$'
                    }
                {
                    return false;
                }
            }
        }
    }
    // What follows the identifier?
    let next_non_ws = (end..bytes.len())
        .find(|&i| !bytes[i].is_ascii_whitespace())
        .map(|i| bytes[i]);
    match next_non_ws {
        // `foo(...)`. Two cases:
        // - `foo()` (empty call) is already a getter invocation (or text a prior
        //   pass already wrapped); leave it so we never double-wrap to `foo()()`.
        // - `foo(arg)` means the derived's VALUE is itself a function being
        //   invoked, so the read still needs wrapping: `foo(arg)` -> `foo()(arg)`.
        //   Mirrors upstream Identifier.js wrapping every derived ref with
        //   b.call so the parent CallExpression's callee becomes `foo()`.
        Some(b'(') => {
            let paren_idx = (end..bytes.len()).find(|&i| bytes[i] == b'(');
            match paren_idx {
                Some(pi) => {
                    let after = (pi + 1..bytes.len())
                        .find(|&i| !bytes[i].is_ascii_whitespace())
                        .map(|i| bytes[i]);
                    if after == Some(b')') {
                        // Empty call `foo()` — already a getter call; leave it.
                        return false;
                    }
                    // `foo(args)`. Exclude method/accessor declarations like
                    // `set y($$value) { ... }`: if the matching `)` of the arg
                    // list is followed by `{`, it's a parameter list of a member
                    // definition, not a call of the derived's function value.
                    // Comment-agnostic, unlike a get/set keyword scan.
                    let close = matching_paren_close(bytes, pi);
                    if let Some(ci) = close {
                        let next = (ci + 1..bytes.len())
                            .find(|&i| !bytes[i].is_ascii_whitespace())
                            .map(|i| bytes[i]);
                        if next == Some(b'{') {
                            return false;
                        }
                    }
                    // Genuine call of the derived's function value:
                    // `foo(arg)` -> `foo()(arg)` (mirrors upstream Identifier.js).
                    true
                }
                None => false,
            }
        }
        // Property shorthand or object key: `{ foo: ... }` / `{ foo,` /
        // `{ foo }`. Detect by scanning back to the nearest `{` and ensuring
        // it's not a block context (e.g. `({ foo: ... })` in a return).
        Some(b':') => {
            // Only treat as a key if we're at the top of an object literal.
            // Heuristic: look back for `,` or `{` skipping whitespace; if we
            // hit `{`, this is a property key. If we hit `(`, `[`, or
            // operators / `?` / etc., it's a ternary / labelled statement
            // and we should rewrite.
            let mut j = start;
            let mut depth_paren: i32 = 0;
            let mut depth_brace: i32 = 0;
            let mut depth_bracket: i32 = 0;
            while j > 0 {
                j -= 1;
                let c = bytes[j];
                if c.is_ascii_whitespace() {
                    continue;
                }
                if c == b')' {
                    depth_paren += 1;
                    continue;
                }
                if c == b'(' {
                    if depth_paren == 0 {
                        // Function call / parenthesized expression context.
                        return true;
                    }
                    depth_paren -= 1;
                    continue;
                }
                if c == b']' {
                    depth_bracket += 1;
                    continue;
                }
                if c == b'[' {
                    if depth_bracket == 0 {
                        return true;
                    }
                    depth_bracket -= 1;
                    continue;
                }
                if c == b'}' {
                    depth_brace += 1;
                    continue;
                }
                if c == b'{' {
                    if depth_brace == 0 {
                        // It's a property key.
                        return false;
                    }
                    depth_brace -= 1;
                    continue;
                }
                if c == b',' && depth_paren == 0 && depth_brace == 0 && depth_bracket == 0 {
                    // Comma at this nesting level — could be inside an object
                    // literal `{ a, foo: ... }`. Continue scanning back.
                    continue;
                }
                if c == b'?' && depth_paren == 0 && depth_brace == 0 && depth_bracket == 0 {
                    // Ternary: `cond ? foo : bar` — rewrite.
                    return true;
                }
                // Default: keep scanning.
            }
            // Hit start of file — treat as label, do not rewrite.
            false
        }
        _ => true,
    }
}

/// For each name in `names`, find byte ranges in `script` where that name is
/// shadowed by a nested `let|const|var|function|class IDENT` declaration or
/// by a function parameter list. Returns a map `name -> Vec<(start, end)>`.
///
/// This is a coarse, brace-counting approximation of lexical scope. It
/// catches the common cases that drive the upstream test suite (e.g.
/// `let x = $derived(...)` then `function foo() { let x = $state(0); ... x ... }`)
/// without doing a full scope analysis.
fn compute_shadow_ranges(
    script: &str,
    names: &rustc_hash::FxHashSet<String>,
    derived_declarators: &[(usize, usize, String)],
) -> rustc_hash::FxHashMap<String, Vec<(usize, usize)>> {
    let mut ranges: rustc_hash::FxHashMap<String, Vec<(usize, usize)>> =
        rustc_hash::FxHashMap::default();
    let bytes = script.as_bytes();
    let len = bytes.len();
    if len == 0 || names.is_empty() {
        return ranges;
    }
    // Positions of derived identifier declarations — when scanning `let X`
    // declarators we skip these (they are the deriveds themselves, not
    // shadow declarations).
    let derived_positions: rustc_hash::FxHashSet<usize> =
        derived_declarators.iter().map(|(s, _, _)| *s).collect();
    // Brace-tracking state: for each `{` we push the brace's index and a
    // set of names declared in *that* block. When `}` closes the block, we
    // pop the frame and add a range for every name declared.
    #[derive(Default)]
    struct Frame {
        open: usize,
        // Names declared in this block.
        declared: Vec<String>,
        // True when this frame was opened by a `${` template-literal
        // placeholder: after its `}` closes we must resume scanning the
        // surrounding template-literal *text* (not code).
        template_placeholder: bool,
    }
    let mut stack: Vec<Frame> = Vec::new();
    // Scan template-literal text starting at `from` (just inside the
    // backtick). Returns `(next_i, entered_placeholder)`: when a `${` is
    // found, `next_i` points just past the `{` and `entered_placeholder` is
    // true; otherwise `next_i` points past the closing backtick (or EOF).
    let scan_template_text = |bytes: &[u8], from: usize| -> (usize, bool) {
        let len = bytes.len();
        let mut i = from;
        while i < len {
            if bytes[i] == b'\\' && i + 1 < len {
                i += 2;
                continue;
            }
            if bytes[i] == b'`' {
                return (i + 1, false);
            }
            if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                return (i + 2, true);
            }
            i += 1;
        }
        (len, false)
    };
    // Helper to add a declared name + a range that runs from the next
    // statement until the closing brace. The range start is the position
    // *after* the declaration's identifier (so the declaration itself
    // doesn't get wrapped, while subsequent reads inside the block do).
    let mut i = 0;
    // Track whether the most recent non-whitespace, non-comment token is
    // one that should be followed by parameter list / declaration. Used
    // for detecting `function NAME(...)`, `(IDENT) => ...`, etc.
    let mut saw_function_kw = false;

    while i < len {
        let b = bytes[i];
        // Skip comments.
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            continue;
        }
        // Skip string literals.
        if b == b'"' || b == b'\'' {
            let q = b;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                if bytes[i] == q {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }
        // Skip template literals (but track `${...}` placeholders by treating
        // them as nested code regions — we still want to find shadow decls
        // inside placeholders).
        if b == b'`' {
            let (next, entered) = scan_template_text(bytes, i + 1);
            i = next;
            if entered {
                // Step into the placeholder; mark the frame so the closing
                // `}` resumes template-text scanning.
                stack.push(Frame {
                    open: i,
                    declared: Vec::new(),
                    template_placeholder: true,
                });
            }
            continue;
        }
        if b == b'{' {
            stack.push(Frame {
                open: i,
                declared: Vec::new(),
                template_placeholder: false,
            });
            i += 1;
            continue;
        }
        if b == b'}' {
            if let Some(frame) = stack.pop() {
                for name in &frame.declared {
                    ranges
                        .entry(name.clone())
                        .or_default()
                        .push((frame.open, i));
                }
                if frame.template_placeholder {
                    // Back inside the surrounding template literal's text.
                    let (next, entered) = scan_template_text(bytes, i + 1);
                    i = next;
                    if entered {
                        stack.push(Frame {
                            open: i,
                            declared: Vec::new(),
                            template_placeholder: true,
                        });
                    }
                    continue;
                }
            }
            i += 1;
            continue;
        }
        // Detect declaration keywords and arrow params.
        // `let`/`const`/`var`: read identifier after.
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !is_after_ident_char(bytes, i) {
            let id_start = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let id = &script[id_start..i];
            // Handle `let`/`const`/`var` — collect every identifier in the
            // declarator list until we hit a top-level `;` or `=` at depth 0.
            if id == "let" || id == "const" || id == "var" {
                // Just read the declarator names + their positions, but
                // don't advance `i` past the value RHS — we need to keep
                // scanning inside (`$derived(() => { ... })` may contain
                // nested declarations that themselves shadow names).
                let decl_start = i;
                // Find the end of the declarator pattern (up to the first
                // top-level `=` or `;`/`,`). We only need the LHS patterns.
                let mut depth_paren = 0i32;
                let mut depth_bracket = 0i32;
                let mut depth_brace_inline = 0i32;
                let mut j = decl_start;
                while j < len {
                    let cc = bytes[j];
                    if cc == b'"' || cc == b'\'' {
                        let q = cc;
                        j += 1;
                        while j < len {
                            if bytes[j] == b'\\' && j + 1 < len {
                                j += 2;
                                continue;
                            }
                            if bytes[j] == q {
                                j += 1;
                                break;
                            }
                            j += 1;
                        }
                        continue;
                    }
                    match cc {
                        b'(' => depth_paren += 1,
                        b')' => {
                            depth_paren -= 1;
                            // If we've exited the enclosing `for (` / `while (`
                            // / `if (` paren, the declarator is done.
                            if depth_paren < 0 {
                                break;
                            }
                        }
                        b'[' => depth_bracket += 1,
                        b']' => {
                            depth_bracket -= 1;
                            if depth_bracket < 0 {
                                break;
                            }
                        }
                        b'{' => depth_brace_inline += 1,
                        b'}' => {
                            if depth_brace_inline == 0 {
                                break;
                            }
                            depth_brace_inline -= 1;
                        }
                        b';' if depth_paren == 0
                            && depth_bracket == 0
                            && depth_brace_inline == 0 =>
                        {
                            break;
                        }
                        // Stop at top-level `=` — everything after is the
                        // value expression, which we'll keep scanning.
                        b'=' if depth_paren == 0
                            && depth_bracket == 0
                            && depth_brace_inline == 0 =>
                        {
                            // Check this isn't `==` / `===` — but at depth 0
                            // inside a declarator, `=` is always assignment.
                            break;
                        }
                        _ => {}
                    }
                    j += 1;
                }
                let decl_text = &script[decl_start..j];
                // Truncate to LHS pattern only (stops at `of`/`in` keywords
                // so that `for (const key of Object.keys(a))` doesn't
                // accidentally register `a` as a shadowing declaration).
                let pattern_text = declarator_pattern_only(decl_text);
                for (rel_start, n) in extract_declarator_names_with_pos(pattern_text) {
                    let abs_start = decl_start + rel_start;
                    // Skip the derived's own declaration — references to
                    // the derived inside the enclosing block should still
                    // wrap.
                    if derived_positions.contains(&abs_start) {
                        continue;
                    }
                    if names.contains(&n)
                        && let Some(top) = stack.last_mut()
                    {
                        top.declared.push(n);
                    }
                }
                // Continue scanning from `j` (the `=` or `;` position) so
                // the value expression (which may contain nested
                // declarations / arrow bodies) gets scanned normally.
                i = j;
                continue;
            }
            // Function declaration: `function NAME(params) { ... }` —
            // NAME is declared in the *enclosing* scope, params in the
            // function body scope. We'll catch params when we enter the
            // body's `{`.
            if id == "function" {
                saw_function_kw = true;
                continue;
            }
            // Class declaration: `class NAME { ... }` — NAME in enclosing scope.
            if id == "class" {
                // Read NAME if present.
                let mut j = i;
                while j < len && bytes[j].is_ascii_whitespace() {
                    j += 1;
                }
                if j < len
                    && (bytes[j].is_ascii_alphabetic() || bytes[j] == b'_' || bytes[j] == b'$')
                {
                    let ns = j;
                    while j < len {
                        let cc = bytes[j];
                        if cc.is_ascii_alphanumeric() || cc == b'_' || cc == b'$' {
                            j += 1;
                        } else {
                            break;
                        }
                    }
                    let n = &script[ns..j];
                    if names.contains(n)
                        && let Some(top) = stack.last_mut()
                    {
                        top.declared.push(n.to_string());
                    }
                }
                i = j;
                continue;
            }
            if saw_function_kw {
                // Identifier right after `function` is the function name —
                // declared in enclosing scope.
                if names.contains(id)
                    && let Some(top) = stack.last_mut()
                {
                    top.declared.push(id.to_string());
                }
                saw_function_kw = false;
                continue;
            }
            // Otherwise, normal identifier — ignore.
            saw_function_kw = false;
            continue;
        }
        // Arrow function detection: when we see `(`, *peek* ahead to find
        // the matching `)` and check if `=>` follows. If yes, treat the
        // body's brace as a shadowing scope. Crucially, we do NOT consume
        // the body — we let the normal brace scanner descend into it so
        // nested declarations get tracked.
        if b == b'(' {
            let open = i;
            let mut peek = i + 1;
            let mut depth = 1i32;
            let param_text_start = peek;
            while peek < len && depth > 0 {
                let cc = bytes[peek];
                if cc == b'"' || cc == b'\'' {
                    let q = cc;
                    peek += 1;
                    while peek < len {
                        if bytes[peek] == b'\\' && peek + 1 < len {
                            peek += 2;
                            continue;
                        }
                        if bytes[peek] == q {
                            peek += 1;
                            break;
                        }
                        peek += 1;
                    }
                    continue;
                }
                if cc == b'`' {
                    peek += 1;
                    while peek < len {
                        if bytes[peek] == b'\\' && peek + 1 < len {
                            peek += 2;
                            continue;
                        }
                        if bytes[peek] == b'`' {
                            peek += 1;
                            break;
                        }
                        peek += 1;
                    }
                    continue;
                }
                if cc == b'(' {
                    depth += 1;
                } else if cc == b')' {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                peek += 1;
            }
            let param_text_end = peek;
            let after_paren = peek + 1; // past `)`
            // Look for `=>` after closing paren.
            let mut k = after_paren;
            while k < len && bytes[k].is_ascii_whitespace() {
                k += 1;
            }
            let is_arrow = k + 1 < len && bytes[k] == b'=' && bytes[k + 1] == b'>';
            // Detect `function NAME(params) { ... }` / `function (params) { ... }`
            // / `function* NAME(params) { ... }`. The opening paren may also be
            // for a method definition: `foo(params) { ... }` inside an object /
            // class body. In either case, the `{` directly following the `)`
            // opens a new scope and the params shadow.
            let is_fn_like_body = !is_arrow && k < len && bytes[k] == b'{' && {
                // Walk back from `open` (the `(`), skipping whitespace, to find
                // the function keyword or method name. We only treat this as a
                // function-body open when:
                //   - the token immediately before is `function` (possibly
                //     followed by a `*` and a name), OR
                //   - the token immediately before is an identifier *and*
                //     preceded by `function`, OR
                //   - the prev token is an identifier (method shorthand). To
                //     avoid false positives on `if(...){`, `for(...){`,
                //     `while(...){`, `switch(...){`, `catch(...){`, we
                //     blacklist those keywords.
                let mut p = open;
                while p > 0 && bytes[p - 1].is_ascii_whitespace() {
                    p -= 1;
                }
                let prev_end = p;
                while p > 0 {
                    let cc = bytes[p - 1];
                    if cc.is_ascii_alphanumeric() || cc == b'_' || cc == b'$' {
                        p -= 1;
                    } else {
                        break;
                    }
                }
                if p == prev_end {
                    false
                } else {
                    let prev_ident = &script[p..prev_end];
                    // If the identifier is preceded by `.`, it's a property
                    // access call like `Object.keys(params) { ... }` — the
                    // `{` is a `for`/control-flow body, not a function body.
                    // Method calls can never open a new parameter scope, so
                    // treat them the same as control-flow keywords.
                    let preceded_by_dot = p > 0 && bytes[p - 1] == b'.';
                    !preceded_by_dot
                        && !matches!(
                            prev_ident,
                            "if" | "for"
                                | "while"
                                | "switch"
                                | "catch"
                                | "with"
                                | "do"
                                | "return"
                                | "typeof"
                                | "void"
                                | "delete"
                                | "new"
                                | "in"
                                | "of"
                                | "await"
                                | "yield"
                                | "throw"
                        )
                }
            };
            if is_arrow || is_fn_like_body {
                let param_text = if param_text_end > param_text_start {
                    &script[param_text_start..param_text_end]
                } else {
                    ""
                };
                let mut params = extract_param_names(param_text);
                params.retain(|n| names.contains(n));
                let mut m = if is_arrow { k + 2 } else { k }; // past `=>` or at `{`
                while m < len && bytes[m].is_ascii_whitespace() {
                    m += 1;
                }
                if m < len && bytes[m] == b'{' {
                    // Push a frame for the body, pre-populated with params.
                    // Advance `i` to *just past* the body `{` so brace
                    // tracking is consistent. The frame opens at the param
                    // list `(` (not the body `{`) so the parameter
                    // identifiers themselves are inside the shadow range —
                    // `function updateLeft(left) {…}` must not wrap the
                    // param `left` even when an outer derived is named
                    // `left`.
                    stack.push(Frame {
                        open,
                        declared: params,
                        template_placeholder: false,
                    });
                    i = m + 1;
                    continue;
                } else if is_arrow {
                    // Single-expression arrow. Find end of expression by
                    // a coarse scan, then record param shadow range.
                    let mut depth_p = 0i32;
                    let mut depth_b = 0i32;
                    let mut e = m;
                    while e < len {
                        let cc = bytes[e];
                        if cc == b'(' {
                            depth_p += 1;
                        } else if cc == b')' {
                            if depth_p == 0 {
                                break;
                            }
                            depth_p -= 1;
                        } else if cc == b'[' {
                            depth_b += 1;
                        } else if cc == b']' {
                            if depth_b == 0 {
                                break;
                            }
                            depth_b -= 1;
                        } else if (cc == b',' || cc == b';') && depth_p == 0 && depth_b == 0 {
                            break;
                        }
                        e += 1;
                    }
                    for n in params {
                        // Range opens at the param `(` so the parameter
                        // identifiers themselves are covered.
                        ranges.entry(n).or_default().push((open, e));
                    }
                    i = m;
                    continue;
                }
            }
            // Not an arrow — step past the `(` and keep scanning so
            // inner braces / decls get tracked.
            let _ = open;
            i += 1;
            continue;
        }
        saw_function_kw = false;
        i += 1;
    }
    ranges
}

/// Truncate a declarator text to only the LHS binding pattern, stopping at a
/// top-level `of` / `in` keyword (for-of / for-in) at depth 0.  This prevents
/// identifiers that appear in the iterable expression (`for (const key of
/// Object.keys(a))`) from being treated as declared names.
fn declarator_pattern_only(decl: &str) -> &str {
    let bytes = decl.as_bytes();
    let len = bytes.len();
    let mut i = 0usize;
    let mut depth_paren = 0i32;
    let mut depth_bracket = 0i32;
    let mut depth_brace = 0i32;
    while i < len {
        let b = bytes[i];
        match b {
            b'"' | b'\'' => {
                let q = b;
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == q {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
            b'`' => {
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'`' {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
            b'(' => depth_paren += 1,
            b')' => depth_paren -= 1,
            b'[' => depth_bracket += 1,
            b']' => depth_bracket -= 1,
            b'{' => depth_brace += 1,
            b'}' => depth_brace -= 1,
            _ => {}
        }
        // At depth 0, check for `of` or `in` keyword boundaries.
        if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 {
            // Must be preceded by a non-identifier char (word boundary).
            let preceded_by_ident = i > 0 && {
                let pb = bytes[i - 1];
                pb.is_ascii_alphanumeric() || pb == b'_' || pb == b'$'
            };
            if !preceded_by_ident {
                // Check for `of ` or `in ` (keyword + whitespace/end).
                let rest = &bytes[i..];
                let kw_len = if rest.starts_with(b"of") || rest.starts_with(b"in") {
                    Some(2)
                } else {
                    None
                };
                if let Some(kl) = kw_len {
                    // Ensure what follows is not an identifier char (word boundary).
                    let after = i + kl;
                    let followed_by_ident = after < len && {
                        let ab = bytes[after];
                        ab.is_ascii_alphanumeric() || ab == b'_' || ab == b'$'
                    };
                    if !followed_by_ident {
                        return &decl[..i];
                    }
                }
            }
        }
        i += 1;
    }
    decl
}

/// Same as `extract_declarator_names` but also returns the byte offset of
/// each identifier within `decl`.
fn extract_declarator_names_with_pos(decl: &str) -> Vec<(usize, String)> {
    let bytes = decl.as_bytes();
    let len = bytes.len();
    let mut out: Vec<(usize, String)> = Vec::new();
    let mut i = 0;
    let mut depth_paren = 0i32;
    let mut depth_bracket = 0i32;
    let mut depth_brace = 0i32;
    let mut after_eq_at_top = false;
    while i < len {
        let b = bytes[i];
        match b {
            b'"' | b'\'' => {
                let q = b;
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == q {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
            b'`' => {
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'`' {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
            b'(' => depth_paren += 1,
            b')' => depth_paren -= 1,
            b'[' => depth_bracket += 1,
            b']' => depth_bracket -= 1,
            b'{' => depth_brace += 1,
            b'}' => depth_brace -= 1,
            b',' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                after_eq_at_top = false;
                i += 1;
                continue;
            }
            b'=' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                after_eq_at_top = true;
                i += 1;
                continue;
            }
            _ => {}
        }
        if !after_eq_at_top
            && (b.is_ascii_alphabetic() || b == b'_' || b == b'$')
            && !is_after_ident_char(bytes, i)
        {
            let s = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let name = &decl[s..i];
            out.push((s, name.to_string()));
            continue;
        }
        i += 1;
    }
    out
}

fn extract_declarator_names(decl: &str) -> Vec<String> {
    // Extract identifier names from a declarator list like ` x, y = 1, { a, b: c }`.
    // We respect bracket/paren nesting and only emit names at top level.
    let bytes = decl.as_bytes();
    let len = bytes.len();
    let mut names: Vec<String> = Vec::new();
    let mut i = 0;
    let mut depth_paren = 0i32;
    let mut depth_bracket = 0i32;
    let mut depth_brace = 0i32;
    let mut after_eq_at_top = false;
    while i < len {
        let b = bytes[i];
        match b {
            b'"' | b'\'' => {
                let q = b;
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == q {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
            b'`' => {
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'`' {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
            b'(' => {
                depth_paren += 1;
            }
            b')' => {
                depth_paren -= 1;
            }
            b'[' => {
                depth_bracket += 1;
            }
            b']' => {
                depth_bracket -= 1;
            }
            b'{' => {
                depth_brace += 1;
            }
            b'}' => {
                depth_brace -= 1;
            }
            b',' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                after_eq_at_top = false;
                i += 1;
                continue;
            }
            b'=' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                // Equals at top level — skip the value until the next top-level `,`.
                after_eq_at_top = true;
                i += 1;
                continue;
            }
            _ => {}
        }
        // Read identifier if at the right depth and not after `=` at top level.
        if !after_eq_at_top
            && (b.is_ascii_alphabetic() || b == b'_' || b == b'$')
            && !is_after_ident_char(bytes, i)
        {
            let s = i;
            while i < len {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            // Inside `{ a, b: c }` patterns, after `:` is the renaming target
            // (the actual binding). Both `a` (shorthand) and `c` (renamed
            // target) bind. For our purposes we treat any identifier reached
            // here as a potential binding.
            let name = &decl[s..i];
            names.push(name.to_string());
            continue;
        }
        i += 1;
    }
    names
}

fn extract_param_names(params: &str) -> Vec<String> {
    // Identical lexical structure to a declarator list (well, mostly).
    extract_declarator_names(params)
}

/// Expand destructured `$derived(...)` / `$derived.by(...)` declarations into
/// per-leaf `$.derived(...)` declarators, mirroring upstream's `extract_paths`
/// pass in `VariableDeclaration.js` (Svelte 5.52+).
///
/// Examples:
///   `let { foo, bar: [a, b] } = $derived(stuff)`
/// becomes:
///   `let $$derived_array = $.derived(() => $.to_array(stuff.bar, 2)),
///        foo = $.derived(() => stuff.foo),
///        a = $.derived(() => $$derived_array[0]),
///        b = $.derived(() => $$derived_array[1])`
///
/// The post-pass `wrap_derived_reads_in_script` then converts
/// `$$derived_array[0]` to `$$derived_array()[0]`.
///
/// When the rune is plain `$derived` *and* the argument is a bare identifier,
/// upstream skips the intermediate `$$d` declarator and inlines the identifier
/// directly in each path expression (matches the
/// `derived-destructured` / `derived-rest-includes-symbol` fixtures).
fn expand_destructured_derived(script: &str) -> String {
    use std::sync::atomic::{AtomicUsize, Ordering};
    // Counter for generating unique `$$derived_array` / `$$d` names across
    // the whole script. We don't try to be clever about scoping — there are
    // no nested destructured deriveds in the test corpus.
    //
    // These MUST be call-local, not `static`: the test runner (and any
    // parallel consumer) compiles many components concurrently, and a shared
    // global counter would race — one compile resetting/incrementing another's
    // counter, producing nondeterministic `$$derived_array_N` numbering.
    let derived_array_counter = AtomicUsize::new(0);
    let d_counter = AtomicUsize::new(0);

    let mut result = String::with_capacity(script.len());
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    // Push the codepoint starting at byte `i` and return the byte length we
    // advanced. We can't `bytes[i] as char`: that interprets a single UTF-8
    // continuation byte as a Latin-1 code point and corrupts multi-byte chars
    // (e.g. 'é' = 0xC3 0xA9 → "Ã©"). Step by UTF-8 char boundary instead.
    let push_char = |result: &mut String, i: usize| -> usize {
        let mut end = i + 1;
        while end < len && !script.is_char_boundary(end) {
            end += 1;
        }
        result.push_str(&script[i..end]);
        end - i
    };

    while i < len {
        // Try to match `let|var|const`  WS  PATTERN  WS  `=`  WS  `$derived(`/`$derived.by(`
        //
        // Use byte slicing — the source can contain multi-byte UTF-8 (e.g.
        // identifiers / string literals with accented chars), so string
        // slicing here will panic on a char-boundary mismatch even though we
        // only ever care about ASCII keywords.
        let keyword_len = if i + 4 <= len
            && &bytes[i..i + 3] == b"let"
            && is_word_boundary(bytes, i, i + 3)
        {
            Some(3usize)
        } else if i + 6 <= len && &bytes[i..i + 5] == b"const" && is_word_boundary(bytes, i, i + 5)
        {
            Some(5)
        } else if i + 4 <= len && &bytes[i..i + 3] == b"var" && is_word_boundary(bytes, i, i + 3) {
            Some(3)
        } else {
            None
        };
        let Some(kw_len) = keyword_len else {
            i += push_char(&mut result, i);
            continue;
        };
        // Word boundary on left: must be at start, or preceded by
        // non-identifier char.
        if i > 0 {
            let prev = bytes[i - 1];
            if prev.is_ascii_alphanumeric() || prev == b'_' || prev == b'$' {
                i += push_char(&mut result, i);
                continue;
            }
        }
        let kw_end = i + kw_len;
        // Skip whitespace
        let mut p = kw_end;
        while p < len && (bytes[p] == b' ' || bytes[p] == b'\t') {
            p += 1;
        }
        // Expect '{' or '[' for a destructure pattern
        if p >= len || (bytes[p] != b'{' && bytes[p] != b'[') {
            i += push_char(&mut result, i);
            continue;
        }
        let pattern_start = p;
        let open = bytes[p];
        let close = if open == b'{' { b'}' } else { b']' };
        let Some(pattern_end) = find_matching_bracket(bytes, pattern_start + 1, open, close) else {
            i += push_char(&mut result, i);
            continue;
        };
        // After the pattern, expect optional whitespace, then `=`, then `$derived(` / `$derived.by(`.
        let mut q = pattern_end + 1;
        while q < len && (bytes[q] == b' ' || bytes[q] == b'\t' || bytes[q] == b'\n') {
            q += 1;
        }
        if q >= len || bytes[q] != b'=' {
            i += push_char(&mut result, i);
            continue;
        }
        // Reject `==` / `=>`
        if q + 1 < len && (bytes[q + 1] == b'=' || bytes[q + 1] == b'>') {
            i += push_char(&mut result, i);
            continue;
        }
        q += 1;
        while q < len && (bytes[q] == b' ' || bytes[q] == b'\t' || bytes[q] == b'\n') {
            q += 1;
        }
        // Match `$derived(` or `$derived.by(`
        let (is_by, rhs_start) = if q + 12 <= len && &script[q..q + 12] == "$derived.by(" {
            (true, q + 12)
        } else if q + 9 <= len && &script[q..q + 9] == "$derived(" {
            (false, q + 9)
        } else {
            i += push_char(&mut result, i);
            continue;
        };
        // Word boundary before `$derived` — must not be an identifier char.
        // (We already know it's preceded by `=` and whitespace, so this is
        // mostly defensive.)
        let Some(close_paren_offset) = find_matching_paren_for_state(&script[rhs_start..]) else {
            i += push_char(&mut result, i);
            continue;
        };
        let rhs_end = rhs_start + close_paren_offset;
        let arg_expr = script[rhs_start..rhs_end].trim();
        // Drop trailing comma like upstream's call-arg cleanup.
        let arg_expr = arg_expr.trim_end_matches(',').trim();

        // Build the replacement. First, figure out the base RHS we use in
        // each path expression. Upstream:
        //   - For `$derived(IDENT)`, base = `IDENT`, no `$$d` declarator.
        //   - Else, generate `$$d` declarator, base = `$$d` (which becomes
        //     `$$d()` after wrap_derived_reads_in_script).
        let mut decls: Vec<(String, String)> = Vec::new(); // (lhs, rhs)
        let arg_is_ident = is_plain_identifier(arg_expr);
        let base_expr = if !is_by && arg_is_ident {
            arg_expr.to_string()
        } else {
            let n = d_counter.fetch_add(1, Ordering::Relaxed);
            let name = if n == 0 {
                "$$d".to_string()
            } else {
                format!("$$d_{}", n)
            };
            // Initializer: `$.derived(...)` — for `.by` we pass the value
            // directly; for plain `$derived(expr)` we wrap in `() => expr`.
            let init = if is_by {
                format!("$.derived({})", arg_expr)
            } else {
                let needs_paren = arg_expr.trim_start().starts_with('{');
                if needs_paren {
                    format!("$.derived(() => ({}))", arg_expr)
                } else if let Some(ident) = unthunk_no_arg_ident_call(arg_expr) {
                    format!("$.derived({})", ident)
                } else {
                    format!("$.derived(() => {})", arg_expr)
                }
            };
            decls.push((name.clone(), init));
            name
        };
        // Walk the pattern, collecting inserts and paths.
        let pattern_text = &script[pattern_start..=pattern_end];
        let mut inserts: Vec<(String, String)> = Vec::new(); // (lhs_name, rhs_init)
        let mut paths: Vec<(String, String)> = Vec::new(); // (lhs_text, leaf_expression)
        extract_paths_walk(
            pattern_text,
            &base_expr,
            &mut inserts,
            &mut paths,
            &derived_array_counter,
        );

        // Compose declarators in upstream order: inserts (already in DFS
        // order) come before all leaf paths.
        for (name, init_expr) in &inserts {
            decls.push((name.clone(), format!("$.derived(() => {})", init_expr)));
        }
        for (lhs, expr) in &paths {
            decls.push((lhs.clone(), format!("$.derived(() => {})", expr)));
        }

        // Emit `let|const|var <lhs1> = <rhs1>, <lhs2> = <rhs2>, ...;`
        // We preserve the original keyword and continue the source past
        // `)` (close paren of the `$derived(...)` call). Trailing source
        // (e.g. `;` or `,` continuation) is preserved.
        let keyword = &script[i..kw_end];
        result.push_str(keyword);
        result.push(' ');
        for (idx, (lhs, rhs)) in decls.iter().enumerate() {
            if idx > 0 {
                result.push_str(",\n\t");
            }
            result.push_str(lhs);
            result.push_str(" = ");
            result.push_str(rhs);
        }
        // Continue past the closing `)` of `$derived(...)`.
        i = rhs_end + 1;
    }

    result
}

/// Walk a destructure pattern (text starting with `{` or `[`) and populate
/// `inserts` (intermediate `$$derived_array` declarators) and `paths` (leaf
/// declarators with their access expression).
fn extract_paths_walk(
    pattern: &str,
    initial: &str,
    inserts: &mut Vec<(String, String)>,
    paths: &mut Vec<(String, String)>,
    derived_array_counter: &std::sync::atomic::AtomicUsize,
) {
    use std::sync::atomic::Ordering;
    let pattern = pattern.trim();
    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let props = split_top_level(inner, b',');
        // First collect non-rest property keys for any rest's exclusion.
        let exclude_keys: Vec<String> = props
            .iter()
            .filter_map(|p| {
                let p = p.trim();
                if p.is_empty() || p.starts_with("...") {
                    return None;
                }
                let key = if let Some(colon) = find_top_level_colon(p) {
                    p[..colon].trim()
                } else if let Some(eq) = find_top_level_equals(p) {
                    p[..eq].trim()
                } else {
                    p
                };
                if key.starts_with('[') {
                    None
                } else {
                    Some(format!("\"{}\"", key))
                }
            })
            .collect();

        for prop in &props {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let rest_expr = format!(
                    "$.exclude_from_object({}, [{}])",
                    initial,
                    exclude_keys.join(", ")
                );
                if is_plain_identifier(rest_name) {
                    paths.push((rest_name.to_string(), rest_expr));
                } else {
                    extract_paths_walk(
                        rest_name,
                        &rest_expr,
                        inserts,
                        paths,
                        derived_array_counter,
                    );
                }
                continue;
            }
            // Detect renamed property: `key: value_pattern` (value_pattern may itself be a destructure or default).
            if let Some(colon) = find_top_level_colon(prop) {
                let key = prop[..colon].trim();
                let value_pat = prop[colon + 1..].trim();
                let member = make_member(initial, key);
                handle_value_pattern(value_pat, &member, inserts, paths, derived_array_counter);
            } else if let Some(eq) = find_top_level_equals(prop) {
                // Shorthand with default: `name = default`
                let name = prop[..eq].trim();
                let default = prop[eq + 1..].trim();
                let member = make_member(initial, name);
                let fallback = build_fallback_text(&member, default);
                paths.push((name.to_string(), fallback));
            } else {
                // Shorthand: `name`
                let name = prop;
                let member = make_member(initial, name);
                paths.push((name.to_string(), member));
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_top_level(inner, b',');
        // Determine whether the last element is a rest. If so, the
        // upstream call omits the second `to_array` arg (capacity).
        let has_rest = elements
            .last()
            .map(|e| e.trim().starts_with("..."))
            .unwrap_or(false);
        let array_name = {
            let n = derived_array_counter.fetch_add(1, Ordering::Relaxed);
            if n == 0 {
                "$$derived_array".to_string()
            } else {
                format!("$$derived_array_{}", n)
            }
        };
        let to_array_call = if has_rest {
            format!("$.to_array({})", initial)
        } else {
            format!("$.to_array({}, {})", initial, elements.len())
        };
        inserts.push((array_name.clone(), to_array_call));
        for (idx, elem) in elements.iter().enumerate() {
            let elem = elem.trim();
            if elem.is_empty() {
                continue;
            }
            if let Some(rest_name) = elem.strip_prefix("...") {
                let rest_name = rest_name.trim();
                // upstream: `b.call(b.member(id, 'slice'), b.literal(i))`
                // After wrap_derived_reads, `array_name` becomes
                // `array_name()`. So the literal we emit is
                // `array_name.slice(i)` which becomes `array_name().slice(i)`.
                let rest_expr = format!("{}.slice({})", array_name, idx);
                if is_plain_identifier(rest_name) {
                    paths.push((rest_name.to_string(), rest_expr));
                } else {
                    extract_paths_walk(
                        rest_name,
                        &rest_expr,
                        inserts,
                        paths,
                        derived_array_counter,
                    );
                }
                continue;
            }
            // Element access via index. We emit `array_name[idx]` and
            // wrap_derived_reads_in_script will turn it into `array_name()[idx]`.
            let elem_access = format!("{}[{}]", array_name, idx);
            // Default value: `name = default`
            if let Some(eq) = find_top_level_equals(elem) {
                let name_part = elem[..eq].trim();
                let default = elem[eq + 1..].trim();
                if is_plain_identifier(name_part) {
                    let fallback = build_fallback_text(&elem_access, default);
                    paths.push((name_part.to_string(), fallback));
                } else {
                    // Nested with default: `{a, b} = {}`
                    let fallback = build_fallback_text(&elem_access, default);
                    extract_paths_walk(name_part, &fallback, inserts, paths, derived_array_counter);
                }
            } else if elem.starts_with('{') || elem.starts_with('[') {
                extract_paths_walk(elem, &elem_access, inserts, paths, derived_array_counter);
            } else {
                paths.push((elem.to_string(), elem_access));
            }
        }
    } else {
        // Identifier leaf
        if is_plain_identifier(pattern) {
            paths.push((pattern.to_string(), initial.to_string()));
        }
    }
}

/// Inside an object pattern property `key: value`, the `value` may itself be a
/// destructure pattern, a default, or an identifier.
fn handle_value_pattern(
    value_pat: &str,
    member: &str,
    inserts: &mut Vec<(String, String)>,
    paths: &mut Vec<(String, String)>,
    derived_array_counter: &std::sync::atomic::AtomicUsize,
) {
    let value_pat = value_pat.trim();
    if value_pat.starts_with('{') || value_pat.starts_with('[') {
        // Could have a trailing default after the matching bracket.
        let (sub_pattern, default) = split_pattern_default(value_pat);
        let effective = if let Some(d) = default {
            build_fallback_text(member, d)
        } else {
            member.to_string()
        };
        extract_paths_walk(
            sub_pattern,
            &effective,
            inserts,
            paths,
            derived_array_counter,
        );
    } else if let Some(eq) = find_top_level_equals(value_pat) {
        // `key: name = default`
        let name = value_pat[..eq].trim();
        let default = value_pat[eq + 1..].trim();
        let fallback = build_fallback_text(member, default);
        paths.push((name.to_string(), fallback));
    } else {
        // `key: value` — value is an identifier
        paths.push((value_pat.to_string(), member.to_string()));
    }
}

/// Split a pattern with a possible default after the matching outer bracket.
/// `{a, b} = {}` → (`{a, b}`, Some(`{}`)).
fn split_pattern_default(pattern: &str) -> (&str, Option<&str>) {
    let pattern = pattern.trim();
    if pattern.is_empty() {
        return (pattern, None);
    }
    let open = pattern.as_bytes()[0];
    let close = match open {
        b'{' => b'}',
        b'[' => b']',
        _ => return (pattern, None),
    };
    let bytes = pattern.as_bytes();
    let mut depth = 0i32;
    for i in 0..bytes.len() {
        let c = bytes[i];
        if c == open {
            depth += 1;
        } else if c == close {
            depth -= 1;
            if depth == 0 {
                let after = pattern[i + 1..].trim_start();
                if let Some(rest) = after.strip_prefix('=') {
                    let default = rest.trim();
                    return (&pattern[..=i], Some(default));
                }
                return (pattern, None);
            }
        }
    }
    (pattern, None)
}

/// Build `(member ?? default)` text, mirroring `build_fallback`.
fn build_fallback_text(member: &str, default: &str) -> String {
    format!("({} ?? {})", member, default)
}

/// Build a member-access expression: `obj.key` or `obj["complex"]` for
/// non-identifier keys.
fn make_member(obj: &str, key: &str) -> String {
    let key = key.trim();
    if key.starts_with('[') && key.ends_with(']') {
        // Computed: `[expr]` → `obj[expr]`
        format!("{}{}", obj, key)
    } else if is_plain_identifier(key) {
        format!("{}.{}", obj, key)
    } else {
        // Literal string key etc. — leave bracketed.
        format!("{}[{}]", obj, key)
    }
}

/// Split a string `s` at top-level occurrences of `delim`, respecting
/// nesting (`{}[]()`), strings, and template literals.
fn split_top_level(s: &str, delim: u8) -> Vec<String> {
    let mut out = Vec::new();
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut start = 0usize;
    let mut i = 0usize;
    let len = bytes.len();
    while i < len {
        let c = bytes[i];
        if c == b'"' || c == b'\'' || c == b'`' {
            // Skip string literal
            let quote = c;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }
        match c {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            _ => {}
        }
        if c == delim && depth == 0 {
            out.push(s[start..i].to_string());
            start = i + 1;
        }
        i += 1;
    }
    out.push(s[start..].to_string());
    out
}

/// Find a top-level `:` in `prop`, respecting nesting and strings.
fn find_top_level_colon(prop: &str) -> Option<usize> {
    let bytes = prop.as_bytes();
    let mut depth = 0i32;
    let mut i = 0usize;
    let len = bytes.len();
    while i < len {
        let c = bytes[i];
        if c == b'"' || c == b'\'' || c == b'`' {
            let quote = c;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }
        match c {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b':' if depth == 0 => return Some(i),
            _ => {}
        }
        i += 1;
    }
    None
}

/// Find a top-level `=` (default-value position) in `prop`, distinguishing
/// from `==`, `===`, `=>`, and shorthand member operators.
fn find_top_level_equals(prop: &str) -> Option<usize> {
    let bytes = prop.as_bytes();
    let mut depth = 0i32;
    let mut i = 0usize;
    let len = bytes.len();
    while i < len {
        let c = bytes[i];
        if c == b'"' || c == b'\'' || c == b'`' {
            let quote = c;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }
        match c {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied();
                if next == Some(b'=') || next == Some(b'>') {
                    i += 2;
                    continue;
                }
                // Reject `>=`, `<=`, `!=`, etc.
                let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
                if matches!(prev, Some(b'!' | b'<' | b'>' | b'=')) {
                    i += 1;
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Check if `s` is a plain identifier (letters/digits/`_`/`$`, starts with
/// non-digit).
fn is_plain_identifier(s: &str) -> bool {
    let s = s.trim();
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    if !(first.is_ascii_alphabetic() || first == '_' || first == '$') {
        return false;
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

/// True if [start, end) is a word — i.e., no identifier char immediately
/// before `start` or after `end - 1`.
fn is_word_boundary(bytes: &[u8], start: usize, end: usize) -> bool {
    let before = if start == 0 {
        None
    } else {
        Some(bytes[start - 1])
    };
    let after = bytes.get(end).copied();
    let before_ok = match before {
        Some(b) => !(b.is_ascii_alphanumeric() || b == b'_' || b == b'$'),
        None => true,
    };
    let after_ok = match after {
        Some(b) => !(b.is_ascii_alphanumeric() || b == b'_' || b == b'$'),
        None => true,
    };
    before_ok && after_ok
}

/// Find a matching bracket. `start` is the byte position immediately after
/// the opening bracket. Returns the byte position of the matching close
/// bracket. Respects strings/templates and nesting of `{}[]()`.
fn find_matching_bracket(bytes: &[u8], start: usize, open: u8, close: u8) -> Option<usize> {
    let mut depth: i32 = 1;
    let mut i = start;
    let len = bytes.len();
    while i < len {
        let c = bytes[i];
        if c == b'"' || c == b'\'' || c == b'`' {
            let quote = c;
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }
        if c == open {
            depth += 1;
        } else if c == close {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
        i += 1;
    }
    None
}

/// Strip a top-level `await` keyword from the start of an expression string.
///
/// Mirrors upstream's `unthunk` collapse of `async () => await x` into
/// `async () => x` when `x` has no nested await. We use this server-side
/// when emitting `await $.async_derived(...)` around the visited value.
fn strip_top_level_await_from_expr(expr: &str) -> String {
    let trimmed = expr.trim();
    if let Some(rest) = trimmed.strip_prefix("await ") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await\n") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await\t") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await(") {
        format!("({}", rest)
    } else {
        trimmed.to_string()
    }
}

/// If `expr` is a simple no-argument call to a bare identifier (e.g. `foo()`),
/// return the identifier (so it can be passed as a function reference to
/// `$.derived`, mirroring upstream `unthunk`). Otherwise return `None`.
fn unthunk_no_arg_ident_call(expr: &str) -> Option<&str> {
    let trimmed = expr.trim();
    let inner = trimmed.strip_suffix(')')?;
    let (id_part, after) = inner.split_once('(')?;
    if !after.trim().is_empty() {
        return None;
    }
    let id_part = id_part.trim_end();
    // `id_part` must be a plain identifier (no `.`, `?`, `[`, etc.) and
    // must contain only identifier chars. Empty `foo  ()` is fine.
    let id_trimmed = id_part.trim_start();
    if id_trimmed.is_empty() {
        return None;
    }
    if !id_trimmed
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
    {
        return None;
    }
    if !id_trimmed
        .chars()
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
    {
        return None;
    }
    // Reject reserved words that can't be used as identifiers in this slot.
    if matches!(
        id_trimmed,
        "true" | "false" | "null" | "undefined" | "void" | "new" | "this"
    ) {
        return None;
    }
    Some(id_trimmed)
}

fn transform_rune_call_multiline(script: &str, prefix: &str) -> String {
    // First, find function scopes where the rune name is shadowed by a parameter.
    // E.g., `function bar($derived, $effect) { ... }` shadows `$derived` inside bar.
    let rune_name = &prefix[..prefix.len() - 1]; // e.g., "$derived(" -> "$derived"
    let shadow_ranges = find_rune_shadow_ranges(script, rune_name);

    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    let is_derived_by = prefix == "$derived.by(";
    let is_derived = prefix == "$derived(";

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                // Check if this occurrence is inside a shadowed scope
                let is_shadowed = shadow_ranges
                    .iter()
                    .any(|&(start, end)| i >= start && i < end);

                if is_shadowed {
                    // Don't transform - keep the original text
                    result.push_str(&potential);
                    i += prefix_len;
                    continue;
                }

                let mut depth = 1;
                let start = i + prefix_len;
                let mut end = start;
                let mut in_string = false;
                let mut string_char = ' ';

                while end < chars.len() && depth > 0 {
                    let c = chars[end];

                    if (c == '"' || c == '\'' || c == '`') && (end == 0 || chars[end - 1] != '\\') {
                        if !in_string {
                            in_string = true;
                            string_char = c;
                        } else if c == string_char {
                            in_string = false;
                        }
                    }

                    if !in_string {
                        match c {
                            '(' => depth += 1,
                            ')' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        end += 1;
                    }
                }

                let inner: String = chars[start..end].iter().collect();
                let trimmed_inner = inner.trim();

                if trimmed_inner.is_empty() {
                    // Svelte 5.52+: empty `$derived()` is a no-op and shouldn't
                    // appear in real code; treat it as `$.derived(() => void 0)`
                    // for `$derived` and `$.derived(void 0)` for `$derived.by`.
                    if is_derived {
                        result.push_str("$.derived(() => void 0)");
                    } else if is_derived_by {
                        result.push_str("$.derived(void 0)");
                    } else {
                        result.push_str("void 0");
                    }
                } else if is_derived_by {
                    // Svelte 5.52+: `$derived.by(fn)` becomes `$.derived(fn)`
                    // so the derived can be re-run on every render (the server
                    // runtime calls the function each time the derived is read).
                    let cleaned = inner.trim_end().trim_end_matches(',').trim_end();
                    result.push_str("$.derived(");
                    result.push_str(cleaned);
                    result.push(')');
                } else if is_derived {
                    // Svelte 5.52+: `$derived(expr)` becomes
                    // `$.derived(() => expr)` so the derived re-runs each time
                    // a render reads it. An object-literal expression must be
                    // wrapped in parens (`() => ({ ... })`) — otherwise the
                    // braces parse as a function body.
                    //
                    // Mirror upstream's `unthunk` optimization: a bare
                    // `$derived(foo())` (no-arg call to a simple identifier)
                    // collapses to `$.derived(foo)` rather than
                    // `$.derived(() => foo())`.
                    //
                    // For async derived (top-level `await` in expression), the
                    // upstream emits `await $.async_derived(b.thunk(value, true))`
                    // — i.e. `await $.async_derived(async () => value)` with
                    // an unthunk pass that collapses `async () => await x`
                    // to `async () => x` when `x` has no nested await.
                    let cleaned = inner.trim_end().trim_end_matches(',').trim_end();
                    if super::helpers::expr_contains_await(cleaned) {
                        // Async derived emission. Strip the top-level `await`
                        // (the unthunk pass), then check whether the remaining
                        // expression has nested awaits — if so we still need
                        // an `async` arrow.
                        let stripped = strip_top_level_await_from_expr(cleaned);
                        let nested_await = super::helpers::expr_contains_await(&stripped);
                        let needs_paren = stripped.trim_start().starts_with('{');
                        if !nested_await
                            && !needs_paren
                            && let Some(ident) = unthunk_no_arg_ident_call(&stripped)
                        {
                            // `await $.async_derived(() => getFoo())` collapses to
                            // `await $.async_derived(getFoo)` — the bare function
                            // reference (upstream's `b.thunk(value, true)` →
                            // unthunk pass).
                            result.push_str("await $.async_derived(");
                            result.push_str(ident);
                            result.push(')');
                        } else {
                            if nested_await {
                                result.push_str("await $.async_derived(async () => ");
                            } else {
                                result.push_str("await $.async_derived(() => ");
                            }
                            if needs_paren {
                                result.push('(');
                                result.push_str(&stripped);
                                result.push(')');
                            } else {
                                result.push_str(&stripped);
                            }
                            result.push(')');
                        }
                    } else if let Some(ident) = unthunk_no_arg_ident_call(cleaned) {
                        result.push_str("$.derived(");
                        result.push_str(ident);
                        result.push(')');
                    } else {
                        let needs_paren = cleaned.trim_start().starts_with('{');
                        result.push_str("$.derived(() => ");
                        if needs_paren {
                            result.push('(');
                            result.push_str(cleaned);
                            result.push(')');
                        } else {
                            result.push_str(cleaned);
                        }
                        result.push(')');
                    }
                } else {
                    // $state and friends keep their previous semantics: strip
                    // the rune wrapper, preserve the raw expression.
                    let cleaned = inner.trim_end().trim_end_matches(',').trim_end();
                    result.push_str(cleaned);
                }

                i = end + 1;
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Find byte ranges in the script where a rune name (e.g., `$derived`) is shadowed
/// by a function parameter. Returns a list of (start, end) char index ranges.
fn find_rune_shadow_ranges(script: &str, rune_name: &str) -> Vec<(usize, usize)> {
    let mut ranges = Vec::new();
    let chars: Vec<char> = script.chars().collect();
    let len = chars.len();
    let fn_keyword = "function";
    let fn_len = fn_keyword.len();
    let arrow_params_pattern = rune_name;

    let mut i = 0;
    while i < len {
        // Skip strings
        if chars[i] == '"' || chars[i] == '\'' || chars[i] == '`' {
            let quote = chars[i];
            i += 1;
            while i < len && !(chars[i] == quote && (i == 0 || chars[i - 1] != '\\')) {
                i += 1;
            }
            if i < len {
                i += 1;
            }
            continue;
        }

        // Check for `function` keyword
        if i + fn_len <= len {
            let word: String = chars[i..i + fn_len].iter().collect();
            if word == fn_keyword {
                // Make sure it's not part of a larger identifier
                let before_ok = i == 0
                    || !chars[i - 1].is_alphanumeric()
                        && chars[i - 1] != '_'
                        && chars[i - 1] != '$';
                let after_ok = i + fn_len >= len
                    || !chars[i + fn_len].is_alphanumeric()
                        && chars[i + fn_len] != '_'
                        && chars[i + fn_len] != '$';
                if before_ok && after_ok {
                    // Find the opening parenthesis for parameters
                    let mut j = i + fn_len;
                    // Skip optional function name
                    while j < len && chars[j].is_whitespace() {
                        j += 1;
                    }
                    // Skip function name if present (could be identifier or *)
                    if j < len
                        && (chars[j].is_alphanumeric()
                            || chars[j] == '_'
                            || chars[j] == '$'
                            || chars[j] == '*')
                    {
                        while j < len && chars[j] != '(' {
                            j += 1;
                        }
                    }
                    if j < len && chars[j] == '(' {
                        // Extract parameter list
                        let param_start = j + 1;
                        let mut depth = 1;
                        let mut param_end = param_start;
                        while param_end < len && depth > 0 {
                            match chars[param_end] {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                            if depth > 0 {
                                param_end += 1;
                            }
                        }
                        let params: String = chars[param_start..param_end].iter().collect();
                        // Check if any parameter matches the rune name
                        if params_contain_name(&params, arrow_params_pattern) {
                            // Find the function body (opening brace)
                            let mut k = param_end + 1;
                            while k < len && chars[k].is_whitespace() {
                                k += 1;
                            }
                            if k < len && chars[k] == '{' {
                                // Find matching closing brace
                                let body_start = k;
                                let mut brace_depth = 1;
                                let mut body_end = k + 1;
                                let mut in_str = false;
                                let mut str_char = ' ';
                                while body_end < len && brace_depth > 0 {
                                    let c = chars[body_end];
                                    if (c == '"' || c == '\'' || c == '`')
                                        && (body_end == 0 || chars[body_end - 1] != '\\')
                                    {
                                        if !in_str {
                                            in_str = true;
                                            str_char = c;
                                        } else if c == str_char {
                                            in_str = false;
                                        }
                                    }
                                    if !in_str {
                                        match c {
                                            '{' => brace_depth += 1,
                                            '}' => brace_depth -= 1,
                                            _ => {}
                                        }
                                    }
                                    body_end += 1;
                                }
                                ranges.push((body_start, body_end));
                            }
                        }
                    }
                }
            }
        }

        // Also check for arrow functions: (params) => { ... }  or ($derived) => expr
        // Pattern: ( ... rune_name ... ) =>
        if chars[i] == '(' {
            let paren_start = i + 1;
            let mut depth = 1;
            let mut paren_end = paren_start;
            let mut in_str = false;
            let mut str_char = ' ';
            while paren_end < len && depth > 0 {
                let c = chars[paren_end];
                if (c == '"' || c == '\'' || c == '`')
                    && (paren_end == 0 || chars[paren_end - 1] != '\\')
                {
                    if !in_str {
                        in_str = true;
                        str_char = c;
                    } else if c == str_char {
                        in_str = false;
                    }
                }
                if !in_str {
                    match c {
                        '(' => depth += 1,
                        ')' => depth -= 1,
                        _ => {}
                    }
                }
                if depth > 0 {
                    paren_end += 1;
                }
            }
            let params: String = chars[paren_start..paren_end].iter().collect();
            if params_contain_name(&params, arrow_params_pattern) {
                // Check if followed by =>
                let mut k = paren_end + 1;
                while k < len && chars[k].is_whitespace() {
                    k += 1;
                }
                if k + 1 < len && chars[k] == '=' && chars[k + 1] == '>' {
                    // Arrow function - find body
                    let mut body_k = k + 2;
                    while body_k < len && chars[body_k].is_whitespace() {
                        body_k += 1;
                    }
                    if body_k < len && chars[body_k] == '{' {
                        let body_start = body_k;
                        let mut brace_depth = 1;
                        let mut body_end = body_k + 1;
                        let mut in_str2 = false;
                        let mut str_char2 = ' ';
                        while body_end < len && brace_depth > 0 {
                            let c = chars[body_end];
                            if (c == '"' || c == '\'' || c == '`')
                                && (body_end == 0 || chars[body_end - 1] != '\\')
                            {
                                if !in_str2 {
                                    in_str2 = true;
                                    str_char2 = c;
                                } else if c == str_char2 {
                                    in_str2 = false;
                                }
                            }
                            if !in_str2 {
                                match c {
                                    '{' => brace_depth += 1,
                                    '}' => brace_depth -= 1,
                                    _ => {}
                                }
                            }
                            body_end += 1;
                        }
                        ranges.push((body_start, body_end));
                    }
                }
            }
        }

        i += 1;
    }

    ranges
}

/// Check if a parameter list string contains a specific name as a standalone parameter.
fn params_contain_name(params: &str, name: &str) -> bool {
    // Split by comma and check each parameter
    for param in params.split(',') {
        let trimmed = param.trim();
        // Handle destructuring, defaults, rest params
        let ident = trimmed
            .trim_start_matches("...")
            .split('=')
            .next()
            .unwrap_or("")
            .split(':')
            .next()
            .unwrap_or("")
            .trim();
        if ident == name {
            return true;
        }
    }
    false
}

/// Fix missing semicolons on multi-line let/const/var declarations.
///
/// When a declaration like `let b = (() => { return a; })()` spans multiple lines,
/// the last line `})()` may lack a trailing semicolon. This function detects such
/// patterns and adds the missing semicolon.
fn fix_multiline_declaration_semicolons(script: &str) -> String {
    let lines: Vec<&str> = script.lines().collect();
    let mut result_lines: Vec<String> = Vec::with_capacity(lines.len());
    let mut in_multiline_decl = false;
    let mut decl_bracket_depth: i32 = 0;

    for &line in &lines {
        let trimmed = line.trim();

        if !in_multiline_decl {
            if (trimmed.starts_with("let ")
                || trimmed.starts_with("const ")
                || trimmed.starts_with("var "))
                && !trimmed.ends_with(';')
            {
                // Count brackets on this line
                let depth = count_bracket_depth(trimmed);
                if depth > 0 {
                    in_multiline_decl = true;
                    decl_bracket_depth = depth;
                }
            }
            result_lines.push(line.to_string());
        } else {
            decl_bracket_depth += count_bracket_depth(trimmed);
            if decl_bracket_depth <= 0 {
                if trimmed.ends_with(',') {
                    // Another declarator follows
                    decl_bracket_depth = 0;
                    result_lines.push(line.to_string());
                } else if line_ends_with_continuation(trimmed) {
                    // The closing bracket sits on the same line as a
                    // continuation operator — most commonly an arrow function
                    // header like `(args) =>` whose body spans the following
                    // lines. The statement isn't really over yet, so don't
                    // emit a terminator; keep tracking until we hit a real
                    // statement end. (Without this, the bracket-depth heuristic
                    // turns `(args) =>` into `(args) =>;` and severs the
                    // arrow function from its body — baseballyama/rsvelte#141.)
                    decl_bracket_depth = 0;
                    result_lines.push(line.to_string());
                } else {
                    in_multiline_decl = false;
                    // End of multi-line declaration: ensure semicolon
                    if !trimmed.ends_with(';') && !trimmed.is_empty() {
                        let indent = &line[..line.len() - line.trim_start().len()];
                        result_lines.push(format!("{}{};", indent, trimmed));
                    } else {
                        result_lines.push(line.to_string());
                    }
                }
            } else {
                result_lines.push(line.to_string());
            }
        }
    }

    result_lines.join("\n")
}

/// Does this trimmed line end with an operator/keyword that requires the next
/// line to continue the same expression? Used by
/// `fix_multiline_declaration_semicolons` to avoid terminating a declaration on
/// e.g. `(args) =>` where the arrow body is on the next line.
fn line_ends_with_continuation(trimmed: &str) -> bool {
    if let Some(rest) = trimmed.strip_suffix("=>") {
        // Make sure `=>` is its own token (not the tail of a `===>` typo or
        // similar) by checking the preceding char is whitespace or `)`.
        return rest.ends_with(')') || rest.ends_with(' ') || rest.is_empty();
    }
    // Other obvious mid-expression operators that demand a following operand.
    let last = trimmed.chars().last().unwrap_or(' ');
    matches!(
        last,
        '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^' | '<' | '>' | '=' | '?' | '.' | '!'
    ) && !trimmed.ends_with("++")
        && !trimmed.ends_with("--")
}

/// Update brace-depth for a class member body as `line` is consumed.
///
/// `depth` tracks curly-brace nesting for the method body; `paren` is a
/// persistent paren-nesting counter carried across lines; `param_brace` tracks
/// curly braces that were opened *inside* parens (e.g. the `{` of a destructure
/// parameter `constructor({ a, b }) {`). Together they correctly handle the
/// multi-line-param case:
///
/// ```text
/// constructor({          // paren=1, { at paren>0 → param_brace=1
///   svelte_version,      // no change
/// }) {                   // ) → paren=0, then } at paren=0 but param_brace=1
///                        //   → this } closes a param-level brace, not the body
///                        //   → param_brace=0; then { at paren=0, param_brace=0
///                        //   → body opens → depth=1
///   this.x = 1;
/// }                      // depth 1→0 → closed=true
/// ```
///
/// Without the `param_brace` counter the `)` in `}) {` moves `paren` from 1 to 0,
/// then the `}` (at `paren=0`) is wrongly counted as closing the body (depth −1),
/// and the body-opening `{` merely brings depth back to 0 — leaving the scanner
/// stuck at depth=0 forever and swallowing all subsequent class methods.
///
/// Returns `true` if `depth` reached 0 on this line (the member body closed).
/// (issue #648 + multi-line-param fix)
fn update_member_brace_depth(
    line: &str,
    depth: &mut i32,
    paren: &mut i32,
    param_brace: &mut i32,
) -> bool {
    let mut in_str = false;
    let mut str_ch = ' ';
    let mut closed = false;
    for ch in line.chars() {
        if in_str {
            if ch == str_ch {
                in_str = false;
            }
            continue;
        }
        match ch {
            '\'' | '"' | '`' => {
                in_str = true;
                str_ch = ch;
            }
            '(' | '[' => *paren += 1,
            ')' | ']' => *paren -= 1,
            '{' if *paren > 0 => *param_brace += 1,
            '}' if *paren > 0 => *param_brace -= 1,
            '{' if *paren == 0 => *depth += 1,
            '}' if *paren == 0 => {
                if *param_brace > 0 {
                    // This `}` closes a brace that was opened inside a param list
                    // (e.g. the `{...}` destructure in `constructor({a,b}) {`).
                    // It balances against `param_brace`, NOT the method body.
                    *param_brace -= 1;
                } else {
                    *depth -= 1;
                    if *depth == 0 {
                        closed = true;
                    }
                }
            }
            _ => {}
        }
    }
    closed
}

fn count_bracket_depth(line: &str) -> i32 {
    let mut depth: i32 = 0;
    let mut in_str = false;
    let mut str_ch = ' ';
    for ch in line.chars() {
        if in_str {
            if ch == str_ch {
                in_str = false;
            }
            continue;
        }
        match ch {
            '\'' | '"' | '`' => {
                in_str = true;
                str_ch = ch;
            }
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            _ => {}
        }
    }
    depth
}

fn add_statement_semicolon(line: &str, next_trimmed: &str) -> String {
    let trimmed = line.trim();

    if trimmed.is_empty() {
        return line.to_string();
    }

    // Strip trailing `;` from lines that are just `};` (block close + empty statement).
    // The official Svelte compiler strips these redundant empty statements.
    // e.g., `$: { ... };` → the closing `};` becomes just `}`
    if trimmed == "};" {
        let indent = &line[..line.len() - line.trim_start().len()];
        return format!("{}}}", indent);
    }

    // Lines that are already terminated or are block delimiters
    if trimmed.ends_with(';')
        || trimmed.ends_with('{')
        || trimmed.ends_with('}')
        || trimmed.ends_with(',')
    {
        return line.to_string();
    }

    // Skip comment lines
    if trimmed.starts_with("//") || trimmed.starts_with("/*") {
        return line.to_string();
    }

    // Skip labels like `$:`
    if trimmed.ends_with(':') {
        return line.to_string();
    }

    // Variable declarations need semicolons when they are complete statements.
    // The server transform copies script content as raw text (after rune transformations),
    // but the original source may lack semicolons. We need to add them to prevent ASI
    // from "consuming" subsequent empty statements (e.g., `;;` from $inspect() removal).
    if trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var ") {
        // Check if the line ends with something that suggests a complete statement.
        // Don't add semicolons to lines that end with continuation characters.
        let last_char = trimmed.chars().last().unwrap_or(' ');
        let is_continuation = matches!(
            last_char,
            '(' | '['
                | '{'
                | '+'
                | '-'
                | '*'
                | '/'
                | '?'
                | ':'
                | '='
                | '&'
                | '|'
                | '>'
                | '^'
                | '~'
                | '!'
                | '%'
                | ','
        );
        // Also check if the NEXT line starts with a continuation operator
        // (e.g., ternary `?`, `:`, `&&`, `||`, `.`, etc.)
        let next_is_continuation = next_trimmed.starts_with('?')
            || next_trimmed.starts_with(':')
            || next_trimmed.starts_with('.')
            || next_trimmed.starts_with("&&")
            || next_trimmed.starts_with("||")
            || next_trimmed.starts_with("??");
        if !is_continuation && !next_is_continuation {
            return format!("{};", line);
        }
    }

    line.to_string()
}

/// Transform class fields with $derived runes for server-side.
pub(crate) fn transform_class_fields_server(script: &str) -> String {
    let script_bytes = script.as_bytes();
    if memmem::find(script_bytes, b"class ").is_none()
        || (memmem::find(script_bytes, b"$derived(").is_none()
            && memmem::find(script_bytes, b"$derived.by(").is_none()
            && memmem::find(script_bytes, b"$state(").is_none()
            && memmem::find(script_bytes, b"$state.raw(").is_none())
    {
        return script.to_string();
    }

    let Some(class_pos) = memmem::find(script_bytes, b"class ") else {
        return script.to_string();
    };

    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    #[derive(Debug, Clone)]
    enum ClassMember {
        Field(String),
        Method(Vec<String>),
        ArrowFn(Vec<String>),
    }

    #[derive(Debug, Clone)]
    struct DerivedField {
        name: String,
        is_private: bool,
        constructor_declared: bool,
    }

    let mut members: Vec<ClassMember> = Vec::new();
    let mut derived_fields: Vec<DerivedField> = Vec::new();
    let mut has_state_fields = false;

    let mut in_block = false;
    let mut block_depth = 0;
    // Persistent paren-nesting counter for the current in-block scan. Carried
    // across lines so that multi-line parameter lists (e.g. `constructor({\n…\n}) {`)
    // are handled correctly: the `{` that opens the method body sits after the `)` that
    // closes the params, and the paren tracker must be at 0 at that point.
    let mut block_paren = 0i32;
    // Persistent "brace opened inside paren" counter. Tracks `{`/`}` at paren>0 so
    // that `}` from a destructure parameter (which appears at paren=0 after `)` closes
    // the param list) is recognised as a param-brace close rather than a body-brace
    // close. See `update_member_brace_depth` for a detailed explanation.
    let mut block_param_brace = 0i32;
    let mut block_lines: Vec<String> = Vec::new();
    let mut block_is_arrow_fn = false;

    // For multiline derived fields: accumulate text until parens balance
    let mut in_derived_field = false;
    let mut derived_accum = String::new();
    let mut derived_paren_depth: i32 = 0;
    let mut derived_field_name = String::new();
    let mut derived_field_is_private = false;
    let mut derived_field_is_by = false;

    // For multiline plain (non-rune) field initializers: accumulate lines until
    // the bracket depth returns to 0. E.g. `bundler = new Bundler({\n  ...\n})`
    // where the `{` is inside the initializer and spans multiple lines.
    let mut in_plain_field = false;
    let mut plain_field_lines: Vec<String> = Vec::new();
    let mut plain_field_depth: i32 = 0;

    let all_lines: Vec<&str> = class_body.lines().collect();

    // Pre-scan user-declared private member names (`#foo = …` / `#foo(…) {`),
    // so a public `$state` / `$derived` field whose deconflicted backing name
    // would collide with one of them is renamed (`deps` → `#_deps` when a
    // `#deps` field already exists). Mirrors the client's `private_ids`
    // deconfliction in `2-analyze` class_body. Without this the backing
    // `#deps` shadows the existing `#deps`, duplicating the get/set accessors
    // and turning `this.#deps = f` into a spurious derived setter call.
    let mut existing_private_names: Vec<String> = Vec::new();
    for raw in &all_lines {
        let t = raw.trim();
        if let Some(rest) = t.strip_prefix('#') {
            let name: String = rest
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                .collect();
            if !name.is_empty() && !existing_private_names.contains(&name) {
                existing_private_names.push(name);
            }
        }
    }
    // Compute a backing private name for a public state/derived field that does
    // not collide with an existing private member (prefix `_` until unique).
    let backing_private = |name: &str| -> String {
        let mut candidate = sanitize_identifier(name);
        while existing_private_names.contains(&candidate) {
            candidate = format!("_{}", candidate);
        }
        format!("#{}", candidate)
    };

    let mut line_idx = 0;

    while line_idx < all_lines.len() {
        let line = all_lines[line_idx];
        let trimmed = line.trim();
        line_idx += 1;

        // Continue accumulating multiline derived field
        if in_derived_field {
            derived_accum.push('\n');
            derived_accum.push_str(trimmed);
            for c in trimmed.chars() {
                match c {
                    '(' | '{' | '[' => derived_paren_depth += 1,
                    ')' | '}' | ']' => derived_paren_depth -= 1,
                    _ => {}
                }
            }
            if derived_paren_depth <= 0 {
                in_derived_field = false;
                // Now process the complete multiline derived field
                let full_text = derived_accum.clone();
                let derived_pattern = if derived_field_is_by {
                    "$derived.by("
                } else {
                    "$derived("
                };
                if let Some(derived_pos) = full_text.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &full_text[value_start..];
                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        let sanitized_name = sanitize_identifier(&derived_field_name);
                        let private_name = if derived_field_is_private {
                            format!("#{}", sanitized_name)
                        } else {
                            backing_private(&derived_field_name)
                        };

                        let value_str = value.trim();
                        let wrapped_value = if value_str.starts_with('{') {
                            format!("({})", value_str)
                        } else {
                            value_str.to_string()
                        };

                        let transformed_line = if derived_field_is_by {
                            format!("{} = $.derived({})", private_name, wrapped_value)
                        } else {
                            format!("{} = $.derived(() => {})", private_name, wrapped_value)
                        };

                        members.push(ClassMember::Field(transformed_line));
                        derived_fields.push(DerivedField {
                            name: derived_field_name.clone(),
                            is_private: derived_field_is_private,
                            constructor_declared: false,
                        });
                    }
                }
            }
            continue;
        }

        // Continue accumulating a multiline plain (non-rune) field initializer.
        // Once the bracket depth returns to 0 the full field text is pushed as a
        // single Field member so the emitter can write it verbatim.
        if in_plain_field {
            plain_field_lines.push(line.to_string());
            for c in trimmed.chars() {
                match c {
                    '(' | '{' | '[' => plain_field_depth += 1,
                    ')' | '}' | ']' => plain_field_depth -= 1,
                    _ => {}
                }
            }
            if plain_field_depth <= 0 {
                in_plain_field = false;
                // Emit the full multi-line field as a single Field entry whose
                // text is the source lines joined. The emitter handles it
                // specially when it sees newlines inside the Field value.
                let field_text = plain_field_lines.join("\n");
                members.push(ClassMember::Field(field_text));
                plain_field_lines.clear();
                plain_field_depth = 0;
            }
            continue;
        }

        if in_block {
            block_lines.push(line.to_string());
            if update_member_brace_depth(
                trimmed,
                &mut block_depth,
                &mut block_paren,
                &mut block_param_brace,
            ) {
                in_block = false;
                block_paren = 0;
                block_param_brace = 0;
                if block_is_arrow_fn {
                    members.push(ClassMember::ArrowFn(block_lines.clone()));
                } else {
                    members.push(ClassMember::Method(block_lines.clone()));
                }
                block_lines.clear();
            }
            continue;
        }

        if trimmed.is_empty() {
            continue;
        }

        // `constructor(` distinguishes the *method* signature from a
        // `constructor = ...` *field* (which would be `constructor` followed by
        // whitespace then `=`, never `constructor(`). The old extra guard
        // `!trimmed.contains('=')` was overly broad — it false-negatives any
        // ctor with a default param (`constructor(options = {}) {`), causing
        // the class body scanner to lose the in-ctor block boundary and emit
        // malformed JS. Real-world surface: layerchart's
        // `states/settings.svelte.js` → SSR output had an orphaned `) {`,
        // rolldown rejected with `Unexpected token` at line 11:1. Restrict to
        // "the first `=` (if any) appears *after* `constructor(`".
        if let Some(ctor_pos) = memmem::find(trimmed.as_bytes(), b"constructor(")
            && trimmed.find('=').is_none_or(|eq_pos| ctor_pos < eq_pos)
        {
            in_block = true;
            block_is_arrow_fn = false;
            block_depth = 0;
            block_paren = 0;
            block_param_brace = 0;
            block_lines.clear();
            block_lines.push(line.to_string());
            if update_member_brace_depth(
                trimmed,
                &mut block_depth,
                &mut block_paren,
                &mut block_param_brace,
            ) {
                in_block = false;
                block_paren = 0;
                block_param_brace = 0;
                members.push(ClassMember::Method(block_lines.clone()));
                block_lines.clear();
            }
            continue;
        }

        let trimmed_bytes = trimmed.as_bytes();
        let is_arrow_fn_start = trimmed.contains('=')
            && memmem::find(trimmed_bytes, b"=>").is_some()
            && trimmed.contains('{')
            && memmem::find(trimmed_bytes, b"$derived").is_none()
            && memmem::find(trimmed_bytes, b"$state").is_none();

        if is_arrow_fn_start {
            in_block = true;
            block_is_arrow_fn = true;
            block_depth = 0;
            block_paren = 0;
            block_param_brace = 0;
            block_lines.clear();
            block_lines.push(line.to_string());
            if update_member_brace_depth(
                trimmed,
                &mut block_depth,
                &mut block_paren,
                &mut block_param_brace,
            ) {
                in_block = false;
                block_paren = 0;
                block_param_brace = 0;
                members.push(ClassMember::ArrowFn(block_lines.clone()));
                block_lines.clear();
            }
            continue;
        }

        // A method signature is `name(params) {` — its first `(` comes before
        // any `=` (a `=` only appears inside the parens as a default parameter,
        // e.g. `getTimeline(opts = {}) {`). A class *field* (`x = …`, including
        // arrow fields `x = () => {` already consumed by `is_arrow_fn_start`
        // above) has its `=` *before* the `(`. The old guard `!contains('=')`
        // was too broad: it false-negatived any method with a default param, so
        // the scanner never entered the method block and mis-parsed a local
        // `const x = $derived(…)` in the body as a private derived class field
        // (`#const_x = $.derived(…)`), emitting invalid JS. Mirror the
        // `constructor(` guard below: method iff `(` precedes the first `=`.
        // (issue #648)
        let is_method_start = trimmed.contains('(')
            && trimmed.contains('{')
            && trimmed
                .find('=')
                .is_none_or(|eq_pos| trimmed.find('(').is_some_and(|p| p < eq_pos))
            && !trimmed.starts_with("//")
            && !trimmed.starts_with("/*");

        if is_method_start {
            in_block = true;
            block_is_arrow_fn = false;
            block_depth = 0;
            block_paren = 0;
            block_param_brace = 0;
            block_lines.clear();
            block_lines.push(line.to_string());
            if update_member_brace_depth(
                trimmed,
                &mut block_depth,
                &mut block_paren,
                &mut block_param_brace,
            ) {
                in_block = false;
                block_paren = 0;
                block_param_brace = 0;
                members.push(ClassMember::Method(block_lines.clone()));
                block_lines.clear();
            }
            continue;
        }

        let is_derived_field = memmem::find(trimmed_bytes, b"= $derived(").is_some()
            || memmem::find(trimmed_bytes, b"=$derived(").is_some()
            || memmem::find(trimmed_bytes, b"= $derived.by(").is_some()
            || memmem::find(trimmed_bytes, b"=$derived.by(").is_some();
        if is_derived_field {
            let is_private = trimmed.starts_with('#');
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].trim().trim_start_matches('#').to_string();

                let (derived_pattern, is_derived_by) =
                    if memmem::find(trimmed_bytes, b"$derived.by(").is_some() {
                        ("$derived.by(", true)
                    } else {
                        ("$derived(", false)
                    };

                if let Some(derived_pos) = memmem::find(trimmed_bytes, derived_pattern.as_bytes()) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        let sanitized_name = sanitize_identifier(&name);
                        let private_name = if is_private {
                            format!("#{}", sanitized_name)
                        } else {
                            backing_private(&name)
                        };

                        let value_str = value.trim();
                        let wrapped_value = if value_str.starts_with('{') {
                            format!("({})", value_str)
                        } else {
                            value_str.to_string()
                        };

                        let transformed_line = if is_derived_by {
                            format!("{} = $.derived({})", private_name, wrapped_value)
                        } else {
                            format!("{} = $.derived(() => {})", private_name, wrapped_value)
                        };

                        members.push(ClassMember::Field(transformed_line));

                        derived_fields.push(DerivedField {
                            name,
                            is_private,
                            constructor_declared: false,
                        });
                        continue;
                    } else {
                        // Multiline derived field - accumulate until parens balance
                        in_derived_field = true;
                        derived_accum = trimmed.to_string();
                        derived_paren_depth = 0;
                        for c in trimmed.chars() {
                            match c {
                                '(' | '{' | '[' => derived_paren_depth += 1,
                                ')' | '}' | ']' => derived_paren_depth -= 1,
                                _ => {}
                            }
                        }
                        derived_field_name = name;
                        derived_field_is_private = is_private;
                        derived_field_is_by = is_derived_by;
                        continue;
                    }
                }
            }
        }

        let is_state_field = memmem::find(trimmed_bytes, b"= $state(").is_some()
            || memmem::find(trimmed_bytes, b"=$state(").is_some()
            || memmem::find(trimmed_bytes, b"= $state.raw(").is_some()
            || memmem::find(trimmed_bytes, b"=$state.raw(").is_some();
        if is_state_field && let Some(eq_pos) = trimmed.find('=') {
            let (state_pattern, state_pos) =
                if let Some(pos) = memmem::find(trimmed_bytes, b"$state.raw(") {
                    ("$state.raw(", pos)
                } else if let Some(pos) = memmem::find(trimmed_bytes, b"$state(") {
                    ("$state(", pos)
                } else {
                    members.push(ClassMember::Field(trimmed.to_string()));
                    continue;
                };
            let field_name = trimmed[..eq_pos].trim();
            let value_start = state_pos + state_pattern.len();
            let after_paren = &trimmed[value_start..];

            if let Some(value_end) = find_matching_paren_server(after_paren) {
                let value = after_paren[..value_end].trim();
                has_state_fields = true;
                if value.is_empty() {
                    members.push(ClassMember::Field(field_name.to_string()));
                } else {
                    members.push(ClassMember::Field(format!("{} = {}", field_name, value)));
                }
                continue;
            }
        }

        // Detect multi-line plain (non-rune) field initializers.
        // If the trimmed line has unbalanced brackets/parens it spans multiple
        // lines (e.g. `bundler = new Bundler({\n  ...\n})`). Accumulate until
        // the depth returns to 0 so the full initializer is emitted verbatim
        // instead of just the first line with a spurious `;` appended.
        let mut field_bracket_depth: i32 = 0;
        for c in trimmed.chars() {
            match c {
                '(' | '{' | '[' => field_bracket_depth += 1,
                ')' | '}' | ']' => field_bracket_depth -= 1,
                _ => {}
            }
        }
        if field_bracket_depth > 0 {
            in_plain_field = true;
            plain_field_lines.clear();
            plain_field_lines.push(line.to_string());
            plain_field_depth = field_bracket_depth;
        } else {
            members.push(ClassMember::Field(trimmed.to_string()));
        }
    }

    // Scan constructor members for $derived/$state assignments
    for member in &mut members {
        if let ClassMember::Method(lines) = member
            && lines
                .first()
                .is_some_and(|l| memmem::find(l.trim().as_bytes(), b"constructor(").is_some())
        {
            let mut new_lines: Vec<String> = Vec::new();
            for line in lines.iter() {
                let trimmed = line.trim();
                let tb = trimmed.as_bytes();
                // Preserve original indentation prefix
                let indent_prefix: String =
                    line.chars().take_while(|c| c.is_whitespace()).collect();

                if trimmed.starts_with("this.")
                    && (memmem::find(tb, b"= $derived(").is_some()
                        || memmem::find(tb, b"=$derived(").is_some()
                        || memmem::find(tb, b"= $derived.by(").is_some()
                        || memmem::find(tb, b"=$derived.by(").is_some())
                    && let Some(eq_pos) = trimmed.find('=')
                {
                    let lhs = trimmed[5..eq_pos].trim();
                    let is_private = lhs.starts_with('#');
                    let name = lhs.trim_start_matches('#').to_string();

                    let (derived_pattern, is_derived_by) =
                        if memmem::find(tb, b"$derived.by(").is_some() {
                            ("$derived.by(", true)
                        } else {
                            ("$derived(", false)
                        };

                    if let Some(derived_pos) = memmem::find(tb, derived_pattern.as_bytes()) {
                        let value_start = derived_pos + derived_pattern.len();
                        let after_paren = &trimmed[value_start..];

                        if let Some(value_end) = find_matching_paren_server(after_paren) {
                            let value = after_paren[..value_end].to_string();
                            let sanitized = sanitize_identifier(&name);
                            let private_ref = if is_private {
                                format!("#{}", sanitized)
                            } else {
                                backing_private(&name)
                            };

                            let value_str = value.trim();
                            let wrapped_value = if value_str.starts_with('{') {
                                format!("({})", value_str)
                            } else {
                                value_str.to_string()
                            };

                            let rhs = if is_derived_by {
                                format!("$.derived({})", wrapped_value)
                            } else {
                                format!("$.derived(() => {})", wrapped_value)
                            };

                            new_lines
                                .push(format!("{}this.{} = {};", indent_prefix, private_ref, rhs));

                            derived_fields.push(DerivedField {
                                name,
                                is_private,
                                constructor_declared: true,
                            });
                            continue;
                        }
                    }
                }

                if trimmed.starts_with("this.")
                    && (memmem::find(tb, b"= $state(").is_some()
                        || memmem::find(tb, b"=$state(").is_some()
                        || memmem::find(tb, b"= $state.raw(").is_some()
                        || memmem::find(tb, b"=$state.raw(").is_some())
                    && let Some(eq_pos) = trimmed.find('=')
                {
                    let lhs = trimmed[5..eq_pos].trim();

                    let (state_pattern, state_pos) =
                        if let Some(pos) = memmem::find(tb, b"$state.raw(") {
                            ("$state.raw(", pos)
                        } else if let Some(pos) = memmem::find(tb, b"$state(") {
                            ("$state(", pos)
                        } else {
                            new_lines.push(line.to_string());
                            continue;
                        };

                    let value_start = state_pos + state_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].trim();
                        has_state_fields = true;

                        if value.is_empty() {
                            new_lines.push(format!("{}this.{} = void 0;", indent_prefix, lhs));
                        } else {
                            new_lines.push(format!("{}this.{} = {};", indent_prefix, lhs, value));
                        }
                        continue;
                    }
                }

                new_lines.push(line.to_string());
            }
            *lines = new_lines;
        }
    }

    let derived_private_names: Vec<String> = derived_fields
        .iter()
        .map(|f| {
            if f.is_private {
                format!("#{}", sanitize_identifier(&f.name))
            } else {
                backing_private(&f.name)
            }
        })
        .collect();

    if derived_fields.is_empty() && !has_state_fields {
        return script.to_string();
    }

    let mut new_class_body = String::new();

    for field in derived_fields
        .iter()
        .filter(|f| f.constructor_declared && !f.is_private)
    {
        let private_name = backing_private(&field.name);

        let _ = writeln!(new_class_body, "\t\t{};", private_name);
        new_class_body.push('\n');
        let _ = writeln!(
            new_class_body,
            "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}",
            field.name, private_name
        );
        new_class_body.push('\n');
        let _ = writeln!(
            new_class_body,
            "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}",
            field.name, private_name
        );
    }

    for member in &members {
        match member {
            ClassMember::Field(line) => {
                // Skip fields that have been converted to constructor-declared derived fields
                // e.g., `product;` should be skipped when `this.product = $derived(...)` was found
                let field_name = line
                    .trim()
                    .trim_end_matches(';')
                    .trim_end_matches(':')
                    .split_whitespace()
                    .next()
                    .unwrap_or("");
                let is_constructor_declared = derived_fields
                    .iter()
                    .any(|f| f.constructor_declared && !f.is_private && f.name == field_name);
                if is_constructor_declared {
                    // This field is now represented by #name + getter + setter
                    // generated above, so skip the original field declaration
                    continue;
                }

                // Transform private derived accesses in field values
                // (e.g., this.#derived inside a $.derived() body should become this.#derived())
                let line = transform_private_derived_accesses_server(line, &derived_private_names);
                // Add semicolon if not already present (class fields need semicolons)
                let line_with_semi = if line.ends_with(';') || line.ends_with('}') {
                    line.to_string()
                } else {
                    format!("{};", line)
                };
                let _ = writeln!(new_class_body, "\t\t{}", line_with_semi);
                for field in derived_fields
                    .iter()
                    .filter(|f| !f.constructor_declared && !f.is_private)
                {
                    let private_name = backing_private(&field.name);
                    // Check exact match: the line starts with the private name and the
                    // next character is not an identifier char (prevents #on_class matching #on_class_private)
                    let is_exact_match = line.starts_with(&private_name)
                        && !line[private_name.len()..]
                            .chars()
                            .next()
                            .is_some_and(|c| c.is_alphanumeric() || c == '_');
                    if is_exact_match {
                        new_class_body.push('\n');
                        let _ = writeln!(
                            new_class_body,
                            "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}",
                            field.name, private_name
                        );
                        new_class_body.push('\n');
                        let _ = writeln!(
                            new_class_body,
                            "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}",
                            field.name, private_name
                        );
                    }
                }
            }
            ClassMember::Method(lines) => {
                let is_constructor = lines
                    .first()
                    .is_some_and(|l| memmem::find(l.trim().as_bytes(), b"constructor(").is_some());

                let method_text = lines.join("\n");
                let mut transformed =
                    transform_private_derived_accesses_server(&method_text, &derived_private_names);

                // In constructors, convert assignments to derived private fields:
                // `this.#field = value` → `this.#field(value)`
                // This only applies when the value is NOT a $.derived() call
                // (those are already handled by the constructor scanning above)
                if is_constructor && !derived_private_names.is_empty() {
                    for private_name in &derived_private_names {
                        let assign_pattern = format!("this.{} = ", private_name);
                        let mut new_transformed = String::new();
                        let mut remaining = transformed.as_str();

                        while let Some(pos) = remaining.find(&assign_pattern) {
                            new_transformed.push_str(&remaining[..pos]);
                            let after_assign = &remaining[pos + assign_pattern.len()..];

                            // Check if the value is a $.derived() call - if so, leave as-is
                            let value_trimmed = after_assign.trim_start();
                            if value_trimmed.starts_with("$.derived(") {
                                new_transformed.push_str(&assign_pattern);
                                remaining = after_assign;
                                continue;
                            }

                            // Find the end of the value (semicolon at the same nesting level)
                            let mut depth = 0;
                            let mut value_end = None;
                            for (i, c) in after_assign.char_indices() {
                                match c {
                                    '(' | '{' | '[' => depth += 1,
                                    ')' | '}' | ']' => depth -= 1,
                                    ';' if depth == 0 => {
                                        value_end = Some(i);
                                        break;
                                    }
                                    _ => {}
                                }
                            }

                            if let Some(end) = value_end {
                                let value = after_assign[..end].trim();
                                let _ =
                                    write!(new_transformed, "this.{}({});", private_name, value);
                                remaining = &after_assign[end + 1..];
                            } else {
                                // No semicolon found, leave as-is
                                new_transformed.push_str(&assign_pattern);
                                remaining = after_assign;
                            }
                        }

                        new_transformed.push_str(remaining);
                        transformed = new_transformed;
                    }
                }

                new_class_body.push('\n');
                new_class_body.push_str(&transformed);
                new_class_body.push('\n');
            }
            ClassMember::ArrowFn(lines) => {
                new_class_body.push('\n');
                for line in lines {
                    new_class_body.push_str(line);
                    new_class_body.push('\n');
                }
            }
        }
    }

    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..];

    let after_class_transformed = transform_class_fields_server(after_class_body);

    let result = format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_transformed
    );

    result
}

fn transform_private_derived_accesses_server(
    code: &str,
    derived_private_names: &[String],
) -> String {
    if derived_private_names.is_empty() {
        return code.to_string();
    }

    // Sort by length descending to match longer names first (e.g., #derivedBy before #derived)
    let mut sorted_names: Vec<&String> = derived_private_names.iter().collect();
    sorted_names.sort_by_key(|b| std::cmp::Reverse(b.len()));

    let mut result = code.to_string();

    for private_name in &sorted_names {
        let search_pattern = format!(".{}", private_name);
        let mut new_result = String::new();
        let mut remaining = result.as_str();

        while let Some(pos) = remaining.find(&search_pattern) {
            new_result.push_str(&remaining[..pos]);

            let after_match = &remaining[pos + search_pattern.len()..];

            // Check if the next character is an identifier character - if so, this is
            // a longer name (e.g., #derivedBy when we're looking for #derived) and we
            // should NOT transform it
            let next_char = after_match.chars().next();
            let is_partial_match = next_char.is_some_and(|c| c.is_alphanumeric() || c == '_');

            if is_partial_match {
                // Not a complete match, skip
                new_result.push_str(&search_pattern);
                remaining = after_match;
                continue;
            }

            let next_non_ws = after_match.chars().find(|c| !c.is_whitespace());
            let is_already_call = next_non_ws == Some('(');

            let is_assignment = {
                let trimmed_after = after_match.trim_start();
                trimmed_after.starts_with('=') && !trimmed_after.starts_with("==")
            };

            if is_already_call || is_assignment {
                new_result.push_str(&search_pattern);
            } else {
                new_result.push_str(&search_pattern);
                new_result.push_str("()");
            }

            remaining = after_match;
        }

        new_result.push_str(remaining);
        result = new_result;
    }

    result
}

fn find_matching_paren_server(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' | '{' | '[' => depth += 1,
            ')' | '}' | ']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Scan a char slice starting just after an opening `(` and return the index
/// of the matching `)`. Skips string literals, template literals, and
/// `//` / `/* ... */` comments so parens or quotes inside them (e.g.
/// `// a) immediately…` or `// we've mounted`) don't break the depth
/// tracking. Returns `chars.len()` when unbalanced (EOF).
fn find_matching_paren_in_chars(chars: &[char], start: usize) -> usize {
    let mut depth = 1i32;
    let mut i = start;
    while i < chars.len() {
        let c = chars[i];
        match c {
            '"' | '\'' | '`' => {
                let q = c;
                i += 1;
                while i < chars.len() {
                    if chars[i] == '\\' {
                        i += 2;
                        continue;
                    }
                    if chars[i] == q {
                        break;
                    }
                    i += 1;
                }
            }
            '/' if i + 1 < chars.len() && chars[i + 1] == '/' => {
                while i < chars.len() && chars[i] != '\n' {
                    i += 1;
                }
                continue;
            }
            '/' if i + 1 < chars.len() && chars[i + 1] == '*' => {
                i += 2;
                while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                    i += 1;
                }
                i = (i + 2).min(chars.len());
                continue;
            }
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return i;
                }
            }
            _ => {}
        }
        i += 1;
    }
    chars.len()
}

/// Remove $effect, $effect.pre, $effect.root, $inspect, and $inspect.trace blocks from script.
/// When `use_async` is true, $effect/$effect.pre are replaced with `/* $$async_noop */`
/// markers so the async body transform generates placeholder slots in the run array.
/// When `dev` is true, $inspect() calls are transformed to console.log() instead of removed.
pub(crate) fn remove_effect_blocks(script: &str, use_async: bool, dev: bool) -> String {
    // Check if `effect` is imported - if so, `$effect(` is a store subscription, not a rune
    let imported_names =
        crate::compiler::phases::phase2_analyze::types::extract_imported_names(script);
    let effect_imported = imported_names.contains("effect");

    let mut result = script.to_string();

    // Effect runes that need noop markers in async mode
    let effect_runes = ["$effect.root(", "$effect.pre(", "$effect("];
    // Inspect runes never need markers
    let inspect_runes = ["$inspect.trace(", "$inspect("];

    for rune in effect_runes {
        // Skip $effect( removal if `effect` is imported (it's a store subscription)
        // But still process $effect.root( and $effect.pre( as they can't be store subscriptions
        if effect_imported && rune == "$effect(" {
            continue;
        }
        if use_async && rune != "$effect.root(" {
            result = remove_rune_statement_with_noop(&result, rune);
        } else {
            result = remove_rune_statement(&result, rune);
        }
    }

    for rune in inspect_runes {
        if dev && rune == "$inspect(" {
            // In dev mode, transform $inspect(args) to console.log('$inspect(', args, ')')
            result = transform_inspect_to_console_log(&result);
        } else {
            result = remove_rune_statement(&result, rune);
        }
    }

    result
}

/// Transform `$inspect(args)` calls to `console.log('$inspect(', args, ')')` in dev SSR mode.
/// For `$inspect(args).with(fn)`, generates `(fn)('init', args)` (IIFE pattern).
fn transform_inspect_to_console_log(script: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix = "$inspect(";
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                let is_statement = is_statement_start(&result);

                if is_statement {
                    // Extract arguments
                    let start = i + prefix_len;
                    let mut end = find_matching_paren_in_chars(&chars, start);

                    let args_str: String = chars[start..end.min(chars.len())].iter().collect();
                    end += 1; // skip closing paren

                    // Handle method chaining like $inspect(...).with(fn)
                    let mut with_callback = None;
                    if end + 5 <= chars.len() {
                        let potential_with: String = chars[end..end + 5].iter().collect();
                        if potential_with == ".with" {
                            end += 5;
                            while end < chars.len() && (chars[end] == ' ' || chars[end] == '\t') {
                                end += 1;
                            }
                            if end < chars.len() && chars[end] == '(' {
                                let with_start = end + 1;
                                end = find_matching_paren_in_chars(&chars, with_start);
                                let cb: String =
                                    chars[with_start..end.min(chars.len())].iter().collect();
                                with_callback = Some(cb);
                                end += 1;
                            }
                        }
                    }

                    // Skip trailing semicolons and whitespace
                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }
                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    if let Some(callback) = with_callback {
                        // $inspect(args).with(fn) => (fn)('init', args)
                        let _ = writeln!(
                            result,
                            "({})('init', {});",
                            callback.trim(),
                            args_str.trim()
                        );
                    } else {
                        // $inspect(args) => console.log('$inspect(', args, ')')
                        let _ = writeln!(
                            result,
                            "console.log('$inspect(', {}, ')');",
                            args_str.trim()
                        );
                    }
                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Remove a rune statement and replace it with a `/* $$async_noop */` marker.
fn remove_rune_statement_with_noop(script: &str, rune_prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = rune_prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == rune_prefix {
                let is_statement = is_statement_start(&result);
                if is_statement {
                    // Find the end of this rune call
                    let start = i + prefix_len;
                    let mut end = find_matching_paren_in_chars(&chars, start);
                    end += 1; // skip closing paren

                    // Skip trailing semicolon and whitespace
                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }
                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    // Replace with void noop marker (server-side $effect placeholder)
                    result.push_str("/* $$async_void_noop */\n");
                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn remove_rune_statement(script: &str, rune_prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = rune_prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == rune_prefix {
                let is_statement = is_statement_start(&result);

                if !is_statement && rune_prefix == "$effect.root(" {
                    let start = i + prefix_len;
                    let mut end = find_matching_paren_in_chars(&chars, start);
                    end += 1;

                    result.push_str("() => {}");
                    i = end;
                    continue;
                }

                if is_statement {
                    let start = i + prefix_len;
                    let mut end = find_matching_paren_in_chars(&chars, start);

                    end += 1;

                    // Handle method chaining like $inspect(...).with(...)
                    if end + 5 <= chars.len() {
                        let potential_with: String = chars[end..end + 5].iter().collect();
                        if potential_with == ".with" {
                            end += 5;
                            while end < chars.len() && (chars[end] == ' ' || chars[end] == '\t') {
                                end += 1;
                            }
                            if end < chars.len() && chars[end] == '(' {
                                end = find_matching_paren_in_chars(&chars, end + 1);
                                end += 1;
                            }
                        }
                    }

                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }

                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    if rune_prefix.starts_with("$inspect")
                        && !rune_prefix.starts_with("$inspect.trace")
                    {
                        // $inspect() calls (not $inspect.trace()) leave behind a
                        // placeholder. In an async-body context this gets turned
                        // into a sparse-array hole (matching the official `[a,,]`
                        // shape); in non-async contexts strip_async_placeholders
                        // rewrites it back to `;;`. Emitting an `$$async_hole`
                        // comment here means a single hole instead of two empty
                        // statements (which would otherwise become two noop thunks).
                        //
                        // A `// …` comment trailing the removed `$inspect(...)` on
                        // the SAME line stays attached to the placeholder line
                        // (upstream emits `;; // comment` — esrap's
                        // flush_trailing_comments prints same-line trailing
                        // comments right after the replacing empty statements).
                        let has_same_line_line_comment =
                            end + 1 < chars.len() && chars[end] == '/' && chars[end + 1] == '/';
                        if has_same_line_line_comment {
                            result.push_str("/* $$async_hole */; ");
                        } else {
                            result.push_str("/* $$async_hole */;\n");
                        }
                        // Comments INSIDE the removed `$inspect(...)` /
                        // `.with(...)` range survive in the official output
                        // (esrap re-inserts them positionally — typically at
                        // the end of the component body). Re-emit them on
                        // their own lines; the trailing-comment split in
                        // `build_program` routes them like the $effect case.
                        let removed: String = chars[i..end.min(chars.len())].iter().collect();
                        if removed.contains("//") || removed.contains("/*") {
                            for comment in extract_comments_from_snippet(&removed) {
                                result.push_str(&comment);
                                result.push('\n');
                            }
                        }
                    } else if !rune_prefix.starts_with("$inspect") {
                        while result.ends_with(' ') || result.ends_with('\t') {
                            result.pop();
                        }
                        // Upstream replaces the `$effect(...)` statement with
                        // `b.empty`, but the comments inside the removed range
                        // survive: esrap re-inserts every comment from
                        // `analysis.comments` positionally, so they print before the
                        // next positioned statement (or at the end of the component
                        // body when nothing follows). Keep them in place here; the
                        // trailing-comment split in `build_program` handles the
                        // end-of-body case.
                        let removed: String = chars[i..end.min(chars.len())].iter().collect();
                        for comment in extract_comments_from_snippet(&removed) {
                            result.push_str(&comment);
                            result.push('\n');
                        }
                    }
                    // $inspect.trace() calls are removed entirely (no output)

                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Collect `// …` and `/* … */` comments from a JS source snippet, skipping
/// string and template-literal contents. Used when removing `$effect(...)`
/// statements on the server: the official compiler keeps every comment (esrap
/// re-inserts them positionally), so the comments inside the removed range
/// must be re-emitted in place.
pub(crate) fn extract_comments_from_snippet(snippet: &str) -> Vec<String> {
    extract_comments_from_snippet_with_pos(snippet)
        .into_iter()
        .map(|(_, c)| c)
        .collect()
}

/// Like `extract_comments_from_snippet`, but also returns each comment's byte
/// offset within `snippet`.
pub(crate) fn extract_comments_from_snippet_with_pos(snippet: &str) -> Vec<(usize, String)> {
    let bytes = snippet.as_bytes();
    let mut comments = Vec::new();
    let mut i = 0usize;
    let mut in_string: Option<u8> = None;
    while i < bytes.len() {
        let c = bytes[i];
        if let Some(q) = in_string {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q || (c == b'\n' && q != b'`') {
                in_string = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' | b'`' => {
                in_string = Some(c);
                i += 1;
            }
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'/' => {
                let eol = memchr::memchr(b'\n', &bytes[i..])
                    .map(|p| i + p)
                    .unwrap_or(bytes.len());
                comments.push((i, snippet[i..eol].trim_end().to_string()));
                i = eol;
            }
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'*' => {
                let close = memchr::memmem::find(&bytes[i + 2..], b"*/")
                    .map(|p| i + 2 + p + 2)
                    .unwrap_or(bytes.len());
                comments.push((i, snippet[i..close].to_string()));
                i = close;
            }
            _ => i += 1,
        }
    }
    comments
}

fn is_statement_start(preceding: &str) -> bool {
    if let Some(last_newline) = preceding.rfind('\n') {
        let line_content = &preceding[last_newline + 1..];
        line_content.chars().all(|c| c.is_whitespace())
    } else {
        preceding.chars().all(|c| c.is_whitespace())
    }
}

/// Strip `export` keyword from function/const/class declarations.
fn strip_export_from_declarations(script: &str) -> String {
    let mut result = String::new();
    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("export function ")
            || trimmed.starts_with("export async function ")
            || trimmed.starts_with("export const ")
            || trimmed.starts_with("export class ")
        {
            let indent = &line[..line.len() - trimmed.len()];
            let rest = trimmed.strip_prefix("export ").unwrap_or(trimmed);
            result.push_str(indent);
            result.push_str(rest);
        } else {
            result.push_str(line);
        }
        result.push('\n');
    }
    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Transform `let x = value` declarations where `x` is exported via `export { x }`.
/// Converts them to `let x = $.fallback($$props['x'], value)` for server-side rendering,
/// similar to how `export let x = value` is handled.
fn transform_reexported_prop_declarations(
    script: &str,
    reexported_props: &[(String, String)],
) -> String {
    use super::transform_legacy::{is_no_arg_function_call, is_simple_default_value};

    let mut result = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Check if this is a `let x = value;` or `let x;` declaration for a reexported prop
        if trimmed.starts_with("let ") || trimmed.starts_with("var ") {
            // Preserve the original declaration keyword: upstream keeps a
            // `var`-declared exported binding as `var` (it only rewrites the
            // initializer to `$.fallback(...)`).
            let kw = &trimmed[..3]; // "let" or "var"
            let rest = &trimmed[4..]; // skip "let " or "var "
            let rest_trimmed = rest.trim().trim_end_matches(';').trim();

            // Check for destructured pattern: `let { a, b, c } = expr`
            if rest_trimmed.starts_with('{') || rest_trimmed.starts_with('[') {
                // Check if any extracted name is a reexported prop
                let names = extract_destructured_names_simple(rest_trimmed);
                let has_reexported = names
                    .iter()
                    .any(|name| reexported_props.iter().any(|(local, _)| local == name));

                if has_reexported
                    && let Some(flattened) =
                        flatten_destructured_let_ssr(rest_trimmed, reexported_props)
                {
                    let indent = &line[..line.len() - trimmed.len()];
                    for decl_line in flattened.lines() {
                        result.push_str(indent);
                        result.push_str(decl_line);
                        result.push('\n');
                    }
                    continue;
                }
            }

            // Simple case: `let x = value` or `let x`
            if let Some(eq_pos) = find_simple_assignment(rest_trimmed) {
                let name = rest_trimmed[..eq_pos].trim();
                let value = rest_trimmed[eq_pos + 1..].trim();

                if let Some((_, prop_name)) =
                    reexported_props.iter().find(|(local, _)| local == name)
                {
                    let indent = &line[..line.len() - trimmed.len()];
                    let transformed = if is_simple_default_value(value) {
                        format!(
                            "{}{} {} = $.fallback($$props['{}'], {});",
                            indent, kw, name, prop_name, value
                        )
                    } else if let Some(fn_name) = is_no_arg_function_call(value) {
                        format!(
                            "{}{} {} = $.fallback($$props['{}'], {}, true);",
                            indent, kw, name, prop_name, fn_name
                        )
                    } else {
                        format!(
                            "{}{} {} = $.fallback($$props['{}'], () => ({}), true);",
                            indent, kw, name, prop_name, value
                        )
                    };
                    result.push_str(&transformed);
                    result.push('\n');
                    continue;
                }
            } else {
                // No assignment: `let x;` -> `let x = $$props['prop_name'];`
                // Also handle multi-declarator: `let a, b, c, d;`
                let name = rest_trimmed.trim();

                // Check if this is a multi-declarator (contains commas at depth 0)
                let has_commas = name.contains(',');
                if has_commas {
                    // Split multi-declarator into individual declarations
                    let parts: Vec<&str> = name.split(',').map(|s| s.trim()).collect();
                    let any_is_prop = parts.iter().any(|part| {
                        let part_name = part.trim_end_matches(';').trim();
                        reexported_props.iter().any(|(local, _)| local == part_name)
                    });

                    if any_is_prop {
                        let indent = &line[..line.len() - trimmed.len()];
                        for part in &parts {
                            let part_name = part.trim_end_matches(';').trim();
                            if let Some((_, prop_name)) = reexported_props
                                .iter()
                                .find(|(local, _)| local == part_name)
                            {
                                let _ = write!(
                                    result,
                                    "{}{} {} = $$props['{}'];",
                                    indent, kw, part_name, prop_name
                                );
                            } else {
                                let _ = write!(result, "{}{} {};", indent, kw, part_name);
                            }
                            result.push('\n');
                        }
                        continue;
                    }
                } else if let Some((_, prop_name)) =
                    reexported_props.iter().find(|(local, _)| local == name)
                {
                    let indent = &line[..line.len() - trimmed.len()];
                    let _ = write!(
                        result,
                        "{}{} {} = $$props['{}'];",
                        indent, kw, name, prop_name
                    );
                    result.push('\n');
                    continue;
                }
            }
        }

        result.push_str(line);
        result.push('\n');
    }

    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Find assignment `=` in a simple declarator (not inside parentheses, brackets, etc.)
fn find_simple_assignment(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                let next = chars.get(i + 1).copied();
                if prev != Some('=')
                    && prev != Some('!')
                    && prev != Some('<')
                    && prev != Some('>')
                    && next != Some('=')
                    && next != Some('>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Split comma-separated variable declarations into individual statements.
/// e.g., `const a = 1, b = 2, c = 3;` -> `const a = 1;\nconst b = 2;\nconst c = 3;`
///
/// This matches the official Svelte compiler's AST-based VariableDeclaration splitting
/// where each declarator becomes its own statement.
///
/// Handles both single-line and multi-line declarations:
/// ```js
/// let x = 'x',
///     y = 'y',
///     z = 'z';
/// ```
/// becomes:
/// ```js
/// let x = 'x';
/// let y = 'y';
/// let z = 'z';
/// ```
pub(crate) fn split_comma_separated_declarations(script: &str) -> String {
    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();
    let mut i = 0;
    // Track brace nesting depth to only split top-level declarations.
    // The official Svelte compiler only splits declarations at the top level of the
    // instance script (via the VariableDeclaration visitor), not inside nested functions.
    let mut brace_depth: i32 = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();
        let indent = &line[..line.len() - line.trim_start().len()];

        // Check if this line starts at top level (before counting this line's braces)
        let is_top_level = brace_depth == 0;

        // Update brace depth tracking using a simple char scan.
        // This is approximate (doesn't handle braces inside strings/comments)
        // but works well for typical Svelte instance script code.
        let mut in_string = false;
        let mut string_char = ' ';
        let mut prev_char = ' ';
        let mut in_template = false;
        for ch in trimmed.chars() {
            if in_string {
                if ch == string_char && prev_char != '\\' {
                    in_string = false;
                }
            } else if in_template {
                if ch == '`' && prev_char != '\\' {
                    in_template = false;
                } else if ch == '{' {
                    brace_depth += 1;
                } else if ch == '}' {
                    brace_depth -= 1;
                }
            } else if ch == '\'' || ch == '"' {
                in_string = true;
                string_char = ch;
            } else if ch == '`' {
                in_template = true;
            } else if ch == '{' {
                brace_depth += 1;
            } else if ch == '}' {
                brace_depth -= 1;
            }
            prev_char = ch;
        }

        // Check if this is a const/let/var declaration
        let is_export = trimmed.starts_with("export ");
        let decl_trimmed = if is_export {
            trimmed.strip_prefix("export ").unwrap().trim_start()
        } else {
            trimmed
        };

        let keyword = if decl_trimmed.starts_with("const ") {
            Some("const")
        } else if decl_trimmed.starts_with("let ") {
            Some("let")
        } else if decl_trimmed.starts_with("var ") {
            Some("var")
        } else {
            None
        };

        if let Some(kw) = keyword
            && is_top_level
        {
            // Accumulate multi-line declaration.
            // A declaration continues across lines if the line doesn't end with `;`
            // and we haven't reached a balanced state (all brackets closed + semicolon).
            let first_rest = decl_trimmed[kw.len()..].trim_start();
            let mut full_decl = first_rest.to_string();
            let mut line_idx = i;

            // Check if the declaration is complete (ends with `;` at balanced depth)
            while !is_declaration_complete(&full_decl) && line_idx + 1 < lines.len() {
                line_idx += 1;
                full_decl.push(' ');
                full_decl.push_str(lines[line_idx].trim());
            }

            let rest = full_decl.trim_end_matches(';');

            // Split by top-level commas
            let parts = split_top_level_commas(rest);

            if parts.len() > 1 {
                // Multiple declarators - split into individual statements
                let prefix = if is_export {
                    format!("export {} ", kw)
                } else {
                    format!("{} ", kw)
                };
                for (j, part) in parts.iter().enumerate() {
                    let part = part.trim();
                    if !part.is_empty() {
                        if j > 0 {
                            result.push('\n');
                        }
                        result.push_str(indent);
                        result.push_str(&prefix);
                        result.push_str(part);
                        result.push(';');
                    }
                }
                result.push('\n');
                i = line_idx + 1;
                continue;
            }
        }

        result.push_str(line);
        result.push('\n');
        i += 1;
    }

    // Remove trailing newline to match input behavior
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Check if a declaration string is complete.
/// A declaration is complete if all brackets are balanced AND either:
/// 1. It ends with `;`, OR
/// 2. It doesn't end with a continuation token (operator, comma, etc.)
fn is_declaration_complete(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Check that all brackets/parens/braces are balanced
    let balanced = are_brackets_balanced(trimmed);

    // If brackets are not balanced, definitely not complete
    if !balanced {
        return false;
    }

    // If ends with semicolon and balanced, it's complete
    if trimmed.ends_with(';') {
        return true;
    }

    // If balanced but no semicolon, check if it ends with a continuation token
    // that would indicate the declaration continues on the next line
    let ends_with_continuation = trimmed.ends_with(',')
        || trimmed.ends_with('+')
        || trimmed.ends_with('-')
        || trimmed.ends_with('*')
        || trimmed.ends_with('/')
        || trimmed.ends_with('%')
        || trimmed.ends_with('&')
        || trimmed.ends_with('|')
        || trimmed.ends_with('^')
        || trimmed.ends_with('?')
        || trimmed.ends_with('=')
        || trimmed.ends_with("&&")
        || trimmed.ends_with("||")
        || trimmed.ends_with("=>");

    !ends_with_continuation
}

/// Check if all brackets/parens/braces are balanced in the string.
fn are_brackets_balanced(s: &str) -> bool {
    let mut depth = 0i32;
    let bytes = s.as_bytes();
    let mut i = 0;
    let len = bytes.len();
    while i < len {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'\'' | b'"' => {
                let quote = bytes[i];
                i += 1;
                while i < len && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                i += 1;
                let mut tmpl_depth = 0i32;
                while i < len {
                    if bytes[i] == b'`' && tmpl_depth == 0 {
                        break;
                    }
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                        tmpl_depth += 1;
                        i += 1;
                    } else if bytes[i] == b'}' && tmpl_depth > 0 {
                        tmpl_depth -= 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    depth == 0
}

/// Split a string by top-level commas, respecting nesting.
fn split_top_level_commas(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
    let bytes = s.as_bytes();
    let mut i = 0;
    let len = bytes.len();

    while i < len {
        // Skip line comments: `//...` until end of line
        if bytes[i] == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        // Skip block comments: `/* ... */`
        if bytes[i] == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i = (i + 2).min(len);
            continue;
        }
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'\'' | b'"' => {
                let quote = bytes[i];
                i += 1;
                while i < len && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                i += 1;
                let mut tmpl_depth = 0i32;
                while i < len {
                    if bytes[i] == b'`' && tmpl_depth == 0 {
                        break;
                    }
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                        tmpl_depth += 1;
                        i += 1;
                    } else if bytes[i] == b'}' && tmpl_depth > 0 {
                        tmpl_depth -= 1;
                    }
                    i += 1;
                }
            }
            b',' if depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    parts.push(&s[start..]);
    parts
}

/// Extract simple identifier names from a destructuring pattern (for checking if reexported)
fn extract_destructured_names_simple(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    let pattern = pattern.trim();

    // Remove outer braces/brackets
    let inner = if (pattern.starts_with('{') && pattern.ends_with('}'))
        || (pattern.starts_with('[') && pattern.ends_with(']'))
    {
        // Find the = RHS part and exclude it
        if let Some(end) = find_pattern_end_simple(pattern) {
            &pattern[1..end - 1]
        } else {
            &pattern[1..pattern.len() - 1]
        }
    } else {
        return names;
    };

    // Split by commas respecting nesting
    let parts = split_by_comma_respecting_nesting(inner);
    for part in parts {
        let part = part.trim();
        if part.is_empty() || part.starts_with("...") {
            continue;
        }
        // Check for key: value pattern
        if let Some(colon_pos) = find_colon_at_depth_0(part) {
            let value = part[colon_pos + 1..].trim();
            if value.starts_with('{') || value.starts_with('[') {
                // Nested destructuring - recurse
                let mut nested = extract_destructured_names_simple(value);
                names.append(&mut nested);
            } else {
                // Simple rename: key: name or key: name = default
                let name = if let Some(eq_pos) = value.find('=') {
                    let before_eq = value[..eq_pos].trim();
                    if !before_eq.contains('=') {
                        before_eq
                    } else {
                        value
                    }
                } else {
                    value
                };
                if is_simple_identifier_name(name) {
                    names.push(name.to_string());
                }
            }
        } else {
            // Simple name or name = default
            let name = if let Some(eq_pos) = part.find('=') {
                let before_eq = part[..eq_pos].trim();
                if !before_eq.contains('=') {
                    before_eq
                } else {
                    part
                }
            } else {
                part
            };
            if is_simple_identifier_name(name) {
                names.push(name.to_string());
            }
        }
    }
    names
}

// These return BYTE offsets (the results index `&str` slices below), so they
// iterate via `char_indices()` rather than `chars().enumerate()` — the latter
// yields char counts, which slice at the wrong byte (and panic mid-char) once a
// multibyte identifier precedes the delimiter. The `+ 1` advances past the
// matched delimiter, which is always ASCII (`{}[]():,`), so it stays on a
// boundary.
fn find_pattern_end_simple(s: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' => depth += 1,
            '}' | ']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i + 1);
                }
            }
            _ => {}
        }
    }
    None
}

fn find_colon_at_depth_0(s: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

fn is_simple_identifier_name(s: &str) -> bool {
    let s = s.trim();
    !s.is_empty()
        && s.chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        && !s.chars().next().unwrap().is_numeric()
}

fn split_by_comma_respecting_nesting(s: &str) -> Vec<&str> {
    // Byte offsets (see the note on `find_pattern_end_simple`): `i`/`start` index
    // `&s[..]`, and the `,` delimiter is ASCII so `i + 1` stays on a boundary.
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    result.push(&s[start..]);
    result
}

/// Flatten a destructured `let { ... } = expr` for SSR where some bindings are re-exported.
fn flatten_destructured_let_ssr(
    declaration: &str,
    reexported_props: &[(String, String)],
) -> Option<String> {
    let trimmed = declaration.trim();
    let pattern_end = find_pattern_end_simple(trimmed)?;
    let pattern = &trimmed[..pattern_end];
    let rhs_part = trimmed[pattern_end..].trim();
    let rhs = rhs_part
        .strip_prefix('=')?
        .trim()
        .trim_end_matches(';')
        .trim();

    let mut declarations = Vec::new();
    declarations.push(format!("tmp = {}", rhs));

    // Upstream (server VariableDeclaration.js): when a destructuring pattern's
    // bindings include ANY bindable_prop, EVERY leaf of that pattern is emitted
    // as `$.fallback($$props['<alias ?? name>'], () => <path>, true)` — even
    // leaves that are not themselves exported. Mirror that by computing once
    // whether this pattern contains a reexported prop, then forcing the fallback
    // form for all leaves when it does.
    let mut leaf_names = Vec::new();
    collect_destructure_leaf_names(pattern, &mut leaf_names);
    let force_fallback = leaf_names
        .iter()
        .any(|n| reexported_props.iter().any(|(local, _)| local == n));

    flatten_destructured_let_ssr_inner(
        pattern,
        "tmp",
        reexported_props,
        force_fallback,
        &mut declarations,
    )?;

    // Join as a single comma-separated let declaration to match the official compiler output
    Some(format!("let {};", declarations.join(", ")))
}

/// Collect the leaf binding names of a destructuring pattern string
/// (`{ a, b: { c }, d = 1 }` → `[a, c, d]`), mirroring the traversal in
/// `flatten_destructured_let_ssr_inner`.
fn collect_destructure_leaf_names(pattern: &str, out: &mut Vec<String>) {
    let pattern = pattern.trim();
    if !(pattern.starts_with('{') && pattern.ends_with('}')) {
        return;
    }
    let inner = &pattern[1..pattern.len() - 1];
    for prop in split_by_comma_respecting_nesting(inner) {
        let prop = prop.trim();
        if prop.is_empty() {
            continue;
        }
        if let Some(colon_pos) = find_colon_at_depth_0(prop) {
            let value_pattern = prop[colon_pos + 1..].trim();
            if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                collect_destructure_leaf_names(value_pattern, out);
            } else {
                let (name, _) = split_name_default(value_pattern);
                out.push(name.to_string());
            }
        } else {
            let (name, _) = split_name_default(prop);
            out.push(name.to_string());
        }
    }
}

fn flatten_destructured_let_ssr_inner(
    pattern: &str,
    base_path: &str,
    reexported_props: &[(String, String)],
    force_fallback: bool,
    declarations: &mut Vec<String>,
) -> Option<()> {
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_by_comma_respecting_nesting(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some(colon_pos) = find_colon_at_depth_0(prop) {
                let key = prop[..colon_pos].trim();
                let value_pattern = prop[colon_pos + 1..].trim();
                let new_path = format!("{}.{}", base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    flatten_destructured_let_ssr_inner(
                        value_pattern,
                        &new_path,
                        reexported_props,
                        force_fallback,
                        declarations,
                    )?;
                } else {
                    let (binding_name, default_value) = split_name_default(value_pattern);
                    push_leaf_declaration(
                        binding_name,
                        &new_path,
                        default_value,
                        reexported_props,
                        force_fallback,
                        declarations,
                    );
                }
            } else {
                let (binding_name, default_value) = split_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                push_leaf_declaration(
                    binding_name,
                    &new_path,
                    default_value,
                    reexported_props,
                    force_fallback,
                    declarations,
                );
            }
        }
    } else {
        return None;
    }

    Some(())
}

/// Emit a single destructure-leaf declaration for the SSR flattener.
///
/// - A reexported leaf always uses its prop alias as the `$$props` key.
/// - When `force_fallback` is set (the enclosing pattern contains a bindable
///   prop), a non-reexported leaf is ALSO wrapped in `$.fallback`, keyed by its
///   own name — mirroring upstream's per-pattern `has_props` branch which
///   fallback-wraps every leaf. Otherwise a non-reexported leaf is a plain
///   `name = path` / `name = path ?? default`.
fn push_leaf_declaration(
    binding_name: &str,
    new_path: &str,
    default_value: Option<&str>,
    reexported_props: &[(String, String)],
    force_fallback: bool,
    declarations: &mut Vec<String>,
) {
    let prop_key = reexported_props
        .iter()
        .find(|(local, _)| local == binding_name)
        .map(|(_, alias)| alias.as_str());

    match prop_key {
        Some(prop_name) => {
            if let Some(default_val) = default_value {
                declarations.push(format!(
                    "{} = $.fallback($$props['{}'], () => $.fallback({}, {}), true)",
                    binding_name, prop_name, new_path, default_val
                ));
            } else {
                declarations.push(format!(
                    "{} = $.fallback($$props['{}'], () => {}, true)",
                    binding_name, prop_name, new_path
                ));
            }
        }
        None if force_fallback => {
            // Non-reexported leaf inside a prop-bearing pattern: keyed by own name.
            if let Some(default_val) = default_value {
                declarations.push(format!(
                    "{} = $.fallback($$props['{}'], () => $.fallback({}, {}), true)",
                    binding_name, binding_name, new_path, default_val
                ));
            } else {
                declarations.push(format!(
                    "{} = $.fallback($$props['{}'], () => {}, true)",
                    binding_name, binding_name, new_path
                ));
            }
        }
        None => {
            if let Some(default_val) = default_value {
                declarations.push(format!(
                    "{} = {} ?? {}",
                    binding_name, new_path, default_val
                ));
            } else {
                declarations.push(format!("{} = {}", binding_name, new_path));
            }
        }
    }
}

fn split_name_default(s: &str) -> (&str, Option<&str>) {
    let s = s.trim();
    if let Some(eq_pos) = s.find('=') {
        let after = s.get(eq_pos + 1..eq_pos + 2).unwrap_or("");
        if after == "=" || after == ">" {
            return (s, None);
        }
        (s[..eq_pos].trim(), Some(s[eq_pos + 1..].trim()))
    } else {
        (s, None)
    }
}

/// Normalize IIFE patterns: `(function(a){...}(args))` → `(function(a){...})(args)`
///
/// The official Svelte compiler uses an AST printer (esrap) which normalizes
/// IIFE parens automatically. Since we work with text, we need to do it manually.
///
/// The pattern we look for is:
/// `(function` ... function body `}` ... `(` args `)` `)` where the outer parens
/// wrap the entire call expression. We move the outer closing `)` to just after
/// the function body `}`, turning it into `(function...body)(args)`.
pub(crate) fn normalize_iife_parens(s: &str) -> String {
    let chars: Vec<char> = s.chars().collect();
    let len = chars.len();
    let mut result = String::with_capacity(s.len());
    let mut i = 0;

    while i < len {
        // Look for `(function` pattern (not inside strings)
        if chars[i] == '('
            && i + 9 < len
            && chars[i + 1..i + 9].iter().copied().eq("function".chars())
            && !chars[i + 9].is_alphanumeric()
        {
            // Try to match the IIFE pattern
            if let Some((end_pos, new_form)) = try_normalize_iife(&chars, i) {
                result.push_str(&new_form);
                i = end_pos;
                continue;
            }
        }
        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Try to normalize an IIFE starting at position `start`.
/// Returns `Some((end_pos, normalized_form))` on success.
fn try_normalize_iife(chars: &[char], start: usize) -> Option<(usize, String)> {
    let len = chars.len();
    // chars[start] == '('
    // chars[start+1..] starts with "function"

    // Find the function body: skip params, find the opening `{` of the body
    let mut i = start + 1; // skip `(`
    // Skip past `function` and optional name
    i += 8; // "function"
    // Skip optional function name (identifier chars)
    while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
        i += 1;
    }
    // Skip whitespace
    while i < len && chars[i].is_whitespace() {
        i += 1;
    }
    // Should be `(` for params
    if i >= len || chars[i] != '(' {
        return None;
    }
    // Find matching `)` for params
    let mut depth = 1;
    i += 1;
    while i < len && depth > 0 {
        match chars[i] {
            '(' => depth += 1,
            ')' => depth -= 1,
            '"' | '\'' | '`' => {
                let q = chars[i];
                i += 1;
                while i < len && chars[i] != q {
                    if chars[i] == '\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    // Skip whitespace
    while i < len && chars[i].is_whitespace() {
        i += 1;
    }
    // Should be `{` for function body
    if i >= len || chars[i] != '{' {
        return None;
    }
    // Find matching `}` for body
    depth = 1;
    i += 1;
    let mut in_string = false;
    let mut string_char = ' ';
    while i < len && depth > 0 {
        let c = chars[i];
        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else {
            match c {
                '{' => depth += 1,
                '}' => depth -= 1,
                _ => {}
            }
        }
        i += 1;
    }
    // i is now just past the closing `}` of the function body
    let func_end = i; // position after `}`

    // Skip optional whitespace/newlines
    while i < len && chars[i].is_whitespace() {
        i += 1;
    }

    // Should be `(` for the call arguments
    if i >= len || chars[i] != '(' {
        return None;
    }
    let args_start = i;
    // Find matching `)` for call args
    depth = 1;
    i += 1;
    in_string = false;
    while i < len && depth > 0 {
        let c = chars[i];
        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else {
            match c {
                '(' => depth += 1,
                ')' => depth -= 1,
                _ => {}
            }
        }
        i += 1;
    }
    let args_end = i; // position after `)` of call args

    // Should be `)` for the outer wrapper
    if i >= len || chars[i] != ')' {
        return None;
    }
    let outer_end = i + 1; // position after outer `)`

    // Build normalized form: (function...body)(args)
    let func_part: String = chars[start..func_end].iter().collect();
    let args_part: String = chars[args_start..args_end].iter().collect();
    let normalized = format!("{}){}", func_part, args_part);

    Some((outer_end, normalized))
}

/// Strip unnecessary parens around arrow function expressions.
///
/// Converts `(() => { ... })` to `() => { ... }` when the closing `)` is NOT
/// followed by `(` (which would indicate an IIFE call that needs the parens).
///
/// The official Svelte compiler's AST representation doesn't include
/// ParenthesizedExpression nodes (acorn strips them), so when it reprints
/// the AST, arrow functions never have unnecessary wrapping parens.
pub(crate) fn strip_arrow_function_parens(s: String) -> String {
    // Fast path: if the string doesn't contain "(() =>" there's nothing to strip.
    // Returns the original String without any allocation.
    if memmem::find(s.as_bytes(), b"(() =>").is_none() {
        return s;
    }

    // Byte-level scan: copy untouched ranges via slice copies instead of per-char
    // appends, and skip the up-front `Vec<char>` allocation entirely. JS string
    // delimiters and the `(() =>` token are all ASCII, and UTF-8 continuation
    // bytes (0x80..=0xBF) can never collide with ASCII bytes — so byte-level
    // string-boundary tracking is safe even when the generated code contains
    // non-ASCII characters inside string/template literals.
    //
    // `result` is lazily allocated on the first strip. `memmem::find` above
    // confirms `(() =>` appears somewhere, but in plenty of inputs every match
    // is shadowed (inside a string literal, immediately followed by `(` so it's
    // an IIFE, or preceded by an identifier so it's a call argument). Deferring
    // the `String::with_capacity` until we actually strip avoids a wasted
    // heap allocation in the "false-positive memmem hit" case.
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut result: Option<String> = None;
    let mut last_copied: usize = 0;
    let mut i: usize = 0;
    let mut in_string = false;
    let mut string_char: u8 = 0;

    while i < len {
        let c = bytes[i];

        if in_string {
            if c == b'\\' && i + 1 < len {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if c == b'"' || c == b'\'' || c == b'`' {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }

        // Look for `(() =>` pattern — only when `(` is NOT a function call.
        // We need 6 bytes starting at i: `(`, `(`, `)`, ` `, `=`, `>`.
        if c == b'('
            && i + 5 < len
            && bytes[i + 1] == b'('
            && bytes[i + 2] == b')'
            && bytes[i + 3] == b' '
            && bytes[i + 4] == b'='
            && bytes[i + 5] == b'>'
        {
            // Skip ASCII whitespace before `(` to find the effective prev char.
            let mut k = i;
            while k > 0 {
                let pb = bytes[k - 1];
                if pb == b' ' || pb == b'\t' || pb == b'\n' || pb == b'\r' {
                    k -= 1;
                } else {
                    break;
                }
            }
            // Treat any non-ASCII byte conservatively as part of an identifier
            // (matches `is_alphanumeric()`'s Unicode-aware behavior closely
            //  enough for the codegen output we see in practice).
            let prev_is_call = k > 0 && {
                let pb = bytes[k - 1];
                pb.is_ascii_alphanumeric()
                    || pb == b'_'
                    || pb == b'$'
                    || pb == b')'
                    || pb == b']'
                    || pb >= 0x80
            };
            if !prev_is_call {
                // Find the matching `)` for the outer parens.
                let inner_start = i + 1;
                let mut depth: i32 = 1;
                let mut j = inner_start;
                let mut j_in_string = false;
                let mut j_string_char: u8 = 0;
                while j < len && depth > 0 {
                    let jc = bytes[j];
                    if j_in_string {
                        if jc == b'\\' {
                            j += 1;
                        } else if jc == j_string_char {
                            j_in_string = false;
                        }
                    } else if jc == b'"' || jc == b'\'' || jc == b'`' {
                        j_in_string = true;
                        j_string_char = jc;
                    } else {
                        match jc {
                            b'(' => depth += 1,
                            b')' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        j += 1;
                    }
                }
                // j is now at the closing `)` of the outer parens (or past end).
                if depth == 0 {
                    // Check that `)` is NOT followed by `(` (which would be an IIFE).
                    let mut k2 = j + 1;
                    while k2 < len {
                        let kb = bytes[k2];
                        if kb == b' ' || kb == b'\t' || kb == b'\n' || kb == b'\r' {
                            k2 += 1;
                        } else {
                            break;
                        }
                    }
                    let next_non_ws = if k2 < len { Some(bytes[k2]) } else { None };
                    if next_non_ws != Some(b'(') {
                        // Safe to strip the outer parens.
                        // Slicing on `&s` is byte-indexed but the cut points
                        // (`i`, `i+1`, `j`, `j+1`) are all ASCII delimiters, so
                        // slices are guaranteed to land on UTF-8 char boundaries.
                        let result = result.get_or_insert_with(|| String::with_capacity(s.len()));
                        result.push_str(&s[last_copied..i]);
                        result.push_str(&s[inner_start..j]);
                        last_copied = j + 1;
                        i = j + 1;
                        continue;
                    }
                }
            }
        }

        i += 1;
    }

    // `result` was never initialized → no strip happened, return `s` unchanged.
    let Some(mut result) = result else {
        return s;
    };
    if last_copied < len {
        result.push_str(&s[last_copied..]);
    }

    result
}

#[cfg(test)]
mod destructure_helper_tests {
    use super::{
        extract_destructured_names_simple, find_colon_at_depth_0, find_pattern_end_simple,
        split_by_comma_respecting_nesting,
    };

    // The helpers return byte offsets used to slice `&str`. With a multibyte
    // identifier before the delimiter, a char-count index would land mid-char
    // and panic; these assert byte-correctness (and no panic).

    #[test]
    fn pattern_end_is_byte_offset_with_multibyte() {
        // `café` is 5 bytes; the closing `}` is at byte 8, so end == 9.
        let s = "{ café } = x";
        let end = find_pattern_end_simple(s).unwrap();
        assert_eq!(end, 9);
        assert_eq!(&s[1..end - 1], " café "); // inner slice must be valid
    }

    #[test]
    fn colon_at_depth_0_is_byte_offset_with_multibyte() {
        // `café` is 5 bytes (4 chars) -> the colon is at byte offset 5, which a
        // char-count index (4) would get wrong.
        let s = "café: renamed";
        let pos = find_colon_at_depth_0(s).unwrap();
        assert_eq!(pos, 5);
        assert_eq!(s[pos + 1..].trim(), "renamed");
    }

    #[test]
    fn split_commas_keeps_multibyte_parts_intact() {
        let parts = split_by_comma_respecting_nesting("café, { x: π }, naïve");
        assert_eq!(parts, vec!["café", " { x: π }", " naïve"]);
    }

    #[test]
    fn extract_names_from_multibyte_renamed_destructure() {
        // Exercises all three helpers together; must not panic and must keep
        // the multibyte target name.
        let names = extract_destructured_names_simple("{ café: renamed, π = 1 }");
        assert!(names.contains(&"renamed".to_string()), "{names:?}");
    }
}
