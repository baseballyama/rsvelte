//! `svelte/no-dupe-else-if-blocks` — flag an `{:else if}` branch whose
//! condition can never be true because an earlier branch in the same
//! `{#if}` / `{:else if}` chain already covers it.
//!
//! Port of the eslint-plugin-svelte rule (which mirrors core `ESLint` `no-dupe-else-if`).
//!
//! The coverage test is the standard OR-of-AND subset analysis: a condition is
//! redundant when every `||` operand of it is a superset of some earlier
//! condition's `||` operand (compared as sets of `&&` operands).
//!
//! Two things follow upstream rather than the source text. Leaves are compared
//! as **token streams** (upstream's `equalTokens`), so a comment inside a
//! condition is invisible while whitespace *inside* a string or template
//! literal is significant. And the chain of a given `{#if}` is its **ancestor**
//! chain — every enclosing block it is a direct child of an `{:else}` of — so
//! two sibling `{#if}` blocks inside one `{:else}` are each chained to the
//! enclosing block, not to each other.

use rsvelte_core::ast::template::Root;
use serde_json::Value;

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

/// One condition split into OR-of-AND operand sets, each leaf normalised to its
/// token stream.
type OrAnd = Vec<Vec<String>>;

const OR: [u8; 2] = *b"||";
const AND: [u8; 2] = *b"&&";

/// Mask byte standing for one byte of an opaque literal (string / template /
/// regex). The mask is built byte-for-byte, so every offset into it is the same
/// offset into the source.
const LITERAL: u8 = 0x01;
/// Mask byte standing for one byte of a comment, which carries no token at all.
const COMMENT: u8 = 0x02;

#[derive(Default)]
pub struct NoDupeElseIfBlocks;

impl Rule for NoDupeElseIfBlocks {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let json = ctx.root_json(root);
        if json.is_null() {
            return;
        }
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk(&json, &[], ctx.source(), &mut reports);
        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

/// Descend the template looking for `{#if}` blocks. `chain` carries the
/// enclosing blocks' conditions; it is only non-empty for a block reached as a
/// direct child of an enclosing `{:else}`.
fn walk(value: &Value, chain: &[OrAnd], src: &str, out: &mut Vec<(u32, u32)>) {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some("IfBlock") {
                visit_if(value, chain, src, out);
                return;
            }
            for (key, child) in map {
                if key != "loc" {
                    walk(child, &[], src, out);
                }
            }
        }
        Value::Array(items) => {
            for item in items {
                walk(item, &[], src, out);
            }
        }
        _ => {}
    }
}

fn visit_if(node: &Value, chain: &[OrAnd], src: &str, out: &mut Vec<(u32, u32)>) {
    let test = node.get("test").and_then(|t| span_of(t, src));
    // The condition's own OR-of-AND split, which becomes the next link's chain.
    let split = test.map(|(start, end)| {
        let cond = &src[start..end];
        let mask = mask(cond);
        if !chain.is_empty()
            && let Some((lo, hi)) = evaluate(cond, &mask, chain)
        {
            out.push((offset_u32(start + lo), offset_u32(start + hi)));
        }
        or_and(cond, &mask, 0, cond.len())
    });

    if let Some(fragment) = node.get("consequent") {
        walk(fragment, &[], src, out);
    }
    let Some(alternate) = node.get("alternate").filter(|v| !v.is_null()) else {
        return;
    };
    let nodes = split
        .as_ref()
        .and(alternate.get("nodes"))
        .and_then(Value::as_array);
    let (Some(split), Some(nodes)) = (split, nodes) else {
        walk(alternate, &[], src, out);
        return;
    };
    let mut next = chain.to_vec();
    next.push(split);
    for child in nodes {
        if child.get("type").and_then(Value::as_str) == Some("IfBlock") {
            visit_if(child, &next, src, out);
        } else {
            walk(child, &[], src, out);
        }
    }
}

fn span_of(node: &Value, src: &str) -> Option<(usize, usize)> {
    let start = usize::try_from(node.get("start")?.as_u64()?).ok()?;
    let end = usize::try_from(node.get("end")?.as_u64()?).ok()?;
    (start <= end && end <= src.len() && src.is_char_boundary(start) && src.is_char_boundary(end))
        .then_some((start, end))
}

fn offset_u32(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

/// The byte range within `cond` to report, when the condition (or one of its
/// top-level `&&` operands) is covered by an earlier condition.
fn evaluate(cond: &str, mask: &[u8], prev: &[OrAnd]) -> Option<(usize, usize)> {
    let (lo, hi) = strip_outer_parens(mask, 0, cond.len());
    // Upstream checks `[...splitByAnd(test), test]` — the individual `&&`
    // operands first, the whole expression last — and reports at the first
    // candidate that matches, whose start column can differ from the whole
    // condition's.
    let mut candidates: Vec<(usize, usize)> = Vec::new();
    let and_parts = split_top(mask, lo, hi, AND);
    if and_parts.len() > 1 {
        candidates.extend(
            and_parts
                .iter()
                .map(|&(a, b)| strip_outer_parens(mask, a, b)),
        );
    }
    candidates.push((lo, hi));

    candidates.into_iter().find_map(|(a, b)| {
        let split = or_and(cond, mask, a, b);
        let covered = split.iter().all(|or_op| {
            prev.iter()
                .any(|earlier| earlier.iter().any(|and_set| is_subset(and_set, or_op)))
        });
        covered.then_some((a, b))
    })
}

/// `and_set ⊆ or_op`: every operand of `and_set` appears in `or_op`.
fn is_subset(and_set: &[String], or_op: &[String]) -> bool {
    and_set.iter().all(|operand| or_op.contains(operand))
}

/// Split `cond[lo..hi]` into OR-of-AND operand sets, normalising each leaf.
fn or_and(cond: &str, mask: &[u8], lo: usize, hi: usize) -> OrAnd {
    let (lo, hi) = strip_outer_parens(mask, lo, hi);
    split_top(mask, lo, hi, OR)
        .into_iter()
        .map(|(a, b)| {
            let (a, b) = strip_outer_parens(mask, a, b);
            split_top(mask, a, b, AND)
                .into_iter()
                .map(|(x, y)| {
                    let (x, y) = strip_outer_parens(mask, x, y);
                    normalize(cond, mask, x, y)
                })
                .collect()
        })
        .collect()
}

/// A leaf's token stream, joined by a separator no token can contain. This is
/// upstream's `equalTokens` comparison key: comments contribute nothing and
/// whitespace between tokens is dropped, but a literal keeps its exact spelling.
fn normalize(cond: &str, mask: &[u8], lo: usize, hi: usize) -> String {
    tokens(cond, mask, lo, hi).join("\u{1}")
}

const fn is_word_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$' || b >= 0x80
}

fn tokens<'a>(cond: &'a str, mask: &[u8], lo: usize, hi: usize) -> Vec<&'a str> {
    let mut out = Vec::new();
    let mut i = lo;
    while i < hi {
        let b = mask[i];
        if b == COMMENT || b.is_ascii_whitespace() {
            i += 1;
            continue;
        }
        if b == LITERAL {
            let start = i;
            while i < hi && mask[i] == LITERAL {
                i += 1;
            }
            out.push(&cond[start..i]);
            continue;
        }
        if is_word_byte(b) {
            let start = i;
            while i < hi && is_word_byte(mask[i]) {
                i += 1;
            }
            out.push(&cond[start..i]);
            continue;
        }
        out.push(&cond[i..i + 1]);
        i += 1;
    }
    out
}

/// Keywords after which a `/` opens a regular expression rather than dividing.
const REGEX_PRECEDING_KEYWORDS: &[&str] = &[
    "return",
    "typeof",
    "instanceof",
    "in",
    "of",
    "new",
    "delete",
    "void",
    "throw",
    "case",
    "do",
    "else",
    "yield",
    "await",
];

fn regex_can_start(prev: Option<u8>, prev_word: &str) -> bool {
    match prev {
        None => true,
        Some(b) if is_word_byte(b) => REGEX_PRECEDING_KEYWORDS.contains(&prev_word),
        Some(b) => !matches!(b, b')' | b']' | b'}' | b'"' | b'\'' | b'`' | b'/'),
    }
}

/// Blank out every comment and literal in `src`, byte for byte, so the
/// structural scans below can look for brackets and operators without a `&&`
/// inside a string or a `(` inside a comment reaching them.
fn mask(src: &str) -> Vec<u8> {
    let b = src.as_bytes();
    let n = b.len();
    let mut mask = b.to_vec();
    let mut i = 0;
    let mut prev: Option<u8> = None;
    let mut prev_word = 0..0;
    while i < n {
        let c = b[i];
        if c.is_ascii_whitespace() {
            i += 1;
            continue;
        }
        if c == b'/' && b.get(i + 1) == Some(&b'/') {
            let start = i;
            while i < n && b[i] != b'\n' {
                i += 1;
            }
            mask[start..i].fill(COMMENT);
            continue;
        }
        if c == b'/' && b.get(i + 1) == Some(&b'*') {
            let start = i;
            i += 2;
            while i + 1 < n && !(b[i] == b'*' && b[i + 1] == b'/') {
                i += 1;
            }
            i = (i + 2).min(n);
            mask[start..i].fill(COMMENT);
            continue;
        }
        if matches!(c, b'"' | b'\'' | b'`') {
            let start = i;
            i = skip_quoted(b, i);
            mask[start..i].fill(LITERAL);
            prev = Some(c);
            prev_word = 0..0;
            continue;
        }
        if c == b'/' && regex_can_start(prev, &src[prev_word.clone()]) {
            let start = i;
            i = skip_regex(b, i);
            mask[start..i].fill(LITERAL);
            prev = Some(b'/');
            prev_word = 0..0;
            continue;
        }
        if is_word_byte(c) {
            let start = i;
            while i < n && is_word_byte(b[i]) {
                i += 1;
            }
            prev_word = start..i;
            prev = Some(b[i - 1]);
            continue;
        }
        prev = Some(c);
        prev_word = 0..0;
        i += 1;
    }
    mask
}

/// Index just past the closing delimiter of the string / template literal that
/// starts at `i`. Template interpolations are traversed so a nested literal or
/// brace inside `${…}` cannot end the scan early.
fn skip_quoted(b: &[u8], mut i: usize) -> usize {
    let n = b.len();
    let quote = b[i];
    i += 1;
    let mut depth = 0i32;
    while i < n {
        let c = b[i];
        if c == b'\\' {
            i += 2;
            continue;
        }
        if quote == b'`' && depth > 0 {
            match c {
                b'{' => depth += 1,
                b'}' => depth -= 1,
                b'`' | b'"' | b'\'' => {
                    i = skip_quoted(b, i);
                    continue;
                }
                _ => {}
            }
            i += 1;
            continue;
        }
        if quote == b'`' && c == b'$' && b.get(i + 1) == Some(&b'{') {
            depth = 1;
            i += 2;
            continue;
        }
        i += 1;
        if c == quote {
            return i;
        }
    }
    i
}

/// Index just past a regular-expression literal (including its flags).
fn skip_regex(b: &[u8], mut i: usize) -> usize {
    let n = b.len();
    i += 1;
    let mut in_class = false;
    while i < n {
        match b[i] {
            b'\\' => i += 1,
            b'[' => in_class = true,
            b']' => in_class = false,
            b'\n' => return i,
            b'/' if !in_class => {
                i += 1;
                while i < n && is_word_byte(b[i]) {
                    i += 1;
                }
                return i;
            }
            _ => {}
        }
        i += 1;
    }
    i
}

/// Drop leading/trailing whitespace and comment bytes from a range.
fn trim(mask: &[u8], mut lo: usize, mut hi: usize) -> (usize, usize) {
    let skippable = |b: u8| b.is_ascii_whitespace() || b == COMMENT;
    while lo < hi && skippable(mask[lo]) {
        lo += 1;
    }
    while hi > lo && skippable(mask[hi - 1]) {
        hi -= 1;
    }
    (lo, hi)
}

/// Strip every layer of fully-enclosing balanced parentheses. Acorn does not
/// include redundant parens in a node's range, so upstream's report position is
/// the inner expression's.
fn strip_outer_parens(mask: &[u8], lo: usize, hi: usize) -> (usize, usize) {
    let (mut lo, mut hi) = trim(mask, lo, hi);
    while lo < hi && mask[lo] == b'(' && matching_close(mask, lo, hi) == Some(hi - 1) {
        (lo, hi) = trim(mask, lo + 1, hi - 1);
    }
    (lo, hi)
}

/// The index of the `)` matching the `(` at `lo`, if it is within `[lo, hi)`.
fn matching_close(mask: &[u8], lo: usize, hi: usize) -> Option<usize> {
    let mut depth = 0i32;
    for (i, &b) in mask.iter().enumerate().take(hi).skip(lo) {
        match b {
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

/// Split `[lo, hi)` at top-level occurrences of the two-byte operator `op`.
fn split_top(mask: &[u8], lo: usize, hi: usize, op: [u8; 2]) -> Vec<(usize, usize)> {
    let mut parts = Vec::new();
    let mut start = lo;
    let mut depth = 0i32;
    let mut i = lo;
    while i < hi {
        let b = mask[i];
        match b {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            _ if depth == 0 && b == op[0] && i + 1 < hi && mask[i + 1] == op[1] => {
                parts.push(trim(mask, start, i));
                i += 2;
                start = i;
                continue;
            }
            _ => {}
        }
        i += 1;
    }
    parts.push(trim(mask, start, hi));
    parts
}

#[cfg(test)]
mod tests {
    use super::*;

    fn leaves(src: &str) -> OrAnd {
        let m = mask(src);
        or_and(src, &m, 0, src.len())
    }

    fn split(src: &str, op: [u8; 2]) -> Vec<&str> {
        let m = mask(src);
        split_top(&m, 0, src.len(), op)
            .into_iter()
            .map(|(a, b)| &src[a..b])
            .collect()
    }

    #[test]
    fn split_respects_parens_strings_and_comments() {
        assert_eq!(split("a || b", OR), vec!["a", "b"]);
        assert_eq!(split("(a || b) && c", OR), vec!["(a || b) && c"]);
        assert_eq!(split("a && b && c", AND), vec!["a", "b", "c"]);
        assert_eq!(split("'a||b'", OR), vec!["'a||b'"]);
        // A `&&` inside a comment is not an operator.
        assert_eq!(split("foo /* && */ && bar", AND), vec!["foo", "bar"]);
        // Nor is one inside a regex literal.
        assert_eq!(split("/&&/.test(s) && a", AND), vec!["/&&/.test(s)", "a"]);
    }

    #[test]
    fn or_and_handles_nested_parens() {
        assert_eq!(
            leaves("((c && e && b) || a)"),
            vec![vec!["c", "e", "b"], vec!["a"]]
        );
    }

    #[test]
    fn whitespace_between_tokens_is_insignificant() {
        assert_eq!(leaves("a  &&\n\tb"), leaves("a && b"));
        assert_eq!(leaves("foo /* note */ && bar"), leaves("foo && bar"));
    }

    #[test]
    fn whitespace_inside_a_literal_is_significant() {
        assert_ne!(leaves("x === 'a b'"), leaves("x === 'a  b'"));
        assert_ne!(leaves("t === `c d`"), leaves("t === `c  d`"));
        assert_ne!(leaves("x === 'e && f'"), leaves("x === 'e&&f'"));
    }

    #[test]
    fn adjacent_words_do_not_merge() {
        assert_ne!(leaves("typeof a"), leaves("typeofa"));
    }
}
