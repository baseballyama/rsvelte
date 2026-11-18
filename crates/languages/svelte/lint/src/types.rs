//! The condition type of each JS/TS node, which type-aware rules read.

use oxc_semantic::NodeId;

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

    /// How many nodes have a condition type.
    #[must_use]
    pub const fn len(&self) -> usize {
        self.nodes.len()
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.nodes.is_empty()
    }

    #[must_use]
    pub(crate) fn get(&self, node: NodeId) -> ConditionType {
        self.nodes[node.index()]
    }
}

const _: () = assert!(
    size_of::<ConditionType>() == 1,
    "one byte per condition type"
);
