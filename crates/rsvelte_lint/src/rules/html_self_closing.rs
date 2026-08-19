//! `svelte/html-self-closing` — enforce or forbid self-closing tags per element
//! category.
//!
//! Each element is classified into one of six categories and configured with
//! `"always"` (must self-close when empty), `"never"` (must not self-close), or
//! `"ignore"`:
//! - `void` (default `"always"`) — HTML void elements (`<img>`, `<br>`, …).
//! - `normal` (default `"never"`) — ordinary HTML elements.
//! - `svg` (default `"always"`) — SVG elements.
//! - `math` (default `"never"`) — `MathML` elements.
//! - `component` (default `"always"`) — Svelte components (`<Foo>`, `<a.b.C>`).
//! - `svelte` (default `"always"`) — Svelte special elements (`<svelte:head>`,
//!   `<svelte:element>`, …).
//!
//! The single option may instead be a preset string: `"all"` (everything
//! `"always"`), `"html"` (HTML/SVG/svelte `"always"`, normal/math/component
//! `"never"`), or `"none"` (everything `"never"`).
//!
//! Only **empty** elements (no children, or only whitespace text) are checked.
//!
//! Port of `eslint-plugin-svelte/src/rules/html-self-closing.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'layout'`.

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement, TemplateNode, TitleElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};
use crate::rules::js_whitespace::is_js_whitespace;
use crate::rules::this_attr::oracle_this_attr_span;

static META: RuleMeta = RuleMeta {
    name: "svelte/html-self-closing",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce self-closing style",
    options_schema: Some(
        r#"[{"anyOf":[{"properties":{"void":{"enum":["never","always","ignore"]},"normal":{"enum":["never","always","ignore"]},"svg":{"enum":["never","always","ignore"]},"math":{"enum":["never","always","ignore"]},"component":{"enum":["never","always","ignore"]},"svelte":{"enum":["never","always","ignore"]}},"additionalProperties":false},{"enum":["all","html","none"]}]}]"#,
    ),
};

const VOID_ELEMENTS: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem",
    "meta", "param", "source", "track", "wbr",
];

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

#[derive(Clone, Copy, PartialEq, Eq)]
enum Setting {
    Always,
    Never,
    Ignore,
}

impl Setting {
    fn parse(s: &str) -> Option<Self> {
        match s {
            "always" => Some(Self::Always),
            "never" => Some(Self::Never),
            "ignore" => Some(Self::Ignore),
            _ => None,
        }
    }
}

#[derive(Clone, Copy)]
struct Options {
    void: Setting,
    normal: Setting,
    svg: Setting,
    math: Setting,
    component: Setting,
    svelte: Setting,
}

impl Options {
    fn resolve(ctx: &LintContext) -> Self {
        // Defaults.
        let mut opts = Self {
            void: Setting::Always,
            normal: Setting::Never,
            svg: Setting::Always,
            math: Setting::Never,
            component: Setting::Always,
            svelte: Setting::Always,
        };

        let Some(opt) = ctx.option0() else {
            return opts;
        };

        if let Some(preset) = opt.as_str() {
            match preset {
                "all" => {
                    opts = Self {
                        void: Setting::Always,
                        normal: Setting::Always,
                        svg: Setting::Always,
                        math: Setting::Always,
                        component: Setting::Always,
                        svelte: Setting::Always,
                    }
                }
                "html" => {
                    opts = Self {
                        void: Setting::Always,
                        normal: Setting::Never,
                        svg: Setting::Always,
                        math: Setting::Never,
                        component: Setting::Never,
                        svelte: Setting::Always,
                    }
                }
                "none" => {
                    opts = Self {
                        void: Setting::Never,
                        normal: Setting::Never,
                        svg: Setting::Never,
                        math: Setting::Never,
                        component: Setting::Never,
                        svelte: Setting::Never,
                    }
                }
                _ => {}
            }
            return opts;
        }

        if let Some(map) = opt.as_object() {
            let apply = |key: &str, slot: &mut Setting| {
                if let Some(v) = map.get(key).and_then(|v| v.as_str())
                    && let Some(s) = Setting::parse(v)
                {
                    *slot = s;
                }
            };
            apply("void", &mut opts.void);
            apply("normal", &mut opts.normal);
            apply("svg", &mut opts.svg);
            apply("math", &mut opts.math);
            apply("component", &mut opts.component);
            apply("svelte", &mut opts.svelte);
        }

        opts
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ElementType {
    Normal,
    Void,
    Svg,
    Math,
    Component,
    Svelte,
}

impl ElementType {
    const fn message(self) -> &'static str {
        match self {
            Self::Normal => "HTML elements",
            Self::Void => "HTML void elements",
            Self::Svg => "SVG elements",
            Self::Math => "MathML elements",
            Self::Component => "Svelte custom components",
            Self::Svelte => "Svelte special elements",
        }
    }

    const fn setting(self, opts: Options) -> Setting {
        match self {
            Self::Normal => opts.normal,
            Self::Void => opts.void,
            Self::Svg => opts.svg,
            Self::Math => opts.math,
            Self::Component => opts.component,
            Self::Svelte => opts.svelte,
        }
    }
}

/// Classify a plain HTML element name into void/svg/math/normal.
fn html_element_type(name: &str) -> ElementType {
    if VOID_ELEMENTS.contains(&name) {
        ElementType::Void
    } else if SVG_ELEMENTS.contains(&name) {
        ElementType::Svg
    } else if MATHML_ELEMENTS.contains(&name) {
        ElementType::Math
    } else {
        ElementType::Normal
    }
}

#[derive(Default)]
pub struct HtmlSelfClosing;

/// The byte offset just past the start tag's `>`, scanned from `scan_from`.
fn start_tag_end(src: &[u8], scan_from: u32) -> Option<u32> {
    let mut i = scan_from as usize;
    while i < src.len() {
        if src[i] == b'>' {
            return Some(u32::try_from(i + 1).expect("source offsets are represented as u32"));
        }
        i += 1;
    }
    None
}

const fn attr_end(a: &Attribute) -> u32 {
    match a {
        Attribute::Attribute(n) => n.end,
        Attribute::SpreadAttribute(n) => n.end,
        Attribute::AttachTag(n) => n.end,
        Attribute::BindDirective(n) => n.end,
        Attribute::OnDirective(n) => n.end,
        Attribute::ClassDirective(n) => n.end,
        Attribute::StyleDirective(n) => n.end,
        Attribute::TransitionDirective(n) => n.end,
        Attribute::AnimateDirective(n) => n.end,
        Attribute::UseDirective(n) => n.end,
        Attribute::LetDirective(n) => n.end,
    }
}

/// True when the element is empty (no children, or only whitespace text).
/// Upstream tests `/^\s*$/` — JS `\s`, so U+FEFF-only content counts as empty.
fn is_empty(children: &[TemplateNode]) -> bool {
    children.iter().all(|c| match c {
        TemplateNode::Text(t) => t.data.as_ref().chars().all(is_js_whitespace),
        _ => false,
    })
}

impl HtmlSelfClosing {
    #[allow(clippy::too_many_arguments)]
    fn check(
        ctx: &mut LintContext,
        el_start: u32,
        el_end: u32,
        name: &str,
        attributes: &[Attribute],
        children: &[TemplateNode],
        ty: ElementType,
        opts: Options,
        this_end: Option<u32>,
    ) {
        if !is_empty(children) {
            return;
        }
        let setting = ty.setting(opts);
        if setting == Setting::Ignore {
            return;
        }
        let should_be_closed = setting == Setting::Always;

        let src = ctx.source().as_bytes();
        let name_end = el_start
            + 1
            + u32::try_from(name.len()).expect("element-name widths are represented as u32");
        // Start past the reconstructed `this={…}` attribute so a `>` inside the
        // `this` expression is never taken as the tag bracket.
        let scan_from = attributes
            .last()
            .map_or(name_end, attr_end)
            .max(this_end.unwrap_or(0));
        let Some(stag_end) = start_tag_end(src, scan_from) else {
            return;
        };
        let self_closing = stag_end >= 2 && src[(stag_end - 2) as usize] == b'/';

        if should_be_closed && !self_closing {
            Self::report(ctx, el_end, stag_end, false, name, ty, true);
        } else if !should_be_closed && self_closing {
            Self::report(ctx, el_end, stag_end, true, name, ty, false);
        }
    }

    /// `self_closing` is the element's current state; `should_be_closed` is the
    /// desired direction.
    fn report(
        ctx: &mut LintContext,
        el_end: u32,
        stag_end: u32,
        self_closing: bool,
        name: &str,
        ty: ElementType,
        should_be_closed: bool,
    ) {
        // Report location start: the `/` of `/>` (self-closing) or the `>`.
        let report_start = stag_end - if self_closing { 2 } else { 1 };
        let message = if should_be_closed {
            format!("Require self-closing on {}.", ty.message())
        } else {
            format!("Disallow self-closing on {}.", ty.message())
        };

        let edits = if should_be_closed {
            // Remove children + end tag (everything after the start tag) and
            // insert `/` immediately before the start tag's `>`.
            vec![
                TextEdit {
                    start: stag_end - 1,
                    end: stag_end - 1,
                    new_text: "/".to_string(),
                },
                TextEdit {
                    start: stag_end,
                    end: el_end,
                    new_text: String::new(),
                },
            ]
        } else {
            // Remove the `/` and, for non-void elements, append a close tag.
            let mut edits = vec![TextEdit {
                start: stag_end - 2,
                end: stag_end - 1,
                new_text: String::new(),
            }];
            if ty != ElementType::Void {
                edits.push(TextEdit {
                    start: el_end,
                    end: el_end,
                    new_text: format!("</{name}>"),
                });
            }
            edits
        };

        ctx.report_with_fix(
            report_start,
            el_end,
            message,
            Fix {
                message: "Fix self-closing style".to_string(),
                edits,
            },
        );
    }
}

impl Rule for HtmlSelfClosing {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        let opts = Options::resolve(ctx);
        let ty = html_element_type(el.name.as_str());
        Self::check(
            ctx,
            el.start,
            el.end,
            el.name.as_str(),
            &el.attributes,
            &el.fragment.nodes,
            ty,
            opts,
            None,
        );
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        let opts = Options::resolve(ctx);
        Self::check(
            ctx,
            c.start,
            c.end,
            c.name.as_str(),
            &c.attributes,
            &c.fragment.nodes,
            ElementType::Component,
            opts,
            None,
        );
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        // `<slot>` is a plain HTML element to svelte-eslint-parser (name "slot",
        // not void/svg/math → the "normal" category), so `<slot />` is subject
        // to the rule like any other non-void element.
        let opts = Options::resolve(ctx);
        let ty = html_element_type(el.name.as_str());
        Self::check(
            ctx,
            el.start,
            el.end,
            el.name.as_str(),
            &el.attributes,
            &el.fragment.nodes,
            ty,
            opts,
            None,
        );
    }

    fn check_title(&self, ctx: &mut LintContext, el: &TitleElement) {
        // `<title>` is a plain HTML element to svelte-eslint-parser.
        let opts = Options::resolve(ctx);
        let ty = html_element_type("title");
        Self::check(
            ctx,
            el.start,
            el.end,
            "title",
            &el.attributes,
            &el.fragment.nodes,
            ty,
            opts,
            None,
        );
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        let opts = Options::resolve(ctx);
        Self::check(
            ctx,
            el.start,
            el.end,
            el.name.as_str(),
            &el.attributes,
            &el.fragment.nodes,
            ElementType::Svelte,
            opts,
            None,
        );
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, c: &SvelteComponentElement) {
        let opts = Options::resolve(ctx);
        let this_end = oracle_this_attr_span(ctx.source(), c.start).map(|(_, end)| end);
        Self::check(
            ctx,
            c.start,
            c.end,
            c.name.as_str(),
            &c.attributes,
            &c.fragment.nodes,
            ElementType::Svelte,
            opts,
            this_end,
        );
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, e: &SvelteDynamicElement) {
        let opts = Options::resolve(ctx);
        let this_end = oracle_this_attr_span(ctx.source(), e.start).map(|(_, end)| end);
        Self::check(
            ctx,
            e.start,
            e.end,
            e.name.as_str(),
            &e.attributes,
            &e.fragment.nodes,
            ElementType::Svelte,
            opts,
            this_end,
        );
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        let opts = Options::resolve(ctx);
        let ty = match el.name {
            "svelte:options" => ElementType::Svelte,
            "style" => ElementType::Normal,
            _ => return, // script: skip
        };
        Self::check(
            ctx,
            el.start,
            el.end,
            el.name,
            &el.attributes,
            &[],
            ty,
            opts,
            None,
        );
    }
}
