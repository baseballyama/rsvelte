<script>
  let p = Promise.resolve(1);
</script>

<svelte:head>
  <window>inside svelte:head</window>
</svelte:head>
{#await p}
  <element>pending</element>
{:then v}
  <options>{v}</options>
{:catch e}
  <document>{e}</document>
{/await}
{#key p}
  <body>keyed</body>
{/key}
