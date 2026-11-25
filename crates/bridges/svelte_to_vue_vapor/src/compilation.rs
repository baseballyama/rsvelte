pub(crate) mod helpers;
pub(crate) mod markers;
pub(crate) mod prelude;
pub(crate) mod script;
pub(crate) mod template;
mod vapor;

use oxc_ast::ast::{Program, PropertyKey, Statement};
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_compile::render_plan::Namespaces;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte_semantic::input::ComponentInput;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree, document_span};

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

/// The key `"name"`.
pub(crate) fn string_key<'t>(b: &Builder<'t>, name: &str) -> PropertyKey<'t> {
    PropertyKey::new_static_string_literal(SPAN, b.str(name), None, b)
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

/// What [`check`] found, shared by both targets.
#[derive(Debug)]
pub(crate) struct CheckedComponent {
    pub script: script::Plan,
    pub options: template::Options,
    pub namespaces: Namespaces,
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
) -> R<CheckedComponent> {
    for script in c.instance.iter().chain(&c.module) {
        if script.typescript
            && let Some((_, span)) = rsvelte_typescript_compile::features::first_runtime_feature(
                c.javascript.get_program(script.program),
            )
        {
            return Err(unsupported(
                "TypeScript with runtime semantics",
                document_span(span),
            ));
        }
    }
    let input = ComponentInput::new(c, compiler_syntax_tree, source_text, "");
    let namespaces = Namespaces::build(&input.into());
    let options = template::check(c, compiler_syntax_tree, res, source_text, &namespaces)?;
    let script = script::plan(c, res)?;
    if let Some(&span) = script.called_runes.get("$host")
        && options.custom_element.is_none()
    {
        return Err(unsupported(
            "`$host()` without custom element options",
            span,
        ));
    }
    Ok(CheckedComponent {
        script,
        options,
        namespaces,
    })
}

/// What [`translate`] reads of one component.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Input<'a> {
    pub component: &'a Component,
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub resolution: &'a Resolution,
    pub analysis: &'a Analysis,
    pub checked: &'a CheckedComponent,
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
    let component_input = ComponentInput::new(
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
        let mut rw =
            script::ScriptRewrite::new(&b, input.resolution, &input.checked.script, input.server);
        let instance = c
            .instance
            .as_ref()
            .map(|s| c.javascript.get_program(s.program));
        let mut body = script::emit(&mut rw, instance, input.checked, &built.helpers);
        body.append(&mut declarations);
        let source_text = tree.source_text();
        let script = tree.keep_program(program(&b, source_text, body));
        let module_script = c.module.as_ref().map(|module| {
            let body = script::module(&mut rw, c.javascript.get_program(module.program));
            tree.keep_program(program(&b, source_text, body))
        });
        Ok((script, module_script, built))
    })?;
    let plan = &input.checked.script;
    Ok(Translation {
        javascript,
        script,
        module_script,
        server: input.server,
        stylesheet,
        stylesheet_hash: identity.stylesheet_hash,
        css_mode: input.checked.options.css_mode,
        destroy: plan.lifecycle.iter().any(|(name, _)| *name == "onDestroy"),
        tracking: plan.tracking(input.server),
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
