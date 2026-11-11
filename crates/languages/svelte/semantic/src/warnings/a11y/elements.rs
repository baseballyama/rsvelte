//! The checks of particular elements: links and buttons, inputs, images, labels, media and
//! figures, and the content they hold.

use std::borrow::Cow;

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, Component, Range, TemplateNode};

use super::values::{self, is_valid_autocomplete};
use super::{Element, Static, static_value, tables};

impl Element<'_, '_> {
    /// The element-specific checks; `true` when `<video>` ends the checks early.
    pub(super) fn element_specific(&mut self) -> bool {
        let a = &self.attributes;
        let name = self.name;
        let span = self.span;
        match name {
            "a" | "button" => {
                let hidden =
                    a.is_true("aria-hidden") || !matches!(a.value("inert"), Static::Unknown);
                if !a.spread
                    && !hidden
                    && !self.labelled()
                    && !has_content(self.component, self.source, self.children)
                {
                    self.warn(
                        "a11y_consider_explicit_label",
                        "Buttons and links should either contain text or have an `aria-label`, \
                            `aria-labelledby` or `title` attribute",
                        span,
                    );
                }
                if name == "a" {
                    self.link();
                }
            }
            "input" => {
                let image = a.text("type").as_deref() == Some("image");
                let required = ["alt", "aria-label", "aria-labelledby"];
                if image && !a.spread && !required.iter().any(|r| a.has(r)) {
                    self.missing("input type=\"image\"", &required);
                }
                let a = &self.attributes;
                if a.has("type")
                    && let Some(autocomplete) = a.get("autocomplete")
                {
                    let value = a.value("autocomplete");
                    if !is_valid_autocomplete(&value) {
                        let shown = match &value {
                            Static::Text(text) => text.to_string(),
                            Static::Bare => "true".to_owned(),
                            Static::Unknown => "null".to_owned(),
                        };
                        let kind = a.text("type").unwrap_or(Cow::Borrowed("..."));
                        let message = format!(
                            "'{shown}' is an invalid value for 'autocomplete' on `<input \
                                type=\"{kind}\">`"
                        );
                        self.warn("a11y_autocomplete_valid", &message, autocomplete.span);
                    }
                }
            }
            "img" => {
                if let Some(alt) = a.text("alt")
                    && !alt.is_empty()
                    && matches!(a.value("aria-hidden"), Static::Unknown)
                    && !a.spread
                    && values::redundant_alt(&alt)
                {
                    self.warn(
                        "a11y_img_redundant_alt",
                        "Screenreaders already announce `<img>` elements as an image",
                        span,
                    );
                }
            }
            "label"
                if !a.spread
                    && !a.has("for")
                    && !has_input_child(self.component, self.source, self.children) =>
            {
                self.warn(
                    "a11y_label_has_associated_control",
                    "A form label must be associated with a control",
                    span,
                );
            }
            "video" => return self.video(),
            "figcaption" if !self.parent.is(&["figure"]) => self.warn(
                "a11y_figcaption_parent",
                "`<figcaption>` must be an immediate child of `<figure>`",
                span,
            ),
            "figure" => self.figure(),
            _ => {}
        }
        false
    }

    /// `<a>`: an `href` that goes nowhere, or no `href` at all.
    fn link(&mut self) {
        let a = &self.attributes;
        if let Some(href) = a.get("href").or_else(|| a.get("xlink:href")) {
            if let Static::Text(value) = static_value(self.component, self.source, href)
                && (value.is_empty() || value == "#" || values::javascript_url(&value))
            {
                let message = format!(
                    "'{value}' is not a valid {} attribute",
                    href.name.text(self.source)
                );
                self.warn("a11y_invalid_attribute", &message, href.span);
            }
        } else if !a.spread && !a.truthy("id") && !a.truthy("name") && !a.is_true("aria-disabled") {
            self.missing(self.name, &["href"]);
        }
    }

    /// `<video>`: a caption track; `true`, ending the checks, unless the video can need one.
    fn video(&mut self) -> bool {
        let a = &self.attributes;
        if a.has("muted") || a.is_true("aria-hidden") || a.spread || !a.has("src") {
            return true;
        }
        let component = self.component;
        let source = self.source;
        let track =
            component
                .children(self.children)
                .iter()
                .find_map(|&c| match *component.node(c) {
                    TemplateNode::Element {
                        name, attributes, ..
                    } if name.text(source) == "track" => Some(attributes),
                    _ => None,
                });
        let captioned = track.is_some_and(|attributes| {
            component.attributes(attributes).iter().any(|a| {
                a.kind == AttributeKind::Spread
                    || (a.kind == AttributeKind::Attribute
                        && a.name.text(source) == "kind"
                        && matches!(static_value(component, source, a), Static::Text(t) if t == "c\
                            aptions"))
            })
        });
        if !captioned {
            self.warn(
                "a11y_media_has_caption",
                "`<video>` elements must have a `<track kind=\"captions\">`",
                self.span,
            );
        }
        false
    }

    /// `<figure>`: a `<figcaption>` that is neither its first nor its last child.
    fn figure(&mut self) {
        let component = self.component;
        let source = self.source;
        let children: Vec<u32> = component
            .children(self.children)
            .iter()
            .copied()
            .filter(|&c| match *component.node(c) {
                TemplateNode::Comment { .. } => false,
                TemplateNode::Text { span } => span
                    .text(source)
                    .contains(|c: char| !matches!(c, ' ' | '\t' | '\r' | '\n')),
                _ => true,
            })
            .collect();
        let caption = children.iter().position(|&c| {
            matches!(*component.node(c), TemplateNode::Element { name, .. }
                if name.text(source) == "figcaption")
        });
        if let Some(index) = caption
            && index != 0
            && index != children.len() - 1
        {
            self.warn(
                "a11y_figcaption_index",
                "`<figcaption>` must be first or last child of `<figure>`",
                component.node(children[index]).span(),
            );
        }
    }

    /// `warn_missing_attribute`.
    pub(super) fn missing(&mut self, name: &str, attributes: &[&str]) {
        let first = attributes[0];
        let article = if first.starts_with(['a', 'e', 'i', 'o', 'u']) || first == "href" {
            "an"
        } else {
            "a"
        };
        let sequence = match attributes {
            [only] => (*only).to_owned(),
            [init @ .., last] => format!("{} or {last}", init.join(", ")),
            [] => unreachable!("an element requires at least one attribute"),
        };
        let message = format!("`<{name}>` element should have {article} {sequence} attribute");
        self.warn("a11y_missing_attribute", &message, self.span);
    }
}

/// `has_content`: whether an element holds anything a screen reader can announce.
pub(super) fn has_content(component: &Component, source: &str, children: Range) -> bool {
    component
        .children(children)
        .iter()
        .any(|&child| match *component.node(child) {
            TemplateNode::Text { span } => !span
                .text(source)
                .trim_matches(is_ecmascript_whitespace)
                .is_empty(),
            TemplateNode::Element {
                name,
                attributes,
                children,
                ..
            } if is_element_like(name.text(source)) => {
                let named = |wanted: &str| {
                    component.attributes(attributes).iter().any(|a| {
                        a.kind == AttributeKind::Attribute && a.name.text(source) == wanted
                    })
                };
                let name = name.text(source);
                !named("popover")
                    && ((name == "img" && named("alt"))
                        || name == "selectedcontent"
                        || has_content(component, source, children))
            }
            // Anything else may render content.
            _ => true,
        })
}

/// A `RegularElement` or `SvelteElement` as far as `has_content` looks.
fn is_element_like(name: &str) -> bool {
    name == "svelte:element"
        || !(name == "slot" || name.starts_with("svelte:") || is_component_name(name))
}

/// Whether a label holds something that can be its control.
fn has_input_child(component: &Component, source: &str, children: Range) -> bool {
    component
        .children(children)
        .iter()
        .any(|&child| match *component.node(child) {
            TemplateNode::Render { .. } => true,
            TemplateNode::Element { name, children, .. } => {
                let name = name.text(source);
                let control = name == "svelte:element"
                    || name == "slot"
                    || (is_component_name(name) && !name.starts_with("svelte:"))
                    || tables::LABELABLE.contains(&name);
                control || has_input_child(component, source, children)
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                has_input_child(component, source, consequent)
                    || alternate.is_some_and(|a| has_input_child(component, source, a))
            }
            TemplateNode::Each { body, fallback, .. } => {
                has_input_child(component, source, body)
                    || has_input_child(component, source, fallback)
            }
            TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                has_input_child(component, source, body)
            }
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => [pending, then, catch].into_iter().any(|branch| {
                branch
                    .present()
                    .is_some_and(|b| has_input_child(component, source, b))
            }),
            _ => false,
        })
}
