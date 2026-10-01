//! `<script setup>` to a runes instance script.

use rsvelte_javascript::copy::copy;
use rsvelte_javascript::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use rsvelte_javascript::scope::BindingIdentifier;
use rsvelte_javascript::syntax_tree::{TypeScriptKind, flag};
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_vue::resolve::Resolution;
use rsvelte_vue::syntax_tree::SingleFileComponent;
use rustc_hash::FxHashMap;

use crate::context::{Class, Helper, Info, Names, Prop, R, Rewriter, span_of, unsupported};

const VUE_APIS: [&str; 4] = ["ref", "computed", "reactive", "onMounted"];

/// Vue's prop type constructors whose values are primitives.
const PRIMITIVE_TYPES: [&str; 4] = ["String", "Number", "Boolean", "Symbol"];

/// What every script binding becomes, and the props `defineProps` declares.
///
/// # Errors
///
/// A refusal for an import, a declaration or a prop declaration svue does not translate.
pub(crate) fn classify(
    sfc: &SingleFileComponent,
    resolution: &Resolution,
    source_text: &str,
    names: &mut Names,
) -> R<(FxHashMap<BindingIdentifier, Class>, Vec<Prop>)> {
    let from = &sfc.javascript;
    let mut class = FxHashMap::default();
    let Kind::Program(body) = from.kind(sfc.program) else {
        unreachable!("a script parses to a program")
    };
    for &statement in body {
        match from.kind(statement) {
            Kind::Import {
                type_only: true, ..
            }
            | Kind::TypeScriptDeclaration
            | Kind::TypeScriptInterface { .. } => {}
            Kind::Import {
                specifiers, source, ..
            } => {
                if from.str_value(source, source_text) != "vue" {
                    return Err(unsupported(
                        "an import from a module other than `vue`",
                        span_of(from, statement),
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
                    if let Some(b) = resolution.sem.binding_of(local) {
                        class.insert(b, Class::Vue(api));
                    }
                }
            }
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(unsupported(
                    "an export from `<script setup>`",
                    span_of(from, statement),
                ));
            }
            _ => {}
        }
    }
    for &statement in body {
        let Kind::VariableDeclaration { kind, declarations } = from.kind(statement) else {
            continue;
        };
        for &d in declarations {
            let Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } = from.kind(d)
            else {
                continue;
            };
            let api = vue_call(from, &class, resolution, initializer);
            let is_props = resolution
                .define_props
                .is_some_and(|p| p.call == initializer);
            let c = match api {
                Some("ref") => Class::Ref,
                Some("computed") => Class::Computed,
                Some("reactive") => Class::Reactive,
                Some(api) => {
                    return Err(unsupported(
                        format_args!("`{api}(…)` as a value"),
                        span_of(from, initializer),
                    ));
                }
                None if is_props => Class::Props,
                None => continue,
            };
            if kind != flag::CONST || !matches!(from.kind(identifier), Kind::Identifier(_)) {
                return Err(unsupported(
                    "a ref, computed, reactive or props object not declared as `const name`",
                    span_of(from, d),
                ));
            }
            if let Some(b) = resolution.sem.binding_of(identifier) {
                class.insert(b, c);
            }
        }
    }
    let props = match resolution.define_props {
        Some(p) => props(sfc, resolution, source_text, p, names)?,
        None => Vec::new(),
    };
    Ok((class, props))
}

/// The Vue API `e` calls through its imported binding.
fn vue_call(
    from: &SyntaxTree,
    class: &FxHashMap<BindingIdentifier, Class>,
    resolution: &Resolution,
    e: NodeIdentifier,
) -> Option<&'static str> {
    let Kind::Call { callee, .. } = from.kind(e) else {
        return None;
    };
    if !matches!(from.kind(callee), Kind::Identifier(_)) {
        return None;
    }
    match class.get(&resolution.sem.binding_of(callee)?) {
        Some(&Class::Vue(api)) => Some(api),
        _ => None,
    }
}

/// `defineProps`' runtime declaration (runtime-core `normalizePropsOptions`), for the shapes whose
/// resolution (`resolvePropValue`) svue reproduces.
fn props(
    sfc: &SingleFileComponent,
    resolution: &Resolution,
    source_text: &str,
    p: rsvelte_vue::resolve::DefineProps,
    names: &mut Names,
) -> R<Vec<Prop>> {
    let from = &sfc.javascript;
    let Kind::Call {
        callee, arguments, ..
    } = from.kind(p.call)
    else {
        unreachable!("`defineProps(…)` is a call")
    };
    if arguments.len() > 1
        || from
            .typescript
            .iter()
            .any(|t| t.node == callee && t.kind == TypeScriptKind::TypeArgs)
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
    let entries: Vec<(
        String,
        Option<NodeIdentifier>,
        rsvelte_kernel::source::positions::Span,
    )> = match from.kind(runtime) {
        Kind::Array(items) => items
            .iter()
            .map(|&i| match from.kind(i) {
                Kind::String => Ok((
                    from.str_value(i, source_text).to_owned(),
                    None,
                    span_of(from, i),
                )),
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
                        Kind::Identifier(_) => from.name(key).to_owned(),
                        Kind::String => from.str_value(key, source_text).to_owned(),
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
    for (key, declaration, span) in entries {
        check_prop_key(&key, span)?;
        if out.iter().any(|q: &Prop| q.key == key) {
            return Err(unsupported("a prop declared twice", span));
        }
        let (types, default) = match declaration {
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
        let var = if declares_anywhere(from, resolution, &key) {
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
fn check_prop_key(key: &str, span: rsvelte_kernel::source::positions::Span) -> R<()> {
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
fn declares_anywhere(from: &SyntaxTree, resolution: &Resolution, name: &str) -> bool {
    resolution
        .sem
        .bindings
        .iter()
        .any(|b| from.atoms.get(b.name) == name)
        || resolution
            .sem
            .references
            .iter()
            .any(|r| r.binding.is_none() && from.name(r.node) == name)
}

/// A prop's types (constructor names) and literal default.
fn prop_options(from: &SyntaxTree, d: NodeIdentifier) -> R<(Vec<String>, Option<NodeIdentifier>)> {
    let types = |t: NodeIdentifier| -> R<Vec<String>> {
        match from.kind(t) {
            Kind::Identifier(_) => Ok(vec![from.name(t).to_owned()]),
            Kind::Null => Ok(Vec::new()),
            Kind::Array(items) => items
                .iter()
                .map(|&i| match from.kind(i) {
                    Kind::Identifier(_) => Ok(from.name(i).to_owned()),
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
            Kind::Identifier(_) => from.name(key),
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
            "required" if matches!(from.kind(value), Kind::Boolean(_)) => {}
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

fn is_literal(from: &SyntaxTree, e: NodeIdentifier) -> bool {
    match from.kind(e) {
        Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => true,
        Kind::Unary(UnaryOperator::Neg, a) => matches!(from.kind(a), Kind::Number(_)),
        _ => false,
    }
}

/// A value Vue's `ref` and Svelte's `$state` store alike: no object the component did not create
/// here, so neither runtime's proxy can be told apart from the other's.
fn fresh(info: &Info<'_>, e: NodeIdentifier) -> bool {
    let from = info.from;
    match from.kind(e) {
        Kind::String
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Arrow { .. }
        | Kind::Function {
            declaration: false, ..
        } => true,
        Kind::Identifier(_) => {
            from.name(e) == "undefined" && info.resolution.sem.binding_of(e).is_none()
        }
        Kind::Unary(op, a) => op != UnaryOperator::Delete && fresh(info, a),
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => fresh(info, l) && fresh(info, r),
        Kind::Conditional {
            test,
            consequent,
            alternate,
        } => fresh(info, test) && fresh(info, consequent) && fresh(info, alternate),
        Kind::Template { expressions, .. } => expressions.iter().all(|&x| fresh(info, x)),
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
        } if matches!(from.kind(object), Kind::Identifier(_))
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
fn declarator(
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

fn rune_callee(to: &mut SyntaxTree, rune: &str) -> NodeIdentifier {
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
fn on_mounted(
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
fn props_declarations(
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
            let d = copy(from, to, &mut rsvelte_javascript::copy::Verbatim, d);
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
fn boolean_prop(
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
        let d = copy(from, to, &mut rsvelte_javascript::copy::Verbatim, d);
        let set = to.assign(
            rsvelte_javascript::operators::AssignmentOperator::Assign,
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
fn fallthrough(
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
