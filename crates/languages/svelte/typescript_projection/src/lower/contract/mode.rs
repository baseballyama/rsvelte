//! svelte2tsx's runes mode, which decides the props of a component without `$props()` and which
//! component its default export is.

use oxc_ast::ast::{
    AssignmentTarget, BindingPattern, Declaration, Expression, ImportDeclarationSpecifier, Program,
    Statement, VariableDeclaration,
};
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

use super::super::awaits::awaits_in_template;
use super::super::{Builder, Node, NodeIdentifier};
use super::Export;

/// A component's mode as svelte2tsx reads it, which is not the compiler's.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum ComponentMode {
    /// `$props()`, a read of `$state`, `$derived` or `$effect`, an `await` outside every
    /// function, or `<svelte:options runes>`.
    Runes,
    Legacy,
}

/// No props, which TypeScript prints as svelte2tsx's `Record<string, never>`. svelte2tsx writes the
/// bare name, so a component's own `type Record` turns its props into `any`; qualifying it is a
/// deliberate divergence (rsvelte#4939, item 171).
const NO_PROPS: &str = "globalThis.Record<string, never>";

impl Builder<'_> {
    /// `props`: whether the instance declares `$props()`; `asynchronous`: whether it awaits at
    /// the top level.
    pub(super) fn component_mode(&self, props: bool, asynchronous: bool) -> ComponentMode {
        let runes = props
            || asynchronous
            || self.runes_option()
            || self.reads_rune_global()
            || awaits_in_template(&self.component.javascript);
        if runes {
            ComponentMode::Runes
        } else {
            ComponentMode::Legacy
        }
    }

    /// svelte2tsx's `checkGlobalsForRunes`: the instance or the template reads `$state`,
    /// `$derived` or `$effect`, and the instance declares no store of that name at its top level.
    fn reads_rune_global(&self) -> bool {
        let Some(resolution) = (self.resolution)() else {
            return false;
        };
        let module = self.component.module.as_ref().map(|script| script.content);
        let instance = (self.component.instance.as_ref())
            .map(|script| self.component.javascript.get_program(script.program));
        let scoping = resolution.scoping();
        scoping
            .root_unresolved_references()
            .iter()
            .filter(|(name, _)| matches!(name.as_str(), "$state" | "$derived" | "$effect"))
            .any(|(name, references)| {
                references.iter().any(|&reference| {
                    let at = resolution.reference_span(reference).start;
                    scoping.get_reference(reference).flags().is_value()
                        && !module.is_some_and(|m| (m.start_offset..m.end_offset).contains(&at))
                }) && !instance.is_some_and(|program| declares_store(program, &name[1..]))
            })
    }

    /// svelte2tsx's props of a component without `$props()`: outside runes mode, each export
    /// is an optional prop; otherwise, or without exports, it takes none.
    pub(super) fn props_without_rune(
        &mut self,
        exports: &[Export],
        mode: ComponentMode,
    ) -> NodeIdentifier {
        match mode {
            ComponentMode::Legacy if !exports.is_empty() => self.export_type(exports, true),
            // svelte2tsx's `__sveltets_2_partial` expands JavaScript's no props.
            ComponentMode::Legacy if self.tree.javascript => {
                self.tree.push(Node::Identifier("{ [x: string]: never }"))
            }
            ComponentMode::Legacy | ComponentMode::Runes => {
                self.tree.push(Node::Identifier(NO_PROPS))
            }
        }
    }

    fn runes_option(&self) -> bool {
        let component = self.component;
        component.children(component.root).iter().any(|&child| {
            let TemplateNode::Element {
                name, attributes, ..
            } = *component.node(child)
            else {
                return false;
            };
            name.text(self.source) == "svelte:options"
                && component.attributes(attributes).iter().any(|attribute| {
                    attribute.name.text(self.source) == "runes"
                        && match attribute.value {
                            AttributeValue::True => true,
                            AttributeValue::Parts(parts) => matches!(
                                component.parts(parts),
                                [Part::Expression { expression, .. }]
                                    if matches!(
                                        self.expression(*expression),
                                        Expression::BooleanLiteral(literal) if literal.value
                                    )
                            ),
                        }
                })
        })
    }
}

/// Whether the instance `program` declares `name` where svelte2tsx's `getGlobals` reads a store:
/// a top-level variable, an import's default or named binding, or a top-level `$:` assignment.
fn declares_store(program: &Program<'_>, name: &str) -> bool {
    program.body.iter().any(|statement| match statement {
        Statement::VariableDeclaration(declaration) => declares(declaration, name),
        Statement::ExportDeclaration(export) => matches!(
            &export.declaration,
            Declaration::VariableDeclaration(declaration) if declares(declaration, name)
        ),
        Statement::ImportDeclaration(import) => {
            import.specifiers.iter().flatten().any(|specifier| {
                !matches!(
                    specifier,
                    ImportDeclarationSpecifier::ImportNamespaceSpecifier(_)
                ) && specifier.local().name == name
            })
        }
        Statement::LabeledStatement(labeled) if labeled.label.name == "$" => {
            assigns(&labeled.body, name)
        }
        _ => false,
    })
}

/// Whether `statement` is `name = …;`.
fn assigns(statement: &Statement<'_>, name: &str) -> bool {
    let Statement::ExpressionStatement(statement) = statement else {
        return false;
    };
    let Expression::AssignmentExpression(assignment) = &statement.expression else {
        return false;
    };
    matches!(&assignment.left, AssignmentTarget::AssignmentTargetIdentifier(target) if target.name == name)
}

fn declares(declaration: &VariableDeclaration<'_>, name: &str) -> bool {
    (declaration.declarations.iter()).any(|declarator| binds(&declarator.id, name))
}

/// Whether `pattern` binds `name`.
fn binds(pattern: &BindingPattern<'_>, name: &str) -> bool {
    match pattern {
        BindingPattern::BindingIdentifier(binding) => binding.name == name,
        BindingPattern::ObjectPattern(object) => {
            (object.properties.iter()).any(|property| binds(&property.value, name))
                || object
                    .rest
                    .as_ref()
                    .is_some_and(|rest| binds(&rest.argument, name))
        }
        BindingPattern::ArrayPattern(array) => {
            (array.elements.iter().flatten()).any(|element| binds(element, name))
                || array
                    .rest
                    .as_ref()
                    .is_some_and(|rest| binds(&rest.argument, name))
        }
        BindingPattern::AssignmentPattern(assignment) => binds(&assignment.left, name),
    }
}
