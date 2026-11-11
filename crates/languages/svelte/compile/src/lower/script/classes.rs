//! Upstream's `ClassBody`, and the reads and writes of a class's state fields: a public field
//! keeps its signal in a private one behind a getter and a setter.

use oxc_allocator::{CloneIn, GetAllocator, TakeIn, Vec as ArenaVec};
use oxc_ast::ast::{
    ArrowFunctionExpression, AssignmentOperator, AssignmentTarget, ClassBody, ClassElement,
    Expression, Function, MethodDefinition, MethodDefinitionKind, MethodDefinitionType,
    PrivateIdentifier, PropertyDefinitionType, PropertyKey, SimpleAssignmentTarget, Statement,
    UpdateOperator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::SPAN;
use oxc_syntax::scope::ScopeFlags;

use super::super::class_fields::{ClassFields, StateField, class_fields, key_name, member_name};
use super::super::javascript::without_typescript;
use super::declarators::{Lowering, rune_value};
use super::writes::assignment_value;
use super::{ScriptRewrite, Target};
use crate::lower::builder::Runtime;

/// The state fields of the classes the rewrite is inside, innermost last.
#[derive(Default)]
pub(in crate::lower) struct Classes {
    stack: Vec<ClassFields>,
    /// Upstream's `in_constructor`: the constructor's own body reads a state field's `v`
    /// directly, and so does the value of a state field it declares.
    in_constructor: bool,
    /// The next function is a constructor's.
    constructor_next: bool,
}

impl<'o> ScriptRewrite<'_, 'o> {
    /// Upstream's `visit_function`: only a constructor's own body is in the constructor.
    pub(super) fn class_function(&mut self, it: &mut Function<'o>, flags: ScopeFlags) {
        let constructor = std::mem::take(&mut self.classes.constructor_next);
        let previous = std::mem::replace(&mut self.classes.in_constructor, constructor);
        walk_mut::walk_function(self, it, flags);
        self.classes.in_constructor = previous;
    }

    pub(super) fn class_arrow(&mut self, it: &mut ArrowFunctionExpression<'o>) {
        let previous = std::mem::replace(&mut self.classes.in_constructor, false);
        walk_mut::walk_arrow_function_expression(self, it);
        self.classes.in_constructor = previous;
    }

    pub(super) fn class_method(&mut self, it: &mut MethodDefinition<'o>) {
        self.classes.constructor_next = it.kind == MethodDefinitionKind::Constructor;
        walk_mut::walk_method_definition(self, it);
    }

    fn field(&self, name: &str) -> Option<&StateField> {
        self.classes.stack.last()?.get(name)
    }

    /// Upstream `ClassBody`: each state field becomes its signal and, when public, accessors.
    pub(super) fn class_body(&mut self, body: &mut ClassBody<'o>) {
        // Validation has raised the errors this analysis finds.
        let fields = class_fields(self.res, body).unwrap_or_default();
        if fields.is_empty() {
            self.classes.stack.push(fields);
            walk_mut::walk_class_body(self, body);
            self.classes.stack.pop();
            return;
        }
        let b = self.b;
        let elements = body.body.take_in(b);
        let mut out = ArenaVec::with_capacity_in(elements.len() + 3 * fields.len(), b);
        // The fields the constructor declares get their signal and accessors first.
        for field in fields.iter() {
            if field.constructor
                && !field.is_private()
                && (self.target == Target::Client || !field.is_state())
            {
                out.push(private_field(b, &field.key, None));
                out.extend(self.accessors(field, b.key(&field.name), b.key(&field.name)));
            }
        }
        self.classes.stack.push(fields);
        for mut element in elements {
            let field = match &element {
                ClassElement::PropertyDefinition(p) => {
                    key_name(&p.key).and_then(|name| self.field(&name)).cloned()
                }
                _ => None,
            };
            let (Some(field), ClassElement::PropertyDefinition(p)) = (field, &mut element) else {
                self.visit_class_element(&mut element);
                out.push(element);
                continue;
            };
            let declares = field.at == p.span;
            if field.is_private() || (declares && self.target == Target::Server && field.is_state())
            {
                if declares {
                    p.value = p.value.take().and_then(|v| self.field_value(v, true));
                } else if let Some(value) = &mut p.value {
                    self.visit_expression(value);
                }
                out.push(element);
            } else if declares {
                let value = p.value.take().and_then(|v| self.field_value(v, true));
                out.push(private_field(b, &field.key, value));
                let key = p.key.clone_in_with_semantic_ids(b.allocator());
                let setter = match self.target {
                    Target::Client => p.key.take_in(b),
                    Target::Server => b.key(&field.name),
                };
                out.extend(self.accessors(&field, key, setter));
            } else if self.target == Target::Server && field.is_state() {
                // Upstream drops another definition of a field the constructor declares, but
                // the server keeps a plain state field as it is.
                self.visit_class_element(&mut element);
                out.push(element);
            }
        }
        self.classes.stack.pop();
        body.body = out;
    }

    /// The value of the rune call `value` that declares a state field; on the server, `None`
    /// for a field `$state()` leaves without one.
    fn field_value(&mut self, value: Expression<'o>, definition: bool) -> Option<Expression<'o>> {
        let b = self.b;
        let Some((rune, argument)) = self.res.rune(value.get_inner_expression()) else {
            let mut value = value;
            self.visit_expression(&mut value);
            return Some(value);
        };
        // Upstream decides on the argument as written.
        let proxy = rune == "$state"
            && argument.is_some_and(|a| self.res.should_proxy(a.get_inner_expression()));
        let Expression::CallExpression(mut call) = without_typescript(value) else {
            unreachable!("a rune is a call")
        };
        let mut argument = (call.arguments.first_mut())
            .map(|a| without_typescript(a.take_in(b).into_expression()));
        if definition && argument.is_none() && self.target == Target::Server {
            return None;
        }
        if let Some(argument) = &mut argument {
            self.visit_expression(argument);
        }
        let lowering = Lowering {
            proxy,
            signal: true,
            keeps: true,
        };
        Some(rune_value(self, rune, argument, lowering))
    }

    /// The getter and the setter of a public state field: on the client they read and write
    /// its signal, on the server they call its derived.
    fn accessors(
        &self,
        field: &StateField,
        getter: PropertyKey<'o>,
        setter: PropertyKey<'o>,
    ) -> [ClassElement<'o>; 2] {
        let b = self.b;
        let signal = || this_private(b, &field.key);
        let (read, parameter, write) = match self.target {
            Target::Client => {
                let mut arguments = vec![signal(), b.id("value")];
                if field.rune == "$state" {
                    arguments.push(b.boolean(true));
                }
                let write = b.stmt(b.runtime("set", arguments));
                (b.runtime("get", [signal()]), "value", write)
            }
            Target::Server => {
                let write = b.return_(Some(b.call(signal(), [b.id("$$value")])));
                (b.call(signal(), []), "$$value", write)
            }
        };
        [
            method(
                b,
                MethodDefinitionKind::Get,
                getter,
                b.params([]),
                b.return_(Some(read)),
            ),
            method(
                b,
                MethodDefinitionKind::Set,
                setter,
                b.params([parameter]),
                write,
            ),
        ]
    }

    /// Upstream `MemberExpression`: a read of a private state field reads its signal, or on the
    /// server calls its derived.
    pub(super) fn class_read(&self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::PrivateFieldExpression(member) = it else {
            return None;
        };
        let field = self.field(&format!("#{}", member.field.name))?;
        let b = self.b;
        match self.target {
            Target::Client if self.classes.in_constructor && field.is_state() => {
                Some(b.member(it.take_in(b), "v"))
            }
            Target::Client => Some(b.runtime("get", [it.take_in(b)])),
            Target::Server if !field.is_state() => Some(b.call(it.take_in(b), [])),
            Target::Server => None,
        }
    }

    /// Upstream's assignments to a state field: the constructor's declaration of one, and a
    /// write to a private one.
    pub(super) fn class_assign(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::AssignmentExpression(assign) = it else {
            return None;
        };
        let member = assign.left.as_member_expression()?;
        let computed = member.is_computed();
        let field = self.field(&member_name(member)?)?.clone();
        let b = self.b;
        if field.constructor && field.at == assign.span {
            let previous = self.classes.in_constructor;
            self.classes.in_constructor = self.target == Target::Client && field.is_state();
            let value = self.field_value(assign.right.take_in(b), false);
            self.classes.in_constructor = previous;
            // The server keeps a state field, and a computed key, as written.
            let keeps = self.target == Target::Server
                && (field.is_private() || field.is_state() || computed);
            let target = if keeps {
                assign.left.take_in(b)
            } else {
                private_target(b, &field.key)
            };
            return Some(b.assign(assign.operator, target, value?));
        }
        let AssignmentTarget::PrivateFieldExpression(private) = &assign.left else {
            return None;
        };
        let on_this = matches!(private.object, Expression::ThisExpression(_));
        let left =
            Expression::PrivateFieldExpression(private.clone_in_with_semantic_ids(b.allocator()));
        // The server calls a private derived with its new value, and writes the rest as written.
        if self.target == Target::Server && (field.is_state() || !on_this) {
            return None;
        }
        let operator = assign.operator;
        let logical = operator.to_logical_operator();
        let mut value = assign.right.take_in(b);
        self.visit_expression(&mut value);
        let current =
            |rw: &Self, mut left: Expression<'o>| rw.class_read(&mut left).expect("a state field");
        if self.target == Target::Server {
            let read = (operator != AssignmentOperator::Assign)
                .then(|| current(self, left.clone_in_with_semantic_ids(b.allocator())));
            return Some(b.call(left, [assignment_value(b, operator, read, value)]));
        }
        let read = (operator != AssignmentOperator::Assign && logical.is_none())
            .then(|| current(self, left.clone_in_with_semantic_ids(b.allocator())));
        let value = assignment_value(b, operator, read, value);
        let coerces = !matches!(
            operator,
            AssignmentOperator::Assign
                | AssignmentOperator::LogicalOr
                | AssignmentOperator::LogicalAnd
                | AssignmentOperator::LogicalNullish
        );
        let proxy = field.rune == "$state" && !coerces && self.res.should_proxy(&value);
        let mut arguments = vec![left.clone_in_with_semantic_ids(b.allocator()), value];
        if proxy {
            arguments.push(b.boolean(true));
        }
        let set = b.runtime("set", arguments);
        Some(match logical {
            Some(logical) => b.logical(current(self, left), logical, set),
            None => set,
        })
    }

    /// Upstream `UpdateExpression` of a private state field on the client.
    pub(super) fn class_update(&self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let Expression::UpdateExpression(update) = it else {
            return None;
        };
        let SimpleAssignmentTarget::PrivateFieldExpression(member) = &update.argument else {
            return None;
        };
        if self.target != Target::Client {
            return None;
        }
        self.field(&format!("#{}", member.field.name))?;
        let b = self.b;
        let argument =
            Expression::PrivateFieldExpression(member.clone_in_with_semantic_ids(b.allocator()));
        let mut arguments = vec![argument];
        if update.operator == UpdateOperator::Decrement {
            arguments.push(b.number(-1.0));
        }
        Some(b.runtime(
            if update.prefix {
                "update_pre"
            } else {
                "update"
            },
            arguments,
        ))
    }
}

/// `this.#key`.
fn this_private<'o>(b: &super::super::Builder<'o>, key: &str) -> Expression<'o> {
    Expression::new_private_field_expression(
        SPAN,
        b.this(),
        PrivateIdentifier::new(SPAN, b.str(key), b),
        false,
        b,
    )
}

fn private_target<'o>(b: &super::super::Builder<'o>, key: &str) -> AssignmentTarget<'o> {
    SimpleAssignmentTarget::from(this_private(b, key).into_member_expression()).into()
}

/// `#key = value;`
fn private_field<'o>(
    b: &super::super::Builder<'o>,
    key: &str,
    value: Option<Expression<'o>>,
) -> ClassElement<'o> {
    ClassElement::new_property_definition(
        SPAN,
        PropertyDefinitionType::PropertyDefinition,
        b.vec([]),
        PropertyKey::new_private_identifier(SPAN, b.str(key), b),
        None,
        value,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        None,
        b,
    )
}

fn method<'o>(
    b: &super::super::Builder<'o>,
    kind: MethodDefinitionKind,
    key: PropertyKey<'o>,
    parameters: oxc_allocator::Box<'o, oxc_ast::ast::FormalParameters<'o>>,
    body: Statement<'o>,
) -> ClassElement<'o> {
    let Expression::FunctionExpression(function) =
        b.function_expression(None, parameters, [body], false)
    else {
        unreachable!("a function expression")
    };
    ClassElement::new_method_definition(
        SPAN,
        MethodDefinitionType::MethodDefinition,
        b.vec([]),
        key,
        function,
        kind,
        false,
        false,
        false,
        false,
        None,
        b,
    )
}
