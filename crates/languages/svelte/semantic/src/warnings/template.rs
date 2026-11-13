//! The template's warnings and errors, in one walk in the compiler's order.

use oxc_ast::ast::BindingPattern;
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, TemplateNode, decode_attribute,
    decode_text,
};
use rustc_hash::FxHashSet;

use super::found::{Found, Stage};
use super::{Phase, Raised, Section, a11y, error, slot_name_error, warning};
use crate::resolve::Resolution;

mod element;
mod placement;

/// What the walk of the template reads besides the tree.
pub(super) struct Context<'a> {
    pub(super) component: &'a Component,
    pub(super) source: &'a str,
    pub(super) resolution: &'a Resolution,
    pub(super) runes: bool,
    /// Upstream `analysis.custom_element`: `<svelte:options customElement>` or the option.
    pub(super) custom_element: bool,
    /// The component's name and file name, which `<svelte:self>`'s warning suggests.
    pub(super) name: &'a str,
    pub(super) basename: &'a str,
}

pub(super) struct Template<'a> {
    pub(super) context: Context<'a>,
    pub(super) found: &'a mut Found,
    pub(super) errors: &'a mut Vec<(Raised, Diagnostic)>,
    /// Inside an element with `shadowrootmode`, where `<slot>` is an ordinary element.
    shadow_root: bool,
    /// What owns the fragment being walked.
    owner: Owner,
    /// How many `{#if}`, `{#each}`, `{#await}` and `{#key}` blocks enclose the walk.
    blocks: u32,
    /// Each `bind:this` expression, and whether a block encloses it.
    pub(super) bind_this: Vec<(Span, bool)>,
    /// The identifiers an `{#each}` context declares inside a rest element.
    each_rest: FxHashSet<SymbolId>,
    /// The nearest enclosing element with its own end tag, which closes the open ones inside.
    closer: Option<&'a str>,
    /// Upstream `parent_element`: the enclosing regular element, until a component or snippet.
    parent_element: Option<&'a str>,
    /// The elements, blocks and boundaries around the walk, outermost first.
    ancestry: Vec<placement::Ancestor<'a>>,
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

const STAGE: Stage = Stage::Walk(Section::Template);

impl<'a> Template<'a> {
    pub(super) fn new(
        context: Context<'a>,
        found: &'a mut Found,
        errors: &'a mut Vec<(Raised, Diagnostic)>,
    ) -> Self {
        Self {
            context,
            found,
            errors,
            shadow_root: false,
            owner: Owner::Other,
            blocks: 0,
            bind_this: Vec::new(),
            each_rest: FxHashSet::default(),
            closer: None,
            parent_element: None,
            ancestry: Vec::new(),
        }
    }

    /// A warning the visitor of the node starting at `at` emits.
    fn warn(&mut self, at: u32, warning: Diagnostic) {
        self.found.push(STAGE, at, warning);
    }

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
        let component = self.context.component;
        let children = component.children(range);
        for (i, &child) in children.iter().enumerate() {
            if let TemplateNode::Text { span } = *component.node(child) {
                self.text(span, &children[..i], false);
            } else {
                self.node(child, children.get(i + 1).copied(), parent);
            }
        }
    }

    /// Walks `range` inside `ancestor`, with `parent_element` as the elements inside see it.
    fn within(
        &mut self,
        ancestor: placement::Ancestor<'a>,
        parent_element: Option<&'a str>,
        walk: impl FnOnce(&mut Self),
    ) {
        self.ancestry.push(ancestor);
        let outer = std::mem::replace(&mut self.parent_element, parent_element);
        walk(self);
        self.parent_element = outer;
        self.ancestry.pop();
    }

    fn fragment_of(&mut self, owner: Owner, range: Range, parent: a11y::Parent<'a>) {
        let outer = std::mem::replace(&mut self.owner, owner);
        self.fragment(range, parent);
        self.owner = outer;
    }

    /// `validate_block_not_empty` of the block at `block`, then the branch.
    fn branch(&mut self, block: u32, range: Range, parent: a11y::Parent<'a>) {
        let component = self.context.component;
        if let [only] = component.children(range)
            && let TemplateNode::Text { span } = *component.node(*only)
            && span
                .text(self.context.source)
                .trim_matches(is_ecmascript_whitespace)
                .is_empty()
        {
            self.warn(block, warning("block_empty", "Empty block", span));
        }
        self.fragment_of(Owner::Declarations, range, parent);
    }

    /// `Text`: bidirectional control characters, unless a `svelte-ignore` before it in the
    /// fragment names them. `attribute` says the text is an attribute's, decoded as one.
    fn text(&mut self, span: Span, before: &[u32], attribute: bool) {
        let source = self.context.source;
        let raw = span.text(source);
        let text = if attribute {
            decode_attribute(raw)
        } else {
            decode_text(raw)
        };
        let mut runs = bidirectional_runs(&text).peekable();
        if runs.peek().is_none() {
            return;
        }
        let code = "bidirectional_control_characters";
        let ignored = before.iter().any(|&sibling| {
            let TemplateNode::Comment { data, .. } = *self.context.component.node(sibling) else {
                return false;
            };
            let in_runes = self.context.runes;
            super::ignore::extract(data.start_offset, data.text(source), in_runes, |_| {})
                .iter()
                .any(|c| c == code)
        });
        if ignored {
            return;
        }
        let runs: Vec<(usize, usize)> = runs.collect();
        for (start, end) in runs {
            // Upstream adds the index in the decoded text to the node's start, in UTF-16 units.
            let units = |s: &str| s.encode_utf16().count();
            let at = span.start_offset + raw_offset(raw, units(&text[..start]));
            let to = span.start_offset + raw_offset(raw, units(&text[..end]));
            self.warn(at, bidirectional(Span::new(at, to)));
        }
    }

    /// `<svelte:window>`, `<svelte:document>` and `<svelte:body>`: no children, and no
    /// attributes but event handlers.
    fn special(&mut self, name: &str, element: Span, attributes: Range, children: Range) {
        let component = self.context.component;
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
                && attribute.name.text(self.context.source).starts_with("on")
                && a11y::is_expression(component, attribute);
            if event {
                self.global_event_reference(element.start_offset, attribute);
            }
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
    fn slot(&mut self, element: Span, attributes: Range) {
        let component = self.context.component;
        for attribute in component.attributes(attributes) {
            if attribute.kind != AttributeKind::Attribute
                || attribute.name.text(self.context.source) != "name"
            {
                continue;
            }
            let text = match attribute.value {
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [Part::Text(span)] => Some(decode_attribute(span.text(self.context.source))),
                    _ => None,
                },
                AttributeValue::True => None,
            };
            if let Some((code, message)) = slot_name_error(text.as_deref()) {
                self.error(element, error(code, message, attribute.span));
            }
        }
    }

    /// One node of a fragment, and the sibling after it.
    pub(super) fn node(&mut self, child: u32, next: Option<u32>, parent: a11y::Parent<'a>) {
        let component = self.context.component;
        let node = component.node(child);
        let ancestor = match *node {
            TemplateNode::If { .. }
            | TemplateNode::Each { .. }
            | TemplateNode::Key { .. }
            | TemplateNode::Await { .. } => Some((placement::Ancestor::Block, self.parent_element)),
            TemplateNode::Snippet { .. } => Some((placement::Ancestor::Boundary, None)),
            _ => None,
        };
        if let Some((ancestor, parent_element)) = ancestor {
            self.within(ancestor, parent_element, |walk| {
                walk.node_inside(child, next, parent);
            });
        } else {
            self.node_inside(child, next, parent);
        }
    }

    fn node_inside(&mut self, child: u32, next: Option<u32>, parent: a11y::Parent<'a>) {
        let component = self.context.component;
        let node = component.node(child);
        let at = node.span().start_offset;
        match *node {
            TemplateNode::Element { .. } => self.element(child, next, parent),
            TemplateNode::If {
                consequent,
                alternate,
                elseif,
                ..
            } => {
                // An `{:else if}` is part of the outer block, already counted.
                self.blocks += u32::from(!elseif);
                self.branch(at, consequent, parent);
                if let Some(alternate) = alternate {
                    self.branch(at, alternate, parent);
                }
                self.blocks -= u32::from(!elseif);
            }
            TemplateNode::Each {
                context,
                body,
                fallback,
                has_fallback,
                ..
            } => {
                if let Some(context) = context {
                    let pattern = self.context.component.javascript.get_pattern(context);
                    self.each_rest_names(&pattern.pattern, false);
                }
                self.blocks += 1;
                self.branch(at, body, parent);
                if has_fallback {
                    self.branch(at, fallback, parent);
                }
                self.blocks -= 1;
            }
            TemplateNode::Key { body, .. } => {
                self.blocks += 1;
                self.branch(at, body, parent);
                self.blocks -= 1;
            }
            TemplateNode::Snippet { body, .. } => self.branch(at, body, parent),
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => {
                self.blocks += 1;
                for branch in [pending, then, catch] {
                    if let Some(branch) = branch.present() {
                        self.branch(at, branch, parent);
                    }
                }
                self.blocks -= 1;
            }
            TemplateNode::Const { span, .. } if self.owner != Owner::Declarations => {
                let found = error(
                    "const_tag_invalid_placement",
                    "`{@const}` must be the immediate child of `{#snippet}`, `{#if}`, `{:else \
                        if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>`, \
                        `<svelte:boundary>` or `<Component>`",
                    span,
                );
                self.error(span, found);
            }
            _ => {}
        }
    }

    /// Records the identifiers of an `{#each}` context that a rest element declares.
    fn each_rest_names(&mut self, pattern: &BindingPattern<'_>, inside_rest: bool) {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                if inside_rest {
                    self.each_rest.extend(identifier.symbol_id.get());
                }
            }
            BindingPattern::ObjectPattern(object) => {
                for property in &object.properties {
                    self.each_rest_names(&property.value, inside_rest);
                }
                if let Some(rest) = &object.rest {
                    self.each_rest_names(&rest.argument, true);
                }
            }
            BindingPattern::ArrayPattern(array) => {
                for element in array.elements.iter().flatten() {
                    self.each_rest_names(element, inside_rest);
                }
                if let Some(rest) = &array.rest {
                    self.each_rest_names(&rest.argument, true);
                }
            }
            BindingPattern::AssignmentPattern(assignment) => {
                self.each_rest_names(&assignment.left, inside_rest);
            }
        }
    }
}

/// The byte offset in `raw` after its first `units` UTF-16 units, or the next character's
/// boundary when one character spans it.
fn raw_offset(raw: &str, units: usize) -> u32 {
    let mut seen = 0;
    for (i, c) in raw.char_indices() {
        if seen >= units {
            return i as u32;
        }
        seen += c.len_utf16();
    }
    raw.len() as u32
}

/// A warning about one run of bidirectional control characters.
pub(super) fn bidirectional(span: Span) -> Diagnostic {
    warning(
        "bidirectional_control_characters",
        "A bidirectional control character was detected in your code. These characters can be used \
            to alter the visual direction of your code and could have unintended consequences",
        span,
    )
}

/// Upstream `regex_bidirectional_control_characters`: each run's byte range in `text`.
pub(super) fn bidirectional_runs(text: &str) -> impl Iterator<Item = (usize, usize)> + '_ {
    let is_control = |c: char| matches!(c, '\u{202a}'..='\u{202e}' | '\u{2066}'..='\u{2069}');
    let mut chars = text.char_indices().peekable();
    std::iter::from_fn(move || {
        let (start, first) = chars.by_ref().find(|&(_, c)| is_control(c))?;
        let mut end = start + first.len_utf8();
        while let Some(&(i, c)) = chars.peek() {
            if !is_control(c) {
                break;
            }
            end = i + c.len_utf8();
            chars.next();
        }
        Some((start, end))
    })
}

/// Whether `name` is a component tag: a capitalized or dotted name, not a `svelte:` one.
fn is_component(name: &str) -> bool {
    is_component_name(name) && !name.starts_with("svelte:")
}
