/// Canonical list of HTML block-display elements (prettier-plugin-svelte's
/// `blockElements` / `isBlockElement`), shared with the collapse pass. These
/// elements never hug their start/end (`shouldHugStart` / `shouldHugEnd` return
/// false), so when their open tag wraps the closing `>` always breaks onto its
/// own line — even when text content sits directly after it.
///
/// Does NOT include `script` / `style` — those are whitespace-preserving in the
/// collapse pass (handled by `is_whitespace_preserving`) but count as block
/// elements here for open-tag layout purposes.
pub fn is_html_block_display_element(tag_name: &str) -> bool {
    matches!(
        tag_name,
        "address"
            | "article"
            | "aside"
            | "blockquote"
            | "dd"
            | "details"
            | "dialog"
            | "div"
            | "dl"
            | "dt"
            | "fieldset"
            | "figcaption"
            | "figure"
            | "footer"
            | "form"
            | "h1"
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6"
            | "header"
            | "hgroup"
            | "hr"
            | "li"
            | "main"
            | "nav"
            | "ol"
            | "p"
            | "pre"
            | "section"
            | "table"
            | "ul"
    )
}

pub(super) fn is_block_element(tag_name: &str) -> bool {
    // `script` and `style` are block elements for open-tag layout purposes even
    // though the collapse pass treats them as whitespace-preserving separately.
    is_html_block_display_element(tag_name) || matches!(tag_name, "script" | "style")
}

/// HTML void elements — they never have a closing tag and are emitted in the
/// self-closing ` />` form (matching prettier-plugin-svelte's default).
pub(super) fn is_void_element(tag_name: &str) -> bool {
    matches!(
        tag_name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}
