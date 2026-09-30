//! eslint-plugin-vue's rules, and the core rules as they see a Vue component.
//!
//! One layer: the surface tree with its name resolution. The core `no-unused-vars` is
//! `rsv_js`'s, unchanged: template expressions are scope roots, so a script binding read only in
//! the template is used (vue-eslint-parser marks such a variable used). It judges only the
//! script's bindings; the `v-for` aliases are `vue/no-unused-vars`' to report.

use rsv_js::lint::JsFacts;
use rsv_js::scope::{DeclKind, HostRoot};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::lint::{Findings, Rule};
use rsv_kernel::source::Span;

use crate::ast::Sfc;
use crate::resolve::Resolution;

#[derive(Debug)]
pub struct Cx<'a> {
    pub c: &'a Sfc,
    pub src: &'a str,
    /// The document's path: some rules read the file name.
    pub path: &'a str,
    pub res: &'a Resolution,
    pub js: JsFacts<'a>,
}

type VueRule = dyn for<'a> Rule<Cx<'a>>;

/// In the oracle configuration's order: core rules, then the plugin's.
static RULES: &[&VueRule] = &[&NoUnusedVars, &MultiWordComponentNames, &VueNoUnusedVars];

#[must_use]
pub fn lint(cx: &Cx<'_>) -> Vec<Diagnostic> {
    let mut f = Findings::new();
    f.run::<Cx<'_>>(RULES, cx);
    f.finish()
}

pub fn rule_ids() -> impl Iterator<Item = &'static str> {
    RULES.iter().map(|r| r.id())
}

#[derive(Debug)]
pub struct NoUnusedVars;

impl<'a> Rule<Cx<'a>> for NoUnusedVars {
    fn id(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, cx: &Cx<'a>, out: &mut Vec<Diagnostic>) {
        let sem = &cx.res.sem;
        rsv_js::lint::no_unused_vars(
            &cx.js,
            self.id(),
            |b| sem.bindings[b].kind != DeclKind::Host,
            out,
        );
    }
}

/// With the default options (no `ignorePattern`). The template has no component tags yet, so
/// upstream's `isUsedAsComponentTag` has nothing to find.
#[derive(Debug)]
pub struct VueNoUnusedVars;

impl<'a> Rule<Cx<'a>> for VueNoUnusedVars {
    fn id(&self) -> &'static str {
        "vue/no-unused-vars"
    }

    fn check(&self, cx: &Cx<'a>, out: &mut Vec<Diagnostic>) {
        let mut stack: Vec<&HostRoot> = cx.res.host.iter().rev().collect();
        while let Some(r) = stack.pop() {
            let HostRoot::Scope(h) = r else { continue };
            // One group per directive kind; `v-for` is the only kind that declares yet.
            let vars: Vec<_> = h
                .params
                .iter()
                .flat_map(|&p| pattern_bindings(cx, p))
                .collect();
            let mut has_after_used = false;
            for &(b, destructured) in vars.iter().rev() {
                if cx.res.sem.references_to(b).next().is_some() {
                    has_after_used = true;
                    continue;
                }
                if has_after_used && !destructured {
                    continue;
                }
                let id = cx.res.sem.bindings[b].node;
                out.push(Diagnostic::error(
                    self.id(),
                    format!("'{}' is defined but never used.", cx.c.js.name(id)),
                    cx.js
                        .ast
                        .loc(id)
                        .span()
                        .expect("a parsed alias has a range"),
                ));
            }
            stack.extend(h.body.iter().rev());
        }
    }
}

/// The bindings a `v-for` alias declares, in order, each with whether it came from destructuring
/// (upstream `isDestructuringVar`).
fn pattern_bindings(cx: &Cx<'_>, p: rsv_js::NodeId) -> Vec<(rsv_js::scope::BindingId, bool)> {
    let ast = cx.js.ast;
    let mut out = Vec::new();
    let mut stack = vec![(p, false)];
    while let Some((n, destructured)) = stack.pop() {
        if matches!(ast.kind(n), rsv_js::Kind::Ident(_)) {
            if let Some(b) = cx.res.sem.binding_of(n) {
                out.push((b, destructured));
            }
            continue;
        }
        let mut kids = Vec::new();
        ast.for_each_child(n, |k| kids.push(k));
        let inner = destructured
            || matches!(
                ast.kind(n),
                rsv_js::Kind::ObjectPat(_) | rsv_js::Kind::ArrayPat(_)
            );
        stack.extend(kids.into_iter().rev().map(|k| (k, inner)));
    }
    out
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

impl<'a> Rule<Cx<'a>> for MultiWordComponentNames {
    fn id(&self) -> &'static str {
        "vue/multi-word-component-names"
    }

    fn check(&self, cx: &Cx<'a>, out: &mut Vec<Diagnostic>) {
        let file = cx.path.rsplit('/').next().unwrap_or(cx.path);
        let name = file.rfind('.').map_or(file, |i| &file[..i]);
        let valid = matches!(name, "App" | "app")
            || BUILTIN.contains(&name)
            || kebab_case(name).split('-').count() > 1;
        if !valid {
            out.push(
                Diagnostic::error(
                    self.id(),
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
