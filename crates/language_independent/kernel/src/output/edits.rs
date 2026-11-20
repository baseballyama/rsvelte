//! A minimal edit list, for tasks that patch the original text instead of reprinting it.

use crate::source::positions::Span;

/// Insertions and deletions against an original text, applied in one pass.
#[derive(Default, Debug)]
pub struct TextEdits<T> {
    items: Vec<(u32, u32, T)>,
}

pub type Edits = TextEdits<String>;
pub type BorrowedEdits<'a> = TextEdits<&'a str>;

impl<T: AsRef<str>> TextEdits<T> {
    pub fn insert(&mut self, at: u32, text: impl Into<T>) {
        self.items.push((at, at, text.into()));
    }

    pub fn replace(&mut self, span: Span, text: impl Into<T>) {
        self.items
            .push((span.start_offset, span.end_offset, text.into()));
    }

    /// Applies the edits and returns only `range` of the result. Inserts at the same offset keep
    /// the order they were added in.
    ///
    /// # Panics
    ///
    /// If two edits overlap or an edit lies outside `range`.
    #[must_use]
    pub fn apply_in(mut self, source_text: &str, range: Span) -> String {
        assert!(
            range.start_offset <= range.end_offset
                && range.end_offset as usize <= source_text.len(),
            "range outside the source"
        );
        self.items
            .sort_by_key(|&(start_offset, end_offset, _)| (start_offset, end_offset));
        let mut output_len = range.len() as usize;
        let mut checked_to = range.start_offset;
        for (start_offset, end_offset, text) in &self.items {
            assert!(
                range.start_offset <= *start_offset
                    && *start_offset <= *end_offset
                    && *end_offset <= range.end_offset,
                "edit outside the range"
            );
            assert!(
                *start_offset >= checked_to,
                "overlapping edits at {start_offset}"
            );
            output_len = output_len
                .checked_sub((*end_offset - *start_offset) as usize)
                .and_then(|len| len.checked_add(text.as_ref().len()))
                .expect("edited text length fits usize");
            checked_to = *end_offset;
        }
        let mut out = String::with_capacity(output_len);
        let mut position = range.start_offset as usize;
        for (start_offset, end_offset, text) in self.items {
            out.push_str(&source_text[position..start_offset as usize]);
            out.push_str(text.as_ref());
            position = end_offset as usize;
        }
        out.push_str(&source_text[position..range.end_offset as usize]);
        out
    }
}

#[cfg(test)]
mod tests;
