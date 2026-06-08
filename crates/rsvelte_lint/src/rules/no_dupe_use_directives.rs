//! `svelte/no-dupe-use-directives` — flag duplicate `use:` (action) directives
//! on the same start tag. Two `use:` directives are duplicates when they share
//! the same key (`use:` + name) AND their expressions are token-equal (same
//! tokens ignoring comments and whitespace); a directive with no expression
//! only duplicates another with no expression. Port of the eslint-plugin-svelte
//! rule.
//!
//! Mirrors `no-dupe-on-directives` but for `UseDirective` (which, unlike event
//! handlers, has no modifiers — the key is purely `use:<name>`).

use rsvelte_core::ast::template::{Attribute, Component, RegularElement, UseDirective};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dupe-use-directives",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow duplicate `use:` directives",
    options_schema: None,
};

#[derive(Default)]
pub struct NoDupeUseDirectives;

impl NoDupeUseDirectives {
    fn check_start_tag(&self, ctx: &mut LintContext, attributes: &[Attribute]) {
        // `use:` directives in source order.
        let directives: Vec<&UseDirective> = attributes
            .iter()
            .filter_map(|a| match a {
                Attribute::UseDirective(d) => Some(d),
                _ => None,
            })
            .collect();

        if directives.len() < 2 {
            return;
        }

        // Group by (key text, token-equal handler expression). `None` (a bare
        // `use:foo`) only matches another bare directive; a directive without a
        // usable span gets a unique sentinel so it never falsely matches.
        let mut groups: Vec<(String, Option<String>, Vec<usize>)> = Vec::new();

        for (i, d) in directives.iter().enumerate() {
            let key_text = format!("use:{}", d.name.as_str());
            let norm: Option<String> = match &d.expression {
                None => None,
                Some(e) => match (e.start(), e.end()) {
                    (Some(s), Some(e2)) => Some(normalize_expr(ctx.slice(s, e2))),
                    _ => Some(format!("\0__nospan_{i}")),
                },
            };

            if let Some(group) = groups
                .iter_mut()
                .find(|(k, n, _)| *k == key_text && *n == norm)
            {
                group.2.push(i);
            } else {
                groups.push((key_text, norm, vec![i]));
            }
        }

        for (key_text, _norm, members) in &groups {
            if members.len() < 2 {
                continue;
            }
            for &idx in members {
                let node = directives[idx];
                // lineNo is the line of the OTHER duplicate: members[0] unless
                // this node IS members[0], then members[1].
                let other_idx = if members[0] != idx {
                    members[0]
                } else {
                    members[1]
                };
                let line_no = line_of(ctx.source(), directives[other_idx].start);
                ctx.report(
                    node.start,
                    node.end,
                    format!(
                        "This `{key_text}` directive is the same and duplicate directives in L{line_no}."
                    ),
                );
            }
        }
    }
}

impl Rule for NoDupeUseDirectives {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_start_tag(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_start_tag(ctx, &c.attributes);
    }
}

/// 1-based line number of the byte `offset` within `source`.
fn line_of(source: &str, offset: u32) -> usize {
    let end = (offset as usize).min(source.len());
    source.as_bytes()[..end]
        .iter()
        .filter(|&&b| b == b'\n')
        .count()
        + 1
}

/// Canonical token string of an expression source slice: strips `//` and
/// `/* */` comments and drops all whitespace **outside** string/template/char
/// literals (literal contents are copied verbatim). Mirrors `equalTokens`
/// (token-by-token equality, comments excluded) closely enough for the
/// handler-expression shapes the rule compares.
fn normalize_expr(src: &str) -> String {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn comments_and_whitespace_are_ignored() {
        let a = normalize_expr("() =>\n\t\t// foo\n\t\tconsole.log('foo')");
        let b = normalize_expr("() =>\n\t\tconsole\n\t\t\t// bar\n\t\t\t.log('foo')");
        assert_eq!(a, b);
    }

    #[test]
    fn distinct_objects_differ() {
        assert_ne!(normalize_expr("{ a: 42 }"), normalize_expr("{ b: 42 }"));
        assert_ne!(
            normalize_expr("{ a: 42 }"),
            normalize_expr("{ a: 42, b: 42 }")
        );
    }

    #[test]
    fn line_of_counts_newlines() {
        assert_eq!(line_of("a\nb\nc", 0), 1);
        assert_eq!(line_of("a\nb\nc", 2), 2);
        assert_eq!(line_of("a\nb\nc", 4), 3);
    }
}
