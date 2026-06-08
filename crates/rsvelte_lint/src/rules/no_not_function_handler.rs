//! `svelte/no-not-function-handler` — flag an event handler whose expression is
//! not a function (an object/array/class expression, a literal value, or a
//! template literal). Such handlers don't do what the author intends — Svelte
//! invokes the handler, but a non-function value is meaningless.
//! Port of the eslint-plugin-svelte rule.
//!
//! Two handler sources are checked (mirroring upstream):
//!   A) `on:` directives — `<button on:click={[a]} />`.
//!   B) plain event attributes whose name is in [`EVENT_NAMES`]
//!      (`onclick`, `oncopy`, …) with a single mustache value —
//!      `<button onclick={[a]} />`.
//!
//! When the handler expression is a bare identifier, it is resolved through
//! top-level `const` declarations (`const a = 'hello!'; on:click={a}` →
//! `string value`). The finding is reported at the **handler expression** span
//! (the `{…}` interior), not at the resolved const.

use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Component, RegularElement,
};
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-not-function-handler",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow use of not function in event handler",
    options_schema: None,
};

/// Event-attribute names that carry a handler (the `on:`/`on…` forms). Ported
/// verbatim from `eslint-plugin-svelte`'s `utils/events.ts`.
const EVENT_NAMES: &[&str] = &[
    // Clipboard Events
    "on:copy",
    "oncopy",
    "oncopycapture",
    "on:cut",
    "oncut",
    "oncutcapture",
    "on:paste",
    "onpaste",
    "onpastecapture",
    // Composition Events
    "on:compositionend",
    "oncompositionend",
    "oncompositionendcapture",
    "on:compositionstart",
    "oncompositionstart",
    "oncompositionstartcapture",
    "on:compositionupdate",
    "oncompositionupdate",
    "oncompositionupdatecapture",
    // Focus Events
    "on:focus",
    "onfocus",
    "onfocuscapture",
    "on:focusin",
    "onfocusin",
    "onfocusincapture",
    "on:focusout",
    "onfocusout",
    "onfocusoutcapture",
    "on:blur",
    "onblur",
    "onblurcapture",
    // Form Events
    "on:change",
    "onchange",
    "onchangecapture",
    "on:beforeinput",
    "onbeforeinput",
    "onbeforeinputcapture",
    "on:input",
    "oninput",
    "oninputcapture",
    "on:reset",
    "onreset",
    "onresetcapture",
    "on:submit",
    "onsubmit",
    "onsubmitcapture",
    "on:invalid",
    "oninvalid",
    "oninvalidcapture",
    "on:formdata",
    "onformdata",
    "onformdatacapture",
    // Image Events
    "on:load",
    "onload",
    "onloadcapture",
    "on:error",
    "onerror",
    "onerrorcapture",
    // Popover Events
    "on:beforetoggle",
    "onbeforetoggle",
    "onbeforetogglecapture",
    "on:toggle",
    "ontoggle",
    "ontogglecapture",
    // Content visibility Events
    "on:contentvisibilityautostatechange",
    "oncontentvisibilityautostatechange",
    "oncontentvisibilityautostatechangecapture",
    // Keyboard Events
    "on:keydown",
    "onkeydown",
    "onkeydowncapture",
    "on:keypress",
    "onkeypress",
    "onkeypresscapture",
    "on:keyup",
    "onkeyup",
    "onkeyupcapture",
    // Media Events
    "on:abort",
    "onabort",
    "onabortcapture",
    "on:canplay",
    "oncanplay",
    "oncanplaycapture",
    "on:canplaythrough",
    "oncanplaythrough",
    "oncanplaythroughcapture",
    "on:cuechange",
    "oncuechange",
    "oncuechangecapture",
    "on:durationchange",
    "ondurationchange",
    "ondurationchangecapture",
    "on:emptied",
    "onemptied",
    "onemptiedcapture",
    "on:encrypted",
    "onencrypted",
    "onencryptedcapture",
    "on:ended",
    "onended",
    "onendedcapture",
    "on:loadeddata",
    "onloadeddata",
    "onloadeddatacapture",
    "on:loadedmetadata",
    "onloadedmetadata",
    "onloadedmetadatacapture",
    "on:loadstart",
    "onloadstart",
    "onloadstartcapture",
    "on:pause",
    "onpause",
    "onpausecapture",
    "on:play",
    "onplay",
    "onplaycapture",
    "on:playing",
    "onplaying",
    "onplayingcapture",
    "on:progress",
    "onprogress",
    "onprogresscapture",
    "on:ratechange",
    "onratechange",
    "onratechangecapture",
    "on:seeked",
    "onseeked",
    "onseekedcapture",
    "on:seeking",
    "onseeking",
    "onseekingcapture",
    "on:stalled",
    "onstalled",
    "onstalledcapture",
    "on:suspend",
    "onsuspend",
    "onsuspendcapture",
    "on:timeupdate",
    "ontimeupdate",
    "ontimeupdatecapture",
    "on:volumechange",
    "onvolumechange",
    "onvolumechangecapture",
    "on:waiting",
    "onwaiting",
    "onwaitingcapture",
    // MouseEvents
    "on:auxclick",
    "onauxclick",
    "onauxclickcapture",
    "on:click",
    "onclick",
    "onclickcapture",
    "on:contextmenu",
    "oncontextmenu",
    "oncontextmenucapture",
    "on:dblclick",
    "ondblclick",
    "ondblclickcapture",
    "on:drag",
    "ondrag",
    "ondragcapture",
    "on:dragend",
    "ondragend",
    "ondragendcapture",
    "on:dragenter",
    "ondragenter",
    "ondragentercapture",
    "on:dragexit",
    "ondragexit",
    "ondragexitcapture",
    "on:dragleave",
    "ondragleave",
    "ondragleavecapture",
    "on:dragover",
    "ondragover",
    "ondragovercapture",
    "on:dragstart",
    "ondragstart",
    "ondragstartcapture",
    "on:drop",
    "ondrop",
    "ondropcapture",
    "on:mousedown",
    "onmousedown",
    "onmousedowncapture",
    "on:mouseenter",
    "onmouseenter",
    "on:mouseleave",
    "onmouseleave",
    "on:mousemove",
    "onmousemove",
    "onmousemovecapture",
    "on:mouseout",
    "onmouseout",
    "onmouseoutcapture",
    "on:mouseover",
    "onmouseover",
    "onmouseovercapture",
    "on:mouseup",
    "onmouseup",
    "onmouseupcapture",
    // Selection Events
    "on:select",
    "onselect",
    "onselectcapture",
    "on:selectionchange",
    "onselectionchange",
    "onselectionchangecapture",
    "on:selectstart",
    "onselectstart",
    "onselectstartcapture",
    // Touch Events
    "on:touchcancel",
    "ontouchcancel",
    "ontouchcancelcapture",
    "on:touchend",
    "ontouchend",
    "ontouchendcapture",
    "on:touchmove",
    "ontouchmove",
    "ontouchmovecapture",
    "on:touchstart",
    "ontouchstart",
    "ontouchstartcapture",
    // Pointer Events
    "on:gotpointercapture",
    "ongotpointercapture",
    "ongotpointercapturecapture",
    "on:pointercancel",
    "onpointercancel",
    "onpointercancelcapture",
    "on:pointerdown",
    "onpointerdown",
    "onpointerdowncapture",
    "on:pointerenter",
    "onpointerenter",
    "onpointerentercapture",
    "on:pointerleave",
    "onpointerleave",
    "onpointerleavecapture",
    "on:pointermove",
    "onpointermove",
    "onpointermovecapture",
    "on:pointerout",
    "onpointerout",
    "onpointeroutcapture",
    "on:pointerover",
    "onpointerover",
    "onpointerovercapture",
    "on:pointerup",
    "onpointerup",
    "onpointerupcapture",
    "on:lostpointercapture",
    "onlostpointercapture",
    "onlostpointercapturecapture",
    // Gamepad Events
    "on:gamepadconnected",
    "ongamepadconnected",
    "on:gamepaddisconnected",
    "ongamepaddisconnected",
    // UI Events
    "on:scroll",
    "onscroll",
    "onscrollcapture",
    "on:scrollend",
    "onscrollend",
    "onscrollendcapture",
    "on:resize",
    "onresize",
    "onresizecapture",
    // Wheel Events
    "on:wheel",
    "onwheel",
    "onwheelcapture",
    // Animation Events
    "on:animationstart",
    "onanimationstart",
    "onanimationstartcapture",
    "on:animationend",
    "onanimationend",
    "onanimationendcapture",
    "on:animationiteration",
    "onanimationiteration",
    "onanimationiterationcapture",
    // Transition Events
    "on:transitionstart",
    "ontransitionstart",
    "ontransitionstartcapture",
    "on:transitionrun",
    "ontransitionrun",
    "ontransitionruncapture",
    "on:transitionend",
    "ontransitionend",
    "ontransitionendcapture",
    "on:transitioncancel",
    "ontransitioncancel",
    "ontransitioncancelcapture",
    // Svelte Transition Events
    "on:outrostart",
    "onoutrostart",
    "onoutrostartcapture",
    "on:outroend",
    "onoutroend",
    "onoutroendcapture",
    "on:introstart",
    "onintrostart",
    "onintrostartcapture",
    "on:introend",
    "onintroend",
    "onintroendcapture",
    // Message Events
    "on:message",
    "onmessage",
    "onmessagecapture",
    "on:messageerror",
    "onmessageerror",
    "onmessageerrorcapture",
    // Document Events
    "on:visibilitychange",
    "onvisibilitychange",
    "onvisibilitychangecapture",
    // Global Events
    "on:beforematch",
    "onbeforematch",
    "onbeforematchcapture",
    "on:cancel",
    "oncancel",
    "oncancelcapture",
    "on:close",
    "onclose",
    "onclosecapture",
    "on:fullscreenchange",
    "onfullscreenchange",
    "onfullscreenchangecapture",
    "on:fullscreenerror",
    "onfullscreenerror",
    "onfullscreenerrorcapture",
];

/// The "phrase" the message uses for a non-function handler expression, given
/// the resolved (root) expression as an ESTree JSON node. `None` means the
/// expression is acceptable (or a literal whose value is `null`/unrepresentable).
/// Mirrors upstream's `PHRASES` map exactly.
fn phrase(node: &Value) -> Option<&'static str> {
    match node.get("type").and_then(Value::as_str)? {
        "ObjectExpression" => Some("object"),
        "ArrayExpression" => Some("array"),
        "ClassExpression" => Some("class"),
        "TemplateLiteral" => Some("string value"),
        "Literal" => {
            if node.get("regex").is_some() {
                return Some("regex value");
            }
            if node.get("bigint").is_some() {
                return Some("bigint value");
            }
            match node.get("value") {
                None | Some(Value::Null) => None,
                Some(Value::String(_)) => Some("string value"),
                Some(Value::Number(_)) => Some("number value"),
                Some(Value::Bool(_)) => Some("boolean value"),
                _ => None,
            }
        }
        _ => None,
    }
}

/// Resolve a handler expression through top-level `const` declarations.
/// If `node` is an `Identifier` mapped in `const_map` to a present init, recurse
/// on the init; otherwise return `node`. Mirrors upstream `findRootExpression`.
fn find_root_expression<'a>(
    node: &'a Value,
    const_map: &'a std::collections::HashMap<String, Value>,
) -> &'a Value {
    if node.get("type").and_then(Value::as_str) == Some("Identifier")
        && let Some(name) = node.get("name").and_then(Value::as_str)
        && let Some(init) = const_map.get(name)
        && !init.is_null()
    {
        return find_root_expression(init, const_map);
    }
    node
}

/// Build a `const name -> init` map from the component's top-level instance (and
/// module) script. Only `const` declarations with a plain `Identifier` id are
/// mapped. The init is stored as a synthetic ESTree-ish JSON node carrying just
/// enough shape for [`phrase`] / [`find_root_expression`] (its `type`, and for a
/// `Literal` the `value` / `regex` / `bigint` discriminator).
///
/// The init is classified from the *source text*, not from a re-parsed AST: a
/// plain `parse()` does not materialise the script program's arena, so
/// `Script::content.as_json()` would be empty. Text classification side-steps
/// that and is sufficient for the literal/object/array/class shapes the rule
/// distinguishes.
///
/// Perf note: this re-parses the component source once per linted file (built
/// lazily, only when a candidate handler is found) to locate the script spans.
fn build_const_map(source: &str) -> std::collections::HashMap<String, Value> {
    let mut map = std::collections::HashMap::new();
    let Ok(root) = rsvelte_core::parse(source, rsvelte_core::ParseOptions::default()) else {
        return map;
    };
    for script in [root.instance.as_ref(), root.module.as_ref()]
        .into_iter()
        .flatten()
    {
        let (lo, hi) = (script.content_offset as usize, script.end as usize);
        if lo > hi || hi > source.len() {
            continue;
        }
        // Slice the script body and stop before any closing `</script>` tag.
        let mut body = &source[lo..hi];
        if let Some(close) = body.rfind("</script") {
            body = &body[..close];
        }
        scan_top_level_consts(body, &mut map);
    }
    map
}

/// Scan a script body for top-level `const NAME = INIT` declarations, inserting
/// `NAME -> classify_init(INIT)` into `map`. Brace/paren/bracket depth, strings,
/// templates and comments are tracked so only depth-0 `const`s are read.
fn scan_top_level_consts(s: &str, map: &mut std::collections::HashMap<String, Value>) {
    let bytes = s.as_bytes();
    let n = bytes.len();
    let mut i = 0;
    let mut depth = 0i32;
    while i < n {
        let c = bytes[i];
        match c {
            b'"' | b'\'' | b'`' => {
                i = skip_string(bytes, i);
                continue;
            }
            b'/' if i + 1 < n && bytes[i + 1] == b'/' => {
                while i < n && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if i + 1 < n && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < n && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(n);
                continue;
            }
            b'(' | b'[' | b'{' => {
                depth += 1;
                i += 1;
                continue;
            }
            b')' | b']' | b'}' => {
                depth -= 1;
                i += 1;
                continue;
            }
            _ => {}
        }
        if is_word_start(c) {
            let start = i;
            while i < n && is_word_char(bytes[i]) {
                i += 1;
            }
            if depth == 0 && &s[start..i] == "const" {
                i = read_const_declarators(s, bytes, i, map);
            }
            continue;
        }
        i += 1;
    }
}

/// Parse one or more comma-separated declarators following a `const` keyword.
/// Returns the index just past the terminating `;` (or EOF / a non-declarator).
fn read_const_declarators(
    s: &str,
    bytes: &[u8],
    mut i: usize,
    map: &mut std::collections::HashMap<String, Value>,
) -> usize {
    let n = bytes.len();
    loop {
        i = skip_ws_comments(bytes, i);
        if i >= n {
            return i;
        }
        // Destructuring patterns (`const { a } = …`) bind no plain identifier
        // we resolve; stop this declaration.
        if !is_word_start(bytes[i]) {
            return i;
        }
        let name_start = i;
        while i < n && is_word_char(bytes[i]) {
            i += 1;
        }
        let name = &s[name_start..i];
        i = skip_ws_comments(bytes, i);
        if i >= n || bytes[i] != b'=' {
            return i;
        }
        i += 1; // consume '='
        let init_start = skip_ws_comments(bytes, i);
        let (init_end, terminator) = read_init(bytes, init_start);
        let init = &s[init_start..init_end];
        map.insert(name.to_string(), classify_init(init));
        i = init_end;
        match terminator {
            b',' => {
                i += 1; // next declarator
                continue;
            }
            b';' => return i + 1,
            _ => return i,
        }
    }
}

/// Read an init expression starting at `i`, stopping at a depth-0 `,` or `;`
/// (or EOF). Returns `(end_index, terminator_byte)` where terminator is `0` at
/// EOF. String/template/comment contents are skipped.
fn read_init(bytes: &[u8], mut i: usize) -> (usize, u8) {
    let n = bytes.len();
    let mut depth = 0i32;
    while i < n {
        let c = bytes[i];
        match c {
            b'"' | b'\'' | b'`' => {
                i = skip_string(bytes, i);
                continue;
            }
            b'/' if i + 1 < n && bytes[i + 1] == b'/' => {
                while i < n && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if i + 1 < n && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < n && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(n);
                continue;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' | b';' if depth == 0 => return (i, c),
            _ => {}
        }
        i += 1;
    }
    (n, 0)
}

/// Classify a `const` initializer's source text into a synthetic JSON node.
fn classify_init(init: &str) -> Value {
    let t = init.trim();
    let bytes = t.as_bytes();
    let Some(&first) = bytes.first() else {
        return Value::Null;
    };
    match first {
        b'{' => serde_json::json!({ "type": "ObjectExpression" }),
        b'[' => serde_json::json!({ "type": "ArrayExpression" }),
        b'`' => serde_json::json!({ "type": "TemplateLiteral" }),
        b'\'' | b'"' => serde_json::json!({ "type": "Literal", "value": "" }),
        b'/' => serde_json::json!({ "type": "Literal", "regex": {} }),
        _ => {
            if starts_with_keyword(t, "class") {
                serde_json::json!({ "type": "ClassExpression" })
            } else if starts_with_keyword(t, "true") || starts_with_keyword(t, "false") {
                serde_json::json!({ "type": "Literal", "value": true })
            } else if first.is_ascii_digit()
                || ((first == b'.' || first == b'+' || first == b'-')
                    && bytes.get(1).is_some_and(u8::is_ascii_digit))
            {
                let tok: String = t
                    .chars()
                    .take_while(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '.')
                    .collect();
                if tok.ends_with('n') {
                    serde_json::json!({ "type": "Literal", "bigint": tok.trim_end_matches('n') })
                } else {
                    serde_json::json!({ "type": "Literal", "value": 0 })
                }
            } else if is_bare_identifier(t) {
                serde_json::json!({ "type": "Identifier", "name": t })
            } else {
                Value::Null
            }
        }
    }
}

/// `s` starts with the whole word `kw` (followed by a non-word char or end).
fn starts_with_keyword(s: &str, kw: &str) -> bool {
    s.strip_prefix(kw)
        .is_some_and(|rest| rest.bytes().next().is_none_or(|b| !is_word_char(b)))
}

/// Whether `s` is exactly a single JS identifier (used for const-chain hops).
fn is_bare_identifier(s: &str) -> bool {
    let bytes = s.as_bytes();
    !bytes.is_empty()
        && is_word_start(bytes[0])
        && !bytes[0].is_ascii_digit()
        && bytes.iter().all(|&b| is_word_char(b))
}

fn is_word_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$'
}

fn is_word_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Skip a string/template literal beginning at the opening quote `bytes[i]`,
/// returning the index just past the closing (unescaped) quote.
fn skip_string(bytes: &[u8], mut i: usize) -> usize {
    let n = bytes.len();
    let quote = bytes[i];
    i += 1;
    while i < n {
        let c = bytes[i];
        if c == b'\\' && i + 1 < n {
            i += 2;
            continue;
        }
        i += 1;
        if c == quote {
            break;
        }
    }
    i
}

/// Skip whitespace and `//` / `/* */` comments, returning the next index.
fn skip_ws_comments(bytes: &[u8], mut i: usize) -> usize {
    let n = bytes.len();
    loop {
        while i < n && bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        if i + 1 < n && bytes[i] == b'/' && bytes[i + 1] == b'/' {
            while i < n && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if i + 1 < n && bytes[i] == b'/' && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < n && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i = (i + 2).min(n);
            continue;
        }
        return i;
    }
}

#[derive(Default)]
pub struct NoNotFunctionHandler;

impl NoNotFunctionHandler {
    /// Verify a single handler expression span `[start, end)` whose JSON node is
    /// `node`, lazily building `const_map` from `ctx.source()` if not yet built.
    fn verify(
        &self,
        ctx: &mut LintContext,
        start: u32,
        end: u32,
        node: &Value,
        const_map: &mut Option<std::collections::HashMap<String, Value>>,
    ) {
        let map = const_map.get_or_insert_with(|| build_const_map(ctx.source()));
        let root = find_root_expression(node, map);
        if let Some(p) = phrase(root) {
            ctx.report(start, end, format!("Unexpected {p} in event handler."));
        }
    }

    /// Walk an element/component's attributes for `on:` directives and plain
    /// event attributes. `const_map` is shared/lazily built across all handlers.
    fn check_attributes(&self, ctx: &mut LintContext, attributes: &[Attribute]) {
        let mut const_map: Option<std::collections::HashMap<String, Value>> = None;
        for attr in attributes {
            match attr {
                // A) `on:` directive
                Attribute::OnDirective(dir) => {
                    if let Some(expr) = &dir.expression
                        && let (Some(start), Some(end)) = (expr.start(), expr.end())
                    {
                        let node = expr.as_json().clone();
                        self.verify(ctx, start, end, &node, &mut const_map);
                    }
                }
                // B) plain event attribute (`onclick={…}`)
                Attribute::Attribute(node) => {
                    if !EVENT_NAMES.contains(&node.name.as_str()) {
                        continue;
                    }
                    // Only a single-mustache value carries a handler expression.
                    if let AttributeValue::Sequence(parts) = &node.value {
                        for part in parts {
                            if let AttributeValuePart::ExpressionTag(tag) = part
                                && let (Some(start), Some(end)) =
                                    (tag.expression.start(), tag.expression.end())
                            {
                                let json = tag.expression.as_json().clone();
                                self.verify(ctx, start, end, &json, &mut const_map);
                            }
                        }
                    } else if let AttributeValue::Expression(tag) = &node.value
                        && let (Some(start), Some(end)) =
                            (tag.expression.start(), tag.expression.end())
                    {
                        let json = tag.expression.as_json().clone();
                        self.verify(ctx, start, end, &json, &mut const_map);
                    }
                }
                _ => {}
            }
        }
    }
}

impl Rule for NoNotFunctionHandler {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_attributes(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_attributes(ctx, &c.attributes);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn phrase_classifies_estree_nodes() {
        assert_eq!(
            phrase(&json!({ "type": "ObjectExpression" })),
            Some("object")
        );
        assert_eq!(phrase(&json!({ "type": "ArrayExpression" })), Some("array"));
        assert_eq!(phrase(&json!({ "type": "ClassExpression" })), Some("class"));
        assert_eq!(
            phrase(&json!({ "type": "TemplateLiteral" })),
            Some("string value")
        );
        // Literal value-typed phrases.
        assert_eq!(
            phrase(&json!({ "type": "Literal", "value": "x" })),
            Some("string value")
        );
        assert_eq!(
            phrase(&json!({ "type": "Literal", "value": 42 })),
            Some("number value")
        );
        assert_eq!(
            phrase(&json!({ "type": "Literal", "value": true })),
            Some("boolean value")
        );
        // regex / bigint detected by the marker key, regardless of `value`.
        assert_eq!(
            phrase(&json!({ "type": "Literal", "regex": { "pattern": "reg" }, "value": null })),
            Some("regex value")
        );
        assert_eq!(
            phrase(&json!({ "type": "Literal", "bigint": "42", "value": null })),
            Some("bigint value")
        );
        // null literal and acceptable expressions → no phrase.
        assert_eq!(phrase(&json!({ "type": "Literal", "value": null })), None);
        assert_eq!(phrase(&json!({ "type": "Identifier", "name": "fn" })), None);
        assert_eq!(phrase(&json!({ "type": "ArrowFunctionExpression" })), None);
    }

    #[test]
    fn find_root_resolves_const_chains() {
        let mut map = std::collections::HashMap::new();
        map.insert(
            "a".to_string(),
            json!({ "type": "Literal", "value": "hello!" }),
        );
        map.insert(
            "b".to_string(),
            json!({ "type": "Identifier", "name": "a" }),
        );
        let b = json!({ "type": "Identifier", "name": "b" });
        let resolved = find_root_expression(&b, &map);
        assert_eq!(
            resolved.get("type").and_then(Value::as_str),
            Some("Literal")
        );
        assert_eq!(phrase(resolved), Some("string value"));
    }

    #[test]
    fn find_root_returns_node_when_unresolvable() {
        let map = std::collections::HashMap::new();
        // unmapped identifier (e.g. a `let` binding) is returned as-is.
        let n = json!({ "type": "Identifier", "name": "a" });
        assert_eq!(find_root_expression(&n, &map), &n);
        assert_eq!(phrase(find_root_expression(&n, &map)), None);
    }
}
