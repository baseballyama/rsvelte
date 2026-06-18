//! `svelte/sort-attributes` — enforce a configured attribute order on start
//! tags, reporting and fixing out-of-order attributes.
//!
//! Option (`options[0]`, an object):
//! - `order` — array of order entries; each entry is one of:
//!   - a string (`"id"`, `"/^class:/u"`, …) — matches a single pattern.
//!   - an array of strings — matches any of the listed patterns (group).
//!   - `{ match: string | string[], sort: "alphabetical" | "ignore" }` — a
//!     group with explicit sort within the group.
//!
//! Patterns that look like `/regex/flags` are treated as regular expressions;
//! plain strings match exactly (`/^string$/`). A leading `!` negates the
//! pattern. Attributes that don't match any pattern are ignored.
//!
//! The algorithm mirrors upstream's two-pass approach:
//! 1. For each non-spread attribute (in order), find the first "valid previous"
//!    attribute that is already in the right position. If the compare says the
//!    previous should come AFTER the current, report.
//! 2. When a spread attribute exists between the invalid node and the
//!    invalidating previous node, fall back to `verifyForSpreadAttributeExist`.
//!
//! The fix for a reported node `node` (that should go before `previousNode`)
//! rotates the slice `[previousNode, …, node]` left by one: each element in
//! that slice is replaced with the text of the next element, so `node` ends up
//! where `previousNode` was.
//!
//! Port of `eslint-plugin-svelte/src/rules/sort-attributes.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'layout'`.

use regex::Regex;

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};
use crate::rules::find_this_attr_span;

static META: RuleMeta = RuleMeta {
    name: "svelte/sort-attributes",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce order of attributes",
    options_schema: Some(
        r#"[{"type":"object","properties":{"order":{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"array","items":{"type":"string"},"uniqueItems":true,"minItems":1},{"type":"object","properties":{"match":{"anyOf":[{"type":"string"},{"type":"array","items":{"type":"string"},"uniqueItems":true,"minItems":1}]},"sort":{"enum":["alphabetical","ignore"]}},"required":["match","sort"],"additionalProperties":false}]},"uniqueItems":true,"additionalItems":false},"alphabetical":{"type":"boolean"}},"additionalProperties":false}]"#,
    ),
};

// ─── Pattern / option compilation ────────────────────────────────────────────

/// A single compiled pattern (from a string entry in the order array).
struct Pattern {
    negative: bool,
    re: Regex,
}

impl Pattern {
    fn matches(&self, s: &str) -> bool {
        self.re.is_match(s)
    }
}

/// A compiled group (one entry in the order array).
struct Group {
    patterns: Vec<Pattern>,
    sort: Sort,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Sort {
    Alphabetical,
    Ignore,
}

/// Compile a single pattern string into a `Pattern`.
///
/// If the string matches `/pattern/flags`, it becomes a regex.
/// A leading `!` means negation.
/// Otherwise it matches exactly (`^exact$`).
fn compile_pattern(p: &str) -> Option<Pattern> {
    let (negative, rest) = if let Some(stripped) = p.strip_prefix('!') {
        (true, stripped)
    } else {
        (false, p)
    };

    let re = if let Some(inner) = to_regex(rest) {
        inner
    } else {
        // Exact match
        Regex::new(&format!("^{}$", regex::escape(rest))).ok()?
    };
    Some(Pattern { negative, re })
}

/// Convert a `/pattern/flags` string to a `Regex`, returning `None` for plain
/// strings (which should be compiled as exact matchers by the caller).
fn to_regex(s: &str) -> Option<Regex> {
    if !s.starts_with('/') {
        return None;
    }
    let s = s.strip_prefix('/')?;
    // Find the last `/` that ends the pattern, then collect flags.
    let last_slash = s.rfind('/')?;
    let pattern = &s[..last_slash];
    let flags = &s[last_slash + 1..];
    // Build a regex with the given flags.
    let mut builder = regex::RegexBuilder::new(pattern);
    for flag in flags.chars() {
        match flag {
            'i' => {
                builder.case_insensitive(true);
            }
            // 'u' is the default in Rust's regex crate.
            'u' => {}
            _ => {}
        }
    }
    builder.build().ok()
}

/// Compile a group's match spec (string or string[]) into a list of `Pattern`s.
fn compile_patterns(spec: &serde_json::Value) -> Vec<Pattern> {
    let strings: Vec<&str> = match spec {
        serde_json::Value::String(s) => vec![s.as_str()],
        serde_json::Value::Array(arr) => arr.iter().filter_map(|v| v.as_str()).collect(),
        _ => vec![],
    };
    strings.into_iter().filter_map(compile_pattern).collect()
}

/// Compile an order entry into a `Group`.
fn compile_group(entry: &serde_json::Value) -> Option<Group> {
    match entry {
        serde_json::Value::String(s) => {
            let pat = compile_pattern(s)?;
            Some(Group {
                patterns: vec![pat],
                sort: Sort::Ignore,
            })
        }
        serde_json::Value::Array(arr) => {
            let patterns: Vec<Pattern> = arr
                .iter()
                .filter_map(|v| v.as_str())
                .filter_map(compile_pattern)
                .collect();
            if patterns.is_empty() {
                None
            } else {
                Some(Group {
                    patterns,
                    sort: Sort::Ignore,
                })
            }
        }
        serde_json::Value::Object(obj) => {
            let match_spec = obj.get("match")?;
            let sort_str = obj.get("sort").and_then(|v| v.as_str()).unwrap_or("ignore");
            let sort = if sort_str == "alphabetical" {
                Sort::Alphabetical
            } else {
                Sort::Ignore
            };
            let patterns = compile_patterns(match_spec);
            if patterns.is_empty() {
                None
            } else {
                Some(Group { patterns, sort })
            }
        }
        _ => None,
    }
}

/// Determine whether a set of patterns matches a key string.
/// If the first pattern is negative, the result starts as `true` (matches
/// unless excluded); otherwise starts as `false` (doesn't match until included).
fn patterns_match(patterns: &[Pattern], key: &str) -> bool {
    if patterns.is_empty() {
        return false;
    }
    let mut result = patterns[0].negative; // start value
    for pat in patterns {
        if result != pat.negative {
            // Current result can't be changed by this pattern's direction — skip.
            continue;
        }
        if pat.matches(key) {
            result = !pat.negative;
        }
    }
    result
}

/// The compiled option: a list of groups (in order).
struct CompiledOption {
    groups: Vec<Group>,
}

impl CompiledOption {
    /// Whether the key is ignored (not matched by any group).
    fn ignore(&self, key: &str) -> bool {
        !self.groups.iter().any(|g| patterns_match(&g.patterns, key))
    }

    /// Compare two keys: negative = `a` comes before `b`, positive = `b` before
    /// `a`, zero = same group / same key.
    ///
    /// Mirrors upstream `compare(a, b)`:
    /// - Walk groups; find first group that matches `a` and/or `b`.
    /// - If both match: if sort=alphabetical, compare lexicographically; else 0.
    /// - If only `a` matches: -1.
    /// - If only `b` matches: +1.
    fn compare(&self, a: &str, b: &str) -> i32 {
        for g in &self.groups {
            let ma = patterns_match(&g.patterns, a);
            let mb = patterns_match(&g.patterns, b);
            if ma && mb {
                if g.sort == Sort::Alphabetical {
                    return if a == b {
                        0
                    } else if a < b {
                        -1
                    } else {
                        1
                    };
                }
                return 0;
            }
            if ma {
                return -1;
            }
            if mb {
                return 1;
            }
        }
        // Should not happen if both keys are in some group.
        0
    }
}

/// Default ORDER list (mirrors `DEFAULT_ORDER` from upstream).
const DEFAULT_ORDER_JSON: &str = r#"[
    "this",
    "bind:this",
    "id",
    "name",
    "slot",
    { "match": "/^--/u", "sort": "alphabetical" },
    ["style", "/^style:/u"],
    "class",
    { "match": "/^class:/u", "sort": "alphabetical" },
    { "match": ["!/:/u", "!/^(?:this|id|name|style|class)$/u", "!/^--/u"], "sort": "alphabetical" },
    ["/^bind:/u", "!bind:this", "/^on:/u"],
    { "match": "/^use:/u", "sort": "alphabetical" },
    { "match": "/^transition:/u", "sort": "alphabetical" },
    { "match": "/^in:/u", "sort": "alphabetical" },
    { "match": "/^out:/u", "sort": "alphabetical" },
    { "match": "/^animate:/u", "sort": "alphabetical" },
    { "match": "/^let:/u", "sort": "alphabetical" }
]"#;

fn load_compiled_option(ctx: &LintContext) -> CompiledOption {
    let order_val: Option<serde_json::Value> = ctx.option0().and_then(|v| v.get("order")).cloned();

    let entries: Vec<serde_json::Value> = if let Some(serde_json::Value::Array(arr)) = order_val {
        arr
    } else {
        serde_json::from_str(DEFAULT_ORDER_JSON).unwrap_or_default()
    };

    let groups: Vec<Group> = entries.iter().filter_map(compile_group).collect();
    CompiledOption { groups }
}

// ─── Key text extraction ──────────────────────────────────────────────────────

/// Get the attribute key text for an attribute, mirroring upstream's
/// `getAttributeKeyText`. Returns `None` for spread attributes (ignored).
fn attr_key_text(_src: &str, a: &Attribute) -> Option<String> {
    match a {
        // SpreadAttribute: ignored by the sort algorithm.
        Attribute::SpreadAttribute(_) => None,
        // AttachTag: key is "@attach" (upstream `SvelteAttachTag` → `'@attach'`).
        Attribute::AttachTag(_) => Some("@attach".to_string()),
        // Regular attribute: key is the name.
        Attribute::Attribute(n) => Some(n.name.as_str().to_string()),
        // Bind directive: `bind:name`.
        Attribute::BindDirective(n) => Some(format!("bind:{}", n.name.as_str())),
        // On directive: `on:name`.
        Attribute::OnDirective(n) => Some(format!("on:{}", n.name.as_str())),
        // Class directive: `class:name`.
        Attribute::ClassDirective(n) => Some(format!("class:{}", n.name.as_str())),
        // Style directive: `style:name`.
        Attribute::StyleDirective(n) => Some(format!("style:{}", n.name.as_str())),
        // Transition directive: intro+outro → `transition:`, intro only → `in:`,
        // outro only → `out:`.
        Attribute::TransitionDirective(n) => {
            let prefix = if n.intro && n.outro {
                "transition"
            } else if n.intro {
                "in"
            } else {
                "out"
            };
            Some(format!("{}:{}", prefix, n.name.as_str()))
        }
        // Animate directive: `animate:name`.
        Attribute::AnimateDirective(n) => Some(format!("animate:{}", n.name.as_str())),
        // Use directive: `use:name`.
        Attribute::UseDirective(n) => Some(format!("use:{}", n.name.as_str())),
        // Let directive: `let:name`.
        Attribute::LetDirective(n) => Some(format!("let:{}", n.name.as_str())),
    }
}

/// A lightweight representation of one attribute for the sort algorithm —
/// decoupled from the AST so we can inject the virtual `this` attribute for
/// `<svelte:component>` / `<svelte:element>` without mutating the AST.
struct SortEntry {
    /// The sort key (e.g. `"bind:value"`, `"class:foo"`, `"@attach"`).
    /// `None` means spread — ignored by the sort algorithm.
    key: Option<String>,
    /// Start byte offset of the attribute in source.
    start: u32,
    /// End byte offset of the attribute in source (may include trailing WS for
    /// some directive types).
    end: u32,
    /// Whether this is a spread attribute.
    spread: bool,
    /// Whether this is a plain `Attribute::Attribute` node (governs the
    /// spread-between escape hatch, mirroring upstream's `isSvelteAttribute`).
    is_plain_attr: bool,
}

impl SortEntry {
    fn from_attr(src: &str, a: &Attribute) -> Self {
        let key = attr_key_text(src, a);
        let (start, end) = attr_range(a);
        let spread = matches!(a, Attribute::SpreadAttribute(_));
        let is_plain_attr = matches!(a, Attribute::Attribute(_));
        SortEntry {
            key,
            start,
            end,
            spread,
            is_plain_attr,
        }
    }
}

/// Get the start and end byte offsets for an attribute.
fn attr_range(a: &Attribute) -> (u32, u32) {
    match a {
        Attribute::Attribute(n) => (n.start, n.end),
        Attribute::SpreadAttribute(n) => (n.start, n.end),
        Attribute::AttachTag(n) => (n.start, n.end),
        Attribute::BindDirective(n) => (n.start, n.end),
        Attribute::OnDirective(n) => (n.start, n.end),
        Attribute::ClassDirective(n) => (n.start, n.end),
        Attribute::StyleDirective(n) => (n.start, n.end),
        Attribute::TransitionDirective(n) => (n.start, n.end),
        Attribute::AnimateDirective(n) => (n.start, n.end),
        Attribute::UseDirective(n) => (n.start, n.end),
        Attribute::LetDirective(n) => (n.start, n.end),
    }
}

// ─── Fix construction ─────────────────────────────────────────────────────────

/// Build the fix: left-rotate the slice `[prev_idx .. node_idx]` so `node`
/// moves to `prev_idx`'s position. Mirrors upstream's `fix(fixer)`:
///
/// ```ts
/// const previousNodes = attributes.slice(prev, node);
/// const moveNodes = [node, ...previousNodes];
/// return moveNodes.map((moveNode, index) => {
///   const text = sourceCode.getText(moveNode);
///   return fixer.replaceText(previousNodes[index] || node, text);
/// });
/// ```
///
/// The result is: `attrs[prev] ← node, attrs[prev+1] ← attrs[prev], …,
/// attrs[node] ← attrs[node-1]`.
///
/// To make the runner's overlap-detection work the same way ESLint does
/// (treating each Fix as an atomic unit that is either fully accepted or
/// fully rejected when it overlaps another fix), we emit one single TextEdit
/// covering the whole span from `attrs[prev_idx].start` to
/// `attrs[node_idx].end`. The content is the correct rotated text with the
/// original inter-attribute whitespace preserved between each pair.
fn build_fix(src: &str, entries: &[SortEntry], prev_idx: usize, node_idx: usize) -> Fix {
    // Collect raw attribute texts (may include trailing whitespace, as some
    // directive types include it in their `end` offset).
    let raw_texts: Vec<&str> = (prev_idx..=node_idx)
        .map(|i| {
            let e = &entries[i];
            src.get(e.start as usize..e.end as usize).unwrap_or("")
        })
        .collect();

    // Strip trailing whitespace from each text so we can reconstruct the
    // separators correctly.
    let trimmed: Vec<&str> = raw_texts
        .iter()
        .map(|t| t.trim_end_matches(|c: char| c.is_ascii_whitespace()))
        .collect();

    // The separator between entry[i] and entry[i+1] is the text from the end of
    // trimmed[i] to the start of entry[i+1]. This captures the trailing
    // whitespace included in entry[i]'s range plus any gap to the next entry.
    let n = trimmed.len() - 1; // = node_idx - prev_idx
    let seps: Vec<&str> = (0..n)
        .map(|k| {
            let i = prev_idx + k;
            let text_end = entries[i].start as usize + trimmed[k].len();
            let sj = entries[i + 1].start as usize;
            src.get(text_end..sj).unwrap_or(" ")
        })
        .collect();

    // After rotation, the order of attribute texts is:
    //   trimmed[n], seps[0], trimmed[0], seps[1], trimmed[1], …, seps[n-1], trimmed[n-1]
    //
    // We do NOT include trailing whitespace of the last element in the fix range or
    // new_text. This mirrors the upstream JS rule's behaviour of emitting one
    // `fixer.replaceText(node, text)` per attribute (using the node's own range which
    // does NOT include trailing inter-attribute whitespace). The merged fix range in
    // ESLint's applyFixes therefore ends at the last attribute's trimmed end, leaving
    // the trailing whitespace untouched — so the next attribute's fix (which starts
    // right at the gap character) does NOT conflict.
    let mut new_text = String::new();
    new_text.push_str(trimmed[n]);
    for k in 0..n {
        new_text.push_str(seps[k]);
        new_text.push_str(trimmed[k]);
    }

    // The fix end is the trimmed end of the last attribute (= start + trimmed_len),
    // NOT entries[node_idx].end (which may include trailing whitespace).
    let last_trimmed_end = entries[node_idx].start + trimmed[n].len() as u32;

    Fix {
        message: "Sort attributes".to_string(),
        edits: vec![TextEdit {
            start: entries[prev_idx].start,
            end: last_trimmed_end,
            new_text,
        }],
    }
}

// ─── Rule implementation ──────────────────────────────────────────────────────

#[derive(Default)]
pub struct SortAttributes;

impl SortAttributes {
    /// Core sort-check, operating on a pre-built list of `SortEntry` values.
    fn check_entries(&self, ctx: &mut LintContext, entries: &[SortEntry]) {
        if entries.len() < 2 {
            return;
        }
        let src = ctx.source().to_string();
        let opt = load_compiled_option(ctx);

        // valid_previous_nodes: indices of non-spread, non-ignored entries already
        // visited in valid order.
        let mut valid_previous: Vec<usize> = Vec::new();

        for i in 0..entries.len() {
            let entry = &entries[i];
            if entry.spread {
                // Upstream skips spreads without resetting valid_previous.
                continue;
            }
            let key = match &entry.key {
                Some(k) => k.clone(),
                None => continue,
            };
            if opt.ignore(&key) {
                continue;
            }

            // Find the first valid_previous that should come AFTER current key.
            let invalid_prev = valid_previous.iter().find(|&&pi| {
                let prev_key = entries[pi].key.as_deref().unwrap_or("");
                opt.compare(prev_key, &key) > 0
            });

            if let Some(&prev_idx) = invalid_prev {
                let current_key = key.clone();
                let prev_key = entries[prev_idx].key.as_deref().unwrap_or("").to_string();

                // Check whether there's a spread attribute between prev_idx and i.
                let has_spread_between = entries[prev_idx..i].iter().any(|e| e.spread);

                if !entry.is_plain_attr || !has_spread_between {
                    // Standard report + fix.
                    let fix = build_fix(&src, entries, prev_idx, i);
                    ctx.report_with_fix(
                        entry.start,
                        entry.end,
                        format!("Attribute '{current_key}' should go before '{prev_key}'."),
                        fix,
                    );
                } else {
                    // Spread exists between; use the "spread" verification:
                    // only compare against attributes between the last spread
                    // before `i` and `i`.
                    self.verify_for_spread(ctx, &src, entries, &opt, i);
                }
                // Skip adding to valid_previous (we already reported).
                continue;
            }

            valid_previous.push(i);
        }
    }

    /// Build a `Vec<SortEntry>` from a regular attribute slice.
    fn entries_from_attrs(src: &str, attributes: &[Attribute]) -> Vec<SortEntry> {
        attributes
            .iter()
            .map(|a| SortEntry::from_attr(src, a))
            .collect()
    }

    fn check_tag(&self, ctx: &mut LintContext, attributes: &[Attribute]) {
        let src = ctx.source().to_string();
        let entries = Self::entries_from_attrs(&src, attributes);
        self.check_entries(ctx, &entries);
    }

    /// Verify an attribute when spread attributes exist between it and some
    /// previous node (mirrors upstream `verifyForSpreadAttributeExist`).
    ///
    /// Only considers entries between the last spread before `node_idx` and
    /// `node_idx` itself, and only reports when a preceding entry in that window
    /// should come AFTER the current one.
    fn verify_for_spread(
        &self,
        ctx: &mut LintContext,
        src: &str,
        entries: &[SortEntry],
        opt: &CompiledOption,
        node_idx: usize,
    ) {
        // Find the last spread attribute before node_idx.
        let last_spread = entries[..node_idx].iter().rposition(|e| e.spread);

        let window_start = match last_spread {
            Some(s) => s + 1,
            None => 0,
        };

        // Collect previous valid nodes in the window [window_start, node_idx).
        let mut prev_nodes: Vec<usize> = Vec::new();
        for (j, entry) in entries[window_start..node_idx].iter().enumerate() {
            if entry.spread {
                break;
            }
            prev_nodes.push(window_start + j);
        }

        let key = match &entries[node_idx].key {
            Some(k) => k.clone(),
            None => return,
        };

        // Find the invalid previous.
        let invalid_prev = prev_nodes.iter().find(|&&pi| {
            let prev_key = entries[pi].key.as_deref().unwrap_or("");
            if opt.ignore(prev_key) {
                return false;
            }
            opt.compare(prev_key, &key) > 0
        });

        if let Some(&prev_idx) = invalid_prev {
            let prev_key = entries[prev_idx].key.as_deref().unwrap_or("").to_string();
            let fix = build_fix(src, entries, prev_idx, node_idx);
            ctx.report_with_fix(
                entries[node_idx].start,
                entries[node_idx].end,
                format!("Attribute '{key}' should go before '{prev_key}'."),
                fix,
            );
        }
    }

    /// Build entries for `<svelte:component>`, injecting a virtual `this` entry
    /// at the position it appears in the source (before its raw `this={...}` attribute
    /// was stripped out by the parser into `el.expression`).
    fn entries_for_svelte_component(src: &str, el: &SvelteComponentElement) -> Vec<SortEntry> {
        let src_bytes = src.as_bytes();
        let mut entries: Vec<SortEntry> = el
            .attributes
            .iter()
            .map(|a| SortEntry::from_attr(src, a))
            .collect();

        // Reconstruct the `this=` attribute span from `el.expression`.
        if let (Some(expr_start), Some(expr_end)) = (el.expression.start(), el.expression.end())
            && let Some((this_start, this_end)) =
                find_this_attr_span(src_bytes, expr_start, expr_end)
        {
            let this_entry = SortEntry {
                key: Some("this".to_string()),
                start: this_start,
                end: this_end,
                spread: false,
                is_plain_attr: true,
            };
            // Insert at the correct source-order position.
            let pos = entries
                .iter()
                .position(|e| e.start > this_start)
                .unwrap_or(entries.len());
            entries.insert(pos, this_entry);
        }
        entries
    }

    /// Build entries for `<svelte:element>`, injecting a virtual `this` entry
    /// at the position it appears in the source.
    fn entries_for_svelte_dynamic_element(src: &str, el: &SvelteDynamicElement) -> Vec<SortEntry> {
        let src_bytes = src.as_bytes();
        let mut entries: Vec<SortEntry> = el
            .attributes
            .iter()
            .map(|a| SortEntry::from_attr(src, a))
            .collect();

        if let (Some(expr_start), Some(expr_end)) = (el.tag.start(), el.tag.end())
            && let Some((this_start, this_end)) =
                find_this_attr_span(src_bytes, expr_start, expr_end)
        {
            let this_entry = SortEntry {
                key: Some("this".to_string()),
                start: this_start,
                end: this_end,
                spread: false,
                is_plain_attr: true,
            };
            let pos = entries
                .iter()
                .position(|e| e.start > this_start)
                .unwrap_or(entries.len());
            entries.insert(pos, this_entry);
        }
        entries
    }
}

impl Rule for SortAttributes {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_tag(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_tag(ctx, &c.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        self.check_tag(ctx, &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        let src = ctx.source().to_string();
        let entries = Self::entries_for_svelte_component(&src, el);
        self.check_entries(ctx, &entries);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        let src = ctx.source().to_string();
        let entries = Self::entries_for_svelte_dynamic_element(&src, el);
        self.check_entries(ctx, &entries);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        self.check_tag(ctx, &el.attributes);
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        self.check_tag(ctx, &el.attributes);
    }
}
