use super::{RouteFile, route_file_name, under};

#[test]
fn a_route_file_is_named_and_under_the_routes() {
    assert_eq!(route_file_name("a/+page.svelte"), Some(RouteFile::Page));
    assert_eq!(route_file_name("+layout.svelte"), Some(RouteFile::Layout));
    assert_eq!(route_file_name("a\\+error.svelte"), Some(RouteFile::Error));
    assert_eq!(route_file_name("a/page.svelte"), None);
    assert_eq!(route_file_name("a/+page@.svelte"), None);
    assert!(under("src/routes", "src/routes/a/+page.svelte"));
    assert!(under("src/routes/", "./src/routes/+page.svelte"));
    assert!(under("./src/x/../routes", "src/routes/+page.svelte"));
    assert!(!under("src/routes", "src/lib/+page.svelte"));
    assert!(under("", "anything"));
}

/// Without the host's `svelte.config.js`, the routes directory is unknown, so the rule fails
/// rather than assume `src/routes`.
#[test]
fn a_route_rule_fails_without_the_svelte_config() {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::registry::Registry;
    use rsvelte_kernel::diagnostics::Severity;
    use rsvelte_kernel::source::document::Document;

    use crate::{Configuration, LintSettings};

    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new(
        "src/routes/+page.svelte".to_owned(),
        "<script>export let foo;</script>".to_owned(),
    )
    .expect("a small document");
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(
            "svelte/valid-prop-names-in-kit-pages",
            Severity::Error,
            &[],
            &[],
        )
        .expect("a built-in rule");
    let context = DocumentContext::new(&document, registry.artifacts());
    let error = crate::lint(&context, &configuration).expect_err("the rule fails");
    assert!(
        error.message.contains("svelte.config.js"),
        "{}",
        error.message
    );
}
