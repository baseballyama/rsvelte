//! Pre-pass that walks the template AST to collect the slot and forwarded-event
//! information the component's return statement needs.

mod pattern;

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, Fragment, TemplateNode};
use pattern::{collect_pattern_bindings, expand_object_shorthands};

use super::attributes::let_::get_let_directives;
use super::nodes::slot_element::{dollar_slot_name, get_slot_attr_value, slot_name_for_type};
use super::utils::expr::get_expression_text;
use super::{ForwardedEventKind, TemplateInfo};

pub(super) fn collect_info_from_fragment(
    fragment: &Fragment,
    source: &str,
    info: &mut TemplateInfo,
    scope: &mut Vec<(String, String)>,
    enclosing: Option<&str>,
) {
    for node in &fragment.nodes {
        collect_info_from_node(node, source, info, scope, enclosing);
    }
}

/// Collect forwarded-event + slot-let info for a special element, using
/// `event_mapper` (`mapWindowEvent` / `mapBodyEvent` / `mapElementEvent`) for
/// its handler-less `on:` directives.
fn collect_special_element_info(
    el: &crate::ast::template::SvelteElement,
    event_mapper: &str,
    collect_events: bool,
    source: &str,
    info: &mut TemplateInfo,
    scope: &mut Vec<(String, String)>,
    enclosing: Option<&str>,
) {
    if collect_events {
        for attr in &el.attributes {
            if let Attribute::OnDirective(on) = attr
                && on.expression.is_none()
            {
                let event_name = on.name.to_string();
                let event_value = format!("__sveltets_2_{}('{}')", event_mapper, event_name);
                info.element_events
                    .push((event_name, event_value, ForwardedEventKind::Element));
            }
        }
    }
    // Slot-consumer `let:` bindings on a special element used as a slotted child
    // are gathered at the enclosing component (see
    // `push_component_slot_consumer_lets`), so just recurse here.
    collect_info_from_fragment(&el.fragment, source, info, scope, enclosing);
}

/// `enclosing` is the name of the nearest ancestor component, used to build
/// `let:`-forwarding slot reflections (`__sveltets_2_instanceOf(<Comp>).$$slot_def[…]`).
fn collect_info_from_node(
    node: &TemplateNode,
    source: &str,
    info: &mut TemplateInfo,
    scope: &mut Vec<(String, String)>,
    enclosing: Option<&str>,
) {
    match node {
        TemplateNode::SlotElement(el) => {
            if let Some(names) = &mut info.dollar_slot_names {
                let name = dollar_slot_name(&el.attributes);
                names.insert(name);
            }
            // Collect slot name and props. The `slots` *type* key uses
            // `undefined` for a dynamic name (`<slot name="{foo}">`), unlike the
            // `__sveltets_createSlot("{foo}", …)` call which keeps the raw text.
            let slot_name = slot_name_for_type(&el.attributes);
            let slot_props = collect_slot_prop_entries(&el.attributes, source, scope);
            // Official `SlotHandler.handleSlot` does `this.slots.set(name, …)`:
            // a later `<slot name=X>` REPLACES the earlier def for X (it does not
            // accumulate), so two `<slot key="a"/><slot key="b"/>` yield only the
            // last one's props.
            info.slots.insert(slot_name, slot_props);
            collect_info_from_fragment(&el.fragment, source, info, scope, enclosing);
        }
        TemplateNode::RegularElement(el) => {
            // Collect forwarded events (on:event without handler)
            for attr in &el.attributes {
                if let Attribute::OnDirective(on) = attr
                    && on.expression.is_none()
                {
                    // Event forwarding: on:click (no handler)
                    let event_name = on.name.to_string();
                    let event_value = format!("__sveltets_2_mapElementEvent('{}')", event_name);
                    // Element forward → official `bubbledEvents.set` (plain
                    // overwrite); the assembly reduction collapses duplicates.
                    info.element_events.push((
                        event_name,
                        event_value,
                        ForwardedEventKind::Element,
                    ));
                }
            }
            collect_info_from_fragment(&el.fragment, source, info, scope, enclosing);
        }
        // Forwarded events on `<svelte:window>` / `<svelte:body>` map to
        // `mapWindowEvent` / `mapBodyEvent` (official getEventDefExpressionForNonComponent);
        // every other special element uses `mapElementEvent`.
        TemplateNode::SvelteWindow(el) => {
            collect_special_element_info(
                el,
                "mapWindowEvent",
                true,
                source,
                info,
                scope,
                enclosing,
            );
        }
        TemplateNode::SvelteBody(el) => {
            collect_special_element_info(el, "mapBodyEvent", true, source, info, scope, enclosing);
        }
        TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteOptions(el) => {
            collect_special_element_info(
                el,
                "mapElementEvent",
                true,
                source,
                info,
                scope,
                enclosing,
            );
        }
        // `<svelte:self>` is an `InlineComponent` (official `getTypeForComponent`
        // → `__sveltets_1_componentType()`): its `let:` directives bind its own
        // slots, so a `let:`-bound name in its body resolves through
        // `instanceOf(componentType).$$slot_def[…]` rather than an enclosing each
        // context. But official `EventHandler.handleEventHandler` returns early
        // for `svelte:self`, so a bare `on:event` forwards NOTHING — pass `false`
        // for the forwards-events flag.
        TemplateNode::SvelteSelf(el) => {
            let pushed = push_component_slot_consumer_lets(
                "__sveltets_1_componentType()",
                &el.attributes,
                &el.fragment.nodes,
                source,
                scope,
            );
            collect_special_element_info(
                el,
                "mapElementEvent",
                false,
                source,
                info,
                scope,
                enclosing,
            );
            for _ in 0..pushed {
                scope.pop();
            }
        }
        TemplateNode::Component(comp) => {
            // Forwarded component events (`<Inner on:bar />`, no handler) surface
            // in the events return as
            // `bar: __sveltets_2_bubbleEventDef(__sveltets_2_instanceOf(Inner).$$events_def, "bar")`.
            for attr in &comp.attributes {
                if let Attribute::OnDirective(on) = attr
                    && on.expression.is_none()
                {
                    let event_name = on.name.to_string();
                    let event_value = format!(
                        "__sveltets_2_bubbleEventDef(__sveltets_2_instanceOf({}).$$events_def, '{}')",
                        comp.name, event_name
                    );
                    // Component forward → official `handleEventHandlerBubble`
                    // concats into the existing entry (`unionType` of each
                    // forwarding instance).
                    info.element_events.push((
                        event_name,
                        event_value,
                        ForwardedEventKind::Component,
                    ));
                }
            }
            // Collect every slot-consumer `let:` binding for this component into
            // one component-level scope — the component's own default-slot lets
            // plus each direct slotted child's lets (last-binding-wins) — spanning
            // the whole subtree. Mirrors `getSlotConsumerOfComponent` +
            // `handleComponentLet`.
            let pushed = push_component_slot_consumer_lets(
                &comp.name,
                &comp.attributes,
                &comp.fragment.nodes,
                source,
                scope,
            );
            collect_info_from_fragment(&comp.fragment, source, info, scope, Some(&comp.name));
            for _ in 0..pushed {
                scope.pop();
            }
        }
        TemplateNode::SvelteComponent(comp) => {
            // Forwarded events on `<svelte:component this={X} on:foo>`: emit
            // `bubbleEventDef(__sveltets_2_instanceOf(X).$$events_def, …)` using
            // the component's `this` expression as the instanceOf argument.
            // (Upstream uses the literal tag name `svelte:component` here, which
            // is not a valid TS identifier and makes the whole output
            // unparseable; rsvelte emits the real `this` expression so the
            // output stays valid TSX.)
            let this_expr = get_expression_text(&comp.expression, source);
            for attr in &comp.attributes {
                if let Attribute::OnDirective(on) = attr
                    && on.expression.is_none()
                {
                    let event_name = on.name.to_string();
                    let event_value = format!(
                        "__sveltets_2_bubbleEventDef(__sveltets_2_instanceOf({}).$$events_def, '{}')",
                        this_expr, event_name
                    );
                    info.element_events.push((
                        event_name,
                        event_value,
                        ForwardedEventKind::Component,
                    ));
                }
            }
            // `<svelte:component this={X}>` is an InlineComponent: collect its
            // slot-consumer `let:` bindings (typed via
            // `__sveltets_1_componentType()`, per official `getTypeForComponent`).
            let pushed = push_component_slot_consumer_lets(
                "__sveltets_1_componentType()",
                &comp.attributes,
                &comp.fragment.nodes,
                source,
                scope,
            );
            collect_info_from_fragment(&comp.fragment, source, info, scope, enclosing);
            for _ in 0..pushed {
                scope.pop();
            }
        }
        TemplateNode::IfBlock(block) => {
            collect_info_from_fragment(&block.consequent, source, info, scope, enclosing);
            if let Some(ref alt) = block.alternate {
                collect_info_from_fragment(alt, source, info, scope, enclosing);
            }
        }
        TemplateNode::EachBlock(block) => {
            // Bind the `{#each coll as ctx}` context for the body's slot props.
            // The collection is resolved in the PARENT scope (the each context is
            // not yet bound) — mirrors official EachBlock →
            // `resolveExpression(initExpression, scope.parent)`. A simple
            // identifier context binds to `__sveltets_2_unwrapArr(coll)`; a
            // destructuring context (`{ value, id }` / `[a, b]`) binds each leaf
            // identifier to `((<pattern>) => name)(__sveltets_2_unwrapArr(coll))`,
            // mirroring `SlotHandler.resolveDestructuringAssignment`. (The fallback
            // is outside the each scope.)
            let pushed = if let Some(ctx) = block.context.as_ref() {
                let coll = resolve_in_scope(get_expression_text(&block.expression, source), scope);
                let unwrapped = format!("__sveltets_2_unwrapArr({})", coll);
                if let Some(name) = expression_simple_identifier(ctx, source) {
                    scope.push((name, unwrapped));
                    1usize
                } else {
                    let pattern = get_expression_text(ctx, source);
                    let mut count = 0usize;
                    for name in collect_pattern_bindings(pattern) {
                        scope.push((
                            name.clone(),
                            format!("(({}) => {})({})", pattern, name, unwrapped),
                        ));
                        count += 1;
                    }
                    count
                }
            } else {
                0usize
            };
            collect_info_from_fragment(&block.body, source, info, scope, enclosing);
            for _ in 0..pushed {
                scope.pop();
            }
            if let Some(ref fallback) = block.fallback {
                collect_info_from_fragment(fallback, source, info, scope, enclosing);
            }
        }
        TemplateNode::AwaitBlock(block) => {
            if let Some(ref pending) = block.pending {
                collect_info_from_fragment(pending, source, info, scope, enclosing);
            }
            if let Some(ref then) = block.then {
                // `{#await promise then value}` binds `value` to
                // `__sveltets_2_unwrapPromiseLike(promise)` for slot props in the
                // then-branch (mirrors official slot scope resolution).
                let pushed = block
                    .value
                    .as_ref()
                    .and_then(|v| expression_simple_identifier(v, source))
                    .map(|name| {
                        let promise = get_expression_text(&block.expression, source);
                        scope.push((name, format!("__sveltets_2_unwrapPromiseLike({})", promise)));
                    })
                    .is_some();
                collect_info_from_fragment(then, source, info, scope, enclosing);
                if pushed {
                    scope.pop();
                }
            }
            if let Some(ref catch) = block.catch {
                collect_info_from_fragment(catch, source, info, scope, enclosing);
            }
        }
        TemplateNode::KeyBlock(block) => {
            collect_info_from_fragment(&block.fragment, source, info, scope, enclosing);
        }
        TemplateNode::SnippetBlock(block) => {
            collect_info_from_fragment(&block.body, source, info, scope, enclosing);
        }
        TemplateNode::TitleElement(el) => {
            collect_info_from_fragment(&el.fragment, source, info, scope, enclosing);
        }
        TemplateNode::SvelteElement(el) => {
            // `<svelte:element>` is an `Element` node in the official AST, so a
            // bare `on:event` forwards as an element event (`mapElementEvent`).
            for attr in &el.attributes {
                if let Attribute::OnDirective(on) = attr
                    && on.expression.is_none()
                {
                    let event_name = on.name.to_string();
                    let event_value = format!("__sveltets_2_mapElementEvent('{}')", event_name);
                    info.element_events.push((
                        event_name,
                        event_value,
                        ForwardedEventKind::Element,
                    ));
                }
            }
            collect_info_from_fragment(&el.fragment, source, info, scope, enclosing);
        }
        // Leaf nodes don't have children to recurse into
        _ => {}
    }
}

/// Push `let:`-forwarding slot reflections onto the template scope.
///
/// For a `let:x` directive associated with component `<C>`'s slot `slot_name`,
/// any later reference to the bound name inside the slotted content resolves to
/// `__sveltets_2_instanceOf(C).$$slot_def["<slot>"].x` instead of the bare name.
/// Mirrors official `SlotHandler.resolveLet` / `getResolveExpressionStrForLet`.
/// Returns how many entries were pushed (to pop afterwards).
fn push_let_reflection_scope(
    attributes: &[Attribute],
    component: &str,
    slot_name: &str,
    source: &str,
    scope: &mut Vec<(String, String)>,
) -> usize {
    let mut pushed = 0;
    for ld in get_let_directives(attributes) {
        // The locally bound name: `let:name={n}` binds `n`; shorthand `let:name`
        // binds `name`. The reflected property is always the directive name.
        let binding = ld
            .expression
            .as_ref()
            .and_then(|e| expression_simple_identifier(e, source))
            .unwrap_or_else(|| ld.name.to_string());
        let value = format!(
            "__sveltets_2_instanceOf({}).$$slot_def[\"{}\"].{}",
            component, slot_name, ld.name
        );
        scope.push((binding, value));
        pushed += 1;
    }
    pushed
}

/// Collect every `let:`-forwarding slot reflection for a component (or
/// `svelte:self` / `svelte:component`) into the template scope, mirroring
/// official `SlotHandler.getSlotConsumerOfComponent` + the `handleComponentLet`
/// loop in `htmlxtojsx_v2/index.ts`.
///
/// All of a component's slot-consumer `let:` bindings live in ONE component-level
/// scope: the component's own `let:` directives bind its DEFAULT slot, and every
/// direct child carrying a static `slot="x"` contributes its `let:` directives
/// keyed to slot `x`. They are pushed in document order (default first), so for a
/// name bound by several slots the LAST binding wins (`resolve_in_scope` searches
/// from the end), exactly like `TemplateScope.inits.set(name, …)` overwriting.
/// The scope spans the WHOLE component subtree (popped by the caller on leave),
/// so a `let:`-bound name is resolvable from any nested slot/element, not only the
/// child that declared it.
///
/// `comp_type` is the `getTypeForComponent` result: the component name, or
/// `__sveltets_1_componentType()` for `svelte:self` / `svelte:component`.
/// Returns the number of pushed entries (to pop afterwards).
fn push_component_slot_consumer_lets(
    comp_type: &str,
    own_attributes: &[Attribute],
    children: &[TemplateNode],
    source: &str,
    scope: &mut Vec<(String, String)>,
) -> usize {
    // Default-slot lets: `let:` directly on the component tag.
    let mut pushed = push_let_reflection_scope(own_attributes, comp_type, "default", source, scope);
    // Named-slot lets: each direct child with a static `slot="x"` attribute.
    for child in children {
        if let Some(child_attrs) = node_slot_consumer_attributes(child)
            && let Some(slot_name) = get_slot_attr_value(child_attrs, source)
        {
            pushed += push_let_reflection_scope(child_attrs, comp_type, &slot_name, source, scope);
        }
    }
    pushed
}

/// Attributes of a template node when it can appear as a component's direct
/// slotted child (`<div slot="x">`, `<Inner slot="x">`, `<svelte:fragment
/// slot="x">`, …). Returns `None` for nodes that cannot carry a `slot=`
/// attribute (text, blocks, tags). Mirrors official `getSlotName(child)` reading
/// `child.attributes`.
fn node_slot_consumer_attributes<'a>(node: &'a TemplateNode<'a>) -> Option<&'a [Attribute<'a>]> {
    match node {
        TemplateNode::RegularElement(el) => Some(&el.attributes),
        TemplateNode::Component(comp) => Some(&comp.attributes),
        TemplateNode::SvelteComponent(comp) => Some(&comp.attributes),
        TemplateNode::SvelteElement(el) => Some(&el.attributes),
        TemplateNode::SlotElement(el) => Some(&el.attributes),
        TemplateNode::TitleElement(el) => Some(&el.attributes),
        TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => Some(&el.attributes),
        _ => None,
    }
}

/// Resolve a value expression through the template scope: each `{#each}`
/// context variable (and `let:`-forwarded slot binding) is substituted (as a
/// whole identifier token) with its resolved form — e.g. an each context
/// becomes `__sveltets_2_unwrapArr(<collection>)` and a `let:`-forwarded name
/// becomes `__sveltets_2_instanceOf(<Comp>).$$slot_def[...]` — so the slot
/// type reflects the array element / forwarded type, both for a bare value
/// (`{item}`) and inside an expression (`item={process(data)}`). Mirrors
/// official `SlotHandler.resolveExpression`'s identifier overwrite pass.
fn resolve_in_scope(value: &str, scope: &[(String, String)]) -> String {
    if scope.is_empty() {
        return value.to_string();
    }
    let chars: Vec<char> = value.chars().collect();
    let is_ident = |c: char| c.is_alphanumeric() || c == '_' || c == '$';
    let mut out = String::with_capacity(value.len());
    let mut i = 0usize;
    while i < chars.len() {
        let c = chars[i];
        // Start of an identifier token (not a member-access tail or a
        // continuation of a longer identifier)?
        let starts_ident = (c.is_alphabetic() || c == '_' || c == '$')
            && (i == 0 || (!is_ident(chars[i - 1]) && chars[i - 1] != '.'));
        if starts_ident {
            let mut j = i + 1;
            while j < chars.len() && is_ident(chars[j]) {
                j += 1;
            }
            let token: String = chars[i..j].iter().collect();
            match scope.iter().rev().find(|(name, _)| name == &token) {
                Some((_, expr)) => out.push_str(expr),
                None => out.push_str(&token),
            }
            i = j;
        } else {
            out.push(c);
            i += 1;
        }
    }
    out
}

/// Collect slot prop entries from a <slot> element's attributes.
/// Returns props like ["a:b", "c:d"] for `<slot a={b} c={d}>`.
fn collect_slot_prop_entries(
    attributes: &[Attribute],
    source: &str,
    scope: &[(String, String)],
) -> Vec<String> {
    // Expand object-literal shorthands first (mirrors official
    // `resolveExpression`'s objectShortHands pass), then substitute in-scope
    // identifiers. A non-object expression is returned unchanged by the expander.
    let resolve =
        |value: &str| -> String { resolve_in_scope(&expand_object_shorthands(value), scope) };
    let mut props = Vec::new();
    for attr in attributes {
        // `<slot {...slotProps}>` spreads the props object into the slot type:
        // `slots: { default: { ...slotProps } }`.
        //
        // Official `SlotHandler.handleSlot` reads `attr.expression.name` — which
        // is only defined when the spread argument is a bare Identifier — then
        // `const name = init ? this.resolved.get(init) : rawName`. So a simple
        // identifier resolves through the template scope (an `{#each}` context
        // becomes `__sveltets_2_unwrapArr(...)`), while a member/other expression
        // (`{...obj.data}`) has `name === undefined` and emits `...undefined`.
        if let Attribute::SpreadAttribute(spread) = attr {
            let name = match expression_simple_identifier(&spread.expression, source) {
                Some(id) => resolve_in_scope(&id, scope),
                None => "undefined".to_string(),
            };
            props.push(format!("...{}", name));
            continue;
        }
        if let Attribute::Attribute(node) = attr {
            if node.name == "name" {
                continue; // Skip the name attribute
            }
            match &node.value {
                AttributeValue::True(_) => {
                    props.push(format!("{}:{}", node.name, resolve(&node.name)));
                }
                AttributeValue::Expression(expr) => {
                    let expr_text = get_expression_text(&expr.expression, source);
                    props.push(format!("{}:{}", node.name, resolve(expr_text)));
                }
                AttributeValue::Sequence(parts) => {
                    // Official `attributeValueIsString` + `attributeStrValueAsJsExpression`
                    // (svelte2tsx `nodes/slot.ts`): a single MustacheTag value is a
                    // resolved expression; a single Text value is a quoted string
                    // literal; ANY other shape (text + interpolation, i.e. a string
                    // built from multiple parts) collapses to the dummy placeholder
                    // `"__svelte_ts_string"` — it typechecks identically as a string.
                    if parts.len() == 1 {
                        match &parts[0] {
                            AttributeValuePart::ExpressionTag(expr) => {
                                let expr_text = get_expression_text(&expr.expression, source);
                                props.push(format!("{}:{}", node.name, resolve(expr_text)));
                            }
                            AttributeValuePart::Text(t) => {
                                // Official wraps the raw text verbatim: `'"' + raw + '"'`.
                                props.push(format!("{}:\"{}\"", node.name, t.raw));
                            }
                        }
                    } else {
                        props.push(format!("{}:\"__svelte_ts_string\"", node.name));
                    }
                }
            }
        }
    }
    props
}

/// Return the identifier name if `expr` is a bare identifier (`{#each x as item}`
/// → `item`), else None. Used to bind each-block contexts in the slot scope.
fn expression_simple_identifier(expr: &crate::ast::js::Expression, source: &str) -> Option<String> {
    let text = get_expression_text(expr, source).trim();
    if !text.is_empty()
        && text
            .chars()
            .enumerate()
            .all(|(i, c)| c == '_' || c == '$' || c.is_alphabetic() || (i > 0 && c.is_numeric()))
    {
        Some(text.to_string())
    } else {
        None
    }
}
