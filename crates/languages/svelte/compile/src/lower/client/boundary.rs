mod parameters;

use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;

use super::super::javascript::getter;

use super::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeIdentifier, NodeKind, R,
    SourceLocation, flag, init_property,
};

impl ClientCompilationContext<'_> {
    pub(super) fn boundary(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        lists: &mut Lists,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a boundary element")
        };
        let mut properties = Vec::new();
        for attribute in tree.attributes(element.attributes) {
            let expression = super::super::template::single_expression(&attribute.value)
                .expect("boundary attributes are validated");
            let value = self.expression(expression);
            let name = attribute.name.text(self.source_text);
            let property = if self.an.meta(expression).has_state {
                getter(&mut self.out, name, value)
            } else {
                init_property(&mut self.out, name, value)
            };
            properties.push(property);
        }
        let mut declarations = Vec::new();
        for &child in &self.plan.fragment(element.children).hoisted {
            if let NodeKind::Snippet(snippet) = &tree.node(child).kind {
                declarations.push(self.boundary_snippet(snippet)?);
                let name = self.javascript.name(snippet.name);
                let value = self.out.identifier(name);
                properties.push(init_property(&mut self.out, name, value));
            }
        }
        let props = self.out.object(&properties, SourceLocation::SYNTHETIC);
        let body = self.fragment_with_snippets(element.children, false)?;
        let block = self.out.block(&body, SourceLocation::SYNTHETIC);
        let anchor = self.out.identifier("$$anchor");
        let callback = self
            .out
            .arrow(&[anchor], block, false, false, SourceLocation::SYNTHETIC);
        let anchor = self.out.identifier(node);
        let call = self.call("boundary", vec![Some(anchor), Some(props), Some(callback)]);
        let statement = self.statement(call);
        let statement = if declarations.is_empty() {
            statement
        } else {
            declarations.push(statement);
            self.out.block(&declarations, SourceLocation::SYNTHETIC)
        };
        frag.tpl.push_comment();
        lists.initializer.push(statement);
        Ok(())
    }

    fn boundary_snippet(&mut self, snippet: &Snippet) -> R<NodeIdentifier> {
        let saved_scope = self.scope;
        let parameters = self.snippet_parameters(snippet);
        let body = self.fragment(snippet.body);
        self.scope = saved_scope;
        for (binding, read) in parameters.saved_reads {
            if let Some(read) = read {
                self.reads.insert(binding, read);
            } else {
                self.reads.remove(&binding);
            }
        }
        let mut declarations = parameters.declarations;
        declarations.extend(body?);
        let body = self.out.block(&declarations, SourceLocation::SYNTHETIC);
        let callback = self.out.arrow(
            &parameters.arguments,
            body,
            false,
            false,
            SourceLocation::SYNTHETIC,
        );
        let name = self.out.identifier(self.javascript.name(snippet.name));
        Ok(self.out.let_(flag::CONST, name, Some(callback)))
    }
}
