//! Destructuring assignment transformations and IIFE generation.

use super::SCRIPT_ARRAY_COUNTER;
use super::rune_transforms::{
    derived_prop_access, exclude_from_object_keys, find_default_equals,
    find_derived_property_colon, split_derived_array_elements, split_derived_object_properties,
};
use crate::compiler::phases::phase3_transform::js_ast::to_oxc::SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER;
use crate::compiler::phases::phase3_transform::shared::js_scan::{code_bytes, code_bytes_from};
use crate::compiler::phases::phase3_transform::shared::offsets::{
    ByteOffset, CharOffset, CharToByte,
};
use crate::compiler::utils::{is_escaped, is_escaped_char};
use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, Statement};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use std::borrow::Cow;

pub(super) fn unthunk_string(expr: &str) -> String {
    let trimmed = expr.trim();

    // Check if the expression is a simple call: identifier() or $.method()
    // IMPORTANT: Only plain identifiers and `$.xxx` member expressions are unthunked.
    // This matches the official Svelte compiler's unthunk() which checks
    // `expression.body.callee.type === 'Identifier'` (not arbitrary MemberExpression).
    // The `$.xxx` exception is for Svelte runtime functions (e.g., `$.effect_tracking()`).
    // e.g., `() => foo()` -> `foo`, `() => $.get(x)` -> `$.get(x)` (kept as call)
    // but `() => value.toString()` stays as `() => value.toString()`
    if let Some(callee) = trimmed.strip_suffix("()") {
        let is_plain_identifier = !callee.is_empty()
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
        let is_dollar_member = callee.starts_with("$.")
            && callee[2..].chars().all(|c| c.is_alphanumeric() || c == '_');
        if is_plain_identifier || is_dollar_member {
            return callee.to_string();
        }
    }

    // No optimization possible, wrap in arrow.
    //
    // If the expression begins with `{`, an arrow body `() => { … }` parses
    // as a block (and the contents become labelled statements), not as an
    // object-literal return. Wrap the body in parens to disambiguate, so
    // `$derived({ a: 1 }[k])` becomes `() => ({ a: 1 }[k])` rather than
    // `() => { a: 1 }[k]`. See baseballyama/rsvelte#150.
    if expr.trim_start().starts_with('{') {
        return format!("() => ({})", expr);
    }
    format!("() => {}", expr)
}

/// Transform destructuring assignment expressions targeting reactive variables
/// into IIFE patterns.
///
/// Handles:
/// - Array destructure: `[a, b] = [expr1, expr2]` -> IIFE with `$.to_array()`
/// - Object destructure: `({a, b} = obj)` -> IIFE with individual assignments
///
/// The generated IIFE decomposes the destructure into individual assignments
/// which are then processed by `transform_state_assignments` (for `$.set()`)
/// and `transform_member_mutations` (for `$.mutate()`).
///
/// This runs BEFORE other assignment transforms in the pipeline.
///
/// Corresponds to `visit_assignment_expression` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/shared/assignments.js`.
pub(super) fn transform_destructure_assignments(
    statement: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> String {
    transform_destructure_assignments_with_props(statement, state_vars, &[], store_sub_vars, &[])
        .into_owned()
}

/// Transform destructure assignments, with knowledge of prop variables.
///
/// `prop_vars` are variable names that will be transformed to function calls
/// (e.g., `numbers` → `numbers()` for prop getters). They matter twice: a prop
/// *target* makes the destructure eligible for the expansion just like a state
/// or store target (upstream routes every extracted path through the ordinary
/// assignment lowering), and a prop on the *right-hand side* forces the IIFE
/// form (with `$$value` caching) because the official compiler visits the RHS
/// first, turning it into a CallExpression, and then checks
/// `should_cache = value.type !== 'Identifier'`.
///
/// `non_reactive_state_vars` is subtracted from `state_vars` for that same
/// right-hand-side test: only a state variable whose read becomes `$.get(…)`
/// makes the visited value a CallExpression.
pub(super) fn transform_destructure_assignments_with_props<'a>(
    statement: &'a str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    store_sub_vars: &[String],
    prop_vars: &[String],
) -> Cow<'a, str> {
    #[cfg(feature = "measure-destructure-scanner")]
    crate::measure_destructure_scanner::record_entry();
    // Quick check: destructure assignments require `=` with `[` or `{` on the LHS
    if state_vars.is_empty() && store_sub_vars.is_empty() && prop_vars.is_empty() {
        return Cow::Borrowed(statement);
    }

    // Byte-level fast path: a destructure assignment requires either `]` or `}`
    // (the close of the destructuring pattern) somewhere in the statement. If
    // neither byte appears at all, no destructure can match — skip the per-call
    // hashset construction and the char-vec allocations in the slow path. This
    // is the common case for plain declarations like `let x = $state(0);` which
    // call this function once per statement when `state_vars` is non-empty.
    if memchr::memchr2(b']', b'}', statement.as_bytes()).is_none() {
        #[cfg(feature = "measure-destructure-scanner")]
        crate::measure_destructure_scanner::record_quick_skip();
        return Cow::Borrowed(statement);
    }

    let mut result = Cow::Borrowed(statement);

    // Build HashSets once for O(1) lookups across all iterations
    let store_set: rustc_hash::FxHashSet<&str> =
        store_sub_vars.iter().map(|s| s.as_str()).collect();
    let prop_set: rustc_hash::FxHashSet<&str> = prop_vars.iter().map(|s| s.as_str()).collect();
    let reactive_state_set: rustc_hash::FxHashSet<&str> = state_vars
        .iter()
        .map(|s| s.as_str())
        .filter(|s| !non_reactive_state_vars.iter().any(|n| n == s))
        .collect();

    // Process the statement, looking for destructure assignments.
    // We scan for patterns and replace them with IIFEs.
    while let Some(transformed) = find_and_transform_one_destructure(
        &result,
        store_sub_vars,
        &store_set,
        &prop_set,
        &reactive_state_set,
    ) {
        #[cfg(feature = "measure-destructure-scanner")]
        crate::measure_destructure_scanner::record_rewrite();
        result = Cow::Owned(transformed);
    }

    result
}

// Note: SCRIPT_ARRAY_COUNTER (declared at the top of this file) is used for all
// $$array name generation in the script processing pipeline.

/// Find and transform one destructure assignment in the statement.
/// Returns `Some(transformed)` if a destructure was found and transformed,
/// or `None` if no more destructures to transform.
///
/// To match the official Svelte compiler's depth-first AST traversal order,
/// we scan for ALL candidate destructures and pick the RIGHTMOST one.
/// This ensures inner/nested destructures (e.g., in the RHS of an outer
/// destructure) are processed before outer ones, so $$array counter
/// values match the official compiler output.
pub(super) fn find_and_transform_one_destructure(
    statement: &str,
    store_sub_vars: &[String],
    store_set: &rustc_hash::FxHashSet<&str>,
    prop_set: &rustc_hash::FxHashSet<&str>,
    reactive_state_set: &rustc_hash::FxHashSet<&str>,
) -> Option<String> {
    #[cfg(feature = "measure-destructure-scanner")]
    crate::measure_destructure_scanner::record_scan(statement.len());
    let chars: Vec<char> = statement.chars().collect();
    let len = chars.len();

    // Build char-index → byte-index mapping for safe string slicing with multi-byte chars
    let table = CharToByte::new(statement);
    let b = |char_idx: CharOffset| -> ByteOffset { table.byte(char_idx) };

    // Scan for `] =` or `} =` patterns that indicate destructure assignments.
    // We need to be careful to avoid:
    // - Already-transformed IIFE patterns ($.to_array, $.set, etc.)
    // - Regular object/array literals on the RHS of assignments
    // - Patterns inside strings or comments

    // Collect all valid candidate destructures, then pick the rightmost one.
    // Each candidate stores (close_bracket_char_idx, pattern_start, rhs_start_after_eq)
    #[derive(Clone, Copy)]
    struct Candidate {
        close_pos: CharOffset,
        pattern_start: CharOffset,
        eq_pos: CharOffset,
    }
    let mut candidates: Vec<Candidate> = Vec::new();

    let mut i = 0;
    let mut in_string: Option<char> = None;

    while i < len {
        let c = chars[i];

        // Track string boundaries
        if in_string.is_none() {
            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                i += 1;
                continue;
            }
        } else if Some(c) == in_string && !is_escaped_char(&chars, i) {
            in_string = None;
            i += 1;
            continue;
        }

        if in_string.is_some() {
            i += 1;
            continue;
        }

        // Look for `] =` or `} =` (possibly with spaces)
        if (c == ']' || c == '}') && i + 1 < len {
            #[cfg(feature = "measure-destructure-scanner")]
            crate::measure_destructure_scanner::record_candidate_closer();
            // Find the `=` after the bracket (skipping any whitespace including newlines)
            let mut j = i + 1;
            while j < len && chars[j].is_whitespace() {
                j += 1;
            }
            if j < len && chars[j] == '=' && (j + 1 >= len || chars[j + 1] != '=') {
                #[cfg(feature = "measure-destructure-scanner")]
                crate::measure_destructure_scanner::record_assignment_closer();
                // Found a potential destructure assignment
                let close_bracket = c;
                let open_bracket = if c == ']' { '[' } else { '{' };

                // Walk backwards from position `i` to find the matching open bracket.
                // The helper works in byte offsets; this loop indexes by char.
                if let Some(pattern_start) = find_matching_open_bracket(
                    statement,
                    table.byte(CharOffset::new(i)),
                    open_bracket,
                    close_bracket,
                )
                .map(|byte| {
                    // The helper only returns ASCII bracket positions, which are
                    // always char starts; a miss would be a bug, not input.
                    table
                        .char_of(byte)
                        .unwrap_or_else(|| bracket_offset_miss(byte.get(), statement.len()))
                }) {
                    let pattern_end = CharOffset::new(i).next();
                    let pattern_str = b(pattern_start).to(b(pattern_end), statement);
                    let rhs_start = j + 1;

                    // For array patterns, check if `[` is actually member access
                    if open_bracket == '[' && pattern_start > CharOffset::ZERO {
                        let before_char = chars[pattern_start.get() - 1];
                        if before_char.is_ascii_alphanumeric()
                            || before_char == '_'
                            || before_char == '$'
                            || before_char == ')'
                            || before_char == ']'
                        {
                            i = j + 1;
                            continue;
                        }
                    }

                    // Skip declaration destructures (let/const/var)
                    let before_pattern = b(pattern_start).before(statement).trim_end();
                    if before_pattern.ends_with("let")
                        || before_pattern.ends_with("const")
                        || before_pattern.ends_with("var")
                    {
                        i = j + 1;
                        continue;
                    }

                    // Skip already-transformed patterns
                    if before_pattern.ends_with("$.to_array(") {
                        i = j + 1;
                        continue;
                    }

                    // Skip nested binding patterns. When `{ a, b } = default`
                    // appears *inside* an outer destructure pattern (e.g.
                    // `let { prop: { a, b } = default } = expr`), the inner
                    // `} =` is the sub-pattern's default-value form — not a
                    // destructure assignment — and rewriting it to an IIFE
                    // would plant a function call in an LValue slot, which is
                    // not valid JavaScript. (baseballyama/rsvelte#163)
                    //
                    // Detect this by scanning back through the bytes before
                    // the inner pattern's opening bracket and tracking
                    // brace/bracket depth. If we encounter an unmatched
                    // opening `{` or `[` before hitting a statement boundary,
                    // we're nested inside another pattern and should skip.
                    if is_inside_enclosing_pattern(statement, b(pattern_start).get()) {
                        i = j + 1;
                        continue;
                    }

                    // Extract target identifiers from the pattern
                    let targets = extract_destructure_targets(pattern_str);

                    // Check if any target needs the lowered form. Upstream's
                    // `visit_assignment_expression` routes every extracted path
                    // through the normal assignment lowering, so a prop target
                    // (`a = …` → `a(…)`) counts exactly like a state or store one.
                    let has_reactive_target = targets.iter().any(|t| {
                        reactive_state_set.contains(t.as_str())
                            || store_set.contains(t.as_str())
                            || prop_set.contains(t.as_str())
                    });

                    if !has_reactive_target {
                        i = j + 1;
                        continue;
                    }

                    // Find the end of the RHS expression
                    let rhs_start = CharOffset::new(rhs_start);
                    let rhs_end = find_destructure_rhs_end(statement, rhs_start);
                    let rhs_str = b(rhs_start).to(b(rhs_end), statement).trim();

                    if rhs_str.is_empty() {
                        i = j + 1;
                        continue;
                    }

                    // Valid candidate - store it
                    #[cfg(feature = "measure-destructure-scanner")]
                    crate::measure_destructure_scanner::record_accepted_candidate();
                    candidates.push(Candidate {
                        close_pos: CharOffset::new(i),
                        pattern_start,
                        eq_pos: CharOffset::new(j),
                    });
                }
            }
        }

        i += 1;
    }

    if candidates.is_empty() {
        return None;
    }

    // A candidate that sits *inside* another candidate's pattern is not an
    // assignment at all — it is that pattern's `AssignmentPattern` default
    // (`({ a: { b } = { b: 3 } } = src)`), which the outer expansion lowers
    // through `$.fallback`. Rewriting it on its own would plant a call in an
    // LValue slot. (The `let` / `const` / `var` form is caught earlier by
    // `is_inside_enclosing_pattern`, which has no outer candidate to compare
    // against.)
    let candidates: Vec<Candidate> = candidates
        .iter()
        .copied()
        .filter(|c| {
            !candidates
                .iter()
                .any(|other| other.pattern_start < c.pattern_start && c.close_pos < other.close_pos)
        })
        .collect();
    if candidates.is_empty() {
        return None;
    }

    // Pick the first candidate whose RHS does NOT contain another candidate.
    // This ensures inner/nested destructures are processed before their
    // containing destructures (matching the official Svelte compiler's
    // depth-first AST traversal), while sequential destructures are
    // processed left-to-right (preserving $$array counter order).
    //
    // For each candidate, compute its RHS range. If another candidate's
    // closing bracket falls within this RHS range, the candidate "contains"
    // the other and should be deferred.
    let candidate_idx = {
        // Compute rhs_end for each candidate to determine containment
        let rhs_ends: Vec<CharOffset> = candidates
            .iter()
            .map(|c| find_destructure_rhs_end(statement, c.eq_pos.next()))
            .collect();

        let mut selected = 0; // default to first
        'outer: for (ci, c) in candidates.iter().enumerate() {
            let rhs_start = c.eq_pos.next();
            let rhs_end = rhs_ends[ci];
            // Check if any other candidate's close_pos is inside this candidate's RHS range
            let mut contains_other = false;
            for (oi, other) in candidates.iter().enumerate() {
                if oi == ci {
                    continue;
                }
                // Check if other's close bracket is within this candidate's RHS
                if other.close_pos > rhs_start && other.close_pos < rhs_end {
                    contains_other = true;
                    break;
                }
            }
            if !contains_other {
                selected = ci;
                break 'outer;
            }
        }
        selected
    };
    let candidate = &candidates[candidate_idx];
    let pattern_end = candidate.close_pos.next();
    let pattern_start = candidate.pattern_start;
    let rhs_start = candidate.eq_pos.next();

    let pattern_str = b(pattern_start).to(b(pattern_end), statement);
    let rhs_end = find_destructure_rhs_end(statement, rhs_start);
    let rhs_str = b(rhs_start).to(b(rhs_end), statement).trim();

    // Check for surrounding parentheses
    let mut actual_start = b(pattern_start);
    let mut actual_end = b(rhs_end);

    let before = b(pattern_start).before(statement).trim_end();
    if before.ends_with('(') {
        let paren_pos = b(pattern_start).before(statement).rfind('(').unwrap();
        let after_rhs = b(rhs_end).after(statement);
        if let Some(close_paren_offset) = after_rhs.find(')') {
            actual_start = ByteOffset::new(paren_pos);
            actual_end = ByteOffset::new(b(rhs_end).get() + close_paren_offset + 1);
        }
    }

    // Determine if standalone statement. Only spaces and tabs are trimmed: a
    // line break is itself a statement boundary here, and trimming it away left
    // the `\n` tests below unreachable — so an assignment whose neighbour was
    // separated by nothing but a newline was read as a sub-expression and got a
    // `return` the official compiler does not emit.
    let before_text = actual_start.before(statement).trim_end_matches([' ', '\t']);
    let after_text = actual_end.after(statement).trim_start_matches([' ', '\t']);
    let is_standalone = (before_text.is_empty()
        || before_text.ends_with(';')
        || before_text.ends_with('{')
        || before_text.ends_with('}')
        || before_text.ends_with(')')
        || before_text.ends_with('\n'))
        && (after_text.is_empty()
            || after_text.starts_with(';')
            || after_text.starts_with('}')
            || after_text.starts_with('\n'));

    // Check if RHS will become a function call
    let rhs_trimmed = rhs_str.trim();
    let rhs_will_be_call = prop_set.contains(rhs_trimmed)
        || store_set.contains(rhs_trimmed)
        || reactive_state_set.contains(rhs_trimmed);

    // Generate the IIFE replacement
    let iife = generate_destructure_iife(
        pattern_str,
        rhs_str,
        is_standalone,
        store_sub_vars,
        rhs_will_be_call,
    );

    // Replace the destructure expression with the IIFE
    let mut new_statement = String::new();
    new_statement.push_str(actual_start.before(statement));
    new_statement.push_str(&iife);
    new_statement.push_str(actual_end.after(statement));

    Some(new_statement)
}

#[cold]
#[inline(never)]
fn bracket_offset_miss(byte: usize, len: usize) -> ! {
    panic!("bracket byte offset {byte} is not a char start in a {len}-byte statement")
}

/// Returns true when the byte position `pattern_open_byte` (the `{` or `[`
/// of a destructure pattern) is itself nested inside another *binding*
/// pattern introduced by `let` / `const` / `var`. Used to suppress the IIFE
/// rewrite for sub-patterns with default values:
///
/// ```ignore
/// let { prop: { a, b } = default } = expr;
/// //          ^^^^^^^^^^^^^^^^^^^^^
/// // inner `} = default` is a sub-pattern's default form, NOT an assignment
/// ```
///
/// Walks the bytes backward, tracking `{`/`[`/`}`/`]` depth. When depth
/// goes negative we've found the immediate outer `{` or `[`. We then check
/// what precedes that bracket: if it's `let` / `const` / `var`, the inner
/// pattern is part of a binding declaration and should not be IIFE-rewritten.
/// Anything else (e.g. `(` for a `({ x: a } = obj)` assignment expression,
/// `{` of a function body, …) leaves the inner pattern eligible for the
/// usual destructure-assignment rewrite.
fn is_inside_enclosing_pattern(statement: &str, pattern_open_byte: usize) -> bool {
    // A backwards walk cannot tell code from a comment or string, so the
    // lexical state is established by a forward pass first.
    let code: Vec<(usize, u8)> = code_bytes(statement.as_bytes())
        .take_while(|&(i, _)| i < pattern_open_byte)
        .collect();
    let mut depth: i32 = 0;
    for &(i, b) in code.iter().rev() {
        match b {
            b'}' | b']' => depth += 1,
            b'{' | b'[' => {
                depth -= 1;
                if depth < 0 {
                    // Found the outer unmatched bracket — check what
                    // precedes it.
                    let before = statement[..i].trim_end();
                    return before.ends_with("let")
                        || before.ends_with("const")
                        || before.ends_with("var");
                }
            }
            b';' if depth == 0 => return false,
            _ => {}
        }
    }
    false
}

/// Find the matching opening bracket, respecting nesting and strings.
pub(super) fn find_matching_open_bracket(
    s: &str,
    close_pos: ByteOffset,
    open_bracket: char,
    close_bracket: char,
) -> Option<ByteOffset> {
    let (open, close) = (open_bracket as u8, close_bracket as u8);
    // Collect forward so opaque runs are skipped, then walk the code bytes back.
    let code: Vec<(usize, u8)> = code_bytes(s.as_bytes())
        .take_while(|(i, _)| *i < close_pos.get())
        .collect();
    #[cfg(feature = "measure-destructure-scanner")]
    crate::measure_destructure_scanner::record_helper(code.len());

    let mut depth = 1;
    for &(i, c) in code.iter().rev() {
        if c == close {
            depth += 1;
        } else if c == open {
            depth -= 1;
            if depth == 0 {
                return Some(ByteOffset::new(i));
            }
        }
    }

    None
}

/// Extract root identifier names from a destructure pattern string.
/// For `[a, b[0], c.prop]`, returns `["a", "b", "c"]`.
/// For `{x, y: z, w}`, returns `["x", "z", "w"]`.
pub(super) fn extract_destructure_targets(pattern: &str) -> Vec<String> {
    let mut targets = Vec::new();
    let trimmed = pattern.trim();

    // Remove outer brackets
    let inner = if (trimmed.starts_with('[') && trimmed.ends_with(']'))
        || (trimmed.starts_with('{') && trimmed.ends_with('}'))
    {
        &trimmed[1..trimmed.len() - 1]
    } else {
        trimmed
    };

    // Split on commas (respecting nested brackets)
    let parts = split_on_commas(inner);

    for part in &parts {
        let part = part.trim();
        if part.is_empty() || part == "..." {
            continue;
        }

        // Handle rest element: ...rest
        let part = if let Some(rest) = part.strip_prefix("...") {
            rest.trim()
        } else {
            part
        };

        // Handle default value BEFORE colon check: target = default
        // This is critical because a default value may contain a ternary expression
        // with a colon (e.g., `j = "19" ? 10 : await Promise.resolve(11)`).
        // If we checked colon first, we'd mistake the ternary `:` for a key:value separator.
        // In valid destructuring syntax, `key: target = default` always has `:` before `=`,
        // so if `=` appears first, any `:` is part of the default expression.
        let part = if let Some(eq_pos) = find_top_level_equals(part) {
            part[..eq_pos].trim()
        } else {
            part
        };

        // Handle object property with rename: key: value
        let part = if let Some(colon_pos) = find_top_level_colon(part) {
            part[colon_pos + 1..].trim()
        } else {
            part
        };

        // Extract root identifier from the target
        // For `a`, returns `a`
        // For `a[0]`, returns `a`
        // For `a.prop`, returns `a`
        if let Some(root) = extract_root_identifier(part) {
            targets.push(root);
        }

        // Also recurse into nested patterns. Only a *closed* bracket pair is
        // recursed into: an unbalanced fragment strips nothing, so the callee
        // would re-derive the identical part and never terminate.
        if (part.starts_with('[') && part.ends_with(']'))
            || (part.starts_with('{') && part.ends_with('}'))
        {
            let nested = extract_destructure_targets(part);
            targets.extend(nested);
        }
    }

    targets
}

/// Split a string on top-level commas (not inside brackets, parens, or strings).
pub(super) fn split_on_commas(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut depth = 0;
    let mut start = 0usize;

    for (i, c) in code_bytes(s.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' if depth == 0 => {
                parts.push(s[start..i].to_string());
                start = i + 1;
            }
            _ => {}
        }
    }

    if start < s.len() {
        parts.push(s[start..].to_string());
    }

    parts
}

/// Find the position of a top-level colon in a string (not inside brackets or strings).
pub(super) fn find_top_level_colon(s: &str) -> Option<usize> {
    let mut depth = 0;

    for (i, c) in code_bytes(s.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b':' if depth == 0 => return Some(i),
            _ => {}
        }
    }

    None
}

/// Find the position of a top-level `=` in a string (not `==` or `===`).
pub(super) fn find_top_level_equals(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0;
    let mut prev: Option<u8> = None;

    for (i, c) in code_bytes(bytes) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            // Not `==`/`===`, and not the tail of `!=` / `<=` / `>=`.
            b'=' if depth == 0
                && bytes.get(i + 1) != Some(&b'=')
                && !matches!(prev, Some(b'!') | Some(b'<') | Some(b'>')) =>
            {
                return Some(i);
            }
            _ => {}
        }
        prev = Some(c);
    }

    None
}

/// Extract the root identifier from a string like `a`, `a[0]`, `a.prop`.
pub(super) fn extract_root_identifier(s: &str) -> Option<String> {
    let s = s.trim();
    if s.is_empty() {
        return None;
    }

    // Check if it starts with an identifier character
    let first = s.chars().next()?;
    if !first.is_ascii_alphabetic() && first != '_' && first != '$' {
        return None;
    }

    let mut end = 0;
    for c in s.chars() {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            end += c.len_utf8();
        } else {
            break;
        }
    }

    if end > 0 {
        Some(s[..end].to_string())
    } else {
        None
    }
}

/// Whether a character at the end of a line can be the last character of a
/// complete expression. A trailing operator means the expression continues, so
/// no semicolon is inserted after it.
fn can_end_expression(c: char) -> bool {
    !matches!(
        c,
        '+' | '-'
            | '*'
            | '/'
            | '%'
            | '&'
            | '|'
            | '^'
            | '~'
            | '!'
            | '='
            | '<'
            | '>'
            | ','
            | '.'
            | '?'
            | ':'
            | '('
            | '['
            | '{'
    )
}

/// Whether a character starting the next line can continue the expression on the
/// previous one. These are exactly the tokens for which JavaScript does *not*
/// insert a semicolon — which is why semicolon-free style writes a leading `;`
/// before a line opening with `(` or `[`.
fn can_continue_expression(c: char) -> bool {
    matches!(
        c,
        '.' | '?'
            | ':'
            | ','
            | ')'
            | ']'
            | '}'
            | '='
            | '+'
            | '-'
            | '*'
            | '/'
            | '%'
            | '&'
            | '|'
            | '^'
            | '<'
            | '>'
            | '('
            | '['
            | '`'
    )
}

/// Find the end of the RHS expression in a destructure assignment.
/// Handles balanced brackets, parentheses, semicolons and line breaks.
pub(super) fn find_destructure_rhs_end(statement: &str, start: CharOffset) -> CharOffset {
    let chars: Vec<char> = statement.chars().collect();
    let len = chars.len();
    let mut i = start.get();
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    // Skip leading whitespace
    while i < len && chars[i].is_whitespace() {
        i += 1;
    }

    let expr_start = i;

    while i < len {
        let c = chars[i];

        if in_string.is_some() {
            if Some(c) == in_string && !is_escaped_char(&chars, i) {
                in_string = None;
            }
            i += 1;
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                i += 1;
            }
            '(' | '[' | '{' => {
                depth += 1;
                i += 1;
            }
            ')' => {
                if depth == 0 {
                    // This closing paren belongs to an outer context
                    return CharOffset::new(i);
                }
                depth -= 1;
                i += 1;
                // After closing `)` at depth 0, check if followed by `(` (function call)
                // or `[` (member access). If so, continue parsing as the expression
                // is not finished yet. E.g., `(async (...) => {...})(args)`.
                if depth == 0 {
                    // Skip whitespace
                    let mut j = i;
                    while j < len && chars[j].is_whitespace() {
                        j += 1;
                    }
                    if j < len && (chars[j] == '(' || chars[j] == '[' || chars[j] == '.') {
                        // This is a function call, member access, or property access
                        // Continue parsing
                    } else {
                        // Expression ends here
                        // But don't return - let the next iteration handle it
                    }
                }
            }
            ']' | '}' => {
                if depth == 0 {
                    return CharOffset::new(i);
                }
                depth -= 1;
                i += 1;
            }
            ';' if depth == 0 => {
                return CharOffset::new(i);
            }
            ',' if depth == 0 => {
                // Could be end of expression in sequence
                return CharOffset::new(i);
            }
            '\n' if depth == 0 => {
                // Semicolon-free source ends the assignment here, by ASI. Apply
                // the same rule: the break ends the RHS unless one of its two
                // sides is a token that carries the expression across it.
                let ends = chars[expr_start..i]
                    .iter()
                    .rev()
                    .find(|c| !c.is_whitespace())
                    .is_some_and(|&c| can_end_expression(c));
                let continues_next = chars[i + 1..]
                    .iter()
                    .find(|c| !c.is_whitespace())
                    .is_some_and(|&c| can_continue_expression(c));
                if ends && !continues_next {
                    return CharOffset::new(i);
                }
                i += 1;
            }
            _ => {
                i += 1;
            }
        }
    }

    // If we didn't find a terminator, include everything to the end
    // but trim trailing whitespace and newlines
    let mut end = len;
    while end > expr_start && chars[end - 1].is_whitespace() {
        end -= 1;
    }
    CharOffset::new(end)
}

/// Check if a generated code string contains `await` as a keyword (not inside string literals).
///
/// This is used to determine if a destructuring IIFE needs to be async.
/// The check is simplified since the input is compiler-generated code where
/// `await` only appears as actual await expressions.
pub(super) fn code_contains_await(code: &str) -> bool {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let await_bytes = b"await";
    let await_len = await_bytes.len();

    if len < await_len {
        return false;
    }

    let mut i = 0;
    // Track string context: None = not in string, Some(quote) = in string
    let mut in_string: Option<u8> = None;
    // Stack for template literal interpolation depth tracking.
    // When we encounter `${` inside a template literal, we push the brace depth.
    // When the matching `}` is found, we pop back into the template literal.
    let mut template_depth_stack: Vec<u32> = Vec::new();
    let mut brace_depth: u32 = 0;

    while i < len {
        let c = bytes[i];

        if let Some(quote) = in_string {
            if quote == b'`' {
                // Inside template literal - check for `${` interpolation
                if c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    // Enter interpolation expression - push current state
                    template_depth_stack.push(brace_depth);
                    brace_depth = 0;
                    in_string = None;
                    i += 2; // skip `${`
                    continue;
                }
                // Check for end of template literal
                if c == b'`' && !is_escaped(bytes, i) {
                    in_string = None;
                    i += 1;
                    continue;
                }
            } else {
                // Inside single or double quoted string
                if c == quote && !is_escaped(bytes, i) {
                    in_string = None;
                    i += 1;
                    continue;
                }
            }
            // Skip content inside strings
            i += 1;
            continue;
        }

        // Not inside a string - check for string openings
        if c == b'\'' || c == b'"' || c == b'`' {
            in_string = Some(c);
            i += 1;
            continue;
        }

        // Track brace depth for template literal interpolation
        if c == b'{' {
            brace_depth += 1;
        } else if c == b'}' {
            if brace_depth == 0 && !template_depth_stack.is_empty() {
                // Closing `}` of a template interpolation - back to template literal
                brace_depth = template_depth_stack.pop().unwrap();
                in_string = Some(b'`');
                i += 1;
                continue;
            }
            brace_depth = brace_depth.saturating_sub(1);
        }

        // Check for "await" keyword with word boundaries
        if i + await_len <= len && &bytes[i..i + await_len] == await_bytes {
            // Check that it's not part of a larger identifier
            let before_ok = i == 0 || !bytes[i - 1].is_ascii_alphanumeric() && bytes[i - 1] != b'_';
            let after_ok = i + await_len >= len
                || !bytes[i + await_len].is_ascii_alphanumeric() && bytes[i + await_len] != b'_';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }

    false
}

/// Check if a string expression contains `await` as a keyword (not inside strings).
/// This is a simplified check that looks for `await` preceded by a non-identifier char
/// and followed by a non-identifier char.
pub(super) fn string_expr_has_await(s: &str) -> bool {
    string_expr_has_toplevel_await(s)
}

/// Check if a string expression has a top-level `await` keyword.
///
/// This mirrors the official compiler's `is_expression_async` which does NOT
/// recurse into nested `async` function/arrow bodies. So `(async (x) => await x)(arg)`
/// returns `false` because the `await` is inside the async arrow, not at the top level.
pub(super) fn string_expr_has_toplevel_await(s: &str) -> bool {
    let bytes = s.as_bytes();
    let len = bytes.len();
    if len < 5 {
        return false;
    }

    // We track nested depth (parens, braces, brackets combined) and maintain
    // a "min safe depth" - the depth at/below which `await` counts as top-level.
    // When we encounter an `async` keyword, we record the current depth as an
    // "async scope entry" - any `await` found at a deeper depth within that
    // async's body should be ignored.
    //
    // Strategy: when we see `async`, skip ahead past the entire async
    // function/arrow body so we never even see its internal `await` keywords.
    let mut i = 0;
    while i < len {
        // Skip string literals
        if i < len && (bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`') {
            let quote = bytes[i];
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

        // Check for `async` keyword - if found, skip past the async body
        if i + 5 <= len && &bytes[i..i + 5] == b"async" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after_ok = i + 5 >= len
                || !bytes[i + 5].is_ascii_alphanumeric()
                    && bytes[i + 5] != b'_'
                    && bytes[i + 5] != b'$';
            if before_ok && after_ok {
                // Skip past the entire async function/arrow body
                if let Some(end) = skip_async_body(bytes, i + 5) {
                    i = end;
                    continue;
                }
            }
        }

        // Check for `await` keyword (only reached if not inside an async body)
        if i + 5 <= len && &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after_ok = i + 5 >= len
                || !bytes[i + 5].is_ascii_alphanumeric()
                    && bytes[i + 5] != b'_'
                    && bytes[i + 5] != b'$';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }
    false
}

/// Skip past an async function/arrow body starting from the position right after `async`.
/// Returns the position after the body ends, or None if this isn't a recognizable pattern.
pub(super) fn skip_async_body(bytes: &[u8], start: usize) -> Option<usize> {
    let len = bytes.len();
    let mut i = start;

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    if i >= len {
        return None;
    }

    // Case 1: `async function ...` - skip to end of function body
    if i + 8 <= len && &bytes[i..i + 8] == b"function" {
        // Skip to the function body `{...}`
        // Find the opening `{`
        while i < len && bytes[i] != b'{' {
            i += 1;
        }
        if i >= len {
            return None;
        }
        // Skip the `{...}` block
        return Some(skip_balanced_braces(bytes, i));
    }

    // Case 2: `async (params) => body` or `async name => body`
    if bytes[i] == b'(' {
        // Skip the params `(...)`
        i = skip_balanced(bytes, i, b'(', b')');
    } else if bytes[i].is_ascii_alphabetic() || bytes[i] == b'_' || bytes[i] == b'$' {
        // Single param: `async x => ...`
        while i < len && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
        {
            i += 1;
        }
    } else {
        return None;
    }

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    // Expect `=>`
    if i + 2 <= len && &bytes[i..i + 2] == b"=>" {
        i += 2;
    } else {
        return None;
    }

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    if i >= len {
        return Some(i);
    }

    // Arrow body: either `{...}` block or expression
    if bytes[i] == b'{' {
        return Some(skip_balanced_braces(bytes, i));
    }

    // Expression body: skip to end of expression (up to a comma/paren/bracket at depth 0)
    Some(skip_expression(bytes, i))
}

/// Skip a balanced `{...}` block, returning position after closing `}`.
pub(super) fn skip_balanced_braces(bytes: &[u8], start: usize) -> usize {
    skip_balanced(bytes, start, b'{', b'}')
}

/// Skip balanced brackets from start (which should be the opening bracket).
/// Returns position after the closing bracket.
pub(super) fn skip_balanced(bytes: &[u8], start: usize, open: u8, close: u8) -> usize {
    let mut depth = 0;
    for (i, c) in code_bytes_from(bytes, start) {
        if c == open {
            depth += 1;
        } else if c == close {
            depth -= 1;
            if depth == 0 {
                return i + 1;
            }
        }
    }
    bytes.len()
}

/// Skip an expression (arrow body without braces). Ends at a `,`, `)`, `]`, or `}`
/// at depth 0, or at end of input.
pub(super) fn skip_expression(bytes: &[u8], start: usize) -> usize {
    let mut depth = 0usize;
    for (i, c) in code_bytes_from(bytes, start) {
        match c {
            b'(' | b'[' | b'{' => {
                depth += 1;
            }
            b')' | b']' | b'}' => {
                if depth == 0 {
                    return i;
                }
                depth -= 1;
            }
            b',' if depth == 0 => {
                return i;
            }
            _ => {}
        }
    }
    bytes.len()
}

/// Check if a string expression is a "simple" expression that doesn't need thunk wrapping.
///
/// The string is re-parsed so the answer comes from the expression's real shape —
/// a purely textual test cannot tell `q ? 1 : 2` (simple) from `q ? a.b : c` (not).
pub(super) fn string_is_simple_expression(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return false;
    }

    let allocator = Allocator::default();
    // Parenthesised so a leading `{` parses as an object literal, not a block.
    let wrapped = format!("({})", trimmed);
    let _pt = super::super::profile::timer_start();
    let ret = Parser::new(
        &allocator,
        &wrapped,
        SourceType::mjs().with_typescript(true),
    )
    .with_options(ParseOptions {
        preserve_parens: false,
        ..ParseOptions::default()
    })
    .parse();
    super::super::profile::record_direct_parse(
        super::super::profile::timer_elapsed(_pt),
        wrapped.len(),
    );
    if !ret.diagnostics.is_empty() || ret.program.body.len() != 1 {
        return false;
    }
    match ret.program.body.first() {
        Some(Statement::ExpressionStatement(stmt)) => expression_is_simple(&stmt.expression),
        _ => false,
    }
}

/// The *value* of a literal destructuring key's source text, or `None` when the
/// text is not a literal. Upstream rebuilds `$.exclude_from_object` keys with
/// `b.literal(...)`, which carries no `raw`, so the printed key is the decoded
/// value — `"aAb"` becomes `'aAb'`. Re-parsing with oxc is the only way to
/// resolve escape sequences exactly.
pub(super) fn literal_key_value(source: &str) -> Option<String> {
    let allocator = Allocator::default();
    let wrapped = format!("({})", source.trim());
    let _pt = super::super::profile::timer_start();
    let ret = Parser::new(&allocator, &wrapped, SourceType::mjs())
        .with_options(ParseOptions {
            preserve_parens: false,
            ..ParseOptions::default()
        })
        .parse();
    super::super::profile::record_direct_parse(
        super::super::profile::timer_elapsed(_pt),
        wrapped.len(),
    );
    if !ret.diagnostics.is_empty() || ret.program.body.len() != 1 {
        return None;
    }
    let Some(Statement::ExpressionStatement(stmt)) = ret.program.body.first() else {
        return None;
    };
    match &stmt.expression {
        Expression::StringLiteral(lit) => Some(lit.value.to_string()),
        Expression::NumericLiteral(lit) => Some(js_number_to_string(lit.value)),
        Expression::BooleanLiteral(lit) => Some(lit.value.to_string()),
        Expression::NullLiteral(_) => Some("null".to_string()),
        _ => None,
    }
}

/// `String(<number>)` drops the fractional part of an integer.
pub(super) fn js_number_to_string(value: f64) -> String {
    if value.fract() == 0.0 && value.abs() < i64::MAX as f64 {
        (value as i64).to_string()
    } else {
        value.to_string()
    }
}

/// Faithful port of the official compiler's `is_simple_expression()` from `utils/ast.js`.
fn expression_is_simple(expr: &Expression<'_>) -> bool {
    match expr {
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::Identifier(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_) => true,
        Expression::ConditionalExpression(e) => {
            expression_is_simple(&e.test)
                && expression_is_simple(&e.consequent)
                && expression_is_simple(&e.alternate)
        }
        Expression::BinaryExpression(e) => {
            expression_is_simple(&e.left) && expression_is_simple(&e.right)
        }
        Expression::LogicalExpression(e) => {
            expression_is_simple(&e.left) && expression_is_simple(&e.right)
        }
        _ => false,
    }
}

/// Build a `$.fallback(expression, default)` string, applying async thunk wrapping
/// when the default value contains `await`.
///
/// Mirrors the shapes the official compiler's `build_fallback()` (`utils/ast.js`)
/// ends up printing for a client `$derived` destructuring default:
/// 1. Simple expression, no await: `$.fallback(access, default)`
/// 2. `await <simple>`: `await $.fallback(access, simple)`
/// 3. `await <non-simple, no further await>`: upstream hoists the leading `await`
///    out to the call and the thunk stays sync — `b = await f()` prints
///    `await $.fallback(access, f, true)`, `b = await x.y()` prints
///    `await $.fallback(access, () => x.y(), true)`
/// 4. Any other await-bearing default: `await $.fallback(access, async () => default, true)`
/// 5. Non-simple, no await: `$.fallback(access, () => default, true)`
///
/// Sync thunks go through `unthunk_string` because upstream builds them with
/// `b.thunk()`, which collapses `() => f()` to `f`; the async thunk keeps its
/// arrow, since upstream's `unthunk()` bails on `async`.
pub(super) fn build_fallback_string(access: &str, default_val: &str) -> String {
    let trimmed = default_val.trim();

    // Case 1: Simple expression without await
    if string_is_simple_expression(trimmed) {
        return format!("$.fallback({}, {})", access, default_val);
    }

    // Case 2: `await simple_expr` - unwrap await and pass inner directly
    if let Some(inner) = trimmed.strip_prefix("await ") {
        let inner = inner.trim();
        if string_is_simple_expression(inner) {
            return format!("await $.fallback({}, {})", access, inner);
        }
    }

    // Cases 3 and 4: the default contains `await`
    if string_expr_has_await(trimmed) {
        // Case 3: only a leading `await`, which upstream hoists out to the
        // `$.fallback(...)` call, leaving the thunk synchronous.
        if let Some(inner) = trimmed.strip_prefix("await ") {
            let inner = inner.trim();
            if !string_expr_has_await(inner) {
                return format!(
                    "await $.fallback({}, {}, true)",
                    access,
                    unthunk_string(inner)
                );
            }
        }
        // Case 4: the await is nested, so the thunk has to stay async.
        return format!(
            "await $.fallback({}, async () => {}, true)",
            access,
            wrap_arrow_body(default_val)
        );
    }

    // Case 5: Non-simple, no await -> sync thunk
    format!(
        "$.fallback({}, {}, true)",
        access,
        unthunk_string(default_val)
    )
}

/// Wrap an arrow function body that starts with `{` in parens so it's parsed
/// as an object-literal-returning expression rather than a block statement.
/// Mirrors `unthunk_string`'s disambiguation (baseballyama/rsvelte#150) for
/// callers that build the `() => expr` form directly.
fn wrap_arrow_body(body: &str) -> String {
    if body.trim_start().starts_with('{') {
        format!("({})", body)
    } else {
        body.to_string()
    }
}

/// How a path reads the `$$array` helper that an array pattern contributes.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum ArrayHelperRead {
    /// Assignment lowering — the helper is a plain `var`, read directly.
    Value,
    /// Declaration lowering — the helper is a `$.derived`, read through `$.get`.
    Signal,
}

/// Port of upstream's `_extract_paths` (`utils/ast.js`) over a destructuring
/// pattern's source text: appends one `(target, initializer)` pair per bound leaf
/// to `paths`, and one `($$array, $.to_array(...))` helper per array pattern to
/// `inserts`, both in the same depth-first order upstream walks the pattern in.
///
/// The recursion is what makes a nested pattern work at all — every level feeds
/// the member access it built as the next level's base expression, so a leaf
/// carries the whole path (`$$value.a.b`) instead of only its last hop.
pub(super) fn extract_destructure_paths(
    pattern: &str,
    expression: &str,
    array_read: ArrayHelperRead,
    paths: &mut Vec<(String, String)>,
    inserts: &mut Vec<(String, String)>,
) {
    extract_destructure_paths_named(pattern, expression, array_read, "$$array", paths, inserts);
}

/// [`extract_destructure_paths`] with the array helper's base name spelled out —
/// upstream's server `$derived` expansion generates `$$derived_array` instead.
pub(super) fn extract_destructure_paths_named(
    pattern: &str,
    expression: &str,
    array_read: ArrayHelperRead,
    array_prefix: &str,
    paths: &mut Vec<(String, String)>,
    inserts: &mut Vec<(String, String)>,
) {
    let pattern = pattern.trim();
    if pattern.is_empty() {
        return;
    }

    // `AssignmentPattern` — checked before the bracket forms, since a nested
    // pattern with a default (`{ b } = { b: 3 }`) also starts with `{`.
    if !pattern.starts_with("...")
        && let Some(eq_pos) = find_default_equals(pattern)
    {
        let fallback = build_fallback_string(expression, pattern[eq_pos + 1..].trim());
        extract_destructure_paths_named(
            &pattern[..eq_pos],
            &fallback,
            array_read,
            array_prefix,
            paths,
            inserts,
        );
        return;
    }

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let props = split_derived_object_properties(&pattern[1..pattern.len() - 1]);
        let has_rest = props.iter().any(|prop| prop.trim().starts_with("..."));
        let excluded_keys = if has_rest {
            exclude_from_object_keys(&props).join(", ")
        } else {
            String::new()
        };

        for prop in &props {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest_target) = prop.strip_prefix("...") {
                let rest_expression =
                    format!("$.exclude_from_object({}, [{}])", expression, excluded_keys);
                extract_destructure_paths_named(
                    rest_target,
                    &rest_expression,
                    array_read,
                    array_prefix,
                    paths,
                    inserts,
                );
                continue;
            }

            let (key, value) = match find_derived_property_colon(prop) {
                Some(colon_pos) => (prop[..colon_pos].trim(), prop[colon_pos + 1..].trim()),
                // Shorthand: the key is the name, the value is the whole
                // property (so `{ a = 1 }` still becomes an `AssignmentPattern`).
                None => match find_default_equals(prop) {
                    Some(eq_pos) => (prop[..eq_pos].trim(), prop),
                    None => (prop, prop),
                },
            };
            let object_expression = derived_prop_access(expression, expression, key);
            extract_destructure_paths_named(
                value,
                &object_expression,
                array_read,
                array_prefix,
                paths,
                inserts,
            );
        }
        return;
    }

    if pattern.starts_with('[') && pattern.ends_with(']') {
        let mut elements = split_derived_array_elements(&pattern[1..pattern.len() - 1]);
        // A trailing comma is not an elision, so it contributes no element.
        if elements.last().is_some_and(|el| el.trim().is_empty()) {
            elements.pop();
        }
        let ends_with_rest = elements
            .last()
            .is_some_and(|el| el.trim().starts_with("..."));

        let array_var = next_script_array_var_named(array_prefix);
        let to_array = if ends_with_rest {
            format!("$.to_array({})", expression)
        } else {
            format!("$.to_array({}, {})", expression, elements.len())
        };
        inserts.push((array_var.clone(), to_array));

        let helper = match array_read {
            ArrayHelperRead::Value => array_var,
            ArrayHelperRead::Signal => format!("$.get({})", array_var),
        };
        for (i, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() {
                continue;
            }
            let (target, element_expression) = match element.strip_prefix("...") {
                Some(rest_target) => (rest_target, format!("{}.slice({})", helper, i)),
                None => (element, format!("{}[{}]", helper, i)),
            };
            extract_destructure_paths_named(
                target,
                &element_expression,
                array_read,
                array_prefix,
                paths,
                inserts,
            );
        }
        return;
    }

    paths.push((pattern.to_string(), expression.to_string()));
}

/// The next `$$array` / `$$array_<n>` helper name, mirroring upstream's
/// `scope.generate('$$array')`.
fn next_script_array_var_named(prefix: &str) -> String {
    let index = SCRIPT_ARRAY_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    if index == 0 {
        prefix.to_string()
    } else {
        format!("{}_{}", prefix, index)
    }
}

/// Whether the text is a bare identifier — upstream's
/// `should_cache = value.type !== 'Identifier'` test, on source text.
fn string_is_identifier(s: &str) -> bool {
    !s.is_empty()
        && !s.starts_with(|c: char| c.is_ascii_digit())
        && s.chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Lower a destructuring assignment the way upstream's
/// `visit_assignment_expression` (`shared/assignments.js`) does: every leaf of
/// the pattern — however deeply nested — becomes one flat assignment from the
/// full member path, and every array pattern contributes a `$$array` helper.
///
/// With no helper and an identifier right-hand side the result is a sequence
/// expression (`(a = rhs.x, b = rhs.y)`); otherwise the statements go into an
/// IIFE whose parameter is the RHS identifier itself when it needs no caching
/// (`should_cache = value.type !== 'Identifier'`) and `$$value` when it does.
///
/// When `is_standalone` is false (the destructure is part of a larger
/// expression), the value is appended so the form still evaluates to the RHS.
pub(super) fn generate_destructure_iife(
    pattern_str: &str,
    rhs_str: &str,
    is_standalone: bool,
    store_sub_vars: &[String],
    force_cache_rhs: bool,
) -> String {
    let rhs_trimmed = rhs_str.trim();
    // Upstream visits the right-hand side first, so a state / store / prop read
    // is already a call by the time `should_cache = value.type !== 'Identifier'`
    // is evaluated — which is what `force_cache_rhs` carries here.
    let should_cache = force_cache_rhs || !string_is_identifier(rhs_trimmed);
    let param_name = if should_cache { "$$value" } else { rhs_trimmed };

    let mut paths = Vec::new();
    let mut inserts = Vec::new();
    extract_destructure_paths(
        pattern_str,
        param_name,
        ArrayHelperRead::Value,
        &mut paths,
        &mut inserts,
    );

    if paths.is_empty() && inserts.is_empty() {
        return format!("({} = {})", pattern_str.trim(), rhs_str);
    }

    if inserts.is_empty() && !should_cache {
        // No `$$array` helper and no caching: upstream emits a plain sequence
        // expression, whose elements are ordinary assignments. A store target
        // has to be lowered here — nothing downstream rewrites a store write
        // that is not its own statement.
        let mut expressions: Vec<String> = paths
            .iter()
            .map(|(target, access)| {
                if target.starts_with('$') && store_sub_vars.iter().any(|v| v == target) {
                    format!("$.store_set({}, {})", &target[1..], access)
                } else {
                    format!("{} = {}", target, access)
                }
            })
            .collect();

        if !is_standalone {
            // This is part of an expression, so the sequence must end with the value.
            expressions.push(rhs_trimmed.to_string());
        }

        if expressions.len() == 1 {
            // Upstream always lowers through `b.sequence(assignments)` — a real
            // `SequenceExpression`, unconditionally, even with one element — and
            // esrap always self-parenthesizes a `SequenceExpression`. A bare
            // `(assignment)` would reparse as a plain (non-sequence) expression
            // and lose those parens downstream; the marker call preserves the
            // "must be a sequence" decision through the reparse. See
            // `SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER`.
            return format!(
                "{}({})",
                SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER, expressions[0]
            );
        }
        // Single-line comma expression format.
        // IMPORTANT: Must be single-line because downstream processing in
        // process_accumulated/find_statement_end_client treats newlines at depth 0
        // as statement boundaries, which would break multi-line expressions.
        return format!("({})", expressions.join(", "));
    }

    // Upstream emits every `$$array` helper first, then every assignment, so a
    // nested helper is declared before the paths that read it.
    let mut body_lines: Vec<String> = inserts
        .iter()
        .map(|(name, value)| format!("\tvar {} = {};", name, value))
        .collect();
    if !body_lines.is_empty() {
        body_lines.push(String::new());
    }
    // A store target keeps its plain `$store = …` form here: the IIFE body is a
    // statement list, so the ordinary store-assignment transform still sees it.
    body_lines.extend(
        paths
            .iter()
            .map(|(target, access)| format!("\t{} = {};", target, access)),
    );

    if !is_standalone {
        body_lines.push(String::new());
        body_lines.push(format!("\treturn {};", param_name));
    }

    let body = body_lines.join("\n");
    // When the IIFE body or RHS contains `await`, the arrow must be async and the
    // whole call must be `await`ed, matching upstream's `is_expression_async` test.
    if code_contains_await(&body) || code_contains_await(rhs_str) {
        format!(
            "await (async ({}) => {{\n{}\n}})({})",
            param_name, body, rhs_str
        )
    } else {
        format!("(({}) => {{\n{}\n}})({})", param_name, body, rhs_str)
    }
}

/// Transform member expression assignments to `$.mutate()` calls in legacy mode.
///
/// Detects patterns at any nesting level (including inside function bodies) like:
/// - `var.prop = expr` -> `$.mutate(var, var.prop = expr)`
/// - `var[idx] = expr` -> `$.mutate(var, var[idx] = expr)`
/// - `var.prop++` -> `$.mutate(var, var.prop++)`
/// - `--var[idx]` -> `$.mutate(var, --var[idx])`
///
/// Only applies when the base of the member expression is a state variable in
/// non-runes (legacy) mode.
///
/// The subsequent `wrap_state_vars_in_expr` call will handle `$.get()` wrapping
/// inside the mutation expression (the `in_mutate_first_arg` guard in that
/// function ensures the first argument of `$.mutate()` is NOT double-wrapped).
pub(super) fn transform_member_mutations<'a>(
    line: &'a str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Cow<'a, str> {
    if state_vars.is_empty() {
        return Cow::Borrowed(line);
    }

    // AST-based pre-pass for assignments and updates of legacy state members.
    // When the AST helper has rewritten, skip the text
    // loop below — the AST is a complete replacement, and its
    // idempotency mechanism uses `visit_call_expression` wrap
    // detection (the text loop's `before.ends_with` guard is
    // designed for in-loop idempotency only and would re-wrap our
    // AST-produced wraps).
    let ast_result =
        super::legacy_state_member_mutate_ast::transform_legacy_state_member_mutate_ast(
            line,
            state_vars,
            non_reactive_state_vars,
            raw_state_vars,
            invalidate_bodies,
        );
    ast_result.map_or(Cow::Borrowed(line), Cow::Owned)
}

#[cfg(test)]
mod non_ascii_tests {
    use super::find_top_level_equals;

    #[test]
    fn find_top_level_equals_handles_non_ascii_before_equals() {
        // `let [café = 1] = arr` — the `=` lands past a multi-byte char, so the
        // returned index must be a byte offset usable for slicing (no panic).
        let s = "café = 1";
        let pos = find_top_level_equals(s).expect("should find top-level =");
        assert_eq!(&s[..pos], "café ");
        assert_eq!(s[pos + 1..].trim(), "1");
    }

    #[test]
    fn find_top_level_equals_skips_not_equals_after_non_ascii() {
        // `!=` is not a top-level assignment; the preceding-char check must run
        // against the correct char even when a multi-byte char sits earlier.
        assert_eq!(find_top_level_equals("café != x"), None);
    }

    #[test]
    fn scans_ignore_delimiters_in_comments_and_strings() {
        use super::{
            extract_destructure_targets, find_top_level_colon, skip_balanced, skip_expression,
            split_on_commas,
        };

        // A comma in a comment or a string is text, not a separator.
        assert_eq!(split_on_commas("a /* x, y */, b").len(), 2);
        assert_eq!(split_on_commas("a: ',', b").len(), 2);
        assert_eq!(split_on_commas("a // one, two\n, b").len(), 2);

        // A colon in a comment or a string does not rename a property.
        assert_eq!(find_top_level_colon("a /* k: v */"), None);
        assert_eq!(find_top_level_colon("a = ':'"), None);

        // A brace in a comment or a string does not close the block.
        let src = b"{ /* } */ a }rest";
        assert_eq!(skip_balanced(src, 0, b'{', b'}'), src.len() - 4);
        let src = b"{ a = '}' }rest";
        assert_eq!(skip_balanced(src, 0, b'{', b'}'), src.len() - 4);

        // A depth-0 comma in a comment does not end the arrow body.
        let src = b"a /* , */ + b, c";
        assert_eq!(skip_expression(src, 0), 13);

        // The whole pattern still yields the right targets when commented.
        assert_eq!(
            extract_destructure_targets("{ a /* , b */, c }"),
            vec!["a".to_string(), "c".to_string()]
        );
    }

    /// An unbalanced `{`- or `[`-prefixed fragment strips to itself, so recursing
    /// into it never shrinks the input — that overflowed the stack and aborted the
    /// host process instead of producing output or an error.
    #[test]
    fn extract_destructure_targets_terminates_on_an_unbalanced_fragment() {
        use super::extract_destructure_targets;

        assert!(extract_destructure_targets("{\n\t\t// } c\n\t\tbar").is_empty());
        assert!(extract_destructure_targets("{ a").is_empty());
        assert!(extract_destructure_targets("[ a").is_empty());
        assert!(extract_destructure_targets("{ a: [b").is_empty());
        // A balanced pattern still yields its targets.
        assert_eq!(
            extract_destructure_targets("{ a: [b] }"),
            vec!["b".to_string()]
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn destructure_rewrite_keeps_char_and_byte_offsets_separate() {
        let props = vec!["a".to_string()];
        let out = transform_destructure_assignments_with_props(
            "({ café: a } = value);",
            &[],
            &[],
            &[],
            &props,
        );
        assert!(out.contains("a = value.café"), "{out}");
    }

    #[test]
    fn destructure_at_end_of_callback_block_does_not_return_its_rhs() {
        let state = vec!["doc".to_string()];
        let out = transform_destructure_assignments_with_props(
            "query((res) => { ;[doc] = res }, options);",
            &state,
            &[],
            &[],
            &[],
        );

        assert!(out.contains("})(res)"), "{out}");
        assert!(!out.contains("return res"), "{out}");
    }

    #[test]
    fn destructure_as_parenthesized_control_body_does_not_return_its_rhs() {
        let state = vec!["icon".to_string()];
        let out = transform_destructure_assignments_with_props(
            "$: if (value) ({ icon } = priorities[value])",
            &state,
            &[],
            &[],
            &[],
        );

        assert!(out.contains("})(priorities[value])"), "{out}");
        assert!(!out.contains("return $$value"), "{out}");
    }

    #[cfg(feature = "measure-destructure-scanner")]
    #[test]
    fn destructure_scanner_measurement_counts_a_real_rewrite_and_final_rescan() {
        crate::measure_destructure_scanner::reset();
        let state = vec!["a".to_string()];
        let out =
            transform_destructure_assignments_with_props("({ a } = value);", &state, &[], &[], &[]);
        assert!(out.contains("a = value.a"), "{out}");

        let stats = crate::measure_destructure_scanner::snapshot();
        assert_eq!(stats.entries, 1);
        assert_eq!(stats.rewrites, 1);
        assert!(stats.scan_calls >= 2, "{stats:?}");
        assert!(stats.assignment_closers >= 1, "{stats:?}");
        assert!(stats.helper_calls >= 1, "{stats:?}");
    }

    #[test]
    fn matching_open_bracket_ignores_string_contents() {
        // `{ a = "}" } = obj` — the default value's `}` is text, not a closer.
        let s = r#"{ a = "}" } = obj"#;
        let close = ByteOffset::new(10);
        assert_eq!(
            find_matching_open_bracket(s, close, '{', '}'),
            Some(ByteOffset::ZERO)
        );
    }

    #[test]
    fn matching_open_bracket_ignores_comment_contents() {
        let s = "{ a, /* } */ b } = obj";
        let close = ByteOffset::new(s.rfind('}').unwrap());
        assert_eq!(
            find_matching_open_bracket(s, close, '{', '}'),
            Some(ByteOffset::ZERO)
        );
    }

    #[test]
    fn matching_open_bracket_still_matches_nested() {
        let s = "{ a: { b } } = obj";
        let close = ByteOffset::new(11);
        assert_eq!(
            find_matching_open_bracket(s, close, '{', '}'),
            Some(ByteOffset::ZERO)
        );
    }
}
