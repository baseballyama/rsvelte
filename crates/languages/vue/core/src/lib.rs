//! Vue surface trees, semantic facts, and shared compiler IR.
//!
//! | artifact | output |
//! |---|---|
//! | [`Parsed`] | the surface tree ([`syntax_tree::SingleFileComponent`]) or the parse error |
//! | [`Lowered`] | the template as compiler-core reads it ([`compiler_syntax_tree`]) |
//! | [`Resolved`] | one scope analysis, compileScript's binding types ([`resolve::Resolution`]) |

pub mod syntax {
    pub mod parse;
    pub mod syntax_tree;
}
pub use syntax::{parse, syntax_tree};

pub mod semantic {
    pub mod expressions;
    pub mod resolve;
}
pub use semantic::resolve;

pub mod compilation {
    pub mod compiler_syntax_tree;
}
pub use compilation::compiler_syntax_tree;

pub mod computation {
    pub mod artifacts;
}
pub use computation::artifacts::{Lowered, PLUGIN, Parsed, Resolved, matches, register};
