//! `<script setup>` to a runes instance script.

use oxc_ast::ast::{
    ArrayExpressionElement, BindingPattern, Expression, ImportDeclarationSpecifier,
    ModuleExportName, ObjectPropertyKind, Program, PropertyKey, PropertyKind, Statement,
    UnaryOperator, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_compile::strip::is_type_only;
use rsvelte_vue_semantic::resolve::{DefineProps, Resolution, unwrap_typescript};
use rsvelte_vue_syntax::syntax_tree::SingleFileComponent;
use rustc_hash::FxHashMap;

use crate::context::{
    Class, Declared, Helper, Info, Names, Prop, R, Rewriter, Top, span_of, unsupported,
};

const VUE_APIS: [&str; 4] = ["ref", "computed", "reactive", "onMounted"];

/// Vue's prop type constructors whose values are primitives.
const PRIMITIVE_TYPES: [&str; 4] = ["String", "Number", "Boolean", "Symbol"];

/// What every script binding becomes, and the props `defineProps` declares.
///
/// # Errors
///
/// A refusal for an import, a declaration or a prop declaration svue does not translate.
pub(crate) fn classify<'v>(
    sfc: &'v SingleFileComponent,
    resolution: &'v Resolution,
    names: &mut Names<'_>,
) -> R<(FxHashMap<SymbolId, Class>, Vec<Prop<'v>>)> {
    let program = sfc.javascript.get_program(sfc.program);
    let mut class = FxHashMap::default();
    for statement in &program.body {
        match statement {
            Statement::ImportDeclaration(import) => {
                if import.import_kind.is_type() {
                    continue;
                }
                if import.source.value.as_str() != Some("vue") {
                    return Err(unsupported(
                        "an import from a module other than `vue`",
                        span_of(import.span),
                    ));
                }
                for specifier in import.specifiers.iter().flatten() {
                    let api = match specifier {
                        ImportDeclarationSpecifier::ImportSpecifier(s)
                            if s.import_kind.is_type() =>
                        {
                            continue;
                        }
                        ImportDeclarationSpecifier::ImportSpecifier(s) => {
                            module_export_name(&s.imported)
                                .and_then(|n| VUE_APIS.iter().find(|&&a| a == n).copied())
                                .map(|a| (a, &s.local))
                        }
                        _ => None,
                    };
                    let Some((api, local)) = api else {
                        return Err(unsupported(
                            "an import from `vue` other than `ref`, `computed`, `reactive` and \
                             `onMounted`",
                            span_of(specifier.span()),
                        ));
                    };
                    if let Some(symbol) = local.symbol_id.get() {
                        class.insert(symbol, Class::Vue(api));
                    }
                }
            }
            s if is_type_only(s) => {}
            Statement::ExportAllDeclaration(_)
            | Statement::ExportDefaultDeclaration(_)
            | Statement::ExportDeclaration(_)
            | Statement::ExportNamedDeclaration(_)
            | Statement::ExportFromDeclaration(_)
            | Statement::TSExportAssignment(_) => {
                return Err(unsupported(
                    "an export from `<script setup>`",
                    span_of(statement.span()),
                ));
            }
            _ => {}
        }
    }
    let define_props = resolution.define_props();
    for statement in &program.body {
        let Statement::VariableDeclaration(declaration) = statement else {
            continue;
        };
        for d in &declaration.declarations {
            let Some(initializer) = &d.init else {
                continue;
            };
            let api = vue_call(&class, resolution, initializer);
            let is_props = define_props.is_some_and(|p| {
                matches!(initializer, Expression::CallExpression(c) if std::ptr::eq(&raw const **c, p.call))
            });
            let c = match api {
                Some("ref") => Class::Ref,
                Some("computed") => Class::Computed,
                Some("reactive") => Class::Reactive,
                Some(api) => {
                    return Err(unsupported(
                        format_args!("`{api}(…)` as a value"),
                        span_of(initializer.span()),
                    ));
                }
                None if is_props => Class::Props,
                None => continue,
            };
            let BindingPattern::BindingIdentifier(identifier) = &d.id else {
                return Err(not_const_name(d.span));
            };
            if declaration.kind != VariableDeclarationKind::Const {
                return Err(not_const_name(d.span));
            }
            if let Some(symbol) = identifier.symbol_id.get() {
                class.insert(symbol, c);
            }
        }
    }
    let props = match define_props {
        Some(p) => props(resolution, p, names)?,
        None => Vec::new(),
    };
    Ok((class, props))
}

fn not_const_name(span: oxc_span::Span) -> rsvelte_kernel::diagnostics::Diagnostic {
    unsupported(
        "a ref, computed, reactive or props object not declared as `const name`",
        span_of(span),
    )
}

/// A string with a lone surrogate names nothing the script can import.
fn module_export_name<'v>(name: &ModuleExportName<'v>) -> Option<&'v str> {
    match name {
        ModuleExportName::IdentifierName(n) => Some(n.name.as_str()),
        ModuleExportName::IdentifierReference(n) => Some(n.name.as_str()),
        ModuleExportName::StringLiteral(s) => s.value.as_str(),
    }
}

/// Every name the script declares at its top level, and how.
pub(crate) fn top_level<'v>(program: &'v Program<'v>) -> FxHashMap<SymbolId, Top<'v>> {
    let mut top = FxHashMap::default();
    let mut declare = |symbol: Option<SymbolId>, declared, initializer| {
        if let Some(symbol) = symbol {
            top.insert(
                symbol,
                Top {
                    declared,
                    initializer,
                },
            );
        }
    };
    for statement in &program.body {
        match statement {
            Statement::VariableDeclaration(d) => {
                let declared = match d.kind {
                    VariableDeclarationKind::Var => Declared::Var,
                    VariableDeclarationKind::Let => Declared::Let,
                    _ => Declared::Const,
                };
                for declarator in &d.declarations {
                    let initializer = match &declarator.id {
                        BindingPattern::BindingIdentifier(_) => declarator.init.as_ref(),
                        _ => None,
                    };
                    for identifier in declarator.id.get_binding_identifiers() {
                        declare(identifier.symbol_id.get(), declared, initializer);
                    }
                }
            }
            Statement::FunctionDeclaration(f) => {
                if let Some(identifier) = &f.id {
                    declare(identifier.symbol_id.get(), Declared::Function, None);
                }
            }
            Statement::ClassDeclaration(c) => {
                if let Some(identifier) = &c.id {
                    declare(identifier.symbol_id.get(), Declared::Class, None);
                }
            }
            Statement::ImportDeclaration(i) => {
                for specifier in i.specifiers.iter().flatten() {
                    declare(specifier.local().symbol_id.get(), Declared::Import, None);
                }
            }
            _ => {}
        }
    }
    top
}

/// The Vue API `e` calls through its imported binding.
pub(crate) fn vue_call(
    class: &FxHashMap<SymbolId, Class>,
    resolution: &Resolution,
    e: &Expression<'_>,
) -> Option<&'static str> {
    let Expression::CallExpression(call) = unwrap_typescript(e) else {
        return None;
    };
    let Expression::Identifier(callee) = &call.callee else {
        return None;
    };
    let symbol = resolution.symbol_of(callee.reference_id.get()?)?;
    match class.get(&symbol) {
        Some(&Class::Vue(api)) => Some(api),
        _ => None,
    }
}

/// `defineProps`' runtime declaration (runtime-core `normalizePropsOptions`), for the shapes whose
/// resolution (`resolvePropValue`) svue reproduces.
fn props<'v>(
    resolution: &Resolution,
    p: DefineProps<'v>,
    names: &mut Names<'_>,
) -> R<Vec<Prop<'v>>> {
    if p.call.arguments.len() > 1 || p.call.type_arguments.is_some() {
        return Err(unsupported(
            "a type-based `defineProps` declaration",
            span_of(p.call.span),
        ));
    }
    let mut out = Vec::new();
    let Some(argument) = p.call.arguments.first() else {
        return Ok(out);
    };
    let not_literal = || {
        unsupported(
            "a `defineProps` declaration other than an array or object literal",
            span_of(argument.span()),
        )
    };
    let entries: Vec<(String, Option<&'v Expression<'v>>, Span)> =
        match argument.as_expression().ok_or_else(not_literal)? {
            Expression::ArrayExpression(array) => array
                .elements
                .iter()
                .map(|element| {
                    let name = match element {
                        ArrayExpressionElement::StringLiteral(s) => s.value.as_str(),
                        _ => None,
                    };
                    name.map(|name| (name.to_owned(), None, span_of(element.span())))
                        .ok_or_else(|| {
                            unsupported(
                                "a prop name other than a string literal",
                                span_of(element.span()),
                            )
                        })
                })
                .collect::<R<_>>()?,
            Expression::ObjectExpression(object) => object
                .properties
                .iter()
                .map(|property| match property {
                    ObjectPropertyKind::ObjectProperty(property)
                        if !property.computed
                            && !property.method
                            && property.kind == PropertyKind::Init =>
                    {
                        let key = match &property.key {
                            PropertyKey::StaticIdentifier(key) => Some(key.name.as_str()),
                            PropertyKey::StringLiteral(key) => key.value.as_str(),
                            _ => None,
                        };
                        let Some(key) = key else {
                            return Err(unsupported("this prop key", span_of(property.key.span())));
                        };
                        Ok((
                            key.to_owned(),
                            Some(&property.value),
                            span_of(property.span),
                        ))
                    }
                    _ => Err(unsupported(
                        "this prop declaration",
                        span_of(property.span()),
                    )),
                })
                .collect::<R<_>>()?,
            _ => return Err(not_literal()),
        };
    for (key, declaration, span) in entries {
        check_prop_key(&key, span)?;
        if out.iter().any(|q: &Prop<'_>| q.key == key) {
            return Err(unsupported("a prop declared twice", span));
        }
        let (types, default) = match declaration {
            None => (Vec::new(), None),
            Some(d) => prop_options(d)?,
        };
        let boolean = types.iter().position(|t| t == "Boolean").map(|b| {
            types
                .iter()
                .position(|t| t == "String")
                .is_none_or(|s| b < s)
        });
        let primitive =
            !types.is_empty() && types.iter().all(|t| PRIMITIVE_TYPES.contains(&t.as_str()));
        let var = if declares_anywhere(resolution, &key) {
            names.fresh(&key)
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
fn check_prop_key(key: &str, span: Span) -> R<()> {
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
fn declares_anywhere(resolution: &Resolution, name: &str) -> bool {
    let scoping = resolution.scoping();
    scoping.symbol_names().any(|n| n == name)
        || scoping
            .root_unresolved_references()
            .keys()
            .any(|k| k.as_str() == name)
}

/// A prop's types (constructor names) and literal default.
fn prop_options<'v>(d: &'v Expression<'v>) -> R<(Vec<String>, Option<&'v Expression<'v>>)> {
    let types = |t: &Expression<'_>| -> R<Vec<String>> {
        let not_a_constructor = |span: oxc_span::Span| {
            unsupported("a prop type other than a constructor name", span_of(span))
        };
        match t {
            Expression::Identifier(i) => Ok(vec![i.name.as_str().to_owned()]),
            Expression::NullLiteral(_) => Ok(Vec::new()),
            Expression::ArrayExpression(array) => array
                .elements
                .iter()
                .map(|element| match element {
                    ArrayExpressionElement::Identifier(i) => Ok(i.name.as_str().to_owned()),
                    _ => Err(not_a_constructor(element.span())),
                })
                .collect(),
            _ => Err(not_a_constructor(t.span())),
        }
    };
    let Expression::ObjectExpression(object) = d else {
        return Ok((types(d)?, None));
    };
    let (mut ty, mut default) = (Vec::new(), None);
    for property in &object.properties {
        let option = match property {
            ObjectPropertyKind::ObjectProperty(p)
                if !p.computed && !p.method && p.kind == PropertyKind::Init =>
            {
                match &p.key {
                    PropertyKey::StaticIdentifier(key) => Some((key.name.as_str(), p)),
                    _ => None,
                }
            }
            _ => None,
        };
        let Some((k, p)) = option else {
            return Err(unsupported("this prop option", span_of(property.span())));
        };
        match k {
            "type" => ty = types(&p.value)?,
            "default" if is_literal(&p.value) => default = Some(&p.value),
            "default" => {
                return Err(unsupported(
                    "a prop default other than a literal (Vue calls a function default once per \
                     instance)",
                    span_of(p.value.span()),
                ));
            }
            "required" if matches!(p.value, Expression::BooleanLiteral(_)) => {}
            _ => {
                return Err(unsupported(
                    format_args!("the prop option `{k}`"),
                    span_of(p.span),
                ));
            }
        }
    }
    Ok((ty, default))
}

fn is_literal(e: &Expression<'_>) -> bool {
    match unwrap_typescript(e) {
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_) => true,
        Expression::UnaryExpression(u) => {
            u.operator == UnaryOperator::UnaryNegation
                && matches!(u.argument, Expression::NumericLiteral(_))
        }
        _ => false,
    }
}

/// A value Vue's `ref` and Svelte's `$state` store alike: no object the component did not create
/// here, so neither runtime's proxy can be told apart from the other's.
fn fresh(info: &Info<'_>, e: &Expression<'_>) -> bool {
    match unwrap_typescript(e) {
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_) => true,
        Expression::Identifier(i) => i.name == "undefined" && info.symbol(i).is_none(),
        Expression::UnaryExpression(u) => {
            u.operator != UnaryOperator::Delete && fresh(info, &u.argument)
        }
        Expression::BinaryExpression(b) => fresh(info, &b.left) && fresh(info, &b.right),
        Expression::LogicalExpression(l) => fresh(info, &l.left) && fresh(info, &l.right),
        Expression::ConditionalExpression(c) => {
            fresh(info, &c.test) && fresh(info, &c.consequent) && fresh(info, &c.alternate)
        }
        Expression::TemplateLiteral(t) => t.expressions.iter().all(|x| fresh(info, x)),
        Expression::ArrayExpression(array) => array.elements.iter().all(|element| match element {
            ArrayExpressionElement::SpreadElement(_) => false,
            ArrayExpressionElement::Elision(_) => true,
            _ => element
                .as_expression()
                .is_some_and(|element| fresh(info, element)),
        }),
        Expression::ObjectExpression(object) => object.properties.iter().all(|p| match p {
            ObjectPropertyKind::ObjectProperty(p) if !p.computed => fresh(info, &p.value),
            _ => false,
        }),
        Expression::StaticMemberExpression(m)
            if info.class_of_expression(&m.object) == Some(Class::Props) =>
        {
            info.prop(m.property.name.as_str())
                .is_some_and(|p| p.primitive)
        }
        _ => false,
    }
}

mod emit;
pub(crate) use emit::emit;
