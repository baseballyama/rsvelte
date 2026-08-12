//! The `on:event|modifier` data, shared by completion and hover.

pub struct Modifier {
    pub name: &'static str,
    pub summary: &'static str,
    /// Modifiers this one cannot be combined with. The strings are matched
    /// against the whole attribute name, exactly as the official plugin does.
    pub invalid_with: &'static [&'static str],
}

impl Modifier {
    /// The markdown the client renders, for both the completion item and hover.
    #[must_use]
    pub fn documentation(&self) -> String {
        format!(
            "`{}` event modifier\n\n{}\n\nhttps://v4.svelte.dev/docs/element-directives#on-eventname",
            self.name, self.summary
        )
    }
}

pub const MODIFIERS: [Modifier; 8] = [
    Modifier {
        name: "preventDefault",
        summary: "calls `event.preventDefault()` before running the handler",
        invalid_with: &["passive"],
    },
    Modifier {
        name: "stopPropagation",
        summary: "calls `event.stopPropagation()`, preventing the event reaching the next element",
        invalid_with: &[],
    },
    Modifier {
        name: "passive",
        summary: "improves scrolling performance on touch/wheel events \
                  (Svelte will add it automatically where it's safe to do so)",
        invalid_with: &["nopassive", "preventDefault"],
    },
    Modifier {
        name: "nonpassive",
        summary: "explicitly set `passive: false`",
        invalid_with: &["passive"],
    },
    Modifier {
        name: "capture",
        summary: "fires the handler during the capture phase instead of the bubbling phase",
        invalid_with: &[],
    },
    Modifier {
        name: "once",
        summary: "remove the handler after the first time it runs",
        invalid_with: &[],
    },
    Modifier {
        name: "self",
        summary: "only trigger handler if `event.target` is the element itself",
        invalid_with: &[],
    },
    Modifier {
        name: "trusted",
        summary: "only trigger handler if event.isTrusted is true. \
                  I.e. if the event is triggered by a user action",
        invalid_with: &[],
    },
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn documentation_names_the_modifier_and_links_the_docs() {
        let passive = MODIFIERS.iter().find(|m| m.name == "passive").unwrap();
        assert_eq!(
            passive.documentation(),
            "`passive` event modifier\n\n\
             improves scrolling performance on touch/wheel events \
             (Svelte will add it automatically where it's safe to do so)\n\n\
             https://v4.svelte.dev/docs/element-directives#on-eventname"
        );
    }
}
