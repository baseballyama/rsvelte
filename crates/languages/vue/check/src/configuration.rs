/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Configuration {
    /// `None`: `vue.check` reports that it is not configured.
    pub check: Option<TypeCheckConfiguration>,
}

#[derive(Clone, Debug)]
pub struct TypeCheckConfiguration {
    pub tsc: rsvelte_typescript_check::Tsc,
    /// The installed `vue` package: its types declare `ref`, `computed` and the rest.
    pub vue: std::path::PathBuf,
}
