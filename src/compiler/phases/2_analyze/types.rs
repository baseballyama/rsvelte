//! Type definitions for the analysis phase.

use super::scope::{Scope, ScopeRoot};
use crate::ast::template::{Root, Script};
use crate::compiler::CompileOptions;
use rustc_hash::{FxHashMap, FxHashSet};

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

/// A reactive statement ($: statement) in legacy mode (Svelte 4).
#[derive(Debug, Clone)]
pub struct ReactiveStatement {
    /// Bindings that are assigned to in this reactive statement
    pub assignments: FxHashSet<usize>,
    /// Bindings that this reactive statement depends on
    pub dependencies: Vec<usize>,
}

/// Pre-transformed instance script body sections.
/// Used for optimization during code generation.
/// Corresponds to `instance_body` in ComponentAnalysis (phases/types.d.ts).
#[derive(Debug, Default, Clone)]
pub struct InstanceBody {
    /// Statements hoisted to the top (imports)
    pub hoisted: Vec<serde_json::Value>,
    /// Synchronous statements (regular let/const declarations, function declarations)
    pub sync: Vec<serde_json::Value>,
    /// Asynchronous statements (with their await status)
    pub async_: Vec<AsyncStatement>,
    /// Variable declarations (identifiers that need blocker tracking)
    pub declarations: Vec<String>,
}

/// An asynchronous statement with its await status.
/// Corresponds to items in `instance_body.async` array.
#[derive(Debug, Clone)]
pub struct AsyncStatement {
    /// The statement node (VariableDeclarator or Statement)
    pub node: serde_json::Value,
    /// Whether this statement contains await expressions
    pub has_await: bool,
}

/// Declaration for an awaited value in an await block.
/// Corresponds to AwaitedDeclaration in the official compiler.
#[derive(Debug, Clone)]
pub struct AwaitedDeclaration {
    /// The identifier being declared
    pub id: String,
    /// Whether this declaration has await in its value
    pub has_await: bool,
    /// The pattern being destructured (if applicable)
    pub pattern: Option<String>,
    /// Expression metadata for the declaration
    pub metadata: crate::ast::template::ExpressionMetadata,
    /// Identifiers that update this declaration
    pub updated_by: FxHashSet<String>,
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

    /// Whether the component uses event attributes (on:event={handler})
    pub uses_event_attributes: bool,

    /// The first on: directive node encountered (for error reporting about mixed syntax)
    pub event_directive_node: Option<EventDirectiveInfo>,

    /// Whether the component needs context
    pub needs_context: bool,

    /// Whether the component needs props validation
    pub needs_props: bool,

    /// Whether the component needs mutation validation (for reactive state tracking)
    pub needs_mutation_validation: bool,

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

    /// $derived expressions that contain await (async deriveds)
    /// These need special handling during code generation
    pub async_deriveds: FxHashSet<String>,

    /// The identifier used for $props.id() (if any)
    /// Used to track the props ID declaration
    pub props_id: Option<String>,

    /// Hash of the filename (used for svelte:head hydration validation)
    /// This is always computed from the filename, regardless of CSS presence
    pub filename_hash: String,

    /// Whether the component uses $inspect.trace()
    pub tracing: bool,

    /// Class bodies with their state fields (for class body analysis)
    /// Maps from class body node (JSON) to state fields by name
    pub classes: FxHashMap<String, FxHashMap<String, StateField>>,

    /// Reactive statements ($: statements) in legacy mode
    /// Maps from the labeled statement node (JSON string) to its analysis
    pub reactive_statements: FxHashMap<String, ReactiveStatement>,

    /// Whether the component is immutable (no reactivity)
    pub immutable: bool,

    /// Whether the component uses accessors mode
    pub accessors: bool,

    /// Await expressions needing context preservation (pickled awaits)
    pub pickled_awaits: FxHashSet<String>,

    /// Identifiers that make up bind:group expressions -> internal group binding name
    /// Maps from (key, bindings) to the generated identifier
    pub binding_groups: FxHashMap<String, String>,

    /// Slot names mapped to their SlotElement nodes
    pub slot_names: FxHashMap<String, String>,

    /// Every render tag/component and whether it could be definitively resolved
    pub snippet_renderers: FxHashMap<String, bool>,

    /// Pre-transformed <script> instance body (for optimization)
    pub instance_body: InstanceBody,

    /// JS comments from the AST (for preservation)
    pub comments: Vec<String>,

    /// Warnings generated during analysis
    pub warnings: Vec<super::warnings::AnalysisWarning>,
}

impl ComponentAnalysis {
    /// Create a new component analysis.
    pub fn new(source: &str, options: &CompileOptions) -> Self {
        let name = options
            .filename
            .as_ref()
            .map(|f| derive_component_name(f))
            .unwrap_or_else(|| "Component".to_string());

        // If runes is explicitly set in options, use that; otherwise default to false
        // and let the analysis phase detect runes from source
        let initial_runes = options.runes.unwrap_or(false);

        // Compute filename hash for svelte:head hydration validation
        // This is always based on the filename (or "main.svelte" if not specified)
        let filename_hash_source = options
            .filename
            .as_ref()
            .filter(|f| *f != "(unknown)")
            .map(|f| f.as_str())
            .unwrap_or("main.svelte");
        let filename_hash =
            crate::compiler::phases::phase3_transform::css::generate_raw_hash(filename_hash_source);

        Self {
            root: ScopeRoot::new(),
            module: None,
            instance: None,
            template: TemplateAnalysis::default(),
            css: CssAnalysis::default(),
            name,
            runes: initial_runes,
            maybe_runes: false,
            uses_props: false,
            uses_rest_props: false,
            uses_slots: false,
            uses_render_tags: false,
            uses_component_bindings: false,
            uses_event_attributes: false,
            event_directive_node: None,
            needs_context: false,
            needs_props: false,
            needs_mutation_validation: false,
            exports: Vec::new(),
            custom_element: None,
            inject_styles: options.css == crate::compiler::CssMode::Injected,
            source: source.to_string(),
            instance_script_content: None,
            module_script_content: None,
            async_deriveds: FxHashSet::default(),
            props_id: None,
            filename_hash,
            tracing: false,
            classes: FxHashMap::default(),
            reactive_statements: FxHashMap::default(),
            immutable: options.immutable,
            accessors: options.accessors,
            pickled_awaits: FxHashSet::default(),
            binding_groups: FxHashMap::default(),
            slot_names: FxHashMap::default(),
            snippet_renderers: FxHashMap::default(),
            instance_body: InstanceBody::default(),
            comments: Vec::new(),
            warnings: Vec::new(),
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
        let (scope_root, validation_errors) =
            super::scope_builder::build_scopes(ast, &self.source, self.runes);
        self.root = scope_root;

        // Return first validation error if any occurred during scope building
        // (e.g., invalid $ prefix on variable names)
        if let Some(err) = validation_errors.into_iter().next() {
            return Err(err);
        }

        // Update runes flag based on bindings
        for binding in &self.root.bindings {
            if binding.kind.is_rune() {
                self.runes = true;
                break;
            }
        }

        // In runes mode, immutable is always true
        // This matches the official Svelte compiler: immutable: runes || options.immutable
        if self.runes {
            self.immutable = true;
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
/// Matches Svelte's get_component_name() in phases/2-analyze/index.js
fn derive_component_name(filename: &str) -> String {
    // Split by path separators (like JS: filename.split(/[/\\]/))
    let parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.last().unwrap_or(&"Component");
    let last_dir = if parts.len() > 1 {
        parts.get(parts.len() - 2).copied()
    } else {
        None
    };

    // Remove .svelte extension
    let mut name = basename.replace(".svelte", "");

    // If name is "index" and there's a parent dir (not "src"), use the parent dir name
    if name == "index"
        && let Some(dir) = last_dir
        && dir != "src"
        && !dir.is_empty()
    {
        name = dir.to_string();
    }

    let stem = if name.is_empty() { "Component" } else { &name };

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
    pub scopes: FxHashMap<usize, Scope>,

    /// Whether this block contains await expressions
    pub has_await: bool,
}

/// Analysis of the template.
#[derive(Debug, Default)]
pub struct TemplateAnalysis {
    /// The scope for the template
    pub scope: Scope,

    /// Scopes for nested template blocks
    pub scopes: FxHashMap<usize, Scope>,

    /// All DOM elements in the template
    pub elements: Vec<ElementInfo>,

    /// All components used in the template
    pub components: Vec<ComponentInfo>,

    /// All snippets declared in the template
    pub snippets: FxHashSet<String>,
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

/// Information about an event directive (for error reporting).
#[derive(Debug, Clone)]
pub struct EventDirectiveInfo {
    /// The event name
    pub name: String,
    /// Start position in source
    pub start: u32,
    /// End position in source
    pub end: u32,
}

/// A state field in a class (using $state, $state.raw, $derived, $derived.by).
#[derive(Debug, Clone)]
pub struct StateField {
    /// The type of rune used ($state, $state.raw, $derived, $derived.by)
    pub rune_type: String,
    /// The field node (PropertyDefinition or AssignmentExpression in JS)
    pub node: serde_json::Value,
    /// The private identifier key
    pub key: serde_json::Value,
    /// The call expression value ($state(...), etc.)
    pub value: serde_json::Value,
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
    pub used_elements: FxHashSet<String>,

    /// Class names used in the template (for unused selector detection)
    pub used_classes: FxHashSet<String>,

    /// IDs used in the template (for unused selector detection)
    pub used_ids: FxHashSet<String>,

    /// Whether there are dynamic elements (svelte:element with dynamic this)
    /// If true, type selectors cannot be safely pruned
    pub has_dynamic_elements: bool,

    /// Whether there are dynamic class expressions (spreads, complex expressions)
    /// If true, class selectors cannot be safely pruned
    pub has_dynamic_classes: bool,

    /// Whether the template has control flow (if/each/await/snippet) that affects sibling relationships
    /// If true, sibling combinator unused detection cannot be safely performed
    pub has_control_flow: bool,

    /// DOM structure information for selector matching
    pub dom_structure: DomStructure,
}

/// DOM structure information for CSS selector matching.
#[derive(Debug, Default, Clone)]
pub struct DomStructure {
    /// All elements in the template, with their relationships
    pub elements: Vec<CssDomElement>,
}

/// Certainty level of sibling relationships.
/// Used for control flow analysis to determine if sibling combinators are valid.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SiblingCertainty {
    /// Element definitely exists in the DOM (not inside control flow)
    #[default]
    Definite,
    /// Element may or may not exist (inside if/each/await block)
    Probable,
}

/// Element information for CSS selector matching (DOM tree structure).
#[derive(Debug, Clone)]
pub struct CssDomElement {
    /// Element tag name
    pub tag_name: String,
    /// Class names on this element
    pub classes: FxHashSet<String>,
    /// ID (if any)
    pub id: Option<String>,
    /// Parent element index (in elements array), None for root
    pub parent_idx: Option<usize>,
    /// Child element indices
    pub children_idx: Vec<usize>,
    /// Whether this element is a direct child of the component root
    pub is_root_child: bool,
    /// Possible previous adjacent siblings (for + combinator)
    /// Tuple of (element_index, certainty)
    pub possible_prev_adjacent: Vec<(usize, SiblingCertainty)>,
    /// Possible next adjacent siblings (for + combinator)
    /// Tuple of (element_index, certainty)
    pub possible_next_adjacent: Vec<(usize, SiblingCertainty)>,
    /// Possible previous general siblings (for ~ combinator)
    /// Tuple of (element_index, certainty)
    pub possible_prev_general: Vec<(usize, SiblingCertainty)>,
    /// Possible next general siblings (for ~ combinator)
    /// Tuple of (element_index, certainty)
    pub possible_next_general: Vec<(usize, SiblingCertainty)>,
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
