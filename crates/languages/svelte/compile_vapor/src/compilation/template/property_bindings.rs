use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, Helper, Steps, Template, vue};

impl<'t> Template<'_, '_, 't> {
    pub(super) fn bind_property(
        &mut self,
        attribute: &Attribute,
        target: ExpressionIdentifier,
        event: &str,
        readonly: bool,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) {
        let b = self.b;
        let name = attribute.name.text(self.i.source_text);
        let current = self.binding_read(target);
        if self.i.server {
            if name == "open" {
                self.helpers.insert(Helper::BooleanServer);
                let value = self.call("$$bool", [current]);
                props.push(self.bound(name, attribute.name.span(), value, attribute.span));
            } else if matches!(name, "innerHTML" | "innerText" | "textContent") {
                let content = if name == "innerHTML" {
                    "$$html_content"
                } else {
                    "$$text_content"
                };
                props.push(self.bound(content, attribute.name.span(), current, attribute.span));
            }
            return;
        }
        let (helper, function) = if resize(name) {
            (Helper::ResizeBinding, "$$resize_binding")
        } else if media(name).is_some() {
            (Helper::MediaBinding, "$$media_binding")
        } else {
            (Helper::PropertyBinding, "$$property_binding")
        };
        self.helpers.insert(helper);
        let setter = self.setter(target);
        let call = self.call(
            function,
            [
                b.id("$$el"),
                b.string(name),
                b.string(event),
                self.getter(current),
                setter,
                b.boolean(readonly),
            ],
        );
        steps.mounted.push(call);
    }
}

pub(super) fn event(
    source_text: &str,
    property: &str,
    tag: &str,
    attributes: &[Attribute],
) -> Option<(&'static str, bool)> {
    if resize(property) && !tag.starts_with("svelte:") {
        return Some(("", true));
    }
    if matches!(tag, "audio" | "video")
        && let Some(binding) = media(property)
    {
        return Some(binding);
    }
    match (property, tag, super::static_type(source_text, attributes)) {
        ("indeterminate", "input", Some("checkbox")) | ("files", "input", Some("file")) => {
            Some(("change", false))
        }
        ("open", "details", _) => Some(("toggle", false)),
        ("naturalWidth" | "naturalHeight", "img", _) => Some(("load", true)),
        ("videoWidth" | "videoHeight", "video", _) => Some(("resize", true)),
        ("focused", ..) => Some(("focus blur", true)),
        ("innerHTML" | "innerText" | "textContent", ..)
            if attributes
                .iter()
                .any(|attribute| attribute.name.text(source_text) == "contenteditable") =>
        {
            Some(("input", false))
        }
        _ => None,
    }
}

pub(super) fn media(property: &str) -> Option<(&'static str, bool)> {
    Some(match property {
        "currentTime" => ("timeupdate", false),
        "duration" => ("durationchange", true),
        "paused" => ("play pause canplay", false),
        "buffered" => ("loadedmetadata progress timeupdate seeking", true),
        "seekable" => ("loadedmetadata", true),
        "played" => ("timeupdate", true),
        "volume" | "muted" => ("volumechange", false),
        "playbackRate" => ("ratechange", false),
        "seeking" => ("seeking seeked", true),
        "ended" => ("timeupdate ended", true),
        "readyState" => (
            "loadedmetadata loadeddata canplay canplaythrough playing waiting emptied",
            true,
        ),
        _ => return None,
    })
}

pub(super) fn resize(property: &str) -> bool {
    matches!(
        property,
        "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "contentRect"
            | "contentBoxSize"
            | "borderBoxSize"
            | "devicePixelContentBoxSize"
    )
}
