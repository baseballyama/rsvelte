use oxc_ast::ast::{
    ForStatementInit, UpdateOperator, VariableDeclaration, VariableDeclarationKind,
};

use super::{
    BinaryOperator, Builder, Expression, LogicalOperator, Names, SPAN, SimpleAssignmentTarget,
    Statement, UnaryOperator, conditional,
};

/// `function includeBooleanAttr(value) { return !!value || value === ''; }`
pub(super) fn include_boolean_attribute<'a>(
    b: &Builder<'a>,
    name: &str,
    names: &mut Names<'_>,
) -> Statement<'a> {
    let v = names.fresh("value");
    let truthy = b.unary(
        UnaryOperator::LogicalNot,
        b.unary(UnaryOperator::LogicalNot, b.id(&v)),
    );
    let empty = b.binary(b.id(&v), BinaryOperator::StrictEquality, b.string(""));
    let or = b.logical(truthy, LogicalOperator::Or, empty);
    b.function_declaration(
        name,
        b.parameters([v.as_str()]),
        [b.return_(Some(or))],
        false,
    )
}

/// `function renderable(value) { return typeof value === 'string' || … ? value : undefined; }`
pub(super) fn renderable<'a>(b: &Builder<'a>, name: &str, names: &mut Names<'_>) -> Statement<'a> {
    let v = names.fresh("value");
    let is = |ty: &str| {
        b.binary(
            b.unary(UnaryOperator::Typeof, b.id(&v)),
            BinaryOperator::StrictEquality,
            b.string(ty),
        )
    };
    let test = b.logical(
        b.logical(is("string"), LogicalOperator::Or, is("number")),
        LogicalOperator::Or,
        is("boolean"),
    );
    let c = conditional(b, test, b.id(&v), b.id("undefined"));
    b.function_declaration(
        name,
        b.parameters([v.as_str()]),
        [b.return_(Some(c))],
        false,
    )
}

/// `for (let i = 0; i < length; i++) body`.
fn counted_for<'a>(
    b: &Builder<'a>,
    i: &str,
    length: Expression<'a>,
    body: Statement<'a>,
) -> Statement<'a> {
    let declarator = b.declarator(b.binding(i), Some(b.number(0.0)));
    let init = VariableDeclaration::boxed(
        SPAN,
        VariableDeclarationKind::Let,
        b.vec([declarator]),
        false,
        b,
    );
    let test = b.binary(b.id(i), BinaryOperator::LessThan, length);
    let target = SimpleAssignmentTarget::new_assignment_target_identifier(SPAN, b.str(i), b);
    let update =
        Expression::new_update_expression(SPAN, UpdateOperator::Increment, false, target, b);
    Statement::new_for_statement(
        SPAN,
        Some(ForStatementInit::VariableDeclaration(init)),
        Some(test),
        Some(update),
        body,
        b,
    )
}

/// Vue's directive hooks, run on a Svelte element:
///
/// ```js
/// const bindings = new WeakMap();
/// function vmodel(dir, value, modifiers, props) {
///   if (dir.deep) traverse(value);
///   return (el) => untrack(() => {
///     const vnode = { props };
///     let binding = bindings.get(el);
///     if (binding === undefined) {
///       binding = { value, oldValue: undefined, modifiers };
///       bindings.set(el, binding);
///       dir.created?.(el, binding, vnode);
///       dir.mounted?.(el, binding, vnode);
///     } else {
///       binding.oldValue = binding.value;
///       binding.value = value;
///       dir.beforeUpdate?.(el, binding, vnode);
///       dir.updated?.(el, binding, vnode);
///     }
///   });
/// }
/// function traverse(value, seen = new Set()) {
///   if (typeof value !== 'object' || value === null || seen.has(value)) return;
///   seen.add(value);
///   if (Array.isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], seen);
///   else if (value instanceof Set || value instanceof Map)
///     value.forEach((v) => traverse(v, seen));
///   else if (Object.prototype.toString.call(value) === '[object Object]') {
///     const keys = Object.keys(value);
///     for (let i = 0; i < keys.length; i++) traverse(value[keys[i]], seen);
///   }
/// }
/// ```
///
/// The getter runs in the attachment's tracked scope, so a deep directive (`vModelCheckbox`,
/// `vModelSelect`) re-runs its update hooks when the value changes inside, as reactivity-core's
/// `traverse` makes a Vue render do; the hooks themselves run untracked, as Vue runs them with
/// tracking paused.
#[expect(
    clippy::too_many_lines,
    reason = "builds one helper, one node at a time"
)]
pub(super) fn vmodel<'a>(
    b: &Builder<'a>,
    name: &str,
    untrack: &str,
    names: &mut Names<'_>,
) -> Vec<Statement<'a>> {
    let bindings = names.fresh("vmodelBindings");
    let traverse = names.fresh("traverse");
    let (dir, value, modifiers, props) = (
        names.fresh("dir"),
        names.fresh("value"),
        names.fresh("modifiers"),
        names.fresh("props"),
    );
    let (el, vnode, binding) = (
        names.fresh("el"),
        names.fresh("vnode"),
        names.fresh("binding"),
    );
    let (seen, item, i) = (names.fresh("seen"), names.fresh("item"), names.fresh("i"));
    let keys = names.fresh("keys");
    let hook = |hook: &str| {
        let callee = b.member(b.id(&dir), hook);
        b.statement(b.optional_call(callee, [b.id(&el), b.id(&binding), b.id(&vnode)]))
    };
    let set_property = |object: &str, property: &str, value: Expression<'a>| {
        b.statement(b.assign_member(b.member(b.id(object), property), value))
    };

    let bindings_declaration = b.const_(&bindings, b.new_(b.id("WeakMap"), []));

    // The hooks.
    let vnode_object = b.object([b.init("props", b.id(&props))]);
    let created = b.block([
        b.statement(b.assign_name(
            &binding,
            b.object([
                b.init("value", b.id(&value)),
                b.init("oldValue", b.id("undefined")),
                b.init("modifiers", b.id(&modifiers)),
            ]),
        )),
        b.statement(b.call(
            b.member(b.id(&bindings), "set"),
            [b.id(&el), b.id(&binding)],
        )),
        hook("created"),
        hook("mounted"),
    ]);
    let updated = b.block([
        set_property(&binding, "oldValue", b.member(b.id(&binding), "value")),
        set_property(&binding, "value", b.id(&value)),
        hook("beforeUpdate"),
        hook("updated"),
    ]);
    let is_new = b.binary(
        b.id(&binding),
        BinaryOperator::StrictEquality,
        b.id("undefined"),
    );
    let inner = [
        b.const_(&vnode, vnode_object),
        b.let_(
            &binding,
            Some(b.call(b.member(b.id(&bindings), "get"), [b.id(&el)])),
        ),
        b.if_(is_new, created, Some(updated)),
    ];
    let untracked = b.arrow_block(b.parameters([]), inner, false);
    let attachment = b.arrow(
        b.parameters([el.as_str()]),
        b.call(b.id(untrack), [untracked]),
    );
    let body = [
        b.if_(
            b.member(b.id(&dir), "deep"),
            b.statement(b.call(b.id(&traverse), [b.id(&value)])),
            None,
        ),
        b.return_(Some(attachment)),
    ];
    let vmodel = b.function_declaration(
        name,
        b.parameters([
            dir.as_str(),
            value.as_str(),
            modifiers.as_str(),
            props.as_str(),
        ]),
        body,
        false,
    );

    // traverse(value, seen = new Set())
    let recurse =
        |argument: Expression<'a>| b.statement(b.call(b.id(&traverse), [argument, b.id(&seen)]));
    let not_object = b.binary(
        b.unary(UnaryOperator::Typeof, b.id(&value)),
        BinaryOperator::StrictInequality,
        b.string("object"),
    );
    let is_null = b.binary(b.id(&value), BinaryOperator::StrictEquality, b.null());
    let has = b.call(b.member(b.id(&seen), "has"), [b.id(&value)]);
    let skip = b.logical(
        b.logical(not_object, LogicalOperator::Or, is_null),
        LogicalOperator::Or,
        has,
    );
    let for_array = counted_for(
        b,
        &i,
        b.member(b.id(&value), "length"),
        recurse(b.computed(b.id(&value), b.id(&i))),
    );
    let is_array = b.call(b.member(b.id("Array"), "isArray"), [b.id(&value)]);
    let each_item = b.arrow(
        b.parameters([item.as_str()]),
        b.call(b.id(&traverse), [b.id(&item), b.id(&seen)]),
    );
    let for_each = b.statement(b.call(b.member(b.id(&value), "forEach"), [each_item]));
    let instance = |class: &str| b.binary(b.id(&value), BinaryOperator::Instanceof, b.id(class));
    let collection = b.logical(instance("Set"), LogicalOperator::Or, instance("Map"));
    // `for (const key in value)` would visit inherited keys: a `for` over `Object.keys`.
    let keys_declaration = b.const_(
        &keys,
        b.call(b.member(b.id("Object"), "keys"), [b.id(&value)]),
    );
    let for_keys = counted_for(
        b,
        &i,
        b.member(b.id(&keys), "length"),
        recurse(b.computed(b.id(&value), b.computed(b.id(&keys), b.id(&i)))),
    );
    let to_string = b.member(
        b.member(b.member(b.id("Object"), "prototype"), "toString"),
        "call",
    );
    let is_plain = b.binary(
        b.call(to_string, [b.id(&value)]),
        BinaryOperator::StrictEquality,
        b.string("[object Object]"),
    );
    let object_branch = b.if_(is_plain, b.block([keys_declaration, for_keys]), None);
    let collection_branch = b.if_(collection, for_each, Some(object_branch));
    let body = [
        b.if_(skip, b.return_(None), None),
        b.statement(b.call(b.member(b.id(&seen), "add"), [b.id(&value)])),
        b.if_(is_array, for_array, Some(collection_branch)),
    ];
    let parameters = b.formal_parameters([
        b.parameter(b.binding(&value)),
        b.default_parameter(&seen, b.new_(b.id("Set"), [])),
    ]);
    let traverse_declaration = b.function_declaration(&traverse, parameters, body, false);
    vec![bindings_declaration, vmodel, traverse_declaration]
}
