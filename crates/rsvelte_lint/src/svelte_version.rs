//! Svelte-version eligibility for lint rules.
//!
//! rsvelte only parses Svelte 5, while upstream still publishes a small number
//! of rules whose `meta.conditions` admit Svelte 3/4 only. Keep that constant
//! axis explicit so enabling one of those rules cannot make it run on a file
//! where eslint-plugin-svelte would skip it.

/// Rules whose upstream conditions cannot be satisfied by Svelte 5.
const SVELTE_3_4_ONLY: &[&str] = &[
    "svelte/experimental-require-strict-events",
    "svelte/require-event-dispatcher-types",
];

#[must_use]
pub fn supports_svelte5(rule_name: &str) -> bool {
    !SVELTE_3_4_ONLY.contains(&rule_name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn excludes_only_the_svelte_3_4_rules() {
        assert!(!supports_svelte5(
            "svelte/experimental-require-strict-events"
        ));
        assert!(!supports_svelte5("svelte/require-event-dispatcher-types"));
        assert!(supports_svelte5("svelte/no-at-const-tags"));
    }
}
