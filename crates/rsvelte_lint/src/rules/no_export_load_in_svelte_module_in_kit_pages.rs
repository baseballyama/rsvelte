//! `svelte/no-export-load-in-svelte-module-in-kit-pages` — disallow exporting
//! `load` functions in `*.svelte` module scripts in `SvelteKit` page components.
//!
//! Two upstream quirks are load-bearing here and both are reproduced verbatim.
//! Its `isModule` flag is set by a selector matching only
//! `SvelteAttribute[key.name="context"] > SvelteLiteral[value="module"]`, so the
//! Svelte 5 spelling `<script module>` never turns the rule on; and its export
//! selector is not anchored to `Program`, so an `export function load()` nested
//! inside `export namespace App { … }` does fire.
//!
//! Port of
//! `eslint-plugin-svelte/src/rules/no-export-load-in-svelte-module-in-kit-pages.ts`.

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    BindingPattern, Declaration, Statement, TSNamespaceDeclaration, TSNamespaceDeclarationBody,
};
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::kit_routes;
use crate::script::node_type;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-export-load-in-svelte-module-in-kit-pages",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow exporting load functions in *.svelte module in SvelteKit page components",
    options_schema: None,
};

const MESSAGE: &str =
    "disallow exporting load functions in `*.svelte` module in SvelteKit page components.";

/// Whether a `<script>` element carries `context="module"` — the only module
/// spelling upstream's selector recognizes.
fn has_context_module_attribute(script: &Value) -> bool {
    let Some(attributes) = script.get("attributes").and_then(Value::as_array) else {
        return false;
    };
    attributes.iter().any(|attr| {
        if node_type(attr) != Some("Attribute")
            || attr.get("name").and_then(Value::as_str) != Some("context")
        {
            return false;
        }
        attr.get("value")
            .and_then(Value::as_array)
            .is_some_and(|parts| {
                parts.iter().any(|part| {
                    part.get("data")
                        .or_else(|| part.get("raw"))
                        .and_then(Value::as_str)
                        == Some("module")
                })
            })
    })
}

/// The `lang` attribute of a `<script>` element, lowercased.
fn script_lang(script: &Value) -> String {
    script
        .get("attributes")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .find(|attr| {
            node_type(attr) == Some("Attribute")
                && attr.get("name").and_then(Value::as_str) == Some("lang")
        })
        .and_then(|attr| attr.get("value").and_then(Value::as_array))
        .and_then(|parts| parts.first())
        .and_then(|part| part.get("data").or_else(|| part.get("raw")))
        .and_then(Value::as_str)
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase()
}

/// Spans of every `load` name declared by a named export, anywhere in the
/// statement list — upstream's selector is not anchored to `Program`, so an
/// export nested inside `export namespace App { … }` counts too.
fn exported_load_spans(statements: &[Statement<'_>], out: &mut Vec<(u32, u32)>) {
    for statement in statements {
        match statement {
            Statement::ExportDeclaration(export) => match &export.declaration {
                // A body-less `export declare function load()` is a
                // `TSDeclareFunction` upstream, which the selector misses.
                Declaration::FunctionDeclaration(function) => {
                    if function.body.is_some()
                        && let Some(id) = &function.id
                        && id.name == "load"
                    {
                        out.push((id.span.start, id.span.end));
                    }
                }
                Declaration::VariableDeclaration(declaration) => {
                    for declarator in &declaration.declarations {
                        if let BindingPattern::BindingIdentifier(id) = &declarator.id
                            && id.name == "load"
                        {
                            // A TSESTree `Identifier` range covers its type
                            // annotation, which oxc keeps on the declarator.
                            let end = declarator
                                .type_annotation
                                .as_ref()
                                .map_or(id.span.end, |ann| ann.span.end);
                            out.push((id.span.start, end));
                        }
                    }
                }
                Declaration::TSNamespaceDeclaration(namespace) => {
                    namespace_load_spans(namespace, out);
                }
                _ => {}
            },
            Statement::TSNamespaceDeclaration(namespace) => {
                namespace_load_spans(namespace, out);
            }
            _ => {}
        }
    }
}

fn namespace_load_spans(namespace: &TSNamespaceDeclaration<'_>, out: &mut Vec<(u32, u32)>) {
    match &namespace.body {
        TSNamespaceDeclarationBody::TSModuleBlock(block) => {
            exported_load_spans(&block.body, out);
        }
        TSNamespaceDeclarationBody::TSNamespaceDeclaration(inner) => {
            namespace_load_spans(inner, out);
        }
    }
}

#[derive(Default)]
pub struct NoExportLoadInSvelteModuleInKitPages;

impl Rule for NoExportLoadInSvelteModuleInKitPages {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        if kit_routes::route_file_type(ctx).is_none() {
            return;
        }
        let json = ctx.root_json(root);
        let Some(module) = json.get("module").filter(|m| !m.is_null()) else {
            return;
        };
        if !has_context_module_attribute(module) {
            return;
        }
        // rsvelte's own ESTree elides a `namespace` body (it serializes as an
        // `EmptyStatement`), so the statements come from a direct oxc parse.
        let Some(program_span) = module.get("content").and_then(|c| {
            Some((
                u32::try_from(c.get("start")?.as_u64()?).ok()?,
                u32::try_from(c.get("end")?.as_u64()?).ok()?,
            ))
        }) else {
            return;
        };
        let source = ctx.source();
        let Some(body) = source.get(program_span.0 as usize..program_span.1 as usize) else {
            return;
        };
        let lang = script_lang(module);
        let source_type = if lang == "ts" || lang == "typescript" {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        };
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, body, source_type).parse();

        let mut reports: Vec<(u32, u32)> = Vec::new();
        exported_load_spans(&parsed.program.body, &mut reports);
        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start + program_span.0, end + program_span.0, MESSAGE);
        }
    }
}
