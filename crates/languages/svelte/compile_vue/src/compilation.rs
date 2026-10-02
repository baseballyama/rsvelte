pub mod helpers;
pub mod script;
pub mod template;

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::compilation::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte::semantic::analyze::Analysis;
use rsvelte_svelte::semantic::resolve::Resolution;
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

/// The translated component: one JavaScript tree holding the `<script setup>` program and every
/// template expression, and the template's Vue HIR.
#[derive(Debug)]
pub struct Translation {
    pub javascript: SyntaxTree,
    pub script: NodeIdentifier,
    pub compiler_syntax_tree: rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTree,
}

pub(crate) type R<T> = Result<T, Diagnostic>;

pub(crate) fn unsupported(what: impl std::fmt::Display, span: Span) -> Diagnostic {
    Diagnostic::error(
        "vuelte_unsupported",
        format!("not supported by vuelte: {what}"),
        span,
    )
}

/// The checks that do not depend on the target: everything [`translate`] refuses for both.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
pub fn check(
    c: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    resolution: &Resolution,
    source_text: &str,
) -> R<script::Plan> {
    if let Some(style) = &c.style {
        return Err(unsupported("a <style>", style.span));
    }
    if let Some(t) = c.javascript.typescript_runtime.first() {
        return Err(unsupported("TypeScript with runtime semantics", t.span));
    }
    template::check(
        compiler_syntax_tree,
        &c.javascript,
        resolution,
        &c.template_expressions,
        source_text,
    )?;
    script::plan(c, resolution, source_text)
}

/// Translates a checked component for the client (`server: false`) or the server.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
pub fn translate(
    c: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    resolution: &Resolution,
    analysis: &Analysis,
    plan: &script::Plan,
    source_text: &str,
    server: bool,
) -> R<Translation> {
    let mut to = SyntaxTree::new();
    let input = template::Input {
        compiler_syntax_tree,
        resolution,
        analysis,
        javascript: &c.javascript,
        source_text,
        plan,
        server,
    };
    let t = template::build(input, &mut to)?;
    let script = script::emit(c, resolution, plan, &t.helpers, &mut to);
    Ok(Translation {
        javascript: to,
        script,
        compiler_syntax_tree: t.compiler_syntax_tree,
    })
}

/// The Vue plugin's compile of a [`Translation`]: `@vitejs/plugin-vue`'s production module.
///
/// # Errors
///
/// The Vue port's refusal, as a `vuelte_unsupported` [`Diagnostic`].
pub fn compile(t: &Translation, source_text: &str, path: &str) -> R<String> {
    let resolution = rsvelte_vue::resolve::resolve(
        &t.javascript,
        t.script,
        Some(&t.compiler_syntax_tree),
        source_text,
    );
    let input = rsvelte_vue_compile::compile::CompileInput {
        javascript: &t.javascript,
        script: Some(t.script),
        compiler_syntax_tree: Some(&t.compiler_syntax_tree),
        styles: Vec::new(),
        typescript: false,
        source_text,
    };
    rsvelte_vue_compile::compile::compile(&input, &resolution, path)
        .map(|o| o.javascript)
        .map_err(|u| unsupported(format_args!("the Vue compiler: {}", u.what), u.span()))
}
