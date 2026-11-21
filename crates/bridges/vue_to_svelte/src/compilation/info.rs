//! What the translation knows about the script before translating anything.

use oxc_ast::ast::{Expression, IdentifierReference};
use oxc_semantic::SymbolId;
use rsvelte_svelte_compile::Target;
use rsvelte_typescript_tree::Tree;
use rsvelte_vue_semantic::resolve::Resolution;
use rustc_hash::FxHashMap;

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
