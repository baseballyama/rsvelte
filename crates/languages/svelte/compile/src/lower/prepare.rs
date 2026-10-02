use super::{
    Children, CompileInput, CompilerNodeIdentifier, CompilerSyntaxTree, Diagnostic, FxHashMap,
    NodeKind, Prepared, Resolution, SyntaxTree, Target, check_runes, check_stores, names, script,
    validation,
};

pub(super) fn prepare(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: Target,
) -> Result<Prepared, Diagnostic> {
    validation::check_typescript(input)?;
    let javascript = input.component.javascript;
    check_stores(
        javascript,
        res,
        input.component.source_text,
        input.component.program,
    )?;
    check_runes(input, res, target)?;
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
    let mut out = SyntaxTree::new();
    let mut hoisted = Vec::new();
    let mut rewrite = script::ScriptRewrite {
        target,
        res,
        source_text: input.component.source_text,
        each: None,
    };
    let instance = script::lower_instance(
        javascript,
        &mut out,
        &mut rewrite,
        input.component.program,
        &mut hoisted,
        &mut names,
    )?;
    Ok(Prepared {
        out,
        names,
        each_index,
        hoisted,
        instance,
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
            match &compiler_syntax_tree.node(identifier).kind {
                NodeKind::Element(el) => walk(compiler_syntax_tree, el.children, names, out),
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    for b in compiler_syntax_tree.branches(*branches) {
                        walk(compiler_syntax_tree, b.body, names, out);
                    }
                    if let Some(o) = otherwise {
                        walk(compiler_syntax_tree, *o, names, out);
                    }
                }
                NodeKind::Each(each) => {
                    if let Some(f) = each.fallback {
                        walk(compiler_syntax_tree, f, names, out);
                    }
                    walk(compiler_syntax_tree, each.body, names, out);
                    out.insert(identifier, names.unique("$$index"));
                }
                NodeKind::Text { .. } | NodeKind::Comment { .. } | NodeKind::Expression { .. } => {}
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
