#![allow(
    clippy::mem_forget,
    reason = "self_cell's expansion forgets its guard on purpose"
)]

use rsvelte_typescript_semantic::semantic::Semantic;

use super::Facts;

self_cell::self_cell!(
    pub(super) struct Cell {
        owner: Semantic,
        #[covariant]
        dependent: Facts,
    }
);
