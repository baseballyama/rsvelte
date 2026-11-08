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

#[test]
fn an_entry_list_keeps_every_option() {
    let entry = RuleEntryList::<u64>::deserialize(SeqDeserializer::<_, Error>::new(
        [1u64, 7, 8].into_iter(),
    ))
    .expect("a level and two options");
    assert_eq!(
        (entry.level.severity(), entry.options),
        (Some(Severity::Warning), vec![7, 8])
    );
    let empty = RuleEntryList::<u64>::deserialize(SeqDeserializer::<_, Error>::new(
        std::iter::empty::<u64>(),
    ));
    assert!(empty.is_err(), "an entry needs a level");
}
