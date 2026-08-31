//! Port of [`svelte-preprocess-sass`](https://github.com/ls-age/svelte-preprocess-sass)
//! (v2.0.1) — a `<style>` preprocessor that compiles Sass/SCSS to CSS.
//!
//! The JS original wraps dart-sass; this port uses the pure-Rust
//! [`grass`](https://docs.rs/grass) compiler, which targets dart-sass
//! compatibility.

use std::{
    any::Any,
    panic::{AssertUnwindSafe, catch_unwind},
    path::PathBuf,
};

use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessAttributeMap as Map, PreprocessError, PreprocessorFn,
    PreprocessorGroup, PreprocessorOptions, PreprocessorResult, Processed,
};

use crate::filter::{FilterOptions, matches};
use crate::sass_fs::RecordingFs;

/// Dart Sass treats an indentation prefix shared by every line as the
/// document's base indentation — the usual shape of a `<style lang="sass">`
/// block inside a Svelte file — while grass's indented parser asserts the
/// top-level indentation is zero and aborts. Remove only the shared prefix,
/// preserving all relative indentation.
///
/// The leading blank line is required, not incidental: dart Sass rejects a
/// document whose very first line is indented (`Indenting at the beginning of
/// the document is illegal`), and so does grass, so normalizing that shape
/// would make rsvelte accept what dart Sass refuses.
pub(crate) fn remove_indented_base(source: &str) -> String {
    if !source
        .lines()
        .next()
        .is_some_and(|line| line.trim().is_empty())
    {
        return source.to_string();
    }
    let common = source
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.len() - line.trim_start_matches([' ', '\t']).len())
        .min()
        .unwrap_or(0);
    if common == 0 {
        return source.to_string();
    }

    let mut output = String::with_capacity(source.len());
    let mut saw_content = false;
    for chunk in source.split_inclusive('\n') {
        let (line, newline) = chunk
            .strip_suffix('\n')
            .map_or((chunk, ""), |line| (line, "\n"));
        if !saw_content && line.trim().is_empty() {
            continue;
        }
        saw_content = true;
        if line.trim().is_empty() {
            output.push_str(line);
        } else {
            output.push_str(&line[common..]);
        }
        output.push_str(newline);
    }
    output
}

#[cfg(test)]
mod tests {
    use super::remove_indented_base;

    #[test]
    fn indented_base_removes_leading_blank_lines_before_tab_indentation() {
        assert_eq!(
            remove_indented_base("\n\t.card\n\t\tdisplay: block\n"),
            ".card\n\tdisplay: block\n"
        );
    }

    #[test]
    fn indented_base_leaves_a_document_that_starts_indented_alone() {
        // Dart Sass rejects this shape; dedenting it would make rsvelte accept it.
        let source = "\t.card\n\t\tdisplay: block\n";
        assert_eq!(remove_indented_base(source), source);
    }

    #[test]
    fn indented_base_leaves_unindented_documents_unchanged() {
        let source = "\n.card\n  display: block\n";
        assert_eq!(remove_indented_base(source), source);
    }
}

fn panic_message(payload: Box<dyn Any + Send>) -> String {
    if let Some(message) = payload.downcast_ref::<&str>() {
        (*message).to_string()
    } else if let Some(message) = payload.downcast_ref::<String>() {
        message.clone()
    } else {
        "unknown panic".to_string()
    }
}

/// Options forwarded to the Sass compiler (subset of the dart-sass options
/// object the JS package accepts).
#[derive(Debug, Clone, Default)]
pub struct SassOptions {
    /// Force the indented (`.sass`) syntax regardless of the detected language.
    pub indented_syntax: Option<bool>,
    /// Extra load paths for `@import` / `@use` resolution.
    pub load_paths: Vec<PathBuf>,
}

/// Core transform — mirrors the upstream `preprocessSass(sassOptions,
/// filterOptions, { filename, content, attributes })`.
///
/// Returns `Ok(None)` when the block's `type`/`lang` does not select Sass/SCSS
/// (matching the upstream `return null`).
///
/// # Errors
///
/// Returns an error when compiling a selected Sass or SCSS block fails.
pub fn preprocess_sass(
    sass_options: &SassOptions,
    filter_options: &FilterOptions,
    filename: Option<&str>,
    content: &str,
    attributes: &Map<String, AttributeValue>,
) -> Result<Option<Processed>, String> {
    let (indented_syntax, process_styles) = if filter_options.name.is_none() {
        let indented = matches(
            &FilterOptions {
                name: Some("sass".to_string()),
                ..filter_options.clone()
            },
            attributes,
        );
        let process = indented
            || matches(
                &FilterOptions {
                    name: Some("scss".to_string()),
                    ..filter_options.clone()
                },
                attributes,
            );
        (indented, process)
    } else {
        let indented = filter_options.name.as_deref() == Some("sass");
        let process = matches(filter_options, attributes);
        (indented, process)
    };

    if !process_styles {
        return Ok(None);
    }

    // `sassOptions.indentedSyntax` (when set) overrides the detected syntax —
    // upstream spreads `...sassOptions` after the computed `indentedSyntax`.
    let indented = sass_options.indented_syntax.unwrap_or(indented_syntax);

    let fs = RecordingFs::default();
    let mut options = grass::Options::default().fs(&fs);
    if indented {
        options = options.input_syntax(grass::InputSyntax::Sass);
    }
    if let Some(file) = filename
        && let Some(dir) = std::path::Path::new(file).parent()
    {
        options = options.load_path(dir);
    }
    for path in &sass_options.load_paths {
        options = options.load_path(path);
    }

    // The base indentation has to be removed BEFORE grass sees the document:
    // grass aborts on that shape, and `catch_unwind` is void under the
    // `panic = "abort"` release profile every shipped binary but the three with
    // an explicit `panic = "unwind"` override is built with.
    let source = if indented {
        remove_indented_base(content)
    } else {
        content.to_string()
    };
    let compile =
        |source: String| catch_unwind(AssertUnwindSafe(|| grass::from_string(source, &options)));
    let mut css = match compile(source) {
        Ok(result) => result.map_err(|error| error.to_string())?,
        Err(payload) => return Err(format!("grass panicked: {}", panic_message(payload))),
    };

    // dart-sass's legacy `render` (which the JS package wraps) emits expanded CSS
    // without a trailing newline; `grass` appends one, so drop it to match.
    if css.ends_with('\n') {
        css.pop();
    }

    Ok(Some(Processed {
        code: css,
        dependencies: fs.dependencies(),
        ..Default::default()
    }))
}

/// Build the `svelte-preprocess-sass` [`PreprocessorGroup`].
///
/// Mirrors the upstream `sass(sassOptions, filterOptions)` factory, which binds
/// the options and returns the `<style>` preprocessor.
#[must_use]
pub fn sass(sass_options: SassOptions, filter_options: FilterOptions) -> PreprocessorGroup {
    PreprocessorGroup {
        name: Some("svelte-preprocess-sass".to_string()),
        style: Some(
            Box::new(move |opts: PreprocessorOptions| -> PreprocessorResult {
                let sass_options = sass_options.clone();
                let filter_options = filter_options.clone();
                Box::pin(async move {
                    preprocess_sass(
                        &sass_options,
                        &filter_options,
                        opts.filename.as_deref(),
                        &opts.content,
                        &opts.attributes,
                    )
                    .map_err(PreprocessError::Other)
                })
            }) as PreprocessorFn,
        ),
        ..Default::default()
    }
}
