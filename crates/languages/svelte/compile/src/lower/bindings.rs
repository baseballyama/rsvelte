//! Upstream's `binding_properties` for elements: where each `bind:` property is valid, and the
//! runtime call that keeps it in sync.

mod fuzzymatch;

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

/// Where a binding is valid: upstream's `valid_elements` and `invalid_elements`.
#[derive(Clone, Copy)]
enum Hosts {
    Any,
    Only(&'static [&'static str]),
    Not(&'static [&'static str]),
}

impl Hosts {
    fn take(self, host: &str) -> bool {
        match self {
            Self::Any => true,
            Self::Only(hosts) => hosts.contains(&host),
            Self::Not(hosts) => !hosts.contains(&host),
        }
    }
}

const GLOBALS: &[&str] = &["svelte:window", "svelte:document"];

/// Upstream's `binding_properties` in its order, which its suggestions and lists follow.
const BINDINGS: &[(&str, Hosts)] = {
    use Hosts::{Any, Not, Only};
    const WINDOW: Hosts = Only(&["svelte:window"]);
    const DOCUMENT: Hosts = Only(&["svelte:document"]);
    &[
        ("currentTime", Only(MEDIA)),
        ("duration", Only(MEDIA)),
        ("focused", Any),
        ("paused", Only(MEDIA)),
        ("buffered", Only(MEDIA)),
        ("seekable", Only(MEDIA)),
        ("played", Only(MEDIA)),
        ("volume", Only(MEDIA)),
        ("muted", Only(MEDIA)),
        ("playbackRate", Only(MEDIA)),
        ("seeking", Only(MEDIA)),
        ("ended", Only(MEDIA)),
        ("readyState", Only(MEDIA)),
        ("videoHeight", Only(&["video"])),
        ("videoWidth", Only(&["video"])),
        ("naturalWidth", Only(&["img"])),
        ("naturalHeight", Only(&["img"])),
        ("activeElement", DOCUMENT),
        ("fullscreenElement", DOCUMENT),
        ("pointerLockElement", DOCUMENT),
        ("visibilityState", DOCUMENT),
        ("innerWidth", WINDOW),
        ("innerHeight", WINDOW),
        ("outerWidth", WINDOW),
        ("outerHeight", WINDOW),
        ("scrollX", WINDOW),
        ("scrollY", WINDOW),
        ("online", WINDOW),
        ("devicePixelRatio", WINDOW),
        ("clientWidth", Not(GLOBALS)),
        ("clientHeight", Not(GLOBALS)),
        ("offsetWidth", Not(GLOBALS)),
        ("offsetHeight", Not(GLOBALS)),
        ("contentRect", Not(GLOBALS)),
        ("contentBoxSize", Not(GLOBALS)),
        ("borderBoxSize", Not(GLOBALS)),
        ("devicePixelContentBoxSize", Not(GLOBALS)),
        ("indeterminate", Only(INPUT)),
        ("checked", Only(INPUT)),
        ("group", Only(INPUT)),
        ("this", Any),
        ("innerText", Not(GLOBALS)),
        ("innerHTML", Not(GLOBALS)),
        ("textContent", Not(GLOBALS)),
        ("open", Only(&["details"])),
        ("value", Only(&["input", "textarea", "select"])),
        ("files", Only(INPUT)),
    ]
};

/// The names JavaScript's `in` finds on every object, which upstream takes for bindings.
const INHERITED: &[&str] = &[
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf",
    "__proto__",
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
];

/// Upstream `BindDirective`'s checks of the binding `a` against `host`, the tag as written.
///
/// # Errors
///
/// `bind_invalid_name` for a name no binding has or one `host` does not take, and
/// `bind_invalid_target` for an element the binding does not fit.
pub(super) fn check_binding(
    source_text: &str,
    host: &str,
    attributes: &[Attribute],
    a: &Attribute,
) -> Result<(), Diagnostic> {
    let name = a.name.text(source_text);
    let invalid_name = |explanation: &str| {
        let message = format!("`bind:{name}` is not a valid binding{explanation}");
        invalid("bind_invalid_name", &message, a.span)
    };
    let Some(&(_, hosts)) = BINDINGS.iter().find(|&&(n, _)| n == name) else {
        if INHERITED.contains(&name) {
            return Ok(());
        }
        let names: Vec<&str> = BINDINGS.iter().map(|&(n, _)| n).collect();
        if let Some(near) = fuzzymatch::fuzzymatch(name, &names)
            && BINDINGS.iter().any(|&(n, h)| {
                n == near && !matches!(h, Hosts::Only(only) if !only.contains(&host))
            })
        {
            return invalid_name(&format!(". Did you mean '{near}'?"));
        }
        return invalid_name("");
    };
    if let Hosts::Only(only) = hosts
        && !only.contains(&host)
    {
        let only: Vec<String> = only.iter().map(|h| format!("`<{h}>`")).collect();
        return invalid_target(name, &only.join(", "), a);
    }
    if let Hosts::Not(not) = hosts
        && not.contains(&host)
    {
        let mut valid: Vec<&str> = (BINDINGS.iter())
            .filter(|&&(_, h)| h.take(host))
            .map(|&(n, _)| n)
            .collect();
        valid.sort_unstable();
        return invalid_name(&format!(
            ". Possible bindings for <{host}> are {}",
            valid.join(", ")
        ));
    }
    check_input(source_text, host, attributes, a, name)?;
    if name == "offsetWidth" && rsvelte_svelte_syntax::names::is_svg(host) {
        return invalid_target(
            name,
            "non-`<svg>` elements. Use `bind:clientWidth` for `<svg>` instead",
            a,
        );
    }
    Ok(())
}

/// Upstream's `bind_invalid_target` for `bind:checked` and `bind:files` on an `<input>` whose
/// `type` is text; a `type` not written as text is `attribute_invalid_type` instead.
fn check_input(
    source_text: &str,
    host: &str,
    attributes: &[Attribute],
    a: &Attribute,
    name: &str,
) -> Result<(), Diagnostic> {
    if host != "input" || !matches!(name, "checked" | "files") {
        return Ok(());
    }
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
        return invalid_target(name, &format!("`<input type=\"checkbox\">`{radio}"), a);
    }
    if name == "files" && ty != Some("file") {
        return invalid_target(name, "`<input type=\"file\">`", a);
    }
    Ok(())
}

fn invalid_target(name: &str, elements: &str, a: &Attribute) -> Result<(), Diagnostic> {
    invalid(
        "bind_invalid_target",
        &format!("`bind:{name}` can only be used with {elements}"),
        a.span,
    )
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
