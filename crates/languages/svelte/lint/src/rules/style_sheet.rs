//! What `svelte-eslint-parser` makes of the `<style>` element: `PostCSS`'s (or `postcss-scss`'s)
//! verdict, by the element's `lang`. The rules that read the style sheet share it.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_stylesheet::postcss::{self, Dialect, SyntaxError};
use rsvelte_svelte::Parsed;

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
        let Some(style) = context
            .get::<Parsed>()
            .as_ref()
            .ok()
            .and_then(|component| component.style.as_ref())
        else {
            return StyleVerdict::NoStyle;
        };
        let source = context.source_text();
        let language = style
            .attributes
            .iter()
            .rev()
            .find_map(|(name, value)| (name.text(source) == "lang").then_some(*value)?)
            .map_or("css", |value| value.text(source));
        let dialect = match language {
            "css" | "postcss" => Dialect::Css,
            "scss" => Dialect::Scss,
            _ => return StyleVerdict::UnknownLanguage(language.to_owned()),
        };
        match postcss::check(source, style.content, dialect) {
            Ok(()) => StyleVerdict::Parsed,
            Err(error) => StyleVerdict::Error(error),
        }
    }
}

pub(super) fn verdict<'a>(file: &File<'a>) -> &'a StyleVerdict {
    file.context.get::<StyleSheetVerdict>()
}
