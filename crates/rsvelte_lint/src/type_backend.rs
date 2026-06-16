//! The type-aware seam: a backend-agnostic interface a rule uses to query
//! TypeScript type facts at a position in the component.
//!
//! This module is the boundary described in `docs/svelte-lint-design.md` §B.
//! The **rule logic** that consumes type information lives in `rsvelte_lint`
//! (and is unit-tested against a mock backend, see the tests in the type-aware
//! rule modules), while the **real type resolution** — svelte2tsx generation, a
//! warm `corsa::ProjectSession` over a `tsgo` worker, forward span→TSX mapping,
//! and `get_type_at_position` probing — lives in the isolated `rsvelte_lint_types`
//! crate so that `rsvelte_lint` (and the default workspace build) never depends
//! on `corsa`/`tsgo`.
//!
//! All offsets passed to [`TypeBackend::probe_expr`] are **byte offsets into the
//! original Svelte source**; the backend is responsible for mapping them forward
//! into the generated TSX and converting to the UTF-16 offsets the checker uses.

/// The resolved type facts at a probed position, mirroring the fields a Svelte
/// type-aware rule needs from the checker's `TypeProbe`.
///
/// Every field degrades gracefully: an empty `type_texts` / `property_names`
/// means the checker returned nothing usable for that probe (a non-expression
/// position, an unresolved import, or `corsa` absent). Rules treat the empty /
/// absent case as "skip" — never as a positive signal.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct TypeFacts {
    /// Rendered type text(s) for the primary type at the query site, e.g.
    /// `["Props"]` or `["string & { __brand: \"ResolvedPathname\"; }"]`.
    pub type_texts: Vec<String>,
    /// Property names exposed by the probed type (fully resolved: `extends`,
    /// intersections, generics, and imported members are all expanded).
    pub property_names: Vec<String>,
    /// Rendered type text(s) for each property, aligned by index with
    /// [`Self::property_names`]. May be empty if property types were not loaded.
    pub property_types: Vec<Vec<String>>,
}

impl TypeFacts {
    /// The rendered type text(s) of the property `name`, if present and its
    /// types were loaded.
    pub fn property_type(&self, name: &str) -> Option<&[String]> {
        let idx = self.property_names.iter().position(|n| n == name)?;
        self.property_types.get(idx).map(Vec::as_slice)
    }

    /// Whether any rendered type text of the primary type mentions `needle`
    /// (used e.g. to detect the `$app/types` `ResolvedPathname` brand).
    pub fn type_text_contains(&self, needle: &str) -> bool {
        self.type_texts.iter().any(|t| t.contains(needle))
    }

    /// Whether the primary type is exactly nullish (`null` / `undefined` /
    /// unions of only those), per the rendered type texts.
    pub fn is_nullish(&self) -> bool {
        !self.type_texts.is_empty()
            && self.type_texts.iter().all(|t| {
                t.split('|')
                    .all(|part| matches!(part.trim(), "null" | "undefined"))
            })
    }
}

/// Whether a single rendered property-type text denotes a function / callable.
///
/// Mirrors the upstream `require-event-prefix` check that a Props property's
/// type is function-like. The checker renders function types either as an arrow
/// (`(...) => T`) or as a call-signature object literal
/// (`{ (...): T; ... }`), so both shapes are recognized.
pub fn type_text_is_function(text: &str) -> bool {
    let t = text.trim();
    if t.contains("=>") {
        return true;
    }
    // Call-signature object literal: `{ (args): Ret; ... }`.
    t.starts_with('{') && t.contains('(') && t.contains("):")
}

/// Whether a rendered function-type text returns a Promise (async-like).
pub fn type_text_returns_promise(text: &str) -> bool {
    // The return type follows the last top-level `=>`, e.g.
    // `() => Promise<void>`. A substring check is sufficient for the rendered
    // text the checker produces.
    text.contains("=> Promise<") || text.contains("=>Promise<")
}

/// A backend-agnostic source of TypeScript type facts for a single Svelte
/// component. Implemented by `rsvelte_lint_types` over `corsa`/`tsgo`, and by
/// mock backends in unit tests.
pub trait TypeBackend {
    /// The fully-resolved props type of the component (the type of the value
    /// returned by `$props()`), enumerated via the checker. Returns `None` when
    /// the component declares no typed props or the probe failed.
    fn probe_props(&mut self) -> Option<TypeFacts>;

    /// The type facts of the expression at the given **original Svelte byte
    /// offset** — e.g. the argument of a `goto(...)` call or the value of an
    /// `<a href={...}>` attribute. Returns `None` when the offset does not map
    /// to a probable expression or the probe failed.
    fn probe_expr(&mut self, svelte_offset: u32) -> Option<TypeFacts>;
}
