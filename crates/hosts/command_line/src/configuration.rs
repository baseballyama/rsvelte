use std::path::{Path, PathBuf};

use rsvelte_configuration_loading::{JsonLoader, LoadedConfiguration, Loader};
use rsvelte_plugin_interface::CallError;

#[derive(Debug, Default)]
pub(crate) struct Options {
    path: Option<PathBuf>,
    loader: Option<String>,
    runtime: Option<PathBuf>,
    runtime_arguments: Vec<String>,
    loader_arguments: Vec<String>,
}

impl Options {
    pub(crate) fn accepts(name: &str) -> bool {
        matches!(
            name,
            "--config"
                | "--config-loader"
                | "--config-loader-arg"
                | "--config-runtime"
                | "--config-runtime-arg"
        )
    }

    pub(crate) fn argument(&mut self, name: &str, value: &str) {
        match name {
            "--config" => self.path = Some(value.into()),
            "--config-loader" => self.loader = Some(value.into()),
            "--config-loader-arg" => self.loader_arguments.push(value.into()),
            "--config-runtime" => self.runtime = Some(value.into()),
            "--config-runtime-arg" => self.runtime_arguments.push(value.into()),
            _ => unreachable!("accepts checks option names"),
        }
    }

    /// The configuration file and what it evaluates to, or `None` when there is none.
    pub(crate) fn load(&self) -> Result<Option<(PathBuf, LoadedConfiguration)>, CallError> {
        let path = match &self.path {
            Some(path) => Some(path.clone()),
            None => {
                discover(&std::env::current_dir().map_err(|error| CallError(error.to_string()))?)?
            }
        };
        let Some(path) = path else {
            if self.loader.is_some()
                || self.runtime.is_some()
                || !self.runtime_arguments.is_empty()
                || !self.loader_arguments.is_empty()
            {
                return Err(CallError(
                    "configuration loader options require a configuration file".into(),
                ));
            }
            return Ok(None);
        };
        let automatic = if path
            .extension()
            .is_some_and(|extension| extension == "json")
        {
            "json"
        } else {
            "node"
        };
        let loader: Box<dyn Loader> = match self.loader.as_deref().unwrap_or(automatic) {
            "json" => {
                if self.runtime.is_some()
                    || !self.runtime_arguments.is_empty()
                    || !self.loader_arguments.is_empty()
                {
                    return Err(CallError(
                        "JSON configuration does not accept runtime arguments".into(),
                    ));
                }
                Box::new(JsonLoader)
            }
            "node" => {
                if !self.loader_arguments.is_empty() {
                    return Err(CallError(
                        "use --config-runtime-arg for the Node loader".into(),
                    ));
                }
                Box::new(rsvelte_configuration_loading::process::ProcessLoader::node(
                    self.runtime.clone().unwrap_or_else(|| "node".into()),
                    self.runtime_arguments.clone(),
                ))
            }
            executable => {
                if self.runtime.is_some() || !self.runtime_arguments.is_empty() {
                    return Err(CallError(
                        "external loaders accept --config-loader-arg".into(),
                    ));
                }
                Box::new(rsvelte_configuration_loading::process::ProcessLoader::new(
                    executable.into(),
                    self.loader_arguments.clone(),
                ))
            }
        };
        let evaluated = loader.load(&path)?;
        Ok(Some((path, evaluated)))
    }
}

fn discover(directory: &Path) -> Result<Option<PathBuf>, CallError> {
    const NAMES: &[&str] = &[
        "rsvelte.config.json",
        "rsvelte.config.js",
        "rsvelte.config.mjs",
        "rsvelte.config.cjs",
        "rsvelte.config.ts",
        "rsvelte.config.mts",
        "rsvelte.config.cts",
    ];
    for directory in directory.ancestors() {
        let mut found = None;
        for name in NAMES {
            let candidate = directory.join(name);
            match candidate.try_exists() {
                Ok(true) if found.is_some() => {
                    return Err(CallError(format!(
                        "multiple configuration files in {}; use --config",
                        directory.display()
                    )));
                }
                Ok(true) => found = Some(candidate),
                Ok(false) => {}
                Err(error) => return Err(CallError(error.to_string())),
            }
        }
        if found.is_some() {
            return Ok(found);
        }
    }
    Ok(None)
}
