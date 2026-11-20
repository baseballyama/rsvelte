//! The names svue adds to the component and the runtime helpers it imports.

use oxc_ast::ast::{BindingIdentifier, IdentifierName, IdentifierReference, Statement};
use oxc_ast_visit::Visit;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_vue_semantic::compiler_syntax_tree::{CompilerSyntaxTree, PropertyKind};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, SingleFileComponent};
use rustc_hash::FxHashSet;

/// A runtime export the output imports.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Helper {
    ToDisplayString,
    NormalizeClass,
    RenderList,
    WithModifiers,
    WithKeys,
    VModelText,
    VModelCheckbox,
    VModelRadio,
    VModelSelect,
    Untrack,
    OnMount,
    SsrLooseEqual,
    SsrLooseContain,
    SsrIncludeBooleanAttribute,
}

impl Helper {
    const fn module(self) -> &'static str {
        match self {
            Self::Untrack | Self::OnMount => "svelte",
            Self::SsrLooseEqual | Self::SsrLooseContain | Self::SsrIncludeBooleanAttribute => {
                "vue/server-renderer"
            }
            _ => "vue",
        }
    }

    const fn export(self) -> &'static str {
        match self {
            Self::ToDisplayString => "toDisplayString",
            Self::NormalizeClass => "normalizeClass",
            Self::RenderList => "renderList",
            Self::WithModifiers => "withModifiers",
            Self::WithKeys => "withKeys",
            Self::VModelText => "vModelText",
            Self::VModelCheckbox => "vModelCheckbox",
            Self::VModelRadio => "vModelRadio",
            Self::VModelSelect => "vModelSelect",
            Self::Untrack => "untrack",
            Self::OnMount => "onMount",
            Self::SsrLooseEqual => "ssrLooseEqual",
            Self::SsrLooseContain => "ssrLooseContain",
            Self::SsrIncludeBooleanAttribute => "ssrIncludeBooleanAttr",
        }
    }
}

/// The names svue adds to the component, none of which the document spells.
#[derive(Debug)]
pub(crate) struct Names<'v> {
    /// Every identifier the document's JavaScript spells.
    spelled: FxHashSet<&'v str>,
    taken: FxHashSet<String>,
    helpers: Vec<(Helper, String)>,
}

/// Collects every name a tree spells: references, bindings and property names.
struct Spelled<'n, 'v>(&'n mut FxHashSet<&'v str>);

impl<'v> Visit<'v> for Spelled<'_, 'v> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'v>) {
        self.0.insert(it.name.as_str());
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'v>) {
        self.0.insert(it.name.as_str());
    }

    fn visit_identifier_name(&mut self, it: &IdentifierName<'v>) {
        self.0.insert(it.name.as_str());
    }
}

impl<'v> Names<'v> {
    /// The names of the script, of every template expression and of every `v-for` alias.
    pub(crate) fn new(sfc: &'v SingleFileComponent, cst: Option<&CompilerSyntaxTree>) -> Self {
        let tree = &sfc.javascript;
        let mut spelled = FxHashSet::default();
        let mut visit = Spelled(&mut spelled);
        visit.visit_program(tree.get_program(sfc.program));
        for (_, e) in tree.expressions() {
            visit.visit_expression(e);
        }
        for p in cst.iter().flat_map(|c| c.props.iter()) {
            if let PropertyKind::Directive(d) = &p.kind
                && let DirectiveExpression::For(f) = d.exp
            {
                visit.visit_formal_parameters(tree.get_parameters(f.parameters));
            }
        }
        Self {
            spelled,
            taken: FxHashSet::default(),
            helpers: Vec::new(),
        }
    }

    /// `base`, or `base_1`, `base_2`, … : the first no identifier of the document spells and svue
    /// has not handed out.
    pub(crate) fn fresh(&mut self, base: &str) -> String {
        let mut name = base.to_owned();
        let mut i = 0;
        while self.spelled.contains(name.as_str()) || self.taken.contains(&name) {
            i += 1;
            name = format!("{base}_{i}");
        }
        self.taken.insert(name.clone());
        name
    }

    /// Hands out `name` itself, which the caller knows no identifier of the document spells.
    pub(crate) fn reserve(&mut self, name: &str) {
        self.taken.insert(name.to_owned());
    }

    /// The local name of `h`, imported once.
    pub(crate) fn helper(&mut self, h: Helper) -> String {
        if let Some((_, local)) = self.helpers.iter().find(|(x, _)| *x == h) {
            return local.clone();
        }
        let local = self.fresh(h.export());
        self.helpers.push((h, local.clone()));
        local
    }

    /// One import per module, in the order the helpers were first used.
    pub(crate) fn imports<'a>(&self, b: &Builder<'a>) -> Vec<Statement<'a>> {
        let mut modules: Vec<&str> = Vec::new();
        for (h, _) in &self.helpers {
            if !modules.contains(&h.module()) {
                modules.push(h.module());
            }
        }
        modules
            .into_iter()
            .map(|m| {
                let specifiers = self
                    .helpers
                    .iter()
                    .filter(|(h, _)| h.module() == m)
                    .map(|(h, local)| (h.export(), local.as_str()));
                b.import(specifiers, m)
            })
            .collect()
    }
}
