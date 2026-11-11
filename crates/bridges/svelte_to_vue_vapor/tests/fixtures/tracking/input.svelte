<script>
  let count = $state(0);
  let clicked = $state(false);
  let element = $state();
  const derived = $derived(count + Number($effect.tracking()));
  const derivedBy = $derived.by(() => count + Number($effect.tracking()));
  const setup = $effect.tracking();
  $effect(() => {
    if (element) element.setAttribute('data-tracking', String($effect.tracking()));
  });
</script>
<button onclick={() => { clicked = $effect.tracking(); count++; }}>{count}</button>
<p>{setup}:{clicked}:{$effect.tracking()}</p>
<span>{derived}:{derivedBy}</span>
<output bind:this={element}>effect</output>
{#snippet trackingDefault(value = 7)}<footer>{value}</footer>{/snippet}
{@render trackingDefault()}
