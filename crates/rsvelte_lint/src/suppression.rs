//! Suppression directives.
//!
//! We honor **both** vocabularies (design doc §C course-correction): ESLint's
//! `eslint-disable*` comments keyed on rule ids, and Svelte's
//! `<!-- svelte-ignore code -->`. The compiler already strips its own
//! svelte-ignored warnings before they reach us; supporting the directives here
//! additionally covers native rules and keeps migrating projects' existing
//! `eslint-disable` comments working zero-touch.
//!
//! Wave 1 uses a line-based approximation: `*-next-line` disables the following
//! line, `*-line` the same line, a bare `eslint-disable` disables file-wide, and
//! `svelte-ignore` is treated like `disable-next-line` for the listed codes.
//! Block `eslint-disable`/`eslint-enable` range tracking lands in Wave 2.

use std::collections::{HashMap, HashSet};

/// Wildcard token meaning "all rules".
const ALL: &str = "*";

#[derive(Default)]
pub struct Suppressions {
    /// 1-indexed line → rule ids disabled on that line (`*` = all).
    by_line: HashMap<u32, HashSet<String>>,
    /// Rule ids disabled for the whole file (`*` = all).
    file_level: HashSet<String>,
}

impl Suppressions {
    /// Scan `source` for directive comments.
    pub fn collect(source: &str) -> Self {
        let mut s = Suppressions::default();
        for (i, line) in source.lines().enumerate() {
            let lineno = i as u32 + 1;
            // Order matters: check the more specific directives first.
            if let Some(rest) = find_after(line, "eslint-disable-next-line") {
                s.add_line(lineno + 1, rest);
            } else if let Some(rest) = find_after(line, "eslint-disable-line") {
                s.add_line(lineno, rest);
            } else if let Some(rest) = find_after(line, "eslint-disable") {
                // Bare block-disable → file-wide for v1.
                for id in parse_ids(rest) {
                    s.file_level.insert(id);
                }
            }
            if let Some(rest) = find_after(line, "svelte-ignore") {
                s.add_line(lineno + 1, rest);
            }
        }
        s
    }

    fn add_line(&mut self, line: u32, rest: &str) {
        let entry = self.by_line.entry(line).or_default();
        for id in parse_ids(rest) {
            entry.insert(id);
        }
    }

    /// Whether a finding for `rule` at `line` (1-indexed) is suppressed.
    pub fn is_suppressed(&self, rule: &str, line: u32) -> bool {
        if self.file_level.contains(ALL) || self.file_level.contains(rule) {
            return true;
        }
        match self.by_line.get(&line) {
            Some(set) => set.contains(ALL) || set.contains(rule),
            None => false,
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
    fn bare_disable_is_file_wide() {
        let s = Suppressions::collect("<!-- eslint-disable -->\n{@html x}");
        assert!(s.is_suppressed("svelte/no-at-html-tags", 2));
        assert!(s.is_suppressed("anything", 99));
    }
}
