//! Object field lookup that does not hash the key.
//!
//! A CSS AST node carries four to six keys (`type`, `start`, `end`, plus two or
//! three of `name`/`prelude`/`block`/`children`/`selectors`), and
//! `serde_json`'s map under `preserve_order` is an `IndexMap<String, Value>`
//! with `RandomState` — so every `get("type")` is a SipHash of the key plus a
//! hash-table probe. A profile of a client compile puts 2.41% in
//! `sip::Hasher::write` and 2.16% in `IndexMap::get_index_of`, of which the CSS
//! pruner's selector walk is a quarter. Comparing five short strings against a
//! sequential entry list is cheaper than hashing one.

use serde_json::{Map, Value};

/// Field lookup by linear scan. Returns exactly what `Value::get`/`Map::get`
/// would: a map cannot hold a duplicate key, and a non-object has no fields.
pub trait Field {
    fn field(&self, key: &str) -> Option<&Value>;
}

impl Field for Map<String, Value> {
    #[inline]
    fn field(&self, key: &str) -> Option<&Value> {
        self.iter()
            .find(|(name, _)| name.as_str() == key)
            .map(|(_, value)| value)
    }
}

impl Field for Value {
    #[inline]
    fn field(&self, key: &str) -> Option<&Value> {
        match self {
            Value::Object(map) => map.field(key),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Field;
    use serde_json::{Value, json};

    #[test]
    fn agrees_with_serde_get() {
        let node = json!({
            "type": "Rule",
            "start": 0,
            "end": 12,
            "prelude": { "type": "SelectorList" },
            "block": Value::Null,
        });
        for key in [
            "type", "start", "end", "prelude", "block", "missing", "", "typ", "types",
        ] {
            assert_eq!(node.field(key), node.get(key), "{key:?}");
            assert_eq!(
                node.as_object().unwrap().field(key),
                node.as_object().unwrap().get(key),
                "{key:?}"
            );
        }
    }

    #[test]
    fn a_non_object_has_no_fields() {
        for value in [
            json!([1, 2]),
            json!("s"),
            json!(3),
            Value::Null,
            json!(true),
        ] {
            assert_eq!(value.field("type"), None);
            assert_eq!(value.field("0"), value.get("0"));
        }
    }
}
