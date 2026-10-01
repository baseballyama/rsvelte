//! `<script setup>` to a runes instance script.

use rsv_js::ast::{TsKind, flag};
use rsv_js::copy::copy;
use rsv_js::ops::{BinOp, LogicalOp, UnaryOp};
use rsv_js::scope::BindingId;
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::source::Loc;
use rsv_vue::ast::Sfc;
use rsv_vue::resolve::Resolution;
use rustc_hash::FxHashMap;

use crate::cx::{Class, Helper, Info, Names, Prop, R, Rewriter, span_of, unsupported};

const VUE_APIS: [&str; 4] = ["ref", "computed", "reactive", "onMounted"];

/// Vue's prop type constructors whose values are primitives.
const PRIMITIVE_TYPES: [&str; 4] = ["String", "Number", "Boolean", "Symbol"];

/// What every script binding becomes, and the props `defineProps` declares.
///
/// # Errors
///
/// A refusal for an import, a declaration or a prop declaration svue does not translate.
pub(crate) fn classify(
    sfc: &Sfc,
    res: &Resolution,
    src: &str,
    names: &mut Names,
) -> R<(FxHashMap<BindingId, Class>, Vec<Prop>)> {
    let from = &sfc.js;
    let mut class = FxHashMap::default();
    let Kind::Program(body) = from.kind(sfc.program) else {
        unreachable!("a script parses to a program")
    };
    for &stmt in body {
        match from.kind(stmt) {
            Kind::Import {
                type_only: true, ..
            }
            | Kind::TsDecl
            | Kind::TsInterface { .. } => {}
            Kind::Import {
                specifiers, source, ..
            } => {
                if from.str_value(source, src) != "vue" {
                    return Err(unsupported(
                        "an import from a module other than `vue`",
                        span_of(from, stmt),
                    ));
                }
                for &sp in specifiers {
                    let api = match from.kind(sp) {
                        Kind::ImportNamed { imported, local }
                            if from.flags(sp) & flag::TYPE_ONLY == 0 =>
                        {
                            VUE_APIS
                                .iter()
                                .find(|&&a| a == from.name(imported))
                                .map(|&a| (a, local))
                        }
                        Kind::ImportNamed { .. } => continue,
                        _ => None,
                    };
                    let Some((api, local)) = api else {
                        return Err(unsupported(
                            "an import from `vue` other than `ref`, `computed`, `reactive` and \
                             `onMounted`",
                            span_of(from, sp),
                        ));
                    };
                    if let Some(b) = res.sem.binding_of(local) {
                        class.insert(b, Class::Vue(api));
                    }
                }
            }
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(unsupported(
                    "an export from `<script setup>`",
                    span_of(from, stmt),
                ));
            }
            _ => {}
        }
    }
    for &stmt in body {
        let Kind::VarDecl { kind, decls } = from.kind(stmt) else {
            continue;
        };
        for &d in decls {
            let Kind::Declarator {
                id,
                init: Some(init),
            } = from.kind(d)
            else {
                continue;
            };
            let api = vue_call(from, &class, res, init);
            let is_props = res.define_props.is_some_and(|p| p.call == init);
            let c = match api {
                Some("ref") => Class::Ref,
                Some("computed") => Class::Computed,
                Some("reactive") => Class::Reactive,
                Some(api) => {
                    return Err(unsupported(
                        format_args!("`{api}(…)` as a value"),
                        span_of(from, init),
                    ));
                }
                None if is_props => Class::Props,
                None => continue,
            };
            if kind != flag::CONST || !matches!(from.kind(id), Kind::Ident(_)) {
                return Err(unsupported(
                    "a ref, computed, reactive or props object not declared as `const name`",
                    span_of(from, d),
                ));
            }
            if let Some(b) = res.sem.binding_of(id) {
                class.insert(b, c);
            }
        }
    }
    let props = match res.define_props {
        Some(p) => props(sfc, res, src, p, names)?,
        None => Vec::new(),
    };
    Ok((class, props))
}

/// The Vue API `e` calls through its imported binding.
fn vue_call(
    from: &Ast,
    class: &FxHashMap<BindingId, Class>,
    res: &Resolution,
    e: NodeId,
) -> Option<&'static str> {
    let Kind::Call { callee, .. } = from.kind(e) else {
        return None;
    };
    if !matches!(from.kind(callee), Kind::Ident(_)) {
        return None;
    }
    match class.get(&res.sem.binding_of(callee)?) {
        Some(&Class::Vue(api)) => Some(api),
        _ => None,
    }
}

/// `defineProps`' runtime declaration (runtime-core `normalizePropsOptions`), for the shapes whose
/// resolution (`resolvePropValue`) svue reproduces.
fn props(
    sfc: &Sfc,
    res: &Resolution,
    src: &str,
    p: rsv_vue::resolve::DefineProps,
    names: &mut Names,
) -> R<Vec<Prop>> {
    let from = &sfc.js;
    let Kind::Call { callee, args, .. } = from.kind(p.call) else {
        unreachable!("`defineProps(…)` is a call")
    };
    if args.len() > 1
        || from
            .ts
            .iter()
            .any(|t| t.node == callee && t.kind == TsKind::TypeArgs)
    {
        return Err(unsupported(
            "a type-based `defineProps` declaration",
            span_of(from, p.call),
        ));
    }
    let mut out = Vec::new();
    let Some(runtime) = p.runtime else {
        return Ok(out);
    };
    let entries: Vec<(String, Option<NodeId>, rsv_kernel::source::Span)> = match from.kind(runtime)
    {
        Kind::Array(items) => items
            .iter()
            .map(|&i| match from.kind(i) {
                Kind::Str => Ok((from.str_value(i, src).to_owned(), None, span_of(from, i))),
                _ => Err(unsupported(
                    "a prop name other than a string literal",
                    span_of(from, i),
                )),
            })
            .collect::<R<_>>()?,
        Kind::Object(items) => items
            .iter()
            .map(|&i| match from.kind(i) {
                Kind::Property {
                    key,
                    value,
                    computed: false,
                    method: false,
                    ..
                } => {
                    let k = match from.kind(key) {
                        Kind::Ident(_) => from.name(key).to_owned(),
                        Kind::Str => from.str_value(key, src).to_owned(),
                        _ => return Err(unsupported("this prop key", span_of(from, key))),
                    };
                    Ok((k, Some(value), span_of(from, i)))
                }
                _ => Err(unsupported("this prop declaration", span_of(from, i))),
            })
            .collect::<R<_>>()?,
        _ => {
            return Err(unsupported(
                "a `defineProps` declaration other than an array or object literal",
                span_of(from, runtime),
            ));
        }
    };
    for (key, decl, span) in entries {
        check_prop_key(&key, span)?;
        if out.iter().any(|q: &Prop| q.key == key) {
            return Err(unsupported("a prop declared twice", span));
        }
        let (types, default) = match decl {
            None => (Vec::new(), None),
            Some(d) => prop_options(from, d)?,
        };
        let boolean = types.iter().position(|t| t == "Boolean").map(|b| {
            types
                .iter()
                .position(|t| t == "String")
                .is_none_or(|s| b < s)
        });
        let primitive =
            !types.is_empty() && types.iter().all(|t| PRIMITIVE_TYPES.contains(&t.as_str()));
        let var = if declares_anywhere(from, res, &key) {
            names.fresh(from, &key)
        } else {
            names.reserve(&key);
            key.clone()
        };
        out.push(Prop {
            key,
            var,
            boolean,
            default,
            primitive,
        });
    }
    Ok(out)
}

/// The key is passed under the same name to both runtimes and is a valid binding name: Vue
/// camelizes a hyphenated key and reserves `key` and `ref`, which Svelte does neither of.
fn check_prop_key(key: &str, span: rsv_kernel::source::Span) -> R<()> {
    let ident = key
        .chars()
        .next()
        .is_some_and(|c| c.is_ascii_lowercase() || c == '_')
        && key
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_');
    if !ident
        || is_reserved(key)
        || matches!(key, "key" | "ref" | "constructor")
        || key.starts_with("on")
    {
        return Err(unsupported(
            format_args!(
                "the prop name `{key}` (svue passes props whose names are lowercase identifiers, \
                 not reserved by JavaScript or Vue, and not `on…`)"
            ),
            span,
        ));
    }
    Ok(())
}

fn is_reserved(name: &str) -> bool {
    matches!(
        name,
        "await"
            | "break"
            | "case"
            | "catch"
            | "class"
            | "const"
            | "continue"
            | "debugger"
            | "default"
            | "delete"
            | "do"
            | "else"
            | "enum"
            | "export"
            | "extends"
            | "false"
            | "finally"
            | "for"
            | "function"
            | "if"
            | "implements"
            | "import"
            | "in"
            | "instanceof"
            | "interface"
            | "let"
            | "new"
            | "null"
            | "package"
            | "private"
            | "protected"
            | "public"
            | "return"
            | "static"
            | "super"
            | "switch"
            | "this"
            | "throw"
            | "true"
            | "try"
            | "typeof"
            | "var"
            | "void"
            | "while"
            | "with"
            | "yield"
            | "undefined"
            | "arguments"
            | "eval"
    )
}

/// Whether any binding, or any unresolved name, of the component is spelled `name`.
fn declares_anywhere(from: &Ast, res: &Resolution, name: &str) -> bool {
    res.sem
        .bindings
        .iter()
        .any(|b| from.atoms.get(b.name) == name)
        || res
            .sem
            .references
            .iter()
            .any(|r| r.binding.is_none() && from.name(r.node) == name)
}

/// A prop's types (constructor names) and literal default.
fn prop_options(from: &Ast, d: NodeId) -> R<(Vec<String>, Option<NodeId>)> {
    let types = |t: NodeId| -> R<Vec<String>> {
        match from.kind(t) {
            Kind::Ident(_) => Ok(vec![from.name(t).to_owned()]),
            Kind::Null => Ok(Vec::new()),
            Kind::Array(items) => items
                .iter()
                .map(|&i| match from.kind(i) {
                    Kind::Ident(_) => Ok(from.name(i).to_owned()),
                    _ => Err(unsupported(
                        "a prop type other than a constructor name",
                        span_of(from, i),
                    )),
                })
                .collect(),
            _ => Err(unsupported(
                "a prop type other than a constructor name",
                span_of(from, t),
            )),
        }
    };
    let Kind::Object(items) = from.kind(d) else {
        return Ok((types(d)?, None));
    };
    let (mut ty, mut default) = (Vec::new(), None);
    for &i in items {
        let Kind::Property {
            key,
            value,
            computed: false,
            method: false,
            ..
        } = from.kind(i)
        else {
            return Err(unsupported("this prop option", span_of(from, i)));
        };
        let k = match from.kind(key) {
            Kind::Ident(_) => from.name(key),
            _ => return Err(unsupported("this prop option", span_of(from, i))),
        };
        match k {
            "type" => ty = types(value)?,
            "default" if is_literal(from, value) => default = Some(value),
            "default" => {
                return Err(unsupported(
                    "a prop default other than a literal (Vue calls a function default once per \
                     instance)",
                    span_of(from, value),
                ));
            }
            "required" if matches!(from.kind(value), Kind::Bool(_)) => {}
            _ => {
                return Err(unsupported(
                    format_args!("the prop option `{k}`"),
                    span_of(from, i),
                ));
            }
        }
    }
    Ok((ty, default))
}

fn is_literal(from: &Ast, e: NodeId) -> bool {
    match from.kind(e) {
        Kind::Str | Kind::Num(_) | Kind::Bool(_) | Kind::Null => true,
        Kind::Unary(UnaryOp::Neg, a) => matches!(from.kind(a), Kind::Num(_)),
        _ => false,
    }
}

/// A value Vue's `ref` and Svelte's `$state` store alike: no object the component did not create
/// here, so neither runtime's proxy can be told apart from the other's.
fn fresh(info: &Info<'_>, e: NodeId) -> bool {
    let from = info.from;
    match from.kind(e) {
        Kind::Str
        | Kind::Num(_)
        | Kind::Bool(_)
        | Kind::Null
        | Kind::Arrow { .. }
        | Kind::Function { decl: false, .. } => true,
        Kind::Ident(_) => from.name(e) == "undefined" && info.res.sem.binding_of(e).is_none(),
        Kind::Unary(op, a) => op != UnaryOp::Delete && fresh(info, a),
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => fresh(info, l) && fresh(info, r),
        Kind::Cond { test, cons, alt } => {
            fresh(info, test) && fresh(info, cons) && fresh(info, alt)
        }
        Kind::Template { exprs, .. } => exprs.iter().all(|&x| fresh(info, x)),
        Kind::Array(items) => items.iter().all(|&i| fresh(info, i)),
        Kind::Object(props) => props.iter().all(|&p| match from.kind(p) {
            Kind::Property {
                value,
                computed: false,
                ..
            } => fresh(info, value),
            _ => false,
        }),
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } if matches!(from.kind(object), Kind::Ident(_))
            && info.class_of(object) == Some(Class::Props) =>
        {
            info.prop(from.name(property)).is_some_and(|p| p.primitive)
        }
        _ => false,
    }
}

/// The instance script.
///
/// # Errors
///
/// A refusal for what the script does that svue does not translate.
pub(crate) fn emit(
    sfc: &Sfc,
    info: &Info<'_>,
    attrs: Option<&str>,
    to: &mut Ast,
    names: &mut Names,
) -> R<Vec<NodeId>> {
    let from = &sfc.js;
    let mut out = props_declarations(info, attrs, to, names);
    let Kind::Program(body) = from.kind(sfc.program) else {
        unreachable!("a script parses to a program")
    };
    let aliases = FxHashMap::default();
    let mut rw = Rewriter::new(info, false, &aliases);
    for &stmt in body {
        match from.kind(stmt) {
            Kind::Import { .. } | Kind::TsDecl | Kind::TsInterface { .. } => {}
            _ if info.res.define_props.is_some_and(|p| p.stmt == stmt) => {
                let Kind::VarDecl { decls, .. } = from.kind(stmt) else {
                    continue;
                };
                if decls.len() > 1 {
                    return Err(unsupported(
                        "`defineProps` declared beside other variables",
                        span_of(from, stmt),
                    ));
                }
            }
            Kind::ExprStmt(e) if vue_call(from, &info.class, info.res, e) == Some("onMounted") => {
                out.push(on_mounted(info, &mut rw, e, to, names)?);
            }
            Kind::VarDecl { kind, decls } => {
                let mut lowered = Vec::with_capacity(decls.len());
                let mut runes = false;
                for &d in decls {
                    let (l, rune) = declarator(info, &mut rw, d, to)?;
                    runes |= rune;
                    lowered.push(l);
                }
                let kind = if runes { flag::LET } else { kind };
                out.push(to.var_decl(kind, &lowered, from.loc(stmt)));
            }
            _ => out.push(rw.copy(to, stmt)?),
        }
    }
    Ok(out)
}

/// One declarator; `true` when it became a rune declaration, which Svelte declares with `let`.
fn declarator(
    info: &Info<'_>,
    rw: &mut Rewriter<'_>,
    d: NodeId,
    to: &mut Ast,
) -> R<(NodeId, bool)> {
    let from = info.from;
    let Kind::Declarator {
        id,
        init: Some(init),
    } = from.kind(d)
    else {
        return Ok((rw.copy(to, d)?, false));
    };
    let class = match from.kind(id) {
        Kind::Ident(_) => info.class_of(id),
        _ => None,
    };
    let Some(class) = class else {
        return Ok((rw.copy(to, d)?, false));
    };
    let Kind::Call { args, .. } = from.kind(init) else {
        unreachable!("classified declarations call a Vue API")
    };
    let arg = match args {
        [] => None,
        &[a] => Some(a),
        _ => return Err(unsupported("more than one argument", span_of(from, init))),
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
                    span_of(from, init),
                ));
            }
        },
        Class::Computed => match arg {
            Some(a)
                if matches!(
                    from.kind(a),
                    Kind::Arrow { params: [], .. }
                        | Kind::Function {
                            params: [],
                            decl: false,
                            ..
                        }
                ) =>
            {
                ("$derived.by", Some(a))
            }
            _ => {
                return Err(unsupported(
                    "`computed` of anything but a getter function without parameters",
                    span_of(from, init),
                ));
            }
        },
        Class::Props | Class::Vue(_) => unreachable!("not a declaration emit translates"),
    };
    let callee = rune_callee(to, rune);
    let value: Vec<NodeId> = value
        .map(|v| rw.copy(to, v))
        .transpose()?
        .into_iter()
        .collect();
    let call = to.call(callee, &value, false, from.loc(init));
    let target = to.ident(from.name(id), from.loc(id));
    Ok((to.declarator(target, Some(call), from.loc(d)), true))
}

fn rune_callee(to: &mut Ast, rune: &str) -> NodeId {
    match rune.split_once('.') {
        Some((object, property)) => {
            let o = to.id(object);
            to.dot(o, property)
        }
        None => to.id(rune),
    }
}

/// `onMounted(fn)` → `onMount(() => { fn(); })`: Svelte's `onMount` treats a returned function as
/// a teardown, Vue's `onMounted` ignores what the hook returns.
fn on_mounted(
    info: &Info<'_>,
    rw: &mut Rewriter<'_>,
    call: NodeId,
    to: &mut Ast,
    names: &mut Names,
) -> R<NodeId> {
    let from = info.from;
    let Kind::Call { args, .. } = from.kind(call) else {
        unreachable!("a call")
    };
    let hook = match args {
        &[h] if matches!(
            from.kind(h),
            Kind::Arrow { .. } | Kind::Function { decl: false, .. }
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
    let hook = rw.copy(to, hook)?;
    let invoke = to.call0(hook, &[]);
    let stmt = to.expr_stmt(invoke);
    let block = to.block(&[stmt], Loc::SYNTHETIC);
    let wrapper = to.arrow(&[], block, false, false, Loc::SYNTHETIC);
    let on_mount = names.helper(from, Helper::OnMount);
    let callee = to.id(&on_mount);
    let c = to.call(callee, &[wrapper], false, from.loc(call));
    Ok(to.expr_stmt_at(c, from.loc(call)))
}

/// `let { a = 1, b, ...rest } = $props()`, then each `Boolean` prop resolved from `rest`, then the
/// attributes that fall through.
fn props_declarations(
    info: &Info<'_>,
    attrs: Option<&str>,
    to: &mut Ast,
    names: &mut Names,
) -> Vec<NodeId> {
    let from = info.from;
    let mut out = Vec::new();
    let booleans: Vec<&Prop> = info.props.iter().filter(|p| p.boolean.is_some()).collect();
    if info.props.is_empty() && attrs.is_none() {
        return out;
    }
    let rest = (!booleans.is_empty() || attrs.is_some()).then(|| names.fresh(from, "rest"));
    let mut pattern = Vec::new();
    for p in info.props.iter().filter(|p| p.boolean.is_none()) {
        let key = to.id(&p.key);
        let local = to.id(&p.var);
        let value = p.default.map_or(local, |d| {
            let d = copy(from, to, &mut rsv_js::copy::Verbatim, d);
            to.assign_pat(local, d, Loc::SYNTHETIC)
        });
        let shorthand = p.key == p.var && p.default.is_none();
        let flags = if shorthand { flag::SHORTHAND } else { 0 };
        pattern.push(to.property(key, value, flags, Loc::SYNTHETIC));
    }
    if let Some(r) = &rest {
        let r = to.id(r);
        pattern.push(to.rest(r, Loc::SYNTHETIC));
    }
    let pattern = to.object_pat(&pattern, Loc::SYNTHETIC);
    let props = to.id("$props");
    let call = to.call0(props, &[]);
    out.push(to.let_(flag::LET, pattern, Some(call)));
    let rest = rest.as_deref().unwrap_or_default();
    for p in &booleans {
        out.push(boolean_prop(info, p, rest, to, names));
    }
    if let Some(attrs) = attrs {
        out.push(fallthrough(info, rest, attrs, to, names));
    }
    out
}

/// runtime-core `resolvePropValue` for a `Boolean` prop: the default when the value is
/// `undefined`, then `false` when it is absent with no default, else `true` for `''` or the key
/// itself when `Boolean` comes before `String` in its types.
fn boolean_prop(info: &Info<'_>, p: &Prop, rest: &str, to: &mut Ast, names: &mut Names) -> NodeId {
    let from = info.from;
    let cast_true = p.boolean.unwrap_or_default();
    let value = names.fresh(from, "value");
    let mut body = Vec::new();
    let read = {
        let r = to.id(rest);
        to.dot(r, &p.key)
    };
    let v = to.id(&value);
    body.push(to.let_(flag::LET, v, Some(read)));
    if let Some(d) = p.default {
        let v = to.id(&value);
        let undefined = to.id("undefined");
        let test = to.binary(BinOp::StrictEq, v, undefined, Loc::SYNTHETIC);
        let v = to.id(&value);
        let d = copy(from, to, &mut rsv_js::copy::Verbatim, d);
        let set = to.assign(rsv_js::ops::AssignOp::Assign, v, d, Loc::SYNTHETIC);
        let set = to.expr_stmt(set);
        body.push(to.if_(test, set, None, Loc::SYNTHETIC));
    } else {
        let key = to.str(&p.key);
        let r = to.id(rest);
        let has = to.binary(BinOp::In, key, r, Loc::SYNTHETIC);
        let absent = to.unary(UnaryOp::Not, has, Loc::SYNTHETIC);
        let f = to.bool(false, Loc::SYNTHETIC);
        let early = to.return_(Some(f), Loc::SYNTHETIC);
        body.push(to.if_(absent, early, None, Loc::SYNTHETIC));
    }
    if cast_true {
        let v = to.id(&value);
        let empty = to.str("");
        let is_empty = to.binary(BinOp::StrictEq, v, empty, Loc::SYNTHETIC);
        let v = to.id(&value);
        let key = to.str(&p.key);
        let is_key = to.binary(BinOp::StrictEq, v, key, Loc::SYNTHETIC);
        let test = to.logical(LogicalOp::Or, is_empty, is_key, Loc::SYNTHETIC);
        let t = to.bool(true, Loc::SYNTHETIC);
        let early = to.return_(Some(t), Loc::SYNTHETIC);
        body.push(to.if_(test, early, None, Loc::SYNTHETIC));
    }
    let v = to.id(&value);
    body.push(to.return_(Some(v), Loc::SYNTHETIC));
    let block = to.block(&body, Loc::SYNTHETIC);
    let getter = to.arrow(&[], block, false, false, Loc::SYNTHETIC);
    let callee = rune_callee(to, "$derived.by");
    let call = to.call0(callee, &[getter]);
    let target = to.id(&p.var);
    to.let_(flag::LET, target, Some(call))
}

#[expect(
    clippy::many_single_char_names,
    reason = "builds JavaScript one node at a time"
)]
/// runtime-core's `attrs`: what the parent passes that is not a declared prop nor reserved
/// (`isReservedProp`).
fn fallthrough(
    info: &Info<'_>,
    rest: &str,
    attrs: &str,
    to: &mut Ast,
    names: &mut Names,
) -> NodeId {
    let from = info.from;
    let a = names.fresh(from, "fallthrough");
    let mut body = Vec::new();
    let r = to.id(rest);
    let spread = to.spread(r, Loc::SYNTHETIC);
    let object = to.object(&[spread], Loc::SYNTHETIC);
    let target = to.id(&a);
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
        let o = to.id(&a);
        let k = to.str(key);
        let m = to.member(o, k, true, false, Loc::SYNTHETIC);
        let del = to.unary(UnaryOp::Delete, m, Loc::SYNTHETIC);
        body.push(to.expr_stmt(del));
    }
    let o = to.id(&a);
    body.push(to.return_(Some(o), Loc::SYNTHETIC));
    let block = to.block(&body, Loc::SYNTHETIC);
    let getter = to.arrow(&[], block, false, false, Loc::SYNTHETIC);
    let callee = rune_callee(to, "$derived.by");
    let call = to.call0(callee, &[getter]);
    let target = to.id(attrs);
    to.let_(flag::LET, target, Some(call))
}
