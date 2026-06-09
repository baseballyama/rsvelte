use std::sync::Arc;

use oxc_formatter::JsFormatOptions;

/// Top-level formatter options.
///
/// Svelte-specific knobs land here; for JS bodies they fan out to
/// `oxc_formatter`'s [`JsFormatOptions`].
#[derive(Clone)]
pub struct FormatOptions {
    /// Options applied when formatting JS/TS `<script>` bodies and
    /// embedded `{expr}` / pattern source.
    pub js: JsFormatOptions,

    /// Optional callback invoked with the body of every `<style>` block.
    /// Receives `(body, lang)` and returns the formatted body — `lang`
    /// is `"css"` by default, or whatever the source `<style lang="...">`
    /// attribute says (e.g. `"scss"`, `"less"`, `"postcss"`).
    ///
    /// When `None` (the default), `<style>` content survives verbatim.
    /// The `rsvelte-fmt` CLI wires this up to spawn `oxfmt`, so
    /// CSS / SCSS / Less formatting happens through the same engine
    /// `oxfmt` uses for standalone `.css` files.
    ///
    /// The callback must be `Send + Sync` so the same `FormatOptions`
    /// can drive parallel file formatting via `rayon`.
    pub style_formatter: Option<StyleFormatter>,

    /// Whether template `{expr}` / attribute / pattern source should be
    /// parsed as TypeScript. [`crate::format`] sets this per-document from
    /// the component's `<script lang="ts">` declaration, so a `{value as
    /// string}` mustache parses with the same dialect as the `<script>`
    /// body (#682). Callers normally leave it at its `false` default; it is
    /// not a user-facing knob.
    pub typescript: bool,
}

/// Callback used to format the body of a `<style>` block: `(css, lang, width)`.
/// `width` is the print width the CSS should be formatted at — the global print
/// width minus the `<style>` body's indentation — so embedded CSS wraps where
/// the oracle (which formats it at its real column) does. See
/// [`FormatOptions::style_formatter`].
pub type StyleFormatter =
    Arc<dyn Fn(&str, &str, usize) -> Result<String, String> + Send + Sync + 'static>;

impl FormatOptions {
    pub fn new() -> Self {
        Self {
            js: JsFormatOptions::new(),
            style_formatter: None,
            typescript: false,
        }
    }

    /// Builder-style setter for the style formatter callback.
    pub fn with_style_formatter(mut self, formatter: StyleFormatter) -> Self {
        self.style_formatter = Some(formatter);
        self
    }
}

impl Default for FormatOptions {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Debug for FormatOptions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FormatOptions")
            .field("js", &self.js)
            .field(
                "style_formatter",
                &self.style_formatter.as_ref().map(|_| "<callback>"),
            )
            .field("typescript", &self.typescript)
            .finish()
    }
}
