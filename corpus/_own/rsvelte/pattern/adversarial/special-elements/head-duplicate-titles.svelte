<script>
  let flag = $state(true);
  let title = $state("t");
</script>

<svelte:head>
  {#if flag}
    <title>{title} — a</title>
  {:else}
    <title>{title} — b</title>
  {/if}
  <meta name="a" content="1" />
  <meta name="a" content="2" />
  <link rel="stylesheet" href="/a.css" />
  <link rel="stylesheet" href="/b.css" />
</svelte:head>

<title>not in head</title>

<b>{title}{flag}</b>
