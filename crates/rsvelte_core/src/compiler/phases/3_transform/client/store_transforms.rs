//! Store subscription, assignment, and mutation transformations.

use memchr::memmem;
use oxc_allocator::Allocator;
use oxc_ast::ast::BindingIdentifier;
use oxc_ast_visit::Visit;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rustc_hash::FxHashSet;

use super::scan_index::ScanIndex;
use super::{find_matching_paren, is_shorthand_object_property};
use crate::compiler::phases::phase3_transform::shared::offsets::{CharLen, CharOffset, CharToByte};

/// How a store's own binding is read, the way `build_getter` reads any
/// reference to it: a prop is a getter call, a reassigned legacy `let` is a
/// signal read, anything else is the bare name. Six rewriters ask this.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum StoreSourceRead {
    Getter,
    Signal,
    Bare,
}

pub(super) fn store_source_read(
    store_name: &str,
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> StoreSourceRead {
    if prop_vars.iter().any(|p| p == store_name) {
        StoreSourceRead::Getter
    } else if state_vars.iter().any(|s| s == store_name)
        && !non_reactive_state_vars.iter().any(|s| s == store_name)
    {
        StoreSourceRead::Signal
    } else {
        StoreSourceRead::Bare
    }
}

/// Transform store assignments in client-side code.
///
/// Handles patterns like:
/// - `++$count` -> `$.update_pre_store(count, $count())`
/// - `$count++` -> `$.update_store(count, $count())`
/// - `$count += expr` -> `$.store_set(count, $count() + expr)`
/// - `$count = expr` -> `$.store_set(count, expr)`
/// - `$store.prop++` -> `$.store_mutate(store, ...)`
pub(super) fn transform_store_assignments_client(
    line: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the store sub vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = store_sub_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    // AST-based pre-passes — both target store-subscription names
    // but cover disjoint syntactic forms:
    //
    // 1. UpdateExpressions (`++$x` / `--$x` / `$x++` / `$x--`)
    // 2. AssignmentExpressions (`$x = expr` / `$x <op>= expr`)
    //
    // Both replace the same fragility class as the text loops below
    // (string / template / regex contents wrongly rewritten) and are
    // idempotent vs them: once a span has been rewritten the literal
    // byte pattern (`++$x`, `$x +=`) is gone and the text loop's
    // `result.contains(...)` / `result.find(...)` guard skips it.
    let after_updates = super::store_update_ast::transform_store_update_ast(
        line,
        store_sub_vars,
        prop_vars,
        state_vars,
        non_reactive_state_vars,
    );
    let stage1: &str = after_updates.as_deref().unwrap_or(line);
    let after_assigns = super::store_assign_ast::transform_store_assign_ast(
        stage1,
        store_sub_vars,
        prop_vars,
        state_vars,
        non_reactive_state_vars,
    );
    let result = after_assigns.unwrap_or_else(|| stage1.to_string());

    // Member-expression mutations (`$store.prop = …`, `$store[0]++`, etc.)
    // are handled by the dedicated AST helper, which reads the store source
    // through the same `store_source_read` the assign and update rewriters use.
    transform_store_member_mutations(
        &result,
        store_sub_vars,
        prop_vars,
        state_vars,
        non_reactive_state_vars,
        invalidate_bodies,
    )
}

/// Check if a store subscription name appears as a function parameter in a statement.
/// This detects patterns like `function bar($derived, $effect)` where the store sub name
/// is actually a function parameter, not a store reference.
pub(super) fn is_function_parameter_in_statement(statement: &str, store_sub: &str) -> bool {
    // Look for function declarations or arrow functions with the store sub as a parameter
    // Patterns: `function name($store` or `($store` in arrow functions
    // We search for the pattern: `(` ... store_sub ... `,` or `)` without intervening `(`
    let mut search_from = 0;
    while let Some(func_pos) = memmem::find(&statement.as_bytes()[search_from..], b"function ") {
        let abs_func_pos = search_from + func_pos;
        // Find the opening paren of the function params
        if let Some(paren_pos) = statement[abs_func_pos..].find('(') {
            let abs_paren_pos = abs_func_pos + paren_pos;
            // Find the closing paren
            if let Some(close_paren_pos) = find_matching_paren(&statement[abs_paren_pos + 1..]) {
                let params = &statement[abs_paren_pos + 1..abs_paren_pos + 1 + close_paren_pos];
                // Check if the store_sub appears as a parameter (word boundary)
                for param in params.split(',') {
                    let trimmed = param.trim();
                    // Handle destructuring and default values
                    let param_name = trimmed.split('=').next().unwrap_or(trimmed).trim();
                    // Strip destructuring delimiters so a name inside an array /
                    // object pattern param (`([$x, $y]) =>`) is recognized.
                    let param_name = param_name.trim_matches(|c: char| {
                        c == '[' || c == ']' || c == '{' || c == '}' || c.is_whitespace()
                    });
                    if param_name == store_sub {
                        return true;
                    }
                }
            }
        }
        search_from = abs_func_pos + 9;
    }

    // Also check for arrow function parameters.
    // Pattern 1: `$store =>` (unparenthesized single arrow param)
    //   e.g., `derived(count, $count => $count * 2)`
    let store_sub_len = store_sub.len();
    let mut pos = 0;
    while pos + store_sub_len <= statement.len() {
        if let Some(found) = statement[pos..].find(store_sub) {
            let abs_found = pos + found;
            // Check word boundary before
            let before_ok = !crate::compiler::utils::char_before(statement, abs_found)
                .is_some_and(is_ident_char);
            // Check word boundary after
            let after_pos = abs_found + store_sub_len;
            let after_ok =
                !crate::compiler::utils::char_at(statement, after_pos).is_some_and(is_ident_char);

            if before_ok && after_ok {
                // Check if followed by `=>` (with optional whitespace) = simple arrow param
                let rest = statement[after_pos..].trim_start();
                if rest.starts_with("=>") {
                    return true;
                }

                // Check if preceded by `(` (possibly with other params) and the paren
                // group is followed by `=>` = parenthesized arrow param
                // Look backwards for an opening paren that contains this store_sub as a param
                if abs_found > 0 {
                    // Check if we're inside a parenthesized arrow param list
                    // by looking back for `(` and checking if the `)` after is followed by `=>`
                    let prefix = &statement[..abs_found];
                    if let Some(open_paren) = prefix.rfind('(') {
                        let _params_str = &statement[open_paren + 1..abs_found];
                        // Check that params_str doesn't contain a sub-expression that would
                        // indicate this is NOT a simple param list (e.g., no `=>` before ours)
                        // Find the matching close paren
                        let from_open = &statement[open_paren + 1..];
                        if let Some(close_offset) = find_matching_paren(from_open) {
                            let close_paren = open_paren + 1 + close_offset;
                            // Check that the close paren is followed by `=>` (arrow function)
                            // close_paren points to `)`, so skip past it to check what follows
                            let after_close = statement[close_paren + 1..].trim_start();
                            if after_close.starts_with("=>") {
                                // Verify store_sub is indeed a parameter in this list
                                let params_content = &statement[open_paren + 1..close_paren];
                                for param in params_content.split(',') {
                                    let trimmed = param.trim();
                                    let param_name =
                                        trimmed.split('=').next().unwrap_or(trimmed).trim();
                                    // Strip destructuring delimiters so a name inside an
                                    // array/object pattern param (`([$x, $y]) =>`) matches.
                                    let param_name = param_name.trim_matches(|c: char| {
                                        c == '['
                                            || c == ']'
                                            || c == '{'
                                            || c == '}'
                                            || c.is_whitespace()
                                    });
                                    if param_name == store_sub {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            pos = abs_found + store_sub_len;
        } else {
            break;
        }
    }

    false
}

fn is_ident_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Whether `statement` declares a binding named `name` anywhere inside it.
///
/// The instance-script text pipeline transforms one complete top-level statement
/// at a time. A nested declaration can therefore shadow a component store-sub
/// binding that was discovered from the template, even though both have the same
/// spelling. Upstream resolves every reference through its lexical scope; the
/// name-only text transform must at least remove that spelling from the whole
/// statement containing the shadowing declaration.
pub(super) fn declares_binding_in_statement(statement: &str, name: &str) -> bool {
    if !statement.contains(name) {
        return false;
    }

    struct BindingFinder<'n> {
        name: &'n str,
        found: bool,
    }

    impl<'a> Visit<'a> for BindingFinder<'_> {
        fn visit_binding_identifier(&mut self, ident: &BindingIdentifier<'a>) {
            if ident.name == self.name {
                self.found = true;
            }
        }
    }

    let allocator = Allocator::default();
    for source_type in [SourceType::mjs(), SourceType::ts()] {
        let parsed = Parser::new(&allocator, statement, source_type).parse();
        let mut finder = BindingFinder { name, found: false };
        finder.visit_program(&parsed.program);
        if finder.found {
            return true;
        }
        if parsed.diagnostics.is_empty() {
            return false;
        }
    }
    false
}

/// The character ending at byte offset `end`, when it satisfies `pred`.
///
/// `end` must be a char boundary; every caller advances by `len_utf8`, so it stays one.
fn last_char_before(s: &str, end: usize, pred: impl Fn(char) -> bool) -> Option<char> {
    s[..end].chars().next_back().filter(|c| pred(*c))
}

/// Pre-transform store sub names that are used as function calls with arguments.
///
/// Handles cases like:
/// - `$state(0)` -> `$state()(0)` where `$state` is a store sub, not a rune
/// - `$effect(() => {...})` -> `$effect()(() => {...})` where `$effect` is a store sub
///
/// This inserts the getter call `()` between the store sub name and the argument parens.
/// It's called BEFORE `transform_store_reads_client` so that the `is_already_call` check
/// in that function will see `$state()` and correctly skip adding another `()`.
pub(super) fn transform_store_sub_calls(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the store sub vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = store_sub_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // Find pattern: $name( where $name is a store sub and is followed by `(`
        // but NOT by `()` (which would be the getter call itself, already inserted).
        // Also skip when preceded by `const $name = ` (store getter declaration).
        // Also skip when $name appears as a function parameter.
        let pattern = format!("{}(", store_sub);
        let mut new_result = String::new();
        let mut search_start = 0;
        let comment_ranges =
            crate::compiler::phases::phase3_transform::shared::js_scan::comment_ranges(
                result.as_bytes(),
            );
        let mut comment_range_index = 0;

        while let Some(pos) = result[search_start..].find(&pattern) {
            let abs_pos = search_start + pos;

            while comment_ranges
                .get(comment_range_index)
                .is_some_and(|&(_, end)| end <= abs_pos)
            {
                comment_range_index += 1;
            }
            let is_comment_text = comment_ranges
                .get(comment_range_index)
                .is_some_and(|&(start, end)| start <= abs_pos && abs_pos < end);
            let is_literal_text =
                super::state_transforms::is_inside_string_literal(&result, abs_pos)
                    || super::state_transforms::is_inside_regex_literal(&result, abs_pos);

            if is_literal_text || is_comment_text {
                new_result.push_str(&result[search_start..abs_pos + store_sub.len()]);
                search_start = abs_pos + store_sub.len();
                continue;
            }

            // Check if this is a word boundary (not part of a larger identifier)
            let before_ok =
                !crate::compiler::utils::char_before(&result, abs_pos).is_some_and(is_ident_char);

            if !before_ok {
                // Not a word boundary, skip
                new_result.push_str(&result[search_start..abs_pos + store_sub.len()]);
                search_start = abs_pos + store_sub.len();
                continue;
            }

            let paren_pos = abs_pos + store_sub.len(); // position of `(`

            // Check if this is inside a function parameter declaration
            // e.g., `function bar($state, $effect)` - skip these.
            // Only applies to the IMMEDIATELY enclosing unmatched `(`; a nested
            // call like `function go() { handleError($t(...)) }` must NOT be
            // treated as being in function params.
            let before_text = &result[..abs_pos];
            let is_in_func_params = {
                // Find the nearest unmatched `(` before our position.
                let bytes = before_text.as_bytes();
                let mut depth: i32 = 0;
                let mut open_paren_pos: Option<usize> = None;
                let mut i = bytes.len();
                while i > 0 {
                    i -= 1;
                    // Sound on a byte: the only targets are ASCII, and no byte of a
                    // multi-byte UTF-8 character can equal an ASCII byte.
                    let ch = bytes[i] as char;
                    if ch == ')' {
                        depth += 1;
                    } else if ch == '(' {
                        if depth == 0 {
                            open_paren_pos = Some(i);
                            break;
                        }
                        depth -= 1;
                    }
                }
                if let Some(p) = open_paren_pos {
                    // Check what is immediately before the `(`, skipping whitespace
                    // and an optional identifier (the function name).
                    // Character steps, not byte steps: `k` is a slice index below, and a
                    // byte step lands mid-character (`0x85` reads as NEL, `0xAA` as `ª`).
                    let mut k = p;
                    while let Some(c) = last_char_before(before_text, k, char::is_whitespace) {
                        k -= c.len_utf8();
                    }
                    // Skip an optional identifier (function name) before `(`
                    while let Some(c) = last_char_before(before_text, k, is_ident_char) {
                        k -= c.len_utf8();
                    }
                    // Skip whitespace before identifier
                    while let Some(c) = last_char_before(before_text, k, char::is_whitespace) {
                        k -= c.len_utf8();
                    }
                    // Now check if preceded by `function` keyword
                    if k >= 8 {
                        let prefix =
                            crate::compiler::utils::char_boundary_lookback(before_text, k, 8);
                        prefix == "function"
                            && (k == 8
                                || last_char_before(before_text, k - 8, is_ident_char).is_none())
                    } else {
                        false
                    }
                } else {
                    false
                }
            };

            if is_in_func_params {
                // Inside function parameters, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // Check if this is a store getter declaration: `const $name = () => $.store_get(...)`
            // We should skip this
            let trimmed_before = before_text.trim();
            if trimmed_before.ends_with(&format!("const {} =", store_sub))
                || trimmed_before.ends_with(&format!("let {} =", store_sub))
                || trimmed_before.ends_with(&format!("var {} =", store_sub))
            {
                // This is the getter declaration, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // This is a store sub being called with arguments - insert `()` before the `(`
            // e.g., `$state(0)` -> `$state()(0)`
            new_result.push_str(&result[search_start..abs_pos]);
            new_result.push_str(store_sub);
            new_result.push_str("()");
            search_start = paren_pos; // continue from the `(` which will be kept
        }

        // Append remaining
        new_result.push_str(&result[search_start..]);
        result = new_result;
    }

    result
}

/// Transform store subscription reads to $store() calls.
///
/// In the client runtime, store subscriptions like $count are getter functions.
/// So `const answer = $foo` must become `const answer = $foo()`.
///
/// This is similar to `transform_prop_reads_in_expr` but for store subscriptions.
pub(super) fn transform_store_reads_client(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the store sub vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = store_sub_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // The walk below copies every character it does not match, so a name
        // that does not occur rebuilds the line unchanged.
        if memmem::find(result.as_bytes(), store_sub.as_bytes()).is_none() {
            continue;
        }

        // Use word boundary matching to replace identifier references
        // But avoid replacing function calls that already have ()
        let mut new_result = String::with_capacity(result.len() * 2);
        // `i` walks `chars`, so the name's length has to be counted in the same unit.
        let sub_chars = CharLen::of(store_sub);
        let chars: Vec<char> = result.chars().collect();
        let index = ScanIndex::new(&chars);
        let char_to_byte = CharToByte::new(&result);
        let comment_ranges =
            crate::compiler::phases::phase3_transform::shared::js_scan::comment_ranges(
                result.as_bytes(),
            );
        let mut comment_range_index = 0;
        let mut i = CharOffset::ZERO;

        while i.get() < chars.len() {
            // Check if we're at the start of the identifier
            let byte_i = char_to_byte.byte(i);
            let remaining = byte_i.after(&result);
            if remaining.starts_with(store_sub) {
                // Check character before (must be non-identifier char or start of string)
                // Also exclude `.` - a dot before means this is a property access like `obj.$value`.
                // EXCEPTION: a `...` spread (`[...$store]`, `f(...$store)`) ends in a `.`
                // but is NOT a property access — the spread argument IS a read and must be
                // wrapped. Detect the spread by the three preceding dots.
                let char_i = i.get();
                let is_spread_prefix = char_i >= 3
                    && chars[char_i - 1] == '.'
                    && chars[char_i - 2] == '.'
                    && chars[char_i - 3] == '.';
                let before_ok = if i == CharOffset::ZERO || is_spread_prefix {
                    true
                } else {
                    let prev_char = chars[char_i - 1];
                    !prev_char.is_alphanumeric()
                        && prev_char != '_'
                        && prev_char != '$'
                        && prev_char != '.'
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + sub_chars;
                let after_ok = if after_idx.get() >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx.get()];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if this reference is already followed by `()` (getter call)
                // If so, skip adding () to avoid double-calling: $x() is already correct
                let is_already_call =
                    after_idx.get() < chars.len() && chars[after_idx.get()] == '(';

                // Check if this is inside $.untrack() or $.derived() - don't transform there
                // $.untrack expects a getter function, so $store should remain $store
                // $.derived($store) passes the store getter directly as the derivation function
                let is_inside_getter_context = {
                    // Look back for patterns that expect a getter function reference
                    let prefix = &new_result;
                    let trimmed_prefix = prefix.trim_end();
                    trimmed_prefix.ends_with("$.untrack(") || trimmed_prefix.ends_with("$.derived(")
                };

                // Check if this is an object property key (e.g., `{ $userName4: 'user4' }`)
                // In that case, `$userName4:` - the `:` following is a property separator, not a getter
                // We must distinguish from ternary operator `:` (e.g., `cond ? $store : 0`)
                // by checking if we're inside an unmatched `{` (object literal context).
                let is_property_key = {
                    let after_idx2 = i + sub_chars;
                    let mut k = after_idx2;
                    // Skip whitespace
                    while k.get() < chars.len() && chars[k.get()].is_whitespace() {
                        k = k.next();
                    }
                    let has_colon = k.get() < chars.len()
                        && chars[k.get()] == ':'
                        && (k.next().get() >= chars.len() || chars[k.next().get()] != ':');

                    // A real property key is ALWAYS immediately preceded (skipping
                    // whitespace/newlines) by `{` (first entry) or `,` (later entry).
                    // A ternary consequent `cond ? $store : x` is instead preceded by
                    // `?`. This distinguishes the two even inside a function body,
                    // whose block `{` would otherwise make the brace-depth check below
                    // a false positive for any ternary `$store :` in the body.
                    let prev_is_obj_sep = {
                        let mut j = i.get();
                        while j > 0 && chars[j - 1].is_whitespace() {
                            j -= 1;
                        }
                        j > 0 && (chars[j - 1] == '{' || chars[j - 1] == ',')
                    };

                    // Only treat as property key if followed by `:`, preceded by an
                    // object-entry separator, AND we're inside an unmatched `{`.
                    has_colon && prev_is_obj_sep && {
                        let mut brace_depth: i32 = 0;
                        for ch in new_result.chars() {
                            match ch {
                                '{' => brace_depth += 1,
                                '}' => brace_depth -= 1,
                                _ => {}
                            }
                        }
                        brace_depth > 0
                    }
                };

                // Check if this is inside literal text. A store-sub name can
                // appear mid-string (a log/message argument like
                // `"… if ($canvas_dim) :"`), not only right after the opening
                // quote, so scan from the start tracking string + template `${}`
                // state rather than only inspecting the preceding char. A `$x`
                // inside a `${ }` interpolation is code and is still transformed.
                // A regex body is the third opaque kind, and rewriting `/\$s/`
                // changes what the user's regex matches.
                let is_literal_text =
                    super::state_transforms::is_inside_string_literal(&result, byte_i.get())
                        || super::state_transforms::is_inside_regex_literal(&result, byte_i.get());
                while comment_ranges
                    .get(comment_range_index)
                    .is_some_and(|&(_, end)| end <= byte_i.get())
                {
                    comment_range_index += 1;
                }
                let is_comment_text = comment_ranges
                    .get(comment_range_index)
                    .is_some_and(|&(start, end)| start <= byte_i.get() && byte_i.get() < end);

                if before_ok && after_ok {
                    if is_literal_text || is_comment_text {
                        // Inside a string, regex, or comment - don't transform
                        new_result.push_str(store_sub);
                        i = i + sub_chars;
                        continue;
                    } else if is_property_key {
                        // Don't transform property keys like `{ $userName4: value }`
                        new_result.push_str(store_sub);
                        i = i + sub_chars;
                        continue;
                    } else if is_inside_getter_context {
                        // Inside $.untrack() or $.derived(), keep as $store (don't add parentheses)
                        new_result.push_str(store_sub);
                        i = i + sub_chars;
                        continue;
                    } else if is_already_call {
                        // Already followed by `(` - don't add another `()`
                        // This handles cases like `$x()` or `$.update_store(x, $x())`
                        // where the `()` was already generated by store assignment transforms
                        new_result.push_str(store_sub);
                        i = i + sub_chars;
                        continue;
                    } else if is_shorthand_object_property(&index, &chars, i.get(), sub_chars.get())
                    {
                        // Shorthand object property: `{ $width }` -> `{ $width: $width() }`.
                        // Emitting `{ $width() }` is invalid (method shorthand), so expand
                        // like the prop-read path, keeping the leading `$` in the key.
                        new_result.push_str(store_sub);
                        new_result.push_str(": ");
                        new_result.push_str(store_sub);
                        new_result.push_str("()");
                        i = i + sub_chars;
                        continue;
                    } else {
                        // Bare store reference - add () to call the getter
                        new_result.push_str(store_sub);
                        new_result.push_str("()");
                        i = i + sub_chars;
                        continue;
                    }
                }
            }

            // No match, just copy the character
            new_result.push(chars[i.get()]);
            i = i.next();
        }

        result = new_result;
    }

    result
}

/// Transform store member expression mutations.
///
/// Handles patterns like:
/// - `$store.prop++` -> `$.store_mutate(store, $.untrack($store).prop++, $.untrack($store))`
/// - `$store[0].value++` -> `$.store_mutate(store, $.untrack($store)[0].value++, $.untrack($store))`
/// - `$store.items[0] = x` -> `$.store_mutate(store, $.untrack($store).items[0] = x, $.untrack($store))`
pub(super) fn transform_store_member_mutations(
    line: &str,
    store_subs: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> String {
    super::store_member_mutate_ast::transform_store_member_mutate_ast_with_props(
        line,
        store_subs,
        prop_vars,
        state_vars,
        non_reactive_state_vars,
        invalidate_bodies,
    )
    .unwrap_or_else(|| line.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn store_read_survives_a_non_ascii_store_name() {
        let vars = vec!["$\u{540d}\u{524d}".to_string()];
        assert_eq!(
            transform_store_reads_client("x = $\u{540d}\u{524d} + 1;", &vars),
            "x = $\u{540d}\u{524d}() + 1;"
        );
    }

    #[test]
    fn store_read_is_not_already_a_call_across_non_ascii() {
        let vars = vec!["$\u{540d}\u{524d}".to_string()];
        assert_eq!(
            transform_store_reads_client("$\u{540d}\u{524d}();", &vars),
            "$\u{540d}\u{524d}();"
        );
    }

    #[test]
    fn store_read_spelling_inside_comments_is_not_rewritten() {
        let vars = vec!["$i18n".to_string()];
        assert_eq!(
            transform_store_reads_client(
                "// Assuming $i18n.languages is an array\nconst languages = $i18n.languages;",
                &vars,
            ),
            "// Assuming $i18n.languages is an array\nconst languages = $i18n().languages;"
        );
        assert_eq!(
            transform_store_reads_client(
                "/* $i18n.languages */ const languages = $i18n.languages;",
                &vars,
            ),
            "/* $i18n.languages */ const languages = $i18n().languages;"
        );
    }

    #[test]
    fn store_sub_call_spelling_inside_opaque_text_is_not_rewritten() {
        let vars = vec!["$i18n".to_string()];
        let source = "// $i18n('line')\n/* $i18n('block') */\nconst a = \"$i18n('string')\";\nconst b = /$i18n('regex')/;\nconst c = $i18n('code');";
        assert_eq!(
            transform_store_sub_calls(source, &vars),
            "// $i18n('line')\n/* $i18n('block') */\nconst a = \"$i18n('string')\";\nconst b = /$i18n('regex')/;\nconst c = $i18n()('code');"
        );
    }

    #[test]
    fn store_sub_call_inside_template_expression_is_still_rewritten() {
        let vars = vec!["$i18n".to_string()];
        assert_eq!(
            transform_store_sub_calls("const text = `label: ${$i18n('key')}`;", &vars),
            "const text = `label: ${$i18n()('key')}`;"
        );
    }

    /// `$s` sits in a function parameter list, so `transform_store_sub_calls`
    /// must leave it alone. The lookback walks back over the function name to
    /// reach the `function` keyword, and it used to walk one byte at a time.
    #[track_caller]
    fn assert_param_list_is_left_alone(func_name: &str) {
        let vars = vec!["$s".to_string()];
        let line = format!("function {func_name}($s(1))");
        assert_eq!(transform_store_sub_calls(&line, &vars), line);
    }

    /// Discriminating, and the quiet one. `\u{540d}`'s bytes are E5 90 8D; none of
    /// them satisfies the identifier predicate, so the byte cursor stopped
    /// immediately, never reached `function`, and the call was rewritten to
    /// `$s()(1)` inside a parameter list. No panic — just the wrong answer.
    #[test]
    fn a_cjk_function_name_is_still_walked_back_over() {
        assert_param_list_is_left_alone("foo\u{540d}");
    }

    /// Discriminating, and loud: `\u{3005}` is E3 80 85, and `0x85` reads as NEL,
    /// so the whitespace loop stepped into the middle of the character.
    #[test]
    fn an_iteration_mark_in_the_function_name_does_not_split_a_character() {
        assert_param_list_is_left_alone("foo\u{3005}");
    }

    /// Discriminating, and loud through the other door: `\u{05f2}` is D7 B2. The
    /// identifier loop accepts `0xB2` (`\u{b2}`, category No) and then rejects the
    /// lead byte `0xD7` (`\u{d7}`), stopping between the two.
    #[test]
    fn a_hebrew_function_name_does_not_split_a_character() {
        assert_param_list_is_left_alone("foo\u{05f2}");
    }

    /// Same door as the Hebrew case but from a script whose lead byte passes:
    /// `\u{306a}` is E3 81 AA, so `0xAA` (`\u{aa}`) is accepted and `0x81` rejected.
    /// Picking one script and concluding is how this class stays hidden.
    #[test]
    fn a_kana_function_name_does_not_split_a_character() {
        assert_param_list_is_left_alone("foo\u{306a}");
    }

    /// Control: byte and character steps coincide, so this passed before the fix.
    #[test]
    fn an_ascii_function_name_is_left_alone() {
        assert_param_list_is_left_alone("foo");
    }

    /// Control on the other side: outside a parameter list the call *is* rewritten,
    /// so a fix that made `is_in_func_params` always true would fail here.
    #[test]
    fn a_store_sub_call_outside_a_parameter_list_is_still_rewritten() {
        let vars = vec!["$s".to_string()];
        assert_eq!(
            transform_store_sub_calls("x = $s(1);", &vars),
            "x = $s()(1);"
        );
    }

    #[test]
    fn finds_nested_local_store_spelling_as_a_binding() {
        assert!(declares_binding_in_statement(
            "function render() { const $t = getTranslator(); return $t('key'); }",
            "$t"
        ));
    }

    #[test]
    fn a_store_reference_is_not_a_binding() {
        assert!(!declares_binding_in_statement(
            "function render() { return $t('key'); }",
            "$t"
        ));
    }

    #[test]
    fn finds_binding_names_in_destructuring_and_catch_parameters() {
        assert!(declares_binding_in_statement(
            "try { const { value: $t } = source; } catch ($error) {}",
            "$t"
        ));
        assert!(declares_binding_in_statement(
            "try {} catch ($error) { use($error); }",
            "$error"
        ));
    }
}
