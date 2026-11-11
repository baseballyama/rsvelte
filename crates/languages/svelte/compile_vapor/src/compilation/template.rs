//! STUB while the template translation is rewritten.

use oxc_ast::ast::Statement;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_compile::build::Builder;

use crate::R;
use crate::helpers::Helper;

#[derive(Clone, Debug)]
pub(crate) struct CustomElement {
    pub tag: Option<String>,
    pub shadow_root: bool,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub(crate) enum CssMode {
    #[default]
    External,
    Injected,
}

#[derive(Debug, Default)]
pub(crate) struct Options {
    pub preserve_whitespace: bool,
    pub css_mode: CssMode,
    pub custom_element: Option<CustomElement>,
}

pub(crate) fn check(
    _: &Component,
    _: &CompilerSyntaxTree,
    _: &Resolution,
    _: &str,
    _: &rsvelte_svelte_compile::render_plan::Namespaces,
) -> R<Options> {
    todo!()
}

pub(crate) struct Building<'t> {
    pub declarations: Vec<Statement<'t>>,
    pub helpers: Vec<Helper>,
}

impl Building<'_> {
    pub(crate) fn finish(self) -> Built {
        todo!()
    }
}

#[derive(Debug)]
pub(crate) struct Built {
    pub compiler_syntax_tree: rsvelte_vue_semantic::compiler_syntax_tree::CompilerSyntaxTree,
    pub helpers: Vec<Helper>,
}

pub(crate) fn build<'t>(
    _: crate::compilation::Input<'_>,
    _: Option<&str>,
    _: &mut rsvelte_typescript_tree::Builder<'t>,
    _: &Builder<'t>,
) -> R<Building<'t>> {
    todo!()
}
