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
//! - LetDirective / scoped slots ARE emitted: a slot whose tag (or, for the
//!   default slot, the component / a `<svelte:fragment>` child) carries
//!   `let:x={pattern}` gets a second destructured `{ x: <pattern>, … }` slot-fn
//!   parameter (`build_component_children` / `lets_to_pattern`). Per-slot scope
//!   binding (`node.metadata.scopes`) for read-rewriting the slot body is the
//!   remaining gap — the body renders in the surrounding `state` scope.
//! - AttachTag (`@attach`) blocker bookkeeping is skipped.
//! - custom-CSS `--*` props (`$.css_props`) are skipped.
//! - async blocker wrapping (`optimiser.render_block`).
//!
//! The `dynamic` branch IS ported: a `<svelte:component>` (always dynamic) or a
//! `<Foo>` / `<Foo.Bar>` whose Phase-2 `metadata.dynamic` is set wraps the call
//! in `if (<expr>) { $$renderer.push('<!--[-->'); <expr>($$renderer, props);
//! $$renderer.push('<!--]-->'); } else { $$renderer.push('<!--[!-->');
//! $$renderer.push('<!--]-->'); }` (markers `BLOCK_OPEN` / `BLOCK_OPEN_ELSE` /
//! `BLOCK_CLOSE`). The trailing `<!---->` empty comment is suppressed for the
//! dynamic path (the guard supplies its own close marker).

use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Fragment, FragmentType, SnippetBlock,
    SpreadAttribute, TemplateNode,
};
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{Expression as OxcExpression, ObjectPropertyKind, Statement};

use super::shared::{BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, EMPTY_COMMENT, TemplateEntry};

/// One entry of upstream's `props_and_spreads` list: either a contiguous group
/// of plain object properties, or a single spread expression.
enum PropGroup<'a> {
    Props(Vec<ObjectPropertyKind<'a>>),
    Spread(OxcExpression<'a>),
}

/// Visit a `<Foo .../>` component.
///
/// Upstream's `dynamic` flag is `node.type === 'SvelteComponent' ||
/// (node.type === 'Component' && node.metadata.dynamic)` — for a plain
/// `<Foo>` / `<Foo.Bar>` the dynamic guard is emitted only when Phase 2 marked
/// `metadata.dynamic` (member-expression component, or a non-`Normal` binding
/// in runes mode).
pub fn visit_component<'a>(
    node: &crate::ast::template::Component,
    state: &mut ServerTransformState<'a>,
) {
    // Upstream: `context.visit(b.member_id(node.name))` — a dotted name like
    // `ns.Comp` becomes the member chain; a bare name an identifier.
    let name = node.name.to_string();
    let dynamic = node.metadata.dynamic;
    build_inline_component(
        &node.attributes,
        &node.fragment,
        |s| s.b.member_id(&name),
        dynamic,
        state,
    );
}

/// Visit a `<svelte:component this={expr}/>` element. `SvelteComponent` is
/// ALWAYS dynamic upstream (`node.type === 'SvelteComponent'`), so the guarded
/// `if (<expr>) { … } else { … }` form is always emitted.
pub fn visit_svelte_component<'a>(
    node: &crate::ast::template::SvelteComponentElement,
    state: &mut ServerTransformState<'a>,
) {
    build_inline_component(
        &node.attributes,
        &node.fragment,
        |s| s.visit_expr(&node.expression),
        true,
        state,
    );
}

/// Visit a `<svelte:self .../>` element. `SvelteSelf` is never dynamic (the
/// component is always defined), so the plain direct-call path is used.
pub fn visit_svelte_self<'a>(
    node: &crate::ast::template::SvelteElement,
    state: &mut ServerTransformState<'a>,
) {
    let name = state.analysis.name.clone();
    build_inline_component(
        &node.attributes,
        &node.fragment,
        |s| s.b.id(&name),
        false,
        state,
    );
}

/// The shared inline-component lowering (props-object path).
///
/// `make_expression` builds the component callee expression; for a `dynamic`
/// component it is invoked TWICE — once for the `if (<expr>)` guard test and
/// once for the `<expr>($$renderer, props)` call — so the read-wrapped /
/// member-chain shape is identical on both sides.
fn build_inline_component<'a, 'b>(
    attributes: &'b [Attribute],
    fragment: &'b Fragment,
    mut make_expression: impl FnMut(&mut ServerTransformState<'a>) -> OxcExpression<'a>,
    dynamic: bool,
    state: &mut ServerTransformState<'a>,
) {
    let expression = make_expression(state);
    // `props_and_spreads`: a list of plain-prop groups + spread expressions,
    // mirroring upstream's `Array<Property[] | Expression>`.
    let mut groups: Vec<PropGroup<'a>> = Vec::new();
    // Bindings are pushed at the END (upstream `delayed_props`) so a later
    // spread can't overwrite them.
    let mut delayed: Vec<ObjectPropertyKind<'a>> = Vec::new();

    // Upstream `has_children_prop`: a `children` *attribute* means the user is
    // already passing a render snippet, so the default-slot body must not be
    // overwritten with a generated `children` prop (it becomes `$$slots.default`
    // pointing at `$.invalid_default_snippet`). We don't replicate the invalid
    // path, but we do track the flag to suppress the generated `children` prop.
    let mut has_children_prop = false;

    // `let:` directives on the component itself feed the **default** slot's
    // destructured parameter — UNLESS this component is itself slotted into an
    // outer component (`slot="x"`), in which case the let scope applies to the
    // component itself and not to its children (upstream
    // `slot_scope_applies_to_itself`).
    let slot_scope_applies_to_itself = attributes
        .iter()
        .any(|a| matches!(a, Attribute::Attribute(at) if at.name.as_str() == "slot"));
    let mut default_lets: Vec<&'b crate::ast::template::LetDirective> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::LetDirective(let_dir) if !slot_scope_applies_to_itself => {
                default_lets.push(let_dir);
            }
            Attribute::Attribute(a) => {
                // Custom-CSS props (`--foo`) → `$.css_props` — KNOWN GAP, skip.
                if a.name.starts_with("--") {
                    continue;
                }
                if a.name.as_str() == "children" {
                    has_children_prop = true;
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
            // AttachTag / On / Class / Style / Transition / Animate / Use
            // directives: KNOWN GAP (no server props).
            _ => {}
        }
    }

    // Flush delayed bind accessors after all attributes (upstream
    // `delayed_props.forEach(fn => fn())`).
    for prop in delayed {
        push_prop(&mut groups, prop);
    }

    // Children / slots / snippet props (upstream `shared/component.js` lines
    // 162-295). Returns any hoisted snippet-function declarations that must wrap
    // the component call in a `{ ... }` block.
    let snippet_declarations = build_component_children(
        fragment,
        has_children_prop,
        default_lets,
        &mut groups,
        state,
    );

    let props_expression = build_props_expression(groups, state);

    // `expression($$renderer, props_expression)`
    let call = state
        .b
        .call(expression, vec![state.b.id("$$renderer"), props_expression]);
    let mut statement = state.b.stmt(call);

    // Dynamic component guard (upstream `shared/component.js`):
    //
    // ```js
    // if (<expr>) {
    //     $$renderer.push('<!--[-->');   // BLOCK_OPEN
    //     <expr>($$renderer, props);
    //     $$renderer.push('<!--]-->');   // BLOCK_CLOSE
    // } else {
    //     $$renderer.push('<!--[!-->');  // BLOCK_OPEN_ELSE
    //     $$renderer.push('<!--]-->');   // BLOCK_CLOSE
    // }
    // ```
    //
    // The test re-uses the SAME callee expression (rebuilt via `make_expression`)
    // so a member chain / read-wrapped identifier matches on both sides.
    if dynamic {
        let test = make_expression(state);
        let b = state.b;
        let push = |s: &str, b: B<'a>| b.stmt(b.call("$$renderer.push", vec![b.string(s)]));
        let consequent = b.block(vec![push(BLOCK_OPEN, b), statement, push(BLOCK_CLOSE, b)]);
        let alternate = b.block(vec![push(BLOCK_OPEN_ELSE, b), push(BLOCK_CLOSE, b)]);
        statement = b.if_stmt(test, consequent, Some(alternate));
    }

    // Upstream: `if (snippet_declarations.length > 0) statement = b.block([...])`.
    if !snippet_declarations.is_empty() {
        let mut block_body = snippet_declarations;
        block_body.push(statement);
        statement = state.b.block(block_body);
    }
    state.template.push(TemplateEntry::Stmt(statement));

    // Non-dynamic, non-async, non-standalone, no custom-CSS props → `<!---->`.
    // A dynamic component already pushed its own `<!--]-->` close marker inside
    // the guard, so the trailing empty comment is suppressed (upstream's
    // `!dynamic` condition on the `empty_comment` push).
    if !dynamic && !state.is_standalone {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }
}

/// Build the `children` / named-slot / snippet props from a component's child
/// fragment (upstream `shared/component.js` lines 162-295). Pushes the slot
/// props onto `groups` (including the trailing `$$slots: { ... }` object) and
/// returns any snippet **function declarations** that must wrap the component
/// call in a hoisting block.
///
/// 写经 gaps (KNOWN GAP):
/// - Per-slot `node.metadata.scopes` are not tracked on the AST pipeline, so the
///   default-slot body is rendered in the surrounding `state` rather than the
///   component scope. This only matters for read-rewriting of slot bodies.
/// - The `$.invalid_default_snippet` error path (a `children` attribute *and* a
///   default-slot body) is not emitted; the default body is simply dropped when
///   `has_children_prop` is set, matching the common "render tag already used"
///   intent without the dev-time error.
/// - `$.prevent_snippet_stringification` (dev-only) wrapper is not emitted.
///
/// `let:` directives ARE handled: a slot whose tag (or, for the default slot, the
/// component itself / a `<svelte:fragment>` child) carries `let:x={pattern}`
/// directives gets a second destructured parameter `{ x: <pattern>, … }` on its
/// slot function (upstream `shared/component.js` lines 232-257).
fn build_component_children<'a, 'b>(
    fragment: &'b Fragment,
    has_children_prop: bool,
    mut default_lets: Vec<&'b crate::ast::template::LetDirective>,
    groups: &mut Vec<PropGroup<'a>>,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let mut snippet_declarations: Vec<Statement<'a>> = Vec::new();
    let mut serialized_slots: Vec<ObjectPropertyKind<'a>> = Vec::new();

    // Group non-snippet children by slot name (default vs `slot="name"`).
    // Snippet blocks are handled inline (they become named props + `$$slots`).
    let mut default_children: Vec<&'b TemplateNode> = Vec::new();
    // Named slots: insertion-ordered (name, nodes, lets).
    let mut named_slots: Vec<(
        String,
        Vec<&'b TemplateNode>,
        Vec<&'b crate::ast::template::LetDirective>,
    )> = Vec::new();

    for child in &fragment.nodes {
        if let TemplateNode::SnippetBlock(snippet) = child {
            // Inline the snippet as a `function name($$renderer, ...) {...}`
            // declaration hoisted into the component-call block, plus a
            // `name: name` prop and a `$$slots` membership entry. (Upstream
            // visits the SnippetBlock with `init: snippet_declarations`.)
            let snippet_name = snippet
                .expression
                .identifier_name()
                .map(|s| s.to_string())
                .unwrap_or_else(|| "snippet".to_string());
            snippet_declarations.push(build_snippet_declaration(snippet, &snippet_name, state));

            // `name: name` prop (the function reference).
            push_prop(
                groups,
                state.b.init(&snippet_name, state.b.id(&snippet_name)),
            );

            // Interop: `$$slots` membership — `children` maps to `default`.
            let slot_key = if snippet_name == "children" {
                "default"
            } else {
                &snippet_name
            };
            serialized_slots.push(state.b.init(slot_key, state.b.bool(true)));
            continue;
        }

        match slot_name_of(child) {
            // A `slot="name"` child: its OWN `let:` directives scope the named
            // slot (upstream `lets[slot_name] = child.attributes.filter(...)`).
            Some(name) => {
                let child_lets = let_directives_of(child);
                match named_slots.iter_mut().find(|(n, _, _)| *n == name) {
                    Some((_, nodes, lets)) => {
                        nodes.push(child);
                        *lets = child_lets;
                    }
                    None => named_slots.push((name, vec![child], child_lets)),
                }
            }
            None => {
                // A `<svelte:fragment>` (no `slot=`) in the default slot
                // contributes its `let:` directives to the default scope
                // (upstream `lets.default.push(...child SvelteFragment lets)`).
                if let TemplateNode::SvelteFragment(_) = child {
                    default_lets.extend(let_directives_of(child));
                }
                default_children.push(child);
            }
        }
    }

    // Default slot → `children` prop + `$$slots.default: true`.
    if !default_children.is_empty() {
        let body = render_slot_body(&default_children, true, state);
        if !body.is_empty() {
            let slot_fn = make_slot_fn(body, &default_lets, state);
            if has_children_prop {
                // A `children` attribute is already present (render-tag usage):
                // expose membership only, don't overwrite the prop. (写经 gap:
                // upstream emits `$.invalid_default_snippet` here.)
                serialized_slots.push(state.b.init("default", state.b.bool(true)));
            } else if default_lets.is_empty() {
                // No `let:` directives → the usual `children` prop path.
                push_prop(groups, state.b.init("children", slot_fn));
                serialized_slots.push(state.b.init("default", state.b.bool(true)));
            } else {
                // Scoped default slot (`let:`): expose `$$slots.default` as the
                // slot function and point `children` at the invalid-snippet guard
                // (upstream's `else` branch, lines 281-287).
                serialized_slots.push(state.b.init("default", slot_fn));
                push_prop(
                    groups,
                    state
                        .b
                        .init("children", state.b.id("$.invalid_default_snippet")),
                );
            }
        }
    }

    // Named slots → `$$slots.name: ($$renderer, { lets… }) => { ... }`.
    for (name, nodes, lets) in &named_slots {
        let body = render_slot_body(nodes, true, state);
        if body.is_empty() {
            continue;
        }
        let slot_fn = make_slot_fn(body, lets, state);
        serialized_slots.push(state.b.init(name, slot_fn));
    }

    if !serialized_slots.is_empty() {
        let slots_obj = state.b.object(serialized_slots);
        push_prop(groups, state.b.init("$$slots", slots_obj));
    }

    snippet_declarations
}

/// Render a slot body (a slice of sibling template nodes) into the statements of
/// a fragment block. Wraps the nodes in a synthetic [`Fragment`] and routes them
/// through the shared fragment machinery — a Component slot IS an `is_text_first`
/// parent, so leading text gets the `<!---->` anchor.
fn render_slot_body<'a>(
    nodes: &[&TemplateNode],
    is_text_first_parent: bool,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let synthetic = Fragment {
        node_type: FragmentType::Fragment,
        nodes: nodes.iter().map(|n| (*n).clone()).collect(),
        metadata: Default::default(),
    };
    super::shared::build_fragment_body(&synthetic, is_text_first_parent, state)
}

/// `($$renderer[, { lets… }]) => { <body> }` — the slot snippet function. When
/// the slot has `let:` directives, a second destructured object-pattern
/// parameter is appended carrying the scope variables (upstream
/// `shared/component.js` lines 232-259).
fn make_slot_fn<'a>(
    body: Vec<Statement<'a>>,
    lets: &[&crate::ast::template::LetDirective],
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    let mut patterns = vec![state.b.id_pat("$$renderer")];
    if !lets.is_empty() {
        patterns.push(lets_to_pattern(lets, state));
    }
    let params = state.b.params(patterns, None);
    state.b.arrow(params, state.b.body(body), false, false)
}

/// Build the destructured `{ x, y: pat, … }` object **binding pattern** for a
/// slot's `let:` directives. Mirrors upstream's per-directive lowering:
///   - `let:x`              → `{ x }`           (shorthand identifier)
///   - `let:x={ident}`      → `{ x: ident }`
///   - `let:x={{a, b}}`     → `{ x: { a, b } }` (object pattern)
///   - `let:x={[a, b]}`     → `{ x: [a, b] }`   (array pattern)
fn lets_to_pattern<'a>(
    lets: &[&crate::ast::template::LetDirective],
    state: &mut ServerTransformState<'a>,
) -> oxc_ast::ast::BindingPattern<'a> {
    let mut props: Vec<(String, oxc_ast::ast::BindingPattern<'a>)> = Vec::with_capacity(lets.len());
    for d in lets {
        let name = d.name.to_string();
        let value = match &d.expression {
            // `let:x` with no value → shorthand `{ x }` (binds to `x`).
            None => state.b.id_pat(&name),
            // `let:x={pattern}` → reinterpret the parsed expression as a pattern.
            // The let-bound names are NOT component-scope reads, so visit raw
            // (no read-wrapping).
            Some(expr) => {
                let visited = state.visit_expr_raw(expr);
                state.b.expr_to_pattern(visited, &name)
            }
        };
        props.push((name, value));
    }
    state.b.object_pattern(props)
}

/// Build a `function name($$renderer, ...params) { <body> }` declaration for a
/// component-child snippet (the same shape as the `SnippetBlock` visitor, but
/// returned for inline hoisting into the component-call block rather than pushed
/// to module scope).
fn build_snippet_declaration<'a>(
    snippet: &SnippetBlock,
    name: &str,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let b = state.b;
    // Emit the declared parameters VERBATIM (destructuring patterns / defaults),
    // mirroring `visit_snippet_block` — a slot snippet `{#snippet children({ foo })}`
    // must produce `function children($$renderer, { foo })`, not `…, undefined`.
    let mut param_srcs: Vec<String> = vec!["$$renderer".to_string()];
    for param in &snippet.parameters {
        let s = super::snippet_block::extract_snippet_param(param, state.source);
        if !s.is_empty() {
            param_srcs.push(s);
        }
    }
    let params = state
        .reparse_params(&param_srcs)
        .unwrap_or_else(|| b.params(vec![b.id_pat("$$renderer")], None));
    // SnippetBlock body IS an `is_text_first` parent.
    let body_block = super::shared::build_fragment_body(&snippet.body, true, state);
    let fn_body = state.b.body(body_block);
    state.b.function_declaration(name, params, fn_body, false)
}

/// Return the `slot="name"` value of an element-like child node, if present.
/// Mirrors upstream's `is_element_node(child)` + `slot` attribute lookup. Only
/// `RegularElement` / `SvelteElement` / `SvelteFragment` / nested `Component`
/// children can carry a `slot=` attribute.
fn slot_name_of(node: &TemplateNode) -> Option<String> {
    let attributes = element_attributes(node)?;
    for attr in attributes {
        if let Attribute::Attribute(a) = attr {
            if a.name.as_str() == "slot" {
                // The slot name is a static text value (`slot="header"`).
                if let AttributeValue::Sequence(parts) = &a.value {
                    if let Some(AttributeValuePart::Text(t)) = parts.first() {
                        return Some(t.data.to_string());
                    }
                }
            }
        }
    }
    None
}

/// Return the attribute list of an element-like template node (the nodes that
/// can carry `slot=` / `let:` directives), or `None` for non-element children.
fn element_attributes(node: &TemplateNode) -> Option<&[Attribute]> {
    Some(match node {
        TemplateNode::RegularElement(el) => &el.attributes,
        TemplateNode::SvelteElement(el) => &el.attributes,
        TemplateNode::SvelteFragment(el) => &el.attributes,
        TemplateNode::Component(el) => &el.attributes,
        TemplateNode::SvelteComponent(el) => &el.attributes,
        TemplateNode::SvelteSelf(el) => &el.attributes,
        _ => return None,
    })
}

/// Collect the `let:` directives declared on an element-like child node, in
/// source order (upstream `child.attributes.filter(LetDirective)`).
fn let_directives_of(node: &TemplateNode) -> Vec<&crate::ast::template::LetDirective> {
    element_attributes(node)
        .into_iter()
        .flatten()
        .filter_map(|attr| match attr {
            Attribute::LetDirective(d) => Some(d),
            _ => None,
        })
        .collect()
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
    // 写经 the upstream `set` accessor: the whole `<lvalue> = $$value`
    // assignment is re-visited by the global visitor, so a store target
    // (`$value.value = $$value`) lowers to `$.store_mutate(...)` and a bare
    // store (`$value = $$value`) to `$.store_set(...)`. Build the assignment
    // from the UN-wrapped lvalue and run the read-wrapping / store-write pass.
    let mut assign = state.b.assignment(Assign, lhs, state.b.id("$$value"));
    super::super::read_wrap::wrap_reads(
        &mut assign,
        state.b,
        state.analysis,
        state.analysis.root.instance_scope_index,
    );
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
