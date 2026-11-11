//! Upstream `const_tag_invalid_reference`: a snippet that reads a `{@const}` of the content it is
//! hoisted out of.

use oxc_semantic::ScopeId;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, MetadataTag,
};
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rsvelte_svelte_semantic::warnings::Raised;

use super::super::paths::bound_names;
use super::super::special::error;
use super::{CompileInput, Diagnostic, ElementKind, NodeKind, Resolution, snippet_name, walk};

/// The first reference, in document order, from a snippet to a `{@const}` or `{let}` declared
/// in the component's default content that the snippet is hoisted out of. Upstream checks this
/// only with `experimental.async`; without it, the snippet reads the name out of its scope.
pub(super) fn invalid_reference(
    input: &CompileInput<'_>,
    res: &Resolution,
) -> Option<(Raised, Diagnostic)> {
    let tree = input.component.compiler_syntax_tree;
    let javascript = input.component.javascript;
    let mut snippets: Vec<(u32, u32, CompilerNodeIdentifier)> = (tree.nodes.iter_enumerated())
        .filter(|(_, node)| matches!(node.kind, NodeKind::Snippet(_)))
        .map(|(identifier, node)| (node.span.start_offset, node.span.end_offset, identifier))
        .collect();
    if snippets.is_empty() {
        return None;
    }
    snippets.sort_unstable_by_key(|&(start, ..)| start);
    let mut first: Option<(u32, u32, String)> = None;
    for node in &tree.nodes {
        let (NodeKind::Const { declaration } | NodeKind::Declaration { declaration }) = node.kind
        else {
            continue;
        };
        for declarator in &javascript.get_declaration(declaration).declarations {
            bound_names(&declarator.id, false, &mut |binding, _| {
                let symbol = binding.symbol_id();
                let scope = res.scoping().symbol_scope_id(symbol);
                for &reference in res.scoping().get_resolved_reference_ids(symbol) {
                    let span = res.reference_span(reference);
                    if first
                        .as_ref()
                        .is_some_and(|&(start, ..)| start <= span.start)
                    {
                        continue;
                    }
                    let Some(snippet) = innermost(tree, &snippets, span.start) else {
                        continue;
                    };
                    if hoisted_from(input, res, snippet) == Some(scope) {
                        first = Some((span.start, span.end, binding.name.to_string()));
                    }
                }
            });
        }
    }
    let (start, end, name) = first?;
    let message =
        format!("The `{{@const {name} = ...}}` declaration is not available in this snippet");
    let span = crate::lower::Span::new(start, end);
    Some((
        walk(start),
        error("const_tag_invalid_reference", &message, span),
    ))
}

/// The innermost snippet around `at`: the last that starts before it, or the nearest snippet
/// around that one which also holds `at`.
fn innermost(
    tree: &CompilerSyntaxTree,
    snippets: &[(u32, u32, CompilerNodeIdentifier)],
    at: u32,
) -> Option<CompilerNodeIdentifier> {
    let index = snippets
        .partition_point(|&(start, ..)| start <= at)
        .checked_sub(1)?;
    let mut current = Some(snippets[index].2);
    while let Some(identifier) = current {
        let node = tree.node(identifier);
        if matches!(node.kind, NodeKind::Snippet(_))
            && node.span.start_offset <= at
            && at < node.span.end_offset
        {
            return Some(identifier);
        }
        current = node.parent;
    }
    None
}

/// The scope whose `{@const}`s `snippet` cannot read: that of the first component's content
/// around it. A boundary's `failed` or `pending`, or a snippet in one, reads them, since
/// upstream repeats the boundary's `{@const}`s in it without `experimental.async`.
fn hoisted_from(
    input: &CompileInput<'_>,
    res: &Resolution,
    snippet: CompilerNodeIdentifier,
) -> Option<ScopeId> {
    let tree = input.component.compiler_syntax_tree;
    let mut name = "";
    let mut current = Some(snippet);
    while let Some(identifier) = current {
        let node = tree.node(identifier);
        match &node.kind {
            NodeKind::Snippet(s) => name = snippet_name(input.component.javascript, s),
            NodeKind::Element(el) if el.kind.renders_component() => {
                return res.template_scope(TemplateScope::Fragment(el.children));
            }
            NodeKind::Element(el)
                if el.kind == ElementKind::Metadata(Some(MetadataTag::Boundary))
                    && matches!(name, "failed" | "pending") =>
            {
                return None;
            }
            _ => {}
        }
        current = node.parent;
    }
    None
}
