use std::borrow::Cow;
use std::cell::RefCell;

use rsvelte_stylesheet::matcher::Match;
use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::{
    AttributeIdentifier, AttributeValue, Part,
};
use rsvelte_typescript::operators::LogicalOperator;
use rsvelte_typescript::semantic::number::number;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::semantic::input::ComponentInput;

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
                    values.collect(
                        input.javascript,
                        input.source_text,
                        *expression,
                        class,
                        false,
                    );
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

    fn collect(
        &mut self,
        tree: &'a SyntaxTree,
        source: &'a str,
        expression: NodeIdentifier,
        class: bool,
        nested: bool,
    ) {
        if self.unknown {
            return;
        }
        match tree.kind(expression) {
            Kind::String => self.add(tree.str_value(expression, source)),
            Kind::Number(value) => self.add(number(value)),
            Kind::Boolean(value) => self.add(if value { "true" } else { "false" }),
            Kind::Null => self.add("null"),
            Kind::Conditional {
                consequent,
                alternate,
                ..
            } => {
                self.collect(tree, source, consequent, class, nested);
                self.collect(tree, source, alternate, class, nested);
            }
            Kind::Logical(operator, left, right) => {
                if operator == LogicalOperator::And {
                    let mut lhs = Self::default();
                    lhs.collect(tree, source, left, class, nested);
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
                    self.collect(tree, source, left, class, nested);
                }
                self.collect(tree, source, right, class, nested);
            }
            Kind::Array(elements) if class => {
                for &element in elements {
                    if !element.is_none() {
                        self.collect(tree, source, element, class, true);
                    }
                }
            }
            Kind::Object(properties) if class => {
                for &property in properties {
                    if let Kind::Property {
                        key,
                        computed: false,
                        ..
                    } = tree.kind(property)
                    {
                        if let Some(atom) = tree.atom(key) {
                            self.add(tree.atoms.get(atom));
                        } else {
                            self.collect(tree, source, key, false, true);
                        }
                    } else {
                        self.unknown = true;
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
                values.collect(
                    input.javascript,
                    input.source_text,
                    expression,
                    class,
                    false,
                );
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
mod tests {
    #[test]
    fn attribute_case_rules_keep_ascii_folding_and_reject_other_names() {
        for name in [
            "accept-charset",
            "autocapitalize",
            "autocomplete",
            "behavior",
            "charset",
            "crossorigin",
            "decoding",
            "dir",
            "direction",
            "draggable",
            "enctype",
            "enterkeyhint",
            "fetchpriority",
            "formenctype",
            "formmethod",
            "formtarget",
            "hidden",
            "http-equiv",
            "inputmode",
            "kind",
            "loading",
            "method",
            "preload",
            "referrerpolicy",
            "rel",
            "rev",
            "role",
            "rules",
            "scope",
            "shape",
            "spellcheck",
            "target",
            "translate",
            "type",
            "valign",
            "wrap",
        ] {
            assert!(super::case_insensitive(name), "{name}");
            assert!(
                super::case_insensitive(&name.to_ascii_uppercase()),
                "{name}"
            );
        }
        for name in [
            "class",
            "id",
            "data-label",
            "data-state",
            "týpe",
            "typ",
            "types",
        ] {
            assert!(!super::case_insensitive(name), "{name}");
        }
    }
}
