use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    Argument, AssignmentTargetMaybeDefault, AssignmentTargetProperty, Declaration, Expression,
    IdentifierReference, ObjectProperty, PropertyKey, SimpleAssignmentTarget, Statement,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::{NodeId, SymbolId};
use oxc_span::SPAN;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_compile::strip::Strip;
use rustc_hash::FxHashMap;

use super::super::{BindingKind, Plan, Resolution, constructors, prop_cell, runes};
use super::rune_value;

/// Copies script nodes into the translation's tree: `x.value` for `$state` and `$derived`,
/// `$$props.<key>` for props, Vue's reactivity for the runes.
pub(crate) struct ScriptRewrite<'r, 't> {
    pub(crate) b: &'r Builder<'t>,
    pub(crate) res: &'r Resolution,
    module_exports: &'r FxHashMap<SymbolId, String>,
    pub(in super::super) constructors: &'r constructors::Plan,
    /// By constructor assignment: the field that stores its cell.
    pub(in super::super) constructor_storage: FxHashMap<NodeId, String>,
    pub(crate) server: bool,
    pub(crate) tracking: bool,
    /// By class, innermost last: each private field, and whether it stores a cell.
    pub(in super::super) private_fields: Vec<FxHashMap<String, bool>>,
}

impl<'r, 't> ScriptRewrite<'r, 't> {
    pub(crate) fn new(
        b: &'r Builder<'t>,
        res: &'r Resolution,
        plan: &'r Plan,
        server: bool,
    ) -> Self {
        Self {
            b,
            res,
            module_exports: &plan.module_exports,
            constructors: &plan.constructors,
            constructor_storage: FxHashMap::default(),
            server,
            tracking: plan.auxiliary.contains_key("$effect.tracking") && !server,
            private_fields: Vec::new(),
        }
    }

    /// The name a module export's cell is stored under.
    pub(crate) fn storage_name(&self, symbol: SymbolId) -> Option<&'r str> {
        self.module_exports.get(&symbol).map(String::as_str)
    }

    /// `node` in the translation's tree, without its types.
    pub(crate) fn copy<T>(&self, node: &T) -> T::Cloned
    where
        T: CloneIn<'t>,
    {
        node.clone_in_with_semantic_ids(self.b.allocator())
    }

    /// `e` copied as written, without its types.
    pub(crate) fn verbatim(&self, e: &Expression<'_>) -> Expression<'t> {
        let mut e = self.copy(e);
        Strip::new(self.b.allocator()).visit_expression(&mut e);
        e
    }

    pub(crate) fn verbatim_statement(&self, s: &Statement<'_>) -> Statement<'t> {
        let mut s = self.copy(s);
        Strip::new(self.b.allocator()).visit_statement(&mut s);
        s
    }

    /// `e`, rewritten.
    pub(crate) fn expression(&mut self, e: &Expression<'_>) -> Expression<'t> {
        let mut e = self.verbatim(e);
        self.visit_expression(&mut e);
        e
    }

    /// `s`, rewritten; `None` when types were all it declared.
    pub(crate) fn statement(&mut self, s: &Statement<'_>) -> Option<Statement<'t>> {
        let mut s = self.verbatim_statement(s);
        if matches!(s, Statement::EmptyStatement(_)) {
            return None;
        }
        self.visit_statement(&mut s);
        Some(s)
    }

    pub(crate) fn declaration(&mut self, d: &Declaration<'_>) -> Option<Statement<'t>> {
        let d = self.copy(d);
        let mut s = Statement::from(d);
        Strip::new(self.b.allocator()).visit_statement(&mut s);
        if matches!(s, Statement::EmptyStatement(_)) {
            return None;
        }
        self.visit_statement(&mut s);
        Some(s)
    }

    /// What a read of `identifier` becomes, if it reads through a translation.
    fn read(&self, identifier: &IdentifierReference<'_>) -> Option<Expression<'t>> {
        let symbol = self.res.symbol(identifier)?;
        self.binding_value(symbol, identifier.name.as_str(), identifier.span)
    }

    /// What a read of `symbol`, spelled `name`, becomes.
    pub(crate) fn binding_value(
        &self,
        symbol: SymbolId,
        name: &str,
        span: oxc_span::Span,
    ) -> Option<Expression<'t>> {
        let b = self.b;
        let info = self.res.binding(symbol);
        Some(match info.kind {
            BindingKind::State
            | BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::DerivedBy
            | BindingKind::BindableProperty => {
                let cell = match self.storage_name(symbol) {
                    Some(storage) => b.id(storage),
                    None => b.id_at(name, span),
                };
                b.member(cell, "value")
            }
            BindingKind::Property if prop_cell(self.res, symbol) => {
                b.member(b.id_at(name, span), "value")
            }
            BindingKind::RestProperty => b.id("$$attrs"),
            BindingKind::Property => {
                let PropertyKey::StaticIdentifier(key) = info.prop_key? else {
                    return None;
                };
                b.member(b.id("$$props"), key.name.as_str())
            }
            _ => return None,
        })
    }

    /// What the rune call `it` becomes; `None` when it makes no rune.
    fn rune(&mut self, it: &mut Expression<'t>) -> Option<Expression<'t>> {
        let (name, _) = self.res.rune(it)?;
        let b = self.b;
        let Expression::CallExpression(call) = it else {
            return None;
        };
        let mut arguments: Vec<Expression<'t>> = std::mem::replace(&mut call.arguments, b.vec([]))
            .into_iter()
            .map(|a| match a {
                Argument::SpreadElement(_) => unreachable!("a rune takes no spread"),
                a => a.into_expression(),
            })
            .collect();
        if runes::eager(name) {
            let mut argument = arguments.pop().expect("a checked eager argument");
            self.visit_expression(&mut argument);
            return Some(argument);
        }
        if runes::inspect(name) {
            return Some(b.id("undefined"));
        }
        if name == "$props.id" {
            return Some(b.call(b.id("$$props_id"), []));
        }
        if runes::value(name) {
            for a in &mut arguments {
                self.visit_expression(a);
            }
            return rune_value(b, name, arguments.into_iter().next(), self.tracking);
        }
        if self.server {
            match name {
                "$host" | "$effect" | "$effect.pre" => return Some(b.id("undefined")),
                "$effect.tracking" => return Some(b.boolean(false)),
                "$effect.pending" => return Some(b.number(0.0)),
                "$effect.root" => return Some(b.arrow_block(b.params([]), [], false)),
                _ => {}
            }
        }
        if name == "$inspect.trace" {
            return Some(b.id("undefined"));
        }
        let local = runes::local(name)?;
        for a in &mut arguments {
            self.visit_expression(a);
        }
        Some(b.call(b.id(local), arguments))
    }

    /// Whether `this.#name` reads a private field that stores a cell.
    fn reactive_private(&self, name: &str) -> bool {
        let name = format!("#{name}");
        self.private_fields
            .iter()
            .rev()
            .find_map(|fields| fields.get(&name))
            .copied()
            == Some(true)
    }
}

/// An assignment target for a read the translation rewrote.
fn simple_target(e: Expression<'_>) -> SimpleAssignmentTarget<'_> {
    match e {
        Expression::StaticMemberExpression(m) => SimpleAssignmentTarget::StaticMemberExpression(m),
        Expression::Identifier(id) => SimpleAssignmentTarget::AssignmentTargetIdentifier(id),
        _ => unreachable!("a rewritten read is a name or a member"),
    }
}

impl<'t> VisitMut<'t> for ScriptRewrite<'_, 't> {
    fn visit_expression(&mut self, it: &mut Expression<'t>) {
        let rewritten = match it {
            Expression::Identifier(identifier) => match self.read(identifier) {
                Some(e) => e,
                None => return,
            },
            Expression::CallExpression(_) => match self.rune(it) {
                Some(e) => e,
                None => return walk_mut::walk_expression(self, it),
            },
            Expression::AssignmentExpression(a)
                if self.constructors.assignments.contains(&a.node_id.get()) =>
            {
                self.constructor_assignment(a)
            }
            Expression::ClassExpression(class) => {
                self.class(class);
                return;
            }
            Expression::PrivateFieldExpression(p) if self.reactive_private(&p.field.name) => {
                walk_mut::walk_expression(self, it);
                let field = oxc_allocator::TakeIn::take_in(it, self.b);
                self.b.member(field, "value")
            }
            _ => return walk_mut::walk_expression(self, it),
        };
        *it = rewritten;
    }

    fn visit_statement(&mut self, it: &mut Statement<'t>) {
        match it {
            Statement::ClassDeclaration(class) => self.class(class),
            Statement::VariableDeclaration(d) => super::super::declarations::nested(self, d),
            _ => walk_mut::walk_statement(self, it),
        }
    }

    fn visit_simple_assignment_target(&mut self, it: &mut SimpleAssignmentTarget<'t>) {
        let rewritten = match it {
            SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                match self.read(identifier) {
                    Some(e) => simple_target(e),
                    None => return,
                }
            }
            SimpleAssignmentTarget::PrivateFieldExpression(p)
                if self.reactive_private(&p.field.name) =>
            {
                walk_mut::walk_simple_assignment_target(self, it);
                let SimpleAssignmentTarget::PrivateFieldExpression(p) =
                    std::mem::replace(it, simple_target(self.b.id("undefined")))
                else {
                    unreachable!()
                };
                simple_target(
                    self.b
                        .member(Expression::PrivateFieldExpression(p), "value"),
                )
            }
            _ => return walk_mut::walk_simple_assignment_target(self, it),
        };
        *it = rewritten;
    }

    fn visit_assignment_target_property(&mut self, it: &mut AssignmentTargetProperty<'t>) {
        // `({ count } = o)` assigns `count.value` when `count` reads through a transform.
        if let AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) = it
            && let Some(read) = self.read(&p.binding)
        {
            let b = self.b;
            let name = p.binding.name;
            let target = oxc_ast::ast::AssignmentTarget::from(simple_target(read));
            let mut init = p.init.take();
            if let Some(init) = &mut init {
                self.visit_expression(init);
            }
            let binding = match init {
                Some(init) => AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                    SPAN, target, init, b,
                ),
                None => AssignmentTargetMaybeDefault::from(target),
            };
            let key = PropertyKey::new_static_identifier(p.span, name, b);
            *it = AssignmentTargetProperty::new_assignment_target_property_property(
                p.span, key, binding, false, b,
            );
            return;
        }
        walk_mut::walk_assignment_target_property(self, it);
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'t>) {
        // `{ count }` stops being shorthand when `count` reads through a transform.
        if it.shorthand
            && let Expression::Identifier(identifier) = &it.value
            && let Some(read) = self.read(identifier)
        {
            it.value = read;
            it.shorthand = false;
            return;
        }
        walk_mut::walk_object_property(self, it);
    }
}
