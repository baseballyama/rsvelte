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

impl GlobalBinding {
    pub(super) fn of(tag: MetadataTag, property: &str) -> Option<Self> {
        match (tag, property) {
            (_, "this") => Some(Self::This),
            (MetadataTag::Window, "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight") => {
                Some(Self::Size)
            }
            (MetadataTag::Window, "scrollX") => Some(Self::Scroll("x")),
            (MetadataTag::Window, "scrollY") => Some(Self::Scroll("y")),
            (MetadataTag::Window, "online") => Some(Self::Online),
            (MetadataTag::Window, "devicePixelRatio") => Some(Self::Property("resize")),
            (MetadataTag::Document, "activeElement") => Some(Self::ActiveElement),
            (MetadataTag::Window | MetadataTag::Document, "focused") => Some(Self::Focused),
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
            ) => Some(Self::Element),
            (MetadataTag::Document, "fullscreenElement") => {
                Some(Self::Property("fullscreenchange"))
            }
            (MetadataTag::Document, "pointerLockElement") => {
                Some(Self::Property("pointerlockchange"))
            }
            (MetadataTag::Document, "visibilityState") => Some(Self::Property("visibilitychange")),
            _ => None,
        }
    }
}
