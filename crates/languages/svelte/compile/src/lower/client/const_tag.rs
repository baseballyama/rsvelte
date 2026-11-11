use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BindingPattern, PropertyKey};
use oxc_ast_visit::VisitMut;
use rsvelte_typescript_tree::DeclarationIdentifier;

use crate::lower::builder::Runtime;
use crate::lower::client::{ClientCompilationContext, CompilerNodeIdentifier, Lists, NodeKind};
use crate::lower::names::Names;
use crate::lower::paths::bound_names;
use crate::lower::script::{self, Read};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `DeclarationTag` (client): declared with the fragment's `{@const}`s.
    pub(super) fn declaration_tag(
        &mut self,
        declaration: DeclarationIdentifier,
    ) -> Vec<oxc_ast::ast::Statement<'o>> {
        let declaration = self.javascript.get_declaration(declaration);
        let mut names = std::mem::replace(&mut self.names, Names::empty());
        let lowered =
            script::lower_declaration_tag(&mut self.rewriter(true), declaration, &mut names);
        self.names = names;
        lowered
    }

    /// Upstream `ConstTag` (client): `const x = $.derived(() => init)`, read through `$.get`. A
    /// destructured tag keeps its names in one derived object, `computed_const`.
    pub(super) fn const_tag(&mut self, identifier: CompilerNodeIdentifier, l: &mut Lists<'o>) {
        let b = self.b;
        let NodeKind::Const { declaration } = self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("a const tag")
        };
        let d = &self.javascript.get_declaration(declaration).declarations[0];
        let init = d.init.as_ref().expect("a `{@const}` has an initializer");
        if let BindingPattern::BindingIdentifier(id) = &d.id {
            let value = self.rewrite(init.get_inner_expression(), true);
            l.consts
                .push(b.const_(&id.name, b.runtime("derived", [b.thunk(value)])));
            self.reads.insert(id.symbol_id(), Read::Get);
            return;
        }
        let mut names = Vec::new();
        bound_names(&d.id, false, &mut |binding, _| names.push(binding));
        // Inside the derived the names are plain variables.
        for binding in &names {
            self.reads.insert(binding.symbol_id(), Read::Plain);
        }
        let value = self.rewrite(init.get_inner_expression(), true);
        let body = if is_simple_object_pattern(&d.id) {
            vec![b.return_(Some(value))]
        } else {
            let mut pattern = d.id.clone_in_with_semantic_ids(b.allocator());
            self.rewriter(true).visit_binding_pattern(&mut pattern);
            let object = b.object(names.iter().map(|n| b.init(&n.name, b.id(&n.name))));
            vec![
                b.declaration(
                    oxc_ast::ast::VariableDeclarationKind::Const,
                    [b.declarator(pattern, Some(value))],
                ),
                b.return_(Some(object)),
            ]
        };
        let object = self.names.generate("computed_const");
        let derived = b.runtime("derived", [b.arrow_block(b.params([]), body, false)]);
        l.consts.push(b.const_(&object, derived));
        for binding in names {
            self.reads
                .insert(binding.symbol_id(), Read::Field(object.as_str().into()));
        }
    }
}

/// `{ a, b }`, whose object the derived can return as it is.
fn is_simple_object_pattern(pattern: &BindingPattern<'_>) -> bool {
    let BindingPattern::ObjectPattern(object) = pattern else {
        return false;
    };
    object.rest.is_none()
        && object.properties.iter().all(|p| {
            !p.computed
                && matches!((&p.key, &p.value), (PropertyKey::StaticIdentifier(key), BindingPattern::BindingIdentifier(value)) if key.name == value.name)
        })
}
