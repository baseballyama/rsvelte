//! Svelte `compilerOptions` resolved from the project's config files. The
//! reader lives in `rsvelte_svelte_config`, shared with the linter; what is
//! left here is how the TSX projection consumes it.

pub use rsvelte_svelte_config::compiler_options::*;

use crate::svelte2tsx::Svelte2TsxNamespace;

/// The projection-side view of [`CompilerOptionsSettings`].
pub trait ProjectionOptions {
    /// The namespace the TSX projection runs under.
    fn projection_namespace(&self) -> Svelte2TsxNamespace;
}

impl ProjectionOptions for CompilerOptionsSettings {
    /// Mirrors `DocumentSnapshot.ts`'s `namespace: document.config?.compilerOptions
    /// ?.namespace`: the config string reaches svelte2tsx unvalidated, and
    /// only `foreign` changes what it emits (attribute case is preserved).
    fn projection_namespace(&self) -> Svelte2TsxNamespace {
        match self.namespace.as_deref() {
            Some("svg") => Svelte2TsxNamespace::Svg,
            Some("mathml") => Svelte2TsxNamespace::Mathml,
            Some("foreign") => Svelte2TsxNamespace::Foreign,
            _ => Svelte2TsxNamespace::Html,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::{Path, PathBuf};

    fn workspace(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("rsvelte_co_{tag}_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn write(dir: &Path, name: &str, body: &str) {
        std::fs::write(dir.join(name), body).unwrap();
    }

    #[test]
    fn reads_namespace_from_svelte_config() {
        let dir = workspace("ns_svelte");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { namespace: 'foreign' } };",
        );
        let s = load_compiler_options(&dir);
        assert_eq!(s.namespace.as_deref(), Some("foreign"));
        assert_eq!(s.projection_namespace(), Svelte2TsxNamespace::Foreign);
        assert_eq!(
            s.option_diagnostic().map(|d| d.code),
            Some("options_invalid_value")
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_namespace_from_vite_plugin_call() {
        let dir = workspace("ns_vite");
        write(
            &dir,
            "vite.config.ts",
            r"import { svelte } from '@sveltejs/vite-plugin-svelte';
            export default { plugins: [svelte({ compilerOptions: { namespace: 'svg' } })] };",
        );
        let s = load_compiler_options(&dir);
        assert_eq!(s.namespace.as_deref(), Some("svg"));
        assert_eq!(s.projection_namespace(), Svelte2TsxNamespace::Svg);
        assert_eq!(s.option_diagnostic(), None);
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// Only `foreign` changes what svelte2tsx emits, so the mapping has to be
    /// pinned alongside the fact that every compiler-legal value is inert.
    #[test]
    fn namespace_maps_to_the_projection_namespace() {
        let cases = [
            (None, Svelte2TsxNamespace::Html),
            (Some("html"), Svelte2TsxNamespace::Html),
            (Some("svg"), Svelte2TsxNamespace::Svg),
            (Some("mathml"), Svelte2TsxNamespace::Mathml),
            (Some("foreign"), Svelte2TsxNamespace::Foreign),
            (Some("nonsense"), Svelte2TsxNamespace::Html),
        ];
        for (raw, expected) in cases {
            let s = CompilerOptionsSettings {
                namespace: raw.map(str::to_string),
                ..Default::default()
            };
            assert_eq!(s.projection_namespace(), expected, "namespace {raw:?}");
        }
    }
}
