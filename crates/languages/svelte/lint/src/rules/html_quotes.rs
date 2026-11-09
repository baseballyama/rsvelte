use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part,
};
use serde::Deserialize;

use super::tags::{Attributes, is_javascript_whitespace, raw_value_is_quoted, start_tags};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/html-quotes",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Quote {
    #[default]
    Double,
    Single,
    #[serde(skip)]
    Unquoted,
}

impl Quote {
    const fn character(self) -> char {
        match self {
            Self::Double => '"',
            Self::Single => '\'',
            Self::Unquoted => unreachable!(),
        }
    }

    const fn name(self) -> &'static str {
        match self {
            Self::Double => "double quotes",
            Self::Single => "single quotes",
            Self::Unquoted => "unquoted",
        }
    }
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    #[serde(default)]
    prefer: Quote,
    #[serde(default)]
    dynamic: Dynamic,
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Dynamic {
    #[serde(default)]
    quoted: bool,
    #[serde(default, rename = "avoidInvalidUnquotedInHTML")]
    avoid_invalid_unquoted_in_html: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(HtmlQuotes {
        prefer: options.prefer,
        dynamic: if options.dynamic.quoted {
            options.prefer
        } else {
            Quote::Unquoted
        },
        avoid_invalid_unquoted: options.dynamic.avoid_invalid_unquoted_in_html,
    }))
}

#[derive(Debug)]
struct HtmlQuotes {
    prefer: Quote,
    dynamic: Quote,
    avoid_invalid_unquoted: bool,
}

impl SvelteRule for HtmlQuotes {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let tokens = &component.tokens;
        for tag in start_tags(component) {
            match tag.attributes {
                Attributes::Template(attributes) => {
                    for attribute in attributes {
                        if let Some((prefer, value)) =
                            self.template_value(component, source, attribute)
                        {
                            Self::verify(source, prefer, value, reporter);
                        }
                    }
                }
                Attributes::Raw(attributes) => {
                    for value in attributes.iter().filter_map(|(_, value)| *value) {
                        let value = if raw_value_is_quoted(tokens, value) {
                            quoted(
                                source,
                                Span::new(value.start_offset - 1, value.end_offset + 1),
                            )
                        } else {
                            Value {
                                range: value,
                                quote: Quote::Unquoted,
                            }
                        };
                        Self::verify(source, self.prefer, value, reporter);
                    }
                }
            }
        }
    }
}

/// A value as written: its range (quotes included) and its quote.
#[derive(Clone, Copy)]
struct Value {
    range: Span,
    quote: Quote,
}

const fn quoted(source: &str, range: Span) -> Value {
    let quote = if source.as_bytes()[range.start_offset as usize] == b'"' {
        Quote::Double
    } else {
        Quote::Single
    };
    Value { range, quote }
}

impl HtmlQuotes {
    /// The quote this attribute's value should have and its value, or `None` when it has none to
    /// check.
    fn template_value(
        &self,
        component: &Component,
        source: &str,
        attribute: &Attribute,
    ) -> Option<(Quote, Value)> {
        let AttributeValue::Parts(parts) = attribute.value else {
            return None;
        };
        let parts = component.parts(parts);
        let (first, last) = (parts.first()?, parts.last()?);
        let dynamic = match attribute.kind {
            AttributeKind::Attribute | AttributeKind::Style if !attribute.shorthand => {
                matches!(parts, [Part::Expression { .. }])
            }
            AttributeKind::Bind
            | AttributeKind::Class
            | AttributeKind::On
            | AttributeKind::Use
            | AttributeKind::Transition { .. }
            | AttributeKind::Animate
            | AttributeKind::Let
                if !attribute.shorthand =>
            {
                true
            }
            _ => return None,
        };
        let start = part_span(first).start_offset;
        let end = part_span(last).end_offset;
        let value = if attribute.quoted {
            quoted(source, Span::new(start - 1, end + 1))
        } else {
            Value {
                range: Span::new(start, end),
                quote: Quote::Unquoted,
            }
        };
        if !dynamic {
            return Some((self.prefer, value));
        }
        let mustache = part_span(first).text(source);
        let prefer = if self.avoid_invalid_unquoted && !can_be_unquoted(mustache) {
            self.prefer
        } else {
            self.dynamic
        };
        Some((prefer, value))
    }

    fn verify(source: &str, prefer: Quote, value: Value, reporter: &mut Reporter<'_>) {
        if value.quote == prefer {
            return;
        }
        let mut expected = prefer;
        let message = if value.quote == Quote::Unquoted {
            let content = value.range.text(source);
            let (double, single) = (content.contains('"'), content.contains('\''));
            if double && single {
                return;
            }
            if double && expected == Quote::Double {
                expected = Quote::Single;
                "Expected to be enclosed by quotes.".to_owned()
            } else if single && expected == Quote::Single {
                expected = Quote::Double;
                "Expected to be enclosed by quotes.".to_owned()
            } else {
                format!("Expected to be enclosed by {}.", expected.name())
            }
        } else if expected == Quote::Unquoted {
            "Unexpected to be enclosed by any quotes.".to_owned()
        } else {
            let inner = Span::new(value.range.start_offset + 1, value.range.end_offset - 1);
            if inner.text(source).contains(expected.character()) {
                return;
            }
            format!("Expected to be enclosed by {}.", expected.name())
        };
        let (start, end) = (value.range.start_offset, value.range.end_offset);
        let mut fix = Fix::new();
        if value.quote == Quote::Unquoted {
            let quote = expected.character().to_string();
            fix.push(Span::new(start, start), quote.clone());
            fix.push(Span::new(end, end), quote);
        } else if expected == Quote::Unquoted {
            fix.push(Span::new(start, start + 1), "");
            fix.push(Span::new(end - 1, end), "");
        } else {
            let quote = expected.character().to_string();
            fix.push(Span::new(start, start + 1), quote.clone());
            fix.push(Span::new(end - 1, end), quote);
        }
        reporter.report(Report::range(message, value.range).fix(fix));
    }
}

const fn part_span(part: &Part) -> Span {
    match *part {
        Part::Text(span) | Part::Expression { span, .. } => span,
    }
}

/// No character that HTML forbids in an unquoted value.
fn can_be_unquoted(text: &str) -> bool {
    !text.contains(|c: char| {
        is_javascript_whitespace(c) || matches!(c, '"' | '\'' | '<' | '=' | '>' | '`')
    })
}
