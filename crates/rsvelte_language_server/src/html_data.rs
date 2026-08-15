//! Native completion and hover data for Svelte's HTML surface.

/// A native HTML/Svelte element description.
pub struct TagData {
    pub name: &'static str,
    pub description: &'static str,
}

pub const TAGS: &[TagData] = &[
    TagData {
        name: "a",
        description: "A hyperlink.",
    },
    TagData {
        name: "button",
        description: "An interactive button.",
    },
    TagData {
        name: "div",
        description: "A generic flow container.",
    },
    TagData {
        name: "form",
        description: "A form control container.",
    },
    TagData {
        name: "img",
        description: "An image.",
    },
    TagData {
        name: "input",
        description: "A form input control.",
    },
    TagData {
        name: "label",
        description: "A caption for a form control.",
    },
    TagData {
        name: "li",
        description: "A list item.",
    },
    TagData {
        name: "main",
        description: "The document's main content.",
    },
    TagData {
        name: "option",
        description: "An option in a select control.",
    },
    TagData {
        name: "p",
        description: "A paragraph.",
    },
    TagData {
        name: "section",
        description: "A thematic document section.",
    },
    TagData {
        name: "select",
        description: "A select control.",
    },
    TagData {
        name: "span",
        description: "A generic phrasing container.",
    },
    TagData {
        name: "textarea",
        description: "A multiline text input.",
    },
    TagData {
        name: "ul",
        description: "An unordered list.",
    },
    TagData {
        name: "svelte:self",
        description: "Recursively renders the current component.",
    },
    TagData {
        name: "svelte:component",
        description: "Renders a dynamic component selected by `this`.",
    },
    TagData {
        name: "svelte:element",
        description: "Renders a dynamic DOM element selected by `this`.",
    },
    TagData {
        name: "svelte:window",
        description: "Adds listeners and bindings to `window`.",
    },
    TagData {
        name: "svelte:document",
        description: "Adds listeners and bindings to `document`.",
    },
    TagData {
        name: "svelte:body",
        description: "Adds listeners to `document.body`.",
    },
    TagData {
        name: "svelte:head",
        description: "Renders content into document head.",
    },
    TagData {
        name: "svelte:options",
        description: "Sets per-component compiler options.",
    },
    TagData {
        name: "svelte:fragment",
        description: "Assigns component content to a named slot without a wrapper.",
    },
    TagData {
        name: "svelte:boundary",
        description: "Catches errors and renders fallback UI.",
    },
    TagData {
        name: "slot",
        description: "Declares a component slot with optional fallback content.",
    },
];

#[must_use]
pub fn tag(name: &str) -> Option<&'static TagData> {
    TAGS.iter().find(|candidate| candidate.name == name)
}
