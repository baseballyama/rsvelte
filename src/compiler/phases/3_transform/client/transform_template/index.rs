//! Transform template for client-side code generation.
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-template/index.js`

use super::types::Node;
use crate::compiler::phases::phase3_transform::client::types::{
    ComponentClientTransformState, FragmentsMode,
};
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{JsExpr, JsTemplateLiteral};

// Constants from svelte/packages/svelte/src/constants.js
const TEMPLATE_USE_SVG: u32 = 1 << 2;
const TEMPLATE_USE_MATHML: u32 = 1 << 3;

/// Namespace type for elements
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Namespace {
    Html,
    Svg,
    Mathml,
}

impl Namespace {
    pub fn as_str(&self) -> &'static str {
        match self {
            Namespace::Html => "html",
            Namespace::Svg => "svg",
            Namespace::Mathml => "mathml",
        }
    }
}

/// Locator function type for getting line and column from position.
pub type Locator = Box<dyn Fn(u32) -> Location>;

/// Location in source code.
#[derive(Debug, Clone)]
pub struct Location {
    pub line: usize,
    pub column: usize,
}

/// Build location metadata for template nodes.
fn build_locations(nodes: &[Node], locator: &Locator) -> JsExpr {
    let mut array_elements = Vec::new();

    for node in nodes {
        if let Node::Element(element) = node {
            let loc = locator(element.start);
            let line = b::number(loc.line as f64);
            let column = b::number(loc.column as f64);

            let mut expression_elements = vec![line, column];

            let children = build_locations(&element.children, locator);
            if let JsExpr::Array(ref arr) = children
                && !arr.elements.is_empty()
            {
                expression_elements.push(children);
            }

            array_elements.push(b::array(expression_elements));
        }
    }

    b::array(array_elements)
}

/// Transform template to client-side code.
///
/// Mirrors `transform_template` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-template/index.js`
/// (post-#18320). The hoisted `var <id> = $.from_html(...)` declaration is now
/// pushed onto `state.hoisted` here, and identical templates within the same
/// component are shared via `state.templates`. The returned identifier is what
/// callers wrap in `<id>()` to instantiate the template.
///
/// # Arguments
///
/// * `arena` - JS AST arena
/// * `state` - Component client transform state
/// * `base_name` - Preferred base for the hoisted identifier (typically `"root"`)
/// * `namespace` - Element namespace (html, svg, mathml)
/// * `flags` - Optional flags for template creation
/// * `locator` - Optional locator function for dev mode
pub fn transform_template<'a>(
    arena: &JsArena,
    state: &mut ComponentClientTransformState<'a>,
    base_name: &str,
    namespace: Namespace,
    flags: Option<u32>,
    locator: Option<&Locator>,
) -> JsExpr {
    let tree = state.options.fragments == FragmentsMode::Tree;
    let mut current_flags = flags.unwrap_or(0);

    let expression = if tree {
        state.template.as_tree(arena)
    } else {
        state.template.as_html()
    };

    if tree {
        if namespace == Namespace::Svg {
            current_flags |= TEMPLATE_USE_SVG;
        }
        if namespace == Namespace::Mathml {
            current_flags |= TEMPLATE_USE_MATHML;
        }
    }

    // Dedup key for non-tree, non-dev templates. Tree-mode templates can
    // contain object expressions that are not safe to compare as strings, and
    // dev-mode templates are wrapped in per-call-site `$.add_locations`.
    // Skipped when `contains_script_tag` is set so the `$.with_script` wrap is
    // preserved per-template rather than reused across non-script call sites.
    let key = if tree || state.options.dev || state.template.contains_script_tag {
        None
    } else {
        get_template_key(&expression, namespace, current_flags)
    };

    if let Some(ref k) = key
        && let Some(existing) = state.templates.borrow().get(k)
    {
        return b::id(existing);
    }

    let function_name = if tree {
        b::member(arena, b::id("$"), "from_tree")
    } else {
        b::member(arena, b::id("$"), format!("from_{}", namespace.as_str()))
    };

    let mut call = if current_flags != 0 {
        b::call(
            arena,
            function_name,
            vec![expression, b::number(current_flags as f64)],
        )
    } else {
        b::call(arena, function_name, vec![expression])
    };

    if state.template.contains_script_tag {
        call = b::call(
            arena,
            b::member(arena, b::id("$"), "with_script"),
            vec![call],
        );
    }

    if state.options.dev {
        // Create a locator from the source if one wasn't provided
        let auto_locator: Locator;
        let loc_ref: &Locator = if let Some(loc) = locator {
            loc
        } else {
            let source = state.analysis.source.clone();
            auto_locator = Box::new(move |offset: u32| {
                let offset = offset as usize;
                let bytes = source.as_bytes();
                let mut line = 1usize;
                let mut col = 0usize;
                for &byte in bytes.iter().take(offset.min(bytes.len())) {
                    if byte == b'\n' {
                        line += 1;
                        col = 0;
                    } else {
                        col += 1;
                    }
                }
                Location { line, column: col }
            });
            &auto_locator
        };
        let locations = build_locations(&state.template.nodes, loc_ref);
        call = b::call(
            arena,
            b::member(arena, b::id("$"), "add_locations"),
            vec![
                call,
                b::member_computed(
                    arena,
                    b::id(&state.analysis.name),
                    b::member(arena, b::id("$"), "FILENAME"),
                ),
                locations,
            ],
        );
    }

    let id_name = state.memoizer.generate_id(base_name);
    state.hoisted.push(b::var_decl(arena, &id_name, Some(call)));

    if let Some(k) = key {
        state.templates.borrow_mut().insert(k, id_name.clone());
    }

    b::id(&id_name)
}

/// Returns a stable key for templates that are safe to deduplicate — plain
/// `$.from_html`/`$.from_svg`/`$.from_mathml` factories with a single literal
/// template quasi — or `None` for anything else.
fn get_template_key(expression: &JsExpr, namespace: Namespace, flags: u32) -> Option<String> {
    let template: &JsTemplateLiteral = match expression {
        JsExpr::TemplateLiteral(t) => t,
        _ => return None,
    };
    if !template.expressions.is_empty() || template.quasis.len() != 1 {
        return None;
    }
    Some(format!(
        "{} {} {}",
        namespace.as_str(),
        flags,
        template.quasis[0].raw
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_namespace_as_str() {
        assert_eq!(Namespace::Html.as_str(), "html");
        assert_eq!(Namespace::Svg.as_str(), "svg");
        assert_eq!(Namespace::Mathml.as_str(), "mathml");
    }
}
