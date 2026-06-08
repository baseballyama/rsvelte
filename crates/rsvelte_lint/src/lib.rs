//! # rsvelte_lint
//!
//! A fast, native Svelte linter built directly on the rsvelte compiler.
//!
//! This is **Wave 1** of the linter described in `docs/svelte-lint-design.md`.
//! It combines two sources of diagnostics:
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
pub mod eslint_import;
pub mod line_index;
pub mod output;
pub mod presets;
pub mod registry;
pub mod rule;
pub mod rules;
pub mod runner;
pub mod scope;
pub mod suppression;
pub mod validator;
pub mod visitor;

pub use config::LintConfig;
pub use diagnostic::{Fix, LintDiagnostic, TextEdit};
pub use output::{LintFormat, render};
pub use rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
pub use runner::{FixResult, fix_source, lint_file, lint_source};
