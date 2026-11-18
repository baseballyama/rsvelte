use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    ArrowFunctionExpression, AssignmentExpression, AssignmentTarget, Expression, Function,
    IdentifierReference, ObjectProperty, PropertyKey, SimpleAssignmentTarget, Statement,
    StaticMemberExpression, TSClassImplements, TSType, UpdateExpression, VariableDeclarator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::{ScopeFlags, SymbolId};
use oxc_span::GetSpan;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_vue_semantic::expressions::is_global;
use rsvelte_vue_semantic::resolve::BindingType;

use super::{
    Class, Declared, Diagnostic, FxHashMap, Info, R, can_never_be_ref, span_of, unsupported,
};

/// Copies one user expression or statement of the Vue tree into the output, rewriting what Vue
/// and Svelte spell differently and refusing what svue does not translate.
///
/// The copy keeps the Vue tree's reference ids, so the rewrite reads Vue's resolution through them.
#[derive(Debug)]
pub(crate) struct Rewriter<'r, 'v, 'a> {
    info: &'r Info<'v>,
    b: &'r Builder<'a>,
    /// A template expression: refs are already unwrapped, names resolve against the instance.
    template: bool,
    /// Inside an inline handler: the name `$event` becomes.
    pub(crate) event: Option<&'r str>,
    /// `v-for` aliases read through the block's entry: `(entry, index)`.
    aliases: &'r FxHashMap<SymbolId, (String, u32)>,
    error: Option<Diagnostic>,
    /// How many functions enclose the node being rewritten.
    depth: u32,
}

impl<'r, 'v, 'a> Rewriter<'r, 'v, 'a> {
    pub(crate) const fn new(
        info: &'r Info<'v>,
        b: &'r Builder<'a>,
        template: bool,
        aliases: &'r FxHashMap<SymbolId, (String, u32)>,
    ) -> Self {
        Self {
            info,
            b,
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
    pub(crate) fn expression(&mut self, e: &Expression<'_>) -> R<Expression<'a>> {
        let mut out = e.clone_in_with_semantic_ids(self.b.allocator());
        self.visit_expression(&mut out);
        self.finish(out)
    }

    /// # Errors
    ///
    /// The first refusal met while copying.
    pub(crate) fn statement(&mut self, s: &Statement<'_>) -> R<Statement<'a>> {
        let mut out = s.clone_in_with_semantic_ids(self.b.allocator());
        self.visit_statement(&mut out);
        self.finish(out)
    }

    /// # Errors
    ///
    /// The first refusal met while copying.
    pub(crate) fn declarator(&mut self, d: &VariableDeclarator<'_>) -> R<VariableDeclarator<'a>> {
        let mut out = d.clone_in_with_semantic_ids(self.b.allocator());
        self.visit_variable_declarator(&mut out);
        self.finish(out)
    }

    fn finish<T>(&mut self, out: T) -> R<T> {
        self.error.take().map_or(Ok(out), Err)
    }

    fn refuse(&mut self, what: impl std::fmt::Display, span: oxc_span::Span) {
        if self.error.is_none() {
            self.error = Some(unsupported(what, span_of(span)));
        }
    }

    /// Refuses, and stands in for the refused node.
    fn fail(&mut self, what: impl std::fmt::Display, span: oxc_span::Span) -> Expression<'a> {
        self.refuse(what, span);
        self.b.null()
    }

    /// What a name becomes, if it changes.
    fn ident(&mut self, identifier: &IdentifierReference<'_>) -> Option<Expression<'a>> {
        let info = self.info;
        let name = identifier.name.as_str();
        let span = identifier.span;
        let Some(symbol) = info.symbol(identifier) else {
            if !self.template {
                if is_macro(name) {
                    return Some(self.fail(format_args!("`{name}` here"), span));
                }
                return None;
            }
            if name == "$event"
                && let Some(event) = self.event
            {
                return Some(self.b.id_at(event, span));
            }
            if let Some(p) = info.prop(name)
                && info.resolution.binding_type(name) == Some(BindingType::Props)
            {
                return Some(self.b.id_at(&p.var, span));
            }
            if is_global(name) {
                return None;
            }
            return Some(self.fail(
                format_args!(
                    "`{name}`, which the component does not declare (Vue reads it from the \
                     component instance)"
                ),
                span,
            ));
        };
        if let Some((entry, index)) = self.aliases.get(&symbol) {
            let b = self.b;
            return Some(Expression::new_computed_member_expression(
                span,
                b.id(entry),
                b.number(f64::from(*index)),
                false,
                b,
            ));
        }
        match info.class.get(&symbol) {
            Some(Class::Ref | Class::Computed) if !self.template => {
                Some(self.fail("a ref used other than through `.value`", span))
            }
            Some(Class::Props) => Some(self.fail(
                "the props object used other than as `props.<declared prop>`",
                span,
            )),
            Some(Class::Vue(api)) => Some(self.fail(
                format_args!("`{api}` from vue used other than as svue translates it"),
                span,
            )),
            None if self.template
                && info.is_top_level(symbol)
                && info.is_read(identifier)
                && !template_readable(info, symbol) =>
            {
                Some(self.fail(
                    format_args!(
                        "the template reading `{name}`, which Vue unwraps or re-reads on every \
                         render and Svelte reads as a plain variable"
                    ),
                    span,
                ))
            }
            _ => None,
        }
    }

    /// `ref.value` in the script, and `props.key`: what the member becomes, if it changes.
    fn static_member(&mut self, member: &StaticMemberExpression<'_>) -> Option<Expression<'a>> {
        let Expression::Identifier(object) = &member.object else {
            return None;
        };
        let property = member.property.name.as_str();
        match self.info.class_of(object) {
            Some(Class::Ref | Class::Computed) if !self.template && property == "value" => {
                Some(self.b.id_at(object.name.as_str(), member.span))
            }
            Some(Class::Props) => Some(match self.info.prop(property) {
                Some(p) => self.b.id_at(&p.var, member.span),
                None => self.fail(
                    "a member of the props object other than a prop",
                    member.span,
                ),
            }),
            _ => None,
        }
    }

    /// Refuses a write Vue does not make: to a computed, a prop, or a `v-for` alias.
    fn check_target(&mut self, target: &AssignmentTarget<'_>) {
        match target.as_simple_assignment_target() {
            Some(simple) => self.check_simple_target(simple),
            None if self.template => {
                self.refuse("a destructuring assignment in the template", target.span());
            }
            None => {}
        }
    }

    fn check_simple_target(&mut self, target: &SimpleAssignmentTarget<'_>) {
        let info = self.info;
        let span = target.span();
        match target {
            SimpleAssignmentTarget::StaticMemberExpression(m) => {
                match info.class_of_expression(&m.object) {
                    Some(Class::Props) => self.refuse("a write to a prop", span),
                    Some(Class::Computed) if m.property.name == "value" => {
                        self.refuse("a write to a computed", span);
                    }
                    _ => {}
                }
            }
            SimpleAssignmentTarget::ComputedMemberExpression(m)
                if info.class_of_expression(&m.object) == Some(Class::Props) =>
            {
                self.refuse("a write to a prop", span);
            }
            SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                match info.symbol(identifier) {
                    Some(s) if self.aliases.contains_key(&s) || info.resolution.is_alias(s) => {
                        self.refuse("a write to a `v-for` alias", span);
                    }
                    Some(s) if self.template && info.class.get(&s) == Some(&Class::Computed) => {
                        self.refuse("a write to a computed", span);
                    }
                    None if self.template && info.prop(identifier.name.as_str()).is_some() => {
                        self.refuse("a write to a prop", span);
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }
}

/// The assignment target an identifier or a member stands for.
fn simple_target(e: Expression<'_>) -> Option<SimpleAssignmentTarget<'_>> {
    match e {
        Expression::Identifier(identifier) => Some(
            SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier),
        ),
        e if e.is_member_expression() => {
            Some(SimpleAssignmentTarget::from(e.into_member_expression()))
        }
        _ => None,
    }
}

impl<'a> VisitMut<'a> for Rewriter<'_, '_, 'a> {
    fn visit_expression(&mut self, it: &mut Expression<'a>) {
        if self.error.is_some() {
            return;
        }
        match it {
            Expression::Identifier(identifier) => {
                if let Some(replacement) = self.ident(identifier) {
                    *it = replacement;
                }
                return;
            }
            Expression::StaticMemberExpression(member) => {
                if let Some(replacement) = self.static_member(member) {
                    *it = replacement;
                    return;
                }
            }
            Expression::ComputedMemberExpression(member)
                if self.info.class_of_expression(&member.object) == Some(Class::Props) =>
            {
                let span = member.span;
                *it = self.fail("a member of the props object other than a prop", span);
                return;
            }
            Expression::ThisExpression(this) => {
                let span = this.span;
                *it = self.fail("`this`", span);
                return;
            }
            Expression::AwaitExpression(e) if self.depth == 0 => {
                let span = e.span;
                *it = self.fail("a top-level `await` (an async setup)", span);
                return;
            }
            _ => {}
        }
        walk_mut::walk_expression(self, it);
    }

    fn visit_simple_assignment_target(&mut self, it: &mut SimpleAssignmentTarget<'a>) {
        if self.error.is_some() {
            return;
        }
        let replacement = match it {
            SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                let Some(replacement) = self.ident(identifier) else {
                    return;
                };
                replacement
            }
            SimpleAssignmentTarget::StaticMemberExpression(member) => {
                let Some(replacement) = self.static_member(member) else {
                    walk_mut::walk_simple_assignment_target(self, it);
                    return;
                };
                replacement
            }
            _ => {
                walk_mut::walk_simple_assignment_target(self, it);
                return;
            }
        };
        // A refused name stands in as `null`, which is no target; the refusal is kept.
        if let Some(target) = simple_target(replacement) {
            *it = target;
        }
    }

    fn visit_identifier_reference(&mut self, it: &mut IdentifierReference<'a>) {
        // A name outside an expression or a simple target, such as a destructuring target's.
        if self.error.is_none() && self.ident(it).is_some() && self.error.is_none() {
            self.refuse(format_args!("`{}` here", it.name), it.span);
        }
    }

    fn visit_assignment_expression(&mut self, it: &mut AssignmentExpression<'a>) {
        self.check_target(&it.left);
        walk_mut::walk_assignment_expression(self, it);
    }

    fn visit_update_expression(&mut self, it: &mut UpdateExpression<'a>) {
        self.check_simple_target(&it.argument);
        walk_mut::walk_update_expression(self, it);
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'a>) {
        walk_mut::walk_object_property(self, it);
        // A non-computed key is a name, not a reference: a renamed value keeps it.
        if it.shorthand {
            let same = matches!(
                (&it.key, &it.value),
                (PropertyKey::StaticIdentifier(k), Expression::Identifier(v)) if k.name == v.name
            );
            it.shorthand = same;
        }
    }

    fn visit_function(&mut self, it: &mut Function<'a>, flags: ScopeFlags) {
        self.depth += 1;
        walk_mut::walk_function(self, it, flags);
        self.depth -= 1;
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'a>) {
        self.depth += 1;
        walk_mut::walk_arrow_function_expression(self, it);
        self.depth -= 1;
    }

    // Types are erased, and the names in them are not the component's values.
    fn visit_ts_type(&mut self, _: &mut TSType<'a>) {}

    fn visit_ts_class_implements(&mut self, _: &mut TSClassImplements<'a>) {}
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
pub(super) fn never_ref(info: &Info<'_>, e: &Expression<'_>) -> bool {
    can_never_be_ref(e)
        || matches!(e, Expression::Identifier(i) if i.name == "undefined" && info.symbol(i).is_none())
}

/// Whether the template may read the top-level `symbol` as a plain variable: Vue unwraps what may
/// hold a ref, and re-reads a reassigned `let` on every render, where Svelte reads it once.
pub(super) fn template_readable(info: &Info<'_>, symbol: SymbolId) -> bool {
    let Some(top) = info.top.get(&symbol) else {
        return false;
    };
    let never_ref = |e: &Expression<'_>| never_ref(info, e);
    match top.declared {
        Declared::Let | Declared::Var => {
            !info.is_written(symbol) && top.initializer.is_some_and(never_ref)
        }
        Declared::Const => {
            let name = info.resolution.scoping().symbol_name(symbol);
            match info.resolution.binding_type(name) {
                Some(BindingType::SetupMaybeRef) => top.initializer.is_some_and(never_ref),
                Some(_) => true,
                None => false,
            }
        }
        Declared::Function | Declared::Import => true,
        Declared::Class => false,
    }
}
