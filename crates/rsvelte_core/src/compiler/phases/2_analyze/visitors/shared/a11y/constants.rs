//! A11y constants.
//!
//! Valid ARIA attributes, roles, and other accessibility-related constants.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/a11y/constants.js`.
//!
//! The upstream file is 300-odd lines because it imports its tables from the
//! `aria-query` / `axobject-query` npm packages; rsvelte inlines those tables here.
//! The data is therefore verbatim upstream data — only its *encoding* is condensed
//! (shared prop-sets factored out, one row per entry).

use rustc_hash::{FxHashMap, FxHashSet};
use std::sync::LazyLock;

#[cfg(test)]
#[path = "constants_test.rs"]
mod tests;

/// Type for semantic role element entries: (element_name, optional_attributes, roles).
type SemanticRoleElement = (
    &'static str,
    Option<&'static [(&'static str, &'static str)]>,
    &'static [&'static str],
);

/// ARIA attributes list.
#[rustfmt::skip]
pub const ARIA_ATTRIBUTES: &[&str] = &[
    "activedescendant", "atomic", "autocomplete", "braillelabel", "brailleroledescription", "busy",
    "checked", "colcount", "colindex", "colspan", "controls", "current", "describedby",
    "description", "details", "disabled", "dropeffect", "errormessage", "expanded", "flowto",
    "grabbed", "haspopup", "hidden", "invalid", "keyshortcuts", "label", "labelledby", "level",
    "live", "modal", "multiline", "multiselectable", "orientation", "owns", "placeholder",
    "posinset", "pressed", "readonly", "relevant", "required", "roledescription", "rowcount",
    "rowindex", "rowspan", "selected", "setsize", "sort", "valuemax", "valuemin", "valuenow",
    "valuetext",
];

/// Required attributes for specific elements.
#[rustfmt::skip]
const A11Y_REQUIRED_ATTRIBUTES_TABLE: &[(&str, &[&str])] = &[
    ("a", &["href"]),
    ("area", &["alt", "aria-label", "aria-labelledby"]),
    ("html", &["lang"]),
    ("iframe", &["title"]),
    ("img", &["alt"]),
    ("object", &["title", "aria-label", "aria-labelledby"]),
];

pub static A11Y_REQUIRED_ATTRIBUTES: LazyLock<FxHashMap<&'static str, &'static [&'static str]>> =
    LazyLock::new(|| A11Y_REQUIRED_ATTRIBUTES_TABLE.iter().copied().collect());

/// Distracting elements.
pub const A11Y_DISTRACTING_ELEMENTS: &[&str] = &["blink", "marquee"];

/// Elements that require content.
pub const A11Y_REQUIRED_CONTENT: &[&str] = &["h1", "h2", "h3", "h4", "h5", "h6"];

/// Labelable elements.
#[rustfmt::skip]
pub const A11Y_LABELABLE: &[&str] = &[
    "button", "input", "keygen", "meter", "output", "progress", "select", "textarea",
];

/// Interactive event handlers.
#[rustfmt::skip]
pub const A11Y_INTERACTIVE_HANDLERS: &[&str] = &[
    // Keyboard events
    "keypress", "keydown", "keyup",
    // Click events
    "click", "contextmenu", "dblclick", "drag", "dragend", "dragenter", "dragexit", "dragleave",
    "dragover", "dragstart", "drop", "mousedown", "mouseenter", "mouseleave", "mousemove",
    "mouseout", "mouseover", "mouseup",
    // Pointer events
    "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "pointerover",
    "pointerout", "pointercancel",
    // Touch events
    "touchstart", "touchend", "touchmove", "touchcancel",
];

/// Recommended interactive event handlers.
#[rustfmt::skip]
pub const A11Y_RECOMMENDED_INTERACTIVE_HANDLERS: &[&str] = &[
    "click", "mousedown", "mouseup", "keypress", "keydown", "keyup",
];

/// Nested implicit semantics map.
#[rustfmt::skip]
const A11Y_NESTED_IMPLICIT_SEMANTICS_TABLE: &[(&str, &str)] = &[
    ("footer", "contentinfo"), ("header", "banner"),
];

pub static A11Y_NESTED_IMPLICIT_SEMANTICS: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| {
        A11Y_NESTED_IMPLICIT_SEMANTICS_TABLE
            .iter()
            .copied()
            .collect()
    });

/// Implicit semantics map.
#[rustfmt::skip]
const A11Y_IMPLICIT_SEMANTICS_TABLE: &[(&str, &str)] = &[
    ("a", "link"), ("area", "link"), ("article", "article"), ("aside", "complementary"),
    ("body", "document"), ("button", "button"), ("datalist", "listbox"), ("dd", "definition"),
    ("details", "group"), ("dfn", "term"), ("dialog", "dialog"), ("dt", "term"),
    ("fieldset", "group"), ("figure", "figure"), ("form", "form"), ("h1", "heading"),
    ("h2", "heading"), ("h3", "heading"), ("h4", "heading"), ("h5", "heading"), ("h6", "heading"),
    ("hr", "separator"), ("img", "img"), ("li", "listitem"), ("link", "link"), ("main", "main"),
    ("menu", "list"), ("meter", "progressbar"), ("nav", "navigation"), ("ol", "list"),
    ("optgroup", "group"), ("option", "option"), ("output", "status"), ("progress", "progressbar"),
    ("section", "region"), ("summary", "button"), ("table", "table"), ("tbody", "rowgroup"),
    ("textarea", "textbox"), ("tfoot", "rowgroup"), ("thead", "rowgroup"), ("tr", "row"),
    ("ul", "list"),
];

pub static A11Y_IMPLICIT_SEMANTICS: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| A11Y_IMPLICIT_SEMANTICS_TABLE.iter().copied().collect());

/// Menuitem type to implicit role map.
#[rustfmt::skip]
const MENUITEM_TYPE_TO_IMPLICIT_ROLE_TABLE: &[(&str, &str)] = &[
    ("checkbox", "menuitemcheckbox"), ("command", "menuitem"), ("radio", "menuitemradio"),
];

pub static MENUITEM_TYPE_TO_IMPLICIT_ROLE: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| {
        MENUITEM_TYPE_TO_IMPLICIT_ROLE_TABLE
            .iter()
            .copied()
            .collect()
    });

/// Input type to implicit role map.
#[rustfmt::skip]
const INPUT_TYPE_TO_IMPLICIT_ROLE_TABLE: &[(&str, &str)] = &[
    ("button", "button"), ("checkbox", "checkbox"), ("email", "textbox"), ("image", "button"),
    ("number", "spinbutton"), ("radio", "radio"), ("range", "slider"), ("reset", "button"),
    ("search", "searchbox"), ("submit", "button"), ("tel", "textbox"), ("text", "textbox"),
    ("url", "textbox"),
];

pub static INPUT_TYPE_TO_IMPLICIT_ROLE: LazyLock<FxHashMap<&'static str, &'static str>> =
    LazyLock::new(|| INPUT_TYPE_TO_IMPLICIT_ROLE_TABLE.iter().copied().collect());

/// Interactive roles allowed on `ul` / `ol` / `menu`.
#[rustfmt::skip]
const LIST_CONTAINER_ROLES: &[&str] = &[
    "listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid",
];

/// Non-interactive element to interactive role exceptions.
#[rustfmt::skip]
const A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS_TABLE: &[(&str, &[&str])] = &[
    ("fieldset", &["radiogroup", "presentation"]),
    ("li", &["menuitem", "option", "row", "tab", "treeitem"]),
    ("menu", LIST_CONTAINER_ROLES),
    ("ol", LIST_CONTAINER_ROLES),
    ("table", &["grid"]),
    ("td", &["gridcell"]),
    ("ul", LIST_CONTAINER_ROLES),
];

pub static A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS: LazyLock<
    FxHashMap<&'static str, &'static [&'static str]>,
> = LazyLock::new(|| {
    A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS_TABLE
        .iter()
        .copied()
        .collect()
});

/// Combobox if list.
pub const COMBOBOX_IF_LIST: &[&str] = &["email", "search", "tel", "text", "url"];

/// Address type tokens.
pub const ADDRESS_TYPE_TOKENS: &[&str] = &["shipping", "billing"];

/// Autofill field name tokens.
#[rustfmt::skip]
pub const AUTOFILL_FIELD_NAME_TOKENS: &[&str] = &[
    "", "on", "off", "name", "honorific-prefix", "given-name", "additional-name", "family-name",
    "honorific-suffix", "nickname", "username", "new-password", "current-password", "one-time-code",
    "organization-title", "organization", "street-address", "address-line1", "address-line2",
    "address-line3", "address-level4", "address-level3", "address-level2", "address-level1",
    "country", "country-name", "postal-code", "cc-name", "cc-given-name", "cc-additional-name",
    "cc-family-name", "cc-number", "cc-exp", "cc-exp-month", "cc-exp-year", "cc-csc", "cc-type",
    "transaction-currency", "transaction-amount", "language", "bday", "bday-day", "bday-month",
    "bday-year", "sex", "url", "photo",
];

/// Contact type tokens.
pub const CONTACT_TYPE_TOKENS: &[&str] = &["home", "work", "mobile", "fax", "pager"];

/// Autofill contact field name tokens.
#[rustfmt::skip]
pub const AUTOFILL_CONTACT_FIELD_NAME_TOKENS: &[&str] = &[
    "tel", "tel-country-code", "tel-national", "tel-area-code", "tel-local", "tel-local-prefix",
    "tel-local-suffix", "tel-extension", "email", "impp",
];

/// Element interactivity enum values.
pub mod element_interactivity {
    pub const INTERACTIVE: &str = "interactive";
    pub const NON_INTERACTIVE: &str = "non-interactive";
    pub const STATIC: &str = "static";
}

/// Invisible elements.
pub const INVISIBLE_ELEMENTS: &[&str] = &["meta", "html", "script", "style"];

/// Abstract ARIA roles. Also the first 12 entries of `ARIA_ROLE_NAMES`.
#[rustfmt::skip]
const ABSTRACT_ROLE_NAMES: &[&str] = &[
    "command", "composite", "input", "landmark", "range", "roletype", "section", "sectionhead",
    "select", "structure", "widget", "window",
];

/// All ARIA roles, in aria-query's `roles` map key order. The order is load-bearing:
/// `fuzzymatch` breaks score ties by first occurrence, so `ARIA_ROLES` (a set) must never
/// be the source for suggestion lists.
#[rustfmt::skip]
pub const ARIA_ROLE_NAMES: &[&str] = &[
    "command", "composite", "input", "landmark", "range", "roletype", "section", "sectionhead",
    "select", "structure", "widget", "window", "alert", "alertdialog", "application", "article",
    "banner", "blockquote", "button", "caption", "cell", "checkbox", "code", "columnheader",
    "combobox", "complementary", "contentinfo", "definition", "deletion", "dialog", "directory",
    "document", "emphasis", "feed", "figure", "form", "generic", "grid", "gridcell", "group",
    "heading", "img", "insertion", "link", "list", "listbox", "listitem", "log", "main", "mark",
    "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "meter",
    "navigation", "none", "note", "option", "paragraph", "presentation", "progressbar", "radio",
    "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar", "search", "searchbox",
    "separator", "slider", "spinbutton", "status", "strong", "subscript", "superscript", "switch",
    "tab", "table", "tablist", "tabpanel", "term", "textbox", "time", "timer", "toolbar", "tooltip",
    "tree", "treegrid", "treeitem", "doc-abstract", "doc-acknowledgments", "doc-afterword",
    "doc-appendix", "doc-backlink", "doc-biblioentry", "doc-bibliography", "doc-biblioref",
    "doc-chapter", "doc-colophon", "doc-conclusion", "doc-cover", "doc-credit", "doc-credits",
    "doc-dedication", "doc-endnote", "doc-endnotes", "doc-epigraph", "doc-epilogue", "doc-errata",
    "doc-example", "doc-footnote", "doc-foreword", "doc-glossary", "doc-glossref", "doc-index",
    "doc-introduction", "doc-noteref", "doc-notice", "doc-pagebreak", "doc-pagefooter",
    "doc-pageheader", "doc-pagelist", "doc-part", "doc-preface", "doc-prologue", "doc-pullquote",
    "doc-qna", "doc-subtitle", "doc-tip", "doc-toc", "graphics-document", "graphics-object",
    "graphics-symbol",
];

/// All ARIA roles.
pub static ARIA_ROLES: LazyLock<FxHashSet<&'static str>> =
    LazyLock::new(|| ARIA_ROLE_NAMES.iter().copied().collect());

/// Abstract ARIA roles.
pub static ABSTRACT_ROLES: LazyLock<FxHashSet<&'static str>> =
    LazyLock::new(|| ABSTRACT_ROLE_NAMES.iter().copied().collect());

/// Non-interactive roles.
#[rustfmt::skip]
pub const NON_INTERACTIVE_ROLES: &[&str] = &[
    "alert", "application", "article", "banner", "blockquote", "caption", "code", "complementary",
    "contentinfo", "definition", "deletion", "directory", "document", "emphasis", "feed", "figure",
    "form", "group", "heading", "img", "insertion", "list", "listitem", "log", "main", "mark",
    "marquee", "math", "meter", "navigation", "none", "note", "paragraph", "presentation", "region",
    "rowgroup", "search", "separator", "status", "strong", "subscript", "superscript", "table",
    "term", "time", "timer", "tooltip", "doc-abstract", "doc-acknowledgments", "doc-afterword",
    "doc-appendix", "doc-biblioentry", "doc-bibliography", "doc-chapter", "doc-colophon",
    "doc-conclusion", "doc-cover", "doc-credit", "doc-credits", "doc-dedication", "doc-endnote",
    "doc-endnotes", "doc-epigraph", "doc-epilogue", "doc-errata", "doc-example", "doc-footnote",
    "doc-foreword", "doc-glossary", "doc-index", "doc-introduction", "doc-notice", "doc-pagebreak",
    "doc-pagefooter", "doc-pageheader", "doc-pagelist", "doc-part", "doc-preface", "doc-prologue",
    "doc-pullquote", "doc-qna", "doc-subtitle", "doc-tip", "doc-toc", "graphics-document",
    "graphics-object", "graphics-symbol", "progressbar",
];

/// Interactive roles.
#[rustfmt::skip]
pub const INTERACTIVE_ROLES: &[&str] = &[
    "alertdialog", "button", "cell", "checkbox", "columnheader", "combobox", "dialog", "grid",
    "gridcell", "link", "listbox", "menu", "menubar", "menuitem", "menuitemcheckbox",
    "menuitemradio", "option", "radio", "radiogroup", "row", "rowheader", "scrollbar", "searchbox",
    "slider", "spinbutton", "switch", "tab", "tablist", "tabpanel", "textbox", "toolbar", "tree",
    "treegrid", "treeitem", "doc-backlink", "doc-biblioref", "doc-glossref", "doc-noteref",
];

/// Presentation roles.
pub const PRESENTATION_ROLES: &[&str] = &["presentation", "none"];

/// Schema for role relation concept.
#[derive(Debug, Clone)]
pub struct RoleRelationConcept {
    pub name: &'static str,
    pub attributes: Option<&'static [RoleRelationConceptAttribute]>,
}

/// Schema attribute for role relation concept.
#[derive(Debug, Clone)]
pub struct RoleRelationConceptAttribute {
    pub name: &'static str,
    pub value: Option<&'static str>,
}

/// A schema matching `<name>` with no attribute constraints.
const fn tag(name: &'static str) -> RoleRelationConcept {
    RoleRelationConcept {
        name,
        attributes: None,
    }
}

/// A schema matching `<name>` only when every listed attribute constraint holds.
const fn tag_with(
    name: &'static str,
    attributes: &'static [RoleRelationConceptAttribute],
) -> RoleRelationConcept {
    RoleRelationConcept {
        name,
        attributes: Some(attributes),
    }
}

/// An attribute constraint satisfied by the attribute's mere presence.
const fn has(name: &'static str) -> RoleRelationConceptAttribute {
    RoleRelationConceptAttribute { name, value: None }
}

/// An attribute constraint satisfied only by an exact static value.
const fn eq(name: &'static str, value: &'static str) -> RoleRelationConceptAttribute {
    RoleRelationConceptAttribute {
        name,
        value: Some(value),
    }
}

/// Non-interactive element role schemas.
#[rustfmt::skip]
pub static NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS: &[RoleRelationConcept] = &[
    tag("article"), tag("header"), tag("blockquote"), tag("caption"), tag("code"), tag("aside"),
    tag_with("aside", &[has("aria-label")]), tag_with("aside", &[has("aria-labelledby")]),
    tag("footer"), tag("dd"), tag("del"), tag("html"), tag("em"), tag("figure"),
    tag_with("form", &[has("aria-label")]), tag_with("form", &[has("aria-labelledby")]),
    tag_with("form", &[has("name")]), tag("details"), tag("fieldset"), tag("optgroup"),
    tag("address"), tag("h1"), tag("h2"), tag("h3"), tag("h4"), tag("h5"), tag("h6"),
    tag_with("img", &[has("alt")]), tag_with("img", &[has("alt")]), tag("ins"), tag("menu"),
    tag("ol"), tag("ul"), tag("li"), tag("main"), tag("mark"), tag("math"), tag("meter"),
    tag("nav"), tag("p"), tag_with("img", &[has("alt")]), tag("progress"),
    tag_with("section", &[has("aria-label")]), tag_with("section", &[has("aria-labelledby")]),
    tag("tbody"), tag("tfoot"), tag("thead"), tag("hr"), tag("output"), tag("strong"), tag("sub"),
    tag("sup"), tag("table"), tag("dfn"), tag("dt"), tag("time"),
];

/// Interactive element role schemas.
#[rustfmt::skip]
pub static INTERACTIVE_ELEMENT_ROLE_SCHEMAS: &[RoleRelationConcept] = &[
    tag_with("input", &[eq("type", "button")]), tag_with("input", &[eq("type", "image")]),
    tag_with("input", &[eq("type", "reset")]), tag_with("input", &[eq("type", "submit")]),
    tag("button"), tag("td"), tag_with("input", &[eq("type", "checkbox")]), tag("th"),
    tag_with("th", &[eq("scope", "col")]), tag_with("th", &[eq("scope", "colgroup")]),
    tag_with("input", &[has("list"), eq("type", "email")]),
    tag_with("input", &[has("list"), eq("type", "search")]),
    tag_with("input", &[has("list"), eq("type", "tel")]),
    tag_with("input", &[has("list"), eq("type", "text")]),
    tag_with("input", &[has("list"), eq("type", "url")]),
    tag_with("select", &[has("multiple"), has("size")]), tag("dialog"), tag("td"),
    tag_with("a", &[has("href")]), tag_with("area", &[has("href")]),
    tag_with("select", &[has("size")]), tag_with("select", &[has("multiple")]), tag("datalist"),
    tag("option"), tag_with("input", &[eq("type", "radio")]), tag("tr"),
    tag_with("th", &[eq("scope", "row")]), tag_with("th", &[eq("scope", "rowgroup")]),
    tag_with("input", &[has("list"), eq("type", "search")]),
    tag_with("input", &[eq("type", "range")]), tag_with("input", &[eq("type", "number")]),
    tag_with("input", &[has("type"), has("list")]),
    tag_with("input", &[has("list"), eq("type", "email")]),
    tag_with("input", &[has("list"), eq("type", "tel")]),
    tag_with("input", &[has("list"), eq("type", "text")]),
    tag_with("input", &[has("list"), eq("type", "url")]), tag("textarea"),
];

/// Interactive element AX object schemas.
#[rustfmt::skip]
pub static INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS: &[RoleRelationConcept] = &[
    tag("audio"), tag("button"), tag("canvas"), tag("td"),
    tag_with("input", &[eq("type", "checkbox")]), tag_with("input", &[eq("type", "color")]),
    tag("th"), tag("select"), tag_with("input", &[eq("type", "date")]),
    tag_with("input", &[eq("type", "datetime")]), tag("summary"), tag("embed"), tag("input"),
    tag_with("input", &[eq("type", "time")]), tag_with("a", &[has("href")]), tag("option"),
    tag("datalist"), tag("menuitem"), tag_with("input", &[eq("type", "radio")]),
    tag_with("th", &[eq("scope", "row")]), tag_with("input", &[eq("type", "search")]),
    tag_with("input", &[eq("type", "range")]), tag_with("input", &[eq("type", "number")]),
    tag("textarea"), tag_with("input", &[eq("type", "text")]), tag("video"),
];

/// Non-interactive element AX object schemas.
#[rustfmt::skip]
pub static NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS: &[RoleRelationConcept] = &[
    tag("abbr"), tag("article"), tag("blockquote"), tag("caption"), tag("dfn"), tag("dd"),
    tag("dl"), tag("dt"), tag("details"), tag("dir"), tag("figcaption"), tag("figure"),
    tag("footer"), tag("form"), tag("h1"), tag("h2"), tag("h3"), tag("h4"), tag("h5"), tag("h6"),
    tag_with("img", &[has("usemap")]), tag("img"), tag("label"), tag("legend"), tag("br"),
    tag("li"), tag("ul"), tag("ol"), tag("main"), tag("mark"), tag("marquee"), tag("menu"),
    tag("meter"), tag("nav"), tag("p"), tag("pre"), tag("progress"), tag("tr"), tag("ruby"),
    tag("table"), tag("time"),
];

/// Index of schemas grouped by tag name for O(1) lookup.
fn build_schema_index(schemas: &[RoleRelationConcept]) -> FxHashMap<&'static str, Vec<usize>> {
    let mut index: FxHashMap<&'static str, Vec<usize>> = FxHashMap::default();
    for (i, schema) in schemas.iter().enumerate() {
        index.entry(schema.name).or_default().push(i);
    }
    index
}

pub static NON_INTERACTIVE_ELEMENT_ROLE_INDEX: LazyLock<FxHashMap<&'static str, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS));

pub static INTERACTIVE_ELEMENT_ROLE_INDEX: LazyLock<FxHashMap<&'static str, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(INTERACTIVE_ELEMENT_ROLE_SCHEMAS));

pub static INTERACTIVE_ELEMENT_AX_OBJECT_INDEX: LazyLock<FxHashMap<&'static str, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS));

pub static NON_INTERACTIVE_ELEMENT_AX_OBJECT_INDEX: LazyLock<FxHashMap<&'static str, Vec<usize>>> =
    LazyLock::new(|| build_schema_index(NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS));

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
#[derive(Debug, Clone, Copy)]
pub struct AriaPropertyDefinition {
    pub property_type: AriaPropertyType,
    pub values: Option<&'static [&'static str]>,
}

use AriaPropertyType as T;

#[rustfmt::skip]
const ARIA_PROPERTY_TABLE: &[(&str, AriaPropertyType, Option<&[&str]>)] = &[
    ("aria-activedescendant", T::Id, None),
    ("aria-atomic", T::Boolean, None),
    ("aria-autocomplete", T::Token, Some(&["inline", "list", "both", "none"])),
    ("aria-braillelabel", T::String, None),
    ("aria-brailleroledescription", T::String, None),
    ("aria-busy", T::Boolean, None),
    ("aria-checked", T::Tristate, None),
    ("aria-colcount", T::Integer, None),
    ("aria-colindex", T::Integer, None),
    ("aria-colspan", T::Integer, None),
    ("aria-controls", T::IdList, None),
    ("aria-current", T::Token, Some(&["page", "step", "location", "date", "time", "true", "false"])),
    ("aria-describedby", T::IdList, None),
    ("aria-description", T::String, None),
    ("aria-details", T::Id, None),
    ("aria-disabled", T::Boolean, None),
    ("aria-dropeffect", T::TokenList, Some(&["copy", "execute", "link", "move", "none", "popup"])),
    ("aria-errormessage", T::Id, None),
    ("aria-expanded", T::Boolean, None),
    ("aria-flowto", T::IdList, None),
    ("aria-grabbed", T::Boolean, None),
    ("aria-haspopup", T::Token, Some(&["false", "true", "menu", "listbox", "tree", "grid", "dialog"])),
    ("aria-hidden", T::Boolean, None),
    ("aria-invalid", T::Token, Some(&["grammar", "false", "spelling", "true"])),
    ("aria-keyshortcuts", T::String, None),
    ("aria-label", T::String, None),
    ("aria-labelledby", T::IdList, None),
    ("aria-level", T::Integer, None),
    ("aria-live", T::Token, Some(&["assertive", "off", "polite"])),
    ("aria-modal", T::Boolean, None),
    ("aria-multiline", T::Boolean, None),
    ("aria-multiselectable", T::Boolean, None),
    ("aria-orientation", T::Token, Some(&["vertical", "undefined", "horizontal"])),
    ("aria-owns", T::IdList, None),
    ("aria-placeholder", T::String, None),
    ("aria-posinset", T::Integer, None),
    ("aria-pressed", T::Tristate, None),
    ("aria-readonly", T::Boolean, None),
    ("aria-relevant", T::TokenList, Some(&["additions", "all", "removals", "text"])),
    ("aria-required", T::Boolean, None),
    ("aria-roledescription", T::String, None),
    ("aria-rowcount", T::Integer, None),
    ("aria-rowindex", T::Integer, None),
    ("aria-rowspan", T::Integer, None),
    ("aria-selected", T::Boolean, None),
    ("aria-setsize", T::Integer, None),
    ("aria-sort", T::Token, Some(&["ascending", "descending", "none", "other"])),
    ("aria-valuemax", T::Number, None),
    ("aria-valuemin", T::Number, None),
    ("aria-valuenow", T::Number, None),
    ("aria-valuetext", T::String, None),
];

/// ARIA property definitions map.
pub static ARIA_PROPERTY_DEFINITIONS: LazyLock<FxHashMap<&'static str, AriaPropertyDefinition>> =
    LazyLock::new(|| {
        ARIA_PROPERTY_TABLE
            .iter()
            .map(|&(name, property_type, values)| {
                (
                    name,
                    AriaPropertyDefinition {
                        property_type,
                        values,
                    },
                )
            })
            .collect()
    });

/// Map of ARIA roles to their required properties.
/// Sourced from aria-query roles_map requiredProps.
/// Only roles that have non-empty requiredProps are included.
#[rustfmt::skip]
const ROLE_REQUIRED_PROPS_TABLE: &[(&str, &[&str])] = &[
    ("checkbox", &["aria-checked"]),
    ("combobox", &["aria-controls", "aria-expanded"]),
    ("heading", &["aria-level"]),
    ("menuitemcheckbox", &["aria-checked"]),
    ("menuitemradio", &["aria-checked"]),
    ("meter", &["aria-valuenow"]),
    ("option", &["aria-selected"]),
    ("radio", &["aria-checked"]),
    ("scrollbar", &["aria-controls", "aria-valuenow"]),
    ("slider", &["aria-valuenow"]),
    ("switch", &["aria-checked"]),
    ("treeitem", &["aria-selected"]),
];

pub static ROLE_REQUIRED_PROPS: LazyLock<FxHashMap<&'static str, &'static [&'static str]>> =
    LazyLock::new(|| ROLE_REQUIRED_PROPS_TABLE.iter().copied().collect());

/// Map of elements (with optional attributes) to the roles they semantically represent.
/// Used by `is_semantic_role_element` to determine if an element naturally carries a role.
/// Derived from axobject-query's elementAXObjects and AXObjectRoles maps.
///
/// Format: (element_name, optional_attributes, roles)
/// If an element matches (name + attributes), it semantically maps to those roles.
#[rustfmt::skip]
pub static SEMANTIC_ROLE_ELEMENTS: &[SemanticRoleElement] = &[
    ("input", Some(&[("type", "checkbox")]), &["checkbox", "switch"]),
    ("input", Some(&[("type", "radio")]), &["radio"]),
    ("input", Some(&[("type", "range")]), &["slider"]),
    ("select", None, &["combobox", "listbox"]),
    ("option", None, &["option"]),
    ("h1", None, &["heading"]),
    ("h2", None, &["heading"]),
    ("h3", None, &["heading"]),
    ("h4", None, &["heading"]),
    ("h5", None, &["heading"]),
    ("h6", None, &["heading"]),
    ("meter", None, &["meter"]),
    ("menuitem", Some(&[("type", "checkbox")]), &["menuitemcheckbox"]),
    ("menuitem", Some(&[("type", "radio")]), &["menuitemradio"]),
    ("treeitem", None, &["treeitem"]),
];

/// The ARIA props shared by every role except `doc-pullquote` / `none`
/// (aria-query's `roletype` prop set). Spliced into every `aria_props!` set below.
macro_rules! aria_props {
    ($($extra:literal),* $(,)?) => {
        &[
            "aria-atomic", "aria-busy", "aria-controls", "aria-current", "aria-describedby",
            "aria-details", "aria-dropeffect", "aria-flowto", "aria-grabbed", "aria-hidden",
            "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-live", "aria-owns",
            "aria-relevant", "aria-roledescription",
            $($extra,)*
        ]
    };
}

/// Shared by 46 roles.
const PROPS_ROLETYPE: &[&str] = aria_props![];
/// Shared by: alertdialog, dialog, window.
const PROPS_ALERTDIALOG: &[&str] = aria_props!["aria-modal"];
/// Shared by: application, graphics-object.
#[rustfmt::skip]
const PROPS_APPLICATION: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup",
    "aria-invalid",
];
const PROPS_ARTICLE: &[&str] = aria_props!["aria-posinset", "aria-setsize"];
#[rustfmt::skip]
const PROPS_BUTTON: &[&str] = aria_props![
    "aria-disabled", "aria-expanded", "aria-haspopup", "aria-pressed",
];
#[rustfmt::skip]
const PROPS_CELL: &[&str] = aria_props![
    "aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan",
];
/// Shared by: checkbox, switch.
#[rustfmt::skip]
const PROPS_CHECKBOX: &[&str] = aria_props![
    "aria-checked", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-invalid",
    "aria-readonly", "aria-required",
];
/// Shared by: columnheader, rowheader.
#[rustfmt::skip]
const PROPS_COLUMNHEADER: &[&str] = aria_props![
    "aria-colindex", "aria-colspan", "aria-disabled", "aria-errormessage", "aria-expanded",
    "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required", "aria-rowindex",
    "aria-rowspan", "aria-selected", "aria-sort",
];
#[rustfmt::skip]
const PROPS_COMBOBOX: &[&str] = aria_props![
    "aria-activedescendant", "aria-autocomplete", "aria-disabled", "aria-errormessage",
    "aria-expanded", "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required",
];
/// Shared by: composite, group.
const PROPS_COMPOSITE: &[&str] = aria_props!["aria-activedescendant", "aria-disabled"];
/// Shared by 37 roles.
#[rustfmt::skip]
const PROPS_DOC_ABSTRACT: &[&str] = aria_props![
    "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid",
];
/// Shared by: doc-biblioentry, doc-endnote.
#[rustfmt::skip]
const PROPS_DOC_BIBLIOENTRY: &[&str] = aria_props![
    "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid",
    "aria-level", "aria-posinset", "aria-setsize",
];
#[rustfmt::skip]
const PROPS_DOC_PAGEBREAK: &[&str] = aria_props![
    "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup", "aria-invalid",
    "aria-orientation", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext",
];
/// Shared by: doc-pagefooter, doc-pageheader.
#[rustfmt::skip]
const PROPS_DOC_PAGEFOOTER: &[&str] = aria_props![
    "aria-braillelabel", "aria-brailleroledescription", "aria-description", "aria-disabled",
    "aria-errormessage", "aria-haspopup", "aria-invalid",
];
#[rustfmt::skip]
const PROPS_GRID: &[&str] = aria_props![
    "aria-activedescendant", "aria-colcount", "aria-disabled", "aria-multiselectable",
    "aria-readonly", "aria-rowcount",
];
#[rustfmt::skip]
const PROPS_GRIDCELL: &[&str] = aria_props![
    "aria-colindex", "aria-colspan", "aria-disabled", "aria-errormessage", "aria-expanded",
    "aria-haspopup", "aria-invalid", "aria-readonly", "aria-required", "aria-rowindex",
    "aria-rowspan", "aria-selected",
];
const PROPS_HEADING: &[&str] = aria_props!["aria-level"];
const PROPS_INPUT: &[&str] = aria_props!["aria-disabled"];
const PROPS_LINK: &[&str] = aria_props!["aria-disabled", "aria-expanded", "aria-haspopup"];
#[rustfmt::skip]
const PROPS_LISTBOX: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-invalid",
    "aria-multiselectable", "aria-orientation", "aria-readonly", "aria-required",
];
const PROPS_LISTITEM: &[&str] = aria_props!["aria-level", "aria-posinset", "aria-setsize"];
#[rustfmt::skip]
const PROPS_MARK: &[&str] = aria_props![
    "aria-braillelabel", "aria-brailleroledescription", "aria-description",
];
/// Shared by: menu, menubar, select, toolbar.
#[rustfmt::skip]
const PROPS_MENU: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-orientation",
];
#[rustfmt::skip]
const PROPS_MENUITEM: &[&str] = aria_props![
    "aria-disabled", "aria-expanded", "aria-haspopup", "aria-posinset", "aria-setsize",
];
/// Shared by: menuitemcheckbox, menuitemradio.
#[rustfmt::skip]
const PROPS_MENUITEMCHECKBOX: &[&str] = aria_props![
    "aria-checked", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-haspopup",
    "aria-invalid", "aria-posinset", "aria-readonly", "aria-required", "aria-setsize",
];
/// Shared by: meter, progressbar.
#[rustfmt::skip]
const PROPS_METER: &[&str] = aria_props![
    "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext",
];
#[rustfmt::skip]
const PROPS_OPTION: &[&str] = aria_props![
    "aria-checked", "aria-disabled", "aria-posinset", "aria-selected", "aria-setsize",
];
#[rustfmt::skip]
const PROPS_RADIO: &[&str] = aria_props![
    "aria-checked", "aria-disabled", "aria-posinset", "aria-setsize",
];
#[rustfmt::skip]
const PROPS_RADIOGROUP: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-invalid",
    "aria-orientation", "aria-readonly", "aria-required",
];
const PROPS_RANGE: &[&str] = aria_props!["aria-valuemax", "aria-valuemin", "aria-valuenow"];
#[rustfmt::skip]
const PROPS_ROW: &[&str] = aria_props![
    "aria-activedescendant", "aria-colindex", "aria-disabled", "aria-expanded", "aria-level",
    "aria-posinset", "aria-rowindex", "aria-selected", "aria-setsize",
];
/// Shared by: scrollbar, separator.
#[rustfmt::skip]
const PROPS_SCROLLBAR: &[&str] = aria_props![
    "aria-disabled", "aria-orientation", "aria-valuemax", "aria-valuemin", "aria-valuenow",
    "aria-valuetext",
];
/// Shared by: searchbox, textbox.
#[rustfmt::skip]
const PROPS_SEARCHBOX: &[&str] = aria_props![
    "aria-activedescendant", "aria-autocomplete", "aria-disabled", "aria-errormessage",
    "aria-haspopup", "aria-invalid", "aria-multiline", "aria-placeholder", "aria-readonly",
    "aria-required",
];
#[rustfmt::skip]
const PROPS_SLIDER: &[&str] = aria_props![
    "aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid", "aria-orientation",
    "aria-readonly", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext",
];
#[rustfmt::skip]
const PROPS_SPINBUTTON: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-invalid", "aria-readonly",
    "aria-required", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext",
];
#[rustfmt::skip]
const PROPS_TAB: &[&str] = aria_props![
    "aria-disabled", "aria-expanded", "aria-haspopup", "aria-posinset", "aria-selected",
    "aria-setsize",
];
const PROPS_TABLE: &[&str] = aria_props!["aria-colcount", "aria-rowcount"];
#[rustfmt::skip]
const PROPS_TABLIST: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-level", "aria-multiselectable",
    "aria-orientation",
];
#[rustfmt::skip]
const PROPS_TREE: &[&str] = aria_props![
    "aria-activedescendant", "aria-disabled", "aria-errormessage", "aria-invalid",
    "aria-multiselectable", "aria-orientation", "aria-required",
];
#[rustfmt::skip]
const PROPS_TREEGRID: &[&str] = aria_props![
    "aria-activedescendant", "aria-colcount", "aria-disabled", "aria-errormessage", "aria-invalid",
    "aria-multiselectable", "aria-orientation", "aria-readonly", "aria-required", "aria-rowcount",
];
#[rustfmt::skip]
const PROPS_TREEITEM: &[&str] = aria_props![
    "aria-checked", "aria-disabled", "aria-expanded", "aria-haspopup", "aria-level",
    "aria-posinset", "aria-selected", "aria-setsize",
];

/// Map of WAI-ARIA roles to their allowed ARIA properties.
/// Generated from aria-query@5.3.1 roles map.
#[rustfmt::skip]
const ROLE_ALLOWED_ARIA_PROPS_TABLE: &[(&str, &[&str])] = &[
    ("alert", PROPS_ROLETYPE), ("alertdialog", PROPS_ALERTDIALOG),
    ("application", PROPS_APPLICATION), ("article", PROPS_ARTICLE), ("banner", PROPS_ROLETYPE),
    ("blockquote", PROPS_ROLETYPE), ("button", PROPS_BUTTON), ("caption", PROPS_ROLETYPE),
    ("cell", PROPS_CELL), ("checkbox", PROPS_CHECKBOX), ("code", PROPS_ROLETYPE),
    ("columnheader", PROPS_COLUMNHEADER), ("combobox", PROPS_COMBOBOX), ("command", PROPS_ROLETYPE),
    ("complementary", PROPS_ROLETYPE), ("composite", PROPS_COMPOSITE),
    ("contentinfo", PROPS_ROLETYPE), ("definition", PROPS_ROLETYPE), ("deletion", PROPS_ROLETYPE),
    ("dialog", PROPS_ALERTDIALOG), ("directory", PROPS_ROLETYPE),
    ("doc-abstract", PROPS_DOC_ABSTRACT), ("doc-acknowledgments", PROPS_DOC_ABSTRACT),
    ("doc-afterword", PROPS_DOC_ABSTRACT), ("doc-appendix", PROPS_DOC_ABSTRACT),
    ("doc-backlink", PROPS_DOC_ABSTRACT), ("doc-biblioentry", PROPS_DOC_BIBLIOENTRY),
    ("doc-bibliography", PROPS_DOC_ABSTRACT), ("doc-biblioref", PROPS_DOC_ABSTRACT),
    ("doc-chapter", PROPS_DOC_ABSTRACT), ("doc-colophon", PROPS_DOC_ABSTRACT),
    ("doc-conclusion", PROPS_DOC_ABSTRACT), ("doc-cover", PROPS_DOC_ABSTRACT),
    ("doc-credit", PROPS_DOC_ABSTRACT), ("doc-credits", PROPS_DOC_ABSTRACT),
    ("doc-dedication", PROPS_DOC_ABSTRACT), ("doc-endnote", PROPS_DOC_BIBLIOENTRY),
    ("doc-endnotes", PROPS_DOC_ABSTRACT), ("doc-epigraph", PROPS_DOC_ABSTRACT),
    ("doc-epilogue", PROPS_DOC_ABSTRACT), ("doc-errata", PROPS_DOC_ABSTRACT),
    ("doc-example", PROPS_DOC_ABSTRACT), ("doc-footnote", PROPS_DOC_ABSTRACT),
    ("doc-foreword", PROPS_DOC_ABSTRACT), ("doc-glossary", PROPS_DOC_ABSTRACT),
    ("doc-glossref", PROPS_DOC_ABSTRACT), ("doc-index", PROPS_DOC_ABSTRACT),
    ("doc-introduction", PROPS_DOC_ABSTRACT), ("doc-noteref", PROPS_DOC_ABSTRACT),
    ("doc-notice", PROPS_DOC_ABSTRACT), ("doc-pagebreak", PROPS_DOC_PAGEBREAK),
    ("doc-pagefooter", PROPS_DOC_PAGEFOOTER), ("doc-pageheader", PROPS_DOC_PAGEFOOTER),
    ("doc-pagelist", PROPS_DOC_ABSTRACT), ("doc-part", PROPS_DOC_ABSTRACT),
    ("doc-preface", PROPS_DOC_ABSTRACT), ("doc-prologue", PROPS_DOC_ABSTRACT),
    ("doc-pullquote", &[]), ("doc-qna", PROPS_DOC_ABSTRACT), ("doc-subtitle", PROPS_DOC_ABSTRACT),
    ("doc-tip", PROPS_DOC_ABSTRACT), ("doc-toc", PROPS_DOC_ABSTRACT), ("document", PROPS_ROLETYPE),
    ("emphasis", PROPS_ROLETYPE), ("feed", PROPS_ROLETYPE), ("figure", PROPS_ROLETYPE),
    ("form", PROPS_ROLETYPE), ("generic", PROPS_ROLETYPE),
    ("graphics-document", PROPS_DOC_ABSTRACT), ("graphics-object", PROPS_APPLICATION),
    ("graphics-symbol", PROPS_DOC_ABSTRACT), ("grid", PROPS_GRID), ("gridcell", PROPS_GRIDCELL),
    ("group", PROPS_COMPOSITE), ("heading", PROPS_HEADING), ("img", PROPS_ROLETYPE),
    ("input", PROPS_INPUT), ("insertion", PROPS_ROLETYPE), ("landmark", PROPS_ROLETYPE),
    ("link", PROPS_LINK), ("list", PROPS_ROLETYPE), ("listbox", PROPS_LISTBOX),
    ("listitem", PROPS_LISTITEM), ("log", PROPS_ROLETYPE), ("main", PROPS_ROLETYPE),
    ("mark", PROPS_MARK), ("marquee", PROPS_ROLETYPE), ("math", PROPS_ROLETYPE),
    ("menu", PROPS_MENU), ("menubar", PROPS_MENU), ("menuitem", PROPS_MENUITEM),
    ("menuitemcheckbox", PROPS_MENUITEMCHECKBOX), ("menuitemradio", PROPS_MENUITEMCHECKBOX),
    ("meter", PROPS_METER), ("navigation", PROPS_ROLETYPE), ("none", &[]), ("note", PROPS_ROLETYPE),
    ("option", PROPS_OPTION), ("paragraph", PROPS_ROLETYPE), ("presentation", PROPS_ROLETYPE),
    ("progressbar", PROPS_METER), ("radio", PROPS_RADIO), ("radiogroup", PROPS_RADIOGROUP),
    ("range", PROPS_RANGE), ("region", PROPS_ROLETYPE), ("roletype", PROPS_ROLETYPE),
    ("row", PROPS_ROW), ("rowgroup", PROPS_ROLETYPE), ("rowheader", PROPS_COLUMNHEADER),
    ("scrollbar", PROPS_SCROLLBAR), ("search", PROPS_ROLETYPE), ("searchbox", PROPS_SEARCHBOX),
    ("section", PROPS_ROLETYPE), ("sectionhead", PROPS_ROLETYPE), ("select", PROPS_MENU),
    ("separator", PROPS_SCROLLBAR), ("slider", PROPS_SLIDER), ("spinbutton", PROPS_SPINBUTTON),
    ("status", PROPS_ROLETYPE), ("strong", PROPS_ROLETYPE), ("structure", PROPS_ROLETYPE),
    ("subscript", PROPS_ROLETYPE), ("superscript", PROPS_ROLETYPE), ("switch", PROPS_CHECKBOX),
    ("tab", PROPS_TAB), ("table", PROPS_TABLE), ("tablist", PROPS_TABLIST),
    ("tabpanel", PROPS_ROLETYPE), ("term", PROPS_ROLETYPE), ("textbox", PROPS_SEARCHBOX),
    ("time", PROPS_ROLETYPE), ("timer", PROPS_ROLETYPE), ("toolbar", PROPS_MENU),
    ("tooltip", PROPS_ROLETYPE), ("tree", PROPS_TREE), ("treegrid", PROPS_TREEGRID),
    ("treeitem", PROPS_TREEITEM), ("widget", PROPS_ROLETYPE), ("window", PROPS_ALERTDIALOG),
];

pub static ROLE_ALLOWED_ARIA_PROPS: LazyLock<FxHashMap<&'static str, &'static [&'static str]>> =
    LazyLock::new(|| ROLE_ALLOWED_ARIA_PROPS_TABLE.iter().copied().collect());
