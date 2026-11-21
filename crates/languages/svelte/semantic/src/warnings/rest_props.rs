//! `props_illegal_name` at a `$$` member of a rest prop, which upstream's analysis
//! `MemberExpression` raises in either mode.

use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_semantic::ReferenceId;
use oxc_span::Span as OxcSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree, document_span};

use super::{Phase, Raised, Section, error};
use crate::resolve::{BindingKind, Resolution};

/// `props_illegal_name` at each `rest.$$name` or `rest[$$name]` whose object names a rest prop.
///
/// The object is read with its types erased. A rest prop is what `$props()` binds to an
/// identifier or a rest element, and outside runes mode the instance's `$$props` and
/// `$$restProps`. `instance` and `module` are the scripts' programs in `javascript`.
#[must_use]
pub fn rest_prop_member_errors(
    javascript: &Tree,
    instance: Option<ProgramIdentifier>,
    module: Option<ProgramIdentifier>,
    resolution: &Resolution,
    runes: bool,
) -> Vec<(Raised, Diagnostic)> {
    let scoping = resolution.scoping();
    let holds = |program: Option<ProgramIdentifier>, offset: u32| {
        program.is_some_and(|p| {
            let span = javascript.get_program(p).span;
            span.start <= offset && offset < span.end
        })
    };
    let section = |offset| {
        if holds(module, offset) {
            Section::Module
        } else if holds(instance, offset) {
            Section::Instance
        } else {
            Section::Template
        }
    };
    let declared = (scoping.symbol_ids())
        .filter(|&symbol| resolution.binding(symbol).kind == BindingKind::RestProperty)
        .flat_map(|symbol| scoping.get_resolved_reference_ids(symbol).iter().copied());
    // Upstream declares these in the instance's scope, which the module's does not see.
    let synthetic = ["$$props", "$$restProps"]
        .into_iter()
        .filter(|_| !runes)
        .filter_map(|name| scoping.root_unresolved_references().get(name))
        .flatten()
        .copied()
        .filter(|&reference| {
            scoping.get_reference(reference).flags().is_value()
                && section(resolution.reference_span(reference).start) != Section::Module
        });
    let mut out = Vec::new();
    for reference in declared.chain(synthetic) {
        let Some((member, property)) = dollar_member(resolution, reference) else {
            continue;
        };
        let at = document_span(member);
        let raised = Raised {
            phase: Phase::Walk,
            section: section(member.start),
            at: at.start_offset,
        };
        let message = "Declaring or accessing a prop starting with `$$` is illegal (they are \
            reserved for Svelte internals)";
        out.push((
            raised,
            error("props_illegal_name", message, document_span(property)),
        ));
    }
    out
}

/// The member whose object, its types erased, is `reference`, and that member's property, when
/// the property is an identifier whose name starts with `$$`.
fn dollar_member(resolution: &Resolution, reference: ReferenceId) -> Option<(OxcSpan, OxcSpan)> {
    let nodes = resolution.semantic().nodes();
    let node = resolution.scoping().get_reference(reference).node_id();
    let AstKind::IdentifierReference(identifier) = nodes.kind(node) else {
        return None;
    };
    let is_object = |object: &Expression<'_>| {
        matches!(object.get_inner_expression(), Expression::Identifier(inner)
            if inner.span == identifier.span)
    };
    let (member, property) = nodes.ancestor_kinds(node).find_map(|kind| match kind {
        AstKind::StaticMemberExpression(member) if is_object(&member.object) => {
            let property = &member.property;
            Some((member.span, Some((&property.name, property.span))))
        }
        AstKind::ComputedMemberExpression(member) if is_object(&member.object) => {
            let property = match member.expression.get_inner_expression() {
                Expression::Identifier(property) => Some((&property.name, property.span)),
                _ => None,
            };
            Some((member.span, property))
        }
        _ => None,
    })?;
    let (name, property) = property?;
    name.starts_with("$$").then_some((member, property))
}
