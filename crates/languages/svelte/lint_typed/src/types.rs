use rsvelte_typescript::NodeIdentifier;

mod infer;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
#[repr(u8)]
pub enum ConditionType {
    #[default]
    Unknown,
    Truthy,
    Falsy,
    Nullish,
    NonNullish,
}

impl ConditionType {
    pub(crate) const fn truthiness(self) -> Option<bool> {
        match self {
            Self::Truthy => Some(true),
            Self::Falsy | Self::Nullish => Some(false),
            Self::Unknown | Self::NonNullish => None,
        }
    }

    pub(crate) const fn nullish(self) -> Option<bool> {
        match self {
            Self::Nullish => Some(true),
            Self::Truthy | Self::Falsy | Self::NonNullish => Some(false),
            Self::Unknown => None,
        }
    }
}

#[derive(Debug)]
pub struct TypeFacts {
    nodes: Vec<ConditionType>,
}

impl TypeFacts {
    #[must_use]
    pub const fn new(nodes: Vec<ConditionType>) -> Self {
        Self { nodes }
    }

    #[must_use]
    pub fn get(&self, node: NodeIdentifier) -> ConditionType {
        self.nodes[node.index()]
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<ConditionType>()
    }
}

const _: () = assert!(
    size_of::<ConditionType>() == 1,
    "one byte per condition type"
);
