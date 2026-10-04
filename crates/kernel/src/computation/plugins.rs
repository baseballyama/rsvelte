use std::collections::BTreeMap;
use std::sync::OnceLock;

use semver::{Version, VersionReq};

mod error;
pub use error::PluginError;

#[derive(Debug, PartialEq, Eq)]
pub struct Plugin {
    pub identifier: &'static str,
    pub version: &'static str,
    pub dependencies: &'static [Dependency],
}

#[derive(Debug, PartialEq, Eq)]
pub struct Dependency {
    pub identifier: &'static str,
    pub requirement: &'static str,
}

#[derive(Debug, Default)]
pub(crate) struct Plugins {
    declarations: BTreeMap<&'static str, &'static Plugin>,
    registration_error: Option<PluginError>,
    validated: OnceLock<Result<(), PluginError>>,
}

impl Plugins {
    pub(crate) fn register(&mut self, plugin: &'static Plugin) {
        match self.declarations.entry(plugin.identifier) {
            std::collections::btree_map::Entry::Vacant(entry) => {
                entry.insert(plugin);
                self.validated.take();
            }
            std::collections::btree_map::Entry::Occupied(entry) if *entry.get() != plugin => {
                self.registration_error.get_or_insert_with(|| {
                    PluginError::ConflictingRegistration {
                        plugin: plugin.identifier,
                        registered_version: entry.get().version,
                        incoming_version: plugin.version,
                    }
                });
                self.validated.take();
            }
            std::collections::btree_map::Entry::Occupied(_) => {}
        }
    }

    pub(crate) fn declarations(&self) -> impl ExactSizeIterator<Item = &'static Plugin> + '_ {
        self.declarations.values().copied()
    }

    pub(crate) fn validate(&self) -> Result<(), PluginError> {
        self.validated.get_or_init(|| self.check()).clone()
    }

    fn check(&self) -> Result<(), PluginError> {
        if let Some(error) = &self.registration_error {
            return Err(error.clone());
        }
        let plugins: Vec<_> = self.declarations().collect();
        let mut indices = BTreeMap::new();
        let mut versions = Vec::with_capacity(plugins.len());
        for (index, plugin) in plugins.iter().enumerate() {
            if plugin.identifier.is_empty() {
                return Err(PluginError::EmptyIdentifier);
            }
            indices.insert(plugin.identifier, index);
            versions.push(Version::parse(plugin.version).map_err(|error| {
                PluginError::InvalidVersion {
                    plugin: plugin.identifier,
                    version: plugin.version,
                    reason: error.to_string(),
                }
            })?);
        }
        let mut edges = Vec::with_capacity(plugins.len());
        for plugin in &plugins {
            edges.push(check_dependencies(plugin, &indices, &versions)?);
        }
        check_cycles(&plugins, &edges)
    }
}

fn check_dependencies(
    plugin: &Plugin,
    indices: &BTreeMap<&str, usize>,
    versions: &[Version],
) -> Result<Vec<usize>, PluginError> {
    let mut seen = std::collections::BTreeSet::new();
    let mut edges = Vec::with_capacity(plugin.dependencies.len());
    for dependency in plugin.dependencies {
        if dependency.identifier.is_empty() {
            return Err(PluginError::EmptyDependency {
                plugin: plugin.identifier,
            });
        }
        if !seen.insert(dependency.identifier) {
            return Err(PluginError::DuplicateDependency {
                plugin: plugin.identifier,
                dependency: dependency.identifier,
            });
        }
        let required = VersionReq::parse(dependency.requirement).map_err(|error| {
            PluginError::InvalidRequirement {
                plugin: plugin.identifier,
                dependency: dependency.identifier,
                requirement: dependency.requirement,
                reason: error.to_string(),
            }
        })?;
        let Some(&index) = indices.get(dependency.identifier) else {
            return Err(PluginError::MissingDependency {
                plugin: plugin.identifier,
                dependency: dependency.identifier,
                requirement: dependency.requirement,
            });
        };
        if !required.matches(&versions[index]) {
            return Err(PluginError::VersionMismatch {
                plugin: plugin.identifier,
                dependency: dependency.identifier,
                requirement: dependency.requirement,
                actual: versions[index].to_string(),
            });
        }
        edges.push(index);
    }
    Ok(edges)
}

fn check_cycles(plugins: &[&Plugin], edges: &[Vec<usize>]) -> Result<(), PluginError> {
    #[derive(Clone, Copy, PartialEq, Eq)]
    enum State {
        Unvisited,
        Visiting,
        Finished,
    }

    let mut states = vec![State::Unvisited; plugins.len()];
    let mut stack = Vec::new();
    for root in 0..plugins.len() {
        if states[root] != State::Unvisited {
            continue;
        }
        states[root] = State::Visiting;
        stack.push((root, 0));
        while let Some((node, next)) = stack.last_mut() {
            if *next == edges[*node].len() {
                states[*node] = State::Finished;
                stack.pop();
                continue;
            }
            let dependency = edges[*node][*next];
            *next += 1;
            match states[dependency] {
                State::Unvisited => {
                    states[dependency] = State::Visiting;
                    stack.push((dependency, 0));
                }
                State::Visiting => {
                    let start = stack
                        .iter()
                        .position(|&(id, _)| id == dependency)
                        .expect("a visiting dependency is on the traversal stack");
                    let mut cycle: Vec<_> = stack[start..]
                        .iter()
                        .map(|&(id, _)| plugins[id].identifier)
                        .collect();
                    cycle.push(plugins[dependency].identifier);
                    return Err(PluginError::Cycle { plugins: cycle });
                }
                State::Finished => {}
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests;
