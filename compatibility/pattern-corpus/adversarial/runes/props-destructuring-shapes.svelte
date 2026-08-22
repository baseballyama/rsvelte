<script>
  import Self from "./props-destructuring-shapes.svelte";

  let {
    depth = 0,
    plain,
    renamed: localName = "r",
    withDefault = 1,
    defaultFromEarlier = withDefault + 1,
    "quoted-key": quoted = "q",
    fn = () => 0,
    ...rest
  } = $props();
</script>

{#if depth === 0}
  <Self
    depth={1}
    plain="p"
    renamed="r2"
    withDefault={2}
    quoted-key="q2"
    extraOne={1}
    extraTwo={2}
  />
  <Self depth={1} />
{:else}
  <b>{plain}{localName}{withDefault}{defaultFromEarlier}</b>
  <b>{quoted}{fn()}</b>
  <b>{Object.keys(rest).length}</b>
{/if}
