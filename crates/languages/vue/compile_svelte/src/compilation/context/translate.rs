use oxc_ast::ast::Program;
use oxc_ast_visit::VisitMut;
use oxc_span::{SPAN, SourceType};
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_compile::strip::Strip;
use rsvelte_typescript_tree::Tree;

use super::{Info, Names, R, Resolution, Target, Translation, span_of, unsupported};

/// The whole translation: the script first, as the template reads what it declares.
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
    let (class, props) = crate::script::classify(sfc, resolution, &mut names)?;
    let info = Info {
        from,
        source_text,
        resolution,
        target,
        typescript: sfc.typescript,
        class,
        props,
        top: crate::script::top_level(script),
    };
    let roots = compiler_syntax_tree.map_or_else(Vec::new, crate::template::fallthrough_targets);
    let attributes = (!roots.is_empty()).then(|| names.fresh("attrs"));
    let (javascript, (program, compiler_syntax_tree)) = Tree::build(source_text, |tree| {
        let b = Builder::new(tree.allocator());
        let template = crate::template::translate(
            &info,
            compiler_syntax_tree,
            &roots,
            attributes.as_deref(),
            tree,
            &b,
            &mut names,
        )?;
        let body = crate::script::emit(sfc, &info, attributes.as_deref(), &b, &mut names)?;
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
