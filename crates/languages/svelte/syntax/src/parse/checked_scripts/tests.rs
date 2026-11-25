use super::scripts_checked_as_typescript;

/// Each component, which Svelte's parser rejects, and whether svelte-check 4.7.8 reads it as
/// TypeScript: an import of it reports TS2306 when it does, and TS7016 when it does not.
const CELLS: [(&str, bool); 13] = [
    (
        r#"<div title="<script lang='ts'>"></div>
<script>
	let { v } = $props();
</script>

{v +}
"#,
        false,
    ),
    (
        r#"{@html '<script lang="ts"></script>'}
<script>
	let { v } = $props();
</script>

{v +}
"#,
        false,
    ),
    (
        r#"{"<script lang='ts'>"}
<script>
	let { v } = $props();
</script>

{v +}
"#,
        false,
    ),
    (
        r#"<style>/* <script lang="ts"> */</style>
<script>
	let { v } = $props();
</script>

{v +}
"#,
        false,
    ),
    (
        r#"<div><script lang="ts"></script></div>
<script>
	let { v } = $props();
</script>

{v +}
"#,
        false,
    ),
    (
        r#"{#if true}<script lang="ts"></script>{/if}
<script>
	let { v } = $props();
</script>

{v +}
"#,
        false,
    ),
    (
        r#"<script generics="T extends Array<string>" lang="ts">
	let { v }: { v: T } = $props();
</script>

{v +}
"#,
        true,
    ),
    (
        r#"<script lang = "ts">
	let { v }: { v: number } = $props();
</script>

{v +}
"#,
        true,
    ),
    (
        r#"<script lang=ts>
	let v: number = 1;
</script>
<SCRIPT context="module" lang="ts"></SCRIPT>
{v +}
"#,
        true,
    ),
    (
        r#"<script type="text/html" lang="ts"><div></div></script>
<script>
	let v = 1;
</script>
{v +}
"#,
        true,
    ),
    (
        r#"<div a={"<script lang=\"ts\">"}></div>
<script>let v = 1;</script>
{v +}
"#,
        false,
    ),
    (
        r#"<script module>let a = 1;</script>
<script lang="ts" context="module">let b: number = 1;</script>
<script>let v = 1;</script>
{v +}
"#,
        false,
    ),
    (
        r#"<script /* x */ lang="ts">let v: number = 1;</script>
{v +}
"#,
        true,
    ),
];

#[test]
fn svelte_check_reads_the_language_off_the_root_script_elements() {
    for (source, typescript) in CELLS {
        assert_eq!(
            scripts_checked_as_typescript(source),
            typescript,
            "{source:?}"
        );
    }
}
