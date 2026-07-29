/// Strips the first `( … )` pair from `s`, keeping everything after the matched
/// close paren verbatim. Returns `None` when `s` doesn't start with `(` or the
/// paren is unbalanced. Paren scanning skips string/template literals and
/// `//` / `/* */` comments so a `)` inside them isn't mistaken for the match.
pub(super) fn strip_leading_paren_pair(s: &str) -> Option<String> {
    let t = s.trim_start();
    if !t.starts_with('(') {
        return None;
    }
    let chars: Vec<char> = t.chars().collect();
    let mut depth: i32 = 0;
    let mut i = 0;
    let mut in_string: Option<char> = None;
    let mut close: Option<usize> = None;
    while i < chars.len() {
        let c = chars[i];
        match in_string {
            Some(q) => {
                if c == '\\' {
                    i += 2;
                    continue;
                } else if c == q {
                    in_string = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_string = Some(c),
                '/' if chars.get(i + 1) == Some(&'/') => {
                    while i < chars.len() && chars[i] != '\n' {
                        i += 1;
                    }
                    continue;
                }
                '/' if chars.get(i + 1) == Some(&'*') => {
                    i += 2;
                    while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                        i += 1;
                    }
                    i += 2;
                    continue;
                }
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        close = Some(i);
                        break;
                    }
                }
                _ => {}
            },
        }
        i += 1;
    }
    let close = close?;
    let inner: String = chars[1..close].iter().collect();
    let rest: String = chars[close + 1..].iter().collect();
    Some(format!("{}{}", inner.trim(), rest))
}

pub(super) fn strip_outer_parens(s: &str) -> &str {
    let trimmed = s.trim();
    let Some(inner) = trimmed.strip_prefix('(').and_then(|s| s.strip_suffix(')')) else {
        return s;
    };
    if outer_parens_match(inner) { inner } else { s }
}

/// Returns `true` when the first line of a block-header expression ends with a
/// top-level logical operator (`&&` or `||`).  Used to detect when OXC wraps
/// at a logical operator — prettier-plugin-svelte keeps block headers on one
/// line in that case (even when they overflow), so we reject the multi-line
/// form and use the inline version instead.
pub(super) fn first_line_ends_with_logical_op(first_line: &str) -> bool {
    let t = first_line.trim_end();
    t.ends_with("&&") || t.ends_with("||") || t.ends_with("??")
}

/// Returns `true` when the expression source starts with `[` or `{`
/// (an array literal or object literal).  prettier-plugin-svelte never breaks
/// these in block-header positions even when they are far wider than the print
/// width — e.g. `{#each ["a", "b", …] as x}` stays on one line regardless.
pub(super) fn starts_with_array_or_object_literal(formatted: &str) -> bool {
    let t = formatted.trim_start();
    t.starts_with('[') || t.starts_with('{')
}

/// Collapse a multi-line OXC-formatted array or object literal back to a
/// single line, matching prettier-plugin-svelte's `removeLines` / `forceSingleLine`
/// behaviour for block-header expressions.
///
/// OXC always breaks wide arrays/objects into multiple lines (with trailing
/// commas on the last element), but prettier-plugin-svelte keeps them on one
/// line in `{#each}`, `{#if}`, etc. headers.  We replicate this by:
///
/// 1. Splitting the multi-line output into lines.
/// 2. Trimming leading whitespace from each inner line.
/// 3. Removing the trailing comma from the last element before `]` / `}`.
/// 4. Joining with spaces / no separator as appropriate.
///
/// Example input:
/// ```text
/// [
///   { label: "Today", value: 0 },
///   { label: "Tomorrow", value: 1 },
/// ]
/// ```
/// Example output: `[{ label: "Today", value: 0 }, { label: "Tomorrow", value: 1 }]`
pub(super) fn collapse_multiline_to_single_line(formatted: &str) -> String {
    let lines: Vec<&str> = formatted.lines().collect();
    if lines.len() < 2 {
        return formatted.to_string();
    }
    let first = lines[0].trim();
    let last = lines[lines.len() - 1].trim();
    // Collect inner lines (between first and last).
    let inner: Vec<&str> = lines[1..lines.len() - 1].iter().map(|l| l.trim()).collect();
    if inner.is_empty() {
        // Empty array/object: e.g. `[\n]` → `[]`
        return format!("{first}{last}");
    }
    // Join inner items. The last inner item has a trailing comma added by OXC;
    // remove it so the single-line form doesn't have a trailing comma.
    let mut items: Vec<&str> = inner.clone();
    // Strip trailing comma from the last non-empty item.
    if let Some(last_item) = items.last_mut() {
        *last_item = last_item.trim_end_matches(',').trim_end();
    }
    let joined = items.join(" ");
    format!("{first}{joined}{last}")
}

pub(super) fn compute_header_suffix_len(source: &str, expr_end: usize) -> usize {
    let Some(tail) = source.get(expr_end..) else {
        return 0;
    };
    let mut depth = 0i32;
    let mut scanned_bytes = 0usize;
    let mut quote = None;
    let chars: Vec<char> = tail.chars().collect();
    let mut index = 0usize;
    while index < chars.len() {
        let character = chars[index];
        scanned_bytes += character.len_utf8();
        match quote {
            Some(delimiter) => {
                if character == '\\' {
                    index += 1;
                    if index < chars.len() {
                        scanned_bytes += chars[index].len_utf8();
                    }
                } else if character == delimiter {
                    quote = None;
                }
            }
            None => match character {
                '"' | '\'' | '`' => quote = Some(character),
                '{' | '(' | '[' => depth += 1,
                '}' if depth == 0 => {
                    return UnicodeWidthStr::width(&tail[..scanned_bytes]);
                }
                '}' | ')' | ']' if depth > 0 => depth -= 1,
                '\n' => return 0,
                _ => {}
            },
        }
        index += 1;
    }
    0
}

/// Returns `true` when OXC's multi-line output represents a method-chain break —
/// i.e. at least one continuation line starts with `.` after trimming whitespace.
/// This distinguishes call-chain breaks (hardlines in prettier, kept by removeLines)
/// from argument-wrapping breaks (softlines in prettier, removed by removeLines).
pub(super) fn is_method_chain_break(multi: &str) -> bool {
    multi
        .lines()
        .skip(1)
        .any(|line| line.trim_start().starts_with('.'))
}

pub(super) fn outer_parens_match(inner: &str) -> bool {
    // Count parens to verify the stripped outer pair was balanced, but ignore
    // any `(`/`)` that appear inside a string/template literal or a line/block
    // comment — e.g. a body comment like `// 1.) No clamping` carries a lone `)`
    // that must not be counted, otherwise a perfectly balanced object/arrow value
    // is judged unbalanced and its redundant wrapper parens are kept (`{({…})}`).
    let mut depth: i32 = 0;
    let chars: Vec<char> = inner.chars().collect();
    let mut i = 0;
    let mut in_string: Option<char> = None;
    while i < chars.len() {
        let c = chars[i];
        match in_string {
            Some(q) => {
                if c == '\\' {
                    i += 2;
                    continue;
                } else if c == q {
                    in_string = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_string = Some(c),
                '/' if chars.get(i + 1) == Some(&'/') => {
                    // Line comment: skip to end of line.
                    while i < chars.len() && chars[i] != '\n' {
                        i += 1;
                    }
                    continue;
                }
                '/' if chars.get(i + 1) == Some(&'*') => {
                    // Block comment: skip to the closing `*/`.
                    i += 2;
                    while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                        i += 1;
                    }
                    i += 2;
                    continue;
                }
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth < 0 {
                        return false;
                    }
                }
                _ => {}
            },
        }
        i += 1;
    }
    depth == 0
}

/// When OXC's multi-line output represents an expanded call-argument break
/// where the ARROW BODY (not the outer call) was expanded, collapse all the
/// lines into a single line and insert a leading space after the outermost
/// opening `(`.
///
/// This mimics prettier-plugin-svelte's `removeLines` / `forceSingleLine`
/// behavior: soft-breaks inside a call-argument list are collapsed to spaces,
/// BUT the expanded-args markers (`( ` prefix and `, )` suffix) are preserved.
///
/// Example:
/// ```text
/// input:
///   options.filter((opt) =>
///     selectedValues.has(opt.value),
///   )
/// output: options.filter( (opt) => selectedValues.has(opt.value), )
/// ```
///
/// Returns `None` when:
/// - The last line is not just `)` (not an expanded call-arg form).
/// - The joined form doesn't end with `, )`.
/// - The first line ends with `(` — this indicates the OUTER call was fully
///   expanded (OXC put all args on a new line starting with `(`), which means
///   prettier-plugin-svelte keeps the expression single-line WITHOUT the
///   expanded-arg markers.  These cases must stay as the inline form.
pub(super) fn collapse_expanded_arg_form(multi: &str) -> Option<String> {
    // Step 1: join all lines into a single line, trimming leading whitespace
    // from each continuation line.
    let lines: Vec<&str> = multi.trim_end_matches(';').trim().lines().collect();
    if lines.len() < 2 {
        return None;
    }
    // The last line should be `)` alone (the closing of the outermost call).
    let last = lines[lines.len() - 1].trim();
    if last != ")" {
        return None;
    }
    // When the FIRST line ends with `(`, OXC expanded the outer call completely
    // (all args on a new line). prettier-plugin-svelte's `removeLines` collapses
    // this back to the inline form WITHOUT expanded-arg markers — so oracle keeps
    // it single-line. Do NOT apply the expanded form in this case.
    let first = lines[0].trim_end();
    if first.ends_with('(') {
        return None;
    }
    // Join all lines with a single space, trimming each line's leading whitespace.
    let joined = lines
        .iter()
        .map(|l| l.trim_start())
        .collect::<Vec<_>>()
        .join(" ");
    // Bail if the source contains string literals — delimiter scanning would be
    // ambiguous (a `(` or `)` inside a string would corrupt the depth walk).
    if joined.contains('\'') || joined.contains('"') || joined.contains('`') {
        return None;
    }
    // The joined form should end with `, )` (trailing comma from expanded args
    // followed by the closing `)`).
    if !joined.ends_with(", )") {
        return None;
    }
    // Step 2: find the outermost `(` that matches the trailing `)` and insert
    // a space after it to produce the `( arg, )` form.
    let close_pos = joined.len() - 1; // position of the trailing `)`
    let mut depth: i32 = 0;
    let bytes = joined.as_bytes();
    let mut open_pos: Option<usize> = None;
    for i in (0..close_pos).rev() {
        match bytes[i] {
            b')' => depth += 1,
            b'(' => {
                if depth == 0 {
                    open_pos = Some(i);
                    break;
                }
                depth -= 1;
            }
            _ => {}
        }
    }
    let open_pos = open_pos?;
    // Insert a space after the opening `(` to produce the `( arg )` form, and
    // DROP the trailing comma OXC bakes into its broken output. This mirrors
    // prettier-plugin-svelte's `removeLines` (`forceSingleLine`), which strips the
    // `ifBreak(",")` trailing-comma doc entirely when it collapses the group back
    // to one line — so the oracle emits `fn( arg )`, not `fn( arg, )`. (OXC's
    // broken form has the comma as literal text, not an `ifBreak`, so it survives
    // a naive line-join; we must remove it explicitly.)
    let joined = joined
        .strip_suffix(", )")
        .map(|head| format!("{head} )"))
        .unwrap_or(joined);
    let mut result = String::with_capacity(joined.len() + 1);
    result.push_str(&joined[..open_pos + 1]);
    result.push(' ');
    result.push_str(&joined[open_pos + 1..]);
    Some(result)
}

/// Collapse OXC's `LineWidth::MAX` "expanded call" layout back to prettier's
/// single-line block-header form, WITH expanded-arg spacing.
///
/// `format_inline_expression` (LineWidth::MAX) only breaks a call across lines
/// when OXC unconditionally expands it — the same shape prettier bakes as
/// `allArgsBrokenOut` under shouldExpandLastArg. prettier-plugin-svelte's
/// `removeLines` then collapses that layout to one line, turning the `line`
/// separators into spaces and dropping the trailing comma: `callee( a, b )`.
///
/// The gate rests on the empirical MAX-break ⟺ shouldExpandLastArg correlation
/// (a call reaches this path only when OXC unconditionally expands it); should a
/// future oxc update break that correlation, the fmt corpus output-equality gate
/// is the safety net that catches it.
///
/// Accepts only the "flat arguments" shape: the first line ends with `(`, the
/// last line is `)` alone, and every intervening line is one complete top-level
/// argument (bracket depth returns to the argument-list level at the line
/// boundary). Returns `None` otherwise (e.g. an argument's own object/array broke
/// across further lines, or a curried `)(` closes the argument list mid-region) so
/// the caller keeps the multi-line output unchanged.
///
/// Exclusive with [`collapse_expanded_arg_form`], which handles the complementary
/// shape where the first line does NOT end with `(` (an argument hugged onto the
/// first line, e.g. `options.filter((opt) =>`).
pub(super) fn collapse_block_header_expanded_call(multi: &str) -> Option<String> {
    let lines: Vec<&str> = multi.trim_end_matches(';').trim().lines().collect();
    if lines.len() < 3 {
        return None;
    }
    let first = lines[0].trim_end();
    if !first.ends_with('(') {
        return None;
    }
    if lines[lines.len() - 1].trim() != ")" {
        return None;
    }
    let inner = &lines[1..lines.len() - 1];
    // depth starts at 1: the first line's trailing `(` opened the argument list.
    // Each inner line is one complete top-level argument, so depth returns to 1 at
    // every line boundary. It must never reach 0 mid-region — depth 0 means the
    // argument list closed early (e.g. a curried `foo(...)(...)` whose inner line
    // carries a `)(`), which this flat-args fold cannot represent, so bail rather
    // than emit a corrupted single line.
    let mut depth: i32 = 1;
    let mut in_string: Option<char> = None;
    let mut prev_escape = false;
    let mut args: Vec<String> = Vec::with_capacity(inner.len());
    for line in inner {
        let t = line.trim();
        for c in t.chars() {
            if let Some(q) = in_string {
                if prev_escape {
                    prev_escape = false;
                } else if c == '\\' {
                    prev_escape = true;
                } else if c == q {
                    in_string = None;
                }
                continue;
            }
            match c {
                '"' | '\'' | '`' => in_string = Some(c),
                '(' | '[' | '{' => depth += 1,
                ')' | ']' | '}' => {
                    depth -= 1;
                    if depth <= 0 {
                        return None;
                    }
                }
                _ => {}
            }
        }
        // A complete top-level argument returns to the argument-list level.
        if in_string.is_some() || depth != 1 {
            return None;
        }
        args.push(t.to_string());
    }
    // Drop OXC's trailing comma on the last argument (removeLines strips the
    // `ifBreak(",")`); the commas between args are the real separators.
    if let Some(last) = args.last_mut() {
        *last = last.trim_end_matches(',').trim_end().to_string();
    }
    let joined = args.join(" ");
    Some(format!("{first} {joined} )"))
}

/// Convert OXC's `fn({ k: v, ... })` / `fn({\n  k: v,\n})` form to
/// prettier-plugin-svelte's "outer-expanded-arg" form:
/// ```text
/// fn(
///   { k: v },        // object fits on one line
/// )
/// ```
/// or:
/// ```text
/// fn(
///   {
///     k: v,
///   },               // object needed multi-line
/// )
/// ```
///
/// This is used for embedded mustache expressions inside quoted attributes
/// (`class="... {fn({...})}"`) where OXC always places the object literal
/// immediately after the `(`, but prettier-plugin-svelte separates the arg
/// onto its own line with a trailing comma (the "expanded-arg" marker).
///
/// Returns `None` when the input doesn't match the expected shape:
/// - Not a call expression ending with `)` or `})`.
/// - Has multiple arguments (more than one top-level comma at depth 0).
/// - The single argument is not an object literal `{...}`.
pub(crate) fn expand_obj_arg_call(s: &str, indent_width: usize) -> Option<String> {
    let s = s.trim();
    // Must end with `)` (single-line) or `})` (multi-line)
    if !s.ends_with(')') {
        return None;
    }
    // Bail if source contains string literals — delimiter scanning would be
    // ambiguous (a `{`, `(`, or `,` inside a string would corrupt depth walks).
    if s.contains('\'') || s.contains('"') || s.contains('`') {
        return None;
    }
    // Find the outermost opening `(` that matches the final `)`.
    let close_pos = s.len() - 1;
    let bytes = s.as_bytes();
    let mut depth: i32 = 0;
    let mut open_paren: Option<usize> = None;
    for i in (0..close_pos).rev() {
        match bytes[i] {
            b')' => depth += 1,
            b'(' => {
                if depth == 0 {
                    open_paren = Some(i);
                    break;
                }
                depth -= 1;
            }
            _ => {}
        }
    }
    let open_paren = open_paren?;
    // The prefix before `(` must be non-empty (it's the function/callee).
    if open_paren == 0 {
        return None;
    }
    let prefix = &s[..open_paren];
    // The argument body between `(` and `)`.
    let arg_body = s[open_paren + 1..close_pos].trim();
    // The argument must be an object literal `{...}`.
    if !arg_body.starts_with('{') {
        return None;
    }
    // Ensure it's a single object arg: only `{...}` at the top level (no
    // top-level commas outside the object braces).
    let arg_trimmed = arg_body.trim_end_matches(',').trim();
    if !arg_trimmed.starts_with('{') || !arg_trimmed.ends_with('}') {
        return None;
    }
    // Verify balanced braces (no stray top-level commas between separate args).
    let mut brace_depth: i32 = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut has_top_level_comma = false;
    for (i, &b) in arg_trimmed.as_bytes().iter().enumerate() {
        match b {
            b'{' => brace_depth += 1,
            b'}' => brace_depth -= 1,
            b'(' => paren_depth += 1,
            b')' => paren_depth -= 1,
            b'[' => bracket_depth += 1,
            b']' => bracket_depth -= 1,
            b',' if brace_depth == 0 && paren_depth == 0 && bracket_depth == 0 && i > 0 => {
                has_top_level_comma = true;
                break;
            }
            _ => {}
        }
    }
    if has_top_level_comma || brace_depth != 0 {
        return None;
    }
    // Bail out when the object literal contains nested objects — the
    // re-indentation logic doesn't handle them correctly.
    {
        let mut depth = 0i32;
        let mut has_nested = false;
        for ch in arg_trimmed.chars() {
            match ch {
                '{' => {
                    depth += 1;
                    if depth > 1 {
                        has_nested = true;
                        break;
                    }
                }
                '}' => depth -= 1,
                _ => {}
            }
        }
        if has_nested {
            return None;
        }
    }
    // Build the expanded form.
    let indent = " ".repeat(indent_width);
    if !arg_body.contains('\n') {
        // Single-line object: `fn(\n  { k: v },\n)`
        // Strip trailing comma from the object literal if present (we add a new one).
        let arg_clean = arg_body.trim_end_matches(',').trim();
        Some(format!("{prefix}(\n{indent}{arg_clean},\n)"))
    } else {
        // Multi-line object: re-indent each line inside the `{...}` by one extra
        // level, then wrap with `fn(\n  {\n    ...\n  },\n)`.
        let lines: Vec<&str> = arg_body.lines().collect();
        if lines.is_empty() {
            return None;
        }
        // First line should be `{` (possibly with spaces, from OXC).
        // Last line should be `}` or `},` (the closing brace).
        let first = lines[0].trim();
        let last = lines[lines.len() - 1].trim().trim_end_matches(',');
        if first != "{" || last != "}" {
            return None;
        }
        let mut result = format!("{prefix}(\n{indent}{{\n");
        // Interior lines (everything except first `{` and last `}`).
        for line in &lines[1..lines.len() - 1] {
            let trimmed = line.trim_start();
            if trimmed.is_empty() {
                result.push('\n');
            } else {
                result.push_str(&indent);
                result.push_str(&indent);
                result.push_str(trimmed);
                result.push('\n');
            }
        }
        result.push_str(&indent);
        result.push_str("},\n)");
        Some(result)
    }
}
use unicode_width::UnicodeWidthStr;
