//! Props, exports, and component property transformations.

use memchr::memmem;
use rustc_hash::FxHashSet;
use std::fmt::Write as _;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::shared::js_scan::{
    after_keywords, code_bytes, ends_inside_line_comment, find_code, skip_opaque,
};
use crate::compiler::phases::phase3_transform::shared::offsets::{
    ByteOffset, CharOffset, CharToByte,
};
use crate::compiler::utils::{is_escaped, is_escaped_char};

use super::scan_index::{ScanIndex, ScanIndexBuilder};
use super::{
    extract_destructured_prop_names, find_matching_paren, get_or_compile_regex,
    is_destructured_param_binding, is_explicit_property_key, is_inside_string_literal,
    is_shadowed_by_function_param, is_shorthand_object_property,
};
use crate::compiler::phases::phase3_transform::shared::substring::Substring;

/// True when the identifier at `var_start` (len `var_len`) is a *binding* in an
/// arrow-function parameter list — `name => …`, `(name) => …`, `(a, name, b) =>
/// …`. Such positions declare a new local that shadows a like-named prop and
/// must not be wrapped as a prop read. Mirrors the `in_param_position` guard the
/// AST version (`prop_source_reads_ast`) applies.
fn is_arrow_param_binding(
    index: &ScanIndex,
    chars: &[char],
    var_start: usize,
    var_len: usize,
) -> bool {
    let answer = is_arrow_param_binding_indexed(index, chars, var_start, var_len);
    if super::super::profile::index_oracle_enabled() {
        super::super::profile::record_index_oracle(
            answer == is_arrow_param_binding_by_scan(chars, var_start, var_len),
        );
    }
    answer
}

fn is_arrow_param_binding_indexed(
    index: &ScanIndex,
    chars: &[char],
    var_start: usize,
    var_len: usize,
) -> bool {
    let after = var_start + var_len;

    // `name => …`  (single param, no parens)
    {
        let mut k = after;
        while k < chars.len() && chars[k].is_whitespace() {
            k += 1;
        }
        if k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>' {
            return true;
        }
    }

    // `( … name … ) => …`. A `;` at the same nesting level rules out a parameter
    // list, and the enclosing bracket has to be a `(` rather than an array or
    // object literal.
    if index.prev_semicolon(var_start).is_some() {
        return false;
    }
    let Some(open) = index.enclosing_any(var_start).filter(|&o| chars[o] == '(') else {
        return false;
    };

    // Must be at a parameter *name* position (preceded by `(` or `,`), not a
    // default-value expression like `(a = prop) =>` where `prop` is a read.
    let mut p = var_start;
    while p > 0 && chars[p - 1].is_whitespace() {
        p -= 1;
    }
    if !(p == 0 || chars[p - 1] == '(' || chars[p - 1] == ',') {
        return false;
    }

    // matching `)` then `=>`
    let Some(close) = index.closer_of(open).filter(|&c| chars[c] == ')') else {
        return false;
    };
    let mut k = close + 1;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }
    k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>'
}

fn is_arrow_param_binding_by_scan(chars: &[char], var_start: usize, var_len: usize) -> bool {
    let after = var_start + var_len;

    // `name => …`  (single param, no parens)
    {
        let mut k = after;
        while k < chars.len() && chars[k].is_whitespace() {
            k += 1;
        }
        if k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>' {
            return true;
        }
    }

    // `( … name … ) => …` : find enclosing `(` at depth 0 (stop at array/object/`;`)
    let mut depth = 0i32;
    let mut j = var_start;
    let mut open = None;
    while j > 0 {
        j -= 1;
        match chars[j] {
            ')' | ']' | '}' => depth += 1,
            '(' if depth == 0 => {
                open = Some(j);
                break;
            }
            '(' => depth -= 1,
            '[' | '{' if depth == 0 => return false,
            '[' | '{' => depth -= 1,
            ';' if depth == 0 => return false,
            _ => {}
        }
    }
    let Some(open) = open else { return false };

    // Must be at a parameter *name* position (preceded by `(` or `,`), not a
    // default-value expression like `(a = prop) =>` where `prop` is a read.
    let mut p = var_start;
    while p > 0 && chars[p - 1].is_whitespace() {
        p -= 1;
    }
    if !(p == 0 || chars[p - 1] == '(' || chars[p - 1] == ',') {
        return false;
    }

    // matching `)` then `=>`
    let mut depth2 = 0i32;
    let mut m = open + 1;
    let mut close = None;
    while m < chars.len() {
        match chars[m] {
            '(' | '[' | '{' => depth2 += 1,
            ')' if depth2 == 0 => {
                close = Some(m);
                break;
            }
            ')' => depth2 -= 1,
            ']' | '}' if depth2 == 0 => return false,
            ']' | '}' => depth2 -= 1,
            _ => {}
        }
        m += 1;
    }
    let Some(close) = close else { return false };
    let mut k = close + 1;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }
    k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>'
}

/// Transform prop reads in an expression to prop() calls.
///
/// For example, `a + b` where `a` and `b` are props becomes `a() + b()`.
pub(super) fn transform_prop_reads_in_expr(expr: &str, prop_vars: &[String]) -> String {
    #[cfg(feature = "measure-prop-reads")]
    crate::measure_prop_reads::record_call();
    if prop_vars.is_empty() {
        #[cfg(feature = "measure-prop-reads")]
        crate::measure_prop_reads::record_empty_props();
        return expr.to_string();
    }

    // Most callers hand us a complete JavaScript expression or statement. Let
    // the AST rewriter handle those in one traversal; this scanner remains only
    // for the incomplete fragments that cannot be parsed in program context.
    if let Some(rewritten) = super::prop_source_reads_ast::wrap_prop_source_reads_ast(
        expr,
        prop_vars,
        &[],
        super::prop_source_reads_ast::ParseGoal::Expression,
    ) {
        return rewritten;
    }

    // Quick pre-check: if none of the prop vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = prop_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(expr, &var_set) {
        #[cfg(feature = "measure-prop-reads")]
        crate::measure_prop_reads::record_no_match();
        return expr.to_string();
    }

    #[cfg(feature = "measure-prop-reads")]
    crate::measure_prop_reads::record_slow(expr.chars().count(), prop_vars.len());

    let mut result = expr.to_string();

    for prop_name in prop_vars {
        // The walk below pushes every character it reads, so a name that does
        // not occur rebuilds the expression unchanged -- at the cost of a
        // `Vec<char>`, an offset table, a scan index and a `String` per name.
        if memmem::find(result.as_bytes(), prop_name.as_bytes()).is_none() {
            continue;
        }

        // Every use below indexes `chars`, so the name's length has to be a
        // character count; `prop_name.len()` is bytes and overshoots for a
        // non-ASCII prop name.
        let prop_len = prop_name.chars().count();

        // Use word boundary matching to replace identifier references
        // But avoid replacing function calls that already have ()
        // Note: Rust's regex crate doesn't support lookahead, so we use a different approach:
        // Match the identifier and check the context manually

        let mut new_result = String::with_capacity(result.len() * 2);
        // The character vector feeds the scanner and the byte table feeds every
        // string slice, keeping those two coordinate systems distinct.
        let mut chars: Vec<char> = Vec::with_capacity(result.len());
        let mut char_boundaries = Vec::with_capacity(result.len());
        let mut builder = ScanIndexBuilder::new();
        let mut prev = None;
        for (byte, c) in result.char_indices() {
            char_boundaries.push(ByteOffset::new(byte));
            builder.feed(chars.len(), c, prev);
            chars.push(c);
            prev = Some(c);
        }
        let char_to_byte =
            CharToByte::from_boundaries(char_boundaries, ByteOffset::end_of(&result));
        let index = builder.finish(&chars);
        #[cfg(feature = "measure-prop-reads")]
        crate::measure_prop_reads::record_pass(chars.len());
        let mut i = 0;

        // Track whether we're inside a string literal to avoid transforming
        // identifiers that happen to appear inside strings (e.g., 'paths updated')
        let mut in_string: Option<char> = None; // None or Some('\'') or Some('"') or Some('`')
        let mut template_brace_depth: Vec<i32> = Vec::new();

        while i < chars.len() {
            let c = chars[i];

            // Track string literal state
            if let Some(quote) = in_string {
                new_result.push(c);
                if c == '\\' && i + 1 < chars.len() {
                    // Skip escaped character
                    i += 1;
                    new_result.push(chars[i]);
                    i += 1;
                    continue;
                }
                if quote == '`' && c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                    // Enter template literal interpolation
                    new_result.push(chars[i + 1]);
                    template_brace_depth.push(0);
                    in_string = None;
                    i += 2;
                    continue;
                }
                if c == quote {
                    in_string = None;
                }
                i += 1;
                continue;
            }

            // Track template literal brace depth
            if !template_brace_depth.is_empty() {
                if c == '{' {
                    if let Some(depth) = template_brace_depth.last_mut() {
                        *depth += 1;
                    }
                } else if c == '}' {
                    let should_pop = template_brace_depth
                        .last()
                        .map(|d| *d == 0)
                        .unwrap_or(false);
                    if should_pop {
                        template_brace_depth.pop();
                        in_string = Some('`');
                        new_result.push(c);
                        i += 1;
                        continue;
                    } else if let Some(depth) = template_brace_depth.last_mut() {
                        *depth -= 1;
                    }
                }
            }

            // A quote inside a comment is text: an apostrophe in `// it's not
            // defined` would otherwise open a string that nothing closes, and
            // every identifier after it would be left untransformed.
            if c == '/' && i + 1 < chars.len() && (chars[i + 1] == '/' || chars[i + 1] == '*') {
                let line = chars[i + 1] == '/';
                new_result.push(c);
                new_result.push(chars[i + 1]);
                i += 2;
                while i < chars.len() {
                    if line {
                        if chars[i] == '\n' {
                            break;
                        }
                    } else if chars[i] == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                        new_result.push(chars[i]);
                        new_result.push(chars[i + 1]);
                        i += 2;
                        break;
                    }
                    new_result.push(chars[i]);
                    i += 1;
                }
                continue;
            }

            // A regex literal is not code either: the escaped slash and the
            // closing slash of `/^https?:\/\//` sit next to each other, so
            // without this the `//` reads as a comment and every identifier
            // after it is left untransformed.
            let byte_at = char_to_byte.byte(CharOffset::new(i));
            if c == '/'
                && let Some((end, false)) = skip_opaque(
                    result.as_bytes(),
                    byte_at.get(),
                    prev_code_byte(result.as_bytes(), byte_at.get()),
                )
            {
                let literal = byte_at.to(ByteOffset::new(end), &result);
                new_result.push_str(literal);
                i += literal.chars().count();
                continue;
            }

            // Check for string literal start
            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                new_result.push(c);
                i += 1;
                continue;
            }

            // Check if we're at the start of the identifier
            let remaining = char_to_byte.byte(CharOffset::new(i)).after(&result);
            if remaining.starts_with(prop_name) {
                // Check character before (must be non-identifier char or start of string)
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev_char = chars[i - 1];
                    // Dot means property access (e.g., items.filter) - don't transform
                    // But allow spread operator (...filter)
                    if prev_char == '.' {
                        // Check if it's a spread operator (...)
                        i >= 3 && chars[i - 3..i].iter().collect::<String>() == "..."
                    } else {
                        !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
                    }
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + prop_len;
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if this is a target of an update expression (++ or --)
                // e.g., x++ or ++x - these should not be wrapped with ()
                // as they need special $.update_prop() handling
                let is_update_target = {
                    // Check for postfix ++ or --
                    let has_postfix = after_idx + 1 < chars.len()
                        && ((chars[after_idx] == '+' && chars[after_idx + 1] == '+')
                            || (chars[after_idx] == '-' && chars[after_idx + 1] == '-'));
                    // Check for prefix ++ or --
                    let has_prefix = i >= 2
                        && ((chars[i - 2] == '+' && chars[i - 1] == '+')
                            || (chars[i - 2] == '-' && chars[i - 1] == '-'));
                    has_postfix || has_prefix
                };

                // Check if this is on the left side of an assignment
                let is_assignment_target = {
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    if k < chars.len() && chars[k] == '=' {
                        // Make sure it's not == or ===
                        !(k + 1 < chars.len() && chars[k + 1] == '=')
                    } else {
                        k + 1 < chars.len()
                            && chars[k + 1] == '='
                            && (chars[k] == '+'
                                || chars[k] == '-'
                                || chars[k] == '*'
                                || chars[k] == '/')
                    }
                };

                // Check if this identifier is inside a $.update_prop() or similar call
                // After transform_prop_update_expressions runs, we get $.update_prop(x)
                // and we must not convert x to x() inside that call
                let is_inside_update_call = {
                    let prefix_str = char_to_byte.byte(CharOffset::new(i)).before(&result);
                    prefix_str.ends_with("$.update_prop(")
                        || prefix_str.ends_with("$.update_pre_prop(")
                        || prefix_str.ends_with("$.update_prop(")
                        || prefix_str.ends_with("$.update_pre_prop(")
                };

                // Check if this identifier is the sole argument to `$.derived(`.
                // The unthunk optimization converts `$derived(propName)` to `$.derived(propName)`
                // where propName is a prop source (getter function) that's equivalent to the
                // derived computation. In this case we must NOT append `()`.
                let is_sole_derived_arg = {
                    let prefix_str = char_to_byte.byte(CharOffset::new(i)).before(&result);
                    if prefix_str.ends_with("$.derived(") {
                        // Check that after the identifier is just `)` (possibly preceded by whitespace)
                        let mut k = after_idx;
                        while k < chars.len() && chars[k].is_whitespace() {
                            k += 1;
                        }
                        k < chars.len() && chars[k] == ')'
                    } else {
                        false
                    }
                };

                // The remaining guards are the expensive ones, so they sit behind
                // the cheap character checks rather than beside them:
                // - shadowed by a function parameter;
                // - an explicit object-literal property KEY (`{ foo: bar }`),
                //   which is not a value read — `{ foo(): bar }` is invalid JS
                //   (shorthand `{ foo }` is expanded to `{ foo: foo() }` below);
                // - the BINDING in an arrow-function parameter list (`name =>`,
                //   `(a, name) =>`), which declares a new local shadowing the
                //   prop — `(name()) =>` is invalid syntax;
                // - a binding slot of a DESTRUCTURING parameter pattern
                //   (`({ name }) =>`, `([name]) =>`), which is the same
                //   declaration one bracket in — `({ name: name() }) =>` is not
                //   a binding pattern.
                // Under the oracle every guard is asked at every candidate
                // position, not only where the cheap checks let the question
                // through, so the comparison covers the guards themselves rather
                // than the subset of call sites that survive short-circuiting.
                if super::super::profile::index_oracle_enabled() {
                    is_shadowed_by_function_param(&index, &chars, i, prop_name);
                    is_explicit_property_key(&index, &chars, i, prop_len);
                    is_arrow_param_binding(&index, &chars, i, prop_len);
                    is_shorthand_object_property(&index, &chars, i, prop_len);
                }

                if before_ok
                    && after_ok
                    && !is_update_target
                    && !is_assignment_target
                    && !is_inside_update_call
                    && !is_sole_derived_arg
                    && !is_shadowed_by_function_param(&index, &chars, i, prop_name)
                    && !is_explicit_property_key(&index, &chars, i, prop_len)
                    && !is_arrow_param_binding(&index, &chars, i, prop_len)
                    && !is_destructured_param_binding(&index, &chars, i)
                {
                    // Check if this is a shorthand property in an object literal.
                    // e.g., `{ value }` should become `{ value: value() }` not `{ value() }`
                    // because `{ value() }` is a method definition, not a property.
                    let is_shorthand = is_shorthand_object_property(&index, &chars, i, prop_len);

                    if is_shorthand {
                        // Expand shorthand: { foo } -> { foo: foo() }
                        new_result.push_str(prop_name);
                        new_result.push_str(": ");
                        new_result.push_str(prop_name);
                        new_result.push_str("()");
                    } else {
                        // Replace with prop_name()
                        new_result.push_str(prop_name);
                        new_result.push_str("()");
                    }
                    i += prop_len;
                    continue;
                }
            }

            // No match, just copy the character
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Transform a `let` declaration that contains variables re-exported via `export { ... }`.
///
/// For example: `let a, b, c, d;` with `export { a, c }` becomes:
/// ```text
/// let a = $.prop($$props, 'a', 8);
/// let b;
/// let c = $.prop($$props, 'c', 8);
/// let d;
/// ```
///
/// Returns `Some(transformed)` if the declaration contains any BindableProp vars,
/// or `None` if no transformation is needed.
pub(super) fn transform_let_with_reexported_props(
    line: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
) -> Option<String> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let trimmed = line.trim();

    // Handle `let` / `var` declarations (a re-exported `var d` keeps its `var`
    // keyword — upstream only rewrites the initializer to `$.prop(...)`).
    let kw = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };

    // Preserve the leading whitespace from the original line
    let leading_ws: &str = &line[..line.len() - line.trim_start().len()];

    let rest_raw = trimmed[4..].trim();
    // Same as `transform_export_let`: `declaration_split` puts a comment the
    // declaration carried between the keyword and the declarator, and this
    // function rebuilds the declaration from its own text.
    let (declaration_comments, rest_raw) = split_own_line_leading_comments(rest_raw);
    // Strip trailing JS comments (// and /* */) before splitting declarators so that
    //   `let name; // comment`
    // does not produce `name; // comment` as the declarator name.
    let rest_stripped = strip_js_comments(rest_raw);
    let rest = rest_stripped.trim().trim_end_matches(';').trim();

    // Split by commas (respecting nesting)
    let declarators = split_declarators(rest);

    // Check if any declarator is a BindableProp (including destructured patterns)
    let has_any_prop = declarators.iter().any(|decl| {
        let decl = decl.trim();
        if decl.starts_with('{') || decl.starts_with('[') {
            // Destructured pattern - check if any extracted name is a BindableProp
            let names = extract_destructured_prop_names(decl);
            names.iter().any(|name| {
                analysis
                    .root
                    .find_binding_any_scope(name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp)
            })
        } else {
            let name = if let Some(eq_pos) = decl.find('=') {
                decl[..eq_pos].trim()
            } else {
                decl
            };
            analysis
                .root
                .find_binding_any_scope(name)
                .and_then(|idx| analysis.root.bindings.get(idx))
                .is_some_and(|b| b.kind == BindingKind::BindableProp)
        }
    });

    if !has_any_prop {
        return None;
    }

    let mut results = Vec::new();

    for decl in declarators {
        let decl = decl.trim();
        if decl.is_empty() {
            continue;
        }

        // Handle destructured patterns: let { a, b, c } = { ... }
        if decl.starts_with('{') || decl.starts_with('[') {
            if let Some(pattern_end) = find_destructuring_pattern_end(decl) {
                let pattern = decl[..pattern_end].trim();
                let rhs_part = decl[pattern_end..].trim();
                if let Some(rhs) = rhs_part.strip_prefix('=') {
                    let rhs = rhs.trim().trim_end_matches(';').trim();
                    // Upstream merges `tmp = rhs` and all the flattened declarators into a
                    // SINGLE `let` VariableDeclaration with comma-separated declarators.
                    // The continuation declarators are indented by `leading_ws + "  "`.
                    let continuation_ws = format!("{}  ", leading_ws);
                    if let Some(flat_decls) =
                        flatten_destructured_let_as_declarators(pattern, "tmp", analysis)
                    {
                        // Build: `  let tmp = rhs,\n    a = ...,\n    b = ...,\n    c = ...;`
                        let mut merged = format!("{}let tmp = {}", leading_ws, rhs);
                        for d in &flat_decls {
                            merged.push_str(",\n");
                            merged.push_str(&continuation_ws);
                            merged.push_str(d);
                        }
                        merged.push(';');
                        results.push(merged);
                    } else {
                        // Fallback for non-ObjectPattern (e.g. ArrayPattern)
                        results.push(format!("{}let tmp = {};", leading_ws, rhs));
                        if let Some(flattened) =
                            flatten_destructured_let_with_reexported_props(pattern, "tmp", analysis)
                        {
                            results.push(flattened);
                        } else {
                            results.push(format!("{}let {} = {};", leading_ws, pattern, rhs));
                        }
                    }
                    continue;
                }
            }
            // Fallback
            results.push(format!("{}let {};", leading_ws, decl));
            continue;
        }

        // Parse: name = value or just name
        let (name, value) = if let Some(eq_pos) = decl.find('=') {
            let n = decl[..eq_pos].trim();
            let v = decl[eq_pos + 1..].trim();
            // Remove trailing line comment if present
            let v = if let Some(comment_pos) = find_line_comment_position(v) {
                v[..comment_pos].trim()
            } else {
                v
            };
            let v = v.trim_end_matches(';').trim();
            (n, Some(v))
        } else {
            (decl, None)
        };

        // Check if this variable is a BindableProp
        let is_prop = analysis
            .root
            .find_binding_any_scope(name)
            .and_then(|idx| analysis.root.bindings.get(idx))
            .is_some_and(|b| b.kind == BindingKind::BindableProp);

        if is_prop {
            // Get the prop alias if any
            let prop_alias = analysis
                .root
                .find_binding_any_scope(name)
                .and_then(|idx| analysis.root.bindings.get(idx))
                .and_then(|b| b.prop_alias.as_deref());
            let prop_name = prop_alias.unwrap_or(name);

            if let Some(val) = value {
                // Check if the value is simple.
                // An identifier is NOT simple if it refers to another prop/state variable
                // because after transforms it would become a function call (e.g., v2 -> v2()).
                // The official compiler checks is_simple_expression on the VISITED (transformed)
                // expression, where prop identifiers become CallExpressions.
                let mut is_simple = is_simple_expression_str(val, analysis, dev);
                // Track if the identifier refers to a prop (it will be a no-arg call after transform,
                // and the official compiler unwraps no-arg calls to just the callee)
                let mut is_prop_ref = false;
                // A bare reactive-binding identifier is a no-arg getter call after
                // transform (`val()`); the official compiler unwraps it to the bare
                // callee. This must fire regardless of `is_simple` — which is now
                // false for such an identifier (it is non-simple, like upstream's
                // visited CallExpression) — otherwise it would be thunked instead.
                if is_identifier_str(val)
                    && analysis
                        .root
                        .find_binding_any_scope(val)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| {
                            matches!(
                                b.kind,
                                BindingKind::BindableProp
                                    | BindingKind::Prop
                                    | BindingKind::State
                                    | BindingKind::RawState
                                    | BindingKind::Derived
                            )
                        })
                {
                    is_simple = false;
                    is_prop_ref = true;
                }
                // A bare legacy `$:` reactive variable (`BindingKind::LegacyReactive`)
                // becomes `$.get(name)` after transform — a MEMBER call, not a
                // no-arg identifier getter — so it is non-simple and must be
                // THUNKED (`() => $.get(name)`), not unwrapped to a bare callee
                // like a prop ref. Mirrors upstream applying the transform before
                // `is_simple_expression` (the visited CallExpression is non-simple,
                // and its callee `$.get` is a MemberExpression so it falls through
                // to `b.thunk(initial)`).
                if is_simple
                    && is_identifier_str(val)
                    && analysis
                        .root
                        .find_binding_any_scope(val)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| matches!(b.kind, BindingKind::LegacyReactive))
                {
                    is_simple = false;
                    // is_prop_ref stays false → thunk path
                }
                let flags = calculate_prop_flags(name, analysis, !is_simple);
                if is_simple {
                    results.push(format!(
                        "{}{} {} = $.prop($$props, '{}', {}, {});",
                        leading_ws, kw, name, prop_name, flags, val
                    ));
                } else if is_prop_ref {
                    // Prop/state identifier: after transform it becomes val() (no-arg call).
                    // The official compiler unwraps no-arg calls to just the callee,
                    // so we pass the identifier directly.
                    results.push(format!(
                        "{}{} {} = $.prop($$props, '{}', {}, {});",
                        leading_ws, kw, name, prop_name, flags, val
                    ));
                } else {
                    let lazy_arg = make_lazy_prop_arg(val);
                    results.push(format!(
                        "{}{} {} = $.prop($$props, '{}', {}, {});",
                        leading_ws, kw, name, prop_name, flags, lazy_arg
                    ));
                }
            } else {
                let flags = calculate_prop_flags(name, analysis, false);
                results.push(format!(
                    "{}{} {} = $.prop($$props, '{}', {});",
                    leading_ws, kw, name, prop_name, flags
                ));
            }
        } else {
            // Non-exported variable, keep as-is
            if let Some(val) = value {
                results.push(format!("{}{} {} = {};", leading_ws, kw, name, val));
            } else {
                results.push(format!("{}{} {};", leading_ws, kw, name));
            }
        }
    }

    reprint_declaration_comments(&mut results, &declaration_comments, leading_ws, kw);

    Some(results.join("\n"))
}

/// Print the comments a rebuilt declaration carried back between its keyword and
/// its first declarator, which is where esrap flushes them.
fn reprint_declaration_comments(
    results: &mut [String],
    comments: &[(String, bool)],
    leading_ws: &str,
    kw: &str,
) {
    if comments.is_empty() {
        return;
    }
    let Some(first) = results.first_mut() else {
        return;
    };
    let Some(tail) = first.strip_prefix(&format!("{leading_ws}{kw} ")) else {
        return;
    };
    let mut rebuilt = format!("{leading_ws}{kw} ");
    for (comment, own_line) in comments {
        rebuilt.push_str(comment);
        // A comment that shared the declarator's line was written there and
        // keeps that line; only one that ended its own line breaks.
        if *own_line {
            rebuilt.push('\n');
            rebuilt.push_str(leading_ws);
        } else {
            rebuilt.push(' ');
        }
    }
    rebuilt.push_str(tail);
    *first = rebuilt;
}

/// Apply prop source read transformations inside the default value of $.prop() calls.
///
/// `wrap_prop_source_reads` skips lines containing `$.prop(`, so this function specifically
/// handles the default value expressions inside `$.prop($$props, 'name', flags, DEFAULT)`.
/// This is needed when export-let default values contain references to other props,
/// e.g.: `export let click_1 = () => { logs.push('click_1'); }`
/// where `logs` is a prop and should become `logs()` inside the default value.
pub(super) fn apply_prop_reads_in_prop_default_values(line: &str, prop_vars: &[String]) -> String {
    if let Some(rewritten) =
        super::prop_source_reads_ast::wrap_prop_reads_in_defaults_ast(line, prop_vars)
    {
        return rewritten;
    }

    // A malformed intermediate cannot be parsed into spans. Keep this legacy
    // path only for that explicitly unparseable fallback.
    // Split $.prop() calls into prefix + default-value + suffix, transform the default value only.
    // The pattern is: $.prop($$props, 'name', N, DEFAULT)
    // We find each $.prop( and extract the 4th argument.
    let mut result = String::new();
    let mut search_from = 0;

    while let Some(prop_pos) = memmem::find(&line.as_bytes()[search_from..], b"$.prop(") {
        let abs_pos = search_from + prop_pos;

        // Copy everything before this $.prop( unchanged
        result.push_str(&line[search_from..abs_pos]);

        // Parse the $.prop(...) call to find the 4th argument
        let after_prop = &line[abs_pos + 7..]; // after "$.prop("
        let chars: Vec<char> = after_prop.chars().collect();
        let mut i = 0;
        let mut depth = 1i32;
        let mut arg_count = 0;
        let mut fourth_arg_start: Option<CharOffset> = None;
        let mut fourth_arg_end: Option<CharOffset> = None;
        let mut in_string: Option<char> = None;
        let char_to_byte = CharToByte::new(after_prop);

        while i < chars.len() {
            let c = chars[i];

            // Handle strings
            if let Some(quote) = in_string {
                if c == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if c == quote {
                    in_string = None;
                }
                i += 1;
                continue;
            }

            match c {
                '"' | '\'' | '`' => {
                    in_string = Some(c);
                }
                '(' | '[' | '{' => depth += 1,
                ')' | ']' | '}' => {
                    depth -= 1;
                    if depth == 0 {
                        // End of $.prop() call
                        if fourth_arg_start.is_some() {
                            fourth_arg_end = Some(CharOffset::new(i));
                        }
                        break;
                    }
                }
                ',' if depth == 1 => {
                    arg_count += 1;
                    if arg_count == 3 {
                        // The 4th argument starts after this comma
                        // Skip any whitespace
                        let mut j = i + 1;
                        while j < chars.len() && chars[j].is_whitespace() {
                            j += 1;
                        }
                        fourth_arg_start = Some(CharOffset::new(j));
                    }
                }
                _ => {}
            }
            i += 1;
        }

        // Now reconstruct the $.prop() call with transformed 4th arg
        if let (Some(start_char), Some(end_char)) = (fourth_arg_start, fourth_arg_end) {
            let start_byte = char_to_byte.byte(start_char);
            let end_byte = char_to_byte.byte(end_char);
            let before_default = start_byte.before(after_prop);
            let default_val = start_byte.to(end_byte, after_prop);

            // A default value that is EXACTLY a bare prop identifier is the lazy
            // getter reference upstream passes directly (`get_prop_source`
            // unwraps a zero-arg call back to its callee, so `prop` stays `prop`,
            // NOT `prop()`). Leave it bare — only wrap prop reads NESTED inside a
            // larger default (e.g. `() => { logs.push(…) }`).
            let default_trimmed = default_val.trim();
            let transformed_default = if is_identifier_str(default_trimmed)
                && prop_vars.iter().any(|p| p == default_trimmed)
            {
                default_val.to_string()
            } else {
                super::prop_source_reads_ast::wrap_prop_source_reads_ast(
                    default_val,
                    prop_vars,
                    &[],
                    super::prop_source_reads_ast::ParseGoal::Expression,
                )
                .unwrap_or_else(|| default_val.to_string())
            };
            result.push_str("$.prop(");
            result.push_str(before_default);
            result.push_str(&transformed_default);
            // Continue parsing from after the closing paren
            let close_byte = char_to_byte.byte(end_char.next());
            result.push_str(end_byte.to(close_byte, after_prop));
            search_from = abs_pos + 7 + close_byte.get();
        } else {
            // No 4th arg found, copy $.prop(...) as-is
            result.push_str("$.prop(");
            // Find where the $.prop() call ends
            if let Some(end_char) = {
                let mut ec = None;
                let mut d = 1i32;
                let mut s: Option<char> = None;
                for (ci, ch) in chars.iter().enumerate() {
                    if let Some(q) = s {
                        if *ch == q {
                            s = None;
                        }
                        continue;
                    }
                    match ch {
                        '"' | '\'' | '`' => s = Some(*ch),
                        '(' | '[' | '{' => d += 1,
                        ')' | ']' | '}' => {
                            d -= 1;
                            if d == 0 {
                                ec = Some(CharOffset::new(ci));
                                break;
                            }
                        }
                        _ => {}
                    }
                }
                ec
            } {
                let end_byte = char_to_byte.byte(end_char.next());
                result.push_str(end_byte.before(after_prop));
                search_from = abs_pos + 7 + end_byte.get();
            } else {
                result.push_str(after_prop);
                search_from = line.len();
            }
        }
    }

    // Copy remaining
    result.push_str(&line[search_from..]);
    result
}

/// Apply the store subscription transforms inside the default value of
/// `$.prop()` calls, in the order the ordinary instance body applies them:
/// `transform_store_sub_calls`, then the **assignments**, then the reads.
///
/// The middle step was missing, so a store write in a default value was emitted
/// verbatim and `$store() = 1` reached the output — text no JS parser accepts.
/// The default value is located by span rather than by counting commas, which
/// also retires the fourth copy of that character loop.
pub(super) fn apply_store_transforms_in_prop_default_values(
    line: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> String {
    use super::store_transforms::{
        transform_store_assignments_client, transform_store_reads_client, transform_store_sub_calls,
    };

    if store_sub_vars.is_empty() {
        return line.to_string();
    }
    super::prop_source_reads_ast::map_prop_default_values(line, |default| {
        let after_subs = transform_store_sub_calls(default, store_sub_vars);
        let after_assigns = transform_store_assignments_client(
            &after_subs,
            store_sub_vars,
            prop_vars,
            state_vars,
            non_reactive_state_vars,
            invalidate_bodies,
        );
        Some(as_expression(
            default,
            transform_store_reads_client(&after_assigns, store_sub_vars),
        ))
    })
    .unwrap_or_else(|| line.to_string())
}

/// A default value is an argument, so it is an expression and can never end in
/// a `;`. The update rewriter parses its input as a PROGRAM and re-prints it,
/// which appends the statement terminator an expression must not carry.
fn as_expression(before: &str, after: String) -> String {
    if before.trim_end().ends_with(';') {
        return after;
    }
    match after.trim_end().strip_suffix(';') {
        Some(trimmed) => trimmed.to_string(),
        None => after,
    }
}

/// Apply the prop **write** transforms inside the default value of `$.prop()`
/// calls.
///
/// Upstream has no default-value special case at all: a default is visited by
/// the same `AssignmentExpression` / `UpdateExpression` visitors as any other
/// expression. rsvelte reaches it through `transform_prop_assignments`, which
/// skips any line containing `$.prop(`, so the default needs its own entry —
/// which is why the read side already has two.
pub(super) fn apply_prop_writes_in_prop_default_values(
    line: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
    prop_invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> String {
    use super::reactive_transforms::transform_prop_update_expressions;
    use super::state_transforms::transform_prop_assignments;

    if prop_vars.is_empty() {
        return line.to_string();
    }
    super::prop_source_reads_ast::map_prop_default_values(line, |default| {
        let after_updates = transform_prop_update_expressions(default, prop_vars);
        let after_assigns = transform_prop_assignments(
            &after_updates,
            prop_vars,
            non_bindable_prop_vars,
            prop_invalidate_bodies,
        )
        .into_owned();
        Some(as_expression(default, after_assigns))
    })
    .unwrap_or_else(|| line.to_string())
}

pub(super) fn transform_export_let(line: &str, analysis: &ComponentAnalysis, dev: bool) -> String {
    // Strip leading block comments so that a declaration like:
    //   `/* ... */ export let name = value;`
    // (where `/* ... */` may span multiple lines) is still recognised and
    // transformed.  We feed the comment-stripped text to the kw detector but
    // keep the original `line` / `leading_ws` for everything else so that the
    // caller's indentation is preserved.
    let trimmed_full = line.trim();

    // Walk past any leading `/* ... */` blocks to find the actual `export let/var`.
    let mut trimmed = trimmed_full;
    let mut leading_comment = "";
    while trimmed.starts_with("/*") {
        if let Some(end) = trimmed.find_sub("*/") {
            let comment_end = end + 2;
            leading_comment = &trimmed_full[..trimmed_full.len() - trimmed.len() + comment_end];
            trimmed = trimmed[comment_end..].trim_start();
        } else {
            break;
        }
    }

    // Pattern: `export let name = value;` / `export var name = value;` / `export let name;`
    // Upstream keeps the source declaration keyword (`export var` → `var`),
    // rewriting only the initializer to `$.prop(...)`.
    // The separator between `export` and the declaration keyword is any run of
    // JS whitespace, not the single ASCII space a literal needle bakes in
    // (#3470).
    let (kw, declarator_at) = if let Some(at) = after_keywords(trimmed, &["export", "let"]) {
        ("let", at)
    } else if let Some(at) = after_keywords(trimmed, &["export", "var"]) {
        ("var", at)
    } else {
        return line.to_string();
    };

    // If there was a leading block comment, find the position of `export` in the
    // original `line` and split:
    //   - `comment_prefix`: all original text before `export` (trimmed of trailing
    //     space between `**/` and `export`), followed by a newline
    //   - `leading_ws`: the file-level indentation (leading whitespace of the line
    //     that contains `export`), so the transformed declaration gets proper indent
    let (comment_prefix, leading_ws_string): (String, String) = if !leading_comment.is_empty() {
        if let Some(export_pos) = line.rfind_sub("export ") {
            // Everything before `export` (trimmed of the separating space).
            let before_export = &line[..export_pos];
            let prefix_text = before_export.trim_end();
            let prefix = format!("{}\n", prefix_text);

            // Find the start of the source line that contains `export`.
            let line_start = before_export.rfind('\n').map(|p| p + 1).unwrap_or(0);
            // The indentation = leading whitespace of that line.
            let line_content = &line[line_start..export_pos];
            let ws_len = line_content.len()
                - line_content
                    .trim_start_matches(|c: char| c.is_ascii_whitespace())
                    .len();
            let indent = line[line_start..line_start + ws_len].to_string();
            (prefix, indent)
        } else {
            (
                String::new(),
                line[..line.len() - line.trim_start().len()].to_string(),
            )
        }
    } else {
        (
            String::new(),
            line[..line.len() - line.trim_start().len()].to_string(),
        )
    };
    let leading_ws = leading_ws_string.as_str();

    // Extract the declaration body after `export let ` / `export var `.
    // `trimmed` already points past any leading block comment.
    let rest_raw = trimmed[declarator_at..].trim();

    // `declaration_split` moves a comment that led the source declaration to
    // between the keyword and the declarator, because upstream rebuilds a split
    // declaration and esrap flushes its comments at the first located node
    // inside it. Keep it while the declarators are parsed, and print it back
    // there rather than losing it to `strip_js_comments` below.
    let (declaration_comments, rest_raw) = split_own_line_leading_comments(rest_raw);

    // esrap flushes a same-line comment after the source declaration on the
    // initializer node. Once that initializer becomes the final `$.prop`
    // argument, the comment therefore belongs inside the generated call. Keep
    // it separately while the comment-free declaration is split below.
    // `rest_raw` is the whole declaration, so a `//` after its last code byte is
    // trailing whatever ends there — and a declaration is delimited by ASI as
    // readily as by a `;`, which is what an `ends_with(';')` test cannot see.
    let trailing_line_comment = rest_raw.rsplit('\n').next().and_then(|last_line| {
        let comment_at = find_line_comment_position(last_line)?;
        (!last_line[..comment_at].trim().is_empty()).then(|| last_line[comment_at..].trim_end())
    });

    // Strip trailing `// line comment` and `/* block comment */` from the declaration
    // text BEFORE splitting declarators.  Without this, a declaration like:
    //   `export let name; // comment`
    // would produce `name; // comment` as the declarator, corrupting the prop name.
    let rest_stripped = strip_js_comments(rest_raw);
    let rest = rest_stripped.trim().trim_end_matches(';').trim();

    // Handle multiple declarators: export let a, b, c;
    // Split by comma, but be careful of commas inside default values
    let declarators = split_declarators(rest);
    // Keep the source declarators alongside the comment-free copies used for
    // semantic decisions. Comments attached to an initializer belong to that
    // expression in upstream's AST and must survive when it becomes the last
    // argument of `$.prop(...)`.
    let raw_declarators = split_declarators(rest_raw);
    let last_declarator_has_initializer = declarators
        .last()
        .is_some_and(|declarator| declarator.contains('='));

    let mut results = Vec::new();
    // esrap prints a comment inside the call only while the last argument is the
    // SOURCE initializer; a thunk this pass synthesizes carries no `loc`, so the
    // comment flushes after the statement instead.
    let mut last_arg_is_synthesized_thunk = false;

    // The `$.prop($$props, '<key>', …)` KEY is the prop's PUBLIC name, which is
    // the `prop_alias` for a renamed export (`export let fore; export { fore as
    // for }` → key `'for'`, local binding `fore`). Falls back to the local name.
    let prop_key_for = |local: &str| -> String {
        analysis
            .root
            .find_binding_any_scope(local)
            .and_then(|idx| analysis.root.bindings.get(idx))
            .and_then(|b| b.prop_alias.as_deref())
            .unwrap_or(local)
            .to_string()
    };

    for (declarator_index, decl) in declarators.into_iter().enumerate() {
        let decl = decl.trim();
        if decl.is_empty() {
            continue;
        }
        last_arg_is_synthesized_thunk = false;

        // Parse: name = value or just name
        if let Some(eq_pos) = decl.find('=') {
            let name = decl[..eq_pos].trim();
            let mut value = decl[eq_pos + 1..].trim();

            // Remove trailing line comment if present
            // Need to handle strings correctly - don't strip // inside strings
            if let Some(comment_pos) = find_line_comment_position(value) {
                value = value[..comment_pos].trim();
            }

            // Remove trailing semicolon from value (after comment removal)
            let value = value.trim_end_matches(';').trim();
            let raw_initializer = raw_declarators
                .get(declarator_index)
                .and_then(|raw_decl| raw_decl.find('=').map(|at| &raw_decl[at + 1..]));
            let initializer_comment = raw_initializer.and_then(leading_initializer_comments);
            // A comment INSIDE the initializer is in neither restored run: the
            // comment-free copy is what every semantic decision reads. Carry the
            // source text instead, guarded on the two spellings agreeing once
            // comments are removed.
            let interior_comments = raw_initializer
                .filter(|_| initializer_comment.is_none())
                .map(|raw| raw.trim_end().strip_suffix(';').unwrap_or(raw).trim())
                .filter(|raw| raw.has_sub("//") || raw.has_sub("/*"))
                // A `;` still in the text means the initializer did not end
                // where that suffix was stripped (`null; // c`), and text ending
                // inside a line comment would swallow the closing paren.
                .filter(|raw| {
                    find_code(raw.as_bytes(), b";").is_none() && !ends_inside_line_comment(raw)
                })
                .filter(|raw| strip_js_comments(raw).trim() == value);
            let rendered_value = interior_comments.map_or_else(
                || {
                    initializer_comment
                        .map(|comment| format!("{}{}", comment, value))
                        .unwrap_or_else(|| value.to_string())
                },
                std::string::ToString::to_string,
            );

            // Check if the value is a store accessor (e.g., $foo)
            // Store accessors like $foo become $foo() calls after transformation.
            // The official compiler handles this by passing the store getter function
            // directly with PROPS_IS_LAZY_INITIAL set (same as no-arg call expressions).
            let is_store_accessor = value.starts_with('$')
                && value.len() > 1
                && value[1..].chars().all(|c| c.is_alphanumeric() || c == '_')
                && analysis
                    .root
                    .bindings
                    .iter()
                    .any(|b| b.name == value && matches!(b.kind, BindingKind::StoreSub));

            if is_store_accessor {
                // Store accessor: pass the getter function directly with PROPS_IS_LAZY_INITIAL
                let flags = calculate_prop_flags(name, analysis, true);
                results.push(format!(
                    "{}{} {} = $.prop($$props, '{}', {}, {});",
                    leading_ws,
                    kw,
                    name,
                    prop_key_for(name),
                    flags,
                    rendered_value
                ));
            } else {
                // Check if the value is a "simple expression" that can be passed directly
                // Non-simple expressions need to be wrapped in a thunk and use PROPS_IS_LAZY_INITIAL
                let mut is_simple = is_simple_expression_str(value, analysis, dev);
                // An identifier is NOT simple if it refers to another prop/state variable
                // because after transforms it would become a function call (e.g., v2 -> v2()).
                let mut is_prop_ref = false;
                // A bare reactive-binding identifier is a no-arg getter call after
                // transform (`value()`); the official compiler unwraps it to the bare
                // callee. Fire regardless of `is_simple` (now false for such an
                // identifier) so it is emitted bare rather than thunked.
                if is_identifier_str(value)
                    && analysis
                        .root
                        .find_binding_any_scope(value)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| {
                            matches!(
                                b.kind,
                                BindingKind::BindableProp
                                    | BindingKind::Prop
                                    | BindingKind::State
                                    | BindingKind::RawState
                                    | BindingKind::Derived
                            )
                        })
                {
                    is_simple = false;
                    is_prop_ref = true;
                }
                // A bare legacy `$:` reactive variable becomes `$.get(name)` after
                // transform — a MEMBER call, not a no-arg identifier getter — so it
                // is non-simple and must be THUNKED (`() => $.get(name)`), not
                // unwrapped to a bare callee. Mirrors upstream applying the
                // transform before `is_simple_expression`.
                if is_simple
                    && is_identifier_str(value)
                    && analysis
                        .root
                        .find_binding_any_scope(value)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| matches!(b.kind, BindingKind::LegacyReactive))
                {
                    is_simple = false;
                    // is_prop_ref stays false → thunk path
                }

                // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED + PROPS_IS_LAZY_INITIAL
                let flags = calculate_prop_flags(name, analysis, !is_simple);

                if is_simple {
                    results.push(format!(
                        "{}{} {} = $.prop($$props, '{}', {}, {});",
                        leading_ws,
                        kw,
                        name,
                        prop_key_for(name),
                        flags,
                        rendered_value
                    ));
                } else if is_prop_ref {
                    // Prop/state identifier: pass directly (official compiler unwraps no-arg calls)
                    results.push(format!(
                        "{}{} {} = $.prop($$props, '{}', {}, {});",
                        leading_ws,
                        kw,
                        name,
                        prop_key_for(name),
                        flags,
                        rendered_value
                    ));
                } else {
                    // Wrap non-simple values in a thunk: () => value
                    // When value starts with '{', wrap in parens to prevent
                    // OXC from parsing `() => {...}` as arrow with block body
                    // instead of arrow returning object literal
                    let lazy_arg = make_lazy_prop_arg(interior_comments.unwrap_or(value));
                    let lazy_arg = initializer_comment
                        .map(|comment| restore_lazy_initializer_comment(&lazy_arg, comment))
                        .unwrap_or(lazy_arg);
                    // `make_lazy_prop_arg` UNWRAPS a no-arg call to its callee, so
                    // reaching this branch is not the same as emitting a wrapper.
                    last_arg_is_synthesized_thunk = lazy_arg.trim_start().starts_with("() =>")
                        && !value.trim_start().starts_with("() =>");
                    results.push(format!(
                        "{}{} {} = $.prop($$props, '{}', {}, {});",
                        leading_ws,
                        kw,
                        name,
                        prop_key_for(name),
                        flags,
                        lazy_arg
                    ));
                }
            }
        } else {
            let name = decl;
            // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED if the binding is updated
            let flags = calculate_prop_flags(name, analysis, false);

            results.push(format!(
                "{}{} {} = $.prop($$props, '{}', {});",
                leading_ws,
                kw,
                name,
                prop_key_for(name),
                flags
            ));
        }
    }

    if last_declarator_has_initializer
        && let Some(comment) = trailing_line_comment
        && let Some(last) = results.last_mut()
    {
        if last_arg_is_synthesized_thunk {
            last.push(' ');
            last.push_str(comment);
        } else if let Some(close) = last.rfind(')') {
            // A line comment must terminate before the call's closing paren. The
            // program printer supplies the final indentation and multiline layout.
            last.insert_str(close, &format!(" {}\n", comment));
        }
    }

    reprint_declaration_comments(&mut results, &declaration_comments, leading_ws, kw);

    if comment_prefix.is_empty() {
        results.join("\n")
    } else {
        format!("{}{}", comment_prefix, results.join("\n"))
    }
}

/// Peel the comments `declaration_split` moved between the keyword and the
/// declarator. Only a comment that ends its line is one of those; a comment
/// sharing the declarator's line was written there and stays put.
fn split_own_line_leading_comments(text: &str) -> (Vec<(String, bool)>, &str) {
    let mut comments = Vec::new();
    let mut rest = text;
    loop {
        let trimmed = rest.trim_start();
        let end = if trimmed.starts_with("//") {
            match trimmed.find('\n') {
                Some(at) => at,
                None => break,
            }
        } else if trimmed.starts_with("/*") {
            match trimmed.find_sub("*/") {
                Some(at) => at + 2,
                None => break,
            }
        } else {
            break;
        };
        let after = &trimmed[end..];
        let own_line = after
            .trim_start_matches([' ', '\t', '\r'])
            .starts_with('\n');
        // A `//` that does not end its line cannot be re-emitted inline — it
        // would swallow the declarator — so it stays for `strip_js_comments`.
        if !own_line && trimmed.starts_with("//") {
            break;
        }
        comments.push((trimmed[..end].trim_end().to_string(), own_line));
        rest = after;
    }
    (comments, rest.trim())
}

/// Return the leading comment trivia of an initializer, including the spacing
/// after it. The caller concatenates this slice with the comment-free value.
fn leading_initializer_comments(raw_value: &str) -> Option<&str> {
    let bytes = raw_value.as_bytes();
    let mut i = 0;
    while bytes.get(i).is_some_and(u8::is_ascii_whitespace) {
        i += 1;
    }
    let start = i;
    let mut found = false;

    loop {
        if bytes.get(i..i + 2) == Some(b"/*") {
            let close = raw_value[i + 2..].find_sub("*/")?;
            i += close + 4;
            found = true;
        } else if bytes.get(i..i + 2) == Some(b"//") {
            i = raw_value[i + 2..]
                .find('\n')
                .map_or(bytes.len(), |newline| i + 2 + newline + 1);
            found = true;
        } else {
            break;
        }
        while bytes.get(i).is_some_and(u8::is_ascii_whitespace) {
            i += 1;
        }
    }

    found.then(|| &raw_value[start..i])
}

/// A non-simple prop default is wrapped in a thunk. Its source comment stays
/// attached to the original expression, so place it inside that wrapper; the
/// optimized no-argument-call form has no wrapper and keeps the comment before
/// the surviving callee.
fn restore_lazy_initializer_comment(lazy_arg: &str, comment: &str) -> String {
    if let Some(body) = lazy_arg.strip_prefix("() => (") {
        format!("() => ({}{}", comment, body)
    } else if let Some(body) = lazy_arg.strip_prefix("() => ") {
        format!("() => {}{}", comment, body)
    } else {
        format!("{}{}", comment, lazy_arg)
    }
}

/// Transform destructured `export let { ... } = expr` patterns into flattened
/// `$.prop()` calls with path-based accessors.
///
/// Corresponds to the official Svelte compiler's `extract_paths` pattern used in
/// `VariableDeclaration.js` to flatten destructuring.
///
/// Example:
///   `export let { a, b: { c }, e: [e_one], g = default_g } = THING`
/// becomes:
///   `let tmp = THING,
///       $$array = $.derived(() => $.to_array(tmp.e, 1)),
///       a = $.prop($$props, 'a', 24, () => tmp.a),
///       c = $.prop($$props, 'c', 24, () => tmp.b.c),
///       e_one = $.prop($$props, 'e_one', 24, () => $.get($$array)[0]),
///       g = $.prop($$props, 'g', 24, () => $.fallback(tmp.g, default_g));`
pub(super) fn transform_destructured_export_let(
    statement: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    let trimmed = statement.trim();
    let rest = trimmed.strip_prefix("export let ")?.trim();

    // Find the `= RHS` assignment
    // We need to find the `=` that separates the pattern from the RHS value
    // The pattern can contain `=` for default values, so we need to find the
    // `=` that is at the top level outside the pattern
    let pattern_end = find_destructuring_pattern_end(rest)?;
    let pattern = rest[..pattern_end].trim();
    let rhs_part = rest[pattern_end..].trim();
    let rhs = rhs_part.strip_prefix('=')?.trim();
    let rhs = rhs.trim_end_matches(';').trim();

    let mut declarations = Vec::new();
    let mut array_counter = 0;

    // First declaration: tmp = RHS
    declarations.push(format!("tmp = {}", rhs));

    // Process the destructuring pattern
    extract_destructured_export_paths(
        pattern,
        "tmp",
        &mut declarations,
        &mut array_counter,
        analysis,
    )?;

    // Upstream emits all generated `$$array`/`$$array_N` `$.to_array(...)`
    // deriveds together right after `tmp`, before the individual prop getters
    // (which reference them). Reorder to match — `tmp` first, then the array
    // deriveds in creation order, then the prop declarators in walk order.
    let ordered = if let Some((tmp_decl, rest_decls)) = declarations.split_first() {
        let (array_decls, prop_decls): (Vec<String>, Vec<String>) = rest_decls
            .iter()
            .cloned()
            .partition(|d| d.trim_start().starts_with("$$array"));
        let mut ordered = Vec::with_capacity(declarations.len());
        ordered.push(tmp_decl.clone());
        ordered.extend(array_decls);
        ordered.extend(prop_decls);
        ordered
    } else {
        declarations
    };

    Some(format!("let {};", ordered.join(",\n\t")))
}

/// The member access a destructured property key reads through. Upstream builds
/// `b.member(expression, prop.key, prop.computed || key.type !== 'Identifier')`,
/// so only a plain identifier key is a dot access — a computed, string or
/// numeric key is a bracket access carrying the source's own spelling.
fn destructured_member_path(base_path: &str, key: &str) -> String {
    let key = key.trim();
    if let Some(inner) = key.strip_prefix('[').and_then(|k| k.strip_suffix(']')) {
        return format!("{}[{}]", base_path, inner.trim());
    }
    let is_identifier = !key.is_empty()
        && key
            .chars()
            .next()
            .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
        && key
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
    if is_identifier {
        format!("{}.{}", base_path, key)
    } else {
        format!("{}[{}]", base_path, key)
    }
}

/// The key list `$.exclude_from_object(base, [...])` receives for an object
/// pattern's rest element: every sibling property's key, spelled the way
/// upstream's `_extract_paths` spells it — a computed or non-literal key goes
/// through `String(...)`, everything else is a string literal.
fn object_rest_excluded_keys(properties: &[&str]) -> Vec<String> {
    let mut keys = Vec::new();
    for prop in properties {
        let prop = prop.trim();
        if prop.is_empty() || prop.starts_with("...") {
            continue;
        }
        let key = match split_property_key_value(prop) {
            Some((key, _)) => key.trim(),
            None => split_binding_name_default(prop).0.trim(),
        };
        if let Some(inner) = key.strip_prefix('[').and_then(|k| k.strip_suffix(']')) {
            keys.push(format!("String({})", inner.trim()));
        } else if key.len() >= 2
            && (key.starts_with('\'') && key.ends_with('\'')
                || key.starts_with('"') && key.ends_with('"'))
        {
            keys.push(format!("'{}'", &key[1..key.len() - 1]));
        } else {
            keys.push(format!("'{}'", key));
        }
    }
    keys
}

/// Find the end position of a destructuring pattern in `{ ... } = RHS` or `[ ... ] = RHS`.
/// Returns the position after the closing `}` or `]`.
/// Byte offset just past the pattern's closing bracket, relative to `s` as passed.
pub(super) fn find_destructuring_pattern_end(s: &str) -> Option<usize> {
    let trimmed = s.trim_start();
    let base = s.len() - trimmed.len();
    if !matches!(trimmed.as_bytes().first(), Some(b'{' | b'[')) {
        return None;
    }

    let mut depth = 0;
    for (i, c) in code_bytes(trimmed.as_bytes()) {
        match c {
            b'{' | b'[' => depth += 1,
            b'}' | b']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(base + i + 1);
                }
            }
            _ => {}
        }
    }
    None
}

/// Recursively extract paths from a destructuring pattern for `export let` props.
pub(super) fn extract_destructured_export_paths(
    pattern: &str,
    base_path: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
    analysis: &ComponentAnalysis,
) -> Option<()> {
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        // Object destructuring
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in &properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            // Handle rest element: ...rest
            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let flags = calculate_prop_flags(rest_name, analysis, true);
                let keys = object_rest_excluded_keys(&properties);
                declarations.push(format!(
                    "{} = $.prop($$props, '{}', {}, () => $.exclude_from_object({}, [{}]))",
                    rest_name,
                    rest_name,
                    flags,
                    base_path,
                    keys.join(", ")
                ));
                continue;
            }

            // Check for default value: name = default
            // Check for rename: key: value
            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                // Renamed property: key: value_pattern
                let new_path = destructured_member_path(base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring: b: { c, d: [...] }
                    extract_destructured_export_paths(
                        value_pattern,
                        &new_path,
                        declarations,
                        array_counter,
                        analysis,
                    )?;
                } else {
                    // Simple rename: b: c  or  b: c = default
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => {})",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                }
            } else {
                // Simple property: a  or  a = default
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let flags = calculate_prop_flags(binding_name, analysis, true);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                        binding_name, binding_name, flags, new_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => {})",
                        binding_name, binding_name, flags, new_path
                    ));
                }
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        // Array destructuring
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_destructuring_properties(inner);
        let _non_empty_count = elements.iter().filter(|e| !e.trim().is_empty()).count();
        let total_count = elements.len(); // include holes for array length

        // Create an $$array derived for array conversion
        let array_var = if *array_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", array_counter)
        };
        *array_counter += 1;

        // A rest element makes the destructure unbounded, so `$.to_array` is
        // called without the element-count argument (upstream omits it when the
        // pattern has a `...rest`).
        let has_rest = elements.iter().any(|e| e.trim().starts_with("..."));
        declarations.push(if has_rest {
            format!("{} = $.derived(() => $.to_array({}))", array_var, base_path)
        } else {
            format!(
                "{} = $.derived(() => $.to_array({}, {}))",
                array_var, base_path, total_count
            )
        });

        for (idx, elem) in elements.iter().enumerate() {
            let elem = elem.trim();
            if elem.is_empty() {
                continue; // Skip holes
            }

            // Handle rest element: ...rest
            if let Some(rest_pattern) = elem.strip_prefix("...") {
                let rest_pattern = rest_pattern.trim();
                if rest_pattern.starts_with('{') || rest_pattern.starts_with('[') {
                    // Rest with nested destructuring
                    let slice_path = format!("$.get({}).slice({})", array_var, idx);
                    extract_destructured_export_paths(
                        rest_pattern,
                        &slice_path,
                        declarations,
                        array_counter,
                        analysis,
                    )?;
                } else {
                    let flags = calculate_prop_flags(rest_pattern, analysis, true);
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.get({}).slice({}))",
                        rest_pattern, rest_pattern, flags, array_var, idx
                    ));
                }
                continue;
            }

            let element_path = format!("$.get({})[{}]", array_var, idx);

            if elem.starts_with('{') || elem.starts_with('[') {
                // Nested destructuring in array
                extract_destructured_export_paths(
                    elem,
                    &element_path,
                    declarations,
                    array_counter,
                    analysis,
                )?;
            } else {
                // Simple element or with default
                let (binding_name, default_value) = split_binding_name_default(elem);
                let flags = calculate_prop_flags(binding_name, analysis, true);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                        binding_name, binding_name, flags, element_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => {})",
                        binding_name, binding_name, flags, element_path
                    ));
                }
            }
        }
    } else {
        return None;
    }

    Some(())
}

/// Flatten a destructured `let { ... }` pattern where some bindings are re-exported.
/// Non-exported bindings become `name = tmp.prop`, exported bindings become `$.prop()` calls.
pub(super) fn flatten_destructured_let_with_reexported_props(
    pattern: &str,
    base_path: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let pattern = pattern.trim();
    let mut declarations = Vec::new();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                let new_path = destructured_member_path(base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring - recurse
                    if let Some(nested) = flatten_destructured_let_with_reexported_props(
                        value_pattern,
                        &new_path,
                        analysis,
                    ) {
                        declarations.push(nested);
                    }
                } else {
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let is_prop = analysis
                        .root
                        .find_binding_any_scope(binding_name)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| b.kind == BindingKind::BindableProp);

                    if is_prop {
                        let flags = calculate_prop_flags(binding_name, analysis, true);
                        if let Some(default_val) = default_value {
                            declarations.push(format!(
                                "let {} = $.prop($$props, '{}', {}, () => $.fallback({}, {}));",
                                binding_name, binding_name, flags, new_path, default_val
                            ));
                        } else {
                            declarations.push(format!(
                                "let {} = $.prop($$props, '{}', {}, () => {});",
                                binding_name, binding_name, flags, new_path
                            ));
                        }
                    } else if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "let {} = {} !== undefined ? {} : {};",
                            binding_name, new_path, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!("let {} = {};", binding_name, new_path));
                    }
                }
            } else {
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let is_prop = analysis
                    .root
                    .find_binding_any_scope(binding_name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp);

                if is_prop {
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "let {} = $.prop($$props, '{}', {}, () => $.fallback({}, {}));",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "let {} = $.prop($$props, '{}', {}, () => {});",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                } else if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "let {} = {} !== undefined ? {} : {};",
                        binding_name, new_path, new_path, default_val
                    ));
                } else {
                    declarations.push(format!("let {} = {};", binding_name, new_path));
                }
            }
        }
    } else {
        return None;
    }

    Some(declarations.join("\n"))
}

/// Like `flatten_destructured_let_with_reexported_props` but returns each
/// declarator as a bare `name = rhs` string (no leading `let`, no trailing `;`).
/// This allows the caller to merge them into a single `let tmp = rhs, a = ...,
/// b = ..., c = ...;` statement, matching the upstream AST output where a
/// single `VariableDeclaration` node holds all declarators.
///
/// Returns `None` if the pattern is unsupported (non-ObjectPattern).
pub(super) fn flatten_destructured_let_as_declarators(
    pattern: &str,
    base_path: &str,
    analysis: &ComponentAnalysis,
) -> Option<Vec<String>> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let pattern = pattern.trim();
    let mut declarators: Vec<String> = Vec::new();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                let new_path = destructured_member_path(base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring — recurse and collect nested declarators
                    if let Some(nested) =
                        flatten_destructured_let_as_declarators(value_pattern, &new_path, analysis)
                    {
                        declarators.extend(nested);
                    }
                } else {
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let is_prop = analysis
                        .root
                        .find_binding_any_scope(binding_name)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| b.kind == BindingKind::BindableProp);

                    if is_prop {
                        let flags = calculate_prop_flags(binding_name, analysis, true);
                        if let Some(default_val) = default_value {
                            declarators.push(format!(
                                "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                                binding_name, binding_name, flags, new_path, default_val
                            ));
                        } else {
                            declarators.push(format!(
                                "{} = $.prop($$props, '{}', {}, () => {})",
                                binding_name, binding_name, flags, new_path
                            ));
                        }
                    } else if let Some(default_val) = default_value {
                        declarators.push(format!(
                            "{} = {} !== undefined ? {} : {}",
                            binding_name, new_path, new_path, default_val
                        ));
                    } else {
                        declarators.push(format!("{} = {}", binding_name, new_path));
                    }
                }
            } else {
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let is_prop = analysis
                    .root
                    .find_binding_any_scope(binding_name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp);

                if is_prop {
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarators.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarators.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => {})",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                } else if let Some(default_val) = default_value {
                    declarators.push(format!(
                        "{} = {} !== undefined ? {} : {}",
                        binding_name, new_path, new_path, default_val
                    ));
                } else {
                    declarators.push(format!("{} = {}", binding_name, new_path));
                }
            }
        }
    } else {
        return None;
    }

    Some(declarators)
}

/// Split a property pattern into key and value parts around `:`.
/// Returns None if there's no `:` (simple property like `a` or `a = default`).
/// Handles nested patterns so `b: { c }` splits into `("b", "{ c }")`.
pub(super) fn split_property_key_value(prop: &str) -> Option<(&str, &str)> {
    let mut depth = 0;
    for (i, ch) in prop.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => {
                return Some((prop[..i].trim(), prop[i + 1..].trim()));
            }
            _ => {}
        }
    }
    None
}

/// Split a binding name from its default value.
/// `name = default` -> `("name", Some("default"))`
/// `name` -> `("name", None)`
pub(super) fn split_binding_name_default(s: &str) -> (&str, Option<&str>) {
    let s = s.trim();
    if let Some(eq_pos) = s.find('=') {
        // Make sure this isn't == or =>
        let after = s.get(eq_pos + 1..eq_pos + 2).unwrap_or("");
        if after == "=" || after == ">" {
            return (s, None);
        }
        (s[..eq_pos].trim(), Some(s[eq_pos + 1..].trim()))
    } else {
        (s, None)
    }
}

/// Split destructuring properties/elements by comma, respecting nesting depth.
pub(super) fn split_destructuring_properties(s: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, ch) in s.char_indices() {
        if in_string {
            if ch == '\\' {
                continue;
            }
            if ch == string_char {
                in_string = false;
            }
            continue;
        }
        if ch == '\'' || ch == '"' || ch == '`' {
            in_string = true;
            string_char = ch;
            continue;
        }
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

/// Calculate the prop flags for a given prop name.
///
/// Matches the official Svelte compiler's `get_prop_source()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`
///
/// Flags start at 0 and are built up based on binding and analysis state:
/// - PROPS_IS_IMMUTABLE (1): if analysis.immutable
/// - PROPS_IS_RUNES (2): if analysis.runes
/// - PROPS_IS_UPDATED (4): if accessors, or binding is updated (with immutable-aware logic)
/// - PROPS_IS_BINDABLE (8): only if binding.kind == BindableProp
/// - PROPS_IS_LAZY_INITIAL (16): if default value is non-simple
pub(super) fn calculate_prop_flags(
    name: &str,
    analysis: &ComponentAnalysis,
    is_lazy_initial: bool,
) -> i32 {
    use crate::compiler::constants::{
        PROPS_IS_BINDABLE, PROPS_IS_IMMUTABLE, PROPS_IS_LAZY_INITIAL, PROPS_IS_RUNES,
        PROPS_IS_UPDATED,
    };
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let mut flags = 0;

    // Look up the binding in the instance scope (not module scope).
    // Props always live in the instance scope; looking in any scope risks picking up
    // shadowing variables in module/function scopes with the same name.
    //
    // Prefer an actual `prop` / `bindable_prop` binding of this name first: a
    // same-named `function f(prop) {…}` parameter can be registered at the
    // instance scope index by Phase-2, so `get_binding` would return the
    // parameter (kind `normal`) and drop the `PROPS_IS_BINDABLE` bit.
    let binding = analysis
        .root
        .bindings
        .iter()
        .find(|b| b.name == name && matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp))
        .or_else(|| {
            analysis
                .root
                .get_binding(name, analysis.root.instance_scope_index)
                .and_then(|idx| analysis.root.bindings.get(idx))
        });

    // PROPS_IS_BINDABLE: only if binding.kind == BindableProp
    if let Some(b) = binding
        && b.kind == BindingKind::BindableProp
    {
        flags |= PROPS_IS_BINDABLE;
    }

    // PROPS_IS_IMMUTABLE: if analysis.immutable
    if analysis.immutable {
        flags |= PROPS_IS_IMMUTABLE;
    }

    // PROPS_IS_RUNES: if analysis.runes
    if analysis.runes {
        flags |= PROPS_IS_RUNES;
    }

    // PROPS_IS_UPDATED: matches official logic:
    // if (accessors || (immutable ? (reassigned || (runes && mutated)) : updated))
    if analysis.accessors {
        flags |= PROPS_IS_UPDATED;
    } else if let Some(b) = binding {
        use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
        // When a prop is shadowed by a same-named function parameter, the
        // BindableProp kind can land on the parameter binding (which is never
        // reassigned), while the real `export let`/destructured prop binding —
        // declared in the instance/module scope — carries the reassignment.
        // Borrow the real declaration's updated-ness so a reassigned prop still
        // gets PROPS_IS_UPDATED. (Sort/flag-only — does not change which binding
        // is marked BindableProp, so var-hoisting is untouched.)
        let real_reassigned = analysis.root.bindings.iter().any(|x| {
            x.name == name
                && x.declaration_kind != DeclarationKind::Param
                && (x.scope_index == 0 || x.scope_index == analysis.root.instance_scope_index)
                && x.reassigned
        });
        let real_mutated = analysis.root.bindings.iter().any(|x| {
            x.name == name
                && x.declaration_kind != DeclarationKind::Param
                && (x.scope_index == 0 || x.scope_index == analysis.root.instance_scope_index)
                && x.mutated
        });
        let is_updated = if analysis.immutable {
            (b.reassigned || real_reassigned) || (analysis.runes && (b.mutated || real_mutated))
        } else {
            b.is_updated() || real_reassigned || real_mutated
        };
        if is_updated {
            flags |= PROPS_IS_UPDATED;
        }
    }

    // PROPS_IS_LAZY_INITIAL: if the default value needs to be wrapped in a thunk
    if is_lazy_initial {
        flags |= PROPS_IS_LAZY_INITIAL;
    }

    flags
}

/// The `$.prop($$props, <key>, …)` key exactly as upstream prints it. Upstream
/// passes `b.literal(key.value)`, so a numeric destructuring key stays a
/// **number** (and carries its value, not its spelling: `0x10` → `16`).
pub(super) fn prop_key_js_literal(raw_key: &str, prop_name: &str) -> String {
    if let Some(digits) = bigint_key_digits(raw_key) {
        return digits;
    }
    if let Some(n) = numeric_key_value(raw_key) {
        return crate::compiler::phases::phase3_transform::server::evaluate::js_number_to_string(n);
    }
    format!("'{}'", prop_name)
}

/// `Some(decimal digits)` when the raw key text is a BigInt literal. Parsed
/// rather than pattern-matched, so `0x10n` / `1_000n` carry their value, and an
/// identifier that merely ends in `n` is not mistaken for one.
fn bigint_key_digits(raw_key: &str) -> Option<String> {
    use oxc_allocator::Allocator;
    use oxc_ast::ast::{Expression, Statement};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let trimmed = raw_key.trim();
    if !trimmed.ends_with('n') || !trimmed.starts_with(|c: char| c.is_ascii_digit()) {
        return None;
    }
    let alloc = Allocator::default();
    let parsed = Parser::new(&alloc, trimmed, SourceType::mjs()).parse();
    if parsed.panicked || !parsed.diagnostics.is_empty() {
        return None;
    }
    let [Statement::ExpressionStatement(stmt)] = parsed.program.body.as_slice() else {
        return None;
    };
    match &stmt.expression {
        Expression::BigIntLiteral(lit) => Some(lit.value.to_string()),
        _ => None,
    }
}

/// `Some(value)` when the raw key text is a numeric literal, parsed rather than
/// pattern-matched so `1e3` / `0x10` / `1_000` carry their value.
fn numeric_key_value(raw_key: &str) -> Option<f64> {
    use oxc_allocator::Allocator;
    use oxc_ast::ast::{Expression, Statement};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let trimmed = raw_key.trim();
    if !trimmed.starts_with(|c: char| c.is_ascii_digit() || c == '.') {
        return None;
    }
    let alloc = Allocator::default();
    let parsed = Parser::new(&alloc, trimmed, SourceType::mjs()).parse();
    if parsed.panicked || !parsed.diagnostics.is_empty() {
        return None;
    }
    let [Statement::ExpressionStatement(stmt)] = parsed.program.body.as_slice() else {
        return None;
    };
    match &stmt.expression {
        Expression::NumericLiteral(lit) => Some(lit.value),
        _ => None,
    }
}

/// Check if a string is a valid JavaScript identifier.
pub(super) fn is_identifier_str(s: &str) -> bool {
    let trimmed = s.trim();
    let mut chars = trimmed.chars();
    match chars.next() {
        Some(first) if first.is_ascii_alphabetic() || first == '_' || first == '$' => {
            chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
        }
        _ => false,
    }
}

/// Whether `s` contains a `=>` token at bracket depth 0 (i.e. the expression is
/// itself an arrow function), as opposed to a `=>` nested inside a call argument
/// (`x.map(a => b)`). The call/member-expression "not simple" checks below use
/// this to avoid bailing on a call CHAIN that merely contains a nested arrow:
/// `type.split("").map((c) => c).join("")` is a CallExpression (NOT simple),
/// even though it contains `=>`.
fn has_top_level_arrow(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut depth: i32 = 0;
    let mut i = 0;
    let mut string: Option<u8> = None;
    while i < bytes.len() {
        let b = bytes[i];
        if let Some(q) = string {
            if b == b'\\' {
                i += 2;
                continue;
            }
            if b == q {
                string = None;
            }
            i += 1;
            continue;
        }
        match b {
            b'\'' | b'"' | b'`' => string = Some(b),
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 && i + 1 < bytes.len() && bytes[i + 1] == b'>' => return true,
            _ => {}
        }
        i += 1;
    }
    false
}

/// Check if a value string represents a "simple expression" that can be passed directly.
///
/// Simple expressions don't need to be wrapped in a thunk (factory function).
/// This matches the official Svelte compiler's `is_simple_expression()` function.
///
/// Simple expressions include:
/// - Literals (numbers, strings, booleans, null, undefined)
/// - Identifiers (variable references)
/// - Arrow function expressions
/// - Function expressions
/// - Binary and logical expressions where both sides are simple
/// - Conditional expressions where all parts are simple
///
/// Non-simple expressions include:
/// - Array literals: [1, 2, 3]
/// - Object literals: { a: 1 }
/// - Call expressions: foo()
/// - Template literals: `hello`, `${x}` (TemplateLiteral != Literal in AST)
pub(super) fn is_simple_expression_str(
    value: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
) -> bool {
    // A leading comment is not part of the expression, and leaving it on makes
    // the call test below read `/** … */ ('a')` as a call whose callee is the
    // comment. The comment alone and the parentheses alone are both handled;
    // only the two together miss.
    let trimmed = super::expression_utils::strip_leading_comments(value.trim()).trim();

    // Empty is not simple
    if trimmed.is_empty() {
        return false;
    }

    // Unary expressions (e.g., `-1`, `+x`, `!foo`, `~bar`) are NOT simple.
    // The official Svelte compiler's `is_simple_expression()` only treats `Literal`,
    // `Identifier`, `ArrowFunctionExpression`, `FunctionExpression`, and recursively
    // `ConditionalExpression`/`BinaryExpression`/`LogicalExpression` as simple.
    // Numeric literals like `-1` parse as `UnaryExpression(-, Literal(1))`, which
    // is NOT simple. We approximate by detecting a leading unary operator that is
    // followed by a non-digit/non-identifier character is too hard at the string
    // level, so we treat any leading `-` or `+` (other than just whitespace) as
    // non-simple ONLY when it cannot be parsed as a pure numeric literal.
    // Actually, the simplest correct rule: if the expression starts with `-` or
    // `+` and the rest is a valid number literal, it's a UnaryExpression and
    // therefore NOT simple.
    if (trimmed.starts_with('-') || trimmed.starts_with('+'))
        && trimmed[1..].trim_start().parse::<f64>().is_ok()
    {
        return false;
    }

    // Other unary operators
    if trimmed.starts_with('!')
        || trimmed.starts_with('~')
        || trimmed.starts_with("void ")
        || trimmed.starts_with("typeof ")
    {
        return false;
    }

    // Array literals are NOT simple
    if trimmed.starts_with('[') {
        return false;
    }

    // Object literals are NOT simple
    if trimmed.starts_with('{') {
        return false;
    }

    // Logical/binary expressions containing a call-with-IIFE are NOT simple.
    // e.g., `brush_options && (() => {...})()` — the RHS is an IIFE call.
    // Detect `)(` suffix pattern that indicates a call-after-expression.
    if trimmed.ends_with(')') && memchr::memmem::find(trimmed.as_bytes(), b")(").is_some() {
        // If there's a top-level binary/logical operator before an IIFE call,
        // this is not a simple expression.
        return false;
    }

    // Call expressions are NOT simple (unless it's a no-arg function reference)
    // e.g., foo() is not simple, but foo is simple
    if trimmed.ends_with(')') && !trimmed.starts_with("function") && !has_top_level_arrow(trimmed) {
        // Check if it looks like a call expression
        // Find matching parens
        let mut depth = 0;
        for (i, c) in trimmed.char_indices().rev() {
            match c {
                ')' => depth += 1,
                '(' => {
                    depth -= 1;
                    if depth == 0 {
                        // Check if this is a call expression or a function definition
                        let before = trimmed[..i].trim_end();
                        // A `(` opens a CALL only where a callee can end; after an
                        // operator it opens a parenthesised operand, so
                        // `a || (b === 'x')` is a LogicalExpression, not a call.
                        let ends_a_callee = before.chars().next_back().is_some_and(|c| {
                            c.is_alphanumeric() || c == '_' || c == '$' || c == ')' || c == ']'
                        });
                        if ends_a_callee
                            && !before.ends_with("function")
                            && !has_top_level_arrow(before)
                        {
                            return false;
                        }
                        break;
                    }
                }
                _ => {}
            }
        }
    }

    // Template literals are NOT simple (even without expressions like `red`)
    // The official Svelte compiler only considers Literal, Identifier,
    // ArrowFunctionExpression, and FunctionExpression as simple.
    // TemplateLiteral is a different AST node type from Literal.
    if trimmed.starts_with('`') {
        return false;
    }

    // new expressions are NOT simple
    if trimmed.starts_with("new ") {
        return false;
    }

    // typeof expressions are NOT simple
    if trimmed.starts_with("typeof ") {
        return false;
    }

    // Member expressions (containing dots) are NOT simple
    if !trimmed.starts_with("function")
        && !has_top_level_arrow(trimmed)
        && !trimmed.starts_with('"')
        && !trimmed.starts_with('\'')
        && !trimmed.starts_with('`')
        && trimmed.contains('.')
        && trimmed.parse::<f64>().is_err()
    {
        return false;
    }

    // Conditional / binary / logical expressions are simple ONLY when every
    // operand is itself simple — mirroring upstream `is_simple_expression`
    // (utils/ast.js), which recurses into test/consequent/alternate (and
    // left/right). The string heuristic above never recursed, so e.g.
    // `solid() ? "a" : "b"` (whose test is a CallExpression) was wrongly treated
    // as simple, dropping PROPS_IS_LAZY_INITIAL and the default thunk. Defer to an
    // exact AST check; only flips a heuristic `true` to `false`, never the reverse.
    if ast_expr_is_simple(trimmed, analysis, dev) == Some(false) {
        return false;
    }

    // Everything else is considered simple:
    // - Numeric literals: 42, 3.14, -1
    // - String literals: "hello", 'world'
    // - Boolean literals: true, false
    // - null, undefined
    // - Identifiers: foo, bar
    // - Arrow functions: () => {}, x => x
    // - Function expressions: function() {}
    // - Binary/logical expressions: a + b, a && b
    // - Conditional expressions: a ? b : c
    true
}

/// Exact `is_simple_expression` check via the OXC parser, mirroring upstream's
/// `is_simple_expression` in `packages/svelte/src/compiler/utils/ast.js`.
///
/// Returns `Some(true)`/`Some(false)` when `value` parses as a single expression,
/// and `None` when it cannot be parsed (callers then keep the string-heuristic
/// result). The text passed here is post-transform (prop reads are already
/// `name()` calls), so a `CallExpression` operand is correctly non-simple.
fn ast_expr_is_simple(value: &str, analysis: &ComponentAnalysis, dev: bool) -> Option<bool> {
    use oxc_allocator::Allocator;
    use oxc_ast::ast::Statement;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let alloc = Allocator::default();
    // Wrap in parens so an object literal (`{...}`) parses as an expression, not a block.
    let src = format!("({})", value.trim());
    let _pt = super::super::profile::timer_start();
    let parsed = Parser::new(&alloc, &src, SourceType::mjs()).parse();
    super::super::profile::record_direct_parse(
        super::super::profile::timer_elapsed(_pt),
        src.len(),
    );
    if parsed.panicked || !parsed.diagnostics.is_empty() {
        return None;
    }
    let Some(Statement::ExpressionStatement(stmt)) = parsed.program.body.first() else {
        return None;
    };
    Some(expr_is_simple(&stmt.expression, analysis, dev))
}

/// Exact `should_proxy` check via the OXC parser, mirroring upstream's
/// `should_proxy(node, scope)` in
/// `packages/svelte/src/compiler/phases/3-transform/client/utils.js`.
///
/// Returns `Some(false)` when the top-level node is a value upstream never
/// proxies (`Literal`, `TemplateLiteral`, arrow/function expression,
/// `UnaryExpression`, `BinaryExpression`, or the `undefined` identifier),
/// `Some(true)` otherwise, and `None` when the text cannot be parsed as a single
/// expression (callers then fall back to the string heuristic).
///
/// `analysis` enables upstream's one-level scope recursion: a bare identifier
/// default resolves to its (non-reassigned, non-function) binding's initial and
/// that initial's node type decides proxy-ability — e.g. `= DEFAULT_ALPHA` where
/// `const DEFAULT_ALPHA = 1` is not proxied. Rune bindings need special care:
/// rsvelte stores the rune argument in `binding.initial`, while upstream keeps
/// the complete `$state(...)` / `$derived(...)` CallExpression, which is always
/// proxyable. Pass `None` to disable recursion (as upstream does by threading a
/// null scope on the recursed call), so it is at most one level deep.
fn ast_should_proxy(value: &str, analysis: Option<&ComponentAnalysis>) -> Option<bool> {
    use oxc_allocator::Allocator;
    use oxc_ast::ast::Statement;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let alloc = Allocator::default();
    // Wrap in parens so an object literal (`{...}`) parses as an expression.
    let src = format!("({})", value.trim());
    let _pt = super::super::profile::timer_start();
    let parsed = Parser::new(&alloc, &src, SourceType::mjs()).parse();
    super::super::profile::record_direct_parse(
        super::super::profile::timer_elapsed(_pt),
        src.len(),
    );
    if parsed.panicked || !parsed.diagnostics.is_empty() {
        return None;
    }
    let Some(Statement::ExpressionStatement(stmt)) = parsed.program.body.first() else {
        return None;
    };
    Some(expr_should_proxy(&stmt.expression, analysis))
}

/// Node-type predicate matching upstream `should_proxy` (`utils.js`), with the
/// one-level scope recursion when `analysis` is `Some`.
fn expr_should_proxy(
    expr: &oxc_ast::ast::Expression,
    analysis: Option<&ComponentAnalysis>,
) -> bool {
    use oxc_ast::ast::Expression;
    match expr {
        Expression::ParenthesizedExpression(p) => expr_should_proxy(&p.expression, analysis),
        Expression::NumericLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::TemplateLiteral(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_) => false,
        Expression::Identifier(id) => {
            if id.name.as_str() == "undefined" {
                return false;
            }
            // Upstream: recurse into a resolvable, non-reassigned binding's
            // initial (with a `null` scope, hence at most one level). Upstream's
            // own exclusions name DECLARATION kinds it has no initializer
            // expression for, and every one of them answers `true` from the
            // node-type dispatch below anyway — a function-VALUED initializer is
            // NOT among them, so testing `initial_is_function` proxied what
            // upstream leaves alone.
            if let Some(analysis) = analysis
                && let Some(idx) = analysis.root.find_binding_any_scope(id.name.as_str())
                && let Some(binding) = analysis.root.bindings.get(idx)
                && !binding.reassigned
            {
                // Upstream recurses into the declaration initializer node. A
                // rune declaration's initializer is the call itself, not its
                // argument, so even `$state(1)` is a proxyable CallExpression.
                // `binding.initial` deliberately stores `1` for other analysis
                // consumers; `init_rune` preserves the lost outer node shape.
                if binding.init_rune.is_some() {
                    return true;
                }
                // `binding.initial` only carries a LITERAL's text; every other
                // initializer leaves it `None` and records its node type
                // instead, which is what upstream's null-scope recursion
                // dispatches on.
                let Some(initial) = binding.initial.as_deref() else {
                    return binding.initial_node_type.as_deref().is_none_or(|ty| {
                        super::visitors::shared::utils::should_proxy_node_type(
                            ty,
                            binding.initial_identifier_name.as_deref(),
                        )
                    });
                };
                // `None` disables further identifier recursion (upstream `null` scope).
                return ast_should_proxy(initial, None).unwrap_or(true);
            }
            true
        }
        _ => true,
    }
}

/// `true` if `name` is a reactive binding that prop-read transforms rewrite into
/// a getter call (`name` -> `name()`). Such an identifier is therefore NOT a
/// simple expression: upstream's `is_simple_expression` runs after that rewrite
/// and sees a `CallExpression`. Mirrors the `is_prop_ref` binding-kind set.
fn is_call_becoming_binding(name: &str, analysis: &ComponentAnalysis) -> bool {
    // Only legacy mode rewrites a prop/state read into a getter call (`name()` /
    // `$.get(name)`); in runes mode these identifiers stay plain reads, so they
    // remain simple. Gating here keeps runes default-value handling identical to
    // before this predicate existed (mirrors the legacy-only `is_prop_ref` sites).
    if analysis.runes {
        return false;
    }
    analysis
        .root
        .find_binding_any_scope(name)
        .and_then(|idx| analysis.root.bindings.get(idx))
        .is_some_and(|b| {
            matches!(
                b.kind,
                BindingKind::BindableProp
                    | BindingKind::Prop
                    | BindingKind::State
                    | BindingKind::RawState
                    | BindingKind::Derived
                    // A store read becomes `$s()` and a `$:` variable `$.get(r)`,
                    // so neither stays simple once the transform has run.
                    | BindingKind::StoreSub
                    | BindingKind::LegacyReactive
            )
        })
}

/// Recursive AST predicate matching upstream `is_simple_expression`
/// (`utils/ast.js`), evaluated as if prop/state reads were already rewritten to
/// getter calls (so a reactive-binding identifier is non-simple).
fn expr_is_simple(
    expr: &oxc_ast::ast::Expression,
    analysis: &ComponentAnalysis,
    dev: bool,
) -> bool {
    use oxc_ast::ast::Expression;
    match expr {
        Expression::ParenthesizedExpression(p) => expr_is_simple(&p.expression, analysis, dev),
        Expression::NumericLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_) => true,
        // A bare identifier is simple only if it stays a plain identifier; a
        // prop/state/derived binding is rewritten to `name()` (a call) later.
        Expression::Identifier(id) => !is_call_becoming_binding(id.name.as_str(), analysis),
        Expression::ConditionalExpression(c) => {
            expr_is_simple(&c.test, analysis, dev)
                && expr_is_simple(&c.consequent, analysis, dev)
                && expr_is_simple(&c.alternate, analysis, dev)
        }
        Expression::BinaryExpression(b) => {
            // In dev these four become `$.strict_equals` / `$.equals` CALLS
            // (`BinaryExpression.js`), and upstream tests the visited node.
            if dev
                && matches!(
                    b.operator,
                    oxc_syntax::operator::BinaryOperator::StrictEquality
                        | oxc_syntax::operator::BinaryOperator::StrictInequality
                        | oxc_syntax::operator::BinaryOperator::Equality
                        | oxc_syntax::operator::BinaryOperator::Inequality
                )
            {
                return false;
            }
            expr_is_simple(&b.left, analysis, dev) && expr_is_simple(&b.right, analysis, dev)
        }
        Expression::LogicalExpression(l) => {
            expr_is_simple(&l.left, analysis, dev) && expr_is_simple(&l.right, analysis, dev)
        }
        _ => false,
    }
}

/// Create the argument for a lazy prop initializer.
pub(super) fn make_lazy_prop_arg(value: &str) -> String {
    let trimmed = value.trim();
    if let Some(callee) = trimmed.strip_suffix("()") {
        let callee = callee.trim();
        if !callee.is_empty()
            && callee
                .chars()
                .next()
                .map(|c| c.is_alphabetic() || c == '_' || c == '$')
                .unwrap_or(false)
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return callee.to_string();
        }
    }
    if trimmed.starts_with('{') {
        format!("() => ({})", trimmed)
    } else {
        format!("() => {}", trimmed)
    }
}

/// If `s` is a `$bindable( … )` call, return the inner argument text (the raw
/// slice between the parentheses, untrimmed). Tolerates whitespace between the
/// `$bindable` rune and the opening `(` (`$bindable (x)`), which upstream's
/// AST-based unwrap handles but a `starts_with("$bindable(")` text check
/// missed. Returns `None` when `s` is not a `$bindable(...)` wrapper. H-061.
fn strip_bindable_wrapper(s: &str) -> Option<&str> {
    let rest = s.strip_prefix("$bindable")?.trim_start();
    rest.strip_prefix('(')?.strip_suffix(')')
}

/// Split declarators by comma, handling nested braces, brackets, parens, and
/// string / template literals.
///
/// For example: `a, b = {x: 1}, c` -> `["a", "b = {x: 1}", "c"]`, and a comma
/// inside a string default (`a = "x,y", b`) does not split the list.
pub(super) fn split_declarators(s: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth: usize = 0;
    let mut start = 0;
    // Track the open quote of the current string/template literal so commas and
    // brackets inside it are ignored. `${}` interpolation inside a template is
    // not descended into — a top-level comma there can't terminate a `$props()`
    // declarator anyway.
    let mut string_char: Option<char> = None;
    let mut escaped = false;
    // Track comment state so commas inside `// …` / `/* … */` comments — which
    // can legitimately appear between prop names in a `$props()` destructuring,
    // e.g. `// we add name, color, and stroke …` — are not treated as
    // declarator separators. The comment text itself stays inside the declarator
    // and is stripped per-declarator by the caller.
    let mut in_line_comment = false;
    // Byte index just past the `/*` opener, or `usize::MAX` when not in a block
    // comment. The close `*/` must occur at or after this index so a `/*/` does
    // not self-close on the opener's own `*`.
    let mut block_comment_body_start = usize::MAX;
    let bytes = s.as_bytes();

    for (i, c) in s.char_indices() {
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            continue;
        }
        if block_comment_body_start != usize::MAX {
            if c == '/' && i >= block_comment_body_start && i > 0 && bytes[i - 1] == b'*' {
                block_comment_body_start = usize::MAX;
            }
            continue;
        }
        if let Some(quote) = string_char {
            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == quote {
                string_char = None;
            }
            continue;
        }
        // Comment start (only outside strings). Peek the next byte.
        if c == '/' && bytes.get(i + 1) == Some(&b'/') {
            in_line_comment = true;
            continue;
        }
        if c == '/' && bytes.get(i + 1) == Some(&b'*') {
            block_comment_body_start = i + 3;
            continue;
        }
        match c {
            '"' | '\'' | '`' => string_char = Some(c),
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth = depth.saturating_sub(1),
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }

    // Don't forget the last segment
    if start < s.len() {
        result.push(&s[start..]);
    }

    result
}

/// The last code byte before `at`, ignoring whitespace.
fn prev_code_byte(bytes: &[u8], at: usize) -> Option<u8> {
    let mut end = at;
    while end > 0 && bytes[end - 1].is_ascii_whitespace() {
        end -= 1;
    }
    (end > 0).then(|| bytes[end - 1])
}

/// Find the position of a line comment (//) that is not inside a string.
///
/// Every delimiter tested for is ASCII, and a UTF-8 continuation byte is never
/// one of them, so the scan is byte-level while the returned offset stays a
/// valid char boundary.
pub(super) fn find_line_comment_position(code: &str) -> Option<usize> {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let mut in_string: Option<u8> = None;
    let mut prev: Option<u8> = None;
    let mut i = 0;

    while i < len {
        let c = bytes[i];
        if let Some(quote) = in_string {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == quote {
                in_string = None;
                prev = Some(c);
            }
            i += 1;
            continue;
        }
        if c == b'"' || c == b'\'' || c == b'`' {
            in_string = Some(c);
            prev = Some(c);
            i += 1;
            continue;
        }
        if c == b'/' && bytes.get(i + 1) == Some(&b'/') {
            return Some(i);
        }
        // `/^https?:\/\//` ends in two adjacent slashes that would otherwise
        // read as the start of a comment.
        if c == b'/'
            && let Some((end, false)) = skip_opaque(bytes, i, prev)
        {
            // A regex ends an expression, like a closing paren.
            prev = Some(b')');
            i = end;
            continue;
        }
        if !c.is_ascii_whitespace() {
            prev = Some(c);
        }
        i += 1;
    }
    None
}

/// Strip all JS comments (`// ...` and `/* ... */`) from `code`, respecting
/// string literals so that `//` or `/*` inside a string is not treated as a
/// comment delimiter.  Returns the comment-free string.
///
/// Used by prop-declaration lowering to sanitise declaration text before
/// parsing the prop name and value.
pub(super) fn strip_js_comments(code: &str) -> String {
    // Build the result as raw bytes so multi-byte UTF-8 sequences (e.g. a
    // non-ASCII character inside a string default value) are copied verbatim
    // rather than split per byte. All structural delimiters we test for
    // (`/`, `*`, quotes, `\\`, `\n`) are ASCII, so byte comparison is safe:
    // UTF-8 continuation bytes are >= 0x80 and never collide with them.
    let mut result: Vec<u8> = Vec::with_capacity(code.len());
    let bytes = code.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut in_string: Option<u8> = None; // Some(b'\'') / Some(b'"') / Some(b'`')

    while i < len {
        let b = bytes[i];

        if let Some(quote) = in_string {
            // Inside a string literal — copy verbatim until the closing quote.
            result.push(b);
            if b == b'\\' && i + 1 < len {
                // Escaped character: copy both bytes and advance past them.
                i += 1;
                result.push(bytes[i]);
            } else if b == quote {
                in_string = None;
            }
            i += 1;
            continue;
        }

        // Outside a string — check for comment or string start.
        if b == b'/' && i + 1 < len {
            let next = bytes[i + 1];
            if next == b'/' {
                // Line comment: skip to end of line.
                i += 2;
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                // Do NOT consume the newline itself so line structure is preserved.
                continue;
            }
            if next == b'*' {
                // Block comment: skip to closing `*/`.
                i += 2;
                while i + 1 < len {
                    if bytes[i] == b'*' && bytes[i + 1] == b'/' {
                        i += 2;
                        break;
                    }
                    i += 1;
                }
                continue;
            }
        }

        if b == b'\'' || b == b'"' || b == b'`' {
            in_string = Some(b);
        }

        result.push(b);
        i += 1;
    }

    // `result` only ever contains complete byte sequences copied from valid
    // UTF-8 input, so it is itself valid UTF-8.
    String::from_utf8(result).unwrap_or_else(|e| String::from_utf8_lossy(e.as_bytes()).into_owned())
}

/// Transform $props() usage.
///
/// Only generates `$.prop()` declarations for props that are "sources" (reassigned or mutated)
/// or props that have default values or are exported.
/// Read-only props are accessed directly via `$$props.propName` without declarations.
///
/// Uses the same flag calculation as `get_prop_source()` from the official Svelte compiler:
/// - PROPS_IS_IMMUTABLE (1): if analysis.immutable
/// - PROPS_IS_RUNES (2): if analysis.runes
/// - PROPS_IS_UPDATED (4): if accessors, or binding is updated
/// - PROPS_IS_BINDABLE (8): only if binding.kind == BindableProp ($bindable() props)
/// - PROPS_IS_LAZY_INITIAL (16): if default value is non-simple
///
/// Multiple prop declarations are combined into a single `let` statement with
/// comma-separated declarators, matching the official compiler output format.
/// Byte span of the destructuring pattern's braces. A `/** @type {Props} */`
/// annotation puts braces ahead of the pattern, so only code positions count.
fn props_pattern_span(trimmed: &str) -> Option<(usize, usize)> {
    let mut open = None;
    let mut close = None;
    for (i, c) in code_bytes(trimmed.as_bytes()) {
        match c {
            b'{' if open.is_none() => open = Some(i),
            b'}' => close = Some(i),
            _ => {}
        }
    }
    Some((open?, close?))
}

/// A declarator part's comment layout: comments before its first code token,
/// the code range between (interior comments included), and comments after the
/// last code token. All offsets are absolute in the pattern text the parts were
/// split from; `part_off` is the part's offset there.
fn scan_part_comments(
    part_off: usize,
    part: &str,
) -> (
    Vec<(usize, usize)>,
    Option<(usize, usize)>,
    Vec<(usize, usize)>,
) {
    let bytes = part.as_bytes();
    let mut comments: Vec<(usize, usize)> = Vec::new();
    let mut first_code: Option<usize> = None;
    let mut last_code_end: usize = 0;
    let mut prev: Option<u8> = None;
    let mut i = 0;
    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if is_comment {
                comments.push((i, next));
            } else {
                first_code.get_or_insert(i);
                last_code_end = next;
                prev = next.checked_sub(1).and_then(|k| bytes.get(k)).copied();
            }
            i = next;
            continue;
        }
        if !bytes[i].is_ascii_whitespace() {
            first_code.get_or_insert(i);
            last_code_end = i + 1;
            prev = Some(bytes[i]);
        }
        i += 1;
    }
    let Some(first) = first_code else {
        let all = comments
            .into_iter()
            .map(|(s, e)| (part_off + s, part_off + e))
            .collect();
        return (all, None, Vec::new());
    };
    let lead = comments
        .iter()
        .filter(|&&(_, e)| e <= first)
        .map(|&(s, e)| (part_off + s, part_off + e))
        .collect();
    let trail = comments
        .iter()
        .filter(|&&(s, _)| s >= last_code_end)
        .map(|&(s, e)| (part_off + s, part_off + e))
        .collect();
    (
        lead,
        Some((part_off + first, part_off + last_code_end)),
        trail,
    )
}

/// esrap's `flush_trailing_comments` for the pattern text: a comment on the
/// same line as the previous kept declarator's default value lands inside that
/// `$.prop(...)` call (before its closing paren, a `//` one forcing a line
/// break); anything else queues to flush before the next kept declarator.
fn attach_or_pend(
    comments: &[(usize, usize)],
    props_str: &str,
    declarators: &mut [String],
    pending: &mut Vec<(usize, String)>,
    prev_value_end: Option<usize>,
    trail_broken: &mut bool,
) {
    for &(start, end) in comments {
        let text = &props_str[start..end];
        let attachable = pending.is_empty()
            && !*trail_broken
            && prev_value_end.is_some_and(|e| e <= start && !props_str[e..start].contains('\n'));
        if attachable
            && let Some(last) = declarators.last_mut()
            && let Some(pos) = last.rfind(')')
        {
            let is_line = text.starts_with("//");
            let insert = if is_line {
                format!(" {}\n", text)
            } else {
                format!(" {}", text)
            };
            last.insert_str(pos, &insert);
            if is_line {
                *trail_broken = true;
            }
            continue;
        }
        pending.push((end, text.to_string()));
    }
}

/// Render queued comments ahead of the kept declarator starting at `to`,
/// keeping each one's source line break toward it.
fn flush_pending_before(pending: &mut Vec<(usize, String)>, props_str: &str, to: usize) -> String {
    let mut out = String::new();
    for (end, text) in pending.drain(..) {
        out.push_str(&text);
        if props_str[end..to].contains('\n') {
            out.push('\n');
        } else {
            out.push(' ');
        }
    }
    out
}

pub(super) fn transform_props_destructuring(
    line: &str,
    prop_source_vars: &[String],
    exported_names: &[String],
    analysis: &ComponentAnalysis,
    read_only_props: &[(String, String)],
    dev: bool,
) -> Option<String> {
    // A comment between the declarator's `=` and `$props()` is not part of the
    // object pattern, but it still participates in esrap's comment cursor.
    // Save it before canonicalization removes that whole separator. The byte
    // positions are relative to the original trimmed declaration so we can
    // distinguish a same-line comment (which may trail a default value inside
    // `$.prop(...)`) from one that has already crossed a line boundary.
    let original_trimmed = line.trim();
    let props_call = original_trimmed.rfind_sub("$props")?;
    let assignment = code_bytes(&original_trimmed.as_bytes()[..props_call])
        .filter_map(|(offset, byte)| (byte == b'=').then_some(offset))
        .last()?;
    let initializer_comments: Vec<(usize, usize, String)> =
        crate::compiler::phases::phase3_transform::server::transform_script::extract_comments_from_snippet_with_pos(
            &original_trimmed[assignment + 1..props_call],
        )
        .into_iter()
        .map(|(start, comment)| {
            let start = assignment + 1 + start;
            let end = start + comment.len();
            (start, end, comment)
        })
        .collect();

    // The comments above have to survive in their output slots, but the text
    // helper's existing shape matchers need to see the declaration as
    // `= $props()`. Remove only the saved initializer separator from the copy
    // that is parsed below; all placement decisions keep using offsets into
    // `original_trimmed`.
    let mut transform_input = original_trimmed.to_string();
    if !initializer_comments.is_empty() {
        transform_input.replace_range(assignment + 1..props_call, " ");
    }

    // Canonicalise spacing in the `$props()` call (`= $props ()` → `= $props()`)
    // so the byte matchers below recognise whitespace variants. The AST detector
    // that gates this helper already confirmed it is a `$props()` rune call.
    let line =
        crate::compiler::phases::phase3_transform::utils::canonicalize_props_call(&transform_input);
    let trimmed = line.trim();

    // Determine the original declaration keyword (let or const) to preserve it
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };

    // Check for identifier pattern: let/const/var props = $props()
    // Reference: VariableDeclaration.js lines 51-60
    // When $props() is assigned to a plain identifier (not destructured),
    // it always generates $.rest_props() with the standard exclusion list.
    if !trimmed.contains('{') && memmem::find(trimmed.as_bytes(), b"= $props()").is_some() {
        // Pattern: let props = $props()
        let decl_start = decl_keyword.len() + 1;
        let eq_pos = trimmed.find('=')?;
        let var_name = trimmed[decl_start..eq_pos].trim();

        let mut seen = vec!["'$$slots'", "'$$events'", "'$$legacy'"];
        if analysis.custom_element.is_some() {
            seen.push("'$$host'");
        }

        // Always generate $.rest_props() for identifier pattern (no is_prop_source check)
        // In dev the binding's own name is passed along so unknown-prop warnings
        // can name it.
        let dev_name = if dev {
            format!(", '{}'", var_name)
        } else {
            String::new()
        };
        return Some(format!(
            "{} {} = $.rest_props($$props, [{}]{});\n",
            decl_keyword,
            var_name,
            seen.join(", "),
            dev_name
        ));
    }

    // Check for destructuring pattern: let { ... } = $props()
    if !trimmed.contains('{') || memmem::find(trimmed.as_bytes(), b"= $props()").is_none() {
        return None;
    }

    // Extract the part between { and }
    let (open_brace, close_brace) = props_pattern_span(trimmed)?;
    let props_str = &trimmed[open_brace + 1..close_brace];

    // Parse each prop - collect declarators for combining into a single `let` statement
    let mut declarators: Vec<String> = Vec::new();

    // Track "seen" prop names for $.rest_props() exclusion list.
    // Reference: VariableDeclaration.js lines 45-46
    // Starts with internal prop names that should always be excluded.
    // Holds each entry's JS literal spelling, because a numeric key is excluded
    // as a number upstream (`b.literal(key.value)`), not as a string.
    let mut seen: Vec<String> = vec![
        "'$$slots'".to_string(),
        "'$$events'".to_string(),
        "'$$legacy'".to_string(),
    ];
    if analysis.custom_element.is_some() {
        seen.push("'$$host'".to_string());
    }

    // Comments that bracket a declarator ride the esrap comment cursor
    // upstream: a same-line one after a kept default lands inside that
    // `$.prop(...)` call, everything else flushes before the next kept
    // declarator, and leftovers spill past the statement's `;`.
    let mut pending: Vec<(usize, String)> = Vec::new();
    let mut prev_value_end: Option<usize> = None;
    let mut trail_broken = false;

    for raw_part in split_declarators(props_str) {
        let part_off = raw_part.as_ptr() as usize - props_str.as_ptr() as usize;
        let (lead, core, trail) = scan_part_comments(part_off, raw_part);
        attach_or_pend(
            &lead,
            props_str,
            &mut declarators,
            &mut pending,
            prev_value_end,
            &mut trail_broken,
        );
        let Some((core_start, core_end)) = core else {
            continue;
        };
        let prop_part = &props_str[core_start..core_end];
        let before_len = declarators.len();
        let value_located = emit_prop_declarator(
            prop_part,
            &mut declarators,
            &mut seen,
            prop_source_vars,
            exported_names,
            analysis,
            read_only_props,
            dev,
        );
        if declarators.len() > before_len {
            if !pending.is_empty() {
                let prefix = flush_pending_before(&mut pending, props_str, core_start);
                declarators[before_len].insert_str(0, &prefix);
            }
            prev_value_end = value_located.then_some(core_end);
            trail_broken = false;
        }
        attach_or_pend(
            &trail,
            props_str,
            &mut declarators,
            &mut pending,
            prev_value_end,
            &mut trail_broken,
        );
    }

    // The original initializer comments come after every pattern node. Feed
    // them through the same trailing-comment rule as comments inside the
    // pattern. A default value is the final located output node, so a same-line
    // comment lands before the generated call's `)`; a plain/rest binding has
    // no located generated initializer and the comment remains pending until
    // after the declaration statement.
    for (start, end, text) in initializer_comments {
        let value_end = prev_value_end.map(|offset| open_brace + 1 + offset);
        let attachable = pending.is_empty()
            && !trail_broken
            && value_end.is_some_and(|value_end| {
                value_end <= start
                    && !original_trimmed[value_end..start]
                        .contains(['\n', '\r', '\u{2028}', '\u{2029}'])
            });
        if attachable
            && let Some(last) = declarators.last_mut()
            && let Some(pos) = last.rfind(')')
        {
            let is_line = text.starts_with("//");
            let insert = if is_line {
                format!(" {}\n", text)
            } else {
                format!(" {}", text)
            };
            last.insert_str(pos, &insert);
            if is_line {
                trail_broken = true;
            }
        } else {
            pending.push((end, text));
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn emit_prop_declarator(
        prop_part: &str,
        declarators: &mut Vec<String>,
        seen: &mut Vec<String>,
        prop_source_vars: &[String],
        exported_names: &[String],
        analysis: &ComponentAnalysis,
        read_only_props: &[(String, String)],
        dev: bool,
    ) -> bool {
        // Handle rest element: ...rest
        // Reference: VariableDeclaration.js lines 96-107
        if let Some(rest_name) = prop_part.strip_prefix("...") {
            let rest_name = rest_name.trim();
            // Generate: rest_name = $.rest_props($$props, ['$$slots', '$$events', '$$legacy', ...seen_props])
            let seen_literals: Vec<String> = seen.clone();
            let dev_name = if dev {
                format!(", '{}'", rest_name)
            } else {
                String::new()
            };
            declarators.push(format!(
                "{} = $.rest_props($$props, [{}]{})",
                rest_name,
                seen_literals.join(", "),
                dev_name
            ));
            return false;
        }

        // Handle: name = default_value (always generate for props with defaults)
        if let Some(eq_pos) = prop_part.find('=') {
            let name_part = prop_part[..eq_pos].trim();
            let raw_default_value = prop_part[eq_pos + 1..].trim();

            // Handle rename pattern: `originalProp: localVar = default`
            // In destructuring, `disabled: disabledProp = false` means:
            //   prop_name = "disabled" (the actual prop)
            //   local_name = "disabledProp" (the local variable)
            let (prop_key, local_name) = if let Some(colon_pos) = name_part.find(':') {
                let raw_key = name_part[..colon_pos].trim();
                // Strip surrounding quotes from prop name (e.g., 'weird-name': localVar)
                let pn = raw_key
                    .strip_prefix('\'')
                    .and_then(|s| s.strip_suffix('\''))
                    .or_else(|| raw_key.strip_prefix('"').and_then(|s| s.strip_suffix('"')))
                    .unwrap_or(raw_key);
                let ln = name_part[colon_pos + 1..].trim();
                (prop_key_js_literal(raw_key, pn), ln)
            } else {
                (format!("'{}'", name_part), name_part)
            };
            let prop_key = prop_key.as_str();

            // Strip $bindable() wrapper: $bindable(value) -> value
            // Reference: VariableDeclaration.js - unwrap_bindable()
            // Tolerate whitespace between the rune and the `(` (`$bindable (x)`
            // is valid JS that upstream's AST handles). H-061.
            let bindable_inner = strip_bindable_wrapper(raw_default_value);
            let was_bindable = bindable_inner.is_some();
            let default_value = if let Some(inner) = bindable_inner {
                if inner.is_empty() {
                    // $bindable() with no args - no default value
                    // Check if this binding is actually a prop source.
                    // In runes mode without accessors (accessors is forced false in runes mode),
                    // a $bindable() prop with no default value, no reassignment, and no mutation
                    // is NOT a prop source and should NOT get a $.prop() declaration.
                    // Reference: is_prop_source() in utils.js
                    let is_source = if analysis.runes {
                        // In runes mode, check binding properties.
                        // Resolve to the *prop* binding by kind, not merely by name:
                        // a same-named binding from another scope (e.g. a module-script
                        // function parameter `context` sharing the prop's name) can
                        // otherwise shadow the lookup and hide the prop's `reassigned`
                        // flag, wrongly demoting a reassigned no-default `$bindable()`
                        // to a plain `$$props.x` member access. Mirrors upstream's
                        // scope-based `context.state.scope.get(id.name)` resolution.
                        let binding = analysis
                            .root
                            .bindings
                            .iter()
                            .find(|b| {
                                b.name == local_name
                                    && matches!(
                                        b.kind,
                                        BindingKind::Prop | BindingKind::BindableProp
                                    )
                            })
                            .or_else(|| {
                                analysis.root.bindings.iter().find(|b| b.name == local_name)
                            });
                        if let Some(b) = binding {
                            analysis.accessors || b.reassigned || b.initial.is_some() || b.mutated
                        } else {
                            // Binding not found - be conservative, emit it
                            true
                        }
                    } else {
                        // In legacy mode, all props are sources
                        true
                    };
                    seen.push(prop_key.to_string());
                    if is_source {
                        let flags = calculate_prop_flags(local_name, analysis, false);
                        declarators.push(format!(
                            "{} = $.prop($$props, {}, {})",
                            local_name, prop_key, flags
                        ));
                    }
                    return false;
                }
                inner
            } else {
                raw_default_value
            };

            // Add this prop name to the "seen" list for rest_props exclusion
            seen.push(prop_key.to_string());

            // Transform default value: apply read-only prop substitutions
            let default_value = {
                let mut dv = default_value.to_string();
                if !read_only_props.is_empty() {
                    dv = super::read_only_props_ast::transform_read_only_props_ast(
                        &dv,
                        read_only_props,
                    )
                    .unwrap_or(dv);
                }
                // In runes mode the instance-script AST pass
                // (`ast_state_transform`) already wraps prop-source reads
                // (`b` → `b()`) across the whole statement, including these
                // `$.prop(..., () => <default>)` thunks. Wrapping here too
                // double-wraps (`b()()`), so only do the text wrap in legacy
                // mode, where the AST pass doesn't run on this output.
                if !analysis.runes && !prop_source_vars.is_empty() {
                    dv = super::prop_source_reads_ast::wrap_prop_source_reads_ast(
                        &dv,
                        prop_source_vars,
                        &[],
                        super::prop_source_reads_ast::ParseGoal::Expression,
                    )
                    .unwrap_or(dv);
                }
                dv
            };
            let default_value = default_value.as_str();

            // Check if the value needs $.proxy() wrapping.
            // Only $bindable() defaults get proxy-wrapped when should_proxy returns true.
            // Regular prop defaults are NOT proxied.
            // Reference: VariableDeclaration.js lines 80-84
            let needs_proxy = was_bindable && should_proxy_prop_default(default_value, analysis);
            let proxy_wrapped = if needs_proxy {
                if dev {
                    format!("$.tag_proxy($.proxy({}), '{}')", default_value, local_name)
                } else {
                    format!("$.proxy({})", default_value)
                }
            } else {
                default_value.to_string()
            };

            // Check if the VISITED default value is a simple expression. Upstream's
            // `get_prop_source` receives the already-proxied `initial`, so the
            // is_simple / lazy-thunk decision is made on `$.proxy(defValue)` — a
            // CallExpression, hence non-simple → thunked + PROPS_IS_LAZY_INITIAL.
            // Checking the bare `defValue` (an Identifier) instead would wrongly
            // treat it as simple and emit a non-lazy, un-thunked default.
            let is_simple = is_simple_expression_str(&proxy_wrapped, analysis, dev);

            // Calculate flags using the official logic
            let flags = calculate_prop_flags(local_name, analysis, !is_simple);

            if is_simple {
                declarators.push(format!(
                    "{} = $.prop($$props, {}, {}, {})",
                    local_name, prop_key, flags, proxy_wrapped
                ));
            } else {
                // Wrap non-simple values in a thunk: () => value
                // When value starts with '{', wrap in parens to prevent
                // OXC from parsing `() => {...}` as arrow with block body
                let lazy_arg = make_lazy_prop_arg(&proxy_wrapped);
                declarators.push(format!(
                    "{} = $.prop($$props, {}, {}, {})",
                    local_name, prop_key, flags, lazy_arg
                ));
            }
            true
        } else {
            // No default value - handle rename pattern: `originalProp: localVar`
            let (prop_key, local_name) = if let Some(colon_pos) = prop_part.find(':') {
                let raw_key = prop_part[..colon_pos].trim();
                // Strip surrounding quotes from prop name
                let pn = raw_key
                    .strip_prefix('\'')
                    .and_then(|s| s.strip_suffix('\''))
                    .or_else(|| raw_key.strip_prefix('"').and_then(|s| s.strip_suffix('"')))
                    .unwrap_or(raw_key);
                let ln = prop_part[colon_pos + 1..].trim();
                (prop_key_js_literal(raw_key, pn), ln)
            } else {
                (format!("'{}'", prop_part), prop_part)
            };
            let prop_key = prop_key.as_str();

            // Add to seen list for rest_props exclusion
            seen.push(prop_key.to_string());

            // Only generate $.prop() if this is a source prop or exported
            let is_exported = exported_names.contains(&local_name.to_string());
            if prop_source_vars.contains(&local_name.to_string()) || is_exported {
                // Calculate flags using the official logic (no lazy initial for props without defaults)
                let flags = calculate_prop_flags(local_name, analysis, false);

                declarators.push(format!(
                    "{} = $.prop($$props, {}, {})",
                    local_name, prop_key, flags
                ));
            }
            // Read-only props without defaults are accessed directly via $$props.propName
            false
        }
    }

    // Comments left after the last kept declarator flush before whatever
    // statement follows — past this statement's `;`.
    let tail: String = pending
        .iter()
        .map(|(_, text)| format!("\n{}", text))
        .collect();

    // Combine all declarators into a single `let` statement with comma separators
    if declarators.is_empty() {
        Some(String::new())
    } else if declarators.len() == 1 {
        Some(format!("{} {};{}\n", decl_keyword, declarators[0], tail))
    } else {
        // Multi-prop: combine with comma + newline + tab indent, matching official compiler
        let mut result = format!("{} {}", decl_keyword, declarators[0]);
        for decl in &declarators[1..] {
            result.push_str(",\n\t");
            result.push_str(decl);
        }
        result.push(';');
        result.push_str(&tail);
        result.push('\n');
        Some(result)
    }
}

/// Transform rest_prop member access to $$props.
pub(super) fn transform_rest_prop_member_access(line: &str, rest_prop_vars: &[String]) -> String {
    // AST-based fast path: handles the same identifier boundary,
    // computed-access, and direct-assignment exclusions for free.
    // Falls back to the regex text version when the AST helper
    // bails (parse failure, no match).
    if let Some(out) = super::rest_prop_member_access_ast::transform_rest_prop_member_access_ast(
        line,
        rest_prop_vars,
    ) {
        return out;
    }

    let mut result = line.to_string();

    for var_name in rest_prop_vars {
        let pattern = format!(r"\b{}\.", var_name);
        let re = match get_or_compile_regex(&pattern) {
            Some(r) => r,
            None => continue,
        };

        let mut offset = 0;
        let mut new_result = String::new();

        for mat in re.find_iter(&result.clone()) {
            new_result.push_str(&result[offset..mat.start()]);
            let after_match = &result[mat.end()..];

            // Check if next char is [ (computed property access)
            if after_match.starts_with('[') {
                new_result.push_str(mat.as_str());
            } else {
                // Find the end of the property name
                let mut prop_end = CharOffset::ZERO;
                for (i, c) in after_match.chars().enumerate() {
                    if c.is_alphanumeric() || c == '_' || c == '$' {
                        prop_end = CharOffset::new(i).next();
                    } else {
                        break;
                    }
                }

                let char_to_byte = CharToByte::new(after_match);
                let after_prop = char_to_byte.byte(prop_end).after(after_match).trim_start();
                let is_direct_assignment =
                    after_prop.starts_with('=') && !after_prop.starts_with("==");
                let has_deeper_access = after_prop.starts_with('.');

                if is_direct_assignment && !has_deeper_access {
                    new_result.push_str(mat.as_str());
                } else {
                    new_result.push_str("$$props.");
                }
            }

            offset = mat.end();
        }

        new_result.push_str(&result[offset..]);
        result = new_result;
    }

    result
}

/// Transform read-only props to $$props.propName.
pub(super) fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Wrap prop member expression mutations with `$$ownership_validator.mutation()`.
///
/// In legacy mode (after `transform_prop_assignments` has already converted):
///   `item.name = value` -> `item(item().name = value, true)`
/// This function detects that pattern and replaces it with:
///   `$$ownership_validator.mutation('item', ['item', 'name'], item(item().name = value, true), line, col)`
///
/// In runes mode (where member mutation wrapping is skipped):
///   `item().name = value` remains as-is from prop read transform
/// This function detects `prop().member = value` and wraps it with:
///   `$$ownership_validator.mutation('item', ['item', 'name'], item().name = value, line, col)`
///
/// Reference: validate_mutation() in shared/utils.js
pub(super) fn wrap_prop_mutation_validation(
    stmt: &str,
    prop_vars: &[(String, Option<String>)], // (var_name, prop_alias)
    source: &str,
) -> String {
    let _trimmed = stmt.trim();

    let mut result = stmt.to_string();
    let scan = PropMutationScan::new(source);

    for (var_name, prop_alias) in prop_vars {
        let alias_literal = match prop_alias {
            Some(alias) => format!("'{}'", alias),
            None => "null".to_string(),
        };
        // First, try the runes-mode pattern: `prop().member = value` (not wrapped in prop(..., true))
        // This handles the case where transform_prop_assignments skips member mutation wrapping in runes mode.
        let runes_prefix = format!("{}().", var_name);
        let mut runes_search_from = 0;
        let mut sites = PropMutationSites::collect(source, var_name, &scan);

        while runes_search_from < result.len() {
            let Some(prefix_rel) = result[runes_search_from..].find(&runes_prefix) else {
                break;
            };
            let abs_start = runes_search_from + prefix_rel;

            // Check this is a standalone identifier (not part of a longer name)
            if crate::compiler::utils::char_before(&result, abs_start)
                .is_some_and(|c| c.is_alphanumeric() || c == '_' || c == '$')
            {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Check it's not already inside a prop(prop()...) wrapper. The
            // printer breaks a long setter call across lines, so the `prop(`
            // need not be adjacent.
            let before = &result[..abs_start];
            if before.trim_end().ends_with(&format!("{}(", var_name)) {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }
            // Skip if already inside $$ownership_validator.mutation
            // Only the immediately enclosing call counts: a wrapper emitted earlier in the
            // program must not suppress later mutations of the same prop.
            if before.ends_with("mutation(")
                || (before.ends_with("], ")
                    && before.contains(&format!(
                        "$$ownership_validator.mutation({}, [",
                        alias_literal
                    )))
            {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Find the assignment expression
            let after_prefix = &result[abs_start + runes_prefix.len()..];

            // Parse member chain to find assignment operator
            let mut path_parts: Vec<String> = vec![format!("'{}'", var_name)];
            let chars: Vec<char> = after_prefix.chars().collect();
            let mut pos = 0;

            // Read the first dot member identifier
            let ident_start = pos;
            while pos < chars.len()
                && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
            {
                pos += 1;
            }
            if pos > ident_start {
                let ident: String = chars[ident_start..pos].iter().collect();
                path_parts.push(format!("'{}'", ident));
            }

            // Read additional dot-members or bracket accesses
            while pos < chars.len() && (chars[pos] == '.' || chars[pos] == '[') {
                if chars[pos] == '.' {
                    pos += 1;
                    let ident_start = pos;
                    while pos < chars.len()
                        && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                    {
                        pos += 1;
                    }
                    if pos > ident_start {
                        let ident: String = chars[ident_start..pos].iter().collect();
                        path_parts.push(format!("'{}'", ident));
                    }
                } else {
                    // bracket access
                    pos += 1; // skip [
                    let mut bracket_depth = 1;
                    let bracket_start = pos;
                    while pos < chars.len() && bracket_depth > 0 {
                        match chars[pos] {
                            '[' => bracket_depth += 1,
                            ']' => bracket_depth -= 1,
                            _ => {}
                        }
                        if bracket_depth > 0 {
                            pos += 1;
                        }
                    }
                    if bracket_depth == 0 {
                        let bracket_expr: String = chars[bracket_start..pos].iter().collect();
                        path_parts.push(bracket_expr);
                        pos += 1; // skip ]
                    }
                }
            }

            if path_parts.len() < 2 {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Check for assignment operator (=, +=, ++, etc.)
            // Skip whitespace
            while pos < chars.len() && chars[pos].is_whitespace() {
                pos += 1;
            }

            // Check for = (but not ==, ===, =>) or ++ or --
            let has_assignment = if pos < chars.len() {
                if chars[pos] == '='
                    && (pos + 1 >= chars.len() || (chars[pos + 1] != '=' && chars[pos + 1] != '>'))
                {
                    true
                } else if pos + 1 < chars.len()
                    && chars[pos + 1] == '='
                    && (pos + 2 >= chars.len() || chars[pos + 2] != '=')
                {
                    // compound assignment +=, -=, etc. (but not !== etc.)
                    matches!(chars[pos], '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^')
                } else if pos + 1 < chars.len()
                    && ((chars[pos] == '+' && chars[pos + 1] == '+')
                        || (chars[pos] == '-' && chars[pos + 1] == '-'))
                {
                    true // ++ or --
                } else {
                    false
                }
            } else {
                false
            };

            if !has_assignment {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Find the end of the full expression/statement
            // We need to find where this expression ends (at ; or end of line or , at depth 0)
            let expr_start = abs_start;
            let after_expr_start = &result[expr_start..];
            let mut depth = 0i32;
            let mut expr_end_pos = after_expr_start.len();
            let mut in_str: Option<char> = None;
            for (ci, c) in after_expr_start.char_indices() {
                if let Some(quote) = in_str {
                    if c == quote && !is_escaped(after_expr_start.as_bytes(), ci) {
                        in_str = None;
                    }
                } else {
                    match c {
                        '\'' | '"' | '`' => in_str = Some(c),
                        '(' | '[' | '{' => depth += 1,
                        ')' | ']' | '}' => {
                            if depth == 0 {
                                expr_end_pos = ci;
                                break;
                            }
                            depth -= 1;
                        }
                        ';' | '\n' if depth == 0 => {
                            expr_end_pos = ci;
                            break;
                        }
                        _ => {}
                    }
                }
            }

            let full_expr = result[expr_start..expr_start + expr_end_pos]
                .trim_end()
                .to_string();

            // Each mutation reports its own source position.
            let (line_num, col_num) = sites
                .take(
                    static_member_names(&path_parts).as_deref(),
                    assigned_value(&full_expr),
                )
                .unwrap_or_else(|| find_prop_mutation_location(source, var_name));

            // Build the path array
            let path_array = format!("[{}]", path_parts.join(", "));

            // Build the replacement
            let mut replacement = format!(
                "$$ownership_validator.mutation({}, {}, {}",
                alias_literal, path_array, full_expr,
            );
            if line_num > 0 {
                let _ = write!(replacement, ", {}, {}", line_num, col_num);
            }
            replacement.push(')');
            result = format!(
                "{}{}{}",
                &result[..expr_start],
                replacement,
                &result[expr_start + expr_end_pos..]
            );
            runes_search_from = expr_start + replacement.len();
        }

        // Pattern: `prop(prop().member_chain = value, true)` or `prop(prop()[expr] = value, true)`.
        // The assignment may carry one extra wrapping paren when it's consumed as an
        // expression result rather than a bare statement: `prop((prop().member = value), true)`.
        let outer_call = format!("{}(", var_name);
        let inner_call = format!("{}()", var_name);
        let mut search_from = 0;

        while search_from < result.len() {
            let Some(prefix_rel) = result[search_from..].find(&outer_call) else {
                break;
            };
            let abs_start = search_from + prefix_rel;
            let after_outer = abs_start + outer_call.len();

            // Check this is a standalone identifier (not part of a longer name)
            if crate::compiler::utils::char_before(&result, abs_start)
                .is_some_and(|c| c.is_alphanumeric() || c == '_' || c == '$')
            {
                search_from = after_outer;
                continue;
            }

            let mut inner_probe_start = skip_leading_ws(&result, after_outer);
            if result.as_bytes().get(inner_probe_start) == Some(&b'(') {
                inner_probe_start = skip_leading_ws(&result, inner_probe_start + 1);
            }
            if !result[inner_probe_start..].starts_with(&inner_call) {
                search_from = after_outer;
                continue;
            }
            let after_inner_call = inner_probe_start + inner_call.len();
            // Check that the next character is `.` or `[` (member access)
            if after_inner_call >= result.len() {
                search_from = after_outer;
                continue;
            }
            // Sound on a byte: both targets are ASCII, and no byte of a multi-byte
            // UTF-8 character can equal an ASCII byte.
            let next_char = result.as_bytes()[after_inner_call] as char;
            if next_char != '.' && next_char != '[' {
                search_from = after_outer;
                continue;
            }
            let wrapper_start_len = after_inner_call + 1 - abs_start; // includes the `.` or `[`

            // Find the inner assignment: after `prop(` find the matching `, true)`
            let inner_start = after_outer; // skip outer `prop(`

            // Find `, true)` that closes this specific prop() call
            // We need to find the matching closing paren, accounting for nesting
            let rest = &result[inner_start..];
            let mut depth = 1i32; // we're inside prop(
            let mut close_pos = None;
            let rest_chars: Vec<char> = rest.chars().collect();
            let char_to_byte = CharToByte::new(rest);
            let mut in_str: Option<char> = None;
            let mut ci = 0;
            while ci < rest_chars.len() {
                let c = rest_chars[ci];
                if let Some(quote) = in_str {
                    if c == quote && !is_escaped_char(&rest_chars, ci) {
                        in_str = None;
                    }
                    if c == '`'
                        && quote == '`'
                        && ci + 1 < rest_chars.len()
                        && rest_chars[ci + 1] == '{'
                    {
                        // Template literal interpolation - not handling deeply, just skip
                    }
                } else {
                    match c {
                        '\'' | '"' | '`' => in_str = Some(c),
                        '(' | '[' | '{' => depth += 1,
                        ')' | ']' | '}' => {
                            depth -= 1;
                            if depth == 0 {
                                close_pos = Some(CharOffset::new(ci));
                                break;
                            }
                        }
                        _ => {}
                    }
                }
                ci += 1;
            }

            let Some(close_char_pos) = close_pos else {
                search_from = abs_start + wrapper_start_len;
                continue;
            };

            // The content inside prop(...).
            let close_byte_pos = char_to_byte.byte(close_char_pos);
            let inner_content = close_byte_pos.before(rest);

            // Check if it ends with `, true` — the comma and the flag may be on
            // separate lines when the printer broke the call up.
            let inner_trimmed = inner_content.trim_end();
            let Some(head) = inner_trimmed
                .strip_suffix("true")
                .map(str::trim_end)
                .and_then(|head| head.strip_suffix(','))
            else {
                search_from = abs_start + wrapper_start_len;
                continue;
            };

            // Extract the assignment expression (without `, true`)
            let assignment_expr = head.trim();
            // Some call sites wrap the assignment in an extra pair of parens
            // (e.g. `(config().padAngle = value)`) when the result is consumed
            // as an expression; strip one layer before pattern-matching.
            let assignment_expr = assignment_expr
                .strip_prefix('(')
                .and_then(|s| s.strip_suffix(')'))
                .map(str::trim)
                .unwrap_or(assignment_expr);

            // Parse the member chain from `prop().member_chain`
            // Parse the member chain from `prop().member_chain` or `prop()[expr]`
            let prop_call_dot = format!("{}().", var_name);
            let prop_call_bracket = format!("{}()[", var_name);
            let (after_prop_call, starts_with_bracket) =
                if assignment_expr.starts_with(&prop_call_dot) {
                    (&assignment_expr[prop_call_dot.len()..], false)
                } else if assignment_expr.starts_with(&prop_call_bracket) {
                    (&assignment_expr[prop_call_bracket.len()..], true)
                } else {
                    search_from = abs_start + wrapper_start_len;
                    continue;
                };

            // Parse member identifiers/bracket accesses until we hit an assignment operator
            let mut path_parts: Vec<String> = vec![format!("'{}'", var_name)];
            let chars: Vec<char> = after_prop_call.chars().collect();
            let mut pos = 0;

            if starts_with_bracket {
                // Read bracket expression: find matching ]
                let mut bracket_depth = 1;
                let bracket_start = pos;
                while pos < chars.len() && bracket_depth > 0 {
                    match chars[pos] {
                        '[' => bracket_depth += 1,
                        ']' => bracket_depth -= 1,
                        _ => {}
                    }
                    if bracket_depth > 0 {
                        pos += 1;
                    }
                }
                if bracket_depth == 0 {
                    let bracket_expr: String = chars[bracket_start..pos].iter().collect();
                    // Use the expression directly (not quoted) for computed access
                    path_parts.push(bracket_expr);
                    pos += 1; // skip ]
                }
            } else {
                // Read the first dot member identifier
                let ident_start = pos;
                while pos < chars.len()
                    && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                {
                    pos += 1;
                }
                if pos > ident_start {
                    let ident: String = chars[ident_start..pos].iter().collect();
                    path_parts.push(format!("'{}'", ident));
                }
            }

            // Read additional dot-members or bracket accesses
            while pos < chars.len() && (chars[pos] == '.' || chars[pos] == '[') {
                if chars[pos] == '.' {
                    pos += 1;
                    let ident_start = pos;
                    while pos < chars.len()
                        && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                    {
                        pos += 1;
                    }
                    if pos > ident_start {
                        let ident: String = chars[ident_start..pos].iter().collect();
                        path_parts.push(format!("'{}'", ident));
                    }
                } else {
                    // bracket access
                    pos += 1; // skip [
                    let mut bracket_depth = 1;
                    let bracket_start = pos;
                    while pos < chars.len() && bracket_depth > 0 {
                        match chars[pos] {
                            '[' => bracket_depth += 1,
                            ']' => bracket_depth -= 1,
                            _ => {}
                        }
                        if bracket_depth > 0 {
                            pos += 1;
                        }
                    }
                    if bracket_depth == 0 {
                        let bracket_expr: String = chars[bracket_start..pos].iter().collect();
                        path_parts.push(bracket_expr);
                        pos += 1; // skip ]
                    }
                }
            }

            if path_parts.len() < 2 {
                search_from = abs_start + wrapper_start_len;
                continue;
            }

            // The full original expression is the entire prop(prop().member = value, true) call
            let end_pos = inner_start + close_byte_pos.next().get();
            // Upstream builds the `$.invalidate_inner_signals` sequence first and
            // passes the whole thing to `validate_mutation`, so the sequence has to
            // go inside the wrap rather than around it.
            let (abs_start, end_pos) = expand_to_invalidate_sequence(&result, abs_start, end_pos)
                .unwrap_or((abs_start, end_pos));
            let full_original_expr = result[abs_start..end_pos].to_string();

            // Each mutation reports its own source position.
            let (line_num, col_num) = sites
                .take(
                    static_member_names(&path_parts).as_deref(),
                    assigned_value(&full_original_expr),
                )
                .unwrap_or_else(|| find_prop_mutation_location(source, var_name));

            // Build the path array
            let path_array = format!("[{}]", path_parts.join(", "));

            // Build the replacement
            let mut replacement = format!(
                "$$ownership_validator.mutation({}, {}, {}",
                alias_literal, path_array, full_original_expr,
            );
            if line_num > 0 {
                let _ = write!(replacement, ", {}, {}", line_num, col_num);
            }
            replacement.push(')');
            result = format!(
                "{}{}{}",
                &result[..abs_start],
                replacement,
                &result[end_pos..]
            );
            search_from = abs_start + replacement.len();
        }
    }

    result
}

/// The byte offset of the first non-whitespace byte at or after `from`.
fn skip_leading_ws(text: &str, from: usize) -> usize {
    let rest = &text[from..];
    from + (rest.len() - rest.trim_start().len())
}

/// The span of `(<mutation>, $.invalidate_inner_signals(…))` around the
/// `prop(...)` call at `start..end`, when a legacy indirect binding put one there.
fn expand_to_invalidate_sequence(text: &str, start: usize, end: usize) -> Option<(usize, usize)> {
    let open = text[..start].trim_end().len().checked_sub(1)?;
    if text.as_bytes()[open] != b'(' {
        return None;
    }
    let rest = text[end..].trim_start().strip_prefix(',')?;
    if !rest.trim_start().starts_with("$.invalidate_inner_signals") {
        return None;
    }
    let mut depth = 0i32;
    for (offset, ch) in text[open..].char_indices() {
        match ch {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                depth -= 1;
                if depth == 0 {
                    let close = open + offset + 1;
                    return (close > end).then_some((open, close));
                }
            }
            _ => {}
        }
    }
    None
}

/// One mutation of a prop as it is written in the source.
struct PropMutationSite {
    line: usize,
    column: usize,
    /// The member names it writes, or `None` once any element is computed.
    chain: Option<Vec<String>>,
    /// The identifier-shaped words of the value it assigns.
    value_words: Vec<String>,
    /// Where the generated code for this site is emitted, which is the order
    /// `take` walks: plain instance statement, then `$:` body (a
    /// `legacy_pre_effect` at the end of the instance), then template.
    region: u8,
    used: bool,
}

/// The source mutations of one prop, in source order.
pub(super) struct PropMutationSites {
    sites: Vec<PropMutationSite>,
    /// A member write through this prop that the chain scan could not NAME —
    /// a computed key that is neither an identifier nor a literal. It is not a
    /// site (there is nothing to line the position up with) but it is still a
    /// member write, which is a different question and the one upstream's
    /// `needs_mutation_validation` latch asks.
    unnameable_member_write: bool,
}

/// The two source-wide scans every prop's site collection needs. Neither
/// depends on the prop, so recomputing them per prop made the pass quadratic
/// in the script length.
pub(super) struct PropMutationScan {
    reactive: Vec<(usize, usize)>,
    code: CodeSpans,
    /// The offset past the last `</script>`; every site at or after it is
    /// written in the template.
    template_start: usize,
}

impl PropMutationScan {
    pub(super) fn new(source: &str) -> Self {
        Self {
            reactive: reactive_statement_ranges(source),
            code: CodeSpans::scan(source),
            template_start: memchr::memmem::rfind(source.as_bytes(), b"</script>")
                .map_or(source.len(), |at| at + "</script>".len()),
        }
    }
}

impl PropMutationSites {
    pub(super) fn collect(source: &str, var_name: &str, scan: &PropMutationScan) -> Self {
        let mut sites = Vec::new();
        let mut unnameable_member_write = false;
        let reactive = &scan.reactive;
        let template_start = scan.template_start;
        let bytes = source.as_bytes();
        let mut search = memchr::memmem::find(bytes, b"<script").unwrap_or(0);
        while search < source.len() {
            let Some(rel) = memchr::memmem::find(&bytes[search..], var_name.as_bytes()) else {
                break;
            };
            let start = search + rel;
            let end = start + var_name.len();
            search = end;
            if !scan.code.contains(start) {
                continue;
            }
            if crate::compiler::utils::char_before(source, start)
                .is_some_and(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.')
            {
                continue;
            }
            if let Some((after, chain, nameable)) = scan_prop_mutation_target(source, start, end)
                && let Some(value_start) = mutation_value_start(source, after).or_else(|| {
                    // A PREFIX update (`--p.deep.c`) has its operator before
                    // the identifier; the site's position stays the identifier.
                    let head = source[..start].trim_end();
                    (head.ends_with("++") || head.ends_with("--")).then_some(after)
                })
            {
                if !nameable {
                    // Not a site — there is nothing to line a position up with —
                    // but the latch below needs to know it happened.
                    unnameable_member_write = true;
                    continue;
                }
                let (line, column) =
                    crate::compiler::phases::phase3_transform::utils::locate_in_source(
                        source, start,
                    );
                sites.push(PropMutationSite {
                    line,
                    column,
                    chain,
                    value_words: identifier_words(&mutation_value_text(source, value_start)),
                    region: if start >= template_start {
                        2
                    } else if reactive
                        .iter()
                        .any(|(from, to)| (*from..*to).contains(&start))
                    {
                        1
                    } else {
                        0
                    },
                    used: false,
                });
            }
        }
        // A `$:` body is emitted at the end of the instance script as a
        // `legacy_pre_effect` and the template after that, so ordering the
        // sites by emission region is what keeps them lined up with the output
        // when the value cannot tell two mutations of the same member apart.
        sites.sort_by_key(|site| site.region);
        Self {
            sites,
            unnameable_member_write,
        }
    }

    /// Whether the source writes through a member of this prop, whether or not
    /// the chain scan could name the member. Upstream latches
    /// `needs_mutation_validation` before it builds the path
    /// (`shared/utils.js:406`), so an unspellable computed key still declares
    /// the validator — `is_empty` answers the narrower question of whether there
    /// is a position to line the wrap up with.
    pub(super) fn has_member_write(&self) -> bool {
        !self.sites.is_empty() || self.unnameable_member_write
    }

    /// Whether the source writes through a member of this prop at all.
    ///
    /// Upstream reaches `validate_mutation` from an `AssignmentExpression` whose
    /// `left` is a `MemberExpression`; a destructuring pattern holding the same
    /// member (`[items[i], items[s]] = …`) is not one, so its leaves — which
    /// rsvelte lowers to the same setter calls a plain write produces — must not
    /// be validated. The scan below already declines to record those as sites,
    /// which makes "this prop has no site" the answer to that question.
    pub(super) fn is_empty(&self) -> bool {
        self.sites.is_empty()
    }

    /// The source position of the mutation that assigned `value`. Matching on
    /// the member names and on the words of the assigned value rather than on
    /// position is what keeps a moved statement — a `$:` body becomes a
    /// `legacy_pre_effect` at the end of the output — from taking the location
    /// of whichever mutation happens to be printed before it. `value` is the
    /// right-hand side alone: the setter call that wraps it in the generated
    /// code (`p(p().x = v, true)`) would otherwise contribute a `true`.
    pub(super) fn take(&mut self, chain: Option<&[String]>, value: &str) -> Option<(usize, usize)> {
        let words = identifier_words(value);
        let best = self
            .sites
            .iter()
            .enumerate()
            .filter(|(_, site)| {
                !site.used
                    && match (chain, &site.chain) {
                        (Some(want), Some(have)) => want == have.as_slice(),
                        _ => false,
                    }
            })
            .max_by_key(|(index, site)| {
                // Repeated generic words (`prop`, `value`, callback parameters) must not
                // outscore the discriminating words in the actual RHS. Without deduping,
                // a later `filter.value = filter.value.filter(...)` can steal the source
                // location of an earlier assignment merely by repeating `value` more.
                let unique_words = site
                    .value_words
                    .iter()
                    .enumerate()
                    .filter(|(word_index, word)| !site.value_words[..*word_index].contains(word));
                let (shared, missing) =
                    unique_words.fold((0, 0), |(shared, missing), (_, word)| {
                        if words.contains(word) {
                            (shared + 1, missing)
                        } else {
                            (shared, missing + 1)
                        }
                    });
                // Prefer more evidence from the generated RHS, then fewer source-only
                // words. Ties keep source order.
                (
                    shared,
                    std::cmp::Reverse(missing),
                    std::cmp::Reverse(*index),
                )
            })
            .map(|(index, _)| index);
        let index = best.or_else(|| self.sites.iter().position(|site| !site.used))?;
        self.sites[index].used = true;
        Some((self.sites[index].line, self.sites[index].column))
    }
}

/// The byte ranges of the `$:` statements in the instance script. A `$:` label
/// is only reactive at the top level, so nested ones are skipped by depth.
fn reactive_statement_ranges(source: &str) -> Vec<(usize, usize)> {
    let bytes = source.as_bytes();
    let script = memchr::memmem::find(bytes, b"<script").unwrap_or(0);
    let mut ranges = Vec::new();
    let mut depth = 0i32;
    let mut i = script;
    while i + 1 < bytes.len() {
        match (bytes[i], bytes[i + 1]) {
            (b'/', b'/') => {
                i = memchr::memchr(b'\n', &bytes[i..]).map_or(bytes.len(), |at| i + at);
            }
            (b'/', b'*') => {
                i += 2;
                i = match memchr::memmem::find(&bytes[i..], b"*/") {
                    Some(at) => i + at,
                    None => bytes.len().saturating_sub(1),
                };
                i += 2;
            }
            (quote @ (b'"' | b'\'' | b'`'), _) => {
                i += 1;
                while i < bytes.len() {
                    let Some(at) = memchr::memchr2(quote, b'\\', &bytes[i..]) else {
                        i = bytes.len();
                        break;
                    };
                    i += at;
                    if bytes[i] == quote {
                        break;
                    }
                    i += 2;
                }
                i += 1;
            }
            (b'{' | b'(' | b'[', _) => {
                depth += 1;
                i += 1;
            }
            (b'}' | b')' | b']', _) => {
                depth -= 1;
                i += 1;
            }
            (b'$', b':') if depth == 0 => {
                let mut inner = 0i32;
                let mut j = i + 2;
                while j < bytes.len() {
                    match bytes[j] {
                        b'{' | b'(' | b'[' => inner += 1,
                        b'}' | b')' | b']' => inner -= 1,
                        b';' | b'\n' if inner <= 0 => break,
                        _ => {}
                    }
                    j += 1;
                }
                ranges.push((i, j));
                i = j;
            }
            _ => i += 1,
        }
    }
    ranges
}

/// The value half of an assignment expression. Comparing whole expressions
/// would count the member chain, which every candidate for the same path
/// shares, and a value that repeats that chain would then outscore a literal.
fn assigned_value(expression: &str) -> &str {
    let bytes = expression.as_bytes();
    for i in 0..bytes.len() {
        if bytes[i] != b'=' {
            continue;
        }
        let previous = i.checked_sub(1).map(|p| bytes[p]);
        if bytes.get(i + 1) != Some(&b'=')
            && bytes.get(i + 1) != Some(&b'>')
            && !matches!(previous, Some(b'=') | Some(b'!') | Some(b'<') | Some(b'>'))
        {
            return &expression[i + 1..];
        }
    }
    expression
}

/// The identifier-shaped words of `text`, which is how a source value and the
/// transformed one the output carries (`x` inside `$.get(x)`) are compared.
fn identifier_words(text: &str) -> Vec<String> {
    let mut words = Vec::new();
    let mut current = String::new();
    for ch in text.chars() {
        if ch.is_alphanumeric() || ch == '_' || ch == '$' {
            current.push(ch);
        } else if !current.is_empty() {
            words.push(std::mem::take(&mut current));
        }
    }
    if !current.is_empty() {
        words.push(current);
    }
    words
}

/// Advance past TypeScript non-null assertions, which sit between an identifier
/// and the accessor that follows it (`selected!.from`).
fn skip_non_null_assertions(bytes: &[u8], mut pos: usize) -> usize {
    while bytes.get(pos) == Some(&b'!') && bytes.get(pos + 1) != Some(&b'=') {
        pos += 1;
    }
    pos
}

/// Scan a prop mutation target, including a TypeScript assertion that wraps
/// either the root or an intermediate member chain:
/// `(result as any)[key] = value` and `(step.params as any)._id = value`.
/// `(end, names, nameable)` for the member chain written through the root at
/// `root_start..root_end`, or `None` when there is no member access at all.
fn scan_prop_mutation_target(
    source: &str,
    root_start: usize,
    root_end: usize,
) -> Option<(usize, Option<Vec<String>>, bool)> {
    let bytes = source.as_bytes();
    let chain_start = skip_non_null_assertions(bytes, root_end);
    let (mut after, mut chain, mut saw_member, mut nameable) =
        if starts_member_access(bytes, chain_start) {
            let (after, chain, nameable) = scan_member_chain_names(source, chain_start)?;
            (after, chain, true, nameable)
        } else {
            (chain_start, Some(Vec::new()), false, true)
        };

    if let Some(assertion_end) = parenthesized_ts_assertion_end(source, root_start, after) {
        after = skip_whitespace_chars(source, assertion_end);
        if starts_member_access(bytes, after) {
            let (tail_end, tail_chain, tail_nameable) = scan_member_chain_names(source, after)?;
            chain = match (chain, tail_chain) {
                (Some(mut head), Some(tail)) => {
                    head.extend(tail);
                    Some(head)
                }
                _ => None,
            };
            after = tail_end;
            saw_member = true;
            nameable = nameable && tail_nameable;
        }
    }

    saw_member.then_some((after, chain, nameable))
}

/// Return the byte after the closing parenthesis when `root_start..expression_end`
/// is parenthesized — either around a TypeScript `as` / `satisfies` assertion or
/// around nothing at all. Upstream never sees the wrapper: acorn-typescript
/// erases the assertion and acorn erases the parentheses, so `(object as any).q`
/// and `(object).q` are both a member write through `object`, reported at the
/// chain root rather than at the `(`.
fn parenthesized_ts_assertion_end(
    source: &str,
    root_start: usize,
    expression_end: usize,
) -> Option<usize> {
    let (open, ch) = source[..root_start]
        .char_indices()
        .rev()
        .find(|(_, ch)| !ch.is_whitespace())?;
    if ch != '(' {
        return None;
    }
    let close =
        crate::compiler::phases::phase1_parse::utils::find_matching_bracket(source, open + 1, '(')?;
    if expression_end > close {
        return None;
    }
    let assertion = source[expression_end..close].trim_start();
    if assertion.is_empty() {
        return Some(close + 1);
    }
    let has_keyword = ["as", "satisfies"].into_iter().any(|keyword| {
        assertion.strip_prefix(keyword).is_some_and(|tail| {
            tail.chars()
                .next()
                .is_some_and(|ch| ch.is_whitespace() && !tail.trim().is_empty())
        })
    });
    has_keyword.then_some(close + 1)
}

/// Whether a member access — plain, computed or optional — starts at `pos`.
fn starts_member_access(bytes: &[u8], pos: usize) -> bool {
    match bytes.get(pos) {
        Some(b'.') | Some(b'[') => true,
        Some(b'?') => bytes.get(pos + 1) == Some(&b'.'),
        _ => false,
    }
}

/// The offset of the first non-whitespace character at or after `pos`.
///
/// Stepping by characters is what keeps a non-ASCII JavaScript space (`U+3000`,
/// NBSP) recognised — its lead byte Latin-1-decodes to a letter — and is what keeps
/// the cursor from stranding inside a character whose `0x85`/`0xA0` continuation
/// byte would read as whitespace on its own.
fn skip_whitespace_chars(source: &str, mut pos: usize) -> usize {
    while let Some(c) = crate::compiler::utils::char_at(source, pos) {
        if !c.is_whitespace() {
            break;
        }
        pos += c.len_utf8();
    }
    pos
}

/// The offset just after the mutation operator at `pos`, or `None` when there
/// is no operator there.
fn mutation_value_start(source: &str, mut pos: usize) -> Option<usize> {
    if !is_mutation_operator(source, pos) {
        return None;
    }
    let bytes = source.as_bytes();
    pos = skip_whitespace_chars(source, pos);
    // `++` / `--` write no value of their own.
    if matches!(bytes.get(pos), Some(b'+') | Some(b'-')) && bytes.get(pos + 1) == bytes.get(pos) {
        return Some((pos + 2).min(bytes.len()));
    }
    while pos < bytes.len() && bytes[pos] != b'=' {
        pos += 1;
    }
    Some((pos + 1).min(bytes.len()))
}

/// The assigned value's text, from `pos` to the end of the mutation statement.
///
/// A newline ends the statement only at bracket depth zero and only once some
/// value has been read — an `=` at the end of its line opens the value on the
/// next one — and a comment contributes nothing: the generated expression these
/// words are matched against carries neither the source's line breaks nor its
/// comments.
fn mutation_value_text(source: &str, pos: usize) -> String {
    let bytes = source.as_bytes();
    let mut text = String::new();
    let mut segment = pos;
    let mut depth = 0i32;
    let mut saw_value = false;
    let mut i = pos;
    let end = loop {
        if i >= bytes.len() {
            break bytes.len();
        }
        match (bytes[i], bytes.get(i + 1).copied()) {
            (b'/', Some(b'/')) => {
                text.push_str(&source[segment..i]);
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
                segment = i;
            }
            (b'/', Some(b'*')) => {
                text.push_str(&source[segment..i]);
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
                segment = i;
            }
            (quote @ (b'"' | b'\'' | b'`'), _) => {
                saw_value = true;
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    i += if bytes[i] == b'\\' { 2 } else { 1 };
                }
                i = (i + 1).min(bytes.len());
            }
            (b'(' | b'[' | b'{', _) => {
                saw_value = true;
                depth += 1;
                i += 1;
            }
            (b')' | b']' | b'}', _) => {
                if depth == 0 {
                    break i;
                }
                depth -= 1;
                i += 1;
            }
            (b';', _) if depth == 0 => break i,
            (b'\n', _) if depth == 0 && saw_value => break i,
            (byte, _) => {
                saw_value |= !byte.is_ascii_whitespace();
                i += 1;
            }
        }
    };
    text.push_str(&source[segment..end]);
    text
}

/// The member names `'a'`-quoted by the path builders, or `None` when any
/// element is a computed access that cannot be compared by name.
fn static_member_names(path_parts: &[String]) -> Option<Vec<String>> {
    path_parts[1..]
        .iter()
        .map(|part| {
            part.strip_prefix('\'')
                .and_then(|p| p.strip_suffix('\''))
                .filter(|p| !p.contains('\''))
                .map(str::to_string)
        })
        .collect()
}

/// Whether `target` sits in code rather than inside a comment or a string /
/// template literal. `from` must itself be a code offset — the scan starts
/// there in the code state, so callers pass the previous confirmed match.
/// Byte ranges of `source` the comment / string scanner reports as code.
///
/// The scanner is deterministic left-to-right, so running it once and looking
/// a position up beats re-running it from the previous hit for every candidate
/// occurrence of every prop — which was quadratic in the script length.
pub(super) struct CodeSpans {
    /// Sorted, non-overlapping `[start, end)` ranges. Everything before the
    /// `<script` tag is code, matching the empty scan the old caller did there.
    spans: Vec<(usize, usize)>,
}

impl CodeSpans {
    fn scan(source: &str) -> Self {
        #[derive(PartialEq)]
        enum S {
            Code,
            Line,
            Block,
            Single,
            Double,
            Template,
        }
        let bytes = source.as_bytes();
        let mut spans = Vec::new();
        let mut state = S::Code;
        let mut code_from = 0usize;
        let mut i = memchr::memmem::find(bytes, b"<script").unwrap_or(0);
        while i < bytes.len() {
            // Every state below is looking for one of at most three bytes, so
            // step over the run in between with SIMD rather than one at a time.
            let rest = &bytes[i..];
            let next_interesting = match state {
                S::Code => match (
                    memchr::memchr3(b'/', b'\'', b'"', rest),
                    memchr::memchr(b'`', rest),
                ) {
                    (Some(a), Some(b)) => Some(a.min(b)),
                    (Some(a), None) => Some(a),
                    (None, b) => b,
                },
                S::Line => memchr::memchr(b'\n', rest),
                S::Block => memchr::memmem::find(rest, b"*/"),
                S::Single => memchr::memchr2(b'\\', b'\'', rest),
                S::Double => memchr::memchr2(b'\\', b'"', rest),
                S::Template => memchr::memchr2(b'\\', b'`', rest),
            };
            let skip = next_interesting.unwrap_or(rest.len());
            if skip > 0 {
                i += skip;
                continue;
            }
            let was_code = state == S::Code;
            let c = bytes[i];
            let next = bytes.get(i + 1).copied();
            match state {
                S::Code => match (c, next) {
                    (b'/', Some(b'/')) => {
                        spans.push((code_from, i + 1));
                        state = S::Line;
                        i += 2;
                        continue;
                    }
                    (b'/', Some(b'*')) => {
                        spans.push((code_from, i + 1));
                        state = S::Block;
                        i += 2;
                        continue;
                    }
                    (b'\'', _) => state = S::Single,
                    (b'"', _) => state = S::Double,
                    (b'`', _) => state = S::Template,
                    _ => {}
                },
                S::Line => {
                    if c == b'\n' {
                        state = S::Code;
                    }
                }
                S::Block => {
                    if c == b'*' && next == Some(b'/') {
                        state = S::Code;
                        // `is_in_code` reported the byte after the `*` as code
                        // because its two-byte skip overshot the query.
                        code_from = i + 1;
                        i += 2;
                        continue;
                    }
                }
                S::Single | S::Double | S::Template => {
                    if c == b'\\' {
                        i += 2;
                        continue;
                    }
                    let closer = match state {
                        S::Single => b'\'',
                        S::Double => b'"',
                        _ => b'`',
                    };
                    if c == closer {
                        state = S::Code;
                    }
                }
            }
            i += 1;
            // The old scanner reported the state *at* the queried byte, so a
            // quote opens its string at the byte after it and closes at the
            // byte after the closer.
            match (was_code, state == S::Code) {
                (true, false) => spans.push((code_from, i)),
                (false, true) => code_from = i,
                _ => {}
            }
        }
        if state == S::Code {
            spans.push((code_from, bytes.len()));
        }
        spans.retain(|(from, to)| from < to);
        Self { spans }
    }

    fn contains(&self, pos: usize) -> bool {
        self.spans
            .binary_search_by(|&(from, to)| {
                if pos < from {
                    std::cmp::Ordering::Greater
                } else if pos >= to {
                    std::cmp::Ordering::Less
                } else {
                    std::cmp::Ordering::Equal
                }
            })
            .is_ok()
    }
}

#[cfg(test)]
mod code_spans_tests {
    use super::CodeSpans;

    /// The scanner `CodeSpans` replaced, kept verbatim as the oracle.
    fn is_in_code_reference(source: &str, from: usize, target: usize) -> bool {
        #[derive(PartialEq)]
        enum S {
            Code,
            Line,
            Block,
            Single,
            Double,
            Template,
        }
        let bytes = source.as_bytes();
        let mut state = S::Code;
        let mut i = from;
        while i < target {
            let c = bytes[i];
            let next = bytes.get(i + 1).copied();
            match state {
                S::Code => match (c, next) {
                    (b'/', Some(b'/')) => {
                        state = S::Line;
                        i += 2;
                        continue;
                    }
                    (b'/', Some(b'*')) => {
                        state = S::Block;
                        i += 2;
                        continue;
                    }
                    (b'\'', _) => state = S::Single,
                    (b'"', _) => state = S::Double,
                    (b'`', _) => state = S::Template,
                    _ => {}
                },
                S::Line => {
                    if c == b'\n' {
                        state = S::Code;
                    }
                }
                S::Block => {
                    if c == b'*' && next == Some(b'/') {
                        state = S::Code;
                        i += 2;
                        continue;
                    }
                }
                S::Single | S::Double | S::Template => {
                    if c == b'\\' {
                        i += 2;
                        continue;
                    }
                    let closer = match state {
                        S::Single => b'\'',
                        S::Double => b'"',
                        _ => b'`',
                    };
                    if c == closer {
                        state = S::Code;
                    }
                }
            }
            i += 1;
        }
        state == S::Code
    }

    fn assert_agrees(source: &str) {
        let script = memchr::memmem::find(source.as_bytes(), b"<script").unwrap_or(0);
        let spans = CodeSpans::scan(source);
        for pos in 0..source.len() {
            let expected = if pos < script {
                true
            } else {
                is_in_code_reference(source, script, pos)
            };
            assert_eq!(
                spans.contains(pos),
                expected,
                "byte {pos} ({:?}) in {source:?}",
                &source[pos..(pos + 1).min(source.len())]
            );
        }
    }

    #[test]
    fn code_spans_agree_with_the_scanner_they_replaced() {
        for source in [
            "<script>let a = 1; // a.b = 2\na.c = 3;</script>",
            "<script>/* a.b = 1 */ a.c = 2;</script>",
            "<script>let s = 'a.b = 1'; a.c = 2;</script>",
            "<script>let s = \"a.b = 1\"; a.c = 2;</script>",
            "<script>let s = `a.b = ${x.y} 1`; a.c = 2;</script>",
            "<script>let s = 'it\\'s'; a.c = 2;</script>",
            // Unterminated: the tail is never code.
            "<script>let s = 'oops; a.c = 2;</script>",
            "<script>/* never closed a.c = 2;</script>",
            // A `//` inside a string must not open a comment.
            "<script>let s = '// a.b'; a.c = 2;</script>",
            // Adjacent comment terminators.
            "<script>/**/a.c = 2;/*x*/</script>",
            // No script tag at all: everything is code.
            "<p>a.b = 1</p>",
        ] {
            assert_agrees(source);
        }
    }
}

/// Advance past `.name` / `[expr]` accessors, returning the offset just after
/// the chain plus the names it reads — `None` once a computed access appears.
/// `(end, names, nameable)`. `nameable` is false when a computed key is one
/// upstream declines to wrap, which leaves a member write that is not a site.
fn scan_member_chain_names(
    source: &str,
    mut pos: usize,
) -> Option<(usize, Option<Vec<String>>, bool)> {
    let bytes = source.as_bytes();
    let mut names = Some(Vec::new());
    loop {
        while pos < bytes.len() && (bytes[pos] == b' ' || bytes[pos] == b'\t') {
            pos += 1;
        }
        pos = skip_non_null_assertions(bytes, pos);
        // An optional access reads the same member the plain one would; `?.[`
        // is computed, so land on the `[` rather than on the `.`.
        if bytes.get(pos) == Some(&b'?') && bytes.get(pos + 1) == Some(&b'.') {
            pos += if bytes.get(pos + 2) == Some(&b'[') {
                2
            } else {
                1
            };
        }
        if pos >= bytes.len() {
            return Some((pos, names, true));
        }
        match bytes[pos] {
            b'.' => {
                pos += 1;
                while pos < bytes.len() && (bytes[pos] == b' ' || bytes[pos] == b'\t') {
                    pos += 1;
                }
                let ident_start = pos;
                while let Some(c) = crate::compiler::utils::char_at(source, pos) {
                    if c.is_alphanumeric() || c == '_' || c == '$' {
                        pos += c.len_utf8();
                    } else {
                        break;
                    }
                }
                if pos == ident_start {
                    return None;
                }
                if let Some(names) = names.as_mut() {
                    names.push(source[ident_start..pos].to_string());
                }
            }
            b'[' => {
                names = None;
                let key_start = pos + 1;
                let mut depth = 0usize;
                while pos < bytes.len() {
                    match bytes[pos] {
                        b'[' => depth += 1,
                        b']' => {
                            depth -= 1;
                            if depth == 0 {
                                pos += 1;
                                break;
                            }
                        }
                        _ => {}
                    }
                    pos += 1;
                }
                if depth != 0 {
                    return None;
                }
                if !is_nameable_computed_key(source[key_start..pos - 1].trim()) {
                    // Upstream's `validate_mutation` returns the expression
                    // unwrapped here, so this is not a site — but it IS a member
                    // write, and the caller needs to tell the two apart.
                    return Some((pos, names, false));
                }
            }
            _ => return Some((pos, names, true)),
        }
    }
}

/// Whether a computed key is one upstream's `validate_mutation` accepts: it
/// takes a `Literal` or an `Identifier` for the property and returns the
/// expression unwrapped for anything else, so `item[a.b] = v` is not a site.
fn is_nameable_computed_key(key: &str) -> bool {
    let key = strip_ts_assertion(key);
    let mut chars = key.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    if matches!(first, '\'' | '"') {
        return key.len() > 1
            && key.ends_with(first)
            && !key[1..key.len() - 1].contains(first)
            && !key[1..key.len() - 1].contains('\\');
    }
    if first.is_ascii_digit() {
        return key
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '_');
    }
    (first.is_alphabetic() || first == '_' || first == '$')
        && chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// The expression a top-level TypeScript assertion wraps, which is what acorn
/// leaves behind: `object[attrKey as keyof typeof object]` writes `attrKey`.
fn strip_ts_assertion(key: &str) -> &str {
    let bytes = key.as_bytes();
    let mut depth = 0i32;
    let mut i = 0usize;
    while i < bytes.len() {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            quote @ (b'"' | b'\'' | b'`') => {
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    i += if bytes[i] == b'\\' { 2 } else { 1 };
                }
            }
            _ if depth == 0 && bytes[i].is_ascii_whitespace() => {
                let tail = key[i..].trim_start();
                for keyword in ["as", "satisfies"] {
                    if tail
                        .strip_prefix(keyword)
                        .is_some_and(|rest| rest.starts_with(char::is_whitespace))
                    {
                        return key[..i].trim_end();
                    }
                }
            }
            _ => {}
        }
        i += 1;
    }
    key
}

/// Whether an assignment or update operator starts at `pos`.
fn is_mutation_operator(source: &str, pos: usize) -> bool {
    let bytes = source.as_bytes();
    let mut pos = skip_whitespace_chars(source, pos);
    if pos >= bytes.len() {
        return false;
    }
    if bytes[pos] == b'+' && bytes.get(pos + 1) == Some(&b'+') {
        return true;
    }
    if bytes[pos] == b'-' && bytes.get(pos + 1) == Some(&b'-') {
        return true;
    }
    let op_start = pos;
    while pos < bytes.len()
        && matches!(
            bytes[pos],
            b'+' | b'-' | b'*' | b'/' | b'%' | b'&' | b'|' | b'^' | b'?' | b'<' | b'>'
        )
    {
        pos += 1;
    }
    if pos >= bytes.len() || bytes[pos] != b'=' {
        return false;
    }
    // `==`, `===`, `<=`, `>=` and `=>` compare rather than assign.
    if pos == op_start && bytes.get(pos + 1) == Some(&b'=') {
        return false;
    }
    if pos > op_start && matches!(bytes[pos - 1], b'<' | b'>') && pos - op_start == 1 {
        return false;
    }
    bytes.get(pos + 1) != Some(&b'=') && bytes.get(pos + 1) != Some(&b'>')
}

/// Find the line/column in the original source for a prop mutation.
/// Searches for the original assignment pattern like `item.name =` or `item[expr] =` in the source.
pub(super) fn find_prop_mutation_location(source: &str, var_name: &str) -> (usize, usize) {
    // Look for `var_name.` or `var_name[` in the source (before text transforms added `()`)
    let pattern_dot = format!("{}.", var_name);
    let pattern_bracket = format!("{}[", var_name);
    // Search for the pattern after the script tag
    let search_source =
        if let Some(script_idx) = memchr::memmem::find(source.as_bytes(), b"<script") {
            &source[script_idx..]
        } else {
            source
        };

    let relative_offset = match (
        memchr::memmem::find(search_source.as_bytes(), pattern_dot.as_bytes()),
        memchr::memmem::find(search_source.as_bytes(), pattern_bracket.as_bytes()),
    ) {
        (Some(d), Some(b)) => Some(d.min(b)),
        (Some(d), None) => Some(d),
        (None, Some(b)) => Some(b),
        (None, None) => None,
    };

    if let Some(relative_offset) = relative_offset {
        let offset = if let Some(script_idx) = memchr::memmem::find(source.as_bytes(), b"<script") {
            script_idx + relative_offset
        } else {
            relative_offset
        };
        crate::compiler::phases::phase3_transform::utils::locate_in_source(source, offset)
    } else {
        (0, 0)
    }
}

/// Transform console.METHOD() calls in dev mode to wrap arguments with
/// `$.log_if_contains_state()` so the runtime can detect when state proxies
/// are logged directly.
///
/// The transformation is:
///   `console.log(x, y)` -> `console.log(...$.log_if_contains_state("log", x, y))`
///
/// Applied when some argument can evaluate to `UNKNOWN`, which is upstream's
/// rule; the literal test below is reached only for an argument list that does
/// not parse on its own.
///
/// Console calls inside `$.inspect()` callbacks are excluded, as those are
/// already handled by the inspect infrastructure.
///
/// Reference: CallExpression.js in the official Svelte compiler
pub(super) fn transform_console_calls_dev(
    stmt: &str,
    is_ts: bool,
    analysis: Option<&crate::compiler::phases::phase2_analyze::ComponentAnalysis>,
) -> String {
    const CONSOLE_METHODS: &[&str] = &[
        "debug",
        "dir",
        "error",
        "group",
        "groupCollapsed",
        "info",
        "log",
        "trace",
        "warn",
    ];

    let mut result = stmt.to_string();

    for method in CONSOLE_METHODS {
        let pattern = format!("console.{}(", method);
        // Process all occurrences of this console method
        let mut search_from = 0;
        while let Some(rel_pos) = result[search_from..].find(&pattern) {
            let pos = search_from + rel_pos;

            // Skip if inside a string literal
            if is_inside_string_literal(&result, pos) {
                search_from = pos + pattern.len();
                continue;
            }

            // Skip wrapping for the default $inspect callback pattern:
            //   console.log(...$$args) - this is the generated default inspector
            // User-provided inspectors (e.g., .with((t, c) => console.log(t, c))) are wrapped.
            let args_start_check = pos + pattern.len();
            if let Some(args_end_check) = find_matching_paren(&result[args_start_check..]) {
                let args_text = result[args_start_check..args_start_check + args_end_check].trim();
                if args_text == "...$$args" {
                    search_from = args_start_check + args_end_check + 1;
                    continue;
                }
            }

            let args_start = pos + pattern.len();
            if let Some(args_end) = find_matching_paren(&result[args_start..]) {
                let args_content = &result[args_start..args_start + args_end];

                // Upstream's rule is `scope.evaluate(arg).has_unknown`, not "is a
                // literal": a binary expression, an arrow, a `!x` and a folded
                // binding are all known. Ask the shared predicate whenever the
                // argument list parses on its own.
                let needs_wrap =
                    super::console_wrap::args_text_need_wrap(args_content, is_ts, analysis)
                        .unwrap_or_else(|| !all_args_are_literals(args_content));
                if !args_content.is_empty() && needs_wrap {
                    // Transform: console.METHOD(args) -> console.METHOD(...$.log_if_contains_state("METHOD", args))
                    let new_call = format!(
                        "console.{}(...$.log_if_contains_state('{}', {}))",
                        method, method, args_content
                    );
                    let call_end = args_start + args_end + 1; // +1 for closing paren
                    result = format!("{}{}{}", &result[..pos], new_call, &result[call_end..]);
                    search_from = pos + new_call.len();
                } else {
                    search_from = args_start + args_end + 1;
                }
            } else {
                search_from = pos + pattern.len();
            }
        }
    }

    result
}

/// Check if all arguments in a comma-separated argument list are simple literals.
///
/// Simple literals are: string literals, numeric literals, boolean literals,
/// null, undefined.
pub(super) fn all_args_are_literals(args: &str) -> bool {
    let trimmed = args.trim();
    if trimmed.is_empty() {
        return true;
    }

    // Split on top-level commas (not inside nested parens/brackets/strings)
    let parts = split_top_level_args(trimmed);

    for part in &parts {
        let p = part.trim();
        if p.is_empty() {
            continue;
        }
        // Check if it's a spread element (always wrap)
        if p.starts_with("...") {
            return false;
        }
        // Check if it's a simple literal
        if !is_simple_literal(p) {
            return false;
        }
    }

    true
}

/// Check if a prop default value should be wrapped in `$.proxy()`.
/// This mirrors the official compiler's `should_proxy(initial, scope)` check for prop defaults.
/// Returns `false` for values known to be primitives (literals, template literals,
/// arrow functions, function expressions, unary/binary expressions, `undefined`).
/// Returns `true` for everything else (identifiers, member expressions, call expressions, etc.).
fn should_proxy_prop_default(value: &str, analysis: &ComponentAnalysis) -> bool {
    // Prefer an exact AST-based check that mirrors upstream `should_proxy`
    // (node-type dispatch + one-level scope recursion). The string heuristic
    // below is only a fallback for text that cannot be parsed as an expression.
    if let Some(result) = ast_should_proxy(value, Some(analysis)) {
        return result;
    }
    let v = value.trim();

    // Empty value means no default
    if v.is_empty() {
        return false;
    }

    // Literals: numbers, strings, booleans, null, undefined
    if v.parse::<f64>().is_ok() {
        return false;
    }
    if (v.starts_with('"') && v.ends_with('"')) || (v.starts_with('\'') && v.ends_with('\'')) {
        return false;
    }
    // Template literals (backtick strings)
    if v.starts_with('`') && v.ends_with('`') {
        return false;
    }
    if matches!(v, "true" | "false" | "null" | "undefined" | "void 0") {
        return false;
    }
    // Arrow functions: starts with `(` or identifier then `=>`
    if v.starts_with("() =>") || v.starts_with("(") && v.has_sub("=>") {
        return false;
    }
    // Function expressions
    if v.starts_with("function") {
        return false;
    }
    // Unary expressions (!, -, +, ~, typeof, void, delete)
    if v.starts_with('!')
        || v.starts_with("typeof ")
        || v.starts_with("void ")
        || v.starts_with("delete ")
    {
        return false;
    }
    // Negative numbers/expressions: -expr
    if v.starts_with('-') && v.len() > 1 {
        return false;
    }

    // Everything else could be an object/array/identifier that should be proxied
    true
}

/// Check if a string is a simple literal value.
pub(super) fn is_simple_literal(s: &str) -> bool {
    let s = s.trim();

    // Numeric literals (including negative)
    if s.parse::<f64>().is_ok() {
        return true;
    }

    // String literals
    if (s.starts_with('"') && s.ends_with('"'))
        || (s.starts_with('\'') && s.ends_with('\''))
        || (s.starts_with('`') && s.ends_with('`'))
    {
        return true;
    }

    // Boolean and null/undefined literals
    matches!(s, "true" | "false" | "null" | "undefined")
}

/// Split an argument string on top-level commas (not inside nested constructs).
pub(super) fn split_top_level_args(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0i32;
    let mut in_string = None::<char>;
    let mut prev_char = None::<char>;

    for c in s.chars() {
        if let Some(quote) = in_string {
            current.push(c);
            if c == quote && prev_char != Some('\\') {
                in_string = None;
            }
        } else {
            match c {
                '"' | '\'' | '`' => {
                    in_string = Some(c);
                    current.push(c);
                }
                '(' | '[' | '{' => {
                    depth += 1;
                    current.push(c);
                }
                ')' | ']' | '}' => {
                    depth -= 1;
                    current.push(c);
                }
                ',' if depth == 0 => {
                    parts.push(current.clone());
                    current.clear();
                }
                _ => {
                    current.push(c);
                }
            }
        }
        prev_char = Some(c);
    }

    if !current.is_empty() {
        parts.push(current);
    }

    parts
}

#[cfg(test)]
mod prop_mutation_location_tests {
    use super::{find_prop_mutation_location, wrap_prop_mutation_validation};

    /// Issue #2099: the location reported to `$$ownership_validator.mutation`
    /// counts columns in UTF-16 code units, so an emoji before the mutation
    /// shifts it by 2 rather than 1.
    #[test]
    fn location_columns_are_utf16_code_units() {
        let astral = "<script>\nlet { item } = $props();\nfunction go() { /*🎉*/ item.name = 1; }\n</script>";
        let bmp = astral.replace('🎉', "あ");
        assert_eq!(find_prop_mutation_location(astral, "item"), (3, 23));
        assert_eq!(find_prop_mutation_location(&bmp, "item"), (3, 22));
    }

    #[test]
    fn mutation_wrapper_carries_the_utf16_column() {
        let source = "<script>\nlet { item } = $props();\nfunction go() { /*🎉*/ item.name = 1; }\n</script>";
        let prop_vars = vec![("item".to_string(), Some("item".to_string()))];
        assert_eq!(
            wrap_prop_mutation_validation("item().name = 1", &prop_vars, source),
            "$$ownership_validator.mutation('item', ['item', 'name'], item().name = 1, 3, 23)"
        );
    }
}

#[cfg(test)]
mod rest_prop_fallback_tests {
    use super::transform_rest_prop_member_access;

    #[test]
    fn keeps_non_ascii_property_boundaries() {
        let input = "@ rest.名前 = 1";
        assert_eq!(
            transform_rest_prop_member_access(input, &["rest".to_string()]),
            input,
        );
    }
}

#[cfg(test)]
mod split_declarators_tests {
    use super::{
        apply_prop_reads_in_prop_default_values, split_declarators, split_destructuring_properties,
        split_property_key_value, transform_prop_reads_in_expr,
    };

    #[test]
    fn split_property_key_value_handles_non_ascii_key() {
        // Non-ASCII prop key before the `:` (e.g. `let { café: renamed } = $props()`)
        // must not panic on a byte/char index mismatch.
        assert_eq!(
            split_property_key_value("café: renamed"),
            Some(("café", "renamed"))
        );
        assert_eq!(split_property_key_value("café"), None);
    }

    #[test]
    fn split_destructuring_properties_handles_non_ascii() {
        // `let { café, b } = $props()` — the comma sits past a multi-byte char.
        assert_eq!(
            split_destructuring_properties("café, b"),
            vec!["café", " b"]
        );
    }

    #[test]
    fn prop_reads_keep_char_and_byte_offsets_separate() {
        let props = vec!["café".to_string()];
        assert_eq!(
            transform_prop_reads_in_expr("先頭 + café", &props),
            "先頭 + café()"
        );
    }

    #[test]
    fn bare_prop_default_stays_a_getter_reference() {
        let props = vec!["log_all".to_string(), "logs".to_string()];
        // A default value that IS a bare prop identifier is the lazy getter ref
        // upstream passes directly — keep it bare.
        assert_eq!(
            apply_prop_reads_in_prop_default_values(
                "let log_rs = $.prop($$props, 'log_rs', 24, log_all);",
                &props
            ),
            "let log_rs = $.prop($$props, 'log_rs', 24, log_all);"
        );
        // A prop read NESTED inside a larger default still wraps.
        assert_eq!(
            apply_prop_reads_in_prop_default_values(
                "let f = $.prop($$props, 'f', 24, () => logs.push(1));",
                &props
            ),
            "let f = $.prop($$props, 'f', 24, () => logs().push(1));"
        );
    }

    #[test]
    fn prop_default_reads_use_ast_spans_for_grammar_combinations() {
        let props = vec!["café".to_string()];
        assert_eq!(
            apply_prop_reads_in_prop_default_values(
                "let value = $.prop($$props, 'value', 24, () => /[,)]/.test(`x${café /* , ) */}`) ? café : '\\\\');\ncafé;",
                &props,
            ),
            "let value = $.prop($$props, 'value', 24, () => /[,)]/.test(`x${café() /* , ) */}`) ? café() : '\\\\');\ncafé;",
        );
    }

    #[test]
    fn prop_default_reads_handle_semicolon_free_generated_statements() {
        let props = vec!["value".to_string()];
        assert_eq!(
            apply_prop_reads_in_prop_default_values(
                "let current = $.prop($$props, 'current', 24, () => value)\nvalue",
                &props,
            ),
            "let current = $.prop($$props, 'current', 24, () => value())\nvalue",
        );
    }

    #[test]
    fn legacy_default_scanners_keep_offset_units_separate() {
        assert_eq!(
            apply_prop_reads_in_prop_default_values(
                "☃ $.prop($$props, '名', 24, () => logs.push(1));",
                &["logs".to_string()],
            ),
            "☃ $.prop($$props, '名', 24, () => logs().push(1));",
        );
        assert_eq!(
            super::apply_store_transforms_in_prop_default_values(
                "$.prop($$props, '名', 24, () => $items);",
                &["$items".to_string()],
                &[],
                &[],
                &[],
                &rustc_hash::FxHashMap::default(),
            ),
            "$.prop($$props, '名', 24, () => $items());",
        );
    }

    #[test]
    fn splits_top_level_commas() {
        assert_eq!(split_declarators("a, b, c"), vec!["a", " b", " c"]);
    }

    #[test]
    fn ignores_commas_inside_brackets() {
        assert_eq!(
            split_declarators("a, b = {x: 1, y: 2}, c"),
            vec!["a", " b = {x: 1, y: 2}", " c"]
        );
    }

    #[test]
    fn ignores_commas_inside_strings() {
        // M-045: a comma inside a string default must not split the list.
        assert_eq!(
            split_declarators(r#"a = "x,y", b"#),
            vec![r#"a = "x,y""#, " b"]
        );
        assert_eq!(split_declarators("a = 'x,y', b"), vec!["a = 'x,y'", " b"]);
        assert_eq!(
            split_declarators("a = `x,${y},z`, b"),
            vec!["a = `x,${y},z`", " b"]
        );
    }

    #[test]
    fn ignores_commas_inside_comments() {
        // A `//` comment between prop names can contain commas; they must not
        // split the declarator list (the comment travels with the next name and
        // is stripped per-declarator by the caller).
        assert_eq!(
            split_declarators("a,\n// we add b, c, and d for compat\nb, c"),
            vec!["a", "\n// we add b, c, and d for compat\nb", " c"]
        );
        // Trailing line comment after a comma (commas inside it preserved).
        assert_eq!(
            split_declarators("open = void 0, // If undefined, renders inline; else modal\nclose"),
            vec![
                "open = void 0",
                " // If undefined, renders inline; else modal\nclose"
            ]
        );
        // Block comment with commas.
        assert_eq!(
            split_declarators("a /* x, y, z */, b"),
            vec!["a /* x, y, z */", " b"]
        );
        // `/*/` must not self-close on the opener's own star.
        assert_eq!(
            split_declarators("a = b /*/, c */ , d"),
            vec!["a = b /*/, c */ ", " d"]
        );
        // `//` inside a string is still a string, not a comment.
        assert_eq!(
            split_declarators(r#"a = "http://x,y", b"#),
            vec![r#"a = "http://x,y""#, " b"]
        );
    }

    #[test]
    fn honours_escaped_quote_in_string() {
        assert_eq!(
            split_declarators(r#"a = "x\",y", b"#),
            vec![r#"a = "x\",y""#, " b"]
        );
    }

    #[test]
    fn does_not_wrap_explicit_property_key() {
        // An explicit object-literal property KEY must not be wrapped as a
        // value read — `{ active(): active() }` is invalid JS. Only the value
        // (and shorthand) get the prop-getter call.
        let props = vec!["active".to_string(), "className".to_string()];
        assert_eq!(
            transform_prop_reads_in_expr("classnames(className, { active: active, x: 1 })", &props),
            "classnames(className(), { active: active(), x: 1 })"
        );
        // Shorthand still expands.
        assert_eq!(
            transform_prop_reads_in_expr("({ active })", &["active".to_string()]),
            "({ active: active() })"
        );
        // A ternary value before `:` is still wrapped (it is a read, not a key).
        assert_eq!(
            transform_prop_reads_in_expr("cond ? active : 0", &["active".to_string()]),
            "cond ? active() : 0"
        );
    }
}

#[cfg(test)]
mod props_pattern_span_tests {
    use super::props_pattern_span;

    #[test]
    fn jsdoc_type_braces_are_not_the_pattern() {
        // `let /** @type {Props} */ { a, b } = $props();` — idiomatic in JS Svelte.
        let line = "let /** @type {Props} */ { a, b } = $props();";
        let (open, close) = props_pattern_span(line).unwrap();
        assert_eq!(&line[open..=close], "{ a, b }");
    }

    #[test]
    fn trailing_comment_brace_is_not_the_closer() {
        let line = "let { a } = $props(); // }";
        let (open, close) = props_pattern_span(line).unwrap();
        assert_eq!(&line[open..=close], "{ a }");
    }

    #[test]
    fn plain_pattern_is_unchanged() {
        let line = "let { a, b } = $props();";
        let (open, close) = props_pattern_span(line).unwrap();
        assert_eq!(&line[open..=close], "{ a, b }");
    }
}

#[cfg(test)]
mod pattern_end_unit_tests {
    use super::find_destructuring_pattern_end;

    #[test]
    fn pattern_end_is_a_byte_offset() {
        // Callers slice `&str` with this, so it must be a byte offset. The
        // leading-space case is the only one where the trim `base` is non-zero.
        for pattern in ["{ a }", "{ café }", "{ ああ }", "[ あ, い ]", "  { café }"] {
            let end = find_destructuring_pattern_end(pattern).unwrap();
            assert_eq!(&pattern[..end], pattern, "pattern {pattern:?}");
        }
    }
}

/// The legacy setter wrap `prop(prop().member = v, true)` is matched as text, but
/// the printer breaks it across lines once the assigned value is long. The
/// single-line-only matcher fell through to the runes-mode branch, which cut the
/// expression at the first newline and spliced the validator call *inside*
/// `prop(` — leaving an empty argument slot and an orphaned `true`.
#[cfg(test)]
mod multiline_setter_wrap_tests {
    use super::wrap_prop_mutation_validation;

    fn wrap(stmt: &str) -> String {
        wrap_prop_mutation_validation(
            stmt,
            &[("filter".to_string(), None)],
            "<script>\n  export let filter;\n  filter.onRemove = () => {};\n</script>",
        )
    }

    #[test]
    fn multiline_setter_call_is_wrapped_as_a_whole() {
        let out = wrap(
            "filter(\n\tfilter().onRemove = () => {\n\t\tremove(filter().index);\n\t},\n\ttrue\n);",
        );
        assert_eq!(
            out,
            "$$ownership_validator.mutation(null, ['filter', 'onRemove'], filter(\n\tfilter().onRemove = () => {\n\t\tremove(filter().index);\n\t},\n\ttrue\n), 3, 2);"
        );
    }

    /// Control: the single-line shape is unchanged by the tolerance.
    #[test]
    fn single_line_setter_call_is_unchanged() {
        assert_eq!(
            wrap("filter(filter().onRemove = 1, true);"),
            "$$ownership_validator.mutation(null, ['filter', 'onRemove'], filter(filter().onRemove = 1, true), 3, 2);"
        );
    }

    /// Control: an unrelated call whose argument merely mentions the prop is not
    /// mistaken for the setter wrap.
    #[test]
    fn unrelated_multiline_call_is_left_alone() {
        assert_eq!(
            wrap("remove(\n\tfilter().index\n);"),
            "remove(\n\tfilter().index\n);"
        );
    }
}

/// The prop-mutation scans read the character adjacent to a match, not the byte.
/// Each case pairs a non-ASCII input with the ASCII input it must agree with;
/// before the fix every non-ASCII row returned the *other* answer.
#[cfg(test)]
mod non_ascii_boundary_tests {
    use super::{
        PropMutationScan, PropMutationSites, is_mutation_operator, mutation_value_start,
        scan_member_chain_names, wrap_prop_mutation_validation,
    };

    /// `名` ends in `0x8D`, which reads as a C1 control — so the letter before
    /// `count(` looked like a word boundary and a member of an unrelated
    /// identifier was wrapped in an ownership check that names `count`.
    #[test]
    fn a_prop_name_inside_a_longer_non_ascii_identifier_is_not_a_mutation() {
        let wrap = |stmt: &str| {
            wrap_prop_mutation_validation(
                stmt,
                &[("count".to_string(), None)],
                "<script>let { count } = $props();</script>",
            )
        };
        // Control: the ASCII form is left alone, before and after the fix.
        assert_eq!(wrap("x_count().a = 1;"), "x_count().a = 1;");
        assert_eq!(wrap("\u{540D}count().a = 1;"), "\u{540D}count().a = 1;");
        assert_eq!(wrap("\u{5D0}count().a = 1;"), "\u{5D0}count().a = 1;");
        // Control on the other side: a standalone prop mutation is still wrapped.
        assert!(wrap("count().a = 1;").starts_with("$$ownership_validator.mutation("));
    }

    /// The same boundary on the legacy `prop(prop().member = v, true)` shape.
    #[test]
    fn the_legacy_mutation_shape_honours_the_same_boundary() {
        let wrap = |stmt: &str| {
            wrap_prop_mutation_validation(
                stmt,
                &[("count".to_string(), None)],
                "<script>export let count;</script>",
            )
        };
        assert_eq!(
            wrap("x_count(count().a = 1, true);"),
            "x_count(count().a = 1, true);"
        );
        assert_eq!(
            wrap("\u{540D}count(count().a = 1, true);"),
            "\u{540D}count(count().a = 1, true);"
        );
        assert!(wrap("count(count().a = 1, true);").starts_with("$$ownership_validator.mutation("));
        assert!(
            wrap("count(count().名 = 1, true);").starts_with("$$ownership_validator.mutation(")
        );
    }

    /// `PropMutationSites::collect` carries the same boundary; a site collected
    /// here is what gives a dev-mode ownership warning its line and column.
    #[test]
    fn a_collected_site_honours_the_same_boundary() {
        let count = |source: &str| {
            let scan = PropMutationScan::new(source);
            PropMutationSites::collect(source, "count", &scan)
                .sites
                .len()
        };
        assert_eq!(count("<script>x_count.a = 1;</script>"), 0);
        assert_eq!(count("<script>\u{540D}count.a = 1;</script>"), 0);
        assert_eq!(count("<script>count.a = 1;</script>"), 1);
    }

    /// A non-ASCII member name is one name, not a replacement character, and the
    /// offset the scan stops at must stay on a character boundary — the byte scan
    /// consumed only the lead byte and handed the rest of the pipeline a cursor
    /// pointing inside the character.
    #[test]
    fn a_non_ascii_member_name_is_scanned_whole() {
        for (source, name) in [
            ("item.name = 5;", "name"),
            ("item.\u{540D} = 5;", "\u{540D}"),
            ("item.\u{E0} = 5;", "\u{E0}"),
        ] {
            let (after, names, _) = scan_member_chain_names(source, 4).unwrap();
            assert_eq!(names.as_deref(), Some([name.to_string()].as_slice()));
            assert!(source.is_char_boundary(after), "source {source:?}");
            assert!(is_mutation_operator(source, after), "source {source:?}");
            assert!(mutation_value_start(source, after).is_some());
        }
    }

    /// `U+3000` and NBSP are JavaScript whitespace. Their lead bytes (`0xE3`,
    /// `0xC2`) Latin-1-decode to letters, so the byte scan read them as part of
    /// the member name and then failed to find the `=` behind them.
    #[test]
    fn non_ascii_whitespace_separates_a_member_from_its_operator() {
        for source in [
            "item.name = 5;",
            "item.name\u{3000}= 5;",
            "item.name\u{A0}= 5;",
            "item.name\t= 5;",
        ] {
            let (after, names, _) = scan_member_chain_names(source, 4).unwrap();
            assert_eq!(
                names.as_deref(),
                Some(["name".to_string()].as_slice()),
                "source {source:?}"
            );
            assert!(is_mutation_operator(source, after), "source {source:?}");
            let value_start = mutation_value_start(source, after).unwrap();
            assert_eq!(source[value_start..].trim(), "5;", "source {source:?}");
        }
    }
}
