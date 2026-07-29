use rsvelte_core::CompileResult as CoreCompileResult;

use crate::{ComponentFacts, Diagnostic};

/// Generated JavaScript and its standard source map.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GeneratedCode {
    /// JavaScript source.
    pub code: String,
    /// JSON source map, when enabled.
    pub source_map: Option<String>,
}

/// Generated external CSS and its metadata.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GeneratedCss {
    /// CSS source.
    pub code: String,
    /// JSON source map, when enabled.
    pub source_map: Option<String>,
    /// Whether the output contains global rules.
    pub has_global: bool,
    /// Frozen component scope class.
    pub scope: Option<String>,
}

/// Runtime output for one client or server target.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimeArtifact {
    /// Generated JavaScript.
    pub javascript: GeneratedCode,
    /// Generated external CSS, when present.
    pub css: Option<GeneratedCss>,
    /// Non-fatal compiler diagnostics.
    pub diagnostics: Vec<Diagnostic>,
    /// Whether the component was compiled in runes mode.
    pub runes: bool,
}

impl RuntimeArtifact {
    pub(crate) fn from_core(
        source: &str,
        facts: &ComponentFacts,
        result: CoreCompileResult,
    ) -> Self {
        Self {
            javascript: GeneratedCode {
                code: result.js.code,
                source_map: result.js.map,
            },
            css: result.css.map(|css| GeneratedCss {
                code: css.code,
                source_map: css.map,
                has_global: css.has_global,
                scope: facts.css_scope.clone(),
            }),
            diagnostics: result
                .warnings
                .into_iter()
                .map(|warning| Diagnostic::from_core_warning(source, warning))
                .collect(),
            runes: result.metadata.runes,
        }
    }
}
