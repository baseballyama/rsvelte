//! Declarative form for the compiler's error and warning constructors.
//!
//! `errors.rs` and `warnings.rs` mirror Svelte's `errors.js` / `warnings.js`, which are
//! themselves generated from `packages/svelte/messages/**/*.md`. Here the same tables are
//! written as declarations so that the code, the message template and the argument types
//! stay on one line each.

/// Declare diagnostic constructors.
///
/// ```ignore
/// diagnostics! {
///     error => AnalysisError;
///
///     /// doc comment
///     attribute_duplicate() => "Attributes need to be unique";
///     props_duplicate(rune: &str) => "`{}` has already been declared", rune;
///     // `as "..."` overrides the code when it differs from the function name
///     foo_bar as "foo"() => "…";
/// }
/// ```
macro_rules! diagnostics {
    (@code $name:ident) => { stringify!($name) };
    (@code $name:ident $code:literal) => { $code };
    (@message $message:literal) => { $message };
    (@message $message:literal, $($arg:expr),+) => { format!($message, $($arg),+) };
    (
        $constructor:path => $return_type:ty;
        $(
            $(#[$meta:meta])*
            $name:ident $(as $code:literal)? ($($param:ident: $param_type:ty),* $(,)?)
                => $message:literal $(, $arg:expr)* ;
        )*
    ) => {
        $(
            $(#[$meta])*
            pub fn $name($($param: $param_type),*) -> $return_type {
                $constructor(
                    diagnostics!(@code $name $($code)?),
                    diagnostics!(@message $message $(, $arg)*),
                )
            }
        )*

        // Every constructor above is invoked here with its parameter names standing in
        // for the (all-`&str`) arguments, so adding/removing/renaming a constructor in
        // this macro invocation automatically changes what the pinned-digest test in
        // `diagnostics_test.rs` covers, instead of relying on someone to update a
        // hand-written call list.
        #[cfg(test)]
        pub(crate) fn __diagnostics_dump() -> Vec<(String, String)> {
            vec![
                $(
                    {
                        let diagnostic = $name($(stringify!($param)),*);
                        (
                            super::diagnostic::DiagnosticDump::dump_code(&diagnostic).to_string(),
                            super::diagnostic::DiagnosticDump::dump_message(&diagnostic).to_string(),
                        )
                    }
                ),*
            ]
        }
    };
}

pub(super) use diagnostics;

/// Test-only accessor so the macro above can read back `(code, message)` from either
/// [`super::errors::AnalysisError`] or [`super::warnings::AnalysisWarning`] without the
/// macro itself needing to know their concrete shapes.
#[cfg(test)]
pub(super) trait DiagnosticDump {
    fn dump_code(&self) -> &str;
    fn dump_message(&self) -> &str;
}
