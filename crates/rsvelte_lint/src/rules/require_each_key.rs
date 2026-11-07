//! `svelte/require-each-key`.
//!
//! `svelte/require-each-key` — require a key on `{#each}` blocks. Keyed each
//! blocks let Svelte preserve component state and DOM identity across reorders.
//! Port of the eslint-plugin-svelte rule (pure-syntactic).

use rsvelte_core::ast::template::EachBlock;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-each-key",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require keyed `{#each}` blocks",
    options_schema: None,
};

#[derive(Default)]
pub struct RequireEachKey;

impl Rule for RequireEachKey {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_each(&self, ctx: &mut LintContext, block: &EachBlock) {
        // A keyless block is fine; so is the binding-less `{#each expr}` form
        // (no `as` context), matching eslint-plugin-svelte which exempts
        // `node.context == null`.
        if block.key.is_some() || block.context.is_none() {
            return;
        }
        // Upstream ends the report at the token after `index ?? context`: the
        // opening tag's closing brace.
        let end = block
            .context
            .as_ref()
            .and_then(|context| context.end())
            .and_then(|context_end| {
                opening_brace_end(ctx.source(), context_end as usize, block.index.is_some())
            })
            .unwrap_or(block.end.max(block.start));
        ctx.report(block.start, end, "Each block should have a key");
    }
}

fn skip_trivia(bytes: &[u8], mut i: usize) -> usize {
    loop {
        while i < bytes.len() && bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        if bytes[i..].starts_with(b"/*") {
            match bytes[i + 2..].windows(2).position(|w| w == b"*/") {
                Some(p) => i += 2 + p + 2,
                None => return bytes.len(),
            }
        } else if bytes[i..].starts_with(b"//") {
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
        } else {
            return i;
        }
    }
}

/// End offset of the token after the context pattern (and the `, index`
/// binding when present).
fn opening_brace_end(source: &str, context_end: usize, has_index: bool) -> Option<u32> {
    let bytes = source.as_bytes();
    let mut i = skip_trivia(bytes, context_end);
    if has_index {
        if bytes.get(i) != Some(&b',') {
            return None;
        }
        i = skip_trivia(bytes, i + 1);
        let ident_start = i;
        while i < bytes.len()
            && !bytes[i].is_ascii_whitespace()
            && !matches!(bytes[i], b'}' | b'/' | b'(' | b',')
        {
            i += 1;
        }
        if i == ident_start {
            return None;
        }
        i = skip_trivia(bytes, i);
    }
    (bytes.get(i) == Some(&b'}'))
        .then(|| u32::try_from(i + 1).ok())
        .flatten()
}
