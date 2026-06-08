//! `svelte/no-inspect` — warn against use of the `$inspect` rune.
//!
//! Upstream visits every `Identifier` node named `$inspect` and reports it. The
//! `$inspect` rune is intended for debugging only and should not ship in
//! production code.
//!
//! Port of the eslint-plugin-svelte rule. The Svelte-5 / runes version gate is
//! handled by the test oracle (`_requirements.json`); the rule itself always
//! fires when it sees `$inspect`.
//!
//! IMPLEMENTATION (script-text scan): a plain `rsvelte_core::parse()` leaves the
//! script program's arena empty, so `Script::content.as_json()` is unavailable.
//! Instead we re-parse to recover the instance + module `Script` bounds and scan
//! each script BODY text with a quote/comment-aware byte walker, mirroring
//! `no_not_function_handler::build_const_map`. Every whole-word `$inspect`
//! identifier outside a string/template literal or comment is reported at its
//! absolute start offset, spanning the 8 bytes of `"$inspect"`.
//!
//! Scope note: `$inspect` appearing in TEMPLATE position (e.g. inside a mustache
//! expression in markup) is out of scope for this port — script-only scanning is
//! sufficient for fixture parity. The upstream `$inspect` rune is only valid in
//! `<script>`.

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-inspect",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Warns against the use of `$inspect` directive",
    options_schema: None,
};

const MESSAGE: &str = "Do not use $inspect directive";

/// The identifier we flag, and its byte length (the reported span width).
const TOKEN: &str = "$inspect";

#[derive(Default)]
pub struct NoInspect;

impl Rule for NoInspect {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, _root: &rsvelte_core::ast::template::Root) {
        let source = ctx.source();
        for (start, end) in find_inspect_idents(source) {
            ctx.report(start, end, MESSAGE);
        }
    }
}

/// Locate every whole-word `$inspect` identifier in the file's `<script>` bodies.
/// Returns `(start, end)` byte-offset spans (absolute, into `source`).
fn find_inspect_idents(source: &str) -> Vec<(u32, u32)> {
    let mut out = Vec::new();
    let Ok(root) = rsvelte_core::parse(source, rsvelte_core::ParseOptions::default()) else {
        return out;
    };
    for script in [root.instance.as_ref(), root.module.as_ref()]
        .into_iter()
        .flatten()
    {
        let (lo, hi) = (script.content_offset as usize, script.end as usize);
        if lo > hi || hi > source.len() {
            continue;
        }
        // Slice the script body and stop before any closing `</script>` tag.
        let mut body_end = hi;
        if let Some(close) = source[lo..hi].rfind("</script") {
            body_end = lo + close;
        }
        let body = &source[lo..body_end];
        for local in scan_body(body) {
            let start = (lo + local) as u32;
            out.push((start, start + TOKEN.len() as u32));
        }
    }
    out
}

/// Scan a script body for whole-word `$inspect` tokens, returning their local
/// byte offsets. Strings, template literals and comments are skipped.
fn scan_body(s: &str) -> Vec<usize> {
    let bytes = s.as_bytes();
    let n = bytes.len();
    let token = TOKEN.as_bytes();
    let tlen = token.len();
    let mut out = Vec::new();
    let mut i = 0;
    while i < n {
        let c = bytes[i];
        match c {
            b'"' | b'\'' | b'`' => {
                i = skip_string(bytes, i);
                continue;
            }
            b'/' if i + 1 < n && bytes[i + 1] == b'/' => {
                while i < n && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if i + 1 < n && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < n && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(n);
                continue;
            }
            _ => {}
        }
        if is_word_start(c) {
            let start = i;
            while i < n && is_word_char(bytes[i]) {
                i += 1;
            }
            // Whole-word match: the run [start, i) must equal the token exactly.
            // (The byte before `start` is necessarily a non-word char because the
            // run started there; the byte after `i` is also non-word by the loop.)
            if i - start == tlen && &bytes[start..i] == token {
                out.push(start);
            }
            continue;
        }
        i += 1;
    }
    out
}

fn is_word_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$'
}

fn is_word_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Skip a string/template literal beginning at the opening quote `bytes[i]`,
/// returning the index just past the closing (unescaped) quote.
fn skip_string(bytes: &[u8], mut i: usize) -> usize {
    let n = bytes.len();
    let quote = bytes[i];
    i += 1;
    while i < n {
        let c = bytes[i];
        if c == b'\\' && i + 1 < n {
            i += 2;
            continue;
        }
        i += 1;
        if c == quote {
            break;
        }
    }
    i
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scans_top_level_and_nested_inspect() {
        let body = "\n  $inspect(1);\n  $state(0);\n\n  const a = $inspect(1);\n\n  const _ = () => {\n    $inspect(1);\n  }\n";
        let hits = scan_body(body);
        assert_eq!(hits.len(), 3);
        // Each hit must be exactly the token "$inspect".
        for h in &hits {
            assert_eq!(&body[*h..*h + TOKEN.len()], "$inspect");
        }
    }

    #[test]
    fn ignores_state_rune() {
        let body = "const _ = $state(1);";
        assert!(scan_body(body).is_empty());
    }

    #[test]
    fn skips_strings_and_comments() {
        let body = "const s = '$inspect'; // $inspect\n/* $inspect */ const t = `$inspect`;";
        assert!(scan_body(body).is_empty());
    }

    #[test]
    fn requires_whole_word() {
        // A longer identifier containing the token is not a match.
        let body = "$inspectFoo(); foo$inspect();";
        assert!(scan_body(body).is_empty());
    }

    #[test]
    fn reports_at_token_start() {
        let body = "  $inspect(1);";
        let hits = scan_body(body);
        assert_eq!(hits, vec![2]);
    }

    #[test]
    fn full_file_absolute_offsets() {
        let src = "<script>\n  $inspect(1);\n</script>";
        let hits = find_inspect_idents(src);
        assert_eq!(hits.len(), 1);
        let (start, end) = hits[0];
        assert_eq!(&src[start as usize..end as usize], "$inspect");
    }
}
