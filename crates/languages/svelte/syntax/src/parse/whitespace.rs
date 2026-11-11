use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

/// The length of the whitespace that starts `text`, as upstream's `is_whitespace` (`/\s/`) reads
/// it.
pub(super) fn whitespace_len(text: &str) -> usize {
    text.len() - trim_whitespace_start(text).len()
}

pub(super) fn trim_whitespace_start(text: &str) -> &str {
    text.trim_start_matches(is_ecmascript_whitespace)
}
