//! Upstream's checks of the attributes `<svelte:fragment>` takes and of a component's `let:`.

use oxc_span::GetSpan;
use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, MetadataTag};

use super::super::super::special::invalid;
use super::super::super::{Attribute, AttributeValue, CompileInput, Diagnostic, Element, NodeKind};

/// `<svelte:fragment>` takes attributes and `let:` directives, nothing else.
pub(super) fn fragment(el: &Element, attributes: &[Attribute]) -> Result<(), Diagnostic> {
    if el.kind != ElementKind::Metadata(Some(MetadataTag::Fragment)) {
        return Ok(());
    }
    let other = attributes.iter().find(|a| {
        !matches!(
            a.value,
            AttributeValue::Boolean
                | AttributeValue::Static(_)
                | AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_)
                | AttributeValue::Let(_)
        )
    });
    other.map_or(Ok(()), |a| {
        invalid(
            "svelte_fragment_invalid_attribute",
            "`<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive",
            a.span,
        )
    })
}

/// A component with a `children` snippet and no text `slot` gets nothing through `let:`.
pub(super) fn snippet_conflict(
    input: &CompileInput<'_>,
    el: &Element,
    attributes: &[Attribute],
) -> Result<(), Diagnostic> {
    let source = input.component.source_text;
    let javascript = input.component.javascript;
    let tree = input.component.compiler_syntax_tree;
    let Some(directive) = attributes
        .iter()
        .find(|a| matches!(a.value, AttributeValue::Let(_)))
    else {
        return Ok(());
    };
    // Upstream's `determine_slot` reads a text slot, and an empty name counts as none.
    let slotted = attributes.iter().any(|a| {
        a.name.text(source) == "slot"
            && matches!(&a.value, AttributeValue::Static(name) if !name.is_empty())
    });
    let children = tree.children(el.children).iter().any(|&child| {
        matches!(&tree.node(child).kind, NodeKind::Snippet(snippet)
            if matches!(javascript.get_expression(snippet.name),
                oxc_ast::ast::Expression::Identifier(name) if name.name == "children"))
    });
    if !el.kind.renders_component() || slotted || !children {
        return Ok(());
    }
    let name = directive.name.text(source);
    let AttributeValue::Let(expression) = directive.value else {
        return Ok(());
    };
    let pattern = expression
        .map(|e| javascript.get_expression(e))
        .map_or_else(
            || name.to_owned(),
            |e| match e {
                oxc_ast::ast::Expression::Identifier(id) if id.name == name => name.to_owned(),
                e => {
                    let span = e.span();
                    format!(
                        "{name}: {}",
                        &source[span.start as usize..span.end as usize]
                    )
                }
            },
        );
    invalid(
        "let_directive_snippet_conflict",
        &format!(
            "Cannot use `let:` directives on a component that has a `children` snippet. Use \
             snippet parameters instead (e.g. `{{#snippet children({{ {pattern} }})}}`)"
        ),
        directive.span,
    )
}
