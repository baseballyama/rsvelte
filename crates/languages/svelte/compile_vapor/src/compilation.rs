mod asynchronous;
pub mod helpers;
mod patterns;
pub mod script;
pub mod template;
mod vapor;

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
    pub module_script: Option<NodeIdentifier>,
    pub compiler_syntax_tree: rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTree,
    pub server: bool,
    pub stylesheet: Option<String>,
    pub stylesheet_hash: Option<String>,
    pub css_mode: template::CssMode,
    pub custom_element: Option<template::CustomElement>,
    pub memoized: rustc_hash::FxHashSet<NodeIdentifier>,
    pub tracking: bool,
    pub destroy: bool,
    pub helpers: Vec<helpers::Helper>,
    pub namespaces: rustc_hash::FxHashMap<
        rsvelte_vue::compiler_syntax_tree::CompilerNodeIdentifier,
        rsvelte_svelte_compile::render_plan::Namespace,
    >,
    pub animation_loops:
        rustc_hash::FxHashSet<rsvelte_vue::compiler_syntax_tree::CompilerNodeIdentifier>,
    pub scopes: rustc_hash::FxHashMap<
        rsvelte_vue::compiler_syntax_tree::CompilerNodeIdentifier,
        NodeIdentifier,
    >,
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
    if let Some(t) = c.javascript.typescript_runtime.first() {
        return Err(unsupported("TypeScript with runtime semantics", t.span));
    }
    let input = rsvelte_svelte::svelte_input(c, compiler_syntax_tree, source_text, "");
    let namespaces = rsvelte_svelte_compile::render_plan::NamespacePlan::build(&input.into());
    let options = template::check(
        compiler_syntax_tree,
        &c.javascript,
        resolution,
        &c.template_expressions,
        source_text,
        &namespaces,
    )?;
    let mut plan = script::plan(c, resolution, source_text)?;
    plan.namespaces = Some(namespaces);
    plan.preserve_whitespace = options.preserve_whitespace;
    plan.custom_element = options.custom_element;
    plan.css_mode = options.css_mode;
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

/// Translates a checked component for the client (`server: false`) or the server.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
#[expect(
    clippy::too_many_arguments,
    reason = "translation reads one file's trees and facts"
)]
pub fn translate(
    c: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    resolution: &Resolution,
    analysis: &Analysis,
    plan: &script::Plan,
    source_text: &str,
    server: bool,
    filename: &str,
) -> R<Translation> {
    let mut to = SyntaxTree::new();
    let component_input =
        rsvelte_svelte::svelte_input(c, compiler_syntax_tree, source_text, filename);
    let identity = rsvelte_svelte_compile::OutputIdentity::build(&component_input);
    let stylesheet = rsvelte_svelte_compile::stylesheet::scoped_stylesheet(
        &component_input,
        analysis,
        &identity,
    );
    let input = template::Input {
        compiler_syntax_tree,
        resolution,
        analysis,
        javascript: &c.javascript,
        source_text,
        plan,
        server,
        stylesheet_hash: identity.stylesheet_hash.as_deref(),
    };
    let t = template::build(input, &mut to)?;
    let script = script::emit(
        c,
        resolution,
        plan,
        &t.helpers,
        &mut to,
        server,
        source_text,
    );
    let rsvelte_typescript::Kind::Program(statements) = to.kind(script) else {
        unreachable!()
    };
    let mut statements = statements.to_vec();
    statements.extend(t.declarations);
    let script = to.program(
        &statements,
        rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
    );
    let module_script = c.module.as_ref().map(|module| {
        script::module(
            &c.javascript,
            module.program,
            resolution,
            plan,
            &mut to,
            server,
        )
    });
    let custom_element = plan.custom_element.as_ref().map(|options| {
        template::copy_options(options, &c.javascript, &mut to, resolution, source_text)
    });
    Ok(Translation {
        javascript: to,
        script,
        module_script,
        compiler_syntax_tree: t.compiler_syntax_tree,
        server,
        stylesheet,
        stylesheet_hash: identity.stylesheet_hash,
        css_mode: plan.css_mode,
        custom_element,
        memoized: t.memoized,
        helpers: t.helpers,
        scopes: t.scopes,
        animation_loops: t.animation_loops,
        namespaces: t.namespaces,
        destroy: plan.lifecycle.iter().any(|(name, _)| *name == "onDestroy"),
        tracking: plan.auxiliary.contains_key("$effect.tracking") && !server,
    })
}

/// Emits a Vapor client module or a Vue SSR compatibility module.
///
/// # Errors
///
/// The Vue port's refusal, as a `vuelte_unsupported` [`Diagnostic`].
pub fn compile(t: &Translation, source_text: &str, _path: &str) -> R<String> {
    let resolution = rsvelte_vue::resolve::resolve_with_module(
        &t.javascript,
        t.script,
        t.module_script,
        Some(&t.compiler_syntax_tree),
        source_text,
    );
    Ok(vapor::compile(t, &resolution, source_text))
}
