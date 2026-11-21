//! The source with every line ending read as `\n`, as Prettier reads it before it parses.

use rsvelte_kernel::source::positions::Span;

/// `text` with each `\r\n` and each lone `\r` as `\n`.
pub(super) struct Normalized {
    pub(super) text: String,
    /// Where each `\r` before a `\n` was taken out, in `text`.
    removed: Vec<u32>,
}

impl Normalized {
    pub(super) fn new(text: &str) -> Self {
        let mut normalized = String::with_capacity(text.len());
        let mut removed = Vec::new();
        let mut rest = text;
        while let Some(at) = rest.find('\r') {
            normalized.push_str(&rest[..at]);
            rest = &rest[at + 1..];
            if rest.starts_with('\n') {
                removed.push(normalized.len() as u32);
            } else {
                normalized.push('\n');
            }
        }
        normalized.push_str(rest);
        Self {
            text: normalized,
            removed,
        }
    }

    /// `span` of [`Self::text`] in the text it was made from.
    pub(super) fn original(&self, span: Span) -> Span {
        let at = |offset: u32| offset + self.removed.partition_point(|&r| r < offset) as u32;
        Span::new(at(span.start_offset), at(span.end_offset))
    }
}

#[cfg(test)]
mod tests;
