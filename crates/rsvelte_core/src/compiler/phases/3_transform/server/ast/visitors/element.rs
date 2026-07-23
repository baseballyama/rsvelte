//! Server `RegularElement` visitor — the Rust port of
//! `3-transform/server/visitors/RegularElement.js` + the
//! `shared/element.js::build_element_attributes` attribute path.
//!
//! Mirrors the non-special branch of upstream `RegularElement`:
//!   - push `<name` literal,
//!   - emit attributes (static AND dynamic — `build_element_attributes`),
//!   - push `>` (or `/>` for void elements),
//!   - recurse into children via [`process_children`],
//!   - push `</name>` (unless void).
//!
//! Attribute coverage (写经 of `build_element_attributes` / `build_attribute_value`):
//!   - static text attributes (`name="value"`) → ` name="value"` literal,
//!   - boolean attribute (`disabled`) → ` disabled=""` literal,
//!   - dynamic single-expression (`name={x}`) → `${$.attr('name', x, <bool>)}`,
//!   - mixed text+expr value (`href="/{slug}"`) → `${$.attr('name', `/${$.stringify(slug)}`)}`,
//!   - `class={x}` → `${$.attr_class(x, <css_hash?>, <class:directives?>)}`,
//!   - `style={x}` → `${$.attr_style(x, <style:directives?>)}`,
//!   - `class:foo={cond}` → folded into the 3rd `$.attr_class` arg `{ 'foo': cond }`,
//!   - `style:color={c}` → folded into the 2nd `$.attr_style` arg `{ color: c }`
//!     (a `|important` directive splits the arg into `[normal, important]`),
//!   - the CSS scope-class injection,
//!   - spread (`{...obj}`) → the whole-element `$.attributes({ ...merged },
//!     css_hash?, classes?, styles?, flags?)` form (see
//!     `build_element_spread_attributes`), which merges every static / dynamic
//!     attribute + spread into a single object and replaces per-attribute
//!     emission for the element.
//!
//! Element CONTENT binds (写经 of the `content !== null` return of
//! `build_element_attributes` + the `body !== null` branch of `RegularElement`):
//!   - `<textarea value="…">` (static) / `<textarea bind:value={x}>` → the
//!     escaped value renders as the textarea's only child content,
//!   - contenteditable `bind:innerHTML` / `bind:innerText` / `bind:textContent`
//!     → the bound value renders as the element's content (innerHTML unescaped).
//!
//! See `build_element_content` + `emit_content_body`.
//!
//! Special `<select>` / `<option>` / `<optgroup>` (写经 of the `is_select_special`
//! / `is_option_special` branches of `RegularElement.js`):
//!   - `<select value=…>` / `<select bind:value=…>` / `<select {...spread}>` →
//!     `$$renderer.select(<attrs obj>, ($$renderer) => { <children> }, ...rest)`
//!     (rest = `[css_hash?, classes?, styles?, flags?]`, with a trailing `true`
//!     when the body has rich content),
//!   - `<option>` → `$$renderer.option(<attrs obj>, <body>, ...rest)` where
//!     `body` is the synthetic-value expression (lone `{expr}` child) or a
//!     `($$renderer) => { <children> }` callback,
//!   - a non-special `<optgroup>` / `<select>` with rich content appends a `<!>`
//!     hydration marker before its close tag.
//!
//! The rich-content predicate mirrors the `transform_server` ORACLE
//! (`has_component_or_render_tag` for select, `is_rich_option_content` for
//! option), which is narrower than upstream's `is_customizable_select_element`.
//! See `emit_select_special` / `emit_option_special` /
//! `prepare_element_spread_object`.
//!
//! 写经 gaps (TODO): `use:` directives on the non-spread
//! path, the get/set `{get, set}` select bind form (the option's synthetic value
//! sequence is not decomposed), the dev `push_element` markers on the option
//! wrapper, `<script>` / `<style>` raw-text branches, the get/set `{get, set}` bind form,
//! `$.clsx` clsx object form, event-handler capture, dev `push_element` markers,
//! and the async `PromiseOptimiser` wrapping. Within the spread path, `bind:` /
//! `use:` / `@attach` and the `style:` `|important` split remain gaps (see
//! `build_element_spread_attributes`).

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, BindDirective, RegularElement,
    TemplateNode,
};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::shared::template::{
    escape_attr, is_boolean_attribute, is_void_element,
};
use oxc_ast::ast::BinaryOperator;
use oxc_ast::ast::Expression as OxcExpression;
use oxc_ast::ast::Statement;

use super::shared::{TemplateEntry, process_children};

/// Names whose text values get whitespace-collapsed + trimmed (`class`/`style`).
const WHITESPACE_INSENSITIVE_ATTRIBUTES: [&str; 2] = ["class", "style"];

/// Visit a `<name ...>children</name>` regular element.
pub fn visit_regular_element<'a>(node: &RegularElement<'a>, state: &mut ServerTransformState<'a>) {
    // 写经 upstream `RegularElement.js` l.18: in the HTML namespace the element
    // tag name is lowercased (`<iNPUT>` → `<input>`, `<thisShouldWarnMe>` →
    // `<thisshouldwarnme>`); SVG / MathML preserve case. This must precede the
    // void-element / `<select>` / `<option>` checks so an uppercase void/special
    // tag is recognized.
    let name_owned: String = if node.metadata.svg || node.metadata.mathml {
        node.name.as_str().to_string()
    } else {
        node.name.as_str().to_lowercase()
    };
    let name = name_owned.as_str();
    let is_void = is_void_element(name);

    // -- special `<select value>` / `<option>` branches ---------------------
    //
    // Port of upstream `RegularElement.js` `is_select_special` / `is_option_special`
    // (lines 44-53): these emit `$$renderer.select(...)` / `$$renderer.option(...)`
    // wrappers instead of inline markup, so the renderer can thread the selected
    // value to its `<option>` children. We branch BEFORE the normal open-tag /
    // attribute / children path.
    if is_select_special(node) {
        emit_select_special(node, state);
        return;
    }
    if name == "option" {
        emit_option_special(node, state);
        return;
    }

    // -- `<script>` / `<style>` raw-text element (写经 RegularElement.js l.67-78) --
    //
    // A `<script>` / `<style>` element with a SINGLE text child pushes its child
    // data VERBATIM (NOT HTML-escaped — `b.literal(node.fragment.nodes[0].data)`,
    // so `\`<>\`` stays `<>` not `&lt;>`), then immediately `build_template`s the
    // element into its own `$$renderer.push(...)`. The trailing `return` means the
    // element never coalesces into the surrounding template run, so a non-top-level
    // `<style>`/`<script>` inside a `<div>` / `<svelte:head>` becomes a SEPARATE
    // push (the `<div>` open/close + sibling whitespace flush around it).
    if (name == "script" || name == "style")
        && node.fragment.nodes.len() == 1
        && let TemplateNode::Text(t) = &node.fragment.nodes[0]
    {
        let raw = t.data.to_string();
        // Build the element (open tag + attributes + `>`) into a FRESH buffer so
        // it flushes as its own push, isolated from the surrounding run.
        let saved = std::mem::take(&mut state.template);
        state
            .template
            .push(TemplateEntry::Literal(format!("<{name}")));
        let css_hash: Option<String> =
            if node.metadata.scoped && !state.analysis.css.hash.is_empty() {
                Some(state.analysis.css.hash.to_string())
            } else {
                None
            };
        build_element_attributes(node, css_hash.as_deref(), state);
        // `>` + RAW child data + `</name>` (no escaping of the child).
        state
            .template
            .push(TemplateEntry::Literal(format!(">{raw}</{name}>")));
        let element_template = std::mem::replace(&mut state.template, saved);
        let built = super::shared::build_template(element_template, state);
        for stmt in built {
            state.template.push(TemplateEntry::Stmt(stmt));
        }
        return;
    }

    // -- async-attribute wrapping (写经 RegularElement `PromiseOptimiser`) ---
    //
    // When ANY attribute / spread value carries an inline `await` (or a top-level
    // blocker), the whole element is built into a SEPARATE template buffer with an
    // active `attr_optimiser` (so each async value is hoisted into a `$$N` const),
    // then wrapped in `$$renderer.child(async …)` / `$$renderer.async([…], …)`.
    // Sync elements take the fast path below (no buffering, no wrap), keeping
    // non-async output byte-identical.
    if element_has_async_attribute(node, state) {
        emit_async_element(node, name, is_void, state);
        return;
    }

    // -- DeclarationTag block-scoping (写经 RegularElement `has_declarations`) --
    //
    // An element whose DIRECT fragment contains a `{let …}` / `{const …}`
    // DeclarationTag (Svelte 5.56.0 #18282 — NOT legacy `{@const}`) is
    // non-transparent: its children get their own lexical scope, so a nested
    // declaration (`<div>{const doubled = 'nested'}…</div>`) can SHADOW an
    // outer same-named binding. Upstream wraps the whole element render in a
    // `{ … }` block (`RegularElement.js`: `has_declarations` → child scope), and
    // the (correct) text oracle does too. Without this, the hoistable
    // declaration would float up to the enclosing FRAGMENT and collide with /
    // overwrite a sibling binding of the same name.
    //
    // We capture the element's emitted template entries into a fresh buffer,
    // build them (which hoists the DeclarationTag declarations to the FRONT of
    // the block via `hoist_declarations`), wrap the result in a `BlockStatement`,
    // and push it as a single opaque `Stmt` so the block is scoped to this
    // element alone.
    let has_declarations = node
        .fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::DeclarationTag(_)));
    if has_declarations {
        let saved = std::mem::take(&mut state.template);
        // Scope block-local constant folds to this element: a nested
        // `{const doubled = 'nested'}` registers `doubled` in
        // `eval_inputs.constant_vars` so a `{doubled}` read inside this block
        // folds to the literal `nested`, but it must NOT leak that fold to an
        // outer same-named binding once the block closes (写经 the text oracle's
        // `saved_constants` save/restore in `generate_element`).
        let saved_constants = state.eval_inputs.constant_vars.clone();
        // A `has_declarations` element opens its OWN async-const scope (like a
        // Fragment): an async `{const … = $derived(await …)}` inside it forms a
        // SEPARATE `$$renderer.run` group (`promises_N`) that waits on the parent
        // group's bindings, rather than leaking into the parent's group.
        let saved_consts_scope = super::shared::open_async_consts_scope(state);
        emit_element_body(node, name, is_void, state);
        state.eval_inputs.constant_vars = saved_constants;
        let captured = std::mem::replace(&mut state.template, saved);
        let mut body = super::shared::build_template(captured, state);
        super::shared::flush_element_async_consts(state, saved_consts_scope, &mut body);
        let block = state.b.block(body);
        state.template.push(TemplateEntry::Stmt(block));
        return;
    }

    emit_element_body(node, name, is_void, state);
}

/// Emit an element's open tag, attributes, `>`/`/>`, children, and close tag into
/// `state.template`. Shared by the sync fast path and the async-buffered path.
fn emit_element_body<'a>(
    node: &RegularElement<'a>,
    name: &str,
    is_void: bool,
    state: &mut ServerTransformState<'a>,
) {
    // -- open tag `<name` ---------------------------------------------------
    state
        .template
        .push(TemplateEntry::Literal(format!("<{name}")));

    // -- attributes (static + dynamic) --------------------------------------
    //
    // CSS scoping: when Phase 2 marked this element `scoped` AND the component
    // has a non-empty CSS hash, the scope class (`analysis.css.hash`, already
    // prefixed `svelte-…`) is injected — mirrors upstream's
    // `build_element_attributes` (`css_hash = node.metadata.scoped ?
    // analysis.css.hash : null`).
    let css_hash: Option<String> = if node.metadata.scoped && !state.analysis.css.hash.is_empty() {
        Some(state.analysis.css.hash.to_string())
    } else {
        None
    };
    build_element_attributes(node, css_hash.as_deref(), state);

    // The `content` expression a content-producing attribute / bind renders as
    // the element's CHILD CONTENT — mirrors upstream `build_element_attributes`
    // returning a non-null `content`. Covers `<textarea>` static / bound value
    // and the contenteditable `innerHTML`/`innerText`/`textContent` binds.
    let content = build_element_content(node, state);

    // -- `>` / `/>` ---------------------------------------------------------
    state.template.push(TemplateEntry::Literal(
        if is_void { "/>" } else { ">" }.to_string(),
    ));

    // -- dev element-location instrumentation (写经 RegularElement.js l.94-107)
    // In dev mode, after the opening tag, push `$.push_element($$renderer,
    // '<name>', <line>, <col>)`. The location is `locator(node.start)` — a
    // 1-based line + 0-based column. For a void element, the matching
    // `$.pop_element()` follows immediately (RegularElement.js l.211-213 only
    // runs when there are children, but void elements have none — upstream's
    // pop is gated on `!node_is_void` paths; the oracle emits pop right after
    // push for void).
    if state.options.dev {
        push_element_dev(node, name, state);
    }

    // -- children -----------------------------------------------------------
    if !is_void {
        let namespace = if node.metadata.svg {
            "svg"
        } else if node.metadata.mathml {
            "mathml"
        } else {
            "html"
        };
        // 写经 upstream `RegularElement`: STICKY-set `state.preserve_whitespace`
        // for the subtree when this element is a `<pre>` / `<textarea>`, so nested
        // elements inside a `<pre>` keep their inner whitespace. Save/restore so a
        // sibling subtree is unaffected.
        let saved_preserve_ws = state.preserve_whitespace;
        if matches!(name, "pre" | "textarea") {
            state.preserve_whitespace = true;
        }
        if let Some(content) = content {
            // Content bind: render the bound value as the body when truthy,
            // otherwise fall back to the element's own (trimmed) children.
            // Mirrors upstream RegularElement.js lines 178-198 + the text
            // oracle's `TextareaBody` / `ContentEditableBody` split: a
            // `<textarea>` suppresses the fallback children (its content IS the
            // value), while a contenteditable element renders them in the else.
            let is_textarea = name == "textarea";
            emit_content_body(node, content, namespace, is_textarea, state);
        } else {
            process_children(&node.fragment.nodes, Some(node), namespace, state);
            // For a non-special `<optgroup>` / `<select>` with rich content,
            // upstream appends a `<!>` hydration marker after the children
            // (RegularElement.js lines 200-204).
            if matches!(name, "optgroup" | "select") && is_customizable_select_element(node) {
                state
                    .template
                    .push(TemplateEntry::Literal("<!>".to_string()));
            }
        }
        state.preserve_whitespace = saved_preserve_ws;
        state
            .template
            .push(TemplateEntry::Literal(format!("</{name}>")));
        // -- dev `$.pop_element()` (写经 RegularElement.js l.211-213) --------
        if state.options.dev {
            state.template.push(TemplateEntry::Stmt(
                state.b.stmt(state.b.call("$.pop_element", vec![])),
            ));
        }
    } else if state.options.dev {
        // Void element: the `$.pop_element()` immediately follows the
        // `$.push_element(...)` (the void element has no children) — matches
        // the oracle's void-path pop.
        state.template.push(TemplateEntry::Stmt(
            state.b.stmt(state.b.call("$.pop_element", vec![])),
        ));
    }
}

/// Emit the dev-mode `$.push_element($$renderer, '<name>', <line>, <col>)`
/// statement into the template buffer. The location is the 1-based line /
/// 0-based column of `node.start`, computed via the existing (read-only)
/// `locate_in_source` helper from the legacy server pipeline.
fn push_element_dev<'a>(node: &RegularElement, name: &str, state: &mut ServerTransformState<'a>) {
    let (line, col) = super::shared::locate_in_source(state.source, node.start as usize);
    let b = state.b;
    let call = b.call(
        "$.push_element",
        vec![
            b.id("$$renderer"),
            b.string(name),
            b.number(line as f64),
            b.number(col as f64),
        ],
    );
    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
}

/// Whether the element has any attribute / spread value with an inline `await`
/// or a top-level-await blocker — the predicate that switches on the async
/// `PromiseOptimiser` wrapping. Only ever true under `experimental.async` (the
/// blocker map is empty otherwise, and `text_has_await` requires a literal
/// `await`).
fn element_has_async_attribute(node: &RegularElement, state: &ServerTransformState<'_>) -> bool {
    use super::shared::{expr_text_blockers, text_has_await};
    let is_async_text = |t: &str| text_has_await(t) || !expr_text_blockers(state, t).is_empty();
    for attr in &node.attributes {
        match attr {
            Attribute::SpreadAttribute(spread) => {
                if let Some(t) = state.expr_source(&spread.expression)
                    && is_async_text(t)
                {
                    return true;
                }
            }
            Attribute::Attribute(a) => {
                // Event handlers (`onclick={…}`) and `defaultValue`/`defaultChecked`
                // render NOTHING on the server (they are skipped in
                // `build_element_attributes`), so their expressions never reach
                // the optimiser `transform` upstream — they must NOT make the
                // element async. Without this guard, an `onclick={() => a++}`
                // whose handler reads a binding that happens to carry a blocker
                // (e.g. `a` transitively gated by a chained `$derived(await)`)
                // would spuriously route the element through `emit_async_element`,
                // breaking the surrounding push coalescing.
                let raw_name = a.name.as_str();
                if is_event_attribute_name(raw_name)
                    || raw_name == "defaultValue"
                    || raw_name == "defaultChecked"
                {
                    continue;
                }
                if let Some(t) = attribute_value_source(&a.value, state)
                    && is_async_text(&t)
                {
                    return true;
                }
            }
            Attribute::BindDirective(bind) => {
                // 写经 `shared/element.js`: every bind whose expression survives
                // the early `continue`s (NOT `bind:this`, NOT select/file `value`,
                // NOT a server-omitted readback bind) routes through `transform`,
                // so a blocked / awaited bind expression makes the element async.
                if !bind_skipped_in_ssr(node, bind)
                    && let Some(t) = bind_value_source(bind, state)
                    && is_async_text(&t)
                {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Whether a bind directive is entirely omitted from SSR before reaching the
/// optimiser `transform` (the early `continue`s of upstream `shared/element.js`):
/// `bind:this`, `bind:value` on `<select>`, `bind:value` on a file input, and the
/// server-omitted readback binds (dimensions / media / files / …). Content binds
/// (`bind:innerHTML`, contenteditable, `<textarea>` value) are NOT skipped — they
/// still route through `transform`, so they can make an element async.
fn bind_skipped_in_ssr(node: &RegularElement, bind: &BindDirective) -> bool {
    let name = bind.name.as_str();
    if name == "this" {
        return true;
    }
    if name == "value" && node.name.as_str() == "select" {
        return true;
    }
    if name == "value" && has_input_type(node, "file") {
        return true;
    }
    bind_omit_in_ssr(name)
}

/// Build an async element into a fresh template buffer with an active
/// `attr_optimiser`, then wrap the buffered output in `optimiser.render(...)`
/// (`$$renderer.child(async …)` / `$$renderer.async([$$promises[N]…], …)`). 写经
/// `RegularElement.js`: `optimiser.render([b.block([...build_template(state.template)])])`.
fn emit_async_element<'a>(
    node: &RegularElement<'a>,
    name: &str,
    is_void: bool,
    state: &mut ServerTransformState<'a>,
) {
    use super::shared::{PromiseOptimiser, build_template};

    // Swap in a fresh template buffer + a fresh optimiser for this element.
    let saved_template = std::mem::take(&mut state.template);
    let saved_optimiser = state.attr_optimiser.take();
    state.attr_optimiser = Some(PromiseOptimiser::new());

    emit_element_body(node, name, is_void, state);

    // Reclaim the element's buffered entries + the populated optimiser.
    let element_entries = std::mem::replace(&mut state.template, saved_template);
    let mut optimiser = state.attr_optimiser.take().unwrap_or_default();
    state.attr_optimiser = saved_optimiser;

    // 写经 `RegularElement.js` lines 221-228: an element WITHOUT child
    // declarations (the common case — text / sibling content, not nested
    // declaration-introducing blocks) renders as
    // `optimiser.render([...build_template(state.template)])` — the statements
    // flat, NO `{ ... }` block wrapper. (The block-wrapped `has_child_declarations`
    // path is a future refinement; the current async fixtures are all flat.)
    let body = build_template(element_entries, state);
    let wrapped = optimiser.render(state, body);
    for stmt in wrapped {
        state.template.push(TemplateEntry::Stmt(stmt));
    }
}

/// Emit the `<textarea>` / contenteditable CONTENT body — the Rust port of the
/// `body !== null` branch of upstream `RegularElement.js` (lines 178-198):
///
/// ```js
/// const $$body = <content>;          // only when content isn't an Identifier
/// if ($$body) {
///     $$renderer.push(`${$$body}`);  // the bound value as content
/// } else {
///     <inner children template>
/// }
/// ```
///
/// The whole `if` is pushed as one opaque [`TemplateEntry::Stmt`] so it breaks
/// the surrounding literal-coalescing run (the `<textarea>`/`>` opener and the
/// `</textarea>` closer stay outside it).
fn emit_content_body<'a>(
    node: &RegularElement<'a>,
    content: OxcExpression<'a>,
    namespace: &str,
    suppress_children: bool,
    state: &mut ServerTransformState<'a>,
) {
    use super::shared::build_template;

    // Build the inner-children template into a SEPARATE buffer (the `else`
    // branch body). Upstream uses a fresh `inner_state.template`. For
    // `<textarea>` the children are SUPPRESSED (the value is the content), so
    // the else branch is empty — matching the text oracle's `TextareaBody`.
    let else_body = if suppress_children {
        Vec::new()
    } else {
        let saved = std::mem::take(&mut state.template);
        process_children(&node.fragment.nodes, Some(node), namespace, state);
        let inner_entries = std::mem::replace(&mut state.template, saved);
        build_template(inner_entries, state)
    };

    // `id` is the truthiness test / push target. Upstream keeps a bare
    // Identifier as-is, but hoists any other expression into a
    // `const $$body[_N] = <content>;` so it isn't evaluated twice.
    let id: OxcExpression<'a> = if matches!(content, OxcExpression::Identifier(_)) {
        content
    } else {
        let var_name = if state.body_counter == 0 {
            "$$body".to_string()
        } else {
            format!("$$body_{}", state.body_counter)
        };
        state.body_counter += 1;
        state
            .template
            .push(TemplateEntry::Stmt(state.b.const_id(&var_name, content)));
        state.b.id(&var_name)
    };

    // consequent: `$$renderer.push(`${id}`);`
    let consequent = {
        let tmpl = state.b.template(vec!["", ""], vec![id_clone(state, &id)]);
        state.b.block(vec![
            state.b.stmt(state.b.call("$$renderer.push", vec![tmpl])),
        ])
    };

    let if_stmt = state
        .b
        .if_stmt(id, consequent, Some(state.b.block(else_body)));
    state.template.push(TemplateEntry::Stmt(if_stmt));
}

/// Re-spell an `id` expression (the `$$body` temp or a bare bound identifier)
/// for re-use as the `push` argument — `id` is moved into the `if` test, so the
/// consequent needs its own copy. For an Identifier we rebuild it by name; the
/// only callers pass an Identifier (the const-hoist path) or a bound-expression
/// identifier, so this is total in practice.
fn id_clone<'a>(state: &ServerTransformState<'a>, id: &OxcExpression<'a>) -> OxcExpression<'a> {
    match id {
        OxcExpression::Identifier(ident) => state.b.id(ident.name.as_str()),
        // Unreachable for the current callers (id is always an Identifier by the
        // time it reaches here); fall back to `undefined` to stay total.
        _ => state.b.id("undefined"),
    }
}

/// Compute the element CONTENT expression — upstream `build_element_attributes`'s
/// returned `content`. Scans the element's attributes for the content-producing
/// forms and returns the (already `$.escape`-wrapped where applicable) value:
///
/// - `<textarea value="…">` (static)        → `$.escape(<value>)`
/// - `<textarea bind:value={x}>`            → `$.escape(<x>)`
/// - `bind:innerHTML={x}` (contenteditable) → `<x>` (innerHTML is NOT escaped)
/// - `bind:innerText`/`bind:textContent`    → `$.escape(<x>)`
///
/// Returns `None` for every other element (the normal children path applies).
/// The get/set `{get, set}` sequence bind form is a KNOWN GAP (skipped).
fn build_element_content<'a>(
    node: &RegularElement,
    state: &mut ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    let is_textarea = node.name.as_str() == "textarea";
    let mut content: Option<OxcExpression<'a>> = None;

    for attr in &node.attributes {
        match attr {
            // Static `value="…"` on `<textarea>` → escaped content.
            //
            // KNOWN GAP: upstream prepends an extra `\n` when the first text part
            // begins with a newline (two leading newlines restore the one the
            // HTML parser would strip after `<textarea>`; spec § element
            // restrictions). That AST mutation isn't reproduced here — it only
            // affects the rare `<textarea value="\n…">` literal.
            Attribute::Attribute(a) if is_textarea && a.name.as_str() == "value" => {
                let value = build_attribute_value(&a.value, false, state);
                content = Some(state.b.call("$.escape", vec![value]));
            }
            Attribute::BindDirective(bind) => {
                let bind_name = bind.name.as_str();
                let is_textarea_value = bind_name == "value" && is_textarea;
                if !is_content_editable_binding(bind_name) && !is_textarea_value {
                    continue;
                }
                // The get/set `{get, set}` sequence form collapses to
                // `(getter)()` (upstream `b.call(expression.expressions[0])`).
                let expr = if bind_expr_is_sequence(bind) {
                    let seq = state.visit_expr(&bind.expression);
                    let getter = sequence_first(seq, state);
                    state.b.call(getter, vec![])
                } else {
                    state.visit_expr(&bind.expression)
                };
                content = Some(if bind_name == "innerHTML" {
                    // innerHTML is the only content bind we don't escape.
                    expr
                } else {
                    state.b.call("$.escape", vec![expr])
                });
            }
            _ => {}
        }
    }

    content
}

/// Whether the element carries a class signal the static/literal path cannot
/// own (a `class:` directive or a spread), so a fresh static `class="svelte-…"`
/// must NOT be injected (the dynamic path / a `$.attr_class` owns it). A *dynamic*
/// `class={x}` attribute is handled inline (it routes through `$.attr_class` with
/// the hash), so it does NOT count here.
fn has_class_directive_or_spread(node: &RegularElement) -> bool {
    node.attributes.iter().any(|attr| {
        matches!(
            attr,
            Attribute::ClassDirective(_) | Attribute::SpreadAttribute(_)
        )
    })
}

/// 写经 upstream `is_custom_element_node` (`phases/nodes.js`): a RegularElement is
/// a custom element if its name contains `-` OR it has a static `is` attribute
/// (`<button is="x-button">`). The shared string-only `is_custom_element_node`
/// helper only sees the name, so the `is=`-attribute case is checked here to set
/// the `ELEMENT_PRESERVE_ATTRIBUTE_CASE` flag on the spread `$.attributes(...)`.
fn is_custom_element(node: &RegularElement) -> bool {
    node.name.as_str().contains('-')
        || node
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name.as_str() == "is"))
}

/// Whether the element has a sibling text `type="<expected>"` attribute (used to
/// detect `<input type="file">` / `<input type="checkbox">`). Mirrors upstream's
/// `attr.value[0].data === '<expected>'` check on the static `type` attribute.
fn has_input_type(node: &RegularElement, expected: &str) -> bool {
    node.attributes.iter().any(|a| {
        let Attribute::Attribute(attr) = a else {
            return false;
        };
        attr.name.as_str() == "type" && attr_static_text(&attr.value).as_deref() == Some(expected)
    })
}

/// If an attribute value is a single static text part, return it (the
/// `is_text_attribute` + `value[0].data` shape upstream reads).
fn attr_static_text(value: &AttributeValue) -> Option<String> {
    if let AttributeValue::Sequence(parts) = value
        && parts.len() == 1
        && let AttributeValuePart::Text(t) = &parts[0]
    {
        return Some(t.data.to_string());
    }
    None
}

/// Find the sibling `value` plain-attribute node (for `bind:group`'s membership
/// test). Mirrors upstream's `node.attributes.find(attr.name === 'value')`.
fn find_value_attribute<'a>(node: &'a RegularElement<'a>) -> Option<&'a AttributeNode<'a>> {
    node.attributes.iter().find_map(|a| match a {
        Attribute::Attribute(attr) if attr.name.as_str() == "value" => Some(attr),
        _ => None,
    })
}

/// Server-omitted bindings (no corresponding SSR attribute). Mirrors the
/// `binding_properties[name].omit_in_ssr` table in
/// `phases/bindings.js` for the entries that can appear on a `RegularElement`.
fn bind_omit_in_ssr(name: &str) -> bool {
    matches!(
        name,
        // media (audio/video)
        "currentTime"
            | "duration"
            | "paused"
            | "buffered"
            | "seekable"
            | "played"
            | "volume"
            | "muted"
            | "playbackRate"
            | "seeking"
            | "ended"
            | "readyState"
            // video
            | "videoHeight"
            | "videoWidth"
            // img
            | "naturalWidth"
            | "naturalHeight"
            // dimensions (read-only)
            | "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "contentRect"
            | "contentBoxSize"
            | "borderBoxSize"
            | "devicePixelContentBoxSize"
            // checkbox/radio: indeterminate has no attribute
            | "indeterminate"
            // file list
            | "files"
    )
}

/// Whether `name` is a content-editable binding (`innerHTML` / `innerText` /
/// `textContent`). Upstream renders these as element CONTENT (escaped except
/// `innerHTML`); handled by `build_element_content` / `emit_content_body`.
fn is_content_editable_binding(name: &str) -> bool {
    matches!(name, "innerHTML" | "innerText" | "textContent")
}

/// Whether the parsed bind expression is a `SequenceExpression` (the
/// `bind:value={get, set}` / `bind:group={get, set}` get/set form). Upstream
/// calls the first expression (`b.call(expression.expressions[0])`) for the
/// server-rendered value.
fn bind_expr_is_sequence(bind: &BindDirective) -> bool {
    bind.expression.node_type() == Some("SequenceExpression")
}

/// Extract `expressions[0]` from a (read-wrapped) oxc `SequenceExpression` — the
/// getter half of a `bind:x={get, set}` directive. Mirrors upstream's
/// `expression.expressions[0]`. If `expr` is somehow not a sequence (shouldn't
/// happen given `bind_expr_is_sequence` gated the caller), the expression is
/// returned unchanged so the build stays correct-ish.
fn sequence_first<'a>(
    expr: OxcExpression<'a>,
    state: &ServerTransformState<'a>,
) -> OxcExpression<'a> {
    if let OxcExpression::SequenceExpression(seq) = expr {
        let mut seq = seq.unbox();
        if !seq.expressions.is_empty() {
            return seq.expressions.remove(0);
        }
        return state.b.id("undefined");
    }
    expr
}

/// Port of the `BindDirective` arm of `build_element_attributes`. Returns the
/// synthetic `(attribute_name, value_expression)` an element bind renders as an
/// SSR attribute, or `None` when the bind produces no attribute (skipped:
/// `bind:this`, server-omitted readback binds, the get/set sequence form, the
/// `<select>`/`<textarea>`/content-editable CONTENT binds — KNOWN GAP — and
/// `bind:group` without a sibling `value` attribute).
fn build_bind_directive<'a>(
    node: &RegularElement,
    bind: &BindDirective,
    state: &mut ServerTransformState<'a>,
) -> Option<(String, OxcExpression<'a>)> {
    let name = bind.name.as_str();

    // `bind:value` on `<select>` is omitted (the attribute has no effect on the
    // initially-selected value).
    if name == "value" && node.name.as_str() == "select" {
        return None;
    }
    // `bind:value` on a file input is omitted (file inputs can't be pre-filled).
    if name == "value" && has_input_type(node, "file") {
        return None;
    }
    // `bind:this` has no SSR output.
    if name == "this" {
        return None;
    }
    // Server-omitted readback bindings (dimensions, media, files, …).
    if bind_omit_in_ssr(name) {
        return None;
    }
    // Content-producing binds emit NO attribute — they render as element CONTENT
    // instead, handled separately by `build_element_content` /
    // `emit_content_body` in `visit_regular_element`. So return `None` here.
    //   - `bind:innerHTML` / `bind:innerText` / `bind:textContent` → content
    //   - `bind:value` on `<textarea>` → escaped content
    //
    // Note: this is checked BEFORE the sequence-form handling because upstream's
    // `build_element_attributes` first collapses the SequenceExpression to
    // `b.call(expressions[0])` and only THEN dispatches on the bind name — so the
    // get/set form of a content bind still routes to the content path.
    if is_content_editable_binding(name) || (name == "value" && node.name.as_str() == "textarea") {
        return None;
    }

    // The get/set `{get, set}` sequence form: collapse to `(getter)()` — upstream
    // `if (expression.type === 'SequenceExpression') expression = b.call(expressions[0])`.
    // This must happen before the general `bind:group` / attribute dispatch so that
    // e.g. `bind:value={() => v, (x) => …}` renders as `$.attr('value', (() => v)())`.
    if bind_expr_is_sequence(bind) {
        let attr_name = get_bind_attribute_name(node, name);
        let seq = state.visit_expr(&bind.expression);
        let getter = sequence_first(seq, state);
        let value = state.b.call(getter, vec![]);
        return Some((attr_name, value));
    }

    // `bind:group` (non-sequence) → a synthetic `checked` attribute whose value
    // is a membership test against the sibling `value` attribute.
    if name == "group" {
        let value_attr = find_value_attribute(node)?;
        let value_expr = build_attribute_value(&value_attr.value, false, state);
        let group_expr = state.visit_expr(&bind.expression);
        let checked = if has_input_type(node, "checkbox") {
            // `group.includes(value)`
            let callee = state.b.member(group_expr, "includes");
            state.b.call(callee, vec![value_expr])
        } else {
            // `group === value`
            state
                .b
                .binary(BinaryOperator::StrictEquality, group_expr, value_expr)
        };
        return Some(("checked".to_string(), checked));
    }

    // General case (`bind:value` on input, `bind:checked`, `bind:open`, …): the
    // bound expression renders as the attribute of the same name.
    let attr_name = get_bind_attribute_name(node, name);
    let value = state.visit_expr(&bind.expression);
    Some((attr_name, value))
}

/// Source text of a bind directive's bound expression (for the async optimiser
/// blocker / await predicate). `None` for the content-producing / select / file
/// / `this` / server-omitted binds that emit no SSR attribute — those are
/// filtered identically by [`build_bind_directive`] returning `None`.
fn bind_value_source(bind: &BindDirective, state: &ServerTransformState<'_>) -> Option<String> {
    state.expr_source(&bind.expression).map(|s| s.to_string())
}

/// Lowercase the bind name for non-svg/mathml elements (the `get_attribute_name`
/// rule, applied to a bind directive's name).
fn get_bind_attribute_name(element: &RegularElement, name: &str) -> String {
    if !element.metadata.svg && !element.metadata.mathml {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

/// Port of `build_element_attributes` (no-spread branch). Pushes one or more
/// [`TemplateEntry`] items onto `state.template` for the element's attributes.
///
/// `pub(super)` so the `<svelte:element>` visitor can reuse the exact attribute
/// machinery (static / dynamic / `class:` / `style:` / spread / css-scope-hash),
/// mirroring upstream `SvelteElement.js` calling the same `build_element_attributes`.
pub(super) fn build_element_attributes<'a>(
    node: &RegularElement,
    css_hash: Option<&str>,
    state: &mut ServerTransformState<'a>,
) {
    // When the element carries ANY spread attribute (`{...obj}`), upstream's
    // `build_element_attributes` abandons the per-attribute emission and instead
    // builds ONE `$.attributes({ ...merged }, css_hash, classes, styles, flags?)`
    // call covering the whole element. Mirror that here.
    if node
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::SpreadAttribute(_)))
    {
        build_element_spread_attributes(node, css_hash, state);
        return;
    }

    let has_class_dir_or_spread = has_class_directive_or_spread(node);

    // -- collect `class:` / `style:` directives -----------------------------
    //
    // Port of the `ClassDirective` / `StyleDirective` arms of upstream
    // `build_element_attributes`: directives are gathered up-front and fed to
    // `build_attr_class` (3rd arg) / `build_attr_style` (2nd arg) when the
    // matching `class` / `style` attribute is emitted. When the element has a
    // directive but no real `class` / `style` attribute, Phase 2 has already
    // synthesised an empty `class=""` / `style=""` attribute (see
    // `2_analyze/mod.rs` "We need an empty class/style"), so the per-attribute
    // loop below still encounters a `class` / `style` to attach them to.
    let class_directives: Vec<&crate::ast::template::ClassDirective> = node
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::ClassDirective(d) => Some(d),
            _ => None,
        })
        .collect();
    let style_directives: Vec<&crate::ast::template::StyleDirective> = node
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::StyleDirective(d) => Some(d),
            _ => None,
        })
        .collect();

    // Track whether ANY `class` attribute (static or dynamic) was emitted; the
    // fresh-scope-class injection only happens when there is none AND no class
    // directive/spread.
    let mut emitted_class = false;
    // Whether the fresh scope-class literal has already been emitted early (ahead
    // of a `style:`-directive `attr_style`). Upstream synthesizes the empty
    // `class=""` BEFORE the empty `style=""` (analyze index.js l.910 vs l.925), so
    // for a scoped element whose only style is a `style:` directive the scope
    // class must precede the `$.attr_style(...)`. rsvelte doesn't synthesize the
    // class attribute (the client RegularElement injects the hash), so emit it
    // here at the upstream position instead of trailing after `attr_style`.
    let mut scope_class_emitted_early = false;
    let has_style_directive = node
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::StyleDirective(_)));

    // `events_to_capture` (upstream `shared/element.js`): an `onload`/`onerror`
    // event handler on a load/error element (`<img>`, `<link>`, …) re-captures
    // that event so the client can replay one fired before hydration. Tracked in
    // `Set` insertion order (`onload` before `onerror`).
    let mut capture_onload = false;
    let mut capture_onerror = false;

    for attr in &node.attributes {
        // -- bind: directives ------------------------------------------------
        //
        // Port of the `BindDirective` arm of upstream `build_element_attributes`
        // (`shared/element.js`). Element binds mostly synthesize a regular
        // attribute (`value` / `checked` / `<prop>`) that renders through the
        // same `$.attr(...)` path. The `content`-producing binds (textarea
        // `value`, content-editable `innerHTML` / `innerText` / `textContent`)
        // require an element-content mechanism the AST pipeline does not have
        // yet, so they are a KNOWN GAP (skipped here).
        if let Attribute::BindDirective(bind) = attr {
            if let Some((bind_name, mut value)) = build_bind_directive(node, bind, state) {
                // 写经 `shared/element.js` line 124: the bind value is routed
                // through `transform(expression, attribute.metadata.expression)`,
                // which (a) records the value's top-level-await blockers on the
                // active optimiser so a blocked bind (`bind:checked={asyncDerived}`)
                // wraps the element in `$$renderer.async([$$promises[N]…], …)`, and
                // (b) hoists an inline-await value into a `$$N` const. Feed the bind
                // source through the same optimiser path the regular attributes use.
                if let Some(t) = bind_value_source(bind, state) {
                    value = state.optimise_attr_value(&t, value);
                }
                let is_bool = is_boolean_attribute(&bind_name);
                let call = state.b.call_opt(
                    "$.attr",
                    vec![
                        Some(state.b.string(&bind_name)),
                        Some(value),
                        if is_bool {
                            Some(state.b.bool(true))
                        } else {
                            None
                        },
                    ],
                );
                push_interp(state, call);
            }
            continue;
        }

        let Attribute::Attribute(a) = attr else {
            // `class:` / `style:` directives are consumed up-front into
            // `class_directives` / `style_directives` (fed to `build_attr_class`
            // / `build_attr_style` when the synthetic-or-real `class` / `style`
            // attribute is emitted). `@attach` remains a KNOWN GAP.
            //
            // A `use:` directive on a load/error element (`<img>` / `<track>` /
            // …) re-captures `onload`/`onerror`, mirroring upstream's
            // UseDirective arm in build_element_attributes (the spread path
            // below already does this; the non-spread path was missing it).
            if matches!(attr, Attribute::UseDirective(_))
                && is_load_error_element(node.name.as_str())
            {
                capture_onload = true;
                capture_onerror = true;
            }
            continue;
        };

        // `value` on `<select>` is omitted; on `<textarea>` it becomes content.
        // Both are special-element gaps not handled by this simple visitor — skip
        // `value` for select/textarea so we don't emit a wrong attribute.
        let raw_name = a.name.as_str();
        if raw_name == "value" && matches!(node.name.as_str(), "select" | "textarea") {
            continue;
        }
        // Event handlers (`on*` as Attribute form) + defaultValue/defaultChecked
        // are omitted by upstream as attributes. An `onload`/`onerror` handler on
        // a load/error element is recorded for the trailing capture literal.
        if is_event_attribute_name(raw_name)
            || raw_name == "defaultValue"
            || raw_name == "defaultChecked"
        {
            if (raw_name == "onload" || raw_name == "onerror")
                && is_load_error_element(node.name.as_str())
            {
                if raw_name == "onload" {
                    capture_onload = true;
                } else {
                    capture_onerror = true;
                }
            }
            continue;
        }

        let name = get_attribute_name(node, a);
        let is_class = name == "class";
        let is_style = name == "style";
        if is_class {
            emitted_class = true;
        }
        let trim_ws = WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str());

        // -- the literal fast-path (`value === true` or text attribute) ------
        // Mirrors upstream's `can_use_literal && (value === true || is_text)`.
        // `can_use_literal` is FALSE for `class` when a `class:` directive exists
        // (and for `style` when a `style:` directive exists), so the attribute
        // routes through `$.attr_class` / `$.attr_style` instead (the directives
        // object is the directive carrier). Mirrors upstream lines 222-224.
        let can_use_literal = (!is_class || class_directives.is_empty())
            && (!is_style || style_directives.is_empty());
        if can_use_literal {
            match &a.value {
                AttributeValue::True(_) => {
                    let mut literal_value = String::new();
                    if is_class && let Some(hash) = css_hash {
                        literal_value = format!(" {hash}").trim().to_string();
                    }
                    if !is_class || !literal_value.is_empty() {
                        state.template.push(TemplateEntry::Literal(format!(
                            " {name}=\"{literal_value}\""
                        )));
                    }
                    continue;
                }
                AttributeValue::Sequence(parts) => {
                    if let Some(text) = static_text_of(parts, trim_ws) {
                        // Pure-text attribute → literal.
                        let mut literal_value = text;
                        if is_class && let Some(hash) = css_hash {
                            literal_value = format!("{literal_value} {hash}").trim().to_string();
                        }
                        if !is_class || !literal_value.is_empty() {
                            state.template.push(TemplateEntry::Literal(format!(
                                " {name}=\"{}\"",
                                escape_attr(&literal_value)
                            )));
                        }
                        continue;
                    }
                    // A quoted SINGLE `{expr}` value (`title='{"foo"}'`) parses as
                    // a one-part Sequence whose sole part is an ExpressionTag. It
                    // is equivalent to the unquoted `title={"foo"}` single-Expression
                    // form (`build_attribute_value` `value.length === 1` returns the
                    // raw expression), so a string-literal expression inlines as a
                    // static attribute exactly like the `AttributeValue::Expression`
                    // branch below (`extract_literal_value` inlines string literals).
                    if parts.len() == 1
                        && let AttributeValuePart::ExpressionTag(tag) = &parts[0]
                        && let Some(s) = string_literal_of(&tag.expression)
                    {
                        let mut literal_value = s;
                        if is_class && let Some(hash) = css_hash {
                            literal_value = format!("{literal_value} {hash}").trim().to_string();
                        }
                        if !is_class || !literal_value.is_empty() {
                            state.template.push(TemplateEntry::Literal(format!(
                                " {name}=\"{}\"",
                                escape_attr(&literal_value)
                            )));
                        }
                        continue;
                    }
                    // Mixed text+expression where EVERY expression part folds to a
                    // known value (`scope.evaluate`): inline all parts and emit a
                    // static attribute (mirrors the oracle's all-inline branch in
                    // `build_attribute_value`, which returns a `Literal` when no
                    // expression survives, then inlines it at element.js line 257).
                    // For `class`/`style` (`trim_ws`) text chunks are whitespace-
                    // collapsed per-part; the css-hash join below applies the trim.
                    //
                    // 写经 upstream `build_attribute_value`: the `scope.evaluate`
                    // constant-fold path ONLY runs in the multi-element array
                    // branch (`value.length > 1`). A SINGLE `{expr}` value
                    // (`length === 1`) is returned as the raw expression and is
                    // NEVER folded to a literal — so `readonly="{false}"` keeps
                    // `$.attr('readonly', false, true)` (a boolean), and
                    // `value='{false}'` keeps `$.attr('value', false)`, rather than
                    // collapsing to the stringified `"false"`. Require >1 parts.
                    if parts.len() > 1
                        && let Some(folded) = fold_sequence_static(parts, trim_ws, state)
                    {
                        let mut literal_value = folded;
                        if is_class && let Some(hash) = css_hash {
                            literal_value = format!("{literal_value} {hash}").trim().to_string();
                        }
                        if !is_class || !literal_value.is_empty() {
                            state.template.push(TemplateEntry::Literal(format!(
                                " {name}=\"{}\"",
                                escape_attr(&literal_value)
                            )));
                        }
                        continue;
                    }
                    // Mixed text+expression: fall through to the dynamic value build.
                }
                AttributeValue::Expression(tag) => {
                    // A single STRING-LITERAL expression inlines as a static
                    // attribute (mirrors the oracle's `extract_literal_value`, which
                    // inlines string literals only — numeric / boolean literals keep
                    // `$.attr(...)`). Non-literal expressions fall through.
                    if let Some(s) = string_literal_of(&tag.expression) {
                        let mut literal_value = s;
                        if is_class && let Some(hash) = css_hash {
                            literal_value = format!("{literal_value} {hash}").trim().to_string();
                        }
                        if !is_class || !literal_value.is_empty() {
                            state.template.push(TemplateEntry::Literal(format!(
                                " {name}=\"{}\"",
                                escape_attr(&literal_value)
                            )));
                        }
                        continue;
                    }
                    // Other single expressions: fall through to dynamic value build.
                }
            }
        }

        // -- dynamic value build --------------------------------------------
        let mut value = build_attribute_value(&a.value, trim_ws, state);
        // Source text of the attribute value (for the async optimiser predicate).
        let value_text = attribute_value_source(&a.value, state);

        if is_class {
            // `class={complex}` is wrapped in `$.clsx(...)` so array/object class
            // forms flatten — mirrors upstream's `needs_clsx` branch in
            // `build_element_attributes` (the wrap is applied to the expression
            // BEFORE the value build, but it is a pure function call so wrapping
            // the built value is equivalent for the single-expression case).
            if a.metadata.needs_clsx {
                value = state.b.call("$.clsx", vec![value]);
            }
            // 写经 `optimiser.transform`: hoist an awaited class value into `$$N`
            // (the whole `$.clsx(save(arg))` becomes the const initializer).
            if let Some(t) = &value_text {
                value = state.optimise_attr_value(t, value);
            }
            // `$.attr_class(expr, css_hash?, directives?)`. directives = the
            // `class:` directive object (`{ 'name': value }`), 3rd arg.
            let call = build_attr_class(value, css_hash, &class_directives, state);
            push_interp(state, call);
        } else if is_style {
            // Emit the scope class BEFORE this style attribute's `attr_style` ONLY
            // when this is the SYNTHETIC empty `style=""` (`a.start == u32::MAX`),
            // i.e. the element has a `style:` directive but no real `style`
            // attribute. Upstream appends synth `class=""` then synth `style=""` at
            // the END of the attribute list, so the scope class precedes the
            // synthetic style. When a REAL `style` attribute exists no synthetic
            // style is created, so the scope class instead trails at the very end
            // (handled by the post-loop injection below).
            if let Some(hash) = css_hash
                && has_style_directive
                && a.start == u32::MAX
                && !emitted_class
                && !has_class_dir_or_spread
                && !scope_class_emitted_early
            {
                state
                    .template
                    .push(TemplateEntry::Literal(format!(" class=\"{hash}\"")));
                scope_class_emitted_early = true;
            }
            if let Some(t) = &value_text {
                value = state.optimise_attr_value(t, value);
            }
            // `$.attr_style(expr, directives?)`. directives = the `style:`
            // directive object/array, 2nd arg.
            let call = build_attr_style(value, &style_directives, state);
            push_interp(state, call);
        } else {
            if let Some(t) = &value_text {
                value = state.optimise_attr_value(t, value);
            }
            // `$.attr('name', value, is_boolean && true)`.
            let is_bool = is_boolean_attribute(&name);
            let call = state.b.call_opt(
                "$.attr",
                vec![
                    Some(state.b.string(&name)),
                    Some(value),
                    if is_bool {
                        Some(state.b.bool(true))
                    } else {
                        None
                    },
                ],
            );
            push_interp(state, call);
        }
    }

    // No `class` attribute and no class directive/spread → append the fresh
    // scope class at the end (mirrors the text oracle's trailing
    // `class="svelte-…"`). `hash` already carries the `svelte-…` prefix.
    if let Some(hash) = css_hash
        && !emitted_class
        && !has_class_dir_or_spread
        && !scope_class_emitted_early
    {
        state
            .template
            .push(TemplateEntry::Literal(format!(" class=\"{hash}\"")));
    }

    // `events_to_capture`: emit ` onload="this.__e=event"` / ` onerror="..."`
    // literals (in Set insertion order) after all attributes.
    if capture_onload {
        state.template.push(TemplateEntry::Literal(
            " onload=\"this.__e=event\"".to_string(),
        ));
    }
    if capture_onerror {
        state.template.push(TemplateEntry::Literal(
            " onerror=\"this.__e=event\"".to_string(),
        ));
    }
}

/// Port of the spread branch of `build_element_attributes`
/// (`shared/element.js`). When an element has any `SpreadAttribute`, ALL
/// attributes are merged into one object and rendered with a single
/// `$.attributes(object, css_hash, classes, styles, flags?)` call.
///
/// The object collects, in source order:
///   - static / dynamic plain attributes as `name: value` properties
///     (static text → string literal, dynamic `{x}` → the visited expression),
///   - each spread as `...spread`.
///
/// Args after the object mirror upstream `prepare_element_spread`:
///   - `css_hash` — the scope-class string when scoped (else dropped),
///   - `classes`  — a `{ name: value }` object built from `class:` directives,
///   - `styles`   — a `{ name: value }` object built from `style:` directives,
///   - `flags`    — the namespaced / preserve-case / input bitmask (when ≠ 0).
///
/// Trailing `undefined`/`None` arguments are dropped (upstream `b.call`
/// semantics via [`B::call_opt`]), so `$.attributes({ ...spread })` with no
/// scope / directives / flags collapses to the single-arg form.
///
/// KNOWN GAPs (skipped here, matching the non-spread path): `class:` / `style:`
/// directive VALUE expressions are emitted as bare identifiers (TODO: visit the
/// directive expression), `bind:` directives in the spread object, `use:` /
/// `@attach`, and the `onload`/`onerror` event capture for spread elements.
fn build_element_spread_attributes<'a>(
    node: &RegularElement,
    css_hash: Option<&str>,
    state: &mut ServerTransformState<'a>,
) {
    use crate::ast::template::{ClassDirective, StyleDirective};
    use crate::compiler::constants::{
        ELEMENT_IS_INPUT, ELEMENT_IS_NAMESPACED, ELEMENT_PRESERVE_ATTRIBUTE_CASE,
    };
    use oxc_ast::ast::ObjectPropertyKind;

    // -- the merged attribute object ----------------------------------------
    let mut props: Vec<ObjectPropertyKind<'a>> = Vec::new();
    let mut class_directives: Vec<&ClassDirective> = Vec::new();
    let mut style_directives: Vec<&StyleDirective> = Vec::new();
    // `events_to_capture` (upstream `shared/element.js`): a spread or `use:`
    // directive on a load/error element re-captures `onload`/`onerror` so the
    // client can replay events fired before hydration. Tracked as two flags in
    // insertion order (`onload` then `onerror`, matching the `Set`).
    let mut capture_onload = false;
    let mut capture_onerror = false;

    for attr in &node.attributes {
        match attr {
            Attribute::SpreadAttribute(spread) => {
                // 写经 `optimiser.transform`: an awaited spread (`{...await x}`) is
                // `$.save`-wrapped then hoisted into a `$$N` const, so the merged
                // object reads `{ ...$$N }`.
                let spread_text = state.expr_source(&spread.expression).map(|s| s.to_string());
                let mut expr = if let Some(t) = &spread_text
                    && super::shared::text_has_await(t)
                    && state.attr_optimiser.is_some()
                {
                    super::shared::save_wrap_expr_text(state, t)
                } else {
                    state.visit_expr(&spread.expression)
                };
                if let Some(t) = &spread_text {
                    expr = state.optimise_attr_value(t, expr);
                }
                props.push(state.b.spread(expr));
                if is_load_error_element(node.name.as_str()) {
                    capture_onload = true;
                    capture_onerror = true;
                }
            }
            Attribute::UseDirective(_) if is_load_error_element(node.name.as_str()) => {
                capture_onload = true;
                capture_onerror = true;
            }
            Attribute::Attribute(a) => {
                let raw_name = a.name.as_str();
                // `value` on `<select>`/`<textarea>` and event handlers /
                // default* are omitted by upstream — skip them here too.
                if raw_name == "value" && matches!(node.name.as_str(), "select" | "textarea") {
                    continue;
                }
                if is_event_attribute_name(raw_name)
                    || raw_name == "defaultValue"
                    || raw_name == "defaultChecked"
                {
                    continue;
                }
                let name = get_attribute_name(node, a);
                let trim_ws = WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str());
                let mut value = build_attribute_value(&a.value, trim_ws, state);
                let value_text = attribute_value_source(&a.value, state);
                // 写经 upstream `build_element_attributes` `class` arm: a
                // `class={...}` marked `needs_clsx` is wrapped in `$.clsx(...)` so
                // the runtime flattens array / object class forms before the merge.
                if name == "class" && a.metadata.needs_clsx {
                    value = state.b.call("$.clsx", vec![value]);
                }
                // 写经 `optimiser.transform`: hoist an awaited prop value into `$$N`.
                if let Some(t) = &value_text {
                    value = state.optimise_attr_value(t, value);
                }
                props.push(state.b.init(&name, value));
            }
            Attribute::BindDirective(bind) => {
                // 写经 upstream `build_element_attributes` BindDirective arm: the
                // converted synthetic attribute (`bind:value` → `value`,
                // `bind:group` → `checked` membership test) is fed into the merged
                // spread object. Reuse [`build_bind_directive`] so the spread path
                // matches the non-spread path (skipped binds yield `None`).
                if let Some((name, value)) = build_bind_directive(node, bind, state) {
                    props.push(state.b.init(&name, value));
                }
            }
            Attribute::ClassDirective(dir) => class_directives.push(dir),
            Attribute::StyleDirective(dir) => style_directives.push(dir),
            // `use:` / `@attach`: KNOWN GAP in the spread path.
            _ => {}
        }
    }

    let object = state.b.object(props);

    // -- css_hash (2nd arg) -------------------------------------------------
    let css_hash_arg = css_hash.map(|h| state.b.string(h));

    // -- class: directives object (3rd arg) ---------------------------------
    // `{ name: <visited value> }` — `class:foo={on}` → `{ foo: on }`.
    let classes_arg = if class_directives.is_empty() {
        None
    } else {
        let members = class_directives
            .iter()
            .map(|dir| {
                let val = state.visit_expr(&dir.expression);
                state.b.init(dir.name.as_str(), val)
            })
            .collect();
        Some(state.b.object(members))
    };

    // -- style: directives object (4th arg) ---------------------------------
    // `{ name: <value> }` — `style:color={c}` → `{ color: c }`. A bare `style:x`
    // (no value) uses the shorthand identifier; otherwise the value expression /
    // template is built like any attribute value. The name is lowercased unless
    // it is a custom property (`--var`). KNOWN GAP: the `|important` modifier
    // `[normal, important]` array split is not applied here.
    let styles_arg = if style_directives.is_empty() {
        None
    } else {
        let members = style_directives
            .iter()
            .map(|dir| {
                let mut sname = dir.name.to_string();
                if !sname.starts_with("--") {
                    sname = sname.to_lowercase();
                }
                let val = if matches!(dir.value, AttributeValue::True(_)) {
                    state.b.id(dir.name.as_str())
                } else {
                    build_attribute_value(&dir.value, true, state)
                };
                state.b.init(&sname, val)
            })
            .collect();
        Some(state.b.object(members))
    };

    // -- flags (5th arg) ----------------------------------------------------
    let mut flags = 0;
    if node.metadata.svg || node.metadata.mathml {
        flags |= ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if is_custom_element(node) {
        flags |= ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if node.name.as_str() == "input" {
        flags |= ELEMENT_IS_INPUT;
    }
    let flags_arg = if flags != 0 {
        Some(state.b.number(flags as f64))
    } else {
        None
    };

    // `$.attributes(object, css_hash?, classes?, styles?, flags?)`. `call_opt`
    // drops trailing `None`s and replaces interior `None`s with `void 0`.
    let call = state.b.call_opt(
        "$.attributes",
        vec![
            Some(object),
            css_hash_arg,
            classes_arg,
            styles_arg,
            flags_arg,
        ],
    );
    push_interp(state, call);

    // `events_to_capture`: emit ` onload="this.__e=event"` / ` onerror="..."`
    // literals (in Set insertion order) after the `$.attributes(...)` call.
    if capture_onload {
        state.template.push(TemplateEntry::Literal(
            " onload=\"this.__e=event\"".to_string(),
        ));
    }
    if capture_onerror {
        state.template.push(TemplateEntry::Literal(
            " onerror=\"this.__e=event\"".to_string(),
        ));
    }
}

/// Whether `<select>` needs the special `$$renderer.select(...)` wrapper — it has
/// a `value` plain-attribute, a `value` bind, OR any spread attribute. Mirrors
/// upstream `RegularElement.js` `is_select_special` (lines 44-51).
fn is_select_special(node: &RegularElement) -> bool {
    node.name.as_str() == "select"
        && node.attributes.iter().any(|attr| match attr {
            Attribute::Attribute(a) => a.name.as_str() == "value",
            Attribute::BindDirective(b) => b.name.as_str() == "value",
            Attribute::SpreadAttribute(_) => true,
            _ => false,
        })
}

/// Whether a `<select>` body has "rich content" → the SPECIAL
/// `$$renderer.select(...)` wrapper's trailing `true` flag. Faithful port of the
/// oracle's `element.rs::has_component_or_render_tag`: a Component /
/// SvelteComponent / RenderTag / HtmlTag, recursing into IfBlock (both branches),
/// EachBlock body, KeyBlock, SvelteBoundary — but NOT AwaitBlock, NOT EachBlock
/// fallback, and NOT counting a RegularElement.
///
/// NOTE: this is INTENTIONALLY narrower than upstream's
/// `is_customizable_select_element` (which also counts a non-option/optgroup
/// RegularElement / text child) — we mirror the `transform_server` oracle
/// byte-for-byte, which the corpus harness compares against.
fn select_special_is_rich(nodes: &[TemplateNode]) -> bool {
    is_customizable_select(nodes)
}

/// Faithful port of upstream `nodes.js::is_customizable_select_element` for a
/// `<select>` owner, combined with its `find_descendants` walk. A `<select>` is
/// "rich" (needs the trailing `is_rich = true` flag on `$$renderer.select`) when
/// any descendant — skipping snippet/debug/const/declaration/comment/expression
/// tags, and recursing into if/each/key/await/boundary branches but NOT into
/// element children — is:
///   - a `RegularElement` whose name is not `option`/`optgroup`, or
///   - a non-whitespace `Text` node, or
///   - any other node kind (slot, component, `<svelte:element>`, `{@html}`,
///     `{@render}`, …).
fn is_customizable_select(nodes: &[TemplateNode]) -> bool {
    for node in nodes {
        match node {
            // `find_descendants` does not yield these (so they never make a
            // select rich): see upstream `nodes.js`.
            TemplateNode::SnippetBlock(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ExpressionTag(_) => {}
            // Text is rich only when it has non-whitespace content.
            TemplateNode::Text(t) if !t.data.trim().is_empty() => return true,
            TemplateNode::Text(_) => {}
            // Block branches are recursed into (their contents are descendants).
            TemplateNode::IfBlock(b)
                if is_customizable_select(&b.consequent.nodes)
                    || b.alternate
                        .as_ref()
                        .is_some_and(|a| is_customizable_select(&a.nodes)) =>
            {
                return true;
            }
            TemplateNode::IfBlock(_) => {}
            TemplateNode::EachBlock(b)
                if is_customizable_select(&b.body.nodes)
                    || b.fallback
                        .as_ref()
                        .is_some_and(|f| is_customizable_select(&f.nodes)) =>
            {
                return true;
            }
            TemplateNode::EachBlock(_) => {}
            TemplateNode::KeyBlock(b) if is_customizable_select(&b.fragment.nodes) => return true,
            TemplateNode::KeyBlock(_) => {}
            TemplateNode::AwaitBlock(b)
                if [&b.pending, &b.then, &b.catch]
                    .into_iter()
                    .flatten()
                    .any(|f| is_customizable_select(&f.nodes)) =>
            {
                return true;
            }
            TemplateNode::AwaitBlock(_) => {}
            TemplateNode::SvelteBoundary(b) if is_customizable_select(&b.fragment.nodes) => {
                return true;
            }
            TemplateNode::SvelteBoundary(_) => {}
            // A bare `<option>` / `<optgroup>` is NOT rich, and its children are
            // not descendants of the select for this check.
            TemplateNode::RegularElement(el)
                if el.name.as_str() == "option" || el.name.as_str() == "optgroup" => {}
            // Every other node — a non-option/optgroup element, slot, component,
            // `<svelte:element>`, `{@html}`, `{@render}`, … — makes it rich.
            _ => return true,
        }
    }
    false
}

/// Whether an `<option>` body has "rich content" → the `$$renderer.option(...)`
/// wrapper's trailing `true` flag. Faithful port of the oracle's
/// `select_element.rs::is_rich_option_content`: ALSO counts a RegularElement, and
/// recurses into AwaitBlock (pending/then/catch) in addition to IfBlock / EachBlock
/// body / KeyBlock / SvelteBoundary.
fn option_is_rich(nodes: &[TemplateNode]) -> bool {
    select_body_is_rich(nodes, true, true)
}

/// Shared rich-content scan for the select / option wrappers (see the two
/// callers for the oracle predicates each mirrors). `count_regular_element`
/// makes a bare `RegularElement` rich (option only); `recurse_await` recurses
/// into AwaitBlock branches (option only).
fn select_body_is_rich(
    nodes: &[TemplateNode],
    count_regular_element: bool,
    recurse_await: bool,
) -> bool {
    let recurse =
        |ns: &[TemplateNode]| select_body_is_rich(ns, count_regular_element, recurse_await);
    for node in nodes {
        match node {
            TemplateNode::Component(_)
            | TemplateNode::SvelteComponent(_)
            | TemplateNode::RenderTag(_)
            | TemplateNode::HtmlTag(_) => return true,
            TemplateNode::RegularElement(_) if count_regular_element => return true,
            TemplateNode::IfBlock(block)
                if recurse(&block.consequent.nodes)
                    || block.alternate.as_ref().is_some_and(|a| recurse(&a.nodes)) =>
            {
                return true;
            }
            TemplateNode::EachBlock(block) if recurse(&block.body.nodes) => return true,
            TemplateNode::KeyBlock(block) if recurse(&block.fragment.nodes) => return true,
            TemplateNode::SvelteBoundary(boundary) if recurse(&boundary.fragment.nodes) => {
                return true;
            }
            TemplateNode::AwaitBlock(block)
                if recurse_await
                    && [&block.pending, &block.then, &block.catch]
                        .into_iter()
                        .flatten()
                        .any(|frag| recurse(&frag.nodes)) =>
            {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Whether this `<select>`/`<optgroup>`/`<option>` has "rich content" so the
/// renderer must emit a hydration anchor. Rust port of upstream
/// `nodes.js::is_customizable_select_element` (recurses into control-flow blocks
/// via [`select_find_descendants`]). Used ONLY for the non-special-path trailing
/// `<!>` marker (matching the oracle's `element.rs` use site).
fn is_customizable_select_element(node: &RegularElement) -> bool {
    let element_name = node.name.as_str();
    if !matches!(element_name, "select" | "optgroup" | "option") {
        return false;
    }
    let mut found = false;
    select_find_descendants(&node.fragment.nodes, &mut |d| {
        match d {
            SelectDescendant::RegularElement(child_name) => {
                if element_name == "select" && child_name != "option" && child_name != "optgroup" {
                    found = true;
                }
                if element_name == "optgroup" && child_name != "option" {
                    found = true;
                }
                if element_name == "option" {
                    found = true;
                }
            }
            SelectDescendant::Text => {
                if element_name == "select" || element_name == "optgroup" {
                    found = true;
                }
            }
            SelectDescendant::Other => found = true,
        }
        found
    });
    found
}

/// A descendant kind yielded by [`select_find_descendants`].
enum SelectDescendant<'n> {
    RegularElement(&'n str),
    Text,
    Other,
}

/// Walk `nodes` (recursing into if/each/key/boundary bodies, skipping
/// snippet/const/comment/expression nodes), invoking `f` for each descendant.
/// `f` returns `true` to short-circuit. Mirrors upstream `nodes.js::find_descendants`.
fn select_find_descendants<'n>(
    nodes: &'n [TemplateNode],
    f: &mut impl FnMut(SelectDescendant<'n>) -> bool,
) -> bool {
    for node in nodes {
        match node {
            TemplateNode::SnippetBlock(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ExpressionTag(_) => {}
            TemplateNode::Text(t) => {
                if !t.data.trim().is_empty() && f(SelectDescendant::Text) {
                    return true;
                }
            }
            TemplateNode::IfBlock(block) => {
                if select_find_descendants(&block.consequent.nodes, f) {
                    return true;
                }
                if let Some(alt) = &block.alternate
                    && select_find_descendants(&alt.nodes, f)
                {
                    return true;
                }
            }
            TemplateNode::EachBlock(block) => {
                if select_find_descendants(&block.body.nodes, f) {
                    return true;
                }
                if let Some(fallback) = &block.fallback
                    && select_find_descendants(&fallback.nodes, f)
                {
                    return true;
                }
            }
            TemplateNode::KeyBlock(block) => {
                if select_find_descendants(&block.fragment.nodes, f) {
                    return true;
                }
            }
            TemplateNode::SvelteBoundary(boundary) => {
                if select_find_descendants(&boundary.fragment.nodes, f) {
                    return true;
                }
            }
            TemplateNode::RegularElement(elem) => {
                if f(SelectDescendant::RegularElement(elem.name.as_str())) {
                    return true;
                }
            }
            _ => {
                if f(SelectDescendant::Other) {
                    return true;
                }
            }
        }
    }
    false
}

/// Render the element's children into a SEPARATE template buffer, returning the
/// coalesced body statements. Used by the select/option wrappers to build the
/// `($$renderer) => { <children> }` callback body. Mirrors upstream's
/// `inner_state = { ...state, template: [], init: [] }; process_children(...);
/// build_template(inner_state.template)`.
fn render_children_body<'a>(
    node: &RegularElement<'a>,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    use super::shared::build_template;
    let namespace = if node.metadata.svg {
        "svg"
    } else if node.metadata.mathml {
        "mathml"
    } else {
        "html"
    };
    let saved = std::mem::take(&mut state.template);
    process_children(&node.fragment.nodes, Some(node), namespace, state);
    let inner = std::mem::replace(&mut state.template, saved);
    build_template(inner, state)
}

/// Port of upstream `prepare_element_spread_object` — return the args for the
/// `$$renderer.select(...)` / `$$renderer.option(...)` wrapper (and for
/// `$.attributes(...)`): `[object, css_hash?, classes?, styles?, flags?]`. Every
/// `Attribute` / `BindDirective` / `SpreadAttribute` folds into ONE object
/// (`build_spread_object`); `class:` / `style:` directives + the namespaced /
/// input flags become the trailing args. Trailing `None`s are pruned by the
/// caller via `call_opt`.
fn prepare_element_spread_object<'a>(
    node: &RegularElement,
    css_hash: Option<&str>,
    state: &mut ServerTransformState<'a>,
) -> Vec<Option<OxcExpression<'a>>> {
    use crate::ast::template::{ClassDirective, StyleDirective};
    use crate::compiler::constants::{
        ELEMENT_IS_INPUT, ELEMENT_IS_NAMESPACED, ELEMENT_PRESERVE_ATTRIBUTE_CASE,
    };
    use oxc_ast::ast::ObjectPropertyKind;

    // -- the merged attribute object (`build_spread_object`) ----------------
    let mut props: Vec<ObjectPropertyKind<'a>> = Vec::new();
    let mut class_directives: Vec<&ClassDirective> = Vec::new();
    let mut style_directives: Vec<&StyleDirective> = Vec::new();
    // Track the upstream empty-class/style synthesis inputs (analyze index.js
    // l.895-937): a scoped element (or one with a class directive) that has no
    // real class attribute and no spread needs a synthesized `class=""` so the
    // scope hash has somewhere to attach — here that surfaces as `{ class: "" }`
    // in the `$$renderer.option`/`.select` attributes object.
    let mut has_spread = false;
    let mut has_class = false;
    let mut has_style = false;

    for attr in &node.attributes {
        match attr {
            Attribute::SpreadAttribute(spread) => {
                has_spread = true;
                let expr = state.visit_expr(&spread.expression);
                props.push(state.b.spread(expr));
            }
            Attribute::Attribute(a) => {
                let name = get_attribute_name(node, a);
                if name.eq_ignore_ascii_case("class") {
                    has_class = true;
                } else if name.eq_ignore_ascii_case("style") {
                    has_style = true;
                }
                let trim_ws = WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str());
                let value = build_attribute_value(&a.value, trim_ws, state);
                // NOTE: unlike `build_element_attributes` / the generic-element
                // spread path, upstream's `build_spread_object` (the <option> /
                // <select> special path, shared/element.js l.305-338) does NOT
                // apply the `needs_clsx` `$.clsx(...)` wrap on the class attribute —
                // the value is emitted verbatim (`class: cn(...)`).
                props.push(state.b.init(&name, value));
            }
            Attribute::BindDirective(bind) => {
                // 写经 upstream `build_spread_object` BindDirective arm (the
                // `<select>`/`<option>`-special path): the bound expression is
                // emitted directly under its `get_attribute_name`, with NO
                // `bind:value`-on-select skip and NO `bind:group` → `checked`
                // transform (those are specific to `build_element_attributes`, the
                // generic-element spread path). A `{get, set}` sequence would call
                // `get()` — KNOWN GAP: the whole expression is used as-is.
                let name = get_bind_attribute_name(node, bind.name.as_str());
                let value = state.visit_expr(&bind.expression);
                props.push(state.b.init(&name, value));
            }
            Attribute::ClassDirective(dir) => class_directives.push(dir),
            Attribute::StyleDirective(dir) => style_directives.push(dir),
            _ => {}
        }
    }

    // 写经 analyze index.js l.909-937: synthesize the empty `class=""` (then
    // `style=""`) so a scoped element with no real class/style attribute still
    // emits `{ class: "" }` in the merged object. rsvelte's Phase 2 omits this
    // synthesis (the client RegularElement injects the hash directly), so do it
    // here for the SSR option/select spread object.
    if !has_spread && !has_class && (node.metadata.scoped || !class_directives.is_empty()) {
        props.push(state.b.init("class", state.b.string("")));
    }
    if !has_spread && !has_style && !style_directives.is_empty() {
        props.push(state.b.init("style", state.b.string("")));
    }

    let object = state.b.object(props);

    // -- css_hash -----------------------------------------------------------
    let css_hash_arg = css_hash.map(|h| state.b.string(h));

    // -- class: directives object -------------------------------------------
    let classes_arg = if class_directives.is_empty() {
        None
    } else {
        let members = class_directives
            .iter()
            .map(|dir| {
                let val = state.visit_expr(&dir.expression);
                state.b.init(dir.name.as_str(), val)
            })
            .collect();
        Some(state.b.object(members))
    };

    // -- style: directives object -------------------------------------------
    let styles_arg = if style_directives.is_empty() {
        None
    } else {
        let members = style_directives
            .iter()
            .map(|dir| {
                let mut sname = dir.name.to_string();
                if !sname.starts_with("--") {
                    sname = sname.to_lowercase();
                }
                let val = if matches!(dir.value, AttributeValue::True(_)) {
                    state.b.id(dir.name.as_str())
                } else {
                    build_attribute_value(&dir.value, true, state)
                };
                state.b.init(&sname, val)
            })
            .collect();
        Some(state.b.object(members))
    };

    // -- flags --------------------------------------------------------------
    let mut flags = 0;
    if node.metadata.svg || node.metadata.mathml {
        flags |= ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if is_custom_element(node) {
        flags |= ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if node.name.as_str() == "input" {
        flags |= ELEMENT_IS_INPUT;
    }
    let flags_arg = if flags != 0 {
        Some(state.b.number(flags as f64))
    } else {
        None
    };

    vec![
        Some(object),
        css_hash_arg,
        classes_arg,
        styles_arg,
        flags_arg,
    ]
}

/// Emit `$$renderer.select(<attrs obj>, ($$renderer) => { <children> }, ...rest)`.
/// Rust port of the `is_select_special` branch of upstream `RegularElement.js`
/// (lines 109-128). The `...rest` is `[css_hash?, classes?, styles?, flags?]`
/// (trailing `None`s pruned) with an extra `true` appended when the select has
/// rich content (`is_customizable_select_element`).
fn emit_select_special<'a>(node: &RegularElement<'a>, state: &mut ServerTransformState<'a>) {
    let css_hash: Option<String> = if node.metadata.scoped && !state.analysis.css.hash.is_empty() {
        Some(state.analysis.css.hash.to_string())
    } else {
        None
    };

    // The `($$renderer) => { <children> }` callback.
    let body = render_children_body(node, state);
    let params = state.b.params(vec![state.b.id_pat("$$renderer")], None);
    let fn_body = state.b.body(body);
    let arrow = state.b.arrow(params, fn_body, false, false);

    let mut args = prepare_element_spread_object(node, css_hash.as_deref(), state);
    // Object is the 1st arg; insert the callback as the 2nd (after the object).
    let object = args.remove(0);
    let mut call_args: Vec<Option<OxcExpression<'a>>> = vec![object, Some(arrow)];
    call_args.extend(args);
    // Rich-content selects append `true` (customizable flag). It comes AFTER the
    // css_hash / classes / styles / flags slots, so any of those that are `None`
    // print as interior `void 0` (call_opt only prunes TRAILING `None`s) —
    // matching the oracle's `select_rest_args` output exactly.
    if select_special_is_rich(&node.fragment.nodes) {
        call_args.push(Some(state.b.bool(true)));
    }

    let call = state.b.call_opt("$$renderer.select", call_args);
    state.template.push(TemplateEntry::Stmt(state.b.stmt(call)));
}

/// Emit `$$renderer.option(<attrs obj>, <body>, ...rest)`. Rust port of the
/// `is_option_special` branch of upstream `RegularElement.js` (lines 131-175).
/// `body` is the synthetic value expression directly (when the option has a
/// `synthetic_value_node`), else a `($$renderer) => { <children> }` callback.
fn emit_option_special<'a>(node: &RegularElement<'a>, state: &mut ServerTransformState<'a>) {
    let css_hash: Option<String> = if node.metadata.scoped && !state.analysis.css.hash.is_empty() {
        Some(state.analysis.css.hash.to_string())
    } else {
        None
    };

    let body = if let Some(synthetic) = &node.metadata.synthetic_value_node {
        // Direct value (the option's lone expression child becomes its `value`).
        state.visit_expr(&synthetic.expression)
    } else {
        let stmts = render_children_body(node, state);
        let params = state.b.params(vec![state.b.id_pat("$$renderer")], None);
        let fn_body = state.b.body(stmts);
        state.b.arrow(params, fn_body, false, false)
    };

    let mut args = prepare_element_spread_object(node, css_hash.as_deref(), state);
    let object = args.remove(0);
    let mut call_args: Vec<Option<OxcExpression<'a>>> = vec![object, Some(body)];
    call_args.extend(args);
    // Rich-content options append `true` after the css_hash / classes / styles /
    // flags slots (interior `None`s → `void 0`); see `emit_select_special`.
    if option_is_rich(&node.fragment.nodes) {
        call_args.push(Some(state.b.bool(true)));
    }

    let call = state.b.call_opt("$$renderer.option", call_args);
    state.template.push(TemplateEntry::Stmt(state.b.stmt(call)));
}

/// Push a `${call}` interpolation: a single-expression [`TemplateEntry::Template`]
/// (`quasis = ["", ""]`, one expr). `build_template` folds it into the
/// surrounding `$$renderer.push(`…`)` template literal.
fn push_interp<'a>(state: &mut ServerTransformState<'a>, call: OxcExpression<'a>) {
    state.template.push(TemplateEntry::Template {
        quasis: vec![String::new(), String::new()],
        exprs: vec![call],
    });
}

/// `build_attr_class(expression, css_hash, directives)` — the server form.
/// Faithful port of `shared/element.js::build_attr_class`:
///   - `directives` (3rd arg) = `{ 'name': value }` object from the `class:`
///     directives (QUOTED keys, via `b.literal(directive.name)` upstream);
///     elided (dropped as trailing `None`) when there are none,
///   - hash folding: when `hash` is set AND `expression` is a STRING LITERAL,
///     the hash is appended into the literal (`'value hash'.trim()`) and the
///     2nd `css_hash` arg is left `void 0`; otherwise the hash is passed as the
///     2nd arg `b.literal(hash)`.
fn build_attr_class<'a>(
    expression: OxcExpression<'a>,
    css_hash: Option<&str>,
    class_directives: &[&crate::ast::template::ClassDirective],
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    // -- directives object (3rd arg) ----------------------------------------
    let directives_arg = if class_directives.is_empty() {
        None
    } else {
        let members = class_directives
            .iter()
            .map(|dir| {
                let val = state.visit_expr(&dir.expression);
                // QUOTED key (`b.literal(directive.name)`) → string-literal key.
                state.b.prop(
                    oxc_ast::ast::PropertyKind::Init,
                    oxc_ast::ast::PropertyKey::from(state.b.string(dir.name.as_str())),
                    val,
                    false,
                    false,
                    false,
                )
            })
            .collect();
        Some(state.b.object(members))
    };

    // -- hash folding (1st arg) / css_hash (2nd arg) ------------------------
    let (value_arg, css_hash_arg) = match (css_hash, &expression) {
        (Some(hash), OxcExpression::StringLiteral(lit)) => {
            // Fold the hash into the literal; leave css_hash undefined.
            let folded = format!("{} {hash}", lit.value.as_str()).trim().to_string();
            (state.b.string(&folded), None)
        }
        (Some(hash), _) => (expression, Some(state.b.string(hash))),
        (None, _) => (expression, None),
    };

    // `$.attr_class(value, css_hash?, directives?)`. `call_opt` drops trailing
    // `None`s and prints interior `None`s as `void 0`.
    state.b.call_opt(
        "$.attr_class",
        vec![Some(value_arg), css_hash_arg, directives_arg],
    )
}

/// `build_attr_style(expression, directives)` — the server form. Faithful port
/// of `shared/element.js::build_attr_style`. The `directives` (2nd arg) is built
/// from the `style:` directives:
///   - each becomes `name: value` (UNQUOTED key via `b.init`; name lowercased
///     unless it is a custom property `--…`; bare `style:x` uses the shorthand
///     identifier `x`),
///   - directives WITHOUT the `|important` modifier go in a `normal` object;
///     those WITH it go in an `important` object,
///   - when ANY important directive exists, the arg is the two-element array
///     `[normalObject, importantObject]`; otherwise just the normal object,
///   - elided (dropped as trailing `None`) when there are no directives.
fn build_attr_style<'a>(
    expression: OxcExpression<'a>,
    style_directives: &[&crate::ast::template::StyleDirective],
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    let directives_arg = if style_directives.is_empty() {
        None
    } else {
        let mut normal: Vec<oxc_ast::ast::ObjectPropertyKind<'a>> = Vec::new();
        let mut important: Vec<oxc_ast::ast::ObjectPropertyKind<'a>> = Vec::new();
        for dir in style_directives {
            let val = if matches!(dir.value, AttributeValue::True(_)) {
                state.b.id(dir.name.as_str())
            } else {
                build_attribute_value(&dir.value, true, state)
            };
            let mut sname = dir.name.to_string();
            if !sname.starts_with("--") {
                sname = sname.to_lowercase();
            }
            let prop = state.b.init(&sname, val);
            if style_directive_is_important(dir) {
                important.push(prop);
            } else {
                normal.push(prop);
            }
        }
        if important.is_empty() {
            Some(state.b.object(normal))
        } else {
            Some(state.b.array(vec![
                Some(state.b.object(normal)),
                Some(state.b.object(important)),
            ]))
        }
    };

    // `$.attr_style(value, directives?)`. `call_opt` drops the trailing `None`.
    state
        .b
        .call_opt("$.attr_style", vec![Some(expression), directives_arg])
}

/// Whether a `style:` directive carries the `|important` modifier.
fn style_directive_is_important(dir: &crate::ast::template::StyleDirective) -> bool {
    dir.modifiers.iter().any(|m| m.as_str() == "important")
}

/// Port of `build_attribute_value` for a NON-text-fast-path value (single
/// expression or mixed sequence). Returns the runtime value expression:
///   - single expression → `transform(visit(expr))` (= `state.visit_expr`),
///   - mixed sequence → a template literal `` `text${$.stringify(expr)}text` ``.
///
/// 写经 of upstream's `scope.evaluate` constant-folding (utils.js lines 232-260):
/// each interpolated `ExpressionTag` is evaluated; when the value is statically
/// known it is folded into the surrounding quasi (a known-nullish value renders
/// as nothing — this is where `attr ?? ""` / `1 ?? 'stuff'` omittance happens),
/// otherwise the expression is emitted. A live expression is wrapped in
/// `$.stringify(...)` unless it is provably a defined string (`is_string &&
/// is_defined`). When every part folds away, the result collapses to a plain
/// string literal (upstream's `expressions.length > 0 ? template : literal`).
fn build_attribute_value<'a>(
    value: &AttributeValue,
    trim_ws: bool,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    match value {
        AttributeValue::True(_) => state.b.bool(true),
        AttributeValue::Expression(tag) => attr_expr_value(&tag.expression, state),
        AttributeValue::Sequence(parts) => {
            // Single-element sequence collapses to its lone part (upstream's
            // `value.length === 1` branch).
            if parts.len() == 1 {
                return match &parts[0] {
                    AttributeValuePart::Text(t) => {
                        let data = if trim_ws {
                            collapse_ws(t.data.as_str())
                        } else {
                            t.data.to_string()
                        };
                        state.b.string(&escape_attr(&data))
                    }
                    AttributeValuePart::ExpressionTag(tag) => {
                        attr_expr_value(&tag.expression, state)
                    }
                };
            }

            // Mixed run → template literal, with `scope.evaluate` folding.
            use crate::compiler::phases::phase3_transform::server::evaluate::{
                EvalValue, js_display_string,
            };
            let mut quasis: Vec<String> = vec![String::new()];
            let mut exprs: Vec<OxcExpression<'a>> = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        let data = if trim_ws {
                            collapse_ws_no_trim(t.data.as_str())
                        } else {
                            t.data.to_string()
                        };
                        quasis.last_mut().unwrap().push_str(&data);
                    }
                    AttributeValuePart::ExpressionTag(tag) => {
                        // Constant-fold known values into the quasi (a known-nullish
                        // value contributes nothing — `attr ?? ""` omittance).
                        let evaluation = state
                            .eval_ctx()
                            .evaluate_template_expression(&tag.expression);
                        if let Some(value) = evaluation.known_value() {
                            if !matches!(value, EvalValue::Null | EvalValue::Undefined) {
                                let content = js_display_string(value);
                                quasis.last_mut().unwrap().push_str(&content);
                            }
                            continue;
                        }
                        // Live expression: wrap in `$.stringify` unless it is
                        // provably a defined string (`is_string && is_defined`).
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
            // Everything folded away → collapse to a plain string literal
            // (upstream's `expressions.length > 0 ? template : literal`).
            if exprs.is_empty() {
                return state.b.string(&quasis[0]);
            }
            let quasi_refs: Vec<&str> = quasis.iter().map(|s| s.as_str()).collect();
            state.b.template(quasi_refs, exprs)
        }
    }
}

/// Source text of an attribute value — `Some` only for a single-expression
/// value (`name={expr}` / single-element sequence), used as the async optimiser
/// await/blocker predicate. Multi-part / static values return `None` (no await
/// to hoist in the single-value attribute forms these fixtures exercise).
fn attribute_value_source(
    value: &AttributeValue,
    state: &ServerTransformState<'_>,
) -> Option<String> {
    match value {
        AttributeValue::Expression(tag) => {
            state.expr_source(&tag.expression).map(|s| s.to_string())
        }
        AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
            AttributeValuePart::ExpressionTag(tag) => {
                state.expr_source(&tag.expression).map(|s| s.to_string())
            }
            AttributeValuePart::Text(_) => None,
        },
        _ => None,
    }
}

/// Visit a single attribute-value expression, `$.save`-wrapping an inline
/// `await` when the current element is async (an `attr_optimiser` is active and
/// the value has a top-level await). 写经 `context.visit(node.expression)` →
/// `AwaitExpression` visitor `(await $.save(arg))()`. Sync elements (no active
/// optimiser) keep the plain read-wrapped expression, so non-async output is
/// unchanged.
fn attr_expr_value<'a>(
    expr: &crate::ast::js::Expression,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    if state.attr_optimiser.is_some()
        && let Some(text) = state.expr_source(expr).map(|s| s.to_string())
        && super::shared::text_has_await(&text)
    {
        return super::shared::save_wrap_expr_text(state, &text);
    }
    state.visit_expr(expr)
}

/// Whether `name` is an event-handler attribute (`on` + lowercase letter), the
/// `is_event_attribute` predicate from upstream `utils/ast.js`.
fn is_event_attribute_name(name: &str) -> bool {
    name.len() > 2 && name.starts_with("on") && name.as_bytes()[2].is_ascii_lowercase()
}

/// Whether the element emits `load` / `error` events (upstream
/// `utils.js::is_load_error_element` / `LOAD_ERROR_ELEMENTS`). Such elements
/// re-capture `onload` / `onerror` during SSR via the
/// `onload="this.__e=event"` markers so the client can replay them.
fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
    )
}

/// Lowercase the attribute name for non-svg/mathml elements (upstream
/// `get_attribute_name`).
fn get_attribute_name(element: &RegularElement, attribute: &AttributeNode) -> String {
    let name = attribute.name.as_str();
    if !element.metadata.svg && !element.metadata.mathml {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

/// Collapse runs of `[ \t\n\r\f]+` to a single space and trim (the
/// `regex_whitespaces_strict` + `.trim()` of `build_attribute_value` for the
/// whitespace-insensitive single-text fast-path).
fn collapse_ws(s: &str) -> String {
    collapse_ws_no_trim(s).trim().to_string()
}

/// Collapse runs of `[ \t\n\r\f]+` to a single space WITHOUT trimming (the
/// per-quasi text replace in the mixed-sequence path).
fn collapse_ws_no_trim(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for ch in s.chars() {
        if matches!(ch, ' ' | '\t' | '\n' | '\r' | '\u{c}') {
            if !in_ws {
                out.push(' ');
                in_ws = true;
            }
        } else {
            out.push(ch);
            in_ws = false;
        }
    }
    out
}

/// Attempt to fold a mixed text+expression attribute `Sequence` into a single
/// static string: every `ExpressionTag` part must evaluate (`scope.evaluate`)
/// to a known value (a known-nullish part contributes nothing). Returns the
/// concatenated value (text parts verbatim, expr parts as their display string),
/// or `None` if any expression is not statically known. Mirrors the oracle's
/// `build_attribute_value` all-inline branch (no per-part HTML escape — the
/// caller escapes the whole value with `escape_attr`).
fn fold_sequence_static<'a>(
    parts: &[AttributeValuePart],
    trim_ws: bool,
    state: &ServerTransformState<'a>,
) -> Option<String> {
    use crate::compiler::phases::phase3_transform::server::evaluate::{
        EvalValue, js_display_string,
    };
    let mut out = String::new();
    for part in parts {
        match part {
            // For whitespace-insensitive attrs (`class`/`style`) each text chunk
            // is whitespace-collapsed (but NOT trimmed) per-part, mirroring
            // upstream `build_attribute_value`'s `replace(regex_whitespaces_strict, ' ')`.
            // The trailing trim only happens at the css-hash join in the caller.
            AttributeValuePart::Text(t) if trim_ws => {
                out.push_str(&collapse_ws_no_trim(t.data.as_str()))
            }
            AttributeValuePart::Text(t) => out.push_str(t.data.as_str()),
            AttributeValuePart::ExpressionTag(tag) => {
                let ev = state
                    .eval_ctx()
                    .evaluate_template_expression(&tag.expression);
                let value = ev.known_value()?;
                if !matches!(value, EvalValue::Null | EvalValue::Undefined) {
                    out.push_str(&js_display_string(value));
                }
            }
        }
    }
    Some(out)
}

/// Extract a string-literal expression's value (mirrors the oracle's
/// `extract_literal_value` — string literals ONLY; numeric / boolean literals
/// return `None` so they keep `$.attr(...)`).
fn string_literal_of(expr: &crate::ast::js::Expression) -> Option<String> {
    if expr.node_type()? != "Literal" {
        return None;
    }
    let node = expr.as_node();
    match &*node {
        crate::ast::typed_expr::JsNode::Literal { value, .. } => {
            if let crate::ast::typed_expr::LiteralValue::String(s) = value {
                Some(s.to_string())
            } else {
                None
            }
        }
        _ => None,
    }
}

/// If every part of an attribute value sequence is static `Text`, return the
/// concatenated (optionally whitespace-collapsed+trimmed) text; otherwise `None`.
fn static_text_of(parts: &[AttributeValuePart], trim_ws: bool) -> Option<String> {
    let mut s = String::new();
    for part in parts {
        match part {
            AttributeValuePart::Text(t) => s.push_str(t.data.as_str()),
            AttributeValuePart::ExpressionTag(_) => return None,
        }
    }
    if trim_ws {
        Some(collapse_ws(&s))
    } else {
        Some(s)
    }
}
