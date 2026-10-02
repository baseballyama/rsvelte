use super::{
    AssignmentOperator, BinaryOperator, LogicalOperator, Names, NodeIdentifier, SourceLocation,
    SyntaxTree, UnaryOperator, flag,
};

pub(super) fn function_declaration(
    to: &mut SyntaxTree,
    name: &str,
    parameters: &[&str],
    body: &[NodeIdentifier],
) -> NodeIdentifier {
    let name = to.identifier(name);
    let parameters: Vec<NodeIdentifier> = parameters.iter().map(|p| to.identifier(p)).collect();
    let block = to.block(body, SourceLocation::SYNTHETIC);
    to.function(
        true,
        Some(name),
        &parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    )
}

/// `function includeBooleanAttr(value) { return !!value || value === ''; }`
pub(super) fn include_boolean_attribute(
    to: &mut SyntaxTree,
    name: &str,
    names: &mut Names,
    from: &SyntaxTree,
) -> NodeIdentifier {
    let v = names.fresh(from, "value");
    let a = to.identifier(&v);
    let not = to.unary(UnaryOperator::Not, a, SourceLocation::SYNTHETIC);
    let not = to.unary(UnaryOperator::Not, not, SourceLocation::SYNTHETIC);
    let a = to.identifier(&v);
    let empty = to.write_string("");
    let eq = to.binary(
        BinaryOperator::StrictEq,
        a,
        empty,
        SourceLocation::SYNTHETIC,
    );
    let or = to.logical(LogicalOperator::Or, not, eq, SourceLocation::SYNTHETIC);
    let ret = to.return_(Some(or), SourceLocation::SYNTHETIC);
    function_declaration(to, name, &[&v], &[ret])
}

/// `function renderable(value) { return typeof value === 'string' || … ? value : undefined; }`
pub(super) fn renderable(
    to: &mut SyntaxTree,
    name: &str,
    names: &mut Names,
    from: &SyntaxTree,
) -> NodeIdentifier {
    let v = names.fresh(from, "value");
    let mut test = None;
    for ty in ["string", "number", "boolean"] {
        let a = to.identifier(&v);
        let t = to.unary(UnaryOperator::TypeOf, a, SourceLocation::SYNTHETIC);
        let s = to.write_string(ty);
        let eq = to.binary(BinaryOperator::StrictEq, t, s, SourceLocation::SYNTHETIC);
        test = Some(test.map_or(eq, |l| {
            to.logical(LogicalOperator::Or, l, eq, SourceLocation::SYNTHETIC)
        }));
    }
    let a = to.identifier(&v);
    let undefined = to.identifier("undefined");
    let c = to.cond(
        test.expect("three types"),
        a,
        undefined,
        SourceLocation::SYNTHETIC,
    );
    let ret = to.return_(Some(c), SourceLocation::SYNTHETIC);
    function_declaration(to, name, &[&v], &[ret])
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
///   else if (Object.prototype.toString.call(value) === '[object Object]')
///     for (const key of Object.keys(value)) traverse(value[key], seen);
/// }
/// ```
///
/// The getter runs in the attachment's tracked scope, so a deep directive (`vModelCheckbox`,
/// `vModelSelect`) re-runs its update hooks when the value changes inside, as reactivity-core's
/// `traverse` makes a Vue render do; the hooks themselves run untracked, as Vue runs them with
/// tracking paused.
#[expect(
    clippy::too_many_lines,
    clippy::many_single_char_names,
    reason = "builds one helper, one node at a time"
)]
pub(super) fn vmodel(
    to: &mut SyntaxTree,
    name: &str,
    untrack: &str,
    names: &mut Names,
    from: &SyntaxTree,
) -> Vec<NodeIdentifier> {
    let bindings = names.fresh(from, "vmodelBindings");
    let traverse = names.fresh(from, "traverse");
    let n = |names: &mut Names, base: &str| names.fresh(from, base);
    let (dir, value, modifiers, props) = (
        n(names, "dir"),
        n(names, "value"),
        n(names, "modifiers"),
        n(names, "props"),
    );
    let (el, vnode, binding) = (n(names, "el"), n(names, "vnode"), n(names, "binding"));
    let (seen, item, i) = (n(names, "seen"), n(names, "item"), n(names, "i"));
    let identifier = |to: &mut SyntaxTree, s: &str| to.identifier(s);
    let statement = |to: &mut SyntaxTree, e: NodeIdentifier| to.expression_statement(e);
    let hook = |to: &mut SyntaxTree, hook: &str| {
        let d = to.identifier(&dir);
        let h = to.identifier(hook);
        let callee = to.member(d, h, false, false, SourceLocation::SYNTHETIC);
        let arguments = [
            to.identifier(&el),
            to.identifier(&binding),
            to.identifier(&vnode),
        ];
        let call = to.call(callee, &arguments, true, SourceLocation::SYNTHETIC);
        to.expression_statement(call)
    };
    let set_prop = |to: &mut SyntaxTree, object: &str, prop: &str, value: NodeIdentifier| {
        let o = to.identifier(object);
        let target = to.dot(o, prop);
        let a = to.assign(
            AssignmentOperator::Assign,
            target,
            value,
            SourceLocation::SYNTHETIC,
        );
        to.expression_statement(a)
    };

    let weak_map = identifier(to, "WeakMap");
    let new_map = to.new_(weak_map, &[], SourceLocation::SYNTHETIC);
    let b = identifier(to, &bindings);
    let bindings_declaration = to.let_(flag::CONST, b, Some(new_map));

    // The hooks.
    let mut inner = Vec::new();
    let props_ref = identifier(to, &props);
    let props_key = identifier(to, "props");
    let vnode_props = to.property(props_key, props_ref, 0, SourceLocation::SYNTHETIC);
    let vnode_obj = to.object(&[vnode_props], SourceLocation::SYNTHETIC);
    let vn = identifier(to, &vnode);
    inner.push(to.let_(flag::CONST, vn, Some(vnode_obj)));
    let b = identifier(to, &bindings);
    let get = to.dot(b, "get");
    let e = identifier(to, &el);
    let get = to.call0(get, &[e]);
    let bn = identifier(to, &binding);
    inner.push(to.let_(flag::LET, bn, Some(get)));
    let bn = identifier(to, &binding);
    let undefined = identifier(to, "undefined");
    let test = to.binary(
        BinaryOperator::StrictEq,
        bn,
        undefined,
        SourceLocation::SYNTHETIC,
    );
    let mut created = Vec::new();
    let fields: Vec<NodeIdentifier> = [
        ("value", value.as_str()),
        ("oldValue", "undefined"),
        ("modifiers", modifiers.as_str()),
    ]
    .iter()
    .map(|&(k, v)| {
        let key = to.identifier(k);
        let val = to.identifier(v);
        to.property(key, val, 0, SourceLocation::SYNTHETIC)
    })
    .collect();
    let obj = to.object(&fields, SourceLocation::SYNTHETIC);
    let bn = identifier(to, &binding);
    let a = to.assign(
        AssignmentOperator::Assign,
        bn,
        obj,
        SourceLocation::SYNTHETIC,
    );
    created.push(statement(to, a));
    let b = identifier(to, &bindings);
    let set = to.dot(b, "set");
    let arguments = [identifier(to, &el), identifier(to, &binding)];
    let set = to.call0(set, &arguments);
    created.push(statement(to, set));
    created.push(hook(to, "created"));
    created.push(hook(to, "mounted"));
    let created = to.block(&created, SourceLocation::SYNTHETIC);
    let mut updated = Vec::new();
    let bn = identifier(to, &binding);
    let old = to.dot(bn, "value");
    updated.push(set_prop(to, &binding, "oldValue", old));
    let v = identifier(to, &value);
    updated.push(set_prop(to, &binding, "value", v));
    updated.push(hook(to, "beforeUpdate"));
    updated.push(hook(to, "updated"));
    let updated = to.block(&updated, SourceLocation::SYNTHETIC);
    inner.push(to.if_(test, created, Some(updated), SourceLocation::SYNTHETIC));
    let inner = to.block(&inner, SourceLocation::SYNTHETIC);
    let untracked = to.arrow(&[], inner, false, false, SourceLocation::SYNTHETIC);
    let u = identifier(to, untrack);
    let call = to.call0(u, &[untracked]);
    let e = identifier(to, &el);
    let attachment = to.arrow(&[e], call, true, false, SourceLocation::SYNTHETIC);
    let mut body = Vec::new();
    let d = identifier(to, &dir);
    let deep = to.dot(d, "deep");
    let t = identifier(to, &traverse);
    let v = identifier(to, &value);
    let call = to.call0(t, &[v]);
    let call = statement(to, call);
    body.push(to.if_(deep, call, None, SourceLocation::SYNTHETIC));
    body.push(to.return_(Some(attachment), SourceLocation::SYNTHETIC));
    let vmodel = function_declaration(to, name, &[&dir, &value, &modifiers, &props], &body);

    // traverse(value, seen = new Set())
    let mut body = Vec::new();
    let v = identifier(to, &value);
    let ty = to.unary(UnaryOperator::TypeOf, v, SourceLocation::SYNTHETIC);
    let object = to.write_string("object");
    let not_object = to.binary(
        BinaryOperator::StrictNotEq,
        ty,
        object,
        SourceLocation::SYNTHETIC,
    );
    let v = identifier(to, &value);
    let null = to.null(SourceLocation::SYNTHETIC);
    let is_null = to.binary(BinaryOperator::StrictEq, v, null, SourceLocation::SYNTHETIC);
    let s = identifier(to, &seen);
    let has = to.dot(s, "has");
    let v = identifier(to, &value);
    let has = to.call0(has, &[v]);
    let test = to.logical(
        LogicalOperator::Or,
        not_object,
        is_null,
        SourceLocation::SYNTHETIC,
    );
    let test = to.logical(LogicalOperator::Or, test, has, SourceLocation::SYNTHETIC);
    let ret = to.return_(None, SourceLocation::SYNTHETIC);
    body.push(to.if_(test, ret, None, SourceLocation::SYNTHETIC));
    let s = identifier(to, &seen);
    let add = to.dot(s, "add");
    let v = identifier(to, &value);
    let add = to.call0(add, &[v]);
    body.push(statement(to, add));
    let recurse = |to: &mut SyntaxTree, arg: NodeIdentifier| {
        let t = to.identifier(&traverse);
        let s = to.identifier(&seen);
        let call = to.call0(t, &[arg, s]);
        to.expression_statement(call)
    };
    // for (let i = 0; i < value.length; i++) traverse(value[i], seen);
    let i0 = identifier(to, &i);
    let zero = to.write_number(0.0, SourceLocation::SYNTHETIC);
    let initializer = to.let_(flag::LET, i0, Some(zero));
    let iv = identifier(to, &i);
    let v = identifier(to, &value);
    let len = to.dot(v, "length");
    let lt = to.binary(BinaryOperator::Lt, iv, len, SourceLocation::SYNTHETIC);
    let iv = identifier(to, &i);
    let inc = to.update(
        rsvelte_typescript::operators::UpdateOperator::Inc,
        false,
        iv,
        SourceLocation::SYNTHETIC,
    );
    let v = identifier(to, &value);
    let iv = identifier(to, &i);
    let at = to.member(v, iv, true, false, SourceLocation::SYNTHETIC);
    let each_index = recurse(to, at);
    let for_array = to.for_(
        Some(initializer),
        Some(lt),
        Some(inc),
        each_index,
        SourceLocation::SYNTHETIC,
    );
    let array = identifier(to, "Array");
    let is_array = to.dot(array, "isArray");
    let v = identifier(to, &value);
    let is_array = to.call0(is_array, &[v]);
    // value.forEach((item) => traverse(item, seen));
    let v = identifier(to, &value);
    let for_each = to.dot(v, "forEach");
    let it = identifier(to, &item);
    let t = identifier(to, &traverse);
    let s = identifier(to, &seen);
    let it2 = identifier(to, &item);
    let rec = to.call0(t, &[it2, s]);
    let cb = to.arrow(&[it], rec, true, false, SourceLocation::SYNTHETIC);
    let for_each = to.call0(for_each, &[cb]);
    let for_each = statement(to, for_each);
    let mut collection = None;
    for class in ["Set", "Map"] {
        let v = identifier(to, &value);
        let c = identifier(to, class);
        let is_instance = to.binary(BinaryOperator::InstanceOf, v, c, SourceLocation::SYNTHETIC);
        collection = Some(collection.map_or(is_instance, |l| {
            to.logical(
                LogicalOperator::Or,
                l,
                is_instance,
                SourceLocation::SYNTHETIC,
            )
        }));
    }
    // for (const key in value) traverse(value[key], seen) — as a `for` over `Object.keys`, the
    // statement forms this tree has.
    let keys = n(names, "keys");
    let object = identifier(to, "Object");
    let object_keys = to.dot(object, "keys");
    let v = identifier(to, &value);
    let all_keys = to.call0(object_keys, &[v]);
    let k = identifier(to, &keys);
    let keys_declaration = to.let_(flag::CONST, k, Some(all_keys));
    let i0 = identifier(to, &i);
    let zero = to.write_number(0.0, SourceLocation::SYNTHETIC);
    let initializer = to.let_(flag::LET, i0, Some(zero));
    let iv = identifier(to, &i);
    let k = identifier(to, &keys);
    let len = to.dot(k, "length");
    let lt = to.binary(BinaryOperator::Lt, iv, len, SourceLocation::SYNTHETIC);
    let iv = identifier(to, &i);
    let inc = to.update(
        rsvelte_typescript::operators::UpdateOperator::Inc,
        false,
        iv,
        SourceLocation::SYNTHETIC,
    );
    let v = identifier(to, &value);
    let k = identifier(to, &keys);
    let iv = identifier(to, &i);
    let key_at = to.member(k, iv, true, false, SourceLocation::SYNTHETIC);
    let at = to.member(v, key_at, true, false, SourceLocation::SYNTHETIC);
    let each_key = recurse(to, at);
    let for_keys = to.for_(
        Some(initializer),
        Some(lt),
        Some(inc),
        each_key,
        SourceLocation::SYNTHETIC,
    );
    let object_body = to.block(&[keys_declaration, for_keys], SourceLocation::SYNTHETIC);
    let object = identifier(to, "Object");
    let proto = to.dot(object, "prototype");
    let to_string = to.dot(proto, "toString");
    let call = to.dot(to_string, "call");
    let v = identifier(to, &value);
    let tag = to.call0(call, &[v]);
    let plain = to.write_string("[object Object]");
    let is_plain = to.binary(
        BinaryOperator::StrictEq,
        tag,
        plain,
        SourceLocation::SYNTHETIC,
    );
    let object_branch = to.if_(is_plain, object_body, None, SourceLocation::SYNTHETIC);
    let collection_branch = to.if_(
        collection.expect("two classes"),
        for_each,
        Some(object_branch),
        SourceLocation::SYNTHETIC,
    );
    body.push(to.if_(
        is_array,
        for_array,
        Some(collection_branch),
        SourceLocation::SYNTHETIC,
    ));
    let s = identifier(to, &seen);
    let set = identifier(to, "Set");
    let new_set = to.new_(set, &[], SourceLocation::SYNTHETIC);
    let seen_param = to.assign_pat(s, new_set, SourceLocation::SYNTHETIC);
    let tn = identifier(to, &traverse);
    let vp = identifier(to, &value);
    let block = to.block(&body, SourceLocation::SYNTHETIC);
    let traverse_declaration = to.function(
        true,
        Some(tn),
        &[vp, seen_param],
        block,
        false,
        SourceLocation::SYNTHETIC,
    );
    vec![bindings_declaration, vmodel, traverse_declaration]
}
