//! `svelte/no-add-event-listener` — warn against the use of `addEventListener`.
//!
//! Port of eslint-plugin-svelte's `no-add-event-listener` rule. In Svelte 5 the
//! recommended way to attach DOM event listeners is the `on` function from
//! `svelte/events` (which respects the component lifecycle), so any direct use of
//! `addEventListener` should be flagged.
//!
//! Components are checked once per file in `check_root` (both scripts plus
//! template-expression handlers); the `ScriptRule` pass covers standalone
//! modules.
//!
//! A `CallExpression` is reported when its callee is either:
//!   - a `MemberExpression` whose property is an `Identifier` named
//!     `addEventListener` (computed or not — mirrors upstream), or
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
//! - desc: `"Use on from svelte/events instead"`
//! - edits:
//!   1. Replace `[callee.start, callee.end)` with `"on"` (i.e. replace the
//!      whole callee — `window.addEventListener` or bare `addEventListener` —
//!      with `on`).
//!   2. Insert `"<target>, "` right after the `(` (at byte position `paren + 1`).
//!      For a `MemberExpression` callee, `<target>` is the source text of the
//!      object (everything before `.addEventListener`). For a bare `addEventListener`
//!      identifier, `<target>` is the literal string `"window"`.
//!
//! This mirrors upstream's `fixer.replaceText(callee, 'on')` and
//! `fixer.insertTextAfter(openParen, target)`.

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::handled_by_template_pass;
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

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

fn scan(tree: &Value, reports: &mut Vec<Report>) {
    walk_js(tree, |node, _ancestors| {
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
}

impl ScriptRule for NoAddEventListener {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        if handled_by_template_pass(ctx.filename()) {
            return;
        }
        let mut reports: Vec<Report> = Vec::new();
        scan(program.value(), &mut reports);
        emit(ctx, reports);
    }
}

impl Rule for NoAddEventListener {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let mut reports: Vec<Report> = Vec::new();
        for tree in [
            root_json.get("instance").and_then(|s| s.get("content")),
            root_json.get("module").and_then(|s| s.get("content")),
            root_json.get("fragment"),
        ]
        .into_iter()
        .flatten()
        {
            scan(tree, &mut reports);
        }
        emit(ctx, reports);
    }
}

fn emit(ctx: &mut LintContext, mut reports: Vec<Report>) {
    reports.sort_by_key(|r| r.call_start);
    reports.dedup_by_key(|r| r.call_start);
    {
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

            let suggestions = paren_pos.map_or_else(Vec::new, |paren| {
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
            });

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
            // Upstream matches on `callee.property.type === 'Identifier'` only,
            // so a computed Identifier access (`el[addEventListener]`) fires
            // while a Literal access (`el['addEventListener']`) does not.
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
/// first `(` character, skipping ASCII whitespace and comments — upstream's
/// `getTokenAfter(callee)` skips both kinds. A `//` comment can sit between a
/// callee and its argument list, because `(` continues the expression and so
/// blocks ASI.
///
/// Returns `None` when the next token is not `(`. Upstream has no such guard
/// (`no-add-event-listener.ts:46-58` names the token `openParen` but never
/// checks it), so on `el?.addEventListener?.(…)` its fixer inserts after the
/// `?.` and produces text no JS parser accepts; we decline instead.
fn find_open_paren(source: &str, from: u32) -> Option<u32> {
    let bytes = source.as_bytes();
    let mut i = from as usize;
    while i < bytes.len() {
        match bytes[i] {
            b' ' | b'\t' | b'\r' | b'\n' => {
                i += 1;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                i += 2;
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
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
            b'(' => return Some(u32::try_from(i).expect("source offsets are represented as u32")),
            _ => return None, // unexpected character — no open paren found
        }
    }
    None
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
