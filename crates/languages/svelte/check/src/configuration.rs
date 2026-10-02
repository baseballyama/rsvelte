/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Configuration {
    /// `None`: `svelte.check` reports that it is not configured.
    pub check: Option<TypeCheckConfiguration>,
}

#[derive(Clone, Debug)]
pub struct TypeCheckConfiguration {
    /// The native `tsc` (TypeScript 7).
    pub tsc: std::path::PathBuf,
    /// The project's tsconfig.json.
    pub tsconfig: Option<std::path::PathBuf>,
    /// The installed `svelte` package: its types declare the runes and `svelte/elements`.
    pub svelte: std::path::PathBuf,
}
