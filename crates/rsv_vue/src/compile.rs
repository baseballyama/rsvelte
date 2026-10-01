//! What `@vitejs/plugin-vue` produces for a production build.
//!
//! That is compileScript with the template inlined into `setup` (or, without a script,
//! compileTemplate's render function), the plugin's `_export_sfc` tail, and compileStyle's CSS.

mod style;
pub mod template;

use rsv_js::ast::flag;
use rsv_js::copy::{Rewrite, Verbatim, copy};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Unsupported;
use rsv_kernel::source::Loc;

use crate::ast::Sfc;
use crate::hir::Hir;
use crate::resolve::{Resolution, call_name, is_static};

type R<T> = Result<T, Unsupported>;

/// The compiled component.
#[derive(Debug)]
pub struct Output {
    pub js: String,
    /// compileStyle's result for each `<style>`, joined by newlines; `None` without a style.
    pub css: Option<String>,
}

/// A component as the compiler reads it, whatever syntax it was written in.
///
/// What a name in its expressions refers to is on the [`Resolution`] built from the same tree and
/// HIR ([`crate::resolve::resolve`]).
#[derive(Debug)]
pub struct CompileInput<'a> {
    /// Every JavaScript expression of the component, script and template.
    pub js: &'a Ast,
    /// The `<script setup>` program; `None` without one.
    pub script: Option<NodeId>,
    /// The template; `None` without one.
    pub hir: Option<&'a Hir>,
    pub styles: Vec<StyleInput<'a>>,
    /// `<script setup lang="ts">`: the script and every template expression are TypeScript.
    pub ts: bool,
    /// The document: spans index into it.
    pub src: &'a str,
}

#[derive(Clone, Copy, Debug)]
pub struct StyleInput<'a> {
    pub sheet: &'a rsv_css::StyleSheet,
    pub scoped: bool,
}

impl<'a> CompileInput<'a> {
    /// The Vue frontend's input: the parsed component and its HIR ([`crate::hir::lower`]).
    #[must_use]
    pub fn from_sfc(c: &'a Sfc, hir: Option<&'a Hir>, src: &'a str) -> Self {
        Self {
            js: &c.js,
            script: c.script.as_ref().map(|s| s.program),
            hir,
            styles: c
                .styles
                .iter()
                .map(|s| StyleInput {
                    sheet: &s.sheet,
                    scoped: s.scoped,
                })
                .collect(),
            ts: c.ts,
            src,
        }
    }
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

/// `@vitejs/plugin-vue`'s scope id: the first 8 hex digits of the SHA-256 of the path.
#[must_use]
pub fn scope_id(path: &str) -> String {
    let digest = rsv_kernel::hash::sha256(path.as_bytes());
    rsv_kernel::hash::hex(&digest[..4])
}

/// # Errors
///
/// [`Unsupported`] for what the port does not compile yet.
pub fn compile(input: &CompileInput<'_>, res: &Resolution, path: &str) -> R<Output> {
    let src = input.src;
    let id = scope_id(path);
    let scoped = input.styles.iter().any(|s| s.scoped);
    let mut to = Ast::new();
    let mut body = Vec::new();
    let mut attached = Vec::new();
    if let Some(program) = input.script {
        script_setup(input, res, path, program, &mut to, &mut body)?;
    } else {
        // `const _sfc_main = {}`, then compileTemplate's module with `render` renamed.
        let main = to.id("_sfc_main");
        let empty = to.object(&[], Loc::SYNTHETIC);
        body.push(to.let_(flag::CONST, main, Some(empty)));
        if let Some(hir) = input.hir {
            let t = template::transform(input.js, hir, src, res, false)?;
            let (preamble, ret) = t.generate(input.js, res, false, &mut to);
            body.extend(preamble);
            let params = [to.id("_ctx"), to.id("_cache")];
            let r = to.return_(Some(ret), Loc::SYNTHETIC);
            let block = to.block(&[r], Loc::SYNTHETIC);
            let name = to.id("_sfc_render");
            body.push(to.function(true, Some(name), &params, block, false, Loc::SYNTHETIC));
            attached.push(("render", to.id("_sfc_render")));
        }
    }
    if scoped {
        let v = to.str(&format!("data-v-{id}"));
        attached.push(("__scopeId", v));
    }
    let main = to.id("_sfc_main");
    let default = if attached.is_empty() {
        main
    } else {
        let local = to.id("_export_sfc");
        let spec = to.import_default(local, Loc::SYNTHETIC);
        let source = to.str("plugin-vue:export-helper");
        body.push(to.import(&[spec], source, false, Loc::SYNTHETIC));
        let pairs: Vec<NodeId> = attached
            .into_iter()
            .map(|(k, v)| {
                let k = to.str(k);
                to.array(&[k, v], Loc::SYNTHETIC)
            })
            .collect();
        let list = to.array(&pairs, Loc::SYNTHETIC);
        let callee = to.id("_export_sfc");
        let call = to.call0(callee, &[main, list]);
        to.mark_pure(call);
        call
    };
    body.push(to.export_default(default, Loc::SYNTHETIC));
    let program = to.program(&body, Loc::SYNTHETIC);
    let js = rsv_js::codegen::print_program(&to, src, program).out;
    let css = if input.styles.is_empty() {
        None
    } else {
        let parts: Vec<String> = input
            .styles
            .iter()
            .map(|s| style::compile(src, s, &id))
            .collect::<R<_>>()?;
        Some(parts.join("\n"))
    };
    Ok(Output { js, css })
}

/// compileScript for `<script setup>` with `inlineTemplate`.
fn script_setup(
    input: &CompileInput<'_>,
    res: &Resolution,
    path: &str,
    program: NodeId,
    to: &mut Ast,
    out: &mut Vec<NodeId>,
) -> R<()> {
    let (ast, src) = (input.js, input.src);
    let Kind::Program(stmts) = ast.kind(program) else {
        unreachable!("a script parses to a program")
    };
    let props_stmt = res.define_props.map(|d| d.stmt);
    let mut imports = Vec::new();
    let mut hoisted = Vec::new();
    let mut setup = Vec::new();
    for &s in stmts {
        refuse_unsupported(ast, s)?;
        match ast.kind(s) {
            Kind::Import { .. } => imports.push(s),
            Kind::VarDecl { kind, decls }
                if kind == flag::CONST
                    && decls.iter().all(|&d| match ast.kind(d) {
                        Kind::Declarator { id, init } => {
                            matches!(ast.kind(id), Kind::Ident(_))
                                && init.is_some_and(|i| is_static(ast, i))
                        }
                        _ => false,
                    }) =>
            {
                hoisted.push(s);
            }
            Kind::TsDecl | Kind::TsInterface { .. } => hoisted.push(s),
            _ if Some(s) == props_stmt && res.define_props.is_some_and(|d| d.decl.is_none()) => {}
            _ => setup.push(s),
        }
    }
    let Some(hir) = input.hir else {
        return Err(Unsupported::nowhere(
            "a <script setup> without a <template>",
        ));
    };
    if let Some(d) = res.define_props
        && d.runtime.is_none()
    {
        return Err(Unsupported::at(
            "defineProps without a runtime declaration",
            ast.loc(d.call),
        ));
    }
    if input.ts {
        let imported = to.id("defineComponent");
        let local = to.id("_defineComponent");
        let spec = to.import_named(imported, local, false, Loc::SYNTHETIC);
        let source = to.str("vue");
        out.push(to.import(&[spec], source, false, Loc::SYNTHETIC));
    }
    let tpl = template::transform(ast, hir, src, res, true)?;
    let (preamble, ret) = tpl.generate(ast, res, true, to);
    out.extend(preamble);
    for s in imports {
        if let Some(i) = without_macros(ast, src, to, s) {
            out.push(i);
        }
    }
    for s in hoisted {
        out.push(copy(ast, to, &mut Verbatim, s));
    }
    let mut rw = SetupRewrite {
        call: res.define_props.map(|d| d.call),
    };
    let mut setup_body: Vec<NodeId> = setup.iter().map(|&s| copy(ast, to, &mut rw, s)).collect();
    let render_params = [to.id("_ctx"), to.id("_cache")];
    let ret_stmt = to.return_(Some(ret), Loc::SYNTHETIC);
    let render_body = to.block(&[ret_stmt], Loc::SYNTHETIC);
    let render = to.arrow(&render_params, render_body, false, false, Loc::SYNTHETIC);
    setup_body.push(to.return_(Some(render), Loc::SYNTHETIC));
    let mut options = Vec::new();
    if let Some(name) = component_name(path) {
        let key = to.id("__name");
        let value = to.str(name);
        options.push(to.property(key, value, 0, Loc::SYNTHETIC));
    }
    if let Some(runtime) = res.define_props.and_then(|d| d.runtime) {
        let key = to.id("props");
        let value = copy(ast, to, &mut Verbatim, runtime);
        options.push(to.property(key, value, 0, Loc::SYNTHETIC));
    }
    let block = to.block(&setup_body, Loc::SYNTHETIC);
    let props = to.id("__props");
    let setup_fn = to.function(false, None, &[props], block, false, Loc::SYNTHETIC);
    let key = to.id("setup");
    options.push(to.property(key, setup_fn, flag::METHOD, Loc::SYNTHETIC));
    let object = to.object(&options, Loc::SYNTHETIC);
    let main = if input.ts {
        let callee = to.id("_defineComponent");
        let call = to.call0(callee, &[object]);
        to.mark_pure(call);
        call
    } else {
        object
    };
    let name = to.id("_sfc_main");
    out.push(to.let_(flag::CONST, name, Some(main)));
    Ok(())
}

fn refuse_unsupported(ast: &Ast, s: NodeId) -> R<()> {
    let mut stack = vec![s];
    while let Some(n) = stack.pop() {
        match ast.kind(n) {
            Kind::Call { .. } if call_name(ast, n).is_some_and(|c| OTHER_MACROS.contains(&c)) => {
                return Err(Unsupported::at("this compiler macro", ast.loc(n)));
            }
            Kind::Await(_) => return Err(Unsupported::at("top-level await", ast.loc(n))),
            Kind::Function { .. } | Kind::Arrow { .. } => continue,
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(Unsupported::at("an export in <script setup>", ast.loc(n)));
            }
            _ => {}
        }
        ast.for_each_child(n, |k| stack.push(k));
    }
    Ok(())
}

/// An import with the macro specifiers compileScript removes; `None` when nothing remains.
fn without_macros(ast: &Ast, src: &str, to: &mut Ast, s: NodeId) -> Option<NodeId> {
    let Kind::Import {
        specifiers,
        source,
        type_only,
    } = ast.kind(s)
    else {
        unreachable!("an import")
    };
    if ast.str_value(source, src) != "vue" {
        return Some(copy(ast, to, &mut Verbatim, s));
    }
    let kept: Vec<NodeId> = specifiers
        .iter()
        .copied()
        .filter(|&sp| match ast.kind(sp) {
            Kind::ImportNamed { imported, .. } => {
                let n = ast.name(imported);
                n != "defineProps" && !OTHER_MACROS.contains(&n)
            }
            _ => true,
        })
        .collect();
    if kept.is_empty() && !specifiers.is_empty() {
        return None;
    }
    let specs: Vec<NodeId> = kept
        .iter()
        .map(|&sp| copy(ast, to, &mut Verbatim, sp))
        .collect();
    let source = copy(ast, to, &mut Verbatim, source);
    Some(to.import(&specs, source, type_only, ast.loc(s)))
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
    call: Option<NodeId>,
}

impl Rewrite for SetupRewrite {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        if Some(id) == self.call {
            return Some(to.ident("__props", from.loc(id)));
        }
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn refusal(script: &str, template: &str) -> Option<&'static str> {
        let src = format!("<script setup>\n{script}\n</script>\n<template>{template}</template>\n");
        let c = crate::parse::parse(&src).expect("parses");
        let hir = crate::hir::lower(&c, &src);
        let res = crate::resolve::resolve(&c.js, c.program, hir.as_ref(), &src);
        let input = CompileInput::from_sfc(&c, hir.as_ref(), &src);
        compile(&input, &res, "a.vue").err().map(|u| u.what)
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
