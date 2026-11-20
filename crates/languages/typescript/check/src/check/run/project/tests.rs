use std::path::Path;

use super::reported;
use crate::check::MappedLanguage;

/// svelte-check's rule (`language-server/src/svelte-check.ts`), one file of each kind in and out
/// of `node_modules`, under both settings of `skipLibCheck`.
#[test]
fn a_file_is_reported_as_svelte_check_reports_it() {
    let languages = [MappedLanguage {
        extension: ".svelte",
        content_mapper: "/mapper".into(),
        replaced: Vec::new(),
    }];
    // (file, reported without skipLibCheck, reported with it)
    let cases = [
        ("/p/src/App.svelte", true, true),
        ("/p/node_modules/ui/Button.svelte", false, false),
        ("/p/src/node_modules/ui/Button.svelte", true, true),
        ("/p/src/a.ts", true, true),
        ("/p/node_modules/ui/a.ts", true, true),
        ("/p/src/data.json", true, true),
        ("/p/src/app.d.ts", true, false),
        ("/p/node_modules/ui/index.d.mts", true, false),
        ("/p/node_modules/ui/index.d.cts", true, false),
        ("/p/src/x.d.svelte.ts", true, false),
        ("/p/src/a.js", true, true),
        ("/p/src/a.jsx", true, true),
        ("/p/node_modules/ui/a.js", false, false),
        ("/p/node_modules/ui/a.cjs", false, false),
        ("/p/node_modules/ui/a.mjs", false, false),
        ("/p/node_modules/ui/a.jsx", true, true),
        ("/p/node_modules.js", true, true),
    ];
    for (file, without, with) in cases {
        assert_eq!(
            [false, true].map(|skip| reported(Path::new(file), &languages, skip)),
            [without, with],
            "{file}"
        );
    }
}
