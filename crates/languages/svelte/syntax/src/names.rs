//! Names the Svelte grammar classifies: component names, element names, meta tags.

use unicode_id_start as unicode_identifier_start;

/// Upstream `regex_valid_component_name`, split at its alternation (ZWNJ and ZWJ escaped):
///
/// ```text
/// ^(?:\p{Lu}[$\u{200C}\u{200D}\p{ID_Continue}.]*
///   |\p{ID_Start}[$\u{200C}\u{200D}\p{ID_Continue}]*(?:\.[$\u{200C}\u{200D}\p{ID_Continue}]+)+)$
/// ```
#[must_use]
pub fn is_component_name(name: &str) -> bool {
    let continues = |c: char| {
        c == '$'
            || c == '\u{200c}'
            || c == '\u{200d}'
            || unicode_identifier_start::is_id_continue(c)
    };
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    let rest = chars.as_str();
    if is_uppercase_letter(first) && rest.chars().all(|c| continues(c) || c == '.') {
        return true;
    }
    if !unicode_identifier_start::is_id_start(first) {
        return false;
    }
    let mut segments = rest.split('.');
    let Some(head) = segments.next() else {
        return false;
    };
    let mut members = 0;
    for seg in segments {
        if seg.is_empty() || !seg.chars().all(continues) {
            return false;
        }
        members += 1;
    }
    members > 0 && head.chars().all(continues)
}

/// `\p{Lu}`: Rust's `is_uppercase` is the Uppercase property, which adds `Other_Uppercase`.
fn is_uppercase_letter(c: char) -> bool {
    const OTHER_UPPERCASE: &[(char, char)] = &[
        ('\u{2160}', '\u{216f}'),
        ('\u{24b6}', '\u{24cf}'),
        ('\u{1f130}', '\u{1f149}'),
        ('\u{1f150}', '\u{1f169}'),
        ('\u{1f170}', '\u{1f189}'),
    ];
    c.is_uppercase()
        && !OTHER_UPPERCASE
            .iter()
            .any(|&(start_offset, end_offset)| (start_offset..=end_offset).contains(&c))
}

/// Upstream `is_valid_element_name`: a doctype, a `namespace:name`, or a tag name.
#[must_use]
pub fn is_valid_element_name(name: &str) -> bool {
    if let Some(rest) = name.strip_prefix('!') {
        return !rest.is_empty() && rest.chars().all(|c| c.is_ascii_alphabetic());
    }
    if let Some((namespace, local)) = name.split_once(':') {
        let mut chars = namespace.chars();
        let namespace_ok = chars.next().is_some_and(|c| c.is_ascii_alphabetic())
            && chars.all(|c| c.is_ascii_alphanumeric());
        let local_ok = local.len() >= 2
            && local.starts_with(|c: char| c.is_ascii_alphabetic())
            && local.ends_with(|c: char| c.is_ascii_alphanumeric())
            && local.chars().all(|c| c.is_ascii_alphanumeric() || c == '-');
        return namespace_ok && local_ok;
    }
    is_valid_tag_name(name)
}

/// Upstream `REGEX_VALID_TAG_NAME`.
fn is_valid_tag_name(name: &str) -> bool {
    let (head, tail) = name
        .split_once('-')
        .map_or((name, None), |(h, t)| (h, Some(t)));
    let mut chars = head.chars();
    if !chars.next().is_some_and(|c| c.is_ascii_alphabetic())
        || !chars.all(|c| c.is_ascii_alphanumeric())
    {
        return false;
    }
    tail.is_none_or(|t| {
        t.chars().all(|c| {
            c.is_ascii_alphanumeric()
                || matches!(c, '.' | '-' | '_' | '\u{b7}')
                || matches!(c, '\u{c0}'..='\u{d6}' | '\u{d8}'..='\u{f6}' | '\u{f8}'..='\u{37d}')
                || matches!(c, '\u{37f}'..='\u{1fff}' | '\u{200c}'..='\u{200d}')
                || matches!(c, '\u{203f}'..='\u{2040}' | '\u{2070}'..='\u{218f}')
                || matches!(c, '\u{2c00}'..='\u{2fef}' | '\u{3001}'..='\u{d7ff}')
                || matches!(c, '\u{f900}'..='\u{fdcf}' | '\u{fdf0}'..='\u{fffd}')
                || matches!(c, '\u{10000}'..='\u{effff}')
        })
    })
}

/// Upstream `meta_tags`: the `svelte:` elements.
pub const META_TAGS: &[&str] = &[
    "svelte:head",
    "svelte:options",
    "svelte:window",
    "svelte:document",
    "svelte:body",
    "svelte:element",
    "svelte:component",
    "svelte:self",
    "svelte:fragment",
    "svelte:boundary",
];
