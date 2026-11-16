//! Static reader for the Svelte `compilerOptions` a project declares in
//! `svelte.config.*` and in the `svelte()` / `sveltekit()` plugin call of
//! `vite.config.*`. Shared by `rsvelte_check` and `rsvelte_lint` so both
//! tools resolve the same options for the same project.

pub mod compiler_options;
pub mod js;
pub mod options_schema;
