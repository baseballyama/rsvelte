use rsvelte_svelte_parser::parse::{MAX_NESTING, parse};

/// The error parsing `source_text` on a thread with a worker's 2 MiB stack, if any.
fn error_on_a_small_stack(source_text: String) -> Option<String> {
    std::thread::Builder::new()
        .stack_size(2 << 20)
        .spawn(move || parse(&source_text).err().map(|e| e.message))
        .expect("spawns")
        .join()
        .expect("does not overflow")
}

#[test]
fn markup_nests_as_deep_as_the_limit() {
    let r = |s: &str| s.repeat(20_000);
    for source_text in [
        format!("{}x{}", r("<div>"), r("</div>")),
        format!("{}x{}", r("{#if a}"), r("{/if}")),
        format!("{}{{b}}{}", r("{#each a as b}"), r("{/each}")),
        format!("{}x{}", r("{#snippet s()}"), r("{/snippet}")),
        format!("{{#if a}}x{}{{/if}}", r("{:else if a}x")),
    ] {
        assert_eq!(error_on_a_small_stack(source_text), None);
    }
    let deep = "<div>".repeat(MAX_NESTING as usize + 1);
    let message = error_on_a_small_stack(deep).expect("too deep");
    assert!(message.contains("nest too deeply"), "{message}");
}
