<script>
  let title = $state("t");
  let description = $state("d");
  let rows = $state([1, 2]);
</script>

<svelte:head>
  <title>{title} — suffix</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={`og ${title}`} />
  <link rel="canonical" href="https://example.com/{title}" />
  <link rel="preload" as="font" href="/f.woff2" crossorigin="anonymous" />
  {#each rows as row}
    <meta name="row-{row}" content={String(row)} />
  {/each}
  {#if description}
    <meta name="present" content="yes" />
  {/if}
  <style>
    body {
      margin: 0;
    }
  </style>
</svelte:head>

<b>{title}{description}</b>
