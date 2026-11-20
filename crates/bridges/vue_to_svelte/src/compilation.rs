pub(crate) mod context;
pub(crate) mod script;
pub(crate) mod template;

use context::{Info, Names, R, span_of, unsupported};
use oxc_ast::ast::Program;
use oxc_ast_visit::VisitMut;
use oxc_span::{SPAN, SourceType};
use rsvelte_svelte_compile::{CompileInput, Target};
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_compile::strip::Strip;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rsvelte_vue_semantic::resolve::Resolution;

/// The component as the Svelte compiler reads it: a runes instance program and a Svelte HIR, in a
/// tree of their own over the `.vue` document's text.
#[derive(Debug)]
pub(crate) struct Translation {
    /// The instance program and every expression the HIR names.
    pub(crate) javascript: Tree,
    pub(crate) program: ProgramIdentifier,
    pub(crate) compiler_syntax_tree:
        rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree,
}

impl Translation {
    #[must_use]
    pub(crate) const fn compile_input<'a>(
        &'a self,
        source_text: &'a str,
        filename: &'a str,
    ) -> CompileInput<'a> {
        CompileInput {
            component: rsvelte_svelte_semantic::input::ComponentInput {
                javascript: &self.javascript,
                instance: Some(self.program),
                module: None,
                compiler_syntax_tree: &self.compiler_syntax_tree,
                style: None,
                source_text,
                filename,
            },
            // Vue's text is already condensed; Svelte's cleaning would condense it again.
            preserve_whitespace: true,
        }
    }
}

/// Translates the Vue plugin's artifacts for one target: the script first, as the template reads
/// what it declares.
///
/// # Errors
///
/// A `compile_unsupported` [`Diagnostic`](rsvelte_kernel::diagnostics::Diagnostic) for what svue
/// does not translate (the crate's doc lists every refusal).
pub(crate) fn translate(
    sfc: &rsvelte_vue_syntax::syntax_tree::SingleFileComponent,
    compiler_syntax_tree: Option<&rsvelte_vue_semantic::compiler_syntax_tree::CompilerSyntaxTree>,
    resolution: &Resolution,
    source_text: &str,
    target: Target,
) -> R<Translation> {
    let from = &sfc.javascript;
    if let Some(style) = sfc.styles.first() {
        return Err(unsupported(
            "`<style>` (Vue scopes it with `data-v-` attributes, Svelte by its own rules)",
            style.span,
        ));
    }
    let script = from.get_program(sfc.program);
    if sfc.typescript
        && let Some((_, span)) = rsvelte_typescript_compile::features::first_runtime_feature(script)
    {
        return Err(unsupported(
            "a TypeScript construct with a runtime value",
            span_of(span),
        ));
    }
    let mut names = Names::new(sfc, compiler_syntax_tree);
    let (class, props) = script::classify(sfc, resolution, &mut names)?;
    let info = Info {
        from,
        source_text,
        resolution,
        target,
        typescript: sfc.typescript,
        class,
        props,
        top: script::top_level(script),
    };
    let roots = compiler_syntax_tree.map_or_else(Vec::new, template::fallthrough_targets);
    let attributes = (!roots.is_empty()).then(|| names.fresh("attrs"));
    let (javascript, (program, compiler_syntax_tree)) = Tree::build(source_text, |tree| {
        let b = Builder::new(tree.allocator());
        let template = template::translate(
            &info,
            compiler_syntax_tree,
            &roots,
            attributes.as_deref(),
            tree,
            &b,
            &mut names,
        )?;
        let body = script::emit(sfc, &info, attributes.as_deref(), &b, &mut names)?;
        let mut statements = names.imports(&b);
        statements.extend(template.hoisted);
        statements.extend(body);
        let mut program = Program::new(
            SPAN,
            SourceType::mjs(),
            tree.source_text(),
            [],
            None,
            [],
            b.vec(statements),
            &b,
        );
        if info.typescript {
            Strip::new(tree.allocator()).visit_program(&mut program);
        }
        Ok((tree.keep_program(program), template.compiler_syntax_tree))
    })?;
    Ok(Translation {
        javascript,
        program,
        compiler_syntax_tree,
    })
}
