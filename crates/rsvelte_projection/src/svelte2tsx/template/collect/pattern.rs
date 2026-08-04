//! Hand-written destructuring-pattern parsing used by the slot/let collection
//! pre-pass, which runs before any JS parse of the template expressions.

/// Extract the leaf binding identifiers from a destructuring pattern source
/// (`{ value, id }` → `["value", "id"]`, `[a, b]` → `["a", "b"]`, `{ k: v }` →
/// `["v"]`). Mirrors periscopic `extract_identifiers` over an each-block context
/// pattern, used to build per-identifier slot resolutions
/// (`((<pattern>) => name)(__sveltets_2_unwrapArr(coll))`). Like the other
/// expression scans in this module it is string-based (the svelte2tsx parse path
/// yields no per-expression AST children).
pub(super) fn collect_pattern_bindings(src: &str) -> Vec<String> {
    let chars: Vec<char> = src.chars().collect();
    let n = chars.len();
    let is_id_start = |c: char| c.is_alphabetic() || c == '_' || c == '$';
    let is_id = |c: char| c.is_alphanumeric() || c == '_' || c == '$';
    let mut out: Vec<String> = Vec::new();
    // Context stack: true = object pattern, false = array pattern.
    let mut ctx: Vec<bool> = Vec::new();
    let mut i = 0usize;
    while i < n {
        let c = chars[i];
        match c {
            '{' => {
                ctx.push(true);
                i += 1;
            }
            '[' => {
                ctx.push(false);
                i += 1;
            }
            '}' | ']' => {
                ctx.pop();
                i += 1;
            }
            '=' => {
                // Default value: skip to the next `,`/`}`/`]` at this depth.
                i += 1;
                let mut depth = 0i32;
                while i < n {
                    match chars[i] {
                        '{' | '[' | '(' => depth += 1,
                        '}' | ']' | ')' if depth > 0 => depth -= 1,
                        '}' | ']' if depth == 0 => break,
                        ',' if depth == 0 => break,
                        _ => {}
                    }
                    i += 1;
                }
            }
            '.' => {
                // Rest element `...name`.
                while i < n && chars[i] == '.' {
                    i += 1;
                }
                while i < n && chars[i].is_whitespace() {
                    i += 1;
                }
                if i < n && is_id_start(chars[i]) {
                    let start = i;
                    i += 1;
                    while i < n && is_id(chars[i]) {
                        i += 1;
                    }
                    out.push(chars[start..i].iter().collect());
                }
            }
            c if is_id_start(c) => {
                let start = i;
                i += 1;
                while i < n && is_id(chars[i]) {
                    i += 1;
                }
                let ident: String = chars[start..i].iter().collect();
                // Peek past whitespace to the next meaningful char.
                let mut k = i;
                while k < n && chars[k].is_whitespace() {
                    k += 1;
                }
                let next = chars.get(k).copied().unwrap_or('\0');
                // In an object pattern, `key: binding` — a `:` after the
                // identifier marks it as a KEY, so the binding is the RHS (handled
                // on a later iteration). Otherwise the identifier is itself a bound
                // name (array element, object shorthand, or a `:`-RHS value).
                if !(matches!(ctx.last(), Some(true)) && next == ':') {
                    out.push(ident);
                }
            }
            _ => {
                i += 1;
            }
        }
    }
    out
}

/// Resolve a slot-prop expression through the template scope, mirroring official
/// `SlotHandler.resolveExpression` (svelte2tsx `nodes/slot.ts`).
///
/// Official walks the expression AST and overwrites every `Identifier` with its
/// scope resolution — an `{#each}` context becomes `__sveltets_2_unwrapArr(coll)`,
/// a `let:`-forwarded name becomes `__sveltets_2_instanceOf(C).$$slot_def[…]` —
/// except for three positions it deliberately leaves alone: a member-access
/// property (`isMember`), an object-literal KEY (`isObjectKey`) and the value of
/// an object shorthand (`isObjectValueShortHand`), which instead gets
/// `appendLeft(end, ':' + value)` so `{ x }` becomes `{ x:<resolved> }`.
///
/// In the svelte2tsx parse path the per-expression arena yields no children
/// (`expr.as_json()` is empty), so — like `get_set_binding_ranges` — this is a
/// string scan instead of an AST walk. Tracking the object-literal context is
/// what keeps a key out of the substitution set; string and template literals are
/// copied verbatim for the same reason.
pub(super) fn resolve_slot_expression(text: &str, scope: &[(String, String)]) -> String {
    let chars: Vec<char> = text.chars().collect();
    let is_ident_start = |c: char| c.is_alphabetic() || c == '_' || c == '$';
    let is_ident = |c: char| c.is_alphanumeric() || c == '_' || c == '$';
    let resolve = |name: &str| -> String {
        match scope.iter().rev().find(|(bound, _)| bound == name) {
            Some((_, expr)) => expr.clone(),
            None => name.to_string(),
        }
    };
    let mut out = String::with_capacity(text.len());
    // Context stack: `true` = object literal (property keys expected after
    // `{` / `,`), `false` = array / call / block / group.
    let mut ctx: Vec<bool> = Vec::new();
    // Whether the next token starts an object-literal property (key position).
    let mut expect_prop = false;
    // Last non-whitespace char emitted (to decide if a `{` opens an object).
    let mut prev: char = '\0';
    let mut prev2: char = '\0';
    let mut i = 0usize;
    let n = chars.len();
    while i < n {
        let c = chars[i];
        // String / template literal: copy verbatim.
        if c == '"' || c == '\'' || c == '`' {
            let quote = c;
            out.push(c);
            i += 1;
            while i < n {
                let ch = chars[i];
                out.push(ch);
                i += 1;
                if ch == '\\' && i < n {
                    out.push(chars[i]);
                    i += 1;
                    continue;
                }
                if ch == quote {
                    break;
                }
            }
            expect_prop = false;
            prev2 = prev;
            prev = quote;
            continue;
        }
        match c {
            '{' => {
                // A `{` opens an object literal when it sits in value position:
                // at the start, or right after `(`, `[`, `,`, `:`, or `=>`.
                let is_object =
                    matches!(prev, '\0' | '(' | '[' | ',' | ':') || (prev == '>' && prev2 == '=');
                ctx.push(is_object);
                expect_prop = is_object;
                out.push(c);
                prev2 = prev;
                prev = c;
                i += 1;
            }
            '}' => {
                ctx.pop();
                expect_prop = false;
                out.push(c);
                prev2 = prev;
                prev = c;
                i += 1;
            }
            '[' if expect_prop => {
                // Computed object key (`{ [expr]: value }`). Official's `isObjectKey`
                // only matches when the `Identifier` node sits directly in the key
                // slot, so a bare-identifier key (`[item]`) is left untouched while a
                // compound key expression (`[item + 1]`) has its nested identifiers
                // resolved as if they weren't in key position at all — mirrored here
                // by consuming the whole `[…]` span and branching on its shape.
                let close = find_matching_close(&chars, i, '[', ']');
                let inner: String = chars[i + 1..close].iter().collect();
                let trimmed = inner.trim();
                let is_bare_ident = {
                    let mut it = trimmed.chars();
                    match it.next() {
                        Some(c0) if is_ident_start(c0) => it.all(is_ident),
                        _ => false,
                    }
                };
                out.push('[');
                if is_bare_ident {
                    out.push_str(&inner);
                } else {
                    out.push_str(&resolve_slot_expression(&inner, scope));
                }
                out.push(']');
                expect_prop = false;
                prev2 = prev;
                prev = ']';
                i = close + 1;
            }
            '[' | '(' => {
                ctx.push(false);
                expect_prop = false;
                out.push(c);
                prev2 = prev;
                prev = c;
                i += 1;
            }
            ']' | ')' => {
                ctx.pop();
                expect_prop = false;
                out.push(c);
                prev2 = prev;
                prev = c;
                i += 1;
            }
            ',' => {
                out.push(c);
                expect_prop = matches!(ctx.last(), Some(true));
                prev2 = prev;
                prev = c;
                i += 1;
            }
            ':' => {
                out.push(c);
                expect_prop = false;
                prev2 = prev;
                prev = c;
                i += 1;
            }
            c if c.is_whitespace() => {
                out.push(c);
                i += 1;
            }
            // Start of an identifier token — not a member-access tail (`.prop`)
            // and not the continuation of a longer identifier.
            c if is_ident_start(c)
                && (i == 0 || (!is_ident(chars[i - 1]) && chars[i - 1] != '.')) =>
            {
                let mut j = i + 1;
                while j < n && is_ident(chars[j]) {
                    j += 1;
                }
                let ident: String = chars[i..j].iter().collect();
                if expect_prop {
                    // Look ahead, skipping whitespace, to the next meaningful char.
                    let mut k = j;
                    while k < n && chars[k].is_whitespace() {
                        k += 1;
                    }
                    let next = chars.get(k).copied().unwrap_or('\0');
                    // The key itself is never substituted. A bare identifier
                    // followed by `,` or `}` is a true shorthand (`{ foo }`) and
                    // gains the resolved value; `key: …`, method `foo() {}`, etc.
                    // are keys only.
                    out.push_str(&ident);
                    if next == ',' || next == '}' || next == '\0' {
                        out.push(':');
                        out.push_str(&resolve(&ident));
                    }
                } else {
                    out.push_str(&resolve(&ident));
                }
                expect_prop = false;
                prev2 = prev;
                prev = chars[j - 1];
                i = j;
            }
            _ => {
                // Any other char in property position (e.g. `.` of a spread)
                // means this is not a plain shorthand.
                expect_prop = false;
                out.push(c);
                prev2 = prev;
                prev = c;
                i += 1;
            }
        }
    }
    out
}

/// Find the index of the `close` char matching the `open` char at `chars[open_index]`,
/// skipping over string/template literals so brackets inside them don't count. Only the
/// depth of `open`/`close` itself is tracked — other bracket kinds nested inside pair up
/// on their own and never unbalance this count.
fn find_matching_close(chars: &[char], open_index: usize, open: char, close: char) -> usize {
    let n = chars.len();
    let mut depth = 0i32;
    let mut i = open_index;
    while i < n {
        let c = chars[i];
        if c == '"' || c == '\'' || c == '`' {
            let quote = c;
            i += 1;
            while i < n {
                let ch = chars[i];
                i += 1;
                if ch == '\\' && i < n {
                    i += 1;
                    continue;
                }
                if ch == quote {
                    break;
                }
            }
            continue;
        }
        if c == open {
            depth += 1;
        } else if c == close {
            depth -= 1;
            if depth == 0 {
                return i;
            }
        }
        i += 1;
    }
    n.saturating_sub(1)
}
