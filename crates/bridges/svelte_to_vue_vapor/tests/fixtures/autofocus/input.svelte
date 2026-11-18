<script>
  let shown = $state(true);
  let enabled = $state(false);
  let focused = $state('none');
  let count = $state(0);
</script>
<button id="show" onclick={() => shown = !shown}>toggle first</button>
<button id="enable" onclick={() => enabled = !enabled}>toggle second</button>
{#if shown}
  <input autofocus onfocus={() => { focused = 'first'; count++; }} />
{/if}
<input autofocus={enabled} onfocus={() => { focused = 'second'; count++; }} />
<p>{focused}:{count}:{enabled}</p>
