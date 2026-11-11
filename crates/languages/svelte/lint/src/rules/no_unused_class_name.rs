use rsvelte_kernel::source::characters::split_ecmascript_whitespace;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_stylesheet_syntax::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple, StyleSheet};
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, TemplateNode};
use rustc_hash::FxHashSet;
use serde::Deserialize;

use super::element_kind::{ElementKind, element_kind};
use super::style_sheet::{StyleVerdict, verdict};
use crate::Pattern;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-unused-class-name",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    allowed_class_names: Vec<String>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoUnusedClassName {
        allowed: options
            .allowed_class_names
            .iter()
            .map(|name| Pattern::new(name))
            .collect::<Result<_, _>>()?,
    }))
}

#[derive(Debug)]
struct NoUnusedClassName {
    allowed: Vec<Pattern>,
}

impl SvelteRule for NoUnusedClassName {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let mut used = FxHashSet::default();
        match verdict(file) {
            StyleVerdict::Error(_) | StyleVerdict::UnknownLanguage(_) => return,
            StyleVerdict::NoStyle => {}
            StyleVerdict::Parsed => {
                // `PostCSS` reads a sheet rsvelte's parser does not: its classes are unknown.
                let Some(Ok(sheet)) = component.style.as_ref().map(|s| &s.sheet) else {
                    return;
                };
                for rule in &sheet.rules {
                    rule_classes(sheet, source, rule, &mut used);
                }
            }
        }
        for node in &component.nodes {
            let TemplateNode::Element {
                attributes,
                start_tag,
                ..
            } = node
            else {
                continue;
            };
            if element_kind(node, source) != Some(ElementKind::Markup) {
                continue;
            }
            for attribute in component.attributes(*attributes) {
                let mut report = |name: &str| {
                    if !used.contains(name) && !self.allowed.iter().any(|p| p.matches(name)) {
                        reporter.range(format!("Unused class \"{name}\"."), *start_tag);
                    }
                };
                match attribute.kind {
                    AttributeKind::Class => report(
                        attribute
                            .directive_name(&component.modifiers)
                            .expect("a directive has a name")
                            .text(source),
                    ),
                    AttributeKind::Attribute
                        if !attribute.shorthand && attribute.name.text(source) == "class" =>
                    {
                        let AttributeValue::Parts(parts) = attribute.value else {
                            continue;
                        };
                        for part in component.parts(parts) {
                            if let Part::Text(span) = part {
                                for name in split_ecmascript_whitespace(
                                    &rsvelte_markup_syntax::decode_attribute(span.text(source)),
                                ) {
                                    report(name);
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
    }
}

fn rule_classes<'a>(
    sheet: &'a StyleSheet,
    source: &'a str,
    rule: &Rule,
    out: &mut FxHashSet<&'a str>,
) {
    if let RuleKind::Style { selectors, .. } = &rule.kind {
        for selector in selectors {
            selector_classes(sheet, source, selector, out);
        }
    }
    for child in &rule.children {
        rule_classes(sheet, source, child, out);
    }
}

fn selector_classes<'a>(
    sheet: &'a StyleSheet,
    source: &'a str,
    selector: &ComplexSelector,
    out: &mut FxHashSet<&'a str>,
) {
    for part in &selector.parts {
        for simple in &part.simple {
            match simple {
                Simple::Class { name, .. } => {
                    out.insert(sheet.text(*name, source));
                }
                Simple::PseudoClass { selectors, .. } | Simple::PseudoElement { selectors, .. } => {
                    for selector in selectors {
                        selector_classes(sheet, source, selector, out);
                    }
                }
                _ => {}
            }
        }
    }
}
