//! Type definitions for the analysis phase.

use super::scope::{Scope, ScopeRoot};
use crate::ast::template::{Root, Script};
use crate::compiler::CompileOptions;
use std::collections::{HashMap, HashSet};

/// Pre-extracted script content to avoid re-parsing in Phase 3.
#[derive(Debug, Clone)]
pub struct ScriptContent {
    /// The raw script content as a string.
    pub raw: String,
    /// Start position in the source.
    pub start: u32,
    /// End position in the source.
    pub end: u32,
    /// Whether this script uses runes ($state, $derived, $effect, $props).
    pub uses_runes: bool,
}

impl ScriptContent {
    /// Extract script content from an AST Script node and source.
    pub fn from_script(script: &Script, source: &str) -> Self {
        let start = script.content.start().unwrap_or(0);
        let end = script.content.end().unwrap_or(0);
        let raw = if (end as usize) > (start as usize) && (end as usize) <= source.len() {
            source[start as usize..end as usize].to_string()
        } else {
            String::new()
        };

        let uses_runes = raw.contains("$state")
            || raw.contains("$derived")
            || raw.contains("$effect")
            || raw.contains("$props");

        Self {
            raw,
            start,
            end,
            uses_runes,
        }
    }
}

/// Analysis result for a Svelte component.
#[derive(Debug)]
pub struct ComponentAnalysis {
    /// The root scope containing all bindings
    pub root: ScopeRoot,

    /// Analysis of the module script (<script context="module">)
    pub module: Option<JsAnalysis>,

    /// Analysis of the instance script (<script>)
    pub instance: Option<JsAnalysis>,

    /// Analysis of the template
    pub template: TemplateAnalysis,

    /// CSS analysis
    pub css: CssAnalysis,

    /// Component name (derived from filename)
    pub name: String,

    /// Whether the component uses runes
    pub runes: bool,

    /// Whether the component might use runes
    pub maybe_runes: bool,

    /// Whether the component uses $$props
    pub uses_props: bool,

    /// Whether the component uses $$restProps
    pub uses_rest_props: bool,

    /// Whether the component uses $$slots
    pub uses_slots: bool,

    /// Whether the component uses render tags (@render)
    pub uses_render_tags: bool,

    /// Whether the component uses component bindings
    pub uses_component_bindings: bool,

    /// Whether the component needs context
    pub needs_context: bool,

    /// Whether the component needs props validation
    pub needs_props: bool,

    /// Exported names and their aliases
    pub exports: Vec<Export>,

    /// Custom element configuration
    pub custom_element: Option<CustomElementConfig>,

    /// Whether styles should be injected via JavaScript
    pub inject_styles: bool,

    /// The original source code
    pub source: String,

    /// Pre-extracted instance script content (to avoid re-parsing in Phase 3)
    pub instance_script_content: Option<ScriptContent>,

    /// Pre-extracted module script content (to avoid re-parsing in Phase 3)
    pub module_script_content: Option<ScriptContent>,
}

impl ComponentAnalysis {
    /// Create a new component analysis.
    pub fn new(source: &str, options: &CompileOptions) -> Self {
        let name = options
            .filename
            .as_ref()
            .map(|f| derive_component_name(f))
            .unwrap_or_else(|| "Component".to_string());

        Self {
            root: ScopeRoot::new(),
            module: None,
            instance: None,
            template: TemplateAnalysis::default(),
            css: CssAnalysis::default(),
            name,
            runes: false,
            maybe_runes: false,
            uses_props: false,
            uses_rest_props: false,
            uses_slots: false,
            uses_render_tags: false,
            uses_component_bindings: false,
            needs_context: false,
            needs_props: false,
            exports: Vec::new(),
            custom_element: None,
            inject_styles: options.css == crate::compiler::CssMode::Injected,
            source: source.to_string(),
            instance_script_content: None,
            module_script_content: None,
        }
    }

    /// Extract and store script content from the AST.
    /// This should be called during Phase 2 to pre-extract scripts for Phase 3.
    pub fn extract_scripts(&mut self, ast: &Root) {
        // Extract instance script content
        if let Some(ref script) = ast.instance {
            let content = ScriptContent::from_script(script, &self.source);
            if content.uses_runes {
                self.runes = true;
            }
            self.instance_script_content = Some(content);
        }

        // Extract module script content
        if let Some(ref script) = ast.module {
            let content = ScriptContent::from_script(script, &self.source);
            self.module_script_content = Some(content);
        }
    }

    /// Create scopes for the component.
    pub fn create_scopes(&mut self, ast: &Root) -> Result<(), super::AnalysisError> {
        // Build scope tree using ScopeBuilder
        let scope_root = super::scope_builder::build_scopes(ast, &self.source);
        self.root = scope_root;

        // Update runes flag based on bindings
        for binding in &self.root.bindings {
            if binding.kind.is_rune() {
                self.runes = true;
                break;
            }
        }

        Ok(())
    }

    /// Analyze CSS in the component.
    pub fn analyze_css(
        &mut self,
        css: &crate::ast::css::StyleSheet,
        options: &CompileOptions,
    ) -> Result<(), super::AnalysisError> {
        self.css.has_css = true;

        // Generate the CSS hash
        // Svelte uses the filename if available, otherwise the CSS content
        let hash_source = if let Some(ref filename) = options.filename {
            if filename == "(unknown)" {
                css.content.styles.clone()
            } else {
                filename.clone()
            }
        } else {
            css.content.styles.clone()
        };

        self.css.hash =
            crate::compiler::phases::phase3_transform::css::generate_css_hash(&hash_source);

        // TODO: Analyze for keyframes and :global selectors
        Ok(())
    }
}

/// Derive component name from filename.
fn derive_component_name(filename: &str) -> String {
    let path = std::path::Path::new(filename);

    // If the file is named "index.svelte", use the parent directory name
    let stem = if path.file_stem().and_then(|s| s.to_str()) == Some("index") {
        path.parent()
            .and_then(|p| p.file_name())
            .and_then(|s| s.to_str())
            .unwrap_or("Component")
    } else {
        path.file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Component")
    };

    // Convert to component name format
    let parts: Vec<&str> = stem
        .split(['-', '_', '.'])
        .filter(|part| !part.is_empty())
        .collect();

    if parts.is_empty() {
        return "Component".to_string();
    }

    let mut result = String::new();
    for (i, part) in parts.iter().enumerate() {
        if i > 0 {
            result.push('_');
        }

        if i == 0 {
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.extend(first.to_uppercase());
                result.push_str(chars.as_str());
            }
        } else {
            result.push_str(part);
        }
    }

    result
}

/// Analysis of a JavaScript block.
#[derive(Debug, Default)]
pub struct JsAnalysis {
    /// The scope for this JS block
    pub scope: Scope,

    /// Scopes for nested blocks
    pub scopes: HashMap<usize, Scope>,

    /// Whether this block contains await expressions
    pub has_await: bool,
}

/// Analysis of the template.
#[derive(Debug, Default)]
pub struct TemplateAnalysis {
    /// The scope for the template
    pub scope: Scope,

    /// Scopes for nested template blocks
    pub scopes: HashMap<usize, Scope>,

    /// All DOM elements in the template
    pub elements: Vec<ElementInfo>,

    /// All components used in the template
    pub components: Vec<ComponentInfo>,

    /// All snippets declared in the template
    pub snippets: HashSet<String>,
}

/// Information about a DOM element.
#[derive(Debug)]
pub struct ElementInfo {
    /// The element tag name
    pub name: String,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
    /// Whether this element has dynamic attributes
    pub has_dynamic_attributes: bool,
    /// Whether this element has spread attributes
    pub has_spread: bool,
}

/// Information about a component usage.
#[derive(Debug)]
pub struct ComponentInfo {
    /// The component name
    pub name: String,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
    /// Whether this component has bindings
    pub has_bindings: bool,
}

/// CSS analysis result.
#[derive(Debug, Default)]
pub struct CssAnalysis {
    /// Whether CSS is present
    pub has_css: bool,

    /// The CSS hash for scoping
    pub hash: String,

    /// Keyframe names for scoping
    pub keyframes: Vec<String>,

    /// Whether the CSS contains :global
    pub has_global: bool,

    /// Element tag names used in the template (for unused selector detection)
    pub used_elements: std::collections::HashSet<String>,

    /// Class names used in the template (for unused selector detection)
    pub used_classes: std::collections::HashSet<String>,

    /// IDs used in the template (for unused selector detection)
    pub used_ids: std::collections::HashSet<String>,
}

/// Export information.
#[derive(Debug, Clone)]
pub struct Export {
    /// The exported name
    pub name: String,
    /// The alias (if different from name)
    pub alias: Option<String>,
}

/// Custom element configuration.
#[derive(Debug, Clone)]
pub struct CustomElementConfig {
    /// The custom element tag name
    pub tag: Option<String>,
    /// Shadow DOM mode
    pub shadow: Option<String>,
}
