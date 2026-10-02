//! What the script and the template translations share: the names svue adds, the runtime helpers
//! it imports, and the rewrite every user expression goes through.

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte::compilation::input::Target;
use rsvelte_typescript::copy::{Rewrite, copy, copy_node};
use rsvelte_typescript::scope::{BindingIdentifier, DeclarationKind, ScopeIdentifier};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_vue::resolve::{BindingType, Resolution};
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

/// Where a node of the source tree was written; the start of the document for a synthesized one.
pub(crate) fn span_of(syntax_tree: &SyntaxTree, identifier: NodeIdentifier) -> Span {
    syntax_tree
        .source_location(identifier)
        .span()
        .unwrap_or_default()
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
#[derive(Debug, Default)]
pub(crate) struct Names {
    taken: FxHashSet<String>,
    helpers: Vec<(Helper, String)>,
}

impl Names {
    /// `base`, or `base_1`, `base_2`, … : the first no identifier of the document spells and svue
    /// has not handed out.
    pub(crate) fn fresh(&mut self, from: &SyntaxTree, base: &str) -> String {
        let mut name = base.to_owned();
        let mut i = 0;
        while from.atoms.lookup(&name).is_some() || self.taken.contains(&name) {
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
    pub(crate) fn helper(&mut self, from: &SyntaxTree, h: Helper) -> String {
        if let Some((_, local)) = self.helpers.iter().find(|(x, _)| *x == h) {
            return local.clone();
        }
        let local = self.fresh(from, h.export());
        self.helpers.push((h, local.clone()));
        local
    }

    /// One import per module, in the order the helpers were first used.
    pub(crate) fn imports(&self, to: &mut SyntaxTree) -> Vec<NodeIdentifier> {
        let mut modules: Vec<&str> = Vec::new();
        for (h, _) in &self.helpers {
            if !modules.contains(&h.module()) {
                modules.push(h.module());
            }
        }
        modules
            .into_iter()
            .map(|m| {
                let specifiers: Vec<NodeIdentifier> = self
                    .helpers
                    .iter()
                    .filter(|(h, _)| h.module() == m)
                    .map(|(h, local)| {
                        let imported = to.identifier(h.export());
                        let local = to.identifier(local);
                        to.import_named(imported, local, false, SourceLocation::SYNTHETIC)
                    })
                    .collect();
                let source = to.write_string(m);
                to.import(&specifiers, source, false, SourceLocation::SYNTHETIC)
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
pub(crate) struct Prop {
    pub(crate) key: String,
    /// The Svelte variable holding Vue's resolved value.
    pub(crate) var: String,
    /// `Some(cast_true)` for a `Boolean` prop: absent is `false`, and with `cast_true` the empty
    /// string or the key itself is `true` (`resolvePropValue`).
    pub(crate) boolean: Option<bool>,
    /// A literal.
    pub(crate) default: Option<NodeIdentifier>,
    /// Every declared type is a primitive's constructor.
    pub(crate) primitive: bool,
}

/// What the translation knows about the script before translating anything.
#[derive(Debug)]
pub(crate) struct Info<'a> {
    pub(crate) from: &'a SyntaxTree,
    pub(crate) source_text: &'a str,
    pub(crate) resolution: &'a Resolution,
    pub(crate) target: Target,
    pub(crate) class: FxHashMap<BindingIdentifier, Class>,
    pub(crate) props: Vec<Prop>,
    /// Per reference node: whether it reads.
    reads: FxHashMap<NodeIdentifier, bool>,
}

impl<'a> Info<'a> {
    pub(crate) fn new(
        from: &'a SyntaxTree,
        source_text: &'a str,
        resolution: &'a Resolution,
        target: Target,
        class: FxHashMap<BindingIdentifier, Class>,
        props: Vec<Prop>,
    ) -> Self {
        let reads = resolution
            .sem
            .references
            .iter()
            .map(|r| (r.node, r.read))
            .collect();
        Self {
            from,
            source_text,
            resolution,
            target,
            class,
            props,
            reads,
        }
    }

    pub(crate) fn class_of(&self, ident: NodeIdentifier) -> Option<Class> {
        let b = self.resolution.sem.binding_of(ident)?;
        self.class.get(&b).copied()
    }

    pub(crate) fn prop(&self, key: &str) -> Option<&Prop> {
        self.props.iter().find(|p| p.key == key)
    }

    /// The `props` object's member `props.key`, if `e` is one.
    fn props_member(&self, e: NodeIdentifier) -> Option<(NodeIdentifier, NodeIdentifier)> {
        match self.from.kind(e) {
            Kind::Member {
                object, property, ..
            } if matches!(self.from.kind(object), Kind::Identifier(_))
                && self.class_of(object) == Some(Class::Props) =>
            {
                Some((object, property))
            }
            _ => None,
        }
    }
}

/// compiler-core `isGloballyAllowed`: what a template expression reads from the global scope
/// rather than from the component instance.
pub(crate) fn globally_allowed(name: &str) -> bool {
    matches!(
        name,
        "Infinity"
            | "undefined"
            | "NaN"
            | "isFinite"
            | "isNaN"
            | "parseFloat"
            | "parseInt"
            | "decodeURI"
            | "decodeURIComponent"
            | "encodeURI"
            | "encodeURIComponent"
            | "Math"
            | "Number"
            | "Date"
            | "Array"
            | "Object"
            | "Boolean"
            | "String"
            | "RegExp"
            | "Map"
            | "Set"
            | "JSON"
            | "Intl"
            | "BigInt"
            | "console"
            | "Error"
            | "Symbol"
    )
}

/// compiler-sfc `canNeverBeRef` without `reactive`: a value no template unwraps.
pub(crate) fn can_never_be_ref(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::Unary(..)
        | Kind::Binary(..)
        | Kind::Array(_)
        | Kind::Object(_)
        | Kind::Function { .. }
        | Kind::Arrow { .. }
        | Kind::Update { .. }
        | Kind::String
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Template { .. } => true,
        Kind::Sequence(list) => list
            .last()
            .is_some_and(|&l| can_never_be_ref(syntax_tree, l)),
        _ => false,
    }
}

mod rewrite;

mod translate;
pub(crate) use rewrite::Rewriter;
pub(crate) use translate::translate;
