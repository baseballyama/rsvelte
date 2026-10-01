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

use rsv_js::scope::{DeclKind, ScopeId};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::Span;
use rustc_hash::FxHashMap;

use crate::hir::{AttrValue, Attribute, Children, Hir, HirId, NodeKind};
use crate::resolve::{BindKind, Resolution};

/// A component as the compiler reads it, whatever syntax it was written in.
#[derive(Clone, Copy, Debug)]
pub struct CompileInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub js: &'a Ast,
    /// The instance script's program, or an empty one.
    pub program: NodeId,
    pub hir: &'a Hir,
    pub style: Option<&'a rsv_css::StyleSheet>,
    /// Every template expression, in document order.
    pub template_exprs: &'a [NodeId],
    /// The document: HIR spans index into it.
    pub src: &'a str,
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
    Node(HirId),
    /// An `{expression}` tag, or an expression chunk of an attribute value.
    Expr(NodeId),
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
pub fn clean_nodes<'a>(
    hir: &'a Hir,
    src: &'a str,
    parent: Parent<'_>,
    list: &[HirId],
    preserve_ws: bool,
) -> Cleaned<'a> {
    let mut regular: Vec<Item<'a>> = Vec::with_capacity(list.len());
    for &id in list {
        match &hir.node(id).kind {
            NodeKind::Comment { .. } => {}
            NodeKind::Text {
                raw,
                decoded,
                spelled,
            } => {
                let raw = raw.text(src);
                let data = decoded.as_deref().unwrap_or(raw);
                regular.push(Item::Text {
                    data: Cow::Borrowed(data),
                    raw: if *spelled {
                        escape_html(data, false)
                    } else {
                        Cow::Borrowed(raw)
                    },
                });
            }
            NodeKind::Expr { expr } => regular.push(Item::Expr(*expr)),
            NodeKind::Element(_) | NodeKind::If { .. } | NodeKind::Each(_) => {
                regular.push(Item::Node(id));
            }
        }
    }
    let is_expr = |i: Option<&Item<'_>>| matches!(i, Some(Item::Expr(_)));

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
            let prev_is_expr = i > 0 && is_expr(regular.get(i - 1));
            let prev_text_ends_ws = i > 0
                && matches!(&regular[i - 1], Item::Text { data, .. } if data.ends_with(is_ws));
            let next_is_expr = is_expr(regular.get(i + 1));
            let item = &mut regular[i];
            if let Item::Text { data, raw } = item {
                if !prev_is_expr {
                    let with = if prev_text_ends_ws { "" } else { " " };
                    *data = replace_leading_ws(data, with);
                    *raw = replace_leading_ws(raw, with);
                }
                if !next_is_expr {
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
        && matches!(trimmed.first(), Some(Item::Text { .. } | Item::Expr(_)));
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
pub fn escape_html(s: &str, is_attr: bool) -> Cow<'_, str> {
    let needs = |c: char| c == '&' || c == '<' || (is_attr && c == '"');
    if !s.contains(needs) {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 8);
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '"' if is_attr => out.push_str("&quot;"),
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
pub fn each_index_names(hir: &Hir, names: &mut names::Names) -> FxHashMap<HirId, String> {
    fn walk(
        hir: &Hir,
        list: Children,
        names: &mut names::Names,
        out: &mut FxHashMap<HirId, String>,
    ) {
        for &id in hir.children(list) {
            match &hir.node(id).kind {
                NodeKind::Element(el) => walk(hir, el.children, names, out),
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    for b in hir.branches(*branches) {
                        walk(hir, b.body, names, out);
                    }
                    if let Some(o) = otherwise {
                        walk(hir, *o, names, out);
                    }
                }
                NodeKind::Each(each) => {
                    if let Some(f) = each.fallback {
                        walk(hir, f, names, out);
                    }
                    walk(hir, each.body, names, out);
                    out.insert(id, names.unique("$$index"));
                }
                NodeKind::Text { .. } | NodeKind::Comment { .. } | NodeKind::Expr { .. } => {}
            }
        }
    }
    let mut out = FxHashMap::default();
    walk(hir, hir.root, names, &mut out);
    out
}

/// Upstream's `EACH_ITEM_REACTIVE` test: the collection reads a binding (references inside a
/// function of the expression are not its dependencies).
#[must_use]
pub fn has_dependency(js: &Ast, res: &Resolution, e: NodeId) -> bool {
    match js.kind(e) {
        Kind::Ident(_) => res
            .binding(e)
            .is_some_and(|(b, _)| res.sem.bindings[b].node != e),
        Kind::Function { .. } | Kind::Arrow { .. } => false,
        _ => {
            let mut any = false;
            js.for_each_child(e, |c| any = any || has_dependency(js, res, c));
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
    js: &Ast,
    res: &Resolution,
    src: &str,
    tag: &str,
    attrs: &[Attribute],
    a: &Attribute,
) -> Result<NodeId, Diagnostic> {
    let AttrValue::Bind(e) = a.value else {
        unreachable!("called on bindings")
    };
    let unsupported = |what: String, span: Span| {
        Err(Diagnostic::error(
            "unsupported",
            format!("{what} is not supported yet"),
            span,
        ))
    };
    let property = a.name.text(src);
    if !supported_binding(src, tag, attrs, property) {
        return unsupported(format!("`bind:{property}` on this `<{tag}>`"), a.span);
    }
    let beside = attrs
        .iter()
        .any(|o| !std::ptr::eq(o, a) && matches!(o.name.text(src), "value" | "checked" | "group"));
    if beside {
        return unsupported(
            "a binding beside a `value`, `checked` or `group` attribute".into(),
            a.span,
        );
    }
    let mut root = e;
    while let Kind::Member { object, .. } = js.kind(root) {
        root = object;
    }
    let kind = matches!(js.kind(root), Kind::Ident(_))
        .then(|| res.binding(root).map(|(_, info)| info.kind))
        .flatten();
    let member = root != e;
    let ok = match kind {
        Some(BindKind::State | BindKind::RawState) => true,
        Some(BindKind::Each) => member,
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
pub fn check_foreign_element(src: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(src);
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
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the first such reference.
pub fn check_stores(
    js: &Ast,
    res: &Resolution,
    src: &str,
    program: NodeId,
) -> Result<(), Diagnostic> {
    for r in &res.sem.references {
        if r.binding.is_some() {
            continue;
        }
        let name = js.name(r.node);
        let Some(store) = name.strip_prefix('$') else {
            continue;
        };
        if store.is_empty() || store.starts_with('$') {
            continue;
        }
        let declaration = res
            .sem
            .bindings
            .iter()
            .find(|b| b.scope == ScopeId::ROOT && js.atoms.get(b.name) == store);
        let store_sub = !RUNES.contains(&name)
            || declaration.is_some_and(|b| {
                let rune = b.init(js).and_then(|init| get_rune(js, res, init));
                (rune.is_none() || (store != "props" && rune.as_deref() == Some("$props")))
                    && !(name == "$derived"
                        && b.kind == DeclKind::Import
                        && import_source(js, src, program, b.decl) == Some("svelte/store"))
            });
        if store_sub {
            let Some(span) = js.loc(r.node).span() else {
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

/// Upstream `get_rune`: the rune a call's callee names through unbound globals.
fn get_rune(js: &Ast, res: &Resolution, e: NodeId) -> Option<String> {
    let Kind::Call { callee, .. } = js.kind(e) else {
        return None;
    };
    let keypath = global_keypath(js, res, callee)?;
    RUNES.contains(&keypath.as_str()).then_some(keypath)
}

/// Upstream `get_global_keypath`.
fn global_keypath(js: &Ast, res: &Resolution, e: NodeId) -> Option<String> {
    match js.kind(e) {
        Kind::Ident(_) => res
            .sem
            .binding_of(e)
            .is_none()
            .then(|| js.name(e).to_owned()),
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } => Some(format!(
            "{}.{}",
            global_keypath(js, res, object)?,
            js.name(property)
        )),
        Kind::Call { callee, .. } => Some(format!("{}()", global_keypath(js, res, callee)?)),
        _ => None,
    }
}

/// The module an import specifier of the instance script imports from.
fn import_source<'a>(
    js: &'a Ast,
    src: &'a str,
    program: NodeId,
    spec: Option<NodeId>,
) -> Option<&'a str> {
    let spec = spec?;
    let Kind::Program(body) = js.kind(program) else {
        return None;
    };
    body.iter().find_map(|&stmt| match js.kind(stmt) {
        Kind::Import {
            specifiers, source, ..
        } if specifiers.contains(&spec) => Some(js.str_value(source, src)),
        _ => None,
    })
}

/// Upstream `binding_properties` that this port lowers, by element.
///
/// `bind:value` on `<input>` (not a checkbox, radio or file input) and `bind:checked` on a
/// checkbox, with the `type` written as static text.
#[must_use]
pub fn supported_binding(src: &str, tag: &str, attrs: &[Attribute], property: &str) -> bool {
    if tag != "input" {
        return false;
    }
    let mut ty = Some("text");
    for a in attrs {
        if a.name.text(src) == "type" && !matches!(a.value, AttrValue::Bind(_)) {
            ty = match &a.value {
                AttrValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    match (property, ty) {
        ("value", Some(t)) => !matches!(t, "checkbox" | "radio" | "file"),
        ("checked", Some(t)) => t == "checkbox",
        _ => false,
    }
}

/// Upstream `is_event_attribute` for this port's attribute shapes.
#[must_use]
pub fn event_attribute(src: &str, a: &Attribute) -> Option<NodeId> {
    let expr = single_expression(&a.value)?;
    a.name.text(src).starts_with("on").then_some(expr)
}

/// The expression of a value written as exactly one `{expression}`.
#[must_use]
pub const fn single_expression(v: &AttrValue) -> Option<NodeId> {
    match *v {
        AttrValue::Expression { expr, .. } | AttrValue::Shorthand(expr) => Some(expr),
        _ => None,
    }
}
