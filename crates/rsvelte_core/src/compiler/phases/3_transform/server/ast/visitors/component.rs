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
//! `build_inline_component` (写经, minimal static path) collapses to:
//! ```js
//! const props_expression = b.object(props);        // when ≤1 prop group
//! let statement = b.stmt(b.call(expression, b.id('$$renderer'), props_expression));
//! context.state.template.push(statement);
//! if (!dynamic && !is_async && !is_standalone && custom_css_props.length === 0)
//!     context.state.template.push(empty_comment);  // `<!---->`
//! ```
//!
//! So `<Foo a="x" b={y} />` lowers to
//! `Foo($$renderer, { a: "x", b: y });` followed by an `<!---->` anchor.
//!
//! 写经 gaps (KNOWN GAP — emit nothing / skip):
//! - SpreadAttribute (`$.spread_props`), BindDirective (get/set props),
//!   LetDirective, AttachTag, custom-CSS `--*` props (`$.css_props`).
//! - slotted children + the `children` / `$$slots` default-slot props
//!   (`<Foo>child</Foo>`) — child fragments are not serialized.
//! - the `dynamic` branch (`SvelteComponent` / dynamic `<Foo>`) — no
//!   `if (Foo) { … }` guard; emitted as the plain static call.
//! - async blocker wrapping (`optimiser.render_block`).

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{Expression as OxcExpression, ObjectPropertyKind};

use super::shared::{EMPTY_COMMENT, TemplateEntry};

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

/// The shared inline-component lowering (static-prop path).
fn build_inline_component<'a>(
    attributes: &[Attribute],
    expression: OxcExpression<'a>,
    state: &mut ServerTransformState<'a>,
) {
    let b = state.b;

    // Collect plain `name={value}` / `name="text"` props as object properties.
    // KNOWN GAP: spreads / binds / lets / attaches / custom-CSS props skipped.
    let mut props: Vec<ObjectPropertyKind<'a>> = Vec::new();
    for attr in attributes {
        if let Attribute::Attribute(a) = attr {
            // Skip custom-CSS props (`--foo`) — KNOWN GAP (`$.css_props`).
            if a.name.starts_with("--") {
                continue;
            }
            if let Some(value) = attribute_value_expr(&a.value, state) {
                props.push(state.b.init(a.name.as_str(), value));
            }
        }
        // SpreadAttribute / directives: KNOWN GAP.
    }

    let props_expression = b.object(props);

    // `expression($$renderer, props_expression)`
    let call = b.call(expression, vec![b.id("$$renderer"), props_expression]);
    state.template.push(TemplateEntry::Stmt(b.stmt(call)));

    // Non-dynamic, non-async, non-standalone, no custom-CSS props → `<!---->`.
    if !state.is_standalone {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }
}

/// Build the oxc expression for a component prop attribute value.
///
/// - `name="text"` (pure static text) → a string literal.
/// - `name={expr}` (single expression) → the visited expression.
/// - `name` (boolean true) → `true`.
///
/// Returns `None` for mixed text+expression sequences (KNOWN GAP — needs a
/// template-literal / concat build).
fn attribute_value_expr<'a>(
    value: &AttributeValue,
    state: &mut ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    match value {
        AttributeValue::True(_) => Some(state.b.bool(true)),
        AttributeValue::Expression(tag) => Some(state.visit_expr(&tag.expression)),
        AttributeValue::Sequence(parts) => match parts.as_slice() {
            [AttributeValuePart::Text(t)] => Some(state.b.string(t.data.as_str())),
            [AttributeValuePart::ExpressionTag(tag)] => Some(state.visit_expr(&tag.expression)),
            // KNOWN GAP: mixed / multi-part sequences.
            _ => None,
        },
    }
}
