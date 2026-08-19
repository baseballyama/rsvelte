//! `svelte/no-inspect` — warn against use of the `$inspect` rune.
//!
//! Upstream visits every `Identifier` node named `$inspect` and reports it —
//! including member properties (`$inspect.trace`, `holder.$inspect`) and
//! non-computed property keys (`{ $inspect: 1 }`), because they are all
//! `Identifier` nodes in the ESTree.
//!
//! Port of the eslint-plugin-svelte rule.
//!
//! Dual-registered: the [`ScriptRule`] pass covers `<script>` programs and
//! standalone `.svelte.(js|ts)` modules; the template [`Rule`] pass covers
//! `$inspect` in template expressions (event handlers, mustache tags).
//!
//! "Every `Identifier`" reaches further than the serialized program does, so the
//! script pass tops it up from a direct parse — see `recovered_spans`.

use std::collections::HashSet;

use oxc_allocator::Allocator;
use oxc_ast::ast::{BindingIdentifier, IdentifierName, IdentifierReference, LabelIdentifier};
use oxc_ast_visit::Visit;
use oxc_parser::Parser;
use oxc_span::SourceType;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-inspect",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    // Upstream gates it on `runes: [true, 'undetermined']`, so a definitely
    // non-runes component must not be linted.
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Warns against the use of `$inspect` directive",
    options_schema: None,
};

const MESSAGE: &str = "Do not use $inspect directive";

fn is_inspect_ident(node: &Value) -> bool {
    node_type(node) == Some("Identifier")
        && node.get("name").and_then(Value::as_str) == Some("$inspect")
}

/// Collects every `$inspect` identifier span of a re-parsed script.
#[derive(Default)]
struct InspectSpans {
    base: u32,
    spans: Vec<(u32, u32)>,
}

impl InspectSpans {
    fn push(&mut self, name: &str, span: oxc_span::Span) {
        if name == "$inspect" {
            self.spans
                .push((self.base + span.start, self.base + span.end));
        }
    }
}

impl<'a> Visit<'a> for InspectSpans {
    fn visit_identifier_name(&mut self, it: &IdentifierName<'a>) {
        self.push(&it.name, it.span);
    }

    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        self.push(&it.name, it.span);
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        self.push(&it.name, it.span);
    }

    fn visit_label_identifier(&mut self, it: &LabelIdentifier<'a>) {
        self.push(&it.name, it.span);
    }
}

/// `$inspect` occurrences the serialized program cannot carry: the typed script
/// AST has no `TSTypeAliasDeclaration` node at all, and a `FunctionDeclaration`
/// statement drops its rest parameter and its return-type annotation — so a
/// direct parse is the only way to see them. Only positions the program JSON
/// missed entirely are added, so the multiplicity it already reports (a
/// shorthand `{ $inspect }` is two ESTree Identifiers at one span) is untouched.
fn recovered_spans(source: &str, program: &Value, seen: &HashSet<(u32, u32)>) -> Vec<(u32, u32)> {
    let (Some(base), Some(end)) = (node_start(program), node_end(program)) else {
        return Vec::new();
    };
    if base > end || end as usize > source.len() {
        return Vec::new();
    }
    let body = &source[base as usize..end as usize];
    if !body.contains("$inspect") {
        return Vec::new();
    }
    let allocator = Allocator::default();
    // TS is a superset of the script grammar here, but a few JS shapes (`a < b > (c)`)
    // parse differently, so fall back rather than trust an errored parse.
    let mut collector = InspectSpans {
        base,
        spans: Vec::new(),
    };
    for source_type in [SourceType::ts().with_module(true), SourceType::mjs()] {
        let parsed = Parser::new(&allocator, body, source_type).parse();
        if parsed.diagnostics.is_empty() {
            collector.visit_program(&parsed.program);
            break;
        }
    }
    collector.spans.retain(|span| !seen.contains(span));
    collector.spans
}

#[derive(Default)]
pub struct NoInspect;

impl ScriptRule for NoInspect {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        program.walk(|node, _| {
            if is_inspect_ident(node)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                reports.push((s, e));
            }
        });
        let seen: HashSet<(u32, u32)> = reports.iter().copied().collect();
        reports.extend(recovered_spans(ctx.source(), program.value(), &seen));
        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

/// Template pass: `$inspect` identifiers inside template expressions. Script
/// programs are covered by `check_program`, so this walks only the fragment.
impl Rule for NoInspect {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, _root: &rsvelte_core::ast::template::Root) {
        let fragment = ctx.template_fragment_json();
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(&fragment, |node, _| {
            if is_inspect_ident(node)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                reports.push((s, e));
            }
        });
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn matches_only_inspect_identifiers() {
        assert!(is_inspect_ident(
            &json!({ "type": "Identifier", "name": "$inspect" })
        ));
        assert!(!is_inspect_ident(
            &json!({ "type": "Identifier", "name": "$state" })
        ));
        assert!(!is_inspect_ident(
            &json!({ "type": "Literal", "value": "$inspect" })
        ));
    }
}
