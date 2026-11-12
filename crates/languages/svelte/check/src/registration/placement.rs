//! svelte2tsx writes the instance script inside its render function, where TypeScript refuses a
//! namespace or an ambient module; this projection keeps the script at the top level instead.

use oxc_ast::ast::{Declaration, Statement, TSNamespaceDeclarationKind};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Component;

const NAMESPACE: (u32, &str) = (
    1235,
    "A namespace declaration is only allowed at the top level of a namespace or module.",
);
const AMBIENT_MODULE: (u32, &str) = (
    1234,
    "An ambient module declaration is only allowed at the top level in a file.",
);

/// TypeScript's finding for each namespace or ambient module the instance script declares at its
/// top level, over the statement's first token.
pub(super) fn instance(component: &Component) -> Vec<(Span, u32, &'static str)> {
    let Some(script) = &component.instance else {
        return Vec::new();
    };
    let program = component.javascript.get_program(script.program);
    program
        .body
        .iter()
        .filter_map(|statement| {
            let (exported, declaration) = match statement {
                Statement::ExportDeclaration(export) => (true, &export.declaration),
                statement => (false, statement.as_declaration()?),
            };
            let (start, declare, keyword, (code, message)) = match declaration {
                Declaration::TSNamespaceDeclaration(namespace) => (
                    namespace.span.start,
                    namespace.declare,
                    match namespace.kind {
                        TSNamespaceDeclarationKind::Namespace => "namespace",
                        TSNamespaceDeclarationKind::Module => "module",
                    },
                    NAMESPACE,
                ),
                Declaration::TSExternalModuleDeclaration(module) => {
                    (module.span.start, module.declare, "module", AMBIENT_MODULE)
                }
                Declaration::TSGlobalDeclaration(global) => {
                    (global.span.start, global.declare, "global", AMBIENT_MODULE)
                }
                _ => return None,
            };
            let first = if exported {
                "export"
            } else if declare {
                "declare"
            } else {
                keyword
            };
            let start = if exported {
                statement.span().start
            } else {
                start
            };
            let end = start + u32::try_from(first.len()).expect("a keyword is short");
            Some((Span::new(start, end), code, message))
        })
        .collect()
}

#[cfg(test)]
mod tests;
