use std::fmt;
use std::sync::Arc;

use rsvelte_core::compiler::{
    CompileOptions as CoreCompileOptions, CssHashFn as CoreCssHashFn,
    CssHashInput as CoreCssHashInput, CssMode as CoreCssMode,
};

/// Canonical, versioned identity for one public option set.
///
/// Combine this value with [`crate::Engine::fingerprint`] and a source-content
/// identity before reusing persistent compiler artifacts. The encoding is
/// stable for a given key-format version and deliberately remains opaque so a
/// future format can be introduced without exposing individual fields.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct OptionsCacheKey(String);

impl OptionsCacheKey {
    /// Return the canonical key encoding.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub(crate) fn from_encoded(encoded: String) -> Self {
        Self(encoded)
    }
}

impl AsRef<str> for OptionsCacheKey {
    fn as_ref(&self) -> &str {
        self.as_str()
    }
}

impl fmt::Display for OptionsCacheKey {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

pub(crate) fn push_cache_field(encoded: &mut String, name: &str, value: Option<&str>) {
    encoded.push_str(name);
    encoded.push('=');
    match value {
        Some(value) => {
            encoded.push('s');
            encoded.push_str(&value.len().to_string());
            encoded.push(':');
            encoded.push_str(value);
        }
        None => encoded.push('n'),
    }
    encoded.push('|');
}

/// How component CSS is emitted.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum CssMode {
    /// Return CSS as a separate artifact.
    #[default]
    External,
    /// Inject CSS through the generated JavaScript runtime.
    Injected,
}

/// Analysis-affecting and runtime-emission options for one component.
///
/// Fields are private so rsvelte can add new Svelte options without breaking
/// downstream struct literals. Use the consuming builder methods to customize
/// a value.
#[derive(Debug, Clone)]
pub struct ComponentOptions {
    pub(crate) development: bool,
    pub(crate) filename: Option<String>,
    pub(crate) output_filename: Option<String>,
    pub(crate) css_output_filename: Option<String>,
    pub(crate) custom_element: bool,
    pub(crate) css_mode: CssMode,
    pub(crate) fixed_css_scope: Option<String>,
    pub(crate) preserve_comments: bool,
    pub(crate) preserve_whitespace: bool,
    pub(crate) runes: Option<bool>,
    pub(crate) disclose_version: bool,
    pub(crate) source_maps: bool,
}

impl ComponentOptions {
    /// Create options using Svelte-compatible defaults.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Enable or disable development-mode runtime checks.
    #[must_use]
    pub fn development(mut self, enabled: bool) -> Self {
        self.development = enabled;
        self
    }

    /// Set the source filename used by diagnostics and source maps.
    #[must_use]
    pub fn filename(mut self, filename: impl Into<String>) -> Self {
        self.filename = Some(filename.into());
        self
    }

    /// Set the generated JavaScript filename used by source maps.
    #[must_use]
    pub fn output_filename(mut self, filename: impl Into<String>) -> Self {
        self.output_filename = Some(filename.into());
        self
    }

    /// Set the generated CSS filename used by source maps.
    #[must_use]
    pub fn css_output_filename(mut self, filename: impl Into<String>) -> Self {
        self.css_output_filename = Some(filename.into());
        self
    }

    /// Compile the component as a custom element.
    #[must_use]
    pub fn custom_element(mut self, enabled: bool) -> Self {
        self.custom_element = enabled;
        self
    }

    /// Select whether CSS is extracted or injected.
    #[must_use]
    pub fn css_mode(mut self, mode: CssMode) -> Self {
        self.css_mode = mode;
        self
    }

    /// Override the complete CSS scope class with a deterministic value.
    ///
    /// Unlike a callback, a fixed value has an unambiguous cache identity.
    #[must_use]
    pub fn fixed_css_scope(mut self, scope: impl Into<String>) -> Self {
        self.fixed_css_scope = Some(scope.into());
        self
    }

    /// Preserve HTML comments in generated runtime code.
    #[must_use]
    pub fn preserve_comments(mut self, enabled: bool) -> Self {
        self.preserve_comments = enabled;
        self
    }

    /// Preserve template whitespace as authored.
    #[must_use]
    pub fn preserve_whitespace(mut self, enabled: bool) -> Self {
        self.preserve_whitespace = enabled;
        self
    }

    /// Force runes mode on, off, or leave it source-detected.
    #[must_use]
    pub fn runes(mut self, enabled: Option<bool>) -> Self {
        self.runes = enabled;
        self
    }

    /// Control whether generated code discloses the target Svelte version.
    #[must_use]
    pub fn disclose_version(mut self, enabled: bool) -> Self {
        self.disclose_version = enabled;
        self
    }

    /// Enable or disable JavaScript and CSS source-map generation.
    #[must_use]
    pub fn source_maps(mut self, enabled: bool) -> Self {
        self.source_maps = enabled;
        self
    }

    /// Return a stable identity covering every component option.
    ///
    /// This key does not include source contents or compiler versions. Include
    /// those separately when constructing a persistent artifact-cache key.
    #[must_use]
    pub fn cache_key(&self) -> OptionsCacheKey {
        let mut encoded = "rsvelte-component-options:v1|".to_string();
        push_cache_field(
            &mut encoded,
            "development",
            Some(if self.development { "1" } else { "0" }),
        );
        push_cache_field(&mut encoded, "filename", self.filename.as_deref());
        push_cache_field(
            &mut encoded,
            "output_filename",
            self.output_filename.as_deref(),
        );
        push_cache_field(
            &mut encoded,
            "css_output_filename",
            self.css_output_filename.as_deref(),
        );
        push_cache_field(
            &mut encoded,
            "custom_element",
            Some(if self.custom_element { "1" } else { "0" }),
        );
        push_cache_field(
            &mut encoded,
            "css_mode",
            Some(match self.css_mode {
                CssMode::External => "external",
                CssMode::Injected => "injected",
            }),
        );
        push_cache_field(
            &mut encoded,
            "fixed_css_scope",
            self.fixed_css_scope.as_deref(),
        );
        push_cache_field(
            &mut encoded,
            "preserve_comments",
            Some(if self.preserve_comments { "1" } else { "0" }),
        );
        push_cache_field(
            &mut encoded,
            "preserve_whitespace",
            Some(if self.preserve_whitespace { "1" } else { "0" }),
        );
        push_cache_field(
            &mut encoded,
            "runes",
            Some(match self.runes {
                None => "auto",
                Some(false) => "false",
                Some(true) => "true",
            }),
        );
        push_cache_field(
            &mut encoded,
            "disclose_version",
            Some(if self.disclose_version { "1" } else { "0" }),
        );
        push_cache_field(
            &mut encoded,
            "source_maps",
            Some(if self.source_maps { "1" } else { "0" }),
        );
        OptionsCacheKey::from_encoded(encoded)
    }

    pub(crate) fn source_filename(&self) -> Option<String> {
        self.filename.clone()
    }

    pub(crate) fn into_core(self) -> CoreCompileOptions {
        let css_hash = self
            .fixed_css_scope
            .map(|scope| Arc::new(move |_: &CoreCssHashInput| scope.clone()) as CoreCssHashFn);
        CoreCompileOptions {
            dev: self.development,
            filename: self.filename,
            output_filename: self.output_filename,
            css_output_filename: self.css_output_filename,
            custom_element: self.custom_element,
            css: match self.css_mode {
                CssMode::External => CoreCssMode::External,
                CssMode::Injected => CoreCssMode::Injected,
            },
            css_hash,
            preserve_comments: self.preserve_comments,
            preserve_whitespace: self.preserve_whitespace,
            runes: self.runes,
            disclose_version: self.disclose_version,
            enable_sourcemap: self.source_maps,
            ..CoreCompileOptions::default()
        }
    }
}

impl Default for ComponentOptions {
    fn default() -> Self {
        Self {
            development: false,
            filename: None,
            output_filename: None,
            css_output_filename: None,
            custom_element: false,
            css_mode: CssMode::External,
            fixed_css_scope: None,
            preserve_comments: false,
            preserve_whitespace: false,
            runes: None,
            disclose_version: true,
            source_maps: true,
        }
    }
}
