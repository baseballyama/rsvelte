use crate::lower::builder::Runtime;
use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind,
};
use crate::render_plan::Namespace;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `HtmlTag` (client); `controlled` when it is its element's only child, which is
    /// then `node`.
    pub(super) fn html_tag(
        &self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        controlled: bool,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
        if !controlled {
            frag.tpl.push_comment();
        }
        let NodeKind::Html { expression } = self.compiler_syntax_tree.node(identifier).kind else {
            unreachable!("an html tag")
        };
        let html = b.thunk(self.expression(expression));
        // A controlled tag's element gives the namespace.
        let namespace = (!controlled).then(|| self.plan.namespace(identifier));
        let set = |on: bool| on.then(|| b.boolean(true));
        let arguments = vec![
            Some(b.id(node)),
            Some(html),
            set(controlled),
            set(namespace == Some(Namespace::Svg)),
            set(namespace == Some(Namespace::Mathml)),
        ];
        l.initializer
            .push(b.stmt(b.runtime_some("html", arguments)));
    }
}
