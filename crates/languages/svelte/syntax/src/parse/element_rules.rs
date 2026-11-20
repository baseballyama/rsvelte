/// The compiler's void elements: HTML's, the obsolete `command` and `keygen`, and the doctype.
#[must_use]
pub fn is_void(name: &str) -> bool {
    rsvelte_markup_syntax::is_void(name)
        || matches!(name, "command" | "keygen")
        || name.eq_ignore_ascii_case("!doctype")
}

/// Which children close an open element: only direct children, or children at any depth.
#[derive(Clone, Copy, Debug)]
pub enum Autoclosing {
    Direct(&'static [&'static str]),
    Descendant {
        tags: &'static [&'static str],
        /// Upstream's `reset_by`: the elements below which `tags` are allowed again, which only
        /// the HTML tree validation reads.
        reset_by: &'static [&'static str],
    },
}

impl Autoclosing {
    #[must_use]
    pub const fn tags(self) -> &'static [&'static str] {
        match self {
            Self::Direct(tags) | Self::Descendant { tags, .. } => tags,
        }
    }
}

const DT_DD: &[&str] = &["dt", "dd"];
const RT_RP: &[&str] = &["rt", "rp"];
const ROW_GROUP_END: &[&str] = &["tbody", "tfoot"];
const CELL_END: &[&str] = &["td", "th", "tr"];

/// Upstream `autoclosing_children`, which the HTML tree validation extends.
pub const AUTOCLOSING_CHILDREN: [(&str, Autoclosing); 14] = [
    ("li", Autoclosing::Direct(&["li"])),
    (
        "dt",
        Autoclosing::Descendant {
            tags: DT_DD,
            reset_by: &["dl"],
        },
    ),
    (
        "dd",
        Autoclosing::Descendant {
            tags: DT_DD,
            reset_by: &["dl"],
        },
    ),
    (
        "p",
        Autoclosing::Descendant {
            tags: &[
                "address",
                "article",
                "aside",
                "blockquote",
                "div",
                "dl",
                "fieldset",
                "footer",
                "form",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "header",
                "hgroup",
                "hr",
                "main",
                "menu",
                "nav",
                "ol",
                "p",
                "pre",
                "section",
                "table",
                "ul",
            ],
            reset_by: &[],
        },
    ),
    (
        "rt",
        Autoclosing::Descendant {
            tags: RT_RP,
            reset_by: &[],
        },
    ),
    (
        "rp",
        Autoclosing::Descendant {
            tags: RT_RP,
            reset_by: &[],
        },
    ),
    (
        "optgroup",
        Autoclosing::Descendant {
            tags: &["optgroup"],
            reset_by: &[],
        },
    ),
    (
        "option",
        Autoclosing::Descendant {
            tags: &["option", "optgroup"],
            reset_by: &[],
        },
    ),
    ("thead", Autoclosing::Direct(ROW_GROUP_END)),
    ("tbody", Autoclosing::Direct(ROW_GROUP_END)),
    ("tfoot", Autoclosing::Direct(&["tbody"])),
    ("tr", Autoclosing::Direct(&["tr", "tbody"])),
    ("td", Autoclosing::Direct(CELL_END)),
    ("th", Autoclosing::Direct(CELL_END)),
];

/// Upstream `closing_tag_omitted`: `<next>` closes an open `<current>`.
pub(super) fn closing_tag_omitted<'a>(current: &str, next: impl FnOnce() -> &'a str) -> bool {
    AUTOCLOSING_CHILDREN
        .iter()
        .find(|&&(tag, _)| tag == current)
        .is_some_and(|&(_, closing)| closing.tags().contains(&next()))
}
