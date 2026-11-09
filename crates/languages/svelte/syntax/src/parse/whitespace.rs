use rsvelte_typescript_syntax::lexer::is_javascript_whitespace;

/// The length of the whitespace `text` starts with: upstream's `/\s/`, JavaScript's whitespace and
/// line terminators.
pub(super) fn whitespace_len(text: &str) -> usize {
    text.len() - trim_start(text).len()
}

pub(super) fn trim_start(text: &str) -> &str {
    text.trim_start_matches(is_javascript_whitespace)
}
