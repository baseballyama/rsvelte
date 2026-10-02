use rsvelte_typescript::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_typescript::syntax_tree::{TypeScriptFeature, TypeScriptRuntime};

use super::{CompileInput, Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, Target};

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
pub(super) fn check_stores(
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
pub(super) fn check_runes(
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
    walk(
        input.component.javascript,
        res,
        target,
        input.component.program,
        false,
    )?;
    for &e in input.component.template_expressions {
        walk(input.component.javascript, res, target, e, false)?;
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

pub(super) fn check_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    if let Some(runtime) = input.component.javascript.typescript_runtime.first() {
        return Err(typescript_invalid_feature(runtime));
    }
    Ok(())
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value.
fn typescript_invalid_feature(t: &TypeScriptRuntime) -> Diagnostic {
    let feature = match t.feature {
        TypeScriptFeature::Enum => "enums",
        TypeScriptFeature::NamespaceWithValues => "namespaces with non-type nodes",
    };
    Diagnostic::error(
        "typescript_invalid_feature",
        format!(
            "TypeScript language features like {feature} are not natively supported, and their \
             use is generally discouraged. Outside of `<script>` tags, these features are not \
             supported. For use within `<script>` tags, you will need to use a preprocessor to \
             convert it to JavaScript before it gets passed to the Svelte compiler. If you are \
             using `vitePreprocess`, make sure to specifically enable preprocessing script tags \
             (`vitePreprocess({{ script: true }})`)\n\
             https://svelte.dev/e/typescript_invalid_feature"
        ),
        t.span,
    )
}
