//! `rsvelte typecheck` of files whose lines end in other ways than `\n`.

use crate::typecheck::Native;
use crate::typecheck_events::check;

const LEAF: &str = "<script lang=\"ts\">\n\tlet { label }: { label: string } = $props();\n</script>\n\
                    {label}\n";
const SCRIPT: &str = "<script lang=\"ts\">\n\timport Leaf from \"./Leaf.svelte\";\n\
                      \tlet n = 1;\n</script>\n";

/// TypeScript counts a line at each of ECMAScript's terminators, and svelte-check those that end
/// at `\n` in a component. svelte-check 4.7.8 reports these lines.
#[test]
fn typecheck_places_findings_on_lines_of_every_terminator() {
    let template = |line: &str| format!("{SCRIPT}{line}\n");
    let types =
        |end: &str| format!("export const a: string ={end}1;{end}export const b: string = 2;\n");
    let plain = |end: &str| format!("{}/* {end} */ export const c: string = 3;\n", types(end));
    let whole = template("<Leaf\n\tlabel=\"x\">t</Leaf>\n<p>{nope}</p>").replace('\n', "\r\n");
    let mixed = format!(
        "{}<p>\n\u{2028}</p>\r\n<p>{{nope}}</p>\u{2028}{{nope2}}\n",
        SCRIPT.replace('\n', "\r\n")
    );
    let report = check(&[
        ("src/Leaf.svelte", LEAF),
        ("src/ExprLS.svelte", &template("{nope +\u{2028}nope2}")),
        ("src/MixedLS.svelte", &mixed),
        (
            "src/ScriptLS.svelte",
            "<script lang=\"ts\">\n\tlet a: string =\u{2028}1;\u{2028}let b: string = \
             2;\n</script>\n{a}{b}\n",
        ),
        (
            "src/TagNameCRLF.svelte",
            &template("<Leaf\r\nlabel=\"x\">t</Leaf>"),
        ),
        (
            "src/TagNameLS.svelte",
            &template("<Leaf\u{2028}label=\"x\">t</Leaf>"),
        ),
        (
            "src/TplBeforeLS.svelte",
            &template("<p>a\u{2028}b {nope}</p>"),
        ),
        (
            "src/TplBeforePS.svelte",
            &template("<p>a\u{2029}b {nope}</p>"),
        ),
        ("src/WholeCRLF.svelte", &whole),
        ("src/plainCR.ts", &plain("\r")),
        ("src/plainLS.ts", &plain("\u{2028}")),
        ("src/runPS.svelte.ts", &types("\u{2029}")),
    ]);
    let children = "error TS2353: Object literal may only specify known properties, and \
                    'children' does not exist in type '$$ComponentProps'.";
    let nope = "error TS2304: Cannot find name 'nope'.";
    let nope2 = "error TS2304: Cannot find name 'nope2'.";
    let number = "error TS2322: Type 'number' is not assignable to type 'string'.";
    assert_eq!(
        report,
        format!(
            "src/ExprLS.svelte(5,2): {nope}\n\
             src/ExprLS.svelte(5,9): {nope2}\n\
             src/MixedLS.svelte(7,5): {nope}\n\
             src/MixedLS.svelte(7,16): {nope2}\n\
             src/ScriptLS.svelte(2,6): {number}\n\
             src/ScriptLS.svelte(2,25): {number}\n\
             src/TagNameCRLF.svelte(5,7): {children}\n\
             src/TagNameLS.svelte(5,13): {children}\n\
             src/TplBeforeLS.svelte(5,9): {nope}\n\
             src/TplBeforePS.svelte(5,9): {nope}\n\
             src/WholeCRLF.svelte(5,7): {children}\n\
             src/WholeCRLF.svelte(7,5): {nope}\n\
             src/plainCR.ts(1,14): {number}\n\
             src/plainCR.ts(3,14): {number}\n\
             src/plainCR.ts(5,18): {number}\n\
             src/plainLS.ts(1,14): {number}\n\
             src/plainLS.ts(3,14): {number}\n\
             src/plainLS.ts(5,18): {number}\n\
             src/runPS.svelte.ts(1,14): {number}\n\
             src/runPS.svelte.ts(3,14): {number}\n\
             \nFound 20 errors in 11 files.\n"
        )
        .native()
    );
}

/// svelte-check 4.7.8 drops the first and places the second at 3:1, see `DIVERGENCES.md` in the
/// check crate.
#[test]
fn typecheck_reports_a_component_s_findings_after_a_lone_carriage_return() {
    let report = check(&[
        ("src/Leaf.svelte", LEAF),
        (
            "src/Template.svelte",
            &format!("{SCRIPT}<p>a\rb {{nope}}</p>\n"),
        ),
        (
            "src/Script.svelte",
            "<script lang=\"ts\">\n\t/* c\rd */ let b: string = 2;\n</script>\n{b}\n",
        ),
    ]);
    assert_eq!(
        report,
        "src/Script.svelte(2,16): error TS2322: Type 'number' is not assignable to type \
         'string'.\n\
         src/Template.svelte(5,9): error TS2304: Cannot find name 'nope'.\n\
         \nFound 2 errors in 2 files.\n"
            .native()
    );
}
