//! Whether a document is in runes mode, as `svelte-eslint-parser` decides it for its rules.

use oxc_ast::ast::{
    BindingIdentifier, Expression, IdentifierName, IdentifierReference, LabelIdentifier,
    TSInterfaceDeclaration, TSType, TSTypeAliasDeclaration, TSTypeParameterDeclaration,
    TSTypeParameterInstantiation,
};
use oxc_ast_visit::Visit;
use rsvelte_svelte_semantic::resolve::RUNE_ROOTS;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode,
};

use crate::SvelteConfig;
use crate::rule::File;

/// svelte-eslint-parser's runes mode of a component: a boolean `<svelte:options runes>` decides,
/// then a static `compilerOptions.runes` of `svelte.config.js`, or else whether an identifier in a
/// script or the template names a rune (`hasRunesSymbol`, whose `runeSymbols` are
/// [`RUNE_ROOTS`]).
pub(super) fn runes_mode(file: &File<'_>, component: &Component) -> bool {
    let source = file.source();
    if let Some(runes) = svelte_options_runes(component, source) {
        return runes;
    }
    if let Some(Ok(SvelteConfig {
        runes: Some(runes), ..
    })) = file.svelte_config()
    {
        return *runes;
    }
    let tree = &component.javascript;
    let mut finder = RuneName(false);
    for script in component.scripts() {
        finder.visit_program(tree.get_program(script.program));
    }
    for (_, expression) in tree.expressions() {
        finder.visit_expression(expression);
    }
    for (_, pattern) in tree.patterns() {
        finder.visit_formal_parameter(pattern);
    }
    for (_, parameters) in tree.parameters() {
        finder.visit_formal_parameters(parameters);
    }
    for (_, declaration) in tree.declarations() {
        finder.visit_variable_declaration(declaration);
    }
    finder.0
}

/// Whether an identifier of any kind, as `ESTree`'s `Identifier`, names a rune.
struct RuneName(bool);

impl RuneName {
    fn name(&mut self, name: &str) {
        self.0 |= RUNE_ROOTS.contains(&name);
    }
}

impl<'a> Visit<'a> for RuneName {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        self.name(&it.name);
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        self.name(&it.name);
    }

    fn visit_identifier_name(&mut self, it: &IdentifierName<'a>) {
        self.name(&it.name);
    }

    fn visit_label_identifier(&mut self, it: &LabelIdentifier<'a>) {
        self.name(&it.name);
    }

    // A name in a type never makes a document use runes.
    fn visit_ts_type(&mut self, _: &TSType<'a>) {}

    fn visit_ts_type_parameter_instantiation(&mut self, _: &TSTypeParameterInstantiation<'a>) {}

    fn visit_ts_type_parameter_declaration(&mut self, _: &TSTypeParameterDeclaration<'a>) {}

    fn visit_ts_interface_declaration(&mut self, _: &TSInterfaceDeclaration<'a>) {}

    fn visit_ts_type_alias_declaration(&mut self, _: &TSTypeAliasDeclaration<'a>) {}
}

/// The official parser rejects any other value of `runes`, so only a boolean reaches here.
fn svelte_options_runes(component: &Component, source: &str) -> Option<bool> {
    for node in &component.nodes {
        let TemplateNode::Element {
            name, attributes, ..
        } = node
        else {
            continue;
        };
        if name.text(source) != "svelte:options" {
            continue;
        }
        for attribute in component.attributes(*attributes) {
            if attribute.kind != AttributeKind::Attribute || attribute.name.text(source) != "runes"
            {
                continue;
            }
            let value = match attribute.value {
                AttributeValue::True => Some(true),
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [Part::Expression { expression, .. }] => {
                        match component.javascript.get_expression(*expression) {
                            Expression::BooleanLiteral(literal) => Some(literal.value),
                            _ => None,
                        }
                    }
                    _ => None,
                },
            };
            if value.is_some() {
                return value;
            }
        }
    }
    None
}

#[cfg(test)]
mod tests;
