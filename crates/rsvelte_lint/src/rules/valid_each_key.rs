//! `svelte/valid-each-key` — enforce that a `{#each}` key references at least
//! one variable defined by the each block itself (the `as` context destructuring
//! pattern or the index identifier). A key built only from outer/script
//! variables (or an `{@const}` declared inside the block body) does not vary per
//! item and so cannot distinguish rows.
//!
//! Port of the eslint-plugin-svelte rule. Upstream uses a scope engine; we have
//! no scope engine here, so this is a pragmatic text-based analysis: collect the
//! identifier tokens introduced by the each block (context + index), then check
//! whether any of them appears in the key source as a real (non-member-access)
//! reference. Over-inclusion of candidate names is acceptable — it can only make
//! a key "valid", matching upstream's conservative intent for these fixtures.

use rsvelte_core::ast::template::EachBlock;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/valid-each-key",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce keys to use variables defined in the `{#each}` block",
    options_schema: None,
};

const MESSAGE: &str = "Expected key to use the variables which are defined by the `{#each}` block.";

/// Is `c` a character that can appear inside a JS identifier?
fn is_ident_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_' || c == '$'
}

/// Is `c` a character that can START a JS identifier?
fn is_ident_start(c: char) -> bool {
    c.is_ascii_alphabetic() || c == '_' || c == '$'
}

/// Collect every JS identifier token in `src` (regex-free char scan).
fn collect_identifiers(src: &str) -> Vec<String> {
    let bytes: Vec<char> = src.chars().collect();
    let mut out = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        if is_ident_start(bytes[i]) {
            let start = i;
            i += 1;
            while i < bytes.len() && is_ident_char(bytes[i]) {
                i += 1;
            }
            out.push(bytes[start..i].iter().collect());
        } else {
            i += 1;
        }
    }
    out
}

/// Does `name` occur in `key` as a whole-identifier reference (not a member
/// property access `.name`, and not part of a longer identifier)?
fn occurs_as_reference(key: &str, name: &str) -> bool {
    if name.is_empty() {
        return false;
    }
    let key_bytes = key.as_bytes();
    let name_bytes = name.as_bytes();
    let mut search_from = 0;
    while let Some(rel) = key[search_from..].find(name) {
        let at = search_from + rel;
        let end = at + name_bytes.len();
        // Char immediately before must not be an identifier char and not a `.`.
        let before_ok = if at == 0 {
            true
        } else {
            // Walk back to the start of the previous UTF-8 char.
            let mut p = at - 1;
            while p > 0 && (key_bytes[p] & 0b1100_0000) == 0b1000_0000 {
                p -= 1;
            }
            let prev = key[p..at].chars().next().unwrap_or(' ');
            !is_ident_char(prev) && prev != '.'
        };
        // Char immediately after must not be an identifier char.
        let after_ok = match key[end..].chars().next() {
            Some(c) => !is_ident_char(c),
            None => true,
        };
        if before_ok && after_ok {
            return true;
        }
        search_from = at + 1;
    }
    false
}

#[derive(Default)]
pub struct ValidEachKey;

impl Rule for ValidEachKey {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_each(&self, ctx: &mut LintContext, block: &EachBlock) {
        // No key → nothing to validate.
        let Some(key) = &block.key else {
            return;
        };
        let (Some(key_start), Some(key_end)) = (key.start(), key.end()) else {
            return;
        };

        // Collect the binding names introduced by the each block.
        let mut bindings: Vec<String> = Vec::new();
        if let Some(context) = &block.context
            && let (Some(cs), Some(ce)) = (context.start(), context.end())
        {
            bindings.extend(collect_identifiers(ctx.slice(cs, ce)));
        }
        if let Some(index) = &block.index {
            bindings.push(index.as_str().to_string());
        }

        let key_src = ctx.slice(key_start, key_end);

        let valid = bindings
            .iter()
            .any(|name| occurs_as_reference(key_src, name));
        if !valid {
            ctx.report(key_start, key_end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn collects_destructure_identifiers() {
        let ids = collect_identifiers("{ id, name }");
        assert_eq!(ids, vec!["id".to_string(), "name".to_string()]);
        assert_eq!(collect_identifiers("thing"), vec!["thing".to_string()]);
    }

    #[test]
    fn reference_detection() {
        // whole-token reference
        assert!(occurs_as_reference("thing.id", "thing"));
        assert!(occurs_as_reference("id", "id"));
        assert!(occurs_as_reference("foo + thing.id", "thing"));
        assert!(occurs_as_reference("fn(thing)", "thing"));
        assert!(occurs_as_reference("`thing_id=${thing.id}`", "thing"));
    }

    #[test]
    fn rejects_member_and_substring() {
        // `.id` member access is not a reference to `id`.
        assert!(!occurs_as_reference("thing.id", "id"));
        // substring of a longer identifier is not a reference.
        assert!(!occurs_as_reference("thing_id", "thing"));
        assert!(!occurs_as_reference("thing_id", "id"));
        // unrelated name.
        assert!(!occurs_as_reference("foo", "thing"));
    }
}
