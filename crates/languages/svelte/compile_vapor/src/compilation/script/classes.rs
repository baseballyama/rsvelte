//! A class with `$state` and `$derived` fields: each field a hidden private cell behind a getter
//! and a setter of its own name.

use oxc_allocator::GetAllocator;
use oxc_ast::ast::{
    AssignmentExpression, Class, ClassElement, Expression, MethodDefinitionKind,
    MethodDefinitionType, PropertyDefinitionType, PropertyKey,
};
use oxc_ast_visit::VisitMut;
use oxc_span::SPAN;
use rsvelte_typescript_compile::build::Builder;

use super::constructors::key_name;
use super::emit::{ScriptRewrite, rune_value};
use super::{FxHashMap, FxHashSet, runes};

impl<'t> ScriptRewrite<'_, 't> {
    /// Whether the server stores `rune` as a plain value rather than a cell.
    fn plain(&self, rune: &str) -> bool {
        self.server && matches!(rune, "$state" | "$state.raw")
    }

    /// The value of `this.x = $state(v)` in a constructor, assigned to the field's cell.
    pub(super) fn constructor_assignment(
        &mut self,
        a: &mut AssignmentExpression<'t>,
    ) -> Expression<'t> {
        let b = self.b;
        let (rune, _) = self.res.rune(&a.right).expect("a checked constructor rune");
        let plain = self.plain(rune);
        let Expression::CallExpression(call) = &mut a.right else {
            unreachable!("a rune is a call")
        };
        let mut argument = call
            .arguments
            .pop()
            .map(oxc_ast::ast::Argument::into_expression);
        if let Some(argument) = &mut argument {
            self.visit_expression(argument);
        }
        let value = if plain {
            argument.unwrap_or_else(|| b.id("undefined"))
        } else {
            rune_value(b, rune, argument, self.tracking).expect("a checked value rune")
        };
        let target = if plain {
            oxc_allocator::TakeIn::take_in(&mut a.left, b)
        } else {
            let storage = &self.constructor_storage[&a.node_id.get()];
            let member = this_member(b, storage);
            oxc_ast::ast::AssignmentTarget::from(oxc_ast::ast::SimpleAssignmentTarget::from(
                member.into_member_expression(),
            ))
        };
        b.assign(a.operator, target, value)
    }

    /// Rewrites `class` in place.
    pub(super) fn class(&mut self, class: &mut Class<'t>) {
        let b = self.b;
        let (mut private_fields, mut occupied) = self.context(class);
        let mut output = Vec::new();
        let mut next = 0;
        let constructor_fields = self.prepare_constructor(
            class,
            &mut occupied,
            &mut next,
            &mut output,
            &mut private_fields,
        );
        self.private_fields.push(private_fields);
        if let Some(heritage) = &mut class.heritage {
            self.visit_expression(&mut heritage.expression);
        }
        let members = std::mem::replace(&mut class.body.body, b.vec([]));
        for mut member in members {
            if let ClassElement::PropertyDefinition(p) = &member
                && p.value.is_none()
                && let Some(key) = key_name(&p.key)
                && !key.starts_with('#')
                && constructor_fields.contains(&key)
            {
                continue;
            }
            let rune = match &member {
                ClassElement::PropertyDefinition(p) if !p.computed => p
                    .value
                    .as_ref()
                    .and_then(|v| self.res.rune(v))
                    .map(|(name, _)| name)
                    .filter(|name| runes::value(name)),
                _ => None,
            };
            let (Some(rune), ClassElement::PropertyDefinition(p)) = (rune, &mut member) else {
                self.visit_class_element(&mut member);
                output.push(member);
                continue;
            };
            let plain = self.plain(rune);
            let mut value = p.value.take().expect("checked");
            let value = if plain {
                let Expression::CallExpression(call) = &mut value else {
                    unreachable!("a rune is a call")
                };
                match call.arguments.pop() {
                    Some(argument) => {
                        let mut argument = argument.into_expression();
                        self.visit_expression(&mut argument);
                        argument
                    }
                    None => b.id("undefined"),
                }
            } else {
                self.visit_expression(&mut value);
                value
            };
            if plain || matches!(p.key, PropertyKey::PrivateIdentifier(_)) {
                p.value = Some(value);
                output.push(member);
                continue;
            }
            let hidden = fresh(&mut occupied, &mut next);
            output.push(field(b, &hidden, Some(value), p.r#static));
            let key = std::mem::replace(&mut p.key, b.key("x"));
            accessors(b, key, &hidden, p.r#static, &mut output);
        }
        class.body.body = b.vec(output);
        self.private_fields.pop();
    }

    /// The class's private fields, whether each stores a cell, and every name its members use.
    fn context(&self, class: &Class<'_>) -> (FxHashMap<String, bool>, FxHashSet<String>) {
        let mut private_fields = FxHashMap::default();
        let mut occupied = FxHashSet::default();
        for member in &class.body.body {
            let key = match member {
                ClassElement::PropertyDefinition(p) => {
                    if let PropertyKey::PrivateIdentifier(id) = &p.key {
                        let reactive = p
                            .value
                            .as_ref()
                            .and_then(|v| self.res.rune(v))
                            .is_some_and(|(name, _)| runes::value(name) && !self.plain(name));
                        private_fields.insert(format!("#{}", id.name), reactive);
                    }
                    &p.key
                }
                ClassElement::MethodDefinition(m) => &m.key,
                _ => continue,
            };
            occupied.extend(key_name(key));
        }
        (private_fields, occupied)
    }

    /// The cells of the fields the constructor assigns runes to, declared before the members.
    fn prepare_constructor(
        &mut self,
        class: &Class<'_>,
        occupied: &mut FxHashSet<String>,
        next: &mut usize,
        output: &mut Vec<ClassElement<'t>>,
        private_fields: &mut FxHashMap<String, bool>,
    ) -> FxHashSet<String> {
        let b = self.b;
        let mut names = FxHashSet::default();
        let Some(fields) = self.constructors.classes.get(&class.node_id.get()) else {
            return names;
        };
        for f in fields {
            let plain = self.plain(f.rune);
            if f.property.starts_with('#') {
                private_fields.insert(f.property.clone(), !plain);
                self.constructor_storage
                    .insert(f.assignment, f.property.clone());
            } else if !plain {
                names.insert(f.property.clone());
                let hidden = fresh(occupied, next);
                self.constructor_storage
                    .insert(f.assignment, hidden.clone());
                output.push(field(b, &hidden, None, false));
                accessors(b, b.key(&f.property), &hidden, false, output);
            }
        }
        names
    }
}

/// `this.#name`, or `this.name`.
fn this_member<'t>(b: &Builder<'t>, name: &str) -> Expression<'t> {
    match name.strip_prefix('#') {
        Some(private) => Expression::new_private_field_expression(
            SPAN,
            b.this(),
            oxc_ast::ast::PrivateIdentifier::new(SPAN, b.str(private), b),
            false,
            b,
        ),
        None => b.member(b.this(), name),
    }
}

/// `get key() { return this.#hidden.value; }` and `set key($$value) { … }`.
fn accessors<'t>(
    b: &Builder<'t>,
    key: PropertyKey<'t>,
    hidden: &str,
    is_static: bool,
    output: &mut Vec<ClassElement<'t>>,
) {
    let value = || b.member(this_member(b, hidden), "value");
    let getter = b.function_expression(None, b.params([]), [b.return_(Some(value()))], false);
    let setter = b.function_expression(
        None,
        b.params(["$$value"]),
        [b.stmt(b.assign_member(value(), b.id("$$value")))],
        false,
    );
    for (function, kind) in [
        (getter, MethodDefinitionKind::Get),
        (setter, MethodDefinitionKind::Set),
    ] {
        let Expression::FunctionExpression(function) = function else {
            unreachable!("a function")
        };
        output.push(ClassElement::new_method_definition(
            SPAN,
            MethodDefinitionType::MethodDefinition,
            b.vec([]),
            oxc_allocator::CloneIn::clone_in(&key, b.allocator()),
            function,
            kind,
            false,
            is_static,
            false,
            false,
            None,
            b,
        ));
    }
}

/// `#hidden = value;`.
fn field<'t>(
    b: &Builder<'t>,
    hidden: &str,
    value: Option<Expression<'t>>,
    is_static: bool,
) -> ClassElement<'t> {
    let name = hidden.strip_prefix('#').expect("a hidden field is private");
    let key = PropertyKey::new_private_identifier(SPAN, b.str(name), b);
    ClassElement::new_property_definition(
        SPAN,
        PropertyDefinitionType::PropertyDefinition,
        b.vec([]),
        key,
        None,
        value,
        false,
        is_static,
        false,
        false,
        false,
        false,
        false,
        None,
        b,
    )
}

fn fresh(occupied: &mut FxHashSet<String>, next: &mut usize) -> String {
    loop {
        let name = format!("#$$v_state_{next}");
        *next += 1;
        if occupied.insert(name.clone()) {
            return name;
        }
    }
}
