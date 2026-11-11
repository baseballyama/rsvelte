use oxc_ast::AstKind;
use oxc_ast::ast::{BindingPattern, Expression, VariableDeclarator};
use oxc_semantic::{SymbolFlags, SymbolId};
use rsvelte_typescript_semantic::semantic::Semantic;

use super::{BindingInformation, BindingKind, Counts, TemplateNames, runes};
use crate::compiler_syntax_tree::CompilerSyntaxTree;
use crate::typescript::without_typescript;

mod props;
mod template;

pub(super) fn classify<'a>(
    semantic: &'a Semantic,
    subscribed: &[&str],
    counts: &Counts,
    compiler_syntax_tree: &CompilerSyntaxTree,
    names: &TemplateNames,
) -> Vec<BindingInformation<'a>> {
    let scoping = semantic.scoping();
    let mut out: Vec<BindingInformation<'a>> = scoping
        .symbol_ids()
        .map(|symbol| BindingInformation {
            kind: BindingKind::Normal,
            // Upstream `Binding.is_function`: never updated, and initialised with a function.
            is_function: !counts.reassigned(symbol)
                && counts.mutations[symbol.index()] == 0
                && (scoping.symbol_flags(symbol).contains(SymbolFlags::Function)
                    || initializer(semantic, symbol).is_some_and(|i| {
                        matches!(
                            without_typescript(i),
                            Expression::FunctionExpression(_)
                                | Expression::ArrowFunctionExpression(_)
                        )
                    })),
            initial: None,
            prop_key: None,
        })
        .collect();
    for node in semantic.nodes().iter() {
        if let AstKind::VariableDeclarator(declarator) = node.kind() {
            classify_declarator(semantic, subscribed, declarator, &mut out);
        }
    }
    template::classify_template(semantic, compiler_syntax_tree, names, &mut out);
    out
}

/// The initialiser of the declarator `symbol` came from (`initializer` in `let x = initializer`).
/// Upstream declares a new binding at each `var` redeclaration, so the last declarator's counts.
pub(super) fn initializer(semantic: &Semantic, symbol: SymbolId) -> Option<&Expression<'_>> {
    let scoping = semantic.scoping();
    let declaration = scoping
        .symbol_redeclarations(symbol)
        .last()
        .map_or_else(|| scoping.symbol_declaration(symbol), |r| r.declaration);
    match semantic.nodes().kind(declaration) {
        AstKind::VariableDeclarator(d) => d.init.as_ref(),
        _ => None,
    }
}

fn classify_declarator<'a>(
    semantic: &Semantic,
    subscribed: &[&str],
    declarator: &'a VariableDeclarator<'a>,
    out: &mut [BindingInformation<'a>],
) {
    let Some(initializer) = &declarator.init else {
        return;
    };
    let Some((rune, argument)) = runes::rune(semantic, subscribed, initializer) else {
        return;
    };
    let kind = match rune {
        "$state" => BindingKind::State,
        "$state.raw" => BindingKind::RawState,
        "$derived" => BindingKind::Derived,
        "$derived.by" => BindingKind::DerivedBy,
        "$props" => return props::classify_props(semantic, subscribed, &declarator.id, out),
        _ => return,
    };
    for_each_binding(&declarator.id, &mut |symbol| {
        let info = &mut out[symbol.index()];
        info.kind = kind;
        info.initial = argument;
        info.is_function = false;
    });
}

/// The symbols a binding pattern declares.
pub(super) fn for_each_binding(pattern: &BindingPattern<'_>, f: &mut impl FnMut(SymbolId)) {
    for identifier in pattern.get_binding_identifiers() {
        if let Some(symbol) = identifier.symbol_id.get() {
            f(symbol);
        }
    }
}
