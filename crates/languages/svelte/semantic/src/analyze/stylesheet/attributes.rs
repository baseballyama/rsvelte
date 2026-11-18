use std::borrow::Cow;
use std::cell::RefCell;

use oxc_ast::ast::{ArrayExpressionElement, Expression, ObjectPropertyKind, PropertyKey};
use oxc_syntax::operator::LogicalOperator;
use rsvelte_stylesheet_semantic::matcher::Match;
use rsvelte_typescript_semantic::number::number;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::compiler_syntax_tree::{AttributeIdentifier, AttributeValue, Part};
use crate::input::ComponentInput;

#[derive(Default)]
struct Values<'a> {
    candidates: FxHashSet<Cow<'a, str>>,
    unknown: bool,
}

pub(super) struct AttributeFacts<'a> {
    input: &'a ComponentInput<'a>,
    values: RefCell<FxHashMap<AttributeIdentifier, Values<'a>>>,
}

impl<'a> AttributeFacts<'a> {
    pub(super) fn new(input: &'a ComponentInput<'a>) -> Self {
        Self {
            input,
            values: RefCell::new(FxHashMap::default()),
        }
    }

    pub(super) fn matches(&self, id: AttributeIdentifier, check: &impl Fn(&str) -> bool) -> Match {
        let mut facts = self.values.borrow_mut();
        let values = facts.entry(id).or_insert_with(|| {
            let input = self.input;
            let attribute = &input.compiler_syntax_tree.attributes[id];
            let class = attribute
                .name
                .text(input.source_text)
                .eq_ignore_ascii_case("class");
            match &attribute.value {
                AttributeValue::Interpolated(parts) => interpolated(parts, input, class),
                AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression) => {
                    let mut values = Values::default();
                    values.collect(input.javascript.get_expression(*expression), class, false);
                    values
                }
                _ => unreachable!("only expression attributes need value facts"),
            }
        });
        if values.unknown {
            Match::Maybe
        } else if values.candidates.iter().any(|value| check(value)) {
            Match::Yes
        } else {
            Match::No
        }
    }
}

impl<'a> Values<'a> {
    fn add(&mut self, value: impl Into<Cow<'a, str>>) {
        self.candidates.insert(value.into());
    }

    fn collect(&mut self, expression: &'a Expression<'a>, class: bool, nested: bool) {
        if self.unknown {
            return;
        }
        // Upstream reads the value after erasing types.
        match crate::typescript::without_typescript(expression) {
            Expression::StringLiteral(s) => match s.value.as_str() {
                Some(value) => self.add(value),
                None => self.unknown = true,
            },
            Expression::NumericLiteral(n) => self.add(number(n.value)),
            Expression::BooleanLiteral(b) => self.add(if b.value { "true" } else { "false" }),
            Expression::NullLiteral(_) => self.add("null"),
            Expression::ConditionalExpression(c) => {
                self.collect(&c.consequent, class, nested);
                self.collect(&c.alternate, class, nested);
            }
            Expression::LogicalExpression(l) => {
                if l.operator == LogicalOperator::And {
                    let mut lhs = Self::default();
                    lhs.collect(&l.left, class, nested);
                    if !class || !nested {
                        if lhs.unknown {
                            for value in ["", "false", "NaN", "0"] {
                                self.add(value);
                            }
                        } else if lhs.candidates.iter().any(|value| value.is_empty()) {
                            self.add("");
                        }
                    }
                } else {
                    self.collect(&l.left, class, nested);
                }
                self.collect(&l.right, class, nested);
            }
            Expression::ArrayExpression(array) if class => {
                for element in &array.elements {
                    match element {
                        ArrayExpressionElement::Elision(_) => {}
                        ArrayExpressionElement::SpreadElement(_) => self.unknown = true,
                        element => {
                            if let Some(element) = element.as_expression() {
                                self.collect(element, class, true);
                            }
                        }
                    }
                }
            }
            Expression::ObjectExpression(object) if class => {
                for property in &object.properties {
                    match property {
                        ObjectPropertyKind::ObjectProperty(p) if !p.computed => match &p.key {
                            PropertyKey::StaticIdentifier(key) => self.add(key.name.as_str()),
                            key => match key.as_expression() {
                                Some(key) => self.collect(key, false, true),
                                None => self.unknown = true,
                            },
                        },
                        _ => self.unknown = true,
                    }
                }
            }
            _ => self.unknown = true,
        }
    }
}

fn interpolated<'a>(parts: &[Part], input: &ComponentInput<'a>, class: bool) -> Values<'a> {
    const MAX_COMBINATIONS: usize = 20;
    let mut candidates = vec![String::new()];
    for part in parts {
        let mut values = Values::default();
        match *part {
            Part::Text(span) => values.add(span.text(input.source_text)),
            Part::Expression { expression, .. } => {
                values.collect(input.javascript.get_expression(expression), class, false);
            }
        }
        if values.unknown || candidates.len() * values.candidates.len() > MAX_COMBINATIONS {
            return Values {
                candidates: FxHashSet::default(),
                unknown: true,
            };
        }
        let mut values: Vec<_> = values.candidates.into_iter().collect();
        values.sort_unstable();
        let mut combined = Vec::with_capacity(candidates.len() * values.len());
        for previous in &candidates {
            for value in &values {
                let mut text = String::with_capacity(previous.len() + value.len());
                text.push_str(previous);
                text.push_str(value);
                combined.push(text);
            }
        }
        candidates = combined;
    }
    Values {
        candidates: candidates.into_iter().map(Cow::Owned).collect(),
        unknown: false,
    }
}

pub(super) fn case_insensitive(name: &str) -> bool {
    match name.len() {
        3 => ["dir", "rel", "rev"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        4 => ["kind", "role", "type", "wrap"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        5 => ["rules", "scope", "shape"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        6 => ["hidden", "method", "target", "valign"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        7 => ["charset", "enctype", "loading", "preload"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        8 => ["behavior", "decoding"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        9 => ["direction", "draggable", "inputmode", "translate"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        10 => ["formmethod", "formtarget", "http-equiv", "spellcheck"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        11 => ["crossorigin", "formenctype"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        12 => ["autocomplete", "enterkeyhint"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        13 => name.eq_ignore_ascii_case("fetchpriority"),
        14 => ["accept-charset", "autocapitalize", "referrerpolicy"]
            .iter()
            .any(|candidate| name.eq_ignore_ascii_case(candidate)),
        _ => false,
    }
}

#[cfg(test)]
mod tests;
