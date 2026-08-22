<script>
  import Self from "./props-id-and-bindable-defaults.svelte";

  let {
    depth = 0,
    plain = $bindable(),
    withDefault = $bindable(1),
    fromExpression = $bindable([1, 2].length),
  } = $props();

  const uid = $props.id();

  let a = $state(0);
  let b = $state(0);
</script>

{#if depth === 0}
  <Self depth={1} bind:plain={a} bind:withDefault={b} />
  <Self depth={1} />
  <b>{a}{b}{uid}</b>
{:else}
  <button onclick={() => (plain = (plain ?? 0) + 1)}>{plain}</button>
  <button onclick={() => (withDefault += 1)}>{withDefault}</button>
  <b>{fromExpression}{uid}</b>
{/if}
