//! Quick fixes for the compiler warnings this server publishes.
//!
//! Every action is built from a diagnostic the client sent back in
//! `CodeActionParams.context`, never from a fresh analysis, so what the editor
//! offers always matches what it is showing.

use std::collections::HashMap;

use lsp_types::{
    CodeAction, CodeActionKind, CodeActionOrCommand, Diagnostic, DiagnosticSeverity, Position,
    Range, TextEdit, Uri, WorkspaceEdit,
};
use rsvelte_core::ParseOptions;
use rsvelte_core::ast::template::{Fragment, Root, TemplateNode};

use crate::diagnostics::{COMPILER_SOURCE, is_compiler_code};
use crate::text::LineIndex;

/// Warnings a `svelte-ignore` comment cannot suppress, in both the spelling the
/// official server lists and the one Svelte 5 emits.
const NON_IGNORABLE: &[&str] = &[
    "missing-custom-element-compile-options",
    "options_missing_custom_element",
    "unused-export-let",
    "export_let_unused",
    "css-unused-selector",
    "css_unused_selector",
];

/// The quick fixes available for `diagnostics`.
pub fn quickfixes(source: &str, uri: &Uri, diagnostics: &[Diagnostic]) -> Vec<CodeActionOrCommand> {
    let index = LineIndex::new(source);
    let allocator = rsvelte_core::Allocator::default();
    // A document under edit rarely parses; without a tree the ignore comment
    // still lands on the diagnostic's own line.
    let root = rsvelte_core::parse(
        source,
        &allocator,
        ParseOptions {
            lenient_script: true,
            ..ParseOptions::default()
        },
    )
    .ok();

    let mut actions = Vec::new();
    for diagnostic in diagnostics {
        for_diagnostic(source, &index, root.as_ref(), uri, diagnostic, &mut actions);
    }
    actions
}

fn for_diagnostic(
    source: &str,
    index: &LineIndex,
    root: Option<&Root>,
    uri: &Uri,
    diagnostic: &Diagnostic,
    actions: &mut Vec<CodeActionOrCommand>,
) {
    let Some(code) = code_of(diagnostic).filter(|code| is_ignorable(diagnostic, code)) else {
        return;
    };
    let start = index.offset(source, diagnostic.range.start) as u32;
    let end = (index.offset(source, diagnostic.range.end) as u32).max(start);

    let in_script = root.is_some_and(|root| in_script(root, start, end));
    let node = root
        .filter(|_| !in_script)
        .and_then(|root| enclosing_node(&root.fragment, start, end));

    let anchor = node.map_or(start, |node| span(node).0);
    actions.push(svelte_ignore(source, index, uri, code, anchor, in_script));
}

fn code_of(diagnostic: &Diagnostic) -> Option<&str> {
    match diagnostic.code.as_ref()? {
        lsp_types::NumberOrString::String(code) => Some(code),
        lsp_types::NumberOrString::Number(_) => None,
    }
}

/// Whether a `<!-- svelte-ignore -->` comment can suppress this diagnostic —
/// which is also what decides whether it gets any fix at all. A client hands
/// back every provider's diagnostics, so this has to recognise a compiler
/// warning of ours (or of the official server's) among them; an error is not a
/// warning to silence.
fn is_ignorable(diagnostic: &Diagnostic, code: &str) -> bool {
    diagnostic.source.as_deref() == Some(COMPILER_SOURCE)
        && is_compiler_code(code)
        && !NON_IGNORABLE.contains(&code)
        && diagnostic.severity != Some(DiagnosticSeverity::ERROR)
}

/// Insert `<!-- svelte-ignore CODE -->` (or `// svelte-ignore CODE` inside a
/// script) on its own line above the offending node, indented like it.
fn svelte_ignore(
    source: &str,
    index: &LineIndex,
    uri: &Uri,
    code: &str,
    anchor: u32,
    in_script: bool,
) -> CodeActionOrCommand {
    let line = index.position(source, anchor as usize).line;
    let line_start = index.offset(source, Position::new(line, 0));
    let indent: String = source[line_start..]
        .chars()
        .take_while(|&c| c == ' ' || c == '\t')
        .collect();
    let comment = if in_script {
        format!("// svelte-ignore {code}")
    } else {
        format!("<!-- svelte-ignore {code} -->")
    };
    let edit = TextEdit {
        range: Range::new(Position::new(line, 0), Position::new(line, 0)),
        new_text: format!("{indent}{comment}{}", line_ending(source)),
    };

    CodeActionOrCommand::CodeAction(CodeAction {
        title: format!("(svelte) Disable {code} for this line"),
        kind: Some(CodeActionKind::QUICKFIX),
        edit: Some(WorkspaceEdit {
            changes: Some(HashMap::from([(uri.clone(), vec![edit])])),
            ..WorkspaceEdit::default()
        }),
        ..CodeAction::default()
    })
}

/// The document's own line terminator, so an inserted line does not mix
/// endings into a file that uses CRLF.
fn line_ending(source: &str) -> &'static str {
    if source.contains("\r\n") {
        "\r\n"
    } else {
        "\n"
    }
}

/// Whether a byte range falls inside a script block, its tags included.
fn in_script(root: &Root, start: u32, end: u32) -> bool {
    [&root.instance, &root.module]
        .into_iter()
        .flatten()
        .any(|script| script.start <= start && script.end >= end)
}

/// The innermost element or block containing the range — what a
/// `svelte-ignore` comment has to precede. Attributes are not descended into,
/// so a finding on one anchors to its element.
fn enclosing_node<'b, 'a>(
    fragment: &'b Fragment<'a>,
    start: u32,
    end: u32,
) -> Option<&'b TemplateNode<'a>> {
    for node in &fragment.nodes {
        let (node_start, node_end) = span(node);
        if node_start > start || node_end < end || !is_container(node) {
            continue;
        }
        return child_fragments(node)
            .into_iter()
            .find_map(|child| enclosing_node(child, start, end))
            .or(Some(node));
    }
    None
}

/// Whether a node is one a `svelte-ignore` comment can be placed in front of.
fn is_container(node: &TemplateNode) -> bool {
    !matches!(
        node,
        TemplateNode::Text(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ExpressionTag(_)
            | TemplateNode::HtmlTag(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::RenderTag(_)
            | TemplateNode::AttachTag(_)
    )
}

fn span(node: &TemplateNode) -> (u32, u32) {
    match node {
        TemplateNode::Text(n) => (n.start, n.end),
        TemplateNode::Comment(n) => (n.start, n.end),
        TemplateNode::ExpressionTag(n) => (n.start, n.end),
        TemplateNode::HtmlTag(n) => (n.start, n.end),
        TemplateNode::ConstTag(n) => (n.start, n.end),
        TemplateNode::DeclarationTag(n) => (n.start, n.end),
        TemplateNode::DebugTag(n) => (n.start, n.end),
        TemplateNode::RenderTag(n) => (n.start, n.end),
        TemplateNode::AttachTag(n) => (n.start, n.end),
        TemplateNode::IfBlock(n) => (n.start, n.end),
        TemplateNode::EachBlock(n) => (n.start, n.end),
        TemplateNode::AwaitBlock(n) => (n.start, n.end),
        TemplateNode::KeyBlock(n) => (n.start, n.end),
        TemplateNode::SnippetBlock(n) => (n.start, n.end),
        TemplateNode::RegularElement(n) => (n.start, n.end),
        TemplateNode::Component(n) => (n.start, n.end),
        TemplateNode::SvelteComponent(n) => (n.start, n.end),
        TemplateNode::SvelteElement(n) => (n.start, n.end),
        TemplateNode::TitleElement(n) => (n.start, n.end),
        TemplateNode::SlotElement(n) => (n.start, n.end),
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => (n.start, n.end),
    }
}

fn child_fragments<'b, 'a>(node: &'b TemplateNode<'a>) -> Vec<&'b Fragment<'a>> {
    match node {
        TemplateNode::IfBlock(n) => [Some(&n.consequent), n.alternate.as_ref()]
            .into_iter()
            .flatten()
            .collect(),
        TemplateNode::EachBlock(n) => [Some(&n.body), n.fallback.as_ref()]
            .into_iter()
            .flatten()
            .collect(),
        TemplateNode::AwaitBlock(n) => [n.pending.as_ref(), n.then.as_ref(), n.catch.as_ref()]
            .into_iter()
            .flatten()
            .collect(),
        TemplateNode::KeyBlock(n) => vec![&n.fragment],
        TemplateNode::SnippetBlock(n) => vec![&n.body],
        TemplateNode::RegularElement(n) => vec![&n.fragment],
        TemplateNode::Component(n) => vec![&n.fragment],
        TemplateNode::SvelteComponent(n) => vec![&n.fragment],
        TemplateNode::SvelteElement(n) => vec![&n.fragment],
        TemplateNode::TitleElement(n) => vec![&n.fragment],
        TemplateNode::SlotElement(n) => vec![&n.fragment],
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => vec![&n.fragment],
        _ => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use lsp_types::NumberOrString;
    use std::str::FromStr;

    fn uri() -> Uri {
        Uri::from_str("file:///App.svelte").unwrap()
    }

    fn diagnostic(code: &str, range: Range) -> Diagnostic {
        Diagnostic {
            range,
            severity: Some(DiagnosticSeverity::WARNING),
            code: Some(NumberOrString::String(code.to_string())),
            source: Some("svelte".to_string()),
            message: String::new(),
            ..Diagnostic::default()
        }
    }

    fn range(start: (u32, u32), end: (u32, u32)) -> Range {
        Range::new(Position::new(start.0, start.1), Position::new(end.0, end.1))
    }

    /// The (title, edit) pairs of every action, flattened for assertion.
    fn fixes(source: &str, diagnostics: &[Diagnostic]) -> Vec<(String, TextEdit)> {
        quickfixes(source, &uri(), diagnostics)
            .into_iter()
            .map(|action| {
                let CodeActionOrCommand::CodeAction(action) = action else {
                    panic!("a command, not a code action");
                };
                assert_eq!(action.kind, Some(CodeActionKind::QUICKFIX));
                let edits = action
                    .edit
                    .and_then(|edit| edit.changes)
                    .and_then(|mut changes| changes.remove(&uri()))
                    .expect("edits for the document");
                assert_eq!(edits.len(), 1);
                (action.title, edits.into_iter().next().unwrap())
            })
            .collect()
    }

    /// The official server's fixture, so the expectations below are its own.
    const COMPONENT: &str = "<img>\n\n{#if true}\n    <a></a>\n\n    <a\n        href=\"\"\n    >about</a>\n{/if}\n\n<script>\n\tlet value = $state(\"\");\n\n\tlet x = value;\n</script>\n";

    #[test]
    fn an_ignore_comment_goes_above_the_element() {
        let fixes = fixes(
            COMPONENT,
            &[diagnostic("a11y_missing_attribute", range((0, 0), (0, 6)))],
        );
        assert_eq!(
            fixes,
            vec![(
                "(svelte) Disable a11y_missing_attribute for this line".to_string(),
                TextEdit {
                    range: range((0, 0), (0, 0)),
                    new_text: "<!-- svelte-ignore a11y_missing_attribute -->\n".to_string(),
                }
            )]
        );
    }

    #[test]
    fn an_ignore_comment_keeps_the_indent_of_its_element() {
        let fixes = fixes(
            COMPONENT,
            &[diagnostic("a11y_missing_attribute", range((3, 4), (3, 11)))],
        );
        assert_eq!(
            fixes[0].1,
            TextEdit {
                range: range((3, 0), (3, 0)),
                new_text: "    <!-- svelte-ignore a11y_missing_attribute -->\n".to_string(),
            }
        );
    }

    /// A finding on an attribute anchors to the element that owns it, which
    /// starts on an earlier line.
    #[test]
    fn an_ignore_comment_anchors_to_the_element_of_an_attribute() {
        let fixes = fixes(
            COMPONENT,
            &[diagnostic("a11y_invalid_attribute", range((6, 8), (6, 15)))],
        );
        assert_eq!(
            fixes[0].1,
            TextEdit {
                range: range((5, 0), (5, 0)),
                new_text: "    <!-- svelte-ignore a11y_invalid_attribute -->\n".to_string(),
            }
        );
    }

    #[test]
    fn a_finding_in_a_script_gets_a_line_comment() {
        let fixes = fixes(
            COMPONENT,
            &[diagnostic(
                "state_referenced_locally",
                range((13, 9), (13, 14)),
            )],
        );
        assert_eq!(
            fixes,
            vec![(
                "(svelte) Disable state_referenced_locally for this line".to_string(),
                TextEdit {
                    range: range((13, 0), (13, 0)),
                    new_text: "\t// svelte-ignore state_referenced_locally\n".to_string(),
                }
            )]
        );
    }

    /// The official fixture with markup on both sides of the instance script.
    #[test]
    fn a_script_between_markup_is_still_recognised() {
        let source = "<script context=\"module\">\n</script>\n\n<p></p>\n\n<script>\n\tlet a = $state(1);\n\tlet b = $state(a);\n</script>\n\n<p></p>\n";
        let fixes = fixes(
            source,
            &[diagnostic(
                "state_referenced_locally",
                range((7, 16), (7, 17)),
            )],
        );
        assert_eq!(
            fixes[0].1,
            TextEdit {
                range: range((7, 0), (7, 0)),
                new_text: "\t// svelte-ignore state_referenced_locally\n".to_string(),
            }
        );
    }

    #[test]
    fn the_codes_the_official_server_excludes_get_no_fix() {
        for code in NON_IGNORABLE {
            assert!(
                fixes(COMPONENT, &[diagnostic(code, range((0, 0), (0, 6)))]).is_empty(),
                "{code} should not be ignorable"
            );
        }
    }

    #[test]
    fn errors_and_findings_that_are_not_compiler_warnings_get_no_fix() {
        let at = range((0, 0), (0, 6));

        let mut error = diagnostic("a11y_missing_attribute", at);
        error.severity = Some(DiagnosticSeverity::ERROR);
        assert!(fixes(COMPONENT, &[error]).is_empty(), "an error");

        let mut lint = diagnostic("svelte/no-at-html-tags", at);
        lint.source = Some("rsvelte".to_string());
        assert!(fixes(COMPONENT, &[lint]).is_empty(), "one of our own rules");

        // Every provider's diagnostics arrive in the request, so a finding from
        // another server must not draw a `svelte-ignore` comment.
        let mut foreign = diagnostic("no-undef", at);
        foreign.source = Some("eslint".to_string());
        assert!(fixes(COMPONENT, &[foreign]).is_empty(), "another server's");

        let mut no_code = diagnostic("a11y_missing_attribute", at);
        no_code.code = None;
        assert!(fixes(COMPONENT, &[no_code]).is_empty(), "no code");
    }

    /// Half-written markup is the normal state of an open document: the fix
    /// still lands on the diagnostic's own line.
    #[test]
    fn an_unparsable_document_still_yields_a_fix() {
        let source = "{#if}\n<img\n";
        let fixes = fixes(
            source,
            &[diagnostic("a11y_missing_attribute", range((1, 0), (1, 4)))],
        );
        assert_eq!(
            fixes[0].1,
            TextEdit {
                range: range((1, 0), (1, 0)),
                new_text: "<!-- svelte-ignore a11y_missing_attribute -->\n".to_string(),
            }
        );
    }

    #[test]
    fn a_crlf_document_keeps_its_line_endings() {
        let fixes = fixes(
            "<img>\r\n",
            &[diagnostic("a11y_missing_attribute", range((0, 0), (0, 5)))],
        );
        assert!(fixes[0].1.new_text.ends_with("-->\r\n"));
    }

    /// Positions cross the protocol boundary in UTF-16 units, so a finding
    /// after astral text must still resolve to its own element — read as bytes,
    /// the range would land inside the emoji and anchor to the parent instead.
    #[test]
    fn columns_are_read_as_utf16() {
        let source = "<div>\n    💡<img>\n</div>\n";
        let fixes = fixes(
            source,
            &[diagnostic("a11y_missing_attribute", range((1, 6), (1, 11)))],
        );
        assert_eq!(
            fixes[0].1,
            TextEdit {
                range: range((1, 0), (1, 0)),
                new_text: "    <!-- svelte-ignore a11y_missing_attribute -->\n".to_string(),
            }
        );
    }

    /// The whole point of the fix: applying it to the source the compiler
    /// complained about has to silence the warning it was built from.
    #[test]
    fn applying_the_fix_silences_the_warning() {
        for (source, code) in [
            ("<div>\n    <img>\n</div>\n", "a11y_missing_attribute"),
            (
                "<script>\n\tlet value = $state(\"\");\n\tlet x = value;\n</script>\n",
                "state_referenced_locally",
            ),
        ] {
            let warning = compiler_warning(source, code);
            let fixes = fixes(source, &[warning]);
            let edit = &fixes.first().expect("a fix for the warning").1;

            let index = LineIndex::new(source);
            let at = index.offset(source, edit.range.start);
            let mut fixed = source.to_string();
            fixed.insert_str(at, &edit.new_text);

            assert!(
                find_warning(&fixed, code).is_none(),
                "{code} survived the fix:\n{fixed}"
            );
        }
    }

    fn find_warning(
        source: &str,
        code: &str,
    ) -> Option<rsvelte_core::svelte_check::diagnostic::Diagnostic> {
        rsvelte_lint::lint_source(
            source,
            std::path::Path::new("App.svelte"),
            &rsvelte_core::CompileOptions::default(),
            &rsvelte_lint::LintConfig::recommended(),
        )
        .into_iter()
        .find(|d| d.code.as_deref() == Some(code))
    }

    /// The warning the linter really reports for `code`, converted the way this
    /// server publishes it.
    fn compiler_warning(source: &str, code: &str) -> Diagnostic {
        let found =
            find_warning(source, code).unwrap_or_else(|| panic!("no {code} in the fixture"));
        crate::diagnostics::to_lsp(&found, &crate::settings::CompilerWarnings::default()).unwrap()
    }

    #[test]
    fn every_diagnostic_in_the_request_gets_its_fix() {
        let fixes = fixes(
            COMPONENT,
            &[
                diagnostic("a11y_missing_attribute", range((0, 0), (0, 6))),
                diagnostic("a11y_missing_attribute", range((3, 4), (3, 11))),
            ],
        );
        assert_eq!(fixes.len(), 2);
    }
}
