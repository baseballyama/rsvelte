pub(super) fn whitespace_len(bytes: &[u8]) -> usize {
    bytes
        .iter()
        .position(|byte| !byte.is_ascii_whitespace())
        .unwrap_or(bytes.len())
}

pub(super) fn trim_ascii_start(text: &str) -> &str {
    &text[whitespace_len(text.as_bytes())..]
}
