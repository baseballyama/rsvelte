//! Destructuring assignments in a script, which upstream writes one path at a time.

use rsvelte_svelte_compile::Target;

use super::squashed;

#[test]
fn a_pattern_default_that_awaits_is_awaited_as_upstream_awaits_it() {
    for (assignment, client) in [
        (
            "({ c = await Promise.resolve(3) } = {});",
            "$.set(c,await$.fallback($$value.c,()=>Promise.resolve(3),true),true);",
        ),
        (
            "({ c = false || await Promise.resolve(6) } = {});",
            "await$.fallback($$value.c,async()=>false||awaitPromise.resolve(6),true),true);",
        ),
        (
            "({ c = await o } = {});",
            "$.set(c,await$.fallback($$value.c,o),true);",
        ),
        (
            "({ c = (await o)() } = {});",
            "$.set(c,await$.fallback($$value.c,async()=>(awaito)(),true),true);",
        ),
    ] {
        let source = format!(
            "<script>let c = $state(0); let o; async function f() {{ {assignment} }}</script>{{c}}"
        );
        let compiled = squashed(&source, Target::Client);
        assert!(compiled.contains(client), "{source}: {compiled}");
        let server = squashed(&source, Target::Server);
        assert!(
            server.contains(&assignment.replace(' ', "")),
            "{source}: {server}"
        );
    }
}
