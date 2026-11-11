use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    BindingPattern, CallExpression, Expression, IdentifierReference, ImportDeclarationSpecifier,
    ModuleExportName, ObjectPropertyKind, PropertyKey, Statement, VariableDeclarationKind,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{ScopeFlags, SymbolFlags};
use oxc_span::GetSpan;

use super::{
    BindingType, Builder, CompileInput, ProgramIdentifier, R, Resolution, Unsupported, call_name,
    document_span, is_static, out, template,
};

/// compiler-sfc's macros other than `defineProps` and `defineOptions`, none of which the port
/// compiles yet.
const OTHER_MACROS: &[&str] = &[
    "defineEmits",
    "defineExpose",
    "defineSlots",
    "defineModel",
    "withDefaults",
];

/// The keys `processDefineOptions` rejects: each has a macro of its own.
const OPTIONS_OWNED_BY_MACROS: &[&str] = &["props", "emits", "expose", "slots"];

const DEFINE_OPTIONS: &str = "defineOptions";

/// compileScript for `<script setup>` with `inlineTemplate`.
pub(super) fn script_setup<'o>(
    input: &CompileInput<'_>,
    res: &Resolution,
    path: &str,
    program: ProgramIdentifier,
    b: &Builder<'o>,
    out: &mut Vec<Statement<'o>>,
) -> R<()> {
    let (javascript, source_text) = (input.javascript, input.source_text);
    let statements = &javascript.get_program(program).body;
    let SetupStatements {
        imports,
        hoisted,
        setup,
        options,
    } = partition_setup_statements(statements, res)?;
    let Some(compiler_syntax_tree) = input.compiler_syntax_tree else {
        return Err(Unsupported::nowhere(
            "a <script setup> without a <template>",
        ));
    };
    let define_props = res.define_props();
    if let Some(d) = &define_props
        && d.runtime.is_none()
    {
        return Err(Unsupported::at(
            "defineProps without a runtime declaration",
            document_span(d.call.span),
        ));
    }
    if input.typescript {
        out.push(define_component_import(b));
    }
    let tpl = template::transform(javascript, compiler_syntax_tree, source_text, res, true)?;
    let (preamble, ret) = tpl.generate(javascript, res, true, b);
    out.extend(preamble);
    for s in imports {
        if let Some(i) = without_macros(b, s) {
            out.push(i);
        }
    }
    for s in hoisted {
        out.push(s.clone_in(b.allocator()));
    }
    let mut rewrite = SetupRewrite {
        b,
        call: define_props.as_ref().map(|d| d.call.span),
    };
    let mut setup_body: Vec<Statement<'o>> = setup
        .iter()
        .map(|s| {
            let mut s = s.clone_in(b.allocator());
            rewrite.visit_statement(&mut s);
            s
        })
        .collect();
    let render = b.arrow_block(b.params(["_ctx", "_cache"]), [b.return_(Some(ret))], false);
    setup_body.push(b.return_(Some(render)));
    let mut fields = Vec::new();
    if let Some(name) = component_name(path) {
        fields.push(b.property(b.key("__name"), b.string(name), false));
    }
    if let Some(runtime) = define_props.as_ref().and_then(|d| d.runtime) {
        fields.push(b.property(b.key("props"), runtime.clone_in(b.allocator()), false));
    }
    let setup = b.function_expression(None, b.params(["__props"]), setup_body, false);
    fields.push(out::method(b, "setup", setup));
    let defined = options.map(|o| o.clone_in(b.allocator()));
    let main = component_object(b, fields, defined, input.typescript);
    out.push(b.declare(VariableDeclarationKind::Const, "_sfc_main", Some(main)));
    Ok(())
}

/// `import { defineComponent as _defineComponent } from 'vue'`.
pub(super) fn define_component_import<'o>(b: &Builder<'o>) -> Statement<'o> {
    out::import(b, [("defineComponent", "_defineComponent")], "vue")
}

/// The component object, merged with `defineOptions`' argument.
pub(super) fn component_object<'o>(
    b: &Builder<'o>,
    mut fields: Vec<ObjectPropertyKind<'o>>,
    defined: Option<Expression<'o>>,
    typescript: bool,
) -> Expression<'o> {
    if typescript {
        // `defineComponent({ ...options, … })`: a spread keeps the type of the merged object.
        if let Some(o) = defined {
            fields.insert(0, b.spread_property(o));
        }
        return out::pure_call(b, b.id("_defineComponent"), [b.object(fields)]);
    }
    let object = b.object(fields);
    let Some(o) = defined else {
        return object;
    };
    // Without TypeScript, compileScript cannot rely on spread: `Object.assign(options, …)`.
    out::pure_call(b, b.member(b.id("Object"), "assign"), [o, object])
}

/// compiler-sfc `processDefineOptions` and its `checkInvalidScopeReference`: the options object
/// (`None` for a call without one), refusing what upstream reports as an error. An argument other
/// than an object literal is not compiled yet.
pub(super) fn define_options<'a>(
    res: &Resolution,
    call: &'a CallExpression<'a>,
) -> R<Option<&'a Expression<'a>>> {
    let Some(argument) = call.arguments.first() else {
        return Ok(None);
    };
    let Some(Expression::ObjectExpression(object)) = argument.as_expression() else {
        return Err(Unsupported::at(
            "defineOptions() with an argument other than an object literal",
            document_span(argument.span()),
        ));
    };
    for p in &object.properties {
        if let ObjectPropertyKind::ObjectProperty(p) = p
            && let PropertyKey::StaticIdentifier(key) = &p.key
            && OPTIONS_OWNED_BY_MACROS.contains(&key.name.as_str())
        {
            return Err(Unsupported::at(
                "a defineOptions() key that has a macro of its own",
                document_span(p.span),
            ));
        }
    }
    let mut check = OptionsReferences { res, refused: None };
    check.visit_object_expression(object);
    check
        .refused
        .map_or_else(|| Ok(argument.as_expression()), Err)
}

/// `checkInvalidScopeReference`, and the macros an options object may not call.
struct OptionsReferences<'r> {
    res: &'r Resolution,
    refused: Option<Unsupported>,
}

impl<'a> Visit<'a> for OptionsReferences<'_> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        let res = self.res;
        let local = res.symbol_of(it.reference_id()).is_some_and(|s| {
            res.scoping().symbol_scope_id(s) == res.root_scope()
                && !res.scoping().symbol_flags(s).contains(SymbolFlags::Import)
        });
        let literal = res.binding_type(it.name.as_str()) == Some(BindingType::LiteralConst);
        if local && !literal && self.refused.is_none() {
            self.refused = Some(Unsupported::at(
                "defineOptions() referencing a binding of <script setup>",
                document_span(it.span),
            ));
        }
    }

    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        if let Expression::Identifier(callee) = &it.callee
            && is_macro(callee.name.as_str())
            && self.refused.is_none()
        {
            self.refused = Some(Unsupported::at(
                "this compiler macro",
                document_span(it.span),
            ));
        }
        walk::walk_call_expression(self, it);
    }
}

pub(super) fn is_macro(name: &str) -> bool {
    name == "defineProps" || name == DEFINE_OPTIONS || OTHER_MACROS.contains(&name)
}

pub(super) struct SetupStatements<'a> {
    imports: Vec<&'a Statement<'a>>,
    hoisted: Vec<&'a Statement<'a>>,
    setup: Vec<&'a Statement<'a>>,
    /// `defineOptions`' argument.
    options: Option<&'a Expression<'a>>,
}

pub(super) fn partition_setup_statements<'a>(
    statements: &'a [Statement<'a>],
    resolution: &'a Resolution,
) -> R<SetupStatements<'a>> {
    let define_props = resolution.define_props();
    let mut imports = Vec::new();
    let mut hoisted = Vec::new();
    let mut setup = Vec::new();
    // `hasDefineOptionsCall`: set by a call with an argument only.
    let mut options: Option<&Expression<'_>> = None;
    for s in statements {
        if let Statement::ExpressionStatement(e) = s
            && call_name(&e.expression) == Some(DEFINE_OPTIONS)
            && let Expression::CallExpression(call) = &e.expression
        {
            if options.is_some() {
                return Err(Unsupported::at(
                    "a duplicate defineOptions() call",
                    document_span(call.span),
                ));
            }
            options = define_options(resolution, call)?;
            continue;
        }
        refuse_unsupported(s)?;
        match s {
            Statement::ImportDeclaration(_) => imports.push(s),
            Statement::VariableDeclaration(d)
                if d.kind == VariableDeclarationKind::Const
                    && d.declarations.iter().all(|d| {
                        matches!(d.id, BindingPattern::BindingIdentifier(_))
                            && d.init.as_ref().is_some_and(is_static)
                    }) =>
            {
                hoisted.push(s);
            }
            _ if rsvelte_typescript_compile::strip::is_type_only(s) => hoisted.push(s),
            _ if define_props
                .as_ref()
                .is_some_and(|d| std::ptr::eq(d.statement, s) && d.declaration.is_none()) => {}
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

pub(super) fn refuse_unsupported(s: &Statement<'_>) -> R<()> {
    if matches!(
        s,
        Statement::ExportNamedDeclaration(_) | Statement::ExportDefaultDeclaration(_)
    ) {
        return Err(Unsupported::at(
            "an export in <script setup>",
            document_span(s.span()),
        ));
    }
    let mut check = Refusals { refused: None };
    check.visit_statement(s);
    check.refused.map_or(Ok(()), Err)
}

/// What a `<script setup>` statement may not hold outside its functions.
struct Refusals {
    refused: Option<Unsupported>,
}

impl Refusals {
    fn refuse(&mut self, what: &'static str, span: oxc_span::Span) {
        if self.refused.is_none() {
            self.refused = Some(Unsupported::at(what, document_span(span)));
        }
    }
}

impl<'a> Visit<'a> for Refusals {
    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        if let Expression::Identifier(callee) = &it.callee
            && (callee.name == DEFINE_OPTIONS || OTHER_MACROS.contains(&callee.name.as_str()))
        {
            self.refuse("this compiler macro", it.span);
        }
        walk::walk_call_expression(self, it);
    }

    fn visit_await_expression(&mut self, it: &oxc_ast::ast::AwaitExpression<'a>) {
        self.refuse("top-level await", it.span);
    }

    fn visit_function(&mut self, _: &oxc_ast::ast::Function<'a>, _: ScopeFlags) {}

    fn visit_arrow_function_expression(&mut self, _: &oxc_ast::ast::ArrowFunctionExpression<'a>) {}
}

/// An import with the macro specifiers compileScript removes; `None` when nothing remains.
pub(super) fn without_macros<'o>(b: &Builder<'o>, s: &Statement<'_>) -> Option<Statement<'o>> {
    let Statement::ImportDeclaration(import) = s else {
        unreachable!("an import")
    };
    let mut copied = s.clone_in(b.allocator());
    if import.source.value != "vue" {
        return Some(copied);
    }
    let Statement::ImportDeclaration(copy) = &mut copied else {
        unreachable!("a copied import")
    };
    if let Some(specifiers) = &mut copy.specifiers {
        let before = specifiers.len();
        specifiers.retain(|sp| match sp {
            ImportDeclarationSpecifier::ImportSpecifier(sp) => match &sp.imported {
                ModuleExportName::IdentifierName(name) => !is_macro(name.name.as_str()),
                ModuleExportName::IdentifierReference(name) => !is_macro(name.name.as_str()),
                ModuleExportName::StringLiteral(_) => true,
            },
            _ => true,
        });
        if specifiers.is_empty() && before > 0 {
            return None;
        }
    }
    Some(copied)
}

/// compileScript's `__name`: the file name without its extension.
pub(super) fn component_name(path: &str) -> Option<&str> {
    let file = path.rsplit(['/', '\\']).next()?;
    let dot = file.rfind('.')?;
    let ext = &file[dot + 1..];
    (dot > 0 && !ext.is_empty() && ext.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_'))
        .then(|| &file[..dot])
}

/// `const props = defineProps(…)` becomes `const props = __props`: the call is found by its span.
struct SetupRewrite<'b, 'o> {
    b: &'b Builder<'o>,
    call: Option<oxc_span::Span>,
}

impl<'o> VisitMut<'o> for SetupRewrite<'_, 'o> {
    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        if let Expression::CallExpression(call) = it
            && Some(call.span) == self.call
        {
            *it = self.b.id_at("__props", call.span);
            return;
        }
        walk_mut::walk_expression(self, it);
    }
}
