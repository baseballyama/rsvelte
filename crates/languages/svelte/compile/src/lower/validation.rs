use oxc_ast::AstKind;
use oxc_ast::ast::Ident;
use oxc_semantic::SymbolId;
use oxc_syntax::symbol::SymbolFlags;
use rsvelte_svelte_semantic::compiler_syntax_tree::NodeKind;
use rsvelte_svelte_semantic::warnings::{Phase, Raised, Section};
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};
use rsvelte_typescript_compile::features::{Feature, first_runtime_feature};
use rsvelte_typescript_tree::ProgramIdentifier;
use rustc_hash::FxHashSet;

pub(super) mod markup;
mod runes;

pub(super) use runes::{check_runes, rejects_binding};

use super::{CompileInput, Diagnostic, Resolution, Span, unsupported};

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

/// Upstream's analysis errors in its order: `validate_identifier_name` where the scope declares a
/// name, then the template's scopes, `$$props` and `$$restProps`, then `validate_identifier_name`
/// where the analysis walk meets a declaration, then the template's walk. `template` holds the
/// template's errors that the walk over elements does not find.
///
/// # Errors
///
/// The first such error.
pub(super) fn check_analysis(
    input: &CompileInput<'_>,
    res: &Resolution,
    mut template: Vec<(Raised, Diagnostic)>,
) -> Result<(), Diagnostic> {
    if let Err(error) = markup::check(input) {
        let raised = Raised {
            phase: Phase::Walk,
            section: Section::Template,
            at: error.span.start_offset,
        };
        template.push((raised, error));
    }
    template.sort_by_key(|&(raised, _)| raised);
    let mut template = template.into_iter().peekable();
    let scopes = template.next_if(|(raised, _)| raised.phase == Phase::Scopes);
    let scoping = res.scoping();
    // TypeScript erases types and type-only imports before upstream builds its scopes.
    let erased = SymbolFlags::TypeAlias
        | SymbolFlags::Interface
        | SymbolFlags::TypeParameter
        | SymbolFlags::EnumMember
        | SymbolFlags::NamespaceModule
        | SymbolFlags::ValueModule
        | SymbolFlags::TypeImport;
    let mut reserved = scoping
        .symbol_ids()
        .filter(|&s| {
            scoping.symbol_name(s).starts_with('$') && !scoping.symbol_flags(s).intersects(erased)
        })
        .peekable();
    let unchecked = if reserved.peek().is_none() {
        FxHashSet::default()
    } else {
        unchecked_symbols(input, res)
    };
    let reserved: Vec<(SymbolId, Script)> = reserved
        .filter(|&s| !unchecked.contains(&s) && !names_class_expression(res, s))
        .filter_map(|s| Some((s, script_of(input, res, s)?)))
        .filter(|&(s, _)| !is_parameter(res, s))
        .collect();
    // The scope checks names down to function depth 1: the module's function bodies and the
    // instance's top level.
    if let Some(&(s, _)) = reserved
        .iter()
        .find(|&&(s, script)| function_depth(res, s, script) <= 1)
    {
        return reserved_name(res, s);
    }
    if let Some((_, error)) = scopes {
        return Err(error);
    }
    check_legacy_props(res)?;
    if let Some(&(s, _)) = reserved
        .iter()
        .find(|&&(s, _)| !(names_function_expression(res, s) || is_catch_parameter(res, s)))
    {
        return reserved_name(res, s);
    }
    template.next().map_or(Ok(()), |(_, error)| Err(error))
}

/// The script that declares a name; the template's names are never checked.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Script {
    Module,
    Instance,
}

fn script_of(input: &CompileInput<'_>, res: &Resolution, symbol: SymbolId) -> Option<Script> {
    let at = res.scoping().symbol_span(symbol);
    let contains = |program: Option<ProgramIdentifier>| {
        program.is_some_and(|p| {
            let span = input.component.javascript.get_program(p).span;
            span.start <= at.start && at.end <= span.end
        })
    };
    if contains(input.component.module) {
        Some(Script::Module)
    } else if contains(input.component.instance) {
        Some(Script::Instance)
    } else {
        None
    }
}

/// A function's or a catch clause's parameter, or a template pattern's name, which upstream's
/// scopes declare without a check.
fn is_parameter(res: &Resolution, symbol: SymbolId) -> bool {
    let declaration = res.scoping().symbol_declaration(symbol);
    std::iter::once(res.semantic().nodes().kind(declaration))
        .chain(res.semantic().nodes().ancestor_kinds(declaration))
        .any(|kind| {
            matches!(
                kind,
                AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_)
            )
        })
}

/// Upstream `legacy_props_invalid` and `legacy_rest_props_invalid` at a name no script declares.
fn check_legacy_props(res: &Resolution) -> Result<(), Diagnostic> {
    let first = first_unresolved(res, |name| matches!(name, "$$props" | "$$restProps"));
    let Some((name, span)) = first else {
        return Ok(());
    };
    let (code, message) = if name == "$$props" {
        ("legacy_props_invalid", "Cannot use `$$props` in runes mode")
    } else {
        (
            "legacy_rest_props_invalid",
            "Cannot use `$$restProps` in runes mode",
        )
    };
    super::special::invalid(code, message, span)
}

/// The first value reference, in document order, to a name no binding declares that `wanted`
/// takes.
fn first_unresolved(res: &Resolution, wanted: impl Fn(&str) -> bool) -> Option<(&str, Span)> {
    let scoping = res.scoping();
    scoping
        .root_unresolved_references()
        .iter()
        .filter(|(name, _)| wanted(name.as_str()))
        .flat_map(|(name, references)| {
            references
                .iter()
                .filter(|&&r| scoping.get_reference(r).flags().is_value())
                .map(move |&r| (name.as_str(), res.reference_span(r)))
        })
        .min_by_key(|(_, span)| span.start)
        .map(|(name, span)| (name, Span::new(span.start, span.end)))
}

fn reserved_name<T>(res: &Resolution, symbol: SymbolId) -> Result<T, Diagnostic> {
    let scoping = res.scoping();
    let at = scoping.symbol_span(symbol);
    let span = Span::new(at.start, at.end);
    if scoping.symbol_name(symbol) == "$" {
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

/// Upstream `function_depth` where `symbol` is declared: 0 in the module script and 1 in the
/// instance, plus one per function body around it. A function expression's name is outside its
/// body.
fn function_depth(res: &Resolution, symbol: SymbolId, script: Script) -> usize {
    let scoping = res.scoping();
    let (mut depth, program) = match script {
        Script::Module => (0, scoping.root_scope_id()),
        Script::Instance => (1, res.instance_scope()),
    };
    let mut scope = scoping.symbol_scope_id(symbol);
    while scope != program {
        depth += usize::from(res.is_function_scope(scope));
        let Some(parent) = scoping.scope_parent_id(scope) else {
            break;
        };
        scope = parent;
    }
    depth - usize::from(names_function_expression(res, symbol))
}

/// The node of the scope that declares `symbol`.
fn scope_node(res: &Resolution, symbol: SymbolId) -> AstKind<'_> {
    let scoping = res.scoping();
    res.semantic()
        .nodes()
        .kind(scoping.get_node_id(scoping.symbol_scope_id(symbol)))
}

/// The name of the function expression whose scope declares it.
fn names_function_expression(res: &Resolution, symbol: SymbolId) -> bool {
    matches!(scope_node(res, symbol), AstKind::Function(f)
        if f.is_expression() && f.id.as_ref().and_then(|id| id.symbol_id.get()) == Some(symbol))
}

/// A catch clause's parameter, which no declaration the analysis walk visits declares.
fn is_catch_parameter(res: &Resolution, symbol: SymbolId) -> bool {
    let declaration = res.scoping().symbol_declaration(symbol);
    std::iter::once(res.semantic().nodes().kind(declaration))
        .chain(res.semantic().nodes().ancestor_kinds(declaration))
        .any(|kind| matches!(kind, AstKind::CatchParameter(_)))
}

/// A class expression's name, which the class's own scope declares.
fn names_class_expression(res: &Resolution, symbol: SymbolId) -> bool {
    matches!(scope_node(res, symbol), AstKind::Class(c)
        if c.is_expression() && c.id.as_ref().and_then(|id| id.symbol_id.get()) == Some(symbol))
}

/// The names upstream never checks besides a class expression's name: a snippet's name, a
/// `let:` name and what a `{@const}` declares.
fn unchecked_symbols(input: &CompileInput<'_>, res: &Resolution) -> FxHashSet<SymbolId> {
    let javascript = input.component.javascript;
    let tree = input.component.compiler_syntax_tree;
    let mut unchecked = FxHashSet::default();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        match &node.kind {
            NodeKind::Snippet(_) => unchecked.extend(res.snippet(identifier)),
            &NodeKind::Const { declaration } => {
                for d in &javascript.get_declaration(declaration).declarations {
                    unchecked.extend(
                        d.id.get_binding_identifiers()
                            .iter()
                            .filter_map(|b| b.symbol_id.get()),
                    );
                }
            }
            NodeKind::Element(el) => {
                for attribute in el.attributes.iter() {
                    unchecked.extend(res.let_names(attribute).iter().copied());
                }
            }
            _ => {}
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
pub(super) fn check_stores(_input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let first = first_unresolved(res, |name| {
        name == "$$slots" || res.is_store_subscription(name)
    });
    let Some((name, span)) = first else {
        return Ok(());
    };
    if name == "$$slots" {
        return unsupported("`$$slots`", span);
    }
    // In runes mode upstream reads an undeclared lowercase store as a misspelt global.
    let store = &name[1..];
    let declared = res
        .scoping()
        .find_binding(res.instance_scope(), Ident::from(store))
        .is_some();
    if !declared && store.starts_with(|c: char| c.is_ascii_lowercase()) {
        return super::special::invalid(
            "global_reference_invalid",
            &format!(
                "`{name}` is an illegal variable name. To reference a global variable called `{name}`, use `globalThis.{name}`"
            ),
            span,
        );
    }
    unsupported(&format!("the store subscription `{name}`"), span)
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
    let javascript = input.component.javascript;
    let mut programs: Vec<_> = (input.component.module.into_iter())
        .chain(input.component.instance)
        .map(|p| javascript.get_program(p))
        .collect();
    // The parser met the scripts in document order.
    programs.sort_by_key(|p| p.span.start);
    match programs.into_iter().find_map(first_runtime_feature) {
        Some((feature, span)) => Err(typescript_invalid_feature(
            feature,
            Span::new(span.start, span.end),
        )),
        None => Ok(()),
    }
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value; what it
/// keeps for esrap to print, this compiler does not lower.
fn typescript_invalid_feature(feature: Feature, span: Span) -> Diagnostic {
    let feature = match feature {
        Feature::Enum => "enums",
        Feature::NamespaceWithValues => "namespaces with non-type nodes",
        Feature::Decorator => "decorators (related TSC proposal is not stage 4 yet)",
        Feature::Accessor => "accessor fields (related TSC proposal is not stage 4 yet)",
        Feature::ParameterProperty => "accessibility modifiers on constructor parameters",
        Feature::ImportEquals => {
            return Diagnostic::error(
                "unsupported",
                "`import name = …` is not supported yet",
                span,
            );
        }
        Feature::ExportAssignment => {
            return Diagnostic::error("unsupported", "`export = …` is not supported yet", span);
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
        span,
    )
}
