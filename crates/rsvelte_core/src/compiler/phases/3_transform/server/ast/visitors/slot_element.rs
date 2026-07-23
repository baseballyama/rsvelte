//! Server `SlotElement` visitor — the Rust port of
//! `3-transform/server/visitors/SlotElement.js`.
//!
//! Upstream (写经):
//! ```js
//! export function SlotElement(node, context) {
//!     const props = [];          // Property[]
//!     const spreads = [];        // Expression[]
//!     const optimiser = new PromiseOptimiser();
//!     let name = b.literal('default');
//!
//!     for (const attribute of node.attributes) {
//!         if (attribute.type === 'SpreadAttribute') {
//!             let expression = context.visit(attribute);
//!             spreads.push(optimiser.transform(expression, attribute.metadata.expression));
//!         } else if (attribute.type === 'Attribute') {
//!             const value = build_attribute_value(attribute.value, context,
//!                 optimiser.transform, false, true);  // is_component = true
//!             if (attribute.name === 'name') {
//!                 name = value;                       // Literal
//!             } else if (attribute.name !== 'slot') {
//!                 props.push(b.init(attribute.name, value));
//!             }
//!         }
//!     }
//!
//!     const props_expression =
//!         spreads.length === 0
//!             ? b.object(props)
//!             : b.call('$.spread_props', b.array([b.object(props), ...spreads]));
//!
//!     const fallback =
//!         node.fragment.nodes.length === 0
//!             ? b.null
//!             : b.thunk(context.visit(node.fragment));   // BlockStatement thunk
//!
//!     const slot = b.call('$.slot', b.id('$$renderer'), b.id('$$props'),
//!                         name, props_expression, fallback);
//!
//!     context.state.template.push(block_open,
//!         ...optimiser.render_block([b.stmt(slot)]), block_close);
//! }
//! ```
//!
//! `let:` directives on a `<slot>` itself receive NO server handling — upstream
//! `SlotElement.js` only iterates `SpreadAttribute` / `Attribute`, so a
//! `<slot let:x>` directive is silently ignored and the fallback fragment thunk
//! stays a zero-parameter `() => { … }` (verified byte-identical to the
//! `transform_server` oracle). The `let:`-scoping that DOES matter happens on
//! *components* and *slotted elements* and is handled in `component.rs`.
//!
//! 写经 gaps (KNOWN GAP):
//! - The `optimiser.render_block` async blocker wrapping is the identity
//!   transform in the sync path (no top-level `await` inside the slot props),
//!   matching the other server visitors.
//! - `scope.evaluate` constant-folding of mixed text+expr slot prop values is not
//!   applied (same gap as `component_attribute_value`).

use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, SlotElement, SpreadAttribute,
};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{Expression as OxcExpression, ObjectPropertyKind};

use super::shared::{BLOCK_CLOSE, BLOCK_OPEN, TemplateEntry, build_fragment_body};

/// Visit a `<slot>` / `<slot name="x">` element.
pub fn visit_slot_element<'a>(node: &SlotElement<'a>, state: &mut ServerTransformState<'a>) {
    let mut props: Vec<ObjectPropertyKind<'a>> = Vec::new();
    let mut spreads: Vec<OxcExpression<'a>> = Vec::new();

    // Slot name defaults to `'default'` (upstream `b.literal('default')`).
    let mut name = state.b.string("default");

    for attr in &node.attributes {
        match attr {
            Attribute::SpreadAttribute(spread) => {
                spreads.push(visit_spread(spread, state));
            }
            Attribute::Attribute(a) => {
                // `is_component = true` value build: raw (un-escaped) literal /
                // visited expression / `$.stringify`-interpolated template.
                let value = slot_attribute_value(&a.value, state);
                match a.name.as_str() {
                    "name" => name = value,
                    // `slot="x"` on a `<slot>` itself is skipped (it controls the
                    // *placement* of the slot in an outer component, not a prop).
                    "slot" => {}
                    other => props.push(state.b.init(other, value)),
                }
            }
            // LetDirective / On / Class / Style / etc.: no server props (KNOWN GAP).
            _ => {}
        }
    }

    // props_expression: bare object, or `$.spread_props([{ ... }, ...spreads])`.
    let props_expression = if spreads.is_empty() {
        state.b.object(props)
    } else {
        let mut elements: Vec<Option<OxcExpression<'a>>> = Vec::with_capacity(spreads.len() + 1);
        elements.push(Some(state.b.object(props)));
        for s in spreads {
            elements.push(Some(s));
        }
        let array = state.b.array(elements);
        state.b.call("$.spread_props", vec![array])
    };

    // fallback: `null` when the slot has no fallback content, else a thunk over the
    // rendered fragment block (`() => { <fragment> }`).
    let fallback = if node.fragment.nodes.is_empty() {
        state.b.null()
    } else {
        // SlotElement fragment is a fragment-level body. SlotElement is NOT in
        // upstream's `is_text_first` parent list (see `clean_nodes`: Fragment /
        // SnippetBlock / EachBlock / SvelteComponent / SvelteBoundary / Component /
        // SvelteSelf only), so leading text does NOT get a `<!---->` anchor.
        // `b.thunk(BlockStatement)` → `() => { <body> }`.
        let body = build_fragment_body(&node.fragment, false, true, state);
        let params = state.b.params(vec![], None);
        state.b.arrow(params, state.b.body(body), false, false)
    };

    // `$.slot($$renderer, $$props, name, props_expression, fallback)`.
    let slot = state.b.call(
        "$.slot",
        vec![
            state.b.id("$$renderer"),
            state.b.id("$$props"),
            name,
            props_expression,
            fallback,
        ],
    );

    // block_open, <slot stmt>, block_close (the optimiser.render_block wrap is the
    // identity transform in the sync path).
    state
        .template
        .push(TemplateEntry::Literal(BLOCK_OPEN.to_string()));
    let stmt = state.b.stmt(slot);
    state.template.push(TemplateEntry::Stmt(stmt));
    state
        .template
        .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
}

/// Visit a `{...expr}` spread attribute on a `<slot>` → the read-wrapped spread
/// expression (sync `optimiser.transform` is identity).
fn visit_spread<'a>(
    spread: &SpreadAttribute,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    state.visit_expr(&spread.expression)
}

/// `build_attribute_value(value, …, is_component = true)` for slot props: raw
/// (un-escaped) literal text, visited expressions, or a `$.stringify`-interpolated
/// template literal for mixed text+expr runs. Mirrors
/// `component.rs::component_attribute_value`.
fn slot_attribute_value<'a>(
    value: &AttributeValue,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    match value {
        AttributeValue::True(_) => state.b.bool(true),
        AttributeValue::Expression(tag) => state.visit_expr(&tag.expression),
        AttributeValue::Sequence(parts) => {
            if parts.len() == 1 {
                return match &parts[0] {
                    AttributeValuePart::Text(t) => state.b.string(t.data.as_ref()),
                    AttributeValuePart::ExpressionTag(tag) => state.visit_expr(&tag.expression),
                };
            }
            // Mixed run → template literal with `scope.evaluate` constant-folding
            // (mirrors upstream `build_attribute_value`): fold known values, and
            // wrap a live interpolation in `$.stringify` only when it is NOT a
            // provably-defined string.
            use crate::compiler::phases::phase3_transform::server::evaluate::{
                EvalValue, js_display_string,
            };
            let mut quasis: Vec<String> = vec![String::new()];
            let mut exprs: Vec<OxcExpression<'a>> = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        quasis.last_mut().unwrap().push_str(t.data.as_ref());
                    }
                    AttributeValuePart::ExpressionTag(tag) => {
                        let evaluation = state
                            .eval_ctx()
                            .evaluate_template_expression(&tag.expression);
                        if let Some(value) = evaluation.known_value() {
                            if !matches!(value, EvalValue::Null | EvalValue::Undefined) {
                                quasis
                                    .last_mut()
                                    .unwrap()
                                    .push_str(&js_display_string(value));
                            }
                            continue;
                        }
                        let visited = state.visit_expr(&tag.expression);
                        let emitted = if evaluation.is_string() && evaluation.is_defined() {
                            visited
                        } else {
                            state.b.call("$.stringify", vec![visited])
                        };
                        exprs.push(emitted);
                        quasis.push(String::new());
                    }
                }
            }
            if exprs.is_empty() {
                return state.b.string(&quasis[0]);
            }
            let quasi_refs: Vec<&str> = quasis.iter().map(|s| s.as_str()).collect();
            state.b.template(quasi_refs, exprs)
        }
    }
}
