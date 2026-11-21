#![allow(
    clippy::mem_forget,
    reason = "self_cell's expansion forgets its guard on purpose"
)]

use rsvelte_typescript_tree::Tree;

use super::Analyzed;

self_cell::self_cell!(
    pub(super) struct Cell {
        owner: Tree,
        #[covariant]
        dependent: Analyzed,
    }
);
