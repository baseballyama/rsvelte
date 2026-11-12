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
const EXPORTED_AMBIENT: (u32, &str) = (
    2668,
    "'export' modifier cannot be applied to ambient modules and module augmentations since they \
     are always visible.",
);
/// svelte-check adds the second line to TypeScript's message.
const DECLARE: (u32, &str) = (
    1184,
    "Modifiers cannot appear here.\nIf this is a declare statement, move it into <script \
     context=\"module\">..</script>",
);

/// TypeScript's findings for each namespace, ambient module or other `declare` the instance
/// script has at its top level, over the token svelte2tsx leaves first.
pub(super) fn instance(component: &Component) -> Vec<(Span, u32, &'static str)> {
    let Some(script) = &component.instance else {
        return Vec::new();
    };
    let program = component.javascript.get_program(script.program);
    let mut findings = Vec::new();
    for statement in &program.body {
        let (exported, declaration) = match statement {
            Statement::ExportDeclaration(export) => (true, &export.declaration),
            statement => match statement.as_declaration() {
                Some(declaration) => (false, declaration),
                None => continue,
            },
        };
        let at = |start: u32, token: &str| {
            Span::new(
                start,
                start + u32::try_from(token.len()).expect("a keyword is short"),
            )
        };
        let export = at(statement.span().start, "export");
        let (span, finding) = match declaration {
            Declaration::TSNamespaceDeclaration(namespace) => {
                let keyword = match namespace.kind {
                    TSNamespaceDeclarationKind::Namespace => "namespace",
                    TSNamespaceDeclarationKind::Module => "module",
                };
                (
                    first(
                        exported,
                        namespace.declare,
                        export,
                        namespace.span.start,
                        keyword,
                        at,
                    ),
                    NAMESPACE,
                )
            }
            Declaration::TSExternalModuleDeclaration(module) => (
                first(
                    exported,
                    module.declare,
                    export,
                    module.span.start,
                    "module",
                    at,
                ),
                AMBIENT_MODULE,
            ),
            Declaration::TSGlobalDeclaration(global) => (
                first(
                    exported,
                    global.declare,
                    export,
                    global.span.start,
                    "global",
                    at,
                ),
                AMBIENT_MODULE,
            ),
            // svelte2tsx keeps `export` on an enum.
            Declaration::TSEnumDeclaration(enumeration) if enumeration.declare || exported => (
                first(exported, true, export, enumeration.span.start, "", at),
                DECLARE,
            ),
            // svelte2tsx drops `export` from these, so `declare` comes first.
            Declaration::FunctionDeclaration(function) if function.declare => {
                (at(function.span.start, "declare"), DECLARE)
            }
            Declaration::VariableDeclaration(variable) if variable.declare => {
                (at(variable.span.start, "declare"), DECLARE)
            }
            Declaration::ClassDeclaration(class) if class.declare => {
                (at(class.span.start, "declare"), DECLARE)
            }
            _ => continue,
        };
        findings.push((span, finding.0, finding.1));
        if exported && finding.0 == AMBIENT_MODULE.0 {
            findings.push((span, EXPORTED_AMBIENT.0, EXPORTED_AMBIENT.1));
        }
    }
    findings
}

/// The first token of a statement svelte2tsx keeps as written.
fn first(
    exported: bool,
    declare: bool,
    export: Span,
    start: u32,
    keyword: &str,
    at: impl Fn(u32, &str) -> Span,
) -> Span {
    if exported {
        export
    } else if declare {
        at(start, "declare")
    } else {
        at(start, keyword)
    }
}

#[cfg(test)]
mod tests;
