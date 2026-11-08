#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PluginError {
    EmptyIdentifier,
    EmptyDependency {
        plugin: &'static str,
    },
    InvalidVersion {
        plugin: &'static str,
        version: &'static str,
        reason: String,
    },
    InvalidRequirement {
        plugin: &'static str,
        dependency: &'static str,
        requirement: &'static str,
        reason: String,
    },
    ConflictingRegistration {
        plugin: &'static str,
        registered_version: &'static str,
        incoming_version: &'static str,
    },
    DuplicateDependency {
        plugin: &'static str,
        dependency: &'static str,
    },
    MissingDependency {
        plugin: &'static str,
        dependency: &'static str,
        requirement: &'static str,
    },
    VersionMismatch {
        plugin: &'static str,
        dependency: &'static str,
        requirement: &'static str,
        actual: String,
    },
    Cycle {
        plugins: Vec<&'static str>,
    },
}

impl std::fmt::Display for PluginError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyIdentifier => write!(f, "a plugin identifier is empty"),
            Self::EmptyDependency { plugin } => {
                write!(f, "plugin `{plugin}` has an empty dependency identifier")
            }
            Self::InvalidVersion {
                plugin,
                version,
                reason,
            } => {
                write!(
                    f,
                    "plugin `{plugin}` has invalid version `{version}`: {reason}"
                )
            }
            Self::InvalidRequirement {
                plugin,
                dependency,
                requirement,
                reason,
            } => {
                write!(
                    f,
                    "plugin `{plugin}` has invalid requirement `{requirement}` \
                     for `{dependency}`: {reason}"
                )
            }
            Self::ConflictingRegistration {
                plugin,
                registered_version,
                incoming_version,
            } => {
                if registered_version == incoming_version {
                    write!(
                        f,
                        "plugin `{plugin}` version {registered_version} \
                         has conflicting dependency declarations"
                    )
                } else {
                    write!(
                        f,
                        "plugin `{plugin}` is registered with both version {registered_version} \
                         and {incoming_version}"
                    )
                }
            }
            Self::DuplicateDependency { plugin, dependency } => {
                write!(
                    f,
                    "plugin `{plugin}` declares dependency `{dependency}` twice"
                )
            }
            Self::MissingDependency {
                plugin,
                dependency,
                requirement,
            } => {
                write!(
                    f,
                    "plugin `{plugin}` requires `{dependency}` {requirement}, \
                     but it is not registered"
                )
            }
            Self::VersionMismatch {
                plugin,
                dependency,
                requirement,
                actual,
            } => {
                write!(
                    f,
                    "plugin `{plugin}` requires `{dependency}` {requirement}, \
                     but version {actual} is registered"
                )
            }
            Self::Cycle { plugins } => {
                write!(f, "plugin dependency cycle: {}", plugins.join(" -> "))
            }
        }
    }
}
