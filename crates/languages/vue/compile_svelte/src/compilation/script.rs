//! `<script setup>` to a runes instance script.

use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_typescript::copy::copy;
use rsvelte_typescript::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::syntax_tree::{TypeScriptKind, flag};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
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

mod emit;
pub(crate) use emit::emit;
