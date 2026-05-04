//! Measure fast path coverage - what % of template expressions skip OXC?
//! Extracts expressions from template context only (skips `<script>` blocks).
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

fn main() {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let dirs = [
        "submodules/svelte/packages/svelte/tests/runtime-runes/samples",
        "submodules/svelte/packages/svelte/tests/runtime-legacy/samples",
    ];
    let mut files = Vec::new();
    for dir in &dirs {
        let path = base.join(dir);
        if !path.exists() {
            continue;
        }
        for entry in fs::read_dir(&path).unwrap().flatten() {
            let input = entry.path().join("input.svelte");
            if let Ok(content) = fs::read_to_string(&input) {
                files.push(content);
            }
        }
    }

    let mut total = 0u64;
    let mut fast = 0u64;
    let mut oxc = 0u64;
    let mut categories: HashMap<&str, u64> = HashMap::new();

    for content in &files {
        // Strip <script>...</script> blocks to only count template expressions
        let template = strip_script_blocks(content);
        let bytes = template.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i] == b'{' && i + 1 < bytes.len() {
                let next = bytes[i + 1];
                // Skip block tags {#if}, {/if}, {:else}, {@const}
                if next == b'#' || next == b'/' || next == b':' || next == b'@' {
                    i += 1;
                    continue;
                }
                // Find matching }
                let start = i + 1;
                let mut depth = 1u32;
                let mut j = start;
                let mut in_string = 0u8;
                while j < bytes.len() && depth > 0 {
                    let b = bytes[j];
                    if in_string != 0 {
                        if b == in_string && (j == 0 || bytes[j - 1] != b'\\') {
                            in_string = 0;
                        }
                    } else {
                        match b {
                            b'\'' | b'"' | b'`' => in_string = b,
                            b'{' => depth += 1,
                            b'}' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        j += 1;
                    }
                }
                if depth == 0 && j > start {
                    let expr = template[start..j].trim();
                    if !expr.is_empty() {
                        total += 1;
                        let cat = classify_expr(expr);
                        *categories.entry(cat).or_default() += 1;
                        if is_current_fast_path(expr) {
                            fast += 1;
                        } else {
                            oxc += 1;
                        }
                    }
                }
                i = j + 1;
                continue;
            }
            i += 1;
        }
    }

    println!(
        "=== Template Expression Analysis ({} files) ===",
        files.len()
    );
    println!("Total template expressions: {}", total);
    println!("Current fast path:  {} ({:.1}%)", fast, pct(fast, total));
    println!("Needs OXC:          {} ({:.1}%)", oxc, pct(oxc, total));
    println!();

    // Sort categories by count descending
    let mut cats: Vec<_> = categories.into_iter().collect();
    cats.sort_by_key(|c| std::cmp::Reverse(c.1));
    println!("Expression categories:");
    for (cat, count) in &cats {
        let fp = if is_category_fast_path(cat) {
            " [FAST]"
        } else {
            " [OXC]"
        };
        println!(
            "  {:30} {:5} ({:5.1}%){}",
            cat,
            count,
            pct(*count, total),
            fp
        );
    }
}

fn pct(n: u64, total: u64) -> f64 {
    if total == 0 {
        0.0
    } else {
        n as f64 / total as f64 * 100.0
    }
}

fn strip_script_blocks(source: &str) -> String {
    let mut result = String::with_capacity(source.len());
    let bytes = source.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if i + 7 < bytes.len() && &bytes[i..i + 7] == b"<script" {
            // Find </script>
            if let Some(end) = source[i..].find("</script>") {
                i += end + 9;
                continue;
            }
        }
        result.push(source[i..].chars().next().unwrap());
        i += source[i..].chars().next().unwrap().len_utf8();
    }
    result
}

fn classify_expr(expr: &str) -> &'static str {
    let bytes = expr.as_bytes();
    if bytes.is_empty() {
        return "empty";
    }
    let first = bytes[0];

    // Check patterns from most specific to least
    if expr.contains("=>") {
        return "arrow-function";
    }
    if expr.contains("? ")
        || expr.contains("?\n")
        || (expr.contains('?') && expr.contains(':') && !expr.contains("?."))
    {
        return "ternary";
    }
    if first == b'`' || expr.contains('`') {
        return "template-literal";
    }
    if expr.contains("(") && !expr.starts_with('(') {
        return "call-expression";
    }
    if first == b'(' {
        return "parenthesized/iife";
    }
    if expr.contains("[") && !expr.starts_with('[') {
        return "member-computed";
    }
    if first == b'[' {
        return "array-literal";
    }
    if first == b'{' {
        return "object-literal";
    }
    if expr.contains("?.") {
        return "optional-chain";
    }
    if expr.ends_with("++") || expr.ends_with("--") {
        return "update-postfix";
    }
    if expr.starts_with("++") || expr.starts_with("--") {
        return "update-prefix";
    }
    if first == b'!' {
        return "unary-not";
    }
    if first == b'-' && bytes.len() >= 2 && bytes[1].is_ascii_digit() {
        return "negative-number";
    }
    if expr.starts_with("typeof ") || expr.starts_with("void ") {
        return "unary-keyword";
    }
    if expr.contains(" = ") || expr.contains(" += ") || expr.contains(" -= ") {
        return "assignment";
    }

    // Binary/logical operators
    for op in &[
        "===", "!==", "==", "!=", "<=", ">=", "&&", "||", "??", "**", "<<", ">>", " + ", " - ",
        " * ", " / ", " % ", " < ", " > ", " & ", " | ", " ^ ",
    ] {
        if expr.contains(op) {
            return "binary/logical";
        }
    }

    // Simple patterns
    if is_ident_or_member(bytes) {
        return "ident/member";
    }
    if first == b'\'' || first == b'"' {
        return "string-literal";
    }
    if first.is_ascii_digit() {
        return "number-literal";
    }
    if expr == "true" || expr == "false" {
        return "boolean-literal";
    }
    if expr == "null" || expr == "undefined" {
        return "null/undefined";
    }

    "other"
}

fn is_category_fast_path(cat: &str) -> bool {
    matches!(
        cat,
        "ident/member"
            | "string-literal"
            | "number-literal"
            | "boolean-literal"
            | "null/undefined"
            | "negative-number"
            | "binary/logical"
            | "unary-not"
    )
}

fn is_current_fast_path(expr: &str) -> bool {
    let bytes = expr.as_bytes();
    if bytes.is_empty() {
        return false;
    }
    let first = bytes[0];

    if is_ident_start(first) {
        if is_ident_or_member(bytes) {
            return true;
        }
        // Binary/logical compound check
        if bytes.iter().all(|&b| {
            b.is_ascii_alphanumeric()
                || b == b'_'
                || b == b'$'
                || b == b'.'
                || b == b' '
                || b == b'\t'
                || b == b'+'
                || b == b'-'
                || b == b'*'
                || b == b'/'
                || b == b'%'
                || b == b'='
                || b == b'!'
                || b == b'<'
                || b == b'>'
                || b == b'&'
                || b == b'|'
                || b == b'^'
        }) {
            return true;
        }
    }
    if first.is_ascii_digit() {
        return true;
    }
    if first == b'\'' || first == b'"' {
        return true;
    }
    if first == b'-' && bytes.len() >= 2 && bytes[1].is_ascii_digit() {
        return true;
    }
    if first == b'!' {
        return true;
    }
    false
}

fn is_ident_or_member(bytes: &[u8]) -> bool {
    if bytes.is_empty() || !is_ident_start(bytes[0]) {
        return false;
    }
    bytes
        .iter()
        .all(|&b| b.is_ascii_alphanumeric() || b == b'_' || b == b'$' || b == b'.')
}

fn is_ident_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$'
}
