//! The runes/legacy-mode indicator shown above Svelte 5 components.

use std::path::Path;

use lsp_types::{CodeLens, Command, Position, Range};
use serde_json::json;

const LEGACY_OVERVIEW: &str = "https://svelte.dev/docs/svelte/legacy-overview";

/// Mirror Svelte's mode CodeLens. A failed compile deliberately keeps an empty
/// lens so an editor does not shift surrounding lenses while the user is typing.
pub fn code_lenses(source: &str, path: &Path) -> Vec<CodeLens> {
    let range = Range::new(Position::new(0, 0), Position::new(0, 0));
    let mut options = rsvelte_core::CompileOptions {
        filename: Some(path.display().to_string()),
        ..rsvelte_core::CompileOptions::default()
    };
    options.generate = rsvelte_core::GenerateMode::None;

    let command = match rsvelte_core::compile(source, options) {
        Ok(result) => Command::new(
            if result.metadata.runes {
                "Runes mode"
            } else {
                "Legacy mode"
            }
            .to_string(),
            "svelte.openLink".to_string(),
            Some(vec![json!(LEGACY_OVERVIEW)]),
        ),
        Err(_) => Command::default(),
    };
    vec![CodeLens {
        range,
        command: Some(command),
        data: None,
    }]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reports_runes_and_legacy_modes() {
        let path = Path::new("App.svelte");
        assert_eq!(
            code_lenses("<script>let x = 1;</script>", path)[0]
                .command
                .as_ref()
                .unwrap()
                .title,
            "Legacy mode"
        );
        assert_eq!(
            code_lenses("<script>let x = $state(1);</script>", path)[0]
                .command
                .as_ref()
                .unwrap()
                .title,
            "Runes mode"
        );
    }

    #[test]
    fn keeps_an_empty_lens_after_a_compile_error() {
        let lens = &code_lenses("{#if}", Path::new("App.svelte"))[0];
        assert_eq!(lens.command, Some(Command::default()));
    }
}
