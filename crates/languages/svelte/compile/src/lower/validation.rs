use rsvelte_svelte_semantic::compiler_syntax_tree::NodeKind;
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};
use rsvelte_typescript_semantic::scope::{Binding, DeclarationKind, ScopeIdentifier, Semantic};
use rsvelte_typescript_syntax::syntax_tree::{
    Class, Control, TypeScriptFeature, TypeScriptRuntime, flag,
};
use rustc_hash::FxHashSet;

pub(super) mod markup;
mod runes;

pub(super) use runes::check_runes;

use super::{
    CompileInput, Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, span_of,
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
pub(crate) fn check_foreign_element(source_text: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(source_text);
    if is_svg(text) || is_mathml(text) {
        return unsupported(&format!("`<{text}>` outside `<svg>` or `<math>`"), name);
    }
    Ok(())
}

/// Upstream's name errors in runes mode, in its order: `validate_identifier_name` where the scope
/// declares a name, `$$props` and `$$restProps`, then `validate_identifier_name` where the
/// analysis walk meets a declaration.
///
/// # Errors
///
/// `dollar_binding_invalid`, `dollar_prefix_invalid`, `legacy_props_invalid` or
/// `legacy_rest_props_invalid` at the first such name.
pub(super) fn check_names(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let mut reserved = res
        .sem
        .bindings
        .iter()
        .filter(|b| {
            javascript.atoms.get(b.name).starts_with('$')
                && !matches!(b.kind, DeclarationKind::Param | DeclarationKind::Host)
        })
        .peekable();
    if reserved.peek().is_some() {
        let unchecked = unchecked_declarations(input);
        let reserved: Vec<&Binding> = reserved
            .filter(|b| {
                !unchecked.contains(&b.node)
                    && !b.declaration.is_some_and(|d| unchecked.contains(&d))
                    && !names_class_expression(javascript, &res.sem, b)
            })
            .collect();
        // The scope checks names down to function depth 1: the module's function bodies and the
        // instance's top level.
        if let Some(b) = reserved
            .iter()
            .find(|b| function_depth(javascript, &res.sem, b) <= 1)
        {
            return reserved_name(javascript, b);
        }
        check_legacy_props(javascript, res)?;
        if let Some(b) = reserved.iter().find(|b| {
            b.declaration.is_some()
                || !(names_function_expression(javascript, &res.sem, b)
                    || is_catch_parameter(javascript, &res.sem, b))
        }) {
            return reserved_name(javascript, b);
        }
        return Ok(());
    }
    check_legacy_props(javascript, res)
}

/// Upstream `legacy_props_invalid` and `legacy_rest_props_invalid` at a name no script declares.
fn check_legacy_props(javascript: &SyntaxTree, res: &Resolution) -> Result<(), Diagnostic> {
    for r in res.sem.references.iter().filter(|r| r.binding.is_none()) {
        let (code, message) = match javascript.name(r.node) {
            "$$props" => ("legacy_props_invalid", "Cannot use `$$props` in runes mode"),
            "$$restProps" => (
                "legacy_rest_props_invalid",
                "Cannot use `$$restProps` in runes mode",
            ),
            _ => continue,
        };
        return super::special::invalid(code, message, span_of(javascript, r.node));
    }
    Ok(())
}

fn reserved_name<T>(javascript: &SyntaxTree, b: &Binding) -> Result<T, Diagnostic> {
    let span = span_of(javascript, b.node);
    if javascript.atoms.get(b.name) == "$" {
        super::special::invalid(
            "dollar_binding_invalid",
            "The $ name is reserved, and cannot be used for variables and imports",
            span,
        )
    } else {
        super::special::invalid(
            "dollar_prefix_invalid",
            "The $ prefix is reserved, and cannot be used for variables and imports",
            span,
        )
    }
}

/// Upstream `function_depth` where `b` is declared: 0 in the module script and 1 in the instance,
/// plus one per function body around it. A function expression's name is outside its body.
fn function_depth(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> usize {
    let mut depth = 0;
    let mut scope = b.scope;
    loop {
        if scope == ScopeIdentifier::ROOT {
            depth += 1;
            break;
        }
        let Some(parent) = sem.scopes[scope].parent else {
            break;
        };
        depth += usize::from(sem.scopes[scope].function);
        scope = parent;
    }
    depth - usize::from(names_function_expression(javascript, sem, b))
}

/// The name of the function expression whose scope declares it.
fn names_function_expression(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> bool {
    let node = sem.scopes[b.scope].node;
    !node.is_none()
        && matches!(
            javascript.kind(node),
            Kind::Function { name: Some(name), declaration: false, .. } if name == b.node
        )
}

/// A catch clause's parameter, which no declaration the analysis walk visits declares.
fn is_catch_parameter(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> bool {
    let node = sem.scopes[b.scope].node;
    !node.is_none() && matches!(javascript.kind(node), Kind::Control(Control::Catch { .. }))
}

/// A class expression's name, which the class's own scope declares.
fn names_class_expression(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> bool {
    let node = sem.scopes[b.scope].node;
    !node.is_none()
        && matches!(
            javascript.kind(node),
            Kind::Class(Class::Definition {
                name: Some(name),
                declaration: false,
                ..
            }) if name == b.node
        )
}

/// The names and declarators upstream never checks besides a class expression's name: a snippet's
/// name, a `{@const}` and a type-only import.
fn unchecked_declarations(input: &CompileInput<'_>) -> FxHashSet<NodeIdentifier> {
    let javascript = input.component.javascript;
    let mut unchecked = FxHashSet::default();
    for n in &input.component.compiler_syntax_tree.nodes {
        match &n.kind {
            NodeKind::Snippet(s) => {
                unchecked.insert(s.name);
            }
            &NodeKind::Const { declaration } => {
                if let Kind::VariableDeclaration { declarations, .. } = javascript.kind(declaration)
                {
                    unchecked.extend(declarations.iter().copied());
                }
            }
            _ => {}
        }
    }
    for program in input
        .component
        .module
        .into_iter()
        .chain([input.component.program])
    {
        let Kind::Program(statements) = javascript.kind(program) else {
            continue;
        };
        for &statement in statements {
            if let Kind::Import {
                specifiers,
                type_only,
                ..
            } = javascript.kind(statement)
            {
                unchecked.extend(specifiers.iter().copied().filter(|&specifier| {
                    type_only || javascript.flags(specifier) & flag::TYPE_ONLY != 0
                }));
            }
        }
    }
    unchecked
}

/// Refuses a `$name` reference that upstream's analysis turns into a store subscription (its
/// synthetic `store_sub` bindings); this port has no store support.
///
/// Also refuses `$$slots`, which upstream declares from `$.sanitize_slots`.
///
/// # Errors
///
/// Upstream's `global_reference_invalid` for an undeclared store, or an `unsupported`
/// [`Diagnostic`], at the first such reference.
pub(super) fn check_stores(
    javascript: &SyntaxTree,
    res: &Resolution,
    program: NodeIdentifier,
) -> Result<(), Diagnostic> {
    let instance = res.sem.scope_of(program).unwrap_or(ScopeIdentifier::ROOT);
    for r in &res.sem.references {
        if r.binding.is_some() {
            continue;
        }
        let name = javascript.name(r.node);
        if name == "$$slots" {
            return unsupported("`$$slots`", span_of(javascript, r.node));
        }
        if res.is_store_subscription(name) {
            // In runes mode upstream reads an undeclared lowercase store as a misspelt global.
            let store = &name[1..];
            let declared = (javascript.atoms.lookup(store))
                .is_some_and(|atom| res.sem.lookup(instance, atom).is_some());
            if !declared && store.starts_with(|c: char| c.is_ascii_lowercase()) {
                return super::special::invalid(
                    "global_reference_invalid",
                    &format!(
                        "`{name}` is an illegal variable name. To reference a global variable called `{name}`, use `globalThis.{name}`"
                    ),
                    span_of(javascript, r.node),
                );
            }
            return unsupported(
                &format!("the store subscription `{name}`"),
                span_of(javascript, r.node),
            );
        }
    }
    Ok(())
}

/// Upstream `state_invalid_placement`, which the rune walk and the markup walk both raise.
fn state_invalid_placement<T>(rune: &str, span: Span) -> Result<T, Diagnostic> {
    super::special::invalid(
        "state_invalid_placement",
        &format!(
            "`{rune}(...)` can only be used as a variable declaration initializer, a class field \
             declaration, or the first assignment to a class field at the top level of the \
             constructor."
        ),
        span,
    )
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
