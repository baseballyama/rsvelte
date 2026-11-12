//! svelte2tsx's `blankVerbatimContent`: it blanks every `<script>` and `<style>` body it finds
//! with its own regular expressions before Svelte parses the component, so svelte-check reports
//! the parse error of that text, not of the component as written.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

/// The byte ranges of the `<script>` and `<style>` bodies svelte2tsx finds, in order.
pub(super) fn bodies(source: &str) -> Vec<(usize, usize)> {
    let mut bodies = Vec::new();
    let mut from = 0;
    while let Some((body, next)) = next_element(source, from) {
        bodies.push(body);
        from = next;
    }
    bodies
}

/// The component with `bodies` blanked. Every byte but `\n` becomes a space, so each offset is
/// the original's, and a line's last four bytes become `/**/` as svelte2tsx writes.
pub(super) fn blanked(source: &str, bodies: &[(usize, usize)]) -> String {
    let mut out = source.as_bytes().to_vec();
    for &(start, end) in bodies {
        let mut line = start;
        for i in start..end {
            if out[i] == b'\n' {
                if i - line >= 4 {
                    out[i - 4..i].copy_from_slice(b"/**/");
                }
                line = i + 1;
            } else {
                out[i] = b' ';
            }
        }
    }
    String::from_utf8(out).expect("only whole characters are blanked")
}

/// The body of the first `<script>` or `<style>` at or after `from`, and where the search goes on.
fn next_element(source: &str, from: usize) -> Option<((usize, usize), usize)> {
    ["script", "style"]
        .into_iter()
        .filter_map(|tag| first_match(source, from, tag))
        .min_by_key(|(_, _, start)| *start)
        .map(|(body, next, _)| (body, next))
}

/// `/(<!--[^]*?-->)|(<tag(attributes)>)([\S\s]*?)<\/tag>/g` from `from`, skipping comments:
/// the body, the end of the match and its start.
fn first_match(source: &str, from: usize, tag: &str) -> Option<((usize, usize), usize, usize)> {
    let bytes = source.as_bytes();
    let close = format!("</{tag}>");
    let mut at = from;
    while at < bytes.len() {
        let rest = &source[at..];
        if let Some(comment) = rest.strip_prefix("<!--") {
            if let Some(end) = comment.find("-->") {
                at += 4 + end + 3;
                continue;
            }
        } else if rest.strip_prefix('<').is_some_and(|r| r.starts_with(tag))
            && let Some(body_start) = start_tag_end(source, at + 1 + tag.len()).map(|gt| gt + 1)
            && let Some(len) = source[body_start..].find(&close)
        {
            let body_end = body_start + len;
            return Some(((body_start, body_end), body_end + close.len(), at));
        }
        at += rest.chars().next().map_or(1, char::len_utf8);
    }
    None
}

/// The `>` that ends the attributes starting at `at`, as
/// `((?:\s+[^=>'"\/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"\/\s]+)*\s*)>` reads them.
fn start_tag_end(source: &str, mut at: usize) -> Option<usize> {
    let whitespace = |from: usize| {
        source[from..]
            .find(|c: char| !is_ecmascript_whitespace(c))
            .map_or(source.len(), |n| from + n)
    };
    let name = |from: usize| {
        source[from..]
            .find(|c: char| {
                matches!(c, '=' | '>' | '\'' | '"' | '/') || is_ecmascript_whitespace(c)
            })
            .map_or(source.len(), |n| from + n)
    };
    loop {
        let name_start = whitespace(at);
        let name_end = name(name_start);
        if name_start == at || name_end == name_start {
            break;
        }
        at = name_end;
        if source[at..].starts_with('=') {
            let value = at + 1;
            let end = if let Some(&quote @ (b'"' | b'\'')) = source.as_bytes().get(value) {
                source[value + 1..]
                    .find(quote as char)
                    .map(|n| value + 1 + n + 1)
            } else {
                let end = source[value..]
                    .find(|c: char| c == '>' || is_ecmascript_whitespace(c))
                    .map_or(source.len(), |n| value + n);
                (end > value).then_some(end)
            };
            // Without a value only the name matches, and the `=` then stands where `>` must.
            at = end?;
        }
    }
    let gt = whitespace(at);
    source[gt..].starts_with('>').then_some(gt)
}

#[cfg(test)]
mod tests;
