//! Server-side component building utilities.
//!
//! This module contains functions for building inline components during SSR.
//! It corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/component.js`.

use crate::ast::template::{
    Attribute, Component, LetDirective, SvelteComponentElement, SvelteElement, TemplateNode,
};
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::server::types::{
    ComponentServerTransformState, TemplateItem,
};
use crate::compiler::phases::phase3_transform::shared::is_element_node;

use super::utils::{build_attribute_value, create_async_block, empty_comment};

/// Builds an inline component for server-side rendering.
///
/// This function handles:
/// - Props and spread attributes
/// - Custom CSS properties (--var)
/// - Slots and snippets
/// - Let directives
/// - Bind directives
/// - Child content
///
/// Corresponds to `build_inline_component()` in `component.js`.
///
/// # Arguments
///
/// * `node` - The component node (Component, SvelteComponent, or SvelteSelf)
/// * `expression` - The component expression (name or dynamic expression)
/// * `state` - The component server transform state
/// * `visit` - The visitor function for child nodes
pub fn build_inline_component<F>(
    node: &dyn ComponentNode,
    expression: JsExpr,
    state: &mut ComponentServerTransformState,
    _visit: F,
) where
    F: FnMut(&TemplateNode, &mut ComponentServerTransformState),
{
    let mut props_and_spreads: Vec<PropsOrSpread> = Vec::new();
    let mut custom_css_props: Vec<JsObjectMember> = Vec::new();
    let mut lets: std::collections::HashMap<String, Vec<&LetDirective>> =
        std::collections::HashMap::new();
    lets.insert("default".to_string(), Vec::new());

    let mut has_children_prop = false;
    let mut has_bindings = false;

    // TODO: Implement PromiseOptimiser for async attribute handling
    // For now, we use a simple transform that just returns the expression
    let transform = |expr: JsExpr| -> JsExpr { expr };

    // Process attributes
    for attribute in node.get_attributes() {
        match attribute {
            Attribute::LetDirective(let_dir) => {
                // Let directives are handled later in slot processing
                if !node.slot_scope_applies_to_itself() {
                    lets.get_mut("default").unwrap().push(let_dir);
                }
            }
            Attribute::SpreadAttribute(_spread) => {
                // TODO: Visit spread attribute and add to props_and_spreads
                // For now, create a placeholder
                let spread_expr = JsExpr::Identifier("spread".to_string());
                props_and_spreads.push(PropsOrSpread::Spread(transform(spread_expr)));
            }
            Attribute::Attribute(attr) => {
                // Build attribute value
                let value = build_attribute_value(
                    &attr.value,
                    transform,
                    false,
                    true, /* is_component */
                );

                // Check for custom CSS properties
                if attr.name.starts_with("--") {
                    custom_css_props.push(JsObjectMember::Property(JsProperty {
                        key: JsPropertyKey::Identifier(attr.name.to_string()),
                        value: Box::new(value),
                        kind: JsPropertyKind::Init,
                        computed: false,
                        shorthand: false,
                    }));
                    continue;
                }

                if attr.name == "children" {
                    has_children_prop = true;
                }

                // Add to props
                let current = props_and_spreads.last_mut();
                let props = if let Some(PropsOrSpread::Props(props)) = current {
                    props
                } else {
                    props_and_spreads.push(PropsOrSpread::Props(Vec::new()));
                    if let Some(PropsOrSpread::Props(props)) = props_and_spreads.last_mut() {
                        props
                    } else {
                        unreachable!()
                    }
                };

                props.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(attr.name.to_string()),
                    value: Box::new(value),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));
            }
            Attribute::BindDirective(bind) => {
                if bind.name != "this" {
                    has_bindings = true;
                    // TODO: Implement bind directive handling
                    // For now, add getter/setter placeholders
                }
            }
            _ => {
                // Other directive types
            }
        }
    }

    // Process children and slots
    let mut children: std::collections::HashMap<String, Vec<&TemplateNode>> =
        std::collections::HashMap::new();
    let snippet_declarations: Vec<JsStatement> = Vec::new();
    let mut serialized_slots: Vec<JsObjectMember> = Vec::new();

    for child in node.get_fragment_nodes() {
        match child {
            TemplateNode::SnippetBlock(_snippet) => {
                // TODO: Visit snippet block and add declaration
                // Add to props and serialized slots
                let snippet_name = "snippet"; // TODO: Extract actual name

                serialized_slots.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(if snippet_name == "children" {
                        "default".to_string()
                    } else {
                        snippet_name.to_string()
                    }),
                    value: Box::new(JsExpr::Literal(JsLiteral::Boolean(true))),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));
            }
            _ => {
                let slot_name = "default".to_string();

                // Check for slot attribute
                if is_element_node(child) {
                    // TODO: Extract slot name from attributes
                }

                children.entry(slot_name).or_default().push(child);
            }
        }
    }

    // Serialize slots
    for (slot_name, slot_children) in &children {
        if slot_children.is_empty() {
            continue;
        }

        // TODO: Visit children and build slot function
        // For now, create a placeholder arrow function
        let slot_fn = JsExpr::Arrow(JsArrowFunction {
            params: vec![JsPattern::Identifier("$$renderer".to_string())],
            body: JsArrowBody::Block(JsBlockStatement { body: Vec::new() }),
            is_async: false,
        });

        if slot_name == "default" && !has_children_prop {
            if lets.get("default").map(|l| l.is_empty()).unwrap_or(true) {
                // Create children prop
                let current = props_and_spreads.last_mut();
                let props = if let Some(PropsOrSpread::Props(props)) = current {
                    props
                } else {
                    props_and_spreads.push(PropsOrSpread::Props(Vec::new()));
                    if let Some(PropsOrSpread::Props(props)) = props_and_spreads.last_mut() {
                        props
                    } else {
                        unreachable!()
                    }
                };

                props.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier("children".to_string()),
                    value: Box::new(slot_fn),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));

                serialized_slots.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(slot_name.clone()),
                    value: Box::new(JsExpr::Literal(JsLiteral::Boolean(true))),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));
            } else {
                // Has let directives - use $$slots
                serialized_slots.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(slot_name.clone()),
                    value: Box::new(slot_fn),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));
            }
        } else {
            serialized_slots.push(JsObjectMember::Property(JsProperty {
                key: JsPropertyKey::Identifier(slot_name.clone()),
                value: Box::new(slot_fn),
                kind: JsPropertyKind::Init,
                computed: false,
                shorthand: false,
            }));
        }
    }

    // Add $$slots if needed
    if !serialized_slots.is_empty() {
        let current = props_and_spreads.last_mut();
        let props = if let Some(PropsOrSpread::Props(props)) = current {
            props
        } else {
            props_and_spreads.push(PropsOrSpread::Props(Vec::new()));
            if let Some(PropsOrSpread::Props(props)) = props_and_spreads.last_mut() {
                props
            } else {
                unreachable!()
            }
        };

        props.push(JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Identifier("$$slots".to_string()),
            value: Box::new(JsExpr::Object(JsObjectExpression {
                properties: serialized_slots,
            })),
            kind: JsPropertyKind::Init,
            computed: false,
            shorthand: false,
        }));
    }

    // Build props expression
    let props_expression = if props_and_spreads.is_empty()
        || (props_and_spreads.len() == 1 && matches!(props_and_spreads[0], PropsOrSpread::Props(_)))
    {
        // Simple object
        let props = if let Some(PropsOrSpread::Props(props)) = props_and_spreads.first() {
            props.clone()
        } else {
            Vec::new()
        };
        JsExpr::Object(JsObjectExpression { properties: props })
    } else {
        // Need $.spread_props
        let args: Vec<JsExpr> = props_and_spreads
            .iter()
            .map(|p| match p {
                PropsOrSpread::Props(props) => JsExpr::Object(JsObjectExpression {
                    properties: props.clone(),
                }),
                PropsOrSpread::Spread(expr) => expr.clone(),
            })
            .collect();

        JsExpr::Call(JsCallExpression {
            callee: Box::new(JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$".to_string())),
                property: JsMemberProperty::Identifier("spread_props".to_string()),
                computed: false,
                optional: false,
            })),
            arguments: vec![JsExpr::Array(JsArrayExpression {
                elements: args.into_iter().map(Some).collect(),
            })],
            optional: false,
        })
    };

    // Build component call
    let component_call = if node.is_svelte_component() {
        // SvelteComponent uses maybe_call
        JsExpr::Call(JsCallExpression {
            callee: Box::new(JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$".to_string())),
                property: JsMemberProperty::Identifier("maybe_call".to_string()),
                computed: false,
                optional: false,
            })),
            arguments: vec![
                expression,
                JsExpr::Identifier("$$renderer".to_string()),
                props_expression,
            ],
            optional: false,
        })
    } else {
        JsExpr::Call(JsCallExpression {
            callee: Box::new(expression),
            arguments: vec![
                JsExpr::Identifier("$$renderer".to_string()),
                props_expression,
            ],
            optional: false,
        })
    };

    let mut statement = JsStatement::Expression(JsExpressionStatement {
        expression: Box::new(component_call),
    });

    // Wrap with snippet declarations if needed
    if !snippet_declarations.is_empty() {
        let mut body_statements = snippet_declarations;
        body_statements.push(statement);
        statement = JsStatement::Block(JsBlockStatement {
            body: body_statements,
        });
    }

    // Wrap with CSS props if needed
    if !custom_css_props.is_empty() {
        let is_dynamic = node.is_svelte_component() || node.is_dynamic();

        statement = JsStatement::Expression(JsExpressionStatement {
            expression: Box::new(JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("css_props".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: vec![
                    JsExpr::Identifier("$$renderer".to_string()),
                    JsExpr::Literal(JsLiteral::Boolean(state.namespace != "svg")),
                    JsExpr::Object(JsObjectExpression {
                        properties: custom_css_props.clone(),
                    }),
                    JsExpr::Arrow(JsArrowFunction {
                        params: vec![],
                        body: JsArrowBody::Block(JsBlockStatement {
                            body: vec![statement],
                        }),
                        is_async: false,
                    }),
                    if is_dynamic {
                        JsExpr::Literal(JsLiteral::Boolean(true))
                    } else {
                        JsExpr::Identifier("undefined".to_string())
                    },
                ],
                optional: false,
            })),
        });
    }

    // Check if async (would be handled by PromiseOptimiser)
    let is_async = false; // TODO: Implement async detection

    if is_async {
        // Wrap in async block
        // TODO: Get blockers from PromiseOptimiser
        statement = create_async_block(
            JsBlockStatement {
                body: vec![statement],
            },
            Vec::new(),
            false,
            true,
        );
    } else if node.is_dynamic() && custom_css_props.is_empty() {
        // Add empty comment for hydration anchor
        state
            .template
            .push(TemplateItem::Expression(empty_comment()));
    }

    // Add statement to template
    state.template.push(TemplateItem::Statement(statement));

    // Add trailing comment for non-async dynamic components
    if !is_async && !state.skip_hydration_boundaries && custom_css_props.is_empty() && !has_bindings
    {
        state
            .template
            .push(TemplateItem::Expression(empty_comment()));
    }
}

// =============================================================================
// Helper types and traits
// =============================================================================

/// Props can be either an object of properties or a spread expression.
enum PropsOrSpread {
    Props(Vec<JsObjectMember>),
    Spread(JsExpr),
}

/// Trait for component-like nodes (Component, SvelteComponent, SvelteSelf).
pub trait ComponentNode {
    fn get_attributes(&self) -> &[Attribute];
    fn get_fragment_nodes(&self) -> &[TemplateNode];
    fn is_svelte_component(&self) -> bool;
    fn is_dynamic(&self) -> bool;
    fn slot_scope_applies_to_itself(&self) -> bool;
}

impl ComponentNode for Component {
    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn get_fragment_nodes(&self) -> &[TemplateNode] {
        &self.fragment.nodes
    }

    fn is_svelte_component(&self) -> bool {
        false
    }

    fn is_dynamic(&self) -> bool {
        // TODO: Check metadata.dynamic
        self.metadata.dynamic
    }

    fn slot_scope_applies_to_itself(&self) -> bool {
        self.attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "slot"))
    }
}

impl ComponentNode for SvelteComponentElement {
    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn get_fragment_nodes(&self) -> &[TemplateNode] {
        &self.fragment.nodes
    }

    fn is_svelte_component(&self) -> bool {
        true
    }

    fn is_dynamic(&self) -> bool {
        true
    }

    fn slot_scope_applies_to_itself(&self) -> bool {
        self.attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "slot"))
    }
}

impl ComponentNode for SvelteElement {
    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn get_fragment_nodes(&self) -> &[TemplateNode] {
        &self.fragment.nodes
    }

    fn is_svelte_component(&self) -> bool {
        false
    }

    fn is_dynamic(&self) -> bool {
        false
    }

    fn slot_scope_applies_to_itself(&self) -> bool {
        self.attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "slot"))
    }
}
