//! The instance script: Svelte's runes as Vue's reactivity, by copying the script's tree.
//!
//! A `$state` becomes a `ref`, a `$derived` a `computed`; every script reference to one reads
//! `.value`, every reference to a prop reads `$$props.<key>`. What the script does not mean the
//! same in both runtimes is refused in [`plan`], before anything is built.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, IdentifierReference, Program, PropertyKey, Statement,
    UnaryOperator, VariableDeclaration,
};
use oxc_ast_visit::Visit;
use oxc_semantic::{NodeId, SymbolId};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte_syntax::syntax_tree::Component;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::compilation::span_of;
use crate::{R, unsupported};

/// What `plan` found: the script's runes and the names the template needs.
#[derive(Debug, Default)]
pub struct Plan {
    constructors: constructors::Plan,
    pub(super) module_exports: FxHashMap<SymbolId, String>,
    pub(super) core_patterns: bool,
    pub(super) exposed: Vec<SymbolId>,
    pub(super) async_values: bool,
    pub(super) core_values: FxHashSet<&'static str>,
    pub(super) lifecycle: Vec<(&'static str, SymbolId)>,
    pub(super) attachments: Vec<(&'static str, SymbolId)>,
    /// `$props()`'s keys with their local names, and whether each default is a literal, in order;
    /// `None` without a `$props()`.
    props: Option<Vec<(String, SymbolId, bool)>>,
    pub(crate) preserve_whitespace: bool,
    pub(crate) stylesheet_mode: super::template::CssMode,
    pub(crate) custom_element: Option<super::template::CustomElement>,
    pub(crate) namespaces: Option<rsvelte_svelte_compile::render_plan::Namespaces>,
    pub(super) props_id: Option<SymbolId>,
    /// `...rest` in `$props()`: read through Vue's `useAttrs()`.
    pub rest: Option<SymbolId>,
    pub(super) auxiliary: FxHashMap<&'static str, Span>,
}

/// The names Vue's compiler treats as macros wherever they are called.
const VUE_MACROS: &[&str] = &[
    "defineProps",
    "defineEmits",
    "defineExpose",
    "defineOptions",
    "defineSlots",
    "defineModel",
    "withDefaults",
];

/// The globals the generated code reads; a binding of the same name would shadow them.
const SHADOWED_GLOBALS: &[&str] = &["Array", "Object", "String", "Boolean", "undefined"];

/// The helper names `vue` exports that the compiled module may import as `_<name>`.
const VUE_HELPERS: &[&str] = &[
    "Fragment",
    "openBlock",
    "createElementBlock",
    "createElementVNode",
    "createCommentVNode",
    "createTextVNode",
    "toDisplayString",
    "renderList",
    "unref",
    "withDirectives",
    "vModelText",
    "vModelCheckbox",
    "vModelRadio",
    "vModelSelect",
    "normalizeProps",
    "guardReactiveProps",
    "defineComponent",
];

/// `@vue/shared` `GLOBALS_ALLOWED`: a template name outside the list and the component's bindings
/// is read from `_ctx`, which a Svelte global is not; a prop key in it would be read as a prop.
pub(crate) const VUE_GLOBALS: &[&str] = &[
    "Infinity",
    "undefined",
    "NaN",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "Math",
    "Number",
    "Date",
    "Array",
    "Object",
    "Boolean",
    "String",
    "RegExp",
    "Map",
    "Set",
    "JSON",
    "Intl",
    "BigInt",
    "console",
    "Error",
    "Symbol",
    "Promise",
];

/// A name the compiled module or the Vue compiler declares itself.
fn is_internal(name: &str) -> bool {
    matches!(
        name,
        "_ctx" | "_cache" | "__props" | "_sfc_main" | "_sfc_render" | "_export_sfc"
    ) || name
        .strip_prefix("_hoisted_")
        .is_some_and(|n| !n.is_empty() && n.bytes().all(|b| b.is_ascii_digit()))
        || name
            .strip_prefix('_')
            .is_some_and(|n| VUE_HELPERS.contains(&n))
}

/// Checks the script and records what the translation needs from it.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic for a construct outside the mapping.
pub(crate) fn plan(c: &Component, res: &Resolution) -> R<Plan> {
    let mut plan = Plan::default();
    check_names(res)?;
    let mut consumed = FxHashSet::default();
    let tree = &c.javascript;
    let instance = c.instance.as_ref().map(|s| tree.get_program(s.program));
    if let Some(program) = instance {
        check_redeclared(res, program)?;
        for s in &program.body {
            statement(s, res, &mut plan, &mut consumed)?;
        }
        runes::collect(res, &Root::Program(program), &mut plan, &mut consumed)?;
    }
    if let Some(module) = &c.module {
        let module = tree.get_program(module.program);
        module::check(module, res, &mut plan.module_exports)?;
        runes::collect(res, &Root::Program(module), &mut plan, &mut consumed)?;
        check_references(res, &Root::Program(module), &consumed, false)?;
    }
    let template = Root::Template(tree);
    runes::collect(res, &template, &mut plan, &mut consumed)?;
    check_references(res, &template, &consumed, true)?;
    if let Some(program) = instance {
        check_references(res, &Root::Program(program), &consumed, false)?;
    }
    check_writes(res)?;
    Ok(plan)
}

/// One top-level statement of the instance script.
fn statement(
    s: &Statement<'_>,
    res: &Resolution,
    plan: &mut Plan,
    consumed: &mut FxHashSet<NodeId>,
) -> R<()> {
    match s {
        Statement::ImportDeclaration(i) => {
            if i.import_kind.is_value() {
                imports::collect(&i.source, i.specifiers.as_ref().map(|s| s.as_slice()), plan)?;
            }
            Ok(())
        }
        Statement::ExportDeclaration(e) => {
            exports::collect(e, &mut plan.exposed)?;
            match &e.declaration {
                Declaration::VariableDeclaration(d) => variables(d, res, plan, consumed),
                _ => Ok(()),
            }
        }
        Statement::ExportNamedDeclaration(_) | Statement::ExportFromDeclaration(_) => {
            Err(unsupported("this component export", span_of(s.span())))
        }
        Statement::ExportDefaultDeclaration(_) | Statement::ExportAllDeclaration(_) => {
            Err(unsupported("an export", span_of(s.span())))
        }
        Statement::VariableDeclaration(d) => variables(d, res, plan, consumed),
        _ => Ok(()),
    }
}

/// The runes a top-level declaration makes besides the value runes: `$props()` and
/// `$props.id()`.
fn variables(
    d: &VariableDeclaration<'_>,
    res: &Resolution,
    plan: &mut Plan,
    consumed: &mut FxHashSet<NodeId>,
) -> R<()> {
    for d in &d.declarations {
        let Some(init) = &d.init else { continue };
        let Some((rune, _)) = res.rune(init) else {
            continue;
        };
        if runes::value(rune)
            || runes::eager(rune)
            || runes::local(rune).is_some()
            || matches!(rune, "$inspect" | "$inspect.trace")
        {
            continue;
        }
        let Expression::CallExpression(call) = init.get_inner_expression() else {
            unreachable!("a rune is a call")
        };
        let ok = match (rune, &d.id) {
            ("$props.id", BindingPattern::BindingIdentifier(id))
                if call.arguments.is_empty() && plan.props_id.is_none() =>
            {
                let symbol = id.symbol_id.get().expect("a declaration has a symbol");
                if res.writes(symbol) > 0 {
                    return Err(unsupported("assigning a `$props.id()`", span_of(id.span)));
                }
                plan.props_id = Some(symbol);
                true
            }
            ("$props", pattern) if call.arguments.is_empty() && plan.props.is_none() => {
                let (keys, rest) = props(res, pattern)?;
                plan.props = Some(keys);
                plan.rest = rest;
                true
            }
            _ => false,
        };
        if !ok {
            return Err(unsupported(
                format_args!("this use of `{rune}`"),
                span_of(init.span()),
            ));
        }
        consumed.insert(runes::root(&call.callee));
    }
    Ok(())
}

/// What a check walks: a program, or every part of the template.
pub(super) enum Root<'a> {
    Program(&'a Program<'a>),
    Template(&'a rsvelte_typescript_tree::Tree),
}

impl<'a> Root<'a> {
    pub(super) fn visit(&self, v: &mut impl Visit<'a>) {
        match self {
            Self::Program(p) => v.visit_program(p),
            Self::Template(tree) => {
                for (_, e) in tree.expressions() {
                    v.visit_expression(e);
                }
                for (_, d) in tree.declarations() {
                    v.visit_variable_declaration(d);
                }
            }
        }
    }
}

/// Svelte reads a redeclared `var` as reassigned; the shared scope sees one declaration and folds
/// the first initializer.
fn check_redeclared(res: &Resolution, program: &Program<'_>) -> R<()> {
    let scoping = res.scoping();
    let first = scoping
        .symbol_ids()
        .filter_map(|symbol| scoping.symbol_redeclarations(symbol).get(1))
        .map(|r| r.span)
        .filter(|span| program.span.contains_inclusive(*span))
        .min_by_key(|span| span.start);
    first.map_or(Ok(()), |span| {
        Err(unsupported("a name declared twice", span_of(span)))
    })
}

/// Names the translation or the Vue compiler would collide with.
fn check_names(res: &Resolution) -> R<()> {
    let scoping = res.scoping();
    for symbol in scoping.symbol_ids() {
        let name = scoping.symbol_name(symbol);
        let span = span_of(scoping.symbol_span(symbol));
        if name.starts_with('$') {
            return Err(unsupported(
                format_args!("the `$`-prefixed name `{name}`"),
                span,
            ));
        }
        if SHADOWED_GLOBALS.contains(&name) || is_internal(name) || VUE_MACROS.contains(&name) {
            return Err(unsupported(format_args!("a binding named `{name}`"), span));
        }
    }
    Ok(())
}

/// Runes, store subscriptions and Vue's macros outside the uses [`plan`] consumed.
fn check_references(
    res: &Resolution,
    root: &Root<'_>,
    consumed: &FxHashSet<NodeId>,
    template: bool,
) -> R<()> {
    struct References<'r> {
        res: &'r Resolution,
        consumed: &'r FxHashSet<NodeId>,
        template: bool,
        result: R<()>,
    }
    impl<'a> Visit<'a> for References<'_> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            if self.result.is_err() {
                return;
            }
            let name = it.name.as_str();
            let unbound = name.starts_with('$')
                && self.res.symbol(it).is_none()
                && !self.consumed.contains(&it.node_id.get());
            self.result = if !self.template && VUE_MACROS.contains(&name) {
                Err(unsupported(
                    format_args!("the name `{name}`"),
                    span_of(it.span),
                ))
            } else if unbound && self.template {
                Err(unsupported(
                    "a rune outside a supported declaration or call",
                    span_of(it.span),
                ))
            } else if unbound {
                Err(unsupported(
                    format_args!("the rune or store subscription `{name}`"),
                    span_of(it.span),
                ))
            } else {
                Ok(())
            };
        }
    }
    let mut v = References {
        res,
        consumed,
        template,
        result: Ok(()),
    };
    root.visit(&mut v);
    v.result
}

/// Writes Vue would not see the way Svelte does.
fn check_writes(res: &Resolution) -> R<()> {
    let scoping = res.scoping();
    for symbol in scoping.symbol_ids() {
        if res.binding(symbol).kind == BindingKind::RestProperty
            && (res.writes(symbol) > 0 || res.mutations(symbol) > 0)
        {
            return Err(unsupported(
                "writing the rest of `$props()`",
                span_of(scoping.symbol_span(symbol)),
            ));
        }
    }
    Ok(())
}

/// Each key with its local name and whether its default is a literal, and the rest.
type Props = (Vec<(String, SymbolId, bool)>, Option<SymbolId>);

/// `let { a, b = 1, c: d, ...rest } = $props()`: plain keys with literal defaults, and the rest.
fn props(res: &Resolution, pattern: &BindingPattern<'_>) -> R<Props> {
    let refuse = |span: oxc_span::Span| {
        Err(unsupported(
            "a `$props()` pattern other than plain keys with literal defaults",
            span_of(span),
        ))
    };
    let symbol = |id: &oxc_ast::ast::BindingIdentifier<'_>| {
        id.symbol_id.get().expect("a declaration has a symbol")
    };
    let object = match pattern {
        BindingPattern::BindingIdentifier(id) => return Ok((Vec::new(), Some(symbol(id)))),
        BindingPattern::ObjectPattern(object) => object,
        p => return refuse(p.span()),
    };
    let mut out = Vec::with_capacity(object.properties.len());
    for p in &object.properties {
        let (false, PropertyKey::StaticIdentifier(key)) = (p.computed, &p.key) else {
            return refuse(p.span);
        };
        let (local, literal) = match &p.value {
            BindingPattern::BindingIdentifier(id) => (id, false),
            BindingPattern::AssignmentPattern(a) => {
                let BindingPattern::BindingIdentifier(id) = &a.left else {
                    return refuse(p.span);
                };
                if let Some(("$bindable", _)) = res.rune(&a.right)
                    && let Expression::CallExpression(call) = a.right.get_inner_expression()
                    && call.arguments.len() > 1
                {
                    return refuse(a.right.span());
                }
                (id, is_literal(&a.right))
            }
            _ => return refuse(p.span),
        };
        let name = key.name.as_str();
        let reserved = matches!(name, "key" | "ref" | "ref_for" | "ref_key")
            || name.starts_with("onVnode")
            || VUE_GLOBALS.contains(&name);
        if reserved {
            return Err(unsupported(
                format_args!("the prop name `{name}` (Vue reserves it or reads it as a global)"),
                span_of(key.span),
            ));
        }
        out.push((name.to_owned(), symbol(local), literal));
    }
    let rest = match object.rest.as_ref().map(|r| &r.argument) {
        None => None,
        Some(BindingPattern::BindingIdentifier(id)) => Some(symbol(id)),
        Some(p) => return refuse(p.span()),
    };
    Ok((out, rest))
}

pub(super) fn is_literal(e: &Expression<'_>) -> bool {
    match e {
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_) => true,
        Expression::UnaryExpression(u) => {
            u.operator == UnaryOperator::UnaryNegation
                && matches!(u.argument, Expression::NumericLiteral(_))
        }
        Expression::TemplateLiteral(t) => t.expressions.is_empty(),
        _ => false,
    }
}

/// Whether a prop is read and written through a cell rather than `$$props.<key>`.
pub(crate) fn prop_cell(res: &Resolution, symbol: SymbolId) -> bool {
    let info = res.binding(symbol);
    match info.kind {
        BindingKind::BindableProperty => true,
        BindingKind::Property => {
            res.writes(symbol) > 0 || info.initial.is_some_and(|value| !is_literal(value))
        }
        _ => false,
    }
}

/// The top-level function declaration `symbol` names, if it names one.
pub(crate) fn function(res: &Resolution, symbol: SymbolId) -> Option<&oxc_ast::ast::Function<'_>> {
    if res.scoping().symbol_scope_id(symbol) != res.instance_scope() {
        return None;
    }
    match res.declaration(symbol) {
        AstKind::Function(f) if f.is_declaration() => Some(f),
        _ => None,
    }
}

mod classes;
mod constructors;
mod declarations;
mod emit;
pub(super) use emit::module;
mod exports;
mod imports;
mod module;
pub(crate) mod patterns;
pub(crate) mod runes;
pub(crate) use emit::{ScriptRewrite, emit, prop_member, rune_value};
