//! eslint-plugin-vue's rules, and the core rules as they see a Vue component.
//!
//! One layer: the surface tree with its name resolution. The core `no-unused-variables` is
//! `rsvelte_typescript`'s, unchanged: template expressions are scope roots, so a script binding
//! read only in the template is used (vue-eslint-parser marks such a variable used). It judges only
//! the script's bindings; the `v-for` aliases are `vue/no-unused-variables`' to report.

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint::rules::{Findings, Rule};
use rsvelte_markup::button_type::{Allowed, Problem, check_static};
use rsvelte_typescript::scope::{DeclarationKind, HostRoot};
use rsvelte_typescript_lint::JavaScriptFacts;
use rsvelte_vue::resolve::Resolution;
use rsvelte_vue::syntax_tree::{AttributeKind, DirectiveName, SingleFileComponent, TemplateNode};

#[derive(Debug)]
pub struct RuleContext<'a> {
    pub c: &'a SingleFileComponent,
    pub source_text: &'a str,
    /// The document's path: some rules read the file name.
    pub path: &'a str,
    pub res: &'a Resolution,
    pub javascript: JavaScriptFacts<'a>,
}

type VueRule = dyn for<'a> Rule<RuleContext<'a>>;

/// In the oracle configuration's order: core rules, then the plugin's.
static RULES: &[&VueRule] = &[
    &NoUnusedVariables,
    &MarkupButtonHasType,
    &MultiWordComponentNames,
    &VueNoUnusedVariables,
];

#[must_use]
pub fn lint(context: &RuleContext<'_>) -> Vec<Diagnostic> {
    let mut f = Findings::new();
    f.run::<RuleContext<'_>>(RULES, context);
    f.finish()
}

pub fn rule_identifiers() -> impl Iterator<Item = &'static str> {
    RULES.iter().map(|r| r.identifier())
}

#[derive(Debug)]
pub struct NoUnusedVariables;

impl<'a> Rule<RuleContext<'a>> for NoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, context: &RuleContext<'a>, out: &mut Vec<Diagnostic>) {
        let sem = &context.res.sem;
        rsvelte_typescript_lint::no_unused_variables(
            &context.javascript,
            self.identifier(),
            |b| sem.bindings[b].kind != DeclarationKind::Host,
            out,
        );
    }
}

/// With the default options (no `ignorePattern`). The template has no component tags yet, so
/// upstream's `isUsedAsComponentTag` has nothing to find.
#[derive(Debug)]
pub struct VueNoUnusedVariables;

impl<'a> Rule<RuleContext<'a>> for VueNoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "vue/no-unused-vars"
    }

    fn check(&self, context: &RuleContext<'a>, out: &mut Vec<Diagnostic>) {
        let mut stack: Vec<&HostRoot> = context.res.host.iter().rev().collect();
        while let Some(r) = stack.pop() {
            let HostRoot::Scope(h) = r else { continue };
            // One group per directive kind; `v-for` is the only kind that declares yet.
            let variables: Vec<_> = h
                .parameters
                .iter()
                .flat_map(|&p| pattern_bindings(context, p))
                .collect();
            let mut has_after_used = false;
            for &(b, destructured) in variables.iter().rev() {
                if context.res.sem.references_to(b).next().is_some() {
                    has_after_used = true;
                    continue;
                }
                if has_after_used && !destructured {
                    continue;
                }
                let identifier = context.res.sem.bindings[b].node;
                out.push(Diagnostic::error(
                    self.identifier(),
                    format!(
                        "'{}' is defined but never used.",
                        context.c.javascript.name(identifier)
                    ),
                    context
                        .javascript
                        .syntax_tree
                        .source_location(identifier)
                        .span()
                        .expect("a parsed alias has a range"),
                ));
            }
            stack.extend(h.body.iter().rev());
        }
    }
}

/// The bindings a `v-for` alias declares, in order, each with whether it came from destructuring
/// (upstream `isDestructuringVariable`).
fn pattern_bindings(
    context: &RuleContext<'_>,
    p: rsvelte_typescript::NodeIdentifier,
) -> Vec<(rsvelte_typescript::scope::BindingIdentifier, bool)> {
    let syntax_tree = context.javascript.syntax_tree;
    let mut out = Vec::new();
    let mut stack = vec![(p, false)];
    while let Some((n, destructured)) = stack.pop() {
        if matches!(syntax_tree.kind(n), rsvelte_typescript::Kind::Identifier(_)) {
            if let Some(b) = context.res.sem.binding_of(n) {
                out.push((b, destructured));
            }
            continue;
        }
        let mut children = Vec::new();
        syntax_tree.for_each_child(n, |k| children.push(k));
        let inner = destructured
            || matches!(
                syntax_tree.kind(n),
                rsvelte_typescript::Kind::ObjectPattern(_)
                    | rsvelte_typescript::Kind::ArrayPattern(_)
            );
        stack.extend(children.into_iter().rev().map(|k| (k, inner)));
    }
    out
}

/// With the default options, so the `forbiddenTypeAttribute` message cannot fire.
///
/// The judgement is [`rsvelte_markup::button_type`]'s, shared with `svelte/button-has-type`; what
/// is Vue's is that a static `type` is looked for before a `:type`, and that a finding sits on the
/// value when there is one. Attribute names compare without case, as vue-eslint-parser lowercases
/// them in HTML. The parser refuses a directive without an expression, so upstream's empty `:type`
/// branch has no input yet.
#[derive(Debug)]
pub struct MarkupButtonHasType;

impl<'a> Rule<RuleContext<'a>> for MarkupButtonHasType {
    fn identifier(&self) -> &'static str {
        "vue/html-button-has-type"
    }

    fn check(&self, context: &RuleContext<'a>, out: &mut Vec<Diagnostic>) {
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
            let mut report = |p: Problem<'_>, span| {
                out.push(Diagnostic::error(self.identifier(), p.message(), span));
            };
            if let Some(a) = stat {
                let Some(v) = a.value else {
                    report(Problem::Empty, a.span);
                    continue;
                };
                let text = rsvelte_markup::decode_text(v.text(source_text));
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
pub struct MultiWordComponentNames;

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

    fn check(&self, context: &RuleContext<'a>, out: &mut Vec<Diagnostic>) {
        let file = context.path.rsplit('/').next().unwrap_or(context.path);
        let name = file.rfind('.').map_or(file, |i| &file[..i]);
        let valid = matches!(name, "App" | "app")
            || BUILTIN.contains(&name)
            || kebab_case(name).split('-').count() > 1;
        if !valid {
            out.push(
                Diagnostic::error(
                    self.identifier(),
                    format!("Component name \"{name}\" should always be multi-word."),
                    Span::new(0, 0),
                )
                .without_end(),
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::kebab_case;

    #[test]
    fn kebab_case_splits_words_like_upstream() {
        assert_eq!(kebab_case("TodoItem"), "todo-item");
        assert_eq!(kebab_case("todo_item"), "todo-item");
        assert_eq!(kebab_case("counter"), "counter");
        // `\B` before a capital: none at the start, none after `-`.
        assert_eq!(kebab_case("A-B"), "a-b");
    }
}
