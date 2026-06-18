//! `svelte/no-add-event-listener` — warn against the use of `addEventListener`.
//!
//! Port of eslint-plugin-svelte's `no-add-event-listener` rule. In Svelte 5 the
//! recommended way to attach DOM event listeners is the `on` function from
//! `svelte/events` (which respects the component lifecycle), so any direct use of
//! `addEventListener` should be flagged.
//!
//! Runs over the `<script>` (instance / module) ESTree program via the
//! [`ScriptRule`] hook.
//!
//! A `CallExpression` is reported when its callee is either:
//!   - a non-computed `MemberExpression` whose property is an `Identifier`
//!     named `addEventListener` (e.g. `el.addEventListener(...)`), or
//!   - a bare `Identifier` named `addEventListener` (e.g. `addEventListener(...)`,
//!     i.e. the global on `window`).
//!
//! The finding is reported at the `CallExpression` node start so the column
//! matches upstream.
//!
//! ## Suggestion
//!
//! When an open parenthesis can be located in the source immediately after the
//! callee (skipping whitespace and comments), one suggestion is offered:
//!
//! - desc: `"Use \`on\` from \`svelte/events\` instead"`
//! - edits:
//!   1. Replace `[callee.start, callee.end)` with `"on"` (i.e. replace the
//!      whole callee — `window.addEventListener` or bare `addEventListener` —
//!      with `on`).
//!   2. Insert `"<target>, "` right after the `(` (at byte position `paren + 1`).
//!      For a `MemberExpression` callee, `<target>` is the source text of the
//!      object (everything before `.addEventListener`). For a bare `addEventListener`
//!      identifier, `<target>` is the literal string `"window"`.
//!
//! This mirrors upstream's `fixer.replaceText(callee, 'on')` +
//! `fixer.insertTextAfter(openParen, \`${target}, \`)`.

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

const MESSAGE: &str =
    "Do not use `addEventListener`. Use the `on` function from `svelte/events` instead.";
const SUGGEST_DESC: &str = "Use `on` from `svelte/events` instead";

static META: RuleMeta = RuleMeta {
    name: "svelte/no-add-event-listener",
    category: RuleCategory::Style,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Warns against the use of `addEventListener`",
    options_schema: None,
};

/// Collected data for one `addEventListener` call during the AST walk.
/// All spans are UTF-8 byte offsets into the source file.
struct Report {
    /// Start of the full `CallExpression` node — used as the diagnostic span.
    call_start: u32,
    /// End of the full `CallExpression` node — used as the diagnostic span end.
    call_end: u32,
    /// Start of the callee node — first byte to replace with `"on"`.
    callee_start: u32,
    /// End of the callee node — last byte to replace; also the start of the
    /// search for the open-parenthesis token.
    callee_end: u32,
    /// For a `MemberExpression` callee: `Some((object.start, object.end))` so
    /// the target text can be extracted from the source after the walk.
    /// For a bare `addEventListener` identifier: `None` (target is `"window"`).
    obj_span: Option<(u32, u32)>,
}

#[derive(Default)]
pub struct NoAddEventListener;

impl ScriptRule for NoAddEventListener {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut reports: Vec<Report> = Vec::new();
        walk_js(program, |node, _ancestors| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let Some(callee) = node.get("callee") else {
                return;
            };

            let Some(entry) = collect_callee_spans(callee) else {
                return;
            };
            let Some(call_start) = node_start(node) else {
                return;
            };
            let Some(call_end) = node_end(node) else {
                return;
            };

            reports.push(Report {
                call_start,
                call_end,
                callee_start: entry.0,
                callee_end: entry.1,
                obj_span: entry.2,
            });
        });

        // Filter out cases where the callee was wrapped in a TypeScript type
        // assertion (`(expr as T)(...)` or `<T>expr(...)`). In rsvelte the
        // TS cast is stripped from the AST so the inner `MemberExpression`
        // is exposed as the callee — but the oracle (espree/TS parser) sees a
        // `TSAsExpression` callee and does NOT flag it.
        //
        // Detection: if the CallExpression starts before the (stripped) callee
        // AND the source byte at the call start is `(`, AND the source slice
        // from callee_end onwards (before the next `)` that closes the cast)
        // contains the keyword `as ` — it was a TS cast.
        let reports: Vec<Report> = reports
            .into_iter()
            .filter(|r| !is_ts_cast_stripped_callee(ctx.source(), r.call_start, r.callee_end))
            .collect();

        for r in reports {
            // Resolve the target text from source now that we hold `&mut ctx`.
            let target = match r.obj_span {
                Some((s, e)) => ctx.slice(s, e).to_string(),
                None => "window".to_string(),
            };

            // Locate the open-paren token: scan forward from callee_end through
            // whitespace and block-comments until we hit '('. This mirrors
            // ESLint's `getTokenAfter(callee)`.
            let paren_pos = find_open_paren(ctx.source(), r.callee_end);

            let suggestions = if let Some(paren) = paren_pos {
                // Edit 1: replace the callee with `on`.
                let edit_callee = TextEdit {
                    start: r.callee_start,
                    end: r.callee_end,
                    new_text: "on".to_string(),
                };
                // Edit 2: insert `<target>, ` right after the '('.
                let after_paren = paren + 1;
                let edit_args = TextEdit {
                    start: after_paren,
                    end: after_paren,
                    new_text: format!("{target}, "),
                };
                vec![Suggestion {
                    desc: SUGGEST_DESC.to_string(),
                    fix: Fix {
                        message: SUGGEST_DESC.to_string(),
                        edits: vec![edit_callee, edit_args],
                    },
                }]
            } else {
                Vec::new()
            };

            ctx.report_with_suggestions(r.call_start, r.call_end, MESSAGE, suggestions);
        }
    }
}

/// Collect byte-offset spans from a callee node that targets `addEventListener`.
/// Returns `None` if the callee does not match.
///
/// Return value is `(callee_start, callee_end, object_span)` where
/// `object_span` is `Some((obj_start, obj_end))` for a `MemberExpression`
/// callee (the span of the object before `.addEventListener`) or `None` for a
/// bare `addEventListener` identifier (target is the literal `"window"`).
fn collect_callee_spans(callee: &Value) -> Option<(u32, u32, Option<(u32, u32)>)> {
    match node_type(callee)? {
        "MemberExpression" => {
            // Computed member expressions (`obj["addEventListener"]`) are not matched.
            if callee.get("computed").and_then(Value::as_bool) == Some(true) {
                return None;
            }
            let property = callee.get("property")?;
            if node_type(property) != Some("Identifier") {
                return None;
            }
            if property.get("name").and_then(Value::as_str) != Some("addEventListener") {
                return None;
            }
            let object = callee.get("object")?;
            let obj_start = node_start(object)?;
            let obj_end = node_end(object)?;
            let callee_start = node_start(callee)?;
            let callee_end = node_end(callee)?;
            Some((callee_start, callee_end, Some((obj_start, obj_end))))
        }
        "Identifier" => {
            if callee.get("name").and_then(Value::as_str) != Some("addEventListener") {
                return None;
            }
            let callee_start = node_start(callee)?;
            let callee_end = node_end(callee)?;
            Some((callee_start, callee_end, None))
        }
        _ => None,
    }
}

/// Scan `source` forward from byte offset `from` to find the byte offset of the
/// first `(` character, skipping ASCII whitespace and `/* … */` block comments.
/// Line comments (`// …`) are not skipped because they cannot appear between a
/// callee and its argument list without a newline, and a newline between them
/// would be an ASI opportunity making the `(` the start of a new expression —
/// the upstream tool relies on the parser having already handled that.
///
/// Returns `None` if no `(` is found before the end of the source.
fn find_open_paren(source: &str, from: u32) -> Option<u32> {
    let bytes = source.as_bytes();
    let mut i = from as usize;
    while i < bytes.len() {
        match bytes[i] {
            b' ' | b'\t' | b'\r' | b'\n' => {
                i += 1;
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                // Skip block comment `/* … */`.
                i += 2;
                loop {
                    if i + 1 >= bytes.len() {
                        return None; // unterminated comment
                    }
                    if bytes[i] == b'*' && bytes[i + 1] == b'/' {
                        i += 2;
                        break;
                    }
                    i += 1;
                }
            }
            b'(' => return Some(i as u32),
            _ => return None, // unexpected character — no open paren found
        }
    }
    None
}

/// Detect whether a CallExpression whose callee spans `[callee_end..]` was
/// wrapped in a TypeScript type assertion (`(expr as T)(...)`) that was
/// stripped by rsvelte's TS-stripping. The oracle (espree/TS-parser) would see a
/// `TSAsExpression` as the callee and NOT report it, but rsvelte's AST strips
/// the cast, exposing the inner `MemberExpression`.
///
/// Heuristic: if the source at `call_start` is `(` AND the text from
/// `callee_end` up to (and including) the matching `)` contains `as `, the
/// callee was a TS `as`-cast.
fn is_ts_cast_stripped_callee(source: &str, call_start: u32, callee_end: u32) -> bool {
    let bytes = source.as_bytes();
    let call_pos = call_start as usize;
    let callee_end_pos = callee_end as usize;

    // The call must start with `(` and there must be bytes before callee_end.
    if call_pos >= callee_end_pos {
        return false;
    }
    if bytes.get(call_pos) != Some(&b'(') {
        return false;
    }

    // Look for `as ` (or `as\t`, `as\n`) between callee_end and the first `)`.
    let mut i = callee_end_pos;
    while i < bytes.len() && bytes[i] != b')' {
        if bytes[i] == b'a'
            && bytes.get(i + 1) == Some(&b's')
            && bytes.get(i + 2).is_some_and(|c| c.is_ascii_whitespace())
        {
            return true;
        }
        i += 1;
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// Helper: check whether a callee node matches `addEventListener`. Adapts
    /// `collect_callee_spans` so existing tests keep their assertion shape.
    fn is_add_event_listener_callee(callee: &Value) -> bool {
        collect_callee_spans(callee).is_some()
    }

    #[test]
    fn matches_member_property() {
        let callee = json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "window", "start": 0, "end": 6 },
            "property": { "type": "Identifier", "name": "addEventListener", "start": 7, "end": 23 },
            "start": 0,
            "end": 23
        });
        assert!(is_add_event_listener_callee(&callee));
    }

    #[test]
    fn matches_bare_identifier() {
        let callee =
            json!({ "type": "Identifier", "name": "addEventListener", "start": 0, "end": 16 });
        assert!(is_add_event_listener_callee(&callee));
    }

    #[test]
    fn rejects_computed_member() {
        let callee = json!({
            "type": "MemberExpression",
            "computed": true,
            "object": { "type": "Identifier", "name": "window", "start": 0, "end": 6 },
            "property": { "type": "Literal", "value": "addEventListener", "start": 7, "end": 25 },
            "start": 0,
            "end": 25
        });
        assert!(!is_add_event_listener_callee(&callee));
    }

    #[test]
    fn rejects_other_property() {
        let callee = json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "window", "start": 0, "end": 6 },
            "property": { "type": "Identifier", "name": "removeEventListener", "start": 7, "end": 26 },
            "start": 0,
            "end": 26
        });
        assert!(!is_add_event_listener_callee(&callee));
    }

    #[test]
    fn rejects_other_identifier() {
        let callee = json!({ "type": "Identifier", "name": "on", "start": 0, "end": 2 });
        assert!(!is_add_event_listener_callee(&callee));
    }

    /// Verify the open-paren scanner handles whitespace and block comments.
    #[test]
    fn find_open_paren_skips_whitespace_and_comments() {
        let src = "fn    /* foo */(arg)";
        // "fn" is 2 bytes; search from offset 2
        assert_eq!(find_open_paren(src, 2), Some(15));

        let src2 = "fn(arg)";
        assert_eq!(find_open_paren(src2, 2), Some(2));

        let src3 = "fn    (arg)";
        assert_eq!(find_open_paren(src3, 2), Some(6));

        // Unexpected character before '(' → None
        let src4 = "fn.bar(arg)";
        assert_eq!(find_open_paren(src4, 2), None);
    }
}
