//! `svelte/no-not-function-handler`.
//!
//! `svelte/no-not-function-handler` — flag an event handler whose expression is
//! not a function (an object/array/class expression, a literal value, or a
//! template literal). Such handlers don't do what the author intends — Svelte
//! invokes the handler, but a non-function value is meaningless.
//! Port of the eslint-plugin-svelte rule.
//!
//! Two handler sources are checked (mirroring upstream):
//!   A) `on:` directives — `<button on:click={[a]} />`.
//!   B) plain event attributes whose name is in `EVENT_NAMES`
//!      (`onclick`, `oncopy`, …) with a single mustache value —
//!      `<button onclick={[a]} />`.
//!
//! When the handler expression is a bare identifier, it is resolved through
//! top-level `const` declarations (`const a = 'hello!'; on:click={a}` →
//! `string value`). The finding is reported at the **handler expression** span
//! (the `{…}` interior), not at the resolved const.
//!
//! Both the handler and the resolved initializer are classified by `ESTree`
//! node type, as upstream does. Attributes are visited through the global
//! `check_attribute` hook so every element kind is covered.

use std::collections::HashMap;
use std::sync::OnceLock;

use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart};
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::node_type;

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
/// the resolved (root) expression as an `ESTree` JSON node. `None` means the
/// expression is acceptable (or a literal whose value is `null`/unrepresentable).
/// Mirrors upstream's `PHRASES` map exactly.
fn phrase(node: &Value) -> Option<&'static str> {
    match node_type(node)? {
        "ObjectExpression" => Some("object"),
        "ArrayExpression" => Some("array"),
        "ClassExpression" => Some("class"),
        "TemplateLiteral" => Some("string value"),
        "Literal" => {
            if node.get("regex").is_some_and(|r| !r.is_null()) {
                return Some("regex value");
            }
            if is_bigint(node) {
                return Some("bigint value");
            }
            match node.get("value") {
                Some(Value::String(_)) => Some("string value"),
                Some(Value::Number(_)) => Some("number value"),
                Some(Value::Bool(_)) => Some("boolean value"),
                _ => None,
            }
        }
        _ => None,
    }
}

/// A bigint literal. rsvelte's `ESTree` carries no `bigint` discriminator (the
/// value is `null`), so it is recognised the way the rest of the compiler does:
/// a numeric `raw` ending in `n`.
fn is_bigint(node: &Value) -> bool {
    if !node.get("value").is_none_or(Value::is_null) {
        return false;
    }
    node.get("raw")
        .and_then(Value::as_str)
        .is_some_and(is_bigint_text)
}

fn is_bigint_text(text: &str) -> bool {
    let Some(digits) = text.strip_suffix('n') else {
        return false;
    };
    digits.starts_with(|c: char| c.is_ascii_digit())
        && digits
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_')
}

/// rsvelte's expression parser has no bigint literal — `42n` comes back as the
/// placeholder `Identifier { name: "unknown" }`. `text` is the source the node
/// itself spans, so this recovers the literal without scanning for it.
fn recover_bigint(node: &Value, text: &str) -> Option<Value> {
    if node_type(node) != Some("Identifier")
        || node.get("name").and_then(Value::as_str) != Some("unknown")
        || !is_bigint_text(text)
    {
        return None;
    }
    Some(serde_json::json!({ "type": "Literal", "value": Value::Null, "raw": text }))
}

/// The source `node` spans within `src`, whose offsets are relative to `base`.
fn node_text<'a>(node: &Value, src: &'a str, base: u32) -> Option<&'a str> {
    let start =
        usize::try_from(node.get("start")?.as_u64()?.saturating_sub(u64::from(base))).ok()?;
    let end = usize::try_from(node.get("end")?.as_u64()?.saturating_sub(u64::from(base))).ok()?;
    src.get(start..end)
}

/// Resolve a handler expression through top-level `const` declarations.
/// If `node` is an `Identifier` mapped in `consts` to a present init, recurse
/// on the init; otherwise return `node`. Mirrors upstream `findRootExpression`.
fn find_root_expression<'a>(node: &'a Value, consts: &'a ConstMap) -> &'a Value {
    let mut current = node;
    // `const a = b; const b = a;` is a cycle upstream's recursion would not
    // survive either; stop rather than loop.
    let mut seen: Vec<&str> = Vec::new();
    while node_type(current) == Some("Identifier") {
        let Some(name) = current.get("name").and_then(Value::as_str) else {
            return current;
        };
        if seen.contains(&name) {
            return current;
        }
        seen.push(name);
        let Some(init) = consts.get(name) else {
            return current;
        };
        current = init;
    }
    current
}

type ConstMap = HashMap<String, Value>;

/// The initializers of every top-level `const NAME = …` in the component's
/// scripts, keyed by name.
///
/// The scripts are parsed rather than scanned: which shape an initializer *is*
/// is the whole question this rule asks, and source text answers it wrongly for
/// an operator (`'a' + 'b'` is not a string literal), for a member or call
/// (`{ m() {} }.m` is not an object), and for a TS wrapper (`'x' as const` is a
/// `TSAsExpression`, which upstream reports nothing for). A scan also cannot see
/// a non-ASCII declarator name.
fn build_const_map(ctx: &LintContext) -> ConstMap {
    let mut map = ConstMap::new();
    let source = ctx.source();
    for &(content_offset, end) in ctx.script_spans() {
        let (lo, hi) = (content_offset as usize, end as usize);
        if lo > hi || hi > source.len() {
            continue;
        }
        let mut body = &source[lo..hi];
        if let Some(close) = body.rfind("</script") {
            body = &body[..close];
        }
        // Parsed as TypeScript: a plain-JS script is a subset, and the `lang`
        // attribute is not carried on the span list this rule receives.
        let program = rsvelte_core::compiler::phases::parse_module_to_estree(body, true);
        collect_top_level_consts(&program, body, &mut map);
    }
    map
}

fn collect_top_level_consts(program: &Value, body_src: &str, map: &mut ConstMap) {
    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return;
    };
    for statement in body {
        let declaration = match node_type(statement) {
            Some("VariableDeclaration") => statement,
            Some("ExportNamedDeclaration") => {
                match statement.get("declaration").filter(|d| !d.is_null()) {
                    Some(d) => d,
                    None => continue,
                }
            }
            _ => continue,
        };
        if declaration.get("kind").and_then(Value::as_str) != Some("const") {
            continue;
        }
        let declarators = declaration
            .get("declarations")
            .and_then(Value::as_array)
            .map(Vec::as_slice)
            .unwrap_or_default();
        for declarator in declarators {
            let (Some(id), Some(init)) = (declarator.get("id"), declarator.get("init")) else {
                continue;
            };
            if node_type(id) != Some("Identifier") || init.is_null() {
                continue;
            }
            if let Some(name) = id.get("name").and_then(Value::as_str) {
                let recovered = node_text(init, body_src, 0).and_then(|t| recover_bigint(init, t));
                map.insert(name.to_string(), recovered.unwrap_or_else(|| init.clone()));
            }
        }
    }
}

#[derive(Default)]
pub struct NoNotFunctionHandler {
    /// Built on first use and shared by every handler in the file. `all_rules()`
    /// constructs a fresh rule set per file, so this never outlives its source.
    consts: OnceLock<ConstMap>,
}

impl NoNotFunctionHandler {
    fn verify(&self, ctx: &mut LintContext, expr: &Expression) {
        let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
            return;
        };
        let found = {
            let node = expr.as_json();
            match recover_bigint(node, ctx.slice(start, end)) {
                Some(literal) => phrase(&literal),
                None => {
                    let consts = self.consts.get_or_init(|| build_const_map(ctx));
                    phrase(find_root_expression(node, consts))
                }
            }
        };
        if let Some(p) = found {
            ctx.report(start, end, format!("Unexpected {p} in event handler."));
        }
    }
}

impl Rule for NoNotFunctionHandler {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    /// Upstream's `SvelteDirective` / `SvelteAttribute` visitors are global, so
    /// a handler is checked wherever it sits — including on `<svelte:window>`,
    /// `<svelte:body>`, `<svelte:document>` and `<svelte:element>`.
    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        match attr {
            // A) `on:` directive
            Attribute::OnDirective(dir) => {
                if let Some(expr) = &dir.expression {
                    self.verify(ctx, expr);
                }
            }
            // B) plain event attribute (`onclick={…}`)
            Attribute::Attribute(node) => {
                if !EVENT_NAMES.contains(&node.name.as_str()) {
                    return;
                }
                match &node.value {
                    AttributeValue::Sequence(parts) => {
                        for part in parts {
                            if let AttributeValuePart::ExpressionTag(tag) = part {
                                self.verify(ctx, &tag.expression);
                            }
                        }
                    }
                    AttributeValue::Expression(tag) => self.verify(ctx, &tag.expression),
                    AttributeValue::True(_) => {}
                }
            }
            _ => {}
        }
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
        // regex / bigint detected without a `value`.
        assert_eq!(
            phrase(&json!({ "type": "Literal", "regex": { "pattern": "reg" }, "value": null })),
            Some("regex value")
        );
        assert_eq!(
            phrase(&json!({ "type": "Literal", "raw": "123n", "value": null })),
            Some("bigint value")
        );
        // null literal and acceptable expressions → no phrase.
        assert_eq!(phrase(&json!({ "type": "Literal", "value": null })), None);
        assert_eq!(phrase(&json!({ "type": "Identifier", "name": "fn" })), None);
        assert_eq!(phrase(&json!({ "type": "ArrowFunctionExpression" })), None);
        // An operator, a member access and a TS wrapper are none of the
        // reported kinds, whatever their operands look like.
        assert_eq!(phrase(&json!({ "type": "BinaryExpression" })), None);
        assert_eq!(phrase(&json!({ "type": "MemberExpression" })), None);
        assert_eq!(phrase(&json!({ "type": "TSAsExpression" })), None);
    }

    #[test]
    fn a_bigint_const_is_recovered_from_the_placeholder_node() {
        let map = consts_of("const b = 42n;\nconst fn = 1;");
        assert_eq!(phrase(&map["b"]), Some("bigint value"));
        // A name ending in `n` is not a bigint.
        assert_eq!(phrase(&map["fn"]), Some("number value"));
    }

    #[test]
    fn null_literal_is_not_mistaken_for_a_bigint() {
        assert!(!is_bigint(
            &json!({ "type": "Literal", "raw": "null", "value": null })
        ));
    }

    fn map_of(pairs: &[(&str, Value)]) -> ConstMap {
        pairs
            .iter()
            .map(|(k, v)| ((*k).to_string(), v.clone()))
            .collect()
    }

    #[test]
    fn find_root_resolves_const_chains() {
        let map = map_of(&[
            ("a", json!({ "type": "Literal", "value": "hello!" })),
            ("b", json!({ "type": "Identifier", "name": "a" })),
        ]);
        let b = json!({ "type": "Identifier", "name": "b" });
        let resolved = find_root_expression(&b, &map);
        assert_eq!(node_type(resolved), Some("Literal"));
        assert_eq!(phrase(resolved), Some("string value"));
    }

    #[test]
    fn find_root_returns_node_when_unresolvable() {
        let map = ConstMap::new();
        // unmapped identifier (e.g. a `let` binding) is returned as-is.
        let n = json!({ "type": "Identifier", "name": "a" });
        assert_eq!(find_root_expression(&n, &map), &n);
        assert_eq!(phrase(find_root_expression(&n, &map)), None);
    }

    #[test]
    fn find_root_stops_on_a_cycle() {
        let map = map_of(&[
            ("a", json!({ "type": "Identifier", "name": "b" })),
            ("b", json!({ "type": "Identifier", "name": "a" })),
        ]);
        let a = json!({ "type": "Identifier", "name": "a" });
        assert_eq!(phrase(find_root_expression(&a, &map)), None);
    }

    fn consts_of(src: &str) -> ConstMap {
        let program = rsvelte_core::compiler::phases::parse_module_to_estree(src, true);
        let mut map = ConstMap::new();
        collect_top_level_consts(&program, src, &mut map);
        map
    }

    #[test]
    fn top_level_consts_are_collected_by_node_type() {
        let map = consts_of(
            "const concat = 'a' + 'b';\nconst obj = { a: 1 };\nconst 文字 = 'テキスト';\nlet mutable = 'x';\nfunction f() { const scoped = 'y'; return scoped; }",
        );
        assert_eq!(node_type(&map["concat"]), Some("BinaryExpression"));
        assert_eq!(node_type(&map["obj"]), Some("ObjectExpression"));
        assert_eq!(phrase(&map["文字"]), Some("string value"));
        assert!(!map.contains_key("mutable"));
        assert!(!map.contains_key("scoped"));
    }

    #[test]
    fn a_const_declared_inside_a_string_is_not_collected() {
        let map = consts_of("const code = \"const fake = 'oops';\";\n// const fake2 = 'nope';");
        assert!(!map.contains_key("fake"));
        assert!(!map.contains_key("fake2"));
    }
}
