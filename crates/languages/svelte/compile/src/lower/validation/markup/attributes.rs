//! Upstream's checks of the attributes an element or a component writes in its start tag.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, Element, ElementKind, MetadataTag, Part,
};

use crate::lower::attributes::is_directive;
use crate::lower::invalid;

/// Upstream `validate_element`'s checks of each attribute of an element, in its order: an
/// unquoted value of several parts, a name no element takes, and an `on…` attribute that is not
/// an expression.
pub(super) fn element_attributes(
    source: &str,
    el: &Element,
    attributes: &[Attribute],
) -> Result<(), Diagnostic> {
    if !matches!(
        el.kind,
        ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
    ) {
        return Ok(());
    }
    // Upstream checks the start tag's attributes before it moves a `<textarea>`'s content into a
    // `value`.
    let written = |a: &&Attribute| a.span.end_offset <= el.start_tag.end_offset;
    for a in (attributes.iter())
        .filter(written)
        .filter(|a| !is_directive(&a.value))
    {
        unquoted_sequence(a)?;
        let name = a.name.text(source);
        if is_invalid_attribute_name(name) {
            return invalid(
                "attribute_invalid_name",
                format!("'{name}' is not a valid attribute name"),
                a.span,
            );
        }
        if name.len() > 2
            && name.starts_with("on")
            && matches!(
                a.value,
                AttributeValue::Boolean
                    | AttributeValue::Static(_)
                    | AttributeValue::Interpolated(_)
            )
        {
            return invalid(
                "attribute_invalid_event_handler",
                "Event attribute must be a JavaScript expression, not a string",
                a.span,
            );
        }
    }
    Ok(())
}

/// Upstream's `regex_illegal_attribute_character`.
fn is_invalid_attribute_name(name: &str) -> bool {
    name.starts_with(|c: char| c.is_ascii_digit() || c == '-' || c == '.')
        || name.contains(|c| "^$@%&#?!|()[]{}*+~;".contains(c))
}

/// Upstream's `attribute_unquoted_sequence`: a value of text and expressions needs quotes, which
/// put its last part's end before the attribute's.
pub(super) fn unquoted_sequence(a: &Attribute) -> Result<(), Diagnostic> {
    let AttributeValue::Interpolated(parts) = &a.value else {
        return Ok(());
    };
    let last_end = |part: &Part| match *part {
        Part::Text(span) | Part::Expression { span, .. } => span.end_offset,
    };
    if parts.len() > 1
        && parts
            .last()
            .is_some_and(|p| last_end(p) == a.span.end_offset)
    {
        return invalid(
            "attribute_unquoted_sequence",
            "Attribute values containing `{...}` must be enclosed in quote marks, unless the \
                value only contains the expression",
            a.span,
        );
    }
    Ok(())
}
