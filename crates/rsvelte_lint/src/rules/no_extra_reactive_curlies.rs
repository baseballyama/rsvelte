//! `svelte/no-extra-reactive-curlies` — disallow wrapping a single reactive
//! statement in curly braces (`$: { foo = bar; }`). A reactive block with just
//! one statement doesn't need the braces. Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. A `$:`
//! reactive statement is a `LabeledStatement` whose label is `$`; the rule
//! flags one whose body is a `BlockStatement` with exactly one statement,
//! reporting at the block. The upstream fix is suggestion-only (not an autofix):
//! it strips the braces by removing `{`-plus-leading-whitespace before the inner
//! statement and trailing-whitespace-plus-`}` after it — mirroring upstream's
//! two `removeRange` edits over the token range.

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-extra-reactive-curlies",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Disallow wrapping single reactive statements in curly braces",
    options_schema: None,
};

const MESSAGE: &str = "Do not wrap reactive statements in curly braces unless necessary.";
const SUGGEST_DESC: &str = "Remove the unnecessary curly braces.";

/// Build the two brace-stripping edits for a `{ … }` block spanning
/// `[block_start, block_end)` (where `block_start` is the `{` and `block_end-1`
/// is the `}`): remove `{` + leading whitespace up to the first inner token, and
/// remove trailing whitespace after the last inner token up to `}`.
fn strip_brace_edits(source: &str, block_start: u32, block_end: u32) -> Option<Vec<TextEdit>> {
    let bytes = source.as_bytes();
    let (bs, be) = (block_start as usize, block_end as usize);
    if bs >= be || be > bytes.len() || bytes[bs] != b'{' || bytes[be - 1] != b'}' {
        return None;
    }
    // First non-whitespace byte after `{`.
    let mut first = bs + 1;
    while first < be - 1 && bytes[first].is_ascii_whitespace() {
        first += 1;
    }
    // Position just past the last non-whitespace byte before `}`.
    let mut last_end = be - 1;
    while last_end > first && bytes[last_end - 1].is_ascii_whitespace() {
        last_end -= 1;
    }
    Some(vec![
        TextEdit {
            start: block_start,
            end: first as u32,
            new_text: String::new(),
        },
        TextEdit {
            start: last_end as u32,
            end: block_end,
            new_text: String::new(),
        },
    ])
}

#[derive(Default)]
pub struct NoExtraReactiveCurlies;

impl ScriptRule for NoExtraReactiveCurlies {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("LabeledStatement") {
                return;
            }
            if node
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
                != Some("$")
            {
                return;
            }
            let Some(body) = node.get("body") else { return };
            if node_type(body) != Some("BlockStatement") {
                return;
            }
            let one_stmt = body
                .get("body")
                .and_then(Value::as_array)
                .is_some_and(|b| b.len() == 1);
            if !one_stmt {
                return;
            }
            if let (Some(s), Some(e)) = (node_start(body), node_end(body)) {
                reports.push((s, e));
            }
        });

        for (start, end) in reports {
            match strip_brace_edits(ctx.source(), start, end) {
                Some(edits) => ctx.report_with_suggestions(
                    start,
                    end,
                    MESSAGE,
                    vec![Suggestion {
                        desc: SUGGEST_DESC.to_string(),
                        fix: Fix {
                            message: SUGGEST_DESC.to_string(),
                            edits,
                        },
                    }],
                ),
                None => ctx.report(start, end, MESSAGE),
            }
        }
    }
}
