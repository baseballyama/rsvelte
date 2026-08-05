use std::collections::HashSet;
use std::env;
use std::path::PathBuf;

use zed_extension_api::{self as zed, LanguageServerId, Result, serde_json, settings::LspSettings};

const SERVER_NAME: &str = "rsvelte-language-server";
const PACKAGE_NAME: &str = "@rsvelte/language-server";
const SERVER_ENTRY: &str = "dist/server.mjs";

struct RsvelteExtension {
    /// Packages already resolved in this extension process, so a worktree with
    /// many Svelte files does not hit the npm registry once per language server start.
    installed: HashSet<String>,
}

impl RsvelteExtension {
    fn install_package_if_needed(
        &mut self,
        id: &LanguageServerId,
        package_name: &str,
    ) -> Result<()> {
        let installed_version = zed::npm_package_installed_version(package_name)?;
        if installed_version.is_some() && self.installed.contains(package_name) {
            return Ok(());
        }

        zed::set_language_server_installation_status(
            id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );
        let latest_version = zed::npm_package_latest_version(package_name)?;

        if installed_version.as_ref() != Some(&latest_version) {
            zed::set_language_server_installation_status(
                id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );
            // A failed update must not take down an already-working install.
            if let Err(error) = zed::npm_install_package(package_name, &latest_version)
                && installed_version.is_none()
            {
                return Err(error);
            }
        }

        self.installed.insert(package_name.into());
        Ok(())
    }

    fn server_script_path(&self) -> Result<String> {
        let path: PathBuf = env::current_dir()
            .map_err(|error| error.to_string())?
            .join("node_modules")
            .join(PACKAGE_NAME)
            .join(SERVER_ENTRY);
        Ok(path.to_string_lossy().to_string())
    }
}

impl zed::Extension for RsvelteExtension {
    fn new() -> Self {
        Self {
            installed: HashSet::new(),
        }
    }

    fn language_server_command(
        &mut self,
        id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let binary = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|settings| settings.binary);

        if let Some(path) = binary.as_ref().and_then(|binary| binary.path.clone()) {
            return Ok(zed::Command {
                command: path,
                args: binary
                    .as_ref()
                    .and_then(|binary| binary.arguments.clone())
                    .unwrap_or_else(|| vec!["--stdio".into()]),
                env: binary
                    .and_then(|binary| binary.env)
                    .unwrap_or_default()
                    .into_iter()
                    .collect(),
            });
        }

        self.install_package_if_needed(id, PACKAGE_NAME)?;

        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![self.server_script_path()?, "--stdio".into()],
            env: Default::default(),
        })
    }

    fn language_server_workspace_configuration(
        &mut self,
        _id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        // The server pulls its options from the `rsvelte` configuration section.
        let settings = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|settings| settings.settings)
            .unwrap_or_else(|| {
                serde_json::json!({
                    "format": { "enable": true },
                    "lint": { "enable": true }
                })
            });

        Ok(Some(serde_json::json!({ "rsvelte": settings })))
    }
}

zed::register_extension!(RsvelteExtension);
