use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

/// How many times `svelte/no-inspect`, which runs only in runes mode, reports.
fn inspect_reports(source_text: &str) -> usize {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule("svelte/no-inspect", Severity::Error, &[], &[])
        .expect("a known rule");
    crate::lint(&context, &configuration)
        .expect("source parses")
        .len()
}

#[test]
fn a_rune_named_in_the_template_alone_turns_runes_mode_on() {
    // ESLint with eslint-plugin-svelte reports this once: `hasRunesSymbol` walks the template.
    assert_eq!(inspect_reports("<p>{$inspect}</p>\n"), 1);
    assert_eq!(inspect_reports("<p>{inspect}</p>\n"), 0);
}

#[test]
fn a_boolean_svelte_options_runes_decides_before_the_symbols() {
    let source = "<svelte:options runes={false} />\n<p>{$inspect}</p>\n";
    assert_eq!(inspect_reports(source), 0);
    let source = "<svelte:options runes />\n<script>\n$inspect(1);\n</script>\n";
    assert_eq!(inspect_reports(source), 1);
}

/// The reports of `rule` with a `svelte.config.js` whose `compilerOptions.runes` is `runes`.
fn reports_with_config_runes(rule: &str, source_text: &str, runes: Option<bool>) -> Vec<String> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    registry.provide::<crate::computation::SvelteConfiguration>(
        "svelte",
        |_| true,
        move |_| {
            Ok(crate::SvelteConfig {
                runes,
                ..crate::SvelteConfig::default()
            })
        },
    );
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule(rule, Severity::Error, &[], &[])
        .expect("a known rule");
    crate::lint(&context, &configuration)
        .expect("source parses")
        .into_iter()
        .map(|finding| finding.diagnostic.message)
        .collect()
}

#[test]
fn compiler_options_runes_decides_after_svelte_options_and_before_the_symbols() {
    let inspect = "<script>\nlet a = 1;\n</script>\n<p>{a}</p>\n{#if a}{@const b = 1}{b}{/if}\n";
    assert_eq!(
        reports_with_config_runes("svelte/no-at-const-tags", inspect, None).len(),
        0
    );
    assert_eq!(
        reports_with_config_runes("svelte/no-at-const-tags", inspect, Some(true)).len(),
        1
    );
    let legacy = format!("<svelte:options runes={{false}} />\n{inspect}");
    assert_eq!(
        reports_with_config_runes("svelte/no-at-const-tags", &legacy, Some(true)).len(),
        0
    );
    let runes = "<script>\nlet a = $state(1);\n</script>\n{#if a}{@const b = 1}{b}{/if}\n";
    assert_eq!(
        reports_with_config_runes("svelte/no-at-const-tags", runes, Some(false)).len(),
        0
    );
}

#[test]
fn valid_compile_does_not_compile_with_compiler_options_runes() {
    // eslint-plugin-svelte 3.23.1 passes only `experimental.async` to the compiler.
    let source = "<script>\nexport let a = 1;\n</script>\n{a}\n";
    let reports = reports_with_config_runes("svelte/valid-compile", source, Some(true));
    assert_eq!(reports, Vec::<String>::new());
}
