use rsvelte_kernel::source::characters::split_ecmascript_whitespace;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet_syntax::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple, StyleSheet};
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, TemplateNode, TemplateNodeIdentifier,
};
use rsvelte_typescript_syntax::NodeIdentifier;
use rsvelte_typescript_syntax::syntax_tree::Kind;
use rustc_hash::{FxHashMap, FxHashSet};
use serde::Deserialize;

use super::element_kind::{ElementKind, element_kind};
use super::style_sheet::{StyleVerdict, verdict};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/consistent-selector-style",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, PartialEq, Eq, Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
enum Style {
    Class,
    Id,
    Type,
}

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    check_global: Option<bool>,
    style: Option<Vec<Style>>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    let style = options
        .style
        .unwrap_or_else(|| vec![Style::Type, Style::Id, Style::Class]);
    if style.len() > 3 || (1..style.len()).any(|i| style[..i].contains(&style[i])) {
        return Err("`style` takes each of `class`, `id` and `type` at most once".to_owned());
    }
    Ok(Box::new(ConsistentSelectorStyle {
        check_global: options.check_global.unwrap_or(false),
        style,
    }))
}

#[derive(Debug)]
struct ConsistentSelectorStyle {
    check_global: bool,
    style: Vec<Style>,
}

/// How many times an element renders.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Occurrences {
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
struct Selections<'a> {
    exact: FxHashMap<&'a str, Vec<Element>>,
    /// By the text a value starts with, with the text it ends with when known; looked up by each
    /// prefix of a name, so that a name does not scan every element.
    by_prefix: FxHashMap<String, Vec<(Option<String>, Element)>>,
    /// By the text a value ends with, when its start is unknown.
    by_suffix: FxHashMap<String, Vec<Element>>,
    any: bool,
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
    fn matching(&self, name: &str) -> Vec<(Element, bool)> {
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

struct Template<'a> {
    component: &'a Component,
    source: &'a str,
    file: &'a File<'a>,
    occurrences: FxHashMap<Element, Occurrences>,
    types: FxHashMap<&'a str, Vec<Element>>,
    classes: Selections<'a>,
    ids: Selections<'a>,
    directives: FxHashSet<&'a str>,
}

impl SvelteRule for ConsistentSelectorStyle {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let StyleVerdict::Parsed = verdict(file) else {
            return;
        };
        let Some(Ok(sheet)) = component.style.as_ref().map(|s| &s.sheet) else {
            return;
        };
        let mut template = Template {
            component,
            source: file.source(),
            file,
            occurrences: FxHashMap::default(),
            types: FxHashMap::default(),
            classes: Selections::default(),
            ids: Selections::default(),
            directives: FxHashSet::default(),
        };
        template.visit(component.root, Occurrences::One);
        let mut check = Check {
            rule: self,
            template: &template,
            sheet,
            reporter,
            verdicts: FxHashMap::default(),
        };
        for rule in &sheet.rules {
            check.rule_selectors(rule);
        }
    }
}

impl Template<'_> {
    fn visit(&mut self, children: Range, occurrences: Occurrences) {
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
                if kind == ElementKind::Html {
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
                self.classes.exact.entry(name).or_default().push(element);
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
                        let text = span.text(source);
                        if split {
                            for class in split_ecmascript_whitespace(text) {
                                selections.exact.entry(class).or_default().push(element);
                            }
                        } else {
                            selections.exact.entry(text).or_default().push(element);
                        }
                    }
                    Part::Expression { expression, .. } => {
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

/// The text an expression's value surely starts (or ends) with, through `+`, template literals
/// and constants declared once; `None` when unknown.
fn affix(
    file: &File<'_>,
    expression: NodeIdentifier,
    end: End,
    visited: &mut Vec<NodeIdentifier>,
) -> Option<String> {
    let javascript = file.javascript();
    let source = file.source();
    match javascript.kind(expression) {
        Kind::Binary(_, left, right) => affix(
            file,
            if end == End::Prefix { left } else { right },
            end,
            visited,
        ),
        Kind::String => Some(javascript.str_value(expression, source).to_owned()),
        Kind::Identifier(_) => {
            if visited.contains(&expression) {
                return None;
            }
            visited.push(expression);
            let semantic = file.semantic();
            let binding = &semantic.bindings[semantic.binding_of(expression)?];
            let declarator = binding.declaration?;
            let Kind::Declarator {
                identifier,
                initializer,
            } = javascript.kind(declarator)
            else {
                return None;
            };
            if identifier != binding.node {
                return None;
            }
            affix(file, initializer?, end, visited)
        }
        Kind::Template {
            quasis,
            expressions,
        } => {
            // Quasis and expressions alternate, starting and ending with a quasi.
            let parts = (0..quasis.len() + expressions.len()).map(|i| {
                if i % 2 == 0 {
                    (quasis[i / 2], true)
                } else {
                    (expressions[i / 2], false)
                }
            });
            let mut parts: Box<dyn Iterator<Item = (NodeIdentifier, bool)>> = if end == End::Prefix
            {
                Box::new(parts)
            } else {
                Box::new(parts.rev())
            };
            parts.find_map(|(part, quasi)| {
                if !quasi {
                    return Some(affix(file, part, end, visited));
                }
                let raw = javascript.str_value(part, source);
                (!raw.is_empty()).then(|| Some(raw.to_owned()))
            })?
        }
        _ => None,
    }
}

struct Check<'r, 'a, 'b> {
    rule: &'r ConsistentSelectorStyle,
    template: &'r Template<'a>,
    sheet: &'r StyleSheet,
    reporter: &'r mut Reporter<'b>,
    /// A verdict depends on the selector's kind and name alone, so a name repeated across the
    /// sheet looks its elements up once.
    verdicts: FxHashMap<(Selected, &'r str), Verdict>,
}

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
enum Selected {
    Class,
    Id,
    Type,
}

/// The message id and message to report, if any.
type Verdict = Option<(&'static str, &'static str)>;

impl<'r> Check<'r, '_, '_> {
    fn rule_selectors(&mut self, rule: &Rule) {
        let source = self.template.source;
        let mut nested = true;
        match &rule.kind {
            RuleKind::Style { selectors, .. } => {
                for selector in selectors {
                    self.selector(selector);
                }
                // A rule whose whole selector is `:global` is a global block.
                nested = self.rule.check_global
                    || !matches!(
                        &**selectors,
                        [only] if matches!(
                            &*only.parts,
                            [part] if part.simple.len() == 1
                                && part.simple.first().is_global_block(source)
                        )
                    );
            }
            RuleKind::At { .. } => {}
            RuleKind::Keyframe { .. } => nested = false,
        }
        if nested {
            for child in &rule.children {
                self.rule_selectors(child);
            }
        }
    }

    fn selector(&mut self, selector: &ComplexSelector) {
        let source = self.template.source;
        for part in &selector.parts {
            for simple in &part.simple {
                match simple {
                    Simple::Class { span, name } => {
                        self.check(Selected::Class, *span, self.sheet.text(*name, source));
                    }
                    Simple::Identifier { span, name } => {
                        self.check(Selected::Id, *span, self.sheet.text(*name, source));
                    }
                    Simple::Type(span) => self.check(Selected::Type, *span, span.text(source)),
                    Simple::NamespacedType { span, name } if name.text(source) != "*" => {
                        self.check(Selected::Type, *span, name.text(source));
                    }
                    Simple::PseudoClass { selectors, .. }
                    | Simple::PseudoElement { selectors, .. }
                        if self.rule.check_global || !simple.is_pseudo(source, &["global"]) =>
                    {
                        for selector in selectors {
                            self.selector(selector);
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    fn check(
        &mut self,
        selected: Selected,
        span: rsvelte_kernel::source::positions::Span,
        name: &'r str,
    ) {
        let verdict = if let Some(&verdict) = self.verdicts.get(&(selected, name)) {
            verdict
        } else {
            let verdict = match selected {
                Selected::Class => self.class(name),
                Selected::Id => self.id(name),
                Selected::Type => self.type_selector(name),
            };
            self.verdicts.insert((selected, name), verdict);
            verdict
        };
        if let Some((id, message)) = verdict {
            self.reporter
                .report(Report::range(message, span).message_id(id));
        }
    }

    fn class(&self, name: &str) -> Verdict {
        let template = self.template;
        if template.classes.any || template.directives.contains(name) {
            return None;
        }
        let selection = template.classes.matching(name);
        for &style in &self.rule.style {
            match style {
                Style::Class => return None,
                Style::Id if template.can_use_id(selection.iter().map(|&(e, _)| e)) => {
                    return Some((
                        "classShouldBeId",
                        "Selector should select by ID instead of class",
                    ));
                }
                Style::Type if template.can_use_type(&selection) => {
                    return Some((
                        "classShouldBeType",
                        "Selector should select by element type instead of class",
                    ));
                }
                _ => {}
            }
        }
        None
    }

    fn id(&self, name: &str) -> Verdict {
        let template = self.template;
        if template.ids.any {
            return None;
        }
        let selection = template.ids.matching(name);
        for &style in &self.rule.style {
            match style {
                Style::Class => {
                    return Some((
                        "idShouldBeClass",
                        "Selector should select by class instead of ID",
                    ));
                }
                Style::Id => return None,
                Style::Type if template.can_use_type(&selection) => {
                    return Some((
                        "idShouldBeType",
                        "Selector should select by element type instead of ID",
                    ));
                }
                Style::Type => {}
            }
        }
        None
    }

    fn type_selector(&self, name: &str) -> Verdict {
        let template = self.template;
        let selection = template.types.get(name).map_or(&[][..], Vec::as_slice);
        for &style in &self.rule.style {
            match style {
                Style::Class => {
                    return Some((
                        "typeShouldBeClass",
                        "Selector should select by class instead of element type",
                    ));
                }
                Style::Id if template.can_use_id(selection.iter().copied()) => {
                    return Some((
                        "typeShouldBeId",
                        "Selector should select by ID instead of element type",
                    ));
                }
                Style::Type => return None,
                Style::Id => {}
            }
        }
        None
    }
}

impl Template<'_> {
    fn occurrences(&self, element: Element) -> Occurrences {
        self.occurrences[&element]
    }

    /// An ID selects at most one element.
    fn can_use_id(&self, mut selection: impl ExactSizeIterator<Item = Element>) -> bool {
        match selection.len() {
            0 => true,
            1 => self.occurrences(selection.next().expect("one element")) != Occurrences::Many,
            _ => false,
        }
    }

    /// A type selects every element of its name.
    fn can_use_type(&self, selection: &[(Element, bool)]) -> bool {
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
