<script>
  let json = $state('{"a":1}');
  let title = $state("t");
</script>

<svelte:head>
  <title>{title}</title>
  {@html `<script type="application/ld+json">${json}<` + "/script>"}
  {@html '<meta name="raw" content="1" />'}
  <meta name="a" content={`${title}-${json.length}`} />
</svelte:head>

<b>{title}</b>
