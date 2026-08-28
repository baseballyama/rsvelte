//! `svelte/no-at-const-tags` prefers `{const …}` over `{@const …}`.
//!
//! It ports the eslint-plugin-svelte rule and only fires in
//! runes mode (the upstream rule's `runes === true` gate), since preserving
//! reactivity outside runes mode would require `$derived(...)`, unavailable
//! there.
//!
//! Runes mode is resolved the way svelte-eslint-parser resolves it
//! (`svelte-parse-context.ts`): `<svelte:options runes={…}>` decides when
//! present, otherwise the component is in runes mode iff a rune symbol appears
//! as an `Identifier` anywhere in the scripts or template expressions. Reading
//! it off the AST is what keeps a rune name inside a comment, a string, or as
//! the prefix of a longer name (`$stateStore`) from deciding the gate.
//!
//! The autofix drops the `@` and wraps the initializer in `$derived(...)` to
//! preserve the reactivity legacy `{@const}` had — skipping the wrap when the
//! initializer is already a `$derived(…)` call. Upstream tests `callee.name ===
//! '$derived'` on an `Identifier` only, so `$derived.by(…)` is wrapped again;
//! that is reproduced rather than corrected.

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_whitespace::is_js_whitespace;
use crate::script::{node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-at-const-tags",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        // Upstream declares no runes condition and performs this check in the
        // rule body. Keep the metadata faithful and do the same below.
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Prefer `{const ...}` over legacy `{@const ...}`",
    options_schema: None,
};

const MESSAGE: &str = "Use `{const ...}` declaration tag instead of legacy `{@const ...}`.";

#[derive(Default)]
pub struct NoAtConstTags;

impl Rule for NoAtConstTags {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let json = ctx.root_json(root);
        if json.is_null() {
            return;
        }
        // `tag.start` points at the `{` of `{@const …}`.
        let mut tags: Vec<(u32, u32, Option<(u32, u32)>, bool)> = Vec::new();
        walk_js(&json, |node, _| {
            if node_type(node) == Some("ConstTag")
                && let (Some(start), Some(end)) = (node_start(node), node_end(node))
            {
                tags.push((start, end, init_span(node), init_is_derived_call(node)));
            }
        });
        if tags.is_empty() {
            return;
        }
        // Upstream declares no `runes` condition and gates in `create()`.
        if !crate::runes_mode::component_runes_mode(root, ctx.source()) {
            return;
        }
        tags.sort_unstable();
        // Upstream reports the whole `SvelteConstTag`, closing `}` included.
        for (start, end, init, already_derived) in tags {
            match build_fix(ctx.source(), start, init, already_derived) {
                Some(fix) => ctx.report_with_fix(start, end, MESSAGE, fix),
                None => ctx.report(start, end, MESSAGE),
            }
        }
    }
}

fn declarator(tag: &Value) -> Option<&Value> {
    tag.get("declaration")?
        .get("declarations")?
        .as_array()?
        .first()
}

fn init_span(tag: &Value) -> Option<(u32, u32)> {
    let init = declarator(tag)?.get("init")?;
    Some((node_start(init)?, init.get("end")?.as_u64()? as u32))
}

/// Upstream skips the `$derived(...)` wrap only for a call whose callee is the
/// *identifier* `$derived` — `$derived.by(…)` is a `MemberExpression` callee and
/// gets wrapped.
fn init_is_derived_call(tag: &Value) -> bool {
    let Some(init) = declarator(tag).and_then(|d| d.get("init")) else {
        return false;
    };
    node_type(init) == Some("CallExpression")
        && init.get("callee").is_some_and(|c| {
            node_type(c) == Some("Identifier")
                && c.get("name").and_then(Value::as_str) == Some("$derived")
        })
}

fn build_fix(
    source: &str,
    start: u32,
    init: Option<(u32, u32)>,
    already_derived: bool,
) -> Option<Fix> {
    // `{` then optional whitespace then `@`; anything else is not the shape the
    // fixer knows how to rewrite.
    let rest = source.get(start as usize + 1..)?;
    let ws: u32 = rest
        .chars()
        .take_while(|c| is_js_whitespace(*c))
        .map(|c| c.len_utf8() as u32)
        .sum();
    let at = start + 1 + ws;
    if source.as_bytes().get(at as usize) != Some(&b'@') {
        return None;
    }
    let mut edits = vec![TextEdit {
        start: at,
        end: at + 1,
        new_text: String::new(),
    }];
    if let Some((init_start, init_end)) = init
        && !already_derived
    {
        edits.push(TextEdit {
            start: init_start,
            end: init_start,
            new_text: "$derived(".into(),
        });
        edits.push(TextEdit {
            start: init_end,
            end: init_end,
            new_text: ")".into(),
        });
    }
    Some(Fix {
        message: MESSAGE.into(),
        edits,
    })
}
