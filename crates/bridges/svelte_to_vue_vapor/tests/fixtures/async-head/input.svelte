<script>
  let value = $state(1);
</script>
<svelte:head>
  <title>Async {await Promise.resolve(value)}</title>
  <meta name="description" content={await Promise.resolve(`value:${value}`)} />
</svelte:head>
<button onclick={() => value++}>change</button>
<p>{value}</p>
