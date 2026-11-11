//! The project facts a case's host gives, and the inline cases of `no-conflicting-module-names`.

use std::collections::BTreeMap;
use std::path::Path;

use rsvelte_kernel::computation::file_facts::FileFacts;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_lint::project::SvelteKitProject;
use rsvelte_svelte_lint::{Configuration, LintSettings, SvelteConfig, project};

use super::cases::svelte_config_file;
use super::{Case, LanguageOptions, UPSTREAM, lint, read};

/// The cases of `no-conflicting-module-names`, which upstream writes in
/// `tests/src/rules/no-conflicting-module-names.ts` rather than as fixtures: the rule looks at the
/// files beside the document, so each case lints a real file of the fixture directory, at its
/// absolute path as upstream's do.
pub(super) fn conflicting_module_names(
    counted: &mut BTreeMap<String, (&'static str, String)>,
) -> usize {
    const RULE: &str = "svelte/no-conflicting-module-names";
    if rsvelte_svelte_lint::definition(RULE, &[]).is_none() {
        return 0;
    }
    let root = Path::new(UPSTREAM).join("no-conflicting-module-names");
    let cases = conflicting_module_names_cases();
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(RULE, Severity::Error, &[], &[])
        .expect("the rule takes no options");
    let (mut failed, mut waiting) = (0, 0);
    for (file, code, expected) in &cases {
        let document_name = format!("no-conflicting-module-names/{file}");
        let path = root.join(file);
        let source = code.map_or_else(|| read(&path), str::to_owned);
        let document = Document::new(path.to_str().expect("UTF-8 path").to_owned(), source)
            .expect("a case is small");
        let project = Project::on_disk(&path, None);
        let actual: Vec<(String, u32)> = match lint(&document, &configuration, project) {
            Ok(findings) => findings
                .iter()
                .map(|f| (f.diagnostic.message.clone(), f.diagnostic.span.start_offset))
                .collect(),
            Err(error) => vec![(format!("does not lint: {}", error.message), 0)],
        };
        // Upstream expects line 1, column 1.
        let expected: Vec<(String, u32)> = expected.iter().map(|m| (m.clone(), 0)).collect();
        let pass = actual == expected;
        if let Some((label, reason)) = counted.remove(&document_name) {
            if pass {
                failed += 1;
                eprintln!("STALE {label} {document_name}: passes, but is listed ({reason})");
            } else {
                waiting += 1;
                eprintln!("COUNTED {document_name}: {label} ({reason})");
            }
        } else if !pass {
            failed += 1;
            eprintln!("FAIL {document_name}: expected {expected:?}, found {actual:?}");
        }
    }
    eprintln!(
        "  no-conflicting-module-names (inline cases): {} of {} pass, {failed} fail, {waiting} \
         counted",
        cases.len() - failed - waiting,
        cases.len()
    );
    failed
}

/// Upstream's inline cases of `no-conflicting-module-names`: the file, the code when the file
/// does not exist, and the expected message.
fn conflicting_module_names_cases() -> Vec<(String, Option<&'static str>, Option<String>)> {
    let component = |module: &str| {
        format!(
            "The module `{module}` has the same name as this component. TypeScript resolves the \
             import `./Foo.svelte` to that module, not to this component. Rename `{module}`."
        )
    };
    let module = "This module has the same name as the component `Foo.svelte`. TypeScript \
                  resolves the import `./Foo.svelte` to this module, not to the component. \
                  Rename this file.";
    let mut cases: Vec<(String, Option<&str>, Option<String>)> = vec![
        ("valid/no-sibling/Foo.svelte".to_owned(), None, None),
        ("valid/different-module/Foo.svelte".to_owned(), None, None),
        (
            "valid/declaration-sibling/Foo.svelte".to_owned(),
            None,
            None,
        ),
        (
            "valid/declaration-sibling-d-svelte/Bar.svelte".to_owned(),
            None,
            None,
        ),
        (
            "does-not-exist/Foo.svelte".to_owned(),
            Some("<p>virtual</p>"),
            None,
        ),
        (
            "valid/different-module/foo-state.svelte.ts".to_owned(),
            None,
            None,
        ),
        (
            "valid/declaration-sibling/Foo.svelte.d.ts".to_owned(),
            None,
            None,
        ),
        (
            "valid/declaration-sibling-d-svelte/Bar.d.svelte.ts".to_owned(),
            None,
            None,
        ),
        (
            "does-not-exist/Foo.svelte.ts".to_owned(),
            Some("export const value = 1;"),
            None,
        ),
    ];
    let extensions = ["ts", "tsx", "js", "jsx", "mts", "cts", "mjs", "cjs"];
    for extension in extensions {
        cases.push((
            format!("invalid/{extension}/Foo.svelte"),
            None,
            Some(component(&format!("Foo.svelte.{extension}"))),
        ));
    }
    for extension in extensions {
        cases.push((
            format!("invalid/{extension}/Foo.svelte.{extension}"),
            None,
            Some(module.to_owned()),
        ));
    }
    cases
}

/// `svelte-eslint-parser`'s `svelteConfig` option, else what it reads from the nearest file; the
/// host gives rsvelte the same per document (`SvelteConfiguration`).
pub(super) fn svelte_config(
    case: &Case<'_>,
    language_options: Option<LanguageOptions>,
    javascript: Option<SvelteConfig>,
) -> Result<Option<SvelteConfig>, String> {
    if let Some(c) = language_options
        .and_then(|l| l.parser_options)
        .and_then(|p| p.svelte_config)
    {
        return Ok(Some(SvelteConfig {
            kit: c.kit,
            ..SvelteConfig::default()
        }));
    }
    if javascript.is_some() {
        return Ok(javascript);
    }
    svelte_config_file(&case.input, case.root)
        .map(|file| rsvelte_svelte_lint::svelte_config::parse(&read(&file)))
        .transpose()
}

/// What a host knows of the document's project, as upstream's run of the case sees it.
pub(super) struct Project {
    pub(super) svelte_config: Result<SvelteConfig, String>,
    pub(super) kit: SvelteKitProject,
}

impl Project {
    /// What `ESLint` finds around the file on disk, after a `svelte.config.js` the case gives.
    pub(super) fn on_disk(input: &Path, svelte_config: Option<SvelteConfig>) -> Self {
        // A case is a run of its own, so it reads its files afresh.
        let files = FileFacts::default();
        Self {
            svelte_config: svelte_config
                .map_or_else(|| project::svelte_config_near(&files, input), Ok),
            kit: project::svelte_kit_project(&files, input),
        }
    }
}
