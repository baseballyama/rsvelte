//! Inline configuration comments (`/* eslint <rule>: <value> */`).
//!
//! ESLint lets a source file override rule severity/options for *that file only*
//! via a block comment whose first token is exactly `eslint`:
//!
//! ```text
//! /* eslint svelte/sort-attributes: ["error", { "order": [...] }] */
//! /* eslint svelte/block-lang: ["error", { "script": "ts" }] */
//! /* eslint rule-a: 2, rule-b: "off" */
//! ```
//!
//! eslint-plugin-svelte's own docs fixtures rely on these to demonstrate rules
//! under non-default options, so honoring them is required for output parity
//! with the real plugin (and is genuinely correct user-facing behavior).
//!
//! This is intentionally **fail-safe**: any comment whose body we cannot parse
//! is ignored (leaving the base config untouched), so a parse gap can never turn
//! into a wrong finding — at worst it reproduces the pre-feature behavior.
//!
//! Disable directives (`eslint-disable*`, `eslint-enable`) are handled
//! separately in [`crate::suppression`]; this module only handles the
//! *configure* form and explicitly skips the `eslint-…` hyphenated keywords.

use serde_json::Value;

use crate::config::{LintConfig, options_from_value, severity_from_value};

/// Layer every inline `/* eslint … */` rule entry found in `source` on top of
/// `base`, returning the per-file effective config. When `source` carries no
/// inline config the original `base` is returned (cloned) unchanged.
pub fn apply(source: &str, base: &LintConfig) -> LintConfig {
    let entries = parse(source);
    if entries.is_empty() {
        return base.clone();
    }
    let mut cfg = base.clone();
    for (rule, severity, options) in entries {
        cfg = cfg.with_inline_rule(&rule, severity, options);
    }
    cfg
}

/// A parsed inline rule entry: `(rule_id, severity, options)`.
type InlineEntry = (String, Option<crate::rule::Severity>, Option<Value>);

/// Scan `source` for `/* eslint … */` configure comments and parse each into
/// zero or more rule entries.
fn parse(source: &str) -> Vec<InlineEntry> {
    let bytes = source.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i + 1 < bytes.len() {
        if bytes[i] == b'/' && bytes[i + 1] == b'*' {
            // Find the closing `*/`.
            if let Some(end) = source[i + 2..].find("*/") {
                let inner = &source[i + 2..i + 2 + end];
                if let Some(body) = configure_body(inner) {
                    out.extend(parse_body(body));
                }
                i = i + 2 + end + 2;
                continue;
            } else {
                break; // unterminated block comment
            }
        }
        i += 1;
    }
    out
}

/// If `inner` (the text between `/*` and `*/`) is an ESLint *configure* comment
/// — its first token is exactly `eslint` (not `eslint-disable`, `eslint-env`,
/// …) — return the body after that token; otherwise `None`.
fn configure_body(inner: &str) -> Option<&str> {
    let trimmed = inner.trim_start();
    let rest = trimmed.strip_prefix("eslint")?;
    // The char immediately after `eslint` must be whitespace, so `eslint-disable`
    // / `eslint-env` / `eslintrc` etc. are not treated as configure comments.
    let first = rest.chars().next()?;
    if !first.is_whitespace() {
        return None;
    }
    Some(rest.trim())
}

/// Parse a configure body (`rule-a: val, rule-b: val`) into rule entries.
/// Splits on top-level (bracket/brace-depth-0, non-string) commas, then each
/// segment on its first top-level colon.
fn parse_body(body: &str) -> Vec<InlineEntry> {
    let mut out = Vec::new();
    for segment in split_top_level(body, b',') {
        let segment = segment.trim();
        if segment.is_empty() {
            continue;
        }
        // Key : value — split on the first top-level colon. (Regex options like
        // "/^class:/u" carry colons but live inside the value at depth ≥ 1.)
        let parts = split_top_level_once(segment, b':');
        let Some((key, value)) = parts else { continue };
        let rule = unquote(key.trim());
        if rule.is_empty() {
            continue;
        }
        match parse_value(value.trim()) {
            Some((sev, opts)) => out.push((rule, sev, opts)),
            // Fail-safe: an unparseable value yields no entry, so the base config
            // for this rule is left untouched.
            None => continue,
        }
    }
    out
}

/// Parse a rule value (`2` / `"error"` / `["error", {…}]`) into severity +
/// options, tolerating trailing commas (which ESLint's lenient parser accepts
/// but `serde_json` does not).
fn parse_value(value: &str) -> Option<(Option<crate::rule::Severity>, Option<Value>)> {
    let normalized = strip_trailing_commas(value);
    let parsed: Value = serde_json::from_str(&normalized).ok()?;
    let sev = severity_from_value(&parsed);
    let opts = options_from_value(&parsed);
    // A value that yields neither a severity nor options is not a usable entry.
    if sev.is_none() && opts.is_none() {
        return None;
    }
    Some((sev, opts))
}

/// Split `s` on top-level occurrences of `delim` (depth-0, outside string
/// literals). Bracket depth counts `[](){}`.
fn split_top_level(s: &str, delim: u8) -> Vec<&str> {
    let bytes = s.as_bytes();
    let mut out = Vec::new();
    let mut start = 0;
    let mut depth: i32 = 0;
    let mut string: Option<u8> = None;
    let mut escaped = false;
    for (i, &b) in bytes.iter().enumerate() {
        if let Some(q) = string {
            if escaped {
                escaped = false;
            } else if b == b'\\' {
                escaped = true;
            } else if b == q {
                string = None;
            }
            continue;
        }
        match b {
            b'"' | b'\'' => string = Some(b),
            b'[' | b'{' | b'(' => depth += 1,
            b']' | b'}' | b')' => depth -= 1,
            _ if b == delim && depth == 0 => {
                out.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    out.push(&s[start..]);
    out
}

/// Split `s` once on the first top-level `delim`, returning `(before, after)`.
fn split_top_level_once(s: &str, delim: u8) -> Option<(&str, &str)> {
    let bytes = s.as_bytes();
    let mut depth: i32 = 0;
    let mut string: Option<u8> = None;
    let mut escaped = false;
    for (i, &b) in bytes.iter().enumerate() {
        if let Some(q) = string {
            if escaped {
                escaped = false;
            } else if b == b'\\' {
                escaped = true;
            } else if b == q {
                string = None;
            }
            continue;
        }
        match b {
            b'"' | b'\'' => string = Some(b),
            b'[' | b'{' | b'(' => depth += 1,
            b']' | b'}' | b')' => depth -= 1,
            _ if b == delim && depth == 0 => return Some((&s[..i], &s[i + 1..])),
            _ => {}
        }
    }
    None
}

/// Remove commas that immediately precede a `]` or `}` (ignoring intervening
/// whitespace), outside string literals — JSON5 trailing commas that
/// `serde_json` rejects.
fn strip_trailing_commas(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = String::with_capacity(s.len());
    let mut string: Option<u8> = None;
    let mut escaped = false;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];
        if let Some(q) = string {
            out.push(b as char);
            if escaped {
                escaped = false;
            } else if b == b'\\' {
                escaped = true;
            } else if b == q {
                string = None;
            }
            i += 1;
            continue;
        }
        if b == b'"' || b == b'\'' {
            string = Some(b);
            out.push(b as char);
            i += 1;
            continue;
        }
        if b == b',' {
            // Look ahead past whitespace for a closing bracket.
            let mut j = i + 1;
            while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                j += 1;
            }
            if j < bytes.len() && (bytes[j] == b']' || bytes[j] == b'}') {
                // Drop the comma; keep the intervening whitespace.
                i += 1;
                continue;
            }
        }
        // ASCII fast path; multi-byte UTF-8 bytes are copied verbatim too.
        out.push(b as char);
        i += 1;
    }
    out
}

/// Strip a single pair of surrounding `"`/`'` quotes from a key, if present.
fn unquote(s: &str) -> String {
    let bytes = s.as_bytes();
    if bytes.len() >= 2
        && (bytes[0] == b'"' || bytes[0] == b'\'')
        && bytes[bytes.len() - 1] == bytes[0]
    {
        s[1..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rule::Severity;

    fn entries(src: &str) -> Vec<InlineEntry> {
        parse(src)
    }

    #[test]
    fn skips_disable_and_env_comments() {
        assert!(entries("/* eslint-disable svelte/x */").is_empty());
        assert!(entries("/* eslint-enable */").is_empty());
        assert!(entries("/* eslint-env browser */").is_empty());
        assert!(entries("/* eslintrc */").is_empty());
        assert!(entries("/* not eslint at all */").is_empty());
    }

    #[test]
    fn parses_scalar_severity() {
        let e = entries("/* eslint svelte/no-foo: 2 */");
        assert_eq!(e.len(), 1);
        assert_eq!(e[0].0, "svelte/no-foo");
        assert_eq!(e[0].1, Some(Severity::Error));
        assert!(e[0].2.is_none());
    }

    #[test]
    fn parses_string_severity_off() {
        let e = entries(r#"/* eslint svelte/no-foo: "off" */"#);
        assert_eq!(e[0].1, Some(Severity::Off));
    }

    #[test]
    fn parses_array_with_options() {
        let e = entries(r#"/* eslint svelte/block-lang: ["error", { "script": "ts" }] */"#);
        assert_eq!(e.len(), 1);
        assert_eq!(e[0].0, "svelte/block-lang");
        assert_eq!(e[0].1, Some(Severity::Error));
        let opts = e[0].2.as_ref().unwrap();
        assert_eq!(opts[0].get("script").and_then(|v| v.as_str()), Some("ts"));
    }

    #[test]
    fn parses_multiple_rules_in_one_comment() {
        let e = entries(r#"/* eslint a/x: 2, b/y: "off" */"#);
        assert_eq!(e.len(), 2);
        assert_eq!(e[0].0, "a/x");
        assert_eq!(e[1].0, "b/y");
        assert_eq!(e[1].1, Some(Severity::Off));
    }

    #[test]
    fn tolerates_trailing_commas_and_newlines() {
        let src = "/* eslint svelte/sort-attributes: [\"error\", {\n  \"order\": [\n    \"id\",\n    \"/^class:/u\",\n  ],\n}] */";
        let e = entries(src);
        assert_eq!(e.len(), 1);
        assert_eq!(e[0].0, "svelte/sort-attributes");
        let opts = e[0].2.as_ref().unwrap();
        let order = opts[0].get("order").and_then(|v| v.as_array()).unwrap();
        assert_eq!(order.len(), 2);
        assert_eq!(order[1].as_str(), Some("/^class:/u"));
    }

    #[test]
    fn colon_inside_regex_string_does_not_break_key_split() {
        let e = entries(r#"/* eslint svelte/sort-attributes: ["error", ["/^bind:/u"]] */"#);
        assert_eq!(e[0].0, "svelte/sort-attributes");
    }

    #[test]
    fn unparseable_value_is_failsafe_ignored() {
        // A value that is not valid JSON (even after trailing-comma stripping)
        // yields no entry rather than a wrong one.
        assert!(entries("/* eslint svelte/x: <garbage> */").is_empty());
    }

    #[test]
    fn apply_overlays_inline_options() {
        let base = LintConfig::recommended();
        let cfg = apply(
            r#"<script>/* eslint svelte/block-lang: ["error", { "script": "ts" }] */</script>"#,
            &base,
        );
        let opts = cfg.options_for("svelte/block-lang").unwrap();
        assert_eq!(opts[0].get("script").and_then(|v| v.as_str()), Some("ts"));
    }
}
