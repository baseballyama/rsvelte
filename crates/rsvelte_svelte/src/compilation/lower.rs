//! Lowering: from a component's HIR and its analysis to an output JS tree.
//!
//! One meaning, one implementation (P2): whitespace cleaning, rune rewriting, text escaping and
//! name generation are shared; only the parts where the targets really differ (DOM building on
//! the client, string pushing on the server) live in `client` and `server`.

pub mod client;
pub mod names;
pub mod script;
pub mod server;

use std::borrow::Cow;

use rsvelte_javascript::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_markup::decode_text;
use rustc_hash::FxHashMap;

use crate::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    NodeKind,
};
use crate::semantic::resolve::{BindingKind, Resolution};

/// A component as the compiler reads it, whatever syntax it was written in.
#[derive(Clone, Copy, Debug)]
pub struct CompileInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub javascript: &'a SyntaxTree,
    /// The instance script's program, or an empty one.
    pub program: NodeIdentifier,
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub style: Option<&'a rsvelte_stylesheet::StyleSheet>,
    /// Every template expression, in document order.
    pub template_expressions: &'a [NodeIdentifier],
    /// The document: HIR spans index into it.
    pub source_text: &'a str,
    /// Upstream's `preserveWhitespace` option: no trimming or collapsing of template text.
    pub preserve_whitespace: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Target {
    Client,
    Server,
}

/// A node after whitespace cleaning; text may have been trimmed, so it carries its own strings.
#[derive(Debug, Clone)]
pub enum Item<'a> {
    /// An element or block.
    Node(CompilerNodeIdentifier),
    /// An `{expression}` tag, or an expression chunk of an attribute value.
    Expression(NodeIdentifier),
    Text {
        data: Cow<'a, str>,
        raw: Cow<'a, str>,
    },
}

/// Which node holds the fragment; decides the special cases of [`clean_nodes`].
#[derive(Clone, Copy, Debug)]
pub enum Parent<'a> {
    Root,
    Element(&'a str),
    /// An `{#if}` branch.
    Block,
    /// The body or the fallback of an `{#each}`.
    Each,
}

#[derive(Debug)]
pub struct Cleaned<'a> {
    pub items: Vec<Item<'a>>,
    /// Upstream `is_text_first`: the fragment starts with text and needs an anchor comment.
    pub text_first: bool,
}

const fn is_ws(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\r' | '\n')
}

/// Upstream `clean_nodes` (3-transform/utils.js) for the node types this port has, with
/// `preserveComments: false`.
#[expect(
    clippy::too_many_lines,
    reason = "ports upstream's `clean_nodes` in one piece"
)]
pub fn clean_nodes<'a>(
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    parent: Parent<'_>,
    list: &[CompilerNodeIdentifier],
    preserve_ws: bool,
) -> Cleaned<'a> {
    // Upstream's parser reads `template.trimEnd()`; only `preserveWhitespace` can observe it.
    let end = source_text
        .trim_end_matches(|c: char| c.is_whitespace() || c == '\u{feff}')
        .len();
    let mut regular: Vec<Item<'a>> = Vec::with_capacity(list.len());
    for &identifier in list {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Comment { .. } => {}
            // A frontend's spelled text is not in a Svelte source the parser trimmed.
            NodeKind::Text { raw, spelled, .. } if !spelled && raw.start_offset as usize >= end => {
            }
            NodeKind::Text { raw, spelled, .. } if !spelled && raw.end_offset as usize > end => {
                let raw = &source_text[raw.start_offset as usize..end];
                regular.push(Item::Text {
                    data: decode_text(raw),
                    raw: Cow::Borrowed(raw),
                });
            }
            NodeKind::Text {
                raw,
                decoded,
                spelled,
            } => {
                let raw = raw.text(source_text);
                let data = decoded.as_deref().unwrap_or(raw);
                regular.push(Item::Text {
                    data: Cow::Borrowed(data),
                    raw: if *spelled {
                        escape_markup(data, false)
                    } else {
                        Cow::Borrowed(raw)
                    },
                });
            }
            NodeKind::Expression { expression } => regular.push(Item::Expression(*expression)),
            NodeKind::Element(_) | NodeKind::If { .. } | NodeKind::Each(_) => {
                regular.push(Item::Node(identifier));
            }
        }
    }
    let is_expression = |i: Option<&Item<'_>>| matches!(i, Some(Item::Expression(_)));

    let mut trimmed: Vec<Item<'a>> = if preserve_ws {
        regular
    } else {
        let all_ws = |i: &Item<'_>| matches!(i, Item::Text { data, .. } if data.chars().all(is_ws));
        while regular.first().is_some_and(all_ws) {
            regular.remove(0);
        }
        if let Some(Item::Text { data, raw }) = regular.first_mut() {
            *data = trim_start_owned(data);
            *raw = trim_start_owned(raw);
        }
        while regular.last().is_some_and(all_ws) {
            regular.pop();
        }
        if let Some(Item::Text { data, raw }) = regular.last_mut() {
            *data = trim_end_owned(data);
            *raw = trim_end_owned(raw);
        }
        let can_remove_entirely = matches!(
            parent,
            Parent::Element(
                "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
            )
        );
        let mut out = Vec::with_capacity(regular.len());
        for i in 0..regular.len() {
            let prev_is_expression = i > 0 && is_expression(regular.get(i - 1));
            let prev_text_ends_ws = i > 0
                && matches!(&regular[i - 1], Item::Text { data, .. } if data.ends_with(is_ws));
            let next_is_expression = is_expression(regular.get(i + 1));
            let item = &mut regular[i];
            if let Item::Text { data, raw } = item {
                if !prev_is_expression {
                    let with = if prev_text_ends_ws { "" } else { " " };
                    *data = replace_leading_ws(data, with);
                    *raw = replace_leading_ws(raw, with);
                }
                if !next_is_expression {
                    *data = replace_trailing_ws(data, " ");
                    *raw = replace_trailing_ws(raw, " ");
                }
                if !data.is_empty() && (data != " " || !can_remove_entirely) {
                    out.push(item.clone());
                }
            } else {
                out.push(item.clone());
            }
        }
        out
    };

    if matches!(parent, Parent::Element("pre"))
        && let Some(Item::Text { data, .. }) = trimmed.first()
        && (data == "\n" || data == "\r\n")
    {
        trimmed.remove(0);
    }

    let text_first = matches!(parent, Parent::Root | Parent::Each)
        && matches!(
            trimmed.first(),
            Some(Item::Text { .. } | Item::Expression(_))
        );
    Cleaned {
        items: trimmed,
        text_first,
    }
}

fn trim_start_owned<'a>(s: &Cow<'a, str>) -> Cow<'a, str> {
    let t = s.trim_start_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(t.to_owned())
    }
}

fn trim_end_owned<'a>(s: &Cow<'a, str>) -> Cow<'a, str> {
    let t = s.trim_end_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(t.to_owned())
    }
}

fn replace_leading_ws<'a>(s: &Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let t = s.trim_start_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(format!("{with}{t}"))
    }
}

fn replace_trailing_ws<'a>(s: &Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let t = s.trim_end_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(format!("{t}{with}"))
    }
}

/// Upstream `escape_html`.
#[must_use]
pub fn escape_markup(s: &str, is_attribute: bool) -> Cow<'_, str> {
    let needs = |c: char| c == '&' || c == '<' || (is_attribute && c == '"');
    if !s.contains(needs) {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 8);
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '"' if is_attribute => out.push_str("&quot;"),
            _ => out.push(ch),
        }
    }
    Cow::Owned(out)
}

/// Upstream `sanitize_template_string`: cooked text → raw template literal text.
#[must_use]
pub fn sanitize_template_string(s: &str) -> Cow<'_, str> {
    if !s.contains(['`', '\\']) && !s.contains("${") {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 4);
    let b = s.as_bytes();
    for (i, ch) in s.char_indices() {
        if ch == '`' || ch == '\\' || (ch == '$' && b.get(i + 1) == Some(&b'{')) {
            out.push('\\');
        }
        out.push(ch);
    }
    Cow::Owned(out)
}

const DOM_BOOLEAN_ATTRIBUTES: &[&str] = &[
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "disabled",
    "formnovalidate",
    "indeterminate",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "seamless",
    "selected",
    "webkitdirectory",
    "defer",
    "disablepictureinpicture",
    "disableremoteplayback",
];

#[must_use]
pub fn is_boolean_attribute(name: &str) -> bool {
    DOM_BOOLEAN_ATTRIBUTES.contains(&name)
}

/// Upstream `is_dom_property`: the boolean attributes plus the aliased property names.
#[must_use]
pub fn is_dom_property(name: &str) -> bool {
    is_boolean_attribute(name)
        || matches!(
            name,
            "formNoValidate"
                | "isMap"
                | "noModule"
                | "playsInline"
                | "readOnly"
                | "value"
                | "volume"
                | "defaultValue"
                | "defaultChecked"
                | "srcObject"
                | "noValidate"
                | "allowFullscreen"
                | "disablePictureInPicture"
                | "disableRemotePlayback"
        )
}

/// Upstream `cannot_be_set_statically`.
#[must_use]
pub fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "autofocus" | "muted" | "defaultValue" | "defaultChecked"
    )
}

/// Each `{#each}`'s `$$index` name. Upstream takes them from `scope.root.unique` while it builds
/// the scopes, before any transform: the collection, then the fallback, then the body, then the
/// block itself.
pub fn each_index_names(
    compiler_syntax_tree: &CompilerSyntaxTree,
    names: &mut names::Names,
) -> FxHashMap<CompilerNodeIdentifier, String> {
    fn walk(
        compiler_syntax_tree: &CompilerSyntaxTree,
        list: Children,
        names: &mut names::Names,
        out: &mut FxHashMap<CompilerNodeIdentifier, String>,
    ) {
        for &identifier in compiler_syntax_tree.children(list) {
            match &compiler_syntax_tree.node(identifier).kind {
                NodeKind::Element(el) => walk(compiler_syntax_tree, el.children, names, out),
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    for b in compiler_syntax_tree.branches(*branches) {
                        walk(compiler_syntax_tree, b.body, names, out);
                    }
                    if let Some(o) = otherwise {
                        walk(compiler_syntax_tree, *o, names, out);
                    }
                }
                NodeKind::Each(each) => {
                    if let Some(f) = each.fallback {
                        walk(compiler_syntax_tree, f, names, out);
                    }
                    walk(compiler_syntax_tree, each.body, names, out);
                    out.insert(identifier, names.unique("$$index"));
                }
                NodeKind::Text { .. } | NodeKind::Comment { .. } | NodeKind::Expression { .. } => {}
            }
        }
    }
    let mut out = FxHashMap::default();
    walk(
        compiler_syntax_tree,
        compiler_syntax_tree.root,
        names,
        &mut out,
    );
    out
}

/// Upstream's `EACH_ITEM_REACTIVE` test: the collection reads a binding (references inside a
/// function of the expression are not its dependencies).
#[must_use]
pub fn has_dependency(javascript: &SyntaxTree, res: &Resolution, e: NodeIdentifier) -> bool {
    match javascript.kind(e) {
        Kind::Identifier(_) => res
            .binding(e)
            .is_some_and(|(b, _)| res.sem.bindings[b].node != e),
        Kind::Function { .. } | Kind::Arrow { .. } => false,
        _ => {
            let mut any = false;
            javascript.for_each_child(e, |c| any = any || has_dependency(javascript, res, c));
            any
        }
    }
}

/// The checks this port makes before lowering a `bind:` directive.
///
/// A supported property on a supported element, and a target that is `$state` or a member of
/// `$state` or of an `{#each}` item. Upstream validates more and accepts more.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] for anything else.
pub fn check_binding(
    javascript: &SyntaxTree,
    res: &Resolution,
    source_text: &str,
    tag: &str,
    attributes: &[Attribute],
    a: &Attribute,
) -> Result<NodeIdentifier, Diagnostic> {
    let AttributeValue::Bind(e) = a.value else {
        unreachable!("called on bindings")
    };
    let unsupported = |what: String, span: Span| {
        Err(Diagnostic::error(
            "unsupported",
            format!("{what} is not supported yet"),
            span,
        ))
    };
    let property = a.name.text(source_text);
    if !supported_binding(source_text, tag, attributes, property) {
        return unsupported(format!("`bind:{property}` on this `<{tag}>`"), a.span);
    }
    let beside = attributes.iter().any(|o| {
        !std::ptr::eq(o, a) && matches!(o.name.text(source_text), "value" | "checked" | "group")
    });
    if beside {
        return unsupported(
            "a binding beside a `value`, `checked` or `group` attribute".into(),
            a.span,
        );
    }
    let mut root = e;
    while let Kind::Member { object, .. } = javascript.kind(root) {
        root = object;
    }
    let kind = matches!(javascript.kind(root), Kind::Identifier(_))
        .then(|| res.binding(root).map(|(_, info)| info.kind))
        .flatten();
    let member = root != e;
    let ok = match kind {
        Some(BindingKind::State | BindingKind::RawState) => true,
        Some(BindingKind::Each) => member,
        _ => false,
    };
    if !ok {
        return unsupported(
            "a binding to anything but `$state` or a member of `$state` or of an `{#each}` item"
                .into(),
            a.span,
        );
    }
    Ok(e)
}

const SVG_ELEMENTS: &[&str] = &[
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animate",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "color-profile",
    "cursor",
    "defs",
    "desc",
    "discard",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "font",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignObject",
    "g",
    "glyph",
    "glyphRef",
    "hatch",
    "hatchpath",
    "hkern",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "metadata",
    "missing-glyph",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "set",
    "solidcolor",
    "stop",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "tref",
    "tspan",
    "unknown",
    "use",
    "view",
    "vkern",
];

const MATHML_ELEMENTS: &[&str] = &[
    "annotation",
    "annotation-xml",
    "maction",
    "math",
    "merror",
    "mfrac",
    "mi",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mprescripts",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msubsup",
    "msup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "semantics",
];

/// Refuses an element upstream's `is_svg` or `is_mathml` names (case-sensitively).
///
/// With `<svg>` and `<math>` refused, such an element would need upstream's namespace inference,
/// which this port does not do.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the element's name.
pub fn check_foreign_element(source_text: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(source_text);
    if SVG_ELEMENTS.contains(&text) || MATHML_ELEMENTS.contains(&text) {
        return Err(Diagnostic::error(
            "unsupported",
            format!("`<{text}>` outside `<svg>` or `<math>` is not supported yet"),
            name,
        ));
    }
    Ok(())
}

const RUNES: &[&str] = &[
    "$state",
    "$state.raw",
    "$derived",
    "$derived.by",
    "$state.eager",
    "$state.snapshot",
    "$props",
    "$props.id",
    "$bindable",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$effect.pending",
    "$inspect",
    "$inspect().with",
    "$inspect.trace",
    "$host",
];

/// Refuses a `$name` reference that upstream's analysis turns into a store subscription (its
/// synthetic `store_sub` bindings); this port has no store support.
///
/// Also refuses `$$slots`, which upstream declares from `$.sanitize_slots`.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the first such reference.
pub fn check_stores(
    javascript: &SyntaxTree,
    res: &Resolution,
    source_text: &str,
    program: NodeIdentifier,
) -> Result<(), Diagnostic> {
    for r in &res.sem.references {
        if r.binding.is_some() {
            continue;
        }
        let name = javascript.name(r.node);
        if name == "$$slots" {
            let Some(span) = javascript.source_location(r.node).span() else {
                unreachable!("a reference is parsed from source")
            };
            return Err(Diagnostic::error(
                "unsupported",
                "`$$slots` is not supported yet",
                span,
            ));
        }
        let Some(store) = name.strip_prefix('$') else {
            continue;
        };
        if store.is_empty() || store.starts_with('$') {
            continue;
        }
        let declaration =
            res.sem.bindings.iter().find(|b| {
                b.scope == ScopeIdentifier::ROOT && javascript.atoms.get(b.name) == store
            });
        let store_sub = !RUNES.contains(&name)
            || declaration.is_some_and(|b| {
                let rune = b
                    .initializer(javascript)
                    .and_then(|initializer| get_rune(javascript, res, initializer));
                (rune.is_none() || (store != "props" && rune.as_deref() == Some("$props")))
                    && !(name == "$derived"
                        && b.kind == DeclarationKind::Import
                        && import_source(javascript, source_text, program, b.declaration)
                            == Some("svelte/store"))
            });
        if store_sub {
            let Some(span) = javascript.source_location(r.node).span() else {
                unreachable!("a reference is parsed from source")
            };
            return Err(Diagnostic::error(
                "unsupported",
                format!("the store subscription `{name}` is not supported yet"),
                span,
            ));
        }
    }
    Ok(())
}

/// Refuses a rune call this port does not lower, and on the server an `$effect` that is not a
/// statement of its own (upstream only drops it as an `ExpressionStatement`).
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the first such call.
pub fn check_runes(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: Target,
) -> Result<(), Diagnostic> {
    fn walk(
        javascript: &SyntaxTree,
        res: &Resolution,
        target: Target,
        e: NodeIdentifier,
        statement: bool,
    ) -> Result<(), Diagnostic> {
        if let Some(rune) = get_rune(javascript, res, e) {
            let supported = match rune.as_str() {
                "$state" | "$state.raw" | "$derived" | "$derived.by" | "$props" | "$bindable" => {
                    true
                }
                "$effect" | "$effect.pre" => statement || target == Target::Client,
                _ => false,
            };
            if !supported {
                let Some(span) = javascript.source_location(e).span() else {
                    unreachable!("a rune call is parsed from source")
                };
                return Err(Diagnostic::error(
                    "unsupported",
                    format!("`{rune}` is not supported yet"),
                    span,
                ));
            }
        }
        let mut children = Vec::new();
        javascript.for_each_child(e, |c| children.push(c));
        let statement = matches!(javascript.kind(e), Kind::ExpressionStatement(_));
        for c in children {
            walk(javascript, res, target, c, statement)?;
        }
        Ok(())
    }
    walk(input.javascript, res, target, input.program, false)?;
    for &e in input.template_expressions {
        walk(input.javascript, res, target, e, false)?;
    }
    Ok(())
}

/// Upstream `get_rune`: the rune a call's callee names through unbound globals.
fn get_rune(javascript: &SyntaxTree, res: &Resolution, e: NodeIdentifier) -> Option<String> {
    let Kind::Call { callee, .. } = javascript.kind(e) else {
        return None;
    };
    let keypath = global_keypath(javascript, res, callee)?;
    RUNES.contains(&keypath.as_str()).then_some(keypath)
}

/// Upstream `get_global_keypath`.
fn global_keypath(javascript: &SyntaxTree, res: &Resolution, e: NodeIdentifier) -> Option<String> {
    match javascript.kind(e) {
        Kind::Identifier(_) => res
            .sem
            .binding_of(e)
            .is_none()
            .then(|| javascript.name(e).to_owned()),
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } => Some(format!(
            "{}.{}",
            global_keypath(javascript, res, object)?,
            javascript.name(property)
        )),
        Kind::Call { callee, .. } => {
            Some(format!("{}()", global_keypath(javascript, res, callee)?))
        }
        _ => None,
    }
}

/// The module an import specifier of the instance script imports from.
fn import_source<'a>(
    javascript: &'a SyntaxTree,
    source_text: &'a str,
    program: NodeIdentifier,
    spec: Option<NodeIdentifier>,
) -> Option<&'a str> {
    let spec = spec?;
    let Kind::Program(body) = javascript.kind(program) else {
        return None;
    };
    body.iter()
        .find_map(|&statement| match javascript.kind(statement) {
            Kind::Import {
                specifiers, source, ..
            } if specifiers.contains(&spec) => Some(javascript.str_value(source, source_text)),
            _ => None,
        })
}

/// Upstream `binding_properties` that this port lowers, by element.
///
/// `bind:value` on `<input>` (not a checkbox, radio or file input) and `bind:checked` on a
/// checkbox, with the `type` written as static text; `bind:value` on a `<select>` whose
/// `multiple` is static.
#[must_use]
pub fn supported_binding(
    source_text: &str,
    tag: &str,
    attributes: &[Attribute],
    property: &str,
) -> bool {
    if tag != "input" && tag != "select" {
        return false;
    }
    // Upstream rejects a `multiple` that is not static on a bound `<select>`.
    let static_multiple = attributes.iter().all(|a| {
        a.name.text(source_text) != "multiple"
            || matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_))
    });
    let mut ty = Some("text");
    for a in attributes {
        if a.name.text(source_text) == "type" && !matches!(a.value, AttributeValue::Bind(_)) {
            ty = match &a.value {
                AttributeValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    match (property, ty) {
        ("value", Some(t)) if tag == "input" => !matches!(t, "checkbox" | "radio" | "file"),
        ("value", _) => tag == "select" && static_multiple,
        ("checked", Some(t)) => tag == "input" && t == "checkbox",
        _ => false,
    }
}

/// Upstream `is_event_attribute` for this port's attribute shapes.
#[must_use]
pub fn event_attribute(source_text: &str, a: &Attribute) -> Option<NodeIdentifier> {
    let expression = single_expression(&a.value)?;
    a.name
        .text(source_text)
        .starts_with("on")
        .then_some(expression)
}

/// Upstream's `needs_clsx` for a `class={expression}` written unquoted: anything but a literal, a
/// template literal or a binary expression may be an object or an array.
#[must_use]
pub fn needs_clsx(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    !matches!(
        javascript.kind(e),
        Kind::String
            | Kind::Number(_)
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::Template { .. }
            | Kind::Binary(..)
    )
}

/// A directive, a spread or an `{@attach}`: not an attribute with a name of its own.
#[must_use]
pub const fn is_directive(v: &AttributeValue) -> bool {
    matches!(
        v,
        AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::Class(_)
            | AttributeValue::Spread(_)
    )
}

/// Upstream analysis' `synthetic_value_node`: an `<option>` without a `value` attribute whose
/// only child is an expression tag takes that expression as its value.
#[must_use]
pub fn synthetic_value(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    tag: &str,
    el: &Element,
) -> Option<NodeIdentifier> {
    if tag != "option"
        || compiler_syntax_tree
            .attributes(el.attributes)
            .iter()
            .any(|a| !is_directive(&a.value) && a.name.text(source_text) == "value")
    {
        return None;
    }
    match compiler_syntax_tree.children(el.children) {
        &[only] => match compiler_syntax_tree.node(only).kind {
            NodeKind::Expression { expression } => Some(expression),
            _ => None,
        },
        _ => None,
    }
}

/// Upstream `is_customizable_select_element`: a `<select>`, `<optgroup>` or `<option>` holding
/// more than plain options and text.
#[must_use]
pub fn is_customizable_select(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    tag: &str,
    el: &Element,
) -> bool {
    fn descendants(
        compiler_syntax_tree: &CompilerSyntaxTree,
        source_text: &str,
        list: Children,
        out: &mut Vec<CompilerNodeIdentifier>,
    ) {
        for &identifier in compiler_syntax_tree.children(list) {
            match &compiler_syntax_tree.node(identifier).kind {
                NodeKind::Comment { .. } | NodeKind::Expression { .. } => {}
                NodeKind::Text { raw, decoded, .. } => {
                    let data = decoded.as_deref().unwrap_or_else(|| raw.text(source_text));
                    if !data.trim().is_empty() {
                        out.push(identifier);
                    }
                }
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    for b in compiler_syntax_tree.branches(*branches) {
                        descendants(compiler_syntax_tree, source_text, b.body, out);
                    }
                    if let Some(o) = otherwise {
                        descendants(compiler_syntax_tree, source_text, *o, out);
                    }
                }
                NodeKind::Each(each) => {
                    descendants(compiler_syntax_tree, source_text, each.body, out);
                    if let Some(f) = each.fallback {
                        descendants(compiler_syntax_tree, source_text, f, out);
                    }
                }
                NodeKind::Element(_) => out.push(identifier),
            }
        }
    }
    if !matches!(tag, "select" | "optgroup" | "option") {
        return false;
    }
    let mut found = Vec::new();
    descendants(compiler_syntax_tree, source_text, el.children, &mut found);
    found.iter().any(
        |&identifier| match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(child) => {
                let name = child.name.text(source_text);
                match tag {
                    "select" => name != "option" && name != "optgroup",
                    "optgroup" => name != "option",
                    _ => true,
                }
            }
            _ => tag != "option",
        },
    )
}

/// Upstream `is_load_error_element`.
#[must_use]
pub fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
    )
}

/// The expression of a value written as exactly one `{expression}`.
#[must_use]
pub const fn single_expression(v: &AttributeValue) -> Option<NodeIdentifier> {
    match *v {
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression) => {
            Some(expression)
        }
        _ => None,
    }
}
