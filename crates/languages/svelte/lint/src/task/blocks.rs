use rsvelte_kernel::diagnostics::Diagnostic;

/// The error Svelte's parser throws on the template as svelte-eslint-parser hands it over: with
/// the content of each `<script>` and `<style>` it finds blanked out. Only a document whose blocks
/// that finds differently from Svelte's parser is parsed again.
pub(super) fn template_error(source_text: &str) -> Option<Diagnostic> {
    let bytes = source_text.as_bytes();
    let blocks = blocks(bytes)?;
    let differs = blocks.iter().any(|&(start, end)| {
        let content = &bytes[start..end];
        find(content, b"<script").is_some() || find(content, b"</script").is_some()
    }) || count(bytes, b"</style>") > count(bytes, b"<style");
    if !differs {
        return None;
    }
    let mut blanked = bytes.to_vec();
    for &(start, end) in &blocks {
        for byte in &mut blanked[start..end] {
            if !matches!(byte, b'\n' | b'\r') {
                *byte = b' ';
            }
        }
    }
    let blanked = String::from_utf8(blanked).ok()?;
    rsvelte_svelte_syntax::parse::parse(&blanked).err()
}

/// The content ranges of the `<script>` and `<style>` blocks svelte-eslint-parser finds, which a
/// case-insensitive search for the tags and their first end tag gives; `None` when it finds a
/// self-closing one or none, or a `<template>`, which it reads in ways this does not follow.
fn blocks(bytes: &[u8]) -> Option<Vec<(usize, usize)>> {
    let mut blocks = Vec::new();
    let mut at = 0;
    while let Some(found) = bytes[at..].iter().position(|&byte| byte == b'<') {
        let start = at + found;
        let rest = &bytes[start..];
        if rest.starts_with(b"<!--") {
            at = start + 4 + find(&rest[4..], b"-->")? + 3;
            continue;
        }
        let tag = [&b"script"[..], b"style", b"template"]
            .into_iter()
            .find(|tag| {
                rest.get(1..=tag.len())
                    .is_some_and(|name| name.eq_ignore_ascii_case(tag))
                    && rest
                        .get(1 + tag.len())
                        .is_some_and(|next| next.is_ascii_whitespace() || *next == b'>')
            });
        let Some(tag) = tag else {
            at = start + 1;
            continue;
        };
        if tag == b"template" {
            return None;
        }
        let open_end = start + 1 + tag.len() + start_tag_len(&rest[1 + tag.len()..])?;
        if bytes[open_end - 2] == b'/' {
            return None;
        }
        let end = open_end + find_end_tag(&bytes[open_end..], tag)?;
        blocks.push((open_end, end));
        at = end + tag.len() + 3;
    }
    (!blocks.is_empty()).then_some(blocks)
}

/// The length of a start tag's rest up to and with its `>`, outside quoted values.
fn start_tag_len(rest: &[u8]) -> Option<usize> {
    let mut quote = None;
    for (index, &byte) in rest.iter().enumerate() {
        match (quote, byte) {
            (None, b'"' | b'\'') => quote = Some(byte),
            (Some(open), _) if open == byte => quote = None,
            (None, b'>') => return Some(index + 1),
            _ => {}
        }
    }
    None
}

/// Where `</tag>` first starts in `bytes`, in any case.
fn find_end_tag(bytes: &[u8], tag: &[u8]) -> Option<usize> {
    (0..bytes.len()).find(|&at| {
        bytes[at..].starts_with(b"</")
            && bytes
                .get(at + 2..at + 2 + tag.len())
                .is_some_and(|name| name.eq_ignore_ascii_case(tag))
            && bytes.get(at + 2 + tag.len()) == Some(&b'>')
    })
}

/// Where `needle`, in lower case, first starts in `bytes`, in any case.
fn find(bytes: &[u8], needle: &[u8]) -> Option<usize> {
    bytes
        .windows(needle.len())
        .position(|window| window.eq_ignore_ascii_case(needle))
}

fn count(bytes: &[u8], needle: &[u8]) -> usize {
    bytes
        .windows(needle.len())
        .filter(|window| window.eq_ignore_ascii_case(needle))
        .count()
}
