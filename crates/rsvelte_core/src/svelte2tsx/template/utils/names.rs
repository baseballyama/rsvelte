//! Generated variable-name helpers, mirroring `htmlxtojsx_v2/utils/node-utils.ts`
//! and the `InlineComponent.ts` constructor-name scheme.

/// Sanitize a component name for use in variable names.
///
/// Mirrors `sanitizePropName` in `htmlxtojsx_v2/utils/node-utils.ts`:
/// each character that is NOT `[0-9A-Za-z$_]` is replaced with `_`.
/// Applied BEFORE reversing, so `Foo.Bar` → `Foo_Bar` → reversed `raB_ooF`.
pub(crate) fn sanitize_prop_name(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '$' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

/// Generate a reversed component constructor variable name.
///
/// Mirrors upstream `InlineComponent.ts`:
///   `this._name = '$$_' + Array.from(sanitizePropName(name)).reverse().join('') + depth`
///   `const constructorName = this._name + 'C'`
///
/// The `depth` (ancestor element/component count, NOT including blocks/root)
/// replaces the old per-name counter so two `<A/>` at the same level both
/// get index 0 — `$$_A0C` — matching the official tool.
pub(crate) fn reversed_component_name(name: &str, depth: u32) -> String {
    let sanitized = sanitize_prop_name(name);
    let reversed: String = sanitized.chars().rev().collect();
    format!("$$_{}{}C", reversed, depth)
}

/// Generate a reversed component instance variable name.
///
/// Like `reversed_component_name` but without the trailing `C` suffix.
pub(crate) fn reversed_component_instance_name(name: &str, depth: u32) -> String {
    let sanitized = sanitize_prop_name(name);
    let reversed: String = sanitized.chars().rev().collect();
    format!("$$_{}{}", reversed, depth)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reversed_component_name() {
        // Basic cases: depth (not per-name counter) is the suffix.
        assert_eq!(reversed_component_name("Component", 0), "$$_tnenopmoC0C");
        // depth=1 → `$$_ooF1C` (same as before, index was already depth in these examples)
        assert_eq!(reversed_component_name("Foo", 1), "$$_ooF1C");
        assert_eq!(reversed_component_name("Button", 0), "$$_nottuB0C");
        // sanitizePropName: '.' is not [0-9A-Za-z$_], replaced with '_' before reversing.
        // "Foo.Bar" → sanitized "Foo_Bar" → reversed "raB_ooF" → "$$_raB_ooF0C"
        assert_eq!(reversed_component_name("Foo.Bar", 0), "$$_raB_ooF0C");
        // Namespaced component: "Namespace:Comp" → "Namespace_Comp" → "pmoC_ecapsemaN" → "$$_pmoC_ecapsemaN0C"
        assert_eq!(
            reversed_component_name("Namespace:Comp", 0),
            "$$_pmoC_ecapsemaN0C"
        );
    }

    #[test]
    fn test_reversed_component_instance_name() {
        assert_eq!(
            reversed_component_instance_name("Component", 0),
            "$$_tnenopmoC0"
        );
        assert_eq!(reversed_component_instance_name("Button", 0), "$$_nottuB0");
        // sanitizePropName applied before reversing for instance names too.
        assert_eq!(
            reversed_component_instance_name("Foo.Bar", 0),
            "$$_raB_ooF0"
        );
    }

    #[test]
    fn test_sanitize_prop_name() {
        // Valid chars pass through unchanged.
        assert_eq!(sanitize_prop_name("Component"), "Component");
        assert_eq!(sanitize_prop_name("Foo_Bar"), "Foo_Bar");
        assert_eq!(sanitize_prop_name("$foo"), "$foo");
        // Invalid chars are replaced with '_'.
        assert_eq!(sanitize_prop_name("Foo.Bar"), "Foo_Bar");
        assert_eq!(sanitize_prop_name("svelte:self"), "svelte_self");
        assert_eq!(sanitize_prop_name("a-b-c"), "a_b_c");
    }
}
