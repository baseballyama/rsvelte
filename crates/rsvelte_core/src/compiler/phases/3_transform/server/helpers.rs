//! Helper functions for server-side code generation.
//!
//! This module contains standalone utility functions used by the server-side
//! visitor implementations. These were extracted from `transform_server.rs`
//! to keep the visitor files focused on their specific AST node handling.

use crate::ast::template::Script;
use memchr::memmem;
use rustc_hash::FxHashMap;
use std::fmt::Write as _;

/// The SSR constant-folding inputs that the pure-AST server pipeline needs:
/// the constant-variable map (`scope.evaluate` folds template reads of these to
/// their literal value) and the top-level async blocker map (`use_async`).
/// Extracted from the now-removed text `ServerCodeGenerator::new`.
pub(crate) struct EvalInputsRaw {
    pub(crate) constant_vars: FxHashMap<String, String>,
    pub(crate) top_level_blocker_map: FxHashMap<String, usize>,
}

/// Compute the SSR constant-folding inputs (`constant_vars`,
/// `top_level_blocker_map`) for a component, mirroring the harvesting logic
/// that used to live in the text `ServerCodeGenerator::new`.
pub(crate) fn compute_eval_inputs(
    analysis: Option<&crate::compiler::phases::phase2_analyze::ComponentAnalysis>,
    instance_script: Option<&Script>,
    module_script: Option<&Script>,
    source: &str,
    use_async: bool,
) -> EvalInputsRaw {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    // Extract constant variables from script
    let mut constant_vars = FxHashMap::default();

    // Extract constants from module script first (only const declarations)
    if let Some(script) = module_script {
        let start = script.content.start().unwrap_or(0) as usize;
        let end = script.content.end().unwrap_or(0) as usize;
        if end > start && end <= source.len() {
            for (k, v) in extract_constant_vars(&source[start..end], source) {
                constant_vars.insert(k, v);
            }
        }
    }

    // Then from instance script (both let and const)
    if let Some(script) = instance_script {
        let start = script.content.start().unwrap_or(0) as usize;
        let end = script.content.end().unwrap_or(0) as usize;
        if end > start && end <= source.len() {
            for (k, v) in extract_constant_vars(&source[start..end], source) {
                constant_vars.insert(k, v);
            }
        }
    }

    // Add scope-based constants for $state variables that are not updated.
    // The text-based extraction skips $state lines, but if scope analysis shows
    // a $state binding is never reassigned/mutated, we can fold its initial value.
    // Only template-visible scopes participate: a `$state` declared inside a
    // function body (e.g. within a `$derived.by` arrow) must not be folded
    // into template reads of a same-named outer binding.
    if let Some(analysis) = analysis {
        let template_scopes: rustc_hash::FxHashSet<usize> =
            analysis.root.template_scope_map.values().copied().collect();
        for binding in &analysis.root.bindings {
            if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                && (binding.scope_index == 0
                    || binding.scope_index == analysis.root.instance_scope_index
                    || template_scopes.contains(&binding.scope_index))
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
    let mut top_level_blocker_map: FxHashMap<String, usize> = FxHashMap::default();
    if use_async && let Some(script) = instance_script {
        let start = script.content.start().unwrap_or(0) as usize;
        let end = script.content.end().unwrap_or(0) as usize;
        if end > start && end <= source.len() {
            let raw_script = &source[start..end];
            let blocker_map =
                crate::compiler::phases::phase3_transform::shared::async_body::compute_blocker_map(
                    raw_script,
                );
            for name in blocker_map.keys() {
                constant_vars.remove(name);
            }
            top_level_blocker_map = blocker_map;
        }
    }

    EvalInputsRaw {
        constant_vars,
        top_level_blocker_map,
    }
}

/// Check if a JavaScript expression string contains `await` at the expression level
/// (not inside nested function expressions or arrow functions).
/// This is used to detect async expression tags that need special handling.
///
/// Cheap path first: if the word `await` doesn't appear at all, there's
/// nothing to find (this is the common case across the thousands of guard
/// calls). Otherwise prefer the AST predicate (scope-accurate nesting), and
/// fall back to the byte scanner only when the fragment doesn't parse as a
/// standalone module.
pub(crate) fn expr_contains_await(expr: &str) -> bool {
    if memmem::find(expr.as_bytes(), b"await").is_none() {
        return false;
    }
    if let Some(found) = super::await_save_ast::contains_top_level_await(expr) {
        return found;
    }
    expr_contains_await_textual(expr)
}

/// Byte-scanning fallback for [`expr_contains_await`], used when the fragment
/// doesn't parse as a standalone expression.
fn expr_contains_await_textual(expr: &str) -> bool {
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string_literal(bytes, i);
            continue;
        }

        // Skip single-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        // Skip multi-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Check for `function` keyword - skip function body
        if ch == b'f' && i + 8 <= len && &bytes[i..i + 8] == b"function" {
            let next = if i + 8 < len { bytes[i + 8] } else { 0 };
            if next == b' ' || next == b'(' || next == b'*' {
                i += 8;
                // Find the opening brace and skip the body
                while i < len && bytes[i] != b'{' {
                    if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
                        i = skip_string_literal(bytes, i);
                        continue;
                    }
                    i += 1;
                }
                if i < len {
                    i = skip_braces(bytes, i);
                }
                continue;
            }
        }

        // Check for arrow function `=> {` - skip the block body
        if ch == b'=' && i + 1 < len && bytes[i + 1] == b'>' {
            i += 2;
            // Skip whitespace
            while i < len && matches!(bytes[i], b' ' | b'\n' | b'\t' | b'\r') {
                i += 1;
            }
            if i < len && bytes[i] == b'{' {
                i = skip_braces(bytes, i);
                continue;
            }
            continue;
        }

        // Check for `await` keyword
        if ch == b'a' && i + 5 <= len && &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after = if i + 5 < len { bytes[i + 5] } else { 0 };
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }

    false
}

/// Skip a string literal starting at `start` (handling ', ", and ` with interpolation).
pub(crate) fn skip_string_literal(bytes: &[u8], start: usize) -> usize {
    let quote = bytes[start];
    let mut i = start + 1;
    let len = bytes.len();

    if quote == b'`' {
        while i < len {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == b'`' {
                return i + 1;
            }
            if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                i += 2;
                let mut depth = 1i32;
                while i < len && depth > 0 {
                    if bytes[i] == b'{' {
                        depth += 1;
                    } else if bytes[i] == b'}' {
                        depth -= 1;
                    } else if matches!(bytes[i], b'\'' | b'"' | b'`') {
                        i = skip_string_literal(bytes, i);
                        continue;
                    }
                    i += 1;
                }
                continue;
            }
            i += 1;
        }
    } else {
        while i < len {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == quote {
                return i + 1;
            }
            i += 1;
        }
    }

    i
}

/// Skip a matched brace pair `{...}` starting at position of `{`.
fn skip_braces(bytes: &[u8], start: usize) -> usize {
    let mut depth = 1i32;
    let mut i = start + 1;
    let len = bytes.len();

    while i < len && depth > 0 {
        let c = bytes[i];
        if matches!(c, b'\'' | b'"' | b'`') {
            i = skip_string_literal(bytes, i);
            continue;
        }
        if c == b'{' {
            depth += 1;
        } else if c == b'}' {
            depth -= 1;
        }
        i += 1;
    }

    i
}

/// Transform `await expr` patterns inside an expression to use `$.save()`.
/// Converts: `await expr` -> `(await $.save(expr))()`
/// This handles multiple await expressions within the same expression.
///
/// Prefers the AST-based rewrite (`await_save_ast`), which reads each
/// operand's extent from its parsed span and therefore can't mis-bound the
/// operand the way a hand-rolled scanner does (e.g. swallowing a ternary's
/// `: alternate` — issue #1036 bug 2). Falls back to the legacy byte scanner
/// only when the expression doesn't parse cleanly as a standalone expression.
pub(crate) fn transform_await_to_save(expr: &str) -> String {
    if let Some(out) = super::await_save_ast::transform_await_to_save_ast(expr) {
        return out;
    }
    transform_await_to_save_textual(expr)
}

/// Legacy byte-scanning implementation of [`transform_await_to_save`], kept as
/// a fallback for inputs that don't parse as a standalone expression.
fn transform_await_to_save_textual(expr: &str) -> String {
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut result = String::with_capacity(len + 20);
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            let end = skip_string_literal(bytes, i);
            result.push_str(&expr[i..end]);
            i = end;
            continue;
        }

        // Check for `await` keyword
        if ch == b'a' && i + 5 <= len && &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after = if i + 5 < len { bytes[i + 5] } else { 0 };
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                // Found `await` - extract the argument expression
                i += 5;
                // Skip whitespace after `await`
                while i < len && matches!(bytes[i], b' ' | b'\n' | b'\t' | b'\r') {
                    i += 1;
                }
                // Extract the await argument (everything until end of expression,
                // respecting parentheses and operator precedence)
                let arg_start = i;
                let arg_end = find_await_arg_end(bytes, i, len);
                let arg = expr[arg_start..arg_end].trim_end();
                // Recursively transform any nested await expressions within the argument
                let transformed_arg = if expr_contains_await(arg) {
                    transform_await_to_save(arg)
                } else {
                    arg.to_string()
                };
                let _ = write!(result, "(await $.save({}))()", transformed_arg);
                // If the next character is a binary operator (not whitespace/end),
                // add a space to maintain readable formatting.
                if arg_end < len
                    && !matches!(
                        bytes[arg_end],
                        b' ' | b'\t' | b'\n' | b'\r' | b')' | b']' | b',' | b';'
                    )
                {
                    result.push(' ');
                }
                i = arg_end;
                continue;
            }
        }

        result.push(ch as char);
        i += 1;
    }

    result
}

/// Find the end of an `await` argument expression.
///
/// `await` has unary-expression precedence, so it only binds to the
/// immediate operand — **not** to binary/comparison operators beyond it.
/// For example, `await foo > 10` is parsed as `(await foo) > 10`, so
/// the argument to `await` is just `foo`.
///
/// This function scans forward from `start` collecting the operand of
/// `await`.  It stops when it hits a binary operator (`>`, `+`, `&&`,
/// `||`, `??`, etc.) at depth 0, a comma, or end-of-string.
fn find_await_arg_end(bytes: &[u8], start: usize, len: usize) -> usize {
    let mut i = start;
    let mut paren_depth: i32 = 0; // tracks () and []
    let mut brace_depth: i32 = 0; // tracks {}
    // Track whether we've seen a primary expression (identifier, call, etc.)
    // to distinguish unary prefix `-`/`+` from binary `-`/`+`.
    let mut seen_primary = false;

    while i < len {
        let ch = bytes[i];

        // Skip whitespace - don't change seen_primary
        if matches!(ch, b' ' | b'\t' | b'\n' | b'\r') {
            i += 1;
            continue;
        }

        if matches!(ch, b'\'' | b'"' | b'`') {
            i = skip_string_literal(bytes, i);
            seen_primary = true;
            continue;
        }

        match ch {
            b'(' | b'[' => {
                paren_depth += 1;
                // If at depth 0, this starts a grouped expression or call
            }
            b')' | b']' => {
                if paren_depth == 0 && brace_depth == 0 {
                    return i;
                }
                if paren_depth > 0 {
                    paren_depth -= 1;
                }
                if paren_depth == 0 && brace_depth == 0 {
                    seen_primary = true;
                }
            }
            b'{' => brace_depth += 1,
            b'}' => {
                if brace_depth > 0 {
                    brace_depth -= 1;
                    if brace_depth == 0 && paren_depth == 0 {
                        return i + 1; // include the closing }
                    }
                } else if paren_depth == 0 {
                    return i;
                }
            }
            b',' if paren_depth == 0 && brace_depth == 0 => return i,
            // Binary/comparison operators at the top level end the await arg,
            // but only if we've already seen a primary expression (to distinguish
            // unary prefix operators from binary operators).
            b'>' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                // Don't treat `=>` as a binary operator
                if i > 0 && bytes[i - 1] == b'=' {
                    i += 1;
                    continue;
                }
                return i;
            }
            b'<' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                return i;
            }
            b'+' | b'-' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                // Binary + or - (we've already seen a primary expression)
                return i;
            }
            b'*' | b'/' | b'%' | b'^' | b'~'
                if paren_depth == 0 && brace_depth == 0 && seen_primary =>
            {
                // `**` (exponentiation) or single `*`, `/`, `%`, etc.
                return i;
            }
            b'&' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                return i;
            }
            b'|' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                return i;
            }
            b'?' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                // Optional chaining `?.` should NOT end the arg
                if i + 1 < len && bytes[i + 1] == b'.' {
                    i += 2;
                    continue;
                }
                return i;
            }
            b'=' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                if i + 1 < len && bytes[i + 1] == b'=' {
                    return i;
                }
                if i + 1 < len && bytes[i + 1] == b'>' {
                    i += 2;
                    continue;
                }
                return i;
            }
            b'!' if paren_depth == 0 && brace_depth == 0 => {
                if i + 1 < len && bytes[i + 1] == b'=' && seen_primary {
                    return i;
                }
                // Prefix `!` is fine
            }
            _ => {
                // Identifiers, digits, dots, etc. are part of the primary expression
                if paren_depth == 0 && brace_depth == 0 {
                    // Mark as having seen primary when we see an identifier char
                    // followed by something that's NOT an identifier char (end of token)
                    // For simplicity, just mark after any non-whitespace, non-operator char
                    if ch.is_ascii_alphanumeric() || ch == b'_' || ch == b'$' || ch == b'.' {
                        // Part of identifier or member access
                        // We'll set seen_primary after we finish the identifier
                        // For now, advance through the whole identifier
                        while i < len
                            && (bytes[i].is_ascii_alphanumeric()
                                || bytes[i] == b'_'
                                || bytes[i] == b'$'
                                || bytes[i] == b'.')
                        {
                            i += 1;
                        }
                        seen_primary = true;
                        continue;
                    }
                }
            }
        }

        i += 1;
    }

    len
}

/// Check if a property name is a valid JavaScript identifier.
/// If not, it needs to be quoted in object literals.
pub(crate) fn is_valid_js_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let mut chars = name.chars();

    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    // Subsequent characters can also include digits
    for c in chars {
        if !c.is_alphanumeric() && c != '_' && c != '$' {
            return false;
        }
    }

    true
}

/// Strip TypeScript type annotations from snippet parameters.
///
/// Handles cases like:
/// - `n: number` -> `n`
/// - `n` -> `n` (no change)
/// - `{ a, b }: Props` -> `{ a, b }` (destructured with type annotation)
/// - `c?: number` -> `c` (optional parameter)
/// - `c: number = 4` -> `c = 4` (with default value)
/// - `c?: number = 5` -> `c = 5` (optional with default)
///
/// This is needed because snippet parameters in `.svelte` files with `lang="ts"`
/// may include TypeScript type annotations that must not appear in the generated JavaScript.
/// Extract the default-value expression from the text following a destructured
/// snippet parameter pattern, i.e. the `…` in `: Type = …` or `= …`. Returns
/// `None` when there's no default. Tracks bracket / angle depth so a `=` inside
/// a generic type argument (`Map<K = string>`) isn't mistaken for the default
/// separator, and ignores `==` / `=>` / `>=` / `<=` / `!=`.
fn extract_param_default(rest: &str) -> Option<String> {
    let bytes = rest.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'(' | b'[' | b'{' | b'<' => depth += 1,
            b')' | b']' | b'}' | b'>' => depth -= 1,
            b'=' if depth == 0 => {
                let prev = if i > 0 { bytes[i - 1] } else { 0 };
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if !matches!(prev, b'=' | b'!' | b'<' | b'>') && !matches!(next, b'=' | b'>') {
                    let default = rest[i + 1..].trim();
                    return (!default.is_empty()).then(|| default.to_string());
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

pub(crate) fn strip_ts_type_annotation(param: &str) -> String {
    let trimmed = param.trim();

    // Handle destructured parameters: { ... }: Type or [ ... ]: Type
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        let close_char = if trimmed.starts_with('{') { '}' } else { ']' };
        // Find the matching closing bracket
        let mut depth = 0;
        let mut close_pos = None;
        for (i, c) in trimmed.char_indices() {
            match c {
                '{' | '[' => depth += 1,
                '}' | ']' if c == close_char => {
                    depth -= 1;
                    if depth == 0 {
                        close_pos = Some(i);
                        break;
                    }
                }
                _ => {}
            }
        }
        if let Some(pos) = close_pos {
            let pattern = &trimmed[..=pos];
            // After the destructured pattern there may be `: Type`, `= default`,
            // or `: Type = default`. Preserve the default value (M-024) — only
            // the type annotation should be stripped.
            let rest = trimmed[pos + 1..].trim_start();
            if let Some(default) = extract_param_default(rest) {
                return format!("{pattern} = {default}");
            }
            return pattern.to_string();
        }
    }

    // Handle simple identifier with optional marker and type annotation:
    // - `name: Type`
    // - `name?: Type`
    // - `name: Type = default`
    // - `name?: Type = default`
    // - `name = default` (no type annotation, just default)
    //
    // Strategy: extract the identifier name, then check for `= default` after type

    // Check for `?:` (optional typed) or `:` (typed)
    let (ident_end, type_start) =
        if let Some(qc_pos) = memchr::memmem::find(trimmed.as_bytes(), b"?:") {
            // `name?: Type`
            (qc_pos, Some(qc_pos + 2))
        } else if let Some(colon_pos) = trimmed.find(':') {
            let before = trimmed[..colon_pos].trim();
            if is_valid_js_identifier(before) {
                (colon_pos, Some(colon_pos + 1))
            } else {
                // Not a simple identifier before colon (e.g., destructuring rename)
                return trimmed.to_string();
            }
        } else if let Some(q_pos) = trimmed.find('?') {
            // `name?` (optional without type) - strip the `?`
            let before = trimmed[..q_pos].trim();
            if is_valid_js_identifier(before) {
                // Check for `= default` after `?`
                let after = trimmed[q_pos + 1..].trim();
                if let Some(stripped) = after.strip_prefix('=') {
                    return format!("{} = {}", before, stripped.trim());
                }
                return before.to_string();
            }
            return trimmed.to_string();
        } else {
            // No type annotation at all
            return trimmed.to_string();
        };

    let ident = trimmed[..ident_end].trim();

    // Now look for `= default` after the type annotation
    if let Some(ts) = type_start {
        let after_type = trimmed[ts..].trim();
        // Find the `=` that represents the default value.
        // The `=` might be after a type expression like `number = 4`.
        // We need to skip `=>` (arrow function types) and `==`/`===` operators.
        // Also need to handle balanced parens/brackets in the type expression.
        let mut paren_depth = 0i32;
        let mut bracket_depth = 0i32;
        let mut angle_depth = 0i32;
        let bytes = after_type.as_bytes();
        let mut i = 0;
        let mut default_start = None;
        while i < bytes.len() {
            match bytes[i] {
                b'(' => paren_depth += 1,
                b')' => paren_depth -= 1,
                b'[' => bracket_depth += 1,
                b']' => bracket_depth -= 1,
                b'<' => angle_depth += 1,
                b'>' if angle_depth > 0 => angle_depth -= 1,
                b'=' if paren_depth == 0 && bracket_depth == 0 && angle_depth == 0 => {
                    // Check it's not `=>`, `==`, or `===`
                    let next = if i + 1 < bytes.len() { bytes[i + 1] } else { 0 };
                    if next != b'>' && next != b'=' {
                        default_start = Some(i);
                        break;
                    }
                }
                b'\'' | b'"' | b'`' => {
                    let quote = bytes[i];
                    i += 1;
                    while i < bytes.len() && bytes[i] != quote {
                        if bytes[i] == b'\\' {
                            i += 1;
                        }
                        i += 1;
                    }
                }
                _ => {}
            }
            i += 1;
        }
        if let Some(eq_pos) = default_start {
            let default_val = after_type[eq_pos + 1..].trim();
            if !default_val.is_empty() {
                return format!("{} = {}", ident, default_val);
            }
        }
    }

    ident.to_string()
}

// ============================================================================
// Functions extracted from transform_server.rs
// ============================================================================

/// Check if a Script node has `lang="ts"` or `lang="typescript"` attribute.
pub(crate) fn script_is_typescript(script: &Script) -> bool {
    script.attributes.iter().any(|attr| {
        if attr.name == "lang"
            && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
            && let Some(crate::ast::template::AttributeValuePart::Text(text)) = parts.first()
        {
            return text.data == "ts" || text.data == "typescript";
        }
        false
    })
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
pub(crate) fn sanitize_identifier(name: &str) -> String {
    if name.is_empty() {
        return "_".to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    // First character must be a letter, underscore, or dollar sign
    if let Some(first) = chars.next() {
        if first.is_alphabetic() || first == '_' || first == '$' {
            result.push(first);
        } else {
            result.push('_');
        }
    }

    // Subsequent characters can also include digits
    for c in chars {
        if c.is_alphanumeric() || c == '_' || c == '$' {
            result.push(c);
        } else {
            result.push('_');
        }
    }

    result
}

/// Collapse multi-line declarations / function calls into single logical lines.
///
/// `extract_constant_vars` walks the script line by line, but
/// `let url =\n   "https://..."` is one logical statement split across two
/// physical lines. We scan the script while tracking bracket / paren / brace
/// / string depth — when a newline appears at depth > 0 (or directly after
/// an open-paren / `=` with no value yet) we replace it with a single space
/// so the next pass sees a complete declaration. Lines inside strings /
/// template literals are left untouched.
fn join_continuation_lines(script: &str) -> String {
    let bytes = script.as_bytes();
    let mut out = String::with_capacity(script.len());
    let mut depth_paren: i32 = 0;
    let mut depth_brace: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];
        // Line / block comments — copy as-is.
        if b == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
            let s = i;
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
            let s = i;
            i += 2;
            while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < bytes.len() {
                i += 2;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        // String / template literals — copy verbatim. Newlines inside
        // template literals are legal and must not be collapsed.
        if b == b'"' || b == b'\'' || b == b'`' {
            let quote = b;
            let s = i;
            i += 1;
            while i < bytes.len() {
                if bytes[i] == b'\\' && i + 1 < bytes.len() {
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
        if b == b'(' {
            depth_paren += 1;
        } else if b == b')' {
            depth_paren -= 1;
        } else if b == b'{' {
            depth_brace += 1;
        } else if b == b'}' {
            depth_brace -= 1;
        } else if b == b'[' {
            depth_bracket += 1;
        } else if b == b']' {
            depth_bracket -= 1;
        }
        if b == b'\n' {
            // Look back over already-emitted output (skipping trailing
            // spaces / tabs) to see if the previous non-whitespace character
            // is one that suggests the statement continues onto the next
            // line — `=`, `+`, `-`, `,`, `(`, `[`, `{`, `?`, `:`, `&`, `|`,
            // `!` (only as part of `!=`), `<`, `>`, `*`, `/`, `%`, `^`, `~`,
            // a backtick, etc. The most common case we care about is `=`,
            // but covering operators avoids surprises with hand-formatted
            // declarations like `const x = a +\n  b`.
            let prev = out
                .as_bytes()
                .iter()
                .rposition(|c| !c.is_ascii_whitespace())
                .map(|p| out.as_bytes()[p]);
            let in_expr = depth_paren > 0 || depth_bracket > 0 || depth_brace > 0;
            let after_continuation_op = matches!(
                prev,
                Some(
                    b'=' | b'+'
                        | b'-'
                        | b','
                        | b'?'
                        | b':'
                        | b'&'
                        | b'|'
                        | b'<'
                        | b'>'
                        | b'*'
                        | b'/'
                        | b'%'
                        | b'^'
                        | b'~'
                        | b'('
                        | b'['
                        | b'{'
                )
            );
            if in_expr || after_continuation_op {
                out.push(' ');
                i += 1;
                continue;
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

/// Extract constant variable bindings from script content.
/// Try to parse a value as a constant literal and insert into the constants map.
/// Returns true if the value was successfully inserted.
fn try_insert_constant_value(
    value: &str,
    name: &str,
    constants: &mut FxHashMap<String, String>,
) -> bool {
    if value.len() >= 2
        && ((value.starts_with('\'') && value.ends_with('\''))
            || (value.starts_with('"') && value.ends_with('"'))
            || (value.starts_with('`') && value.ends_with('`') && !value.contains("${")))
    {
        let content = &value[1..value.len() - 1];
        constants.insert(name.to_string(), content.to_string());
        true
    } else if value == "true" || value == "false" || value == "null" || value == "undefined" {
        constants.insert(name.to_string(), value.to_string());
        true
    } else if let Ok(n) = value.parse::<i64>() {
        constants.insert(name.to_string(), n.to_string());
        true
    } else if let Ok(n) = value.parse::<f64>() {
        if n.is_finite() {
            constants.insert(name.to_string(), n.to_string());
            true
        } else {
            false
        }
    } else {
        false
    }
}

/// Try to evaluate an expression using known constants.
/// Returns Some(value) if the expression can be fully evaluated.
pub(crate) fn try_evaluate_with_constants(
    expr: &str,
    constants: &FxHashMap<String, String>,
) -> Option<String> {
    let trimmed = expr.trim();

    // Simple variable lookup
    if let Some(value) = constants.get(trimmed) {
        return Some(value.clone());
    }

    // Literal values
    if let Ok(n) = trimmed.parse::<i64>() {
        return Some(n.to_string());
    }
    if let Ok(n) = trimmed.parse::<f64>()
        && n.is_finite()
    {
        return Some(n.to_string());
    }
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        return Some(trimmed[1..trimmed.len() - 1].to_string());
    }

    // Handle binary operators: *, +, -
    // Try * first (higher precedence)
    if let Some(idx) = memchr::memmem::find(trimmed.as_bytes(), b" * ") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 3..].trim();
        if let (Some(l), Some(r)) = (
            try_evaluate_with_constants(left, constants),
            try_evaluate_with_constants(right, constants),
        ) {
            if let (Ok(ln), Ok(rn)) = (l.parse::<i64>(), r.parse::<i64>()) {
                return Some((ln * rn).to_string());
            }
            if let (Ok(ln), Ok(rn)) = (l.parse::<f64>(), r.parse::<f64>())
                && (ln * rn).is_finite()
            {
                let result = ln * rn;
                if result == (result as i64) as f64 {
                    return Some((result as i64).to_string());
                }
                return Some(result.to_string());
            }
        }
    }

    // Handle + (addition or string concatenation)
    // Find the + that's not inside quotes
    if let Some(idx) = find_binary_plus(trimmed) {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 1..].trim();
        if let (Some(l), Some(r)) = (
            try_evaluate_with_constants(left, constants),
            try_evaluate_with_constants(right, constants),
        ) {
            // Try numeric addition first
            if let (Ok(ln), Ok(rn)) = (l.parse::<i64>(), r.parse::<i64>()) {
                return Some((ln + rn).to_string());
            }
            if let (Ok(ln), Ok(rn)) = (l.parse::<f64>(), r.parse::<f64>())
                && (ln + rn).is_finite()
            {
                let result = ln + rn;
                if result == (result as i64) as f64 {
                    return Some((result as i64).to_string());
                }
                return Some(result.to_string());
            }
            // String concatenation
            return Some(format!("{}{}", l, r));
        }
    }

    // Handle - (subtraction)
    // Find - that's a binary operator (not unary minus)
    if let Some(idx) = find_binary_minus(trimmed) {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 1..].trim();
        if let (Some(l), Some(r)) = (
            try_evaluate_with_constants(left, constants),
            try_evaluate_with_constants(right, constants),
        ) && let (Ok(ln), Ok(rn)) = (l.parse::<i64>(), r.parse::<i64>())
        {
            return Some((ln - rn).to_string());
        }
    }

    None
}

/// Find the index of a binary + operator (not inside quotes or after another operator).
fn find_binary_plus(expr: &str) -> Option<usize> {
    let bytes = expr.as_bytes();
    let mut in_single_quote = false;
    let mut in_double_quote = false;
    let mut paren_depth = 0;

    for i in 0..bytes.len() {
        match bytes[i] {
            b'\'' if !in_double_quote => in_single_quote = !in_single_quote,
            b'"' if !in_single_quote => in_double_quote = !in_double_quote,
            b'(' if !in_single_quote && !in_double_quote => paren_depth += 1,
            b')' if !in_single_quote && !in_double_quote => paren_depth -= 1,
            b'+' if !in_single_quote && !in_double_quote && paren_depth == 0 => {
                // Make sure it's a binary +, not unary
                // Check that there's a non-whitespace token before it
                let before = expr[..i].trim_end();
                if !before.is_empty()
                    && !before.ends_with('+')
                    && !before.ends_with('-')
                    && !before.ends_with('*')
                    && !before.ends_with('/')
                    && !before.ends_with('=')
                    && !before.ends_with('(')
                {
                    // Make sure it's not ++ or +=
                    if i + 1 < bytes.len() && (bytes[i + 1] == b'+' || bytes[i + 1] == b'=') {
                        continue;
                    }
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Find the index of a binary - operator (not unary minus).
fn find_binary_minus(expr: &str) -> Option<usize> {
    let bytes = expr.as_bytes();
    let mut in_single_quote = false;
    let mut in_double_quote = false;
    let mut paren_depth = 0;

    for i in 0..bytes.len() {
        match bytes[i] {
            b'\'' if !in_double_quote => in_single_quote = !in_single_quote,
            b'"' if !in_single_quote => in_double_quote = !in_double_quote,
            b'(' if !in_single_quote && !in_double_quote => paren_depth += 1,
            b')' if !in_single_quote && !in_double_quote => paren_depth -= 1,
            b'-' if !in_single_quote && !in_double_quote && paren_depth == 0 => {
                let before = expr[..i].trim_end();
                if !before.is_empty()
                    && !before.ends_with('+')
                    && !before.ends_with('-')
                    && !before.ends_with('*')
                    && !before.ends_with('/')
                    && !before.ends_with('=')
                    && !before.ends_with('(')
                {
                    if i + 1 < bytes.len() && (bytes[i + 1] == b'-' || bytes[i + 1] == b'=') {
                        continue;
                    }
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Strip TypeScript syntax from a $derived inner expression for constant folding.
/// Uses the full TypeScript parser for accurate stripping.
pub(crate) fn strip_ts_from_derived_inner(expr: &str, is_typescript: bool) -> String {
    if !is_typescript {
        return expr.to_string();
    }
    // Wrap as a variable declaration for the TS parser
    let wrapped = format!("var _ = {};", expr);
    let stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(&wrapped);
    // Unwrap back: remove "var _ = " prefix and ";" suffix
    let stripped = stripped.trim();
    if let Some(rest) = stripped.strip_prefix("var _ = ") {
        rest.trim_end_matches(';').trim().to_string()
    } else {
        expr.to_string()
    }
}

/// Extract the inner expression from a rune call like `$state(expr)` or `$derived(expr)`.
/// Returns the inner expression string if the pattern matches.
pub(crate) fn extract_rune_inner(value: &str, prefix: &str) -> Option<String> {
    let trimmed = value.trim();
    if !trimmed.starts_with(prefix) {
        return None;
    }
    let after_prefix = &trimmed[prefix.len()..];
    // Find matching closing paren
    let mut depth = 1i32;
    let mut in_string = false;
    let mut string_char = ' ';
    for (i, c) in after_prefix.char_indices() {
        if (c == '"' || c == '\'' || c == '`')
            && (i == 0 || after_prefix.as_bytes()[i - 1] != b'\\')
        {
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
                    let inner = after_prefix[..i].trim().to_string();
                    if inner.is_empty() {
                        return Some("void 0".to_string());
                    }
                    return Some(inner);
                }
            }
            _ => {}
        }
    }
    None
}

pub(crate) fn extract_constant_vars(script: &str, full_source: &str) -> FxHashMap<String, String> {
    let mut constants = FxHashMap::default();
    let mut let_vars: Vec<String> = Vec::new();
    // Collect unresolved expressions for a second pass
    let mut unresolved: Vec<(String, String, bool)> = Vec::new(); // (name, expr, is_const)

    // Join physical lines into "logical lines" (statements). A declaration
    // like `let url =\n  "https://..."` spans two physical lines but is one
    // statement — collapsing it lets the rest of this function recognise it
    // as `let url = "https://..."`.
    let logical_script = join_continuation_lines(script);

    // First pass: extract constants from non-rune declarations
    for line in logical_script.lines() {
        let trimmed = line.trim();

        // Skip lines with $state, $derived, or $props - these are reactive and
        // require proper scope analysis to constant-fold safely
        let tb = trimmed.as_bytes();
        if memmem::find(tb, b"$state").is_some()
            || memmem::find(tb, b"$derived").is_some()
            || memmem::find(tb, b"$props").is_some()
        {
            continue;
        }

        let is_export = trimmed.starts_with("export ");
        let trimmed = if let Some(rest) = trimmed.strip_prefix("export ") {
            rest.trim_start()
        } else {
            trimmed
        };

        let (decl_start, is_const) = if trimmed.starts_with("const ") {
            (Some(6), true)
        } else if !is_export && trimmed.starts_with("let ") {
            (Some(4), false)
        } else {
            (None, false)
        };

        if let Some(start) = decl_start {
            let rest = &trimmed[start..];

            // Handle comma-separated declarations like `const a = 1, b = 2, c = 3;`
            // Split at top-level commas (not inside brackets/parens)
            let declarators = split_declarators(rest);

            for declarator in &declarators {
                let decl = declarator.trim().trim_end_matches(';');
                if let Some(eq_idx) = decl.find('=') {
                    let name = decl[..eq_idx].trim();
                    let value = decl[eq_idx + 1..].trim();

                    if try_insert_constant_value(value, name, &mut constants) {
                        if !is_const {
                            let_vars.push(name.to_string());
                        }
                    } else {
                        // Save for second pass - might be evaluable once we know more constants
                        unresolved.push((name.to_string(), value.to_string(), is_const));
                    }
                }
            }
        }
    }

    // Second pass: try to evaluate expressions using the constants we've gathered
    for (name, expr, is_const) in &unresolved {
        if let Some(value) = try_evaluate_with_constants(expr, &constants) {
            constants.insert(name.clone(), value);
            if !is_const {
                let_vars.push(name.clone());
            }
        }
    }

    for var_name in &let_vars {
        let bind_pattern = format!("bind:{}", var_name);
        if full_source.contains(&bind_pattern) {
            constants.remove(var_name);
            continue;
        }

        let is_reassigned = full_source.lines().any(|line| {
            let trimmed = line.trim();
            let mut search_start = 0;
            while let Some(pos) = trimmed[search_start..].find(var_name.as_str()) {
                let abs_pos = search_start + pos;
                let after_pos = abs_pos + var_name.len();

                let before_ok = abs_pos == 0 || {
                    let c = trimmed.as_bytes()[abs_pos - 1];
                    !c.is_ascii_alphanumeric() && c != b'_' && c != b'$'
                };

                let after_char_ok = after_pos >= trimmed.len() || {
                    let c = trimmed.as_bytes()[after_pos];
                    !c.is_ascii_alphanumeric() && c != b'_' && c != b'$'
                };

                if before_ok && after_char_ok && after_pos < trimmed.len() {
                    let rest = trimmed[after_pos..].trim_start();

                    // Check if this is a reassignment (not a declaration)
                    // A declaration would be preceded by `let ` or `var ` or `const `
                    let is_decl = abs_pos > 0 && {
                        let before = &trimmed[..abs_pos];
                        let before_trimmed = before.trim();
                        before_trimmed == "let"
                            || before_trimmed == "var"
                            || before_trimmed == "const"
                            || before_trimmed.ends_with(" let")
                            || before_trimmed.ends_with(" var")
                            || before_trimmed.ends_with(" const")
                    };

                    if !is_decl {
                        if (rest.starts_with('=')
                            && !rest.starts_with("==")
                            && !rest.starts_with("=>"))
                            || rest.starts_with("+=")
                            || rest.starts_with("-=")
                            || rest.starts_with("*=")
                            || rest.starts_with("/=")
                        {
                            return true;
                        }
                        if rest.starts_with("++") || rest.starts_with("--") {
                            return true;
                        }
                    }
                }

                search_start = abs_pos + 1;
                if search_start >= trimmed.len() {
                    break;
                }
            }
            false
        });

        if is_reassigned {
            constants.remove(var_name);
        }
    }

    constants
}

/// Split a variable declaration's declarator list by top-level commas.
/// Handles `a = 1, b = 2, c = 3` -> ["a = 1", "b = 2", "c = 3"]
/// Respects nesting: commas inside parens, brackets, braces, strings, and template literals
/// are not treated as separators.
fn split_declarators(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
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
                        i += 1; // skip escaped char
                    }
                    i += 1;
                }
            }
            b'`' => {
                // Template literal - skip to matching backtick
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

/// Find all blocker indices referenced by an expression.
///
/// Scans an expression string for identifiers that appear in the blocker_map
/// and returns a deduplicated, sorted list of blocker indices (for $$promises[N]).
///
/// This is used to determine if an expression tag or if-block test needs to be
/// wrapped in `$$renderer.async()` or `$$renderer.async_block()`.
pub(crate) fn find_expression_blockers(
    expr: &str,
    blocker_map: &rustc_hash::FxHashMap<String, usize>,
) -> Vec<usize> {
    if blocker_map.is_empty() {
        return Vec::new();
    }

    let mut blockers = std::collections::BTreeSet::new();
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string_literal(bytes, i);
            continue;
        }

        // Skip comments
        if ch == b'/' && i + 1 < len {
            if bytes[i + 1] == b'/' {
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            if bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 2;
                continue;
            }
        }

        // Check for identifier start
        if ch.is_ascii_alphabetic() || ch == b'_' || ch == b'$' {
            let start = i;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
            {
                i += 1;
            }
            let ident = &expr[start..i];

            // Check if preceded by a dot (member expression like obj.prop - skip)
            if start > 0 && bytes[start - 1] == b'.' {
                continue;
            }

            if let Some(&blocker_idx) = blocker_map.get(ident) {
                blockers.insert(blocker_idx);
            }
            continue;
        }

        i += 1;
    }

    blockers.into_iter().collect()
}

/// Find const-tag-level blocker expressions for identifiers referenced in a JS expression string.
/// Returns a list of unique blocker expressions (e.g., "promises_2[1]") for variables
/// referenced in the expression that have entries in the const_blocker_map.
pub(crate) fn find_const_expression_blockers(
    expr: &str,
    const_blocker_map: &rustc_hash::FxHashMap<String, String>,
) -> Vec<String> {
    let mut blockers = Vec::new();
    let idents = extract_identifiers_from_js(expr);
    for ident in &idents {
        if let Some(blocker) = const_blocker_map.get(ident)
            && !blockers.contains(blocker)
        {
            blockers.push(blocker.clone());
        }
    }
    blockers
}

/// Extract all identifier names from a JavaScript expression string.
/// Simple lexer that finds word-boundary identifiers, skipping strings and keywords.
fn extract_identifiers_from_js(expr: &str) -> Vec<String> {
    let mut idents = Vec::new();
    let chars: Vec<char> = expr.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < len {
        let c = chars[i];

        // String tracking
        if c == '\'' || c == '"' || c == '`' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Check for identifier start
        if c.is_alphabetic() || c == '_' || c == '$' {
            let start = i;
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let ident: String = chars[start..i].iter().collect();
            // Skip keywords and common builtins
            if !is_js_keyword_or_builtin(&ident) && !idents.contains(&ident) {
                idents.push(ident);
            }
        } else {
            i += 1;
        }
    }

    idents
}

fn is_js_keyword_or_builtin(s: &str) -> bool {
    matches!(
        s,
        "true"
            | "false"
            | "null"
            | "undefined"
            | "this"
            | "new"
            | "typeof"
            | "instanceof"
            | "void"
            | "delete"
            | "in"
            | "of"
            | "let"
            | "const"
            | "var"
            | "function"
            | "class"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "throw"
            | "try"
            | "catch"
            | "finally"
            | "import"
            | "export"
            | "default"
            | "async"
            | "await"
            | "yield"
            | "from"
            | "as"
            | "escape"
    )
}

/// Track whether we're inside a template literal by counting unescaped backticks on a line.
///
/// Used to avoid adding indentation to content inside template literals.
/// Track template literal state across lines.
/// `state` is (in_template, brace_depth) where brace_depth > 0 means inside ${...}.
pub fn update_template_literal_state_for_indent(line: &str, currently_in_template: bool) -> bool {
    let (result, _) = update_template_literal_state_full(line, currently_in_template, 0);
    result
}

/// Full template literal state tracking with brace depth for ${...} expressions.
/// Returns (in_template, brace_depth).
pub fn update_template_literal_state_full(
    line: &str,
    currently_in_template: bool,
    current_brace_depth: i32,
) -> (bool, i32) {
    // All tokens we test (`'`, `"`, `` ` ``, `\`, `{`, `}`, `$`, `/`) are
    // ASCII, so byte indexing is UTF-8 safe.
    let mut in_template = currently_in_template;
    let mut brace_depth = current_brace_depth;
    let bytes = line.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];

        // If we're inside a ${...} expression (brace_depth > 0)
        if brace_depth > 0 {
            if c == b'\'' || c == b'"' {
                // Skip string literals inside the expression
                let quote = c;
                i += 1;
                while i < bytes.len() {
                    if bytes[i] == b'\\' {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == quote {
                        break;
                    }
                    i += 1;
                }
            } else if c == b'`' {
                // Nested template literal inside ${...}
                // For simplicity, skip it by counting backticks
                // (nested template literals are rare in practice)
                i += 1;
                continue;
            } else if c == b'{' {
                brace_depth += 1;
            } else if c == b'}' {
                brace_depth -= 1;
                if brace_depth == 0 {
                    // Closed the ${...} expression, back to template literal text
                    // in_template remains true
                }
            }
            i += 1;
            continue;
        }

        if in_template {
            if c == b'\\' {
                i += 2;
                continue;
            } else if c == b'`' {
                in_template = false;
            } else if c == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                brace_depth = 1;
                i += 2;
                continue;
            }
        } else if c == b'\'' || c == b'"' {
            let quote = c;
            i += 1;
            while i < bytes.len() {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    break;
                }
                i += 1;
            }
        } else if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
            break;
        } else if c == b'`' {
            in_template = true;
        }
        i += 1;
    }
    (in_template, brace_depth)
}

#[cfg(test)]
mod ts_strip_tests {
    use super::strip_ts_type_annotation;

    #[test]
    fn destructured_param_default_is_preserved() {
        // M-024: the trailing `= default` after a destructured TS snippet param
        // must survive type stripping.
        assert_eq!(strip_ts_type_annotation("{ a, b }: Props"), "{ a, b }");
        assert_eq!(
            strip_ts_type_annotation("{ a, b }: Props = {}"),
            "{ a, b } = {}"
        );
        assert_eq!(strip_ts_type_annotation("{ a, b } = {}"), "{ a, b } = {}");
        assert_eq!(
            strip_ts_type_annotation("{ a, b }: Map<string, number> = new Map()"),
            "{ a, b } = new Map()"
        );
        // A `=` inside a generic type arg is not the default separator.
        assert_eq!(strip_ts_type_annotation("{ a }: Foo<T = string>"), "{ a }");
        // Array pattern with default.
        assert_eq!(
            strip_ts_type_annotation("[a, b]: number[] = []"),
            "[a, b] = []"
        );
    }
}

#[cfg(test)]
mod collapse_destructuring_tests {
    use super::{collapse_multiline_destructuring, strip_inline_line_comment};

    // ── strip_inline_line_comment ───────────────────────────────────────────

    #[test]
    fn strip_comment_after_code() {
        assert_eq!(
            strip_inline_line_comment("open = void 0, // If undefined, renders as modal"),
            "open = void 0,"
        );
    }

    #[test]
    fn no_comment_returns_unchanged() {
        assert_eq!(
            strip_inline_line_comment("badgeProps = { color: \"blue\" },"),
            "badgeProps = { color: \"blue\" },"
        );
    }

    #[test]
    fn slash_slash_inside_string_not_stripped() {
        // `//` inside a string literal must NOT be treated as a comment.
        assert_eq!(
            strip_inline_line_comment("url = \"http://example.com\","),
            "url = \"http://example.com\","
        );
    }

    #[test]
    fn pure_comment_line_becomes_empty() {
        assert_eq!(strip_inline_line_comment("// just a comment"), "");
    }

    #[test]
    fn block_comment_followed_by_code_not_stripped() {
        // A `/* … */` block comment before `//` does not confuse the scanner.
        assert_eq!(
            strip_inline_line_comment("/* note */ open = 1, // line comment"),
            "/* note */ open = 1,"
        );
    }

    // ── collapse_multiline_destructuring with inline comment ───────────────

    /// A multi-line `$props()` destructure that contains an interior `//`
    /// line comment (trailing on a property line) must produce a *parseable*
    /// collapsed single line — the `//` must NOT swallow subsequent properties.
    #[test]
    fn inline_comment_in_props_destructure_is_parseable() {
        let input = "\tlet {\n\
                     \t  a = 1,\n\
                     \t  open = void 0, // If undefined, renders inline; if defined, renders as modal\n\
                     \t  badgeProps = { color: \"blue\" },\n\
                     \t  b = 2\n\
                     \t} = $$props;\n";
        let collapsed = collapse_multiline_destructuring(input);
        // The collapsed output must be on one line and must NOT contain `//`
        // (which would make everything after it a comment on that line).
        assert!(
            collapsed.contains("= $$props"),
            "Expected $$props in output: {collapsed:?}"
        );
        // The `//` comment should have been stripped — `badgeProps` must still appear.
        assert!(
            collapsed.contains("badgeProps"),
            "badgeProps was swallowed by inline comment: {collapsed:?}"
        );
        // The line must not contain a `//` that would make subsequent tokens into a comment.
        let single_line = collapsed
            .lines()
            .find(|l| l.contains("= $$props"))
            .unwrap_or("");
        assert!(
            !single_line.contains("//"),
            "Inline comment survived collapse and would swallow following tokens: {single_line:?}"
        );
    }

    /// A `$props()` destructure that has a *pure* comment line (starts with `//`)
    /// in the middle should also collapse correctly (the comment line is already
    /// excluded by the existing logic).
    #[test]
    fn pure_comment_line_in_props_destructure_is_excluded() {
        let input = "\tlet {\n\
                     \t  a = 1,\n\
                     \t  // This is a standalone comment line\n\
                     \t  b = 2\n\
                     \t} = $$props;\n";
        let collapsed = collapse_multiline_destructuring(input);
        assert!(
            collapsed.contains("a = 1") && collapsed.contains("b = 2"),
            "Properties missing after collapsing: {collapsed:?}"
        );
        let single_line = collapsed
            .lines()
            .find(|l| l.contains("= $$props"))
            .unwrap_or("");
        assert!(
            !single_line.contains("//"),
            "Standalone comment line survived collapse: {single_line:?}"
        );
    }

    /// When a `let { ...restProps }: TypeAnnotation & { ... } = $$props`
    /// destructure has a TypeScript type annotation with its own JSDoc block
    /// comment, collapse_multiline_destructuring should still produce a single
    /// collapsed line that contains `= $$props`.
    #[test]
    fn ts_type_annotation_with_jsdoc_collapses_to_single_line() {
        let input = "\tlet {\n\
                     \t\tvalue: valueProp = [],\n\
                     \t\titems = [],\n\
                     \t\t...restProps\n\
                     \t}: Checkbox.GroupProps & {\n\
                     \t\t/**\n\
                     \t\t * The individual checkbox items.\n\
                     \t\t */\n\
                     \t\titems?: string[];\n\
                     \t} = $$props;\n";
        let collapsed = collapse_multiline_destructuring(input);
        let single_line = collapsed
            .lines()
            .find(|l| l.contains("= $$props"))
            .unwrap_or("");
        assert!(
            !single_line.is_empty(),
            "No collapsed line with = $$props found: {collapsed:?}"
        );
        assert!(
            single_line.contains("...restProps"),
            "restProps missing from collapsed line: {single_line:?}"
        );
        assert!(
            single_line.contains("value: valueProp"),
            "value prop missing from collapsed line: {single_line:?}"
        );
    }

    /// transform_props_spread_ex should add $$slots and $$events even when the
    /// destructure has a TypeScript type annotation.
    #[test]
    fn ts_annotated_props_gets_slots_and_events() {
        use super::transform_props_spread_ex;
        let input = "\tlet {\n\
                     \t\tvalue: valueProp = [],\n\
                     \t\titems = [],\n\
                     \t\t...restProps\n\
                     \t}: Checkbox.GroupProps & {\n\
                     \t\t/**\n\
                     \t\t * The individual checkbox items.\n\
                     \t\t */\n\
                     \t\titems?: string[];\n\
                     \t} = $$props;\n";
        let result = transform_props_spread_ex(input, 0, false);
        assert!(
            result.contains("$$slots"),
            "$$slots missing from output: {result:?}"
        );
        assert!(
            result.contains("$$events"),
            "$$events missing from output: {result:?}"
        );
        assert!(
            result.contains("...restProps"),
            "restProps missing from output: {result:?}"
        );
        // TS type annotation must not appear in the output
        assert!(
            !result.contains("Checkbox.GroupProps"),
            "TS type annotation leaked into output: {result:?}"
        );
    }

    /// Regression: when `strip_typescript` re-emits a JSDoc comment that was
    /// inside a TS type annotation on a `$props()` destructure, the comment
    /// lands between the closing `}` of the destructure and `= $$props`.
    /// `collapse_multiline_destructuring` must not break on this — it should
    /// treat the block comment lines as continuations and still produce a single
    /// collapsed line containing `= $$props`, so `transform_props_spread_ex`
    /// can inject `$$slots` / `$$events`.
    ///
    /// Input reproduces what `strip_typescript` emits for:
    ///   let { ..., ...restProps }: SomeType & { /** JSDoc */ items?: ... } = $props()
    /// after the TS annotation is removed but its interior comment is re-emitted.
    #[test]
    fn jsdoc_comment_between_brace_and_equals_does_not_drop_slots_events() {
        use super::transform_props_spread_ex;
        // Simulates the post-strip_typescript form: comment floats between `}` and `= $$props`.
        let input = "\tlet {\n\
                     \t\tvalue: valueProp = [],\n\
                     \t\titems = [],\n\
                     \t\t...restProps\n\
                     \t}\n\
                     \t/**\n\
                     \t * The individual checkbox items.\n\
                     \t */\n\
                     \t= $$props;\n";
        let result = transform_props_spread_ex(input, 0, false);
        assert!(
            result.contains("$$slots"),
            "$$slots missing from output: {result:?}"
        );
        assert!(
            result.contains("$$events"),
            "$$events missing from output: {result:?}"
        );
        assert!(
            result.contains("...restProps"),
            "restProps missing from output: {result:?}"
        );
    }
}

#[cfg(test)]
mod extract_imports_template_literal_tests {
    use super::extract_imports;

    /// Bug A regression: a line inside a template literal that starts with
    /// `import` and ends with a backtick must NOT be hoisted as an import.
    ///
    /// Reproducer: flowbite-svelte +page.svelte has
    /// ```svelte
    /// let importScript = currentTransition !== transitions[0]
    ///   ? ` // script tag
    ///         import { ${currentTransition} } from 'svelte/transition'`
    ///   : "";
    /// ```
    /// The line `` import { ${currentTransition} } from 'svelte/transition'` ``
    /// starts with `import `, has ` from `, and ends with `` ` ``, so it
    /// accidentally matched the "complete import" heuristic. It must be routed
    /// to the script body, not hoisted.
    #[test]
    fn template_literal_import_like_line_is_not_hoisted() {
        let script = r#"
import { blur } from 'svelte/transition';
let importScript =
    currentTransition !== transitions[0]
        ? ` // script tag
                import { ${currentTransition} } from 'svelte/transition'`
        : "";
"#;
        let (imports, rest) = extract_imports(script);
        // Only the real import should be hoisted
        assert_eq!(
            imports.len(),
            1,
            "expected 1 import, got {}: {:?}",
            imports.len(),
            imports
        );
        assert!(
            imports[0].contains("svelte/transition"),
            "hoisted import should be the real one: {:?}",
            imports
        );
        // The template-literal line must appear in the rest body, not vanish
        assert!(
            rest.contains("import { ${currentTransition} }"),
            "template-literal import-like line must remain in rest body: {rest:?}"
        );
    }

    /// Lines entirely inside a multi-line template literal must not be treated
    /// as imports even if they start with `import `.
    #[test]
    fn multiline_template_literal_body_not_hoisted() {
        let script = r#"
import { x } from './mod';
const code = `
import foo from 'bar';
import baz from 'qux';
`;
"#;
        let (imports, rest) = extract_imports(script);
        // Only the single real import should be hoisted
        assert_eq!(
            imports.len(),
            1,
            "expected 1 import, got {}: {:?}",
            imports.len(),
            imports
        );
        // The template literal lines must survive in rest
        assert!(
            rest.contains("import foo from 'bar'"),
            "template-literal body line must remain in rest: {rest:?}"
        );
    }
}
