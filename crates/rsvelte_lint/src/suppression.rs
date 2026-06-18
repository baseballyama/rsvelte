//! Suppression directives.
//!
//! We honor **both** vocabularies (design doc §C course correction): ESLint's
//! `eslint-disable*` comments keyed on rule ids, and Svelte's
//! `<!-- svelte-ignore code -->`. The compiler already strips its own
//! svelte-ignored warnings before they reach us; supporting the directives here
//! additionally covers native rules and keeps migrating projects' existing
//! `eslint-disable` comments working zero-touch.
//!
//! Coverage:
//! - `eslint-disable-next-line [ids]` — the following line.
//! - `eslint-disable-line [ids]` — the same line.
//! - `eslint-disable [ids]` … `eslint-enable [ids]` — a **block range** (Wave
//!   2): everything between the two directives (to EOF when never re-enabled).
//! - `svelte-ignore code` — treated like `disable-next-line` for the listed
//!   codes.
//!
//! An empty id list means "all rules" (the `*` token).

use std::collections::{HashMap, HashSet};

/// Wildcard token meaning "all rules".
const ALL: &str = "*";

/// A `[from, to]` line range (1-indexed, inclusive) over which `ids` are
/// disabled. `ids` containing `*` disables everything.
struct DisableRange {
    from: u32,
    to: u32,
    ids: HashSet<String>,
}

#[derive(Default)]
pub struct Suppressions {
    /// 1-indexed line → rule ids disabled on that line (`*` = all).
    by_line: HashMap<u32, HashSet<String>>,
    /// Block `eslint-disable` … `eslint-enable` ranges.
    ranges: Vec<DisableRange>,
}

impl Suppressions {
    /// Scan `source` for directive comments.
    pub fn collect(source: &str) -> Self {
        let mut s = Suppressions::default();
        // Open block-disables: id (`*` for all) → line it was opened on.
        let mut open: HashMap<String, u32> = HashMap::new();
        let mut last_line = 0u32;

        for (i, line) in source.lines().enumerate() {
            let lineno = i as u32 + 1;
            last_line = lineno;
            // Order matters: check the more specific directives first.
            if let Some(rest) = find_after(line, "eslint-disable-next-line") {
                s.add_line(lineno + 1, rest);
            } else if let Some(rest) = find_after(line, "eslint-disable-line") {
                s.add_line(lineno, rest);
            } else if let Some(rest) = find_after(line, "eslint-enable") {
                close_ranges(&mut s, &mut open, parse_ids(rest), lineno);
            } else if let Some(rest) = find_after(line, "eslint-disable") {
                for id in parse_ids(rest) {
                    open.entry(id).or_insert(lineno);
                }
            }
            if let Some(rest) = find_after(line, "svelte-ignore") {
                // Unlike `eslint-disable`, an empty `<!-- svelte-ignore -->`
                // (no codes) suppresses NOTHING — Svelte's svelte-ignore needs
                // explicit codes, and the eslint oracle never lets it disable
                // `svelte/*` rules. Only add codes when the list is non-empty.
                s.add_line_no_wildcard(lineno + 1, rest);
            }
        }

        // Anything still open runs to EOF.
        for (id, from) in open {
            s.ranges.push(DisableRange {
                from,
                to: last_line.max(from),
                ids: HashSet::from([id]),
            });
        }
        s
    }

    fn add_line(&mut self, line: u32, rest: &str) {
        let entry = self.by_line.entry(line).or_default();
        for id in parse_ids(rest) {
            entry.insert(id);
        }
    }

    /// Like [`add_line`] but an empty id list adds NOTHING (rather than the `*`
    /// wildcard). Used for `svelte-ignore`, where an empty directive must not
    /// suppress every rule on the next line.
    fn add_line_no_wildcard(&mut self, line: u32, rest: &str) {
        let ids = parse_ids(rest);
        if ids.len() == 1 && ids[0] == ALL {
            return; // empty `svelte-ignore` → suppress nothing
        }
        let entry = self.by_line.entry(line).or_default();
        for id in ids {
            entry.insert(id);
        }
    }

    /// Whether a finding for `rule` at `line` (1-indexed) is suppressed.
    pub fn is_suppressed(&self, rule: &str, line: u32) -> bool {
        if let Some(set) = self.by_line.get(&line)
            && (set.contains(ALL) || set.contains(rule))
        {
            return true;
        }
        self.ranges.iter().any(|r| {
            r.from <= line && line <= r.to && (r.ids.contains(ALL) || r.ids.contains(rule))
        })
    }
}

/// Close open block-disables that `enable_ids` re-enables, emitting ranges.
fn close_ranges(
    s: &mut Suppressions,
    open: &mut HashMap<String, u32>,
    enable_ids: Vec<String>,
    lineno: u32,
) {
    let enable_all = enable_ids.iter().any(|i| i == ALL);
    let to_close: Vec<String> = if enable_all {
        open.keys().cloned().collect()
    } else {
        enable_ids
    };
    for id in to_close {
        if let Some(from) = open.remove(&id) {
            s.ranges.push(DisableRange {
                from,
                to: lineno,
                ids: HashSet::from([id]),
            });
        }
    }
}

/// Return the text after `needle` in `line`, if present.
fn find_after<'a>(line: &'a str, needle: &str) -> Option<&'a str> {
    line.find(needle).map(|i| &line[i + needle.len()..])
}

/// Parse the rule/code list trailing a directive. An empty list means "all
/// rules" and yields a single `*` token.
fn parse_ids(rest: &str) -> Vec<String> {
    // Trim the comment terminators that may follow the id list.
    let cleaned = rest
        .trim_end_matches("-->")
        .trim_end_matches("*/")
        .replace([',', '\t'], " ");
    let ids: Vec<String> = cleaned
        .split_whitespace()
        .filter(|t| !t.is_empty() && *t != "--" && *t != ":")
        .map(|t| t.trim_matches(|c| c == ':' || c == ',').to_string())
        .filter(|t| !t.is_empty())
        .collect();
    if ids.is_empty() {
        vec![ALL.to_string()]
    } else {
        ids
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn next_line_disables_following_line_for_named_rule() {
        let s = Suppressions::collect(
            "<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n{@html x}",
        );
        assert!(s.is_suppressed("svelte/no-at-html-tags", 2));
        assert!(!s.is_suppressed("svelte/no-at-html-tags", 1));
        assert!(!s.is_suppressed("svelte/require-each-key", 2));
    }

    #[test]
    fn svelte_ignore_disables_code_on_next_line() {
        let s = Suppressions::collect(
            "<!-- svelte-ignore a11y_img_redundant_alt -->\n<img alt=\"photo of\" />",
        );
        assert!(s.is_suppressed("a11y_img_redundant_alt", 2));
    }

    #[test]
    fn bare_disable_runs_to_eof() {
        let s = Suppressions::collect("<!-- eslint-disable -->\n{@html x}\nmore");
        assert!(s.is_suppressed("svelte/no-at-html-tags", 2));
        assert!(s.is_suppressed("anything", 3));
    }

    #[test]
    fn block_disable_enable_bounds_the_range() {
        let src = "a\n<!-- eslint-disable svelte/no-at-html-tags -->\n{@html x}\n<!-- eslint-enable svelte/no-at-html-tags -->\n{@html y}";
        let s = Suppressions::collect(src);
        // Inside the block (line 3) — suppressed.
        assert!(s.is_suppressed("svelte/no-at-html-tags", 3));
        // After `eslint-enable` (line 5) — not suppressed.
        assert!(!s.is_suppressed("svelte/no-at-html-tags", 5));
        // A different rule is unaffected inside the block.
        assert!(!s.is_suppressed("svelte/require-each-key", 3));
    }

    #[test]
    fn bare_enable_closes_all_open_disables() {
        let src = "<!-- eslint-disable -->\n{@html x}\n<!-- eslint-enable -->\n{@html y}";
        let s = Suppressions::collect(src);
        assert!(s.is_suppressed("svelte/no-at-html-tags", 2));
        assert!(!s.is_suppressed("svelte/no-at-html-tags", 4));
    }
}
