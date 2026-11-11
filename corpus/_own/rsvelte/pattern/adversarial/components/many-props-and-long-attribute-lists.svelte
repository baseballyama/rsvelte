<script>
  import Self from "./many-props-and-long-attribute-lists.svelte";

  let { depth = 0, ...rest } = $props();

  let value = $state(1);
</script>

{#if depth === 0}
  <Self
    depth={1}
    p01={1}
    p02="2"
    p03={value}
    p04={[1]}
    p05={{ a: 1 }}
    p06={() => 1}
    p07={null}
    p08={undefined}
    p09
    p10="{value}-{value}"
    p11={`t${value}`}
    p12={value > 0 ? 1 : 2}
    p13={value ?? 0}
    p14={-value}
    p15={!value}
    p16={typeof value}
    p17={[...[1]]}
    p18={{ ...{ a: 1 } }}
    p19={Math.max(value, 1)}
    p20={value + 1}
  />
  <div
    id="a"
    class="b"
    title="c"
    lang="en"
    dir="ltr"
    hidden={false}
    tabindex="0"
    role="note"
    data-a="1"
    data-b="2"
    data-c="3"
    data-d="4"
    data-e="5"
    data-f="6"
    data-g="7"
    data-h="8"
    data-i="9"
    data-j={value}
    style="color: red"
    aria-label="d"
  >
    a
  </div>
{:else}
  <b>{Object.keys(rest).length}</b>
{/if}
