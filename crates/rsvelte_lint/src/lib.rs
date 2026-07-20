//! # rsvelte_lint
//!
//! A fast, native Svelte linter built directly on the rsvelte compiler.
//!
//! This is **Wave 1** of the linter. It combines two sources of diagnostics:
//!
//! 1. **Validator wrap** ([`validator`]) — the rsvelte compiler already emits
//!    ~70 warning codes, ~145 error codes, and 42 `a11y_*` rules during
//!    analysis. We surface those as lint diagnostics with near-zero rule code,
//!    giving compiler-parity coverage on day one.
//! 2. **Native rule engine** ([`rule`], [`visitor`], [`registry`]) — a single
//!    shared DFS over the template AST that dispatches to [`Rule`] hooks, porting
//!    the proven `vize_patina` structure. New Svelte-specific rules live here.
//!
//! Output reuses `rsvelte_core::svelte_check`'s [`Diagnostic`] + writers so
//! `rsvelte lint` and `rsvelte check` speak the same dialect.
//!
//! [`Diagnostic`]: rsvelte_core::svelte_check::Diagnostic

pub mod config;
pub mod context;
pub mod diagnostic;
pub mod engine;
pub mod inline_config;
pub mod line_index;
// `--print-eslint-config` / `--list-rules`: builds on `registered_rule_metas`
// (which chains the native-only source-scan meta rules), so it is native-only.
#[cfg(feature = "native")]
pub mod presets;
pub mod registry;
pub mod rule;
pub mod rules;
pub mod scope;
pub mod script;
pub mod suppression;
// Source-scan helpers used only by the native-only meta rules above.
#[cfg(feature = "native")]
pub mod svelte_scan;
pub mod type_backend;
pub mod visitor;

// `--config-from-eslint` importer (OXC). Excluded from the wasm build.
#[cfg(feature = "eslint-import")]
pub mod eslint_import;

// Native-only: these reuse `rsvelte_core::svelte_check` (Diagnostic + writers),
// which is itself a native-only module.
#[cfg(feature = "native")]
pub mod output;
#[cfg(feature = "native")]
pub mod runner;
#[cfg(feature = "native")]
pub mod validator;

// Engine-only JSON diagnostic API shared by the wasm + NAPI out-of-process
// bindings (so both return byte-identical JSON).
#[cfg(any(feature = "wasm", feature = "napi"))]
pub mod json_api;

// Browser build: the rule engine compiled to wasm for the playground.
#[cfg(feature = "wasm")]
pub mod wasm;

// Native addon: the rule engine as a Node `.node` (NAPI) for the
// native-first path in `@rsvelte/oxlint-plugin`.
#[cfg(feature = "napi")]
pub mod napi;

pub use config::LintConfig;
pub use diagnostic::{Fix, LintDiagnostic, Suggestion, TextEdit};
pub use rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

#[cfg(feature = "native")]
pub use output::{LintFormat, render};
#[cfg(feature = "native")]
pub use runner::{FixResult, fix_source, lint_file, lint_source, lint_source_raw};
