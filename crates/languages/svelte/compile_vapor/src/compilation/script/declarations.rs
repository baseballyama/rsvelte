use oxc_ast::ast::{
    BindingPattern, Expression, Statement, VariableDeclaration, VariableDeclarationKind,
    VariableDeclarator,
};
use oxc_allocator::GetAllocator;
use oxc_ast_visit::VisitMut;

use super::emit::{ScriptRewrite, rune_value};

/// The value rune a declarator's initialiser makes, besides `$props()`.
fn value_rune<'e>(
    rw: &ScriptRewrite<'_, '_>,
    init: Option<&'e Expression<'e>>,
) -> Option<&'static str> {
    let (rune, _) = rw.res.rune(init?)?;
    matches!(
        rune,
        "$props" | "$state" | "$state.raw" | "$derived" | "$derived.by"
    )
    .then_some(rune)
}

/// One top-level declarator as its own statement: a rune as Vue's reactivity, `$props()` as
/// nothing (its keys are in `defineProps`), anything else copied.
pub(super) fn declarator<'t>(
    rw: &mut ScriptRewrite<'_, 't>,
    kind: VariableDeclarationKind,
    d: &VariableDeclarator<'_>,
) -> Option<Statement<'t>> {
    let b = rw.b;
    let mut d = rw.copy(d);
    rsvelte_typescript_compile::strip::Strip::new(b.allocator()).visit_variable_declarator(&mut d);
    let Some(rune) = value_rune(rw, d.init.as_ref()) else {
        rw.visit_variable_declarator(&mut d);
        return Some(b.declaration(kind, [d]));
    };
    // A rune's cell is never reassigned, whatever the source declared.
    Some(b.declaration(VariableDeclarationKind::Const, lower(rw, rune, d)?))
}

/// A declaration inside a function or block: each rune declarator lowered in place.
pub(super) fn nested<'t>(rw: &mut ScriptRewrite<'_, 't>, d: &mut VariableDeclaration<'t>) {
    let b = rw.b;
    let declarators = std::mem::replace(&mut d.declarations, b.vec([]));
    let mut out = Vec::with_capacity(declarators.len());
    for mut declarator in declarators {
        match value_rune(rw, declarator.init.as_ref()) {
            None => {
                rw.visit_variable_declarator(&mut declarator);
                out.push(declarator);
            }
            Some(rune) => out.extend(lower(rw, rune, declarator).into_iter().flatten()),
        }
    }
    d.declarations = b.vec(out);
}

/// The declarators a rune declarator becomes: `x = $$ref(v)`, or a pattern's cells.
fn lower<'t>(
    rw: &mut ScriptRewrite<'_, 't>,
    rune: &'static str,
    mut d: VariableDeclarator<'t>,
) -> Option<Vec<VariableDeclarator<'t>>> {
    let b = rw.b;
    let Some(Expression::CallExpression(mut call)) = d.init.take() else {
        unreachable!("a rune is a call")
    };
    let mut argument = call
        .arguments
        .pop()
        .map(oxc_ast::ast::Argument::into_expression);
    if let Some(argument) = &mut argument {
        rw.visit_expression(argument);
    }
    let value = rune_value(b, rune, argument, rw.tracking)?;
    if !d.id.is_binding_identifier() {
        return Some(super::patterns::declarators(
            rw, d.id, value, rune, rw.tracking,
        ));
    }
    let BindingPattern::BindingIdentifier(id) = &d.id else {
        unreachable!("checked")
    };
    if let Some(storage) = id.symbol_id.get().and_then(|s| rw.storage_name(s)) {
        d.id = b.binding(storage);
    }
    d.init = Some(value);
    Some(vec![d])
}
