//! What the script and the template translations share: the names svue adds, the runtime helpers
//! it imports, and the rewrite every user expression goes through.

use rsvelte_javascript::copy::{Rewrite, copy, copy_node};
use rsvelte_javascript::scope::{BindingIdentifier, DeclarationKind, ScopeIdentifier};
use rsvelte_javascript::syntax_tree::flag;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte::compilation::lower::Target;
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

/// Copies one user expression or statement of the Vue tree into the output, rewriting what Vue
/// and Svelte spell differently and refusing what svue does not translate.
#[derive(Debug)]
pub(crate) struct Rewriter<'a> {
    pub(crate) info: &'a Info<'a>,
    /// A template expression: refs are already unwrapped, names resolve against the instance.
    pub(crate) template: bool,
    /// Inside an inline handler: the name `$event` becomes.
    pub(crate) event: Option<&'a str>,
    /// `v-for` aliases read through the block's entry: `(entry, index)`.
    pub(crate) aliases: &'a FxHashMap<BindingIdentifier, (String, u32)>,
    error: Option<Diagnostic>,
    depth: u32,
}

impl<'a> Rewriter<'a> {
    pub(crate) const fn new(
        info: &'a Info<'a>,
        template: bool,
        aliases: &'a FxHashMap<BindingIdentifier, (String, u32)>,
    ) -> Self {
        Self {
            info,
            template,
            event: None,
            aliases,
            error: None,
            depth: 0,
        }
    }

    /// # Errors
    ///
    /// The first refusal met while copying.
    pub(crate) fn copy(
        &mut self,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> R<NodeIdentifier> {
        let out = copy(self.info.from, to, self, identifier);
        self.error.take().map_or(Ok(out), Err)
    }

    fn fail(
        &mut self,
        to: &mut SyntaxTree,
        what: impl std::fmt::Display,
        at: NodeIdentifier,
    ) -> NodeIdentifier {
        if self.error.is_none() {
            self.error = Some(unsupported(what, span_of(self.info.from, at)));
        }
        to.null(SourceLocation::SYNTHETIC)
    }

    fn ident(&mut self, to: &mut SyntaxTree, identifier: NodeIdentifier) -> Option<NodeIdentifier> {
        let (from, info) = (self.info.from, self.info);
        let name = from.name(identifier);
        let Some(b) = info.resolution.sem.binding_of(identifier) else {
            if !self.template {
                if is_macro(name) {
                    return Some(self.fail(to, format_args!("`{name}` here"), identifier));
                }
                return None;
            }
            if name == "$event"
                && let Some(event) = self.event
            {
                return Some(to.ident(event, from.source_location(identifier)));
            }
            if let Some(p) = info.prop(name)
                && info.resolution.binding_type(from.atom(identifier)?) == Some(BindingType::Props)
            {
                return Some(to.ident(&p.var, from.source_location(identifier)));
            }
            if globally_allowed(name) {
                return None;
            }
            return Some(self.fail(
                to,
                format_args!(
                    "`{name}`, which the component does not declare (Vue reads it from the \
                     component instance)"
                ),
                identifier,
            ));
        };
        let binding = &info.resolution.sem.bindings[b];
        if binding.node == identifier {
            return None;
        }
        if let Some((entry, index)) = self.aliases.get(&b) {
            let e = to.ident(entry, SourceLocation::SYNTHETIC);
            let i = to.write_number(f64::from(*index), SourceLocation::SYNTHETIC);
            return Some(to.member(e, i, true, false, from.source_location(identifier)));
        }
        match info.class.get(&b) {
            Some(Class::Ref | Class::Computed) if !self.template => {
                Some(self.fail(to, "a ref used other than through `.value`", identifier))
            }
            Some(Class::Props) => Some(self.fail(
                to,
                "the props object used other than as `props.<declared prop>`",
                identifier,
            )),
            Some(Class::Vue(api)) => Some(self.fail(
                to,
                format_args!("`{api}` from vue used other than as svue translates it"),
                identifier,
            )),
            None if self.template
                && binding.scope == ScopeIdentifier::ROOT
                && info.reads.get(&identifier).is_some_and(|&read| read)
                && !template_readable(from, info.resolution, b) =>
            {
                Some(self.fail(
                    to,
                    format_args!(
                        "the template reading `{name}`, which Vue unwraps or re-reads on every \
                         render and Svelte reads as a plain variable"
                    ),
                    identifier,
                ))
            }
            _ => None,
        }
    }

    fn member(
        &mut self,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let (from, info) = (self.info.from, self.info);
        let Kind::Member {
            object,
            property,
            computed,
            ..
        } = from.kind(identifier)
        else {
            unreachable!("called on members")
        };
        if !matches!(from.kind(object), Kind::Identifier(_)) {
            return None;
        }
        match info.class_of(object) {
            Some(Class::Ref | Class::Computed)
                if !self.template && !computed && from.name(property) == "value" =>
            {
                Some(to.ident(from.name(object), from.source_location(identifier)))
            }
            Some(Class::Props) => {
                let prop = (!computed)
                    .then(|| info.prop(from.name(property)))
                    .flatten();
                Some(match prop {
                    Some(p) => to.ident(&p.var, from.source_location(identifier)),
                    None => self.fail(
                        to,
                        "a member of the props object other than a prop",
                        identifier,
                    ),
                })
            }
            _ => None,
        }
    }

    /// Refuses a write Vue does not make: to a computed, a prop, or a `v-for` alias.
    fn check_target(
        &mut self,
        to: &mut SyntaxTree,
        target: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let (from, info) = (self.info.from, self.info);
        if info.props_member(target).is_some() {
            return Some(self.fail(to, "a write to a prop", target));
        }
        match from.kind(target) {
            Kind::Member {
                object,
                property,
                computed: false,
                ..
            } if matches!(from.kind(object), Kind::Identifier(_))
                && info.class_of(object) == Some(Class::Computed)
                && from.name(property) == "value" =>
            {
                Some(self.fail(to, "a write to a computed", target))
            }
            Kind::Identifier(_) => {
                let name = from.name(target);
                match info.resolution.sem.binding_of(target) {
                    Some(b) if self.aliases.contains_key(&b) => {
                        Some(self.fail(to, "a write to a `v-for` alias", target))
                    }
                    Some(b) if info.resolution.sem.bindings[b].kind == DeclarationKind::Host => {
                        Some(self.fail(to, "a write to a `v-for` alias", target))
                    }
                    Some(b) if self.template && info.class.get(&b) == Some(&Class::Computed) => {
                        Some(self.fail(to, "a write to a computed", target))
                    }
                    None if self.template && info.prop(name).is_some() => {
                        Some(self.fail(to, "a write to a prop", target))
                    }
                    _ => None,
                }
            }
            Kind::ObjectPattern(_) | Kind::ArrayPattern(_) if self.template => {
                Some(self.fail(to, "a destructuring assignment in the template", target))
            }
            _ => None,
        }
    }

    /// A template object's property: a non-computed key is a name, not a reference.
    fn property(&mut self, to: &mut SyntaxTree, identifier: NodeIdentifier) -> NodeIdentifier {
        let from = self.info.from;
        let Kind::Property {
            key,
            value,
            computed,
            shorthand,
            ..
        } = from.kind(identifier)
        else {
            unreachable!("called on properties")
        };
        let k = if computed {
            copy(from, to, self, key)
        } else {
            copy_node(from, to, self, key)
        };
        let v = copy(from, to, self, value);
        let mut flags = from.flags(identifier);
        let same_name = matches!(to.kind(v), Kind::Identifier(_))
            && matches!(to.kind(k), Kind::Identifier(_))
            && to.name(v) == to.name(k);
        if shorthand && !same_name {
            flags &= !flag::SHORTHAND;
        }
        to.property(k, v, flags, from.source_location(identifier))
    }
}

impl Rewrite for Rewriter<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if self.error.is_some() {
            return Some(to.null(SourceLocation::SYNTHETIC));
        }
        match from.kind(identifier) {
            Kind::This => Some(self.fail(to, "`this`", identifier)),
            Kind::Identifier(_) => self.ident(to, identifier),
            Kind::Member { .. } => self.member(to, identifier),
            Kind::Assign(_, target, _) => self.check_target(to, target),
            Kind::Update { arg, .. } => self.check_target(to, arg),
            Kind::Property { .. } => Some(self.property(to, identifier)),
            Kind::Function { .. } | Kind::Arrow { .. } => {
                self.depth += 1;
                let out = copy_node(from, to, self, identifier);
                self.depth -= 1;
                Some(out)
            }
            Kind::Await(_) if self.depth == 0 => {
                Some(self.fail(to, "a top-level `await` (an async setup)", identifier))
            }
            _ => None,
        }
    }
}

/// compiler-sfc's macros, which svue translates only as `defineProps` at the top level.
fn is_macro(name: &str) -> bool {
    matches!(
        name,
        "defineProps"
            | "defineEmits"
            | "defineExpose"
            | "defineOptions"
            | "defineSlots"
            | "defineModel"
            | "withDefaults"
    )
}

/// `can_never_be_ref`, and the global `undefined`.
fn never_ref(from: &SyntaxTree, resolution: &Resolution, e: NodeIdentifier) -> bool {
    can_never_be_ref(from, e)
        || (matches!(from.kind(e), Kind::Identifier(_))
            && from.name(e) == "undefined"
            && resolution.sem.binding_of(e).is_none())
}

/// Whether the template may read the top-level binding `b` as a plain variable: Vue unwraps what
/// may hold a ref, and re-reads a reassigned `let` on every render, where Svelte reads it once.
fn template_readable(from: &SyntaxTree, resolution: &Resolution, b: BindingIdentifier) -> bool {
    let binding = &resolution.sem.bindings[b];
    match binding.kind {
        DeclarationKind::Let | DeclarationKind::Variable => {
            binding.writes == 0
                && binding
                    .initializer(from)
                    .is_some_and(|i| never_ref(from, resolution, i))
        }
        DeclarationKind::Const => match resolution.binding_type(binding.name) {
            Some(BindingType::SetupMaybeRef) => binding
                .initializer(from)
                .is_some_and(|i| never_ref(from, resolution, i)),
            Some(_) => true,
            None => false,
        },
        DeclarationKind::Function
        | DeclarationKind::Param
        | DeclarationKind::Import
        | DeclarationKind::Host => true,
    }
}

/// The whole translation: the script first, as the template reads what it declares.
pub(crate) fn translate(
    sfc: &rsvelte_vue::syntax_tree::SingleFileComponent,
    compiler_syntax_tree: Option<&rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTree>,
    resolution: &Resolution,
    source_text: &str,
    target: Target,
) -> R<Translation> {
    let from = &sfc.javascript;
    if let Some(style) = sfc.styles.first() {
        return Err(unsupported(
            "`<style>` (Vue scopes it with `data-v-` attributes, Svelte by its own rules)",
            style.span,
        ));
    }
    if let Some(t) = from.typescript_runtime.first() {
        return Err(unsupported(
            "a TypeScript construct with a runtime value",
            t.span,
        ));
    }
    let mut names = Names::default();
    let (class, props) = crate::script::classify(sfc, resolution, source_text, &mut names)?;
    let info = Info::new(from, source_text, resolution, target, class, props);
    let mut to = SyntaxTree::new();
    let roots = compiler_syntax_tree.map_or_else(Vec::new, crate::template::fallthrough_targets);
    let attributes = (!roots.is_empty()).then(|| names.fresh(from, "attrs"));
    let template = crate::template::translate(
        &info,
        compiler_syntax_tree,
        &roots,
        attributes.as_deref(),
        &mut to,
        &mut names,
    )?;
    let body = crate::script::emit(sfc, &info, attributes.as_deref(), &mut to, &mut names)?;
    let mut statements = names.imports(&mut to);
    statements.extend(template.hoisted);
    statements.extend(body);
    let program = to.program(&statements, SourceLocation::SYNTHETIC);
    Ok(Translation {
        javascript: to,
        program,
        compiler_syntax_tree: template.compiler_syntax_tree,
        template_expressions: template.expressions,
    })
}
