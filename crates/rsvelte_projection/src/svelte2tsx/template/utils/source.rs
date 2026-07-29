//! Raw-source scanners for tag positions that the AST does not record.

/// Count the number of whitespace characters between the tag name and the
/// first attribute in the opening tag source. This preserves whitespace
/// that the JS svelte2tsx would keep via MagicString in-place editing.
///
/// For `<Test b="6" />`, returns 1 (the space between `Test` and `b`).
/// For `<div class="foo">`, returns 1.
/// For `<Component\n  prop>`, returns 3 (newline + 2 spaces).
pub(crate) fn count_tag_to_attr_spaces(tag_name: &str, el_start: u32, source: &str) -> usize {
    let name_end = el_start as usize + 1 + tag_name.len(); // +1 for '<'
    let bytes = source.as_bytes();
    let mut count = 0;
    let mut i = name_end;
    let end = source.len();
    while i < end {
        let ch = bytes[i];
        if ch == b' ' || ch == b'\t' || ch == b'\n' || ch == b'\r' {
            count += 1;
            i += 1;
        } else {
            break;
        }
    }
    count
}

/// Find the end of the opening tag (position after the closing `>`).
///
/// Scans from `start` looking for the first `>` that is not inside a string
/// or expression. Returns the position after the `>`.
pub(crate) fn find_opening_tag_end(source: &str, start: u32, element_end: u32) -> u32 {
    let bytes = source.as_bytes();
    let start = start as usize;
    let end = element_end as usize;
    let mut i = start;
    let mut in_string = None::<u8>; // tracks quote char
    let mut brace_depth = 0u32;

    while i < end {
        let ch = bytes[i];

        match in_string {
            Some(quote) => {
                if ch == quote && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                }
            }
            None => {
                // Inside an expression value (`{ … }`), skip JS comments so a
                // quote within them (`// don't` / `/* don't */`) doesn't start a
                // fake string and throw off the brace tracking — which would make
                // this return the wrong `>` and overwrite past the tag.
                if brace_depth > 0 && ch == b'/' && i + 1 < end {
                    if bytes[i + 1] == b'/' {
                        while i < end && bytes[i] != b'\n' {
                            i += 1;
                        }
                        continue;
                    } else if bytes[i + 1] == b'*' {
                        i += 2;
                        while i + 1 < end && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                            i += 1;
                        }
                        i += 2; // skip the closing `*/`
                        continue;
                    }
                }
                if ch == b'"' || ch == b'\'' || ch == b'`' {
                    in_string = Some(ch);
                } else if ch == b'{' {
                    brace_depth += 1;
                } else if ch == b'}' {
                    brace_depth = brace_depth.saturating_sub(1);
                } else if ch == b'>' && brace_depth == 0 {
                    return (i + 1) as u32;
                }
            }
        }
        i += 1;
    }

    // Fallback: return element end
    element_end
}

/// Find the start of the closing tag.
///
/// Scans backwards from `end` looking for `</`.
/// True when the `</…>` at `closing_tag_start` is the closing tag for an
/// element named `name` (case-insensitive). Used to distinguish a real closing
/// tag from a child's closing tag wrongly matched on an auto-closed element.
pub(crate) fn closing_tag_name_matches(source: &str, closing_tag_start: u32, name: &str) -> bool {
    let rest = &source[closing_tag_start as usize..];
    let Some(after) = rest.strip_prefix("</") else {
        return false;
    };
    // Read the tag-name characters following `</`.
    let tag: String = after
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == ':' || *c == '.')
        .collect();
    tag.eq_ignore_ascii_case(name)
}

pub(crate) fn find_closing_tag_start(source: &str, end: u32) -> u32 {
    let bytes = source.as_bytes();
    let end = end as usize;

    // Check if this is a self-closing tag (ends with `/>`)
    if end >= 2 && bytes[end - 2] == b'/' && bytes[end - 1] == b'>' {
        return end as u32; // Return end to signal self-closing
    }

    // Scan backwards for `</`
    let mut i = end;
    while i >= 2 {
        i -= 1;
        if bytes[i] == b'<' && i + 1 < end && bytes[i + 1] == b'/' {
            return i as u32;
        }
    }

    end as u32
}
