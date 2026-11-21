use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet_syntax::nth_of_selectors;
use rsvelte_stylesheet_syntax::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple, StyleSheet};
use rustc_hash::{FxHashMap, FxHashSet};
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

mod template;

use template::{Occurrences, Selections, Template};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/consistent-selector-style",
    files: Files::Components,
    category: Category::Style,
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

impl SvelteRule for ConsistentSelectorStyle {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let Some(sheet) = super::shared::style_sheet::sheet(file) else {
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

/// The message to report, if any.
type Verdict = Option<&'static str>;

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
                        if self.rule.check_global || !simple.is_pseudo(source, &["global"]) =>
                    {
                        for selector in selectors {
                            self.selector(selector);
                        }
                        for selector in &nth_of_selectors(source, simple) {
                            self.selector(selector);
                        }
                    }
                    Simple::PseudoElement { selectors, .. } => {
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
        if let Some(message) = verdict {
            self.reporter.report(Report::range(message, span));
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
                    return Some("Selector should select by ID instead of class");
                }
                Style::Type if template.can_use_type(&selection) => {
                    return Some("Selector should select by element type instead of class");
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
                    return Some("Selector should select by class instead of ID");
                }
                Style::Id => return None,
                Style::Type if template.can_use_type(&selection) => {
                    return Some("Selector should select by element type instead of ID");
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
                    return Some("Selector should select by class instead of element type");
                }
                Style::Id if template.can_use_id(selection.iter().copied()) => {
                    return Some("Selector should select by ID instead of element type");
                }
                Style::Type => return None,
                Style::Id => {}
            }
        }
        None
    }
}
