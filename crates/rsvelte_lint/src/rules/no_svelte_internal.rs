//! `svelte/no-svelte-internal` — flag any import/export whose module source is
//! exactly `"svelte/internal"` or starts with `"svelte/internal/"`.
//! Port of the eslint-plugin-svelte rule.
//!
//! Upstream fires on `ImportDeclaration`, `ImportExpression` (dynamic
//! `import("…")`, string-literal source only), `ExportNamedDeclaration` (with a
//! source), and `ExportAllDeclaration`. The deep-import path
//! (`svelte/internal/client`, …) is caught by the `startsWith` check.
//!
//! Dual-registered: the [`ScriptRule`] pass covers `<script>` programs and
//! standalone `.svelte.(js|ts)` modules, the template [`Rule`] pass covers a
//! dynamic `import()` inside a template expression (`{#await import('…')}`, an
//! event handler), which upstream's plain `ImportExpression` visitor sees
//! because the whole component is one ESTree walk for it.

use oxc_allocator::Allocator;
use oxc_ast::ast::Statement;
use oxc_parser::Parser;
use oxc_span::SourceType;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_type, walk_js};
use crate::script::{node_end, node_start};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-svelte-internal",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "svelte/internal will be removed in Svelte 6.",
    options_schema: None,
};

const MESSAGE: &str = "Using svelte/internal is prohibited. This will be removed in Svelte 6.";

/// Whether a module source string matches the prohibited `svelte/internal` path.
fn is_svelte_internal(value: &str) -> bool {
    value == "svelte/internal" || value.starts_with("svelte/internal/")
}

/// The node's `source` module string, when it is a string literal.
fn source_string(node: &Value) -> Option<&str> {
    node.get("source")
        .filter(|s| node_type(s) == Some("Literal"))
        .and_then(|s| s.get("value"))
        .and_then(Value::as_str)
}

/// A dynamic `import('…')` written as a plain call. The template expression
/// path serializes `import()` as a `CallExpression` with a callee named
/// `import` instead of as an `ImportExpression`; `import` is a reserved word, so
/// nothing else can produce that callee.
fn dynamic_import_source(node: &Value) -> Option<&str> {
    let callee = node.get("callee")?;
    if node_type(callee) != Some("Identifier")
        || callee.get("name").and_then(Value::as_str) != Some("import")
    {
        return None;
    }
    node.get("arguments")
        .and_then(Value::as_array)
        .and_then(|args| args.first())
        .filter(|a| node_type(a) == Some("Literal"))
        .and_then(|a| a.get("value"))
        .and_then(Value::as_str)
}

/// Whether a node is one of upstream's four visited kinds with a prohibited
/// module source.
fn is_prohibited(node: &Value) -> bool {
    match node_type(node) {
        Some(
            "ImportDeclaration"
            | "ImportExpression"
            | "ExportNamedDeclaration"
            | "ExportAllDeclaration",
        ) => source_string(node).is_some_and(is_svelte_internal),
        Some("CallExpression") => dynamic_import_source(node).is_some_and(is_svelte_internal),
        _ => false,
    }
}

#[derive(Default)]
pub struct NoSvelteInternal;

/// Template pass: a dynamic `import()` inside a template expression. Script
/// programs are covered by `check_program`, so this walks only the fragment.
impl Rule for NoSvelteInternal {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, _root: &rsvelte_core::ast::template::Root) {
        let fragment = ctx.template_fragment_json();
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(&fragment, |node, _| {
            if is_prohibited(node)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                reports.push((s, e));
            }
        });
        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

impl ScriptRule for NoSvelteInternal {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        program.walk(|node, _| {
            if is_prohibited(node)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                reports.push((s, e));
            }
        });
        // `export * from '…'` has no variant in the typed script AST, so it
        // never appears in the serialized program JSON. Recover it by parsing
        // the script body with oxc and reading the module-level
        // `ExportAllDeclaration` statements directly.
        collect_export_all(ctx, program, &mut reports);
        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

/// Append the spans of `export * from 'svelte/internal…'` statements, which the
/// typed AST drops. TS grammar is a superset of the script grammar accepted
/// here, so one TS parse covers both languages.
fn collect_export_all(ctx: &LintContext, program: &ProgramView<'_>, out: &mut Vec<(u32, u32)>) {
    let (Some(base), Some(end)) = (node_start(program.value()), node_end(program.value())) else {
        return;
    };
    let source = ctx.source();
    if base > end || end as usize > source.len() {
        return;
    }
    let body = &source[base as usize..end as usize];
    if !body.contains("export") {
        return;
    }
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, body, SourceType::ts().with_module(true)).parse();
    for stmt in &parsed.program.body {
        if let Statement::ExportAllDeclaration(decl) = stmt
            && is_svelte_internal(&decl.source.value)
        {
            out.push((base + decl.span.start, base + decl.span.end));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn dynamic_import_as_a_plain_call_is_matched() {
        let call = json!({
            "type": "CallExpression",
            "callee": { "type": "Identifier", "name": "import" },
            "arguments": [{ "type": "Literal", "value": "svelte/internal" }]
        });
        assert!(is_prohibited(&call));
        let other = json!({
            "type": "CallExpression",
            "callee": { "type": "Identifier", "name": "load" },
            "arguments": [{ "type": "Literal", "value": "svelte/internal" }]
        });
        assert!(!is_prohibited(&other));
    }

    #[test]
    fn matches_svelte_internal_paths() {
        assert!(is_svelte_internal("svelte/internal"));
        assert!(is_svelte_internal("svelte/internal/client"));
        assert!(is_svelte_internal("svelte/internal/"));
        assert!(!is_svelte_internal("svelte"));
        assert!(!is_svelte_internal("svelte/internalx"));
        assert!(!is_svelte_internal("@svelte/internal"));
        assert!(!is_svelte_internal("svelte/store"));
    }

    #[test]
    fn source_string_requires_literal() {
        let lit = json!({ "source": { "type": "Literal", "value": "svelte/internal" } });
        assert_eq!(source_string(&lit), Some("svelte/internal"));
        // A template-literal source (dynamic import) is not a Literal.
        let tpl = json!({ "source": { "type": "TemplateLiteral", "quasis": [] } });
        assert_eq!(source_string(&tpl), None);
        let none = json!({ "source": null });
        assert_eq!(source_string(&none), None);
    }
}
