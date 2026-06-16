//! `svelte/require-event-dispatcher-types` — require type parameters on
//! `createEventDispatcher` calls. Port of the eslint-plugin-svelte rule
//! (Svelte 3/4 feature).
//!
//! Runs as a source-scan meta-path in [`crate::runner::lint_source`]: in a TS
//! component, find `createEventDispatcher` imported from `'svelte'` (alias
//! aware) and report any call site that has no `<…>` type arguments.
//!
//! ### Known divergence
//! Type-argument detection is a source scan (name → next non-space char is `(`),
//! so it can't disambiguate a `<` that starts type args from a `<` comparison;
//! in practice `createEventDispatcher` is always called, not compared.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{blank_comments, is_ident_byte, script_blocks, script_is_ts};
use crate::validator::{range_from_byte, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/require-event-dispatcher-types",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require type parameters for `createEventDispatcher`",
    options_schema: None,
};

pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off || !script_is_ts(source) {
        return Vec::new();
    }

    // Blank out comments (preserving byte offsets) so identifiers inside `//`
    // and `/* */` comments aren't mistaken for imports or calls.
    let blanked: Vec<(usize, String)> = script_blocks(source)
        .iter()
        .map(|b| {
            (
                b.content_start,
                blank_comments(&source[b.content_start..b.content_end]),
            )
        })
        .collect();

    // Local names that `createEventDispatcher` is imported under (alias aware).
    let mut locals: Vec<String> = Vec::new();
    for (_, content) in &blanked {
        collect_dispatcher_locals(content, &mut locals);
    }
    if locals.is_empty() {
        return Vec::new();
    }

    let li = LineIndex::new(source);
    let mut out = Vec::new();
    for (content_start, content) in &blanked {
        for off in call_sites_without_type_args(content, &locals) {
            let abs = (content_start + off) as u32;
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range: range_from_byte(&li, abs, abs),
                message: "Type parameters missing for the `createEventDispatcher` function call."
                    .to_string(),
                code: Some(META.name.to_string()),
                source: "svelte",
            });
        }
    }
    out
}

/// Collect the local binding names of `createEventDispatcher` imported from
/// `'svelte'` in `content` (handles `as` aliases).
fn collect_dispatcher_locals(content: &str, out: &mut Vec<String>) {
    let bytes = content.as_bytes();
    let mut i = 0;
    while let Some(rel) = content[i..].find("import") {
        let imp = i + rel;
        // The keyword must be at a boundary.
        if (imp == 0 || !is_ident_byte(bytes[imp - 1]))
            && let Some(stmt_end) = find_svelte_import_end(content, imp)
        {
            let segment = &content[imp..stmt_end];
            if let Some(local) = dispatcher_local_in_import(segment)
                && !out.contains(&local)
            {
                out.push(local);
            }
            i = stmt_end;
            continue;
        }
        i = imp + "import".len();
    }
}

/// If `import_segment` (`import … from 'svelte'`) imports `createEventDispatcher`,
/// return its local name.
fn dispatcher_local_in_import(import_segment: &str) -> Option<String> {
    // Must import from svelte.
    if !(import_segment.contains("'svelte'") || import_segment.contains("\"svelte\"")) {
        return None;
    }
    let needle = "createEventDispatcher";
    let bytes = import_segment.as_bytes();
    // Check every occurrence at an identifier boundary (a suffix like
    // `xcreateEventDispatcher` must not match).
    for (pos, _) in import_segment.match_indices(needle) {
        let before_ok = pos == 0 || !is_ident_byte(bytes[pos - 1]);
        let after = &import_segment[pos + needle.len()..];
        let after_ok = after.as_bytes().first().is_none_or(|&c| !is_ident_byte(c));
        if !(before_ok && after_ok) {
            continue;
        }
        let trimmed = after.trim_start();
        // `as <alias>` — the `as` must be a keyword (followed by whitespace).
        if let Some(rest) = trimmed.strip_prefix("as")
            && rest.as_bytes().first().is_some_and(u8::is_ascii_whitespace)
        {
            let name: String = rest
                .trim_start()
                .chars()
                .take_while(|&c| c == '_' || c == '$' || c.is_ascii_alphanumeric())
                .collect();
            if name.is_empty() {
                continue; // malformed `as` with no alias — not a usable import
            }
            return Some(name);
        }
        return Some(needle.to_string());
    }
    None
}

/// Return the byte offsets (within `content`) of call sites of any `local` name
/// that have no `<…>` type arguments (i.e. the next non-space char after the
/// name is `(`).
fn call_sites_without_type_args(content: &str, locals: &[String]) -> Vec<usize> {
    let bytes = content.as_bytes();
    let mut out = Vec::new();
    for local in locals {
        let lb = local.as_bytes();
        let mut i = 0;
        while i + lb.len() <= bytes.len() {
            if &bytes[i..i + lb.len()] == lb {
                let before_ok = i == 0 || !is_ident_byte(bytes[i - 1]);
                let after_idx = i + lb.len();
                let after_ok = bytes.get(after_idx).is_none_or(|&c| !is_ident_byte(c));
                if before_ok && after_ok {
                    // Peek the next non-whitespace char.
                    let mut k = after_idx;
                    while k < bytes.len() && bytes[k].is_ascii_whitespace() {
                        k += 1;
                    }
                    if bytes.get(k) == Some(&b'(') {
                        out.push(i);
                    }
                }
                i = after_idx;
            } else {
                i += 1;
            }
        }
    }
    out.sort_unstable();
    out
}

/// Find the end (exclusive byte offset in `content`) of an import statement that
/// starts at `start`, defined as the position just past its `'svelte'`-style
/// source string, or the next `;`/newline — whichever bounds the statement. We
/// only care about imports ending in a quoted module, so scan to the closing
/// quote of the first string after a `from`.
fn find_svelte_import_end(content: &str, start: usize) -> Option<usize> {
    let rest = &content[start..];
    // End at the first statement terminator after the module string. Simplest
    // robust bound: the end of the line containing the matching `from '…'`.
    let from_rel = rest.find("from")?;
    let after_from = &rest[from_rel + 4..];
    // Find the opening quote.
    let q_rel = after_from.find(['\'', '"'])?;
    let quote = after_from.as_bytes()[q_rel];
    let after_q = &after_from[q_rel + 1..];
    let close_rel = after_q.find(quote as char)?;
    Some(start + from_rel + 4 + q_rel + 1 + close_rel + 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn collects_direct_and_aliased_imports() {
        let mut v = Vec::new();
        collect_dispatcher_locals("import { createEventDispatcher } from 'svelte';", &mut v);
        assert_eq!(v, vec!["createEventDispatcher"]);

        let mut v2 = Vec::new();
        collect_dispatcher_locals(
            "import { createEventDispatcher as ced } from 'svelte';",
            &mut v2,
        );
        assert_eq!(v2, vec!["ced"]);

        // Not from svelte → ignored.
        let mut v3 = Vec::new();
        collect_dispatcher_locals("import { createEventDispatcher } from './x';", &mut v3);
        assert!(v3.is_empty());
    }

    #[test]
    fn finds_calls_without_type_args() {
        let content = "const d = createEventDispatcher();";
        let locals = vec!["createEventDispatcher".to_string()];
        assert_eq!(call_sites_without_type_args(content, &locals).len(), 1);

        // With type args → not reported.
        let typed = "const d = createEventDispatcher<{a: 1}>();";
        assert!(call_sites_without_type_args(typed, &locals).is_empty());
    }
}
