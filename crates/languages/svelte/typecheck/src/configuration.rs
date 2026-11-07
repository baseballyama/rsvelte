/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Configuration {
    /// `None`: `svelte.check` reports that it is not configured.
    pub check: Option<TypeCheckConfiguration>,
}

#[derive(Clone, Debug)]
pub struct TypeCheckConfiguration {
    /// `tsc` of TypeScript 7.1, or another type checker with its command line.
    pub checker: rsvelte_typescript_check::TypeChecker,
    pub content_mapper: std::path::PathBuf,
    /// The project's tsconfig.json.
    pub tsconfig: Option<std::path::PathBuf>,
    /// The installed `svelte` package: its types declare the runes and `svelte/elements`.
    pub svelte: std::path::PathBuf,
}
