use super::{
    Children, CompilerNodeIdentifier, CompilerSyntaxTree, Diagnostic, FxHashMap, NodeKind,
    Prepared, SyntaxTree, Target, check_runes, names, script,
};

pub(super) fn prepare<'a>(
    facts: super::Lowering<'a, '_>,
    target: Target,
) -> Result<Prepared<'a>, Diagnostic> {
    let input = facts.input;
    let res = facts.res;
    let custom_element = facts.validated.custom_element.as_ref();
    let javascript = input.component.javascript;
    check_runes(input, res, target, custom_element.is_some())?;
    let declared = res
        .sem
        .bindings
        .iter()
        .map(|binding| javascript.atoms.get(binding.name));
    let referenced = res
        .sem
        .references
        .iter()
        .map(|reference| javascript.name(reference.node));
    let mut names = names::Names::new(declared, referenced);
    let each_index = each_index_names(input.component.compiler_syntax_tree, &mut names);
    let component_name = names.generate(&facts.identity.name);
    let mut out = SyntaxTree::new();
    let mut hoisted = Vec::new();
    let mut rewrite = script::ScriptRewrite {
        target,
        accessors: custom_element.is_some(),
        rest_reads: Some(&facts.validated.rest_reads),
        res,
        source_text: input.component.source_text,
        template: None,
    };
    if let Some(module) = input.component.module {
        let statements = script::lower_script(
            javascript,
            &mut out,
            &mut rewrite,
            module,
            &mut hoisted,
            &mut names,
            script::ScriptContext::Module,
        )?;
        hoisted.extend(statements);
    }
    let instance = script::lower_script(
        javascript,
        &mut out,
        &mut rewrite,
        input.component.program,
        &mut hoisted,
        &mut names,
        script::ScriptContext::Instance,
    )?;
    Ok(Prepared {
        out,
        names,
        each_index,
        hoisted,
        instance,
        custom_element,
        component_name,
    })
}

/// Each `{#each}`'s `$$index` name. Upstream takes them from `scope.root.unique` while it builds
/// the scopes, before any transform: the collection, then the fallback, then the body, then the
/// block itself.
fn each_index_names(
    compiler_syntax_tree: &CompilerSyntaxTree,
    names: &mut names::Names,
) -> FxHashMap<CompilerNodeIdentifier, String> {
    fn walk(
        compiler_syntax_tree: &CompilerSyntaxTree,
        list: Children,
        names: &mut names::Names,
        out: &mut FxHashMap<CompilerNodeIdentifier, String>,
    ) {
        for &identifier in compiler_syntax_tree.children(list) {
            if let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind {
                if let Some(f) = each.fallback {
                    walk(compiler_syntax_tree, f, names, out);
                }
                walk(compiler_syntax_tree, each.body, names, out);
                out.insert(identifier, names.unique("$$index"));
                continue;
            }
            for c in compiler_syntax_tree.child_lists(identifier) {
                walk(compiler_syntax_tree, c, names, out);
            }
        }
    }
    let mut out = FxHashMap::default();
    walk(
        compiler_syntax_tree,
        compiler_syntax_tree.root,
        names,
        &mut out,
    );
    out
}
