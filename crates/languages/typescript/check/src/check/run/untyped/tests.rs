use std::path::Path;

use super::searched;

#[test]
fn only_a_relative_or_rooted_import_outside_node_modules_is_no_search() {
    let linked = Path::new("/w/dep/src/Icon.svelte");
    let installed = Path::new("/w/app/node_modules/dep/src/Icon.svelte");
    let cases = [
        ("./Icon.svelte", linked, false),
        ("../src/Icon.svelte", linked, false),
        (".\\Icon.svelte", linked, false),
        ("/w/dep/src/Icon.svelte", linked, false),
        ("dep/Icon.svelte", linked, true),
        (".dep/Icon.svelte", linked, true),
        ("..dep/Icon.svelte", linked, true),
        ("./Icon.svelte", installed, true),
        ("dep/Icon.svelte", installed, true),
    ];
    for (specifier, module, expected) in cases {
        assert_eq!(
            searched(specifier, module),
            expected,
            "{specifier} {module:?}"
        );
    }
}
