//! An element's own warnings: its attributes, its tag, and the deprecated special elements.

use oxc_semantic::SymbolFlags;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};
use rsvelte_svelte_syntax::parse::is_void;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Part, Range, TemplateNode,
};

use super::super::{a11y, error, warning};
use super::placement::Ancestor;
use super::{Owner, Stage, Template, is_component};

/// How the compiler classifies an element tag.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Tag {
    Regular,
    /// `<svelte:element>`.
    Dynamic,
    /// A component, `<svelte:component>` or `<svelte:self>`.
    Component,
    /// `<slot>`, outside a shadow root.
    Slot,
    Other,
}

impl<'a> Template<'a> {
    /// An attribute's text, which upstream visits as a `Text` node; a dynamic tag's `this` it
    /// takes out of the attributes.
    fn attribute_texts(&mut self, attributes: Range, dynamic: bool) {
        let component = self.context.component;
        for attribute in component.attributes(attributes) {
            let this = dynamic && attribute.name.text(self.context.source) == "this";
            if let AttributeValue::Parts(parts) = attribute.value
                && !this
            {
                for &part in component.parts(parts) {
                    if let Part::Text(text) = part {
                        self.text(text, &[], true);
                    }
                }
            }
        }
    }

    /// The element `node`, followed in its fragment by `next`.
    pub(super) fn element(&mut self, node: u32, next: Option<u32>, parent: a11y::Parent<'a>) {
        let component = self.context.component;
        let source = self.context.source;
        let TemplateNode::Element {
            name,
            attributes,
            children,
            self_closing,
            end_tag,
            span,
            ..
        } = *component.node(node)
        else {
            return;
        };
        let name = name.text(source);
        let tag = if name == "svelte:element" {
            Tag::Dynamic
        } else if is_component(name) || matches!(name, "svelte:component" | "svelte:self") {
            Tag::Component
        } else if name == "slot" && !self.shadow_root {
            Tag::Slot
        } else if name.starts_with("svelte:") || (name == "title" && self.owner == Owner::Head) {
            Tag::Other
        } else {
            Tag::Regular
        };
        self.checks(tag, name, span, attributes, children, parent);
        let local = name.rsplit(':').next().unwrap_or(name);
        if tag == Tag::Regular
            && self_closing
            && !is_void(local)
            && !is_svg(local)
            && !is_mathml(local)
        {
            let message = format!(
                "Self-closing HTML tags for non-void elements are ambiguous — use `<{name} \
                    ...></{name}>` rather than `<{name} ... />`"
            );
            self.warn(
                span.start_offset,
                warning("element_invalid_self_closing_tag", &message, span),
            );
        }
        self.directives(attributes, matches!(tag, Tag::Regular | Tag::Dynamic));
        if matches!(tag, Tag::Regular | Tag::Dynamic | Tag::Component) {
            self.attribute_errors(span, attributes, tag != Tag::Component);
        }
        self.attribute_texts(attributes, tag == Tag::Dynamic);
        let inner = match tag {
            Tag::Dynamic => a11y::Parent::Dynamic,
            Tag::Regular => a11y::Parent::Regular(name),
            _ => parent,
        };
        let shadow_root = self.shadow_root;
        let has = |wanted: &str| {
            component
                .attributes(attributes)
                .iter()
                .any(|a| a.kind == AttributeKind::Attribute && a.name.text(source) == wanted)
        };
        self.shadow_root |= tag == Tag::Regular && has("shadowrootmode");
        let slotted = matches!(tag, Tag::Regular | Tag::Dynamic) && has("slot");
        // Upstream's `ConstTag` takes a component or `<svelte:component>`, not `<svelte:self>`.
        let owns_consts = tag == Tag::Component && name != "svelte:self";
        let owner = if name == "svelte:head" {
            Owner::Head
        } else if slotted || matches!(name, "svelte:fragment" | "svelte:boundary") || owns_consts {
            Owner::Declarations
        } else {
            Owner::Other
        };
        let closer = self.closer;
        if end_tag {
            self.closer = Some(name);
        }
        // What the elements inside see as their ancestry and `parent_element`.
        let (ancestor, parent_element) = match tag {
            Tag::Regular => (Some(Ancestor::Element(name)), Some(name)),
            Tag::Dynamic | Tag::Component => (Some(Ancestor::Boundary), None),
            _ if name == "svelte:fragment" => (None, None),
            _ => (None, self.parent_element),
        };
        if let Some(ancestor) = ancestor {
            self.within(ancestor, parent_element, |walk| {
                walk.fragment_of(owner, children, inner);
            });
        } else {
            let outer = std::mem::replace(&mut self.parent_element, parent_element);
            self.fragment_of(owner, children, inner);
            self.parent_element = outer;
        }
        self.closer = closer;
        self.shadow_root = shadow_root;
        // After the children, so that of the elements one end tag closes, the inner comes first.
        if tag == Tag::Regular && !end_tag && !self_closing && !is_void(name) {
            self.implicitly_closed(name, span, children, next);
        }
    }

    /// The checks of one kind of element, before its directives and children.
    fn checks(
        &mut self,
        tag: Tag,
        name: &'a str,
        span: Span,
        attributes: Range,
        children: Range,
        parent: a11y::Parent<'a>,
    ) {
        let component = self.context.component;
        let source = self.context.source;
        let runes = self.context.runes;
        let at = span.start_offset;
        if tag == Tag::Dynamic {
            self.dynamic_this(attributes);
        }
        if matches!(tag, Tag::Regular | Tag::Dynamic) {
            self.validate_element(at, tag, name, attributes);
            let mut found = Vec::new();
            a11y::check_element(
                component,
                source,
                name,
                span,
                attributes,
                children,
                tag == Tag::Dynamic,
                parent,
                &mut found,
            );
            for warning in found {
                self.warn(at, warning);
            }
        }
        if tag == Tag::Regular {
            self.lowercase_component(at, name, span);
            self.placement(name, span);
        }
        if tag == Tag::Component {
            if runes && name == "svelte:component" {
                self.warn(at, warning(
                    "svelte_component_deprecated",
                    "`<svelte:component>` is deprecated in runes mode — components are dynamic by \
                        default",
                    span,
                ));
            }
            if runes && name == "svelte:self" {
                let message = format!(
                    "`<svelte:self>` is deprecated — use self-imports (e.g. `import {} from \
                        './{}'`) instead",
                    self.context.name, self.context.basename
                );
                self.warn(at, warning("svelte_self_deprecated", &message, span));
            }
            self.validate_component(at, name, attributes);
        }
        if tag == Tag::Slot {
            if runes && !self.context.custom_element {
                self.warn(at, warning(
                    "slot_element_deprecated",
                    "Using `<slot>` to render parent content is deprecated. Use `{@render ...}` \
                        tags instead",
                    span,
                ));
            }
            self.slot(span, attributes);
        }
        if matches!(name, "svelte:window" | "svelte:document" | "svelte:body") {
            self.special(name, span, attributes, children);
        }
        if name == "title"
            && self.owner == Owner::Head
            && let Some(first) = component.attributes(attributes).first()
        {
            let found = error(
                "title_illegal_attribute",
                "`<title>` cannot have attributes nor directives",
                first.span,
            );
            self.error(span, found);
        }
    }

    /// `element_implicitly_closed`, which the parser emits where it closes the element: at the
    /// next sibling's start tag, or else at the enclosing element's end tag.
    fn implicitly_closed(&mut self, name: &str, span: Span, children: Range, next: Option<u32>) {
        let component = self.context.component;
        let source = self.context.source;
        let (tag, closed_at) = match next.map(|n| component.node(n)) {
            Some(&TemplateNode::Element {
                name: next,
                span: next_span,
                ..
            }) => (format!("<{}>", next.text(source)), next_span.start_offset),
            _ => match self.closer {
                Some(closer) => (format!("</{closer}>"), span.end_offset),
                None => return,
            },
        };
        let end = component
            .children(children)
            .first()
            .map_or(closed_at, |&c| component.node(c).span().start_offset);
        let message = format!(
            "This element is implicitly closed by the following `{tag}`, which can cause an \
                unexpected DOM structure. Add an explicit `</{name}>` to avoid surprises."
        );
        self.found.push(
            Stage::Parse,
            closed_at,
            warning(
                "element_implicitly_closed",
                &message,
                Span::new(span.start_offset, end),
            ),
        );
    }

    /// `component_name_lowercase`: an element named like an import nothing references.
    fn lowercase_component(&mut self, at: u32, name: &str, span: Span) {
        let resolution = self.context.resolution;
        let scoping = resolution.scoping();
        let Some(symbol) = scoping.find_binding(resolution.instance_scope(), name.into()) else {
            return;
        };
        if scoping.symbol_flags(symbol).contains(SymbolFlags::Import)
            && scoping.get_resolved_reference_ids(symbol).is_empty()
        {
            let message = format!(
                "`<{name}>` will be treated as an HTML element unless it begins with a capital \
                    letter"
            );
            self.warn(at, warning("component_name_lowercase", &message, span));
        }
    }

    /// `<svelte:element this="div">`: a string where an expression belongs, which the parser
    /// warns about.
    fn dynamic_this(&mut self, attributes: Range) {
        let component = self.context.component;
        let this = component.attributes(attributes).iter().find(|a| {
            a.kind == AttributeKind::Attribute && a.name.text(self.context.source) == "this"
        });
        if let Some(this) = this
            && !matches!(this.value, AttributeValue::True)
            && !a11y::is_expression(component, this)
        {
            self.found.push(
                Stage::Parse,
                this.span.start_offset,
                warning(
                    "svelte_element_invalid_this",
                    "`this` should be an `{expression}`. Using a string attribute value will cause \
                        an error in future versions of Svelte",
                    this.span,
                ),
            );
        }
    }
}

mod attributes;
