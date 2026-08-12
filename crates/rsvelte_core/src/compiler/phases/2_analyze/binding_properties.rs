//! Binding properties definition.
//!
//! Defines which bindings are valid for which elements.
//!
//! Corresponds to Svelte's `phases/bindings.js`.

use rustc_hash::FxHashMap;
use std::sync::LazyLock;

/// Properties of a binding.
#[derive(Debug, Clone)]
pub struct BindingProperty {
    /// Event that notifies of changes to this property
    pub event: Option<&'static str>,
    /// Whether updates are written to the DOM property
    pub bidirectional: bool,
    /// Whether this binding should be omitted in SSR
    pub omit_in_ssr: bool,
    /// If set, the binding is only valid on these elements
    pub valid_elements: Option<&'static [&'static str]>,
    /// If set, the binding is invalid on these elements
    pub invalid_elements: Option<&'static [&'static str]>,
}

impl BindingProperty {
    const fn new() -> Self {
        Self {
            event: None,
            bidirectional: false,
            omit_in_ssr: false,
            valid_elements: None,
            invalid_elements: None,
        }
    }

    const fn with_valid_elements(mut self, elements: &'static [&'static str]) -> Self {
        self.valid_elements = Some(elements);
        self
    }

    const fn with_invalid_elements(mut self, elements: &'static [&'static str]) -> Self {
        self.invalid_elements = Some(elements);
        self
    }

    const fn with_event(mut self, event: &'static str) -> Self {
        self.event = Some(event);
        self
    }

    const fn bidirectional(mut self) -> Self {
        self.bidirectional = true;
        self
    }

    const fn omit_in_ssr(mut self) -> Self {
        self.omit_in_ssr = true;
        self
    }
}

/// Binding definitions in the same order as Svelte's `phases/bindings.js`.
///
/// Diagnostics enumerate bindings from this ordered slice, never from the map, so
/// message order can never depend on hash iteration order.
pub static BINDING_PROPERTIES_LIST: &[(&str, BindingProperty)] = &[
    (
        "currentTime",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "duration",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .with_event("durationchange")
            .omit_in_ssr(),
    ),
    ("focused", BindingProperty::new()),
    (
        "paused",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "buffered",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr(),
    ),
    (
        "seekable",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr(),
    ),
    (
        "played",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr(),
    ),
    (
        "volume",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "muted",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "playbackRate",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "seeking",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr(),
    ),
    (
        "ended",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr(),
    ),
    (
        "readyState",
        BindingProperty::new()
            .with_valid_elements(&["audio", "video"])
            .omit_in_ssr(),
    ),
    (
        "videoHeight",
        BindingProperty::new()
            .with_valid_elements(&["video"])
            .with_event("resize")
            .omit_in_ssr(),
    ),
    (
        "videoWidth",
        BindingProperty::new()
            .with_valid_elements(&["video"])
            .with_event("resize")
            .omit_in_ssr(),
    ),
    (
        "naturalWidth",
        BindingProperty::new()
            .with_valid_elements(&["img"])
            .with_event("load")
            .omit_in_ssr(),
    ),
    (
        "naturalHeight",
        BindingProperty::new()
            .with_valid_elements(&["img"])
            .with_event("load")
            .omit_in_ssr(),
    ),
    (
        "activeElement",
        BindingProperty::new()
            .with_valid_elements(&["svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "fullscreenElement",
        BindingProperty::new()
            .with_valid_elements(&["svelte:document"])
            .with_event("fullscreenchange")
            .omit_in_ssr(),
    ),
    (
        "pointerLockElement",
        BindingProperty::new()
            .with_valid_elements(&["svelte:document"])
            .with_event("pointerlockchange")
            .omit_in_ssr(),
    ),
    (
        "visibilityState",
        BindingProperty::new()
            .with_valid_elements(&["svelte:document"])
            .with_event("visibilitychange")
            .omit_in_ssr(),
    ),
    (
        "innerWidth",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr(),
    ),
    (
        "innerHeight",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr(),
    ),
    (
        "outerWidth",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr(),
    ),
    (
        "outerHeight",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr(),
    ),
    (
        "scrollX",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "scrollY",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr()
            .bidirectional(),
    ),
    (
        "online",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .omit_in_ssr(),
    ),
    (
        "devicePixelRatio",
        BindingProperty::new()
            .with_valid_elements(&["svelte:window"])
            .with_event("resize")
            .omit_in_ssr(),
    ),
    (
        "clientWidth",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "clientHeight",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "offsetWidth",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "offsetHeight",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "contentRect",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "contentBoxSize",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "borderBoxSize",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "devicePixelContentBoxSize",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .omit_in_ssr(),
    ),
    (
        "indeterminate",
        BindingProperty::new()
            .with_valid_elements(&["input"])
            .with_event("change")
            .bidirectional()
            .omit_in_ssr(),
    ),
    (
        "checked",
        BindingProperty::new()
            .with_valid_elements(&["input"])
            .bidirectional(),
    ),
    (
        "group",
        BindingProperty::new()
            .with_valid_elements(&["input"])
            .bidirectional(),
    ),
    ("this", BindingProperty::new().omit_in_ssr()),
    (
        "innerText",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .bidirectional(),
    ),
    (
        "innerHTML",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .bidirectional(),
    ),
    (
        "textContent",
        BindingProperty::new()
            .with_invalid_elements(&["svelte:window", "svelte:document"])
            .bidirectional(),
    ),
    (
        "open",
        BindingProperty::new()
            .with_valid_elements(&["details"])
            .with_event("toggle")
            .bidirectional(),
    ),
    (
        "value",
        BindingProperty::new()
            .with_valid_elements(&["input", "textarea", "select"])
            .bidirectional(),
    ),
    (
        "files",
        BindingProperty::new()
            .with_valid_elements(&["input"])
            .omit_in_ssr()
            .bidirectional(),
    ),
];

/// Map of binding names to their properties.
pub static BINDING_PROPERTIES: LazyLock<FxHashMap<&'static str, BindingProperty>> =
    LazyLock::new(|| {
        BINDING_PROPERTIES_LIST
            .iter()
            .map(|(name, property)| (*name, property.clone()))
            .collect()
    });

/// Check if a binding is valid for a given element.
pub fn is_binding_valid(binding_name: &str, element_name: &str) -> bool {
    if let Some(property) = BINDING_PROPERTIES.get(binding_name) {
        // Check valid_elements
        if let Some(valid) = property.valid_elements {
            return valid.contains(&element_name);
        }

        // Check invalid_elements
        if let Some(invalid) = property.invalid_elements {
            return !invalid.contains(&element_name);
        }

        // No restrictions
        true
    } else {
        false
    }
}

/// Get all valid bindings for an element, sorted like Svelte's `.sort()` on the
/// `Possible bindings for <…> are …` enumeration.
pub fn get_valid_bindings(element_name: &str) -> Vec<&'static str> {
    let mut names: Vec<&'static str> = BINDING_PROPERTIES_LIST
        .iter()
        .filter(|(_name, property)| {
            if let Some(valid) = property.valid_elements {
                valid.contains(&element_name)
            } else if let Some(invalid) = property.invalid_elements {
                !invalid.contains(&element_name)
            } else {
                true
            }
        })
        .map(|(name, _)| *name)
        .collect();
    names.sort_unstable();
    names
}

/// All binding names, in Svelte's `Object.keys(binding_properties)` order.
pub fn all_binding_names() -> Vec<&'static str> {
    BINDING_PROPERTIES_LIST
        .iter()
        .map(|(name, _)| *name)
        .collect()
}
