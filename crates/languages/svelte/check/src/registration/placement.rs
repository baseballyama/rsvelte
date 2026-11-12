//! svelte2tsx writes the instance script inside its render function, where TypeScript refuses a
//! namespace, an ambient module or a `declare`; this projection keeps the script at the top level.

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
/// svelte-check adds the second line to TypeScript's message.
const DECLARE: (u32, &str) = (
    1184,
    "Modifiers cannot appear here.\nIf this is a declare statement, move it into <script \
     context=\"module\">..</script>",
);

/// TypeScript's finding for each namespace, ambient module or other `declare` the instance script
/// has at its top level, over the statement's first token.
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
                // An exported declaration is a prop or is hoisted, as svelte2tsx decides.
                _ if exported => return None,
                Declaration::FunctionDeclaration(function) if function.declare => {
                    (function.span.start, true, "", DECLARE)
                }
                Declaration::VariableDeclaration(variable) if variable.declare => {
                    (variable.span.start, true, "", DECLARE)
                }
                Declaration::ClassDeclaration(class) if class.declare => {
                    (class.span.start, true, "", DECLARE)
                }
                Declaration::TSEnumDeclaration(enumeration) if enumeration.declare => {
                    (enumeration.span.start, true, "", DECLARE)
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
