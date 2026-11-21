#![allow(
    clippy::mem_forget,
    reason = "self_cell's expansion forgets its guard on purpose"
)]

use oxc_allocator::Allocator;

use super::Trees;

self_cell::self_cell!(
    pub(super) struct Cell {
        owner: Allocator,
        #[covariant]
        dependent: Trees,
    }
);
