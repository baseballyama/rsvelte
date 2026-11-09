use rsvelte_svelte::syntax::names::{is_mathml, is_svg};
use rsvelte_typescript::syntax_tree::{TypeScriptFeature, TypeScriptRuntime};

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
pub fn check_foreign_element(source_text: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(source_text);
    if is_svg(text) || is_mathml(text) {
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
pub(super) fn check_stores(javascript: &SyntaxTree, res: &Resolution) -> Result<(), Diagnostic> {
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
        if res.is_store_subscription(name) {
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
    let javascript = input.component.javascript;
    // Pre-order from a stack of `(node, parent is a statement, in a class body)`: expressions nest
    // thousands deep in real input.
    let mut pending: Vec<(NodeIdentifier, bool, bool)> = Vec::new();
    let roots = input
        .component
        .module
        .into_iter()
        .chain([input.component.program]);
    for root in roots.chain(input.component.template_expressions.iter().copied()) {
        pending.push((root, false, false));
        while let Some((e, statement, in_class)) = pending.pop() {
            if let Some((rune, _)) = res.rune(javascript, e) {
                check_rune(
                    javascript,
                    e,
                    rune,
                    statement,
                    in_class,
                    target,
                    custom_element,
                )?;
            }
            let kind = javascript.kind(e);
            if matches!(kind, Kind::Declarator { .. }) {
                super::script::check_destructured_rune(javascript, res, target, e)?;
            }
            let statement = matches!(kind, Kind::ExpressionStatement(_));
            let in_class = in_class
                || matches!(
                    kind,
                    Kind::Class(rsvelte_typescript::syntax_tree::Class::Definition { .. })
                );
            let base = pending.len();
            javascript.for_each_child(e, |c| pending.push((c, statement, in_class)));
            pending[base..].reverse();
        }
    }
    Ok(())
}

/// Refuses the rune call `e` where this port does not lower it.
fn check_rune(
    javascript: &SyntaxTree,
    e: NodeIdentifier,
    rune: &str,
    statement: bool,
    in_class: bool,
    target: Target,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    let supported = match rune {
        "$state" | "$state.raw" | "$derived" | "$derived.by" => !in_class,
        "$props" | "$bindable" | "$effect.pending" | "$effect.tracking" => true,
        "$host" => custom_element,
        "$effect" | "$effect.pre" => statement || target == Target::Client,
        _ => false,
    };
    if supported {
        return Ok(());
    }
    let Some(span) = javascript.source_location(e).span() else {
        unreachable!("a rune call is parsed from source")
    };
    if in_class {
        unsupported(&format!("`{rune}` in a class body"), span)
    } else {
        unsupported(&format!("`{rune}`"), span)
    }
}

pub(super) fn check_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    if let Some(runtime) = input.component.javascript.typescript_runtime.first() {
        return Err(typescript_invalid_feature(runtime));
    }
    Ok(())
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value; what it
/// keeps for esrap to print, this compiler does not lower.
fn typescript_invalid_feature(t: &TypeScriptRuntime) -> Diagnostic {
    let feature = match t.feature {
        TypeScriptFeature::Enum => "enums",
        TypeScriptFeature::NamespaceWithValues => "namespaces with non-type nodes",
        TypeScriptFeature::Decorator => "decorators (related TSC proposal is not stage 4 yet)",
        TypeScriptFeature::Accessor => "accessor fields (related TSC proposal is not stage 4 yet)",
        TypeScriptFeature::ParameterProperty => "accessibility modifiers on constructor parameters",
        TypeScriptFeature::ImportEquals => {
            return Diagnostic::error(
                "unsupported",
                "`import name = …` is not supported yet",
                t.span,
            );
        }
        TypeScriptFeature::ExportAssignment => {
            return Diagnostic::error("unsupported", "`export = …` is not supported yet", t.span);
        }
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
