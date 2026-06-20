//! Server `Component` / `SvelteComponent` / `SvelteSelf` visitors — the Rust
//! port of `3-transform/server/visitors/{Component,SvelteComponent,SvelteSelf}.js`
//! plus the shared `build_inline_component` (`shared/component.js`).
//!
//! Upstream `Component` (写经):
//! ```js
//! export function Component(node, context) {
//!     build_inline_component(node, context.visit(b.member_id(node.name)), context);
//! }
//! ```
//! `SvelteComponent` passes `context.visit(node.expression)`; `SvelteSelf`
//! passes `b.id(context.state.analysis.name)`.
//!
//! `build_inline_component` (写经, props-object path) — see upstream
//! `shared/component.js` lines 21-359. The props object is assembled from a
//! `props_and_spreads` list whose entries are either a group of plain
//! `Property[]` (regular attrs / bind accessors) or a spread `Expression`:
//!
//! ```js
//! const props_expression =
//!     props_and_spreads.length === 0 ||
//!     (props_and_spreads.length === 1 && Array.isArray(props_and_spreads[0]))
//!         ? b.object(props_and_spreads[0] || [])
//!         : b.call('$.spread_props', b.array(props_and_spreads.map(p =>
//!               Array.isArray(p) ? b.object(p) : p)));
//! let statement = b.stmt(b.call(expression, b.id('$$renderer'), props_expression));
//! context.state.template.push(statement);
//! if (!dynamic && !is_async && !is_standalone && custom_css_props.length === 0)
//!     context.state.template.push(empty_comment);  // `<!---->`
//! ```
//!
//! So `<Foo a={x} b="lit" {...spread} c={y} />` lowers to
//! `Foo($$renderer, $.spread_props([{ a: x, b: 'lit' }, spread, { c: y }]));`
//! and `<Foo a={x} b="lit" />` (no spread) to `Foo($$renderer, { a: x, b: 'lit' });`.
//!
//! 写经 gaps (KNOWN GAP — emit nothing / skip):
//! - `bind:x` SET side: upstream visits `b.assignment('=', expr, $$value)`
//!   through the read-rewriter so the assignment target is rewritten; here the
//!   SET assignment LHS uses the *un-read-wrapped* visit (correct for the common
//!   identifier / member case, a gap for derived-rooted targets). `bind:` whose
//!   expression is a `SequenceExpression` (`bind:x={get, set}`) is NOT handled.
//! - LetDirective / slots / children: the `children` / `$$slots` props and the
//!   slot snippet functions are NOT emitted (child fragments not serialized).
//! - AttachTag (`@attach`) blocker bookkeeping is skipped.
//! - custom-CSS `--*` props (`$.css_props`) are skipped.
//! - the `dynamic` branch (`SvelteComponent` / dynamic `<Foo>`) — no
//!   `if (Foo) { … }` guard; emitted as the plain static call.
//! - async blocker wrapping (`optimiser.render_block`).

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SpreadAttribute};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{Expression as OxcExpression, ObjectPropertyKind};

use super::shared::{EMPTY_COMMENT, TemplateEntry};

/// One entry of upstream's `props_and_spreads` list: either a contiguous group
/// of plain object properties, or a single spread expression.
enum PropGroup<'a> {
    Props(Vec<ObjectPropertyKind<'a>>),
    Spread(OxcExpression<'a>),
}

/// Visit a `<Foo .../>` component (static path).
pub fn visit_component<'a>(
    node: &crate::ast::template::Component,
    state: &mut ServerTransformState<'a>,
) {
    // Upstream: `context.visit(b.member_id(node.name))` — a dotted name like
    // `ns.Comp` becomes the member chain; a bare name an identifier.
    let expr = state.b.member_id(node.name.as_str());
    build_inline_component(&node.attributes, expr, state);
}

/// Visit a `<svelte:component this={expr}/>` element (static path).
pub fn visit_svelte_component<'a>(
    node: &crate::ast::template::SvelteComponentElement,
    state: &mut ServerTransformState<'a>,
) {
    let expr = state.visit_expr(&node.expression);
    build_inline_component(&node.attributes, expr, state);
}

/// Visit a `<svelte:self .../>` element (static path).
pub fn visit_svelte_self<'a>(
    node: &crate::ast::template::SvelteElement,
    state: &mut ServerTransformState<'a>,
) {
    let name = state.analysis.name.clone();
    let expr = state.b.id(&name);
    build_inline_component(&node.attributes, expr, state);
}

/// The shared inline-component lowering (props-object path).
fn build_inline_component<'a>(
    attributes: &[Attribute],
    expression: OxcExpression<'a>,
    state: &mut ServerTransformState<'a>,
) {
    // `props_and_spreads`: a list of plain-prop groups + spread expressions,
    // mirroring upstream's `Array<Property[] | Expression>`.
    let mut groups: Vec<PropGroup<'a>> = Vec::new();
    // Bindings are pushed at the END (upstream `delayed_props`) so a later
    // spread can't overwrite them.
    let mut delayed: Vec<ObjectPropertyKind<'a>> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(a) => {
                // Custom-CSS props (`--foo`) → `$.css_props` — KNOWN GAP, skip.
                if a.name.starts_with("--") {
                    continue;
                }
                let value = component_attribute_value(&a.value, state);
                push_prop(&mut groups, state.b.init(a.name.as_str(), value));
            }
            Attribute::SpreadAttribute(spread) => {
                let expr = visit_spread(spread, state);
                groups.push(PropGroup::Spread(expr));
            }
            Attribute::BindDirective(bind) => {
                // `bind:this` is client-only — emit nothing on the server.
                if bind.name.as_str() == "this" {
                    continue;
                }
                build_bind_accessors(bind, &mut delayed, state);
            }
            // LetDirective / AttachTag / On / Class / Style / Transition /
            // Animate / Use directives: KNOWN GAP (no server props).
            _ => {}
        }
    }

    // Flush delayed bind accessors after all attributes (upstream
    // `delayed_props.forEach(fn => fn())`).
    for prop in delayed {
        push_prop(&mut groups, prop);
    }

    let props_expression = build_props_expression(groups, state);

    // `expression($$renderer, props_expression)`
    let call = state
        .b
        .call(expression, vec![state.b.id("$$renderer"), props_expression]);
    state.template.push(TemplateEntry::Stmt(state.b.stmt(call)));

    // Non-dynamic, non-async, non-standalone, no custom-CSS props → `<!---->`.
    if !state.is_standalone {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }
}

/// Emit the `get`/`set` accessor props for a `bind:name={expr}` component
/// directive into `delayed` (upstream lines 111-152). Two shapes:
///
/// - `bind:name={get, set}` (a `SequenceExpression`): the visited expression is
///   an oxc `SequenceExpression` whose two sub-expressions are the get / set
///   thunks. Emit `get name() { return (<get>)(); }` and
///   `set name($$value) { (<set>)($$value); $$settled = false; }`.
///
///   写经 GAP: upstream hoists the two thunks into `var bind_get = …; var
///   bind_set = …;` in `state.init` and the accessors call those locals; the AST
///   pipeline has no `state.init` seam here, so we inline the thunks as IIFE
///   callees instead. Structurally equivalent for the SSR markers.
///
/// - `bind:name={lvalue}` (anything else): `get name() { return <read>; }` and
///   `set name($$value) { <lvalue> = $$value; $$settled = false; }`.
///
///   写经 GAP: upstream re-visits the whole `lvalue = $$value` assignment so the
///   target is read-rewritten; we use the *un-read-wrapped* LHS (correct for the
///   common identifier / member target).
fn build_bind_accessors<'a>(
    bind: &crate::ast::template::BindDirective,
    delayed: &mut Vec<ObjectPropertyKind<'a>>,
    state: &mut ServerTransformState<'a>,
) {
    use oxc_ast::ast::AssignmentOperator::Assign;

    let name = bind.name.as_str();
    let b = state.b;
    let settled = || b.stmt(b.assignment(Assign, b.id("$$settled"), b.bool(false)));

    // Visit the bind expression; a getter/setter bind yields a SequenceExpression.
    let visited = state.visit_expr(&bind.expression);
    if let OxcExpression::SequenceExpression(seq) = visited {
        let mut exprs = seq.unbox().expressions;
        // Defensive: a non-2-element sequence is malformed for a bind — skip it
        // rather than panic (KNOWN GAP).
        if exprs.len() != 2 {
            return;
        }
        let set_expr = exprs.pop().unwrap();
        let get_expr = exprs.pop().unwrap();
        // get name() { return (<get>)(); }
        let get_call = b.call(get_expr, vec![]);
        delayed.push(b.get(name, vec![b.return_stmt(Some(get_call))]));
        // set name($$value) { (<set>)($$value); $$settled = false; }
        let set_call = b.call(set_expr, vec![b.id("$$value")]);
        delayed.push(b.set(name, vec![b.stmt(set_call), settled()]));
        return;
    }

    // Simple lvalue bind: `get name() { return <read>; }`.
    let read = state.visit_expr(&bind.expression);
    delayed.push(state.b.get(name, vec![state.b.return_stmt(Some(read))]));
    // `set name($$value) { <lvalue> = $$value; $$settled = false; }`.
    let lhs = state.visit_expr_raw(&bind.expression);
    // The LHS must be an identifier / member to be an assignment target; anything
    // else (call, etc.) would panic in `b.assignment`. Guard and skip the set
    // side (still emit the get) for non-lvalue targets (KNOWN GAP).
    if !matches!(
        lhs,
        OxcExpression::Identifier(_)
            | OxcExpression::StaticMemberExpression(_)
            | OxcExpression::ComputedMemberExpression(_)
    ) {
        return;
    }
    let assign = state.b.assignment(Assign, lhs, state.b.id("$$value"));
    delayed.push(state.b.set(name, vec![state.b.stmt(assign), settled()]));
}

/// Append `prop` onto the trailing props group, opening a new group if the last
/// entry is a spread (mirrors upstream's `push_prop` / `do_push`).
fn push_prop<'a>(groups: &mut Vec<PropGroup<'a>>, prop: ObjectPropertyKind<'a>) {
    match groups.last_mut() {
        Some(PropGroup::Props(props)) => props.push(prop),
        _ => groups.push(PropGroup::Props(vec![prop])),
    }
}

/// Build the final props expression from the `props_and_spreads` groups
/// (upstream lines 297-304):
///   - no spread (≤1 group, which is a props group) → `b.object(props)`,
///   - otherwise → `$.spread_props([ {…} | spread, … ])`.
fn build_props_expression<'a>(
    groups: Vec<PropGroup<'a>>,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    let b = state.b;
    let only_props_group =
        groups.is_empty() || (groups.len() == 1 && matches!(groups[0], PropGroup::Props(_)));

    if only_props_group {
        let props = match groups.into_iter().next() {
            Some(PropGroup::Props(props)) => props,
            _ => Vec::new(),
        };
        b.object(props)
    } else {
        let elements: Vec<Option<OxcExpression<'a>>> = groups
            .into_iter()
            .map(|g| {
                Some(match g {
                    PropGroup::Props(props) => b.object(props),
                    PropGroup::Spread(expr) => expr,
                })
            })
            .collect();
        b.call("$.spread_props", vec![b.array(elements)])
    }
}

/// Visit a `{...expr}` spread attribute → the read-wrapped spread expression
/// (upstream `optimiser.transform(context.visit(attribute), …)`; the optimiser
/// transform is identity in the sync path).
fn visit_spread<'a>(
    spread: &SpreadAttribute,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    state.visit_expr(&spread.expression)
}

/// Build the oxc expression for a component prop attribute value — upstream
/// `build_attribute_value(value, …, is_component = true)`.
///
/// - `name` (boolean true) → `true`.
/// - `name="text"` / single-text sequence → a **raw** string literal (components
///   do NOT `escape_html` the chunk).
/// - `name={expr}` / single-expr sequence → the visited (read-wrapped) expression.
/// - mixed text+expr sequence → a template literal `` `text${$.stringify(expr)}` ``
///   (each interpolation wrapped in `$.stringify`, matching upstream's
///   non-`is_string`/`is_defined` branch; `scope.evaluate` folding is a 写经 gap).
fn component_attribute_value<'a>(
    value: &AttributeValue,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    match value {
        AttributeValue::True(_) => state.b.bool(true),
        AttributeValue::Expression(tag) => state.visit_expr(&tag.expression),
        AttributeValue::Sequence(parts) => {
            // Single-element sequence collapses to its lone part.
            if parts.len() == 1 {
                return match &parts[0] {
                    AttributeValuePart::Text(t) => state.b.string(t.data.as_str()),
                    AttributeValuePart::ExpressionTag(tag) => state.visit_expr(&tag.expression),
                };
            }

            // Mixed run → template literal (no escape; stringify interpolations).
            let mut quasis: Vec<String> = vec![String::new()];
            let mut exprs: Vec<OxcExpression<'a>> = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        quasis.last_mut().unwrap().push_str(t.data.as_str());
                    }
                    AttributeValuePart::ExpressionTag(tag) => {
                        let visited = state.visit_expr(&tag.expression);
                        let stringified = state.b.call("$.stringify", vec![visited]);
                        exprs.push(stringified);
                        quasis.push(String::new());
                    }
                }
            }
            let quasi_refs: Vec<&str> = quasis.iter().map(|s| s.as_str()).collect();
            state.b.template(quasi_refs, exprs)
        }
    }
}
