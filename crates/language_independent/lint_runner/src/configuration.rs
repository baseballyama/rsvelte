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

#[cfg(test)]
mod tests {
    use serde::de::value::{Error, SeqDeserializer, StrDeserializer, U64Deserializer};

    use super::*;

    fn level(name: &str) -> Result<Option<Severity>, Error> {
        Level::deserialize(StrDeserializer::<Error>::new(name)).map(Level::severity)
    }

    #[test]
    fn levels_are_the_six_eslint_names() {
        assert_eq!(level("off"), Ok(None));
        assert_eq!(level("warn"), Ok(Some(Severity::Warning)));
        assert_eq!(level("error"), Ok(Some(Severity::Error)));
        let number = |n| Level::deserialize(U64Deserializer::<Error>::new(n)).map(Level::severity);
        assert_eq!(number(0), Ok(None));
        assert_eq!(number(1), Ok(Some(Severity::Warning)));
        assert_eq!(number(2), Ok(Some(Severity::Error)));
        let error = number(3).expect_err("3 is no level").to_string();
        assert!(error.contains("off, warn, error, 0, 1 or 2"), "{error}");
        level("Error").expect_err("levels are lowercase");
    }

    #[test]
    fn an_entry_is_a_level_or_an_array_of_a_level_and_options() {
        let alone = RuleEntry::<u64>::deserialize(StrDeserializer::<Error>::new("warn"))
            .expect("a level alone");
        assert_eq!(
            (alone.level.severity(), alone.options),
            (Some(Severity::Warning), None)
        );
        let seq = |items: Vec<u64>| {
            RuleEntry::<u64>::deserialize(SeqDeserializer::<_, Error>::new(items.into_iter()))
        };
        let with = seq(vec![2, 7]).expect("a level and options");
        assert_eq!(
            (with.level.severity(), with.options),
            (Some(Severity::Error), Some(7))
        );
        assert_eq!(seq(vec![0]).expect("a level in an array").options, None);
        seq(vec![]).expect_err("an empty array has no level");
        seq(vec![2, 7, 7]).expect_err("a rule takes one options value");
        let error = RuleEntry::<u64>::deserialize(StrDeserializer::<Error>::new("bad"))
            .expect_err("bad is no level")
            .to_string();
        assert!(error.contains("off, warn, error, 0, 1 or 2"), "{error}");
    }
}
