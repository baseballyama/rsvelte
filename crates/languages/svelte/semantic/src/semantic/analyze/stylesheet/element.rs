use rsvelte_stylesheet::matcher::{self, Element, Match};
use rsvelte_stylesheet::syntax_tree::{RuleIdentifier, RuleKind};
use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::{self, AttributeValue, NodeKind};

use super::El;

impl El<'_> {
    fn element(&self) -> &compiler_syntax_tree::Element {
        let NodeKind::Element(el) = &self.compiler_syntax_tree.node(self.identifier).kind else {
            unreachable!("El wraps elements")
        };
        el
    }

    fn has_class_directive(&self, name: Option<&str>) -> bool {
        self.compiler_syntax_tree
            .attributes(self.element().attributes)
            .iter()
            .any(|a| {
                matches!(a.value, AttributeValue::Class(_))
                    && name.is_none_or(|n| a.name.text(self.source_text) == n)
            })
    }

    fn attribute_state(&self, name: &str, presence: bool, check: impl Fn(&str) -> bool) -> Match {
        for id in self.element().attributes.iter() {
            let a = &self.compiler_syntax_tree.attributes[id];
            match a.value {
                AttributeValue::Attach(_)
                | AttributeValue::Class(_)
                | AttributeValue::On { .. }
                | AttributeValue::Use { .. }
                | AttributeValue::Transition { .. }
                | AttributeValue::Animate { .. }
                | AttributeValue::Style { .. }
                | AttributeValue::Let(_) => continue,
                // Upstream `attribute_matches`: a spread may set any attribute.
                AttributeValue::Spread(_) => return Match::Maybe,
                _ => {}
            }
            // Upstream compares a binding's name case-sensitively and stops at it.
            if let AttributeValue::Bind(_) = a.value {
                if a.name.text(self.source_text) == name {
                    return Match::Yes;
                }
                continue;
            }
            if !a.name.text(self.source_text).eq_ignore_ascii_case(name) {
                continue;
            }
            if presence {
                return Match::Yes;
            }
            let matched = match &a.value {
                AttributeValue::Boolean => Match::No,
                AttributeValue::Static(text) => Match::from_bool(check(text)),
                AttributeValue::Interpolated(parts) if parts.is_empty() => {
                    Match::from_bool(check(""))
                }
                AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_) => self.facts.attributes().matches(id, &check),
                _ => unreachable!("directives are matched above"),
            };
            if matched != Match::No {
                return matched;
            }
            if matches!(a.value, AttributeValue::Boolean)
                || matches!(a.value, AttributeValue::Static(_))
                    && !name.eq_ignore_ascii_case("class")
                    && !name.eq_ignore_ascii_case("style")
            {
                return Match::No;
            }
        }
        Match::No
    }
}

trait FromBoolean {
    fn from_bool(b: bool) -> Self;
}

impl FromBoolean for Match {
    fn from_bool(b: bool) -> Self {
        if b { Self::Yes } else { Self::No }
    }
}

impl Element for El<'_> {
    fn text<'a>(
        &'a self,
        source: &'a str,
        span: rsvelte_kernel::source::positions::Span,
    ) -> &'a str {
        self.sheet.text(span, source)
    }

    fn nesting(&self, rule: RuleIdentifier) -> Match {
        let key = (rule, self.identifier);
        if let Some(matched) = self.nesting.borrow().get(&key).copied() {
            return matched;
        }
        let rule = self.facts.rules()[rule].expect("a parent rule exists");
        let RuleKind::Style { selectors, .. } = &rule.kind else {
            unreachable!("only style rules are indexed")
        };
        let matched = if selectors.iter().all(|s| {
            s.parts
                .iter()
                .all(|p| matcher::is_global(self.source_text, p))
        }) {
            Match::Maybe
        } else if selectors
            .iter()
            .any(|s| matcher::matches(self.source_text, s, *self))
        {
            Match::Yes
        } else {
            Match::No
        };
        self.nesting.borrow_mut().insert(key, matched);
        matched
    }

    fn unknown_sibling(&self, adjacent: bool) -> bool {
        self.facts
            .topology()
            .unknown_sibling(self.identifier, adjacent)
    }

    fn same(&self, other: Self) -> bool {
        self.identifier == other.identifier
    }

    fn tag_name(&self) -> Option<&str> {
        if self.element().kind
            == compiler_syntax_tree::ElementKind::Metadata(Some(
                compiler_syntax_tree::MetadataTag::Element,
            ))
        {
            None
        } else {
            Some(self.element().name.text(self.source_text))
        }
    }

    fn class(&self, name: &str) -> Match {
        if self.has_class_directive(Some(name)) {
            return Match::Yes;
        }
        self.attribute_state("class", false, |v| {
            v.split_ascii_whitespace().any(|c| c == name)
        })
    }

    fn identifier(&self, name: &str) -> Match {
        self.attribute_state("id", false, |v| v == name)
    }

    fn attribute_matches(
        &self,
        name: &str,
        operator: rsvelte_stylesheet::syntax_tree::AttributeOperator,
        value: &str,
        insensitive: Option<bool>,
    ) -> Match {
        for attribute in self
            .compiler_syntax_tree
            .attributes(self.element().attributes)
        {
            match attribute.value {
                AttributeValue::Class(_) if name.eq_ignore_ascii_case("class") => {
                    if !matches!(
                        operator,
                        rsvelte_stylesheet::syntax_tree::AttributeOperator::Includes
                    ) || attribute.name.text(self.source_text) == value
                    {
                        return Match::Yes;
                    }
                }
                AttributeValue::Style { .. } if name.eq_ignore_ascii_case("style") => {
                    return Match::Yes;
                }
                _ => {}
            }
        }
        let insensitive = insensitive.unwrap_or_else(|| super::attributes::case_insensitive(name));
        self.attribute_state(name, false, |text| {
            operator.matches(text, value, insensitive)
        })
    }

    fn attribute(&self, name: &str) -> Match {
        if name.eq_ignore_ascii_case("style")
            && self
                .compiler_syntax_tree
                .attributes(self.element().attributes)
                .iter()
                .any(|a| matches!(a.value, AttributeValue::Style { .. }))
        {
            return Match::Yes;
        }
        if name == "open" && matches!(self.tag_name(), Some("details" | "dialog")) {
            return Match::Maybe;
        }
        if name.eq_ignore_ascii_case("class") && self.has_class_directive(None) {
            return Match::Yes;
        }
        match self.attribute_state(name, true, |_| true) {
            Match::No => Match::No,
            _ => Match::Yes,
        }
    }

    /// Blocks are transparent for CSS: the parent is the enclosing element.
    fn parent(&self) -> Option<Self> {
        self.facts.topology().links[self.identifier]
            .parent
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn parents(&self) -> impl Iterator<Item = Self> {
        self.facts
            .topology()
            .parents
            .direct(self.identifier)
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn ancestors(&self) -> impl Iterator<Item = Self> {
        self.facts
            .topology()
            .parents
            .transitive(self.identifier)
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn descendants(&self) -> impl Iterator<Item = Self> {
        self.facts
            .topology()
            .children
            .transitive(self.identifier)
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn previous_siblings(&self, adjacent: bool) -> impl Iterator<Item = Self> {
        self.facts
            .topology()
            .previous(self.identifier, adjacent)
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn first_child(&self) -> Option<Self> {
        self.facts.topology().links[self.identifier]
            .first
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn children(&self) -> impl Iterator<Item = Self> {
        self.facts
            .topology()
            .children
            .direct(self.identifier)
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }

    fn following_siblings(&self, adjacent: bool) -> impl Iterator<Item = Self> {
        self.facts
            .topology()
            .following(self.identifier, adjacent)
            .map(|identifier| Self {
                identifier,
                ..*self
            })
    }
}
