//! What `@vitejs/plugin-vue` produces for a production build.
//!
//! That is compileScript with the template inlined into `setup` (or, without a script,
//! compileTemplate's render function), the plugin's `_export_sfc` tail, and compileStyle's CSS.

mod style;
pub mod template;

use rsvelte_javascript::copy::{Rewrite, Verbatim, copy};
use rsvelte_javascript::syntax_tree::flag;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::source::positions::SourceLocation;

use crate::resolve::{Resolution, call_name, is_static};
use crate::syntax_tree::SingleFileComponent;

type R<T> = Result<T, Unsupported>;

/// The compiled component.
#[derive(Debug)]
pub struct Output {
    pub javascript: String,
    /// compileStyle's result for each `<style>`, joined by newlines; `None` without a style.
    pub stylesheet: Option<String>,
}

/// compiler-sfc's macros other than `defineProps`, none of which the port compiles yet.
const OTHER_MACROS: &[&str] = &[
    "defineEmits",
    "defineExpose",
    "defineOptions",
    "defineSlots",
    "defineModel",
    "withDefaults",
];

/// `@vitejs/plugin-vue`'s scope identifier: the first 8 hex digits of the SHA-256 of the path.
#[must_use]
pub fn scope_identifier(path: &str) -> String {
    let digest = rsvelte_kernel::source::hashing::sha256(path.as_bytes());
    rsvelte_kernel::source::hashing::hex(&digest[..4])
}

/// # Errors
///
/// [`Unsupported`] for what the port does not compile yet.
pub fn compile(
    c: &SingleFileComponent,
    source_text: &str,
    res: &Resolution,
    path: &str,
) -> R<Output> {
    let identifier = scope_identifier(path);
    let scoped = c.styles.iter().any(|s| s.scoped);
    let mut to = SyntaxTree::new();
    let mut body = Vec::new();
    let mut attached = Vec::new();
    if let Some(script) = &c.script {
        script_setup(
            c,
            source_text,
            res,
            path,
            script.program,
            &mut to,
            &mut body,
        )?;
    } else {
        // `const _sfc_main = {}`, then compileTemplate's module with `render` renamed.
        let main = to.identifier("_sfc_main");
        let empty = to.object(&[], SourceLocation::SYNTHETIC);
        body.push(to.let_(flag::CONST, main, Some(empty)));
        if c.template.is_some() {
            let t = template::transform(c, source_text, res, false)?;
            let (preamble, ret) = t.generate(c, res, false, &mut to);
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
    let stylesheet = if c.styles.is_empty() {
        None
    } else {
        let parts: Vec<String> = c
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
    c: &SingleFileComponent,
    source_text: &str,
    res: &Resolution,
    path: &str,
    program: NodeIdentifier,
    to: &mut SyntaxTree,
    out: &mut Vec<NodeIdentifier>,
) -> R<()> {
    let syntax_tree = &c.javascript;
    let Kind::Program(statements) = syntax_tree.kind(program) else {
        unreachable!("a script parses to a program")
    };
    let SetupStatements {
        imports,
        hoisted,
        setup,
    } = partition_setup_statements(syntax_tree, statements, res)?;
    if c.template.is_none() {
        return Err(Unsupported::nowhere(
            "a <script setup> without a <template>",
        ));
    }
    if let Some(d) = res.define_props
        && d.runtime.is_none()
    {
        return Err(Unsupported::at(
            "defineProps without a runtime declaration",
            syntax_tree.source_location(d.call),
        ));
    }
    if c.typescript {
        let imported = to.identifier("defineComponent");
        let local = to.identifier("_defineComponent");
        let spec = to.import_named(imported, local, false, SourceLocation::SYNTHETIC);
        let source = to.write_string("vue");
        out.push(to.import(&[spec], source, false, SourceLocation::SYNTHETIC));
    }
    let tpl = template::transform(c, source_text, res, true)?;
    let (preamble, ret) = tpl.generate(c, res, true, to);
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
    let mut options = Vec::new();
    if let Some(name) = component_name(path) {
        let key = to.identifier("__name");
        let value = to.write_string(name);
        options.push(to.property(key, value, 0, SourceLocation::SYNTHETIC));
    }
    if let Some(runtime) = res.define_props.and_then(|d| d.runtime) {
        let key = to.identifier("props");
        let value = copy(syntax_tree, to, &mut Verbatim, runtime);
        options.push(to.property(key, value, 0, SourceLocation::SYNTHETIC));
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
    options.push(to.property(key, setup_fn, flag::METHOD, SourceLocation::SYNTHETIC));
    let object = to.object(&options, SourceLocation::SYNTHETIC);
    let main = if c.typescript {
        let callee = to.identifier("_defineComponent");
        let call = to.call0(callee, &[object]);
        to.mark_pure(call);
        call
    } else {
        object
    };
    let name = to.identifier("_sfc_main");
    out.push(to.let_(flag::CONST, name, Some(main)));
    Ok(())
}

struct SetupStatements {
    imports: Vec<NodeIdentifier>,
    hoisted: Vec<NodeIdentifier>,
    setup: Vec<NodeIdentifier>,
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
    for &s in statements {
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
    })
}

fn refuse_unsupported(syntax_tree: &SyntaxTree, s: NodeIdentifier) -> R<()> {
    let mut stack = vec![s];
    while let Some(n) = stack.pop() {
        match syntax_tree.kind(n) {
            Kind::Call { .. }
                if call_name(syntax_tree, n).is_some_and(|c| OTHER_MACROS.contains(&c)) =>
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
            Kind::ImportNamed { imported, .. } => {
                let n = syntax_tree.name(imported);
                n != "defineProps" && !OTHER_MACROS.contains(&n)
            }
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
