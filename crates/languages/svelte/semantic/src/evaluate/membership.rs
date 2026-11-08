use std::hash::{Hash, Hasher};

use rustc_hash::FxHasher;

use super::Value;

const LINEAR_LIMIT: usize = 8;
const EMPTY: u32 = u32::MAX;
const INITIAL_BUCKETS: usize = 32;

#[derive(Debug, Default)]
pub(super) struct Membership {
    // Indices avoid cloning strings and BigInts for set membership.
    buckets: Vec<u32>,
}

impl Membership {
    pub(super) fn add(&mut self, values: &mut Vec<Value>, value: Value) {
        if values.len() < LINEAR_LIMIT {
            if !values.contains(&value) {
                values.push(value);
            }
            return;
        }
        if self.buckets.is_empty() {
            self.rebuild(values, INITIAL_BUCKETS);
        } else if values.len() * 2 >= self.buckets.len() {
            self.rebuild(values, self.buckets.len() * 2);
        }
        let mut bucket = hash(&value) as usize & (self.buckets.len() - 1);
        while self.buckets[bucket] != EMPTY {
            if values[self.buckets[bucket] as usize] == value {
                return;
            }
            bucket = (bucket + 1) & (self.buckets.len() - 1);
        }
        self.buckets[bucket] = u32::try_from(values.len()).expect("evaluation values fit in u32");
        values.push(value);
    }

    fn rebuild(&mut self, values: &[Value], count: usize) {
        self.buckets.clear();
        self.buckets.resize(count, EMPTY);
        for (index, value) in values.iter().enumerate() {
            let mut bucket = hash(value) as usize & (count - 1);
            while self.buckets[bucket] != EMPTY {
                bucket = (bucket + 1) & (count - 1);
            }
            self.buckets[bucket] = u32::try_from(index).expect("evaluation values fit in u32");
        }
    }
}

fn hash(value: &Value) -> u64 {
    let mut hasher = FxHasher::default();
    std::mem::discriminant(value).hash(&mut hasher);
    match value {
        Value::String(value) => value.hash(&mut hasher),
        Value::Number(value) => {
            let bits = if value.is_nan() {
                f64::NAN.to_bits()
            } else if *value == 0.0 {
                0
            } else {
                value.to_bits()
            };
            bits.hash(&mut hasher);
        }
        Value::BigInt(value) => value.hash(&mut hasher),
        Value::Boolean(value) => value.hash(&mut hasher),
        Value::Null
        | Value::Undefined
        | Value::AnyString
        | Value::AnyNumber
        | Value::AnyFunction
        | Value::Unknown => {}
    }
    hasher.finish()
}
