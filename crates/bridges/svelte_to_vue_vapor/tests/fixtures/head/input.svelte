<script>let title = $state('first');</script>
<svelte:head><title>{title}</title><meta name="description" content={title} /></svelte:head>
<p>{title}</p>
<button onclick={() => title = 'second'}>change</button>
