//! Visitor implementations for analyzing AST nodes.
//!
//! Each visitor handles a specific AST node type and performs semantic analysis.

use super::AnalysisError;
use super::types::ComponentAnalysis;
use crate::ast::template::{
    AwaitBlock, Component, EachBlock, ExpressionTag, Fragment, IfBlock, KeyBlock, RegularElement,
    RenderTag, Root, SnippetBlock, TemplateNode,
};

/// Analyze the template portion of the AST.
pub fn analyze_template(ast: &Root, analysis: &mut ComponentAnalysis) -> Result<(), AnalysisError> {
    // Walk the fragment nodes
    analyze_fragment(&ast.fragment, analysis)?;

    Ok(())
}

/// Analyze a fragment (list of nodes).
fn analyze_fragment(
    fragment: &Fragment,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    for node in &fragment.nodes {
        analyze_node(node, analysis)?;
    }

    Ok(())
}

/// Analyze a single AST node.
fn analyze_node(
    node: &TemplateNode,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    match node {
        TemplateNode::Text(_) => {
            // Text nodes don't need analysis
        }
        TemplateNode::RegularElement(element) => {
            analyze_element(element, analysis)?;
        }
        TemplateNode::Component(component) => {
            analyze_component_usage(component, analysis)?;
        }
        TemplateNode::ExpressionTag(tag) => {
            analyze_expression_tag(tag, analysis)?;
        }
        TemplateNode::IfBlock(block) => {
            analyze_if_block(block, analysis)?;
        }
        TemplateNode::EachBlock(block) => {
            analyze_each_block(block, analysis)?;
        }
        TemplateNode::AwaitBlock(block) => {
            analyze_await_block(block, analysis)?;
        }
        TemplateNode::KeyBlock(block) => {
            analyze_key_block(block, analysis)?;
        }
        TemplateNode::SnippetBlock(block) => {
            analyze_snippet_block(block, analysis)?;
        }
        TemplateNode::RenderTag(tag) => {
            analysis.uses_render_tags = true;
            analyze_render_tag(tag, analysis)?;
        }
        _ => {
            // Handle other node types as needed
        }
    }

    Ok(())
}

/// Analyze an element node.
fn analyze_element(
    element: &RegularElement,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    use super::types::ElementInfo;
    use crate::ast::template::Attribute;

    // Record element info
    analysis.template.elements.push(ElementInfo {
        name: element.name.to_string(),
        start: element.start as usize,
        end: element.end as usize,
        has_dynamic_attributes: false, // TODO: detect dynamic attributes
        has_spread: false,             // TODO: detect spread attributes
    });

    // Track element name for CSS selector matching
    analysis.css.used_elements.insert(element.name.to_string());

    // Extract class and id values from attributes
    for attr in &element.attributes {
        match attr {
            Attribute::Attribute(attr_node) => {
                let attr_name = attr_node.name.as_str();

                if attr_name == "class" {
                    // Extract class names from class="foo bar baz"
                    extract_classes_from_value(&attr_node.value, analysis);
                } else if attr_name == "id" {
                    // Extract ID from id="foo"
                    extract_id_from_value(&attr_node.value, analysis);
                }
            }
            Attribute::ClassDirective(class_dir) => {
                // class:foo directive
                analysis.css.used_classes.insert(class_dir.name.to_string());
            }
            _ => {}
        }
    }

    // Analyze children
    analyze_fragment(&element.fragment, analysis)?;

    Ok(())
}

/// Extract class names from an attribute value.
fn extract_classes_from_value(
    value: &crate::ast::template::AttributeValue,
    analysis: &mut ComponentAnalysis,
) {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        AttributeValue::Sequence(parts) => {
            for part in parts {
                if let AttributeValuePart::Text(text) = part {
                    // Split by whitespace to get individual class names
                    for class in text.data.split_whitespace() {
                        analysis.css.used_classes.insert(class.to_string());
                    }
                }
            }
        }
        AttributeValue::True(_) => {
            // Boolean class attribute, no value
        }
        AttributeValue::Expression(_) => {
            // Dynamic class, can't statically analyze
        }
    }
}

/// Extract ID from an attribute value.
fn extract_id_from_value(
    value: &crate::ast::template::AttributeValue,
    analysis: &mut ComponentAnalysis,
) {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        AttributeValue::Sequence(parts) => {
            for part in parts {
                if let AttributeValuePart::Text(text) = part {
                    let id = text.data.trim();
                    if !id.is_empty() {
                        analysis.css.used_ids.insert(id.to_string());
                    }
                }
            }
        }
        AttributeValue::True(_) => {}
        AttributeValue::Expression(_) => {}
    }
}

/// Analyze a component usage.
fn analyze_component_usage(
    component: &Component,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    use super::types::ComponentInfo;

    // Record component info
    analysis.template.components.push(ComponentInfo {
        name: component.name.to_string(),
        start: component.start as usize,
        end: component.end as usize,
        has_bindings: false, // TODO: detect bindings
    });

    // Analyze children
    analyze_fragment(&component.fragment, analysis)?;

    Ok(())
}

/// Analyze an expression tag.
fn analyze_expression_tag(
    _tag: &ExpressionTag,
    _analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // TODO: Analyze the expression for references
    Ok(())
}

/// Analyze an if block.
fn analyze_if_block(
    block: &IfBlock,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // Analyze consequent
    analyze_fragment(&block.consequent, analysis)?;

    // Analyze alternate if present
    if let Some(alternate) = &block.alternate {
        analyze_fragment(alternate, analysis)?;
    }

    Ok(())
}

/// Analyze an each block.
fn analyze_each_block(
    block: &EachBlock,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // TODO: Create scope for each block with item/index bindings

    // Analyze body
    analyze_fragment(&block.body, analysis)?;

    // Analyze fallback if present
    if let Some(fallback) = &block.fallback {
        analyze_fragment(fallback, analysis)?;
    }

    Ok(())
}

/// Analyze an await block.
fn analyze_await_block(
    block: &AwaitBlock,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // Analyze pending block
    if let Some(pending) = &block.pending {
        analyze_fragment(pending, analysis)?;
    }

    // Analyze then block
    if let Some(then) = &block.then {
        analyze_fragment(then, analysis)?;
    }

    // Analyze catch block
    if let Some(catch) = &block.catch {
        analyze_fragment(catch, analysis)?;
    }

    Ok(())
}

/// Analyze a key block.
fn analyze_key_block(
    block: &KeyBlock,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    analyze_fragment(&block.fragment, analysis)?;
    Ok(())
}

/// Analyze a snippet block.
fn analyze_snippet_block(
    _block: &SnippetBlock,
    _analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // TODO: Record the snippet name when we figure out how to get it from Expression
    // For now, skip this since Expression doesn't have a simple name field

    // Analyze body
    // analyze_fragment(&block.body, analysis)?;

    Ok(())
}

/// Analyze a render tag.
fn analyze_render_tag(
    _tag: &RenderTag,
    _analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // TODO: Analyze the render expression
    Ok(())
}
