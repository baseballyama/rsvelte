//! The instance script: Svelte's runes as Vue's reactivity, by copying the script's tree.
//!
//! A `$state` becomes a `ref`, a `$derived` a `computed`; every script reference to one reads
//! `.value`, every reference to a prop reads `$$props.<key>`. What the script does not mean the
//! same in both runtimes is refused in [`plan`], before anything is built.

use rsvelte_javascript::copy::{Rewrite, Verbatim, copy};
use rsvelte_javascript::scope::BindingIdentifier;
use rsvelte_javascript::syntax_tree::flag;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution, rune_call};
use rsvelte_svelte::syntax::syntax_tree::Component;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::helpers::{self, Helper};
use crate::{R, unsupported};

/// What [`plan`] found: the script's runes and the names the template needs.
#[derive(Debug, Default)]
pub struct Plan {
    /// The local name of `onMount`, imported from `svelte`.
    on_mount: Option<NodeIdentifier>,
    /// `$props()`'s keys and literal defaults, in order; `None` without a `$props()`.
    props: Option<Vec<(String, Option<NodeIdentifier>)>>,
    /// `...rest` in `$props()`: read through Vue's `useAttrs()`.
    pub rest: Option<NodeIdentifier>,
    /// The top-level function declarations, by binding.
    pub functions: FxHashMap<BindingIdentifier, NodeIdentifier>,
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
pub fn plan(c: &Component, resolution: &Resolution, source_text: &str) -> R<Plan> {
    let mut plan = Plan::default();
    let javascript = &c.javascript;
    check_names(javascript, resolution)?;
    let Some(script) = &c.instance else {
        return Ok(plan);
    };
    if script.typescript {
        return Err(unsupported("a TypeScript instance script", script.span));
    }
    check_redeclared(javascript, resolution, c.program)?;
    let Kind::Program(body) = javascript.kind(c.program) else {
        unreachable!("a script parses to a program")
    };
    let mut consumed = FxHashSet::default();
    let mut mount_calls = FxHashSet::default();
    for &s in body {
        match javascript.kind(s) {
            Kind::Import { .. } => match on_mount_import(javascript, source_text, s) {
                Some(local) if plan.on_mount.is_none() => plan.on_mount = Some(local),
                _ => {
                    return Err(unsupported(
                        "an import other than one `onMount` from 'svelte'",
                        span(javascript, s),
                    ));
                }
            },
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
                    let Kind::Call {
                        callee, arguments, ..
                    } = javascript.kind(i)
                    else {
                        unreachable!("a rune is a call")
                    };
                    let ident = matches!(javascript.kind(identifier), Kind::Identifier(_));
                    let ok = match rune {
                        "$state" | "$state.raw" => ident && arguments.len() <= 1,
                        "$derived" | "$derived.by" => ident && arguments.len() == 1,
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
            Kind::ExpressionStatement(e) => {
                if let Some(local) = plan.on_mount
                    && let Kind::Call {
                        callee, arguments, ..
                    } = javascript.kind(e)
                    && matches!(javascript.kind(callee), Kind::Identifier(_))
                    && resolution.sem.binding_of(callee) == resolution.sem.binding_of(local)
                {
                    check_on_mount(javascript, arguments, span(javascript, e))?;
                    mount_calls.insert(callee);
                }
            }
            _ => {}
        }
    }
    check_references(
        javascript,
        resolution,
        c.program,
        plan.on_mount,
        plan.rest,
        &consumed,
        &mount_calls,
    )?;
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

fn on_mount_import(
    javascript: &SyntaxTree,
    source_text: &str,
    import: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let Kind::Import {
        specifiers: [sp],
        source,
        type_only: false,
    } = javascript.kind(import)
    else {
        return None;
    };
    match javascript.kind(*sp) {
        Kind::ImportNamed { imported, local }
            if javascript.name(imported) == "onMount"
                && javascript.str_value(source, source_text) == "svelte" =>
        {
            Some(local)
        }
        _ => None,
    }
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
    on_mount: Option<NodeIdentifier>,
    rest: Option<NodeIdentifier>,
    consumed: &FxHashSet<NodeIdentifier>,
    mount_calls: &FxHashSet<NodeIdentifier>,
) -> R<()> {
    let on_mount_binding = on_mount.and_then(|l| resolution.sem.binding_of(l));
    let rest_binding = rest.and_then(|r| resolution.sem.binding_of(r));
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
            if binding.is_some() && binding == rest_binding && Some(n) != rest {
                return Err(unsupported(
                    "the rest of `$props()` other than spread in the template",
                    span(javascript, n),
                ));
            }
            if binding.is_some()
                && binding == on_mount_binding
                && Some(n) != on_mount
                && !mount_calls.contains(&n)
            {
                return Err(unsupported(
                    "`onMount` other than as a top-level call",
                    span(javascript, n),
                ));
            }
            Ok(())
        }
        Kind::New { .. } => Err(unsupported(
            "a `new` expression (Svelte proxies only plain objects and arrays, Vue more)",
            span(javascript, n),
        )),
        _ => Ok(()),
    })
}

/// Writes Vue would not see the way Svelte does.
fn check_writes(javascript: &SyntaxTree, resolution: &Resolution) -> R<()> {
    for (b, info) in resolution.bindings.iter_enumerated() {
        let s = &resolution.sem.bindings[b];
        let refused = match info.kind {
            BindingKind::Property => {
                (s.writes > 0 || s.mutations > 0).then_some("writing or mutating a prop")
            }
            BindingKind::Derived | BindingKind::DerivedBy => {
                (s.writes > 0).then_some("assigning a `$derived`")
            }
            BindingKind::RestProperty => {
                (s.writes > 0 || s.mutations > 0).then_some("writing the rest of `$props()`")
            }
            BindingKind::BindableProperty => Some("this prop declaration"),
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

fn span(javascript: &SyntaxTree, n: NodeIdentifier) -> rsvelte_kernel::source::positions::Span {
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
                if matches!(javascript.kind(target), Kind::Identifier(_))
                    && is_literal(javascript, d) =>
            {
                Some(d)
            }
            _ => return refuse(p),
        };
        let name = javascript.name(key);
        let reserved = matches!(name, "key" | "ref" | "ref_for" | "ref_key")
            || name.starts_with("onVnode")
            || VUE_GLOBALS.contains(&name)
            || name.bytes().any(|b| b.is_ascii_uppercase());
        if reserved {
            return Err(unsupported(
                format_args!(
                    "the prop name `{name}` (Vue reserves it, reads it as a global, or \
                     normalises its case)"
                ),
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
        Kind::Unary(rsvelte_javascript::operators::UnaryOperator::Neg, n) => {
            matches!(javascript.kind(n), Kind::Number(_))
        }
        Kind::Template { expressions, .. } => expressions.is_empty(),
        _ => false,
    }
}

/// `onMount(() => { … })`: a callback that returns nothing, which Svelte would call on destroy.
fn check_on_mount(
    javascript: &SyntaxTree,
    arguments: &[NodeIdentifier],
    at: rsvelte_kernel::source::positions::Span,
) -> R<()> {
    let refused = || {
        Err(unsupported(
            "an `onMount` callback that may return a value (Svelte calls a returned function on \
             destroy, Vue ignores it)",
            at,
        ))
    };
    let [f] = arguments else { return refused() };
    let (Kind::Arrow {
        body,
        expression_body: false,
        ..
    }
    | Kind::Function {
        body,
        declaration: false,
        ..
    }) = javascript.kind(*f)
    else {
        return refused();
    };
    let mut stack = vec![body];
    while let Some(n) = stack.pop() {
        match javascript.kind(n) {
            Kind::Return(Some(_)) => return refused(),
            Kind::Function { .. } | Kind::Arrow { .. } => {}
            _ => javascript.for_each_child(n, |k| stack.push(k)),
        }
    }
    Ok(())
}

/// The `<script setup>` program: Vue imports, the options and props macros, the helpers, then
/// the script's statements.
#[expect(
    clippy::too_many_lines,
    reason = "the program in output order, one statement kind at a time"
)]
pub fn emit(
    c: &Component,
    resolution: &Resolution,
    plan: &Plan,
    helpers: &[Helper],
    to: &mut SyntaxTree,
) -> NodeIdentifier {
    let javascript = &c.javascript;
    let statements: &[NodeIdentifier] = match javascript.kind(c.program) {
        Kind::Program(body) => body,
        _ => unreachable!("a script parses to a program"),
    };
    let mut runes = (false, false, false);
    for &s in statements {
        if let Kind::VariableDeclaration { declarations, .. } = javascript.kind(s) {
            for &d in declarations {
                if let Kind::Declarator {
                    initializer: Some(i),
                    ..
                } = javascript.kind(d)
                {
                    match rune_call(javascript, i).map(|(r, _)| r) {
                        Some("$state") => runes.0 = true,
                        Some("$state.raw") => runes.1 = true,
                        Some("$derived" | "$derived.by") => runes.2 = true,
                        _ => {}
                    }
                }
            }
        }
    }
    let mut body = Vec::new();
    let mut specs = Vec::new();
    for (used, imported, local) in [
        (runes.0, "ref", "$$ref"),
        (runes.1, "shallowRef", "$$shallowRef"),
        (runes.2, "computed", "$$computed"),
    ] {
        if used {
            let i = to.identifier(imported);
            let l = to.identifier(local);
            specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
        }
    }
    if plan.rest.is_some() {
        let i = to.identifier("useAttrs");
        let l = to.identifier("$$useAttrs");
        specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
    }
    if let Some(local) = plan.on_mount {
        let i = to.identifier("onMounted");
        let l = to.ident(javascript.name(local), javascript.source_location(local));
        specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
    }
    if !specs.is_empty() {
        let source = to.write_string("vue");
        body.push(to.import(&specs, source, false, SourceLocation::SYNTHETIC));
    }
    let key = to.identifier("inheritAttrs");
    let value = to.write_boolean(false, SourceLocation::SYNTHETIC);
    let option = to.property(key, value, 0, SourceLocation::SYNTHETIC);
    let options = to.object(&[option], SourceLocation::SYNTHETIC);
    let callee = to.identifier("defineOptions");
    let call = to.call0(callee, &[options]);
    body.push(to.expression_statement(call));
    if let Some(props) = &plan.props {
        let entries: Vec<NodeIdentifier> = props
            .iter()
            .map(|(name, default)| {
                let fields: Vec<NodeIdentifier> = default
                    .iter()
                    .map(|&d| {
                        let k = to.identifier("default");
                        let v = copy(javascript, to, &mut Verbatim, d);
                        to.property(k, v, 0, SourceLocation::SYNTHETIC)
                    })
                    .collect();
                let k = to.identifier(name);
                let v = to.object(&fields, SourceLocation::SYNTHETIC);
                to.property(k, v, 0, SourceLocation::SYNTHETIC)
            })
            .collect();
        let declaration = to.object(&entries, SourceLocation::SYNTHETIC);
        let callee = to.identifier("defineProps");
        let call = to.call0(callee, &[declaration]);
        let name = to.identifier("$$props");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    if plan.rest.is_some() {
        let callee = to.identifier("$$useAttrs");
        let call = to.call0(callee, &[]);
        let name = to.identifier("$$attrs");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    body.extend(helpers::declarations(helpers, to));
    let mut rewriter = ScriptRewrite { resolution };
    for &s in statements {
        match javascript.kind(s) {
            Kind::Import { .. } => {}
            Kind::VariableDeclaration { kind, declarations } => {
                for &d in declarations {
                    if let Some(statement) = declarator(javascript, kind, d, &mut rewriter, to) {
                        body.push(statement);
                    }
                }
            }
            _ => body.push(copy(javascript, to, &mut rewriter, s)),
        }
    }
    to.program(&body, SourceLocation::SYNTHETIC)
}

/// One declarator as its own statement: a rune as Vue's reactivity, `$props()` as nothing (its
/// keys are in `defineProps`), anything else copied.
fn declarator(
    javascript: &SyntaxTree,
    kind: u8,
    d: NodeIdentifier,
    rewriter: &mut ScriptRewrite<'_>,
    to: &mut SyntaxTree,
) -> Option<NodeIdentifier> {
    let Kind::Declarator {
        identifier,
        initializer,
    } = javascript.kind(d)
    else {
        unreachable!("a declarator")
    };
    let rune = initializer.and_then(|i| rune_call(javascript, i));
    let Some((rune, arg)) = rune else {
        let target = copy(javascript, to, rewriter, identifier);
        let value = initializer.map(|i| copy(javascript, to, rewriter, i));
        let declaration = to.declarator(target, value, javascript.source_location(d));
        return Some(to.var_declaration(kind, &[declaration], javascript.source_location(d)));
    };
    let value = match rune {
        "$props" => return None,
        "$state" | "$state.raw" => {
            let local = if rune == "$state" {
                "$$ref"
            } else {
                "$$shallowRef"
            };
            let callee = to.identifier(local);
            let arguments: Vec<NodeIdentifier> = arg
                .iter()
                .map(|&a| copy(javascript, to, rewriter, a))
                .collect();
            to.call0(callee, &arguments)
        }
        "$derived" => {
            let a = copy(javascript, to, rewriter, arg?);
            let f = to.arrow(&[], a, true, false, SourceLocation::SYNTHETIC);
            let callee = to.identifier("$$computed");
            to.call0(callee, &[f])
        }
        "$derived.by" => {
            let a = copy(javascript, to, rewriter, arg?);
            let callee = to.identifier("$$computed");
            to.call0(callee, &[a])
        }
        _ => unreachable!("checked by plan"),
    };
    let name = to.ident(
        javascript.name(identifier),
        javascript.source_location(identifier),
    );
    Some(to.let_(flag::CONST, name, Some(value)))
}

/// Script references: `x.value` for `$state` and `$derived`, `$$props.<key>` for props.
struct ScriptRewrite<'a> {
    resolution: &'a Resolution,
}

impl ScriptRewrite<'_> {
    fn reference(
        &self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let (b, info) = self.resolution.binding(identifier)?;
        if self.resolution.sem.bindings[b].node == identifier {
            return None;
        }
        match info.kind {
            BindingKind::State
            | BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::DerivedBy => {
                let x = to.ident(from.name(identifier), from.source_location(identifier));
                Some(to.dot(x, "value"))
            }
            BindingKind::Property => prop_member(self.resolution, from, to, identifier),
            _ => None,
        }
    }
}

impl Rewrite for ScriptRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::Identifier(_) => self.reference(from, to, identifier),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let (target, default) = match from.kind(value) {
                    Kind::AssignPattern(t, d) => (t, Some(d)),
                    _ => (value, None),
                };
                if !matches!(from.kind(target), Kind::Identifier(_)) {
                    return None;
                }
                let v = self.reference(from, to, target)?;
                let v = default.map_or(v, |d| {
                    let d = copy(from, to, self, d);
                    to.assign_pat(v, d, from.source_location(value))
                });
                let k = to.ident(from.name(key), from.source_location(key));
                Some(to.property(k, v, 0, from.source_location(identifier)))
            }
            _ => None,
        }
    }
}

/// `$$props.<key>` for a reference to a prop, `$$attrs` for the rest; `None` for anything else.
pub fn prop_member(
    resolution: &Resolution,
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    identifier: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let (b, info) = resolution.binding(identifier)?;
    if resolution.sem.bindings[b].node == identifier {
        return None;
    }
    if info.kind == BindingKind::RestProperty {
        return Some(to.ident("$$attrs", from.source_location(identifier)));
    }
    if info.kind != BindingKind::Property {
        return None;
    }
    let key = from.name(info.prop_key?);
    let object = to.identifier("$$props");
    let property = to.ident(key, SourceLocation::SYNTHETIC);
    Some(to.member(
        object,
        property,
        false,
        false,
        from.source_location(identifier),
    ))
}
