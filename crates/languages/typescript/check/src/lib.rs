//! TypeScript check.

pub(crate) mod check;
pub use check::{
    Check, CheckedDocument, Documents, Hidden, Import, MapBack, MappedLanguage, MappedLanguages,
    StandIn, Tsc, TypeCheckers, TypeScriptDocument, TypeScriptEnv, TypeScriptStandIn,
    TypeScriptView, reported_lines,
};

mod extension;
mod imports;
pub use imports::imports;
mod kit;
pub use extension::{EXTENSION, NEEDS_TYPE_CHECKER, TASK, type_checker};
mod registration;
mod type_checker;
pub use registration::{register, register_service};
pub use type_checker::TypeChecker;
