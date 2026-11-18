//! The elements a component renders, and the classes, IDs and types that may select them.

use std::borrow::Cow;

use oxc_ast::AstKind;
use oxc_ast::ast::{BindingPattern, Expression};
use oxc_span::Span;
use rsvelte_kernel::source::characters::split_ecmascript_whitespace;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, TemplateNode, TemplateNodeIdentifier,
    decode_attribute,
};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::rule::File;
use crate::rules::element_kind::{ElementKind, element_kind};
use crate::rules::nodes;

/// How many times an element renders.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum Occurrences {
    ZeroOrOne,
    One,
    Many,
}

impl Occurrences {
    fn times(self, other: Self) -> Self {
        match (self, other) {
            (Self::One, x) | (x, Self::One) => x,
            (a, b) if a == b => a,
            _ => Self::Many,
        }
    }
}

type Element = TemplateNodeIdentifier;

/// Elements a class or an ID may select: by its exact value, or by a value an expression starts
/// or ends with.
#[derive(Default)]
pub(super) struct Selections<'a> {
    exact: FxHashMap<Cow<'a, str>, Vec<Element>>,
    /// By the text a value starts with, with the text it ends with when known; looked up by each
    /// prefix of a name, so that a name does not scan every element.
    by_prefix: FxHashMap<String, Vec<(Option<String>, Element)>>,
    /// By the text a value ends with, when its start is unknown.
    by_suffix: FxHashMap<String, Vec<Element>>,
    pub(super) any: bool,
}

impl Selections<'_> {
    fn affix(&mut self, prefix: Option<String>, suffix: Option<String>, element: Element) {
        match (prefix, suffix) {
            (Some(prefix), suffix) => self
                .by_prefix
                .entry(prefix)
                .or_default()
                .push((suffix, element)),
            (None, Some(suffix)) => self.by_suffix.entry(suffix).or_default().push(element),
            (None, None) => self.any = true,
        }
    }

    /// The elements `name` may select, and whether each by its exact value.
    pub(super) fn matching(&self, name: &str) -> Vec<(Element, bool)> {
        let mut out: Vec<(Element, bool)> = self
            .exact
            .get(name)
            .map_or(&[][..], Vec::as_slice)
            .iter()
            .map(|&e| (e, true))
            .collect();
        for at in (0..=name.len()).filter(|&at| name.is_char_boundary(at)) {
            if let Some(elements) = self.by_prefix.get(&name[..at]) {
                out.extend(
                    elements
                        .iter()
                        .filter(|(suffix, _)| suffix.as_deref().is_none_or(|s| name.ends_with(s)))
                        .map(|&(_, e)| (e, false)),
                );
            }
            if let Some(elements) = self.by_suffix.get(&name[at..]) {
                out.extend(elements.iter().map(|&e| (e, false)));
            }
        }
        out
    }
}

pub(super) struct Template<'a> {
    pub(super) component: &'a Component,
    pub(super) source: &'a str,
    pub(super) file: &'a File<'a>,
    pub(super) occurrences: FxHashMap<Element, Occurrences>,
    pub(super) types: FxHashMap<&'a str, Vec<Element>>,
    pub(super) classes: Selections<'a>,
    pub(super) ids: Selections<'a>,
    pub(super) directives: FxHashSet<&'a str>,
}

impl Template<'_> {
    pub(super) fn visit(&mut self, children: Range, occurrences: Occurrences) {
        for &child in self.component.children(children) {
            self.node(child, occurrences);
        }
    }

    fn node(&mut self, identifier: Element, occurrences: Occurrences) {
        use Occurrences::{Many, One, ZeroOrOne};
        let node = self.component.node(identifier);
        match *node {
            TemplateNode::Element {
                children,
                attributes,
                name,
                ..
            } => {
                let kind = element_kind(node, self.source).expect("an element");
                if kind == ElementKind::Markup {
                    self.occurrences.insert(identifier, occurrences);
                    self.types
                        .entry(name.text(self.source))
                        .or_default()
                        .push(identifier);
                    self.attributes(identifier, attributes);
                }
                let inside = if kind == ElementKind::Component {
                    Many
                } else {
                    One
                };
                self.visit(children, occurrences.times(inside));
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                self.visit(consequent, occurrences.times(ZeroOrOne));
                if let Some(alternate) = alternate {
                    self.visit(alternate, occurrences.times(ZeroOrOne));
                }
            }
            TemplateNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                self.visit(body, occurrences.times(Many));
                if has_fallback {
                    self.visit(fallback, occurrences.times(ZeroOrOne));
                }
            }
            TemplateNode::Key { body, .. } => self.visit(body, occurrences),
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => {
                for branch in [pending, then, catch]
                    .into_iter()
                    .filter_map(Range::present)
                {
                    self.visit(branch, occurrences.times(ZeroOrOne));
                }
            }
            TemplateNode::Snippet { body, .. } => self.visit(body, occurrences.times(Many)),
            _ => {}
        }
    }

    fn attributes(&mut self, element: Element, attributes: Range) {
        let source = self.source;
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Class {
                let name = attribute
                    .directive_name(&self.component.modifiers)
                    .expect("a directive has a name")
                    .text(source);
                self.directives.insert(name);
                self.classes
                    .exact
                    .entry(Cow::Borrowed(name))
                    .or_default()
                    .push(element);
                continue;
            }
            if attribute.kind != AttributeKind::Attribute {
                continue;
            }
            let name = attribute.name.text(source);
            let (selections, split) = match name {
                "class" => (&mut self.classes, true),
                "id" => (&mut self.ids, false),
                _ => continue,
            };
            let AttributeValue::Parts(parts) = attribute.value else {
                continue;
            };
            for part in self.component.parts(parts) {
                match *part {
                    Part::Text(span) => {
                        // Upstream matches the decoded value, so `&#97;` is `a`.
                        let mut add =
                            |value| selections.exact.entry(value).or_default().push(element);
                        match decode_attribute(span.text(source)) {
                            Cow::Borrowed(text) if split => {
                                split_ecmascript_whitespace(text)
                                    .for_each(|v| add(Cow::Borrowed(v)));
                            }
                            Cow::Owned(text) if split => split_ecmascript_whitespace(&text)
                                .for_each(|v| add(Cow::Owned(v.to_owned()))),
                            text => add(text),
                        }
                    }
                    Part::Expression { expression, .. } => {
                        let expression = self.file.javascript().get_expression(expression);
                        let prefix = affix(self.file, expression, End::Prefix, &mut Vec::new());
                        let suffix = affix(self.file, expression, End::Suffix, &mut Vec::new());
                        selections.affix(prefix, suffix, element);
                    }
                }
            }
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum End {
    Prefix,
    Suffix,
}

/// The text an expression's value surely starts (or ends) with, through binary expressions,
/// template literals and declared initializers; `None` when unknown. Type assertions are seen
/// through.
fn affix(
    file: &File<'_>,
    expression: &Expression<'_>,
    end: End,
    visited: &mut Vec<Span>,
) -> Option<String> {
    let source = file.source();
    match expression.get_inner_expression() {
        Expression::BinaryExpression(binary) => affix(
            file,
            if end == End::Prefix {
                &binary.left
            } else {
                &binary.right
            },
            end,
            visited,
        ),
        Expression::StringLiteral(string) => Some(string.value.display().to_string()),
        Expression::Identifier(identifier) => {
            if visited.contains(&identifier.span) {
                return None;
            }
            visited.push(identifier.span);
            let semantic = file.semantic();
            let scoping = semantic.scoping();
            let symbol = scoping
                .get_reference(identifier.reference_id.get()?)
                .symbol_id()?;
            let AstKind::VariableDeclarator(declarator) =
                semantic.nodes().kind(scoping.symbol_declaration(symbol))
            else {
                return None;
            };
            // A destructured name does not hold the initializer.
            let BindingPattern::BindingIdentifier(id) = &declarator.id else {
                return None;
            };
            if id.symbol_id.get() != Some(symbol) {
                return None;
            }
            affix(file, declarator.init.as_ref()?, end, visited)
        }
        Expression::TemplateLiteral(template) => {
            // Quasis and expressions alternate, starting and ending with a quasi.
            let count = template.quasis.len() + template.expressions.len();
            let mut parts: Box<dyn Iterator<Item = usize>> = if end == End::Prefix {
                Box::new(0..count)
            } else {
                Box::new((0..count).rev())
            };
            parts.find_map(|i| {
                if i % 2 == 1 {
                    return Some(affix(file, &template.expressions[i / 2], end, visited));
                }
                let raw = nodes::text(&template.quasis[i / 2], source);
                (!raw.is_empty()).then(|| Some(raw.to_owned()))
            })?
        }
        _ => None,
    }
}

impl Template<'_> {
    fn occurrences(&self, element: Element) -> Occurrences {
        self.occurrences[&element]
    }

    /// An ID selects at most one element.
    pub(super) fn can_use_id(&self, mut selection: impl ExactSizeIterator<Item = Element>) -> bool {
        match selection.len() {
            0 => true,
            1 => self.occurrences(selection.next().expect("one element")) != Occurrences::Many,
            _ => false,
        }
    }

    /// A type selects every element of its name.
    pub(super) fn can_use_type(&self, selection: &[(Element, bool)]) -> bool {
        let Some(&(first, _)) = selection.first() else {
            return true;
        };
        let name = |element| match self.component.node(element) {
            TemplateNode::Element { name, .. } => name.text(self.source),
            _ => unreachable!("a selection holds elements"),
        };
        let type_name = name(first);
        if selection.iter().any(|&(e, _)| name(e) != type_name) {
            return false;
        }
        if selection
            .iter()
            .any(|&(e, exact)| !exact && self.occurrences(e) == Occurrences::Many)
        {
            return false;
        }
        // Upstream compares lengths with repeats counted, then whether every element is selected.
        let all = self.types[type_name].len();
        let selected: FxHashSet<Element> = selection.iter().map(|&(e, _)| e).collect();
        selection.len() == all && selected.len() == all
    }
}
