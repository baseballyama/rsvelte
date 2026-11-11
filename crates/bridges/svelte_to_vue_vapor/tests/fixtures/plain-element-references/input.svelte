<script>
  let node;
  const object = {};
  let visible = $state(true);
  let tag = $state('p');
  let sampled = $state('');
  let count = 0;
  function sample() {
    sampled = JSON.stringify([node?.localName ?? null, node?.isConnected ?? null,
      object.node?.localName ?? null, object.node?.isConnected ?? null, count]);
  }
</script>
<button onclick={sample}>sample</button>
<button onclick={() => visible = !visible}>toggle</button>
<button onclick={() => tag = tag === 'p' ? 'section' : 'p'}>tag</button>
<button onclick={() => count++}>count</button>
{#if visible}
  <svelte:element this={tag} bind:this={node}>dynamic</svelte:element>
  <i bind:this={object.node}>member</i>
{/if}
<output>{sampled}</output>
