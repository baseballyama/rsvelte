//! General utilities for the Svelte compiler.
//!
//! Corresponds to Svelte's `utils.js`.

/// Slice a fixed-size look-back window ending at `end`, clamped to a UTF-8
/// char boundary so it can never panic.
///
/// Returns `source[lo..end]`, where `lo` is the first char boundary at or after
/// `end.saturating_sub(window)`. A plain `&source[end - window..end]` panics
/// with a non-char-boundary slice error when a multibyte character straddles
/// `end - window` — which a `.svelte` source can contain anywhere. Callers use
/// these windows to feed ASCII-only scans (e.g. a regex for `{:then`), so a
/// shorter window on multibyte input is equivalent: the ASCII pattern can't
/// span a multibyte byte. `end` must already be a char boundary (callers pass
/// AST token positions); it is clamped to `source.len()` defensively.
pub fn char_boundary_lookback(source: &str, end: usize, window: usize) -> &str {
    let end = end.min(source.len());
    let lo = (end.saturating_sub(window)..end)
        .find(|&i| source.is_char_boundary(i))
        .unwrap_or(end);
    &source[lo..end]
}

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

/// Extract the basename (last component) from a file path.
///
/// Like node's `basename`, but doesn't use it to ensure the compiler is usable
/// in a browser environment.
///
/// Corresponds to `get_basename` in mapped_code.js.
pub fn get_basename(filename: &str) -> String {
    filename
        .split(['/', '\\'])
        .next_back()
        .unwrap_or("")
        .to_string()
}

/// Get a location function for finding line/column from character offset.
///
/// This creates a closure that can efficiently look up locations in the source.
pub fn get_locator(
    source: &str,
) -> std::sync::Arc<dyn Fn(usize) -> crate::compiler::preprocess::types::Location + Send + Sync> {
    // Pre-compute line start positions
    let mut line_starts = vec![0];
    for (i, ch) in source.char_indices() {
        if ch == '\n' {
            line_starts.push(i + 1);
        }
    }

    let source_len = source.len();
    std::sync::Arc::new(move |index| {
        let index = index.min(source_len);

        // Binary search for the line
        let line = match line_starts.binary_search(&index) {
            Ok(exact) => exact,
            Err(insert_pos) => insert_pos.saturating_sub(1),
        };

        let column = index - line_starts.get(line).copied().unwrap_or(0);

        crate::compiler::preprocess::types::Location { line, column }
    })
}
