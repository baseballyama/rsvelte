//! The fields of a `package.json` that the `SvelteKit` rules read.
//!
//! The file is anyone's, so a field of an unexpected type reads as missing instead of making the
//! file unreadable, and a repeated key takes its last value, as `JSON.parse` does.

use std::fmt;
use std::path::Path;

use serde::Deserialize;
use serde::de::{Deserializer, IgnoredAny, MapAccess, Visitor};

#[cfg(test)]
mod tests;

#[derive(Debug, Default, PartialEq, Eq)]
pub(super) struct Package {
    /// Whether it is `eslint-plugin-svelte`'s own package.
    pub(super) is_eslint_plugin_svelte: bool,
    pub(super) version: Option<String>,
    /// The `SvelteKit` version that `dependencies`, or else `devDependencies`, names
    /// ([`kit_version`]).
    pub(super) kit: Option<String>,
}

impl Package {
    /// The package at `path`, when it holds a JSON object.
    pub(super) fn read(path: &Path) -> Option<Self> {
        serde_json::from_slice(&std::fs::read(path).ok()?).ok()
    }
}

/// `checkAndSetSvelteKitVersion`: `1.0.0-next` for Kit 1's prereleases, else the major version
/// of a version or a `^` or `~` range.
pub(super) fn kit_version(version: &str) -> Option<String> {
    let version = version.strip_prefix(['^', '~']).unwrap_or(version);
    let digits = version.len()
        - version
            .trim_start_matches(|c: char| c.is_ascii_digit())
            .len();
    if digits == 0 {
        return None;
    }
    let (major, rest) = version.split_at(digits);
    if major == "1" && rest.starts_with(".0.0-next") {
        return Some("1.0.0-next".to_owned());
    }
    rest.starts_with('.').then(|| major.to_owned())
}

#[derive(Deserialize)]
#[serde(field_identifier)]
enum Field {
    #[serde(rename = "name")]
    Name,
    #[serde(rename = "version")]
    Version,
    #[serde(rename = "dependencies")]
    Dependencies,
    #[serde(rename = "devDependencies")]
    DevDependencies,
    #[serde(other)]
    Other,
}

impl<'de> Deserialize<'de> for Package {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct Fields;

        impl<'de> Visitor<'de> for Fields {
            type Value = Package;

            fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
                formatter.write_str("a JSON object")
            }

            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Package, A::Error> {
                let (mut name, mut version) = (None, None);
                let (mut dependencies, mut dev_dependencies) = (None, None);
                while let Some(field) = map.next_key()? {
                    match field {
                        Field::Name => name = map.next_value::<Lenient<String>>()?.0,
                        Field::Version => version = map.next_value::<Lenient<String>>()?.0,
                        Field::Dependencies => dependencies = kit_entry(&mut map)?,
                        Field::DevDependencies => dev_dependencies = kit_entry(&mut map)?,
                        Field::Other => {
                            map.next_value::<IgnoredAny>()?;
                        }
                    }
                }
                // `dependencies` decides once it names Kit, even by a value that is no version.
                let declared = dependencies.or(dev_dependencies).and_then(|entry| entry.0);
                Ok(Package {
                    is_eslint_plugin_svelte: name.as_deref() == Some("eslint-plugin-svelte"),
                    version,
                    kit: declared.as_deref().and_then(kit_version),
                })
            }
        }

        deserializer.deserialize_map(Fields)
    }
}

/// The Kit entry of the dependency list that is the next value.
fn kit_entry<'de, A: MapAccess<'de>>(map: &mut A) -> Result<Option<KitEntry>, A::Error> {
    Ok(map
        .next_value::<Lenient<Dependencies>>()?
        .0
        .and_then(|dependencies| dependencies.0))
}

/// A value of type `T`, or `None` for a value of another type.
struct Lenient<T>(Option<T>);

impl<'de, T: Deserialize<'de>> Deserialize<'de> for Lenient<T> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        #[derive(Deserialize)]
        #[serde(untagged)]
        enum Either<T> {
            Expected(T),
            Other(IgnoredAny),
        }

        Ok(Self(match Either::deserialize(deserializer)? {
            Either::Expected(value) => Some(value),
            Either::Other(_) => None,
        }))
    }
}

#[derive(Deserialize)]
#[serde(field_identifier)]
enum Dependency {
    #[serde(rename = "@sveltejs/kit")]
    Kit,
    #[serde(other)]
    Other,
}

/// A dependency list's entry for `@sveltejs/kit`: its value when that is a string.
struct KitEntry(Option<String>);

/// A dependency list, by its entry for `@sveltejs/kit` when it has one.
struct Dependencies(Option<KitEntry>);

impl<'de> Deserialize<'de> for Dependencies {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct Entries;

        impl<'de> Visitor<'de> for Entries {
            type Value = Dependencies;

            fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
                formatter.write_str("a JSON object")
            }

            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Dependencies, A::Error> {
                let mut kit = None;
                while let Some(name) = map.next_key()? {
                    match name {
                        Dependency::Kit => {
                            kit = Some(KitEntry(map.next_value::<Lenient<String>>()?.0));
                        }
                        Dependency::Other => {
                            map.next_value::<IgnoredAny>()?;
                        }
                    }
                }
                Ok(Dependencies(kit))
            }
        }

        deserializer.deserialize_map(Entries)
    }
}
