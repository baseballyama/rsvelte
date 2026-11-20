//! Names the compiler derives or classifies beyond the grammar: output identifiers, SVG and
//! `MathML` elements.

use std::borrow::Cow;

use oxc_syntax::identifier::is_identifier_name;
use oxc_syntax::keyword::is_reserved_keyword;

#[cfg(test)]
mod tests;

/// Whether JavaScript reads `name` as an identifier. Svelte makes the whole name of a shorthand
/// `bind:` or `class:` one, whatever JavaScript would read there.
#[must_use]
pub fn reads_as_identifier(name: &str) -> bool {
    is_identifier_name(name) && !is_reserved_keyword(name)
}

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

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`, and the same
/// as its `regex_invalid_identifier_chars` replacement).
#[must_use]
pub fn sanitize_identifier(name: &str) -> Cow<'_, str> {
    let valid = |c: char| c.is_ascii_alphanumeric() || c == '_' || c == '$';
    if name.chars().all(valid) && !name.starts_with(|c: char| c.is_ascii_digit()) {
        Cow::Borrowed(name)
    } else {
        Cow::Owned(sanitize_chars(name.chars(), name.len()))
    }
}

fn sanitize_chars(chars: impl Iterator<Item = char>, capacity: usize) -> String {
    let mut out = String::with_capacity(capacity);
    for c in chars {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            out.push(c);
        } else {
            // Upstream's regular expression replaces each UTF-16 unit.
            out.extend(std::iter::repeat_n('_', c.len_utf16()));
        }
    }
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}
