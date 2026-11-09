use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{AttributeKind, Part, TemplateNode};
use rsvelte_typescript::syntax_tree::Class;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::constant_string::root;
use super::expressions::Expressions;
use super::markup::{is_attribute, parts};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-not-function-handler",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoNotFunctionHandler))
}

#[derive(Debug)]
struct NoNotFunctionHandler;

impl SvelteRule for NoNotFunctionHandler {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let expressions = Expressions::new(&component.javascript, source);
        for node in &component.nodes {
            let TemplateNode::Element {
                name, attributes, ..
            } = *node
            else {
                continue;
            };
            let element = name.text(source);
            for attribute in component.attributes(attributes) {
                let handler = attribute.kind == AttributeKind::On
                    || is_attribute(component, source, element, attribute)
                        && EVENT_ATTRIBUTES.contains(&attribute.name.text(source));
                if !handler {
                    continue;
                }
                for part in parts(component, attribute) {
                    if let Part::Expression { expression, .. } = *part {
                        verify(file, &expressions, expression, reporter);
                    }
                }
            }
        }
    }
}

fn verify(
    file: &File<'_>,
    expressions: &Expressions<'_>,
    expression: NodeIdentifier,
    reporter: &mut Reporter<'_>,
) {
    let value = root(expressions, || file.semantic(), expression);
    // An asserted value (`'a' as never`) is not a literal to ESTree.
    let Some(kind) = expressions.kind(value) else {
        return;
    };
    let phrase = match kind {
        Kind::Object(_) => "object",
        Kind::Array(_) => "array",
        Kind::Class(Class::Definition { .. }) => "class",
        Kind::Regex { .. } => "regex value",
        Kind::BigInt => "bigint value",
        Kind::String | Kind::Template { .. } => "string value",
        Kind::Number(_) => "number value",
        Kind::Boolean(_) => "boolean value",
        _ => return,
    };
    reporter.report(
        Report::range(
            format!("Unexpected {phrase} in event handler."),
            expressions.span(expression),
        )
        .message_id("unexpected"),
    );
}

/// The event attributes of `svelte/elements` (upstream `EVENT_NAMES` without the `on:` names,
/// which are directives).
const EVENT_ATTRIBUTES: &[&str] = &[
    "oncopy",
    "oncopycapture",
    "oncut",
    "oncutcapture",
    "onpaste",
    "onpastecapture",
    "oncompositionend",
    "oncompositionendcapture",
    "oncompositionstart",
    "oncompositionstartcapture",
    "oncompositionupdate",
    "oncompositionupdatecapture",
    "onfocus",
    "onfocuscapture",
    "onfocusin",
    "onfocusincapture",
    "onfocusout",
    "onfocusoutcapture",
    "onblur",
    "onblurcapture",
    "onchange",
    "onchangecapture",
    "onbeforeinput",
    "onbeforeinputcapture",
    "oninput",
    "oninputcapture",
    "onreset",
    "onresetcapture",
    "onsubmit",
    "onsubmitcapture",
    "oninvalid",
    "oninvalidcapture",
    "onformdata",
    "onformdatacapture",
    "onload",
    "onloadcapture",
    "onerror",
    "onerrorcapture",
    "onbeforetoggle",
    "onbeforetogglecapture",
    "ontoggle",
    "ontogglecapture",
    "oncontentvisibilityautostatechange",
    "oncontentvisibilityautostatechangecapture",
    "onkeydown",
    "onkeydowncapture",
    "onkeypress",
    "onkeypresscapture",
    "onkeyup",
    "onkeyupcapture",
    "onabort",
    "onabortcapture",
    "oncanplay",
    "oncanplaycapture",
    "oncanplaythrough",
    "oncanplaythroughcapture",
    "oncuechange",
    "oncuechangecapture",
    "ondurationchange",
    "ondurationchangecapture",
    "onemptied",
    "onemptiedcapture",
    "onencrypted",
    "onencryptedcapture",
    "onended",
    "onendedcapture",
    "onloadeddata",
    "onloadeddatacapture",
    "onloadedmetadata",
    "onloadedmetadatacapture",
    "onloadstart",
    "onloadstartcapture",
    "onpause",
    "onpausecapture",
    "onplay",
    "onplaycapture",
    "onplaying",
    "onplayingcapture",
    "onprogress",
    "onprogresscapture",
    "onratechange",
    "onratechangecapture",
    "onseeked",
    "onseekedcapture",
    "onseeking",
    "onseekingcapture",
    "onstalled",
    "onstalledcapture",
    "onsuspend",
    "onsuspendcapture",
    "ontimeupdate",
    "ontimeupdatecapture",
    "onvolumechange",
    "onvolumechangecapture",
    "onwaiting",
    "onwaitingcapture",
    "onauxclick",
    "onauxclickcapture",
    "onclick",
    "onclickcapture",
    "oncontextmenu",
    "oncontextmenucapture",
    "ondblclick",
    "ondblclickcapture",
    "ondrag",
    "ondragcapture",
    "ondragend",
    "ondragendcapture",
    "ondragenter",
    "ondragentercapture",
    "ondragexit",
    "ondragexitcapture",
    "ondragleave",
    "ondragleavecapture",
    "ondragover",
    "ondragovercapture",
    "ondragstart",
    "ondragstartcapture",
    "ondrop",
    "ondropcapture",
    "onmousedown",
    "onmousedowncapture",
    "onmouseenter",
    "onmouseleave",
    "onmousemove",
    "onmousemovecapture",
    "onmouseout",
    "onmouseoutcapture",
    "onmouseover",
    "onmouseovercapture",
    "onmouseup",
    "onmouseupcapture",
    "onselect",
    "onselectcapture",
    "onselectionchange",
    "onselectionchangecapture",
    "onselectstart",
    "onselectstartcapture",
    "ontouchcancel",
    "ontouchcancelcapture",
    "ontouchend",
    "ontouchendcapture",
    "ontouchmove",
    "ontouchmovecapture",
    "ontouchstart",
    "ontouchstartcapture",
    "ongotpointercapture",
    "ongotpointercapturecapture",
    "onpointercancel",
    "onpointercancelcapture",
    "onpointerdown",
    "onpointerdowncapture",
    "onpointerenter",
    "onpointerentercapture",
    "onpointerleave",
    "onpointerleavecapture",
    "onpointermove",
    "onpointermovecapture",
    "onpointerout",
    "onpointeroutcapture",
    "onpointerover",
    "onpointerovercapture",
    "onpointerup",
    "onpointerupcapture",
    "onlostpointercapture",
    "onlostpointercapturecapture",
    "ongamepadconnected",
    "ongamepaddisconnected",
    "onscroll",
    "onscrollcapture",
    "onscrollend",
    "onscrollendcapture",
    "onresize",
    "onresizecapture",
    "onwheel",
    "onwheelcapture",
    "onanimationstart",
    "onanimationstartcapture",
    "onanimationend",
    "onanimationendcapture",
    "onanimationiteration",
    "onanimationiterationcapture",
    "ontransitionstart",
    "ontransitionstartcapture",
    "ontransitionrun",
    "ontransitionruncapture",
    "ontransitionend",
    "ontransitionendcapture",
    "ontransitioncancel",
    "ontransitioncancelcapture",
    "onoutrostart",
    "onoutrostartcapture",
    "onoutroend",
    "onoutroendcapture",
    "onintrostart",
    "onintrostartcapture",
    "onintroend",
    "onintroendcapture",
    "onmessage",
    "onmessagecapture",
    "onmessageerror",
    "onmessageerrorcapture",
    "onvisibilitychange",
    "onvisibilitychangecapture",
    "onbeforematch",
    "onbeforematchcapture",
    "oncancel",
    "oncancelcapture",
    "onclose",
    "onclosecapture",
    "onfullscreenchange",
    "onfullscreenchangecapture",
    "onfullscreenerror",
    "onfullscreenerrorcapture",
];
