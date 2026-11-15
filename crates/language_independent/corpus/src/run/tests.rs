use super::stale_entries;

#[test]
fn a_stale_entry_fails_with_the_regen_command_that_removes_it() {
    assert_eq!(stale_entries(&mut []), Ok(()));
    let message = stale_entries(&mut [
        ("svelte/t/a.svelte".to_owned(), "svelte.compile/server"),
        (
            "svelte/s/[slug]/+page.svelte".to_owned(),
            "svelte.lint/default",
        ),
    ])
    .expect_err("two stale entries");
    assert_eq!(
        message,
        "2 expected entries belong to units that units.toml skips; remove them with:\n  mise \
         exec -- node tools/oracle/oracle.ts regen --task svelte.lint --path \
         'svelte/s/[slug]/+page.svelte'\n  mise exec -- node tools/oracle/oracle.ts regen --task \
         svelte.compile --path 'svelte/t/a.svelte'"
    );
}
