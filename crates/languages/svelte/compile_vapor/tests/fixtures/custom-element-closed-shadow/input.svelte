<svelte:options customElement={{ tag: 'vapor-closed-shadow', shadow: { mode: 'closed', clonable: true } }} />
<script>
  import { onMount } from 'svelte';
  let count = $state(0);
  let content;
  onMount(() => {
    const host = $host();
    host.setAttribute('data-shadow', String(host.shadowRoot));
    host.setAttribute('data-mode', content.getRootNode().mode);
    host.setAttribute('data-clonable', String(content.getRootNode().clonable));
    count++;
    return () => host.setAttribute('data-disposed', 'yes');
  });
  $effect(() => $host().setAttribute('data-count', String(count)));
</script>
<p bind:this={content}>{count}</p>
