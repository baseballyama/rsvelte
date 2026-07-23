//! `svelte/no-svelte-internal` — flag any import/export whose module source is
//! exactly `"svelte/internal"` or starts with `"svelte/internal/"`.
//! Port of the eslint-plugin-svelte rule.
//!
//! Upstream fires on `ImportDeclaration`, `ImportExpression` (dynamic
//! `import("…")`), `ExportNamedDeclaration` (with a source), and
//! `ExportAllDeclaration`. The deep-import path (`svelte/internal/client`, …) is
//! caught by the `startsWith("svelte/internal/")` check.
//!
//! Implementation: a plain `parse()` leaves the script program's arena empty, so
//! we cannot read the script AST. Instead we re-parse the source to get the
//! instance + module `Script` byte spans, slice each script BODY text, and scan
//! it with a quote/comment-aware byte walker — the same shape as
//! `no_not_function_handler::{skip_string, skip_ws_comments}`.
//!
//! For each whole-word `import` / `export` keyword at brace/paren depth 0 (not in
//! a string or comment) we scan forward to the next depth-0 `;` (or end of
//! script) and collect every string-literal CONTENT in that span. If any content
//! is `"svelte/internal"` or starts with `"svelte/internal/"` we report at the
//! keyword offset. This covers static imports, namespace imports, dynamic
//! `import("…")` (the keyword is followed by `(`), `export * from "…"`, and
//! `export { x } from "…"`. A bare `export const …` collects no matching string
//! and is ignored.

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-svelte-internal",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "svelte/internal will be removed in Svelte 6.",
    options_schema: None,
};

const MESSAGE: &str = "Using svelte/internal is prohibited. This will be removed in Svelte 6.";

/// Whether a module source string matches the prohibited `svelte/internal` path.
fn is_svelte_internal(value: &str) -> bool {
    value == "svelte/internal" || value.starts_with("svelte/internal/")
}

#[derive(Default)]
pub struct NoSvelteInternal;

impl NoSvelteInternal {
    /// Scan both the instance and module script bodies of `source`, reporting at
    /// every offending `import` / `export` keyword.
    fn scan_source(&self, ctx: &mut LintContext, source: &str) {
        let Ok(root) = rsvelte_core::parse(
            source,
            &rsvelte_core::Allocator::default(),
            rsvelte_core::ParseOptions::default(),
        ) else {
            return;
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
            let mut body = &source[lo..hi];
            if let Some(close) = body.rfind("</script") {
                body = &body[..close];
            }
            for offset in scan_script_body(body) {
                let abs = (lo + offset) as u32;
                ctx.report(abs, abs + 6, MESSAGE);
            }
        }
    }
}

impl Rule for NoSvelteInternal {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, _root: &Root) {
        let source = ctx.source();
        self.scan_source(ctx, source);
    }
}

/// Walk `s` (a script body) and return the LOCAL byte offsets of every `import` /
/// `export` keyword whose statement references a `svelte/internal[/…]` module.
fn scan_script_body(s: &str) -> Vec<usize> {
    let bytes = s.as_bytes();
    let n = bytes.len();
    let mut hits = Vec::new();
    let mut i = 0usize;
    let mut depth = 0i32;
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
            b'(' | b'[' | b'{' => {
                depth += 1;
                i += 1;
                continue;
            }
            b')' | b']' | b'}' => {
                depth -= 1;
                i += 1;
                continue;
            }
            _ => {}
        }
        if is_word_start(c) {
            let start = i;
            while i < n && is_word_char(bytes[i]) {
                i += 1;
            }
            let word = &s[start..i];
            if depth == 0
                && (word == "import" || word == "export")
                && statement_imports_svelte_internal(bytes, i)
            {
                hits.push(start);
            }
            continue;
        }
        i += 1;
    }
    hits
}

/// Starting just past an `import` / `export` keyword at `i`, scan forward to the
/// next depth-0 `;` (or EOF) and return whether any string-literal content within
/// that span matches `svelte/internal[/…]`. String/comment/bracket aware.
fn statement_imports_svelte_internal(bytes: &[u8], mut i: usize) -> bool {
    let n = bytes.len();
    let mut depth = 0i32;
    while i < n {
        let c = bytes[i];
        match c {
            b'"' | b'\'' | b'`' => {
                let (content, next) = string_content(bytes, i);
                if is_svelte_internal(&content) {
                    return true;
                }
                i = next;
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
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b';' if depth == 0 => return false,
            _ => {}
        }
        i += 1;
    }
    false
}

/// Return the literal CONTENT of the string/template beginning at the opening
/// quote `bytes[i]`, plus the index just past the closing quote. The content has
/// backslash escapes collapsed to their following character (sufficient for path
/// strings, which carry no escapes in practice).
fn string_content(bytes: &[u8], mut i: usize) -> (String, usize) {
    let n = bytes.len();
    let quote = bytes[i];
    i += 1;
    let mut out = String::new();
    while i < n {
        let c = bytes[i];
        if c == b'\\' && i + 1 < n {
            out.push(bytes[i + 1] as char);
            i += 2;
            continue;
        }
        if c == quote {
            i += 1;
            break;
        }
        out.push(c as char);
        i += 1;
    }
    (out, i)
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

fn is_word_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$'
}

fn is_word_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_svelte_internal_paths() {
        assert!(is_svelte_internal("svelte/internal"));
        assert!(is_svelte_internal("svelte/internal/client"));
        assert!(is_svelte_internal("svelte/internal/"));
        assert!(!is_svelte_internal("svelte"));
        assert!(!is_svelte_internal("svelte/internalx"));
        assert!(!is_svelte_internal("@svelte/internal"));
        assert!(!is_svelte_internal("svelte/store"));
    }

    #[test]
    fn string_content_strips_quotes() {
        let s = b"'svelte/internal' rest";
        let (content, next) = string_content(s, 0);
        assert_eq!(content, "svelte/internal");
        assert_eq!(&std::str::from_utf8(&s[next..]).unwrap(), &" rest");
    }

    #[test]
    fn flags_static_import() {
        let body = "\n\timport { get_current_component } from 'svelte/internal';\n";
        let hits = scan_script_body(body);
        assert_eq!(hits.len(), 1);
        // keyword starts after newline + tab.
        assert_eq!(&body[hits[0]..hits[0] + 6], "import");
        assert_eq!(hits[0], 2);
    }

    #[test]
    fn flags_namespace_import() {
        let body = "\n\timport * as svelteInternal from 'svelte/internal';\n";
        let hits = scan_script_body(body);
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0], 2);
    }

    #[test]
    fn flags_deep_import() {
        let body = "\n\timport { inspect } from 'svelte/internal/client';\n";
        assert_eq!(scan_script_body(body).len(), 1);
    }

    #[test]
    fn flags_export_all() {
        let body = "\n\texport * from 'svelte/internal';\n";
        let hits = scan_script_body(body);
        assert_eq!(hits.len(), 1);
        assert_eq!(&body[hits[0]..hits[0] + 6], "export");
    }

    #[test]
    fn flags_export_named() {
        let body = "\n\texport { inspect } from 'svelte/internal/client';\n";
        assert_eq!(scan_script_body(body).len(), 1);
    }

    #[test]
    fn flags_dynamic_import() {
        let body = "\n\timport('svelte/internal');\n";
        let hits = scan_script_body(body);
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0], 2);
    }

    #[test]
    fn ignores_plain_svelte_import() {
        let body = "\n\timport { mount } from 'svelte';\n";
        assert!(scan_script_body(body).is_empty());
    }

    #[test]
    fn ignores_export_without_string() {
        // A bare `export const …` (no module-source string literal) collects no
        // matching string and is ignored.
        let body = "\n\texport const x = 1;\n";
        assert!(scan_script_body(body).is_empty());
    }

    #[test]
    fn ignores_string_only_keyword() {
        // `import` appearing inside a string is not a keyword.
        let body = "\n\tconst s = 'import x from \"svelte/internal\"';\n";
        assert!(scan_script_body(body).is_empty());
    }
}
