//! What the script and the template translations share: the names svue adds, the runtime helpers
//! it imports, and the rewrite every user expression goes through.

use oxc_ast::ast::{
    BindingIdentifier, Expression, IdentifierName, IdentifierReference, ImportDeclarationSpecifier,
    ImportOrExportKind, ModuleExportName, Statement, StringLiteral,
};
use oxc_ast_visit::Visit;
use oxc_semantic::SymbolId;
use oxc_span::SPAN;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_compile::Target;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::Tree;
use rsvelte_vue_semantic::compiler_syntax_tree::{CompilerSyntaxTree, PropertyKind};
use rsvelte_vue_semantic::resolve::Resolution;
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, SingleFileComponent};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::Translation;

pub(crate) type R<T> = Result<T, Diagnostic>;

pub(crate) fn unsupported(what: impl std::fmt::Display, span: Span) -> Diagnostic {
    Diagnostic::error(
        "compile_unsupported",
        format!("not supported by svue: {what}"),
        span,
    )
}

/// A span of the Vue tree, which is the document's, as the kernel holds it.
pub(crate) const fn span_of(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

/// A document span on an output node, which the source map points back to.
pub(crate) const fn output_span(span: Span) -> oxc_span::Span {
    oxc_span::Span::new(span.start_offset, span.end_offset)
}

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
                let specifiers =
                    self.helpers
                        .iter()
                        .filter(|(h, _)| h.module() == m)
                        .map(|(h, local)| {
                            ImportDeclarationSpecifier::new_import_specifier(
                                SPAN,
                                ModuleExportName::new_identifier_name(SPAN, b.str(h.export()), b),
                                BindingIdentifier::new(SPAN, b.str(local), b),
                                ImportOrExportKind::Value,
                                b,
                            )
                        });
                Statement::new_import_declaration(
                    SPAN,
                    Some(b.vec(specifiers)),
                    StringLiteral::new(SPAN, b.str(m), None, b),
                    None,
                    None,
                    ImportOrExportKind::Value,
                    b,
                )
            })
            .collect()
    }
}

/// What a script binding becomes.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Class {
    /// `const x = ref(…)`: a `$state`, read and written through `.value` in the script.
    Ref,
    /// `const x = computed(…)`: a `$derived.by`, read through `.value` in the script.
    Computed,
    /// `const x = reactive(…)`: a `$state` proxy, used as is.
    Reactive,
    /// `const props = defineProps(…)`: read only as `props.<declared prop>`.
    Props,
    /// An import from `vue`: the API's name.
    Vue(&'static str),
}

/// A prop `defineProps` declares.
#[derive(Debug)]
pub(crate) struct Prop<'v> {
    pub(crate) key: String,
    /// The Svelte variable holding Vue's resolved value.
    pub(crate) var: String,
    /// `Some(cast_true)` for a `Boolean` prop: absent is `false`, and with `cast_true` the empty
    /// string or the key itself is `true` (`resolvePropValue`).
    pub(crate) boolean: Option<bool>,
    /// A literal.
    pub(crate) default: Option<&'v Expression<'v>>,
    /// Every declared type is a primitive's constructor.
    pub(crate) primitive: bool,
}

/// How the script declares one of its top-level names.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Declared {
    Let,
    Var,
    Const,
    Function,
    Class,
    Import,
}

/// A top-level declaration of the script.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Top<'v> {
    pub(crate) declared: Declared,
    /// The initializer of a declarator that declares only this name.
    pub(crate) initializer: Option<&'v Expression<'v>>,
}

/// What the translation knows about the script before translating anything.
#[derive(Debug)]
pub(crate) struct Info<'v> {
    pub(crate) from: &'v Tree,
    pub(crate) source_text: &'v str,
    pub(crate) resolution: &'v Resolution,
    pub(crate) target: Target,
    /// `<script setup lang="ts">`: every copied node may carry types to erase.
    pub(crate) typescript: bool,
    pub(crate) class: FxHashMap<SymbolId, Class>,
    pub(crate) props: Vec<Prop<'v>>,
    pub(crate) top: FxHashMap<SymbolId, Top<'v>>,
}

impl<'v> Info<'v> {
    pub(crate) fn symbol(&self, identifier: &IdentifierReference<'_>) -> Option<SymbolId> {
        // A reference the resolver did not visit resolves to nothing, as a global does.
        identifier
            .reference_id
            .get()
            .and_then(|r| self.resolution.symbol_of(r))
    }

    pub(crate) fn class_of(&self, identifier: &IdentifierReference<'_>) -> Option<Class> {
        self.class.get(&self.symbol(identifier)?).copied()
    }

    /// The class of `e`, if it is a name.
    pub(crate) fn class_of_expression(&self, e: &Expression<'_>) -> Option<Class> {
        match e {
            Expression::Identifier(identifier) => self.class_of(identifier),
            _ => None,
        }
    }

    pub(crate) fn prop(&self, key: &str) -> Option<&Prop<'v>> {
        self.props.iter().find(|p| p.key == key)
    }

    /// Whether `symbol` is declared at the script's top level, where the template's names resolve.
    pub(crate) fn is_top_level(&self, symbol: SymbolId) -> bool {
        self.resolution.scoping().symbol_scope_id(symbol) == self.resolution.root_scope()
    }

    pub(crate) fn is_written(&self, symbol: SymbolId) -> bool {
        self.resolution
            .scoping()
            .get_resolved_references(symbol)
            .any(oxc_semantic::Reference::is_write)
    }

    pub(crate) fn is_read(&self, identifier: &IdentifierReference<'_>) -> bool {
        identifier
            .reference_id
            .get()
            .is_some_and(|r| self.resolution.scoping().get_reference(r).is_read())
    }
}

/// compiler-sfc `canNeverBeRef` without `reactive`: a value no template unwraps.
pub(crate) fn can_never_be_ref(e: &Expression<'_>) -> bool {
    match e {
        Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_)
        | Expression::ArrayExpression(_)
        | Expression::ObjectExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::UpdateExpression(_)
        | Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::TemplateLiteral(_) => true,
        Expression::SequenceExpression(s) => s.expressions.last().is_some_and(can_never_be_ref),
        _ => false,
    }
}

mod rewrite;

mod translate;
pub(crate) use rewrite::Rewriter;
pub(crate) use translate::translate;
