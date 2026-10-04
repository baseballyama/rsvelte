use super::{Attribute, Builder, Helper, NodeIdentifier, SourceLocation, Steps, bound, vue};

impl Builder<'_, '_> {
    pub(super) fn bind_property(
        &mut self,
        attribute: &Attribute,
        target: NodeIdentifier,
        event: &str,
        readonly: bool,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) {
        let name = attribute.name.text(self.i.source_text);
        let current = self.binding_read(target);
        if self.i.server {
            if name == "open" {
                self.helpers.insert(Helper::BooleanServer);
                let value = self.call("$$bool", &[current]);
                props.push(bound(name, attribute.name.span(), value, attribute.span));
            }
            if matches!(name, "innerHTML" | "innerText" | "textContent") {
                let content = if name == "innerHTML" {
                    "$$html_content"
                } else {
                    "$$text_content"
                };
                props.push(bound(
                    content,
                    attribute.name.span(),
                    current,
                    attribute.span,
                ));
            }
            return;
        }
        let media = media(name).is_some();
        let resize = resize(name);
        self.helpers.insert(if resize {
            Helper::ResizeBinding
        } else if media {
            Helper::MediaBinding
        } else {
            Helper::PropertyBinding
        });
        let element = self.to.identifier("$$el");
        let name = self.to.write_string(name);
        let event = self.to.write_string(event);
        let getter = self
            .to
            .arrow(&[], current, true, false, SourceLocation::SYNTHETIC);
        let value = self.to.identifier("$$value");
        let assignment = self.binding_write(target, value);
        let setter = self
            .to
            .arrow(&[value], assignment, true, false, SourceLocation::SYNTHETIC);
        let readonly = self.to.write_boolean(readonly, SourceLocation::SYNTHETIC);
        steps.mounted.push(self.call(
            if resize {
                "$$resize_binding"
            } else if media {
                "$$media_binding"
            } else {
                "$$property_binding"
            },
            &[element, name, event, getter, setter, readonly],
        ));
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
