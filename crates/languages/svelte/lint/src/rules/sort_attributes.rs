use std::borrow::Cow;
use std::cmp::Ordering;

use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{AttributeKind, Component};
use serde::Deserialize;

use super::tags::{TagAttribute, is_special_this, start_tags};
use crate::Pattern;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/sort-attributes",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    order: Option<Vec<OrderOption>>,
    /// In the schema, but read by nothing.
    #[serde(rename = "alphabetical")]
    _alphabetical: Option<bool>,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum OrderOption {
    One(String),
    Many(Vec<String>),
    Group { r#match: Matcher, sort: Sort },
}

#[derive(Deserialize)]
#[serde(untagged)]
enum Matcher {
    One(String),
    Many(Vec<String>),
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Sort {
    Alphabetical,
    Ignore,
}

/// One group of the order: patterns (`!` negates one) and whether its members are sorted.
#[derive(Debug)]
struct Group {
    patterns: Vec<(bool, Pattern)>,
    sort: Sort,
}

impl Group {
    fn new(patterns: &[String], sort: Sort) -> Result<Self, String> {
        let patterns = patterns
            .iter()
            .map(|p| match p.strip_prefix('!') {
                Some(rest) => Ok((true, Pattern::new(rest)?)),
                None => Ok((false, Pattern::new(p)?)),
            })
            .collect::<Result<_, String>>()?;
        Ok(Self { patterns, sort })
    }

    /// A leading negative pattern starts from a match; each later pattern can only flip it.
    fn matches(&self, key: &str) -> bool {
        let mut result = self.patterns.first().is_some_and(|(negative, _)| *negative);
        for (negative, pattern) in &self.patterns {
            if result == *negative && pattern.matches(key) {
                result = !negative;
            }
        }
        result
    }
}

const DEFAULT_ORDER: &[(&[&str], Sort)] = &[
    (&["this"], Sort::Ignore),
    (&["bind:this"], Sort::Ignore),
    (&["id"], Sort::Ignore),
    (&["name"], Sort::Ignore),
    (&["slot"], Sort::Ignore),
    (&["/^--/u"], Sort::Alphabetical),
    (&["style", "/^style:/u"], Sort::Ignore),
    (&["class"], Sort::Ignore),
    (&["/^class:/u"], Sort::Alphabetical),
    (
        &["!/:/u", "!/^(?:this|id|name|style|class)$/u", "!/^--/u"],
        Sort::Alphabetical,
    ),
    (&["/^bind:/u", "!bind:this", "/^on:/u"], Sort::Ignore),
    (&["/^use:/u"], Sort::Alphabetical),
    (&["/^transition:/u"], Sort::Alphabetical),
    (&["/^in:/u"], Sort::Alphabetical),
    (&["/^out:/u"], Sort::Alphabetical),
    (&["/^animate:/u"], Sort::Alphabetical),
    (&["/^let:/u"], Sort::Alphabetical),
];

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    let groups = match options.order {
        None => DEFAULT_ORDER
            .iter()
            .map(|(patterns, sort)| {
                let patterns: Vec<String> = patterns.iter().map(|&p| p.to_owned()).collect();
                Group::new(&patterns, *sort)
            })
            .collect::<Result<_, _>>()?,
        Some(order) => order
            .iter()
            .map(|option| match option {
                OrderOption::One(p) => Group::new(std::slice::from_ref(p), Sort::Ignore),
                OrderOption::Many(ps) => Group::new(ps, Sort::Ignore),
                OrderOption::Group { r#match, sort } => match r#match {
                    Matcher::One(p) => Group::new(std::slice::from_ref(p), *sort),
                    Matcher::Many(ps) => Group::new(ps, *sort),
                },
            })
            .collect::<Result<_, _>>()?,
    };
    Ok(Box::new(SortAttributes { groups }))
}

#[derive(Debug)]
struct SortAttributes {
    groups: Vec<Group>,
}

/// An attribute with its key and the first group that matches it; `None` is a spread.
struct Keyed<'a> {
    attribute: TagAttribute<'a>,
    key: Cow<'a, str>,
    group: Option<usize>,
    spread: bool,
    plain: bool,
}

impl SvelteRule for SortAttributes {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for tag in start_tags(component) {
            let element = tag.name.text(source);
            let attributes: Vec<Keyed<'_>> = tag
                .attributes(&component.tokens)
                .map(|attribute| {
                    let key = key_text(component, source, attribute);
                    let group = self.groups.iter().position(|g| g.matches(&key));
                    let template = attribute.template;
                    Keyed {
                        attribute,
                        key,
                        group,
                        spread: template.is_some_and(|a| a.kind == AttributeKind::Spread),
                        plain: template.is_none_or(|a| {
                            a.kind == AttributeKind::Attribute
                                && !a.shorthand
                                && !is_special_this(component, source, element, a)
                        }),
                    }
                })
                .collect();
            self.check_tag(&attributes, source, reporter);
        }
    }
}

impl SortAttributes {
    /// `a` goes after `b`; both are in a group.
    fn after(&self, a: &Keyed<'_>, b: &Keyed<'_>) -> bool {
        let (ga, gb) = (a.group.expect("ordered"), b.group.expect("ordered"));
        match ga.cmp(&gb) {
            Ordering::Equal => {
                self.groups[ga].sort == Sort::Alphabetical
                    && a.key.encode_utf16().cmp(b.key.encode_utf16()) == Ordering::Greater
            }
            ordering => ordering == Ordering::Greater,
        }
    }

    fn check_tag(&self, attributes: &[Keyed<'_>], source: &str, reporter: &mut Reporter<'_>) {
        // Each kept attribute goes after every one before it, so the list stays sorted.
        let mut valid: Vec<usize> = Vec::new();
        // Since the last spread, each attribute that goes after every one before it: the first
        // attribute there that goes after another is one of them.
        let mut since_spread: Vec<usize> = Vec::new();
        let mut last_spread = None;
        for (index, attribute) in attributes.iter().enumerate() {
            if attribute.spread {
                last_spread = Some(index);
                since_spread.clear();
                continue;
            }
            if attribute.group.is_none() {
                continue;
            }
            let later = since_spread.partition_point(|&p| !self.after(&attributes[p], attribute));
            let later_since_spread = since_spread.get(later).copied();
            if later_since_spread.is_none() {
                since_spread.push(index);
            }
            let first = valid.partition_point(|&p| !self.after(&attributes[p], attribute));
            let Some(&previous) = valid.get(first) else {
                valid.push(index);
                continue;
            };
            let spread_between = last_spread.is_some_and(|spread| spread > previous);
            if !attribute.plain || !spread_between {
                report(attributes, previous, index, source, reporter);
            } else if let Some(previous) = later_since_spread {
                report(attributes, previous, index, source, reporter);
            }
        }
    }
}

/// Moves the attribute at `index` before the one at `previous`.
fn report(
    attributes: &[Keyed<'_>],
    previous: usize,
    index: usize,
    source: &str,
    reporter: &mut Reporter<'_>,
) {
    let (node, before) = (&attributes[index], &attributes[previous]);
    let mut fix = Fix::new();
    let text = |i: usize| attributes[i].attribute.span.text(source);
    fix.push(before.attribute.span, text(index));
    for (i, moved) in attributes
        .iter()
        .enumerate()
        .take(index + 1)
        .skip(previous + 1)
    {
        fix.push(moved.attribute.span, text(i - 1));
    }
    reporter.report(
        Report::range(
            format!(
                "Attribute '{}' should go before '{}'.",
                node.key, before.key
            ),
            node.attribute.span,
        )
        .fix(fix),
    );
}

/// eslint-plugin-svelte's `getAttributeKeyText`.
fn key_text<'a>(
    component: &Component,
    source: &'a str,
    attribute: TagAttribute<'a>,
) -> Cow<'a, str> {
    let Some(template) = attribute.template else {
        return Cow::Borrowed(attribute.key.text(source));
    };
    match template.kind {
        AttributeKind::Attach => Cow::Borrowed("@attach"),
        AttributeKind::Style => {
            let name = template
                .directive_name(&component.modifiers)
                .expect("a directive");
            Cow::Owned(format!("style:{}", name.text(source)))
        }
        _ => Cow::Borrowed(template.name.text(source)),
    }
}
