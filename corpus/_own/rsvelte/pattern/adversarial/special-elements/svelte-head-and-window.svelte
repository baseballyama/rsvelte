<script>
  let title = $state("t");
  let width = $state(0);
  let scrollY = $state(0);
  let online = $state(true);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
  {#if title}
    <link rel="canonical" href="/{title}" />
  {/if}
</svelte:head>

<svelte:window bind:innerWidth={width} bind:scrollY bind:online />
<svelte:document onvisibilitychange={() => (title = "v")} />
<svelte:body onmouseenter={() => (title = "m")} />

<b>{width}{scrollY}{online}</b>
