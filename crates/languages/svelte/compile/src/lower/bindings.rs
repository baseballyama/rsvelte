//! Upstream's `binding_properties` for elements: where each `bind:` property is valid, and the
//! runtime call that keeps it in sync.

use rsvelte_kernel::diagnostics::Diagnostic;

use super::special::invalid;
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
    pub bidirectional: bool,
    /// The server renders nothing for it.
    pub client_only: bool,
}

const MEDIA: &[&str] = &["audio", "video"];
const INPUT: &[&str] = &["input"];

const fn property(lowering: Lowering, bidirectional: bool, client_only: bool) -> Property {
    Property {
        lowering,
        bidirectional,
        client_only,
    }
}

/// Upstream's `valid_elements` for the binding `name`, as tag names: `None` when any element
/// takes it or no element does.
pub(super) fn valid_hosts(name: &str) -> Option<&'static [&'static str]> {
    Some(match name {
        "currentTime" | "duration" | "paused" | "buffered" | "seekable" | "played" | "volume"
        | "muted" | "playbackRate" | "seeking" | "ended" | "readyState" => MEDIA,
        "videoHeight" | "videoWidth" => &["video"],
        "naturalWidth" | "naturalHeight" => &["img"],
        "activeElement" | "fullscreenElement" | "pointerLockElement" | "visibilityState" => {
            &["svelte:document"]
        }
        "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight" | "scrollX" | "scrollY"
        | "online" | "devicePixelRatio" => &["svelte:window"],
        "indeterminate" | "checked" | "group" | "files" => INPUT,
        "open" => &["details"],
        "value" => &["input", "textarea", "select"],
        _ => return None,
    })
}

/// Upstream's `bind_invalid_target` for the binding `a` on `host`, the tag name as written.
///
/// # Errors
///
/// `bind_invalid_target` when `host` cannot take the binding.
pub(super) fn check_target(
    source_text: &str,
    host: &str,
    attributes: &[Attribute],
    a: &Attribute,
) -> Result<(), Diagnostic> {
    let name = a.name.text(source_text);
    let target = |elements: &str| {
        invalid(
            "bind_invalid_target",
            &format!("`bind:{name}` can only be used with {elements}"),
            a.span,
        )
    };
    if let Some(hosts) = valid_hosts(name)
        && !hosts.contains(&host)
    {
        let hosts: Vec<String> = hosts.iter().map(|h| format!("`<{h}>`")).collect();
        return target(&hosts.join(", "));
    }
    if host == "input" && matches!(name, "checked" | "files") {
        // A `type` not written as text is upstream's `attribute_invalid_type` instead.
        let ty = match attribute_value(source_text, attributes, "type") {
            None => None,
            Some(AttributeValue::Static(ty)) => Some(&**ty),
            Some(_) => return Ok(()),
        };
        if name == "checked" && ty != Some("checkbox") {
            let radio = if ty == Some("radio") {
                " \u{2014} for `<input type=\"radio\">`, use `bind:group`"
            } else {
                ""
            };
            return target(&format!("`<input type=\"checkbox\">`{radio}"));
        }
        if name == "files" && ty != Some("file") {
            return target("`<input type=\"file\">`");
        }
    }
    if name == "offsetWidth" && rsvelte_svelte_syntax::names::is_svg(host) {
        return target("non-`<svg>` elements. Use `bind:clientWidth` for `<svg>` instead");
    }
    Ok(())
}

/// The element property `name`, or `None` when no element takes it.
pub(super) fn property_of(name: &str) -> Option<Property> {
    use Lowering::{Accessors, ContentEditable, Event, Group, Measured, Setter, This, Value};
    Some(match name {
        "currentTime" => property(Accessors("bind_current_time"), true, true),
        "duration" => property(Event("durationchange"), false, true),
        "paused" => property(Accessors("bind_paused"), true, true),
        "buffered" => property(Setter("bind_buffered"), false, true),
        "seekable" => property(Setter("bind_seekable"), false, true),
        "played" => property(Setter("bind_played"), false, true),
        "volume" => property(Accessors("bind_volume"), true, true),
        "muted" => property(Accessors("bind_muted"), true, true),
        "playbackRate" => property(Accessors("bind_playback_rate"), true, true),
        "seeking" => property(Setter("bind_seeking"), false, true),
        "ended" => property(Setter("bind_ended"), false, true),
        "readyState" => property(Setter("bind_ready_state"), false, true),
        "videoHeight" | "videoWidth" => property(Event("resize"), false, true),
        "naturalWidth" | "naturalHeight" => property(Event("load"), false, true),
        "clientWidth" | "clientHeight" | "offsetWidth" | "offsetHeight" => {
            property(Measured("bind_element_size"), false, true)
        }
        "contentRect" | "contentBoxSize" | "borderBoxSize" | "devicePixelContentBoxSize" => {
            property(Measured("bind_resize_observer"), false, true)
        }
        "focused" => property(Setter("bind_focused"), false, true),
        "indeterminate" => property(Event("change"), true, true),
        "checked" => property(Accessors("bind_checked"), true, false),
        "group" => property(Group, true, false),
        "this" => property(This, false, true),
        "innerText" | "innerHTML" | "textContent" => property(ContentEditable, true, false),
        "open" => property(Event("toggle"), true, false),
        "value" => property(Value, true, false),
        "files" => property(Accessors("bind_files"), true, true),
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
