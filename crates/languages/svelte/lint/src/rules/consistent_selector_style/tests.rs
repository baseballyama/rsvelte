use super::super::testing::lint;

const RULE: &str = "svelte/consistent-selector-style";

fn messages(options: &str, source: &str) -> Vec<String> {
    lint(RULE, options, source)
        .0
        .into_iter()
        .map(|report| {
            report
                .split_once(' ')
                .map_or_else(|| report.clone(), |(_, message)| message.to_owned())
        })
        .collect()
}

// Upstream skips a shorthand attribute, so `{id}` reports where `id={id}` does not.
#[test]
fn a_shorthand_id_is_read_as_its_attribute() {
    let style = "<style>#a { color: red; }</style>";
    for element in ["<div {id}></div>", "<div id={id}></div>"] {
        let source = format!("<script>let {{ id }} = $props();</script>{element}{style}");
        assert_eq!(messages("[]", &source), Vec::<String>::new(), "{element}");
    }
}

// Upstream reads `from` and `50%` as element types.
#[test]
fn a_keyframe_selector_selects_no_element() {
    let source =
        "<div></div><style>@keyframes a { from { color: red; } 50% { color: blue; } }</style>";
    assert_eq!(
        messages("[{\"style\":[\"class\"]}]", source),
        Vec::<String>::new()
    );
}

// Upstream counts an each block's `{:else}` branch as rendered any number of times.
#[test]
fn an_each_else_branch_renders_at_most_once() {
    let source = "<script>let xs = [];</script>{#each xs as x}<p></p>{:else}<div class=\"a\"></div>{/each}<style>.a { color: red; }</style>";
    assert_eq!(
        messages("[{\"style\":[\"id\",\"class\"]}]", source),
        ["Selector should select by ID instead of class"]
    );
}
