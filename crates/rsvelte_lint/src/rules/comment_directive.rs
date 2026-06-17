//! `svelte/comment-directive` — support ESLint comment-directives in the HTML
//! template and (with `reportUnusedDisableDirectives`) report directives that
//! never suppressed anything. Port of the eslint-plugin-svelte rule and its
//! `CommentDirectives` helper (`src/rules/comment-directive.ts`,
//! `src/shared/comment-directives.ts`).
//!
//! ## What this ports
//!
//! In eslint-plugin-svelte this rule does two jobs: it *applies* suppression
//! (filtering messages disabled by `<!-- eslint-disable … -->` directives) and,
//! when `reportUnusedDisableDirectives` is on, it *reports* directives that were
//! never used. In rsvelte the actual message suppression already lives in
//! [`crate::suppression`] (always-on, covering both `eslint-disable*` and
//! `svelte-ignore`), so the net-new behaviour ported here is the
//! **unused-directive reporting**.
//!
//! The unused detection is a faithful port of upstream's `filterMessages`: every
//! parsed directive becomes a candidate "unused" report; the candidate reports
//! plus all other rules' findings are run through the enable/disable resolution
//! (`is_enable`) and a block-enable pre-pass, which together compute the set of
//! *used* directive locations; a candidate survives iff its own directive
//! location is not in that set. Crucially this means a bare `<!-- eslint-disable
//! -->` suppresses comment-directive's *own* later reports (because they sit
//! after the directive), which in turn marks the directive used — exactly the
//! upstream emit-all-then-filter flow.
//!
//! ### Known divergences
//! - Template comments are located by scanning the source for `<!-- … -->`
//!   rather than walking `SvelteHTMLComment` AST nodes, so a literal `<!--`
//!   inside a `<script>`/`<style>` string would be misread as a directive
//!   comment (vanishingly rare).
//! - `<script>` start tags are likewise located by source scan to reproduce
//!   upstream's per-script "enable all" boundary.

use std::collections::HashSet;

use serde_json::Value;

use crate::diagnostic::LintDiagnostic;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/comment-directive",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "support comment-directives in HTML template",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "reportUnusedDisableDirectives": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

/// Whether the `reportUnusedDisableDirectives` option is enabled in `options`
/// (the variadic options array — `[ { reportUnusedDisableDirectives: bool } ]`).
pub fn report_unused_enabled(options: Option<&Value>) -> bool {
    options
        .and_then(|o| o.as_array())
        .and_then(|a| a.first())
        .and_then(|v| v.get("reportUnusedDisableDirectives"))
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

/// `(line, column)` — 1-based line, 0-based UTF-16 column, matching
/// [`LineIndex::position`]. Compared lexicographically, mirroring upstream's
/// `comparePos`.
type Pos = (u32, u32);

#[derive(Clone, Copy, PartialEq, Eq)]
enum BlockKind {
    Disable,
    Enable,
}

/// A block-scoped directive (`eslint-disable` / `eslint-enable`) or the synthetic
/// per-`<script>` "enable all" boundary.
struct BlockDir {
    /// Resolution position: the comment *end* for a disable, the comment *start*
    /// for an enable (mirrors upstream `disableBlock(comment.loc.end)` /
    /// `enableBlock(comment.loc.start)`).
    loc: Pos,
    /// `None` ⇒ all rules (the `ALL` token).
    target: Option<String>,
    kind: BlockKind,
    /// The directive's *define* location key — what `usedDirectives` is keyed on.
    key: Pos,
}

/// A line-scoped directive (`eslint-disable-line` / `eslint-disable-next-line`).
struct LineDir {
    /// The line it disables (the comment line, or the next line for
    /// `-next-line`).
    line: u32,
    target: Option<String>,
    key: Pos,
}

/// A candidate "unused" report, emitted only if its directive is never used.
struct Candidate {
    /// The report's message position used by `is_enable` — `(line, column+1)`
    /// because ESLint's report-translator stores 1-based message columns.
    msg: Pos,
    /// The directive define key (used to test membership in the used-set).
    key: Pos,
    /// Byte span of the emitted diagnostic.
    start: u32,
    end: u32,
    message: String,
    /// The rule this directive targets (`None` ⇒ wildcard / all rules). Used to
    /// suppress unused-reports for rules rsvelte does not implement — for those
    /// the absence of a finding is uninformative (e.g. core ESLint `no-undef`),
    /// so reporting them as "unused" would be a false positive.
    target: Option<String>,
}

/// A message fed to the enable/disable resolution: either a real finding or a
/// candidate unused-report.
struct Msg {
    line: u32,
    /// 1-based column (`column0 + 1`), matching ESLint message columns.
    col1: u32,
    /// `Some(rule)` for a finding / the candidate marker `svelte/comment-directive`.
    rule: String,
    /// Index into the candidates vec when this message *is* a candidate report.
    candidate: Option<usize>,
}

/// Compute the unused-directive diagnostics for `source`.
///
/// `findings` are the pre-suppression diagnostics from every other rule, as
/// `(line, column0, rule_id)`. The returned diagnostics carry `severity` and
/// should be emitted *after* suppression filtering so the directives don't
/// suppress their own reports.
pub fn unused_directive_diagnostics(
    source: &str,
    line_index: &LineIndex,
    findings: &[(u32, u32, String)],
    severity: Severity,
    is_implemented: &dyn Fn(&str) -> bool,
) -> Vec<LintDiagnostic> {
    let mut blocks: Vec<BlockDir> = Vec::new();
    let mut lines: Vec<LineDir> = Vec::new();
    let mut candidates: Vec<Candidate> = Vec::new();

    parse_directives(source, line_index, &mut blocks, &mut lines, &mut candidates);
    add_script_enable_boundaries(source, line_index, &mut blocks);

    if candidates.is_empty() {
        return Vec::new();
    }

    // Compute the used-directive set, mirroring `filterMessages`.
    let mut used: HashSet<Pos> = HashSet::new();

    // Block-enable pre-pass: an enable directive is "used" when a later (lower)
    // disable cancels it. Walk blocks high→low; track open enables.
    {
        let mut order: Vec<&BlockDir> = blocks.iter().collect();
        order.sort_by_key(|b| std::cmp::Reverse(b.loc)); // descending by loc
        let mut open_enables: Vec<&BlockDir> = Vec::new();
        for b in order {
            match b.kind {
                BlockKind::Enable => {
                    if b.target.is_none() {
                        open_enables.clear();
                    }
                    open_enables.push(b);
                }
                BlockKind::Disable => {
                    if b.target.is_none() {
                        for e in &open_enables {
                            used.insert(e.key);
                        }
                        open_enables.clear();
                    } else {
                        let mut kept = Vec::new();
                        for e in open_enables.drain(..) {
                            if e.target == b.target || e.target.is_none() {
                                used.insert(e.key);
                            } else {
                                kept.push(e);
                            }
                        }
                        open_enables = kept;
                    }
                }
            }
        }
    }

    // Build the message list: every finding plus every candidate report.
    let mut messages: Vec<Msg> = Vec::with_capacity(findings.len() + candidates.len());
    for (line, col0, rule) in findings {
        messages.push(Msg {
            line: *line,
            col1: col0 + 1,
            rule: rule.clone(),
            candidate: None,
        });
    }
    for (i, c) in candidates.iter().enumerate() {
        messages.push(Msg {
            line: c.msg.0,
            col1: c.msg.1,
            rule: META.name.to_string(),
            candidate: Some(i),
        });
    }

    // `is_enable` pass: each surviving candidate is a potential unused report;
    // suppressed messages (including comment-directive's own reports) mark their
    // suppressing directive used.
    let mut surviving: Vec<usize> = Vec::new();
    for m in &messages {
        if is_enable(m, &blocks, &lines, &mut used)
            && let Some(i) = m.candidate
        {
            surviving.push(i);
        }
    }

    // A candidate is reported iff its own directive location is not used, and —
    // for a directive that targets a *named* rule — only when rsvelte actually
    // implements that rule. For an unimplemented target (e.g. core ESLint
    // `no-undef`) the absence of a finding tells us nothing, so reporting it as
    // unused would be a false positive; ESLint, which evaluates that rule, can
    // judge it. Wildcard directives (`target: None`) keep the finding-based
    // approximation.
    surviving
        .into_iter()
        .filter(|&i| !used.contains(&candidates[i].key))
        .filter(|&i| candidates[i].target.as_deref().is_none_or(is_implemented))
        .map(|i| {
            let c = &candidates[i];
            LintDiagnostic {
                rule: META.name.to_string(),
                severity,
                message: c.message.clone(),
                start: c.start,
                end: c.end,
                help: None,
                fix: None,
                suggestions: Vec::new(),
            }
        })
        .collect()
}

/// Whether `m` is *kept* (not suppressed). Mutates `used` to record the first
/// directive that suppresses `m`. Faithful port of upstream `isEnable`.
fn is_enable(m: &Msg, blocks: &[BlockDir], lines: &[LineDir], used: &mut HashSet<Pos>) -> bool {
    // Line directives: named targets first (upstream `getFromRule` order), then
    // wildcard. First match wins.
    if let Some(d) = lines
        .iter()
        .find(|d| d.line == m.line && d.target.as_deref() == Some(m.rule.as_str()))
        .or_else(|| {
            lines
                .iter()
                .find(|d| d.line == m.line && d.target.is_none())
        })
    {
        used.insert(d.key);
        return false;
    }

    // Block directives matching this rule (named or wildcard), resolved
    // high→low so the nearest preceding directive wins.
    let mut bs: Vec<&BlockDir> = blocks
        .iter()
        .filter(|b| b.target.as_deref() == Some(m.rule.as_str()) || b.target.is_none())
        .collect();
    bs.sort_by_key(|b| std::cmp::Reverse(b.loc)); // descending by loc
    for b in bs {
        // Skip directives positioned after the message (`comparePos < 0`).
        if (m.line, m.col1) < b.loc {
            continue;
        }
        match b.kind {
            BlockKind::Enable => return true,
            BlockKind::Disable => {
                used.insert(b.key);
                return false;
            }
        }
    }
    true
}

/// Scan `source` for `<!-- … -->` directive comments, populating the directive
/// and candidate lists.
fn parse_directives(
    source: &str,
    li: &LineIndex,
    blocks: &mut Vec<BlockDir>,
    lines: &mut Vec<LineDir>,
    candidates: &mut Vec<Candidate>,
) {
    let bytes = source.as_bytes();
    let mut i = 0;
    while i + 4 <= bytes.len() {
        if &bytes[i..i + 4] != b"<!--" {
            i += 1;
            continue;
        }
        // Find the closing `-->`.
        let inner_start = i + 4;
        let Some(rel) = find_subslice(&bytes[inner_start..], b"-->") else {
            break; // unterminated comment — nothing more to scan
        };
        let inner_end = inner_start + rel; // byte index of the `-->`
        let comment_end = inner_end + 3; // byte after `-->`
        let value = &source[inner_start..inner_end];

        parse_one_comment(
            source,
            li,
            i,
            comment_end,
            inner_start,
            value,
            blocks,
            lines,
            candidates,
        );

        i = comment_end;
    }
}

#[allow(clippy::too_many_arguments)]
fn parse_one_comment(
    source: &str,
    li: &LineIndex,
    comment_start: usize,
    comment_end: usize,
    inner_start: usize,
    value: &str,
    blocks: &mut Vec<BlockDir>,
    lines: &mut Vec<LineDir>,
    candidates: &mut Vec<Candidate>,
) {
    let text = strip_directive(value);
    let Some((dtype, start_index)) = match_keyword(text) else {
        return;
    };

    let comment_pos = li.position(comment_start as u32);
    let comment_end_pos = li.position(comment_end as u32);

    // Line directives must be single-line (upstream guard).
    let is_line = matches!(dtype, DType::DisableLine | DType::DisableNextLine);
    if is_line && comment_pos.0 != comment_end_pos.0 {
        return;
    }

    // Extract the rule tokens (absolute byte offset → position).
    let rules = extract_rules(text, inner_start, start_index, li);

    let kind_str = dtype.kind_str();
    match dtype {
        DType::Disable => {
            if rules.is_empty() {
                blocks.push(BlockDir {
                    loc: comment_end_pos,
                    target: None,
                    kind: BlockKind::Disable,
                    key: comment_pos,
                });
                candidates.push(Candidate {
                    msg: (comment_pos.0, comment_pos.1 + 1),
                    key: comment_pos,
                    start: comment_start as u32,
                    end: comment_end as u32,
                    message: msg_unused(kind_str),
                    target: None,
                });
            } else {
                for r in &rules {
                    blocks.push(BlockDir {
                        loc: comment_end_pos,
                        target: Some(r.id.clone()),
                        kind: BlockKind::Disable,
                        key: r.pos,
                    });
                    candidates.push(Candidate {
                        msg: (r.pos.0, r.pos.1 + 1),
                        key: r.pos,
                        start: r.start,
                        end: r.end,
                        message: msg_unused_rule(kind_str, &r.id),
                        target: Some(r.id.clone()),
                    });
                }
            }
        }
        DType::Enable => {
            if rules.is_empty() {
                blocks.push(BlockDir {
                    loc: comment_pos,
                    target: None,
                    kind: BlockKind::Enable,
                    key: comment_pos,
                });
                candidates.push(Candidate {
                    msg: (comment_pos.0, comment_pos.1 + 1),
                    key: comment_pos,
                    start: comment_start as u32,
                    end: comment_end as u32,
                    message: msg_unused_enable(kind_str),
                    target: None,
                });
            } else {
                for r in &rules {
                    blocks.push(BlockDir {
                        loc: comment_pos,
                        target: Some(r.id.clone()),
                        kind: BlockKind::Enable,
                        key: r.pos,
                    });
                    candidates.push(Candidate {
                        msg: (r.pos.0, r.pos.1 + 1),
                        key: r.pos,
                        start: r.start,
                        end: r.end,
                        message: msg_unused_enable_rule(kind_str, &r.id),
                        target: Some(r.id.clone()),
                    });
                }
            }
        }
        DType::DisableLine | DType::DisableNextLine => {
            let target_line = comment_pos.0
                + if matches!(dtype, DType::DisableNextLine) {
                    1
                } else {
                    0
                };
            if rules.is_empty() {
                lines.push(LineDir {
                    line: target_line,
                    target: None,
                    key: comment_pos,
                });
                candidates.push(Candidate {
                    msg: (comment_pos.0, comment_pos.1 + 1),
                    key: comment_pos,
                    start: comment_start as u32,
                    end: comment_end as u32,
                    message: msg_unused(kind_str),
                    target: None,
                });
            } else {
                for r in &rules {
                    lines.push(LineDir {
                        line: target_line,
                        target: Some(r.id.clone()),
                        key: r.pos,
                    });
                    candidates.push(Candidate {
                        msg: (r.pos.0, r.pos.1 + 1),
                        key: r.pos,
                        start: r.start,
                        end: r.end,
                        message: msg_unused_rule(kind_str, &r.id),
                        target: Some(r.id.clone()),
                    });
                }
            }
        }
    }
    let _ = source; // source already captured via byte offsets
}

/// A parsed rule token: its id, byte span, and start position.
struct RuleTok {
    id: String,
    start: u32,
    end: u32,
    pos: Pos,
}

/// Extract the comma/space-separated rule ids after `start_index` in `text`,
/// mirroring the `([^\s,]+)[\s,]*` token scan. `inner_start` is the byte offset
/// of `text`'s first char in the source.
fn extract_rules(
    text: &str,
    inner_start: usize,
    start_index: usize,
    li: &LineIndex,
) -> Vec<RuleTok> {
    let b = text.as_bytes();
    let mut out = Vec::new();
    let mut j = start_index;
    while j < b.len() {
        // Skip separators (whitespace / comma).
        while j < b.len() && is_separator(b[j]) {
            j += 1;
        }
        if j >= b.len() {
            break;
        }
        let tok_start = j;
        while j < b.len() && !is_separator(b[j]) {
            j += 1;
        }
        let id = &text[tok_start..j];
        let abs_start = (inner_start + tok_start) as u32;
        let abs_end = (inner_start + j) as u32;
        out.push(RuleTok {
            id: id.to_string(),
            start: abs_start,
            end: abs_end,
            pos: li.position(abs_start),
        });
    }
    out
}

/// The four directive flavours.
#[derive(Clone, Copy)]
enum DType {
    Disable,
    Enable,
    DisableLine,
    DisableNextLine,
}

impl DType {
    fn kind_str(self) -> &'static str {
        match self {
            DType::Disable => "eslint-disable",
            DType::Enable => "eslint-enable",
            DType::DisableLine => "eslint-disable-line",
            DType::DisableNextLine => "eslint-disable-next-line",
        }
    }
}

/// Match the leading directive keyword in `text`, returning the flavour and the
/// byte index just past the keyword (where rule-token scanning starts).
fn match_keyword(text: &str) -> Option<(DType, usize)> {
    let lead = leading_ws_len(text.as_bytes());
    let rest = &text[lead..];
    // Order matters: check longer `-line` forms before the block forms (the
    // block regex requires a whitespace/end boundary the `-line` forms lack).
    for (kw, dtype) in [
        ("eslint-disable-next-line", DType::DisableNextLine),
        ("eslint-disable-line", DType::DisableLine),
        ("eslint-disable", DType::Disable),
        ("eslint-enable", DType::Enable),
    ] {
        if let Some(after) = rest.strip_prefix(kw) {
            let ab = after.as_bytes();
            if ab.is_empty() || is_ws(ab[0]) {
                return Some((dtype, lead + kw.len()));
            }
        }
    }
    None
}

/// Strip the trailing `\s-{2,}\s …` description from a directive comment value.
fn strip_directive(value: &str) -> &str {
    let b = value.as_bytes();
    let mut i = 0;
    while i < b.len() {
        if is_ws(b[i]) {
            let mut j = i + 1;
            let mut dashes = 0;
            while j < b.len() && b[j] == b'-' {
                dashes += 1;
                j += 1;
            }
            if dashes >= 2 && j < b.len() && is_ws(b[j]) {
                return &value[..i];
            }
        }
        i += 1;
    }
    value
}

fn leading_ws_len(b: &[u8]) -> usize {
    let mut i = 0;
    while i < b.len() && is_ws(b[i]) {
        i += 1;
    }
    i
}

fn is_ws(c: u8) -> bool {
    matches!(c, b' ' | b'\t' | b'\n' | b'\r' | 0x0c | 0x0b)
}

fn is_separator(c: u8) -> bool {
    is_ws(c) || c == b','
}

/// Find the first occurrence of `needle` in `hay`, returning its start index.
fn find_subslice(hay: &[u8], needle: &[u8]) -> Option<usize> {
    if needle.is_empty() || hay.len() < needle.len() {
        return None;
    }
    (0..=hay.len() - needle.len()).find(|&k| &hay[k..k + needle.len()] == needle)
}

/// Add a synthetic "enable all" boundary at the end of each `<script …>` start
/// tag, matching upstream's per-`SvelteScriptElement` `enableBlock`.
fn add_script_enable_boundaries(source: &str, li: &LineIndex, blocks: &mut Vec<BlockDir>) {
    let b = source.as_bytes();
    let mut i = 0;
    while i + 7 <= b.len() {
        if &b[i..i + 7] != b"<script" {
            i += 1;
            continue;
        }
        // Require a tag boundary after `<script` (ws, `>`, or `/`).
        let next = b.get(i + 7).copied();
        if !matches!(next, Some(c) if is_ws(c) || c == b'>' || c == b'/') {
            i += 7;
            continue;
        }
        // Find the `>` ending the start tag, skipping quoted attribute values.
        let mut j = i + 7;
        let mut quote: Option<u8> = None;
        let mut end = None;
        while j < b.len() {
            let c = b[j];
            match quote {
                Some(q) => {
                    if c == q {
                        quote = None;
                    }
                }
                None => {
                    if c == b'"' || c == b'\'' {
                        quote = Some(c);
                    } else if c == b'>' {
                        end = Some(j + 1);
                        break;
                    }
                }
            }
            j += 1;
        }
        let Some(tag_end) = end else { break };
        blocks.push(BlockDir {
            loc: li.position(tag_end as u32),
            target: None,
            kind: BlockKind::Enable,
            key: li.position(i as u32),
        });
        i = tag_end;
    }
}

fn msg_unused(kind: &str) -> String {
    format!("Unused {kind} directive (no problems were reported).")
}
fn msg_unused_rule(kind: &str, rule: &str) -> String {
    format!("Unused {kind} directive (no problems were reported from '{rule}').")
}
fn msg_unused_enable(kind: &str) -> String {
    format!("Unused {kind} directive (reporting is not suppressed).")
}
fn msg_unused_enable_rule(kind: &str, rule: &str) -> String {
    format!("Unused {kind} directive (reporting from '{rule}' is not suppressed).")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_description() {
        assert_eq!(
            strip_directive(" eslint-disable -- desc "),
            " eslint-disable"
        );
        assert_eq!(
            strip_directive(" eslint-disable a, b -- desc "),
            " eslint-disable a, b"
        );
        assert_eq!(
            strip_directive(" eslint-disable a, b "),
            " eslint-disable a, b "
        );
    }

    #[test]
    fn keyword_matching() {
        assert!(matches!(
            match_keyword(" eslint-disable foo"),
            Some((DType::Disable, _))
        ));
        assert!(matches!(
            match_keyword(" eslint-disable-line foo"),
            Some((DType::DisableLine, _))
        ));
        assert!(matches!(
            match_keyword(" eslint-disable-next-line"),
            Some((DType::DisableNextLine, _))
        ));
        assert!(matches!(
            match_keyword(" eslint-enable"),
            Some((DType::Enable, _))
        ));
        // Not a boundary → no match.
        assert!(match_keyword(" eslint-disablexyz").is_none());
        assert!(match_keyword(" not-a-directive").is_none());
    }

    #[test]
    fn rule_token_extraction_skips_extra_separators() {
        let text = " eslint-disable a ,, , b/c";
        let (_, start) = match_keyword(text).unwrap();
        let li = LineIndex::new(text);
        let toks = extract_rules(text, 0, start, &li);
        let ids: Vec<&str> = toks.iter().map(|t| t.id.as_str()).collect();
        assert_eq!(ids, vec!["a", "b/c"]);
    }
}
