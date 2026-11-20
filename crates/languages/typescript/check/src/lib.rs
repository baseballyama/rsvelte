//! TypeScript check.

pub(crate) mod check;
pub use check::{
    Check, CheckedDocument, Documents, Hidden, Import, MapBack, MappedLanguage, MappedLanguages,
    Tsc, TypeChecker, TypeScriptDocument, TypeScriptEnv, TypeScriptStandIn, TypeScriptView,
};

mod extension;
mod kit;
pub use extension::{EXTENSION, NEEDS_TYPE_CHECKER, TASK, type_checker};
mod registration;
pub use registration::{PLUGIN, register, register_service};
