<script>
  let tag = $state('svg');
  let element = $state();
  let namespace = $state('');
  $effect(() => { namespace = element?.namespaceURI ?? ''; });
</script>
<svelte:element this={tag} bind:this={element} class="dynamic"></svelte:element>
<button class="html" onclick={() => tag = 'p'}>html</button>
<button class="svg" onclick={() => tag = 'svg'}>svg</button>
<button class="remove" onclick={() => tag = null}>remove</button>
<p>{namespace}</p>
