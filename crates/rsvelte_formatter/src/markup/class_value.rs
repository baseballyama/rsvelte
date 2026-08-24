//! Whitespace normalization of a `class` attribute value on a regular element.
//!
//! Port of prettier-plugin-svelte's `Text` printer branch guarded by
//! `parent.name === 'class' && path.getParentNode(1).type === 'RegularElement'`
//! (`print/index.ts`). It is two passes over each text node's raw source:
//!
//! ```js
//! rawText = rawText.replace(
//!   /([^ \t\n])(([ \t]+$)|([ \t]+(\r?\n))|[ \t]+)/g,
//!   (match, char, _, isEndOfString, isEndOfLine, endOfLine) =>
//!     isEndOfString ? match : char + (isEndOfLine ? endOfLine : ' '),
//! );
//! rawText = rawText.replace(
//!   /([^ \t\n])[ \t]+$/,
//!   isLastValuePart ? '$1' : '$1 ',
//! );
//! ```
//!
//! Both patterns require a `[^ \t\n]` immediately before the run, so leading
//! whitespace — at the start of the node or after a newline — is preserved.

use std::borrow::Cow;

use rsvelte_core::ast::template::AttributeValuePart;

/// Apply the two passes to one text node. `is_last_part` is upstream's
/// `parent.value.indexOf(node) === parent.value.length - 1`.
fn normalize_class_text(raw: &str, is_last_part: bool) -> Cow<'_, str> {
    let bytes = raw.as_bytes();
    let mut out: Option<String> = None;
    let mut copied = 0usize;
    let mut index = 0usize;

    while index < bytes.len() {
        if bytes[index] != b' ' && bytes[index] != b'\t' {
            index += 1;
            continue;
        }
        let run_start = index;
        while index < bytes.len() && (bytes[index] == b' ' || bytes[index] == b'\t') {
            index += 1;
        }
        // The regex anchors on a preceding `[^ \t\n]`; a run at the start of the
        // node or right after a newline has none, so it survives verbatim.
        if run_start == 0 || bytes[run_start - 1] == b'\n' {
            continue;
        }
        let replacement = if index == bytes.len() {
            // End of string: pass 1 keeps the match, pass 2 decides.
            if is_last_part { "" } else { " " }
        } else if bytes[index] == b'\n'
            || (bytes[index] == b'\r' && bytes.get(index + 1) == Some(&b'\n'))
        {
            // Trailing whitespace on a line with content — dropped, the
            // line terminator is re-emitted by the untouched tail.
            ""
        } else {
            " "
        };
        if raw[run_start..index] == *replacement {
            continue;
        }
        let buffer = out.get_or_insert_with(String::new);
        buffer.push_str(&raw[copied..run_start]);
        buffer.push_str(replacement);
        copied = index;
    }

    match out {
        Some(mut buffer) => {
            buffer.push_str(&raw[copied..]);
            Cow::Owned(buffer)
        }
        None => Cow::Borrowed(raw),
    }
}

/// Normalized copies of `parts` for a `class` attribute on a regular element,
/// or `None` when no text node changes (the common case — the caller then
/// renders the original slice and allocates nothing).
pub(super) fn normalized_class_parts<'a>(
    parts: &[AttributeValuePart<'a>],
) -> Option<Vec<AttributeValuePart<'a>>> {
    let last = parts.len().checked_sub(1)?;
    let mut changed = false;
    let mut out = Vec::with_capacity(parts.len());
    for (index, part) in parts.iter().enumerate() {
        match part {
            AttributeValuePart::Text(text) => {
                let raw = normalize_class_text(text.raw.as_ref(), index == last);
                let data = normalize_class_text(text.data.as_ref(), index == last);
                changed |= matches!(raw, Cow::Owned(_)) || matches!(data, Cow::Owned(_));
                let mut text = text.clone();
                text.raw = Cow::Owned(raw.into_owned());
                text.data = Cow::Owned(data.into_owned());
                out.push(AttributeValuePart::Text(text));
            }
            part => out.push(part.clone()),
        }
    }
    changed.then_some(out)
}

#[cfg(test)]
mod tests {
    use super::normalize_class_text;

    #[test]
    fn collapses_interior_runs() {
        assert_eq!(normalize_class_text("a  b   c", true), "a b c");
    }

    #[test]
    fn keeps_leading_run_and_drops_trailing_on_the_last_part() {
        assert_eq!(
            normalize_class_text("  lead and trail  ", true),
            "  lead and trail"
        );
    }

    #[test]
    fn shrinks_trailing_run_when_a_part_follows() {
        assert_eq!(normalize_class_text("a  ", false), "a ");
    }

    #[test]
    fn drops_trailing_whitespace_before_a_newline() {
        assert_eq!(normalize_class_text("a  \n  b", true), "a\n  b");
    }

    #[test]
    fn keeps_a_run_that_is_only_whitespace() {
        assert_eq!(normalize_class_text("   ", true), "   ");
    }
}
