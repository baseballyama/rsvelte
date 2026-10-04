use super::Value;
use super::membership::Membership;

#[derive(Debug, Default)]
pub(super) enum Values {
    #[default]
    Empty,
    Single(Value),
    Multiple {
        values: Vec<Value>,
        membership: Membership,
    },
}

impl Values {
    pub(super) fn value(&self) -> &Value {
        self.as_slice().last().unwrap_or(&Value::Undefined)
    }

    pub(super) fn into_value(self) -> Value {
        match self {
            Self::Empty => Value::Undefined,
            Self::Single(value) => value,
            Self::Multiple { mut values, .. } => {
                values.pop().expect("multiple values are not empty")
            }
        }
    }

    pub(super) const fn is_known(&self) -> bool {
        match self {
            Self::Empty => true,
            Self::Single(value) => !value.is_symbol(),
            Self::Multiple { .. } => false,
        }
    }

    pub(super) fn is_string(&self) -> bool {
        self.as_slice().iter().all(Value::is_string)
    }

    pub(super) fn is_number(&self) -> bool {
        self.as_slice().iter().all(Value::is_number)
    }

    pub(super) fn add(&mut self, value: Value) {
        match self {
            Self::Empty => *self = Self::Single(value),
            Self::Single(first) => {
                if *first != value {
                    let Self::Single(first) = std::mem::take(self) else {
                        unreachable!("a single value")
                    };
                    *self = Self::Multiple {
                        values: vec![first, value],
                        membership: Membership::default(),
                    };
                }
            }
            Self::Multiple { values, membership } => membership.add(values, value),
        }
    }

    pub(super) fn as_slice(&self) -> &[Value] {
        match self {
            Self::Empty => &[],
            Self::Single(value) => std::slice::from_ref(value),
            Self::Multiple { values, .. } => values,
        }
    }

    pub(super) fn into_vec(self) -> Vec<Value> {
        match self {
            Self::Empty => Vec::new(),
            Self::Single(value) => vec![value],
            Self::Multiple { values, .. } => values,
        }
    }

    pub(super) fn into_values(self) -> impl Iterator<Item = Value> {
        let (first, rest) = match self {
            Self::Empty => (None, Vec::new()),
            Self::Single(value) => (Some(value), Vec::new()),
            Self::Multiple { values, .. } => (None, values),
        };
        first.into_iter().chain(rest)
    }
}

#[cfg(test)]
mod tests;
