//! `<style>` block formatting.
//!
//! `rsvelte_formatter` doesn't ship its own CSS engine. Instead it
//! exposes a callback on [`crate::FormatOptions::style_formatter`] that
//! receives the body and the lang (`css` / `scss` / `less` / ...). The
//! `rsvelte-fmt` CLI wires this up to spawn
//! `oxfmt --stdin-filepath style.<lang>`, so CSS formatting goes through
//! the same engine `oxfmt` uses for standalone files.
//!
//! When no callback is set the style body is left verbatim.

use rsvelte_core::ast::css::StyleSheet;

use crate::error::FormatError;
use crate::options::FormatOptions;

/// Push one edit replacing the `<style>` body with the formatter
/// callback's output. No-op when no callback is configured.
pub(crate) fn collect_style_edit(
    css: &StyleSheet,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let Some(formatter) = &options.style_formatter else {
        return Ok(());
    };
    let body = css.content.styles.as_str();
    if body.trim().is_empty() {
        return Ok(());
    }
    let lang = detect_lang(css);
    let formatted = formatter(body, &lang).map_err(FormatError::StyleFormat)?;
    edits.push((css.content.start, css.content.end, formatted));
    Ok(())
}

/// Read the `<style lang="...">` attribute out of the JSON-encoded
/// attribute list. Defaults to `"css"`.
fn detect_lang(css: &StyleSheet) -> String {
    for attr in &css.attributes {
        let name = attr.get("name").and_then(|v| v.as_str());
        if name == Some("lang") {
            // Value is either a string ("scss"), `true` (boolean attr),
            // or a sequence of value parts. Handle the common literal
            // string case.
            if let Some(value) = attr.get("value") {
                if let Some(s) = value.as_str() {
                    return s.to_string();
                }
                if let Some(arr) = value.as_array() {
                    for part in arr {
                        if let Some(t) = part.get("data").and_then(|v| v.as_str()) {
                            return t.to_string();
                        }
                        if let Some(t) = part.get("raw").and_then(|v| v.as_str()) {
                            return t.to_string();
                        }
                    }
                }
            }
        }
    }
    "css".to_string()
}
