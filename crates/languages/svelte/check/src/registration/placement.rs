//! svelte2tsx writes the instance script inside its render function, where TypeScript refuses a
//! namespace, an ambient module or a `declare`; this projection keeps the script at the top level.
//! The render function is async only when the script awaits outside every block and function.

use oxc_ast::ast::{
    AccessorProperty, AwaitExpression, BlockStatement, Declaration, Expression, ForOfStatement,
    FormalParameters, FunctionBody, PropertyDefinition, Statement, StaticBlock,
    TSNamespaceDeclarationKind, VariableDeclaration, VariableDeclarationKind,
};
use oxc_ast_visit::{Visit, walk};
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
const AWAIT: (u32, &str) = (
    1308,
    "'await' expressions are only allowed within async functions and at the top levels of modules.",
);
const FOR_AWAIT: (u32, &str) = (
    1103,
    "'for await' loops are only allowed within async functions and at the top levels of modules.",
);
const AWAIT_USING: (u32, &str) = (
    2852,
    "'await using' statements are only allowed within async functions and at the top levels of \
     modules.",
);
/// svelte-check adds the second line to TypeScript's message.
const DECLARE: (u32, &str) = (
    1184,
    "Modifiers cannot appear here.\nIf this is a declare statement, move it into <script \
     context=\"module\">..</script>",
);

/// TypeScript's findings for each namespace, ambient module or other `declare` the instance
/// script has at its top level, over the token svelte2tsx leaves first, then for each `await`
/// svelte2tsx's render function does not allow.
pub(super) fn instance(component: &Component) -> Vec<(Span, u32, &'static str)> {
    let Some(script) = &component.instance else {
        return Vec::new();
    };
    let program = component.javascript.get_program(script.program);
    let mut findings = Vec::new();
    let mut awaits = Awaits {
        component,
        blocks: 0,
        functions: 0,
        fields: 0,
        render_is_async: false,
        findings: Vec::new(),
    };
    awaits.visit_program(program);
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
    if !awaits.render_is_async {
        findings.extend(awaits.findings);
    }
    findings
}

/// The `await`s outside every function, which the projection's top level allows, and whether
/// svelte2tsx makes its render function async: an await expression outside every block too.
struct Awaits<'c> {
    component: &'c Component,
    blocks: u32,
    functions: u32,
    /// Class fields' initializers, where TypeScript refuses an `await` at the top level too.
    fields: u32,
    render_is_async: bool,
    findings: Vec<(Span, u32, &'static str)>,
}

impl Awaits<'_> {
    fn find(&mut self, keyword: Option<Span>, finding: (u32, &'static str)) {
        if let (0, 0, Some(keyword)) = (self.functions, self.fields, keyword) {
            self.findings.push((keyword, finding.0, finding.1));
        }
    }

    fn field(&mut self, value: Option<&Expression<'_>>) {
        if let Some(value) = value {
            self.fields += 1;
            self.visit_expression(value);
            self.fields -= 1;
        }
    }

    /// The `await` of a `for await` loop, the token after `for`.
    fn loop_keyword(&self, start: u32) -> Option<Span> {
        let tokens = &self.component.tokens;
        let after = tokens.get(tokens.at(start)?).span.end_offset;
        Some(tokens.get(tokens.after(after)?).span)
    }
}

impl<'a> Visit<'a> for Awaits<'_> {
    fn visit_block_statement(&mut self, it: &BlockStatement<'a>) {
        self.blocks += 1;
        walk::walk_block_statement(self, it);
        self.blocks -= 1;
    }

    // TypeScript refuses an `await` in a static block at the top level too.
    fn visit_static_block(&mut self, it: &StaticBlock<'a>) {
        self.functions += 1;
        walk::walk_static_block(self, it);
        self.functions -= 1;
    }

    fn visit_formal_parameters(&mut self, it: &FormalParameters<'a>) {
        self.functions += 1;
        walk::walk_formal_parameters(self, it);
        self.functions -= 1;
    }

    fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
        self.functions += 1;
        walk::walk_function_body(self, it);
        self.functions -= 1;
    }

    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        self.visit_decorators(&it.decorators);
        self.visit_property_key(&it.key);
        self.field(it.value.as_ref());
    }

    fn visit_accessor_property(&mut self, it: &AccessorProperty<'a>) {
        self.visit_decorators(&it.decorators);
        self.visit_property_key(&it.key);
        self.field(it.value.as_ref());
    }

    fn visit_await_expression(&mut self, it: &AwaitExpression<'a>) {
        if (self.blocks, self.functions) == (0, 0) {
            self.render_is_async = true;
        }
        let keyword = Span::new(it.span.start, it.span.start + "await".len() as u32);
        self.find(Some(keyword), AWAIT);
        walk::walk_await_expression(self, it);
    }

    fn visit_for_of_statement(&mut self, it: &ForOfStatement<'a>) {
        if it.r#await {
            let keyword = self.loop_keyword(it.span.start);
            self.find(keyword, FOR_AWAIT);
        }
        walk::walk_for_of_statement(self, it);
    }

    fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
        if it.kind == VariableDeclarationKind::AwaitUsing {
            let keyword = Span::new(it.span.start, it.span.start + "await".len() as u32);
            self.find(Some(keyword), AWAIT_USING);
        }
        walk::walk_variable_declaration(self, it);
    }
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
