//! Official copies the text BETWEEN a mustache's braces into its output; rsvelte
//! copied the expression node's own span. Anything the braces hold that the node
//! does not — a comment, a newline, plain padding — was therefore dropped, so
//! `class="x {// c\na} z"` lost the comment and `class="x { a } z"` lost the two
//! spaces.
//!
//! The axis is the mustache interior against the expression span, NOT "a comment
//! is dropped": the ratchet entry named a comment, and of the 25 cells the fix
//! moves, 10 carry none.
//!
//! The hosts are crossed in because the interior reaches a template literal
//! through two ports. Reverting only the string builder leaves the 10
//! `<slot>` / named-slot-element cells failing; reverting only the segment
//! builder leaves the 15 element / `style` / component cells failing; reverting
//! both leaves 25. The remaining hosts — a lone-mustache value, a text
//! mustache, an `on:` handler — never enter a template literal and are the
//! controls.
//!
//! Each expectation is the template body of the pinned
//! `submodules/language-tools` svelte2tsx's own output for that source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn template_body(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    const OPEN: &str = "async () => {\n";
    let start = code.find(OPEN).expect("render body") + OPEN.len();
    let end = code[start..]
        .find("\nreturn { props:")
        .expect("render body end")
        + start;
    code[start..end].to_string()
}

#[test]
fn a_mustache_carries_its_interior_not_its_expression_span() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "quoted concat, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"x {a} z\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":`x ${a} z`,});  }};",
        ),
        (
            "quoted concat, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"x { a } z\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":`x ${ a } z`,});  }};",
        ),
        (
            "quoted concat, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"x {\na\n} z\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":`x ${\na\n} z`,});  }};",
        ),
        (
            "quoted concat, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"x {// why\na} z\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":`x ${// why\na} z`,});  }};",
        ),
        (
            "quoted concat, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"x {/* why */ a} z\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":`x ${/* why */ a} z`,});  }};",
        ),
        (
            "quoted concat, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"x {a /* why */} z\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":`x ${a /* why */} z`,});  }};",
        ),
        (
            "bare attr, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class={a}>c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "bare attr, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class={ a }>c</button>",
            "  { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "bare attr, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class={\na\n}>c</button>",
            "  { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "bare attr, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class={// why\na}>c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "bare attr, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class={/* why */ a}>c</button>",
            " { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "bare attr, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class={a /* why */}>c</button>",
            " { svelteHTML.createElement(\"button\", {  \"class\":a,});  }};",
        ),
        (
            "quoted only, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"{a}\">c</button>",
            "  { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "quoted only, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"{ a }\">c</button>",
            " { svelteHTML.createElement(\"button\", {  \"class\":a,});  }};",
        ),
        (
            "quoted only, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"{\na\n}\">c</button>",
            " { svelteHTML.createElement(\"button\", {  \"class\":a,});  }};",
        ),
        (
            "quoted only, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"{// why\na}\">c</button>",
            "  { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "quoted only, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"{/* why */ a}\">c</button>",
            "  { svelteHTML.createElement(\"button\", { \"class\":a,});  }};",
        ),
        (
            "quoted only, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button class=\"{a /* why */}\">c</button>",
            " { svelteHTML.createElement(\"button\", {  \"class\":a,});  }};",
        ),
        (
            "style attr, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button style=\"top: {a}px\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"style\":`top: ${a}px`,});  }};",
        ),
        (
            "style attr, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button style=\"top: { a }px\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"style\":`top: ${ a }px`,});  }};",
        ),
        (
            "style attr, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button style=\"top: {\na\n}px\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"style\":`top: ${\na\n}px`,});  }};",
        ),
        (
            "style attr, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button style=\"top: {// why\na}px\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"style\":`top: ${// why\na}px`,});  }};",
        ),
        (
            "style attr, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button style=\"top: {/* why */ a}px\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"style\":`top: ${/* why */ a}px`,});  }};",
        ),
        (
            "style attr, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button style=\"top: {a /* why */}px\">c</button>",
            " { svelteHTML.createElement(\"button\", { \"style\":`top: ${a /* why */}px`,});  }};",
        ),
        (
            "component attr, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C name=\"x {a} z\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"name\":`x ${a} z`,}});}};",
        ),
        (
            "component attr, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C name=\"x { a } z\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"name\":`x ${ a } z`,}});}};",
        ),
        (
            "component attr, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C name=\"x {\na\n} z\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"name\":`x ${\na\n} z`,}});}};",
        ),
        (
            "component attr, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C name=\"x {// why\na} z\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"name\":`x ${// why\na} z`,}});}};",
        ),
        (
            "component attr, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C name=\"x {/* why */ a} z\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"name\":`x ${/* why */ a} z`,}});}};",
        ),
        (
            "component attr, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C name=\"x {a /* why */} z\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"name\":`x ${a /* why */} z`,}});}};",
        ),
        (
            "slot element attr, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<slot foo=\"x {a} z\" />",
            " { __sveltets_createSlot(\"default\", {  \"foo\":`x ${a} z`,});}};",
        ),
        (
            "slot element attr, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<slot foo=\"x { a } z\" />",
            " { __sveltets_createSlot(\"default\", {  \"foo\":`x ${ a } z`,});}};",
        ),
        (
            "slot element attr, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<slot foo=\"x {\na\n} z\" />",
            " { __sveltets_createSlot(\"default\", {  \"foo\":`x ${\na\n} z`,});}};",
        ),
        (
            "slot element attr, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<slot foo=\"x {// why\na} z\" />",
            " { __sveltets_createSlot(\"default\", {  \"foo\":`x ${// why\na} z`,});}};",
        ),
        (
            "slot element attr, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<slot foo=\"x {/* why */ a} z\" />",
            " { __sveltets_createSlot(\"default\", {  \"foo\":`x ${/* why */ a} z`,});}};",
        ),
        (
            "slot element attr, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<slot foo=\"x {a /* why */} z\" />",
            " { __sveltets_createSlot(\"default\", {  \"foo\":`x ${a /* why */} z`,});}};",
        ),
        (
            "named-slot element attr, bare",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C><button slot=\"s\" class=\"x {a} z\">c</button></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"class\":`x ${a} z`,});  }} C}};",
        ),
        (
            "named-slot element attr, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C><button slot=\"s\" class=\"x { a } z\">c</button></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"class\":`x ${ a } z`,});  }} C}};",
        ),
        (
            "named-slot element attr, newlines",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C><button slot=\"s\" class=\"x {\na\n} z\">c</button></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"class\":`x ${\na\n} z`,});  }} C}};",
        ),
        (
            "named-slot element attr, line comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C><button slot=\"s\" class=\"x {// why\na} z\">c</button></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"class\":`x ${// why\na} z`,});  }} C}};",
        ),
        (
            "named-slot element attr, block comment before",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C><button slot=\"s\" class=\"x {/* why */ a} z\">c</button></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"class\":`x ${/* why */ a} z`,});  }} C}};",
        ),
        (
            "named-slot element attr, block comment after",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<C><button slot=\"s\" class=\"x {a /* why */} z\">c</button></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"class\":`x ${a /* why */} z`,});  }} C}};",
        ),
        (
            "text mustache, line comment",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<p>{// why\na}</p>",
            " { svelteHTML.createElement(\"p\", {});// why\na; }};",
        ),
        (
            "text mustache, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<p>{ a }</p>",
            " { svelteHTML.createElement(\"p\", {}); a ; }};",
        ),
        (
            "on:click, line comment",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button on:click={// why\na}>c</button>",
            " { svelteHTML.createElement(\"button\", {  \"on:click\":a,});  }};",
        ),
        (
            "on:click, spaces",
            "<script lang=\"ts\">import C from './C.svelte';let a: any = 1;</script>\n<button on:click={ a }>c</button>",
            "  { svelteHTML.createElement(\"button\", {  \"on:click\":a,});  }};",
        ),
    ] {
        let actual = template_body(src);
        if actual != expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of 46 cells diverge from official:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
