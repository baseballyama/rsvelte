//! `svelte/experimental-require-slot-types` — require a `$$Slots` type
//! declaration when a TS component renders `<slot>`. Port of the
//! eslint-plugin-svelte rule.
//!
//! A cross-cutting (template + script) check, so it runs as a source-scan
//! meta-path in [`crate::runner::lint_source`]: TS `<script>` (the last script
//! element's `lang` wins, as upstream's `SvelteScriptElement` visitor
//! overwrites) + a real `<slot>` element + no `interface`/`type $$Slots`
//! declaration ⇒ report at the start of the file (upstream hardcodes
//! `loc { line: 1, column: 1 }`).
//!
//! Upstream additionally gates on runes: for Svelte 5 the rule only runs when
//! the component is NOT in runes mode (`runes: [false, 'undetermined']`), where
//! svelte-eslint-parser determines runes mode from `<svelte:options runes>` or
//! any rune symbol identifier in the scripts/template expressions.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::AstKind;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_semantic::SemanticBuilder;
use oxc_span::SourceType;
use rsvelte_diagnostics::{Diagnostic, Position, Range};
use serde_json::Value;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::{Root, Script};

use crate::config::LintConfig;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_type, walk_js};
use crate::validator::to_dsev;

pub static META: RuleMeta = RuleMeta {
    name: "svelte/experimental-require-slot-types",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    // Experimental (upstream `recommended: false`) — opt-in.
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "require slot type declaration using the `$$Slots` interface",
    options_schema: None,
};

/// The rune symbols svelte-eslint-parser's `hasRunesSymbol` looks for.
const RUNE_SYMBOLS: [&str; 7] = [
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

#[must_use]
pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }
    let Ok(root) = rsvelte_core::parse(
        source,
        &rsvelte_core::Allocator::default(),
        rsvelte_core::ParseOptions {
            lenient_script: true,
            ..Default::default()
        },
    ) else {
        return Vec::new();
    };
    if !should_report(source, &root) {
        return Vec::new();
    }
    vec![Diagnostic {
        file: file.to_path_buf(),
        severity: to_dsev(severity),
        range: Some(Range {
            start: Position { line: 1, column: 1 },
            end: Position { line: 1, column: 1 },
        }),
        message: "The component must define the $$Slots interface.".to_string(),
        code: Some(META.name.to_string()),
        source: "svelte",
    }]
}

fn should_report(source: &str, root: &Root) -> bool {
    // `isTs`: the LAST script element's lang wins (upstream overwrites per
    // `SvelteScriptElement`, so an earlier TS module script is reset by a later
    // plain instance script).
    let mut scripts: Vec<&Script> = [root.instance.as_deref(), root.module.as_deref()]
        .into_iter()
        .flatten()
        .collect();
    scripts.sort_by_key(|s| s.start);
    // `Script::is_typescript` is component-wide — a `lang="ts"` module script
    // marks the plain instance script too — so ask the element's own attribute,
    // which is what upstream's `getLangValue` reads.
    let is_ts = scripts
        .last()
        .and_then(|s| script_lang(source, s))
        .is_some_and(|lang| lang == "ts" || lang == "typescript");
    if !is_ts {
        return false;
    }

    let fragment_json: Value =
        with_serialize_arena(&root.arena, || serde_json::to_value(&root.fragment))
            .unwrap_or(Value::Null);

    let mut has_slot = false;
    let mut fragment_has_rune = false;
    walk_js(&fragment_json, |node, _| match node_type(node) {
        Some("SlotElement") => has_slot = true,
        Some("Identifier")
            if node
                .get("name")
                .and_then(Value::as_str)
                .is_some_and(|n| RUNE_SYMBOLS.contains(&n)) =>
        {
            fragment_has_rune = true;
        }
        _ => {}
    });
    if !has_slot {
        return false;
    }

    // Runes gate: `<svelte:options runes={…}>` decides when present; otherwise
    // any rune symbol identifier (scripts or template expressions) makes the
    // component runes-mode, which upstream's Svelte-5 condition excludes.
    let mut declares_slots = false;
    let mut script_has_rune = false;
    for script in &scripts {
        scan_script(source, script, &mut declares_slots, &mut script_has_rune);
    }
    let runes = root
        .options
        .as_ref()
        .and_then(|o| o.runes)
        .unwrap_or(fragment_has_rune || script_has_rune);
    if runes {
        return false;
    }

    !declares_slots
}

/// The `lang` attribute of a `<script>` element's own start tag, lowercased.
fn script_lang(source: &str, script: &Script) -> Option<String> {
    let rest = source.get(script.start as usize..)?;
    let tag_end = rest.find('>')?;
    crate::svelte_scan::attr_value(&rest[..tag_end], "lang")
        .map(|lang| lang.trim().to_ascii_lowercase())
}

/// One oxc semantic pass over a script body: records whether it declares an
/// `interface $$Slots` / `type $$Slots` and whether any rune symbol identifier
/// appears.
fn scan_script(source: &str, script: &Script, declares_slots: &mut bool, has_rune: &mut bool) {
    let body = script_body(source, script);
    let allocator = Allocator::default();
    let source_type = if script.is_typescript {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    let parsed = Parser::new(&allocator, body, source_type)
        .with_options(OxcParseOptions {
            allow_return_outside_function: true,
            ..OxcParseOptions::default()
        })
        .parse();
    let program = allocator.alloc(parsed.program);
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(program)
        .semantic;
    for node in semantic.nodes().iter() {
        match node.kind() {
            AstKind::TSInterfaceDeclaration(decl) if decl.id.name == "$$Slots" => {
                *declares_slots = true;
            }
            AstKind::TSTypeAliasDeclaration(decl) if decl.id.name == "$$Slots" => {
                *declares_slots = true;
            }
            AstKind::IdentifierReference(ident) if RUNE_SYMBOLS.contains(&ident.name.as_str()) => {
                *has_rune = true;
            }
            AstKind::BindingIdentifier(ident) if RUNE_SYMBOLS.contains(&ident.name.as_str()) => {
                *has_rune = true;
            }
            AstKind::IdentifierName(ident) if RUNE_SYMBOLS.contains(&ident.name.as_str()) => {
                *has_rune = true;
            }
            _ => {}
        }
    }
}

/// The script's body text: the parser keeps `raw_content` when the program was
/// deferred; otherwise slice from `content_offset` and stop before the closing
/// `</script` tag.
fn script_body<'a>(source: &'a str, script: &Script<'a>) -> &'a str {
    if !script.raw_content.is_empty() {
        return script.raw_content;
    }
    let lo = script.content_offset as usize;
    let hi = (script.end as usize).min(source.len());
    if lo > hi {
        return "";
    }
    let body = &source[lo..hi];
    body.rfind("</script").map_or(body, |close| &body[..close])
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::LintConfig;

    fn report_count(src: &str) -> usize {
        let config = LintConfig::empty()
            .with_override("svelte/experimental-require-slot-types", Severity::Warn);
        diagnostics(src, Path::new("test.svelte"), &config).len()
    }

    #[test]
    fn reports_ts_slot_without_types() {
        assert_eq!(
            report_count("<script lang=\"ts\">\nexport let a: string;\n</script>\n<slot />"),
            1
        );
    }

    #[test]
    fn string_slot_is_not_a_slot() {
        assert_eq!(
            report_count("<script lang=\"ts\">\nconst s = '<slot>';\nvoid s;\n</script>\n<p>x</p>"),
            0
        );
    }

    #[test]
    fn comment_decoy_still_reports() {
        assert_eq!(
            report_count(
                "<script lang=\"ts\">\n// interface $$Slots\nexport let a: string;\n</script>\n<slot />"
            ),
            1
        );
    }

    #[test]
    fn runes_component_is_skipped() {
        assert_eq!(
            report_count(
                "<script lang=\"ts\">\nlet { a }: { a: string } = $props();\n</script>\n<slot />"
            ),
            0
        );
    }

    #[test]
    fn declared_interface_is_ok() {
        assert_eq!(
            report_count(
                "<script lang=\"ts\">\ninterface $$Slots { default: {} }\nexport let a: string;\n</script>\n<slot />"
            ),
            0
        );
    }
}
