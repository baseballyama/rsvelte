//! `svelte/valid-style-parse` — report `<style>` blocks whose `lang` is an
//! unsupported style language. Partial port of the eslint-plugin-svelte rule.
//!
//! ## Scope
//!
//! Upstream reports two things: an `unknown-lang` status (unsupported `lang`)
//! and a `parse-error` status (the style preprocessor — PostCSS et al. — failed
//! to parse the CSS). rsvelte ports the **unknown-lang** half faithfully.
//!
//! The CSS parse-error half is intentionally not surfaced here because:
//! - the upstream message embeds PostCSS's own error text and position
//!   (e.g. `…:4:11: Unknown word .div-class/35`), which rsvelte's hand-written
//!   CSS parser cannot reproduce byte-for-byte, and
//! - rsvelte already surfaces an invalid `<style>` as a hard compile error
//!   (`parse-error` code) through the validator wrap / `valid-compile`, so the
//!   feedback isn't lost.
//!
//! It runs as a meta-path in [`crate::runner::lint_source`] (its own `<style>`
//! source scan) rather than a `check_root` rule, because a `<style>` with an
//! unsupported `lang` usually also contains non-CSS the main parser rejects —
//! which would otherwise leave no AST for a rule to inspect.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::{Diagnostic, Position, Range};

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::validator::to_dsev;

pub static META: RuleMeta = RuleMeta {
    name: "svelte/valid-style-parse",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require CSS in `<style>` to be parseable",
    options_schema: None,
};

/// Style languages rsvelte treats as supported (no `unknown-lang` report). An
/// empty `lang` (plain `<style>`) is CSS. Approximates the set
/// svelte-eslint-parser's style context can preprocess.
const KNOWN_LANGS: &[&str] = &[
    "css", "scss", "sass", "less", "stylus", "styl", "postcss", "pcss", "sss",
];

/// Scan `source` for `<style>` elements with an unsupported `lang` and report
/// each at its opening tag. Returns empty when the rule is `Off`.
pub fn valid_style_parse_diagnostics(
    source: &str,
    file: &Path,
    config: &LintConfig,
) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }

    let li = LineIndex::new(source);
    let mut out = Vec::new();
    for (tag_start, lang) in style_tags(source) {
        // An absent/empty `lang` is plain CSS — always supported.
        let lang_lc = lang.to_ascii_lowercase();
        if lang_lc.is_empty() || KNOWN_LANGS.contains(&lang_lc.as_str()) {
            continue;
        }
        let (line, column) = li.position(tag_start);
        out.push(Diagnostic {
            file: file.to_path_buf(),
            severity: to_dsev(severity),
            range: Some(Range {
                start: Position { line, column },
                end: Position { line, column },
            }),
            message: format!("Found unsupported style element language \"{lang}\""),
            code: Some(META.name.to_string()),
            source: "svelte",
        });
    }
    out
}

/// Yield `(tag_start_byte, lang)` for every `<style …>` element. `lang` is the
/// value of a `lang` attribute, or `""` (plain CSS) when absent.
fn style_tags(source: &str) -> Vec<(u32, String)> {
    let bytes = source.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i + 6 <= bytes.len() {
        if &bytes[i..i + 6] != b"<style" {
            i += 1;
            continue;
        }
        let after = bytes.get(i + 6).copied();
        if !matches!(after, Some(c) if c == b' ' || c == b'\t' || c == b'\n' || c == b'\r' || c == b'>' || c == b'/')
        {
            i += 6;
            continue;
        }
        // Read the start tag up to `>`, tracking quotes.
        let mut j = i + 6;
        let mut quote: Option<u8> = None;
        let mut tag_end = None;
        while j < bytes.len() {
            let c = bytes[j];
            match quote {
                Some(q) => {
                    if c == q {
                        quote = None;
                    }
                }
                None => {
                    if c == b'"' || c == b'\'' {
                        quote = Some(c);
                    } else if c == b'>' {
                        tag_end = Some(j);
                        break;
                    }
                }
            }
            j += 1;
        }
        let Some(tag_end) = tag_end else { break };
        let lang = lang_attr(&source[i + 6..tag_end]).unwrap_or_default();
        out.push((i as u32, lang));
        i = tag_end + 1;
    }
    out
}

/// Extract the `lang` attribute value from a start-tag attribute string.
fn lang_attr(attrs: &str) -> Option<String> {
    let bytes = attrs.as_bytes();
    let mut i = 0;
    while i + 4 <= bytes.len() {
        // Find a `lang` token at an attribute-name boundary.
        if &bytes[i..i + 4] == b"lang" {
            let before_ok = i == 0 || bytes[i - 1].is_ascii_whitespace();
            let mut k = i + 4;
            while k < bytes.len() && bytes[k].is_ascii_whitespace() {
                k += 1;
            }
            if before_ok && k < bytes.len() && bytes[k] == b'=' {
                k += 1;
                while k < bytes.len() && bytes[k].is_ascii_whitespace() {
                    k += 1;
                }
                if k >= bytes.len() {
                    return Some(String::new());
                }
                let q = bytes[k];
                if q == b'"' || q == b'\'' {
                    let start = k + 1;
                    let mut e = start;
                    while e < bytes.len() && bytes[e] != q {
                        e += 1;
                    }
                    return Some(attrs[start..e].to_string());
                }
                // Unquoted value: run of non-whitespace.
                let start = k;
                let mut e = start;
                while e < bytes.len() && !bytes[e].is_ascii_whitespace() {
                    e += 1;
                }
                return Some(attrs[start..e].to_string());
            }
        }
        i += 1;
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_lang() {
        assert_eq!(lang_attr(r#" lang="scss""#).as_deref(), Some("scss"));
        assert_eq!(lang_attr(r#" lang='less' x"#).as_deref(), Some("less"));
        assert_eq!(lang_attr(" lang=postcss ").as_deref(), Some("postcss"));
        assert_eq!(lang_attr(" type=\"text/css\"").as_deref(), None);
        // `lang` substring of another attr must not match.
        assert_eq!(lang_attr(" data-lang=\"x\"").as_deref(), None);
    }

    #[test]
    fn finds_style_tags_and_langs() {
        let src = "<div></div>\n<style lang=\"invalid-lang\">\n.a{}\n</style>";
        let tags = style_tags(src);
        assert_eq!(tags.len(), 1);
        assert_eq!(tags[0].1, "invalid-lang");
    }
}
