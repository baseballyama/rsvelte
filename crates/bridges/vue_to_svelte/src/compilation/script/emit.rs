use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    Argument, BinaryOperator, BindingProperty, BindingRestElement, LogicalOperator,
    VariableDeclarator,
};
use oxc_span::SPAN;
use rsvelte_typescript_compile::build::Builder;

use super::{
    BindingPattern, Class, Expression, FxHashMap, GetSpan, Helper, Info, Names, Prop, R, Rewriter,
    SingleFileComponent, Statement, UnaryOperator, VariableDeclarationKind, fresh, is_type_only,
    span_of, unsupported, unwrap_typescript, vue_call,
};

/// The instance script.
///
/// # Errors
///
/// A refusal for what the script does that svue does not translate.
pub(crate) fn emit<'a>(
    sfc: &SingleFileComponent,
    info: &Info<'_>,
    attributes: Option<&str>,
    b: &Builder<'a>,
    names: &mut Names<'_>,
) -> R<Vec<Statement<'a>>> {
    let program = info.from.get_program(sfc.program);
    let mut out = props_declarations(info, attributes, b, names);
    let define_props = info.resolution.define_props();
    let aliases = FxHashMap::default();
    let mut rewriter = Rewriter::new(info, b, false, &aliases);
    for statement in &program.body {
        match statement {
            Statement::ImportDeclaration(_) => {}
            s if is_type_only(s) => {}
            s if define_props.is_some_and(|p| std::ptr::eq(p.statement, s)) => {
                if let Statement::VariableDeclaration(d) = s
                    && d.declarations.len() > 1
                {
                    return Err(unsupported(
                        "`defineProps` declared beside other variables",
                        span_of(d.span),
                    ));
                }
            }
            Statement::ExpressionStatement(s)
                if vue_call(&info.class, info.resolution, &s.expression) == Some("onMounted") =>
            {
                out.push(on_mounted(&mut rewriter, &s.expression, b, names)?);
            }
            Statement::VariableDeclaration(d) => {
                let mut lowered = Vec::with_capacity(d.declarations.len());
                let mut runes = false;
                for declarator in &d.declarations {
                    let (l, rune) = lower_declarator(info, &mut rewriter, declarator, b)?;
                    runes |= rune;
                    lowered.push(l);
                }
                let kind = if runes {
                    VariableDeclarationKind::Let
                } else {
                    d.kind
                };
                out.push(Statement::new_variable_declaration(
                    d.span,
                    kind,
                    b.vec(lowered),
                    false,
                    b,
                ));
            }
            s => out.push(rewriter.statement(s)?),
        }
    }
    Ok(out)
}

/// One declarator; `true` when it became a rune declaration, which Svelte declares with `let`.
fn lower_declarator<'a>(
    info: &Info<'_>,
    rewriter: &mut Rewriter<'_, '_, 'a>,
    d: &VariableDeclarator<'_>,
    b: &Builder<'a>,
) -> R<(VariableDeclarator<'a>, bool)> {
    let (BindingPattern::BindingIdentifier(identifier), Some(initializer)) = (&d.id, &d.init)
    else {
        return Ok((rewriter.declarator(d)?, false));
    };
    let class = identifier
        .symbol_id
        .get()
        .and_then(|s| info.class.get(&s).copied());
    let Some(class) = class else {
        return Ok((rewriter.declarator(d)?, false));
    };
    let Expression::CallExpression(call) = unwrap_typescript(initializer) else {
        unreachable!("classified declarations call a Vue API")
    };
    let argument = match call.arguments.as_slice() {
        [] => None,
        [a] => Some(a),
        _ => {
            return Err(unsupported(
                "more than one argument",
                span_of(initializer.span()),
            ));
        }
    };
    let value = argument.and_then(Argument::as_expression);
    let (rune, value) = match class {
        Class::Ref => {
            if let Some(a) = argument
                && !value.is_some_and(|v| fresh(info, v))
            {
                return Err(unsupported(
                    "`ref` of a value created elsewhere (Vue's `reactive` and Svelte's `$state` \
                     proxy different objects; only literals and primitive props are translated)",
                    span_of(a.span()),
                ));
            }
            ("$state", value)
        }
        Class::Reactive => match value {
            Some(v)
                if matches!(
                    unwrap_typescript(v),
                    Expression::ObjectExpression(_) | Expression::ArrayExpression(_)
                ) && fresh(info, v) =>
            {
                ("$state", Some(v))
            }
            _ => {
                return Err(unsupported(
                    "`reactive` of anything but an object or array literal",
                    span_of(initializer.span()),
                ));
            }
        },
        Class::Computed => match value {
            Some(v) if is_getter(unwrap_typescript(v)) => ("$derived.by", Some(v)),
            _ => {
                return Err(unsupported(
                    "`computed` of anything but a getter function without parameters",
                    span_of(initializer.span()),
                ));
            }
        },
        Class::Props | Class::Vue(_) => unreachable!("not a declaration emit translates"),
    };
    let value = value.map(|v| rewriter.expression(v)).transpose()?;
    let call = Expression::new_call_expression(
        initializer.span(),
        rune_callee(b, rune),
        None,
        b.vec(value.map(Argument::from)),
        false,
        b,
    );
    let target = b.binding_at(identifier.name.as_str(), identifier.span);
    Ok((
        VariableDeclarator::new(d.span, target, None, Some(call), false, b),
        true,
    ))
}

/// A function literal without parameters.
fn is_getter(e: &Expression<'_>) -> bool {
    match e {
        Expression::ArrowFunctionExpression(f) => f.params.is_empty(),
        Expression::FunctionExpression(f) => f.params.is_empty(),
        _ => false,
    }
}

fn rune_callee<'a>(b: &Builder<'a>, rune: &str) -> Expression<'a> {
    match rune.split_once('.') {
        Some((object, property)) => b.member(b.id(object), property),
        None => b.id(rune),
    }
}

/// `onMounted(fn)` → `onMount(() => { fn(); })`: Svelte's `onMount` treats a returned function as
/// a teardown, Vue's `onMounted` ignores what the hook returns.
fn on_mounted<'a>(
    rewriter: &mut Rewriter<'_, '_, 'a>,
    e: &Expression<'_>,
    b: &Builder<'a>,
    names: &mut Names<'_>,
) -> R<Statement<'a>> {
    let Expression::CallExpression(call) = unwrap_typescript(e) else {
        unreachable!("`vue_call` found a call")
    };
    let hook = match call.arguments.as_slice() {
        [h] => h.as_expression().filter(|h| {
            matches!(
                h,
                Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_)
            )
        }),
        _ => None,
    };
    let Some(hook) = hook else {
        return Err(unsupported(
            "`onMounted` with anything but a function literal",
            span_of(call.span),
        ));
    };
    let hook = rewriter.expression(hook)?;
    let wrapper = b.arrow_block(b.parameters([]), [b.statement(b.call(hook, []))], false);
    let on_mount = names.helper(Helper::OnMount);
    let c = Expression::new_call_expression(
        call.span,
        b.id(&on_mount),
        None,
        b.vec([Argument::from(wrapper)]),
        false,
        b,
    );
    Ok(Statement::new_expression_statement(call.span, c, b))
}

/// `let { a = 1, b, ...rest } = $props()`, then each `Boolean` prop resolved from `rest`, then the
/// attributes that fall through.
fn props_declarations<'a>(
    info: &Info<'_>,
    attributes: Option<&str>,
    b: &Builder<'a>,
    names: &mut Names<'_>,
) -> Vec<Statement<'a>> {
    let mut out = Vec::new();
    let booleans: Vec<&Prop<'_>> = info.props.iter().filter(|p| p.boolean.is_some()).collect();
    if info.props.is_empty() && attributes.is_none() {
        return out;
    }
    let rest = (!booleans.is_empty() || attributes.is_some()).then(|| names.fresh("rest"));
    let properties = info.props.iter().filter(|p| p.boolean.is_none()).map(|p| {
        let local = b.binding(&p.var);
        let value = match p.default {
            Some(d) => {
                BindingPattern::new_assignment_pattern(SPAN, local, d.clone_in(b.allocator()), b)
            }
            None => local,
        };
        BindingProperty::new(SPAN, b.key(&p.key), value, p.key == p.var, false, b)
    });
    let properties = b.vec(properties);
    let rest_element = rest
        .as_deref()
        .map(|r| BindingRestElement::boxed(SPAN, b.binding(r), b));
    let pattern = BindingPattern::new_object_pattern(SPAN, properties, rest_element, b);
    out.push(b.declaration(
        VariableDeclarationKind::Let,
        [b.declarator(pattern, Some(b.call(b.id("$props"), [])))],
    ));
    if let Some(rest) = &rest {
        for p in &booleans {
            out.push(boolean_prop(p, rest, b, names));
        }
        if let Some(attributes) = attributes {
            out.push(fallthrough(info, rest, attributes, b, names));
        }
    }
    out
}

/// runtime-core `resolvePropValue` for a `Boolean` prop: the default when the value is
/// `undefined`, then `false` when it is absent with no default, else `true` for `''` or the key
/// itself when `Boolean` comes before `String` in its types.
fn boolean_prop<'a>(
    p: &Prop<'_>,
    rest: &str,
    b: &Builder<'a>,
    names: &mut Names<'_>,
) -> Statement<'a> {
    let value = names.fresh("value");
    let mut body = vec![b.let_(&value, Some(b.member(b.id(rest), &p.key)))];
    if let Some(d) = p.default {
        let test = b.binary(
            b.id(&value),
            BinaryOperator::StrictEquality,
            b.id("undefined"),
        );
        let set = b.statement(b.assign_name(&value, d.clone_in(b.allocator())));
        body.push(b.if_(test, set, None));
    } else {
        let has = b.binary(b.string(&p.key), BinaryOperator::In, b.id(rest));
        let absent = b.unary(UnaryOperator::LogicalNot, has);
        body.push(b.if_(absent, b.return_(Some(b.boolean(false))), None));
    }
    if p.boolean == Some(true) {
        let is_empty = b.binary(b.id(&value), BinaryOperator::StrictEquality, b.string(""));
        let is_key = b.binary(
            b.id(&value),
            BinaryOperator::StrictEquality,
            b.string(&p.key),
        );
        let test = b.logical(is_empty, LogicalOperator::Or, is_key);
        body.push(b.if_(test, b.return_(Some(b.boolean(true))), None));
    }
    body.push(b.return_(Some(b.id(&value))));
    let getter = b.arrow_block(b.parameters([]), body, false);
    b.let_(
        &p.var,
        Some(b.call(rune_callee(b, "$derived.by"), [getter])),
    )
}

/// runtime-core's `attrs`: what the parent passes that is not a declared prop nor reserved
/// (`isReservedProp`).
fn fallthrough<'a>(
    info: &Info<'_>,
    rest: &str,
    attributes: &str,
    b: &Builder<'a>,
    names: &mut Names<'_>,
) -> Statement<'a> {
    let a = names.fresh("fallthrough");
    let mut body = vec![b.const_(&a, b.object([b.spread_property(b.id(rest))]))];
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
        let member = b.computed(b.id(&a), b.string(key));
        body.push(b.statement(b.unary(UnaryOperator::Delete, member)));
    }
    body.push(b.return_(Some(b.id(&a))));
    let getter = b.arrow_block(b.parameters([]), body, false);
    b.let_(
        attributes,
        Some(b.call(rune_callee(b, "$derived.by"), [getter])),
    )
}
