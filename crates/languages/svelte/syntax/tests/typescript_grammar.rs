use rsvelte_svelte_syntax::parse::parse;

// Each verdict was checked against svelte 5's `compile`, which parses with acorn-typescript.
#[test]
fn rules_acorn_does_not_check_parse_in_every_host() {
    for source in [
        // TS2368 in the script, an attribute, a block's head and a `{@const}`.
        "<script lang=\"ts\">const f = <string>() => 1;</script>",
        "<script lang=\"ts\">let a: any;</script><p title={<string>() => a}>x</p>",
        "<script lang=\"ts\">let a: any;</script>{#if (<string>() => a)}y{/if}",
        "<script lang=\"ts\">let a: any;</script>{#if 1}{@const c = <string>() => a}{c}{/if}",
        // TS1263 and TS5085.
        "<script lang=\"ts\">let x!: number = 1;</script>",
        "<script lang=\"ts\">type T = [...a?: string[]];</script>",
    ] {
        assert!(parse(source).is_ok(), "{source}");
    }
}

#[test]
fn rules_acorn_checks_stay_errors() {
    for source in [
        // TS1028, TS1049 and TS1257, and an optional rest parameter of a function with a body.
        "<script lang=\"ts\">class C { public public x = 1; }</script>",
        "<script lang=\"ts\">function f(...p?: string[]) {}</script>",
        "<script lang=\"ts\">class C { set x() {} }</script>",
        "<script lang=\"ts\">type T = [a?: string, b: string];</script>",
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "js_parse_error", "{source}");
    }
}

#[test]
fn an_unchecked_rule_does_not_hide_a_later_error() {
    let source = "<script lang=\"ts\">let x!: number = 1; class C { set x() {} }</script>";
    let error = parse(source).expect_err("the setter has no parameter");
    assert_eq!(error.code, "js_parse_error");
    let class = source.find("class").expect("class");
    assert!(error.span.start_offset as usize > class);
}
