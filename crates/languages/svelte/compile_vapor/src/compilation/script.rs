//! The instance script: Svelte's runes as Vue's reactivity, by copying the script's tree.
//!
//! A `$state` becomes a `ref`, a `$derived` a `computed`; every script reference to one reads
//! `.value`, every reference to a prop reads `$$props.<key>`. What the script does not mean the
//! same in both runtimes is refused in [`plan`], before anything is built.

use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution, rune_call};
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_typescript::copy::{Rewrite, Verbatim, copy};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::helpers::{self, Helper};
use crate::{R, unsupported};

/// What [`plan`] found: the script's runes and the names the template needs.
#[derive(Debug, Default)]
pub struct Plan {
    constructors: constructors::Plan,
    pub(super) module_exports: FxHashMap<BindingIdentifier, String>,
    pub(super) core_patterns: bool,
    pub(super) exposed: Vec<NodeIdentifier>,
    pub(super) async_values: bool,
    pub(super) core_values: FxHashSet<&'static str>,
    pub(super) lifecycle: Vec<(&'static str, NodeIdentifier)>,
    pub(super) attachments: Vec<(&'static str, NodeIdentifier)>,
    /// `$props()`'s keys and literal defaults, in order; `None` without a `$props()`.
    props: Option<Vec<(String, Option<NodeIdentifier>)>>,
    pub(crate) preserve_whitespace: bool,
    pub(crate) stylesheet_mode: super::template::CssMode,
    pub(crate) custom_element: Option<super::template::CustomElement>,
    pub(crate) namespaces: Option<rsvelte_svelte_compile::render_plan::NamespacePlan>,
    pub(super) props_id: Option<NodeIdentifier>,
    /// `...rest` in `$props()`: read through Vue's `useAttrs()`.
    pub rest: Option<NodeIdentifier>,
    /// The top-level function declarations, by binding.
    pub functions: FxHashMap<BindingIdentifier, NodeIdentifier>,
    pub(super) auxiliary: FxHashMap<&'static str, rsvelte_kernel::source::positions::Span>,
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
pub const VUE_GLOBALS: &[&str] = &[
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
#[expect(
    clippy::too_many_lines,
    reason = "one pass over the script, one arm per declaration shape"
)]
/// # Panics
///
/// If the resolution does not match the input tree.
pub fn plan(c: &Component, resolution: &Resolution, source_text: &str) -> R<Plan> {
    let mut plan = Plan::default();
    let javascript = &c.javascript;
    check_names(javascript, resolution)?;
    check_redeclared(javascript, resolution, c.program)?;
    let Kind::Program(body) = javascript.kind(c.program) else {
        unreachable!("a script parses to a program")
    };
    let mut consumed = FxHashSet::default();
    for &s in body {
        let s = if let Kind::ExportNamed(declaration) = javascript.kind(s) {
            exports::collect(javascript, declaration, &mut plan.exposed)?;
            declaration
        } else {
            s
        };
        match javascript.kind(s) {
            Kind::Import {
                specifiers,
                source,
                type_only,
                ..
            } => {
                if !type_only {
                    imports::collect(
                        javascript,
                        javascript.str_value(source, source_text),
                        specifiers,
                        &mut plan,
                    )?;
                }
            }
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(unsupported("an export", span(javascript, s)));
            }
            Kind::VariableDeclaration { declarations, .. } => {
                for &d in declarations {
                    let Kind::Declarator {
                        identifier,
                        initializer: Some(i),
                    } = javascript.kind(d)
                    else {
                        continue;
                    };
                    let Some((rune, _)) = rune_call(javascript, i) else {
                        continue;
                    };
                    if runes::value(rune)
                        || runes::eager(rune)
                        || runes::local(rune).is_some()
                        || matches!(rune, "$inspect" | "$inspect.trace")
                    {
                        continue;
                    }
                    let Kind::Call {
                        callee, arguments, ..
                    } = javascript.kind(i)
                    else {
                        unreachable!("a rune is a call")
                    };
                    let ok = match rune {
                        "$props.id"
                            if arguments.is_empty()
                                && plan.props_id.is_none()
                                && matches!(javascript.kind(identifier), Kind::Identifier(_)) =>
                        {
                            let binding = resolution
                                .sem
                                .binding_of(identifier)
                                .expect("a declaration has a binding");
                            if resolution.sem.bindings[binding].writes > 0 {
                                return Err(unsupported(
                                    "assigning a `$props.id()`",
                                    span(javascript, identifier),
                                ));
                            }
                            plan.props_id = Some(identifier);
                            true
                        }
                        "$props" if arguments.is_empty() && plan.props.is_none() => {
                            let (keys, rest) = props(javascript, identifier)?;
                            plan.props = Some(keys);
                            plan.rest = rest;
                            true
                        }
                        _ => false,
                    };
                    if !ok {
                        return Err(unsupported(
                            format_args!("this use of `{rune}`"),
                            span(javascript, i),
                        ));
                    }
                    consumed.insert(match javascript.kind(callee) {
                        Kind::Member { object, .. } => object,
                        _ => callee,
                    });
                }
            }
            Kind::Function {
                name: Some(n),
                declaration: true,
                ..
            } => {
                if let Some(b) = resolution.sem.binding_of(n) {
                    plan.functions.insert(b, s);
                }
            }
            _ => {}
        }
    }
    runes::collect(javascript, c.program, &mut plan, &mut consumed)?;
    if let Some(module) = &c.module {
        module::check(
            javascript,
            module.program,
            resolution,
            source_text,
            &mut plan.module_exports,
        )?;
        runes::collect(javascript, module.program, &mut plan, &mut consumed)?;
        check_references(javascript, resolution, module.program, &consumed)?;
    }
    for &expression in &c.template_expressions {
        runes::collect(javascript, expression, &mut plan, &mut consumed)?;
        walk(javascript, expression, &mut |node| {
            if matches!(javascript.kind(node), Kind::Identifier(_))
                && javascript.name(node).starts_with('$')
                && resolution.sem.binding_of(node).is_none()
                && !consumed.contains(&node)
            {
                return Err(unsupported(
                    "a rune outside a supported declaration or call",
                    span(javascript, node),
                ));
            }
            Ok(())
        })?;
    }
    check_references(javascript, resolution, c.program, &consumed)?;
    check_writes(javascript, resolution)?;
    Ok(plan)
}

/// The local name of `import { onMount } from 'svelte'`.
/// Svelte reads a redeclared `var` as reassigned; the shared scope sees one declaration and
/// folds the first initializer.
fn check_redeclared(
    javascript: &SyntaxTree,
    resolution: &Resolution,
    program: NodeIdentifier,
) -> R<()> {
    walk(javascript, program, &mut |n| {
        let (Kind::Declarator { identifier, .. }
        | Kind::Function {
            name: Some(identifier),
            ..
        }) = javascript.kind(n)
        else {
            return Ok(());
        };
        match resolution.sem.binding_of(identifier) {
            Some(b)
                if matches!(javascript.kind(identifier), Kind::Identifier(_))
                    && resolution.sem.bindings[b].node != identifier =>
            {
                Err(unsupported(
                    "a name declared twice",
                    span(javascript, identifier),
                ))
            }
            _ => Ok(()),
        }
    })
}

/// Names the translation or the Vue compiler would collide with.
fn check_names(javascript: &SyntaxTree, resolution: &Resolution) -> R<()> {
    for b in &resolution.sem.bindings {
        let name = javascript.name(b.node);
        if name.starts_with('$') {
            return Err(unsupported(
                format_args!("the `$`-prefixed name `{name}`"),
                span(javascript, b.node),
            ));
        }
        if SHADOWED_GLOBALS.contains(&name) || is_internal(name) || VUE_MACROS.contains(&name) {
            return Err(unsupported(
                format_args!("a binding named `{name}`"),
                span(javascript, b.node),
            ));
        }
    }
    Ok(())
}

/// Runes, store subscriptions and `onMount` outside the uses [`plan`] consumed.
fn check_references(
    javascript: &SyntaxTree,
    resolution: &Resolution,
    program: NodeIdentifier,
    consumed: &FxHashSet<NodeIdentifier>,
) -> R<()> {
    walk(javascript, program, &mut |n| match javascript.kind(n) {
        Kind::Identifier(_) => {
            let name = javascript.name(n);
            let binding = resolution.sem.binding_of(n);
            if VUE_MACROS.contains(&name) {
                return Err(unsupported(
                    format_args!("the name `{name}`"),
                    span(javascript, n),
                ));
            }
            if name.starts_with('$') && binding.is_none() && !consumed.contains(&n) {
                return Err(unsupported(
                    format_args!("the rune or store subscription `{name}`"),
                    span(javascript, n),
                ));
            }
            Ok(())
        }
        _ => Ok(()),
    })
}

/// Writes Vue would not see the way Svelte does.
fn check_writes(javascript: &SyntaxTree, resolution: &Resolution) -> R<()> {
    for (b, info) in resolution.bindings.iter_enumerated() {
        let s = &resolution.sem.bindings[b];
        let refused = match info.kind {
            BindingKind::RestProperty => {
                (s.writes > 0 || s.mutations > 0).then_some("writing the rest of `$props()`")
            }
            _ => None,
        };
        if let Some(what) = refused {
            return Err(unsupported(what, span(javascript, s.node)));
        }
    }
    Ok(())
}

/// Visits every node that is an expression or a binding, not property names.
///
/// # Errors
///
/// The first error `f` returns.
pub fn walk(
    javascript: &SyntaxTree,
    root: NodeIdentifier,
    f: &mut impl FnMut(NodeIdentifier) -> R<()>,
) -> R<()> {
    let mut stack = vec![root];
    while let Some(n) = stack.pop() {
        f(n)?;
        match javascript.kind(n) {
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                stack.push(object);
                if computed {
                    stack.push(property);
                }
            }
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => {
                if computed {
                    stack.push(key);
                }
                stack.push(value);
            }
            Kind::ImportNamed { local, .. } => stack.push(local),
            _ => javascript.for_each_child(n, |k| stack.push(k)),
        }
    }
    Ok(())
}

pub(super) fn span(
    javascript: &SyntaxTree,
    n: NodeIdentifier,
) -> rsvelte_kernel::source::positions::Span {
    javascript.source_location(n).span().unwrap_or_default()
}

/// Each key with its default, and the rest.
type Props = (
    Vec<(String, Option<NodeIdentifier>)>,
    Option<NodeIdentifier>,
);

/// `let { a, b = 1, c: d, ...rest } = $props()`: plain keys with literal defaults, and the rest.
fn props(javascript: &SyntaxTree, pattern: NodeIdentifier) -> R<Props> {
    let refuse = |n: NodeIdentifier| {
        Err(unsupported(
            "a `$props()` pattern other than plain keys with literal defaults",
            span(javascript, n),
        ))
    };
    if matches!(javascript.kind(pattern), Kind::Identifier(_)) {
        return Ok((Vec::new(), Some(pattern)));
    }
    let Kind::ObjectPattern(list) = javascript.kind(pattern) else {
        return refuse(pattern);
    };
    let mut out = Vec::with_capacity(list.len());
    let mut rest = None;
    for &p in list {
        if let Kind::Rest(arg) = javascript.kind(p)
            && matches!(javascript.kind(arg), Kind::Identifier(_))
        {
            rest = Some(arg);
            continue;
        }
        let Kind::Property {
            key,
            value,
            computed: false,
            method: false,
            ..
        } = javascript.kind(p)
        else {
            return refuse(p);
        };
        if !matches!(javascript.kind(key), Kind::Identifier(_)) {
            return refuse(p);
        }
        let default = match javascript.kind(value) {
            Kind::Identifier(_) => None,
            Kind::AssignPattern(target, d)
                if matches!(javascript.kind(target), Kind::Identifier(_)) =>
            {
                if is_literal(javascript, d) {
                    Some(d)
                } else if rune_call(javascript, d).is_some_and(|(name, _)| name == "$bindable") {
                    let Kind::Call { arguments, .. } = javascript.kind(d) else {
                        unreachable!()
                    };
                    if arguments.len() > 1 {
                        return refuse(d);
                    }
                    None
                } else {
                    None
                }
            }
            _ => return refuse(p),
        };
        let name = javascript.name(key);
        let reserved = matches!(name, "key" | "ref" | "ref_for" | "ref_key")
            || name.starts_with("onVnode")
            || VUE_GLOBALS.contains(&name);
        if reserved {
            return Err(unsupported(
                format_args!("the prop name `{name}` (Vue reserves it or reads it as a global)"),
                span(javascript, key),
            ));
        }
        out.push((name.to_owned(), default));
    }
    Ok((out, rest))
}

fn is_literal(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    match javascript.kind(e) {
        Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => true,
        Kind::Unary(rsvelte_typescript::operators::UnaryOperator::Neg, n) => {
            matches!(javascript.kind(n), Kind::Number(_))
        }
        Kind::Template { expressions, .. } => expressions.is_empty(),
        _ => false,
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
mod patterns;
pub(crate) mod runes;
pub(crate) use emit::rune_value;
pub use emit::{emit, prop_member};
pub(crate) use patterns::declaration as pattern_declaration;

pub(crate) fn prop_cell(
    resolution: &Resolution,
    javascript: &SyntaxTree,
    binding: BindingIdentifier,
) -> bool {
    match resolution.bindings[binding].kind {
        BindingKind::BindableProperty => true,
        BindingKind::Property => {
            resolution.sem.bindings[binding].writes > 0
                || resolution.bindings[binding]
                    .initial
                    .is_some_and(|value| !is_literal(javascript, value))
        }
        _ => false,
    }
}
