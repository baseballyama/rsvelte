use oxc_ast::ast::{Declaration, ExportDeclaration, VariableDeclarationKind};
use oxc_semantic::SymbolId;

use super::{R, span_of, unsupported};

/// The names `export const`, `export function` and `export class` expose on the component.
pub(super) fn collect(e: &ExportDeclaration<'_>, names: &mut Vec<SymbolId>) -> R<()> {
    let symbol = |id: &oxc_ast::ast::BindingIdentifier<'_>| {
        id.symbol_id.get().expect("a declaration has a symbol")
    };
    match &e.declaration {
        Declaration::VariableDeclaration(d) if d.kind == VariableDeclarationKind::Const => {
            for d in &d.declarations {
                for id in d.id.get_binding_identifiers() {
                    names.push(symbol(id));
                }
            }
        }
        Declaration::FunctionDeclaration(f) if f.id.is_some() => {
            names.push(symbol(f.id.as_ref().expect("checked")));
        }
        Declaration::ClassDeclaration(c) if c.id.is_some() => {
            names.push(symbol(c.id.as_ref().expect("checked")));
        }
        _ => {
            return Err(unsupported("this component export", span_of(e.span)));
        }
    }
    Ok(())
}

/// `defineExpose({ get name() { … }, set name(v) { … } })` for the names the component exports.
pub(super) fn expose<'t>(
    b: &rsvelte_typescript_compile::build::Builder<'t>,
    res: &super::Resolution,
    names: &[SymbolId],
) -> oxc_ast::ast::Statement<'t> {
    use rsvelte_svelte_semantic::resolve::BindingKind;
    let scoping = res.scoping();
    let mut fields = Vec::with_capacity(names.len());
    for &symbol in names {
        let name = scoping.symbol_name(symbol);
        let span = scoping.symbol_span(symbol);
        let mut value = b.id_at(name, span);
        if matches!(
            res.binding(symbol).kind,
            BindingKind::State
                | BindingKind::RawState
                | BindingKind::Derived
                | BindingKind::DerivedBy
        ) {
            value = b.member(value, "value");
        }
        fields.push(b.accessor(
            oxc_ast::ast::PropertyKind::Get,
            name,
            b.params([]),
            [b.return_(Some(value))],
        ));
        let assignable = match res.declaration(symbol) {
            oxc_ast::AstKind::Function(_) => true,
            _ => res.variable_kind(symbol) == Some(VariableDeclarationKind::Let),
        };
        if assignable {
            let assignment = b.assign_name(name, b.id("$$export_value"));
            fields.push(b.accessor(
                oxc_ast::ast::PropertyKind::Set,
                name,
                b.params(["$$export_value"]),
                [b.stmt(assignment)],
            ));
        }
    }
    b.stmt(b.call(b.id("defineExpose"), [b.object(fields)]))
}
