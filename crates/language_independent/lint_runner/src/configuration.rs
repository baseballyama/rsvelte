//! A rule's entry in lint options, in `ESLint`'s shape. Both types check their input as they read
//! it, so holding one means it is valid.

use std::fmt;
use std::marker::PhantomData;

use rsvelte_kernel::diagnostics::Severity;
use serde::de::{
    self, Deserialize, Deserializer, IntoDeserializer, SeqAccess, Unexpected, Visitor,
};

const LEVELS: &str = "off, warn, error, 0, 1 or 2";

/// `ESLint`'s `RuleLevel`: `off`, `warn`, `error`, `0`, `1` or `2`.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Level(Option<Severity>);

impl Level {
    /// `None` turns the rule off.
    #[must_use]
    pub const fn severity(self) -> Option<Severity> {
        self.0
    }
}

impl<'de> Deserialize<'de> for Level {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        deserializer.deserialize_any(LevelVisitor)
    }
}

struct LevelVisitor;

impl Visitor<'_> for LevelVisitor {
    type Value = Level;

    fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(LEVELS)
    }

    fn visit_str<E: de::Error>(self, v: &str) -> Result<Level, E> {
        match v {
            "off" => Ok(Level(None)),
            "warn" => Ok(Level(Some(Severity::Warning))),
            "error" => Ok(Level(Some(Severity::Error))),
            _ => Err(E::invalid_value(Unexpected::Str(v), &self)),
        }
    }

    fn visit_u64<E: de::Error>(self, v: u64) -> Result<Level, E> {
        match v {
            0 => Ok(Level(None)),
            1 => Ok(Level(Some(Severity::Warning))),
            2 => Ok(Level(Some(Severity::Error))),
            _ => Err(E::invalid_value(Unexpected::Unsigned(v), &self)),
        }
    }

    fn visit_i64<E: de::Error>(self, v: i64) -> Result<Level, E> {
        match u64::try_from(v) {
            Ok(unsigned) => self.visit_u64(unsigned),
            Err(_) => Err(E::invalid_value(Unexpected::Signed(v), &self)),
        }
    }
}

/// `ESLint`'s `RuleEntry`: a level alone, or `[level]`, or `[level, options]`.
#[derive(Debug)]
pub struct RuleEntry<O> {
    pub level: Level,
    pub options: Option<O>,
}

impl<'de, O: Deserialize<'de>> Deserialize<'de> for RuleEntry<O> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        deserializer.deserialize_any(EntryVisitor(PhantomData))
    }
}

struct EntryVisitor<O>(PhantomData<O>);

impl<O> EntryVisitor<O> {
    const fn level(level: Level) -> RuleEntry<O> {
        RuleEntry {
            level,
            options: None,
        }
    }
}

impl<'de, O: Deserialize<'de>> Visitor<'de> for EntryVisitor<O> {
    type Value = RuleEntry<O>;

    fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{LEVELS}, or an array of a level and options")
    }

    fn visit_str<E: de::Error>(self, v: &str) -> Result<Self::Value, E> {
        Level::deserialize(v.into_deserializer()).map(Self::level)
    }

    fn visit_u64<E: de::Error>(self, v: u64) -> Result<Self::Value, E> {
        Level::deserialize(v.into_deserializer()).map(Self::level)
    }

    fn visit_i64<E: de::Error>(self, v: i64) -> Result<Self::Value, E> {
        Level::deserialize(v.into_deserializer()).map(Self::level)
    }

    fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
        let level = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(0, &self))?;
        let options = seq.next_element()?;
        if seq.next_element::<de::IgnoredAny>()?.is_some() {
            return Err(de::Error::invalid_length(3, &self));
        }
        Ok(RuleEntry { level, options })
    }
}

/// `ESLint`'s `RuleEntry` for a rule with any number of options: a level alone, or `[level,
/// ...options]`.
#[derive(Debug)]
pub struct RuleEntryList<O> {
    pub level: Level,
    pub options: Vec<O>,
}

impl<'de, O: Deserialize<'de>> Deserialize<'de> for RuleEntryList<O> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        deserializer.deserialize_any(ListVisitor(PhantomData))
    }
}

struct ListVisitor<O>(PhantomData<O>);

impl<O> ListVisitor<O> {
    const fn level(level: Level) -> RuleEntryList<O> {
        RuleEntryList {
            level,
            options: Vec::new(),
        }
    }
}

impl<'de, O: Deserialize<'de>> Visitor<'de> for ListVisitor<O> {
    type Value = RuleEntryList<O>;

    fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{LEVELS}, or an array of a level and options")
    }

    fn visit_str<E: de::Error>(self, v: &str) -> Result<Self::Value, E> {
        Level::deserialize(v.into_deserializer()).map(Self::level)
    }

    fn visit_u64<E: de::Error>(self, v: u64) -> Result<Self::Value, E> {
        Level::deserialize(v.into_deserializer()).map(Self::level)
    }

    fn visit_i64<E: de::Error>(self, v: i64) -> Result<Self::Value, E> {
        Level::deserialize(v.into_deserializer()).map(Self::level)
    }

    fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
        let level = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(0, &self))?;
        let mut options = Vec::new();
        while let Some(option) = seq.next_element()? {
            options.push(option);
        }
        Ok(RuleEntryList { level, options })
    }
}

#[cfg(test)]
mod tests;
