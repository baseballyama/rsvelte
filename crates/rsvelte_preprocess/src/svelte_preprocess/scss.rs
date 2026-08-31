//! Port of `svelte-preprocess`'s `scss`/`sass` transformer
//! (`src/transformers/scss.ts`), backed by the pure-Rust `grass` compiler
//! (reused from the standalone `svelte-preprocess-sass` port).

use std::path::{Path, PathBuf};

use crate::sass_fs::RecordingFs;

/// Options for the scss transform (subset of the dart-sass legacy options).
#[derive(Debug, Clone, Default)]
pub struct ScssOptions {
    /// Extra include paths for `@import` / `@use` resolution.
    pub load_paths: Vec<PathBuf>,
    /// Content prepended before the block (svelte-preprocess `prependData`).
    pub prepend_data: Option<String>,
}

/// Compiled SCSS output.
#[derive(Debug, Clone, Default)]
pub struct ScssOutput {
    pub code: String,
    pub dependencies: Vec<String>,
}

/// Compile `content`. `indented` selects the `.sass` syntax.
///
/// # Errors
///
/// Returns an error when the SCSS compiler rejects the prepared source.
pub fn transform(
    options: ScssOptions,
    indented: bool,
    filename: Option<&str>,
    content: &str,
) -> Result<ScssOutput, String> {
    // `prepareContent` prepends `prependData` before compiling.
    let content = if indented {
        crate::sass::remove_indented_base(content)
    } else {
        content.to_string()
    };
    let prepared = options
        .prepend_data
        .as_ref()
        .map_or_else(|| content.clone(), |data| format!("{data}\n{content}"));

    // scss errors if passed an empty string — upstream returns `{ code: '' }`.
    if prepared.is_empty() {
        return Ok(ScssOutput::default());
    }

    let fs = RecordingFs::default();
    let mut grass_options = grass::Options::default().fs(&fs);
    if indented {
        grass_options = grass_options.input_syntax(grass::InputSyntax::Sass);
    }
    if let Some(file) = filename
        && let Some(dir) = Path::new(file).parent()
        && !dir.as_os_str().is_empty()
    {
        grass_options = grass_options.load_path(dir);
    }
    for path in &options.load_paths {
        grass_options = grass_options.load_path(path);
    }

    let mut css = grass::from_string(prepared, &grass_options).map_err(|e| e.to_string())?;
    // svelte-preprocess uses `outputStyle: 'expanded'`; dart-sass emits no
    // trailing newline there, while grass appends one.
    if css.ends_with('\n') {
        css.pop();
    }

    Ok(ScssOutput {
        code: css,
        dependencies: fs.dependencies(),
    })
}
