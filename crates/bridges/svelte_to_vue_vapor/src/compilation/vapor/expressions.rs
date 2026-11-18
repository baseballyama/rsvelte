//! Template expressions in the module: a name the script made a cell reads `.value`, a maybe-ref
//! `unref`, and a value rune the template declares makes its cell.

use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, ArrowFunctionExpression, AssignmentTargetProperty, Expression, Function,
    IdentifierReference, ObjectProperty, SimpleAssignmentTarget, StaticMemberExpression,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::GetSpan;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_vue_semantic::resolve::{BindingType, call_name};

use super::{Body, Emitter};
use crate::compilation::asynchronous::has_await;

mod asynchronous;
pub(super) use asynchronous::script_getter;

/// Which template expressions a copy reads through a memoized cell.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Memo {
    None,
    /// Every one: a render reads them where it updates.
    Render,
    /// Those outside async functions, without an `await`: a callback runs them later.
    Callback,
}

impl<'o> Emitter<'_, 'o> {
    /// A callback's expression, its memoized reads declared in `body`.
    pub(super) fn callback_expression(
        &mut self,
        e: &Expression<'_>,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        self.rewrite(e, Memo::Callback, Some(body))
    }

    /// An expression a render reads, its memoized reads declared in `body`.
    pub(super) fn render_expression(
        &mut self,
        e: &Expression<'_>,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        if has_await(e) {
            return self.async_text(e, body);
        }
        self.rewrite(e, Memo::Render, Some(body))
    }

    /// `e` copied with its names rewritten.
    pub(super) fn copy_expression(&mut self, e: &Expression<'_>) -> Expression<'o> {
        self.rewrite(e, Memo::None, None)
    }

    /// `e` copied, and tracked when the component reads `$effect.tracking()`.
    pub(super) fn expression(&mut self, e: &Expression<'_>) -> Expression<'o> {
        let value = self.copy_expression(e);
        self.tracked(value)
    }

    fn tracked(&self, value: Expression<'o>) -> Expression<'o> {
        if self.t.tracking {
            self.b.call(self.b.id("$$tracked"), [self.arrow(value)])
        } else {
            value
        }
    }

    fn rewrite(
        &mut self,
        e: &Expression<'_>,
        memo: Memo,
        body: Option<&mut Body<'o>>,
    ) -> Expression<'o> {
        let mut value = e.clone_in_with_semantic_ids(self.b.allocator());
        let mut rewrite = Rewrite {
            e: self,
            memo,
            body,
        };
        rewrite.visit_expression(&mut value);
        value
    }

    /// A statement copied with its names rewritten.
    pub(super) fn copy_statement(
        &mut self,
        s: &oxc_ast::ast::Statement<'_>,
    ) -> oxc_ast::ast::Statement<'o> {
        let mut value = s.clone_in_with_semantic_ids(self.b.allocator());
        Rewrite {
            e: self,
            memo: Memo::None,
            body: None,
        }
        .visit_statement(&mut value);
        value
    }

    /// A pattern built here, its defaults' names rewritten.
    pub(super) fn rewrite_pattern(&mut self, pattern: &mut oxc_ast::ast::BindingPattern<'o>) {
        Rewrite {
            e: self,
            memo: Memo::None,
            body: None,
        }
        .visit_binding_pattern(pattern);
    }

    pub(super) fn rewrite_parameter(&mut self, parameter: &mut oxc_ast::ast::FormalParameter<'o>) {
        Rewrite {
            e: self,
            memo: Memo::None,
            body: None,
        }
        .visit_formal_parameter(parameter);
    }

    /// `const $$v_nN = computed(() => value)`, read as `$$v_nN.value`.
    fn memoized_value(&mut self, value: Expression<'o>, body: &mut Body<'o>) -> Expression<'o> {
        let mut value = value;
        Rewrite {
            e: self,
            memo: Memo::None,
            body: None,
        }
        .visit_expression(&mut value);
        let value = self.tracked(value);
        let computed = self.call("computed", [self.arrow(value)]);
        let name = self.declare(computed, body);
        let read = self.b.member(self.b.id(&name), "value");
        self.memoized.insert(name);
        read
    }

    /// A reference read in the module: through `.value` when the name is a cell, `unref` when it
    /// may be a ref, as is otherwise.
    pub(super) fn reference(&mut self, id: &IdentifierReference<'_>) -> Option<Expression<'o>> {
        let b = self.b;
        let res = self.res;
        let scoping = res.scoping();
        let symbol = res.symbol_of(id.reference_id.get()?)?;
        let cell = self.cells.contains(&symbol);
        let scope = scoping.symbol_scope_id(symbol);
        if !cell
            && (res.is_alias(symbol)
                || (scope != res.root_scope() && scope != scoping.root_scope_id()))
        {
            return None;
        }
        let kind = res.binding_type(&id.name);
        if cell || kind == Some(BindingType::SetupRef) || self.is_state(symbol) {
            return Some(b.member(b.id_at(&id.name, id.span), "value"));
        }
        // Svelte refuses `$` declarations, so a `$$` name is a compiler constant, never a ref.
        if kind == Some(BindingType::SetupMaybeRef) && !id.name.starts_with("$$") {
            self.helpers.insert("unref");
            return Some(b.call(b.id("$$v_unref"), [b.id_at(&id.name, id.span)]));
        }
        None
    }

    /// Whether the script declared `symbol` as a cell it made.
    fn is_state(&self, symbol: oxc_semantic::SymbolId) -> bool {
        let nodes = self.res.semantic().nodes();
        let AstKind::VariableDeclarator(d) =
            nodes.kind(self.res.scoping().symbol_declaration(symbol))
        else {
            return false;
        };
        match d.init.as_ref() {
            Some(Expression::AwaitExpression(a)) => {
                call_name(&a.argument) == Some("$$async_derived")
            }
            Some(init) => matches!(
                call_name(init),
                Some("$$ref" | "$$computed" | "$$prop_cell")
            ),
            None => false,
        }
    }
}

/// The name of a rune call, `$state` or `$derived.by`, by syntax: the script refused every other
/// call to a `$` name.
pub(super) fn rune_name<'a>(callee: &'a Expression<'a>) -> Option<String> {
    match callee {
        Expression::Identifier(id) if id.name.starts_with('$') => Some(id.name.to_string()),
        Expression::StaticMemberExpression(m) => match &m.object {
            Expression::Identifier(id) if id.name.starts_with('$') => {
                Some(format!("{}.{}", id.name, m.property.name))
            }
            _ => None,
        },
        _ => None,
    }
}

struct Rewrite<'r, 'a, 'o> {
    e: &'r mut Emitter<'a, 'o>,
    memo: Memo,
    body: Option<&'r mut Body<'o>>,
}

impl<'o> Rewrite<'_, '_, 'o> {
    fn memoize(&self, it: &Expression<'o>) -> bool {
        match self.memo {
            Memo::None => false,
            Memo::Render => self.e.t.template.memoized.contains(&it.span()),
            Memo::Callback => self.e.t.template.memoized.contains(&it.span()) && !has_await(it),
        }
    }

    fn rune(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::CallExpression(call) = it else {
            return None;
        };
        if matches!(&call.callee, Expression::Identifier(id) if id.name == "$$group_source") {
            let Some(Argument::Identifier(id)) = call.arguments.first() else {
                unreachable!("a group source names its binding")
            };
            return Some(self.e.b.id(&id.name));
        }
        let name = rune_name(&call.callee)?;
        if !crate::script::runes::value(&name) {
            return None;
        }
        let mut argument = call.arguments.pop().map(Argument::into_expression);
        if let Some(argument) = &mut argument {
            self.visit_expression(argument);
        }
        crate::script::rune_value(self.e.b, &name, argument, self.e.t.tracking)
    }
}

impl<'o> VisitMut<'o> for Rewrite<'_, '_, 'o> {
    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        if self.memoize(it) {
            let value = it.take_in(self.e.b);
            let body = self
                .body
                .as_deref_mut()
                .expect("a memoizing copy has a body");
            *it = self.e.memoized_value(value, body);
            return;
        }
        if self.memo == Memo::Callback && matches!(it, Expression::AwaitExpression(_)) {
            let value = it.take_in(self.e.b);
            let body = self
                .body
                .as_deref_mut()
                .expect("a memoizing copy has a body");
            *it = self.e.async_text(&value, body);
            return;
        }
        let rewritten = match it {
            Expression::Identifier(id) => self.e.reference(id),
            Expression::CallExpression(_) => self.rune(it),
            _ => None,
        };
        match rewritten {
            Some(value) => *it = value,
            None => walk_mut::walk_expression(self, it),
        }
    }

    fn visit_static_member_expression(&mut self, it: &mut StaticMemberExpression<'o>) {
        // A pattern's intermediate cell is read as the template translation wrote it.
        if matches!(&it.object, Expression::Identifier(id) if id.name.starts_with("$$pattern_"))
            && it.property.name == "value"
        {
            return;
        }
        walk_mut::walk_static_member_expression(self, it);
    }

    fn visit_simple_assignment_target(&mut self, it: &mut SimpleAssignmentTarget<'o>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = it
            && let Some(Expression::StaticMemberExpression(m)) = self.e.reference(id)
        {
            *it = SimpleAssignmentTarget::StaticMemberExpression(m);
            return;
        }
        walk_mut::walk_simple_assignment_target(self, it);
    }

    fn visit_assignment_target_property(&mut self, it: &mut AssignmentTargetProperty<'o>) {
        if let AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) = it
            && let Some(Expression::StaticMemberExpression(m)) = self.e.reference(&p.binding)
        {
            let mut init = p.init.take();
            if let Some(init) = &mut init {
                self.visit_expression(init);
            }
            let target = SimpleAssignmentTarget::StaticMemberExpression(m);
            *it = crate::script::property_target(self.e.b, p, target, init);
            return;
        }
        walk_mut::walk_assignment_target_property(self, it);
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'o>) {
        if it.shorthand
            && let Expression::Identifier(id) = &it.value
            && let Some(value) = self.e.reference(id)
        {
            it.value = value;
            it.shorthand = false;
            return;
        }
        walk_mut::walk_object_property(self, it);
    }

    fn visit_function(&mut self, it: &mut Function<'o>, flags: ScopeFlags) {
        let memo = self.memo;
        if memo == Memo::Callback {
            self.memo = Memo::None;
        }
        walk_mut::walk_function(self, it, flags);
        self.memo = memo;
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'o>) {
        let memo = self.memo;
        if memo == Memo::Callback && it.r#async {
            self.memo = Memo::None;
        }
        walk_mut::walk_arrow_function_expression(self, it);
        self.memo = memo;
    }
}
