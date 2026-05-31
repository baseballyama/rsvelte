//! A11y constants.
//!
//! Valid ARIA attributes, roles, and other accessibility-related constants.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/a11y/constants.js`.
//!
//! This file is auto-generated from the official Svelte compiler.
//! Do not edit manually.

use rustc_hash::{FxHashMap, FxHashSet};
use std::sync::LazyLock;

/// Type for semantic role element entries: (element_name, optional_attributes, roles).
type SemanticRoleElement = (
    &'static str,
    Option<&'static [(&'static str, &'static str)]>,
    &'static [&'static str],
);

/// ARIA attributes list.
pub const ARIA_ATTRIBUTES: &[&str] = &[
    "activedescendant",
    "atomic",
    "autocomplete",
    "braillelabel",
    "brailleroledescription",
    "busy",
    "checked",
    "colcount",
    "colindex",
    "colspan",
    "controls",
    "current",
    "describedby",
    "description",
    "details",
    "disabled",
    "dropeffect",
    "errormessage",
    "expanded",
    "flowto",
    "grabbed",
    "haspopup",
    "hidden",
    "invalid",
    "keyshortcuts",
    "label",
    "labelledby",
    "level",
    "live",
    "modal",
    "multiline",
    "multiselectable",
    "orientation",
    "owns",
    "placeholder",
    "posinset",
    "pressed",
    "readonly",
    "relevant",
    "required",
    "roledescription",
    "rowcount",
    "rowindex",
    "rowspan",
    "selected",
    "setsize",
    "sort",
    "valuemax",
    "valuemin",
    "valuenow",
    "valuetext",
];

/// Required attributes for specific elements.
pub static A11Y_REQUIRED_ATTRIBUTES: LazyLock<FxHashMap<&'static str, &'static [&'static str]>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert("a", &["href"] as &[&str]);
        m.insert("area", &["alt", "aria-label", "aria-labelledby"] as &[&str]);
        m.insert("html", &["lang"] as &[&str]);
        m.insert("iframe", &["title"] as &[&str]);
        m.insert("img", &["alt"] as &[&str]);
        m.insert(
            "object",
            &["title", "aria-label", "aria-labelledby"] as &[&str],
        );
        m
    });

/// Distracting elements.
pub const A11Y_DISTRACTING_ELEMENTS: &[&str] = &["blink", "marquee"];

/// Elements that require content.
pub const A11Y_REQUIRED_CONTENT: &[&str] = &["h1", "h2", "h3", "h4", "h5", "h6"];

/// Labelable elements.
pub const A11Y_LABELABLE: &[&str] = &[
    "button", "input", "keygen", "meter", "output", "progress", "select", "textarea",
];

/// Interactive event handlers.
pub const A11Y_INTERACTIVE_HANDLERS: &[&str] = &[
    // Keyboard events
    "keypress",
    "keydown",
    "keyup",
    // Click events
    "click",
    "contextmenu",
    "dblclick",
    "drag",
    "dragend",
    "dragenter",
    "dragexit",
    "dragleave",
    "dragover",
    "dragstart",
    "drop",
    "mousedown",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    // Pointer events
    "pointerdown",
    "pointerup",
    "pointermove",
    "pointerenter",
    "pointerleave",
    "pointerover",
    "pointerout",
    "pointercancel",
    // Touch events
    "touchstart",
    "touchend",
    "touchmove",
    "touchcancel",
];

/// Recommended interactive event handlers.
pub const A11Y_RECOMMENDED_INTERACTIVE_HANDLERS: &[&str] = &[
    "click",
    "mousedown",
    "mouseup",
    "keypress",
    "keydown",
    "keyup",
];

/// Nested implicit semantics map.
pub static A11Y_NESTED_IMPLICIT_SEMANTICS: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert("header", "banner");
        m.insert("footer", "contentinfo");
        m
    });

/// Implicit semantics map.
pub static A11Y_IMPLICIT_SEMANTICS: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert("a", "link");
        m.insert("area", "link");
        m.insert("article", "article");
        m.insert("aside", "complementary");
        m.insert("body", "document");
        m.insert("button", "button");
        m.insert("datalist", "listbox");
        m.insert("dd", "definition");
        m.insert("dfn", "term");
        m.insert("dialog", "dialog");
        m.insert("details", "group");
        m.insert("dt", "term");
        m.insert("fieldset", "group");
        m.insert("figure", "figure");
        m.insert("form", "form");
        m.insert("h1", "heading");
        m.insert("h2", "heading");
        m.insert("h3", "heading");
        m.insert("h4", "heading");
        m.insert("h5", "heading");
        m.insert("h6", "heading");
        m.insert("hr", "separator");
        m.insert("img", "img");
        m.insert("li", "listitem");
        m.insert("link", "link");
        m.insert("main", "main");
        m.insert("menu", "list");
        m.insert("meter", "progressbar");
        m.insert("nav", "navigation");
        m.insert("ol", "list");
        m.insert("option", "option");
        m.insert("optgroup", "group");
        m.insert("output", "status");
        m.insert("progress", "progressbar");
        m.insert("section", "region");
        m.insert("summary", "button");
        m.insert("table", "table");
        m.insert("tbody", "rowgroup");
        m.insert("textarea", "textbox");
        m.insert("tfoot", "rowgroup");
        m.insert("thead", "rowgroup");
        m.insert("tr", "row");
        m.insert("ul", "list");
        m
    });

/// Menuitem type to implicit role map.
pub static MENUITEM_TYPE_TO_IMPLICIT_ROLE: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert("command", "menuitem");
        m.insert("checkbox", "menuitemcheckbox");
        m.insert("radio", "menuitemradio");
        m
    });

/// Input type to implicit role map.
pub static INPUT_TYPE_TO_IMPLICIT_ROLE: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert("button", "button");
        m.insert("image", "button");
        m.insert("reset", "button");
        m.insert("submit", "button");
        m.insert("checkbox", "checkbox");
        m.insert("radio", "radio");
        m.insert("range", "slider");
        m.insert("number", "spinbutton");
        m.insert("email", "textbox");
        m.insert("search", "searchbox");
        m.insert("tel", "textbox");
        m.insert("text", "textbox");
        m.insert("url", "textbox");
        m
    });

/// Non-interactive element to interactive role exceptions.
pub static A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS: LazyLock<
    FxHashMap<&'static str, &'static [&'static str]>,
> = LazyLock::new(|| {
    let mut m = FxHashMap::default();
    m.insert(
        "ul",
        &[
            "listbox",
            "menu",
            "menubar",
            "radiogroup",
            "tablist",
            "tree",
            "treegrid",
        ] as &[&str],
    );
    m.insert(
        "ol",
        &[
            "listbox",
            "menu",
            "menubar",
            "radiogroup",
            "tablist",
            "tree",
            "treegrid",
        ] as &[&str],
    );
    m.insert(
        "menu",
        &[
            "listbox",
            "menu",
            "menubar",
            "radiogroup",
            "tablist",
            "tree",
            "treegrid",
        ] as &[&str],
    );
    m.insert(
        "li",
        &["menuitem", "option", "row", "tab", "treeitem"] as &[&str],
    );
    m.insert("table", &["grid"] as &[&str]);
    m.insert("td", &["gridcell"] as &[&str]);
    m.insert("fieldset", &["radiogroup", "presentation"] as &[&str]);
    m
});

/// Combobox if list.
pub const COMBOBOX_IF_LIST: &[&str] = &["email", "search", "tel", "text", "url"];

/// Address type tokens.
pub const ADDRESS_TYPE_TOKENS: &[&str] = &["shipping", "billing"];

/// Autofill field name tokens.
pub const AUTOFILL_FIELD_NAME_TOKENS: &[&str] = &[
    "",
    "on",
    "off",
    "name",
    "honorific-prefix",
    "given-name",
    "additional-name",
    "family-name",
    "honorific-suffix",
    "nickname",
    "username",
    "new-password",
    "current-password",
    "one-time-code",
    "organization-title",
    "organization",
    "street-address",
    "address-line1",
    "address-line2",
    "address-line3",
    "address-level4",
    "address-level3",
    "address-level2",
    "address-level1",
    "country",
    "country-name",
    "postal-code",
    "cc-name",
    "cc-given-name",
    "cc-additional-name",
    "cc-family-name",
    "cc-number",
    "cc-exp",
    "cc-exp-month",
    "cc-exp-year",
    "cc-csc",
    "cc-type",
    "transaction-currency",
    "transaction-amount",
    "language",
    "bday",
    "bday-day",
    "bday-month",
    "bday-year",
    "sex",
    "url",
    "photo",
];

/// Contact type tokens.
pub const CONTACT_TYPE_TOKENS: &[&str] = &["home", "work", "mobile", "fax", "pager"];

/// Autofill contact field name tokens.
pub const AUTOFILL_CONTACT_FIELD_NAME_TOKENS: &[&str] = &[
    "tel",
    "tel-country-code",
    "tel-national",
    "tel-area-code",
    "tel-local",
    "tel-local-prefix",
    "tel-local-suffix",
    "tel-extension",
    "email",
    "impp",
];

/// Element interactivity enum values.
pub mod element_interactivity {
    pub const INTERACTIVE: &str = "interactive";
    pub const NON_INTERACTIVE: &str = "non-interactive";
    pub const STATIC: &str = "static";
}

/// Invisible elements.
pub const INVISIBLE_ELEMENTS: &[&str] = &["meta", "html", "script", "style"];

/// All ARIA roles.
pub static ARIA_ROLES: LazyLock<FxHashSet<&'static str>> = LazyLock::new(|| {
    let mut s = FxHashSet::default();
    s.insert("command");
    s.insert("composite");
    s.insert("input");
    s.insert("landmark");
    s.insert("range");
    s.insert("roletype");
    s.insert("section");
    s.insert("sectionhead");
    s.insert("select");
    s.insert("structure");
    s.insert("widget");
    s.insert("window");
    s.insert("alert");
    s.insert("alertdialog");
    s.insert("application");
    s.insert("article");
    s.insert("banner");
    s.insert("blockquote");
    s.insert("button");
    s.insert("caption");
    s.insert("cell");
    s.insert("checkbox");
    s.insert("code");
    s.insert("columnheader");
    s.insert("combobox");
    s.insert("complementary");
    s.insert("contentinfo");
    s.insert("definition");
    s.insert("deletion");
    s.insert("dialog");
    s.insert("directory");
    s.insert("document");
    s.insert("emphasis");
    s.insert("feed");
    s.insert("figure");
    s.insert("form");
    s.insert("generic");
    s.insert("grid");
    s.insert("gridcell");
    s.insert("group");
    s.insert("heading");
    s.insert("img");
    s.insert("insertion");
    s.insert("link");
    s.insert("list");
    s.insert("listbox");
    s.insert("listitem");
    s.insert("log");
    s.insert("main");
    s.insert("mark");
    s.insert("marquee");
    s.insert("math");
    s.insert("menu");
    s.insert("menubar");
    s.insert("menuitem");
    s.insert("menuitemcheckbox");
    s.insert("menuitemradio");
    s.insert("meter");
    s.insert("navigation");
    s.insert("none");
    s.insert("note");
    s.insert("option");
    s.insert("paragraph");
    s.insert("presentation");
    s.insert("progressbar");
    s.insert("radio");
    s.insert("radiogroup");
    s.insert("region");
    s.insert("row");
    s.insert("rowgroup");
    s.insert("rowheader");
    s.insert("scrollbar");
    s.insert("search");
    s.insert("searchbox");
    s.insert("separator");
    s.insert("slider");
    s.insert("spinbutton");
    s.insert("status");
    s.insert("strong");
    s.insert("subscript");
    s.insert("superscript");
    s.insert("switch");
    s.insert("tab");
    s.insert("table");
    s.insert("tablist");
    s.insert("tabpanel");
    s.insert("term");
    s.insert("textbox");
    s.insert("time");
    s.insert("timer");
    s.insert("toolbar");
    s.insert("tooltip");
    s.insert("tree");
    s.insert("treegrid");
    s.insert("treeitem");
    s.insert("doc-abstract");
    s.insert("doc-acknowledgments");
    s.insert("doc-afterword");
    s.insert("doc-appendix");
    s.insert("doc-backlink");
    s.insert("doc-biblioentry");
    s.insert("doc-bibliography");
    s.insert("doc-biblioref");
    s.insert("doc-chapter");
    s.insert("doc-colophon");
    s.insert("doc-conclusion");
    s.insert("doc-cover");
    s.insert("doc-credit");
    s.insert("doc-credits");
    s.insert("doc-dedication");
    s.insert("doc-endnote");
    s.insert("doc-endnotes");
    s.insert("doc-epigraph");
    s.insert("doc-epilogue");
    s.insert("doc-errata");
    s.insert("doc-example");
    s.insert("doc-footnote");
    s.insert("doc-foreword");
    s.insert("doc-glossary");
    s.insert("doc-glossref");
    s.insert("doc-index");
    s.insert("doc-introduction");
    s.insert("doc-noteref");
    s.insert("doc-notice");
    s.insert("doc-pagebreak");
    s.insert("doc-pagefooter");
    s.insert("doc-pageheader");
    s.insert("doc-pagelist");
    s.insert("doc-part");
    s.insert("doc-preface");
    s.insert("doc-prologue");
    s.insert("doc-pullquote");
    s.insert("doc-qna");
    s.insert("doc-subtitle");
    s.insert("doc-tip");
    s.insert("doc-toc");
    s.insert("graphics-document");
    s.insert("graphics-object");
    s.insert("graphics-symbol");
    s
});

/// Abstract ARIA roles.
pub static ABSTRACT_ROLES: LazyLock<FxHashSet<&'static str>> = LazyLock::new(|| {
    let mut s = FxHashSet::default();
    s.insert("command");
    s.insert("composite");
    s.insert("input");
    s.insert("landmark");
    s.insert("range");
    s.insert("roletype");
    s.insert("section");
    s.insert("sectionhead");
    s.insert("select");
    s.insert("structure");
    s.insert("widget");
    s.insert("window");
    s
});

/// Non-interactive roles.
pub const NON_INTERACTIVE_ROLES: &[&str] = &[
    "alert",
    "application",
    "article",
    "banner",
    "blockquote",
    "caption",
    "code",
    "complementary",
    "contentinfo",
    "definition",
    "deletion",
    "directory",
    "document",
    "emphasis",
    "feed",
    "figure",
    "form",
    "group",
    "heading",
    "img",
    "insertion",
    "list",
    "listitem",
    "log",
    "main",
    "mark",
    "marquee",
    "math",
    "meter",
    "navigation",
    "none",
    "note",
    "paragraph",
    "presentation",
    "region",
    "rowgroup",
    "search",
    "separator",
    "status",
    "strong",
    "subscript",
    "superscript",
    "table",
    "term",
    "time",
    "timer",
    "tooltip",
    "doc-abstract",
    "doc-acknowledgments",
    "doc-afterword",
    "doc-appendix",
    "doc-biblioentry",
    "doc-bibliography",
    "doc-chapter",
    "doc-colophon",
    "doc-conclusion",
    "doc-cover",
    "doc-credit",
    "doc-credits",
    "doc-dedication",
    "doc-endnote",
    "doc-endnotes",
    "doc-epigraph",
    "doc-epilogue",
    "doc-errata",
    "doc-example",
    "doc-footnote",
    "doc-foreword",
    "doc-glossary",
    "doc-index",
    "doc-introduction",
    "doc-notice",
    "doc-pagebreak",
    "doc-pagefooter",
    "doc-pageheader",
    "doc-pagelist",
    "doc-part",
    "doc-preface",
    "doc-prologue",
    "doc-pullquote",
    "doc-qna",
    "doc-subtitle",
    "doc-tip",
    "doc-toc",
    "graphics-document",
    "graphics-object",
    "graphics-symbol",
    "progressbar",
];

/// Interactive roles.
pub const INTERACTIVE_ROLES: &[&str] = &[
    "alertdialog",
    "button",
    "cell",
    "checkbox",
    "columnheader",
    "combobox",
    "dialog",
    "grid",
    "gridcell",
    "link",
    "listbox",
    "menu",
    "menubar",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "radiogroup",
    "row",
    "rowheader",
    "scrollbar",
    "searchbox",
    "slider",
    "spinbutton",
    "switch",
    "tab",
    "tablist",
    "tabpanel",
    "textbox",
    "toolbar",
    "tree",
    "treegrid",
    "treeitem",
    "doc-backlink",
    "doc-biblioref",
    "doc-glossref",
    "doc-noteref",
];

/// Presentation roles.
pub const PRESENTATION_ROLES: &[&str] = &["presentation", "none"];

/// Schema for role relation concept.
#[derive(Debug, Clone)]
pub struct RoleRelationConcept {
    pub name: String,
    pub attributes: Option<Vec<RoleRelationConceptAttribute>>,
}

/// Schema attribute for role relation concept.
#[derive(Debug, Clone)]
pub struct RoleRelationConceptAttribute {
    pub name: String,
    pub value: Option<String>,
}

/// Non-interactive element role schemas.
pub static NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> =
    LazyLock::new(|| {
        vec![
            RoleRelationConcept {
                name: "article".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "header".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "blockquote".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "caption".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "code".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "aside".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "aside".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "aria-label".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "aside".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "aria-labelledby".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "footer".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dd".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "del".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "html".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "em".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "figure".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "form".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "aria-label".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "form".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "aria-labelledby".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "form".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "name".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "details".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "fieldset".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "optgroup".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "address".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h1".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h2".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h3".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h4".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h5".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h6".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "img".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "alt".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "img".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "alt".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "ins".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "menu".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "ol".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "ul".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "li".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "main".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "mark".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "math".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "meter".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "nav".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "p".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "img".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "alt".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "progress".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "section".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "aria-label".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "section".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "aria-labelledby".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "tbody".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "tfoot".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "thead".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "hr".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "output".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "strong".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "sub".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "sup".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "table".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dfn".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dt".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "time".to_string(),
                attributes: None,
            },
        ]
    });

/// ARIA property type.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AriaPropertyType {
    /// A reference to another element ID
    Id,
    /// A list of element IDs
    IdList,
    /// A string value
    String,
    /// A boolean value (true or false)
    Boolean,
    /// A numeric value
    Number,
    /// An integer value
    Integer,
    /// A token from a predefined list
    Token,
    /// A list of tokens from a predefined list
    TokenList,
    /// A tristate value (true, false, or mixed)
    Tristate,
}

/// ARIA property definition.
#[derive(Debug, Clone)]
pub struct AriaPropertyDefinition {
    pub property_type: AriaPropertyType,
    pub values: Option<&'static [&'static str]>,
}

/// ARIA property definitions map.
pub static ARIA_PROPERTY_DEFINITIONS: LazyLock<FxHashMap<&'static str, AriaPropertyDefinition>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert(
            "aria-activedescendant",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Id,
                values: None,
            },
        );
        m.insert(
            "aria-atomic",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-autocomplete",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["inline", "list", "both", "none"]),
            },
        );
        m.insert(
            "aria-braillelabel",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-brailleroledescription",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-busy",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-checked",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Tristate,
                values: None,
            },
        );
        m.insert(
            "aria-colcount",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-colindex",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-colspan",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-controls",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::IdList,
                values: None,
            },
        );
        m.insert(
            "aria-current",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["page", "step", "location", "date", "time", "true", "false"]),
            },
        );
        m.insert(
            "aria-describedby",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::IdList,
                values: None,
            },
        );
        m.insert(
            "aria-description",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-details",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Id,
                values: None,
            },
        );
        m.insert(
            "aria-disabled",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-dropeffect",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::TokenList,
                values: Some(&["copy", "execute", "link", "move", "none", "popup"]),
            },
        );
        m.insert(
            "aria-errormessage",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Id,
                values: None,
            },
        );
        m.insert(
            "aria-expanded",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-flowto",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::IdList,
                values: None,
            },
        );
        m.insert(
            "aria-grabbed",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-haspopup",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["false", "true", "menu", "listbox", "tree", "grid", "dialog"]),
            },
        );
        m.insert(
            "aria-hidden",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-invalid",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["grammar", "false", "spelling", "true"]),
            },
        );
        m.insert(
            "aria-keyshortcuts",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-label",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-labelledby",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::IdList,
                values: None,
            },
        );
        m.insert(
            "aria-level",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-live",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["assertive", "off", "polite"]),
            },
        );
        m.insert(
            "aria-modal",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-multiline",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-multiselectable",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-orientation",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["vertical", "undefined", "horizontal"]),
            },
        );
        m.insert(
            "aria-owns",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::IdList,
                values: None,
            },
        );
        m.insert(
            "aria-placeholder",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-posinset",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-pressed",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Tristate,
                values: None,
            },
        );
        m.insert(
            "aria-readonly",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-relevant",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::TokenList,
                values: Some(&["additions", "all", "removals", "text"]),
            },
        );
        m.insert(
            "aria-required",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-roledescription",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m.insert(
            "aria-rowcount",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-rowindex",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-rowspan",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-selected",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Boolean,
                values: None,
            },
        );
        m.insert(
            "aria-setsize",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Integer,
                values: None,
            },
        );
        m.insert(
            "aria-sort",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Token,
                values: Some(&["ascending", "descending", "none", "other"]),
            },
        );
        m.insert(
            "aria-valuemax",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Number,
                values: None,
            },
        );
        m.insert(
            "aria-valuemin",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Number,
                values: None,
            },
        );
        m.insert(
            "aria-valuenow",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::Number,
                values: None,
            },
        );
        m.insert(
            "aria-valuetext",
            AriaPropertyDefinition {
                property_type: AriaPropertyType::String,
                values: None,
            },
        );
        m
    });

/// Interactive element role schemas.
pub static INTERACTIVE_ELEMENT_ROLE_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> =
    LazyLock::new(|| {
        vec![
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("button".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("image".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("reset".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("submit".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "button".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "td".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("checkbox".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "scope".to_string(),
                    value: Some("col".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "scope".to_string(),
                    value: Some("colgroup".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("email".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("search".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("tel".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("text".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("url".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "select".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "multiple".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "size".to_string(),
                        value: None,
                    },
                ]),
            },
            RoleRelationConcept {
                name: "dialog".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "td".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "a".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "href".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "area".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "href".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "select".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "size".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "select".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "multiple".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "datalist".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "option".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("radio".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "tr".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "scope".to_string(),
                    value: Some("row".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "scope".to_string(),
                    value: Some("rowgroup".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("search".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("range".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("number".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("email".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("tel".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("text".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![
                    RoleRelationConceptAttribute {
                        name: "list".to_string(),
                        value: None,
                    },
                    RoleRelationConceptAttribute {
                        name: "type".to_string(),
                        value: Some("url".to_string()),
                    },
                ]),
            },
            RoleRelationConcept {
                name: "textarea".to_string(),
                attributes: None,
            },
        ]
    });

/// Interactive element AX object schemas.
pub static INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> =
    LazyLock::new(|| {
        vec![
            RoleRelationConcept {
                name: "audio".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "button".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "canvas".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "td".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("checkbox".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("color".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "select".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("date".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("datetime".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "summary".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "embed".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("time".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "a".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "href".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "option".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "datalist".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "menuitem".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("radio".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "th".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "scope".to_string(),
                    value: Some("row".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("search".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("range".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("number".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "textarea".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "input".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "type".to_string(),
                    value: Some("text".to_string()),
                }]),
            },
            RoleRelationConcept {
                name: "video".to_string(),
                attributes: None,
            },
        ]
    });

/// Non-interactive element AX object schemas.
pub static NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> =
    LazyLock::new(|| {
        vec![
            RoleRelationConcept {
                name: "abbr".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "article".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "blockquote".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "caption".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dfn".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dd".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dl".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dt".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "details".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "dir".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "figcaption".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "figure".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "footer".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "form".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h1".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h2".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h3".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h4".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h5".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "h6".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "img".to_string(),
                attributes: Some(vec![RoleRelationConceptAttribute {
                    name: "usemap".to_string(),
                    value: None,
                }]),
            },
            RoleRelationConcept {
                name: "img".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "label".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "legend".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "br".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "li".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "ul".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "ol".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "main".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "mark".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "marquee".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "menu".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "meter".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "nav".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "p".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "pre".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "progress".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "tr".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "ruby".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "table".to_string(),
                attributes: None,
            },
            RoleRelationConcept {
                name: "time".to_string(),
                attributes: None,
            },
        ]
    });

/// Index of schemas grouped by tag name for O(1) lookup.
fn build_schema_index(schemas: &[RoleRelationConcept]) -> FxHashMap<String, Vec<usize>> {
    let mut index: FxHashMap<String, Vec<usize>> = FxHashMap::default();
    for (i, schema) in schemas.iter().enumerate() {
        index.entry(schema.name.clone()).or_default().push(i);
    }
    index
}

pub static NON_INTERACTIVE_ELEMENT_ROLE_INDEX: LazyLock<FxHashMap<String, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(&NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS));

pub static INTERACTIVE_ELEMENT_ROLE_INDEX: LazyLock<FxHashMap<String, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(&INTERACTIVE_ELEMENT_ROLE_SCHEMAS));

pub static INTERACTIVE_ELEMENT_AX_OBJECT_INDEX: LazyLock<FxHashMap<String, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(&INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS));

pub static NON_INTERACTIVE_ELEMENT_AX_OBJECT_INDEX: LazyLock<FxHashMap<String, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(&NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS));

/// Map of ARIA roles to their required properties.
/// Sourced from aria-query roles_map requiredProps.
/// Only roles that have non-empty requiredProps are included.
pub static ROLE_REQUIRED_PROPS: LazyLock<FxHashMap<&'static str, &'static [&'static str]>> =
    LazyLock::new(|| {
        let mut map = FxHashMap::default();
        map.insert("checkbox", &["aria-checked"][..]);
        map.insert("combobox", &["aria-controls", "aria-expanded"][..]);
        map.insert("heading", &["aria-level"][..]);
        map.insert("menuitemcheckbox", &["aria-checked"][..]);
        map.insert("menuitemradio", &["aria-checked"][..]);
        map.insert("meter", &["aria-valuenow"][..]);
        map.insert("option", &["aria-selected"][..]);
        map.insert("radio", &["aria-checked"][..]);
        map.insert("scrollbar", &["aria-controls", "aria-valuenow"][..]);
        map.insert("slider", &["aria-valuenow"][..]);
        map.insert("switch", &["aria-checked"][..]);
        map.insert("treeitem", &["aria-selected"][..]);
        map
    });

/// Map of elements (with optional attributes) to the roles they semantically represent.
/// Used by `is_semantic_role_element` to determine if an element naturally carries a role.
/// Derived from axobject-query's elementAXObjects and AXObjectRoles maps.
///
/// Format: (element_name, optional_attributes, roles)
/// If an element matches (name + attributes), it semantically maps to those roles.
pub static SEMANTIC_ROLE_ELEMENTS: LazyLock<Vec<SemanticRoleElement>> = LazyLock::new(|| {
    vec![
        // input[type=checkbox] -> checkbox, switch
        (
            "input",
            Some(&[("type", "checkbox")][..]),
            &["checkbox", "switch"][..],
        ),
        // input[type=radio] -> radio
        ("input", Some(&[("type", "radio")][..]), &["radio"][..]),
        // input[type=range] -> slider
        ("input", Some(&[("type", "range")][..]), &["slider"][..]),
        // select -> combobox, listbox
        ("select", None, &["combobox", "listbox"][..]),
        // option -> option
        ("option", None, &["option"][..]),
        // h1-h6 -> heading
        ("h1", None, &["heading"][..]),
        ("h2", None, &["heading"][..]),
        ("h3", None, &["heading"][..]),
        ("h4", None, &["heading"][..]),
        ("h5", None, &["heading"][..]),
        ("h6", None, &["heading"][..]),
        // meter -> meter
        ("meter", None, &["meter"][..]),
        // menuitemcheckbox
        (
            "menuitem",
            Some(&[("type", "checkbox")][..]),
            &["menuitemcheckbox"][..],
        ),
        // menuitemradio
        (
            "menuitem",
            Some(&[("type", "radio")][..]),
            &["menuitemradio"][..],
        ),
        // treeitem -> treeitem
        ("treeitem", None, &["treeitem"][..]),
    ]
});

/// Map of WAI-ARIA roles to their allowed ARIA properties.
/// Generated from aria-query@5.3.1 roles map.
pub static ROLE_ALLOWED_ARIA_PROPS: LazyLock<FxHashMap<&'static str, &'static [&'static str]>> =
    LazyLock::new(|| {
        let mut m = FxHashMap::default();
        m.insert(
            "command",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "composite",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "input",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "landmark",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "range",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
            ][..],
        );
        m.insert(
            "roletype",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "section",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "sectionhead",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "select",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "structure",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "widget",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "window",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-modal",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "alert",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "alertdialog",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-modal",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "application",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "article",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "banner",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "blockquote",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "button",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-pressed",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "caption",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "cell",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-colindex",
                "aria-colspan",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-rowindex",
                "aria-rowspan",
            ][..],
        );
        m.insert(
            "checkbox",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "code",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "columnheader",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-colindex",
                "aria-colspan",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-rowindex",
                "aria-rowspan",
                "aria-selected",
                "aria-sort",
            ][..],
        );
        m.insert(
            "combobox",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-autocomplete",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "complementary",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "contentinfo",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "definition",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "deletion",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "dialog",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-modal",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "directory",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "document",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "emphasis",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "feed",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "figure",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "form",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "generic",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "grid",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-colcount",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-multiselectable",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-roledescription",
                "aria-rowcount",
            ][..],
        );
        m.insert(
            "gridcell",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-colindex",
                "aria-colspan",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-rowindex",
                "aria-rowspan",
                "aria-selected",
            ][..],
        );
        m.insert(
            "group",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "heading",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "img",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "insertion",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "link",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "list",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "listbox",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-multiselectable",
                "aria-orientation",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "listitem",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "log",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "main",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "mark",
            &[
                "aria-atomic",
                "aria-braillelabel",
                "aria-brailleroledescription",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-description",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "marquee",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "math",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "menu",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "menubar",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "menuitem",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "menuitemcheckbox",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "menuitemradio",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "meter",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "navigation",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert("none", &[][..]);
        m.insert(
            "note",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "option",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-selected",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "paragraph",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "presentation",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "progressbar",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "radio",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "radiogroup",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "region",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "row",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-colindex",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-rowindex",
                "aria-selected",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "rowgroup",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "rowheader",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-colindex",
                "aria-colspan",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-rowindex",
                "aria-rowspan",
                "aria-selected",
                "aria-sort",
            ][..],
        );
        m.insert(
            "scrollbar",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "search",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "searchbox",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-autocomplete",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-multiline",
                "aria-owns",
                "aria-placeholder",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "separator",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "slider",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "spinbutton",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "status",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "strong",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "subscript",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "superscript",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "switch",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "tab",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-selected",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "table",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-colcount",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-rowcount",
            ][..],
        );
        m.insert(
            "tablist",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-multiselectable",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "tabpanel",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "term",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "textbox",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-autocomplete",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-multiline",
                "aria-owns",
                "aria-placeholder",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "time",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "timer",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "toolbar",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "tooltip",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-dropeffect",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "tree",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-multiselectable",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "treegrid",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-colcount",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-multiselectable",
                "aria-orientation",
                "aria-owns",
                "aria-readonly",
                "aria-relevant",
                "aria-required",
                "aria-roledescription",
                "aria-rowcount",
            ][..],
        );
        m.insert(
            "treeitem",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-checked",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-selected",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "doc-abstract",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-acknowledgments",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-afterword",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-appendix",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-backlink",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-biblioentry",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "doc-bibliography",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-biblioref",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-chapter",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-colophon",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-conclusion",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-cover",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-credit",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-credits",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-dedication",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-endnote",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-level",
                "aria-live",
                "aria-owns",
                "aria-posinset",
                "aria-relevant",
                "aria-roledescription",
                "aria-setsize",
            ][..],
        );
        m.insert(
            "doc-endnotes",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-epigraph",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-epilogue",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-errata",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-example",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-footnote",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-foreword",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-glossary",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-glossref",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-index",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-introduction",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-noteref",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-notice",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-pagebreak",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-orientation",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
                "aria-valuemax",
                "aria-valuemin",
                "aria-valuenow",
                "aria-valuetext",
            ][..],
        );
        m.insert(
            "doc-pagefooter",
            &[
                "aria-atomic",
                "aria-braillelabel",
                "aria-brailleroledescription",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-description",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-pageheader",
            &[
                "aria-atomic",
                "aria-braillelabel",
                "aria-brailleroledescription",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-description",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-pagelist",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-part",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-preface",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-prologue",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert("doc-pullquote", &[][..]);
        m.insert(
            "doc-qna",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-subtitle",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-tip",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "doc-toc",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "graphics-document",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "graphics-object",
            &[
                "aria-activedescendant",
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m.insert(
            "graphics-symbol",
            &[
                "aria-atomic",
                "aria-busy",
                "aria-controls",
                "aria-current",
                "aria-describedby",
                "aria-details",
                "aria-disabled",
                "aria-dropeffect",
                "aria-errormessage",
                "aria-expanded",
                "aria-flowto",
                "aria-grabbed",
                "aria-haspopup",
                "aria-hidden",
                "aria-invalid",
                "aria-keyshortcuts",
                "aria-label",
                "aria-labelledby",
                "aria-live",
                "aria-owns",
                "aria-relevant",
                "aria-roledescription",
            ][..],
        );
        m
    });
