//! `import`/`export … from … with { … }` keeps its attribute clause.
//!
//! esrap 2.3.x moved the attribute tail into a shared `write_import_attributes`
//! and started calling it from the two `export … from` forms as well, where
//! 2.2.x only wrote it for `import`. Expectations are read off `svelte.parse` /
//! `svelte.compile` 5.57.1, not inferred from the import case.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            ..Default::default()
        },
    )
    .expect("compile should succeed")
    .js
    .code
}

const SOURCE: &str = "<script module>\n\
    \texport * from './re-exported.js';\n\
    \texport * from './star-attributes.js' with { type: 'json' };\n\
    \texport { named } from './named.js' with { type: 'json' };\n\
    \timport './side-effect.js' with { type: 'json' };\n\
    \timport data from './default.js' with { type: 'json' };\n\
    </script>\n\
    <p>x</p>";

#[test]
fn every_module_specifier_form_keeps_its_with_clause() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code(SOURCE, generate);
        for expected in [
            "export * from './star-attributes.js' with { type: 'json' };",
            "export { named } from './named.js' with { type: 'json' };",
            "import './side-effect.js' with { type: 'json' };",
            "import data from './default.js' with { type: 'json' };",
        ] {
            assert!(out.contains(expected), "missing `{expected}` in:\n{out}");
        }
        // The attribute-free re-export must not grow an empty clause.
        assert!(
            out.contains("export * from './re-exported.js';"),
            "attribute-free export changed:\n{out}"
        );
        assert!(!out.contains("with {  }"), "empty clause emitted:\n{out}");
    }
}
