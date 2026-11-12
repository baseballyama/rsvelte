//! eslint-plugin-vue's rules, and the core rules as they see a Vue component.
//!
//! One layer: the surface tree with its name resolution. The core `no-unused-variables` is
//! `rsvelte_typescript_lint`'s, unchanged: template expressions are scope roots, so a script
//! binding read only in the template is used (vue-eslint-parser marks such a variable used). It
//! judges only the script's bindings; the `v-for` aliases are `vue/no-unused-variables`' to report.

use oxc_ast::ast::{BindingIdentifier, FormalParameters};
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::catalog::{Leveled, all, levels};
use rsvelte_lint_runner::configuration::RuleLevels;
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;
use rsvelte_lint_runner::rule::{Reporter, Rule};
use rsvelte_markup_lint::button_type::{Allowed, Problem, check_static};
use rsvelte_markup_syntax::character_references::{Place, Rules, decode};
use rsvelte_vue_semantic::resolve::Resolution;
use rsvelte_vue_syntax::syntax_tree::{
    AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent, TemplateNode,
};
use rustc_hash::FxHashSet;

#[derive(Debug)]
pub(crate) struct RuleContext<'a> {
    pub c: &'a SingleFileComponent,
    pub source_text: &'a str,
    /// The document's path: some rules read the file name.
    pub path: &'a str,
    pub res: &'a Resolution,
}

pub(crate) type VueRule = dyn for<'a> Rule<RuleContext<'a>>;

/// A rule that runs, at its configured severity.
pub(crate) type Enabled = Leveled<'static, VueRule>;

/// In the oracle configuration's order: core rules, then the plugin's.
static RULES: &[&VueRule] = &[
    &NoUnusedVariables,
    &MarkupButtonHasType,
    &MultiWordComponentNames,
    &VueNoUnusedVariables,
];

/// # Errors
///
/// A rule failed.
pub(crate) fn lint(
    context: &RuleContext<'_>,
    rules: &[Enabled],
) -> Result<Vec<Finding>, Diagnostic> {
    let mut f = Findings::new();
    f.run(rules, context);
    f.finish()
}

/// Every rule at its own severity.
pub(crate) fn every_rule() -> Vec<Enabled> {
    all(RULES, Rule::severity)
}

/// The rules a `rules` object turns on; every rule at its own severity without one.
///
/// # Errors
///
/// A rule that is on is unknown or has options.
pub(crate) fn configure(rules: Option<RuleLevels>) -> Result<Vec<Enabled>, String> {
    levels(RULES, Rule::identifier, Rule::severity, rules)
}

#[derive(Debug)]
pub(crate) struct NoUnusedVariables;

impl<'a> Rule<RuleContext<'a>> for NoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, context: &RuleContext<'a>, reporter: &mut Reporter<'_>) {
        let aliases: FxHashSet<SymbolId> = aliases(context)
            .filter_map(|(binding, _)| binding.symbol_id.get())
            .collect();
        rsvelte_typescript_lint::no_unused_variables(
            context.res.semantic(),
            |symbol| !aliases.contains(&symbol),
            |_| &[],
            |_| None,
            reporter,
        );
    }
}

/// With the default options (no `ignorePattern`). The template has no component tags yet, so
/// upstream's `isUsedAsComponentTag` has nothing to find.
#[derive(Debug)]
pub(crate) struct VueNoUnusedVariables;

impl<'a> Rule<RuleContext<'a>> for VueNoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "vue/no-unused-vars"
    }

    fn check(&self, context: &RuleContext<'a>, reporter: &mut Reporter<'_>) {
        let scoping = context.res.scoping();
        // One group per directive kind; `v-for` is the only kind that declares yet.
        for parameters in loops(context) {
            let variables: Vec<_> = parameter_bindings(parameters).collect();
            let mut has_after_used = false;
            for &(binding, destructured) in variables.iter().rev() {
                let used = binding
                    .symbol_id
                    .get()
                    .is_some_and(|s| !scoping.get_resolved_reference_ids(s).is_empty());
                if used {
                    has_after_used = true;
                    continue;
                }
                if has_after_used && !destructured {
                    continue;
                }
                reporter.range(
                    format!("'{}' is defined but never used.", binding.name),
                    Span::new(binding.span.start, binding.span.end),
                );
            }
        }
    }
}

/// Each `v-for`'s aliases, as a parameter list.
fn loops<'c>(context: &RuleContext<'c>) -> impl Iterator<Item = &'c FormalParameters<'c>> {
    let (sfc, tree) = (context.c, context.res.tree());
    sfc.nodes
        .iter()
        .filter_map(move |n| match *n {
            TemplateNode::Element { attributes, .. } => Some(sfc.attributes(attributes)),
            _ => None,
        })
        .flatten()
        .filter_map(move |a| match &a.kind {
            AttributeKind::Directive(d) => match d.exp {
                DirectiveExpression::For(l) => Some(tree.get_parameters(l.parameters)),
                _ => None,
            },
            AttributeKind::Static => None,
        })
}

/// Every `v-for` alias binding, with whether it came from destructuring.
fn aliases<'c>(
    context: &RuleContext<'c>,
) -> impl Iterator<Item = (&'c BindingIdentifier<'c>, bool)> {
    loops(context).flat_map(parameter_bindings)
}

/// The bindings a parameter list declares, in order, each with whether it came from destructuring
/// (upstream `isDestructuringVariable`).
fn parameter_bindings<'p>(
    parameters: &'p FormalParameters<'p>,
) -> impl Iterator<Item = (&'p BindingIdentifier<'p>, bool)> {
    let items = parameters.items.iter().map(|p| &p.pattern);
    let rest = parameters.rest.iter().map(|r| &r.rest.argument);
    items.chain(rest).flat_map(|pattern| {
        let destructured = pattern.get_binding_identifier().is_none();
        pattern
            .get_binding_identifiers()
            .into_iter()
            .map(move |b| (b, destructured))
    })
}

/// With the default options, so the `forbiddenTypeAttribute` message cannot fire.
///
/// The judgement is [`rsvelte_markup_lint::button_type`]'s, shared with `svelte/button-has-type`;
/// what is Vue's is that a static `type` is looked for before a `:type`, and that a finding sits on
/// the value when there is one. Attribute names compare without case, as vue-eslint-parser
/// lowercases them in HTML. The parser refuses a directive without an expression, so upstream's
/// empty `:type` branch has no input yet.
#[derive(Debug)]
pub(crate) struct MarkupButtonHasType;

impl<'a> Rule<RuleContext<'a>> for MarkupButtonHasType {
    fn identifier(&self) -> &'static str {
        "vue/html-button-has-type"
    }

    fn check(&self, context: &RuleContext<'a>, reporter: &mut Reporter<'_>) {
        let (sfc, source_text) = (context.c, context.source_text);
        for n in &sfc.nodes {
            let TemplateNode::Element {
                name,
                attributes,
                start_tag,
                ..
            } = *n
            else {
                continue;
            };
            if name.text(source_text) != "button" {
                continue;
            }
            let attributes = sfc.attributes(attributes);
            let is_type = |s: Span| s.text(source_text).eq_ignore_ascii_case("type");
            let stat = attributes
                .iter()
                .find(|a| matches!(a.kind, AttributeKind::Static) && is_type(a.name));
            let mut report = |p: Problem<'_>, span| reporter.range(p.message(), span);
            if let Some(a) = stat {
                let Some(v) = a.value else {
                    report(Problem::Empty, a.span);
                    continue;
                };
                let text = decode(v.text(source_text), Place::Attribute, Rules::Specification);
                if let Some(p) = check_static(&text, Allowed::default()) {
                    report(p, value_node(v, a.quoted));
                }
            } else if !attributes.iter().any(|a| match &a.kind {
                AttributeKind::Directive(d) => {
                    d.name == DirectiveName::Bind && d.arg.is_some_and(is_type)
                }
                AttributeKind::Static => false,
            }) {
                report(Problem::Missing, start_tag);
            }
        }
    }
}

/// The value node's range, which vue-eslint-parser starts and ends on the quotes.
const fn value_node(v: Span, quoted: bool) -> Span {
    if quoted {
        Span::new(v.start_offset - 1, v.end_offset + 1)
    } else {
        v
    }
}

/// With the default options. A `<script setup>` component has no `name` option to read (the
/// parser has no `defineOptions`), so the name is always the file's.
#[derive(Debug)]
pub(crate) struct MultiWordComponentNames;

/// eslint-plugin-vue's `VUE3_BUILTIN_COMPONENT_NAMES`.
const BUILTIN: &[&str] = &[
    "template",
    "slot",
    "component",
    "Component",
    "transition",
    "Transition",
    "transition-group",
    "TransitionGroup",
    "keep-alive",
    "KeepAlive",
    "teleport",
    "Teleport",
    "suspense",
    "Suspense",
];

/// eslint-plugin-vue's `casing.kebabCase`: `_` → `-`, `-` before each capital not at a word start.
fn kebab_case(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 4);
    let mut prev_word = false;
    for c in s.chars() {
        if c.is_ascii_uppercase() && prev_word {
            out.push('-');
        }
        out.push(if c == '_' {
            '-'
        } else {
            c.to_ascii_lowercase()
        });
        // `\w` is ASCII, and `_` is already `-` when the regex runs.
        prev_word = c.is_ascii_alphanumeric();
    }
    out
}

impl<'a> Rule<RuleContext<'a>> for MultiWordComponentNames {
    fn identifier(&self) -> &'static str {
        "vue/multi-word-component-names"
    }

    fn check(&self, context: &RuleContext<'a>, reporter: &mut Reporter<'_>) {
        let file = context.path.rsplit('/').next().unwrap_or(context.path);
        let name = file.rfind('.').map_or(file, |i| &file[..i]);
        let valid = matches!(name, "App" | "app")
            || BUILTIN.contains(&name)
            || kebab_case(name).split('-').count() > 1;
        if !valid {
            reporter.point(
                format!("Component name \"{name}\" should always be multi-word."),
                0,
            );
        }
    }
}

#[cfg(test)]
mod tests;
