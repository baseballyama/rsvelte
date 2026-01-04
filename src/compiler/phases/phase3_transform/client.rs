//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution.

use super::TransformError;
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

/// Transform a component analysis into client-side JavaScript.
pub fn transform_client(
    analysis: &ComponentAnalysis,
    source: &str,
    _options: &CompileOptions,
) -> Result<String, TransformError> {
    let component_name = &analysis.name;
    let html = extract_html_from_source(source, analysis);
    let root_var = get_root_element_name(analysis);

    // Generate the client-side component
    let code = format!(
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`{html}`);

export default function {component_name}($$anchor) {{
	var {root_var} = root();

	$.append($$anchor, {root_var});
}}"#,
        html = html,
        component_name = component_name,
        root_var = root_var
    );

    Ok(code)
}

/// Extract HTML from the source code.
fn extract_html_from_source(source: &str, analysis: &ComponentAnalysis) -> String {
    // For now, extract the template portion from the source
    // This is a simplified version - the real implementation would use the AST
    if let Some(first_elem) = analysis.template.elements.first() {
        // Find the element in the source
        if first_elem.end <= source.len() {
            return source[first_elem.start..first_elem.end].to_string();
        }
    }

    // Fallback: try to extract content between script/style tags
    let mut result = source.to_string();

    // Remove script tags
    while let Some(start) = result.find("<script") {
        if let Some(end) = result[start..].find("</script>") {
            result = format!("{}{}", &result[..start], &result[start + end + 9..]);
        } else {
            break;
        }
    }

    // Remove style tags
    while let Some(start) = result.find("<style") {
        if let Some(end) = result[start..].find("</style>") {
            result = format!("{}{}", &result[..start], &result[start + end + 8..]);
        } else {
            break;
        }
    }

    result.trim().to_string()
}

/// Get the root element name for variable naming.
fn get_root_element_name(analysis: &ComponentAnalysis) -> String {
    if let Some(first_elem) = analysis.template.elements.first() {
        return first_elem.name.clone();
    }
    "node".to_string()
}
