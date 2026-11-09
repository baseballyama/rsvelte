//! The template's warnings and errors, in one walk.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, TemplateNode, decode_attribute,
};

use super::a11y;
use super::{Phase, Raised, Section, error, slot_name_error, warning};

pub(super) struct Template<'a> {
    pub(super) component: &'a Component,
    pub(super) source: &'a str,
    pub(super) out: &'a mut Vec<Diagnostic>,
    pub(super) errors: &'a mut Vec<(Raised, Diagnostic)>,
    /// Inside an element with `shadowrootmode`, where `<slot>` is an ordinary element.
    pub(super) shadow_root: bool,
    /// What owns the fragment being walked.
    pub(super) owner: Owner,
}

/// The node a fragment belongs to, as far as `{@const}` and `<title>` care.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Owner {
    /// A block, a component, `<svelte:fragment>`, `<svelte:boundary>` or an element with `slot`,
    /// where `{@const}` may stand.
    Declarations,
    /// `<svelte:head>`, where `<title>` is the title element.
    Head,
    Other,
}

impl<'a> Template<'a> {
    /// An error the template walk raises at the node starting at `node`.
    pub(super) fn error(&mut self, node: Span, error: Diagnostic) {
        let raised = Raised {
            phase: Phase::Walk,
            section: Section::Template,
            at: node.start_offset,
        };
        self.errors.push((raised, error));
    }

    pub(super) fn fragment(&mut self, range: Range, parent: a11y::Parent<'a>) {
        for &child in self.component.children(range) {
            self.node(child, parent);
        }
    }

    pub(super) fn fragment_of(&mut self, owner: Owner, range: Range, parent: a11y::Parent<'a>) {
        let outer = std::mem::replace(&mut self.owner, owner);
        self.fragment(range, parent);
        self.owner = outer;
    }

    /// `validate_block_not_empty`: a branch that is one whitespace text.
    pub(super) fn branch(&mut self, range: Range, parent: a11y::Parent<'a>) {
        if let [only] = self.component.children(range)
            && let TemplateNode::Text { span } = *self.component.node(*only)
            && span
                .text(self.source)
                .trim_matches(is_ecmascript_whitespace)
                .is_empty()
        {
            self.out.push(warning("block_empty", "Empty block", span));
        }
        self.fragment_of(Owner::Declarations, range, parent);
    }

    /// `<svelte:window>`, `<svelte:document>` and `<svelte:body>`: no children, and no
    /// attributes but event handlers.
    pub(super) fn special(
        &mut self,
        name: &str,
        element: Span,
        attributes: Range,
        children: Range,
    ) {
        let component = self.component;
        if let (Some(&first), Some(&last)) = (
            component.children(children).first(),
            component.children(children).last(),
        ) {
            let content = Span::new(
                component.node(first).span().start_offset,
                component.node(last).span().end_offset,
            );
            let message = format!("<{name}> cannot have children");
            self.error(
                element,
                error("svelte_meta_invalid_content", &message, content),
            );
        }
        for attribute in component.attributes(attributes) {
            let event = attribute.kind == AttributeKind::Attribute
                && attribute.name.text(self.source).starts_with("on")
                && a11y::is_expression(component, attribute);
            if event
                || !matches!(
                    attribute.kind,
                    AttributeKind::Attribute | AttributeKind::Spread
                )
            {
                continue;
            }
            let found = if name == "svelte:body" {
                error(
                    "svelte_body_illegal_attribute",
                    "`<svelte:body>` does not support non-event attributes or spread attributes",
                    attribute.span,
                )
            } else {
                error(
                    "illegal_element_attribute",
                    &format!(
                        "`<{name}>` does not support non-event attributes or spread attributes"
                    ),
                    attribute.span,
                )
            };
            self.error(element, found);
        }
    }

    /// `<slot name>`: a static name other than `default`.
    pub(super) fn slot(&mut self, element: Span, attributes: Range) {
        let component = self.component;
        for attribute in component.attributes(attributes) {
            if attribute.kind != AttributeKind::Attribute
                || attribute.name.text(self.source) != "name"
            {
                continue;
            }
            let text = match attribute.value {
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [Part::Text(span)] => Some(decode_attribute(span.text(self.source))),
                    _ => None,
                },
                AttributeValue::True => None,
            };
            if let Some((code, message)) = slot_name_error(text.as_deref()) {
                self.error(element, error(code, message, attribute.span));
            }
        }
    }

    /// `<svelte:element this="div">`: a string where an expression belongs.
    pub(super) fn dynamic_this(&mut self, attributes: Range) {
        let component = self.component;
        let this = component
            .attributes(attributes)
            .iter()
            .find(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "this");
        if let Some(this) = this
            && !matches!(this.value, AttributeValue::True)
            && !a11y::is_expression(component, this)
        {
            self.out.push(warning(
                "svelte_element_invalid_this",
                "`this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte",
                this.span,
            ));
        }
    }

    pub(super) fn element(
        &mut self,
        name: &'a str,
        span: Span,
        attributes: Range,
        children: Range,
        parent: a11y::Parent<'a>,
    ) {
        let component = self.component;
        let dynamic = name == "svelte:element";
        let slot = name == "slot" && !self.shadow_root;
        let regular = !dynamic && !name.starts_with("svelte:") && !slot && !is_component_name(name);
        if regular || dynamic {
            a11y::check_element(
                component,
                self.source,
                name,
                span,
                attributes,
                children,
                dynamic,
                parent,
                self.out,
            );
        }
        if slot {
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
        if dynamic {
            self.dynamic_this(attributes);
        }
        let inner = if dynamic {
            a11y::Parent::Dynamic
        } else if regular {
            a11y::Parent::Regular(name)
        } else {
            parent
        };
        let shadow_root = self.shadow_root;
        self.shadow_root |= regular
            && component.attributes(attributes).iter().any(|a| {
                a.kind == AttributeKind::Attribute && a.name.text(self.source) == "shadowrootmode"
            });
        let slotted = (regular || dynamic)
            && component
                .attributes(attributes)
                .iter()
                .any(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "slot");
        let owner = if name == "svelte:head" {
            Owner::Head
        } else if slotted
            || matches!(
                name,
                "svelte:component" | "svelte:fragment" | "svelte:boundary"
            )
            || (is_component_name(name) && !name.starts_with("svelte:"))
        {
            Owner::Declarations
        } else {
            Owner::Other
        };
        self.fragment_of(owner, children, inner);
        self.shadow_root = shadow_root;
    }

    pub(super) fn node(&mut self, child: u32, parent: a11y::Parent<'a>) {
        let component = self.component;
        match *component.node(child) {
            TemplateNode::Element {
                name,
                attributes,
                children,
                span,
                ..
            } => self.element(name.text(self.source), span, attributes, children, parent),
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                self.branch(consequent, parent);
                if let Some(alternate) = alternate {
                    self.branch(alternate, parent);
                }
            }
            TemplateNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                self.branch(body, parent);
                if has_fallback {
                    self.branch(fallback, parent);
                }
            }
            TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                self.branch(body, parent);
            }
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => {
                for branch in [pending, then, catch] {
                    if let Some(branch) = branch.present() {
                        self.branch(branch, parent);
                    }
                }
            }
            TemplateNode::Const { span, .. } if self.owner != Owner::Declarations => {
                let found = error(
                    "const_tag_invalid_placement",
                    "`{@const}` must be the immediate child of `{#snippet}`, `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>`, `<svelte:boundary>` or `<Component>`",
                    span,
                );
                self.error(span, found);
            }
            _ => {}
        }
    }
}
