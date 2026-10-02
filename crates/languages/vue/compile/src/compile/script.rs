use super::{
    BindingType, CompileInput, DEFINE_OPTIONS, DeclarationKind, Kind, NodeIdentifier,
    OPTIONS_OWNED_BY_MACROS, OTHER_MACROS, R, Resolution, Rewrite, ScopeIdentifier, SourceLocation,
    SyntaxTree, Unsupported, Verbatim, call_name, copy, flag, is_static, template,
};

/// compileScript for `<script setup>` with `inlineTemplate`.
pub(super) fn script_setup(
    input: &CompileInput<'_>,
    res: &Resolution,
    path: &str,
    program: NodeIdentifier,
    to: &mut SyntaxTree,
    out: &mut Vec<NodeIdentifier>,
) -> R<()> {
    let (syntax_tree, source_text) = (input.javascript, input.source_text);
    let Kind::Program(statements) = syntax_tree.kind(program) else {
        unreachable!("a script parses to a program")
    };
    let SetupStatements {
        imports,
        hoisted,
        setup,
        options,
    } = partition_setup_statements(syntax_tree, statements, res)?;
    let Some(compiler_syntax_tree) = input.compiler_syntax_tree else {
        return Err(Unsupported::nowhere(
            "a <script setup> without a <template>",
        ));
    };
    if let Some(d) = res.define_props
        && d.runtime.is_none()
    {
        return Err(Unsupported::at(
            "defineProps without a runtime declaration",
            syntax_tree.source_location(d.call),
        ));
    }
    if input.typescript {
        out.push(define_component_import(to));
    }
    let tpl = template::transform(syntax_tree, compiler_syntax_tree, source_text, res, true)?;
    let (preamble, ret) = tpl.generate(syntax_tree, res, true, to);
    out.extend(preamble);
    for s in imports {
        if let Some(i) = without_macros(syntax_tree, source_text, to, s) {
            out.push(i);
        }
    }
    for s in hoisted {
        out.push(copy(syntax_tree, to, &mut Verbatim, s));
    }
    let mut rw = SetupRewrite {
        call: res.define_props.map(|d| d.call),
    };
    let mut setup_body: Vec<NodeIdentifier> = setup
        .iter()
        .map(|&s| copy(syntax_tree, to, &mut rw, s))
        .collect();
    let render_parameters = [to.identifier("_ctx"), to.identifier("_cache")];
    let ret_statement = to.return_(Some(ret), SourceLocation::SYNTHETIC);
    let render_body = to.block(&[ret_statement], SourceLocation::SYNTHETIC);
    let render = to.arrow(
        &render_parameters,
        render_body,
        false,
        false,
        SourceLocation::SYNTHETIC,
    );
    setup_body.push(to.return_(Some(render), SourceLocation::SYNTHETIC));
    let mut fields = Vec::new();
    if let Some(name) = component_name(path) {
        let key = to.identifier("__name");
        let value = to.write_string(name);
        fields.push(to.property(key, value, 0, SourceLocation::SYNTHETIC));
    }
    if let Some(runtime) = res.define_props.and_then(|d| d.runtime) {
        let key = to.identifier("props");
        let value = copy(syntax_tree, to, &mut Verbatim, runtime);
        fields.push(to.property(key, value, 0, SourceLocation::SYNTHETIC));
    }
    let block = to.block(&setup_body, SourceLocation::SYNTHETIC);
    let props = to.identifier("__props");
    let setup_fn = to.function(
        false,
        None,
        &[props],
        block,
        false,
        SourceLocation::SYNTHETIC,
    );
    let key = to.identifier("setup");
    fields.push(to.property(key, setup_fn, flag::METHOD, SourceLocation::SYNTHETIC));
    let defined = options.map(|o| copy(syntax_tree, to, &mut Verbatim, o));
    let main = component_object(to, fields, defined, input.typescript);
    let name = to.identifier("_sfc_main");
    out.push(to.let_(flag::CONST, name, Some(main)));
    Ok(())
}

/// `import { defineComponent as _defineComponent } from 'vue'`.
pub(super) fn define_component_import(to: &mut SyntaxTree) -> NodeIdentifier {
    let imported = to.identifier("defineComponent");
    let local = to.identifier("_defineComponent");
    let spec = to.import_named(imported, local, false, SourceLocation::SYNTHETIC);
    let source = to.write_string("vue");
    to.import(&[spec], source, false, SourceLocation::SYNTHETIC)
}

/// The component object, merged with `defineOptions`' argument.
pub(super) fn component_object(
    to: &mut SyntaxTree,
    mut fields: Vec<NodeIdentifier>,
    defined: Option<NodeIdentifier>,
    typescript: bool,
) -> NodeIdentifier {
    if typescript {
        // `defineComponent({ ...options, … })`: a spread keeps the type of the merged object.
        if let Some(o) = defined {
            fields.insert(0, to.spread(o, SourceLocation::SYNTHETIC));
        }
        let object = to.object(&fields, SourceLocation::SYNTHETIC);
        let callee = to.identifier("_defineComponent");
        let call = to.call0(callee, &[object]);
        to.mark_pure(call);
        return call;
    }
    let object = to.object(&fields, SourceLocation::SYNTHETIC);
    let Some(o) = defined else {
        return object;
    };
    // Without TypeScript, compileScript cannot rely on spread: `Object.assign(options, …)`.
    let target = to.identifier("Object");
    let callee = to.dot(target, "assign");
    let call = to.call0(callee, &[o, object]);
    to.mark_pure(call);
    call
}

/// compiler-sfc `processDefineOptions` and its `checkInvalidScopeReference`: the options object
/// (`None` for a call without one), refusing what upstream reports as an error. An argument other
/// than an object literal is not compiled yet.
pub(super) fn define_options(
    syntax_tree: &SyntaxTree,
    res: &Resolution,
    call: NodeIdentifier,
) -> R<Option<NodeIdentifier>> {
    let Kind::Call { arguments, .. } = syntax_tree.kind(call) else {
        unreachable!("a defineOptions() call")
    };
    let Some(&arg) = arguments.first() else {
        return Ok(None);
    };
    let Kind::Object(props) = syntax_tree.kind(arg) else {
        return Err(Unsupported::at(
            "defineOptions() with an argument other than an object literal",
            syntax_tree.source_location(arg),
        ));
    };
    for &p in props {
        if let Kind::Property { key, .. } = syntax_tree.kind(p)
            && matches!(syntax_tree.kind(key), Kind::Identifier(_))
            && OPTIONS_OWNED_BY_MACROS.contains(&syntax_tree.name(key))
        {
            return Err(Unsupported::at(
                "a defineOptions() key that has a macro of its own",
                syntax_tree.source_location(p),
            ));
        }
    }
    let mut stack = vec![arg];
    while let Some(n) = stack.pop() {
        match syntax_tree.kind(n) {
            Kind::Identifier(_) => {
                let local = res.sem.binding_of(n).is_some_and(|b| {
                    let b = &res.sem.bindings[b];
                    b.scope == ScopeIdentifier::ROOT
                        && b.kind != DeclarationKind::Import
                        && b.node != n
                });
                let literal = syntax_tree
                    .atom(n)
                    .and_then(|a| res.binding_type(a))
                    .is_some_and(|t| t == BindingType::LiteralConst);
                if local && !literal {
                    return Err(Unsupported::at(
                        "defineOptions() referencing a binding of <script setup>",
                        syntax_tree.source_location(n),
                    ));
                }
            }
            Kind::Call { .. } if call_name(syntax_tree, n).is_some_and(is_macro) => {
                return Err(Unsupported::at(
                    "this compiler macro",
                    syntax_tree.source_location(n),
                ));
            }
            _ => {}
        }
        syntax_tree.for_each_child(n, |k| stack.push(k));
    }
    Ok(Some(arg))
}

pub(super) fn is_macro(name: &str) -> bool {
    name == "defineProps" || name == DEFINE_OPTIONS || OTHER_MACROS.contains(&name)
}

pub(super) struct SetupStatements {
    imports: Vec<NodeIdentifier>,
    hoisted: Vec<NodeIdentifier>,
    setup: Vec<NodeIdentifier>,
    /// `defineOptions`' argument.
    options: Option<NodeIdentifier>,
}

pub(super) fn partition_setup_statements(
    syntax_tree: &SyntaxTree,
    statements: &[NodeIdentifier],
    resolution: &Resolution,
) -> R<SetupStatements> {
    let props_statement = resolution.define_props.map(|d| d.statement);
    let mut imports = Vec::new();
    let mut hoisted = Vec::new();
    let mut setup = Vec::new();
    // `hasDefineOptionsCall`: set by a call with an argument only.
    let mut options: Option<NodeIdentifier> = None;
    for &s in statements {
        if let Kind::ExpressionStatement(e) = syntax_tree.kind(s)
            && call_name(syntax_tree, e) == Some(DEFINE_OPTIONS)
        {
            if options.is_some() {
                return Err(Unsupported::at(
                    "a duplicate defineOptions() call",
                    syntax_tree.source_location(e),
                ));
            }
            options = define_options(syntax_tree, resolution, e)?;
            continue;
        }
        refuse_unsupported(syntax_tree, s)?;
        match syntax_tree.kind(s) {
            Kind::Import { .. } => imports.push(s),
            Kind::VariableDeclaration { kind, declarations }
                if kind == flag::CONST
                    && declarations.iter().all(|&d| match syntax_tree.kind(d) {
                        Kind::Declarator {
                            identifier,
                            initializer,
                        } => {
                            matches!(syntax_tree.kind(identifier), Kind::Identifier(_))
                                && initializer.is_some_and(|i| is_static(syntax_tree, i))
                        }
                        _ => false,
                    }) =>
            {
                hoisted.push(s);
            }
            Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. } => hoisted.push(s),
            _ if Some(s) == props_statement
                && resolution
                    .define_props
                    .is_some_and(|d| d.declaration.is_none()) => {}
            _ => setup.push(s),
        }
    }
    Ok(SetupStatements {
        imports,
        hoisted,
        setup,
        options,
    })
}

pub(super) fn refuse_unsupported(syntax_tree: &SyntaxTree, s: NodeIdentifier) -> R<()> {
    let mut stack = vec![s];
    while let Some(n) = stack.pop() {
        match syntax_tree.kind(n) {
            Kind::Call { .. }
                if call_name(syntax_tree, n)
                    .is_some_and(|c| c == DEFINE_OPTIONS || OTHER_MACROS.contains(&c)) =>
            {
                return Err(Unsupported::at(
                    "this compiler macro",
                    syntax_tree.source_location(n),
                ));
            }
            Kind::Await(_) => {
                return Err(Unsupported::at(
                    "top-level await",
                    syntax_tree.source_location(n),
                ));
            }
            Kind::Function { .. } | Kind::Arrow { .. } => continue,
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(Unsupported::at(
                    "an export in <script setup>",
                    syntax_tree.source_location(n),
                ));
            }
            _ => {}
        }
        syntax_tree.for_each_child(n, |k| stack.push(k));
    }
    Ok(())
}

/// An import with the macro specifiers compileScript removes; `None` when nothing remains.
pub(super) fn without_macros(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    to: &mut SyntaxTree,
    s: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let Kind::Import {
        specifiers,
        source,
        type_only,
    } = syntax_tree.kind(s)
    else {
        unreachable!("an import")
    };
    if syntax_tree.str_value(source, source_text) != "vue" {
        return Some(copy(syntax_tree, to, &mut Verbatim, s));
    }
    let kept: Vec<NodeIdentifier> = specifiers
        .iter()
        .copied()
        .filter(|&sp| match syntax_tree.kind(sp) {
            Kind::ImportNamed { imported, .. } => !is_macro(syntax_tree.name(imported)),
            _ => true,
        })
        .collect();
    if kept.is_empty() && !specifiers.is_empty() {
        return None;
    }
    let specs: Vec<NodeIdentifier> = kept
        .iter()
        .map(|&sp| copy(syntax_tree, to, &mut Verbatim, sp))
        .collect();
    let source = copy(syntax_tree, to, &mut Verbatim, source);
    Some(to.import(&specs, source, type_only, syntax_tree.source_location(s)))
}

/// compileScript's `__name`: the file name without its extension.
pub(super) fn component_name(path: &str) -> Option<&str> {
    let file = path.rsplit(['/', '\\']).next()?;
    let dot = file.rfind('.')?;
    let ext = &file[dot + 1..];
    (dot > 0 && !ext.is_empty() && ext.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_'))
        .then(|| &file[..dot])
}

/// `const props = defineProps(…)` becomes `const props = __props`.
pub(super) struct SetupRewrite {
    call: Option<NodeIdentifier>,
}

impl Rewrite for SetupRewrite {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if Some(identifier) == self.call {
            return Some(to.ident("__props", from.source_location(identifier)));
        }
        None
    }
}
