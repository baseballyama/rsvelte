//! Code actions: a quick fix for each finding that has a fix, and one action that applies every
//! fix, in passes, as `rsvelte-dev run --fix` applies them.

use std::collections::HashMap;
use std::path::Path;

use oxc_language_server::CodeActionParams;
use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::diagnostics::{self, Finding};
use tower_lsp_server::gen_lsp_types::{
    CodeAction, CodeActionKind, CodeActionResponse, Range, TextEdit, Uri, WorkspaceEdit,
};

use super::{FIX_ALL, Linted, Server, convert};
use crate::commands::run;

/// The actions of `parameters`' kinds over its range, for `text`, the open document at `path`.
pub(super) fn actions(
    server: &Server,
    path: &Path,
    text: &str,
    parameters: &CodeActionParams,
) -> Vec<CodeActionResponse> {
    // The light bulb asks for no kind; only fixes belong under it.
    let wanted = |kind: &CodeActionKind| {
        (parameters.context.only.as_ref()).map_or_else(
            || *kind == CodeActionKind::QuickFix,
            |only| only.iter().any(|asked| includes(asked, kind)),
        )
    };
    let (quick, all) = (wanted(&CodeActionKind::QuickFix), wanted(&FIX_ALL));
    if !quick && !all {
        return Vec::new();
    }
    let Linted::Ran(_, result) = server.lint(path, text) else {
        return Vec::new();
    };
    if result.panic.is_some() {
        return Vec::new();
    }
    let lines = convert::lines(text);
    let mut actions = Vec::new();
    if quick {
        for finding in findings(&result).filter(|finding| !finding.fix.is_empty()) {
            let diagnostic = convert::diagnostic(&lines, &finding.diagnostic);
            if !overlaps(parameters.range, diagnostic.range) {
                continue;
            }
            let Some(replacement) = diagnostics::merge(text, &finding.fix) else {
                continue;
            };
            let edit = TextEdit::new(convert::range(&lines, replacement.span), replacement.text);
            actions.push(CodeActionResponse::CodeAction(CodeAction {
                title: rsvelte_lint_runner::finding::rule(&finding.diagnostic.code).map_or_else(
                    || "Fix this problem".to_owned(),
                    |rule| format!("Fix this {rule} problem"),
                ),
                kind: Some(CodeActionKind::QuickFix),
                diagnostics: Some(vec![diagnostic]),
                is_preferred: Some(true),
                edit: Some(workspace_edit(&parameters.uri, edit)),
                ..CodeAction::default()
            }));
        }
    }
    if all
        && let Some(fixed) = fix_all(server, path, text)
        && let Some(edit) = convert::edit(text, &fixed)
    {
        actions.push(CodeActionResponse::CodeAction(CodeAction {
            title: "Fix all rsvelte problems".to_owned(),
            kind: Some(FIX_ALL),
            edit: Some(workspace_edit(&parameters.uri, edit)),
            ..CodeAction::default()
        }));
    }
    actions
}

/// `text` with every fix applied, as `rsvelte-dev run --fix` applies them.
fn fix_all(server: &Server, path: &Path, text: &str) -> Option<String> {
    let lint = |text: &str| match server.lint(path, text) {
        Linted::Ran(_, result) => Ok(result),
        Linted::Skipped | Linted::Failed(_) => Err(()),
    };
    run::fixed(text.to_owned(), run::MAX_FIX_PASSES, &lint)
        .ok()
        .map(|(fixed, _)| fixed)
}

fn findings(result: &DocumentResult) -> impl Iterator<Item = &Finding> {
    (result.outputs.iter()).flat_map(|(_, out)| &out.findings)
}

/// Whether the asked kind `asked` covers `kind`: the same kind, or one of its sub-kinds, as
/// `source` covers `source.fixAll.rsvelte`.
fn includes(asked: &CodeActionKind, kind: &CodeActionKind) -> bool {
    let (asked, kind) = (String::from(asked.clone()), String::from(kind.clone()));
    asked.is_empty()
        || kind == asked
        || kind
            .strip_prefix(&asked)
            .is_some_and(|rest| rest.starts_with('.'))
}

/// Whether the ranges share a position; an empty range touches the positions at its ends.
fn overlaps(a: Range, b: Range) -> bool {
    let key = |p: tower_lsp_server::gen_lsp_types::Position| (p.line, p.character);
    key(a.start) <= key(b.end) && key(b.start) <= key(a.end)
}

fn workspace_edit(uri: &Uri, edit: TextEdit) -> WorkspaceEdit {
    WorkspaceEdit {
        changes: Some(HashMap::from([(uri.clone(), vec![edit])])),
        ..WorkspaceEdit::default()
    }
}

#[cfg(test)]
mod tests;
