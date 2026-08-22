<svelte:options runes={false} />

<script>
  import Self from "./legacy-slot-let-patterns.svelte";

  export let depth = 0;

  const row = { id: 1, meta: { tag: "a" }, pair: [1, 2] };
</script>

{#if depth === 0}
  <Self depth={1}>
    <span slot="plain" let:value>{value}</span>
    <span slot="object" let:row={{ id, meta: { tag } }}>{id}{tag}</span>
    <span slot="array" let:pair={[first, second]}>{first}{second}</span>
    <span slot="default" let:value={renamed}>{renamed}</span>
  </Self>
{:else}
  <slot name="plain" value={row.id} />
  <slot name="object" {row} />
  <slot name="array" pair={row.pair} />
  <slot value={row.id} />
{/if}
