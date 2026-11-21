//! What `@vitejs/plugin-vue` produces for a production build.
//!
//! That is compileScript with the template inlined into `setup` (or, without a script,
//! compileTemplate's render function), the plugin's `_export_sfc` tail, and compileStyle's CSS.

mod out;
mod script;
mod style;
pub(crate) mod template;

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, Program};
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::{ProgramIdentifier, document_span};
use rsvelte_vue_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_vue_semantic::resolve::{BindingType, Resolution, call_name, is_static};
use rsvelte_vue_syntax::syntax_tree::SingleFileComponent;
use script::script_setup;

type R<T> = Result<T, Unsupported>;

/// The compiled component.
#[derive(Debug)]
pub(crate) struct Output {
    pub javascript: String,
    /// compileStyle's result for each `<style>`, joined by newlines; `None` without a style.
    pub stylesheet: Option<String>,
}

/// A parsed component and its HIR ([`rsvelte_vue_semantic::compiler_syntax_tree::lower`]).
///
/// What a name in its expressions refers to is on the [`Resolution`] built from the same tree and
/// HIR ([`rsvelte_vue_semantic::resolve::resolve`]).
#[derive(Clone, Copy, Debug)]
pub(crate) struct CompileInput<'a> {
    pub component: &'a SingleFileComponent,
    /// The template; `None` without one.
    pub compiler_syntax_tree: Option<&'a CompilerSyntaxTree>,
    /// The document: spans index into it.
    pub source_text: &'a str,
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
    let (component, source_text) = (input.component, input.source_text);
    let javascript = &component.javascript;
    let script = component.script.as_ref().map(|s| s.program);
    let identifier = scope_identifier(path);
    let scoped = component.styles.iter().any(|s| s.scoped);
    let allocator = Allocator::default();
    let b = Builder::new(&allocator);
    let mut body = Vec::new();
    let mut attached: Vec<(&str, Expression<'_>)> = Vec::new();
    if let Some(program) = script {
        script_setup(input, res, path, program, &b, &mut body)?;
    } else {
        // `const _sfc_main = {}`, then compileTemplate's module with `render` renamed.
        body.push(b.const_("_sfc_main", b.object([])));
        if let Some(compiler_syntax_tree) = input.compiler_syntax_tree {
            let t = template::transform(javascript, compiler_syntax_tree, source_text, res, false)?;
            let (preamble, ret) = t.generate(javascript, res, false, &b);
            body.extend(preamble);
            body.push(b.function_declaration(
                "_sfc_render",
                b.parameters(["_ctx", "_cache"]),
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
    body.push(b.export_default(default));
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
    if component.typescript {
        // Upstream's build hands compileScript's TypeScript to a transform that erases it.
        if let Some(script) = script
            && let Some((_, span)) = rsvelte_typescript_compile::features::first_runtime_feature(
                javascript.get_program(script),
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
    let stylesheet = if component.styles.is_empty() {
        None
    } else {
        let parts: Vec<String> = component
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

#[cfg(test)]
mod tests;
