pub(crate) mod asynchronous;
pub(crate) mod helpers;
pub(crate) mod script;
pub(crate) mod template;
mod vapor;

use oxc_allocator::GetAllocator;
use oxc_ast::ast::{
    BindingIdentifier, ImportDeclarationSpecifier, ImportOrExportKind, ModuleExportName, Program,
    PropertyKey, Statement, StringLiteral,
};
use oxc_ast_visit::VisitMut;
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

/// The translated component: one JavaScript tree holding the `<script setup>` program, the module
/// program and every template expression, and the template's Vue HIR.
#[derive(Debug)]
pub(crate) struct Translation {
    pub javascript: Tree,
    pub script: ProgramIdentifier,
    pub module_script: Option<ProgramIdentifier>,
    pub server: bool,
    pub stylesheet: Option<String>,
    pub stylesheet_hash: Option<String>,
    pub css_mode: template::CssMode,
    pub tracking: bool,
    pub destroy: bool,
    pub template: template::Built,
}

pub(crate) type R<T> = Result<T, Diagnostic>;

pub(crate) fn unsupported(what: impl std::fmt::Display, span: Span) -> Diagnostic {
    Diagnostic::error(
        "vuelte_unsupported",
        format!("not supported by vuelte: {what}"),
        span,
    )
}

/// An oxc span, which is the document's, as the kernel holds it.
pub(crate) const fn span_of(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

/// The key `"name"`.
pub(crate) fn string_key<'t>(b: &Builder<'t>, name: &str) -> PropertyKey<'t> {
    PropertyKey::new_string_literal(SPAN, b.str(name), None, b)
}

/// `import { imported as local, … } from "source"`.
pub(crate) fn import<'t, 'n>(
    b: &Builder<'t>,
    specifiers: impl IntoIterator<Item = (&'n str, &'n str)>,
    source: &str,
) -> Statement<'t> {
    let specifiers = specifiers.into_iter().map(|(imported, local)| {
        ImportDeclarationSpecifier::new_import_specifier(
            SPAN,
            ModuleExportName::new_identifier_name(SPAN, b.str(imported), b),
            BindingIdentifier::new(SPAN, b.str(local), b),
            ImportOrExportKind::Value,
            b,
        )
    });
    Statement::new_import_declaration(
        SPAN,
        Some(b.vec(specifiers)),
        StringLiteral::new(SPAN, b.str(source), None, b),
        None,
        None,
        ImportOrExportKind::Value,
        b,
    )
}

/// The statements of a helper's JavaScript source, parsed into `b`'s arena, with no position: a
/// span into the helper's source would name text of the document.
///
/// # Panics
///
/// If the source does not parse, which the unit tests rule out.
pub(crate) fn statements<'t>(b: &Builder<'t>, source: &'static str) -> Vec<Statement<'t>> {
    struct Unplaced;
    impl VisitMut<'_> for Unplaced {
        fn visit_span(&mut self, it: &mut oxc_span::Span) {
            *it = SPAN;
        }
    }
    let mut parsed = oxc_parser::Parser::new(b.allocator(), source, SourceType::mjs()).parse();
    assert!(parsed.diagnostics.is_empty(), "helper sources parse");
    Unplaced.visit_program(&mut parsed.program);
    parsed.program.body.into_iter().collect()
}

/// A program of `body` over the document.
pub(crate) fn program<'t>(
    b: &Builder<'t>,
    source_text: &'t str,
    body: Vec<Statement<'t>>,
) -> Program<'t> {
    Program::new(
        SPAN,
        SourceType::mjs(),
        source_text,
        [],
        None,
        [],
        b.vec(body),
        b,
    )
}

/// The checks that do not depend on the target: everything [`translate`] refuses for both.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
pub(crate) fn check(
    c: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    res: &Resolution,
    source_text: &str,
) -> R<script::Plan> {
    for script in c.instance.iter().chain(&c.module) {
        if script.typescript
            && let Some((_, span)) = rsvelte_typescript_compile::features::first_runtime_feature(
                c.javascript.get_program(script.program),
            )
        {
            return Err(unsupported(
                "TypeScript with runtime semantics",
                span_of(span),
            ));
        }
    }
    let input = rsvelte_svelte_semantic::svelte_input(c, compiler_syntax_tree, source_text, "");
    let namespaces = rsvelte_svelte_compile::render_plan::Namespaces::build(&input.into());
    let options = template::check(c, compiler_syntax_tree, res, source_text, &namespaces)?;
    let mut plan = script::plan(c, res)?;
    plan.namespaces = Some(namespaces);
    plan.preserve_whitespace = options.preserve_whitespace;
    plan.custom_element = options.custom_element;
    plan.stylesheet_mode = options.css_mode;
    if let Some(&span) = plan.auxiliary.get("$host")
        && plan.custom_element.is_none()
    {
        return Err(unsupported(
            "`$host()` without custom element options",
            span,
        ));
    }
    Ok(plan)
}

/// What [`translate`] reads of one component.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Input<'a> {
    pub component: &'a Component,
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub resolution: &'a Resolution,
    pub analysis: &'a Analysis,
    pub plan: &'a script::Plan,
    pub source_text: &'a str,
    pub server: bool,
    pub filename: &'a str,
}

/// Translates a checked component for the client (`server: false`) or the server.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
pub(crate) fn translate(input: Input<'_>) -> R<Translation> {
    let c = input.component;
    let component_input = rsvelte_svelte_semantic::svelte_input(
        c,
        input.compiler_syntax_tree,
        input.source_text,
        input.filename,
    );
    let identity = rsvelte_svelte_compile::OutputIdentity::build(&component_input);
    let stylesheet = rsvelte_svelte_compile::stylesheet::scoped_stylesheet(
        &component_input,
        input.analysis,
        &identity,
    );
    let hash = identity.stylesheet_hash.as_deref();
    let (javascript, (script, module_script, template)) = Tree::build(input.source_text, |tree| {
        let b = Builder::new(tree.allocator());
        let (built, mut declarations) = template::build(input, hash, tree, &b)?;
        let mut rw = script::ScriptRewrite::new(&b, input.resolution, input.plan, input.server);
        let instance = c
            .instance
            .as_ref()
            .map(|s| c.javascript.get_program(s.program));
        let mut body = script::emit(&mut rw, instance, input.plan, &built.helpers);
        body.append(&mut declarations);
        let source_text = tree.source_text();
        let script = tree.keep_program(program(&b, source_text, body));
        let module_script = c.module.as_ref().map(|module| {
            let body = script::module(&mut rw, c.javascript.get_program(module.program));
            tree.keep_program(program(&b, source_text, body))
        });
        Ok((script, module_script, built))
    })?;
    let plan = input.plan;
    Ok(Translation {
        javascript,
        script,
        module_script,
        server: input.server,
        stylesheet,
        stylesheet_hash: identity.stylesheet_hash,
        css_mode: plan.stylesheet_mode,
        destroy: plan.lifecycle.iter().any(|(name, _)| *name == "onDestroy"),
        tracking: plan.auxiliary.contains_key("$effect.tracking") && !input.server,
        template,
    })
}

/// Emits a Vapor client module or a Vue SSR compatibility module.
pub(crate) fn compile(t: &Translation) -> String {
    let resolution = rsvelte_vue_semantic::resolve::resolve(
        &t.javascript,
        t.script,
        t.module_script,
        Some(&t.template.compiler_syntax_tree),
    );
    vapor::compile(t, &resolution)
}
