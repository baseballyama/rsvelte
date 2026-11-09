//! Names the Svelte grammar classifies: component names, element names, meta tags.

use std::borrow::Cow;

use unicode_id_start as unicode_identifier_start;

#[cfg(test)]
mod tests;

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

/// Upstream `is_svg`: the SVG element names, case-sensitively.
#[must_use]
pub fn is_svg(name: &str) -> bool {
    matches!(
        name,
        "altGlyph"
            | "altGlyphDef"
            | "altGlyphItem"
            | "animate"
            | "animateColor"
            | "animateMotion"
            | "animateTransform"
            | "circle"
            | "clipPath"
            | "color-profile"
            | "cursor"
            | "defs"
            | "desc"
            | "discard"
            | "ellipse"
            | "feBlend"
            | "feColorMatrix"
            | "feComponentTransfer"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feDistantLight"
            | "feDropShadow"
            | "feFlood"
            | "feFuncA"
            | "feFuncB"
            | "feFuncG"
            | "feFuncR"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "fePointLight"
            | "feSpecularLighting"
            | "feSpotLight"
            | "feTile"
            | "feTurbulence"
            | "filter"
            | "font"
            | "font-face"
            | "font-face-format"
            | "font-face-name"
            | "font-face-src"
            | "font-face-uri"
            | "foreignObject"
            | "g"
            | "glyph"
            | "glyphRef"
            | "hatch"
            | "hatchpath"
            | "hkern"
            | "image"
            | "line"
            | "linearGradient"
            | "marker"
            | "mask"
            | "mesh"
            | "meshgradient"
            | "meshpatch"
            | "meshrow"
            | "metadata"
            | "missing-glyph"
            | "mpath"
            | "path"
            | "pattern"
            | "polygon"
            | "polyline"
            | "radialGradient"
            | "rect"
            | "set"
            | "solidcolor"
            | "stop"
            | "svg"
            | "switch"
            | "symbol"
            | "text"
            | "textPath"
            | "tref"
            | "tspan"
            | "unknown"
            | "use"
            | "view"
            | "vkern"
    )
}

/// Upstream `is_mathml`: the `MathML` element names, case-sensitively.
#[must_use]
pub fn is_mathml(name: &str) -> bool {
    matches!(
        name,
        "annotation"
            | "annotation-xml"
            | "maction"
            | "math"
            | "merror"
            | "mfrac"
            | "mi"
            | "mmultiscripts"
            | "mn"
            | "mo"
            | "mover"
            | "mpadded"
            | "mphantom"
            | "mprescripts"
            | "mroot"
            | "mrow"
            | "ms"
            | "mspace"
            | "msqrt"
            | "mstyle"
            | "msub"
            | "msubsup"
            | "msup"
            | "mtable"
            | "mtd"
            | "mtext"
            | "mtr"
            | "munder"
            | "munderover"
            | "semantics"
    )
}

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
#[must_use]
pub fn component_name(filename: &str) -> String {
    let mut parts = filename.rsplit(['/', '\\']);
    let basename = parts.next().unwrap_or("");
    let last_dir = parts.next();
    let mut name = basename
        .strip_suffix(".svelte")
        .filter(|stem| !stem.contains(".svelte"))
        .map_or_else(
            || {
                if basename.contains(".svelte") {
                    Cow::Owned(basename.replacen(".svelte", "", 1))
                } else {
                    Cow::Borrowed(basename)
                }
            },
            Cow::Borrowed,
        );
    if name == "index"
        && let Some(dir) = last_dir
        && !dir.is_empty()
        && dir != "src"
    {
        name = Cow::Borrowed(dir);
    }
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return String::new();
    };
    sanitize_chars(first.to_uppercase().chain(chars), name.len())
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`).
#[must_use]
pub fn sanitize_identifier(name: &str) -> String {
    sanitize_chars(name.chars(), name.len())
}

fn sanitize_chars(chars: impl Iterator<Item = char>, capacity: usize) -> String {
    let mut out = String::with_capacity(capacity);
    out.extend(chars.map(|c| {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            c
        } else {
            '_'
        }
    }));
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}
