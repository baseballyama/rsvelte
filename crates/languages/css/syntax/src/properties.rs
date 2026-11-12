//! Facts about CSS property names: the known ones, vendor prefixes and shorthands.

/// Every property `known-css-properties` lists, sorted.
static KNOWN: &[&str] = &include!("../vendor/known_properties.rs");

/// Whether `known-css-properties` lists `name`.
#[must_use]
pub fn is_known(name: &str) -> bool {
    KNOWN.binary_search(&name).is_ok()
}

/// The vendor prefix of `name` (`-webkit-` in `-webkit-transform`), or `""`.
#[must_use]
pub fn vendor_prefix(name: &str) -> &str {
    let Some(rest) = name.strip_prefix('-') else {
        return "";
    };
    let word = rest
        .bytes()
        .take_while(|b| b.is_ascii_alphanumeric() || *b == b'_')
        .count();
    if word > 0 && rest.as_bytes().get(word) == Some(&b'-') {
        &name[..word + 2]
    } else {
        ""
    }
}

/// `name` without the browser prefix Svelte removes: `-webkit-`, `-moz-`, `-o-` or `-ms-`.
#[must_use]
pub fn without_browser_prefix(name: &str) -> &str {
    BROWSER_PREFIXES
        .iter()
        .find_map(|prefix| name.strip_prefix(prefix))
        .unwrap_or(name)
}

const BROWSER_PREFIXES: [&str; 4] = ["-webkit-", "-moz-", "-o-", "-ms-"];

/// Whether Svelte renames the keyframes in the value of `property`: `animation` or
/// `animation-name` once lowercased as JavaScript does and without a browser prefix.
#[must_use]
pub fn names_keyframes(property: &str) -> bool {
    if !property.is_ascii() {
        // A non-ASCII letter can lowercase to an ASCII one, as the Kelvin sign does to `k`.
        let lower = property.to_lowercase();
        return lower.is_ascii() && names_keyframes(&lower);
    }
    let name = BROWSER_PREFIXES
        .iter()
        .find_map(|prefix| {
            property
                .get(..prefix.len())
                .filter(|start| start.eq_ignore_ascii_case(prefix))
                .map(|_| &property[prefix.len()..])
        })
        .unwrap_or(property);
    name.eq_ignore_ascii_case("animation") || name.eq_ignore_ascii_case("animation-name")
}

/// The longhands a shorthand property sets; empty for any other property.
#[must_use]
pub fn longhands(shorthand: &str) -> &'static [&'static str] {
    SHORTHANDS
        .iter()
        .find(|(name, _)| *name == shorthand)
        .map_or(&[], |(_, longhands)| longhands)
}

static SHORTHANDS: &[(&str, &[&str])] = &[
    (
        "margin",
        &["margin-top", "margin-bottom", "margin-left", "margin-right"],
    ),
    (
        "padding",
        &[
            "padding-top",
            "padding-bottom",
            "padding-left",
            "padding-right",
        ],
    ),
    (
        "background",
        &[
            "background-image",
            "background-size",
            "background-position",
            "background-repeat",
            "background-origin",
            "background-clip",
            "background-attachment",
            "background-color",
        ],
    ),
    (
        "font",
        &[
            "font-style",
            "font-variant",
            "font-weight",
            "font-stretch",
            "font-size",
            "font-family",
            "line-height",
        ],
    ),
    (
        "border",
        &[
            "border-top-width",
            "border-bottom-width",
            "border-left-width",
            "border-right-width",
            "border-top-style",
            "border-bottom-style",
            "border-left-style",
            "border-right-style",
            "border-top-color",
            "border-bottom-color",
            "border-left-color",
            "border-right-color",
        ],
    ),
    (
        "border-top",
        &["border-top-width", "border-top-style", "border-top-color"],
    ),
    (
        "border-bottom",
        &[
            "border-bottom-width",
            "border-bottom-style",
            "border-bottom-color",
        ],
    ),
    (
        "border-left",
        &[
            "border-left-width",
            "border-left-style",
            "border-left-color",
        ],
    ),
    (
        "border-right",
        &[
            "border-right-width",
            "border-right-style",
            "border-right-color",
        ],
    ),
    (
        "border-width",
        &[
            "border-top-width",
            "border-bottom-width",
            "border-left-width",
            "border-right-width",
        ],
    ),
    (
        "border-style",
        &[
            "border-top-style",
            "border-bottom-style",
            "border-left-style",
            "border-right-style",
        ],
    ),
    (
        "border-color",
        &[
            "border-top-color",
            "border-bottom-color",
            "border-left-color",
            "border-right-color",
        ],
    ),
    (
        "list-style",
        &["list-style-type", "list-style-position", "list-style-image"],
    ),
    (
        "border-radius",
        &[
            "border-top-right-radius",
            "border-top-left-radius",
            "border-bottom-right-radius",
            "border-bottom-left-radius",
        ],
    ),
    (
        "transition",
        &[
            "transition-delay",
            "transition-duration",
            "transition-property",
            "transition-timing-function",
        ],
    ),
    (
        "animation",
        &[
            "animation-name",
            "animation-duration",
            "animation-timing-function",
            "animation-delay",
            "animation-iteration-count",
            "animation-direction",
            "animation-fill-mode",
            "animation-play-state",
        ],
    ),
    (
        "border-block-end",
        &[
            "border-block-end-width",
            "border-block-end-style",
            "border-block-end-color",
        ],
    ),
    (
        "border-block-start",
        &[
            "border-block-start-width",
            "border-block-start-style",
            "border-block-start-color",
        ],
    ),
    (
        "border-image",
        &[
            "border-image-source",
            "border-image-slice",
            "border-image-width",
            "border-image-outset",
            "border-image-repeat",
        ],
    ),
    (
        "border-inline-end",
        &[
            "border-inline-end-width",
            "border-inline-end-style",
            "border-inline-end-color",
        ],
    ),
    (
        "border-inline-start",
        &[
            "border-inline-start-width",
            "border-inline-start-style",
            "border-inline-start-color",
        ],
    ),
    (
        "column-rule",
        &[
            "column-rule-width",
            "column-rule-style",
            "column-rule-color",
        ],
    ),
    ("columns", &["column-width", "column-count"]),
    ("flex", &["flex-grow", "flex-shrink", "flex-basis"]),
    ("flex-flow", &["flex-direction", "flex-wrap"]),
    (
        "grid",
        &[
            "grid-template-rows",
            "grid-template-columns",
            "grid-template-areas",
            "grid-auto-rows",
            "grid-auto-columns",
            "grid-auto-flow",
            "grid-column-gap",
            "grid-row-gap",
        ],
    ),
    (
        "grid-area",
        &[
            "grid-row-start",
            "grid-column-start",
            "grid-row-end",
            "grid-column-end",
        ],
    ),
    ("grid-column", &["grid-column-start", "grid-column-end"]),
    ("grid-gap", &["grid-row-gap", "grid-column-gap"]),
    ("grid-row", &["grid-row-start", "grid-row-end"]),
    (
        "grid-template",
        &[
            "grid-template-columns",
            "grid-template-rows",
            "grid-template-areas",
        ],
    ),
    (
        "outline",
        &["outline-color", "outline-style", "outline-width"],
    ),
    (
        "text-decoration",
        &[
            "text-decoration-color",
            "text-decoration-style",
            "text-decoration-line",
        ],
    ),
    (
        "text-emphasis",
        &["text-emphasis-style", "text-emphasis-color"],
    ),
    (
        "mask",
        &[
            "mask-image",
            "mask-mode",
            "mask-position",
            "mask-size",
            "mask-repeat",
            "mask-origin",
            "mask-clip",
            "mask-composite",
        ],
    ),
];

#[cfg(test)]
mod tests;
