//! The scripts the plugin keeps as written, as its parser for them throws, and the ones it formats.

use super::*;

#[test]
fn a_script_babel_rejects_is_kept_as_written_and_the_rest_formatted() {
    // Expected output from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    let script = "<script>\n\tfunction f() { continue; }\n\tlet   x =  1\n</script>\n";
    assert_eq!(
        formatted(&format!("{script}<div   class=\"a\"  >{{x+1}}</div>\n")),
        format!("{script}\n<div class=\"a\">{{x + 1}}</div>\n")
    );
    // tsc gives both duplicates one code, and Babel throws only on the private name.
    let script = "<script>\n\tclass A { #a; #a; }\n\tlet   x =  1\n</script>\n";
    assert_eq!(
        formatted(&format!("{script}<p>{{x}}</p>\n")),
        format!("{script}\n<p>{{x}}</p>\n")
    );
    assert_eq!(
        formatted("<script>\n\tlet a; let a;\n</script>\n<p>x</p>\n"),
        "<script>\n  let a;\n  let a;\n</script>\n\n<p>x</p>\n"
    );
    // Babel allows `super` outside every function, and not in one that is no method.
    let script = "<script>\n\tclass C extends B { m() { return function () { super.m(); }; } }\n\
        \tlet   x =  1\n</script>\n";
    assert_eq!(
        formatted(&format!("{script}<p>{{x}}</p>\n")),
        format!("{script}\n<p>{{x}}</p>\n")
    );
    assert_eq!(
        formatted("<script>\n\tsuper.m();\n\tlet   x =  1\n</script>\n<p>{x}</p>\n"),
        "<script>\n  super.m();\n  let x = 1;\n</script>\n\n<p>{x}</p>\n"
    );
    // Babel no longer reads `assert` import attributes; Prettier's TypeScript parser does.
    let script = "<script>\n\timport d from './d.json' assert { type: 'json' };\n</script>\n";
    assert_eq!(
        formatted(&format!("{script}<p>{{d}}</p>\n")),
        format!("{script}\n<p>{{d}}</p>\n")
    );
    assert_eq!(
        formatted(
            "<script lang=\"ts\">\nimport d from './d.json' assert { type: 'json' };\n</script>\n"
        ),
        "<script lang=\"ts\">\n  import d from \"./d.json\" assert { type: \"json\" };\n</script>\n"
    );
    // tsc's checker reports the error, which typescript-estree does not ask for.
    assert_eq!(
        formatted("<script lang=\"ts\">\n\tfunction f() { continue; }\n</script>\n<p>x</p>\n"),
        "<script lang=\"ts\">\n  function f() {\n    continue;\n  }\n</script>\n\n<p>x</p>\n"
    );
    // A name declared twice in the template, which the plugin's parser does not check.
    assert_eq!(
        refusal("{#each xs as x}{@const a = x}{@const a = x}{/each}\n").0,
        "code a module rejects"
    );
}

#[test]
fn each_script_the_plugin_s_parser_throws_on_is_kept_as_written() {
    // Expected output from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1: `babel-ts` throws on
    // both modifier orders, which the compiler rejects too.
    let module = "<script module>\n\tclass C { readonly static a = 1; }\n</script>\n";
    let instance = "<script>\n\tclass D { static private b = 1; }\n\tlet   x =  1\n</script>\n";
    let source_text = format!("{module}{instance}<p   >{{x}}</p>\n");
    assert_eq!(
        crate::task::format(&source_text, &Options::default()).expect("prints"),
        format!("{module}\n{instance}\n<p>{{x}}</p>\n")
    );
    // Babel throws on `accessor declare`, and not on `declare accessor`, which tsc reports as 1243
    // too.
    let source_text = "<script>\n\tclass C { accessor declare a; }\n</script>\n";
    assert_eq!(
        crate::task::format(source_text, &Options::default()).expect("prints"),
        source_text
    );
    // The compiler lets these pass. typescript-eslint throws on its own check of an initializer
    // after `!` and of an ambient generator, and Babel on an optional accessor.
    for source_text in [
        "<script lang=\"ts\">\nlet x!: number = 1;\n</script>\n",
        "<script lang=\"ts\">\ndeclare function* g(): void;\n</script>\n",
        "<script>\n\tclass C {\n\t\taccessor x?: number;\n\t}\n</script>\n",
    ] {
        assert_eq!(
            crate::task::format(source_text, &Options::default()).expect("prints"),
            source_text
        );
    }
}
