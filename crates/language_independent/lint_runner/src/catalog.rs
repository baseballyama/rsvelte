//! Which rules a linter knows, which run, and with what options. A language supplies its rule
//! definitions, its settings and the rules it configures; the bookkeeping is shared.

use std::sync::Arc;

use rsvelte_kernel::diagnostics::Severity;
use serde::de::DeserializeOwned;
use serde_json::value::RawValue;

use crate::configuration::RuleLevels;
use crate::rule::{Reporter, Rule};

/// A rule as configuration names it.
pub trait Definition: Sync + 'static {
    /// The full name, such as `svelte/no-at-html-tags`.
    fn name(&self) -> &'static str;
}

/// Rules a plugin adds. Each rule's name is `<prefix>/<rule>`.
#[derive(Debug)]
pub struct Plugin<D: 'static> {
    /// Not the linter's own prefix, and no other plugin's.
    pub prefix: &'static str,
    pub rules: &'static [&'static D],
}

/// Whether `prefix` can prefix plugin rules: a non-empty name without `/`.
#[must_use]
pub fn is_prefix(prefix: &str) -> bool {
    !prefix.is_empty() && !prefix.contains('/')
}

/// Plugins name their rules `<prefix>/<rule>` under a prefix of their own, never `reserved`, so
/// no plugin rule can stand for another rule.
///
/// # Errors
///
/// A plugin's prefix or rule name breaks that, or two plugins share a prefix.
pub fn check_plugins<D: Definition>(reserved: &str, plugins: &[&Plugin<D>]) -> Result<(), String> {
    for (i, plugin) in plugins.iter().enumerate() {
        if !is_prefix(plugin.prefix) || plugin.prefix == reserved {
            return Err(format!(
                "a plugin cannot use the prefix `{}`",
                plugin.prefix
            ));
        }
        if plugins[..i]
            .iter()
            .any(|other| other.prefix == plugin.prefix)
        {
            return Err(format!("two plugins use the prefix `{}`", plugin.prefix));
        }
        for rule in plugin.rules {
            let named = rule
                .name()
                .strip_prefix(plugin.prefix)
                .and_then(|rest| rest.strip_prefix('/'))
                .is_some_and(|rest| !rest.is_empty());
            if !named {
                return Err(format!(
                    "plugin `{}` names a rule `{}` outside its prefix",
                    plugin.prefix,
                    rule.name()
                ));
            }
        }
    }
    Ok(())
}

/// The built-in or plugin rule called `name`.
#[must_use]
pub fn find<D: Definition>(
    built_in: &[&'static D],
    plugins: &[&Plugin<D>],
    name: &str,
) -> Option<&'static D> {
    built_in
        .iter()
        .chain(plugins.iter().flat_map(|plugin| plugin.rules))
        .find(|definition| definition.name() == name)
        .copied()
}

/// A rule's options: `ESLint`'s entry without its level, and the linter's shared settings.
#[derive(Debug)]
pub struct RuleOptions<'a, S> {
    pub options: &'a [Box<RawValue>],
    pub settings: &'a Arc<S>,
}

impl<S> RuleOptions<'_, S> {
    /// Option `index`, decoded; `None` when it is absent.
    ///
    /// # Errors
    ///
    /// The option does not decode as `T`.
    pub fn get<T: DeserializeOwned>(&self, index: usize) -> Result<Option<T>, String> {
        self.options
            .get(index)
            .map(|raw| serde_json::from_str(raw.get()).map_err(|e| e.to_string()))
            .transpose()
    }

    /// The first option, or `T::default()`.
    ///
    /// # Errors
    ///
    /// There is more than one option, or the first does not decode as `T`.
    pub fn single<T: DeserializeOwned + Default>(&self) -> Result<T, String> {
        if self.options.len() > 1 {
            return Err("takes one option".to_owned());
        }
        Ok(self.get(0)?.unwrap_or_default())
    }

    /// # Errors
    ///
    /// There are options.
    pub fn none(&self) -> Result<(), String> {
        if self.options.is_empty() {
            Ok(())
        } else {
            Err("takes no options".to_owned())
        }
    }
}

/// A rule that configuration turned on, with what the language keeps beside it (`X`), such as
/// which documents it runs on.
#[derive(Debug)]
pub struct Enabled<R: ?Sized, X> {
    name: &'static str,
    severity: Severity,
    pub extra: X,
    rule: Box<R>,
}

impl<R: ?Sized, X> Enabled<R, X> {
    #[must_use]
    pub const fn name(&self) -> &'static str {
        self.name
    }

    #[must_use]
    pub const fn severity(&self) -> Severity {
        self.severity
    }

    #[must_use]
    pub fn rule(&self) -> &R {
        &self.rule
    }
}

/// The rules that run, in configuration order, which is the order `ESLint` runs them in.
#[derive(Debug)]
pub struct EnabledRules<R: ?Sized, X>(Vec<Enabled<R, X>>);

impl<R: ?Sized, X> Default for EnabledRules<R, X> {
    fn default() -> Self {
        Self(Vec::new())
    }
}

impl<R: ?Sized, X> EnabledRules<R, X> {
    /// # Errors
    ///
    /// A rule of the name is already on.
    pub fn push(
        &mut self,
        name: &'static str,
        severity: Severity,
        extra: X,
        rule: Box<R>,
    ) -> Result<&mut Self, String> {
        if self.0.iter().any(|r| r.name == name) {
            return Err(format!("rule `{name}` is configured twice"));
        }
        self.0.push(Enabled {
            name,
            severity,
            extra,
            rule,
        });
        Ok(self)
    }

    #[must_use]
    pub fn as_slice(&self) -> &[Enabled<R, X>] {
        &self.0
    }
}

/// One of a linter's built-in rules that takes no options, at the severity configuration gives it.
pub struct Leveled<'r, R: ?Sized> {
    pub rule: &'r R,
    pub severity: Severity,
}

impl<R: ?Sized> std::fmt::Debug for Leveled<'_, R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Leveled")
            .field("severity", &self.severity)
            .finish_non_exhaustive()
    }
}

impl<C: ?Sized, R: Rule<C> + ?Sized> Rule<C> for Leveled<'_, R> {
    fn identifier(&self) -> &'static str {
        self.rule.identifier()
    }

    fn severity(&self) -> Severity {
        self.severity
    }

    fn check(&self, context: &C, reporter: &mut Reporter<'_>) {
        self.rule.check(context, reporter);
    }
}

/// Every rule of `known`, at its own severity.
pub fn all<'r, R: ?Sized>(
    known: &[&'r R],
    default_severity: impl Fn(&R) -> Severity,
) -> Vec<Leveled<'r, R>> {
    known
        .iter()
        .map(|&rule| Leveled {
            rule,
            severity: default_severity(rule),
        })
        .collect()
}

/// The rules a `rules` object turns on among `known`, in configuration order.
///
/// The rules take no options. Without the object every known rule runs at its own severity. As in
/// `ESLint`, an off rule is not checked, so it may name a rule that does not exist.
///
/// # Errors
///
/// A rule that is on is unknown or has options.
pub fn levels<'r, R: ?Sized>(
    known: &[&'r R],
    name: impl Fn(&R) -> &'static str,
    default_severity: impl Fn(&R) -> Severity,
    rules: Option<RuleLevels>,
) -> Result<Vec<Leveled<'r, R>>, String> {
    let Some(rules) = rules else {
        return Ok(all(known, default_severity));
    };
    let mut on = Vec::new();
    for (rule_name, entry) in rules.0 {
        let Some(severity) = entry.level.severity() else {
            continue;
        };
        let rule = known
            .iter()
            .copied()
            .find(|&rule| name(rule) == rule_name)
            .ok_or_else(|| format!("unknown rule `{rule_name}`"))?;
        if !entry.options.is_empty() {
            return Err(format!("rule `{rule_name}` takes no options"));
        }
        on.push(Leveled { rule, severity });
    }
    Ok(on)
}

#[cfg(test)]
mod tests;
