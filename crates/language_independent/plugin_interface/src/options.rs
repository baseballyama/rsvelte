use std::collections::BTreeMap;
use std::path::PathBuf;

use serde::de::DeserializeOwned;
use serde_json::value::RawValue;

use crate::CallError;

#[cfg(test)]
mod tests;

/// A plugin's options, decoded, and the directory relative paths in them are relative to.
#[derive(Debug)]
pub struct PluginOptions<T> {
    pub value: T,
    pub base: PathBuf,
}

/// Each plugin's options, still encoded, and whether some plugin read them.
#[derive(Debug, Default)]
pub(crate) struct OptionStore {
    entries: BTreeMap<String, Entry>,
}

#[derive(Debug)]
struct Entry {
    raw: Box<RawValue>,
    base: PathBuf,
    read: bool,
}

impl OptionStore {
    pub(crate) fn set(&mut self, identifier: String, raw: Box<RawValue>, base: PathBuf) {
        let entry = Entry {
            raw,
            base,
            read: false,
        };
        self.entries.insert(identifier, entry);
    }

    pub(crate) fn decode<T: DeserializeOwned>(
        &mut self,
        identifier: &str,
    ) -> Result<Option<PluginOptions<T>>, CallError> {
        let Some(entry) = self.entries.get_mut(identifier) else {
            return Ok(None);
        };
        let value = serde_json::from_str(entry.raw.get())
            .map_err(|error| CallError(format!("options of `{identifier}`: {error}")))?;
        entry.read = true;
        Ok(Some(PluginOptions {
            value,
            base: entry.base.clone(),
        }))
    }

    pub(crate) fn unread(&self) -> impl Iterator<Item = &str> {
        self.entries
            .iter()
            .filter(|(_, entry)| !entry.read)
            .map(|(identifier, _)| identifier.as_str())
    }
}
