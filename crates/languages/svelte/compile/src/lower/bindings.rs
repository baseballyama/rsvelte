//! Upstream's `binding_properties` for elements: where each `bind:` property is valid, and the
//! runtime call that keeps it in sync.

use super::{Attribute, AttributeValue};

/// How the client keeps a bound property in sync with its target.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Lowering {
    /// `$.bind_property(name, event, node, set, get?)`; the getter only when bidirectional.
    Event(&'static str),
    /// `$.<runtime>(node, get, set)`.
    Accessors(&'static str),
    /// `$.<runtime>(node, set)`.
    Setter(&'static str),
    /// `$.<runtime>(node, name, set)`.
    Measured(&'static str),
    /// `$.bind_content_editable(name, node, get, set)`.
    ContentEditable,
    /// `$.bind_value`, or `$.bind_select_value` on a `<select>`.
    Value,
    Group,
    This,
}

pub(super) struct Property {
    pub lowering: Lowering,
    /// The elements it is valid on; `None` for all of them.
    pub elements: Option<&'static [&'static str]>,
    pub bidirectional: bool,
    /// The server renders nothing for it.
    pub client_only: bool,
}

const MEDIA: &[&str] = &["audio", "video"];
const INPUT: &[&str] = &["input"];

const fn property(
    lowering: Lowering,
    elements: Option<&'static [&'static str]>,
    bidirectional: bool,
    client_only: bool,
) -> Property {
    Property {
        lowering,
        elements,
        bidirectional,
        client_only,
    }
}

/// The element property `name`, or `None` when no element takes it.
pub(super) fn property_of(name: &str) -> Option<Property> {
    use Lowering::{Accessors, ContentEditable, Event, Group, Measured, Setter, This, Value};
    Some(match name {
        "currentTime" => property(Accessors("bind_current_time"), Some(MEDIA), true, true),
        "duration" => property(Event("durationchange"), Some(MEDIA), false, true),
        "paused" => property(Accessors("bind_paused"), Some(MEDIA), true, true),
        "buffered" => property(Setter("bind_buffered"), Some(MEDIA), false, true),
        "seekable" => property(Setter("bind_seekable"), Some(MEDIA), false, true),
        "played" => property(Setter("bind_played"), Some(MEDIA), false, true),
        "volume" => property(Accessors("bind_volume"), Some(MEDIA), true, true),
        "muted" => property(Accessors("bind_muted"), Some(MEDIA), true, true),
        "playbackRate" => property(Accessors("bind_playback_rate"), Some(MEDIA), true, true),
        "seeking" => property(Setter("bind_seeking"), Some(MEDIA), false, true),
        "ended" => property(Setter("bind_ended"), Some(MEDIA), false, true),
        "readyState" => property(Setter("bind_ready_state"), Some(MEDIA), false, true),
        "videoHeight" | "videoWidth" => property(Event("resize"), Some(&["video"]), false, true),
        "naturalWidth" | "naturalHeight" => property(Event("load"), Some(&["img"]), false, true),
        "clientWidth" | "clientHeight" | "offsetWidth" | "offsetHeight" => {
            property(Measured("bind_element_size"), None, false, true)
        }
        "contentRect" | "contentBoxSize" | "borderBoxSize" | "devicePixelContentBoxSize" => {
            property(Measured("bind_resize_observer"), None, false, true)
        }
        "focused" => property(Setter("bind_focused"), None, false, true),
        "indeterminate" => property(Event("change"), Some(INPUT), true, true),
        "checked" => property(Accessors("bind_checked"), Some(INPUT), true, false),
        "group" => property(Group, Some(INPUT), true, false),
        "this" => property(This, None, false, true),
        "innerText" | "innerHTML" | "textContent" => property(ContentEditable, None, true, false),
        "open" => property(Event("toggle"), Some(&["details"]), true, false),
        "value" => property(Value, Some(&["input", "textarea", "select"]), true, false),
        "files" => property(Accessors("bind_files"), Some(INPUT), true, true),
        _ => return None,
    })
}

/// The value of the attribute `name`, which a directive of that name does not count as.
pub(super) fn attribute_value<'a>(
    source_text: &str,
    attributes: &'a [Attribute],
    name: &str,
) -> Option<&'a AttributeValue> {
    attributes
        .iter()
        .find(|a| !super::is_directive(&a.value) && a.name.text(source_text) == name)
        .map(|a| &a.value)
}

/// Whether an element binds `name`.
pub(super) fn binds(source_text: &str, attributes: &[Attribute], name: &str) -> bool {
    attributes
        .iter()
        .any(|a| matches!(a.value, AttributeValue::Bind(_)) && a.name.text(source_text) == name)
}

/// Upstream's `needs_special_value_handling`: the element's `value` goes to the hidden
/// `__value` after its children.
pub(super) fn needs_special_value(source_text: &str, tag: &str, attributes: &[Attribute]) -> bool {
    matches!(tag, "option" | "select")
        || binds(source_text, attributes, "group")
        || binds(source_text, attributes, "checked")
}
