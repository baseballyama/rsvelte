//! An element's own warnings: its attributes, its tag, and the deprecated special elements.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_parser::syntax::parse::is_void;
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, Range, TemplateNode,
};
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::syntax_tree::Kind;

use super::super::{a11y, warning};
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
                "Self-closing HTML tags for non-void elements are ambiguous — use `<{name} ...></{name}>` rather than `<{name} ... />`"
            );
            self.warn(
                span.start_offset,
                warning("element_invalid_self_closing_tag", &message, span),
            );
        }
        self.directives(attributes, matches!(tag, Tag::Regular | Tag::Dynamic));
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
        let owner = if name == "svelte:head" {
            Owner::Head
        } else if slotted
            || matches!(name, "svelte:fragment" | "svelte:boundary")
            || tag == Tag::Component
        {
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
                    "`<svelte:component>` is deprecated in runes mode — components are dynamic by default",
                    span,
                ));
            }
            if runes && name == "svelte:self" {
                let message = format!(
                    "`<svelte:self>` is deprecated — use self-imports (e.g. `import {} from './{}'`) instead",
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
                    "Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead",
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
            let found = super::error(
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
            "This element is implicitly closed by the following `{tag}`, which can cause an unexpected DOM structure. Add an explicit `</{name}>` to avoid surprises."
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

    /// `check_global_event_reference`: `{onclick}` with no `onclick` declared, which reads the
    /// global handler.
    pub(super) fn global_event_reference(&mut self, at: u32, attribute: &Attribute) {
        let component = self.context.component;
        let name = attribute.name.text(self.context.source);
        let global = expression(attribute, component).is_some_and(|e| {
            let javascript = &component.javascript;
            matches!(javascript.kind(e), Kind::Identifier(_))
                && javascript.name(e) == name
                && self.context.resolution.sem.binding_of(e).is_none()
        });
        if global {
            let message = format!(
                "You are referencing `globalThis.{name}`. Did you forget to declare a variable with that name?"
            );
            self.warn(
                at,
                warning("attribute_global_event_reference", &message, attribute.span),
            );
        }
    }

    /// `validate_element`'s warnings, attribute by attribute.
    fn validate_element(&mut self, at: u32, tag: Tag, name: &str, attributes: Range) {
        let component = self.context.component;
        let source = self.context.source;
        let custom = tag == Tag::Regular
            && (name.contains('-')
                || component
                    .attributes(attributes)
                    .iter()
                    .any(|a| a.kind == AttributeKind::Attribute && a.name.text(source) == "is"));
        for attribute in component.attributes(attributes) {
            if attribute.kind != AttributeKind::Attribute {
                continue;
            }
            let attribute_name = attribute.name.text(source);
            if self.context.runes && custom {
                self.quoted(at, attribute);
            }
            if attribute_name.len() > 2 && attribute_name.starts_with("on") {
                self.global_event_reference(at, attribute);
            }
            if attribute_name == "is" {
                self.warn(
                    at,
                    warning(
                        "attribute_avoid_is",
                        "The \"is\" attribute is not supported cross-browser and should be avoided",
                        attribute.span,
                    ),
                );
            }
            let right = match attribute_name {
                "className" => Some("class"),
                "htmlFor" => Some("for"),
                _ => None,
            };
            if let Some(right) = right {
                let message = format!(
                    "'{attribute_name}' is not a valid HTML attribute. Did you mean '{right}'?"
                );
                self.warn(
                    at,
                    warning("attribute_invalid_property_name", &message, attribute.span),
                );
            }
            self.colon(at, attribute);
        }
    }

    /// `visit_component`'s warnings of each attribute.
    fn validate_component(&mut self, at: u32, name: &str, attributes: Range) {
        let component = self.context.component;
        for attribute in component.attributes(attributes) {
            // The parser takes `<svelte:component this>` out of the attributes.
            let this =
                name == "svelte:component" && attribute.name.text(self.context.source) == "this";
            if attribute.kind != AttributeKind::Attribute || this {
                continue;
            }
            if self.context.runes {
                self.quoted(at, attribute);
            }
            self.colon(at, attribute);
        }
    }

    /// `attribute_quoted`: a value that is one quoted expression.
    fn quoted(&mut self, at: u32, attribute: &Attribute) {
        if attribute.quoted && expression(attribute, self.context.component).is_some() {
            self.warn(at, warning(
                "attribute_quoted",
                "Quoted attributes on components and custom elements will be stringified in a future version of Svelte. If this isn't what you want, remove the quotes",
                attribute.span,
            ));
        }
    }

    /// `attribute_illegal_colon`.
    fn colon(&mut self, at: u32, attribute: &Attribute) {
        let name = attribute.name.text(self.context.source);
        if name.contains(':')
            && !["xmlns:", "xlink:", "xml:"]
                .iter()
                .any(|p| name.starts_with(p))
        {
            self.warn(at, warning(
                "attribute_illegal_colon",
                "Attributes should not contain ':' characters to prevent ambiguity with Svelte directives",
                attribute.span,
            ));
        }
    }

    /// `component_name_lowercase`: an element named like an import nothing references.
    fn lowercase_component(&mut self, at: u32, name: &str, span: Span) {
        let javascript = &self.context.component.javascript;
        let sem = &self.context.resolution.sem;
        let Some(atom) = javascript.atoms.lookup(name) else {
            return;
        };
        let scope = sem
            .scope_of(self.context.component.program)
            .unwrap_or(rsvelte_typescript::scope::ScopeIdentifier::ROOT);
        let Some(binding) = sem.lookup(scope, atom) else {
            return;
        };
        let declared = &sem.bindings[binding];
        if declared.kind == DeclarationKind::Import
            && sem.references_to(binding).all(|r| r.node == declared.node)
        {
            let message = format!(
                "`<{name}>` will be treated as an HTML element unless it begins with a capital letter"
            );
            self.warn(at, warning("component_name_lowercase", &message, span));
        }
    }

    /// The directives' own visitors: `on:` on an element, and `bind:`.
    fn directives(&mut self, attributes: Range, element: bool) {
        let component = self.context.component;
        let source = self.context.source;
        for attribute in component.attributes(attributes) {
            let at = attribute.span.start_offset;
            match attribute.kind {
                AttributeKind::On if element && self.context.runes => {
                    let Some(name) = attribute.directive_name(&component.modifiers) else {
                        continue;
                    };
                    let name = name.text(source);
                    let message = format!(
                        "Using `on:{name}` to listen to the {name} event is deprecated. Use the event attribute `on{name}` instead"
                    );
                    self.warn(
                        at,
                        warning("event_directive_deprecated", &message, attribute.span),
                    );
                }
                AttributeKind::Bind => {
                    let Some(value) = expression(attribute, component) else {
                        continue;
                    };
                    let named = attribute
                        .directive_name(&component.modifiers)
                        .map(|n| n.text(source));
                    if named == Some("this")
                        && let Some(span) = component.javascript.source_location(value).span()
                    {
                        self.bind_this.push((span, self.blocks > 0));
                    }
                    self.each_rest_binding(at, value);
                }
                _ => {}
            }
        }
    }

    /// `bind_invalid_each_rest`: a binding to a name an `{#each}` rest element declares.
    fn each_rest_binding(&mut self, at: u32, value: NodeIdentifier) {
        let javascript = &self.context.component.javascript;
        let mut object = value;
        while let Kind::Member { object: inner, .. } = javascript.kind(object) {
            object = inner;
        }
        let sem = &self.context.resolution.sem;
        let Some(binding) = sem.binding_of(object) else {
            return;
        };
        let declared = sem.bindings[binding].node;
        if !self.each_rest.contains(&declared) {
            return;
        }
        let Some(span) = javascript.source_location(declared).span() else {
            return;
        };
        let name = javascript.name(declared);
        let message = format!(
            "The rest operator (...) will create a new object and binding '{name}' with the original object will not work"
        );
        self.warn(at, warning("bind_invalid_each_rest", &message, span));
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
                    "`this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte",
                    this.span,
                ),
            );
        }
    }
}

/// The expression of an attribute whose value is one expression.
fn expression(
    attribute: &Attribute,
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
) -> Option<NodeIdentifier> {
    match attribute.value {
        AttributeValue::Parts(parts) => match component.parts(parts) {
            [Part::Expression { expression, .. }] => Some(*expression),
            _ => None,
        },
        AttributeValue::True => None,
    }
}
