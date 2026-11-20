//! The bindings `<svelte:window>`, `<svelte:document>` and `<svelte:body>` accept, which validation
//! and client lowering both read.

use rsvelte_svelte_semantic::compiler_syntax_tree::MetadataTag;

#[derive(Clone, Copy)]
pub(super) enum GlobalBinding {
    This,
    Size,
    Scroll(&'static str),
    Online,
    ActiveElement,
    Focused,
    Property(&'static str),
    /// A binding `<svelte:body>` shares with an element.
    Element,
}

pub(super) fn global_binding(tag: MetadataTag, property: &str) -> Option<GlobalBinding> {
    match (tag, property) {
        (_, "this") => Some(GlobalBinding::This),
        (MetadataTag::Window, "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight") => {
            Some(GlobalBinding::Size)
        }
        (MetadataTag::Window, "scrollX") => Some(GlobalBinding::Scroll("x")),
        (MetadataTag::Window, "scrollY") => Some(GlobalBinding::Scroll("y")),
        (MetadataTag::Window, "online") => Some(GlobalBinding::Online),
        (MetadataTag::Window, "devicePixelRatio") => Some(GlobalBinding::Property("resize")),
        (MetadataTag::Document, "activeElement") => Some(GlobalBinding::ActiveElement),
        (MetadataTag::Window | MetadataTag::Document, "focused") => Some(GlobalBinding::Focused),
        (
            MetadataTag::Body,
            "focused"
            | "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "contentRect"
            | "contentBoxSize"
            | "borderBoxSize"
            | "devicePixelContentBoxSize",
        ) => Some(GlobalBinding::Element),
        (MetadataTag::Document, "fullscreenElement") => {
            Some(GlobalBinding::Property("fullscreenchange"))
        }
        (MetadataTag::Document, "pointerLockElement") => {
            Some(GlobalBinding::Property("pointerlockchange"))
        }
        (MetadataTag::Document, "visibilityState") => {
            Some(GlobalBinding::Property("visibilitychange"))
        }
        _ => None,
    }
}
