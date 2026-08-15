//! Native completion and hover data for Svelte's HTML surface.

/// A native HTML/Svelte element description.
pub struct TagData {
    pub name: &'static str,
    pub description: &'static str,
}

/// An attribute or directive understood by the Svelte template language.
pub struct AttributeData {
    pub name: &'static str,
    pub description: &'static str,
    pub elements: &'static [&'static str],
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

/// Standard HTML elements not needing Svelte-specific documentation. This is
/// kept separate so the Svelte overlay remains explicit and searchable.
pub const STANDARD_TAGS: &[&str] = &[
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "ins",
    "kbd",
    "legend",
    "link",
    "map",
    "mark",
    "menu",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "output",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "small",
    "source",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "var",
    "video",
    "wbr",
];

#[must_use]
pub fn tag(name: &str) -> Option<&'static TagData> {
    TAGS.iter().find(|candidate| candidate.name == name)
}

const ALL: &[&str] = &[];

pub const ATTRIBUTES: &[AttributeData] = &[
    AttributeData {
        name: "id",
        description: "Gives the element a document-unique identifier.",
        elements: ALL,
    },
    AttributeData {
        name: "class",
        description: "Sets the element's CSS classes.",
        elements: ALL,
    },
    AttributeData {
        name: "style",
        description: "Sets inline CSS declarations.",
        elements: ALL,
    },
    AttributeData {
        name: "slot",
        description: "Assigns this element to a component slot.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:this",
        description: "Binds the element or component instance to a variable.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:innerHTML",
        description: "Binds an element's `innerHTML`.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:textContent",
        description: "Binds an element's `textContent`.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:clientWidth",
        description: "Observes an element's client width.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:clientHeight",
        description: "Observes an element's client height.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:offsetWidth",
        description: "Observes an element's offset width.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:offsetHeight",
        description: "Observes an element's offset height.",
        elements: ALL,
    },
    AttributeData {
        name: "use:",
        description: "Applies a Svelte action.",
        elements: ALL,
    },
    AttributeData {
        name: "transition:",
        description: "Runs a transition when the element enters or leaves.",
        elements: ALL,
    },
    AttributeData {
        name: "in:",
        description: "Runs an intro transition.",
        elements: ALL,
    },
    AttributeData {
        name: "out:",
        description: "Runs an outro transition.",
        elements: ALL,
    },
    AttributeData {
        name: "animate:",
        description: "Applies an animation to a keyed each-block child.",
        elements: ALL,
    },
    AttributeData {
        name: "style:",
        description: "Sets a single CSS property reactively.",
        elements: ALL,
    },
    AttributeData {
        name: "on:click",
        description: "Listens for the `click` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:input",
        description: "Listens for the `input` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:change",
        description: "Listens for the `change` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:submit",
        description: "Listens for the `submit` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:keydown",
        description: "Listens for the `keydown` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:keyup",
        description: "Listens for the `keyup` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:focus",
        description: "Listens for the `focus` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:blur",
        description: "Listens for the `blur` event.",
        elements: ALL,
    },
    AttributeData {
        name: "on:introstart",
        description: "Listens for a Svelte intro transition starting.",
        elements: ALL,
    },
    AttributeData {
        name: "on:introend",
        description: "Listens for a Svelte intro transition ending.",
        elements: ALL,
    },
    AttributeData {
        name: "on:outrostart",
        description: "Listens for a Svelte outro transition starting.",
        elements: ALL,
    },
    AttributeData {
        name: "on:outroend",
        description: "Listens for a Svelte outro transition ending.",
        elements: ALL,
    },
    AttributeData {
        name: "bind:value",
        description: "Binds the selected value.",
        elements: &["input", "select", "textarea"],
    },
    AttributeData {
        name: "bind:group",
        description: "Binds a checkbox or radio group.",
        elements: &["input"],
    },
    AttributeData {
        name: "bind:checked",
        description: "Binds a checkbox's checked state.",
        elements: &["input"],
    },
    AttributeData {
        name: "bind:files",
        description: "Binds an input's selected files.",
        elements: &["input"],
    },
    AttributeData {
        name: "bind:naturalWidth",
        description: "Observes an image's intrinsic width.",
        elements: &["img"],
    },
    AttributeData {
        name: "bind:naturalHeight",
        description: "Observes an image's intrinsic height.",
        elements: &["img"],
    },
    AttributeData {
        name: "bind:open",
        description: "Binds whether the details element is open.",
        elements: &["details"],
    },
    AttributeData {
        name: "bind:currentTime",
        description: "Binds a media element's playback position.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:paused",
        description: "Binds whether media playback is paused.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:volume",
        description: "Binds a media element's volume.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:muted",
        description: "Binds whether media is muted.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:duration",
        description: "Observes media duration.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:buffered",
        description: "Observes buffered media ranges.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:seekable",
        description: "Observes seekable media ranges.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:played",
        description: "Observes played media ranges.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:seeking",
        description: "Observes whether media is seeking.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:ended",
        description: "Observes whether media ended.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:playbackRate",
        description: "Binds media playback rate.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:readyState",
        description: "Observes media ready state.",
        elements: &["audio", "video"],
    },
    AttributeData {
        name: "bind:videoWidth",
        description: "Observes a video's intrinsic width.",
        elements: &["video"],
    },
    AttributeData {
        name: "bind:videoHeight",
        description: "Observes a video's intrinsic height.",
        elements: &["video"],
    },
    AttributeData {
        name: "generics",
        description: "Declares generic type parameters for a component script.",
        elements: &["script"],
    },
    AttributeData {
        name: "data-sveltekit-keepfocus",
        description: "Keeps focus after SvelteKit navigation.",
        elements: &["a", "form"],
    },
    AttributeData {
        name: "data-sveltekit-noscroll",
        description: "Prevents scroll reset after SvelteKit navigation.",
        elements: &["a", "form"],
    },
    AttributeData {
        name: "data-sveltekit-preload-code",
        description: "Preloads SvelteKit route code.",
        elements: &["a"],
    },
    AttributeData {
        name: "data-sveltekit-reload",
        description: "Forces a full-document SvelteKit navigation.",
        elements: &["a", "form"],
    },
    AttributeData {
        name: "data-sveltekit-replacestate",
        description: "Replaces history instead of pushing it.",
        elements: &["a", "form"],
    },
];

pub fn attributes(element: &str) -> impl Iterator<Item = &'static AttributeData> {
    ATTRIBUTES.iter().filter(move |attribute| {
        attribute.elements.is_empty() || attribute.elements.contains(&element)
    })
}

#[must_use]
pub fn attribute(element: &str, name: &str) -> Option<&'static AttributeData> {
    attributes(element).find(|candidate| candidate.name == name)
}
