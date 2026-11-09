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
