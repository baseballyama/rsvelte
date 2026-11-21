//! What `svelte-eslint-parser` makes of the `<style>` element: `PostCSS`'s (or `postcss-scss`'s)
//! verdict, by the element's `lang`. The rules that read the style sheet share it.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_stylesheet_syntax::StyleSheet;
use rsvelte_stylesheet_syntax::postcss::{self, Dialect, SyntaxError};

use super::markup::lang_attribute;
use crate::rule::File;

#[derive(Debug)]
pub(crate) enum StyleVerdict {
    NoStyle,
    /// A `lang` neither CSS nor SCSS, as written.
    UnknownLanguage(String),
    Error(SyntaxError),
    Parsed,
}

#[derive(Debug)]
pub(crate) struct StyleSheetVerdict;

impl Artifact for StyleSheetVerdict {
    type Output = StyleVerdict;

    const NAME: &'static str = "svelte.lint.style_sheet_verdict";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let Some(style) = crate::computation::Linted::of(context)
            .ok()
            .and_then(|linted| linted.component.style.as_ref())
        else {
            return StyleVerdict::NoStyle;
        };
        let source = context.source_text();
        // An empty `lang` leaves the default, as `svelte-eslint-parser` reads it.
        let language = lang_attribute(&style.attributes, source)
            .and_then(|&(_, value)| value)
            .map(|value| value.text(source))
            .filter(|language| !language.is_empty())
            .unwrap_or("css");
        let dialect = match language {
            "css" | "postcss" => Dialect::Standard,
            "scss" => Dialect::Scss,
            _ => return StyleVerdict::UnknownLanguage(language.to_owned()),
        };
        match postcss::check(source, style.content, dialect) {
            Ok(()) => StyleVerdict::Parsed,
            Err(error) => StyleVerdict::Error(error),
        }
    }
}

pub(crate) fn verdict<'a>(file: &File<'a>) -> &'a StyleVerdict {
    file.context.get::<StyleSheetVerdict>()
}

/// The sheet that Svelte rejects and `PostCSS` (or `postcss-scss`) reads, as [`parse_for_lint`]
/// reads it; `None` when Svelte's own sheet stands or none can be read.
///
/// [`parse_for_lint`]: rsvelte_stylesheet_syntax::parse_for_lint
#[derive(Debug)]
pub(crate) struct LintStyleSheet;

impl Artifact for LintStyleSheet {
    type Output = Option<StyleSheet>;

    const NAME: &'static str = "svelte.lint.lint_style_sheet";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        if !matches!(context.get::<StyleSheetVerdict>(), StyleVerdict::Parsed) {
            return None;
        }
        let style = crate::computation::Linted::of(context)
            .ok()?
            .component
            .style
            .as_ref()?;
        if style.sheet.is_ok() {
            return None;
        }
        let source = context.source_text();
        let scss = lang_attribute(&style.attributes, source)
            .and_then(|&(_, value)| value)
            .is_some_and(|value| value.text(source) == "scss");
        let dialect = if scss {
            Dialect::Scss
        } else {
            Dialect::Standard
        };
        rsvelte_stylesheet_syntax::parse_for_lint(source, style.content, dialect).ok()
    }
}

/// The style sheet that the rules which read selectors see, once `PostCSS` reads the element.
pub(crate) fn sheet<'a>(file: &File<'a>) -> Option<&'a StyleSheet> {
    if !matches!(verdict(file), StyleVerdict::Parsed) {
        return None;
    }
    let style = file.component()?.style.as_ref()?;
    style
        .sheet
        .as_ref()
        .map_or_else(|_| file.context.get::<LintStyleSheet>().as_ref(), Some)
}
