#[must_use]
pub fn is_void(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "command"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "keygen"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    ) || name.eq_ignore_ascii_case("!doctype")
}

/// Upstream `closing_tag_omitted`: `<next>` closes an open `<current>`.
pub(super) fn closing_tag_omitted<'a>(current: &str, next: impl FnOnce() -> &'a str) -> bool {
    match current {
        "li" => next() == "li",
        "dt" | "dd" => matches!(next(), "dt" | "dd"),
        "p" => matches!(
            next(),
            "address"
                | "article"
                | "aside"
                | "blockquote"
                | "div"
                | "dl"
                | "fieldset"
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
                | "main"
                | "menu"
                | "nav"
                | "ol"
                | "p"
                | "pre"
                | "section"
                | "table"
                | "ul"
        ),
        "rt" | "rp" => matches!(next(), "rt" | "rp"),
        "optgroup" => next() == "optgroup",
        "option" => matches!(next(), "option" | "optgroup"),
        "thead" | "tbody" => matches!(next(), "tbody" | "tfoot"),
        "tfoot" => next() == "tbody",
        "tr" => matches!(next(), "tr" | "tbody"),
        "td" | "th" => matches!(next(), "td" | "th" | "tr"),
        _ => false,
    }
}
