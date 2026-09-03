//! Suppression directives.
//!
//! We honor **both** vocabularies (design doc §C course correction): `ESLint`'s
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
//!   codes, which are the compiler's warning codes only: a `svelte/<rule>` id
//!   is ignored, matching the oracle.
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
    ///
    /// # Panics
    ///
    /// Panics when a line count cannot be represented as `u32`.
    #[must_use]
    pub fn collect(source: &str) -> Self {
        Self::collect_in(source, false)
    }

    /// [`Suppressions::collect`] for a `.svelte.(js|ts)` module, whose whole
    /// body is script rather than template.
    #[must_use]
    pub fn collect_module(source: &str) -> Self {
        Self::collect_in(source, true)
    }

    /// [`Suppressions::collect`] with the template/module reading chosen by the
    /// file name — a `.svelte.(js|ts)` module has no template to scan.
    #[must_use]
    pub fn collect_for(source: &str, filename: &str) -> Self {
        Self::collect_in(
            source,
            matches!(
                crate::engine::classify_source(filename),
                crate::engine::SourceKind::Module { .. }
            ),
        )
    }

    fn collect_in(source: &str, module: bool) -> Self {
        let mut s = Self::default();
        // Open block-disables: id (`*` for all) → (line it was opened on,
        // whether the directive is an HTML `<!-- … -->` comment).
        let mut open: HashMap<String, (u32, bool)> = HashMap::new();
        let mut last_line = 0u32;
        let (regions, script_ends) = crate::directive_regions::scan(source, module);
        // The line the start tag's `>` sits on. Counted in `\n` only, to stay
        // aligned with the `source.lines()` numbering used below.
        let mut boundaries: Vec<u32> = script_ends
            .iter()
            .map(|&(_, end)| line_of(source, end as usize))
            .collect();
        boundaries.sort_unstable();

        let mut line_off = 0usize;
        for (i, line) in source.lines().enumerate() {
            let lineno = u32::try_from(i).expect("line counts are represented as u32") + 1;
            last_line = lineno;
            // Order matters: check the more specific directives first.
            if let Some((rest, _)) =
                find_directive(line, line_off, "eslint-disable-next-line", &regions)
            {
                s.add_line(lineno + 1, rest);
            } else if let Some((rest, _)) =
                find_directive(line, line_off, "eslint-disable-line", &regions)
            {
                s.add_line(lineno, rest);
            } else if let Some((rest, _)) =
                find_directive(line, line_off, "eslint-enable", &regions)
            {
                close_ranges(&mut s, &mut open, parse_ids(rest), lineno);
            } else if let Some((rest, is_html)) =
                find_directive(line, line_off, "eslint-disable", &regions)
            {
                for id in parse_ids(rest) {
                    open.entry(id).or_insert((lineno, is_html));
                }
            }
            if let Some((rest, _)) = find_directive(line, line_off, "svelte-ignore", &regions) {
                // Unlike `eslint-disable`, an empty `<!-- svelte-ignore -->`
                // (no codes) suppresses NOTHING — Svelte's svelte-ignore needs
                // explicit codes, and the eslint oracle never lets it disable
                // `svelte/*` rules. Only add codes when the list is non-empty.
                s.add_line_svelte_ignore(lineno + 1, rest);
            }
            // Upstream re-enables ALL (plugin) suppressions at every `<script>`
            // start tag (`SvelteScriptElement` pushes an enable-all block at the
            // tag's end). Close the open HTML-comment block-disables here; JS
            // `/* eslint-disable */` comments are ESLint-core directives, which
            // that boundary does not touch.
            if boundaries.binary_search(&lineno).is_ok() {
                let to_close: Vec<String> = open
                    .iter()
                    .filter(|(_, (_, is_html))| *is_html)
                    .map(|(id, _)| id.clone())
                    .collect();
                for id in to_close {
                    if let Some((from, _)) = open.remove(&id) {
                        s.ranges.push(DisableRange {
                            from,
                            to: lineno,
                            ids: HashSet::from([id]),
                        });
                    }
                }
            }
            line_off += line.len();
            line_off += usize::from(source.as_bytes().get(line_off) == Some(&b'\r'));
            line_off += usize::from(source.as_bytes().get(line_off) == Some(&b'\n'));
        }

        // Anything still open runs to EOF.
        for (id, (from, _)) in open {
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

    /// Like [`add_line`] but for `svelte-ignore`, whose id vocabulary is the
    /// compiler's warning codes rather than ESLint rule ids. Two tokens are
    /// therefore dropped rather than registered: `*`, because a bare
    /// `<!-- svelte-ignore -->` (empty → `parse_ids` yields `["*"]`) suppresses
    /// nothing; and any `/`-bearing id, because `svelte/<rule>` names a plugin
    /// rule the oracle's `svelte-ignore` cannot disable.
    fn add_line_svelte_ignore(&mut self, line: u32, rest: &str) {
        let entry = self.by_line.entry(line).or_default();
        for id in parse_ids(rest) {
            if id != ALL && !id.contains('/') {
                entry.insert(id);
            }
        }
    }

    /// Whether a finding for `rule` at `line` (1-indexed) is suppressed.
    #[must_use]
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
    open: &mut HashMap<String, (u32, bool)>,
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
        if let Some((from, _)) = open.remove(&id) {
            s.ranges.push(DisableRange {
                from,
                to: lineno,
                ids: HashSet::from([id]),
            });
        }
    }
}

/// The 1-indexed `\n`-counted line holding byte `offset`.
fn line_of(source: &str, offset: usize) -> u32 {
    let n = source.as_bytes()[..offset.min(source.len())]
        .iter()
        .filter(|&&c| c == b'\n')
        .count();
    u32::try_from(n).expect("line counts are represented as u32") + 1
}

/// The text following `needle` on `line`, clipped to the end of the
/// directive-bearing region that contains it, plus whether that region is an
/// HTML comment. `None` when no occurrence of `needle` on the line sits in one —
/// upstream reads directives out of comment NODES, so an `eslint-disable` in an
/// attribute value, a mustache, a JS/CSS string or a CSS comment is just text.
fn find_directive<'a>(
    line: &'a str,
    line_off: usize,
    needle: &str,
    regions: &[crate::directive_regions::DirectiveRegion],
) -> Option<(&'a str, bool)> {
    let mut from = 0;
    while let Some(rel) = line[from..].find(needle) {
        let at = from + rel;
        let abs = u32::try_from(line_off + at).ok()?;
        if let Some(region) = crate::directive_regions::region_at(regions, abs) {
            let start = at + needle.len();
            let mut end = (region.end as usize)
                .saturating_sub(line_off)
                .clamp(start, line.len());
            if !line.is_char_boundary(end) {
                end = line.len();
            }
            return Some((&line[start..end], region.html));
        }
        from = at + needle.len();
    }
    None
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
    fn empty_svelte_ignore_suppresses_nothing() {
        // Unlike `eslint-disable`, a bare `<!-- svelte-ignore -->` (no codes)
        // must NOT wildcard-suppress the next line.
        let s =
            Suppressions::collect("<!-- svelte-ignore -->\n<img src=\"x\" alt=\"y\" autofocus />");
        assert!(!s.is_suppressed("svelte/sort-attributes", 2));
        assert!(!s.is_suppressed("anything", 2));
    }

    #[test]
    fn svelte_ignore_drops_stray_wildcard_but_keeps_codes() {
        // A stray `*` alongside real codes is ignored; the named code still works.
        let s = Suppressions::collect("<!-- svelte-ignore * a11y_foo -->\n<img />");
        assert!(s.is_suppressed("a11y_foo", 2));
        assert!(!s.is_suppressed("svelte/sort-attributes", 2)); // `*` not honoured
    }

    #[test]
    fn named_svelte_ignore_only_suppresses_that_code() {
        let s = Suppressions::collect("<!-- svelte-ignore a11y_foo -->\n<img />");
        assert!(s.is_suppressed("a11y_foo", 2));
        assert!(!s.is_suppressed("a11y_bar", 2));
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
    fn script_start_tag_closes_open_html_block_disables() {
        // Upstream re-enables all plugin suppressions at every `<script>` start
        // tag; a top-of-file `<!-- eslint-disable -->` must not reach past it.
        let src =
            "<!-- eslint-disable -->\n{@html x}\n\n<script>\nlet a = 1;\n</script>\n{@html y}";
        let s = Suppressions::collect(src);
        assert!(s.is_suppressed("svelte/no-at-html-tags", 2));
        assert!(!s.is_suppressed("svelte/prefer-const", 5));
        assert!(!s.is_suppressed("svelte/no-at-html-tags", 7));
    }

    #[test]
    fn script_start_tag_leaves_js_block_disables_open() {
        // A `/* eslint-disable */` is an ESLint-core directive; the plugin's
        // script-boundary enable does not touch it.
        let src = "<script>\n/* eslint-disable */\nlet a = 1;\n</script>\n<script module>\nlet b = 2;\n</script>";
        let s = Suppressions::collect(src);
        assert!(s.is_suppressed("svelte/prefer-const", 6));
    }

    #[test]
    fn bare_enable_closes_all_open_disables() {
        let src = "<!-- eslint-disable -->\n{@html x}\n<!-- eslint-enable -->\n{@html y}";
        let s = Suppressions::collect(src);
        assert!(s.is_suppressed("svelte/no-at-html-tags", 2));
        assert!(!s.is_suppressed("svelte/no-at-html-tags", 4));
    }
}
