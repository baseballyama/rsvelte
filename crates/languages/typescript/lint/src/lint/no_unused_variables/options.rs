//! `no-unused-vars`'s options, as `ESLint` and typescript-eslint read them.

use regress::Regex;
use serde::Deserialize;
use serde::de::IgnoredAny;

/// The rule's one option: a string sets `vars`, an object any of them. `vars: local` skips the
/// global scope, which a module does not declare in, so the rule reads and checks it only.
#[derive(Debug, Default)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "one flag per upstream option"
)]
pub struct NoUnusedVariablesOptions {
    pub(super) vars_ignore_pattern: Option<IgnorePattern>,
    pub(super) args: Args,
    pub(super) args_ignore_pattern: Option<IgnorePattern>,
    pub(super) caught_errors: CaughtErrors,
    pub(super) caught_errors_ignore_pattern: Option<IgnorePattern>,
    pub(super) destructured_array_ignore_pattern: Option<IgnorePattern>,
    pub(super) ignore_rest_siblings: bool,
    pub(super) ignore_class_with_static_init_block: bool,
    pub(super) ignore_using_declarations: bool,
    pub(super) report_used_ignore_pattern: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
enum Vars {
    All,
    Local,
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub(super) enum Args {
    #[default]
    AfterUsed,
    All,
    None,
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub(super) enum CaughtErrors {
    #[default]
    All,
    None,
}

/// `new RegExp(pattern, 'u')`.
#[derive(Debug)]
pub(super) struct IgnorePattern {
    regex: Regex,
    source: String,
}

impl IgnorePattern {
    pub(super) fn matches(&self, name: &str) -> bool {
        self.regex.find(name).is_some()
    }

    /// `RegExp.prototype.toString`, which messages print.
    pub(super) fn display(&self) -> String {
        format!("/{}/u", escaped_source(&self.source))
    }
}

/// `RegExp.prototype.source`: a `/` outside a class and a line terminator escaped.
fn escaped_source(pattern: &str) -> String {
    let mut out = String::with_capacity(pattern.len());
    let (mut escaped, mut in_class) = (false, false);
    for c in pattern.chars() {
        match c {
            _ if escaped => {
                escaped = false;
                out.push(c);
                continue;
            }
            '\\' => escaped = true,
            '[' => in_class = true,
            ']' => in_class = false,
            '/' if !in_class => out.push('\\'),
            '\n' => {
                out.push_str("\\n");
                continue;
            }
            '\r' => {
                out.push_str("\\r");
                continue;
            }
            '\u{2028}' => {
                out.push_str("\\u2028");
                continue;
            }
            '\u{2029}' => {
                out.push_str("\\u2029");
                continue;
            }
            _ => {}
        }
        out.push(c);
    }
    out
}

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RawObject {
    #[serde(rename = "vars")]
    _vars: Option<Vars>,
    vars_ignore_pattern: Option<String>,
    args: Option<Args>,
    args_ignore_pattern: Option<String>,
    caught_errors: Option<CaughtErrors>,
    caught_errors_ignore_pattern: Option<String>,
    destructured_array_ignore_pattern: Option<String>,
    ignore_rest_siblings: Option<bool>,
    ignore_class_with_static_init_block: Option<bool>,
    ignore_using_declarations: Option<bool>,
    report_used_ignore_pattern: Option<bool>,
    // Fixes, which this rule does not offer: typescript-eslint's and oxlint's.
    #[serde(rename = "enableAutofixRemoval")]
    _enable_autofix_removal: Option<IgnoredAny>,
    #[serde(rename = "fix")]
    _fix: Option<IgnoredAny>,
    // oxlint's switch for a value used only as a type, which typescript-eslint always reports.
    #[serde(rename = "reportVarsOnlyUsedAsTypes")]
    _report_vars_only_used_as_types: Option<bool>,
}

impl NoUnusedVariablesOptions {
    /// The options from the rule's one option, as JSON.
    ///
    /// # Errors
    ///
    /// The option does not have the rule's shape, or a pattern is not a regular expression.
    pub fn from_json(json: &str) -> Result<Self, String> {
        // A string sets `vars` alone; parsing by the first character keeps serde's message.
        if json.trim_start().starts_with('"') {
            serde_json::from_str::<Vars>(json).map_err(|e| e.to_string())?;
            return Ok(Self::default());
        }
        let object: RawObject = serde_json::from_str(json).map_err(|e| e.to_string())?;
        Ok(Self {
            vars_ignore_pattern: pattern(object.vars_ignore_pattern)?,
            args: object.args.unwrap_or_default(),
            args_ignore_pattern: pattern(object.args_ignore_pattern)?,
            caught_errors: object.caught_errors.unwrap_or_default(),
            caught_errors_ignore_pattern: pattern(object.caught_errors_ignore_pattern)?,
            destructured_array_ignore_pattern: pattern(object.destructured_array_ignore_pattern)?,
            ignore_rest_siblings: object.ignore_rest_siblings.unwrap_or_default(),
            ignore_class_with_static_init_block: object
                .ignore_class_with_static_init_block
                .unwrap_or_default(),
            ignore_using_declarations: object.ignore_using_declarations.unwrap_or_default(),
            report_used_ignore_pattern: object.report_used_ignore_pattern.unwrap_or_default(),
        })
    }
}

/// An empty pattern is no pattern, as the rules test the string's truthiness.
fn pattern(source: Option<String>) -> Result<Option<IgnorePattern>, String> {
    let Some(source) = source.filter(|s| !s.is_empty()) else {
        return Ok(None);
    };
    let regex = Regex::with_flags(&source, "u")
        .map_err(|e| format!("invalid regular expression `{source}`: {e}"))?;
    Ok(Some(IgnorePattern { regex, source }))
}
