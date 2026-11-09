use rsvelte_svelte_semantic::resolve::RUNES;
use rsvelte_typescript_semantic::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_typescript_syntax::syntax_tree::{Control, TypeScriptFeature, TypeScriptRuntime};

use super::{
    CompileInput, Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, Target,
    unsupported,
};

/// Refuses an element upstream's `is_svg` or `is_mathml` names (case-sensitively).
///
/// With `<svg>` and `<math>` refused, such an element would need upstream's namespace inference,
/// which this port does not do.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the element's name.
#[expect(clippy::too_many_lines, reason = "one case per foreign element name")]
pub(crate) fn check_foreign_element(source_text: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(source_text);
    if matches!(
        text,
        "altGlyph"
            | "altGlyphDef"
            | "altGlyphItem"
            | "animate"
            | "animateColor"
            | "animateMotion"
            | "animateTransform"
            | "circle"
            | "clipPath"
            | "color-profile"
            | "cursor"
            | "defs"
            | "desc"
            | "discard"
            | "ellipse"
            | "feBlend"
            | "feColorMatrix"
            | "feComponentTransfer"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feDistantLight"
            | "feDropShadow"
            | "feFlood"
            | "feFuncA"
            | "feFuncB"
            | "feFuncG"
            | "feFuncR"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "fePointLight"
            | "feSpecularLighting"
            | "feSpotLight"
            | "feTile"
            | "feTurbulence"
            | "filter"
            | "font"
            | "font-face"
            | "font-face-format"
            | "font-face-name"
            | "font-face-src"
            | "font-face-uri"
            | "foreignObject"
            | "g"
            | "glyph"
            | "glyphRef"
            | "hatch"
            | "hatchpath"
            | "hkern"
            | "image"
            | "line"
            | "linearGradient"
            | "marker"
            | "mask"
            | "mesh"
            | "meshgradient"
            | "meshpatch"
            | "meshrow"
            | "metadata"
            | "missing-glyph"
            | "mpath"
            | "path"
            | "pattern"
            | "polygon"
            | "polyline"
            | "radialGradient"
            | "rect"
            | "set"
            | "solidcolor"
            | "stop"
            | "svg"
            | "switch"
            | "symbol"
            | "text"
            | "textPath"
            | "tref"
            | "tspan"
            | "unknown"
            | "use"
            | "view"
            | "vkern"
            | "annotation"
            | "annotation-xml"
            | "maction"
            | "math"
            | "merror"
            | "mfrac"
            | "mi"
            | "mmultiscripts"
            | "mn"
            | "mo"
            | "mover"
            | "mpadded"
            | "mphantom"
            | "mprescripts"
            | "mroot"
            | "mrow"
            | "ms"
            | "mspace"
            | "msqrt"
            | "mstyle"
            | "msub"
            | "msubsup"
            | "msup"
            | "mtable"
            | "mtd"
            | "mtext"
            | "mtr"
            | "munder"
            | "munderover"
            | "semantics"
    ) {
        return unsupported(&format!("`<{text}>` outside `<svg>` or `<math>`"), name);
    }
    Ok(())
}

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
            return unsupported("`$$slots`", span);
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
            return unsupported(&format!("the store subscription `{name}`"), span);
        }
    }
    Ok(())
}

/// Refuses a rune call this port does not lower, a state rune in a class body (class fields are
/// not lowered yet), and on the server an `$effect` that is not a statement of its own (upstream
/// only drops it as an `ExpressionStatement`).
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the first such call.
pub(super) fn check_runes(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: Target,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    /// Where an expression sits.
    #[derive(Clone, Copy)]
    struct Place {
        statement: bool,
        in_class: bool,
        /// Upstream evaluates it when the component renders: the instance's top level or a
        /// template expression, outside any function.
        rendering: bool,
    }
    fn walk(
        javascript: &SyntaxTree,
        res: &Resolution,
        target: Target,
        custom_element: bool,
        e: NodeIdentifier,
        place: Place,
    ) -> Result<(), Diagnostic> {
        // A `for await` suspends rendering as an `await` does; upstream prints it into a
        // function that is not async.
        if place.rendering
            && matches!(
                javascript.kind(e),
                Kind::Await(_) | Kind::Control(Control::ForEach { is_await: true, .. })
            )
        {
            let Some(span) = javascript.source_location(e).span() else {
                unreachable!("an await is parsed from source")
            };
            return super::special::invalid(
                "experimental_async",
                "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`",
                span,
            );
        }
        if let Some(rune) = get_rune(javascript, res, e) {
            let supported = match rune.as_str() {
                "$state" | "$state.raw" | "$derived" | "$derived.by" => !place.in_class,
                "$props" | "$bindable" | "$effect.pending" | "$effect.tracking" => true,
                "$host" => custom_element,
                "$effect" | "$effect.pre" => place.statement || target == Target::Client,
                _ => false,
            };
            if !supported {
                let Some(span) = javascript.source_location(e).span() else {
                    unreachable!("a rune call is parsed from source")
                };
                return if place.in_class {
                    unsupported(&format!("`{rune}` in a class body"), span)
                } else {
                    unsupported(&format!("`{rune}`"), span)
                };
            }
        }
        if matches!(javascript.kind(e), Kind::Declarator { .. }) {
            super::script::check_destructured_rune(javascript, target, e)?;
        }
        let mut children = Vec::new();
        javascript.for_each_child(e, |c| children.push(c));
        let place = Place {
            statement: matches!(javascript.kind(e), Kind::ExpressionStatement(_)),
            in_class: place.in_class
                || matches!(
                    javascript.kind(e),
                    Kind::Class(rsvelte_typescript_syntax::syntax_tree::Class::Definition { .. })
                ),
            rendering: place.rendering
                && !matches!(
                    javascript.kind(e),
                    Kind::Function { .. } | Kind::Arrow { .. } | Kind::Class(_)
                ),
        };
        for c in children {
            walk(javascript, res, target, custom_element, c, place)?;
        }
        Ok(())
    }
    let javascript = input.component.javascript;
    let roots = input
        .component
        .module
        .map(|module| (module, false))
        .into_iter()
        .chain([(input.component.program, true)])
        .chain(
            input
                .component
                .template_expressions
                .iter()
                .map(|&e| (e, true)),
        );
    for (root, rendering) in roots {
        let place = Place {
            statement: false,
            in_class: false,
            rendering,
        };
        walk(javascript, res, target, custom_element, root, place)?;
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
