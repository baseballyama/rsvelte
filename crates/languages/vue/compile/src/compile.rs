//! What `@vitejs/plugin-vue` produces for a production build.
//!
//! That is compileScript with the template inlined into `setup` (or, without a script,
//! compileTemplate's render function), the plugin's `_export_sfc` tail, and compileStyle's CSS.

mod out;
mod style;
pub(crate) mod template;

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, Program};
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rsvelte_vue_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_vue_semantic::resolve::{BindingType, Resolution, call_name, is_static};
use rsvelte_vue_syntax::syntax_tree::SingleFileComponent;

type R<T> = Result<T, Unsupported>;

/// The compiled component.
#[derive(Debug)]
pub(crate) struct Output {
    pub javascript: String,
    /// compileStyle's result for each `<style>`, joined by newlines; `None` without a style.
    pub stylesheet: Option<String>,
}

/// A component as the compiler reads it, whatever syntax it was written in.
///
/// What a name in its expressions refers to is on the [`Resolution`] built from the same tree and
/// HIR ([`rsvelte_vue_semantic::resolve::resolve`]).
#[derive(Debug)]
pub(crate) struct CompileInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub javascript: &'a Tree,
    /// The `<script setup>` program; `None` without one.
    pub script: Option<ProgramIdentifier>,
    /// The template; `None` without one.
    pub compiler_syntax_tree: Option<&'a CompilerSyntaxTree>,
    pub styles: Vec<StyleInput<'a>>,
    /// `<script setup lang="ts">`: the script and every template expression are TypeScript.
    pub typescript: bool,
    /// The document: spans index into it.
    pub source_text: &'a str,
}

#[derive(Clone, Copy, Debug)]
pub(crate) struct StyleInput<'a> {
    pub sheet: &'a rsvelte_stylesheet_syntax::StyleSheet,
    pub scoped: bool,
}

impl<'a> CompileInput<'a> {
    /// The Vue frontend's input: the parsed component and its HIR
    /// ([`rsvelte_vue_semantic::compiler_syntax_tree::lower`]).
    #[must_use]
    pub(crate) fn from_single_file_component(
        c: &'a SingleFileComponent,
        compiler_syntax_tree: Option<&'a CompilerSyntaxTree>,
        source_text: &'a str,
    ) -> Self {
        Self {
            javascript: &c.javascript,
            script: c.script.as_ref().map(|s| s.program),
            compiler_syntax_tree,
            styles: c
                .styles
                .iter()
                .map(|s| StyleInput {
                    sheet: &s.sheet,
                    scoped: s.scoped,
                })
                .collect(),
            typescript: c.typescript,
            source_text,
        }
    }
}

/// `@vitejs/plugin-vue`'s scope identifier: the first 8 hex digits of the SHA-256 of the path.
#[must_use]
pub(crate) fn scope_identifier(path: &str) -> String {
    let digest = crate::hashing::sha256(path.as_bytes());
    crate::hashing::hex(&digest[..4])
}

/// # Errors
///
/// [`Unsupported`] for what the port does not compile yet.
pub(crate) fn compile(input: &CompileInput<'_>, res: &Resolution, path: &str) -> R<Output> {
    let source_text = input.source_text;
    let identifier = scope_identifier(path);
    let scoped = input.styles.iter().any(|s| s.scoped);
    let allocator = Allocator::default();
    let b = Builder::new(&allocator);
    let mut body = Vec::new();
    let mut attached: Vec<(&str, Expression<'_>)> = Vec::new();
    if let Some(program) = input.script {
        script_setup(input, res, path, program, &b, &mut body)?;
    } else {
        // `const _sfc_main = {}`, then compileTemplate's module with `render` renamed.
        body.push(b.const_("_sfc_main", b.object([])));
        if let Some(compiler_syntax_tree) = input.compiler_syntax_tree {
            let t = template::transform(
                input.javascript,
                compiler_syntax_tree,
                source_text,
                res,
                false,
            )?;
            let (preamble, ret) = t.generate(input.javascript, res, false, &b);
            body.extend(preamble);
            body.push(b.function_declaration(
                "_sfc_render",
                b.params(["_ctx", "_cache"]),
                [b.return_(Some(ret))],
                false,
            ));
            attached.push(("render", b.id("_sfc_render")));
        }
    }
    if scoped {
        attached.push(("__scopeId", b.string(&format!("data-v-{identifier}"))));
    }
    let main = b.id("_sfc_main");
    let default = if attached.is_empty() {
        main
    } else {
        body.push(out::import_default(
            &b,
            "_export_sfc",
            "plugin-vue:export-helper",
        ));
        let pairs = attached.into_iter().map(|(k, v)| b.array([b.string(k), v]));
        out::pure_call(&b, b.id("_export_sfc"), [main, b.array(pairs)])
    };
    body.push(out::export_default(&b, default));
    let mut program = Program::new(
        SPAN,
        SourceType::mjs(),
        source_text,
        [],
        None,
        [],
        b.vec(body),
        &b,
    );
    if input.typescript {
        // Upstream's build hands compileScript's TypeScript to a transform that erases it.
        if let Some(script) = input.script
            && let Some((_, span)) = rsvelte_typescript_compile::features::first_runtime_feature(
                input.javascript.get_program(script),
            )
        {
            return Err(Unsupported::at(
                "TypeScript that erasing types cannot compile",
                document_span(span),
            ));
        }
        oxc_ast_visit::VisitMut::visit_program(
            &mut rsvelte_typescript_compile::strip::Strip::new(&allocator),
            &mut program,
        );
    }
    let javascript = rsvelte_typescript_compile::print::print(&program);
    let stylesheet = if input.styles.is_empty() {
        None
    } else {
        let parts: Vec<String> = input
            .styles
            .iter()
            .map(|s| style::compile(source_text, s, &identifier))
            .collect::<R<_>>()?;
        Some(parts.join("\n"))
    };
    Ok(Output {
        javascript,
        stylesheet,
    })
}

/// A span of an oxc tree read from the document, as the kernel holds it.
pub(crate) const fn document_span(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

mod script;
use script::script_setup;

#[cfg(test)]
mod tests;
