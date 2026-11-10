use oxc_ast::AstKind;
use oxc_semantic::SymbolId;
use oxc_syntax::symbol::SymbolFlags;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::{
    Builder, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Diagnostic, FxHashMap, NodeKind,
    Prepared, Target, check_runes, names, script,
};

pub(super) fn prepare<'c, 'o>(
    facts: super::Lowering<'c, 'o>,
    target: Target,
    b: &Builder<'o>,
) -> Result<Prepared<'c, 'o>, Diagnostic> {
    let input = facts.input;
    let res = facts.res;
    let custom_element = facts.validated.custom_element.as_ref();
    let javascript = input.component.javascript;
    check_runes(input, res, target, custom_element.is_some())?;
    let scoping = res.scoping();
    // Upstream erases types before it builds scopes, so a type's name is free.
    let declared = scoping
        .symbol_ids()
        .filter(|&s| {
            let flags = scoping.symbol_flags(s);
            flags.intersects(SymbolFlags::Value | SymbolFlags::Import) && !declared_in_type(res, s)
        })
        .map(|s| scoping.symbol_name(s));
    let referenced = scoping
        .root_unresolved_references()
        .iter()
        .filter(|(_, references)| {
            references
                .iter()
                .any(|&r| scoping.get_reference(r).flags().is_value())
        })
        .map(|(name, _)| name.as_str());
    let mut names = names::Names::new(declared, referenced);
    let each_index = each_index_names(input.component.compiler_syntax_tree, &mut names);
    let component_name = names.generate(&facts.identity.name);
    let mut module = Vec::new();
    let mut hoisted = Vec::new();
    let mut rewrite = script::ScriptRewrite {
        b,
        target,
        accessors: custom_element.is_some(),
        rest_reads: Some(&facts.validated.rest_reads),
        res,
        template: None,
    };
    if let Some(program) = input.component.module {
        let statements = script::lower_script(
            &mut rewrite,
            javascript.get_program(program),
            &mut module,
            &mut names,
            script::ScriptContext::Module,
        )?;
        module.extend(statements);
    }
    let mut exports = Vec::new();
    let instance = match input.component.instance {
        Some(program) => script::lower_script(
            &mut rewrite,
            javascript.get_program(program),
            &mut hoisted,
            &mut names,
            script::ScriptContext::Instance {
                exports: &mut exports,
            },
        )?,
        None => Vec::new(),
    };
    Ok(Prepared {
        names,
        each_index,
        module,
        hoisted,
        instance,
        exports,
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

/// A name a type declares, such as a function type's parameter, which erasing types removes.
fn declared_in_type(res: &Resolution, symbol: SymbolId) -> bool {
    let scoping = res.scoping();
    let scope = scoping.get_node_id(scoping.symbol_scope_id(symbol));
    match res.semantic().nodes().kind(scope) {
        AstKind::TSFunctionType(_)
        | AstKind::TSConstructorType(_)
        | AstKind::TSMethodSignature(_)
        | AstKind::TSCallSignatureDeclaration(_)
        | AstKind::TSConstructSignatureDeclaration(_)
        | AstKind::TSMappedType(_)
        | AstKind::TSConditionalType(_) => true,
        AstKind::Function(f) => f.body.is_none(),
        _ => false,
    }
}
