//! Low-level helpers shared by the template handlers.

pub(super) mod expr;
pub(super) mod names;
// `pub(crate)`: `svelte2tsx::nodes::svelte_options` is a sibling of `template`,
// not a descendant, but needs `opener_spacing`/`OpenerCtx` outside the main walk.
pub(crate) mod opener_spacing;
pub(super) mod source;
