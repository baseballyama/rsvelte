//! Upstream's `declaration_duplicate` for what the template declares and for the instance's
//! imports, which its scopes see where oxc's do not.

use oxc_ast::ast::{ImportDeclarationSpecifier, Statement};
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rsvelte_svelte_semantic::warnings::{Phase, Raised, Section};

use super::super::special::error;
use super::{CompileInput, Diagnostic, Resolution, Span};
use crate::lower::NodeKind;

/// Each duplicate with when upstream raises it, as it builds the scopes.
pub(super) fn duplicates(input: &CompileInput<'_>, res: &Resolution) -> Vec<(Raised, Diagnostic)> {
    let mut out = Vec::new();
    instance_imports(input, res, &mut out);
    template(input, res, &mut out);
    out
}

fn raised(section: Section, name: &str, span: oxc_span::Span) -> (Raised, Diagnostic) {
    let span = Span::new(span.start, span.end);
    let raised = Raised {
        phase: Phase::Scopes,
        section,
        at: span.start_offset,
    };
    let message = format!("`{name}` has already been declared");
    (raised, error("declaration_duplicate", &message, span))
}

/// Upstream declares an instance's import in the module's scope.
fn instance_imports(
    input: &CompileInput<'_>,
    res: &Resolution,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let (Some(module), Some(instance)) = (input.component.module, input.component.instance) else {
        return;
    };
    let javascript = input.component.javascript;
    let scoping = res.scoping();
    let module = javascript.get_program(module);
    let Some(module_scope) = module.scope_id.get() else {
        return;
    };
    let imports = (javascript.get_program(instance).body.iter()).filter_map(|s| match s {
        // Types are erased before upstream builds its scopes.
        Statement::ImportDeclaration(import) if !import.import_kind.is_type() => {
            import.specifiers.as_ref()
        }
        _ => None,
    });
    for specifier in imports.flatten() {
        let local = match specifier {
            ImportDeclarationSpecifier::ImportSpecifier(s) if s.import_kind.is_type() => continue,
            ImportDeclarationSpecifier::ImportSpecifier(s) => &s.local,
            ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => &s.local,
            ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => &s.local,
        };
        // The scope holds what the instance imports too.
        let other = scoping.get_binding(module_scope, local.name.as_str().into());
        if other.is_some_and(|other| {
            let span = scoping.symbol_span(other);
            module.span.start <= span.start && span.end <= module.span.end
        }) {
            out.push(raised(Section::Instance, &local.name, local.span));
        }
    }
}

/// A name a `{@const}`, `{let}` or `{const}` declares again in its fragment, or that its block
/// already declares: a context, a value, a parameter or a `let:` name; at the top, a name of the
/// instance.
fn template(input: &CompileInput<'_>, res: &Resolution, out: &mut Vec<(Raised, Diagnostic)>) {
    let tree = input.component.compiler_syntax_tree;
    let javascript = input.component.javascript;
    let scoping = res.scoping();
    for node in &tree.nodes {
        let (NodeKind::Const { declaration } | NodeKind::Declaration { declaration }) = node.kind
        else {
            continue;
        };
        let declaration = javascript.get_declaration(declaration);
        let names = (declaration.declarations.iter()).flat_map(|d| d.id.get_binding_identifiers());
        for name in names {
            let Some(symbol) = name.symbol_id.get() else {
                continue;
            };
            // oxc keeps the first declaration's symbol for a name declared again.
            if scoping.symbol_span(symbol) != name.span {
                out.push(raised(Section::Template, &name.name, name.span));
                continue;
            }
            let Some(block) = scoping.scope_parent_id(scoping.symbol_scope_id(symbol)) else {
                continue;
            };
            let Some(other) = scoping.get_binding(block, name.name.as_str().into()) else {
                continue;
            };
            let opened = |scope| res.template_scope(scope) == Some(block);
            let at = match node.parent {
                // A `{@const}` at the top is misplaced, which upstream's parser raises first.
                None if matches!(node.kind, NodeKind::Const { .. }) => None,
                None => (block == res.instance_scope()).then_some(name.span),
                Some(parent)
                    if opened(TemplateScope::Each(parent))
                        || opened(TemplateScope::Let(parent))
                        || opened(TemplateScope::Snippet(parent)) =>
                {
                    Some(name.span)
                }
                // Upstream declares the value after it walks the branch.
                Some(parent)
                    if opened(TemplateScope::Then(parent))
                        || opened(TemplateScope::Catch(parent)) =>
                {
                    Some(scoping.symbol_span(other))
                }
                Some(_) => None,
            };
            if let Some(at) = at {
                out.push(raised(Section::Template, &name.name, at));
            }
        }
    }
}
