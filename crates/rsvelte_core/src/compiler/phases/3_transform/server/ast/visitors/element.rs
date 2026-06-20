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
//!   - `class={x}` → `${$.attr_class(x, <css_hash?>)}`,
//!   - `style={x}` → `${$.attr_style(x)}`,
//!   - the CSS scope-class injection.
//!
//! 写经 gaps (TODO): spread (`{...obj}`), `class:` / `style:` / `bind:` / `use:`
//! directives, `<select>` / `<option>` / `<textarea>` / `<script>` / `<style>`
//! special branches, the `value` / `group` binding synthesis, `$.clsx` clsx
//! object form, event-handler capture, dev `push_element` markers, and the async
//! `PromiseOptimiser` wrapping. Any of those attribute kinds is currently skipped.

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, BindDirective, RegularElement,
};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::shared::template::{
    escape_attr, is_boolean_attribute, is_void_element,
};
use oxc_ast::ast::BinaryOperator;
use oxc_ast::ast::Expression as OxcExpression;

use super::shared::{TemplateEntry, process_children};

/// Names whose text values get whitespace-collapsed + trimmed (`class`/`style`).
const WHITESPACE_INSENSITIVE_ATTRIBUTES: [&str; 2] = ["class", "style"];

/// Visit a `<name ...>children</name>` regular element.
pub fn visit_regular_element<'a>(node: &RegularElement, state: &mut ServerTransformState<'a>) {
    let name = node.name.as_str();
    let is_void = is_void_element(name);

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

    // -- `>` / `/>` ---------------------------------------------------------
    state.template.push(TemplateEntry::Literal(
        if is_void { "/>" } else { ">" }.to_string(),
    ));

    // -- children -----------------------------------------------------------
    if !is_void {
        let namespace = if node.metadata.svg {
            "svg"
        } else if node.metadata.mathml {
            "mathml"
        } else {
            "html"
        };
        process_children(&node.fragment.nodes, Some(node), namespace, state);
        state
            .template
            .push(TemplateEntry::Literal(format!("</{name}>")));
    }
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
fn find_value_attribute<'n>(node: &'n RegularElement) -> Option<&'n AttributeNode> {
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
/// `textContent`). Upstream renders these as escaped element CONTENT — a path
/// the AST pipeline does not have yet, so they are a KNOWN GAP here.
fn is_content_editable_binding(name: &str) -> bool {
    matches!(name, "innerHTML" | "innerText" | "textContent")
}

/// Whether the parsed bind expression is a `SequenceExpression` (the
/// `bind:value={get, set}` / `bind:group={get, set}` get/set form). Upstream
/// calls the first expression (`b.call(expression.expressions[0])`) for the
/// server-rendered value; here that get/set form is a KNOWN GAP (skipped).
fn bind_expr_is_sequence(bind: &BindDirective) -> bool {
    bind.expression.node_type() == Some("SequenceExpression")
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
    // The get/set `{get, set}` sequence form: KNOWN GAP (skipped).
    if bind_expr_is_sequence(bind) {
        return None;
    }

    // KNOWN GAP: content-producing binds need an element-CONTENT mechanism the
    // AST pipeline does not have yet.
    //   - `bind:innerHTML` / `bind:innerText` / `bind:textContent` → escaped content
    //   - `bind:value` on `<textarea>` → escaped content
    if is_content_editable_binding(name) || (name == "value" && node.name.as_str() == "textarea") {
        return None;
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
fn build_element_attributes<'a>(
    node: &RegularElement,
    css_hash: Option<&str>,
    state: &mut ServerTransformState<'a>,
) {
    let has_class_dir_or_spread = has_class_directive_or_spread(node);

    // Track whether ANY `class` attribute (static or dynamic) was emitted; the
    // fresh-scope-class injection only happens when there is none AND no class
    // directive/spread.
    let mut emitted_class = false;

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
            if let Some((bind_name, value)) = build_bind_directive(node, bind, state) {
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
            // Spread / class:/style:/use:/attach directives: KNOWN GAP (skipped).
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
        // are omitted by upstream; skip them (gap: onload/onerror capture).
        if is_event_attribute_name(raw_name)
            || raw_name == "defaultValue"
            || raw_name == "defaultChecked"
        {
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
        // `can_use_literal` is false when a matching class/style DIRECTIVE
        // exists — but directives are a gap here, so for a static text value we
        // always take the literal path.
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
                // Mixed text+expression: fall through to the dynamic value build.
            }
            AttributeValue::Expression(_) => {
                // Single expression: fall through to dynamic value build.
            }
        }

        // -- dynamic value build --------------------------------------------
        let mut value = build_attribute_value(&a.value, trim_ws, state);

        if is_class {
            // `class={complex}` is wrapped in `$.clsx(...)` so array/object class
            // forms flatten — mirrors upstream's `needs_clsx` branch in
            // `build_element_attributes` (the wrap is applied to the expression
            // BEFORE the value build, but it is a pure function call so wrapping
            // the built value is equivalent for the single-expression case).
            if a.metadata.needs_clsx {
                value = state.b.call("$.clsx", vec![value]);
            }
            // `$.attr_class(expr, css_hash?, directives?)`. directives = class
            // directives (gap → None here).
            let call = build_attr_class(value, css_hash, state);
            push_interp(state, call);
        } else if is_style {
            // `$.attr_style(expr, directives?)`. directives = style directives
            // (gap → None here).
            let call = state.b.call_opt("$.attr_style", vec![Some(value), None]);
            push_interp(state, call);
        } else {
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
    {
        state
            .template
            .push(TemplateEntry::Literal(format!(" class=\"{hash}\"")));
    }
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

/// `build_attr_class(expression, css_hash, directives=None)` — the no-directive
/// server form. Mirrors `shared/element.js::build_attr_class`: when `hash` is
/// set and the expression is a runtime value (always, here — we don't constant
/// fold), the hash is passed as the 2nd arg.
fn build_attr_class<'a>(
    expression: OxcExpression<'a>,
    css_hash: Option<&str>,
    state: &ServerTransformState<'a>,
) -> OxcExpression<'a> {
    // 3rd arg (directives) is a KNOWN GAP → always None (dropped as trailing).
    state.b.call_opt(
        "$.attr_class",
        vec![Some(expression), css_hash.map(|h| state.b.string(h)), None],
    )
}

/// Port of `build_attribute_value` for a NON-text-fast-path value (single
/// expression or mixed sequence). Returns the runtime value expression:
///   - single expression → `transform(visit(expr))` (= `state.visit_expr`),
///   - mixed sequence → a template literal `` `text${$.stringify(expr)}text` ``
///     (each interpolated expr wrapped in `$.stringify` since we can't prove it
///     is a defined string — matching upstream's non-`is_string`/`is_defined`
///     branch).
///
/// NOTE (写经 gap): upstream's `scope.evaluate` constant-folding is not ported,
/// so a known-string interpolation is still wrapped in `$.stringify(...)`.
fn build_attribute_value<'a>(
    value: &AttributeValue,
    trim_ws: bool,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    match value {
        AttributeValue::True(_) => state.b.bool(true),
        AttributeValue::Expression(tag) => state.visit_expr(&tag.expression),
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
                    AttributeValuePart::ExpressionTag(tag) => state.visit_expr(&tag.expression),
                };
            }

            // Mixed run → template literal.
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

/// Whether `name` is an event-handler attribute (`on` + lowercase letter), the
/// `is_event_attribute` predicate from upstream `utils/ast.js`.
fn is_event_attribute_name(name: &str) -> bool {
    name.len() > 2 && name.starts_with("on") && name.as_bytes()[2].is_ascii_lowercase()
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
