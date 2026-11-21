//! `rsvelte lint`: oxlint, with Svelte files linted natively where oxlint sees only their scripts.

use std::any::Any;
use std::io::BufWriter;
use std::panic::AssertUnwindSafe;
use std::path::Path;
use std::process::{ExitCode, Termination};
use std::sync::Arc;

use oxc_diagnostics::OxcDiagnostic;
use oxc_linter::{
    AllowWarnDeny, EnabledHostRule, Fix, FixKind, HostLinter, HostPlugin, HostRule, Message,
    PossibleFixes, RuleCategory,
};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::performance::stack;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_svelte_lint::{Configuration, LintSettings};
use serde_json::value::{RawValue, to_raw_value};

/// The prefix of the Svelte rules in oxlint's configuration.
const PLUGIN: &str = "svelte";

/// Runs oxlint's command line over `arguments`, the words after `lint`.
pub(crate) fn lint(arguments: &[String]) -> ExitCode {
    let arguments: Vec<&str> = arguments.iter().map(String::as_str).collect();
    let command = match oxlint::cli::lint_command()
        .run_inner(bpaf::Args::from(arguments.as_slice()).set_name("rsvelte lint"))
    {
        Ok(command) => command,
        Err(failure) => {
            failure.print_message(100);
            return ExitCode::from(u8::try_from(failure.exit_code()).unwrap_or(2));
        }
    };
    oxlint::cli::init_tracing();
    command.handle_threads();
    let mut stdout = BufWriter::new(std::io::stdout());
    oxlint::cli::CliRunner::new(command, None)
        .with_hosts(vec![svelte()])
        .run(&mut stdout)
        .report()
}

/// The Svelte rules: `svelte/*` by their own name, and the core rules rsvelte runs in a component
/// because they need its template.
fn svelte() -> Arc<HostPlugin> {
    let mut rules = Vec::new();
    let mut builtin_rules = Vec::new();
    for rule in rsvelte_svelte_lint::reporting_rules() {
        match rule.name.strip_prefix("svelte/") {
            Some(name) => rules.push(HostRule {
                name: name.to_owned(),
                category: category(rule.category),
            }),
            None if !rule.name.contains('/') => {
                builtin_rules.push(("eslint".to_owned(), rule.name.to_owned()));
            }
            None => {}
        }
    }
    Arc::new(HostPlugin {
        name: PLUGIN.to_owned(),
        extensions: vec!["svelte".to_owned()],
        rules,
        builtin_rules,
        linter: Arc::new(Svelte),
    })
}

const fn category(category: Category) -> RuleCategory {
    match category {
        Category::Correctness => RuleCategory::Correctness,
        Category::Suspicious => RuleCategory::Suspicious,
        Category::Pedantic => RuleCategory::Pedantic,
        Category::Perf => RuleCategory::Perf,
        Category::Style => RuleCategory::Style,
        Category::Restriction => RuleCategory::Restriction,
        Category::Nursery => RuleCategory::Nursery,
    }
}

struct Svelte;

impl HostLinter for Svelte {
    fn lint(&self, path: &Path, source_text: &str, rules: &[EnabledHostRule<'_>]) -> Vec<Message> {
        if rules.is_empty() {
            return Vec::new();
        }
        // oxlint runs a host on its own rayon workers, which neither catch a panic nor have the
        // stack the passes need for deeply nested text.
        std::panic::catch_unwind(AssertUnwindSafe(|| {
            stack::for_text(source_text.len(), || {
                lint_component(path, source_text, rules)
            })
        }))
        .unwrap_or_else(|panic| {
            vec![Message::new(
                OxcDiagnostic::error(format!(
                    "the Svelte linter panicked: {}",
                    panic_message(&*panic)
                )),
                PossibleFixes::None,
            )]
        })
    }
}

fn lint_component(path: &Path, source_text: &str, rules: &[EnabledHostRule<'_>]) -> Vec<Message> {
    let mut configuration = Configuration::new(LintSettings::default());
    for rule in rules {
        let name = if rule.plugin == PLUGIN {
            format!("{PLUGIN}/{}", rule.name)
        } else {
            rule.name.to_owned()
        };
        let options: Vec<Box<RawValue>> = rule
            .options
            .iter()
            .filter_map(|option| to_raw_value(option).ok())
            .collect();
        let severity = match rule.severity {
            AllowWarnDeny::Deny => Severity::Error,
            _ => Severity::Warning,
        };
        // As in oxlint, a rule that needs options does nothing when a category turns it on.
        if let Err(error) = configuration.rule(&name, severity, &options, &[])
            && !rule.options.is_empty()
        {
            return vec![Message::new(
                OxcDiagnostic::error(error),
                PossibleFixes::None,
            )];
        }
    }
    let Ok(document) = Document::new(path.to_string_lossy().into_owned(), source_text.to_owned())
    else {
        return Vec::new();
    };
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    let context = DocumentContext::new(&document, registry.artifacts());
    let builtin: Vec<&str> = (rules.iter())
        .filter(|rule| rule.plugin != PLUGIN)
        .map(|rule| rule.name)
        .collect();
    match rsvelte_svelte_lint::lint(&context, &configuration) {
        Ok(findings) => findings
            .into_iter()
            .map(|finding| {
                let fixes = match finding.fix.and_then(|fix| fix.merged(source_text)) {
                    Some(edit) => {
                        let mut fix = Fix::new(edit.text, span(edit.span));
                        fix.kind = FixKind::SafeFix;
                        PossibleFixes::Single(fix)
                    }
                    None => PossibleFixes::None,
                };
                Message::new(diagnostic(finding.diagnostic, &builtin), fixes)
            })
            .collect(),
        Err(error) => vec![Message::new(
            diagnostic(error, &builtin),
            PossibleFixes::None,
        )],
    }
}

/// oxlint's form of a finding: `svelte(rule)` or `eslint(rule)` as the code.
fn diagnostic(diagnostic: Diagnostic, builtin: &[&str]) -> OxcDiagnostic {
    let message = diagnostic.message;
    let reported = match diagnostic.severity {
        Severity::Error => OxcDiagnostic::error(message),
        Severity::Warning => OxcDiagnostic::warn(message),
    };
    let (scope, rule) = match diagnostic.code.split_once('/') {
        Some((PLUGIN, rule)) => (PLUGIN, rule.to_owned()),
        _ if builtin.contains(&diagnostic.code.as_ref()) => {
            ("eslint", diagnostic.code.into_owned())
        }
        // A parse error, or a Svelte compiler code.
        _ => (PLUGIN, diagnostic.code.into_owned()),
    };
    reported
        .with_error_code(scope, rule)
        .with_label(span(diagnostic.span))
}

const fn span(span: rsvelte_kernel::source::positions::Span) -> oxc_span::Span {
    oxc_span::Span::new(span.start_offset, span.end_offset)
}

fn panic_message(panic: &(dyn Any + Send)) -> &str {
    panic
        .downcast_ref::<&str>()
        .copied()
        .or_else(|| panic.downcast_ref::<String>().map(String::as_str))
        .unwrap_or("no message")
}
