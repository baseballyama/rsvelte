//! What `@vitejs/plugin-vue` produces for a production build.
//!
//! That is compileScript with the template inlined into `setup` (or, without a script,
//! compileTemplate's render function), the plugin's `_export_sfc` tail, and compileStyle's CSS.

mod style;
pub mod template;

use rsvelte_javascript::copy::{Rewrite, Verbatim, copy};
use rsvelte_javascript::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_javascript::syntax_tree::flag;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::source::positions::SourceLocation;

use crate::compiler_syntax_tree::CompilerSyntaxTree;
use crate::resolve::{BindingType, Resolution, call_name, is_static};
use crate::syntax_tree::SingleFileComponent;

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
/// HIR ([`crate::resolve::resolve`]).
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
    /// ([`crate::compiler_syntax_tree::lower`]).
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
    let javascript = rsvelte_javascript::codegen::print_program(&to, source_text, program).out;
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

/// compileScript for `<script setup>` with `inlineTemplate`.
fn script_setup(
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
fn define_component_import(to: &mut SyntaxTree) -> NodeIdentifier {
    let imported = to.identifier("defineComponent");
    let local = to.identifier("_defineComponent");
    let spec = to.import_named(imported, local, false, SourceLocation::SYNTHETIC);
    let source = to.write_string("vue");
    to.import(&[spec], source, false, SourceLocation::SYNTHETIC)
}

/// The component object, merged with `defineOptions`' argument.
fn component_object(
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
fn define_options(
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

fn is_macro(name: &str) -> bool {
    name == "defineProps" || name == DEFINE_OPTIONS || OTHER_MACROS.contains(&name)
}

struct SetupStatements {
    imports: Vec<NodeIdentifier>,
    hoisted: Vec<NodeIdentifier>,
    setup: Vec<NodeIdentifier>,
    /// `defineOptions`' argument.
    options: Option<NodeIdentifier>,
}

fn partition_setup_statements(
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

fn refuse_unsupported(syntax_tree: &SyntaxTree, s: NodeIdentifier) -> R<()> {
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
fn without_macros(
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
fn component_name(path: &str) -> Option<&str> {
    let file = path.rsplit(['/', '\\']).next()?;
    let dot = file.rfind('.')?;
    let ext = &file[dot + 1..];
    (dot > 0 && !ext.is_empty() && ext.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_'))
        .then(|| &file[..dot])
}

/// `const props = defineProps(…)` becomes `const props = __props`.
struct SetupRewrite {
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

#[cfg(test)]
mod tests {
    use super::*;

    fn refusal(script: &str, template: &str) -> Option<&'static str> {
        let source_text =
            format!("<script setup>\n{script}\n</script>\n<template>{template}</template>\n");
        let c = crate::parse::parse(&source_text).expect("parses");
        let compiler_syntax_tree = crate::compiler_syntax_tree::lower(&c, &source_text);
        let res = crate::resolve::resolve(
            &c.javascript,
            c.program,
            compiler_syntax_tree.as_ref(),
            &source_text,
        );
        let input = CompileInput::from_single_file_component(
            &c,
            compiler_syntax_tree.as_ref(),
            &source_text,
        );
        compile(&input, &res, "a.vue").err().map(|u| u.what)
    }

    fn output(script: &str, template: &str) -> String {
        let source_text =
            format!("<script setup>\n{script}\n</script>\n<template>{template}</template>\n");
        let c = crate::parse::parse(&source_text).expect("parses");
        let compiler_syntax_tree = crate::compiler_syntax_tree::lower(&c, &source_text);
        let res = crate::resolve::resolve(
            &c.javascript,
            c.program,
            compiler_syntax_tree.as_ref(),
            &source_text,
        );
        let input = CompileInput::from_single_file_component(
            &c,
            compiler_syntax_tree.as_ref(),
            &source_text,
        );
        compile(&input, &res, "a.vue").expect("compiles").javascript
    }

    // Expected fragments from @vue/compiler-sfc 3.5.43's compileScript (inlineTemplate) on the
    // same input, reprinted.
    #[test]
    fn define_options_merges_into_the_component_object() {
        let javascript = output(
            "defineOptions({ inheritAttrs: false, name: 'X' })\nconst k = 'a'\n\
             defineProps({ a: {} })",
            "<p>{{ a }}</p>",
        );
        assert!(
            javascript.contains(
                "const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false, name: \
                 'X' }, { __name: 'a', props: { a: {} }, setup(__props) {"
            ),
            "{javascript}"
        );
        assert!(!javascript.contains("defineOptions"), "{javascript}");
        let javascript = output("defineOptions()", "<p></p>");
        assert!(
            javascript.contains("const _sfc_main = { __name: 'a', setup(__props) {"),
            "{javascript}"
        );
        let javascript = output("const k = 'a'\ndefineOptions({ name: k })", "<p></p>");
        assert!(
            javascript.contains("Object.assign({ name: k }, {"),
            "{javascript}"
        );
    }

    #[test]
    fn define_options_refuses_what_upstream_rejects() {
        for (script, want) in [
            (
                "defineOptions({ props: {} })",
                "a defineOptions() key that has a macro of its own",
            ),
            (
                "defineOptions({})\ndefineOptions({})",
                "a duplicate defineOptions() call",
            ),
            (
                "defineOptions({ a: 1 })\ndefineOptions()",
                "a duplicate defineOptions() call",
            ),
            (
                "import { ref } from 'vue'\nconst k = ref(1)\ndefineOptions({ name: k })",
                "defineOptions() referencing a binding of <script setup>",
            ),
            ("const x = defineOptions({})", "this compiler macro"),
        ] {
            assert_eq!(refusal(script, "<p></p>"), Some(want), "{script}");
        }
    }

    #[test]
    fn a_function_ref_patches_and_marks_v_for() {
        let javascript = output(
            "import { ref } from 'vue'\nconst n = ref(0)",
            "<p :ref=\"(el) => (n = el)\">{{ n }}</p>\
             <ul><li v-for=\"i in 3\" :key=\"i\" :ref=\"(el) => n = el\">{{ i }}</li></ul>",
        );
        assert!(
            javascript.contains(
                "_createElementVNode('p', { ref: (el) => n.value = el }, \
                 _toDisplayString(n.value), 513)"
            ),
            "{javascript}"
        );
        assert!(
            javascript.contains(
                "_createElementVNode('li', { key: i, ref_for: true, ref: (el) => n.value = el }, \
                 _toDisplayString(i), 1)"
            ),
            "{javascript}"
        );
    }

    #[test]
    fn pre_compiles_with_its_text_as_the_compiler_syntax_tree_holds_it() {
        let javascript = output("const s = 'a'", "<pre>  {{ s }}\n x</pre>");
        assert!(
            javascript
                .contains("_createElementBlock('pre', null, '  ' + _toDisplayString(s) + '\\n x')"),
            "{javascript}"
        );
    }

    #[test]
    fn two_structural_directives_of_one_kind_are_refused() {
        let want = Some("two structural directives of one kind");
        for t in [
            "<p v-if=\"a\" v-if=\"b\">x</p>",
            "<p v-if=\"a\">x</p><p v-else-if=\"a\" v-else>y</p>",
            "<p v-for=\"i in 2\" v-for=\"j in 2\">x</p>",
        ] {
            assert_eq!(refusal("const a = 1, b = 2", t), want, "{t}");
        }
        assert_eq!(
            refusal("const a = 1", "<p v-if=\"a\" v-for=\"i in 2\">x</p>"),
            None
        );
    }

    const REFS: &str = "import { ref, reactive } from 'vue'\nconst r = ref('')\n\
                        const s = reactive({ a: '' })\nlet l = ''\nconst k = 'x'";

    #[test]
    fn v_model_compiles_on_a_ref_or_a_member_of_a_form_element() {
        for t in [
            "<input v-model=\"r\">",
            "<input v-model.trim.number=\"s.a\">",
            "<input type=\"checkbox\" v-model=\"r\">",
            "<input type=\"radio\" value=\"a\" v-model=\"r\">",
            "<textarea v-model=\"r\"></textarea>",
            "<select v-model=\"r\"></select>",
        ] {
            assert_eq!(refusal(REFS, t), None, "{t}");
        }
    }

    #[test]
    fn v_model_refuses_what_upstream_rejects_or_the_port_does_not_compile() {
        let target = Some("a v-model target that is not a ref or a member expression");
        for (t, want) in [
            ("<input v-model=\"l\">", target),
            ("<input v-model=\"k\">", target),
            ("<input v-model=\"s\">", target),
            ("<input v-model=\"r + 1\">", target),
            ("<div v-model=\"r\"></div>", Some("v-model on this element")),
            (
                "<input v-model:x=\"r\">",
                Some("a v-model argument on an element"),
            ),
            (
                "<input :value=\"k\" v-model=\"r\">",
                Some("v-model with a bound `value`"),
            ),
            (
                "<input :type=\"k\" v-model=\"r\">",
                Some("v-model with a bound `type`"),
            ),
            (
                "<input type=\"file\" v-model=\"r\">",
                Some("v-model on a file input"),
            ),
            (
                "<textarea v-model=\"r\"> </textarea>",
                Some("this element in a compiled template"),
            ),
        ] {
            assert_eq!(refusal(REFS, t), want, "{t}");
        }
    }
}
