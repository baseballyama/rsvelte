//! `svelte/valid-each-key` — enforce that a `{#each}` key references at least
//! one variable defined by the each block itself (the `as` context destructuring
//! pattern or the index identifier). A key built only from outer/script
//! variables (or an `{@const}` declared inside the block body) does not vary per
//! item and so cannot distinguish rows.
//!
//! Port of the eslint-plugin-svelte rule, which is scope-based: it collects the
//! variables *defined by* the each block and asks whether any of them is
//! *referenced* inside the key. Both halves are resolved here through oxc
//! semantic analysis rather than by matching identifier text, because the two
//! sides disagree wherever a name occurs without being a binding or a
//! reference — a renamed destructuring key (`{ id: renamed }`), a
//! default-value expression (`{ id = fallback }`), a name shadowed by an inner
//! function parameter, a name inside a string or a non-interpolated template
//! literal, and a name used as an object property key.

use std::collections::HashSet;

use rsvelte_core::ast::template::EachBlock;

use crate::compiler_scope::resolve_script_scope;
use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/valid-each-key",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce keys to use variables defined in the `{#each}` block",
    options_schema: None,
};

const MESSAGE: &str = "Expected key to use the variables which are defined by the `{#each}` block.";

/// The names bound by an `{#each … as <pattern>}` context pattern, resolved by
/// declaring the pattern in an isolated program: only real binding positions
/// become root-scope symbols, so a property key or a default-value expression
/// is left out.
fn pattern_bindings(pattern_src: &str) -> Vec<String> {
    let src = format!("let {pattern_src} = 0;");
    resolve_script_scope(&src, true).root_binding_names
}

/// The names a key expression *reads* from its surrounding scope. Parsed on its
/// own, every such read is an unresolved reference; anything the key itself
/// binds (an arrow parameter, say) resolves locally and is excluded, as are
/// property keys, member property names and literal text, which are not
/// references at all.
fn key_free_names(key_src: &str) -> HashSet<String> {
    let src = format!("({key_src});");
    resolve_script_scope(&src, true)
        .unresolved_references
        .into_iter()
        .map(|r| r.name)
        .collect()
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

        // The variables the each block itself defines.
        let mut bindings: Vec<String> = Vec::new();
        if let Some(context) = &block.context
            && let (Some(cs), Some(ce)) = (context.start(), context.end())
        {
            bindings.extend(pattern_bindings(ctx.slice(cs, ce)));
        }
        if let Some(index) = &block.index {
            bindings.push(index.as_str().to_string());
        }
        if bindings.is_empty() {
            ctx.report(key_start, key_end, MESSAGE);
            return;
        }

        let free = key_free_names(ctx.slice(key_start, key_end));
        if !bindings.iter().any(|name| free.contains(name)) {
            ctx.report(key_start, key_end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bindings(src: &str) -> Vec<String> {
        let mut b = pattern_bindings(src);
        b.sort();
        b
    }

    fn free(src: &str) -> Vec<String> {
        let mut f: Vec<String> = key_free_names(src).into_iter().collect();
        f.sort();
        f
    }

    #[test]
    fn destructuring_binds_the_value_not_the_property_key() {
        assert_eq!(bindings("{ id: renamed }"), vec!["renamed".to_string()]);
        assert_eq!(bindings("thing"), vec!["thing".to_string()]);
        assert_eq!(
            bindings("[a, ...rest]"),
            vec!["a".to_string(), "rest".to_string()]
        );
    }

    #[test]
    fn a_default_value_expression_is_not_a_binding() {
        assert_eq!(bindings("{ id = fallback }"), vec!["id".to_string()]);
    }

    #[test]
    fn key_reads_exclude_member_and_property_names() {
        assert_eq!(free("item.id"), vec!["item".to_string()]);
        assert_eq!(
            free("JSON.stringify({ item: outer })"),
            vec!["JSON".to_string(), "outer".to_string()]
        );
    }

    #[test]
    fn key_reads_exclude_literal_text_and_shadowed_params() {
        assert!(free("map['item']").iter().all(|n| n != "item"));
        assert!(free("`thing`").is_empty());
        assert_eq!(
            free("keys.map((item) => item * 2)[0]"),
            vec!["keys".to_string()]
        );
    }

    #[test]
    fn key_reads_see_template_interpolation() {
        assert_eq!(
            free("`${prefix}-${item.id}`"),
            vec!["item".to_string(), "prefix".to_string()]
        );
    }
}
