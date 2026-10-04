use std::borrow::Cow;

use rsvelte_kernel::diagnostics::diagnostic::Severity;
use rsvelte_markup::button_type::Allowed;

#[derive(Clone, Copy, Debug)]
pub enum RuleConfiguration {
    NoUnusedVariables(Severity),
    ButtonHasType {
        severity: Severity,
        allowed: Allowed,
    },
    ValidEachKey(Severity),
}

impl RuleConfiguration {
    #[must_use]
    pub const fn name(self) -> &'static str {
        match self {
            Self::NoUnusedVariables(_) => "no-unused-vars",
            Self::ButtonHasType { .. } => "svelte/button-has-type",
            Self::ValidEachKey(_) => "svelte/valid-each-key",
        }
    }

    pub(crate) const fn severity(self) -> Severity {
        match self {
            Self::NoUnusedVariables(s) | Self::ValidEachKey(s) => s,
            Self::ButtonHasType { severity, .. } => severity,
        }
    }
}

#[derive(Clone, Debug)]
pub struct Configuration {
    rules: Cow<'static, [RuleConfiguration]>,
}

impl Configuration {
    /// Rules keep configuration order. Omit a rule to disable it.
    ///
    /// # Errors
    ///
    /// A rule occurs more than once.
    pub fn new(rules: Vec<RuleConfiguration>) -> Result<Self, &'static str> {
        let mut seen = 0u8;
        for rule in &rules {
            let bit = match rule {
                RuleConfiguration::NoUnusedVariables(_) => 1,
                RuleConfiguration::ButtonHasType { .. } => 2,
                RuleConfiguration::ValidEachKey(_) => 4,
            };
            if seen & bit != 0 {
                return Err("each lint rule may be configured once");
            }
            seen |= bit;
        }
        Ok(Self {
            rules: Cow::Owned(rules),
        })
    }

    #[must_use]
    pub fn rules(&self) -> &[RuleConfiguration] {
        &self.rules
    }
}

pub(crate) const DEFAULT_RULES: &[RuleConfiguration] = &[
    RuleConfiguration::NoUnusedVariables(Severity::Error),
    RuleConfiguration::ButtonHasType {
        severity: Severity::Error,
        allowed: Allowed {
            button: true,
            submit: true,
            reset: true,
        },
    },
];

impl Default for Configuration {
    fn default() -> Self {
        Self {
            rules: Cow::Borrowed(DEFAULT_RULES),
        }
    }
}
