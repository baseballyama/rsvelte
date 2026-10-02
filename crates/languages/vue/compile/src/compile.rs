//! What `@vitejs/plugin-vue` produces for a production build.
//!
//! That is compileScript with the template inlined into `setup` (or, without a script,
//! compileTemplate's render function), the plugin's `_export_sfc` tail, and compileStyle's CSS.

mod style;
pub mod template;

use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_typescript::copy::{Rewrite, Verbatim, copy};
use rsvelte_typescript::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_vue::resolve::{BindingType, Resolution, call_name, is_static};
use rsvelte_vue::syntax_tree::SingleFileComponent;

type R<T> = Result<T, Unsupported>;

/// The compiled component.
#[derive(Debug)]
pub struct Output {
    pub javascript: String,
    /// compileStyle's result for each `<style>`, joined by newlines; `None` without a style.
    pub stylesheet: Option<String>,
}

/// A component as the compiler reads it, whatever syntax it was written in.
///
/// What a name in its expressions refers to is on the [`Resolution`] built from the same tree and
/// HIR ([`rsvelte_vue::resolve::resolve`]).
#[derive(Debug)]
pub struct CompileInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub javascript: &'a SyntaxTree,
    /// The `<script setup>` program; `None` without one.
    pub script: Option<NodeIdentifier>,
    /// The template; `None` without one.
    pub compiler_syntax_tree: Option<&'a CompilerSyntaxTree>,
    pub styles: Vec<StyleInput<'a>>,
    /// `<script setup lang="ts">`: the script and every template expression are TypeScript.
    pub typescript: bool,
    /// The document: spans index into it.
    pub source_text: &'a str,
}

#[derive(Clone, Copy, Debug)]
pub struct StyleInput<'a> {
    pub sheet: &'a rsvelte_stylesheet::StyleSheet,
    pub scoped: bool,
}

impl<'a> CompileInput<'a> {
    /// The Vue frontend's input: the parsed component and its HIR
    /// ([`rsvelte_vue::compiler_syntax_tree::lower`]).
    #[must_use]
    pub fn from_single_file_component(
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

/// compiler-sfc's macros other than `defineProps` and `defineOptions`, none of which the port
/// compiles yet.
const OTHER_MACROS: &[&str] = &[
    "defineEmits",
    "defineExpose",
    "defineSlots",
    "defineModel",
    "withDefaults",
];

const DEFINE_OPTIONS: &str = "defineOptions";

/// The keys `processDefineOptions` rejects: each has a macro of its own.
const OPTIONS_OWNED_BY_MACROS: &[&str] = &["props", "emits", "expose", "slots"];

/// `@vitejs/plugin-vue`'s scope identifier: the first 8 hex digits of the SHA-256 of the path.
#[must_use]
pub fn scope_identifier(path: &str) -> String {
    let digest = rsvelte_kernel::source::hashing::sha256(path.as_bytes());
    rsvelte_kernel::source::hashing::hex(&digest[..4])
}

/// # Errors
///
/// [`Unsupported`] for what the port does not compile yet.
pub fn compile(input: &CompileInput<'_>, res: &Resolution, path: &str) -> R<Output> {
    let source_text = input.source_text;
    let identifier = scope_identifier(path);
    let scoped = input.styles.iter().any(|s| s.scoped);
    let mut to = SyntaxTree::new();
    let mut body = Vec::new();
    let mut attached = Vec::new();
    if let Some(program) = input.script {
        script_setup(input, res, path, program, &mut to, &mut body)?;
    } else {
        // `const _sfc_main = {}`, then compileTemplate's module with `render` renamed.
        let main = to.identifier("_sfc_main");
        let empty = to.object(&[], SourceLocation::SYNTHETIC);
        body.push(to.let_(flag::CONST, main, Some(empty)));
        if let Some(compiler_syntax_tree) = input.compiler_syntax_tree {
            let t = template::transform(
                input.javascript,
                compiler_syntax_tree,
                source_text,
                res,
                false,
            )?;
            let (preamble, ret) = t.generate(input.javascript, res, false, &mut to);
            body.extend(preamble);
            let parameters = [to.identifier("_ctx"), to.identifier("_cache")];
            let r = to.return_(Some(ret), SourceLocation::SYNTHETIC);
            let block = to.block(&[r], SourceLocation::SYNTHETIC);
            let name = to.identifier("_sfc_render");
            body.push(to.function(
                true,
                Some(name),
                &parameters,
                block,
                false,
                SourceLocation::SYNTHETIC,
            ));
            attached.push(("render", to.identifier("_sfc_render")));
        }
    }
    if scoped {
        let v = to.write_string(&format!("data-v-{identifier}"));
        attached.push(("__scopeId", v));
    }
    let main = to.identifier("_sfc_main");
    let default = if attached.is_empty() {
        main
    } else {
        let local = to.identifier("_export_sfc");
        let spec = to.import_default(local, SourceLocation::SYNTHETIC);
        let source = to.write_string("plugin-vue:export-helper");
        body.push(to.import(&[spec], source, false, SourceLocation::SYNTHETIC));
        let pairs: Vec<NodeIdentifier> = attached
            .into_iter()
            .map(|(k, v)| {
                let k = to.write_string(k);
                to.array(&[k, v], SourceLocation::SYNTHETIC)
            })
            .collect();
        let list = to.array(&pairs, SourceLocation::SYNTHETIC);
        let callee = to.identifier("_export_sfc");
        let call = to.call0(callee, &[main, list]);
        to.mark_pure(call);
        call
    };
    body.push(to.export_default(default, SourceLocation::SYNTHETIC));
    let program = to.program(&body, SourceLocation::SYNTHETIC);
    let javascript =
        rsvelte_typescript_compile::codegen::print_program(&to, source_text, program).out;
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

mod script;
use script::script_setup;

#[cfg(test)]
mod tests;
