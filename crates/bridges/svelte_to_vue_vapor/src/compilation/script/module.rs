use oxc_ast::ast::{BindingPattern, Declaration, Program, Statement};
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;

use super::{FxHashMap, R, Resolution, runes, span_of, unsupported};

pub(super) fn check(
    program: &Program<'_>,
    res: &Resolution,
    exports: &mut FxHashMap<SymbolId, String>,
) -> R<()> {
    for statement in &program.body {
        match statement {
            Statement::ImportDeclaration(i)
                if matches!(
                    i.source.value.as_str(),
                    Some("svelte" | "svelte/attachments")
                ) =>
            {
                return Err(unsupported(
                    "a Svelte runtime import in a module script",
                    span_of(i.span),
                ));
            }
            Statement::ExportDeclaration(e) => {
                let Declaration::VariableDeclaration(d) = &e.declaration else {
                    continue;
                };
                for d in &d.declarations {
                    let Some((rune, _)) = d
                        .init
                        .as_ref()
                        .and_then(|init| res.rune(init))
                        .filter(|(name, _)| runes::value(name))
                    else {
                        continue;
                    };
                    if matches!(rune, "$derived" | "$derived.by") {
                        return Err(Diagnostic::error(
                            "derived_invalid_export",
                            "Derived state cannot be exported.",
                            span_of(d.span),
                        ));
                    }
                    let BindingPattern::BindingIdentifier(id) = &d.id else {
                        return Err(unsupported("this exported state pattern", span_of(d.span)));
                    };
                    let symbol = id.symbol_id.get().expect("a declaration has a symbol");
                    if res.writes(symbol) > 0 {
                        return Err(Diagnostic::error(
                            "state_invalid_export",
                            "Exported state cannot be reassigned. Export a function to read it \
                             instead.",
                            span_of(d.span),
                        ));
                    }
                    exports.insert(symbol, format!("$$module_export_{}", exports.len()));
                }
            }
            _ => {}
        }
    }
    Ok(())
}
