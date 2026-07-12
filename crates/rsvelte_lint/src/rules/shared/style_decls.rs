//! Shared CSS declaration parsing for the inline-`style` rule family
//! (`no-dupe-style-properties`, `no-shorthand-style-property-overrides`).
//!
//! Both rules need the same two things from an element's style information:
//! - property declarations from the static `style="…"` attribute value
//!   (split on `;`, name read before `:`), and
//! - property declarations from string/template literals nested inside a
//!   `style="{...}"` expression tag (mirroring upstream's `getAllInlineStyles`
//!   / `extractExpressions` handling of ternary/logical branches).
//!
//! Each declaration is returned as `(name, start, end)`, the absolute byte
//! span of the property name in the source file.

/// Parse `prop: value; prop2: value2` declarations from a raw style string,
/// returning each property name with its absolute byte span.
pub fn parse_style_decls(raw: &str, base: u32) -> Vec<(String, u32, u32)> {
    let mut out = Vec::new();
    let mut decl_begin = 0usize;
    let bytes = raw.as_bytes();
    for i in 0..=bytes.len() {
        let at_end = i == bytes.len();
        if at_end || bytes[i] == b';' {
            if decl_begin < i {
                push_decl(&raw[decl_begin..i], base + decl_begin as u32, &mut out);
            }
            decl_begin = i + 1;
        }
    }
    out
}

fn push_decl(seg: &str, seg_base: u32, out: &mut Vec<(String, u32, u32)>) {
    let Some(colon) = seg.find(':') else {
        return;
    };
    let name_raw = &seg[..colon];
    let trimmed = name_raw.trim();
    if trimmed.is_empty() {
        return;
    }
    // Skip if the property name contains `{` (dynamic property name — skip)
    if trimmed.contains('{') {
        return;
    }
    let lead = name_raw.len() - name_raw.trim_start().len();
    let start = seg_base + lead as u32;
    let end = start + trimmed.len() as u32;
    out.push((trimmed.to_string(), start, end));
}

/// Extract CSS property declarations from string/template literals inside an
/// expression-tag source text (e.g. `{cond ? 'background: red' : \`color: blue\`}`).
///
/// Mirrors upstream's `extractExpressions` + `getInlineStyle`:
/// - Recurse into ternary / logical branches.
/// - Parse CSS from string literals (`'...'`, `"..."`) and template literals
///   (`` `...` ``).
/// - `${...}` interpolations inside template literals are treated as opaque.
///
/// `tag_start` is the byte offset of the `{` in the source file.
/// The returned positions are absolute byte offsets in the source file.
pub fn extract_inline_style_decls(src: &str, tag_start: u32) -> Vec<(String, u32, u32)> {
    let mut out = Vec::new();
    extract_from_expr(src.as_bytes(), tag_start, &mut out);
    out
}

fn extract_from_expr(bytes: &[u8], base: u32, out: &mut Vec<(String, u32, u32)>) {
    let mut i = 0usize;
    while i < bytes.len() {
        match bytes[i] {
            // Single-quoted string literal
            b'\'' => {
                let start = i;
                i += 1;
                while i < bytes.len() && bytes[i] != b'\'' {
                    if bytes[i] == b'\\' {
                        i += 1; // skip escaped char
                    }
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1; // skip closing quote
                }
                let content = &bytes[start + 1..i.saturating_sub(1)];
                extract_css_decls_from_literal(content, base + start as u32 + 1, out);
            }
            // Double-quoted string literal
            b'"' => {
                let start = i;
                i += 1;
                while i < bytes.len() && bytes[i] != b'"' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1;
                }
                let content = &bytes[start + 1..i.saturating_sub(1)];
                extract_css_decls_from_literal(content, base + start as u32 + 1, out);
            }
            // Template literal: skip `${...}` interpolations
            b'`' => {
                let start = i;
                i += 1;
                while i < bytes.len() && bytes[i] != b'`' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && bytes.get(i + 1) == Some(&b'{') {
                        // Skip over the interpolation `${...}`
                        i += 2; // skip `${`
                        let mut depth = 1usize;
                        while i < bytes.len() && depth > 0 {
                            match bytes[i] {
                                b'{' => depth += 1,
                                b'}' => depth -= 1,
                                _ => {}
                            }
                            i += 1;
                        }
                        continue;
                    }
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1;
                }
                // Extract the template literal content, replacing `${...}` spans
                // with a placeholder so the CSS property name offset is correct.
                let content_start = start + 1;
                let content_end = i.saturating_sub(1);
                extract_css_decls_from_template(
                    bytes,
                    content_start,
                    content_end,
                    base + content_start as u32,
                    out,
                );
            }
            _ => {
                i += 1;
            }
        }
    }
}

/// Parse CSS property names from a raw literal content (no surrounding quotes).
/// Positions are absolute (base is the absolute byte of the first char of content).
fn extract_css_decls_from_literal(content: &[u8], base: u32, out: &mut Vec<(String, u32, u32)>) {
    // Split by `;` and extract property name before `:` in each segment.
    let mut decl_begin = 0usize;
    for i in 0..=content.len() {
        if i == content.len() || content[i] == b';' {
            if decl_begin < i
                && let Ok(seg) = std::str::from_utf8(&content[decl_begin..i])
            {
                push_decl(seg, base + decl_begin as u32, out);
            }
            decl_begin = i + 1;
        }
    }
}

/// Like `extract_css_decls_from_literal` but for template literal content that
/// may contain `${...}` interpolations which we treat as opaque (they don't
/// affect the property name before `:`).
fn extract_css_decls_from_template(
    bytes: &[u8],
    content_start: usize,
    content_end: usize,
    base: u32,
    out: &mut Vec<(String, u32, u32)>,
) {
    let content = &bytes[content_start..content_end];
    let mut decl_begin = 0usize;
    let mut i = 0usize;
    while i <= content.len() {
        let at_end = i == content.len();
        let is_sep = !at_end
            && (content[i] == b';' || (content[i] == b'$' && content.get(i + 1) == Some(&b'{')));
        if at_end || is_sep {
            if decl_begin < i
                && let Ok(seg) = std::str::from_utf8(&content[decl_begin..i])
            {
                push_decl(seg, base + decl_begin as u32, out);
            }
            if !at_end && content[i] == b'$' {
                // Skip the `${...}` interpolation
                i += 2; // skip `${`
                let mut depth = 1usize;
                while i < content.len() && depth > 0 {
                    match content[i] {
                        b'{' => depth += 1,
                        b'}' => depth -= 1,
                        _ => {}
                    }
                    i += 1;
                }
                decl_begin = i;
                continue;
            }
            decl_begin = i + 1;
        }
        if at_end {
            break;
        }
        i += 1;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_declaration_names_and_spans() {
        // "background: green; color: red" → background@0, color@19
        let decls = parse_style_decls("background: green; color: red", 100);
        assert_eq!(decls[0].0, "background");
        assert_eq!(decls[0].1, 100);
        assert_eq!(decls[1].0, "color");
    }

    #[test]
    fn dangling_declaration_before_mustache_counts() {
        // "background: green; background: " (value would be an interpolation)
        let decls = parse_style_decls("background: green; background: ", 0);
        assert_eq!(decls.len(), 2);
        assert!(decls.iter().all(|d| d.0 == "background"));
    }

    #[test]
    fn extracts_from_ternary_string_literals() {
        let decls = extract_inline_style_decls("{cond ? 'color: red' : 'color: blue'}", 0);
        assert_eq!(decls.len(), 2);
        assert!(decls.iter().all(|d| d.0 == "color"));
    }

    #[test]
    fn extracts_from_template_literal_skipping_interpolation() {
        let decls = extract_inline_style_decls("{`color: ${value}`}", 0);
        assert_eq!(decls.len(), 1);
        assert_eq!(decls[0].0, "color");
    }
}
