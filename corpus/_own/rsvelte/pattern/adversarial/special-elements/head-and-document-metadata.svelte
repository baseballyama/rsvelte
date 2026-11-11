<script>
  let title = $state("t");
  const links = [{ rel: "icon", href: "/a.png" }];
</script>

<svelte:head>
  <title>{title} — suffix</title>
  {#each links as link (link.href)}
    <link rel={link.rel} href={link.href} />
  {/each}
  {#if title}
    <meta property="og:title" content={title} />
  {:else}
    <meta property="og:title" content="fallback" />
  {/if}
  {#key title}
    <meta name="k" content={title} />
  {/key}
  {@html "<meta name='raw' content='x' />"}
  <style>
    body {
      margin: 0;
    }
  </style>
</svelte:head>

<b>{title}</b>
