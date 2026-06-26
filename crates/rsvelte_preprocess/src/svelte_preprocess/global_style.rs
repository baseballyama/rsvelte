//! Port of `svelte-preprocess`'s `globalStyle` transformer
//! (`src/transformers/globalStyle.ts` + `src/modules/globalifySelector.ts`).
//!
//! The upstream walks the CSS with postcss and rewrites selectors; postcss
//! preserves the original formatting and only edits what the plugins touch. We
//! mirror that by parsing the CSS structurally and emitting in-place byte edits
//! (selector / `@keyframes` param rewrites, rule removal / `:global` unwrap),
//! leaving everything else verbatim.

use regex::Regex;

/// `globalifyRulePlugin` (always) + `globalAttrPlugin` (when `is_global`).
pub fn transform(content: &str, is_global: bool) -> Result<String, String> {
    let mut edits: Vec<(usize, usize, String)> = Vec::new();
    scan_block(content, 0, content.len(), None, is_global, &mut edits);
    edits.sort_by_key(|e| std::cmp::Reverse(e.0));
    let mut out = content.to_string();
    for (start, end, text) in edits {
        out.replace_range(start..end, &text);
    }
    Ok(out)
}

/// Advance past a `/* … */` comment or a `'…'` / `"…"` string starting at `i`,
/// returning the index just past it; otherwise `None`.
fn skip_trivia(s: &str, i: usize) -> Option<usize> {
    let b = s.as_bytes();
    if i + 1 < b.len() && b[i] == b'/' && b[i + 1] == b'*' {
        let mut j = i + 2;
        while j + 1 < b.len() && !(b[j] == b'*' && b[j + 1] == b'/') {
            j += 1;
        }
        return Some((j + 2).min(b.len()));
    }
    if b[i] == b'"' || b[i] == b'\'' {
        let q = b[i];
        let mut j = i + 1;
        while j < b.len() {
            if b[j] == b'\\' {
                j += 2;
                continue;
            }
            if b[j] == q {
                return Some(j + 1);
            }
            j += 1;
        }
        return Some(b.len());
    }
    None
}

/// Index of the `}` matching the `{` at `open`, within `[.., end)`.
fn find_matching_brace(s: &str, open: usize, end: usize) -> usize {
    let b = s.as_bytes();
    let mut depth = 0i32;
    let mut i = open;
    while i < end {
        if let Some(n) = skip_trivia(s, i) {
            i = n;
            continue;
        }
        match b[i] {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return i;
                }
            }
            _ => {}
        }
        i += 1;
    }
    end
}

/// What to do with a rule after running the plugins.
enum Action {
    Keep,
    Replace {
        start: usize,
        end: usize,
        text: String,
    },
    Remove,
    Unwrap,
}

fn scan_block(
    s: &str,
    start: usize,
    end: usize,
    parent_atrule: Option<&str>,
    is_global: bool,
    edits: &mut Vec<(usize, usize, String)>,
) {
    let b = s.as_bytes();
    let mut i = start;
    while i < end {
        if let Some(n) = skip_trivia(s, i) {
            i = n;
            continue;
        }
        if b[i].is_ascii_whitespace() {
            i += 1;
            continue;
        }

        // Scan a statement until a top-level `{`, `;`, or `}`.
        let stmt_start = i;
        let mut j = i;
        let mut delim = b'}';
        while j < end {
            if let Some(n) = skip_trivia(s, j) {
                j = n;
                continue;
            }
            match b[j] {
                b'{' | b';' | b'}' => {
                    delim = b[j];
                    break;
                }
                _ => j += 1,
            }
        }

        match delim {
            b'{' => {
                let body_open = j;
                let body_close = find_matching_brace(s, body_open, end);
                let body_inner = (body_open + 1, body_close);
                let prelude = &s[stmt_start..body_open];

                if prelude.trim_start().starts_with('@') {
                    handle_at_rule(s, stmt_start, body_open, is_global, edits);
                    let name = at_rule_name(prelude);
                    scan_block(s, body_inner.0, body_inner.1, Some(&name), is_global, edits);
                } else {
                    let action = process_rule(s, stmt_start, body_open, parent_atrule, is_global);
                    match action {
                        Action::Remove => {
                            edits.push((stmt_start, body_close + 1, String::new()));
                        }
                        Action::Unwrap => {
                            let inner = s[body_inner.0..body_inner.1].to_string();
                            edits.push((stmt_start, body_close + 1, inner));
                        }
                        Action::Replace { start, end, text } => {
                            edits.push((start, end, text));
                            scan_block(s, body_inner.0, body_inner.1, None, is_global, edits);
                        }
                        Action::Keep => {
                            scan_block(s, body_inner.0, body_inner.1, None, is_global, edits);
                        }
                    }
                }
                i = body_close + 1;
            }
            b';' => i = j + 1,
            _ => i = end,
        }
    }
}

fn at_rule_name(prelude: &str) -> String {
    let p = prelude.trim_start();
    let p = p.strip_prefix('@').unwrap_or(p);
    p.chars()
        .take_while(|c| c.is_ascii_alphanumeric() || *c == '-')
        .collect()
}

/// `globalAttrPlugin`'s `@keyframes` param prefixing.
fn handle_at_rule(
    s: &str,
    stmt_start: usize,
    body_open: usize,
    is_global: bool,
    edits: &mut Vec<(usize, usize, String)>,
) {
    if !is_global {
        return;
    }
    let name = at_rule_name(&s[stmt_start..body_open]);
    if !name.ends_with("keyframes") {
        return;
    }
    // Params = text after the name, trimmed (its span within the prelude).
    let prelude = &s[stmt_start..body_open];
    let at_ident_end = stmt_start + prelude.find(&name).map(|p| p + name.len()).unwrap_or(0);
    let (p_start, p_end) = trimmed_span(s, at_ident_end, body_open);
    if p_start >= p_end {
        return;
    }
    let params = &s[p_start..p_end];
    if params.starts_with("-global-") {
        return;
    }
    edits.push((p_start, p_end, format!("-global-{params}")));
}

fn process_rule(
    s: &str,
    stmt_start: usize,
    body_open: usize,
    parent_atrule: Option<&str>,
    is_global: bool,
) -> Action {
    let (sel_start, sel_end) = trimmed_span(s, stmt_start, body_open);
    let original = &s[sel_start..sel_end];
    let mut current = original.to_string();

    // PLUGIN 1 — globalifyRulePlugin (always, but only for rules whose selector
    // contains `:global` not followed by `(`).
    if contains_global_np(original) {
        let selectors: Vec<&str> = split_top_commas(original)
            .into_iter()
            .map(str::trim)
            .filter(|sel| *sel != ":global")
            .collect();

        if selectors.is_empty() {
            if parent_atrule.is_some() && original == ":global" {
                return Action::Unwrap;
            }
            return Action::Remove;
        }

        current = selectors
            .iter()
            .map(|sel| plugin1_selector(sel))
            .collect::<Vec<_>>()
            .join(",");
    }

    // PLUGIN 2 — globalAttrPlugin (only with the `global` attribute, and not for
    // rules nested directly in a `@keyframes`).
    let in_keyframes = parent_atrule
        .map(|n| n.ends_with("keyframes"))
        .unwrap_or(false);
    if is_global && !in_keyframes {
        current = split_top_commas(&current)
            .into_iter()
            .map(|sel| globalify_selector(sel.trim()))
            .collect::<Vec<_>>()
            .join(",");
    }

    if current != original {
        Action::Replace {
            start: sel_start,
            end: sel_end,
            text: current,
        }
    } else {
        Action::Keep
    }
}

/// Per-selector transform of `globalifyRulePlugin` (selector already `!= :global`).
fn plugin1_selector(selector: &str) -> String {
    let parts = split_global_np(selector);
    if parts.len() <= 1 {
        return parts.into_iter().next().unwrap_or_default();
    }
    let mut v: Vec<String> = vec![parts[0].clone()];
    for r in &parts[1..] {
        v.push(globalify_selector(r));
    }
    v.iter()
        .map(|x| x.trim())
        .collect::<Vec<_>>()
        .join(" ")
        .trim()
        .to_string()
}

/// Whether `s` contains `:global` not immediately followed by `(`.
fn contains_global_np(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut from = 0;
    while let Some(pos) = s[from..].find(":global") {
        let abs = from + pos;
        let after = abs + ":global".len();
        if bytes.get(after) != Some(&b'(') {
            return true;
        }
        from = after;
    }
    false
}

/// Split `s` by `:global` (not followed by `(`), removing the delimiter — JS
/// `s.split(/:global(?!\()/)`.
fn split_global_np(s: &str) -> Vec<String> {
    let bytes = s.as_bytes();
    let mut res = Vec::new();
    let mut last = 0;
    let mut from = 0;
    while let Some(pos) = s[from..].find(":global") {
        let abs = from + pos;
        let after = abs + ":global".len();
        if bytes.get(after) != Some(&b'(') {
            res.push(s[last..abs].to_string());
            last = after;
            from = after;
        } else {
            from = after;
        }
    }
    res.push(s[last..].to_string());
    res
}

/// Split a selector list on top-level commas (respecting `()` / `[]`).
fn split_top_commas(s: &str) -> Vec<&str> {
    let bytes = s.as_bytes();
    let mut parts = Vec::new();
    let mut depth_p = 0i32;
    let mut depth_b = 0i32;
    let mut last = 0;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'(' => depth_p += 1,
            b')' => depth_p -= 1,
            b'[' => depth_b += 1,
            b']' => depth_b -= 1,
            b',' if depth_p <= 0 && depth_b <= 0 => {
                parts.push(&s[last..i]);
                last = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    parts.push(&s[last..]);
    parts
}

/// Port of `globalifySelector` (`src/modules/globalifySelector.ts`).
pub fn globalify_selector(selector: &str) -> String {
    let parts = split_combinators(selector.trim());
    let mut out: Vec<String> = Vec::new();
    let mut i = 0;
    while i < parts.len() {
        let part = &parts[i];
        if i % 2 != 0 || part.is_empty() || part.starts_with(":global") {
            out.push(part.clone());
            i += 1;
            continue;
        }
        if part.starts_with(":local(") {
            out.push(strip_local_paren(part));
            i += 1;
            continue;
        }
        if part.starts_with(":local") {
            let start_index = i + 2;
            let end_index = parts
                .iter()
                .enumerate()
                .skip(start_index + 1)
                .find(|(_, p)| p.starts_with(":global"))
                .map(|(idx, _)| idx)
                .unwrap_or(parts.len() - 1);
            for p in &parts[start_index..=end_index] {
                out.push(p.clone());
            }
            i = end_index + 1;
            continue;
        }
        out.push(format!(":global({part})"));
        i += 1;
    }
    out.join("")
}

/// JS `:local((.+?))` → `$1`.
fn strip_local_paren(part: &str) -> String {
    let re = Regex::new(r":local\((.+?)\)").unwrap();
    re.replace_all(part, "${1}").into_owned()
}

/// Split a selector by combinators (` >+~,`) keeping the separators, mirroring
/// the JS `selector.split(combinatorPattern)` (which captures the separator, so
/// the result alternates part / separator / part …).
fn split_combinators(selector: &str) -> Vec<String> {
    let chars: Vec<char> = selector.trim().chars().collect();
    let n = chars.len();
    let mut parts: Vec<String> = Vec::new();
    let mut last = 0;
    let mut depth_p = 0i32;
    let mut depth_b = 0i32;
    let mut i = 0;
    while i < n {
        match chars[i] {
            '(' => depth_p += 1,
            ')' => depth_p -= 1,
            '[' => depth_b += 1,
            ']' => depth_b -= 1,
            _ => {}
        }
        let is_comb = matches!(chars[i], ' ' | '>' | '+' | '~' | ',');
        let escaped = i > 0 && chars[i - 1] == '\\';
        if is_comb && depth_p <= 0 && depth_b <= 0 && !escaped {
            // Consume one combinator char + following whitespace.
            let match_start = i;
            let mut j = i + 1;
            while j < n && chars[j].is_whitespace() {
                j += 1;
            }
            // Negative lookahead `(?![^[]+\]|\d)`: don't split before a digit.
            if j < n && chars[j].is_ascii_digit() {
                i += 1;
                continue;
            }
            parts.push(chars[last..match_start].iter().collect());
            parts.push(chars[match_start..j].iter().collect());
            last = j;
            i = j;
            continue;
        }
        i += 1;
    }
    parts.push(chars[last..].iter().collect());
    parts
}

/// The trimmed sub-span of `s[start..end]` (skips leading / trailing whitespace).
fn trimmed_span(s: &str, start: usize, end: usize) -> (usize, usize) {
    let b = s.as_bytes();
    let mut a = start;
    let mut z = end;
    while a < z && b[a].is_ascii_whitespace() {
        a += 1;
    }
    while z > a && b[z - 1].is_ascii_whitespace() {
        z -= 1;
    }
    (a, z)
}
