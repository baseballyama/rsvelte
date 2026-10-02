use super::{
    BindingIdentifier, BindingType, Class, DeclarationKind, Diagnostic, FxHashMap, Info, Kind,
    NodeIdentifier, R, Resolution, Rewrite, ScopeIdentifier, SourceLocation, SyntaxTree,
    can_never_be_ref, copy, copy_node, flag, globally_allowed, span_of, unsupported,
};

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
    pub(super) error: Option<Diagnostic>,
    pub(super) depth: u32,
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
pub(super) fn is_macro(name: &str) -> bool {
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
pub(super) fn never_ref(from: &SyntaxTree, resolution: &Resolution, e: NodeIdentifier) -> bool {
    can_never_be_ref(from, e)
        || (matches!(from.kind(e), Kind::Identifier(_))
            && from.name(e) == "undefined"
            && resolution.sem.binding_of(e).is_none())
}

/// Whether the template may read the top-level binding `b` as a plain variable: Vue unwraps what
/// may hold a ref, and re-reads a reassigned `let` on every render, where Svelte reads it once.
pub(super) fn template_readable(
    from: &SyntaxTree,
    resolution: &Resolution,
    b: BindingIdentifier,
) -> bool {
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
