use super::{
    Info, Names, R, Resolution, SourceLocation, SyntaxTree, Target, Translation, unsupported,
};

/// The whole translation: the script first, as the template reads what it declares.
pub(crate) fn translate(
    sfc: &rsvelte_vue::syntax_tree::SingleFileComponent,
    compiler_syntax_tree: Option<&rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTree>,
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
    if let Some(t) = from.typescript_runtime.first() {
        return Err(unsupported(
            "a TypeScript construct with a runtime value",
            t.span,
        ));
    }
    let mut names = Names::default();
    let (class, props) = crate::script::classify(sfc, resolution, source_text, &mut names)?;
    let info = Info::new(from, source_text, resolution, target, class, props);
    let mut to = SyntaxTree::new();
    let roots = compiler_syntax_tree.map_or_else(Vec::new, crate::template::fallthrough_targets);
    let attributes = (!roots.is_empty()).then(|| names.fresh(from, "attrs"));
    let template = crate::template::translate(
        &info,
        compiler_syntax_tree,
        &roots,
        attributes.as_deref(),
        &mut to,
        &mut names,
    )?;
    let body = crate::script::emit(sfc, &info, attributes.as_deref(), &mut to, &mut names)?;
    let mut statements = names.imports(&mut to);
    statements.extend(template.hoisted);
    statements.extend(body);
    let program = to.program(&statements, SourceLocation::SYNTHETIC);
    Ok(Translation {
        javascript: to,
        program,
        compiler_syntax_tree: template.compiler_syntax_tree,
        template_expressions: template.expressions,
    })
}
