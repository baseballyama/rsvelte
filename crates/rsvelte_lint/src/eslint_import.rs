//! `--config-from-eslint` — statically read `svelte/*` rule severities out of
//! an existing `eslint.config.js` / `.mjs` flat config, so an ESLint-migrating
//! project keeps its severities with zero re-authoring (design doc §D course
//! correction 3).
//!
//! This is a *static* extraction: we parse the config with OXC and walk every
//! `ObjectExpression` for a `rules` property, collecting string-keyed entries
//! that start with `svelte/`. Computed keys, spreads, and `extends` references
//! that can only be resolved by executing the config are skipped (and reported
//! as not-imported by the caller, which still falls back to the recommended
//! preset for everything else).

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    ArrayExpressionElement, Expression, ObjectExpression, ObjectPropertyKind, PropertyKey,
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::SourceType;

use crate::rule::Severity;

thread_local! {
    static ESLINT_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Extract `(rule_id, severity)` pairs for the `svelte/*` namespace from a flat
/// config source. Returns an empty vec on parse failure.
pub fn import_svelte_rules(source: &str) -> Vec<(String, Severity)> {
    ESLINT_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let rules = extract(&allocator, source);
        *cell.borrow_mut() = allocator;
        rules
    })
}

fn extract(allocator: &Allocator, source: &str) -> Vec<(String, Severity)> {
    // Flat configs are usually ESM (`export default [...]`); retry as a script
    // (CJS `module.exports = [...]`) if the module parse errors.
    for source_type in [SourceType::mjs(), SourceType::cjs()] {
        let ret = Parser::new(allocator, source, source_type).parse();
        if ret.diagnostics.is_empty() {
            let mut collector = Collector { rules: Vec::new() };
            collector.visit_program(&ret.program);
            return collector.rules;
        }
    }
    Vec::new()
}

struct Collector {
    rules: Vec<(String, Severity)>,
}

impl<'a> Visit<'a> for Collector {
    fn visit_object_expression(&mut self, obj: &ObjectExpression<'a>) {
        for prop in &obj.properties {
            let ObjectPropertyKind::ObjectProperty(prop) = prop else {
                continue;
            };
            if prop.computed || property_key_name(&prop.key) != Some("rules") {
                continue;
            }
            if let Expression::ObjectExpression(rules_obj) = &prop.value {
                self.collect_rules(rules_obj);
            }
        }
        walk::walk_object_expression(self, obj);
    }
}

impl Collector {
    fn collect_rules(&mut self, rules_obj: &ObjectExpression) {
        for prop in &rules_obj.properties {
            let ObjectPropertyKind::ObjectProperty(prop) = prop else {
                continue;
            };
            if prop.computed {
                continue;
            }
            let Some(key) = property_key_name(&prop.key) else {
                continue;
            };
            if !key.starts_with("svelte/") {
                continue;
            }
            if let Some(sev) = severity_of(&prop.value) {
                self.rules.push((key.to_string(), sev));
            }
        }
    }
}

/// The static name of a property key (identifier or string literal).
fn property_key_name<'a>(key: &'a PropertyKey<'a>) -> Option<&'a str> {
    match key {
        PropertyKey::StaticIdentifier(id) => Some(id.name.as_str()),
        _ => key.as_expression().and_then(|e| match e {
            Expression::StringLiteral(s) => Some(s.value.as_str()),
            _ => None,
        }),
    }
}

/// A rule value is either a severity scalar or `[severity, ...options]`.
fn severity_of(expr: &Expression) -> Option<Severity> {
    match expr {
        Expression::NumericLiteral(n) => Severity::parse(&(n.value as i64).to_string()),
        Expression::StringLiteral(s) => Severity::parse(s.value.as_str()),
        Expression::ArrayExpression(arr) => match arr.elements.first() {
            Some(ArrayExpressionElement::SpreadElement(_)) | None => None,
            Some(el) => el.as_expression().and_then(severity_of),
        },
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_svelte_rules_from_flat_config() {
        let src = r#"
            import svelte from 'eslint-plugin-svelte';
            export default [
                { rules: { 'svelte/no-at-html-tags': 'error', 'no-console': 'warn' } },
                { files: ['*.svelte'], rules: { 'svelte/button-has-type': ['warn', { submit: false }] } },
            ];
        "#;
        let mut rules = import_svelte_rules(src);
        rules.sort_by(|a, b| a.0.cmp(&b.0));
        assert_eq!(
            rules,
            vec![
                ("svelte/button-has-type".to_string(), Severity::Warn),
                ("svelte/no-at-html-tags".to_string(), Severity::Error),
            ]
        );
    }

    #[test]
    fn numeric_severities_and_cjs() {
        let src = "module.exports = [{ rules: { 'svelte/require-each-key': 0 } }];";
        let rules = import_svelte_rules(src);
        assert_eq!(
            rules,
            vec![("svelte/require-each-key".to_string(), Severity::Off)]
        );
    }

    #[test]
    fn ignores_non_svelte_and_unparseable() {
        assert!(import_svelte_rules("this is not valid <<< js").is_empty());
        assert!(import_svelte_rules("export default [{ rules: { 'no-console': 2 } }];").is_empty());
    }
}
