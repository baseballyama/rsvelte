use super::{
    BinaryOperator, Class, FxHashMap, Helper, Info, Kind, LogicalOperator, Names, NodeIdentifier,
    Prop, R, Rewriter, SingleFileComponent, SourceLocation, SyntaxTree, UnaryOperator, copy, flag,
    fresh, span_of, unsupported, vue_call,
};

/// The instance script.
///
/// # Errors
///
/// A refusal for what the script does that svue does not translate.
pub(crate) fn emit(
    sfc: &SingleFileComponent,
    info: &Info<'_>,
    attributes: Option<&str>,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> R<Vec<NodeIdentifier>> {
    let from = &sfc.javascript;
    let mut out = props_declarations(info, attributes, to, names);
    let Kind::Program(body) = from.kind(sfc.program) else {
        unreachable!("a script parses to a program")
    };
    let aliases = FxHashMap::default();
    let mut rewriter = Rewriter::new(info, false, &aliases);
    for &statement in body {
        match from.kind(statement) {
            Kind::Import { .. }
            | Kind::TypeScriptDeclaration
            | Kind::TypeScriptInterface { .. } => {}
            _ if info
                .resolution
                .define_props
                .is_some_and(|p| p.statement == statement) =>
            {
                let Kind::VariableDeclaration { declarations, .. } = from.kind(statement) else {
                    continue;
                };
                if declarations.len() > 1 {
                    return Err(unsupported(
                        "`defineProps` declared beside other variables",
                        span_of(from, statement),
                    ));
                }
            }
            Kind::ExpressionStatement(e)
                if vue_call(from, &info.class, info.resolution, e) == Some("onMounted") =>
            {
                out.push(on_mounted(info, &mut rewriter, e, to, names)?);
            }
            Kind::VariableDeclaration { kind, declarations } => {
                let mut lowered = Vec::with_capacity(declarations.len());
                let mut runes = false;
                for &d in declarations {
                    let (l, rune) = declarator(info, &mut rewriter, d, to)?;
                    runes |= rune;
                    lowered.push(l);
                }
                let kind = if runes { flag::LET } else { kind };
                out.push(to.var_declaration(kind, &lowered, from.source_location(statement)));
            }
            _ => out.push(rewriter.copy(to, statement)?),
        }
    }
    Ok(out)
}

/// One declarator; `true` when it became a rune declaration, which Svelte declares with `let`.
pub(super) fn declarator(
    info: &Info<'_>,
    rewriter: &mut Rewriter<'_>,
    d: NodeIdentifier,
    to: &mut SyntaxTree,
) -> R<(NodeIdentifier, bool)> {
    let from = info.from;
    let Kind::Declarator {
        identifier,
        initializer: Some(initializer),
    } = from.kind(d)
    else {
        return Ok((rewriter.copy(to, d)?, false));
    };
    let class = match from.kind(identifier) {
        Kind::Identifier(_) => info.class_of(identifier),
        _ => None,
    };
    let Some(class) = class else {
        return Ok((rewriter.copy(to, d)?, false));
    };
    let Kind::Call { arguments, .. } = from.kind(initializer) else {
        unreachable!("classified declarations call a Vue API")
    };
    let arg = match arguments {
        [] => None,
        &[a] => Some(a),
        _ => {
            return Err(unsupported(
                "more than one argument",
                span_of(from, initializer),
            ));
        }
    };
    let (rune, value) = match class {
        Class::Ref => {
            if let Some(a) = arg
                && !fresh(info, a)
            {
                return Err(unsupported(
                    "`ref` of a value created elsewhere (Vue's `reactive` and Svelte's `$state` \
                     proxy different objects; only literals and primitive props are translated)",
                    span_of(from, a),
                ));
            }
            ("$state", arg)
        }
        Class::Reactive => match arg {
            Some(a)
                if matches!(from.kind(a), Kind::Object(_) | Kind::Array(_)) && fresh(info, a) =>
            {
                ("$state", Some(a))
            }
            _ => {
                return Err(unsupported(
                    "`reactive` of anything but an object or array literal",
                    span_of(from, initializer),
                ));
            }
        },
        Class::Computed => match arg {
            Some(a)
                if matches!(
                    from.kind(a),
                    Kind::Arrow { parameters: [], .. }
                        | Kind::Function {
                            parameters: [],
                            declaration: false,
                            ..
                        }
                ) =>
            {
                ("$derived.by", Some(a))
            }
            _ => {
                return Err(unsupported(
                    "`computed` of anything but a getter function without parameters",
                    span_of(from, initializer),
                ));
            }
        },
        Class::Props | Class::Vue(_) => unreachable!("not a declaration emit translates"),
    };
    let callee = rune_callee(to, rune);
    let value: Vec<NodeIdentifier> = value
        .map(|v| rewriter.copy(to, v))
        .transpose()?
        .into_iter()
        .collect();
    let call = to.call(callee, &value, false, from.source_location(initializer));
    let target = to.ident(from.name(identifier), from.source_location(identifier));
    Ok((
        to.declarator(target, Some(call), from.source_location(d)),
        true,
    ))
}

pub(super) fn rune_callee(to: &mut SyntaxTree, rune: &str) -> NodeIdentifier {
    match rune.split_once('.') {
        Some((object, property)) => {
            let o = to.identifier(object);
            to.dot(o, property)
        }
        None => to.identifier(rune),
    }
}

/// `onMounted(fn)` → `onMount(() => { fn(); })`: Svelte's `onMount` treats a returned function as
/// a teardown, Vue's `onMounted` ignores what the hook returns.
pub(super) fn on_mounted(
    info: &Info<'_>,
    rewriter: &mut Rewriter<'_>,
    call: NodeIdentifier,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> R<NodeIdentifier> {
    let from = info.from;
    let Kind::Call { arguments, .. } = from.kind(call) else {
        unreachable!("a call")
    };
    let hook = match arguments {
        &[h] if matches!(
            from.kind(h),
            Kind::Arrow { .. }
                | Kind::Function {
                    declaration: false,
                    ..
                }
        ) =>
        {
            h
        }
        _ => {
            return Err(unsupported(
                "`onMounted` with anything but a function literal",
                span_of(from, call),
            ));
        }
    };
    let hook = rewriter.copy(to, hook)?;
    let invoke = to.call0(hook, &[]);
    let statement = to.expression_statement(invoke);
    let block = to.block(&[statement], SourceLocation::SYNTHETIC);
    let wrapper = to.arrow(&[], block, false, false, SourceLocation::SYNTHETIC);
    let on_mount = names.helper(from, Helper::OnMount);
    let callee = to.identifier(&on_mount);
    let c = to.call(callee, &[wrapper], false, from.source_location(call));
    Ok(to.expression_statement_at(c, from.source_location(call)))
}

/// `let { a = 1, b, ...rest } = $props()`, then each `Boolean` prop resolved from `rest`, then the
/// attributes that fall through.
pub(super) fn props_declarations(
    info: &Info<'_>,
    attributes: Option<&str>,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> Vec<NodeIdentifier> {
    let from = info.from;
    let mut out = Vec::new();
    let booleans: Vec<&Prop> = info.props.iter().filter(|p| p.boolean.is_some()).collect();
    if info.props.is_empty() && attributes.is_none() {
        return out;
    }
    let rest = (!booleans.is_empty() || attributes.is_some()).then(|| names.fresh(from, "rest"));
    let mut pattern = Vec::new();
    for p in info.props.iter().filter(|p| p.boolean.is_none()) {
        let key = to.identifier(&p.key);
        let local = to.identifier(&p.var);
        let value = p.default.map_or(local, |d| {
            let d = copy(from, to, &mut rsvelte_typescript::copy::Verbatim, d);
            to.assign_pat(local, d, SourceLocation::SYNTHETIC)
        });
        let shorthand = p.key == p.var && p.default.is_none();
        let flags = if shorthand { flag::SHORTHAND } else { 0 };
        pattern.push(to.property(key, value, flags, SourceLocation::SYNTHETIC));
    }
    if let Some(r) = &rest {
        let r = to.identifier(r);
        pattern.push(to.rest(r, SourceLocation::SYNTHETIC));
    }
    let pattern = to.object_pat(&pattern, SourceLocation::SYNTHETIC);
    let props = to.identifier("$props");
    let call = to.call0(props, &[]);
    out.push(to.let_(flag::LET, pattern, Some(call)));
    let rest = rest.as_deref().unwrap_or_default();
    for p in &booleans {
        out.push(boolean_prop(info, p, rest, to, names));
    }
    if let Some(attributes) = attributes {
        out.push(fallthrough(info, rest, attributes, to, names));
    }
    out
}

/// runtime-core `resolvePropValue` for a `Boolean` prop: the default when the value is
/// `undefined`, then `false` when it is absent with no default, else `true` for `''` or the key
/// itself when `Boolean` comes before `String` in its types.
pub(super) fn boolean_prop(
    info: &Info<'_>,
    p: &Prop,
    rest: &str,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> NodeIdentifier {
    let from = info.from;
    let cast_true = p.boolean.unwrap_or_default();
    let value = names.fresh(from, "value");
    let mut body = Vec::new();
    let read = {
        let r = to.identifier(rest);
        to.dot(r, &p.key)
    };
    let v = to.identifier(&value);
    body.push(to.let_(flag::LET, v, Some(read)));
    if let Some(d) = p.default {
        let v = to.identifier(&value);
        let undefined = to.identifier("undefined");
        let test = to.binary(
            BinaryOperator::StrictEq,
            v,
            undefined,
            SourceLocation::SYNTHETIC,
        );
        let v = to.identifier(&value);
        let d = copy(from, to, &mut rsvelte_typescript::copy::Verbatim, d);
        let set = to.assign(
            rsvelte_typescript::operators::AssignmentOperator::Assign,
            v,
            d,
            SourceLocation::SYNTHETIC,
        );
        let set = to.expression_statement(set);
        body.push(to.if_(test, set, None, SourceLocation::SYNTHETIC));
    } else {
        let key = to.write_string(&p.key);
        let r = to.identifier(rest);
        let has = to.binary(BinaryOperator::In, key, r, SourceLocation::SYNTHETIC);
        let absent = to.unary(UnaryOperator::Not, has, SourceLocation::SYNTHETIC);
        let f = to.write_boolean(false, SourceLocation::SYNTHETIC);
        let early = to.return_(Some(f), SourceLocation::SYNTHETIC);
        body.push(to.if_(absent, early, None, SourceLocation::SYNTHETIC));
    }
    if cast_true {
        let v = to.identifier(&value);
        let empty = to.write_string("");
        let is_empty = to.binary(
            BinaryOperator::StrictEq,
            v,
            empty,
            SourceLocation::SYNTHETIC,
        );
        let v = to.identifier(&value);
        let key = to.write_string(&p.key);
        let is_key = to.binary(BinaryOperator::StrictEq, v, key, SourceLocation::SYNTHETIC);
        let test = to.logical(
            LogicalOperator::Or,
            is_empty,
            is_key,
            SourceLocation::SYNTHETIC,
        );
        let t = to.write_boolean(true, SourceLocation::SYNTHETIC);
        let early = to.return_(Some(t), SourceLocation::SYNTHETIC);
        body.push(to.if_(test, early, None, SourceLocation::SYNTHETIC));
    }
    let v = to.identifier(&value);
    body.push(to.return_(Some(v), SourceLocation::SYNTHETIC));
    let block = to.block(&body, SourceLocation::SYNTHETIC);
    let getter = to.arrow(&[], block, false, false, SourceLocation::SYNTHETIC);
    let callee = rune_callee(to, "$derived.by");
    let call = to.call0(callee, &[getter]);
    let target = to.identifier(&p.var);
    to.let_(flag::LET, target, Some(call))
}

#[expect(
    clippy::many_single_char_names,
    reason = "builds JavaScript one node at a time"
)]
/// runtime-core's `attrs`: what the parent passes that is not a declared prop nor reserved
/// (`isReservedProp`).
pub(super) fn fallthrough(
    info: &Info<'_>,
    rest: &str,
    attributes: &str,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> NodeIdentifier {
    let from = info.from;
    let a = names.fresh(from, "fallthrough");
    let mut body = Vec::new();
    let r = to.identifier(rest);
    let spread = to.spread(r, SourceLocation::SYNTHETIC);
    let object = to.object(&[spread], SourceLocation::SYNTHETIC);
    let target = to.identifier(&a);
    body.push(to.let_(flag::CONST, target, Some(object)));
    let reserved = ["", "key", "ref", "ref_for", "ref_key"];
    let hooks = [
        "onVnodeBeforeMount",
        "onVnodeMounted",
        "onVnodeBeforeUpdate",
        "onVnodeUpdated",
        "onVnodeBeforeUnmount",
        "onVnodeUnmounted",
    ];
    let booleans = info
        .props
        .iter()
        .filter(|p| p.boolean.is_some())
        .map(|p| p.key.as_str());
    for key in booleans.chain(reserved).chain(hooks) {
        let o = to.identifier(&a);
        let k = to.write_string(key);
        let m = to.member(o, k, true, false, SourceLocation::SYNTHETIC);
        let del = to.unary(UnaryOperator::Delete, m, SourceLocation::SYNTHETIC);
        body.push(to.expression_statement(del));
    }
    let o = to.identifier(&a);
    body.push(to.return_(Some(o), SourceLocation::SYNTHETIC));
    let block = to.block(&body, SourceLocation::SYNTHETIC);
    let getter = to.arrow(&[], block, false, false, SourceLocation::SYNTHETIC);
    let callee = rune_callee(to, "$derived.by");
    let call = to.call0(callee, &[getter]);
    let target = to.identifier(attributes);
    to.let_(flag::LET, target, Some(call))
}
