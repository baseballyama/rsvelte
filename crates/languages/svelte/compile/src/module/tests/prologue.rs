use super::{Target, compile};

#[test]
fn a_module_keeps_its_prologue_after_the_runtime_import() {
    // svelte 5.59.1 `compileModule` keeps each directive as a statement where the import ends the
    // prologue; the parentheses keep the same tree.
    let compiled = |path, source| compile(path, source, Target::Client);
    let import = "import * as $ from \"svelte/internal/client\";\n";
    assert_eq!(
        compiled(
            "a.svelte.js",
            "\"use strict\";\n\"other\";\nimport { x } from \"y\";\nexport const a = $state(x);\n"
        ),
        format!(
            "{import}(\"use strict\");\n(\"other\");\nimport {{ x }} from \"y\";\n\
             export const a = $.proxy(x);\n"
        )
    );
    assert_eq!(
        compile("a.svelte.js", "'use strict'\n", Target::Server),
        "import * as $ from \"svelte/internal/server\";\n(\"use strict\");\n"
    );
    // TypeScript's emit puts `"use strict"` first in a script, once.
    assert_eq!(
        compiled("a.svelte.ts", "\"use client\";\nlet a: number = 1;\n"),
        format!("{import}(\"use strict\");\n(\"use client\");\nlet a = 1;\n")
    );
    assert_eq!(
        compiled("a.svelte.ts", "\"use strict\";\nlet a: number = 1;\n"),
        format!("{import}(\"use strict\");\nlet a = 1;\n")
    );
    // A directive's value is its string's: TypeScript 6.0.3 counts `"use\x20strict"` as its own.
    for (path, source, value) in [
        ("a.svelte.js", r#""it\'s";"#, "it's"),
        ("a.svelte.js", "\"a\\u{1F600}b\";", "a\u{1F600}b"),
        ("a.svelte.js", "\"\\\nx\";", "x"),
        ("a.svelte.ts", r#""use\x20strict";"#, "use strict"),
        ("a.svelte.ts", r"'use\u0020strict';", "use strict"),
    ] {
        for (target, runtime) in [(Target::Client, "client"), (Target::Server, "server")] {
            assert_eq!(
                compile(path, &format!("{source}\n"), target),
                format!("import * as $ from \"svelte/internal/{runtime}\";\n(\"{value}\");\n"),
                "{source}"
            );
        }
    }
}

#[test]
fn a_namespace_export_alone_does_not_make_a_module() {
    // TypeScript 6.0.3's emit, which svelte 5.59.1 `compileModule` reads: `export as namespace`
    // is no module syntax, so the script gets the prologue and no `export {}`; an erased
    // `export type` keeps the module one. The enums take the lowering's path.
    let compiled = |source| compile("a.svelte.ts", source, Target::Client);
    let import = "import * as $ from \"svelte/internal/client\";\n";
    assert_eq!(
        compiled("export as namespace N;\nconst a = 1;\n"),
        format!("{import}(\"use strict\");\nconst a = 1;\n")
    );
    assert_eq!(
        compiled("export as namespace N;\nexport type T = 1;\nconst a = 1;\n"),
        format!("{import}const a = 1;\nexport {{}};\n")
    );
    let script = compiled("export as namespace N;\nenum E { A }\n");
    assert!(
        script.starts_with(&format!("{import}(\"use strict\");\n")),
        "{script}"
    );
    assert!(!script.contains("export {}"), "{script}");
    let module = compiled("export type T = 1;\nenum E { A }\n");
    assert!(!module.contains("use strict"), "{module}");
    assert!(module.ends_with("export {};\n"), "{module}");
}
