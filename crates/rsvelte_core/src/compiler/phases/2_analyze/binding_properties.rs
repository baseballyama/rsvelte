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

/// Map of binding names to their properties.
pub static BINDING_PROPERTIES: LazyLock<FxHashMap<&'static str, BindingProperty>> =
    LazyLock::new(|| {
        let mut map = FxHashMap::default();

        // Media bindings
        map.insert(
            "currentTime",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "duration",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .with_event("durationchange")
                .omit_in_ssr(),
        );
        map.insert("focused", BindingProperty::new());
        map.insert(
            "paused",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "buffered",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr(),
        );
        map.insert(
            "seekable",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr(),
        );
        map.insert(
            "played",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr(),
        );
        map.insert(
            "volume",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "muted",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "playbackRate",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "seeking",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr(),
        );
        map.insert(
            "ended",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr(),
        );
        map.insert(
            "readyState",
            BindingProperty::new()
                .with_valid_elements(&["audio", "video"])
                .omit_in_ssr(),
        );

        // Video bindings
        map.insert(
            "videoHeight",
            BindingProperty::new()
                .with_valid_elements(&["video"])
                .with_event("resize")
                .omit_in_ssr(),
        );
        map.insert(
            "videoWidth",
            BindingProperty::new()
                .with_valid_elements(&["video"])
                .with_event("resize")
                .omit_in_ssr(),
        );

        // Image bindings
        map.insert(
            "naturalWidth",
            BindingProperty::new()
                .with_valid_elements(&["img"])
                .with_event("load")
                .omit_in_ssr(),
        );
        map.insert(
            "naturalHeight",
            BindingProperty::new()
                .with_valid_elements(&["img"])
                .with_event("load")
                .omit_in_ssr(),
        );

        // Document bindings
        map.insert(
            "activeElement",
            BindingProperty::new()
                .with_valid_elements(&["svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "fullscreenElement",
            BindingProperty::new()
                .with_valid_elements(&["svelte:document"])
                .with_event("fullscreenchange")
                .omit_in_ssr(),
        );
        map.insert(
            "pointerLockElement",
            BindingProperty::new()
                .with_valid_elements(&["svelte:document"])
                .with_event("pointerlockchange")
                .omit_in_ssr(),
        );
        map.insert(
            "visibilityState",
            BindingProperty::new()
                .with_valid_elements(&["svelte:document"])
                .with_event("visibilitychange")
                .omit_in_ssr(),
        );

        // Window bindings
        map.insert(
            "innerWidth",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr(),
        );
        map.insert(
            "innerHeight",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr(),
        );
        map.insert(
            "outerWidth",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr(),
        );
        map.insert(
            "outerHeight",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr(),
        );
        map.insert(
            "scrollX",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "scrollY",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr()
                .bidirectional(),
        );
        map.insert(
            "online",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .omit_in_ssr(),
        );
        map.insert(
            "devicePixelRatio",
            BindingProperty::new()
                .with_valid_elements(&["svelte:window"])
                .with_event("resize")
                .omit_in_ssr(),
        );

        // Dimension bindings
        map.insert(
            "clientWidth",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "clientHeight",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "offsetWidth",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "offsetHeight",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "contentRect",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "contentBoxSize",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "borderBoxSize",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );
        map.insert(
            "devicePixelContentBoxSize",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .omit_in_ssr(),
        );

        // Checkbox/radio bindings
        map.insert(
            "indeterminate",
            BindingProperty::new()
                .with_valid_elements(&["input"])
                .with_event("change")
                .bidirectional()
                .omit_in_ssr(),
        );
        map.insert(
            "checked",
            BindingProperty::new()
                .with_valid_elements(&["input"])
                .bidirectional(),
        );
        map.insert(
            "group",
            BindingProperty::new()
                .with_valid_elements(&["input"])
                .bidirectional(),
        );

        // Various bindings
        map.insert("this", BindingProperty::new().omit_in_ssr());
        map.insert(
            "innerText",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .bidirectional(),
        );
        map.insert(
            "innerHTML",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .bidirectional(),
        );
        map.insert(
            "textContent",
            BindingProperty::new()
                .with_invalid_elements(&["svelte:window", "svelte:document"])
                .bidirectional(),
        );
        map.insert(
            "open",
            BindingProperty::new()
                .with_valid_elements(&["details"])
                .with_event("toggle")
                .bidirectional(),
        );
        map.insert(
            "value",
            BindingProperty::new()
                .with_valid_elements(&["input", "textarea", "select"])
                .bidirectional(),
        );
        map.insert(
            "files",
            BindingProperty::new()
                .with_valid_elements(&["input"])
                .omit_in_ssr()
                .bidirectional(),
        );

        map
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

/// Get all valid bindings for an element.
pub fn get_valid_bindings(element_name: &str) -> Vec<&'static str> {
    BINDING_PROPERTIES
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
        .collect()
}
