//! Generated variable-name helpers, mirroring `htmlxtojsx_v2/utils/node-utils.ts`
//! and the `InlineComponent.ts` constructor-name scheme.

use std::fmt::Write as _;

/// Generate the shared constructor/instance name; constructors append `C`.
pub(crate) fn reversed_component_name(name: &str, depth: u32) -> String {
    #[cfg(test)]
    COMPONENT_NAME_DERIVATIONS.with(|count| count.set(count.get() + 1));

    let mut generated = String::with_capacity(name.len() + 13);
    generated.push_str("$$_");
    for c in name.chars().rev() {
        if c.is_ascii_alphanumeric() || c == '$' || c == '_' {
            generated.push(c);
        } else {
            // Upstream sanitizes UTF-16 code units before reversing.
            generated.push('_');
            if c.len_utf16() == 2 {
                generated.push('_');
            }
        }
    }
    let _ = write!(generated, "{depth}");
    generated
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    fn take_derivation_count() -> usize {
        COMPONENT_NAME_DERIVATIONS.with(|count| count.replace(0))
    }

    #[test]
    fn derives_shared_constructor_and_instance_name() {
        assert_eq!(reversed_component_name("Component", 0), "$$_tnenopmoC0");
        assert_eq!(reversed_component_name("Foo.Bar", 1), "$$_raB_ooF1");
        assert_eq!(
            reversed_component_name("Namespace:Comp", 2),
            "$$_pmoC_ecapsemaN2"
        );
    }

    #[test]
    fn matches_upstream_utf16_sanitization() {
        assert_eq!(reversed_component_name("A😀-é.组件$", 42), "$$_$_______A42");
    }

    #[test]
    fn repeated_components_derive_each_name_once() {
        let source = "<Repeated />".repeat(512);
        take_derivation_count();
        let result = svelte2tsx(&source, Svelte2TsxOptions::default()).unwrap();

        assert_eq!(take_derivation_count(), 512);
        assert_eq!(result.code.matches("$$_detaepeR0C").count(), 1024);
    }
}

#[cfg(test)]
thread_local! {
    static COMPONENT_NAME_DERIVATIONS: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
}
