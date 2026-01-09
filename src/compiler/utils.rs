//! General utilities for the Svelte compiler.
//!
//! Corresponds to Svelte's `utils.js`.

/// List of Element events that will be delegated.
///
/// Corresponds to `DELEGATED_EVENTS` in utils.js.
const DELEGATED_EVENTS: &[&str] = &[
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart",
];

/// Returns `true` if `event_name` is a delegated event.
///
/// Corresponds to `can_delegate_event` in utils.js.
pub fn can_delegate_event(event_name: &str) -> bool {
    DELEGATED_EVENTS.contains(&event_name)
}

/// Properties that cannot be set statically through the template string.
/// These need JavaScript handling to work properly.
///
/// Corresponds to `NON_STATIC_PROPERTIES` in utils.js.
const NON_STATIC_PROPERTIES: &[&str] = &["autofocus", "muted", "defaultValue", "defaultChecked"];

/// Returns `true` if the given attribute cannot be set through the template
/// string, i.e. needs some kind of JavaScript handling to work.
///
/// Corresponds to `cannot_be_set_statically` in utils.js.
pub fn cannot_be_set_statically(name: &str) -> bool {
    NON_STATIC_PROPERTIES.contains(&name)
}

/// Check if an event name is a capture event.
///
/// Corresponds to `is_capture_event` in utils.js.
pub fn is_capture_event(name: &str) -> bool {
    name.ends_with("capture") && name != "gotpointercapture" && name != "lostpointercapture"
}

/// Check if an event should be passive by default.
///
/// Corresponds to `is_passive_event` in utils.js.
pub fn is_passive_event(name: &str) -> bool {
    matches!(name, "touchstart" | "touchmove")
}

/// Check if a name is a boolean attribute.
///
/// Corresponds to `is_boolean_attribute` in utils.js.
pub fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "allowfullscreen"
            | "async"
            | "autofocus"
            | "autoplay"
            | "checked"
            | "controls"
            | "default"
            | "disabled"
            | "formnovalidate"
            | "indeterminate"
            | "inert"
            | "ismap"
            | "loop"
            | "multiple"
            | "muted"
            | "nomodule"
            | "novalidate"
            | "open"
            | "playsinline"
            | "readonly"
            | "required"
            | "reversed"
            | "seamless"
            | "selected"
            | "webkitdirectory"
            | "defer"
            | "disablepictureinpicture"
            | "disableremoteplayback"
    )
}

/// Check if a name is a void element (self-closing).
pub fn is_void_element(name: &str) -> bool {
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
    )
}

/// Check if a binding is to a content-editable property.
pub fn is_content_editable_binding(name: &str) -> bool {
    matches!(name, "textContent" | "innerHTML" | "innerText")
}
