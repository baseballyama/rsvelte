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

#[test]
fn rules_keep_the_configuration_order_and_a_repeated_key_keeps_its_place() {
    use serde::de::value::MapDeserializer;
    let entries = [("b", 1u64), ("a", 2), ("b", 3)].into_iter();
    let rules = Rules::<u64>::deserialize(MapDeserializer::<_, Error>::new(entries))
        .expect("an object of rules");
    assert_eq!(rules.0, [("b".to_owned(), 3), ("a".to_owned(), 2)]);
}
