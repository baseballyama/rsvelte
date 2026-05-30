use oxc_formatter::JsFormatOptions;

/// Top-level formatter options.
///
/// Svelte-specific knobs will land here; for JS bodies they fan out to
/// `oxc_formatter`'s `JsFormatOptions`.
#[derive(Debug, Clone)]
pub struct FormatOptions {
    /// Options applied when formatting JS/TS `<script>` bodies and
    /// embedded `{expr}` interpolations.
    pub js: JsFormatOptions,
}

impl FormatOptions {
    pub fn new() -> Self {
        Self {
            js: JsFormatOptions::new(),
        }
    }
}

impl Default for FormatOptions {
    fn default() -> Self {
        Self::new()
    }
}
