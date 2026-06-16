//! `svelte/no-dupe-on-directives` — disallow duplicate `on:` directives on the
//! same start tag. Two `on:event` directives are duplicates when they share the
//! same event type AND a token-equal handler expression (modifiers are
//! irrelevant; a bare `on:event` with no expression only matches another bare
//! `on:event`). Port of the eslint-plugin-svelte rule.
//!
//! Detection is per start-tag, so the same helper runs for both elements
//! (`check_element`) and components (`check_component`).

use rsvelte_core::ast::template::{Attribute, Component, OnDirective, RegularElement};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dupe-on-directives",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow duplicate `on:` directives",
    options_schema: None,
};

/// Normalize an expression's source for token-equality comparison: strip JS
/// line/block comments and all whitespace, while leaving the contents of
/// string / template / char literals untouched.
///
/// This is a deliberately small approximation of token comparison — it does not
/// tokenize, but stripping comments + whitespace outside of literals is enough
/// to match upstream's `equalTokens` for the handler-expression shapes the rule
/// cares about.
fn normalize(src: &str) -> String {
    let bytes = src.as_bytes();
    let mut out = String::with_capacity(src.len());
    let mut i = 0;
    let n = bytes.len();
    while i < n {
        let c = bytes[i];
        match c {
            // String / char / template literal: copy verbatim until the
            // matching (unescaped) closing delimiter.
            b'"' | b'\'' | b'`' => {
                let quote = c;
                out.push(c as char);
                i += 1;
                while i < n {
                    let d = bytes[i];
                    if d == b'\\' && i + 1 < n {
                        // Copy the escape and its escaped char verbatim.
                        out.push(d as char);
                        out.push(bytes[i + 1] as char);
                        i += 2;
                        continue;
                    }
                    out.push(d as char);
                    i += 1;
                    if d == quote {
                        break;
                    }
                }
            }
            // Line comment: skip to end of line.
            b'/' if i + 1 < n && bytes[i + 1] == b'/' => {
                i += 2;
                while i < n && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            // Block comment: skip to closing `*/`.
            b'/' if i + 1 < n && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < n && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                // Skip the closing `*/` (or run to EOF if unterminated).
                i = (i + 2).min(n);
            }
            // Drop all whitespace outside literals.
            b' ' | b'\t' | b'\r' | b'\n' => {
                i += 1;
            }
            _ => {
                out.push(c as char);
                i += 1;
            }
        }
    }
    out
}

/// The 1-based source line of `offset` (count newlines before it, + 1).
fn line_of(source: &str, offset: u32) -> usize {
    let end = (offset as usize).min(source.len());
    source[..end].bytes().filter(|&b| b == b'\n').count() + 1
}

#[derive(Default)]
pub struct NoDupeOnDirectives;

impl NoDupeOnDirectives {
    fn check_attributes(&self, ctx: &mut LintContext, attributes: &[Attribute]) {
        // Group on:directives by event type (in source order), then sub-group
        // by token-equal handler expression. Each sub-group keeps the indices
        // of its directives (into a flat list of OnDirective refs).
        let directives: Vec<&OnDirective> = attributes
            .iter()
            .filter_map(|a| match a {
                Attribute::OnDirective(on) => Some(on),
                _ => None,
            })
            .collect();

        // (event type, normalized-expr or None) -> list of directive indices.
        // We preserve source order by iterating `directives` in order and
        // pushing into the matching sub-group, mirroring upstream's Map.
        let mut groups: Vec<(&str, Option<String>, Vec<usize>)> = Vec::new();

        for (idx, on) in directives.iter().enumerate() {
            let ty = on.name.as_str();
            let norm: Option<String> = match &on.expression {
                None => None,
                Some(expr) => match (expr.start(), expr.end()) {
                    (Some(s), Some(e)) => Some(normalize(ctx.slice(s, e))),
                    // No usable span: treat as its own un-matchable bucket by
                    // using the raw (unique) index marker. Fall back to None is
                    // wrong (would match bare); use a sentinel that never
                    // equals another. Encode the index into the string.
                    _ => Some(format!("\0__nospan_{idx}")),
                },
            };

            if let Some(group) = groups
                .iter_mut()
                .find(|(g_ty, g_norm, _)| *g_ty == ty && *g_norm == norm)
            {
                group.2.push(idx);
            } else {
                groups.push((ty, norm, vec![idx]));
            }
        }

        for (_ty, _norm, members) in &groups {
            if members.len() < 2 {
                continue;
            }
            for &m in members {
                let on = directives[m];
                // lineNo: the line of the FIRST member if this is not the
                // first member, otherwise the line of the SECOND member.
                let other_idx = if members[0] != m {
                    members[0]
                } else {
                    members[1]
                };
                let line_no = line_of(ctx.source(), directives[other_idx].start);
                let ty = on.name.as_str();
                let start = on.start;
                let end = on.start + 3 + ty.len() as u32; // covers `on:name`
                ctx.report(
                    start,
                    end,
                    format!(
                        "This `on:{ty}` directive is the same and duplicate directives in L{line_no}."
                    ),
                );
            }
        }
    }
}

impl Rule for NoDupeOnDirectives {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_attributes(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_attributes(ctx, &c.attributes);
    }
}

#[cfg(test)]
mod tests {
    use super::{line_of, normalize};

    #[test]
    fn normalize_strips_whitespace_and_comments() {
        // Both forms from the inline-expression fixture normalize equal.
        let a = "() => console.log('foo')";
        let b = "() =>\n\t// foo\n\tconsole.log('foo')";
        let c = "() =>\n\tconsole\n\t\t// bar\n\t\t.log('foo')";
        assert_eq!(normalize(a), normalize(b));
        assert_eq!(normalize(a), normalize(c));
        assert_eq!(normalize(a), "()=>console.log('foo')");
    }

    #[test]
    fn normalize_preserves_literal_whitespace() {
        assert_eq!(normalize("'a b'"), "'a b'");
        // Template literals (including their `${…}` interpolations) are copied
        // verbatim — interpolation whitespace is treated as significant. This is
        // a deliberate approximation of upstream `equalTokens` (which would tokenise
        // the interpolation); no fixture exercises the difference.
        assert_eq!(normalize("`a ${ x }`"), "`a ${ x }`");
        // A `//` inside a string is not a comment.
        assert_eq!(normalize("'http://x'"), "'http://x'");
    }

    #[test]
    fn line_of_counts_newlines() {
        let src = "a\nb\nc";
        assert_eq!(line_of(src, 0), 1);
        assert_eq!(line_of(src, 2), 2);
        assert_eq!(line_of(src, 4), 3);
    }
}
