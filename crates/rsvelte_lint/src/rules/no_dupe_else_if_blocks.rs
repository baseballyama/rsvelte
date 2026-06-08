//! `svelte/no-dupe-else-if-blocks` — flag an `{:else if}` branch whose
//! condition can never be true because an earlier branch in the same
//! `{#if}` / `{:else if}` chain already covers it. Port of the
//! eslint-plugin-svelte rule (which mirrors core ESLint `no-dupe-else-if`).
//!
//! The coverage test is the standard OR-of-AND subset analysis: a condition is
//! redundant when every `||` operand of it is a superset of some earlier
//! condition's `||` operand (compared as sets of `&&` operands). Operand
//! splitting is done over the **source text** (paren/quote aware) so it does
//! not depend on how the JS parser represents parenthesised sub-expressions.

use rsvelte_core::ast::template::{IfBlock, TemplateNode};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dupe-else-if-blocks",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow duplicate conditions in `{#if}` / `{:else if}` chains",
    options_schema: None,
};

const MESSAGE: &str = "This branch can never execute. Its condition is a duplicate or covered \
by previous conditions in the `{#if}` / `{:else if}` chain.";

#[derive(Default)]
pub struct NoDupeElseIfBlocks;

impl Rule for NoDupeElseIfBlocks {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_if(&self, ctx: &mut LintContext, block: &IfBlock) {
        // Only process from the head of a chain; the nested `{:else if}` blocks
        // are reached by walking `alternate` below, so skip them here to avoid
        // double-reporting.
        if block.elseif {
            return;
        }

        // Collect the chain's condition source texts in order.
        let mut tests: Vec<String> = Vec::new();
        let mut spans: Vec<(u32, u32)> = Vec::new();
        let mut cur = Some(block);
        while let Some(c) = cur {
            let (Some(s), Some(e)) = (c.test.start(), c.test.end()) else {
                break;
            };
            tests.push(ctx.slice(s, e).to_string());
            spans.push((s, e));
            cur = next_link(c);
        }

        // Pre-split every earlier condition into OR-of-AND operand sets.
        let split: Vec<Vec<Vec<String>>> = tests.iter().map(|t| or_and(t)).collect();

        let mut reports: Vec<(u32, u32)> = Vec::new();
        for i in 1..tests.len() {
            // conditionsToCheck: the whole condition, plus — when it is a
            // top-level `&&` chain — each `&&` operand on its own.
            let mut to_check: Vec<String> = vec![tests[i].clone()];
            let and_parts = split_top(strip_outer_parens(&tests[i]), "&&");
            if and_parts.len() > 1 {
                to_check.extend(and_parts.into_iter().map(|p| p.to_string()));
            }

            let prev = &split[..i];
            let is_dup = to_check.iter().any(|c| {
                let c_or = or_and(c);
                c_or.iter().all(|or_op| {
                    prev.iter()
                        .any(|prev_or| prev_or.iter().any(|prev_and| is_subset(prev_and, or_op)))
                })
            });
            if is_dup {
                reports.push(spans[i]);
            }
        }
        for (s, e) in reports {
            ctx.report(s, e, MESSAGE);
        }
    }
}

/// The next link in the `{#if}` chain: the first `{#if}` inside `block`'s
/// alternate. This covers both `{:else if}` (alternate is `[IfBlock elseif]`)
/// and a bare `{#if}` nested in an `{:else}` block — eslint-plugin-svelte treats
/// the latter as a chain continuation too (its `iterateIfElseIf` walks up
/// through any `SvelteElseBlock` whose child is an `{#if}`).
fn next_link(block: &IfBlock) -> Option<&IfBlock> {
    let alt = block.alternate.as_ref()?;
    alt.nodes.iter().find_map(|n| match n {
        TemplateNode::IfBlock(b) => Some(&**b),
        _ => None,
    })
}

/// `prev_and ⊆ or_op`: every operand of `prev_and` appears in `or_op`.
fn is_subset(prev_and: &[String], or_op: &[String]) -> bool {
    prev_and.iter().all(|p| or_op.contains(p))
}

/// Split a condition into OR-of-AND operand sets, normalising each leaf.
fn or_and(text: &str) -> Vec<Vec<String>> {
    split_top(strip_outer_parens(text), "||")
        .into_iter()
        .map(|or_part| {
            split_top(strip_outer_parens(or_part), "&&")
                .into_iter()
                .map(normalize)
                .collect()
        })
        .collect()
}

/// Remove all whitespace and strip redundant outer parens from a leaf operand.
fn normalize(s: &str) -> String {
    strip_outer_parens(s)
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect()
}

/// Strip one or more layers of fully-enclosing balanced parentheses.
fn strip_outer_parens(s: &str) -> &str {
    let mut s = s.trim();
    while s.starts_with('(') && matching_close(s) == Some(s.len() - 1) {
        s = s[1..s.len() - 1].trim();
    }
    s
}

/// If `s` begins with `(`, the byte index of its matching `)`, else `None`.
fn matching_close(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    if bytes.first() != Some(&b'(') {
        return None;
    }
    let mut depth = 0i32;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    for (i, &b) in bytes.iter().enumerate() {
        if let Some(q) = quote {
            if escaped {
                escaped = false;
            } else if b == b'\\' {
                escaped = true;
            } else if b == q {
                quote = None;
            }
            continue;
        }
        match b {
            b'\'' | b'"' | b'`' => quote = Some(b),
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Split `s` at top-level occurrences of the 2-char operator `op` (`||`/`&&`),
/// respecting nesting depth and string/template literals.
fn split_top<'a>(s: &'a str, op: &str) -> Vec<&'a str> {
    let bytes = s.as_bytes();
    let op = op.as_bytes();
    let (o0, o1) = (op[0], op[1]);
    let mut parts = Vec::new();
    let mut start = 0usize;
    let mut depth = 0i32;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    let mut i = 0usize;
    while i < bytes.len() {
        let b = bytes[i];
        if let Some(q) = quote {
            if escaped {
                escaped = false;
            } else if b == b'\\' {
                escaped = true;
            } else if b == q {
                quote = None;
            }
            i += 1;
            continue;
        }
        match b {
            b'\'' | b'"' | b'`' => quote = Some(b),
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            _ if depth == 0 && b == o0 && bytes.get(i + 1) == Some(&o1) => {
                parts.push(s[start..i].trim());
                i += 2;
                start = i;
                continue;
            }
            _ => {}
        }
        i += 1;
    }
    parts.push(s[start..].trim());
    parts
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn split_respects_parens_and_strings() {
        assert_eq!(split_top("a || b", "||"), vec!["a", "b"]);
        assert_eq!(split_top("(a || b) && c", "||"), vec!["(a || b) && c"]);
        assert_eq!(split_top("a && b && c", "&&"), vec!["a", "b", "c"]);
        assert_eq!(split_top("'a||b'", "||"), vec!["'a||b'"]);
    }

    #[test]
    fn or_and_handles_nested_parens() {
        // ((c && e && b) || a) → [[c,e,b],[a]]
        let r = or_and("((c && e && b) || a)");
        assert_eq!(r, vec![vec!["c", "e", "b"], vec!["a"]]);
    }
}
