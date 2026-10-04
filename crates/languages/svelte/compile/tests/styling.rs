#![expect(
    clippy::literal_string_with_formatting_args,
    reason = "CSS rule braces are literal test inputs"
)]

use rsvelte_svelte::compilation::compiler_syntax_tree;
use rsvelte_svelte::semantic::{analyze, resolve};
use rsvelte_svelte_compile::{OutputIdentity, stylesheet};

fn scope_rules(markup: &str, rules: &str) -> String {
    let source = format!("{markup}<style>{rules}</style>");
    let component = rsvelte_svelte::syntax::parse::parse(&source).expect("valid component");
    let tree = compiler_syntax_tree::lower(&component, &source);
    let input = rsvelte_svelte::svelte_input(&component, &tree, &source, "test.svelte");
    let resolution = resolve::resolve_with_module(
        &component.javascript,
        component.program,
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    stylesheet::scoped_stylesheet(
        &input,
        &analysis,
        &OutputIdentity {
            name: "Test".into(),
            head_hash: None,
            stylesheet_hash: Some("svelte-h".into()),
        },
    )
    .expect("a stylesheet")
}

#[test]
fn selectors_and_specificity() {
    for (markup, input, expected) in [
        ("<p></p>", "p{color:red}", "p.svelte-h{color:red}"),
        (
            "<div><p></p></div>",
            "div p{color:red}",
            "div.svelte-h p:where(.svelte-h){color:red}",
        ),
        (
            "<p></p>",
            "p:hover::before{color:red}",
            "p.svelte-h:hover::before{color:red}",
        ),
        ("<p></p>", "*{color:red}", ".svelte-h{color:red}"),
        (
            "<p></p>",
            "p,div{color:red}",
            "p.svelte-h /* (unused) div*/{color:red}",
        ),
        (
            "<p></p>",
            "q,p{color:red}",
            "/* (unused) q,*/p.svelte-h{color:red}",
        ),
        (
            "<p></p>",
            ":is(p,q){color:red}",
            ":is(p.svelte-h /* (unused) q*/){color:red}",
        ),
        (
            "<p></p>",
            ":where(p,q){color:red}",
            ":where(p.svelte-h /* (unused) q*/){color:red}",
        ),
        ("<p></p>", ":root{color:red}", ":root{color:red}"),
        (
            "<p></p>",
            "p:not(.missing){color:red}",
            "p.svelte-h:not(.missing){color:red}",
        ),
    ] {
        assert_eq!(scope_rules(markup, input), expected, "{input}");
    }
}

#[test]
fn dom_candidates_do_not_leak_between_documents() {
    for _ in 0..2 {
        assert_eq!(
            scope_rules("<p/><p/>", "p{color:red}"),
            "p.svelte-h{color:red}"
        );
        assert_eq!(
            scope_rules("<Component/>", "p{color:red}"),
            "/* (unused) p{color:red}*/"
        );
        assert_eq!(
            scope_rules("<Component/><p/>", "p{color:red}"),
            "p.svelte-h{color:red}"
        );
    }
}

#[test]
fn spreads_and_empty_classes_match_the_oracle() {
    let input = ".missing{color:red}.a{color:blue}[class]{color:yellow}";
    for markup in [
        r#"<p {...attrs} class={"a"}/>"#,
        r#"<p class={"a"} {...attrs}/>"#,
        r#"<p {...attrs} class={["a"]}/>"#,
        r#"<p class={["a"]} {...attrs}/>"#,
        r#"<p class="a" {...attrs}/>"#,
    ] {
        assert_eq!(
            scope_rules(markup, input),
            concat!(
                ".missing.svelte-h{color:red}.a.svelte-h{color:blue}",
                "[class].svelte-h{color:yellow}"
            ),
            "{markup}"
        );
    }
    assert_eq!(
        scope_rules("<p class={[]}/>", input),
        concat!(
            "/* (unused) .missing{color:red}*//* (unused) .a{color:blue}*/",
            "[class].svelte-h{color:yellow}"
        )
    );
    assert_eq!(
        scope_rules(r#"<p CLASS={["a"]}/>"#, input),
        concat!(
            "/* (unused) .missing{color:red}*/.a.svelte-h{color:blue}",
            "[class].svelte-h{color:yellow}"
        )
    );
}

#[test]
fn global_and_nested_rules() {
    for (markup, input, expected) in [
        ("", ":global(body){color:red}", "body{color:red}"),
        (
            "<p></p>",
            ":global(body) p{color:red}",
            "body p.svelte-h{color:red}",
        ),
        (
            "<p></p>",
            "p :global(span){color:red}",
            "p.svelte-h span{color:red}",
        ),
        (
            "",
            ":global{body{color:red}}",
            "/* :global{*/body{color:red}/*}*/",
        ),
        (
            "<p></p>",
            "p{color:red; &:hover{color:blue}}",
            "p.svelte-h{color:red; &:hover{color:blue}}",
        ),
        ("<p></p>", "p{q{color:red}}", "/* (empty) p{q{color:red}}*/"),
        (
            "<p><span></span></p>",
            "p:has(> span){color:red}",
            "p.svelte-h:has(> span:where(.svelte-h)){color:red}",
        ),
        (
            "<p><span></span></p>",
            "p:has(q){color:red}",
            "/* (unused) p:has(q){color:red}*/",
        ),
    ] {
        assert_eq!(scope_rules(markup, input), expected, "{input}");
    }
}

#[test]
fn local_and_global_keyframes() {
    assert_eq!(
        scope_rules(
            "<p></p>",
            "@keyframes bounce {from {opacity:0} to {opacity:1}} p{animation:bounce 1s}"
        ),
        concat!(
            "@keyframes svelte-h-bounce {from {opacity:0} to {o",
            "pacity:1}} p.svelte-h{animation:svelte-h-bounce 1s",
            "}",
        )
    );
    assert_eq!(
        scope_rules(
            "<p></p>",
            "@keyframes -global-spin {to{opacity:1}} p{animation-name:spin}"
        ),
        "@keyframes spin {to{opacity:1}} p.svelte-h{animation-name:spin}"
    );
    assert_eq!(
        scope_rules(
            "<p></p>",
            "@keyframes bounce{to{opacity:1}} q{animation:bounce 1s}"
        ),
        "@keyframes svelte-h-bounce{to{opacity:1}} /* (unused) q{animation:bounce 1s}*/"
    );
}

#[test]
fn comments_in_pruned_rules_remain_valid_css() {
    assert_eq!(
        scope_rules("<p></p>", "q{/* note */color:red}"),
        "/* (unused) q{/* note *\\/color:red}*/"
    );
    assert_eq!(
        scope_rules("<p></p>", "p{/* note */}"),
        "/* (empty) p{/* note *\\/}*/"
    );
}

#[test]
fn attributes_and_template_relations_match_the_oracle() {
    for (markup, input, expected) in [
        (
            "<input type=\"BUTTON\" data-x=\"ABC\"/>",
            "[type=\"button\"],[data-x=\"abc\" i],[data-x=\"abc\" s]{color:red}",
            concat!(
                "[type=\"button\"].svelte-h,[data-x=\"abc\" i].svelte-h",
                " /* (unused) [data-x=\"abc\" s]*/{color:red}",
            ),
        ),
        (
            "<p class={[\"yes\", {maybe:false}]}></p>",
            ".yes,.maybe,.no{color:red}",
            ".yes.svelte-h,.maybe.svelte-h /* (unused) .no*/{color:red}",
        ),
        (
            "<p class=\"pre-{true ? 'yes' : 'no'}\"></p>",
            ".pre-yes,.pre-no,.missing{color:red}",
            ".pre-yes.svelte-h,.pre-no.svelte-h /* (unused) .missing*/{color:red}",
        ),
        (
            "<div><p></p></div><p></p>",
            "div > p{color:red}",
            "div.svelte-h > p:where(.svelte-h){color:red}",
        ),
        (
            "<p></p>{#if true}<q></q>{:else}<i></i>{/if}<b></b>",
            "p + q, q + i, q + b, i + b{color:red}",
            concat!(
                "p.svelte-h + q:where(.svelte-h) /* (unused) q + i*",
                "/, q.svelte-h + b:where(.svelte-h), i.svelte-h + b",
                ":where(.svelte-h){color:red}",
            ),
        ),
        (
            "{#each [1,2] as n}<p></p>{/each}",
            "p + p{color:red}",
            "p.svelte-h + p:where(.svelte-h){color:red}",
        ),
        (
            "{#snippet content()}<p></p>{/snippet}<div>{@render content()}</div>",
            "div > p{color:red}",
            "div.svelte-h > p:where(.svelte-h){color:red}",
        ),
        (
            "{#snippet content(n)}<p>{@render content(n - 1)}</p>{/snippet}{@render content(2)}",
            "p > p{color:red}",
            "p.svelte-h > p:where(.svelte-h){color:red}",
        ),
        (
            "<div><i></i></div><p></p>",
            "p:has(i){color:red}",
            "/* (unused) p:has(i){color:red}*/",
        ),
        (
            "<p></p><i><b></b></i>",
            "p:has(+ i > b){color:red}",
            "p.svelte-h:has(+ i:where(.svelte-h) > b:where(.svelte-h)){color:red}",
        ),
        (
            "<p></p>",
            "@media (width > 1px){p{color:red;q{color:blue}}}",
            "@media (width > 1px){p.svelte-h{color:red;/* (unused) q{color:blue}*/}}",
        ),
        (
            "<p></p>",
            ":global{body :global(.x){color:red}}",
            "/* :global{*/body .x{color:red}/*}*/",
        ),
        (
            "<p class=\"a:b\"></p>",
            ".a\\:b{color:red}",
            ".a\\:b.svelte-h{color:red}",
        ),
        (
            "<svg><circle></circle></svg>",
            "svg|circle{fill:red}",
            "svg|circle.svelte-h{fill:red}",
        ),
    ] {
        assert_eq!(scope_rules(markup, input), expected, "{markup}: {input}");
    }
}

#[test]
fn escaped_attribute_values_are_decoded_before_matching() {
    assert_eq!(
        scope_rules("<p data-x=\"A\"></p>", r#"[data-x="\41"]{color:red}"#),
        r#"[data-x="\41"].svelte-h{color:red}"#,
    );
    assert_eq!(
        scope_rules("<p data-x=\"a:b\"></p>", r#"[data-x="a\:b"]{color:red}"#),
        r#"[data-x="a\:b"].svelte-h{color:red}"#,
    );
}

#[test]
fn comment_closers_in_strings_cannot_end_pruning_comments() {
    assert_eq!(
        scope_rules("<p></p>", r#"q{content:"\*/"}"#),
        r#"/* (unused) q{content:"\*\/"}*/"#,
    );
}

#[test]
fn attribute_directives_and_boolean_values_match_the_oracle() {
    for (markup, input, expected) in [
        (
            "<p hidden></p>",
            "[hidden=\"\"]{color:red}",
            "/* (unused) [hidden=\"\"]{color:red}*/",
        ),
        (
            "<p class:x={false}></p>",
            "[class=\"x\"],[class~=\"x\"],[class~=\"y\"]{color:red}",
            concat!(
                "[class=\"x\"].svelte-h,[class~=\"x\"].svelte-h /* (unu",
                "sed) [class~=\"y\"]*/{color:red}",
            ),
        ),
        (
            "<p style:color=\"red\"></p>",
            "[style=\"x\"]{color:red}",
            "[style=\"x\"].svelte-h{color:red}",
        ),
        (
            "<p class=\"a\" class:x={false}></p>",
            "[class=\"x\"],[class~=\"x\"],[class~=\"y\"]{color:red}",
            concat!(
                "[class=\"x\"].svelte-h,[class~=\"x\"].svelte-h /* (unu",
                "sed) [class~=\"y\"]*/{color:red}",
            ),
        ),
        (
            "<input TYPE=\"BUTTON\"/>",
            "[TYPE=\"button\"]{color:red}",
            "[TYPE=\"button\"].svelte-h{color:red}",
        ),
        (
            "<p class={false}></p>",
            ".false{color:red}",
            ".false.svelte-h{color:red}",
        ),
        (
            "<p class={true ? \"x\" : \"y\"}></p>",
            ".x,.y{color:red}",
            ".x.svelte-h,.y.svelte-h{color:red}",
        ),
    ] {
        assert_eq!(scope_rules(markup, input), expected, "{markup}: {input}");
    }
}

#[test]
fn external_nested_rules_and_where_specificity_match_the_oracle() {
    for (markup, input, expected) in [
        (
            "",
            ":global(.external){&:hover{color:red}&[data-x=x]{color:blue}}",
            ".external{&:hover{color:red}&[data-x=x]{color:blue}}",
        ),
        (
            "<div/>",
            ":root{&:has(.unused){color:red}}",
            "/* (empty) :root{&:has(.unused){color:red}}*/",
        ),
        (
            "<p/>",
            "p{:global .external{color:red}}",
            "p.svelte-h{& .external{color:red}}",
        ),
        (
            "<div class=a><p class=b/></div>",
            ":where(.a)>:where(.b){color:red}",
            ":where(.a.svelte-h)>:where(.b.svelte-h){color:red}",
        ),
        (
            "<div/>",
            ":global(.external){&.missing{color:red}}",
            "/* (empty) :global(.external){&.missing{color:red}}*/",
        ),
        (
            "<div class=a/>",
            ".a :global(button):not(:disabled){color:red}",
            ".a.svelte-h button:not(:disabled){color:red}",
        ),
        (
            "<p/>",
            "p{// retained text\ncolor:red}",
            "p.svelte-h{// retained text\ncolor:red}",
        ),
    ] {
        assert_eq!(scope_rules(markup, input), expected, "{input}");
    }
}

#[test]
fn class_candidates_preserve_static_dynamic_and_nested_matches() {
    for (markup, input, expected) in [
        (
            "<p class=\"a a\"/><p class=\"a\"/>",
            ".a{color:red}",
            ".a.svelte-h{color:red}",
        ),
        (
            "<p/><p class=\"other\"/>",
            ".a{color:red}",
            "/* (unused) .a{color:red}*/",
        ),
        (
            "<p class=\"a\"/><p class=\"other\"/>",
            ".a{color:red}",
            ".a.svelte-h{color:red}",
        ),
        (
            "<p class:x={false}/>",
            ".x{color:red}",
            ".x.svelte-h{color:red}",
        ),
        (
            "<p {...attrs}/><p class=\"other\"/>",
            ".x{color:red}",
            ".x.svelte-h{color:red}",
        ),
        (
            "<p class={value}/><p class=\"other\"/>",
            ".x{color:red}",
            ".x.svelte-h{color:red}",
        ),
        (
            "<p class=\"a\"/><p/>",
            ".a :global(.b){color:red}",
            ".a.svelte-h .b{color:red}",
        ),
        (
            "<div class=\"a\"><p class=\"b\"/></div>",
            ":is(.a) .b{color:red}",
            ":is(.a:where(.svelte-h)) .b.svelte-h{color:red}",
        ),
        (
            "<p class=\"a&amp;b\"/>",
            ".a\\&b{color:red}",
            ".a\\&b.svelte-h{color:red}",
        ),
        (
            "<p class=\"a\"/>",
            ".a{&.a{color:red}}",
            ".a.svelte-h{&.a{color:red}}",
        ),
    ] {
        assert_eq!(scope_rules(markup, input), expected, "{markup}: {input}");
    }
}

#[test]
fn class_candidates_scope_each_matching_element() {
    for (markup, expected) in [
        ("<p class=a/><p class=a/>", [true, true]),
        ("<p/><p class=other/>", [false, false]),
        ("<p class=a/><p class=other/>", [true, false]),
        ("<p {...attrs}/><p class=other/>", [true, false]),
        ("<p class:a={false}/><p class=other/>", [true, false]),
    ] {
        let source = format!("{markup}<style>.a{{color:red}}</style>");
        let component = rsvelte_svelte::syntax::parse::parse(&source).expect("valid component");
        let tree = compiler_syntax_tree::lower(&component, &source);
        let input = rsvelte_svelte::svelte_input(&component, &tree, &source, "test.svelte");
        let resolution = resolve::resolve(&component.javascript, component.program, &tree);
        let analysis = analyze::analyze(&input, &resolution);
        let scoped: Vec<_> = tree.elements().map(|(id, _)| analysis.scoped[id]).collect();
        assert_eq!(scoped, expected, "{markup}");
    }
}

#[test]
fn compound_classes_preserve_all_matching_elements() {
    for (markup, expected) in [
        (
            "<p class='common rare'/><p class='common rare'/>",
            &[true, true][..],
        ),
        ("<p class='common'/><p class='rare'/>", &[false, false][..]),
        (
            "<p class='common'/><p class='common rare'/>",
            &[false, true][..],
        ),
        ("<p class='common' class:rare={false}/>", &[true][..]),
        ("<p class={value}/>", &[true][..]),
        ("<p class='common' {...attrs}/>", &[true][..]),
        ("<p {...attrs} class='common'/>", &[true][..]),
    ] {
        let source = format!("{markup}<style>.common.rare{{color:red}}</style>");
        let component = rsvelte_svelte::syntax::parse::parse(&source).expect("valid component");
        let tree = compiler_syntax_tree::lower(&component, &source);
        let input = rsvelte_svelte::svelte_input(&component, &tree, &source, "test.svelte");
        let resolution = resolve::resolve(&component.javascript, component.program, &tree);
        let analysis = analyze::analyze(&input, &resolution);
        assert_eq!(
            analysis.stylesheet_used[0],
            expected.contains(&true),
            "{markup}"
        );
        let scoped: Vec<_> = tree.elements().map(|(id, _)| analysis.scoped[id]).collect();
        assert_eq!(scoped, expected, "{markup}");
    }
}

#[test]
fn class_candidate_buffers_do_not_leak_between_documents() {
    for _ in 0..3 {
        for (markup, scoped) in [
            (
                "<p class={value}/><p class={value}/><p class={value}/>",
                true,
            ),
            ("<p class='present'/><p class='present'/>", false),
            ("<Component/>", false),
            ("<Component/><p class={value}/>", true),
            ("<p class='missing'/>", true),
            ("<p class='present'/>", false),
        ] {
            let expected = if scoped {
                ".missing.svelte-h{color:red}"
            } else {
                "/* (unused) .missing{color:red}*/"
            };
            assert_eq!(
                scope_rules(markup, ".missing{color:red}"),
                expected,
                "{markup}"
            );
        }
    }
}
