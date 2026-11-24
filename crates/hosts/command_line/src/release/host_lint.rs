//! `rsvelte lint`: oxlint, with Svelte files linted natively where oxlint sees only their scripts.

use std::any::Any;
use std::io::BufWriter;
use std::panic::AssertUnwindSafe;
use std::path::Path;
use std::process::{ExitCode, Termination};
use std::sync::Arc;

use oxc_diagnostics::OxcDiagnostic;
use oxc_linter::loader::JavaScriptSource;
use oxc_linter::{
    AllowWarnDeny, Fix, FixKind, HostFile, HostLinter, HostPlugin, HostRule, Message,
    PossibleFixes, RuleCategory,
};
use oxc_span::SourceType;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::performance::stack;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_svelte_lint::{Configuration, Directives, LintSettings};
use rsvelte_typescript_semantic::globals::{Declared, Setting};
use serde::Deserialize;
use serde_json::value::{RawValue, to_raw_value};

/// The prefix of the Svelte rules in oxlint's configuration.
const PLUGIN: &str = "svelte";

/// The modules a rule such as `svelte/no-inspect` also runs on, beside components.
const MODULES: &[&str] = &["js", "mjs", "cjs", "jsx", "ts", "mts", "cts", "tsx"];

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
    // oxfmt's, which set up tracing and the thread pool as oxlint's do: each tool guards only its
    // own, and `rsvelte format lint` runs both in one process.
    oxfmt::cli::init_tracing();
    oxfmt::cli::init_rayon(command.misc_options.threads);
    let mut stdout = BufWriter::new(std::io::stdout());
    oxlint::cli::CliRunner::new(command, None)
        .with_hosts(vec![svelte()])
        .with_host_config_loader(super::node_configuration::Node)
        .run(&mut stdout)
        .report()
}

/// The Svelte rules: `svelte/*` by their own name, and the core rules rsvelte runs in a component
/// because they need its template.
pub(super) fn svelte() -> Arc<HostPlugin> {
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
        module_extensions: MODULES.iter().map(|&ext| ext.to_owned()).collect(),
        rules,
        builtin_rules,
        linter: Arc::new(Svelte::new()),
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

/// The linter of every file, with the facts about the files around them it has read.
struct Svelte {
    registry: Registry,
}

impl Svelte {
    fn new() -> Self {
        let mut registry = Registry::new();
        rsvelte_svelte_lint::register_artifacts(&mut registry);
        rsvelte_svelte_lint::project::register_file_system(&mut registry);
        Self { registry }
    }
}

impl HostLinter for Svelte {
    /// The component's `<script module>` and `<script>`, as Svelte reads its markup. oxlint's own
    /// loader also takes a `<script>` in an attribute value, in `{@html}` or in `<svelte:head>`.
    fn scripts<'a>(&self, path: &Path, source_text: &'a str) -> Option<Vec<JavaScriptSource<'a>>> {
        if !is_component(path) {
            return None;
        }
        let component = std::panic::catch_unwind(|| {
            stack::for_text(source_text.len(), || {
                rsvelte_svelte_syntax::parse::parse_without_scripts(source_text)
            })
        });
        // Markup that does not parse has no scripts to lint: the Svelte linter reports it.
        let Ok(Ok(component)) = component else {
            return Some(Vec::new());
        };
        let scripts = (component.scripts())
            .map(|script| {
                let content = script.content;
                let source_type = if script.typescript {
                    SourceType::ts()
                } else {
                    SourceType::mjs()
                };
                let text = &source_text[content.start_offset as usize..content.end_offset as usize];
                JavaScriptSource::partial(text, source_type, content.start_offset)
            })
            .collect();
        Some(scripts)
    }

    fn globals(&self, path: &Path) -> &[&str] {
        let name = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default();
        if name.ends_with(".svelte.js") || name.ends_with(".svelte.ts") {
            &rsvelte_svelte_lint::RUNE_GLOBALS
        } else {
            &[]
        }
    }

    fn check_options(&self, rule: &str, options: &[serde_json::Value]) -> Result<(), String> {
        // As in oxlint, a rule that needs options does nothing without them.
        if options.is_empty() {
            return Ok(());
        }
        let options: Vec<Box<RawValue>> = (options.iter())
            .map(|option| to_raw_value(option).map_err(|e| e.to_string()))
            .collect::<Result<_, _>>()?;
        Configuration::new(LintSettings::default())
            .rule(
                &format!("{PLUGIN}/{rule}"),
                Severity::Warning,
                &options,
                &[],
            )
            .map(drop)
    }

    fn check_settings(
        &self,
        settings: &serde_json::Map<String, serde_json::Value>,
    ) -> Result<(), String> {
        settings.get(PLUGIN).map_or(Ok(()), |settings| {
            LintSettings::deserialize(settings)
                .map(drop)
                .map_err(|e| format!("settings.svelte: {e}"))
        })
    }

    fn lint(&self, file: &HostFile<'_>) -> Vec<Message> {
        if file.rules.is_empty() {
            return Vec::new();
        }
        // oxlint runs a host on its own rayon workers, which neither catch a panic nor have the
        // stack the passes need for deeply nested text.
        std::panic::catch_unwind(AssertUnwindSafe(|| {
            stack::for_text(file.source_text.len(), || self.lint_file(file))
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

impl Svelte {
    fn lint_file(&self, file: &HostFile<'_>) -> Vec<Message> {
        let (path, source_text) = (file.path, file.source_text);
        let configuration = configuration(file);
        let Ok(document) =
            Document::new(path.to_string_lossy().into_owned(), source_text.to_owned())
        else {
            return Vec::new();
        };
        let document = document.read_from(path.to_path_buf());
        let context = DocumentContext::new(&document, self.registry.artifacts());
        let builtin: Vec<&str> = (file.rules.iter())
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
            // oxlint reports a module that does not parse itself.
            Err(_) if !is_component(path) => Vec::new(),
            Err(error) => vec![Message::new(
                diagnostic(error, &builtin),
                PossibleFixes::None,
            )],
        }
    }
}

fn is_component(path: &Path) -> bool {
    path.extension().is_some_and(|ext| ext == "svelte")
}

/// The Svelte linter's configuration of `file`: its rules, `settings.svelte`, the globals `env`
/// and `globals` declare, and oxlint's directive comments. oxlint has checked the options and the
/// settings when it read the configuration.
fn configuration(file: &HostFile<'_>) -> Configuration {
    let settings = (file.settings)
        .and_then(|settings| settings.get(PLUGIN))
        .and_then(|settings| LintSettings::deserialize(settings).ok())
        .unwrap_or_default();
    let mut configuration = Configuration::new(settings);
    configuration.declare_globals(globals(file));
    configuration.directives(Directives::Oxlint {
        report_unused: file.report_unused_directives.map(severity),
    });
    for rule in file.rules {
        let name = if rule.plugin == PLUGIN {
            format!("{PLUGIN}/{}", rule.name)
        } else {
            rule.name.to_owned()
        };
        let options: Vec<Box<RawValue>> = (rule.options.iter())
            .filter_map(|option| to_raw_value(option).ok())
            .collect();
        // A rule that needs options and has none does nothing, as in oxlint, which has checked
        // the options it was given.
        let _needs_options = configuration.rule(&name, severity(rule.severity), &options, &[]);
    }
    configuration
}

const fn severity(severity: AllowWarnDeny) -> Severity {
    match severity {
        AllowWarnDeny::Deny => Severity::Error,
        AllowWarnDeny::Warn | AllowWarnDeny::Allow => Severity::Warning,
    }
}

/// The globals of `file`: those of each environment `env` turns on, from oxlint's own table, and
/// then `globals` over them.
fn globals(file: &HostFile<'_>) -> Declared {
    let environments = (file.env.iter())
        .filter_map(|env| javascript_globals::GLOBALS.get(env))
        .flat_map(|set| {
            set.keys()
                .map(move |&name| (name, Setting::flag(set.get(name) == Some(&true))))
        });
    let configured = file
        .globals
        .iter()
        .map(|&(name, writable)| (name, writable.map_or(Setting::Off, Setting::flag)));
    Declared::with_settings(environments.chain(configured))
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
